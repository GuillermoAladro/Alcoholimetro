"use strict";
/*
 * 00174 · HACER EL PINO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sobre una colchoneta en el bar, Marcos reta a Guillermo: «¿UN PINO?». ¡HOP!: los dos se ponen boca abajo. Marcos
 * levanta una mano y aguanta el pino a una sola mano, saludando; Guillermo se tambalea, camina con las manos para no
 * caerse (¡AGUANTA!)… y se cae de lado (¡CATAPLOF!), mareado y con estrellitas. Marcos sigue tan pancho, a una mano.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4;
const XG = 420, XM = 760, YMG = 540, YMM = 528;               // dónde apoyan las manos
const PIV_G = [39, 14], PIV_M = [37, 38];
const T_RETO = 0.45, T_HOP = 1.35, T_PINO = 2.1, T_UNA = 3.0, T_TAMB = 3.6, T_TIT = 4.35, T_ANDA = 4.4, T_CAE = 6.05, T_SUELO = 6.5, T_APAGA = 9.95, DUR = 10.55;
const PASOS = 4, T_PASO = (T_CAE - T_ANDA) / PASOS, DX_PASO = 22;

function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(840, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 165);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c8ffd6"); gr.addColorStop(1, "#2bff5b");
  txt(g, "¡AGUANTA!", 426, 166, { tam: 150, peso: 400, fam: FC, color: "#03230c", esp: 6, max: 790 });
  txt(g, "¡AGUANTA!", 420, 160, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#03230c", bordeAncho: 14, esp: 6, glow: "rgba(43,255,91,.8)", glowTam: 26, max: 790 });
  CT.set("tit", c);
  return c;
}
function fondoSala() {
  if (CT.has("fondo")) return CT.get("fondo");
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, -60, 0, 500);
  gr.addColorStop(0, "#0b0d16"); gr.addColorStop(1, "#262a3c");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, 560);
  const r = semilla(41), cols = [BLOB.naranja, BLOB2.oro, BLOB2.cian, BLOB.rojo];
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 22; i++) { const x = r() * W, y = 30 + r() * 300, s = 30 + r() * 70; g.globalAlpha = 0.1 + r() * 0.15; g.drawImage(cols[i % 4], x - s / 2, y - s / 2, s, s); }
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  // suelo
  const gs = g.createLinearGradient(0, 470, 0, H + 60);
  gs.addColorStop(0, "#2a1a10"); gs.addColorStop(1, "#0a0604");
  g.fillStyle = gs; g.fillRect(-60, 470, W + 120, H - 410);
  // colchoneta azul en perspectiva
  const gm = g.createLinearGradient(0, 505, 0, 590);
  gm.addColorStop(0, "#1d4f9a"); gm.addColorStop(1, "#2f74d8");
  g.fillStyle = gm; g.beginPath(); g.moveTo(110, 505); g.lineTo(914, 505); g.lineTo(980, 590); g.lineTo(44, 590); g.closePath(); g.fill();
  g.fillStyle = "#123a74"; g.beginPath(); g.moveTo(44, 590); g.lineTo(980, 590); g.lineTo(980, 640); g.lineTo(44, 640); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = 2;
  for (const u of [0.33, 0.66]) { g.beginPath(); g.moveTo(lerp(110, 914, u), 505); g.lineTo(lerp(44, 980, u), 590); g.stroke(); }
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(110, 505, 804, 2);
  CT.set("fondo", c);
  return c;
}

class Pino extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** Guillermo: pose y matriz. */
  guillermo(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let m;
    if (t < T_HOP) {
      G.cara = t > T_RETO + 0.5 ? "guino" : "sonrisa"; G.rc = t > T_RETO + 0.5 ? 0.08 : 0;
      // se frota las manos: acepta el reto
      if (t > 0.95) { const s = Math.sin(t * 30) * 3; G.brazoIDelante = true; G.manoD = [48 + s, 120]; G.manoI = [30 - s, 122]; }
      m = matAv(XG, PIES, ESC);
    } else if (t < T_PINO) {
      const k = eInOut(tramo(t, T_HOP, T_PINO));
      const yc = lerp(PIES - 116 * ESC, YMG - (116 - PIV_G[1]) * ESC, k) - Math.sin(k * Math.PI) * 50;
      G.manoD = mezcla([84, 70], [80, 14], k); G.manoI = mezcla([-6, 70], [-2, 14], k);
      G.piernaI = [0, 0.2 * Math.sin(k * Math.PI)]; G.piernaD = [0, -0.2 * Math.sin(k * Math.PI)];
      G.cara = "risa";
      m = matAv(XG, yc, ESC, Math.PI * k, 1, 1, [39, 116]);
    } else if (t < T_CAE) {
      // boca abajo: aguanta, se tambalea y camina con las manos hacia la izquierda
      const tamb = tramo(t, T_TAMB, T_CAE), amp = 0.02 + 0.13 * tamb;
      let giro = Math.PI + Math.sin(t * (6 + 6 * tamb)) * amp;
      let x = XG, mD = [80, 14], mI = [-2, 14];
      if (t > T_ANDA) {
        const n = (t - T_ANDA) / T_PASO, i = Math.floor(n), f = n - i;
        x = XG - DX_PASO * (i + eInOut(f));
        // levanta la mano de delante (manoD: a la izquierda de la pantalla) y luego la otra
        const sube = Math.sin(clamp(f * 2, 0, 1) * Math.PI) * 9, sube2 = Math.sin(clamp(f * 2 - 1, 0, 1) * Math.PI) * 9;
        mD = [80 + 10 * Math.sin(clamp(f * 2, 0, 1) * Math.PI), 14 + sube]; mI = [-2 - 6 * Math.sin(clamp(f * 2 - 1, 0, 1) * Math.PI), 14 + sube2];
        giro += 0.06 * Math.sin(n * Math.PI * 2);
      }
      G.manoD = mD; G.manoI = mI;
      const fl = 0.08 + 0.4 * tamb;
      G.piernaI = [-4 * tamb * Math.max(0, Math.sin(t * 13)), fl * Math.sin(t * 9)]; G.piernaD = [-4 * tamb * Math.max(0, -Math.sin(t * 13)), -fl * Math.sin(t * 9 + 1)];
      G.cara = t < T_UNA + 0.4 ? "dormido" : t < T_TAMB + 0.2 ? "sorpresa" : "sorpresa";
      G.rc = 0.05 * Math.sin(t * 7) * tamb;
      m = matAv(x, YMG, ESC, giro, 1, 1, PIV_G);
    } else {
      // se cae de lado (las piernas hacia la izquierda) y se queda tumbado, mareado
      const x = XG - DX_PASO * PASOS;
      const k = eIn(tramo(t, T_CAE, T_SUELO)), bote = t > T_SUELO ? Math.sin(tramo(t, T_SUELO, T_SUELO + 0.3) * Math.PI) * 10 : 0;
      const giro = lerp(Math.PI, Math.PI / 2, k);
      G.manoD = mezcla([80, 14], [70, 40], k); G.manoI = mezcla([-2, 14], [4, 30], k);
      G.piernaI = [0, 0.3 * (1 - k)]; G.piernaD = [0, -0.2 * (1 - k)];
      G.cara = t < T_SUELO + 0.3 ? "sorpresa" : "borracho";
      G.rc = t > T_SUELO + 0.3 ? 0.12 * Math.sin(t * 4) : 0;
      // levanta un brazo, flojito: «estoy bien»
      if (t > 8.2) { G.manoD = mezcla(G.manoD, [96 + 4 * Math.sin(t * 5), 70], eOut(tramo(t, 8.2, 8.5))); }
      m = matAv(x, YMG - 26 * k - bote, ESC, giro, 1, 1, PIV_G);
    }
    return { pose: G, m };
  }
  /** Marcos: pose y matriz. */
  marcos(t) {
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let m;
    if (t < T_HOP) {
      // ¿un pino? (señala la colchoneta)
      const k = eOut(tramo(t, T_RETO, T_RETO + 0.25)) * (1 - eInOut(tramo(t, 1.1, 1.3)));
      M.brazoIDelante = true; M.manoI = mezcla(M.manoI, [-30, 150], k);
      M.cara = t > T_RETO ? "guino" : "sonrisa"; M.rc = -0.08;
      m = matAv(XM, PIES, ESC);
    } else if (t < T_PINO) {
      const k = eInOut(tramo(t, T_HOP, T_PINO));
      const yc = lerp(PIES - 116 * ESC, YMM - (116 - PIV_M[1]) * ESC, k) - Math.sin(k * Math.PI) * 50;
      M.manoD = mezcla([78, 70], [60, 38], k); M.manoI = mezcla([-4, 70], [14, 38], k);
      M.cara = "risa";
      m = matAv(XM, yc, ESC, -Math.PI * k, 1, 1, [37, 116]);
    } else {
      // pino a dos manos y luego a una (el cuerpo se inclina sobre la mano que apoya)
      const k = eInOut(tramo(t, T_UNA, T_UNA + 0.4));
      const piv = [37 + 25 * k, 38], x = XM - 35 * k;
      let giro = Math.PI - 0.227 * k + 0.015 * Math.sin(t * 3);
      M.manoD = [62, 38];
      M.manoI = mezcla([14, 38], [-44, 96 + 14 * Math.sin(t * 8) * k], k);
      M.piernaI = [0, 0.06]; M.piernaD = [0, -0.06];
      M.cara = t < T_UNA + 0.3 ? "sonrisa" : "guino";
      if (t > T_TAMB && t < T_CAE) M.cara = "risa";
      if (t > T_CAE && t < T_SUELO + 0.4) M.cara = "sorpresa";
      if (t > T_SUELO + 0.4) M.cara = t > 8.6 && t < 9.3 ? "guino" : "risa";
      // al final, saltitos sobre una mano
      let dy = 0;
      if (t > 7.6) { const s = Math.abs(Math.sin((t - 7.6) * 6)); dy = -s * 16; M.manoD = [62, 38 - s * 8]; }
      giro -= 0.02 * Math.sin(t * 1.7);
      m = matAv(x, YMM + dy, ESC, giro, 1, 1, piv);
    }
    return { pose: M, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const polvo = (x, y, n) => { for (let i = 0; i < n; i++) p.nueva(P.POLVO, x + azar(-40, 40), y, azar(-150, 150), azar(-50, -5), azar(0.4, 0.8), azar(24, 40)); };
    this.una("hop", t > T_PINO, () => { temblar(8, 0.25); polvo(XG, YMG, 8); polvo(XM, YMM, 8); });
    this.una("una", t > T_UNA + 0.4, () => {
      const q = [XM - 35, YMM];
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(120, 300); p.nueva(P.PURPURINA, q[0], q[1] - 200, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1), azar(8, 12)); }
    });
    for (let i = 0; i < PASOS; i++) this.una("paso" + i, t > T_ANDA + (i + 0.5) * T_PASO, () => polvo(XG - DX_PASO * (i + 1) - 40, YMG, 3));
    this.una("cae", t > T_SUELO, () => { temblar(18, 0.45); polvo(XG - DX_PASO * PASOS - 150, YMG, 22); });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  ono(g, s, x, y, t0, dur, tam, color, rot) {
    const d = this.t - t0;
    if (d < 0 || d > dur) return;
    const k = eBack(tramo(d, 0, 0.1));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color, borde: "#1a1a1a", bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
    g.restore();
  }
  dibujar(g) {
    // lo caro (textos con brillo, fondos) se prepara en el primer cuadro, que es negro
    if (!this._pre) { this._pre = true; titulo(); fondoSala(); }
    const t = this.t, a = this.luz();
    fondo(g, "#000");
    g.drawImage(fondoSala(), -60, -60);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3; g.drawImage(BLOB2.oroClaro, 120, 120, 784, 520); g.restore();
    const eG = this.guillermo(t), eM = this.marcos(t);
    // sombras de apoyo
    g.fillStyle = "rgba(0,0,0,.35)";
    for (const [e, y] of [[eG, YMG], [eM, YMM]]) { const q = aPant(e.m, [39, 116]); g.beginPath(); g.ellipse(q[0], y + 6, 70, 10, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, eG.m, eG.pose, t);
    pintarAvatar(g, eM.m, eM.pose, t);
    // estrellitas alrededor de la cabeza de Guillermo
    if (t > T_SUELO + 0.2) {
      const c = aPant(eG.m, [39, 30]), al = tramo(t, T_SUELO + 0.2, T_SUELO + 0.5);
      for (let i = 0; i < 4; i++) {
        const an = t * 4 + (i * Math.PI) / 2, x = c[0] + Math.cos(an) * 60, y = c[1] - 70 + Math.sin(an) * 16;
        g.save(); g.globalAlpha = al; g.fillStyle = i % 2 ? "#ffd34d" : "#fffdf5"; estrella(g, x, y, 11, 5, an); g.fill(); g.restore();
      }
    }
    this.p.dibujar(g);
    // ¿UN PINO?
    const bM = aPant(eM.m, boca(eM.pose.rc, "marcos"));
    const kB = tramo(t, T_RETO, T_RETO + 0.2) * (1 - tramo(t, 1.15, 1.3));
    if (kB > 0) bocadillo(g, bM[0] - 150, bM[1] - 120, "¿UN PINO?", bM[0] - 20, bM[1] - 30, kB, 42);
    this.ono(g, "¡HOP!", 590, 250, T_PINO - 0.15, 0.55, 64, "#ffd34d", -0.06);
    this.ono(g, "¡A UNA MANO!", XM - 30, 220, T_UNA + 0.4, 0.9, 40, "#2fe3e8", 0.06);
    this.ono(g, "¡CATAPLOF!", 270, 330, T_SUELO, 0.9, 64, "#ff3d84", -0.08);
    // ¡AGUANTA! (tiembla mientras Guillermo se tambalea)
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const tiembla = t < T_SUELO ? 1 : 0.2, r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512 + Math.sin(t * 40) * 3 * tiembla, 96 + Math.cos(t * 37) * 2 * tiembla); g.rotate(-0.04 + 0.03 * Math.sin(t * 9) * tiembla); g.scale(s * 0.86, s * 0.86);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00174", nombre: "Hacer el pino", crear: () => new Pino() });
})();
