"use strict";
/*
 * 00108 · TIRA Y AFLOJA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo tiran de una cuerda con un pañuelo rojo en medio y una raya de tiza en el suelo (¡TIRA!).
 * Rodrigo va ganando y arrastra a Guillermo hacia la raya. Guillermo suelta una mano, saca una caña de detrás de
 * la espalda y se la lanza: Rodrigo suelta la cuerda para cogerla… y Guillermo sale despedido hacia atrás
 * (¡CATAPLÁN!). Rodrigo se bebe la caña tan a gusto y Guillermo se asoma mareado, con estrellitas.
 */
(() => {
const ESC = 1.5, XG = 300, XR = 724, SUELO = 470;
const T_TIRA = 0.7, T_SACA = 4.25, T_LANZA = 5.32, T_SUELTA = 5.45, T_COGE = 5.95, T_CHOQUE = 5.9, DUR = 9.8;
// desplazamiento de los dos (+ = hacia Rodrigo)
const DESP = [[1.5, 0], [2.0, -16], [2.5, 12], [2.9, 4], [3.5, 36], [3.8, 28], [4.25, 60]];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
/** Caña (vaso de tubo) centrada en (x, y), en las unidades del que la dibuja. */
function cana(g, x, y, ang, nivel = 1, esc = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc);
  const w0 = 7.2, w1 = 6, h = 15;
  g.beginPath(); g.moveTo(-w0, -h); g.lineTo(w0, -h); g.lineTo(w1, h); g.lineTo(-w1, h); g.closePath();
  g.fillStyle = "rgba(210,232,255,.22)"; g.fill();
  if (nivel > 0.02) {
    g.save(); g.clip();
    const top = lerp(h - 1, -h + 6, nivel);
    const gr = g.createLinearGradient(0, h, 0, top);
    gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
    g.fillStyle = gr; g.fillRect(-w0, top, w0 * 2, h * 2);
    g.fillStyle = "#fffaf0"; g.fillRect(-w0, top - 5, w0 * 2, 5.5);
    g.restore();
    if (nivel > 0.9) { g.fillStyle = "#fffaf0"; g.beginPath(); for (let i = 0; i <= 3; i++) g.arc(-w0 + 1 + i * 4.3, -h + 1, 2.8, Math.PI, 0); g.fill(); }
  }
  g.beginPath(); g.moveTo(-w0, -h); g.lineTo(w0, -h); g.lineTo(w1, h); g.lineTo(-w1, h); g.closePath();
  g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.3; g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-w0 + 2, -h + 3, 1.6, h * 2 - 6);
  g.restore();
}

