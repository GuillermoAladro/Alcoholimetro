"use strict";
/*
 * 00126 · EL GRUPO
 *
 * Animación del banco. Empieza y acaba en negro.
 * A oscuras, Guillermo cuenta con las baquetas: 1, 2, 3, 4… ¡y se encienden todas las luces! Toca una batería de
 * jarras (con un barril de bombo y una bandeja de platillo) y Rodrigo una guitarra: focos que barren, humo, solo de
 * guitarra con chispas, molinete de baqueta y llamaradas. Se miran, saltan a la vez y en el último golpe: ¡CONCIERTO!
 */
(() => {
const ESC = 1.5, XG = 330, XR = 700;
const JD = [404, 474], JI = [256, 474], PLATO = [190, 392], BOMBO = [330, 524];  // centros (pantalla)
const T_LUZ = 0.95, T_ROLL = 6.0, T_SALTA = 6.55, T_FIN = 7.05, PER = 0.4;
const CUENTA = [0.15, 0.4, 0.65, 0.9];
const cache = cacheTexto();

function aU(x, q) { return [(q[0] - x) / ESC + 39, (q[1] - PIES) / ESC + 232]; }

function baqueta(g, m, ang) {
  const L = 34, x2 = m[0] + Math.cos(ang) * L, y2 = m[1] + Math.sin(ang) * L, x0 = m[0] - Math.cos(ang) * 6, y0 = m[1] - Math.sin(ang) * 6;
  g.lineCap = "round";
  g.strokeStyle = "#7a4a1e"; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x2, y2); g.stroke();
  g.strokeStyle = "#e8c48a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x2, y2); g.stroke();
  g.fillStyle = "#f6e2b8"; g.beginPath(); g.arc(x2, y2, 2.2, 0, 6.283); g.fill();
}
/** Guitarra eléctrica en las unidades de Rodrigo (el mástil hacia la derecha de la pantalla). */
function guitarra(g, t) {
  g.save(); g.translate(34, 140); g.rotate(-0.5);
  // mástil y pala
  g.fillStyle = "#5a3418"; rectR(g, 8, -3.2, 66, 6.4, 1.5); g.fill();
  g.fillStyle = "#e9d8b4"; for (let x = 16; x < 72; x += 7) g.fillRect(x, -3.2, 0.8, 6.4);
  g.fillStyle = "#1c1c1c"; g.beginPath(); g.moveTo(72, -4); g.lineTo(88, -6); g.lineTo(90, 4); g.lineTo(72, 4); g.closePath(); g.fill();
  g.fillStyle = "#cfd4da"; for (const x of [76, 80, 84]) { g.beginPath(); g.arc(x, -6.5, 1.3, 0, 6.283); g.arc(x, 5, 1.3, 0, 6.283); g.fill(); }
  // cuerpo de doble corte
  g.beginPath();
  g.moveTo(14, -8); g.quadraticCurveTo(6, -10, 4, -15); g.quadraticCurveTo(-6, -19, -14, -14);
  g.quadraticCurveTo(-30, -15, -28, 0); g.quadraticCurveTo(-30, 16, -12, 16); g.quadraticCurveTo(-2, 18, 4, 14);
  g.quadraticCurveTo(8, 9, 16, 8); g.quadraticCurveTo(10, 0, 14, -8); g.closePath();
  const gr = g.createRadialGradient(-10, 0, 2, -8, 0, 26);
  gr.addColorStop(0, "#ffcc4d"); gr.addColorStop(0.55, "#e2401c"); gr.addColorStop(1, "#5a0c06");
  g.fillStyle = gr; g.fill(); g.strokeStyle = "#2a0a04"; g.lineWidth = 1; g.stroke();
  // golpeador, pastillas, puente y potes
  g.fillStyle = "rgba(255,255,255,.88)"; g.beginPath(); g.moveTo(6, -6); g.quadraticCurveTo(-4, -12, -12, -6); g.lineTo(-14, 9); g.quadraticCurveTo(-2, 12, 6, 6); g.closePath(); g.fill();
  g.fillStyle = "#1a1a1a"; rectR(g, -1, -5, 4, 10, 1); g.fill(); rectR(g, -8, -5, 4, 10, 1); g.fill();
  g.fillStyle = "#b8bec6"; rectR(g, -17, -5, 3.4, 10, 1); g.fill();
  g.fillStyle = "#e6e6e6"; for (const [x, y] of [[-20, 9], [-15, 12]]) { g.beginPath(); g.arc(x, y, 1.8, 0, 6.283); g.fill(); }
  // cuerdas
  g.strokeStyle = "rgba(240,240,240,.8)"; g.lineWidth = 0.35;
  for (let i = -2.5; i <= 2.5; i += 1) { g.beginPath(); g.moveTo(-16, i * 1.2); g.lineTo(74, i * 1.1); g.stroke(); }
  g.restore();
}
function jarraBateria(g, x, y, sacude, t) {
  // pie cromado y jarra boca arriba (escala de pantalla)
  g.fillStyle = "#8d949b"; g.fillRect(x - 2, y + 26, 4, PIES - y - 26);
  g.fillRect(x - 18, PIES - 4, 36, 4);
  g.save(); g.translate(x, y + Math.sin(sacude * 40) * 3 * sacude); g.rotate(Math.sin(sacude * 30) * 0.08 * sacude); g.scale(1.7, 1.7);
  dibujarJarra(g, [-17, 0], 0, 0.85, "asa", t); dibujarJarra(g, [-17, 0], 0, 0.85, "cuerpo", t);
  g.restore();
}
function bombo(g, x, y, sacude) {
  const r = 52 * (1 + 0.04 * sacude);
  g.save(); g.translate(x, y);
  const gr = g.createRadialGradient(-14, -14, 4, 0, 0, r);
  gr.addColorStop(0, "#d39556"); gr.addColorStop(1, "#7a4219");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r - 7, 0, 6.283); g.clip();
  g.strokeStyle = "rgba(60,28,6,.55)"; g.lineWidth = 2;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 14, -r); g.lineTo(i * 14, r); g.stroke(); }
  g.restore();
  g.lineWidth = 8; g.strokeStyle = "#3e454c"; g.beginPath(); g.arc(0, 0, r - 4, 0, 6.283); g.stroke();
  // estrella en el parche
  g.fillStyle = "rgba(255,211,77,.9)"; estrella(g, 0, 0, 20, 8, 0); g.fill();
  g.restore();
}
function plato(g, x, y, sacude) {
  g.fillStyle = "#8d949b"; g.fillRect(x - 2, y, 4, PIES - y);
  g.fillRect(x - 20, PIES - 4, 40, 4);
  g.save(); g.translate(x, y); g.rotate(-0.12 + Math.sin(sacude * 25) * 0.25 * sacude);
  const gr = g.createLinearGradient(-40, 0, 40, 0);
  gr.addColorStop(0, "#8e959c"); gr.addColorStop(0.5, "#f4f6f8"); gr.addColorStop(1, "#7a8188");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 42, 9, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#5b6168"; g.lineWidth = 2; g.stroke();
  g.strokeStyle = "rgba(90,96,104,.6)"; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -1, 30, 6, 0, 0, 6.283); g.stroke();
  g.restore();
}
function fondoEscenario() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, -60, 0, PIES);
  gr.addColorStop(0, "#07050c"); gr.addColorStop(1, "#140c1e");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, PIES + 60);
  // estructura de focos
  g.strokeStyle = "#3a3f48"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(-60, 14); g.lineTo(W + 60, 14); g.moveTo(-60, 34); g.lineTo(W + 60, 34); g.stroke();
  g.lineWidth = 2; g.beginPath();
  for (let x = -60; x < W + 60; x += 20) { g.moveTo(x, 14); g.lineTo(x + 20, 34); }
  g.stroke();
  // altavoces a los lados
  const caja = (x, y, w, h) => {
    g.fillStyle = "#16161a"; rectR(g, x, y, w, h, 6); g.fill(); g.strokeStyle = "#2c2c33"; g.lineWidth = 3; g.stroke();
    for (const [cy, r] of [[y + h * 0.3, w * 0.22], [y + h * 0.7, w * 0.32]]) {
      const gc = g.createRadialGradient(x + w / 2, cy, 2, x + w / 2, cy, r);
      gc.addColorStop(0, "#3a3a44"); gc.addColorStop(1, "#08080a");
      g.fillStyle = gc; g.beginPath(); g.arc(x + w / 2, cy, r, 0, 6.283); g.fill();
      g.strokeStyle = "#45454f"; g.lineWidth = 2; g.stroke();
    }
  };
  caja(-20, 400, 110, 175); caja(-6, 250, 92, 150); caja(934, 400, 110, 175); caja(938, 250, 92, 150);
  // tarima
  const gs = g.createLinearGradient(0, PIES - 6, 0, H + 60);
  gs.addColorStop(0, "#2a2230"); gs.addColorStop(1, "#08060a");
  g.fillStyle = gs; g.fillRect(-60, PIES - 6, W + 120, H + 66 - PIES);
  g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(-60, PIES - 6, W + 120, 2);
  return c;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(980, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff3d84");
  txt(g, "¡CONCIERTO!", 490, 158, { tam: 136, peso: 900, fam: FD, color: "#2a0418", esp: 6, max: 940 });
  txt(g, "¡CONCIERTO!", 490, 150, { tam: 136, peso: 900, fam: FD, color: gr, borde: "#2a0418", bordeAncho: 11, esp: 6, glow: "rgba(255,61,132,.85)", glowTam: 28, max: 940 });
  cache.set("t", c);
  return c;
}

