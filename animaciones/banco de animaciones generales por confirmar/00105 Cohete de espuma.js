"use strict";
/*
 * 00105 · COHETE DE ESPUMA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Agita una lata como loco, la apunta al suelo y la abre: sale propulsado por la espuma, hace loopings y escribe
 * ¡SALUD! con la espuma. Vuela hacia la pantalla y se estampa contra el cristal (¡PLAF!); resbala y la espuma cae
 * hasta dejar la pantalla en negro.
 */
(() => {
/** Manchas de espuma en el cristal tras el golpe . */
let _manchas = null;
function manchasEspuma() {
  if (_manchas) return _manchas;
  const r = semilla(77), m = [];
  for (let i = 0; i < 26; i++) {
    const a = r() * 6.283, d = 170 + r() * 190;
    m.push({ x: W / 2 + Math.cos(a) * d * 1.25, y: 300 + Math.sin(a) * d * 0.85, r: 14 + r() * 26, v: 18 + r() * 70, ancho: 0.45 + r() * 0.3 });
  }
  return (_manchas = m);
}
function dibujarManchas(g, largoT, dy, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  for (const m of manchasEspuma()) {
    const L = m.v * largoT, y = m.y + dy, w = m.r * m.ancho * 2;
    g.fillStyle = "#fbf7ea";
    if (L > 2) { rectR(g, m.x - w / 2, y, w, L, w / 2); g.fill(); g.beginPath(); g.arc(m.x, y + L, w * 0.75, 0, 6.283); g.fill(); }
    g.drawImage(SPR.espuma, m.x - m.r, y - m.r, m.r * 2, m.r * 2);
    g.drawImage(SPR.espuma, m.x - m.r * 0.5 + m.r * 0.6, y - m.r * 0.9, m.r * 1.1, m.r * 1.1);
  }
  g.restore();
}

class EscenaCohete extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(700);
    // camino del centro del cuerpo (t, x, y)
    this.camino = [
      [1.75, 512, 405], [2.05, 520, 230], [2.35, 430, 110], [2.65, 255, 92], [2.95, 125, 190], [3.2, 140, 300],
      [3.5, 235, 335], [3.85, 360, 292], [4.2, 480, 335], [4.55, 600, 292], [4.9, 730, 335], [5.25, 860, 300],
      [5.55, 950, 200], [5.85, 870, 95], [6.15, 700, 120], [6.45, 575, 230], [6.75, 512, 300], [7.0, 512, 300],
    ];
    this.SALUD = null; this.splat = false;
  }
  pos(t) {
    const C = this.camino;
    if (t <= C[0][0]) return [C[0][1], C[0][2]];
    let i = 0;
    while (i < C.length - 2 && t > C[i + 1][0]) i++;
    const p0 = C[Math.max(0, i - 1)], p1 = C[i], p2 = C[i + 1], p3 = C[Math.min(C.length - 1, i + 2)];
    const u = clamp((t - p1[0]) / (p2[0] - p1[0]), 0, 1), u2 = u * u, u3 = u2 * u;
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
    return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
  }
  escala(t) { return t < 1.75 ? 1.45 : t < 6.15 ? lerp(1.45, 1.0, eOut(tramo(t, 1.75, 2.2))) : lerp(1.0, 7.5, eIn(tramo(t, 6.15, 6.75))); }
  estado() {
    const t = this.t;
    const pose = { cara: t < 0.3 ? "guino" : "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [62, 118], manoI = [9, 160], lataAng = 0, bulto = 0, giro = 0, sx = 1, sy = 1;
    let m;
    if (t < 1.75) {
      // agita la lata como loco
      const kA = tramo(t, 0, 1.45);
      if (t < 1.45) {
        manoD = [62 + 4 * Math.sin(t * 31), 112 + 16 * Math.sin(t * 46)];
        lataAng = 0.25 * Math.sin(t * 46 + 1);
        bulto = 0.12 * kA * (0.7 + 0.3 * Math.sin(t * 50));
        pose.rc = 0.04 * Math.sin(t * 23);
      } else {
        const k = eInOut(tramo(t, 1.45, 1.7));
        manoD = mezcla([62, 112], [76, 178], k); lataAng = Math.PI * k; bulto = 0.12;
        pose.cara = "guino";
      }
      m = matAv(W / 2, PIES, 1.45);
    } else {
      // vuela: la cabeza apunta hacia donde va; la lata echa espuma por detrás
      const [x, y] = this.pos(t), [x2, y2] = this.pos(t + 0.02);
      let ang = Math.atan2(y2 - y, x2 - x) + Math.PI / 2;
      if (ang > Math.PI) ang -= 2 * Math.PI;
      const kCam = eInOut(tramo(t, 6.15, 6.55));
      giro = ang * (1 - kCam);
      manoD = mezcla([74, 158], [112, 70], kCam); lataAng = Math.PI;
      manoI = mezcla([-12 + 22 * Math.sin(t * 12), 112 + 26 * Math.cos(t * 10)], [-34, 70], kCam);
      pose.piernaI = [0, 0.28 * Math.sin(t * 9)]; pose.piernaD = [0, -0.28 * Math.sin(t * 9 + 1)];
      pose.cara = t < 3.2 ? "sorpresa" : t < 5.3 ? "risa" : "sorpresa";
      if (t >= 6.75) {
        pose.cara = "dormido"; sx = 1.2; sy = 0.86;
        const s = t - 6.75, caida = s < 0.85 ? 55 * s : 55 * 0.85 + 1600 * (s - 0.85) * (s - 0.85) + 45 * (s - 0.85);
        m = matAv(x, y + caida, this.escala(t), 0, sx, sy, [39, 30]);
      } else m = matAv(x, y, this.escala(t), giro, 1, 1, mezcla([39, 116], [39, 30], eInOut(tramo(t, 6.15, 6.75))));
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD = (g, mm) => dibujarLata(g, mm[0], mm[1], lataAng, { bulto, abierta: t > 1.75 });
    return { pose, m, lataAng };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    if (t > 0.8 && t < 1.45 && Math.random() < 20 * dt) { const q = aPant(e.m, [e.pose.manoD[0], e.pose.manoD[1] - 13]); p.nueva(P.ESPUMA, q[0], q[1], azar(-60, 60), azar(-180, -60), 0.4, azar(3, 5)); }
    this.una("abre", t > 1.75, () => {
      temblar(16, 0.35);
      const q = aPant(matAv(W / 2, PIES, 1.45), [76, 192]);
      for (let i = 0; i < 60; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-420, 420), azar(-120, 260), azar(0.5, 1.1), azar(8, 18));
    });
    // chorro de espuma: sale de la boca de la lata, hacia atrás
    if (t > 1.75 && t < 6.6) {
      const boquilla = aPant(e.m, [e.pose.manoD[0], e.pose.manoD[1] + 13]);
      const [x, y] = this.pos(t), [x2, y2] = this.pos(t + 0.02);
      let vx = x - x2, vy = y - y2; const d = Math.hypot(vx, vy) || 1; vx /= d; vy /= d;
      for (let i = 0; i < 9; i++) p.nueva(P.ESPUMA, boquilla[0] + azar(-4, 4), boquilla[1] + azar(-4, 4), vx * azar(160, 380) + azar(-60, 60), vy * azar(160, 380) + azar(-60, 60), azar(0.35, 0.8), azar(5, 12));
    }
    this.una("plaf", t > 6.75, () => { this.splat = true; temblar(24, 0.5); });
    p.actualizar(dt);
  }
  letrero() {
    if (this.SALUD) return this.SALUD;
    const tam = 190, c = lienzoNuevo(860, 260), g = c.getContext("2d");
    g.font = `${tam}px ${FB}`; g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.lineJoin = "round";
    g.lineWidth = 26; g.strokeStyle = "#e9dcb3"; g.strokeText("¡SALUD!", 430, 205);
    g.lineWidth = 14; g.strokeStyle = "#fffaf0"; g.strokeText("¡SALUD!", 430, 205);
    g.fillStyle = "#ffffff"; g.fillText("¡SALUD!", 430, 205);
    // burbujas por el borde de las letras
    const d = g.getImageData(0, 0, c.width, c.height).data, r = semilla(11);
    g.fillStyle = "#ffffff";
    for (let i = 0; i < 260; i++) {
      const x = (r() * c.width) | 0, y = (r() * c.height) | 0;
      if (d[(y * c.width + x) * 4 + 3] > 100) { g.beginPath(); g.arc(x, y, 3 + r() * 8, 0, 6.283); g.fill(); }
    }
    return (this.SALUD = c);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // ¡SALUD! escrito con la espuma al pasar
    if (t > 3.1) {
      const L = this.letrero(), x0 = W / 2 - L.width / 2, y0 = 190;
      const borde = t < 5.25 ? this.pos(t)[0] + 10 : W;
      const a = 1 - tramo(t, 6.0, 6.45);
      if (borde > x0 && a > 0) {
        g.save(); g.globalAlpha = a; g.beginPath(); g.rect(x0, 0, borde - x0, H); g.clip();
        g.drawImage(L, x0, y0); g.restore();
      }
    }
    this.p.dibujar(g);
    if (!this.splat || t < 8.2) pintarAvatar(g, e.m, e.pose, t);
    // golpe contra el cristal
    if (this.splat) {
      const s = t - 6.75;
      // al final la espuma resbala por el cristal y se va: acaba en negro
      const caeEsp = t > 8.95 ? 900 * (t - 8.95) * (t - 8.95) : 0;
      dibujarManchas(g, Math.max(0, s - 0.05), caeEsp, Math.min(1, s * 12));
      if (s < 0.5) {
        const k = 1 - s / 0.5;
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * k;
        g.drawImage(BLOB.blanco, W / 2 - 500, 0, 1000, 600); g.restore();
      }
      // reflejos del cristal
      g.save(); g.globalAlpha = 0.12 * (1 - tramo(t, 8.8, 9.5)); g.fillStyle = "#fff";
      g.beginPath(); g.moveTo(120, 0); g.lineTo(230, 0); g.lineTo(60, 600); g.lineTo(-50, 600); g.fill();
      g.beginPath(); g.moveTo(300, 0); g.lineTo(335, 0); g.lineTo(165, 600); g.lineTo(130, 600); g.fill();
      g.restore();
      if (s < 0.8) {
        const k = tramo(s, 0, 0.12);
        g.save(); g.translate(W - 190, 120); g.rotate(0.14); g.scale(eBack(k), eBack(k));
        txt(g, "¡PLAF!", 0, 0, { tam: 96, peso: 400, fam: FC, color: "#ffffff", borde: "#1b6fa3", bordeAncho: 10, alfa: 1 - tramo(s, 0.55, 0.8), esp: 3 });
        g.restore();
      }
    }
    // empieza en negro
    const aIn = 1 - tramo(t, 0, 0.35);
    if (aIn > 0) { g.fillStyle = `rgba(0,0,0,${aIn})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00105", nombre: "Cohete de espuma", crear: () => new EscenaCohete() });
})();
