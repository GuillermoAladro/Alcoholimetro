"use strict";
/*
 * 00041 · LA TORTILLA VOLADORA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la lámpara de la cocina: con delantal, mueve la tortilla en la sartén (CHSSS) y la voltea (¡HOP!).
 * Sube tanto que golpea la lámpara y se sale por arriba. Espera mirando con la sartén... ¿Y LA TORTILLA? Silba al
 * caer (FIIIUUU) y le cae en la cabeza como un sombrero (¡PLAF!), humeando. Se recupera, se la ajusta como una boina y
 * ¡VUELTA Y VUELTA! La lámpara se apaga parpadeando.
 */
(() => {
const LX = 560, LY = -10; // pivote de la lámpara
const T_VUELTA = 2.45, T_SALE = 3.0, T_CAE = 5.0, T_PLAF = 5.27;

class Tortilla extends Escena {
  constructor() {
    super(9.2);
    this.p = new Parts(320);
    this.X = 430; this.ESC = 1.55;
    this.golpe = -1; // cuándo golpea la lámpara
    this.r = semilla(41);
    this.manchas = [];
    for (let i = 0; i < 9; i++) this.manchas.push([this.r() * 2 - 1, this.r() * 2 - 1, 0.1 + this.r() * 0.12]);
  }
  luz() {
    const t = this.t;
    const on = t < 0.62 ? [0, 0.7, 0, 0, 1, 0.3, 1, 1][Math.min(7, Math.floor(t / 0.08))] : 1;
    const off = t < 8.35 ? 1 : [1, 0.25, 1, 0, 0.6, 0, 0, 0][Math.min(7, Math.floor((t - 8.35) / 0.09))];
    return on * off;
  }
  angLampara() {
    if (this.golpe < 0) return 0.01 * Math.sin(this.t * 1.7);
    const s = this.t - this.golpe;
    return -0.38 * Math.sin(s * 5.2) * Math.exp(-s * 0.55);
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [92, 142], manoI = [8, 138], sx = 1, sy = 1, panAng = 0, desliza = 0, enSarten = t < T_VUELTA;
    // la mueve en la sartén
    if (t < 2.1) {
      const k = tramo(t, 0.7, 1.0) * (1 - tramo(t, 1.95, 2.1));
      manoD = [92 + 6 * Math.sin(t * 10) * k, 142 + 2 * Math.cos(t * 10) * k];
      panAng = 0.07 * Math.sin(t * 10) * k;
      desliza = 4 * Math.sin(t * 10 - 0.9) * k;
      pose.cara = t > 1.3 && t < 1.8 ? "guino" : "sonrisa";
    }
    // coge impulso y la voltea
    if (t >= 2.1 && t < T_VUELTA) {
      const k = eInOut(tramo(t, 2.1, 2.4));
      manoD = mezcla([92, 142], [86, 154], k); panAng = 0.16 * k; sy = 1 - 0.05 * k; pose.cara = "guino";
    }
    if (t >= T_VUELTA && t < 3.0) {
      const k = eOut(tramo(t, T_VUELTA, 2.55)), v = eInOut(tramo(t, 2.62, 2.95));
      manoD = mezcla(mezcla([86, 154], [100, 116], k), [96, 134], v);
      panAng = lerp(lerp(0.16, -0.6, k), -0.08, v);
      sy = lerp(0.95, 1, k);
      pose.cara = t < 2.62 ? "risa" : "sorpresa";
    }
    // espera con la sartén preparada, buscando
    if (t >= 3.0 && t < T_PLAF) {
      const busca = Math.sin((t - 3.0) * 3.1);
      manoD = [98 + 12 * busca, 132 - 4 * Math.abs(busca)];
      panAng = -0.08 + 0.05 * busca;
      pose.rc = -0.07 * busca;
      pose.cara = t < 3.5 ? "sorpresa" : t < 4.5 ? "sonrisa" : "sorpresa";
      if (t > 3.6 && t < 4.4) { const pie = Math.max(0, Math.sin((t - 3.6) * 16)); pose.piernaI = [-5 * pie, -0.05 * pie]; }
      if (t > T_CAE) { const k = eOut(tramo(t, T_CAE, T_PLAF)); manoD = mezcla(manoD, [112, 122], k); }
    }
    // ¡PLAF!: aplastado y aturdido
    if (t >= T_PLAF) {
      const k = tramo(t, T_PLAF, 5.75);
      sy = 1 - 0.13 * (1 - eElastico(k)); sx = 1 + 0.06 * (1 - eElastico(k));
      pose.cara = t < 6.3 ? "dormido" : t < 6.6 ? "sorpresa" : t < 7.4 ? "risa" : "guino";
      pose.rc = t < 6.3 ? 0.06 * Math.sin(t * 5) : 0;
      manoD = mezcla([112, 122], [104, 130], eInOut(tramo(t, 5.3, 5.6)));
      panAng = -0.1;
      // se ajusta la tortilla como una boina
      const kA = eInOut(tramo(t, 6.55, 6.85)) * (1 - eInOut(tramo(t, 7.9, 8.2)));
      manoI = mezcla([6, 140], [2, 24], kA);
      if (t > 6.9 && t < 7.9) manoI = [2 + 1.5 * Math.sin(t * 9), 24];
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const sombrero = t >= T_PLAF, kS = sombrero ? eBack(tramo(t, T_PLAF, 5.45)) : 0;
    pose.brazoIDelante = sombrero;
    if (sombrero) pose.objI = (g) => { delantal(g); this.sombrero(g, pose.rc, kS); };
    pose.objD = (g, mano) => { if (!sombrero) delantal(g); this.sarten(g, mano, panAng, enSarten ? desliza : null, t); };
    const m = matAv(this.X, PIES, this.ESC, 0, sx, sy);
    const mano = aPant(m, manoD), cen = aPant(m, [manoD[0] + Math.cos(panAng) * 73, manoD[1] + Math.sin(panAng) * 73]);
    return { pose, m, mano, cen, panAng };
  }
  /** Dónde va la tortilla cuando vuela (pantalla) y cómo gira. */
  vuelo(e) {
    const t = this.t;
    if (t >= T_VUELTA && t < T_SALE + 0.1) {
      const u = tramo(t, T_VUELTA, T_SALE);
      const x0 = this.x0 || e.cen[0], y0 = this.y0 || e.cen[1];
      return { x: lerp(x0, LX - 20, u), y: lerp(y0, -150, Math.pow(u, 0.75)), fi: (t - T_VUELTA) * 19 };
    }
    if (t >= T_CAE && t < T_PLAF) {
      const u = tramo(t, T_CAE, T_PLAF), q = aPant(e.m, [39, 0]);
      return { x: lerp(LX - 70, q[0], u), y: lerp(-90, q[1] - 4, u * (0.45 + 0.55 * u)), fi: (1 - u) * 6 };
    }
    return null;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // vapor y chisporroteo de la sartén
    if (t > 0.5 && t < T_VUELTA && Math.random() < 22 * dt) p.nueva(P.VAPOR, e.cen[0] + azar(-30, 30), e.cen[1] - 8, azar(-10, 10), azar(-80, -40), azar(0.7, 1.1), azar(18, 30));
    if (t > 0.7 && t < 2.1 && Math.random() < 14 * dt) p.nueva(P.GOTA, e.cen[0] + azar(-36, 36), e.cen[1] - 6, azar(-60, 60), azar(-260, -120), 0.5, azar(1.5, 2.5));
    this.una("hop", t > T_VUELTA, () => {
      this.x0 = e.cen[0]; this.y0 = e.cen[1];
      for (let i = 0; i < 12; i++) p.nueva(P.VAPOR, e.cen[0] + azar(-30, 30), e.cen[1] - 10, azar(-60, 60), azar(-200, -80), azar(0.5, 0.9), azar(18, 30));
    });
    const v = this.vuelo(e);
    if (v && t < T_SALE && this.golpe < 0 && v.y < 95) {
      this.golpe = t; temblar(6, 0.2);
      for (let i = 0; i < 12; i++) { const a = azar(0, 6.283), s = azar(100, 300); p.nueva(P.CHISPA, v.x, v.y, Math.cos(a) * s, Math.sin(a) * s, azar(0.2, 0.5), azar(6, 10)); }
    }
    if (v && t < T_SALE && Math.random() < 30 * dt) p.nueva(P.VAPOR, v.x, v.y, azar(-20, 20), azar(20, 60), 0.5, azar(14, 22));
    this.una("plaf", t > T_PLAF, () => {
      temblar(18, 0.4);
      const q = aPant(e.m, [39, 0]);
      for (let i = 0; i < 22; i++) { const a = azar(-Math.PI, 0), s = azar(150, 420); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * s, Math.sin(a) * s, azar(0.3, 0.6), azar(7, 12)); }
      for (let i = 0; i < 16; i++) p.nueva(P.VAPOR, q[0] + azar(-50, 50), q[1] - azar(0, 20), azar(-80, 80), azar(-160, -60), azar(0.6, 1.1), azar(22, 36));
    });
    if (t > T_PLAF && t < 8.3 && Math.random() < 9 * dt) { const q = aPant(e.m, [39 + azar(-25, 25), -6]); p.nueva(P.VAPOR, q[0], q[1], azar(-10, 10), azar(-70, -40), azar(0.8, 1.2), azar(16, 26)); }
    this.una("titulo", t > 6.62, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 24; i++) { const a = azar(0, 6.283), s = azar(200, 520); p.nueva(P.CHISPA, W / 2 + azar(-300, 300), 130, Math.cos(a) * s, Math.sin(a) * s, azar(0.3, 0.7), azar(7, 12)); }
    });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ---------------------------------------------------------------- dibujos
  colorTortilla(g, x0, y0, rx, ry) {
    const gr = g.createRadialGradient(x0 - rx * 0.25, y0 - ry * 0.3, 1, x0, y0, rx);
    gr.addColorStop(0, "#ffe28a"); gr.addColorStop(0.65, "#f2b83f"); gr.addColorStop(1, "#c9852a");
    return gr;
  }
  dibujarManchas(g, x0, y0, rx, ry, a) {
    g.fillStyle = `rgba(150,82,20,${0.55 * a})`;
    for (const [mx, my, r] of this.manchas) { g.beginPath(); g.ellipse(x0 + mx * rx * 0.7, y0 + my * ry * 0.6, r * rx, r * ry, 0, 0, 6.283); g.fill(); }
  }
  /** La sartén en la mano (unidades de avatar). desliza = null si la tortilla no está dentro. */
  sarten(g, mano, ang, desliza, t) {
    g.save(); g.translate(mano[0], mano[1]); g.rotate(ang); g.scale(1.3, 1.3);
    // mango
    g.fillStyle = "#1c1a1a"; rectR(g, -8, -2.6, 36, 5.2, 2.4); g.fill();
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(-6, -2, 32, 1.2);
    g.fillStyle = "#6b6f75"; rectR(g, 26, -2.2, 6, 4.4, 1); g.fill();
    // cuerpo
    const C = 56;
    g.fillStyle = "#16181b"; g.beginPath(); g.ellipse(C, 3.5, 29, 10.5, 0, 0, 6.283); g.fill();
    g.fillStyle = "#3c4046"; g.beginPath(); g.ellipse(C, 0, 29, 9.5, 0, 0, 6.283); g.fill();
    const gr = g.createLinearGradient(C - 26, 0, C + 26, 0);
    gr.addColorStop(0, "#222428"); gr.addColorStop(0.5, "#3a3d43"); gr.addColorStop(1, "#1a1c1f");
    g.fillStyle = gr; g.beginPath(); g.ellipse(C, 0.8, 26, 7.8, 0, 0, 6.283); g.fill();
    if (desliza != null) {
      const x0 = C + desliza, y0 = -0.4;
      g.fillStyle = "#b7772a"; g.beginPath(); g.ellipse(x0, y0 + 1.6, 21, 6.6, 0, 0, 6.283); g.fill();
      g.fillStyle = this.colorTortilla(g, x0, y0, 21, 6.2); g.beginPath(); g.ellipse(x0, y0, 21, 6.2, 0, 0, 6.283); g.fill();
      this.dibujarManchas(g, x0, y0, 21, 6.2, 1);
    }
    g.strokeStyle = "rgba(200,205,212,.55)"; g.lineWidth = 1; g.beginPath(); g.ellipse(C, 0, 29, 9.5, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    g.restore();
  }
  /** La tortilla en la cabeza, como una boina (unidades de avatar, sigue el giro de la cabeza). */
  sombrero(g, rc, k) {
    g.save();
    g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
    g.translate(39, 6); g.scale(1 + 0.25 * (1 - k), k); g.translate(-39, -6);
    g.beginPath();
    g.moveTo(4, 30);
    g.bezierCurveTo(-2, 18, 2, 2, 12, -2);
    g.bezierCurveTo(24, -12, 54, -12, 66, -2);
    g.bezierCurveTo(76, 2, 80, 18, 74, 28);
    g.bezierCurveTo(70, 20, 66, 15, 60, 13);
    g.bezierCurveTo(48, 9, 30, 9, 18, 13);
    g.bezierCurveTo(12, 15, 8, 22, 4, 30);
    g.closePath();
    const gr = g.createLinearGradient(0, -12, 0, 30);
    gr.addColorStop(0, "#ffe189"); gr.addColorStop(0.55, "#f0b23c"); gr.addColorStop(1, "#c07a24");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "#9a5e18"; g.lineWidth = 1.4; g.stroke();
    g.save(); g.clip();
    this.dibujarManchas(g, 39, 4, 34, 12, 1);
    g.fillStyle = "rgba(255,255,255,.3)"; g.beginPath(); g.ellipse(30, -3, 14, 3.5, -0.15, 0, 6.283); g.fill();
    g.restore();
    g.restore();
  }
  dibujarLampara(g, luz) {
    const a = this.angLampara();
    g.save(); g.translate(LX, LY); g.rotate(a);
    // cono de luz
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      const L = PIES + 20;
      const gr = g.createLinearGradient(0, 60, 0, L);
      gr.addColorStop(0, `rgba(255,236,190,${0.24 * luz})`); gr.addColorStop(1, `rgba(255,236,190,${0.07 * luz})`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(-30, 70); g.lineTo(30, 70); g.lineTo(250, L); g.lineTo(-250, L); g.closePath(); g.fill();
      g.globalAlpha = 0.55 * luz; g.drawImage(BLOB.amarillo, -60, 40, 120, 70);
      g.restore();
    }
    g.strokeStyle = "#2c2c2c"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 42); g.stroke();
    const gp = g.createLinearGradient(-36, 0, 36, 0);
    gp.addColorStop(0, "#0d3b26"); gp.addColorStop(0.45, "#2f8a5c"); gp.addColorStop(1, "#0b2f1f");
    g.fillStyle = gp;
    g.beginPath(); g.moveTo(-9, 40); g.lineTo(9, 40); g.quadraticCurveTo(36, 50, 38, 72); g.lineTo(-38, 72); g.quadraticCurveTo(-36, 50, -9, 40); g.closePath(); g.fill();
    g.fillStyle = "#c9b98f"; g.fillRect(-38, 70, 76, 4);
    g.fillStyle = luz > 0.5 ? "#fff6d0" : "#6d6650"; g.beginPath(); g.ellipse(0, 75, 14, 6, 0, 0, Math.PI); g.fill();
    g.restore();
  }
  dibujarTortillaVolando(g, v) {
    const R = 42, ry = R * (0.28 + 0.72 * Math.abs(Math.sin(v.fi)));
    g.save(); g.translate(v.x, v.y);
    g.fillStyle = "#a8661f"; g.beginPath(); g.ellipse(0, 3, R, ry, 0, 0, 6.283); g.fill();
    g.fillStyle = this.colorTortilla(g, 0, 0, R, ry); g.beginPath(); g.ellipse(0, 0, R, ry, 0, 0, 6.283); g.fill();
    this.dibujarManchas(g, 0, 0, R, ry, Math.sin(v.fi) > 0 ? 1 : 0.5);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    this.dibujarLampara(g, luz);
    // suelo iluminado
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * luz;
    g.drawImage(BLOB.blanco, LX + Math.sin(this.angLampara()) * PIES - 280, PIES - 26, 560, 52); g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    const v = this.vuelo(e);
    if (v) this.dibujarTortillaVolando(g, v);
    this.p.dibujar(g);
    // estrellitas de aturdido
    if (t > T_PLAF + 0.1 && t < 6.35) {
      const q = aPant(e.m, [39, -16]);
      for (let i = 0; i < 3; i++) { const a = t * 6 + (i * Math.PI * 2) / 3; brillo(g, q[0] + Math.cos(a) * 62, q[1] + Math.sin(a) * 14, 16, 0.9); }
    }
    // textos
    if (t > 0.8 && t < 2.05) {
      const a = tramo(t, 0.8, 1.0) * (1 - tramo(t, 1.85, 2.05));
      txt(g, "CHSSS", e.cen[0] + 70, e.cen[1] - 60 + 3 * Math.sin(t * 30), { tam: 34, peso: 400, fam: FC, color: "#d9d9d9", borde: "#333", bordeAncho: 5, alfa: a, esp: 3 });
    }
    if (t > T_VUELTA && t < 3.1) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] - 115, q[1] - 46, "¡HOP!", q[0] - 40, q[1] - 2, tramo(t, T_VUELTA, 2.6) * (1 - tramo(t, 2.92, 3.1)), 40);
    }
    if (t > 3.55 && t < 4.6) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] - 170, q[1] - 40, "¿Y LA TORTILLA?", q[0] - 40, q[1] + 6, tramo(t, 3.55, 3.75) * (1 - tramo(t, 4.4, 4.6)), 32);
    }
    if (t > 4.45 && t < T_PLAF) {
      const k = tramo(t, 4.45, T_PLAF);
      g.save(); g.translate(LX - 120 + 30 * Math.sin(t * 9), lerp(70, 150, k)); g.rotate(-0.08);
      txt(g, "FIIIUUU", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#fffdf5", borde: "#444", bordeAncho: 6, alfa: Math.min(1, k * 5), esp: 2 });
      g.restore();
    }
    if (t > T_PLAF && t < 6.1) {
      const k = tramo(t, T_PLAF, T_PLAF + 0.12), q = aPant(e.m, [39, 0]);
      g.save(); g.translate(q[0] + 170, q[1] + 10); g.rotate(0.14); g.scale(eBack(k), eBack(k));
      txt(g, "¡PLAF!", 0, 0, { tam: 64, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 9, alfa: 1 - tramo(t, 5.85, 6.1), esp: 2 });
      g.restore();
    }
    if (t > 6.62 && t < 8.45) {
      const k = tramo(t, 6.62, 6.8), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 3) * (1 - tramo(t, 8.15, 8.45));
      g.save(); g.translate(W / 2 + 40, 172); g.rotate(-0.03); g.scale(s, s);
      txt(g, "¡VUELTA Y VUELTA!", 0, 0, { tam: 92, peso: 400, fam: FC, color: "#ffe28a", borde: "#5a2e00", bordeAncho: 11, alfa: a, esp: 3, max: 940 });
      g.restore();
    }
    // apagado / encendido de la lámpara
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
/** Delantal blanco (unidades de avatar). */
function delantal(g) {
  g.save();
  g.strokeStyle = "#e9e5db"; g.lineWidth = 2.6; g.lineCap = "round";
  g.beginPath(); g.moveTo(28, 93); g.quadraticCurveTo(29, 80, 33, 76); g.moveTo(50, 93); g.quadraticCurveTo(49, 80, 45, 76); g.stroke();
  g.beginPath();
  g.moveTo(27, 92); g.lineTo(51, 92); g.lineTo(52, 126);
  g.quadraticCurveTo(62, 128, 63, 138); g.lineTo(66, 192); g.quadraticCurveTo(39, 198, 12, 192);
  g.lineTo(15, 138); g.quadraticCurveTo(16, 128, 26, 126); g.closePath();
  const gr = g.createLinearGradient(12, 0, 66, 0);
  gr.addColorStop(0, "#cfcac0"); gr.addColorStop(0.35, "#fbf9f3"); gr.addColorStop(1, "#d6d1c6");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 0.8; g.stroke();
  // cinta de la cintura y bolsillo de cuadros
  g.fillStyle = "#d8d2c4"; g.fillRect(14, 132, 51, 3);
  g.save(); rectR(g, 28, 150, 22, 16, 2); g.clip();
  g.fillStyle = "#fff"; g.fillRect(28, 150, 22, 16);
  g.fillStyle = "rgba(200,30,40,.75)";
  for (let i = 0; i < 6; i++) { g.fillRect(28 + i * 4, 150, 2, 16); g.fillRect(28, 150 + i * 4, 22, 2); }
  g.restore();
  g.strokeStyle = "rgba(0,0,0,.25)"; rectR(g, 28, 150, 22, 16, 2); g.stroke();
  g.restore();
}

registrar({ id: "00041", nombre: "La tortilla voladora", crear: () => new Tortilla() });
})();
