"use strict";
/*
 * 00223 · NUDOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Clase de nudos en el parque de bomberos, con la pizarra detrás. Marcos estira la cuerda y, en un visto y no visto
 * (¡ZAS!), hace un ocho perfecto; ¡ZAS!, un as de guía. Le lanza una cuerda a Guillermo (¡TOMA!), que lo intenta, se
 * lía… y la cuerda le da vueltas y vueltas hasta dejarlo atado como un paquete, con lazo en la cabeza. Da saltitos sin
 * poder moverse; Marcos se parte de risa y le pega una etiqueta de FRÁGIL: ¡NUDO MARINERO! Guillermo se va a saltos.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.42;
const XM = 318, XG = 700;
const T_ESTIRA = 0.4, T_N1 = 1.0, T_N2 = 1.75, T_TOMA = 2.45, T_COGE = 2.85, T_LIA = 3.45, T_ATADO = 4.55;
const T_SALTOS = [5.0, 5.45], T_ETIQ = 6.05, T_VA = 8.0, DUR = 10.0;
const BANDAS = [96, 116, 136, 156, 178, 200, 220];
const KS = 1.3;     // tamaño de los nudos de Marcos

// ------------------------------------------------------------------------------------------- cuerda
/** Trazo de cuerda (con contorno y vetas) para una ruta ya hecha. */
function trazoCuerda(g, ruta, w, t) {
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  ruta(); g.strokeStyle = "#5a4020"; g.lineWidth = w + 3; g.stroke();
  ruta(); g.strokeStyle = "#e3c890"; g.lineWidth = w; g.stroke();
  ruta(); g.strokeStyle = "rgba(150,110,50,.75)"; g.lineWidth = w * 0.55; g.setLineDash([w * 0.5, w * 0.7]); g.lineDashOffset = t || 0; g.stroke();
  g.setLineDash([]);
  g.restore();
}
/** Nudo en ocho centrado en (x, y), tamaño s. */
function nudoOcho(g, x, y, s) {
  trazoCuerda(g, () => {
    g.beginPath();
    g.moveTo(x - 46 * s, y);
    g.bezierCurveTo(x - 20 * s, y, x - 6 * s, y - 34 * s, x + 12 * s, y - 22 * s);
    g.bezierCurveTo(x + 30 * s, y - 10 * s, x + 10 * s, y + 20 * s, x - 6 * s, y + 18 * s);
    g.bezierCurveTo(x - 24 * s, y + 16 * s, x - 22 * s, y - 14 * s, x - 2 * s, y - 6 * s);
    g.bezierCurveTo(x + 14 * s, y, x + 24 * s, y + 2 * s, x + 46 * s, y);
  }, 7 * s);
}
/** As de guía: una gaza colgando. */
function asDeGuia(g, x, y, s) {
  trazoCuerda(g, () => {
    g.beginPath();
    g.moveTo(x - 46 * s, y);
    g.bezierCurveTo(x - 16 * s, y, x - 10 * s, y - 12 * s, x, y - 10 * s);
    g.bezierCurveTo(x + 14 * s, y - 8 * s, x + 12 * s, y + 8 * s, x, y + 8 * s);
    g.bezierCurveTo(x - 30 * s, y + 10 * s, x - 34 * s, y + 66 * s, x, y + 66 * s);
    g.bezierCurveTo(x + 34 * s, y + 66 * s, x + 30 * s, y + 10 * s, x + 6 * s, y + 2 * s);
    g.bezierCurveTo(x + 14 * s, y, x + 20 * s, y, x + 46 * s, y);
  }, 7 * s);
}
/** Rollo de cuerda (para lanzarla). */
function rolloCuerda(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  for (let i = 0; i < 3; i++) trazoCuerda(g, () => { g.beginPath(); g.ellipse(0, 0, (26 - i * 6) * s, (18 - i * 4) * s, 0, 0, 6.283); }, 6 * s);
  g.restore();
}

