"use strict";
/*
 * 00042 · EL CIENTÍFICO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Parpadean los fluorescentes del laboratorio. Con bata y gafas de laboratorio vierte tubos de ensayo de colores en un
 * matraz (verde, rosa, azul: cada uno con su efecto) y los tira por encima del hombro (¡CRASH!). El último es cerveza:
 * el matraz tiembla, brilla y ¡BOOM!, estalla en espuma. Queda tiznado, con el pelo de punta y humeando… pero el
 * matraz se ha llenado de cerveza perfecta: lo levanta, ¡EUREKA! Se apagan las luces.
 */
(() => {
const X = 440, ESC = 1.55;
const RACK = [384, 408, 432, 456], RACK_Y = 415;
const FX = 580, FB = 455; // matraz: centro y base (pantalla)
const COLORES = ["#38e86a", "#ff3d9a", "#2fe3e8", "#ffb31f"];
const MEZCLAS = ["#38e86a", "#b04cff", "#3f7dff", "#ffb31f"];
const CICLO = [1.1, 2.25, 3.4]; // tubos de color: cuándo empieza cada uno
const T_BOOM = 6.9;
const aAv = (q) => [(q[0] - X) / ESC + 39, 232 - (PIES - q[1]) / ESC];

class Cientifico extends Escena {
  constructor() {
    super(10.6);
    this.p = new Parts(480);
    this.tirados = []; // tubos lanzados por encima del hombro
    this.crash = [];   // ¡CRASH! fuera de plano
    this.flash = 0;
    this.fondo = this.pintarFondo(); this.mesa = this.pintarMesa();
  }
  luz() {
    const t = this.t;
    const on = t < 0.7 ? [0, 0.6, 0, 0, 0.9, 0.2, 1, 0.5, 1][Math.min(8, Math.floor(t / 0.075))] : 1;
    const off = t < 9.95 ? 1 : [0.3, 1, 0, 0.5, 0, 0, 0][Math.min(6, Math.floor((t - 9.95) / 0.08))];
    return on * off;
  }
  /** Mano y tubo en un ciclo de tubo de color (u = segundos desde que empieza). */
  ciclo(u, k, desde) {
    const ag = aAv([RACK[k], RACK_Y - 22]), sube = aAv([RACK[k], RACK_Y - 70]);
    const vierte = aAv([572 - 16.4, 288 - 7.5]);
    let mano, ang = 0;
    if (u < 0.25) mano = mezcla(desde, ag, eInOut(u / 0.25));
    else if (u < 0.4) mano = mezcla(ag, sube, eInOut((u - 0.25) / 0.15));
    else if (u < 0.62) { const v = eInOut((u - 0.4) / 0.22); mano = mezcla(sube, vierte, v); ang = 0.5 * v; }
    else if (u < 0.92) { mano = vierte; ang = lerp(0.5, 2.0, eOut((u - 0.62) / 0.18)); }
    else { const v = eOut((u - 0.92) / 0.14); mano = mezcla(vierte, [96, 18], v); ang = lerp(2.0, -2.2, v); }
    return { mano, ang, enMano: u >= 0.25 && u < 1.02, vierte: u > 0.68 && u < 0.92 };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 146], manoI = [8, 146], tubo = -1, tAng = 0, vierte = -1, sy = 1, dx = 0;
    if (t > 0.7 && t < 1.1) { pose.cara = "guino"; pose.rc = 0.06 * Math.sin((t - 0.7) * 16); }
    for (let k = 0; k < 3; k++) {
      const u = t - CICLO[k];
      if (u >= 0 && u < 1.15) {
        const c = this.ciclo(u, k, k ? [96, 18] : [72, 146]);
        manoD = c.mano; tAng = c.ang; if (c.enMano) tubo = k; if (c.vierte) vierte = k;
        pose.cara = c.vierte ? (k === 1 ? "guino" : "sonrisa") : u > 0.92 ? "risa" : "sonrisa";
      }
    }
    // la cerveza: la coge, la enseña, la vierte
    if (t >= 4.55 && t < T_BOOM) {
      const ag = aAv([RACK[3], RACK_Y - 22]), sube = aAv([RACK[3], RACK_Y - 70]), ensena = [86, 66], vierteP = aAv([572 - 16.4, 288 - 7.5]);
      if (t < 4.8) manoD = mezcla([96, 18], ag, eInOut(tramo(t, 4.55, 4.8)));
      else if (t < 4.95) manoD = mezcla(ag, sube, eInOut(tramo(t, 4.8, 4.95)));
      else if (t < 5.25) manoD = mezcla(sube, ensena, eInOut(tramo(t, 4.95, 5.25)));
      else if (t < 5.8) { manoD = [ensena[0], ensena[1] + 2 * Math.sin(t * 9)]; pose.cara = "guino"; pose.rc = 0.08; }
      else if (t < 6.05) { const v = eInOut(tramo(t, 5.8, 6.05)); manoD = mezcla(ensena, vierteP, v); tAng = 0.5 * v; }
      else if (t < 6.4) { manoD = vierteP; tAng = lerp(0.5, 2.0, eOut(tramo(t, 6.05, 6.25))); if (t > 6.1) vierte = 3; }
      else { const v = eInOut(tramo(t, 6.4, 6.6)); manoD = mezcla(vierteP, [92, 124], v); tAng = lerp(2.0, 0.2, v); }
      if (t >= 4.8) tubo = 3;
      if (t > 6.4) { pose.cara = "sorpresa"; dx = -6 * eInOut(tramo(t, 6.4, 6.7)); manoI = [-6, 140]; }
    }
    // después del ¡BOOM!
    if (t >= T_BOOM) {
      const k = tramo(t, T_BOOM, T_BOOM + 0.5);
      pose.cara = t < 7.7 ? "sorpresa" : t < 8.15 ? "borracho" : "risa";
      pose.puntas = 1;
      sy = 1 - 0.06 * (1 - eElastico(k));
      manoD = mezcla([84, 140], [72, 146], tramo(t, T_BOOM, 7.4));
      manoI = [8, 146];
      if (t < 8.1) pose.rc = 0.07 * Math.sin(t * 7) * (1 - tramo(t, 7.6, 8.1));
      // coge el matraz y lo levanta
      const cuello = aAv([FX, 322]);
      if (t > 7.85 && t < 8.2) manoD = mezcla([72, 146], cuello, eInOut(tramo(t, 7.85, 8.2)));
      if (t >= 8.2) manoD = mezcla(cuello, [103, 24], eOut(tramo(t, 8.2, 8.5)));
      if (t >= 8.5) { manoD = [103, 24 + 2 * Math.sin(t * 6)]; manoI = mezcla([8, 146], [-30, 60], eOut(tramo(t, 8.45, 8.75))); }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const boom = t >= T_BOOM, enMano = t >= 8.2;
    pose.objD = (g, m) => {
      bata(g);
      if (boom) tizne(g, pose.rc);
      gafasLab(g, pose.rc, boom);
      if (boom) for (const [x, y, r] of [[20, -4, 8], [55, -2, 7], [66, 84, 7], [14, 90, 6], [44, 112, 6]]) g.drawImage(SPR.espuma, x - r, y - r, r * 2, r * 2);
      if (tubo >= 0) { g.save(); g.translate(m[0], m[1]); g.scale(1 / ESC, 1 / ESC); g.rotate(tAng); g.translate(0, 22); dibujarTubo(g, COLORES[tubo], tubo === 3); g.restore(); }
      if (enMano) { g.save(); g.translate(m[0], m[1]); g.scale(1 / ESC, 1 / ESC); this.matraz(g, 0, 135, 1); g.restore(); }
    };
    pose.objD2 = (g, m, a) => mangaD(g, m, a);
    pose.objI2 = (g, m, a) => mangaI(g, m, a);
    const mm = matAv(X + dx, PIES, ESC, 0, 1, sy);
    return { pose, m: mm, tubo, tAng, vierte };
  }
  /** Color y nivel del matraz ahora. */
  contenido() {
    const t = this.t;
    let nivel = 0, color = MEZCLAS[0], prev = MEZCLAS[0], k = 1;
    for (let i = 0; i < 3; i++) {
      const a = CICLO[i] + 0.68, b = CICLO[i] + 0.92;
      if (t > a) { nivel = 0.22 * (i + tramo(t, a, b)); prev = i ? MEZCLAS[i - 1] : MEZCLAS[0]; color = MEZCLAS[i]; k = tramo(t, a, b); }
    }
    if (t > 6.1) { nivel = 0.66 + 0.16 * tramo(t, 6.1, 6.4); prev = MEZCLAS[2]; color = MEZCLAS[3]; k = tramo(t, 6.1, 6.45); }
    if (t > T_BOOM) { nivel = 0.9; prev = color = "#ffb31f"; k = 1; }
    return { nivel, color, prev, k };
  }
  /** Erlenmeyer; (x, y) = centro de la base. esc para el de la mano. */
  matraz(g, x, y, esc) {
    const t = this.t, c = this.contenido();
    const tiembla = t > 6.35 && t < T_BOOM ? tramo(t, 6.35, T_BOOM) : 0;
    g.save(); g.translate(x + azar(-1, 1) * 5 * tiembla, y); g.scale(esc, esc); g.rotate(azar(-1, 1) * 0.05 * tiembla);
    const forma = () => {
      g.beginPath();
      g.moveTo(-18, -155); g.lineTo(18, -155); g.lineTo(18, -110);
      g.lineTo(70, -14); g.quadraticCurveTo(76, 0, 60, 0); g.lineTo(-60, 0); g.quadraticCurveTo(-76, 0, -70, -14);
      g.lineTo(-18, -110); g.closePath();
    };
    forma(); g.fillStyle = "rgba(190,225,255,.12)"; g.fill();
    if (c.nivel > 0.01) {
      g.save(); forma(); g.clip();
      const top = -c.nivel * 150;
      g.fillStyle = c.k < 1 ? mezclaColor(c.prev, c.color, c.k) : c.color;
      g.globalAlpha = 0.85; g.fillRect(-80, top, 160, -top + 2);
      g.globalAlpha = 1;
      g.fillStyle = "rgba(255,255,255,.35)";
      for (let i = 0; i < 9; i++) { const by = -((t * 60 + i * 37) % Math.max(10, -top)); g.beginPath(); g.arc(-40 + ((i * 29) % 80), by, 2 + (i % 3), 0, 6.283); g.fill(); }
      if (t > T_BOOM) {
        // corona de espuma
        g.fillStyle = "#fffaf0"; g.fillRect(-80, top - 2, 160, 18);
      }
      g.restore();
      if (tiembla > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7 * tiembla; g.drawImage(BLOB2.oro, -110, -150, 220, 170); g.restore(); }
    }
    if (t > T_BOOM) {
      // espuma que rebosa por la boca
      g.fillStyle = "#fffaf0";
      for (const [bx, by, r] of [[-16, -158, 11], [0, -164, 13], [16, -158, 11], [-8, -170, 9], [9, -172, 8], [21, -146, 6], [-21, -140, 6]]) { g.beginPath(); g.arc(bx, by, r, 0, 6.283); g.fill(); }
      g.strokeStyle = "rgba(200,180,140,.5)"; g.lineWidth = 1.5;
      g.beginPath(); g.arc(0, -164, 13, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    }
    forma(); g.strokeStyle = "rgba(225,240,255,.9)"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-11, -150, 4, 36);
    g.beginPath(); g.moveTo(-26, -100); g.lineTo(-56, -22); g.lineTo(-50, -22); g.lineTo(-22, -96); g.closePath(); g.fill();
    g.fillStyle = "#cfe3f0"; rectR(g, -22, -160, 44, 7, 3); g.fill();
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // tubos tirados por encima del hombro
    for (let k = 0; k < 3; k++) this.una("tira" + k, t > CICLO[k] + 1.02, () => { const q = aPant(e.m, e.pose.manoD); this.tirados.push({ x: q[0], y: q[1], vx: -640, vy: -880, r: 0, c: COLORES[k] }); });
    for (const o of this.tirados) {
      o.vy += 1500 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.r -= 12 * dt;
      if (!o.roto && o.x < -40 && o.vy > 0) { o.roto = true; this.crash.push({ t0: t, y: clamp(o.y, 120, 300) }); temblar(4, 0.15); }
    }
    // efectos de cada mezcla
    const sobre = [FX, 340];
    this.una("e0", t > CICLO[0] + 0.85, () => { for (let i = 0; i < 26; i++) p.nueva(P.ESPUMA, FX + azar(-14, 14), 300, azar(-90, 90), azar(-300, -150), azar(0.4, 0.8), azar(3, 7)); });
    this.una("e1", t > CICLO[1] + 0.85, () => { for (let i = 0; i < 20; i++) p.nueva(P.HUMO, FX + azar(-20, 20), 290, azar(-120, 120), azar(-200, -60), azar(0.6, 1.1), azar(26, 44)); temblar(5, 0.2); });
    this.una("e2", t > CICLO[2] + 0.85, () => { for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), s = azar(80, 320); p.nueva(P.ELECTRICA, sobre[0], sobre[1], Math.cos(a) * s, Math.sin(a) * s, azar(0.3, 0.6), azar(10, 18)); } });
    if (t > 6.35 && t < T_BOOM) {
      temblar(2 + 8 * tramo(t, 6.35, T_BOOM), 0.1);
      if (Math.random() < 40 * dt) p.nueva(P.ESPUMA, FX + azar(-14, 14), 296, azar(-50, 50), azar(-220, -90), azar(0.3, 0.6), azar(3, 6));
      if (Math.random() < 20 * dt) p.nueva(P.VAPOR, FX + azar(-14, 14), 290, azar(-20, 20), azar(-90, -50), azar(0.5, 0.9), azar(18, 28));
    }
    this.una("boom", t > T_BOOM, () => {
      this.flash = 1; temblar(32, 0.8);
      for (let i = 0; i < 170; i++) { const a = azar(-Math.PI * 0.95, -Math.PI * 0.05), s = azar(200, 900); p.nueva(P.ESPUMA, FX + azar(-20, 20), 300, Math.cos(a) * s, Math.sin(a) * s - 100, azar(0.8, 1.6), azar(8, 26)); }
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), s = azar(200, 700); p.nueva(P.CHISPA, FX, 300, Math.cos(a) * s, Math.sin(a) * s, azar(0.3, 0.7), azar(8, 14)); }
      for (let i = 0; i < 24; i++) p.nueva(P.HUMO, FX + azar(-80, 80), 300 + azar(-60, 60), azar(-160, 160), azar(-160, 20), azar(0.9, 1.6), azar(50, 90));
    });
    if (t > T_BOOM + 0.2 && t < 9.8 && Math.random() < 14 * dt) { const q = aPant(e.m, [39 + azar(-24, 24), -10]); p.nueva(P.HUMO, q[0], q[1], azar(-15, 15), azar(-90, -50), azar(0.8, 1.3), azar(20, 34)); }
    this.una("eureka", t > 8.55, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, azar(160, 860), azar(-50, 0), azar(-50, 50), azar(60, 160), azar(2.0, 2.6), azar(9, 15), i % 5);
    });
    if (t > 8.6 && t < 9.9 && Math.random() < 12 * dt) { const q = aPant(e.m, [103, -40]); p.nueva(P.DESTELLO, q[0] + azar(-60, 60), q[1] + azar(-60, 80), 0, 0, 0.35, 30); }
    this.flash = Math.max(0, this.flash - dt * 2.4);
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  pintarFondo() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#0b1418"); gr.addColorStop(1, "#162229");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // azulejos
    g.strokeStyle = "rgba(120,170,180,.07)"; g.lineWidth = 2;
    for (let x = 0; x < W; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, FB); g.stroke(); }
    for (let y = 0; y < FB; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // estante con frascos
    g.fillStyle = "#3a2c22"; g.fillRect(640, 196, 330, 10);
    g.fillStyle = "#24190f"; g.fillRect(640, 206, 330, 5);
    const frascos = [[675, 40, "#38e86a"], [720, 56, "#b04cff"], [770, 34, "#ff3d9a"], [820, 60, "#2fe3e8"], [880, 46, "#ffd34d"], [930, 38, "#38e86a"]];
    for (const [fx, h, col] of frascos) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25;
      const bl = g.createRadialGradient(fx, 196 - h * 0.4, 2, fx, 196 - h * 0.4, h);
      bl.addColorStop(0, col); bl.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = bl; g.fillRect(fx - h, 196 - h * 1.4, h * 2, h * 2); g.restore();
      g.fillStyle = col; g.globalAlpha = 0.75; rectR(g, fx - 12, 196 - h * 0.6, 24, h * 0.6, 4); g.fill();
      g.globalAlpha = 1; g.strokeStyle = "rgba(220,240,255,.6)"; g.lineWidth = 2; rectR(g, fx - 12, 196 - h, 24, h, 5); g.stroke();
    }
    return c;
  }
  pintarMesa() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    // la mesa del laboratorio (delante de él)
    const gm = g.createLinearGradient(0, FB, 0, H);
    gm.addColorStop(0, "#26313a"); gm.addColorStop(1, "#11171c");
    g.fillStyle = gm; g.fillRect(230, FB + 6, 760, H - FB);
    g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 2;
    for (const x of [420, 610, 800]) { g.strokeRect(x - 80, FB + 26, 160, 100); }
    g.fillStyle = "#6c7a86";
    for (const x of [420, 610, 800]) { rectR(g, x - 18, FB + 40, 36, 6, 3); g.fill(); }
    const gt = g.createLinearGradient(0, FB - 4, 0, FB + 10);
    gt.addColorStop(0, "#d8e2e8"); gt.addColorStop(1, "#7e8c96");
    g.fillStyle = gt; g.fillRect(218, FB - 2, 784, 12);
    return c;
  }
  dibujarRack(g, e) {
    // gradilla de madera con los tubos que quedan
    const t = this.t;
    for (let k = 0; k < 4; k++) {
      const fuera = k < 3 ? t > CICLO[k] + 0.25 : t > 4.8;
      if (!fuera) { g.save(); g.translate(RACK[k], RACK_Y); dibujarTubo(g, COLORES[k], k === 3); g.restore(); }
    }
    g.fillStyle = "#8a5a32"; rectR(g, 368, 424, 104, 12, 3); g.fill();
    g.fillStyle = "#6b4424"; g.fillRect(372, 436, 6, 18); g.fillRect(462, 436, 6, 18);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(370, 425, 100, 2);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo, 0, 0);
    pintarAvatar(g, e.m, e.pose, t);
    g.drawImage(this.mesa, 0, 0);
    // los objetos de la mesa (delante de él)
    this.dibujarRack(g, e);
    if (t < 8.2) this.matraz(g, FX, FB, 1);
    // chorro del tubo al matraz
    if (e.vierte >= 0 && e.tubo >= 0) {
      const mano = aPant(e.m, e.pose.manoD), boca = [mano[0] + rot2([0, -18], e.tAng)[0], mano[1] + rot2([0, -18], e.tAng)[1]];
      const fondoL = FB - 4 - this.contenido().nivel * 150;
      g.strokeStyle = COLORES[e.vierte]; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(boca[0], boca[1]);
      g.quadraticCurveTo(boca[0] + 6 + 2 * Math.sin(t * 40), (boca[1] + fondoL) / 2, FX - 2, fondoL); g.stroke();
    }
    // tubos volando
    for (const o of this.tirados) if (o.x > -60 && o.y < H + 60) { g.save(); g.translate(o.x, o.y); g.rotate(o.r); dibujarTubo(g, o.c, false, 0.15); g.restore(); }
    this.p.dibujar(g);
    // ¡CRASH! fuera de plano
    for (const c of this.crash) {
      const k = tramo(t, c.t0, c.t0 + 0.7);
      if (k >= 1) continue;
      g.save(); g.translate(78, c.y); g.rotate(-0.2); g.scale(eBack(k * 4), eBack(k * 4));
      txt(g, "¡CRASH!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0d0d", bordeAncho: 7, alfa: 1 - tramo(k, 0.7, 1), esp: 2 });
      g.restore();
    }
    // je, je
    if (t > 0.75 && t < 1.25) {
      const q = aPant(e.m, [39, -10]);
      txt(g, "JE, JE…", q[0] - 120, q[1] - 10, { tam: 36, peso: 400, fam: FC, color: "#d6fbff", borde: "#0b3a40", bordeAncho: 6, alfa: tramo(t, 0.75, 0.85) * (1 - tramo(t, 1.1, 1.25)), esp: 2 });
    }
    if (t > 5.25 && t < 5.85) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] - 140, q[1] - 40, "¿Y SI…?", q[0] - 40, q[1] - 2, tramo(t, 5.25, 5.4) * (1 - tramo(t, 5.7, 5.85)), 34);
    }
    if (t > T_BOOM && t < 7.9) {
      const k = tramo(t, T_BOOM, T_BOOM + 0.15);
      g.save(); g.translate(W / 2 + 120, 150); g.rotate(-0.1); g.scale(eBack(k) * 1.1, eBack(k) * 1.1);
      txt(g, "¡BOOM!", 0, 0, { tam: 110, peso: 400, fam: FC, color: "#ffd34d", borde: "#5a1a00", bordeAncho: 12, alfa: 1 - tramo(t, 7.6, 7.9), esp: 3 });
      g.restore();
    }
    if (t > 8.55 && t < 10.0) {
      const k = tramo(t, 8.55, 8.72), s = lerp(2.8, 1, eIn(k)), a = Math.min(1, k * 3);
      g.save(); g.translate(W / 2 + 150, 150); g.rotate(-0.05); g.scale(s, s);
      txt(g, "¡EUREKA!", 0, 0, { tam: 120, peso: 400, fam: FC, color: "#d6fff0", borde: "#04503a", bordeAncho: 13, alfa: a, esp: 4, max: 640 });
      g.restore();
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,250,232,${this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
function mezclaColor(a, b, k) {
  const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(",")})`;
}
/** Tubo de ensayo (pantalla): boca en y = -40, fondo redondo en y = 32. */
function dibujarTubo(g, color, cerveza, nivel = 0.55) {
  const top = 32 - 70 * nivel;
  g.save();
  g.beginPath(); g.moveTo(-7.5, -40); g.lineTo(-7.5, 25); g.arc(0, 25, 7.5, Math.PI, 0, true); g.lineTo(7.5, -40); g.closePath();
  g.fillStyle = "rgba(200,230,255,.15)"; g.fill();
  g.save(); g.clip();
  g.fillStyle = color; g.fillRect(-8, top, 16, 40);
  if (cerveza) { g.fillStyle = "#fffaf0"; g.fillRect(-8, top - 6, 16, 7); }
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-5, -36, 2.5, 60);
  g.restore();
  g.strokeStyle = "rgba(225,240,255,.9)"; g.lineWidth = 2; g.stroke();
  g.fillStyle = "#d5e6f2"; rectR(g, -9.5, -43, 19, 4, 2); g.fill();
  g.restore();
}
/** Bata blanca sobre el torso (unidades de avatar). */
function bata(g) {
  g.save();
  const gr = g.createLinearGradient(14, 0, 66, 0);
  gr.addColorStop(0, "#cfd6da"); gr.addColorStop(0.3, "#fbfdfe"); gr.addColorStop(0.75, "#eef2f4"); gr.addColorStop(1, "#c3cbd0");
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(31, 75); g.lineTo(20, 80); g.quadraticCurveTo(12, 84, 13, 96); g.lineTo(14, 200); g.lineTo(64, 200); g.lineTo(65, 96);
  g.quadraticCurveTo(66, 84, 58, 80); g.lineTo(47, 75); g.lineTo(39, 112); g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 0.8; g.stroke();
  g.fillStyle = "#e9eef1"; g.beginPath(); g.arc(13, 89, 8.5, 0, 6.283); g.fill();
  // solapas
  g.fillStyle = "#e1e7ea";
  g.beginPath(); g.moveTo(31, 75); g.lineTo(39, 112); g.lineTo(30, 98); g.lineTo(24, 86); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(47, 75); g.lineTo(39, 112); g.lineTo(48, 98); g.lineTo(54, 86); g.closePath(); g.fill(); g.stroke();
  // bolsillo con bolis y botones
  g.strokeStyle = "rgba(0,0,0,.25)"; g.strokeRect(48, 100, 11, 10);
  g.fillStyle = "#1b6fd8"; g.fillRect(50, 95, 2, 7); g.fillStyle = "#d81b2b"; g.fillRect(54, 96, 2, 6);
  g.fillStyle = "#c3cbd0"; for (const y of [120, 134, 148]) { g.beginPath(); g.arc(42, y, 1.4, 0, 6.283); g.fill(); }
  g.strokeStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.moveTo(39, 112); g.lineTo(40, 200); g.stroke();
  g.restore();
}
function manga(g, S, mano, a, L2) {
  const E = [mano[0] - Math.cos(a) * L2, mano[1] - Math.sin(a) * L2];
  const P = [E[0] + Math.cos(a) * L2 * 0.68, E[1] + Math.sin(a) * L2 * 0.68];
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = "#c3cbd0"; g.lineWidth = 15.5;
  g.beginPath(); g.moveTo(S[0], S[1] + 2); g.lineTo(E[0], E[1]); g.lineTo(P[0], P[1]); g.stroke();
  g.strokeStyle = "#f6f9fa"; g.lineWidth = 12.5; g.stroke();
  g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 1; g.beginPath();
  const n = [-Math.sin(a), Math.cos(a)];
  g.moveTo(P[0] - n[0] * 6, P[1] - n[1] * 6); g.lineTo(P[0] - n[0] * 6 - Math.cos(a) * 4, P[1] - n[1] * 6 - Math.sin(a) * 4); g.stroke();
  g.restore();
}
function mangaD(g, mano, a) { manga(g, [RIG.hombroD[0] - 2, RIG.hombroD[1]], mano, a, RIG.L2); }
function mangaI(g, mano, a) { manga(g, [RIG.hombroI2[0] + 2, RIG.hombroI2[1]], mano, a, RIG.L2I); }
/** Gafas de laboratorio (en la cara o subidas a la frente después de la explosión). */
function gafasLab(g, rc, subidas) {
  g.save();
  g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  if (subidas) { g.translate(39, 12); g.rotate(-0.18); g.translate(-39, -40); }
  g.strokeStyle = "#1c5a63"; g.lineWidth = 3; g.beginPath(); g.moveTo(9, 40); g.lineTo(16, 40); g.moveTo(62, 40); g.lineTo(69, 40); g.stroke();
  rectR(g, 14, 30, 50, 20, 8);
  g.fillStyle = "rgba(170,235,255,.28)"; g.fill();
  g.strokeStyle = "#2a7f8b"; g.lineWidth = 2.6; g.stroke();
  g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.moveTo(18, 46); g.lineTo(24, 33); g.lineTo(27, 33); g.lineTo(21, 46); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(44, 46); g.lineTo(50, 33); g.lineTo(52, 33); g.lineTo(46, 46); g.closePath(); g.fill();
  g.fillStyle = "#2a7f8b"; g.fillRect(37, 34, 4, 10);
  g.restore();
}
/** Tizne de la explosión. */
function tizne(g, rc) {
  g.save();
  g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  g.fillStyle = "rgba(25,18,14,.35)";
  for (const [x, y, rx, ry] of [[22, 56, 6, 3.5], [56, 54, 5, 3], [44, 24, 7, 3], [30, 64, 4, 2.4]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.2, 0, 6.283); g.fill(); }
  g.restore();
}

registrar({ id: "00042", nombre: "El científico", crear: () => new Cientifico() });
})();
