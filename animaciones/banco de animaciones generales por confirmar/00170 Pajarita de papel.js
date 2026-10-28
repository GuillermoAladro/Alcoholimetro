"use strict";
/*
 * 00170 · PAJARITA DE PAPEL
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la barra, Guillermo saca una servilleta y la dobla con mucho cuidado (FLIP, FLIP, FLIP)… ¡TACHÁN!: una
 * pajarita de papel que bate las alas y echa a volar; da una vuelta por el bar y se le posa en la cabeza.
 * Marcos lo intenta a toda prisa y le sale una bola arrugada (¡CRUNCH!). Se encoge de hombros, la lanza… y la bola
 * también vuela: ¡VUELA! La pajarita va con ella y se marchan las dos volando.
 */
(() => {
const CT = cacheTexto();
const ESC = 2.0, AY = 642, BARRA = 470;
const XG = 330, XM = 700, DISP = [525, BARRA - 4];
const RG = avatar().rig, RM = avatar("marcos").rig;
const C = [39, 102], R = 25;                                 // la servilleta, delante del pecho (unidades)
const T_SACA = 0.45, T_F1 = 1.2, T_F2 = 1.85, T_F3 = 2.5, T_TACHAN = 3.1, T_VUELA = 3.9, T_POSA = 5.95;
const T_M0 = 5.6, T_CRUNCH = 6.8, T_LANZA = 7.5, T_TIT = 7.65, T_APAGA = 9.95, DUR = 10.55;

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function enCabeza(Rg, p, rc) { const r = rot2([p[0] - Rg.cuello[0], p[1] - Rg.cuello[1]], rc); return [Rg.cuello[0] + r[0], Rg.cuello[1] + r[1]]; }
/** Recorrido por puntos [t, x, y] con curvas suaves (Catmull-Rom). */
function ruta(t, k) {
  if (t <= k[0][0]) return [k[0][1], k[0][2]];
  if (t >= k[k.length - 1][0]) return [k[k.length - 1][1], k[k.length - 1][2]];
  let i = 1; while (t > k[i][0]) i++;
  const p0 = k[Math.max(0, i - 2)], p1 = k[i - 1], p2 = k[i], p3 = k[Math.min(k.length - 1, i + 1)];
  const u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
  const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return [f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])];
}
const RUTA_BOLA = [[T_LANZA, 650, 360], [7.85, 560, 232], [8.25, 512, 384], [8.65, 340, 520], [9.05, 130, 440], [9.45, 110, 230], [9.95, -150, 110]];

const PAPEL = "#fbfaf4", PAPEL2 = "#dcd7ca", RAYA = "#8d887b";
function poli(g, pts, fill) {
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
  g.fillStyle = fill; g.fill(); g.stroke();
}
/** Pajarita mirando a la derecha; origen en el centro del cuerpo. flap: −1…1 (alas). */
function pajarita(g, x, y, s, flap, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.strokeStyle = RAYA; g.lineWidth = 1.3; g.lineJoin = "round";
  poli(g, [[-6, -2], [12, -2], [4 - 8 * flap, -2 - 40 * flap]], PAPEL2);          // ala de atrás
  poli(g, [[-26, 2], [-14, 0], [-46, -30]], PAPEL2);                               // cola
  poli(g, [[-30, 0], [24, 0], [8, 14], [-12, 14]], PAPEL);                         // cuerpo
  poli(g, [[14, 2], [22, 0], [38, -30], [31, -30]], PAPEL);                         // cuello
  poli(g, [[31, -30], [52, -26], [36, -23]], PAPEL2);                               // cabeza y pico
  poli(g, [[-10, 0], [12, 0], [-2 + 6 * flap, -48 * flap]], PAPEL);                 // ala de delante
  g.restore();
}
const BOLA = (() => { const r = semilla(9), a = []; for (let i = 0; i < 12; i++) { const an = (i / 12) * 6.283; a.push([Math.cos(an) * (13 + r() * 5), Math.sin(an) * (13 + r() * 5)]); } return a; })();
/** Bola de papel arrugada (con alitas si `alas` > 0). */
function bola(g, x, y, s, rot, alas, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = RAYA; g.lineWidth = 1.2; g.lineJoin = "round";
  if (alas > 0) {
    const f = Math.sin(t * 40) * alas;
    poli(g, [[-4, -10], [6, -10], [-14, -30 - 14 * f]], PAPEL2);
    poli(g, [[-6, -10], [4, -10], [16, -32 + 14 * f]], PAPEL);
  }
  g.rotate(rot);
  const gr = g.createRadialGradient(-5, -6, 2, 0, 0, 18);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#cfc9ba");
  poli(g, BOLA, gr);
  g.beginPath(); g.moveTo(-8, -4); g.lineTo(2, 2); g.lineTo(8, -6); g.moveTo(-4, 8); g.lineTo(3, 2); g.moveTo(-12, 3); g.lineTo(-6, 6); g.stroke();
  g.restore();
}
function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(700, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#d6f7ff"); gr.addColorStop(1, "#2fb8e8");
  txt(g, "¡VUELA!", 356, 176, { tam: 168, peso: 400, fam: FC, color: "#06202c", esp: 6 });
  txt(g, "¡VUELA!", 350, 170, { tam: 168, peso: 400, fam: FC, color: gr, borde: "#06202c", bordeAncho: 14, esp: 6, glow: "rgba(80,210,255,.85)", glowTam: 28 });
  CT.set("tit", c);
  return c;
}

