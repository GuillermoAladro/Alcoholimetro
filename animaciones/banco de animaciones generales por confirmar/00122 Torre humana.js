"use strict";
/*
 * 00122 · TORRE HUMANA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un foco ilumina una caña en una balda altísima. Rodrigo salta y no llega, así que se sube a los hombros de
 * Guillermo. Se tambalean, no llegan… ¡MÁS ARRIBA! Guillermo se estira sudando, Rodrigo coge la caña… y se la bebe
 * allí arriba, con las gotas cayéndole a Guillermo. Luego le baja el vaso vacío. ¡EH!
 */
(() => {
const ESC = 1.3, XT = 660, XR0 = 800;
const CANA = [766, 108];                 // centro de la caña en la balda
const BALDA = 142;
const VE = 1.4;                          // tamaño del vaso
const T_SUBE = 2.85, T_ARRIBA = 3.3, T_GRITA = 4.1, T_COGE = 5.25, T_DA = 7.7;
const cache = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
function aUm(m, q) { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; }

/** Vaso de caña (unidades de avatar); (x, y) = donde lo coge la mano. */
function vaso(g, x, y, ang, nivel, esc = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc);
  const w0 = 6, w1 = 7.5, y0 = -16, y1 = 9;
  g.beginPath(); g.moveTo(-w0, y1); g.lineTo(-w1, y0); g.lineTo(w1, y0); g.lineTo(w0, y1); g.closePath();
  g.fillStyle = "rgba(200,225,255,.2)"; g.fill();
  if (nivel > 0.02) {
    g.save(); g.clip();
    const top = y1 - (y1 - y0 - 2) * nivel;
    const gr = g.createLinearGradient(0, y1, 0, top);
    gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
    g.fillStyle = gr; g.fillRect(-10, top, 20, y1 - top + 1);
    g.fillStyle = "#fffaf0"; g.fillRect(-10, top - 3.5, 20, 4.5);
    g.restore();
  }
  g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-w0, y1); g.lineTo(-w1, y0); g.lineTo(w1, y0); g.lineTo(w0, y1); g.closePath(); g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-4.5, y0 + 3, 1.4, y1 - y0 - 6);
  g.restore();
}
function fondoBar() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, -60, 0, PIES);
  gr.addColorStop(0, "#120b10"); gr.addColorStop(1, "#24161a");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, PIES + 60);
  // papel pintado de rayas
  g.fillStyle = "rgba(255,220,200,.035)";
  for (let x = -60; x < W + 60; x += 44) g.fillRect(x, -60, 18, PIES + 60);
  // zócalo
  g.fillStyle = "#2c1a12"; g.fillRect(-60, 430, W + 120, PIES - 430);
  g.fillStyle = "rgba(255,210,160,.12)"; g.fillRect(-60, 430, W + 120, 3);
  // la balda altísima, con escuadras
  g.fillStyle = "#1b1009";
  for (const x of [790, 960]) { g.beginPath(); g.moveTo(x, BALDA + 12); g.lineTo(x + 46, BALDA + 12); g.lineTo(x + 6, BALDA + 58); g.lineTo(x, BALDA + 58); g.closePath(); g.fill(); }
  const gb = g.createLinearGradient(0, BALDA, 0, BALDA + 14);
  gb.addColorStop(0, "#c78c52"); gb.addColorStop(1, "#5e3412");
  g.fillStyle = gb; g.fillRect(730, BALDA, W + 60 - 730, 14);
  g.fillStyle = "rgba(255,230,190,.35)"; g.fillRect(730, BALDA, W + 60 - 730, 2);
  // botellas en la balda
  for (const [x, col, h] of [[858, "#1f4d26", 70], [900, "#5a2a12", 60], [940, "#2a3550", 76], [985, "#6b5212", 64]]) {
    g.fillStyle = col; rectR(g, x - 10, BALDA - h, 20, h, 5); g.fill(); g.fillRect(x - 4, BALDA - h - 20, 8, 22);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(x - 6, BALDA - h + 6, 3, h - 12);
    g.fillStyle = "rgba(240,225,190,.4)"; g.fillRect(x - 10, BALDA - h * 0.55, 20, h * 0.25);
  }
  const v = g.createRadialGradient(560, 320, 160, 560, 320, 720);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.75)");
  g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
  const gs = g.createLinearGradient(0, PIES, 0, H + 60);
  gs.addColorStop(0, "#3a2516"); gs.addColorStop(1, "#120b06");
  g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H + 60 - PIES);
  return c;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(560, 300), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 20, 0, 280);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
  for (const [s, y] of [["¡MÁS", 128], ["ARRIBA!", 262]]) {
    txt(g, s, 280, y + 7, { tam: 138, peso: 900, fam: FD, color: "#3a1d00", esp: 5 });
    txt(g, s, 280, y, { tam: 138, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 5, glow: "rgba(255,190,40,.8)", glowTam: 22 });
  }
  cache.set("t", c);
  return c;
}

