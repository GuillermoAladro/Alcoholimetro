"use strict";
/*
 * 00067 · CUMBRE
 *
 * Animación del banco. Empieza y acaba en negro.
 * La cámara baja desde una cima nevada de espuma hasta el pie de una montaña hecha de jarras. Guillermo, con
 * piolet y cuerda, la escala a saltos: engancha el piolet en el piso de arriba y se impulsa. En la cima saca una
 * bandera con una caña dibujada y la clava: ¡CUMBRE! La cámara se aleja y se ve la montaña entera, con la cuerda
 * marcando el camino.
 */
(() => {
const cache = cacheTexto();
const JW = 62, JH = 76, N = 13, SUELO = N * JH; // jarras de la montaña (en coordenadas del mundo)
const ESC = 1.0;
const MOVS = 7, T0 = 1.55, DM = 0.56;          // saltos de la escalada
const POSTE = [-52, 6];                          // pie de la bandera

function spriteJarra(nevada) {
  const s = 2.1, c = lienzoNuevo(86, 100), g = c.getContext("2d");
  g.translate(17, 58);
  g.scale(s, s);
  dibujarJarra(g, [0, 0], 0, 1, "asa", 0);
  dibujarJarra(g, [0, 0], 0, 1, "cuerpo", 0);
  if (nevada) {
    g.fillStyle = "#fffdf6";
    g.beginPath(); for (let i = 0; i <= 5; i++) g.arc(3 + i * 5.6, -18 - (i % 2) * 2.5, 4.6 + (i % 2) * 1.4, Math.PI, 0); g.fill();
    for (const [x, l] of [[6, 9], [15, 14], [26, 7]]) { g.beginPath(); g.moveTo(x - 2.4, -18); g.lineTo(x + 2.4, -18); g.lineTo(x + 2.4, -18 + l); g.arc(x, -18 + l, 2.4, 0, Math.PI); g.closePath(); g.fill(); }
  }
  return c;
}

/** Piolet en la mano: mango a lo largo del antebrazo y la cabeza al final. */
function piolet(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  g.fillStyle = "#1d2b3a"; rectR(g, -10, -2.6, 46, 5.2, 2.2); g.fill();
  g.fillStyle = "#f2c230"; g.fillRect(-4, -2.6, 8, 5.2);
  g.translate(36, 0);
  const gr = g.createLinearGradient(0, -20, 0, 20); gr.addColorStop(0, "#f4f7fa"); gr.addColorStop(0.5, "#9aa4ae"); gr.addColorStop(1, "#5f6872");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-3, -4); g.lineTo(3, -4); g.quadraticCurveTo(6, 10, 2, 24); g.lineTo(-1, 18); g.quadraticCurveTo(-1, 8, -3, 4); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-3, -3); g.lineTo(3, -3); g.lineTo(5, -16); g.lineTo(-5, -16); g.closePath(); g.fill();
  g.restore();
}

