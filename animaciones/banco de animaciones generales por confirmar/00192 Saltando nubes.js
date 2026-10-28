"use strict";
/*
 * 00192 · SALTANDO NUBES
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Marcos caen del cielo sobre dos nubes que hacen de cama elástica (¡BOING!) y van saltando de nube en
 * nube, cada vez más alto (la cámara sube con ellos): Marcos con volteretas, Guillermo con una estrella y un giro.
 * El último salto los deja sentados en una nube con forma de sofá: ¡A LAS NUBES! Una nubecilla camarera les trae dos
 * jarras y brindan. Fundido a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4, SY = -600;          // asiento del sofá (en el mundo)
const SOFA_X = 512, XG_F = 432, XM_F = 600;
const T_SOFA_G = 5.4, T_SOFA_M = 5.6, T_TXT = 5.65, T_CAMARERA = 6.9, T_CHIN = 8.1;
const PB = [516, 330];
// nubes trampolín: x, y de arriba (mundo), ancho
const NUBES = [[300, 520, 240], [720, 520, 240], [420, 250, 210], [620, 285, 210], [290, -30, 210], [740, 10, 210], [392, -300, 200], [642, -282, 200]];
// saltos: [t0, t1, nube origen (-1 = cae del cielo), destino (-2 = sofá), truco]
const SALTOS_G = [[0.3, 1.0, -1, 0, ""], [1.0, 2.0, 0, 2, "bote"], [2.0, 3.0, 2, 4, "estrella"], [3.0, 4.05, 4, 6, "giro"], [4.05, T_SOFA_G, 6, -2, "bote"]];
const SALTOS_M = [[0.45, 1.15, -1, 1, ""], [1.15, 2.15, 1, 3, "voltereta"], [2.15, 3.15, 3, 5, "bote"], [3.15, 4.2, 5, 7, "doble"], [4.2, T_SOFA_M, 7, -2, "bote"]];

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(960, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff2a8"); gr.addColorStop(1, "#ffb21f");
  txt(g, "¡A LAS NUBES!", 486, 152, { tam: 120, peso: 400, fam: FB, color: "#1a3a6a", esp: 3 });
  txt(g, "¡A LAS NUBES!", 480, 144, { tam: 120, peso: 400, fam: FB, color: gr, borde: "#1a3a6a", bordeAncho: 11, esp: 3, glow: "rgba(255,255,255,.9)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function mAv(x, y, esc, giro, sy, q) {
  const px = q === "marcos" ? 37 : 39;
  return matAv(x, y - 116 * esc * sy, esc, giro, 1, sy, [px, 116]);
}
/** Lienzo de una nube (blanca con sombra lila abajo). */
function hacerNube(w, h, n, sem) {
  const c = lienzoNuevo(w + 40, h + 40), g = c.getContext("2d");
  const r = semilla(sem);
  const bolas = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1); bolas.push([20 + w * (0.1 + 0.8 * u), 20 + h * (0.62 - 0.4 * Math.sin(u * Math.PI)) + r() * 8, h * (0.28 + 0.2 * Math.sin(u * Math.PI)) + r() * 6]); }
  g.fillStyle = "#c9d4f2";
  for (const [x, y, rr] of bolas) { g.beginPath(); g.arc(x, y + 6, rr, 0, 6.283); g.fill(); }
  g.beginPath(); g.ellipse(20 + w / 2, 20 + h * 0.72, w * 0.46, h * 0.24, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(0, 20, 0, 20 + h);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#f2f5ff"); gr.addColorStop(1, "#dfe6fb");
  g.fillStyle = gr;
  for (const [x, y, rr] of bolas) { g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill(); }
  g.beginPath(); g.ellipse(20 + w / 2, 20 + h * 0.66, w * 0.45, h * 0.22, 0, 0, 6.283); g.fill();
  return c;
}

