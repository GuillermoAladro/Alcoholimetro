"use strict";
/*
 * 00235 · TABURETE GIRATORIO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Marcos, de uniforme, se sienta en un taburete del bar y Guillermo le da vueltas: cada vez más rápido, hasta que
 * Marcos ve estrellitas: ¡QUE ME MAREO! Entonces saca la manguera, abre el chorro y sale propulsado dando vueltas por
 * todo el bar (Guillermo se cubre de las gotas) hasta aterrizar de pie: ¡TACHÁN! Se tambalea un poco, mareado, y
 * Guillermo le aplaude. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 10.2, ESC = 1.45;
const SX = 560, SY = 438;                               // el taburete: centro del asiento
const XG = 300;
const T_EMPUJA = 0.9, T_MAREO = 2.55, T_MANGUERA = 3.45, T_DESPEGA = 3.8, T_ATERRIZA = 6.35, T_TIT = 6.9, T_APAGA = 9.65;
const RUTA = [[SX, 360], [470, 170], [230, 200], [250, 80], [560, 70], [840, 150], [900, 300], [790, PIES - 116 * ESC]];
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Curva suave (Catmull-Rom) por los puntos de la ruta, u de 0 a 1. */
function ruta(u) {
  const n = RUTA.length - 1, f = clamp(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), s = f - i;
  const p0 = RUTA[Math.max(0, i - 1)], p1 = RUTA[i], p2 = RUTA[i + 1], p3 = RUTA[Math.min(n, i + 2)];
  const c = (a, b, c2, d) => 0.5 * (2 * b + (-a + c2) * s + (2 * a - 5 * b + 4 * c2 - d) * s * s + (-a + 3 * b - 3 * c2 + d) * s * s * s);
  return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
}
/** Boquilla de la manguera (unidades de avatar), apuntando `ang`. */
function lanza(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  const gr = g.createLinearGradient(0, -5, 0, 5);
  gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.5, "#d8a020"); gr.addColorStop(1, "#7a5200");
  g.fillStyle = gr; g.beginPath(); g.moveTo(-8, -5.5); g.lineTo(14, -4); g.lineTo(26, -2.4); g.lineTo(26, 2.4); g.lineTo(14, 4); g.lineTo(-8, 5.5); g.closePath(); g.fill();
  g.fillStyle = "#1c1c1c"; g.fillRect(-12, -6.5, 6, 13); g.fillRect(8, -5, 3, 10);
  g.restore();
}
function botella(g, x, y, w, h, c1, c2) {
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr;
  const hc = h * 0.62;
  rectR(g, x - w / 2, y - hc, w, hc, 3); g.fill();
  g.beginPath(); g.moveTo(x - w / 2 + 1, y - hc + 3); g.quadraticCurveTo(x - w * 0.2, y - hc - 5, x - w * 0.17, y - h + 5);
  g.lineTo(x + w * 0.17, y - h + 5); g.quadraticCurveTo(x + w * 0.2, y - hc - 5, x + w / 2 - 1, y - hc + 3); g.closePath(); g.fill();
  g.fillStyle = "#151515"; g.fillRect(x - w * 0.19, y - h, w * 0.38, 6);
  g.fillStyle = "rgba(255,248,225,.7)"; g.fillRect(x - w / 2 + 2, y - hc * 0.66, w - 4, hc * 0.32);
}

