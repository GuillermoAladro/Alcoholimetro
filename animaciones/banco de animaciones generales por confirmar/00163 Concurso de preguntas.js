"use strict";
/*
 * 00163 · CONCURSO DE PREGUNTAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Plató de concurso: Guillermo y Marcos tras sus atriles con pulsador, y de presentador un cartel con ojos y
 * pajarita. ¡PREGUNTA! Marcos pulsa siempre el primero y falla (¡SEIS! ¡AZUL! ¡EEEH…!): ¡MEC!, y su marcador baja.
 * En la última, Guillermo pulsa con calma: ¡SIETE! ¡CORRECTO!, y le cae una lluvia de confeti.
 */
(() => {
const ESC = 1.5, XG = 200, XM = 824, ATRIL = 420;
const BOT = [[292, 404], [732, 404]];                     // pulsadores (a un lado del cuerpo)
const CART = { x0: 262, x1: 762, y0: 52, y1: 288 };       // el cartel presentador
const PREG = [
  { t: 0.9, l: ["¿CUÁNTAS PATAS", "TIENE UNA ARAÑA?"], pulsa: 1.75, resp: "¡SEIS!", tr: 1.95, mec: 2.55 },
  { t: 3.2, l: ["¿DE QUÉ COLOR", "ES UNA NARANJA?"], pulsa: 3.9, resp: "¡AZUL!", tr: 4.1, mec: 4.7 },
  { t: 5.4, l: ["¿CUÁNTOS DÍAS", "TIENE UNA SEMANA?"], pulsa: 5.72, resp: "¡EEEH…!", tr: 5.92, mec: 6.5 },
];
const T_G = 7.0, T_GR = 7.2, T_OK = 7.8, DUR = 10.3, T_APAGA = 9.7;
const CT = cacheTexto();
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - PIES) / ESC + 232];