class Pajarita extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** Dónde está la pajarita (pantalla) y cómo: { x, y, s, flap, rot, en } */
  pajaro(t, e) {
    if (t < T_TACHAN) return null;
    if (t < T_VUELA) {
      const q = aPant(e.mG, e.G.manoD);
      return { x: q[0] - 4, y: q[1] - 26, s: 1.15, flap: t > 3.55 ? Math.sin(t * 30) * 0.8 : 0.25, rot: 0 };
    }
    const cab = aPant(e.mG, enCabeza(RG, [39, -8], e.G.rc));
    if (t < T_POSA) {
      const k = [[T_VUELA, 372, 362], [4.3, 230, 230], [4.7, 470, 105], [5.15, 770, 175], [5.55, 590, 110], [T_POSA, cab[0], cab[1] - 18]];
      const p = ruta(t, k), q = ruta(t - 0.03, k);
      return { x: p[0], y: p[1], s: 1.5, flap: Math.sin(t * 24), rot: clamp((p[1] - q[1]) * 0.05, -0.5, 0.5), dir: p[0] >= q[0] ? 1 : -1 };
    }
    if (t < T_LANZA + 0.15) return { x: cab[0], y: cab[1] - 18 + Math.sin(t * 3) * 1.5, s: 1.3, flap: 0.15 + (t > 7.2 ? Math.sin(t * 30) * 0.5 : 0), rot: e.G.rc, dir: 1 };
    // se va con la bola
    const p = ruta(t - 0.28, RUTA_BOLA), q = ruta(t - 0.31, RUTA_BOLA);
    const k = eInOut(tramo(t, T_LANZA + 0.15, T_LANZA + 0.6));
    return { x: lerp(cab[0], p[0] - 30, k), y: lerp(cab[1] - 18, p[1] - 40, k), s: 1.5, flap: Math.sin(t * 24), rot: clamp((p[1] - q[1]) * 0.05, -0.5, 0.5), dir: p[0] >= q[0] ? 1 : -1 };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 168], manoI: [8, 168] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [66, 166], manoI: [7, 166] };
    const mG = matAv(XG, AY, ESC), mM0 = matAv(XM, AY, ESC);
    // ---------------- Guillermo: saca la servilleta y la dobla
    const dispG = enAv(mG, [DISP[0] - 18, DISP[1] - 40]);
    const kCoge = eInOut(tramo(t, T_SACA, T_SACA + 0.3)), kTrae = eInOut(tramo(t, T_SACA + 0.35, T_F1 - 0.1));
    let servG = null;
    if (t < T_F1 - 0.1) {
      G.manoD = mezcla(mezcla(G.manoD, dispG, kCoge), [C[0] + R + 2, C[1] + 2], kTrae);
      G.manoI = mezcla(G.manoI, [C[0] - R - 2, C[1] + 2], kTrae);
      G.cara = t > T_SACA ? "guino" : "sonrisa"; G.rc = 0.05;
    } else if (t < T_TACHAN) {
      // los dobleces: la mano derecha lleva la punta que se dobla
      const k1 = eInOut(tramo(t, T_F1, T_F1 + 0.5)), k2 = eInOut(tramo(t, T_F2, T_F2 + 0.5)), k3 = eInOut(tramo(t, T_F3, T_F3 + 0.45));
      let punta;
      if (t < T_F2) punta = k1 < 0.05 ? [R, 0] : [0, -R + 2 * R * k1];
      else if (t < T_F3) punta = [R - 2 * R * k2 * 0.85, k2 < 0.5 ? -4 * Math.sin(k2 * Math.PI) : 0];
      else punta = [0, R - 1.4 * R * k3];
      G.manoD = [C[0] + punta[0] + 3, C[1] + punta[1] + 3];
      G.manoI = [C[0] - R - 1, C[1] + 2];
      servG = { k1, k2, k3 };
      G.cara = "guino"; G.rc = 0.1 + 0.03 * Math.sin(t * 3);
    } else if (t < T_VUELA + 0.25) {
      // ¡TACHÁN!: la levanta en la palma
      const k = eBack(tramo(t, T_TACHAN, T_TACHAN + 0.35)), k2 = eOut(tramo(t, 3.55, T_VUELA));
      G.manoD = mezcla(mezcla([C[0] + 4, C[1] + 6], [62, 92], k), [80, 66], k2);
      G.manoI = mezcla([C[0] - R, C[1] + 2], [8, 168], k);
      G.cara = t > 3.55 ? "risa" : "sorpresa";
    } else {
      // la sigue con la mirada; orgulloso
      G.manoD = mezcla([80, 66], [72, 168], eInOut(tramo(t, T_VUELA + 0.25, 4.6)));
      G.cara = "risa";
    }
    const pj = this.pajaro(t, { mG, G });
    if (t > T_VUELA && t < T_POSA) G.rc = clamp((pj.x - XG) / 900, -0.2, 0.3);
    if (t >= T_POSA) { G.cara = t < 6.3 ? "sorpresa" : "sonrisa"; G.rc = t < 6.3 ? -0.04 : 0.06; }
    // Guillermo se ríe de la bola de Marcos
    if (t > T_CRUNCH + 0.15 && t < T_LANZA) {
      G.cara = "risa"; G.rc = 0.1 * Math.sin(t * 9);
      G.manoD = mezcla(G.manoD, [104, 112], eOut(tramo(t, T_CRUNCH + 0.15, T_CRUNCH + 0.35)));
    }
    if (t >= T_LANZA) { G.cara = t < 8.5 ? "sorpresa" : "risa"; G.rc = 0; G.manoD = mezcla([104, 112], [72, 168], eInOut(tramo(t, T_LANZA, T_LANZA + 0.3))); }
    // ---------------- Marcos
    let servM = null, bolaM = null;
    const dispM = enAv(mM0, [DISP[0] + 18, DISP[1] - 40]);
    M.cara = "sonrisa"; M.rc = -0.08;
    if (t > T_F1 && t < T_TACHAN) { M.cara = t > 2.2 ? "sorpresa" : "sonrisa"; M.rc = -0.14; }
    if (t > T_TACHAN && t < T_M0) { M.cara = t < T_TACHAN + 0.4 || t > T_VUELA ? "sorpresa" : "risa"; M.rc = t > T_VUELA ? clamp((pj.x - XM) / 900, -0.3, 0.2) : -0.1; }
    if (t > T_POSA - 0.3 && t < T_M0) { M.cara = "risa"; }
    if (t >= T_M0 - 0.05) {
      const kCoge = eInOut(tramo(t, T_M0 - 0.05, T_M0 + 0.2)), kTrae = eInOut(tramo(t, T_M0 + 0.22, 6.0));
      M.brazoIDelante = true;
      M.manoI = mezcla(mezcla(M.manoI, dispM, kCoge), [C[0] - R, C[1] + 2], kTrae);
      M.manoD = mezcla(M.manoD, [C[0] + R - 4, C[1] + 2], kTrae);
      M.cara = "guino"; M.rc = 0.04;
      if (t > 6.0 && t < T_CRUNCH) {
        // dobla a lo loco
        const a = t * 38;
        M.manoD = [C[0] + 10 + 9 * Math.cos(a), C[1] + 6 * Math.sin(a * 1.3)];
        M.manoI = [C[0] - 12 + 8 * Math.sin(a * 0.9), C[1] + 6 * Math.cos(a * 1.1)];
        M.cara = "sorpresa"; M.rc = 0.05 * Math.sin(t * 17);
        servM = tramo(t, 6.0, T_CRUNCH);
      }
      if (t >= T_CRUNCH && t < T_LANZA) {
        // la bola en la mano; se encoge de hombros
        const k = eOut(tramo(t, T_CRUNCH, T_CRUNCH + 0.2)), kHom = eInOut(tramo(t, 7.1, 7.3));
        M.manoD = mezcla([C[0] + 8, C[1]], [58, 84], k);
        M.manoI = mezcla([C[0] - 8, C[1] + 4], [-6, 96], kHom);
        M.cara = t < 7.1 ? "sorpresa" : "guino"; M.rc = t < 7.1 ? -0.06 : 0.12;
        M.manoD = mezcla(M.manoD, [70, 72], kHom);
        bolaM = aPant(mM0, [M.manoD[0] - 2, M.manoD[1] - 14]);
        if (t > 7.32) { // la lanza hacia arriba
          const kL = eIn(tramo(t, 7.32, T_LANZA));
          M.manoD = mezcla([70, 72], [78, 40], kL);
        }
      }
      if (t >= T_LANZA) {
        const k = eOut(tramo(t, T_LANZA, T_LANZA + 0.3));
        M.manoD = mezcla([78, 40], [86, 44 + 6 * Math.sin(t * 10)], k); M.manoI = mezcla([-6, 96], [-14, 50 + 6 * Math.sin(t * 10 + 1)], k);
        M.brazoIDelante = false;
        M.cara = "risa"; M.rc = 0.08 * Math.sin(t * 6);
      }
    }
    // la servilleta en las manos (objI: queda por debajo de los dos brazos)
    if (t > T_SACA + 0.3 && t < T_TACHAN) {
      G.brazoIDelante = true;
      const mD = G.manoD; G.objI = (g) => this.servilleta(g, t, servG, mD);
    }
    if (t > T_M0 + 0.2 && t < T_CRUNCH) M.objI = (g) => this.servMarcos(g, t, servM);
    if (t >= T_CRUNCH && t < T_LANZA) M.objD = (g, m) => bola(g, m[0] - 2, m[1] - 10, 0.8, t * 0.5, 0, t);
    return { G, M, mG, mM: mM0, pj, bolaM };
  }
  /** La servilleta de Guillermo: rombo, y los tres dobleces. */
  servilleta(g, t, s, mD) {
    const kAbre = eOut(tramo(t, 0.85, 1.1));
    const c = s ? C : mezcla([mD[0] - 8, mD[1] - 6], C, eInOut(tramo(t, 0.85, 1.1)));
    g.save(); g.translate(c[0], c[1]);
    g.strokeStyle = RAYA; g.lineWidth = 0.8; g.lineJoin = "round";
    if (!s) {
      const r = R * (0.35 + 0.65 * kAbre);
      poli(g, kAbre < 0.3 ? [[-r, -r * 0.7], [r, -r * 0.7], [r, r * 0.7], [-r, r * 0.7]] : [[0, -r], [r, 0], [0, r], [-r, 0]], PAPEL);
    } else if (t < T_F2) {
      // 1: la punta de arriba baja
      poli(g, [[-R, 0], [R, 0], [0, R]], PAPEL);
      const y = -R + 2 * R * s.k1;
      poli(g, [[-R, 0], [R, 0], [0, y]], s.k1 > 0.5 ? PAPEL2 : PAPEL);
    } else if (t < T_F3) {
      // 2: la mitad derecha pasa a la izquierda
      poli(g, [[-R, 0], [0, 0], [0, R]], PAPEL);
      const x = R - 2 * R * s.k2;
      poli(g, [[0, 0], [x, 0], [0, R]], s.k2 > 0.5 ? PAPEL2 : PAPEL);
    } else {
      // 3: la punta de abajo sube
      const y = R - 1.6 * R * s.k3;
      poli(g, [[-R, 0], [0, 0], [0, Math.max(y, R * 0.4)], [-R * 0.4, R * 0.6]], PAPEL);
      poli(g, [[-R * 0.5, R * 0.5], [0, R * 0.2], [0, y]], PAPEL2);
    }
    g.restore();
  }
  /** La de Marcos: cada vez más arrugada, hasta ser una bola. */
  servMarcos(g, t, k) {
    k = k == null ? 0 : k;
    const kAbre = eOut(tramo(t, T_M0 + 0.2, 6.0));
    g.save(); g.translate(C[0], C[1]);
    g.strokeStyle = RAYA; g.lineWidth = 0.8; g.lineJoin = "round";
    const r = R * (0.4 + 0.6 * kAbre) * (1 - 0.55 * k), n = 12, sr = semilla(3 + Math.floor(t * 14));
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + Math.PI / 4, base = i % 3 === 0 ? 1 : 0.72;
      const rr = r * lerp(base, 0.7 + sr() * 0.5, k);
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    poli(g, pts, k > 0.3 ? "#eeeadf" : PAPEL);
    if (k > 0.2) { g.beginPath(); for (let i = 0; i < 5; i++) { g.moveTo((sr() - 0.5) * r * 1.4, (sr() - 0.5) * r * 1.4); g.lineTo((sr() - 0.5) * r * 1.4, (sr() - 0.5) * r * 1.4); } g.stroke(); }
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tachan", t > T_TACHAN, () => {
      const q = aPant(matAv(XG, AY, ESC), [C[0], C[1]]);
      temblar(6, 0.2); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 170);
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.PURPURINA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1), azar(8, 13)); }
    });
    this.una("crunch", t > T_CRUNCH, () => {
      temblar(8, 0.25);
      const q = aPant(matAv(XM, AY, ESC), C);
      for (let i = 0; i < 10; i++) p.nueva(P.POLVO, q[0] + azar(-20, 20), q[1] + azar(-20, 20), azar(-120, 120), azar(-120, 40), azar(0.3, 0.6), azar(18, 30));
    });
    this.una("tit", t > T_TIT, () => { temblar(12, 0.3); });
    // estela de la pajarita y de la bola
    if (t > T_VUELA && t < T_POSA && Math.random() < 30 * dt) {
      const pj = this.pajaro(t, this.poses());
      if (pj) p.nueva(P.PURPURINA, pj.x - 20 * (pj.dir || 1), pj.y, azar(-20, 20), azar(-10, 30), azar(0.5, 0.9), azar(7, 11));
    }
    if (t > T_LANZA && t < 9.95 && Math.random() < 40 * dt) {
      const q = ruta(t, RUTA_BOLA);
      p.nueva(P.PURPURINA, q[0] + azar(-10, 10), q[1] + azar(-10, 10), azar(-20, 20), azar(-10, 30), azar(0.5, 0.9), azar(7, 11));
    }
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondoBar() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, 0, 0, BARRA);
    gr.addColorStop(0, "#120c0a"); gr.addColorStop(1, "#2a1a12");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, BARRA + 60);
    // estanterías con botellas (siluetas de colores)
    const r = semilla(23), cols = ["#3a7a3a", "#7a4a1a", "#2a4a7a", "#8a2a2a", "#a08030"];
    for (const y of [150, 300]) {
      g.fillStyle = "#3a2416"; g.fillRect(-60, y, W + 120, 10);
      g.fillStyle = "rgba(255,200,140,.15)"; g.fillRect(-60, y, W + 120, 2);
      for (let x = 20; x < W; x += 34 + r() * 20) {
        const h = 60 + r() * 40, w = 18 + r() * 8, col = cols[Math.floor(r() * cols.length)];
        g.fillStyle = col; g.globalAlpha = 0.55;
        rectR(g, x - w / 2, y - h * 0.62, w, h * 0.62, 5); g.fill();
        g.fillRect(x - 4, y - h, 8, h * 0.4);
        g.globalAlpha = 0.35; g.fillStyle = "#fff"; g.fillRect(x - w / 2 + 3, y - h * 0.55, 3, h * 0.45);
        g.globalAlpha = 1;
      }
    }
    CT.set("fondo", c);
    return c;
  }
  barra(g) {
    const gf = g.createLinearGradient(0, BARRA, 0, H);
    gf.addColorStop(0, "#5a3218"); gf.addColorStop(1, "#24130a");
    g.fillStyle = gf; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  servilletero(g, t) {
    const [x, y] = DISP;
    // servilletas asomando
    g.fillStyle = PAPEL; g.strokeStyle = RAYA; g.lineWidth = 1;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * 9 - 8, y - 46); g.lineTo(x + i * 9, y - 62 - (i % 2) * 4); g.lineTo(x + i * 9 + 8, y - 46); g.closePath(); g.fill(); g.stroke(); }
    const gr = g.createLinearGradient(x - 34, 0, x + 34, 0);
    gr.addColorStop(0, "#5d6670"); gr.addColorStop(0.45, "#eef2f6"); gr.addColorStop(1, "#5d6670");
    g.fillStyle = gr; rectR(g, x - 34, y - 50, 68, 50, 6); g.fill();
    g.fillStyle = "rgba(0,0,0,.25)"; rectR(g, x - 24, y - 40, 48, 30, 4); g.fill();
    g.fillStyle = PAPEL; rectR(g, x - 20, y - 36, 40, 22, 3); g.fill();
  }
  ono(g, s, x, y, t0, dur, tam, color, rot) {
    const d = this.t - t0;
    if (d < 0 || d > dur) return;
    const k = eBack(tramo(d, 0, 0.1));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color, borde: "#1a1a1a", bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
    g.restore();
  }
  dibujar(g) {
    // lo caro (textos con brillo, fondos) se prepara en el primer cuadro, que es negro
    if (!this._pre) { this._pre = true; titulo(); this.fondoBar(); }
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoBar(), -60, -60);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; g.drawImage(BLOB2.oroClaro, 60, 20, 904, 560); g.restore();
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    this.barra(g);
    this.servilletero(g, t);
    // FLIP, FLIP, FLIP…
    const qG = aPant(e.mG, C);
    this.ono(g, "FLIP", qG[0] + 70, qG[1] - 150, T_F1 + 0.2, 0.45, 40, "#fffdf5", -0.1);
    this.ono(g, "FLIP", qG[0] + 90, qG[1] - 170, T_F2 + 0.2, 0.45, 40, "#fffdf5", 0.1);
    this.ono(g, "FLIP", qG[0] + 70, qG[1] - 190, T_F3 + 0.2, 0.45, 40, "#fffdf5", -0.06);
    this.ono(g, "¡TACHÁN!", qG[0] + 30, qG[1] - 190, T_TACHAN, 0.75, 52, "#ffd34d", -0.08);
    const qM = aPant(e.mM, C);
    this.ono(g, "ÑIC, ÑIC…", qM[0] - 120, qM[1] - 170, 6.15, 0.55, 38, "#fffdf5", -0.08);
    this.ono(g, "¡CRUNCH!", qM[0] - 60, qM[1] - 190, T_CRUNCH, 0.65, 56, "#ff3d84", 0.08);
    // Guillermo: «¡VUELA!»
    const bG = aPant(e.mG, boca(e.G.rc));
    const kB = tramo(t, 3.55, 3.7) * (1 - tramo(t, 4.55, 4.7));
    if (kB > 0) bocadillo(g, bG[0] + 150, bG[1] - 120, "¡VUELA!", bG[0] + 30, bG[1] - 20, kB, 40);
    // ¡VUELA! (remate)
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 88); g.rotate(-0.04); g.scale(s * 0.85, s * 0.85);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    this.p.dibujar(g);
    // la pajarita y la bola voladora
    const pj = e.pj;
    if (pj) { g.save(); g.translate(pj.x, pj.y); g.scale(pj.dir || 1, 1); pajarita(g, 0, 0, pj.s, pj.flap, pj.rot * (pj.dir || 1)); g.restore(); }
    if (t >= T_LANZA) {
      const q = ruta(t, RUTA_BOLA), alas = tramo(t, T_LANZA + 0.1, T_LANZA + 0.35);
      bola(g, q[0], q[1] + Math.sin(t * 9) * 6, 1.9, t * 3, alas, t);
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00170", nombre: "Pajarita de papel", crear: () => new Pajarita() });
})();