class Grupo extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(480);
    this.fondo = null;
    this.golpes = { D: -1, I: -1 }; this.sacude = { JD: 0, JI: 0, PLATO: 0, BOMBO: 0 };
  }
  luz(t) { return (t < T_LUZ ? 0 : 1) * (1 - tramo(t, 9.0, 9.75)); }
  salto(t) {
    const ag = eInOut(tramo(t, 6.4, T_SALTA)) * (1 - tramo(t, T_SALTA, T_SALTA + 0.05));
    let y = 0;
    if (t > T_SALTA && t < T_FIN) { const u = (t - T_SALTA) / (T_FIN - T_SALTA); y = -4 * 95 * u * (1 - u); }
    const at = t > T_FIN ? Math.sin(tramo(t, T_FIN, T_FIN + 0.25) * Math.PI) : 0;
    return { y, sy: 1 - 0.12 * ag - 0.12 * at + (t > T_SALTA && t < T_FIN ? 0.05 : 0), aire: t > T_SALTA && t < T_FIN };
  }
  /** Una mano de la batería: punto (unidades) y ángulo de la baqueta. lado: "D" (derecha) o "I". */
  manoBateria(t, lado) {
    const off = lado === "D" ? 1.0 : 1.2;
    const per = t > T_ROLL && t < 6.42 ? 0.1 : PER;
    const base = t > T_ROLL ? T_ROLL + (lado === "D" ? 0 : 0.05) : off;
    const f = (t - base) / per, k = f - Math.floor(f), n = Math.round(f);
    let blanco = lado === "D" ? JD : (n % 4 === 3 ? PLATO : JI);
    if (t > T_ROLL) blanco = lado === "D" ? JD : JI;
    const top = [blanco[0], blanco[1] - (blanco === PLATO ? 6 : 34)];
    const T = aU(XG, top), s = lado === "D" ? 1 : -1;
    const hit = [T[0] - 12 * s, T[1] - 28], arriba = [T[0] - 2 * s, T[1] - (t > T_ROLL ? 42 : 66)];
    const h = 0.5 - 0.5 * Math.cos(2 * Math.PI * k);
    const angHit = Math.atan2(T[1] - hit[1], T[0] - hit[0]), angUp = lado === "D" ? -0.6 : -2.55;
    return { m: mezcla(hit, arriba, h), ang: lerp(angHit, angUp, h), idx: Math.floor(f), blanco };
  }
  estado(t) {
    const G = { cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const R = { quien: "rodrigo", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const s = this.salto(t);
    let angD = -0.9, angI = -2.2;
    // cuenta con las baquetas por encima de la cabeza
    if (t < T_LUZ) {
      let c = 0; for (const tc of CUENTA) c = Math.max(c, Math.max(0, 1 - Math.abs(t - tc) / 0.08));
      G.manoD = [62, 6 + 4 * c]; G.manoI = [16, 6 + 4 * c]; angD = -2.0 + 0.5 * c; angI = -1.14 - 0.5 * c;
      G.cara = "guino"; G.rc = 0.04 * Math.sin(t * 25);
    } else if (t < 6.42) {
      const d = this.manoBateria(t, "D"), i = this.manoBateria(t, "I");
      G.manoD = d.m; angD = d.ang; G.manoI = i.m; angI = i.ang;
      G.cara = Math.floor(t / 0.8) % 2 ? "risa" : "guino"; G.rc = 0.08 * Math.sin(t * 7.85);
      if (t > 4.4 && t < 5.25) { // molinete con la baqueta izquierda
        const k = eInOut(tramo(t, 4.4, 4.6)) * (1 - eInOut(tramo(t, 5.05, 5.25)));
        G.manoI = mezcla(i.m, [-20, 30], k); if (k > 0.5) angI = t * 24; G.cara = "guino";
      }
      if (t > T_ROLL) { G.cara = "sorpresa"; G.rc = 0.16; }
    } else {
      // salto con las baquetas arriba y golpe final
      const k = eOut(tramo(t, 6.42, 6.6));
      G.manoD = mezcla([80, 110], [96, 20], k); G.manoI = mezcla([0, 110], [-18, 20], k); angD = -1.2; angI = -1.9;
      G.cara = "risa"; G.rc = 0.12 * (1 - k);
      if (t > T_FIN - 0.12 && t < T_FIN + 0.4) { const kk = eIn(tramo(t, T_FIN - 0.12, T_FIN)) * (1 - tramo(t, T_FIN + 0.15, T_FIN + 0.4)); G.manoD = mezcla(G.manoD, [84, 112], kk); G.manoI = mezcla(G.manoI, [-6, 112], kk); angD = lerp(-1.2, 1.0, kk); angI = lerp(-1.9, 2.1, kk); }
      if (t > T_FIN + 0.4) { G.manoD = [96, 16 + 4 * Math.sin(t * 8)]; G.manoI = [-18, 16 - 4 * Math.sin(t * 8)]; G.cara = "risa"; G.puntas = 0.7 * (1 - tramo(t, 8.4, 9.0)); }
    }
    G.objD2 = (g, m) => baqueta(g, m, angD);
    G.objI2 = (g, m) => baqueta(g, m, angI);
    // Rodrigo y la guitarra
    const rasg = t > T_LUZ && t < 6.42 ? Math.sin(t * 26) : 0;
    R.manoI = [28 + 4 * rasg, 140 + 9 * rasg];
    let traste = 0.5 + 0.5 * Math.sin(t * 2.3);
    let giroR = 0;
    if (t < T_LUZ) { R.cara = "guino"; R.rc = -0.1; }
    else {
      R.cara = Math.floor(t / 0.4) % 2 ? "dormido" : "risa"; R.rc = 0.1 * Math.sin(t * 15.7) * (t > 2.0 && t < 3.2 ? 1.6 : 1);
      if (t > 2.0 && t < 3.2) { R.cara = "dormido"; R.puntas = 0.5; }
    }
    if (t > 3.2 && t < 4.4) { // solo
      const k = eInOut(tramo(t, 3.2, 3.45)) * (1 - eInOut(tramo(t, 4.15, 4.4)));
      giroR = 0.13 * k; traste = 0.5 + 0.5 * Math.sin(t * 13); R.cara = "sorpresa"; R.puntas = 0.8 * k; R.rc = 0.1 * k;
    }
    const nx = lerp(46, 64, traste), cn = Math.cos(-0.5), sn = Math.sin(-0.5);
    R.manoD = [34 + nx * cn + 1, 140 + nx * sn + 4];
    if (t > T_ROLL && t < 6.42) { R.cara = "sorpresa"; R.rc = -0.16; }
    if (t >= 6.42) { R.cara = "risa"; R.rc = 0; R.manoI = [24, 128]; if (t > T_FIN + 0.4) { R.puntas = 0.7 * (1 - tramo(t, 8.4, 9.0)); giroR = 0.05 * Math.sin(t * 6); } }
    R.objI = (g) => guitarra(g, t);
    if (s.aire) { G.piernaI = [0, 0.1]; G.piernaD = [0, -0.1]; R.piernaI = [0, 0.16]; R.piernaD = [0, -0.16]; }
    return { G, R, mG: matAv(XG, PIES + s.y, ESC, 0, 1, s.sy), mR: matAv(XR, PIES + s.y, ESC, giroR, 1, s.sy), s };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const k in this.sacude) this.sacude[k] = Math.max(0, this.sacude[k] - dt * 3);
    CUENTA.forEach((tc, i) => this.una("c" + i, t > tc, () => {
      const q = aPant(this.estado(t).mG, [39, 0]);
      p.nueva(P.DESTELLO, q[0], q[1] - 20, 0, 0, 0.18, 60);
    }));
    this.una("luz", t > T_LUZ, () => {
      temblar(22, 0.5);
      for (let i = 0; i < 22; i++) p.nueva(P.HUMO, azar(60, 960), PIES - azar(0, 30), azar(-120, 120), azar(-40, -5), azar(1.2, 2.0), azar(50, 80));
      for (let i = 0; i < 30; i++) { const a = azar(-Math.PI, 0), v = azar(300, 800); p.nueva(P.CHISPA, 512, PIES, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(8, 15)); }
    });
    // golpes de la batería
    if (t > T_LUZ && t < 6.42) {
      for (const lado of ["D", "I"]) {
        const b = this.manoBateria(t, lado);
        if (b.idx > this.golpes[lado] && t > (lado === "D" ? 1.0 : 1.2)) {
          this.golpes[lado] = b.idx;
          const clave = b.blanco === JD ? "JD" : b.blanco === JI ? "JI" : "PLATO";
          this.sacude[clave] = 1; this.sacude.BOMBO = 0.7;
          if (clave === "PLATO") { for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, PLATO[0] + azar(-30, 30), PLATO[1], azar(-200, 200), azar(-300, -80), azar(0.3, 0.6), azar(6, 10)); temblar(3, 0.1); }
          else { for (let i = 0; i < 3; i++) p.nueva(P.GOTA, b.blanco[0] + azar(-10, 10), b.blanco[1] - 32, azar(-90, 90), azar(-320, -140), 0.7, azar(2.5, 4)); p.nueva(P.ESPUMA, b.blanco[0], b.blanco[1] - 34, azar(-40, 40), azar(-160, -60), 0.4, azar(3, 6)); }
        }
      }
    }
    if (t > T_LUZ && t < 9 && Math.random() < 6 * dt) p.nueva(P.HUMO, azar(40, 980), PIES - azar(0, 20), azar(-40, 40), azar(-20, -5), azar(1.4, 2.0), azar(50, 80));
    // solo de guitarra: chispas
    if (t > 3.3 && t < 4.3 && Math.random() < 40 * dt) {
      const q = aPant(this.estado(t).mR, [30, 142]);
      const a = azar(-2.6, -0.4), v = azar(200, 520); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11));
    }
    // llamaradas
    if (t > 5.2 && t < 6.0) for (const x of [70, 954]) for (let i = 0; i < 3; i++) p.nueva(P.LLAMA, x + azar(-14, 14), PIES - 10, azar(-20, 20), azar(-650, -380), azar(0.35, 0.6), azar(40, 70), Math.random() < 0.4 ? 1 : 0);
    this.una("llamas", t > 5.2, () => temblar(10, 0.3));
    this.una("fin", t > T_FIN, () => {
      temblar(32, 0.8); this.sacude.BOMBO = 1; this.sacude.JD = 1; this.sacude.JI = 1; this.sacude.PLATO = 1;
      p.nueva(P.DESTELLO, 512, 330, 0, 0, 0.5, 520);
      for (let i = 0; i < 50; i++) { const a = azar(0, 6.283), v = azar(300, 900); p.nueva(P.CHISPA, 512, 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1.0), azar(9, 17)); }
      for (let i = 0; i < 100; i++) p.nueva(P.CONFETI, azar(40, 980), azar(-80, -10), azar(-60, 60), azar(60, 200), azar(2.4, 3.0), azar(9, 15), i % 5);
      for (const x of [70, 954]) for (let i = 0; i < 14; i++) p.nueva(P.LLAMA, x + azar(-16, 16), PIES - 10, azar(-30, 30), azar(-800, -450), azar(0.4, 0.7), azar(50, 80), 1);
    });
    p.suelo = () => PIES - 2;
    p.alfa = 1 - tramo(t, 9.0, 9.7);
    p.actualizar(dt);
  }
  haces(g, t, luz) {
    if (luz <= 0) return;
    const cols = ["255,61,132", "47,227,232", "255,211,77", "43,255,91", "255,61,132"];
    const flash = t > T_ROLL && t < T_FIN ? (Math.sin(t * 60) > 0 ? 1 : 0.4) : 1;
    g.save(); g.globalCompositeOperation = "lighter";
    [110, 310, 512, 714, 914].forEach((x0, i) => {
      const a = Math.sin(t * (1.3 + i * 0.17) + i * 1.9) * 0.55, L = 720;
      const x1 = x0 + Math.sin(a) * L, y1 = 24 + Math.cos(a) * L;
      const gr = g.createLinearGradient(x0, 24, x1, y1);
      gr.addColorStop(0, `rgba(${cols[i]},${0.42 * luz * flash})`); gr.addColorStop(1, `rgba(${cols[i]},0)`);
      const px = Math.cos(a) * 46, py = -Math.sin(a) * 46;
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - 6, 24); g.lineTo(x0 + 6, 24); g.lineTo(x1 + px, y1 + py); g.lineTo(x1 - px, y1 - py); g.closePath(); g.fill();
      g.globalAlpha = luz * flash; g.drawImage(BLOB.blanco, x0 - 14, 14, 28, 28); g.globalAlpha = 1;
    });
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t);
    fondo(g, "#000");
    if (!this.fondo) this.fondo = fondoEscenario();
    g.save(); g.globalAlpha = luz; g.drawImage(this.fondo, -60, -60); g.restore();
    this.haces(g, t, luz);
    // al principio, solo una luz tenue sobre Guillermo
    if (t < T_LUZ) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * tramo(t, 0.02, 0.12);
      g.drawImage(BLOB2.oroClaro, XG - 170, 120, 340, 300); g.restore();
    }
    // la batería: platillo y jarras por detrás (así las baquetas se ven delante), bombo delante de las piernas
    const s = this.sacude;
    if (t >= T_LUZ - 0.02) {
      plato(g, PLATO[0], PLATO[1], s.PLATO);
      jarraBateria(g, JI[0], JI[1], s.JI, t); jarraBateria(g, JD[0], JD[1], s.JD, t);
      pintarAvatar(g, e.mG, e.G, t);
      bombo(g, BOMBO[0], BOMBO[1], s.BOMBO);
      pintarAvatar(g, e.mR, e.R, t);
    } else {
      // a oscuras: se ven las siluetas iluminadas por la lucecita
      g.save(); g.globalAlpha = Math.min(1, tramo(t, 0.02, 0.12)) * 0.95;
      pintarAvatar(g, e.mG, e.G, t);
      g.globalAlpha *= 0.35; pintarAvatar(g, e.mR, e.R, t);
      g.restore();
    }
    this.p.dibujar(g);
    // 1, 2, 3, 4
    CUENTA.forEach((tc, i) => {
      const d = t - tc;
      if (d > 0 && d < 0.3) {
        const q = aPant(e.mG, [39, -20]);
        g.save(); g.translate(q[0] + (i - 1.5) * 50, q[1] - 30); const k = eBack(tramo(d, 0, 0.1)); g.scale(k, k);
        txt(g, i === 3 ? "¡4!" : String(i + 1), 0, 0, { tam: 54, peso: 400, fam: FC, color: "#fffdf5", borde: "#2a0418", bordeAncho: 8, alfa: 1 - tramo(d, 0.2, 0.3) });
        g.restore();
      }
    });
    // ¡CONCIERTO!
    if (t > T_FIN + 0.02) {
      const d = t - T_FIN - 0.02, k = tramo(d, 0, 0.2), sc = lerp(2.4, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 9.1, 9.7)); g.translate(512, 112); g.rotate(-0.04); g.scale(sc, sc);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const df = t - T_FIN;
    if (df > 0 && df < 0.25) { g.fillStyle = `rgba(255,250,235,${0.75 * (1 - df / 0.25)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const dl = t - T_LUZ;
    if (dl > 0 && dl < 0.2) { g.fillStyle = `rgba(255,250,235,${0.6 * (1 - dl / 0.2)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const a = t < T_LUZ ? 0 : 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00126", nombre: "El grupo", crear: () => new Grupo() });
})();
