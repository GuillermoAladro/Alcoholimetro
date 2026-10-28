"use strict";
/*
 * 00024 · PUÑETAZO RÉCORD
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden las bombillas de una máquina de boxeo de feria y baja el saco. Con un guante rojo calienta, coge
 * impulso y le pega un puñetazo (¡POW!): el saco sube de golpe y el marcador sube 100… 500… 999. La pantalla revienta
 * en chispas (¡999!), las bombillas estallan y la máquina echa humo; él sopla el guante como un pistolero. El humo
 * lo tapa todo.
 */
(() => {
const CACHE = cacheTexto();
function cartel(clave, s, o) {
  let c = CACHE.get(clave);
  if (c) return c;
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 400} ${o.tam}px ${o.fam}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  const pad = (o.glowTam || 0) + (o.bordeAncho || 0) + 14;
  c = lienzoNuevo(m.measureText(s).width + pad * 2, o.tam * 1.3 + pad * 2);
  const g = c.getContext("2d");
  const col = typeof o.color === "function" ? o.color(g, c) : o.color;
  txt(g, s, c.width / 2, c.height / 2 + o.tam * 0.36, Object.assign({}, o, { color: col }));
  CACHE.set(clave, c);
  return c;
}
function ponCartel(g, c, x, y, s, a = 1, rot = 0) {
  if (a <= 0 || s <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}
const digito = (d) => cartel("dig" + d, d, { tam: 66, peso: 900, fam: FD, color: "#ff5a3a", glow: "rgba(255,40,20,.95)", glowTam: 14 });

const MQ = { x0: 640, x1: 860, top: 160 };        // cuerpo de la máquina
const PIV = [600, 236], LARGO = 104;               // pivote del saco y distancia al centro del saco
const BOMBILLAS = (() => {
  const b = [];
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; b.push([750 + Math.cos(a) * 118, 120 + Math.sin(a) * 64]); }
  for (let i = 1; i < 6; i++) { b.push([MQ.x1 + 2, 120 + i * 50]); }
  for (let i = 5; i >= 1; i--) { b.push([MQ.x0 - 2, 120 + i * 50]); }
  return b;
})();

/** Guante de boxeo en la mano, a lo largo del antebrazo (unidades de avatar). */
function guante(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang - Math.PI / 2); g.scale(1.3, 1.3);
  g.fillStyle = "#f4f0e6"; rectR(g, -8, -10, 16, 8, 2); g.fill();
  const gr = g.createRadialGradient(-3, 4, 1, 0, 6, 13);
  gr.addColorStop(0, "#ff6a5a"); gr.addColorStop(0.6, "#d4121e"); gr.addColorStop(1, "#7a0008");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 6, 10.5, 12, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(-8, 2, 4.5, 6.5, -0.4, 0, 6.283); g.fill();
  g.strokeStyle = "#4a0006"; g.lineWidth = 1.1; g.beginPath(); g.ellipse(0, 6, 10.5, 12, 0, 0, 6.283); g.stroke();
  g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.ellipse(-3, 2, 3, 5, -0.3, 0, 6.283); g.fill();
  g.restore();
}

