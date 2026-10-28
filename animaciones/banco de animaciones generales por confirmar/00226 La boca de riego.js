"use strict";
/*
 * 00226 · LA BOCA DE RIEGO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Día de calor en la calle: el termómetro marca 42 ºC, el asfalto echa ondas y Guillermo se derrite abanicándose.
 * Marcos, de uniforme, guiña un ojo, saca la llave y abre la boca de riego (¡CRIC, CRIC!): sale un chorro altísimo
 * (¡QUÉ CHORRO!). Saltan y bailan debajo, Marcos llena su casco y se lo echa por encima a Guillermo (¡CHOF!), el
 * termómetro baja y aparece un arcoíris sobre los dos. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4;
const XB = 512, YB = 560;                   // la boca de riego (base)
const XG0 = 300, XM0 = 728;
const T_CALOR = 0.3, T_GUINO = 1.7, T_LLAVE = 2.05, T_CHORRO = 2.75, T_SALTOS = [3.3, 3.9], T_CASCO = 4.5, T_CHOF = 5.45;
const T_ARCO = 5.9, T_BAILE = [6.7, 7.35, 8.0], T_FIN = 9.2, DUR = 10.0;

class Agua {
  constructor(max) { this.max = max; this.d = []; }
  nueva(x, y, vx, vy, vida, r) { if (this.d.length < this.max) this.d.push({ x, y, vx, vy, v: vida, vm: vida, r }); }
  actualizar(dt) {
    for (let i = this.d.length - 1; i >= 0; i--) {
      const p = this.d[i];
      p.v -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.v <= 0 || p.y > PIES + 14) { this.d[i] = this.d[this.d.length - 1]; this.d.pop(); }
    }
  }
  dibujar(g) {
    if (!this.d.length) return;
    g.save();
    for (const p of this.d) {
      const a = Math.atan2(p.vy, p.vx), v = Math.hypot(p.vx, p.vy), k = Math.min(1, (p.v / p.vm) * 3);
      g.globalAlpha = 0.85 * k; g.fillStyle = "#8fdcff";
      g.beginPath(); g.ellipse(p.x, p.y, p.r * (1 + Math.min(1.6, v / 500)), p.r * 0.75, a, 0, 6.283); g.fill();
      g.globalAlpha = 0.8 * k; g.fillStyle = "#ffffff";
      g.beginPath(); g.arc(p.x - p.r * 0.25, p.y - p.r * 0.3, p.r * 0.3, 0, 6.283); g.fill();
    }
    g.restore();
  }
}
/** Boca de riego genérica (amarilla con tapa roja). (x, y) = base. */
function bocaRiego(g, x, y, abierta) {
  g.save(); g.translate(x, y);
  g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(0, 2, 46, 8, 0, 0, 6.283); g.fill();
  g.fillStyle = "#6a6e74"; rectR(g, -34, -12, 68, 14, 4); g.fill();
  const gr = g.createLinearGradient(-26, 0, 26, 0);
  gr.addColorStop(0, "#c48a00"); gr.addColorStop(0.4, "#ffe066"); gr.addColorStop(1, "#b07800");
  g.fillStyle = gr; rectR(g, -24, -82, 48, 72, 8); g.fill();
  g.strokeStyle = "#6e4a00"; g.lineWidth = 2.5; g.stroke();
  // bocas laterales
  for (const s of [-1, 1]) {
    g.fillStyle = gr; rectR(g, s > 0 ? 20 : -38, -62, 18, 22, 4); g.fill(); g.stroke();
    g.fillStyle = "#d8261c"; rectR(g, s > 0 ? 36 : -42, -64, 8, 26, 3); g.fill();
  }
  // cuello y tapa
  g.fillStyle = gr; rectR(g, -28, -90, 56, 12, 4); g.fill(); g.stroke();
  if (!abierta) {
    g.fillStyle = "#d8261c"; g.beginPath(); g.ellipse(0, -90, 24, 20, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#8e100b"; g.fillRect(-7, -116, 14, 12);
  } else {
    g.fillStyle = "#3a2a10"; g.beginPath(); g.ellipse(0, -90, 18, 5, 0, 0, 6.283); g.fill();
  }
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-16, -78, 5, 60);
  g.restore();
}
function llave(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.strokeStyle = "#5d656e"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(-8, 0); g.lineTo(46, 0); g.stroke();
  g.strokeStyle = "#c9d0d6"; g.lineWidth = 4; g.stroke();
  g.fillStyle = "#8a939b"; g.beginPath(); g.arc(50, 0, 9, 0.6, -0.6 + Math.PI * 2); g.lineTo(50, 0); g.closePath(); g.fill();
  g.restore();
}

