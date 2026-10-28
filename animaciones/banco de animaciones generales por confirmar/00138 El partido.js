"use strict";
/*
 * 00138 · EL PARTIDO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo ven el partido en la tele del bar, de los nervios (uñas, manos en la cabeza, ojos tapados).
 * Primer tiro: al poste (¡UYYY!). En el último minuto, a cámara lenta… ¡GOL! Saltan con las jarras en alto, la
 * cerveza sale volando, se abrazan dando botes y les cae la cerveza encima: ¡QUÉ PARTIDAZO!
 */
(() => {
const ESC = 1.45, AY = 615, BARRA = 480;
const XG0 = 316, XR0 = 708, XG1 = 440, XR1 = 586;
const T_POSTE = 2.6, T_LENTO = 4.2, T_GOL = 4.62, T_CORREN = 5.05, T_ABRAZO = 5.55, T_TIT = 6.25, T_APAGA = 9.35;
const TV = { x: 290, y: 28, w: 444, h: 226 };   // pantalla de la tele
const CT = cacheTexto();
const aP = (X, Y, u) => [X + (u[0] - 39) * ESC, Y - (232 - u[1]) * ESC];

function pista(t, k) {
  if (t <= k[0][0]) return k[0].slice(1);
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]), f = k[i][3] || eInOut;
    return [lerp(k[i - 1][1], k[i][1], f(u)), lerp(k[i - 1][2], k[i][2], f(u))];
  }
  const u = k[k.length - 1]; return [u[1], u[2]];
}
const lin = (u) => u;
// el balón en el campo (x 0–1060, y 0–226); la portería a la derecha (línea en x = 1010)
const BALON = [[0.4, 110, 128], [1.25, 330, 96], [1.85, 560, 150], [2.3, 790, 118], [T_POSTE, 1006, 74, lin], [3.0, 880, 176, eOut],
  [3.5, 760, 124], [3.95, 850, 156], [T_LENTO, 905, 122], [T_GOL, 1030, 108, lin], [4.85, 1040, 112, eOut]];
const ATAQ = [[0, 0.05, -26, 30], [1, 0.32, -70, -46], [2, 0.6, -150, 40]];   // [id, retraso, dx, dy]

/** Jarra en la mano izquierda (de la pantalla), en espejo: el cuerpo hacia fuera. */
function jarraIzq(pose, inc, nivel) {
  pose.objI = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); };
  pose.objI2 = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t); g.restore(); };
}

