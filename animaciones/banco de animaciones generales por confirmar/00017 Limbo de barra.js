"use strict";
/*
 * 00017 · LIMBO DE BARRA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden dos antorchas de playa con una barra de bambú entre ellas (vista en diagonal: él pasa entre los dos
 * palos). Pasa por debajo echado hacia atrás con la jarra en alto: ¡MÁS BAJO! La barra baja y vuelve a pasar, más
 * tumbado. ¡MÁS BAJO! La última vez pasa casi tumbado, con la jarra en equilibrio sobre la tripa, a pocos dedos de la
 * barra. Se levanta de un salto, brinda y la barra se cae al suelo: ¡MÁS BAJO! Las antorchas se apagan.
 */
(() => {
const ESC = 1.4, LP = 86 * ESC;                 // largo de pierna en px
const PALO_A = { x: 430, y: PIES - 34, e: 0.92 }; // palo de atrás
const PALO_D = { x: 628, y: PIES + 20, e: 1.08 }; // palo de delante
const ALTO_PALO = 370;
const ALTURAS = [338, 282, 222, 0];
// pasadas: [inicio, fin, x0, x1, inclinación, piernas]
const PASADAS = [[1.0, 2.9, 170, 860, 0.5, 0.22], [3.75, 5.75, 860, 170, 0.98, 0.36], [6.75, 9.55, 150, 880, 1.36, 0.52]];
const BAJA = [[3.15, 0, 1], [6.05, 1, 2]];
const LEVANTA = 9.55, CAE_BARRA = 10.05, OFF = 10.85;
const cache = cacheTexto();
let SPR17 = null;

function decorado() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const cielo = g.createLinearGradient(0, 0, 0, PIES);
  cielo.addColorStop(0, "#07061a"); cielo.addColorStop(0.7, "#1c1030"); cielo.addColorStop(1, "#3a1a26");
  g.fillStyle = cielo; g.fillRect(-60, -60, W + 120, PIES + 60);
  // luna
  g.fillStyle = "rgba(255,244,214,.9)"; g.beginPath(); g.arc(860, 110, 38, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,244,214,.12)"; g.beginPath(); g.arc(860, 110, 60, 0, 6.283); g.fill();
  // arena
  const arena = g.createLinearGradient(0, PIES - 60, 0, H);
  arena.addColorStop(0, "#5a3b22"); arena.addColorStop(1, "#2a1a0e");
  g.fillStyle = arena; g.fillRect(-60, PIES - 52, W + 120, H - PIES + 112);
  g.fillStyle = "rgba(255,210,140,.18)"; g.fillRect(-60, PIES - 52, W + 120, 2);
  // palmeras en silueta
  const palmera = (x, y, s, lado) => {
    g.save(); g.translate(x, y); g.scale(s * lado, s);
    g.strokeStyle = "#05040c"; g.lineWidth = 16; g.lineCap = "round";
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(30, -180, 10, -330); g.stroke();
    g.fillStyle = "#05040c";
    for (let k = 0; k < 6; k++) {
      const a = -2.7 + k * 0.55;
      g.save(); g.translate(10, -330); g.rotate(a);
      g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(80, -40, 150, 20); g.quadraticCurveTo(80, 0, 0, 8); g.fill();
      g.restore();
    }
    g.restore();
  };
  palmera(40, PIES - 40, 1.1, 1); palmera(990, PIES - 40, 0.95, -1);
  return c;
}
function palo(g, PA, t) {
  const P = PA, top = P.y - ALTO_PALO * P.e, w = 12 * P.e;
  const gr = g.createLinearGradient(P.x - w, 0, P.x + w, 0);
  gr.addColorStop(0, "#6b4a1e"); gr.addColorStop(0.45, "#d9b25a"); gr.addColorStop(1, "#6b4a1e");
  g.fillStyle = gr; g.fillRect(P.x - w / 2, top, w, P.y - top);
  g.fillStyle = "rgba(60,36,10,.8)";
  for (let y = top + 30; y < P.y; y += 48 * P.e) g.fillRect(P.x - w / 2 - 1, y, w + 2, 3);
  // clavijas
  for (const h of ALTURAS.slice(0, 3)) { g.fillStyle = "#4a3010"; g.fillRect(P.x - w / 2 - 6, P.y - h * P.e - 2, w + 12, 5); }
  // antorcha
  g.fillStyle = "#3a2410"; g.beginPath(); g.moveTo(P.x - 14 * P.e, top - 26 * P.e); g.lineTo(P.x + 14 * P.e, top - 26 * P.e); g.lineTo(P.x + 8 * P.e, top + 4); g.lineTo(P.x - 8 * P.e, top + 4); g.closePath(); g.fill();
  g.strokeStyle = "#8a6a30"; g.lineWidth = 2; g.stroke();
}
function sprites() { if (!SPR17) SPR17 = { decorado: decorado() }; return SPR17; }
function rotulo() {
  if (cache.has(1)) return cache.get(1);
  const c = lienzoNuevo(700, 190), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 150);
  gr.addColorStop(0, "#fff6b0"); gr.addColorStop(0.6, "#ffb21a"); gr.addColorStop(1, "#ff5e1a");
  txt(g, "¡MÁS BAJO!", 350, 140, { tam: 120, peso: 400, fam: FC, color: gr, borde: "#16300f", bordeAncho: 14, esp: 5, glow: "rgba(255,120,30,.8)", glowTam: 22 });
  txt(g, "¡MÁS BAJO!", 350, 140, { tam: 120, peso: 400, fam: FC, color: gr, esp: 5 });
  cache.set(1, c);
  return c;
}

