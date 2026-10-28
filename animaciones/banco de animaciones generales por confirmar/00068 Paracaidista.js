"use strict";
/*
 * 00068 · PARACAIDISTA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Baja del cielo colgado de un paracaídas que es un posavasos gigante, con una jarra en la mano. Mientras cae se
 * da un trago (la espuma sube en vez de bajar). Mira abajo: se acerca una terraza con una diana pintada en el
 * suelo. Aterriza justo en el centro: ¡ATERRIZAJE! El posavasos baja planeando y cae sobre una mesa como un
 * posavasos de verdad; él deja la jarra encima y guiña un ojo.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.15, HOMBROS = [39, 86];
const MESA = [828, 478];
const TOCA = 5.6; // aterrizaje
const CUELGA = 205; // del centro del posavasos a los hombros

function hacerPosavasos() {
  const R = 200, c = lienzoNuevo(R * 2, R * 2), g = c.getContext("2d");
  g.translate(R, R);
  // borde dentado
  g.beginPath();
  for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2, r = R - 2 - (i % 2) * 5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.fillStyle = "#f6ecd6"; g.fill();
  g.strokeStyle = "#c9b48a"; g.lineWidth = 3; g.stroke();
  // anillos
  g.fillStyle = "#c8202c"; g.beginPath(); g.arc(0, 0, R - 16, 0, 6.283); g.fill();
  g.fillStyle = "#f6ecd6"; g.beginPath(); g.arc(0, 0, R - 34, 0, 6.283); g.fill();
  g.fillStyle = "#1c3a7a"; g.beginPath(); g.arc(0, 0, R - 44, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(-30, -40, 10, 0, 0, R - 50); gr.addColorStop(0, "#ffe27a"); gr.addColorStop(1, "#f2a516");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R - 56, 0, 6.283); g.fill();
  // estrellas en el anillo azul
  g.fillStyle = "#ffd34d";
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; estrella(g, Math.cos(a) * (R - 39), Math.sin(a) * (R - 39), 6, 2.6, a); g.fill(); }
  // jarra en el centro
  g.save(); g.translate(-48, 6); g.scale(3.4, 3.4);
  dibujarJarra(g, [0, 0], 0, 1, "asa", 0); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", 0);
  g.restore();
  txt(g, "SALUD", 0, -78, { tam: 50, peso: 900, fam: FD, color: "#c8202c", esp: 6, borde: "#fff6dc", bordeAncho: 6 });
  txt(g, "★ CAÑAS ★", 0, 120, { tam: 30, peso: 900, fam: FD, color: "#1c3a7a", esp: 3 });
  return c;
}

class EscenaParacaidas extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(320);
    this.p.suelo = () => PIES - 2;
    this.terraza = this.pintarTerraza();
    const r = semilla(6);
    this.nubes = []; for (let i = 0; i < 9; i++) this.nubes.push({ x: r() * W, y: r() * 900, s: 0.6 + r() * 1.0, par: 0.6 + r() * 0.6 });
    this.recorrido = 0; this.rayas = [];
    this.vel = 0;
  }
  pintarTerraza() {
    const c = lienzoNuevo(W, 420), g = c.getContext("2d");
    const Y = 420 - (H - PIES) - 120; // la terraza en el lienzo (el suelo empieza en y = 300)
    // ciudad abajo, detrás de la barandilla
    const r = semilla(12);
    for (let x = -10; x < W; x += 50 + r() * 40) {
      const h = 60 + r() * 120, w = 40 + r() * 30;
      g.fillStyle = "#3a2a4a"; g.fillRect(x, 300 - h, w, h + 10);
      g.fillStyle = "rgba(255,210,120,.8)";
      for (let wy = 300 - h + 10; wy < 290; wy += 16) for (let wx = x + 6; wx < x + w - 6; wx += 12) if (r() < 0.45) g.fillRect(wx, wy, 5, 7);
    }
    // barandilla de cristal
    g.fillStyle = "rgba(170,220,255,.25)"; g.fillRect(0, 220, W, 80);
    g.fillStyle = "#c9ced4"; g.fillRect(0, 214, W, 8);
    g.fillStyle = "#9aa2ab"; for (let x = 20; x < W; x += 120) g.fillRect(x, 220, 6, 80);
    // macetas
    for (const x of [70, 960]) {
      g.fillStyle = "#b8572a"; g.beginPath(); g.moveTo(x - 30, 250); g.lineTo(x + 30, 250); g.lineTo(x + 22, 300); g.lineTo(x - 22, 300); g.closePath(); g.fill();
      g.fillStyle = "#2f8a3e"; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(x + (i - 3) * 9, 236 - Math.abs(i - 3) * -4, 9, 26, (i - 3) * 0.25, 0, 6.283); g.fill(); }
    }
    // suelo de baldosas
    const gs = g.createLinearGradient(0, 300, 0, 420); gs.addColorStop(0, "#c9733e"); gs.addColorStop(1, "#8a4422");
    g.fillStyle = gs; g.fillRect(0, 300, W, 120);
    g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 2;
    for (let y = 300; y < 420; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(W / 2 + i * 50, 300); g.lineTo(W / 2 + i * 90, 420); g.stroke(); }
    // diana de aterrizaje pintada
    g.save(); g.translate(W / 2, 398); g.scale(1, 0.2);
    for (const [r2, col] of [[150, "#fffdf5"], [124, "#e8293b"], [94, "#fffdf5"], [64, "#e8293b"], [34, "#fffdf5"]]) { g.fillStyle = col; g.beginPath(); g.arc(0, 0, r2, 0, 6.283); g.fill(); }
    g.restore();
    void Y;
    return c;
  }
  terrazaY() { return lerp(720, 0, eOut(tramo(this.t, 3.9, TOCA))); } // desplazamiento de la terraza
  copa() { // centro del posavasos-paracaídas
    const t = this.t;
    let x = W / 2 + 70 * Math.sin(t * 1.2) * (1 - tramo(t, 4.6, TOCA));
    let y;
    if (t < 1.6) y = lerp(-460, 120, eOut(tramo(t, 0.05, 1.6)));
    else if (t < 4.4) y = 120 + 10 * Math.sin(t * 2);
    else y = lerp(120 + 10 * Math.sin(4.4 * 2), PIES - CUELGA - 146 * ESC, eIn(tramo(t, 4.4, TOCA)));
    let rot = 0.07 * Math.sin(t * 1.4) * (1 - tramo(t, 4.8, TOCA)), ry = 74, rx = 200, sale = 0;
    if (t >= TOCA) {
      // planea hasta la mesa y se posa como un posavasos
      const u = tramo(t, TOCA, TOCA + 1.15), k = eInOut(u);
      const y0 = PIES - CUELGA - 146 * ESC;
      x = lerp(W / 2, MESA[0], k); y = lerp(y0, MESA[1] - 14, k) - 10 * Math.sin(u * Math.PI);
      rot = 0.25 * Math.sin(u * Math.PI * 2) * (1 - u);
      ry = lerp(74, 26, eIn(u)); rx = lerp(200, 180, u);
      sale = u;
    }
    return { x, y, rot, rx, ry, sale };
  }
  estado() {
    const t = this.t, C = this.copa();
    const pose = { cara: "risa", rc: 0, piernaI: [0, 0.08 * Math.sin(t * 2.3)], piernaD: [0, -0.06 * Math.sin(t * 2.3 + 1)] };
    let manoI = [8, 34], manoD = [80, 140], inc = 0.12, nivel = 1, giro = 0.06 * Math.sin(t * 1.4 - 0.5) * (1 - tramo(t, 4.8, TOCA));
    // trago en caída libre
    const kSube = eInOut(tramo(t, 1.85, 2.15)) * (1 - eInOut(tramo(t, 3.0, 3.25)));
    const kTrago = eInOut(tramo(t, 2.15, 2.95)) * (1 - eInOut(tramo(t, 3.0, 3.25)));
    pose.rc = -0.3 * kTrago;
    if (kSube > 0) {
      const incB = -0.4 * kSube - 1.15 * kTrago, b = boca(pose.rc), r = rot2(JARRA.borde, incB);
      manoD = mezcla(manoD, [b[0] - r[0], b[1] - r[1]], kSube); inc = incB;
    }
    nivel = 1 - 0.55 * tramo(t, 2.2, 2.95);
    if (t > 2.95 && t < 3.4) pose.cara = "dormido";
    if (t > 3.9 && t < TOCA) { pose.cara = "sorpresa"; pose.rc = 0.18 * tramo(t, 3.9, 4.1); pose.piernaI = [-6, 0.15]; pose.piernaD = [-6, -0.15]; }
    let m;
    if (t < TOCA) m = matAv(C.x, C.y + CUELGA, ESC, giro, 1, 1, HOMBROS);
    else {
      // en la terraza
      const kAt = Math.max(0, 1 - (t - TOCA) * 5);
      let x = W / 2, sx = 1 + 0.1 * kAt, sy = 1 - 0.2 * kAt;
      pose.cara = t < TOCA + 0.35 ? "sorpresa" : "risa";
      manoI = mezcla([-30, 70], [6, 156], eInOut(tramo(t, TOCA + 0.1, TOCA + 0.5)));
      if (t < TOCA + 0.5) manoD = mezcla([104, 92], [80, 140], eInOut(tramo(t, TOCA + 0.1, TOCA + 0.5)));
      // un par de pasos hasta la mesa
      const kA = tramo(t, 6.75, 7.45);
      if (kA > 0) { x = lerp(W / 2, 600, eInOut(kA)); if (kA < 1) { const a = andar(kA * 12, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; } else { pose.piernaI = [0, 0]; pose.piernaD = [0, 0]; } }
      else { pose.piernaI = [0, 0]; pose.piernaD = [0, 0]; }
      // deja la jarra en el posavasos
      const enMesa = [39 + (690 - x) / ESC, 232 - (PIES - 462) / ESC];
      const kD = eInOut(tramo(t, 7.45, 7.8)), kV = eInOut(tramo(t, 8.0, 8.3));
      if (kD > 0) { manoD = mezcla([80, 140], enMesa, kD * (1 - kV)); pose.rc = 0.06 * kD; }
      if (t > 7.85) { pose.cara = t < 8.15 ? "risa" : "guino"; manoI = mezcla([6, 156], [-14, 104], eBack(tramo(t, 8.2, 8.45))); }
      if (kV > 0) manoD = mezcla(enMesa, [74, 150], kV);
      m = matAv(x, PIES, ESC, 0, sx, sy);
      this.xPie = x;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (t < 7.85) pose.jarra = { inc, nivel };
    return { pose, m, C };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // velocidad de caída (las nubes suben)
    this.vel = t < TOCA ? (t < 1.6 ? 380 : 520) : 0;
    this.recorrido += this.vel * dt;
    if (t < 4.5 && Math.random() < 14 * dt) this.rayas.push({ x: azar(0, W), y: H + 40, l: azar(60, 160) });
    for (const r of this.rayas) r.y -= 1300 * dt;
    this.rayas = this.rayas.filter((r) => r.y + r.l > -20);
    // la espuma sube mientras bebe cayendo
    if (t > 2.15 && t < 3.0 && Math.random() < 40 * dt) {
      const q = aPant(e.m, boca(e.pose.rc));
      p.nueva(P.ESPUMA, q[0] + azar(-14, 14), q[1] - 6, azar(-60, 60), azar(-420, -220), azar(0.5, 0.8), azar(4, 8));
      if (Math.random() < 0.4) p.nueva(P.GOTA, q[0] + azar(-10, 10), q[1], azar(-40, 40), azar(-900, -600), 0.8, azar(2.5, 4));
    }
    this.una("toca", t > TOCA, () => {
      temblar(26, 0.6);
      for (let i = 0; i < 34; i++) p.nueva(P.POLVO, W / 2 + azar(-40, 40), PIES - 4, azar(-650, 650), azar(-90, -5), azar(0.6, 1.2), azar(26, 50));
      for (let i = 0; i < 20; i++) { const a = azar(-Math.PI, 0), v = azar(250, 600); p.nueva(P.CHISPA, W / 2, PIES - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(8, 13)); }
    });
    this.una("posa", t > TOCA + 1.15, () => { temblar(8, 0.25); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, MESA[0] + azar(-170, 170), MESA[1] - 10, azar(-200, 200), azar(-60, -10), azar(0.5, 0.9), azar(20, 34)); });
    this.una("clin", t > 7.8, () => { p.nueva(P.DESTELLO, 690, 440, 0, 0, 0.35, 90); for (let i = 0; i < 10; i++) p.nueva(P.CHISPA, 690, 440, azar(-200, 200), azar(-260, -40), azar(0.3, 0.6), azar(6, 10)); });
    this.una("guino", t > 8.15, () => { const q = aPant(e.m, RIG.ojos[0]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 50); });
    p.actualizar(dt);
  }
  posavasos(g, C) {
    const img = this.disco();
    g.save(); g.translate(C.x, C.y); g.rotate(C.rot);
    // canto de cartón
    g.fillStyle = "#b39a6a"; g.beginPath(); g.ellipse(0, 9, C.rx, C.ry, 0, 0, 6.283); g.fill();
    g.save(); g.scale(C.rx / 200, C.ry / 200); g.drawImage(img, -200, -200); g.restore();
    // sombreado de cúpula
    const gr = g.createLinearGradient(0, -C.ry, 0, C.ry); gr.addColorStop(0, "rgba(255,255,255,.18)"); gr.addColorStop(1, "rgba(0,0,0,.18)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, C.rx, C.ry, 0, 0, 6.283); g.fill();
    g.restore();
  }
  disco() { if (!cache.has("disco")) cache.set("disco", hacerPosavasos()); return cache.get("disco"); }
  cuerdas(g, e, t) {
    const C = e.C;
    if (t > 6.85) return;
    const a = Math.max(0, 1 - tramo(t, 6.6, 6.85));
    const hI = aPant(e.m, [16, 84]), hD = aPant(e.m, [62, 84]);
    g.save(); g.globalAlpha = a; g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 1.6;
    const flojo = t > TOCA ? tramo(t, TOCA, TOCA + 0.3) : 0;
    for (let i = 0; i < 8; i++) {
      const ang = Math.PI * (0.06 + 0.88 * (i / 7)), px = Math.cos(ang) * C.rx, py = Math.sin(ang) * C.ry * 0.9 + 6;
      const q = rot2([px, py], C.rot), P0 = [C.x + q[0], C.y + q[1]];
      const H0 = i < 4 ? hD : hI;
      const mx = (P0[0] + H0[0]) / 2, my = (P0[1] + H0[1]) / 2 + 80 * flojo;
      g.beginPath(); g.moveTo(P0[0], P0[1]); g.quadraticCurveTo(mx, my, H0[0], H0[1]); g.stroke();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // cielo de tarde
    const gc = g.createLinearGradient(0, 0, 0, H);
    gc.addColorStop(0, "#3b6fd0"); gc.addColorStop(0.6, "#9cc8f2"); gc.addColorStop(1, "#ffd0a0");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    // nubes que suben
    for (const n of this.nubes) {
      const y = ((n.y - this.recorrido * n.par) % 1000 + 1000) % 1000 - 200;
      g.save(); g.translate(n.x, y); g.scale(n.s, n.s); g.fillStyle = "rgba(255,255,255,.85)";
      g.beginPath(); g.arc(0, 0, 40, 0, 6.283); g.arc(46, -18, 52, 0, 6.283); g.arc(100, 0, 38, 0, 6.283); g.rect(0, 0, 100, 38); g.fill(); g.restore();
    }
    // rayas de velocidad
    g.save(); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2;
    for (const r of this.rayas) { g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x, r.y + r.l); g.stroke(); }
    g.restore();
    // terraza que sube desde abajo
    const ty = this.terrazaY();
    if (ty < 700) {
      g.drawImage(this.terraza, 0, PIES - 400 + ty);
      g.fillStyle = "#8a4422"; g.fillRect(-60, PIES + 18 + ty, W + 120, 200);
      // mesa redonda y sillas
      g.save(); g.translate(0, ty);
      for (const dx of [-120, 120]) { g.fillStyle = "#5a5f66"; g.fillRect(MESA[0] + dx - 22, MESA[1] + 30, 44, 8); g.fillRect(MESA[0] + dx - 20, MESA[1] - 20, 6, 50); g.fillRect(MESA[0] + dx + 14, MESA[1] + 38, 6, 60); g.fillRect(MESA[0] + dx - 20, MESA[1] + 38, 6, 60); }
      g.fillStyle = "#3a3f46"; g.fillRect(MESA[0] - 6, MESA[1], 12, PIES - MESA[1]); g.beginPath(); g.ellipse(MESA[0], PIES - 2, 40, 7, 0, 0, 6.283); g.fill();
      g.fillStyle = "#e9edf2"; g.beginPath(); g.ellipse(MESA[0], MESA[1], 90, 18, 0, 0, 6.283); g.fill();
      g.fillStyle = "#b9c0c8"; g.fillRect(MESA[0] - 90, MESA[1], 180, 6);
      g.restore();
    }
    // paracaídas, cuerdas y él
    const C = e.C;
    const posado = t > TOCA + 1.15;
    if (!posado) { this.cuerdas(g, e, t); this.posavasos(g, C); }
    else this.posavasos(g, C);
    // la jarra que deja en el posavasos
    if (t >= 7.85) { g.save(); g.translate(676, 442); g.scale(ESC, ESC); dibujarJarra(g, [0, 0], 0, 0.45, "asa", t); dibujarJarra(g, [0, 0], 0, 0.45, "cuerpo", t); g.restore(); }
    pintarAvatar(g, e.m, e.pose, t);
    if (t > TOCA && t < 6.85) this.cuerdas(g, e, t);
    this.p.dibujar(g);
    // ¡ATERRIZAJE!
    if (t > TOCA && t < 8.8) {
      const k = tramo(t, TOCA, TOCA + 0.15), s = lerp(3, 1, eIn(k)) * (1 + 0.02 * Math.sin(t * 7));
      const spr = this.rotulo();
      g.save(); g.translate(W / 2, 84); g.rotate(-0.04); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * (1 - tramo(t, 8.5, 8.8));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const negro = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, 8.85, 9.35));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  rotulo() {
    if (cache.has("aterriza")) return cache.get("aterriza");
    const c = lienzoNuevo(900, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#ff9a1a");
    txt(g, "¡ATERRIZAJE!", 450, 140, { tam: 130, peso: 400, fam: FC, color: gr, borde: "#7a1a00", bordeAncho: 13, esp: 4, glow: "rgba(0,0,0,.45)", glowTam: 14, max: 860 });
    cache.set("aterriza", c);
    return c;
  }
}

registrar({ id: "00068", nombre: "Paracaidista", crear: () => new EscenaParacaidas() });
})();
