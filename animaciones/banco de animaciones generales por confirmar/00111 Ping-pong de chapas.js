"use strict";
/*
 * 00111 · PING-PONG DE CHAPAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la lámpara sobre la mesa de ping-pong. Guillermo saca con una chapa de botellín por pelota (¡PING!)
 * y Rodrigo la devuelve (¡PONG!). El peloteo se acelera cada vez más, con estelas, hasta que Rodrigo remata con
 * todas sus fuerzas: la chapa sale ardiendo y se queda incrustada en la pala de Guillermo, que la mira pasmado.
 */
(() => {
const ESC = 1.55, XG = 168, XR = 856, MESA = 424, M0 = 300, M1 = 724, RED = 512, DUR = 10.2;
// golpes: [tiempo, quién (0 Guillermo, 1 Rodrigo)]
const GOLPES = [1.4, 2.3, 3.08, 3.76, 4.34, 4.84, 5.27, 5.64, 5.96, 6.24, 6.49, 6.72, 6.94].map((t, i) => [t, i % 2]);
const T_REMATE = 7.2, T_CLAVA = 7.36;
GOLPES.push([T_REMATE, 1]);

/** Chapa de botellín centrada en (x, y), radio r, girando. */
function chapa(g, x, y, r, giro) {
  g.save(); g.translate(x, y); g.scale(Math.max(0.28, Math.abs(Math.cos(giro))), 1);
  g.beginPath();
  for (let i = 0; i < 42; i++) { const a = (i / 42) * 6.283, rr = i % 2 ? r * 0.84 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath();
  const gr = g.createLinearGradient(-r, -r, r, r);
  gr.addColorStop(0, "#fff1a8"); gr.addColorStop(0.5, "#e0a400"); gr.addColorStop(1, "#7a5200");
  g.fillStyle = gr; g.fill(); g.strokeStyle = "#5a3c00"; g.lineWidth = Math.max(0.6, r * 0.08); g.stroke();
  g.fillStyle = "#c8102e"; g.beginPath(); g.arc(0, 0, r * 0.62, 0, 6.283); g.fill();
  g.fillStyle = "#fff6d0"; estrella(g, 0, 0, r * 0.38, r * 0.16, 0); g.fill();
  g.restore();
}
/** Pala: (0, 0) = la mano en el mango; `a` = giro (0: hacia arriba). Unidades de avatar. */
function pala(g, m, a, clavada, t) {
  g.save(); g.translate(m[0], m[1]); g.rotate(a);
  const gm = g.createLinearGradient(-2.5, 0, 2.5, 0);
  gm.addColorStop(0, "#7a4a1c"); gm.addColorStop(0.5, "#d9a066"); gm.addColorStop(1, "#7a4a1c");
  g.fillStyle = gm; rectR(g, -2.8, -12, 5.6, 16, 1.8); g.fill();
  g.fillStyle = "#151515"; g.beginPath(); g.ellipse(0, -24, 12.5, 13.5, 0, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(-4, -28, 1, 0, -24, 12.5);
  gr.addColorStop(0, "#ff7a6a"); gr.addColorStop(1, "#a8141a");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, -24, 11.2, 12.2, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(-4, -29, 4, 2.4, -0.6, 0, 6.283); g.fill();
  if (clavada) {
    g.strokeStyle = "rgba(30,0,0,.9)"; g.lineWidth = 1;
    for (let i = 0; i < 7; i++) { const b = (i / 7) * 6.283 + 0.3; g.beginPath(); g.moveTo(Math.cos(b) * 5, -24 + Math.sin(b) * 5); g.lineTo(Math.cos(b + 0.25) * 10.5, -24 + Math.sin(b + 0.25) * 10.5); g.stroke(); }
    chapa(g, 0, -24, 6.4, 0);
  }
  g.restore();
}

class PingPong extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(380);
    this.cache = cacheTexto();
    this.palabras = [];
  }
  /** ¿qué golpe toca? índice del último golpe dado antes de t (-1 si aún no) */
  ultimo(t) { let k = -1; for (let i = 0; i < GOLPES.length; i++) if (GOLPES[i][0] <= t) k = i; return k; }
  /** poses en el instante t: [Guillermo, Rodrigo] con la posición de la pala en pantalla */
  poses(t, mirar = true) {
    const res = [];
    const clavada = t >= T_CLAVA, dC = t - T_CLAVA;
    const pelota = mirar && t < T_CLAVA ? this.pelota(t) : null;
    for (let i = 0; i < 2; i++) {
      const q = i ? "rodrigo" : undefined, s = i ? -1 : 1;
      const pose = { quien: q, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
      // golpe más cercano de este jugador
      let d = 9;
      for (const [tg, j] of GOLPES) if (j === i && Math.abs(t - tg) < Math.abs(d)) d = t - tg;
      const listo = i ? [-26, 128] : [104, 128];
      const atras = i ? [-14, 146] : [92, 146], delante = i ? [-36, 112] : [114, 112];
      let mano = listo, ang = s * 0.55;
      if (d > -0.22 && d < 0) { const k = eInOut(tramo(d, -0.22, -0.08)); mano = mezcla(listo, atras, k); ang = s * lerp(0.55, 1.0, k); }
      if (d >= -0.08 && d < 0.2) { const k = eOut(tramo(d, -0.08, 0.02)), k2 = eInOut(tramo(d, 0.04, 0.2)); mano = mezcla(mezcla(atras, delante, k), listo, k2); ang = s * lerp(lerp(1.0, 0.25, k), 0.55, k2); }
      // el remate de Rodrigo: arriba del todo y zas
      if (i === 1 && t > 6.98 && t < T_REMATE + 0.4) {
        const k = eOut(tramo(t, 6.98, 7.12)), k2 = eIn(tramo(t, T_REMATE - 0.06, T_REMATE)), k3 = eInOut(tramo(t, T_REMATE + 0.1, T_REMATE + 0.4));
        mano = mezcla(mezcla(mezcla(listo, [-12, 40], k), [-44, 118], k2), listo, k3); ang = lerp(lerp(-0.4, 0.4, k), -1.1, k2);
        pose.cara = "guino";
      }
      // la cabeza sigue a la chapa
      if (pelota) pose.rc = clamp((pelota[0] - (i ? XR : XG)) / 700, -0.5, 0.5) * 0.25 + 0.04 * Math.sin(t * 3 + i);
      const vel = tramo(t, 3.5, 6.5);
      if (t > 1.6 && t < T_CLAVA) pose.cara = i === 1 && t > 6.98 ? "guino" : vel > 0.5 ? "sorpresa" : i ? "risa" : "sonrisa";
      if (t < 1.6) pose.cara = t > 0.6 ? (i ? "guino" : "sonrisa") : "sonrisa";
      if (t < T_CLAVA) pose.puntas = 0.5 * tramo(t, 4.5, 7.0);
      // Guillermo enseña la chapa y saca
      let otra = i ? [74, 152] : [5, 152];
      if (i === 0 && t < 1.45) {
        const k = eInOut(tramo(t, 0.55, 0.9)), k2 = eInOut(tramo(t, 1.1, 1.3));
        otra = mezcla(mezcla([5, 152], [8, 86], k), [30, 112], k2);
      }
      let dx = 0, sy = 1 + 0.012 * Math.sin(t * 6 + i);
      // agachados y atentos
      sy -= 0.04 * vel;
      // después del remate
      if (clavada) {
        if (i === 0) {
          dx = -28 * eOut(tramo(dC, 0, 0.1)) * (1 - eInOut(tramo(dC, 0.3, 0.9)));
          pose.cara = dC < 0.9 ? "sorpresa" : dC < 2.0 ? "borracho" : "sorpresa";
          const k = eInOut(tramo(dC, 0.55, 0.95));
          mano = mezcla(mezcla(delante, listo, eOut(tramo(dC, 0, 0.3))), [74, 74], k);
          ang = lerp(lerp(0.25, 0.55, eOut(tramo(dC, 0, 0.3))), -0.15, k) + (dC < 0.5 ? Math.sin(dC * 70) * 0.25 * (1 - dC / 0.5) : 0);
          pose.rc = 0.1 * k + 0.05 * Math.sin(dC * 5) * tramo(dC, 1, 1.4);
          pose.puntas = 0.8 * (1 - tramo(dC, 0.4, 1.4));
        } else {
          pose.cara = dC < 0.3 ? "sorpresa" : "risa";
          const k = eInOut(tramo(dC, 0.4, 0.7));
          mano = mezcla(mano, [-28, 60 + 4 * Math.sin(t * 14)], k); ang = lerp(ang, -0.3, k);
          otra = [76 + 2 * Math.sin(t * 20), 132]; // se parte de risa (mano a la tripa)
          pose.rc = -0.12 * k + 0.05 * Math.sin(t * 14) * k;
          sy = 1 - 0.03 * Math.abs(Math.sin(t * 14)) * k;
        }
      }
      if (i) { pose.manoI = mano; pose.brazoIDelante = true; pose.manoD = otra; pose.objI = (g, m) => pala(g, m, ang, false, t); }
      else {
        pose.manoD = mano; pose.manoI = otra; pose.objD = (g, m) => pala(g, m, ang, clavada, t);
        if (t < 1.25 && t > 0.6) pose.objI2 = (g, m) => chapa(g, m[0] + 2, m[1] - 5, 4.6, t * 3);
      }
      const m = matAv((i ? XR : XG) + dx, PIES, ESC, 0, 1, sy);
      const cabeza = rot2([0, -24], ang);
      res.push({ pose, m, pala: aPant(m, [mano[0] + cabeza[0], mano[1] + cabeza[1]]) });
    }
    return res;
  }
  /** posición de la chapa (pantalla) en t, o null */
  pelota(t) {
    if (t < 1.1) return null;
    if (t < 1.4) { // saque: la lanza hacia arriba
      const a = this.palaEn(0, 1.4), u = tramo(t, 1.1, 1.4);
      return [lerp(a[0] - 18, a[1] ? a[0] : a[0], u), a[1] - 10 - 120 * Math.sin(Math.PI * (0.5 + 0.5 * u)) * (1 - u) - 120 * (1 - u) * 0];
    }
    const k = this.ultimo(t);
    if (k < 0 || k >= GOLPES.length - 1) {
      if (t >= T_REMATE) { // el remate: en línea recta hacia la pala de Guillermo
        const a = this.palaEn(1, T_REMATE), b = this.palaEn(0, T_CLAVA), u = tramo(t, T_REMATE, T_CLAVA);
        return mezcla(a, b, u);
      }
      return null;
    }
    const [t0, j] = GOLPES[k], [t1, j1] = GOLPES[k + 1];
    const a = this.palaEn(j, t0), b = this.palaEn(j1, t1), dur = t1 - t0;
    const bx = lerp(RED, b[0], 0.58), by = MESA - 7, tb = t0 + dur * 0.55;
    const h1 = 40 + 60 * clamp(dur - 0.2, 0, 0.8), h2 = 30 + 40 * clamp(dur - 0.2, 0, 0.8);
    if (t < tb) { const u = (t - t0) / (tb - t0); return [lerp(a[0], bx, u), lerp(a[1], by, u) - h1 * 4 * u * (1 - u) - (a[1] > by ? 0 : 0)]; }
    const u = (t - tb) / (t1 - tb); return [lerp(bx, b[0], u), lerp(by, b[1], u) - h2 * 4 * u * (1 - u)];
  }
  palaEn(i, t) {
    const k = i + "_" + t;
    if (!this._palas) this._palas = new Map();
    if (!this._palas.has(k)) this._palas.set(k, this.poses(t, false)[i].pala);
    return this._palas.get(k);
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    GOLPES.forEach(([tg, j], n) => this.una("g" + n, t >= tg, () => {
      const q = this.palaEn(j, tg), dur = n + 1 < GOLPES.length ? GOLPES[n + 1][0] - tg : 0.2;
      if (dur >= 0.25 || n < 8) this.palabras.push({ s: j ? "¡PONG!" : "¡PING!", x: q[0] + (j ? -40 : 40), y: q[1] - 70, t0: tg, j });
      for (let i = 0; i < 6; i++) { const a = azar(0, 6.283), v = azar(80, 240); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.15, 0.3), azar(5, 9)); }
      if (dur < 0.3) temblar(3, 0.08);
    }));
    this.una("remate", t > T_REMATE, () => { temblar(14, 0.25); const q = this.palaEn(1, T_REMATE); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 140); });
    if (t > T_REMATE && t < T_CLAVA) { const q = this.pelota(t); for (let i = 0; i < 4; i++) p.nueva(P.LLAMA, q[0] + azar(-6, 6), q[1] + azar(-6, 6), azar(80, 220), azar(-30, 30), azar(0.15, 0.3), azar(20, 34), 1); }
    this.una("clava", t > T_CLAVA, () => {
      temblar(26, 0.55);
      const q = this.palaEn(0, T_CLAVA);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 200);
      for (let i = 0; i < 34; i++) { const a = azar(0, 6.283), v = azar(200, 650); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 15)); }
      for (let i = 0; i < 8; i++) p.nueva(P.HUMO, q[0], q[1], azar(-60, 60), azar(-90, -20), azar(0.8, 1.3), azar(26, 40));
    });
    // botes en la mesa
    const k = this.ultimo(t);
    if (k >= 0 && k < GOLPES.length - 1) {
      const [t0] = GOLPES[k], [t1] = GOLPES[k + 1], tb = t0 + (t1 - t0) * 0.55;
      this.una("b" + k, t >= tb, () => { const q = this.pelota(tb); p.nueva(P.DESTELLO, q[0], MESA - 2, 0, 0, 0.18, 40); });
    }
    p.actualizar(dt);
  }
  mesa(g) {
    if (this.cache.has("m")) return this.cache.get("m");
    const c = lienzoNuevo(W, H), x = c.getContext("2d");
    // suelo
    const gs = x.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#1c1410"); gs.addColorStop(1, "#0b0806");
    x.fillStyle = gs; x.fillRect(0, 470, W, H - 470);
    x.fillStyle = "rgba(255,255,255,.05)"; x.fillRect(0, 470, W, 2);
    // patas
    x.fillStyle = "#26282c";
    for (const px of [M0 + 30, M1 - 36]) { x.fillRect(px, MESA + 14, 8, PIES - MESA - 14); x.fillRect(px - 16, PIES - 6, 40, 6); }
    x.fillStyle = "#3a3d42"; x.fillRect(RED - 4, MESA + 14, 8, PIES - MESA - 14);
    // tablero (un poco visto desde arriba)
    x.fillStyle = "#0d4a35";
    x.beginPath(); x.moveTo(M0 + 10, MESA - 22); x.lineTo(M1 - 10, MESA - 22); x.lineTo(M1, MESA); x.lineTo(M0, MESA); x.closePath(); x.fill();
    x.strokeStyle = "#f4f4f0"; x.lineWidth = 2.5; x.stroke();
    x.beginPath(); x.moveTo(RED, MESA - 22); x.lineTo(RED, MESA); x.stroke();
    x.lineWidth = 1.2; x.beginPath(); x.moveTo(M0 + 5, MESA - 11); x.lineTo(M1 - 5, MESA - 11); x.stroke();
    const gc = x.createLinearGradient(0, MESA, 0, MESA + 14);
    gc.addColorStop(0, "#127050"); gc.addColorStop(1, "#073426");
    x.fillStyle = gc; x.fillRect(M0, MESA, M1 - M0, 14);
    x.fillStyle = "#f4f4f0"; x.fillRect(M0, MESA, M1 - M0, 2);
    // red
    x.fillStyle = "#2d2f33"; x.fillRect(RED - 3, MESA - 52, 6, 52);
    x.fillStyle = "rgba(240,240,235,.25)";
    for (let yy = MESA - 46; yy < MESA - 8; yy += 6) x.fillRect(RED - 2, yy, 4, 1.5);
    x.fillStyle = "#f4f4f0"; x.fillRect(RED - 4, MESA - 52, 8, 5);
    this.cache.set("m", c);
    return c;
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(1000, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡PING! ¡PONG!", 500, 145, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,170,30,.85)", glowTam: 24, max: 960 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(t);
    fondo(g, "#000");
    // lámpara colgada sobre la mesa
    const on = t < 0.55 ? [0, 0.7, 0, 1, 0.4, 1][Math.min(5, Math.floor(t / 0.09))] : 1;
    const luz = on * (1 - tramo(t, DUR - 0.6, DUR - 0.05));
    // la lámpara se balancea con el aire del peloteo
    const bal = (0.1 * tramo(t, 4.0, 7.0) * (1 - tramo(t, 7.6, 9.0)) + (t > T_CLAVA ? 0.08 * Math.exp(-(t - T_CLAVA) * 1.5) : 0)) * Math.sin(t * 4.2);
    foco(g, RED + Math.sin(bal) * 70, RED + Math.sin(bal) * 440, MESA + 10, 330, luz * 1.2);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * luz; g.drawImage(BLOB2.oroClaro, 120 + Math.sin(bal) * 200, 120, 784, 520); g.restore();
    g.drawImage(this.mesa(g), 0, 0);
    g.save(); g.translate(RED, -20); g.rotate(-bal);
    g.fillStyle = "#2a2c30"; g.fillRect(-1.5, 0, 3, 62);
    g.fillStyle = "#1d1f22"; g.beginPath(); g.moveTo(-70, 96); g.lineTo(70, 96); g.lineTo(34, 60); g.lineTo(-34, 60); g.closePath(); g.fill();
    g.globalCompositeOperation = "lighter"; g.globalAlpha = luz; g.drawImage(BLOB.amarillo, -70, 70, 140, 60);
    g.restore();
    // jugadores
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    // la chapa con su estela
    const q = t < T_CLAVA ? this.pelota(t) : null;
    if (q) {
      const k = this.ultimo(t), dur = k >= 0 && k + 1 < GOLPES.length ? GOLPES[k + 1][0] - GOLPES[k][0] : 1;
      const rapida = t >= T_REMATE ? 1 : tramo(0.6 - dur, 0, 0.35);
      if (rapida > 0 && t > 1.4) {
        g.save(); g.globalCompositeOperation = "lighter";
        for (let n = 8; n >= 1; n--) {
          const qq = this.pelota(t - n * 0.012 * (t >= T_REMATE ? 0.6 : 1));
          if (!qq) continue;
          g.globalAlpha = 0.5 * rapida * (1 - n / 9); const r = 15 - n;
          g.drawImage(t >= T_REMATE ? BLOB.naranja : BLOB.amarillo, qq[0] - r, qq[1] - r, r * 2, r * 2);
        }
        g.restore();
      }
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(q[0], MESA - 3, 8, 2.5, 0, 0, 6.283); if (q[0] > M0 && q[0] < M1 && q[1] < MESA) g.fill();
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55; g.drawImage(BLOB.amarillo, q[0] - 26, q[1] - 26, 52, 52); g.restore();
      chapa(g, q[0], q[1], 13, t * 17);
    }
    this.p.dibujar(g);
    // ¡PING! ¡PONG! en cada golpe
    for (const w of this.palabras) {
      const d = t - w.t0;
      if (d < 0 || d > 0.55) continue;
      const k = tramo(d, 0, 0.1);
      g.save(); g.translate(w.x, w.y - 14 * d); g.rotate(w.j ? 0.12 : -0.12); g.scale(eBack(k), eBack(k));
      txt(g, w.s, 0, 0, { tam: 50, peso: 400, fam: FC, color: "#fffdf5", borde: w.j ? "#0b5f80" : "#0a6b2a", bordeAncho: 9, alfa: 1 - tramo(d, 0.38, 0.55), esp: 2 });
      g.restore();
    }
    // título del remate
    if (t > T_CLAVA + 0.25) {
      const d = t - T_CLAVA - 0.25, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 120); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00111", nombre: "Ping-pong de chapas", crear: () => new PingPong() });
})();
