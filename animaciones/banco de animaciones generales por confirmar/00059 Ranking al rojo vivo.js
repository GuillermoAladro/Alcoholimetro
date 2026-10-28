"use strict";
/*
 * 00059 · RANKING AL ROJO VIVO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Las barras del top 10 (con las tasas reales del ranking) crecen como en una carrera, cada una a su ritmo, mientras
 * él anima desde un lado. Cuando paran, va hasta la del número 1 y la empuja para que crezca más: se pone al rojo
 * vivo, echa llamas y humo, se quema las manos y sopla. ¡ESTO ARDE!
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
const X0 = 112, LMAX = 500, EMPUJE = 250;
const FILA = (r) => (r === 1 ? { y: 452, h: 54 } : { y: 52 + (10 - r) * 41, h: 28 });
const COLOR = (r) => (r === 1 ? [255, 211, 77] : r === 2 ? [225, 232, 240] : r === 3 ? [242, 160, 95] : [43, 220, 91]);

class EscenaRojoVivo extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(460);
    this.fase = 0;
    // ritmo de cada barra en la carrera (el 1 arranca lento y remonta)
    const r = semilla(31);
    this.ritmo = [];
    for (let i = 0; i < 10; i++) this.ritmo.push(i === 0 ? 2.3 : 0.55 + r() * 1.3);
  }
  valores() { return datos.top.map((e) => (e ? e.valor : 0)); }
  largo(r, t) {
    const v = this.valores(), maxV = Math.max(0.01, v[0] || 0.01), Lf = (LMAX * (v[r - 1] || 0)) / maxV;
    const u = tramo(t, 0.45, 3.25);
    let L = Lf * Math.pow(u, this.ritmo[r - 1]);
    if (r === 1) L += this.extra(t);
    return L;
  }
  /** Lo que crece la barra del 1 a empujones. */
  extra(t) {
    const u = tramo(t, 4.45, 6.55);
    return EMPUJE * clamp(u + 0.05 * Math.sin(u * Math.PI * 9) * (1 - u), 0, 1);
  }
  calor(t) { return eInOut(tramo(t, 4.6, 6.5)); }
  xAvatar(t) {
    const punta = X0 + LMAX + this.extra(t);
    if (t < 3.55) return 885;
    if (t < 4.4) return lerp(885, X0 + LMAX - 52, eInOut(tramo(t, 3.55, 4.4)));
    if (t < 6.62) return punta - 52;
    return punta - 52 - 46 * eOut(tramo(t, 6.62, 6.85));
  }
  estado() {
    const t = this.t, x = this.xAvatar(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], giro = 0, bote = 0, sy = 1;
    // anima la carrera desde un lado
    if (t < 3.55) {
      const k = eInOut(tramo(t, 0.6, 0.9));
      manoD = mezcla(manoD, [96, 40 + 14 * Math.sin(t * 11)], k); manoI = mezcla(manoI, [-18, 40 + 14 * Math.sin(t * 11 + 2)], k);
      pose.cara = t < 2.3 ? "risa" : t < 3.0 ? "sorpresa" : "risa";
      bote = -Math.abs(Math.sin(t * 5.5)) * 12 * k;
      pose.rc = -0.12 * k;
    }
    if ((t >= 3.55 && t < 4.4)) { const a = andar(this.fase, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; pose.cara = "guino"; }
    // empuja la barra del 1 con las dos manos
    if (t >= 4.3 && t < 6.62) {
      const k = eInOut(tramo(t, 4.3, 4.5)), cal = this.calor(t);
      manoD = mezcla([70, 158], [80, 146 + 2 * Math.sin(t * 20)], k);
      manoI = mezcla([9, 160], [60, 142 + 2 * Math.sin(t * 20 + 1)], k);
      pose.brazoIDelante = true;
      giro = 0.15 * k; sy = 1 - 0.04 * k;
      if (t > 4.45) { const a = andar(this.fase, 0.55); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; }
      pose.cara = cal < 0.45 ? "dormido" : "sorpresa";
      pose.rc = 0.05 + 0.03 * Math.sin(t * 30) * cal;
    }
    // ¡quema! retira las manos y sopla
    if (t >= 6.62) {
      const k = eOut(tramo(t, 6.62, 6.78));
      giro = 0.15 * (1 - k) - 0.06 * k * (1 - tramo(t, 7.0, 7.4));
      bote = -Math.sin(Math.PI * tramo(t, 6.62, 6.95)) * 26;
      pose.cara = t < 7.25 ? "sorpresa" : t < 8.1 ? "dormido" : "risa";
      pose.puntas = 0.6 * (1 - tramo(t, 7.6, 8.4));
      const sopla = t > 7.2 && t < 8.1;
      manoD = mezcla([80, 146], sopla ? [52, 72 + 3 * Math.sin(t * 25)] : [96, 70 + 10 * Math.sin(t * 22)], k);
      manoI = mezcla([60, 142], sopla ? [28, 74 + 3 * Math.sin(t * 25 + 1)] : [-18, 70 + 10 * Math.sin(t * 22 + 1)], k);
      pose.brazoIDelante = sopla;
      if (t > 8.1) { manoD = mezcla([52, 72], [96, 40], eInOut(tramo(t, 8.1, 8.35))); manoI = mezcla([28, 74], [9, 160], eInOut(tramo(t, 8.1, 8.35))); pose.brazoIDelante = false; }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, PIES + bote, 1.35, giro, 1, sy);
    return { pose, m, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, cal = this.calor(t);
    if ((t > 3.55 && t < 4.4) || (t > 4.45 && t < 6.55)) this.fase += dt * (t < 4.4 ? 9 : 5);
    for (let r = 1; r <= 10; r++) this.una("meta" + r, t > 3.25, () => { if (r === 1) temblar(10, 0.3); });
    this.una("empieza", t > 4.45, () => temblar(6, 0.2));
    // la barra del 1 se calienta: chispas, llamas y humo
    const F = FILA(1), punta = X0 + this.largo(1, t);
    if (cal > 0.15) {
      const n = Math.round(cal * 140 * dt * (t > 7.9 ? 1 - tramo(t, 7.9, 9.0) : 1));
      for (let i = 0; i < n; i++) p.nueva(P.LLAMA, azar(X0 + 20, punta - 6), F.y - F.h / 2 + 2, azar(-20, 20), azar(-260, -120), azar(0.25, 0.5), azar(22, 46) * (0.5 + 0.5 * cal), Math.random() < 0.3 ? 1 : 0);
      if (Math.random() < cal * 10 * dt) p.nueva(P.HUMO, azar(X0 + 60, punta), F.y - F.h / 2 - 20, azar(-20, 20), azar(-90, -50), azar(1.2, 2), azar(30, 50));
    }
    if (t > 4.5 && t < 6.6 && Math.random() < 14 * dt) p.nueva(P.CHISPA, punta, F.y + azar(-20, 20), azar(30, 220), azar(-260, -60), azar(0.3, 0.6), azar(6, 11));
    // ¡quema!: humo de las manos y del pelo
    this.una("quema", t > 6.62, () => {
      temblar(20, 0.45);
      for (let i = 0; i < 22; i++) { const a = azar(-Math.PI, 0), v = azar(150, 500); p.nueva(P.CHISPA, punta - 10, F.y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
    });
    if (t > 6.7 && t < 8.6 && Math.random() < 16 * dt) {
      const e = this.estado(), q = aPant(e.m, Math.random() < 0.5 ? e.pose.manoD : [39 + azar(-20, 20), 0]);
      p.nueva(P.HUMO, q[0], q[1], azar(-20, 20), azar(-90, -50), azar(1, 1.6), azar(24, 40));
    }
    this.una("titulo", t > 6.8, () => temblar(16, 0.4));
    p.alfa = 1 - tramo(t, 8.9, 9.5);
    p.actualizar(dt);
  }
  dibujarBarra(g, r, t, a) {
    const F = FILA(r), L = this.largo(r, t), v = this.valores(), c = COLOR(r);
    const cal = r === 1 ? this.calor(t) : 0;
    const y0 = F.y - F.h / 2;
    // etiqueta del puesto
    txt(g, "#" + r, X0 - 16, F.y + (r === 1 ? 14 : 9), { tam: r === 1 ? 40 : 26, peso: 900, fam: FD, color: `rgb(${c})`, alin: "right", alfa: a });
    if (L < 1 && !(r === 1 && this.extra(t) > 0)) { if (!datos.top[r - 1] && t > 3.25) txt(g, "LIBRE", X0 + 12, F.y + 8, { tam: 20, peso: 800, color: "rgba(255,255,255,.35)", alin: "left", esp: 3, alfa: a }); return; }
    // color: oro → naranja → rojo vivo (casi blanco en el centro)
    const mix = (k, A, B) => A.map((x, i) => Math.round(lerp(x, B[i], k)));
    const c0 = cal < 0.5 ? mix(cal * 2, c, [255, 120, 20]) : mix((cal - 0.5) * 2, [255, 120, 20], [255, 40, 10]);
    const gr = g.createLinearGradient(0, y0, 0, y0 + F.h);
    gr.addColorStop(0, `rgb(${mix(0.45 + 0.3 * cal, c0, [255, 255, 235])})`); gr.addColorStop(0.45, `rgb(${c0})`); gr.addColorStop(1, `rgb(${mix(0.5 - 0.3 * cal, c0, [40, 10, 0])})`);
    g.save(); g.globalAlpha = a;
    if (cal > 0.2) {
      // brillo del calor (sin sombras: en la Pi son caras)
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha *= 0.8 * cal;
      g.drawImage(BLOB.naranja, X0 - 30, y0 - 40, L + 60, F.h + 80); g.restore();
    }
    rectR(g, X0, y0, L, F.h, Math.min(10, F.h / 3)); g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,.22)"; rectR(g, X0 + 4, y0 + 3, Math.max(0, L - 8), F.h * 0.22, 3); g.fill();
    // valor
    const val = (v[r - 1] || 0) * Math.min(1, this.largo(r, t) / Math.max(1, (LMAX * (v[r - 1] || 0)) / Math.max(0.01, v[0])));
    const s = datos.top[r - 1] ? `${fmt(Math.min(v[r - 1] || 0, val))} ${datos.unidad}` : "LIBRE";
    const temb = cal > 0.3 ? azar(-1.5, 1.5) * cal : 0;
    const aparta = r === 1 ? 24 * eInOut(tramo(t, 4.2, 4.45)) * (1 - eInOut(tramo(t, 6.62, 6.9))) : 0;
    const xs = X0 + L + 12 + aparta + temb, ys = F.y + (r === 1 ? 12 : 8) + temb;
    if (cal > 0.3) ponerRotulo(g, rotulo(s, { tam: 36, peso: 900, fam: FD, color: "#fff1d0", alin: "left", esp: 1, glow: "rgba(255,90,20,.9)", glowTam: 16 }), xs, ys);
    else txt(g, s, xs, ys, { tam: r === 1 ? 36 : 22, peso: 900, fam: FD, color: "#fffdf5", alin: "left", esp: 1 });
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), a = tramo(t, 0, 0.4) * (1 - tramo(t, 8.9, 9.5)), cal = this.calor(t);
    fondo(g, "#000");
    // resplandor rojo del calor
    if (cal > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * cal * a; g.drawImage(BLOB.rojo, X0 - 100, FILA(1).y - 260, LMAX + EMPUJE + 300, 420); g.restore(); }
    // líneas guía
    g.save(); g.globalAlpha = 0.25 * a; g.strokeStyle = "#2bff5b"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(X0, 30); g.lineTo(X0, PIES - 10); g.stroke(); g.restore();
    for (let r = 10; r >= 2; r--) this.dibujarBarra(g, r, t, a);
    // cabecera
    txt(g, "TOP 10 · CARRERA", 940, 60, { tam: 26, peso: 800, color: "#2bff5b", alin: "right", esp: 5, alfa: a * (1 - tramo(t, 6.6, 6.9)) });
    g.save(); g.globalAlpha = a; pintarAvatar(g, e.m, e.pose, t); g.restore();
    this.dibujarBarra(g, 1, t, a);
    this.p.dibujar(g);
    // ¡VAMOS!
    if (t > 1.2 && t < 3.3) {
      const q = aPant(e.m, [39, -12]);
      bocadillo(g, q[0] - 30, q[1] - 44, "¡VAMOS, EL 1!", q[0] - 4, q[1], tramo(t, 1.2, 1.4) * (1 - tramo(t, 3.1, 3.3)) * a, 30);
    }
    if (t > 7.2 && t < 8.1) { const q = aPant(e.m, [-20, 60]); txt(g, "fuu…", q[0] - 20, q[1], { tam: 34, peso: 400, fam: FC, color: "#d6fbff", esp: 2, alfa: (1 - tramo(t, 7.9, 8.1)) * a }); }
    // ¡ESTO ARDE!
    if (t > 6.8) {
      const k = tramo(t, 6.8, 6.95), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 9));
      g.save(); g.translate(772 + azar(-2, 2) * (1 - tramo(t, 7.2, 7.6)), 185); g.rotate(-0.06); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * a;
      ponerRotulo(g, rotulo("¡ESTO ARDE!", { tam: 112, peso: 900, fam: FD, borde: "#2a0600", bordeAncho: 10, esp: 3, glow: "rgba(255,90,20,.85)", glowTam: 26, max: 470 }, (c) => {
        const gr = c.createLinearGradient(0, -100, 0, 0);
        gr.addColorStop(0, "#fff6c2"); gr.addColorStop(0.45, "#ffb21a"); gr.addColorStop(1, "#e3262f");
        return gr;
      }));
      g.restore();
    }
  }
}

registrar({ id: "00059", nombre: "Ranking al rojo vivo", crear: () => new EscenaRojoVivo() });
})();
