"use strict";
/*
 * 00210 · VESTIRSE EN 30 SEGUNDOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el vestuario del parque, un cronómetro gigante: ¡30 SEGUNDOS! Marcos (aún de calle) salta dentro de sus botas y
 * en un remolino sale vestido de bombero, con casco, y le sobran 12 segundos. Le toca a Guillermo: salta, se tambalea
 * a la pata coja y desaparece en una nube de pelea de la que salen volando chaquetón, bota y casco. Suena el ¡PIIII!:
 * Guillermo acaba con el casco del revés y una bota en la mano, orgulloso (Y PICO). Foto de equipo con flash.
 */
(() => {
const ESC = 1.35;
const XG0 = 200, XG = 330, XM0 = 820, XM = 694;
const RELOJ = [512, 236], RR = 92;
const PERCHA_G = 92, PERCHA_M = 932;
const T_TIT = 0.4, T_YA1 = 1.45, T_SALTA = 1.55, T_REM0 = 1.85, T_CAMBIO = 2.35, T_REM1 = 2.85, T_RESET = 3.4, T_YA2 = 3.75;
const T_G_SALTA = 3.8, T_COJA = 4.05, T_NUBE0 = 4.45, T_NUBE1 = 6.45, T_CASCO = 6.38, T_ORGULLO = 6.6;
const T_JUNTOS = 8.05, T_FOTO = 8.75, T_FIN = 9.65, DUR = 10.15;
const CT = cacheTexto();

// ------------------------------------------------------------------------------------------- equipo
const AZUL = "#2c4170", AZUL_O = "#18264a", AMARILLO = "#e9f227", PLATA = "#dfe6ea";
/** Bota negra con banda reflectante; (x, y) = suela, en medio. */
function bota(g, x, y, s, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const gr = g.createLinearGradient(-14, 0, 16, 0); gr.addColorStop(0, "#3a3a40"); gr.addColorStop(0.4, "#1a1a1e"); gr.addColorStop(1, "#050506");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-12, -44); g.lineTo(10, -44); g.lineTo(11, -12); g.quadraticCurveTo(26, -10, 27, 0); g.lineTo(-13, 0); g.closePath(); g.fill();
  g.fillStyle = "#000"; g.fillRect(-14, -3, 42, 4);
  g.fillStyle = AMARILLO; g.fillRect(-12, -30, 22, 4); g.fillStyle = PLATA; g.fillRect(-12, -26, 22, 3);
  g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-9, -42, 3, 28);
  g.restore();
}
/** Botas metidas en el pantalón bajado (como se dejan preparadas). (x, y) = suelo. */
function botasPreparadas(g, x, y) {
  bota(g, x - 20, y, 1); bota(g, x + 14, y, 1);
  g.fillStyle = AZUL; g.strokeStyle = AZUL_O; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x - 46, y - 36); g.quadraticCurveTo(x, y - 52, x + 50, y - 36); g.lineTo(x + 54, y - 18); g.quadraticCurveTo(x, y - 8, x - 50, y - 18); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = AMARILLO; g.fillRect(x - 46, y - 30, 98, 4); g.fillStyle = PLATA; g.fillRect(x - 46, y - 26, 98, 3);
  g.strokeStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.moveTo(x - 40, y - 40); g.quadraticCurveTo(x, y - 30, x + 44, y - 40); g.stroke();
  // tirantes
  g.strokeStyle = "#c0262a"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(x - 24, y - 44); g.quadraticCurveTo(x - 40, y - 70, x - 18, y - 74); g.moveTo(x + 24, y - 44); g.quadraticCurveTo(x + 40, y - 70, x + 18, y - 74); g.stroke();
}
/** Chaquetón; (x, y) = el cuello (de donde cuelga). */
function chaqueton(g, x, y, s, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const gr = g.createLinearGradient(-40, 0, 40, 0); gr.addColorStop(0, "#1f3058"); gr.addColorStop(0.5, "#3a5288"); gr.addColorStop(1, "#1a2a4e");
  g.fillStyle = gr; g.strokeStyle = AZUL_O; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.lineTo(36, 8); g.lineTo(52, 70); g.lineTo(40, 74); g.lineTo(32, 36); g.lineTo(32, 104); g.lineTo(-32, 104); g.lineTo(-32, 36); g.lineTo(-40, 74); g.lineTo(-52, 70); g.lineTo(-36, 8); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = AMARILLO; g.fillRect(-32, 74, 64, 6); g.fillStyle = PLATA; g.fillRect(-32, 80, 64, 4);
  g.fillStyle = AMARILLO; g.save(); g.translate(46, 56); g.rotate(-0.25); g.fillRect(-7, 0, 13, 5); g.restore();
  g.save(); g.translate(-46, 56); g.rotate(0.25); g.fillRect(-7, 0, 13, 5); g.restore();
  g.strokeStyle = "#0e1830"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, 104); g.stroke();
  g.fillStyle = "#c9a227"; for (let i = 0; i < 4; i++) g.fillRect(-3, 20 + i * 20, 6, 4);
  g.restore();
}
/** Casco (el del motor) centrado en (cx, cy), `w` px de ancho, girado `ang`. */
function casco(g, cx, cy, w, ang = 0) {
  const e = w / 94;
  g.save(); g.translate(cx, cy); g.rotate(ang); g.translate(-44 * e, -18 * e);
  cascoBombero(g, 88 * e);
  g.restore();
}
function percha(g, x) {
  g.fillStyle = "#6a727a"; g.fillRect(x - 40, 238, 80, 8);
  g.fillStyle = "#3a3f46"; g.beginPath(); g.arc(x, 250, 6, 0, 6.283); g.fill();
}

