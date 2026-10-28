"use strict";
/*
 * 00175 · EL PARAGUAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Salen del bar y está diluviando (relámpago incluido). Solo hay un paraguas: Guillermo lo abre (¡FLOP!) y Marcos
 * se mete debajo de un salto; van apretados, chocando hombros. Una ráfaga de viento (¡FIUUU!) le da la vuelta al
 * paraguas (¡PLOF!); se miran empapados… y se parten de risa. Salen corriendo bajo la lluvia, chapoteando en los
 * charcos, con el paraguas del revés: ¡QUÉ CHAPARRÓN!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.5, SUELO = PIES;
const T_RAYO = 0.55, T_ABRE = 1.75, T_SE_METE = 2.25, T_ANDAN = 2.85, T_RAFAGA = 4.4, T_VUELTA = 4.95, T_RISA = 5.85, T_TIT = 6.25, T_CORREN = 6.45, T_RAYO2 = 9.35, T_APAGA = 9.9, DUR = 10.55;
const CHARCOS = [[300, 70], [655, 90], [860, 70]];
const N_GOTAS = 170;

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
    return lerp(k[i - 1][1], k[i][1], u);
  }
  return k[k.length - 1][1];
}
const xG = (t) => pista(t, [[0.3, -90], [1.45, 420, eOut], [T_SE_METE, 420], [T_ANDAN, 420], [T_RAFAGA, 520, (u) => u], [T_CORREN, 520], [9.25, 1260, eIn]]);
const xM = (t) => pista(t, [[0.5, -150], [1.6, 610, eOut], [T_SE_METE, 610], [2.6, 528, eOut], [T_ANDAN, 528], [T_RAFAGA, 628, (u) => u], [T_CORREN, 628], [9.05, 1300, eIn]]);

function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(1000, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#bfe8ff"); gr.addColorStop(1, "#3aa0ff");
  txt(g, "¡QUÉ CHAPARRÓN!", 506, 156, { tam: 124, peso: 400, fam: FC, color: "#03132a", esp: 4, max: 930 });
  txt(g, "¡QUÉ CHAPARRÓN!", 500, 150, { tam: 124, peso: 400, fam: FC, color: gr, borde: "#03132a", bordeAncho: 13, esp: 4, glow: "rgba(90,180,255,.85)", glowTam: 26, max: 930 });
  CT.set("tit", c);
  return c;
}
function fondoCalle() {
  if (CT.has("fondo")) return CT.get("fondo");
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, -60, 0, 470);
  gr.addColorStop(0, "#04060e"); gr.addColorStop(1, "#141c30");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, 530);
  // edificios del fondo con ventanas
  const r = semilla(8);
  for (let x = 280; x < W + 60; x += 120 + r() * 60) {
    const h = 180 + r() * 160, w = 100 + r() * 50;
    g.fillStyle = "#0b1020"; g.fillRect(x, 470 - h, w, h);
    for (let wy = 470 - h + 20; wy < 450; wy += 34) for (let wx = x + 14; wx < x + w - 16; wx += 26) if (r() < 0.35) { g.fillStyle = `rgba(255,${190 + r() * 40},120,${0.35 + r() * 0.3})`; g.fillRect(wx, wy, 12, 16); }
  }
  // la fachada del bar con la puerta iluminada
  g.fillStyle = "#3a1e14"; g.fillRect(-60, 90, 340, 382);
  g.fillStyle = "rgba(0,0,0,.25)";
  for (let y = 100; y < 470; y += 22) for (let x = -60 + ((y / 22) % 2) * 22; x < 280; x += 44) g.fillRect(x, y, 40, 2);
  const gp = g.createLinearGradient(0, 260, 0, 470);
  gp.addColorStop(0, "#ffcf7a"); gp.addColorStop(1, "#c8782a");
  g.fillStyle = gp; g.fillRect(90, 262, 120, 210);
  g.strokeStyle = "#1c0e08"; g.lineWidth = 8; g.strokeRect(90, 262, 120, 210);
  // rótulo de neón
  txt(g, "BAR", 150, 220, { tam: 64, peso: 900, fam: FD, color: "#ffe2f0", glow: "#ff3d84", glowTam: 26, esp: 6 });
  txt(g, "BAR", 150, 220, { tam: 64, peso: 900, fam: FD, color: "#ffe2f0", glow: "#ff3d84", glowTam: 12, esp: 6 });
  // farola
  g.fillStyle = "#1b1e24"; g.fillRect(888, 150, 8, 322); g.fillRect(860, 140, 54, 14);
  // acera mojada con reflejos
  const gs = g.createLinearGradient(0, 470, 0, H + 60);
  gs.addColorStop(0, "#1a2236"); gs.addColorStop(1, "#05070d");
  g.fillStyle = gs; g.fillRect(-60, 470, W + 120, H - 410);
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.35; g.drawImage(BLOB2.oro, 70, 470, 160, 140);
  g.globalAlpha = 0.3; g.drawImage(BLOB.rojo, 80, 470, 140, 100);
  g.globalAlpha = 0.3; g.drawImage(BLOB2.oroClaro, 830, 470, 120, 130);
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  // charcos
  for (const [x, w] of CHARCOS) {
    const gc = g.createLinearGradient(0, 548, 0, 590);
    gc.addColorStop(0, "rgba(120,150,210,.35)"); gc.addColorStop(1, "rgba(40,60,100,.25)");
    g.fillStyle = gc; g.beginPath(); g.ellipse(x, 572, w, 13, 0, 0, 6.283); g.fill();
  }
  CT.set("fondo", c);
  return c;
}
/** Paraguas: el mango en (0, 0), la varilla hacia arriba. R: radio de la tela; s: 1 abierto, <0 del revés. */
function paraguas(g, R, s, t, cerrado) {
  const L = 205, cy = -L + 18;
  g.lineCap = "round";
  // mango en J y varilla
  g.strokeStyle = "#3a2414"; g.lineWidth = 7;
  g.beginPath(); g.moveTo(0, -6); g.lineTo(0, 10); g.arc(-9, 10, 9, 0, Math.PI); g.stroke();
  g.strokeStyle = "#c9ced4"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -L - 14); g.stroke();
  if (cerrado) {
    g.fillStyle = "#c81e2e"; g.beginPath(); g.moveTo(0, -L - 4); g.quadraticCurveTo(R, -L * 0.6, 0, -40); g.quadraticCurveTo(-R, -L * 0.6, 0, -L - 4); g.fill();
    return;
  }
  const n = 8, ry = 62 * s, flap = (i) => (s < 0.5 ? Math.sin(t * 30 + i * 2) * 6 * (1 - Math.abs(s)) : 0);
  const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([-R + 2 * R * u, cy + (s < 0 ? -Math.abs(Math.sin(u * Math.PI)) * 6 : 0) + flap(i)]); }
  const apex = [0, cy - ry];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1], dentro = s < 0;
    g.fillStyle = (i % 2 ? (dentro ? "#7a0e18" : "#fff4f0") : (dentro ? "#5a0a12" : "#d8202f"));
    g.beginPath(); g.moveTo(apex[0], apex[1]);
    g.quadraticCurveTo((apex[0] + a[0]) / 2 + (a[0] < 0 ? -1 : 1) * 10 * s, (apex[1] + a[1]) / 2 - 8 * s, a[0], a[1]);
    g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 12 * Math.sign(s || 1), b[0], b[1]);
    g.quadraticCurveTo((apex[0] + b[0]) / 2 + (b[0] < 0 ? -1 : 1) * 10 * s, (apex[1] + b[1]) / 2 - 8 * s, apex[0], apex[1]);
    g.closePath(); g.fill();
  }
  // varillas
  g.strokeStyle = "rgba(40,20,20,.6)"; g.lineWidth = 1.5;
  for (const p of pts) { g.beginPath(); g.moveTo(apex[0], apex[1]); g.lineTo(p[0], p[1]); g.stroke(); }
  g.fillStyle = "#c9ced4"; g.beginPath(); g.arc(apex[0], apex[1] - 4, 4, 0, 6.283); g.fill();
}

