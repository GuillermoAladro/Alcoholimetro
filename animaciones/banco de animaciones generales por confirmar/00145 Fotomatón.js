"use strict";
/*
 * 00145 · FOTOMATÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Dentro de la cabina del fotomatón, apretados: cuatro fotos (¡CLIC!) y en cada una ponen caras distintas (sonrisa
 * de carné, guiño y susto, cara de borracho y V de victoria, gafas de sol). Fuera, con la cortina echada (se les ven
 * los pies), la tira de fotos baja por la ranura. Salen, Rodrigo la coge y la tira con las cuatro fotos se ve en grande.
 */
(() => {
const EP = 2.55, AYP = 792, XGP = 418, XRP = 612;         // dentro: de cintura para arriba
const ESC = 1.55, XG = 232, XR = 792;                   // fuera
const DISP = [1.3, 2.4, 3.5, 4.6], T_FUERA = 5.05, T_BAJA = 5.6, T_CORTINA = 7.05, T_COGE = 7.95, T_GRANDE = 8.15, T_APAGA = 9.6;
const RECORTE = { x: 515, y: 350, l: 410 };             // lo que sale en cada foto
const CAB = { x0: 352, x1: 672, top: 66 };             // la cabina por fuera
const RANURA = [632, 252];
const aU = (X, Y, E, q) => [(q[0] - X) / E + 39, (q[1] - Y) / E + 232];

/** El fondo de dentro de la cabina: cortina lisa azul con pliegues suaves (pintado una vez). */
let _dentro = null;
function fondoDentro() {
  if (_dentro) return _dentro;
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#23407a"); gr.addColorStop(1, "#101c3a");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 64) {
    const gp = g.createLinearGradient(x, 0, x + 64, 0);
    gp.addColorStop(0, "rgba(0,0,0,.22)"); gp.addColorStop(0.5, "rgba(255,255,255,.06)"); gp.addColorStop(1, "rgba(0,0,0,.22)");
    g.fillStyle = gp; g.fillRect(x, 0, 64, H);
  }
  const v = g.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, 640);
  v.addColorStop(0, "rgba(255,255,255,.12)"); v.addColorStop(1, "rgba(0,0,0,.55)");
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return (_dentro = c);
}

