"use strict";
/*
 * 00038 · MINI GUILLERMO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Al lado de una jarra enorme se bebe una pócima rosa (¡GLUP!) y se encoge a golpes (boing, boing, boing) mientras la
 * cámara se acerca. Diminuto, coge carrerilla y se tira en bomba dentro de la jarra (¡PLOF!). La cámara entra en la
 * jarra: nada a braza en la cerveza, visto a través del cristal (tintado de ámbar, con burbujas), da la vuelta y sube
 * a la espuma, de la que sale con un flotador a rayas: ¡A REMOJO!
 */
(() => {
const X0 = 330;
const JX0 = 605, JX1 = 775, JY0 = 375, JY1 = 575;  // la jarra (mundo)
const SURF = 420, ESP = 392;                       // superficie de la cerveza y de la espuma
const ESCALAS = [[1.95, 1.5, 1.0], [2.4, 1.0, 0.6], [2.8, 0.6, 0.28]];
const T_SALTO = 4.1, T_PLOF = 4.62;
const OS = 280;                                    // lienzo del nadador (pantalla)
const cache = cacheTexto();

function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(560, 300), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 260);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#ffb21f");
  txt(g, "¡A", 150, 120, { tam: 120, peso: 400, fam: FC, color: gr, borde: "#4a2600", bordeAncho: 12, esp: 4, glow: "rgba(255,190,60,.7)", glowTam: 22 });
  txt(g, "REMOJO!", 290, 250, { tam: 130, peso: 400, fam: FC, color: gr, borde: "#4a2600", bordeAncho: 12, esp: 4, glow: "rgba(255,190,60,.7)", glowTam: 22 });
  cache.set("t", c);
  return c;
}
function pocima(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "rgba(220,235,255,.35)"; g.beginPath(); g.arc(0, -5, 7, 0, 6.283); g.fill();
  g.fillStyle = "#ff3d84"; g.beginPath(); g.arc(0, -5, 5.6, -0.2, Math.PI + 0.2); g.fill();
  g.fillStyle = "rgba(220,235,255,.45)"; g.fillRect(-2.2, -18, 4.4, 9);
  g.fillStyle = "#a0662a"; g.fillRect(-2.8, -21, 5.6, 4);
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 0.9; g.beginPath(); g.arc(0, -5, 7, 0, 6.283); g.stroke();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(-2.4, -7.5, 1.3, 0, 6.283); g.fill();
  g.restore();
}

