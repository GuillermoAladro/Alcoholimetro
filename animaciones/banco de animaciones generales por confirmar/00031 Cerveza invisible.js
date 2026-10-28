"use strict";
/*
 * 00031 · CERVEZA INVISIBLE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Bajo un foco, con gafas de sol, enseña una jarra con cerveza «invisible» (solo se ve la espuma flotando y unos
 * destellos) y se la bebe. Empieza a desaparecer de los pies a la cabeza hasta que solo flotan las gafas y la jarra.
 * La jarra se escabulle sola de puntillas; las gafas miran a un lado y a otro (¿DÓNDE ESTÁ?) y salen corriendo detrás
 * levantando polvo con unos pies que no se ven. Se apaga el foco.
 */
(() => {
const OW = 470, OH = 480, OX = 235, OY = 470; // lienzo auxiliar del avatar (los pies en OX, OY)
const cache = cacheTexto();

function tituloDonde() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(760, 170), g = c.getContext("2d");
  txt(g, "¿DÓNDE ESTÁ?", 380, 122, { tam: 112, peso: 900, fam: FD, color: "#effcff", borde: "#0b3c52", bordeAncho: 10, esp: 4, glow: "rgba(47,227,232,.85)", glowTam: 26 });
  cache.set("t", c);
  return c;
}

/** Mano real a la que llega el brazo derecho (la misma cuenta que el motor). */
function manoReal(T) {
  const b = ik(RIG.hombroD, T, RIG.L1, RIG.L2);
  return [b.E[0] + Math.cos(b.a2) * RIG.L2, b.E[1] + Math.sin(b.a2) * RIG.L2];
}

/** Jarra con cerveza invisible: solo la espuma flota y brillan unos destellos. Coordenadas de la mano. */
function jarraInvisible(g, mano, inc, nivel, parte, t) {
  const J = JARRA;
  g.save(); g.translate(mano[0], mano[1]); g.rotate(inc);
  if (parte === "asa") {
    g.strokeStyle = "rgba(225,240,255,.9)"; g.lineWidth = 3.4;
    g.beginPath(); g.moveTo(J.x0 + 1, -10); g.bezierCurveTo(-7, -11, -7, 11, J.x0 + 1, 10); g.stroke();
    g.restore(); return;
  }
  const w = J.x1 - J.x0, h = J.y1 - J.y0, alto = (h - 4) * clamp(nivel, 0, 1);
  rectR(g, J.x0, J.y0, w, h, 3.5); g.fillStyle = "rgba(200,225,255,.13)"; g.fill();
  if (alto > 0.5) {
    g.save(); rectR(g, J.x0, J.y0, w, h, 3.5); g.clip();
    // el «líquido»: casi nada, un temblor de luz
    g.fillStyle = `rgba(170,240,255,${0.07 + 0.04 * Math.sin(t * 7)})`; g.fillRect(J.x0, J.y1 - 2 - alto, w, alto + 2);
    g.strokeStyle = "rgba(200,250,255,.35)"; g.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      const y = J.y1 - 4 - ((t * 9 + i * 9) % Math.max(3, alto - 2));
      g.beginPath(); g.moveTo(J.x0 + 2, y);
      for (let x = J.x0 + 2; x <= J.x1 - 2; x += 3) g.lineTo(x, y + Math.sin(x * 0.6 + t * 9 + i) * 1.1);
      g.stroke();
    }
    g.restore();
    // destellos dentro
    for (let i = 0; i < 4; i++) {
      const k = (Math.sin(t * 5 + i * 2.1) + 1) / 2;
      const bx = J.x0 + 5 + ((i * 7.3) % (w - 9)), by = J.y1 - 4 - ((i * 11.7) % Math.max(2, alto - 4));
      brillo(g, bx, by, 3 + 3 * k, 0.4 + 0.6 * k);
    }
  }
  if (nivel > 0.04) { // la espuma, flotando sobre nada
    const ye = J.y1 - 2 - alto;
    g.fillStyle = "#fffaf0";
    g.beginPath(); g.moveTo(J.x0 - 1, ye + 3);
    for (let i = 0; i <= 4; i++) g.arc(J.x0 + (w / 4) * i, ye - 1 + 0.6 * Math.sin(t * 6 + i), 3.6 + (i % 2) * 1.2, Math.PI, 0);
    g.lineTo(J.x1 + 1, ye + 3); g.closePath(); g.fill();
    g.fillStyle = "rgba(220,205,170,.6)"; g.fillRect(J.x0, ye + 2, w, 1.4);
  }
  rectR(g, J.x0, J.y0, w, h, 3.5); g.strokeStyle = "rgba(235,245,255,.95)"; g.lineWidth = 1.7; g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(J.x0 + 3, J.y0 + 3, 2.2, h - 6);
  g.restore();
}

/** Gafas de sol sueltas donde estaría la cara (misma cuenta que dibujarCara). */
function gafasCara(g, m, rc, cara) {
  const p = IMG["cara_" + cara] || { w: 91, h: 120 }, e = RIG.escCara, w = p.w * e, h = p.h * e;
  conMat(g, m, () => {
    g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(rc);
    g.translate(-w / 2, RIG.barbilla - RIG.cuello[1] - h); g.scale(e, e);
    gafasSol(g, 0, 0, 1);
  });
}

