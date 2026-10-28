"use strict";
/*
 * 00248 · PUERTAS ABIERTAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Jornada de puertas abiertas en el parque de bomberos: pancarta, globos y el camión aparcado de frente. Marcos le
 * lanza un casco a Guillermo (¡TOC!), que sube de un salto a la cabina (¡HOP!), agarra el volante y toca la bocina
 * (¡MOOOC!): a Marcos le salta el casco. Marcos saca la cámara (¡POSA!), Guillermo grita ¡PATATA!, flash… y la
 * foto, Guillermo con casco en el camión, sale volando junto al título ¡PUERTAS ABIERTAS!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45;
const CX = 380;                       // centro del camión
const XM = 830, XG0 = 640;
const T_TIRA = 0.7, T_CASCO = 1.2, T_VA = 1.85, T_SALTA = 2.15, T_DENTRO = 2.6;
const T_MOC = 3.75, T_MOC2 = [4.45, 4.7], T_CAM = 5.15, T_PATATA = 5.75, T_FLASH = 6.45, T_FOTO = 6.75, T_APAGA = 9.8, DUR = 10.4;
const PARABRISAS = [[CX - 136, 204], [CX + 136, 204], [CX + 128, 332], [CX - 128, 332]];

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function cascoEn(g, cx, cy, rot, esc) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(esc, esc); g.translate(-44, -18);
  cascoBombero(g, 88);
  g.restore();
}
function rutaParabrisas(g, nueva = true) {
  if (nueva) g.beginPath();
  g.moveTo(PARABRISAS[0][0] + 14, PARABRISAS[0][1]);
  g.lineTo(PARABRISAS[1][0] - 14, PARABRISAS[1][1]); g.quadraticCurveTo(PARABRISAS[1][0], PARABRISAS[1][1], PARABRISAS[1][0], PARABRISAS[1][1] + 14);
  g.lineTo(PARABRISAS[2][0], PARABRISAS[2][1]); g.lineTo(PARABRISAS[3][0], PARABRISAS[3][1]);
  g.lineTo(PARABRISAS[0][0], PARABRISAS[0][1] + 14); g.quadraticCurveTo(PARABRISAS[0][0], PARABRISAS[0][1], PARABRISAS[0][0] + 14, PARABRISAS[0][1]);
  g.closePath();
}

// ------------------------------------------------------------------------------------------- el camión de frente
function camionFondo(g) {
  // ruedas (asoman por debajo) y sombra
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(CX, PIES + 4, 200, 14, 0, 0, 6.283); g.fill();
  g.fillStyle = "#141416";
  rectR(g, CX - 156, 430, 54, 148, 12); g.fill(); rectR(g, CX + 102, 430, 54, 148, 12); g.fill();
  g.fillStyle = "#2a2a2e"; for (const x of [CX - 150, CX + 108]) for (let y = 470; y < 570; y += 14) g.fillRect(x, y, 42, 5);
  // interior de la cabina
  const gi = g.createLinearGradient(0, 204, 0, 332);
  gi.addColorStop(0, "#22303e"); gi.addColorStop(1, "#0c1218");
  g.fillStyle = gi; rutaParabrisas(g); g.fill();
  g.fillStyle = "#3a4048"; g.fillRect(CX - 128, 214, 256, 6);
}
function camionFrente(g, t, luces) {
  // carrocería con el hueco del parabrisas
  g.save();
  g.beginPath();
  const x = CX - 162, y = 178, w = 324, h = 290, r = 28;
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  rutaParabrisas(g, false);
  const gr = g.createLinearGradient(0, 178, 0, 470);
  gr.addColorStop(0, "#ff5a48"); gr.addColorStop(0.3, "#e11e14"); gr.addColorStop(1, "#8e0d07");
  g.fillStyle = gr; g.fill("evenodd");
  g.restore();
  g.strokeStyle = "#5e0805"; g.lineWidth = 3; rectR(g, CX - 162, 178, 324, 290, 28); g.stroke();
  // reflejos del cristal
  g.save(); rutaParabrisas(g); g.clip();
  g.fillStyle = "rgba(255,255,255,.13)";
  g.beginPath(); g.moveTo(CX - 136, 300); g.lineTo(CX - 60, 204); g.lineTo(CX - 20, 204); g.lineTo(CX - 110, 332); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(CX + 70, 332); g.lineTo(CX + 136, 250); g.lineTo(CX + 136, 280); g.lineTo(CX + 100, 332); g.closePath(); g.fill();
  g.restore();
  g.strokeStyle = "#2a2e33"; g.lineWidth = 6; rutaParabrisas(g); g.stroke();
  // limpiaparabrisas
  g.strokeStyle = "#1b1b1b"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(CX - 90, 330); g.lineTo(CX - 20, 300); g.moveTo(CX + 30, 330); g.lineTo(CX + 100, 300); g.stroke();
  // rótulo
  txt(g, "BOMBEROS", CX, 364, { tam: 32, peso: 900, fam: FD, color: "#fffdf5", borde: "#5e0805", bordeAncho: 5, esp: 5 });
  // rejilla
  const gc = g.createLinearGradient(0, 376, 0, 446);
  gc.addColorStop(0, "#ffffff"); gc.addColorStop(0.5, "#b9c0c6"); gc.addColorStop(1, "#6a727a");
  g.fillStyle = gc; rectR(g, CX - 82, 376, 164, 70, 9); g.fill();
  g.fillStyle = "#2a2e33"; for (let y = 386; y < 440; y += 11) rectR(g, CX - 72, y, 144, 6, 3), g.fill();
  // emblema propio
  g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(CX, 411, 17, 0, 6.283); g.fill();
  g.fillStyle = "#e11e14"; g.beginPath(); g.arc(CX, 411, 13, 0, 6.283); g.fill();
  g.fillStyle = "#ffd34d"; g.beginPath(); g.moveTo(CX, 421); g.quadraticCurveTo(CX - 9, 414, CX - 3, 405); g.quadraticCurveTo(CX - 1, 410, CX + 1, 410); g.quadraticCurveTo(CX, 403, CX + 4, 400); g.quadraticCurveTo(CX + 9, 412, CX, 421); g.fill();
  // faros
  for (const sd of [-1, 1]) {
    const x = CX + sd * 122;
    g.fillStyle = "#b9c0c6"; g.beginPath(); g.arc(x, 404, 24, 0, 6.283); g.fill();
    const gf = g.createRadialGradient(x - 6, 398, 2, x, 404, 20);
    gf.addColorStop(0, "#ffffff"); gf.addColorStop(1, "#ffe08a");
    g.fillStyle = gf; g.beginPath(); g.arc(x, 404, 19, 0, 6.283); g.fill();
    g.fillStyle = "#ffb020"; rectR(g, x - 16, 432, 32, 10, 4); g.fill();
  }
  // parachoques
  const gb = g.createLinearGradient(0, 452, 0, 488);
  gb.addColorStop(0, "#ffffff"); gb.addColorStop(0.5, "#b9c0c6"); gb.addColorStop(1, "#5a6168");
  g.fillStyle = gb; rectR(g, CX - 176, 452, 352, 36, 10); g.fill();
  g.fillStyle = "#3a4048"; rectR(g, CX - 40, 462, 80, 16, 3); g.fill();
  // espejos
  for (const sd of [-1, 1]) {
    g.strokeStyle = "#2a2e33"; g.lineWidth = 5; g.beginPath(); g.moveTo(CX + sd * 160, 240); g.lineTo(CX + sd * 196, 228); g.stroke();
    g.fillStyle = "#2a2e33"; rectR(g, CX + sd * 196 - 12, 200, 24, 64, 6); g.fill();
    g.fillStyle = "rgba(160,210,255,.5)"; rectR(g, CX + sd * 196 - 8, 206, 16, 52, 4); g.fill();
  }
  // barra de luces
  g.fillStyle = "#2a2a30"; rectR(g, CX - 112, 160, 224, 20, 8); g.fill();
  for (const sd of [-1, 1]) {
    const lx = CX + sd * 64, on = luces && Math.sin(t * 16 + (sd > 0 ? Math.PI : 0)) > 0;
    const gl = g.createLinearGradient(0, 138, 0, 162);
    gl.addColorStop(0, on ? "#d6faff" : "#6aa8d0"); gl.addColorStop(1, on ? "#2fa8ff" : "#1a3a6a");
    g.fillStyle = gl; g.beginPath(); g.moveTo(lx - 34, 162); g.quadraticCurveTo(lx - 34, 138, lx, 138); g.quadraticCurveTo(lx + 34, 138, lx + 34, 162); g.closePath(); g.fill();
    if (on) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85; g.drawImage(BLOB2.cian, lx - 90, 90, 180, 130); g.globalAlpha = 0.3; g.drawImage(BLOB2.cian, lx - 200, 40, 400, 260); g.restore(); }
  }
  g.fillStyle = "#e11e14"; g.beginPath(); g.arc(CX, 150, 9, 0, 6.283); g.fill();
}
function volante(g) {
  g.strokeStyle = "#141416"; g.lineWidth = 8;
  g.beginPath(); g.ellipse(CX - 30, 322, 48, 14, 0, 0, 6.283); g.stroke();
  g.strokeStyle = "#3a3a40"; g.lineWidth = 2.5; g.beginPath(); g.ellipse(CX - 30, 320, 48, 14, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(CX - 30, 322, 13, 6, 0, 0, 6.283); g.fill();
}
/** Cámara de fotos instantánea (unidades de avatar), centrada en (x, y). */
function camara(g, x, y, flash) {
  g.save(); g.translate(x, y);
  const gr = g.createLinearGradient(0, -12, 0, 12);
  gr.addColorStop(0, "#f4f0e6"); gr.addColorStop(1, "#b9b0a0");
  g.fillStyle = gr; rectR(g, -17, -12, 34, 24, 4); g.fill();
  g.fillStyle = "#2a2a30"; g.fillRect(-17, 2, 34, 4);
  g.fillStyle = "#ff3d84"; g.fillRect(-17, 6, 34, 2); g.fillStyle = "#ffd34d"; g.fillRect(-17, 8, 34, 2);
  g.fillStyle = "#1b1b1b"; g.beginPath(); g.arc(0, -1, 8, 0, 6.283); g.fill();
  g.fillStyle = "#3a5a8a"; g.beginPath(); g.arc(0, -1, 5, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.arc(-2, -3, 1.6, 0, 6.283); g.fill();
  g.fillStyle = flash ? "#ffffff" : "#dfe6ea"; rectR(g, 7, -10, 8, 5, 1.5); g.fill();
  g.restore();
}
function globo(g, x, y, r, col, t, f) {
  const dx = 6 * Math.sin(t * 1.7 + f), yy = y + 4 * Math.sin(t * 2.3 + f);
  g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + dx, yy + r); g.quadraticCurveTo(x + dx * 0.5 + 8, yy + r + 50, x, yy + r + 110); g.stroke();
  const gr = g.createRadialGradient(x + dx - r * 0.35, yy - r * 0.4, 2, x + dx, yy, r * 1.1);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.25, col); gr.addColorStop(1, "rgba(0,0,0,.5)");
  g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, yy, r * 0.86, r, 0, 0, 6.283); g.fill();
  g.fillStyle = gr; g.globalAlpha = 0.6; g.fill(); g.globalAlpha = 1;
  g.fillStyle = col; g.beginPath(); g.moveTo(x + dx - 4, yy + r + 5); g.lineTo(x + dx + 4, yy + r + 5); g.lineTo(x + dx, yy + r - 2); g.fill();
}