class EscenaMini extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(300);
    this.burbujas = [];
    this._c = null; this.fase = 0;
  }
  lienzo() { if (!this._c) { this._c = lienzoNuevo(OS, OS); this._g = this._c.getContext("2d"); } return this._g; }
  camara(t) {
    let z = 1, c = [W / 2, H / 2];
    const k1 = eInOut(tramo(t, 1.9, 3.0)), k2 = eInOut(tramo(t, 4.55, 5.2)), k3 = eInOut(tramo(t, 7.45, 8.2));
    z = lerp(z, 1.8, k1); c = mezcla(c, [505, 440], k1);
    z = lerp(z, 2.85, k2); c = mezcla(c, [690, 478], k2);
    z = lerp(z, 2.5, k3); c = mezcla(c, [628, 432], k3);
    return { z, c, M: new DOMMatrix().translate(W / 2, H / 2).scale(z, z).translate(-c[0], -c[1]) };
  }
  esc(t) {
    let s = 1.5;
    for (const [ts, a, b] of ESCALAS) if (t >= ts) s = lerp(a, b, eBack(tramo(t, ts, ts + 0.16)));
    return s;
  }
  estado() {
    const t = this.t, s = this.esc(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], x = X0, y = PIES, giro = 0, sx = 1, sy = 1, piv = [39, 232], dentro = false;
    // la pócima: se la bebe
    const kSube = eInOut(tramo(t, 0.35, 0.6));
    manoD = mezcla(manoD, [62, 120], kSube);
    const kBoca = eInOut(tramo(t, 0.75, 0.95)) * (1 - eInOut(tramo(t, 1.6, 1.8))), kTrago = eInOut(tramo(t, 0.95, 1.55)) * (1 - eInOut(tramo(t, 1.6, 1.8)));
    pose.rc = -0.34 * kTrago;
    const ang = -0.4 * kBoca - 1.45 * kTrago;
    if (kBoca > 0) { const b = boca(pose.rc), tope = rot2([0, -20], ang); manoD = mezcla(manoD, [b[0] - tope[0] + 1, b[1] - tope[1]], kBoca); }
    if (t < 1.85) pose.objD2 = (g, m) => pocima(g, m[0], m[1] - 2, ang);
    if (t > 0.35 && t < 0.75) pose.cara = "guino";
    if (t > 1.6 && t < 1.95) pose.cara = "dormido";
    if (t >= 1.85 && t < 1.95) manoD = mezcla([62, 120], [70, 158], tramo(t, 1.8, 1.95));
    // se encoge a golpes
    if (t >= 1.95) {
      pose.cara = "sorpresa";
      for (const [ts] of ESCALAS) if (t > ts && t < ts + 0.3) { const k = tramo(t, ts, ts + 0.3); sy = 1 - 0.18 * Math.sin(k * Math.PI * 2) * (1 - k); sx = 2 - sy; }
      manoI = [-6, 96 + 8 * Math.sin(t * 14)]; manoD = [84, 96 + 8 * Math.cos(t * 14)];
    }
    if (t > 3.0 && t < 3.45) { pose.cara = "guino"; manoI = [9, 160]; manoD = [70, 158]; }
    // carrerilla y salto en bomba
    if (t >= 3.45 && t < T_SALTO) {
      const a = andar(this.fase, 1.3); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote * s;
      x = lerp(X0, 560, eIn(tramo(t, 3.45, T_SALTO))); pose.cara = "risa";
      manoI = [-4, 130]; manoD = [82, 130];
    }
    if (t >= T_SALTO && t < T_PLOF) {
      const k = tramo(t, T_SALTO, T_PLOF);
      x = lerp(560, 662, k); y = lerp(PIES, SURF + 30, k) - 310 * Math.sin(Math.PI * Math.min(1, k * 1.1)) * (1 - 0.15 * k);
      pose.cara = "risa"; manoI = [6, 40]; manoD = [72, 40]; pose.piernaI = [-14, 0.25]; pose.piernaD = [-14, -0.25];
      giro = 0.3 * Math.sin(k * Math.PI);
    }
    if (t >= T_PLOF) {
      dentro = true; piv = [39, 116];
      const cuerpo = 116 * s; // del centro a los pies
      if (t < 5.2) { // se hunde y se pone en horizontal
        const k = eOut(tramo(t, T_PLOF, 5.2));
        x = lerp(662, 650, k); y = lerp(SURF + 30 - cuerpo, 488, k); giro = lerp(0, Math.PI / 2, k); pose.cara = "sorpresa";
      } else if (t < 7.45) {
        // braza: ida, voltereta y vuelta
        if (t < 6.35) { x = lerp(650, 722, eInOut(tramo(t, 5.2, 6.35))); y = 492 + 6 * Math.sin(t * 4); giro = Math.PI / 2; }
        else if (t < 6.75) { const k = eInOut(tramo(t, 6.35, 6.75)); x = 722 + 4 * Math.sin(k * Math.PI); y = 492 + 10 * Math.sin(k * Math.PI); giro = Math.PI / 2 + Math.PI * k; }
        else { x = lerp(722, 662, eInOut(tramo(t, 6.75, 7.45))); y = 488 + 6 * Math.sin(t * 4); giro = Math.PI * 1.5; }
        const f = t * 7.8, s1 = Math.max(0, Math.sin(f)), s2 = (1 - Math.cos(f)) / 2;
        manoD = [47 + 52 * s1, -14 + 112 * s2]; manoI = [31 - 52 * s1, -14 + 112 * s2];
        const pat = Math.max(0, Math.sin(f + Math.PI));
        pose.piernaI = [-4 * pat, 0.42 * pat]; pose.piernaD = [-4 * pat, -0.42 * pat];
        pose.cara = t > 6.35 && t < 6.75 ? "sorpresa" : Math.sin(t * 3) > 0.3 ? "guino" : "risa";
      } else {
        // sube a la espuma y sale con flotador
        const k = eInOut(tramo(t, 7.45, 8.05));
        x = lerp(662, 690, k); y = lerp(488, ESP - 4 - (146 - 116) * s, k) + (t > 8.05 ? 2.5 * Math.sin(t * 4.5) : 0);
        giro = lerp(Math.PI * 1.5, Math.PI * 2, k);
        pose.cara = t > 8.05 ? (Math.sin(t * 2.5) > 0.6 ? "guino" : "risa") : "sorpresa";
        manoI = mezcla([-10, 90], [-14, 100], k); manoD = mezcla([88, 90], [94, 52 + (t > 8.4 ? 8 * Math.sin(t * 9) : 0)], k);
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, y, s, giro, sx, sy, piv);
    return { pose, m, s, dentro };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.estado();
    if (t > 3.45 && t < T_SALTO) this.fase += dt * 16;
    ESCALAS.forEach(([ts], i) => this.una("enc" + i, t > ts, () => {
      temblar(4, 0.15);
      const q = aPant(e.m, [39, 120]);
      for (let k = 0; k < 16; k++) p.nueva(P.PURPURINA, q[0] + azar(-60, 60) * e.s, q[1] + azar(-110, 110) * e.s, azar(-60, 60), azar(-80, 20), azar(0.5, 0.9), azar(5, 9));
      for (let k = 0; k < 8; k++) p.nueva(P.ELECTRICA, q[0], q[1], azar(-120, 120), azar(-120, 120), azar(0.2, 0.4), azar(10, 16) * Math.max(0.5, e.s));
    }));
    this.una("plof", t > T_PLOF, () => {
      temblar(8, 0.25);
      for (let k = 0; k < 34; k++) p.nueva(P.ESPUMA, 662 + azar(-12, 12), ESP, azar(-110, 110), azar(-260, -90), azar(0.4, 0.8), azar(2.5, 5.5));
      for (let k = 0; k < 6; k++) p.nueva(P.GOTA, 662, ESP, azar(-90, 90), azar(-300, -150), 1, azar(1.5, 2.5));
    });
    this.una("flota", t > 8.05, () => { const q = aPant(e.m, [39, 140]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 40); for (let k = 0; k < 12; k++) p.nueva(P.ESPUMA, q[0], ESP, azar(-60, 60), azar(-140, -40), azar(0.3, 0.6), azar(2, 4)); });
    // burbujas en la cerveza
    if (Math.random() < 9 * dt) this.burbujas.push({ x: azar(JX0 + 12, JX1 - 12), y: JY1 - 18, v: azar(18, 40), r: azar(1.2, 3) });
    if (t > T_PLOF && t < 7.9 && Math.random() < 14 * dt) { const q = aPant(e.m, boca(e.pose.rc)); this.burbujas.push({ x: q[0], y: q[1], v: azar(30, 60), r: azar(1.5, 3.5) }); }
    for (const b of this.burbujas) { b.y -= b.v * dt; b.x += Math.sin(b.y * 0.15) * 6 * dt; }
    this.burbujas = this.burbujas.filter((b) => b.y > SURF + 2);
    p.actualizar(dt);
  }
  /** Nadador en el lienzo auxiliar, en coordenadas de pantalla. */
  nadador(e, cam, t, tinte) {
    const M = cam.M.multiply(e.m), q = aPant(M, [39, 116]);
    const o = this.lienzo(), ox = q[0] - OS / 2, oy = q[1] - OS / 2;
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = "source-over"; o.globalAlpha = 1; o.clearRect(0, 0, OS, OS);
    pintarAvatar(o, new DOMMatrix().translate(-ox, -oy).multiply(M), e.pose, t);
    if (tinte) { o.globalCompositeOperation = "source-atop"; o.fillStyle = "rgba(235,140,10,.42)"; o.fillRect(0, 0, OS, OS); }
    return [ox, oy];
  }
  flotador(g, e) {
    conMat(g, e.m, () => {
      g.lineWidth = 9;
      for (let i = 0; i < 8; i++) {
        g.strokeStyle = i % 2 ? "#ffffff" : "#ff2d3d";
        g.beginPath(); g.ellipse(39, 146, 50, 13, 0, (i / 8) * Math.PI * 2, ((i + 1) / 8) * Math.PI * 2 + 0.02); g.stroke();
      }
      g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2.5; g.beginPath(); g.ellipse(39, 143, 44, 9, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
    });
  }
  dibujarJarraAtras(g, t) {
    rectR(g, JX0, JY0, JX1 - JX0, JY1 - JY0, 16); g.fillStyle = "rgba(200,225,255,.10)"; g.fill();
    g.save(); rectR(g, JX0 + 5, JY0 + 4, JX1 - JX0 - 10, JY1 - JY0 - 18, 12); g.clip();
    const gr = g.createLinearGradient(0, SURF, 0, JY1);
    gr.addColorStop(0, "#ffc72e"); gr.addColorStop(1, "#b85c00");
    g.fillStyle = gr; g.fillRect(JX0, SURF, JX1 - JX0, JY1 - SURF);
    // rayos de luz en la cerveza
    g.fillStyle = "rgba(255,240,170,.18)";
    for (let i = 0; i < 4; i++) { const x = JX0 + 20 + i * 42 + 6 * Math.sin(t + i); g.beginPath(); g.moveTo(x, SURF); g.lineTo(x + 16, SURF); g.lineTo(x - 10, JY1); g.lineTo(x - 22, JY1); g.fill(); }
    g.restore();
  }
  dibujarJarraDelante(g, t) {
    // burbujas
    g.save(); g.strokeStyle = "rgba(255,250,220,.75)"; g.lineWidth = 0.9;
    for (const b of this.burbujas) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.stroke(); }
    g.restore();
    // espuma
    g.save(); rectR(g, JX0 + 3, JY0 - 30, JX1 - JX0 - 6, JY1 - JY0 + 20, 12); g.clip();
    g.fillStyle = "#fffaf0"; g.fillRect(JX0, ESP + 6, JX1 - JX0, SURF - ESP - 4);
    g.fillStyle = "rgba(220,200,150,.5)"; g.fillRect(JX0, SURF - 4, JX1 - JX0, 4);
    g.restore();
    g.fillStyle = "#fffaf0";
    for (let i = 0; i <= 8; i++) { const x = JX0 + 4 + i * ((JX1 - JX0 - 8) / 8), r = 11 + 3 * Math.sin(i * 2.3 + t * 1.5); g.beginPath(); g.arc(x, ESP + 6, r, Math.PI, 0); g.fill(); }
    // asa
    g.strokeStyle = "rgba(225,240,255,.55)"; g.lineWidth = 16; g.lineCap = "round";
    g.beginPath(); g.moveTo(JX1 - 4, JY0 + 40); g.bezierCurveTo(JX1 + 70, JY0 + 40, JX1 + 70, JY1 - 40, JX1 - 4, JY1 - 40); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(JX1 + 6, JY0 + 50); g.bezierCurveTo(JX1 + 56, JY0 + 52, JX1 + 56, JY1 - 52, JX1 + 6, JY1 - 50); g.stroke();
    // cristal: contorno, fondo grueso, reflejos y facetas
    rectR(g, JX0, JY0, JX1 - JX0, JY1 - JY0, 16); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 3.5; g.stroke();
    g.fillStyle = "rgba(220,235,255,.35)"; g.fillRect(JX0 + 6, JY1 - 16, JX1 - JX0 - 12, 12);
    g.fillStyle = "rgba(255,255,255,.28)"; g.fillRect(JX0 + 14, JY0 + 14, 9, JY1 - JY0 - 40); g.fillRect(JX0 + 30, JY0 + 14, 3, JY1 - JY0 - 40);
    g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = 2;
    for (let x = JX0 + 50; x < JX1 - 10; x += 34) { g.beginPath(); g.moveTo(x, JY0 + 10); g.lineTo(x, JY1 - 20); g.stroke(); }
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), cam = this.camara(t);
    fondo(g, "#000");
    const conCam = (f) => { g.save(); g.setTransform(g.getTransform().multiply(cam.M)); f(); g.restore(); };
    conCam(() => {
      // suelo y luz
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22;
      g.drawImage(BLOB2.oroClaro, 150, PIES - 40, 760, 80); g.restore();
      g.fillStyle = "rgba(0,0,0,.45)"; g.beginPath(); g.ellipse((JX0 + JX1) / 2 + 20, PIES + 2, 120, 10, 0, 0, 6.283); g.fill();
      this.dibujarJarraAtras(g, t);
    });
    const jPant = (p) => aPant(cam.M, p);
    const a = jPant([JX0 + 5, SURF]), b = jPant([JX1 - 5, JY1 - 14]), esp = jPant([0, ESP + 8])[1];
    // nadador dentro de la cerveza (tintado y ondulante)
    if (e.dentro) {
      const [ox, oy] = this.nadador(e, cam, t, true);
      g.save(); g.beginPath(); g.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]); g.clip();
      for (let y = 0; y < OS; y += 20) g.drawImage(this._c, 0, y, OS, 20, ox + 3 * Math.sin(t * 5 + y * 0.05), oy + y, OS, 20);
      g.restore();
    }
    conCam(() => this.dibujarJarraDelante(g, t));
    // fuera de la cerveza: normal (dentro de la jarra solo asoma por encima de la espuma)
    if (!e.dentro || t > 7.7) {
      if (t >= T_SALTO) {
        const [ox, oy] = this.nadador(e, cam, t, false);
        g.save(); if (t > 4.4) { g.beginPath(); g.rect(-60, -60, W + 120, esp + 60); g.clip(); }
        g.drawImage(this._c, ox, oy); g.restore();
      } else conCam(() => pintarAvatar(g, e.m, e.pose, t));
    }
    if (t > 8.0) {
      g.save(); const k = eBack(tramo(t, 8.0, 8.2)); g.globalAlpha = Math.min(1, (t - 8.0) * 6);
      conCam(() => { const q = aPant(e.m, [39, 146]); g.translate(q[0], q[1]); g.scale(k, k); g.translate(-q[0], -q[1]); this.flotador(g, e); });
      g.restore();
    }
    conCam(() => this.p.dibujar(g));
    // textos
    const txtPop = (s, t0, x, y, r, tam, borde) => {
      const d = t - t0; if (d < 0 || d > 0.8) return;
      const k = tramo(d, 0, 0.1);
      g.save(); g.translate(x, y); g.rotate(r); g.scale(eBack(k), eBack(k));
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: "#ffffff", borde, bordeAncho: 8, alfa: 1 - tramo(d, 0.6, 0.8), esp: 2 });
      g.restore();
    };
    txtPop("¡GLUP!", 1.2, 470, 190, 0.12, 48, "#9c1a4f");
    ESCALAS.forEach(([ts], i) => { const q = aPant(cam.M.multiply(e.m), [39, -20]); txtPop("¡BOING!", ts, q[0] + 70 - i * 8, q[1] - 10, -0.1 + i * 0.1, 40 + i * 6, "#5a1a8a"); });
    txtPop("¡PLOF!", T_PLOF, 690, 150, 0.1, 76, "#4a2600");
    // ¡A REMOJO!
    if (t > 8.1) {
      const k = tramo(t, 8.1, 8.28), s = lerp(2.4, 1, eIn(k)), al = Math.min(1, k * 4);
      const T = titulo();
      g.save(); g.globalAlpha = al; g.translate(212, 300); g.rotate(-0.08 + 0.02 * Math.sin(t * 2.5)); g.scale(s * 0.84, s * 0.84); g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
    }
    const f = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.45, this.dur - 0.02));
    if (f > 0) { g.fillStyle = `rgba(0,0,0,${f})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00038", nombre: "Mini Guillermo", crear: () => new EscenaMini() });
})();