class Vestirse extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.p.suelo = () => PIES + 4;
  }
  /** Lo que marca el cronómetro y su estado. */
  reloj(t) {
    if (t < T_YA1) return { v: 30, corre: false };
    if (t < T_REM1 + 0.05) return { v: 30 - 18 * tramo(t, T_YA1, T_REM1 + 0.05), corre: true };
    if (t < T_RESET) return { v: 12, corre: false, ok: true };
    if (t < T_YA2) return { v: lerp(12, 30, eInOut(tramo(t, T_RESET, T_YA2 - 0.1))), corre: false };
    if (t < T_NUBE1) return { v: 30 - 30 * tramo(t, T_YA2, T_NUBE1), corre: true };
    return { v: 0, corre: false, fin: true };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xm = XM0, ym = PIES, sxM = 1, syM = 1, xg = XG0, yg = PIES, sxG = 1, syG = 1, giroG = 0;
    // ---------------- Marcos
    if (t < T_SALTA) {
      // se prepara: estira los dedos
      M.brazoIDelante = true; const s = Math.sin(t * 16);
      M.manoD = [46 + 3 * s, 104]; M.manoI = [28 - 3 * s, 104]; M.cara = t < T_YA1 ? "guino" : "sorpresa"; M.rc = -0.06;
    } else if (t < T_REM0) {
      // ¡salta!
      const u = tramo(t, T_SALTA, T_REM0);
      xm = lerp(XM0, XM, u); ym = PIES - 150 * Math.sin(Math.PI * u);
      M.manoD = [92, 40]; M.manoI = [-18, 40]; M.piernaI = [-14, 0.2]; M.piernaD = [-14, -0.2]; M.cara = "risa";
    } else if (t < T_REM1) {
      // remolino
      xm = XM; const sp = Math.cos((t - T_REM0) * 46);
      sxM = Math.sign(sp || 1) * Math.max(0.3, Math.abs(sp));
      if (t > T_CAMBIO) M.quien = "bombero";
      M.manoD = [86, 60 + 20 * Math.sin(t * 30)]; M.manoI = [-12, 60 - 20 * Math.sin(t * 30)];
      M.cara = "risa"; ym = PIES - 6 * Math.abs(Math.sin(t * 20));
    } else {
      xm = XM; M.quien = "bombero";
      const d = t - T_REM1;
      syM = 1 - 0.06 * Math.exp(-d * 8) * Math.cos(d * 26);
      // saluda, listo
      if (t < T_RESET + 0.3) { const k = eOut(tramo(d, 0, 0.2)); M.manoD = mezcla([67, 152], [58, 34], k); M.cara = "guino"; M.rc = -0.05; }
      else if (t < T_NUBE0) { M.cara = "sonrisa"; M.rc = -0.12; M.brazoIDelante = true; M.manoD = [74, 140]; M.manoI = [-4, 140]; }
      else if (t < T_NUBE1 - 0.3) {
        // se tapa los ojos… y mira entre los dedos
        const k = eInOut(tramo(t, T_NUBE0, T_NUBE0 + 0.3));
        M.brazoIDelante = true; M.manoD = mezcla([74, 140], [50, 44], k); M.manoI = mezcla([-4, 140], [24, 44], k);
        M.cara = Math.sin(t * 5) > 0.3 ? "sorpresa" : "dormido"; M.rc = -0.1;
        if (Math.sin(t * 5) > 0.3) { M.manoD = [56, 54]; M.manoI = [18, 54]; }
      } else if (t < T_JUNTOS) {
        // se parte de risa
        M.cara = "risa"; M.rc = 0.12 * Math.sin(t * 8); M.brazoIDelante = true;
        const s = Math.sin(t * 16); M.manoD = [48 + 3 * s, 114]; M.manoI = [24 - 3 * s, 114];
        ym = PIES - 3 * Math.abs(Math.sin(t * 16));
        if (t > T_ORGULLO + 0.6) { M.brazoIDelante = false; M.manoI = [-36, 60]; M.manoD = [72, 140]; M.cara = "risa"; }
      } else {
        // se pone a su lado para la foto
        const u = tramo(t, T_JUNTOS, T_JUNTOS + 0.55);
        xm = lerp(XM, 560, eInOut(u));
        if (u < 1) { const a = andar((t - T_JUNTOS) * 13, 0.9); M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote; M.cara = "guino"; }
        else { const k = eOut(tramo(t, T_FOTO - 0.3, T_FOTO - 0.05)); M.manoD = mezcla([67, 152], [58, 34], k); M.cara = t > T_FOTO ? "risa" : "guino"; M.rc = 0.04; }
      }
    }
    // ---------------- Guillermo
    if (t < T_G_SALTA) {
      G.cara = t < T_YA1 ? "sonrisa" : t < T_REM1 ? "sorpresa" : t < T_RESET ? "sorpresa" : "guino";
      G.rc = t > T_SALTA && t < T_RESET ? 0.14 : 0.04;
      if (t < T_YA1) { G.brazoIDelante = true; G.manoD = [50, 110]; G.manoI = [30, 112]; G.cara = "sonrisa"; }
      else if (t < T_RESET) { G.manoD = [96, 60]; G.manoI = [-18, 62]; G.puntas = t > T_REM0 ? 0.6 : 0; }
      else { G.manoD = [100, 120]; G.manoI = [-22, 122]; }
    } else if (t < T_COJA) {
      const u = tramo(t, T_G_SALTA, T_COJA);
      xg = lerp(XG0, XG, u); yg = PIES - 120 * Math.sin(Math.PI * u);
      G.manoD = [100, 40]; G.manoI = [-22, 40]; G.cara = "risa"; G.piernaI = [-14, 0.2]; G.piernaD = [-14, -0.2];
    } else if (t < T_NUBE0) {
      // a la pata coja, tambaleándose
      xg = XG + 20 * Math.sin((t - T_COJA) * 14); yg = PIES - 18 * Math.abs(Math.sin((t - T_COJA) * 14));
      giroG = 0.14 * Math.sin((t - T_COJA) * 14);
      G.piernaD = [-34, -0.3]; G.manoD = [104, 70]; G.manoI = [-26, 74]; G.cara = "sorpresa"; G.puntas = 0.4;
    } else if (t < T_NUBE1) {
      xg = XG; // dentro de la nube (no se ve)
    } else {
      xg = XG;
      const d = t - T_NUBE1;
      syG = 1 - 0.05 * Math.exp(-d * 7) * Math.cos(d * 24);
      // orgulloso: casco del revés y la bota en alto
      const k = eOut(tramo(t, T_ORGULLO, T_ORGULLO + 0.25));
      G.manoD = mezcla([84, 120], [96, 34], k); G.manoI = [0, 152];
      G.cara = d < 0.3 ? "sorpresa" : Math.floor(t * 2) % 3 === 0 ? "risa" : "guino"; G.rc = 0.05;
      G.piernaI = [-6, 0];
      if (t > T_FOTO - 0.3) { G.cara = "risa"; }
    }
    G.objD = (t > T_NUBE1) ? (g, mano) => bota(g, mano[0] + 1, mano[1] + 44, 1, 0.06) : null;
    const mM = matAv(xm, ym, ESC, 0, sxM, syM), mG = matAv(xg, yg, ESC, giroG, sxG, syG);
    return { G, M, mG, mM, enNube: t >= T_NUBE0 && t < T_NUBE1 };
  }
  /** Objetos que salen volando de la nube: [x, y, ang] o null. */
  vuelan(t, mG) {
    const c = [XG, PIES - 150];
    const arco = (t0, t1, a, b, alto, vueltas) => {
      if (t < t0) return null;
      const u = tramo(t, t0, t1);
      return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - alto * Math.sin(Math.PI * u), vueltas * 6.283 * u];
    };
    const cab = aPant(mG, [39, -14]);
    return {
      chaq: arco(4.75, 5.55, c, [150, PIES - 40], 260, 1.25),
      bota: t < 6.45 ? arco(5.0, 6.45, c, [XG + 70, PIES - 300], 300, 2) : null,
      casco: arco(5.35, T_CASCO, c, [cab[0], cab[1]], 330, 2.5),
    };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("ya1", t > T_YA1, () => temblar(6, 0.2));
    this.una("aterriza", t > T_REM0, () => { temblar(8, 0.2); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, XM + azar(-40, 40), PIES, azar(-120, 120), azar(-40, -5), azar(0.4, 0.8), azar(18, 30)); });
    this.una("listo", t > T_REM1, () => {
      temblar(10, 0.25);
      for (let i = 0; i < 24; i++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.CHISPA, XM + Math.cos(a) * 30, PIES - 200 + Math.sin(a) * 60, Math.cos(a) * v, Math.sin(a) * v - 100, azar(0.4, 0.8), azar(6, 10)); }
      p.nueva(P.DESTELLO, XM, PIES - 200, 0, 0, 0.35, 260);
    });
    if (t > T_REM0 && t < T_REM1 && Math.random() < 30 * dt) p.nueva(P.POLVO, XM + azar(-70, 70), PIES - azar(0, 260), azar(-200, 200), azar(-60, 20), azar(0.3, 0.6), azar(14, 24));
    if (t > T_NUBE0 && t < T_NUBE1 && Math.random() < 26 * dt) p.nueva(P.POLVO, XG + azar(-110, 110), PIES - azar(20, 300), azar(-140, 140), azar(-80, 20), azar(0.4, 0.8), azar(30, 50));
    if (t > T_NUBE0 && t < T_NUBE1 && Math.random() < 6 * dt) temblar(5, 0.15);
    this.una("casco", t > T_CASCO, () => { temblar(10, 0.25); const c = [XG, PIES - 330]; for (let i = 0; i < 10; i++) p.nueva(P.CHISPA, c[0] + azar(-30, 30), c[1], azar(-200, 200), azar(-260, -60), azar(0.3, 0.6), azar(6, 9)); });
    this.una("piii", t > T_NUBE1, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(160, 400); p.nueva(P.POLVO, XG + Math.cos(a) * 50, PIES - 160 + Math.sin(a) * 80, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(30, 60)); }
    });
    this.una("foto", t > T_FOTO, () => { p.nueva(P.DESTELLO, 450, 300, 0, 0, 0.4, 900); for (let i = 0; i < 60; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, 0), azar(-40, 40), azar(30, 120), azar(1.4, 2.2), azar(9, 14), (Math.random() * 5) | 0); });
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gp = g.createLinearGradient(0, -60, 0, PIES);
    gp.addColorStop(0, "#1e2a3c"); gp.addColorStop(1, "#3e5068");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, PIES + 60);
    // taquillas al fondo
    for (let i = 0; i < 18; i++) {
      const x = -40 + i * 62;
      const gt = g.createLinearGradient(x, 0, x + 58, 0); gt.addColorStop(0, "#7a8898"); gt.addColorStop(1, "#4e5c6c");
      g.fillStyle = gt; g.fillRect(x, 300, 58, PIES - 300);
      g.fillStyle = "rgba(0,0,0,.35)"; for (let k = 0; k < 4; k++) g.fillRect(x + 14, 314 + k * 7, 30, 2);
      g.fillStyle = "#d8dde2"; g.fillRect(x + 46, 410, 4, 26);
      g.fillStyle = "#e9e2cc"; g.fillRect(x + 12, 350, 34, 12);
    }
    g.fillStyle = "#2a3444"; g.fillRect(-60, 288, W + 120, 14);
    // banda roja en la pared
    g.fillStyle = "#b8261c"; g.fillRect(-60, 140, W + 120, 10);
    // suelo
    const gs = g.createLinearGradient(0, PIES, 0, H + 60); gs.addColorStop(0, "#5a5f68"); gs.addColorStop(1, "#2a2e34");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    return (this.cF = c);
  }
  dibujarReloj(g, t) {
    const R = this.reloj(t), [x, y] = RELOJ;
    g.save();
    // soporte
    g.fillStyle = "#3a3f46"; g.fillRect(x - 6, y + RR, 12, PIES - y - RR); g.fillRect(x - 40, PIES - 8, 80, 8);
    // corona y botón
    g.fillStyle = "#c9d0d6"; rectR(g, x - 14, y - RR - 26, 28, 20, 4); g.fill();
    g.fillStyle = "#e0262c"; rectR(g, x - 20, y - RR - 36, 40, 12, 5); g.fill();
    if (Math.abs(t - T_YA1) < 0.1 || Math.abs(t - T_YA2) < 0.1) { g.fillStyle = "#ff8a80"; rectR(g, x - 20, y - RR - 32, 40, 8, 4); g.fill(); }
    // caja
    const gr = g.createRadialGradient(x - 30, y - 30, 10, x, y, RR + 10);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#d6dde3"); gr.addColorStop(1, "#8a949e");
    g.fillStyle = "#5a646e"; g.beginPath(); g.arc(x, y, RR + 10, 0, 6.283); g.fill();
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, RR, 0, 6.283); g.fill();
    // marcas
    g.strokeStyle = "#2a2e34";
    for (let i = 0; i < 30; i++) { const a = -Math.PI / 2 + (i / 30) * 6.283, l = i % 5 ? 7 : 14; g.lineWidth = i % 5 ? 2 : 4; g.beginPath(); g.moveTo(x + Math.cos(a) * (RR - 4), y + Math.sin(a) * (RR - 4)); g.lineTo(x + Math.cos(a) * (RR - 4 - l), y + Math.sin(a) * (RR - 4 - l)); g.stroke(); }
    // sector que queda
    const rojo = R.fin || (R.corre && R.v < 10);
    const col = R.ok ? "rgba(43,200,91,.35)" : rojo ? "rgba(255,40,40,.35)" : "rgba(255,190,40,.3)";
    g.fillStyle = col; g.beginPath(); g.moveTo(x, y); g.arc(x, y, RR - 20, -Math.PI / 2, -Math.PI / 2 + (R.v / 30) * 6.283); g.closePath(); g.fill();
    // número
    const n = Math.ceil(R.v - 0.001), parp = R.fin && Math.sin(t * 20) < 0;
    rectR(g, x - 50, y + 14, 100, 46, 8); g.fillStyle = "#0e1418"; g.fill();
    txt(g, "0:" + String(Math.max(0, n)).padStart(2, "0"), x, y + 53, { tam: 44, peso: 900, fam: FD, color: parp ? "#5a0a0a" : R.ok ? "#2bff5b" : rojo ? "#ff4a3a" : "#ffd34d", esp: 2 });
    // aguja
    const a = -Math.PI / 2 + (R.v / 30) * 6.283;
    g.strokeStyle = "#c0262a"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (RR - 16), y + Math.sin(a) * (RR - 16)); g.stroke();
    g.fillStyle = "#c0262a"; g.beginPath(); g.arc(x, y, 8, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(x - 34, y - 46, 26, 12, -0.6, 0, 6.283); g.fill();
    g.restore();
  }
  remolino(g, cx, t, k) {
    if (k <= 0) return;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const y = PIES - 20 - i * 38, rx = 70 + i * 9 + 10 * Math.sin(t * 9 + i), ry = 14 + i * 1.5;
      const a0 = t * 16 + i * 1.3;
      g.strokeStyle = `rgba(230,240,255,${0.75 * k})`; g.lineWidth = 6;
      g.beginPath(); g.ellipse(cx + 6 * Math.sin(t * 7 + i), y, rx, ry, 0, a0, a0 + 2.4); g.stroke();
      g.strokeStyle = `rgba(150,180,230,${0.5 * k})`; g.lineWidth = 3;
      g.beginPath(); g.ellipse(cx, y, rx * 0.8, ry, 0, a0 + 3, a0 + 4.6); g.stroke();
    }
    g.restore();
  }
  nube(g, t, k) {
    if (k <= 0) return;
    const cx = XG, cy = PIES - 160;
    g.save(); g.globalAlpha = k;
    const r = semilla(Math.floor(t * 12));
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * 6.283 + t * 2, rr = 80 + 30 * r();
      const x = cx + Math.cos(a) * rr * 1.1, y = cy + Math.sin(a) * rr * 1.25, R = 62 + 22 * r();
      const gr = g.createRadialGradient(x - R * 0.3, y - R * 0.3, 4, x, y, R);
      gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.75, "#dfe4ea"); gr.addColorStop(1, "#aab2bc");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, 6.283); g.fill();
    }
    g.fillStyle = "#eef1f4"; g.beginPath(); g.arc(cx, cy, 110, 0, 6.283); g.fill();
    // brazos y piernas que asoman
    const s = Math.floor(t * 6) % 4;
    g.fillStyle = "#1c1c20";
    if (s === 0) { g.save(); g.translate(cx - 120, cy - 40); g.rotate(-0.5); rectR(g, -40, -8, 46, 16, 7); g.fill(); g.restore(); }
    if (s === 1) { g.save(); g.translate(cx + 110, cy + 90); g.rotate(0.6); g.fillStyle = "#2a3a5c"; rectR(g, -10, -10, 22, 56, 8); g.fill(); g.restore(); }
    if (s === 2) { g.save(); g.translate(cx + 120, cy - 80); g.rotate(0.4); rectR(g, -6, -8, 46, 16, 7); g.fill(); g.restore(); }
    for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; brillo(g, cx + Math.cos(a) * 90, cy - 40 + Math.sin(a) * 70, 22, 1); }
    g.restore();
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(900, 160), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 24, 0, 124);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe38a"); gr.addColorStop(1, "#ff5a1a");
    txt(g, "¡30 SEGUNDOS!", 456, 126, { tam: 118, peso: 900, fam: FD, color: "#3a0a00", esp: 6, max: 840 });
    txt(g, "¡30 SEGUNDOS!", 450, 120, { tam: 118, peso: 900, fam: FD, color: gr, borde: "#3a0a00", bordeAncho: 11, esp: 6, glow: "rgba(255,120,40,.8)", glowTam: 22, max: 840 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // perchas con el equipo
    percha(g, PERCHA_G); percha(g, PERCHA_M);
    if (t < T_REM0 + 0.15) { chaqueton(g, PERCHA_M, 250, 1, 0.03 * Math.sin(t * 2)); casco(g, PERCHA_M, 222, 74); }
    if (t < T_G_SALTA) { chaqueton(g, PERCHA_G, 250, 1, 0.03 * Math.sin(t * 2 + 1)); casco(g, PERCHA_G, 222, 74); }
    // equipo en el suelo
    if (t < T_REM0) botasPreparadas(g, XM, PIES);
    if (t < T_NUBE0) botasPreparadas(g, XG, PIES);
    this.dibujarReloj(g, t);
    // sombras
    g.fillStyle = "rgba(0,0,0,.35)";
    for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 52, 8, 0, 0, 6.283); g.fill(); }
    // Marcos (con remolino)
    const kRem = tramo(t, T_REM0 - 0.1, T_REM0 + 0.1) * (1 - tramo(t, T_REM1 - 0.1, T_REM1 + 0.1));
    if (kRem > 0) this.remolino(g, XM, t, kRem);
    pintarAvatar(g, e.mM, e.M, t);
    if (kRem > 0) {
      // el chaquetón y el casco dan vueltas antes de quedarse puestos
      const u = tramo(t, T_REM0, T_CAMBIO);
      if (u < 1) { const a = t * 14; chaqueton(g, XM + Math.cos(a) * 90, PIES - 200 + Math.sin(a) * 30, 0.8, a); casco(g, XM - Math.cos(a) * 80, PIES - 300 - Math.sin(a) * 20, 64, -a); }
      g.save(); g.globalAlpha = 0.6; this.remolino(g, XM, t + 0.07, kRem); g.restore();
    }
    // Guillermo (o la nube)
    const kN = tramo(t, T_NUBE0 - 0.1, T_NUBE0 + 0.1) * (1 - tramo(t, T_NUBE1, T_NUBE1 + 0.25));
    if (!e.enNube) {
      // la bota que lleva puesta en un pie
      pintarAvatar(g, e.mG, e.G, t);
      if (t > T_NUBE1) conMat(g, e.mG, () => { bota(g, 29, 228, 0.72); });
      // casco del revés
      if (t > T_CASCO) { const c = aPant(e.mG, [39, -14]); casco(g, c[0], c[1] - 2 + 3 * Math.sin(t * 6), 84, Math.PI + 0.12 * Math.sin(t * 3)); }
    }
    this.nube(g, t, kN);
    // lo que sale volando de la nube
    const V = this.vuelan(t, e.mG);
    if (V.chaq) chaqueton(g, V.chaq[0], V.chaq[1], 0.85, t < 5.55 ? V.chaq[2] : 1.4);
    if (V.bota && t < T_NUBE1) bota(g, V.bota[0], V.bota[1], 0.9, V.bota[2]);
    if (V.casco && t < T_CASCO) casco(g, V.casco[0], V.casco[1], 84, V.casco[2] + Math.PI);
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡YA!", 512, 108, T_YA1, 0.55, 62, "#2bff5b", "#032a0c", -0.08);
    ono("¡YA!", 512, 108, T_YA2, 0.55, 62, "#2bff5b", "#032a0c", 0.08);
    ono("¡LISTO!", 820, 260, T_REM1 + 0.05, 0.75, 54, "#ffd34d", "#3a2400", 0.1);
    ono("¡PAF!", 190, 300, 4.6, 0.4, 46, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡ZAS!", 470, 380, 5.1, 0.4, 46, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡BOING!", 200, 420, 5.6, 0.4, 44, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡CLONC!", 470, 240, T_CASCO, 0.5, 50, "#2fe3e8", "#06303a", 0.1);
    ono("¡PIIII!", 512, 108, T_NUBE1, 0.6, 66, "#ff4a3a", "#3a0000", -0.06);
    // ¡30 SEGUNDOS! al principio y en el remate (con «y pico»)
    const r = this.titulo();
    const tit = (t0, t1, y) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.16), sal = tramo(t, t1 - 0.2, t1);
      const s = lerp(1.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7)) * 0.86;
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512, y); g.rotate(-0.025); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_TIT, T_YA1, 74);
    tit(T_ORGULLO + 0.25, T_FIN, 74);
    if (t > T_ORGULLO + 0.85 && t < T_FIN) {
      const k = eBack(tramo(t, T_ORGULLO + 0.85, T_ORGULLO + 1.05)), sal = tramo(t, T_FIN - 0.2, T_FIN);
      g.save(); g.translate(842, 150); g.rotate(-0.16); g.scale(k, k); g.globalAlpha = 1 - sal;
      rectR(g, -86, -30, 172, 56, 10); g.fillStyle = "#ffd34d"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#3a2400"; g.stroke();
      txt(g, "Y PICO", 0, 16, { tam: 44, peso: 400, fam: FC, color: "#3a2400", esp: 2 });
      g.restore();
    }
    // entrada y salida
    const a = Math.max(1 - tramo(t, 0.02, 0.38), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00210", nombre: "Vestirse en 30 segundos", crear: () => new Vestirse() });
})();
