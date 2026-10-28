"use strict";
/*
 * 00239 · BOMBEROS ESPACIALES
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el espacio, Marcos y Guillermo flotan con escafandras de cristal encima de los cascos de bombero, con una
 * manguera. A una estrellita le sale una llamarada (¡FUUUSH!): Marcos le echa agua y el agua se congela en cristales
 * de hielo que brillan. La estrella, ya fresquita, sonríe; los cristales le hacen un anillo y su gravedad atrapa a
 * los dos bomberos, que dan vueltas a su alrededor: ¡EN ÓRBITA!
 */
(() => {
const CT = cacheTexto();
const SX = 640, SY = 262, SR = 78;                          // la estrella
const RX = 296, RY = 92;                                    // la órbita
const XM0 = 262, YM0 = 300, XG0 = 108, YG0 = 340, ESC = 1.18;
const T_LLAMA = 0.9, T_AGUA = 1.85, T_APAGADA = 3.7, T_FELIZ = 4.0, T_SUELTA = 4.45, T_ORBITA = 4.75, T_PARA = 8.1,
  T_FIN = 9.0, DUR = 9.5;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(800, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bff4ff"); gr.addColorStop(1, "#2fe3e8");
  txt(g, "¡EN ÓRBITA!", 406, 156, { tam: 138, peso: 900, fam: FD, color: "#021a2a", esp: 6, max: 760 });
  txt(g, "¡EN ÓRBITA!", 400, 150, { tam: 138, peso: 900, fam: FD, color: gr, borde: "#032838", bordeAncho: 12, esp: 6, glow: "rgba(47,227,232,.9)", glowTam: 26, max: 760 });
  CT.set("t", c);
  return c;
}
/** Cristal de hielo (sprite). */
function cristalSpr() {
  if (CT.has("c")) return CT.get("c");
  const c = lienzoNuevo(48, 48), g = c.getContext("2d");
  g.translate(24, 24);
  g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB2.cian, -24, -24, 48, 48);
  g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
  g.strokeStyle = "#f2fdff"; g.lineWidth = 2.6; g.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    g.save(); g.rotate((i * Math.PI) / 3);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -15); g.moveTo(0, -9); g.lineTo(-5, -13); g.moveTo(0, -9); g.lineTo(5, -13); g.stroke();
    g.restore();
  }
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(0, 0, 3, 0, 6.283); g.fill();
  CT.set("c", c);
  return c;
}