class SaltandoNubes extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(360);
    this.cieloC = null; this.spr = null;
    this.botes = new Map();   // nube -> instante del último bote
    const r = semilla(21);
    this.lejanas = [];
    for (let i = 0; i < 9; i++) this.lejanas.push([r() * W, 600 - i * 260 - r() * 120, 0.5 + r() * 0.5]);
  }
  sprites() {
    if (this.spr) return this.spr;
    this.spr = { nube: hacerNube(220, 90, 6, 3), nube2: hacerNube(220, 90, 7, 8), lejana: hacerNube(160, 60, 5, 12), mini: hacerNube(130, 60, 5, 5) };
    return this.spr;
  }
  camY() {
    const K = [[0.95, 20], [2.05, 272], [3.08, 550], [4.12, 831], [5.5, 1070]], t = this.t;
    if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (t < K[i][0]) return lerp(K[i - 1][1], K[i][1], eInOut(tramo(t, K[i - 1][0], K[i][0])));
    return K[K.length - 1][1];
  }
  /** Posición (pies, en el mundo) y estado de un avatar según su lista de saltos. */
  vuelo(lista, xFin, t) {
    for (const [t0, t1, a, b, truco] of lista) {
      const ultimo = b === -2;
      if (t >= t0 && t < t1) {
        const u = tramo(t, t0, t1);
        const A = a === -1 ? [b === 0 ? 300 : 720, -260] : [NUBES[a][0], NUBES[a][1]];
        const B = b === -2 ? [xFin, SY + 86 * ESC] : [NUBES[b][0], NUBES[b][1]];
        const alto = a === -1 ? 0 : 110 + Math.max(0, A[1] - B[1]) * 0.25;
        const yy = a === -1 ? lerp(A[1], B[1], eIn(u)) : lerp(A[1], B[1], u) - alto * 4 * u * (1 - u);
        return { x: lerp(A[0], B[0], eInOut(u)), y: yy, aire: true, u, truco, desde: t0, enSofa: ultimo && u > 0.6 };
      }
    }
    const ult = lista[lista.length - 1];
    if (t >= ult[1]) return { x: xFin, y: SY + 86 * ESC, aire: false, sofa: true, desde: ult[1], enSofa: true };
    return { x: -500, y: -2000, aire: true, u: 0, truco: "", fuera: true };
  }
  poses() {
    const t = this.t, cam = this.camY();
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 112], manoI: [-2, 112] };
    const M = { quien: "marcos", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [76, 112], manoI: [-2, 112] };
    const vG = this.vuelo(SALTOS_G, XG_F, t), vM = this.vuelo(SALTOS_M, XM_F, t);
    const res = {};
    for (const [P_, v, q] of [[G, vG, null], [M, vM, "marcos"]]) {
      let giro = 0, sy = 1;
      if (v.aire && !v.fuera) {
        const u = v.u;
        P_.piernaI = [-12, 0.25]; P_.piernaD = [-12, -0.25];
        if (u < 0.15 || u > 0.85) { P_.piernaI = [0, 0.05]; P_.piernaD = [0, -0.05]; }
        P_.manoD = q ? [76, 40] : [86, 36]; P_.manoI = q ? [-2, 40] : [-8, 36];
        if (v.truco === "estrella") { const k = Math.sin(Math.PI * u); P_.piernaI = [-4, 0.55 * k]; P_.piernaD = [-4, -0.55 * k]; P_.manoD = [112, 70]; P_.manoI = [-34, 70]; P_.cara = "guino"; }
        if (v.truco === "voltereta") giro = -6.283 * eInOut(tramo(u, 0.2, 0.8));
        if (v.truco === "doble") { giro = -12.566 * eInOut(tramo(u, 0.15, 0.85)); P_.cara = "guino"; }
        if (v.truco === "giro") { giro = 6.283 * eInOut(tramo(u, 0.2, 0.8)); P_.cara = u < 0.8 ? "sorpresa" : "risa"; }
        if (v.truco === "" ) { P_.cara = "sorpresa"; P_.manoD = q ? [76, 30] : [86, 26]; P_.manoI = q ? [-2, 30] : [-8, 26]; }
      } else if (!v.aire && !v.sofa) {
        sy = 1;
      }
      // al aterrizar en una nube: aplastón
      const dt0 = t - v.desde;
      if (v.aire && v.u < 0.12 && v.desde > 0.9) sy = 1 - 0.18 * Math.sin(Math.PI * clamp(v.u / 0.12, 0, 1));
      let x = v.x, y = v.y + cam;
      if (v.sofa) {
        // sentados en el sofá
        sy = 1 - 0.12 * Math.sin(Math.PI * clamp(dt0 / 0.3, 0, 1));
        P_.cara = dt0 < 0.3 ? "sorpresa" : "risa";
        P_.manoD = q ? [74, 132] : [84, 138]; P_.manoI = q ? [0, 132] : [-6, 140];
        P_.rc = (q ? -1 : 1) * 0.08;
      }
      res[q ? "M" : "G"] = { m: mAv(x, y, ESC, giro, sy, q), pose: P_, x, y, enSofa: !!v.enSofa };
    }
    // relajados y brindis con las jarras de la nubecilla
    const eG = res.G, eM = res.M;
    if (t > 6.2 && t < T_CAMARERA + 0.4) { G.cara = "dormido"; M.cara = "dormido"; G.rc = 0.12; M.rc = -0.12; }
    const jarras = this.jarras();
    if (t > T_CAMARERA + 0.4) {
      G.cara = "sorpresa"; M.cara = "sorpresa";
      const kC = eInOut(tramo(t, T_CAMARERA + 0.55, T_CAMARERA + 0.85));
      const kB = eInOut(tramo(t, T_CHIN - 0.3, T_CHIN)), choca = Math.max(0, 1 - Math.abs(t - T_CHIN) * 6);
      const cogeG = [jarras.g[0] - 4, jarras.g[1] + 2], cogeM = [jarras.m[0] + 4, jarras.m[1] + 2];
      const aG = mezcla(cogeG, [PB[0] - 46 + 6 * choca, PB[1] + 6], kB), aM = mezcla(cogeM, [PB[0] + 40 - 6 * choca, PB[1] + 10], kB);
      if (kC > 0) { G.manoD = mezcla(G.manoD, enAv(eG.m, aG), kC); M.manoI = mezcla(M.manoI, enAv(eM.m, aM), kC); M.brazoIDelante = true; }
      if (t > T_CAMARERA + 0.85) { G.cara = "risa"; M.cara = "guino"; G.rc = 0.06; M.rc = -0.06; }
      if (t > T_CHIN) { G.cara = "risa"; M.cara = "risa"; }
      if (t > T_CAMARERA + 0.85) {
        G.jarra = { inc: -0.2 * kB, nivel: 0.9 };
        M.objI = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], -0.2 * kB, 0.9, "asa", t); g.restore(); };
        M.objI2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], -0.2 * kB, 0.9, "cuerpo", t); g.restore(); };
      }
    }
    return { G: eG, M: eM, cam, vG, vM };
  }
  /** La nubecilla camarera y dónde están sus jarras (pantalla). */
  camarera() {
    const t = this.t;
    const x = lerp(1180, 515, eOut(tramo(t, T_CAMARERA - 0.6, T_CAMARERA + 0.3))) + (t > T_CAMARERA + 0.3 ? lerp(0, 700, eIn(tramo(t, 8.7, 9.4))) : 0);
    return { x, y: 452 + 6 * Math.sin(t * 3) };
  }
  jarras() { const c = this.camarera(); return { g: [c.x - 46, c.y - 34], m: [c.x + 42, c.y - 34] }; }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, cam = this.camY();
    const bote = (k, i) => this.una(k, true, () => {
      this.botes.set(i, t);
      const n = NUBES[i];
      temblar(5, 0.15);
      for (let j = 0; j < 10; j++) p.nueva(P.VAPOR, n[0] + azar(-70, 70), n[1] + cam + 10, azar(-120, 120), azar(-40, 10), azar(0.5, 0.9), azar(26, 44));
    });
    for (const lista of [SALTOS_G, SALTOS_M]) for (const [, t1, , b] of lista) if (t > t1 && b >= 0) bote("b" + t1 + "_" + b, b);
    for (const [lista, x] of [[SALTOS_G, XG_F], [SALTOS_M, XM_F]]) {
      const t1 = lista[lista.length - 1][1];
      this.una("sofa" + x, t > t1, () => {
        temblar(12, 0.35); this.botes.set("sofa", t);
        for (let j = 0; j < 18; j++) p.nueva(P.VAPOR, x + azar(-60, 60), SY + cam + 30, azar(-200, 200), azar(-80, 20), azar(0.6, 1.1), azar(30, 60));
      });
    }
    this.una("txt", t > T_TXT, () => { for (let i = 0; i < 40; i++) p.nueva(P.PURPURINA, azar(140, 880), azar(40, 160), azar(-40, 40), azar(-20, 40), azar(1, 1.8), azar(10, 16)); });
    this.una("chin", t > T_CHIN, () => {
      temblar(12, 0.3);
      p.nueva(P.DESTELLO, PB[0], PB[1] - 16, 0, 0, 0.35, 200);
      for (let i = 0; i < 34; i++) { const a = azar(-Math.PI, 0), v = azar(160, 460); p.nueva(P.ESPUMA, PB[0], PB[1] - 16, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(6, 11)); }
      for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, azar(150, 870), azar(-40, 0), azar(-40, 40), azar(40, 140), azar(1.6, 2.4), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  cielo() {
    if (this.cieloC) return this.cieloC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    const gc = g.createLinearGradient(0, 0, 0, H + 120);
    gc.addColorStop(0, "#3f8ff0"); gc.addColorStop(0.6, "#8fd0ff"); gc.addColorStop(1, "#ffe0f0");
    g.fillStyle = gc; g.fillRect(0, 0, W + 120, H + 120);
    this.cieloC = c;
    return c;
  }
  nube(g, spr, x, yTop, w, t0) {
    const t = this.t;
    let sy = 1, sx = 1;
    if (t0 != null && t - t0 < 0.8) { const d = t - t0; const k = Math.exp(-d * 6) * Math.cos(d * 22); sy = 1 - 0.22 * k; sx = 1 + 0.12 * k; }
    const s = w / 220, ww = spr.width * s * sx, hh = spr.height * s;
    g.drawImage(spr, x - ww / 2, yTop - 26 * s + hh * (1 - sy) * 0.4, ww, hh * sy);
  }
  sofa(g, cam, parte) {
    const y = SY + cam, x = SOFA_X, t0 = this.botes.get("sofa");
    let sy = 1;
    if (t0 != null && this.t - t0 < 0.8) { const d = this.t - t0; sy = 1 - 0.12 * Math.exp(-d * 6) * Math.cos(d * 22); }
    g.save(); g.translate(x, y); g.scale(1, sy);
    const gr = this.grS || (this.grS = (() => { const q = g.createLinearGradient(0, -170, 0, 120); q.addColorStop(0, "#ffffff"); q.addColorStop(0.7, "#eef2ff"); q.addColorStop(1, "#cdd8f6"); return q; })());
    g.fillStyle = gr;
    const bolas = (arr) => { g.beginPath(); for (const [bx, by, r] of arr) { g.moveTo(bx + r, by); g.arc(bx, by, r, 0, 6.283); } g.fill(); };
    if (parte === "atras") {
      // respaldo (fila de bollos) y brazos (dos rulos)
      g.fillStyle = "#cdd8f6"; bolas([[-180, -78, 50], [-95, -92, 54], [-5, -96, 56], [88, -92, 54], [176, -78, 50]]);
      g.fillStyle = gr; bolas([[-180, -84, 47], [-95, -98, 51], [-5, -102, 53], [88, -98, 51], [176, -84, 47]]);
      g.beginPath(); rectR(g, -220, -90, 440, 110, 30); g.fill();
      for (const sx of [-1, 1]) {
        g.fillStyle = "#cdd8f6"; g.beginPath(); g.ellipse(sx * 262, -4, 58, 66, 0, 0, 6.283); g.fill();
        g.fillStyle = gr; g.beginPath(); g.ellipse(sx * 260, -10, 54, 62, 0, 0, 6.283); g.fill();
        g.strokeStyle = "rgba(170,185,230,.8)"; g.lineWidth = 3; g.beginPath(); g.ellipse(sx * 262, -14, 26, 34, 0, 0, 6.283); g.stroke();
      }
    } else {
      // asiento delante (tapa las piernas)
      // cojín del asiento (tapa las piernas) y bollos de abajo
      g.fillStyle = "#cdd8f6"; bolas([[-170, 92, 46], [-70, 100, 50], [40, 100, 50], [150, 94, 46]]);
      g.beginPath(); g.ellipse(0, 100, 220, 48, 0, 0, 6.283); g.fill();
      g.beginPath(); rectR(g, -232, 6, 464, 88, 40); g.fill();
      g.fillStyle = gr; g.beginPath(); rectR(g, -228, 0, 456, 84, 40); g.fill();
      g.strokeStyle = "rgba(170,185,230,.9)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 8); g.lineTo(0, 76); g.stroke();
      g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.ellipse(-110, 18, 90, 10, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(110, 18, 90, 10, 0, 0, 6.283); g.fill();
      // brazos por delante (los rulos tapan los lados)
      for (const sx of [-1, 1]) {
        g.fillStyle = gr; g.beginPath(); g.ellipse(sx * 262, 40, 50, 52, 0, 0, 6.283); g.fill();
        g.strokeStyle = "rgba(170,185,230,.8)"; g.lineWidth = 3; g.beginPath(); g.arc(sx * 262, 40, 22, 0, 6.283); g.stroke();
      }
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), cam = e.cam, S = this.sprites();
    fondo(g, "#000");
    g.drawImage(this.cielo(), -60, -60);
    // sol y nubes lejanas (paralaje)
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 760, -60 + cam * 0.08, 260, 260); g.restore();
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(890, 70 + cam * 0.08, 46, 0, 6.283); g.fill();
    for (const [x, y, s] of this.lejanas) { const yy = ((y + cam * 0.35) % 1400 + 1400) % 1400 - 200; g.save(); g.globalAlpha = 0.55; g.drawImage(S.lejana, x - 100 * s, yy, 200 * s, 80 * s); g.restore(); }
    // nubes trampolín
    NUBES.forEach(([x, y, w], i) => { const yy = y + cam; if (yy > -150 && yy < H + 150) this.nube(g, i % 2 ? S.nube2 : S.nube, x, yy, w, this.botes.get(i)); });
    this.sofa(g, cam, "atras");
    for (const q of [e.G, e.M]) if (q.enSofa) pintarAvatar(g, q.m, q.pose, t);
    this.sofa(g, cam, "delante");
    for (const q of [e.G, e.M]) if (!q.enSofa) pintarAvatar(g, q.m, q.pose, t);
    // la nubecilla camarera con dos jarras
    if (t > T_CAMARERA - 0.6) {
      const c = this.camarera();
      g.drawImage(S.mini, c.x - 85, c.y - 30, 170, 78);
      if (t < T_CAMARERA + 0.85) {
        for (const [jx, jy] of [[c.x - 46, c.y - 34], [c.x + 42, c.y - 34]]) { g.save(); g.translate(jx, jy); g.scale(ESC, ESC); dibujarJarra(g, [0, 0], 0, 0.9, "asa", t); dibujarJarra(g, [0, 0], 0, 0.9, "cuerpo", t); g.restore(); }
      }
      // carita de la nubecilla
      g.fillStyle = "#3a4a7a"; g.beginPath(); g.arc(c.x - 14, c.y + 12, 3.5, 0, 6.283); g.arc(c.x + 14, c.y + 12, 3.5, 0, 6.283); g.fill();
      g.strokeStyle = "#3a4a7a"; g.lineWidth = 2.5; g.beginPath(); g.arc(c.x, c.y + 16, 8, 0.3, Math.PI - 0.3); g.stroke();
    }
    this.p.dibujar(g);
    // ¡BOING! en los primeros botes
    for (const [tb, x] of [[1.0, 300], [1.15, 720]]) {
      if (t > tb && t < tb + 0.55) {
        const k = tramo(t, tb, tb + 0.12), a = 1 - tramo(t, tb + 0.35, tb + 0.55);
        txt(g, "¡BOING!", x, 470 + this.camY() - 0 - 60 * k, { tam: 54 * eBack(k), peso: 400, fam: FC, color: "#ffffff", borde: "#1a3a6a", bordeAncho: 8, alfa: a, esp: 2 });
      }
    }
    // ¡A LAS NUBES!
    if (t > T_TXT) {
      const d = t - T_TXT, k = tramo(d, 0, 0.2), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92 + 5 * Math.sin(d * 2)); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, 9.6, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00192", nombre: "Saltando nubes", crear: () => new SaltandoNubes() });
})();