class Partido extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(460);
    this.espuma = [];  // pegotes de espuma en el pelo: [quien, ux, uy, t0, r]
  }
  luz() { return tramo(this.t, 0.1, 0.55) * (1 - tramo(this.t, T_APAGA, 9.9)); }
  tvOn() { const t = this.t; return t < 0.5 ? clamp((t - 0.05) / 0.4, 0, 1) : 1 - tramo(t, T_APAGA - 0.1, T_APAGA + 0.3); }
  balon(t) { return pista(t, BALON); }
  nivel(t) { return 1 - 0.75 * eOut(tramo(t, T_GOL + 0.05, T_GOL + 0.35)); }
  x(t, q) { const k = eInOut(tramo(t, T_CORREN, T_ABRAZO)); return q ? lerp(XR0, XR1, k) : lerp(XG0, XG1, k); }
  poses() {
    const t = this.t;
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    // G: jarra en la izquierda (fuera); R: jarra en la derecha (fuera)
    let gI = [2, 121], gD = [44, 60], rD = [72, 121], rI = [30, 102];
    let incG = 0, incR = 0, yG = 0, yR = 0, giroG = 0, giroR = 0, dxG = 0, dxR = 0, syG = 1, syR = 1;
    const nerv = t > 0.6 && t < T_GOL ? 1 : 0;
    // nervios: Guillermo se come las uñas; Rodrigo aprieta el puño
    if (t < T_POSTE) {
      gD = [44 + Math.sin(t * 40) * 1.2, 60];
      dxG = azar(-0.8, 0.8) * nerv;
      rI = t > 1.7 ? [26, 70 - Math.abs(Math.sin(t * 9)) * 18] : [30, 102];
      R.cara = t > 1.7 ? "risa" : "sonrisa";
      if (t > 2.25) { G.cara = "sorpresa"; R.cara = "sorpresa"; syG = syR = 1.02; }
    }
    // ¡UYYY! al poste: manos a la cabeza y se miran
    if (t >= T_POSTE && t < 3.25) {
      const k = eOut(tramo(t, T_POSTE, T_POSTE + 0.15));
      gD = mezcla([44, 60], [64, 14], k); rI = mezcla([26, 70], [12, 14], k);
      gI = mezcla([2, 121], [-8, 84], k); rD = mezcla([72, 121], [84, 84], k);
      G.cara = "sorpresa"; R.cara = "sorpresa";
      if (t > 2.95) { G.cara = "dormido"; R.cara = "dormido"; G.rc = 0.14; R.rc = -0.14; }
    }
    // segundo ataque: Rodrigo se tapa los ojos, Guillermo no respira
    if (t >= 3.25 && t < T_GOL) {
      const k = eInOut(tramo(t, 3.25, 3.55));
      gD = mezcla([64, 14], [50, 104 + Math.sin(t * 30) * 1.5], k);
      gI = mezcla([-8, 84], [2, 121], k);
      rI = mezcla([12, 14], [24, 46], k); rD = mezcla([84, 84], [72, 121], k);
      G.cara = "sorpresa"; R.cara = t > T_LENTO ? "guino" : "dormido";
      G.puntas = 0.45 * tramo(t, 3.4, T_GOL); R.puntas = G.puntas;
      syG = syR = 1 + 0.03 * tramo(t, 3.3, T_LENTO);
      const tr = t < T_LENTO ? 1.2 : 0.2;
      dxG = azar(-tr, tr); dxR = azar(-tr, tr);
    }
    // ¡GOL!: saltan con las jarras en alto
    if (t >= T_GOL) {
      const kA = eOut(tramo(t, T_GOL, T_GOL + 0.16));
      gI = mezcla([2, 121], [-30, -12], kA); rD = mezcla([72, 121], [108, -12], kA);
      gD = mezcla([50, 104], [92, 30], kA); rI = mezcla([24, 46], [-14, 30], kA);
      incG = -0.9 * Math.sin(Math.PI * tramo(t, T_GOL, T_GOL + 0.45)); incR = incG;
      G.cara = "risa"; R.cara = "risa"; G.puntas = 1 - tramo(t, 6, 7); R.puntas = G.puntas;
      const s = tramo(t, T_GOL, T_GOL + 0.5);
      yG = yR = -Math.sin(s * Math.PI) * 62;
    }
    // corren el uno al otro…
    if (t >= T_CORREN && t < T_ABRAZO) {
      const k = tramo(t, T_CORREN, T_ABRAZO);
      yG = yR = -Math.abs(Math.sin(k * Math.PI * 2)) * 18;
      giroG = 0.1 * Math.sin(k * Math.PI); giroR = -giroG;
    }
    // …y se abrazan dando botes
    if (t >= T_ABRAZO) {
      const k = eOut(tramo(t, T_ABRAZO, T_ABRAZO + 0.2));
      gD = mezcla([92, 30], [112, 100], k);         // por detrás de Rodrigo
      rI = mezcla([-14, 30], [-58, 92], k);         // sobre el hombro de Guillermo
      giroG = 0.05 * k; giroR = -0.05 * k;
      G.rc = 0.09 * k; R.rc = -0.09 * k;
      const b = -Math.abs(Math.sin((t - T_ABRAZO) * 8.5)) * 26 * (1 - tramo(t, 8.2, 8.7));
      yG = yR = b;
      gI = [-30 + Math.sin(t * 8.5) * 4, -12 + Math.cos(t * 8.5) * 6]; rD = [108 - Math.sin(t * 8.5) * 4, -12 + Math.cos(t * 8.5) * 6];
      G.cara = t > 7.4 && t < 8.1 ? "guino" : "risa"; R.cara = "risa";
      if (t > 8.2) { gI = mezcla(gI, [-12, 60], eInOut(tramo(t, 8.2, 8.6))); rD = mezcla(rD, [90, 60], eInOut(tramo(t, 8.2, 8.6))); }
    }
    const niv = this.nivel(t);
    jarraIzq(G, incG, niv);
    R.jarra = { inc: incR, nivel: niv };
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    return [
      { pose: G, m: matAv(this.x(t, 0) + dxG, AY + yG, ESC, giroG, 1, syG), X: this.x(t, 0) + dxG, Y: AY + yG },
      { pose: R, m: matAv(this.x(t, 1) + dxR, AY + yR, ESC, giroR, 1, syR), X: this.x(t, 1) + dxR, Y: AY + yR },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("poste", t > T_POSTE, () => { temblar(10, 0.3); });
    this.una("gol", t > T_GOL, () => {
      temblar(26, 0.7);
      for (let k = 0; k < 40; k++) { const a = azar(-Math.PI, 0), v = azar(200, 600); p.nueva(P.CHISPA, TV.x + TV.w / 2 + azar(-150, 150), TV.y + TV.h, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 13)); }
    });
    // la cerveza sale volando de las jarras
    if (t > T_GOL + 0.05 && t < T_GOL + 0.4) {
      const e = this.poses();
      for (const [i, s] of [[0, -1], [1, 1]]) {
        const M = i ? e[1].pose._manoD : e[0].pose._manoI;
        if (!M) continue;
        const q = aPant(e[i].m, [M[0] + s * 17, M[1] - 18]);
        for (let k = 0; k < 4; k++) {
          p.nueva(P.GOTA, q[0] + azar(-10, 10), q[1], s * azar(30, 260) - s * 60, azar(-900, -560), 1.6, azar(3, 6));
          if (k < 2) p.nueva(P.ESPUMA, q[0] + azar(-10, 10), q[1], s * azar(20, 200), azar(-700, -420), azar(0.6, 1), azar(6, 11));
        }
      }
    }
    // y les cae encima: pegotes de espuma en el pelo
    this.una("cae", t > 5.75, () => {
      temblar(5, 0.2);
      for (const [q, ux, uy, r] of [[0, 24, 4, 9], [0, 46, 0, 11], [0, 34, -4, 8], [1, 22, 12, 9], [1, 44, 6, 12], [1, 33, 2, 8]]) this.espuma.push([q, ux, uy, t + azar(0, 0.5), r]);
    });
    if (t > 5.6 && t < 6.6 && Math.random() < 25 * dt) for (const x of [XG1, XR1]) p.nueva(P.GOTA, x + azar(-90, 90), azar(-20, 120), 0, azar(100, 300), 1, azar(3, 5));
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.4);
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    p.suelo = () => BARRA - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ---------------------------------------------------------------------------- la tele
  jugador(g, x, y, col, fase, esc) {
    g.save(); g.translate(x, y); g.scale(esc, esc);
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(0, 13, 7, 2.5, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#222"; g.lineWidth = 3; g.lineCap = "round";
    const p = Math.sin(fase) * 4;
    g.beginPath(); g.moveTo(-2, 4); g.lineTo(-2 - p, 12); g.moveTo(2, 4); g.lineTo(2 + p, 12); g.stroke();
    g.fillStyle = col; rectR(g, -5, -7, 10, 12, 3); g.fill();
    g.fillStyle = "#f0c8a0"; g.beginPath(); g.arc(0, -11, 4.2, 0, 6.283); g.fill();
    g.restore();
  }
  pantalla(g, t, on) {
    const S = TV, B = this.balon(t);
    const cam = clamp(B[0] - 250, 0, 1060 - S.w);
    const X = (px) => S.x + px - cam, Y = (py) => S.y + py;
    g.save(); g.beginPath(); g.rect(S.x, S.y, S.w, S.h); g.clip();
    // césped a franjas
    g.fillStyle = "#2e8b3a"; g.fillRect(S.x, S.y, S.w, S.h);
    g.fillStyle = "#339b41";
    for (let k = Math.floor(cam / 70); k * 70 < cam + S.w; k++) if (k % 2 === 0) g.fillRect(X(k * 70), S.y, 70, S.h);
    // líneas
    g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(X(530), S.y); g.lineTo(X(530), S.y + S.h); g.stroke();
    g.beginPath(); g.arc(X(530), Y(113), 46, 0, 6.283); g.stroke();
    g.strokeRect(X(860), Y(22), 150, 182); g.strokeRect(X(960), Y(64), 50, 98);
    g.beginPath(); g.moveTo(X(1010), S.y); g.lineTo(X(1010), S.y + S.h); g.stroke();
    // portería (con la red que se hincha en el gol)
    const hincha = t > T_GOL ? Math.sin(Math.min(1, (t - T_GOL) / 0.25) * Math.PI) * 10 : 0;
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(X(1010), Y(70), 32 + hincha, 80);
    g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 1;
    for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(X(1010), Y(70 + k * 10)); g.lineTo(X(1042 + hincha), Y(70 + k * 10)); g.stroke(); }
    for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(X(1010 + k * (8 + hincha / 4)), Y(70)); g.lineTo(X(1010 + k * (8 + hincha / 4)), Y(150)); g.stroke(); }
    g.fillStyle = "#fff"; for (const py of [70, 150]) { g.beginPath(); g.arc(X(1010), Y(py), 4, 0, 6.283); g.fill(); }
    // jugadores: los de casa (cian) atacan; los de fuera (rosa) defienden; el portero salta al otro lado
    const fase = t * 14;
    for (let i = 0; i < 3; i++) {
      const d = this.balon(t - 0.12 - i * 0.08);
      const px = lerp(d[0], 1000, 0.25 + i * 0.22) + Math.sin(t * 2 + i) * 10, py = clamp(lerp(d[1], 113, 0.5) + (i - 1) * 46, 20, 206);
      this.jugador(g, X(px), Y(py), "#ff3d84", fase + i, 1.25);
    }
    for (const [i, r, dx, dy] of ATAQ) {
      const d = this.balon(t - r);
      this.jugador(g, X(d[0] + dx), Y(clamp(d[1] + dy, 16, 210)), "#2fe3e8", fase + i * 2, 1.25);
    }
    const tir = tramo(t, 4.38, 4.7);
    const pyP = t < 4.38 ? clamp(lerp(113, B[1], 0.6), 80, 146) : lerp(clamp(lerp(113, this.balon(4.38)[1], 0.6), 80, 146), 172, eOut(tir));
    g.save(); g.translate(X(1000), Y(pyP)); g.rotate(1.2 * eOut(tir));
    this.jugador(g, 0, 0, "#ffd34d", fase * 0.3, 1.25); g.restore();
    // el balón (con estela a cámara lenta)
    if (t > T_LENTO - 0.05 && t < T_GOL) {
      for (let k = 1; k <= 4; k++) { const q = this.balon(t - k * 0.04); g.fillStyle = `rgba(255,255,255,${0.12 * (5 - k)})`; g.beginPath(); g.arc(X(q[0]), Y(q[1]), 5.5, 0, 6.283); g.fill(); }
    }
    const altura = t > 2.0 && t < T_POSTE ? Math.sin(tramo(t, 2.3, T_POSTE) * Math.PI) * 14 : 0;
    g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(X(B[0]), Y(B[1]) + 5, 6, 2.5, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(X(B[0]), Y(B[1]) - altura, 6, 0, 6.283); g.fill();
    g.fillStyle = "#222"; g.beginPath(); g.arc(X(B[0]) + 1, Y(B[1]) - altura - 1, 2.2, 0, 6.283); g.fill();
    // marcador y minuto
    const goles = t > T_GOL + 0.25 ? 1 : 0, seg = Math.floor(t < T_GOL ? 18 + t * 8.9 : 59 + (t - T_GOL) * 1.2);
    const reloj = `${seg >= 60 ? 90 : 89}:${String(seg % 60).padStart(2, "0")}`;
    g.fillStyle = "rgba(8,14,30,.88)"; rectR(g, S.x + 10, S.y + 10, 218, 30, 6); g.fill();
    g.fillStyle = "#2fe3e8"; g.fillRect(S.x + 10, S.y + 10, 6, 30); g.fillStyle = "#ff3d84"; g.fillRect(S.x + 132, S.y + 10, 6, 30);
    txt(g, "LOCAL", S.x + 22, S.y + 31, { tam: 15, peso: 800, color: "#fff", alin: "left" });
    txt(g, `${goles}-0`, S.x + 104, S.y + 32, { tam: 20, peso: 900, fam: FD, color: goles ? "#ffd34d" : "#fff" });
    txt(g, "VISITA", S.x + 144, S.y + 31, { tam: 15, peso: 800, color: "#fff", alin: "left" });
    g.fillStyle = "rgba(8,14,30,.88)"; rectR(g, S.x + 232, S.y + 10, 58, 30, 6); g.fill();
    txt(g, reloj, S.x + 261, S.y + 31, { tam: 17, peso: 800, color: seg >= 60 ? "#ff6b6b" : "#fff" });
    // ¡POSTE! y ¡GOL! en la tele
    if (t > T_POSTE && t < 3.3) txt(g, "¡POSTE!", S.x + S.w / 2, S.y + S.h - 22, { tam: 40, peso: 400, fam: FC, color: "#fff", borde: "#000", bordeAncho: 6, esp: 2 });
    if (t > T_LENTO && t < T_GOL) { g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(S.x, S.y, S.w, S.h); txt(g, "▶ CÁMARA LENTA", S.x + S.w - 14, S.y + S.h - 14, { tam: 15, peso: 800, color: "#fff", alin: "right", alfa: Math.sin(t * 12) > 0 ? 1 : 0.4 }); }
    if (t > T_GOL) {
      const d = t - T_GOL, fl = Math.max(0, 1 - d / 0.3);
      if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(S.x, S.y, S.w, S.h); }
      const k = eBack(tramo(d, 0.05, 0.3)), lat = 1 + 0.06 * Math.sin(d * 14);
      g.save(); g.translate(S.x + S.w / 2, S.y + S.h / 2 + 30); g.scale(k * lat, k * lat); g.rotate(-0.06);
      txt(g, "¡GOL!", 0, 0, { tam: 120, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a1d00", bordeAncho: 12, esp: 4 });
      g.restore();
    }
    // líneas de barrido de la tele
    g.fillStyle = "rgba(0,0,0,.08)"; for (let y = S.y; y < S.y + S.h; y += 4) g.fillRect(S.x, y, S.w, 1.5);
    g.restore();
    void on;
  }
  tele(g, a) {
    const t = this.t, S = TV, on = this.tvOn();
    g.save(); g.globalAlpha = a;
    // soporte de pared y marco
    g.fillStyle = "#15161a"; g.fillRect(S.x + S.w / 2 - 30, 0, 60, S.y);
    const gm = g.createLinearGradient(0, S.y - 14, 0, S.y + S.h + 14);
    gm.addColorStop(0, "#3a3d44"); gm.addColorStop(1, "#141518");
    g.fillStyle = gm; rectR(g, S.x - 14, S.y - 12, S.w + 28, S.h + 30, 10); g.fill();
    g.fillStyle = "#050607"; g.fillRect(S.x, S.y, S.w, S.h);
    g.fillStyle = on > 0.5 ? "#2bff5b" : "#ff3d3d"; g.beginPath(); g.arc(S.x + S.w - 4, S.y + S.h + 10, 2.5, 0, 6.283); g.fill();
    // encendido / apagado de tele antigua: una raya que se abre (o se cierra)
    if (on > 0) {
      g.save();
      const k = eOut(on), hh = S.h * clamp((k - 0.15) / 0.85, 0.012, 1), ww = S.w * clamp(k / 0.15, 0.02, 1);
      g.beginPath(); g.rect(S.x + (S.w - ww) / 2, S.y + (S.h - hh) / 2, ww, hh); g.clip();
      this.pantalla(g, t, on);
      if (k < 1) { g.fillStyle = `rgba(255,255,255,${1 - k})`; g.fillRect(S.x, S.y, S.w, S.h); }
      g.restore();
    }
    // brillo del cristal
    g.fillStyle = "rgba(255,255,255,.05)";
    g.beginPath(); g.moveTo(S.x, S.y); g.lineTo(S.x + S.w * 0.45, S.y); g.lineTo(S.x + S.w * 0.25, S.y + S.h); g.lineTo(S.x, S.y + S.h); g.closePath(); g.fill();
    g.restore();
  }
  barra(g, a) {
    g.save(); g.globalAlpha = a;
    const gr = this.grB || (this.grB = (() => { const q = g.createLinearGradient(0, BARRA, 0, H); q.addColorStop(0, "#5a3218"); q.addColorStop(1, "#24130a"); return q; })());
    g.fillStyle = gr; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    // la luz de la tele en la pared y sobre ellos
    const on = this.tvOn(), gol = t > T_GOL ? Math.max(0, 1 - (t - T_GOL) / 0.6) : 0;
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = (0.26 + 0.04 * Math.sin(t * 13) * Math.sin(t * 5)) * on * a + 0.4 * gol;
    g.drawImage(BLOB2.cian, 150, 60, 724, 560);
    g.globalAlpha = 0.22 * a; g.drawImage(BLOB2.oroClaro, -100, 260, 600, 400); g.drawImage(BLOB2.oroClaro, 524, 260, 600, 400);
    g.restore();
    this.tele(g, a);
    g.save(); g.globalAlpha = a;
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    // espuma en el pelo
    for (const [q, ux, uy, t0, r] of this.espuma) {
      if (t < t0) continue;
      const k = eBack(tramo(t, t0, t0 + 0.2)), c = aPant(e[q].m, [ux, uy + (q ? 4 : 0)]), s = r * ESC * k;
      g.drawImage(SPR.espuma, c[0] - s, c[1] - s, s * 2, s * 2);
    }
    // gotas de sudor de los nervios
    if (t > 1.2 && t < T_GOL) for (const [i, ux] of [[0, 10], [1, 66]]) {
      const ph = ((t * 1.3 + i * 0.5) % 1), c = aPant(e[i].m, [ux, 34 + ph * 30]);
      g.globalAlpha = a * (1 - ph); g.fillStyle = "#9fe3ff";
      g.beginPath(); g.ellipse(c[0], c[1], 4, 6.5, 0, 0, 6.283); g.fill();
    }
    g.restore();
    this.barra(g, a);
    this.p.dibujar(g);
    // ¡UYYY!
    if (t > T_POSTE + 0.05 && t < 3.4) {
      const k = eBack(tramo(t, T_POSTE + 0.05, T_POSTE + 0.2)), al = 1 - tramo(t, 3.15, 3.4);
      g.save(); g.translate(512 + azar(-2, 2), 372); g.rotate(-0.05); g.scale(k, k);
      txt(g, "¡UYYY!", 0, 0, { tam: 92, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 11, esp: 3, alfa: al * a });
      g.restore();
    }
    // ¡QUÉ PARTIDAZO!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      const gb = g.createLinearGradient(0, 470, 0, 600);
      gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(0.35, "rgba(0,0,0,.7)"); gb.addColorStop(1, "rgba(0,0,0,.85)");
      g.fillStyle = gb; g.fillRect(-60, 470, W + 120, 200);
      g.translate(512, 540); g.rotate(-0.025); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - Math.max(a, 0);
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(1000, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#c9ffd6"); gr.addColorStop(1, "#2bff5b");
    txt(g, "¡QUÉ PARTIDAZO!", 500, 136, { tam: 116, peso: 900, fam: FD, color: gr, borde: "#03230c", bordeAncho: 11, esp: 4, glow: "rgba(43,255,91,.8)", glowTam: 24, max: 930 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00138", nombre: "El partido", crear: () => new Partido() });
})();
