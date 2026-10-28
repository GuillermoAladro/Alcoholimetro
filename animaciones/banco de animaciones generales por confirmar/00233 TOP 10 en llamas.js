"use strict";
/*
 * 00233 · TOP 10 EN LLAMAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra el cartel del TOP 10 en llamas, como en la pantalla de espera. Guillermo lo mira encantado; Marcos, de
 * uniforme, llega corriendo con la manguera (¡FUEGO!) y lo riega: ¡PSSSS!, vapor… y el fuego ni se inmuta. Riega más
 * fuerte, nada. El cartel parpadea (BZZT): ¡son llamas de neón! Guillermo se parte de risa, Marcos se lleva la mano al
 * casco y acaban posando los dos delante del cartel: ¡QUE ARDA EL TOP 10! Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 10.4, ESC = 1.4, SC = 0.8, CY = 196;     // el cartel: escala y centro (alto)
const ENTRA = 0.42, T_MARCOS = 1.0, T_RIEGA = 1.85, T_FUERTE = 3.0, T_PARA = 3.85, T_BZZT = 4.05, T_NEON = 4.5;
const T_RIE = 4.65, T_POSAN = 5.75, T_TIT = 6.55, T_APAGA = 9.85;
const XG0 = 150, XM0 = 840, XG1 = 404, XM1 = 626;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** El cartel TOP 10 de la pantalla de espera (mismo dibujo) y de dónde salen sus llamas. */
function cartel() {
  if (CT.has("cartel")) return CT.get("cartel");
  const tam = 250, pad = 40;
  const med = lienzoNuevo(1, 1).getContext("2d");
  med.font = `900 ${tam}px ${FD}`;
  if ("letterSpacing" in med) med.letterSpacing = "6px";
  const mt = med.measureText("TOP 10");
  const asc = mt.actualBoundingBoxAscent || tam * 0.72;
  const c = lienzoNuevo(mt.width + pad * 2, asc + pad * 2), g = c.getContext("2d");
  g.font = `900 ${tam}px ${FD}`; g.textAlign = "left"; g.textBaseline = "alphabetic";
  if ("letterSpacing" in g) g.letterSpacing = "6px";
  const y = pad + asc;
  const gr = g.createLinearGradient(0, pad, 0, y);
  gr.addColorStop(0, "#fff6a8"); gr.addColorStop(0.45, "#ffb21a"); gr.addColorStop(1, "#ff3d0a");
  g.shadowColor = "rgba(255,120,20,.9)"; g.shadowBlur = 34;
  g.lineJoin = "round"; g.lineWidth = 12; g.strokeStyle = "#5c0f00"; g.strokeText("TOP 10", pad, y);
  g.shadowBlur = 0; g.shadowColor = "transparent";
  g.fillStyle = gr; g.fillText("TOP 10", pad, y);
  // emisores: el borde de arriba de cada letra (una sola lectura de píxeles, al crearlo)
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const emisores = [], cimas = [];
  for (let x = 0; x < c.width; x += 3) {
    let dentro = false, primera = true;
    for (let yy = 0; yy < c.height; yy++) {
      const a = d[(yy * c.width + x) * 4 + 3];
      if (!dentro && a > 200) { emisores.push([x - c.width / 2, yy - c.height / 2]); if (primera) { cimas.push([x - c.width / 2, yy - c.height / 2]); primera = false; } dentro = true; }
      else if (dentro && a < 60) dentro = false;
    }
  }
  const r = { c, ancho: c.width, alto: c.height, base: y - c.height / 2, emisores, cimas };
  CT.set("cartel", r);
  return r;
}
/** Llamas de neón: tubos con forma de llama sobre las letras (se pintan una vez). */
function neon() {
  if (CT.has("neon")) return CT.get("neon");
  const sp = cartel(), c = lienzoNuevo(sp.ancho, sp.alto + 120), g = c.getContext("2d");
  g.translate(sp.ancho / 2, sp.alto / 2 + 120);
  // una llama cada ~46 px, en la cima más alta de cada tramo
  const puntos = [];
  let tramoX = null, mejor = null;
  for (const p of sp.cimas) {
    const k = Math.floor((p[0] + sp.ancho / 2) / 46);
    if (k !== tramoX) { if (mejor) puntos.push(mejor); tramoX = k; mejor = p; } else if (p[1] < mejor[1]) mejor = p;
  }
  if (mejor) puntos.push(mejor);
  const cols = ["#ffde4a", "#ff8a1a", "#ff3d84"];
  puntos.forEach((p, i) => {
    const h = 54 + ((i * 37) % 30), w = 17 + ((i * 13) % 8), x = p[0], y = p[1] + 6;
    const col = cols[i % 3];
    g.save(); g.translate(x, y);
    const forma = () => {
      g.beginPath(); g.moveTo(-w, 0);
      g.bezierCurveTo(-w * 1.1, -h * 0.45, -w * 0.2, -h * 0.55, -w * 0.15, -h * 0.75);
      g.quadraticCurveTo(w * 0.1, -h * 0.55, w * 0.25, -h);
      g.bezierCurveTo(w * 0.9, -h * 0.6, w * 1.2, -h * 0.35, w, 0);
    };
    g.lineCap = "round"; g.lineJoin = "round";
    g.shadowColor = col; g.shadowBlur = 18; g.strokeStyle = col; g.lineWidth = 7; forma(); g.stroke();
    g.shadowBlur = 6; g.strokeStyle = "#fffbe8"; g.lineWidth = 2.6; forma(); g.stroke();
    g.restore();
  });
  // soportes de los tubos
  g.shadowBlur = 0;
  const r = { c, dy: 120 };
  CT.set("neon", r);
  return r;
}
/** Boquilla de la manguera (unidades de avatar), apuntando `ang`. */
function lanza(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  const gr = g.createLinearGradient(0, -5, 0, 5);
  gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.5, "#d8a020"); gr.addColorStop(1, "#7a5200");
  g.fillStyle = gr; g.beginPath(); g.moveTo(-8, -5.5); g.lineTo(14, -4); g.lineTo(26, -2.4); g.lineTo(26, 2.4); g.lineTo(14, 4); g.lineTo(-8, 5.5); g.closePath(); g.fill();
  g.fillStyle = "#1c1c1c"; g.fillRect(-12, -6.5, 6, 13); g.fillRect(8, -5, 3, 10);
  g.restore();
}

