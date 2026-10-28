"use strict";
/*
 * 00018 · FUEGOS ARTIFICIALES
 *
 * Animación del banco. Empieza y acaba en negro.
 * A oscuras enciende una cerilla que le ilumina la cara; aparece el cielo estrellado. Prende la mecha de un cohete
 * metido en una botella y se aparta tapándose los oídos. El cohete sube y estalla: las chispas dibujan en el cielo una
 * jarra de cerveza gigante que se llena y echa espuma. ¡OOOOH! La jarra revienta en confeti dorado y lo celebra.
 */
(() => {
const ESC = 1.35;
const BOTELLA = 430, MECHA = [452, PIES - 112];
const PRENDE = 2.05, DESPEGA = 2.95, ESTALLA = 3.65, FORMA = 0.6, REVIENTA = 6.6, OFF = 9.4;
const JC = [610, 230];       // centro de la jarra del cielo
const cache = cacheTexto();
let SPR18 = null;

/** Puntos de la jarra del cielo (relativos a JC) con su color. */
function puntosJarra() {
  const P = [], oro = "255,211,77", blanco = "255,250,235", ambar = "255,170,40";
  const linea = (x0, y0, x1, y1, paso, c) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / paso)); for (let i = 0; i < n; i++) P.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n), c]); };
  // cuerpo
  linea(-110, -120, 90, -120, 15, oro); linea(90, -120, 82, 140, 15, oro); linea(82, 140, -102, 140, 15, oro); linea(-102, 140, -110, -120, 15, oro);
  // asa
  for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI; P.push([90 + Math.cos(a) * 70, 10 + Math.sin(a) * 82, oro]); }
  for (let i = 1; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI; P.push([90 + Math.cos(a) * 36, 10 + Math.sin(a) * 46, oro]); }
  // espuma
  for (let b = 0; b < 5; b++) for (let i = 0; i <= 6; i++) { const a = Math.PI + (i / 6) * Math.PI; P.push([-100 + b * 46 + Math.cos(a) * 26, -122 + Math.sin(a) * 30, blanco]); }
  // estrías del cristal
  for (const x of [-60, -10, 40]) linea(x, -95, x - 2, 120, 22, ambar);
  // burbujas
  const r = semilla(18);
  for (let i = 0; i < 12; i++) P.push([-90 + r() * 160, -80 + r() * 200, blanco]);
  return P;
}
function cielo() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, -60, 0, H);
  gr.addColorStop(0, "#02030c"); gr.addColorStop(0.6, "#0c0d2a"); gr.addColorStop(1, "#2a1638");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
  // ciudad en silueta
  const r = semilla(5);
  g.fillStyle = "#06060f";
  let x = -60;
  while (x < W + 60) { const w = 40 + r() * 70, h = 60 + r() * 130; g.fillRect(x, PIES - h, w, h + 60); x += w + 2; }
  g.fillStyle = "rgba(255,210,120,.5)";
  x = -60;
  const r2 = semilla(9);
  for (let i = 0; i < 70; i++) { const wx = r2() * W, wy = PIES - 10 - r2() * 150; if (r2() < 0.6) g.fillRect(wx, wy, 4, 5); }
  // azotea
  const gs = g.createLinearGradient(0, PIES - 4, 0, H);
  gs.addColorStop(0, "#2a2530"); gs.addColorStop(1, "#0d0b10");
  g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H);
  g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(-60, PIES - 4, W + 120, 2);
  return c;
}
function sprites() {
  if (!SPR18) {
    const r = semilla(3), estrellas = [];
    for (let i = 0; i < 90; i++) estrellas.push([r() * W, r() * 380, 0.5 + r() * 1.6, r() * 6]);
    SPR18 = { cielo: cielo(), estrellas, jarra: puntosJarra() };
  }
  return SPR18;
}
function rotulo(n) {
  const clave = "o" + n;
  if (cache.has(clave)) return cache.get(clave);
  const s = "¡" + "O".repeat(n) + "H!", c = lienzoNuevo(560, 170), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 30, 0, 140);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#ffd34d");
  txt(g, s, 280, 128, { tam: 112, peso: 400, fam: FC, color: gr, borde: "#3a1d6e", bordeAncho: 12, esp: 4, glow: "rgba(255,200,60,.8)", glowTam: 22, max: 520 });
  txt(g, s, 280, 128, { tam: 112, peso: 400, fam: FC, color: gr, esp: 4, max: 520 });
  cache.set(clave, c);
  return c;
}

