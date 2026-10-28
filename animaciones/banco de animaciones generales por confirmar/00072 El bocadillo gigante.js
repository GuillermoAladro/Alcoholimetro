"use strict";
/*
 * 00072 · EL BOCADILLO GIGANTE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Por la izquierda entra un bocadillo de barra que no se acaba nunca. Él le da mordiscos al pasar, pero no da abasto;
 * se tira a por un bocado enorme, se queda enganchado de los dientes y el bocadillo se lo lleva por la derecha
 * (¡VAYA BOCATA!). Cuando por fin pasa la punta de atrás, vuelve con una barriga enorme y se da palmaditas.
 */
(() => {
const TOP = 318;          // borde de arriba del pan en la pantalla
const OY = TOP - 20;      // origen vertical de la tira del bocadillo
const LARGO = 2600;       // lo que mide el bocadillo (px)
const cacheT = cacheTexto();

/** Un trozo de bocadillo que se repite cada 360 px (lienzo de 360 × 150). */
function tileBocata() {
  const c = lienzoNuevo(360, 150), g = c.getContext("2d");
  // pan de abajo
  let gr = g.createLinearGradient(0, 94, 0, 132);
  gr.addColorStop(0, "#f2c47c"); gr.addColorStop(0.55, "#d48a39"); gr.addColorStop(1, "#7d4313");
  g.fillStyle = gr; g.fillRect(0, 94, 360, 38);
  g.fillStyle = "#f7e2b0"; g.fillRect(0, 93, 360, 6);
  // queso que cuelga
  g.fillStyle = "#ffcf2e"; g.fillRect(0, 84, 360, 10);
  for (let x = 0; x < 360; x += 45) { g.beginPath(); g.moveTo(x + 6, 93); g.quadraticCurveTo(x + 22, 112, x + 38, 93); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, 85, 360, 2);
  // jamón
  g.fillStyle = "#c4303d";
  g.beginPath(); g.moveTo(0, 88);
  for (let x = 0; x <= 360; x += 6) g.lineTo(x, 76 + 3 * Math.sin((x / 60) * Math.PI * 2));
  g.lineTo(360, 90); g.lineTo(0, 90); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,235,235,.8)"; g.lineWidth = 2;
  g.beginPath(); for (let x = 0; x <= 360; x += 6) g.lineTo(x, 82 + 2 * Math.sin((x / 40) * Math.PI * 2)); g.stroke();
  // tomate
  for (let x = 30; x < 360; x += 120) {
    g.fillStyle = "#e8361f"; g.beginPath(); g.ellipse(x, 74, 30, 8, 0, 0, 6.283); g.fill();
    g.fillStyle = "#ff8a63"; g.beginPath(); g.ellipse(x, 73, 22, 4.5, 0, 0, 6.283); g.fill();
    g.fillStyle = "#ffd9a8"; for (const d of [-10, 0, 10]) { g.beginPath(); g.ellipse(x + d, 73, 2.6, 1.6, 0, 0, 6.283); g.fill(); }
  }
  // lechuga rizada
  g.fillStyle = "#58b83a";
  g.beginPath(); g.moveTo(0, 74);
  for (let x = 0; x <= 360; x += 4) g.lineTo(x, 66 + 4 * Math.sin((x / 30) * Math.PI * 2) + 2 * Math.sin((x / 12) * Math.PI * 2));
  g.lineTo(360, 74); g.closePath(); g.fill();
  g.strokeStyle = "#9be26a"; g.lineWidth = 1.5;
  g.beginPath(); for (let x = 0; x <= 360; x += 4) g.lineTo(x, 66 + 4 * Math.sin((x / 30) * Math.PI * 2) + 2 * Math.sin((x / 12) * Math.PI * 2)); g.stroke();
  // pan de arriba
  gr = g.createLinearGradient(0, 18, 0, 68);
  gr.addColorStop(0, "#c9772c"); gr.addColorStop(0.35, "#e7a44f"); gr.addColorStop(0.8, "#f3c47e"); gr.addColorStop(1, "#d79a52");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, 66);
  for (let x = 0; x <= 360; x += 6) g.lineTo(x, 21 - 3 * Math.sin((x / 120) * Math.PI * 2));
  g.lineTo(360, 66); g.quadraticCurveTo(180, 72, 0, 66); g.closePath(); g.fill();
  // greñas (cortes de la barra)
  for (let x = 40; x < 360; x += 120) {
    g.save(); g.translate(x, 34); g.rotate(-0.32);
    g.fillStyle = "#f8d79a"; g.beginPath(); g.ellipse(0, 0, 34, 7, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(120,60,10,.55)"; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -1, 34, 7, 0, Math.PI, 2 * Math.PI); g.stroke();
    g.restore();
  }
  g.fillStyle = "rgba(255,250,235,.45)";
  for (let i = 0; i < 40; i++) { const x = (i * 97) % 360, y = 26 + ((i * 53) % 30); g.fillRect(x, y, 2, 2); }
  return c;
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(900, 170), x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 30, 0, 140);
  gr.addColorStop(0, "#fff3c4"); gr.addColorStop(0.5, "#ffc94a"); gr.addColorStop(1, "#e07b12");
  txt(x, "¡VAYA BOCATA!", 450, 130, { tam: 128, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 3, glow: "rgba(255,170,40,.6)", glowTam: 22, max: 860 });
  txt(x, "¡VAYA BOCATA!", 450, 130, { tam: 128, peso: 900, fam: FD, color: gr, esp: 3, max: 860 });
  cacheT.set(1, c);
  return c;
}
class EscenaBocata extends Escena {
  constructor() {
    super(9.7);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.55; this.X0 = 720;
    this.mordiscos = []; this.migas = []; this.nacs = []; this.p = new Parts(120);
    this.tira = lienzoNuevo(W + 40, 150);
    this.atasco = null; // posición del bocado enorme (en el bocadillo)
  }
  /** Punta delantera del bocadillo (x en pantalla). */
  punta(t) {
    if (t < 0.6) return -10;
    if (t < 4.3) return -10 + 480 * (t - 0.6);
    return -10 + 480 * 3.7 + 820 * (t - 4.3);
  }
  sube(t) { return -38 * eOut(tramo(t, 3.62, 3.95)); }
  estado(t = this.t) {
    const ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let x = this.X0, y = PIES, sy = 1, sx = 1, bote = 0;
    // se frota las manos
    const fr = Math.sin(t * 14) * 4;
    let manoD = [52, 128 + fr], manoI = [28, 128 - fr];
    if (t < 0.9) pose.cara = "sonrisa";
    // lo ve venir
    if (t >= 0.9 && t < 1.6) { pose.cara = "sorpresa"; pose.rc = -0.12 * eInOut(tramo(t, 0.9, 1.2)); }
    if (t >= 1.6 && t < 2.1) { pose.cara = "guino"; pose.rc = -0.12 + 0.12 * eInOut(tramo(t, 1.6, 2.0)); }
    // mordiscos al pasar
    for (const tb of [2.15, 2.5, 2.85]) {
      if (t >= tb - 0.12 && t < tb + 0.22) {
        const k = t < tb ? eIn(tramo(t, tb - 0.12, tb)) : 1 - eOut(tramo(t, tb, tb + 0.22));
        sy = 1 - 0.075 * k; pose.rc = 0.08 * k;
        pose.cara = t < tb - 0.03 ? "risa" : "sonrisa";
      }
    }
    // mira a la izquierda: ¡no se acaba!
    if (t >= 3.07 && t < 3.45) { pose.cara = "sorpresa"; pose.rc = -0.16 * eOut(tramo(t, 3.07, 3.2)); manoD = [84, 98]; manoI = [-6, 98]; }
    // ¡el bocado enorme! y se lo lleva
    if (t >= 3.45 && t < 3.58) { const k = eIn(tramo(t, 3.45, 3.58)); sy = 1 - 0.085 * k; pose.rc = 0.1 * k; pose.cara = "risa"; manoD = [84, 98]; manoI = [-6, 98]; }
    if (t >= 3.58 && t < 4.9) {
      pose.cara = "sorpresa"; sy = 0.915;
      const s = this.atasco != null ? this.atasco : this.punta(3.58) - this.X0;
      x = this.punta(t) - s; y = PIES + this.sube(t);
      const pat = Math.sin(t * 20);
      pose.piernaI = [-4, 0.28 * pat]; pose.piernaD = [-4, -0.28 * pat];
      manoD = [96, 60 + 14 * pat]; manoI = [-18, 60 - 14 * pat];
      pose.rc = 0.06 + 0.03 * pat;
    }
    if (t >= 4.9 && t < 6.75) x = 2000;
    // vuelve con barriga
    let barriga = 0;
    if (t >= 6.75) {
      barriga = 1;
      const kx = tramo(t, 6.75, 7.75);
      x = lerp(1110, 610, kx); sx = 1.12;
      if (kx < 1) { const a = andar(t * 8, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
      pose.cara = t < 7.8 ? "borracho" : t < 8.05 ? "sorpresa" : t < 8.5 ? "risa" : "guino";
      if (t >= 7.8 && t < 8.05) sy = 1.02;
      const pal = t > 8.1 ? Math.max(0, Math.sin(t * 12)) * 6 : 0;
      manoD = [76, 120 - pal]; manoI = [3, 122];
      pose.rc = 0.06 * Math.sin(t * 4);
    }
    if (barriga) pose.objI = (g) => {
      const gr = g.createRadialGradient(30, 112, 4, 39, 124, 38);
      gr.addColorStop(0, "#505054"); gr.addColorStop(0.6, "#2c2c2e"); gr.addColorStop(1, "#151516");
      g.fillStyle = gr; g.beginPath(); g.ellipse(39, 124, 35, 27, 0, 0, 6.283); g.fill();
      g.fillStyle = "#e9b48f";
      for (const by of [110, 122, 134]) { g.beginPath(); g.ellipse(39, by + 6, 2.2, 3.6, 0, 0, 6.283); g.fill(); }
      g.fillStyle = "#d9d9dc";
      for (const by of [104, 116, 128, 140]) { g.beginPath(); g.arc(39, by, 1.6, 0, 6.283); g.fill(); }
    };
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, y + bote, ESC, 0, sx, sy);
    return { pose, m, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const pu = this.punta(t);
    for (const [i, tb] of [2.15, 2.5, 2.85].entries()) {
      this.una("m" + i, t >= tb, () => {
        const e = this.estado(), b = aPant(e.m, boca(e.pose.rc));
        this.mordiscos.push(pu - b[0]);
        temblar(4, 0.12); this.nacs.push({ t0: t, x: b[0] + [-110, 120, -120][i], y: b[1] - [70, 95, 80][i], rot: [-0.15, 0.12, -0.1][i] });
        for (let k = 0; k < 12; k++) this.migas.push({ x: b[0] + azar(-14, 14), y: TOP + azar(0, 8), vx: azar(-160, 160), vy: azar(-320, -80), r: azar(0, 6), s: azar(3, 6) });
      });
    }
    this.una("atasco", t >= 3.58, () => {
      const e = this.estado(3.57), b = aPant(e.m, boca(e.pose.rc));
      this.atasco = pu - this.X0; this.mordiscos.push(pu - b[0]);
      temblar(16, 0.35);
      for (let k = 0; k < 20; k++) this.migas.push({ x: b[0] + azar(-20, 20), y: TOP + azar(0, 8), vx: azar(-220, 220), vy: azar(-420, -100), r: azar(0, 6), s: azar(3, 7) });
    });
    // se lo come por la derecha: migas que salen del borde
    if (t > 4.6 && t < 6.6 && Math.random() < 30 * dt) this.migas.push({ x: W + 10, y: TOP + azar(0, 40), vx: azar(-420, -160), vy: azar(-380, -120), r: azar(0, 6), s: azar(3, 7) });
    this.una("titulo", t > 4.45, () => temblar(14, 0.4));
    this.una("eructo", t > 7.8, () => { temblar(6, 0.2); const e = this.estado(), b = aPant(e.m, boca(0)); for (let k = 0; k < 10; k++) this.migas.push({ x: b[0], y: b[1], vx: azar(-200, 200), vy: azar(-300, -60), r: azar(0, 6), s: azar(3, 5) }); });
    for (const c of this.migas) { c.vy += 1300 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += 8 * dt; }
    this.migas = this.migas.filter((c) => c.y < PIES && c.x > -20 && c.x < W + 30);
    p.actualizar(dt);
  }
  dibujarBocata(g, t) {
    const pu = this.punta(t), cola = pu - LARGO;
    if (pu < -5 || cola > W + 20) return;
    if (!this.tile) this.tile = tileBocata();
    const c = this.tira, x = c.getContext("2d"), dy = this.sube(t);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, c.width, c.height);
    x.translate(20, 0);
    x.save();
    const x0 = Math.max(-20, cola), x1 = Math.min(W + 20, pu);
    rectR(x, cola, 14, LARGO, 120, 48); x.clip();
    // sombra interior de las puntas
    let k = Math.floor((pu - x0) / 360);
    for (let xx = pu - (k + 1) * 360; xx < x1; xx += 360) x.drawImage(this.tile, xx, 0);
    // borde dorado de las puntas
    const gp = x.createLinearGradient(pu - 60, 0, pu, 0);
    gp.addColorStop(0, "rgba(120,60,10,0)"); gp.addColorStop(1, "rgba(120,60,10,.55)");
    x.fillStyle = gp; x.fillRect(pu - 60, 0, 60, 150);
    const gc = x.createLinearGradient(cola, 0, cola + 60, 0);
    gc.addColorStop(0, "rgba(120,60,10,.55)"); gc.addColorStop(1, "rgba(120,60,10,0)");
    x.fillStyle = gc; x.fillRect(cola, 0, 60, 150);
    x.restore();
    // mordiscos: borde de miga y el hueco con la marca de los dientes
    const mordisco = (bx, r) => {
      x.beginPath(); x.arc(bx, 10, 25 + r, 0, 6.283); x.fill();
      for (let i = -2; i <= 2; i++) { const a = Math.PI / 2 + i * 0.5; x.beginPath(); x.arc(bx + Math.cos(a) * 23, 10 + Math.sin(a) * 23, 7 + r, 0, 6.283); x.fill(); }
    };
    for (const [modo, r] of [["source-atop", 6], ["destination-out", 0]]) {
      x.globalCompositeOperation = modo; x.fillStyle = "#f6dfaa";
      for (const s of this.mordiscos) { const bx = pu - s; if (bx > -60 && bx < W + 60) mordisco(bx, r); }
    }
    x.globalCompositeOperation = "source-over";
    g.drawImage(c, -20, OY + dy);
    // banderitas de palillo: 1 M, 2 M, 3 M…
    for (const [s, et] of [[900, "1 M"], [1500, "2 M"], [2100, "3 M"]]) {
      const bx = pu - s;
      if (bx < -60 || bx > W + 60) continue;
      const by = TOP + dy + 8;
      g.strokeStyle = "#e9cf98"; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by - 84); g.stroke();
      g.fillStyle = "#fffdf5"; g.beginPath(); g.moveTo(bx, by - 84); g.lineTo(bx + 86, by - 66); g.lineTo(bx, by - 48); g.closePath(); g.fill();
      g.fillStyle = "#e3262f"; g.fillRect(bx, by - 84, 5, 36);
      txt(g, et, bx + 36, by - 57, { tam: 25, peso: 900, fam: FD, color: "#222" });
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // suelo con luz cálida
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3; g.drawImage(BLOB2.oro, 100, PIES - 30, 820, 64); g.restore();
    if (e.x < W + 200) {
      pintarAvatar(g, e.m, e.pose, t);
    }
    this.dibujarBocata(g, t);
    // migas
    for (const c of this.migas) {
      g.save(); g.translate(c.x, c.y); g.rotate(c.r);
      g.fillStyle = c.s > 5 ? "#e9a752" : "#f6d9a0"; g.fillRect(-c.s / 2, -c.s / 2, c.s, c.s * 0.8);
      g.restore();
    }
    this.p.dibujar(g);
    for (const N of this.nacs) {
      const k = (t - N.t0) / 0.55;
      if (k < 0 || k > 1) continue;
      g.save(); g.translate(N.x, N.y - k * 20); g.rotate(N.rot); g.scale(eBack(Math.min(1, k * 4)), eBack(Math.min(1, k * 4)));
      txt(g, "¡ÑAC!", 0, 0, { tam: 44, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a2a00", bordeAncho: 7, alfa: 1 - tramo(k, 0.7, 1), esp: 2 });
      g.restore();
    }
    // ¡VAYA BOCATA!
    if (t > 4.45 && t < 9.4) {
      const c = titulo(), k = tramo(t, 4.45, 4.62), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(t * 9));
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 9.0, 9.4)); g.translate(W / 2, 120); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.45), tramo(t, 9.15, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00072", nombre: "El bocadillo gigante", crear: () => new EscenaBocata() });
})();
