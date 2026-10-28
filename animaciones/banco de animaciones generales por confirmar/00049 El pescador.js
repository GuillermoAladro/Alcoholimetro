"use strict";
/*
 * 00049 · EL PESCADOR
 *
 * Animación del banco. Empieza y acaba en negro.
 * De noche, con la luna, pesca sentado en un muelle de madera (que le tapa las piernas), con gorro de pescador. Se
 * queda dormido (Zzz); un picotazo le despierta un momento. De repente el corcho se hunde: ¡PICA! La caña se dobla y
 * forcejea tirando hacia atrás entre salpicaduras, hasta que de un tirón saca del agua una lata gigante que cae a su
 * lado en el muelle (¡PUM!). Se abre sola (¡PSSST!) y él se ríe. La noche se apaga.
 */
(() => {
const ESC = 1.45, X = 360, ASIENTO = 470, MUELLE = 560, AGUA = 506;
const T_PICOTAZO = 2.25, T_PICA = 3.35, T_SACA = 5.85, T_CAE = 6.75, T_ABRE = 7.5;
const CORCHO = [880, AGUA + 6];

class Pescador extends Escena {
  constructor() {
    super(10.4);
    this.p = new Parts(380);
    this.fondo = pintarNoche();
    this.zetas = [];
    this.ondas = [];
  }
  luz() { const t = this.t; return eInOut(tramo(t, 0.02, 0.9)) * (1 - eInOut(tramo(t, 9.6, 10.35))); }
  /** Fuerza del pez: 0 nada, 1 tirando a tope. */
  tiron() {
    const t = this.t;
    if (t < T_PICA) return t > T_PICOTAZO && t < T_PICOTAZO + 0.4 ? 0.25 * Math.max(0, Math.sin((t - T_PICOTAZO) * 30)) : 0;
    if (t < T_SACA + 0.15) return 0.75 + 0.25 * Math.sin(t * 9);
    return 0;
  }
  /** Punto donde la línea entra en el agua. */
  entrada() {
    const t = this.t;
    if (t < T_PICA) { const pic = this.tiron(); return [CORCHO[0], CORCHO[1] + 2 * Math.sin(t * 2.2) + 10 * pic]; }
    if (t < T_SACA) return [870 + 60 * Math.sin((t - T_PICA) * 2.6), AGUA + 8];
    return [870, AGUA + 8];
  }
  estado() {
    const t = this.t, f = this.tiron();
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let giro = 0, manoD = [88, 128], manoI = [56, 140];
    if (t < T_PICA) {
      pose.cara = t < 1.1 ? "sonrisa" : "dormido";
      pose.rc = t > 1.1 ? 0.12 + 0.03 * Math.sin(t * 1.6) : 0;
      if (t > T_PICOTAZO && t < T_PICOTAZO + 0.65) { pose.cara = "sorpresa"; pose.rc = 0; }
      giro = t > 1.1 ? 0.03 * Math.sin(t * 1.6) : 0;
    } else if (t < T_SACA) {
      // forcejeo: primero le arrastra, luego tira hacia atrás
      const k = tramo(t, T_PICA, T_PICA + 0.25);
      giro = t < T_PICA + 0.5 ? 0.16 * Math.sin(Math.PI * k) : -0.1 - 0.05 * Math.sin(t * 9);
      pose.cara = t < T_PICA + 0.6 ? "sorpresa" : Math.sin(t * 5) > 0 ? "sorpresa" : "risa";
      manoD = [86 + 3 * Math.sin(t * 20), 122]; manoI = [56, 136 + 2 * Math.sin(t * 20)];
      pose.rc = -0.06 * Math.sin(t * 7);
    } else if (t < T_CAE) {
      // el tirón final
      const k = eOut(tramo(t, T_SACA, T_SACA + 0.25));
      giro = lerp(-0.1, -0.24, k) * (1 - tramo(t, T_SACA + 0.5, T_CAE));
      manoD = mezcla([86, 122], [70, 76], k); manoI = mezcla([56, 136], [44, 92], k);
      pose.cara = "sorpresa"; pose.rc = -0.1;
    } else {
      const k = tramo(t, T_CAE, T_CAE + 0.4);
      giro = -0.03 * Math.sin(k * 12) * (1 - k);
      manoD = mezcla([70, 76], [88, 128], eInOut(tramo(t, T_CAE + 0.2, T_CAE + 0.6))); manoI = mezcla([44, 92], [56, 140], eInOut(tramo(t, T_CAE + 0.2, T_CAE + 0.6)));
      pose.cara = t < T_ABRE ? "sorpresa" : t < 8.9 ? "risa" : "guino";
      pose.rc = t < T_ABRE ? 0.18 : 0.04 * Math.sin(t * 5);
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(X, ASIENTO, ESC, giro, 1, 1, [39, 146]);
    // la caña: del mango (en la barriga) a la punta, más doblada cuanto más tira
    const mango = aPant(m, [48, 150]), mano = aPant(m, manoD);
    const dir = [mano[0] - mango[0], mano[1] - mango[1]], L = Math.hypot(dir[0], dir[1]) || 1;
    const u = [dir[0] / L, dir[1] / L];
    const recta = [mango[0] + u[0] * 470, mango[1] + u[1] * 470];
    const ent = this.entrada();
    const dobla = Math.max(f, t > T_SACA && t < T_CAE ? 0.6 * (1 - tramo(t, T_SACA + 0.2, T_SACA + 0.7)) : 0);
    const punta = mezcla(recta, [lerp(recta[0], ent[0], 0.3), lerp(recta[1], ent[1], 0.62)], dobla * 0.75);
    const ctrl = [mango[0] + u[0] * 300, mango[1] + u[1] * 300 + 30 * dobla];
    const inv = m.inverse();
    const av = (q) => { const r = inv.transformPoint(new DOMPoint(q[0], q[1])); return [r.x, r.y]; };
    const A = av(mango), Cc = av(ctrl), Pp = av(punta);
    pose.objI = (g) => { gorro(g, pose.rc); cana(g, A, Cc, Pp, t, t > T_PICA && t < T_SACA + 0.3); };
    return { pose, m, punta, ent, dobla };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // Zzz
    for (const tz of [1.2, 1.65, 2.95]) this.una("z" + tz, t > tz, () => { const q = aPant(e.m, [56, -4]); this.zetas.push({ x: q[0], y: q[1], t0: t }); });
    this.zetas = this.zetas.filter((z) => t - z.t0 < 1.6 && t < T_PICA);
    // ondas del corcho
    if (t < T_PICA && Math.random() < 1.4 * dt) this.ondas.push({ x: CORCHO[0], t0: t, f: 1 });
    this.una("picotazo", t > T_PICOTAZO, () => { this.ondas.push({ x: CORCHO[0], t0: t, f: 1.6 }); });
    this.una("pica", t > T_PICA, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 30; k++) p.nueva(P.ESPUMA, CORCHO[0] + azar(-20, 20), AGUA, azar(-200, 200), azar(-420, -160), azar(0.4, 0.8), azar(3, 8));
      for (let k = 0; k < 3; k++) this.ondas.push({ x: CORCHO[0], t0: t + k * 0.12, f: 2.2 });
    });
    if (t > T_PICA && t < T_SACA && Math.random() < 14 * dt) {
      const q = this.entrada();
      p.nueva(P.ESPUMA, q[0] + azar(-14, 14), AGUA + 4, azar(-120, 120), azar(-300, -100), azar(0.3, 0.6), azar(3, 6));
      if (Math.random() < 0.3) this.ondas.push({ x: q[0], t0: t, f: 1.3 });
    }
    if (t > T_PICA + 0.6 && t < T_SACA && Math.random() < 3 * dt) { const q = aPant(e.m, [62, 16]); p.nueva(P.GOTA, q[0], q[1], azar(30, 90), azar(-140, -60), 0.6, 3); }
    // ¡sale la lata!
    this.una("saca", t > T_SACA + 0.12, () => {
      temblar(22, 0.5);
      for (let k = 0; k < 70; k++) p.nueva(P.ESPUMA, 870 + azar(-60, 60), AGUA, azar(-320, 320), azar(-700, -250), azar(0.6, 1.1), azar(4, 12));
      for (let k = 0; k < 4; k++) this.ondas.push({ x: 870, t0: t + k * 0.1, f: 3 });
    });
    this.una("cae", t > T_CAE, () => {
      temblar(26, 0.5);
      for (let k = 0; k < 26; k++) p.nueva(P.POLVO, 170 + azar(-80, 80), ASIENTO - 10, azar(-300, 300), azar(-90, -10), azar(0.6, 1.0), azar(26, 44));
    });
    if (t > T_CAE && t < 8.5 && Math.random() < 10 * dt) p.nueva(P.ESPUMA, 170 + azar(-60, 60), azar(220, 420), 0, azar(20, 80), 0.5, azar(2, 4));
    this.una("abre", t > T_ABRE, () => { temblar(8, 0.3); });
    if (t > T_ABRE && t < 8.6) for (let k = 0; k < 4; k++) p.nueva(P.ESPUMA, 178 + azar(-12, 12), 196, azar(-90, 90), azar(-560, -300), azar(0.6, 1.1), azar(5, 11));
    this.ondas = this.ondas.filter((o) => t - o.t0 < 1.4);
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** La lata gigante: centro, giro y escala vertical. */
  lata() {
    const t = this.t;
    if (t < T_SACA + 0.1) return null;
    if (t < T_CAE) {
      const u = tramo(t, T_SACA + 0.1, T_CAE);
      return { x: lerp(870, 170, u), y: lerp(AGUA + 60, ASIENTO - 6 - 132, u) - 420 * 4 * u * (1 - u), a: -Math.PI * 3 * eOut(u), sy: 1 };
    }
    const k = tramo(t, T_CAE, T_CAE + 0.4);
    return { x: 170, y: ASIENTO - 6 - 132 + 10 * Math.sin(Math.PI * Math.min(1, k * 2.5)) * 0.4, a: 0.05 * Math.sin(k * 14) * (1 - k), sy: 1 - 0.1 * Math.sin(Math.PI * Math.min(1, k * 2.5)) };
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo, 0, 0);
    // estrellas que titilan
    const r = semilla(49);
    for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * 330, a = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + r() * 2) + i)); g.fillStyle = `rgba(255,255,240,${a * 0.8})`; g.fillRect(x, y, 2, 2); }
    // agua: reflejo de la luna y ondas
    g.save(); g.globalCompositeOperation = "lighter";
    for (let k = 0; k < 7; k++) { const y = AGUA + 12 + k * 13, w = 70 - k * 5 + 12 * Math.sin(t * 2 + k); g.fillStyle = `rgba(255,240,190,${0.22 - k * 0.02})`; g.fillRect(760 - w / 2 + 6 * Math.sin(t * 1.5 + k * 2), y, w, 3); }
    g.restore();
    for (const o of this.ondas) {
      const k = tramo(t, o.t0, o.t0 + 1.4);
      if (k <= 0) continue;
      g.strokeStyle = `rgba(200,230,255,${0.5 * (1 - k)})`; g.lineWidth = 2;
      g.beginPath(); g.ellipse(o.x, AGUA + 8, 10 + 70 * k * o.f, 3 + 9 * k * o.f, 0, 0, 6.283); g.stroke();
    }
    // corcho
    if (t < T_PICA) {
      const q = this.entrada();
      g.fillStyle = "#e8242f"; g.beginPath(); g.arc(q[0], q[1] - 6, 10, Math.PI, 0); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(q[0], q[1] - 6, 10, 0, Math.PI); g.fill();
      g.fillStyle = "#222"; g.fillRect(q[0] - 1, q[1] - 22, 2, 9);
    }
    // la lata gigante (por detrás de él cuando cae al muelle)
    const L = this.lata();
    if (L) {
      g.save(); g.translate(L.x, L.y); g.rotate(L.a); g.scale(1, L.sy);
      dibujarLata(g, 0, 0, 0, { esc: 11, abierta: t > T_ABRE });
      g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    // sedal: de la punta al agua
    g.strokeStyle = "rgba(235,240,245,.85)"; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(e.punta[0], e.punta[1]);
    if (L && t < T_CAE) { g.lineTo(L.x + Math.sin(L.a) * 120, L.y - Math.cos(L.a) * 120); }
    else { const ent = e.ent, flojo = t < T_PICA ? 40 : 0; g.quadraticCurveTo((e.punta[0] + ent[0]) / 2 + 10, (e.punta[1] + ent[1]) / 2 + flojo, ent[0], ent[1] - (t < T_PICA ? 14 : 0)); }
    g.stroke();
    // muelle (le tapa las piernas)
    g.drawImage(this.muelle || (this.muelle = pintarMuelle()), 0, 0);
    this.p.dibujar(g);
    // Zzz
    for (const z of this.zetas) {
      const k = (t - z.t0) / 1.6;
      txt(g, "Z", z.x + 30 * k + 6 * Math.sin(k * 8), z.y - 70 * k, { tam: 22 + 26 * k, peso: 400, fam: FC, color: "#d6e8ff", borde: "#1a2a4a", bordeAncho: 5, alfa: Math.min(1, (1 - k) * 3) * Math.min(1, k * 6) });
    }
    // ¡PICA!
    if (t > T_PICA && t < 5.3) {
      const k = tramo(t, T_PICA, T_PICA + 0.14), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 3) * (1 - tramo(t, 5.0, 5.3));
      g.save(); g.translate(W / 2 + 60, 150); g.rotate(-0.08 + 0.03 * Math.sin(t * 20)); g.scale(s, s);
      txt(g, "¡PICA!", 0, 0, { tam: 120, peso: 400, fam: FC, color: "#ffe28a", borde: "#123a6a", bordeAncho: 13, alfa: a, esp: 4 });
      g.restore();
    }
    if (t > T_CAE && t < 7.5) {
      const k = tramo(t, T_CAE, T_CAE + 0.12);
      g.save(); g.translate(250, 160); g.rotate(-0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡PUM!", 0, 0, { tam: 60, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a1a00", bordeAncho: 9, alfa: 1 - tramo(t, 7.25, 7.5), esp: 2 });
      g.restore();
    }
    if (t > T_ABRE && t < 8.8) {
      const k = tramo(t, T_ABRE, T_ABRE + 0.12);
      g.save(); g.translate(320, 120); g.rotate(0.08); g.scale(eBack(k), eBack(k));
      txt(g, "¡PSSST!", 0, 0, { tam: 56, peso: 400, fam: FC, color: "#d8ffe2", borde: "#0a6b2a", bordeAncho: 8, alfa: 1 - tramo(t, 8.5, 8.8), esp: 2 });
      g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
function pintarNoche() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, AGUA);
  gr.addColorStop(0, "#03060f"); gr.addColorStop(1, "#11234a");
  g.fillStyle = gr; g.fillRect(0, 0, W, AGUA);
  // luna
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB.amarillo, 760 - 120, 120 - 120, 240, 240); g.restore();
  g.fillStyle = "#fff4d0"; g.beginPath(); g.arc(760, 120, 42, 0, 6.283); g.fill();
  g.fillStyle = "rgba(200,190,160,.35)";
  for (const [x, y, r] of [[748, 108, 8], [774, 130, 6], [766, 104, 4], [748, 136, 5]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  // montes lejanos
  g.fillStyle = "#0a1428";
  g.beginPath(); g.moveTo(0, AGUA); g.lineTo(0, 440); g.quadraticCurveTo(200, 380, 420, 450); g.quadraticCurveTo(640, 400, 820, 452); g.quadraticCurveTo(940, 430, W, 460); g.lineTo(W, AGUA); g.closePath(); g.fill();
  // agua
  const ga = g.createLinearGradient(0, AGUA, 0, H);
  ga.addColorStop(0, "#14305e"); ga.addColorStop(1, "#060f22");
  g.fillStyle = ga; g.fillRect(0, AGUA, W, H - AGUA);
  g.strokeStyle = "rgba(140,180,255,.12)"; g.lineWidth = 2;
  for (let y = AGUA + 14; y < H; y += 16) { g.beginPath(); for (let x = 0; x <= W; x += 24) g.lineTo(x, y + 3 * Math.sin(x * 0.05 + y)); g.stroke(); }
  return c;
}
function pintarMuelle() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  // pared del muelle
  const gr = g.createLinearGradient(0, ASIENTO - 14, 0, H);
  gr.addColorStop(0, "#6a4626"); gr.addColorStop(1, "#2a1a0c");
  g.fillStyle = gr; g.fillRect(-10, ASIENTO - 6, MUELLE + 10, H - ASIENTO + 6);
  g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
  for (let y = ASIENTO + 22; y < H; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(MUELLE, y); g.stroke(); }
  // postes
  for (const x of [30, 200, 370, MUELLE - 16]) {
    const gp = g.createLinearGradient(x - 14, 0, x + 14, 0);
    gp.addColorStop(0, "#3a2614"); gp.addColorStop(0.5, "#7a5430"); gp.addColorStop(1, "#2e1d0e");
    g.fillStyle = gp; g.fillRect(x - 14, ASIENTO - 22, 28, H - ASIENTO + 22);
    g.fillStyle = "#8a6238"; g.beginPath(); g.ellipse(x, ASIENTO - 22, 14, 5, 0, 0, 6.283); g.fill();
  }
  // tablas de arriba
  g.fillStyle = "#9a6e40"; g.fillRect(-10, ASIENTO - 10, MUELLE + 10, 10);
  g.fillStyle = "rgba(255,230,190,.25)"; g.fillRect(-10, ASIENTO - 10, MUELLE + 10, 2);
  // el agua por delante
  g.fillStyle = "rgba(10,25,55,.75)"; g.fillRect(0, H - 22, W, 22);
  return c;
}
/** Caña de pescar en unidades de avatar: mango A, control C, punta P. */
function cana(g, A, C, P, t, recoge) {
  g.save(); g.lineCap = "round";
  g.strokeStyle = "#2a1b10"; g.lineWidth = 4.5;
  g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(C[0], C[1], P[0], P[1]); g.stroke();
  g.strokeStyle = "#c98a3a"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(C[0], C[1], P[0], P[1]); g.stroke();
  // carrete
  const d = [C[0] - A[0], C[1] - A[1]], L = Math.hypot(d[0], d[1]) || 1, u = [d[0] / L, d[1] / L];
  const R = [A[0] + u[0] * 12 + u[1] * 6, A[1] + u[1] * 12 - u[0] * 6];
  g.fillStyle = "#9aa3ab"; g.beginPath(); g.arc(R[0], R[1], 5, 0, 6.283); g.fill();
  g.strokeStyle = "#333"; g.lineWidth = 1.4; g.stroke();
  const a = recoge ? t * 25 : 0.6;
  g.strokeStyle = "#222"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(R[0], R[1]); g.lineTo(R[0] + Math.cos(a) * 6, R[1] + Math.sin(a) * 6); g.stroke();
  g.restore();
}
/** Gorro de pescador (sigue el giro de la cabeza). */
function gorro(g, rc) {
  g.save(); g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  const gr = g.createLinearGradient(0, -14, 0, 18);
  gr.addColorStop(0, "#9aa063"); gr.addColorStop(1, "#5d6236");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(14, 8); g.bezierCurveTo(14, -16, 64, -16, 64, 8); g.closePath(); g.fill();
  g.fillStyle = "#6d7340";
  g.beginPath(); g.moveTo(14, 4); g.lineTo(64, 4); g.lineTo(76, 17); g.quadraticCurveTo(39, 13, 2, 17); g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 0.8; g.stroke();
  g.fillStyle = "#4a4e28"; g.fillRect(14, 1, 50, 4);
  // mosca de pescar
  g.fillStyle = "#e8242f"; g.beginPath(); g.ellipse(56, -2, 2.4, 3.6, 0.5, 0, 6.283); g.fill();
  g.fillStyle = "#ffd34d"; g.beginPath(); g.ellipse(59, -4, 1.6, 2.6, -0.3, 0, 6.283); g.fill();
  g.restore();
}

registrar({ id: "00049", nombre: "El pescador", crear: () => new Pescador() });
})();
