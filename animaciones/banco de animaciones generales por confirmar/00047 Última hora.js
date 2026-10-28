"use strict";
/*
 * 00047 · ÚLTIMA HORA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Una cortinilla roja abre el plató de noticias. De presentador con corbata, ordena los papeles; le hablan por el
 * pinganillo (¿¡QUÉ!?) y estalla el rótulo ÚLTIMA HORA. En la pantalla de detrás sale la foto del récord del bar y la
 * tasa contando hasta el valor real (datos.top[0]); abajo, el rótulo y una cinta que pasa con el récord. Tira los
 * papeles al aire: ¡HISTÓRICO! La cortinilla cierra a negro.
 */
(() => {
const X = 330, ESC = 1.5, MESA = 438;
const T_PINGA = 2.0, T_BOMBA = 2.65, T_BAJA = 3.45, T_CUENTA = 3.8, T_TIRA = 6.6;
const PAN = { x: 560, y: 70, w: 420, h: 280 }; // pantalla del plató

class UltimaHora extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(300);
    this.fondo = pintarPlato();
    this.mesa = pintarMesa();
    this.hojas = [];
    this.flash = 0;
  }
  record() {
    const r = datos.top && datos.top[0];
    return r ? { valor: r.valor, cara: r.cara, fecha: r.fecha } : { valor: 0, cara: "risa", fecha: "" };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [62, 136], manoI = [16, 136], papeles = true, dy = 0;
    // ordena los papeles golpeándolos contra la mesa
    if (t < T_PINGA) {
      const toc = Math.max(0, Math.sin(t * 9)) * tramo(t, 0.7, 0.9) * (1 - tramo(t, 1.7, 1.9));
      manoD = [62, 134 - 10 * toc]; manoI = [16, 134 - 10 * toc];
      pose.cara = t > 1.2 && t < 1.6 ? "guino" : "sonrisa";
      pose.rc = 0.03 * Math.sin(t * 2);
    }
    // el pinganillo
    if (t >= T_PINGA && t < T_BOMBA) {
      const k = eInOut(tramo(t, T_PINGA, T_PINGA + 0.2));
      manoI = mezcla([16, 136], [8, 50], k);
      manoD = [62, 136];
      pose.cara = t > T_PINGA + 0.2 ? "sorpresa" : "sonrisa";
      pose.rc = -0.08 * k;
    }
    // ¡bomba!
    if (t >= T_BOMBA && t < T_TIRA) {
      const k = eOut(tramo(t, T_BOMBA, T_BOMBA + 0.15));
      dy = -16 * Math.sin(Math.PI * tramo(t, T_BOMBA, T_BOMBA + 0.3));
      manoI = mezcla([8, 50], [16, 136], eInOut(tramo(t, T_BOMBA, T_BOMBA + 0.3)));
      pose.cara = t < T_BAJA ? "sorpresa" : Math.sin(t * 7) > -0.2 ? "risa" : "sonrisa";
      // señala la pantalla
      if (t > T_BAJA) { const v = eInOut(tramo(t, T_BAJA, T_BAJA + 0.3)); manoD = mezcla([62, 136], [120, 74], v); pose.rc = 0.06 * v + 0.02 * Math.sin(t * 6); }
      else manoD = mezcla([62, 136], [70, 120], k);
    }
    // tira los papeles al aire
    if (t >= T_TIRA) {
      const k = eOut(tramo(t, T_TIRA, T_TIRA + 0.2));
      manoD = mezcla([120, 74], [100, 20], k); manoI = mezcla([16, 136], [-24, 24], k);
      papeles = t < T_TIRA + 0.12;
      pose.cara = t < 8.3 ? "risa" : "guino";
      if (t > 8.3) { const v = eInOut(tramo(t, 8.3, 8.6)); manoD = mezcla([100, 20], [64, 132], v); manoI = mezcla([-24, 24], [16, 134], v); }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD = (g, m) => {
      corbata(g);
      if (!papeles) return;
      g.save(); g.translate(m[0] - 22, m[1] - 6);
      for (let i = 3; i >= 0; i--) { g.fillStyle = i ? "#e9e6dc" : "#fffdf6"; g.fillRect(-20 + i * 0.8, -26 + i * 0.6, 40, 30); }
      g.fillStyle = "rgba(40,40,60,.35)"; for (let y = -21; y < 0; y += 4) g.fillRect(-16, y, 30 - (y % 3) * 4, 1.2);
      g.restore();
    };
    const m = matAv(X, PIES + dy, ESC);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("bomba", t > T_BOMBA, () => { temblar(20, 0.5); this.flash = 0.8; });
    this.una("cuenta", t > T_CUENTA + 1.0, () => {
      for (let k = 0; k < 26; k++) { const a = azar(0, 6.283), v = azar(150, 420); p.nueva(P.CHISPA, PAN.x + 300, PAN.y + 160, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
      temblar(8, 0.25);
    });
    this.una("tira", t > T_TIRA + 0.1, () => {
      const q = aPant(e.m, [60, 60]);
      for (let k = 0; k < 9; k++) this.hojas.push({ x: q[0] + azar(-40, 40), y: q[1], vx: azar(-260, 260), vy: azar(-760, -480), r: azar(0, 6), vr: azar(-7, 7) });
      for (let k = 0; k < 50; k++) p.nueva(P.CONFETI, azar(100, 920), azar(-60, 0), azar(-50, 50), azar(60, 170), azar(2.4, 3.2), azar(9, 15), k % 5);
      temblar(10, 0.3);
    });
    for (const h of this.hojas) { h.vy = Math.min(h.vy + 900 * dt, 140); h.vx *= 1 - 1.5 * dt; h.x += (h.vx + Math.sin(t * 3 + h.r) * 60) * dt; h.y += h.vy * dt; h.r += h.vr * dt; }
    this.flash = Math.max(0, this.flash - dt * 2.5);
    p.actualizar(dt);
  }
  dibujarPantalla(g) {
    const t = this.t, R = this.record();
    g.save();
    g.fillStyle = "#0b0f18"; rectR(g, PAN.x - 10, PAN.y - 10, PAN.w + 20, PAN.h + 20, 12); g.fill();
    g.save(); g.beginPath(); g.rect(PAN.x, PAN.y, PAN.w, PAN.h); g.clip();
    if (t < T_BOMBA) {
      const gr = g.createLinearGradient(PAN.x, PAN.y, PAN.x + PAN.w, PAN.y + PAN.h);
      gr.addColorStop(0, "#0d3a7a"); gr.addColorStop(1, "#06204a");
      g.fillStyle = gr; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
      // globo que gira
      const cx = PAN.x + PAN.w / 2, cy = PAN.y + 120;
      g.strokeStyle = "rgba(140,200,255,.6)"; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, 70, 0, 6.283); g.stroke();
      for (let k = 0; k < 4; k++) { const a = ((t * 0.8 + k / 4) % 1) * Math.PI; g.beginPath(); g.ellipse(cx, cy, Math.abs(Math.cos(a)) * 70, 70, 0, 0, 6.283); g.stroke(); }
      for (const yy of [-35, 0, 35]) { const rr = Math.sqrt(70 * 70 - yy * yy); g.beginPath(); g.ellipse(cx, cy + yy, rr, rr * 0.18, 0, 0, 6.283); g.stroke(); }
      txt(g, "NOTICIAS", cx, PAN.y + 245, { tam: 44, peso: 900, fam: FD, color: "#e8f2ff", esp: 8 });
    } else {
      const parpa = t < T_BAJA ? (Math.sin(t * 30) > 0 ? 1 : 0.6) : 1;
      g.fillStyle = `rgba(200,16,40,${parpa})`; g.fillRect(PAN.x, PAN.y, PAN.w, PAN.h);
      g.fillStyle = "rgba(0,0,0,.25)";
      for (let k = -4; k < 12; k++) { g.beginPath(); g.moveTo(PAN.x + k * 60 + ((t * 80) % 60), PAN.y); g.lineTo(PAN.x + k * 60 + 30 + ((t * 80) % 60), PAN.y); g.lineTo(PAN.x + k * 60 - 70 + ((t * 80) % 60), PAN.y + PAN.h); g.lineTo(PAN.x + k * 60 - 100 + ((t * 80) % 60), PAN.y + PAN.h); g.closePath(); g.fill(); }
      // foto del récord y la tasa contando
      const foto = fotoDe(R.cara);
      polaroid(g, foto, PAN.x + 112, PAN.y + 140, 150, -0.06, (gg, x, y, w, h) => txt(gg, R.fecha, x + w / 2, y + h * 0.72, { tam: 18, peso: 800, color: "#333" }));
      txt(g, "RÉCORD DEL BAR", PAN.x + 305, PAN.y + 70, { tam: 30, peso: 900, fam: FD, color: "#fff", esp: 2 });
      const v = R.valor * eOut(tramo(t, T_CUENTA, T_CUENTA + 1.0));
      const late = t > T_CUENTA + 1.0 ? 1 + 0.06 * Math.sin((t - T_CUENTA - 1.0) * 9) * Math.exp(-(t - T_CUENTA - 1.0) * 2) : 1;
      g.save(); g.translate(PAN.x + 305, PAN.y + 170); g.scale(late, late);
      txt(g, fmt(v), 0, 0, { tam: 92, peso: 900, fam: FD, color: "#ffd34d", borde: "#5a0010", bordeAncho: 8, esp: 2 });
      g.restore();
      txt(g, datos.unidad || "g/L", PAN.x + 305, PAN.y + 222, { tam: 36, peso: 900, fam: FD, color: "#fff", esp: 3 });
    }
    g.restore();
    g.strokeStyle = "rgba(255,255,255,.15)"; g.lineWidth = 2; g.strokeRect(PAN.x, PAN.y, PAN.w, PAN.h);
    g.restore();
  }
  dibujarRotulos(g) {
    const t = this.t, R = this.record();
    // ÚLTIMA HORA: estalla en grande y baja a su sitio
    if (t > T_BOMBA) {
      const kIn = tramo(t, T_BOMBA, T_BOMBA + 0.14), kB = eInOut(tramo(t, T_BAJA, T_BAJA + 0.4));
      const s = lerp(lerp(2.4, 1, eIn(kIn)), 0.37, kB);
      const cx = lerp(W / 2, 172, kB), cy = lerp(290, 508, kB);
      const a = Math.min(1, kIn * 3);
      g.save(); g.translate(cx, cy); g.scale(s, s); g.globalAlpha = a;
      g.fillStyle = "#d4102a"; g.beginPath(); g.moveTo(-430, -80); g.lineTo(450, -80); g.lineTo(430, 80); g.lineTo(-450, 80); g.closePath(); g.fill();
      g.fillStyle = "#fff"; g.fillRect(-450, 66, 900, 8);
      txt(g, "ÚLTIMA HORA", 0, 44, { tam: 128, peso: 900, fam: FD, color: "#fff", esp: 8, max: 840 });
      g.restore();
    }
    // titular
    if (t > T_BAJA + 0.25) {
      const k = eOut(tramo(t, T_BAJA + 0.25, T_BAJA + 0.6));
      g.save(); g.beginPath(); g.rect(338, 470, 680, 80); g.clip();
      g.translate(lerp(-700, 0, k), 0);
      const gr = g.createLinearGradient(0, 474, 0, 542);
      gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#dfe5ec");
      g.fillStyle = gr; g.fillRect(338, 474, 660, 68);
      txt(g, `NUEVO RÉCORD EN EL BAR: ${fmt(R.valor)} ${datos.unidad || "g/L"}`, 668, 522, { tam: 42, peso: 900, fam: FD, color: "#0b1f44", esp: 1.5, max: 630 });
      g.restore();
    }
    // cinta que pasa
    if (t > 1.0) {
      const k = eOut(tramo(t, 1.0, 1.3));
      g.save(); g.translate(0, (1 - k) * 50);
      g.fillStyle = "#06132b"; g.fillRect(-60, 556, W + 120, 44);
      g.fillStyle = "#ffd34d"; g.fillRect(0, 556, 120, 44);
      txt(g, "EN DIRECTO", 60, 585, { tam: 20, peso: 900, fam: FD, color: "#06132b", esp: 1 });
      g.save(); g.beginPath(); g.rect(120, 556, W - 120, 44); g.clip();
      const frase = t < T_BOMBA
        ? "EL TIEMPO: SOLEADO CON CLAROS DE ESPUMA  ·  DEPORTES: EMPATE EN EL FUTBOLÍN  ·  "
        : `RÉCORD DEL BAR: ${fmt(R.valor)} ${datos.unidad || "g/L"}${R.fecha ? " (" + R.fecha + ")" : ""}  ·  ¿QUIÉN DA MÁS?  ·  SOPLA Y ENTRA EN EL TOP 10  ·  `;
      g.font = `800 24px ${FT}`;
      const w = g.measureText(frase).width || 600;
      const x0 = W - ((t * 170) % w);
      for (let x = x0 - w; x < W + w; x += w) txt(g, frase, x, 587, { tam: 24, peso: 800, color: "#fffdf5", alin: "left" });
      g.restore();
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.fondo, 0, 0);
    this.dibujarPantalla(g);
    pintarAvatar(g, e.m, e.pose, t);
    g.drawImage(this.mesa, 0, 0);
    for (const h of this.hojas) { g.save(); g.translate(h.x, h.y); g.rotate(h.r); g.scale(Math.max(0.2, Math.abs(Math.cos(h.r * 1.3))), 1); g.fillStyle = "#fffdf6"; g.fillRect(-26, -34, 52, 68); g.fillStyle = "rgba(40,40,60,.3)"; for (let y = -26; y < 26; y += 7) g.fillRect(-20, y, 40, 2); g.restore(); }
    this.p.dibujar(g);
    this.dibujarRotulos(g);
    // ¿¡QUÉ!? y ¡HISTÓRICO!
    if (t > T_PINGA + 0.2 && t < T_BOMBA + 0.05) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] + 30, q[1] - 40, "¿¡QUÉ!?", q[0] + 20, q[1] - 2, tramo(t, T_PINGA + 0.2, T_PINGA + 0.35), 40);
    }
    if (t > T_TIRA + 0.15 && t < 8.6) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] + 10, q[1] - 46, "¡HISTÓRICO!", q[0] + 10, q[1] - 2, tramo(t, T_TIRA + 0.15, T_TIRA + 0.3) * (1 - tramo(t, 8.4, 8.6)), 40);
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,255,${this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    cortinilla(g, t, this.dur);
  }
}
/** Cortinilla roja: abre de izquierda a derecha y cierra de derecha a izquierda, con negro detrás. */
function cortinilla(g, t, dur) {
  let bx, abre;
  if (t < 0.75) { bx = lerp(-320, W + 320, eInOut(tramo(t, 0.0, 0.72))); abre = true; }
  else if (t > dur - 0.8) { bx = lerp(W + 320, -320, eInOut(tramo(t, dur - 0.8, dur - 0.05))); abre = false; }
  else return;
  g.save();
  g.fillStyle = "#000";
  g.beginPath(); g.moveTo(bx + 60, -60); g.lineTo(W + 60, -60); g.lineTo(W + 60, H + 60); g.lineTo(bx - 60, H + 60); g.closePath(); g.fill();
  // banda roja con raya blanca en el borde
  g.fillStyle = "#d4102a";
  g.beginPath(); g.moveTo(bx - 140, -60); g.lineTo(bx + 60, -60); g.lineTo(bx - 60, H + 60); g.lineTo(bx - 260, H + 60); g.closePath(); g.fill();
  g.fillStyle = "#fff";
  g.beginPath(); g.moveTo(bx - 175, -60); g.lineTo(bx - 150, -60); g.lineTo(bx - 270, H + 60); g.lineTo(bx - 295, H + 60); g.closePath(); g.fill();
  g.restore();
}
function pintarPlato() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#071530"); gr.addColorStop(1, "#0d2a5c");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // paneles de luz
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 118;
    const gl = g.createLinearGradient(0, 0, 0, 420);
    gl.addColorStop(0, "rgba(90,160,255,.0)"); gl.addColorStop(0.5, "rgba(90,160,255,.13)"); gl.addColorStop(1, "rgba(90,160,255,0)");
    g.fillStyle = gl; g.fillRect(x, 20, 70, 400);
  }
  // rejilla de mapamundi
  g.strokeStyle = "rgba(140,190,255,.08)"; g.lineWidth = 1.5;
  for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 430); g.stroke(); }
  for (let y = 0; y < 430; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  return c;
}
function pintarMesa() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  // mesa curvada del presentador
  const gr = g.createLinearGradient(0, MESA, 0, H);
  gr.addColorStop(0, "#1d4f9e"); gr.addColorStop(1, "#0a234f");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(90, MESA); g.lineTo(700, MESA); g.quadraticCurveTo(740, MESA + 80, 690, H); g.lineTo(100, H); g.quadraticCurveTo(50, MESA + 80, 90, MESA); g.closePath(); g.fill();
  g.fillStyle = "#e9eef5"; g.fillRect(80, MESA - 8, 630, 12);
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(110, MESA + 30, 570, 3);
  g.fillStyle = "#d4102a"; g.fillRect(110, MESA + 40, 570, 6);
  return c;
}
/** Corbata del presentador (con cuello blanco). */
function corbata(g) {
  g.save();
  g.fillStyle = "#f2f2f0";
  g.beginPath(); g.moveTo(32, 75); g.lineTo(39, 84); g.lineTo(36, 88); g.lineTo(29, 80); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(46, 75); g.lineTo(39, 84); g.lineTo(42, 88); g.lineTo(49, 80); g.closePath(); g.fill();
  const gr = g.createLinearGradient(33, 0, 45, 0);
  gr.addColorStop(0, "#0d2a6a"); gr.addColorStop(0.5, "#2a62d0"); gr.addColorStop(1, "#0d2a6a");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(36, 80); g.lineTo(42, 80); g.lineTo(41, 86); g.lineTo(37, 86); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(37, 86); g.lineTo(41, 86); g.lineTo(45, 126); g.lineTo(39, 133); g.lineTo(33, 126); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,.3)"; g.lineWidth = 1.2;
  for (let y = 92; y < 128; y += 8) { g.beginPath(); g.moveTo(35, y + 4); g.lineTo(43, y - 2); g.stroke(); }
  g.restore();
}

registrar({ id: "00047", nombre: "Última hora", crear: () => new UltimaHora() });
})();