class EscenaLimbo extends Escena {
  constructor() {
    super(11.45);
    this.p = new Parts(420);
    this.fase = 0; this.alturaCae = null;
  }
  altura(t) {
    let h = ALTURAS[0];
    for (const [t0, a, b] of BAJA) if (t > t0) h = lerp(ALTURAS[a], ALTURAS[b], eBack(tramo(t, t0, t0 + 0.35)));
    if (this.alturaCae) h = this.alturaCae.h;
    return h;
  }
  /** Extremos de la barra en la pantalla. */
  barra(t) {
    const h = this.altura(t);
    return [[PALO_A.x, PALO_A.y - h * PALO_A.e], [PALO_D.x, PALO_D.y - h * PALO_D.e]];
  }
  /** Pose de limbo: x de la cadera, inclinación hacia atrás, apertura de piernas, sentido de la marcha. */
  limbo(x, th, fi, dir, t, extra) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const giro = -dir * th, s = Math.sin(this.fase);
    const fI = -dir * (fi + 0.12 * s), fD = -dir * (fi - 0.12 * s);
    const yCad = PIES - LP * Math.max(Math.cos(fI), Math.cos(fD)) + 2;
    pose.piernaI = [-5 * Math.max(0, s), fI - giro]; pose.piernaD = [-5 * Math.max(0, -s), fD - giro];
    const m = matAv(x, yCad + Math.abs(s) * 2, ESC, giro, 1, 1, [39, 146]);
    // las manos se colocan en la pantalla y se pasan a unidades de avatar
    const inv = m.inverse(), aAv = (q) => { const r = inv.transformPoint(new DOMPoint(q[0], q[1])); return [r.x, r.y]; };
    const hD = aPant(m, [69, 86]), hI = aPant(m, [9, 86]);
    const brazo = extra.brazos || [[0, -1], [-dir * 0.8, -0.6]];
    pose.manoD = aAv([hD[0] + brazo[0][0] * 90, hD[1] + brazo[0][1] * 90]);
    pose.manoI = aAv([hI[0] + brazo[1][0] * 90, hI[1] + brazo[1][1] * 90]);
    if (extra.jarra) pose.jarra = { inc: -giro + 0.12 * Math.sin(t * 5), nivel: 1 };
    return { pose, m, giro };
  }
  estado() {
    const t = this.t;
    let e;
    const pas = PASADAS.find((P) => t >= P[0] - 0.3 && t < P[1] + 0.3);
    if (t < PASADAS[0][0] - 0.3) {
      e = this.limbo(170, 0.08 * tramo(t, 0.4, 0.7), 0.04, 1, t, { jarra: true, brazos: [[0.2, -1], [-0.8, 0.4]] });
    } else if (pas) {
      const i = PASADAS.indexOf(pas), [t0, t1, x0, x1, th, fi] = pas, dir = x1 > x0 ? 1 : -1;
      const k = eInOut(tramo(t, t0 - 0.3, t0)) * (1 - eInOut(tramo(t, t1, t1 + 0.3)));
      const x = lerp(x0, x1, i === 2 ? lerp(tramo(t, t0, t1), eInOut(tramo(t, t0, t1)), 0.3) : eInOut(tramo(t, t0, t1)));
      const tiembla = i === 2 ? 0.04 * Math.sin(t * 9) * Math.sin(t * 2.3) : 0;
      const brazos = i === 2 ? [[0.8 * dir, 0.2], [-0.95 * dir, 0.1]] : i === 1 ? [[0.3, -0.95], [-dir * 0.9, -0.4]] : [[0.1, -1], [-dir * 0.85, -0.5]];
      e = this.limbo(x, th * k + tiembla, 0.04 + (fi - 0.04) * k, dir, t, { jarra: i < 2, brazos });
      e.pose.cara = i === 0 ? "guino" : i === 1 ? "sorpresa" : t < 8.2 ? "sorpresa" : "dormido";
      e.pose.rc = -dir * 0.18 * k;
      e.pasada = i; e.k = k;
    } else if (t < LEVANTA) {
      // entre pasadas: de pie, mira la barra
      const prev = PASADAS.filter((P) => P[1] + 0.3 <= t).pop(), x = prev ? prev[3] : 170;
      e = this.limbo(x, 0, 0.04, prev && prev[3] < prev[2] ? -1 : 1, t, { jarra: !(prev && PASADAS.indexOf(prev) === 1 && t > 6.25), brazos: [[0.15, -1], [-0.6, 0.6]] });
      e.pose.cara = "risa";
      e.pose.rc = 0.1 * Math.sin(t * 6);
    } else {
      // se levanta de un salto y brinda
      const k = eBack(tramo(t, LEVANTA, LEVANTA + 0.35)), x = 880;
      e = this.limbo(x, 1.36 * (1 - k), 0.52 * (1 - k) + 0.04, 1, t, { jarra: true, brazos: [[0.1 + 0.05 * Math.sin(t * 8), -1], [-0.3, 0.8]] });
      e.pose.cara = t < LEVANTA + 0.5 ? "sorpresa" : "risa";
      const salto = t > LEVANTA && t < LEVANTA + 0.45 ? -Math.sin(tramo(t, LEVANTA, LEVANTA + 0.45) * Math.PI) * 40 : 0;
      e.m = e.m.translate(0, salto / ESC);
    }
    return e;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const andando = PASADAS.some((P) => t > P[0] && t < P[1]);
    if (andando) this.fase += dt * (t > 6.7 ? 6 : 9);
    // antorchas
    for (const [PA, t0] of [[PALO_A, 0.25], [PALO_D, 0.45]]) {
      if (t < t0 || t > OFF + 0.1) continue;
      const top = PA.y - ALTO_PALO * PA.e - 26 * PA.e;
      const n = t < t0 + 0.15 ? 8 : Math.random() < 0.8 ? 2 : 1;
      for (let i = 0; i < n; i++) p.nueva(P.LLAMA, PA.x + azar(-10, 10) * PA.e, top + 4, azar(-20, 20), azar(-160, -60), azar(0.25, 0.5), azar(26, 44) * PA.e, Math.random() < 0.3 ? 1 : 0);
    }
    for (const [t0, , b] of BAJA) this.una("baja" + b, t > t0 + 0.2, () => temblar(5, 0.15));
    // la barra se cae al suelo
    this.una("cae", t > CAE_BARRA, () => { this.alturaCae = { h: this.altura(t), v: 0 }; });
    if (this.alturaCae) {
      const C = this.alturaCae;
      C.v += 1400 * dt; C.h -= C.v * dt;
      if (C.h <= 6) {
        C.h = 6;
        if (C.v > 120) { temblar(12, 0.25); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, azar(PALO_A.x, PALO_D.x), PIES + azar(-30, 10), azar(-200, 200), azar(-60, -10), azar(0.5, 0.9), azar(26, 44)); }
        C.v = -C.v * 0.3; if (Math.abs(C.v) < 60) C.v = 0;
      }
    }
    this.una("salta", t > LEVANTA + 0.3, () => {
      temblar(8, 0.2);
      for (let i = 0; i < 120; i++) p.nueva(P.CONFETI, azar(100, W - 100), azar(-150, -10), azar(-60, 60), azar(40, 140), azar(3, 5), azar(9, 14), i % 5);
    });
    // gotas de la jarra de la tripa cuando se tambalea
    if (t > 7.4 && t < 9.4 && Math.random() < 0.08) { const q = this.puntoTripa(); if (q) p.nueva(P.GOTA, q[0] + azar(-14, 14), q[1] - 50, azar(30, 90), azar(-140, -60), 0.7, azar(2.5, 4)); }
    p.alfa = 1 - tramo(t, OFF, OFF + 0.4);
    p.actualizar(dt);
  }
  puntoTripa() {
    const e = this.estado();
    if (e.pasada !== 2) return null;
    return aPant(e.m, [62, 122]);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), S = sprites();
    fondo(g, "#000");
    const encendido = Math.min(1, tramo(t, 0.2, 0.75) * 1.2) * (1 - tramo(t, OFF, OFF + 0.5));
    g.save(); g.globalAlpha = encendido * 0.85;
    g.drawImage(S.decorado, -60, -60);
    g.restore();
    // luz de las antorchas
    g.save(); g.globalCompositeOperation = "lighter";
    for (const PA of [PALO_A, PALO_D]) { g.globalAlpha = 0.45 * encendido * (0.9 + 0.1 * Math.sin(t * 13 + PA.x)); g.drawImage(BLOB.naranja, PA.x - 330, PA.y - ALTO_PALO * PA.e - 250, 660, 660); }
    g.restore();
    const [A, B] = this.barra(t);
    const xCruce = lerp(A[0], B[0], 0.5), yCruce = lerp(A[1], B[1], 0.5);
    g.save(); g.globalAlpha = encendido;
    palo(g, PALO_A, t);
    // mitad de atrás de la barra
    const tramoBarra = (P0, P1) => {
      g.strokeStyle = "#5a3a12"; g.lineWidth = 11; g.lineCap = "round";
      g.beginPath(); g.moveTo(P0[0], P0[1]); g.lineTo(P1[0], P1[1]); g.stroke();
      g.strokeStyle = "#e3bf62"; g.lineWidth = 7;
      g.beginPath(); g.moveTo(P0[0], P0[1]); g.lineTo(P1[0], P1[1]); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(P0[0], P0[1] - 2); g.lineTo(P1[0], P1[1] - 2); g.stroke();
    };
    tramoBarra(A, [xCruce, yCruce]);
    pintarAvatar(g, e.m, e.pose, t);
    // la jarra en equilibrio sobre la tripa
    if (e.pasada === 2) {
      const q = aPant(e.m, [62, 122]), bam = 0.18 * Math.sin(t * 4.3) * Math.sin(t * 1.7);
      g.save(); g.translate(q[0], q[1]); g.rotate(bam); g.scale(ESC, ESC);
      dibujarJarra(g, [-17, -18], 0, 0.95, "asa", t); dibujarJarra(g, [-17, -18], 0, 0.95, "cuerpo", t);
      g.restore();
    }
    tramoBarra([xCruce, yCruce], B);
    palo(g, PALO_D, t);
    g.restore();
    this.p.dibujar(g);
    // ¡MÁS BAJO!
    for (const [t0, s0, x, y, rot] of [[2.95, 0.62, 300, 120, -0.08], [5.8, 0.8, 700, 120, 0.07], [LEVANTA + 0.35, 1.05, W / 2, 112, -0.04]]) {
      if (t < t0) continue;
      const fin = t0 > 9 ? OFF : t0 + 1.0, a = (1 - tramo(t, fin, fin + 0.3)) * encendido;
      if (a <= 0) continue;
      const R = rotulo(), k = tramo(t, t0, t0 + 0.2), s = eBack(k) * s0 * (1 + 0.03 * Math.sin(t * 10));
      g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.scale(s, s); g.drawImage(R, -R.width / 2, -R.height / 2); g.restore();
    }
    if (encendido < 1) { g.fillStyle = `rgba(0,0,0,${1 - encendido})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00017", nombre: "Limbo de barra", crear: () => new EscenaLimbo() });
})();
