"use strict";
/*
 * 00088 · TIRACHINAS DE FERIA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden las bombillas de una caseta de feria con una pirámide de latas. Con un tirachinas lanza chapas:
 * la primera tira las de arriba, la segunda casi todas… pero una se queda bailando. Estira la goma hasta el
 * límite y la última sale disparada al cielo: suena la campana, ¡PREMIO!, y le cae en brazos una jarra de
 * peluche. La lata vuelve a bajar y le da en la cabeza (¡TONK!). Las bombillas se apagan.
 */
(() => {
const ESC = 1.5, X = 236;
const MOSTR = 404;                         // balda de las latas
const LE = 2.35, LW = LATA_W * LE, LH = 25.5 * LE; // latas a escala de pantalla
const TIROS = [{ t: 1.55, vuelo: 0.26 }, { t: 3.0, vuelo: 0.24 }, { t: 5.45, vuelo: 0.16, gorda: true }];
const T_PREMIO = 5.66, T_TONK = 7.9;

function lienzoCaseta() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  // fondo de la caseta
  const gf = g.createLinearGradient(0, 120, 0, MOSTR);
  gf.addColorStop(0, "#14204a"); gf.addColorStop(1, "#0a1230");
  g.fillStyle = gf; g.fillRect(520, 110, 480, MOSTR - 110);
  g.fillStyle = "rgba(255,230,140,.5)";
  const r = semilla(88);
  for (let i = 0; i < 22; i++) { estrella(g, 540 + r() * 440, 140 + r() * 230, 4 + r() * 4, 2, r()); g.fill(); }
  // postes
  for (const x of [520, 988]) { g.fillStyle = "#c4161c"; g.fillRect(x - 6, 100, 18, PIES - 100); g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 3, 100, 4, PIES - 100); }
  // toldo a rayas con ondas
  for (let i = 0; i < 12; i++) {
    const x0 = 500 + i * 42;
    g.fillStyle = i % 2 ? "#fffdf5" : "#e0262c";
    g.beginPath(); g.moveTo(x0 + 4, 30); g.lineTo(x0 + 46, 30); g.lineTo(x0 + 42, 104); g.arc(x0 + 21, 104, 21, 0, Math.PI); g.closePath(); g.fill();
  }
  g.fillStyle = "#8a0e14"; g.fillRect(496, 22, 512, 12);
  // balda y mostrador
  g.fillStyle = "#e9c46a"; g.fillRect(560, MOSTR, 410, 10);
  g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(560, MOSTR + 10, 410, 6);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#fffdf5" : "#e0262c"; g.fillRect(540 + i * 56, MOSTR + 50, 56, PIES - MOSTR - 50); }
  g.fillStyle = "#6b3a16"; g.fillRect(530, MOSTR + 36, 470, 18);
  g.fillStyle = "rgba(255,220,170,.35)"; g.fillRect(530, MOSTR + 36, 470, 3);
  g.fillStyle = "#1a1a1a"; g.fillRect(530, PIES - 6, 470, 6);
  return c;
}