class Fotomaton extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(300);
    this.fotos = [];
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, 10.15)); }
  /** Dentro: en qué foto van (0–3) y cuánto falta. */
  posesDentro(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let n = 0;
    for (let i = 0; i < 4; i++) if (t > DISP[i] + 0.25) n = i + 1;
    let gD = [70, 158], gI = [9, 160], rD = [68, 157], rI = [9, 157], giroG = 0, giroR = 0, xg = XGP, xr = XRP, yG = 0, yR = 0;
    // entran apretándose (Rodrigo empuja)
    if (t < 1.0) { const k = eOut(tramo(t, 0.2, 0.8)); xr = lerp(760, XRP, k); xg = XGP - 18 * Math.sin(tramo(t, 0.55, 0.95) * Math.PI); G.cara = t > 0.6 ? "sorpresa" : "sonrisa"; }
    const pose = [
      // 1: carita de carné, mejilla con mejilla
      () => { giroG = 0.05; giroR = -0.05; G.rc = 0.12; R.rc = -0.12; G.cara = "sonrisa"; R.cara = "sonrisa"; gD = [102, 112]; rI = [-16, 96]; },
      // 2: guiño con el pulgar y susto con las manos en la cara
      () => { G.cara = "guino"; gD = [94, 96]; R.cara = "sorpresa"; rD = [56, 64]; rI = [20, 64]; R.rc = 0.05; yR = -10; },
      // 3: cara de borracho y la V de la victoria
      () => { G.cara = "borracho"; G.rc = 0.24; giroG = 0.06; gI = [-14, 56]; R.cara = "risa"; rD = [96, 18]; R.rc = -0.1; yG = 8; },
      // 4: gafas de sol y brazos cruzados
      () => { G.gafas = true; R.gafas = true; G.cara = "sonrisa"; R.cara = "risa"; gD = [26, 112]; gI = [52, 112]; rD = [24, 112]; rI = [50, 112]; G.brazoIDelante = true; giroG = -0.03; giroR = 0.03; },
    ];
    // cada pose: un poco antes del disparo hasta un poco después
    for (let i = 0; i < 4; i++) if (t > DISP[i] - 0.55 && (i === 3 || t < DISP[i + 1] - 0.55)) pose[i]();
    void n;
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    return [{ pose: G, m: matAv(xg, AYP + yG, EP, giroG) }, { pose: R, m: matAv(xr, AYP + yR, EP, giroR) }];
  }
  vistaDentro(g, t, e) {
    g.drawImage(fondoDentro(), 0, 0);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
  }
  /** Saca la foto i en el momento del disparo. */
  disparar(i) {
    if (!listo("torso") || !listo("rodrigo_torso")) return null;
    const S = 220, c = lienzoNuevo(S, S), g = c.getContext("2d"), s = S / RECORTE.l;
    g.scale(s, s); g.translate(-(RECORTE.x - RECORTE.l / 2), -(RECORTE.y - RECORTE.l / 2));
    this.vistaDentro(g, DISP[i], this.posesDentro(DISP[i]));
    return c;
  }
  /** Fuera: andan de detrás de la cortina a los lados. */
  posesFuera(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const kS = eInOut(tramo(t, T_CORTINA + 0.2, T_CORTINA + 0.8));
    const xg = lerp(428, XG, kS), xr = lerp(518, XR, kS);
    if (kS > 0 && kS < 1) { const a = andar(t * 14, 0.9); G.piernaI = R.piernaI = a.piernaI; G.piernaD = R.piernaD = a.piernaD; }
    let rI = [9, 157], gD = [70, 158], rD = [68, 157], gI = [9, 160];
    // los pies se mueven mientras esperan la tira
    if (t < T_CORTINA) { G.piernaD = [-Math.max(0, Math.sin(t * 10)) * 5, 0]; R.piernaI = [-Math.max(0, Math.sin(t * 10 + 2)) * 5, 0]; }
    // Rodrigo coge la tira
    if (t > T_COGE - 0.3 && t < T_GRANDE + 0.1) rI = mezcla([9, 157], aU(XR, PIES, ESC, [RANURA[0] + 2, RANURA[1] + 214]), eOut(tramo(t, T_COGE - 0.3, T_COGE)));
    // la tira en grande: se ríen y la señalan
    if (t > T_GRANDE) {
      const k = eOut(tramo(t, T_GRANDE, T_GRANDE + 0.3));
      gD = mezcla(gD, [112, 64 + Math.sin(t * 9) * 3], k); rI = mezcla(rI, [-36, 64 + Math.sin(t * 9 + 1) * 3], k);
      gI = mezcla(gI, [-16, 30], k); rD = mezcla(rD, [94, 30], k);
      G.cara = t > 9.0 ? "guino" : "risa"; R.cara = "risa"; G.rc = 0.08; R.rc = -0.08;
    } else if (t > T_CORTINA + 0.8) { G.cara = "sorpresa"; G.rc = 0.12; R.rc = -0.12; }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    const bote = t > T_GRANDE ? -Math.abs(Math.sin((t - T_GRANDE) * 8)) * 14 * (1 - tramo(t, 9.2, 9.5)) : 0;
    return [{ pose: G, m: matAv(xg, PIES + bote, ESC) }, { pose: R, m: matAv(xr, PIES + bote, ESC) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    DISP.forEach((td, i) => this.una("f" + i, t > td, () => {
      temblar(9, 0.2);
      this.fotos[i] = this.disparar(i);
    }));
    for (let i = 0; i < 4; i++) if (!this.fotos[i] && t > DISP[i]) this.fotos[i] = this.disparar(i);
    this.una("choque", t > 0.75, () => temblar(6, 0.15));
    if (t > T_BAJA && t < T_BAJA + 1.3 && Math.random() < 20 * dt) p.nueva(P.CHISPA, RANURA[0] + azar(-22, 22), RANURA[1], azar(-40, 40), azar(-60, 0), azar(0.15, 0.3), azar(4, 7));
    this.una("cortina", t > T_CORTINA, () => temblar(5, 0.15));
    this.una("grande", t > T_GRANDE + 0.35, () => {
      temblar(14, 0.4);
      p.nueva(P.DESTELLO, 512, 300, 0, 0, 0.4, 300);
      for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** La tira de fotos: (x, y) arriba en el centro, `largo` lo que se ve (0–1), escala `s`. */
  tira(g, x, y, s, largo, ang) {
    const fw = 44, m = 4, h = 4 * (fw + m) + m;
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
    g.beginPath(); g.rect(-fw / 2 - m - 2, 0, fw + 2 * m + 4, h * largo); g.clip();
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(-fw / 2 - m + 3, 3, fw + 2 * m, h);
    g.fillStyle = "#f4f0e6"; g.fillRect(-fw / 2 - m, 0, fw + 2 * m, h);
    for (let i = 0; i < 4; i++) {
      const f = this.fotos[i], yy = m + i * (fw + m);
      if (f) g.drawImage(f, -fw / 2, yy, fw, fw); else { g.fillStyle = "#222"; g.fillRect(-fw / 2, yy, fw, fw); }
    }
    g.restore();
  }
  dentro(g, t, a) {
    const e = this.posesDentro(t);
    g.save(); g.globalAlpha = a;
    this.vistaDentro(g, t, e);
    // marco de la cabina (la ventanilla de la cámara)
    g.fillStyle = "#0b0c10";
    {
      // marco con un hueco redondeado (rectR empieza ruta nueva: aquí se dibuja a mano)
      const x = 40, y = 26, w = W - 80, h = H - 52, r = 34;
      g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
      g.fill("evenodd");
    }
    g.strokeStyle = "#3a3f49"; g.lineWidth = 5; rectR(g, 40, 26, W - 80, H - 52, 34); g.stroke();
    // luces de la cuenta (tres puntos) y el contador de fotos
    let n = 0; for (let i = 0; i < 4; i++) if (t > DISP[i]) n = i + 1;
    const sig = DISP.find((d) => d > t);
    for (let i = 0; i < 3; i++) {
      const on = sig != null && t > sig - 0.6 + i * 0.2;
      g.fillStyle = on ? "#ff3b3b" : "#3a1414"; g.beginPath(); g.arc(472 + i * 40, 556, 9, 0, 6.283); g.fill();
    }
    txt(g, `${n}/4`, 80, 568, { tam: 22, peso: 800, color: "#fff", alin: "left", esp: 2 });
    g.restore();
  }
  cabina(g, t, a, aCab) {
    const { x0, x1, top } = CAB, e = this.posesFuera(t);
    g.save(); g.globalAlpha = a * aCab;
    g.fillStyle = "rgba(0,0,0,.5)"; g.beginPath(); g.ellipse((x0 + x1) / 2, PIES, (x1 - x0) * 0.62, 14, 0, 0, 6.283); g.fill();
    // cuerpo
    const gc = g.createLinearGradient(x0, 0, x1, 0);
    gc.addColorStop(0, "#c9cfd6"); gc.addColorStop(0.5, "#f2f4f6"); gc.addColorStop(1, "#aeb5bd");
    g.fillStyle = gc; rectR(g, x0, top, x1 - x0, PIES - top, 12); g.fill();
    // letrero
    g.fillStyle = "#1a1d22"; rectR(g, x0 + 16, top + 12, x1 - x0 - 32, 50, 10); g.fill();
    txt(g, "FOTOS", (x0 + x1) / 2, top + 51, { tam: 42, peso: 900, fam: FD, color: "#ffd0e6", glow: "#ff3d84", glowTam: 14, esp: 8 });
    // hueco con la luz de dentro
    const ox0 = x0 + 18, ox1 = x1 - 96, oy0 = top + 76, oy1 = PIES - 8;
    g.fillStyle = "#2a3d6a"; g.fillRect(ox0, oy0, ox1 - ox0, oy1 - oy0);
    g.restore();
    // los dos (detrás de la cortina, hasta que salen)
    g.save(); g.globalAlpha = a;
    if (t < T_CORTINA + 0.25) { g.beginPath(); g.rect(ox0, oy0, ox1 - ox0, PIES - oy0 + 30); g.clip(); }
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.restore();
    g.save(); g.globalAlpha = a * aCab;
    // cortina (se recoge a la izquierda)
    const kC = eInOut(tramo(t, T_CORTINA, T_CORTINA + 0.4));
    const cw = lerp(ox1 - ox0, 34, kC), cy1 = oy1 - 58;
    const gcort = g.createLinearGradient(ox0, 0, ox0 + cw, 0);
    gcort.addColorStop(0, "#7a0f22"); gcort.addColorStop(1, "#a8162f");
    g.fillStyle = gcort; g.fillRect(ox0, oy0, cw, cy1 - oy0);
    const nP = Math.max(2, Math.round(cw / 26));
    for (let i = 0; i < nP; i++) {
      const xx = ox0 + (i + 0.5) * (cw / nP);
      const gp = g.createLinearGradient(xx - cw / nP / 2, 0, xx + cw / nP / 2, 0);
      gp.addColorStop(0, "rgba(0,0,0,.28)"); gp.addColorStop(0.5, "rgba(255,180,190,.14)"); gp.addColorStop(1, "rgba(0,0,0,.28)");
      g.fillStyle = gp; g.fillRect(xx - cw / nP / 2, oy0, cw / nP, cy1 - oy0);
    }
    g.fillStyle = "#c9cfd6"; g.fillRect(ox0 - 6, oy0 - 6, ox1 - ox0 + 12, 8);
    // panel lateral: ranura y la tira que baja
    g.fillStyle = "#1a1d22"; rectR(g, RANURA[0] - 30, RANURA[1] - 5, 60, 10, 4); g.fill();
    txt(g, "TUS FOTOS", RANURA[0], RANURA[1] - 18, { tam: 13, peso: 800, color: "#3a3f49", esp: 1 });
    g.restore();
    if (t > T_BAJA && t < T_GRANDE) {
      const k = tramo(t, T_BAJA, T_BAJA + 1.3), z = t < T_BAJA + 1.3 ? azar(-0.6, 0.6) : 0;
      const sw = t > T_BAJA + 1.3 ? 0.06 * Math.sin((t - T_BAJA - 1.3) * 6) * Math.exp(-(t - T_BAJA - 1.3) * 1.5) : 0;
      g.save(); g.globalAlpha = a; this.tira(g, RANURA[0] + z, RANURA[1] + 2, 1.05, k, sw); g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz();
    fondo(g, "#000");
    if (t < T_FUERA) this.dentro(g, t, a);
    else {
      const aCab = 1 - 0.75 * tramo(t, T_GRANDE, T_GRANDE + 0.4);
      g.save(); g.globalAlpha = a; foco(g, 512, 512, PIES, 360, 0.75); g.restore();
      this.cabina(g, t, a, aCab);
      // la tira, en grande
      if (t >= T_GRANDE) {
        const k = eOut(tramo(t, T_GRANDE, T_GRANDE + 0.4));
        const x = lerp(RANURA[0] - 140, 512, k), y = lerp(RANURA[1] + 60, 40, k), s = lerp(1.05, 2.55, k);
        g.save(); g.globalAlpha = a; this.tira(g, x, y, s, 1, lerp(-0.2, -0.03, k) + 0.015 * Math.sin(t * 3)); g.restore();
      }
    }
    this.p.dibujar(g);
    // flash y ¡CLIC!
    DISP.forEach((td, i) => {
      const d = t - td;
      if (d < 0 || d > 0.7) return;
      if (d < 0.3) { g.fillStyle = `rgba(255,255,255,${0.9 * (1 - d / 0.3) * a})`; g.fillRect(-60, -60, W + 120, H + 120); }
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(512 + (i % 2 ? 40 : -40), 112); g.rotate(i % 2 ? 0.1 : -0.1); g.scale(k * (1 + i * 0.08), k * (1 + i * 0.08));
      txt(g, "¡CLIC!", 0, 0, { tam: 116, peso: 400, fam: FC, color: "#fffdf5", borde: "#1d3a8a", bordeAncho: 12, esp: 4, alfa: a * (1 - tramo(d, 0.5, 0.7)) });
      g.restore();
    });
    // BZZZ… la tira baja
    if (t > T_BAJA && t < T_BAJA + 1.3) {
      g.save(); g.translate(RANURA[0] + 96 + azar(-1, 1), RANURA[1] - 30); g.rotate(0.1);
      txt(g, "BZZZ…", 0, 0, { tam: 30, peso: 400, fam: FC, color: "#ffe0b0", borde: "#2a1200", bordeAncho: 6, esp: 2, alfa: a * (1 - tramo(t, T_BAJA + 1.1, T_BAJA + 1.3)) });
      g.restore();
    }
    // corte: un fogonazo entre dentro y fuera
    const dc = t - T_FUERA;
    if (dc > -0.12 && dc < 0.3) { g.fillStyle = `rgba(0,0,0,${(dc < 0 ? (dc + 0.12) / 0.12 : 1 - dc / 0.3) * a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00145", nombre: "Fotomatón", crear: () => new Fotomaton() });
})();
