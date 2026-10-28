"use strict";
/*
 * 00070 · BRAVAS PICANTES
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra con una cazuelita de bravas, pincha una y se la come tan feliz… hasta que pica: se pone rojo de abajo arriba
 * y echa fuego por la boca como un dragón (¡PICAAA!). Coge la jarra de la mesa, se la bebe de un trago y le sale
 * vapor por las orejas como a una olla exprés. Un último eructito de fuego y un círculo se cierra sobre su cara.
 */
(() => {
const cacheT = cacheTexto();

/** Cazuelita de barro con bravas; (x, y) = la mano que la sujeta por debajo. n = patatas que quedan. */
function dibujarCazuela(g, x, y, n, palillo) {
  g.save(); g.translate(x + 3, y - 4);
  // cuerpo de barro
  const gb = g.createLinearGradient(-18, 0, 18, 0);
  gb.addColorStop(0, "#5e220c"); gb.addColorStop(0.35, "#b9562a"); gb.addColorStop(0.6, "#d06a36"); gb.addColorStop(1, "#5a200b");
  g.fillStyle = gb;
  g.beginPath(); g.moveTo(-18, -2); g.quadraticCurveTo(-16, 9, 0, 9); g.quadraticCurveTo(16, 9, 18, -2); g.closePath(); g.fill();
  // borde
  g.fillStyle = "#e08850"; g.beginPath(); g.ellipse(0, -2, 18.5, 5, 0, 0, 6.283); g.fill();
  g.fillStyle = "#4a1a08"; g.beginPath(); g.ellipse(0, -2, 15.5, 3.6, 0, 0, 6.283); g.fill();
  // patatas en montón
  const pos = [[-9, -4], [-3, -6], [4, -5], [10, -3], [-6, -9], [1, -10], [7, -8], [-1, -13]];
  for (let i = 0; i < Math.min(n, pos.length); i++) {
    const [px, py] = pos[i];
    g.save(); g.translate(px, py); g.rotate(((i * 37) % 7) * 0.12 - 0.35);
    g.fillStyle = "#c98a2a"; rectR(g, -3.4, -2.9, 6.8, 6.2, 1.6); g.fill();
    g.fillStyle = "#f6cf63"; rectR(g, -3.1, -3.2, 6, 4.6, 1.5); g.fill();
    g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-2.2, -2.6, 2.4, 0.9);
    g.restore();
  }
  // salsa brava y alioli
  g.strokeStyle = "#e2361a"; g.lineWidth = 2.2; g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); g.moveTo(-11, -5); g.lineTo(-6, -11); g.lineTo(-1, -6); g.lineTo(4, -12); g.lineTo(9, -6); g.lineTo(12, -4); g.stroke();
  g.fillStyle = "#fff6dc";
  for (const [ax, ay] of [[-7, -7], [2, -8], [8, -5], [-2, -11]]) { g.beginPath(); g.arc(ax, ay, 1.2, 0, 6.283); g.fill(); }
  if (palillo) { g.strokeStyle = "#e9cf98"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(3, -9); g.lineTo(9, -24); g.stroke(); }
  g.restore();
}
/** Palillo con una patata pinchada (desde la mano hacia arriba a la izquierda). */
function dibujarPalillo(g, x, y, conPatata) {
  g.save(); g.translate(x, y); g.rotate(-0.75);
  g.strokeStyle = "#e9cf98"; g.lineWidth = 1.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 2); g.lineTo(0, -19); g.stroke();
  if (conPatata) {
    g.translate(0, -17);
    g.fillStyle = "#c98a2a"; rectR(g, -3.6, -3.2, 7.2, 6.8, 1.7); g.fill();
    g.fillStyle = "#f6cf63"; rectR(g, -3.3, -3.5, 6.4, 5, 1.6); g.fill();
    g.fillStyle = "#e2361a"; g.beginPath(); g.ellipse(0, -3, 3.4, 1.6, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fff6dc"; g.beginPath(); g.arc(1, -3.8, 1, 0, 6.283); g.fill();
  }
  g.restore();
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(760, 230), x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 40, 0, 190);
  gr.addColorStop(0, "#fff7b0"); gr.addColorStop(0.45, "#ffb21a"); gr.addColorStop(1, "#e2280c");
  txt(x, "¡PICAAA!", 380, 172, { tam: 170, peso: 400, fam: FC, color: gr, borde: "#3a0800", bordeAncho: 14, esp: 6, glow: "rgba(255,90,0,.9)", glowTam: 34, max: 700 });
  txt(x, "¡PICAAA!", 380, 172, { tam: 170, peso: 400, fam: FC, color: gr, esp: 6, max: 700 });
  cacheT.set(1, c);
  return c;
}
class EscenaBravas extends Escena {
  constructor() {
    super(9.7);
    titulo(); // se pinta ya, no en el momento del remate
    this.p = new Parts(360);
    this.fuego = []; this.sudor = [];
    this.ESC = 1.55; this.X = 440; this.x = -70; this.fase = 0;
    // la jarra en la mesa: el asa donde llega la mano
    this.TJ = [118, 136];
    this.JX = this.X + (this.TJ[0] - 39) * this.ESC; this.JY = PIES - (232 - this.TJ[1]) * this.ESC;
  }
  rojo() { return eInOut(tramo(this.t, 2.85, 3.55)) * (1 - eInOut(tramo(this.t, 6.9, 7.9))); }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [70, 158], manoI = [33, 128], bote = 0, dx = 0, sy = 1;
    const CAZ = [manoI[0] + 3, manoI[1] - 10];
    // entra andando
    if (t < 1.3) { const a = andar(this.fase, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; manoI = [33, 128 + 2 * Math.sin(this.fase)]; }
    // pincha una patata y se la come
    const kPin = eInOut(tramo(t, 1.3, 1.55)), kBoca = eInOut(tramo(t, 1.62, 1.98)), kVuelve = eInOut(tramo(t, 2.08, 2.4)), kSuelta = eInOut(tramo(t, 2.45, 2.75));
    const BOCA = [50, 66];
    manoD = mezcla(mezcla(mezcla(mezcla(manoD, CAZ, kPin), BOCA, kBoca), CAZ, kVuelve), [70, 158], kSuelta);
    if (t > 1.42 && t < 2.42) pose.objD2 = (g, m) => dibujarPalillo(g, m[0] - 1, m[1] - 2, t < 2.0);
    if (t > 1.62 && t < 2.0) pose.rc = 0.06 * kBoca;
    if (t >= 2.0 && t < 2.8) { pose.cara = "dormido"; pose.rc = 0.035 * Math.sin(t * 15); sy = 1 + 0.006 * Math.sin(t * 15); }
    // ¡pica!
    const rojo = this.rojo();
    if (t >= 2.8 && t < 3.5) {
      pose.cara = "sorpresa";
      const tb = 0.4 + 2.2 * tramo(t, 2.8, 3.5);
      dx = azar(-tb, tb); pose.rc = azar(-0.02, 0.02) * tb;
    }
    // coge aire y echa fuego
    if (t >= 3.4 && t < 3.6) { pose.cara = "sorpresa"; pose.rc = -0.16 * eOut(tramo(t, 3.4, 3.58)); sy = 1 + 0.03 * tramo(t, 3.4, 3.58); }
    if (t >= 3.6 && t < 5.05) {
      pose.cara = "sorpresa"; pose.rc = 0.13 + 0.02 * Math.sin(t * 40);
      dx = 3 + azar(-2, 2); manoD = [86, 150 + 3 * Math.sin(t * 30)];
    }
    if (t >= 5.05 && t < 5.3) { pose.cara = "borracho"; pose.rc = 0.05; }
    // agarra la jarra a la desesperada y se la bebe de un trago
    let jarra = null;
    const kCoge = eInOut(tramo(t, 5.2, 5.5)), kSube = eInOut(tramo(t, 5.55, 5.85)), kTrago = tramo(t, 5.85, 6.85), kBaja = eInOut(tramo(t, 6.85, 7.15));
    if (t >= 5.2) {
      const rcB = -0.34 * eInOut(tramo(t, 5.75, 6.0)) * (1 - kBaja) + (kTrago > 0 && kTrago < 1 ? 0.025 * Math.sin(t * 40) : 0);
      const inc = (-0.4 * kSube - 1.25 * eInOut(kTrago)) * (1 - kBaja);
      const b = boca(rcB), r = rot2(JARRA.borde, inc), obj = [b[0] - r[0], b[1] - r[1]];
      let mano = mezcla(manoD, this.TJ, kCoge);
      if (t >= 5.5) {
        mano = mezcla(this.TJ, obj, kSube); mano[0] += Math.sin(kSube * Math.PI) * 10;
        if (kBaja > 0) mano = mezcla(obj, [72, 120], kBaja);
      }
      manoD = mano; pose.rc = t >= 5.5 ? rcB : pose.rc;
      jarra = { inc, nivel: t < 5.85 ? 1 : 1 - eIn(kTrago) * 0.2 - kTrago * 0.8 };
      if (t >= 5.5) pose.jarra = { inc, nivel: clamp(jarra.nivel, 0, 1) };
      if (t >= 5.3 && t < 5.85) pose.cara = "sorpresa";
      if (t >= 5.85 && t < 6.9) pose.cara = "dormido";
    }
    // vapor: alivio y risa
    if (t >= 6.9 && t < 7.7) { pose.cara = "dormido"; sy = 1 + 0.02 * Math.sin(t * 20) * (1 - tramo(t, 6.9, 7.7)); }
    if (t >= 7.7) pose.cara = "risa";
    if (t >= 8.05 && t < 8.35) { pose.cara = "sorpresa"; pose.rc = 0.1; }
    if (t >= 8.35) { pose.cara = t < 8.6 ? "guino" : "risa"; pose.rc = 0.04 * Math.sin(t * 9); }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objI = (g, m) => dibujarCazuela(g, m[0], m[1], t < 1.98 ? 8 : 7, t > 2.42);
    const m = matAv(this.x + dx, PIES + bote, ESC, 0, 1, sy);
    return { pose, m, rojo };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.x = t < 1.3 ? lerp(-70, this.X, eOut(t / 1.3) * 0.25 + (t / 1.3) * 0.75) : this.X;
    if (t < 1.3) this.fase += dt * 9;
    const e = this.estado(), M = aPant(e.m, boca(e.pose.rc));
    // sudor
    if (t > 2.85 && t < 5.1 && Math.random() < 9 * dt) {
      const lado = Math.random() < 0.5 ? -1 : 1, q = aPant(e.m, [39 + lado * 27, 22 + azar(0, 18)]);
      this.sudor.push({ x: q[0], y: q[1], vx: lado * azar(80, 200), vy: azar(-260, -120), v: 0.9 });
    }
    // humito por las orejas antes del fuego
    if (t > 3.15 && t < 3.6 && Math.random() < 20 * dt) {
      const lado = Math.random() < 0.5 ? -1 : 1, q = aPant(e.m, [39 + lado * 31, 46]);
      p.nueva(P.HUMO, q[0], q[1], lado * azar(40, 90), azar(-80, -40), azar(0.4, 0.7), azar(14, 24));
    }
    // ¡FUEGO!
    this.una("fuego", t > 3.6, () => {
      temblar(26, 0.6);
      for (let i = 0; i < 18; i++) { const a = azar(-Math.PI, 0), v = azar(250, 600); p.nueva(P.CHISPA, M[0], M[1], Math.cos(a) * v - 200, Math.sin(a) * v, azar(0.3, 0.6), azar(8, 14)); }
    });
    if (t > 3.6 && t < 5.05) {
      temblar(7, 0.15);
      const n = Math.round(380 * dt);
      for (let i = 0; i < n; i++) {
        const a = Math.PI + 0.18 + azar(-0.13, 0.13) + 0.05 * Math.sin(t * 7), v = azar(800, 1150);
        this.fuego.push({ x: M[0] - 6, y: M[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.4, 0.62), vm: 0.6, s: azar(30, 46) });
      }
      if (Math.random() < 16 * dt) { const a = Math.PI + azar(-0.3, 0.6), v = azar(300, 700); p.nueva(P.CHISPA, M[0] - 30, M[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(6, 11)); }
    }
    if (t > 5.05 && t < 5.5 && Math.random() < 30 * dt) p.nueva(P.HUMO, M[0] - 4, M[1], azar(-120, -40), azar(-90, -30), azar(0.6, 1.0), azar(18, 30));
    for (const f of this.fuego) { f.v -= dt; f.vx *= 1 - 1.6 * dt; f.vy = f.vy * (1 - 1.6 * dt) - 260 * dt; f.x += f.vx * dt; f.y += f.vy * dt; }
    this.fuego = this.fuego.filter((f) => f.v > 0);
    // gotas al beber
    if (t > 5.9 && t < 6.8 && Math.random() < 0.3) p.nueva(P.GOTA, M[0] - 5, M[1] + 4, azar(-60, 20), azar(-30, 30), 0.8, azar(2.5, 4));
    // ¡vapor por las orejas!
    if (t > 6.85 && t < 8.0) {
      const f = 1 - tramo(t, 7.4, 8.0);
      const n = Math.round(70 * dt * (0.3 + f));
      for (let i = 0; i < n + (Math.random() < 0.5 ? 1 : 0); i++) {
        const lado = i % 2 ? 1 : -1, q = aPant(e.m, [39 + lado * 32, 47]);
        p.nueva(P.VAPOR, q[0] + lado * 6, q[1], lado * azar(260, 420) * (0.5 + 0.5 * f), azar(-80, -20), azar(0.6, 1.0), azar(18, 30));
      }
    }
    this.una("pita", t > 6.85, () => temblar(10, 0.35));
    // eructito de fuego
    this.una("puf", t > 8.1, () => {
      for (let i = 0; i < 26; i++) { const a = Math.PI + 0.15 + azar(-0.4, 0.4), v = azar(200, 420); this.fuego.push({ x: M[0] - 4, y: M[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.25, 0.4), vm: 0.4, s: azar(18, 28) }); }
      temblar(5, 0.2);
    });
    if (t > 8.25 && t < 8.6 && Math.random() < 25 * dt) p.nueva(P.HUMO, M[0] - 20, M[1] - 5, azar(-60, -20), azar(-70, -30), azar(0.6, 0.9), azar(14, 22));
    for (const s of this.sudor) { s.v -= dt; s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
    this.sudor = this.sudor.filter((s) => s.v > 0);
    p.actualizar(dt);
  }
  mesa(g, t) {
    const cx = 650, top = this.JY + 18 * this.ESC;
    g.fillStyle = "#1b120a"; g.fillRect(cx - 9, top + 6, 18, PIES - top - 10);
    g.fillStyle = "#2a1c10"; g.beginPath(); g.ellipse(cx, PIES - 4, 70, 9, 0, 0, 6.283); g.fill();
    const gt = g.createLinearGradient(0, top - 10, 0, top + 14);
    gt.addColorStop(0, "#c08a55"); gt.addColorStop(0.5, "#8a5a30"); gt.addColorStop(1, "#4a2c14");
    g.fillStyle = "#3a2210"; g.beginPath(); g.ellipse(cx, top + 6, 118, 15, 0, 0, Math.PI); g.fill();
    g.fillStyle = gt; g.beginPath(); g.ellipse(cx, top, 118, 15, 0, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,230,190,.18)"; g.beginPath(); g.ellipse(cx - 20, top - 3, 70, 5, 0, 0, 6.283); g.fill();
    // servilletero
    g.fillStyle = "#c8ccd0"; rectR(g, 712, top - 34, 34, 34, 3); g.fill();
    g.fillStyle = "#fffdf5"; g.fillRect(716, top - 42, 26, 30);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(712, top - 12, 34, 4);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), ESC = this.ESC;
    fondo(g, "#000");
    // lámpara de bar con luz cálida
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
    g.drawImage(BLOB2.oro, 260, PIES - 40, 520, 80); g.restore();
    foco(g, 560, 560, PIES, 260, 0.75);
    g.fillStyle = "#151515"; g.fillRect(557, -10, 6, 40);
    g.fillStyle = "#2e2e30"; g.beginPath(); g.moveTo(520, 52); g.lineTo(600, 52); g.lineTo(580, 28); g.lineTo(540, 28); g.closePath(); g.fill();
    g.fillStyle = "#ffe9b0"; g.beginPath(); g.ellipse(560, 52, 40, 5, 0, 0, 6.283); g.fill();
    this.mesa(g, t);
    // la jarra en la mesa hasta que la coge
    if (t < 5.5) {
      g.save(); g.translate(this.JX, this.JY); g.scale(ESC, ESC);
      dibujarJarra(g, [0, 0], 0, 1, "asa", t); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t);
      g.restore();
    }
    // luz del fuego
    const kF = t > 3.6 && t < 5.2 ? Math.min(1, tramo(t, 3.6, 3.7)) * (1 - tramo(t, 5.0, 5.2)) : 0;
    if (kF > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * kF * (0.85 + 0.15 * Math.sin(t * 37));
      g.drawImage(BLOB.naranja, -200, 0, 800, 600); g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    // se pone rojo de abajo arriba (como un termómetro)
    if (e.rojo > 0.01) {
      // máscara de la cara en un lienzo pequeño, teñida de rojo hasta el nivel, y se multiplica encima
      if (!this.lc) this.lc = lienzoNuevo(240, 240);
      const c = this.lc, x = c.getContext("2d"), m = e.m, H0 = aPant(m, [39, 34]);
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, 240, 240);
      x.translate(120 - H0[0], 120 - H0[1]); x.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      dibujarCara(x, e.pose.cara, e.pose.rc, e.pose, t);
      x.translate(RIG.cuello[0], RIG.cuello[1]); x.rotate(e.pose.rc); x.translate(-RIG.cuello[0], -RIG.cuello[1]);
      x.globalCompositeOperation = "source-in";
      x.fillStyle = "#ff2a14"; x.fillRect(-20, lerp(78, -14, e.rojo), 120, 120);
      g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.82;
      g.drawImage(c, H0[0] - 120, H0[1] - 120); g.restore();
    }
    // sudor
    g.fillStyle = "#9fe2ff";
    for (const s of this.sudor) {
      g.save(); g.translate(s.x, s.y); g.rotate(Math.atan2(s.vy, s.vx) - Math.PI / 2); g.globalAlpha = Math.min(1, s.v * 2);
      g.beginPath(); g.moveTo(0, -9); g.quadraticCurveTo(6, 2, 0, 5); g.quadraticCurveTo(-6, 2, 0, -9); g.fill();
      g.restore();
    }
    this.p.dibujar(g);
    // el fuego
    if (this.fuego.length) {
      g.save(); g.globalCompositeOperation = "lighter";
      for (const f of this.fuego) {
        const k = f.v / f.vm, s = f.s * (0.6 + (1 - k) * 2.2);
        g.globalAlpha = Math.min(1, k * 2.2) * 0.5;
        g.drawImage(k > 0.72 ? BLOB.amarillo : k > 0.42 ? BLOB.naranja : BLOB.rojo, f.x - s / 2, f.y - s / 2, s, s);
      }
      if (kF > 0) { const M = aPant(e.m, boca(e.pose.rc)); g.globalAlpha = 0.9 * kF; g.drawImage(BLOB.blanco, M[0] - 34, M[1] - 22, 52, 44); }
      g.restore();
    }
    // silbido de las orejas
    if (t > 6.85 && t < 7.9) {
      const a = 1 - tramo(t, 7.5, 7.9);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * a})`; g.lineWidth = 3; g.lineCap = "round";
      for (const lado of [-1, 1]) {
        const q = aPant(e.m, [39 + lado * 33, 46]);
        for (let i = 0; i < 3; i++) {
          const ang = (i - 1) * 0.35, r0 = 22 + ((t * 160 + i * 9) % 26);
          g.beginPath(); g.moveTo(q[0] + lado * Math.cos(ang) * r0, q[1] + Math.sin(ang) * r0); g.lineTo(q[0] + lado * Math.cos(ang) * (r0 + 14), q[1] + Math.sin(ang) * (r0 + 14)); g.stroke();
        }
      }
      g.restore();
    }
    // ¡PICAAA!
    if (t > 3.62 && t < 5.9) {
      const c = titulo(), k = tramo(t, 3.62, 3.8), s = lerp(0.2, 1, eBack(k)) * (1 + 0.04 * Math.sin(t * 22));
      const a = 1 - tramo(t, 5.55, 5.9), sac = 6 * (1 - tramo(t, 4.6, 5.2));
      g.save(); g.globalAlpha = a; g.translate(400 + azar(-sac, sac), 120 + azar(-sac, sac)); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    // entra desde negro
    const aIn = 1 - tramo(t, 0, 0.45);
    if (aIn > 0) { g.fillStyle = `rgba(0,0,0,${aIn})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // círculo que se cierra sobre su cara
    const kIris = tramo(t, 8.75, 9.62);
    if (kIris > 0) {
      const c = aPant(e.m, [39, 38]), R = Math.max(0.1, 760 * Math.pow(1 - kIris, 1.7));
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(c[0] + R, c[1]); g.arc(c[0], c[1], R, 0, 6.283);
      g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00070", nombre: "Bravas picantes", crear: () => new EscenaBravas() });
})();