class EscenaCumbre extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(320);
    this.jarra = spriteJarra(false); this.nevada = spriteJarra(true);
    this.lejos = this.pintarLejos();
    // dónde pisa en cada salto: suelo → filas 11, 9, 7, 5, 3, 1 → cima
    this.pasos = [[452, SUELO]];
    for (const fila of [11, 9, 7, 5, 3, 1]) this.pasos.push([(fila / 2) * JW + 18, fila * JH]);
    this.pasos.push([4, 0]);
    this.camAnt = null;
    this.copos = [];
    const r = semilla(8);
    this.nubes = []; for (let i = 0; i < 7; i++) this.nubes.push({ x: -900 + r() * 1800, y: -200 + r() * 1000, s: 0.6 + r() * 0.9, v: 8 + r() * 14 });
  }
  pintarLejos() {
    const c = lienzoNuevo(W, 300), g = c.getContext("2d");
    for (const [y0, col, n, amp] of [[120, "#9cc3e8", 5, 80], [180, "#7aa6d6", 4, 70]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, 300);
      for (let i = 0; i <= n * 2; i++) g.lineTo((i * W) / (n * 2), y0 + (i % 2 ? -amp : 0) + 20 * Math.sin(i * 2.1));
      g.lineTo(W, 300); g.closePath(); g.fill();
    }
    return c;
  }
  /** Posición de los pies (mundo) y fase del salto. */
  cuerpo() {
    const t = this.t;
    if (t < T0) return { P: this.pasos[0], k: -1, u: 0 };
    const k = Math.min(MOVS - 1, Math.floor((t - T0) / DM)), u = clamp((t - T0 - k * DM) / DM, 0, 1);
    if (t >= T0 + MOVS * DM) return { P: this.pasos[MOVS], k: MOVS, u: 1 };
    const a = this.pasos[k], b = this.pasos[k + 1];
    const v = eInOut(tramo(u, 0.35, 0.85));
    return { P: [lerp(a[0], b[0], v), lerp(a[1], b[1], v) - 40 * Math.sin(v * Math.PI)], k, u, a, b, v };
  }
  aAv(P, w) { return [39 + (w[0] - P[0]) / ESC, 232 + (w[1] - P[1]) / ESC]; }
  estado() {
    const t = this.t, C = this.cuerpo(), P = C.P;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [74, 150], manoI = [6, 156], angP = 1.3, sx = 1, sy = 1;
    if (t < T0) { pose.rc = -0.14 * tramo(t, 0.9, 1.2); pose.cara = t > 1.05 ? "sorpresa" : "sonrisa"; if (t > 1.3) pose.cara = "risa"; }
    let usarAng = false;
    if (C.k >= 0 && C.k < MOVS) {
      const b = C.b;
      const gancho = [b[0] + 4, b[1] - 112];
      const manoW = [gancho[0] + 20, gancho[1] + 40];
      const kR = eOut(tramo(C.u, 0, 0.32));
      manoD = mezcla([74, 150], this.aAv(P, manoW), kR);
      if (C.u > 0.32) manoD = this.aAv(P, manoW);
      if (C.u > 0.62) manoD = mezcla(this.aAv(P, manoW), [80, 120], eInOut(tramo(C.u, 0.62, 0.9)));
      manoI = mezcla([6, 156], this.aAv(P, [b[0] - 50, b[1] - 10]), kR * (1 - tramo(C.u, 0.86, 1)));
      pose.cara = C.u < 0.35 ? "sonrisa" : C.u < 0.85 ? "guino" : "risa";
      if (C.v > 0 && C.v < 1) { pose.piernaI = [-16, 0.35]; pose.piernaD = [-10, -0.15]; }
      if (C.u > 0.85) { const k = 1 - tramo(C.u, 0.85, 1); sy = 1 - 0.06 * k; sx = 1 + 0.03 * k; }
      if (C.k === 3 && C.u > 0.86) { pose.cara = "sorpresa"; pose.rc = 0.2; } // mira abajo: ¡qué alto!
      if (C.k === 4 && C.u < 0.3) { pose.cara = "sorpresa"; pose.rc = 0.2 * (1 - C.u / 0.3); }
    }
    // en la cima
    let bandera = null;
    if (t >= T0 + MOVS * DM) {
      const tc = T0 + MOVS * DM; // ≈ 5.47
      pose.cara = "risa";
      const kAt = Math.max(0, 1 - (t - tc) * 6); sy = 1 - 0.06 * kAt;
      // saca la bandera de la espalda, la levanta y la clava
      const kSaca = eInOut(tramo(t, tc + 0.15, tc + 0.4));
      const kSube = eBack(tramo(t, tc + 0.4, tc + 0.65));
      const kClava = eIn(tramo(t, tc + 0.75, tc + 0.88));
      const arriba = this.aAv(P, [POSTE[0] + 8, -150]), clavada = this.aAv(P, [POSTE[0] + 8, -60]);
      manoI = mezcla(mezcla([6, 156], [24, 118], kSaca), arriba, kSube);
      manoI = mezcla(manoI, clavada, kClava);
      if (t > tc + 0.15) bandera = { mano: true };
      if (t > tc + 0.88) { bandera = { clavada: true }; manoI = mezcla(clavada, [-12, 138], eInOut(tramo(t, tc + 1.0, tc + 1.3))); }
      pose.brazoIDelante = t > tc + 0.3 && t < tc + 1.0;
      // piolet en alto
      const kP = eBack(tramo(t, tc + 0.95, tc + 1.25));
      manoD = mezcla([74, 150], [86, -12], kP);
      if (t > tc + 1.3) { manoD = [86, -12 + 4 * Math.sin(t * 5)]; pose.cara = Math.floor(t * 1.3) % 3 === 2 ? "guino" : "risa"; pose.rc = 0.05 * Math.sin(t * 2.5); }
      if (t > tc + 0.4 && t < tc + 0.9) pose.cara = "guino";
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD = (g, m, a2) => piolet(g, m, a2 + (usarAng ? 0 : 0));
    if (bandera && bandera.mano) pose.objI2 = (g, m) => { g.fillStyle = "#c9ced4"; g.fillRect(m[0] - 2, m[1] - 60, 4, 120); g.fillStyle = "#2bff5b"; g.fillRect(m[0] - 7, m[1] - 60, 14, 42); g.fillStyle = "#1a9d3a"; g.fillRect(m[0] - 7, m[1] - 48, 14, 3); g.fillRect(m[0] - 7, m[1] - 32, 14, 3); };
    const m = matAv(P[0], P[1], ESC, 0, sx, sy);
    return { pose, m, P, bandera };
  }
  camara() {
    const t = this.t, e = this.cuerpo();
    const cima = [-10, -70], base = [300, SUELO - 160];
    let c, z = 1;
    if (t < 1.5) c = mezcla(cima, base, eInOut(tramo(t, 0.15, 1.45)));
    else if (t < T0 + MOVS * DM - 0.4) c = [e.P[0] - 40, e.P[1] - 150];
    else c = mezcla([e.P[0] - 40, e.P[1] - 150], [-60, -70], eInOut(tramo(t, T0 + MOVS * DM - 0.4, T0 + MOVS * DM + 0.3)));
    // se aleja para ver la montaña entera
    const kZ = eInOut(tramo(t, 6.75, 7.85));
    if (kZ > 0) { z = lerp(1, 0.42, kZ); c = mezcla(c, [-400, 300], kZ); }
    // suavizado
    return { c, z };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado(), C = this.cuerpo();
    // golpe del piolet al enganchar y polvo de espuma al aterrizar
    if (C.k >= 0 && C.k < MOVS) {
      this.una("gancho" + C.k, C.u > 0.3, () => { const b = C.b; for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, b[0] + 4, b[1] - 112, azar(-200, 200), azar(-260, 20), azar(0.2, 0.4), azar(5, 9)); temblar(3, 0.1); });
      this.una("pisa" + C.k, C.u > 0.86, () => { const b = C.b; for (let i = 0; i < 6; i++) p.nueva(P.ESPUMA, b[0] + azar(-14, 14), b[1], azar(-90, 90), azar(-140, -40), azar(0.3, 0.6), azar(3, 6)); });
    }
    const tc = T0 + MOVS * DM;
    this.una("cima", t > tc, () => { temblar(8, 0.2); for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, azar(-30, 30), 0, azar(-160, 160), azar(-220, -60), azar(0.4, 0.8), azar(4, 8)); });
    this.una("clava", t > tc + 0.88, () => {
      temblar(22, 0.55);
      for (let i = 0; i < 30; i++) p.nueva(P.ESPUMA, POSTE[0], POSTE[1], azar(-260, 260), azar(-380, -80), azar(0.5, 1), azar(5, 10));
      for (let i = 0; i < 22; i++) { const a = azar(-Math.PI, 0), v = azar(200, 600); p.nueva(P.CHISPA, POSTE[0], -150, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
      p.nueva(P.DESTELLO, POSTE[0], -150, 0, 0, 0.4, 200);
    });
    if (t > tc + 1.0 && Math.random() < 12 * dt) p.nueva(P.PURPURINA, azar(-260, 200), azar(-320, -120), azar(-20, 20), azar(20, 60), azar(0.8, 1.4), azar(6, 12));
    // copos de espuma que lleva el viento
    if (Math.random() < 18 * dt) this.copos.push({ x: azar(-900, 900), y: azar(-500, 1100), vx: azar(-160, -80), vy: azar(10, 40), s: azar(2, 4) });
    for (const q of this.copos) { q.x += q.vx * dt; q.y += q.vy * dt; }
    this.copos = this.copos.filter((q) => q.x > -1400);
    for (const n of this.nubes) n.x -= n.v * dt;
    p.actualizar(dt);
  }
  montana(g, cam) {
    // con la cámara cerca solo se pintan las jarras que se ven
    const vx0 = cam.c[0] - W / 2 / cam.z - 80, vx1 = cam.c[0] + W / 2 / cam.z + 80, vy0 = cam.c[1] - H / 2 / cam.z - 100, vy1 = cam.c[1] + H / 2 / cam.z + 100;
    for (let i = N - 1; i >= 0; i--) {
      const y = i * JH;
      if (y > vy1 || y + JH < vy0) continue;
      const spr = i < 3 ? this.nevada : this.jarra;
      for (let j = 0; j <= i; j++) {
        const x = (j - i / 2) * JW;
        if (x + 50 < vx0 || x - 50 > vx1) continue;
        g.drawImage(spr, x - 52.7 + 17 - 17, y + JH - 96 + 4);
      }
    }
  }
  bandera(g, t, enMano) {
    const top = -168, x = POSTE[0];
    g.save();
    g.fillStyle = "#c9ced4"; g.fillRect(x - 3, top, 6, -top + 10);
    g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(x - 2, top, 1.5, -top + 6);
    // tela ondeando (el viento viene de la derecha)
    const k = eOut(tramo(t, T0 + MOVS * DM + 0.88, T0 + MOVS * DM + 1.3)), L = 128 * k, alto = 78;
    if (L > 2) {
      const onda = (u) => 8 * Math.sin(u * 7 - t * 9) * u;
      g.beginPath(); g.moveTo(x, top);
      for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(x - L * u, top + onda(u)); }
      for (let i = 12; i >= 0; i--) { const u = i / 12; g.lineTo(x - L * u, top + alto + onda(u)); }
      g.closePath();
      const gr = g.createLinearGradient(x - L, 0, x, 0); gr.addColorStop(0, "#1a9d3a"); gr.addColorStop(1, "#2bff5b");
      g.fillStyle = gr; g.fill();
      g.strokeStyle = "rgba(0,60,20,.5)"; g.lineWidth = 2; g.stroke();
      // la caña dibujada en la bandera
      if (k > 0.6) {
        const cx = x - L * 0.5, cy = top + alto / 2 + onda(0.5);
        g.save(); g.translate(cx, cy); g.globalAlpha = tramo(k, 0.6, 1);
        g.fillStyle = "rgba(255,255,255,.9)"; g.beginPath(); g.moveTo(-14, -20); g.lineTo(14, -20); g.lineTo(10, 24); g.lineTo(-10, 24); g.closePath(); g.fill();
        g.fillStyle = "#ffb51f"; g.beginPath(); g.moveTo(-12, -10); g.lineTo(12, -10); g.lineTo(9, 21); g.lineTo(-9, 21); g.closePath(); g.fill();
        g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(-8, -14, 7, 0, 6.283); g.arc(0, -17, 8, 0, 6.283); g.arc(8, -14, 7, 0, 6.283); g.fill();
        g.restore();
      }
    }
    // remate: una caña de verdad en lo alto del mástil
    g.translate(x, top - 2);
    g.fillStyle = "rgba(220,240,255,.35)"; g.beginPath(); g.moveTo(-9, -26); g.lineTo(9, -26); g.lineTo(7, 0); g.lineTo(-7, 0); g.closePath(); g.fill();
    g.fillStyle = "#ffb51f"; g.beginPath(); g.moveTo(-8, -18); g.lineTo(8, -18); g.lineTo(6.5, -1); g.lineTo(-6.5, -1); g.closePath(); g.fill();
    g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(-5, -22, 5, 0, 6.283); g.arc(1, -25, 6, 0, 6.283); g.arc(6, -22, 4.5, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-9, -26); g.lineTo(-7, 0); g.lineTo(7, 0); g.lineTo(9, -26); g.stroke();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), cam = this.camara();
    fondo(g, "#000");
    // cielo (se oscurece con la altura)
    const alt = clamp(1 - (cam.c[1] + 100) / (SUELO + 100), 0, 1);
    const gc = g.createLinearGradient(0, 0, 0, H);
    gc.addColorStop(0, alt > 0.5 ? "#2f6fb8" : "#4f95da"); gc.addColorStop(1, "#cfe8ff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 760, -120, 300, 300); g.restore();
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(900, 40, 34, 0, 6.283); g.fill();
    // montañas lejanas (paralaje)
    const py = 330 + (cam.c[1] - SUELO / 2) * -0.12 * cam.z + (1 - cam.z) * 60;
    g.drawImage(this.lejos, 0, py);
    g.fillStyle = "#7aa6d6"; g.fillRect(0, py + 299, W, H);
    // mundo
    g.save();
    g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.c[0], -cam.c[1]);
    for (const n of this.nubes) this.nube(g, n);
    // suelo al pie
    const gs = g.createLinearGradient(0, SUELO, 0, SUELO + 300); gs.addColorStop(0, "#5aa83a"); gs.addColorStop(1, "#2f6a20");
    g.fillStyle = gs; g.fillRect(-3000, SUELO - 4, 6000, 900);
    g.fillStyle = "#8a8f96"; for (const [x, r] of [[560, 26], [610, 16], [-560, 30], [-500, 18]]) { g.beginPath(); g.arc(x, SUELO + 4, r, Math.PI, 0); g.fill(); }
    this.montana(g, cam);
    // cuerda: de la cintura al pie de la montaña, pasando por los pasos
    const cin = aPant(e.m, [39, 140]);
    g.save(); g.strokeStyle = "#ff7a1a"; g.lineWidth = 3.5; g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); g.moveTo(520, SUELO - 2);
    const C = this.cuerpo(), hasta = C.k < 0 ? 0 : Math.min(MOVS, C.k + (C.u > 0.86 ? 1 : 0));
    for (let i = 0; i <= hasta; i++) { const q = this.pasos[i]; g.lineTo(q[0] + 20, q[1] - 6); }
    g.lineTo(cin[0], cin[1]); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 1; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]);
    g.restore();
    g.fillStyle = "#6b6f75"; g.fillRect(514, SUELO - 22, 12, 22);
    if (e.bandera && e.bandera.clavada) this.bandera(g, t);
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // copos
    g.fillStyle = "rgba(255,255,255,.85)";
    for (const q of this.copos) { g.beginPath(); g.arc(q.x, q.y, q.s / Math.max(0.5, cam.z), 0, 6.283); g.fill(); }
    g.restore();
    // ¡CUMBRE!
    const tc = T0 + MOVS * DM;
    if (t > tc + 0.9 && t < 9.2) {
      const k = tramo(t, tc + 0.9, tc + 1.05), s = lerp(3, 1, eIn(k)) * (1 + 0.02 * Math.sin(t * 6));
      const spr = this.rotulo();
      const x = 290, y = 118;
      g.save(); g.translate(x, y); g.rotate(-0.06); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * (1 - tramo(t, 8.9, 9.2));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const negro = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, 9.0, 9.55));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  nube(g, n) {
    g.save(); g.translate(n.x, n.y); g.scale(n.s, n.s);
    g.fillStyle = "rgba(255,255,255,.92)";
    g.beginPath(); g.arc(0, 0, 40, 0, 6.283); g.arc(46, -18, 52, 0, 6.283); g.arc(100, 0, 38, 0, 6.283); g.rect(0, 0, 100, 38); g.fill();
    g.fillStyle = "rgba(170,200,230,.5)"; g.fillRect(0, 26, 100, 12);
    g.restore();
  }
  rotulo() {
    if (cache.has("cumbre")) return cache.get("cumbre");
    const c = lienzoNuevo(560, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#dff6ff"); gr.addColorStop(1, "#8fd0ff");
    txt(g, "¡CUMBRE!", 280, 150, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#0b2a55", bordeAncho: 12, esp: 5, glow: "rgba(0,30,80,.5)", glowTam: 16, max: 530 });
    cache.set("cumbre", c);
    return c;
  }
}

registrar({ id: "00067", nombre: "Cumbre", crear: () => new EscenaCumbre() });
})();
