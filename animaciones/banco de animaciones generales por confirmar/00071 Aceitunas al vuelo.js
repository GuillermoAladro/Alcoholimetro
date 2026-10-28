"use strict";
/*
 * 00071 · ACEITUNAS AL VUELO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre un círculo sobre él con un cuenco de aceitunas. Lanza aceitunas al aire y las caza con la boca una tras
 * otra (¡ÑAM!, cada vez más grande); la última le rebota en la nariz y se va rodando. Él se encoge de hombros, se
 * echa el cuenco entero a la boca (¡ÑAM! gigante) y se apaga la luz.
 */
(() => {
const G = 1500;
const cacheT = cacheTexto();
/** El ¡ÑAM! grande, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(620, 240), x = c.getContext("2d");
  txt(x, "¡ÑAM!", 310, 180, { tam: 175, peso: 400, fam: FC, color: "#d6f25a", borde: "#1f3300", bordeAncho: 14, esp: 6, glow: "rgba(170,230,40,.6)", glowTam: 26 });
  txt(x, "¡ÑAM!", 310, 180, { tam: 175, peso: 400, fam: FC, color: "#d6f25a", esp: 6 });
  cacheT.set(1, c);
  return c;
}
/** Aceituna rellena a tamaño de pantalla (r = radio). */
function aceituna(g, x, y, r, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.25);
  gr.addColorStop(0, "#d6ee7a"); gr.addColorStop(0.45, "#8aac2c"); gr.addColorStop(1, "#3d5a0c");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r * 1.18, r, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(20,40,0,.6)"; g.lineWidth = Math.max(1, r * 0.12); g.stroke();
  g.fillStyle = "#d8261a"; g.beginPath(); g.ellipse(r * 0.95, 0, r * 0.32, r * 0.42, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.45, r * 0.32, r * 0.18, -0.5, 0, 6.283); g.fill();
  g.restore();
}
/** Cuenco con aceitunas en unidades de avatar; (x, y) = la mano que lo sujeta. */
function cuenco(g, x, y, ang, n) {
  g.save(); g.translate(x + 3, y - 3); g.rotate(ang);
  for (let i = 0; i < n; i++) {
    const px = -11 + (i % 5) * 5.5 + (i > 4 ? 2.5 : 0), py = -3 - (i > 4 ? 4 : 0) - (i % 2);
    aceituna(g, px, py, 3.2, i * 0.9);
  }
  const gb = g.createLinearGradient(-17, 0, 17, 0);
  gb.addColorStop(0, "#b9b2a0"); gb.addColorStop(0.4, "#fffaf0"); gb.addColorStop(1, "#a29a86");
  g.fillStyle = gb;
  g.beginPath(); g.moveTo(-17, -1); g.quadraticCurveTo(-15, 11, 0, 11); g.quadraticCurveTo(15, 11, 17, -1); g.closePath(); g.fill();
  g.fillStyle = "#1f62b8"; g.fillRect(-15.5, 3, 31, 2);
  g.strokeStyle = "#fffaf0"; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, -1, 17, 3.6, 0, 0, Math.PI); g.stroke();
  g.restore();
}