class Concurso extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Golpe al pulsador: 0 reposo … 1 abajo. Devuelve también la mano (unidades de avatar). */
  golpe(t, tb, q, reposo) {
    if (t < tb - 0.35 || t > tb + 0.55) return { mano: reposo, k: 0 };
    const B = aU(q ? XM : XG, [BOT[q][0], BOT[q][1] - 8]), arriba = [B[0], B[1] - 50];
    let m = mezcla(reposo, arriba, eOut(tramo(t, tb - 0.35, tb - 0.08)));
    m = mezcla(m, B, eIn(tramo(t, tb - 0.08, tb)));
    m = mezcla(m, reposo, eInOut(tramo(t, tb + 0.2, tb + 0.55)));
    return { mano: m, k: t > tb - 0.02 && t < tb + 0.22 ? 1 : 0 };
  }
  pulsado(q, t) {
    const lista = q ? PREG.map((p) => p.pulsa) : [T_G];
    return lista.some((tb) => t > tb - 0.02 && t < tb + 0.25);
  }
  /** Marcador de cada uno. */
  puntos(q, t) { return q ? -PREG.filter((p) => t > p.mec).length : (t > T_OK ? 1 : 0); }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 150], manoI: [8, 152] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [66, 150], manoI: [8, 150], brazoIDelante: true };
    let yM = 0, yG = 0;
    // Marcos: siempre el primero
    for (const P of PREG) {
      const g0 = this.golpe(t, P.pulsa, 1, [8, 150]);
      if (g0.mano !== M.manoI || t > P.pulsa - 0.35 && t < P.pulsa + 0.55) M.manoI = g0.mano;
      if (t > P.t + 0.15 && t < P.pulsa) { M.cara = "sorpresa"; M.rc = -0.05; yM = -4 * Math.abs(Math.sin(t * 16)); }
      if (t >= P.pulsa && t < P.mec) { M.cara = "risa"; M.rc = 0.05; }
      if (t >= P.mec && t < P.mec + 0.65) {
        M.cara = P === PREG[2] ? "dormido" : "sorpresa"; M.rc = -0.1;
        G.cara = "guino"; G.rc = 0.06;
      }
    }
    if (t > PREG[0].mec + 0.65 && t < PREG[1].t + 0.15) M.cara = "borracho";
    if (t > PREG[1].mec + 0.65 && t < PREG[2].t + 0.15) { M.cara = "borracho"; M.manoD = [52, 34]; G.cara = "risa"; }
    // Guillermo pulsa con calma en la última
    const gg = this.golpe(t, T_G, 0, [72, 150]);
    if (t > T_G - 0.35 && t < T_G + 0.55) { G.manoD = gg.mano; G.cara = "guino"; }
    if (t > 6.6 && t < T_G - 0.35) { G.cara = "sonrisa"; G.rc = 0.05; }
    if (t > T_GR && t < T_OK) { G.cara = "sonrisa"; G.rc = -0.04; }
    if (t > 6.5 && t < T_OK) { M.cara = "dormido"; M.manoD = [56, 30]; M.rc = 0.08; }
    if (t >= T_OK) {
      const d = t - T_OK, k = eBack(tramo(d, 0.05, 0.35));
      G.cara = "risa";
      G.manoD = mezcla([72, 150], [98, 34 + 5 * Math.sin(t * 10)], k);
      G.manoI = mezcla([8, 152], [-20, 34 + 5 * Math.sin(t * 10 + 1)], k); G.brazoIDelante = true;
      yG = -Math.abs(Math.sin(d * 8)) * 12 * (1 - tramo(d, 1.4, 1.7));
      M.cara = d < 0.6 ? "sorpresa" : "borracho"; M.manoD = mezcla([56, 30], [66, 150], eInOut(tramo(d, 0.1, 0.4)));
      if (d > 0.9) { M.cara = "sonrisa"; M.manoI = mezcla([8, 150], [-6, 120], eInOut(tramo(d, 0.9, 1.2))); M.manoD = [62, 118]; } // aplaude
      if (d > 1.2) { const c = Math.abs(Math.sin(d * 14)); M.manoI = [lerp(-4, 22, c), 118]; M.manoD = [lerp(66, 44, c), 118]; }
    }
    return [{ pose: G, m: matAv(XG, PIES + yG, ESC) }, { pose: M, m: matAv(XM, PIES + yM, ESC) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    PREG.forEach((P, i) => {
      this.una("pr" + i, t > P.t, () => temblar(5, 0.12));
      this.una("pu" + i, t > P.pulsa, () => { temblar(8, 0.15); p.nueva(P.DESTELLO, BOT[1][0], BOT[1][1] - 10, 0, 0, 0.3, 120); });
      this.una("mec" + i, t > P.mec, () => {
        temblar(14, 0.3);
        for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.HUMO, 512 + Math.cos(a) * 60, 150 + Math.sin(a) * 40, Math.cos(a) * v * 0.3, Math.sin(a) * v * 0.3, azar(0.4, 0.7), azar(30, 50)); }
      });
    });
    this.una("pg", t > T_G, () => { temblar(6, 0.12); p.nueva(P.DESTELLO, BOT[0][0], BOT[0][1] - 10, 0, 0, 0.3, 120); });
    this.una("ok", t > T_OK, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 24; k++) { const a = azar(0, 6.283), v = azar(200, 480); p.nueva(P.CHISPA, 512, 150, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
    });
    // lluvia de confeti sobre Guillermo
    if (t > T_OK && t < T_OK + 1.8) for (let k = 0; k < 3; k++) p.nueva(P.CONFETI, XG + azar(-130, 130), azar(-40, -5), azar(-30, 30), azar(40, 120), azar(2.2, 3.2), azar(10, 15), (Math.random() * 5) | 0);
    p.suelo = () => PIES + 10;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** El plató (fondo, suelo y el palo del cartel). Se pinta una vez. */
  plato() {
    if (CT.has("plato")) return CT.get("plato");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, 0, 0, PIES);
    gr.addColorStop(0, "#07081a"); gr.addColorStop(1, "#151842");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, PIES + 60);
    // rayos de luz del plató
    g.globalCompositeOperation = "lighter";
    for (const [x, col] of [[120, "120,140,255"], [512, "255,90,200"], [904, "120,140,255"]]) {
      const l = g.createLinearGradient(0, 0, 0, PIES);
      l.addColorStop(0, `rgba(${col},.22)`); l.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = l; g.beginPath(); g.moveTo(x - 20, -20); g.lineTo(x + 20, -20); g.lineTo(x + 160, PIES); g.lineTo(x - 160, PIES); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    // suelo brillante
    const gs = g.createLinearGradient(0, PIES, 0, H);
    gs.addColorStop(0, "#2a2f6e"); gs.addColorStop(1, "#0a0b20");
    g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H - PIES + 60);
    g.strokeStyle = "rgba(160,180,255,.25)"; g.lineWidth = 2;
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(512 + i * 90, PIES); g.lineTo(512 + i * 260, H + 40); g.stroke(); }
    // palo del cartel y su base
    g.fillStyle = "#5a5f72"; g.fillRect(504, CART.y1, 16, PIES - CART.y1);
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(507, CART.y1, 3, PIES - CART.y1);
    g.fillStyle = "#3a3e4e"; g.beginPath(); g.ellipse(512, PIES + 2, 60, 10, 0, 0, 6.283); g.fill();
    CT.set("plato", c);
    return c;
  }
  /** Atril con su nombre y marcador. */
  atril(g, q, t) {
    const x = q ? XM - 22 : XG + 22, w = 190, col = q ? ["#ff4d5a", "#a3000f"] : ["#4d8bff", "#0d2f9a"];
    const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    gr.addColorStop(0, col[1]); gr.addColorStop(0.5, col[0]); gr.addColorStop(1, col[1]);
    g.beginPath(); g.moveTo(x - w / 2 - 6, ATRIL); g.lineTo(x + w / 2 + 6, ATRIL); g.lineTo(x + w / 2 - 6, PIES + 4); g.lineTo(x - w / 2 + 6, PIES + 4); g.closePath();
    g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#dfe6ff"; g.fillRect(x - w / 2 - 8, ATRIL - 8, w + 16, 10);
    // nombre
    txt(g, q ? "MARCOS" : "GUILLERMO", x, ATRIL + 36, { tam: 22, peso: 900, fam: FD, color: "#fff", esp: 2, max: w - 16 });
    // marcador
    const n = this.puntos(q, t), destello = (q ? PREG.some((p) => t > p.mec && t < p.mec + 0.5) : t > T_OK && t < T_OK + 0.8) && Math.sin(t * 30) > 0;
    g.fillStyle = "#05060f"; rectR(g, x - 40, ATRIL + 52, 80, 62, 8); g.fill();
    txt(g, String(n), x, ATRIL + 104, { tam: 54, peso: 900, fam: FD, color: destello ? "#fff" : n < 0 ? "#ff4d5a" : n > 0 ? "#2bff5b" : "#ffd34d", glow: n ? (n < 0 ? "#ff0020" : "#2bff5b") : null, glowTam: 12 });
  }
  /** Pulsador (va detrás de la mano). */
  boton(g, q, t) {
    const [bx, by] = BOT[q], hund = this.pulsado(q, t) ? 5 : 0;
    g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(bx, by + 2, 26, 9, 0, 0, 6.283); g.fill();
    const gb = g.createRadialGradient(bx - 7, by - 12 + hund, 2, bx, by - 4 + hund, 24);
    gb.addColorStop(0, "#ff9a9a"); gb.addColorStop(0.5, "#e3262f"); gb.addColorStop(1, "#7a0008");
    g.fillStyle = gb; g.beginPath(); g.ellipse(bx, by - 2 + hund, 22, 14 - hund, 0, Math.PI, 0); g.lineTo(bx + 22, by + 1); g.lineTo(bx - 22, by + 1); g.closePath(); g.fill();
    if (hund) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(BLOB.rojo, bx - 50, by - 50, 100, 100); g.restore(); }
  }
  /** El cartel presentador: marco con bombillas, ojos, pajarita y la pregunta. */
  cartel(g, t, a) {
    const { x0, x1, y0, y1 } = CART, w = x1 - x0, h = y1 - y0;
    const P = [...PREG].reverse().find((p) => t > p.t);
    const mec = PREG.find((p) => t > p.mec && t < p.mec + 0.65), ok = t > T_OK;
    // marco
    const borde = mec ? "#ff2a3a" : ok ? "#2bff5b" : "#ffd34d";
    g.fillStyle = "#1b1e3c"; rectR(g, x0 - 14, y0 - 10, w + 28, h + 20, 18); g.fill();
    g.fillStyle = "#06081c"; rectR(g, x0, y0 + 4, w, h - 8, 10); g.fill();
    g.save(); g.strokeStyle = borde; g.lineWidth = 3; g.shadowColor = borde; g.shadowBlur = 14; rectR(g, x0 + 4, y0 + 8, w - 8, h - 16, 8); g.stroke(); g.restore();
    // bombillas
    for (let i = 0; i < 26; i++) {
      const u = i / 26, per = 2 * (w + 28) + 2 * (h + 20);
      let d = u * per, bx, by;
      if (d < w + 28) { bx = x0 - 14 + d; by = y0 - 10; } else if ((d -= w + 28) < h + 20) { bx = x1 + 14; by = y0 - 10 + d; }
      else if ((d -= h + 20) < w + 28) { bx = x1 + 14 - d; by = y1 + 10; } else { d -= w + 28; bx = x0 - 14; by = y1 + 10 - d; }
      const on = (i + Math.floor(t * 8)) % 3 !== 0;
      g.fillStyle = on ? (mec ? "#ff6b6b" : ok ? "#9dff9a" : "#fff3b0") : "#4a4430";
      g.beginPath(); g.arc(bx, by, 4.5, 0, 6.283); g.fill();
    }
    // ojos del presentador (miran a quien contesta)
    let mira = 0;
    if (PREG.some((p) => t > p.pulsa - 0.1 && t < p.mec + 0.65)) mira = 1;
    if (t > T_G - 0.1) mira = -1;
    for (const ex of [462, 562]) {
      g.fillStyle = "#fff"; g.beginPath(); g.ellipse(ex, y0 - 12, 26, 20, 0, 0, 6.283); g.fill();
      g.strokeStyle = "#1b1e3c"; g.lineWidth = 3; g.stroke();
      g.fillStyle = "#111"; g.beginPath(); g.arc(ex + mira * 11, y0 - 8 + (mec ? -3 : 0), 9, 0, 6.283); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(ex + mira * 11 - 3, y0 - 11, 3, 0, 6.283); g.fill();
      // cejas: enfadadas en el ¡MEC!
      g.strokeStyle = "#1b1e3c"; g.lineWidth = 5; g.lineCap = "round";
      const s = ex < 512 ? 1 : -1, en = mec ? 1 : 0;
      g.beginPath(); g.moveTo(ex - 20, y0 - 38 - 4 * en * s); g.lineTo(ex + 20, y0 - 38 + 4 * en * s); g.stroke();
    }
    // pajarita
    g.fillStyle = "#e3262f";
    g.beginPath(); g.moveTo(512, y1 + 24); g.lineTo(476, y1 + 8); g.lineTo(476, y1 + 40); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(512, y1 + 24); g.lineTo(548, y1 + 8); g.lineTo(548, y1 + 40); g.closePath(); g.fill();
    g.fillStyle = "#a3000f"; g.beginPath(); g.arc(512, y1 + 24, 8, 0, 6.283); g.fill();
    if (!P) { txt(g, "¿PREPARADOS?", 512, y0 + 130, { tam: 46, peso: 900, fam: FD, color: "#ffd34d", esp: 3, alfa: tramo(t, 0.3, 0.6) }); return; }
    // ¡PREGUNTA! (cabecera) y la pregunta, que se escribe sola
    const d = t - P.t, k = eBack(tramo(d, 0, 0.18));
    const cab = this.cabecera();
    g.save(); g.translate(512, y0 + 58); g.scale(k * 1.0, k * 1.0); g.drawImage(cab, -cab.width / 2, -cab.height / 2); g.restore();
    const pr = this.texto(P), rev = tramo(d, 0.2, 0.75);
    g.save(); g.beginPath(); g.rect(x0, y0 + 96, w * rev, h - 100); g.clip();
    g.drawImage(pr, 512 - pr.width / 2, y0 + 100); g.restore();
    // ¡MEC!: aspa roja
    if (mec) {
      const dm = t - mec.mec, km = eBack(tramo(dm, 0, 0.12));
      g.save(); g.translate(512, (y0 + y1) / 2 + 6); g.scale(km, km); g.lineCap = "round";
      g.strokeStyle = "rgba(120,0,10,.9)"; g.lineWidth = 34;
      g.beginPath(); g.moveTo(-90, -90); g.lineTo(90, 90); g.moveTo(90, -90); g.lineTo(-90, 90); g.stroke();
      g.strokeStyle = "#ff2a3a"; g.lineWidth = 24; g.stroke();
      g.restore();
    }
    if (ok) {
      const dk = t - T_OK, kk = eBack(tramo(dk, 0, 0.15));
      g.save(); g.translate(512, (y0 + y1) / 2 + 10); g.scale(kk, kk); g.lineCap = "round"; g.lineJoin = "round";
      g.strokeStyle = "rgba(0,70,20,.9)"; g.lineWidth = 32;
      g.beginPath(); g.moveTo(-80, 0); g.lineTo(-20, 60); g.lineTo(90, -70); g.stroke();
      g.strokeStyle = "#2bff5b"; g.lineWidth = 22; g.stroke();
      g.restore();
    }
  }
  cabecera() {
    if (CT.has("cab")) return CT.get("cab");
    const c = lienzoNuevo(480, 100), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 15, 0, 85);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡PREGUNTA!", 240, 80, { tam: 80, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 8, esp: 4, glow: "rgba(255,190,40,.8)", glowTam: 16, max: 450 });
    CT.set("cab", c);
    return c;
  }
  texto(P) {
    const k = "q" + PREG.indexOf(P);
    if (CT.has(k)) return CT.get(k);
    const c = lienzoNuevo(470, 132), g = c.getContext("2d");
    P.l.forEach((s, i) => txt(g, s, 235, 50 + i * 54, { tam: 44, peso: 800, fam: FT, color: "#ffffff", esp: 1, max: 450 }));
    CT.set(k, c);
    return c;
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.plato(), -60, -60);
    this.boton(g, 0, t); this.boton(g, 1, t);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.atril(g, 0, t); this.atril(g, 1, t);

    this.cartel(g, t, a);
    g.restore();
    this.p.dibujar(g);
    // respuestas en bocadillos
    const resp = PREG.map((P) => [P.tr, P.mec, P.resp, 1]).concat([[T_GR, T_OK + 0.9, "¡SIETE!", 0]]);
    for (const [t0, t1, s, q] of resp) {
      if (t < t0 || t > t1) continue;
      const E = e[q], m = aPant(E.m, [q ? 37 : 39, 30]);
      g.save(); g.globalAlpha = a * (1 - tramo(t, t1 - 0.12, t1));
      bocadillo(g, q ? 900 : 124, 204, s, m[0] + (q ? 10 : -10), m[1] - 26, tramo(t, t0, t0 + 0.25), 46);
      g.restore();
    }
    // ¡MEC! y ¡CORRECTO!
    const pop = (s, t0, dur, x, y, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 10, esp: 3, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    for (const P of PREG) pop("¡MEC!", P.mec, 0.65, 512, 368, 96, "#ff2a3a", "#2a0005", -0.06);
    pop("¡CORRECTO!", T_OK, 99, 512, 372, 84, "#2bff5b", "#002a0c", -0.05);
    pop("¡BZZ!", PREG[0].pulsa, 0.4, 680, 350, 40, "#fffdf5", "#7a0008", 0.15);
    pop("¡BZZ!", PREG[1].pulsa, 0.4, 680, 350, 40, "#fffdf5", "#7a0008", 0.15);
    pop("¡BZZ!", PREG[2].pulsa, 0.4, 680, 350, 40, "#fffdf5", "#7a0008", 0.15);
    pop("¡DING!", T_G, 0.4, 346, 350, 40, "#fffdf5", "#0d2f9a", -0.15);
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00163", nombre: "Concurso de preguntas", crear: () => new Concurso() });
})();
