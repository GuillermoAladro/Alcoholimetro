"use strict";
/*
 * 00242 · CADENA DE CUBOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un pueblo del lejano oeste al atardecer: arde (poquito, de dibujos) el pajar. Marcos, de bombero, monta una cadena
 * de cubos desde el abrevadero: ¡PÁSALO! Pasan por dos vecinos con sombrero (clones de Guillermo) hasta Guillermo,
 * que los echa al pajar. Cada vez van más rápido… el fuego se apaga, Guillermo lo celebra y el último cubo llega
 * volando y le cae entero encima: se queda empapado con el cubo de sombrero.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.2;
const X = [192, 404, 616, 830];                              // Marcos, vecino 1, vecino 2, Guillermo
const HX = [108, 298, 510, 723, 916];                        // puntos de entrega (el primero, el abrevadero)
const YC = 462, CS = 1.45;                                   // altura del asa al pasar el cubo y tamaño del cubo
const PJ = [968, PIES];                                      // el pajar
const N = 7, T0 = 0.95, T1 = 5.6;                            // cubos y cuándo va la cadena
const T_GRITO = 0.35, T_FIN = 9.0, DUR = 9.5;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Cuántos cubos han pasado (fase de la cadena): cada vez más deprisa. */
function fase(t) {
  const u = clamp((t - T0) / (T1 - T0), 0, 1);
  return (T1 - T0) * (1.2 * u + (6.4 / 3) * u * u * u);
}
const FASE_LANZA = 2 * (N - 1) + 2.45;                       // cuando el último cubo llega al vecino 2… sale volando
let T_LANZA = 0;
for (let t = T0; t < 9; t += 0.005) if (fase(t) >= FASE_LANZA) { T_LANZA = t; break; }
const T_PLAF = T_LANZA + 0.5;

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(720, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#fff6d8"); gr.addColorStop(0.5, "#ffc24a"); gr.addColorStop(1, "#e05a1a");
  txt(g, "¡PÁSALO!", 366, 158, { tam: 140, peso: 900, fam: FD, color: "#2a1200", esp: 6 });
  txt(g, "¡PÁSALO!", 360, 150, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#2a1200", bordeAncho: 12, esp: 6, glow: "rgba(255,170,60,.8)", glowTam: 22 });
  CT.set("t", c);
  return c;
}
/** Llama de dibujos con la base en (x, y). */
function llamita(g, x, y, s, t, f = 0) {
  if (s <= 0.02) return;
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55;
  g.drawImage(BLOB.naranja, x - 50 * s, y - 80 * s, 100 * s, 100 * s);
  g.restore();
  for (const [k, col] of [[1, "#ff4a1a"], [0.74, "#ffa21f"], [0.45, "#fff3a6"]]) {
    const h = 46 * s * k * (1 + 0.14 * Math.sin(t * 23 + k * 5 + f)), w = 15 * s * k, sw = 5 * s * Math.sin(t * 17 + k * 3 + f);
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(x + sw, y - h);
    g.bezierCurveTo(x + w * 0.6, y - h * 0.55, x + w * 1.1, y - w * 1.5, x + w, y - w);
    g.arc(x, y - w, w, 0, Math.PI);
    g.bezierCurveTo(x - w * 1.1, y - w * 1.5, x - w * 0.6, y - h * 0.55, x + sw, y - h);
    g.fill();
  }
}
/** Cubo (pantalla): el asa en (x, y), girado ang, con agua 0–1. */
function cubo(g, x, y, ang, agua, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.strokeStyle = "#5d656e"; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-16, 14); g.quadraticCurveTo(0, -6, 16, 14); g.stroke();
  const gr = g.createLinearGradient(-18, 0, 18, 0);
  gr.addColorStop(0, "#6a737b"); gr.addColorStop(0.4, "#d9dee2"); gr.addColorStop(1, "#5a636b");
  g.fillStyle = gr; g.beginPath(); g.moveTo(-18, 12); g.lineTo(18, 12); g.lineTo(14, 46); g.lineTo(-14, 46); g.closePath(); g.fill();
  g.strokeStyle = "#3a4048"; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(-16, 24, 32, 3); g.fillRect(-15, 36, 30, 3);
  g.fillStyle = "#3a4048"; g.beginPath(); g.ellipse(0, 12, 18, 4.5, 0, 0, 6.283); g.fill();
  if (agua > 0.05) { g.fillStyle = "#5ab4ff"; g.beginPath(); g.ellipse(0, 13, 16 * agua + 1, 3.6, 0, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(-8, 12, 6, 1.5); }
  g.restore();
}
/** Sombrero vaquero (diseño propio) y pañuelo, en unidades del avatar. */
function sombrero(g, rc, col, panuelo) {
  const R = avatar().rig;
  g.save();
  g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]);
  g.fillStyle = col;
  g.beginPath(); g.moveTo(16, 6); g.quadraticCurveTo(14, -24, 28, -26); g.quadraticCurveTo(39, -18, 50, -26); g.quadraticCurveTo(64, -24, 62, 6); g.closePath(); g.fill();
  g.fillStyle = "#2a1a10"; g.fillRect(16, -2, 46, 6);
  g.fillStyle = col;
  g.beginPath(); g.moveTo(-14, -4); g.quadraticCurveTo(-6, 12, 39, 12); g.quadraticCurveTo(84, 12, 92, -4); g.quadraticCurveTo(82, 6, 39, 6); g.quadraticCurveTo(-4, 6, -14, -4); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(30, -16, 6, 3, -0.5, 0, 6.283); g.fill();
  g.restore();
  // pañuelo al cuello
  g.fillStyle = panuelo; g.beginPath(); g.moveTo(24, 70); g.lineTo(54, 70); g.lineTo(39, 92); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; for (const [x, y] of [[32, 74], [44, 76], [39, 84]]) { g.beginPath(); g.arc(x, y, 1.4, 0, 6.283); g.fill(); }
}

