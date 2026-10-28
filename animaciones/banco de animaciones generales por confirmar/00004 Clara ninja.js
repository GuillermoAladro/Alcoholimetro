"use strict";
/*
 * 00004 · CLARA NINJA
 *
 * Animación del banco. Empieza y acaba en negro.
 * ¡POF! Aparece en una nube de humo con una cinta de ninja en la frente. Lanza un limón al aire y lo corta en rodajas
 * de un golpe de mano (¡HAI-YA!, destellos). Las rodajas caen en su caña, que se vuelve clara: CLARA LISTA. Saluda y
 * desaparece en otra nube de humo; al momento la caña también se esfuma (ha vuelto a por ella).
 */
(() => {
const X = 375, ESC = 1.6;
const MESA = [640, 440];                 // centro del tablero de la mesa alta
const VASO = { x: 640, base: 438, w: 62, h: 104 };
const T_POF = 0.3, T_LANZA = 1.95, T_CORTE = 3.05, T_VETE = 6.0, T_VASO = 6.55;

class EscenaNinja extends Escena {
  constructor() {
    super(8.6);
    this.p = new Parts(480);
    this.rodajas = []; this.cortado = false; this.vasoFuera = false; this.ultima = null;
  }
  aPantalla(p) { return aPant(matAv(X, PIES, ESC), p); }
  /** Limón en el aire (pantalla). */
  limon() {
    const t = this.t;
    const a = this.aPantalla([84, 52]), c = this.aPantalla([108, 70]); // de la mano al punto del corte
    const T = T_CORTE - T_LANZA, s = clamp(t - T_LANZA, 0, T), gr = 1100;
    const vy = (c[1] - a[1] - 0.5 * gr * T * T) / T;
    return { x: lerp(a[0], c[0], s / T), y: a[1] + vy * s + 0.5 * gr * s * s, r: s * 9 };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "guino", rc: 0, piernaI: [0, 0.1], piernaD: [0, -0.1] };
    let manoD = [52, 108], manoI = [27, 108], sy = 0.97;
    pose.brazoIDelante = true;
    // aparece en guardia; saca el limón
    if (t > 1.3) manoD = mezcla(manoD, [76, 120], eInOut(tramo(t, 1.3, 1.6)));
    if (t > 1.3) manoI = mezcla(manoI, [-6, 132], eInOut(tramo(t, 1.3, 1.6)));
    // lo lanza
    if (t > 1.75) manoD = mezcla([76, 120], [84, 52], eOut(tramo(t, 1.75, T_LANZA)));
    // mano en alto, de canto… y ¡corte!
    if (t > T_LANZA) manoD = mezcla([84, 52], [100, 14], eInOut(tramo(t, T_LANZA + 0.15, 2.6)));
    if (t > 2.6) { pose.cara = "sorpresa"; pose.rc = -0.06; manoI = [-14, 118]; }
    if (t > T_CORTE - 0.07) { manoD = mezcla([100, 14], [128, 128], eOut(tramo(t, T_CORTE - 0.07, T_CORTE + 0.02))); pose.cara = "risa"; pose.rc = 0.05; sy = 0.93; }
    if (t > T_CORTE + 0.6) { manoD = mezcla([128, 128], [52, 108], eInOut(tramo(t, T_CORTE + 0.6, T_CORTE + 1.0))); manoI = mezcla([-14, 118], [27, 108], eInOut(tramo(t, T_CORTE + 0.6, T_CORTE + 1.0))); sy = lerp(0.93, 0.97, tramo(t, T_CORTE + 0.6, T_CORTE + 1.0)); }
    // reverencia de ninja
    if (t > 4.6) {
      const k = Math.sin(tramo(t, 4.7, 5.5) * Math.PI);
      pose.cara = k > 0.3 ? "dormido" : "guino"; pose.rc = 0.12 * k; sy = 0.97 - 0.06 * k;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    // limón en la mano antes de lanzarlo
    if (t > 1.4 && t < T_LANZA) pose.objD2 = (g, m) => { g.save(); g.translate(m[0] + 2, m[1] - 9); g.scale(1 / ESC, 1 / ESC); this.dibujarLimon(g, 0, 0, 0.3); g.restore(); };
    const m = matAv(X, PIES, ESC, 0, 1, sy);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    const humo = (x, y, n, fuerza) => {
      temblar(14, 0.3);
      for (let i = 0; i < n; i++) { const a = azar(0, 6.283), v = azar(60, 380) * fuerza; p.nueva(i % 3 ? P.VAPOR : P.HUMO, x + azar(-40, 40), y + azar(-120, 120), Math.cos(a) * v, Math.sin(a) * v * 0.7 - 40, azar(0.7, 1.5), azar(50, 110)); }
      p.nueva(P.DESTELLO, x, y, 0, 0, 0.4, 260);
    };
    this.una("pof", t > T_POF, () => humo(X, PIES - 190, 70, 1));
    this.una("sale", t > 1.4, () => { const q = aPant(e.m, [78, 110]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 60); });
    // ¡corte!
    this.una("corte", t > T_CORTE, () => {
      this.cortado = true; temblar(20, 0.4);
      const L = this.limon();
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, L.x, L.y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
      p.nueva(P.DESTELLO, L.x, L.y, 0, 0, 0.5, 200);
      for (let i = 0; i < 10; i++) p.nueva(P.GOTA, L.x, L.y, azar(-260, 260), azar(-300, 50), 0.7, azar(2, 3.5));
      // las rodajas: saltan y van cayendo en la caña una a una
      for (let i = 0; i < 5; i++) {
        const t0 = T_CORTE + 0.18 + i * 0.05, t1 = 3.55 + i * 0.13;
        this.rodajas.push({ x0: L.x + (i - 2) * 9, y0: L.y + (i - 2) * 3, t0, t1, dx: (i - 2) * 9, r0: azar(0, 6), vr: azar(-14, 14), cayo: false, i });
      }
    });
    for (const R of this.rodajas) this.una("plaf" + R.i, t > R.t1, () => {
      R.cayo = true; temblar(4, 0.1);
      const sup = VASO.base - VASO.h * 0.78;
      for (let k = 0; k < 7; k++) p.nueva(P.GOTA, VASO.x + R.dx, sup, azar(-140, 140), azar(-300, -120), 0.6, azar(2.5, 4));
      for (let k = 0; k < 4; k++) p.nueva(P.ESPUMA, VASO.x + R.dx, sup, azar(-60, 60), azar(-160, -60), 0.5, azar(3, 6));
    });
    this.una("lista", t > 4.3, () => { temblar(8, 0.2); for (let i = 0; i < 16; i++) p.nueva(P.CONFETI, VASO.x + azar(-120, 120), 250, azar(-80, 80), azar(-240, -60), azar(1.4, 2), azar(8, 13), (Math.random() * 5) | 0); });
    this.una("vete", t > T_VETE, () => humo(X, PIES - 190, 70, 1));
    this.una("vaso", t > T_VASO, () => { this.vasoFuera = true; humo(VASO.x, VASO.base - 60, 34, 0.6); });
    // una última rodaja cae del techo sobre la mesa vacía
    this.una("ultima", t > 7.0, () => { this.ultima = t; });
    p.actualizar(dt);
  }
  dibujarLimon(g, x, y, r) {
    g.save(); g.translate(x, y); g.rotate(r);
    const gr = g.createRadialGradient(-6, -6, 2, 0, 0, 22);
    gr.addColorStop(0, "#fff9a8"); gr.addColorStop(0.5, "#ffe02a"); gr.addColorStop(1, "#c9a400");
    g.fillStyle = "#e3c200"; g.beginPath(); g.ellipse(-19, 0, 5, 4, 0, 0, 6.283); g.ellipse(19, 0, 5, 4, 0, 0, 6.283); g.fill();
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 19, 14, 0, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(-6, -6, 6, 3, -0.4, 0, 6.283); g.fill();
    g.fillStyle = "#3f8a2a"; g.beginPath(); g.ellipse(-20, -5, 6, 2.5, -0.6, 0, 6.283); g.fill();
    g.restore();
  }
  dibujarRodaja(g, x, y, r, aplana) {
    g.save(); g.translate(x, y); g.rotate(r); g.scale(1, aplana);
    g.fillStyle = "#e8c600"; g.beginPath(); g.arc(0, 0, 18, 0, 6.283); g.fill();
    g.fillStyle = "#fff7c4"; g.beginPath(); g.arc(0, 0, 15, 0, 6.283); g.fill();
    g.fillStyle = "#ffe14a";
    for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 13.6, (i * Math.PI) / 4 + 0.09, ((i + 1) * Math.PI) / 4 - 0.09); g.closePath(); g.fill(); }
    g.strokeStyle = "rgba(150,110,0,.6)"; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 18, 0, 6.283); g.stroke();
    g.restore();
  }
  dibujarMesa(g) {
    g.fillStyle = "#30343b"; g.fillRect(MESA[0] - 7, MESA[1] + 6, 14, PIES - MESA[1] - 10);
    g.fillStyle = "#24272c"; g.beginPath(); g.ellipse(MESA[0], PIES - 3, 50, 8, 0, 0, 6.283); g.fill();
    const gr = g.createLinearGradient(0, MESA[1] - 10, 0, MESA[1] + 14);
    gr.addColorStop(0, "#8f5f36"); gr.addColorStop(1, "#3e2513");
    g.fillStyle = "#2a190c"; g.beginPath(); g.ellipse(MESA[0], MESA[1] + 6, 96, 15, 0, 0, 6.283); g.fill();
    g.fillStyle = gr; g.beginPath(); g.ellipse(MESA[0], MESA[1], 96, 15, 0, 0, 6.283); g.fill();
  }
  dibujarVaso(g, t) {
    const { x, base, w, h } = VASO, top = base - h;
    const k = tramo(t, 3.6, 4.3); // de caña a clara
    const forma = () => { g.beginPath(); g.moveTo(x - w / 2, top); g.lineTo(x + w / 2, top); g.lineTo(x + w / 2 - 6, base); g.lineTo(x - w / 2 + 6, base); g.closePath(); };
    forma(); g.fillStyle = "rgba(200,225,255,.14)"; g.fill();
    g.save(); forma(); g.clip();
    const sup = base - h * 0.78, esp = 14 + 4 * k;
    const gr = g.createLinearGradient(0, base, 0, sup);
    gr.addColorStop(0, k < 1 ? `rgb(${lerp(196, 222, k) | 0},${lerp(106, 186, k) | 0},${lerp(0, 40, k) | 0})` : "#dfba28");
    gr.addColorStop(1, `rgb(255,${lerp(201, 236, k) | 0},${lerp(40, 120, k) | 0})`);
    g.fillStyle = gr; g.fillRect(x - w, sup, w * 2, h);
    g.fillStyle = "rgba(255,250,215,.75)";
    for (let i = 0; i < 10; i++) { const by = base - 6 - ((t * 40 + i * 13) % (h * 0.7)); g.beginPath(); g.arc(x - 22 + ((i * 11) % 44), by, 1.6, 0, 6.283); g.fill(); }
    // rodajas flotando
    for (const R of this.rodajas) if (R.cayo) this.dibujarRodaja(g, x + R.dx * 1.2, sup + 12 + (R.i % 2) * 10 + Math.sin(t * 3 + R.i) * 1.5, 0.3 * (R.i - 2), 0.45);
    const ge = g.createLinearGradient(0, sup - esp, 0, sup);
    ge.addColorStop(0, "#fffdf4"); ge.addColorStop(1, "#efe1b6");
    g.fillStyle = ge; g.fillRect(x - w, sup - esp, w * 2, esp);
    g.restore();
    forma(); g.strokeStyle = "rgba(235,246,255,.95)"; g.lineWidth = 2.4; g.stroke();
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x - w / 2 + 7, top + 8, 4, h - 18);
  }
  dibujarCinta(g, e, t) {
    conMat(g, e.m, () => {
      g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(e.pose.rc || 0); g.translate(-RIG.cuello[0], -RIG.cuello[1]);
      // colas del nudo (ondean)
      for (const [dy, fase] of [[0, 0], [5, 1.4]]) {
        g.fillStyle = dy ? "#a3101c" : "#c8182a";
        g.beginPath(); g.moveTo(12, 18 + dy * 0.4);
        const w1 = Math.sin(t * 13 + fase) * 4, w2 = Math.sin(t * 13 + fase + 1.5) * 6;
        g.quadraticCurveTo(0, 18 + dy + w1, -16, 22 + dy + w2);
        g.lineTo(-15, 28 + dy + w2); g.quadraticCurveTo(0, 25 + dy + w1, 12, 25 + dy * 0.4); g.closePath(); g.fill();
      }
      // cinta en la frente
      const gr = g.createLinearGradient(0, 17, 0, 29);
      gr.addColorStop(0, "#ff5361"); gr.addColorStop(0.5, "#d81c2e"); gr.addColorStop(1, "#8f0c18");
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(12, 18); g.quadraticCurveTo(39, 23, 66, 18); g.lineTo(66, 25); g.quadraticCurveTo(39, 30, 12, 25); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,0,6,.6)"; g.lineWidth = 0.8; g.stroke();
      g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 0.9; g.beginPath(); g.moveTo(14, 19.3); g.quadraticCurveTo(39, 24.2, 64, 19.3); g.stroke();
      g.fillStyle = "#c8182a"; g.beginPath(); g.ellipse(12, 21.5, 3.6, 4.6, 0, 0, 6.283); g.fill();
    });
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    const vis = tramo(t, T_POF, T_POF + 0.25), fin = 1 - tramo(t, 7.75, 8.45);
    g.save(); g.globalAlpha = vis * fin;
    // luz tenue de luna y suelo
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * vis * fin;
    g.drawImage(BLOB2.cian, 120, 150, 760, 520); g.restore();
    const gs = g.createLinearGradient(0, PIES - 6, 0, H);
    gs.addColorStop(0, "#15181e"); gs.addColorStop(1, "#050607");
    g.fillStyle = gs; g.fillRect(-60, PIES - 2, W + 120, H - PIES + 62);
    this.dibujarMesa(g);
    if (!this.vasoFuera) this.dibujarVaso(g, t);
    g.restore();
    // el ninja
    if (t > T_POF && t < T_VETE + 0.04) { pintarAvatar(g, e.m, e.pose, t); this.dibujarCinta(g, e, t); }
    // limón y rodajas en el aire
    if (t > T_LANZA && !this.cortado) { const L = this.limon(); this.dibujarLimon(g, L.x, L.y, L.r); }
    for (const R of this.rodajas) {
      if (R.cayo) continue;
      const u = tramo(t, R.t0, R.t1), x = lerp(R.x0, VASO.x + R.dx, u), y = lerp(R.y0, VASO.base - VASO.h * 0.78, u) - 120 * 4 * u * (1 - u);
      const quieta = t < R.t0;
      this.dibujarRodaja(g, x, y, R.r0 + (quieta ? 0 : (t - R.t0) * R.vr), quieta ? 1 : Math.max(0.15, Math.abs(Math.cos((t - R.t0) * 8 + R.i))));
    }
    // estela del golpe
    if (t > T_CORTE - 0.06 && t < T_CORTE + 0.3) {
      const a = 1 - tramo(t, T_CORTE, T_CORTE + 0.3), L = this.limon(), c = this.aPantalla([92, 70]);
      g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      for (const [w, col] of [[22, `rgba(160,230,255,${0.35 * a})`], [7, `rgba(255,255,255,${0.95 * a})`]]) {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(c[0] - 60, c[1] - 30, 150, -0.75, 0.75); g.stroke();
      }
      g.restore();
      brillo(g, L.x, L.y, 80 * a, a);
    }
    this.p.dibujar(g);
    // última rodaja
    if (this.ultima) {
      const s = t - this.ultima, y = Math.min(MESA[1] - 6, -30 + 700 * s * s), quieta = y >= MESA[1] - 6;
      this.dibujarRodaja(g, MESA[0] + 30, y, quieta ? 0 : s * 12, quieta ? 0.35 : Math.abs(Math.cos(s * 9)) * 0.8 + 0.2);
    }
    // ¡HAI-YA!
    if (t > T_CORTE && t < 4.75) {
      const k = tramo(t, T_CORTE, T_CORTE + 0.15), a = 1 - tramo(t, 4.45, 4.75);
      g.save(); g.translate(W / 2 + 40, 118); g.rotate(-0.07); g.scale(lerp(2.2, 1, eIn(k)), lerp(2.2, 1, eIn(k)));
      txt(g, "¡HAI-YA!", 0, 0, { tam: 140, peso: 400, fam: FC, color: "#ffffff", borde: "#b3001b", bordeAncho: 13, alfa: Math.min(1, k * 4) * a, esp: 5 });
      g.restore();
    }
    // CLARA LISTA
    if (t > 4.3 && t < 7.0 && !(this.vasoFuera && t > T_VASO + 0.2)) {
      const k = tramo(t, 4.3, 4.55), a = 1 - tramo(t, T_VASO - 0.1, T_VASO + 0.15);
      g.save(); g.translate(VASO.x + 20, 262); g.rotate(-0.08); g.scale(eBack(k), eBack(k)); g.globalAlpha = a;
      g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 10;
      rectR(g, -150, -40, 300, 80, 16); g.fillStyle = "#fffdf5"; g.fill();
      g.shadowBlur = 0; g.shadowColor = "transparent";
      rectR(g, -143, -33, 286, 66, 11);
      const gr = g.createLinearGradient(0, -33, 0, 33);
      gr.addColorStop(0, "#ffe94d"); gr.addColorStop(1, "#e0a800");
      g.fillStyle = gr; g.fill();
      txt(g, "CLARA LISTA", 0, 20, { tam: 54, peso: 900, fam: FD, color: "#3a2a00", esp: 3, max: 270 });
      g.restore();
    }
    // empieza en negro (¡POF!) y acaba fundiendo a negro
    if (t < T_POF) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
    const n = tramo(t, 7.9, 8.55);
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00004", nombre: "Clara ninja", crear: () => new EscenaNinja() });
})();
