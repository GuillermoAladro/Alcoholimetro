"use strict";
/*
 * 00057 · LA PAJITA KILOMÉTRICA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En una mesita lejana hay una jarra. De ella sale una pajita larguísima que serpentea por toda la pantalla (curvas,
 * un rizo, zigzag) hasta llegar a su boca. Sorbe: la cerveza viaja por la pajita, se atasca en el rizo (aprieta los
 * ojos y tiembla) y llega de golpe: ¡SLURP! Se bebe la jarra entera, suena el último sorbo y lo celebra.
 */
(() => {
const JX = 885, JY = 500; // la jarra lejana (centro del fondo)
const EJ = 1.8;
const PUNTOS = [[885, 492], [886, 400], [930, 300], [945, 180], [880, 85], [770, 85], [705, 165], [740, 255], [815, 235], [815, 160], [735, 135], [650, 190], [600, 300], [540, 405], [450, 445], [372, 392], [392, 300], [480, 262], [540, 190], [500, 100], [400, 62], [312, 96], [282, 180], [300, 250], [262, 300]];

class EscenaPajita extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(220);
    this.X = 196; this.ESC = 1.5;
    this.camino = null; this.fase = 0;
  }
  /** Muestrea la pajita (Catmull-Rom) acabando en la boca; guarda puntos y longitudes acumuladas. */
  hacerCamino(boca) {
    const P = PUNTOS.concat([boca]), pts = [], L = [0];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 12; k++) {
        const u = k / 12, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    pts.push(P[P.length - 1]);
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, L, tot: L[L.length - 1] };
  }
  /** Punto a una distancia s del principio (la jarra). */
  punto(s) {
    const C = this.camino, L = C.L;
    s = clamp(s, 0, C.tot);
    let i = 1;
    while (i < L.length - 1 && L[i] < s) i++;
    const k = (s - L[i - 1]) / Math.max(0.001, L[i] - L[i - 1]);
    return mezcla(C.pts[i - 1], C.pts[i], k);
  }
  trazo(g, s0, s1) {
    const C = this.camino, L = C.L;
    if (s1 <= s0) return;
    g.beginPath();
    const a = this.punto(s0); g.moveTo(a[0], a[1]);
    for (let i = 0; i < L.length; i++) if (L[i] > s0 && L[i] < s1) g.lineTo(C.pts[i][0], C.pts[i][1]);
    const b = this.punto(s1); g.lineTo(b[0], b[1]);
  }
  /** Fracciones de la pajita: hasta dónde ha llegado la pajita y dónde están el frente y la cola de la cerveza. */
  avance(t) {
    const crece = eInOut(tramo(t, 0.45, 2.0));
    let frente = 0;
    if (t > 2.4) frente = t < 3.5 ? 0.36 * eOut(tramo(t, 2.4, 3.5)) : t < 4.55 ? lerp(0.36, 0.44, tramo(t, 3.5, 4.55)) : lerp(0.44, 1, eIn(tramo(t, 4.55, 5.35)));
    const cola = eIn(tramo(t, 6.55, 7.25));
    return { crece, frente, cola };
  }
  estado() {
    const t = this.t, pose = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoI = [9, 160], sx = 1, sy = 1, dx = 0;
    const b = boca(0), A = this.camino ? this.avance(t) : { crece: 0, frente: 0, cola: 0 };
    // mira cómo llega la pajita
    if (t < 2.0) { pose.rc = 0.12 * Math.sin(t * 2.2) * tramo(t, 0.5, 0.9); pose.cara = t < 0.5 ? "sonrisa" : "sorpresa"; }
    if (t >= 2.0 && t < 2.4) pose.cara = "guino";
    // sorbe (mejillas hacia dentro)
    if (t >= 2.4 && t < 5.35) {
      pose.cara = "sorpresa"; sx = 0.95 + 0.015 * Math.sin(t * 9);
      // atasco en el rizo: aprieta los ojos y tiembla
      if (t > 3.5 && t < 4.55) { pose.cara = "dormido"; sy = 0.97; dx = azar(-2, 2); manoI = [-2, 138 + 4 * Math.sin(t * 25)]; pose.rc = 0.02 * Math.sin(t * 40); }
    }
    // ¡SLURP! y a beber
    if (t >= 5.35 && t < 7.35) { pose.cara = t < 5.75 ? "sorpresa" : "dormido"; sx = 1 + 0.04 * tramo(t, 5.6, 7.2); pose.rc = -0.04 * Math.sin(t * 6); }
    // ¡AAAH! y pulgar arriba
    if (t >= 7.35) {
      const k = eOut(tramo(t, 7.35, 7.6));
      pose.cara = t < 8.0 ? "risa" : "guino"; sx = 1.04;
      manoI = mezcla([9, 160], [-14, 46], k);
    }
    pose.manoD = [b[0] + 16, b[1] + 15]; pose.manoI = manoI;
    if (t < 1.6) pose.manoD = mezcla([70, 158], [b[0] + 16, b[1] + 15], eInOut(tramo(t, 1.2, 1.6)));
    const m = matAv(this.X + dx, PIES, this.ESC, 0, sx, sy);
    return { pose, m, A };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (!this.camino) { const e0 = matAv(this.X, PIES, this.ESC); this.camino = this.hacerCamino(aPant(e0, [boca(0)[0] + 3, boca(0)[1] + 1])); }
    this.una("muerde", t > 2.0, () => temblar(4, 0.15));
    this.una("atasco", t > 3.5, () => temblar(5, 1.0));
    this.una("slurp", t > 5.35, () => {
      temblar(18, 0.45);
      const q = this.camino.pts[this.camino.pts.length - 1];
      for (let i = 0; i < 18; i++) p.nueva(P.ESPUMA, q[0] + 22, q[1] + 6, azar(80, 260), azar(-160, -10), azar(0.4, 0.8), azar(4, 8));
    });
    this.una("vacia", t > 7.15, () => {
      for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, JX + azar(-20, 20), JY - 50, azar(-60, 60), azar(-160, -40), azar(0.4, 0.8), azar(3, 6));
    });
    if (t > 7.35 && t < 7.6) this.una("aah", true, () => temblar(6, 0.2));
    p.alfa = 1 - tramo(t, 8.6, 9.3);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), A = e.A, luz = tramo(t, 0, 0.45) * (1 - tramo(t, 8.6, 9.3));
    fondo(g, "#000");
    foco(g, JX, JX, PIES, 120, 0.6 * luz);
    foco(g, this.X, this.X, PIES, 150, 0.6 * luz);
    g.save(); g.globalAlpha = luz;
    // mesita lejana con la jarra
    g.fillStyle = "#3a2618"; g.fillRect(JX - 6, JY, 12, PIES - JY - 6);
    g.fillStyle = "#2a1a10"; g.beginPath(); g.ellipse(JX, PIES - 6, 34, 7, 0, 0, 6.283); g.fill();
    const gm = g.createLinearGradient(0, JY - 6, 0, JY + 8);
    gm.addColorStop(0, "#c89a66"); gm.addColorStop(1, "#6a4a2a");
    g.fillStyle = gm; g.beginPath(); g.ellipse(JX, JY + 2, 64, 10, 0, 0, 6.283); g.fill();
    const nivel = t < 2.4 ? 1 : t < 5.35 ? lerp(1, 0.68, tramo(t, 2.4, 5.35)) : lerp(0.68, 0, tramo(t, 5.35, 6.85));
    g.save(); g.translate(JX - 17 * EJ, JY - 18 * EJ); g.scale(EJ, EJ);
    dibujarJarra(g, [0, 0], 0, nivel, "asa", t); dibujarJarra(g, [0, 0], 0, nivel, "cuerpo", t);
    g.restore();
    g.restore();
    // la pajita
    if (this.camino && A.crece > 0) {
      const tot = this.camino.tot, s1 = A.crece * tot;
      g.save(); g.globalAlpha = luz; g.lineCap = "round"; g.lineJoin = "round";
      this.trazo(g, 0, s1);
      g.strokeStyle = "rgba(20,30,24,.9)"; g.lineWidth = 15; g.stroke();
      g.strokeStyle = "rgba(240,250,245,.88)"; g.lineWidth = 12; g.stroke();
      // rayas de la pajita
      g.lineCap = "butt"; g.setLineDash([7, 13]);
      g.strokeStyle = "rgba(43,200,90,.85)"; g.lineWidth = 12; g.stroke();
      g.setLineDash([]); g.lineCap = "round";
      // la cerveza por dentro
      const f = A.frente * tot, c = A.cola * tot;
      if (f > c) {
        this.trazo(g, c, Math.min(f, s1));
        g.strokeStyle = "rgba(224,138,0,.95)"; g.lineWidth = 8; g.stroke();
        g.strokeStyle = "rgba(255,206,70,.9)"; g.lineWidth = 3; g.stroke();
        // burbujas que viajan
        g.fillStyle = "rgba(255,248,215,.95)";
        for (let i = 0; i < 18; i++) {
          const ss = c + ((t * 170 + i * 97) % Math.max(1, f - c));
          const q = this.punto(ss); g.beginPath(); g.arc(q[0], q[1], 2, 0, 6.283); g.fill();
        }
        // espumita en el frente
        if (A.frente < 1) { const q = this.punto(f); g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(q[0], q[1], 6, 0, 6.283); g.fill(); }
      }
      this.trazo(g, 0, s1);
      g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 2; g.stroke();
      // la punta que avanza (antes de llegar a la boca)
      if (A.crece < 1) { const q = this.punto(s1); g.fillStyle = "#1b2a20"; g.beginPath(); g.arc(q[0], q[1], 5, 0, 6.283); g.fill(); }
      g.restore();
    }
    g.save(); g.globalAlpha = luz;
    pintarAvatar(g, e.m, e.pose, t);
    // el último tramo de la pajita, por delante de la cara
    if (this.camino && A.crece >= 1) {
      const tot = this.camino.tot;
      g.lineCap = "round"; this.trazo(g, tot - 40, tot);
      g.strokeStyle = "rgba(20,30,24,.9)"; g.lineWidth = 15; g.stroke();
      g.strokeStyle = "rgba(240,250,245,.95)"; g.lineWidth = 12; g.stroke();
      g.lineCap = "butt"; g.setLineDash([7, 13]); g.strokeStyle = "rgba(43,200,90,.85)"; g.lineWidth = 12; g.stroke(); g.setLineDash([]); g.lineCap = "round";
      if (A.frente * tot > tot - 40 && A.cola < 1) { this.trazo(g, Math.max(tot - 40, A.cola * tot), Math.min(tot, A.frente * tot)); g.strokeStyle = "rgba(224,138,0,.95)"; g.lineWidth = 8; g.stroke(); }
    }
    g.restore();
    this.p.dibujar(g);
    // ruiditos
    const fx = (s, x, y, tam, a, rot = 0) => { if (a <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: "#fff3c8", borde: "#4a2a00", bordeAncho: 6, esp: 2, alfa: a * luz }); g.restore(); };
    if (this.camino) {
      if (t > 2.6 && t < 3.5) { const q = this.punto(0.2 * this.camino.tot); fx("sss…", q[0] - 50, q[1] + 10, 34, 1 - tramo(t, 3.3, 3.5)); }
      if (t > 3.6 && t < 4.55) { const q = this.punto(0.4 * this.camino.tot); fx("¡ÑÑÑÑ!", q[0] + 10, q[1] + 120, 44, 1 - tramo(t, 4.4, 4.55), -0.08); }
      if (t > 6.0 && t < 6.9) { const q = aPant(e.m, [100, 30]); fx("GLUG GLUG", q[0] + 60, q[1] - 10, 36, Math.min(1, tramo(t, 6.0, 6.15)) * (1 - tramo(t, 6.7, 6.9)), -0.1); }
      if (t > 7.0 && t < 7.7) fx("slrrrp…", JX - 20, JY - 110, 32, 1 - tramo(t, 7.5, 7.7), 0.05);
      if (t > 7.4 && t < 8.6) { const q = aPant(e.m, [39, -10]); bocadillo(g, q[0] + 70, q[1] - 40, "¡AAAH!", q[0] + 10, q[1], tramo(t, 7.4, 7.6) * (1 - tramo(t, 8.35, 8.6)) * luz, 34); }
    }
    // ¡SLURP!
    if (t > 5.35 && t < 7.1) {
      const k = tramo(t, 5.35, 5.5), s = lerp(2.6, 1, eIn(k)) * (1 + 0.04 * Math.sin(t * 12));
      g.save(); g.translate(560, 520); g.rotate(-0.06); g.scale(s, s);
      const gr = g.createLinearGradient(0, -110, 0, 0);
      gr.addColorStop(0, "#fff6c2"); gr.addColorStop(1, "#ffb21a");
      txt(g, "¡SLURP!", 0, 0, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#3a2200", bordeAncho: 12, esp: 4, alfa: Math.min(1, k * 4) * (1 - tramo(t, 6.8, 7.1)) * luz });
      g.restore();
    }
  }
}

registrar({ id: "00057", nombre: "La pajita kilométrica", crear: () => new EscenaPajita() });
})();
