"use strict";
/*
 * 00025 · HOYO EN UNO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre un círculo sobre él: palo de golf en mano y una chapa en el suelo. Mira a lo lejos una jarra con banderita
 * encima de un taburete, coge impulso y golpea. La chapa rebota en tres botellas (¡CLINK! ¡CLANK! ¡CLONK!), da
 * vueltas por el borde de la jarra mientras él se retuerce… y cae dentro (¡HOYO EN UNO!). El círculo se cierra sobre
 * la jarra.
 */
(() => {
const CACHE = cacheTexto();
function cartel(clave, s, o) {
  let c = CACHE.get(clave);
  if (c) return c;
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 400} ${o.tam}px ${o.fam}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  const pad = (o.glowTam || 0) + (o.bordeAncho || 0) + 14;
  c = lienzoNuevo(m.measureText(s).width + pad * 2, o.tam * 1.3 + pad * 2);
  txt(c.getContext("2d"), s, c.width / 2, c.height / 2 + o.tam * 0.36, o);
  CACHE.set(clave, c);
  return c;
}
function ponCartel(g, c, x, y, s, a = 1, rot = 0) {
  if (a <= 0 || s <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}
function titulo() {
  let c = CACHE.get("hoyo3d");
  if (!c) { c = sprite3D("¡HOYO EN UNO!", 104, { cara: "#fffdf5", lado: "#1a8a3a", borde: "#05260e" }); CACHE.set("hoyo3d", c); }
  return c;
}

const CHAPA0 = [292, PIES - 6];
const JARRA_C = [900, 478];            // pie de la jarra (asiento del taburete)
const JE = 2.3;                        // escala de la jarra
const BORDE = [JARRA_C[0], JARRA_C[1] - 36 * JE + 2];
const BOT = [ // botellas: [x base, y base, alto, punto de choque, rótulo]
  { x: 470, y: PIES - 2, h: 118, golpe: [462, PIES - 92], txt: "¡CLINK!" },
  { x: 640, y: 300, h: 104, golpe: [628, 222], txt: "¡CLANK!" },
  { x: 770, y: PIES - 2, h: 118, golpe: [760, PIES - 104], txt: "¡CLONK!" },
];
const T_GOLPE = 2.92, T_BORDE = 4.95, T_DENTRO = 5.75;

/** Botella de cerveza; (0, 0) = la base; se tambalea `ang`. */
function botella(g, x, y, h, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const w = 30;
  g.beginPath();
  g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -h * 0.55);
  g.quadraticCurveTo(-w / 2, -h * 0.72, -6, -h * 0.78); g.lineTo(-6, -h + 6); g.lineTo(6, -h + 6); g.lineTo(6, -h * 0.78);
  g.quadraticCurveTo(w / 2, -h * 0.72, w / 2, -h * 0.55); g.lineTo(w / 2, 0); g.closePath();
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#06361a"); gr.addColorStop(0.3, "#1d8a45"); gr.addColorStop(0.5, "#5fd68a"); gr.addColorStop(0.75, "#137036"); gr.addColorStop(1, "#042a14");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = "#f2ead6"; g.fillRect(-w / 2 + 1, -h * 0.42, w - 2, h * 0.22);
  g.fillStyle = "#c8102e"; g.fillRect(-w / 2 + 1, -h * 0.33, w - 2, 5);
  g.fillStyle = "#e7b400"; rectR(g, -7, -h, 14, 8, 2); g.fill();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-w / 2 + 5, -h * 0.52, 3, h * 0.48);
  g.restore();
}
/** Chapa girando: (x, y) centro, `giro` fase del giro. */
function chapa(g, x, y, giro, r = 12) {
  g.save(); g.translate(x, y);
  const sx = Math.max(0.18, Math.abs(Math.cos(giro)));
  g.rotate(giro * 0.3); g.scale(sx, 1);
  g.beginPath();
  for (let i = 0; i < 21; i++) { const a = (i / 21) * 6.283, rr = i % 2 ? r : r * 0.86; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath();
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
  gr.addColorStop(0, "#fff3b0"); gr.addColorStop(0.5, "#e7b400"); gr.addColorStop(1, "#8a6200");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#5a3e00"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "#c8102e"; g.beginPath(); g.arc(0, 0, r * 0.45, 0, 6.283); g.fill();
  g.restore();
}
/** Palo de golf desde la mano, en la dirección `ang` (0 = hacia abajo, positivo hacia la derecha). Unidades de avatar. */
function palo(g, m, ang) {
  const L = 92, d = [Math.sin(ang), Math.cos(ang)];
  g.save(); g.lineCap = "round";
  g.strokeStyle = "#1a1a1d"; g.lineWidth = 4.2; g.beginPath(); g.moveTo(m[0] - d[0] * 6, m[1] - d[1] * 6); g.lineTo(m[0] + d[0] * 14, m[1] + d[1] * 14); g.stroke();
  g.strokeStyle = "#c9d0d6"; g.lineWidth = 2; g.beginPath(); g.moveTo(m[0] + d[0] * 14, m[1] + d[1] * 14); g.lineTo(m[0] + d[0] * L, m[1] + d[1] * L); g.stroke();
  g.translate(m[0] + d[0] * L, m[1] + d[1] * L); g.rotate(-ang);
  const gr = g.createLinearGradient(-4, 0, 14, 0);
  gr.addColorStop(0, "#3a3f46"); gr.addColorStop(0.5, "#d9dee3"); gr.addColorStop(1, "#5a616a");
  g.fillStyle = gr; g.beginPath(); g.moveTo(-3, -4); g.lineTo(13, -2); g.quadraticCurveTo(17, 2, 13, 5); g.lineTo(-4, 5); g.closePath(); g.fill();
  g.strokeStyle = "#1e2226"; g.lineWidth = 0.8; g.stroke();
  g.restore();
}

class EscenaHoyo extends Escena {
  constructor() {
    super(8.9);
    this.p = new Parts(380);
    this.p.suelo = () => PIES - 2;
    this.ESC = 1.45; this.X = 205;
    this.tramos = [
      [T_GOLPE, 3.3, CHAPA0, BOT[0].golpe, 70],
      [3.3, 3.78, BOT[0].golpe, BOT[1].golpe, 120],
      [3.78, 4.3, BOT[1].golpe, BOT[2].golpe, 110],
      [4.3, T_BORDE, BOT[2].golpe, [BORDE[0] - 30, BORDE[1] - 6], 150],
    ];
    this.bamboleo = BOT.map(() => ({ a: 0, v: 0 }));
    this.textos = []; this.estela = [];
  }
  /** ángulo del palo según el swing */
  swing() {
    const t = this.t;
    let a = 0.56 + 0.07 * Math.sin(t * 5) * (t > 0.9 && t < 1.8 ? 1 : 0);
    if (t > 1.85) a = lerp(a, -2.0, eInOut(tramo(t, 1.85, 2.6)));
    if (t > 2.75) a = lerp(-2.0, 0.56, eIn(tramo(t, 2.75, T_GOLPE)));
    if (t > T_GOLPE) a = lerp(0.56, 2.05, eOut(tramo(t, T_GOLPE, 3.12)));
    if (t > T_DENTRO + 0.05) a = lerp(2.05, Math.PI + 0.25, eOut(tramo(t, T_DENTRO + 0.05, T_DENTRO + 0.35)));
    return a;
  }
  chapaPos() {
    const t = this.t;
    if (t < T_GOLPE) return { x: CHAPA0[0], y: CHAPA0[1], giro: 1.4, delante: true };
    for (const [t0, t1, a, b, h] of this.tramos) {
      if (t > t1) continue;
      const u = (t - t0) / (t1 - t0);
      return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u) - h * 4 * u * (1 - u), giro: t * 22, delante: true };
    }
    if (t < T_DENTRO - 0.2) { // vueltas por el borde
      const u = tramo(t, T_BORDE, T_DENTRO - 0.2), ph = Math.PI + u * Math.PI * 4.5;
      const rx = 30 * (1 - 0.3 * u), ry = 8 * (1 - 0.3 * u);
      return { x: BORDE[0] + Math.cos(ph) * rx, y: BORDE[1] - 7 + Math.sin(ph) * ry, giro: t * 30, delante: Math.sin(ph) > 0 };
    }
    const u = tramo(t, T_DENTRO - 0.2, T_DENTRO + 0.3);
    return { x: BORDE[0], y: BORDE[1] + 4 + u * 40, giro: t * 10, delante: false, dentro: true };
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0.07], piernaD: [0, -0.07] };
    const ang = this.swing();
    const phi = clamp(ang * 0.72, -1.7, 1.7);
    const C = [39, 92], r = 62;
    let G = [C[0] + Math.sin(phi) * r, C[1] + Math.cos(phi) * r];
    let giro = 0, sy = 1;
    if (t > 0.9 && t < 1.8) { pose.cara = t > 1.05 && t < 1.7 ? "guino" : "sonrisa"; pose.rc = 0.14 * eInOut(tramo(t, 0.95, 1.2)) * (1 - eInOut(tramo(t, 1.55, 1.8))); }
    if (t >= 1.8 && t < T_GOLPE) { pose.cara = t < 2.75 ? "sonrisa" : "guino"; pose.rc = -0.04; }
    if (t >= T_GOLPE) {
      pose.cara = "sorpresa";
      const c = this.chapaPos();
      pose.rc = clamp((c.x - this.X) / 2500, -0.1, 0.18);
      giro = 0.05 * tramo(t, T_GOLPE, 3.1);
    }
    // se retuerce mientras la chapa da vueltas
    if (t > T_BORDE - 0.15 && t < T_DENTRO) {
      const k = tramo(t, T_BORDE - 0.15, T_BORDE + 0.1);
      giro = lerp(giro, 0.1 + 0.05 * Math.sin(t * 7), k);
      pose.cara = Math.sin(t * 8) > 0 ? "sorpresa" : "dormido";
      pose.piernaD = [-8 * k, -0.2 * k];
    }
    let manoD, manoI;
    if (t > T_DENTRO + 0.05) {
      // ¡HOYO EN UNO!: palo arriba
      const k = eOut(tramo(t, T_DENTRO + 0.05, T_DENTRO + 0.35));
      G = mezcla(G, [80, 14], k);
      giro *= 1 - k; pose.cara = "risa";
      const salta = Math.abs(Math.sin((t - T_DENTRO) * 7)) * (1 - tramo(t, 7.4, 7.8));
      sy = 1 + 0.02 * salta;
      manoD = [G[0], G[1]]; manoI = mezcla([G[0] - 4, G[1] + 12], [-22, 22 + 20 * salta], k);
      pose.piernaD = [0, -0.07]; pose.rc = 0.05 * Math.sin(t * 9);
      if (t > 7.5) pose.cara = "guino";
    } else {
      manoD = [G[0] + 2, G[1] + 4]; manoI = [G[0] - 3, G[1] - 7];
      pose.brazoIDelante = true;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD2 = (g, m) => palo(g, m, ang);
    const y = PIES - (t > T_DENTRO + 0.05 ? 36 * Math.abs(Math.sin((t - T_DENTRO) * 7)) * (1 - tramo(t, 7.4, 7.8)) : 0);
    const m = matAv(this.X, y, ESC, giro, 1, sy, [39, 232]);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("golpe", t > T_GOLPE, () => {
      temblar(8, 0.2);
      p.nueva(P.DESTELLO, CHAPA0[0], CHAPA0[1], 0, 0, 0.25, 80);
      for (let i = 0; i < 10; i++) p.nueva(P.POLVO, CHAPA0[0], PIES - 4, azar(-60, 220), azar(-80, -10), azar(0.4, 0.8), azar(14, 24));
    });
    BOT.forEach((B, i) => this.una("bot" + i, t > this.tramos[i][1], () => {
      temblar(7, 0.15);
      this.bamboleo[i].v = 3.2 * (i === 1 ? 1 : 1);
      p.nueva(P.DESTELLO, B.golpe[0], B.golpe[1], 0, 0, 0.25, 70);
      for (let k = 0; k < 10; k++) { const a = azar(0, 6.283), v = azar(120, 300); p.nueva(P.CHISPA, B.golpe[0], B.golpe[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.45), azar(5, 9)); }
      this.textos.push({ s: B.txt, x: B.golpe[0] + (i === 1 ? -10 : 0), y: B.golpe[1] - 70, t0: t, i });
    }));
    for (const b of this.bamboleo) { b.v += (-b.a * 140 - b.v * 4) * dt; b.a += b.v * dt; }
    const cp = this.chapaPos();
    if (t > T_GOLPE && t < T_DENTRO - 0.2) { this.estela.push([cp.x, cp.y]); if (this.estela.length > 12) this.estela.shift(); }
    else if (this.estela.length) this.estela.shift();
    this.una("borde", t > T_BORDE, () => { temblar(4, 0.12); p.nueva(P.DESTELLO, BORDE[0] - 24, BORDE[1], 0, 0, 0.2, 50); });
    this.una("dentro", t > T_DENTRO, () => {
      temblar(20, 0.5);
      for (let i = 0; i < 30; i++) p.nueva(P.ESPUMA, BORDE[0] + azar(-14, 14), BORDE[1], azar(-200, 200), azar(-420, -160), azar(0.6, 1.1), azar(5, 10));
      for (let i = 0; i < 14; i++) p.nueva(P.GOTA, BORDE[0] + azar(-10, 10), BORDE[1], azar(-160, 160), azar(-420, -200), 1.2, azar(3, 5));
      for (let i = 0; i < 130; i++) p.nueva(P.CONFETI, azar(0, W), azar(-220, -10), azar(-60, 60), azar(20, 120), azar(4, 6), azar(8, 14), [0, 2, 1, 0][(Math.random() * 4) | 0]);
      p.nueva(P.DESTELLO, BORDE[0], BORDE[1], 0, 0, 0.35, 160);
    });
    if (t > 6.1 && t < 7.6 && Math.random() < 20 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 100), 5, azar(8, 14), [0, 2, 1][(Math.random() * 3) | 0]);
    p.actualizar(dt);
  }
  escenario(g, t) {
    // pared y moqueta de golf
    const gp = g.createLinearGradient(0, 0, 0, 470);
    gp.addColorStop(0, "#0b0907"); gp.addColorStop(1, "#22180f");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 530);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    for (let x = 30; x < W; x += 74) { g.beginPath(); g.moveTo(x, 120); g.lineTo(x, 470); g.stroke(); }
    g.fillStyle = "#3a2716"; g.fillRect(-60, 462, W + 120, 10);
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#0f4a1e"); gs.addColorStop(1, "#2c9a45");
    g.fillStyle = gs; g.fillRect(-60, 470, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.05)";
    for (let i = 0; i < 12; i++) g.fillRect(-60 + i * 100, 470, 50, H);
    // estante
    g.fillStyle = "#5a3a1c"; g.fillRect(585, 300, 120, 12);
    g.fillStyle = "#3a2410"; g.beginPath(); g.moveTo(600, 312); g.lineTo(620, 312); g.lineTo(600, 340); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(690, 312); g.lineTo(670, 312); g.lineTo(690, 340); g.closePath(); g.fill();
    // luces
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.25; g.drawImage(BLOB.amarillo, 40, 330, 360, 300); g.drawImage(BLOB.amarillo, 760, 330, 300, 260);
    g.restore();
    // taburete
    const [jx, jy] = JARRA_C;
    g.strokeStyle = "#8a939c"; g.lineWidth = 6; g.beginPath(); g.moveTo(jx, jy + 6); g.lineTo(jx, PIES - 4); g.stroke();
    g.beginPath(); g.ellipse(jx, PIES - 40, 26, 6, 0, 0, 6.283); g.lineWidth = 4; g.stroke();
    g.fillStyle = "#5a616a"; g.beginPath(); g.ellipse(jx, PIES - 3, 34, 7, 0, 0, 6.283); g.fill();
    g.fillStyle = "#8a1c22"; g.beginPath(); g.ellipse(jx, jy + 4, 44, 11, 0, 0, 6.283); g.fill();
    g.fillStyle = "#c2303a"; g.beginPath(); g.ellipse(jx, jy, 44, 10, 0, 0, 6.283); g.fill();
  }
  jarra(g, t, parte, c) {
    const [jx, jy] = JARRA_C;
    g.save(); g.translate(jx - 17 * JE, jy - 18 * JE); g.scale(JE, JE);
    if (parte === "fondo") {
      // banderita (detrás de la espuma)
      const ond = t > T_DENTRO ? Math.exp(-(t - T_DENTRO) * 2.5) * Math.sin((t - T_DENTRO) * 30) * 0.3 : 0;
      g.save(); g.translate(24, -12); g.rotate(-0.1 + ond);
      g.strokeStyle = "#e9edf0"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke();
      g.fillStyle = "#e5262f"; g.beginPath(); g.moveTo(0, -34); g.quadraticCurveTo(8, -32 + 2 * Math.sin(t * 8), 14, -29); g.lineTo(0, -24); g.closePath(); g.fill();
      txt(g, "1", 5, -26.5, { tam: 6, peso: 900, fam: FD, color: "#fff" });
      g.restore();
    } else {
      dibujarJarra(g, [0, 0], 0, 0.92, "cuerpo", t);
      if (c && c.dentro) { // la chapa hundiéndose dentro
        g.save(); rectR(g, 4, -16, 26, 33, 3); g.clip(); g.globalAlpha = 0.6;
        g.restore();
      }
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), c = this.chapaPos();
    fondo(g, "#000");
    this.escenario(g, t);
    // botellas
    BOT.forEach((B, i) => botella(g, B.x, B.y, B.h, this.bamboleo[i].a * 0.12));
    // jarra: banderita, chapa por detrás si va por el borde de atrás, jarra, chapa por delante
    this.jarra(g, t, "fondo");
    if (!c.delante && !c.dentro && t > T_BORDE) chapa(g, c.x, c.y, c.giro, 12);
    if (c.dentro) { g.save(); g.globalAlpha = 1 - tramo(t, T_DENTRO - 0.1, T_DENTRO + 0.25); chapa(g, c.x, c.y, c.giro, 12); g.restore(); }
    this.jarra(g, t, "cuerpo", c);
    // estela de la chapa
    if (this.estela.length > 1) {
      g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      for (let i = 1; i < this.estela.length; i++) {
        const k = i / this.estela.length, a = this.estela[i - 1], b = this.estela[i];
        g.strokeStyle = `rgba(255,210,80,${0.55 * k})`; g.lineWidth = 2 + 8 * k;
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
      g.restore();
    }
    // sombra y avatar
    g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(this.X, PIES - 1, 66, 9, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    if (c.delante && !c.dentro) {
      if (t < T_GOLPE) {
        g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(CHAPA0[0], PIES - 1, 16, 4, 0, 0, 6.283); g.fill();
        g.save(); g.translate(c.x, c.y); g.scale(1, 0.42); chapa(g, 0, 0, 0, 14); g.restore();
        brillo(g, c.x - 4, c.y - 5, 12, 0.6 + 0.4 * Math.sin(t * 6));
      } else chapa(g, c.x, c.y, c.giro, 12);
    }
    this.p.dibujar(g);
    // ¡CLINK! ¡CLANK! ¡CLONK!
    for (const T of this.textos) {
      const u = t - T.t0;
      if (u > 0.9) continue;
      const cc = cartel("t" + T.i, T.s, { tam: 44, fam: FC, color: "#fffdf5", borde: "#0a5a24", bordeAncho: 7, esp: 2 });
      ponCartel(g, cc, T.x, T.y - 20 * u, eBack(tramo(u, 0, 0.12)), 1 - tramo(u, 0.6, 0.9), (T.i - 1) * 0.12);
    }
    // ¡HOYO EN UNO!
    if (t > T_DENTRO + 0.05) {
      const k = tramo(t, T_DENTRO + 0.05, T_DENTRO + 0.3);
      ponCartel(g, titulo(), W / 2 + 40, 130, lerp(0.2, 1, eBack(k)) * (1 + 0.02 * Math.sin(t * 9)), Math.min(1, k * 3), -0.03);
    }
    // círculo: se abre sobre él y se cierra sobre la jarra
    const kA = eOut(tramo(t, 0.05, 0.85)), kC = tramo(t, 7.75, 8.75);
    let R = 1, cx = 0, cy = 0;
    if (kC <= 0) { R = Math.max(0.1, 1250 * kA); const q = aPant(e.m, [39, 100]); cx = q[0]; cy = q[1]; }
    else {
      R = kC < 0.55 ? lerp(1250, 74, eInOut(kC / 0.55)) : kC < 0.85 ? 74 + 4 * Math.sin((kC - 0.55) * 40) : lerp(74, 0.1, eIn((kC - 0.85) / 0.13));
      R = Math.max(0.1, R); cx = BORDE[0]; cy = BORDE[1] - 16;
    }
    if (R < 1300) {
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(cx + R, cy); g.arc(cx, cy, R, 0, 6.283);
      g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
    }
    if (kC >= 0.98 || t < 0.06) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00025", nombre: "Hoyo en uno", crear: () => new EscenaHoyo() });
})();
