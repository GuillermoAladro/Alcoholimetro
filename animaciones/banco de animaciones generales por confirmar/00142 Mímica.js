"use strict";
/*
 * 00142 · MÍMICA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Juegan a las adivinanzas con mímica, con un reloj de arena. Rodrigo hace gestos (beber de una jarra invisible,
 * una nube de espuma sobre la cabeza, brindar) y a Guillermo le salen bocadillos equivocados: ¿TROMPETA?,
 * ¿PELUCA?, ¿TAXI? Rodrigo echa humo, lo repite todo a toda prisa y a Guillermo se le enciende la bombilla:
 * ¡CERVEZA! Les aparecen dos jarras de verdad y las levantan.
 */
(() => {
const ESC = 1.62, XG = 292, XR = 732;
const T_G1 = 2.05, T_G2 = 3.75, T_G3 = 5.55, T_IDEA = 7.85, T_CERV = 8.05, T_PREMIO = 8.7, T_APAGA = 9.95;
const CT = cacheTexto();

/** Jarra en la mano izquierda (de la pantalla), en espejo. */
function jarraIzq(pose, inc, nivel) {
  pose.objI = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); };
  pose.objI2 = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t); g.restore(); };
}
/** Contorno a trazos de una jarra «invisible» (unidades de avatar, asa en (0, 0)). */
function jarraFantasma(g, m, ang, esp, t) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang); if (esp) g.scale(-1, 1); g.scale(1.15, 1.15);
  g.fillStyle = "rgba(200,240,255,.10)"; rectR(g, 3, -18, 28, 36, 3.5); g.fill();
  g.setLineDash([3.5, 2.5]); g.lineDashOffset = -t * 20;
  g.strokeStyle = "rgba(225,250,255,.95)"; g.lineWidth = 2.1;
  rectR(g, 3, -18, 28, 36, 3.5); g.stroke();
  g.beginPath(); g.moveTo(4, -10); g.bezierCurveTo(-8, -11, -8, 11, 4, 10); g.stroke();
  // la espuma (de mentira) por arriba
  g.beginPath(); g.moveTo(2, -17);
  for (let i = 0; i <= 4; i++) g.arc(3 + 7 * i, -19, 3.6 + (i % 2) * 1.2, Math.PI, 0);
  g.stroke();
  g.setLineDash([]);
  g.restore();
}