class Paraguas extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    const r = semilla(77);
    this.gotas = [];
    for (let i = 0; i < N_GOTAS; i++) this.gotas.push({ x: r() * (W + 300) - 150, y: r() * H, v: 900 + r() * 400, l: 14 + r() * 14 });
    this.agua = [];          // salpicones: { x, y, vx, vy, v }
    this.ondas = [];         // anillos en el suelo
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  viento(t) { return 0.12 + 0.5 * eInOut(tramo(t, T_RAFAGA - 0.1, T_RAFAGA + 0.3)) * (1 - eInOut(tramo(t, 5.4, 5.9))) + (t > 5.9 ? 0.1 : 0); }
  /** Paraguas: { R, s, cerrado, ang, mano } */
  paraguasEstado(t) {
    if (t < T_ABRE) return { R: 12, s: 1, cerrado: true, ang: 0 };
    const kA = eBack(tramo(t, T_ABRE, T_ABRE + 0.3));
    let R = lerp(14, 128, kA), s = 1, ang = 0;
    if (t > T_RAFAGA) {
      ang = 0.25 * eInOut(tramo(t, T_RAFAGA, T_VUELTA)) + 0.08 * Math.sin(t * 20) * (t < T_VUELTA + 0.4 ? 1 : 0.4);
      s = lerp(1, -0.75, eOut(tramo(t, T_VUELTA - 0.05, T_VUELTA + 0.15)));
      R = lerp(R, 100, tramo(t, T_VUELTA, T_VUELTA + 0.2));
    }
    let esc = 1;
    if (t > T_RISA) { const k = eInOut(tramo(t, T_RISA, T_TIT)); ang = lerp(ang, 0.55, k); esc = lerp(1, 0.72, k); }
    if (t > T_CORREN) ang = 0.55 + 0.15 * Math.sin(t * 9);
    return { R, s, cerrado: false, ang, esc };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 150], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const x1 = xG(t), x2 = xM(t);
    let dyG = 0, dyM = 0, giroG = 0, giroM = 0, sxG = 1, sxM = 1;
    const anda = (f, q) => Math.abs(f(t + 0.02) - f(t - 0.02)) > 0.5;
    const corre = t > T_CORREN;
    for (const [P, f, ph, q] of [[G, xG, 0, 0], [M, xM, 1.3, 1]]) {
      if (anda(f, q)) {
        const a = andar(t * (corre ? 15 : 10) + ph, corre ? 1.3 : 1);
        P.piernaI = a.piernaI; P.piernaD = a.piernaD;
        if (q) dyM = a.bote * ESC * (corre ? 1.6 : 1); else dyG = a.bote * ESC * (corre ? 1.6 : 1);
      }
    }
    // al salir: ¡qué lluvia!
    if (t > 1.3 && t < T_ABRE) { G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = -0.06; M.rc = 0.06; }
    // Guillermo abre el paraguas; Marcos se moja
    if (t > T_ABRE - 0.3) {
      const k = eOut(tramo(t, T_ABRE - 0.3, T_ABRE));
      G.manoD = mezcla(G.manoD, [66, 108], k);
      if (t < T_SE_METE) { G.cara = "guino"; M.cara = "sorpresa"; M.rc = 0.06 * Math.sin(t * 20); M.manoI = mezcla(M.manoI, [-10, 40], eOut(tramo(t, T_ABRE + 0.1, T_ABRE + 0.3))); M.brazoIDelante = true; }
    }
    // Marcos se mete debajo de un salto: van apretados
    if (t > T_SE_METE && t < T_RAFAGA) {
      const k = tramo(t, T_SE_METE, 2.6);
      dyM -= Math.sin(k * Math.PI) * 40;
      const apr = eOut(tramo(t, 2.5, 2.7));
      sxG = 1 - 0.05 * apr; sxM = 1 - 0.05 * apr;
      giroG = 0.04 * apr * Math.sin(t * 7); giroM = -0.04 * apr * Math.sin(t * 7);
      G.cara = t < 3.2 ? "sorpresa" : "sonrisa"; M.cara = t < 3.2 ? "risa" : "guino";
      G.rc = 0.1; M.rc = -0.1;
      M.manoI = [8, 140]; M.brazoIDelante = false;
      // empujoncitos con el hombro
      if (t > 3.3 && t < 4.2) { const s = Math.sin((t - 3.3) * 10); giroG = 0.05 * s; giroM = 0.05 * s; G.cara = s > 0 ? "sorpresa" : "guino"; }
    }
    // la ráfaga: tira del paraguas y se inclinan
    if (t > T_RAFAGA && t < T_RISA) {
      const k = eInOut(tramo(t, T_RAFAGA, T_RAFAGA + 0.3)), kV = eOut(tramo(t, T_VUELTA, T_VUELTA + 0.2));
      giroG = -0.1 * k + 0.03 * Math.sin(t * 25); giroM = -0.12 * k + 0.03 * Math.sin(t * 23);
      G.manoD = mezcla([66, 108], [78, 46], kV); G.puntas = k * 0.6; M.puntas = k * 0.6;
      G.cara = "sorpresa"; M.cara = "sorpresa";
      dyG -= 12 * kV * (1 - tramo(t, 5.2, 5.5)); dyM -= 6 * kV * (1 - tramo(t, 5.2, 5.5));
      if (t > 5.3) { G.rc = 0.14; M.rc = -0.14; giroG *= 0.3; giroM *= 0.3; G.puntas = 0; M.puntas = 0; }
    }
    if (t >= T_RISA) {
      G.cara = "risa"; M.cara = "risa";
      G.rc = 0.08 * Math.sin(t * 7); M.rc = -0.08 * Math.sin(t * 7 + 1);
      if (!corre) { dyG -= Math.abs(Math.sin(t * 12)) * 5; dyM -= Math.abs(Math.sin(t * 12 + 1)) * 5; }
      G.manoD = [80 + 8 * Math.sin(t * 9), 40 + 6 * Math.cos(t * 9)];
      if (corre) { M.manoD = [80, 70 + 20 * Math.sin(t * 15)]; M.manoI = [-8, 70 - 20 * Math.sin(t * 15)]; M.brazoIDelante = false; G.manoI = [-6, 100 + 20 * Math.sin(t * 15)]; giroG = 0.06; giroM = 0.06; }
    }
    const pa = this.paraguasEstado(t);
    G.objD2 = (g, m) => { g.save(); g.translate(m[0], m[1] + 2); g.rotate(pa.cerrado ? Math.PI - 0.15 : pa.ang); const k = pa.cerrado ? 0.62 : pa.esc; g.scale(k / ESC, k / ESC); paraguas(g, pa.R, pa.s, t, pa.cerrado); g.restore(); };
    if (pa.cerrado) G.manoD = [70, 150];
    return { G, M, mG: matAv(x1, SUELO + dyG, ESC, giroG, sxG, 1), mM: matAv(x2, SUELO + dyM, ESC, giroM, sxM, 1), pa };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const w = this.viento(t), e = this.poses();
    // la lluvia
    const ag = this.agua;
    for (const d of this.gotas) {
      d.y += d.v * dt; d.x += d.v * Math.tan(w) * dt;
      if (d.y > SUELO + azar(-30, 20)) {
        if (this.ondas.length < 50 && Math.random() < 0.5) this.ondas.push({ x: d.x, y: d.y, t0: t });
        d.y = azar(-80, -10); d.x = azar(-300, W + 100);
      }
    }
    // gotas que rebotan en el paraguas y en las cabezas
    if (Math.random() < 30 * dt && ag.length < 160) {
      const pa = e.pa;
      if (!pa.cerrado && t < T_CORREN) {
        const mano = aPant(e.mG, e.G.manoD), x = mano[0] + azar(-pa.R, pa.R), y = mano[1] - 190 * 1 + Math.abs(x - mano[0]) * 0.35;
        ag.push({ x, y, vx: azar(-80, 80), vy: azar(-180, -60), v: 0.4 });
      }
      for (const [m, q] of [[e.mG, 0], [e.mM, 1]]) {
        if (!pa.cerrado && q === 0 && t > T_ABRE && t < T_VUELTA) continue;
        if (!pa.cerrado && q === 1 && t > 2.6 && t < T_VUELTA) continue;
        const c = aPant(m, [38, 4]);
        ag.push({ x: c[0] + azar(-40, 40), y: c[1] + azar(0, 10), vx: azar(-90, 90), vy: azar(-150, -40), v: 0.35 });
      }
    }
    for (let i = ag.length - 1; i >= 0; i--) { const a = ag[i]; a.v -= dt; a.vy += 900 * dt; a.x += a.vx * dt; a.y += a.vy * dt; if (a.v <= 0) ag.splice(i, 1); }
    for (let i = this.ondas.length - 1; i >= 0; i--) if (t - this.ondas[i].t0 > 0.4) this.ondas.splice(i, 1);
    // charcos: salpican al pisarlos corriendo
    for (const [cx] of CHARCOS) for (const [f, q] of [[xG, 0], [xM, 1]]) {
      this.una("ch" + cx + q, t > T_CORREN && Math.abs(f(t) - cx) < 20, () => {
        temblar(5, 0.15);
        for (let i = 0; i < 26; i++) ag.push({ x: cx + azar(-30, 30), y: 570, vx: azar(-260, 260), vy: azar(-520, -200), v: azar(0.5, 0.8) });
      });
    }
    this.una("rayo", t > T_RAYO, () => temblar(12, 0.4));
    this.una("rayo2", t > T_RAYO2, () => temblar(10, 0.3));
    this.una("abre", t > T_ABRE, () => temblar(5, 0.15));
    this.una("vuelta", t > T_VUELTA, () => { temblar(12, 0.3); for (let i = 0; i < 20; i++) p.nueva(P.VAPOR, 500 + azar(-120, 120), 180 + azar(-40, 40), azar(100, 300), azar(-60, 60), azar(0.4, 0.8), azar(20, 40)); });
    this.una("risa", t > T_RISA, () => temblar(6, 0.2));
    this.una("tit", t > T_TIT, () => temblar(14, 0.35));
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
    if (!this._pre) { this._pre = true; titulo(); fondoCalle(); }
    const t = this.t, a = this.luz(), e = this.poses(), w = this.viento(t);
    fondo(g, "#000");
    g.drawImage(fondoCalle(), -60, -60);
    // luz de la farola
    g.save(); g.globalCompositeOperation = "lighter";
    const gf = g.createLinearGradient(0, 150, 0, SUELO);
    gf.addColorStop(0, "rgba(255,240,200,.22)"); gf.addColorStop(1, "rgba(255,240,200,.05)");
    g.fillStyle = gf; g.beginPath(); g.moveTo(866, 152); g.lineTo(910, 152); g.lineTo(990, SUELO); g.lineTo(790, SUELO); g.closePath(); g.fill();
    g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 868, 136, 40, 30);
    g.restore();
    // ondas en los charcos y en el suelo
    g.strokeStyle = "rgba(170,200,255,.45)"; g.lineWidth = 1.3;
    for (const o of this.ondas) { const d = (t - o.t0) / 0.4; g.globalAlpha = 1 - d; g.beginPath(); g.ellipse(o.x, o.y, 3 + d * 14, 1 + d * 4, 0, 0, 6.283); g.stroke(); }
    g.globalAlpha = 1;
    // sombras
    g.fillStyle = "rgba(0,0,0,.45)";
    for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], SUELO + 2, 54, 8, 0, 0, 6.283); g.fill(); }
    // Marcos detrás de Guillermo (el paraguas va en la mano de Guillermo, por delante)
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // salpicones
    g.fillStyle = "rgba(190,215,255,.85)";
    for (const d of this.agua) { g.beginPath(); g.ellipse(d.x, d.y, 2, 3.2, 0, 0, 6.283); g.fill(); }
    // la lluvia
    g.strokeStyle = "rgba(170,195,255,.42)"; g.lineWidth = 1.6;
    g.beginPath();
    const tx = Math.tan(w);
    for (const d of this.gotas) { g.moveTo(d.x, d.y); g.lineTo(d.x - tx * d.l, d.y - d.l); }
    g.stroke();
    this.p.dibujar(g);
    // ráfaga: líneas de viento
    if (t > T_RAFAGA - 0.1 && t < 5.7) {
      const k = tramo(t, T_RAFAGA - 0.1, T_RAFAGA + 0.2) * (1 - tramo(t, 5.4, 5.7));
      g.save(); g.globalAlpha = 0.6 * k; g.strokeStyle = "#e8f4ff"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const y = 140 + i * 60, x = ((t * 1400 + i * 260) % 1400) - 200; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 80, y - 12, x + 170, y); g.stroke(); }
      g.restore();
    }
    // relámpagos
    for (const tr of [T_RAYO, T_RAYO2]) { const d = t - tr; if (d > 0 && d < 0.3) { const f = d < 0.06 || (d > 0.12 && d < 0.17) ? 0.7 : 0.15; g.fillStyle = `rgba(220,235,255,${f})`; g.fillRect(-60, -60, W + 120, H + 120); } }
    this.ono(g, "¡BRRRUM!", 640, 120, T_RAYO, 0.6, 56, "#e8f4ff", -0.06);
    this.ono(g, "¡FLOP!", 520, 150, T_ABRE, 0.5, 52, "#ffd34d", 0.08);
    this.ono(g, "¡ÑIIIC!", 470, 160, 2.62, 0.55, 46, "#fffdf5", -0.06);
    this.ono(g, "¡FIUUUU!", 300, 140, T_RAFAGA, 0.7, 54, "#e8f4ff", -0.04);
    this.ono(g, "¡PLOF!", 700, 110, T_VUELTA, 0.6, 58, "#ff3d84", 0.08);
    // ¡QUÉ CHAPARRÓN!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 96); g.rotate(-0.03); g.scale(s * 0.9, s * 0.9);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00175", nombre: "El paraguas", crear: () => new Paraguas() });
})();
