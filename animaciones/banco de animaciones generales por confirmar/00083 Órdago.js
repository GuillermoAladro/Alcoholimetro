"use strict";
/*
 * 00083 · ÓRDAGO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Partida de mus: le reparten cuatro cartas, las coge en abanico y las mira de reojo (cara de póquer… y guiño).
 * Se frota la barbilla tramando algo, coge aire y grita ¡ÓRDAGO! con tanta fuerza que las cartas salen volando
 * hacia la pantalla y se quedan pegadas delante: los cuatro reyes. Las cartas caen y se apaga la luz.
 */
(() => {
const ESC = 1.5, AX = 512, AY = 540;
const CW = 66, CH = 100; // carta a escala 1 (px)
const PALOS = ["oros", "copas", "espadas", "bastos"];
const COL = { oros: "#c98a00", copas: "#c4161c", espadas: "#1f4fb0", bastos: "#2f7a2a" };
const cache = cacheTexto();

// ---------------------------------------------------------------- cartas (pintadas una vez a 3×)
function palo(g, p, s) {
  g.save(); g.scale(s, s); g.lineJoin = "round";
  if (p === "oros") {
    const gr = g.createRadialGradient(-5, -5, 2, 0, 0, 16);
    gr.addColorStop(0, "#fff3a0"); gr.addColorStop(1, "#d99a00");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 15, 0, 6.283); g.fill();
    g.strokeStyle = "#7a4d00"; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.arc(0, 0, 9, 0, 6.283); g.stroke();
    g.fillStyle = "#c4161c"; g.beginPath(); g.arc(0, 0, 4, 0, 6.283); g.fill();
  } else if (p === "copas") {
    g.fillStyle = "#e0a400"; g.strokeStyle = "#6e3a00"; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(-14, -12); g.lineTo(14, -12); g.quadraticCurveTo(13, 4, 3, 6); g.lineTo(3, 12); g.lineTo(9, 16); g.lineTo(-9, 16); g.lineTo(-3, 12); g.lineTo(-3, 6); g.quadraticCurveTo(-13, 4, -14, -12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c4161c"; g.beginPath(); g.ellipse(0, -11, 13, 3.4, 0, 0, 6.283); g.fill();
  } else if (p === "espadas") {
    g.fillStyle = "#9fc3f0"; g.strokeStyle = "#1f3f80"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(0, -20); g.lineTo(4, -14); g.lineTo(3.5, 8); g.lineTo(-3.5, 8); g.lineTo(-4, -14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e0a400"; rectR(g, -11, 8, 22, 4, 2); g.fill(); g.stroke();
    g.fillStyle = "#1f4fb0"; rectR(g, -2.6, 12, 5.2, 8, 2); g.fill();
    g.fillStyle = "#e0a400"; g.beginPath(); g.arc(0, 21, 3, 0, 6.283); g.fill();
  } else {
    g.fillStyle = "#3f8a2c"; g.strokeStyle = "#1f4a14"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-3, 19); g.lineTo(3, 19); g.lineTo(7, -14); g.quadraticCurveTo(0, -24, -7, -14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#8ad06a";
    for (const [x, y] of [[-4, -8], [5, -2], [-3, 5], [4, 11]]) { g.beginPath(); g.arc(x, y, 2.4, 0, 6.283); g.fill(); }
  }
  g.restore();
}
function lienzoCarta(cual) {
  if (cache.has(cual)) return cache.get(cual);
  const S = 3, c = lienzoNuevo(CW * S, CH * S), g = c.getContext("2d");
  g.scale(S, S);
  rectR(g, 0.5, 0.5, CW - 1, CH - 1, 6); g.fillStyle = "#fbf7ee"; g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1; g.stroke();
  if (cual === "dorso") {
    rectR(g, 5, 5, CW - 10, CH - 10, 4); g.fillStyle = "#b3202a"; g.fill();
    g.save(); rectR(g, 5, 5, CW - 10, CH - 10, 4); g.clip();
    g.strokeStyle = "rgba(255,210,170,.45)"; g.lineWidth = 1.2;
    for (let k = -CH; k < CW + CH; k += 8) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + CH, CH); g.moveTo(k + CH, 0); g.lineTo(k, CH); g.stroke(); }
    g.restore();
    g.fillStyle = "#fbf7ee"; g.beginPath(); g.moveTo(CW / 2, CH / 2 - 24); g.lineTo(CW / 2 + 17, CH / 2); g.lineTo(CW / 2, CH / 2 + 24); g.lineTo(CW / 2 - 17, CH / 2); g.closePath(); g.fill();
    g.fillStyle = "#e0a400"; estrella(g, CW / 2, CH / 2, 11, 4.6, 0); g.fill();
  } else {
    const col = COL[cual];
    // marco con las "pintas" (cortes) del palo
    g.strokeStyle = col; g.lineWidth = 1.6;
    g.strokeRect(5, 5, CW - 10, CH - 10);
    g.fillStyle = "#fbf7ee"; g.fillRect(14, 3, 14, 5); g.fillRect(CW - 28, CH - 8, 14, 5);
    txt(g, "12", 9, 18, { tam: 13, peso: 800, fam: FT, color: col, alin: "left" });
    txt(g, "12", CW - 9, CH - 9, { tam: 13, peso: 800, fam: FT, color: col, alin: "right" });
    // el rey: corona, REY y el palo
    g.save(); g.translate(CW / 2 + 4, 27); corona(g, 26); g.restore();
    txt(g, "REY", CW / 2 + 4, 38, { tam: 9, peso: 800, fam: FT, color: "#5a4a3a", esp: 1.5 });
    g.save(); g.translate(CW / 2 - 2, 64); palo(g, cual, 1.0); g.restore();
  }
  cache.set(cual, c);
  return c;
}
/** Carta centrada en (0,0). volteo: cos del giro sobre su eje vertical (<0 enseña el dorso). plano: 0–1 aplastada en la mesa. */
function carta(g, cual, x, y, rot, esc, volteo = 1, plano = 1) {
  const spr = lienzoCarta(volteo < 0 ? "dorso" : cual);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(esc * Math.max(0.04, Math.abs(volteo)), esc * plano);
  g.fillStyle = "rgba(0,0,0,.28)"; rectR(g, -CW / 2 + 3, -CH / 2 + 4, CW, CH, 6); g.fill();
  g.drawImage(spr, -CW / 2, -CH / 2, CW, CH);
  g.restore();
}

// ---------------------------------------------------------------- el grito, pintado una vez
function lienzoGrito() {
  if (cache.has("grito")) return cache.get("grito");
  const c = lienzoNuevo(760, 260), g = c.getContext("2d");
  g.translate(380, 130);
  // explosión de cómic
  for (const [R, r, col] of [[200, 120, "#ff3d84"], [170, 100, "#ffd34d"]]) {
    g.beginPath();
    for (let i = 0; i < 28; i++) { const a = (i / 28) * 6.283, rr = i % 2 ? r : R * (0.85 + 0.15 * ((i * 7) % 3) / 2); g.lineTo(Math.cos(a) * rr * 1.75, Math.sin(a) * rr * 0.62); }
    g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 5; g.strokeStyle = "#1a0a00"; g.stroke();
  }
  txt(g, "¡ÓRDAGO!", 0, 40, { tam: 118, peso: 400, fam: FC, color: "#fffdf5", borde: "#1a0a00", bordeAncho: 13, esp: 4 });
  cache.set("grito", c);
  return c;
}

function lienzoMesa() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  // canto de madera
  const gm = g.createLinearGradient(0, 560, 0, H);
  gm.addColorStop(0, "#6b3a16"); gm.addColorStop(1, "#2e1606");
  g.fillStyle = gm; g.beginPath(); g.moveTo(118, 566); g.lineTo(906, 566); g.lineTo(912, H + 5); g.lineTo(112, H + 5); g.closePath(); g.fill();
  // tablero
  g.fillStyle = "#7a4520"; g.beginPath(); g.moveTo(230, 398); g.lineTo(794, 398); g.lineTo(912, 568); g.lineTo(112, 568); g.closePath(); g.fill();
  // tapete verde
  const gt = g.createLinearGradient(0, 410, 0, 556);
  gt.addColorStop(0, "#155f2e"); gt.addColorStop(1, "#1f8a42");
  g.fillStyle = gt; g.beginPath(); g.moveTo(252, 410); g.lineTo(772, 410); g.lineTo(878, 556); g.lineTo(146, 556); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,240,180,.35)"; g.lineWidth = 2; g.stroke();
  g.strokeStyle = "rgba(255,210,150,.3)"; g.beginPath(); g.moveTo(230, 398); g.lineTo(794, 398); g.stroke();
  return c;
}

