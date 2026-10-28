"use strict";
/*
 * 00002 · CHUPITO AL VUELO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco. Enseña un chupito y lo lanza al aire: sale dando vueltas por arriba… y vuelve. Lo atrapa con
 * la boca (¡AL VUELO!) y se lo bebe sin manos; de un cabezazo el vaso le cae boca abajo en la cabeza. Se pone rojo
 * de abajo arriba y le sale vapor por las orejas mientras el vasito traquetea como la tapa de una olla.
 */
(() => {
const X = 512, ESC = 1.7;
const CW = 16, CH = 20; // el chupito en unidades de avatar
const T_LANZA = 1.47, T_VUELVE = 2.7, T_PILLA = 3.2, T_ESCUPE = 4.45, T_CABEZA = 4.95, T_ROJO = 5.25;

/** Vaso de chupito centrado en (x, y), girado `ang`. nivel 0–1; desdeBorde: el líquido va hacia la boca del vaso. */
function chupito(g, x, y, ang, esc, nivel, desdeBorde) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc);
  const w = CW, h = CH;
  const forma = () => { g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2 - 1.6, h / 2); g.lineTo(-w / 2 + 1.6, h / 2); g.closePath(); };
  forma(); g.fillStyle = "rgba(210,235,255,.22)"; g.fill();
  if (nivel > 0.02) {
    g.save(); forma(); g.clip();
    const alto = (h - 4.5) * nivel;
    const gr = g.createLinearGradient(0, -h / 2, 0, h / 2);
    gr.addColorStop(0, "#ffcf4a"); gr.addColorStop(1, "#c25a00");
    g.fillStyle = gr;
    if (desdeBorde) g.fillRect(-w, -h / 2, w * 2, alto);
    else g.fillRect(-w, h / 2 - 4.5 - alto, w * 2, alto);
    g.restore();
  }
  // culo grueso del vaso
  g.fillStyle = "rgba(225,240,255,.55)"; rectR(g, -w / 2 + 1.8, h / 2 - 4.5, w - 3.6, 4.2, 1.2); g.fill();
  forma(); g.strokeStyle = "rgba(240,248,255,.95)"; g.lineWidth = 1.3; g.stroke();
  g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(-w / 2 + 2.2, -h / 2 + 1.5, 1.5, h - 7);
  g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 0.9; g.beginPath(); g.ellipse(0, -h / 2, w / 2, 1.1, 0, 0, 6.283); g.stroke();
  g.restore();
}