/** Jarra de peluche: centro (0,0), unos 60 × 64 unidades (escala libre). */
function peluche(g, t) {
  g.save();
  g.fillStyle = "#f2c230"; g.strokeStyle = "#8a5a00"; g.lineWidth = 2.4;
  // asa
  g.beginPath(); g.ellipse(28, 4, 11, 15, 0, 0, 6.283); g.stroke();
  g.lineWidth = 7; g.strokeStyle = "#f2c230"; g.beginPath(); g.ellipse(28, 4, 11, 15, 0, -1.4, 1.4); g.stroke();
  g.lineWidth = 2.4; g.strokeStyle = "#8a5a00";
  rectR(g, -26, -22, 52, 52, 16); g.fill(); g.stroke();
  // espuma
  g.fillStyle = "#fffdf5";
  for (const [x, y, r] of [[-20, -24, 11], [-6, -28, 13], [10, -27, 12], [22, -22, 9]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  // cara
  g.fillStyle = "#3a2000";
  g.beginPath(); g.arc(-10, 2, 3.4, 0, 6.283); g.fill(); g.beginPath(); g.arc(10, 2, 3.4, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(-9, 1, 1.1, 0, 6.283); g.fill(); g.beginPath(); g.arc(11, 1, 1.1, 0, 6.283); g.fill();
  g.strokeStyle = "#3a2000"; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 8, 7, 0.2, Math.PI - 0.2); g.stroke();
  g.fillStyle = "rgba(255,90,120,.55)"; g.beginPath(); g.ellipse(-16, 10, 4, 2.5, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(16, 10, 4, 2.5, 0, 0, 6.283); g.fill();
  g.restore();
}

class Tirachinas extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(420);
    this.caseta = lienzoCaseta();
    // pirámide 4-3-2-1
    this.latas = [];
    for (let fila = 0; fila < 4; fila++) for (let c = 0; c < 4 - fila; c++) this.latas.push({ x: 760 + (c - (3 - fila) / 2) * (LW + 3), y: MOSTR - LH / 2 - fila * LH, r: 0, vx: 0, vy: 0, vr: 0, cae: -1, fila });
    // qué latas tira cada chapa (la 0 de la fila de abajo se resiste)
    this.objetivo = [[9, 7, 8], [4, 5, 6, 1, 2, 3], [0]];
    this.chapas = []; this.textos = [];
    this.tonk = null;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0.03], piernaD: [0, -0.03], brazoIDelante: true };
    let manoD = [124, 100], manoI = [56, 104], giro = 0, dx = 0;
    // cargar y tensar antes de cada tiro; soltar
    for (const T of TIROS) {
      if (t > T.t - 0.75 && t < T.t + 0.25) {
        const k = eInOut(tramo(t, T.t - 0.6, T.t - 0.12));
        const lejos = T.gorda ? [-36, 98] : [20, 96];
        if (T.gorda) { const k2 = eInOut(tramo(t, T.t - 1.15, T.t - 0.12)); manoI = mezcla([56, 104], lejos, k2); giro = -0.07 * k2; dx = -8 * k2; }
        else manoI = mezcla([56, 104], lejos, k);
        if (t >= T.t) manoI = mezcla(lejos, [60, 100], eOut(tramo(t, T.t, T.t + 0.1)));
        pose.cara = t < T.t ? "guino" : "sorpresa";
      }
    }
    if (t > TIROS[2].t - 1.15 && t < TIROS[2].t) {
      const tr = tramo(t, TIROS[2].t - 0.9, TIROS[2].t) * 1.4;
      manoI = [manoI[0] + azar(-tr, tr), manoI[1] + azar(-tr, tr)]; pose.cara = t < TIROS[2].t - 0.5 ? "guino" : "sorpresa";
      pose.puntas = 0.5 * tramo(t, TIROS[2].t - 0.6, TIROS[2].t);
    }
    // la lata que no cae: se mosquea
    if (t > 3.45 && t < 4.3) { pose.cara = "borracho"; pose.rc = 0.12 * Math.sin((t - 3.45) * 6); }
    // ¡premio! abraza el peluche
    let objI = null;
    if (t > T_PREMIO + 0.55) {
      const k = eOut(tramo(t, T_PREMIO + 0.55, T_PREMIO + 0.8));
      manoD = mezcla(manoD, [66, 128], k); manoI = mezcla(manoI, [12, 126], k);
      pose.cara = "risa"; pose.rc = 0.06 * Math.sin(t * 6);
      objI = (g) => { g.save(); g.translate(39, 134); g.rotate(0.05 * Math.sin(t * 6)); g.scale(1.1, 1.1); peluche(g, t); g.restore(); };
    } else if (t > T_PREMIO) { pose.cara = "sorpresa"; manoD = mezcla(manoD, [100, 40], eOut(tramo(t, T_PREMIO, T_PREMIO + 0.2))); manoI = mezcla(manoI, [-20, 40], eOut(tramo(t, T_PREMIO, T_PREMIO + 0.2))); }
    if (t > T_TONK) { pose.cara = t < T_TONK + 0.9 ? "borracho" : "risa"; pose.rc = 0.1 * Math.sin((t - T_TONK) * 9) * Math.exp(-(t - T_TONK) * 1.5); }
    pose.manoD = manoD; pose.manoI = manoI;
    if (objI) pose.objI = objI;
    // el tirachinas en la mano derecha (hasta que llega el premio)
    const tira = t < T_PREMIO;
    if (tira) pose.objD = (g, m) => {
      g.save(); g.translate(m[0], m[1]); g.rotate(-0.08);
      g.strokeStyle = "#7a4520"; g.lineWidth = 5; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(0, 14); g.lineTo(0, -4); g.lineTo(-9, -24); g.moveTo(0, -4); g.lineTo(9, -24); g.stroke();
      g.strokeStyle = "rgba(255,220,170,.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-1, 10); g.lineTo(-1, -3); g.stroke();
      g.restore();
    };
    const m = matAv(X + dx, PIES, ESC, giro);
    return { pose, m, tira };
  }
  /** Las puntas de la horquilla del tirachinas en la pantalla. */
  puntas(e) {
    const mano = e.pose._manoD || e.pose.manoD, c = Math.cos(-0.08), s = Math.sin(-0.08);
    return [[-9, -24], [9, -24]].map(([x, y]) => aPant(e.m, [mano[0] + x * c - y * s, mano[1] + x * s + y * c]));
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    TIROS.forEach((T, i) => {
      this.una("tiro" + i, t >= T.t, () => {
        const e = this.estado(), pp = this.puntas(e), o = mezcla(pp[0], pp[1], 0.5);
        const L = this.latas[this.objetivo[i][0]];
        this.chapas.push({ x0: o[0], y0: o[1], x1: L.x - LW * 0.3, y1: L.y, t0: t, dur: T.vuelo, gorda: T.gorda, i });
        temblar(T.gorda ? 14 : 4, 0.2);
      });
    });
    for (const c of this.chapas) {
      if (c.fin || t - c.t0 < c.dur) continue;
      c.fin = true;
      temblar(c.gorda ? 22 : 9, c.gorda ? 0.5 : 0.25);
      for (const k of this.objetivo[c.i]) {
        const L = this.latas[k], f = c.gorda ? 2.4 : 1;
        L.cae = t; L.vx = azar(80, 320) * f; L.vy = -azar(380, 700) * f - (c.gorda ? 600 : 0); L.vr = azar(-14, 14);
        if (c.gorda) { L.vx = 180; L.vy = -1700; L.vr = 22; }
      }
      p.nueva(P.DESTELLO, c.x1, c.y1, 0, 0, 0.3, c.gorda ? 220 : 110);
      for (let k = 0; k < (c.gorda ? 40 : 14); k++) { const a = azar(-Math.PI, 0), v = azar(150, c.gorda ? 650 : 380); p.nueva(P.CHISPA, c.x1, c.y1, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(6, 12)); }
      this.textos.push({ s: "¡CLONC!", x: c.x1 + 40, y: c.y1 - 70, t0: t, tam: c.gorda ? 60 : 46 });
    }
    // latas que salen volando (y caen por detrás del mostrador)
    for (const L of this.latas) {
      if (L.cae < 0 || L.fuera) continue;
      L.vy += 1500 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.r += L.vr * dt;
      if (L.y > MOSTR + 80) L.fuera = true;
    }
    // la que se resiste: baila
    const L0 = this.latas[0];
    if (t > 3.25 && t < 4.4 && L0.cae < 0) L0.r = 0.22 * Math.sin((t - 3.25) * 13) * Math.exp(-(t - 3.25) * 2.2);
    if (TIROS[2].t < t && t < TIROS[2].t + 0.16) p.nueva(P.LLAMA, ...this.posChapa(this.chapas[2], t), azar(-40, 40), azar(-40, 40), 0.25, azar(30, 50), 1);
    this.una("premio", t > T_PREMIO, () => {
      temblar(20, 0.5);
      for (let i = 0; i < 160; i++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(40, 140), azar(4, 6.5), azar(9, 15), (Math.random() * 5) | 0);
      this.textos.push({ s: "¡DING DING!", x: 900, y: 175, t0: t, tam: 44 });
    });
    // la lata vuelve del cielo y le da en la cabeza
    this.una("vuelve", t > T_TONK - 0.45, () => { this.tonk = { t0: t }; });
    this.una("tonk", t > T_TONK, () => {
      temblar(14, 0.3);
      const e = this.estado(), q = aPant(e.m, [39, -2]);
      this.textos.push({ s: "¡TONK!", x: q[0] + 120, y: q[1] + 50, t0: t, tam: 56 });
      for (let k = 0; k < 12; k++) p.nueva(P.CHISPA, q[0], q[1], azar(-250, 250), azar(-300, -50), azar(0.3, 0.6), azar(6, 10));
    });
    p.actualizar(dt);
  }
  posChapa(c, t) {
    if (!c) return [0, 0];
    const u = clamp((t - c.t0) / c.dur, 0, 1);
    return [lerp(c.x0, c.x1, u), lerp(c.y0, c.y1, u) - (c.gorda ? 10 : 40) * 4 * u * (1 - u)];
  }
  bombillas(t) {
    // se encienden en cadena al principio y se apagan al final; parpadean con el premio
    const on = (i) => Math.min(tramo(t, 0.15 + i * 0.035, 0.2 + i * 0.035), 1 - tramo(t, 9.0 + i * 0.03, 9.05 + i * 0.03));
    return on;
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), on = this.bombillas(t);
    const luz = Math.min(1, tramo(t, 0.1, 0.75)) * (1 - tramo(t, 9.0, 9.55));
    fondo(g, "#000");
    // la caseta (iluminada por sus bombillas)
    g.save(); g.globalAlpha = luz; g.drawImage(this.caseta, 0, 0);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * luz; g.drawImage(BLOB2.oroClaro, 480, 60, 560, 480);
    g.restore();
    // latas (las que caen por detrás, recortadas por el mostrador)
    g.save(); g.globalAlpha = luz; g.beginPath(); g.rect(0, -400, W, MOSTR + 400 + 36); g.clip();
    for (const L of this.latas) {
      if (L.fuera) continue;
      const piv = L === this.latas[0] && L.cae < 0 ? [L.x - (L.r > 0 ? -LW / 2 : LW / 2), L.y + LH / 2] : null;
      if (piv) { g.save(); g.translate(piv[0], piv[1]); g.rotate(L.r); lataSuelta(g, L.x - piv[0], L.y - piv[1] - 2, 0, LE); g.restore(); }
      else lataSuelta(g, L.x, L.y - 2, L.r, LE);
    }
    g.restore();
    // bombillas del toldo
    for (let i = 0; i < 16; i++) {
      const x = 516 + i * 31, y = 128, a = on(i) * (t > T_PREMIO && t < T_PREMIO + 2 ? (Math.floor(t * 10 + i) % 2 ? 1 : 0.35) : 1);
      g.fillStyle = a > 0.5 ? "#fff3b0" : "#4a4030"; g.beginPath(); g.arc(x, y, 6, 0, 6.283); g.fill();
      if (a > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * a; g.drawImage(BLOB.amarillo, x - 18, y - 18, 36, 36); g.restore(); }
    }
    // campana
    const kc = t > T_PREMIO ? Math.sin((t - T_PREMIO) * 30) * Math.exp(-(t - T_PREMIO) * 2) : 0;
    g.save(); g.globalAlpha = luz; g.translate(950, 150); g.rotate(kc * 0.5);
    g.fillStyle = "#ffcc33"; g.beginPath(); g.moveTo(-16, 30); g.quadraticCurveTo(-16, 0, 0, 0); g.quadraticCurveTo(16, 0, 16, 30); g.lineTo(20, 34); g.lineTo(-20, 34); g.closePath(); g.fill();
    g.fillStyle = "#b07d00"; g.beginPath(); g.arc(0, 36, 5, 0, 6.283); g.fill();
    g.restore();
    // avatar y la luz que le llega
    g.save(); g.globalAlpha = luz;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * luz; g.drawImage(BLOB2.oroClaro, X - 220, 180, 440, 420); g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    // gomas y chapa cargada
    if (e.tira) {
      const pp = this.puntas(e), mi = aPant(e.m, e.pose._manoI || e.pose.manoI);
      const cargada = TIROS.find((T) => t > T.t - 0.75 && t < T.t);
      const bolsa = cargada ? [mi[0] + 4, mi[1] - 4] : mezcla(pp[0], pp[1], 0.5);
      g.strokeStyle = "#d8262c"; g.lineWidth = 3.5; g.lineCap = "round";
      g.beginPath(); g.moveTo(pp[0][0], pp[0][1]); g.lineTo(bolsa[0], bolsa[1]); g.lineTo(pp[1][0], pp[1][1]); g.stroke();
      if (cargada) this.chapa(g, bolsa[0], bolsa[1], 0, cargada.gorda ? 1.5 : 1);
    }
    g.restore();
    // chapas en vuelo
    for (const c of this.chapas) if (!c.fin) { const q = this.posChapa(c, t); this.chapa(g, q[0], q[1], t * 30, c.gorda ? 1.5 : 1); }
    // la lata que vuelve del cielo
    if (this.tonk && t < T_TONK + 0.9) {
      const q = aPant(e.m, [39, -6]);
      let x, y, r;
      if (t < T_TONK) { const u = tramo(t, this.tonk.t0, T_TONK); x = q[0] + 30 * (1 - u); y = lerp(-80, q[1] - LH / 2, eIn(u)); r = u * 8; }
      else { const s = t - T_TONK; x = q[0] + 260 * s; y = q[1] - LH / 2 - 520 * s + 1100 * s * s; r = 8 + s * 14; }
      lataSuelta(g, x, y, r, LE);
    }
    // estrellitas de mareo
    if (t > T_TONK && t < T_TONK + 1.0) {
      const q = aPant(e.m, [39, 4]);
      for (let i = 0; i < 3; i++) { const a = t * 6 + (i * 6.283) / 3; brillo(g, q[0] + Math.cos(a) * 46, q[1] - 6 + Math.sin(a) * 12, 13, 1 - tramo(t, T_TONK + 0.7, T_TONK + 1.0)); }
    }
    // el peluche cae del cielo a sus brazos
    if (t > T_PREMIO && t < T_PREMIO + 0.55) {
      const u = tramo(t, T_PREMIO + 0.05, T_PREMIO + 0.55), q = aPant(e.m, [39, 134]);
      g.save(); g.translate(q[0], lerp(-80, q[1], eIn(u))); g.rotate((1 - u) * 2); g.scale(ESC * 1.1, ESC * 1.1); peluche(g, t); g.restore();
    }
    this.p.alfa = luz; this.p.dibujar(g);
    for (const o of this.textos) {
      const s = t - o.t0; if (s > 0.9) continue;
      const k = eBack(tramo(s, 0, 0.14));
      g.save(); g.translate(o.x, o.y - s * 14); g.rotate(-0.1); g.scale(k, k);
      txt(g, o.s, 0, 0, { tam: o.tam, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a2400", bordeAncho: 8, alfa: (1 - tramo(s, 0.7, 0.9)) * luz, esp: 2 });
      g.restore();
    }
    // ¡PREMIO!
    if (t > T_PREMIO + 0.06) {
      const d = t - T_PREMIO - 0.06, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(300, 110); g.rotate(-0.06); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  chapa(g, x, y, r, esc) {
    g.save(); g.translate(x, y); g.rotate(r); g.scale(esc, esc);
    g.fillStyle = "#ffcc33"; g.beginPath();
    for (let i = 0; i < 21; i++) { const a = (i / 21) * 6.283, rr = i % 2 ? 7.5 : 9; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fill();
    g.fillStyle = "#c4161c"; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
    g.restore();
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(560, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 150);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡PREMIO!", 280, 152, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#5a0008", bordeAncho: 12, esp: 4, glow: "rgba(255,61,80,.75)", glowTam: 26 });
    return (this._tit = c);
  }
}

registrar({ id: "00088", nombre: "Tirachinas de feria", crear: () => new Tirachinas() });
})();