class Nudos extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    const r = semilla(12);
    this.lio = [];
    for (let i = 0; i < 9; i++) this.lio.push([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]);
  }
  /** x e y (pies) de Guillermo, con saltitos. */
  posG() {
    const t = this.t;
    let x = XG, y = PIES;
    for (const s of T_SALTOS) if (t > s && t < s + 0.36) y -= Math.sin(tramo(t, s, s + 0.36) * Math.PI) * 34;
    if (t > T_VA) {
      const n = Math.floor((t - T_VA) / 0.42), u = ((t - T_VA) % 0.42) / 0.42;
      x = XG + n * 95 + 95 * u; y = PIES - Math.sin(u * Math.PI) * 46;
    }
    return [x, y];
  }
  xM() { return lerp(XM, 500, eInOut(tramo(this.t, T_ETIQ - 0.55, T_ETIQ - 0.1))) - lerp(0, 120, eInOut(tramo(this.t, T_ETIQ + 0.5, T_ETIQ + 1.0))); }
  poses() {
    const t = this.t, [xg, yg] = this.posG(), xm = this.xM();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let gm = 0, sG = 1;
    // ---- Marcos
    const estira = eInOut(tramo(t, T_ESTIRA, T_ESTIRA + 0.4)) * (1 - eInOut(tramo(t, T_TOMA - 0.3, T_TOMA - 0.05)));
    M.manoD = mezcla([67, 152], [92, 116], estira); M.manoI = mezcla([6, 152], [-18, 116], estira);
    M.cara = "guino"; M.rc = 0.05;
    for (const n of [T_N1, T_N2]) {
      if (t > n && t < n + 0.22) {
        // manos a toda velocidad
        const a = t * 70;
        M.manoD = [64 + 12 * Math.cos(a), 114 + 12 * Math.sin(a)]; M.manoI = [10 - 12 * Math.cos(a), 114 - 12 * Math.sin(a)]; M.brazoIDelante = true;
        M.cara = "dormido";
      }
      if (t > n + 0.22 && t < n + 0.6) { M.cara = "risa"; M.rc = 0.08; }
    }
    if (t > T_TOMA - 0.3) {
      // lanza la cuerda
      const k = eInOut(tramo(t, T_TOMA - 0.3, T_TOMA)), k2 = eInOut(tramo(t, T_TOMA, T_TOMA + 0.25));
      M.manoD = mezcla(mezcla([67, 152], [46, 108], k), [104, 60], k2); M.manoI = [6, 152]; M.cara = "guino"; M.rc = 0.1;
      if (t > T_TOMA + 0.45) { M.manoD = mezcla([104, 60], [67, 150], eInOut(tramo(t, T_TOMA + 0.45, T_TOMA + 0.7))); M.cara = "sonrisa"; }
    }
    if (t > T_LIA + 0.3) { M.cara = t < T_ATADO ? "sorpresa" : "risa"; M.rc = 0.12; }
    if (t > T_ATADO + 0.1 && t < T_ETIQ - 0.6) {
      // se parte de risa
      const s = Math.sin(t * 22);
      M.brazoIDelante = true; M.manoD = [46, 132 + 3 * s]; M.manoI = [26, 132 - 3 * s]; M.cara = "risa";
      gm = 0.03 * s;
    }
    if (t > T_ETIQ - 0.6 && t < T_ETIQ + 0.5) {
      // va y le pega la etiqueta
      const w = andar(t * 13, 0.6);
      if (t < T_ETIQ - 0.1) { M.piernaI = w.piernaI; M.piernaD = w.piernaD; }
      const mM = matAv(xm, PIES, ESC), dest = mM.inverse().transformPoint(new DOMPoint(aPant(matAv(xg, yg, ESC), [36, 124])[0], aPant(matAv(xg, yg, ESC), [36, 124])[1]));
      const k = eInOut(tramo(t, T_ETIQ - 0.3, T_ETIQ));
      M.manoD = mezcla([67, 150], [dest.x, dest.y], k * (1 - eInOut(tramo(t, T_ETIQ + 0.2, T_ETIQ + 0.45))));
      M.cara = "guino"; M.rc = 0.12;
    }
    if (t > T_ETIQ + 0.5) {
      const w = andar(t * 13, 0.6);
      if (t < T_ETIQ + 1.0) { M.piernaI = w.piernaI; M.piernaD = w.piernaD; }
      M.cara = t < 7.2 ? "risa" : "guino"; M.rc = 0.08;
      M.manoI = [16, 140];
      if (t > T_VA) { M.manoD = [92, 50 + 8 * Math.sin(t * 14)]; M.cara = "risa"; }     // ¡adiós!
      else M.manoD = [80, 92];      // pulgar arriba
    }
    // ---- Guillermo
    G.rc = -0.08;
    if (t < T_TOMA) {
      G.cara = t < T_N1 + 0.25 ? "sonrisa" : "sorpresa";
      if (t > T_N2 + 0.22 && t < T_TOMA) {
        const s = Math.sin(t * 24); G.brazoIDelante = true; G.manoD = [50 + 6 * s, 112]; G.manoI = [30 - 6 * s, 112]; G.cara = "risa";
      }
    } else if (t < T_LIA) {
      // coge la cuerda y la intenta
      const k = eOut(tramo(t, T_COGE - 0.15, T_COGE));
      G.brazoIDelante = true;
      const a = t * 18, f = tramo(t, T_COGE + 0.1, T_LIA);
      G.manoD = mezcla([70, 158], [66 + 10 * f * Math.cos(a), 112 + 8 * f * Math.sin(a * 1.3)], k);
      G.manoI = mezcla([9, 160], [14 - 10 * f * Math.sin(a), 114 + 8 * f * Math.cos(a)], k);
      G.cara = t < T_COGE ? "sorpresa" : "guino"; G.rc = -0.12 + 0.06 * Math.sin(t * 7);
    } else {
      // atado: brazos pegados
      const k = eInOut(tramo(t, T_LIA, T_LIA + 0.35));
      G.manoD = mezcla([66, 112], [74, 150], k); G.manoI = mezcla([14, 114], [4, 150], k); G.brazoIDelante = false;
      G.cara = t < T_ATADO ? "sorpresa" : t < T_ETIQ ? "borracho" : t < 7.0 ? "sorpresa" : "risa";
      G.puntas = 0.6 * tramo(t, T_LIA, T_LIA + 0.3) * (1 - tramo(t, T_ATADO + 0.4, T_ATADO + 0.8));
      if (t > T_VA) G.cara = "guino";
    }
    const mG = matAv(xg, yg, ESC, t > T_LIA && t < T_ATADO ? 0.04 * Math.sin(t * 30) : 0, t > T_LIA && t < T_ATADO ? Math.cos(t * 30) * 0.06 + 0.94 : 1, sG);
    // la cuerda que lo envuelve (por delante de todo, en sus coordenadas)
    if (t > T_LIA) G.objD2 = (g) => this.envolver(g, t);
    return { G, M, mG, mM: matAv(xm, PIES, ESC, gm) };
  }
  /** Bandas de cuerda alrededor de Guillermo, lazo en la cabeza y etiqueta. */
  envolver(g, t) {
    BANDAS.forEach((y, i) => {
      const k = tramo(t, T_LIA + 0.1 + i * 0.13, T_LIA + 0.35 + i * 0.13);
      if (k <= 0) return;
      const rx = y < 165 ? 47 : 30, a0 = Math.PI * 0.02, a1 = a0 + Math.PI * 0.96 * k;
      trazoCuerda(g, () => { g.beginPath(); g.ellipse(39, y, rx, 8, 0, a0, a1); }, 6, t * 30);
    });
    // tirantes cruzados
    const kc = tramo(t, T_ATADO - 0.15, T_ATADO + 0.1);
    if (kc > 0) {
      trazoCuerda(g, () => { g.beginPath(); g.moveTo(8, 92); g.lineTo(lerp(8, 70, kc), lerp(92, 224, kc)); }, 6);
      trazoCuerda(g, () => { g.beginPath(); g.moveTo(70, 92); g.lineTo(lerp(70, 8, kc), lerp(92, 224, kc)); }, 6);
    }
    // lazo en la cabeza
    const kl = eBack(tramo(t, T_ATADO, T_ATADO + 0.25));
    if (kl > 0) {
      g.save(); g.translate(39, -4); g.scale(kl, kl);
      trazoCuerda(g, () => { g.beginPath(); g.ellipse(-14, -8, 15, 9, -0.5, 0, 6.283); }, 5);
      trazoCuerda(g, () => { g.beginPath(); g.ellipse(14, -8, 15, 9, 0.5, 0, 6.283); }, 5);
      trazoCuerda(g, () => { g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-10, 14, -16, 22); g.moveTo(2, 0); g.quadraticCurveTo(10, 14, 18, 20); }, 5);
      g.fillStyle = "#e3c890"; g.beginPath(); g.arc(0, -2, 6, 0, 6.283); g.fill(); g.strokeStyle = "#5a4020"; g.lineWidth = 2; g.stroke();
      g.restore();
    }
    // etiqueta de FRÁGIL
    if (t > T_ETIQ) {
      const k = eBack(tramo(t, T_ETIQ, T_ETIQ + 0.2));
      g.save(); g.translate(36, 124); g.rotate(-0.12); g.scale(k, k);
      g.fillStyle = "#fffdf5"; rectR(g, -26, -11, 52, 22, 3); g.fill();
      g.strokeStyle = "#d8261c"; g.lineWidth = 2; rectR(g, -23, -8, 46, 16, 2); g.stroke();
      txt(g, "FRÁGIL", 0, 5.5, { tam: 13, peso: 900, fam: FD, color: "#d8261c", esp: 1 });
      g.restore();
    }
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.poses();
    for (const [n, k] of [[T_N1, "n1"], [T_N2, "n2"]]) this.una(k, t > n + 0.22, () => {
      temblar(6, 0.2);
      const a = aPant(e.mM, e.M.manoI), b = aPant(e.mM, e.M.manoD), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.3, 160);
      for (let i = 0; i < 12; i++) { const an = azar(0, 6.283), v = azar(100, 260); p.nueva(P.CHISPA, c[0], c[1], Math.cos(an) * v, Math.sin(an) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    this.una("coge", t > T_COGE, () => temblar(4, 0.12));
    this.una("atado", t > T_ATADO, () => { temblar(10, 0.3); const c = aPant(e.mG, [39, -10]); p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.35, 200); });
    T_SALTOS.forEach((s, i) => this.una("s" + i, t > s + 0.36, () => { temblar(5, 0.15); for (let k = 0; k < 6; k++) p.nueva(P.POLVO, XG + azar(-30, 30), PIES, azar(-60, 60), azar(-30, -5), azar(0.4, 0.6), azar(14, 22)); }));
    this.una("etiq", t > T_ETIQ, () => { temblar(5, 0.15); });
    this.una("conf", t > T_ETIQ + 0.1, () => { for (let i = 0; i < 50; i++) p.nueva(P.CONFETI, azar(80, 944), azar(-60, 0), azar(-40, 40), azar(40, 160), azar(2, 3), azar(9, 14), (Math.random() * 5) | 0); });
    if (t > T_VA) { const n = Math.floor((t - T_VA) / 0.42); this.una("v" + n, true, () => { if (n > 0) for (let k = 0; k < 5; k++) p.nueva(P.POLVO, XG + n * 95 + azar(-30, 30), PIES, azar(-60, 60), azar(-30, -5), azar(0.4, 0.6), azar(14, 22)); }); }
    p.suelo = () => PIES + 4;
    p.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gw = g.createLinearGradient(0, -60, 0, 548);
    gw.addColorStop(0, "#5f7d6e"); gw.addColorStop(1, "#8faa96");
    g.fillStyle = gw; g.fillRect(-60, -60, W + 120, 620);
    g.fillStyle = "#3d4f45"; g.fillRect(-60, 420, W + 120, 130);
    g.fillStyle = "#c9a464"; g.fillRect(-60, 414, W + 120, 8);
    // pizarra con los nudos dibujados
    g.fillStyle = "#6a4a2a"; rectR(g, 296, 128, 432, 262, 8); g.fill();
    g.fillStyle = "#1f3a2e"; g.fillRect(310, 142, 404, 234);
    g.fillStyle = "rgba(255,255,255,.05)"; g.fillRect(310, 142, 404, 234);
    txt(g, "NUDOS", 512, 196, { tam: 50, peso: 900, fam: FD, color: "rgba(255,255,255,.85)", esp: 8 });
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3; g.lineCap = "round";
    for (const [x, tipo] of [[380, 0], [512, 1], [644, 2]]) {
      g.beginPath();
      if (tipo === 0) { g.moveTo(x - 40, 290); g.bezierCurveTo(x - 10, 290, x, 255, x + 12, 268); g.bezierCurveTo(x + 26, 282, x - 6, 312, x - 8, 296); g.bezierCurveTo(x - 10, 280, x + 14, 290, x + 40, 290); }
      else if (tipo === 1) { g.moveTo(x - 40, 270); g.lineTo(x + 40, 270); g.moveTo(x - 6, 270); g.bezierCurveTo(x - 34, 280, x - 30, 340, x, 340); g.bezierCurveTo(x + 30, 340, x + 34, 280, x + 6, 270); }
      else { g.moveTo(x - 40, 300); g.bezierCurveTo(x - 20, 250, x + 20, 250, x + 10, 290); g.bezierCurveTo(x, 320, x - 20, 280, x + 40, 280); }
      g.stroke();
      txt(g, ["OCHO", "AS DE GUÍA", "BALLESTRINQUE"][tipo], x, 362, { tam: 14, peso: 600, fam: FT, color: "rgba(255,255,255,.7)" });
    }
    // perchas con cuerdas
    for (const x of [110, 180, 850, 920]) {
      g.fillStyle = "#2a2e33"; g.fillRect(x - 4, 150, 8, 18);
      for (let i = 0; i < 3; i++) { g.strokeStyle = i % 2 ? "#e3c890" : "#c9a464"; g.lineWidth = 7; g.beginPath(); g.ellipse(x, 230, 26 - i * 6, 62 - i * 10, 0, 0, 6.283); g.stroke(); }
    }
    // suelo de madera
    const gs = g.createLinearGradient(0, 548, 0, H + 60);
    gs.addColorStop(0, "#a2703e"); gs.addColorStop(1, "#5e3e1e");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H);
    g.strokeStyle = "rgba(60,30,10,.35)"; g.lineWidth = 2;
    for (let y = 560; y < H + 60; y += 14) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    CT.set("fondo", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    g.fillStyle = "rgba(0,0,0,.25)";
    for (const m of [e.mG, e.mM]) { const c = aPant(m, [39, 232]); g.beginPath(); g.ellipse(c[0], PIES + 3, 60, 8, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mM, e.M, t);
    // la cuerda de Marcos con sus nudos
    if (t > T_ESTIRA && t < T_TOMA - 0.05) {
      const a = aPant(e.mM, e.M._manoI || e.M.manoI), b = aPant(e.mM, e.M._manoD || e.M.manoD), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const vuela = (t > T_N1 && t < T_N1 + 0.22) || (t > T_N2 && t < T_N2 + 0.22);
      if (vuela) {
        trazoCuerda(g, () => { g.beginPath(); g.moveTo(a[0], a[1]); for (let i = 1; i <= 6; i++) g.lineTo(lerp(a[0], b[0], i / 6) + azar(-14, 14), lerp(a[1], b[1], i / 6) + azar(-24, 24)); }, 7);
        g.save(); g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 3;
        for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(c[0], c[1], 40 + i * 14, t * 20 + i, t * 20 + i + 1.4); g.stroke(); }
        g.restore();
      } else if (t > T_N2 + 0.22) {
        trazoCuerda(g, () => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0] - 46 * KS, c[1]); g.moveTo(c[0] + 46 * KS, c[1]); g.lineTo(b[0], b[1]); }, 7);
        asDeGuia(g, c[0], c[1], KS);
      } else if (t > T_N1 + 0.22) {
        trazoCuerda(g, () => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0] - 46 * KS, c[1]); g.moveTo(c[0] + 46 * KS, c[1]); g.lineTo(b[0], b[1]); }, 7);
        nudoOcho(g, c[0], c[1], KS);
      } else {
        trazoCuerda(g, () => { g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1] + 18, b[0], b[1]); }, 7);
      }
    }
    // la cuerda que vuela hasta Guillermo
    if (t > T_TOMA && t < T_COGE) {
      const u = tramo(t, T_TOMA, T_COGE), a = aPant(matAv(XM, PIES, ESC), [104, 60]), b = aPant(matAv(XG, PIES, ESC), [40, 112]);
      rolloCuerda(g, lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * 140, 1.2, u * 9);
    }
    pintarAvatar(g, e.mG, e.G, t);
    // Guillermo con la cuerda entre las manos, liándose
    if (t > T_COGE && t < T_LIA + 0.3) {
      const a = aPant(e.mG, e.G._manoI || e.G.manoI), b = aPant(e.mG, e.G._manoD || e.G.manoD), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const n = Math.floor(tramo(t, T_COGE, T_LIA) * this.lio.length);
      trazoCuerda(g, () => {
        g.beginPath(); g.moveTo(a[0], a[1]);
        for (let i = 0; i < n; i++) { const q = this.lio[i]; g.bezierCurveTo(c[0] + q[0] * 60, c[1] + q[1] * 50, c[0] + q[2] * 60, c[1] + q[3] * 50, c[0] + q[1] * 30, c[1] + q[0] * 26); }
        g.lineTo(b[0], b[1]);
      }, 6);
    }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡ZAS!", 170, 300, T_N1 + 0.05, 0.55, 56, "#ffd34d", "#3a2400", -0.12);
    ono("¡ZAS!", 470, 300, T_N2 + 0.05, 0.55, 56, "#ffd34d", "#3a2400", 0.12);
    ono("¡TOMA!", 450, 220, T_TOMA, 0.6, 50, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡ZIP, ZIP, ZIP!", 880, 300, T_LIA + 0.2, 1.0, 44, "#fffdf5", "#1b1b1b", 0.1);
    T_SALTOS.forEach((s, i) => ono("¡BOING!", 860 + i * 30, 260 + i * 40, s + 0.05, 0.45, 42, "#fffdf5", "#1b1b1b", 0.12));
    ono("¡PLAS!", 560, 420, T_ETIQ, 0.5, 44, "#ffd34d", "#3a2400", -0.1);
    // ¡NUDO MARINERO!
    if (t > T_ETIQ + 0.15) {
      const d = t - T_ETIQ - 0.15, k = tramo(d, 0, 0.18), s = lerp(1.7, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 6));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 84); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, DUR - 0.7, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(960, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#fff8e0"); gr.addColorStop(0.5, "#ffd98a"); gr.addColorStop(1, "#d9902a");
    txt(g, "¡NUDO MARINERO!", 486, 132, { tam: 118, peso: 900, fam: FD, color: "#2a1600", esp: 4, max: 910 });
    txt(g, "¡NUDO MARINERO!", 480, 124, { tam: 118, peso: 900, fam: FD, color: gr, borde: "#2a1600", bordeAncho: 11, esp: 4, glow: "rgba(255,200,90,.75)", glowTam: 22, max: 910 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00223", nombre: "Nudos", crear: () => new Nudos() });
})();