class EscenaAceitunas extends Escena {
  constructor() {
    super(10.1);
    titulo(); // se pinta ya, no en el momento del remate
    this.p = new Parts(200);
    this.ESC = 1.55;
    // lanzamientos: cuándo coge, cuándo suelta, cuánto vuela y dónde está él al cazarla
    this.tiros = [
      { tp: 0.55, tr: 0.85, T: 0.95 },
      { tp: 2.05, tr: 2.3, T: 0.95 },
      { tp: 3.5, tr: 3.75, T: 1.3 },
      { tp: 5.35, tr: 5.6, T: 0.85, nariz: true },
    ];
    for (const s of this.tiros) s.tc = s.tr + s.T;
    this.vuelo = []; this.nams = []; this.rueda = null; this.cascada = [];
  }
  xEn(t) {
    // pasitos a los lados para ponerse debajo
    let x = 470;
    x += 80 * eInOut(tramo(t, 2.45, 2.95)) - 80 * eInOut(tramo(t, 3.9, 4.5)) - 70 * eInOut(tramo(t, 4.55, 4.85)) + 70 * eInOut(tramo(t, 5.75, 6.25));
    return x;
  }
  estado(t = this.t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [70, 158], manoI = [31, 130], sy = 1, angC = 0, bote = 0;
    const CUE = [manoI[0] + 2, manoI[1] - 8];
    if (t < 0.55) pose.cara = t > 0.25 ? "guino" : "sonrisa";
    // ¿se está moviendo? piernas
    const v = Math.abs(this.xEn(t + 0.02) - this.xEn(t - 0.02));
    if (v > 0.5) { const a = andar(t * 16, Math.min(1, v / 3)); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote * 0.6; }
    for (const s of this.tiros) {
      // coger del cuenco y lanzar hacia arriba
      if (t >= s.tp - 0.05 && t < s.tr + 0.45) {
        const k1 = eInOut(tramo(t, s.tp, s.tp + 0.18)), k2 = eOut(tramo(t, s.tr - 0.1, s.tr)), k3 = eInOut(tramo(t, s.tr + 0.1, s.tr + 0.45));
        manoD = mezcla(mezcla(mezcla([70, 158], CUE, k1), [84, 78], k2), [70, 158], k3);
        if (t < s.tr) pose.objD2 = (g, m) => aceituna(g, m[0] - 1, m[1] - 5, 5, 0.3);
      }
      // mirar la aceituna, boca abierta y cazar
      if (t >= s.tr && t < s.tc + 0.05) {
        const u = tramo(t, s.tr, s.tc);
        pose.cara = s.nariz && u > 0.92 ? "sorpresa" : u > 0.25 ? "sorpresa" : pose.cara;
        pose.rc = -(s.T > 1 ? 0.3 : 0.22) * Math.sin(Math.PI * Math.min(1, u * 1.15)) - 0.12 * eInOut(tramo(u, 0.55, 1));
      }
      if (!s.nariz && t >= s.tc + 0.05 && t < s.tc + 0.55) {
        pose.cara = t < s.tc + 0.3 ? "risa" : "guino";
        pose.rc = -0.12 * (1 - tramo(t, s.tc, s.tc + 0.3)) + 0.04 * Math.sin((t - s.tc) * 24);
        sy = 1 + 0.012 * Math.sin((t - s.tc) * 24);
      }
    }
    // ¡toc! en la nariz
    const tn = this.tiros[3].tc;
    if (t >= tn && t < tn + 0.4) { pose.cara = "sorpresa"; pose.rc = -0.12 + 0.18 * eOut(tramo(t, tn, tn + 0.12)) - 0.08 * tramo(t, tn + 0.12, tn + 0.4); }
    if (t >= tn + 0.4 && t < 7.15) { pose.cara = "borracho"; pose.rc = 0.16 * eInOut(tramo(t, tn + 0.4, tn + 0.75)); }
    // se encoge de hombros
    const kHom = eInOut(tramo(t, 7.15, 7.35)) * (1 - eInOut(tramo(t, 7.5, 7.7)));
    if (kHom > 0) { manoD = mezcla(manoD, [100, 118], kHom); sy *= 1 - 0.025 * kHom; pose.cara = "risa"; pose.rc = 0.16 * (1 - kHom) + 0.06 * kHom; }
    // se echa el cuenco entero a la boca
    const kSube = eInOut(tramo(t, 7.7, 8.05)), kVacia = eInOut(tramo(t, 8.0, 8.5)), kBaja = eInOut(tramo(t, 8.75, 9.1));
    if (kSube > 0) {
      const rcB = -0.34 * kSube * (1 - kBaja);
      const b = boca(rcB);
      manoI = mezcla(manoI, [b[0] - 12, b[1] + 16], kSube * (1 - kBaja));
      angC = (0.6 + 0.5 * kVacia) * kSube * (1 - kBaja);
      pose.rc = rcB + (kVacia > 0 && kVacia < 1 ? 0.02 * Math.sin(t * 40) : 0);
      pose.cara = t < 8.5 ? "sorpresa" : "guino";
      if (t > 8.5) { sy = 1 + 0.02 * Math.sin(t * 22); pose.rc += 0.05 * Math.sin(t * 22); }
      if (t > 9.1) pose.cara = "risa";
    }
    const nCue = Math.max(0, 9 - (t > this.tiros[0].tp + 0.1 ? 1 : 0) - (t > this.tiros[1].tp + 0.1 ? 1 : 0) - (t > this.tiros[2].tp + 0.1 ? 1 : 0) - (t > this.tiros[3].tp + 0.1 ? 1 : 0) - Math.floor(kVacia * 6));
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objI = (g, m) => cuenco(g, m[0], m[1], angC, nCue);
    const m = matAv(this.xEn(t), PIES + bote, this.ESC, 0, 1, sy);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const [i, s] of this.tiros.entries()) {
      this.una("tira" + i, t >= s.tr, () => {
        const e0 = this.estado(s.tr), R = aPant(e0.m, [84, 74]);
        const e1 = this.estado(s.tc), b = boca(e1.pose.rc);
        const D = aPant(e1.m, s.nariz ? [b[0] + 1, b[1] - 11] : b);
        this.vuelo.push({ i, x0: R[0], y0: R[1], vx: (D[0] - R[0]) / s.T, vy: (D[1] - R[1] - 0.5 * G * s.T * s.T) / s.T, t0: s.tr, tc: s.tc, nariz: !!s.nariz });
      });
      this.una("caza" + i, t >= s.tc, () => {
        this.vuelo = this.vuelo.filter((o) => o.i !== i);
        const e = this.estado(), q = aPant(e.m, boca(e.pose.rc));
        if (!s.nariz) {
          this.nams.push({ t0: t, x: q[0] + [130, -150, 150][i], y: q[1] - [70, 100, 150][i], tam: [56, 76, 100][i], rot: [0.12, -0.14, 0.1][i] });
          temblar(4 + i * 3, 0.2);
          for (let k = 0; k < 6; k++) p.nueva(P.DESTELLO, q[0] + azar(-20, 20), q[1] + azar(-20, 20), 0, 0, 0.25, 30);
        } else {
          temblar(7, 0.25);
          this.rueda = { x: q[0] + 4, y: q[1] - 16, vx: 210, vy: -520, r: 0, t0: t };
          this.toc = t;
        }
      });
    }
    // la aceituna rebotona: cae, bota y se va rodando por la derecha
    if (this.rueda) {
      const A = this.rueda;
      A.vy += G * dt; A.x += A.vx * dt; A.y += A.vy * dt;
      if (A.y > PIES - 12) { A.y = PIES - 12; A.vy = Math.abs(A.vy) > 120 ? -Math.abs(A.vy) * 0.45 : 0; A.vx = Math.max(A.vx, 430); }
      A.r += (A.vx / 9) * dt;
    }
    // cascada de aceitunas hacia la boca
    if (t > 8.02 && t < 8.45 && Math.random() < 22 * dt) {
      const e = this.estado(), q = aPant(e.m, [e.pose.manoI[0] + 6, e.pose.manoI[1] - 12]), b = aPant(e.m, boca(e.pose.rc));
      this.cascada.push({ x: q[0], y: q[1], x1: b[0], y1: b[1], u: 0, r: azar(0, 6) });
    }
    for (const c of this.cascada) c.u += dt / 0.22;
    this.cascada = this.cascada.filter((c) => c.u < 1);
    this.una("ñam", t > 8.5, () => {
      temblar(22, 0.5);
      const e = this.estado(), q = aPant(e.m, boca(e.pose.rc));
      for (let k = 0; k < 24; k++) { const a = azar(0, 6.283), v = azar(200, 520); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(8, 13)); }
    });
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    const apagon = t > 9.45 ? 1 : 0;
    if (!apagon) {
      foco(g, e.m.e + 39 * this.ESC, e.m.e + 39 * this.ESC, PIES, 170, 0.8);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB2.oro, 0, PIES - 30, W, 70); g.restore();
      // la aceituna que se va rodando (por detrás de los pies)
      if (this.rueda) aceituna(g, this.rueda.x, this.rueda.y, 12, this.rueda.r);
      pintarAvatar(g, e.m, e.pose, t);
      // aceitunas en el aire
      for (const o of this.vuelo) {
        const s = t - o.t0;
        aceituna(g, o.x0 + o.vx * s, o.y0 + o.vy * s + 0.5 * G * s * s, 12, s * 9);
      }
      for (const c of this.cascada) aceituna(g, lerp(c.x, c.x1, c.u), lerp(c.y, c.y1, c.u) - 20 * Math.sin(c.u * Math.PI), 8, c.r + c.u * 5);
      this.p.dibujar(g);
      // ¡toc! en la nariz: estrellitas
      if (this.toc && t - this.toc < 0.7) {
        const q = aPant(e.m, [39, 30]), k = (t - this.toc) / 0.7;
        for (let i = 0; i < 4; i++) { const a = t * 7 + (i * Math.PI) / 2; brillo(g, q[0] + Math.cos(a) * 46, q[1] - 26 + Math.sin(a) * 12, 13, 1 - k); }
        g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 3; g.lineCap = "round";
        const n = aPant(e.m, [39, 45]);
        for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.15 + (i - 2) * 0.4, r0 = 52 + k * 22; g.beginPath(); g.moveTo(n[0] + Math.cos(a) * r0, n[1] + Math.sin(a) * r0); g.lineTo(n[0] + Math.cos(a) * (r0 + 14), n[1] + Math.sin(a) * (r0 + 14)); g.stroke(); }
        g.restore();
        g.save(); g.translate(n[0] + 105, n[1] - 30); g.rotate(0.15); g.scale(eBack(Math.min(1, k * 5)), eBack(Math.min(1, k * 5)));
        txt(g, "¡TOC!", 0, 0, { tam: 46, peso: 400, fam: FC, color: "#ffffff", borde: "#222", bordeAncho: 7, alfa: 1 - tramo(k, 0.7, 1), esp: 2 });
        g.restore();
      }
      // ¡ÑAM! pequeños
      for (const N of this.nams) {
        const k = (t - N.t0) / 0.85;
        if (k < 0 || k > 1) continue;
        g.save(); g.translate(N.x, N.y - k * 30); g.rotate(N.rot); g.scale(eBack(Math.min(1, k * 4)), eBack(Math.min(1, k * 4)));
        txt(g, "¡ÑAM!", 0, 0, { tam: N.tam, peso: 400, fam: FC, color: "#d6f25a", borde: "#1f3300", bordeAncho: 8, alfa: 1 - tramo(k, 0.7, 1), esp: 2 });
        g.restore();
      }
    }
    // ¡ÑAM! gigante (se queda un momento en el negro tras el apagón)
    if (t > 8.5) {
      const k = tramo(t, 8.5, 8.75), s = lerp(0.2, 1, eBack(k)) * (1 + 0.03 * Math.sin(t * 18));
      const a = 1 - tramo(t, 9.6, 10.05);
      const c = titulo();
      g.save(); g.globalAlpha = a; g.translate(W / 2 + 225, 185); g.rotate(-0.08); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height * 0.75); g.restore();
    }
    // empieza con un círculo que se abre sobre su cara
    const kIris = 1 - eInOut(tramo(t, 0.02, 0.7));
    if (kIris > 0) {
      const c = aPant(e.m, [39, 40]), R = Math.max(0.1, 760 * Math.pow(1 - kIris, 1.5));
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(c[0] + R, c[1]); g.arc(c[0], c[1], R, 0, 6.283);
      g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00071", nombre: "Aceitunas al vuelo", crear: () => new EscenaAceitunas() });
})();
