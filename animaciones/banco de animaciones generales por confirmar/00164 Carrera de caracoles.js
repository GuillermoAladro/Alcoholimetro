"use strict";
/*
 * 00164 · CARRERA DE CARACOLES
 *
 * Animación del banco. Empieza y acaba en negro.
 * La gran final en la barra: dos caracoles con dorsal (el de Marcos con una chapa de caparazón) avanzan a paso de
 * caracol mientras Guillermo y Marcos los animan a gritos, sudando y botando como si fuera el último minuto de un
 * mundial. Llegan juntos; la lupa de la meta lo confirma: gana el de Marcos por 1 mm. ¡VAMOS, CAMPEÓN!
 */
(() => {
const ESC = 1.7, AY = 628, XG = 300, XM = 724, BARRA = 404;
const META = 790, T_YA = 0.8, T_META = 7.2, T_TIT = 7.75, DUR = 10.6, T_APAGA = 10.0;
// morro de cada caracol: [t, x]
const PG = [[0, 250], [T_YA, 250], [2.4, 390], [3.4, 450], [4.5, 548], [5.6, 640], [6.6, 742], [T_META, META - 8], [8, META + 2]];
const PM = [[0, 250], [T_YA, 250], [2.4, 352], [3.4, 448], [4.5, 566], [5.6, 628], [6.6, 744], [T_META, META], [8, META + 8]];
const CALLE = [{ y: 432, s: 1.04 }, { y: 492, s: 1.2 }];
const GRITOS = [[1.5, 2.6, 0], [3.5, 4.6, 1], [5.3, T_META, 0], [5.5, T_META, 1]];
const CT = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], u); }
  return k[k.length - 1][1];
}

/** Caracol con el morro en (x, y) (y = suelo). `estira` 0–1 ondula el cuerpo. */
function caracol(g, x, y, s, estira, dorsal, chapa, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const L = 92 * (1 + 0.07 * estira);
  // baba
  g.fillStyle = "rgba(200,240,255,.25)"; g.beginPath(); g.ellipse(-L * 0.6, 1, L * 0.7, 3.5, 0, 0, 6.283); g.fill();
  // cuerpo
  g.beginPath();
  g.moveTo(-L, 0);
  g.quadraticCurveTo(-L * 0.5, 3, -4, 0);
  g.quadraticCurveTo(6, -2, 4, -18);
  g.quadraticCurveTo(2, -34, -12, -34);
  g.quadraticCurveTo(-22, -32, -24, -14);
  g.quadraticCurveTo(-L * 0.6, -12, -L, 0);
  g.closePath();
  const gc = g.createLinearGradient(0, -34, 0, 2);
  gc.addColorStop(0, "#f3e1a6"); gc.addColorStop(0.6, "#d6b56a"); gc.addColorStop(1, "#9c7a3a");
  g.fillStyle = gc; g.fill(); g.strokeStyle = "#6a4f1c"; g.lineWidth = 2; g.stroke();
  // cuernos con ojos
  g.strokeStyle = "#b8964a"; g.lineWidth = 4; g.lineCap = "round";
  const bam = Math.sin(t * 6) * 2;
  for (const [bx, ex, ey] of [[-12, -16 + bam, -62], [-4, 4 - bam, -58]]) {
    g.beginPath(); g.moveTo(bx, -30); g.quadraticCurveTo(bx + 1, -46, ex, ey); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(ex, ey, 6, 0, 6.283); g.fill();
    g.strokeStyle = "#6a4f1c"; g.lineWidth = 1.5; g.stroke(); g.strokeStyle = "#b8964a"; g.lineWidth = 4;
    g.fillStyle = "#111"; g.beginPath(); g.arc(ex + 2, ey, 3, 0, 6.283); g.fill();
  }
  // boca
  g.strokeStyle = "#6a4f1c"; g.lineWidth = 1.6; g.beginPath(); g.arc(-4, -17, 5, 0.3, 1.6); g.stroke();
  // concha
  const cx = -L * 0.52, cy = -30, R = 29;
  const gs = g.createRadialGradient(cx - 8, cy - 10, 3, cx, cy, R);
  gs.addColorStop(0, chapa ? "#c98a4a" : "#e98a3a"); gs.addColorStop(0.7, chapa ? "#8a4f20" : "#b4561c"); gs.addColorStop(1, "#5a2c0c");
  g.fillStyle = gs; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.fill();
  g.strokeStyle = "#4a2208"; g.lineWidth = 2; g.stroke();
  g.strokeStyle = "rgba(60,25,5,.7)"; g.lineWidth = 2.5; g.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i * 0.42, r = R * (1 - i / 44); const px = cx + Math.cos(a) * r * 0.9, py = cy + Math.sin(a) * r * 0.9; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  g.stroke();
  // dorsal
  g.save(); g.translate(cx + 2, cy + 6); g.rotate(-0.08);
  g.fillStyle = "#fffdf5"; g.fillRect(-14, -11, 28, 22); g.strokeStyle = "#333"; g.lineWidth = 1.2; g.strokeRect(-14, -11, 28, 22);
  g.fillStyle = "#c8000e"; g.beginPath(); g.arc(-10, -7, 1.6, 0, 6.283); g.arc(10, -7, 1.6, 0, 6.283); g.fill();
  txt(g, dorsal, 0, 9, { tam: 22, peso: 900, fam: FD, color: "#111" });
  g.restore();
  // la chapa de caparazón (casco)
  if (chapa) {
    g.save(); g.translate(cx - 2, cy - R + 2); g.rotate(-0.15);
    g.fillStyle = "#7a5400"; g.beginPath();
    for (let i = 0; i <= 36; i++) { const a = (i / 36) * 6.283, rr = i % 2 ? 19 : 21; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.42 + 2); }
    g.fill();
    const gg = g.createRadialGradient(-5, -3, 1, 0, 0, 19);
    gg.addColorStop(0, "#fff1a8"); gg.addColorStop(1, "#d99a00");
    g.fillStyle = gg; g.beginPath(); g.ellipse(0, -1, 17, 7, 0, 0, 6.283); g.fill();
    g.fillStyle = "#e3262f"; g.beginPath(); g.ellipse(0, -1, 7, 3, 0, 0, 6.283); g.fill();
    g.restore();
  }
  g.restore();
}