class EscenaFuegos extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(330);
    this.p.suelo = () => PIES - 3;
    this.cohete = null; this.fuegos = null; this.flash = 0;
  }
  xAv(t) { return t < 1.0 ? 250 : t < 1.6 ? lerp(250, 360, eInOut(tramo(t, 1.0, 1.6))) : t < 2.2 ? 360 : lerp(360, 190, eOut(tramo(t, 2.2, 2.65))); }
  estado() {
    const t = this.t, x = this.xAv(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sy = 1, giro = 0, y = PIES;
    // la cerilla
    const kC = eInOut(tramo(t, 0.15, 0.35));
    manoD = mezcla(manoD, [64, 108], kC * (1 - eInOut(tramo(t, 2.2, 2.45)))); manoI = mezcla(manoI, [30, 120], kC * (1 - tramo(t, 0.45, 0.7)));
    if ((t > 1.0 && t < 1.6) || (t > 2.2 && t < 2.65)) { const a = andar(t * 11, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote; }
    // se agacha a prender la mecha
    const kA = eInOut(tramo(t, 1.55, 1.85)) * (1 - eInOut(tramo(t, 2.15, 2.35)));
    if (kA > 0) {
      sy = 1 - 0.1 * kA; giro = 0.1 * kA;
      const m0 = matAv(x, PIES, ESC, giro, 1, sy), inv = m0.inverse(), q = inv.transformPoint(new DOMPoint(MECHA[0] - 6, MECHA[1] - 4));
      manoD = mezcla(manoD, [q.x, q.y], kA);
      pose.cara = t > 1.95 ? "sorpresa" : "guino";
    }
    // se tapa los oídos
    const kO = eInOut(tramo(t, 2.3, 2.6)) * (1 - eInOut(tramo(t, 4.2, 4.6)));
    if (kO > 0) { manoD = mezcla(manoD, [76, 46], kO); manoI = mezcla(manoI, [2, 46], kO); pose.cara = t < DESPEGA ? "guino" : "sorpresa"; pose.brazoIDelante = true; }
    if (t >= DESPEGA && t < 4.2) pose.rc = -0.08;
    // ¡OOOOH!
    if (t >= 4.2) {
      pose.cara = "sorpresa"; pose.rc = -0.1 + 0.03 * Math.sin(t * 2);
      // señala la jarra del cielo
      const kS = eInOut(tramo(t, 4.5, 4.85)) * (1 - eInOut(tramo(t, REVIENTA - 0.2, REVIENTA)));
      manoD = mezcla(manoD, [108, -4], kS);
    }
    // lo celebra
    const kF = eOut(tramo(t, REVIENTA + 0.05, REVIENTA + 0.35));
    if (kF > 0) {
      manoD = mezcla(manoD, [86 + 6 * Math.sin(t * 8), -18], kF); manoI = mezcla(manoI, [-8 - 6 * Math.sin(t * 8), -18], kF);
      pose.cara = "risa"; pose.rc = 0.1 * Math.sin(t * 6);
      y -= Math.abs(Math.sin((t - REVIENTA) * 6)) * 16 * (1 - tramo(t, 8.6, 9.2));
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const cerilla = t > 0.3 && t < 2.3;
    if (cerilla) {
      const llama = t < 2.15;
      pose.objD2 = (g, m, ang) => {
        g.save(); g.translate(m[0], m[1]); g.rotate(-0.7 - giro);
        g.fillStyle = "#e9cf9a"; g.fillRect(-1, -20, 2.2, 22);
        g.fillStyle = "#b5241a"; g.beginPath(); g.ellipse(0.1, -21, 2.2, 3, 0, 0, 6.283); g.fill();
        if (llama) {
          const f = 1 + 0.15 * Math.sin(t * 40);
          g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB.naranja, -12, -38, 24, 28);
          g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
          g.fillStyle = "#ffcc33"; g.beginPath(); g.moveTo(0, -32 * f); g.quadraticCurveTo(5, -24, 0, -19); g.quadraticCurveTo(-5, -24, 0, -32 * f); g.fill();
          g.fillStyle = "#fff6d0"; g.beginPath(); g.ellipse(0, -23, 1.8, 3, 0, 0, 6.283); g.fill();
        }
        g.restore();
      };
    }
    const m = matAv(x, y, ESC, giro, 1, sy);
    return { pose, m, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("frota", t > 0.3, () => { const q = aPant(e.m, [70, 84]); for (let i = 0; i < 14; i++) p.nueva(P.CHISPA, q[0], q[1], azar(-200, 200), azar(-260, 0), azar(0.2, 0.45), azar(6, 10)); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 60); });
    // la mecha se consume
    if (t > PRENDE && t < DESPEGA) {
      const k = tramo(t, PRENDE, DESPEGA), x = lerp(MECHA[0], BOTELLA + 6, k), y = lerp(MECHA[1], PIES - 128, k);
      for (let i = 0; i < 2; i++) p.nueva(P.CHISPA, x, y, azar(-120, 120), azar(-180, -20), azar(0.15, 0.35), azar(5, 9));
      if (Math.random() < 0.3) p.nueva(P.HUMO, x, y, azar(-10, 10), azar(-40, -20), azar(0.6, 1), azar(12, 20));
    }
    // despegue
    this.una("despega", t > DESPEGA, () => {
      this.cohete = { t0: t }; temblar(8, 0.25);
      for (let i = 0; i < 20; i++) p.nueva(P.HUMO, BOTELLA + azar(-20, 20), PIES - 120, azar(-90, 90), azar(-60, 10), azar(0.8, 1.4), azar(24, 44));
    });
    if (this.cohete && t < ESTALLA) {
      const q = this.posCohete(t);
      for (let i = 0; i < 4; i++) p.nueva(P.CHISPA, q[0] + azar(-3, 3), q[1] + 14, azar(-60, 60), azar(40, 160), azar(0.25, 0.55), azar(6, 11));
      p.nueva(P.LLAMA, q[0], q[1] + 16, 0, 120, 0.15, 24, 1);
    }
    // estalla y dibuja la jarra
    this.una("estalla", t > ESTALLA, () => {
      this.flash = 0.6; temblar(12, 0.3);
      this.fuegos = sprites().jarra.map(([x, y, c]) => ({ x0: JC[0], y0: JC[1], x1: JC[0] + x, y1: JC[1] + y, c, f: azar(0, 6), vx: 0, vy: 0, x: JC[0], y: JC[1], d: azar(0, 0.12) }));
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 500); p.nueva(P.CHISPA, JC[0], JC[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
    });
    // revienta en confeti dorado
    this.una("revienta", t > REVIENTA, () => {
      this.flash = 0.75; temblar(18, 0.5);
      for (const f of this.fuegos) { const a = Math.atan2(f.y1 - JC[1], f.x1 - JC[0]) + azar(-0.3, 0.3), v = azar(150, 420); f.vx = Math.cos(a) * v; f.vy = Math.sin(a) * v - 80; f.x = f.x1; f.y = f.y1; }
      for (let i = 0; i < 230; i++) { const a = azar(0, 6.283), r = azar(0, 170); p.nueva(P.CONFETI, JC[0] + Math.cos(a) * r, JC[1] + Math.sin(a) * r, Math.cos(a) * azar(60, 220), Math.sin(a) * azar(60, 220) - 60, azar(4.5, 6.5), azar(9, 15), i % 4 ? 1 : 2); }
      for (let i = 0; i < 60; i++) p.nueva(P.PURPURINA, JC[0] + azar(-200, 200), JC[1] + azar(-160, 160), azar(-30, 30), azar(20, 70), azar(1.5, 2.6), azar(8, 14));
    });
    if (this.fuegos && t > REVIENTA) for (const f of this.fuegos) { f.vy += 260 * dt; f.vx *= 1 - 1.2 * dt; f.x += f.vx * dt; f.y += f.vy * dt; }
    this.flash = Math.max(0, this.flash - dt * 2.5);
    p.alfa = 1 - tramo(t, OFF, OFF + 0.5);
    p.actualizar(dt);
  }
  posCohete(t) {
    const k = eOut(tramo(t, DESPEGA, ESTALLA));
    return [lerp(BOTELLA, JC[0], k) + Math.sin(k * 9) * 10 * (1 - k), lerp(PIES - 170, JC[1], k)];
  }
  dibujarBotella(g, t) {
    const b = PIES, x = BOTELLA;
    const temb = this.cohete && t - this.cohete.t0 < 0.5 ? Math.sin(t * 60) * 0.08 * (1 - (t - this.cohete.t0) / 0.5) : 0;
    g.save(); g.translate(x, b); g.rotate(temb);
    const gr = g.createLinearGradient(-18, 0, 18, 0);
    gr.addColorStop(0, "#0b3a16"); gr.addColorStop(0.4, "#2f8a3e"); gr.addColorStop(1, "#0a2e12");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-18, 0); g.lineTo(-18, -66); g.quadraticCurveTo(-18, -82, -7, -88); g.lineTo(-7, -116); g.lineTo(7, -116); g.lineTo(7, -88); g.quadraticCurveTo(18, -82, 18, -66); g.lineTo(18, 0); g.closePath(); g.fill();
    g.fillStyle = "#e7d7a8"; g.fillRect(-18, -54, 36, 24);
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-11, -62, 3, 56);
    // cohete dentro de la botella
    if (!this.cohete) {
      g.strokeStyle = "#c9a46a"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -80); g.lineTo(0, -140); g.stroke();
      g.fillStyle = "#e3262f"; g.fillRect(-8, -196, 16, 56);
      g.fillStyle = "#fff"; g.fillRect(-8, -178, 16, 6); g.fillRect(-8, -160, 16, 6);
      g.fillStyle = "#ffd34d"; g.beginPath(); g.moveTo(-9, -196); g.lineTo(0, -214); g.lineTo(9, -196); g.closePath(); g.fill();
      // mecha
      const k = t > PRENDE ? tramo(t, PRENDE, DESPEGA) : 0;
      g.strokeStyle = "#4a3b2a"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(6, -142);
      const fx = MECHA[0] - x, fy = MECHA[1] - b;
      g.quadraticCurveTo(lerp(24, 6, k), lerp(-128, -140, k), lerp(fx, 6, k), lerp(fy, -142, k)); g.stroke();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), S = sprites();
    fondo(g, "#000");
    const aCielo = tramo(t, 0.55, 1.4) * (1 - tramo(t, OFF, OFF + 0.55));
    if (aCielo > 0) {
      g.save(); g.globalAlpha = aCielo; g.drawImage(S.cielo, -60, -60);
      g.fillStyle = "#fff";
      for (const [x, y, r, f] of S.estrellas) { g.globalAlpha = aCielo * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + f))); g.fillRect(x, y, r, r); }
      g.restore();
    }
    // la jarra del cielo
    if (this.fuegos) {
      const tf = t - ESTALLA;
      const aF = t < REVIENTA ? 1 : Math.max(0, 1 - (t - REVIENTA) / 1.4);
      // se llena de cerveza
      if (t < REVIENTA + 0.1 && tf > FORMA) {
        const kL = eInOut(tramo(t, ESTALLA + FORMA, ESTALLA + FORMA + 0.9));
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.32 * (t < REVIENTA ? 1 : 0);
        g.beginPath(); g.rect(JC[0] - 106, JC[1] + 138 - 250 * kL, 186, 250 * kL); g.clip();
        g.drawImage(BLOB2.gota, JC[0] - 160, JC[1] - 160, 300, 340);
        g.drawImage(BLOB2.oro, JC[0] - 120, JC[1] - 80, 220, 230);
        g.restore();
      }
      g.save(); g.globalCompositeOperation = "lighter";
      for (const f of this.fuegos) {
        let x, y, a;
        if (t < REVIENTA) {
          const k = eOut(clamp((tf - f.d) / FORMA, 0, 1));
          x = lerp(f.x0, f.x1, k); y = lerp(f.y0, f.y1, k) + (k < 1 ? 0 : Math.sin(t * 3 + f.f) * 1.5);
          a = Math.min(1, tf * 6) * (k < 1 ? 1 : 0.75 + 0.25 * Math.sin(t * 9 + f.f * 3));
          if (k < 1) { // estela
            const k0 = eOut(clamp((tf - f.d - 0.08) / FORMA, 0, 1));
            g.globalAlpha = a * 0.5; g.strokeStyle = `rgb(${f.c})`; g.lineWidth = 2;
            g.beginPath(); g.moveTo(lerp(f.x0, f.x1, k0), lerp(f.y0, f.y1, k0)); g.lineTo(x, y); g.stroke();
          }
        } else { x = f.x; y = f.y; a = aF * (Math.sin(t * 20 + f.f) > -0.3 ? 1 : 0.3); }
        if (a <= 0) continue;
        g.globalAlpha = a * 0.7; g.drawImage(f.c === "255,250,235" ? BLOB.blanco : BLOB2.oro, x - 11, y - 11, 22, 22);
        g.globalAlpha = a; g.fillStyle = `rgb(${f.c})`; g.fillRect(x - 1.6, y - 1.6, 3.2, 3.2);
      }
      g.restore();
    }
    // el cohete subiendo
    if (this.cohete && t < ESTALLA) {
      const q = this.posCohete(t);
      g.save(); g.translate(q[0], q[1]);
      g.fillStyle = "#e3262f"; g.fillRect(-6, -18, 12, 34);
      g.fillStyle = "#ffd34d"; g.beginPath(); g.moveTo(-7, -18); g.lineTo(0, -30); g.lineTo(7, -18); g.fill();
      g.restore();
    }
    this.dibujarBotella(g, t);
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // la luz de la cerilla en la oscuridad
    if (t < 1.4) {
      const q = aPant(e.m, [64, 86]), a = t < 0.3 ? 1 : 1 - tramo(t, 0.6, 1.4);
      g.save();
      if (t >= 0.3) {
        const gr = g.createRadialGradient(q[0], q[1], 30, q[0], q[1], 260);
        gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(0,0,0,${0.97 * a})`);
        g.fillStyle = gr;
        g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * a; g.drawImage(BLOB.naranja, q[0] - 160, q[1] - 160, 320, 320);
        g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
      } else g.fillStyle = "#000";
      g.fillRect(-60, -60, W + 120, H + 120);
      g.restore();
    }
    // ¡OOOOH!
    if (t > 4.25 && t < OFF + 0.3) {
      const n = 1 + Math.min(4, Math.floor((t - 4.25) / 0.14)), golpe = t > REVIENTA ? 1 + 0.25 * Math.exp(-(t - REVIENTA) * 5) : 1;
      const R = rotulo(n), k = tramo(t, 4.25, 4.45), a = 1 - tramo(t, OFF - 0.3, OFF + 0.2);
      g.save(); g.globalAlpha = a; g.translate(230, 128); g.rotate(-0.08); g.scale(eBack(k) * golpe * 0.95, eBack(k) * golpe * 0.95);
      g.drawImage(R, -R.width / 2, -R.height / 2); g.restore();
    }
    if (this.flash > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = this.flash * 0.6; g.drawImage(BLOB2.oroClaro, JC[0] - 500, JC[1] - 400, 1000, 800); g.restore(); }
    if (t > OFF) { g.fillStyle = `rgba(0,0,0,${eIn(tramo(t, OFF, OFF + 0.56))})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00018", nombre: "Fuegos artificiales", crear: () => new EscenaFuegos() });
})();
