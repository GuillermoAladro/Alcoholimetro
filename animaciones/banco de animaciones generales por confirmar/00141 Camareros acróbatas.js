"use strict";
/*
 * 00141 · CAMAREROS ACRÓBATAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo, cada uno en una punta de una barra larga, se deslizan una jarra el uno al otro cada vez más
 * rápido (¡TAC!), con un salto mortal por el camino (¡HOP!), y la paran sin derramar ni gota. Rodrigo lanza la
 * última a toda mecha (¡DESLIZA!): pasa de largo por delante de Guillermo y se oye fuera… ¡CRASH!
 */
(() => {
const ESC = 1.7, AY = 650, BARRA = 470, S = 1.95;     // avatares y jarra (más grande, para que se vea bien)
const XG = 132, XR = 892;
const YJ = BARRA - 18 * S;                             // altura del asa de la jarra apoyada
const AG = XG + (86 - 39) * ESC;                       // asa de la jarra cuando la para Guillermo
const AR = XR + (-8 - 39) * ESC - 32 * S;              // asa cuando la para Rodrigo (su mano en el canto derecho)
// deslizamientos: [t0, duración, hacia (1 = hacia Rodrigo), salto mortal]
const DESL = [[0.8, 1.15, 1, 0], [2.25, 0.8, -1, 0], [3.3, 0.62, 1, 1], [4.15, 0.4, -1, 0], [4.8, 0.27, 1, 0]];
const T_FINAL = 5.55, V_FINAL = 2900, T_CRASH = 6.05, T_APAGA = 9.3;
const CT = cacheTexto();
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];

class Camareros extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(360);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, 9.85)); }
  /** La jarra: asa (x, y), giro, inclinación, si va volando y la velocidad (px/s, con signo). */
  jarra(t) {
    let x = AG, y = YJ, giro = 0, inc = 0, v = 0, quien = "G", tLlega = -9;
    for (const [t0, d, dir, salto] of DESL) {
      if (t < t0) break;
      const xa = dir > 0 ? AG : AR, xb = dir > 0 ? AR : AG;
      if (t < t0 + d) {
        const u = (t - t0) / d, f = lerp(u, eOut(u), 0.35);
        x = lerp(xa, xb, f); v = ((xb - xa) / d) * (1 - 0.35 * u);
        inc = -dir * 0.12;
        if (salto) { const s = tramo(u, 0.25, 0.75); y = YJ - Math.sin(s * Math.PI) * 120; giro = dir * s * 6.283; inc = 0; }
        quien = "";
      } else { x = xb; quien = dir > 0 ? "R" : "G"; tLlega = t0 + d; v = 0; }
    }
    if (tLlega > 0) { const d = t - tLlega; inc = (quien === "R" ? 1 : -1) * 0.16 * Math.exp(-d * 6) * Math.sin(d * 22); }
    if (t >= T_FINAL) { const d = t - T_FINAL; x = AR - V_FINAL * d; v = -V_FINAL; inc = 0.12; quien = ""; }
    return { x, y, giro, inc, v, quien };
  }
  poses() {
    const t = this.t, J = this.jarra(t);
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [8, 128] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true, manoD: [70, 128] };
    const cG = aU(XG, [AG, YJ]), cR = aU(XR, [AR + 32 * S, YJ]);   // donde tocan la jarra
    let gD = cG.slice(), rI = cR.slice(), giroG = 0, giroR = 0, dxG = 0, dxR = 0;
    // cada lanzamiento: el que empuja acompaña un poco; el otro espera con la mano lista
    for (const [t0, d, dir] of DESL) {
      const kE = eOut(tramo(t, t0, t0 + 0.12)) * (1 - eInOut(tramo(t, t0 + 0.15, t0 + 0.45)));
      const kPrep = eInOut(tramo(t, t0 - 0.3, t0 - 0.05)) * (1 - tramo(t, t0, t0 + 0.05));
      if (dir > 0) {
        gD = [cG[0] - 10 * kPrep + 30 * kE, cG[1] - 4 * kPrep];
        if (kE > 0.1) G.cara = "risa";
        if (t > t0 && t < t0 + d) { R.cara = d < 0.5 ? "sorpresa" : "guino"; dxR = 0; }
        if (t > t0 + d && t < t0 + d + 0.18) dxR = 6 * Math.sin(((t - t0 - d) / 0.18) * Math.PI);
      } else {
        rI = [cR[0] + 10 * kPrep - 30 * kE, cR[1] - 4 * kPrep];
        if (kE > 0.1) R.cara = "risa";
        if (t > t0 && t < t0 + d) G.cara = d < 0.5 ? "sorpresa" : "guino";
        if (t > t0 + d && t < t0 + d + 0.18) dxG = -6 * Math.sin(((t - t0 - d) / 0.18) * Math.PI);
      }
      // al recibir, se queda con la jarra un momento y guiña
      if (t > t0 + d && t < t0 + d + 0.35) { if (dir > 0) R.cara = "guino"; else G.cara = "guino"; }
    }
    // el viento de las rápidas les levanta el pelo
    G.puntas = 0.8 * Math.max(tramo(t, 4.45, 4.55) * (1 - tramo(t, 4.7, 5.1)), 0);
    R.puntas = 0.8 * tramo(t, 5.0, 5.08) * (1 - tramo(t, 5.3, 5.5));
    // la última: Rodrigo coge carrerilla…
    if (t > 5.1 && t < T_FINAL + 0.3) {
      const kA = eInOut(tramo(t, 5.1, 5.45)), kE = eOut(tramo(t, T_FINAL - 0.04, T_FINAL + 0.1));
      rI = [cR[0] + 26 * kA - 60 * kE, cR[1] - 10 * kA];
      giroR = 0.06 * kA - 0.1 * kE; dxR = 10 * kA - 20 * kE;
      R.cara = kE > 0 ? "risa" : "guino";
      G.cara = "sorpresa"; gD = [cG[0] + 6, cG[1] - 6];
    }
    // …y pasa de largo: Guillermo cierra la mano en el aire y se gira a mirarla
    if (t > T_FINAL) {
      const d = t - T_FINAL;
      const kM = eOut(tramo(d, 0.18, 0.3));
      gD = mezcla([cG[0] + 6, cG[1] - 6], [cG[0] - 30, cG[1] - 2], kM);
      G.cara = "sorpresa"; G.puntas = 1 - tramo(d, 0.8, 1.6);
      G.rc = -0.3 * eOut(tramo(d, 0.2, 0.4)) * (1 - eInOut(tramo(d, 1.4, 1.8)));
      giroG = -0.08 * eOut(tramo(d, 0.2, 0.4)) * (1 - eInOut(tramo(d, 1.4, 1.8)));
      R.cara = d < 0.45 ? "risa" : "sorpresa";
      if (d > 0.3) rI = mezcla(rI, aU(XR, [XR - 20, AY - 168 * ESC]), eInOut(tramo(d, 0.3, 0.55)));
      R.rc = 0.06 * Math.sin(d * 4);
      // ¡CRASH!: se encogen
      if (t > T_CRASH && t < T_CRASH + 0.5) { G.cara = "dormido"; R.cara = "dormido"; }
      // se miran: «¿y ahora quién la paga?»
      if (t > 7.3) {
        const k = eInOut(tramo(t, 7.3, 7.55));
        G.rc = 0.15 * k; R.rc = -0.15 * k + 0.06 * Math.sin(d * 4) * (1 - k);
        G.cara = t > 8.2 ? "guino" : "sorpresa"; R.cara = t > 8.0 ? "risa" : "guino";
        gD = mezcla(gD, [96, 40], eInOut(tramo(t, 8.2, 8.5)));
      }
    }
    G.manoD = gD; R.manoI = rI;
    void J;
    return [{ pose: G, m: matAv(XG + dxG, AY, ESC, giroG) }, { pose: R, m: matAv(XR + dxR, AY, ESC, giroR) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, J = this.jarra(t);
    DESL.forEach(([t0, d, dir, salto], i) => {
      this.una("sale" + i, t > t0, () => temblar(3, 0.1));
      this.una("llega" + i, t > t0 + d, () => {
        temblar(d < 0.5 ? 9 : 5, 0.18);
        const x = dir > 0 ? AR + 32 * S : AG;
        p.nueva(P.DESTELLO, x, YJ, 0, 0, 0.25, 90);
        for (let k = 0; k < 7; k++) p.nueva(P.ESPUMA, (dir > 0 ? AR : AG) + 16 * S + azar(-10, 10), YJ - 20 * S, azar(-40, 40), azar(-120, -40), azar(0.3, 0.5), azar(3, 6));
        if (salto) for (let k = 0; k < 12; k++) { const a = azar(-Math.PI, 0), v = azar(100, 300); p.nueva(P.CHISPA, x, YJ, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(6, 9)); }
      });
    });
    // estela de las rápidas
    if (Math.abs(J.v) > 900 && Math.random() < 60 * dt) p.nueva(P.POLVO, J.x + 16 * S, BARRA - 6, -Math.sign(J.v) * azar(20, 80), azar(-30, -5), azar(0.25, 0.45), azar(14, 22));
    if (t > T_FINAL && t < T_FINAL + 0.35) for (let k = 0; k < 3; k++) p.nueva(P.LLAMA, J.x + 40 * S + azar(0, 30), J.y + azar(-10, 30), azar(60, 200), azar(-40, 20), azar(0.2, 0.4), azar(30, 50), 1);
    this.una("ultima", t > T_FINAL, () => temblar(14, 0.3));
    this.una("crash", t > T_CRASH, () => {
      temblar(26, 0.6);
      for (let k = 0; k < 26; k++) { const a = azar(-1.5, -0.6), v = azar(250, 650); p.nueva(P.CHISPA, -10, azar(400, 470), Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 12)); }
      for (let k = 0; k < 14; k++) p.nueva(P.GOTA, -5, azar(420, 470), azar(30, 200), azar(-650, -300), 1, azar(3, 6));
      for (let k = 0; k < 8; k++) p.nueva(P.ESPUMA, -5, azar(420, 470), azar(30, 180), azar(-420, -200), azar(0.5, 0.9), azar(6, 11));
    });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondo(g, a) {
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, BARRA, 470, 0.75);
    g.globalAlpha = 0.45 * a;
    for (const yb of [250, 350]) {
      g.fillStyle = "#3a2516"; g.fillRect(260, yb, 504, 7);
      for (let i = 0; i < 13; i++) {
        const x = 280 + i * 38 + (yb > 300 ? 14 : 0), h = 46 + ((i * 7 + yb) % 3) * 9;
        g.fillStyle = ["#2f6b3a", "#7a3b16", "#3b4d7a", "#6b5a1a"][(i + (yb > 300 ? 1 : 0)) % 4];
        rectR(g, x - 9, yb - h, 18, h, 4); g.fill(); g.fillRect(x - 4, yb - h - 13, 8, 15);
      }
    }
    g.restore();
  }
  barra(g) {
    const gr = this.grB || (this.grB = (() => { const q = g.createLinearGradient(0, BARRA, 0, H); q.addColorStop(0, "#5a3218"); q.addColorStop(1, "#24130a"); return q; })());
    g.fillStyle = gr; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 562, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 563, W + 120, 2);
    // tablero pulido (brilla donde pasa la jarra)
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), J = this.jarra(t);
    fondo(g, "#000");
    this.fondo(g, a);
    g.save(); g.globalAlpha = a;
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.barra(g);
    // reflejo y líneas de velocidad
    const vel = Math.abs(J.v);
    if (vel > 500) {
      g.save(); g.strokeStyle = vel > 1500 ? "#ffd34d" : "#fff3c4"; g.lineCap = "round";
      g.globalAlpha = a * clamp((vel - 500) / 1500, 0.25, 0.9);
      const sgn = Math.sign(J.v), cx = J.x + 16 * S;
      for (let i = 0; i < 5; i++) { const y = J.y - 18 + i * 12, L = 60 + vel * 0.06 + (i % 2) * 30; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - sgn * 34, y); g.lineTo(cx - sgn * (34 + L), y); g.stroke(); }
      g.restore();
    }
    // la jarra
    if (J.x > -200) {
      g.save(); g.translate(J.x + 16 * S, J.y); g.rotate(J.giro); g.translate(-16 * S, 0); g.scale(S, S);
      dibujarJarra(g, [0, 0], J.inc, 1, "asa", t); dibujarJarra(g, [0, 0], J.inc, 1, "cuerpo", t);
      g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    // ¡TAC! al pararla y ¡HOP! en el salto
    DESL.forEach(([t0, d, dir, salto]) => {
      const dd = t - t0 - d;
      if (dd > 0 && dd < 0.5) {
        const k = eBack(tramo(dd, 0, 0.1)), x = dir > 0 ? AR + 32 * S - 40 : AG + 40;
        g.save(); g.translate(x, YJ - 70); g.rotate(dir > 0 ? 0.12 : -0.12); g.scale(k, k);
        txt(g, "¡TAC!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(dd, 0.35, 0.5)) });
        g.restore();
      }
      if (salto) {
        const ds = t - (t0 + d * 0.35);
        if (ds > 0 && ds < 0.7) {
          const k = eBack(tramo(ds, 0, 0.12));
          g.save(); g.translate(512, 230); g.rotate(-0.08); g.scale(k, k);
          txt(g, "¡HOP!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#2fe3e8", borde: "#06303a", bordeAncho: 9, esp: 3, alfa: a * (1 - tramo(ds, 0.5, 0.7)) });
          g.restore();
        }
      }
    });
    // ¡CRASH! fuera de la pantalla
    const dC = t - T_CRASH;
    if (dC > 0 && dC < 1.4) {
      const k = eBack(tramo(dC, 0, 0.12));
      g.save(); g.translate(120 + azar(-2, 2), 218); g.rotate(-0.2); g.scale(k, k);
      txt(g, "¡CRASH!", 0, 0, { tam: 74, peso: 400, fam: FC, color: "#ffe0b0", borde: "#4a0d00", bordeAncho: 10, esp: 3, alfa: a * (1 - tramo(dC, 1.1, 1.4)) });
      g.restore();
    }
    // ¡DESLIZA!
    if (t > T_FINAL - 0.05) {
      const d = t - T_FINAL + 0.05, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(566 - 40 * (1 - k), 118); g.transform(1, 0, -0.18, 1, 0, 0); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(820, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 60, 0, 170);
    gr.addColorStop(0, "#f0feff"); gr.addColorStop(0.5, "#8ff3f6"); gr.addColorStop(1, "#1fb8c4");
    // líneas de velocidad detrás
    g.strokeStyle = "rgba(47,227,232,.55)"; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { g.lineWidth = 6 - i * 0.6; g.beginPath(); g.moveTo(600 + i * 30, 70 + i * 22); g.lineTo(800, 70 + i * 22); g.stroke(); }
    txt(g, "¡DESLIZA!", 400, 168, { tam: 160, peso: 900, fam: FD, color: gr, borde: "#032a30", bordeAncho: 12, esp: 6, glow: "rgba(47,227,232,.85)", glowTam: 26, max: 740 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00141", nombre: "Camareros acróbatas", crear: () => new Camareros() });
})();