class Top10Llamas extends Escena {
  constructor() {
    super(DUR);
    this.fuego = new Particulas(260);
    this.p = new Parts(300);
    this.gotas = [];
    this.cx = -1000;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** ¿Está encendido el cartel? (parpadeo de neón) */
  encendido(t) {
    if (t < T_BZZT || t > T_NEON) return 1;
    const u = (t - T_BZZT) / (T_NEON - T_BZZT);
    return [1, 0.08, 1, 0.08, 0.08, 1, 0.08, 1][Math.floor(u * 8)] || 1;
  }
  /** Punto del cartel al que apunta el chorro. */
  objetivo(t) {
    const u = tramo(t, T_RIEGA, T_PARA);
    return [lerp(700, 380, u) + 40 * Math.sin(t * 5), CY - 10 + 30 * Math.sin(t * 3.3)];
  }
  // ------------------------------------------------------------------ poses
  poses() {
    const t = this.t;
    // --- Guillermo
    const G = { cara: "sorpresa", rc: 0.12, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let xg = XG0, yg = PIES, gD = [70, 158], gI = [9, 160];
    if (t > 0.9) { G.cara = "risa"; gD = [96, 30 + 4 * Math.sin(t * 9)]; gI = [-18, 30 + 4 * Math.sin(t * 9 + 1)]; }
    if (t > T_MARCOS + 0.4) { G.cara = "sorpresa"; G.rc = -0.12; gD = [84, 100]; gI = [-6, 100]; }
    if (t > T_FUERTE) { G.cara = Math.sin(t * 6) > 0 ? "sorpresa" : "guino"; G.rc = -0.05; }
    if (t > T_RIE) {
      // ¡son de neón! se parte de risa
      const s = Math.sin(t * 15);
      G.cara = "risa"; G.rc = 0.1 * s; gD = [52, 122 + 4 * s]; gI = [22, 124 - 4 * s];
      yg = PIES - Math.abs(Math.sin(t * 9)) * 10;
    }
    // posan delante del cartel
    if (t > T_POSAN) {
      const u = tramo(t, T_POSAN, T_POSAN + 0.6);
      xg = lerp(XG0, XG1, eInOut(u)); yg = PIES;
      if (u < 1) { const a = andar(t * 15, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
      G.cara = "risa"; G.rc = 0.06;
      gD = [84, 100]; gI = [-6, 100];
    }
    if (t > T_POSAN + 0.6) {
      const k = eBack(tramo(t, T_POSAN + 0.6, T_POSAN + 0.9));
      gI = mezcla([-6, 100], [-22, 14 + 3 * Math.sin(t * 7)], k);
      const mM = this.mM(t), mG = matAv(xg, yg, ESC);
      gD = mezcla([84, 100], enAv(mG, aPant(mM, [14, 92])), k);
      G.cara = t > 8.2 && t < 8.6 ? "guino" : "risa"; G.rc = 0.1;
    }
    G.manoD = gD; G.manoI = gI;
    // --- Marcos con la manguera
    const M = { quien: "bombero", cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const mM = this.mM(t), xm = this.xM(t);
    let mD = [74, 132], mI = [2, 120], angL = Math.PI * 0.8, conLanza = true;
    if (t > T_MARCOS && t < T_RIEGA - 0.3) { const a = andar(t * 18, 1.4); M.piernaI = a.piernaI; M.piernaD = a.piernaD; M.cara = "sorpresa"; }
    if (t >= T_RIEGA - 0.3 && t < T_PARA + 0.2) {
      const o = this.objetivo(t), mano = [xm - 64, 352 + (t > T_FUERTE ? 4 * Math.sin(t * 40) : 0)];
      const q = enAv(mM, mano), qo = enAv(mM, o);
      const k = eOut(tramo(t, T_RIEGA - 0.3, T_RIEGA));
      mI = mezcla([2, 120], q, k); mD = mezcla([74, 132], [q[0] + 30, q[1] + 26], k);
      angL = Math.atan2(qo[1] - q[1], qo[0] - q[0]);
      M.cara = t < T_FUERTE ? "guino" : "sorpresa"; M.rc = -0.1;
      if (t > T_FUERTE) M.puntas = 0.3;
    }
    if (t >= T_PARA + 0.2) {
      // se rasca el casco… ¿neón?
      const k = eInOut(tramo(t, T_PARA + 0.2, T_PARA + 0.5));
      mI = mezcla(mI, [-4, 128], k); mD = mezcla([74, 132], [64, 28 + 3 * Math.sin(t * 18)], k); angL = Math.PI * 0.55;
      M.cara = "sorpresa"; M.rc = -0.16;
      if (t > T_NEON) { M.cara = "sonrisa"; }
      if (t > T_RIE + 0.4) { conLanza = false; mD = [52, 120 + 4 * Math.sin(t * 15)]; mI = [22, 122 - 4 * Math.sin(t * 15)]; M.cara = "risa"; M.rc = 0.08 * Math.sin(t * 15); }
    }
    if (t > T_POSAN) {
      const u = tramo(t, T_POSAN, T_POSAN + 0.6);
      if (u < 1) { const a = andar(t * 15 + 1, 1); M.piernaI = a.piernaI; M.piernaD = a.piernaD; }
      mD = [74, 120]; mI = [-4, 100]; M.cara = "risa"; M.rc = -0.06;
    }
    if (t > T_POSAN + 0.6) {
      const k = eBack(tramo(t, T_POSAN + 0.6, T_POSAN + 0.9));
      mD = mezcla([74, 120], [88, 16 + 3 * Math.sin(t * 7 + 1)], k);
      const mG = matAv(xg, yg, ESC);
      mI = mezcla([-4, 100], enAv(mM, aPant(mG, [60, 92])), k);
      M.cara = t > 7.4 && t < 7.8 ? "guino" : "risa"; M.rc = -0.1;
    }
    M.manoD = mD; M.manoI = mI;
    if (conLanza) { const a = angL; M.objI2 = (g, m) => lanza(g, m, a); }
    return { G, mG: matAv(xg, yg, ESC), M, mM, conLanza };
  }
  xM(t) {
    let x = 1150;
    if (t > T_MARCOS) x = lerp(1150, XM0, eOut(tramo(t, T_MARCOS, T_RIEGA - 0.3)));
    if (t > T_POSAN) x = lerp(XM0, XM1, eInOut(tramo(t, T_POSAN, T_POSAN + 0.6)));
    return x;
  }
  mM(t) { const x = this.xM(t), u = tramo(t, T_POSAN, T_POSAN + 0.6), anda = (t > T_MARCOS && t < T_RIEGA - 0.3) || (u > 0 && u < 1); return matAv(x, PIES + (anda ? andar(t * 18, 1.4).bote : 0), ESC); }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), sp = cartel();
    this.cx = t < ENTRA ? lerp(-sp.ancho * SC / 2 - 160, W / 2, Math.pow(t / ENTRA, 1.25)) : W / 2;
    this.una("frena", t >= ENTRA, () => temblar(9, 0.25));
    // llamas del cartel
    const on = this.encendido(t) > 0.5;
    if (t > 0.12 && on) {
      const n = Math.round(300 * dt + Math.random() * 0.5), moviendo = t < ENTRA;
      for (let i = 0; i < n; i++) {
        const e = sp.emisores[(Math.random() * sp.emisores.length) | 0];
        this.fuego.nueva(this.cx + e[0] * SC + azar(-3, 3), CY + e[1] * SC + azar(2, 8), azar(-16, 16) - (moviendo ? 560 : 0), azar(-160, -80), azar(0.3, 0.62), azar(28, 50), 0);
      }
    }
    this.fuego.actualizar(dt);
    const p = this.p;
    // el chorro: vapor y salpicaduras donde da
    if (t > T_RIEGA && t < T_PARA) {
      const o = this.objetivo(t), fuerte = t > T_FUERTE ? 2 : 1;
      if (Math.random() < 18 * fuerte * dt) p.nueva(P.VAPOR, o[0] + azar(-20, 20), o[1] + azar(-20, 10), azar(-60, 60), azar(-120, -50), azar(0.7, 1.2), azar(40, 70));
      for (let i = 0; i < 2 * fuerte; i++) { const a = azar(-Math.PI, 0); this.gotas.push({ x: o[0], y: o[1], vx: Math.cos(a) * azar(80, 240), vy: Math.sin(a) * azar(60, 220), v: azar(0.4, 0.7), vm: 0.7, r: azar(2.5, 4.5) }); }
    }
    for (const d of this.gotas) { d.v -= dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("bzzt", t > T_BZZT, () => temblar(6, 0.15));
    this.una("neon", t > T_NEON, () => {
      for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(150, 360); p.nueva(P.ELECTRICA, 512 + azar(-200, 200), CY - 60 + azar(-30, 30), Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(10, 16)); }
    });
    this.una("tit", t > T_TIT, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 80; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujar
  dibujarCartel(g, t, a) {
    const sp = cartel(), on = this.encendido(t);
    g.save(); g.globalAlpha = a * (0.25 + 0.75 * on) * (0.92 + 0.08 * Math.sin(t * 23) * Math.sin(t * 7));
    let sx = 1, sy = 1, sesgo = 0;
    if (t < ENTRA) { sx = 1.55; sy = 0.82; sesgo = 0.5; }
    else { const u = t - ENTRA, am = Math.exp(-u * 8); sesgo = -0.55 * am * Math.cos(u * 26); sx = 1 - 0.22 * am * Math.cos(u * 26); sy = 1 + 0.16 * am * Math.cos(u * 26); }
    if (t < ENTRA) {
      for (let k = 3; k >= 1; k--) {
        g.save(); g.globalAlpha = a * 0.16 * (4 - k);
        g.translate(this.cx - k * 60, CY); g.transform(1, 0, sesgo, 1, 0, 0); g.scale(sx * 1.05 * SC, sy * SC);
        g.drawImage(sp.c, -sp.ancho / 2, -sp.alto / 2); g.restore();
      }
    }
    g.translate(this.cx, CY + sp.base * SC); g.transform(1, 0, sesgo, 1, 0, 0); g.scale(sx * SC, sy * SC);
    g.drawImage(sp.c, -sp.ancho / 2, -sp.alto / 2 - sp.base);
    g.restore();
    // los tubos de neón (se ven cuando parpadea y después)
    if (t > T_BZZT) {
      const ne = neon(), k = t < T_NEON ? (on > 0.5 ? 0.25 : 1) : 0.85 + 0.15 * Math.sin(t * 31) * Math.sin(t * 13);
      g.save(); g.globalAlpha = a * k;
      g.translate(this.cx, CY); g.scale(SC, SC);
      g.drawImage(ne.c, -sp.ancho / 2, -sp.alto / 2 - ne.dy);
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), on = this.encendido(t);
    fondo(g, "#000");
    // suelo y focos (con la luz de la escena)
    g.save(); g.globalAlpha = a;
    const gs = g.createLinearGradient(0, PIES - 40, 0, H);
    gs.addColorStop(0, "rgba(40,24,14,0)"); gs.addColorStop(1, "rgba(60,30,14,.9)");
    g.fillStyle = gs; g.fillRect(-60, PIES - 40, W + 120, H);
    g.globalAlpha = a * 0.3 * on;
    g.drawImage(BLOB.naranja, 512 - 400, CY - 210, 800, 480);
    g.restore();
    this.dibujarCartel(g, t, 1);
    if (on > 0.5) this.fuego.dibujar(g);
    g.save(); g.globalAlpha = a;
    for (const m of [e.mG, e.mM]) { const x = aPant(m, [39, 232])[0]; foco(g, x, x, PIES, 120, 0.3); }
    // la manguera: de la lanza al borde derecho
    if (e.conLanza && t > T_MARCOS) {
      const m = e.M._manoI ? aPant(e.mM, e.M._manoI) : aPant(e.mM, e.M.manoI), r = aPant(e.mM, e.M.manoD);
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      for (const [w, c] of [[13, "#5a0c08"], [9, "#d8261c"]]) {
        g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(m[0] + 6, m[1] + 4); g.quadraticCurveTo(r[0], r[1] + 40, r[0] + 40, PIES - 6); g.lineTo(W + 80, PIES - 4); g.stroke();
      }
      g.restore();
    } else if (t > T_RIE + 0.4) {
      // tirada en el suelo
      g.save(); g.lineCap = "round";
      for (const [w, c] of [[13, "#5a0c08"], [9, "#d8261c"]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(760, PIES - 6); g.quadraticCurveTo(880, PIES - 30, W + 80, PIES - 4); g.stroke(); }
      g.restore();
      g.save(); g.translate(752, PIES - 8); g.scale(ESC, ESC); lanza(g, [0, 0], Math.PI * 0.96); g.restore();
    }
    for (const x of [[e.mM, 1], [e.mG, 1]]) { const c = aPant(x[0], [39, 232]); g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(c[0], PIES + 2, 56, 9, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // el chorro de agua
    if (t > T_RIEGA && t < T_PARA) {
      const m = aPant(e.mM, e.M._manoI || e.M.manoI), o = this.objetivo(t), k = tramo(t, T_RIEGA, T_RIEGA + 0.15);
      const ang = Math.atan2(o[1] - m[1], o[0] - m[0]), s = [m[0] + Math.cos(ang) * 38, m[1] + Math.sin(ang) * 38];
      const fin = mezcla(s, o, k), ctl = [(s[0] + fin[0]) / 2, Math.min(s[1], fin[1]) - 60];
      const grosor = t > T_FUERTE ? 15 : 9;
      g.save(); g.lineCap = "round";
      g.strokeStyle = "rgba(90,170,255,.55)"; g.lineWidth = grosor + 6; g.beginPath(); g.moveTo(s[0], s[1]); g.quadraticCurveTo(ctl[0], ctl[1], fin[0], fin[1]); g.stroke();
      g.strokeStyle = "rgba(200,235,255,.95)"; g.lineWidth = grosor; g.stroke();
      g.strokeStyle = "#ffffff"; g.lineWidth = grosor * 0.35; g.stroke();
      g.restore();
    }
    g.fillStyle = "#a8e2ff";
    for (const d of this.gotas) { g.globalAlpha = a * Math.min(1, (d.v / d.vm) * 2); g.beginPath(); g.ellipse(d.x, d.y, d.r * 0.7, d.r, 0, 0, 6.283); g.fill(); }
    g.restore();
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    if (t > T_MARCOS + 0.2 && t < T_RIEGA) {
      const k = tramo(t, T_MARCOS + 0.2, T_MARCOS + 0.4) * (1 - tramo(t, T_RIEGA - 0.2, T_RIEGA));
      const b = aPant(e.mM, [60, 20]);
      bocadillo(g, 880, 360, "¡FUEGO!", b[0], b[1] - 6, k * a, 44);
    }
    ono("¡PSSSS!", 560, 330, T_RIEGA + 0.15, 1.0, 58, "#bfeaff", "#06303a", -0.06);
    ono("¡MÁS PRESIÓN!", 700, 400, T_FUERTE, 0.8, 40, "#fffdf5", "#1b1b1b", 0.05);
    ono("BZZT", 300, 60, T_BZZT, 0.45, 50, "#2fe3e8", "#06303a", -0.1);
    ono("BZZT", 740, 70, T_BZZT + 0.2, 0.4, 44, "#2fe3e8", "#06303a", 0.1);
    if (t > T_RIE && t < T_POSAN + 0.4) {
      const k = tramo(t, T_RIE, T_RIE + 0.2) * (1 - tramo(t, T_POSAN + 0.2, T_POSAN + 0.4));
      const b = aPant(e.mG, [54, 58]);
      bocadillo(g, 350, 300, "¡SON DE NEÓN!", b[0], b[1], k * a, 40);
    }
    // ¡QUE ARDA EL TOP 10!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      const gb = g.createLinearGradient(0, 450, 0, 600);
      gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(0.4, "rgba(0,0,0,.7)"); gb.addColorStop(1, "rgba(0,0,0,.85)");
      g.fillStyle = gb; g.fillRect(-60, 440, W + 120, 220);
      g.translate(512, 530); g.rotate(-0.02); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 130);
    gr.addColorStop(0, "#fff6a8"); gr.addColorStop(0.45, "#ffb21a"); gr.addColorStop(1, "#ff3d0a");
    txt(g, "¡QUE ARDA EL TOP 10!", 500, 120, { tam: 104, peso: 900, fam: FD, color: gr, borde: "#5c0f00", bordeAncho: 11, esp: 4, glow: "rgba(255,120,20,.9)", glowTam: 26, max: 950 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00233", nombre: "TOP 10 en llamas", crear: () => new Top10Llamas() });
})();
