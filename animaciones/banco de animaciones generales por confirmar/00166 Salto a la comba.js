"use strict";
/*
 * 00166 · SALTO A LA COMBA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Dos brazos mecánicos hacen girar una comba y Guillermo y Marcos saltan juntos («¡NO PISES!»). La comba va cada
 * vez más rápido; Guillermo se cansa, se retrasa… y la pisa: ¡ZAS! La cuerda le enrolla, le hace dar vueltas como
 * una peonza y le escupe al suelo, mareado. Marcos, tan fresco, sigue saltando a doble velocidad: ¡x2!
 */
(() => {
const ESC = 1.45, XG = 410, XM = 614;
const CR = [[150, 357], [874, 357]];                   // centro de los brazos mecánicos (manivelas)
const RMAN = 22, RC = 293;                             // radio de la manivela y amplitud de la comba
const F0 = 0.85, F1 = 1.5, RAMPA = 4.6, F2 = 2.7;      // vueltas por segundo
const T_ARRANCA = 1.0, N_TROPIEZO = 5;
// cuándo la comba llega abajo por quinta vez (ahí la pisa Guillermo)
const T_TROP = T_ARRANCA + (-F0 + Math.sqrt(F0 * F0 + 2 * ((F1 - F0) / RAMPA) * N_TROPIEZO)) / ((F1 - F0) / RAMPA);
const T_SUELTA = T_TROP + 1.3, T_CAE = T_SUELTA + 0.5, DUR = T_SUELTA + 4.0, T_APAGA = DUR - 0.6;
const CT = cacheTexto();

class Comba extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.gotas = [];
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Fase de la comba (0 = abajo, por delante bajando con fase negativa). Durante el enredo, null. */
  fase(t) {
    if (t < T_ARRANCA) return 0;
    if (t < T_TROP) { const u = t - T_ARRANCA, a = (F1 - F0) / RAMPA; return 2 * Math.PI * (F0 * u + 0.5 * a * u * u); }
    if (t < T_SUELTA) return null;
    const u = t - T_SUELTA;
    return 2 * Math.PI * (F2 * u - 0.5 * 0.9 * Math.max(0, u - 0.0) * 0) + 0.4 * Math.exp(-u * 6) * Math.sin(u * 30);
  }
  /** Ángulo de la manivela (sigue girando también durante el enredo, a trompicones). */
  manivela(t) {
    const f = this.fase(t);
    if (f != null) return f;
    const u = t - T_TROP;
    return 2 * Math.PI * N_TROPIEZO + 0.6 * Math.sin(u * 9) * (1 - u / 1.3);
  }
  puntaManivela(q, t) {
    const a = this.manivela(t), C = CR[q];
    return [C[0] + RMAN * Math.sin(a) * (q ? -1 : 1), C[1] + RMAN * Math.cos(a)];
  }
  /** Altura del salto con la fase φ (máxima cuando la comba pasa por debajo). */
  salto(phi, J) { const c = Math.cos(phi); return c > 0 ? J * Math.pow(c, 1.3) : 0; }
  /** Retraso de Guillermo (se cansa). */
  retraso(t) { return 1.65 * eIn(tramo(t, 3.4, T_TROP)); }
  poses(t = this.t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 158], manoI: [7, 160] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yG = 0, yM = 0, xg = XG, eG = ESC, sxG = 1, syG = 1, giroG = 0, piv = [39, 232];
    const phi = this.fase(t);
    // los dos saltan
    if (t >= T_ARRANCA && t < T_TROP) {
      const hM = this.salto(phi, 46), hG = this.salto(phi - this.retraso(t), 46);
      yM = -hM; yG = -hG;
      for (const [P, h] of [[G, hG], [M, hM]]) {
        P.piernaI = [-h * 0.12, 0.08 * h / 46]; P.piernaD = [-h * 0.12, -0.08 * h / 46];
        const br = Math.sin(phi * 1) * 8;
        if (P === G) { P.manoD = [79, 155 - br]; P.manoI = [0, 155 - br]; } else { P.manoD = [71, 150 - br]; P.manoI = [3, 150 - br]; }
      }
      G.cara = t < 3.0 ? "risa" : t < 4.0 ? "sonrisa" : t < 4.7 ? "sorpresa" : "dormido";
      M.cara = Math.floor(t * 2) % 3 === 0 ? "guino" : "risa";
      G.puntas = 0.4 * tramo(t, 4.2, T_TROP);
      if (t > 4.0) { M.rc = 0.1; if (t > 4.6) M.cara = "sorpresa"; }
    } else if (t >= T_TROP && t < T_SUELTA) {
      // enredado: da vueltas como una peonza
      const u = tramo(t, T_TROP, T_SUELTA), th = 2 * Math.PI * 3.25 * eInOut(tramo(t, T_TROP + 0.15, T_SUELTA));
      sxG = Math.max(0.24, Math.abs(Math.cos(th)));
      G.cara = t < T_TROP + 0.3 ? "sorpresa" : "borracho";
      G.manoD = [70, 112]; G.manoI = [8, 112]; G.puntas = 0.8;
      yG = -6 * Math.abs(Math.sin(th * 2)) - 10 * Math.sin(Math.PI * u);
      M.cara = t < T_TROP + 0.5 ? "sorpresa" : "risa"; M.rc = 0.12;
      M.manoD = [56, 58]; M.manoI = [-2, 122];
    } else if (t >= T_SUELTA) {
      // sale despedido al suelo, en primer plano, y se queda sentado y mareado
      const u = tramo(t, T_SUELTA, T_CAE);
      xg = lerp(XG, 236, eOut(u)); eG = lerp(ESC, 1.85, u);
      const yBase = lerp(PIES, 730, u) - 170 * Math.sin(Math.PI * u);
      giroG = -2 * Math.PI * eOut(u) * (t < T_CAE ? 1 : 0);
      if (t >= T_CAE) {
        const d = t - T_CAE;
        syG = 0.8 + 0.06 * Math.exp(-d * 6) * Math.sin(d * 30);
        G.piernaI = [0, 0.55]; G.piernaD = [0, -0.55];
        G.manoD = [96, 160]; G.manoI = [-18, 160];
        G.cara = "borracho"; G.rc = 0.15 * Math.sin(d * 3);
      } else { G.cara = "sorpresa"; G.manoD = [100, 60]; G.manoI = [-22, 60]; }
      yG = yBase - PIES;
      piv = t < T_CAE ? [39, 116] : [39, 232];
      if (t < T_CAE) yG -= 116 * eG;
      // Marcos: a doble velocidad
      if (t > T_SUELTA + 0.25) {
        const h = this.salto(phi, 26);
        yM = -h; M.piernaI = [-h * 0.15, 0.1 * h / 26]; M.piernaD = [-h * 0.15, -0.1 * h / 26];
        const br = Math.sin(phi) * 6;
        M.manoD = [71, 150 - br]; M.manoI = [3, 150 - br];
        M.cara = Math.floor(t * 3) % 2 ? "risa" : "guino"; M.rc = 0.04 * Math.sin(t * 9);
        M.puntas = 0.5;
      } else { M.cara = "risa"; M.manoD = [56, 58]; }
    }
    return [
      { pose: G, m: matAv(xg, PIES + yG, eG, giroG, sxG, syG, piv), x: xg },
      { pose: M, m: matAv(XM, PIES + yM, ESC) },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("brrm", t > 0.55, () => { temblar(5, 0.3); for (const C of CR) for (let k = 0; k < 8; k++) p.nueva(P.HUMO, C[0], C[1] + 60, azar(-60, 60), azar(-80, -20), azar(0.5, 0.9), azar(18, 28)); });
    this.una("rapido", t > 3.4, () => { temblar(6, 0.2); for (const C of CR) for (let k = 0; k < 10; k++) { const a = azar(0, 6.283), v = azar(120, 300); p.nueva(P.CHISPA, C[0], C[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); } });
    // golpecitos de la comba en el suelo
    const phi = this.fase(t);
    if (phi != null && t > T_ARRANCA) {
      const n = Math.floor((phi + Math.PI) / (2 * Math.PI));
      if (n !== this.nAnt) {
        if (this.nAnt != null && (t < T_TROP - 0.05 || t > T_SUELTA)) for (let k = 0; k < 4; k++) p.nueva(P.POLVO, azar(250, 780), PIES + 2, azar(-80, 80), azar(-30, -5), azar(0.3, 0.5), azar(12, 18));
        this.nAnt = n;
      }
    }
    // sudor de Guillermo
    if (t > 4.2 && t < T_TROP && Math.random() < 9 * dt) {
      const e = this.poses(t), lado = Math.random() < 0.5 ? -1 : 1, q = aPant(e[0].m, [39 + lado * 32, 26]);
      this.gotas.push({ x: q[0], y: q[1], vx: lado * azar(40, 120), vy: azar(-170, -60), v: 0.7 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("zas", t > T_TROP, () => {
      temblar(18, 0.4);
      p.nueva(P.DESTELLO, XG, PIES - 10, 0, 0, 0.35, 180);
      for (let k = 0; k < 22; k++) { const a = azar(-Math.PI, 0), v = azar(160, 420); p.nueva(P.CHISPA, XG, PIES - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11)); }
    });
    this.una("cae", t > T_CAE, () => {
      temblar(22, 0.45);
      for (let k = 0; k < 22; k++) p.nueva(P.POLVO, 236 + azar(-90, 90), 660, azar(-220, 220), azar(-100, -10), azar(0.6, 1), azar(30, 50));
    });
    this.una("x2", t > T_SUELTA + 0.6, () => {
      temblar(10, 0.25);
      for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(380, W - 30), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), k % 5);
    });
    p.suelo = () => PIES + 4;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Brazo mecánico: poste, motor con su esfera de velocidad y la manivela. */
  maquina(g, q, t) {
    const [cx, cy] = CR[q], s = q ? -1 : 1, bx = cx - s * 34;
    // poste y base
    g.fillStyle = "#3a3f49"; g.fillRect(bx - 7, cy + 40, 14, PIES - cy - 40);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(bx - 4, cy + 40, 3, PIES - cy - 40);
    g.fillStyle = "#23262c"; rectR(g, bx - 40, PIES - 12, 80, 16, 5); g.fill();
    // caja del motor
    const gr = g.createLinearGradient(bx - 36, 0, bx + 36, 0);
    gr.addColorStop(0, "#5a606a"); gr.addColorStop(0.45, "#a9b0ba"); gr.addColorStop(1, "#4a4f58");
    g.fillStyle = gr; rectR(g, bx - 36, cy - 44, 72, 92, 10); g.fill();
    g.strokeStyle = "#1c1f24"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#2a2d33"; for (const [rx, ry] of [[-28, -36], [28, -36], [-28, 40], [28, 40]]) { g.beginPath(); g.arc(bx + rx, cy + ry, 2.6, 0, 6.283); g.fill(); }
    // esfera de velocidad
    const f = this.velocidad(t);
    g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(bx, cy - 14, 18, Math.PI, 0); g.closePath(); g.fill();
    g.strokeStyle = "#1c1f24"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#e3262f"; g.beginPath(); g.arc(bx, cy - 14, 18, -0.6, 0); g.lineTo(bx, cy - 14); g.closePath(); g.fill();
    const an = Math.PI + Math.PI * clamp(f / 3, 0, 1) + (f > 2 ? 0.05 * Math.sin(t * 40) : 0);
    g.strokeStyle = "#111"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(bx, cy - 14); g.lineTo(bx + Math.cos(an) * 15, cy - 14 + Math.sin(an) * 15); g.stroke();
    // luz
    g.fillStyle = t > 0.55 ? "#2bff5b" : "#3a5a40"; g.beginPath(); g.arc(bx, cy + 22, 5, 0, 6.283); g.fill();
    if (t > 0.55) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB.verde, bx - 16, cy + 6, 32, 32); g.restore(); }
    // eje y manivela
    const P = this.puntaManivela(q, t);
    g.strokeStyle = "#2a2d33"; g.lineWidth = 9; g.lineCap = "round";
    g.beginPath(); g.moveTo(bx, cy); g.lineTo(cx, cy); g.stroke();
    g.strokeStyle = "#c9ced6"; g.lineWidth = 7; g.beginPath(); g.moveTo(cx, cy); g.lineTo(P[0], P[1]); g.stroke();
    g.fillStyle = "#e3262f"; g.beginPath(); g.arc(cx, cy, 7, 0, 6.283); g.fill();
    g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(P[0], P[1], 5, 0, 6.283); g.fill();
  }
  velocidad(t) {
    if (t < T_ARRANCA) return 0;
    if (t < T_TROP) return F0 + (F1 - F0) * Math.min(1, (t - T_ARRANCA) / RAMPA);
    if (t < T_SUELTA) return 0.3;
    return F2;
  }
  /** Puntos de la comba con una fase dada. */
  cuerda(t, phi) {
    const A = this.puntaManivela(0, t), B = this.puntaManivela(1, t);
    const y = (A[1] + B[1]) / 2 + RC * Math.cos(phi);
    const C1 = [A[0] + 230, y], C2 = [B[0] - 230, y];
    return [A, C1, C2, B];
  }
  trazar(g, P, ancho, col) {
    g.beginPath(); g.moveTo(P[0][0], P[0][1]); g.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]);
    g.lineCap = "round"; g.strokeStyle = "#5a0f1e"; g.lineWidth = ancho + 3; g.stroke();
    g.strokeStyle = col; g.lineWidth = ancho; g.stroke();
    g.setLineDash([10, 12]); g.strokeStyle = "rgba(255,255,255,.65)"; g.lineWidth = ancho * 0.45; g.stroke(); g.setLineDash([]);
  }
  /** La comba por detrás (true) o por delante (false) de los dos. */
  comba(g, t, detras) {
    const phi = this.fase(t);
    if (phi == null) {
      if (detras) return;
      // enrollada a Guillermo: de las manivelas a su cintura
      const e = this.poses(t)[0], W0 = aPant(e.m, [39, 150]), A = this.puntaManivela(0, t), B = this.puntaManivela(1, t);
      g.save(); g.lineCap = "round";
      for (const [P0, P1] of [[A, W0], [W0, B]]) {
        g.strokeStyle = "#5a0f1e"; g.lineWidth = 8; g.beginPath(); g.moveTo(P0[0], P0[1]); g.quadraticCurveTo((P0[0] + P1[0]) / 2, Math.max(P0[1], P1[1]) + 30, P1[0], P1[1]); g.stroke();
        g.strokeStyle = "#ff3d84"; g.lineWidth = 5; g.stroke();
      }
      g.restore();
      return;
    }
    const frente = Math.sin(phi) < 0;
    if (frente === detras) return;
    const rapido = this.velocidad(t) > 1.3;
    if (rapido) { // estela
      g.save(); g.globalAlpha *= 0.25;
      for (const d of [0.35, 0.7]) this.trazar(g, this.cuerda(t, phi - d), frente ? 5 : 3.5, "#ff3d84");
      g.restore();
    }
    this.trazar(g, this.cuerda(t, phi), frente ? 6.5 : 4.5, frente ? "#ff3d84" : "#c82a66");
  }
  /** Vueltas de cuerda alrededor de Guillermo (mientras gira y luego en los tobillos). */
  enredo(g, t, e, delante) {
    if (t < T_TROP) return;
    const vueltas = t < T_SUELTA ? Math.min(3, Math.floor(tramo(t, T_TROP, T_TROP + 0.5) * 3.99)) : 2;
    const ys = t < T_SUELTA ? [195, 170, 145] : [214, 202];
    conMat(g, e.m, () => {
      g.lineWidth = 4.2; g.lineCap = "round";
      for (let i = 0; i < vueltas; i++) {
        const y = ys[i];
        g.strokeStyle = delante ? "#ff3d84" : "#8a1a44";
        g.beginPath(); g.ellipse(39, y, t < T_SUELTA ? 34 : 30, 6, -0.08, delante ? 0 : Math.PI, delante ? Math.PI : 2 * Math.PI); g.stroke();
      }
    });
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, PIES, 400, 0.85);
    // suelo
    const gs = g.createLinearGradient(0, PIES - 10, 0, H);
    gs.addColorStop(0, "rgba(70,50,80,0)"); gs.addColorStop(0.25, "rgba(70,50,80,.6)"); gs.addColorStop(1, "rgba(25,18,30,.9)");
    g.fillStyle = gs; g.fillRect(-60, PIES - 10, W + 120, H - PIES + 80);
    this.maquina(g, 0, t); this.maquina(g, 1, t);
    g.fillStyle = "rgba(0,0,0,.4)";
    for (const x of [XG, XM]) { if (x === XG && t > T_SUELTA) continue; g.beginPath(); g.ellipse(x, PIES + 2, 48, 8, 0, 0, 6.283); g.fill(); }
    this.comba(g, t, true);
    const sentado = t > T_SUELTA;
    if (!sentado) { this.enredo(g, t, e[0], false); pintarAvatar(g, e[0].m, e[0].pose, t); this.enredo(g, t, e[0], true); }
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.comba(g, t, false);
    if (sentado) {
      g.fillStyle = "rgba(0,0,0,.45)"; if (t > T_CAE) { g.beginPath(); g.ellipse(236, 730, 120, 18, 0, 0, 6.283); g.fill(); }
      this.enredo(g, t, e[0], false); pintarAvatar(g, e[0].m, e[0].pose, t); this.enredo(g, t, e[0], true);
      // pajaritos de mareo
      if (t > T_CAE) {
        const c = aPant(e[0].m, [39, 0]);
        for (let i = 0; i < 3; i++) { const an = t * 4 + i * 2.09; brillo(g, c[0] + Math.cos(an) * 66, c[1] - 6 + Math.sin(an) * 14, 16, 1); }
      }
    }
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    g.restore();
    this.p.dibujar(g);
    // textos
    const pop = (s, t0, dur, x, y, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    pop("¡BRRRM!", 0.55, 0.8, 150, 270, 44, "#fffdf5", "#1b1b1b", -0.1);
    pop("¡BRRRM!", 0.6, 0.8, 874, 270, 44, "#fffdf5", "#1b1b1b", 0.1);
    pop("¡MÁS RÁPIDO!", 3.4, 0.9, 512, 330, 46, "#ffd34d", "#3a2400", -0.05);
    pop("¡ZAS!", T_TROP, 0.6, XG - 110, PIES - 60, 66, "#fffdf5", "#7a0008", -0.12);
    pop("¡PLAF!", T_CAE, 0.7, 400, 470, 60, "#ffd34d", "#3a2400", 0.1);
    pop("¡x2!", T_SUELTA + 0.6, 99, 780, 300, 72, "#2bff5b", "#002a0c", 0.12);
    // Marcos avisa
    if (t > 1.3 && t < 2.7) {
      const m = aPant(e[1].m, [37, 30]);
      g.save(); g.globalAlpha = a * (1 - tramo(t, 2.55, 2.7));
      bocadillo(g, 790, 150, "¡NO PISES!", m[0] + 14, m[1] - 30, tramo(t, 1.3, 1.55), 44);
      g.restore();
    }
    // ¡NO PISES! (el remate)
    if (t > T_TROP + 0.12) {
      const d = t - T_TROP - 0.12, k = tramo(d, 0, 0.17), s = lerp(2.5, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(512, 92); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(680, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#ffb3cf"); gr.addColorStop(1, "#ff3d84");
    txt(g, "¡NO PISES!", 340, 142, { tam: 130, peso: 900, fam: FD, color: gr, borde: "#3a0018", bordeAncho: 12, esp: 4, glow: "rgba(255,61,132,.85)", glowTam: 24, max: 640 });
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00166", nombre: "Salto a la comba", crear: () => new Comba() });
})();
