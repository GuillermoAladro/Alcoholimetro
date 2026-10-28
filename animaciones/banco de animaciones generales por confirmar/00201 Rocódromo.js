"use strict";
/*
 * 00201 · ROCÓDROMO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un muro de escalada al aire libre lleno de presas de colores. ¡YA! Marcos sube como una araña y toca la campana
 * de arriba; Guillermo sube despacito, sudando… a media pared se le suelta una presa y se queda colgado de una mano.
 * La cámara se aleja y se ve lo alto que está: ¡NO MIRES ABAJO! Marcos le tira una cuerda desde arriba, Guillermo
 * se agarra y Marcos lo sube de un tirón. Arriba chocan las manos… y Guillermo mira abajo y se marea.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.6, ESC = 1.1, TOP = 820, XG = 330, XM = 690, XM2 = 478;
const T_YA = 0.8, T_ARRIBA = 2.9, T_SUELTA = 4.35, T_CUERDA = 6.1, T_AGARRA = 6.75, T_SUBE = 7.0, T_LLEGA = 7.75;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(1000, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff5a1a");
  g.save(); g.translate(500, 100); g.transform(1, 0, -0.1, 1, 0, 0);
  txt(g, "¡NO MIRES ABAJO!", 7, 52, { tam: 116, peso: 400, fam: FC, color: "#3a0a00", esp: 4, max: 950 });
  txt(g, "¡NO MIRES ABAJO!", 0, 45, { tam: 116, peso: 400, fam: FC, color: gr, borde: "#3a0a00", bordeAncho: 11, esp: 4, glow: "rgba(255,120,40,.85)", glowTam: 24, max: 950 });
  g.restore();
  cache.set("t", c);
  return c;
}
const COLS = ["#ff3d84", "#ffd34d", "#2bff5b", "#2fe3e8", "#ff7a1a", "#9a5aff"];
function presa(g, x, y, r, col, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(2, 3, r * 1.1, r * 0.8, 0, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(-r * 0.4, -r * 0.4, 1, 0, 0, r * 1.2);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.3, col); gr.addColorStop(1, col);
  g.fillStyle = gr; g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(-r, -r * 0.9, 0, -r * 0.8); g.quadraticCurveTo(r * 1.2, -r * 0.7, r, r * 0.2); g.quadraticCurveTo(r * 0.6, r * 0.8, -r * 0.2, r * 0.7); g.quadraticCurveTo(-r * 1.1, r * 0.6, -r, 0); g.fill();
  g.fillStyle = "#333"; g.beginPath(); g.arc(0, 0, 1.6, 0, 6.283); g.fill();
  g.restore();
}

class Rocodromo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(240);
    this.presas = [];
    const r = semilla(201);
    for (let i = 0; i < 150; i++) this.presas.push({ x: 130 + r() * 760, y: -30 - r() * (TOP - 40), r: 7 + r() * 9, c: COLS[(r() * 6) | 0], rot: r() * 6 });
    this.gotas = [];
    this.cae = null;   // la presa que se suelta
  }
  hM(t) { return TOP * eInOut(tramo(t, T_YA, T_ARRIBA)); }
  hG(t) {
    if (t < T_SUELTA) return 560 * Math.pow(tramo(t, T_YA, T_SUELTA), 0.85);
    return 560;
  }
  /** Mano de la que cuelga Guillermo (en el mundo). */
  agarre() { return aPant(matAv(XG, -560, ESC), [75, 22]); }
  trepar(pose, fase, q, vel) {
    const R = q === "marcos", s1 = Math.sin(fase), s2 = Math.sin(fase + Math.PI);
    const yA = R ? 36 : 14, yB = R ? 62 : 52;
    pose.manoD = [R ? 70 : 78, lerp(yA, yB, (1 + s1) / 2)];
    pose.manoI = [R ? 4 : 0, lerp(yA, yB, (1 + s2) / 2)];
    pose.piernaD = [-22 * Math.max(0, s2) * vel, -0.12]; pose.piernaI = [-22 * Math.max(0, s1) * vel, 0.12];
    pose.brazoIDelante = true;
  }
  poseM(t) {
    const pose = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let x = XM, h = this.hM(t), sy = 1, bote = 0;
    if (t < T_YA) { pose.cara = "guino"; pose.manoD = [44, 120 + 6 * Math.sin(t * 20)]; pose.manoI = [30, 122 - 6 * Math.sin(t * 20)]; pose.brazoIDelante = true; }
    else if (t < T_ARRIBA) { this.trepar(pose, t * 22, "marcos", 1); pose.cara = "risa"; h += 6 * Math.sin(t * 22); }
    else if (t < 4.6) {
      // arriba: toca la campana y saluda
      pose.cara = "risa"; pose.brazoIDelante = true;
      const k = eOut(tramo(t, T_ARRIBA, T_ARRIBA + 0.2));
      pose.manoD = t < 3.5 ? mezcla([70, 60], [104, 66 + 10 * Math.sin(t * 30)], k) : [96, 30 + 10 * Math.sin(t * 12)];
      pose.manoI = [-14, 110];
      if (t > 3.5) { pose.cara = "guino"; pose.rc = -0.12; }
    } else if (t < T_CUERDA) {
      // ve a Guillermo colgado, corre hacia él
      const k = eInOut(tramo(t, 4.75, 5.4));
      x = lerp(XM, XM2, k);
      if (k > 0 && k < 1) { const a = andar(t * 15, 1); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
      pose.cara = "sorpresa"; pose.rc = -0.15;
      pose.manoD = [72, 140]; pose.manoI = [2, 140]; pose.brazoIDelante = true;
    } else {
      // tira la cuerda y tira de ella
      x = XM2; sy = 0.86; pose.brazoIDelante = true;
      pose.cara = t < T_SUBE ? "sorpresa" : t < T_LLEGA ? "guino" : "risa";
      if (t < T_SUBE) { const k = eOut(tramo(t, T_CUERDA, T_CUERDA + 0.25)); pose.manoD = mezcla([72, 140], [40, 150], k); pose.manoI = mezcla([2, 140], [26, 150], k); }
      else if (t < T_LLEGA) { const f = t * 16; pose.manoD = [44, 128 + 22 * Math.sin(f)]; pose.manoI = [28, 128 - 22 * Math.sin(f)]; pose.rc = 0.06 * Math.sin(f); }
      else {
        sy = lerp(0.86, 1, eOut(tramo(t, T_LLEGA, T_LLEGA + 0.3)));
        // ¡choca!
        const k = eInOut(tramo(t, 8.0, 8.25)) * (1 - eInOut(tramo(t, 8.5, 8.8)));
        pose.manoI = mezcla([6, 140], [-30, 50], k); pose.manoD = [70, 140];
        if (t > 8.8) {
          // le sujeta del hombro cuando se marea
          const k2 = eInOut(tramo(t, 9.1, 9.4));
          pose.manoI = mezcla([6, 140], [-40, 96], k2); pose.cara = t < 9.4 ? "risa" : "sorpresa"; pose.rc = -0.1;
        }
      }
    }
    if (t > T_YA && t < T_ARRIBA) pose.cara = (t * 3) % 2 < 1 ? "risa" : "guino";
    return { pose, m: matAv(x, -h + bote, ESC, 0, 1, sy), x, h };
  }
  poseG(t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let m, h = this.hG(t), colgado = false, manoCuerda = null;
    if (t < T_YA) { pose.cara = "sorpresa"; pose.rc = -0.1; pose.manoD = [70, 158]; pose.manoI = [9, 160]; m = matAv(XG, 0, ESC); }
    else if (t < T_SUELTA) {
      this.trepar(pose, t * 7, "guillermo", 0.8);
      pose.cara = t < 2.4 ? "sonrisa" : t < 3.2 ? "sorpresa" : "dormido"; pose.rc = 0.05 * Math.sin(t * 7);
      m = matAv(XG, -h + 4 * Math.sin(t * 7), ESC);
    } else if (t < T_SUBE) {
      // colgado de una mano, balanceándose
      colgado = true;
      const d = t - T_SUELTA, sw = 0.32 * Math.sin(d * 4.2) * Math.exp(-d * 0.25) + 0.05;
      const A = this.agarre(), caida = 26 * eOut(Math.min(1, d / 0.15));
      m = matAv(A[0], A[1] + caida * 0.2, ESC, sw, 1, 1, [75, 22]);
      pose.manoD = [75, 22];
      pose.manoI = [-24 + 14 * Math.sin(t * 15), 70 + 30 * Math.sin(t * 11)];
      pose.piernaI = [-10 * Math.max(0, Math.sin(t * 13)), 0.2 * Math.sin(t * 13)]; pose.piernaD = [-10 * Math.max(0, -Math.sin(t * 13)), -0.2 * Math.sin(t * 13)];
      pose.cara = "sorpresa"; pose.rc = 0.18 + 0.05 * Math.sin(t * 20); pose.puntas = 0.6;
      if (t > T_AGARRA - 0.3) {
        // coge la cuerda con la otra mano
        const e = this.cuerda(t);
        if (e) { const k = eOut(tramo(t, T_AGARRA - 0.3, T_AGARRA)); const c = enAv(m, e.fin); pose.manoI = mezcla(pose.manoI, c, k); }
        pose.cara = t < T_AGARRA ? "sorpresa" : "guino";
      }
    } else if (t < T_LLEGA) {
      // ¡arriba! colgado de la cuerda con las dos manos
      colgado = true;
      const u = eIn(tramo(t, T_SUBE, T_LLEGA)), eM = this.poseM(t), mano = aPant(eM.m, [36, 150]);
      const yTop = lerp(this.agarre()[1] - 30, mano[1] + 16, u);
      m = matAv(mano[0] - lerp(40, 60, u), yTop, ESC, 0.08 * Math.sin(t * 9), 1, 1, [72, 12]);
      pose.manoD = [72, 12]; pose.manoI = [6, 14];
      pose.piernaI = [-6, 0.15]; pose.piernaD = [-6, -0.15];
      pose.cara = "sorpresa"; pose.puntas = 0.8;
      manoCuerda = mano;
    } else {
      // arriba, de pie
      const k = eOut(tramo(t, T_LLEGA, T_LLEGA + 0.25));
      m = matAv(lerp(XM2 - 20, XG + 30, k), -TOP - 40 * Math.sin(k * Math.PI), ESC);
      pose.cara = "risa"; pose.manoI = [9, 160]; pose.brazoIDelante = true;
      const kc = eInOut(tramo(t, 8.0, 8.25)) * (1 - eInOut(tramo(t, 8.5, 8.8)));
      pose.manoD = mezcla([70, 158], [108, 50], kc);
      if (t > 8.8) {
        // mira abajo… y se marea
        pose.cara = t < 9.15 ? "sorpresa" : "borracho";
        pose.rc = t < 9.15 ? 0.2 : 0.22 * Math.sin(t * 4);
        m = matAv(XG + 30, -TOP, ESC, t > 9.15 ? 0.08 * Math.sin(t * 4) : 0);
      }
    }
    return { pose, m, colgado, manoCuerda };
  }
  /** La cuerda: de las manos de Marcos hacia abajo. */
  cuerda(t) {
    if (t < T_CUERDA) return null;
    const eM = this.poseM(t), ini = aPant(eM.m, [33, 150]);
    if (t < T_SUBE) {
      const k = eOut(tramo(t, T_CUERDA, T_CUERDA + 0.5));
      const A = this.agarre(), fin = [lerp(ini[0], A[0] - 70, k), lerp(ini[1], A[1] + 40, k)];
      return { ini, fin, ondas: (1 - k) * 30 + 6 * Math.sin(t * 9) };
    }
    if (t < T_LLEGA) { const e = this.poseG(t); return { ini, fin: aPant(e.m, [72, 12]), ondas: 2 }; }
    return null;
  }
  encuadre(t) {
    const hM = this.hM(t), hG = t < T_SUBE ? this.hG(t) : TOP;
    let top = Math.max(hM, hG) + 300 + 120 * tramo(t, 3.0, 4.0), bot = Math.min(hM, hG) - 50;
    if (t > 4.6) top = Math.max(top, TOP + 420);
    const kA = eInOut(tramo(t, T_SUELTA + 0.25, T_SUELTA + 0.75)) * (1 - eInOut(tramo(t, 5.75, 6.2)));
    bot = lerp(bot, -60, kA); top = lerp(top, TOP + 560, kA);
    if (t > 7.2) { const k = eInOut(tramo(t, 7.2, 8.0)); top = lerp(top, TOP + 430, k); bot = lerp(bot, TOP - 200, k); }
    const z = Math.min(1, 560 / (top - bot));
    return { cy: -(top + bot) / 2 - 20 / z, z };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tiza", t > 0.15, () => { const e = this.poseM(t); for (let i = 0; i < 12; i++) p.nueva(P.VAPOR, e.x + azar(-20, 20), -150, azar(-80, 80), azar(-80, 20), azar(0.6, 1.0), azar(20, 40)); });
    this.una("din", t > T_ARRIBA + 0.15, () => { temblar(5, 0.15); this.din = t; });
    this.una("suelta", t > T_SUELTA, () => {
      temblar(14, 0.3);
      const m = matAv(XG, -560, ESC), q = aPant(m, [20, 232]);
      this.cae = { x: q[0], y: q[1], vy: -100, r: 0 };
      for (let i = 0; i < 10; i++) p.nueva(P.POLVO, q[0], q[1], azar(-160, 160), azar(-120, 40), azar(0.5, 0.9), azar(20, 34));
    });
    if (this.cae) { this.cae.vy += 1600 * dt; this.cae.y += this.cae.vy * dt; this.cae.r += 8 * dt; }
    // sudor de Guillermo
    if (t > 2.6 && t < T_SUBE && Math.random() < 8 * dt) { const e = this.poseG(t), q = aPant(e.m, [Math.random() < 0.5 ? 12 : 66, 30]); this.gotas.push({ x: q[0], y: q[1], vx: azar(-60, 60), vy: azar(-140, -40), v: 0.8 }); }
    this.una("llega", t > T_LLEGA, () => { temblar(8, 0.2); });
    this.una("choca", t > 8.25, () => {
      temblar(6, 0.15);
      const eM = this.poseM(t), q = aPant(eM.m, eM.pose.manoI || [0, 0]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 160);
      for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, q[0] + azar(-200, 200), q[1] - azar(150, 300), azar(-60, 60), azar(0, 80), azar(2, 3), azar(9, 14), i % 5);
    });
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    p.actualizar(dt);
  }
  escenario(g, t, cam) {
    // nubes (paralaje)
    g.fillStyle = "rgba(255,255,255,.9)";
    for (const [x, y, s] of [[60, -700, 1.2], [880, -980, 1], [700, -400, 0.8], [200, -1150, 0.9], [960, -200, 0.7]]) {
      const yy = y * 0.7 + cam.cy * 0.3;
      g.beginPath(); g.arc(x, yy, 30 * s, 0, 6.283); g.arc(x + 34 * s, yy - 14 * s, 38 * s, 0, 6.283); g.arc(x + 74 * s, yy, 28 * s, 0, 6.283); g.rect(x, yy - 4 * s, 74 * s, 30 * s); g.fill();
    }
    // suelo y árboles
    g.fillStyle = "#3a9a34"; g.fillRect(-2000, -30, 5000, 2000);
    g.fillStyle = "#2f7a2c";
    for (const x of [-20, 60, 960, 1040]) { g.beginPath(); g.arc(x, -120, 70, 0, 6.283); g.fill(); g.fillStyle = "#5a3a1e"; g.fillRect(x - 10, -60, 20, 40); g.fillStyle = "#2f7a2c"; }
    // muro, presas, colchonetas y plataforma: se pintan una vez
    if (!this.muroC) {
      const c = lienzoNuevo(860, TOP + 120), x = c.getContext("2d");
      x.translate(-80, TOP + 70);
      ((g) => {
        // muro
        const gm = g.createLinearGradient(110, 0, 914, 0);
        gm.addColorStop(0, "#5a6878"); gm.addColorStop(0.5, "#7a8a9c"); gm.addColorStop(1, "#4a5666");
        g.fillStyle = gm; g.fillRect(110, -TOP, 804, TOP + 4);
        g.strokeStyle = "rgba(20,30,40,.35)"; g.lineWidth = 2;
        for (let x = 110; x <= 914; x += 134) { g.beginPath(); g.moveTo(x, -TOP); g.lineTo(x, 0); g.stroke(); }
        for (let y = 0; y >= -TOP; y -= 134) { g.beginPath(); g.moveTo(110, y); g.lineTo(914, y); g.stroke(); }
        g.fillStyle = "rgba(20,30,40,.25)";
        for (let x = 140; x < 914; x += 34) for (let y = -20; y > -TOP; y -= 34) g.fillRect(x, y, 2, 2);
        for (const q of this.presas) presa(g, q.x, q.y, q.r, q.c, q.rot);
        // colchonetas
        g.fillStyle = "#2a5aff"; rectR(g, 90, -26, 844, 34, 8); g.fill();
        g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(96, -22, 832, 6);
        // plataforma de arriba, campana y banderín
        g.fillStyle = "#8a5a2e"; g.fillRect(96, -TOP - 4, 832, 16);
        g.fillStyle = "#c48a4a"; g.fillRect(96, -TOP - 8, 832, 6);
        g.strokeStyle = "#c8ccd4"; g.lineWidth = 3;
        for (let x = 110; x <= 914; x += 50) { g.beginPath(); g.moveTo(x, -TOP - 8); g.lineTo(x, -TOP - 60); g.stroke(); }
        g.beginPath(); g.moveTo(104, -TOP - 60); g.lineTo(920, -TOP - 60); g.stroke();
      })(x);
      this.muroC = c;
    }
    g.drawImage(this.muroC, 80, -TOP - 70);
    g.fillStyle = "#3a3a3a"; g.fillRect(858, -TOP - 140, 6, 132);
    const dd = this.din != null ? t - this.din : 9, osc = 0.4 * Math.sin(dd * 25) * Math.exp(-dd * 3);
    g.save(); g.translate(861, -TOP - 130); g.rotate(osc);
    const gb = g.createLinearGradient(-20, 0, 20, 0); gb.addColorStop(0, "#9a6a00"); gb.addColorStop(0.5, "#ffe27a"); gb.addColorStop(1, "#8a5a00");
    g.fillStyle = gb; g.beginPath(); g.moveTo(-6, 4); g.quadraticCurveTo(-8, 20, -22, 34); g.lineTo(22, 34); g.quadraticCurveTo(8, 20, 6, 4); g.closePath(); g.fill();
    g.fillStyle = "#5a3a00"; g.beginPath(); g.arc(0, 36, 5, 0, 6.283); g.fill();
    g.restore();
    g.fillStyle = "#3a3a3a"; g.fillRect(150, -TOP - 160, 4, 150);
    g.fillStyle = "#ff3d84"; g.beginPath(); g.moveTo(154, -TOP - 160); g.lineTo(204, -TOP - 146 + 4 * Math.sin(t * 8)); g.lineTo(154, -TOP - 130); g.fill();
  }
  dibujar(g) {
    const t = this.t, cam = this.encuadre(t), eG = this.poseG(t), eM = this.poseM(t);
    fondo(g, "#000");
    const gc = g.createLinearGradient(0, 0, 0, H);
    gc.addColorStop(0, "#2f8ee8"); gc.addColorStop(1, "#bfe6ff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.save();
    g.translate(512, 300); g.scale(cam.z, cam.z); g.translate(-512, -cam.cy);
    this.escenario(g, t, cam);
    if (this.cae) { g.save(); g.translate(this.cae.x, this.cae.y); presa(g, 0, 0, 13, "#ff7a1a", this.cae.r); g.restore(); }
    // la cuerda (por detrás de las manos)
    const C = this.cuerda(t);
    if (C) {
      g.strokeStyle = "#e8283a"; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(C.ini[0], C.ini[1]);
      const n = 14;
      for (let i = 1; i <= n; i++) { const u = i / n, x = lerp(C.ini[0], C.fin[0], u) + Math.sin(u * 9 + t * 10) * C.ondas * Math.sin(u * Math.PI), y = lerp(C.ini[1], C.fin[1], u); g.lineTo(x, y); }
      g.stroke();
      g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 1.5; g.setLineDash([6, 6]); g.stroke(); g.setLineDash([]);
    }
    pintarAvatar(g, eG.m, eG.pose, t);
    pintarAvatar(g, eM.m, eM.pose, t);
    if (t > 9.2) { const c = aPant(eG.m, [39, -2]); for (let i = 0; i < 3; i++) { const a = t * 6 + (i / 3) * 6.283; g.fillStyle = "#ffd34d"; estrella(g, c[0] + Math.cos(a) * 44, c[1] + Math.sin(a) * 11, 9, 3.6, a); g.fill(); } }
    g.fillStyle = "#9ad8ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3, 5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    g.restore();
    // textos (pantalla)
    const aP = (q) => [(q[0] - 512) * cam.z + 512, (q[1] - cam.cy) * cam.z + 300];
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 3, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    grito("¡YA!", 512, 120, T_YA, T_YA + 0.7, 80, "#fffdf5", "#7a0008");
    if (t > T_ARRIBA) { const q = aP([861, -TOP - 160]); grito("¡DING!", q[0] - 40, q[1] - 20, T_ARRIBA + 0.15, T_ARRIBA + 1.0, 50, "#ffd34d", "#4a2a00", 0.1); }
    if (t > T_SUELTA) { const q = aP(this.agarre()); grito("¡CRAC!", q[0] - 150, q[1] + 60, T_SUELTA, T_SUELTA + 0.7, 48, "#fffdf5", "#3a3a3a", 0.1); }
    if (t > T_CUERDA) { const q = aP(aPant(this.poseM(t).m, [39, 20])); grito("¡AGÁRRATE!", q[0] + 170, q[1] + 30, T_CUERDA, T_SUBE, 40, "#fffdf5", "#062a4a", 0.06); }
    if (t > 8.2 && t < 8.8) { const q = aP([XG + 110, -TOP - 280]); grito("¡CHOCA!", q[0], q[1], 8.25, 8.8, 46, "#ffd34d", "#4a1a00"); }
    if (t > T_SUELTA + 0.25) {
      const d = t - T_SUELTA - 0.25, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 84); g.rotate(-0.04); g.scale(s * 0.9, s * 0.9);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const cF = aP(aPant(eG.m, [39, 60]));
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.7, DUR - 0.04)));
    const cc = t < 1 ? [512, 380] : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00201", nombre: "Rocódromo", crear: () => new Rocodromo() });
})();
