"use strict";
/*
 * 00080 · DARDOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la lámpara del bar. Tira tres dardos: el primero se clava en la pared (¡TOC!), el segundo en la
 * lámpara, que se pone a columpiarse con la luz (¡CLONK!), y el tercero, guiñando el ojo, en el centro de la
 * diana: fogonazo, confeti y ¡DIANA! La lámpara, todavía balanceándose, se apaga con un parpadeo.
 */
(() => {
const cache = cacheTexto();
const DIANA = [835, 248];               // centro de la diana en la pantalla
const PIV = [560, -14], CORDON = 126;   // lámpara: punto de cuelgue y largo del cordón
const X = 215, ESC = 1.55;              // el avatar

/** La diana pintada una vez (260 × 260, centro en 130,130). */
function lienzoDiana() {
  if (cache.has("diana")) return cache.get("diana");
  const S = 260, c = lienzoNuevo(S, S), g = c.getContext("2d"), C = S / 2;
  const R = { dobleF: 95, dobleD: 88, tripleF: 61, tripleD: 55, bullF: 14, bullD: 6.5, borde: 122 };
  // aro negro con sombra
  g.fillStyle = "#050505"; g.beginPath(); g.arc(C, C, R.borde + 4, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(C - 30, C - 40, 10, C, C, R.borde);
  gr.addColorStop(0, "#2a2a2a"); gr.addColorStop(1, "#0d0d0d");
  g.fillStyle = gr; g.beginPath(); g.arc(C, C, R.borde, 0, 6.283); g.fill();
  const NUM = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const sector = (r0, r1, i, col) => {
    const a0 = -Math.PI / 2 + (i - 0.5) * (Math.PI / 10), a1 = a0 + Math.PI / 10;
    g.beginPath(); g.arc(C, C, r1, a0, a1); g.arc(C, C, r0, a1, a0, true); g.closePath(); g.fillStyle = col; g.fill();
  };
  for (let i = 0; i < 20; i++) {
    const par = i % 2 === 0;
    sector(R.bullF, R.dobleF, i, par ? "#141414" : "#efe2c2");
    sector(R.dobleD, R.dobleF, i, par ? "#d3232b" : "#1d8c3c");
    sector(R.tripleD, R.tripleF, i, par ? "#d3232b" : "#1d8c3c");
  }
  g.fillStyle = "#1d8c3c"; g.beginPath(); g.arc(C, C, R.bullF, 0, 6.283); g.fill();
  g.fillStyle = "#d3232b"; g.beginPath(); g.arc(C, C, R.bullD, 0, 6.283); g.fill();
  // alambres
  g.strokeStyle = "rgba(220,225,230,.55)"; g.lineWidth = 1;
  for (const r of [R.bullD, R.bullF, R.tripleD, R.tripleF, R.dobleD, R.dobleF]) { g.beginPath(); g.arc(C, C, r, 0, 6.283); g.stroke(); }
  for (let i = 0; i < 20; i++) {
    const a = -Math.PI / 2 + (i - 0.5) * (Math.PI / 10);
    g.beginPath(); g.moveTo(C + Math.cos(a) * R.bullF, C + Math.sin(a) * R.bullF); g.lineTo(C + Math.cos(a) * R.dobleF, C + Math.sin(a) * R.dobleF); g.stroke();
  }
  // números
  for (let i = 0; i < 20; i++) {
    const a = -Math.PI / 2 + i * (Math.PI / 10), r = (R.dobleF + R.borde) / 2;
    txt(g, String(NUM[i]), C + Math.cos(a) * r, C + Math.sin(a) * r + 6, { tam: 17, peso: 800, fam: FT, color: "#f2f2f2" });
  }
  // brillo
  g.fillStyle = "rgba(255,255,255,.07)"; g.beginPath(); g.ellipse(C - 35, C - 50, 60, 30, -0.6, 0, 6.283); g.fill();
  cache.set("diana", c);
  return c;
}

/** Pared de madera oscura (se pinta una vez). */
function lienzoPared() {
  if (cache.has("pared")) return cache.get("pared");
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, PIES);
  gr.addColorStop(0, "#0a0705"); gr.addColorStop(1, "#1c130c");
  g.fillStyle = gr; g.fillRect(0, 0, W, PIES);
  const r = semilla(80);
  for (let x = 0; x < W; x += 64) {
    g.fillStyle = `rgba(255,220,170,${0.012 + r() * 0.02})`; g.fillRect(x + 2, 0, 60, PIES);
    g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(x, 0, 2, PIES);
  }
  // zócalo
  g.fillStyle = "#2a1b10"; g.fillRect(0, 430, W, 10);
  g.fillStyle = "rgba(255,220,170,.08)"; g.fillRect(0, 430, W, 2);
  // suelo
  const gs = g.createLinearGradient(0, PIES, 0, H);
  gs.addColorStop(0, "#2a1d14"); gs.addColorStop(1, "#0c0806");
  g.fillStyle = gs; g.fillRect(0, PIES, W, H - PIES);
  cache.set("pared", c);
  return c;
}

/** Dardo con el origen en la punta, apuntando hacia +x. largo < 1: en escorzo (clavado de frente). */
function dardo(g, x, y, ang, esc = 1, largo = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc * largo, esc);
  g.fillStyle = "#d9dee3"; g.beginPath(); g.moveTo(0, 0); g.lineTo(-13, -1.7); g.lineTo(-13, 1.7); g.closePath(); g.fill();
  g.fillStyle = "#7e868e"; rectR(g, -31, -3.2, 19, 6.4, 2.2); g.fill();
  g.fillStyle = "#eef2f5"; g.fillRect(-30, -2.4, 17, 1.4);
  g.strokeStyle = "rgba(30,30,30,.55)"; g.lineWidth = 0.9;
  g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(-28 + i * 4, -3.2); g.lineTo(-28 + i * 4, 3.2); } g.stroke();
  g.fillStyle = "#151515"; g.fillRect(-46, -1.4, 16, 2.8);
  g.fillStyle = "#2bff5b"; g.strokeStyle = "#0a4a1c"; g.lineWidth = 1.2;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-39, s); g.lineTo(-55, s * 10); g.lineTo(-58, s * 1.2); g.closePath(); g.fill(); g.stroke(); }
  g.restore();
}

