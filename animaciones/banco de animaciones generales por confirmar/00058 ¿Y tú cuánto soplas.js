"use strict";
/*
 * 00058 · ¿Y TÚ CUÁNTO SOPLAS?
 *
 * Animación del banco. Empieza y acaba en negro.
 * Aparece a lo lejos sobre un suelo en perspectiva y camina hacia la cámara hasta quedarse en primer plano. Señala al
 * que mira (¡TÚ!), luego con una flecha la boquilla (arriba a la izquierda: SOPLA AQUÍ) y con otra el lector
 * (arriba a la derecha: PAGA AQUÍ). Sale el rótulo ¿Y TÚ CUÁNTO SOPLAS? y guiña un ojo.
 */
(() => {
const CT = cacheTexto();
/** Texto con brillo pintado una vez en un lienzo (el brillo es caro en la Pi). Devuelve { c, ox, oy }: el ancla. */
function rotulo(s, o, grad) {
  const clave = s + "|" + o.tam + "|" + (o.alin || "");
  if (CT.has(clave)) return CT.get(clave);
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 800} ${o.tam}px ${o.fam || FT}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  let w = m.measureText(s).width, tam = o.tam;
  if (o.max && w > o.max) { tam = Math.floor((tam * o.max) / w); w = (w * tam) / o.tam; }
  const pad = (o.glowTam || 0) * 1.6 + (o.bordeAncho || 0) + 8;
  const c = lienzoNuevo(w + 2 * pad, tam * 1.4 + 2 * pad), g = c.getContext("2d");
  const ox = o.alin === "left" ? pad : c.width / 2, oy = pad + tam;
  g.translate(ox, oy);
  const op = Object.assign({}, o, { tam, max: null, alfa: null });
  if (grad) op.color = grad(g);
  txt(g, s, 0, 0, op);
  const r = { c, ox, oy };
  CT.set(clave, r);
  return r;
}
function ponerRotulo(g, r, x = 0, y = 0) { g.drawImage(r.c, x - r.ox, y - r.oy); }
const FUGA = [512, 318];
const CACHE = cacheTexto();
function suelo() {
  if (CACHE.has(1)) return CACHE.get(1);
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, FUGA[1], 0, H);
  gr.addColorStop(0, "rgba(10,40,20,0)"); gr.addColorStop(1, "rgba(16,70,34,.55)");
  g.fillStyle = gr; g.fillRect(0, FUGA[1], W, H - FUGA[1]);
  g.strokeStyle = "rgba(43,255,91,.28)"; g.lineWidth = 1.5;
  for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(FUGA[0] + i * 6, FUGA[1]); g.lineTo(FUGA[0] + i * 150, H + 300); g.stroke(); }
  for (let k = 1; k < 14; k++) { const y = FUGA[1] + Math.pow(k / 13, 2.2) * (H - FUGA[1] + 40); g.globalAlpha = 0.3 + 0.7 * (k / 13); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  CACHE.set(1, c);
  return c;
}
/** Flecha gruesa curvada de A a B (k = cuánto ha crecido). */
function flecha(g, A, C, B, k, col) {
  if (k <= 0) return;
  const N = 24, pts = [];
  for (let i = 0; i <= N * k; i++) { const u = i / N, a = 1 - u; pts.push([a * a * A[0] + 2 * a * u * C[0] + u * u * B[0], a * a * A[1] + 2 * a * u * C[1] + u * u * B[1]]); }
  if (pts.length < 2) return;
  const P = pts[pts.length - 1], Q = pts[pts.length - 2], ang = Math.atan2(P[1] - Q[1], P[0] - Q[0]);
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
  // halo (dos trazos anchos y transparentes en vez de sombra)
  g.save(); g.globalAlpha *= 0.18; g.strokeStyle = col; g.lineWidth = 38; g.stroke(); g.lineWidth = 26; g.stroke(); g.restore();
  g.strokeStyle = col; g.lineWidth = 16; g.stroke();
  g.translate(P[0], P[1]); g.rotate(ang);
  g.fillStyle = col; g.beginPath(); g.moveTo(26, 0); g.lineTo(-14, -26); g.lineTo(-6, 0); g.lineTo(-14, 26); g.closePath(); g.fill();
  g.restore();
}