const MESA_CARTAS = [[422, 488], [474, 492], [526, 492], [578, 488]];
const FINAL = [[300, 470, -0.32], [436, 440, -0.11], [588, 440, 0.11], [724, 470, 0.32]];
const T_GRITO = 4.35;

class Ordago extends Escena {
  constructor() {
    super(9.2);
    this.p = new Parts(420);
    this.mesa = lienzoMesa();
    this.vuelo = null;
  }
  /** El abanico en la mano izquierda (unidades de avatar): ángulo y desplazamiento de cada carta. */
  abanico(i, t) {
    const abre = eBack(tramo(t, 1.95, 2.25));
    const a = (i - 1.5) * 0.24 * abre, mira = t > 2.25 && t < 3.3 ? 0.12 * Math.sin(tramo(t, 2.25, 3.3) * Math.PI) : 0;
    return { a: a - 0.08 + mira, dx: Math.sin(a) * 34, dy: -Math.cos(a) * 34 };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1;
    // coge las cartas de la mesa y las abre en la mano izquierda
    // levanta la mano izquierda y las cartas le saltan de la mesa a la mano
    const kSube = eBack(tramo(t, 1.4, 1.75));
    manoI = mezcla(manoI, [24, 128], kSube);
    if (t > 1.4 && t < 1.98) pose.cara = "guino";
    if (t > 2.25 && t < 2.6) { pose.cara = "sorpresa"; pose.rc = -0.08; }
    if (t >= 2.6 && t < 3.25) { pose.cara = "guino"; pose.rc = 0.06; }
    // se frota la barbilla: está tramando algo
    const kE = eInOut(tramo(t, 3.15, 3.45)) * (1 - eInOut(tramo(t, 3.8, 4.05)));
    manoD = mezcla(manoD, [56 + 3 * Math.sin(t * 22), 66 + 2 * Math.cos(t * 22)], kE);
    manoD = mezcla(manoD, [74, 140], eInOut(tramo(t, 3.8, 4.05)));
    if (t > 3.2 && t < 3.9) { pose.cara = "guino"; pose.rc = 0.05; }
    // coge aire…
    const kAire = eInOut(tramo(t, 3.9, T_GRITO - 0.05));
    if (t > 3.9 && t < T_GRITO) { pose.cara = "dormido"; sy = 1 + 0.06 * kAire; sx = 1 + 0.05 * kAire; pose.rc = -0.12 * kAire; }
    // …y ¡ÓRDAGO!
    if (t >= T_GRITO) {
      const k = eOut(tramo(t, T_GRITO, T_GRITO + 0.12));
      manoD = mezcla([74, 140], [112, 62], k); manoI = mezcla([24, 128], [-34, 62], k);
      pose.cara = "sorpresa"; pose.rc = 0.05 * Math.sin(t * 50) * (1 - tramo(t, 5.2, 5.6));
      pose.puntas = eBack(tramo(t, T_GRITO, T_GRITO + 0.2)) * (1 - tramo(t, 5.9, 6.6));
      sy = lerp(1.06, 1, eOut(tramo(t, T_GRITO, T_GRITO + 0.3)));
      if (t > 5.5) {
        pose.cara = "risa"; pose.rc = 0.06 * Math.sin(t * 6);
        const k2 = eInOut(tramo(t, 5.5, 5.9)), b = Math.sin(t * 10) * 4;
        manoD = mezcla(manoD, [100, 20 + b], k2); manoI = mezcla(manoI, [-22, 20 - b], k2);
      }
    }
    // las cartas en la mano (por detrás de los dedos)
    if (t >= 1.98 && t < T_GRITO) {
      pose.objI = (g, m) => {
        for (let i = 0; i < 4; i++) {
          const f = this.abanico(i, t);
          carta(g, PALOS[i], m[0] + f.dx * 0.9 + 2, m[1] + f.dy * 0.9 + 4, f.a, 1 / ESC * 0.95, -1);
        }
      };
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(AX, AY, ESC, 0, sx, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (let i = 0; i < 4; i++) this.una("reparte" + i, t > 0.62 + i * 0.18, () => temblar(2, 0.08));
    // al gritar, las cartas salen de la mano hacia la pantalla
    this.una("grito", t >= T_GRITO, () => {
      temblar(30, 0.8);
      const e = this.estado(), mano = e.pose._manoI || [24, 128];
      this.vuelo = [0, 1, 2, 3].map((i) => {
        const f = this.abanico(i, T_GRITO - 0.01), q = aPant(e.m, [mano[0] + f.dx * 0.9 + 2, mano[1] + f.dy * 0.9 + 4]);
        return { x0: q[0], y0: q[1], a0: f.a, t0: T_GRITO + i * 0.07 };
      });
      const b = aPant(e.m, boca(0));
      for (let i = 0; i < 30; i++) { const a = azar(-Math.PI, 0), v = azar(300, 800); p.nueva(P.CHISPA, b[0], b[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
    });
    this.una("pegan", t > T_GRITO + 0.62, () => temblar(16, 0.35));
    if (t > T_GRITO && t < T_GRITO + 0.5 && Math.random() < 60 * dt) {
      const a = azar(0, 6.283), r = azar(80, 200);
      p.nueva(P.POLVO, AX + Math.cos(a) * r, 270 + Math.sin(a) * r * 0.6, Math.cos(a) * 500, Math.sin(a) * 300, azar(0.3, 0.6), azar(20, 40));
    }
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // luz de la lámpara
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
    g.drawImage(BLOB2.oroClaro, 150, 130, 724, 520); g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    g.drawImage(this.mesa, 0, 0);
    // reparto: vuelan desde arriba a la derecha y caen boca abajo en la mesa; luego van a la mano
    if (t > 0.3 && t < 1.98) {
      for (let i = 0; i < 4; i++) {
        const t0 = 0.3 + i * 0.18, u = eOut(tramo(t, t0, t0 + 0.32));
        if (t < t0) continue;
        const M = MESA_CARTAS[i];
        let x = lerp(1080, M[0], u), y = lerp(-90, M[1], u) - 70 * Math.sin(u * Math.PI), rot = (1 - u) * 7 + (i - 1.5) * 0.08, plano = lerp(1, 0.42, u), esc = lerp(1.2, 1.05, u);
        const kc = eInOut(tramo(t, 1.55 + i * 0.07, 1.8 + i * 0.05));
        if (kc > 0) {
          const q = aPant(e.m, [24, 128]);
          x = lerp(x, q[0], kc); y = lerp(y, q[1] - 40, kc) - Math.sin(kc * Math.PI) * 90; plano = lerp(plano, 1, kc); esc = lerp(esc, 0.95, kc); rot = lerp(rot, 0, kc) + Math.sin(kc * Math.PI) * 2;
        }
        carta(g, PALOS[i], x, y, rot, esc, -1, plano);
      }
    }
    // las cartas volando hacia la pantalla y pegadas delante
    if (this.vuelo) {
      for (let i = 0; i < 4; i++) {
        const v = this.vuelo[i], F = FINAL[i], u = tramo(t, v.t0, v.t0 + 0.55), ue = eOut(u);
        const cae = tramo(t, 7.9 + i * 0.1, 8.5 + i * 0.1);
        let x = lerp(v.x0, F[0], ue) + Math.sin(u * Math.PI) * (i - 1.5) * 90, y = lerp(v.y0, F[1], ue) - Math.sin(u * Math.PI) * 140;
        const esc = lerp(0.95, 2.05, eIn(u) * 0.4 + ue * 0.6) * (u >= 1 ? 1 + 0.06 * Math.exp(-(t - v.t0 - 0.55) * 8) : 1);
        const volteo = Math.cos(u * Math.PI * 4);
        let rot = lerp(v.a0, F[2], ue) + Math.sin(u * Math.PI) * 1.4 * (i % 2 ? 1 : -1);
        y += eIn(cae) * 700; rot += cae * (i % 2 ? 0.8 : -0.8);
        if (t >= v.t0) carta(g, PALOS[i], x, y, rot, esc, volteo);
      }
    }
    // rayas de viento del grito
    if (t > T_GRITO && t < T_GRITO + 0.7) {
      const b = aPant(e.m, boca(e.pose.rc)), k = tramo(t, T_GRITO, T_GRITO + 0.7);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; g.lineWidth = 4; g.lineCap = "round";
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * 6.283 + 0.2, r0 = 70 + k * 260, r1 = r0 + 70;
        g.beginPath(); g.moveTo(b[0] + Math.cos(a) * r0, b[1] + Math.sin(a) * r0 * 0.75); g.lineTo(b[0] + Math.cos(a) * r1, b[1] + Math.sin(a) * r1 * 0.75); g.stroke();
      }
      g.restore();
    }
    this.p.dibujar(g);
    // ¡ÓRDAGO!
    if (t > T_GRITO) {
      const b = aPant(e.m, boca(0)), k = tramo(t, T_GRITO, T_GRITO + 0.25), spr = lienzoGrito();
      const s = lerp(0.15, 0.76, eBack(k)) * (1 + 0.03 * Math.sin(t * 9));
      const x = lerp(b[0], AX, eOut(k)) + (t < T_GRITO + 0.9 ? azar(-4, 4) : 0), y = lerp(b[1], 92, eOut(k));
      g.save(); g.translate(x, y); g.rotate(-0.04); g.scale(s, s); g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // fundido de entrada y de salida
    const a = Math.max(1 - tramo(t, 0, 0.35), tramo(t, 8.55, this.dur - 0.05));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00083", nombre: "Órdago", crear: () => new Ordago() });
})();
