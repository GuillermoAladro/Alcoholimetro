"use strict";
/*
 * 00153 · MONTAÑA RUSA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Al atardecer, Guillermo y Rodrigo suben la cuesta de una montaña rusa en un vagón, cada uno con su jarra en alto
 * (clac, clac, clac). Arriba se paran un instante: ¡AGÁRRATE! Caída en picado con el pelo de punta, un looping
 * completo… y la cerveza no se derrama ni boca abajo. Frenan entre chispas, mareados (estrellitas), miran las jarras:
 * ¡llenas! Brindan y el vagón se mete en el túnel.
 */
(() => {
const cache = cacheTexto();
const ESC = 0.95, GRAV = 1400, LOOPC = [1110, 420], LOOPR = 200, SUELO = 700, SEP = 62;
const T_CIMA = 3.0, T_CAE = 3.3, T_CHIN = 7.95, T_TUNEL = 8.75;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(760, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#7af7ff"); gr.addColorStop(1, "#1a9ae8");
  g.save(); g.translate(380, 105); g.transform(1, 0, -0.1, 1, 0, 0);
  txt(g, "¡AGÁRRATE!", 8, 52, { tam: 128, peso: 400, fam: FC, color: "#2a0a4a", esp: 4 });
  txt(g, "¡AGÁRRATE!", 0, 44, { tam: 128, peso: 400, fam: FC, color: gr, borde: "#2a0a4a", bordeAncho: 11, esp: 4, glow: "rgba(80,220,255,.8)", glowTam: 24 });
  g.restore();
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function jarraIzq(pose, inc, nivel) {
  pose.objI = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); };
  pose.objI2 = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t); g.restore(); };
}

/** La vía: puntos cada ~2 px y su longitud acumulada. */
function construirVia() {
  const pts = [];
  const linea = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2); for (let i = 1; i <= n; i++) pts.push(mezcla(a, b, i / n)); };
  const curva = (a, c, b) => { for (let i = 1; i <= 60; i++) { const u = i / 60; pts.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); } };
  pts.push([-400, 520]);
  linea([-400, 520], [60, 520]);
  curva([60, 520], [110, 520], [160, 470]);
  linea([160, 470], [430, 170]);
  curva([430, 170], [500, 92], [580, 140]);
  linea([580, 140], [800, 520]);
  curva([800, 520], [860, 620], [980, 620]);
  linea([980, 620], [LOOPC[0], LOOPC[1] + LOOPR]);
  const iniLoop = pts.length;
  for (let i = 1; i <= 480; i++) { const a = Math.PI / 2 - (i / 480) * Math.PI * 2; pts.push([LOOPC[0] + 50 * (i / 480) + Math.cos(a) * LOOPR, LOOPC[1] + Math.sin(a) * LOOPR]); }
  const finLoop = pts.length;
  linea(pts[pts.length - 1], [2600, 620]);
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, L, total: L[L.length - 1], sLoop0: L[iniLoop], sLoop1: L[finLoop - 1] };
}
function enVia(V, s) {
  s = clamp(s, 0, V.total);
  let lo = 0, hi = V.L.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (V.L[m] <= s) lo = m; else hi = m; }
  const a = V.pts[lo], b = V.pts[hi], u = (s - V.L[lo]) / Math.max(1e-6, V.L[hi] - V.L[lo]);
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}

