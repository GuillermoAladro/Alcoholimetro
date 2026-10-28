"use strict";
/*
 * 00092 · LA SIESTA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco. Bosteza, se estira y se queda dormido de pie (ZZZ…, pompa en la nariz). En una nube sueña que
 * está el primero del TOP 10: sube al podio y le cae una corona entre confeti. La pompa revienta (¡PLOP!) y se
 * despierta de golpe: la nube estalla, mira a un lado y a otro… y se vuelve a dormir para seguir soñando.
 */
(() => {
const X = 300, ESC = 1.6;
const NX = 712, NY = 222, NW = 470, NH = 300; // la nube del sueño

/** Círculos que forman la nube (relativos a su centro). */
function bolasNube() {
  const b = [], n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283;
    b.push([Math.cos(a) * NW * 0.38, Math.sin(a) * NH * 0.33, NH * (0.2 + 0.05 * (i % 3))]);
  }
  b.push([0, 0, NH * 0.4], [-NW * 0.18, 0, NH * 0.36], [NW * 0.18, 0, NH * 0.36]);
  return b;
}
const BOLAS = bolasNube();
const rutaNube = (g) => { g.beginPath(); for (const [x, y, r] of BOLAS) { g.moveTo(x + r, y); g.arc(x, y, r, 0, 6.283); } };

class EscenaSiesta extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(300);     // fuera del sueño
    this.pS = new Parts(220);    // dentro del sueño (confeti)
    this.pS.suelo = () => NY + 124;
    this.zetas = [];
    this.nubeRota = false;
  }
  luz() {
    const t = this.t;
    const on = t < 0.75 ? [0, 1, 0, 0, 1, 0.35, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    return on * (1 - tramo(t, 8.9, 9.6));
  }
  dormido(t) { return (t > 1.95 && t < 6.3) || t > 7.85; }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, y = PIES, giro = 0;
    // bostezo y estiramiento
    const kEst = eInOut(tramo(t, 0.85, 1.25)) * (1 - eInOut(tramo(t, 1.5, 1.9)));
    if (kEst > 0) {
      manoD = mezcla(manoD, [82, -14], kEst); manoI = mezcla(manoI, [-4, -14], kEst);
      sy = 1 + 0.04 * kEst; pose.cara = "sorpresa"; pose.rc = -0.08 * kEst;
    }
    if (t > 1.9 && t < 1.95) pose.cara = "borracho";
    // dormido de pie: cabeza ladeada, se balancea y respira
    if (this.dormido(t)) {
      pose.cara = "dormido";
      const k = eInOut(tramo(t, 1.95, 2.6));
      pose.rc = 0.2 * k + 0.04 * Math.sin(t * 1.3);
      giro = 0.035 * Math.sin(t * 1.1) * k;
      sy = 1 + 0.012 * Math.sin(t * 2.6);
      manoD = mezcla([70, 158], [72, 162], k); manoI = mezcla([9, 160], [7, 162], k);
    }
    // ¡se despierta de golpe!
    if (t >= 6.3 && t < 7.85) {
      const kSalto = Math.sin(Math.PI * tramo(t, 6.3, 6.62));
      y = PIES - 46 * kSalto;
      pose.cara = "sorpresa";
      const kBr = eBack(tramo(t, 6.3, 6.45)) * (1 - eInOut(tramo(t, 6.75, 7.05)));
      manoD = mezcla([70, 158], [108, 70], kBr); manoI = mezcla([9, 160], [-30, 70], kBr);
      pose.piernaI = [-14 * kSalto, 0.12 * kSalto]; pose.piernaD = [-14 * kSalto, -0.12 * kSalto];
      sx = 1 - 0.05 * kSalto; sy = 1 + 0.08 * kSalto;
      // mira a un lado y a otro
      if (t > 6.75) pose.rc = 0.26 * Math.sin((t - 6.75) * 6.5) * (1 - tramo(t, 7.4, 7.6));
      if (t > 7.45) pose.cara = "borracho";
    }
    // vuelve a dormirse con las manos de almohada
    if (t >= 7.6) {
      const k = eInOut(tramo(t, 7.6, 8.0));
      manoD = mezcla([70, 158], [64, 58], k); manoI = mezcla([9, 160], [56, 66], k);
      if (k > 0.3) pose.brazoIDelante = true;
      pose.rc = 0.24 * k + 0.03 * Math.sin(t * 1.3);
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(X, y, ESC, giro, sx, sy), y };
  }
  pompa(t) {
    if (t < 2.3 || t >= 6.3) return 0;
    const crece = tramo(t, 2.3, 6.2);
    return (4 + 13 * crece) * (0.55 + 0.45 * Math.sin((t - 2.3) * 2.6 - 1.2));
  }
  sueno(t) { return t < 2.7 ? 0 : t < 6.3 ? tramo(t, 2.7, 3.05) : 0; }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, pS = this.pS;
    const e = this.estado();
    // zetas que salen de la cabeza
    const quiereZ = (t > 2.1 && t < 6.2) || (t > 8.05 && t < 8.9);
    if (quiereZ && (!this.ultZ || t - this.ultZ > 0.62)) {
      this.ultZ = t;
      const q = aPant(e.m, [20, 10]);
      this.zetas.push({ x: q[0], y: q[1], t0: t, rot: azar(-0.4, 0.1) });
    }
    this.zetas = this.zetas.filter((z) => t - z.t0 < 1.8);
    // el sueño: corona y confeti
    this.una("corona", t > 4.2, () => {
      for (let i = 0; i < 70; i++) pS.nueva(P.CONFETI, NX + azar(-200, 200), NY - azar(110, 170), azar(-60, 60), azar(10, 90), azar(4, 5), azar(7, 12), (Math.random() * 5) | 0);
      for (let i = 0; i < 18; i++) { const a = azar(-Math.PI, 0), v = azar(120, 320); pS.nueva(P.CHISPA, NX + 6, NY - 50, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11)); }
    });
    if (t > 4.4 && t < 6.2 && Math.random() < 14 * dt) pS.nueva(P.CONFETI, NX + azar(-200, 200), NY - 150, azar(-30, 30), azar(30, 80), 4, azar(7, 12), (Math.random() * 5) | 0);
    // ¡PLOP!: revienta la pompa y la nube
    this.una("plop", t > 6.3, () => {
      temblar(18, 0.45); this.nubeRota = true; this.zetas = [];
      const q = aPant(e.m, [46, 50]);
      for (let i = 0; i < 12; i++) { const a = azar(0, 6.283), v = azar(80, 220); p.nueva(P.ESPUMA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.45), azar(2, 4)); }
      for (const [bx, by, br] of BOLAS) {
        for (let i = 0; i < 3; i++) p.nueva(P.VAPOR, NX + bx + azar(-br, br) * 0.5, NY + by + azar(-br, br) * 0.5, bx * azar(1, 2.5), by * azar(1, 2.5), azar(0.5, 0.9), br * 1.2);
        p.nueva(P.PURPURINA, NX + bx, NY + by, azar(-60, 60), azar(-80, 20), azar(0.8, 1.3), azar(8, 14));
      }
      for (let i = 0; i < 24; i++) p.nueva(P.PURPURINA, NX + azar(-200, 200), NY + azar(-120, 120), azar(-120, 120), azar(-160, 40), azar(0.8, 1.4), azar(8, 14));
    });
    this.una("otraVez", t > 8.05, () => temblar(6, 0.2));
    p.actualizar(dt); pS.actualizar(dt);
  }
  dibujarSueno(g, t, k) {
    const s = eBack(k);
    g.save(); g.translate(NX, NY); g.scale(s, s);
    // contorno de la nube y bolitas hasta la cabeza
    g.strokeStyle = "#cdb8ff"; g.lineWidth = 10;
    for (const [x, y, r] of BOLAS) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); }
    g.restore();
    const e = this.estado(), q = aPant(e.m, [62, 10]);
    const dx = NX - NW * 0.33 - q[0], dy = NY + NH * 0.12 - q[1];
    for (const [f, r] of [[0.22, 8], [0.48, 13], [0.75, 19]]) {
      const kk = tramo(k, f * 0.6, f * 0.6 + 0.3);
      if (kk <= 0) continue;
      g.fillStyle = "#2a1d4a"; g.strokeStyle = "#cdb8ff"; g.lineWidth = 4;
      g.beginPath(); g.arc(q[0] + dx * f, q[1] + dy * f + 6 * Math.sin(t * 3 + f * 6), r * eBack(kk), 0, 6.283); g.fill(); g.stroke();
    }
    g.save(); g.translate(NX, NY); g.scale(s, s);
    rutaNube(g); g.save(); g.clip();
    const gr = g.createRadialGradient(0, -20, 20, 0, 0, NW * 0.6);
    gr.addColorStop(0, "#5b3aa6"); gr.addColorStop(1, "#1b1238");
    g.fillStyle = gr; g.fillRect(-NW, -NH, NW * 2, NH * 2);
    // estrellitas del sueño
    for (let i = 0; i < 14; i++) brillo(g, -NW * 0.42 + ((i * 97) % (NW * 0.84)), -NH * 0.4 + ((i * 53) % (NH * 0.5)), 6 + 4 * Math.abs(Math.sin(t * 3 + i)), 0.7);
    g.translate(-NX, -NY);
    // podio
    const kPod = eOut(tramo(t, 3.05, 3.5)), dy0 = (1 - kPod) * 160;
    for (const [bx, h, n, c0, c1] of [[NX - 128, 40, "2", "#f4f7fa", "#8d969f"], [NX + 48, 30, "3", "#f1b07c", "#8a4f22"], [NX - 42, 56, "1", "#ffe27a", "#b07d00"]]) {
      const yb = NY + 124 - h + dy0, w = 84;
      const gp = g.createLinearGradient(0, yb, 0, yb + h);
      gp.addColorStop(0, c0); gp.addColorStop(1, c1);
      g.fillStyle = gp; g.fillRect(bx, yb, w, h + 60);
      txt(g, n, bx + w / 2, yb + Math.min(h - 6, 44), { tam: n === "1" ? 44 : 32, peso: 900, fam: FD, color: "rgba(40,24,0,.75)" });
    }
    // él, en el número 1, con trofeo
    const mS = matAv(NX, NY + 124 - 56 + dy0, 0.74);
    const kCor = tramo(t, 3.7, 4.2);
    const feliz = t > 4.2;
    const pose = {
      cara: feliz ? (Math.floor(t * 2.4) % 2 ? "risa" : "guino") : "sonrisa", rc: 0.04 * Math.sin(t * 4), oro: feliz ? 1 : 0,
      manoI: feliz ? [-6, 30 + 4 * Math.sin(t * 7)] : [9, 160], manoD: feliz ? [116, 40 + 4 * Math.sin(t * 6)] : [70, 158],
    };
    if (feliz) pose.objI = (gg, m) => dibujarTrofeo(gg, m[0] + 1, m[1] + 2, -0.08, t);
    pintarAvatar(g, mS, pose, t);
    // la corona baja del cielo y se le posa en la cabeza
    if (kCor > 0) {
      const yc = lerp(-160, 6, eOut(kCor)) + (kCor >= 1 ? -2 * Math.abs(Math.sin((t - 4.2) * 9)) * Math.exp(-(t - 4.2) * 4) : 0);
      conMat(g, mS, () => { g.translate(39, yc); g.rotate(0.1 * (1 - kCor)); corona(g, 52); });
      if (kCor >= 1) { const qc = aPant(mS, [39, -14]); brillo(g, qc[0] + 18, qc[1] - 10, 14 + 6 * Math.sin(t * 8), 0.9); }
    }
    // pegatina TOP 10
    if (t > 4.45) {
      const kk = eBack(tramo(t, 4.45, 4.75)), peg = pegatinaTop10();
      g.save(); g.translate(NX + 140, NY - 40); g.rotate(0.12); g.scale(0.62 * kk, 0.62 * kk);
      g.drawImage(peg, -peg.width / 2, -peg.height / 2); g.restore();
      g.save(); g.translate(NX - 140, NY - 30); g.rotate(-0.12); g.scale(kk, kk);
      txt(g, "Nº 1", 0, 0, { tam: 50, peso: 900, fam: FD, color: "#ffd34d", borde: "#3a2200", bordeAncho: 7, esp: 2 });
      g.restore();
    }
    this.pS.dibujar(g);
    g.restore();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    foco(g, X, X, PIES, 170, luz);
    // el sueño
    const kS = this.sueno(t);
    if (kS > 0) this.dibujarSueno(g, t, kS);
    pintarAvatar(g, e.m, e.pose, t);
    // pompa en la nariz
    const r = this.pompa(t);
    if (r > 0.5) {
      const rc = e.pose.rc, o = rot2([1 + r * 0.7, -24 + r * 0.3], rc);
      const q = aPant(e.m, [RIG.cuello[0] + o[0], RIG.cuello[1] + o[1]]), R = r * ESC;
      g.save();
      g.fillStyle = "rgba(190,235,255,.28)"; g.strokeStyle = "rgba(225,248,255,.85)"; g.lineWidth = 2;
      g.beginPath(); g.arc(q[0], q[1], R, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.ellipse(q[0] - R * 0.35, q[1] - R * 0.4, R * 0.22, R * 0.14, -0.6, 0, 6.283); g.fill();
      g.restore();
    }
    this.p.dibujar(g);
    // zetas
    for (const z of this.zetas) {
      const u = (t - z.t0) / 1.8;
      const x = z.x + 40 * u + 14 * Math.sin(u * 9), y = z.y - 190 * u;
      g.save(); g.translate(x, y); g.rotate(z.rot); const s = 0.5 + 0.9 * u; g.scale(s, s);
      txt(g, "Z", 0, 0, { tam: 54, peso: 400, fam: FC, color: "#f1e9ff", borde: "#3d2385", bordeAncho: 7, alfa: Math.min(1, u * 5) * (1 - tramo(u, 0.7, 1)) });
      g.restore();
    }
    // ZZZ…
    const kT = Math.max(tramo(t, 2.3, 2.5) * (1 - tramo(t, 6.25, 6.4)), tramo(t, 8.05, 8.25) * (1 - tramo(t, 9.0, 9.5)));
    if (kT > 0) {
      const t0 = t < 7 ? 2.3 : 8.05, s = eBack(tramo(t, t0, t0 + 0.3));
      g.save(); g.translate(160, 96 + 4 * Math.sin(t * 2.2)); g.rotate(-0.12); g.scale(s, s);
      txt(g, "ZZZ…", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#f1e9ff", borde: "#3d2385", bordeAncho: 11, alfa: kT, esp: 6 });
      g.restore();
    }
    // ¡PLOP!
    if (t > 6.3 && t < 7.2) {
      const q = aPant(e.m, [60, 40]), k = tramo(t, 6.3, 6.42);
      g.save(); g.translate(q[0] + 110, q[1] - 70); g.rotate(-0.12); g.scale(eBack(k) * 1.1, eBack(k) * 1.1);
      txt(g, "¡PLOP!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#ffffff", borde: "#1d6fa8", bordeAncho: 9, alfa: 1 - tramo(t, 6.95, 7.2), esp: 2 });
      g.restore();
    }
    // empieza a oscuras
    if (t < 0.75 && luz < 1) { g.fillStyle = `rgba(0,0,0,${0.97 * (1 - luz)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const aFin = tramo(t, 9.2, 9.75);
    if (aFin > 0) { g.fillStyle = `rgba(0,0,0,${aFin})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00092", nombre: "La siesta", crear: () => new EscenaSiesta() });
})();
