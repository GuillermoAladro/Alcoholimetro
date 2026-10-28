"use strict";
/*
 * 00211 · LA LONA DE SALTO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo se ha subido al tejado del bar a por una pelota y no sabe bajar. Llegan corriendo Marcos y un compañero
 * (otro bombero, de casco amarillo y gafas de sol) con la lona: ¡SALTA! Guillermo dice que no, cierra los ojos y salta:
 * rebota tres veces, cada vez más alto (¡BOING!), la tercera se sale por arriba… y cae sentado en una silla de la
 * terraza. La pelota le cae en las manos y los bomberos aplauden.
 */
(() => {
const ESC = 1.15;
const TEJADO = 292, XT = 228;                      // tejado y dónde está Guillermo
const LC = [520, 462], LRX = 162, LRY = 30;         // la lona
const XM = 345, XC = 695;                          // Marcos y el compañero
const SILLA = 866;
const T_LLEGAN = 0.35, T_PUESTOS = 1.35, T_SALTA_TXT = 1.45, T_NO = 2.0, T_SALTA = 3.2, T_LONA1 = 3.75;
const T_B2 = 4.5, T_B3 = 5.4, T_FUERA = 5.95, T_BAJA = 6.55, T_SILLA = 7.05, T_PELOTA = 7.75, T_APLAUDE = 8.1, T_FIN = 9.75, DUR = 10.3;
const CONTACTO = 0.12;                             // lo que dura cada bote pisando la lona
const CT = cacheTexto();
const aU = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function pelota(g, x, y, r, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const cols = ["#ff3d3d", "#ffffff", "#2f8cff", "#ffffff", "#ffd34d", "#ffffff"];
  for (let i = 0; i < 6; i++) { g.fillStyle = cols[i]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, (i / 6) * 6.283, ((i + 1) / 6) * 6.283); g.closePath(); g.fill(); }
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,.3)");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(0, 0, r * 0.18, 0, 6.283); g.fill();
  g.restore();
}

