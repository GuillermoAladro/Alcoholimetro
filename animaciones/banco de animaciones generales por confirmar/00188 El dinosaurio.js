"use strict";
/*
 * 00188 · EL DINOSAURIO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En un claro de la selva, Guillermo y Marcos están con sus jarras cuando retumba el suelo (¡BUM!, ¡BUM!): entra un
 * dinosaurio de dibujos (turquesa, regordete, con crestas coral) y ruge. ¡CORRE! Huyen hacia la izquierda con el bicho
 * detrás, vuelven a cruzar de lado a lado y se paran agotados… y el dinosaurio, con ojos de pena, les enseña su jarra
 * vacía: «¿UNA CAÑA?». Guillermo se la llena y brindan los tres (¡CHIN!). Fundido a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.35;
const XG = 395, XM = 580;
const T_BUM1 = 0.75, T_BUM2 = 1.25, T_RUGE = 2.05, T_HUYEN = 2.7;
const T_VUELVEN = 4.6, T_PARAN = 6.05, T_PIDE = 6.75, T_ALIVIO = 7.45, T_ECHA = 7.75, T_CHIN = 8.65;
const DXF = 400;                 // dónde se queda el dinosaurio al final (mirando a la derecha)
const PB = [505, 325];          // punto del brindis

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(640, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fff3b0"); gr.addColorStop(0.45, "#ffb020"); gr.addColorStop(1, "#ff4a1a");
  txt(g, "¡CORRE!", 326, 166, { tam: 150, peso: 900, fam: FD, color: "#2a0a00", esp: 6 });
  txt(g, "¡CORRE!", 320, 158, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#2a0a00", bordeAncho: 12, esp: 6, glow: "rgba(255,150,40,.85)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

// ------------------------------------------------------------------------------------------- el dinosaurio
/** Degradados del dinosaurio (en sus coordenadas locales; se crean una vez). */
let GRD = null;
function grDino(g) {
  if (GRD) return GRD;
  const cu = g.createRadialGradient(-20, -270, 20, 0, -210, 170);
  cu.addColorStop(0, "#5ff0d6"); cu.addColorStop(0.6, "#1fb5a0"); cu.addColorStop(1, "#0b6e62");
  const ca = g.createRadialGradient(30, -420, 10, 50, -380, 120);
  ca.addColorStop(0, "#6ff4dc"); ca.addColorStop(0.7, "#1fb5a0"); ca.addColorStop(1, "#0d7a6c");
  const ba = g.createLinearGradient(0, -300, 0, -110);
  ba.addColorStop(0, "#fff6d2"); ba.addColorStop(1, "#f2d690");
  GRD = { cu, ca, ba };
  return GRD;
}
const TEAL = "#1fb5a0", TEAL_O = "#0b6e62", CORAL = "#ff7a5c";
/** Jarra pequeña (la del dinosaurio) con el asa en (0,0). */
function jarrita(g, x, y, nivel, t, inc = 0) {
  g.save(); g.translate(x, y); g.rotate(inc); g.scale(1.25, 1.25);
  dibujarJarra(g, [0, 0], 0, nivel, "asa", t);
  dibujarJarra(g, [0, 0], 0, nivel, "cuerpo", t);
  g.restore();
}
/**
 * D: { x, y, s, dir (1 mira a la derecha), fase (andar), anda (0–1), boca (0–1), cabeza (rad), ojos: "normal" |
 * "furia" | "pena" | "feliz", mano (punto local o null), jarra (nivel o null), cola (meneo 0–1) }
 */
