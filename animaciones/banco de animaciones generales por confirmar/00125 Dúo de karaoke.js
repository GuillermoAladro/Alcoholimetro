"use strict";
/*
 * 00125 · DÚO DE KARAOKE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden dos focos (rosa y cian) y Guillermo y Rodrigo cantan a dúo con sus micrófonos. Las notas de cada uno
 * suben trenzándose con las del otro y forman un corazón entre los dos: ♪ A DÚO ♪. Se emocionan, van a por la nota
 * más alta… y a los dos se les rompe la voz a la vez: ¡CRAC! El corazón se parte, las notas se caen y se mueren de risa.
 */
(() => {
const ESC = 1.5, XG = 340, XR = 684;
const HC = [512, 205], HS = 6.4;            // centro y escala del corazón
const N = 24;                               // notas (12 de cada uno)
const T0 = 1.0, PASO = 0.11, VIAJE = 1.55, T_LLENO = T0 + (N - 1) * PASO + VIAJE, T_ALTA = 6.0, T_CRAC = 6.7;
const ROSA = "#ff3d84", CIAN = "#2fe3e8";
const cache = cacheTexto();

function corazon(th) {
  const x = 16 * Math.pow(Math.sin(th), 3), y = 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th);
  return [HC[0] + x * HS, HC[1] - y * HS + 12];
}
function rutaCorazon(g, d = 0) {
  g.beginPath();
  for (let i = 0; i <= 60; i++) { const p = corazon((i / 60) * 6.283); const q = [HC[0] + (p[0] - HC[0]) * (1 + d), HC[1] + 12 + (p[1] - HC[1] - 12) * (1 + d)]; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
  g.closePath();
}
/** Sprite de nota musical (tipo 0: corchea, 1: dos corcheas unidas). */
function nota(col, tipo) {
  const k = col + tipo;
  if (cache.has(k)) return cache.get(k);
  const c = lienzoNuevo(64, 64), g = c.getContext("2d");
  g.translate(32, 34);
  g.shadowColor = col; g.shadowBlur = 10;
  g.fillStyle = "#ffffff"; g.strokeStyle = col; g.lineWidth = 3;
  const cabeza = (x, y) => { g.beginPath(); g.ellipse(x, y, 7.5, 5.5, -0.4, 0, 6.283); g.fill(); g.stroke(); };
  if (tipo === 0) {
    cabeza(-4, 12);
    g.fillRect(2, -20, 3.4, 32); g.strokeRect(2, -20, 3.4, 32);
    g.beginPath(); g.moveTo(5, -20); g.quadraticCurveTo(18, -12, 13, 0); g.quadraticCurveTo(14, -8, 5, -10); g.closePath(); g.fill(); g.stroke();
  } else {
    cabeza(-10, 14); cabeza(10, 8);
    g.fillRect(-4.6, -16, 3.2, 30); g.fillRect(15.4, -22, 3.2, 30);
    g.beginPath(); g.moveTo(-4.6, -16); g.lineTo(18.6, -22); g.lineTo(18.6, -15); g.lineTo(-4.6, -9); g.closePath(); g.fill(); g.stroke();
  }
  cache.set(k, c);
  return c;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(760, 170), g = c.getContext("2d");
  const gr = g.createLinearGradient(130, 0, 630, 0);
  gr.addColorStop(0, "#ffd0e4"); gr.addColorStop(0.5, "#ffffff"); gr.addColorStop(1, "#c8fbfc");
  txt(g, "A DÚO", 380, 128, { tam: 118, peso: 900, fam: FD, color: "#1a0f2e", esp: 8 });
  txt(g, "A DÚO", 380, 120, { tam: 118, peso: 900, fam: FD, color: gr, borde: "#1a0f2e", bordeAncho: 10, esp: 8, glow: "rgba(255,255,255,.6)", glowTam: 20 });
  // notas a los lados (dibujadas, no dependen de la fuente)
  g.font = `900 118px ${FD}`; if ("letterSpacing" in g) g.letterSpacing = "8px";
  const w = g.measureText("A DÚO").width; if ("letterSpacing" in g) g.letterSpacing = "0px";
  const n1 = nota(ROSA, 0), n2 = nota(CIAN, 0);
  g.drawImage(n1, 380 - w / 2 - 92, 30, 96, 96);
  g.save(); g.translate(380 + w / 2 + 40, 78); g.scale(-1, 1); g.drawImage(n2, -48, -48, 96, 96); g.restore();
  cache.set("t", c);
  return c;
}
function microfono(g, mano, boca) {
  const dx = boca[0] - mano[0], dy = boca[1] - mano[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const cab = [mano[0] + ux * (L - 7), mano[1] + uy * (L - 7)], pie = [mano[0] - ux * 5, mano[1] - uy * 5];
  g.lineCap = "round";
  g.strokeStyle = "#141418"; g.lineWidth = 5.5; g.beginPath(); g.moveTo(pie[0], pie[1]); g.lineTo(cab[0] - ux * 4, cab[1] - uy * 4); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.3)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(pie[0] + 1, pie[1] - 1); g.lineTo(cab[0] - ux * 4 + 1, cab[1] - uy * 4 - 1); g.stroke();
  const gr = g.createRadialGradient(cab[0] - 1.5, cab[1] - 1.5, 0.5, cab[0], cab[1], 5.5);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#7d8590");
  g.fillStyle = gr; g.beginPath(); g.arc(cab[0], cab[1], 5.2, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(40,40,50,.5)"; g.lineWidth = 0.6;
  g.beginPath(); g.moveTo(cab[0] - 5, cab[1]); g.lineTo(cab[0] + 5, cab[1]); g.moveTo(cab[0], cab[1] - 5); g.lineTo(cab[0], cab[1] + 5); g.stroke();
}

class Karaoke extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(360);
    this.notas = [];
    for (let i = 0; i < N; i++) {
      const deG = i % 2 === 0, j = i >> 1;
      // los huecos del corazón: los de Guillermo por la izquierda y los de Rodrigo por la derecha, de abajo arriba
      const th = deG ? Math.PI + ((j + 0.5) / 12) * Math.PI : Math.PI - ((j + 0.5) / 12) * Math.PI;
      this.notas.push({ deG, t0: T0 + i * PASO, hueco: corazon(th), tipo: (i * 7) % 3 === 0 ? 1 : 0, rot: azar(-0.3, 0.3), cae: null });
    }
  }
  luz(t) {
    const on = t < 0.6 ? [0, 1, 0, 1, 0.5, 1][Math.min(5, Math.floor(t / 0.1))] : 1;
    return on * (1 - tramo(t, 8.9, 9.55));
  }
  estado(t) {
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 160] };
    const R = { quien: "rodrigo", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [68, 157], brazoIDelante: true };
    let giro = 0.035 * Math.sin(t * 4) * tramo(t, 0.8, 1.2), syG = 1, syR = 1;
    const canta = t > T0 - 0.1 && t < T_CRAC;
    if (canta) {
      const b = Math.floor((t - T0) / 0.38);
      G.cara = b % 3 === 2 ? "dormido" : "risa"; R.cara = b % 3 === 0 ? "dormido" : "risa";
      G.rc = 0.06 * Math.sin(t * 4); R.rc = 0.06 * Math.sin(t * 4);
    } else if (t < T0) { G.cara = "guino"; R.cara = "guino"; G.rc = 0.1 * tramo(t, 0.6, 0.9); R.rc = -0.1 * tramo(t, 0.6, 0.9); }
    let giroG = giro, giroR = giro;
    // el corazón está hecho: se emocionan
    if (t > T_LLENO - 0.4 && t < T_ALTA) {
      const k = eInOut(tramo(t, T_LLENO - 0.4, T_LLENO));
      G.cara = "dormido"; R.cara = "dormido"; G.rc = 0.12 * k; R.rc = -0.12 * k;
      giroG = lerp(giro, 0.05, k); giroR = lerp(giro, -0.05, k);
      G.manoI = mezcla([9, 160], [-24, 70], k); R.manoD = mezcla([68, 157], [102, 72], k);
    }
    // la nota alta
    if (t >= T_ALTA && t < T_CRAC) {
      const k = eInOut(tramo(t, T_ALTA, T_ALTA + 0.35)), tr = 0.012 * Math.sin(t * 60) * tramo(t, T_ALTA + 0.3, T_CRAC);
      G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = -0.14 * k + tr; R.rc = 0.14 * k - tr;
      giroG = -0.07 * k + tr; giroR = 0.07 * k - tr;
      G.manoI = mezcla([-24, 70], [-22, 6], k); R.manoD = mezcla([102, 72], [100, 8], k);
      G.puntas = 0.7 * k; R.puntas = 0.7 * k;
    }
    // ¡CRAC!: la mano al cuello
    if (t >= T_CRAC && t < T_CRAC + 0.95) {
      const k = eOut(tramo(t, T_CRAC, T_CRAC + 0.2)), sh = 0.03 * Math.sin(t * 40) * (1 - tramo(t, T_CRAC + 0.45, T_CRAC + 0.9));
      G.cara = "borracho"; R.cara = "borracho"; G.rc = sh; R.rc = -sh;
      G.manoI = mezcla([-22, 6], [30, 80], k); R.manoD = mezcla([100, 8], [48, 86], k);
      G.puntas = 0.7 * (1 - tramo(t, T_CRAC, T_CRAC + 0.4)); R.puntas = G.puntas;
      syG = syR = 1 - 0.05 * k;
      if (t > T_CRAC + 0.5) { G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = 0.14; R.rc = -0.14; }
    }
    if (t >= T_CRAC + 0.95) {
      const r = Math.abs(Math.sin((t - T_CRAC - 0.95) * 9));
      G.cara = "risa"; R.cara = "risa"; G.rc = 0.08 * Math.sin(t * 9); R.rc = -0.08 * Math.sin(t * 9 + 1);
      G.manoI = [20, 140]; R.manoD = [60, 140]; syG = 1 - 0.035 * r; syR = 1 - 0.035 * r;
      giroG = 0.04 * Math.sin(t * 4.5); giroR = -giroG;
    }
    // micrófonos en la mano de dentro, pegados a la boca
    const kM = eOut(tramo(t, 0.5, 0.85));
    const bG = boca(G.rc), bR = boca(R.rc, "rodrigo");
    G.manoD = mezcla([70, 158], [bG[0] + 11, bG[1] + 22], kM);
    R.manoI = mezcla([9, 157], [bR[0] - 11, bR[1] + 22], kM);
    G.objD2 = (g, m) => microfono(g, m, kM > 0.6 ? bG : [m[0] - 4, m[1] - 20]);
    R.objI2 = (g, m) => microfono(g, m, kM > 0.6 ? bR : [m[0] + 4, m[1] - 20]);
    return { G, R, mG: matAv(XG, PIES, ESC, giroG, 1, syG), mR: matAv(XR, PIES, ESC, giroR, 1, syR) };
  }
  /** Posición de una nota (pantalla) en el instante t. */
  posNota(n, t, e) {
    const u = tramo(t, n.t0, n.t0 + VIAJE);
    const b = n.deG ? aPant(e.mG, boca(0)) : aPant(e.mR, boca(0, "rodrigo"));
    const ini = [b[0] + (n.deG ? 26 : -26), b[1] - 10];
    const k = eInOut(u), s = Math.sin(u * Math.PI * 3) * 46 * Math.sin(u * Math.PI) * (n.deG ? 1 : -1);
    return [lerp(ini[0], n.hueco[0], k) + s, lerp(ini[1], n.hueco[1], k) - 50 * Math.sin(u * Math.PI)];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("lleno", t > T_LLENO, () => {
      for (let i = 0; i < 30; i++) p.nueva(P.PURPURINA, HC[0] + azar(-110, 110), HC[1] + azar(-90, 90), azar(-40, 40), azar(-40, 20), azar(0.8, 1.4), azar(6, 12));
      temblar(4, 0.2);
    });
    this.una("crac", t > T_CRAC, () => {
      temblar(22, 0.5);
      for (const n of this.notas) { const izq = n.hueco[0] < HC[0]; n.cae = { vx: (izq ? -1 : 1) * azar(60, 200), vy: azar(-200, -40), vr: azar(-6, 6), x: n.hueco[0], y: n.hueco[1], r: n.rot }; }
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, HC[0], HC[1] + 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 14)); }
      p.nueva(P.DESTELLO, HC[0], HC[1] + 20, 0, 0, 0.3, 200);
    });
    for (const n of this.notas) if (n.cae) { n.cae.vy += 900 * dt; n.cae.x += n.cae.vx * dt; n.cae.y += n.cae.vy * dt; n.cae.r += n.cae.vr * dt; }
    p.alfa = 1 - tramo(t, 8.9, 9.5);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = luz;
    // fondo del escenario: telón oscuro con lucecitas y suelo
    const gc = g.createLinearGradient(0, 0, 0, PIES);
    gc.addColorStop(0, "#120a1e"); gc.addColorStop(1, "#24123a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, PIES + 60);
    g.fillStyle = "rgba(0,0,0,.25)";
    for (let x = -40; x < W + 60; x += 64) g.fillRect(x, -60, 26, PIES + 60);
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 26; i++) {
      const x = (i * 211) % W, y = 40 + ((i * 97) % 300), a = 0.25 + 0.25 * Math.sin(t * 2 + i);
      g.globalAlpha = luz * a; g.drawImage(i % 2 ? BLOB2.cian : BLOB.rojo, x - 10, y - 10, 20, 20);
    }
    for (const [xa, x, col] of [[200, XG, "255,61,132"], [824, XR, "47,227,232"]]) {
      const gr = g.createLinearGradient(0, -20, 0, PIES);
      gr.addColorStop(0, `rgba(${col},.32)`); gr.addColorStop(1, `rgba(${col},.1)`);
      g.globalAlpha = luz; g.fillStyle = gr;
      g.beginPath(); g.moveTo(xa - 24, -20); g.lineTo(xa + 24, -20); g.lineTo(x + 150, PIES); g.lineTo(x - 150, PIES); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = luz;
    const gs = g.createLinearGradient(0, PIES, 0, H + 60);
    gs.addColorStop(0, "#2a1838"); gs.addColorStop(1, "#0a0610");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 64 - PIES);
    g.restore();
    // corazón de luz detrás de las notas (y sus dos mitades al romperse)
    const kH = tramo(t, T_LLENO - 0.3, T_LLENO + 0.2);
    if (kH > 0) {
      const late = 1 + 0.06 * Math.max(0, Math.sin((t - T_LLENO) * 7)) * (t < T_CRAC ? 1 : 0);
      const dc = Math.max(0, t - T_CRAC);
      for (const lado of [-1, 1]) {
        g.save();
        g.globalAlpha = luz * kH * (1 - tramo(dc, 0.5, 1.1));
        g.translate(HC[0] + lado * (dc * 140), HC[1] + dc * dc * 700); g.rotate(lado * dc * 1.2); g.translate(-HC[0], -HC[1]);
        g.beginPath();
        if (lado < 0) { g.moveTo(HC[0] - 200, HC[1] - 140); g.lineTo(HC[0] + 6, HC[1] - 140); for (let i = 0; i <= 8; i++) g.lineTo(HC[0] + (i % 2 ? -12 : 10), HC[1] - 110 + i * 36); g.lineTo(HC[0] - 200, HC[1] + 200); }
        else { g.moveTo(HC[0] + 200, HC[1] - 140); g.lineTo(HC[0] + 6, HC[1] - 140); for (let i = 0; i <= 8; i++) g.lineTo(HC[0] + (i % 2 ? -12 : 10), HC[1] - 110 + i * 36); g.lineTo(HC[0] + 200, HC[1] + 200); }
        g.closePath(); g.clip();
        g.translate(HC[0], HC[1] + 12); g.scale(late, late); g.translate(-HC[0], -HC[1] - 12);
        rutaCorazon(g, 0.06);
        const gr = g.createLinearGradient(HC[0] - 120, 0, HC[0] + 120, 0);
        gr.addColorStop(0, "rgba(255,61,132,.55)"); gr.addColorStop(1, "rgba(47,227,232,.55)");
        g.fillStyle = gr; g.shadowColor = "rgba(255,255,255,.6)"; g.shadowBlur = 24; g.fill();
        g.shadowBlur = 0; g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.85)"; g.stroke();
        g.restore();
      }
      // la grieta
      if (dc > 0 && dc < 0.35) {
        g.save(); g.strokeStyle = `rgba(255,255,255,${1 - dc / 0.35})`; g.lineWidth = 5; g.lineJoin = "miter";
        g.beginPath(); g.moveTo(HC[0] + 6, HC[1] - 140);
        for (let i = 0; i <= 8; i++) g.lineTo(HC[0] + (i % 2 ? -12 : 10), HC[1] - 110 + i * 36);
        g.stroke(); g.restore();
      }
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    // notas
    for (const n of this.notas) {
      if (t < n.t0) continue;
      let x, y, r = n.rot, a = Math.min(1, (t - n.t0) / 0.15);
      if (n.cae) { x = n.cae.x; y = n.cae.y; r = n.cae.r; a *= 1 - tramo(t, T_CRAC + 0.6, T_CRAC + 1.3); }
      else { [x, y] = this.posNota(n, t, e); if (t > n.t0 + VIAJE) { const lat = t < T_CRAC ? 1 + 0.08 * Math.max(0, Math.sin((t - T_LLENO) * 7)) : 1; x = HC[0] + (x - HC[0]) * lat; y = HC[1] + 12 + (y - HC[1] - 12) * lat; r += 0.15 * Math.sin(t * 4 + n.t0 * 9); } }
      if (a <= 0) continue;
      const spr = nota(n.deG ? ROSA : CIAN, n.tipo), s = 0.62;
      g.save(); g.globalAlpha = a * luz; g.translate(x, y); g.rotate(r); g.drawImage(spr, -32 * s, -32 * s, 64 * s, 64 * s); g.restore();
    }
    // la nota alta: una nota grande que crece en cada boca y se raja
    if (t > T_ALTA + 0.15 && t < T_CRAC + 0.5) {
      const k = tramo(t, T_ALTA + 0.15, T_CRAC), dc = Math.max(0, t - T_CRAC);
      for (const [m, q, col, lado] of [[e.mG, boca(e.G.rc), ROSA, -1], [e.mR, boca(e.R.rc, "rodrigo"), CIAN, 1]]) {
        const b = aPant(m, q), s = 0.6 + 1.0 * k;
        g.save(); g.globalAlpha = luz * (1 - tramo(dc, 0.1, 0.5));
        g.translate(b[0] + lado * (30 + 40 * k), b[1] - 60 - 50 * k + dc * dc * 900); g.rotate(lado * (0.2 + dc * 4));
        const spr = nota(col, 0); g.drawImage(spr, -32 * s, -32 * s, 64 * s, 64 * s);
        if (dc > 0) { g.strokeStyle = "#1a0f2e"; g.lineWidth = 3; g.beginPath(); g.moveTo(-14 * s, -18 * s); g.lineTo(-2 * s, -6 * s); g.lineTo(-8 * s, 2 * s); g.lineTo(6 * s, 16 * s); g.stroke(); }
        g.restore();
      }
    }
    this.p.dibujar(g);
    // ♪ A DÚO ♪
    if (t > 3.35) {
      const d = t - 3.35, k = tramo(d, 0, 0.25), s = lerp(0.4, 1, eBack(k));
      const sh = t > T_CRAC && t < T_CRAC + 0.5 ? 6 * Math.sin(t * 70) * (1 - (t - T_CRAC) / 0.5) : 0;
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 2) * luz; g.translate(512 + sh, 66); g.rotate(t > T_CRAC ? 0.04 * tramo(t, T_CRAC, T_CRAC + 0.3) : 0); g.scale(s * 0.92, s * 0.92);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // ¡CRAC!
    if (t > T_CRAC && t < T_CRAC + 1.1) {
      const k = tramo(t, T_CRAC, T_CRAC + 0.12);
      g.save(); g.translate(512, 360); g.rotate(-0.1); g.scale(eBack(k) * 1.1, eBack(k) * 1.1);
      txt(g, "¡CRAC!", 0, 0, { tam: 78, peso: 400, fam: FC, color: "#ffe066", borde: "#2a0a1a", bordeAncho: 10, alfa: 1 - tramo(t, T_CRAC + 0.85, T_CRAC + 1.1), esp: 3 });
      g.restore();
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00125", nombre: "Dúo de karaoke", crear: () => new Karaoke() });
})();
