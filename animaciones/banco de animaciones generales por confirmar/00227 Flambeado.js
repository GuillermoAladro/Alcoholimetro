"use strict";
/*
 * 00227 · FLAMBEADO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo, detrás de la barra, flambea una crepe: echa el licor en la sartén y ¡FUUUSH!, una llamarada de dibujos
 * sube hasta el techo. Marcos, de uniforme, salta por encima de la barra con el extintor y la apaga (¡PSSSHHH!). Cuando
 * se va la nube, Guillermo tiene la cara tiznada y el pelo de punta humeando; tose, parpadea… y presenta orgulloso su
 * crepe perfecta: ¡FLAMBÉ! Marcos se parte de risa. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 10.0, ESC = 1.7, BARRA = 492, AY = BARRA - 6 + (232 - 128) * ESC;
const XG = 380, XM = 785;
const T_VIERTE = 1.0, T_FUEGO = 1.75, T_SALTA = 2.35, T_ATERRIZA = 3.0, T_SPRAY = 3.15, T_APAGADO = 4.25;
const T_PARPADEA = 4.9, T_TOSE = 5.45, T_DEJA = 5.95, T_COGE = 6.35, T_TITULO = 6.65, T_APAGA = 9.4;
const PX = 548, PY = BARRA - 47;                     // centro de la sartén (borde de arriba)
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

// ------------------------------------------------------------------------------------------- objetos
function botella(g, x, y, w, h, c1, c2) {
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr;
  const hc = h * 0.62;
  rectR(g, x - w / 2, y - hc, w, hc, 3); g.fill();
  g.beginPath(); g.moveTo(x - w / 2 + 1, y - hc + 3); g.quadraticCurveTo(x - w * 0.2, y - hc - 5, x - w * 0.17, y - h + 5);
  g.lineTo(x + w * 0.17, y - h + 5); g.quadraticCurveTo(x + w * 0.2, y - hc - 5, x + w / 2 - 1, y - hc + 3); g.closePath(); g.fill();
  g.fillStyle = "#151515"; g.fillRect(x - w * 0.19, y - h, w * 0.38, 6);
  g.fillStyle = "rgba(255,248,225,.7)"; g.fillRect(x - w / 2 + 2, y - hc * 0.66, w - 4, hc * 0.32);
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(x - w * 0.3, y - hc + 4, 1.8, hc - 8);
}
/** Botella de licor (sin marca) cogida por el centro; la boca en (0, -24) (unidades de avatar). */
function licor(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.3, 1.3);
  const gr = g.createLinearGradient(-7, 0, 7, 0);
  gr.addColorStop(0, "#4a1c04"); gr.addColorStop(0.45, "#c8641a"); gr.addColorStop(1, "#3a1402");
  g.fillStyle = gr; rectR(g, -7, -8, 14, 24, 3); g.fill();
  g.beginPath(); g.moveTo(-6, -7); g.quadraticCurveTo(-3, -13, -2.6, -20); g.lineTo(2.6, -20); g.quadraticCurveTo(3, -13, 6, -7); g.closePath(); g.fill();
  g.fillStyle = "#1a1a1a"; g.fillRect(-2.8, -24, 5.6, 5);
  g.fillStyle = "#f4ead0"; g.fillRect(-6, -1, 12, 9);
  g.fillStyle = "#c8641a"; g.fillRect(-4, 2, 8, 1.4); g.fillRect(-4, 4.6, 6, 1.2);
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-4.6, -6, 1.4, 20);
  g.restore();
}
/** Extintor: (0, 0) = la mano en el asa; el cuerpo cuelga debajo (unidades de avatar). */
function extintor(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  const gr = g.createLinearGradient(-10, 0, 10, 0);
  gr.addColorStop(0, "#6a0806"); gr.addColorStop(0.35, "#f03a2a"); gr.addColorStop(0.55, "#ff8070"); gr.addColorStop(1, "#5a0604");
  g.fillStyle = gr; rectR(g, -10, 7, 20, 44, 8); g.fill();
  g.strokeStyle = "#3a0402"; g.lineWidth = 1; rectR(g, -10, 7, 20, 44, 8); g.stroke();
  g.fillStyle = "#f4f0e6"; rectR(g, -7, 20, 14, 15, 2); g.fill();
  g.fillStyle = "#e3262f"; g.beginPath(); g.moveTo(0, 22.5); g.quadraticCurveTo(-4.5, 28, -1.5, 32); g.quadraticCurveTo(0, 29, 1.5, 32); g.quadraticCurveTo(4.5, 28, 0, 22.5); g.fill();
  g.fillStyle = "#2a2a2a"; g.fillRect(-4.5, 1, 9, 7);
  g.fillStyle = "#b8c0c8"; rectR(g, -11, -3, 18, 4.4, 2); g.fill();
  g.fillStyle = "#e7c400"; g.beginPath(); g.arc(5, 4, 2, 0, 6.283); g.fill();
  g.restore();
}
/** Boquilla del extintor en la mano izquierda, apuntando `ang`. */
function boquilla(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  g.fillStyle = "#1c1c1c";
  g.beginPath(); g.moveTo(-6, -3); g.lineTo(14, -3.6); g.lineTo(24, -7); g.lineTo(24, 7); g.lineTo(14, 3.6); g.lineTo(-6, 3); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-4, -2.4, 17, 1.2);
  g.restore();
}
/** Hornillo en la barra con la sartén y la crepe (pantalla). `levanta` sube la sartén (la coge Guillermo). */
function hornillo(g, t, fuegoBajo, levanta) {
  const x = PX, y = BARRA - 2;
  // hornillo
  const gr = g.createLinearGradient(x - 40, 0, x + 40, 0);
  gr.addColorStop(0, "#22252a"); gr.addColorStop(0.5, "#5a6068"); gr.addColorStop(1, "#1c1e22");
  g.fillStyle = gr; rectR(g, x - 40, y - 24, 80, 24, 5); g.fill();
  g.fillStyle = "#101114"; rectR(g, x - 30, y - 30, 60, 7, 3); g.fill();
  g.fillStyle = "#e3262f"; g.beginPath(); g.arc(x + 26, y - 11, 5, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 36, y - 21, 50, 2);
  // llamita azul del hornillo
  if (fuegoBajo > 0) {
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = fuegoBajo;
    for (let i = -4; i <= 4; i++) {
      const h = 7 + 2 * Math.sin(t * 30 + i * 2);
      g.fillStyle = "rgba(80,150,255,.7)"; g.beginPath(); g.ellipse(x + i * 6, y - 31 - h / 2, 2.6, h / 2, 0, 0, 6.283); g.fill();
    }
    g.restore();
  }
  // sartén
  const dy = -levanta;
  g.save(); g.translate(0, dy);
  g.strokeStyle = "#2a1a10"; g.lineWidth = 8; g.lineCap = "round";
  g.beginPath(); g.moveTo(x - 52, PY + 8); g.lineTo(x - 112, PY + 4); g.stroke();
  g.strokeStyle = "#6a4a30"; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 60, PY + 6.5); g.lineTo(x - 108, PY + 3); g.stroke();
  const gs = g.createLinearGradient(0, PY, 0, PY + 20);
  gs.addColorStop(0, "#4a4e56"); gs.addColorStop(1, "#15171a");
  g.fillStyle = gs; g.beginPath(); g.moveTo(x - 58, PY); g.lineTo(x + 58, PY); g.lineTo(x + 46, PY + 18); g.lineTo(x - 46, PY + 18); g.closePath(); g.fill();
  g.fillStyle = "#1c1e22"; g.beginPath(); g.ellipse(x, PY, 58, 9, 0, 0, 6.283); g.fill();
  // crepe dorada doblada con rodajas de naranja
  const gc = g.createRadialGradient(x - 10, PY - 3, 2, x, PY, 48);
  gc.addColorStop(0, "#ffd77a"); gc.addColorStop(0.7, "#e09a34"); gc.addColorStop(1, "#a8601a");
  g.fillStyle = gc; g.beginPath(); g.ellipse(x, PY - 1, 44, 6.5, 0, 0, 6.283); g.fill();
  g.fillStyle = "#ff9a1a";
  for (const ox of [-18, 4, 24]) { g.beginPath(); g.ellipse(x + ox, PY - 3, 7, 2.6, 0, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(255,240,200,.6)"; g.beginPath(); g.ellipse(x - 14, PY - 3, 12, 1.4, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(255,255,255,.3)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, PY, 57, 8.5, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
  g.restore();
}
/** La llamarada de dibujos: capas que ondulan; `alto` en px desde la sartén. */
function llamarada(g, x, base, alto, t, a) {
  if (alto < 2 || a <= 0) return;
  g.save(); g.globalAlpha = a;
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = a * 0.55; g.drawImage(BLOB.naranja, x - alto * 0.55, base - alto * 0.95, alto * 1.1, alto * 1.1);
  g.globalCompositeOperation = "source-over"; g.globalAlpha = a;
  const capas = [["#e8321a", 1, 1, 0], ["#ff7a1a", 0.74, 0.9, 1.3], ["#ffc23a", 0.48, 0.74, 2.1], ["#fff4c4", 0.24, 0.5, 3.4]];
  const ancho = Math.min(150, 60 + alto * 0.22);
  for (const [col, wf, hf, f] of capas) {
    const H = alto * hf, N = 16, izq = [], der = [];
    for (let i = 0; i <= N; i++) {
      const h = i / N, y = base - h * H;
      const w = (ancho / 2) * wf * (0.62 + 0.55 * Math.sin(Math.PI * Math.min(1, h * 1.25))) * Math.pow(1 - h, 0.55);
      const off = Math.sin(h * 7 - t * 13 + f) * ancho * 0.09 * h;
      const lengua = Math.max(0, Math.sin(h * 11 + t * 17 + f * 2)) * ancho * 0.07 * wf;
      izq.push([x + off - w - lengua, y]); der.push([x + off + w + lengua * 0.8, y]);
    }
    g.fillStyle = col;
    g.beginPath(); g.moveTo(izq[0][0], izq[0][1]);
    for (const p of izq) g.lineTo(p[0], p[1]);
    g.lineTo(x + Math.sin(t * 9 + f) * 10, base - H - 18 * wf);
    for (let i = der.length - 1; i >= 0; i--) g.lineTo(der[i][0], der[i][1]);
    g.closePath(); g.fill();
  }
  // lenguas sueltas
  for (let i = 0; i < 5; i++) {
    const u = ((t * 1.7 + i * 0.37) % 1), y = base - alto * (0.3 + 0.7 * u), xx = x + Math.sin(i * 2.3 + t * 3) * ancho * 0.35;
    g.globalAlpha = a * (1 - u);
    g.fillStyle = i % 2 ? "#ffb02a" : "#ff6a1a";
    g.beginPath(); g.ellipse(xx, y, 8 * (1 - u) + 3, 16 * (1 - u) + 5, 0, 0, 6.283); g.fill();
  }
  g.restore();
}

class Flambeado extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(470);
    this.cF = null; this.cB = null;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Altura de la llamarada (px). */
  alto(t) {
    if (t < T_FUEGO) return 0;
    const sube = eOut(tramo(t, T_FUEGO, T_FUEGO + 0.28)) * 520;
    const baja = 1 - eIn(tramo(t, T_SPRAY + 0.1, T_APAGADO));
    return sube * baja * (1 + 0.05 * Math.sin(t * 23));
  }
  tizne(t) { return eOut(tramo(t, T_FUEGO + 0.08, T_FUEGO + 0.35)); }
  // ------------------------------------------------------------------ poses
  poses() {
    const t = this.t;
    // --- Guillermo
    const G = { cara: "guino", rc: 0.06, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let yG = AY, sG = 1;
    const mG0 = matAv(XG, AY, ESC), uG = (q) => enAv(mG0, q);
    let gD = [84, 92], gI = [4, 122], angB = 0, botellaEnMano = true;
    // enseña la botella y la vierte en la sartén
    const verter = [PX - 6, PY - 30];
    if (t > T_VIERTE - 0.3) {
      const k = eInOut(tramo(t, T_VIERTE - 0.3, T_VIERTE + 0.1));
      angB = 2.1 * k;
      const bocaB = rot2([0, -24 * 1.3], angB), dest = uG(verter);
      gD = mezcla([84, 92], [dest[0] - bocaB[0], dest[1] - bocaB[1]], k);
      G.cara = "sonrisa"; G.rc = 0.12;
    }
    if (t < T_FUEGO) { gD = [gD[0] + Math.sin(t * 5) * 1.5, gD[1]]; if (t < T_VIERTE - 0.3) gI = [10, 70 + 3 * Math.sin(t * 6)]; }
    // ¡FUUUSH!
    if (t >= T_FUEGO) {
      const k = eOut(tramo(t, T_FUEGO, T_FUEGO + 0.15));
      G.cara = "sorpresa"; G.puntas = k; G.rc = -0.1 * k;
      angB = lerp(2.1, 0.2, k);
      gD = mezcla(gD, [96, 34], k); gI = mezcla(gI, [-18, 34], k);
      yG = AY - 14 * Math.max(0, Math.sin(tramo(t, T_FUEGO, T_FUEGO + 0.3) * Math.PI));
      if (t > T_FUEGO + 0.3) { gD = [96 + 2 * Math.sin(t * 40), 34]; gI = [-18 - 2 * Math.sin(t * 40), 34]; }
    }
    // quieto, tiznado; parpadea, tose
    if (t >= T_APAGADO) {
      const k = eInOut(tramo(t, T_APAGADO, T_APAGADO + 0.5));
      gD = mezcla([96, 34], [86, 100], k); gI = mezcla([-18, 34], [4, 122], k); angB = lerp(0.2, 0, k);
      G.rc = 0; G.puntas = 1;
      G.cara = t < T_PARPADEA ? "sorpresa" : Math.floor((t - T_PARPADEA) * 6) % 3 === 1 ? "dormido" : "sorpresa";
    }
    if (t >= T_TOSE && t < T_DEJA) {
      const tos = Math.max(0, Math.sin((t - T_TOSE) * 14));
      sG = 1 - 0.03 * tos; G.rc = 0.06 * tos; G.cara = tos > 0.5 ? "dormido" : "sorpresa";
      const b = boca(0); gI = mezcla([4, 122], [b[0] - 10, b[1] + 8], eOut(tramo(t, T_TOSE, T_TOSE + 0.15)) * (1 - tramo(t, T_DEJA - 0.15, T_DEJA)));
    }
    // deja la botella en la barra y coge la sartén
    const sitioB = [470, BARRA - 2 - 16 * 1.3 * ESC];
    if (t >= T_DEJA - 0.25) {
      const k = eInOut(tramo(t, T_DEJA - 0.25, T_DEJA));
      gD = mezcla([86, 100], uG(sitioB), k);
      if (t > T_DEJA) botellaEnMano = false;
      G.cara = "sonrisa";
    }
    if (t >= T_DEJA + 0.05) {
      const k = eInOut(tramo(t, T_DEJA + 0.05, T_COGE)), sube = this.levanta(t);
      gD = mezcla(uG(sitioB), uG([PX - 108, PY + 4 - sube]), k);
      G.cara = t < T_TITULO ? "sonrisa" : (t > 8.4 && t < 8.7 ? "dormido" : "risa"); G.rc = 0.08;
      gI = mezcla([4, 122], [-14, 60], eBack(tramo(t, T_TITULO - 0.1, T_TITULO + 0.2)));
    }
    G.manoD = gD; G.manoI = gI;
    const kT = this.tizne(t), rcG = G.rc || 0;
    G.objD = (g, m) => {
      if (kT > 0) this.hollin(g, rcG, kT);
      if (botellaEnMano) licor(g, m[0], m[1], angB);
    };
    const mG = matAv(XG, yG, ESC, 0, 1, sG);

    // --- Marcos: salta por encima de la barra con el extintor
    const M = { quien: "bombero", cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let xM = 1200, yM = AY + 120, giro = 0, delante = true;
    if (t > T_SALTA) {
      const u = tramo(t, T_SALTA, T_ATERRIZA);
      xM = lerp(1170, XM, u); yM = lerp(AY + 190, AY, u) - 330 * 4 * u * (1 - u) * 0.85;
      giro = -0.35 * Math.sin(u * Math.PI); delante = u < 0.5;
      M.piernaI = [-22 * Math.sin(u * Math.PI), 0.25 * Math.sin(u * Math.PI)]; M.piernaD = [-26 * Math.sin(u * Math.PI), -0.2 * Math.sin(u * Math.PI)];
    }
    if (t >= T_ATERRIZA) { xM = XM; yM = AY + 10 * Math.max(0, Math.sin(tramo(t, T_ATERRIZA, T_ATERRIZA + 0.25) * Math.PI)); delante = false; giro = 0; }
    const mM = matAv(xM, yM, ESC, giro);
    const uM = (q) => enAv(mM, q);
    let mD = [74, 92], mI = [-6, 60], angN = Math.PI;
    if (t > T_SALTA && t < T_ATERRIZA) { mI = [-14, 30]; M.cara = "sorpresa"; }
    const objetivo = [PX - 4, BARRA - 200];
    if (t >= T_ATERRIZA) {
      const k = eOut(tramo(t, T_ATERRIZA, T_SPRAY));
      const mano = [695, 392], q = uM(mano), o = uM(objetivo);
      mI = mezcla([-14, 30], q, k); angN = Math.atan2(o[1] - q[1], o[0] - q[0]);
      M.cara = t < T_SPRAY ? "sorpresa" : "sonrisa"; M.rc = -0.08;
      if (t > T_SPRAY && t < T_APAGADO) { mI = [q[0] + Math.sin(t * 30) * 1.2, q[1] + Math.cos(t * 26) * 1.2]; M.cara = "guino"; }
    }
    // se ríe de Guillermo tiznado
    if (t >= T_APAGADO + 0.2) {
      const k = eInOut(tramo(t, T_APAGADO + 0.2, T_APAGADO + 0.6));
      const q = uM([695, 392]);
      mI = mezcla(q, [-4, 70], k); angN = lerp(angN, Math.PI * 0.6, k);
      M.cara = t < T_PARPADEA ? "sorpresa" : "risa"; M.rc = t < T_PARPADEA ? -0.12 : -0.06 + 0.05 * Math.sin(t * 16);
      if (t > T_TITULO) { mI = [-12, 34 + 4 * Math.sin(t * 14)]; M.rc = 0.07 * Math.sin(t * 12); }
    }
    M.manoD = mD; M.manoI = mI;
    const objI = mI, aN = angN;
    M.objI2 = (g, m) => boquilla(g, m, aN);
    M.objD = (g, m) => {
      // la manguera, del extintor a la boquilla
      g.strokeStyle = "#151515"; g.lineWidth = 3.2; g.lineCap = "round";
      g.beginPath(); g.moveTo(m[0] + 4, m[1] + 4); g.quadraticCurveTo((m[0] + objI[0]) / 2, Math.max(m[1], objI[1]) + 40, objI[0] - Math.cos(aN) * 5, objI[1] - Math.sin(aN) * 5); g.stroke();
      extintor(g, m, 0);
    };
    return { G, M, mG, mM, delante };
  }
  levanta(t) { return 18 * eInOut(tramo(t, T_COGE, T_COGE + 0.35)) + (t > T_TITULO ? 3 * Math.sin(t * 7) : 0); }
  /** Hollín en la cara de Guillermo (unidades de avatar, con la cabeza girada rc). Deja limpios los ojos. */
  hollin(g, rc, k) {
    const R = RIG;
    g.save();
    g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]);
    g.beginPath(); g.ellipse(39, 40, 27, 33, 0, 0, 6.283);
    for (const [x, y] of R.ojos) { g.moveTo(x + 7.5, y); g.ellipse(x, y, 7.5, 5.5, 0, 0, 6.283); }
    g.clip("evenodd");
    const gr = g.createRadialGradient(39, 44, 8, 39, 40, 36);
    gr.addColorStop(0, `rgba(30,30,33,${0.72 * k})`); gr.addColorStop(1, `rgba(10,10,12,${0.9 * k})`);
    g.fillStyle = gr; g.fillRect(0, 0, 80, 80);
    // churretes de ceniza (más claros) para que se vea que es hollín
    g.strokeStyle = `rgba(120,120,128,${0.4 * k})`; g.lineCap = "round"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(16, 50); g.quadraticCurveTo(22, 58, 29, 60); g.moveTo(62, 48); g.quadraticCurveTo(57, 57, 51, 60); g.moveTo(26, 20); g.quadraticCurveTo(39, 15, 52, 21); g.stroke();
    g.fillStyle = `rgba(140,140,148,${0.35 * k})`;
    for (const [x, y, r] of [[30, 54, 2], [48, 30, 1.6], [56, 62, 1.8], [22, 28, 1.4]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.restore();
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.poses();
    // gotas de licor al verter
    if (t > T_VIERTE + 0.05 && t < T_FUEGO && Math.random() < 30 * dt) p.nueva(P.GOTA, PX - 6 + azar(-3, 3), PY - 30, azar(-10, 10), azar(40, 120), azar(0.15, 0.25), azar(3, 4.5));
    this.una("fuego", t > T_FUEGO, () => {
      temblar(24, 0.6);
      p.nueva(P.DESTELLO, PX, PY - 60, 0, 0, 0.4, 320);
      for (let i = 0; i < 40; i++) p.nueva(P.CHISPA, PX + azar(-40, 40), PY - azar(0, 200), azar(-320, 320), azar(-520, -100), azar(0.4, 0.9), azar(6, 11));
      // bocanada de humo negro en la cara de Guillermo
      const c = aPant(e.mG, [39, 40]);
      for (let i = 0; i < 16; i++) p.nueva(P.HUMO, c[0] + azar(-50, 50), c[1] + azar(-50, 50), azar(-60, 60), azar(-80, 0), azar(0.6, 1.1), azar(50, 90));
    });
    // llamas que suben y chispas mientras arde
    const alto = this.alto(t);
    if (alto > 40) {
      const n = Math.round(110 * dt * (alto / 520) + Math.random());
      for (let i = 0; i < n; i++) p.nueva(P.LLAMA, PX + azar(-40, 40), PY - azar(0, alto * 0.7), azar(-40, 40), azar(-260, -120), azar(0.35, 0.7), azar(30, 60), Math.random() < 0.3 ? 1 : 0);
      if (Math.random() < 6 * dt) p.nueva(P.CHISPA, PX + azar(-60, 60), PY - azar(0, alto), azar(-120, 120), azar(-300, -100), azar(0.3, 0.6), azar(5, 8));
      if (alto > 470 && Math.random() < 10 * dt) p.nueva(P.HUMO, PX + azar(-200, 200), azar(-10, 30), azar(-120, 120), azar(-10, 30), azar(1, 1.6), azar(60, 100));
    }
    this.una("hop", t > T_ATERRIZA, () => { temblar(10, 0.25); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, XM + azar(-60, 60), BARRA - 8, azar(-100, 100), azar(-50, -10), azar(0.4, 0.7), azar(24, 40)); });
    // nube del extintor
    if (t > T_SPRAY && t < T_APAGADO + 0.15) {
      const mano = aPant(e.mM, e.M.manoI), d = Math.atan2(BARRA - 200 - mano[1], PX - 4 - mano[0]);
      const sx = mano[0] + Math.cos(d) * 40, sy = mano[1] + Math.sin(d) * 40;
      for (let i = 0; i < 4; i++) { const v = azar(380, 620), a = d + azar(-0.18, 0.18); p.nueva(P.VAPOR, sx, sy, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 0.9), azar(26, 50)); }
      if (Math.random() < 20 * dt) p.nueva(P.VAPOR, PX + azar(-90, 90), PY - azar(0, 260), azar(-160, 160), azar(-120, 40), azar(0.8, 1.4), azar(70, 120));
    }
    this.una("apagado", t > T_APAGADO, () => {
      temblar(8, 0.25);
      for (let i = 0; i < 14; i++) p.nueva(P.HUMO, PX + azar(-30, 30), PY - azar(0, 40), azar(-40, 40), azar(-140, -60), azar(1.2, 2), azar(40, 70));
    });
    // el pelo humea
    if (t > T_FUEGO + 0.4 && Math.random() < 9 * dt) {
      const c = aPant(e.mG, [39 + azar(-26, 26), azar(-14, 4)]);
      p.nueva(P.HUMO, c[0], c[1], azar(-15, 15), azar(-90, -50), azar(0.8, 1.3), azar(14, 26));
    }
    this.una("tos", t > T_TOSE + 0.12, () => {
      const b = aPant(e.mG, boca(0));
      for (let i = 0; i < 9; i++) p.nueva(P.HUMO, b[0] + 10, b[1], azar(30, 110), azar(-60, 10), azar(0.7, 1.2), azar(26, 44));
    });
    this.una("tit", t > T_TITULO, () => {
      temblar(16, 0.4);
      p.nueva(P.DESTELLO, PX, PY - 20, 0, 0, 0.35, 180);
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = (x) => (x > 0 && x < W ? BARRA - 4 : 1e9);
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ fondo y barra
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#140b07"); gr.addColorStop(0.6, "#25150b"); gr.addColorStop(1, "#160c06");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "rgba(0,0,0,.22)"; for (let x = -40; x < W + 60; x += 58) g.fillRect(x, -60, 3, H + 120);
    const r = semilla(23);
    const COL = [["#3a9a4a", "#174a20"], ["#b0521e", "#4a1a06"], ["#e0b840", "#7a5a10"], ["#4a7ac0", "#13305a"], ["#c02238", "#500810"], ["#ecebdc", "#8a8670"]];
    for (const y of [176, 268]) {
      for (let x = 22; x < W - 10; x += 24 + r() * 9) {
        if (r() < 0.12) continue;
        const [c1, c2] = COL[(r() * COL.length) | 0];
        botella(g, x, y, 13 + r() * 5, 40 + r() * 26, c1, c2);
      }
      g.fillStyle = "#6a3e1c"; g.fillRect(-60, y, W + 120, 9);
      g.fillStyle = "rgba(255,210,150,.3)"; g.fillRect(-60, y, W + 120, 2);
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, y + 9, W + 120, 7);
    }
    for (const x of [XG - 40, XM + 20]) {
      g.strokeStyle = "#0b0b0b"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 40); g.stroke();
      g.fillStyle = "#2a2e33"; g.beginPath(); g.moveTo(x - 32, 66); g.lineTo(x + 32, 66); g.lineTo(x + 12, 40); g.lineTo(x - 12, 40); g.closePath(); g.fill();
      g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(x, 66, 24, 5, 0, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = "lighter";
    for (const x of [XG - 40, XM + 20]) { g.globalAlpha = 0.42; g.drawImage(BLOB2.oro, x - 230, 20, 460, 440); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 240, W / 2, 300, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.75)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return (this.cF = c);
  }
  barra(g) {
    if (!this.cB) {
      const c = lienzoNuevo(W + 120, H - BARRA + 70), x = c.getContext("2d");
      x.translate(60, 0);
      const gr = x.createLinearGradient(0, 0, 0, c.height);
      gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#1c0f08");
      x.fillStyle = gr; x.fillRect(-60, 10, W + 120, c.height);
      x.fillStyle = "rgba(0,0,0,.35)"; for (let i = 30; i < W + 60; i += 96) x.fillRect(i, 26, 3, c.height);
      x.fillStyle = "#b8862d"; x.fillRect(-60, 104, W + 120, 8); x.fillStyle = "rgba(255,240,190,.55)"; x.fillRect(-60, 105, W + 120, 2);
      x.fillStyle = "#8a5426"; x.fillRect(-60, 0, W + 120, 18);
      x.fillStyle = "rgba(255,220,170,.45)"; x.fillRect(-60, 0, W + 120, 3);
      x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(-60, 18, W + 120, 5);
      this.cB = c;
    }
    g.drawImage(this.cB, -60, BARRA - 6);
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), alto = this.alto(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), -60, -60);
    // el techo se ilumina con la llamarada y queda chamuscado
    if (t > T_FUEGO) {
      const k = tramo(t, T_FUEGO + 0.15, T_FUEGO + 0.5);
      g.save(); g.globalAlpha = a * 0.75 * k;
      g.drawImage(BLOB.humo, PX - 190, -120, 380, 220);
      g.globalAlpha = a * 0.9 * k; g.drawImage(BLOB.humo, PX - 110, -80, 220, 140);
      g.restore();
    }
    foco(g, XG - 40, XG - 40, BARRA, 170, 0.45); foco(g, XM + 20, XM + 20, BARRA, 170, 0.45);
    if (alto > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.5 * Math.min(1, alto / 300);
      g.drawImage(BLOB.naranja, PX - 520, -200, 1040, 900);
      g.restore();
    }
    this.barra(g);
    g.save(); g.beginPath(); g.rect(-60, -60, W + 120, BARRA - 6 + 60); g.clip();
    pintarAvatar(g, e.mG, e.G, t);
    if (!e.delante) pintarAvatar(g, e.mM, e.M, t);
    g.restore();
    // la botella, ya en la barra
    if (t > T_DEJA) { g.save(); g.translate(470, BARRA - 2 - 16 * 1.3 * ESC); g.scale(ESC, ESC); licor(g, 0, 0, 0); g.restore(); }
    hornillo(g, t, t < T_APAGADO ? 1 : 1 - tramo(t, T_APAGADO, T_APAGADO + 0.3), this.levanta(t));
    // brillo de la crepe perfecta
    if (t > T_COGE + 0.3) brillo(g, PX + 30 + 6 * Math.sin(t * 2), PY - 20 - this.levanta(t), 26 * Math.abs(Math.sin(t * 3)), 1);
    llamarada(g, PX, PY - 2, alto, t, 1);
    // chorro blanco del extintor
    if (t > T_SPRAY && t < T_APAGADO + 0.1) {
      const mano = aPant(e.mM, e.M._manoI || e.M.manoI), d = Math.atan2(BARRA - 200 - mano[1], PX - 4 - mano[0]);
      const sx = mano[0] + Math.cos(d) * 40, sy = mano[1] + Math.sin(d) * 40, L = 190;
      const k = tramo(t, T_SPRAY, T_SPRAY + 0.12) * (1 - tramo(t, T_APAGADO - 0.1, T_APAGADO + 0.1));
      g.save(); g.globalAlpha = a * 0.85 * k; g.translate(sx, sy); g.rotate(d);
      const gs = g.createLinearGradient(0, 0, L, 0);
      gs.addColorStop(0, "rgba(255,255,255,.95)"); gs.addColorStop(1, "rgba(235,240,245,0)");
      g.fillStyle = gs; g.beginPath(); g.moveTo(0, -6); g.lineTo(L, -46); g.lineTo(L, 46); g.lineTo(0, 6); g.closePath(); g.fill();
      g.restore();
    }
    if (e.delante) pintarAvatar(g, e.mM, e.M, t);
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
    ono("GLUG, GLUG", 690, 330, T_VIERTE + 0.1, 0.6, 38, "#ffd34d", "#3a2400", 0.06);
    ono("¡FUUUSH!", 800, 170, T_FUEGO + 0.02, 0.95, 92, "#ffe08a", "#5a1000", -0.08);
    ono("¡HOP!", 900, 250, T_ATERRIZA - 0.05, 0.5, 60, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡PSSSHHH!", 620, 150, T_SPRAY + 0.1, 1.0, 76, "#ffffff", "#1b2a3a", -0.05);
    ono("COF, COF", 220, 300, T_TOSE + 0.1, 0.6, 40, "#d8d8d8", "#1b1b1b", -0.08);
    // ¡FLAMBÉ!
    if (t > T_TITULO) {
      const d = t - T_TITULO, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 120); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(760, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 175);
    gr.addColorStop(0, "#fff6b0"); gr.addColorStop(0.45, "#ffb21a"); gr.addColorStop(1, "#ff3d0a");
    txt(g, "¡FLAMBÉ!", 386, 178, { tam: 160, peso: 900, fam: FD, color: "#3a0800", esp: 6 });
    txt(g, "¡FLAMBÉ!", 380, 170, { tam: 160, peso: 900, fam: FD, color: gr, borde: "#5c0f00", bordeAncho: 13, esp: 6, glow: "rgba(255,120,20,.9)", glowTam: 30 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00227", nombre: "Flambeado", crear: () => new Flambeado() });
})();
