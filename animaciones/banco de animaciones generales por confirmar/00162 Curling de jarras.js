"use strict";
/*
 * 00162 · CURLING DE JARRAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Una barra larguísima y helada con una diana al fondo. Guillermo, agachado, desliza una jarra llena y la suelta;
 * Marcos corre delante de ella barriendo el hielo como un loco mientras Guillermo le grita ¡BARRE, BARRE! La jarra
 * se arrastra, casi se para… y se queda clavada en el centro de la diana: ¡DIANA!
 */
(() => {
const ESC = 1.6, AY = 640, BARRA = 452, SUP = 476;      // canto de atrás de la barra y donde se apoya la jarra
const DIANA = 820, X0 = 228, X1 = 300, JE = 1.6;
const T_EMPUJA = 0.8, T_SUELTA = 1.6, T_PARA = 7.2, T_GRITO = 2.2, DUR = 10.2, T_APAGA = 9.6;
const CT = cacheTexto();
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];

class Curling extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.gotas = [];
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** x de la jarra: la empuja, la suelta y frena poco a poco (rozamiento constante). */
  xJ(t) {
    if (t < T_EMPUJA) return X0;
    if (t < T_SUELTA) return lerp(X0, X1, eIn(tramo(t, T_EMPUJA, T_SUELTA)) * 0.6 + tramo(t, T_EMPUJA, T_SUELTA) * 0.4);
    const u = tramo(t, T_SUELTA, T_PARA);
    return X1 + (DIANA - X1) * (1 - (1 - u) * (1 - u));
  }
  xM(t) { return Math.max(392, this.xJ(t) + 128) - 50 * eInOut(tramo(t, T_PARA + 0.3, T_PARA + 0.9)); }
  /** Cepillo de la escoba (en la barra, delante de la jarra). */
  cepillo(t) {
    const xj = this.xJ(t);
    if (t < 1.85) return [this.xM(t) + 52, SUP - 2, 0];
    if (t > T_PARA) {
      const k = eInOut(tramo(t, T_PARA + 0.5, T_PARA + 0.9));
      return mezcla([xj + 75, SUP - 2], [this.xM(t) + 58, SUP - 2], k).concat(k);
    }
    const w = lerp(12, 20, tramo(t, 2, 6.5));
    return [xj + 75 + 24 * Math.sin((t - 1.85) * w), SUP - 2, 0];
  }
  /** Palo de la escoba: de arriba (por encima del hombro) al cepillo. */
  palo(t) {
    const xm = this.xM(t), B = this.cepillo(t);
    let T = [xm + 54, 372];
    if (B[2] > 0) T = mezcla(T, [B[0], 300], B[2]);
    if (t < 1.85) T = [B[0] + 2, 300];
    return { T, B };
  }
  poses(t = this.t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 136], manoI: [8, 140] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 136], manoI: [8, 140], brazoIDelante: true };
    // Guillermo se agacha, empuja y suelta
    let xg = 168, syG = 1, yG = 0;
    const kAg = eInOut(tramo(t, 0.45, T_EMPUJA)) * (1 - eInOut(tramo(t, T_SUELTA + 0.1, T_SUELTA + 0.5)));
    syG = 1 - 0.1 * kAg; xg += 40 * eInOut(tramo(t, T_EMPUJA, T_SUELTA)) - 30 * eInOut(tramo(t, T_SUELTA + 0.1, T_SUELTA + 0.6));
    if (t < T_SUELTA + 0.15) {
      const asa = aU(xg, [this.xJ(t) - 17 * JE, SUP - 18 * JE]);
      const mG = [asa[0], (asa[1] - 232) / syG + 232];
      G.manoD = mezcla([72, 136], mG, eInOut(tramo(t, 0.45, T_EMPUJA)));
      G.cara = t < T_EMPUJA ? "guino" : "dormido"; G.rc = 0.08;
    }
    if (t > T_SUELTA && t < T_GRITO) { G.cara = "sorpresa"; }
    if (t >= T_GRITO && t < T_PARA) {
      // le grita con la mano en la boca y agitando la otra
      const k = eInOut(tramo(t, T_GRITO, T_GRITO + 0.25));
      G.manoD = mezcla([72, 136], [60, 58], k);
      G.manoI = mezcla([8, 140], [-16, 34 + 8 * Math.sin(t * 12)], k); G.brazoIDelante = true;
      G.cara = Math.floor(t * 4) % 3 === 0 ? "sorpresa" : "risa"; G.rc = 0.05 * Math.sin(t * 7);
      if (t > 6.0) { G.cara = "sorpresa"; G.rc = 0.1; }
      yG = -Math.abs(Math.sin(t * 6)) * 6;
    }
    if (t >= T_PARA) {
      const d = t - T_PARA, k = eBack(tramo(d, 0.1, 0.4));
      G.cara = "risa";
      G.manoD = mezcla([60, 58], [98, 30 + 5 * Math.sin(t * 10)], k); G.manoI = mezcla([-16, 34], [-22, 30 + 5 * Math.sin(t * 10 + 1)], k); G.brazoIDelante = true;
      yG = -Math.abs(Math.sin(d * 8)) * 18 * (1 - tramo(d, 1.8, 2.2));
    }
    // Marcos: la escoba con las dos manos
    const xm = this.xM(t), { T, B } = this.palo(t);
    const enPalo = (f) => aU(xm, mezcla(T, B, f));
    let yM = 0;
    if (t < 1.85) {
      M.manoD = aU(xm, [B[0] + 1, 360]); M.manoI = [-10, 150]; M.brazoIDelante = false;
      M.cara = t < 1.4 ? "guino" : "sorpresa";
    } else if (t < T_PARA) {
      M.manoD = enPalo(0.12); M.manoI = enPalo(0.55);
      const ritmo = Math.floor(t * 8) % 2;
      M.cara = t < 4 ? (ritmo ? "risa" : "sorpresa") : t < 6 ? (ritmo ? "dormido" : "risa") : "dormido";
      M.rc = -0.08 + 0.05 * Math.sin(t * 18);
      M.puntas = tramo(t, 4.5, 6.0);
      const a = andar(t * 16, 0.7); M.piernaI = a.piernaI; M.piernaD = a.piernaD; yM = a.bote * 0.6;
    } else {
      const d = t - T_PARA;
      M.manoD = enPalo(0.35);
      M.manoI = mezcla(enPalo(0.55), [-12, 34 + 5 * Math.sin(t * 10)], eBack(tramo(d, 0.9, 1.2)));
      M.cara = d < 0.9 ? "dormido" : "risa"; M.puntas = 1 - tramo(d, 0.6, 1.4);
      M.rc = d < 0.9 ? 0.12 : 0.05 * Math.sin(d * 6);
      yM = d < 0.9 ? 6 * Math.sin(Math.PI * tramo(d, 0, 0.9)) : -Math.abs(Math.sin((d - 0.9) * 8)) * 12 * (1 - tramo(d, 2.0, 2.3));
    }
    return [
      { pose: G, m: matAv(xg, AY + yG, ESC, 0.02, 1, syG) },
      { pose: M, m: matAv(xm, AY + yM, ESC, t > 1.85 && t < T_PARA ? -0.06 : 0) },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("suelta", t > T_SUELTA, () => temblar(5, 0.12));
    // escarcha que levanta la escoba
    if (t > 1.9 && t < T_PARA && Math.random() < 34 * dt) {
      const B = this.cepillo(t);
      p.nueva(P.VAPOR, B[0] + azar(-30, 30), SUP - 6, azar(-80, 80), azar(-70, -20), azar(0.3, 0.6), azar(12, 22));
      if (Math.random() < 0.5) p.nueva(P.ELECTRICA, B[0] + azar(-30, 30), SUP - 4, azar(-120, 120), azar(-160, -40), azar(0.2, 0.4), azar(6, 10));
    }
    // vaho frío
    if (Math.random() < 3 * dt) p.nueva(P.VAPOR, azar(0, W), SUP + 20, azar(-15, 15), azar(-20, -5), azar(1.2, 2), azar(30, 50));
    // sudor de Marcos
    if (t > 4.5 && t < T_PARA + 0.8 && Math.random() < 8 * dt) {
      const e = this.poses(t), lado = Math.random() < 0.5 ? -1 : 1, q = aPant(e[1].m, [37 + lado * 30, 30]);
      this.gotas.push({ x: q[0], y: q[1], vx: lado * azar(40, 110), vy: azar(-170, -70), v: 0.7 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("para", t > T_PARA, () => {
      temblar(18, 0.4);
      p.nueva(P.DESTELLO, DIANA, SUP - 30, 0, 0, 0.45, 240);
      for (let k = 0; k < 30; k++) { const a = azar(-Math.PI, 0), v = azar(200, 520); p.nueva(P.CHISPA, DIANA, SUP - 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), k % 5);
    });
    p.suelo = () => SUP;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Barra helada con la diana (se pinta una vez). */
  barra() {
    if (CT.has("barra")) return CT.get("barra");
    const c = lienzoNuevo(W + 120, H - BARRA + 70), g = c.getContext("2d");
    g.translate(60, -BARRA + 10);
    // frente de la barra
    const gf = g.createLinearGradient(0, 496, 0, H);
    gf.addColorStop(0, "#2c4a5e"); gf.addColorStop(1, "#0d1a24");
    g.fillStyle = gf; g.fillRect(-60, 496, W + 120, H - 496 + 60);
    g.fillStyle = "rgba(255,255,255,.06)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, 504, 3, H - 504);
    // tablero de hielo (un poco en perspectiva)
    const gt = g.createLinearGradient(0, BARRA, 0, 496);
    gt.addColorStop(0, "#9fd0ea"); gt.addColorStop(0.5, "#e3f6ff"); gt.addColorStop(1, "#b8e2f5");
    g.fillStyle = gt; g.fillRect(-60, BARRA, W + 120, 496 - BARRA);
    g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(-60, 494, W + 120, 4);
    // rayas del hielo
    const r = semilla(31);
    g.strokeStyle = "rgba(90,150,190,.35)"; g.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) { const x = r() * W, y = BARRA + 4 + r() * 38, l = 20 + r() * 70; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 4); g.stroke(); }
    // la diana
    for (const [rx, ry, col] of [[104, 19, "#1d4fd1"], [80, 14.5, "#ffffff"], [56, 10, "#e3262f"], [30, 5.5, "#ffffff"], [10, 2, "#e3262f"]]) {
      g.fillStyle = col; g.beginPath(); g.ellipse(DIANA, SUP - 1, rx, ry, 0, 0, 6.283); g.fill();
    }
    g.globalAlpha = 0.25; g.fillStyle = "#e3f6ff"; g.fillRect(DIANA - 110, SUP - 22, 220, 44); g.globalAlpha = 1;
    // línea de salida
    g.fillStyle = "rgba(227,38,47,.7)"; g.fillRect(X1 + 30, BARRA + 2, 4, 494 - BARRA);
    // carámbanos
    for (let x = -50; x < W + 60; x += 22) {
      const l = 12 + ((x * 7) % 23);
      const gi = g.createLinearGradient(0, 498, 0, 498 + l);
      gi.addColorStop(0, "rgba(220,245,255,.95)"); gi.addColorStop(1, "rgba(160,215,240,.2)");
      g.fillStyle = gi; g.beginPath(); g.moveTo(x - 6, 497); g.lineTo(x + 6, 497); g.lineTo(x + 1, 498 + l); g.closePath(); g.fill();
    }
    CT.set("barra", c);
    return c;
  }
  /** La jarra deslizándose; el asa da vueltas alrededor (como una piedra de curling). */
  jarra(g, t) {
    const x = this.xJ(t), phi = t < T_SUELTA ? Math.PI : Math.PI + (x - X1) / 70;
    const cx = x, cy = SUP - 18 * JE, cA = Math.cos(phi), detras = Math.sin(phi) < 0;
    const asa = () => {
      g.save(); g.translate(cx, cy); g.scale(cA * JE, JE); g.translate(-17, 0);
      dibujarJarra(g, [0, 0], 0, 0.88, "asa", t); g.restore();
    };
    g.fillStyle = "rgba(20,60,90,.35)"; g.beginPath(); g.ellipse(cx + 3, SUP + 2, 30, 6, 0, 0, 6.283); g.fill();
    if (detras) asa();
    g.save(); g.translate(cx - 17 * JE, cy); g.scale(JE, JE);
    dibujarJarra(g, [0, 0], 0, 0.88, "cuerpo", t);
    g.restore();
    if (!detras) asa();
    // brillo de velocidad
    if (t > T_SUELTA && t < 5) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const y = cy - 20 + i * 18; g.beginPath(); g.moveTo(cx - 40 - i * 8, y); g.lineTo(cx - 80 - i * 14, y); g.stroke(); }
      g.restore();
    }
  }
  escoba(g, t) {
    const { T, B } = this.palo(t);
    const dx = B[0] - T[0], dy = B[1] - T[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const T2 = [T[0] - ux * 40, T[1] - uy * 40];
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#3a2410"; g.lineWidth = 9; g.beginPath(); g.moveTo(T2[0], T2[1]); g.lineTo(B[0], B[1] - 12); g.stroke();
    g.strokeStyle = "#b9824a"; g.lineWidth = 6; g.stroke();
    g.strokeStyle = "rgba(255,230,190,.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(T2[0] - 1.5, T2[1]); g.lineTo(B[0] - 1.5, B[1] - 12); g.stroke();
    // cabeza del cepillo
    g.translate(B[0], B[1]);
    g.fillStyle = "#c8000e"; rectR(g, -32, -20, 64, 13, 4); g.fill();
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-28, -18, 56, 3);
    g.strokeStyle = "#f2c230"; g.lineWidth = 2.2;
    for (let i = -28; i <= 28; i += 4) { g.beginPath(); g.moveTo(i, -8); g.lineTo(i + Math.sin(t * 30 + i) * 2, 2); g.stroke(); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    // luz fría
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3 * a;
    g.drawImage(BLOB2.cian, 40, 120, 944, 460); g.restore();
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.drawImage(this.barra(), -60, BARRA - 10);
    // ondas en la diana al pararse
    const dp = t - T_PARA;
    if (dp > 0 && dp < 1.2) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - dp / 1.2)})`; g.lineWidth = 3;
      for (let i = 0; i < 3; i++) { const k = dp * 1.6 - i * 0.25; if (k > 0) { g.beginPath(); g.ellipse(DIANA, SUP - 1, 40 + 140 * k, 7 + 26 * k, 0, 0, 6.283); g.stroke(); } }
      g.restore();
    }
    this.jarra(g, t);
    this.escoba(g, t);
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    g.restore();
    this.p.dibujar(g);
    // ¡BARRE, BARRE!
    if (t > T_GRITO && t < T_PARA + 0.1) {
      const e0 = e[0], q = aPant(e0.m, [60, 52]);
      const k = tramo(t, T_GRITO, T_GRITO + 0.3), pul = 1 + 0.05 * Math.abs(Math.sin(t * 8)) * (t > 5.5 ? 1.8 : 1);
      g.save(); g.globalAlpha = a * (1 - tramo(t, T_PARA - 0.05, T_PARA + 0.1));
      g.translate(470, 140); g.rotate(-0.04 + 0.02 * Math.sin(t * 9)); g.scale(pul, pul); g.translate(-470, -140);
      bocadillo(g, 470, 140, "¡BARRE, BARRE!", q[0] + 20, q[1] - 20, k, 76);
      g.restore();
    }
    // ¡FRSS! al barrer
    if (t > 2.0 && t < T_PARA) {
      const B = this.cepillo(t), f = Math.floor(t * 2.5);
      if (f % 2 === 0) {
        g.save(); g.translate(B[0] + 40, SUP - 74); g.rotate(0.12);
        txt(g, "¡FRSS!", 0, 0, { tam: 34, peso: 400, fam: FC, color: "#e9fbff", borde: "#0a3d5c", bordeAncho: 6, esp: 2, alfa: a * 0.9 });
        g.restore();
      }
    }
    // ¡DIANA!
    if (dp > 0) {
      const k = tramo(dp, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(dp * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(560, 136); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(600, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c9f3ff"); gr.addColorStop(1, "#2fe3e8");
    txt(g, "¡DIANA!", 300, 152, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#06303a", bordeAncho: 12, esp: 5, glow: "rgba(47,227,232,.85)", glowTam: 26, max: 560 });
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00162", nombre: "Curling de jarras", crear: () => new Curling() });
})();
