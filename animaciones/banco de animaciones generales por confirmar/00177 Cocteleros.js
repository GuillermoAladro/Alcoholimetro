"use strict";
/*
 * 00177 · COCTELEROS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende el neón de la coctelería: Guillermo y Marcos, de camareros detrás de la barra, agitan las cocteleras
 * a la vez (¡CHAC, CHAC!), las lanzan al aire girando (¡HOP!), se las cambian por encima de la cabeza (una alta y
 * otra baja, se cruzan en el aire) y las cogen a la vez (¡TAC!). Sirven dos cócteles desde lo alto y pose final: ¡SHAKE!
 */
(() => {
const ESC = 1.6, AY = 618, BARRA = 468, SC = 1.25;
const XS = [330, 694];                                   // Guillermo, Marcos
const QUIEN = [undefined, "marcos"];
const T_SH1 = 0.75, T_SH2 = 2.0, T_UP = 2.85, D_UP = 0.95, T_X = 4.05, D_X = 1.05, T_POUR = 5.75, T_FIN = 7.1, T_APAGA = 9.35;
const GLASS = [[402, BARRA], [766, BARRA]];               // las copas en la barra
const COLOR = [["#ff7ab0", "#ff3d84", "#a8104a"], ["#9ffcff", "#2fe3e8", "#0b7f8a"]];
const CT = cacheTexto();
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];
const aS = (X, u) => [X + (u[0] - 39) * ESC, AY + (u[1] - 232) * ESC];

/** Sprite de la coctelera (unidades de avatar × 4); el agarre en (8, 34). */
let _spr = null;
function sprCoct() {
  if (_spr) return _spr;
  const c = lienzoNuevo(16 * 4, 46 * 4), g = c.getContext("2d");
  g.scale(4, 4); g.translate(8, 34);
  const gr = g.createLinearGradient(-7, 0, 7, 0);
  gr.addColorStop(0, "#4b525b"); gr.addColorStop(0.25, "#cfd7de"); gr.addColorStop(0.42, "#ffffff"); gr.addColorStop(0.68, "#8b95a0"); gr.addColorStop(1, "#353b42");
  g.fillStyle = gr; g.strokeStyle = "rgba(15,18,22,.9)"; g.lineWidth = 0.7; g.lineJoin = "round";
  g.beginPath(); g.moveTo(-6.8, 11); g.lineTo(6.8, 11); g.lineTo(5.3, -18); g.lineTo(-5.3, -18); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-5.6, -17.5); g.lineTo(5.6, -17.5); g.lineTo(3.3, -27.5); g.lineTo(-3.3, -27.5); g.closePath(); g.fill(); g.stroke();
  rectR(g, -2.5, -32, 5, 5, 1.6); g.fill(); g.stroke();
  g.fillStyle = "#2f353c"; g.fillRect(-5.8, -18.8, 11.6, 1.8); g.fillRect(-3.6, -28, 7.2, 1.3);
  g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(-3.5, -15.5, 1.3, 24); g.fillRect(-2.2, -26, 0.9, 7);
  g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(-6.6, 8, 13.2, 3);
  return (_spr = c);
}
/** Coctelera con el agarre en el origen, girada `ang` (0 = de pie) y a escala `s`. */
function coctelera(g, x, y, ang, s) {
  const c = sprCoct();
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s / 4, s / 4); g.drawImage(c, -32, -136); g.restore();
}
/** Copa de cóctel en la barra: (x, y) = el pie; k = lo llena que está; deco = sombrillita. */
function copa(g, x, y, k, col, deco, brilla) {
  g.save(); g.translate(x, y);
  g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(0, 2, 26, 5, 0, 0, 6.283); g.fill();
  const bw = 34, bh = 36, top = -78;
  // líquido
  if (k > 0.02) {
    g.save();
    g.beginPath(); g.moveTo(-bw, top); g.lineTo(bw, top); g.lineTo(3, top + bh); g.lineTo(-3, top + bh); g.closePath(); g.clip();
    const yl = top + bh - (bh - 4) * Math.sqrt(k);
    const gr = g.createLinearGradient(0, yl, 0, top + bh);
    gr.addColorStop(0, col[0]); gr.addColorStop(0.5, col[1]); gr.addColorStop(1, col[2]);
    g.fillStyle = gr; g.fillRect(-bw, yl, bw * 2, bh);
    g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(-bw, yl, bw * 2, 2.5);
    g.restore();
  }
  // cristal
  g.strokeStyle = "rgba(225,240,255,.9)"; g.lineWidth = 2.4; g.lineJoin = "round";
  g.fillStyle = "rgba(200,225,255,.12)";
  g.beginPath(); g.moveTo(-bw, top); g.lineTo(bw, top); g.lineTo(3, top + bh); g.lineTo(-3, top + bh); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "rgba(225,240,255,.85)"; g.fillRect(-1.6, top + bh, 3.2, -top - bh - 4);
  g.beginPath(); g.ellipse(0, -2, 18, 4, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.moveTo(-bw + 7, top + 3); g.lineTo(-bw + 11, top + 3); g.lineTo(-6, top + bh - 6); g.closePath(); g.fill();
  if (deco > 0) {
    const s = eBack(deco);
    g.save(); g.translate(16, top + 2); g.scale(s, s); g.rotate(0.35);
    g.strokeStyle = "#f4e3c0"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, -30); g.stroke();
    g.fillStyle = col === COLOR[0] ? "#ffd34d" : "#ff3d84";
    g.beginPath(); g.moveTo(-18, -24); g.quadraticCurveTo(0, -42, 18, -24); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1.2;
    g.beginPath(); for (const dx of [-9, 0, 9]) { g.moveTo(0, -36); g.lineTo(dx * 1.6, -24); } g.stroke();
    g.restore();
    // guinda
    g.fillStyle = "#d0122c"; g.beginPath(); g.arc(-14, top - 1, 6 * s, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.arc(-16, top - 3, 1.8 * s, 0, 6.283); g.fill();
  }
  g.restore();
  if (brilla > 0) brillo(g, x - 20, y - 70, 22, brilla);
}

class Cocteleros extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(300);
  }
  luz() { return tramo(this.t, 0.15, 0.55) * (1 - tramo(this.t, T_APAGA, 9.85)); }
  /** Agarre (unidades) y giro de la coctelera de cada uno mientras la tiene en la mano. */
  agarre(t, q) {
    const R = avatar(QUIEN[q]).rig;
    let m = [56, 112], ang = 0.15, mI = null;
    if (t > T_SH1 - 0.3 && t < T_SH2) {
      // con las dos manos delante del pecho, a golpes
      const k = eInOut(tramo(t, T_SH1 - 0.3, T_SH1));
      const s = Math.sin((t - T_SH1) * 2 * Math.PI * 3.6) * (t > T_SH1 ? 1 : 0);
      const base = [50 + s * 3, 104 - s * 7];
      m = mezcla(m, base, k); ang = lerp(0.15, 0.5 + s * 0.08, k);
      const top = rot2([0, -29], ang);
      mI = [m[0] + top[0], m[1] + top[1]];
    }
    if (t >= T_SH2 - 0.15 && t < T_UP) {
      // a una mano, por encima del hombro
      const k = eInOut(tramo(t, T_SH2 - 0.15, T_SH2 + 0.1));
      const s = Math.sin((t - T_SH2) * 2 * Math.PI * 4.2);
      const alto = [R.hombroD[0] + 6 + s * 4, 58 - s * 8];
      m = mezcla([50, 104], alto, k); ang = lerp(0.5, -0.35 + s * 0.12, k);
      if (k < 0.5) { const top = rot2([0, -29], ang); mI = [m[0] + top[0], m[1] + top[1]]; }
    }
    return { m, ang, mI };
  }
  /** Dónde está cada coctelera: { mano: true, ... } o en el aire (pantalla). */
  coct(t, q) {
    const X = XS[q];
    const lanzar = (t0, d, u0, u1, alto, vueltas, X0, X1) => {
      const u = (t - t0) / d, P0 = aS(X0, u0), P1 = aS(X1, u1);
      return { mano: false, x: lerp(P0[0], P1[0], u), y: lerp(P0[1], P1[1], u) - 4 * alto * u * (1 - u), ang: -0.35 + vueltas * 6.283 * u };
    };
    const SUELTA = [74, 40], COGE = [74, 46];
    if (t > T_UP && t < T_UP + D_UP) return lanzar(T_UP, D_UP, SUELTA, COGE, 230, -2, X, X);
    if (t > T_X && t < T_X + D_X) {
      // Guillermo la tira alta hacia Marcos; Marcos, baja hacia Guillermo: se cruzan sin chocar
      return q === 0 ? lanzar(T_X, D_X, SUELTA, COGE, 250, 2, XS[0], XS[1]) : lanzar(T_X, D_X, SUELTA, COGE, 85, -1.5, XS[1], XS[0]);
    }
    return { mano: true };
  }
  poses() {
    const t = this.t;
    return [0, 1].map((q) => {
      const R = avatar(QUIEN[q]).rig, X = XS[q];
      const A = { quien: QUIEN[q], cara: "sonrisa", rc: q ? -0.1 : 0.1, piernaI: [0, 0], piernaD: [0, 0] };
      let mD = [56, 112], mI = R.manoI.slice(), ang = 0.15, dy = 0, giro = 0;
      const ag = this.agarre(t, q);
      mD = ag.m; ang = ag.ang;
      if (ag.mI) { mI = ag.mI; A.brazoIDelante = true; }
      // agitando: botan a la vez y se ríen
      if (t > T_SH1 && t < T_UP) {
        dy = -Math.abs(Math.sin((t - T_SH1) * Math.PI * 3.6)) * 6;
        A.cara = Math.sin(t * 5) > 0 ? "risa" : "guino";
        A.rc = (q ? -1 : 1) * 0.06 * Math.sin(t * 7.2);
        giro = 0.03 * Math.sin((t - T_SH1) * Math.PI * 3.6);
      }
      // lanzamiento hacia arriba: suben la mano, miran arriba
      const SUELTA = [74, 40], COGE = [74, 46];
      const lanza = (t0, d) => {
        if (t < t0 - 0.2 || t > t0 + d + 0.35) return false;
        const kS = eOut(tramo(t, t0 - 0.2, t0)), kB = eInOut(tramo(t, t0 + 0.05, t0 + 0.3));
        mD = mezcla(mezcla(mD, SUELTA, kS), [COGE[0], COGE[1] + 6], kB * (1 - tramo(t, t0 + d - 0.15, t0 + d)));
        if (t > t0 + d) mD = [COGE[0], COGE[1] + 10 * Math.sin(tramo(t, t0 + d, t0 + d + 0.3) * Math.PI)];
        return true;
      };
      if (lanza(T_UP, D_UP)) {
        ang = -0.35;
        if (t > T_UP && t < T_UP + D_UP) { A.cara = "sorpresa"; A.rc = (q ? 0.08 : -0.08); }
        else if (t >= T_UP + D_UP) A.cara = "risa";
      }
      if (t > T_UP + D_UP + 0.35 && t < T_X) {
        // se preparan para el cambio: se miran y guiñan
        const k = eInOut(tramo(t, T_UP + D_UP + 0.35, T_X - 0.25));
        mD = mezcla([COGE[0], COGE[1]], SUELTA, k * 0.4); ang = -0.35;
        A.cara = "guino"; A.rc = q ? -0.14 : 0.14;
      }
      if (lanza(T_X, D_X)) {
        ang = -0.35;
        if (t > T_X && t < T_X + D_X) {
          A.cara = "sorpresa";
          // siguen con la mirada la que les llega
          const u = (t - T_X) / D_X;
          A.rc = (q ? 1 : -1) * 0.18 * Math.cos(u * Math.PI);
          if (q === 0 && u > 0.6) A.cara = "sorpresa";
        } else if (t >= T_X + D_X) A.cara = "risa";
      }
      // ¡TAC! los dos a la vez: medio giro de muñeca de celebración
      if (t > T_X + D_X + 0.35 && t < T_POUR) {
        const u = tramo(t, T_X + D_X + 0.35, T_POUR - 0.1);
        mD = mezcla([COGE[0], COGE[1]], [70, 70], eInOut(u)); ang = -0.35 + 6.283 * eInOut(u);
        A.cara = "risa"; A.rc = (q ? -1 : 1) * 0.1;
      }
      // servir desde lo alto
      if (t >= T_POUR) {
        const k = eInOut(tramo(t, T_POUR, T_POUR + 0.35)), kV = eInOut(tramo(t, T_FIN - 0.4, T_FIN));
        const top = [GLASS[q][0], GLASS[q][1] - 98];
        const angP = Math.PI - 0.32, d = rot2([0, -30 * ESC * SC], angP);
        const manoS = aU(X, [top[0] - d[0], top[1] - d[1]]);
        mD = mezcla(mezcla([70, 70], manoS, k), [q ? 72 : 78, q ? 26 : 16], kV);
        ang = lerp(lerp(0, angP, k), -0.2, kV);
        A.cara = t < T_FIN - 0.4 ? "guino" : "risa"; A.rc = (q ? -1 : 1) * 0.08;
        if (t > T_FIN) {
          // pose final: coctelera arriba, la otra mano señala la copa
          mI = mezcla(R.manoI, [q ? -14 : -12, 118], eOut(tramo(t, T_FIN, T_FIN + 0.25)));
          A.brazoIDelante = false;
          A.cara = q === 0 ? (t > 8.2 ? "guino" : "risa") : (t > 8.5 ? "guino" : "risa");
          dy = -Math.abs(Math.sin((t - T_FIN) * 6)) * 8 * (1 - tramo(t, 8.4, 8.9));
          A.rc = (q ? -1 : 1) * (0.1 + 0.04 * Math.sin(t * 4));
        }
      }
      const C = this.coct(t, q);
      if (C.mano) { const a = ang; A.objD = (g, m) => coctelera(g, m[0], m[1], a, SC); }
      A.manoD = mD; A.manoI = mI;
      return { pose: A, m: matAv(X, AY + dy, ESC, giro) };
    });
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const cogen = (k, t1) => this.una(k, t > t1, () => {
      temblar(7, 0.18);
      for (const q of [0, 1]) {
        const P1 = aS(XS[q], [74, 40]);
        p.nueva(P.DESTELLO, P1[0], P1[1], 0, 0, 0.25, 80);
        for (let i = 0; i < 9; i++) { const a = azar(0, 6.283), v = azar(120, 280); p.nueva(P.CHISPA, P1[0], P1[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); }
      }
    });
    cogen("up", T_UP + D_UP);
    cogen("x", T_X + D_X);
    // gotitas al agitar
    if (t > T_SH1 && t < T_UP && Math.random() < 14 * dt) {
      for (const q of [0, 1]) {
        const P0 = aS(XS[q], this.agarre(t, q).m);
        p.nueva(P.ESPUMA, P0[0] + azar(-10, 10), P0[1] - 40, azar(-60, 60), azar(-160, -60), azar(0.3, 0.5), azar(2, 4));
      }
    }
    // el chorro al servir
    if (t > T_POUR + 0.35 && t < T_FIN - 0.45) for (const q of [0, 1]) if (Math.random() < 40 * dt) {
      const [gx, gy] = GLASS[q];
      p.nueva(P.ESPUMA, gx + azar(-6, 6), gy - 80, azar(-50, 50), azar(-90, -30), azar(0.2, 0.35), azar(1.5, 3));
    }
    this.una("fin", t > T_FIN, () => {
      temblar(14, 0.4);
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(40, W - 40), azar(-60, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 14), i % 5);
      for (const [gx, gy] of GLASS) for (let i = 0; i < 10; i++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, gx, gy - 70, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.7), azar(6, 9)); }
    });
    p.suelo = () => BARRA - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#120a16"); gr.addColorStop(1, "#24121c");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // estanterías con botellas genéricas
    const cols = ["#2f6b3a", "#7a3b16", "#3b4d7a", "#6b5a1a", "#6a1e3a", "#2d6b6b"];
    for (const yb of [190, 310]) {
      g.fillStyle = "#3a2516"; g.fillRect(40, yb, W - 80, 8);
      g.fillStyle = "rgba(255,210,150,.25)"; g.fillRect(40, yb, W - 80, 2);
      for (let i = 0; i < 24; i++) {
        const x = 64 + i * 39 + (yb > 200 ? 16 : 0), h = 52 + ((i * 7 + yb) % 4) * 9;
        if (x > W - 60) continue;
        g.fillStyle = cols[(i + (yb > 200 ? 2 : 0)) % cols.length];
        rectR(g, x - 10, yb - h, 20, h, 5); g.fill(); g.fillRect(x - 4, yb - h - 15, 8, 17);
        g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(x - 6, yb - h + 6, 3, h - 12);
        g.fillStyle = "rgba(240,230,210,.55)"; g.fillRect(x - 7, yb - h * 0.6, 14, h * 0.28);
      }
    }
    // tiras de luz
    g.globalCompositeOperation = "lighter";
    for (const [x, col] of [[30, BLOB.blanco], [W - 30, BLOB.blanco]]) { g.globalAlpha = 0.12; g.drawImage(col, x - 60, 0, 120, H); }
    g.globalAlpha = 0.3; g.drawImage(BLOB2.oro, W / 2 - 500, 120, 1000, 300);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 280, 200, W / 2, 300, 700);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.75)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return (this.cF = c);
  }
  /** Neón de una copa en la pared (se enciende con parpadeo al principio). */
  neon(g, t, a) {
    const on = t < 0.15 ? 0 : t < 0.55 ? (Math.sin(t * 70) > 0 ? 1 : 0.2) : 1;
    const k = a * on;
    if (k <= 0) return;
    g.save(); g.translate(512, 92); g.globalAlpha = k;
    g.lineJoin = "round"; g.lineCap = "round";
    for (const [lw, col] of [[14, "rgba(255,61,132,.25)"], [7, "rgba(255,61,132,.6)"], [3, "#ffd0e2"]]) {
      g.strokeStyle = col; g.lineWidth = lw;
      g.beginPath(); g.moveTo(-46, -34); g.lineTo(46, -34); g.lineTo(4, 10); g.lineTo(4, 40); g.moveTo(-4, 10); g.lineTo(-4, 40); g.moveTo(-22, 44); g.lineTo(22, 44);
      g.moveTo(-4, 10); g.lineTo(-46, -34); g.stroke();
      g.beginPath(); g.arc(26, -42, 9, 0, 6.283); g.stroke();
    }
    g.restore();
  }
  barra(g) {
    if (!this.cB) {
      const c = lienzoNuevo(W, H - BARRA + 20), x = c.getContext("2d");
      const gr = x.createLinearGradient(0, 0, 0, c.height);
      gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#1c0f08");
      x.fillStyle = gr; x.fillRect(0, 10, W, c.height);
      x.fillStyle = "rgba(0,0,0,.35)"; for (let i = 30; i < W; i += 96) x.fillRect(i, 26, 3, c.height);
      x.fillStyle = "#b8862d"; x.fillRect(0, 104, W, 8); x.fillStyle = "rgba(255,240,190,.55)"; x.fillRect(0, 105, W, 2);
      x.fillStyle = "#8a5426"; x.fillRect(0, 0, W, 18);
      x.fillStyle = "rgba(255,220,170,.45)"; x.fillRect(0, 0, W, 3);
      x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0, 18, W, 5);
      this.cB = c;
    }
    g.drawImage(this.cB, 0, BARRA - 6);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, 60, 24); g.fillRect(W, BARRA - 6, 60, 24);
    g.fillStyle = "#1c0f08"; g.fillRect(-60, BARRA + 18, 60, H); g.fillRect(W, BARRA + 18, 60, H);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), 0, 0);
    g.restore();
    this.neon(g, t, tramo(t, 0, 0.2) * (1 - tramo(t, T_APAGA, 9.85)));
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, BARRA, 470, 0.6);
    for (const x of e) pintarAvatar(g, x.m, x.pose, t);
    this.barra(g);
    // las copas
    for (const q of [0, 1]) {
      const kLlena = tramo(t, T_POUR + 0.4, T_FIN - 0.45);
      const deco = tramo(t, T_FIN - 0.2, T_FIN + 0.15);
      const brilla = t > T_FIN ? 0.6 + 0.4 * Math.sin(t * 9 + q * 2) : 0;
      copa(g, GLASS[q][0], GLASS[q][1], kLlena, COLOR[q], deco, brilla * (1 - tramo(t, T_APAGA - 0.4, T_APAGA)));
    }
    // el chorro
    if (t > T_POUR + 0.3 && t < T_FIN - 0.4) {
      for (const q of [0, 1]) {
        const [gx, gy] = GLASS[q], k = tramo(t, T_POUR + 0.3, T_POUR + 0.45) * (1 - tramo(t, T_FIN - 0.55, T_FIN - 0.4));
        const y0 = gy - 100, y1 = gy - 80 + 2;
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.5 * k;
        g.drawImage(q ? BLOB2.cian : BLOB.rojo, gx - 22, y0 - 6, 44, y1 - y0 + 12); g.restore();
        g.fillStyle = COLOR[q][1]; g.globalAlpha = a * 0.95;
        rectR(g, gx - 4.5 * k, y0, 9 * k, (y1 - y0), 4); g.fill();
        g.fillStyle = "rgba(255,255,255,.65)"; g.fillRect(gx - 2, y0, 2 * k, y1 - y0);
        g.globalAlpha = a;
      }
    }
    // las cocteleras en el aire (delante de todo)
    for (const q of [0, 1]) {
      const C = this.coct(t, q);
      if (!C.mano) {
        coctelera(g, C.x, C.y, C.ang, ESC * SC);
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * a;
        g.drawImage(BLOB.blanco, C.x - 30, C.y - 50, 60, 60); g.restore();
      }
    }
    g.restore();
    this.p.dibujar(g);
    // onomatopeyas
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    for (let i = 0; i < 5; i++) {
      const t0 = T_SH1 + 0.05 + i * 0.42;
      ono(i % 2 ? "¡CHAC!" : "¡CHAC!", i % 2 ? 860 : 150, 200 + (i % 2) * 30, t0, 0.38, 46, "#fffdf5", "#1b1b1b", i % 2 ? 0.12 : -0.12);
    }
    ono("¡HOP!", 512, 200, T_UP + 0.05, 0.6, 64, "#2fe3e8", "#06303a", -0.08);
    ono("¡TAC!", XS[0] + 60, 250, T_UP + D_UP, 0.45, 44, "#fffdf5", "#1b1b1b", -0.12);
    ono("¡TAC!", XS[1] + 60, 250, T_UP + D_UP, 0.45, 44, "#fffdf5", "#1b1b1b", 0.12);
    ono("¡TAC!", XS[0] + 60, 250, T_X + D_X, 0.5, 50, "#ffd34d", "#3a2400", -0.12);
    ono("¡TAC!", XS[1] + 60, 250, T_X + D_X, 0.5, 50, "#ffd34d", "#3a2400", 0.12);
    // ¡SHAKE!
    if (t > T_FIN) {
      const d = t - T_FIN, k = tramo(d, 0, 0.16), s = lerp(1.7, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 108 + Math.sin(d * 6) * 3); g.rotate(-0.05 + 0.02 * Math.sin(d * 5)); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(720, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#ffc2da"); gr.addColorStop(1, "#ff3d84");
    txt(g, "¡SHAKE!", 360, 170, { tam: 170, peso: 900, fam: FD, color: gr, borde: "#3a0418", bordeAncho: 13, esp: 8, glow: "rgba(255,61,132,.9)", glowTam: 30, max: 680 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00177", nombre: "Cocteleros", crear: () => new Cocteleros() });
})();
