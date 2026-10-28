"use strict";
/*
 * 00040 · CAMARERO EQUILIBRISTA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra de camarero (pajarita y paño en el brazo) con una bandeja de 8 jarras en alto, siguiéndole un foco. Tropieza
 * (¡UY!) y se tambalea con las jarras resbalando; hace una ola con las jarras dando volteretas y luego las lanza todas
 * al aire, da una pirueta doble y caen una a una en su sitio. ¡NI UNA GOTA! y se va por la derecha, chulito.
 */
(() => {
/** Jarra llena dibujada una vez; origen en el centro del fondo. */
function spriteJarra(S) {
  const c = lienzoNuevo(46 * S, 46 * S), g = c.getContext("2d");
  g.scale(S, S); g.translate(9, 25);
  dibujarJarra(g, [0, 0], 0, 1, "asa", 0);
  dibujarJarra(g, [0, 0], 0, 1, "cuerpo", 0);
  return c;
}
/** Bandeja plateada vista un poco desde arriba (a tamaño de pantalla); centro en (RX + 8, 26). */
function spriteBandeja(RX) {
  const c = lienzoNuevo(RX * 2 + 16, 52), g = c.getContext("2d");
  g.translate(RX + 8, 26);
  g.fillStyle = "#3d4247"; g.beginPath(); g.ellipse(0, 6, RX, 16, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(-RX, 0, RX, 0);
  gr.addColorStop(0, "#8d959c"); gr.addColorStop(0.3, "#e9eef2"); gr.addColorStop(0.55, "#b8c0c6"); gr.addColorStop(0.8, "#f4f7f9"); gr.addColorStop(1, "#7d858c");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, RX, 16, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 2; g.stroke();
  g.strokeStyle = "rgba(60,66,72,.45)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, RX - 9, 11, 0, 0, 6.283); g.stroke();
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(-RX * 0.35, -5, RX * 0.3, 3, -0.05, 0, 6.283); g.fill();
  return c;
}
const S = 3, EJ = 1.32, RX = 116;

class Camarero extends Escena {
  constructor() {
    super(9.3);
    this.p = new Parts(300);
    this.ESC = 1.45;
    this.jarra = spriteJarra(S);
    this.bandeja = spriteBandeja(RX);
    // sitio de cada jarra en la bandeja (x, y del fondo): fila de atrás y fila de delante, al tresbolillo
    this.SLOTS = [[-61, -6], [-12, -6], [37, -6], [86, -6], [-86, 6], [-37, 6], [12, 6], [61, 6]];
    this.ORDEN_X = [4, 0, 5, 1, 6, 2, 7, 3]; // de izquierda a derecha
    this.vuelo = new Array(8).fill(null);
    this.hundir = 0; this.fase = 0;
    // lanzamiento grande: altura, giros, separación lateral y cuándo cae cada una
    const r = semilla(40);
    const caida = [5.32, 5.42, 5.5, 5.6, 5.68, 5.78, 5.86, 5.98];
    const orden = [3, 6, 0, 5, 2, 7, 1, 4];
    this.GRANDE = this.SLOTS.map((_, i) => ({ t0: 4.15 + i * 0.015, t1: caida[orden.indexOf(i)], h: 105 + r() * 60 - (i > 3 ? 20 : 0), giros: (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 2)), dx: (this.SLOTS[i][0] / 86) * 130 + (r() - 0.5) * 60 }));
  }
  xEn(t) {
    if (t < 1.9) return -330 + 800 * (1 - Math.pow(1 - t / 1.9, 1.7));
    if (t < 7.3) return 470;
    return 470 + Math.pow(t - 7.3, 1.25) * 400;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [124, 44], manoI = [-4, 150], giro = 0, sx = 1, sy = 1, dy = 0, ang = 0, resbala = 0, bambo = 0;
    const anda = t < 1.9 || t > 7.3;
    if (anda) {
      const a = andar(this.fase, 1);
      pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; dy = a.bote;
      ang = 0.035 * Math.sin(this.fase); manoI = [-2 + 4 * Math.sin(this.fase), 146];
      if (t > 7.3) { pose.cara = "guino"; pose.rc = 0.06 * Math.sin(this.fase * 0.5); }
    }
    // tropieza: se tambalea y las jarras resbalan por la bandeja
    if (t >= 1.9 && t < 2.95) {
      const k = tramo(t, 1.9, 2.95);
      const w = Math.sin(k * Math.PI * 3.3) * 0.13 * (1 - 0.75 * k);
      giro = w; ang = -w * 1.8; resbala = -w * 160; bambo = Math.sin(t * 24) * 0.12 * (1 - k);
      pose.cara = k < 0.8 ? "sorpresa" : "guino";
      pose.piernaD = [-18 * (1 - k), -0.3 * (1 - k)];
      pose.rc = -w * 1.2;
      manoI = [-40 + 12 * Math.sin(t * 15), 72 + 18 * Math.sin(t * 11)];
      manoD = [124 + w * 40, 44 - Math.abs(w) * 30];
    }
    // la ola: a la pata coja, las jarras saltan una tras otra
    if (t >= 2.95 && t < 4.0) {
      const k = eInOut(tramo(t, 2.95, 3.15)) * (1 - eInOut(tramo(t, 3.8, 4.0)));
      pose.cara = "guino";
      pose.piernaI = [-16 * k, -0.28 * k];
      manoI = mezcla([-4, 150], [-34, 98], k);
      giro = 0.025 * Math.sin(t * 7) * k;
    }
    // coge impulso, lanza y pirueta doble
    if (t >= 4.0 && t < 4.15) { const k = eInOut(tramo(t, 4.0, 4.12)); sy = 1 - 0.07 * k; sx = 1 + 0.03 * k; manoD = [124, 44 + 14 * k]; pose.cara = "guino"; }
    if (t >= 4.15 && t < 5.3) {
      const u = tramo(t, 4.2, 5.2);
      sx = Math.cos(4 * Math.PI * eInOut(u));
      if (Math.abs(sx) < 0.08) sx = sx < 0 ? -0.08 : 0.08;
      dy = -46 * Math.sin(Math.PI * tramo(t, 4.15, 5.25));
      manoD = t < 4.3 ? mezcla([124, 58], [100, 16], eOut(tramo(t, 4.15, 4.25))) : mezcla([100, 16], [124, 44], eInOut(tramo(t, 5.05, 5.28)));
      manoI = [-28, 70];
      pose.piernaI = [-14, -0.2]; pose.piernaD = [-4, 0.12];
      pose.cara = "risa";
    }
    // recibe las jarras con la bandeja
    if (t >= 5.3 && t < 7.3) {
      const k = eInOut(tramo(t, 6.0, 6.3));
      manoD = [124, 44 + this.hundir * 0.5];
      if (t < 6.05) { pose.cara = "sorpresa"; ang = 0.03 * Math.sin(t * 13); }
      else pose.cara = t < 6.9 ? "risa" : "guino";
      manoI = mezcla([-12, 120], [-44, 104], k);
      if (t > 6.2) dy = 0;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD = (g) => pajarita(g);
    pose.objI2 = (g, m, a) => panio(g, m, a, t);
    const x = this.xEn(t);
    const m = matAv(x, PIES + dy, this.ESC, giro, sx, sy);
    const C = aPant(m, [manoD[0] + 9, manoD[1] - 7]);
    C[1] += this.hundir;
    return { pose, m, x, C, ang, resbala, bambo };
  }
  /** Centro del fondo de la jarra i (en pantalla) si estuviera en su sitio. */
  sitio(e, i) {
    const s = this.SLOTS[i], q = rot2([s[0] + e.resbala * (s[1] < 0 ? 0.9 : 1.1), s[1]], e.ang);
    return [e.C[0] + q[0], e.C[1] + q[1]];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t < 1.9 || t > 7.3) this.fase += dt * 10.5;
    this.hundir *= Math.pow(0.0005, dt);
    const e = this.estado();
    const clinc = (q, fuerte) => {
      p.nueva(P.DESTELLO, q[0], q[1] - 30, 0, 0, 0.25, fuerte ? 70 : 44);
      for (let k = 0; k < (fuerte ? 7 : 3); k++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, q[0], q[1] - 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.45), azar(6, 10)); }
      this.hundir = Math.min(14, this.hundir + (fuerte ? 9 : 4));
    };
    this.una("uy", t > 1.92, () => temblar(5, 0.2));
    // la ola
    this.ORDEN_X.forEach((i, k) => {
      const t0 = 3.0 + k * 0.085;
      this.una("ola" + i, t > t0, () => { this.vuelo[i] = { t0, t1: t0 + 0.34, ola: true, giros: 1 }; });
      this.una("olaF" + i, t > t0 + 0.34, () => { this.vuelo[i] = null; clinc(this.sitio(e, i), false); });
    });
    // el lanzamiento grande
    this.GRANDE.forEach((G, i) => {
      this.una("lanza" + i, t > G.t0, () => { const q = this.sitio(e, i); this.vuelo[i] = Object.assign({ x0: q[0], y0: q[1] }, G); });
      this.una("cae" + i, t > G.t1, () => { this.vuelo[i] = null; clinc(this.sitio(e, i), true); temblar(4, 0.12); });
    });
    this.una("lanzaFx", t > 4.16, () => { for (let k = 0; k < 18; k++) p.nueva(P.ESPUMA, e.C[0] + azar(-80, 80), e.C[1] - azar(20, 50), azar(-120, 120), azar(-420, -200), azar(0.4, 0.8), azar(3, 7)); });
    this.una("titulo", t > 6.22, () => {
      temblar(14, 0.35);
      for (let k = 0; k < 44; k++) p.nueva(P.CONFETI, azar(150, 870), azar(-60, 0), azar(-60, 60), azar(40, 160), azar(2.4, 3.0), azar(9, 15), (k % 5));
    });
    if (t > 6.3 && t < 7.5 && Math.random() < 10 * dt) { const q = this.sitio(e, (Math.random() * 8) | 0); p.nueva(P.DESTELLO, q[0] + azar(-14, 14), q[1] - azar(20, 50), 0, 0, 0.3, 26); }
    // polvillo al andar y al tropezar
    this.una("tropiezo", t > 1.95, () => { for (let k = 0; k < 10; k++) p.nueva(P.POLVO, e.x + azar(-30, 40), PIES - 4, azar(-160, 160), azar(-40, -5), azar(0.5, 0.9), azar(22, 36)); });
    p.actualizar(dt);
  }
  /** Jarra con el fondo en (x, y), girada `a` sobre su centro. */
  jarraCentro(g, x, y, a) {
    const k = EJ;
    if (!a) { g.drawImage(this.jarra, x - 26 * k, y - 43 * k, 46 * k, 46 * k); return; }
    g.save(); g.translate(x, y - 18 * k); g.rotate(a);
    g.drawImage(this.jarra, -26 * k, -25 * k, 46 * k, 46 * k);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // foco que le sigue
    foco(g, e.x + 30, e.x + 30, PIES, 190, 0.9);
    // sombra
    g.save(); g.globalAlpha = 0.5; g.drawImage(BLOB.humo, e.x - 70, PIES - 12, 140, 22); g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    // bandeja y jarras que están en ella
    g.save(); g.translate(e.C[0], e.C[1]); g.rotate(e.ang);
    g.drawImage(this.bandeja, -RX - 8, -26);
    for (let i = 0; i < 8; i++) {
      if (this.vuelo[i] && !this.vuelo[i].ola) continue;
      const s = this.SLOTS[i], V = this.vuelo[i];
      let x = s[0] + e.resbala * (s[1] < 0 ? 0.9 : 1.1), y = s[1], a = e.bambo * (i % 2 ? 1 : -1);
      if (V) {
        const u = tramo(t, V.t0, V.t1);
        y -= 58 * 4 * u * (1 - u);
        a += Math.PI * 2 * eInOut(u);
      }
      // las de atrás se pintan antes (están ordenadas)
      this.jarraCentro(g, x, y, a);
    }
    g.restore();
    // jarras en el aire
    for (let i = 0; i < 8; i++) {
      const V = this.vuelo[i];
      if (!V || V.ola) continue;
      const u = tramo(t, V.t0, V.t1), fin = this.sitio(e, i);
      const x = lerp(V.x0, fin[0], u) + V.dx * Math.sin(Math.PI * u);
      const y = lerp(V.y0, fin[1], u) - V.h * 4 * u * (1 - u) - 24 * Math.sin(Math.PI * u);
      this.jarraCentro(g, x, y, V.giros * Math.PI * 2 * eInOut(u) + e.ang * u);
    }
    this.p.dibujar(g);
    // ¡UY!
    if (t > 1.92 && t < 2.75) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] - 100, q[1] - 30, "¡UY!", q[0] - 30, q[1] + 6, tramo(t, 1.92, 2.08) * (1 - tramo(t, 2.55, 2.75)), 40);
    }
    // ¡HOP!
    if (t > 4.12 && t < 4.9) {
      const k = tramo(t, 4.12, 4.24);
      g.save(); g.translate(e.x - 235, 330); g.rotate(-0.16); g.scale(eBack(k), eBack(k));
      txt(g, "¡HOP!", 0, 0, { tam: 58, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 8, alfa: 1 - tramo(t, 4.65, 4.9), esp: 2 });
      g.restore();
    }
    // ¡NI UNA GOTA!
    if (t > 6.22 && t < 8.5) {
      const k = tramo(t, 6.22, 6.4), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 3) * (1 - tramo(t, 8.1, 8.5));
      g.save(); g.translate(W / 2 + 10, 128); g.rotate(-0.04); g.scale(s, s);
      txt(g, "¡NI UNA GOTA!", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#fffdf5", borde: "#0a6b2a", bordeAncho: 12, alfa: a, esp: 3, max: 900 });
      g.restore();
    }
  }
}
function pajarita(g) {
  g.save(); g.translate(39, 81);
  g.fillStyle = "#b5122e";
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-9, -5); g.quadraticCurveTo(-11, 0, -9, 5); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(9, -5); g.quadraticCurveTo(11, 0, 9, 5); g.closePath(); g.fill();
  g.fillStyle = "#e0294a"; g.beginPath(); g.moveTo(0, 0); g.lineTo(-8, -4); g.lineTo(-7, -1); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(8, -4); g.lineTo(7, -1); g.closePath(); g.fill();
  g.fillStyle = "#8a0c22"; rectR(g, -2.6, -2.8, 5.2, 5.6, 1.5); g.fill();
  g.restore();
}
/** Paño blanco colgado del antebrazo izquierdo. */
function panio(g, mano, a, t) {
  const c = [mano[0] - Math.cos(a) * 14, mano[1] - Math.sin(a) * 14];
  const vaiven = 2.5 * Math.sin(t * 6);
  g.save(); g.translate(c[0], c[1]);
  g.fillStyle = "#f4f1e8"; g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 0.8;
  g.beginPath(); g.moveTo(-8, -3); g.lineTo(8, -3); g.lineTo(9 + vaiven, 26); g.lineTo(-7 + vaiven, 28); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = "rgba(0,0,0,.12)"; g.beginPath(); g.moveTo(-2, 0); g.lineTo(-1 + vaiven, 27); g.moveTo(4, 0); g.lineTo(5 + vaiven, 26); g.stroke();
  g.restore();
}

registrar({ id: "00040", nombre: "Camarero equilibrista", crear: () => new Camarero() });
})();
