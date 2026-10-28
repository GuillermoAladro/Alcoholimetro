"use strict";
/*
 * 00110 · CARRERA DE CAMAREROS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo, cada uno en su calle, esperan el semáforo con una bandeja y una jarra llena. ¡YA! Guillermo
 * corre con cuidado y salta una silla y un cubo sin derramar nada; Rodrigo se bebe la jarra por el camino (inclina
 * la bandeja y glu, glu), acelera, salta sus obstáculos y llega primero (¡META!). Cuando Guillermo llega con su
 * jarra llena, Rodrigo levanta la bandeja: su jarra está vacía. Cae la última gota.
 */
(() => {
const DUR = 10.5, T_YA = 1.0, LINEA = 700, T_META = 5.9, T_LLEGA = 6.9;
// calles: la de atrás (Guillermo) y la de delante (Rodrigo)
const CALLE = [{ y: 386, esc: 0.95 }, { y: 592, esc: 1.25 }];
const lin = (u) => u;
const XG = [[T_YA, 150], [T_LLEGA, 720, lin], [7.6, 795, eOut]];
const XR = [[T_YA, 60], [1.9, 150, lin], [2.9, 190, lin], [4.6, 520, lin], [T_META, 720, lin], [6.7, 890, eOut]];
// obstáculos: [calle, tipo, x]
const OBST = [[0, "silla", 330], [0, "cubo", 560], [1, "cubo", 382], [1, "silla", 600]];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
/** Bandeja con una jarra encima; (0, 0) = la mano por debajo. Unidades de avatar. */
function bandeja(g, m, ang, nivel, t) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  dibujarJarra(g, [-17, -21], 0, nivel, "asa", t); dibujarJarra(g, [-17, -21], 0, nivel, "cuerpo", t);
  const gr = g.createLinearGradient(-26, 0, 26, 0);
  gr.addColorStop(0, "#7d868f"); gr.addColorStop(0.45, "#f3f6f8"); gr.addColorStop(1, "#8b949c");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, -1.5, 27, 4.2, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(60,66,72,.8)"; g.lineWidth = 1; g.stroke();
  g.restore();
}
function silla(g, x, y, e) {
  g.save(); g.translate(x, y); g.scale(e, e);
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(0, 0, 34, 6, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(-24, 0, 24, 0);
  gr.addColorStop(0, "#5a3014"); gr.addColorStop(0.5, "#a0622b"); gr.addColorStop(1, "#5a3014");
  g.fillStyle = gr;
  g.fillRect(-22, -52, 6, 52); g.fillRect(16, -52, 6, 52);           // patas
  g.fillRect(-24, -58, 48, 9);                                        // asiento
  g.fillRect(16, -118, 7, 64); g.fillRect(-2, -118, 25, 8); g.fillRect(-2, -96, 25, 6); // respaldo
  g.fillStyle = "rgba(255,220,170,.3)"; g.fillRect(-24, -58, 48, 2.5);
  g.restore();
}
function cubo(g, x, y, e, t) {
  g.save(); g.translate(x, y); g.scale(e, e);
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(0, 0, 30, 5, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#9aa3ab"; g.lineWidth = 2.5; g.beginPath(); g.arc(0, -44, 22, Math.PI, 0); g.stroke();
  const gr = g.createLinearGradient(-24, 0, 24, 0);
  gr.addColorStop(0, "#3d5a73"); gr.addColorStop(0.45, "#8fb7d6"); gr.addColorStop(1, "#2f4a60");
  g.fillStyle = gr; g.beginPath(); g.moveTo(-24, -44); g.lineTo(24, -44); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); g.fill();
  g.fillStyle = "#c9e6ff"; g.beginPath(); g.ellipse(0, -44, 24, 5, 0, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-15 + i * 7.5, -47 + Math.sin(t * 5 + i) * 1.2, 4, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-16, -38, 3, 32);
  g.restore();
}

class CarreraCamareros extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(380);
    this.cache = cacheTexto();
    this.fase = [0, 1.6];
    this.gota = null;
  }
  x(i, t) { return pista(t, i ? XR : XG); }
  corriendo(i, t) { return t > T_YA && t < (i ? 6.6 : 7.5); }
  salto(i, x) {
    for (const [c, tipo, ox] of OBST) if (c === i) { const u = (x - (ox - 70)) / 140; if (u > 0 && u < 1) return Math.sin(Math.PI * u) * (tipo === "silla" ? 1 : 0.75); }
    return 0;
  }
  estado() {
    const t = this.t, res = [];
    for (let i = 0; i < 2; i++) {
      const C = CALLE[i], q = i ? "rodrigo" : undefined;
      const x = this.x(i, t), corre = this.corriendo(i, t), salta = this.salto(i, x);
      const pose = { quien: q, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
      let y = C.y, sy = 1, sx = 1, giro = 0;
      // agachados en la salida
      if (t < T_YA) { const k = Math.sin(Math.PI * tramo(t, 0.3, T_YA + 0.15)); sy = 1 - 0.07 * k; giro = 0.06 * k; pose.cara = "guino"; pose.rc = i ? -0.08 : 0.08; }
      if (corre) {
        const a = andar(this.fase[i], 1.5);
        pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote * C.esc; giro = 0.07;
        if (salta > 0) { y -= salta * 95 * C.esc; pose.piernaI = [-16 * salta, 0.35 * salta]; pose.piernaD = [-12 * salta, -0.45 * salta]; pose.cara = "sorpresa"; }
      }
      // mano de la bandeja (arriba, como un camarero) y la otra braceando
      let mano = i ? [88, 78] : [91, 70], ang = 0.06 * Math.sin(t * 11 + i), nivel = 1;
      if (corre) mano = [mano[0] + Math.sin(this.fase[i]) * 1.5, mano[1] + Math.abs(Math.sin(this.fase[i])) * 2];
      pose.manoI = corre ? (i ? [6 + 12 * Math.sin(this.fase[i]), 150] : [5 + 12 * Math.sin(this.fase[i]), 152]) : (i ? [9, 157] : [9, 160]);
      if (i === 0) {
        // Guillermo: con mucho cuidado
        if (corre && salta <= 0) pose.cara = t > 4.25 && t < 4.9 ? "sorpresa" : "sonrisa";
        if (t > 4.25 && t < 4.9) pose.rc = 0.12 * Math.sin(Math.PI * tramo(t, 4.25, 4.9)); // ve que le adelanta
        if (salta > 0) ang += 0.15 * Math.sin(t * 30) * salta;
        if (t > 7.6) {
          pose.cara = t < 8.35 ? "sorpresa" : "risa"; pose.rc = 0.14 * eInOut(tramo(t, 7.6, 7.9)) - (t > 8.35 ? 0.06 * Math.sin((t - 8.35) * 12) : 0);
        }
      } else {
        // Rodrigo: inclina la bandeja y se bebe la jarra corriendo
        const kB = eInOut(tramo(t, 1.85, 2.15)) * (1 - eInOut(tramo(t, 2.75, 3.0)));
        if (kB > 0) {
          pose.rc = -0.3 * kB; ang = lerp(ang, -1.78, kB);
          const b = boca(pose.rc, "rodrigo"), r = rot2([0, -39], ang);
          mano = mezcla(mano, [b[0] - r[0] + 1, b[1] - r[1] + 1], kB);
          if (kB > 0.5) pose.cara = "dormido";
        }
        nivel = 1 - tramo(t, 2.1, 2.75);
        if (t > 3.0 && salta <= 0 && corre) pose.cara = "risa";
        if (t > 4.25 && t < 4.9) pose.rc = -0.1 * Math.sin(Math.PI * tramo(t, 4.25, 4.9));
        // celebra y, cuando llega Guillermo, enseña la jarra vacía
        if (t > T_META + 0.15) {
          const k = eBack(tramo(t, T_META + 0.15, T_META + 0.45));
          pose.manoI = mezcla(pose.manoI, [-22, 40], k * (1 - eInOut(tramo(t, 7.0, 7.3))));
          if (!corre) pose.cara = "risa";
        }
        if (t > 7.4) {
          const k = eBack(tramo(t, 7.4, 7.75));
          mano = mezcla(mano, [96, 26], k); ang = lerp(ang, -0.35, k);
          pose.cara = t < 8.6 ? "risa" : "guino"; pose.rc = -0.1 * eInOut(tramo(t, 7.4, 7.7));
        }
      }
      pose.manoD = mano;
      pose.objD = (g, m) => bandeja(g, m, ang, nivel, t);
      const m = matAv(x, y, C.esc, giro, sx, sy);
      res.push({ pose, m, x, salta, nivel, ang });
    }
    return res;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (let i = 0; i < 2; i++) if (this.corriendo(i, t)) this.fase[i] += dt * 15;
    const e = this.estado();
    this.una("ya", t > T_YA, () => temblar(8, 0.2));
    // polvillo al correr
    for (let i = 0; i < 2; i++) if (this.corriendo(i, t) && e[i].salta <= 0 && Math.random() < 14 * dt)
      p.nueva(P.POLVO, e[i].x - 20, CALLE[i].y - 4, azar(-140, -50), azar(-30, -5), azar(0.4, 0.7), azar(14, 26) * CALLE[i].esc);
    // aterrizajes
    for (const [c, tipo, ox] of OBST) this.una("cae" + c + ox, this.x(c, t) > ox + 70, () => {
      temblar(5, 0.12);
      for (let k = 0; k < 8; k++) p.nueva(P.POLVO, ox + 70, CALLE[c].y - 4, azar(-120, 120), azar(-40, -5), azar(0.4, 0.8), azar(18, 30));
    });
    // gotas de la jarra al beber
    if (t > 2.15 && t < 2.75 && Math.random() < 0.4) {
      const q = aPant(e[1].m, boca(e[1].pose.rc, "rodrigo"));
      p.nueva(P.GOTA, q[0] + 4, q[1] + 6, azar(-80, -10), azar(-20, 30), 0.7, azar(3, 4.5));
    }
    this.una("meta", t > T_META, () => {
      temblar(18, 0.4);
      for (let k = 0; k < 110; k++) p.nueva(P.CONFETI, azar(560, 860), azar(-30, 40), azar(-180, 180), azar(0, 150), azar(2.5, 3.8), azar(9, 15), k % 5);
      for (let k = 0; k < 24; k++) { const a = azar(-Math.PI, 0), v = azar(250, 600); p.nueva(P.CHISPA, LINEA, 420, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 14)); }
    });
    this.una("llega", t > T_LLEGA, () => temblar(5, 0.15));
    // la última gota de la jarra vacía
    this.una("gota", t > 7.85, () => { const q = aPant(e[1].m, [e[1].pose.manoD[0] + 14 * Math.cos(e[1].ang) + 14, e[1].pose.manoD[1] - 6]); this.gota = { x: q[0], y: q[1], vy: 0, t0: t }; });
    if (this.gota) { this.gota.vy += 900 * dt; this.gota.y += this.gota.vy * dt; if (this.gota.y > CALLE[1].y && !this.gota.plic) { this.gota.plic = t; this.gota.y = CALLE[1].y; this.gota.vy = 0; } }
    p.suelo = (x) => (x > 640 && x < 760 ? 1e9 : 600);
    p.actualizar(dt);
  }
  escenario() {
    if (this.cache.has("f")) return this.cache.get("f");
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    // pared con una barra al fondo
    const gp = g.createLinearGradient(0, 0, 0, 330);
    gp.addColorStop(0, "#0b0706"); gp.addColorStop(1, "#24160d");
    g.fillStyle = gp; g.fillRect(0, 0, W, 330);
    g.fillStyle = "#3b2414"; g.fillRect(0, 262, W, 68);
    g.fillStyle = "#6b4122"; g.fillRect(0, 258, W, 8);
    g.fillStyle = "rgba(255,210,150,.25)"; g.fillRect(0, 258, W, 2);
    for (let x = 30; x < W; x += 90) {
      for (let k = 0; k < 3; k++) {
        const bx = x + k * 18, h = 34 + ((x + k * 7) % 15);
        g.fillStyle = ["#2e5d2a", "#6b3a12", "#284b6b"][(x / 90 + k) % 3 | 0]; rectR(g, bx, 258 - h, 10, h, 3); g.fill();
        g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(bx + 2, 258 - h + 6, 2, h - 10);
      }
    }
    // suelo y calles
    const gs = g.createLinearGradient(0, 330, 0, H);
    gs.addColorStop(0, "#2a1a10"); gs.addColorStop(1, "#120a05");
    g.fillStyle = gs; g.fillRect(0, 330, W, H - 330);
    g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(0, 348, W, 3); g.fillRect(0, 426, W, 4);
    g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, 330, W, 2);
    // línea de meta a cuadros
    for (let r = 0; r < 12; r++) {
      const y0 = 330 + r * 22.5, y1 = y0 + 22.5, k0 = (y0 - 330) / 270, k1 = (y1 - 330) / 270;
      for (let col = 0; col < 2; col++) {
        const w0 = 14 + 16 * k0, w1 = 14 + 16 * k1, x0 = LINEA - 10 + 18 * k0, x1 = LINEA - 10 + 18 * k1;
        g.fillStyle = (r + col) % 2 ? "#111" : "#f4f4f0";
        g.beginPath(); g.moveTo(x0 + col * w0, y0); g.lineTo(x0 + (col + 1) * w0, y0); g.lineTo(x1 + (col + 1) * w1, y1); g.lineTo(x1 + col * w1, y1); g.closePath(); g.fill();
      }
    }
    this.cache.set("f", c);
    return c;
  }
  bandera(g, t) {
    const x = LINEA + 6, y0 = 348, y1 = 118;
    g.fillStyle = "#c9ced3"; g.fillRect(x - 3, y1, 6, y0 - y1);
    g.save(); g.translate(x + 3, y1 + 4);
    for (let r = 0; r < 4; r++) for (let col = 0; col < 6; col++) {
      const ola = (cc) => Math.sin(t * 7 - cc * 0.9) * 4 * (cc / 6);
      g.fillStyle = (r + col) % 2 ? "#111" : "#f7f7f2";
      const x0 = col * 13, x1 = x0 + 13;
      g.beginPath(); g.moveTo(x0, r * 11 + ola(col)); g.lineTo(x1, r * 11 + ola(col + 1)); g.lineTo(x1, r * 11 + 11 + ola(col + 1)); g.lineTo(x0, r * 11 + 11 + ola(col)); g.closePath(); g.fill();
    }
    g.restore();
  }
  semaforo(g, t) {
    const a = 1 - tramo(t, T_YA + 0.5, T_YA + 0.8);
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    rectR(g, 422, 40, 180, 66, 18); g.fillStyle = "#15171a"; g.fill(); g.strokeStyle = "#555b62"; g.lineWidth = 3; g.stroke();
    const luces = [t > 0.35, t > 0.68, t > T_YA];
    for (let k = 0; k < 3; k++) {
      const cx = 460 + k * 52, verde = k === 2, on = verde ? luces[2] : luces[k] && !luces[2];
      g.fillStyle = on ? (verde ? "#2bff5b" : "#ff3030") : "#2a2d31";
      g.beginPath(); g.arc(cx, 73, 19, 0, 6.283); g.fill();
      if (on) { g.globalCompositeOperation = "lighter"; g.drawImage(verde ? BLOB.verde : BLOB.rojo, cx - 45, 28, 90, 90); g.globalCompositeOperation = "source-over"; }
    }
    g.restore();
    if (t > T_YA && t < T_YA + 0.7) {
      const k = eBack(tramo(t, T_YA, T_YA + 0.14));
      g.save(); g.translate(512, 170); g.scale(k, k); g.rotate(-0.06);
      txt(g, "¡YA!", 0, 0, { tam: 72, peso: 400, fam: FC, color: "#fffdf5", borde: "#0a6b2a", bordeAncho: 9, alfa: 1 - tramo(t, T_YA + 0.45, T_YA + 0.7), esp: 3 });
      g.restore();
    }
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(620, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡META!", 310, 168, { tam: 170, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 13, esp: 6, glow: "rgba(255,170,30,.85)", glowTam: 26 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.escenario(), 0, 0);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28; g.drawImage(BLOB2.oroClaro, 100, 40, 824, 520); g.restore();
    this.bandera(g, t);
    // calle de atrás: obstáculos y Guillermo
    for (const [c, tipo, ox] of OBST) if (c === 0) (tipo === "silla" ? silla : cubo)(g, ox, CALLE[0].y, CALLE[0].esc, t);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    // calle de delante
    for (const [c, tipo, ox] of OBST) if (c === 1) (tipo === "silla" ? silla : cubo)(g, ox, CALLE[1].y, CALLE[1].esc, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.p.dibujar(g);
    // la última gota
    if (this.gota) {
      const G = this.gota;
      if (!G.plic) { g.fillStyle = "#ffb51f"; g.beginPath(); g.ellipse(G.x, G.y, 4.5, 7, 0, 0, 6.283); g.fill(); }
      else if (t - G.plic < 0.9) {
        const k = tramo(t, G.plic, G.plic + 0.9);
        g.strokeStyle = `rgba(255,190,60,${1 - k})`; g.lineWidth = 2; g.beginPath(); g.ellipse(G.x, G.y, 6 + 26 * k, 2 + 5 * k, 0, 0, 6.283); g.stroke();
        txt(g, "plic", G.x + 30, G.y - 22 - 10 * k, { tam: 30, peso: 400, fam: FC, color: "#ffd34d", alfa: 1 - k, esp: 1 });
      }
    }
    // glu, glu
    if (t > 2.15 && t < 2.75) {
      const q = aPant(e[1].m, [39, -10]);
      txt(g, "GLU GLU", q[0] - 20, q[1] - 6, { tam: 34, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a1d00", bordeAncho: 6, alfa: Math.sin(Math.PI * tramo(t, 2.15, 2.75)), esp: 2 });
    }
    this.semaforo(g, t);
    // ¡META!
    if (t > T_META) {
      const d = t - T_META, k = tramo(d, 0, 0.16), s = lerp(2.7, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8)) * lerp(1, 0.8, eInOut(tramo(t, 7.3, 7.7)));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(400, lerp(118, 104, eInOut(tramo(t, 7.3, 7.7)))); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // Guillermo no se lo cree
    if (t > 7.95) {
      const q = aPant(e[0].m, [39, -4]);
      bocadillo(g, q[0] - 120, q[1] - 40, "¿¡VACÍA!?", q[0] - 14, q[1] + 4, tramo(t, 7.95, 8.2) * (1 - tramo(t, 9.6, 9.85)), 34);
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, DUR - 0.55, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00110", nombre: "Carrera de camareros", crear: () => new CarreraCamareros() });
})();
