"use strict";
/*
 * 00001 · LA CAÑA PERFECTA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la lámpara de la barra y baja un grifo de cerveza del techo. Inclina la jarra y la llena despacio
 * (la cámara se acerca); la va enderezando y la espuma sube justo hasta el borde. Medidor ESPUMA: 2 DEDOS ✓, cinco
 * estrellas, brinda mirando a cámara: ¡TIRADA PERFECTA! La lámpara se apaga.
 */
(() => {
const X = 400, ESC = 1.5;
const MANO = [86, 116];            // mano mientras tira la caña (unidades de avatar)
const CANO = [MANO[0] + 21, MANO[1] - 64]; // boca del grifo (unidades de avatar)
const JW = 30, JH = 44;            // la jarra: cuerpo de 30 × 44, el asa en la mano
const T_ABRE = 2.0, T_CIERRA = 5.3;

/** Jarra grande en unidades de avatar. nivel = cerveza (0–1 del fondo al borde), esp = espuma (unidades). */
function jarraCana(g, mano, inc, nivel, esp, s, parte, t, chorro) {
  g.save(); g.translate(mano[0], mano[1]); g.rotate(inc); g.scale(s, s);
  if (parte === "asa") {
    g.strokeStyle = "rgba(225,240,255,.9)"; g.lineWidth = 4.2;
    g.beginPath(); g.moveTo(5, -13); g.bezierCurveTo(-10, -14, -10, 13, 5, 12); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(4, -11); g.bezierCurveTo(-7, -12, -7, 10, 4, 10); g.stroke();
    g.restore(); return;
  }
  const x0 = 4, y0 = -JH / 2;
  rectR(g, x0, y0, JW, JH, 4.5); g.fillStyle = "rgba(200,225,255,.16)"; g.fill();
  // superficie horizontal aunque la jarra esté inclinada
  const c = Math.cos(inc), sn = Math.sin(inc);
  const wy = (p) => (p[0] * sn + p[1] * c) * s;
  const yFondo = Math.max(wy([x0, -y0]), wy([x0 + JW, -y0]));
  const yBorde = Math.max(wy([x0, y0]), wy([x0 + JW, y0]));
  const yS = lerp(yFondo, yBorde, nivel), yE = yS - esp * s;
  g.save();
  rectR(g, x0, y0, JW, JH, 4.5); g.clip();
  g.scale(1 / s, 1 / s); g.rotate(-inc);
  if (nivel > 0.005) {
    const gr = g.createLinearGradient(0, yFondo, 0, yS);
    gr.addColorStop(0, "#b85d00"); gr.addColorStop(1, "#ffc928");
    g.fillStyle = gr; g.fillRect(-80, yS, 160, 120);
    g.fillStyle = "rgba(255,248,210,.75)";
    for (let i = 0; i < 9; i++) {
      const by = yFondo - ((t * 26 + i * 7.7) % Math.max(3, yFondo - yS));
      g.beginPath(); g.arc(-12 + ((i * 9.3) % 52), by, 0.9, 0, 6.283); g.fill();
    }
  }
  if (esp > 0.3) {
    const ge = g.createLinearGradient(0, yE, 0, yS);
    ge.addColorStop(0, "#fffdf4"); ge.addColorStop(1, "#f1e3b8");
    g.fillStyle = ge; g.fillRect(-80, yE, 160, yS - yE + 0.5);
  }
  g.restore();
  // chorro (de la boca del grifo a la espuma)
  if (chorro) {
    g.save(); g.rotate(-inc); g.scale(1 / s, 1 / s);
    const [cx, cy, a] = chorro, ancho = 3.6 * a;
    const gc = g.createLinearGradient(cx - ancho, 0, cx + ancho, 0);
    gc.addColorStop(0, "#d17a00"); gc.addColorStop(0.5, "#ffe27a"); gc.addColorStop(1, "#c46a00");
    g.fillStyle = gc;
    g.beginPath(); g.moveTo(cx - ancho * 0.8, cy);
    for (let y = cy; y < yE; y += 4) g.lineTo(cx - ancho + 0.5 * Math.sin(y * 0.6 + t * 30), y);
    g.lineTo(cx - ancho, yE); g.lineTo(cx + ancho, yE);
    for (let y = yE; y > cy; y -= 4) g.lineTo(cx + ancho + 0.5 * Math.sin(y * 0.6 + t * 30 + 1), y);
    g.lineTo(cx + ancho * 0.8, cy); g.closePath(); g.fill();
    g.restore();
  }
  // cristal
  rectR(g, x0, y0, JW, JH, 4.5);
  g.strokeStyle = "rgba(235,246,255,.95)"; g.lineWidth = 1.8; g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(x0 + 3.5, y0 + 4, 2.6, JH - 8);
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(x0 + JW - 6, y0 + 6, 1.6, JH - 14);
  g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1.2;
  g.beginPath(); g.ellipse(x0 + JW / 2, y0, JW / 2, 1.6, 0, 0, 6.283); g.stroke();
  // espuma justo en el borde: corona de burbujas
  if (Math.abs(inc) < 0.03 && yE <= yBorde + 0.6 && esp > 3) {
    g.fillStyle = "#fffdf4";
    g.beginPath(); g.moveTo(x0 + 0.5, y0 + 1.5);
    for (let i = 0; i <= 5; i++) g.arc(x0 + 1 + (i * (JW - 2)) / 5, y0 - 0.2 - (i % 2) * 0.7, 2.6 + (i % 2) * 0.6, Math.PI, 0);
    g.lineTo(x0 + JW - 0.5, y0 + 1.5); g.closePath(); g.fill();
  }
  g.restore();
}

class EscenaCana extends Escena {
  constructor() {
    super(10.4);
    this.p = new Parts(300);
    this.estrellas = [];
  }
  luz() {
    const t = this.t;
    const parp = t < 0.7 ? [0, 1, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    return parp * (1 - tramo(t, 9.3, 10.1));
  }
  /** Bajada del grifo (desplazamiento vertical en px). */
  grifoDy() { const t = this.t; return -620 * (1 - eBack(tramo(t, 0.55, 1.35))) - 640 * eIn(tramo(t, 6.0, 6.7)); }
  datos() {
    const t = this.t;
    let inc = 0, nivel = 0, esp = 0, s = 1;
    const kInc = eInOut(tramo(t, 1.25, 1.75)) * (1 - eInOut(tramo(t, 3.4, 5.0)));
    inc = 0.6 * kInc;
    const kL = tramo(t, T_ABRE + 0.12, T_CIERRA);
    nivel = 0.8 * (0.6 * eOut(kL) + 0.4 * eInOut(kL));
    esp = t < T_ABRE + 0.12 ? 0 : 2 + 7 * eInOut(tramo(t, 3.8, T_CIERRA));
    // brindis: la acerca a cámara
    s = 1 + 0.35 * eOut(tramo(t, 7.15, 7.6)) * (1 - eInOut(tramo(t, 9.0, 9.6)));
    return { inc, nivel, esp, s };
  }
  camara() {
    const t = this.t, k = eInOut(tramo(t, 1.7, 2.6)) * (1 - eInOut(tramo(t, 5.95, 6.6)));
    const c = aPant(matAv(X, PIES, ESC), [MANO[0] + 16, MANO[1] - 30]);
    return { Z: lerp(1, 1.5, k), cx: lerp(W / 2, c[0], k), cy: lerp(H / 2, c[1], k) };
  }
  estado() {
    const t = this.t, d = this.datos();
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 162];
    manoD = mezcla(manoD, MANO, eInOut(tramo(t, 1.0, 1.55)));
    if (t > 1.2 && t < 5.7) { pose.rc = 0.12 * eInOut(tramo(t, 1.2, 1.6)) * (1 - eInOut(tramo(t, 5.3, 5.7))); }
    if (t > 0.6 && t < 1.3) pose.cara = "sorpresa";
    if (t > 4.6 && t < 5.4) pose.cara = "sorpresa"; // ¡que no se salga!
    if (t >= 5.4 && t < 6.1) pose.cara = "risa";
    // brindis mirando a cámara
    const kB = eOut(tramo(t, 6.9, 7.45)) * (1 - eInOut(tramo(t, 9.0, 9.6)));
    manoD = mezcla(manoD, [82, 56], kB);
    if (t >= 6.9) pose.cara = t < 7.5 ? "risa" : t < 9.0 ? "guino" : "sonrisa";
    if (kB > 0) pose.rc = -0.06 * kB;
    pose.manoD = manoD;
    pose.manoI = t > 6.9 && t < 9.2 ? mezcla([9, 160], [-6, 140], eInOut(tramo(t, 6.9, 7.3))) : [9, 160];
    const chorroA = tramo(t, T_ABRE, T_ABRE + 0.12) * (1 - tramo(t, T_CIERRA - 0.05, T_CIERRA + 0.05));
    const chorro = chorroA > 0 ? [CANO[0] - MANO[0], CANO[1] - MANO[1], chorroA] : null;
    pose.objD = (g, m) => jarraCana(g, m, d.inc, d.nivel, d.esp, d.s, "asa", t);
    pose.objD2 = (g, m) => jarraCana(g, m, d.inc, d.nivel, d.esp, d.s, "cuerpo", t, chorro);
    const m = matAv(X, PIES, ESC);
    return { pose, m, d };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("grifo", t > 1.3, () => temblar(5, 0.2));
    // gotita al cerrar
    this.una("gota", t > T_CIERRA + 0.08, () => { this.gota = t; });
    // medidor
    this.una("medidor", t > 5.5, () => { temblar(4, 0.15); });
    // estrellas
    for (let i = 0; i < 5; i++) this.una("est" + i, t > 6.15 + i * 0.16, () => {
      const x = W / 2 - 220 + i * 110, y = 168;
      this.estrellas.push({ x, y, t0: t });
      for (let k = 0; k < 10; k++) { const a = azar(0, 6.283), v = azar(120, 300); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
      temblar(3 + i, 0.12);
    });
    this.una("brinda", t > 7.45, () => {
      temblar(10, 0.3);
      const q = aPant(e.m, [82 + 20, 56 - 26]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.45, 120);
      for (let k = 0; k < 12; k++) p.nueva(P.ESPUMA, q[0] + azar(-20, 20), q[1], azar(-120, 120), azar(-260, -80), azar(0.4, 0.8), azar(3, 6));
    });
    if (t > 7.6 && t < 9.0 && Math.random() < 20 * dt) p.nueva(P.PURPURINA, azar(150, 870), azar(-10, 60), azar(-20, 20), azar(30, 70), azar(1, 1.6), azar(6, 11));
    p.actualizar(dt);
  }
  dibujarGrifo(g, dy, t) {
    const q = aPant(matAv(X, PIES, ESC), CANO), x = q[0], y = q[1] + dy;
    g.save(); g.translate(x, y);
    // tubo del techo
    const gt = g.createLinearGradient(-10, 0, 10, 0);
    gt.addColorStop(0, "#5d646d"); gt.addColorStop(0.45, "#f3f6f8"); gt.addColorStop(1, "#4b525a");
    g.fillStyle = gt; g.fillRect(14, -700, 18, 640);
    // cuerpo cromado
    const gc = g.createLinearGradient(0, -78, 0, -40);
    gc.addColorStop(0, "#f7f9fb"); gc.addColorStop(0.5, "#aeb7c0"); gc.addColorStop(1, "#59616a");
    g.fillStyle = gc; rectR(g, -14, -78, 62, 34, 12); g.fill();
    // caño curvo hacia abajo
    g.strokeStyle = gt; g.lineWidth = 14; g.lineCap = "round";
    g.beginPath(); g.moveTo(-6, -58); g.quadraticCurveTo(-2, -58, 0, -10); g.stroke();
    g.fillStyle = "#3a4048"; g.beginPath(); g.ellipse(0, -4, 7, 3, 0, 0, 6.283); g.fill();
    // tirador: se inclina al abrir
    const abre = eOut(tramo(t, T_ABRE - 0.2, T_ABRE)) * (1 - eOut(tramo(t, T_CIERRA - 0.15, T_CIERRA)));
    g.save(); g.translate(17, -78); g.rotate(-0.55 * abre);
    g.fillStyle = "#aeb7c0"; g.fillRect(-4, -12, 8, 14);
    const gh = g.createLinearGradient(-9, 0, 9, 0);
    gh.addColorStop(0, "#0a0a0c"); gh.addColorStop(0.4, "#3a3a40"); gh.addColorStop(1, "#050506");
    g.fillStyle = gh; rectR(g, -9, -92, 18, 82, 8); g.fill();
    g.fillStyle = "#ffd34d"; rectR(g, -7, -84, 14, 26, 4); g.fill();
    g.fillStyle = "#7a5200"; g.font = `900 13px ${FD}`; g.textAlign = "center"; g.fillText("★", 0, -66);
    g.restore();
    g.restore();
  }
  dibujarMedidor(g, t, e) {
    const k = tramo(t, 5.5, 5.7), a = 1 - tramo(t, 6.0, 6.35);
    if (k <= 0 || a <= 0) return;
    // marca de la espuma junto a la jarra (en coordenadas de mundo)
    const top = aPant(e.m, [MANO[0] + 4 + JW + 5, MANO[1] - JH / 2]), bot = aPant(e.m, [MANO[0] + 4 + JW + 5, MANO[1] - JH / 2 + e.d.esp]);
    g.save(); g.globalAlpha = a;
    g.strokeStyle = "#2bff5b"; g.lineWidth = 3; g.shadowColor = "rgba(43,255,91,.8)"; g.shadowBlur = 8;
    g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(top[0] + 10, top[1]); g.lineTo(top[0] + 10, bot[1]); g.lineTo(bot[0], bot[1]); g.stroke();
    g.shadowBlur = 0; g.shadowColor = "transparent";
    const cx = top[0] + 22, cy = (top[1] + bot[1]) / 2;
    g.translate(cx, cy); g.scale(eBack(k), eBack(k));
    rectR(g, 0, -24, 236, 48, 11); g.fillStyle = "rgba(4,24,10,.92)"; g.fill();
    g.strokeStyle = "#2bff5b"; g.lineWidth = 2.5; g.stroke();
    txt(g, "ESPUMA: 2 DEDOS", 13, 10, { tam: 29, peso: 900, fam: FD, color: "#d9ffe3", alin: "left", esp: 1, max: 170 });
    // ✓
    g.strokeStyle = "#2bff5b"; g.lineWidth = 6; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(196, 0); g.lineTo(205, 10); g.lineTo(222, -12); g.stroke();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), cam = this.camara(), luz = this.luz();
    fondo(g, "#000");
    g.save();
    g.translate(W / 2, H / 2); g.scale(cam.Z, cam.Z); g.translate(-cam.cx, -cam.cy);
    // lámpara de la barra
    foco(g, X + 40, X + 40, PIES, 230, luz);
    g.save(); g.globalAlpha = luz;
    const gs = g.createLinearGradient(0, PIES - 4, 0, H);
    gs.addColorStop(0, "#1b1712"); gs.addColorStop(1, "#060505");
    g.fillStyle = gs; g.fillRect(-60, PIES - 2, W + 120, H - PIES + 62);
    g.restore();
    const dy = this.grifoDy();
    if (dy > -600) this.dibujarGrifo(g, dy, t);
    pintarAvatar(g, e.m, e.pose, t);
    // gotita final
    if (this.gota && t - this.gota < 0.4) {
      const q = aPant(e.m, CANO), s = t - this.gota;
      g.fillStyle = "#ffc21f"; g.beginPath(); g.ellipse(q[0], q[1] + 4 + 500 * s * s, 2.6, 4, 0, 0, 6.283); g.fill();
    }
    this.dibujarMedidor(g, t, e);
    g.restore();
    this.p.dibujar(g);
    // cinco estrellas
    for (const s of this.estrellas) {
      const k = tramo(t, s.t0, s.t0 + 0.3), a = 1 - tramo(t, 9.2, 9.8);
      g.save(); g.translate(s.x, s.y); g.rotate((1 - eBack(k)) * 2); g.scale(eBack(k), eBack(k)); g.globalAlpha = a;
      const gr = g.createLinearGradient(0, -34, 0, 30);
      gr.addColorStop(0, "#fff6b0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#d48a00");
      g.shadowColor = "rgba(255,200,40,.8)"; g.shadowBlur = 16;
      estrella(g, 0, 0, 38, 16, 0); g.fillStyle = gr; g.fill();
      g.shadowBlur = 0; g.shadowColor = "transparent";
      g.strokeStyle = "#7a4a00"; g.lineWidth = 3; g.stroke();
      g.restore();
    }
    // ¡TIRADA PERFECTA!
    if (t > 7.4) {
      const k = tramo(t, 7.4, 7.6), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 4) * (1 - tramo(t, 9.2, 9.8));
      g.save(); g.translate(W / 2, 92); g.scale(s, s);
      const gr = g.createLinearGradient(0, -70, 0, 10);
      gr.addColorStop(0, "#fff9c8"); gr.addColorStop(0.55, "#ffcf2e"); gr.addColorStop(1, "#ff9a00");
      txt(g, "TIRADA PERFECTA", 0, 0, { tam: 96, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 9, alfa: a, esp: 3, glow: "rgba(255,190,40,.75)", glowTam: 22, max: 960 });
      g.restore();
      if (k >= 1 && t < 8.6) {
        const u = tramo(t, 7.7, 8.4);
        brillo(g, lerp(150, 880, u), 70 + 20 * Math.sin(u * 6), 26, Math.sin(u * Math.PI) * a);
      }
    }
    // empieza a oscuras (la lámpara se enciende con parpadeo) y acaba a oscuras
    const negro = Math.max(t < 0.7 ? 0.97 * (1 - luz) : 0, tramo(t, 9.6, 10.35));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00001", nombre: "La caña perfecta", crear: () => new EscenaCana() });
})();