class CadenaDeCubos extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.gotas = [];
  }
  /** Estado de cada cubo: { x, y, ang, agua, quien (avatar que lo lleva o -1), modo } */
  cubos() {
    const t = this.t, f = fase(t), L = [];
    for (let j = 0; j < N; j++) {
      const s = f - 2 * j;
      if (s < -1) continue;
      if (j === N - 1 && t >= T_LANZA) {
        // el último: sale volando hacia la cabeza de Guillermo
        const u = tramo(t, T_LANZA, T_PLAF), a = [lerp(HX[2], HX[3], 0.5), YC - 20], b = this.cabezaG();
        if (u < 1) L.push({ x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u) - 170 * 4 * u * (1 - u), ang: u * (Math.PI * 3), agua: 1 - u * 0.3, quien: -1, modo: "vuela" });
        else L.push({ x: b[0], y: b[1], ang: Math.PI, agua: 0, quien: 3, modo: "gorro" });
        continue;
      }
      if (s < 0) { L.push({ x: HX[0], y: lerp(YC + 30, YC, eOut(s + 1)), ang: 0, agua: 1, quien: 0, modo: "sube" }); continue; }
      const k = Math.floor(s), fr = s - k;
      if (k <= 3) {
        const e = eInOut(fr);
        let x = lerp(HX[k], HX[k + 1], e), y = YC - 26 * Math.sin(fr * Math.PI), ang = 0.12 * Math.sin(fr * Math.PI * 2), agua = 1;
        if (k === 3) {
          // Guillermo lo levanta y lo vuelca en el pajar
          y = YC - 90 * eInOut(fr); ang = -2.2 * eIn(tramo(fr, 0.55, 1)); agua = 1 - tramo(fr, 0.6, 0.95);
        }
        L.push({ x, y, ang, agua, quien: k, modo: k === 3 && fr > 0.6 ? "vuelca" : "lleva" });
      } else {
        // vacío, al montón junto al pajar
        const u = clamp((s - 4) / 0.6, 0, 1), dest = [870 + j * 22, PIES - 46 * CS + (j % 2) * 3];
        L.push({ x: lerp(HX[4], dest[0], u), y: lerp(YC - 90, dest[1], u) - 80 * 4 * u * (1 - u), ang: lerp(-2.2, j % 2 ? 0.3 : -0.2, u), agua: 0, quien: -1, modo: "monton" });
      }
    }
    return L;
  }
  vertidos() { const f = fase(this.t); let n = 0; for (let j = 0; j < N - 1; j++) if (f - 2 * j > 3.9) n++; return n; }
  cabezaG() { return [X[3] + 2, PIES - 236 * ESC + 4]; }
  poses() {
    const t = this.t, cs = this.cubos();
    const vel = clamp((fase(t + 0.05) - fase(t)) / 0.05 / 4.5, 0, 1);         // 0 despacio … 1 a tope
    const P = [
      { quien: "bombero", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 140], manoI: [2, 140] },
      { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 140], manoI: [2, 140], gafas: false },
      { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 140], manoI: [2, 140], gafas: true },
      { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 140], manoI: [2, 140] },
    ];
    const ms = X.map((x) => matAv(x, PIES, ESC));
    // al principio, Marcos grita señalando el pajar
    if (t < T0 + 0.2) {
      P[0].cara = t > T_GRITO ? "risa" : "sonrisa"; P[0].manoD = [84, 64]; P[0].rc = 0.08;
      P[3].cara = "sorpresa"; P[3].rc = 0.12; P[1].cara = "sorpresa"; P[2].cara = "sorpresa";
    }
    for (const c of cs) {
      if (c.quien < 0 || c.modo === "gorro") continue;
      const m = ms[c.quien], a = enAv(m, [c.x, c.y + 6]);
      const q = P[c.quien];
      q.manoI = [a[0] - 6, a[1]]; q.manoD = [a[0] + 6, a[1]]; q.brazoIDelante = true; q.cubo = c;
      if (c.modo === "sube") { q.manoI = enAv(m, [c.x + 4, c.y + 6]); q.manoD = [60, 120]; }
    }
    // caras según la velocidad
    for (let i = 0; i < 3; i++) if (t > T0 + 0.2) { P[i].cara = vel < 0.35 ? "risa" : vel < 0.7 ? "guino" : "sorpresa"; P[i].puntas = vel > 0.7 ? 0.6 : 0; P[i].rc = 0.05 * Math.sin(t * 9 + i); }
    if (t > T0 + 0.2) {
      P[0].cara = vel < 0.5 ? "guino" : "sorpresa";
      P[3].cara = vel < 0.3 ? "sonrisa" : vel < 0.6 ? "risa" : "sorpresa"; P[3].puntas = vel > 0.6 ? 0.8 : 0;
    }
    // el fuego se apaga: Guillermo lo celebra… y le cae el último cubo
    const apagado = this.vertidos() >= N - 1;
    if (apagado && t < T_PLAF) {
      const k = eOut(tramo(t, T_LANZA - 0.25, T_LANZA));
      P[3].manoD = mezcla([72, 140], [100, 30], k); P[3].manoI = mezcla([2, 140], [-22, 30], k); P[3].cara = "risa"; P[3].puntas = 0; P[3].rc = 0;
    }
    if (t >= T_LANZA - 0.1 && t < T_PLAF + 0.1) {
      // el vecino 2 lo lanza sin querer
      P[2].cara = "sorpresa"; P[2].manoD = [96, 30]; P[2].manoI = [60, 40]; P[2].brazoIDelante = true;
      P[0].cara = "sorpresa"; P[1].cara = "sorpresa";
    }
    let dyG = 0, syG = 1;
    if (t >= T_PLAF) {
      const d = t - T_PLAF;
      P[3].cara = d < 0.9 ? "dormido" : d < 1.4 ? "sorpresa" : "risa"; P[3].puntas = 0;
      P[3].manoD = d < 1.4 ? [84, 108] : [86, 50 + 4 * Math.sin(t * 8)]; P[3].manoI = [-6, 108];
      syG = 1 - 0.08 * Math.sin(tramo(d, 0, 0.25) * Math.PI);
      dyG = 0;
      P[2].cara = d < 0.6 ? "sorpresa" : "risa"; P[2].manoD = [52, 108]; P[2].manoI = [26, 110]; P[2].brazoIDelante = true;
      P[1].cara = "risa"; P[1].manoD = [84, 60]; P[1].rc = 0.1;
      P[0].cara = d < 0.6 ? "sorpresa" : "risa"; P[0].manoD = [44, 34]; P[0].manoI = [6, 152]; P[0].rc = 0.12;
      for (let i = 0; i < 3; i++) P[i].rc = 0.1 + 0.04 * Math.sin(t * 12 + i);
    }
    ms[3] = matAv(X[3], PIES + dyG, ESC, 0, 1, syG);
    // el cubo que lleva cada uno (delante del cuerpo, detrás de la mano derecha) y los sombreros de los vecinos
    P.forEach((q, i) => {
      const c = q.cubo, m = ms[i];
      q.objD = (g) => {
        if (c) { const a = enAv(m, [c.x, c.y]); cubo(g, a[0], a[1], c.ang, c.agua, CS / ESC); }
        if (i === 1) sombrero(g, q.rc || 0, "#8a5a2a", "#d8261c");
        if (i === 2) sombrero(g, q.rc || 0, "#3a2a22", "#2a6ad8");
      };
    });
    return { P, ms, cs, vel };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, cs = this.cubos();
    // agua al pajar
    for (const c of cs) if (c.modo === "vuelca" && Math.random() < 50 * dt) {
      const bx = c.x + 34, by = c.y + 10;
      this.gotas.push({ x: bx, y: by, vx: azar(80, 220), vy: azar(-200, -40), v: azar(0.5, 0.9) });
    }
    const n = this.vertidos();
    for (let i = 1; i <= N - 1; i++) this.una("v" + i, n >= i, () => {
      temblar(6, 0.2);
      for (let k = 0; k < 10; k++) p.nueva(P.VAPOR, PJ[0] + azar(-50, 40), PJ[1] - 150 + azar(-20, 20), azar(-40, 40), azar(-120, -50), azar(0.7, 1.2), azar(30, 50));
    });
    // humo del pajar mientras arde
    const fuego = 1 - n / (N - 1);
    if (fuego > 0.05 && Math.random() < 6 * dt) p.nueva(P.HUMO, PJ[0] + azar(-40, 30), PJ[1] - 190, azar(-10, 10), azar(-60, -30), azar(1, 1.6), azar(16, 26));
    // salpicones de los cubos con prisa
    for (const c of cs) if (c.modo === "lleva" && Math.random() < 6 * dt * (fase(t + 0.05) - fase(t)) / 0.05) this.gotas.push({ x: c.x + azar(-10, 10), y: c.y + 12, vx: azar(-60, 60), vy: azar(-160, -40), v: azar(0.4, 0.7) });
    this.una("lanza", t > T_LANZA, () => temblar(6, 0.2));
    this.una("plaf", t > T_PLAF, () => {
      temblar(18, 0.45);
      const h = this.cabezaG();
      p.nueva(P.DESTELLO, h[0], h[1], 0, 0, 0.3, 160);
      for (let k = 0; k < 70; k++) { const a = azar(-Math.PI, 0), v = azar(120, 420); this.gotas.push({ x: h[0] + azar(-20, 20), y: h[1] + 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.5, 1.1) }); }
      for (let k = 0; k < 40; k++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, -10), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 14), k % 5);
    });
    // goteo de Guillermo
    if (t > T_PLAF && Math.random() < 14 * dt) this.gotas.push({ x: X[3] + azar(-40, 40), y: PIES - azar(60, 260), vx: 0, vy: azar(0, 80), v: azar(0.4, 0.7) });
    for (const d of this.gotas) { d.v -= dt; d.vy += 1000 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > PIES) { d.y = PIES; d.vy = 0; d.vx *= 0.4; } }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 320) this.gotas.splice(0, this.gotas.length - 320);
    p.suelo = () => PIES;
    p.actualizar(dt);
  }

  fondoC() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 470);
    gc.addColorStop(0, "#ff7a4a"); gc.addColorStop(0.5, "#ffb46a"); gc.addColorStop(1, "#ffe0a0");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(BLOB.amarillo, 300, 120, 360, 360); g.restore();
    g.fillStyle = "#fff4c8"; g.beginPath(); g.arc(480, 300, 56, 0, 6.283); g.fill();
    // mesetas rojas
    g.fillStyle = "#b8523a";
    g.beginPath(); g.moveTo(-60, 470); g.lineTo(-60, 330); g.lineTo(60, 330); g.lineTo(90, 350); g.lineTo(200, 350); g.lineTo(230, 470); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(600, 470); g.lineTo(640, 300); g.lineTo(820, 300); g.lineTo(850, 330); g.lineTo(950, 330); g.lineTo(990, 470); g.closePath(); g.fill();
    g.fillStyle = "rgba(90,30,20,.35)"; g.fillRect(640, 320, 180, 10); g.fillRect(-60, 345, 120, 8);
    // fachadas de madera
    const fach = (x, w, h, col, rot) => {
      g.fillStyle = col; g.fillRect(x, 470 - h, w, h + 10);
      g.fillStyle = "rgba(0,0,0,.18)"; for (let xx = x; xx < x + w; xx += 16) g.fillRect(xx, 470 - h, 2, h + 10);
      g.fillStyle = "#3a2010"; g.fillRect(x - 6, 470 - h - 10, w + 12, 12);
      g.fillStyle = "#2a1408"; g.fillRect(x + w * 0.2, 470 - h * 0.62, w * 0.22, h * 0.3); g.fillRect(x + w * 0.58, 470 - h * 0.62, w * 0.22, h * 0.3);
      g.fillStyle = "#ffcf7a"; g.fillRect(x + w * 0.2 + 4, 470 - h * 0.62 + 4, w * 0.22 - 8, h * 0.3 - 8); g.fillRect(x + w * 0.58 + 4, 470 - h * 0.62 + 4, w * 0.22 - 8, h * 0.3 - 8);
      if (rot) {
        g.fillStyle = "#f4e2b0"; g.fillRect(x + w / 2 - 80, 470 - h + 10, 160, 34);
        g.strokeStyle = "#3a2010"; g.lineWidth = 3; g.strokeRect(x + w / 2 - 80, 470 - h + 10, 160, 34);
        txt(g, rot, x + w / 2, 470 - h + 37, { tam: 28, peso: 900, fam: FD, color: "#5a2a10", esp: 6 });
      }
      // porche
      g.fillStyle = "#5a3418"; g.fillRect(x - 10, 470 - h * 0.25, w + 20, 8);
      g.fillStyle = "#4a2a14"; for (let xx = x; xx <= x + w; xx += w / 3) g.fillRect(xx - 3, 470 - h * 0.25, 6, h * 0.25);
    };
    fach(-40, 250, 210, "#8a5a32", "SALOON");
    fach(250, 200, 170, "#7a4a2a", "HOTEL");
    fach(470, 230, 190, "#94643a", "");
    fach(720, 200, 160, "#6a4426", "TIENDA");
    // cactus
    const cactus = (x, y, s) => {
      g.fillStyle = "#3a8a4a";
      rectR(g, x - 8 * s, y - 70 * s, 16 * s, 70 * s, 8 * s); g.fill();
      rectR(g, x - 26 * s, y - 52 * s, 10 * s, 26 * s, 5 * s); g.fill(); g.fillRect(x - 26 * s, y - 32 * s, 20 * s, 8 * s);
      rectR(g, x + 16 * s, y - 60 * s, 10 * s, 30 * s, 5 * s); g.fill(); g.fillRect(x + 6 * s, y - 36 * s, 20 * s, 8 * s);
    };
    cactus(560, 470, 0.8);
    // suelo polvoriento
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#d8a868"); gs.addColorStop(1, "#a8743a");
    g.fillStyle = gs; g.fillRect(-60, 470, W + 120, H);
    const r = semilla(13);
    g.fillStyle = "rgba(120,70,30,.3)";
    for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * W, 480 + r() * 110, 4 + r() * 12, 1.5 + r() * 3, 0, 0, 6.283); g.fill(); }
    // abrevadero
    g.fillStyle = "#5a3418"; g.fillRect(52, PIES - 70, 110, 66);
    g.fillStyle = "#4a8ad8"; g.fillRect(56, PIES - 68, 102, 10);
    g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(70, PIES - 66, 30, 2);
    g.fillStyle = "rgba(0,0,0,.2)"; for (let y = PIES - 56; y < PIES - 6; y += 14) g.fillRect(52, y, 110, 3);
    g.fillStyle = "#3a2010"; g.fillRect(48, PIES - 6, 118, 6);
    return (this.cF = c);
  }
  pajar(g, t, fuego) {
    const [x, y] = PJ;
    g.save(); g.translate(x, y);
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(0, 2, 100, 10, 0, 0, 6.283); g.fill();
    const gr = g.createLinearGradient(0, -170, 0, 0);
    gr.addColorStop(0, "#ffe27a"); gr.addColorStop(1, "#c88a1a");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-96, 0); g.bezierCurveTo(-100, -120, -40, -172, 0, -172); g.bezierCurveTo(40, -172, 100, -120, 96, 0); g.closePath(); g.fill();
    g.strokeStyle = "rgba(140,90,10,.6)"; g.lineWidth = 2;
    const r = semilla(3);
    for (let i = 0; i < 40; i++) { const px = (r() - 0.5) * 160, py = -r() * 150 - 10, a = (r() - 0.5) * 1.2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * 16, py + Math.sin(a) * 16 - 6); g.stroke(); }
    // mojado
    if (fuego < 1) { g.fillStyle = `rgba(80,120,160,${0.35 * (1 - fuego)})`; g.beginPath(); g.ellipse(-10, -140, 70, 30, 0, 0, 6.283); g.fill(); }
    g.restore();
    // fuego de dibujos arriba
    if (fuego > 0.02) for (let i = 0; i < 4; i++) llamita(g, x - 50 + i * 30, y - 150 - (i % 2) * 14, (0.7 + 0.2 * Math.sin(t * 5 + i)) * fuego, t, i * 2);
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), n = this.vertidos();
    const fuego = clamp(1 - (n + (e.cs.some((c) => c.modo === "vuelca") ? 0.5 : 0)) / (N - 1), 0, 1);
    fondo(g, "#000");
    g.drawImage(this.fondoC(), -60, -60);
    this.pajar(g, t, fuego);
    // cubos del montón (detrás de Guillermo)
    for (const c of e.cs) if (c.modo === "monton") cubo(g, c.x, c.y, c.ang, c.agua, CS);
    for (let i = 0; i < 4; i++) pintarAvatar(g, e.ms[i], e.P[i], t);
    // el cubo que vuela y el «sombrero» de Guillermo
    for (const c of e.cs) {
      if (c.modo === "vuela") cubo(g, c.x, c.y, c.ang, c.agua, CS);
      if (c.modo === "gorro") { const h = aPant(e.ms[3], [39, 24]); cubo(g, h[0], h[1] + 12 * CS, Math.PI + 0.12, 0, CS); }
    }
    // chorro al volcar
    for (const c of e.cs) if (c.modo === "vuelca") {
      const k = tramo(c.agua, 0, 0.6);
      g.strokeStyle = "rgba(110,190,255,.75)"; g.lineWidth = 12 * (0.3 + k); g.lineCap = "round";
      g.beginPath(); g.moveTo(c.x + 30, c.y + 6); g.quadraticCurveTo(PJ[0] - 40, c.y - 40, PJ[0] - 10, PJ[1] - 150); g.stroke();
    }
    g.fillStyle = "rgba(150,210,255,.9)";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3, 4.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    for (let i = 1; i <= N - 1; i++) {
      let ti = 0; for (let tt = T0; tt < 8; tt += 0.01) if (fase(tt) - 2 * (i - 1) > 3.9) { ti = tt; break; }
      if (ti) ono("¡FSSS!", 900 - (i % 2) * 40, 300 - i * 18, ti, 0.45, 40 + i * 3, "#e8f6ff", "#123048", 0.1);
    }
    ono("¡APAGADO!", 760, 200, T_LANZA - 0.25, 0.6, 46, "#fffdf5", "#1b1b1b", 0.06);
    ono("¡PLAF!", 860, 220, T_PLAF, 1.0, 72, "#bfeaff", "#0a2a48", 0.12);
    // ¡PÁSALO! (al empezar y cuando sale volando el último)
    const tit = (t0, t1, x, y, rot) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.14), s = lerp(2, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 12)), sal = tramo(t, t1 - 0.25, t1);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(x, y); g.rotate(rot); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_GRITO, T0 + 1.3, 470, 110, -0.04);
    tit(T_LANZA - 0.05, DUR, 470, 110, 0.03);
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00242", nombre: "Cadena de cubos", crear: () => new CadenaDeCubos() });
})();
