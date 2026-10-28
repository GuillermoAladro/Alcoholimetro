"use strict";
/*
 * 00144 · FOTO DOBLE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Lo que ve la cámara de la máquina: Guillermo se coloca, se arregla el pelo y posa para la foto del ranking.
 * Cuenta atrás 3, 2, 1… en el 2 Rodrigo asoma la cabeza por un lado y en el último segundo se cuela de un salto
 * y le pasa el brazo por el hombro. ¡Flash! La polaroid sale con los dos (Guillermo con cara de susto): ¡FOTO DOBLE!
 */
(() => {
const EP = 2.2, AYP = 762;                         // encuadre de la cámara (de cintura para arriba)
const XG_P = 512, XR_P = 652;
const ESC = 1.55, XG = 168, XR = 856;              // plano general después del flash
const T_CUENTA = [1.75, 2.75, 3.75], T_FLASH = 4.75, T_TIT = 6.35, T_APAGA = 9.45;
const CUADRO = { x: 512, y: 372, l: 440 };         // lo que sale en la foto (cuadrado)
const CT = cacheTexto();
const aU = (X, Y, E, q) => [(q[0] - X) / E + 39, (q[1] - Y) / E + 232];

/** Fondo de bar desenfocado (como el de las fotos de la máquina), pintado una vez. */
let _fondo = null;
function fondoBar() {
  if (_fondo) return _fondo;
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#2a1435"); gr.addColorStop(1, "#0f0a14");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = semilla(144), cols = ["255,170,60", "255,70,140", "120,190,255", "255,220,120"];
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = r() * H * 0.75, rr = 40 + r() * 90;
    const rg = g.createRadialGradient(x, y, 0, x, y, rr);
    rg.addColorStop(0, `rgba(${cols[i % 4]},.5)`); rg.addColorStop(1, `rgba(${cols[i % 4]},0)`);
    g.fillStyle = rg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  return (_fondo = c);
}

class FotoDoble extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(260);
    this.foto = null;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, 9.95)); }
  /** Poses en el encuadre de la cámara. */
  posesCamara(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let gD = [70, 158], gI = [9, 160], xg = XG_P, yg = 0;
    // entra andando por la izquierda y se coloca
    const kE = eOut(tramo(t, 0.15, 1.05));
    xg = lerp(-160, XG_P, kE); yg = t < 1.05 ? -Math.abs(Math.sin(t * 9)) * 10 : 0;
    // se arregla el pelo
    if (t > 1.05 && t < 1.75) { const k = eInOut(tramo(t, 1.05, 1.25)) * (1 - eInOut(tramo(t, 1.55, 1.75))); gD = mezcla(gD, [56 + Math.sin(t * 20) * 4, 8], k); G.cara = "guino"; G.rc = -0.05 * k; }
    // posa: pulgar arriba, luego mano en la cintura y guiño
    if (t >= 1.75) { const k = eOut(tramo(t, 1.75, 1.95)); gD = mezcla(gD, [92, 92], k); G.cara = "sonrisa"; }
    if (t >= 3.75) { const k = eInOut(tramo(t, 3.75, 3.95)); gD = mezcla([92, 92], [80, 140], k); gI = mezcla(gI, [-2, 140], k); G.cara = "guino"; }
    // Rodrigo: asoma en el 2, se esconde y en el último segundo se cuela de un salto
    let xr = 1200, yr = 0, giroR = 0;
    let rI = [9, 157], rD = [68, 157];
    if (t > 2.8 && t < 3.6) {
      const k = eOut(tramo(t, 2.8, 3.0)) * (1 - eInOut(tramo(t, 3.35, 3.6)));
      xr = lerp(1160, 975, k); giroR = -0.18 * k; R.rc = -0.12 * k; R.cara = "guino";
      rI = [12, 40]; // la mano en el marco
    }
    if (t > 4.2) {
      const k = tramo(t, 4.2, 4.6);
      xr = lerp(1180, XR_P, eOut(k)); yr = -Math.sin(Math.min(1, k) * Math.PI) * 110;
      giroR = -0.25 * Math.sin(Math.min(1, k) * Math.PI);
      const kB = eOut(tramo(t, 4.45, 4.65));
      const hombro = aU(xr, AYP + yr, EP, [XG_P - 60 + (69 - 39) * EP, AYP - (232 - 86) * EP]);
      rI = mezcla([-20, 60], hombro, kB); rD = mezcla([96, 40], [94, 22], kB);
      R.cara = "risa"; R.rc = -0.08 * kB;
      // le da un empujoncito al caer y Guillermo se da cuenta justo en el flash
      xg = lerp(XG_P, XG_P - 60, eOut(tramo(t, 4.5, 4.68)));
      if (t > 4.55) { G.cara = "sorpresa"; G.rc = 0.14 * eOut(tramo(t, 4.55, 4.72)); }
    }
    G.manoD = gD; G.manoI = gI; R.manoI = rI; R.manoD = rD;
    return [{ pose: G, m: matAv(xg, AYP + yg, EP) }, { pose: R, m: matAv(xr, AYP + yr, EP, giroR) }];
  }
  /** Poses en el plano general (después del flash). */
  posesFuera(t) {
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const d = t - T_FLASH;
    let gD = [70, 158], gI = [9, 160], rD = [68, 157], rI = [9, 157], yG = 0, yR = 0;
    // miran la foto
    G.rc = 0.1; R.rc = -0.1;
    if (d < 0.9) { gD = [60, 40]; G.cara = "sorpresa"; R.cara = "risa"; }   // ¡qué susto!
    else gD = mezcla([60, 40], [70, 158], eInOut(tramo(d, 0.9, 1.2)));
    // Rodrigo señala la foto partiéndose de risa
    if (d > 1.0) { const k = eOut(tramo(d, 1.0, 1.2)); rI = mezcla(rI, [-44, 76 + Math.sin(t * 14) * 3], k); R.cara = "risa"; yR = -Math.abs(Math.sin(t * 12)) * 6 * k; }
    // Guillermo: primero sorpresa, luego se ríe también y se tapa la cara
    if (d > 1.6) { G.cara = "risa"; gD = mezcla([70, 158], [104, 64], eOut(tramo(d, 1.6, 1.8))); }
    if (t > T_TIT) {
      const k = eOut(tramo(t, T_TIT, T_TIT + 0.2));
      gI = mezcla(gI, [-16, 26 + Math.sin(t * 8) * 4], k); rD = mezcla(rD, [94, 26 + Math.sin(t * 8 + 1) * 4], k);
      yG = -Math.abs(Math.sin((t - T_TIT) * 8)) * 20 * (1 - tramo(t, 8.4, 8.7)); yR = yG;
      G.cara = t > 8.3 ? "guino" : "risa"; R.cara = "risa";
    }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    return [{ pose: G, m: matAv(XG, PIES + yG, ESC) }, { pose: R, m: matAv(XR, PIES + yR, ESC) }];
  }
  /** Lo que ve la cámara: fondo y los dos. */
  escenaCamara(g, e, t) {
    g.drawImage(fondoBar(), 0, 0);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
  }
  /** Hace la polaroid: el cuadrado de la cámara en el momento del flash. */
  revelar() {
    if (!listo("torso") || !listo("rodrigo_torso")) return null;
    const S = 300, c = lienzoNuevo(S, S), g = c.getContext("2d");
    const s = S / CUADRO.l;
    g.scale(s, s); g.translate(-(CUADRO.x - CUADRO.l / 2), -(CUADRO.y - CUADRO.l / 2));
    this.escenaCamara(g, this.posesCamara(T_FLASH), T_FLASH);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const v = g.createRadialGradient(S / 2, S * 0.38, S * 0.15, S / 2, S / 2, S * 0.75);
    v.addColorStop(0, "rgba(255,255,255,.1)"); v.addColorStop(1, "rgba(0,0,0,.4)");
    g.fillStyle = v; g.fillRect(0, 0, S, S);
    return c;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    T_CUENTA.forEach((tc, i) => this.una("n" + i, t > tc, () => temblar(5 + i * 2, 0.15)));
    this.una("asoma", t > 2.85, () => temblar(3, 0.1));
    this.una("salto", t > 4.6, () => { temblar(10, 0.2); for (let k = 0; k < 12; k++) p.nueva(P.POLVO, XR_P + azar(-60, 60), 580, azar(-200, 200), azar(-80, -10), azar(0.4, 0.7), azar(30, 50)); });
    this.una("flash", t > T_FLASH, () => {
      temblar(20, 0.4);
      this.foto = this.revelar();
    });
    if (!this.foto && t > T_FLASH) this.foto = this.revelar();
    this.una("sale", t > T_FLASH + 0.9, () => { for (let k = 0; k < 18; k++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.CHISPA, 512, 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); } });
    this.una("tit", t > T_TIT, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Interfaz de la cámara de la máquina: esquinas, «cámara», cuenta atrás. */
  interfaz(g, t) {
    const { x, y, l } = CUADRO, h = l / 2, L = 46;
    // las esquinas verdes (con brillo) se pintan una vez
    if (!CT.has("esquinas")) {
      const c = lienzoNuevo(l + 60, l + 60), e = c.getContext("2d");
      e.translate(l / 2 + 30, l / 2 + 30);
      e.strokeStyle = "#2bff5b"; e.lineWidth = 6; e.lineCap = "round"; e.shadowColor = "#2bff5b"; e.shadowBlur = 10;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        e.beginPath(); e.moveTo(sx * h, sy * (h - L)); e.lineTo(sx * h, sy * h); e.lineTo(sx * (h - L), sy * h); e.stroke();
      }
      CT.set("esquinas", c);
    }
    g.drawImage(CT.get("esquinas"), x - l / 2 - 30, y - l / 2 - 30);
    // ● CÁMARA
    g.fillStyle = Math.sin(t * 6) > 0 ? "#ff3b3b" : "rgba(255,59,59,.3)"; g.beginPath(); g.arc(40, 40, 9, 0, 6.283); g.fill();
    txt(g, "CÁMARA", 58, 48, { tam: 24, peso: 800, color: "#fff", alin: "left", esp: 3 });
    txt(g, "FOTO PARA EL TOP 10", W - 30, 48, { tam: 20, peso: 800, color: "#2bff5b", alin: "right", esp: 2 });
    // ¡SONRÍE! y la cuenta atrás
    if (t > 1.5 && t < T_FLASH) txt(g, "¡SONRÍE!", 512, 588, { tam: 34, peso: 900, fam: FD, color: "#fffdf5", borde: "#000", bordeAncho: 6, esp: 4, alfa: Math.sin(t * 8) > -0.5 ? 1 : 0.5 });
    T_CUENTA.forEach((tc, i) => {
      const d = t - tc;
      if (d < 0 || d > 1.0) return;
      const k = tramo(d, 0, 0.14), s = lerp(2.2, 1, eIn(k)) * (1 - 0.15 * tramo(d, 0.6, 1.0));
      const clave = "n" + (3 - i);
      if (!CT.has(clave)) {
        const c = lienzoNuevo(260, 300), e = c.getContext("2d");
        txt(e, String(3 - i), 130, 250, { tam: 230, peso: 900, fam: FD, color: "#d8ffe0", borde: "#03230c", bordeAncho: 12, glow: "rgba(43,255,91,.8)", glowTam: 22 });
        CT.set(clave, c);
      }
      g.save(); g.translate(140, 380); g.scale(s, s); g.globalAlpha *= Math.min(1, k * 3) * (1 - tramo(d, 0.8, 1.0));
      g.drawImage(CT.get(clave), -130, -250);
      g.restore();
    });
  }
  dibujar(g) {
    const t = this.t, a = this.luz();
    fondo(g, "#000");
    if (t < T_FLASH + 0.12) {
      // lo que ve la cámara
      const e = this.posesCamara(t);
      g.save(); g.globalAlpha = a;
      this.escenaCamara(g, e, t);
      // fuera del cuadro de la foto, un poco más oscuro
      g.fillStyle = "rgba(0,0,0,.38)";
      const { x, y, l } = CUADRO;
      g.fillRect(-60, -60, x - l / 2 + 60, H + 120); g.fillRect(x + l / 2, -60, W, H + 120);
      g.fillRect(x - l / 2, -60, l, y - l / 2 + 60); g.fillRect(x - l / 2, y + l / 2, l, 200);
      this.interfaz(g, t);
      g.restore();
    } else {
      // plano general: la polaroid sale con los dos
      const e = this.posesFuera(t), d = t - T_FLASH;
      g.save(); g.globalAlpha = a;
      foco(g, 512, 512, PIES, 330, 0.8);
      pintarAvatar(g, e[0].m, e[0].pose, t);
      pintarAvatar(g, e[1].m, e[1].pose, t);
      const k = eOut(tramo(d, 0.35, 1.15)), cy = lerp(H + 260, 338, k), giro = -0.05 + 0.25 * Math.sin(Math.max(0, d - 0.35) * 5) * Math.exp(-Math.max(0, d - 0.35) * 2.2);
      if (d > 0.3) {
        const revela = tramo(d, 0.9, 2.4);
        polaroid(g, this.foto, 512, cy, 318, giro, (c, px, py, w, hh) => {
          txt(c, "¡FOTO DOBLE!", px + w / 2, py + hh * 0.7, { tam: 30, peso: 400, fam: FC, color: "#1d3a8a", esp: 2 });
        });
        // se va revelando: de oscuro a la foto
        if (revela < 1) {
          g.save(); g.translate(512, cy); g.rotate(giro);
          const m = 318 * 0.06, fw = 318 - 2 * m, hh = m + fw + 318 * 0.2;
          g.fillStyle = `rgba(28,24,30,${0.95 * (1 - revela)})`; g.fillRect(-159 + m, -hh / 2 + m, fw, fw);
          g.restore();
        }
      }
      g.restore();
    }
    this.p.dibujar(g);
    // flash
    const dF = t - T_FLASH;
    if (dF > 0 && dF < 0.75) { g.fillStyle = `rgba(255,255,255,${(dF < 0.15 ? 1 : 1 - (dF - 0.15) / 0.6) * a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // ¡FOTO DOBLE!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.5, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 92); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(840, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 155);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡FOTO DOBLE!", 420, 150, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,190,40,.85)", glowTam: 24, max: 780 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00144", nombre: "Foto doble", crear: () => new FotoDoble() });
})();
