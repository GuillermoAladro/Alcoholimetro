"use strict";
/*
 * 00220 · EL PERRO DEL PARQUE
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el patio del parque de bomberos, el perro del parque (diseño propio: color crema con manchas caramelo, una oreja
 * marrón y collar rojo) no le quita ojo al casco de Marcos. Da un salto, se lo arranca de la cabeza (¡ZAS!) y sale
 * corriendo. Persecución en círculos por el patio: perro, Marcos (con sus rizos al aire) y Guillermo. Acaban los dos
 * mareados… y el perro le lleva el casco a Guillermo, que se lo pone y saluda: ¡GUAU! Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4;
const CX = 512, RX = 330;                    // la vuelta: centro y radio en x
const T_MIRA = 0.5, T_AGACHA = 1.05, T_SALTO = 1.35, T_ZAS = 1.55, T_HUYE = 1.8;
const T_V0 = 2.0, T_V1 = 5.8, T_TRAE = 6.0, T_DEJA = 6.6, T_COGE = 6.75, T_PONE = 7.25, T_FIN = 8.95, DUR = 9.7;
const XG0 = 390, XM0 = 610, XP0 = 800;
const TH_G0 = Math.asin((XG0 - CX) / RX), TH_M0 = Math.asin((XM0 - CX) / RX), TH_P0 = Math.asin((900 - CX) / RX);

/** Posición en la vuelta: x, pies, escala, z (1 delante, -1 detrás). */
function enVuelta(th) {
  const z = Math.cos(th);
  return { x: CX + RX * Math.sin(th), y: 515 + 30 * (z + 1), s: 0.8 + 0.1 * (z + 1), z };
}

// ------------------------------------------------------------------------------------------- el perro
const CREMA = "#f4e3c4", CREMA_O = "#cdb48a", CARAMELO = "#c47a32", CONTORNO = "#5a3a1a";
/**
 * Perro de perfil mirando a la derecha (dir = -1, a la izquierda). (x, y) = el suelo bajo el cuerpo.
 * o: { fase, corre 0–1, sentado 0–1, cola (velocidad), boca 0–1, casco, ojos: "normal" | "feliz" | "arriba", agacha 0–1 }
 */