class Torre extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(320);
    this.fondo = null; this.gotas = [];
  }
  luz(t) { return tramo(t, 0.45, 1.0) * (1 - tramo(t, 9.05, 9.85)); }
  foco(t) { return tramo(t, 0.05, 0.35) * (1 - tramo(t, 9.05, 9.85)) * (t < 5.25 ? 1 : 1 - 0.7 * tramo(t, 5.25, 5.8)); }
  /** Estirón de la torre (0–1) cuando Rodrigo grita ¡MÁS ARRIBA! */
  estira(t) { return eInOut(tramo(t, 4.3, 5.1)) * (1 - eInOut(tramo(t, 5.35, 5.8))); }
  bamboleo(t) {
    if (t < T_ARRIBA) return 0;
    const a = 0.03 + 0.05 * tramo(t, 3.4, 5.0) - 0.04 * tramo(t, 5.4, 6.0);
    return a * Math.sin((t - T_ARRIBA) * 5.2);
  }
  estado(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 160], manoD: [70, 158] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 157], manoD: [68, 157] };
    const k = this.estira(t), bam = this.bamboleo(t);
    // ---- Guillermo
    let xg = pista(t, [[0.35, -110], [1.55, XT, eOut]]), syG = 1 + 0.09 * k, sxG = 1 - 0.04 * k, yg = PIES;
    if (t > 0.35 && t < 1.55) { const a = andar(t * 10, 1 - tramo(t, 1.3, 1.55)); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
    if (t > 1.55 && t < 2.5) { G.cara = "sorpresa"; G.rc = 0.12; const kp = eOut(tramo(t, 1.6, 1.8)) * (1 - eInOut(tramo(t, 2.2, 2.45))); G.manoD = mezcla([70, 158], [96, 20], kp); }
    if (t >= 2.5 && t < T_ARRIBA) { // se agacha y ofrece los hombros
      const ka = eInOut(tramo(t, 2.5, 2.75)) * (1 - eInOut(tramo(t, 3.05, 3.3)));
      syG *= 1 - 0.12 * ka; G.cara = "guino"; G.manoD = mezcla([70, 158], [62, 82], ka);
    }
    const ap = Math.sin(tramo(t, T_ARRIBA, T_ARRIBA + 0.3) * Math.PI);
    if (t >= T_ARRIBA) {
      syG *= 1 - 0.1 * ap;
      G.manoD = [80, 66]; G.manoI = [-2, 66]; // le sujeta los tobillos
      G.cara = k > 0.2 ? "dormido" : "sorpresa"; G.rc = -bam * 1.4;
      if (t > 5.45 && t < T_DA) { // espera su parte… y le caen las gotas
        const ke = eOut(tramo(t, 5.45, 5.75));
        G.manoD = mezcla([80, 66], [100, 30], ke);
        G.cara = t < 5.75 ? "sonrisa" : "sorpresa"; G.rc = 0.18 * ke;
      }
      if (t >= T_DA - 0.3 && t < T_DA) G.manoD = mezcla([100, 30], [98, 24], tramo(t, T_DA - 0.3, T_DA));
      if (t >= T_DA) {
        const kb = eInOut(tramo(t, T_DA + 0.05, T_DA + 0.45));
        G.manoD = mezcla([98, 24], [86, 116], kb); G.rc = lerp(0.18, -0.06, kb);
        G.cara = t < 8.15 ? "sorpresa" : "borracho";
        G.objD2 = (g, m) => vaso(g, m[0] + 1, m[1] - 3, 0.1 * (1 - kb), 0, VE);
      }
    }
    const mG = matAv(xg, yg, ESC, bam, sxG, syG);
    // ---- Rodrigo
    let mR, xr = pista(t, [[0.35, W + 110], [1.55, XR0, eOut]]), yr = PIES, syR = 1 + 0.06 * k;
    if (t > 0.35 && t < 1.55) { const a = andar(t * 10 + 1, 1 - tramo(t, 1.3, 1.55)); R.piernaI = a.piernaI; R.piernaD = a.piernaD; yr += a.bote; }
    if (t > 1.55 && t < T_SUBE) { R.cara = "sorpresa"; R.rc = 0.1; }
    if (t > 1.95 && t < 2.5) { // salta para llegar y no llega
      const u = tramo(t, 1.95, 2.5), sp = Math.sin(u * Math.PI);
      yr -= 90 * sp; R.manoD = [76, 30]; R.cara = "guino"; R.piernaI = [-6 * sp, 0.06]; R.piernaD = [-6 * sp, -0.06];
    }
    const top = aPant(mG, [39, 81]);
    if (t < T_SUBE) mR = matAv(xr, yr, ESC);
    else if (t < T_ARRIBA) { // salto a los hombros
      const u = tramo(t, T_SUBE, T_ARRIBA);
      const x = lerp(XR0, top[0], u), y = lerp(PIES, top[1], u) - 4 * 120 * u * (1 - u);
      R.cara = "risa"; R.manoD = [96, 28]; R.manoI = [-18, 28];
      R.piernaI = [0, 0.3 * u]; R.piernaD = [0, -0.3 * u];
      mR = matAv(x, y, ESC);
    } else {
      R.piernaI = [0, 0.3]; R.piernaD = [0, -0.3];
      mR = matAv(top[0], top[1] + 4, ESC, bam * 1.6, 1, syR * (1 - 0.06 * ap));
      R.manoI = [-14 + 4 * Math.sin(t * 5.2), 110]; R.cara = "sonrisa"; R.rc = -bam;
    }
    // la caña: estirarse, cogerla y bebérsela
    let cana = { suelta: true };
    if (t >= T_ARRIBA) {
      const kr = eOut(tramo(t, 3.45, 3.85));
      const objetivo = aUm(mR, CANA);
      R.manoD = mezcla([68, 157], [objetivo[0] - 2, objetivo[1] + 4], kr);
      if (t > 3.5 && t < T_COGE) { R.cara = t < T_GRITA ? "dormido" : t < 4.9 ? "sorpresa" : "dormido"; R.rc = 0.14 + (t > T_GRITA && t < 4.9 ? 0.04 * Math.sin(t * 30) : 0); }
      if (t >= T_COGE) {
        cana = { suelta: false };
        let ang = 0, nivel = 1;
        const kq = eInOut(tramo(t, T_COGE, 5.6));
        let mano = mezcla([objetivo[0] - 2, objetivo[1] + 4], [86, 104], kq);
        R.cara = "risa"; R.rc = 0.1 * (1 - kq);
        const kB = eInOut(tramo(t, 5.6, 5.85)) * (1 - eInOut(tramo(t, 6.75, 7.0)));
        const kT = eInOut(tramo(t, 5.85, 6.55)) * (1 - eInOut(tramo(t, 6.75, 7.0)));
        if (kB > 0) {
          R.rc = -0.35 * kT; ang = -0.3 * kB - 1.35 * kT;
          const b = boca(R.rc, "rodrigo"), tope = rot2([0.5 * VE, -16 * VE], ang);
          mano = mezcla(mano, [b[0] - tope[0] + 2, b[1] - tope[1] + 1], kB);
          nivel = 1 - tramo(t, 5.95, 6.6);
          R.cara = kT > 0.3 ? "dormido" : "risa";
        }
        if (t > 6.6) nivel = 0;
        if (t > 7.0) { R.cara = "risa"; mano = mezcla([86, 104], [92, 140], eInOut(tramo(t, 7.25, T_DA))); }
        R.manoD = mano;
        if (t < T_DA) R.objD2 = (g, m) => vaso(g, m[0] + 1, m[1] - 3, ang, nivel, VE);
        if (t > T_DA) { R.manoD = mezcla([92, 140], [68, 157], eInOut(tramo(t, T_DA, T_DA + 0.4))); R.rc = 0.08 * Math.sin(t * 9); }
        cana.nivel = nivel;
      }
    }
    return { G, R, mG, mR, cana };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t < 1.4 && Math.random() < 14 * dt * this.foco(t)) p.nueva(P.PURPURINA, CANA[0] + azar(-40, 40), CANA[1] + azar(-50, 10), azar(-10, 10), azar(10, 30), azar(0.6, 1.0), azar(6, 10));
    this.una("arriba", t > T_ARRIBA, () => { temblar(12, 0.3); for (let i = 0; i < 14; i++) p.nueva(P.POLVO, XT + azar(-40, 40), PIES - 4, azar(-260, 260), azar(-60, -5), azar(0.5, 0.9), azar(22, 38)); });
    this.una("grita", t > T_GRITA, () => temblar(10, 0.3));
    this.una("coge", t > T_COGE, () => { temblar(6, 0.15); p.nueva(P.DESTELLO, CANA[0], CANA[1], 0, 0, 0.35, 120); for (let i = 0; i < 16; i++) p.nueva(P.PURPURINA, CANA[0] + azar(-30, 30), CANA[1] + azar(-30, 30), azar(-60, 60), azar(-40, 40), azar(0.6, 1.0), azar(6, 11)); });
    const e = this.estado(t);
    // sudor de Guillermo
    if (t > 4.3 && t < 5.4 && Math.random() < 10 * dt) {
      const lado = Math.random() < 0.5 ? -1 : 1, q = aPant(e.mG, [39 + lado * 30, 30]);
      this.gotas.push({ x: q[0], y: q[1], vx: lado * azar(40, 110), vy: azar(-160, -60), v: 0.8, c: "#bfe9ff" });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    // gotas de cerveza que le caen a Guillermo
    if (t > 5.95 && t < 6.7 && Math.random() < 22 * dt) {
      const q = aPant(e.mR, boca(e.R.rc, "rodrigo"));
      p.nueva(P.GOTA, q[0] + azar(-4, 6), q[1] + 6, azar(-50, 30), azar(-20, 40), 0.9, azar(3, 5));
    }
    p.alfa = 1 - tramo(t, 9.1, 9.8);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t), fc = this.foco(t);
    fondo(g, "#000");
    if (!this.fondo) this.fondo = fondoBar();
    g.save(); g.globalAlpha = luz; g.drawImage(this.fondo, -60, -60);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3 * luz;
    g.drawImage(BLOB2.oroClaro, 220, 140, 800, 560);
    g.restore();
    // foco sobre la caña
    if (fc > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      const gr = g.createLinearGradient(0, -20, 0, BALDA);
      gr.addColorStop(0, `rgba(255,240,190,${0.32 * fc})`); gr.addColorStop(1, `rgba(255,220,120,${0.16 * fc})`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(CANA[0] - 16, -20); g.lineTo(CANA[0] + 16, -20); g.lineTo(CANA[0] + 70, BALDA); g.lineTo(CANA[0] - 70, BALDA); g.closePath(); g.fill();
      g.globalAlpha = 0.55 * fc; g.drawImage(BLOB2.oro, CANA[0] - 70, CANA[1] - 70, 140, 140);
      g.restore();
    }
    // la caña en la balda (ya con luz de foco aunque la sala esté a oscuras)
    if (e.cana.suelta) {
      g.save(); g.globalAlpha = Math.max(luz, fc);
      g.save(); g.translate(CANA[0], CANA[1] + 4 * ESC); g.scale(ESC, ESC); vaso(g, 0, 0, 0, 1, VE); g.restore();
      g.restore();
    }
    // subido a los hombros, Rodrigo va por detrás: la cabeza de Guillermo le tapa las piernas, no al revés
    if (t >= T_SUBE) { pintarAvatar(g, e.mR, e.R, t); pintarAvatar(g, e.mG, e.G, t); }
    else { pintarAvatar(g, e.mG, e.G, t); pintarAvatar(g, e.mR, e.R, t); }
    for (const d of this.gotas) { g.fillStyle = d.c; g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // ¡MÁS ARRIBA!
    if (t > T_GRITA && t < 5.9) {
      const d = t - T_GRITA, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 5.6, 5.9)); g.translate(282, 236); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      // líneas de grito desde la boca de Rodrigo
      const q = aPant(e.mR, boca(e.R.rc, "rodrigo"));
      g.save(); g.strokeStyle = "rgba(255,253,245,.8)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = Math.PI + (i - 1) * 0.35, r0 = 46 + 6 * Math.sin(t * 30 + i); g.beginPath(); g.moveTo(q[0] + Math.cos(a) * r0, q[1] + Math.sin(a) * r0); g.lineTo(q[0] + Math.cos(a) * (r0 + 22), q[1] + Math.sin(a) * (r0 + 22)); g.stroke(); }
      g.restore();
    }
    // ¡EH!
    if (t > 8.15 && t < 9.3) {
      const q = aPant(e.mG, [10, 10]);
      bocadillo(g, q[0] - 120, q[1] - 66, "¡EH!", q[0] - 20, q[1] + 14, tramo(t, 8.15, 8.3) * (1 - tramo(t, 9.1, 9.3)), 40);
    }
    const a = 1 - Math.max(luz, 0.0);
    if (a > 0) {
      g.save(); g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`;
      // a oscuras, salvo el foco de la caña al principio
      if (t < 1.0 && fc > 0) { g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.ellipse(CANA[0], CANA[1] - 10, 90 * fc, 130 * fc, 0, 0, 6.283, true); g.fill("evenodd"); }
      else g.fillRect(-60, -60, W + 120, H + 120);
      g.restore();
    }
  }
}

registrar({ id: "00122", nombre: "Torre humana", crear: () => new Torre() });
})();
