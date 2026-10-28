"use strict";
/*
 * 00066 · GONDOLERO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Atardecer en un canal… de cerveza. Guillermo llega en góndola, con canotier y pañuelo, remando con la pala y una
 * jarra vacía en la otra mano (la sacude: ni una gota). Se arranca a cantar ♪ GONDOLERO ♪, saca la jarra por la
 * borda, sube a la nota más alta… y del canal sale un chorro de cerveza que se la llena hasta arriba. Brinda, la
 * canción estalla en grande y la góndola se va. Se apagan las farolas.
 */
(() => {
const WL = 506;            // superficie del canal
const CUBIERTA = 486;      // donde pisa (pies del avatar)

/** Corchea dibujada. */
function nota(g, x, y, s, col, doble) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 3; g.lineCap = "round";
  g.beginPath(); g.ellipse(0, 0, 8, 6, -0.4, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(7, -2); g.lineTo(7, -32); g.stroke();
  if (doble) { g.beginPath(); g.ellipse(22, -6, 8, 6, -0.4, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(29, -8); g.lineTo(29, -38); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(7, -32); g.lineTo(29, -38); g.stroke(); }
  else { g.beginPath(); g.moveTo(7, -32); g.quadraticCurveTo(12, -20, 20, -18); g.stroke(); }
  g.restore();
}

/** Canotier de paja; (0, 0) = cuello. */
function canotier(g, rc) {
  g.save(); g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(rc + 0.05);
  const gc = g.createLinearGradient(-22, 0, 22, 0); gc.addColorStop(0, "#b8912e"); gc.addColorStop(0.45, "#f2d77e"); gc.addColorStop(1, "#a8801f");
  g.fillStyle = gc; rectR(g, -22, -84, 44, 18, 2); g.fill();
  g.fillStyle = "#f6e09a"; g.beginPath(); g.ellipse(0, -84, 22, 3.2, 0, 0, 6.283); g.fill();
  g.fillStyle = "#c8202c"; g.fillRect(-22, -74, 44, 7);
  g.fillStyle = "#1c2a5a"; g.fillRect(-22, -72, 44, 2);
  const ga = g.createLinearGradient(0, -70, 0, -60); ga.addColorStop(0, "#f6dd8c"); ga.addColorStop(1, "#b08a2a");
  g.fillStyle = ga; g.beginPath(); g.ellipse(0, -66, 44, 5.5, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(120,90,20,.5)"; g.lineWidth = 0.7;
  for (let x = -18; x <= 18; x += 4) { g.beginPath(); g.moveTo(x, -82); g.lineTo(x, -75); g.stroke(); }
  g.restore();
}

class EscenaGondola extends Escena {
  constructor() {
    super(10.6);
    this.p = new Parts(420);
    this.ESC = 1.25;
    this.fondoC = this.pintarFondo();
    this.notas = [];
  }
  pintarFondo() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gc = g.createLinearGradient(0, 0, 0, 430);
    gc.addColorStop(0, "#241640"); gc.addColorStop(0.6, "#8a3f6a"); gc.addColorStop(1, "#ff9a5c");
    g.fillStyle = gc; g.fillRect(0, 0, W, 440);
    g.fillStyle = "#fff4d6"; g.beginPath(); g.arc(820, 80, 30, 0, 6.283); g.fill();
    g.fillStyle = "#241640"; g.beginPath(); g.arc(808, 72, 28, 0, 6.283); g.fill();
    // fachadas
    const r = semilla(17);
    const casas = [[-20, 150, 210, "#c9744a"], [130, 120, 160, "#d9a25a"], [250, 180, 230, "#b8585a"], [430, 140, 170, "#cf8a4e"], [570, 170, 210, "#a8606a"], [740, 130, 190, "#d4935a"], [870, 180, 240, "#b9684a"]];
    for (const [x, w, alto, col] of casas) {
      const y0 = 430 - alto;
      g.fillStyle = col; g.fillRect(x, y0, w, alto);
      g.fillStyle = "rgba(40,10,40,.35)"; g.fillRect(x, y0, w, alto);
      g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x, y0 - 8, w, 8);
      for (let fy = y0 + 22; fy < 400; fy += 52) for (let fx = x + 16; fx < x + w - 24; fx += 34) {
        const luz = r() < 0.55;
        g.fillStyle = luz ? "#ffd27a" : "#2a1828";
        g.beginPath(); g.moveTo(fx, fy + 30); g.lineTo(fx, fy + 10); g.arc(fx + 9, fy + 10, 9, Math.PI, 0); g.lineTo(fx + 18, fy + 30); g.closePath(); g.fill();
        if (luz) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB.naranja, fx - 12, fy - 6, 42, 46); g.restore(); }
      }
    }
    // puente de piedra al fondo
    g.fillStyle = "#e3c9a0";
    g.beginPath(); g.moveTo(300, 430); g.lineTo(300, 352); g.quadraticCurveTo(512, 300, 724, 352); g.lineTo(724, 430); g.lineTo(684, 430); g.quadraticCurveTo(512, 330, 340, 430); g.closePath(); g.fill();
    g.fillStyle = "rgba(60,20,40,.35)"; g.fill();
    g.strokeStyle = "#f6e6c4"; g.lineWidth = 3; g.beginPath(); g.moveTo(300, 352); g.quadraticCurveTo(512, 300, 724, 352); g.stroke();
    for (let x = 320; x < 710; x += 18) { const y = 352 - 52 * (1 - Math.pow((x - 512) / 212, 2)); g.fillStyle = "rgba(246,230,196,.8)"; g.fillRect(x, y - 16, 4, 16); }
    // postes de amarre
    for (const [x, c1] of [[120, "#c8202c"], [160, "#1f4fa8"], [880, "#c8202c"]]) {
      for (let y = 380; y < 470; y += 14) { g.fillStyle = ((y / 14) & 1) ? c1 : "#f4efe6"; g.fillRect(x, y, 10, 14); }
      g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(x + 5, 378, 7, 0, 6.283); g.fill();
    }
    // canal de cerveza
    const gw = g.createLinearGradient(0, 430, 0, H); gw.addColorStop(0, "#ffc84a"); gw.addColorStop(0.4, "#e9951a"); gw.addColorStop(1, "#9a5408");
    g.fillStyle = gw; g.fillRect(0, 430, W, H - 430);
    g.fillStyle = "#fff4dc"; g.fillRect(0, 428, W, 6);
    return c;
  }
  popa() { // x de la popa (donde pisa)
    const t = this.t;
    if (t < 3.0) return lerp(-260, 300, eOut(tramo(t, 0, 3.0)));
    if (t < 8.6) return 300;
    return lerp(300, 1400, eIn(tramo(t, 8.6, 10.3)));
  }
  luz() { return tramo(this.t, 0.02, 0.55) * (1 - tramo(this.t, 9.7, 10.5)); }
  canta() { const t = this.t; return t > 3.0 && t < 8.7; }
  estado() {
    const t = this.t, S = this.popa();
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0.02], piernaD: [0, -0.02], brazoIDelante: true };
    let manoD = [92, 118], manoI = [4, 150], giro = 0, nivel = 0, angJ = 0;
    const remando = t < 3.0 || t > 8.6;
    const fase = (t * Math.PI * 2) / 1.2;
    if (remando) { manoD = [92 + 10 * Math.sin(fase), 118 - 4 * Math.cos(fase)]; giro = 0.04 * Math.sin(fase); }
    // sacude la jarra vacía: ni una gota
    if (t > 1.6 && t < 2.9) {
      const k = eInOut(tramo(t, 1.6, 1.9)) * (1 - eInOut(tramo(t, 2.6, 2.9)));
      manoI = mezcla(manoI, [-12, 96 + 6 * Math.sin(t * 30)], k); angJ = -2.6 * k;
      pose.cara = t > 2.0 ? "borracho" : "sonrisa"; pose.rc = -0.1 * k;
    }
    // canta
    if (this.canta()) {
      const kA = eBack(tramo(t, 3.0, 3.35));
      manoI = mezcla([4, 150], [-34, 74 + 6 * Math.sin(t * 3)], kA);
      pose.cara = "risa"; pose.rc = -0.1 + 0.08 * Math.sin(t * 2.6);
      manoD = [88, 120];
      // saca la jarra por la borda y sube a la nota alta
      const kF = eInOut(tramo(t, 5.3, 5.7));
      manoI = mezcla(manoI, [-40, 128], kF);
      if (t > 5.6 && t < 6.45) { pose.cara = "sorpresa"; pose.rc = -0.2 + 0.03 * Math.sin(t * 50); }
      if (t >= 6.45) {
        nivel = eOut(tramo(t, 6.45, 6.85));
        const kB = eBack(tramo(t, 7.0, 7.3));
        manoI = mezcla([-40, 128], [-30, 52], kB);
        pose.cara = t < 7.0 ? "sorpresa" : t < 7.9 ? "risa" : "guino";
        pose.rc = -0.05 + 0.05 * Math.sin(t * 5);
      }
    }
    if (t > 8.6) { manoI = [-30, 52]; nivel = 1; pose.cara = "guino"; }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objI = (g, m) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], angJ, nivel, "asa", t); dibujarJarra(g, [0, 0], angJ, nivel, "cuerpo", t); g.restore(); };
    pose.objD = () => {};
    const rc = pose.rc;
    pose.objD = (g) => {
      // pañuelo rojo al cuello y canotier
      g.fillStyle = "#c8202c"; g.beginPath(); g.moveTo(22, 72); g.lineTo(56, 72); g.lineTo(42, 92); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.8)"; for (const [x, y] of [[30, 76], [40, 78], [48, 76], [41, 85]]) { g.beginPath(); g.arc(x, y, 1.3, 0, 6.283); g.fill(); }
      canotier(g, rc);
    };
    const m = matAv(S, CUBIERTA, this.ESC, giro);
    return { pose, m, S, remando, fase, nivel };
  }
  remo(g, e) {
    const mano = aPant(e.m, e.pose._manoD || [92, 118]);
    const S = e.S;
    const pala = [S + 250 + (e.remando ? -30 * Math.sin(e.fase) : 0), WL + 30];
    const dx = pala[0] - mano[0], dy = pala[1] - mano[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const tope = [mano[0] - ux * 30, mano[1] - uy * 30];
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#5a3416"; g.lineWidth = 9; g.beginPath(); g.moveTo(tope[0], tope[1]); g.lineTo(pala[0], pala[1]); g.stroke();
    g.strokeStyle = "#9a6a3a"; g.lineWidth = 4; g.beginPath(); g.moveTo(tope[0], tope[1]); g.lineTo(pala[0], pala[1]); g.stroke();
    g.translate(pala[0], pala[1]); g.rotate(Math.atan2(uy, ux));
    g.fillStyle = "#7a4a22"; g.beginPath(); g.ellipse(10, 0, 40, 11, 0, 0, 6.283); g.fill();
    g.restore();
    // la horquilla (forcola)
    const fx = S + 95, fy = CUBIERTA - 6;
    g.fillStyle = "#6b4220"; g.beginPath(); g.moveTo(fx - 8, fy); g.quadraticCurveTo(fx - 14, fy - 40, fx, fy - 52); g.quadraticCurveTo(fx + 12, fy - 40, fx + 8, fy); g.closePath(); g.fill();
    return pala;
  }
  gondola(g, S, t) {
    g.save(); g.translate(S, CUBIERTA);
    // casco
    const gh = g.createLinearGradient(0, -40, 0, 40); gh.addColorStop(0, "#3a3a44"); gh.addColorStop(0.35, "#0c0c10"); gh.addColorStop(1, "#000");
    g.fillStyle = gh;
    g.beginPath();
    g.moveTo(-150, -64); g.quadraticCurveTo(-160, -40, -128, -8);
    g.quadraticCurveTo(-90, 34, 0, 40); g.lineTo(380, 40); g.quadraticCurveTo(490, 30, 540, -30);
    g.lineTo(530, -36); g.quadraticCurveTo(470, -2, 380, 2); g.lineTo(-40, 2); g.quadraticCurveTo(-110, 0, -134, -60); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.moveTo(-100, 8); g.quadraticCurveTo(160, 16, 440, 8); g.lineTo(440, 12); g.quadraticCurveTo(160, 20, -100, 12); g.closePath(); g.fill();
    // filete dorado
    g.strokeStyle = "#e0a92a"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-120, -20); g.quadraticCurveTo(-60, 4, 40, 6); g.lineTo(380, 6); g.quadraticCurveTo(460, 2, 520, -30); g.stroke();
    // asiento de terciopelo
    const gs = g.createLinearGradient(0, -34, 0, 0); gs.addColorStop(0, "#d63248"); gs.addColorStop(1, "#7a0a1c");
    g.fillStyle = gs; rectR(g, 170, -32, 110, 34, 8); g.fill();
    g.strokeStyle = "#e0a92a"; g.lineWidth = 3; rectR(g, 170, -32, 110, 34, 8); g.stroke();
    g.fillStyle = "#e0a92a"; for (const x of [184, 225, 266]) { g.beginPath(); g.arc(x, -18, 3, 0, 6.283); g.fill(); }
    // hierro de proa
    g.save(); g.translate(530, -34);
    const gf = g.createLinearGradient(-10, 0, 20, 0); gf.addColorStop(0, "#8c939c"); gf.addColorStop(0.5, "#f2f5f8"); gf.addColorStop(1, "#7a828c");
    g.fillStyle = gf;
    g.beginPath(); g.moveTo(-6, 4); g.lineTo(-4, -64); g.quadraticCurveTo(0, -84, 18, -88); g.quadraticCurveTo(10, -76, 8, -64); g.lineTo(10, 4); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) { g.fillRect(8, -58 + i * 10, 16, 5); }
    g.restore();
    g.restore();
  }
  aguaDelante(g, t, L) {
    // la superficie del canal por delante del casco: espuma que se mueve
    g.save();
    const gw = g.createLinearGradient(0, WL, 0, H); gw.addColorStop(0, "rgba(240,160,30,.92)"); gw.addColorStop(1, "rgba(150,80,8,.98)");
    g.fillStyle = gw;
    g.beginPath(); g.moveTo(-20, H); for (let x = -20; x <= W + 20; x += 24) g.lineTo(x, WL + 4 * Math.sin(x * 0.03 + t * 3)); g.lineTo(W + 20, H); g.closePath(); g.fill();
    g.strokeStyle = "#fff4dc"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); for (let x = -20; x <= W + 20; x += 24) g.lineTo(x, WL + 4 * Math.sin(x * 0.03 + t * 3) - 1); g.stroke();
    g.strokeStyle = "rgba(255,244,220,.6)"; g.lineWidth = 3;
    for (let i = 0; i < 10; i++) { const y = WL + 26 + i * 9, off = (t * (40 + i * 6) + i * 97) % (W + 200) - 100; g.beginPath(); g.moveTo(off, y); g.quadraticCurveTo(off + 30, y - 5, off + 60, y); g.stroke(); }
    // reflejos de las farolas
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * L;
    for (const x of [60, 960]) for (let i = 0; i < 6; i++) g.drawImage(BLOB.amarillo, x - 20 + 8 * Math.sin(t * 4 + i), WL + 6 + i * 14, 40, 12);
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // estela del remo
    if (e.remando && Math.random() < 20 * dt) p.nueva(P.ESPUMA, e.S + 250 + azar(-30, 30), WL + 4, azar(-120, -40), azar(-120, -40), azar(0.4, 0.7), azar(3, 6));
    this.una("gota", t > 2.3, () => { const q = aPant(e.m, [e.pose.manoI[0] - 6, e.pose.manoI[1] - 30]); p.nueva(P.GOTA, q[0], q[1], 0, 20, 0.6, 3.5); });
    // notas que salen de la boca
    if (this.canta() && Math.random() < (t > 5.6 && t < 6.5 ? 9 : 3.5) * dt) {
      const q = aPant(e.m, boca(e.pose.rc));
      this.notas.push({ x: q[0] + 46, y: q[1] - 30, vx: azar(30, 110), vy: azar(-110, -60), t0: t, s: t > 5.6 ? azar(1.2, 1.8) : azar(0.8, 1.2), d: Math.random() < 0.35, col: ["#fffdf5", "#ffd34d", "#2fe3e8"][(Math.random() * 3) | 0] });
    }
    for (const n of this.notas) { n.x += n.vx * dt; n.y += n.vy * dt; }
    this.notas = this.notas.filter((n) => t - n.t0 < 2);
    if (t > 5.7 && t < 6.45) temblar(2 + 6 * tramo(t, 5.7, 6.45), 0.1);
    // ¡el chorro de cerveza!
    this.una("chorro", t > 6.45, () => {
      temblar(18, 0.5);
      const q = aPant(e.m, e.pose.manoI);
      for (let i = 0; i < 40; i++) p.nueva(P.GOTA, q[0] - 30 + azar(-30, 30), q[1] + azar(-20, 40), azar(-260, 160), azar(-600, -200), 1.2, azar(3, 6));
      for (let i = 0; i < 30; i++) p.nueva(P.ESPUMA, q[0] - 30 + azar(-20, 20), q[1] - 10, azar(-180, 120), azar(-420, -120), azar(0.6, 1), azar(5, 10));
    });
    if (t > 6.45 && t < 7.1 && Math.random() < 50 * dt) { const q = aPant(e.m, e.pose.manoI); p.nueva(P.ESPUMA, q[0] - 30 + azar(-20, 20), q[1] - 10, azar(-80, 80), azar(-250, -80), azar(0.4, 0.7), azar(4, 8)); }
    this.una("brindis", t > 7.15, () => { const q = aPant(e.m, [-30, 30]); p.nueva(P.DESTELLO, q[0] - 20, q[1], 0, 0, 0.35, 120); for (let i = 0; i < 14; i++) p.nueva(P.CHISPA, q[0] - 20, q[1], azar(-250, 250), azar(-300, 50), azar(0.3, 0.6), azar(6, 10)); });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  chorro(g, e, t) {
    const k = tramo(t, 6.4, 6.55) * (1 - tramo(t, 6.95, 7.3));
    if (k <= 0) return;
    const q = aPant(e.m, [e.pose.manoI[0] - 14, e.pose.manoI[1] + 22]);
    const x = q[0], top = q[1] + 10 + (1 - k) * (WL + 30 - q[1]);
    const base = WL + 40;
    g.save();
    const gr = g.createLinearGradient(x - 30, 0, x + 30, 0); gr.addColorStop(0, "rgba(200,110,10,.95)"); gr.addColorStop(0.5, "#ffd25a"); gr.addColorStop(1, "rgba(200,110,10,.95)");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(x - 50, base);
    for (let y = base; y >= top; y -= 14) g.lineTo(x - 20 - 6 * Math.sin(y * 0.08 + t * 30) - 22 * (y - top) / (base - top + 1), y);
    g.lineTo(x + 20, top);
    for (let y = top; y <= base; y += 14) g.lineTo(x + 20 + 6 * Math.sin(y * 0.08 + t * 30 + 1) + 22 * (y - top) / (base - top + 1), y);
    g.lineTo(x + 50, base); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,250,220,.7)"; g.lineWidth = 3;
    g.beginPath(); for (let y = base; y >= top; y -= 14) g.lineTo(x - 4 + 4 * Math.sin(y * 0.1 + t * 22), y); g.stroke();
    g.fillStyle = "#fffaf0";
    for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(x - 32 + i * 8, top + 5 * Math.sin(t * 25 + i) - 4 * Math.sin(i * 0.4), 10, 0, 6.283); g.fill(); }
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x - 40 + i * 16, base - 8 + 4 * Math.sin(t * 20 + i), 13, 0, 6.283); g.fill(); }
    g.restore();
  }
  letrero(g, cx, cy, s, t, a) {
    if (a <= 0) return;
    g.save(); g.translate(cx, cy); g.scale(s, s); g.globalAlpha = a;
    const letras = "GONDOLERO";
    g.font = `400 84px ${FB}`;
    const anchos = [...letras].map((l) => g.measureText(l).width + 4), total = anchos.reduce((a, b) => a + b, 0);
    let x = -total / 2;
    for (let i = 0; i < letras.length; i++) {
      const y = 10 * Math.sin(t * 6 - i * 0.7);
      txt(g, letras[i], x + anchos[i] / 2, y, { tam: 84, peso: 400, fam: FB, color: i % 2 ? "#ffe9a8" : "#fffdf5", borde: "#5a2a00", bordeAncho: 9 });
      x += anchos[i];
    }
    const x0 = -total / 2 + 20;
    const b = 6 * Math.sin(t * 6);
    g.save(); g.lineWidth = 0; nota(g, x0 - 82, -6 + b, 1.6, "#5a2a00"); nota(g, x0 - 84, -8 + b, 1.6, "#ffd34d");
    nota(g, -x0 + 52, -6 - b, 1.6, "#5a2a00", true); nota(g, -x0 + 50, -8 - b, 1.6, "#ffd34d", true); g.restore();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), L = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondoC, 0, 0);
    // farolas
    for (const x of [60, 960]) {
      g.fillStyle = "#1a1418"; g.fillRect(x - 4, 250, 8, 182); g.fillRect(x - 12, 426, 24, 6);
      g.fillStyle = "#2a2026"; g.beginPath(); g.moveTo(x - 16, 236); g.lineTo(x + 16, 236); g.lineTo(x + 10, 262); g.lineTo(x - 10, 262); g.closePath(); g.fill();
      const on = 1 - tramo(t, 9.2 + (x > 500 ? 0.25 : 0), 9.3 + (x > 500 ? 0.25 : 0));
      g.fillStyle = on > 0.5 ? "#ffe9a0" : "#4a4030"; g.fillRect(x - 9, 240, 18, 18);
      if (on > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 * on; g.drawImage(BLOB.amarillo, x - 70, 180, 140, 140); g.restore(); }
    }
    this.gondola(g, e.S, t);
    this.remo(g, e);
    this.chorro(g, e, t);
    pintarAvatar(g, e.m, e.pose, t);
    this.aguaDelante(g, t, L);
    this.p.dibujar(g);
    for (const n of this.notas) { const k = (t - n.t0) / 2; g.save(); g.globalAlpha = Math.min(1, k * 6) * (1 - k); nota(g, n.x + Math.sin((t - n.t0) * 6) * 8, n.y, n.s, n.col, n.d); g.restore(); }
    // ♪ GONDOLERO ♪: primero como letra de la canción, al final en grande
    if (t > 3.1 && t < 5.4) this.letrero(g, W / 2 + 60, 120, 0.62 * eBack(tramo(t, 3.1, 3.45)), t, 1 - tramo(t, 5.1, 5.4));
    if (t > 7.0) {
      const k = tramo(t, 7.0, 7.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(t * 8));
      this.letrero(g, W / 2 + 10, 118, s, t, Math.min(1, k * 4) * (1 - tramo(t, 9.0, 9.4)));
    }
    if (L < 1) { g.fillStyle = `rgba(0,0,0,${1 - L})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00066", nombre: "Gondolero", crear: () => new EscenaGondola() });
})();
