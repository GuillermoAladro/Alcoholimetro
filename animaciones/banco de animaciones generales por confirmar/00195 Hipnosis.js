"use strict";
/*
 * 00195 · HIPNOSIS
 *
 * Animación del banco. Empieza y acaba en negro.
 * En un escenario con telón morado, Marcos balancea una chapa colgada de un hilo delante de Guillermo: «¡MIRA LA
 * CHAPA!». Detrás gira una espiral gigante, a Guillermo se le ponen los ojos en espiral y empieza a hacer de gallina
 * (aletea, cabecea, ¡COC, COC!, vuelan plumas) mientras Marcos se parte. Picoteando, Guillermo le quita la chapa,
 * despierta… y le da la vuelta: ahora Marcos queda hipnotizado, hace de gallina y ¡pone un huevo dorado! Guillermo se
 * troncha. Fundido a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4;
const XG = 410, XM = 610, XM2 = 585, XM3 = 565, PODIO = 50;
const T_TXT1 = 0.5, T_HIPNO_G = 1.5, T_GALLINA_G = 2.55, T_PICA = 4.75, T_DESPIERTA = 5.15, T_TXT2 = 5.55;
const T_HIPNO_M = 6.45, T_GALLINA_M = 7.1, T_HUEVO = 8.35;
const HILO = 46;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(980, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#fff8d8"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8a1f");
  txt(g, "¡MIRA LA CHAPA!", 496, 152, { tam: 124, peso: 900, fam: FD, color: "#24083a", esp: 4 });
  txt(g, "¡MIRA LA CHAPA!", 490, 144, { tam: 124, peso: 900, fam: FD, color: gr, borde: "#24083a", bordeAncho: 11, esp: 4, glow: "rgba(200,120,255,.85)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }

function espiralSprite() {
  const S = 760, c = lienzoNuevo(S, S), g = c.getContext("2d");
  g.translate(S / 2, S / 2);
  g.fillStyle = "#3a1060"; g.beginPath(); g.arc(0, 0, S / 2, 0, 6.283); g.fill();
  g.lineCap = "round";
  for (const [off, col] of [[0, "#c86aff"], [Math.PI, "#1a0630"]]) {
    g.strokeStyle = col; g.lineWidth = 30;
    g.beginPath();
    for (let a = 0; a < 14 * Math.PI; a += 0.08) { const r = a * 8.4; const x = Math.cos(a + off) * r, y = Math.sin(a + off) * r; if (a) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke();
  }
  // borde suave
  const gr = g.createRadialGradient(0, 0, S * 0.3, 0, 0, S / 2);
  gr.addColorStop(0, "rgba(20,4,36,0)"); gr.addColorStop(1, "rgba(20,4,36,1)");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, S / 2 + 2, 0, 6.283); g.fill();
  return c;
}
/** Ojos en espiral (coordenadas de avatar). */
function ojosEspiral(g, ojos, r, ang, k) {
  if (k <= 0) return;
  g.save(); g.globalAlpha = k;
  for (const [x, y] of ojos) {
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    g.strokeStyle = "#5a1a8a"; g.lineWidth = 1.5;
    g.beginPath();
    for (let a = 0; a < 5.5 * Math.PI; a += 0.25) { const rr = (a / (5.5 * Math.PI)) * (r - 1); const xx = x + Math.cos(a + ang) * rr, yy = y + Math.sin(a + ang) * rr; if (a) g.lineTo(xx, yy); else g.moveTo(xx, yy); }
    g.stroke();
    g.strokeStyle = "#2a0a40"; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke();
  }
  g.restore();
}
/** Cresta roja y pico de gallina (coordenadas de avatar). */
function gallinaCara(g, R, k) {
  if (k <= 0) return;
  g.save(); g.globalAlpha = k;
  const cx = R.frente[0], top = R.frente[1] - 26;
  g.fillStyle = "#e8242a"; g.strokeStyle = "#8a0a10"; g.lineWidth = 1.2;
  for (const [dx, dy, r] of [[-9, 4, 7], [0, -2, 9], [9, 4, 7]]) { g.beginPath(); g.arc(cx + dx, top + dy, r * k, 0, 6.283); g.fill(); g.stroke(); }
  const b = R.bocaPos;
  g.fillStyle = "#ffb21f"; g.strokeStyle = "#a05a00";
  g.beginPath(); g.moveTo(b[0] - 9, b[1] - 3); g.lineTo(b[0], b[1] - 9); g.lineTo(b[0] + 9, b[1] - 3); g.lineTo(b[0], b[1] + 1); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#ff8a00";
  g.beginPath(); g.moveTo(b[0] - 7, b[1] + 1); g.lineTo(b[0] + 7, b[1] + 1); g.lineTo(b[0], b[1] + 7); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function podio(g) {
  const x = XM, y = PIES - PODIO;
  const gr = g.createLinearGradient(x - 80, 0, x + 80, 0);
  gr.addColorStop(0, "#5a0a5a"); gr.addColorStop(0.5, "#b02aa0"); gr.addColorStop(1, "#4a0a4a");
  g.fillStyle = gr; rectR(g, x - 78, y, 156, PODIO + 8, 6); g.fill();
  g.fillStyle = "#ffd34d"; g.fillRect(x - 80, y - 4, 160, 8);
  for (const dx of [-40, 0, 40]) { g.fillStyle = "#ffd34d"; estrella(g, x + dx, y + 26, 10, 4.5, 0); g.fill(); }
}
function chapa(g, x, y, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const r = 13;
  g.fillStyle = "#b07a10";
  g.beginPath();
  for (let i = 0; i < 42; i++) { const a = (i / 42) * 6.283, rr = i % 2 ? r : r + 2.6; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill();
  const gr = g.createRadialGradient(-4, -5, 1, 0, 0, r);
  gr.addColorStop(0, "#fff6c0"); gr.addColorStop(0.6, "#ffcf3a"); gr.addColorStop(1, "#c88a10");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r - 1, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(120,70,0,.6)"; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, r - 5, 0, 6.283); g.stroke();
  g.restore();
  // destello
  brillo(g, x - 4, y - 5, 10 + 4 * Math.sin(t * 9), 0.9);
}
function huevo(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.rotate(0.12 * Math.sin(t * 7)); g.scale(s, s);
  g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(0, 4, 26, 6, 0, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(-8, -34, 4, 0, -24, 34);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#c88a10");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, -58); g.bezierCurveTo(26, -58, 30, 0, 0, 2); g.bezierCurveTo(-30, 0, -26, -58, 0, -58); g.fill();
  g.strokeStyle = "#a06a00"; g.lineWidth = 1.5; g.stroke();
  g.restore();
}

class Hipnosis extends Escena {
  constructor() {
    super(10.4);
    this.p = new Parts(320);
    this.plumas = [];
    this.fondoC = null; this.espC = null;
  }
  pendulo(t) { return 0.62 * Math.sin(t * 4.2); }
  /** ¿quién tiene la chapa? */
  dueno() { return this.t < T_PICA + 0.12 ? "M" : "G"; }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152], brazoIDelante: true };
    let xg = XG, xm = XM, yg = PIES, ym = PIES - PODIO, syG = 1, syM = 1, gg = 0, gm = 0;
    // al quitarle la chapa, Marcos baja del podio de un saltito
    if (t > T_PICA + 0.2) { const u = tramo(t, T_PICA + 0.2, T_PICA + 0.6); xm = lerp(XM, XM2, u); ym = lerp(PIES - PODIO, PIES, u) - 40 * Math.sin(u * Math.PI); }
    let espG = 0, espM = 0;
    const th = this.pendulo(t);
    // Marcos con la chapa en alto
    const kA = eOut(tramo(t, 0.15, 0.45));
    if (this.dueno() === "M") {
      M.manoI = mezcla([6, 152], enAv(matAv(xm, ym, ESC), [522, 268]), kA);
      M.cara = t < T_HIPNO_G ? "guino" : "sonrisa"; M.rc = -0.1;
    }
    // Guillermo sigue la chapa con la cabeza y se le van los ojos
    if (t < T_GALLINA_G) {
      G.cara = t > T_HIPNO_G - 0.5 ? "sorpresa" : "sonrisa";
      G.rc = (t > 0.6 ? 0.14 * Math.sin(t * 4.2) : 0) + 0.05;
      espG = tramo(t, T_HIPNO_G, T_HIPNO_G + 0.4);
      if (t > 2.0) { const k = eInOut(tramo(t, 2.0, 2.3)); G.manoD = mezcla([70, 158], [104, 104], k); G.manoI = mezcla([9, 160], [-24, 104], k); }
    }
    // hace de gallina
    const gallina = (P_, q, t0, t1) => {
      const f = (t - t0) * 9;
      const a = andar(f * 0.9, 0.7);
      P_.piernaI = a.piernaI; P_.piernaD = a.piernaD;
      const fl = Math.abs(Math.sin(f * 1.3));
      P_.manoD = q ? [64 + 6 * fl, 128 - 12 * fl] : [72 + 8 * fl, 134 - 14 * fl];
      P_.manoI = q ? [10 - 6 * fl, 128 - 12 * fl] : [6 - 8 * fl, 134 - 14 * fl];
      P_.brazoIDelante = false;
      P_.rc = 0.16 * Math.sin(f * 0.5);
      P_.cara = "sorpresa";
      return { bote: a.bote * 0.5, giro: 0.05 * Math.sin(f * 0.5) };
    };
    if (t >= T_GALLINA_G && t < T_PICA) {
      const r = gallina(G, null, T_GALLINA_G, T_PICA); yg += r.bote; gg = r.giro; espG = 1;
      // Marcos se parte de risa (sin soltar la chapa)
      M.cara = "risa"; M.rc = -0.12 + 0.06 * Math.sin(t * 14); ym -= Math.abs(Math.sin(t * 14)) * 4; M.manoD = [52, 128 + 4 * Math.sin(t * 14)];
    }
    // picotea la chapa y se la queda
    if (t >= T_PICA && t < T_DESPIERTA) {
      const u = tramo(t, T_PICA, T_PICA + 0.2);
      espG = 1; G.cara = "sorpresa"; G.rc = 0.25; gg = 0.12 * Math.sin(u * Math.PI);
      const mano = enAv(matAv(xg, yg, ESC), [520, 300]);
      G.manoD = mezcla([90, 96], mano, eOut(u)); G.manoI = [-10, 96];
      M.cara = "sorpresa"; M.rc = -0.1;
      if (t > T_PICA + 0.12) M.manoI = mezcla(M.manoI, [6, 140], eOut(tramo(t, T_PICA + 0.12, T_PICA + 0.35)));
    }
    if (t >= T_DESPIERTA) {
      // Guillermo despierta (sacude la cabeza) y se ríe por dentro
      espG = 1 - tramo(t, T_DESPIERTA, T_DESPIERTA + 0.25);
      G.rc = t < T_DESPIERTA + 0.35 ? 0.2 * Math.sin((t - T_DESPIERTA) * 40) : 0.06;
      G.cara = t < T_DESPIERTA + 0.35 ? "sorpresa" : "guino";
      const kS = eOut(tramo(t, T_DESPIERTA + 0.3, T_TXT2));
      G.manoD = mezcla(enAv(matAv(xg, yg, ESC), [520, 300]), enAv(matAv(xg, yg, ESC), [492, 280]), kS);
      M.manoI = [-6, 110]; M.manoD = [80, 110];
      M.cara = t < T_TXT2 ? "sorpresa" : "sonrisa"; M.rc = -0.05;
    }
    // ahora Marcos sigue la chapa
    if (t >= T_TXT2 && t < T_GALLINA_M) {
      M.rc = -0.06 + 0.14 * Math.sin(t * 4.2);
      espM = tramo(t, T_HIPNO_M, T_HIPNO_M + 0.4);
      M.cara = t > T_HIPNO_M - 0.3 ? "sorpresa" : "sonrisa";
      M.manoI = [6, 152]; M.manoD = [67, 152];
    }
    if (t >= T_TXT2) { xm = lerp(XM2, XM3, eInOut(tramo(t, T_TXT2, T_TXT2 + 0.4))); ym = PIES; }
    if (t >= T_GALLINA_M) {
      espM = 1; syM = 0.95;
      const r = gallina(M, "marcos", T_GALLINA_M, 20); ym += r.bote; gm = r.giro; syM = 1;
      G.cara = "risa"; G.rc = 0.1 + 0.05 * Math.sin(t * 14); yg -= Math.abs(Math.sin(t * 14)) * 4;
      if (t > T_HUEVO - 0.3 && t < T_HUEVO + 0.2) { syM = 0.8; ym += 0; M.piernaI = [0, 0.18]; M.piernaD = [0, -0.18]; }
      if (t > T_HUEVO + 0.2) { M.rc = 0.28; M.cara = "sorpresa"; espM = 1 - tramo(t, T_HUEVO + 0.7, T_HUEVO + 1.0); M.manoD = [74, 120]; M.manoI = [0, 120]; M.piernaI = [0, 0]; M.piernaD = [0, 0]; ym = PIES; gm = 0; }
      if (t > T_HUEVO + 1.0) { M.cara = "risa"; M.rc = 0.2; }
      // Guillermo sigue con la chapa colgando
      G.manoD = enAv(matAv(xg, yg, ESC), [492, 280]);
      if (t > T_HUEVO + 0.2) { G.manoI = [-14, 110 + 6 * Math.sin(t * 14)]; G.cara = "risa"; }
    }
    const mG = matAv(xg, yg, ESC, gg, 1, syG), mM = matAv(xm, ym, ESC, gm, 1, syM);
    return { G, M, mG, mM, espG, espM, th };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // plumas mientras hacen de gallina
    const e = this.poses();
    const gallinaG = t > T_GALLINA_G && t < T_PICA, gallinaM = t > T_GALLINA_M && t < T_HUEVO + 0.2;
    for (const [on, m] of [[gallinaG, e.mG], [gallinaM, e.mM]]) {
      if (on && Math.random() < 9 * dt) { const q = aPant(m, [Math.random() < 0.5 ? azar(-16, -4) : azar(84, 96), azar(96, 126)]); this.plumas.push({ x: q[0], y: q[1], vx: azar(-90, 90), vy: azar(-160, -60), r: azar(0, 6), vr: azar(-4, 4), v: 2.4 }); }
    }
    for (const f of this.plumas) { f.vy = Math.min(f.vy + 220 * dt, 60); f.vx *= 1 - 1.5 * dt; f.x += (f.vx + Math.sin(t * 4 + f.r) * 30) * dt; f.y += f.vy * dt; f.r += f.vr * dt; f.v -= dt; }
    this.plumas = this.plumas.filter((f) => f.v > 0);
    this.una("hipnoG", t > T_HIPNO_G, () => { p.nueva(P.DESTELLO, 400, 300, 0, 0, 0.3, 200); });
    this.una("pica", t > T_PICA + 0.12, () => { temblar(8, 0.2); for (let i = 0; i < 14; i++) p.nueva(P.CHISPA, 520, 310, azar(-200, 200), azar(-260, -40), azar(0.3, 0.6), azar(5, 9)); });
    this.una("hipnoM", t > T_HIPNO_M, () => { p.nueva(P.DESTELLO, 600, 300, 0, 0, 0.3, 200); });
    this.una("huevo", t > T_HUEVO, () => {
      temblar(12, 0.3);
      p.nueva(P.DESTELLO, XM3, PIES - 30, 0, 0, 0.4, 240);
      for (let i = 0; i < 40; i++) { const a = azar(-Math.PI, 0), v = azar(120, 380); p.nueva(P.PURPURINA, XM3, PIES - 30, Math.cos(a) * v, Math.sin(a) * v, azar(0.8, 1.4), azar(10, 16)); }
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    g.fillStyle = "#14061f"; g.fillRect(-60, -60, W + 120, H + 120);
    // telón
    for (let i = -2; i < 22; i++) {
      const x = i * 52;
      const gr = g.createLinearGradient(x, 0, x + 52, 0);
      gr.addColorStop(0, "#3a0a4a"); gr.addColorStop(0.5, "#7a2a8a"); gr.addColorStop(1, "#3a0a4a");
      g.fillStyle = gr; g.fillRect(x, -60, 52, 540);
    }
    // bambalina con flecos
    g.fillStyle = "#9a2a3a"; g.beginPath(); g.moveTo(-60, -60); g.lineTo(W + 60, -60); g.lineTo(W + 60, 30);
    for (let x = W + 60; x >= -60; x -= 60) g.quadraticCurveTo(x - 30, 70, x - 60, 30);
    g.closePath(); g.fill();
    g.fillStyle = "#ffd34d"; for (let x = -40; x < W + 60; x += 20) g.fillRect(x, 34 + 10 * Math.abs(Math.sin(x * 0.0524)), 4, 14);
    // escenario
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#6a3a1a"); gs.addColorStop(1, "#2a1408");
    g.fillStyle = gs; g.fillRect(-60, 474, W + 120, H);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    for (let y = 496; y < H + 40; y += 24) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    g.fillStyle = "#ffd34d"; g.fillRect(-60, 470, W + 120, 5);
    this.fondoC = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // espiral gigante
    const kE = Math.max(tramo(t, T_HIPNO_G - 0.2, T_HIPNO_G + 0.4) * (1 - tramo(t, T_DESPIERTA, T_DESPIERTA + 0.3)), tramo(t, T_HIPNO_M - 0.2, T_HIPNO_M + 0.4) * (1 - tramo(t, T_HUEVO + 0.6, T_HUEVO + 1.0)));
    if (kE > 0) {
      if (!this.espC) this.espC = espiralSprite();
      g.save(); g.globalAlpha = 0.75 * kE; g.translate(512, 300); g.rotate(-t * 3.2); g.drawImage(this.espC, -380, -380); g.restore();
    }
    foco(g, 512, 512, PIES, 330, 0.8);
    podio(g);
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    const RG = avatar().rig, RM = avatar("marcos").rig;
    const gaG = Math.min(eBack(tramo(t, T_GALLINA_G - 0.1, T_GALLINA_G + 0.2)), 1 - tramo(t, T_DESPIERTA, T_DESPIERTA + 0.25));
    const gaM = Math.min(eBack(tramo(t, T_GALLINA_M - 0.1, T_GALLINA_M + 0.2)), 1 - tramo(t, T_HUEVO + 0.7, T_HUEVO + 1.0));
    conCabeza(g, e.mG, RG, e.G.rc, () => { ojosEspiral(g, RG.ojos, 8.5, -t * 9, e.espG); gallinaCara(g, RG, Math.max(0, gaG)); });
    conCabeza(g, e.mM, RM, e.M.rc, () => { ojosEspiral(g, RM.ojos, 8, -t * 9, e.espM); gallinaCara(g, RM, Math.max(0, gaM)); });
    // hilo y chapa
    const due = this.dueno();
    const mano = due === "M" ? (e.M._manoI ? aPant(e.mM, e.M._manoI) : null) : (e.G._manoD ? aPant(e.mG, e.G._manoD) : null);
    const quieta = (t > T_PICA - 0.05 && t < T_DESPIERTA + 0.4);
    if (mano && t > 0.2) {
      const th = quieta ? 0.1 * Math.sin(t * 20) : e.th;
      const cx = mano[0] + Math.sin(th) * HILO, cy = mano[1] + Math.cos(th) * HILO;
      g.strokeStyle = "#f4f0e6"; g.lineWidth = 2; g.beginPath(); g.moveTo(mano[0], mano[1]); g.lineTo(cx, cy); g.stroke();
      chapa(g, cx, cy, th, t);
    }
    // huevo dorado
    if (t > T_HUEVO) huevo(g, XM3 + 4, PIES + 2, eBack(tramo(t, T_HUEVO, T_HUEVO + 0.3)), t);
    // plumas
    for (const f of this.plumas) {
      g.save(); g.translate(f.x, f.y); g.rotate(f.r); g.scale(0.75, 0.75); g.globalAlpha = Math.min(1, f.v * 2);
      g.fillStyle = "#fffdf5"; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(8, -2, 0, 12); g.quadraticCurveTo(-6, 0, 0, -12); g.fill();
      g.strokeStyle = "#d8cfb8"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 14); g.stroke();
      g.restore();
    }
    this.p.dibujar(g);
    // ¡COC, COC!
    for (const [a, b, m] of [[T_GALLINA_G + 0.3, T_PICA - 0.2, e.mG], [T_GALLINA_M + 0.3, T_HUEVO - 0.3, e.mM]]) {
      if (t > a && t < b) {
        const q = aPant(m, [39, 0]);
        bocadillo(g, q[0] + (m === e.mG ? -60 : 70), q[1] - 46, "¡COC, COC!", q[0], q[1] - 6, tramo(t, a, a + 0.2) * (1 - tramo(t, b - 0.15, b)), 36);
      }
    }
    // ¡PLOP!
    if (t > T_HUEVO && t < T_HUEVO + 0.9) {
      const k = tramo(t, T_HUEVO, T_HUEVO + 0.12), a = 1 - tramo(t, T_HUEVO + 0.6, T_HUEVO + 0.9);
      txt(g, "¡PLOP!", 760, 480, { tam: 70 * eBack(k), peso: 400, fam: FC, color: "#ffe9a0", borde: "#3a1a00", bordeAncho: 9, alfa: a, esp: 2 });
    }
    // ¡MIRA LA CHAPA! (lo dice Marcos y, luego, Guillermo)
    for (const [a, b] of [[T_TXT1, T_GALLINA_G], [T_TXT2, T_GALLINA_M + 0.4]]) {
      if (t > a && t < b) {
        const d = t - a, k = tramo(d, 0, 0.2), sal = tramo(t, b - 0.3, b);
        const s = lerp(2.3, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6)) * (1 - 0.3 * sal);
        const spr = rotulo();
        g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512, 108 + 5 * Math.sin(d * 2)); g.rotate(-0.03); g.scale(s, s);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, 9.85, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00195", nombre: "Hipnosis", crear: () => new Hipnosis() });
})();
