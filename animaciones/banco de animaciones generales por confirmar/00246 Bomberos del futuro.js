"use strict";
/*
 * 00246 · BOMBEROS DEL FUTURO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Parque de bomberos del futuro: Marcos y Guillermo con trajes de luces (peto con hexágono que brilla, hombreras de
 * neón y gafas en el casco) y dos drones-manguera (diseño propio). Marcos hace la demostración: apagan una llama de
 * holograma. Guillermo le pide el mando y aprieta el botón rojo: ¡MODO TURBO! Los drones se vuelven locos y los
 * persiguen mojándolos, hasta que Marcos recupera el mando y los apaga: ¡CLIC! Un dron le cae en brazos y el otro
 * en la cabeza de Guillermo, que aún le echa un último chorrito.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4;
const XG0 = 300, XM0 = 650, HOLO = [500, 470];
const T_DEMO = 0.7, T_HOLO_OFF = 1.6, T_PIDE = 1.85, T_DA = 2.6, T_TURBO = 2.95, T_CORRE = 3.3, T_COGE = 6.0,
  T_OFF = 6.4, T_CAEN = 6.5, T_POSAN = 7.0, T_CHORRITO = 7.8, T_FIN = 9.4, DUR = 9.9;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(900, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#ff9ac0"); gr.addColorStop(1, "#ff2a6a");
  txt(g, "¡MODO TURBO!", 456, 156, { tam: 128, peso: 900, fam: FD, color: "#2a0012", esp: 6, max: 860 });
  txt(g, "¡MODO TURBO!", 450, 150, { tam: 128, peso: 900, fam: FD, color: gr, borde: "#2a0012", bordeAncho: 11, esp: 6, glow: "rgba(255,60,120,.9)", glowTam: 26, max: 860 });
  CT.set("t", c);
  return c;
}
/** Chorro de agua en arco de S a T. */
function chorro(g, S, T, alto, k, t) {
  if (k <= 0.01) return;
  const n = 16, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(S[0], T[0], u), lerp(S[1], T[1], u) - alto * 4 * u * (1 - u)]); }
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.strokeStyle = "rgba(90,170,255,.45)"; g.lineWidth = 12 * k; g.stroke();
  g.strokeStyle = "rgba(190,235,255,.9)"; g.lineWidth = 5 * k; g.stroke();
  g.setLineDash([10, 16]); g.lineDashOffset = -t * 600; g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 2 * k; g.stroke();
  g.restore();
}
/** Mando (unidades de avatar): botón rojo de TURBO y verde de apagar. */
function mando(g, x, y, pulsa) {
  g.save(); g.translate(x, y - 6);
  g.fillStyle = "#1b1d22"; rectR(g, -10, -14, 20, 26, 4); g.fill();
  g.strokeStyle = "#2fe3e8"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = pulsa === "turbo" ? "#ff8aa8" : "#ff2a5a"; g.beginPath(); g.arc(-3, -6, 4, 0, 6.283); g.fill();
  g.fillStyle = pulsa === "off" ? "#a8ffb8" : "#2bff5b"; g.beginPath(); g.arc(5, 4, 3, 0, 6.283); g.fill();
  g.fillStyle = "#2fe3e8"; g.fillRect(-7, 6, 6, 2);
  g.restore();
}
/** Traje del futuro por encima del cuerpo (unidades de avatar): peto, hombreras y gafas en el casco. */
function traje(g, q, rc, t) {
  const R = avatar(q).rig, b = q === "bombero";
  const cx = b ? 37 : 39, cy = b ? 112 : 104;
  // hombreras de neón
  g.save(); g.globalCompositeOperation = "lighter";
  for (const h of [R.hombroI2, R.hombroD]) { g.globalAlpha = 0.5 + 0.2 * Math.sin(t * 5); g.drawImage(BLOB2.cian, h[0] - 14, h[1] - 12, 28, 22); }
  g.restore();
  g.fillStyle = "#c9d4de";
  for (const h of [R.hombroI2, R.hombroD]) { rectR(g, h[0] - 9, h[1] - 7, 18, 8, 4); g.fill(); }
  g.fillStyle = "#2fe3e8"; for (const h of [R.hombroI2, R.hombroD]) g.fillRect(h[0] - 6, h[1] - 4, 12, 2);
  // peto con hexágono
  g.fillStyle = "rgba(200,212,222,.95)";
  g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; g.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); } g.closePath(); g.fill();
  g.strokeStyle = "#5a6a7a"; g.lineWidth = 1.2; g.stroke();
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7 + 0.3 * Math.sin(t * 6); g.drawImage(BLOB2.cian, cx - 14, cy - 14, 28, 28); g.restore();
  g.fillStyle = "#2fe3e8";
  g.beginPath(); g.moveTo(cx, cy - 7); g.quadraticCurveTo(cx + 6, cy + 1, cx, cy + 6); g.quadraticCurveTo(cx - 6, cy + 1, cx, cy - 7); g.fill();
  // gafas subidas en el casco
  g.save();
  g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]);
  const fy = R.frente[1] - (b ? 6 : 8), fx = R.frente[0];
  g.fillStyle = "#1b1d22"; rectR(g, fx - 24, fy - 6, 48, 10, 4); g.fill();
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB2.cian, fx - 30, fy - 12, 60, 22); g.restore();
  g.fillStyle = "#7af4ff"; for (const dx of [-11, 11]) { rectR(g, fx + dx - 9, fy - 4, 18, 7, 3); g.fill(); }
  g.restore();
}

