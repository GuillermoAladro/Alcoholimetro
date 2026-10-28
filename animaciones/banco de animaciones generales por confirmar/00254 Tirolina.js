"use strict";
/*
 * 00254 · TIROLINA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Prácticas de rescate en el parque: Guillermo, con arnés y casco amarillo, está arriba de la torre agarrado a la
 * polea de la tirolina y le tiemblan las rodillas (¡GLUPS!). Marcos, abajo, cuenta: 3, 2, 1… ¡YA! Guillermo se
 * lanza y baja chillando a toda velocidad (¡YUJUUU!), cada vez más cerca. Al final Marcos salta y lo coge al vuelo
 * (¡HOP!); la polea sigue sola hasta el tope (¡CLONC!). En brazos de Marcos, Guillermo pide ¡OTRA!
 */
(() => {
const CT = cacheTexto();
const A = [150, 55], B = [880, 255];            // cable: de la torre al poste
const E0 = 0.55, E1 = 1.2, ESC_M = 1.2;
const XM = 690;
const T_CUENTA = [1.2, 1.6, 2.0, 2.4], T_SALTA = 2.75, T_COGE = 4.45, T_TOPE = 4.75, T_SUELO = 4.9, T_OTRA = 5.7, T_RISA = 6.55, T_APAGA = 9.0, DUR = 9.55;
const COLGADO = [39, -40];                       // la polea, en unidades de avatar

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

class Tirolina extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.p.suelo = () => PIES + 6;
  }
  luz() { return tramo(this.t, 0.02, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** Avance por el cable (0 = torre, 1 = poste). */
  avance(t) {
    if (t < T_SALTA) return 0;
    const u = tramo(t, T_SALTA, T_COGE);
    return 0.76 * (0.25 * u + 0.75 * u * u);
  }
  polea(t) {
    let u = this.avance(t);
    if (t > T_COGE) u = lerp(0.76, 0.985, eOut(tramo(t, T_COGE, T_TOPE)));
    if (t > T_TOPE) u = 0.985 - 0.03 * Math.exp(-(t - T_TOPE) * 4) * Math.abs(Math.sin((t - T_TOPE) * 14));
    return [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
  }
  poses() {
    const t = this.t;
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [86, 14], manoI: [-8, 14], brazoIDelante: false, casco: true, cascoColor: "#f2c21b" };
    const M = { quien: "bombero", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let mG, ym = PIES, xm = XM, syM = 1, colgado = true;
    // ---- Guillermo arriba: tiembla
    if (t < T_SALTA) {
      const s = Math.sin(t * 38);
      G.piernaI = [0, 0.06 * s]; G.piernaD = [0, -0.06 * s];
      G.cara = t < 1.0 ? "sorpresa" : (Math.floor(t * 2) % 2 ? "sorpresa" : "dormido"); G.rc = 0.1 * Math.sin(t * 2.2);
      if (t > T_CUENTA[3] - 0.1) { G.cara = "dormido"; G.rc = 0.18 * Math.sin(t * 20); }
      mG = matAv(A[0], A[1], E0, 0, 1, 1, COLGADO);
    } else if (t < T_COGE) {
      // ¡YUJUUU!: baja balanceándose, cada vez más cerca
      const u = this.avance(t), p = this.polea(t), e = lerp(E0, E1 * 0.9, u / 0.76);
      const sw = 0.28 * Math.exp(-(t - T_SALTA) * 1.2) * Math.cos((t - T_SALTA) * 5) + 0.12;
      const s = Math.sin(t * 16);
      G.piernaI = [-10 * Math.max(0, s), 0.25 + 0.15 * s]; G.piernaD = [-10 * Math.max(0, -s), -0.25 + 0.15 * s];
      G.cara = t < T_SALTA + 0.35 ? "sorpresa" : "risa"; G.puntas = 1; G.rc = -0.1 + 0.05 * Math.sin(t * 22);
      mG = matAv(p[0], p[1], e, sw, 1, 1, COLGADO);
    } else {
      colgado = false;
    }
    // ---- Marcos: cuenta, salta y lo coge
    if (t < T_CUENTA[0] - 0.2) { M.cara = "risa"; M.manoI = [-14, 40 + 6 * Math.sin(t * 12)]; M.rc = -0.12; }
    else if (t < T_SALTA) {
      M.cara = "guino"; M.rc = -0.14; M.manoI = [-10, 46];
      if (t > T_CUENTA[3]) { M.manoI = [-22, 30]; M.cara = "risa"; }
    } else if (t < T_COGE - 0.3) {
      M.cara = "sorpresa"; M.rc = -0.1 - 0.15 * tramo(t, T_SALTA, T_COGE); M.manoD = [80, 96]; M.manoI = [-6, 96]; M.brazoIDelante = true;
      xm = XM + 10 * Math.sin(t * 3);
    }
    if (t >= T_COGE - 0.3 && t < T_SUELO) {
      // salta a por él
      const u = tramo(t, T_COGE - 0.3, T_SUELO);
      ym -= Math.sin(u * Math.PI) * 70; M.cara = "guino"; M.manoD = [88, 70]; M.manoI = [-14, 70]; M.brazoIDelante = true; M.rc = 0;
      M.piernaI = [-12 * Math.sin(u * Math.PI), 0.2]; M.piernaD = [-12 * Math.sin(u * Math.PI), -0.2];
    }
    if (t >= T_SUELO) {
      // aterriza con él en brazos
      const d = t - T_SUELO;
      syM = 1 - 0.08 * Math.exp(-d * 5) * Math.abs(Math.cos(d * 12));
      M.manoD = [72, 118]; M.manoI = [0, 118]; M.brazoIDelante = true;
      M.cara = d < 0.4 ? "sorpresa" : "risa"; M.rc = -0.1;
      if (t > T_OTRA && t < T_RISA) { M.cara = "dormido"; M.rc = 0.12 * Math.sin((t - T_OTRA) * 6); }
      if (t > T_RISA) { M.cara = Math.floor(t * 1.3) % 2 ? "risa" : "guino"; M.rc = -0.08 + 0.04 * Math.sin(t * 14); ym -= Math.abs(Math.sin(t * 14)) * 3; }
    }
    const mM = matAv(xm, ym, ESC_M, 0, 1, syM);
    if (!colgado) {
      // en brazos: Guillermo tumbado delante del pecho de Marcos
      const pecho = aPant(mM, [37, 112]);
      const kc = eOut(tramo(t, T_COGE, T_COGE + 0.3));
      const p0 = this.polea(T_COGE), e0 = lerp(E0, E1 * 0.9, 1);
      const m0 = matAv(p0[0], p0[1], e0, 0.12, 1, 1, COLGADO), c0 = aPant(m0, [39, 142]);
      const c = mezcla(c0, [pecho[0] + 14, pecho[1]], kc);
      const giro = lerp(0.12, -Math.PI / 2 + 0.12, kc);
      mG = matAv(c[0], c[1], lerp(e0, E1, kc), giro, 1, 1, [39, 142]);
      G.cara = t < T_SUELO + 0.3 ? "sorpresa" : "risa"; G.puntas = Math.max(0, 1 - (t - T_COGE) * 1.5);
      G.manoD = [96, 40 + 6 * Math.sin(t * 10)]; G.manoI = [-10, 120]; G.brazoIDelante = false;
      G.piernaI = [-6, 0.2 + 0.1 * Math.sin(t * 9)]; G.piernaD = [-6, -0.1 + 0.1 * Math.sin(t * 9 + 1)];
      G.rc = 0.2;
      if (t > T_OTRA) { G.manoD = [100, 20 + 10 * Math.sin(t * 14)]; G.manoI = [-24, 30]; G.cara = "risa"; }
      if (t > T_RISA) { G.cara = Math.floor(t * 1.3 + 1) % 2 ? "risa" : "guino"; }
    }
    // arnés
    G.objD = (g) => {
      g.fillStyle = "#e11e14"; rectR(g, 14, 134, 50, 10, 3); g.fill();
      g.fillStyle = "#1b1b1b"; g.fillRect(34, 133, 10, 12);
      g.strokeStyle = "#e11e14"; g.lineWidth = 5; g.beginPath(); g.moveTo(20, 144); g.lineTo(26, 166); g.moveTo(58, 144); g.lineTo(52, 166); g.stroke();
      g.fillStyle = "#c9d0d6"; g.beginPath(); g.arc(39, 139, 3.5, 0, 6.283); g.fill();
    };
    return { G, M, mG, mM, colgado };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.poses();
    this.una("salta", t > T_SALTA, () => temblar(6, 0.2));
    if (e.colgado && t > T_SALTA && Math.random() < 30 * dt) {
      const q = this.polea(t);
      p.nueva(P.CHISPA, q[0], q[1], azar(-160, -60), azar(-80, 20), azar(0.2, 0.4), azar(4, 7));
    }
    this.una("coge", t > T_COGE, () => { temblar(14, 0.35); const c = aPant(e.mM, [37, 100]); p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.3, 200); for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(140, 320); p.nueva(P.CHISPA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 9)); } });
    this.una("tope", t > T_TOPE, () => { temblar(6, 0.2); for (let i = 0; i < 8; i++) { const a = azar(0, 6.283), v = azar(100, 220); p.nueva(P.CHISPA, B[0] - 16, B[1] - 4, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); } });
    this.una("suelo", t > T_SUELO, () => { temblar(10, 0.3); for (let i = 0; i < 14; i++) p.nueva(P.POLVO, XM + azar(-60, 60), PIES, azar(-160, 160), azar(-60, -10), azar(0.5, 0.9), azar(22, 36)); });
    this.una("risa", t > T_RISA, () => { for (let i = 0; i < 80; i++) p.nueva(P.CONFETI, azar(40, 980), azar(-60, 0), azar(-40, 40), azar(30, 160), azar(2.2, 3.2), azar(9, 14), (Math.random() * 5) | 0); });
    p.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 470);
    gc.addColorStop(0, "#3a8ae0"); gc.addColorStop(1, "#d8eefa");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 560);
    g.fillStyle = "rgba(255,255,255,.85)";
    for (const [x, y, s] of [[420, 90, 1], [700, 50, 1.2], [980, 130, 0.8]]) for (const [dx, dy, r] of [[0, 0, 20], [22, -9, 26], [48, 0, 20], [24, 8, 20]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    // edificio del parque al fondo
    g.fillStyle = "#c9b48a"; g.fillRect(300, 360, 800, 130);
    g.fillStyle = "#e8dcc4"; g.fillRect(300, 352, 800, 10);
    for (let x = 340; x < 1000; x += 140) { g.fillStyle = "#9aa3ab"; g.fillRect(x, 392, 100, 98); g.fillStyle = "rgba(0,0,0,.15)"; for (let y = 398; y < 490; y += 10) g.fillRect(x, y, 100, 2); }
    // torre de prácticas
    const gt = g.createLinearGradient(40, 0, 250, 0);
    gt.addColorStop(0, "#7a2a1a"); gt.addColorStop(0.5, "#b4513a"); gt.addColorStop(1, "#7a2a1a");
    g.fillStyle = gt; g.fillRect(50, 210, 200, 290);
    g.fillStyle = "rgba(60,20,10,.35)"; for (let y = 210; y < 500; y += 16) for (let x = (y / 16) % 2 ? 50 : 66; x < 250; x += 32) { g.fillRect(x, y, 30, 2); g.fillRect(x, y, 2, 16); }
    for (const y of [260, 340, 420]) for (const x of [80, 170]) { g.fillStyle = "#1a2230"; g.fillRect(x, y, 50, 52); g.fillStyle = "#e8dcc4"; g.fillRect(x - 4, y + 52, 58, 6); }
    // plataforma con barandilla
    g.fillStyle = "#5d656e"; g.fillRect(36, 202, 228, 10);
    g.strokeStyle = "#f2c21b"; g.lineWidth = 4; g.beginPath(); g.moveTo(40, 202); g.lineTo(40, 168); g.lineTo(100, 168); g.moveTo(200, 168); g.lineTo(260, 168); g.lineTo(260, 202); g.stroke();
    g.beginPath(); for (const x of [70, 230]) { g.moveTo(x, 202); g.lineTo(x, 168); } g.stroke();
    // mástil del cable
    g.fillStyle = "#3a4048"; g.fillRect(A[0] - 52, 30, 10, 176); g.fillRect(A[0] - 56, 40, A[0] - 92 + 60, 8);
    // poste del final
    g.fillStyle = "#3a4048"; g.fillRect(B[0] + 6, B[1] - 20, 14, 500 - B[1] + 20);
    g.fillStyle = "#2a2e33"; g.fillRect(B[0] - 4, B[1] - 26, 34, 12);
    // suelo
    const gs = g.createLinearGradient(0, 490, 0, H + 60);
    gs.addColorStop(0, "#8a8a80"); gs.addColorStop(1, "#4a4a44");
    g.fillStyle = gs; g.fillRect(-60, 490, W + 120, H + 60 - 490);
    g.fillStyle = "#f2c21b"; g.fillRect(-60, 502, W + 120, 5);
    // colchoneta azul bajo el final
    g.fillStyle = "#2f7ae8"; rectR(g, 560, 548, 330, 34, 8); g.fill();
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(568, 552, 314, 6);
    CT.set("fondo", c);
    return c;
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(860, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff1a8"); gr.addColorStop(1, "#ffb21f");
    txt(g, "¡YUJUUU!", 436, 160, { tam: 156, peso: 400, fam: FC, color: "#2a1200", esp: 6 });
    txt(g, "¡YUJUUU!", 430, 154, { tam: 156, peso: 400, fam: FC, color: gr, borde: "#2a1200", bordeAncho: 14, esp: 6, glow: "rgba(255,190,40,.85)", glowTam: 26 });
    CT.set("tit", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // cable
    g.strokeStyle = "#2a2a30"; g.lineWidth = 3; g.beginPath(); g.moveTo(A[0] - 50, A[1] - 8); g.lineTo(A[0], A[1]); g.lineTo(B[0] + 10, B[1]); g.stroke();
    // tope
    g.fillStyle = "#f2c21b"; rectR(g, B[0] - 30, B[1] - 12, 22, 20, 4); g.fill();
    // polea y barra (detrás de Guillermo)
    const q = this.polea(t);
    const barra = (m) => conMat(g, m, () => {
      g.strokeStyle = "#3a4048"; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(-12, 14); g.lineTo(39, -36); g.lineTo(90, 14); g.stroke();
      g.strokeStyle = "#e11e14"; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(-14, 14); g.lineTo(92, 14); g.stroke();
    });
    if (e.colgado) barra(e.mG);
    else if (t < T_TOPE + 0.6) {
      // la barra sigue sola hasta el tope
      const e0 = E1 * 0.9;
      barra(matAv(q[0], q[1], e0, 0.3 * Math.sin((t - T_COGE) * 9) * Math.exp(-(t - T_COGE) * 2), 1, 1, COLGADO));
    } else barra(matAv(q[0], q[1], E1 * 0.9, 0.05 * Math.sin(t * 4), 1, 1, COLGADO));
    g.fillStyle = "#f2c21b"; rectR(g, q[0] - 14, q[1] - 6, 28, 14, 4); g.fill();
    g.fillStyle = "#2a2a30"; for (const dx of [-7, 7]) { g.beginPath(); g.arc(q[0] + dx, q[1] - 1, 5, 0, 6.283); g.fill(); }
    // líneas de velocidad
    if (e.colgado && t > T_SALTA + 0.2) {
      const k = this.avance(t) / 0.76, c = aPant(e.mG, [39, 80]);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.4 + 0.5 * k})`; g.lineWidth = 3 + 3 * k; g.lineCap = "round";
      const dx = A[0] - B[0], dy = A[1] - B[1], L = Math.hypot(dx, dy);
      for (let i = 0; i < 5; i++) { const ox = -40 - i * 10, oy = -60 + i * 40; g.beginPath(); g.moveTo(c[0] + ox, c[1] + oy); g.lineTo(c[0] + ox + dx / L * 120 * k, c[1] + oy + dy / L * 120 * k); g.stroke(); }
      g.restore();
    }
    if (e.colgado) { pintarAvatar(g, e.mM, e.M, t); pintarAvatar(g, e.mG, e.G, t); }
    else { pintarAvatar(g, e.mM, e.M, t); pintarAvatar(g, e.mG, e.G, t); }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    ono("¡GLUPS!", 300, 150, 0.55, 0.6, 40, "#fffdf5", "#1b1b1b", 0.1);
    const nums = ["3", "2", "1", "¡YA!"];
    T_CUENTA.forEach((x, i) => { if (t > x && t < x + 0.38) bocadillo(g, XM - 120, 230, nums[i], XM - 30, 300, tramo(t, x, x + 0.08), i === 3 ? 44 : 50); });
    // el grito, que viaja con él y crece
    if (e.colgado && t > T_SALTA) {
      const k = this.avance(t) / 0.76, s = 0.45 + 0.3 * k, c = [600 + 6 * Math.sin(t * 23), 78];
      g.save(); g.translate(c[0], c[1]); g.rotate(-0.08 + 0.04 * Math.sin(t * 20)); g.scale(s * eBack(tramo(t, T_SALTA, T_SALTA + 0.15)), s * eBack(tramo(t, T_SALTA, T_SALTA + 0.15)));
      const r = this.titulo(); g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    ono("¡HOP!", XM + 150, 300, T_COGE, 0.5, 52, "#2fe3e8", "#06303a", 0.1);
    ono("¡CLONC!", B[0] - 20, B[1] - 50, T_TOPE, 0.55, 40, "#fffdf5", "#1b1b1b", -0.1);
    if (t > T_OTRA && t < T_RISA + 0.3) bocadillo(g, 380, 280, "¡OTRA!", 520, 360, tramo(t, T_OTRA, T_OTRA + 0.12) * (1 - tramo(t, T_RISA + 0.1, T_RISA + 0.3)), 50);
    // ¡YUJUUU! de título al cogerlo
    if (t > T_COGE) {
      const d = t - T_COGE, k = tramo(d, 0, 0.25), r = this.titulo();
      const c0 = [600, 78], c1 = [512, 96];
      const c = mezcla(c0, c1, eOut(k)), s = lerp(0.75, 0.9, eBack(k)) * (1 + 0.03 * Math.sin(d * 7));
      g.save(); g.translate(c[0], c[1]); g.rotate(-0.05); g.scale(s, s); g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00254", nombre: "Tirolina", crear: () => new Tirolina() });
})();
