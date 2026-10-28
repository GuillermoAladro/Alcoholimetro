"use strict";
/*
 * 00039 · VIAJE EN EL TIEMPO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Delante de una esfera de reloj gigante, gira la corona de su reloj de bolsillo: las agujas corren hacia atrás cada
 * vez más rápido, el contador de años baja (2026… 1492… 10.000 a. C.), se abre un remolino y hay destellos.
 * Fogonazo blanco y aparece en una cueva prehistórica con hoguera y pinturas rupestres; el reloj se le ha convertido
 * en una jarra de piedra: AÑO 10.000 a. C. Fuera pasa un dinosaurio (silueta) que asoma el cuello: brindan. El
 * dinosaurio ruge de alegría (¡GROAAR!), apaga la hoguera de un soplido y todo queda a oscuras.
 */
(() => {
const CX = 650, CY = 252, R = 168;          // la esfera del reloj
const X1 = 330, X2 = 520;                   // él en el reloj y en la cueva
const T_FLASH = 3.05, T_CUEVA = 3.3, T_RUGE = 7.55;
const BOCA = [[700, 520], [662, 430], [684, 318], [728, 214], [800, 150], [905, 140], [975, 205], [1008, 312], [1004, 440], [985, 520]];
const FUEGO = [215, 548];
const ROMANOS = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const cache = cacheTexto();

function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(920, 170), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 30, 0, 130);
  gr.addColorStop(0, "#fff4dc"); gr.addColorStop(0.5, "#d9c2a0"); gr.addColorStop(1, "#8c7356");
  txt(g, "AÑO 10.000 a. C.", 460, 118, { tam: 104, peso: 900, fam: FD, color: gr, borde: "#2a1a0c", bordeAncho: 11, esp: 4, glow: "rgba(255,140,40,.7)", glowTam: 24, max: 880 });
  cache.set("t", c);
  return c;
}
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
function anio(t) {
  const u = tramo(t, 1.0, 3.0), v = 12026 * (Math.exp(6 * u) - 1) / (Math.exp(6) - 1), y = Math.round(2026 - v);
  return y > 0 ? "AÑO " + y : "AÑO " + miles(-y) + " a. C.";
}
/** Reloj de bolsillo; (x, y) = la mano. Unidades de avatar. */
function relojBolsillo(g, x, y, ang) {
  g.save(); g.translate(x + 1, y - 9);
  g.strokeStyle = "#d9a100"; g.lineWidth = 1.2; g.setLineDash([1.6, 1.2]);
  g.beginPath(); g.moveTo(0, 9); g.quadraticCurveTo(-8, 34, -22, 30); g.stroke(); g.setLineDash([]);
  const gr = g.createLinearGradient(-9, -9, 9, 9);
  gr.addColorStop(0, "#fff2a8"); gr.addColorStop(0.5, "#e0a400"); gr.addColorStop(1, "#7a4d00");
  g.fillStyle = gr; g.fillRect(-2, -13, 4, 4); g.beginPath(); g.arc(0, 0, 9.5, 0, 6.283); g.fill();
  g.fillStyle = "#fffdf0"; g.beginPath(); g.arc(0, 0, 7.3, 0, 6.283); g.fill();
  g.strokeStyle = "#222"; g.lineWidth = 1.1; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(ang) * 6, -Math.cos(ang) * 6); g.moveTo(0, 0); g.lineTo(Math.sin(ang / 12) * 4, -Math.cos(ang / 12) * 4); g.stroke();
  g.restore();
}
/** Jarra de piedra; asa en la mano (0, 0) y el cuerpo a la derecha, como JARRA. */
function jarraPiedra(g, mano, inc, parte) {
  g.save(); g.translate(mano[0], mano[1]); g.rotate(inc);
  if (parte === "asa") {
    g.strokeStyle = "#6f675b"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(5, -10); g.bezierCurveTo(-7, -12, -7, 12, 5, 10); g.stroke();
    g.restore(); return;
  }
  const gr = g.createLinearGradient(3, 0, 31, 0);
  gr.addColorStop(0, "#4f4a42"); gr.addColorStop(0.35, "#a39b8c"); gr.addColorStop(0.6, "#8a8274"); gr.addColorStop(1, "#46413a");
  g.fillStyle = gr; g.beginPath(); g.moveTo(3, -15); g.lineTo(31, -16); g.lineTo(30, 17); g.quadraticCurveTo(17, 20, 4, 17); g.closePath(); g.fill();
  g.fillStyle = "rgba(40,35,30,.55)";
  for (const [a, b, r] of [[10, -6, 2], [22, 4, 2.6], [14, 10, 1.6], [25, -9, 1.4]]) { g.beginPath(); g.arc(a, b, r, 0, 6.283); g.fill(); }
  g.strokeStyle = "rgba(30,25,20,.6)"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(8, -15); g.lineTo(12, -4); g.lineTo(9, 5); g.stroke();
  g.fillStyle = "#fffaf0"; g.beginPath(); g.moveTo(2, -14);
  for (let i = 0; i <= 4; i++) g.arc(3 + i * 7, -16, 3.8 + (i % 2) * 1.1, Math.PI, 0);
  g.lineTo(32, -13); g.closePath(); g.fill();
  g.restore();
}
let _cueva = null;
function cueva() {
  if (_cueva) return _cueva;
  const c = lienzoNuevo(W, H), g = c.getContext("2d"), r = semilla(39);
  // roca con la boca de la cueva recortada
  g.beginPath(); g.rect(0, 0, W, H);
  BOCA.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
  const gr = g.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, "#2b1a10"); gr.addColorStop(0.5, "#45301e"); gr.addColorStop(1, "#2a1a0f");
  g.fillStyle = gr; g.fill("evenodd");
  g.save(); g.clip("evenodd");
  for (let i = 0; i < 70; i++) { g.fillStyle = r() < 0.5 ? "rgba(0,0,0,.13)" : "rgba(120,90,60,.08)"; g.beginPath(); g.ellipse(r() * W, r() * H, 20 + r() * 70, 10 + r() * 30, r() * 3, 0, 6.283); g.fill(); }
  // estalactitas
  g.fillStyle = "#24160c";
  for (let x = 20; x < 640; x += 46 + r() * 40) { const l = 30 + r() * 60; g.beginPath(); g.moveTo(x - 14, 0); g.lineTo(x + 14, 0); g.lineTo(x + 2, l); g.closePath(); g.fill(); }
  // suelo
  const gs = g.createLinearGradient(0, 500, 0, H);
  gs.addColorStop(0, "#5a3f28"); gs.addColorStop(1, "#2a1b10");
  g.fillStyle = gs; g.beginPath(); g.moveTo(0, 520); g.quadraticCurveTo(300, 495, 700, 512); g.lineTo(1024, 520); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  for (let i = 0; i < 18; i++) { g.fillStyle = "rgba(30,20,12,.7)"; g.beginPath(); g.ellipse(r() * W, 530 + r() * 60, 6 + r() * 14, 3 + r() * 5, 0, 0, 6.283); g.fill(); }
  // pinturas rupestres: un monigote brindando con una jarra y un bicho
  g.strokeStyle = "rgba(190,70,35,.75)"; g.fillStyle = "rgba(190,70,35,.75)"; g.lineWidth = 4; g.lineCap = "round";
  const mono = (x, y) => { g.beginPath(); g.arc(x, y - 44, 8, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(x, y - 36); g.lineTo(x, y - 12); g.lineTo(x - 10, y); g.moveTo(x, y - 12); g.lineTo(x + 10, y); g.moveTo(x, y - 28); g.lineTo(x + 14, y - 40); g.moveTo(x, y - 28); g.lineTo(x - 13, y - 22); g.stroke(); };
  mono(130, 300); mono(215, 300);
  g.strokeRect(141, 238, 11, 13); g.strokeRect(225, 238, 11, 13);
  g.beginPath(); g.ellipse(330, 270, 34, 14, 0, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(352, 264); g.quadraticCurveTo(372, 230, 386, 214); g.stroke(); g.beginPath(); g.arc(388, 211, 6, 0, 6.283); g.fill();
  g.beginPath(); for (const dx of [-20, -6, 8, 20]) { g.moveTo(330 + dx, 280); g.lineTo(330 + dx, 298); } g.moveTo(298, 268); g.lineTo(270, 280); g.stroke();
  g.restore();
  // borde iluminado de la boca
  g.strokeStyle = "rgba(255,150,80,.35)"; g.lineWidth = 4; g.beginPath(); BOCA.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
  return (_cueva = c);
}

class EscenaTiempo extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(420);
    this.angulo = 0; this.vel = 0;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [70, 158], manoI = [9, 160], X = X1, ESC = 1.5, dx = 0;
    if (t < T_CUEVA) {
      // saca el reloj y gira la corona
      manoD = mezcla(manoD, [56, 118], eInOut(tramo(t, 0.35, 0.65)));
      if (t > 0.6) manoI = mezcla(manoI, [52 + 2 * Math.sin(t * 30) * tramo(t, 1.0, 1.1) * (1 - tramo(t, 1.55, 1.6)), 104], eInOut(tramo(t, 0.6, 0.9)));
      if (t > 1.65) manoI = mezcla([52, 104], [-14, 104], eInOut(tramo(t, 1.65, 1.95)));
      pose.cara = t > 0.35 && t < 1.6 ? "guino" : t >= 1.6 ? "sorpresa" : "sonrisa";
      const viento = tramo(t, 1.8, 3.0);
      pose.puntas = 0.8 * viento; dx = Math.sin(t * 47) * 2.5 * viento;
      pose.rc = 0.04 * Math.sin(t * 31) * viento;
      const a = this.angulo;
      pose.objD2 = (g, m) => relojBolsillo(g, m[0], m[1], a);
    } else {
      X = X2; ESC = 1.45;
      pose.cara = t < 4.2 ? "sorpresa" : t < 5.0 ? "guino" : t < 5.3 ? "risa" : t < 6.1 ? "sorpresa" : "risa";
      if (t < 4.2) pose.rc = 0.12 * Math.sin((t - T_CUEVA) * 7) * (1 - tramo(t, 3.9, 4.2));
      // mira la jarra de piedra
      const kM = eInOut(tramo(t, 4.2, 4.5)) * (1 - eInOut(tramo(t, 4.9, 5.2)));
      manoD = mezcla([66, 140], [62, 104], kM);
      // brinda con el dinosaurio
      const kB = eBack(tramo(t, 6.15, 6.5));
      manoD = mezcla(manoD, [96, 50], kB);
      let inc = -0.25 * kB;
      if (t > 6.6 && t < 7.4) inc += 0.12 * Math.sin((t - 6.6) * 14);
      manoI = mezcla([9, 160], [-12, 120], eInOut(tramo(t, 6.15, 6.4)));
      if (t >= T_RUGE) {
        pose.cara = "sorpresa"; pose.puntas = Math.min(1, (t - T_RUGE) * 4) * (1 - tramo(t, 8.3, 8.8));
        dx = -6 * eOut(tramo(t, T_RUGE, T_RUGE + 0.3)) + Math.sin(t * 50) * 2 * (1 - tramo(t, 8.0, 8.4));
      }
      pose.objD = (g, m, a, tt) => jarraPiedra(g, m, inc, "asa");
      pose.objD2 = (g, m, a, tt) => jarraPiedra(g, m, inc, "cuerpo");
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(X + dx, PIES, ESC);
    return { pose, m };
  }
  /** Cuello del dinosaurio: 0 recto, 1 asomado a la cueva; cabeceo del brindis y rugido. */
  dino(t) {
    const asoma = eInOut(tramo(t, 5.0, 5.9)) * (1 - eInOut(tramo(t, 8.4, 9.2)));
    const asiente = t > 6.4 && t < 7.4 ? Math.sin((t - 6.4) * 10) * 0.5 + 0.5 : 0;
    const ruge = t > T_RUGE - 0.15 && t < 8.35 ? Math.min(1, (t - T_RUGE + 0.15) * 6) * (1 - tramo(t, 8.1, 8.35)) : 0;
    return { asoma, asiente, ruge, x: 880 - 30 * Math.min(1, Math.max(0, t - T_CUEVA) / 2) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // las agujas corren hacia atrás cada vez más rápido
    this.vel = t < 1.1 ? 0 : t < T_CUEVA ? -(0.8 + 70 * Math.pow(tramo(t, 1.1, 3.0), 2)) : 0;
    this.angulo += this.vel * dt;
    this.una("clic", t > 1.1, () => temblar(4, 0.12));
    if (t > 1.6 && t < T_FLASH) {
      const n = Math.round(160 * dt * tramo(t, 1.6, 2.6) + Math.random());
      for (let i = 0; i < n; i++) { const a = azar(0, 6.283), d = azar(380, 560); p.nueva(P.PURPURINA, CX + Math.cos(a) * d, CY + Math.sin(a) * d * 0.8, -Math.cos(a) * 420, -Math.sin(a) * 340, azar(0.6, 1.0), azar(6, 12)); }
      temblar(2 + 8 * tramo(t, 1.6, 3.0), 0.1);
    }
    [2.3, 2.62, 2.85].forEach((tf, i) => this.una("f" + i, t > tf, () => { this.flash = 0.75; }));
    this.una("blanco", t > T_FLASH, () => { temblar(24, 0.5); });
    this.una("llega", t > T_CUEVA + 0.05, () => {
      p.alfa = 1;
      for (let i = 0; i < 26; i++) p.nueva(P.POLVO, X2 + azar(-40, 40), PIES - azar(0, 12), azar(-420, 420), azar(-80, -5), azar(0.6, 1.1), azar(30, 55));
    });
    this.una("titulo", t > 3.95, () => temblar(14, 0.35));
    this.flash = Math.max(0, (this.flash || 0) - dt * 4);
    // hoguera
    const fuego = t > T_CUEVA ? 1 - tramo(t, T_RUGE + 0.25, T_RUGE + 0.6) : 0;
    if (fuego > 0) {
      const sopla = t > T_RUGE ? -500 * tramo(t, T_RUGE, T_RUGE + 0.3) : 0;
      for (let i = 0; i < Math.round(55 * dt * fuego + Math.random() * 0.6); i++) p.nueva(P.LLAMA, FUEGO[0] + azar(-24, 24), FUEGO[1] - 6, azar(-20, 20) + sopla, azar(-160, -60), azar(0.35, 0.7), azar(34, 60), Math.random() < 0.3 ? 1 : 0);
      if (Math.random() < 6 * dt) p.nueva(P.CHISPA, FUEGO[0] + azar(-10, 10), FUEGO[1] - 30, azar(-40, 40), azar(-260, -140), azar(0.5, 0.9), azar(4, 7));
    }
    this.una("apaga", t > T_RUGE + 0.4, () => { for (let i = 0; i < 16; i++) p.nueva(P.HUMO, FUEGO[0] + azar(-20, 20), FUEGO[1] - 20, azar(-160, -40), azar(-90, -30), azar(1.0, 1.6), azar(30, 50)); });
    this.una("ruge", t > T_RUGE, () => temblar(22, 0.7));
    this.una("brinda", t > 6.42, () => { const e = this.estado(), q = aPant(e.m, [112, 34]); for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-140, 140), azar(-260, -80), azar(0.4, 0.8), azar(4, 8)); });
    p.actualizar(dt);
  }
  dibujarReloj(g, t) {
    const a0 = tramo(t, 0, 0.6), luz = (0.75 + 0.25 * tramo(t, 1.1, 2.4)) * a0;
    g.save(); g.globalAlpha = a0;
    // remolino
    const kR = tramo(t, 1.7, 3.0);
    if (kR > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      for (let i = 0; i < 12; i++) {
        const r = (90 + i * 62) * (0.6 + 0.4 * kR), giro = t * (i % 2 ? -1 : 1) * (2.5 + i * 0.35) * (0.5 + 2 * kR);
        g.strokeStyle = i % 3 === 0 ? `rgba(180,120,255,${0.5 * kR})` : `rgba(255,205,90,${0.45 * kR})`; g.lineWidth = 7 - i * 0.3;
        for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(CX, CY, r, giro + j * 2.09, giro + j * 2.09 + 1.0); g.stroke(); }
      }
      g.restore();
    }
    // esfera
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.45 * luz; g.drawImage(BLOB2.oro, CX - R * 1.6, CY - R * 1.6, R * 3.2, R * 3.2); g.restore();
    const gf = g.createRadialGradient(CX, CY, 10, CX, CY, R);
    gf.addColorStop(0, "#2a2050"); gf.addColorStop(1, "#0b0918");
    g.fillStyle = gf; g.beginPath(); g.arc(CX, CY, R, 0, 6.283); g.fill();
    const gr = g.createLinearGradient(CX - R, CY - R, CX + R, CY + R);
    gr.addColorStop(0, "#fff2a8"); gr.addColorStop(0.4, "#e0a400"); gr.addColorStop(0.7, "#ffd34d"); gr.addColorStop(1, "#7a4d00");
    g.strokeStyle = gr; g.lineWidth = 16; g.beginPath(); g.arc(CX, CY, R, 0, 6.283); g.stroke();
    g.strokeStyle = "rgba(255,211,77,.55)"; g.lineWidth = 2;
    for (let i = 0; i < 60; i++) { const a = (i / 60) * 6.283, l = i % 5 ? 8 : 16; g.beginPath(); g.moveTo(CX + Math.sin(a) * (R - 12), CY - Math.cos(a) * (R - 12)); g.lineTo(CX + Math.sin(a) * (R - 12 - l), CY - Math.cos(a) * (R - 12 - l)); g.stroke(); }
    ROMANOS.forEach((s, i) => { const a = (i / 12) * 6.283; txt(g, s, CX + Math.sin(a) * (R - 46), CY - Math.cos(a) * (R - 46) + 10, { tam: 28, peso: 900, fam: FD, color: "#ffd34d" }); });
    // agujas (con estela cuando van muy rápido)
    const ang = this.angulo, rapido = Math.min(1, Math.abs(this.vel) / 30);
    const aguja = (a, largo, ancho, col) => { g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = "round"; g.beginPath(); g.moveTo(CX - Math.sin(a) * 16, CY + Math.cos(a) * 16); g.lineTo(CX + Math.sin(a) * largo, CY - Math.cos(a) * largo); g.stroke(); };
    if (rapido > 0.1) { g.save(); g.globalAlpha = 0.2 * rapido; for (let k = 1; k <= 4; k++) aguja(ang + k * 0.35, R - 34, 6, "#fff2a8"); g.restore(); }
    aguja(ang / 12, R * 0.5, 10, "#ffd34d"); aguja(ang, R - 34, 6, "#fff2a8");
    g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(CX, CY, 11, 0, 6.283); g.fill();
    // contador de años
    if (t > 1.0) {
      const s = anio(t);
      txt(g, s, CX, CY + R + 64, { tam: 52, peso: 900, fam: FD, color: "#ffffff", borde: "#3a2400", bordeAncho: 8, esp: 3, glow: "rgba(255,190,60,.8)", glowTam: 16 });
    }
    g.restore();
  }
  dibujarDino(g, t) {
    const D = this.dino(t), x = D.x, y = 472, s = 1;
    const paso = t * 2.2;
    g.save(); g.fillStyle = "#1c1226"; g.strokeStyle = "#1c1226"; g.lineCap = "round"; g.lineJoin = "round";
    // cola
    g.beginPath(); g.moveTo(x - 70, y - 92); g.quadraticCurveTo(x - 170, y - 70 + 8 * Math.sin(t * 2), x - 260, y - 40 + 12 * Math.sin(t * 2.4)); g.quadraticCurveTo(x - 160, y - 48, x - 60, y - 52); g.closePath(); g.fill();
    // patas
    for (const [px, f] of [[-48, 0], [-20, Math.PI], [36, Math.PI], [62, 0]]) { const lev = Math.max(0, Math.sin(paso + f)) * 8 * (1 - D.asoma); g.fillRect(x + px - 13, y - 70 - lev, 26, 70); }
    // cuerpo
    g.beginPath(); g.ellipse(x, y - 92, 100, 52, -0.05, 0, 6.283); g.fill();
    // cuello y cabeza
    const base = [x + 70, y - 118];
    const recto = [x + 48, y - 282 + 6 * Math.sin(t * 1.6)], asomado = [x - 82, y - 238 + 22 * D.asiente];
    const H = mezcla(recto, asomado, D.asoma);
    const ctrl = mezcla([x + 118, y - 228], [x + 30, y - 345], D.asoma);
    g.lineWidth = 30; g.beginPath(); g.moveTo(base[0], base[1]); g.quadraticCurveTo(ctrl[0], ctrl[1], H[0], H[1]); g.stroke();
    const dir = D.asoma > 0.5 ? -1 : 1, boca = 0.35 * D.ruge;
    g.save(); g.translate(H[0], H[1]); g.scale(dir, 1);
    g.beginPath(); g.ellipse(14, -2, 28, 16, -0.1 - boca * 0.4, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(18, 8, 22, 9, 0.1 + boca, 0, 6.283); g.fill();
    g.fillStyle = "#ff9a3d"; g.beginPath(); g.arc(22, -8, 2.6, 0, 6.283); g.fill();
    g.restore();
    g.restore();
  }
  dibujarCueva(g, t) {
    const D = this.dino(t);
    // cielo del atardecer por la boca de la cueva
    const gc = g.createLinearGradient(0, 130, 0, 520);
    gc.addColorStop(0, "#2b1650"); gc.addColorStop(0.55, "#a8456a"); gc.addColorStop(0.85, "#ff8a3d"); gc.addColorStop(1, "#ffbe5c");
    g.fillStyle = gc; g.fillRect(640, 120, 384, 420);
    g.fillStyle = "#ffd77a"; g.beginPath(); g.arc(930, 450, 66, 0, 6.283); g.fill();
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB.naranja, 790, 330, 280, 240); g.restore();
    // volcán y colinas
    g.fillStyle = "#3a1d3a"; g.beginPath(); g.moveTo(660, 470); g.lineTo(745, 330); g.lineTo(778, 330); g.lineTo(860, 470); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,120,60,.8)"; g.fillRect(748, 326, 28, 5);
    g.save(); g.globalAlpha = 0.5; g.fillStyle = "#5b3a5a"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(760 + i * 14 + 6 * Math.sin(t + i), 300 - i * 26, 14 + i * 6, 0, 6.283); g.fill(); } g.restore();
    this.dibujarDino(g, t);
    g.fillStyle = "#24122a"; g.beginPath(); g.moveTo(640, 480); g.quadraticCurveTo(780, 440, 900, 470); g.quadraticCurveTo(980, 455, 1024, 470); g.lineTo(1024, 540); g.lineTo(640, 540); g.closePath(); g.fill();
    // la roca
    g.drawImage(cueva(), 0, 0);
    // luz de la hoguera
    const fuego = 1 - tramo(t, T_RUGE + 0.25, T_RUGE + 0.6), fl = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7);
    if (fuego > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.42 * fuego * fl;
      g.drawImage(BLOB.naranja, FUEGO[0] - 420, FUEGO[1] - 380, 840, 560); g.globalAlpha = 0.35 * fuego * fl; g.drawImage(BLOB.amarillo, FUEGO[0] - 150, FUEGO[1] - 160, 300, 220);
      g.restore();
    }
    // troncos y piedras de la hoguera
    g.save(); g.translate(FUEGO[0], FUEGO[1]);
    g.fillStyle = "#4a2c16"; g.save(); g.rotate(0.35); rectR(g, -46, -8, 92, 15, 7); g.fill(); g.restore(); g.save(); g.rotate(-0.35); rectR(g, -46, -8, 92, 15, 7); g.fill(); g.restore();
    g.fillStyle = "#6b6258"; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(-54 + i * 18, 14, 11, 7, 0, 0, 6.283); g.fill(); }
    if (fuego > 0) { g.fillStyle = `rgba(255,120,30,${0.7 * fuego})`; g.beginPath(); g.ellipse(0, 2, 30, 8, 0, 0, 6.283); g.fill(); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    if (t < T_CUEVA) {
      this.dibujarReloj(g, t);
      this.p.dibujar(g);
      pintarAvatar(g, e.m, e.pose, t);
    } else {
      this.dibujarCueva(g, t);
      pintarAvatar(g, e.m, e.pose, t);
      this.p.dibujar(g);
      // ¡GROAAR!
      if (t > T_RUGE && t < T_RUGE + 1.0) {
        const s = t - T_RUGE, k = tramo(s, 0, 0.12);
        g.save(); g.translate(800 + azar(-3, 3), 170 + azar(-3, 3)); g.rotate(-0.1); g.scale(eBack(k), eBack(k));
        txt(g, "¡GROAAAR!", 0, 0, { tam: 76, peso: 400, fam: FC, color: "#ffffff", borde: "#4a1a00", bordeAncho: 10, alfa: 1 - tramo(s, 0.75, 1.0), esp: 3 });
        g.restore();
      }
      // AÑO 10.000 a. C.
      if (t > 3.9 && t < 6.3) {
        const k = tramo(t, 3.9, 4.05), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 4) * (1 - tramo(t, 6.0, 6.3));
        const T = titulo();
        g.save(); g.globalAlpha = a; g.translate(W / 2 - 40, 84); g.scale(s, s); g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
      }
      // sin hoguera se queda a oscuras
      const osc = tramo(t, T_RUGE + 0.4, T_RUGE + 1.2) * 0.75;
      if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
    }
    // destellos y fogonazo blanco
    let blanco = this.flash || 0;
    if (t > T_FLASH - 0.15) blanco = Math.max(blanco, t < T_CUEVA ? tramo(t, T_FLASH - 0.15, T_FLASH) : 1 - tramo(t, T_CUEVA, T_CUEVA + 0.45));
    if (blanco > 0) { g.fillStyle = `rgba(255,252,235,${blanco})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.6, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00039", nombre: "Viaje en el tiempo", crear: () => new EscenaTiempo() });
})();
