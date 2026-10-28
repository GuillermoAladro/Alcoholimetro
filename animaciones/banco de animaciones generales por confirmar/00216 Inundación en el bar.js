"use strict";
/*
 * 00216 · INUNDACIÓN EN EL BAR
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el bar, la tubería de la pared tiembla y revienta (¡CRAC!). El agua sube y sube: ¡ACHICA! Guillermo se bebe de un
 * trago su caña y los dos achican con jarras a toda prisa, sin conseguir nada. Guillermo acaba flotando en una
 * bandeja; Marcos va vadeando hasta la llave de paso y la cierra (¡ÑIC, ÑIC!, ¡CLIC!). El agua se va por el sumidero
 * (¡GLU, GLU!), Guillermo aterriza sentado en su bandeja… y de su jarra salta un pececillo: ¡BLUB!
 */
(() => {
const ESC = 1.35;
const XG = 330, XM0 = 690, XM_LLAVE = 832;
const TUBO_Y = 206, ROTURA = [560, TUBO_Y], LLAVE = [904, 330];
const T_TIEMBLA = 0.6, T_CRAC = 1.1, T_TRAGO = 1.75, T_ACHICA = 2.35, T_BANDEJA = 3.9, T_VE = 4.7, T_VADEA = 4.95, T_GIRA = 5.95;
const T_CLIC = 6.75, T_BAJA = 6.9, T_SUELO = 8.15, T_PEZ = 8.55, T_FIN = 9.95, DUR = 10.45;
const NIVEL_MAX = 418;
const ESTANTE = [742, 344], JARRAS = [752, 800];     // estantito con jarras vacías (asas)
const CT = cacheTexto();
const aU = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Jarra de cristal con agua (como dibujarJarra, pero azul y sin espuma). Coordenadas de la mano; asa en (0, 0). */
function jarraAgua(g, mano, inc, nivel, parte, t) {
  const J = { x0: 3, x1: 31, y0: -18, y1: 18 };
  g.save(); g.translate(mano[0], mano[1]); g.rotate(inc);
  if (parte === "asa") {
    g.strokeStyle = "rgba(225,240,255,.85)"; g.lineWidth = 3.2;
    g.beginPath(); g.moveTo(J.x0 + 1, -10); g.bezierCurveTo(-7, -11, -7, 11, J.x0 + 1, 10); g.stroke();
    g.restore(); return;
  }
  const w = J.x1 - J.x0, h = J.y1 - J.y0;
  rectR(g, J.x0, J.y0, w, h, 3.5); g.fillStyle = "rgba(200,225,255,.18)"; g.fill();
  const alto = (h - 4) * clamp(nivel, 0, 1);
  if (alto > 0.5) {
    g.save(); rectR(g, J.x0, J.y0, w, h, 3.5); g.clip();
    const gr = g.createLinearGradient(0, J.y1, 0, J.y1 - alto); gr.addColorStop(0, "#2f7fd6"); gr.addColorStop(1, "#9ad8ff");
    g.fillStyle = gr; g.fillRect(J.x0, J.y1 - 2 - alto, w, alto + 2);
    g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(J.x0, J.y1 - 3 - alto, w, 1.6);
    g.restore();
  }
  rectR(g, J.x0, J.y0, w, h, 3.5); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.6; g.stroke();
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(J.x0 + 3, J.y0 + 3, 2.2, h - 6);
  g.restore();
}
/** Cambia el atajo `jarra` de la pose por la jarra con agua. */
function conAgua(P_, t) {
  if (!P_.jarra) return;
  const j = P_.jarra; delete P_.jarra; P_.jarraInc = j.inc;
  P_.objD = (g, mano) => jarraAgua(g, mano, j.inc, j.nivel, "asa", t);
  P_.objD2 = (g, mano) => jarraAgua(g, mano, j.inc, j.nivel, "cuerpo", t);
}
function pez(g, x, y, s, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.fillStyle = "#ff8a1f";
  g.beginPath(); g.moveTo(12, 0); g.lineTo(22, -8 + 2 * Math.sin(t * 30)); g.lineTo(22, 8 + 2 * Math.sin(t * 30)); g.closePath(); g.fill();
  const gr = g.createLinearGradient(0, -8, 0, 8); gr.addColorStop(0, "#ffc04a"); gr.addColorStop(1, "#ff6a10");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 14, 9, 0, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(-7, -2, 3, 0, 6.283); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(-7.5, -2, 1.5, 0, 6.283); g.fill();
  g.strokeStyle = "#c04a00"; g.lineWidth = 1.2; g.beginPath(); g.arc(-12, 2, 2.5, -0.5, 1); g.stroke();
  g.restore();
}

class Inundacion extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(200);
    this.p.suelo = () => PIES + 4;
    this.gotas = [];
  }
  /** Altura de la superficie del agua (pantalla). */
  nivel(t) {
    if (t < T_CRAC + 0.2) return PIES + 12;
    if (t < T_BAJA) return lerp(PIES + 12, NIVEL_MAX, Math.pow(tramo(t, T_CRAC + 0.2, T_CLIC), 0.8));
    return lerp(NIVEL_MAX, PIES + 12, eInOut(tramo(t, T_BAJA, T_SUELO)));
  }
  chorro(t) { return t > T_CRAC && t < T_CLIC ? (t > T_GIRA ? 1 - 0.85 * tramo(t, T_GIRA, T_CLIC) : 1) : 0; }
  /** Fase del achique (0–1) y si está tirando el agua. */
  achique(t, desfase) {
    const per = 0.62, u = (((t - T_ACHICA + desfase) / per) % 1 + 1) % 1;
    return { u, tira: u > 0.5 };
  }
  /** Pose de achicar con la mano derecha (unidades del avatar). `agua` = altura del agua en sus unidades. */
  brazoAchica(P_, t, desfase, agua, quien) {
    const { u } = this.achique(t, desfase);
    const R = avatar(quien).rig, abajo = [R.manoD[0] + 10, clamp(agua + 6, 120, 170)], arriba = [R.hombroD[0] - 2, R.hombroD[1] - 66];
    let k;
    if (u < 0.5) k = 1 - eInOut(u / 0.5); else k = eOut((u - 0.5) / 0.5);
    P_.manoD = mezcla(abajo, arriba, k);
    P_.jarra = { inc: lerp(1.3, -2.4, k), nivel: u < 0.5 ? 0.15 + 0.6 * eInOut(u / 0.5) : 0.75 * (1 - eOut((u - 0.5) / 0.35)) };
    P_.manoI = [R.manoI[0] - 14, R.manoI[1] - 30 - 10 * Math.sin(u * 6.283)];
  }
  /** Pies de Guillermo: en el suelo, en la bandeja flotando o ya sentado. */
  bandeja(t) {
    const n = this.nivel(t);
    if (t < T_BANDEJA - 1.0) return null;
    const flota = Math.min(PIES, n - 4) + 3 * Math.sin(t * 4);
    if (t < T_BANDEJA) return { x: lerp(-140, XG + 40, eOut(tramo(t, T_BANDEJA - 1.0, T_BANDEJA - 0.25))), y: flota, giro: 0.06 * Math.sin(t * 3.3), llega: true };
    const x = XG + 40 - 50 * Math.sin((t - T_BANDEJA) * 0.9) * (t < T_BAJA ? 1 : 1 - tramo(t, T_BAJA, T_SUELO));
    return { x, y: t > T_SUELO ? PIES - 4 : flota, giro: 0.06 * Math.sin(t * 3.3) * (t < T_SUELO ? 1 : 0) };
  }
  poses() {
    const t = this.t, n = this.nivel(t);
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [76, 118], manoI: [9, 160], jarra: { inc: -0.1, nivel: 0.8 } };
    const M = { quien: "bombero", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let mG, mM, xm = XM0, ym = PIES;
    // ---------------- Marcos
    const aguaEn = (m) => aU(m, [0, n])[1];
    if (t < T_CRAC) {
      M.cara = t < T_TIEMBLA ? "risa" : "sorpresa"; M.rc = t < T_TIEMBLA ? -0.1 : -0.18;
    } else if (t < T_ACHICA) {
      M.cara = "sorpresa"; M.puntas = 0.7 * (1 - tramo(t, T_CRAC + 0.5, T_ACHICA)); M.rc = -0.15;
      M.manoD = [92, 70]; M.manoI = [-18, 72];
      if (t > T_CRAC + 0.3) {
        // coge una jarra vacía del estante
        const m0 = matAv(XM0, PIES, ESC), k = eInOut(tramo(t, T_CRAC + 0.3, T_TRAGO - 0.05)), k2 = eInOut(tramo(t, T_TRAGO, T_TRAGO + 0.3));
        M.manoD = mezcla(mezcla([67, 152], aU(m0, [JARRAS[0], ESTANTE[1] - 24]), k), [80, 120], k2); M.manoI = [6, 152];
        M.cara = t < T_TRAGO ? "sorpresa" : "guino"; M.rc = t < T_TRAGO ? 0.12 : 0;
        if (t > T_TRAGO - 0.05) M.jarra = { inc: 0, nivel: 0 };
      }
    } else if (t < T_VE) {
      const m0 = matAv(XM0, PIES, ESC);
      this.brazoAchica(M, t, 0.31, aguaEn(m0), "bombero");
      M.cara = Math.floor(t * 3) % 2 ? "sorpresa" : "dormido"; M.rc = 0.06 * Math.sin(t * 10);
    } else if (t < T_GIRA) {
      // ve la llave de paso y va vadeando
      const u = tramo(t, T_VADEA, T_GIRA - 0.15);
      xm = lerp(XM0, XM_LLAVE, eInOut(u));
      if (u > 0 && u < 1) { const a = andar((t - T_VADEA) * 7, 1.4); M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * 0.5; }
      M.cara = t < T_VADEA ? "sorpresa" : "guino"; M.rc = 0.15;
      M.manoD = [96, 80]; M.manoI = [-12, 96]; M.jarra = { inc: 0.3, nivel: 0.3 };
    } else {
      xm = XM_LLAVE;
      const m0 = matAv(xm, PIES, ESC);
      if (t < T_CLIC + 0.2) {
        // gira la rueda con las dos manos
        const a = (t - T_GIRA) * 9, c = aU(m0, LLAVE);
        M.manoD = [c[0] + Math.cos(a) * 9, c[1] + Math.sin(a) * 9]; M.manoI = [c[0] - 12 + Math.cos(a + 3) * 6, c[1] + 4 + Math.sin(a + 3) * 6]; M.brazoIDelante = true;
        M.cara = Math.sin(t * 9) > 0 ? "dormido" : "guino"; M.rc = 0.12; M.piernaI = [0, 0.1]; M.piernaD = [0, -0.1];
      } else {
        M.cara = t < T_PEZ + 0.4 ? "risa" : (Math.floor(t * 3) % 3 ? "risa" : "guino"); M.rc = -0.14;
        // se seca la frente… y se parte de risa con el pez
        if (t < T_PEZ) { const k = eOut(tramo(t, T_CLIC + 0.2, T_CLIC + 0.45)); M.manoD = mezcla([67, 152], [58, 30], k); M.cara = "sonrisa"; }
        else { M.brazoIDelante = true; const s = Math.sin(t * 16); M.manoD = [48 + 4 * s, 116]; M.manoI = [26 - 4 * s, 116]; ym = PIES - 3 * Math.abs(s); }
      }
    }
    mM = matAv(xm, ym, ESC);
    // ---------------- Guillermo
    const B = this.bandeja(t);
    let piv = [39, 232], sy = 1, gx = XG, gy = PIES, giro = 0;
    const salta = t > T_BANDEJA - 0.3 && t < T_BANDEJA;
    if (B && salta) {
      const u = tramo(t, T_BANDEJA - 0.3, T_BANDEJA);
      gx = lerp(XG, B.x, u); gy = lerp(PIES, B.y - 6, u) - 70 * Math.sin(Math.PI * u);
    } else if (B && !B.llega) { gx = B.x; gy = B.y - 6; giro = B.giro; }
    if (t < T_CRAC) {
      G.cara = t < T_TIEMBLA ? "risa" : "sorpresa"; G.rc = t < T_TIEMBLA ? 0.1 : 0.18;
    } else if (t < T_TRAGO) {
      G.cara = "sorpresa"; G.puntas = 0.8; G.rc = 0.16; G.manoI = [-18, 72];
    } else if (t < T_ACHICA) {
      // ¡se bebe la caña de un trago!
      const k = eInOut(tramo(t, T_TRAGO, T_TRAGO + 0.15)), rc = -0.35 * k;
      const b = boca(rc), tope = rot2([1.5, -13], -1.75);
      G.rc = rc; G.manoD = mezcla([76, 118], [b[0] - tope[0] + 2, b[1] - tope[1] + 1], k);
      G.jarra = { inc: lerp(-0.1, -1.75, k), nivel: lerp(0.8, 0, tramo(t, T_TRAGO + 0.15, T_ACHICA - 0.12)) };
      G.cara = "dormido"; G.manoI = [9, 160];
      if (t > T_ACHICA - 0.1) { G.cara = "guino"; }
    } else {
      const m0 = matAv(gx, gy, ESC);
      this.brazoAchica(G, t, 0, B && (salta || !B.llega) ? 300 : aguaEn(m0), "guillermo");
      G.cara = Math.floor(t * 3) % 2 ? "sorpresa" : "risa"; G.rc = 0.06 * Math.sin(t * 11);
      if (B && B.llega && !salta) { G.cara = "sorpresa"; G.rc = -0.18; }
      if (salta) { G.cara = "risa"; G.piernaI = [-14, 0.15]; G.piernaD = [-14, -0.15]; }
      if (B && !B.llega && t < T_BANDEJA + 0.5) { G.cara = "sorpresa"; G.piernaD = [-12 * Math.sin(Math.PI * tramo(t, T_BANDEJA, T_BANDEJA + 0.5)), 0]; }
      if (t > T_CLIC) {
        // deja de achicar
        G.jarra = { inc: -0.1, nivel: 0.2 }; G.manoD = [86, 112]; G.manoI = [-14, 120];
        G.cara = t < T_SUELO ? "sonrisa" : "risa";
      }
      if (t > T_SUELO) {
        // sentado en su bandeja
        const d = t - T_SUELO; sy = 0.94 - 0.08 * Math.exp(-d * 7) * Math.cos(d * 28);
        G.piernaI = [-26, 0.45]; G.piernaD = [-26, -0.45]; piv = [39, 195]; gy = PIES - 2;
        G.cara = d < 0.3 ? "sorpresa" : "sonrisa";
        G.manoD = [80, 118]; G.jarra = { inc: -0.1, nivel: 0.5 };
        if (t > T_PEZ) { G.cara = t < T_PEZ + 0.5 ? "sorpresa" : "guino"; G.rc = t < T_PEZ + 0.5 ? 0.12 : 0.05; G.puntas = t < T_PEZ + 0.5 ? 0.6 : 0; }
      }
    }
    mG = matAv(gx, gy, ESC, giro, 1, sy, piv);
    if (t > T_ACHICA - 0.05) conAgua(G, t);
    conAgua(M, t);
    return { G, M, mG, mM, B, gEncima: !!B && (salta || !B.llega), cogida: t > T_TRAGO - 0.05 };
  }
  /** Boca de la jarra (pantalla) de un avatar con pose `P_` y matriz m. */
  bocaJarra(m, P_) {
    const mano = P_._manoD || P_.manoD, b = rot2([31, -18], P_.jarra ? P_.jarra.inc : P_.jarraInc || 0);
    return aPant(m, [mano[0] + b[0], mano[1] + b[1]]);
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tiembla", t > T_TIEMBLA, () => temblar(5, 0.4));
    this.una("crac", t > T_CRAC, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 10; i++) p.nueva(P.CHISPA, ROTURA[0], ROTURA[1], azar(-200, 200), azar(-300, -40), azar(0.3, 0.6), azar(5, 8));
    });
    const n = this.nivel(t), ch = this.chorro(t);
    // gotas del chorro
    if (ch > 0) for (let i = 0; i < 3; i++) if (this.gotas.length < 260) this.gotas.push({ x: ROTURA[0] + azar(-4, 4), y: ROTURA[1] + 8, vx: azar(-260, -120) * ch, vy: azar(-40, 80), r: azar(3, 6), vida: 1.5 });
    // el agua que tiran al achicar
    const e = this.poses();
    for (const [m, P_, k, d] of [[e.mG, e.G, "g", 0], [e.mM, e.M, "m", 0.31]]) {
      if (t < T_ACHICA || t > T_CLIC || (k === "m" && t > T_VE)) continue;
      const a = this.achique(t, d), a0 = this.achique(t - dt, d);
      if (a.u > 0.82 && a0.u <= 0.82) {
        const b = this.bocaJarra(m, P_), dir = k === "g" ? -1 : 1;
        for (let i = 0; i < 12; i++) if (this.gotas.length < 290) this.gotas.push({ x: b[0], y: b[1], vx: dir * azar(120, 320), vy: azar(-520, -300), r: azar(3, 6), vida: 1.6 });
      }
    }
    for (const q of this.gotas) {
      q.vy += 1000 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vida -= dt;
      if (q.y > n && q.vy > 0) { q.vida = 0; if (Math.random() < 0.3) p.nueva(P.VAPOR, q.x, n - 4, azar(-30, 30), azar(-40, -10), azar(0.3, 0.6), azar(10, 18)); }
    }
    this.gotas = this.gotas.filter((q) => q.vida > 0);
    this.una("bandeja", t > T_BANDEJA, () => temblar(5, 0.15));
    this.una("clic", t > T_CLIC, () => temblar(8, 0.2));
    this.una("suelo", t > T_SUELO, () => { temblar(10, 0.25); for (let i = 0; i < 12; i++) p.nueva(P.VAPOR, XG + azar(-60, 60), PIES - 6, azar(-120, 120), azar(-60, -10), azar(0.4, 0.8), azar(16, 26)); });
    this.una("pez", t > T_PEZ, () => {
      const e2 = this.poses(), b = this.bocaJarra(e2.mG, e2.G);
      for (let i = 0; i < 12; i++) if (this.gotas.length < 290) this.gotas.push({ x: b[0], y: b[1], vx: azar(-120, 120), vy: azar(-380, -160), r: azar(3, 5), vida: 0.8 });
    });
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gp = g.createLinearGradient(0, -60, 0, 470);
    gp.addColorStop(0, "#2a1810"); gp.addColorStop(1, "#5e3420");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 600);
    g.fillStyle = "rgba(255,200,140,.05)"; for (let x = -60; x < W + 60; x += 46) g.fillRect(x, -60, 2, 520);
    // estantes con botellas
    const cols = ["#2f7a3a", "#8a3b16", "#3b5d9a", "#b08a1a", "#8a1e4a"];
    const r = semilla(12);
    for (const [x0, x1, yb] of [[40, 420, 130], [620, 840, 130]]) {
      g.fillStyle = "#7a4a22"; g.fillRect(x0, yb, x1 - x0, 8);
      for (let x = x0 + 18; x < x1 - 10; x += 26 + r() * 6) { const alto = 36 + r() * 22; g.fillStyle = cols[(r() * cols.length) | 0]; rectR(g, x - 8, yb - alto, 16, alto, 4); g.fill(); g.fillRect(x - 3, yb - alto - 12, 6, 13); }
    }
    // friso
    const gm = g.createLinearGradient(0, 390, 0, PIES); gm.addColorStop(0, "#5a3218"); gm.addColorStop(1, "#2e170a");
    g.fillStyle = gm; g.fillRect(-60, 396, W + 120, PIES - 396);
    g.fillStyle = "#7a4a26"; g.fillRect(-60, 390, W + 120, 8);
    // sumidero
    g.fillStyle = "#1a1a1a"; g.beginPath(); g.ellipse(512, PIES + 10, 26, 6, 0, 0, 6.283); g.fill();
    // suelo
    const gs = g.createLinearGradient(0, PIES, 0, H + 60); gs.addColorStop(0, "#4a2a16"); gs.addColorStop(1, "#1a0c04");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "#2a2a2e"; g.beginPath(); g.ellipse(512, PIES + 8, 28, 7, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#6a6a72"; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(512 + i * 9, PIES + 3); g.lineTo(512 + i * 9, PIES + 13); g.stroke(); }
    // tubería: horizontal y bajando a la llave de paso
    const tubo = (x0, y0, x1, y1) => {
      const hz = y0 === y1;
      const gr = hz ? g.createLinearGradient(0, y0 - 10, 0, y0 + 10) : g.createLinearGradient(x0 - 10, 0, x0 + 10, 0);
      gr.addColorStop(0, "#7a848d"); gr.addColorStop(0.4, "#e6ebef"); gr.addColorStop(1, "#4a5258");
      g.fillStyle = gr; if (hz) g.fillRect(x0, y0 - 10, x1 - x0, 20); else g.fillRect(x0 - 10, y0, 20, y1 - y0);
    };
    tubo(-60, TUBO_Y, LLAVE[0] + 10, TUBO_Y); tubo(LLAVE[0], TUBO_Y, LLAVE[0], PIES);
    g.fillStyle = "#9aa4ad"; for (const x of [140, 380, 760]) { g.fillRect(x - 6, TUBO_Y - 14, 12, 28); }
    g.fillStyle = "#3a3f46"; g.fillRect(LLAVE[0] - 16, TUBO_Y - 14, 32, 28);
    return (this.cF = c);
  }
  /** La llave de paso (rueda roja) y la junta que revienta. */
  llave(g, t) {
    const [x, y] = LLAVE, a = t > T_GIRA ? (Math.min(t, T_CLIC) - T_GIRA) * 9 : 0;
    g.fillStyle = "#3a3f46"; g.fillRect(x - 14, y - 12, 28, 24);
    g.save(); g.translate(x, y - 2); g.rotate(a);
    g.strokeStyle = "#d8261c"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 24, 0, 6.283); g.stroke();
    g.lineWidth = 4; for (let i = 0; i < 3; i++) { const b = i * 2.094; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(b) * 24, Math.sin(b) * 24); g.stroke(); }
    g.fillStyle = "#ff6a5a"; g.beginPath(); g.arc(0, 0, 6, 0, 6.283); g.fill();
    g.restore();
    // la junta rota
    const [rx, ry] = ROTURA;
    const tiembla = t > T_TIEMBLA && t < T_CRAC ? azar(-3, 3) : 0;
    g.fillStyle = "#9aa4ad"; g.fillRect(rx - 9 + tiembla, ry - 15, 18, 30);
    if (t > T_CRAC) { g.fillStyle = "#1a1a1a"; g.beginPath(); g.moveTo(rx - 6, ry + 10); g.lineTo(rx, ry + 2); g.lineTo(rx + 4, ry + 10); g.closePath(); g.fill(); }
  }
  dibujarChorro(g, t) {
    const ch = this.chorro(t);
    if (ch <= 0) return;
    const [x, y] = ROTURA, n = this.nivel(t);
    const fin = [x - 150 * ch, n];
    g.save(); g.lineCap = "round";
    for (const [w, col] of [[26, "rgba(120,190,255,.35)"], [14, "rgba(180,225,255,.75)"], [5, "rgba(255,255,255,.95)"]]) {
      g.strokeStyle = col; g.lineWidth = w * (0.4 + 0.6 * ch) * (1 + 0.1 * Math.sin(t * 40));
      g.beginPath(); g.moveTo(x, y + 8); g.quadraticCurveTo(x - 130 * ch, y + 10, fin[0], fin[1]); g.stroke();
    }
    g.restore();
  }
  agua(g, t) {
    const n = this.nivel(t);
    if (n > PIES + 10) return;
    g.save();
    const gr = g.createLinearGradient(0, n, 0, H + 60);
    gr.addColorStop(0, "rgba(90,170,240,.55)"); gr.addColorStop(1, "rgba(30,80,160,.75)");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-60, H + 60);
    for (let x = -60; x <= W + 60; x += 24) g.lineTo(x, n + 4 * Math.sin(x * 0.03 + t * 5) + 3 * Math.sin(x * 0.07 - t * 3));
    g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
    g.strokeStyle = "rgba(230,248,255,.85)"; g.lineWidth = 3;
    g.beginPath();
    for (let x = -60; x <= W + 60; x += 24) { const y = n + 4 * Math.sin(x * 0.03 + t * 5) + 3 * Math.sin(x * 0.07 - t * 3); if (x === -60) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
    // remolino del sumidero al vaciarse
    if (t > T_BAJA && t < T_SUELO + 0.3) {
      g.strokeStyle = "rgba(230,248,255,.7)"; g.lineWidth = 3;
      for (let i = 0; i < 3; i++) { const a0 = -t * 8 + i * 2.1; g.beginPath(); g.ellipse(512, Math.min(n + 30, PIES + 6), 50 - i * 14, 10 - i * 2.5, 0, a0, a0 + 3.5); g.stroke(); }
    }
    g.restore();
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(620, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bfe8ff"); gr.addColorStop(1, "#2fa8ff");
    txt(g, "¡ACHICA!", 316, 146, { tam: 140, peso: 900, fam: FD, color: "#05203a", esp: 6 });
    txt(g, "¡ACHICA!", 310, 140, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#05203a", bordeAncho: 12, esp: 6, glow: "rgba(80,180,255,.8)", glowTam: 22 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    this.llave(g, t);
    // sombras (antes de que suba el agua)
    if (this.nivel(t) > PIES) { g.fillStyle = "rgba(0,0,0,.35)"; for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 56, 9, 0, 0, 6.283); g.fill(); } }
    // estantito con jarras vacías
    g.fillStyle = "#7a4a22"; g.fillRect(ESTANTE[0], ESTANTE[1], 96, 8); g.fillStyle = "#5a3418"; g.fillRect(ESTANTE[0] + 8, ESTANTE[1] + 8, 6, 14); g.fillRect(ESTANTE[0] + 82, ESTANTE[1] + 8, 6, 14);
    JARRAS.forEach((x, i) => { if (i === 0 && e.cogida) return; g.save(); g.translate(x, ESTANTE[1] - 18 * ESC); g.scale(ESC, ESC); jarraAgua(g, [0, 0], 0, 0, "asa", t); jarraAgua(g, [0, 0], 0, 0, "cuerpo", t); g.restore(); });
    this.dibujarChorro(g, t);
    pintarAvatar(g, e.mM, e.M, t);
    if (!e.gEncima) pintarAvatar(g, e.mG, e.G, t);
    this.agua(g, t);
    // Guillermo en su bandeja (por encima del agua)
    if (e.B) {
      g.save(); g.translate(e.B.x, e.B.y); g.rotate(e.B.giro);
      const gr = g.createLinearGradient(-70, 0, 70, 0); gr.addColorStop(0, "#8a949e"); gr.addColorStop(0.5, "#f4f7f9"); gr.addColorStop(1, "#6a727a");
      g.fillStyle = "#5a626a"; g.beginPath(); g.ellipse(0, 4, 74, 13, 0, 0, 6.283); g.fill();
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 72, 11, 0, 0, 6.283); g.fill();
      g.restore();
      if (e.gEncima) pintarAvatar(g, e.mG, e.G, t);
    }
    // gotas
    g.fillStyle = "rgba(200,235,255,.9)";
    for (const q of this.gotas) { g.beginPath(); g.ellipse(q.x, q.y, q.r * 0.7, q.r, 0, 0, 6.283); g.fill(); }
    // el pececillo
    if (t > T_PEZ && t < T_PEZ + 0.9) {
      const b = this.bocaJarra(e.mG, e.G), u = tramo(t, T_PEZ, T_PEZ + 0.9);
      pez(g, b[0] + 30 * u, b[1] - 150 * Math.sin(Math.PI * u), 1.5, -1.2 + 2.6 * u, t);
    }
    if (t > T_PEZ + 0.9) { const b = this.bocaJarra(e.mG, e.G); g.save(); g.beginPath(); g.rect(b[0] - 30, b[1] - 40, 60, 40); g.clip(); pez(g, b[0] + 10, b[1] - 4 + 2 * Math.sin(t * 6), 1.1, 0.2 * Math.sin(t * 5), t); g.restore(); }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡TRRR!", 560, 150, T_TIEMBLA, 0.45, 40, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡CRAC!", 620, 160, T_CRAC, 0.6, 64, "#2fe3e8", "#06303a", 0.1);
    ono("¡GLUP, GLUP!", 180, 210, T_TRAGO + 0.1, 0.55, 40, "#ffd34d", "#3a2400", -0.08);
    ono("¡LA LLAVE!", 780, 250, T_VE, 0.75, 42, "#ffd34d", "#3a2400", 0.06);
    ono("¡ÑIC, ÑIC!", 900, 240, T_GIRA + 0.15, 0.6, 40, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡CLIC!", 940, 300, T_CLIC, 0.6, 50, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡GLU, GLU!", 512, 470, T_BAJA + 0.2, 0.9, 50, "#e6f6ff", "#05203a", 0);
    ono("¡BLUB!", 200, 300, T_PEZ + 0.1, 0.8, 54, "#ff8a1f", "#3a1600", -0.1);
    // ¡ACHICA!
    if (t > T_ACHICA - 0.2 && t < T_GIRA) {
      const d = t - T_ACHICA + 0.2, k = tramo(d, 0, 0.16), sal = tramo(t, T_GIRA - 0.3, T_GIRA);
      const s = lerp(1.6, 1, eIn(k)) * (1 + 0.04 * Math.sin(d * 14)) * 0.85;
      const r = this.rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512 + 4 * Math.sin(d * 19), 82); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00216", nombre: "Inundación en el bar", crear: () => new Inundacion() });
})();