class EscenaInvisible extends Escena {
  constructor() {
    super(9.7);
    this.p = new Parts(420);
    this.ESC = 1.6; this.X = W / 2;
    this._c = null;
  }
  lienzo() { if (!this._c) { this._c = lienzoNuevo(OW, OH); this._g = this._c.getContext("2d"); } return this._g; }
  /** Altura (en el lienzo auxiliar) por debajo de la cual ya no se le ve. */
  corte(t) { return lerp(OY + 34, OY - 255 * this.ESC, eInOut(tramo(t, 3.45, 5.35))); }
  xGafas(t) {
    // miran a un lado y a otro y salen corriendo hacia la derecha
    let x = this.X;
    if (t > 6.35) x += 14 * eInOut(tramo(t, 6.35, 6.55));
    if (t > 7.05) x += -40 * eInOut(tramo(t, 7.05, 7.3)) + 70 * eInOut(tramo(t, 7.45, 7.7)) - 44 * eInOut(tramo(t, 7.75, 7.9));
    if (t > 8.0) x += 1500 * Math.pow(t - 8.0, 2) + 260 * (t - 8.0);
    return x;
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoI = [9, 160], dy = 0, dx = 0;
    // beber: sube, trago largo, baja
    const kSube = tramo(t, 1.45, 1.8), kTrago = tramo(t, 1.8, 2.75), kBaja = tramo(t, 2.75, 3.05);
    const bebiendo = kSube > 0 && kBaja < 1;
    const kBrazo = bebiendo ? eInOut(kSube) * (1 - eInOut(kBaja)) : 0;
    pose.rc = -0.33 * eInOut(kTrago) * (1 - eInOut(kBaja)) + (kTrago > 0 && kTrago < 1 ? 0.025 * Math.sin(t * 40) : 0);
    const inc = (-0.4 * eInOut(kSube) - 1.25 * eInOut(kTrago)) * (1 - eInOut(kBaja));
    const b = boca(pose.rc), r = rot2(JARRA.borde, inc), obj = [b[0] - r[0], b[1] - r[1]];
    // la enseña levantándola un poco y la menea: la espuma flota sola
    const kEns = eInOut(tramo(t, 0.75, 1.0)) * (1 - eInOut(tramo(t, 1.3, 1.5)));
    let reposo = mezcla([60, 124], [72, 100], kEns);
    if (kEns > 0.9) reposo = [reposo[0] + 3 * Math.sin(t * 26), reposo[1]];
    const T = mezcla(reposo, obj, kBrazo); T[0] += Math.sin(kBrazo * Math.PI) * 18;
    const nivel = t < 1.8 ? 1 : 1 - eInOut(kTrago);
    if (t > 0.75 && t < 1.45) pose.cara = "guino";
    if (t > 2.8 && t < 3.3) pose.cara = "risa";
    if (t >= 3.3) {
      // se da cuenta: ¡se le van los pies!
      pose.cara = "sorpresa";
      const k = eInOut(tramo(t, 3.3, 3.55));
      manoI = mezcla(manoI, [-14 + 9 * Math.sin(t * 15), 70 + 8 * Math.cos(t * 13)], k);
      dx = Math.sin(t * 31) * 1.6 * k;
      pose.rc = 0.06 * Math.sin(t * 9) * k;
    }
    if (t > 5.35) dy = 4 * Math.sin(t * 2.4); // flotan
    pose.manoD = T; pose.manoI = manoI;
    const m = matAv(this.X + dx, PIES + dy, ESC);
    // dónde está la jarra (unidades de avatar)
    let jarra = manoReal(T), jInc = inc;
    if (t > 5.85) {
      const kP = tramo(t, 5.85, 6.6), kC = tramo(t, 6.6, 7.2);
      jarra = [jarra[0] + 55 * kP + 330 * eIn(kC), jarra[1] - Math.abs(Math.sin(kP * Math.PI * 4)) * 9 - Math.abs(Math.sin(kC * Math.PI * 5)) * 14];
      jInc = (kP > 0 && kP < 1 ? 0.14 * Math.sin(kP * Math.PI * 8) : 0) - 0.18 * Math.min(1, kC * 3);
    }
    // gafas: con la cabeza mientras se ve; luego, solas
    const mG = matAv(this.xGafas(t) + dx, PIES + dy + (t > 6.35 && t < 6.6 ? -14 * Math.sin(tramo(t, 6.35, 6.6) * Math.PI) : 0), ESC);
    const rcG = t > 7.05 && t < 7.95 ? 0.12 * Math.sin((t - 7.05) * 9) : pose.rc;
    return { pose, m, mG, rcG, jarra, jInc, nivel, dx, dy };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // destellos que se le meten en la boca al beber
    if (t > 1.85 && t < 2.75 && Math.random() < 25 * dt) {
      const q = aPant(e.m, boca(e.pose.rc));
      p.nueva(P.ELECTRICA, q[0] + azar(-10, 10), q[1] + azar(-6, 6), azar(-30, 30), azar(-40, 10), azar(0.25, 0.45), azar(8, 16));
    }
    // borde que va borrando el cuerpo
    if (t > 3.45 && t < 5.4) {
      const y = PIES - OY + this.corte(t);
      for (let i = 0; i < 4; i++) p.nueva(P.ELECTRICA, this.X + azar(-62, 62), y + azar(-14, 4), azar(-30, 30), azar(-90, -20), azar(0.3, 0.7), azar(8, 18));
      if (Math.random() < 14 * dt) p.nueva(P.PURPURINA, this.X + azar(-70, 70), y, azar(-20, 20), azar(-40, 0), azar(0.6, 1.0), azar(6, 10));
    }
    this.una("puf", t > 5.35, () => { const q = aPant(e.m, [39, 10]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 140); });
    // polvo de unos pies que no se ven
    if (t > 8.0 && t < 8.45 && Math.random() < 30 * dt) {
      const x = this.xGafas(t);
      p.nueva(P.POLVO, x + azar(-30, 10), PIES - 6, azar(-260, -120), azar(-40, -5), azar(0.5, 0.8), azar(24, 40));
    }
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), ESC = this.ESC;
    fondo(g, "#000");
    // foco: se enciende con parpadeo, sigue a las gafas un poco y se apaga al final
    const parpadeo = t < 0.7 ? [0, 1, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    const luz = parpadeo * (1 - tramo(t, 8.7, 9.35));
    foco(g, W / 2, W / 2, PIES, 200, luz);
    const corte = this.corte(t);
    const visible = corte > -10;
    // lienzo auxiliar: el avatar, sin gafas, borrado de abajo arriba
    let mano = null;
    if (visible || (t > 5.35 && t < 8.0)) {
      const o = this.lienzo();
      o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = "source-over"; o.globalAlpha = 1; o.clearRect(0, 0, OW, OH);
      const mO = matAv(OX + e.dx, OY + e.dy, ESC);
      pintarAvatar(o, mO, e.pose, t);
      mano = e.pose._manoD;
      if (t > 5.35) {
        // ya invisible: de vez en cuando se intuye su silueta
        const pulso = t < 7.0 ? Math.pow(Math.max(0, Math.sin((t - 5.35) * 4.2)), 6) * 0.07 : 0;
        if (pulso > 0.005) {
          o.globalCompositeOperation = "source-atop"; o.fillStyle = "#7ff3ff"; o.fillRect(0, 0, OW, OH);
          g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = pulso; g.drawImage(this._c, this.X - OX, PIES - OY); g.restore();
        }
      } else {
        if (corte < OH) {
          o.globalCompositeOperation = "destination-out";
          const gr = o.createLinearGradient(0, corte - 36, 0, corte);
          gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,1)");
          o.fillStyle = gr; o.fillRect(0, Math.max(0, corte - 36), OW, OH);
        }
        conMat(g, e.m, () => jarraInvisible(g, e.jarra, e.jInc, e.nivel, "asa", t));
        // línea brillante donde se borra
        g.drawImage(this._c, this.X - OX, PIES - OY);
        if (t > 3.45 && t < 5.35) {
          const y = PIES - OY + corte - 8;
          g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5;
          g.drawImage(BLOB2.cian, this.X - 110, y - 16, 220, 32); g.restore();
        }
      }
    }
    // la jarra (siempre visible)
    if (t > 5.35) conMat(g, e.m, () => jarraInvisible(g, e.jarra, e.jInc, 0, "asa", t));
    conMat(g, e.m, () => jarraInvisible(g, e.jarra, e.jInc, e.nivel, "cuerpo", t));
    // las gafas (siempre visibles)
    gafasCara(g, t > 5.35 ? e.mG : e.m, t > 5.35 ? e.rcG : e.pose.rc, e.pose.cara);
    // estela de la carrera de las gafas
    if (t > 8.0 && t < 8.5) {
      const q = aPant(e.mG, [39, 40]);
      g.save(); g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const y = q[1] - 12 + i * 8; g.beginPath(); g.moveTo(q[0] - 60 - i * 14, y); g.lineTo(q[0] - 170 - i * 20, y); g.stroke(); }
      g.restore();
    }
    this.p.dibujar(g);
    // ¿DÓNDE ESTÁ?
    if (t > 6.95 && t < 8.75) {
      const k = tramo(t, 6.95, 7.15), a = Math.min(1, k * 3) * (1 - tramo(t, 8.45, 8.75));
      const T = tituloDonde(), s = eBack(k);
      g.save(); g.globalAlpha = a; g.translate(W / 2, 108); g.rotate(-0.03 + 0.02 * Math.sin(t * 3)); g.scale(s, s);
      g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
    }
    // fundido de salida (el de entrada lo hace el foco)
    const a = Math.max(t < 0.7 ? 1 - parpadeo : 0, tramo(t, this.dur - 0.4, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00031", nombre: "Cerveza invisible", crear: () => new EscenaInvisible() });
})();