class CarreraCaracoles extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.gotas = [];
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  x(q, t) { return pista(t, q ? PM : PG); }
  poses(t = this.t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 140], manoI: [8, 142] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [66, 140], manoI: [8, 140], brazoIDelante: true };
    const r = [0, 0], giro = [0, 0];
    if (t > T_YA && t < T_META) {
      // animan como locos: botan, puños arriba y abajo, se inclinan hacia su caracol
      const ganaG = this.x(0, t) >= this.x(1, t);
      const f = 1 + tramo(t, 3, 6.5) * 0.8;
      for (const [q, P] of [[0, G], [1, M]]) {
        const fase = t * 9 * f + q * 1.3, s = Math.sin(fase);
        r[q] = -Math.abs(Math.sin(fase)) * 10 * f;
        const gana = q ? !ganaG : ganaG;
        P.cara = gana ? (Math.floor(t * 5) % 2 ? "risa" : "sorpresa") : "sorpresa";
        if (t > 5.3) P.cara = Math.floor(t * 6 + q) % 2 ? "risa" : "dormido";
        P.puntas = tramo(t, 3.4, 5.5);
        P.rc = (q ? -0.08 : 0.08) + 0.05 * s;
        giro[q] = (q ? -0.05 : 0.05) * tramo(t, 4, 5);
        if (q === 0) { P.manoD = [98, lerp(36, 70, (s + 1) / 2)]; P.manoI = [-18, lerp(70, 36, (s + 1) / 2)]; P.brazoIDelante = true; }
        else { P.manoI = [-14, lerp(36, 70, (s + 1) / 2)]; P.manoD = [90, lerp(70, 40, (s + 1) / 2)]; }
      }
    }
    if (t >= T_META) {
      const d = t - T_META;
      M.cara = d < 0.5 ? "sorpresa" : "risa"; G.cara = d < 0.5 ? "sorpresa" : d < 1.6 ? "borracho" : "sonrisa";
      M.puntas = 1 - tramo(d, 1.5, 2.2); G.puntas = 1 - tramo(d, 0.4, 1.0);
      if (d > 0.5) {
        const k = eBack(tramo(d, 0.5, 0.8));
        M.manoI = mezcla([8, 140], [-14, 30 + 5 * Math.sin(t * 10)], k); M.manoD = mezcla([66, 140], [92, 30 + 5 * Math.sin(t * 10 + 1)], k);
        r[1] = -Math.abs(Math.sin(d * 8)) * 18 * (1 - tramo(d, 2.4, 2.8));
        M.rc = 0.06 * Math.sin(d * 6);
        G.manoI = [28, 22]; G.brazoIDelante = true; G.rc = 0.12;
        if (d > 1.6) { // Guillermo, deportivo: aplaude
          const c = Math.abs(Math.sin(d * 14));
          G.manoI = [lerp(4, 28, c), 112]; G.manoD = [lerp(74, 52, c), 112]; G.rc = 0.04;
        }
      }
    }
    return [{ pose: G, m: matAv(XG, AY + r[0], ESC, giro[0]) }, { pose: M, m: matAv(XM, AY + r[1], ESC, giro[1]) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("ya", t > T_YA, () => { temblar(6, 0.15); });
    if (t > 3.4 && t < T_META + 0.5 && Math.random() < 14 * dt) {
      const e = this.poses(t), q = Math.random() < 0.5 ? 0 : 1, lado = Math.random() < 0.5 ? -1 : 1;
      const h = aPant(e[q].m, [(q ? 37 : 39) + lado * 30, 30]);
      this.gotas.push({ x: h[0], y: h[1], vx: lado * azar(50, 130), vy: azar(-200, -80), v: 0.8 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("meta", t > T_META, () => {
      temblar(12, 0.3);
      p.nueva(P.DESTELLO, META, 450, 0, 0, 0.35, 200);
    });
    this.una("tit", t > T_TIT, () => {
      temblar(18, 0.45);
      for (let k = 0; k < 100; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), k % 5);
    });
    p.suelo = () => 491;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  barra() {
    if (CT.has("barra")) return CT.get("barra");
    const c = lienzoNuevo(W + 120, H - BARRA + 70), g = c.getContext("2d");
    g.translate(60, -BARRA + 10);
    const gf = g.createLinearGradient(0, 494, 0, H);
    gf.addColorStop(0, "#5a3218"); gf.addColorStop(1, "#24130a");
    g.fillStyle = gf; g.fillRect(-60, 494, W + 120, H - 494 + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, 502, 3, H - 502);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 560, W + 120, 8); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 561, W + 120, 2);
    const gt = g.createLinearGradient(0, BARRA, 0, 494);
    gt.addColorStop(0, "#6e4020"); gt.addColorStop(1, "#9a5f2c");
    g.fillStyle = gt; g.fillRect(-60, BARRA, W + 120, 494 - BARRA);
    g.fillStyle = "rgba(255,220,170,.45)"; g.fillRect(-60, 491, W + 120, 3);
    g.fillStyle = "rgba(255,220,170,.2)"; g.fillRect(-60, BARRA, W + 120, 2);
    // calles de tiza, salida y meta
    g.strokeStyle = "rgba(245,245,240,.45)"; g.lineWidth = 2; g.setLineDash([10, 10]);
    g.beginPath(); g.moveTo(170, 462); g.lineTo(880, 462); g.stroke(); g.setLineDash([]);
    g.fillStyle = "rgba(245,245,240,.7)"; g.fillRect(248, BARRA + 2, 4, 494 - BARRA - 4);
    for (let i = 0; i < 10; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? "rgba(245,245,240,.9)" : "rgba(20,20,20,.8)"; g.fillRect(META + j * 7, BARRA + 2 + i * 8.8, 7, 8.8); }
    CT.set("barra", c);
    return c;
  }
  /** Banderín de meta y guirnalda de banderitas (la gran final). */
  decorado(g, t) {
    // guirnalda
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-20, 20); g.quadraticCurveTo(512, 90, W + 20, 20); g.stroke();
    for (let i = 0; i < 18; i++) {
      const u = (i + 0.5) / 18, x = lerp(-20, W + 20, u), y = 20 + 140 * u * (1 - u);
      g.fillStyle = CONFETI[i % 5];
      g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x + 12, y); g.lineTo(x, y + 24 + 2 * Math.sin(t * 3 + i)); g.closePath(); g.fill();
    }
    // poste de meta
    g.fillStyle = "#ddd"; g.fillRect(META + 22, 330, 5, 80);
    g.fillStyle = "#e3262f"; g.beginPath(); g.moveTo(META + 27, 332); g.lineTo(META + 62 + 4 * Math.sin(t * 5), 344); g.lineTo(META + 27, 356); g.closePath(); g.fill();
  }
  /** Lupa sobre la meta: el morro de Marcos va 1 mm por delante. */
  lupa(g, t, a) {
    const d = t - T_META - 0.15;
    if (d < 0) return;
    const k = eBack(tramo(d, 0, 0.3)), R = 112, C = [512, 286];
    g.save(); g.globalAlpha = a; g.translate(C[0], C[1]); g.scale(k, k);
    // mango
    g.save(); g.rotate(0.7); g.fillStyle = "#3a2410"; rectR(g, R - 4, -14, 110, 28, 12); g.fill(); g.restore();
    g.save();
    g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.clip();
    g.fillStyle = "#3a2010"; g.fillRect(-R, -R, 2 * R, 2 * R);
    const Z = 1.55;
    g.scale(Z, Z); g.translate(-META + 10, -440);
    g.drawImage(this.barra(), -60, BARRA - 10);
    caracol(g, this.x(0, T_META), CALLE[0].y, CALLE[0].s, 0, "1", false, t);
    caracol(g, this.x(1, T_META), CALLE[1].y, CALLE[1].s, 0, "2", true, t);
    g.restore();
    g.lineWidth = 12; g.strokeStyle = "#c9a14a"; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.stroke();
    g.lineWidth = 3; g.strokeStyle = "#fff3c0"; g.beginPath(); g.arc(0, 0, R - 5, -2.6, -1.6); g.stroke();
    g.restore();
    // la marca de 1 mm
    if (d > 0.35) {
      const kk = eBack(tramo(d, 0.35, 0.55));
      g.save(); g.translate(C[0] + 30, C[1] + R - 2); g.scale(kk, kk); g.rotate(-0.05);
      txt(g, "¡POR 1 mm!", 0, 0, { tam: 36, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 7, esp: 2, alfa: a });
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, BARRA, 380, 0.85);
    this.decorado(g, t);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.drawImage(this.barra(), -60, BARRA - 10);
    for (const q of [0, 1]) {
      const C = CALLE[q], x = this.x(q, t), mueve = t > T_YA && t < T_META + 0.5;
      caracol(g, x, C.y, C.s, mueve ? Math.sin(t * 7 + q * 2) : 0, q ? "2" : "1", q === 1, t);
    }
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    g.restore();
    this.p.dibujar(g);
    // ¡YA!
    if (t > T_YA - 0.1 && t < T_YA + 0.6) {
      const k = eBack(tramo(t, T_YA - 0.1, T_YA + 0.05));
      g.save(); g.translate(250, 380); g.rotate(-0.1); g.scale(k, k);
      txt(g, "¡YA!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 10, esp: 3, alfa: a * (1 - tramo(t, T_YA + 0.4, T_YA + 0.6)) });
      g.restore();
    }
    // ¡VAMOS, CAMPEÓN! a gritos
    for (const [t0, t1, q] of GRITOS) {
      if (t < t0 || t > t1) continue;
      const m = aPant(e[q].m, [q ? 37 : 39, 34]), bx = q ? 760 : 268;
      const pul = 1 + 0.04 * Math.abs(Math.sin(t * 10));
      g.save(); g.globalAlpha = a * (1 - tramo(t, t1 - 0.12, t1));
      g.translate(bx, 168); g.scale(pul, pul); g.rotate(q ? 0.03 : -0.03); g.translate(-bx, -168);
      bocadillo(g, bx, 168, "¡VAMOS, CAMPEÓN!", m[0] + (q ? 10 : -10), m[1] - 40, tramo(t, t0, t0 + 0.25), 42);
      g.restore();
    }
    this.lupa(g, t, a);
    // ¡VAMOS, CAMPEÓN! (Marcos gana)
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(512, 96); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(900, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 140);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡VAMOS, CAMPEÓN!", 450, 128, { tam: 108, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 3, glow: "rgba(255,190,40,.85)", glowTam: 22, max: 860 });
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00164", nombre: "Carrera de caracoles", crear: () => new CarreraCaracoles() });
})();
