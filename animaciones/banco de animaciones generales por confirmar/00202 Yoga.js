"use strict";
/*
 * 00202 · YOGA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Clase de yoga en la playa al atardecer, cada uno en su esterilla. Saludo al sol, guerrero, árbol: Marcos, con los
 * ojos cerrados, perfecto («ommm»); Guillermo espía de reojo y cada postura le cuesta más. En el árbol se tambalea,
 * se tambalea… y cae tieso como un árbol talado (¡ÁRBOL VA!). Marcos abre un ojo, lo mira y sigue a lo suyo: ¡OMMM!
 * Guillermo, tumbado en la arena, levanta el pulgar. El sol se pone y todo se queda a oscuras.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.6, ESC = 1.4, XG = 250, XM = 720, HORIZ = 330;
const T_P1 = 0.7, T_P2 = 2.5, T_P3 = 4.3, T_CAE = 6.3, T_SUELO = 7.0;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(700, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe3f0"); gr.addColorStop(1, "#ff8ac0");
  g.save(); g.translate(350, 110);
  txt(g, "¡OMMM!", 6, 64, { tam: 160, peso: 400, fam: FB, color: "#4a0a3a", esp: 8 });
  txt(g, "¡OMMM!", 0, 56, { tam: 160, peso: 400, fam: FB, color: gr, borde: "#4a0a3a", bordeAncho: 11, esp: 8, glow: "rgba(255,140,200,.95)", glowTam: 30 });
  g.restore();
  cache.set("t", c);
  return c;
}

class Yoga extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.fondoC = null;
    this.oms = [];
  }
  /** Mezcla de posturas: 0 de pie, 1 saludo al sol, 2 guerrero, 3 árbol. */
  postura(t) {
    const k1 = eInOut(tramo(t, T_P1, T_P1 + 0.6)), k2 = eInOut(tramo(t, T_P2, T_P2 + 0.6)), k3 = eInOut(tramo(t, T_P3, T_P3 + 0.6));
    return { k1, k2, k3 };
  }
  brazos(q, t) {
    const R = q === "marcos";
    const reposo = R ? [[67, 152], [6, 152]] : [[70, 158], [9, 160]];
    const sol = R ? [[80, 40], [-6, 40]] : [[100, 20], [-22, 20]];
    const guer = R ? [[122, 93], [-48, 93]] : [[143, 86], [-65, 86]];
    const arb = R ? [[44, 118], [30, 118]] : [[46, 112], [32, 112]];
    const { k1, k2, k3 } = this.postura(t);
    let d = mezcla(reposo[0], sol[0], k1), i = mezcla(reposo[1], sol[1], k1);
    d = mezcla(d, guer[0], k2); i = mezcla(i, guer[1], k2);
    d = mezcla(d, arb[0], k3); i = mezcla(i, arb[1], k3);
    return [d, i];
  }
  piernas(t, temblor) {
    const { k2, k3 } = this.postura(t);
    const abre = 0.3 * k2 * (1 - k3);
    const sube = k3;
    return { piernaI: [0, abre], piernaD: [-60 * sube, -abre * (1 - sube) + 0.42 * sube + temblor], baja: 86 * (1 - Math.cos(abre)) };
  }
  poseM(t) {
    const pose = { quien: "marcos", cara: "dormido", rc: 0, brazoIDelante: true };
    const [d, i] = this.brazos("marcos", t);
    pose.manoD = d; pose.manoI = i;
    const pi = this.piernas(t, 0);
    pose.piernaI = pi.piernaI; pose.piernaD = pi.piernaD;
    pose.cara = t < T_P1 ? "sonrisa" : "dormido";
    // abre un ojo y mira a Guillermo
    if (t > T_SUELO + 0.2 && t < T_SUELO + 1.2) { pose.cara = "guino"; pose.rc = -0.18 * eOut(tramo(t, T_SUELO + 0.2, T_SUELO + 0.45)); }
    if (t > T_SUELO + 1.2) pose.rc = -0.18 * (1 - eInOut(tramo(t, T_SUELO + 1.2, T_SUELO + 1.5)));
    const resp = 1 + 0.012 * Math.sin(t * 2.4);
    return { pose, m: matAv(XM, PIES + pi.baja * ESC, ESC, 0, 1, resp) };
  }
  poseG(t) {
    const pose = { cara: "sonrisa", rc: 0, brazoIDelante: true };
    let [d, i] = this.brazos("guillermo", t);
    // tiembla en el guerrero y se tambalea en el árbol
    const tiemblaG = t > T_P2 + 0.6 && t < T_P3 ? 0.012 * Math.sin(t * 40) : 0;
    const ta = tramo(t, T_P3 + 0.6, T_CAE), amp = 0.02 + 0.2 * ta * ta;
    let giro = t > T_P3 + 0.6 && t < T_CAE ? amp * Math.sin((t - T_P3) * (5 + 4 * ta)) : 0;
    giro += tiemblaG;
    pose.cara = t < T_P1 ? "sonrisa" : t < 1.6 ? "dormido" : t < 2.2 ? "guino" : t < 3.3 ? "dormido" : t < 3.9 ? "guino" : t < 5.3 ? "dormido" : "sorpresa";
    if ((t > 1.6 && t < 2.2) || (t > 3.3 && t < 3.9)) pose.rc = 0.12;
    if (t > 5.3 && t < T_CAE) {
      // brazos como aspas para no caerse
      const k = eInOut(tramo(t, 5.3, 5.6));
      d = mezcla(d, [104, 40 + 40 * Math.sin(t * 13)], k); i = mezcla(i, [-26, 40 - 40 * Math.sin(t * 13)], k);
      pose.rc = -giro * 0.8;
    }
    const pi = this.piernas(t, 0);
    pose.piernaI = pi.piernaI; pose.piernaD = pi.piernaD;
    let lift = 0;
    if (t >= T_CAE) {
      // ¡cae tieso! con el pie levantado y las manos juntas
      const u = tramo(t, T_CAE, T_SUELO);
      const g0 = giro;
      giro = lerp(0.06, Math.PI / 2, eIn(u));
      if (t >= T_SUELO) { const dd = t - T_SUELO; giro = Math.PI / 2 - 0.08 * Math.abs(Math.sin(dd * 12)) * Math.exp(-dd * 6); }
      void g0;
      d = [46, 112]; i = [32, 112];
      pose.cara = t < T_SUELO ? "sorpresa" : t < 8.1 ? "borracho" : "risa";
      pose.rc = 0;
      lift = (78 - 27) * ESC * Math.sin(giro) * 0.92;
      if (t > 8.1) { const k = eOut(tramo(t, 8.1, 8.4)); i = mezcla(i, [-58, 96], k); pose.puntas = 0; }
    }
    pose.manoD = d; pose.manoI = i;
    if (t > 5.5 && t < T_SUELO) pose.puntas = 0.5;
    const m = matAv(XG - 12 * ESC, PIES + pi.baja * ESC - lift, ESC, giro, 1, 1, [27, 232]);
    return { pose, m, giro };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // «ommm» que flotan
    if (t > 1.0 && t < 9.4 && (t * 10 | 0) % 16 === 0 && (this._omT == null || t - this._omT > 1.2)) {
      this._omT = t;
      this.oms.push({ x: XM + azar(-30, 50), y: 200, v: 2.0, s: azar(34, 42) });
      if (t < T_CAE) this.oms.push({ x: XG + azar(-20, 40), y: 190, v: 1.6, s: azar(24, 28), g: true });
    }
    for (const o of this.oms) { o.y -= 40 * dt; o.v -= dt; }
    this.oms = this.oms.filter((o) => o.v > 0);
    if (t > T_P2 + 0.8 && t < T_CAE && Math.random() < 3 * dt) { const e = this.poseG(t), q = aPant(e.m, [70, 34]); this.gotas = this.gotas || []; this.gotas.push({ x: q[0], y: q[1], vy: 40, v: 0.9 }); }
    this.gotas = (this.gotas || []).filter((d) => (d.v -= dt) > 0);
    for (const d of this.gotas) { d.vy += 500 * dt; d.y += d.vy * dt; }
    this.una("suelo", t > T_SUELO, () => {
      temblar(20, 0.45);
      for (let i = 0; i < 26; i++) p.nueva(P.POLVO, XG + azar(0, 340), PIES - azar(0, 20), azar(-200, 200), azar(-220, -30), azar(0.7, 1.3), azar(30, 60));
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, HORIZ);
    gc.addColorStop(0, "#3a1a5a"); gc.addColorStop(0.45, "#c2408a"); gc.addColorStop(0.8, "#ff8a4a"); gc.addColorStop(1, "#ffd27a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, HORIZ + 60);
    g.fillStyle = "rgba(255,200,230,.35)";
    for (const [x, y, w] of [[120, 120, 220], [620, 70, 300], [820, 180, 160]]) { rectR(g, x, y, w, 14, 7); g.fill(); rectR(g, x + 40, y + 18, w * 0.6, 10, 5); g.fill(); }
    this.fondoC = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(t), eM = this.poseM(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // el sol que se pone
    const sy = HORIZ - 70 + 110 * tramo(t, 0, DUR);
    g.save(); g.beginPath(); g.rect(-60, -60, W + 120, HORIZ + 60); g.clip();
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(BLOB.amarillo, 512 - 200, sy - 200, 400, 400); g.restore();
    const gs = g.createLinearGradient(0, sy - 80, 0, sy + 80);
    gs.addColorStop(0, "#fff3b0"); gs.addColorStop(1, "#ff7a1a");
    g.fillStyle = gs; g.beginPath(); g.arc(512, sy, 80, 0, 6.283); g.fill();
    g.restore();
    // mar con reflejo
    const gm = g.createLinearGradient(0, HORIZ, 0, 420);
    gm.addColorStop(0, "#7a3a8a"); gm.addColorStop(1, "#3a2a6a");
    g.fillStyle = gm; g.fillRect(-60, HORIZ, W + 120, 100);
    g.fillStyle = "rgba(255,200,120,.6)";
    for (let k = 0; k < 7; k++) { const w = 120 - k * 14 + 10 * Math.sin(t * 3 + k); rectR(g, 512 - w / 2, HORIZ + 6 + k * 12, w, 4, 2); g.fill(); }
    // arena
    const ga = g.createLinearGradient(0, 420, 0, H + 60);
    ga.addColorStop(0, "#e8a86a"); ga.addColorStop(1, "#a8683a");
    g.fillStyle = ga; g.beginPath(); g.moveTo(-60, 430); g.quadraticCurveTo(512, 400, W + 60, 430); g.lineTo(W + 60, H + 60); g.lineTo(-60, H + 60); g.closePath(); g.fill();
    // palmera a contraluz
    g.strokeStyle = "#2a1030"; g.lineWidth = 16; g.lineCap = "round";
    g.beginPath(); g.moveTo(960, 440); g.quadraticCurveTo(930, 300, 970, 170); g.stroke();
    g.fillStyle = "#2a1030";
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.55 + 0.04 * Math.sin(t * 2 + k); g.save(); g.translate(970, 170); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(60, -24, 120, 18); g.quadraticCurveTo(60, -6, 0, 6); g.fill(); g.restore(); }
    // esterillas
    for (const [x, col] of [[XG + 150, "#2a8aff"], [XM, "#ff3d84"]]) {
      g.fillStyle = "rgba(0,0,0,.2)"; g.beginPath(); g.ellipse(x, PIES + 10, x === XM ? 110 : 250, 14, 0, 0, 6.283); g.fill();
      g.fillStyle = col; g.beginPath(); g.moveTo(x - (x === XM ? 100 : 230), PIES + 14); g.lineTo(x + (x === XM ? 100 : 230), PIES + 14); g.lineTo(x + (x === XM ? 82 : 200), PIES - 6); g.lineTo(x - (x === XM ? 82 : 200), PIES - 6); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - (x === XM ? 80 : 196), PIES - 4, x === XM ? 160 : 392, 3);
    }
    pintarAvatar(g, eM.m, eM.pose, t);
    pintarAvatar(g, eG.m, eG.pose, t);
    // brillo de paz alrededor de Marcos
    const ka = tramo(t, T_SUELO + 1.5, T_SUELO + 2.0) * (1 - tramo(t, 9.6, 10.2));
    if (ka > 0) dibujarAura(g, XM, PIES - 170, 110, 210, ka * 0.4, t);
    // sudor
    g.fillStyle = "#bfe8ff";
    for (const d of this.gotas || []) { g.beginPath(); g.ellipse(d.x, d.y, 3.5, 6, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // ommm flotando
    for (const o of this.oms) txt(g, o.g ? "om..." : "ommm", o.x, o.y, { tam: o.s, peso: 400, fam: FB, color: "#fff2fa", alfa: Math.min(1, o.v) * 0.85, borde: "rgba(90,20,70,.6)", bordeAncho: 4 });
    // textos
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 3, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    grito("¡ÁRBOL VA!", 470, 230, T_CAE + 0.1, T_SUELO + 0.3, 52, "#ffd34d", "#4a1a00", 0.1);
    grito("¡CATAPUM!", 420, 420, T_SUELO, T_SUELO + 0.8, 60, "#fffdf5", "#4a1a00", -0.06);
    if (t > T_SUELO + 0.35) {
      const d = t - T_SUELO - 0.35, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 5));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(560, 100); g.scale(s * 0.85, s * 0.85);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // fundido: entra con el sol y sale cuando se pone
    const a = Math.max(1 - tramo(t, 0.02, 0.6), tramo(t, DUR - 0.75, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(10,0,20,${a})`; g.fillRect(-60, -60, W + 120, H + 120); if (a >= 0.999) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); } }
  }
}

registrar({ id: "00202", nombre: "Yoga", crear: () => new Yoga() });
})();
