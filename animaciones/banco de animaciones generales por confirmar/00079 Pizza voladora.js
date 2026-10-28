"use strict";
/*
 * 00079 · PIZZA VOLADORA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Delante del horno de leña, hace girar la masa de una pizza en el dedo, cada vez más rápido y más grande, con
 * lanzamientos de pizzero. En el último se le escapa: sale por arriba de la pantalla… y vuelve a caer de lleno en su
 * cara (¡ZAS!). Se queda tapado, hace dos agujeros con el dedo para los ojos, un guiño, otro para la boca y se ríe.
 */
(() => {
const cacheT = cacheTexto();
const HORNO = [150, PIES];

/** Masa girando (vista un poco desde arriba): centro (x, y), radio rx; giro = ángulo acumulado. */
function masa(g, x, y, rx, giro, bamboleo) {
  const ry = rx * 0.26;
  g.save(); g.translate(x, y); g.rotate(bamboleo);
  g.fillStyle = "#c9a56a"; g.beginPath(); g.ellipse(0, 2.5, rx, ry, 0, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(-rx * 0.2, -ry * 0.3, 1, 0, 0, rx);
  gr.addColorStop(0, "#fff6dc"); gr.addColorStop(0.75, "#f1dcaa"); gr.addColorStop(1, "#d9b77a");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(185,140,80,.6)"; g.lineWidth = Math.max(1, rx * 0.05);
  g.beginPath(); g.ellipse(0, 0, rx * 0.86, ry * 0.8, 0, 0, 6.283); g.stroke();
  // marcas que giran (se ve que da vueltas)
  g.fillStyle = "rgba(170,120,60,.55)";
  for (let i = 0; i < 6; i++) { const a = giro + (i * Math.PI) / 3; g.beginPath(); g.ellipse(Math.cos(a) * rx * 0.55, Math.sin(a) * ry * 0.55, rx * 0.06, ry * 0.12, 0, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.6)";
  for (let i = 0; i < 10; i++) { const a = giro * 0.7 + i * 0.63; g.fillRect(Math.cos(a) * rx * 0.75, Math.sin(a) * ry * 0.7, 1.4, 1.4); }
  g.restore();
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(440, 300), x = c.getContext("2d");
  x.translate(220, 150);
  x.fillStyle = "#ffd34d"; x.strokeStyle = "#3a2400"; x.lineWidth = 8; x.lineJoin = "round";
  x.beginPath(); for (let i = 0; i < 24; i++) { const a = (i * Math.PI) / 12, r = i % 2 ? 92 : 140; x.lineTo(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.85); } x.closePath(); x.fill(); x.stroke();
  txt(x, "¡ZAS!", 0, 46, { tam: 150, peso: 400, fam: FC, color: "#ffffff", borde: "#b0102a", bordeAncho: 14, esp: 5 });
  cacheT.set(1, c);
  return c;
}
class EscenaPizza extends Escena {
  constructor() {
    super(9.3);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.55; this.X = 560;
    this.p = new Parts(260);
    this.giro = 0; this.agujeros = [];
  }
  /** Altura extra de la masa sobre el dedo (lanzamientos de pizzero) y dónde está si vuela. */
  salto(t) {
    let h = 0;
    for (const [t0, d, alto] of [[1.35, 0.5, 40], [2.1, 0.7, 95]]) if (t > t0 && t < t0 + d) { const u = (t - t0) / d; h = Math.max(h, 4 * alto * u * (1 - u)); }
    return h;
  }
  estado(t = this.t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [78, 10], manoI = [10, 156], sy = 1, dx = 0;
    // hace girar la masa: la mano bombea en cada lanzamiento
    for (const ts of [1.35, 2.1, 2.9]) if (t > ts - 0.15 && t < ts + 0.12) manoD = [78, 10 + 14 * Math.sin(((t - ts + 0.15) / 0.27) * Math.PI)];
    if (t > 0.5 && t < 2.9) pose.cara = t > 1.0 ? "guino" : "sonrisa";
    pose.rc = t < 2.9 ? 0.05 * Math.sin(t * 3) - 0.08 : 0;
    // se escapa: la busca con la mirada
    if (t >= 2.9 && t < 4.85) {
      pose.cara = t < 3.6 ? "sorpresa" : t < 4.2 ? "borracho" : "sorpresa";
      pose.rc = t < 3.6 ? -0.22 : t < 4.2 ? 0.14 * Math.sin((t - 3.6) * 9) : -0.2;
      const k = eInOut(tramo(t, 3.3, 3.7));
      manoD = mezcla([78, 10], [98, 60], k);
      if (t > 3.6 && t < 4.3) manoI = [24, 34]; // se hace visera con la mano
      dx = 18 * Math.sin((t - 3.3) * 4) * tramo(t, 3.3, 3.6) * (1 - tramo(t, 4.2, 4.5));
    }
    // ¡ZAS! tapado: agita los brazos
    if (t >= 4.85 && t < 5.75) {
      const a = Math.sin(t * 22);
      manoD = [104, 50 + 22 * a]; manoI = [-26, 50 - 22 * a];
      pose.rc = 0.08 * Math.sin(t * 9); sy = 1 - 0.06 * Math.sin(Math.PI * tramo(t, 4.85, 5.05));
      pose.cara = "sorpresa";
    }
    // pica los agujeros con el dedo
    const pinchas = [[5.95, [29, 42]], [6.35, [52, 42]], [7.1, [41, 59]]];
    if (t >= 5.75) { manoD = [72, 150]; manoI = [10, 156]; pose.cara = "sorpresa"; }
    for (const [tp, P0] of pinchas) {
      if (t > tp - 0.25 && t < tp + 0.18) {
        const k = t < tp ? eInOut(tramo(t, tp - 0.25, tp)) : 1 - eInOut(tramo(t, tp, tp + 0.18));
        manoD = mezcla([72, 150], [P0[0] + 8, P0[1] + 12], k);
      }
    }
    if (t >= 6.6 && t < 7.0) pose.cara = t > 6.75 && t < 6.95 ? "guino" : "sorpresa";
    if (t >= 7.15) {
      pose.cara = "risa"; pose.rc = 0.05 * Math.sin(t * 12);
      const k = eInOut(tramo(t, 7.4, 7.7));
      manoD = mezcla(manoD, [100, 104], k); manoI = mezcla(manoI, [-22, 104], k);
    }
    pose.manoD = manoD; pose.manoI = manoI;
    // la masa en la cara (por debajo de los brazos)
    if (t >= 4.85) {
      const kk = eBack(tramo(t, 4.85, 5.0)), rc = pose.rc, ag = this.agujeros;
      pose.objI = (g) => {
        g.save();
        g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(rc); g.translate(-RIG.cuello[0], -RIG.cuello[1]);
        g.translate(39, 34); g.scale(kk, 2 - kk); g.translate(-39, -34);
        g.beginPath();
        g.moveTo(-6, 30); g.bezierCurveTo(-8, -18, 86, -18, 84, 30);
        for (let i = 0; i <= 8; i++) { const x = 84 - i * 11.25, y = 70 + (i % 2 ? 12 : 4) + 3 * Math.sin(t * 3 + i); g.lineTo(x, y); }
        g.closePath();
        for (const h of ag) { g.moveTo(h[0] + h[2], h[1]); g.ellipse(h[0], h[1], h[2], h[3], 0, 0, 6.283); }
        const gr = g.createRadialGradient(30, 18, 4, 39, 34, 52);
        gr.addColorStop(0, "#fff6dc"); gr.addColorStop(0.8, "#f1dcaa"); gr.addColorStop(1, "#d6b274");
        g.fillStyle = gr; g.fill("evenodd");
        g.strokeStyle = "rgba(160,120,60,.55)"; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = "rgba(255,255,255,.55)";
        for (let i = 0; i < 14; i++) g.fillRect(4 + ((i * 29) % 70), 4 + ((i * 17) % 60), 1.3, 1.3);
        g.restore();
      };
    }
    const m = matAv(this.X + dx, PIES, this.ESC, 0, 1, sy);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.giro += dt * lerp(5, 22, tramo(t, 0.3, 2.9));
    // harina mientras gira
    if (t > 0.6 && t < 2.9 && Math.random() < 10 * dt) {
      const e = this.estado(), q = aPant(e.m, [78, -2]);
      p.nueva(P.VAPOR, q[0] + azar(-50, 50), q[1] - this.salto(t), azar(-60, 60), azar(-20, 30), azar(0.5, 0.9), azar(8, 14));
    }
    this.una("escapa", t > 2.9, () => { temblar(5, 0.2); const q = aPant(this.estado().m, [78, -2]); this.vuela = { x: q[0], y: q[1] }; });
    this.una("zas", t > 4.85, () => {
      temblar(24, 0.5);
      const q = aPant(this.estado().m, [39, 34]);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(150, 520); p.nueva(P.VAPOR, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1.0), azar(18, 34)); }
    });
    for (const [i, [tp, P0, r1, r2]] of [[5.95, [29, 42], 7.5, 7], [6.35, [52, 42], 7.5, 7], [7.1, [40, 58], 10, 6]].entries()) {
      this.una("pincha" + i, t >= tp, () => {
        this.agujeros.push([P0[0], P0[1], r1, r2]);
        temblar(3, 0.1);
        const e = this.estado(), q = aPant(e.m, P0);
        for (let k = 0; k < 8; k++) p.nueva(P.VAPOR, q[0], q[1], azar(-80, 80), azar(-80, 40), azar(0.3, 0.6), azar(6, 12));
      });
    }
    // fuego del horno
    if (Math.random() < 30 * dt) p.nueva(P.LLAMA, HORNO[0] + azar(-50, 50), HORNO[1] - 70 + azar(0, 20), azar(-10, 10), azar(-60, -20), azar(0.2, 0.4), azar(24, 40), Math.random() < 0.3 ? 1 : 0);
    p.alfa = 1;
    p.actualizar(dt);
  }
  horno(g, t) {
    if (!this.sprH) {
      const c = lienzoNuevo(420, 330), x = c.getContext("2d");
      x.save(); x.beginPath(); x.moveTo(10, 330); x.lineTo(10, 170); x.bezierCurveTo(10, 20, 410, 20, 410, 170); x.lineTo(410, 330); x.closePath(); x.clip();
      const gr = x.createLinearGradient(0, 40, 0, 330);
      gr.addColorStop(0, "#9a4a2a"); gr.addColorStop(1, "#4a2010");
      x.fillStyle = gr; x.fillRect(0, 0, 420, 330);
      x.strokeStyle = "rgba(40,15,5,.55)"; x.lineWidth = 2;
      for (let fy = 40, f = 0; fy < 330; fy += 22, f++) {
        x.beginPath(); x.moveTo(0, fy); x.lineTo(420, fy); x.stroke();
        for (let bx = (f % 2) * 22; bx < 420; bx += 44) { x.beginPath(); x.moveTo(bx, fy); x.lineTo(bx, fy + 22); x.stroke(); }
      }
      x.restore();
      // boca del horno
      x.fillStyle = "#120604"; x.beginPath(); x.moveTo(130, 330); x.lineTo(130, 260); x.bezierCurveTo(130, 200, 290, 200, 290, 260); x.lineTo(290, 330); x.closePath(); x.fill();
      x.strokeStyle = "#c98a5a"; x.lineWidth = 8; x.stroke();
      this.sprH = c;
    }
    g.drawImage(this.sprH, HORNO[0] - 210, PIES - 330);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.75 + 0.15 * Math.sin(t * 17);
    g.drawImage(BLOB.naranja, HORNO[0] - 90, PIES - 110, 180, 120); g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    foco(g, this.X, this.X, PIES, 230, 0.7);
    this.horno(g, t);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB2.oro, 120, PIES - 30, 820, 64); g.restore();
    // sombra que crece: ¡que viene!
    if (t > 4.2 && t < 4.9) {
      const k = tramo(t, 4.2, 4.85);
      g.fillStyle = `rgba(0,0,0,${0.6 * k})`; g.beginPath(); g.ellipse(this.X, PIES + 2, 30 + 60 * k, 6 + 8 * k, 0, 0, 6.283); g.fill();
    }
    // masa en el dedo
    if (t < 2.9) {
      e.pose.objD2 = (gg, m) => {
        const rx = lerp(30, 40, tramo(t, 0.5, 2.6)), h = this.salto(t) / this.ESC;
        if (t > 2.4) { gg.save(); gg.strokeStyle = "rgba(255,255,255,.5)"; gg.lineWidth = 1.2; for (const s of [-1, 1]) { gg.beginPath(); gg.ellipse(m[0], m[1] - 6 - h, rx + 6, rx * 0.26 + 3, 0, s > 0 ? 0.2 : Math.PI + 0.2, s > 0 ? 1.2 : Math.PI + 1.2); gg.stroke(); } gg.restore(); }
        masa(gg, m[0], m[1] - 6 - h, rx, this.giro, 0.04 * Math.sin(t * 7));
      };
    }
    pintarAvatar(g, e.m, e.pose, t);
    // la masa volando: sube y se va; vuelve a caer en la cara
    if (this.vuela && t < 4.85) {
      if (t < 3.4) {
        const s = t - 2.9, y = this.vuela.y - 1400 * s;
        masa(g, this.vuela.x, y, 40 * this.ESC, this.giro, 0.2 * Math.sin(t * 9));
      } else if (t > 4.45) {
        const u = tramo(t, 4.45, 4.85), cara = aPant(this.estado(4.85).m, [39, 30]);
        masa(g, lerp(cara[0] + 40, cara[0], u), lerp(-90, cara[1], u * u), lerp(60, 72, u), this.giro * 0.4, 0.35 * Math.sin(t * 8) * (1 - u));
        g.save(); g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 3;
        for (let i = -1; i <= 1; i++) { const x = lerp(cara[0] + 40, cara[0], u) + i * 34, y = lerp(-90, cara[1], u * u); g.beginPath(); g.moveTo(x, y - 40); g.lineTo(x, y - 110); g.stroke(); }
        g.restore();
      }
    }
    this.p.dibujar(g);
    // ¡ZAS!
    if (t > 4.85 && t < 6.8) {
      const c = titulo(), k = tramo(t, 4.85, 5.0), s = lerp(0.2, 1, eBack(k)) * (1 + 0.03 * Math.sin(t * 20));
      g.save(); g.globalAlpha = 1 - tramo(t, 6.4, 6.8); g.translate(800, 170); g.rotate(0.12); g.scale(s * 0.9, s * 0.9);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    // empieza en negro; acaba con un círculo sobre la cara tapada
    const aIn = 1 - tramo(t, 0, 0.45);
    if (aIn > 0) { g.fillStyle = `rgba(0,0,0,${aIn})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const kIris = tramo(t, 8.35, 9.2);
    if (kIris > 0) {
      const c = aPant(e.m, [39, 40]), R = Math.max(0.1, 780 * Math.pow(1 - kIris, 1.7));
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(c[0] + R, c[1]); g.arc(c[0], c[1], R, 0, 6.283);
      g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00079", nombre: "Pizza voladora", crear: () => new EscenaPizza() });
})();