class BomberosEspaciales extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.cris = [];          // cristales de hielo: { x, y, vx, vy, r, vr, s, anillo, a, va, f }
    this.cielo = null;
  }
  llama() { return eOut(tramo(this.t, T_LLAMA, T_LLAMA + 0.5)) * (1 - eInOut(tramo(this.t, T_AGUA + 0.6, T_APAGADA))); }
  /** Ángulo de Marcos en la órbita. */
  theta(t) {
    const u = tramo(t, T_ORBITA, T_PARA);
    return Math.PI + (Math.PI * 3.5 + 0.65) * (u * u * (3 - 2 * u) * 0.65 + u * 0.35);
  }
  /** Posición (centro del cuerpo), escala y si va por detrás de la estrella. */
  sitio(quien) {
    const t = this.t, M = quien === "M";
    const x0 = M ? XM0 : XG0, y0 = M ? YM0 : YG0;
    const flota = Math.sin(t * 1.6 + (M ? 0 : 2)) * 8;
    // entran flotando desde la izquierda
    const ent = eOut(tramo(t, 0, 0.9));
    let x = lerp(x0 - 260, x0, ent), y = y0 + flota, esc = ESC, giro = 0.06 * Math.sin(t * 1.3 + (M ? 1 : 0)), detras = false;
    if (t > T_SUELTA) {
      const th = this.theta(t) - (M ? 0 : 0.7 * tramo(t, T_ORBITA, T_ORBITA + 0.8) + 0.6 * eInOut(tramo(t, T_PARA - 1.4, T_PARA)));
      const ox = SX + RX * Math.cos(th), oy = SY + 18 + RY * Math.sin(th), os = 1.12 + 0.26 * Math.sin(th);
      const k = eInOut(tramo(t, T_SUELTA, T_ORBITA + 0.5));
      x = lerp(x, ox, k); y = lerp(y, oy, k); esc = lerp(ESC, os, k);
      giro = lerp(giro, 0.25 * Math.cos(th), k);
      detras = k > 0.5 && Math.sin(th) < -0.05;
    }
    return { x, y, esc, giro, detras };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [-4, 0.15 * Math.sin(t * 1.7)], piernaD: [-2, -0.12 * Math.sin(t * 1.5)], manoD: [64, 114], manoI: [16, 128], brazoIDelante: true, casco: true, cascoColor: "#f2c21b" };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [-3, 0.12 * Math.sin(t * 1.4)], piernaD: [-5, -0.14 * Math.sin(t * 1.8)], manoD: [92, 108], manoI: [62, 112], brazoIDelante: true };
    // ---- llamarada: Guillermo señala, Marcos apunta
    if (t > T_LLAMA && t < T_AGUA) {
      const k = eOut(tramo(t, T_LLAMA + 0.1, T_LLAMA + 0.3));
      G.cara = "sorpresa"; G.manoD = mezcla([64, 114], [104, 60], k); G.rc = 0.1;
      M.cara = "sorpresa"; M.rc = 0.08;
      if (t > T_LLAMA + 0.5) M.cara = "guino";
    }
    if (t >= T_AGUA && t < T_SUELTA) {
      M.cara = t < T_APAGADA ? "guino" : "risa"; M.rc = 0.06;
      G.cara = t < T_APAGADA ? "sorpresa" : "risa"; G.rc = 0.08;
      if (t > T_FELIZ) { G.manoD = [96, 70 + 8 * Math.sin(t * 12)]; }
    }
    // ---- en órbita: brazos abiertos, saludan
    if (t >= T_SUELTA) {
      const k = eOut(tramo(t, T_SUELTA, T_SUELTA + 0.4));
      G.brazoIDelante = false; M.brazoIDelante = false;
      G.manoD = mezcla([64, 114], [100, 60], k); G.manoI = mezcla([16, 128], [-22, 60], k);
      M.manoD = mezcla([92, 108], [88, 66], k); M.manoI = mezcla([62, 112], [-14, 66], k);
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.puntas = 0;
      if (t > T_ORBITA + 0.5) { G.cara = "risa"; M.cara = "risa"; }
      if (t > T_PARA - 0.2) {
        const s = Math.sin(t * 12);
        G.manoD = [96, 30 + 10 * s]; M.manoI = [-16, 30 - 10 * s]; G.cara = "guino"; M.cara = "risa";
        G.rc = -0.08; M.rc = 0.08;
      }
    }
    const sG = this.sitio("G"), sM = this.sitio("M");
    const mG = matAv(sG.x, sG.y, sG.esc, sG.giro, 1, 1, [39, 116]), mM = matAv(sM.x, sM.y, sM.esc, sM.giro, 1, 1, [39, 116]);
    return { G, M, mG, mM, sG, sM };
  }
  /** Boquilla de la lanza de Marcos (pantalla) y hacia dónde apunta. */
  lanza(e) {
    const a = aPant(e.mM, e.M._manoD || e.M.manoD);
    return [a[0] + 30, a[1] - 6];
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    const ll = this.llama();
    // llamarada: llamitas y chispas a lo largo del arco
    if (ll > 0.1 && Math.random() < 30 * dt * ll) {
      const u = Math.random(), q = this.arcoLlama(u, ll, t);
      p.nueva(P.LLAMA, q[0], q[1], azar(-30, 30), azar(-40, 20), azar(0.3, 0.6), azar(20, 34) * ll, Math.random() < 0.3 ? 1 : 0);
    }
    this.una("llama", t > T_LLAMA, () => { temblar(10, 0.4); p.nueva(P.DESTELLO, SX - SR - 40, SY, 0, 0, 0.35, 200); });
    // agua → hielo
    if (t > T_AGUA && t < T_APAGADA + 0.25) {
      const L = this.lanza(e), obj = this.arcoLlama(0.5, Math.max(ll, 0.3), t);
      for (let i = 0; i < 2; i++) {
        const u = azar(0.5, 0.75), vx = (obj[0] - L[0]) / u + azar(-40, 40), vy = (obj[1] - L[1]) / u + azar(-40, 40);
        if (this.cris.length < 150) this.cris.push({ x: L[0], y: L[1], vx, vy, r: azar(0, 6), vr: azar(-4, 4), s: azar(18, 32), anillo: false, a: 0, va: azar(0.4, 1.2), f: azar(0, 6), v: 0 });
      }
      if (Math.random() < 20 * dt) p.nueva(P.VAPOR, obj[0] + azar(-30, 30), obj[1] + azar(-30, 30), azar(-30, 30), azar(-60, -20), azar(0.6, 1.1), azar(30, 50));
    }
    for (const c of this.cris) {
      c.v += dt;
      if (!c.anillo) {
        c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
        // al llegar a la estrella, se quedan dando vueltas en el anillo
        if (Math.hypot(c.x - SX, (c.y - SY) * 2.4) < 230 || c.v > 1.1) { c.anillo = true; c.a = Math.atan2((c.y - SY) * 3, c.x - SX) + azar(-2.6, 2.6); c.rr = azar(140, 200); }
      } else {
        c.a += c.va * dt;
        const tx = SX + Math.cos(c.a) * c.rr, ty = SY + Math.sin(c.a) * c.rr * 0.2 - Math.cos(c.a) * c.rr * 0.12;
        c.x = lerp(c.x, tx, Math.min(1, 2.5 * dt)); c.y = lerp(c.y, ty, Math.min(1, 2.5 * dt)); c.r += c.vr * dt * 0.5;
      }
    }
    this.una("apagada", t > T_APAGADA, () => {
      temblar(8, 0.3);
      for (let i = 0; i < 18; i++) p.nueva(P.VAPOR, SX - SR - azar(10, 100), SY + azar(-60, 60), azar(-60, 20), azar(-60, 20), azar(0.8, 1.4), azar(36, 60));
    });
    this.una("feliz", t > T_FELIZ, () => { for (let i = 0; i < 20; i++) { const a = azar(0, 6.283); p.nueva(P.PURPURINA, SX + Math.cos(a) * 100, SY + Math.sin(a) * 100, Math.cos(a) * 60, Math.sin(a) * 60, azar(1, 1.6), azar(12, 18)); } });
    this.una("orbita", t > T_ORBITA + 0.3, () => {
      for (let i = 0; i < 40; i++) p.nueva(P.PURPURINA, azar(100, 920), azar(-40, 60), azar(-20, 20), azar(20, 60), azar(2, 3.2), azar(10, 16));
    });
    // estela de brillos de los dos en órbita
    if (t > T_ORBITA && t < T_PARA + 0.2 && Math.random() < 16 * dt) {
      for (const s of [e.sG, e.sM]) p.nueva(P.PURPURINA, s.x + azar(-20, 20), s.y + azar(-30, 30), 0, 0, azar(0.5, 0.9), azar(8, 13));
    }
    p.actualizar(dt);
  }
  /** Punto del arco de la llamarada (u 0–1 de un pie al otro). */
  arcoLlama(u, k, t) {
    const a0 = Math.PI * 0.82, a1 = Math.PI * 1.18;
    const p0 = [SX + Math.cos(a0) * SR, SY + Math.sin(a0) * SR], p1 = [SX + Math.cos(a1) * SR, SY + Math.sin(a1) * SR];
    const alto = (60 + 110 * k) * (1 + 0.05 * Math.sin(t * 8));
    const c = [SX - SR - alto * 1.5, SY + 4 * Math.sin(t * 3)];
    const v = 1 - u;
    return [v * v * p0[0] + 2 * v * u * c[0] + u * u * p1[0], v * v * p0[1] + 2 * v * u * (c[1] + 60 - 120 * 0.5) + u * u * p1[1]];
  }

  fondoC() {
    if (this.cielo) return this.cielo;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, H + 60);
    gc.addColorStop(0, "#050418"); gc.addColorStop(1, "#120a2e");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.2; g.drawImage(BLOB2.cian, -200, -100, 700, 500); g.drawImage(BLOB.rojo, 600, 300, 600, 400);
    g.globalAlpha = 0.12; g.drawImage(BLOB.naranja, 300, 80, 700, 400);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const r = semilla(17);
    for (let i = 0; i < 160; i++) { const x = r() * (W + 120) - 60, y = r() * (H + 120) - 60, s = 0.6 + r() * 2.2; g.globalAlpha = 0.3 + r() * 0.7; g.fillStyle = "#fff"; g.fillRect(x, y, s, s); }
    g.globalAlpha = 1;
    // planeta azul abajo a la izquierda
    const gp = g.createRadialGradient(40, 520, 30, 90, 620, 260);
    gp.addColorStop(0, "#7ad8ff"); gp.addColorStop(0.55, "#2468b8"); gp.addColorStop(1, "#071a33");
    g.fillStyle = gp; g.beginPath(); g.arc(80, 700, 230, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.ellipse(60, 520, 110, 14, -0.2, 0, 6.283); g.fill();
    // planetita lila arriba a la derecha
    const gl = g.createRadialGradient(930, 70, 4, 940, 80, 34);
    gl.addColorStop(0, "#e8c8ff"); gl.addColorStop(1, "#6a3aa0");
    g.fillStyle = gl; g.beginPath(); g.arc(940, 80, 32, 0, 6.283); g.fill();
    return (this.cielo = c);
  }
  estrella(g, t, ll) {
    const enf = ll, feliz = tramo(t, T_FELIZ, T_FELIZ + 0.3);
    // halo
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.7; g.drawImage(BLOB.amarillo, SX - SR * 2.6, SY - SR * 2.6, SR * 5.2, SR * 5.2);
    g.globalAlpha = 0.45 * (0.4 + enf); g.drawImage(BLOB.naranja, SX - SR * 2, SY - SR * 2, SR * 4, SR * 4);
    g.restore();
    // rayitos
    g.save(); g.translate(SX, SY); g.rotate(t * 0.3);
    g.fillStyle = enf > 0.3 ? "#ff8a2a" : "#ffd34d";
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(-10, -SR + 4); g.lineTo(0, -SR - 18 - 6 * Math.sin(t * 6 + i)); g.lineTo(10, -SR + 4); g.closePath(); g.fill(); }
    g.restore();
    const gr = g.createRadialGradient(SX - 24, SY - 26, 8, SX, SY, SR);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.55, enf > 0.3 ? "#ffb22a" : "#ffd84a"); gr.addColorStop(1, enf > 0.3 ? "#ff5a1a" : "#ffa21f");
    g.fillStyle = gr; g.beginPath(); g.arc(SX, SY, SR, 0, 6.283); g.fill();
    // cara
    g.strokeStyle = "#7a3a00"; g.fillStyle = "#5a2a00"; g.lineWidth = 4; g.lineCap = "round";
    if (feliz > 0.5) {
      for (const dx of [-24, 24]) { g.beginPath(); g.arc(SX + dx, SY - 6, 10, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
      g.fillStyle = "#8a2a10"; g.beginPath(); g.arc(SX, SY + 14, 18, 0.1, Math.PI - 0.1); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,90,90,.45)"; for (const dx of [-42, 42]) { g.beginPath(); g.ellipse(SX + dx, SY + 10, 11, 6, 0, 0, 6.283); g.fill(); }
    } else {
      for (const dx of [-24, 24]) { g.beginPath(); g.ellipse(SX + dx, SY - 6, 7, 10, 0, 0, 6.283); g.fill(); }
      g.fillStyle = "#fff"; for (const dx of [-26, 22]) { g.beginPath(); g.arc(SX + dx, SY - 10, 2.6, 0, 6.283); g.fill(); }
      if (enf > 0.3) {
        // enfadada: cejas y boca apretada
        g.beginPath(); g.moveTo(SX - 36, SY - 26); g.lineTo(SX - 14, SY - 18); g.moveTo(SX + 36, SY - 26); g.lineTo(SX + 14, SY - 18); g.stroke();
        g.beginPath(); g.moveTo(SX - 14, SY + 22); g.quadraticCurveTo(SX, SY + 14, SX + 14, SY + 22); g.stroke();
      } else {
        g.beginPath(); g.moveTo(SX - 12, SY + 16); g.quadraticCurveTo(SX, SY + 24, SX + 12, SY + 16); g.stroke();
      }
    }
  }
  /** La llamarada: un lazo de fuego que sale por la izquierda de la estrella. */
  llamarada(g, k, t) {
    if (k <= 0.01) return;
    const N = 24, pts = [];
    for (let i = 0; i <= N; i++) pts.push(this.arcoLlama(i / N, k, t));
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.globalCompositeOperation = "lighter";
    for (const [w, col, a] of [[44, "#ff3a0a", 0.55], [28, "#ff8a1a", 0.8], [12, "#fff0a0", 0.9]]) {
      g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = w * (0.5 + 0.5 * k) * (1 + 0.1 * Math.sin(t * 20 + w));
      g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0] + Math.sin(t * 13 + i) * 3, p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
    }
    g.restore();
  }
  /** Escafandra de cristal (por delante de la cara), en unidades del avatar. */
  escafandra(g, m, pose, q) {
    const R = avatar(q).rig, cx = q === "bombero" ? 37 : 39, cy = q === "bombero" ? 30 : 28, r = 52;
    conMat(g, m, () => {
      g.translate(R.cuello[0], R.cuello[1]); g.rotate(pose.rc || 0); g.translate(-R.cuello[0], -R.cuello[1]);
      g.fillStyle = "rgba(170,220,255,.10)"; g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(220,240,255,.7)"; g.lineWidth = 2.2; g.stroke();
      g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 4; g.lineCap = "round";
      g.beginPath(); g.arc(cx, cy, r - 7, Math.PI * 1.08, Math.PI * 1.38); g.stroke();
      g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, r - 7, Math.PI * 1.45, Math.PI * 1.52); g.stroke();
      g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(cx + 22, cy + 24, 9, 4, -0.7, 0, 6.283); g.fill();
      // aro del cuello
      const gr = g.createLinearGradient(cx - 34, 0, cx + 34, 0);
      gr.addColorStop(0, "#7d868e"); gr.addColorStop(0.5, "#f2f5f8"); gr.addColorStop(1, "#6a737b");
      g.fillStyle = gr; rectR(g, cx - 34, cy + r - 10, 68, 12, 5); g.fill();
      g.fillStyle = "#2bff5b"; g.beginPath(); g.arc(cx + 26, cy + r - 4, 2, 0, 6.283); g.fill();
    });
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), ll = this.llama();
    fondo(g, "#000");
    g.drawImage(this.fondoC(), -60, -60);
    // estrellitas que titilan
    g.fillStyle = "#fff";
    for (let i = 0; i < 14; i++) { const x = (i * 173) % W, y = (i * 97) % H; brillo(g, x, y, 6 + 3 * Math.sin(t * 3 + i), 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3)); }
    // cristales del anillo que van por detrás
    const spr = cristalSpr();
    const pintaCris = (delante) => {
      for (const c of this.cris) {
        const atras = c.anillo && Math.sin(c.a) < 0;
        if (atras === delante) continue;
        const s = c.s * (0.8 + 0.2 * Math.sin(t * 5 + c.f));
        g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.globalAlpha = atras ? 0.6 : 1;
        g.drawImage(spr, -s / 2, -s / 2, s, s); g.restore();
        const b = Math.sin(t * 4 + c.f * 3);
        if (b > 0.8 && !atras) brillo(g, c.x, c.y, s * 0.9, (b - 0.8) * 5);
      }
    };
    pintaCris(false);
    // los que van por detrás de la estrella en la órbita
    const avs = [["G", e.mG, e.G, e.sG, "guillermo"], ["M", e.mM, e.M, e.sM, "bombero"]];
    for (const [, m, pose, s, q] of avs) if (s.detras) { pintarAvatar(g, m, pose, t); this.escafandra(g, m, pose, q); }
    this.llamarada(g, ll, t);
    this.estrella(g, t, ll);
    pintaCris(true);
    // manguera: de fuera de la pantalla a las manos de Guillermo y a la lanza de Marcos
    const L = this.lanza(e);
    if (t < T_SUELTA + 0.6) {
      // pasa por las dos manos de Guillermo (mientras la sujeta)
      const suelta = eOut(tramo(t, T_SUELTA, T_SUELTA + 0.6));
      const hI = mezcla(aPant(e.mG, e.G._manoI || e.G.manoI), aPant(e.mG, [16, 128]), suelta);
      const hD = mezcla(aPant(e.mG, t < T_LLAMA || t > T_AGUA ? (e.G._manoD || e.G.manoD) : [64, 114]), aPant(e.mG, [64, 114]), suelta);
      const fin = mezcla([L[0] - 26, L[1] + 4], [hD[0] + 60, hD[1] + 140], suelta);
      g.strokeStyle = "#b8201a"; g.lineWidth = 10; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(-60, 470); g.bezierCurveTo(10, 470, hI[0] - 50, hI[1] + 40, hI[0], hI[1]);
      g.lineTo(hD[0], hD[1]);
      g.bezierCurveTo(hD[0] + 50, hD[1] - 30, fin[0] - 60, fin[1] + 40, fin[0], fin[1]); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 3; g.stroke();
    }
    for (const [, m, pose, s, q] of avs) if (!s.detras) { pintarAvatar(g, m, pose, t); this.escafandra(g, m, pose, q); }
    // lanza en la mano de Marcos
    if (t < T_SUELTA) {
      g.save(); g.translate(L[0] - 14, L[1] + 2); g.rotate(-0.08);
      const gl = g.createLinearGradient(0, -7, 0, 7); gl.addColorStop(0, "#fff0a0"); gl.addColorStop(0.5, "#d9a516"); gl.addColorStop(1, "#7a5200");
      g.fillStyle = gl; g.beginPath(); g.moveTo(-16, -8); g.lineTo(16, -5); g.lineTo(16, 5); g.lineTo(-16, 8); g.closePath(); g.fill();
      g.restore();
    }
    // chorro: agua que se va congelando
    if (t > T_AGUA && t < T_APAGADA + 0.25) {
      const k = tramo(t, T_AGUA, T_AGUA + 0.15) * (1 - tramo(t, T_APAGADA, T_APAGADA + 0.25));
      const obj = this.arcoLlama(0.5, Math.max(ll, 0.3), t), mid = mezcla(L, obj, 0.45);
      g.save(); g.lineCap = "round";
      const gr = g.createLinearGradient(L[0], L[1], mid[0], mid[1]);
      gr.addColorStop(0, "rgba(120,200,255,.85)"); gr.addColorStop(1, "rgba(200,245,255,0)");
      g.strokeStyle = gr; g.lineWidth = 16 * k; g.beginPath(); g.moveTo(L[0], L[1]); g.lineTo(mid[0], mid[1]); g.stroke();
      g.restore();
    }
    this.p.dibujar(g);
    // onomatopeyas
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡FUUUSH!", 470, 120, T_LLAMA + 0.1, 0.9, 58, "#ffd34d", "#5a1a00", -0.08);
    ono("¡FSSSS!", 300, 160, T_AGUA + 0.3, 1.3, 54, "#e8f6ff", "#123048", -0.06);
    ono("¡CRIC, CRIC!", 470, 470, T_AGUA + 0.9, 1.1, 44, "#bff4ff", "#0a3a4a", 0.06);
    ono("¡GRACIAS!", 800, 120, T_FELIZ + 0.1, 0.8, 46, "#fff6c0", "#5a2a00", 0.08);
    // ¡EN ÓRBITA!
    if (t > T_ORBITA + 0.2) {
      const d = t - T_ORBITA - 0.2, k = tramo(d, 0, 0.18), s = lerp(2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 78); g.rotate(-0.02 * Math.sin(d * 2)); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.55), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00239", nombre: "Bomberos espaciales", crear: () => new BomberosEspaciales() });
})();