class MontanaRusa extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(320);
    this.V = construirVia();
    // recorrido del vagón: subida a ritmo fijo y luego física (caída libre, looping y frenada), precalculado
    const V = this.V;
    const sIni = 470, sCima = (() => { let best = 0, y = 1e9; for (let i = 0; i < V.pts.length && V.pts[i][0] < 700; i++) if (V.pts[i][1] < y) { y = V.pts[i][1]; best = V.L[i]; } return best; })();
    const tabla = [];
    let s = sIni, v = 0, sFreno = V.sLoop1 + 120, parado = -1;
    const dt = 1 / 240;
    for (let t = 0; t <= this.dur + 0.01; t += dt) {
      tabla.push(s);
      if (t < T_CIMA) s = lerp(sIni, sCima - 18, t / T_CIMA);
      else if (t < T_CAE) s = lerp(sCima - 18, sCima + 6, (t - T_CIMA) / (T_CAE - T_CIMA));
      else if (s < sFreno) {
        const y0 = enVia(V, sCima + 6).y, y = enVia(V, s).y;
        v = Math.sqrt(Math.max(40 * 40, 70 * 70 + 2 * GRAV * (y - y0)));
        s += v * dt;
      } else if (t < T_TUNEL) {
        v = Math.max(0, v - 1500 * dt); s += v * dt;
        if (v === 0 && parado < 0) parado = t;
      } else { v = Math.min(420, v + 650 * dt); s += v * dt; }
    }
    this.tabla = tabla; this.dtT = dt; this.parado = parado;
    this.sParada = tabla[Math.min(tabla.length - 1, Math.round(T_TUNEL / dt))];
    this.posParada = enVia(V, this.sParada);
    this.TUNEL = this.posParada.x + 178;
    this.rayas = [];
    this.fondoC = null;
  }
  s() { const i = this.t / this.dtT, a = Math.floor(i); return lerp(this.tabla[Math.min(a, this.tabla.length - 1)], this.tabla[Math.min(a + 1, this.tabla.length - 1)], i - a); }
  vagon(d = 0) {
    const q = enVia(this.V, this.s() + d);
    // traqueteo en la subida
    if (this.t < T_CIMA) q.y += Math.abs(Math.sin(this.t * 22)) * 1.5;
    return q;
  }
  camara(q) {
    const t = this.t;
    const sigue = [q.x + 60, q.y - 120], quieto = [this.posParada.x + 10, this.posParada.y - 130];
    const loop = [LOOPC[0] + 30, LOOPC[1] - 6];
    let c, z;
    if (t < 3.55) { c = sigue; z = 1.15; }
    else if (t < 4.2) { const k = eInOut(tramo(t, 3.55, 4.2)); c = mezcla(sigue, loop, k); z = lerp(1.15, 0.84, k); }
    else if (t < 5.5) { c = loop; z = 0.84; }
    else { const k = eInOut(tramo(t, 5.5, 6.5)); c = mezcla(loop, t > T_TUNEL ? quieto : [q.x + 10, q.y - 130], k); z = lerp(0.84, 1.15, k); }
    return { c, z };
  }
  poses() {
    const t = this.t;
    // sentados: las piernas suben y quedan escondidas dentro del vagón
    const G = { cara: "guino", rc: 0, piernaI: [-44, 0], piernaD: [-44, 0] };
    const R = { quien: "rodrigo", cara: "sorpresa", rc: 0, piernaI: [-46, 0], piernaD: [-46, 0] };
    const mG = matAv(0, -60, ESC, 0, 1, 1, [39, 146]), mR = matAv(0, -60, ESC, 0, 1, 1, [39, 146]);
    let gI = [20, 12], rD = [58, 32], gD = [78, 108], rI = [2, 110];
    const baile = Math.sin(t * 3) * 3;
    gI = [gI[0], gI[1] + baile]; rD = [rD[0], rD[1] - baile];
    let puntas = 0;
    // subida: Rodrigo mira abajo con miedo, Guillermo tan pancho
    if (t < T_CIMA) { R.rc = -0.12 + 0.05 * Math.sin(t * 5); G.rc = 0.06 * Math.sin(t * 2); G.cara = t < 1.5 ? "guino" : "sonrisa"; R.cara = t < 1.8 ? "sorpresa" : "dormido"; }
    else if (t < T_CAE + 0.1) { G.cara = "risa"; R.cara = "sorpresa"; G.rc = -0.12; R.rc = 0.05; }
    else if (t < 6.4) {
      // ¡viaje!
      G.cara = "risa"; R.cara = t % 0.6 < 0.3 ? "sorpresa" : "risa";
      puntas = 1; G.rc = -0.1 + 0.05 * Math.sin(t * 20); R.rc = -0.1 + 0.05 * Math.sin(t * 22);
    } else {
      // mareados… y las jarras, ¡llenas!
      puntas = 1 - tramo(t, 6.4, 7.5);
      G.cara = "borracho"; R.cara = "borracho";
      G.rc = 0.12 * Math.sin(t * 4); R.rc = 0.12 * Math.sin(t * 4 + 2);
      if (t > 7.3) { G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = -0.12; R.rc = 0.12; }
      if (t > 7.65) { G.cara = "risa"; R.cara = "risa"; }
    }
    G.puntas = puntas; R.puntas = puntas;
    // brindis
    if (t > T_CHIN - 0.35) {
      // punto del brindis entre los dos vagones (ya en llano)
      const k = eInOut(tramo(t, T_CHIN - 0.35, T_CHIN));
      const choque = Math.sin(Math.PI * tramo(t, T_CHIN, T_CHIN + 0.2)) * 4;
      gI = mezcla(gI, enAv(mG, [-SEP + 30 + choque, -232]), k);
      rD = mezcla(rD, enAv(mR, [SEP - 30 - choque, -232]), k);
      if (t > T_CHIN + 0.3) { const k2 = eInOut(tramo(t, T_CHIN + 0.3, T_CHIN + 0.6)); gI = mezcla(gI, [20, 12 + baile], k2); rD = mezcla(rD, [58, 32 - baile], k2); }
    }
    G.manoI = gI; G.manoD = gD; R.manoD = rD; R.manoI = rI;
    jarraIzq(G, -0.05, 1);
    R.jarra = { inc: -0.05, nivel: 1 };
    return { G, R, mG, mR };
  }
  /** De coordenadas del vagón al mundo. */
  aMundo(q, p) { const r = rot2(p, q.ang); return [q.x + r[0], q.y + r[1]]; }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, q = this.vagon();
    const s = this.s(), v = (this.tabla[Math.min(this.tabla.length - 1, Math.round(t / this.dtT) + 1)] - this.tabla[Math.min(this.tabla.length - 1, Math.round(t / this.dtT))]) / this.dtT;
    // chispas de las ruedas al frenar
    if (t > 5.3 && t < 7 && v > 60 && s > this.V.sLoop1 + 100) {
      for (const d of [-SEP, SEP]) if (Math.random() < 40 * dt) { const qq = this.vagon(d), w = this.aMundo(qq, [0, 0]); p.nueva(P.CHISPA, w[0], w[1], -azar(100, 400), azar(-260, -60), azar(0.3, 0.6), azar(7, 12)); }
    }
    this.una("cima", t > T_CIMA + 0.05, () => temblar(6, 0.2));
    this.una("cae", t > T_CAE + 0.1, () => temblar(10, 0.4));
    this.una("chin", t > T_CHIN, () => {
      temblar(12, 0.3);
      const qa = this.vagon(SEP), qb = this.vagon(-SEP), w = [(qa.x + qb.x) / 2, (qa.y + qb.y) / 2 - 232];
      p.nueva(P.DESTELLO, w[0], w[1], 0, 0, 0.35, 180);
      for (let i = 0; i < 28; i++) { const a = azar(-Math.PI, 0), vv = azar(120, 420); p.nueva(P.ESPUMA, w[0], w[1], Math.cos(a) * vv, Math.sin(a) * vv, azar(0.6, 1.0), azar(5, 10)); }
      for (let i = 0; i < 14; i++) { const a = azar(-Math.PI, 0), vv = azar(150, 380); p.nueva(P.CHISPA, w[0], w[1], Math.cos(a) * vv, Math.sin(a) * vv, azar(0.3, 0.6), azar(6, 10)); }
    });
    // rayas de viento
    if (t > T_CAE && t < 5.6 && Math.random() < 30 * dt) this.rayas.push({ x: W + 40, y: azar(40, 560), l: azar(80, 220), v: azar(1600, 2400), a: 1 });
    for (const r of this.rayas) { r.x -= r.v * dt; r.a -= dt * 1.5; }
    this.rayas = this.rayas.filter((r) => r.a > 0 && r.x + r.l > -50);
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    const gc = g.createLinearGradient(0, -40, 0, H + 40);
    gc.addColorStop(0, "#2a1a6a"); gc.addColorStop(0.45, "#c0408a"); gc.addColorStop(0.8, "#ff9a5a"); gc.addColorStop(1, "#ffd08a");
    g.fillStyle = gc; g.fillRect(-40, -40, W + 80, H + 80);
    const r = semilla(4);
    g.fillStyle = "#fff";
    for (let i = 0; i < 50; i++) { g.globalAlpha = 0.3 + 0.6 * r(); g.beginPath(); g.arc(r() * W, r() * 200, 0.6 + r() * 1.2, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.naranja, 620, 380, 420, 260); g.restore();
    this.fondoC = c;
    return c;
  }
  lejos(g, cx) {
    // noria y siluetas lejanas con paralaje
    const off = -((cx * 0.12) % 1400);
    g.save(); g.translate(off, 0);
    for (const base of [0, 1400]) {
      g.fillStyle = "#3a1a4a";
      g.beginPath(); g.moveTo(base - 40, H + 40);
      for (let x = -40; x <= 1440; x += 70) g.lineTo(base + x, 470 - 40 * Math.abs(Math.sin(x * 0.013)) - ((x * 37) % 50));
      g.lineTo(base + 1440, H + 40); g.closePath(); g.fill();
      // noria
      const nx = base + 300, ny = 330, nr = 110;
      g.strokeStyle = "rgba(80,40,110,.95)"; g.lineWidth = 4;
      g.beginPath(); g.arc(nx, ny, nr, 0, 6.283); g.stroke();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + this.t * 0.2; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + Math.cos(a) * nr, ny + Math.sin(a) * nr); g.stroke(); g.fillStyle = i % 2 ? "#ffd34d" : "#ff7aa8"; g.beginPath(); g.arc(nx + Math.cos(a) * nr, ny + Math.sin(a) * nr, 7, 0, 6.283); g.fill(); }
      g.beginPath(); g.moveTo(nx - 60, 480); g.lineTo(nx, ny); g.lineTo(nx + 60, 480); g.stroke();
    }
    g.restore();
  }
  via(g, t) {
    const V = this.V;
    // soportes
    g.strokeStyle = "#4a3a5a"; g.lineWidth = 7;
    for (let s = 0; s < V.total; s += 80) {
      if (s > V.sLoop0 - 20 && s < V.sLoop1 + 20) continue;
      const q = enVia(V, s);
      if (q.y < SUELO - 20) { g.beginPath(); g.moveTo(q.x, q.y + 6); g.lineTo(q.x, SUELO + 40); g.stroke(); }
    }
    for (const dx of [-150, 200]) { g.beginPath(); g.moveTo(LOOPC[0] + dx, LOOPC[1] + 90); g.lineTo(LOOPC[0] + dx * 0.6, SUELO + 40); g.stroke(); }
    // traviesas y raíles
    g.strokeStyle = "#5a4a2a"; g.lineWidth = 3;
    for (let s = 0; s < V.total; s += 18) {
      const q = enVia(V, s), n = [-Math.sin(q.ang), Math.cos(q.ang)];
      g.beginPath(); g.moveTo(q.x - n[0] * 3, q.y - n[1] * 3); g.lineTo(q.x + n[0] * 12, q.y + n[1] * 12); g.stroke();
    }
    for (const [off, col, w] of [[9, "#8a1020", 5], [0, "#e8283a", 5]]) {
      g.strokeStyle = col; g.lineWidth = w; g.lineJoin = "round";
      g.beginPath();
      for (let i = 0; i < V.pts.length; i += 3) {
        const a = V.pts[i], b = V.pts[Math.min(i + 3, V.pts.length - 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const x = a[0] - Math.sin(ang) * -off, y = a[1] + Math.cos(ang) * off;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    }
    // bombillas
    for (let s = 20, i = 0; s < V.total; s += 48, i++) {
      const q = enVia(V, s), n = [-Math.sin(q.ang), Math.cos(q.ang)];
      const on = Math.sin(t * 6 + i * 1.3) > -0.3;
      g.fillStyle = on ? (i % 2 ? "#ffe680" : "#ff9ad0") : "#6a5a4a";
      g.beginPath(); g.arc(q.x + n[0] * 14, q.y + n[1] * 14, 3.2, 0, 6.283); g.fill();
    }
  }
  carro(g, t, front, col) {
    if (!front) {
      g.fillStyle = col[2]; rectR(g, -50, -98, 92, 34, 12); g.fill();
      return;
    }
    // ruedas
    for (const x of [-34, 34]) { g.fillStyle = "#222"; g.beginPath(); g.arc(x, -6, 10, 0, 6.283); g.fill(); g.fillStyle = "#999"; g.beginPath(); g.arc(x, -6, 3.6, 0, 6.283); g.fill(); }
    // cuerpo
    const gr = g.createLinearGradient(0, -100, 0, -14);
    gr.addColorStop(0, col[0]); gr.addColorStop(0.5, col[1]); gr.addColorStop(1, col[2]);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-54, -88); g.lineTo(40, -88); g.quadraticCurveTo(66, -78, 64, -40); g.quadraticCurveTo(60, -14, 36, -14); g.lineTo(-44, -14); g.quadraticCurveTo(-58, -14, -58, -34); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#ffd34d"; g.fillRect(-54, -60, 116, 7);
    g.fillStyle = "rgba(255,255,255,.35)"; rectR(g, -48, -84, 90, 5, 2.5); g.fill();
    for (const x of [-30, 0, 30]) { g.fillStyle = "#ffe680"; g.beginPath(); g.arc(x, -34, 4.5, 0, 6.283); g.fill(); }
    // barra de seguridad
    g.strokeStyle = "#ffd34d"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(-50, -96); g.lineTo(50, -96); g.stroke();
    g.strokeStyle = "#c8a020"; g.lineWidth = 4;
    for (const x of [-46, 46]) { g.beginPath(); g.moveTo(x, -96); g.lineTo(x, -86); g.stroke(); }
  }
  tunel(g, x0) {
    const y0 = 380, y1 = SUELO + 60;
    g.fillStyle = "#2a2036"; g.fillRect(x0 - 30, y0, 400, y1 - y0);
    g.fillStyle = "#3a2e4a"; g.fillRect(x0 - 40, y0 - 20, 420, 26);
    const gr = g.createLinearGradient(x0, 0, x0 + 90, 0);
    gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(x0, 640); g.lineTo(x0, 470); g.quadraticCurveTo(x0 + 120, 380, x0 + 240, 470); g.lineTo(x0 + 240, 640); g.closePath(); g.fill();
    for (let i = 0; i < 7; i++) { g.fillStyle = Math.sin(this.t * 8 + i) > 0 ? "#ffe680" : "#ff7aa8"; g.beginPath(); g.arc(x0 - 14 + i * 44, y0 + 8, 5, 0, 6.283); g.fill(); }
  }
  dibujar(g) {
    const t = this.t, q = this.vagon(), cam = this.camara(q), e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -40, -40);
    this.lejos(g, cam.c[0]);
    // rayas de viento (pantalla)
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 3; g.lineCap = "round";
    for (const r of this.rayas) { g.globalAlpha = r.a * 0.8; g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x + r.l, r.y); g.stroke(); }
    g.globalAlpha = 1;
    // mundo
    g.save();
    g.translate(512, 330); g.scale(cam.z, cam.z); g.translate(-cam.c[0], -cam.c[1]);
    g.fillStyle = "#2a1a30"; g.fillRect(cam.c[0] - 1200, SUELO, 2400, 900);
    g.fillStyle = "#4a2a50"; g.fillRect(cam.c[0] - 1200, SUELO, 2400, 6);
    this.via(g, t);
    // los dos vagones, cada uno con su pasajero (Rodrigo detrás, Guillermo delante)
    const qR = this.vagon(-SEP), qG = this.vagon(SEP);
    g.strokeStyle = "#333"; g.lineWidth = 6;
    const c1 = this.aMundo(qR, [40, -24]), c2 = this.aMundo(qG, [-40, -24]);
    g.beginPath(); g.moveTo(c1[0], c1[1]); g.lineTo(c2[0], c2[1]); g.stroke();
    for (const [qq, m, pose, R, col] of [[qR, e.mR, e.R, avatar("rodrigo").rig, ["#ffd34d", "#e8a010", "#8a5a00"]], [qG, e.mG, e.G, avatar().rig, ["#ff4a5a", "#d8102a", "#7a0010"]]]) {
      g.save(); g.translate(qq.x, qq.y); g.rotate(qq.ang);
      this.carro(g, t, false, col);
      pintarAvatar(g, m, pose, t);
      this.carro(g, t, true, col);
      // estrellitas de mareo
      if (t > 6.5 && t < 7.4) {
        const c = aPant(m, R.frente);
        for (let i = 0; i < 3; i++) {
          const a = t * 6 + (i / 3) * 6.283;
          g.fillStyle = "#ffe680"; estrella(g, c[0] + Math.cos(a) * 34, c[1] - 34 + Math.sin(a) * 9, 7, 3, a); g.fill();
        }
      }
      g.restore();
    }
    this.tunel(g, this.TUNEL);
    this.p.dibujar(g);
    g.restore();
    // ¡AGÁRRATE!
    if (t > T_CIMA + 0.05) {
      const d = t - T_CIMA - 0.05, k = tramo(d, 0, 0.18), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 84); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.45), tramo(t, 9.65, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00153", nombre: "Montaña rusa", crear: () => new MontanaRusa() });
})();