class BomberosDelFuturo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.gotas = [];
    // drones: posición, velocidad
    this.dr = [{ x: 420, y: 190, vx: 0, vy: 0 }, { x: 860, y: 210, vx: 0, vy: 0 }];
    this.holo = 1;
  }
  xs(t) {
    let xg = XG0, xm = XM0;
    const tramos = (ps) => { let x = ps[0][1]; for (let i = 1; i < ps.length; i++) if (t > ps[i][0]) x = lerp(ps[i - 1][1], ps[i][1], eInOut(tramo(t, ps[i][0], ps[i][0] + ps[i][2]))); return x; };
    xg = tramos([[0, XG0, 0], [T_CORRE, 760, 0.7], [T_CORRE + 1.0, 190, 0.9], [T_CORRE + 2.1, 430, 0.55]]);
    xm = tramos([[0, XM0, 0], [T_CORRE + 0.1, 360, 0.7], [T_CORRE + 1.05, 840, 0.9], [T_CORRE + 2.15, 600, 0.55]]);
    return [xg, xm];
  }
  corriendo(t) {
    const c = [[T_CORRE, 0.7], [T_CORRE + 1.0, 0.9], [T_CORRE + 2.1, 0.55]];
    return c.some(([a, d]) => t > a && t < a + d);
  }
  poses() {
    const t = this.t, [xg, xm] = this.xs(t), corre = this.corriendo(t);
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160], casco: true, cascoColor: "#f2c21b" };
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.05, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 112], manoI: [6, 152] };
    let dyG = 0, dyM = 0, quienMando = "M", pulsa = "";
    // ---- demostración
    if (t < T_PIDE) {
      M.cara = t > T_DEMO ? "guino" : "sonrisa"; G.cara = t > T_HOLO_OFF ? "risa" : "sorpresa"; G.rc = 0.1;
      if (t > T_HOLO_OFF) { const s = Math.sin(t * 16); G.manoD = [52 + 4 * s, 112]; G.manoI = [26 - 4 * s, 112]; G.brazoIDelante = true; }
    }
    // ---- Guillermo pide el mando y Marcos se lo da
    if (t >= T_PIDE && t < T_TURBO + 0.3) {
      const k = eOut(tramo(t, T_PIDE, T_PIDE + 0.25));
      G.cara = "risa"; G.rc = 0.1; G.manoD = mezcla([70, 158], [92, 110], k);
      M.cara = "sorpresa"; M.rc = -0.1;
      if (t > T_DA) {
        quienMando = "G";
        const k2 = eOut(tramo(t, T_DA, T_DA + 0.2));
        G.manoD = mezcla([92, 110], [74, 92], k2); G.cara = "guino";
        M.manoD = [67, 152];
      } else {
        // se lo lanza
        const k = Math.sin(tramo(t, T_PIDE, T_PIDE + 0.4) * Math.PI);
        M.manoD = mezcla([72, 112], [84, 74], k); M.cara = "guino";
        quienMando = t < T_PIDE + 0.25 ? "M" : "";
      }
      if (t > T_TURBO) { pulsa = "turbo"; G.cara = "risa"; G.manoI = [40, 88]; G.brazoIDelante = true; }
    }
    // ---- corren perseguidos por los drones
    if (t >= T_TURBO + 0.3 && t < T_COGE) {
      quienMando = "G";
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.puntas = 0; M.puntas = 0;
      if (corre) {
        const a = andar(t * 22, 1.5), b = andar(t * 22 + 1.4, 1.5), s = Math.sin(t * 22);
        G.piernaI = a.piernaI; G.piernaD = a.piernaD; dyG = a.bote * 1.5; M.piernaI = b.piernaI; M.piernaD = b.piernaD; dyM = b.bote * 1.5;
        G.manoD = [86, 40 + 10 * s]; G.manoI = [-8, 40 - 10 * s];
        M.manoD = [82, 40 - 10 * s]; M.manoI = [-8, 40 + 10 * s];
      } else { G.manoD = [80, 60]; G.manoI = [-2, 60]; M.manoD = [80, 60]; M.manoI = [-6, 60]; G.cara = "dormido"; M.cara = "dormido"; }
      G.rc = 0.08 * Math.sin(t * 9); M.rc = -0.08 * Math.sin(t * 9);
    }
    // ---- Marcos le quita el mando y lo apaga
    if (t >= T_COGE) {
      const mG0 = matAv(xg, PIES, ESC), mM0 = matAv(xm, PIES, ESC);
      const k = eInOut(tramo(t, T_COGE, T_OFF - 0.1));
      // Guillermo le tiende el mando; Marcos lo coge a medio camino
      const hg = aPant(mG0, [69, 86]), hm = aPant(mM0, [11, 93]), pm = [(hg[0] + hm[0]) / 2, hg[1] + 40];
      G.manoD = mezcla([74, 92], enAv(mG0, [pm[0] - 6, pm[1]]), k); G.cara = "sorpresa"; M.cara = "guino";
      M.manoI = mezcla([6, 152], enAv(mM0, [pm[0] + 8, pm[1] + 2]), k); M.brazoIDelante = true;
      quienMando = t > T_OFF - 0.1 ? "MI" : "G";
      if (t > T_OFF - 0.1) { G.manoD = mezcla(G.manoD, [70, 158], eOut(tramo(t, T_OFF - 0.1, T_OFF + 0.2))); pulsa = t < T_OFF + 0.3 ? "off" : ""; }
      if (t > T_OFF + 0.2) {
        // recoge un dron en brazos
        const k2 = eInOut(tramo(t, T_OFF + 0.2, T_CAEN + 0.25));
        M.manoI = mezcla(M.manoI, [14, 112], k2); M.manoD = mezcla([67, 152], [62, 112], k2);
        M.cara = t < T_POSAN ? "sorpresa" : "risa";
        quienMando = "";
      }
      if (t > T_CAEN + 0.4) { G.cara = t < T_POSAN + 0.3 ? "dormido" : "sorpresa"; G.manoD = [84, 70]; G.manoI = [-6, 70]; }
      if (t > T_POSAN + 0.5) { G.cara = "risa"; G.manoD = [70, 158]; G.manoI = [9, 160]; }
      if (t > T_CHORRITO && t < T_CHORRITO + 0.5) { G.cara = "dormido"; G.rc = -0.1; }
      if (t > T_CHORRITO + 0.5) { G.cara = "risa"; G.rc = 0.06; M.cara = "risa"; dyG = -Math.abs(Math.sin(t * 7)) * 5; }
    }
    G.objD = (g, mano) => { traje(g, "guillermo", G.rc || 0, t); if (quienMando === "G") mando(g, mano[0], mano[1], pulsa); };
    M.objD = (g, mano) => { traje(g, "bombero", M.rc || 0, t); if (quienMando === "M") mando(g, mano[0], mano[1], pulsa); };
    if (quienMando === "MI") M.objI2 = (g, mano) => mando(g, mano[0], mano[1], pulsa);
    const mG = matAv(xg, PIES + dyG, ESC), mM = matAv(xm, PIES + dyM, ESC);
    return { G, M, mG, mM, xg, xm };
  }
  /** Adónde va cada dron. */
  objetivo(i, e) {
    const t = this.t;
    if (t < T_DEMO) return i ? [860, 210 + 10 * Math.sin(t * 2)] : [420, 190 + 10 * Math.sin(t * 2 + 1)];
    if (t < T_HOLO_OFF + 0.3) return i ? [HOLO[0] + 130, 270] : [HOLO[0] - 120, 260];
    if (t < T_TURBO) return i ? [880, 120] : [150, 130];
    if (t < T_OFF) {
      const m = i ? e.mM : e.mG, c = aPant(m, [39, -40]);
      return [c[0] + 70 * Math.sin(t * 7 + i * 2), c[1] - 50 + 30 * Math.sin(t * 11 + i)];
    }
    // apagados: caen
    return null;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    const turbo = t > T_TURBO && t < T_OFF;
    this.dr.forEach((d, i) => {
      if (t < T_OFF) {
        const o = this.objetivo(i, e), k = turbo ? 30 : 12, am = turbo ? 4 : 6;
        d.vx += (k * (o[0] - d.x) - am * d.vx) * dt; d.vy += (k * (o[1] - d.y) - am * d.vy) * dt;
        d.x += d.vx * dt; d.y += d.vy * dt;
        d.ox = d.x; d.oy = d.y;
      } else {
        // caen: el 0 a la cabeza de Guillermo, el 1 a los brazos de Marcos
        const u = tramo(t, T_CAEN, T_POSAN);
        const dest = i === 0 ? aPant(e.mG, [39, -14]) : aPant(e.mM, [38, 104]);
        d.x = lerp(d.ox, dest[0], u); d.y = lerp(d.oy, dest[1], eIn(u)) - (u < 1 ? 0 : 0);
      }
    });
    // agua de los drones
    const echa = (i) => {
      const d = this.dr[i];
      if (t > T_DEMO && t < T_HOLO_OFF) return [HOLO[0], HOLO[1] - 60];
      if (turbo && t > T_TURBO + 0.35) { const m = i ? e.mM : e.mG; return aPant(m, [39, 20]); }
      if (t > T_CHORRITO && t < T_CHORRITO + 0.35 && i === 0) return aPant(e.mG, [39, 48]);
      return null;
    };
    this.chorros = [echa(0), echa(1)];
    this.chorros.forEach((T, i) => {
      if (!T) return;
      if (Math.random() < 0.8) this.gotas.push({ x: T[0] + azar(-14, 14), y: T[1] + azar(-6, 6), vx: azar(-160, 160), vy: azar(-200, -20), v: azar(0.4, 0.7) });
      void i;
    });
    for (const d of this.gotas) { d.v -= dt; d.vy += 1000 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > PIES) { d.y = PIES; d.vy = 0; d.vx *= 0.3; } }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 280) this.gotas.splice(0, this.gotas.length - 280);
    // holograma
    if (t > T_DEMO + 0.3) this.holo = Math.max(0, 1 - (t - T_DEMO - 0.3) / 0.6);
    this.una("holo", t > T_HOLO_OFF - 0.1, () => { for (let k = 0; k < 24; k++) { const a = azar(0, 6.283), v = azar(60, 200); p.nueva(P.ELECTRICA, HOLO[0], HOLO[1] - 50, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(10, 16)); } });
    this.una("turbo", t > T_TURBO, () => {
      temblar(16, 0.5);
      for (const d of this.dr) { p.nueva(P.DESTELLO, d.x, d.y, 0, 0, 0.3, 140); for (let k = 0; k < 12; k++) { const a = azar(0, 6.283), v = azar(80, 260); p.nueva(P.CHISPA, d.x, d.y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); } }
    });
    if (turbo && Math.random() < 20 * dt) { const d = this.dr[Math.random() < 0.5 ? 0 : 1]; p.nueva(P.ELECTRICA, d.x + azar(-20, 20), d.y + azar(-10, 10), azar(-60, 60), azar(-60, 60), azar(0.15, 0.3), azar(8, 14)); }
    this.una("off", t > T_OFF, () => { temblar(6, 0.2); for (const d of this.dr) p.nueva(P.DESTELLO, d.x, d.y, 0, 0, 0.25, 90); });
    this.una("bonk", t > T_POSAN, () => {
      temblar(12, 0.3);
      const h = aPant(e.mG, [39, -14]);
      for (let k = 0; k < 8; k++) { const a = azar(-Math.PI, 0), v = azar(80, 200); p.nueva(P.PURPURINA, h[0], h[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1), azar(10, 14)); }
      for (let k = 0; k < 40; k++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, -10), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 14), k % 5);
    });
    p.suelo = () => PIES;
    p.actualizar(dt);
  }

  fondoC() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 470);
    gc.addColorStop(0, "#060a24"); gc.addColorStop(1, "#1a1046");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    // ciudad de neón al fondo
    const r = semilla(55);
    let x = -60;
    while (x < W + 60) {
      const w = 50 + r() * 70, h = 120 + r() * 220;
      g.fillStyle = "#14123a"; g.fillRect(x, 440 - h, w, h);
      g.fillStyle = r() > 0.5 ? "rgba(47,227,232,.6)" : "rgba(255,61,132,.55)";
      g.fillRect(x, 440 - h, w, 3);
      g.fillStyle = "rgba(122,244,255,.35)";
      for (let yy = 440 - h + 14; yy < 430; yy += 18) for (let xx = x + 8; xx < x + w - 10; xx += 14) if (r() > 0.6) g.fillRect(xx, yy, 7, 8);
      x += w + 8;
    }
    // luna/planeta
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB.blanco, 760, -10, 200, 200); g.restore();
    g.fillStyle = "#e8e0ff"; g.beginPath(); g.arc(860, 90, 46, 0, 6.283); g.fill();
    // suelo con rejilla de neón
    const gs = g.createLinearGradient(0, 440, 0, H);
    gs.addColorStop(0, "#1a0f3a"); gs.addColorStop(1, "#08061a");
    g.fillStyle = gs; g.fillRect(-60, 440, W + 120, H);
    g.strokeStyle = "rgba(47,227,232,.5)"; g.lineWidth = 2;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(512 + i * 40, 440); g.lineTo(512 + i * 160, H + 60); g.stroke(); }
    for (let k = 0; k < 7; k++) { const y = 440 + Math.pow(k / 6, 1.8) * 170; g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    // cartel
    g.fillStyle = "rgba(10,14,40,.85)"; rectR(g, 352, 200, 320, 66, 10); g.fill();
    g.strokeStyle = "#2fe3e8"; g.lineWidth = 3; rectR(g, 352, 200, 320, 66, 10); g.stroke();
    txt(g, "BOMBEROS", 512, 248, { tam: 46, peso: 900, fam: FD, color: "#7af4ff", esp: 8, glow: "rgba(47,227,232,.9)", glowTam: 16 });
    return (this.cF = c);
  }
  /** Dron-manguera (diseño propio). */
  dron(g, d, i, t) {
    const t0 = this.t, encendido = t0 < T_OFF, turbo = t0 > T_TURBO && t0 < T_OFF;
    const ang = turbo ? 0.4 * Math.sin(t0 * 13 + i) : 0.08 * Math.sin(t0 * 3 + i);
    g.save(); g.translate(d.x, d.y); g.rotate(ang);
    // brazos y rotores
    g.strokeStyle = "#5d656e"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(-36, -14); g.lineTo(36, -14); g.stroke();
    for (const x of [-36, 36]) {
      g.fillStyle = "#3a3d42"; g.fillRect(x - 3, -22, 6, 10);
      if (encendido) {
        g.fillStyle = turbo ? "rgba(255,120,160,.45)" : "rgba(200,230,255,.45)";
        g.beginPath(); g.ellipse(x, -22, 22, 3.5, 0, 0, 6.283); g.fill();
        g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 20 * Math.cos(t0 * 60 + x), -22); g.lineTo(x + 20 * Math.cos(t0 * 60 + x), -22); g.stroke();
      } else { g.fillStyle = "#1b1d22"; g.fillRect(x - 18, -24, 36, 3); }
    }
    // cuerpo
    const gr = g.createRadialGradient(-8, -10, 4, 0, 0, 30);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#d8e0e8"); gr.addColorStop(1, "#7d868e");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 30, 20, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#5d656e"; g.lineWidth = 1.5; g.stroke();
    // ojo
    g.fillStyle = "#14161a"; g.beginPath(); g.ellipse(0, 0, 14, 10, 0, 0, 6.283); g.fill();
    if (encendido) {
      const col = turbo ? BLOB.rojo : BLOB2.cian;
      g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(col, -22, -18, 44, 36); g.restore();
      g.fillStyle = turbo ? "#ff3a5a" : "#7af4ff";
      if (turbo) { g.beginPath(); g.moveTo(-9, -5); g.lineTo(9, -1); g.lineTo(-9, 4); g.closePath(); g.fill(); }
      else { g.beginPath(); g.arc(0, 0, 6, 0, 6.283); g.fill(); }
    } else {
      g.strokeStyle = "#7af4ff"; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(-7, -4); g.lineTo(7, 4); g.moveTo(7, -4); g.lineTo(-7, 4); g.stroke();
    }
    // boquilla
    g.fillStyle = "#d9a516"; g.beginPath(); g.moveTo(-5, 18); g.lineTo(5, 18); g.lineTo(3, 28); g.lineTo(-3, 28); g.closePath(); g.fill();
    g.restore();
  }
  holograma(g, t) {
    const [x, y] = HOLO;
    // pedestal
    g.fillStyle = "#2a2e3a"; rectR(g, x - 34, y - 10, 68, 20, 6); g.fill();
    g.fillStyle = "#2fe3e8"; g.fillRect(x - 26, y - 6, 52, 3);
    g.fillStyle = "#1b1d22"; g.fillRect(x - 24, y + 10, 48, PIES - y - 10);
    if (this.holo <= 0.01) return;
    g.save(); g.globalAlpha = this.holo * (0.75 + 0.25 * Math.sin(t * 40)); g.globalCompositeOperation = "lighter";
    g.drawImage(BLOB.naranja, x - 50, y - 120, 100, 120);
    for (const [k, col] of [[1, "#ff6a2a"], [0.7, "#ffb02a"], [0.4, "#fff0a0"]]) {
      const h = 90 * k * (1 + 0.1 * Math.sin(t * 20 + k * 4)), w = 26 * k;
      g.fillStyle = col; g.beginPath(); g.moveTo(x, y - 8 - h); g.quadraticCurveTo(x + w * 1.4, y - 8 - h * 0.3, x, y - 8); g.quadraticCurveTo(x - w * 1.4, y - 8 - h * 0.3, x, y - 8 - h); g.fill();
    }
    // líneas de holograma
    g.fillStyle = "rgba(47,227,232,.25)"; for (let yy = y - 100; yy < y - 8; yy += 6) g.fillRect(x - 40, yy, 80, 2);
    g.restore();
  }

  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoC(), -60, -60);
    this.holograma(g, t);
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // drones (el que se posa en la cabeza va por delante)
    this.dr.forEach((d, i) => this.dron(g, d, i, t));
    // el mando por el aire
    if (t > T_PIDE + 0.25 && t < T_DA) {
      const u = tramo(t, T_PIDE + 0.25, T_DA), a = aPant(e.mM, [84, 74]), b = aPant(e.mG, [92, 104]);
      g.save(); g.translate(lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 120 * 4 * u * (1 - u)); g.rotate(u * 9); g.scale(ESC, ESC);
      mando(g, 0, 0, ""); g.restore();
    }
    // chorros de los drones
    (this.chorros || []).forEach((T, i) => { if (T) { const d = this.dr[i]; chorro(g, [d.x, d.y + 26], T, -10, 1, t); } });
    g.fillStyle = "rgba(170,225,255,.9)";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3, 4.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡PERFECTO!", 480, 330, T_HOLO_OFF - 0.1, 0.8, 44, "#7af4ff", "#032838", -0.06);
    if (t > T_PIDE && t < T_DA + 0.3) bocadillo(g, 150, 196, "¿ME DEJAS?", e.xg + 10, PIES - 330, tramo(t, T_PIDE, T_PIDE + 0.2) * (1 - tramo(t, T_DA + 0.1, T_DA + 0.3)), 32);
    ono("¡BIIIIIP!", 230, 320, T_TURBO + 0.5, 0.8, 44, "#ff9ac0", "#2a0012", -0.1);
    ono("¡SPLASH!", 820, 330, T_CORRE + 1.2, 0.6, 46, "#bfeaff", "#0a2a48", 0.1);
    ono("¡CLIC!", e.xm + 110, 300, T_OFF, 0.6, 54, "#2bff5b", "#03230c", 0.1);
    ono("¡BONK!", e.xg - 150, 290, T_POSAN, 0.8, 54, "#fffdf5", "#1b1b1b", -0.1);
    ono("pfff…", e.xg - 120, 300, T_CHORRITO, 0.7, 38, "#bfeaff", "#0a2a48", -0.06);
    // ¡MODO TURBO!
    const tit = (t0, t1, z0) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.14), s = lerp(z0, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 12)), sal = tramo(t, t1 - 0.25, t1);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512 + (d < 0.5 ? azar(-6, 6) : 0), 92); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_TURBO, T_CORRE + 1.3, 2.2);
    tit(T_POSAN + 0.3, DUR, 1.15);
    const a = Math.max(1 - tramo(t, 0.02, 0.5), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00246", nombre: "Bomberos del futuro", crear: () => new BomberosDelFuturo() });
})();
