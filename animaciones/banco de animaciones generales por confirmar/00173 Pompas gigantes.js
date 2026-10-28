"use strict";
/*
 * 00173 · POMPAS GIGANTES
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la terraza, de noche, Marcos moja un aro en el bote de jabón y sopla: la pompa crece y crece hasta envolver a
 * Guillermo, que se despega del suelo y sale flotando dentro (primero asustado, luego encantado, dando vueltas).
 * Marcos corre debajo con los brazos abiertos; la pompa explota (¡PLOP!) y Guillermo cae en brazos de Marcos.
 * Se ríen los dos mientras pasan pompitas.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45;
const XG = 400, XM = 700, XM2 = 606;
const RG = avatar().rig, RM = avatar("marcos").rig;
const T_MOJA = 0.45, T_SOPLA = 1.45, T_SUELTA = 3.0, T_CORRE = 5.55, T_PLOP = 6.5, T_COGE = 6.85, T_APAGA = 9.9, DUR = 10.5;
const R_MAX = 212;

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function ruta(t, k) {
  if (t <= k[0][0]) return [k[0][1], k[0][2]];
  if (t >= k[k.length - 1][0]) return [k[k.length - 1][1], k[k.length - 1][2]];
  let i = 1; while (t > k[i][0]) i++;
  const p0 = k[Math.max(0, i - 2)], p1 = k[i - 1], p2 = k[i], p3 = k[Math.min(k.length - 1, i + 1)];
  const u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
  const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return [f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])];
}
const RUTA = [[T_SUELTA, 430, 381], [3.5, 400, 330], [4.1, 300, 270], [4.8, 420, 215], [5.5, 640, 205], [6.05, 720, 225], [T_PLOP, 612, 240]];

function burbuja(g, cx, cy, rx, ry, t, a = 1) {
  g.save(); g.globalAlpha *= a;
  const gr = g.createRadialGradient(cx - rx * 0.2, cy - ry * 0.25, rx * 0.1, cx, cy, Math.max(rx, ry));
  gr.addColorStop(0, "rgba(220,240,255,.03)"); gr.addColorStop(0.8, "rgba(180,220,255,.08)"); gr.addColorStop(1, "rgba(200,235,255,.28)");
  g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.fill();
  // tornasol del borde
  const cols = ["rgba(255,120,200,.55)", "rgba(255,230,120,.5)", "rgba(120,240,255,.55)", "rgba(170,140,255,.45)"];
  g.lineWidth = Math.max(1.5, rx * 0.018);
  cols.forEach((c, i) => {
    const a0 = t * (0.8 + i * 0.3) + i * 1.6;
    g.strokeStyle = c; g.beginPath(); g.ellipse(cx, cy, rx - i * 1.6, ry - i * 1.6, 0, a0, a0 + 2.4); g.stroke();
  });
  g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.stroke();
  // brillos
  g.fillStyle = "rgba(255,255,255,.75)";
  g.save(); g.translate(cx - rx * 0.48, cy - ry * 0.5); g.rotate(-0.7); g.beginPath(); g.ellipse(0, 0, rx * 0.16, ry * 0.06, 0, 0, 6.283); g.fill(); g.restore();
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(cx + rx * 0.5, cy + ry * 0.55, Math.max(2, rx * 0.035), 0, 6.283); g.fill();
  g.restore();
}
function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(620, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffd6f0"); gr.addColorStop(1, "#ff5fae");
  txt(g, "¡PLOP!", 316, 176, { tam: 172, peso: 400, fam: FC, color: "#2a0018", esp: 6 });
  txt(g, "¡PLOP!", 310, 170, { tam: 172, peso: 400, fam: FC, color: gr, borde: "#2a0018", bordeAncho: 14, esp: 6, glow: "rgba(255,110,190,.85)", glowTam: 28 });
  CT.set("tit", c);
  return c;
}
function fondoTerraza() {
  if (CT.has("fondo")) return CT.get("fondo");
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, -60, 0, 480);
  gr.addColorStop(0, "#050a1c"); gr.addColorStop(1, "#1d2a52");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, 560);
  const r = semilla(12);
  g.fillStyle = "#fff";
  for (let i = 0; i < 70; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.beginPath(); g.arc(r() * W, r() * 330, 0.6 + r() * 1.4, 0, 6.283); g.fill(); }
  g.globalAlpha = 1;
  // barandilla y suelo de tablas
  g.fillStyle = "#2a1a10"; g.fillRect(-60, 392, W + 120, 10);
  for (let x = -40; x < W + 60; x += 46) g.fillRect(x, 400, 7, 80);
  const gs = g.createLinearGradient(0, 478, 0, H + 60);
  gs.addColorStop(0, "#4a3020"); gs.addColorStop(1, "#140b06");
  g.fillStyle = gs; g.fillRect(-60, 478, W + 120, H - 418);
  g.fillStyle = "rgba(0,0,0,.3)"; for (let y = 492; y < H + 60; y += 22) g.fillRect(-60, y, W + 120, 2);
  CT.set("fondo", c);
  return c;
}

class Pompas extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.pompitas = [];
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** La pompa: centro y radio (o null si ya ha explotado). */
  pompa(t, aroP) {
    if (t < T_SOPLA || t > T_PLOP) return null;
    if (t < T_SUELTA) {
      const k = eOut(tramo(t, T_SOPLA, T_SUELTA)), r = lerp(14, R_MAX, k);
      return { x: aroP[0] - r * 0.96, y: aroP[1] + r * 0.33, r };
    }
    const p = ruta(t, RUTA);
    return { x: p[0], y: p[1], r: R_MAX };
  }
  estado() {
    const t = this.t;
    // ---------------- Marcos
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 140], manoI: [8, 140], brazoIDelante: true };
    let xM = XM, dyM = 0, syM = 1, giroM = 0;
    const kMoja = eInOut(tramo(t, T_MOJA, T_MOJA + 0.25)) * (1 - eInOut(tramo(t, 0.85, 1.1)));
    const kSube = eInOut(tramo(t, 1.0, T_SOPLA - 0.05));
    let aroMano = mezcla([8, 140], [49, 86], kMoja);
    aroMano = mezcla(aroMano, [0, 80], kSube);
    M.manoD = mezcla([64, 140], [52, 130], eOut(tramo(t, 0.3, 0.6)));
    if (t > T_MOJA) M.cara = "guino";
    if (t > T_SOPLA && t < T_SUELTA) { M.cara = "sorpresa"; M.rc = -0.04; }
    if (t > T_SUELTA && t < T_CORRE) { M.cara = t < 3.6 ? "risa" : "sorpresa"; }
    // corre debajo de la pompa con los brazos abiertos
    if (t > T_CORRE) {
      const k = eInOut(tramo(t, T_CORRE, 6.25));
      xM = lerp(XM, XM2, k);
      if (k > 0 && k < 1) { const a = andar(t * 13, 1); M.piernaI = a.piernaI; M.piernaD = a.piernaD; dyM = a.bote * ESC; }
      const kB = eOut(tramo(t, 5.9, 6.3));
      aroMano = mezcla(aroMano, [4, 118], kB); M.manoD = mezcla(M.manoD, [70, 118], kB);
      M.cara = "sorpresa"; M.rc = 0;
    }
    // lo coge en brazos
    let cogido = null;
    if (t > T_PLOP) {
      const kC = tramo(t, T_COGE, T_COGE + 0.35);
      syM = 1 - 0.08 * Math.sin(kC * Math.PI);
      giroM = t > T_COGE + 0.35 ? 0.03 * Math.sin((t - T_COGE) * 4) : 0;
      aroMano = [6, 124]; M.manoD = [68, 124];
      M.cara = t < T_COGE + 0.2 ? "sorpresa" : "risa"; M.rc = t > T_COGE + 0.2 ? 0.06 * Math.sin(t * 5) : 0;
      if (t > T_COGE + 0.3) dyM = -Math.abs(Math.sin((t - T_COGE) * 7)) * 3;
    }
    M.manoI = aroMano;
    const mM = matAv(xM, PIES + dyM, ESC, giroM, 1, syM);
    const off = this.aroOff(kMoja), aroP = aPant(mM, [aroMano[0] + off[0], aroMano[1] + off[1]]);
    // aro y bote
    const conAro = t < T_CORRE + 0.35;
    if (conAro) M.objI2 = (g, m) => this.aro(g, m, t, kMoja);
    M.objD = (g, m) => this.bote(g, m);
    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const pm = this.pompa(t, aroP);
    let mG;
    if (t < T_SUELTA) {
      G.cara = t < T_SOPLA + 0.5 ? "guino" : "sorpresa";
      G.rc = t < T_SOPLA + 0.5 ? 0.08 : -0.06;
      // se echa un poco atrás y apoya las manos en la pompa
      const k = eInOut(tramo(t, 2.3, 2.9));
      G.manoD = mezcla(G.manoD, [96, 92], k); G.manoI = mezcla(G.manoI, [-18, 92], k);
      mG = matAv(XG, PIES, ESC, -0.05 * k);
    } else if (t < T_PLOP) {
      // dentro de la pompa, flotando
      const kL = eInOut(tramo(t, T_SUELTA, T_SUELTA + 0.45));
      const c0 = [XG, PIES - (232 - 116) * ESC];
      const c = mezcla(c0, [pm.x, pm.y + 8], kL);
      const pan = t < 4.1;
      const giro = Math.sin((t - T_SUELTA) * 1.8) * 0.28 * kL;
      if (pan) {
        G.cara = "sorpresa"; G.puntas = 0.6 * kL;
        G.manoD = [92 + 10 * Math.sin(t * 16), 70 + 14 * Math.cos(t * 13)]; G.manoI = [-14 - 10 * Math.sin(t * 15), 70 + 14 * Math.cos(t * 12)];
        G.piernaI = [-6 * Math.max(0, Math.sin(t * 14)), 0.25 * Math.sin(t * 14) * kL]; G.piernaD = [-6 * Math.max(0, -Math.sin(t * 14)), -0.25 * Math.sin(t * 14) * kL];
      } else {
        G.cara = t > 5.95 ? "sorpresa" : "risa";
        const s = Math.sin(t * 5);
        G.manoD = [88 + 8 * s, 100 - 22 * s]; G.manoI = [-10 - 8 * s, 100 + 22 * s];
        G.piernaI = [0, 0.15 * Math.sin(t * 4)]; G.piernaD = [0, -0.15 * Math.sin(t * 4)];
        G.rc = 0.1 * Math.sin(t * 3);
      }
      mG = matAv(c[0], c[1], ESC * 0.95, giro, 1, 1, [39, 116]);
    } else {
      // cae en brazos de Marcos (tumbado: la cabeza a la izquierda)
      const kF = eIn(tramo(t, T_PLOP, T_COGE));
      const ultimo = ruta(T_PLOP, RUTA);
      const brazos = aPant(mM, [37, 118]);
      const destino = [brazos[0] + 6, brazos[1] - 14];
      const c = [lerp(ultimo[0], destino[0], kF), lerp(ultimo[1] + 8, destino[1], kF)];
      const giro = lerp(0.2, -Math.PI / 2, eOut(tramo(t, T_PLOP, T_COGE)));
      G.cara = t < T_COGE + 0.2 ? "sorpresa" : t > 8.6 && t < 9.2 ? "guino" : "risa";
      G.piernaI = [0, 0.1]; G.piernaD = [0, -0.05 + (t > T_COGE + 0.3 ? 0.12 * Math.sin(t * 6) : 0)];
      // el brazo por el cuello de Marcos
      const kAb = eOut(tramo(t, T_COGE + 0.15, T_COGE + 0.45));
      const mG0 = matAv(c[0], c[1], ESC, giro, 1, 1, [39, 116]);
      G.manoD = mezcla([96, 80], [112 + 6 * Math.sin(t * 9), 44], kAb);
      G.manoI = [-6, 128];
      G.rc = -0.15;
      mG = mG0;
      cogido = { kAb };
    }
    return { G, M, mG, mM, pm, aroP, cogido };
  }
  /** Del puño al centro del aro: hacia arriba al soplar, hacia abajo al mojarlo en el bote. */
  aroOff(k) { return [lerp(-6, 0, k), lerp(-30, 22, k)]; }
  aro(g, m, t, kMoja) {
    // palito desde la mano hasta el aro y el aro con la película de jabón
    const o = this.aroOff(kMoja), c = [m[0] + o[0], m[1] + o[1]], ab = o[1] > 0 ? -11 : 11;
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#ff5fae"; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(c[0], c[1] + ab); g.stroke();
    g.lineWidth = 2.4; g.beginPath(); g.arc(c[0], c[1], 11, 0, 6.283); g.stroke();
    if (t > 0.85 && t < T_SOPLA + 0.05) { g.fillStyle = "rgba(190,230,255,.3)"; g.beginPath(); g.arc(c[0], c[1], 10, 0, 6.283); g.fill(); }
    g.restore();
  }
  bote(g, m) {
    g.save(); g.translate(m[0] - 2, m[1] - 8);
    const gr = g.createLinearGradient(-6, 0, 6, 0);
    gr.addColorStop(0, "#1f6fbf"); gr.addColorStop(0.5, "#8fd0ff"); gr.addColorStop(1, "#1a5a9a");
    g.fillStyle = gr; rectR(g, -6, -8, 12, 22, 3); g.fill();
    g.fillStyle = "#ff5fae"; rectR(g, -4, -13, 8, 6, 2); g.fill();
    g.fillStyle = "rgba(255,255,255,.8)"; g.fillRect(-4, -2, 8, 6);
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > T_SOPLA && t < T_SUELTA && Math.random() < 20 * dt) {
      const e = this.estado();
      p.nueva(P.VAPOR, e.aroP[0] + 14, e.aroP[1] + azar(-6, 6), azar(-90, -40), azar(-10, 10), azar(0.3, 0.5), azar(8, 14));
    }
    this.una("suelta", t > T_SUELTA, () => temblar(5, 0.2));
    this.una("plop", t > T_PLOP, () => {
      temblar(16, 0.4);
      const c = ruta(T_PLOP, RUTA);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.35, 300);
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * 6.283, v = azar(160, 360);
        p.nueva(P.ESPUMA, c[0] + Math.cos(a) * R_MAX, c[1] + Math.sin(a) * R_MAX, Math.cos(a) * v, Math.sin(a) * v - 60, azar(0.4, 0.8), azar(4, 8));
      }
    });
    this.una("coge", t > T_COGE, () => { temblar(10, 0.3); for (let i = 0; i < 14; i++) p.nueva(P.POLVO, XM2 + azar(-60, 60), PIES - 6, azar(-150, 150), azar(-50, -5), azar(0.4, 0.8), azar(26, 40)); });
    // pompitas que pasan al final
    if (t > T_COGE && t < T_APAGA - 0.4 && Math.random() < 3.5 * dt) this.pompitas.push({ t0: t, x: azar(80, 944), y: H + 30, r: azar(12, 30), v: azar(70, 130), f: azar(0, 6) });
    p.alfa = this.luz();
    p.actualizar(dt);
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
    if (!this._pre) { this._pre = true; titulo(); fondoTerraza(); }
    const t = this.t, a = this.luz(), e = this.estado();
    fondo(g, "#000");
    g.drawImage(fondoTerraza(), -60, -60);
    // guirnalda de bombillas
    g.strokeStyle = "#111"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-20, 40); g.quadraticCurveTo(256, 120, 512, 50); g.quadraticCurveTo(768, 120, 1044, 40); g.stroke();
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, x = -20 + u * 1064, h = u < 0.5 ? u * 2 : u * 2 - 1, y = (u < 0.5 ? lerp(40, 50, h) : lerp(50, 40, h)) + Math.sin(h * Math.PI) * 38;
      g.globalAlpha = 0.6 + 0.2 * Math.sin(t * 3 + i); g.drawImage(BLOB.amarillo, x - 14, y - 4, 28, 28);
    }
    g.restore();
    // sombras
    g.fillStyle = "rgba(0,0,0,.45)";
    for (const m of [e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 56, 8, 0, 0, 6.283); g.fill(); }
    if (t < T_SUELTA + 0.3) { g.beginPath(); g.ellipse(XG, PIES + 2, 56 * (1 - tramo(t, T_SUELTA, T_SUELTA + 0.3)), 8, 0, 0, 6.283); g.fill(); }
    // Marcos, Guillermo (delante cuando está en brazos) y la pompa
    const enBrazos = t > T_PLOP;
    if (!enBrazos) { pintarAvatar(g, e.mG, e.G, t); pintarAvatar(g, e.mM, e.M, t); }
    else {
      pintarAvatar(g, e.mM, e.M, t);
      pintarAvatar(g, e.mG, e.G, t);
      // las manos de Marcos por debajo de la espalda y de las rodillas
      if (t > T_COGE - 0.05) {
        for (const q of [[4, 92], [6, 178]]) {
          const s = aPant(e.mG, q);
          const gr = g.createRadialGradient(s[0] - 3, s[1] - 3, 1, s[0], s[1], 12);
          gr.addColorStop(0, "#ffd2b4"); gr.addColorStop(1, "#d98c62");
          g.fillStyle = gr; g.beginPath(); g.ellipse(s[0], s[1] - 4, 14, 10, 0, 0, 6.283); g.fill();
          g.strokeStyle = "rgba(150,80,50,.6)"; g.lineWidth = 1.2; g.beginPath(); for (let i = -1; i <= 1; i++) { g.moveTo(s[0] + i * 6, s[1] - 12); g.lineTo(s[0] + i * 6, s[1] - 4); } g.stroke();
        }
      }
    }
    if (e.pm) {
      const w = 1 + 0.035 * Math.sin(t * 5.5);
      burbuja(g, e.pm.x, e.pm.y, e.pm.r * w, e.pm.r / w, t);
    }
    // pompitas
    for (const b of this.pompitas) {
      const d = t - b.t0, y = b.y - d * b.v;
      if (y < -40) continue;
      burbuja(g, b.x + Math.sin(d * 2 + b.f) * 20, y, b.r, b.r, t + b.f, 0.9);
    }
    this.p.dibujar(g);
    this.ono(g, "FUUUH…", e.aroP[0] - 10, e.aroP[1] - 70, T_SOPLA + 0.1, 1.3, 40, "#d6f3ff", 0.06);
    this.ono(g, "¡BLOB!", 520, 140, T_SUELTA, 0.6, 48, "#2fe3e8", -0.06);
    this.ono(g, "¡UF!", XM2 + 120, 300, T_COGE, 0.6, 46, "#fffdf5", 0.1);
    // ¡PLOP!
    if (t > T_PLOP) {
      const d = t - T_PLOP, k = tramo(d, 0, 0.15), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 104); g.rotate(-0.05); g.scale(s * 0.85, s * 0.85);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00173", nombre: "Pompas gigantes", crear: () => new Pompas() });
})();