class EscenaSoplas extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(200);
    this.fase = 0;
  }
  /** Escala y pies: viene desde el fondo hacia la cámara. */
  sitio(t) {
    const k = eInOut(tramo(t, 0.3, 2.45));
    const S = lerp(0.42, 1.95, Math.pow(k, 1.4)), Y = lerp(FUGA[1] + 74, 642, Math.pow(k, 1.4));
    return { S, Y, anda: t > 0.3 && t < 2.45 };
  }
  estado() {
    const t = this.t, s = this.sitio(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], bote = 0, punch = 1;
    if (s.anda) { const a = andar(this.fase, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote * s.S; }
    if (t > 2.3 && t < 2.65) pose.cara = "guino";
    // ¡TÚ! señala al que mira
    if (t >= 2.6 && t < 4.0) {
      const k = eOut(tramo(t, 2.6, 2.8)) * (1 - eInOut(tramo(t, 3.8, 4.0)));
      manoD = mezcla(manoD, [46, 116 + 3 * Math.sin(t * 16)], k);
      pose.cara = "risa"; pose.rc = 0.04 * Math.sin(t * 5);
      punch = 1 + 0.1 * eOut(tramo(t, 2.7, 2.85)) * (1 - eInOut(tramo(t, 3.5, 3.95)));
    }
    // la boquilla, arriba a la izquierda
    const kI = eInOut(tramo(t, 3.95, 4.25));
    manoI = mezcla(manoI, [-40, 16 + 3 * Math.sin(t * 6)], kI);
    if (t >= 3.95 && t < 5.45) { pose.cara = "sonrisa"; pose.rc = -0.16 * kI; }
    // el lector, arriba a la derecha
    const kD = eInOut(tramo(t, 5.45, 5.75));
    if (t >= 5.45) { manoD = mezcla([70, 158], [118, 16 + 3 * Math.sin(t * 6 + 1)], kD); pose.cara = "sonrisa"; pose.rc = lerp(-0.16, 0.16, kD); }
    // ¿y tú? guiño final
    if (t >= 7.0) { pose.rc = lerp(0.16, 0, eInOut(tramo(t, 7.0, 7.3))); pose.cara = t < 7.9 ? "guino" : "risa"; }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(W / 2, s.Y + bote, s.S * punch);
    return { pose, m, s };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const s = this.sitio(t);
    if (s.anda) this.fase += dt * 8;
    this.una("pasoA", t > 2.45, () => temblar(5, 0.2));
    this.una("tu", t > 2.75, () => {
      temblar(14, 0.35);
      const q = aPant(this.estado().m, [46, 116]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 160);
    });
    this.una("fI", t > 4.55, () => { temblar(6, 0.2); for (let i = 0; i < 14; i++) p.nueva(P.CHISPA, 40 + azar(-10, 10), 40 + azar(-10, 10), azar(-60, 300), azar(-60, 300), azar(0.3, 0.6), azar(7, 12)); });
    this.una("fD", t > 6.05, () => { temblar(6, 0.2); for (let i = 0; i < 14; i++) p.nueva(P.CHISPA, W - 40 + azar(-10, 10), 40 + azar(-10, 10), azar(-300, 60), azar(-60, 300), azar(0.3, 0.6), azar(7, 12)); });
    this.una("rotulo", t > 7.05, () => temblar(12, 0.3));
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = tramo(t, 0, 0.45) * (1 - tramo(t, 8.7, 9.35));
    fondo(g, "#000");
    g.save(); g.globalAlpha = luz;
    g.drawImage(suelo(), 0, 0);
    // foco que le sigue
    foco(g, W / 2, W / 2, e.s.Y - 8, 70 * e.s.S + 40, 0.65);
    pintarAvatar(g, e.m, e.pose, t);
    g.restore();
    // ¡TÚ!: rayitas alrededor del dedo
    if (t > 2.7 && t < 4.0) {
      const q = aPant(e.m, [46, 116]), a = Math.min(1, tramo(t, 2.7, 2.8) * 3) * (1 - tramo(t, 3.75, 4.0)) * luz;
      g.save(); g.globalAlpha = a; g.strokeStyle = "#ffd34d"; g.lineWidth = 6; g.lineCap = "round";
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * 6.283 + 0.2, r0 = 60 + 10 * Math.sin(t * 20 + i), r1 = r0 + 34;
        g.beginPath(); g.moveTo(q[0] + Math.cos(ang) * r0, q[1] + Math.sin(ang) * r0); g.lineTo(q[0] + Math.cos(ang) * r1, q[1] + Math.sin(ang) * r1); g.stroke();
      }
      g.restore();
      const k = tramo(t, 2.75, 2.9), s = lerp(2.6, 1, eIn(k));
      g.save(); g.translate(812, 230); g.rotate(-0.12); g.scale(s, s);
      txt(g, "¡TÚ!", 0, 0, { tam: 170, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 13, esp: 4, alfa: Math.min(1, k * 4) * (1 - tramo(t, 3.75, 4.0)) * luz });
      g.restore();
    }
    // flecha a la boquilla
    const reb = Math.sin(t * 7) * 6;
    if (t > 4.1) {
      const k = eOut(tramo(t, 4.1, 4.55)), a = luz;
      const mI = aPant(e.m, [-40, 16]);
      g.save(); g.globalAlpha = a;
      flecha(g, [mI[0] - 18, mI[1] - 22], [170, 250], [40 + reb * 0.6, 44 + reb * 0.6], k, "#2bff5b");
      const kt = eBack(tramo(t, 4.45, 4.75));
      g.translate(150, 300); g.rotate(-0.06); g.scale(kt, kt);
      const oI = { tam: 66, peso: 900, fam: FD, color: "#d8ffe0", borde: "#04140a", bordeAncho: 8, esp: 3, glow: "rgba(43,255,91,.8)", glowTam: 16 };
      ponerRotulo(g, rotulo("SOPLA", oI)); ponerRotulo(g, rotulo("AQUÍ", oI), 0, 58);
      txt(g, "LA BOQUILLA", 0, 92, { tam: 20, peso: 800, color: "#2bff5b", esp: 4 });
      g.restore();
    }
    // flecha al lector
    if (t > 5.6) {
      const k = eOut(tramo(t, 5.6, 6.05)), a = luz;
      const mD = aPant(e.m, [118, 16]);
      g.save(); g.globalAlpha = a;
      flecha(g, [mD[0] + 18, mD[1] - 22], [W - 170, 250], [W - 40 - reb * 0.6, 44 + reb * 0.6], k, "#ffd34d");
      const kt = eBack(tramo(t, 5.95, 6.25));
      g.translate(W - 150, 300); g.rotate(0.06); g.scale(kt, kt);
      const oD = { tam: 65, peso: 900, fam: FD, color: "#fff6c2", borde: "#2a1a00", bordeAncho: 8, esp: 3, glow: "rgba(255,211,77,.8)", glowTam: 16 };
      ponerRotulo(g, rotulo("PAGA", oD)); ponerRotulo(g, rotulo("AQUÍ", oD), 0, 58);
      txt(g, "CON TARJETA", 0, 92, { tam: 20, peso: 800, color: "#ffd34d", esp: 4 });
      g.restore();
    }
    this.p.alfa = luz; this.p.dibujar(g);
    // rótulo final
    if (t > 7.0) {
      const k = eOut(tramo(t, 7.0, 7.3)), y = lerp(H + 90, 548, k);
      g.save(); g.globalAlpha = luz;
      const gb = g.createLinearGradient(0, y - 62, 0, y + 30);
      gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(0.35, "rgba(0,0,0,.82)"); gb.addColorStop(1, "rgba(0,0,0,.9)");
      g.fillStyle = gb; g.fillRect(-60, y - 70, W + 120, 140);
      const s = 1 + 0.025 * Math.sin(t * 6);
      g.translate(W / 2, y); g.scale(s, s);
      ponerRotulo(g, rotulo("¿Y TÚ CUÁNTO SOPLAS?", { tam: 82, peso: 900, fam: FD, color: "#fffdf5", borde: "#000", bordeAncho: 8, esp: 3, glow: "rgba(43,255,91,.6)", glowTam: 18, max: 960 }));
      g.restore();
    }
  }
}

registrar({ id: "00058", nombre: "¿Y tú cuánto soplas?", crear: () => new EscenaSoplas() });
})();