class TabureteGiratorio extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.gotas = [];
    this.cF = null;
    this.fase = 0; this.faseT = 0;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Velocidad de giro del taburete (vueltas/s). */
  vel(t) {
    if (t < T_EMPUJA) return 0;
    if (t < T_DESPEGA) return 0.4 + 2.6 * eIn(tramo(t, T_EMPUJA, T_MAREO + 0.3));
    return 3 * Math.exp(-(t - T_DESPEGA) * 0.9);
  }
  // ------------------------------------------------------------------ poses
  poses() {
    const t = this.t, ph = this.fase;
    // --- Marcos
    const M = { quien: "bombero", cara: "risa", rc: 0, piernaI: [-30, 0.12], piernaD: [-30, -0.12], brazoIDelante: true, manoD: [72, 140], manoI: [2, 140] };
    let m, conLanza = false, angL = 0, centro = null, sx = 1, giro = 0;
    if (t < T_DESPEGA) {
      sx = t < T_EMPUJA ? 1 : Math.cos(ph * 2 * Math.PI);
      if (Math.abs(sx) < 0.08) sx = sx < 0 ? -0.08 : 0.08;
      const v = this.vel(t);
      M.cara = v < 1.2 ? "risa" : v < 2.2 ? "sorpresa" : (Math.floor(t * 6) % 2 ? "dormido" : "sorpresa");
      M.puntas = 0;
      M.manoD = [80 + 6 * Math.min(1, v), 120 - 14 * Math.min(1, v / 2)]; M.manoI = [-6 - 6 * Math.min(1, v), 120 - 14 * Math.min(1, v / 2)];
      M.rc = 0.06 * Math.sin(t * 9) * Math.min(1, v);
      // saca la manguera del cinturón
      if (t > T_MANGUERA) {
        const k = eOut(tramo(t, T_MANGUERA, T_MANGUERA + 0.3));
        M.manoD = mezcla(M.manoD, [86, 146], k); conLanza = true; angL = Math.PI / 2;
        M.cara = "guino";
      }
      m = matAv(SX, SY - 4, ESC, 0, sx, 1, [37, 142]);
    } else if (t < T_ATERRIZA) {
      // ¡propulsado!
      const u = tramo(t, T_DESPEGA, T_ATERRIZA), ue = eInOut(u);
      centro = ruta(ue);
      const d = ruta(Math.min(1, ue + 0.01)), d0 = ruta(Math.max(0, ue - 0.01));
      const dirV = Math.atan2(d[1] - d0[1], d[0] - d0[0]);
      giro = 2 * Math.PI * 3 * eInOut(u);
      M.cara = Math.floor(t * 5) % 3 === 0 ? "guino" : "sorpresa"; M.puntas = 0.6;
      M.piernaI = [-8, 0.2]; M.piernaD = [0, -0.1];
      M.manoD = [86, 146]; M.manoI = [-18, 60];
      conLanza = true; angL = dirV + Math.PI - giro;          // el chorro, hacia atrás
      this._dirV = dirV;
      m = matAv(centro[0], centro[1], ESC, giro, 1, 1, [39, 116]);
    } else {
      // ¡TACHÁN! y se tambalea
      const d = t - T_ATERRIZA, aplasta = d < 0.2 ? 1 - 0.12 * Math.sin((d / 0.2) * Math.PI) : 1;
      const k = eBack(tramo(d, 0, 0.3));
      M.manoD = mezcla([86, 146], [94, 18], k); M.manoI = mezcla([-18, 60], [-20, 18], k);
      M.cara = "risa"; M.puntas = 0.5 * (1 - tramo(d, 0.5, 1.2));
      giro = d > 0.6 ? 0.16 * Math.sin((d - 0.6) * 6) * Math.exp(-(d - 0.6) * 0.5) : 0;
      if (d > 0.6) { M.cara = Math.floor(d * 3) % 2 ? "dormido" : "sorpresa"; M.manoD = mezcla([94, 18], [96, 80], tramo(d, 0.6, 0.9)); M.manoI = mezcla([-20, 18], [-22, 80], tramo(d, 0.6, 0.9)); M.rc = 0.1 * Math.sin(d * 5); }
      if (d > 2.4) { M.cara = "risa"; }
      m = matAv(RUTA[RUTA.length - 1][0], PIES, ESC, giro, 1, aplasta);
    }
    M.manoD = M.manoD; M.manoI = M.manoI;
    if (conLanza) {
      const a = angL;
      M.objD = (g, mano) => {
        // la manguera sale del cinturón
        g.strokeStyle = "#5a0c08"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(30, 140); g.quadraticCurveTo(50, 170, mano[0] - Math.cos(a) * 8, mano[1] - Math.sin(a) * 8); g.stroke();
        g.strokeStyle = "#d8261c"; g.lineWidth = 3.6; g.stroke();
        lanza(g, mano, a);
      };
    }
    // --- Guillermo
    const G = { cara: "risa", rc: 0.12, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let gD = [74, 140], gI = [6, 150], yg = PIES;
    const mG0 = matAv(XG, PIES, ESC);
    if (t > T_EMPUJA - 0.2 && t < T_MAREO + 0.8) {
      // le da vueltas: empujones en el respaldo, cada vez más rápido
      const v = this.vel(t), f = (ph * 2) % 1;
      const hombro = [SX - 46, SY - 120];
      const golpe = Math.max(0, Math.sin(f * Math.PI * 2));
      gD = enAv(mG0, [hombro[0] - 30 + 30 * golpe, hombro[1] + 10 - 10 * golpe]);
      G.cara = v < 1.5 ? "risa" : "guino"; G.rc = 0.1;
      gI = [-4, 120];
    }
    if (t > T_MAREO + 0.3 && t < T_DESPEGA) { G.cara = "sorpresa"; G.rc = 0.15; gD = [84, 110]; }
    if (t >= T_DESPEGA && t < T_ATERRIZA) {
      // lo sigue con la mirada y se tapa de las gotas
      const c = centro || [SX, 300];
      G.rc = clamp((c[0] - XG) / 900, -0.22, 0.22); G.cara = "sorpresa";
      gD = [62, 20]; gI = [16, 20]; G.puntas = 0.3;
      if (Math.sin(t * 7) > 0.3) G.cara = "dormido";
    }
    if (t >= T_ATERRIZA) {
      const ap = Math.abs(Math.sin(t * 13));
      G.cara = t < T_ATERRIZA + 0.3 ? "sorpresa" : "risa"; G.rc = 0.12;
      gD = [52, 104 - 4 * ap]; gI = [26 + 6 * ap, 104];
      if (t > T_ATERRIZA + 0.3 && t < T_ATERRIZA + 1.4) yg = PIES - Math.abs(Math.sin((t - T_ATERRIZA) * 9)) * 14;
    }
    G.manoD = gD; G.manoI = gI;
    return { M, m, G, mG: matAv(XG, yg, ESC), centro, conLanza, sx };
  }
  /** Punta de la lanza en pantalla y dirección del chorro. */
  chorro(e) {
    if (!e.conLanza || this.t < T_DESPEGA || this.t > T_ATERRIZA) return null;
    const mano = e.M._manoD || e.M.manoD, dir = this._dirV + Math.PI;
    const giro = 2 * Math.PI * 3 * eInOut(tramo(this.t, T_DESPEGA, T_ATERRIZA));
    const loc = [mano[0] + Math.cos(dir - giro) * 26, mano[1] + Math.sin(dir - giro) * 26];
    return { p: aPant(e.m, loc), dir };
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.fase += this.vel(t) * dt;
    const e = this.poses();
    // gotas del chorro
    const ch = this.chorro(e);
    if (ch) for (let i = 0; i < 3; i++) { const a = ch.dir + azar(-0.18, 0.18), v = azar(380, 560); this.gotas.push({ x: ch.p[0], y: ch.p[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.5, 0.9), vm: 0.9, r: azar(3, 5.5) }); }
    if (this.gotas.length > 200) this.gotas.splice(0, this.gotas.length - 200);
    for (const d of this.gotas) { d.v -= dt; d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > PIES) { d.y = PIES; d.vy *= -0.2; d.vx *= 0.5; } }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("despega", t > T_DESPEGA, () => { temblar(16, 0.4); for (let i = 0; i < 20; i++) p.nueva(P.VAPOR, SX + azar(-50, 50), SY + azar(-20, 40), azar(-200, 200), azar(-60, 120), azar(0.6, 1), azar(40, 70)); });
    this.una("aterriza", t > T_ATERRIZA, () => {
      temblar(18, 0.4);
      const x = RUTA[RUTA.length - 1][0];
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, x + azar(-60, 60), PIES - 4, azar(-200, 200), azar(-60, -5), azar(0.5, 0.9), azar(26, 44));
      p.nueva(P.DESTELLO, x, PIES - 200, 0, 0, 0.35, 220);
    });
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 80; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ fondo
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#140b07"); gr.addColorStop(0.6, "#25150b"); gr.addColorStop(1, "#160c06");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "rgba(0,0,0,.22)"; for (let x = -40; x < W + 60; x += 58) g.fillRect(x, -60, 3, H + 120);
    const r = semilla(41);
    const COL = [["#3a9a4a", "#174a20"], ["#b0521e", "#4a1a06"], ["#e0b840", "#7a5a10"], ["#4a7ac0", "#13305a"], ["#c02238", "#500810"], ["#ecebdc", "#8a8670"]];
    for (const y of [150, 236]) {
      for (let x = 22; x < W - 10; x += 24 + r() * 9) {
        if (r() < 0.12) continue;
        const [c1, c2] = COL[(r() * COL.length) | 0];
        botella(g, x, y, 13 + r() * 5, 40 + r() * 26, c1, c2);
      }
      g.fillStyle = "#6a3e1c"; g.fillRect(-60, y, W + 120, 9);
      g.fillStyle = "rgba(255,210,150,.3)"; g.fillRect(-60, y, W + 120, 2);
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, y + 9, W + 120, 7);
    }
    // barra al fondo
    const gb = g.createLinearGradient(0, 380, 0, PIES);
    gb.addColorStop(0, "#5a3218"); gb.addColorStop(1, "#24130a");
    g.fillStyle = gb; g.fillRect(-60, 386, W + 120, PIES - 386);
    g.fillStyle = "rgba(0,0,0,.3)"; for (let x = 20; x < W + 60; x += 96) g.fillRect(x, 400, 3, PIES - 410);
    g.fillStyle = "#8a5426"; g.fillRect(-60, 378, W + 120, 14);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, 378, W + 120, 3);
    g.fillStyle = "#b8862d"; g.fillRect(-60, PIES - 40, W + 120, 5);
    // suelo
    const gs = g.createLinearGradient(0, PIES - 18, 0, H);
    gs.addColorStop(0, "#3a2412"); gs.addColorStop(1, "#1c1008");
    g.fillStyle = gs; g.fillRect(-60, PIES - 18, W + 120, H - PIES + 80);
    for (const x of [300, 720]) {
      g.strokeStyle = "#0b0b0b"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 26); g.stroke();
      g.fillStyle = "#2a2e33"; g.beginPath(); g.moveTo(x - 30, 50); g.lineTo(x + 30, 50); g.lineTo(x + 12, 26); g.lineTo(x - 12, 26); g.closePath(); g.fill();
      g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(x, 50, 22, 5, 0, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = "lighter";
    for (const x of [300, 720]) { g.globalAlpha = 0.42; g.drawImage(BLOB2.oro, x - 240, 10, 480, 480); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 240, W / 2, 300, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.72)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return (this.cF = c);
  }
  /** El taburete (pantalla); `ph` = vueltas (para las rayas del asiento). */
  taburete(g, ph, parte) {
    if (parte === "pie") {
      g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(SX, PIES + 2, 60, 9, 0, 0, 6.283); g.fill();
      const gp = g.createLinearGradient(SX - 7, 0, SX + 7, 0);
      gp.addColorStop(0, "#6a7078"); gp.addColorStop(0.5, "#f0f4f8"); gp.addColorStop(1, "#5a6068");
      g.fillStyle = gp; g.fillRect(SX - 7, SY + 12, 14, PIES - SY - 14);
      g.strokeStyle = "#b8c0c8"; g.lineWidth = 4; g.beginPath(); g.ellipse(SX, 520, 40, 8, 0, 0, 6.283); g.stroke();
      const gb = g.createLinearGradient(0, PIES - 12, 0, PIES);
      gb.addColorStop(0, "#d8dee4"); gb.addColorStop(1, "#5a6068");
      g.fillStyle = gb; g.beginPath(); g.ellipse(SX, PIES - 5, 52, 10, 0, 0, 6.283); g.fill();
      return;
    }
    // asiento
    const gs = g.createLinearGradient(0, SY - 10, 0, SY + 16);
    gs.addColorStop(0, "#ff4a3a"); gs.addColorStop(1, "#8a0c08");
    g.fillStyle = "#5a0806"; g.beginPath(); g.ellipse(SX, SY + 6, 60, 13, 0, 0, 6.283); g.fill();
    g.fillStyle = gs; g.fillRect(SX - 60, SY - 4, 120, 10);
    g.save(); g.beginPath(); g.rect(SX - 60, SY - 4, 120, 22); g.clip();
    g.fillStyle = "rgba(255,255,255,.35)";
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * Math.PI + ph * 2 * Math.PI, c = Math.cos(a); if (Math.sin(a) < 0) continue; g.fillRect(SX + c * 58 - 2, SY - 4, 4, 18); }
    g.restore();
    g.fillStyle = "#ff6a5a"; g.beginPath(); g.ellipse(SX, SY - 4, 60, 12, 0, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.3)"; g.beginPath(); g.ellipse(SX - 18, SY - 7, 22, 4, 0, 0, 6.283); g.fill();
  }
  estrellitas(g, c, t, a) {
    for (let i = 0; i < 4; i++) {
      const an = t * 6 + i * (Math.PI / 2);
      g.save(); g.globalAlpha = a; g.fillStyle = "#ffd34d";
      estrella(g, c[0] + Math.cos(an) * 56, c[1] + Math.sin(an) * 16, 11, 5, t * 4); g.fill(); g.restore();
    }
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), -60, -60);
    foco(g, 560, 560, PIES, 200, 0.4);
    this.taburete(g, this.fase, "pie");
    // sombras
    for (const m of [e.mG]) { const c = aPant(m, [39, 232]); g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(c[0], PIES + 2, 56, 9, 0, 0, 6.283); g.fill(); }
    if (t > T_DESPEGA) { const c = e.centro || [RUTA[RUTA.length - 1][0], PIES]; g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(c[0], PIES + 2, 50 + (PIES - c[1]) * 0.05, 8, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mG, e.G, t);
    // Marcos: con estela si gira muy rápido
    const v = this.vel(t);
    if (t > T_EMPUJA && t < T_DESPEGA && v > 1.6) {
      for (let k = 2; k >= 1; k--) {
        const ph = this.fase - k * 0.06, sx = Math.cos(ph * 2 * Math.PI);
        g.save(); g.globalAlpha = a * 0.22;
        pintarAvatar(g, matAv(SX, SY - 4, ESC, 0, Math.abs(sx) < 0.08 ? 0.08 : sx, 1, [37, 142]), e.M, t);
        g.restore();
      }
    }
    if (t < T_DESPEGA) { pintarAvatar(g, e.m, e.M, t); this.taburete(g, this.fase, "asiento"); }
    else { this.taburete(g, this.fase, "asiento"); pintarAvatar(g, e.m, e.M, t); }
    // rayas de velocidad del giro
    if (t > T_EMPUJA && t < T_DESPEGA) {
      const k = clamp((v - 0.8) / 2, 0, 1);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.5 * k})`; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const yy = 260 + i * 50, an = this.fase * 6 + i; g.beginPath(); g.ellipse(SX, yy, 90, 14, 0, an % 6.283, (an % 6.283) + 1.6); g.stroke(); }
      g.restore();
    }
    // estrellitas de mareo
    if ((t > T_MAREO && t < T_DESPEGA) || (t > T_ATERRIZA + 0.6 && t < T_ATERRIZA + 2.4)) {
      const R = avatar("bombero").rig, c = aPant(e.m, [R.frente[0], R.frente[1] - 30]);
      this.estrellitas(g, c, t, Math.min(1, tramo(t, T_MAREO, T_MAREO + 0.2) + tramo(t, T_ATERRIZA + 0.6, T_ATERRIZA + 0.8)));
    }
    // el chorro
    const ch = this.chorro(e);
    if (ch) {
      const L = 150, f = [ch.p[0] + Math.cos(ch.dir) * L, ch.p[1] + Math.sin(ch.dir) * L + 20];
      g.save(); g.lineCap = "round";
      g.strokeStyle = "rgba(90,170,255,.5)"; g.lineWidth = 18; g.beginPath(); g.moveTo(ch.p[0], ch.p[1]); g.lineTo(f[0], f[1]); g.stroke();
      g.strokeStyle = "rgba(210,240,255,.95)"; g.lineWidth = 10; g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 3; g.stroke();
      g.restore();
    }
    g.fillStyle = "#a8e2ff";
    for (const d of this.gotas) { g.globalAlpha = a * Math.min(1, (d.v / d.vm) * 2); g.beginPath(); g.ellipse(d.x, d.y, d.r * 0.7, d.r, 0, 0, 6.283); g.fill(); }
    g.restore();
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("¡VUELTA!", 300, 200, T_EMPUJA + 0.05, 0.6, 46, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡MÁS RÁPIDO!", 290, 170, 1.7, 0.7, 44, "#ffd34d", "#3a2400", 0.05);
    ono("¡FIIIUUU!", 780, 470, T_DESPEGA + 0.1, 0.9, 70, "#bfeaff", "#06303a", -0.08);
    ono("¡TACHÁN!", 790, 160, T_ATERRIZA + 0.05, 0.8, 64, "#ffd34d", "#3a2400", 0.06);
    // ¡QUE ME MAREO! (mientras gira) y como título al final
    if (t > T_MAREO && t < T_DESPEGA + 0.2) {
      const d = t - T_MAREO, k = tramo(d, 0, 0.16), s = lerp(2, 1, eIn(k)), sal = tramo(t, T_DESPEGA, T_DESPEGA + 0.2);
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a * (1 - sal);
      g.translate(512 + 6 * Math.sin(t * 20), 100); g.rotate(0.05 * Math.sin(t * 9)); g.scale(s * 0.86, s * 0.86);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(470, 100); g.rotate(-0.04 + 0.03 * Math.sin(d * 3)); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(960, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bfeaff"); gr.addColorStop(1, "#2fa8e8");
    txt(g, "¡QUE ME MAREO!", 486, 156, { tam: 128, peso: 400, fam: FC, color: "#06243a", esp: 5, max: 900 });
    txt(g, "¡QUE ME MAREO!", 480, 148, { tam: 128, peso: 400, fam: FC, color: gr, borde: "#06243a", bordeAncho: 12, esp: 5, glow: "rgba(80,190,255,.85)", glowTam: 24, max: 900 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00235", nombre: "Taburete giratorio", crear: () => new TabureteGiratorio() });
})();