class PuertasAbiertas extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.p.suelo = () => PIES + 6;
    this.fG = 0;
  }
  luz() { return tramo(this.t, 0.02, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  dentro() { return this.t > T_DENTRO; }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [-4, 118], brazoIDelante: true };
    let mG, xg = XG0, yg = PIES, sG = ESC;
    // ---- Guillermo fuera: recibe el casco, va al camión y salta
    if (!this.dentro()) {
      G.cara = t < T_CASCO ? "sorpresa" : "risa"; G.rc = 0.1;
      if (t < T_CASCO) { G.manoD = [80, 100]; G.manoI = [-2, 100]; G.brazoIDelante = true; G.rc = 0.14; }
      G.casco = t > T_CASCO;
      if (t > T_CASCO && t < T_CASCO + 0.25) yg -= 10 * Math.sin(tramo(t, T_CASCO, T_CASCO + 0.25) * Math.PI);
      if (t > T_CASCO + 0.2 && t < T_VA) { G.manoD = [86, 36]; G.cara = "guino"; G.rc = 0.08; }
      if (t > T_VA) {
        const u = tramo(t, T_VA, T_SALTA);
        xg = lerp(XG0, 560, eInOut(u));
        const a = andar(this.fG, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote * ESC;
        G.cara = "risa"; G.rc = -0.1;
      }
      if (t > T_SALTA) {
        const u = tramo(t, T_SALTA, T_DENTRO);
        xg = lerp(560, 470, u); yg = PIES - Math.sin(u * Math.PI) * 70 + u * 40; sG = lerp(ESC, 1.15, u);
        G.manoD = [96, 40]; G.manoI = [-20, 40]; G.piernaI = [-14, 0.3]; G.piernaD = [-14, -0.3]; G.cara = "risa";
      }
      mG = matAv(xg, yg, sG);
    } else {
      // ---- dentro de la cabina
      const sube = 1 - eOut(tramo(t, T_DENTRO, T_DENTRO + 0.25));
      sG = 1.08;
      mG = matAv(CX + 6, 470 + 80 * sube, sG);
      G.casco = true; G.cara = "risa";
      const vI = enAv(mG, [CX - 74, 322]), vD = enAv(mG, [CX + 14, 322]), centro = enAv(mG, [CX - 30, 322]);
      G.manoI = vI; G.manoD = vD; G.brazoIDelante = true;
      // mira a todas partes, encantado
      if (t < T_MOC - 0.3) { G.rc = 0.14 * Math.sin((t - T_DENTRO) * 5); G.cara = t < 3.2 ? "risa" : "sorpresa"; }
      // bocinazos
      const pulsa = (t0) => Math.max(0, 1 - Math.abs(t - t0) / 0.18);
      const k = Math.max(pulsa(T_MOC), pulsa(T_MOC2[0]), pulsa(T_MOC2[1]));
      if (t > T_MOC - 0.3 && t < T_MOC2[1] + 0.3) {
        G.manoD = mezcla(vD, [centro[0] + 4, centro[1] - 4], Math.min(1, k * 1.6)); G.cara = k > 0.3 ? "guino" : "risa"; G.rc = -0.06;
      }
      if (t > T_MOC2[1] + 0.3 && t < T_PATATA - 0.3) { G.cara = "risa"; G.rc = 0.1 * Math.sin(t * 6); }
      // posa
      if (t > T_PATATA - 0.3) {
        const kp = eOut(tramo(t, T_PATATA - 0.3, T_PATATA));
        G.manoD = mezcla(vD, [94, 52], kp); G.cara = t < T_PATATA + 0.3 ? "risa" : "guino"; G.rc = 0.12 * kp;
        if (t > T_FLASH && t < T_FLASH + 0.35) { G.cara = "dormido"; }
        if (t > T_FLASH + 0.35) { G.cara = "risa"; G.manoD = [94, 52 + 6 * Math.sin(t * 12)]; }
      }
    }
    // ---- Marcos: casco de regalo, la bocina le salta el casco, la cámara
    let ym = PIES;
    this.cascoM = null;
    if (t < T_TIRA + 0.35) {
      const kA = eInOut(tramo(t, 0.3, T_TIRA)), kB = eOut(tramo(t, T_TIRA, T_TIRA + 0.15));
      M.manoI = mezcla(mezcla([-4, 118], [-14, 132], kA), [-24, 60], kB); M.cara = "guino"; M.rc = -0.1;
    } else if (t < T_MOC) { M.manoI = [6, 152]; M.brazoIDelante = false; M.cara = t < 3.0 ? "risa" : "sonrisa"; M.rc = -0.08; if (t > 2.2 && t < 3.3) { M.manoD = [92, 70 + 6 * Math.sin(t * 14)]; M.cara = "risa"; } }
    if (t > T_MOC && t < T_CAM) {
      const u = tramo(t, T_MOC, T_MOC + 0.55);
      M.casco = false; M.cara = "sorpresa"; M.rc = -0.05;
      M.manoD = [74, 64]; M.manoI = [0, 64]; M.brazoIDelante = true;
      this.cascoM = [37.3, 17.9 - 52 * Math.sin(u * Math.PI)];
      ym -= 14 * Math.sin(tramo(t, T_MOC, T_MOC + 0.3) * Math.PI);
      if (u >= 1) { M.casco = true; this.cascoM = null; M.cara = "risa"; }
      // se tapa los oídos con los otros bocinazos
      if (t > T_MOC2[0] - 0.1 && t < T_MOC2[1] + 0.3) { M.manoD = [64, 46]; M.manoI = [10, 46]; M.cara = "dormido"; }
      if (t > T_MOC2[1] + 0.3) { M.cara = "risa"; M.manoD = [67, 152]; M.manoI = [6, 152]; M.brazoIDelante = false; }
    }
    // la cámara
    this.camaraM = t > T_CAM - 0.4;
    if (t > T_CAM - 0.4) {
      const k = eInOut(tramo(t, T_CAM - 0.4, T_CAM));
      M.manoD = mezcla([67, 152], [52, 104], k); M.manoI = mezcla([6, 152], [22, 104], k); M.brazoIDelante = true;
      M.cara = t < T_FLASH - 0.6 ? "guino" : "sonrisa"; M.rc = -0.12;
      if (t > T_FLASH + 0.1) { M.cara = "risa"; M.rc = -0.06; }
      if (t > T_FOTO + 0.6) { M.cara = "guino"; }
    }
    const mM = matAv(XM, ym, ESC);
    const cm = this.cascoM, flash = t > T_FLASH && t < T_FLASH + 0.12;
    if (cm) M.objD = (g) => cascoEn(g, cm[0], cm[1], 0.2 * Math.sin(t * 20), 0.65);
    if (this.camaraM) M.objD2 = (g) => camara(g, 37, 100, flash);
    return { G, M, mG, mM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > T_VA && t < T_SALTA) this.fG += dt * 11;
    this.una("casco", t > T_CASCO, () => { temblar(5, 0.15); for (let i = 0; i < 8; i++) { const a = azar(-Math.PI, 0), v = azar(100, 220); p.nueva(P.CHISPA, XG0, PIES - 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); } });
    this.una("dentro", t > T_DENTRO, () => { temblar(8, 0.2); for (let i = 0; i < 8; i++) p.nueva(P.POLVO, CX + azar(-150, 150), PIES, azar(-60, 60), azar(-30, -5), azar(0.4, 0.8), azar(20, 34)); });
    for (const [k, x] of [["m1", T_MOC], ["m2", T_MOC2[0]], ["m3", T_MOC2[1]]]) this.una(k, t > x, () => {
      temblar(k === "m1" ? 16 : 8, 0.35);
      for (let i = 0; i < 5; i++) p.nueva(P.CONFETI, azar(80, 950), azar(-20, 10), azar(-30, 30), azar(40, 120), azar(2.5, 3.5), azar(9, 13), (Math.random() * 5) | 0);
    });
    this.una("flash", t > T_FLASH, () => {
      temblar(6, 0.2);
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, 0), azar(-40, 40), azar(30, 150), azar(2.5, 3.6), azar(9, 14), (Math.random() * 5) | 0);
    });
    this.una("foto", t > T_FOTO + 0.75, () => {
      temblar(10, 0.3);
      for (let i = 0; i < 20; i++) { const a = azar(0, 6.283), v = azar(160, 380); p.nueva(P.CHISPA, 650, 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.7), azar(6, 10)); }
    });
    p.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // cielo
    const gc = g.createLinearGradient(0, -60, 0, 200);
    gc.addColorStop(0, "#4a9ae6"); gc.addColorStop(1, "#bfe2fa");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 260);
    // fachada de ladrillo
    g.fillStyle = "#b4513a"; g.fillRect(-60, 20, W + 120, 520);
    g.fillStyle = "rgba(90,30,20,.35)";
    for (let y = 20; y < 540; y += 18) for (let x = (y / 18) % 2 ? -60 : -40; x < W + 60; x += 40) { g.fillRect(x, y, 38, 2); g.fillRect(x, y, 2, 18); }
    g.fillStyle = "#e8dcc4"; g.fillRect(-60, 10, W + 120, 18);
    g.fillStyle = "#e8dcc4"; g.fillRect(-60, 520, W + 120, 14);
    // portón abierto
    g.fillStyle = "#e8dcc4"; g.fillRect(118, 104, 524, 440);
    const gp = g.createLinearGradient(0, 120, 0, 540);
    gp.addColorStop(0, "#1a1c22"); gp.addColorStop(1, "#2e3038");
    g.fillStyle = gp; g.fillRect(132, 118, 496, 426);
    // persiana recogida arriba
    const gs = g.createLinearGradient(0, 118, 0, 150);
    gs.addColorStop(0, "#9aa3ab"); gs.addColorStop(1, "#5d656e");
    g.fillStyle = gs; g.fillRect(132, 118, 496, 30);
    g.fillStyle = "rgba(0,0,0,.25)"; for (let y = 124; y < 148; y += 6) g.fillRect(132, y, 496, 1.5);
    // dentro: mangueras enrolladas y cascos colgados
    for (const [x, y] of [[180, 260], [570, 260]]) {
      g.strokeStyle = "#c9b48a"; g.lineWidth = 7; for (let r = 14; r < 46; r += 8) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); }
    }
    for (const x of [230, 520]) { g.save(); g.translate(x, 190); g.scale(0.55, 0.55); g.translate(-44, -18); cascoBombero(g, 88, x < 300 ? "#f2c21b" : undefined); g.restore(); }
    // ventanas a la derecha
    for (const [x, y] of [[700, 160], [860, 160]]) {
      g.fillStyle = "#e8dcc4"; g.fillRect(x - 6, y - 6, 112, 132);
      g.fillStyle = "#2a3a4a"; g.fillRect(x, y, 100, 120);
      g.fillStyle = "rgba(160,210,255,.35)"; g.fillRect(x + 4, y + 4, 44, 112); g.fillRect(x + 52, y + 4, 44, 112);
    }
    // suelo
    const gf = g.createLinearGradient(0, 534, 0, H + 60);
    gf.addColorStop(0, "#9a968e"); gf.addColorStop(1, "#5a5650");
    g.fillStyle = gf; g.fillRect(-60, 534, W + 120, H + 60 - 534);
    g.fillStyle = "#f2c21b"; g.fillRect(-60, 548, W + 120, 5);
    // pancarta
    g.save(); g.translate(512, 64);
    g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(-372, -32, 752, 74);
    g.fillStyle = "#fffdf5"; g.beginPath(); g.moveTo(-380, -40); g.lineTo(380, -40); g.lineTo(372, 32); g.lineTo(-372, 32); g.closePath(); g.fill();
    g.strokeStyle = "#e11e14"; g.lineWidth = 5; g.stroke();
    txt(g, "¡PUERTAS ABIERTAS!", 0, 22, { tam: 62, peso: 900, fam: FD, color: "#e11e14", esp: 4, max: 700 });
    g.fillStyle = "#3a2a2a"; for (const x of [-380, 380]) { g.beginPath(); g.arc(x, -40, 6, 0, 6.283); g.fill(); }
    g.restore();
    CT.set("fondo", c);
    return c;
  }
  /** La foto: el camión con Guillermo dentro, pintada una vez. */
  foto() {
    if (CT.has("foto")) return CT.get("foto");
    if (!listo("torso")) return null;
    const S = 360, c = lienzoNuevo(S, S), g = c.getContext("2d");
    g.save(); g.translate(-(CX - S / 2), -150);
    g.drawImage(this.fondo(), -60, -60);
    camionFondo(g);
    g.save(); rutaParabrisas(g); g.clip();
    const m = matAv(CX + 6, 470, 1.08);
    const pose = { cara: "guino", rc: 0.12, casco: true, manoD: [94, 52], brazoIDelante: true, piernaI: [0, 0], piernaD: [0, 0] };
    pose.manoI = enAv(m, [CX - 74, 322]);
    pintarAvatar(g, m, pose, 0);
    volante(g);
    g.restore();
    camionFrente(g, 0, true);
    g.restore();
    const v = g.createRadialGradient(S / 2, S * 0.4, S * 0.2, S / 2, S / 2, S * 0.75);
    v.addColorStop(0, "rgba(255,255,255,.12)"); v.addColorStop(1, "rgba(0,0,0,.4)");
    g.fillStyle = v; g.fillRect(0, 0, S, S);
    CT.set("foto", c);
    return c;
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe08a"); gr.addColorStop(1, "#ffb020");
    txt(g, "¡PUERTAS ABIERTAS!", 506, 134, { tam: 112, peso: 400, fam: FC, color: "#3a0a00", esp: 3, max: 940 });
    txt(g, "¡PUERTAS ABIERTAS!", 500, 128, { tam: 112, peso: 400, fam: FC, color: gr, borde: "#3a0a00", bordeAncho: 12, esp: 3, glow: "rgba(255,180,40,.8)", glowTam: 22, max: 940 });
    CT.set("tit", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // globos
    const cols = ["#e11e14", "#ffd34d", "#fffdf5", "#2fe3e8", "#ff3d84"];
    [[104, 150, 0], [86, 210, 1], [128, 230, 2], [660, 150, 3], [680, 214, 4], [640, 230, 0]].forEach(([x, y, i], k) => {
      let yy = y; const s = t > T_MOC && t < T_MOC + 0.6 ? 10 * Math.sin((t - T_MOC) * 30) * (1 - tramo(t, T_MOC, T_MOC + 0.6)) : 0;
      globo(g, x + s * (k % 2 ? 1 : -1), yy, 26, cols[i], t, k);
    });
    camionFondo(g);
    const dentro = this.dentro();
    if (dentro) {
      g.save(); rutaParabrisas(g); g.clip();
      pintarAvatar(g, e.mG, e.G, t);
      volante(g);
      g.restore();
    } else if (t > T_SALTA + 0.1) {
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, 520); g.clip();
      pintarAvatar(g, e.mG, e.G, t);      // salta por detrás del camión
      g.restore();
    }
    const luces = t > T_MOC && t < T_CAM + 0.2;
    camionFrente(g, t, luces);
    if (!dentro && t <= T_SALTA + 0.1) pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // el casco que vuela de Marcos a Guillermo
    if (t > T_TIRA && t < T_CASCO) {
      const u = tramo(t, T_TIRA, T_CASCO);
      const p0 = aPant(e.mM, [-24, 60]), p1 = aPant(matAv(XG0, PIES, ESC), [39, 17]);
      const x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u) - Math.sin(u * Math.PI) * 120;
      cascoEn(g, x, y, -u * 6.283, 0.65 * ESC * 1.03);
    }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    ono("¡TOC!", XG0 + 90, 190, T_CASCO, 0.5, 46, "#fffdf5", "#1b1b1b", 0.12);
    ono("¡HOP!", CX + 150, 140, T_DENTRO - 0.05, 0.55, 50, "#ffd34d", "#3a2400", -0.1);
    ono("¡MOOOC!", CX + 30, 150, T_MOC, 0.7, 72, "#2fe3e8", "#06303a", -0.06);
    ono("¡MOC!", CX + 210, 300, T_MOC2[0], 0.25, 46, "#2fe3e8", "#06303a", 0.1);
    ono("¡MOC!", CX + 230, 250, T_MOC2[1], 0.3, 54, "#2fe3e8", "#06303a", -0.1);
    if (t > T_CAM && t < T_PATATA - 0.1) bocadillo(g, 860, 150, "¡POSA!", 850, 236, tramo(t, T_CAM, T_CAM + 0.15) * (1 - tramo(t, T_PATATA - 0.25, T_PATATA - 0.1)), 40);
    if (t > T_PATATA && t < T_FLASH + 0.1) bocadillo(g, 600, 150, "¡PATATAAA!", 470, 230, tramo(t, T_PATATA, T_PATATA + 0.15) * (1 - tramo(t, T_FLASH - 0.05, T_FLASH + 0.1)), 40);
    ono("¡CLIC!", 930, 330, T_FLASH, 0.5, 42, "#fffdf5", "#1b1b1b", 0.1);
    // la foto sale de la cámara y vuela al centro
    if (t > T_FOTO) {
      const u = eOut(tramo(t, T_FOTO, T_FOTO + 0.75));
      const p0 = aPant(e.mM, [37, 112]);
      const x = lerp(p0[0], 640, u), y = lerp(p0[1], 336, u) - Math.sin(u * Math.PI) * 60;
      const w = lerp(40, 250, u), rot = lerp(0.4, -0.07, u) + 0.02 * Math.sin(t * 2);
      const revela = tramo(t, T_FOTO + 0.4, T_FOTO + 1.3);
      g.save(); g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 16; g.shadowOffsetY = 6;
      polaroid(g, this.foto(), x, y, w, rot, (g2, px, py, pw, ph) => {
        txt(g2, "¡QUÉ BOMBERO!", px + pw / 2, py + ph * 0.66, { tam: Math.max(6, pw * 0.085), peso: 400, fam: FC, color: "#e11e14", esp: 1 });
      });
      g.restore();
      // la foto se revela (blanco que se va)
      if (revela < 1) {
        g.save(); g.translate(x, y); g.rotate(rot);
        const m = w * 0.06, fw = w - 2 * m, h = m + fw + w * 0.2;
        g.fillStyle = `rgba(250,248,240,${1 - revela})`; g.fillRect(-w / 2 + m, -h / 2 + m, fw, fw);
        g.restore();
      }
    }
    // ¡PUERTAS ABIERTAS!
    if (t > T_FOTO + 0.75) {
      const d = t - T_FOTO - 0.75, k = tramo(d, 0, 0.16), s = lerp(2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 76); g.rotate(-0.03); g.scale(s * 0.9, s * 0.9);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // flash
    if (t > T_FLASH && t < T_FLASH + 0.35) {
      g.fillStyle = `rgba(255,255,255,${0.9 * (1 - tramo(t, T_FLASH, T_FLASH + 0.35))})`; g.fillRect(-60, -60, W + 120, H + 120);
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00248", nombre: "Puertas abiertas", crear: () => new PuertasAbiertas() });
})();