class EscenaPunetazo extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(480);
    this.ESC = 1.5; this.X = 430;
    this.tGolpe = 2.68; this.tRevienta = 4.15;
    this.rotas = new Set();
    this.saco = { a: -1.45, v: 0 }; // empieza recogido
  }
  luz() { return tramo(this.t, 0.55, 0.85) * (1 - tramo(this.t, 8.6, 9.3)); }
  puntos() {
    const t = this.t;
    if (t < 2.8) return -1;
    if (t < 3.0) return Math.round(100 * tramo(t, 2.8, 3.0));
    if (t < 3.25) return 100;
    if (t < 3.5) return Math.round(lerp(100, 500, tramo(t, 3.25, 3.5)));
    if (t < 3.75) return 500;
    return Math.round(lerp(500, 999, eOut(tramo(t, 3.75, 4.05))));
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], giro = 0, sy = 1, dx = 0;
    // calienta: guante contra la palma
    if (t > 0.9 && t < 1.95) {
      const k = eInOut(tramo(t, 0.9, 1.15)) * (1 - eInOut(tramo(t, 1.75, 1.95)));
      const golpe = Math.max(0, Math.sin((t - 1.15) * 13)) * (t > 1.15 && t < 1.75 ? 1 : 0);
      manoI = mezcla(manoI, [24, 110], k); manoD = mezcla(manoD, [62 - 16 * golpe, 106], k);
      pose.brazoIDelante = k > 0.3;
      pose.cara = t > 1.1 ? "guino" : "sonrisa";
    }
    // guardia y carga
    const kG = eInOut(tramo(t, 1.95, 2.2));
    if (t >= 1.95 && t < this.tGolpe) {
      manoD = mezcla(manoD, [58, 66], kG); manoI = mezcla(manoI, [4, 92], kG);
      pose.brazoIDelante = kG > 0.5;
      const tiem = tramo(t, 2.2, 2.55);
      dx = azar(-1, 1) * 2 * tiem; giro = -0.06 * kG; sy = 1 - 0.03 * kG;
      pose.cara = "guino"; pose.rc = -0.06 * kG;
      // el puñetazo
      const kP = eIn(tramo(t, 2.55, this.tGolpe));
      if (kP > 0) { manoD = mezcla(manoD, [128, 74], kP); giro = lerp(-0.06, 0.07, kP); pose.cara = "sorpresa"; }
    }
    if (t >= this.tGolpe) {
      const kV = eInOut(tramo(t, 3.0, 3.35));
      manoD = mezcla([128, 74], [70, 158], kV); manoI = mezcla([4, 92], [9, 160], kV);
      pose.brazoIDelante = kV < 0.5;
      giro = 0.07 * (1 - kV);
      pose.cara = t < 3.2 ? "guino" : "sorpresa";
      pose.rc = 0.12 * tramo(t, 3.0, 3.3);
    }
    if (t >= this.tRevienta) {
      // se tapa un poco, luego se ríe
      const k = eOut(tramo(t, this.tRevienta, this.tRevienta + 0.15)) * (1 - eInOut(tramo(t, 4.7, 5.0)));
      manoI = mezcla(manoI, [-10, 40], k);
      pose.cara = t < 4.75 ? "sorpresa" : "risa"; pose.rc = t < 4.75 ? -0.1 : 0.04 * Math.sin(t * 20);
    }
    // sopla el guante como un pistolero
    if (t > 5.6) {
      const k = eInOut(tramo(t, 5.6, 5.95)) * (1 - eInOut(tramo(t, 7.5, 7.8)));
      manoD = mezcla(manoD, [88, 66], k);
      pose.cara = k > 0.6 ? (t < 6.9 ? "sorpresa" : "guino") : pose.cara;
      pose.rc = 0.16 * k;
    }
    if (t > 7.7) { pose.cara = "sorpresa"; pose.rc = 0.15 * tramo(t, 7.7, 7.9); }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD2 = (g, m, a) => guante(g, m, a);
    const m = matAv(this.X + dx, PIES, ESC, giro, 1, sy);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // el saco: baja al principio, sale disparado con el golpe y se balancea
    const S = this.saco;
    if (t > 1.2 && !S.bajado) { S.bajado = true; S.v = 4; }
    if (S.bajado) {
      S.v += (-S.a * 60 - S.v * 3.2) * dt; S.a += S.v * dt;
      if (S.a < -1.55) { S.a = -1.55; S.v = Math.abs(S.v) * 0.35; }
    }
    this.una("golpe", t > this.tGolpe, () => {
      S.v = -26; temblar(26, 0.45);
      const q = [PIV[0] - 34, PIV[1] + LARGO];
      for (let i = 0; i < 26; i++) { const a = azar(-1.6, 1.6), v = azar(250, 650); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(8, 13)); }
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 150);
    });
    // energía en el guante mientras carga
    if (t > 2.15 && t < this.tGolpe) {
      const q = aPant(e.m, e.pose._manoD || [58, 66]);
      for (let i = 0; i < 2; i++) p.nueva(P.LLAMA, q[0] + azar(-8, 8), q[1] + azar(-6, 6), azar(-20, 20), azar(-140, -60), azar(0.15, 0.3), azar(14, 24), Math.random() < 0.4 ? 1 : 0);
    }
    for (const n of [100, 500]) this.una("p" + n, this.puntos() >= n, () => { temblar(6, 0.15); for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, 750, 196, azar(-200, 200), azar(-300, -80), azar(0.2, 0.4), azar(6, 9)); });
    this.una("revienta", t > this.tRevienta, () => {
      temblar(34, 0.9);
      for (let i = 0; i < 70; i++) { const a = azar(0, 6.283), v = azar(250, 800); p.nueva(P.CHISPA, 750, 196, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 1.0), azar(8, 15)); }
      for (let i = 0; i < 4; i++) p.nueva(P.DESTELLO, 750 + azar(-60, 60), 196 + azar(-20, 20), 0, 0, 0.35, azar(120, 200));
    });
    // bombillas que estallan
    if (t > this.tRevienta + 0.3) {
      const n = Math.floor((t - this.tRevienta - 0.3) / 0.22);
      for (let i = 0; i < Math.min(n, BOMBILLAS.length); i++) {
        const k = (i * 7) % BOMBILLAS.length;
        if (!this.rotas.has(k)) { this.rotas.add(k); const b = BOMBILLAS[k]; p.nueva(P.DESTELLO, b[0], b[1], 0, 0, 0.2, 50); for (let j = 0; j < 5; j++) p.nueva(P.CHISPA, b[0], b[1], azar(-150, 150), azar(-200, 50), azar(0.2, 0.4), azar(5, 8)); }
      }
    }
    // humo
    if (t > this.tRevienta) {
      const f = 1 + 1.5 * tramo(t, 6.5, 8.6);
      if (Math.random() < 9 * dt * f) p.nueva(P.VAPOR, 750 + azar(-70, 70), 190 + azar(-20, 30), azar(-30, 30), azar(-130, -50), azar(1.2, 2.0), azar(40, 70) * (0.8 + 0.3 * f));
      if (Math.random() < 4 * dt * f) p.nueva(P.HUMO, 750 + azar(-80, 80), 200 + azar(-20, 30), azar(-30, 30), azar(-110, -40), azar(1.2, 2.2), azar(50, 80));
      if (t > 6.8 && Math.random() < 4 * dt * f) p.nueva(P.VAPOR, azar(560, 920), azar(260, 540), azar(-90, 30), azar(-60, -10), azar(1.4, 2.0), azar(80, 120));
      if (t < 6 && Math.random() < 12 * dt) p.nueva(P.CHISPA, 750 + azar(-50, 50), 196, azar(-120, 120), azar(-200, -40), azar(0.2, 0.4), azar(5, 9));
    }
    // humito del guante
    if (t > 5.9 && t < 7.4 && Math.random() < 18 * dt) {
      const q = aPant(e.m, [92, 50]);
      p.nueva(P.VAPOR, q[0] + azar(-4, 4), q[1] - 8, azar(-10, 10), azar(-70, -40), azar(0.6, 1.0), azar(12, 22));
    }
    p.alfa = 1;
    p.actualizar(dt);
  }
  maquina(g, t) {
    const pts = this.puntos(), reventada = t > this.tRevienta;
    // cuerpo (se pinta una vez en su lienzo)
    let cuerpo = CACHE.get("cuerpo");
    if (!cuerpo) {
      cuerpo = lienzoNuevo(300, PIES - 60);
      const q = cuerpo.getContext("2d");
      q.translate(-600, -60);
      const x0 = MQ.x0, x1 = MQ.x1, top = MQ.top;
      const gr = q.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, "#5a0710"); gr.addColorStop(0.35, "#c2182a"); gr.addColorStop(0.65, "#d82a3a"); gr.addColorStop(1, "#4a050c");
      q.fillStyle = gr; q.fillRect(x0, top, x1 - x0, PIES - top);
      q.beginPath(); q.ellipse(750, 150, 118, 64, 0, Math.PI, 0); q.lineTo(x1, top + 10); q.lineTo(x0, top + 10); q.closePath();
      const gm = q.createLinearGradient(0, 86, 0, 170);
      gm.addColorStop(0, "#ffd34d"); gm.addColorStop(1, "#b07d00");
      q.fillStyle = gm; q.fill();
      q.beginPath(); q.ellipse(750, 150, 104, 52, 0, Math.PI, 0); q.closePath(); q.fillStyle = "#2a0408"; q.fill();
      txt(q, "FUERZA", 750, 138, { tam: 40, peso: 900, fam: FD, color: "#ffe9a8", glow: "rgba(255,190,40,.8)", glowTam: 10, esp: 4 });
      q.strokeStyle = "#e0a400"; q.lineWidth = 5; q.strokeRect(x0 + 3, top + 10, x1 - x0 - 6, PIES - top - 14);
      q.fillStyle = "#050505"; rectR(q, 680, 166, 140, 62, 8); q.fill();
      q.strokeStyle = "#8a6a00"; q.lineWidth = 3; q.stroke();
      q.fillStyle = "#1a0306"; rectR(q, 712 - 16, 250 - 4, 32, 520 - 250 + 8, 10); q.fill();
      const et = [["¡BESTIA!", 0.95], ["FUERTE", 0.66], ["MAJO", 0.38], ["FLOJITO", 0.1]];
      for (const [tx, k] of et) txt(q, tx, 712 + 26, lerp(520, 250, k) + 6, { tam: 15, peso: 900, fam: FD, color: "#ffe9a8", alin: "left", esp: 1 });
      q.fillStyle = "#2a0408"; rectR(q, 800, 470, 40, 54, 5); q.fill();
      q.fillStyle = "#c9ced4"; q.fillRect(817, 480, 6, 20);
      txt(q, "1 €", 820, 516, { tam: 13, peso: 900, fam: FD, color: "#ffd34d" });
      CACHE.set("cuerpo", cuerpo);
    }
    g.drawImage(cuerpo, 600, 60);
    // pantalla
    let s = pts < 0 ? "---" : String(pts).padStart(3, "0");
    let aPan = 1;
    if (reventada) {
      const u = t - this.tRevienta;
      aPan = u < 1.6 ? (Math.sin(u * 37) > 0.1 ? 1 : 0.15) : u < 2.4 ? (Math.random() < 0.3 ? 0.8 : 0) : 0;
      if (Math.sin(u * 13) > 0.7) s = "888";
    } else if (pts < 0) aPan = Math.sin(t * 6) > 0 ? 1 : 0.4;
    if (aPan > 0) for (let i = 0; i < 3; i++) ponCartel(g, digito(s[i]), 712 + i * 38, 198, 0.8, aPan);
    if (reventada) { // grietas en la pantalla
      g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 1.5; g.beginPath();
      g.moveTo(752, 196); g.lineTo(730, 172); g.moveTo(752, 196); g.lineTo(790, 222); g.moveTo(752, 196); g.lineTo(708, 214); g.moveTo(752, 196); g.lineTo(782, 170); g.stroke();
    }
    // medidor de fuerza
    const mx = 712, my0 = 250, my1 = 520, nivel = clamp(pts / 999, 0, 1);
    const n = 18, a0 = g.globalAlpha;
    for (let i = 0; i < n; i++) {
      const y = lerp(my1 - 14, my0 + 2, i / (n - 1)), on = (i + 0.5) / n <= nivel;
      const col = i < 6 ? "#2bff5b" : i < 12 ? "#ffd34d" : "#ff3a2a";
      g.globalAlpha = a0 * (on ? 1 : 0.18); g.fillStyle = col; rectR(g, mx - 11, y, 22, 11, 3); g.fill();
    }
    g.globalAlpha = a0;
    // bombillas
    BOMBILLAS.forEach((b, i) => {
      const rota = this.rotas.has(i);
      let on = !rota && t > 0.12 + i * 0.03;
      if (on && !reventada) on = t < 0.9 || ((i + Math.floor(t * 9)) % 3 !== 0);
      if (on && reventada) on = Math.sin(t * 40 + i) > -0.2;
      g.fillStyle = rota ? "#2a2a2a" : on ? "#fff3b0" : "#6b5a20";
      g.beginPath(); g.arc(b[0], b[1], 7, 0, 6.283); g.fill();
      if (on) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha *= 0.55; g.drawImage(BLOB.amarillo, b[0] - 20, b[1] - 20, 40, 40); g.restore(); }
    });
  }
  sacoDibujo(g) {
    const a = this.saco.a;
    // brazo del soporte
    g.fillStyle = "#8f98a2"; rectR(g, PIV[0] - 6, PIV[1] - 10, MQ.x0 - PIV[0] + 12, 18, 5); g.fill();
    g.fillStyle = "#c9d0d6"; g.beginPath(); g.arc(PIV[0], PIV[1], 9, 0, 6.283); g.fill();
    g.save(); g.translate(PIV[0], PIV[1]); g.rotate(a);
    g.strokeStyle = "#5f6770"; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, LARGO - 44); g.stroke();
    const gr = g.createRadialGradient(-12, LARGO - 12, 4, 0, LARGO, 48);
    gr.addColorStop(0, "#ff7a5a"); gr.addColorStop(0.5, "#c8121e"); gr.addColorStop(1, "#5a0008");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-14, LARGO - 46); g.quadraticCurveTo(-44, LARGO - 30, -38, LARGO + 6); g.quadraticCurveTo(-30, LARGO + 44, 0, LARGO + 44);
    g.quadraticCurveTo(30, LARGO + 44, 38, LARGO + 6); g.quadraticCurveTo(44, LARGO - 30, 14, LARGO - 46); g.closePath(); g.fill();
    g.strokeStyle = "#3a0004"; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-6, LARGO - 40); g.lineTo(-6, LARGO + 38); g.stroke();
    g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.ellipse(-18, LARGO - 8, 6, 14, 0.2, 0, 6.283); g.fill();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    // la máquina se enciende sola (sus bombillas); el resto con un foco
    const aMaq = tramo(t, 0.1, 0.5) * (1 - tramo(t, 8.6, 9.3));
    g.save(); g.globalAlpha = luz;
    foco(g, this.X, this.X, PIES, 170, 0.8);
    g.fillStyle = "#0c0c0e"; g.fillRect(-60, PIES, W + 120, 80);
    g.restore();
    g.save(); g.globalAlpha = aMaq;
    // resplandor de la máquina en el suelo
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha *= 0.35; g.drawImage(BLOB.rojo, 560, PIES - 40, 380, 80); g.restore();
    this.maquina(g, t);
    this.sacoDibujo(g);
    g.restore();
    g.save(); g.globalAlpha = Math.max(luz, aMaq * 0.6);
    g.fillStyle = "rgba(0,0,0,.5)"; g.beginPath(); g.ellipse(this.X, PIES - 1, 66, 9, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    g.restore();
    this.p.alfa = Math.max(luz, aMaq);
    this.p.dibujar(g);
    // ¡POW!
    if (t > this.tGolpe && t < 3.7) {
      const k = tramo(t, this.tGolpe, this.tGolpe + 0.12), a = 1 - tramo(t, 3.4, 3.7);
      ponCartel(g, cartel("pow", "¡POW!", { tam: 96, fam: FC, color: "#fffdf5", borde: "#b0122a", bordeAncho: 11, esp: 3 }), 470, 200, eBack(k), a, -0.14);
    }
    // ¡999!
    if (t > this.tRevienta + 0.05) {
      const k = tramo(t, this.tRevienta + 0.05, this.tRevienta + 0.25), a = Math.min(1, k * 3) * (1 - tramo(t, 8.3, 8.9));
      const c = cartel("999", "¡999!", {
        tam: 170, peso: 900, fam: FD, borde: "#3a0400", bordeAncho: 13, esp: 6, glow: "rgba(255,60,20,.85)", glowTam: 30,
        color: (gg, cv) => { const gr = gg.createLinearGradient(0, cv.height * 0.2, 0, cv.height * 0.8); gr.addColorStop(0, "#fff6c8"); gr.addColorStop(0.45, "#ffb21a"); gr.addColorStop(1, "#ff2a12"); return gr; },
      });
      const tiembla = t < 5.2 ? 4 : 1;
      ponCartel(g, c, 290 + azar(-tiembla, tiembla), 138 + azar(-tiembla, tiembla), lerp(2.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 11)), a, -0.08);
    }
    // el humo lo tapa todo
    const n = tramo(t, 8.4, 9.35);
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${eIn(n)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00024", nombre: "Puñetazo récord", crear: () => new EscenaPunetazo() });
})();