/** ¡DIANA! pintado una vez (con brillo). */
function titulo() {
  if (cache.has("tit")) return cache.get("tit");
  const c = lienzoNuevo(560, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#f4ffe0"); gr.addColorStop(0.5, "#8dff9e"); gr.addColorStop(1, "#14c43f");
  txt(g, "¡DIANA!", 280, 160, { tam: 136, peso: 900, fam: FD, color: gr, borde: "#032b10", bordeAncho: 12, esp: 4, glow: "rgba(43,255,91,.75)", glowTam: 26 });
  cache.set("tit", c);
  return c;
}

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return mezcla(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  }
  return k[k.length - 1][1];
}

// la mano derecha: coge un dardo de la izquierda, apunta, coge impulso y lo lanza (tres veces)
const MANO_D = [
  [0, [70, 158]], [0.5, [70, 158]], [0.78, [8, 112]], [1.08, [100, 74]], [1.36, [80, 58]], [1.54, [140, 82], eIn], [1.74, [128, 112], eOut],
  [2.05, [84, 140]], [2.3, [66, 26]], [2.42, [62, 20]], [2.52, [70, 28]], [2.62, [62, 20]], [2.72, [70, 28]],
  [3.0, [8, 112]], [3.28, [100, 74]], [3.5, [80, 58]], [3.66, [140, 66], eIn], [3.86, [128, 104], eOut], [4.15, [84, 140]],
  [4.9, [84, 140]], [5.12, [8, 112]], [5.42, [100, 74]], [5.86, [76, 56]], [5.98, [142, 80], eIn], [6.16, [130, 100], eOut],
];
const TIROS = [
  { tR: 1.54, dur: 0.42, alto: 70, dest: "pared" },
  { tR: 3.66, dur: 0.34, alto: 26, dest: "lampara" },
  { tR: 5.98, dur: 0.22, alto: 14, dest: "diana" },
];
const CLAVO = { pared: [930, 492], diana: DIANA };
const EN_LAMPARA = [-50, CORDON + 30]; // dónde se clava en la pantalla de la lámpara (coordenadas de la lámpara)

