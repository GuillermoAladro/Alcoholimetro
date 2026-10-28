"use strict";
/*
 * 00023 · CIEN METROS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden los focos del estadio de uno en uno. Agachado en los tacos espera al semáforo de salida (rojo, ámbar,
 * verde) y sale disparado: la cámara le sigue con líneas de velocidad y las marcas de los metros pasando. En el
 * avituallamiento de los 50 m se lleva una caña sin parar y rompe la cinta de meta con ella en la mano: el cronómetro
 * se para en 9,99. ¡RÉCORD! Brinda, se la bebe y se va corriendo.
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

const X0 = 200;               // salida (mundo)
const V = 900;                // velocidad punta (px/s)
const T_VERDE = 2.6, T_LANZA = 3.1, T_META = 5.9;
const XL = 425;               // donde se queda en pantalla mientras la cámara le sigue
const META = XL + V * (T_META - T_LANZA);
const PM = (META - X0) / 100; // píxeles por metro
const AVIT = X0 + 50 * PM;    // avituallamiento a los 50 m
const FRENA = 1500;

class EscenaCien extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(450);
    this.p.suelo = () => PIES;
    this.ESC = 1.45;
    this.lineas = [];
    this.cinta = null; this.tCoge = T_LANZA + (AVIT - 40 - XL) / V;
  }
  xMundo(t) {
    if (t < T_VERDE) return X0;
    if (t < T_LANZA) { const s = t - T_VERDE, a = V / (T_LANZA - T_VERDE); return X0 + 0.5 * a * s * s; }
    if (t < T_META) return XL + V * (t - T_LANZA);
    const s = Math.min(t - T_META, V / FRENA);
    let x = META + V * s - 0.5 * FRENA * s * s;
    if (t > 8.75) x += 0.5 * 4000 * (t - 8.75) * (t - 8.75); // se va corriendo
    return x;
  }
  camX(t) { return clamp(this.xMundo(Math.min(t, T_META)) - XL, 0, META - XL); }
  focos() { const t = this.t; return [0, 1, 2, 3, 4, 5].map((i) => (t > 0.15 + i * 0.1 ? 1 : 0) * (1 - tramo(t, 9.25, 9.75))); }
  luz() { const f = this.focos(); return f.reduce((a, b) => a + b, 0) / f.length; }
  semaforo() {
    const t = this.t;
    return { rojo: t > 1.2 && t < T_VERDE, ambar: t > 1.9 && t < T_VERDE, verde: t >= T_VERDE };
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sy = 1, y = PIES, D = 0;
    const xs = this.xMundo(t) - this.camX(t);
    // preparado en los tacos: agachado, manos en las rodillas
    const kPrep = 1 - eOut(tramo(t, T_VERDE, T_VERDE + 0.25));
    if (kPrep > 0) {
      D = 26 * kPrep;
      pose.piernaI = [-D, 0.24 * kPrep]; pose.piernaD = [-D, -0.24 * kPrep];
      sy = 1 - 0.07 * kPrep;
      manoD = mezcla(manoD, [86, 150], kPrep); manoI = mezcla(manoI, [-8, 150], kPrep);
      pose.cara = t < 1.2 ? "guino" : t < 1.9 ? "sonrisa" : "sorpresa";
      pose.rc = t > 1.0 && t < 2.5 ? -0.12 * eInOut(tramo(t, 1.0, 1.2)) : 0;
      if (t > 1.9 && t < T_VERDE) { manoD[0] += azar(-0.8, 0.8); manoI[0] += azar(-0.8, 0.8); }
    }
    // corre
    const corre = t > T_VERDE && t < T_META + V / FRENA;
    if (t > T_VERDE) {
      const kC = tramo(t, T_VERDE, T_VERDE + 0.2) * (1 - tramo(t, T_META + 0.25, T_META + V / FRENA));
      const f = this.fase || 0, a = andar(f, 1.9 * kC);
      pose.piernaI = [pose.piernaI[0] + a.piernaI[0], pose.piernaI[1] + a.piernaI[1] * 1.6];
      pose.piernaD = [pose.piernaD[0] + a.piernaD[0], pose.piernaD[1] + a.piernaD[1] * 1.6];
      y += a.bote * 1.2;
      const s = Math.sin(f);
      manoD = mezcla(manoD, [84 + 10 * s, 122 - 26 * s], kC);
      manoI = mezcla(manoI, [-6 - 10 * s, 122 + 26 * s], kC);
      pose.cara = "risa";
      pose.puntas = 0.35 * kC;
      pose.rc = 0.04 * Math.sin(f * 0.5);
    }
    if (t > this.tCoge - 0.1 && t < this.tCoge + 0.3) pose.cara = "sorpresa";
    // después de la meta: brinda, bebe y guiña
    if (t > T_META + 0.5 && t < 8.75) {
      const k = eInOut(tramo(t, T_META + 0.5, T_META + 0.8));
      manoD = mezcla(manoD, [104, 26], k);
      pose.cara = "risa";
      if (t > 6.9) {
        const kB = eInOut(tramo(t, 6.9, 7.2)) * (1 - eInOut(tramo(t, 8.0, 8.3)));
        const kT = eInOut(tramo(t, 7.2, 7.9)) * (1 - eInOut(tramo(t, 8.0, 8.3)));
        pose.rc = -0.34 * kT;
        const inc = -0.5 * kB - 0.75 * kT;
        if (kB > 0) {
          const b = boca(pose.rc), tope = rot2([17, -18], inc);
          manoD = mezcla(manoD, [b[0] - tope[0] - 2, b[1] - tope[1] + 4], kB);
        }
        this._inc = inc; this._nivel = 1 - 0.85 * tramo(t, 7.3, 7.95);
        pose.cara = kT > 0.3 ? "dormido" : "risa";
      }
      if (t > 8.3) pose.cara = "guino";
    }
    if (t >= 8.75) { pose.cara = "risa"; const a = andar(this.fase || 0, 1.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; }
    if (t > this.tCoge) pose.jarra = { inc: t > 6.9 && t < 8.3 ? this._inc || 0 : 0.12 * Math.sin((this.fase || 0) * 1) * (corre ? 1 : 0), nivel: t > 7.3 ? this._nivel : 1 };
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(xs, y + D * ESC, ESC, 0, 1, sy);
    return { pose, m, xs, corre };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const vel = t < T_VERDE ? 0 : t < T_META + V / FRENA ? Math.max(0.35, Math.min(1, (t - T_VERDE) * 3)) : t > 8.75 ? 1.2 : 0;
    this.fase = (this.fase || 0) + dt * 22 * vel;
    const e = this.estado(), cam = this.camX(t);
    this.una("verde", t > T_VERDE, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 30; i++) p.nueva(P.POLVO, X0 + azar(-20, 30), PIES - azar(0, 10), azar(-500, -60), azar(-120, -10), azar(0.6, 1.2), azar(26, 50));
    });
    for (const k of ["rojo", "ambar"]) this.una(k, t > (k === "rojo" ? 1.2 : 1.9), () => temblar(3, 0.1));
    // líneas de velocidad
    if (e.corre && t > 2.9 && Math.random() < 40 * dt) this.lineas.push({ x: W + azar(0, 200), y: azar(60, PIES - 20), l: azar(120, 320), v: azar(1800, 2800) });
    for (const L of this.lineas) L.x -= L.v * dt;
    this.lineas = this.lineas.filter((L) => L.x + L.l > -50);
    if (e.corre && t > 2.9 && Math.random() < 30 * dt) p.nueva(P.POLVO, e.xs - 30, PIES - 4, azar(-600, -300), azar(-60, -10), azar(0.3, 0.6), azar(16, 30));
    // coge la caña del avituallamiento
    this.una("coge", t > this.tCoge, () => {
      temblar(5, 0.15);
      const q = aPant(e.m, [76, 150]);
      for (let i = 0; i < 12; i++) p.nueva(P.ESPUMA, q[0], q[1] - 20, azar(-260, 60), azar(-220, -60), azar(0.4, 0.7), azar(4, 8));
      p.nueva(P.DESTELLO, q[0] + 10, q[1] - 10, 0, 0, 0.25, 70);
    });
    if (e.corre && t > this.tCoge && Math.random() < 14 * dt) { const q = aPant(e.m, [86, 140]); p.nueva(P.ESPUMA, q[0], q[1] - 20, azar(-420, -200), azar(-120, -20), azar(0.3, 0.6), azar(3, 6)); }
    // rompe la cinta
    this.una("meta", t > T_META, () => {
      temblar(22, 0.5);
      this.cinta = { t0: t };
      for (let i = 0; i < 12; i++) p.nueva(P.DESTELLO, azar(40, W - 40), azar(150, 380), 0, 0, azar(0.15, 0.3), azar(60, 110));
    });
    // flashes de los fotógrafos
    if (t > T_META && t < 8.7 && Math.random() < 7 * dt) p.nueva(P.DESTELLO, azar(30, W - 30), azar(170, 330), 0, 0, azar(0.12, 0.22), azar(50, 90));
    this.una("record", t > 6.35, () => {
      temblar(16, 0.35);
      for (let i = 0; i < 120; i++) p.nueva(P.CONFETI, azar(0, W), azar(-200, -10), azar(-60, 60), azar(20, 120), azar(4, 6), azar(8, 14), (Math.random() * 5) | 0);
    });
    this.una("sale", t > 8.75, () => { for (let i = 0; i < 20; i++) p.nueva(P.POLVO, e.xs - 20, PIES - 4, azar(-400, -60), azar(-80, -5), azar(0.5, 1), azar(24, 44)); });
    p.alfa = this.luz();
    p.actualizar(dt);
    this._cam = cam;
  }
  estadio(g, cam, focos) {
    // gradas al fondo con público (paralaje): se pintan una vez en un lienzo y se copian
    if (!this.gradas) {
      const c = lienzoNuevo(1200, 270), q = c.getContext("2d");
      q.fillStyle = "#101219"; q.fillRect(0, 0, 1200, 270);
      q.fillStyle = "#171a24";
      for (let r = 0; r < 4; r++) q.fillRect(0, 30 + r * 58, 1200, 30);
      const rnd = semilla(7), cols = ["#ff3d84", "#2fe3e8", "#ffd34d", "#fffdf5", "#2bff5b", "#b98cff"];
      for (let r = 0; r < 4; r++) for (let i = 0; i < 46; i++) {
        const x = i * 26 + rnd() * 10 + (r % 2) * 13, y = 22 + r * 58 + rnd() * 6;
        q.fillStyle = "#262a36"; q.beginPath(); q.ellipse(x, y + 16, 10, 9, 0, Math.PI, 0); q.fill();
        q.fillStyle = cols[(i * 7 + r * 3) % cols.length]; q.globalAlpha = 0.6;
        q.beginPath(); q.ellipse(x, y + 18, 9, 7, 0, Math.PI, 0); q.fill();
        q.globalAlpha = 1; q.fillStyle = "#3b3330"; q.beginPath(); q.arc(x, y + 2, 6.5, 0, 6.283); q.fill();
      }
      this.gradas = c;
    }
    const off = ((cam * 0.35) % 1200 + 1200) % 1200, bote = this.t > T_META ? 3 * Math.abs(Math.sin(this.t * 8)) : 0;
    g.drawImage(this.gradas, -off, 170 - bote); g.drawImage(this.gradas, 1200 - off, 170 - bote);
    // valla publicitaria
    g.fillStyle = "#1b2a52"; g.fillRect(-60, 418, W + 120, 34);
    for (let i = -1; i < 6; i++) {
      const x = i * 260 - ((cam * 1.0) % 260);
      txt(g, i % 2 ? "ALCOHOLÍMETRO" : "TOP 10", x + 130, 443, { tam: 20, peso: 900, fam: FD, color: i % 2 ? "#2bff5b" : "#ffd34d", esp: 3 });
    }
    // focos del estadio arriba
    for (let i = 0; i < 6; i++) {
      const x = 90 + i * 170, a = focos[i];
      g.fillStyle = "#2a2e35"; g.fillRect(x - 3, 70, 6, 100);
      g.fillStyle = a ? "#fffbe8" : "#30343b"; rectR(g, x - 34, 44, 68, 30, 5); g.fill();
      if (a) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha *= 0.7; g.drawImage(BLOB.blanco, x - 80, 10, 160, 100); g.restore(); }
    }
  }
  pista(g, cam) {
    const gr = g.createLinearGradient(0, 452, 0, H);
    gr.addColorStop(0, "#7a2416"); gr.addColorStop(1, "#c8462a");
    g.fillStyle = gr; g.fillRect(-60, 452, W + 120, H - 452 + 60);
    g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 3;
    for (const y of [470, 512, 590]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    // marcas de metros
    for (let mtr = 10; mtr < 100; mtr += 10) {
      const x = X0 + mtr * PM - cam;
      if (x < -80 || x > W + 80) continue;
      g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x + 10, 456); g.lineTo(x - 14, H + 10); g.stroke();
      g.fillStyle = "#fffdf5"; rectR(g, x - 26, 380, 52, 34, 5); g.fill();
      txt(g, mtr + " m", x, 405, { tam: 22, peso: 900, fam: FD, color: "#7a2416" });
      g.fillStyle = "#fffdf5"; g.fillRect(x - 2, 414, 4, 40);
    }
    // salida y meta
    for (const [wx, col] of [[X0 + 50, "#fffdf5"], [META, "#fffdf5"]]) {
      const x = wx - cam;
      if (x < -80 || x > W + 80) continue;
      g.fillStyle = col;
      g.beginPath(); g.moveTo(x + 6, 456); g.lineTo(x + 16, 456); g.lineTo(x - 6, H + 10); g.lineTo(x - 18, H + 10); g.closePath(); g.fill();
    }
    // cuadros de meta
    const xm = META - cam;
    if (xm > -80 && xm < W + 80) {
      for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? "#111" : "#fffdf5"; g.fillRect(xm + 18 + j * 12 - i * 3.6, 456 + i * 24, 12, 24); }
    }
  }
  tacos(g, cam) {
    const x = X0 - cam;
    if (x < -100) return;
    for (const [dx, dy] of [[-30, 0], [22, 8]]) {
      g.fillStyle = "#8a939c"; g.beginPath(); g.moveTo(x + dx - 18, PIES + dy + 4); g.lineTo(x + dx + 12, PIES + dy + 4); g.lineTo(x + dx + 12, PIES + dy - 18); g.closePath(); g.fill();
      g.fillStyle = "#c9d0d6"; g.fillRect(x + dx - 22, PIES + dy + 2, 40, 5);
    }
  }
  semaforoDibujo(g, cam) {
    const x = 380 - cam;
    if (x < -100) return;
    const S = this.semaforo(), y = 150;
    g.fillStyle = "#23262c"; g.fillRect(x - 5, y + 90, 10, PIES - y - 90);
    g.fillStyle = "#121418"; rectR(g, x - 40, y - 100, 80, 200, 16); g.fill();
    g.strokeStyle = "#3c414a"; g.lineWidth = 4; g.stroke();
    const luces = [["rojo", "#ff3030", "#4a1010", BLOB.rojo], ["ambar", "#ffb21a", "#4a3410", BLOB.naranja], ["verde", "#2bff5b", "#0f3a1a", BLOB.verde]];
    luces.forEach(([k, on, off, bl], i) => {
      const cy = y - 62 + i * 62;
      g.fillStyle = "#050607"; g.beginPath(); g.arc(x, cy, 25, 0, 6.283); g.fill();
      g.fillStyle = S[k] ? on : off; g.beginPath(); g.arc(x, cy, 21, 0, 6.283); g.fill();
      if (S[k]) {
        g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(x - 7, cy - 7, 6, 0, 6.283); g.fill();
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha *= 0.9; g.drawImage(bl, x - 70, cy - 70, 140, 140); g.restore();
      }
    });
  }
  avituallamiento(g, cam, t) {
    const x = AVIT - cam;
    if (x < -150 || x > W + 150) return;
    g.fillStyle = "#3a2a1c"; g.fillRect(x - 5, 420, 10, 40);
    g.fillStyle = "#f4f0e6"; rectR(g, x - 50, 404, 100, 20, 4); g.fill();
    g.fillStyle = "#c33"; g.fillRect(x - 50, 418, 100, 4);
    g.fillStyle = "#2a2e35"; g.fillRect(x - 3, 300, 6, 104);
    g.fillStyle = "#ffd34d"; rectR(g, x - 78, 276, 156, 32, 6); g.fill();
    txt(g, "AVITUALLAMIENTO", x, 298, { tam: 15, peso: 900, fam: FD, color: "#3a2400", esp: 1.5 });
    // la caña (hasta que se la lleva)
    if (t < this.tCoge) { g.save(); g.translate(x - 22, 386); g.scale(1.45, 1.45); dibujarJarra(g, [0, 0], 0, 1, "asa", t); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t); g.restore(); }
  }
  cintaDibujo(g, cam, t) {
    const x = META - cam;
    if (x < -150 || x > W + 150) return;
    const atras = [x + 30, 360], delante = [x - 30, 560];
    g.fillStyle = "#e9edf0"; g.fillRect(atras[0] - 3, atras[1], 6, 456 - atras[1]);
    const rib = (a, b, ond) => {
      g.strokeStyle = "#ff3030"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(a[0], a[1]);
      g.quadraticCurveTo((a[0] + b[0]) / 2 + ond, (a[1] + b[1]) / 2 + 10, b[0], b[1]); g.stroke();
      g.strokeStyle = "#fffdf5"; g.lineWidth = 2; g.stroke();
    };
    if (!this.cinta) rib([atras[0], atras[1] + 40], [delante[0], delante[1] - 110], 0);
    else {
      const s = t - this.cinta.t0, k = eOut(tramo(s, 0, 0.6));
      rib([atras[0], atras[1] + 40], [atras[0] + 60 + 30 * Math.sin(s * 9) * (1 - k), atras[1] + 40 + 90 * k], 10 * Math.sin(s * 14));
      rib([delante[0], delante[1] - 110], [delante[0] + 70 + 20 * Math.sin(s * 11) * (1 - k), delante[1] - 110 + 100 * k], 10 * Math.sin(s * 12));
    }
    this._postDelante = delante;
  }
  cronometro(g, t) {
    const v = t < T_VERDE ? 0 : Math.min(9.99, (t - T_VERDE) * (9.99 / (T_META - T_VERDE)));
    const fin = t >= T_META;
    const x = 860, y = 66;
    g.fillStyle = "#0b0c0f"; rectR(g, x - 130, y - 44, 260, 96, 12); g.fill();
    g.strokeStyle = fin ? "#ffd34d" : "#3c414a"; g.lineWidth = 4; g.stroke();
    txt(g, "TIEMPO", x, y - 20, { tam: 14, peso: 800, color: "rgba(255,253,245,.6)", esp: 4 });
    const parp = fin && t < 7.0 ? (Math.sin(t * 24) > -0.2 ? 1 : 0.35) : 1;
    // cifra a cifra (cada carácter se pinta una vez con su brillo y se copia)
    const s = fmt(v), paso = (ch) => (ch === "," ? 16 : 34);
    let ancho = 0; for (const ch of s) ancho += paso(ch);
    let cx = x - ancho / 2;
    for (const ch of s) {
      const c = cartel((fin ? "o" : "v") + ch, ch, { tam: 60, peso: 900, fam: FD, color: fin ? "#ffd34d" : "#2bff5b", glow: fin ? "rgba(255,180,30,.9)" : "rgba(43,255,91,.8)", glowTam: 14 });
      ponCartel(g, c, cx + paso(ch) / 2, y + 22, 1, parp);
      cx += paso(ch);
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), cam = this.camX(t), fo = this.focos(), luz = this.luz();
    fondo(g, "#000");
    g.save(); g.globalAlpha = luz;
    this.estadio(g, cam, fo);
    this.pista(g, cam);
    this.semaforoDibujo(g, cam);
    this.avituallamiento(g, cam, t);
    this.tacos(g, cam);
    this.cintaDibujo(g, cam, t);
    // líneas de velocidad (detrás)
    g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2.5;
    for (const L of this.lineas) { g.beginPath(); g.moveTo(L.x, L.y); g.lineTo(L.x + L.l, L.y); g.stroke(); }
    g.restore();
    g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(e.xs, PIES - 1, 60, 8, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    // poste delantero de la meta
    if (this._postDelante) { const d = this._postDelante; if (d[0] > -40 && d[0] < W + 40) { g.fillStyle = "#e9edf0"; g.fillRect(d[0] - 3.5, d[1] - 120, 7, 130); } }
    g.restore();
    this.p.dibujar(g);
    g.save(); g.globalAlpha = luz;
    this.cronometro(g, t);
    g.restore();
    // ¡RÉCORD!
    if (t > 6.3) {
      const k = tramo(t, 6.3, 6.48), a = Math.min(1, k * 3) * (1 - tramo(t, 9.2, 9.6));
      const c = cartel("record", "¡RÉCORD!", {
        tam: 140, peso: 900, fam: FD, borde: "#3a1d00", bordeAncho: 12, esp: 4, glow: "rgba(255,180,30,.8)", glowTam: 26,
        color: (gg, cv) => { const gr = gg.createLinearGradient(0, cv.height * 0.2, 0, cv.height * 0.8); gr.addColorStop(0, "#fff9c8"); gr.addColorStop(0.55, "#ffcf2e"); gr.addColorStop(1, "#ff8a00"); return gr; },
      });
      ponCartel(g, c, 400, 190, lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(t * 9)), a, -0.05);
    }
  }
}

registrar({ id: "00023", nombre: "Cien metros", crear: () => new EscenaCien() });
})();