class EscenaChupito extends Escena {
  constructor() {
    super(9.2);
    this.p = new Parts(450);
    this.vuelo = null;
  }
  luz() {
    const t = this.t;
    const parp = t < 0.7 ? [0, 1, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    return parp * (1 - tramo(t, 8.2, 9.0));
  }
  /** Punto de la cabeza (unidades de avatar) girado con la cabeza. */
  enCabeza(p, rc) { const r = rot2([p[0] - RIG.cuello[0], p[1] - RIG.cuello[1]], rc); return [RIG.cuello[0] + r[0], RIG.cuello[1] + r[1]]; }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 160], manoI = [9, 160], x = X, sy = 1, sx = 1;
    // enseña el chupito
    const kEns = eInOut(tramo(t, 0.45, 0.9));
    manoD = mezcla(manoD, [64, 108], kEns);
    if (t > 0.6 && t < 1.15) { pose.cara = "guino"; pose.rc = 0.05; }
    // coge impulso y lo lanza
    if (t >= 1.1) manoD = mezcla([64, 108], [72, 146], eInOut(tramo(t, 1.1, 1.33)));
    if (t >= 1.33) manoD = mezcla([72, 146], [78, 26], eOut(tramo(t, 1.33, T_LANZA)));
    if (t >= 1.6) manoD = mezcla([78, 26], [72, 160], eInOut(tramo(t, 1.6, 2.0)));
    // ¿dónde está? (mano de visera)
    const kVis = eInOut(tramo(t, 1.75, 2.1)) * (1 - eInOut(tramo(t, 2.65, 2.85)));
    if (kVis > 0) { pose.brazoIDelante = true; manoI = mezcla(manoI, [24, 30], kVis); }
    if (t > 1.5 && t < T_PILLA) {
      pose.cara = "sorpresa";
      pose.rc = -0.12 * eInOut(tramo(t, 1.5, 1.8)) + (t < 2.7 ? 0.1 * Math.sin((t - 1.9) * 5) * tramo(t, 1.9, 2.1) : 0);
    }
    // se coloca debajo, brazos abiertos, cabeza atrás y boca abierta
    const kPos = eInOut(tramo(t, 2.75, 3.1));
    if (t >= 2.75) {
      pose.rc = lerp(pose.rc, -0.28, kPos);
      x = X - 18 * Math.sin(tramo(t, 2.75, 3.15) * Math.PI);
      if (t < 3.15) { const a = andar((t - 2.75) * 16, 0.6); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; }
    }
    // sin manos: brazos abiertos mientras bebe
    const kSinManos = eInOut(tramo(t, 2.8, 3.1)) * (1 - eInOut(tramo(t, 4.6, 5.0)));
    manoD = mezcla(manoD, [112, 110], kSinManos); manoI = mezcla(manoI, [-34, 110], kSinManos);
    if (t >= T_PILLA && t < T_ESCUPE) {
      pose.cara = t < 3.45 ? "sorpresa" : "dormido";
      const kTrago = eInOut(tramo(t, 3.4, 3.8));
      pose.rc = -0.28 - 0.06 * kTrago + 0.012 * Math.sin(t * 40) * kTrago;
      sy = 1 + 0.015 * Math.sin(t * 22) * kTrago; // tragos
    }
    // cabezazo: el vaso sale volando
    if (t >= T_ESCUPE) {
      const k = tramo(t, T_ESCUPE, T_ESCUPE + 0.15);
      pose.rc = lerp(-0.34, 0.14, eOut(k)) * (1 - eInOut(tramo(t, 4.7, 5.0)));
      pose.cara = t < T_CABEZA ? "guino" : "sonrisa";
    }
    // se pone rojo y echa vapor
    if (t >= T_ROJO) {
      const kR = tramo(t, T_ROJO, 6.0);
      pose.cara = t < 7.25 ? (Math.floor(t * 3) % 3 === 2 && t > 6.3 ? "borracho" : "sorpresa") : "risa";
      sx = 1 + 0.025 * kR * Math.sin(t * 45) * (1 - tramo(t, 7.1, 7.4));
      pose.rc = 0.03 * Math.sin(t * 37) * kR * (1 - tramo(t, 7.1, 7.4));
      if (t > 6.0 && t < 7.2) { manoD = [76 + 4 * Math.sin(t * 30), 150]; manoI = [2 - 4 * Math.sin(t * 30), 150]; }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    // el chupito en la mano
    if (t < T_LANZA) pose.objD2 = (g, m) => chupito(g, m[0] + 2, m[1] - 11, 0, 1, 1, false);
    const m = matAv(x, PIES, ESC, 0, sx, sy);
    return { pose, m, x };
  }
  /** Chupito en la boca (unidades de avatar, ya girado con la cabeza). */
  enBoca(rc) {
    const angL = -1.95, b = this.enCabeza([39, 57], rc), c = rot2([0, CH / 2], angL + rc);
    return { x: b[0] + c[0], y: b[1] + c[1], ang: angL + rc };
  }
  enLaCabeza(rc, t) {
    const sube = t > 6.0 && t < 7.3 ? Math.abs(Math.sin(t * 26)) * 3 : 0;
    const p = this.enCabeza([41, -2 - CH / 2 - sube], rc);
    return { x: p[0], y: p[1], ang: Math.PI + rc + (t > 6.0 && t < 7.3 ? 0.12 * Math.sin(t * 31) : 0) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("lanza", t > T_LANZA, () => { const q = aPant(e.m, [80, 16]); this.vuelo = { x: q[0], y: q[1] }; });
    this.una("pilla", t > T_PILLA, () => {
      temblar(12, 0.3);
      const q = aPant(e.m, this.enCabeza([39, 57], e.pose.rc));
      for (let i = 0; i < 16; i++) { const a = azar(-Math.PI, 0), v = azar(150, 380); p.nueva(P.CHISPA, q[0], q[1] - 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
      p.nueva(P.DESTELLO, q[0], q[1] - 10, 0, 0, 0.35, 90);
    });
    this.una("cabeza", t > T_CABEZA, () => { temblar(5, 0.15); const q = aPant(e.m, this.enCabeza([41, -10], e.pose.rc)); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 50); });
    // vapor por las orejas (a golpes, como una olla)
    if (t > 5.75 && t < 7.7) {
      const fuerza = t < 7.2 ? 1 : 1 - tramo(t, 7.2, 7.7);
      const pulso = 0.6 + 0.4 * Math.max(0, Math.sin(t * 9));
      for (const [ox, dir] of [[10, -1], [68, 1]]) {
        const q = aPant(e.m, this.enCabeza([ox, 50], e.pose.rc));
        if (Math.random() < 40 * dt * fuerza * pulso) p.nueva(P.VAPOR, q[0] + dir * 6, q[1], dir * azar(240, 420), azar(-120, -40), azar(0.6, 1.1), azar(22, 40));
        if (Math.random() < 14 * dt * fuerza) p.nueva(P.HUMO, q[0] + dir * 10, q[1] - 6, dir * azar(160, 260), azar(-160, -80), azar(0.8, 1.3), azar(26, 40));
      }
      // y por debajo del vasito
      if (t < 7.3 && Math.random() < 18 * dt) { const q = aPant(e.m, this.enCabeza([41, -4], e.pose.rc)); p.nueva(P.VAPOR, q[0] + azar(-14, 14), q[1], azar(-60, 60), azar(-260, -140), azar(0.5, 0.9), azar(16, 28)); }
    }
    this.una("pita", t > 5.75, () => temblar(10, 0.35));
    if (t > T_PILLA + 0.2 && t < 3.8 && Math.random() < 6 * dt) { const q = aPant(e.m, this.enCabeza([30, 62], e.pose.rc)); p.nueva(P.GOTA, q[0], q[1], azar(-50, 0), azar(-40, 20), 0.6, azar(2.5, 3.5)); }
    p.actualizar(dt);
  }
  /** Dónde está el chupito cuando no lo lleva en la mano (pantalla). */
  chupitoSuelto(e) {
    const t = this.t, rc = e.pose.rc;
    if (t >= T_LANZA && t < 2.0 && this.vuelo) {
      const s = t - T_LANZA;
      return { x: this.vuelo.x + 60 * s, y: this.vuelo.y - 1300 * s + 700 * s * s, ang: s * 13, nivel: 1 };
    }
    if (t >= T_VUELVE && t < T_PILLA) {
      const B = this.enBoca(-0.28), mFin = matAv(X, PIES, ESC), dest = aPant(mFin, [B.x, B.y]);
      const T = T_PILLA - T_VUELVE, s = t - T_VUELVE, gr = 1500, y0 = -60;
      const v0 = (dest[1] - y0 - 0.5 * gr * T * T) / T;
      return { x: lerp(dest[0] + 40, dest[0], s / T), y: y0 + v0 * s + 0.5 * gr * s * s, ang: B.ang + (T - s) * 14, nivel: 1 };
    }
    if (t >= T_ESCUPE && t < T_CABEZA) {
      const B = this.enBoca(-0.34), mA = matAv(X, PIES, ESC);
      const a = aPant(mA, [B.x, B.y]), Hh = this.enLaCabeza(0, T_CABEZA), b = aPant(mA, [Hh.x, Hh.y]);
      const u = tramo(t, T_ESCUPE, T_CABEZA);
      return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u) - 190 * 4 * u * (1 - u), ang: lerp(B.ang, Math.PI * 3, u), nivel: 0 };
    }
    return null;
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(), rc = e.pose.rc;
    fondo(g, "#000");
    foco(g, X, X, PIES, 200, luz);
    // calor detrás de la cabeza
    const kR = tramo(t, T_ROJO, 6.0) * (1 - tramo(t, 7.3, 8.4));
    if (kR > 0) {
      const q = aPant(e.m, this.enCabeza([39, 40], rc));
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * kR * (0.85 + 0.15 * Math.sin(t * 20));
      g.drawImage(BLOB.rojo, q[0] - 150, q[1] - 160, 300, 300); g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    // se pone rojo, de la barbilla a la frente
    if (kR > 0) {
      const tope = lerp(78, -6, eInOut(tramo(t, T_ROJO, 6.0)));
      conMat(g, e.m, () => {
        g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(rc); g.translate(-RIG.cuello[0], -RIG.cuello[1]);
        g.beginPath(); g.rect(0, tope, 78, 90); g.clip();
        g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.72 * (1 - tramo(t, 7.3, 8.4));
        g.fillStyle = "#ff5a3c"; g.beginPath(); g.ellipse(39, 45, 29, 32, 0, 0, 6.283); g.fill();
      });
    }
    // el chupito: en la boca, en el aire o boca abajo en la cabeza
    if (t >= T_PILLA && t < T_ESCUPE) {
      const B = this.enBoca(rc), nivel = 1 - eInOut(tramo(t, 3.45, 4.2));
      conMat(g, e.m, () => chupito(g, B.x, B.y, B.ang, 1, nivel, true));
    } else if (t >= T_CABEZA) {
      const C = this.enLaCabeza(rc, t);
      conMat(g, e.m, () => chupito(g, C.x, C.y, C.ang, 1, 0, false));
    } else {
      const S = this.chupitoSuelto(e);
      if (S) {
        // estela de brillo
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5;
        g.drawImage(BLOB2.oroClaro, S.x - 30, S.y - 30, 60, 60); g.restore();
        chupito(g, S.x, S.y, S.ang, ESC, S.nivel, false);
      }
    }
    this.p.dibujar(g);
    // ¡AL VUELO!
    if (t > T_PILLA && t < 5.7) {
      const k = tramo(t, T_PILLA, T_PILLA + 0.18), a = Math.min(1, k * 4) * (1 - tramo(t, 5.35, 5.7));
      g.save(); g.translate(W / 2, 112); g.rotate(-0.04); g.scale(lerp(2.4, 1, eIn(k)), lerp(2.4, 1, eIn(k)));
      const gr = g.createLinearGradient(0, -90, 0, 10);
      gr.addColorStop(0, "#fff7c2"); gr.addColorStop(0.5, "#ffc933"); gr.addColorStop(1, "#ff7a00");
      txt(g, "¡AL VUELO!", 0, 0, { tam: 124, peso: 400, fam: FC, color: gr, borde: "#3d1500", bordeAncho: 11, alfa: a, esp: 4, glow: "rgba(255,170,40,.6)", glowTam: 18 });
      g.restore();
    }
    // empieza a oscuras (el foco se enciende) y acaba a oscuras
    const negro = Math.max(t < 0.7 ? 0.97 * (1 - luz) : 0, tramo(t, 8.4, 9.15));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00002", nombre: "Chupito al vuelo", crear: () => new EscenaChupito() });
})();
