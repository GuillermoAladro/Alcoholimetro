"use strict";
/*
 * 00104 · EL ERUCTO
 *
 * Animación del banco. Empieza y acaba en negro.
 * La cámara sale de su camisa: es un gigante entre monumentos de latas. Se hincha, suelta un ¡BUUUUURP! que tumba
 * los monumentos (latas volando por todas partes) y le quita las gafas, y se deshincha como un globo. ¡UY, PERDÓN!
 * Atrapa al vuelo una lata que rebota y la escena se cierra en un círculo sobre su cara.
 * Si sale justo después de Monumentos de latas, encaja como una sola historia.
 */
(() => {
class EscenaEructo extends Escena {
  constructor() {
    super(7.4);
    const M = monumentos();
    this.latas = M.latas.map((L) => ({ x: L.x, y: L.y, vx: 0, vy: 0, r: 0, vr: 0 }));
    this.libres = false; this.ondas = []; this.p = new Parts(200);
    this.gafas = null; this.bolsa = null; this.atrapa = null; this.esc = 2.4;
  }
  camara() {
    const k = eOut(tramo(this.t, 0, 1.1));
    const Z = Math.exp(Math.log(12) * (1 - k));
    const P = aPant(matAv(W / 2, PIES, 2.4), [39, 108]);
    return { Z, cx: lerp(P[0], W / 2, k), cy: lerp(P[1], H / 2, k) };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "risa", rc: 0, gafas: t < 1.62, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [30, 152], sx = 1, sy = 1;
    if (t < 1.62) {
      pose.brazoIDelante = true;
      pose.objI = (g, m) => dibujarBolsa(g, m[0], m[1] - 3, 0.03 * Math.sin(t * 3));
    } else manoI = mezcla([30, 152], [9, 160], eOut(tramo(t, 1.62, 1.9)));
    const kHincha = tramo(t, 1.1, 1.6);
    if (t > 1.1 && t < 1.62) { pose.cara = "sorpresa"; sx = 1 + 0.08 * kHincha + azar(-0.01, 0.01); sy = 1 + 0.03 * kHincha; }
    if (t >= 1.62 && t < 2.35) { pose.cara = "sorpresa"; pose.rc = -0.12 + 0.03 * Math.sin(t * 60); }
    if (t >= 2.35 && t < 4.4) pose.cara = "guino";
    if (t >= 4.4 && t < 5.0) pose.cara = "sorpresa";
    if (t >= 5.0) pose.cara = t < 5.6 ? "risa" : "guino";
    // atrapa la lata que rebota
    if (this.atrapa) {
      const A = this.atrapa;
      if (!A.cogida) {
        const kk = eInOut(tramo(t, 4.6, 5.0));
        manoD = mezcla([70, 158], [96, 128], kk);
      } else manoD = mezcla([96, 128], [62, 118], eInOut(tramo(t, 5.0, 5.5)));
      if (A.cogida) pose.objD = (g, m) => dibujarLata(g, m[0], m[1], A.rMano * (1 - tramo(t, 5.0, 5.25)), {});
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(W / 2, PIES, this.esc, 0, sx, sy);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // encoge como un globo al eructar
    if (t >= 1.62) this.esc = 2.4 - 0.95 * eElastico(tramo(t, 1.62, 2.6));
    const e = this.estado(), M0 = aPant(e.m, boca(0));
    this.una("eructo", t > 1.62, () => {
      this.libres = true; temblar(36, 1.3);
      this.ondas.push(t, t + 0.12, t + 0.24);
      for (const L of this.latas) {
        let dx = L.x - M0[0], dy = L.y - M0[1];
        const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
        const v = azar(550, 1150) * (1 - Math.min(0.5, d / 1600));
        L.vx = dx * v; L.vy = dy * v - azar(150, 420); L.vr = azar(-18, 18);
        if (Math.abs(L.vx) < 260) L.vx = (L.x < W / 2 ? -1 : 1) * azar(260, 420);
      }
      const q = aPant(e.m, [39, 40]);
      this.gafas = { x: q[0], y: q[1], vx: -260, vy: -820, r: 0, vr: -12 };
      const qb = aPant(e.m, [30, 150]);
      this.bolsa = { x: qb[0], y: qb[1], vx: -950, vy: -260, r: 0, vr: -7 };
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.ESPUMA, M0[0], M0[1], Math.cos(a) * v, Math.sin(a) * v - 100, azar(0.4, 0.9), azar(5, 10)); }
    });
    if (this.libres) {
      for (const L of this.latas) {
        L.vy += 1500 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.r += L.vr * dt;
        if (L.y > PIES - 7) {
          L.y = PIES - 7; L.vy = Math.abs(L.vy) > 90 ? -Math.abs(L.vy) * 0.42 : 0;
          L.vx *= 0.9; if (Math.abs(L.vx) < 200) L.vx = Math.sign(L.vx || 1) * 200;
          L.vr = L.vx / 9;
        }
      }
      this.latas = this.latas.filter((L) => L.x > -40 && L.x < W + 40 && L.y < H + 60);
      for (const o of [this.gafas, this.bolsa]) if (o) { o.vy += 1500 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.r += o.vr * dt; }
    }
    // una lata rebota y la atrapa al vuelo
    this.una("lanzaAtrapa", t > 4.0, () => {
      const mFin = matAv(W / 2, PIES, 1.45), H0 = aPant(mFin, [96, 128]);
      const x0 = -20, y0 = PIES - 30, T = 1.0, gr = 1500;
      this.atrapa = { x: x0, y: y0, vx: (H0[0] - x0) / T, vy: (H0[1] - y0 - 0.5 * gr * T * T) / T, r: 0, vr: 13, cogida: false, rMano: 0 };
    });
    if (this.atrapa && !this.atrapa.cogida) {
      const A = this.atrapa;
      A.vy += 1500 * dt; A.x += A.vx * dt; A.y += A.vy * dt; A.r += A.vr * dt;
      if (t >= 5.0) { A.cogida = true; A.rMano = ((A.r + Math.PI) % (2 * Math.PI)) - Math.PI; temblar(4, 0.15); }
    }
    this.una("brilla", t > 5.6, () => { const q = aPant(e.m, [62, 106]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 60); });
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), cam = this.camara();
    fondo(g, "#000");
    g.save();
    g.translate(W / 2, H / 2); g.scale(cam.Z, cam.Z); g.translate(-cam.cx, -cam.cy);
    const gs = g.createLinearGradient(0, PIES - 4, 0, H + 40);
    gs.addColorStop(0, "#1a1a1d"); gs.addColorStop(1, "#050506");
    g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H - PIES + 80);
    for (const L of this.latas) lataSuelta(g, L.x, L.y, L.r);
    if (this.bolsa) { g.save(); g.translate(this.bolsa.x, this.bolsa.y); g.rotate(this.bolsa.r); g.scale(2.4, 2.4); dibujarBolsa(g, 0, 0, 0); g.restore(); }
    pintarAvatar(g, e.m, e.pose, t);
    if (this.atrapa && !this.atrapa.cogida) lataSuelta(g, this.atrapa.x, this.atrapa.y, this.atrapa.r, 1.45);
    if (this.gafas) { g.save(); g.translate(this.gafas.x, this.gafas.y); g.rotate(this.gafas.r); gafasSol(g, -45 * 1.6, -68 * 1.6, 1.6); g.restore(); }
    this.p.dibujar(g);
    g.restore();
    // ondas expansivas
    const M0 = aPant(e.m, boca(0));
    for (const t0 of this.ondas) {
      const u = (t - t0) / 0.9;
      if (u < 0 || u > 1) continue;
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(200,255,120,${0.7 * (1 - u)})`; g.lineWidth = 10 * (1 - u) + 2;
      g.beginPath(); g.ellipse(M0[0], M0[1], u * 1100, u * 700, 0, 0, 6.283); g.stroke(); g.restore();
    }
    // ¡BUUUURP!
    if (t > 1.62 && t < 3.5) {
      const k = tramo(t, 1.62, 2.0), a = 1 - tramo(t, 3.1, 3.5);
      const x = lerp(M0[0], W / 2, eOut(k)), y = lerp(M0[1], 170, eOut(k));
      g.save(); g.translate(x + azar(-7, 7) * (1 - tramo(t, 2.6, 3.2)), y + azar(-7, 7) * (1 - tramo(t, 2.6, 3.2)));
      g.rotate(0.05 * Math.sin(t * 30)); g.scale(lerp(0.2, 1, eBack(k)), lerp(0.2, 1, eBack(k)));
      txt(g, "¡BUUUUURP!", 0, 0, { tam: 168, peso: 400, fam: FC, color: "#c8ff3c", borde: "#132100", bordeAncho: 12, alfa: a, esp: 6, max: 1000 });
      g.restore();
    }
    // ¡Uy, perdón!
    if (t > 2.4 && t < 4.3) {
      const q = aPant(e.m, [39, -6]);
      bocadillo(g, q[0] - 150, q[1] - 40, "¡UY, PERDÓN!", q[0] - 30, q[1] + 20, tramo(t, 2.4, 2.65) * (t < 4.05 ? 1 : 1 - tramo(t, 4.05, 4.3)), 36);
    }
    // empieza en negro
    const aIn = 1 - tramo(t, 0, 0.35);
    if (aIn > 0) { g.fillStyle = `rgba(0,0,0,${aIn})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // acaba con un círculo que se cierra sobre su cara
    const kIris = tramo(t, 6.4, 7.25);
    if (kIris > 0) {
      const c = aPant(e.m, [39, 35]), R = Math.max(0.1, 720 * Math.pow(1 - kIris, 1.6));
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(c[0] + R, c[1]); g.arc(c[0], c[1], R, 0, 6.283);
      g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00104", nombre: "El eructo", crear: () => new EscenaEructo() });
})();