class LonaSalto extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.p.suelo = () => PIES + 4;
  }
  /** Hundimiento de la lona (px): baja mientras Guillermo la pisa y luego vibra un poco. */
  hundir(t) {
    let h = 0;
    for (const [t0, f] of [[T_LONA1, 55], [T_B2, 70], [T_B3, 85]]) {
      const d = t - t0;
      if (d > -CONTACTO && d < CONTACTO) h = Math.max(h, f * Math.cos((d / CONTACTO) * Math.PI / 2));
      else if (d >= CONTACTO && d < 0.9) h = Math.max(h, -0.25 * f * Math.exp(-(d - CONTACTO) * 6) * Math.sin((d - CONTACTO) * 18));
    }
    return h;
  }
  /** Pies de Guillermo durante los saltos: { x, y, aire, u }. */
  vuelo(t) {
    const fondo = LC[1] + 8, C = CONTACTO;
    const bote = (a, b, alto) => { const u = tramo(t, a + C, b - C); return { x: LC[0], y: fondo - alto * Math.sin(Math.PI * u), aire: true, u }; };
    if (t < T_LONA1 - C) {
      const u = tramo(t, T_SALTA, T_LONA1 - C);
      return { x: lerp(XT, LC[0], u), y: lerp(TEJADO, fondo, u) - 120 * Math.sin(Math.PI * u), aire: true, u };
    }
    for (const t0 of [T_LONA1, T_B2, T_B3]) if (Math.abs(t - t0) <= C) return { x: LC[0], y: fondo + 0.8 * this.hundir(t), aire: false, u: 0 };
    if (t < T_B2) return bote(T_LONA1, T_B2, 250);
    if (t < T_B3) return bote(T_B2, T_B3, 400);
    if (t < T_BAJA) { const u = tramo(t, T_B3 + C, T_FUERA); return { x: LC[0] + 60 * u, y: fondo - 1000 * eOut(u), aire: true, u }; }
    const u = tramo(t, T_BAJA, T_SILLA);
    return { x: SILLA, y: lerp(-400, PIES, eIn(u)), aire: true, u };
  }
  poses() {
    const t = this.t, H = this.hundir(t);
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [50, 112], manoI: [26, 116], brazoIDelante: true };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const C = { quien: "bombero", cascoColor: "#f2c21b", gafas: true, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let pelotaEnMano = true;
    // ---------------- los bomberos con la lona
    let xm = XM, xc = XC, ym = PIES, yc = PIES;
    const llegada = tramo(t, T_LLEGAN, T_PUESTOS);
    if (llegada < 1) {
      xm = lerp(1180, XM, eOut(llegada)); xc = lerp(1530, XC, eOut(llegada));
      const a = andar((t - T_LLEGAN) * 20, 1.3), b = andar((t - T_LLEGAN) * 20 + 1.4, 1.3);
      M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * (1 - llegada);
      C.piernaI = b.piernaI; C.piernaD = b.piernaD; yc += b.bote * (1 - llegada);
      M.cara = "risa"; C.cara = "risa";
    }
    const mM = matAv(xm, ym, ESC), mC = matAv(xc, yc, ESC);
    // agarran el aro
    const aro = (ang) => [LC[0] + (xm - XM) + LRX * Math.cos(ang), LC[1] + H * 0.12 + LRY * Math.sin(ang)];
    const aroC = (ang) => [LC[0] + (xc - XC) + LRX * Math.cos(ang), LC[1] + H * 0.12 + LRY * Math.sin(ang)];
    M.manoD = aU(mM, aro(Math.PI * 0.93)); M.manoI = aU(mM, aro(Math.PI * 1.06)); M.brazoIDelante = true;
    C.manoI = aU(mC, aroC(Math.PI * 0.07)); C.manoD = aU(mC, aroC(-Math.PI * 0.06));
    // caras
    if (t > T_PUESTOS) {
      M.rc = -0.16; C.rc = -0.2; M.cara = "guino"; C.cara = "sonrisa";
      if (t > T_SALTA_TXT && t < T_SALTA) { M.cara = Math.floor(t * 3) % 2 ? "risa" : "guino"; }
      if (t > T_SALTA) {
        // siguen a Guillermo con la cabeza
        const v = this.vuelo(t), alto = v.y < 330;
        M.cara = alto ? "sorpresa" : "risa"; C.cara = alto ? "sorpresa" : "risa";
        M.rc = alto ? -0.25 : 0; C.rc = alto ? 0.25 : 0;
      }
      if (t > T_FUERA) {
        // ¿dónde está? se miran
        M.cara = "sorpresa"; C.cara = "sorpresa";
        M.rc = 0.2 * Math.sin((t - T_FUERA) * 6); C.rc = -0.2 * Math.sin((t - T_FUERA) * 6);
      }
      if (t > T_BAJA + 0.2) { M.rc = 0.24; C.rc = 0.2; M.cara = "sorpresa"; C.cara = "sorpresa"; }
      if (t > T_SILLA + 0.2) { M.cara = "risa"; C.cara = "risa"; }
      if (t > T_APLAUDE) {
        // sueltan la lona y aplauden
        const s = Math.sin((t - T_APLAUDE) * 22);
        M.brazoIDelante = true; M.manoD = [44 + 6 * s, 104]; M.manoI = [28 - 6 * s, 104];
        C.brazoIDelante = true; C.manoD = [44 + 6 * s, 104]; C.manoI = [28 - 6 * s, 104];
        M.cara = "risa"; C.cara = Math.floor(t * 2) % 2 ? "risa" : "guino"; M.rc = 0.18; C.rc = 0.14;
      }
    }
    // ---------------- Guillermo
    let mG;
    if (t < T_SALTA) {
      // en el tejado, muerto de miedo
      G.cara = t < T_NO ? "sorpresa" : t < 2.85 ? "sorpresa" : "dormido";
      const tiembla = Math.sin(t * 40) * 1.5;
      G.rc = t > T_NO && t < 2.85 ? 0.22 * Math.sin((t - T_NO) * 14) : 0.1;
      G.piernaI = [0, 0.04 * Math.sin(t * 40)]; G.piernaD = [0, -0.04 * Math.sin(t * 40)];
      let sy = 1;
      if (t > 2.85) { const k = tramo(t, 2.85, T_SALTA); sy = 1 - 0.1 * Math.sin(Math.PI * k * 0.5 + 0.0); }
      mG = matAv(XT + tiembla, TEJADO, ESC, 0, 1, sy);
    } else if (t < T_SILLA) {
      const v = this.vuelo(t);
      let sy = 1;
      const enLona = !v.aire && t < T_BAJA;
      if (enLona) sy = 1 - Math.min(0.2, Math.max(0, H) / 450);
      G.manoD = [96, 30]; G.manoI = [-20, 30]; G.brazoIDelante = false;
      G.piernaI = [-8, 0.12]; G.piernaD = [-8, -0.12];
      G.cara = t < T_LONA1 ? "dormido" : t < T_B2 ? "sorpresa" : t < T_B3 ? "risa" : "sorpresa";
      G.puntas = t < T_LONA1 ? 0.5 : 0.8;
      if (t > T_B3) { pelotaEnMano = false; }
      if (t > T_BAJA) { G.cara = "sorpresa"; G.puntas = 1; G.piernaI = [-30, 0.3]; G.piernaD = [-30, -0.3]; }
      mG = matAv(v.x, v.y, ESC, t < T_LONA1 - CONTACTO ? -0.2 * Math.sin(Math.PI * v.u) : 0, 1, sy, t > T_BAJA ? [39, 206] : [39, 232]);
    } else {
      // sentado en la silla
      const d = t - T_SILLA;
      const sy = 1 - 0.1 * Math.exp(-d * 8) * Math.cos(d * 26);
      G.piernaI = [-26, 0.12]; G.piernaD = [-26, -0.12];
      G.cara = d < 0.35 ? "sorpresa" : t < T_PELOTA ? "sonrisa" : "guino";
      pelotaEnMano = t > T_PELOTA;
      G.manoD = t > T_PELOTA ? [62, 120] : [92, 122]; G.manoI = t > T_PELOTA ? [16, 122] : [-14, 124];
      if (t > T_PELOTA + 0.45) { const k = eOut(tramo(t, T_PELOTA + 0.45, T_PELOTA + 0.7)); G.manoD = mezcla([62, 120], [92, 40], k); G.manoI = [16, 150]; G.cara = "risa"; G.rc = -0.08; }
      mG = matAv(SILLA, PIES, ESC, 0, 1, sy, [39, 206]);
    }
    if (pelotaEnMano) G.objD2 = (g, mano) => pelota(g, mano[0] - 10, mano[1] - 4, 15, 0.3);
    return { G, M, C, mG, mM, mC };
  }
  /** La pelota suelta (cuando se le escapa en el tercer bote). */
  pelotaSuelta(t) {
    if (t < T_B3 || t > T_PELOTA) return null;
    if (t < T_FUERA) { const u = tramo(t, T_B3, T_FUERA); return [LC[0] + 30 + 80 * u, LC[1] - 900 * eOut(u)]; }
    if (t < T_SILLA + 0.15) return null;
    const u = tramo(t, T_SILLA + 0.15, T_PELOTA);
    return [SILLA - 6, lerp(-40, PIES - 150, eIn(u))];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const [k, t0, f] of [["b1", T_LONA1, 8], ["b2", T_B2, 11], ["b3", T_B3, 14]]) {
      this.una(k, t > t0, () => { temblar(f, 0.25); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, LC[0] + azar(-120, 120), LC[1] + 10, azar(-120, 120), azar(-30, 30), azar(0.4, 0.7), azar(16, 26)); });
    }
    this.una("silla", t > T_SILLA, () => {
      temblar(14, 0.3);
      for (let i = 0; i < 14; i++) p.nueva(P.POLVO, SILLA + azar(-60, 60), PIES, azar(-160, 160), azar(-50, -10), azar(0.5, 0.9), azar(20, 32));
    });
    this.una("pelota", t > T_PELOTA, () => { temblar(4, 0.15); for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, SILLA, PIES - 150, azar(-180, 180), azar(-220, -40), azar(0.3, 0.5), azar(5, 8)); });
    this.una("aplauso", t > T_APLAUDE, () => {
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, 0), azar(-40, 40), azar(30, 120), azar(1.6, 2.4), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, PIES);
    gc.addColorStop(0, "#3a6ac8"); gc.addColorStop(0.55, "#8ab6ec"); gc.addColorStop(1, "#ffd9a8");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, PIES + 60);
    // nubes
    g.fillStyle = "rgba(255,255,255,.8)";
    for (const [x, y, s] of [[560, 70, 1.1], [860, 150, 0.8], [700, 260, 0.6]]) for (const [dx, dy, r] of [[0, 0, 30], [32, -12, 36], [68, 0, 28], [34, 10, 30]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    // edificios al fondo
    g.fillStyle = "#6a7aa8";
    for (const [x, w, h] of [[400, 120, 190], [540, 90, 240], [650, 140, 170], [810, 100, 220], [930, 130, 160]]) g.fillRect(x, PIES - h, w, h);
    g.fillStyle = "rgba(255,240,180,.55)";
    for (const [x, w, h] of [[400, 120, 190], [540, 90, 240], [650, 140, 170], [810, 100, 220], [930, 130, 160]])
      for (let yy = PIES - h + 16; yy < PIES - 30; yy += 30) for (let xx = x + 12; xx < x + w - 14; xx += 26) g.fillRect(xx, yy, 12, 14);
    // el bar (con tejado)
    const gw = g.createLinearGradient(-60, 0, 350, 0); gw.addColorStop(0, "#8a4a32"); gw.addColorStop(1, "#b0623e");
    g.fillStyle = gw; g.fillRect(-60, TEJADO, 410, PIES - TEJADO);
    g.fillStyle = "rgba(0,0,0,.12)";
    for (let y = TEJADO + 8; y < PIES; y += 20) for (let x = (y / 20) % 2 ? -60 : -40; x < 350; x += 40) g.fillRect(x, y, Math.min(36, 350 - x), 2);
    g.fillStyle = "#5a3020"; g.fillRect(-60, TEJADO - 10, 420, 14);
    g.fillStyle = "rgba(255,220,180,.4)"; g.fillRect(-60, TEJADO - 10, 420, 2);
    // toldo y escaparate
    g.fillStyle = "#2a1a12"; g.fillRect(20, 400, 280, 175);
    g.fillStyle = "rgba(255,200,120,.5)"; g.fillRect(30, 410, 260, 120);
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? "#fffdf5" : "#1d7a3a"; g.beginPath(); g.moveTo(10 + i * 43, 360); g.lineTo(53 + i * 43, 360); g.lineTo(53 + i * 43, 398); g.quadraticCurveTo(31 + i * 43, 410, 10 + i * 43, 398); g.closePath(); g.fill(); }
    txt(g, "BAR", 160, 350, { tam: 34, peso: 900, fam: FD, color: "#ffd34d", esp: 8 });
    // antena del tejado
    g.strokeStyle = "#3a3f46"; g.lineWidth = 4; g.beginPath(); g.moveTo(80, TEJADO - 10); g.lineTo(80, TEJADO - 90); g.moveTo(56, TEJADO - 70); g.lineTo(104, TEJADO - 70); g.moveTo(62, TEJADO - 54); g.lineTo(98, TEJADO - 54); g.stroke();
    // suelo
    const gs = g.createLinearGradient(0, PIES, 0, H + 60); gs.addColorStop(0, "#8a8078"); gs.addColorStop(1, "#4a4440");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    return (this.cF = c);
  }
  silla(g) {
    const x = SILLA, y = PIES;
    const gr = g.createLinearGradient(x - 50, 0, x + 50, 0); gr.addColorStop(0, "#7a4a22"); gr.addColorStop(0.5, "#b07a40"); gr.addColorStop(1, "#6a3a14");
    g.fillStyle = "#3a3f46";
    g.fillRect(x - 50, y - 228, 8, 228); g.fillRect(x + 42, y - 228, 8, 228);
    g.fillStyle = gr; for (let i = 0; i < 3; i++) rectR(g, x - 50, y - 222 + i * 30, 100, 18, 4), g.fill();
    g.fillStyle = "#3a3f46"; g.fillRect(x - 54, y - 108, 108, 8);
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - 108, 58, 14, 0, 0, 6.283); g.fill();
    g.fillStyle = "#3a3f46"; g.fillRect(x - 46, y - 104, 7, 104); g.fillRect(x + 39, y - 104, 7, 104);
  }
  /** La lona: aro trasero + tela (se hunde) o aro delantero. */
  lona(g, t, parte, mM, mC) {
    const H = this.hundir(t), off = (aPant(mM, [39, 232])[0] - XM);
    const cx = LC[0] + off, cy = LC[1] + H * 0.12;
    const soltada = t > T_APLAUDE ? eIn(tramo(t, T_APLAUDE, T_APLAUDE + 0.35)) : 0;
    g.save(); g.translate(0, soltada * (PIES - 6 - cy)); g.translate(cx, cy); g.scale(1, 1 - soltada * 0.6); g.translate(-cx, -cy);
    if (parte === "atras") {
      // tela
      g.beginPath(); g.ellipse(cx, cy, LRX, LRY, 0, Math.PI, 0); g.quadraticCurveTo(cx, cy + LRY + H * 1.6, cx - LRX, cy);
      const gr = g.createRadialGradient(cx, cy + H * 0.6, 4, cx, cy, LRX);
      gr.addColorStop(0, "#fff3b0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#e0a400");
      g.fillStyle = gr; g.fill();
      g.strokeStyle = "#d8261c"; g.lineWidth = 6;
      g.beginPath(); g.ellipse(cx, cy + H * 0.5, LRX * 0.55, LRY * 0.55, 0, 0, 6.283); g.stroke();
      g.fillStyle = "#d8261c"; g.beginPath(); g.ellipse(cx, cy + H * 0.8, LRX * 0.16, LRY * 0.22, 0, 0, 6.283); g.fill();
      g.lineWidth = 14; g.strokeStyle = "#b01a14"; g.beginPath(); g.ellipse(cx, cy, LRX, LRY, 0, Math.PI, 0); g.stroke();
      g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(cx, cy - 3, LRX, LRY, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    } else {
      g.lineWidth = 16; g.strokeStyle = "#d8261c"; g.beginPath(); g.ellipse(cx, cy, LRX, LRY, 0, 0, Math.PI); g.stroke();
      g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.ellipse(cx, cy - 4, LRX, LRY, 0, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
      g.strokeStyle = "#fffdf5"; g.lineWidth = 3;
      for (let i = 1; i < 6; i++) { const a = (i / 6) * Math.PI; g.beginPath(); g.ellipse(cx, cy, LRX, LRY, 0, a - 0.05, a + 0.05); g.stroke(); }
    }
    g.restore();
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(520, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe38a"); gr.addColorStop(1, "#ff3d3d");
    txt(g, "¡SALTA!", 266, 146, { tam: 140, peso: 900, fam: FD, color: "#3a0000", esp: 6 });
    txt(g, "¡SALTA!", 260, 140, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#3a0000", bordeAncho: 12, esp: 6, glow: "rgba(255,80,40,.8)", glowTam: 22 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    this.silla(g);
    // sombras
    g.fillStyle = "rgba(0,0,0,.3)";
    for (const m of [e.mM, e.mC]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 48, 8, 0, 0, 6.283); g.fill(); }
    g.beginPath(); g.ellipse(LC[0], PIES + 4, 170, 12, 0, 0, 6.283); g.fill();
    const v = this.vuelo(t), enLona = t > T_LONA1 - CONTACTO - 0.02 && t < T_FUERA && v.y > LC[1] - 60;
    this.lona(g, t, "atras", e.mM, e.mC);
    // Guillermo detrás del aro delantero cuando está en la lona
    const G = () => pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mC, e.C, t);
    if (enLona) G();
    this.lona(g, t, "delante", e.mM, e.mC);
    if (!enLona) G();
    const ps = this.pelotaSuelta(t);
    if (ps) pelota(g, ps[0], ps[1], 18, t * 8);
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
    ono("¡NO, NO!", 120, 120, T_NO, 0.8, 42, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡BOING!", 830, 250, T_LONA1, 0.5, 50, "#ffd34d", "#3a2400", 0.1);
    ono("¡BOING!", 210, 200, T_B2, 0.55, 62, "#ffd34d", "#3a2400", -0.1);
    ono("¡BOIIING!", 800, 170, T_B3, 0.6, 76, "#ffd34d", "#3a2400", 0.1);
    ono("¡PLOF!", 880, 250, T_SILLA, 0.6, 62, "#fffdf5", "#1b1b1b", -0.08);
    ono("¿?", 520, 250, T_FUERA + 0.1, 0.5, 70, "#2fe3e8", "#06303a", 0);
    // ¡SALTA!
    if (t > T_SALTA_TXT && t < T_SALTA + 0.15) {
      const d = t - T_SALTA_TXT, k = tramo(d, 0, 0.16), sal = tramo(t, T_SALTA - 0.15, T_SALTA + 0.15);
      const s = lerp(1.6, 1, eIn(k)) * (1 + 0.04 * Math.sin(d * 9)) * 0.9;
      const r = this.rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(720, 110); g.rotate(0.05); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
      // de quién sale
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.strokeStyle = "#fffdf5"; g.lineWidth = 4; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(560 + i * 16, 200 + i * 6); g.lineTo(470 + i * 6, 260 + i * 10); g.stroke(); }
      g.restore();
    }
    // ¡SALTA! otra vez en el remate, pequeño en la lona (pintado)
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00211", nombre: "La lona de salto", crear: () => new LonaSalto() });
})();
