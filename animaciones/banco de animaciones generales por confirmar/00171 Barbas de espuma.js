"use strict";
/*
 * 00171 · BARBAS DE ESPUMA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Marcos levantan las jarras (¡SALUD!) y beben a la vez: les queda bigote de espuma y se ríen. Vuelven a
 * beber y la espuma crece en perilla, luego en barba hasta el pecho… En el último trago largo la barba de Guillermo
 * le llega a la cintura y la de Marcos baja hasta el suelo y se amontona a sus pies. Se miran, se parten de risa:
 * ¡QUÉ BARBAS!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.72;
const XG = 386, XM = 646;
const RG = avatar().rig, RM = avatar("marcos").rig;
// tragos: [inicio, fin]; la barba crece durante cada trago
const TRAGOS = [[1.0, 1.75], [2.95, 3.6], [4.2, 4.85], [5.35, 6.6]];
const NIVEL = [1, 0.75, 0.55, 0.35, 0];
const BARBA_G = [0, 0, 18, 58, 112], BARBA_M = [0, 0, 22, 64, 205];   // largo después de cada trago (0 = bigote)
const T_SALUD = 0.55, T_MIRAN = 6.85, T_RISA = 7.3, T_APAGA = 9.95, DUR = 10.55;

function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(960, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 50, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#fff6dc"); gr.addColorStop(1, "#f0d9a0");
  txt(g, "¡QUÉ BARBAS!", 486, 172, { tam: 136, peso: 400, fam: FB, color: "#5a2c00", esp: 3, max: 900 });
  txt(g, "¡QUÉ BARBAS!", 480, 166, { tam: 136, peso: 400, fam: FB, color: gr, borde: "#b86a00", bordeAncho: 10, esp: 3, glow: "rgba(255,200,90,.8)", glowTam: 22, max: 900 });
  // burbujas de espuma alrededor
  const r = semilla(4);
  for (let i = 0; i < 22; i++) {
    const x = 40 + r() * 880, y = r() < 0.5 ? 30 + r() * 30 : 180 + r() * 30, s = 8 + r() * 16;
    g.drawImage(SPR.espuma, x - s, y - s, s * 2, s * 2);
  }
  CT.set("tit", c);
  return c;
}
function fondoBar() {
  if (CT.has("fondo")) return CT.get("fondo");
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, 0, 0, 470);
  gr.addColorStop(0, "#1a100a"); gr.addColorStop(1, "#3a2414");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, 530);
  // friso de madera
  for (let y = 250; y < 470; y += 28) { g.fillStyle = y % 56 ? "rgba(0,0,0,.18)" : "rgba(255,200,140,.04)"; g.fillRect(-60, y, W + 120, 26); }
  g.fillStyle = "#5a3a20"; g.fillRect(-60, 244, W + 120, 8);
  // farolillos
  g.globalCompositeOperation = "lighter";
  for (const x of [140, 512, 884]) { g.globalAlpha = 0.5; g.drawImage(BLOB2.oro, x - 90, 30, 180, 180); g.globalAlpha = 0.9; g.drawImage(BLOB.amarillo, x - 18, 100, 36, 36); }
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  g.strokeStyle = "#111"; g.lineWidth = 2;
  for (const x of [140, 512, 884]) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 104); g.stroke(); }
  const gs = g.createLinearGradient(0, 470, 0, H + 60);
  gs.addColorStop(0, "#2e1c10"); gs.addColorStop(1, "#0e0805");
  g.fillStyle = gs; g.fillRect(-60, 470, W + 120, H - 410);
  CT.set("fondo", c);
  return c;
}

class Barbas extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** Cuánto ha bebido (índice de trago, 0–4, con decimales) */
  trago(t, extra = 0) {
    let n = 0;
    TRAGOS.forEach(([a, b], i) => { if (t > a) n = i + tramo(t, a, b + (i === 3 ? extra : 0)); });
    return n;
  }
  largo(t, tabla, extra) {
    const n = this.trago(t, extra), i = Math.floor(n), f = n - i;
    if (i >= 4) return tabla[4];
    return lerp(tabla[i], tabla[i + 1], eInOut(f));
  }
  /** Pose de cada uno: q = 0 Guillermo, 1 Marcos. */
  pose(t, q) {
    const R = q ? RM : RG, quien = q ? "marcos" : undefined;
    const P = { quien, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: q ? [6, 152] : [9, 160] };
    const reposo = q ? [70, 126] : [74, 130];
    let mano = reposo.slice(), inc = 0;
    // ¡SALUD!: levantan las jarras
    const kS = eBack(tramo(t, T_SALUD, T_SALUD + 0.25)) * (1 - eInOut(tramo(t, 0.9, 1.05)));
    mano = mezcla(mano, q ? [80, 66] : [84, 62], kS);
    if (kS > 0.1) P.cara = "risa";
    // los tragos
    for (let i = 0; i < 4; i++) {
      const [a, b] = TRAGOS[i], fin = b + (i === 3 && q ? 0.25 : 0);
      const kSube = eInOut(tramo(t, a - 0.2, a + 0.05)), kBaja = eInOut(tramo(t, fin, fin + 0.25));
      const k = kSube * (1 - kBaja);
      if (k <= 0) continue;
      const kT = tramo(t, a, fin), largo = i === 3;
      P.rc = lerp(0, largo ? -0.4 : -0.3, eInOut(Math.min(1, kT * 3))) * k + (kT > 0 && kT < 1 ? 0.02 * Math.sin(t * 40) : 0);
      const incB = lerp(-0.4, largo ? -2.0 : -1.6, eInOut(kT));
      const b0 = boca(P.rc, quien), rr = rot2(JARRA.borde, incB);
      mano = mezcla(mano, [b0[0] - rr[0], b0[1] - rr[1]], k);
      inc = lerp(inc, incB, k);
      if (kT > 0 && kT < 1) P.cara = "dormido";
    }
    P.jarra = { inc, nivel: this.nivelJarra(t, q) };
    P.manoD = mano;
    // entre tragos: se miran y reaccionan
    if (t > 1.85 && t < 2.9) {
      P.cara = t < 2.15 ? "sorpresa" : "risa"; P.rc = (q ? -1 : 1) * 0.12;
      // se señalan el bigote
      if (q) { P.brazoIDelante = true; P.manoI = mezcla(P.manoI, [-24, 76 + 4 * Math.sin(t * 12)], eOut(tramo(t, 2.1, 2.3)) * (1 - eInOut(tramo(t, 2.6, 2.85)))); }
      else { P.brazoIDelante = true; P.manoI = mezcla(P.manoI, [40, 70], eOut(tramo(t, 2.15, 2.35)) * (1 - eInOut(tramo(t, 2.6, 2.85)))); }
    }
    if (t > 3.8 && t < 4.15) { P.cara = "sorpresa"; P.rc = (q ? -1 : 1) * 0.06; }
    if (t > 3.95 && t < 4.15 && !q) { P.brazoIDelante = true; P.manoI = mezcla(P.manoI, [34, 78], eOut(tramo(t, 3.95, 4.05))); }
    if (t > 5.0 && t < 5.3) { P.cara = "guino"; P.rc = (q ? -1 : 1) * 0.1; }
    if (t > T_MIRAN && t < T_RISA) { P.cara = "sorpresa"; P.rc = (q ? -1 : 1) * 0.14; }
    if (t >= T_RISA) {
      const s = Math.sin((t - T_RISA) * 15 + q);
      P.cara = "risa"; P.rc = (q ? -1 : 1) * 0.08 + 0.06 * s;
      // se acarician la barba
      P.brazoIDelante = true;
      const y = q ? 100 + 40 * (0.5 + 0.5 * Math.sin((t - T_RISA) * 3)) : 96 + 26 * (0.5 + 0.5 * Math.sin((t - T_RISA) * 3 + 1));
      P.manoI = mezcla(P.manoI, [q ? 30 : 32, y], eOut(tramo(t, T_RISA + 0.3, T_RISA + 0.6)));
    }
    // la barba (objD: por delante de la cara y por detrás del brazo con la jarra)
    const L = this.largo(t, q ? BARBA_M : BARBA_G, q ? 0.25 : 0);
    const kB = tramo(t, TRAGOS[0][0] + 0.3, TRAGOS[0][1]);
    P.objD = (g) => this.barba(g, R, P.rc, L, kB, t, q);
    return P;
  }
  nivelJarra(t, q) {
    let n = 1;
    TRAGOS.forEach(([a, b], i) => { const fin = b + (i === 3 && q ? 0.25 : 0); if (t > a) n = lerp(NIVEL[i], NIVEL[i + 1], eInOut(tramo(t, a, fin))); });
    return n;
  }
  /** Bigote y barba de espuma en unidades del avatar. */
  barba(g, R, rc, L, kB, t, q) {
    if (kB <= 0) return;
    const rel = (p) => { const r = rot2([p[0] - R.cuello[0], p[1] - R.cuello[1]], rc); return [R.cuello[0] + r[0], R.cuello[1] + r[1]]; };
    const b = R.bocaPos, esp = SPR.espuma;
    const bola = (x, y, r) => g.drawImage(esp, x - r, y - r, r * 2, r * 2);
    // barba: cuelga de debajo del labio, con el borde abombado
    if (L > 0.5) {
      const top = rel([b[0], b[1] + 6]), suelo = 230, fin = top[1] + 8 + L;
      const largoVis = Math.min(fin, suelo) - top[1];
      const n = Math.max(2, Math.ceil(largoVis / 7)), izq = [], der = [];
      for (let i = 0; i <= n; i++) {
        const y = (largoVis * i) / n, u = y / Math.max(30, L + 8);
        let w = lerp(15, 7, Math.min(1, u)) * Math.min(1, 0.55 + y / 14);
        const cx = top[0] + Math.sin(y * 0.13 + t * 3 + q) * 2.6 * Math.min(1, y / 30);
        izq.push([cx - w, top[1] + y]); der.push([cx + w, top[1] + y]);
      }
      const gr = g.createLinearGradient(top[0] - 15, 0, top[0] + 15, 0);
      gr.addColorStop(0, "#e8dcc0"); gr.addColorStop(0.4, "#fffdf6"); gr.addColorStop(1, "#e2d4b4");
      g.beginPath(); g.moveTo(izq[0][0], izq[0][1]);
      for (let i = 1; i < izq.length; i++) { const a0 = izq[i - 1], a1 = izq[i]; g.quadraticCurveTo(Math.min(a0[0], a1[0]) - 4.5, (a0[1] + a1[1]) / 2, a1[0], a1[1]); }
      const ul = izq[izq.length - 1], ur = der[der.length - 1];
      g.quadraticCurveTo((ul[0] + ur[0]) / 2, ul[1] + 10, ur[0], ur[1]);
      for (let i = der.length - 2; i >= 0; i--) { const a0 = der[i + 1], a1 = der[i]; g.quadraticCurveTo(Math.max(a0[0], a1[0]) + 4.5, (a0[1] + a1[1]) / 2, a1[0], a1[1]); }
      g.closePath();
      g.fillStyle = gr; g.fill();
      g.strokeStyle = "rgba(170,140,90,.55)"; g.lineWidth = 0.9; g.stroke();
      // burbujas sueltas para la textura (siempre en el mismo sitio)
      const r = semilla(7 + q * 13);
      for (let i = 0; i <= n; i++) {
        const p = mezcla(izq[i], der[i], 0.2 + 0.6 * r()), s = 2.2 + r() * 2.6;
        bola(p[0], p[1], s);
      }
      // el sobrante se amontona en el suelo
      if (fin > suelo) {
        const ex = Math.min(1, (fin - suelo) / 40), cx = der[der.length - 1][0] - 7;
        g.fillStyle = gr; g.beginPath(); g.ellipse(cx, suelo + 1, 10 + 34 * ex, 4 + 7 * ex, 0, Math.PI, 0); g.fill();
        const r2 = semilla(31);
        for (let i = 0; i < 12; i++) { const x = cx + (r2() - 0.5) * 70 * ex, y = suelo - r2() * 8 * ex; bola(x, y, 3 + r2() * 4 * ex + 2); }
      }
    }
    // bigote
    const s = Math.min(1, kB * 1.5);
    for (let i = -3; i <= 3; i++) {
      const p = rel([b[0] + i * 4.6, b[1] - 4 + Math.abs(i) * 0.9]);
      bola(p[0], p[1], (4.2 - Math.abs(i) * 0.3) * s);
    }
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("salud", t > T_SALUD + 0.15, () => { temblar(5, 0.2); });
    // salpica espuma mientras bebe
    for (let i = 0; i < 4; i++) {
      const [a, b] = TRAGOS[i];
      if (t > a && t < b && Math.random() < 14 * dt) {
        for (const [x, q] of [[XG, 0], [XM, 1]]) {
          const m = matAv(x, PIES, ESC), bc = aPant(m, boca(-0.3, q ? "marcos" : undefined));
          p.nueva(P.ESPUMA, bc[0] + azar(-10, 10), bc[1] + azar(0, 12), azar(-80, 80), azar(-120, -20), azar(0.4, 0.7), azar(5, 9));
        }
      }
    }
    this.una("suelo", t > 6.25, () => { temblar(6, 0.25); for (let i = 0; i < 20; i++) p.nueva(P.ESPUMA, XM + azar(-30, 30), PIES - 10, azar(-200, 200), azar(-220, -60), azar(0.5, 0.9), azar(6, 11)); });
    this.una("risa", t > T_RISA, () => {
      temblar(12, 0.35);
      for (let i = 0; i < 24; i++) p.nueva(P.ESPUMA, azar(100, 924), azar(-40, 0), azar(-30, 30), azar(40, 160), azar(2, 3), azar(6, 12));
    });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  ono(g, s, x, y, t0, dur, tam, color, rot) {
    const d = this.t - t0;
    if (d < 0 || d > dur) return;
    const k = eBack(tramo(d, 0, 0.1));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color, borde: "#1a1a1a", bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
    g.restore();
  }
  dibujar(g) {
    // lo caro (textos con brillo, fondos) se prepara en el primer cuadro, que es negro
    if (!this._pre) { this._pre = true; titulo(); fondoBar(); }
    const t = this.t, a = this.luz();
    fondo(g, "#000");
    g.drawImage(fondoBar(), -60, -60);
    const PG = this.pose(t, 0), PM = this.pose(t, 1);
    const risa = t > T_RISA ? Math.abs(Math.sin((t - T_RISA) * 15)) * 5 : 0;
    const mG = matAv(XG, PIES - risa, ESC), mM = matAv(XM, PIES - risa * 0.8, ESC);
    g.fillStyle = "rgba(0,0,0,.45)";
    for (const x of [XG, XM]) { g.beginPath(); g.ellipse(x, PIES + 2, 58, 9, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, mG, PG, t);
    pintarAvatar(g, mM, PM, t);
    this.p.dibujar(g);
    // ¡SALUD! y los GLUP
    this.ono(g, "¡SALUD!", 516, 190, T_SALUD + 0.1, 0.5, 58, "#ffd34d", -0.06);
    TRAGOS.forEach(([a0, b0], i) => {
      const glup = i === 3 ? "¡GLUP, GLUP, GLUP!" : "GLUP";
      this.ono(g, glup, 516, 150 + (i % 2) * 20, a0 + 0.15, b0 - a0 - 0.1, i === 3 ? 50 : 42, "#fffdf5", i % 2 ? 0.06 : -0.06);
    });
    // ¡QUÉ BARBAS!
    if (t > T_RISA) {
      const d = t - T_RISA, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 94); g.rotate(-0.03); g.scale(s * 0.9, s * 0.9);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00171", nombre: "Barbas de espuma", crear: () => new Barbas() });
})();