class TiraAfloja extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.cache = cacheTexto();
    this.libre = null; // punta suelta de la cuerda
  }
  desp(t) { return pista(Math.min(t, T_SUELTA), DESP); }
  estado() {
    const t = this.t, s = this.desp(t), sAnt = this.desp(t - 0.08), pierde = s - sAnt > 0.5;
    const tira = tramo(t, 1.3, 1.6);
    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let xg = XG + s, yg = PIES, giroG = -0.03 - 0.11 * tira + 0.05 * tramo(s, 20, 60), sxG = 1;
    G.manoD = [104, 138]; G.manoI = [58, 140];
    G.piernaI = [0, 0.12 * tira]; G.piernaD = [0, -0.26 * tira];
    if (t > 1.0 && t < 1.6) { G.cara = "guino"; }
    if (t >= 1.6) { G.cara = pierde ? "sorpresa" : "dormido"; G.rc = -0.05 + 0.02 * Math.sin(t * 40); G.puntas = 0.35 * tramo(s, 10, 60); }
    // la idea: saca una caña de detrás
    if (t >= T_SACA) {
      G.cara = t < 4.55 ? "guino" : "risa"; G.rc = 0.08;
      const k1 = eInOut(tramo(t, T_SACA, 4.5));
      if (t < 4.5) G.manoI = mezcla([58, 140], [2, 152], k1);
      else {
        G.brazoIDelante = false;
        const k2 = eBack(tramo(t, 4.52, 4.85)), k3 = eInOut(tramo(t, 5.12, T_LANZA - 0.02)), k4 = eOut(tramo(t, T_LANZA - 0.02, T_LANZA + 0.12));
        G.manoI = mezcla(mezcla(mezcla([6, 166], [-16, 52], k2), [-30, 84], k3), [26, 6], k4);
        if (t < T_LANZA) G.objI2 = (g, m) => cana(g, m[0] + 1, m[1] - 4, -0.1 + 0.3 * k3, 1);
      }
      giroG = -0.1;
    }
    if (t >= T_SUELTA) { // sale despedido hacia atrás
      const d = t - T_SUELTA;
      xg = XG + this.desp(T_SUELTA) - 950 * d - 700 * d * d;
      yg = PIES - (420 * d - 520 * d * d);
      giroG = -0.1 - 3.2 * d;
      G.cara = "sorpresa"; G.puntas = 0.8; G.manoD = [100, 70]; G.manoI = [-24, 60];
      G.piernaI = [-12, 0.5]; G.piernaD = [-12, -0.3];
    }
    // se asoma mareado
    let asoma = null;
    if (t > 7.2) {
      const k = eOut(tramo(t, 7.2, 7.75)) * (1 - eInOut(tramo(t, 9.1, 9.5)));
      asoma = { pose: { cara: "borracho", rc: 0.12 * Math.sin(t * 4), puntas: 0.75, manoD: [72, 150], manoI: [8, 156] }, m: matAv(lerp(-140, 28, k), PIES, ESC, 0.36) };
      if (t > 8.55 && t < 9.1) asoma.pose.cara = "sorpresa";
    }
    // ---------------- Rodrigo
    const R = { quien: "rodrigo", cara: "sonrisa", rc: -0.1, piernaI: [0, 0.26 * tira], piernaD: [0, -0.12 * tira], brazoIDelante: true };
    let xr = XR + s, giroR = 0.03 + 0.12 * tira + 0.03 * tramo(s, 20, 60);
    R.manoI = [-26, 146]; R.manoD = [16, 150];
    if (t > 1.0 && t < 1.6) R.cara = "guino";
    if (t >= 1.6) { R.cara = s > 24 ? "risa" : "dormido"; R.rc = 0.05 + 0.02 * Math.sin(t * 37); }
    if (t > 4.55 && t < T_SUELTA) { R.cara = "sorpresa"; R.rc = -0.2 * eInOut(tramo(t, 4.55, 4.8)); giroR = lerp(giroR, 0.04, eInOut(tramo(t, 4.6, 5.1))); }
    if (t >= T_SUELTA - 0.05) {
      // suelta la cuerda y coge la caña al vuelo
      giroR = 0.04 * (1 - tramo(t, T_SUELTA, T_SUELTA + 0.3));
      R.cara = t < T_COGE ? "sorpresa" : "risa";
      const kA = eOut(tramo(t, T_SUELTA - 0.05, T_SUELTA + 0.25));
      R.manoI = mezcla([-26, 146], [36, 120], kA); R.manoD = mezcla([16, 150], [54, 112], kA);
      R.rc = -0.12 * (1 - kA);
      if (t >= T_COGE) {
        const kB = eInOut(tramo(t, T_COGE + 0.08, T_COGE + 0.4));
        R.manoI = mezcla([36, 120], [9, 157], kB);
        let mano = mezcla([54, 112], [58, 112], kB), ang = 0, nivel = 1;
        // trago largo
        const kBoca = eInOut(tramo(t, 6.55, 6.85)) * (1 - eInOut(tramo(t, 7.75, 8.05)));
        const kTrago = eInOut(tramo(t, 6.85, 7.65)) * (1 - eInOut(tramo(t, 7.75, 8.05)));
        R.rc = -0.34 * kTrago;
        ang = -0.4 * kBoca - 1.35 * kTrago;
        if (kBoca > 0) { const b = boca(R.rc, "rodrigo"), tope = rot2([1, -15], ang); mano = mezcla(mano, [b[0] - tope[0] + 2, b[1] - tope[1] + 1], kBoca); }
        nivel = 1 - 0.75 * tramo(t, 6.95, 7.65);
        if (kTrago > 0.3) R.cara = "dormido";
        if (t > 8.1) { R.cara = t < 8.6 ? "risa" : "guino"; R.rc = -0.14 * eInOut(tramo(t, 8.1, 8.4)); mano = mezcla(mano, [80, 70], eBack(tramo(t, 8.5, 8.8))); }
        R.manoD = mano;
        R.objD = (g, m) => cana(g, m[0] + 1, m[1] - 2, ang, nivel);
      }
    }
    const mG = matAv(xg, yg, ESC, giroG, sxG, 1);
    const mR = matAv(xr, PIES, ESC, giroR);
    return { G, R, mG, mR, s, asoma, xg };
  }
  /** Punto de la caña volando (pantalla) */
  canaVuelo(t, e) {
    const u = tramo(t, T_LANZA, T_COGE), a = this.lanzada, b = aPant(e.mR, [55, 110]);
    return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 170 * 4 * u * (1 - u)];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.estado();
    this.una("tira", t > T_TIRA, () => temblar(12, 0.3));
    // polvo de los pies de Guillermo al ser arrastrado
    if (t > 1.6 && t < T_SACA && this.desp(t) - this.desp(t - dt) > 0.3 && Math.random() < 30 * dt)
      p.nueva(P.POLVO, e.xg + azar(-10, 50), PIES - 4, azar(-160, -40), azar(-50, -5), azar(0.5, 0.9), azar(22, 38));
    this.una("lanza", t > T_LANZA, () => { const q = aPant(e.mG, e.G.manoI); this.lanzada = [q[0], q[1] - 6]; });
    this.una("suelta", t > T_SUELTA, () => {
      temblar(14, 0.25);
      this.libre = { a: aPant(e.mR, [-26, 146]) };
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, XG + 60 + azar(-30, 30), PIES - 4, azar(-500, -80), azar(-70, -5), azar(0.5, 1), azar(26, 44));
    });
    this.una("coge", t > T_COGE, () => {
      temblar(6, 0.15);
      const q = aPant(e.mR, [55, 96]);
      for (let i = 0; i < 12; i++) p.nueva(P.ESPUMA, q[0], q[1] - 10, azar(-120, 120), azar(-260, -80), azar(0.4, 0.7), azar(4, 8));
    });
    this.una("choque", t > T_CHOQUE, () => {
      temblar(28, 0.6);
      for (let i = 0; i < 34; i++) p.nueva(P.POLVO, azar(-20, 40), azar(330, 570), azar(20, 380), azar(-160, 60), azar(0.8, 1.5), azar(40, 80));
      for (let i = 0; i < 18; i++) { const a = azar(-1.3, 1.3), v = azar(200, 520); p.nueva(P.CHISPA, 10, 420, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
    });
    if (t > T_COGE + 0.95 && t < 7.65 && Math.random() < 0.3) {
      const q = aPant(e.mR, boca(e.R.rc, "rodrigo"));
      p.nueva(P.GOTA, q[0] + 8, q[1] + 6, azar(-10, 50), azar(-20, 30), 0.7, azar(2.5, 4));
    }
    p.actualizar(dt);
  }
  escenario(g) {
    if (this.cache.has("f")) return this.cache.get("f");
    const c = lienzoNuevo(W, H), x = c.getContext("2d");
    const gr = x.createLinearGradient(0, SUELO, 0, H);
    gr.addColorStop(0, "#2b1a0e"); gr.addColorStop(1, "#140b05");
    x.fillStyle = gr; x.fillRect(0, SUELO, W, H - SUELO);
    x.strokeStyle = "rgba(0,0,0,.4)"; x.lineWidth = 2;
    for (let i = 1; i < 7; i++) { const y = SUELO + (i * i) * 2.7; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
    for (let i = -12; i <= 12; i++) { x.beginPath(); x.moveTo(512 + i * 60, SUELO); x.lineTo(512 + i * 150, H); x.stroke(); }
    x.fillStyle = "rgba(255,210,150,.08)"; x.fillRect(0, SUELO, W, 3);
    // raya de tiza
    x.fillStyle = "rgba(255,255,250,.85)";
    x.beginPath(); x.moveTo(508, SUELO + 2); x.lineTo(516, SUELO + 2); x.lineTo(524, H); x.lineTo(500, H); x.closePath(); x.fill();
    x.fillStyle = "rgba(255,255,255,.25)";
    for (let i = 0; i < 40; i++) { const y = SUELO + Math.random() * (H - SUELO), w = 6 + (y - SUELO) * 0.08; x.fillRect(512 + (Math.random() - 0.5) * w * 3, y, 2, 2); }
    this.cache.set("f", c);
    return c;
  }
  cuerda(g, e, t) {
    const G = e.G, R = e.R, suelta = t >= T_SUELTA;
    const gD = aPant(e.mG, G.manoD), gI = aPant(e.mG, G.manoI);
    const rI = aPant(e.mR, [-26, 146]), rD = aPant(e.mR, [16, 150]);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const trazo = (f) => {
      g.strokeStyle = "#4d3313"; g.lineWidth = 10; g.beginPath(); f(); g.stroke();
      g.strokeStyle = "#c9a15c"; g.lineWidth = 7; g.beginPath(); f(); g.stroke();
      g.setLineDash([5, 6]); g.strokeStyle = "#8a6730"; g.lineWidth = 7; g.beginPath(); f(); g.stroke(); g.setLineDash([]);
    };
    let medio;
    if (!suelta) {
      const conDos = t < 4.4;
      const cola = [e.xg - 140, PIES - 6];
      const ini = conDos ? gI : gD;
      const ten = t > 1.3 ? 6 : 22, mid = [(gD[0] + rI[0]) / 2, (gD[1] + rI[1]) / 2 + ten];
      medio = mid;
      trazo(() => {
        g.moveTo(cola[0], cola[1]); g.quadraticCurveTo(ini[0] - 70, ini[1] + 10, ini[0], ini[1]);
        if (conDos) g.lineTo(gD[0], gD[1]);
        g.quadraticCurveTo(mid[0], mid[1] + ten, rI[0], rI[1]); g.lineTo(rD[0], rD[1]);
        g.quadraticCurveTo(rD[0] + 70, rD[1] + 10, XR + e.s + 150, PIES - 6);
      });
    } else {
      // la punta suelta sigue a Guillermo dando latigazos
      const d = t - T_SUELTA, k = eOut(tramo(d, 0, 0.4));
      const fin = mezcla(this.libre.a, [gD[0] + 230, gD[1] + 50], k);
      const dx = fin[0] - gD[0], dy = fin[1] - gD[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, amp = 34 * (1 - 0.5 * k);
      const pt = (u) => { const o = amp * Math.sin(u * Math.PI * 3 - d * 26) * Math.sin(u * Math.PI); return [gD[0] + dx * u + nx * o, gD[1] + dy * u + ny * o]; };
      medio = pt(0.5);
      trazo(() => { for (let j = 0; j <= 18; j++) { const q = pt(j / 18); if (j) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); } });
    }
    g.restore();
    // el pañuelo
    g.save(); g.translate(medio[0], medio[1]); g.rotate(0.15 * Math.sin(t * 9) + (suelta ? 0.6 : 0));
    g.fillStyle = "#c8102e"; g.beginPath(); g.moveTo(-15, 0); g.lineTo(15, 0); g.lineTo(2 + 4 * Math.sin(t * 11), 40); g.closePath(); g.fill();
    g.fillStyle = "#ff4d5e"; g.beginPath(); g.moveTo(-15, 0); g.lineTo(0, 0); g.lineTo(1 + 3 * Math.sin(t * 11), 30); g.closePath(); g.fill();
    g.fillStyle = "#7a0717"; g.beginPath(); g.arc(0, 2, 5, 0, 6.283); g.fill();
    g.restore();
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(600, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡TIRA!", 300, 168, { tam: 170, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 13, esp: 6, glow: "rgba(255,170,30,.85)", glowTam: 26 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.36;
    g.drawImage(BLOB2.oroClaro, 60, 60, 904, 560); g.restore();
    g.drawImage(this.escenario(g), 0, 0);
    this.cuerda(g, e, t);
    if (e.xg > -200) pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    if (e.asoma) {
      pintarAvatar(g, e.asoma.m, e.asoma.pose, t);
      // estrellitas alrededor de la cabeza
      const c = aPant(e.asoma.m, [39, 2]);
      g.save(); g.globalAlpha = tramo(t, 7.5, 7.8) * (1 - tramo(t, 9.0, 9.3));
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + (i * 6.283) / 3, x = c[0] + Math.cos(a) * 62, y = c[1] + Math.sin(a) * 16;
        estrella(g, x, y, 13, 5.5, t * 3 + i); g.fillStyle = "#ffd34d"; g.fill(); g.strokeStyle = "#7a4a00"; g.lineWidth = 2; g.stroke();
      }
      g.restore();
    }
    // la caña volando
    if (t >= T_LANZA && t < T_COGE) {
      const q = this.canaVuelo(t, e);
      g.save(); g.translate(q[0], q[1]); g.scale(ESC, ESC); cana(g, 0, 0, (t - T_LANZA) * 7, 1); g.restore();
      brillo(g, q[0] + 12, q[1] - 22, 18, 0.8);
    }
    if (t > 4.6 && t < 5.2) { const q = aPant(e.mG, [-16, 40]); brillo(g, q[0] + 14, q[1] - 10, 30 * Math.sin(Math.PI * tramo(t, 4.6, 5.2)), 1); }
    this.p.dibujar(g);
    // ¡TIRA!: al empezar y, más pequeño, mientras tiran
    if (t > T_TIRA && t < 2.3) {
      const d = t - T_TIRA, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 2.0, 2.3)); g.translate(512, 120); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const gritos = [[2.55, 0], [3.25, 1], [3.95, 0]];
    for (const [t0, i] of gritos) {
      if (t < t0 || t > t0 + 0.6) continue;
      const m = i ? e.mR : e.mG, q = aPant(m, [39, -6]);
      const k = tramo(t, t0, t0 + 0.12);
      g.save(); g.translate(q[0] + (i ? 70 : -70), q[1] - 18); g.rotate(i ? 0.1 : -0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡TIRA!", 0, 0, { tam: 54, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 8, alfa: 1 - tramo(t, t0 + 0.45, t0 + 0.6), esp: 2 });
      g.restore();
    }
    // ¡CATAPLÁN!
    if (t > T_CHOQUE && t < T_CHOQUE + 1.3) {
      const k = tramo(t, T_CHOQUE, T_CHOQUE + 0.14);
      g.save(); g.translate(190, 250); g.rotate(-0.16); g.scale(eBack(k) * 1.05, eBack(k) * 1.05);
      txt(g, "¡CATAPLÁN!", 0, 0, { tam: 76, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a1d00", bordeAncho: 10, alfa: 1 - tramo(t, T_CHOQUE + 1.0, T_CHOQUE + 1.3), esp: 2 });
      g.restore();
    }
    const on = t < 0.55 ? [0, 0.5, 0, 0.8, 0.3, 1][Math.min(5, Math.floor(t / 0.09))] : 1;
    const a = Math.max(1 - on, tramo(t, DUR - 0.55, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00108", nombre: "Tira y afloja", crear: () => new TiraAfloja() });
})();