class Mimica extends Escena {
  constructor() {
    super(10.5);
    this.p = new Parts(360);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, 10.45)); }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let gD = [70, 158], gI = [9, 160], rD = [68, 157], rI = [9, 157], yR = 0, yG = 0, sxR = 1;
    const ghost = [];   // contornos invisibles de Rodrigo: { mano: "D" | "I", ang }
    // Guillermo piensa con la mano en la barbilla
    gD = [50, 76];
    if (t > 0.5) { G.rc = 0.08; }
    // «1 palabra»
    if (t > 0.45 && t < 1.15) { const k = eOut(tramo(t, 0.45, 0.6)) * (1 - eInOut(tramo(t, 0.95, 1.15))); rD = mezcla(rD, [84, 36], k); R.cara = "guino"; }
    // 1) beber
    if (t >= 1.05 && t < 2.35) {
      const k = eInOut(tramo(t, 1.05, 1.3)) * (1 - eInOut(tramo(t, 2.1, 2.35))), kT = eInOut(tramo(t, 1.35, 1.7));
      R.rc = -0.3 * kT * k;
      const b = boca(R.rc, "rodrigo"), ang = -0.25 - 1.0 * kT;
      const r = rot2(JARRA.borde, ang);
      rD = mezcla([68, 157], [b[0] - r[0], b[1] - r[1]], k);
      if (k > 0.05) ghost.push({ mano: "D", ang });
      if (kT > 0.5 && k > 0.5) R.cara = "dormido";
    }
    // ¡NO! (brazos en cruz) y niega con la cabeza
    const no = (t0) => {
      if (t < t0 || t > t0 + 0.55) return;
      const k = eOut(tramo(t, t0, t0 + 0.12)) * (1 - eInOut(tramo(t, t0 + 0.4, t0 + 0.55)));
      rD = mezcla(rD, [18, 104], k); rI = mezcla(rI, [58, 104], k);
      R.rc = 0.16 * Math.sin((t - t0) * 30) * k; R.cara = "sorpresa";
    };
    no(2.4);
    // 2) espuma: una nube enorme sobre la cabeza
    if (t >= 2.95 && t < 4.05) {
      const k = eInOut(tramo(t, 2.95, 3.2)) * (1 - eInOut(tramo(t, 3.85, 4.05))), w = t * 9;
      rD = mezcla(rD, [74 + 12 * Math.cos(w), -6 + 8 * Math.sin(w)], k);
      rI = mezcla(rI, [2 - 12 * Math.cos(w), -6 + 8 * Math.sin(w)], k);
      R.cara = "risa"; R.rc = 0.05 * Math.sin(t * 6);
      yR = -Math.abs(Math.sin(t * 8)) * 6 * k;
    }
    // se tapa la cara
    if (t >= 4.05 && t < 4.7) {
      const k = eOut(tramo(t, 4.05, 4.2)) * (1 - eInOut(tramo(t, 4.5, 4.7)));
      rI = mezcla([9, 157], [30, 44], k); R.cara = "dormido"; R.rc = 0.1 * k;
    }
    // 3) brindar: levanta la jarra invisible hacia Guillermo, dos veces
    if (t >= 4.7 && t < 6.05) {
      const k = eInOut(tramo(t, 4.7, 4.95)) * (1 - eInOut(tramo(t, 5.85, 6.05)));
      const ch = Math.max(0, Math.sin((t - 5.0) * 9)) * (t > 5.0 && t < 5.7 ? 1 : 0);
      rI = mezcla([9, 157], [-26 - 10 * ch, 44 - 6 * ch], k);
      if (k > 0.05) ghost.push({ mano: "I", ang: -0.15 * ch });
      R.cara = "risa"; R.rc = -0.08 * k;
    }
    // ¡no puede ser!: manos arriba, pelo de punta y humo
    if (t >= 6.05 && t < 6.9) {
      const k = eOut(tramo(t, 6.05, 6.2)) * (1 - eInOut(tramo(t, 6.7, 6.9)));
      rD = mezcla([68, 157], [96, 22 + Math.sin(t * 20) * 4], k); rI = mezcla([9, 157], [-20, 22 + Math.sin(t * 20 + 1) * 4], k);
      R.cara = "sorpresa"; R.puntas = k; R.rc = 0.04 * Math.sin(t * 25);
      sxR = 1 + 0.03 * k;
    }
    // todo seguido a toda prisa: beber, espuma, brindar
    if (t >= 6.9 && t < T_IDEA) {
      const u = (t - 6.9) / (T_IDEA - 6.9);
      if (u < 0.33) { const b = boca(-0.25, "rodrigo"), r = rot2(JARRA.borde, -1.1); rD = [b[0] - r[0], b[1] - r[1]]; R.rc = -0.25; R.cara = "dormido"; ghost.push({ mano: "D", ang: -1.1 }); }
      else if (u < 0.66) { const w = t * 16; rD = [74 + 12 * Math.cos(w), -6 + 8 * Math.sin(w)]; rI = [2 - 12 * Math.cos(w), -6 + 8 * Math.sin(w)]; R.cara = "risa"; }
      else { rI = [-26, 44]; R.cara = "risa"; ghost.push({ mano: "I", ang: 0 }); }
      R.puntas = 0.3;
    }
    // Guillermo: adivina mal tres veces (dedo arriba, muy seguro) y se desinfla
    for (const t0 of [T_G1, T_G2, T_G3]) {
      if (t < t0 - 0.1 || t > t0 + 0.75) continue;
      const k = eOut(tramo(t, t0 - 0.1, t0 + 0.05)) * (1 - eInOut(tramo(t, t0 + 0.55, t0 + 0.75)));
      gD = mezcla([50, 76], t0 === T_G3 ? [96, -6] : [84, 8], k);
      G.cara = t < t0 + 0.4 ? "risa" : "dormido"; G.rc = -0.05;
    }
    if (t > 6.1 && t < T_IDEA) { G.cara = "sorpresa"; G.rc = 0.04 * Math.sin(t * 3); }
    // ¡la bombilla!: ¡CERVEZA!
    if (t >= T_IDEA) {
      const k = eOut(tramo(t, T_CERV - 0.05, T_CERV + 0.12));
      G.cara = t < T_CERV ? "sorpresa" : "risa";
      gD = mezcla([50, 76], [98, 4 + Math.sin(t * 14) * 3], k); gI = mezcla([9, 160], [-20, 4 + Math.sin(t * 14 + 1) * 3], k);
      yG = -Math.abs(Math.sin((t - T_CERV) * 9)) * 20 * k * (1 - tramo(t, 8.6, 8.8));
      // Rodrigo salta de alegría y le señala
      const kR = eOut(tramo(t, T_CERV, T_CERV + 0.15));
      rI = mezcla(rI, [-34, 70], kR); rD = mezcla(rD, [96, 20], kR);
      R.cara = t > T_CERV ? "risa" : R.cara; R.puntas = 0;
      yR = -Math.abs(Math.sin((t - T_CERV) * 9)) * 24 * kR * (1 - tramo(t, 8.6, 8.8));
    }
    // el premio: una jarra de verdad para cada uno
    if (t >= T_PREMIO) {
      const k = eInOut(tramo(t, T_PREMIO - 0.15, T_PREMIO + 0.15));
      gD = mezcla(gD, [92, 46], k); gI = mezcla(gI, [9, 160], eInOut(tramo(t, T_PREMIO, T_PREMIO + 0.3)));
      rI = mezcla(rI, [-14, 46], k); rD = mezcla(rD, [68, 157], eInOut(tramo(t, T_PREMIO, T_PREMIO + 0.3)));
      G.jarra = { inc: -0.15 * k, nivel: 1 }; jarraIzq(R, -0.15 * k, 1);
      G.cara = t > 9.3 ? "guino" : "risa"; R.cara = "risa";
      G.rc = 0.08 * Math.sin(t * 4); R.rc = -0.08 * Math.sin(t * 4 + 1);
    }
    for (const gh of ghost) {
      const a = gh.ang;
      if (gh.mano === "D") R.objD2 = (g, m) => jarraFantasma(g, m, a, false, t);
      else { const prev = R.objI2; R.objI2 = (g, m, aa, tt) => { if (prev) prev(g, m, aa, tt); jarraFantasma(g, m, a, true, t); }; }
    }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    return [{ pose: G, m: matAv(XG, PIES + yG, ESC) }, { pose: R, m: matAv(XR, PIES + yR, ESC, 0, sxR, 1) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const t0 of [T_G1, T_G2, T_G3]) this.una("g" + t0, t > t0, () => temblar(4, 0.12));
    if (t > 6.1 && t < 6.85 && Math.random() < 40 * dt) {
      const e = this.poses(), q = aPant(e[1].m, [38 + azar(-22, 22), azar(0, 14)]);
      p.nueva(P.VAPOR, q[0], q[1], azar(-30, 30), azar(-160, -80), azar(0.6, 1), azar(22, 36));
    }
    this.una("idea", t > T_IDEA, () => {
      temblar(8, 0.2);
      const q = aPant(this.poses()[0].m, [39, -46]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 160);
    });
    this.una("cerveza", t > T_CERV, () => {
      temblar(20, 0.5);
      for (let k = 0; k < 40; k++) p.nueva(P.ESPUMA, 512 + azar(-280, 280), 150 + azar(-30, 30), azar(-200, 200), azar(-380, -80), azar(0.5, 1), azar(6, 12));
      for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(40, W - 40), azar(-60, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    this.una("premio", t > T_PREMIO, () => {
      const e = this.poses();
      for (const [i, u] of [[0, [92, 46]], [1, [-14, 46]]]) {
        const q = aPant(e[i].m, u);
        p.nueva(P.DESTELLO, q[0], q[1] - 20, 0, 0, 0.35, 140);
        for (let k = 0; k < 10; k++) p.nueva(P.ESPUMA, q[0], q[1] - 30, azar(-150, 150), azar(-260, -60), azar(0.4, 0.8), azar(5, 9));
      }
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  relojArena(g, a) {
    const t = this.t, k = tramo(t, 0.5, T_IDEA), x = 512, y = 92;
    g.save(); g.globalAlpha = a; g.translate(x, y);
    if (t > T_IDEA - 0.6 && t < T_IDEA) g.rotate(0.06 * Math.sin(t * 40));
    // marco de madera
    g.fillStyle = "#6b3d1d"; rectR(g, -42, -64, 84, 10, 4); g.fill(); rectR(g, -42, 54, 84, 10, 4); g.fill();
    g.fillStyle = "#4a2a12"; g.fillRect(-38, -56, 6, 112); g.fillRect(32, -56, 6, 112);
    // cristal
    const vidrio = () => { g.beginPath(); g.moveTo(-26, -54); g.lineTo(26, -54); g.quadraticCurveTo(26, -14, 4, -2); g.lineTo(4, 2); g.quadraticCurveTo(26, 14, 26, 54); g.lineTo(-26, 54); g.quadraticCurveTo(-26, 14, -4, 2); g.lineTo(-4, -2); g.quadraticCurveTo(-26, -14, -26, -54); g.closePath(); };
    vidrio(); g.fillStyle = "rgba(200,230,255,.12)"; g.fill();
    g.save(); vidrio(); g.clip();
    g.fillStyle = "#ffd34d";
    const arriba = 46 * (1 - k), abajo = 46 * k;
    g.fillRect(-30, -2 - arriba, 60, arriba);
    g.beginPath(); g.moveTo(-30, 54); g.lineTo(-30, 54 - abajo * 0.7); g.quadraticCurveTo(0, 54 - abajo * 1.3, 30, 54 - abajo * 0.7); g.lineTo(30, 54); g.closePath(); g.fill();
    if (k > 0 && k < 1) g.fillRect(-1.2, -2, 2.4, 56 - abajo);
    g.restore();
    vidrio(); g.strokeStyle = "rgba(230,245,255,.8)"; g.lineWidth = 2; g.stroke();
    g.restore();
  }
  bombilla(g, e, a) {
    const t = this.t;
    if (t < T_IDEA || t > 9.0) return;
    const k = eBack(tramo(t, T_IDEA, T_IDEA + 0.18)) * (1 - tramo(t, 8.8, 9.0)), q = aPant(e.m, [39, -40]);
    g.save(); g.globalAlpha = a; g.translate(q[0], q[1]); g.scale(k, k);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7 * a; g.drawImage(BLOB.amarillo, -70, -80, 140, 140); g.restore();
    g.strokeStyle = "#ffd34d"; g.lineWidth = 5; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const an = (i / 8) * 6.283 + 0.2, r0 = 40 + 4 * Math.sin(t * 20 + i); g.beginPath(); g.moveTo(Math.cos(an) * r0, -10 + Math.sin(an) * r0); g.lineTo(Math.cos(an) * (r0 + 16), -10 + Math.sin(an) * (r0 + 16)); g.stroke(); }
    const gr = g.createRadialGradient(-8, -18, 4, 0, -10, 28);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff3a0"); gr.addColorStop(1, "#ffc21f");
    g.fillStyle = gr; g.beginPath(); g.arc(0, -10, 26, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(10, 26); g.lineTo(-10, 26); g.closePath(); g.fill();
    g.fillStyle = "#9aa3ad"; rectR(g, -11, 24, 22, 14, 3); g.fill();
    g.strokeStyle = "#5c646d"; g.lineWidth = 2; for (const yy of [29, 34]) { g.beginPath(); g.moveTo(-11, yy); g.lineTo(11, yy); g.stroke(); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, XG, XG, PIES, 120, 0.85); foco(g, XR, XR, PIES, 120, 0.85);
    // suelo
    g.fillStyle = "#120d0a"; g.fillRect(-60, PIES - 4, W + 120, 80);
    g.restore();
    const kT = tramo(t, T_CERV, T_CERV + 0.2);
    this.relojArena(g, a * (1 - kT));
    g.save(); g.globalAlpha = a;
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.restore();
    // la nube de espuma invisible
    if (t > 3.0 && t < 4.0) {
      const k = tramo(t, 3.0, 3.3) * (1 - tramo(t, 3.8, 4.0)), c = aPant(e[1].m, [38, -4]), sc = 0.9 + 0.1 * Math.sin(t * 9);
      g.save(); g.globalAlpha = a * k; g.translate(c[0], c[1]); g.scale(sc, sc);
      // nube de espuma: bultos por arriba y la base recta sobre el pelo
      const nube = () => {
        g.beginPath(); g.moveTo(-86, 0);
        const bultos = [[-62, -18, 26], [-24, -38, 30], [18, -40, 32], [56, -20, 28]];
        g.arc(-80, -10, 14, Math.PI * 0.6, Math.PI * 1.6);
        for (const [bx, by, r] of bultos) g.arc(bx, by, r, Math.PI * 1.05, Math.PI * 1.95);
        g.arc(80, -8, 14, Math.PI * 1.4, Math.PI * 0.4);
        g.closePath();
      };
      nube(); g.fillStyle = "rgba(255,253,240,.10)"; g.fill();
      g.setLineDash([7, 5]); g.lineDashOffset = -t * 30;
      g.strokeStyle = "rgba(255,253,240,.95)"; g.lineWidth = 3.2; nube(); g.stroke();
      g.setLineDash([]); g.restore();
    }
    // chin-chin del brindis invisible
    if (t > 5.0 && t < 5.7 && Math.sin((t - 5.0) * 9) > 0.7) {
      const q = aPant(e[1].m, [-40, 20]);
      g.save(); g.globalAlpha = a; g.strokeStyle = "#fffdf5"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = -1; i <= 1; i++) { const an = -Math.PI / 2 + i * 0.6; g.beginPath(); g.moveTo(q[0] + Math.cos(an) * 16, q[1] + Math.sin(an) * 16); g.lineTo(q[0] + Math.cos(an) * 30, q[1] + Math.sin(an) * 30); g.stroke(); }
      g.restore();
    }
    this.bombilla(g, e[0], a);
    this.p.dibujar(g);
    // 1 PALABRA
    if (t > 0.55 && t < 1.2) {
      const q = aPant(e[1].m, [84, 30]), k = eBack(tramo(t, 0.55, 0.7));
      g.save(); g.translate(q[0] + 64, q[1] - 30); g.scale(k, k);
      txt(g, "1 PALABRA", 0, 0, { tam: 26, peso: 800, color: "#ffd34d", borde: "#000", bordeAncho: 5, esp: 2, alfa: a * (1 - tramo(t, 1.0, 1.2)) });
      g.restore();
    }
    // las respuestas de Guillermo
    for (const [t0, s] of [[T_G1, "¿TROMPETA?"], [T_G2, "¿PELUCA?"], [T_G3, "¿TAXI?"]]) {
      const k = tramo(t, t0, t0 + 0.2) * (1 - tramo(t, t0 + 0.65, t0 + 0.8));
      if (k <= 0) continue;
      const q = aPant(e[0].m, [39, -6]);
      bocadillo(g, q[0] + 34, q[1] - 70, s, q[0] + 10, q[1] - 8, k * a, 46);
    }
    // ¡CERVEZA!
    if (t > T_CERV) {
      const d = t - T_CERV, k = tramo(d, 0, 0.18), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 118); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(860, 240), g = c.getContext("2d");
    g.font = `400 150px ${FB}`; g.textAlign = "center"; g.textBaseline = "alphabetic";
    if ("letterSpacing" in g) g.letterSpacing = "4px";
    const x = 430, y = 178;
    // espuma alrededor de las letras
    g.lineJoin = "round"; g.strokeStyle = "#3a1d00"; g.lineWidth = 34; g.strokeText("¡CERVEZA!", x, y);
    g.strokeStyle = "#fffaf0"; g.lineWidth = 24; g.strokeText("¡CERVEZA!", x, y);
    // burbujas de espuma por arriba
    const r = semilla(77);
    g.fillStyle = "#fffaf0";
    for (let i = 0; i < 26; i++) { const bx = 120 + r() * 620, by = 58 + r() * 26; g.beginPath(); g.arc(bx, by, 9 + r() * 12, 0, 6.283); g.fill(); }
    const gr = g.createLinearGradient(0, 70, 0, 180);
    gr.addColorStop(0, "#ffe27a"); gr.addColorStop(0.5, "#ffb21a"); gr.addColorStop(1, "#c46a00");
    g.fillStyle = gr; g.fillText("¡CERVEZA!", x, y);
    g.fillStyle = "rgba(255,255,255,.35)"; g.save(); g.beginPath(); g.rect(0, 70, 860, 46); g.clip(); g.fillText("¡CERVEZA!", x, y); g.restore();
    if ("letterSpacing" in g) g.letterSpacing = "0px";
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00142", nombre: "Mímica", crear: () => new Mimica() });
})();