class BocaDeRiego extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.agua = new Agua(330);
  }
  chorroAlto() { return 400 * eOut(tramo(this.t, T_CHORRO, T_CHORRO + 0.35)); }
  xM() {
    const t = this.t;
    if (t < T_LLAVE) return lerp(XM0, 596, eInOut(tramo(t, T_GUINO + 0.1, T_LLAVE)));
    if (t < T_CHORRO) return 596;
    if (t < T_CASCO) return lerp(596, 676, eOut(tramo(t, T_CHORRO, T_CHORRO + 0.3)));
    return lerp(676, 560, eInOut(tramo(t, T_CASCO, T_CASCO + 0.5))) + lerp(0, 60, eInOut(tramo(t, T_CHOF + 0.4, T_CHOF + 0.8)));
  }
  xG() {
    const t = this.t;
    if (t < T_CHORRO + 0.3) return XG0;
    return lerp(XG0, 420, eInOut(tramo(t, T_CHORRO + 0.3, T_SALTOS[0])));
  }
  poses() {
    const t = this.t, xg = this.xG(), xm = this.xM();
    const G = { cara: "borracho", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yg = PIES, ym = PIES, syG = 1;
    const salta = (lista, dur, alto) => { for (const s of lista) if (t > s && t < s + dur) return Math.sin(tramo(t, s, s + dur) * Math.PI) * alto; return 0; };
    // ---- Guillermo
    if (t < T_CHORRO) {
      // se derrite y se abanica
      G.manoD = [70 + 10 * Math.sin(t * 16), 40]; G.manoI = [9, 160]; G.rc = 0.06 * Math.sin(t * 2);
      syG = 1 - 0.05 * tramo(t, T_CALOR, 2.0);
      if (t > T_GUINO + 0.2) { G.cara = "sorpresa"; G.rc = 0.12; }
    } else {
      if (t < T_CHORRO + 0.3) { G.cara = "sorpresa"; G.puntas = 0.6; G.manoD = [88, 60]; G.manoI = [-10, 60]; }
      else {
        const w = t < T_SALTOS[0] ? andar(t * 14, 0.8) : null;
        if (w) { G.piernaI = w.piernaI; G.piernaD = w.piernaD; yg += w.bote; }
        G.cara = "risa"; G.puntas = 0.4; G.manoD = [96, 20]; G.manoI = [-18, 20];
        yg -= salta(T_SALTOS, 0.45, 60) + salta(T_BAILE, 0.45, 50);
        G.manoD = [96 + 6 * Math.sin(t * 10), 18]; G.manoI = [-18 - 6 * Math.sin(t * 10), 18];
        if (t > T_CHOF - 0.3 && t < T_CHOF + 0.6) { G.cara = t < T_CHOF ? "guino" : "dormido"; G.manoD = [84, 70]; G.manoI = [-4, 70]; }
        if (t > T_CHOF + 0.6 && t < T_BAILE[0]) G.cara = "sorpresa";
        if (t > T_BAILE[0]) G.cara = t < 8.6 ? "risa" : "guino";
      }
    }
    // ---- Marcos
    if (t < T_GUINO) {
      M.cara = "dormido"; M.manoD = [56, 30]; M.rc = -0.05;      // se seca la frente
      M.manoD = [56 + 8 * Math.sin(t * 6), 34];
    } else if (t < T_LLAVE) {
      const w = andar(t * 13, 0.6); M.piernaI = w.piernaI; M.piernaD = w.piernaD; ym += w.bote;
      M.cara = "guino"; M.rc = -0.1; M.manoD = [80, 120]; M.manoI = [-6, 120];
    } else if (t < T_CHORRO) {
      // gira la llave sobre la tapa
      const mM = matAv(xm, PIES, ESC), tapa = mM.inverse().transformPoint(new DOMPoint(XB + 40, YB - 116));
      const a = (t - T_LLAVE) * 10;
      M.manoD = [tapa.x + 12 * Math.cos(a), tapa.y + 6 * Math.sin(a)]; M.manoI = [tapa.x + 18 + 12 * Math.cos(a), tapa.y + 2 + 6 * Math.sin(a)];
      M.brazoIDelante = true; M.cara = "guino"; M.rc = -0.12;
      M.objD2 = (g, m) => llave(g, m[0], m[1], Math.PI + 0.25 * Math.sin(a));
    } else {
      if (t < T_CHORRO + 0.4) { M.cara = "sorpresa"; M.manoD = [86, 60]; M.manoI = [-14, 60]; ym -= Math.sin(tramo(t, T_CHORRO, T_CHORRO + 0.4) * Math.PI) * 30; }
      else {
        M.cara = "risa"; M.rc = 0.06;
        M.manoD = [84, 40 + 8 * Math.sin(t * 9)]; M.manoI = [-10, 40 - 8 * Math.sin(t * 9)];
        ym -= salta([T_SALTOS[1] + 0.2], 0.45, 50) + salta(T_BAILE, 0.45, 50);
      }
      if (t > T_CASCO) {
        // se quita el casco, lo llena y se lo echa a Guillermo
        M.casco = false;
        const kq = eInOut(tramo(t, T_CASCO, T_CASCO + 0.25));
        M.manoD = mezcla([60, 20], [40, 104], kq); M.manoI = mezcla([14, 20], [20, 104], kq); M.brazoIDelante = true; M.cara = "guino";
        if (t > T_CHOF - 0.45) {
          // ¡allá va!: echa el agua del casco hacia Guillermo
          const k = eInOut(tramo(t, T_CHOF - 0.45, T_CHOF - 0.2)) * (1 - eInOut(tramo(t, T_CHOF + 0.35, T_CHOF + 0.6)));
          M.manoD = mezcla([40, 104], [6, 94], k); M.manoI = mezcla([20, 104], [-10, 100], k);
          M.cara = "risa"; M.rc = -0.12;
        }
        if (t > T_CHOF + 0.6) {
          // se lo vuelve a poner
          const k = eInOut(tramo(t, T_CHOF + 0.6, T_CHOF + 0.9));
          M.manoD = mezcla([40, 104], [60, 16], k); M.manoI = mezcla([20, 104], [14, 16], k);
          if (t > T_CHOF + 0.9) { M.casco = true; M.manoD = [84, 40 + 8 * Math.sin(t * 9)]; M.manoI = [-10, 40 - 8 * Math.sin(t * 9)]; M.cara = "risa"; }
        }
        if (!M.casco) {
          const vuelta = 1.5 * eInOut(tramo(t, T_CHOF - 0.3, T_CHOF - 0.15)) * (1 - eInOut(tramo(t, T_CHOF + 0.4, T_CHOF + 0.6)));
          M.objD2 = (g, mano) => {
            const c = [mano[0] - 10, mano[1]];
            g.save(); g.translate(c[0], c[1] - 4); g.rotate(Math.PI - vuelta); g.scale(0.62, 0.62); g.translate(-46, -26); cascoBombero(g, 88); g.restore();
            if (t < T_CHOF - 0.25) { g.fillStyle = "rgba(143,220,255,.85)"; g.beginPath(); g.ellipse(c[0], c[1] - 2, 20, 5, 0, 0, 6.283); g.fill(); }
          };
        }
        ym -= salta(T_BAILE, 0.45, 50);
      }
    }
    return { G, M, mG: matAv(xg, yg, ESC, 0, 1, syG), mM: matAv(xm, ym, ESC) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, ag = this.agua;
    const e = this.poses();
    // sudor
    if (t > T_CALOR && t < T_CHORRO && Math.random() < 5 * dt) {
      const c = aPant(e.mG, [20 + Math.random() * 40, 20]);
      ag.nueva(c[0], c[1], azar(-60, 60), azar(-160, -60), 0.6, 3);
    }
    if (t > T_LLAVE && t < T_CHORRO) { const n = Math.floor((t - T_LLAVE) / 0.32); this.una("cric" + n, true, () => temblar(3, 0.1)); }
    this.una("chorro", t > T_CHORRO, () => {
      temblar(20, 0.6);
      p.nueva(P.DESTELLO, XB, YB - 100, 0, 0, 0.4, 300);
    });
    // el chorro: gotas que caen desde arriba a los lados
    if (t > T_CHORRO) {
      const top = YB - 92 - this.chorroAlto();
      for (let k = 0; k < 7; k++) ag.nueva(XB + azar(-14, 14), top + azar(0, 30), azar(-330, 330), azar(-220, 40), azar(0.9, 1.4), azar(3, 6));
      if (Math.random() < 0.6) p.nueva(P.VAPOR, XB + azar(-60, 60), top + azar(0, 80), azar(-80, 80), azar(-30, 10), azar(0.6, 1), azar(40, 70));
    }
    // el agua del casco vuela hasta Guillermo y le salpica
    this.una("lanza", t > T_CHOF - 0.25, () => {
      const a = aPant(e.mM, e.M.manoD), b = aPant(e.mG, [39, 30]);
      const T = 0.25, vx = (b[0] - a[0]) / T, vy = (b[1] - a[1]) / T - 450 * T;
      for (let k = 0; k < 40; k++) ag.nueva(a[0] + azar(-14, 14), a[1] - 10 + azar(-8, 8), vx * azar(0.9, 1.1), vy + azar(-60, 60), T + 0.05, azar(4, 7));
    });
    if (t > T_CHOF && t < T_CHOF + 0.3) {
      const c = aPant(e.mG, [39, 30]);
      for (let k = 0; k < 5; k++) ag.nueva(c[0] + azar(-30, 30), c[1], azar(-260, 260), azar(-300, -60), 0.7, azar(3, 6));
    }
    this.una("chof", t > T_CHOF, () => temblar(8, 0.25));
    [...T_SALTOS, ...T_BAILE].forEach((s, i) => this.una("s" + i, t > s + 0.45, () => {
      for (let k = 0; k < 8; k++) ag.nueva(this.xG() + azar(-40, 40), PIES - 4, azar(-160, 160), azar(-260, -100), 0.6, azar(3, 5));
    }));
    this.una("arco", t > T_ARCO, () => { for (let i = 0; i < 30; i++) p.nueva(P.PURPURINA, azar(100, 924), azar(80, 300), azar(-20, 20), azar(-20, 20), azar(1.5, 2.5), azar(10, 16)); });
    p.actualizar(dt); ag.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const cielo = g.createLinearGradient(0, -60, 0, 400);
    cielo.addColorStop(0, "#2f8fe0"); cielo.addColorStop(1, "#bfe6ff");
    g.fillStyle = cielo; g.fillRect(-60, -60, W + 120, 520);
    // edificios
    const cols = ["#f2c2a0", "#e8d6a8", "#c8e0d0", "#f0b8b0", "#e0c8e8", "#f2dc9a"];
    let x = -60, i = 0;
    while (x < W + 60) {
      const w = 150 + ((i * 37) % 60), h = 250 + ((i * 53) % 120);
      g.fillStyle = cols[i % cols.length]; g.fillRect(x, 470 - h, w, h + 20);
      g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(x + w - 8, 470 - h, 8, h + 20);
      g.fillStyle = "#7a5a3a"; g.fillRect(x, 470 - h - 8, w, 10);
      for (let fy = 470 - h + 30; fy < 400; fy += 70) for (let fx = x + 22; fx < x + w - 40; fx += 52) {
        g.fillStyle = "#3a5068"; g.fillRect(fx, fy, 28, 40);
        g.fillStyle = "#2a2e33"; g.fillRect(fx - 6, fy + 40, 40, 4); for (let b = 0; b < 5; b++) g.fillRect(fx - 4 + b * 9, fy + 30, 2, 12);
        g.fillStyle = "#2f7d3e"; g.fillRect(fx, fy, 6, 40); g.fillRect(fx + 22, fy, 6, 40);
      }
      x += w; i++;
    }
    // toldos de las tiendas
    for (const [x0, col] of [[40, "#d8261c"], [700, "#2f7dff"]]) {
      for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? "#fffdf5" : col; g.fillRect(x0 + k * 34, 400, 34, 30); }
      g.fillStyle = "#3a3f45"; g.fillRect(x0, 430, 204, 40);
    }
    // acera y calzada
    g.fillStyle = "#c9c2b4"; g.fillRect(-60, 470, W + 120, 90);
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 2;
    for (let k = -60; k < W + 60; k += 40) { g.beginPath(); g.moveTo(k, 470); g.lineTo(k - 20, 560); g.stroke(); }
    g.fillStyle = "#8a857a"; g.fillRect(-60, 556, W + 120, 8);
    g.fillStyle = "#3a3c40"; g.fillRect(-60, 564, W + 120, 100);
    g.fillStyle = "#e9e4d6"; for (let k = -40; k < W + 60; k += 120) g.fillRect(k, 590, 60, 6);
    // farola-termómetro
    g.fillStyle = "#2a2e33"; g.fillRect(880, 240, 10, 320);
    rectR(g, 830, 190, 110, 60, 8); g.fill();
    CT.set("fondo", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // sol
    const calor = 1 - tramo(t, T_CHORRO, T_CHORRO + 2.5);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 + 0.4 * calor;
    g.drawImage(BLOB2.oro, 760, -140, 380, 380); g.restore();
    g.fillStyle = "#fff6c0"; g.beginPath(); g.arc(950, 50, 50 + 6 * Math.sin(t * 3) * calor, 0, 6.283); g.fill();
    // arcoíris
    if (t > T_ARCO) {
      const k = eInOut(tramo(t, T_ARCO, T_ARCO + 0.9));
      g.save(); g.globalAlpha = 0.62; g.lineWidth = 16;
      ["#ff3b3b", "#ff9a2a", "#ffe24a", "#4ad86a", "#3aa8ff", "#6a5aff", "#b05aff"].forEach((col, i) => {
        g.strokeStyle = col; g.beginPath(); g.arc(XB, 640, 600 - i * 16, Math.PI, Math.PI + Math.PI * k); g.stroke();
      });
      g.restore();
    }
    // termómetro (la caja se repinta por encima del arcoíris)
    g.fillStyle = "#2a2e33"; g.fillRect(880, 240, 10, 320); rectR(g, 830, 190, 110, 60, 8); g.fill();
    const grados = Math.round(lerp(42, 23, tramo(t, T_CHORRO + 0.5, T_ARCO + 0.5)));
    txt(g, grados + "ºC", 885, 236, { tam: 40, peso: 900, fam: FD, color: grados > 35 ? "#ff4a2a" : "#2bff5b", glow: grados > 35 ? "rgba(255,80,40,.8)" : "rgba(43,255,91,.8)", glowTam: 10, esp: 2 });
    // charco
    const ch = tramo(t, T_CHORRO, T_CHORRO + 2);
    if (ch > 0) { g.save(); g.globalAlpha = 0.5 * ch; g.fillStyle = "#7fc4e8"; g.beginPath(); g.ellipse(XB, 578, 380 * ch, 16 * ch, 0, 0, 6.283); g.fill(); g.restore(); }
    // ondas de calor
    if (calor > 0.02) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.35 * calor})`; g.lineWidth = 3;
      for (let k = 0; k < 7; k++) {
        const x0 = 60 + k * 140, y0 = 520 - ((t * 60 + k * 37) % 120);
        g.beginPath(); for (let s = 0; s <= 40; s += 4) g.lineTo(x0 + 10 * Math.sin(s * 0.3 + t * 6 + k), y0 - s); g.stroke();
      }
      g.restore();
    }
    bocaRiego(g, XB, YB, t > T_CHORRO);
    // el chorro
    if (t > T_CHORRO) {
      const alto = this.chorroAlto(), y0 = YB - 92, y1 = y0 - alto;
      g.save(); g.lineCap = "round";
      const ruta = () => { g.beginPath(); g.moveTo(XB, y0); for (let s = 0; s <= 1.0001; s += 0.1) g.lineTo(XB + 6 * Math.sin(s * 9 + t * 20) * s, lerp(y0, y1, s)); };
      ruta(); g.strokeStyle = "rgba(40,150,230,.5)"; g.lineWidth = 40; g.stroke();
      ruta(); g.strokeStyle = "#8fdcff"; g.lineWidth = 26; g.stroke();
      ruta(); g.strokeStyle = "#e8fbff"; g.lineWidth = 9; g.setLineDash([24, 16]); g.lineDashOffset = t * 900; g.stroke();
      g.setLineDash([]);
      // corona de espuma arriba
      g.fillStyle = "#e8fbff";
      for (let k = 0; k < 7; k++) { const a = k * 0.9 + t * 6; g.beginPath(); g.arc(XB + Math.cos(a) * 26, y1 + Math.sin(a) * 10, 16 + 4 * Math.sin(t * 9 + k), 0, 6.283); g.fill(); }
      g.restore();
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    this.agua.dibujar(g);
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
    ono("¡QUÉ CALOR!", 300, 170, 0.5, 1.4, 52, "#ffb03a", "#3a1200", -0.08);
    ono("¡CRIC, CRIC!", 680, 330, T_LLAVE + 0.1, 0.6, 42, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡CHOF!", 330, 200, T_CHOF, 0.6, 60, "#bff0ff", "#0c3350", -0.1);
    ono("¡YUJUUU!", 170, 260, T_BAILE[0], 0.9, 48, "#fffdf5", "#1b1b1b", -0.1);
    // ¡QUÉ CHORRO!
    if (t > T_CHORRO + 0.1) {
      const d = t - T_CHORRO - 0.1, k = tramo(d, 0, 0.18), s = lerp(1.8, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(400, 92); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(800, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#9be6ff"); gr.addColorStop(1, "#1f8fe0");
    txt(g, "¡QUÉ CHORRO!", 406, 166, { tam: 140, peso: 900, fam: FD, color: "#04223a", esp: 6, max: 760 });
    txt(g, "¡QUÉ CHORRO!", 400, 158, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#04223a", bordeAncho: 12, esp: 6, glow: "rgba(120,220,255,.85)", glowTam: 24, max: 760 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00226", nombre: "La boca de riego", crear: () => new BocaDeRiego() });
})();