function dino(g, D, t) {
  g.save(); g.translate(D.x, D.y); g.scale(D.s * D.dir, D.s);
  const G = grDino(g);
  const f = D.fase, a = D.anda;
  const bote = -Math.abs(Math.sin(f)) * 14 * a;
  g.lineJoin = "round"; g.lineCap = "round";
  // pierna de atrás
  pata(g, -40 + Math.sin(f) * 34 * a, Math.min(0, -Math.sin(f)) * 30 * a, TEAL_O, bote);
  // cola
  const w = Math.sin(t * (D.cola > 0.5 ? 14 : 4)) * (0.06 + 0.12 * D.cola) + Math.sin(f) * 0.05 * a;
  g.save(); g.translate(-70, -205 + bote); g.rotate(w);
  g.fillStyle = TEAL;
  g.beginPath(); g.moveTo(10, -60); g.quadraticCurveTo(-120, -40, -235, 70); g.quadraticCurveTo(-110, 20, 20, 45); g.closePath(); g.fill();
  g.strokeStyle = TEAL_O; g.lineWidth = 3; g.stroke();
  // crestas de la cola
  g.fillStyle = CORAL;
  for (let i = 0; i < 4; i++) { const u = 0.15 + i * 0.2, x = lerp(-10, -200, u), y = lerp(-58, 52, u * u) - 4; cresta(g, x, y, 22 - i * 4, -0.6 - u * 0.4); }
  g.restore();
  g.translate(0, bote);
  // cuerpo
  g.fillStyle = G.cu;
  g.beginPath(); g.ellipse(0, -210, 125, 112, -0.28, 0, 6.283); g.fill();
  g.strokeStyle = TEAL_O; g.lineWidth = 3; g.stroke();
  // crestas de la espalda
  g.fillStyle = CORAL;
  for (let i = 0; i < 5; i++) { const an = -2.55 + i * 0.32, x = Math.cos(an) * 122, y = -210 + Math.sin(an) * 108; cresta(g, x * Math.cos(-0.28) - (y + 210) * Math.sin(-0.28), -210 + x * Math.sin(-0.28) + (y + 210) * Math.cos(-0.28), 30 - Math.abs(i - 2) * 3, an + Math.PI / 2 - 0.28); }
  // barriga
  g.fillStyle = G.ba;
  g.beginPath(); g.ellipse(42, -196, 66, 92, -0.32, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(200,160,80,.5)"; g.lineWidth = 2;
  for (let i = 0; i < 5; i++) { const y = -265 + i * 30; g.beginPath(); g.moveTo(10 + i * 4, y); g.quadraticCurveTo(48 + i * 4, y + 8, 88 - i * 3, y - 6); g.stroke(); }
  // pecas
  g.fillStyle = "rgba(255,255,255,.22)";
  for (const [x, y, r] of [[-60, -250, 9], [-80, -200, 6], [-40, -290, 6], [-95, -240, 5]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  // pierna de delante
  pata(g, 45 - Math.sin(f) * 34 * a, Math.min(0, Math.sin(f)) * 30 * a, TEAL, 0);
  // cabeza (sobre el cuello)
  g.save(); g.translate(62, -300); g.rotate(D.cabeza);
  cabeza(g, D, G, t);
  g.restore();
  // bracito (al final se pinta aparte, por delante de los dos)
  if (!D.brazoAparte) brazo(g, D, t);
  g.restore();
}
function brazoDelante(g, D, t) {
  g.save(); g.translate(D.x, D.y); g.scale(D.s * D.dir, D.s);
  g.lineJoin = "round"; g.lineCap = "round";
  brazo(g, D, t);
  g.restore();
}
function cresta(g, x, y, r, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(-r * 0.7, 4); g.quadraticCurveTo(-r * 0.5, -r * 1.1, 0, -r * 1.2); g.quadraticCurveTo(r * 0.5, -r * 1.1, r * 0.7, 4); g.closePath(); g.fill();
  g.restore();
}
function pata(g, dx, dy, col, bote) {
  g.save(); g.translate(dx, dy);
  g.fillStyle = col;
  g.beginPath(); g.ellipse(0, -120 + bote, 46, 62, 0, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(-28, -110 + bote); g.lineTo(28, -110 + bote); g.lineTo(26, -14); g.lineTo(-24, -14); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(12, -12, 50, 17, 0, 0, 6.283); g.fill();
  g.strokeStyle = TEAL_O; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = "#fff8e6";
  for (const x of [34, 50, 60]) { g.beginPath(); g.ellipse(x, -9, 7, 6, 0, 0, 6.283); g.fill(); }
  g.restore();
}
function cabeza(g, D, G, t) {
  const b = D.boca;
  // mandíbula (detrás) y boca abierta
  const ab = b * 0.62;
  g.save(); g.rotate(ab);
  g.fillStyle = TEAL;
  g.beginPath(); g.moveTo(-6, -30); g.quadraticCurveTo(70, -6, 138, -30); g.quadraticCurveTo(150, -10, 132, 6); g.quadraticCurveTo(60, 22, -6, 0); g.closePath(); g.fill();
  g.strokeStyle = TEAL_O; g.lineWidth = 3; g.stroke();
  g.fillStyle = "#fff6d2"; g.beginPath(); g.moveTo(10, 4); g.quadraticCurveTo(70, 18, 128, 4); g.quadraticCurveTo(70, 10, 10, -2); g.fill();
  if (b > 0.05) {
    g.fillStyle = "#ff7a9a"; g.beginPath(); g.ellipse(70, -26, 46, 8, 0.05, 0, 6.283); g.fill();
    g.fillStyle = "#fffdf5";
    for (let i = 0; i < 5; i++) { const x = 30 + i * 22; g.beginPath(); g.moveTo(x - 6, -27 + i * 0.2); g.lineTo(x, -40); g.lineTo(x + 6, -27); g.closePath(); g.fill(); }
  }
  g.restore();
  if (b > 0.05) {
    // interior de la boca
    g.fillStyle = "#6a1028";
    g.beginPath(); g.moveTo(-4, -32);
    g.lineTo(140, -34);
    const p = rot2([138, -30], ab), q = rot2([-6, -30], ab);
    g.lineTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.closePath(); g.fill();
  }
  // cabeza de arriba
  g.fillStyle = G.ca;
  g.beginPath();
  g.moveTo(-30, -20); g.bezierCurveTo(-40, -110, 60, -150, 110, -110); g.bezierCurveTo(150, -82, 168, -60, 160, -38);
  g.quadraticCurveTo(150, -28, 140, -32); g.lineTo(-4, -32); g.quadraticCurveTo(-24, -28, -30, -20); g.closePath(); g.fill();
  g.strokeStyle = TEAL_O; g.lineWidth = 3; g.stroke();
  // dientes de arriba (redondeados)
  if (b > 0.05) {
    g.fillStyle = "#fffdf5";
    for (let i = 0; i < 6; i++) { const x = 18 + i * 21; g.beginPath(); g.moveTo(x - 6, -33); g.lineTo(x, -21); g.lineTo(x + 6, -33); g.closePath(); g.fill(); }
  } else {
    g.strokeStyle = TEAL_O; g.lineWidth = 3; g.beginPath(); g.moveTo(10, -33); g.quadraticCurveTo(80, -24, 145, -36); g.stroke();
  }
  // nariz y moflete
  g.fillStyle = TEAL_O; g.beginPath(); g.ellipse(148, -62, 5, 3.5, 0.4, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,120,140,.35)"; g.beginPath(); g.ellipse(70, -52, 16, 9, 0, 0, 6.283); g.fill();
  // crestas de la cabeza
  g.fillStyle = CORAL; cresta(g, 10, -96, 18, -0.9); cresta(g, 36, -120, 22, -0.5); cresta(g, 66, -132, 20, -0.15);
  // ojos
  for (const [ex, ey, r, sd] of [[54, -92, 21, -1], [96, -86, 19, 1]]) ojo(g, ex, ey, r, D.ojos, t, sd);
}
function ojo(g, x, y, r, modo, t, sd) {
  if (modo === "feliz") {
    g.strokeStyle = "#13302c"; g.lineWidth = 5;
    g.beginPath(); g.arc(x, y + 6, r * 0.7, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    return;
  }
  g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, y, r, r * 1.12, 0, 0, 6.283); g.fill();
  g.strokeStyle = TEAL_O; g.lineWidth = 2.5; g.stroke();
  const pena = modo === "pena", furia = modo === "furia";
  const pr = pena ? r * 0.68 : furia ? r * 0.36 : r * 0.48;
  const px = x + (pena ? 2 : 6), py = y + (pena ? 4 : 3);
  g.fillStyle = "#13302c"; g.beginPath(); g.arc(px, py, pr, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.32, 0, 6.283); g.fill();
  if (pena) { g.beginPath(); g.arc(px + pr * 0.35, py + pr * 0.3, pr * 0.14, 0, 6.283); g.fill(); }
  // ceja
  g.strokeStyle = "#0a4a42"; g.lineWidth = 7;
  g.beginPath();
  if (furia) { g.moveTo(x + sd * r, y - r * 1.3); g.lineTo(x - sd * r, y - r * 0.6); }
  else if (pena) { g.moveTo(x + sd * r, y - r * 0.95); g.lineTo(x - sd * r * 0.9, y - r * 1.55); }
  else { g.moveTo(x - r * 0.8, y - r * 1.4); g.quadraticCurveTo(x, y - r * 1.7, x + r * 0.8, y - r * 1.4); }
  g.stroke();
}
function brazo(g, D, t) {
  const S = [72, -245];
  const T = D.mano || [118, -205];
  const k = ik(S, T, 52, 48, -1);
  const H = [k.E[0] + Math.cos(k.a2) * 48, k.E[1] + Math.sin(k.a2) * 48];
  g.strokeStyle = TEAL_O; g.lineWidth = 30;
  g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(k.E[0], k.E[1]); g.lineTo(H[0], H[1]); g.stroke();
  g.strokeStyle = TEAL; g.lineWidth = 24;
  g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(k.E[0], k.E[1]); g.lineTo(H[0], H[1]); g.stroke();
  if (D.jarra != null) jarrita(g, H[0] - 4, H[1] - 2, D.jarra, t, D.incJarra || 0);
  // garritas
  g.fillStyle = "#fff8e6";
  for (let i = -1; i <= 1; i++) { const a = k.a2 + i * 0.5; g.beginPath(); g.arc(H[0] + Math.cos(a) * 14, H[1] + Math.sin(a) * 14, 5, 0, 6.283); g.fill(); }
  g.fillStyle = TEAL; g.beginPath(); g.arc(H[0], H[1], 14, 0, 6.283); g.fill();
}

class ElDinosaurio extends Escena {
  constructor() {
    super(10.6);
    this.p = new Parts(420);
    this.p.suelo = () => PIES + 6;
    this.fondoC = null; this.chorro = 0;
  }
  // ------------------------------------------------------------------ posiciones
  xs() {
    const t = this.t;
    let g = XG, m = XM;
    if (t > T_HUYEN && t < T_VUELVEN) {
      m = lerp(XM, -180, eIn(tramo(t, T_HUYEN, T_HUYEN + 0.3)) * 0.12 + tramo(t, T_HUYEN, T_HUYEN + 1.05) * 0.88);
      g = lerp(XG, -180, eIn(tramo(t, T_HUYEN + 0.12, T_HUYEN + 0.4)) * 0.1 + tramo(t, T_HUYEN + 0.12, T_HUYEN + 1.35) * 0.9);
    } else if (t >= T_VUELVEN) {
      m = lerp(-160, XM, eOut(tramo(t, T_VUELVEN, T_VUELVEN + 1.15)));
      g = lerp(-200, XG, eOut(tramo(t, T_VUELVEN + 0.2, T_PARAN)));
    }
    return [g, m];
  }
  estadoDino() {
    const t = this.t;
    const D = { x: 1400, y: PIES + 4, s: 1, dir: -1, fase: 0, anda: 0, boca: 0, cabeza: 0, ojos: "furia", mano: null, jarra: null, cola: 0 };
    if (t < T_RUGE) {
      D.x = lerp(1400, 870, eOut(tramo(t, 0.9, T_RUGE - 0.1))); D.anda = t > 0.9 && t < T_RUGE - 0.1 ? 1 : 0; D.fase = t * 6;
      D.ojos = "normal";
    } else if (t < T_HUYEN + 0.1) {
      D.x = 870;
      const k = tramo(t, T_RUGE, T_RUGE + 0.15) * (1 - tramo(t, T_HUYEN - 0.1, T_HUYEN + 0.1));
      D.boca = k; D.cabeza = -0.28 * k + 0.04 * Math.sin(t * 50) * k;
    } else if (t < T_VUELVEN + 0.4) {
      const u = tramo(t, T_HUYEN + 0.15, T_VUELVEN + 0.2);
      D.x = lerp(870, -420, u); D.anda = 1; D.fase = t * 9; D.boca = 0.35 + 0.25 * Math.sin(t * 8); D.cabeza = 0.05;
    } else {
      D.dir = 1;
      const u = tramo(t, T_VUELVEN + 0.45, T_PARAN + 0.35);
      D.x = lerp(-420, DXF, eOut(u)); D.anda = u < 0.95 ? 1 : 0; D.fase = t * 9; D.boca = u < 0.9 ? 0.3 + 0.2 * Math.sin(t * 8) : 0;
      if (t > T_PARAN + 0.35) {
        D.ojos = "normal"; D.cabeza = -0.1 * eInOut(tramo(t, T_PARAN + 0.35, T_PIDE));
      }
      if (t > T_PIDE) {
        // ojos de pena y enseña su jarra vacía
        D.ojos = "pena"; D.cabeza = -0.1 + 0.04 * Math.sin(t * 3);
        D.mano = mezcla([118, -205], [80, -202], eOut(tramo(t, T_PIDE, T_PIDE + 0.3)));
        D.jarra = 0;
      }
      if (t > T_ECHA) {
        D.jarra = clamp(tramo(t, T_ECHA + 0.25, T_ECHA + 0.75), 0, 1); D.ojos = D.jarra > 0.4 ? "feliz" : "pena"; D.cola = D.jarra;
      }
      if (t > T_CHIN - 0.3) {
        const L = this.local(PB, D);
        D.mano = mezcla([80, -202], [L[0] + 6, L[1] + 16], eInOut(tramo(t, T_CHIN - 0.3, T_CHIN)));
        D.ojos = "feliz"; D.boca = 0.5; D.cola = 1;
      }
      if (t > T_CHIN + 0.6) {
        // se la bebe de un trago
        const k = eInOut(tramo(t, T_CHIN + 0.6, T_CHIN + 0.95));
        D.mano = mezcla(D.mano, [128, -372], k); D.cabeza = lerp(-0.1, -0.42, k); D.incJarra = -1.7 * k;
        D.jarra = 1 - tramo(t, T_CHIN + 0.95, T_CHIN + 1.5); D.boca = 0.3;
      }
    }
    return D;
  }
  local(q, D) { return [(q[0] - D.x) / (D.s * D.dir), (q[1] - D.y) / D.s]; }
  poses() {
    const t = this.t, [xg, xm] = this.xs();
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [76, 120], manoI: [9, 160], jarra: { inc: -0.1, nivel: 0.85 } };
    const M = { quien: "marcos", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [0, 118], brazoIDelante: true };
    let yg = PIES, ym = PIES, gg = 0, gm = 0, sg = 1, sm = 1;
    let nivelM = 0.85, incM = 0.1;
    // charlan
    if (t < T_BUM1) {
      const k = eInOut(tramo(t, 0.25, 0.7));
      G.rc = 0.1; M.rc = -0.1; G.manoD = mezcla([72, 140], [84, 100], k); M.manoI = mezcla([6, 140], [-6, 100], k); M.cara = "guino";
    }
    if (t >= T_BUM1 && t < T_HUYEN) {
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.manoD = [84, 100]; M.manoI = [-6, 100];
      G.rc = 0.18 * eOut(tramo(t, T_BUM1, T_BUM1 + 0.2)); M.rc = 0.18 * eOut(tramo(t, T_BUM1, T_BUM1 + 0.2));
      const bote = Math.max(0, 1 - (t - T_BUM1) * 5) + Math.max(0, 1 - Math.abs(t - T_BUM2) * 5) * (t > T_BUM2 ? 1 : 0);
      yg -= 8 * bote; ym -= 8 * bote;
    }
    if (t >= T_RUGE && t < T_HUYEN) {
      const k = eOut(tramo(t, T_RUGE, T_RUGE + 0.2));
      G.puntas = k; M.puntas = k; gg = -0.12 * k; gm = -0.14 * k;
      G.manoI = [-14, 70]; M.manoD = [80, 70];
      G.rc = 0.22; M.rc = 0.22;
    }
    // corren
    const corre = (t >= T_HUYEN && t < T_VUELVEN) || (t >= T_VUELVEN && t < T_PARAN);
    if (corre) {
      const a = andar(t * 22, 1.7), b = andar(t * 22 + 1.3, 1.7);
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; M.piernaI = b.piernaI; M.piernaD = b.piernaD; ym += b.bote;
      const s = Math.sin(t * 22);
      G.manoD = [80 + 10 * s, 118]; G.manoI = [-6 - 10 * s, 120 - 14 * s]; G.cara = "sorpresa"; G.puntas = 0.8;
      M.manoI = [-4 - 8 * s, 114]; M.manoD = [74 + 8 * s, 120 + 12 * s]; M.cara = "sorpresa"; M.puntas = 0.8;
      const dir = t < T_VUELVEN ? 1 : -1;
      gg = 0.08 * dir; gm = 0.1 * dir; G.rc = 0.15 * dir; M.rc = 0.15 * dir;
      G.jarra.nivel = lerp(0.85, 0.55, tramo(t, T_HUYEN, T_PARAN)); nivelM = G.jarra.nivel; G.jarra.inc = -0.2 + 0.15 * s; incM = 0.2 - 0.15 * s;
    }
    // agotados... y el dinosaurio detrás
    if (t >= T_PARAN) {
      G.jarra.nivel = 0.55; nivelM = 0.55; G.manoD = [70, 150]; M.manoI = [8, 150];
      const d = t - T_PARAN;
      const jadeo = Math.sin(d * 16) * (1 - tramo(t, T_PARAN + 0.4, T_PARAN + 0.6));
      sg = 1 - 0.04 * Math.abs(jadeo); sm = sg;
      G.cara = "borracho"; M.cara = "borracho"; G.puntas = 0; M.puntas = 0;
      if (t > T_PARAN + 0.45) {
        // notan la sombra: se encogen
        const k = eOut(tramo(t, T_PARAN + 0.45, T_PARAN + 0.65)) * (1 - eInOut(tramo(t, T_ALIVIO - 0.1, T_ALIVIO + 0.15)));
        sg = 1 - 0.1 * k; sm = 1 - 0.1 * k;
        G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = -0.18 * k; M.rc = 0.2 * k; G.puntas = k; M.puntas = k;
        G.manoI = mezcla([9, 160], [-10, 80], k); M.manoD = mezcla([67, 152], [82, 84], k);
        yg -= 4 * k * Math.abs(Math.sin(t * 30)); ym -= 4 * k * Math.abs(Math.sin(t * 30 + 1));
      }
      if (t > T_PIDE + 0.15) { G.cara = "sorpresa"; M.cara = "sorpresa"; }
      if (t > T_ALIVIO) {
        // se miran, aliviados
        const k = eInOut(tramo(t, T_ALIVIO, T_ALIVIO + 0.2));
        G.cara = "risa"; M.cara = "risa"; G.rc = 0.16 * k; M.rc = -0.16 * k; G.puntas = 0; M.puntas = 0;
        G.manoI = [9, 160]; M.manoD = [67, 152];
      }
    }
    const mG = matAv(xg, yg, ESC, gg, 1, sg), mM = matAv(xm, ym, ESC, gm, 1, sm);
    // Guillermo le llena la jarra al dinosaurio
    if (t > T_ECHA - 0.25 && t < T_CHIN - 0.3) {
      const D = this.estadoDino(), H = this.manoDino(D);
      const k = eInOut(tramo(t, T_ECHA - 0.25, T_ECHA)), kV = eInOut(tramo(t, T_CHIN - 0.6, T_CHIN - 0.3));
      const enc = enAv(mG, [H[0] - 18, H[1] - 62]);
      G.manoD = mezcla(mezcla([70, 150], enc, k), [70, 150], kV);
      G.jarra.inc = lerp(-0.1, 1.15, k * (1 - kV));
      G.jarra.nivel = lerp(0.55, 0.32, tramo(t, T_ECHA + 0.2, T_ECHA + 0.75));
      G.cara = "guino"; G.rc = 0.1;
      this.chorro = k > 0.95 && t < T_ECHA + 0.8 ? 1 : 0;
    } else this.chorro = 0;
    if (t >= T_CHIN - 0.3) G.jarra.nivel = 0.32;
    // brindis
    if (t > T_CHIN - 0.3) {
      const k = eInOut(tramo(t, T_CHIN - 0.3, T_CHIN));
      const choca = Math.max(0, 1 - Math.abs(t - T_CHIN) * 6);
      G.manoD = mezcla(G.manoD, enAv(mG, [PB[0] - 46 + 6 * choca, PB[1] + 4]), k); G.jarra.inc = -0.25 * k;
      M.manoI = mezcla(M.manoI, enAv(mM, [PB[0] + 38 - 6 * choca, PB[1] + 10]), k); incM = 0.25 * k;
      G.cara = "risa"; M.cara = "risa"; G.rc = 0.05; M.rc = -0.05;
      if (t > T_CHIN + 0.25) { G.cara = "guino"; }
      if (t > T_CHIN + 0.6) { G.cara = "risa"; M.cara = "sorpresa"; M.rc = -0.18; G.rc = -0.18; }
      if (t > T_CHIN + 1.2) { M.cara = "risa"; G.cara = "risa"; }
    }
    M.objI = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], incM, nivelM, "asa", t); g.restore(); };
    M.objI2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], incM, nivelM, "cuerpo", t); g.restore(); };
    return { G, M, mG, mM };
  }
  manoDino(D) {
    const T = D.mano || [118, -205];
    const k = ik([72, -245], T, 52, 48, -1);
    const H = [k.E[0] + Math.cos(k.a2) * 48, k.E[1] + Math.sin(k.a2) * 48];
    return [D.x + H[0] * D.s * D.dir, D.y + H[1] * D.s];
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const bum = (k, x) => this.una(k, true, () => {
      temblar(9, 0.25);
      for (let i = 0; i < 8; i++) p.nueva(P.POLVO, x + azar(-60, 60), PIES, azar(-100, 100), azar(-40, -5), azar(0.6, 1), azar(24, 40));
      for (let i = 0; i < 6; i++) p.nueva(P.CONFETI, azar(0, W), azar(-20, 40), azar(-30, 30), azar(20, 80), azar(1, 1.6), azar(10, 16), 0);
    });
    if (t > T_BUM1) bum("b1", 980);
    if (t > T_BUM2) bum("b2", 980);
    this.una("ruge", t > T_RUGE, () => {
      temblar(20, 0.6);
      for (let i = 0; i < 26; i++) p.nueva(P.CONFETI, azar(200, 760), azar(-20, 200), azar(-420, -160), azar(-60, 60), azar(1.2, 2), azar(10, 18), 0);
      for (let i = 0; i < 12; i++) p.nueva(P.POLVO, azar(500, 900), PIES, azar(-300, -60), azar(-60, -5), azar(0.6, 1.1), azar(30, 50));
    });
    // polvo al correr
    const D = this.estadoDino();
    if (D.anda > 0 && Math.random() < 14 * dt) p.nueva(P.POLVO, D.x + azar(-60, 60), PIES, azar(-60, 60), azar(-30, -5), azar(0.5, 0.9), azar(26, 44));
    if (D.anda > 0 && Math.sin(D.fase) * Math.sin(D.fase - 9 * dt) < 0 && D.x > -200 && D.x < W + 200) temblar(5, 0.15);
    const [xg, xm] = this.xs();
    const corre = (t >= T_HUYEN && t < T_PARAN);
    if (corre && Math.random() < 20 * dt) for (const x of [xg, xm]) if (x > -40 && x < W + 40) p.nueva(P.POLVO, x + azar(-20, 20), PIES, azar(-40, 40), azar(-20, -5), azar(0.4, 0.7), azar(18, 28));
    if (corre && Math.random() < 10 * dt) for (const x of [xg + 70, xm - 60]) if (x > 0 && x < W) p.nueva(P.GOTA, x, PIES - 260, azar(-60, 60), azar(-200, -60), azar(0.4, 0.7), azar(3, 5));
    // chorro de cerveza
    if (this.chorro && Math.random() < 30 * dt) {
      const H = this.manoDino(D);
      p.nueva(P.ESPUMA, H[0] + 12 + azar(-6, 6), H[1] - 30, azar(-30, 30), azar(-80, -20), azar(0.3, 0.6), azar(3, 6));
    }
    this.una("chin", t > T_CHIN, () => {
      temblar(16, 0.4);
      p.nueva(P.DESTELLO, PB[0], PB[1] - 10, 0, 0, 0.35, 220);
      for (let i = 0; i < 36; i++) { const a = azar(-Math.PI, 0), v = azar(160, 520); p.nueva(P.ESPUMA, PB[0], PB[1] - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(6, 12)); }
      for (let i = 0; i < 60; i++) p.nueva(P.CONFETI, azar(100, 924), azar(-60, 0), azar(-40, 40), azar(40, 160), azar(1.8, 2.8), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }

  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 470);
    gc.addColorStop(0, "#ff8a4a"); gc.addColorStop(0.55, "#ffc27a"); gc.addColorStop(1, "#ffe6b0");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB.amarillo, 120, 160, 300, 300); g.restore();
    g.fillStyle = "#fff4c8"; g.beginPath(); g.arc(270, 310, 46, 0, 6.283); g.fill();
    // volcán con humo
    g.fillStyle = "#8a4a5a";
    g.beginPath(); g.moveTo(560, 470); g.lineTo(735, 190); g.lineTo(805, 190); g.lineTo(990, 470); g.closePath(); g.fill();
    g.fillStyle = "#ff6a2a"; g.beginPath(); g.moveTo(735, 190); g.lineTo(805, 190); g.lineTo(790, 240); g.lineTo(770, 214); g.lineTo(752, 250); g.closePath(); g.fill();
    g.fillStyle = "rgba(120,80,90,.55)";
    for (const [x, y, r] of [[770, 160, 30], [790, 120, 38], [760, 80, 44], [800, 36, 50]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    // colinas
    g.fillStyle = "#4a8a4a";
    g.beginPath(); g.moveTo(-60, 480);
    for (let x = -60; x <= W + 60; x += 30) g.lineTo(x, 440 + Math.sin(x * 0.013) * 24 + Math.sin(x * 0.031) * 10);
    g.lineTo(W + 60, 520); g.lineTo(-60, 520); g.closePath(); g.fill();
    // suelo
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#9a7a42"); gs.addColorStop(1, "#6a4a22");
    g.fillStyle = gs; g.fillRect(-60, 478, W + 120, H);
    g.fillStyle = "#5a8a3a"; g.fillRect(-60, 474, W + 120, 10);
    const r = semilla(3);
    g.fillStyle = "rgba(60,40,10,.35)";
    for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * W, 500 + r() * 100, 4 + r() * 10, 2 + r() * 3, 0, 0, 6.283); g.fill(); }
    // palmeras al fondo
    for (const [x, h, s] of [[70, 300, 1], [960, 330, 1.1], [600, 220, 0.7]]) palmera(g, x, 480, h, s);
    this.fondoC = c;
    return c;
  }
  helechos(g, t) {
    for (const [x, s, f] of [[-20, 1.2, 0], [1040, 1.3, 1], [60, 0.8, 2], [980, 0.9, 3]]) {
      g.save(); g.translate(x, H + 10); g.scale(s, s);
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.32 + 0.04 * Math.sin(t * 2 + f + i);
        g.save(); g.rotate(a + Math.PI / 2);
        g.fillStyle = i % 2 ? "#2e7a32" : "#3c9a3c";
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-26, -70, 0, -150); g.quadraticCurveTo(26, -70, 0, 0); g.fill();
        g.restore();
      }
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, D = this.estadoDino(), e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // sombra del dinosaurio
    g.fillStyle = "rgba(40,20,0,.3)"; g.beginPath(); g.ellipse(D.x, PIES + 4, 170, 18, 0, 0, 6.283); g.fill();
    dino(g, D, t);
    // chorro de cerveza de Guillermo a la jarra del dinosaurio
    if (this.chorro) {
      const H = this.manoDino(D), b = aPant(e.mG, e.G._manoD || e.G.manoD);
      const borde = rot2([31, -15], e.G.jarra.inc);
      const q = aPant(e.mG, [(e.G._manoD || e.G.manoD)[0] + borde[0], (e.G._manoD || e.G.manoD)[1] + borde[1]]);
      void b;
      g.strokeStyle = "#ffb51f"; g.lineWidth = 7; g.lineCap = "round";
      g.beginPath(); g.moveTo(q[0], q[1]); g.quadraticCurveTo(q[0] + 8, (q[1] + H[1]) / 2, H[0] + 18, H[1] - 26); g.stroke();
      g.strokeStyle = "rgba(255,240,180,.7)"; g.lineWidth = 2; g.stroke();
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    this.helechos(g, t);
    this.p.dibujar(g);
    // ¡BUM!
    for (const [tb, y] of [[T_BUM1, 300], [T_BUM2, 200]]) {
      if (t > tb && t < tb + 0.5) {
        const k = tramo(t, tb, tb + 0.12), a = 1 - tramo(t, tb + 0.3, tb + 0.5);
        txt(g, "¡BUM!", 900, y, { tam: 70 * eBack(k), peso: 400, fam: FC, color: "#fff3c0", borde: "#3a1a00", bordeAncho: 9, alfa: a, esp: 2 });
      }
    }
    // ¡GROAAAR!
    if (t > T_RUGE && t < T_HUYEN + 0.2) {
      const k = tramo(t, T_RUGE, T_RUGE + 0.15), a = 1 - tramo(t, T_HUYEN, T_HUYEN + 0.2);
      g.save(); g.translate(440 + azar(-4, 4), 140 + azar(-4, 4)); g.rotate(-0.1);
      txt(g, "¡GROAAAR!", 0, 0, { tam: 92 * eBack(k), peso: 400, fam: FC, color: "#ffffff", borde: "#0b4a42", bordeAncho: 10, alfa: a, esp: 3 });
      g.restore();
      // ondas del rugido
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.45 * a})`; g.lineWidth = 5;
      for (let i = 0; i < 3; i++) { const r = 40 + ((t - T_RUGE) * 300 + i * 50) % 150; g.beginPath(); g.arc(700, 265, r, 2.5, 3.8); g.stroke(); }
      g.restore();
    }
    // ¡CORRE!
    if (t > T_HUYEN - 0.1 && t < T_PARAN + 0.3) {
      const d = t - T_HUYEN + 0.1, k = tramo(d, 0, 0.18), sal = tramo(t, T_PARAN, T_PARAN + 0.3);
      const s = lerp(2.4, 1, eIn(k)) * (1 + 0.04 * Math.sin(d * 18)) * (1 - 0.5 * sal);
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512 + 6 * Math.sin(d * 23), 100); g.rotate(-0.05 + 0.03 * Math.sin(d * 9)); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // ¿UNA CAÑA?
    if (t > T_PIDE + 0.15 && t < T_ECHA + 0.3) {
      const k = tramo(t, T_PIDE + 0.15, T_PIDE + 0.4) * (1 - tramo(t, T_ECHA + 0.1, T_ECHA + 0.3));
      bocadillo(g, 730, 96, "¿UNA CAÑA?", 600, 196, k, 46);
    }
    // ¡CHIN!
    if (t > T_CHIN && t < 10.2) {
      const k = tramo(t, T_CHIN, T_CHIN + 0.15);
      g.save(); g.translate(512, 104); g.rotate(-0.06); g.scale(eBack(k), eBack(k));
      txt(g, "¡CHIN!", 0, 0, { tam: 120, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a1a00", bordeAncho: 12, esp: 4, glow: "rgba(255,210,80,.7)", glowTam: 20 });
      g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, 10.0, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
function palmera(g, x, y, h, s) {
  g.save(); g.translate(x, y);
  g.strokeStyle = "#6a4a2a"; g.lineWidth = 16 * s; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(20 * s, -h * 0.5, 6 * s, -h); g.stroke();
  g.fillStyle = "#2e7a3a";
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55;
    g.save(); g.translate(6 * s, -h); g.rotate(a + Math.PI / 2);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-24 * s, -60 * s, 8 * s, -110 * s); g.quadraticCurveTo(20 * s, -50 * s, 0, 0); g.fill();
    g.restore();
  }
  g.restore();
}

registrar({ id: "00188", nombre: "El dinosaurio", crear: () => new ElDinosaurio() });
})();