function perro(g, x, y, s, dir, o, t) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  g.lineJoin = "round"; g.lineCap = "round";
  const f = o.fase || 0, c = o.corre || 0, sen = o.sentado || 0, ag = o.agacha || 0;
  const bote = -Math.abs(Math.sin(f)) * 10 * c;
  // sombra
  g.fillStyle = "rgba(0,0,0,.22)"; g.beginPath(); g.ellipse(0, 2, 62, 8, 0, 0, 6.283); g.fill();
  g.translate(0, bote + ag * 10);
  // sentado: el cuerpo gira alrededor de la cadera de atrás
  const giro = -0.55 * sen;
  const pata = (hx, hy, ang, largo, col) => {
    g.save(); g.translate(hx, hy); g.rotate(ang);
    g.strokeStyle = CONTORNO; g.lineWidth = 17; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, largo); g.stroke();
    g.strokeStyle = col; g.lineWidth = 13; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, largo); g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(4, largo + 1, 10, 6, 0, 0, 6.283); g.fill();
    g.strokeStyle = CONTORNO; g.lineWidth = 2; g.stroke();
    g.restore();
  };
  const sw = Math.sin(f) * 0.75 * c;
  // patas del otro lado (más oscuras)
  if (sen < 0.5) {
    pata(-34, -50, -sw * 0.9 + 0.1 * ag, 46 - ag * 8, CREMA_O);
  }
  g.save(); g.translate(-40, -42); g.rotate(giro); g.translate(40, 42);
  pata(30, -48, sw + 0.15 * sen, 46 - ag * 8, CREMA_O);
  // cola
  const cola = Math.sin(t * (o.cola || 10)) * 0.5;
  g.save(); g.translate(-48, -66); g.rotate(cola - 0.3);
  g.strokeStyle = CONTORNO; g.lineWidth = 14; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-26, -10, -30, -40); g.stroke();
  g.strokeStyle = CREMA; g.lineWidth = 10; g.stroke();
  g.strokeStyle = CARAMELO; g.lineWidth = 10; g.beginPath(); g.moveTo(-27, -24); g.quadraticCurveTo(-30, -32, -30, -40); g.stroke();
  g.restore();
  // cuerpo
  const gc = g.createRadialGradient(-6, -72, 6, 0, -58, 60);
  gc.addColorStop(0, "#fff6e6"); gc.addColorStop(0.7, CREMA); gc.addColorStop(1, CREMA_O);
  g.fillStyle = gc; g.beginPath(); g.ellipse(0, -58, 52, 27, 0, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, -58, 52, 27, 0, 0, 6.283); g.clip();
  g.fillStyle = CARAMELO;
  for (const [px, py, rx, ry, r] of [[-18, -76, 24, 14, 0.2], [14, -82, 12, 9, -0.3], [-40, -58, 13, 17, 0.4], [6, -40, 9, 7, 0]]) { g.beginPath(); g.ellipse(px, py, rx, ry, r, 0, 6.283); g.fill(); }
  g.restore();
  g.strokeStyle = CONTORNO; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -58, 52, 27, 0, 0, 6.283); g.stroke();
  // muslo de atrás (sentado: anca doblada)
  if (sen > 0.5) {
    g.fillStyle = CREMA; g.beginPath(); g.ellipse(-30, -46, 22, 18, 0.3, 0, 6.283); g.fill();
    g.strokeStyle = CONTORNO; g.lineWidth = 2.5; g.stroke();
  }
  // pata delantera de este lado
  pata(36, -46, -sw + 0.2 * sen - 0.15 * ag, 46 - ag * 8, CREMA);
  // cuello y cabeza
  g.save(); g.translate(52, -78); g.rotate((o.cabeza || 0) - 0.25 * sen * 0 + 0.08 * Math.sin(f) * c);
  g.fillStyle = CREMA; g.beginPath(); g.ellipse(-6, 6, 18, 22, 0.5, 0, 6.283); g.fill();
  // collar
  g.strokeStyle = "#d8261c"; g.lineWidth = 7; g.beginPath(); g.moveTo(-12, 22); g.quadraticCurveTo(-2, 16, 6, 4); g.stroke();
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(-2, 22, 4.5, 0, 6.283); g.fill(); g.strokeStyle = "#7a4a00"; g.lineWidth = 1.2; g.stroke();
  // oreja de atrás (marrón)
  g.fillStyle = "#8a4e1e"; g.beginPath(); g.ellipse(-2, -22, 9, 17, -0.6 + 0.25 * Math.sin(f * 2) * c, 0, 6.283); g.fill();
  // cabeza
  g.fillStyle = CREMA; g.beginPath(); g.arc(10, -14, 25, 0, 6.283); g.fill();
  g.strokeStyle = CONTORNO; g.lineWidth = 3; g.stroke();
  // hocico y mandíbula
  const b = o.boca || 0;
  g.save(); g.translate(22, 0); g.rotate(0.45 * b);
  g.fillStyle = "#fff8ec"; g.beginPath(); g.ellipse(12, 2, 15, 7, 0.1, 0, 6.283); g.fill();
  g.strokeStyle = CONTORNO; g.lineWidth = 2.5; g.stroke();
  if (b > 0.1 || (!o.casco && c > 0.3)) { g.fillStyle = "#ff7a9a"; g.beginPath(); g.ellipse(14, 9 + 4 * b, 6, 9, 0.2, 0, 6.283); g.fill(); }
  g.restore();
  g.fillStyle = "#fff8ec"; g.beginPath(); g.ellipse(32, -8, 18, 12, -0.05, 0, 6.283); g.fill();
  g.strokeStyle = CONTORNO; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = "#1b1410"; g.beginPath(); g.ellipse(48, -12, 6.5, 5.5, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.arc(46, -14, 1.8, 0, 6.283); g.fill();
  // ojo
  if (o.ojos === "feliz") {
    g.strokeStyle = "#1b1410"; g.lineWidth = 3.5; g.beginPath(); g.arc(16, -18, 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  } else {
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(16, -20, 8, 9, 0, 0, 6.283); g.fill();
    g.strokeStyle = CONTORNO; g.lineWidth = 1.5; g.stroke();
    const py = o.ojos === "arriba" ? -24 : -19;
    g.fillStyle = "#1b1410"; g.beginPath(); g.arc(19, py, 5, 0, 6.283); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(17, py - 2, 1.8, 0, 6.283); g.fill();
  }
  g.strokeStyle = "#8a4e1e"; g.lineWidth = 3; g.beginPath(); g.moveTo(9, -32); g.quadraticCurveTo(16, -36, 24, -32); g.stroke();
  // oreja de delante (crema con punta caramelo, caída)
  g.save(); g.translate(0, -30); g.rotate(0.35 + 0.35 * Math.sin(f * 2 + 1) * c - 0.4 * ag);
  g.fillStyle = CREMA; g.beginPath(); g.moveTo(-4, 0); g.quadraticCurveTo(-18, 14, -10, 34); g.quadraticCurveTo(2, 30, 6, 4); g.closePath(); g.fill();
  g.strokeStyle = CONTORNO; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = CARAMELO; g.beginPath(); g.moveTo(-15, 22); g.quadraticCurveTo(-14, 30, -10, 34); g.quadraticCurveTo(-2, 32, 1, 24); g.closePath(); g.fill();
  g.restore();
  // el casco en la boca
  if (o.casco) {
    const e = 0.62, sw2 = 0.15 * Math.sin(f * 2) * c;
    g.save(); g.translate(42, 6); g.rotate(0.35 + sw2); g.scale(e, e); g.translate(-30, -46);
    cascoBombero(g, 88);
    g.restore();
  }
  g.restore();
  g.restore();
  g.restore();
}

class PerroDelParque extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
  }
  /** Ángulos en la vuelta de los tres. */
  vuelta(t) {
    const uP = eInOut(tramo(t, T_HUYE - 0.1, T_V1 - 0.05)), uM = eInOut(tramo(t, T_V0, T_V1)), uG = eInOut(tramo(t, T_V0 + 0.2, T_V1));
    const thP0 = Math.asin(clamp((this.xPerroSalto(T_HUYE - 0.1) - CX) / RX, -1, 1));
    return { p: thP0 + uP * (Math.PI * 2 + 0.75), m: TH_M0 + uM * (Math.PI * 2 + 0.2), g: TH_G0 + uG * (Math.PI * 2 + 0.06) };
  }
  xPerroSalto(t) {
    // sentado junto a Marcos; salta hacia su cabeza y cae a la derecha
    if (t < T_SALTO) return XP0 - 60 * tramo(t, T_MIRA, T_AGACHA);
    const u = tramo(t, T_SALTO, T_HUYE);
    return lerp(XP0 - 60, XP0 + 20, u) - Math.sin(u * Math.PI) * 120;
  }
  estadoPerro() {
    const t = this.t;
    const o = { fase: 0, corre: 0, sentado: 1, cola: 12, boca: 0, casco: false, ojos: "normal", agacha: 0, cabeza: -0.1 };
    let x = this.xPerroSalto(t), y = PIES, s = 1.05, dir = -1;
    if (t < T_SALTO) {
      o.ojos = t > T_MIRA ? "arriba" : "normal"; o.cabeza = t > T_MIRA ? -0.35 : -0.1;
      if (t > T_MIRA && t < T_AGACHA) { o.sentado = 1 - tramo(t, T_MIRA, T_MIRA + 0.2); o.corre = 0.4; o.fase = t * 14; }
      if (t > T_AGACHA) { o.sentado = 0; o.agacha = eOut(tramo(t, T_AGACHA, T_SALTO)); o.cola = 25; }
    } else if (t < T_HUYE) {
      const u = tramo(t, T_SALTO, T_HUYE);
      y = PIES - Math.sin(u * Math.PI) * 300; o.sentado = 0; o.corre = 0.3; o.cabeza = -0.5 + u * 0.6;
      o.casco = t > T_ZAS; o.ojos = t > T_ZAS ? "feliz" : "arriba";
      if (u > 0.5) dir = 1;
    } else if (t < T_V1 + 0.2) {
      const v = this.vuelta(t), q = enVuelta(v.p);
      x = q.x; y = q.y; s = 1.05 * q.s; dir = Math.cos(v.p) >= 0 ? 1 : -1;
      o.sentado = 0; o.corre = 1; o.fase = t * 18; o.casco = true; o.ojos = "feliz"; o.cola = 18; o.cabeza = 0;
      this.zP = q.z;
    } else {
      // vuelve con Guillermo y se sienta delante de él con el casco
      const v = this.vuelta(T_V1 + 0.2), q = enVuelta(v.p);
      const xg = this.posG().x;
      const u = eInOut(tramo(t, T_TRAE, T_DEJA - 0.15));
      x = lerp(q.x, xg + 110, u); y = lerp(q.y, PIES + 10, u); s = 1.05 * lerp(q.s, 1, u); dir = -1;
      o.corre = u < 0.98 ? 1 : 0; o.fase = t * 16; o.sentado = tramo(t, T_DEJA - 0.15, T_DEJA); o.casco = t < T_COGE;
      o.cola = 20; o.ojos = "feliz"; o.cabeza = -0.2;
      if (t > T_COGE - 0.15 && t < T_COGE + 0.1) { o.cabeza = -0.45; }
      if (t > T_DEJA && t < T_COGE) { o.cabeza = -0.45; }
      if (t > T_PONE + 0.2) { o.boca = Math.max(0, Math.sin((t - T_PONE) * 9)); o.ojos = "feliz"; }
      this.zP = 2;
    }
    return { x, y, s, dir, o };
  }
  posG() {
    const t = this.t;
    if (t < T_V0 + 0.2) return { x: XG0, y: PIES, s: 1, z: 1 };
    const v = this.vuelta(Math.min(t, T_V1)), q = enVuelta(v.g);
    return q;
  }
  posM() {
    const t = this.t;
    if (t < T_V0) return { x: XM0, y: PIES, s: 1, z: 1 };
    const v = this.vuelta(Math.min(t, T_V1)), q = enVuelta(v.m);
    return q;
  }
  poses() {
    const t = this.t, pg = this.posG(), pm = this.posM();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yg = pg.y, ym = pm.y, gg = 0, gm = 0;
    const corriendo = (pose, fase, dir, q) => {
      const w = andar(fase, 1.5); pose.piernaI = w.piernaI; pose.piernaD = w.piernaD;
      const s = Math.sin(fase);
      pose.manoD = [80 + 10 * s, 116]; pose.manoI = [-4 - 10 * s, 116 - 10 * s];
      return w.bote * q.s;
    };
    // ---- Marcos
    if (t < T_ZAS) {
      M.cara = t < T_MIRA ? "risa" : "guino"; M.rc = -0.12;
      if (t > 0.55 && t < 1.15) { M.manoD = [62, 22]; M.cara = "guino"; }       // se coloca bien el casco, orgulloso
    } else if (t < T_V0) {
      M.casco = false; M.cara = "sorpresa"; M.rc = 0.1;
      const k = eOut(tramo(t, T_ZAS, T_ZAS + 0.15));
      M.manoD = mezcla([62, 22], [64, 14], k); M.manoI = mezcla([6, 152], [10, 18], k); M.brazoIDelante = true;
      ym -= Math.sin(tramo(t, T_ZAS, T_ZAS + 0.3) * Math.PI) * 20;
    } else if (t < T_V1) {
      M.casco = false; M.cara = Math.sin(t * 3) > -0.3 ? "sorpresa" : "risa";
      const v = this.vuelta(t), dir = Math.cos(v.m) >= 0 ? 1 : -1;
      ym += corriendo(M, t * 20, dir, pm); gm = 0.08 * dir * tramo(t, T_V0, T_V0 + 0.3); M.rc = 0.1 * dir;
    } else {
      M.casco = false;
      const k = tramo(t, T_V1, T_V1 + 0.3);
      M.cara = t < T_PONE ? "borracho" : t < T_PONE + 0.5 ? "sorpresa" : "risa";
      gm = 0.07 * Math.sin(t * 6) * (1 - tramo(t, T_PONE - 0.2, T_PONE + 0.2)); M.rc = 0.15 * Math.sin(t * 5) * (1 - tramo(t, T_PONE - 0.2, T_PONE + 0.2));
      M.manoD = mezcla([80, 116], [70, 140], k); M.manoI = mezcla([-4, 116], [8, 140], k);
      if (t > T_PONE + 0.5) { M.manoD = [56, 16 + 4 * Math.sin(t * 16)]; M.rc = 0.1; }   // se rasca los rizos
    }
    // ---- Guillermo
    if (t < T_V0 + 0.2) {
      G.cara = t < T_ZAS ? (t < T_MIRA ? "risa" : "sonrisa") : "sorpresa"; G.rc = 0.12;
      if (t > T_ZAS) { G.puntas = 0.5 * tramo(t, T_ZAS, T_ZAS + 0.2); G.manoD = [86, 64]; G.manoI = [-12, 70]; G.cara = t < 1.85 ? "sorpresa" : "risa"; }
    } else if (t < T_V1) {
      const v = this.vuelta(t), dir = Math.cos(v.g) >= 0 ? 1 : -1;
      yg += corriendo(G, t * 20 + 1.2, dir, pg); gg = 0.08 * dir * tramo(t, T_V0 + 0.2, T_V0 + 0.5); G.rc = 0.1 * dir;
      G.cara = Math.sin(t * 3 + 1) > -0.2 ? "risa" : "sorpresa";
    } else {
      const k = tramo(t, T_V1, T_V1 + 0.3);
      G.cara = "borracho"; G.manoD = mezcla([80, 116], [70, 150], k); G.manoI = mezcla([-4, 116], [9, 150], k);
      gg = 0.07 * Math.sin(t * 6 + 1) * (1 - tramo(t, T_DEJA - 0.3, T_DEJA)); G.rc = 0.15 * Math.sin(t * 5 + 1) * (1 - tramo(t, T_DEJA - 0.3, T_DEJA));
      if (t > T_DEJA - 0.3) {
        // tiende las manos al perro, coge el casco, se lo pone y saluda
        const mG = matAv(pg.x, PIES, ESC);
        const D = this.estadoPerro(), boca = mG.inverse().transformPoint(new DOMPoint(D.x - 50 * D.s, D.y - 110 * D.s));
        const tiende = eInOut(tramo(t, T_DEJA - 0.3, T_COGE));
        G.cara = t < T_COGE ? "sorpresa" : "risa"; G.rc = 0.1;
        G.manoD = mezcla([70, 150], [boca.x + 8, boca.y], tiende); G.manoI = mezcla([9, 150], [boca.x - 14, boca.y + 4], tiende); G.brazoIDelante = true;
        if (t > T_COGE) {
          const sube = eInOut(tramo(t, T_COGE + 0.05, T_PONE));
          G.manoD = mezcla([boca.x + 8, boca.y], [62, -2], sube); G.manoI = mezcla([boca.x - 14, boca.y + 4], [18, -2], sube);
          G.cara = sube > 0.5 ? "guino" : "risa";
        }
        if (t > T_PONE) {
          G.casco = true;
          const k2 = eOut(tramo(t, T_PONE, T_PONE + 0.3));
          G.manoD = mezcla([62, -2], [64, 26], k2); G.manoI = mezcla([18, -2], [9, 158], k2); G.brazoIDelante = false;
          G.cara = t < T_PONE + 0.35 ? "sorpresa" : "guino"; G.rc = -0.04;
          if (t > 8.1) G.cara = "risa";
        }
        if (t > T_COGE && t < T_PONE) {
          G.objD2 = (g) => {
            const c = mezcla(G.manoD, G.manoI, 0.5);
            g.save(); g.translate(c[0], c[1] - 10); g.scale(0.62, 0.62); g.translate(-45, -40); cascoBombero(g, 91); g.restore();
          };
        }
      }
    }
    const sG = ESC * (pg.s || 1), sM = ESC * (pm.s || 1);
    return { G, M, mG: matAv(pg.x, yg, sG, gg), mM: matAv(pm.x, ym, sM, gm), zG: pg.z, zM: pm.z };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("zas", t > T_ZAS, () => {
      temblar(10, 0.3);
      const c = aPant(matAv(XM0, PIES, ESC), [37, 0]);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.3, 200);
      for (let i = 0; i < 10; i++) { const a = azar(0, 6.283), v = azar(120, 280); p.nueva(P.CHISPA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    this.una("aterriza", t > T_HUYE, () => { temblar(5, 0.15); for (let i = 0; i < 6; i++) p.nueva(P.POLVO, XP0 + 20 + azar(-40, 40), PIES, azar(-80, 80), azar(-30, -5), azar(0.4, 0.7), azar(16, 26)); });
    if (t > T_HUYE && t < T_V1 && Math.random() < 22 * dt) {
      const D = this.estadoPerro(), e = this.poses();
      p.nueva(P.POLVO, D.x + azar(-30, 30), D.y, azar(-40, 40), azar(-20, -5), azar(0.4, 0.7), azar(14, 22) * D.s);
      if (t > T_V0) for (const m of [e.mG, e.mM]) { const c = aPant(m, [39, 232]); p.nueva(P.POLVO, c[0] + azar(-20, 20), c[1], azar(-40, 40), azar(-20, -5), azar(0.3, 0.6), azar(14, 22)); }
    }
    this.una("deja", t > T_DEJA, () => temblar(4, 0.15));
    this.una("pone", t > T_PONE, () => {
      temblar(9, 0.3);
      const e = this.poses(), c = aPant(e.mG, [39, 0]);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.35, 220);
      for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, azar(100, 924), azar(-60, 0), azar(-40, 40), azar(40, 160), azar(1.8, 2.6), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.suelo = () => PIES + 6;
    p.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const cielo = g.createLinearGradient(0, -60, 0, 300);
    cielo.addColorStop(0, "#ff9a5a"); cielo.addColorStop(0.5, "#ffc98a"); cielo.addColorStop(1, "#ffe9c0");
    g.fillStyle = cielo; g.fillRect(-60, -60, W + 120, 600);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(BLOB2.oroClaro, 640, 20, 260, 260); g.restore();
    // ciudad y árboles a lo lejos
    g.fillStyle = "#d9906a";
    for (const [x, w, h] of [[-60, 90, 150], [20, 70, 210], [800, 80, 190], [870, 60, 250], [925, 110, 170]]) g.fillRect(x, 520 - h, w, h);
    g.fillStyle = "rgba(255,240,200,.5)";
    for (const [x, h] of [[30, 210], [880, 250], [935, 170]]) for (let y = 520 - h + 14; y < 500; y += 26) { g.fillRect(x + 8, y, 10, 12); g.fillRect(x + 30, y, 10, 12); }
    const r = semilla(4);
    for (let i = 0; i < 26; i++) {
      const x = i < 8 ? -60 + i * 14 + r() * 10 : 800 + (i - 8) * 14 + r() * 10, y = 440 + r() * 40, rr = 26 + r() * 22;
      g.fillStyle = i % 2 ? "#5a8a3a" : "#4a7a32"; g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill();
    }
    // edificio del parque
    const pared = g.createLinearGradient(0, 160, 0, 520);
    pared.addColorStop(0, "#e9d6b2"); pared.addColorStop(1, "#c4ab84");
    g.fillStyle = pared; g.fillRect(40, 160, 760, 360);
    g.fillStyle = "#b22318"; g.fillRect(30, 150, 780, 22);
    // portón abierto con el camión asomando de frente
    g.fillStyle = "#a99673"; g.fillRect(150, 236, 300, 284);
    g.fillStyle = "#1e2026"; g.fillRect(162, 248, 276, 272);
    g.fillStyle = "#8f989f"; for (let y = 248; y < 282; y += 9) g.fillRect(162, y, 276, 7);
    // frente del camión (genérico)
    g.fillStyle = "#c41a10"; rectR(g, 196, 300, 208, 214, 14); g.fill();
    const vid = g.createLinearGradient(0, 312, 0, 380); vid.addColorStop(0, "#d8f2ff"); vid.addColorStop(1, "#4a7ea8");
    g.fillStyle = vid; rectR(g, 210, 314, 180, 66, 8); g.fill();
    g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.moveTo(230, 314); g.lineTo(256, 314); g.lineTo(226, 380); g.lineTo(212, 380); g.lineTo(212, 340); g.fill();
    g.fillStyle = "#2a2a2e"; rectR(g, 230, 288, 140, 12, 4); g.fill();
    g.fillStyle = "#4f8dff"; rectR(g, 236, 280, 36, 12, 5); g.fill(); rectR(g, 328, 280, 36, 12, 5); g.fill();
    g.fillStyle = "#ff4a4a"; rectR(g, 284, 280, 32, 12, 5); g.fill();
    g.fillStyle = "#c9d0d6"; for (let x = 236; x < 366; x += 14) g.fillRect(x, 400, 8, 46);
    g.fillStyle = "#fff7c0"; g.beginPath(); g.arc(222, 470, 13, 0, 6.283); g.arc(378, 470, 13, 0, 6.283); g.fill();
    g.fillStyle = "#ffd23a"; g.fillRect(196, 452, 208, 8);
    // ventanas y portón cerrado
    g.fillStyle = "#a99673"; g.fillRect(500, 236, 260, 284);
    g.fillStyle = "#9aa3ab"; g.fillRect(512, 248, 236, 272);
    g.fillStyle = "rgba(60,68,76,.35)"; for (let y = 254; y < 520; y += 12) g.fillRect(512, y, 236, 3);
    g.fillStyle = "#2b3440"; for (const x of [90, 300, 560, 690]) { rectR(g, x - 22, 186, 44, 34, 6); g.fill(); }
    // caseta del perro a la derecha
    g.save(); g.translate(905, 516);
    g.fillStyle = "#e8b04a"; g.fillRect(-70, -110, 140, 110);
    g.fillStyle = "#b22318"; g.beginPath(); g.moveTo(-88, -104); g.lineTo(0, -170); g.lineTo(88, -104); g.closePath(); g.fill();
    g.fillStyle = "#2a1a10"; g.beginPath(); g.moveTo(-30, 0); g.lineTo(-30, -50); g.arc(0, -50, 30, Math.PI, 0); g.lineTo(30, 0); g.closePath(); g.fill();
    g.fillStyle = "#c47a32"; g.beginPath(); g.arc(-48, -86, 9, 0, 6.283); g.fill();
    g.restore();
    // valla del fondo
    g.fillStyle = "#e7e2d6";
    for (let x = 820; x < W + 60; x += 22) { g.fillRect(x, 400, 12, 120); g.beginPath(); g.moveTo(x, 400); g.lineTo(x + 6, 390); g.lineTo(x + 12, 400); g.fill(); }
    g.fillRect(810, 430, 300, 8); g.fillRect(810, 480, 300, 8);
    for (let x = -60; x < 40; x += 22) { g.fillRect(x, 400, 12, 120); g.beginPath(); g.moveTo(x, 400); g.lineTo(x + 6, 390); g.lineTo(x + 12, 400); g.fill(); }
    g.fillRect(-60, 430, 100, 8); g.fillRect(-60, 480, 100, 8);
    // patio
    const gs = g.createLinearGradient(0, 515, 0, H + 60);
    gs.addColorStop(0, "#a8a39a"); gs.addColorStop(1, "#6f6a62");
    g.fillStyle = gs; g.fillRect(-60, 515, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(-60, 515, W + 120, 2);
    // la vuelta marcada en el suelo (un círculo de pintura)
    g.strokeStyle = "rgba(255,210,58,.55)"; g.lineWidth = 5;
    g.beginPath(); g.ellipse(CX, 548, RX + 10, 34, 0, 0, 6.283); g.stroke();
    CT.set("fondo", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), D = this.estadoPerro();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // orden por profundidad
    const zP = t > T_HUYE && t < T_V1 + 0.2 ? enVuelta(this.vuelta(t).p).z : 2;
    const cosas = [
      { z: e.zM - 0.01, f: () => pintarAvatar(g, e.mM, e.M, t) },
      { z: e.zG, f: () => pintarAvatar(g, e.mG, e.G, t) },
      { z: zP, f: () => perro(g, D.x, D.y, D.s, D.dir, D.o, t) },
    ];
    // el perro va delante cuando está sentado junto a ellos
    if (t < T_HUYE) cosas[2].z = 2;
    cosas.sort((a, b) => a.z - b.z).forEach((c) => c.f());
    this.p.dibujar(g);
    // mareo
    if (t > T_V1 && t < T_PONE + 0.3) {
      for (const [m, f] of [[e.mG, 0], [e.mM, 2]]) {
        const c = aPant(m, [39, -6]);
        for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.094 + f; brillo(g, c[0] + Math.cos(a) * 48, c[1] + Math.sin(a) * 12, 16, 0.9 * (1 - tramo(t, T_PONE, T_PONE + 0.3))); }
      }
    }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("?", 760, 380, T_MIRA + 0.1, 0.6, 60, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡ZAS!", 760, 200, T_ZAS, 0.55, 64, "#ffd34d", "#3a2400", 0.12);
    ono("¡EH!", 470, 210, T_ZAS + 0.2, 0.55, 54, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡VUELVE!", 512, 150, 2.6, 1.2, 60, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡DAME ESO!", 512, 150, 4.2, 1.2, 56, "#fffdf5", "#1b1b1b", 0.05);
    // ¡GUAU!
    for (const [a0, a1, x, y, s0] of [[1.85, 2.5, 860, 300, 0.55], [T_DEJA, T_FIN + 0.7, 512, 104, 1]]) {
      if (t > a0 && t < a1) {
        const d = t - a0, k = tramo(d, 0, 0.16);
        const s = s0 * lerp(1.8, 1, eIn(k)) * (1 + 0.05 * Math.max(0, Math.sin(d * 9)));
        const spr = this.titulo();
        g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, a1 - 0.2, a1)); g.translate(x, y); g.rotate(-0.05); g.scale(s, s);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(560, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#fff8e0"); gr.addColorStop(0.5, "#ffc86a"); gr.addColorStop(1, "#d8701a");
    txt(g, "¡GUAU!", 286, 170, { tam: 168, peso: 400, fam: FC, color: "#2a1200", esp: 6, max: 520 });
    txt(g, "¡GUAU!", 280, 162, { tam: 168, peso: 400, fam: FC, color: gr, borde: "#2a1200", bordeAncho: 12, esp: 6, glow: "rgba(255,170,60,.8)", glowTam: 22, max: 520 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00220", nombre: "El perro del parque", crear: () => new PerroDelParque() });
})();