class Dardos extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(420);
    this.vuelos = []; this.clavados = []; this.tHit = -1; this.tLamp = -1;
    this.textos = [];
  }
  /** Ángulo de la lámpara (se columpia desde que le da el segundo dardo). */
  angLampara(t) {
    if (this.tLamp < 0 || t < this.tLamp) return 0;
    const s = t - this.tLamp;
    return -0.42 * Math.exp(-s * 0.32) * Math.sin(s * 4.1);
  }
  luz(t) {
    if (t < 0.7) return [0, 0, 1, 0, 0, 1, 0.3, 1][Math.min(7, Math.floor(t / 0.09))];
    if (t > 8.7) return t > 9.35 ? 0 : [1, 0.15, 0.8, 0, 0.5, 0, 0, 0][Math.min(7, Math.floor((t - 8.7) / 0.08))];
    return 1;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = pista(t, MANO_D), manoI = [-4, 114 + Math.sin(t * 2.2) * 1.5], y = PIES, sx = 1, sy = 1;
    // caras
    if ((t > 1.32 && t < 1.56) || (t > 3.44 && t < 3.68) || (t > 5.3 && t < 6.22)) pose.cara = "guino";
    if (t > 1.97 && t < 2.3) pose.cara = "sorpresa";
    if (t >= 2.3 && t < 2.85) pose.cara = "risa";
    if (t > 4.0 && t < 4.85) { pose.cara = "sorpresa"; pose.rc = -0.1 - 0.35 * this.angLampara(t); }
    if (t > 5.3 && t < 6.0) pose.rc = 0.06 * tramo(t, 5.3, 5.6);
    // cuántos dardos quedan en la mano izquierda
    const quedan = t < 0.78 ? 3 : t < 3.0 ? 2 : t < 5.12 ? 1 : 0;
    // el dardo que lleva en la derecha
    const enMano = (t > 0.78 && t < 1.54) || (t > 3.0 && t < 3.66) || (t > 5.12 && t < 5.98);
    if (enMano) {
      const a = t > 5.86 || (t > 1.36 && t < 1.54) || (t > 3.5 && t < 3.66) ? -0.35 : -0.12;
      pose.objD2 = (g, m) => dardo(g, m[0] + 28, m[1] - 3, a, 1.3 / ESC);
    }
    if (quedan > 0) pose.objI = (g, m) => { for (let i = 0; i < quedan; i++) { const an = -1.3 + i * 0.25; dardo(g, m[0] + Math.cos(an) * 19, m[1] + Math.sin(an) * 19, an, 1.25 / ESC); } };
    // celebración: brazos arriba y saltos
    if (t > 6.22) {
      const k = eOut(tramo(t, 6.22, 6.5)), bomba = Math.sin((t - 6.22) * 12) * 6;
      manoD = mezcla(manoD, [90, 10 + bomba], k);
      manoI = mezcla(manoI, [-12, 10 - bomba], k);
      pose.cara = "risa";
      const s = (t - 6.35) * 6.5;
      if (t > 6.35 && t < 8.3) y = PIES - Math.abs(Math.sin(s)) * 42;
      if (t > 6.35 && t < 8.3 && Math.abs(Math.sin(s)) < 0.2) { sy = 0.95; sx = 1.03; }
      pose.piernaI = [0, 0.06 * k]; pose.piernaD = [0, -0.06 * k];
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(X, y, ESC, 0, sx, sy);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    TIROS.forEach((T, i) => this.una("tiro" + i, t >= T.tR, () => {
      const e = this.estado(), q = aPant(e.m, e.pose.manoD);
      const des = T.dest === "lampara" ? [PIV[0] + EN_LAMPARA[0], PIV[1] + EN_LAMPARA[1]] : CLAVO[T.dest];
      this.vuelos.push({ x0: q[0] + 20, y0: q[1] - 8, x1: des[0], y1: des[1], t0: t, dur: T.dur, alto: T.alto, dest: T.dest });
    }));
    for (const v of this.vuelos) {
      if (v.fin || t - v.t0 < v.dur) continue;
      v.fin = true;
      if (v.dest === "pared") {
        this.clavados.push({ x: v.x1, y: v.y1, ang: -0.3, t0: t, dest: v.dest });
        temblar(5, 0.15);
        for (let i = 0; i < 10; i++) p.nueva(P.POLVO, v.x1, v.y1, azar(-120, 60), azar(-80, 60), azar(0.4, 0.8), azar(10, 22));
        this.textos.push({ s: "¡TOC!", x: v.x1 - 40, y: v.y1 - 50, t0: t, tam: 44, rot: -0.12, col: "#fffdf5", borde: "#5a3a12" });
      } else if (v.dest === "lampara") {
        this.tLamp = t; this.clavados.push({ lampara: true, t0: t });
        temblar(7, 0.2);
        for (let i = 0; i < 14; i++) { const a = azar(0, 6.283), s = azar(120, 320); p.nueva(P.CHISPA, v.x1, v.y1, Math.cos(a) * s, Math.sin(a) * s, azar(0.25, 0.5), azar(6, 10)); }
        this.textos.push({ s: "¡CLONK!", x: 400, y: 112, t0: t, tam: 54, rot: -0.15, col: "#fffdf5", borde: "#0f4a2a" });
      } else {
        this.tHit = t; this.clavados.push({ x: v.x1, y: v.y1, ang: -0.32, t0: t, dest: v.dest });
        temblar(20, 0.5);
        p.nueva(P.DESTELLO, DIANA[0], DIANA[1], 0, 0, 0.45, 260);
        for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), s = azar(250, 700); p.nueva(P.CHISPA, DIANA[0], DIANA[1], Math.cos(a) * s, Math.sin(a) * s, azar(0.4, 0.9), azar(8, 15)); }
        for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(40, 140), azar(4, 6), azar(9, 15), (Math.random() * 5) | 0);
      }
    }
    this.p.suelo = () => PIES - 3;
    p.actualizar(dt);
  }
  dibujarLampara(g, t, ang, luz) {
    g.save(); g.translate(PIV[0], PIV[1]); g.rotate(ang);
    // cono de luz
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz;
      if (!this.grCono) {
        this.grCono = g.createLinearGradient(0, CORDON + 50, 0, CORDON + 700);
        this.grCono.addColorStop(0, "rgba(255,236,190,.30)"); this.grCono.addColorStop(1, "rgba(255,236,190,.04)");
      }
      g.fillStyle = this.grCono;
      g.beginPath(); g.moveTo(-56, CORDON + 50); g.lineTo(56, CORDON + 50); g.lineTo(270, CORDON + 700); g.lineTo(-270, CORDON + 700); g.closePath(); g.fill();
      g.restore();
    }
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, CORDON); g.stroke();
    g.fillStyle = "#1b1b1b"; rectR(g, -8, CORDON - 8, 16, 12, 3); g.fill();
    // pantalla esmaltada
    if (!this.grPant) {
      this.grPant = g.createLinearGradient(-60, 0, 60, 0);
      this.grPant.addColorStop(0, "#0c3a20"); this.grPant.addColorStop(0.38, "#2f9a57"); this.grPant.addColorStop(0.5, "#7fe0a0"); this.grPant.addColorStop(0.62, "#238048"); this.grPant.addColorStop(1, "#0a2f19");
    }
    g.fillStyle = this.grPant;
    g.beginPath(); g.moveTo(-15, CORDON + 2); g.lineTo(15, CORDON + 2);
    g.quadraticCurveTo(26, CORDON + 30, 60, CORDON + 48); g.lineTo(-60, CORDON + 48); g.quadraticCurveTo(-26, CORDON + 30, -15, CORDON + 2); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 2; g.stroke();
    // boca de la lámpara y bombilla
    g.fillStyle = luz > 0.5 ? "#fff1c2" : "#3a3427";
    g.beginPath(); g.ellipse(0, CORDON + 48, 60, 8, 0, 0, 6.283); g.fill();
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz * 0.9;
      g.drawImage(BLOB2.oroClaro, -70, CORDON + 18, 140, 70); g.restore();
    }
    // el dardo clavado en la lámpara
    if (this.tLamp > 0 && t >= this.tLamp) {
      const s = t - this.tLamp, vib = 0.18 * Math.exp(-s * 7) * Math.sin(s * 60);
      dardo(g, EN_LAMPARA[0] + 9, EN_LAMPARA[1] - 4, -0.85 + vib, 1.3, 0.85);
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(t), ang = this.angLampara(t);
    fondo(g, "#000");
    g.drawImage(lienzoPared(), 0, 0);
    // halo de la lámpara en la pared y charco de luz en el suelo
    const xs = PIV[0] - Math.tan(ang) * (PIES - PIV[1]);
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.22 * luz; g.drawImage(BLOB2.oroClaro, PIV[0] - Math.sin(ang) * 170 - 300, PIV[1] + 60, 600, 380);
    g.globalAlpha = 0.5 * luz; g.drawImage(BLOB2.oroClaro, xs - 300, PIES - 28, 600, 56);
    g.globalAlpha = 0.16 * luz; g.drawImage(BLOB2.oroClaro, DIANA[0] - 190, DIANA[1] - 190, 380, 380);
    g.restore();
    // la diana (con temblor al dar en el centro)
    const kH = this.tHit > 0 ? t - this.tHit : -1;
    const sacude = kH > 0 && kH < 0.5 ? Math.sin(kH * 70) * 5 * (1 - kH / 0.5) : 0;
    g.save(); g.translate(DIANA[0] + sacude, DIANA[1]);
    const dd = lienzoDiana(); g.drawImage(dd, -130, -130);
    g.restore();
    // dardos clavados
    for (const c of this.clavados) {
      if (c.lampara) continue;
      const s = t - c.t0, vib = 0.16 * Math.exp(-s * 6) * Math.sin(s * 55), largo = lerp(1, 0.55, eOut(tramo(s, 0, 0.06)));
      dardo(g, c.x + (c.dest === "diana" ? sacude : 0), c.y, c.ang + vib, 1.35, largo);
    }
    // anillo de fogonazo en la diana
    if (kH > 0 && kH < 0.6) {
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(255,248,210,${0.9 * (1 - kH / 0.6)})`; g.lineWidth = 10 * (1 - kH / 0.6) + 2;
      g.beginPath(); g.arc(DIANA[0], DIANA[1], 20 + kH * 320, 0, 6.283); g.stroke(); g.restore();
    }
    this.dibujarLampara(g, t, ang, luz);
    // dardos en el aire
    for (const v of this.vuelos) {
      if (v.fin) continue;
      const u = clamp((t - v.t0) / v.dur, 0, 1);
      const x = lerp(v.x0, v.x1, u), y = lerp(v.y0, v.y1, u) - v.alto * 4 * u * (1 - u);
      const dx = v.x1 - v.x0, dy = v.y1 - v.y0 - v.alto * 4 * (1 - 2 * u);
      if (v.dest === "diana") {
        g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,240,200,.35)"; g.lineWidth = 4;
        g.beginPath(); g.moveTo(lerp(v.x0, x, 0.4), lerp(v.y0, y, 0.4)); g.lineTo(x - 30, y + 3); g.stroke(); g.restore();
      }
      dardo(g, x, y, Math.atan2(dy, dx), 1.35);
    }
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // onomatopeyas
    for (const o of this.textos) {
      const s = t - o.t0; if (s > 1.0) continue;
      const k = eBack(tramo(s, 0, 0.16));
      g.save(); g.translate(o.x, o.y - s * 12); g.rotate(o.rot); g.scale(k, k);
      txt(g, o.s, 0, 0, { tam: o.tam, peso: 400, fam: FC, color: o.col, borde: o.borde, bordeAncho: 8, alfa: 1 - tramo(s, 0.75, 1.0), esp: 2 });
      g.restore();
    }
    // ¡DIANA!
    if (kH > 0) {
      const k = tramo(kH, 0.04, 0.2), s = lerp(2.6, 1, eIn(k)) * (1 + 0.04 * Math.sin(kH * 8)), spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(522, 368); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2);
      g.restore();
    }
    // la lámpara enciende y apaga la escena
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00080", nombre: "Dardos", crear: () => new Dardos() });
})();
