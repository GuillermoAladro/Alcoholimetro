"use strict";
/*
 * 00116 · SUMO CERVECERO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En un círculo pintado en el suelo, Guillermo y Rodrigo se beben una jarra de un trago y se les hincha la barriga.
 * Dan los pisotones del sumo (tiembla todo), se agachan y… ¡SUMO! Chocan barriga contra barriga (¡BOING!) y se
 * empujan: Rodrigo va ganando, pero Guillermo saca fuerzas, le da la vuelta y lo saca del círculo. Rodrigo sale
 * rodando como una pelota y Guillermo lo celebra con los brazos arriba.
 */
(() => {
const ESC = 1.42, XG0 = 330, XR0 = 694, DUR = 10.8, ARO = { x: 512, y: 568, rx: 372, ry: 30 };
const T_PIS1 = 2.75, T_PIS2 = 3.3, T_SUMO = 3.75, T_CHOQUE = 4.25, T_FUERA = 7.05;
// empuje: desplazamiento del punto de contacto (+ = hacia Rodrigo)
const EMPUJE = [[4.5, 0], [4.9, -38], [5.3, -18], [5.7, -62], [6.0, -52], [6.35, -20], [6.7, 60], [T_FUERA, 250, eIn]];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
function aAv(m, p) { const q = m.inverse().transformPoint(new DOMPoint(p[0], p[1])); return [q.x, q.y]; }
/** barriga hinchada bajo la ropa (k 0–1), unidades de avatar */
function barrigon(g, y, k, rodrigo) {
  if (k < 0.02) return;
  g.save();
  const gr = g.createRadialGradient(30, y - 8, 2, 39, y, 32 * k);
  gr.addColorStop(0, "#4a4a4e"); gr.addColorStop(0.7, "#262628"); gr.addColorStop(1, "#141415");
  g.fillStyle = gr; g.beginPath(); g.ellipse(39, y, 31 * k, 23 * k, 0, 0, 6.283); g.fill();
  if (rodrigo) {
    const gb = g.createRadialGradient(34, y - 8, 2, 38, y, 22 * k);
    gb.addColorStop(0, "#f4f4f4"); gb.addColorStop(1, "#a9a9ae");
    g.fillStyle = gb; g.beginPath(); g.ellipse(38, y + 1, 10.5 * k, 22.5 * k, 0, 0, 6.283); g.fill();
  } else {
    g.fillStyle = "#9a9aa0"; for (let j = -1; j <= 1; j++) { g.beginPath(); g.arc(39, y + j * 9 * k, 1.3, 0, 6.283); g.fill(); }
  }
  g.fillStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.ellipse(28, y - 9 * k, 9 * k, 5 * k, -0.5, 0, 6.283); g.fill();
  g.restore();
}
/** cinturón de sumo sobre la ropa (unidades de avatar) */
function cinturon(g, y, col, col2) {
  g.save();
  const gr = g.createLinearGradient(0, y - 6, 0, y + 7);
  gr.addColorStop(0, col2); gr.addColorStop(0.5, col); gr.addColorStop(1, col2);
  g.fillStyle = gr; rectR(g, 6, y - 6, 66, 13, 4); g.fill();
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(8, y - 4, 62, 2.5);
  g.restore();
}

class SumoCervecero extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.cache = cacheTexto();
    this.jarras = [];
  }
  barriga(t) { return 1 + 0.55 * eElastico(tramo(t, 1.0, 2.1)); }
  estado() {
    const t = this.t;
    const B = this.barriga(t);
    const res = [];
    // posiciones
    let xg = XG0, xr = XR0;
    const kC = eIn(tramo(t, T_SUMO + 0.1, T_CHOQUE));
    const sep = 190, e0 = t > T_CHOQUE ? pista(t, EMPUJE) : 0;
    const rebote = t > T_CHOQUE ? 26 * Math.exp(-(t - T_CHOQUE) * 7) * Math.sin(Math.min((t - T_CHOQUE) * 14, Math.PI)) : 0;
    xg = lerp(XG0, 512 - sep / 2, kC) - rebote + e0;
    xr = lerp(XR0, 512 + sep / 2, kC) + rebote + e0;
    const fuera = t >= T_FUERA, dF = t - T_FUERA;
    for (let i = 0; i < 2; i++) {
      const q = i ? "rodrigo" : undefined, s = i ? -1 : 1, Rg = avatar(q).rig;
      const pose = { quien: q, cara: "sonrisa", rc: s * 0.08, piernaI: [0, 0], piernaD: [0, 0] };
      let sx = B, sy = 1, giro = 0, x = i ? xr : xg, y = PIES, piv = [39, 232];
      // beber la jarra de un trago
      const kBoca = eInOut(tramo(t, 0.55, 0.85)) * (1 - eInOut(tramo(t, 1.9, 2.1)));
      const kTrago = eInOut(tramo(t, 0.85, 1.75)) * (1 - eInOut(tramo(t, 1.9, 2.1)));
      if (t < 2.25) {
        pose.rc = -0.32 * kTrago + s * 0.08 * (1 - kTrago);
        const inc = lerp(-0.2, -1.3, Math.max(kBoca * 0.3, kTrago));
        const b = boca(pose.rc, q), tope = rot2([17, -18], inc);
        let mano = mezcla(i ? [69, 157] : [70, 158], [62, 128], eInOut(tramo(t, 0.3, 0.55)));
        mano = mezcla(mano, [b[0] - tope[0] + 1, b[1] - tope[1] + 1], kBoca);
        if (t > 2.0) mano = mezcla([62, 128], [100, 40], eOut(tramo(t, 2.0, 2.2)));
        pose.manoD = mano;
        if (t < 2.18) pose.jarra = { inc, nivel: 1 - tramo(t, 0.95, 1.75) };
        pose.cara = kTrago > 0.4 ? "dormido" : t > 1.85 ? "risa" : "sonrisa";
      }
      // pisotones (cada uno levanta la pierna de fuera)
      const pis = (t0) => Math.sin(Math.PI * tramo(t, t0 - 0.42, t0)) * (t < t0 ? 1 : 0);
      const kp = Math.max(pis(T_PIS1), pis(T_PIS2));
      const abiertas = eOut(tramo(t, 2.35, 2.55));
      if (t > 2.25 && t < T_SUMO + 0.12) {
        const pierna = [-34 * kp, s * (0.25 * abiertas + 0.75 * kp)], firme = [0, -s * 0.25 * abiertas];
        if (i) { pose.piernaD = pierna; pose.piernaI = firme; } else { pose.piernaI = pierna; pose.piernaD = firme; }
        giro = s * 0.13 * kp;
        pose.manoD = [86, 116 - 30 * kp]; pose.manoI = [-8, 116 - 30 * kp];
        pose.cara = kp > 0.3 ? "guino" : "sonrisa";
        // se agachan frente a frente
        const kA = eInOut(tramo(t, 3.4, 3.7));
        if (kA > 0) { sy = 1 - 0.13 * kA; pose.manoD = mezcla(pose.manoD, [74, 182], kA); pose.manoI = mezcla(pose.manoI, [4, 182], kA); pose.cara = "guino"; pose.rc = s * 0.12; }
      }
      // ¡a por él!
      if (t >= T_SUMO + 0.12 && !fuera) {
        pose.piernaI = [0, 0.22]; pose.piernaD = [0, -0.22];
        const embiste = t < T_CHOQUE ? 1 : 0;
        giro = s * (embiste ? 0.14 : 0.05);
        sy = 0.92;
        // manos a los hombros del otro
        const otro = i ? matAv(xg, PIES, ESC, 0.05, B, 0.92) : matAv(xr, PIES, ESC, -0.05, B, 0.92);
        const hombro = aPant(otro, i ? RIG.hombroD : avatar("rodrigo").rig.hombroI2);
        const m0 = matAv(x, y, ESC, giro, sx, sy);
        const h = aAv(m0, hombro);
        const tiembla = Math.sin(t * 50 + i) * 1.5;
        if (i) { pose.manoI = [h[0], h[1] + tiembla]; pose.brazoIDelante = true; pose.manoD = [76, 140]; }
        else { pose.manoD = [h[0], h[1] + tiembla]; pose.manoI = [2, 140]; }
        const vaGanando = e0 < -30 ? 1 : e0 > 0 ? 0 : -1;
        if (i === 0) { pose.cara = t < T_CHOQUE + 0.3 ? "sorpresa" : vaGanando === 1 ? "sorpresa" : "dormido"; pose.puntas = 0.9 * tramo(t, 5.9, 6.35); }
        else { pose.cara = t < T_CHOQUE + 0.3 ? "sorpresa" : vaGanando === 1 ? "risa" : e0 > 0 ? "sorpresa" : "dormido"; }
        if (t > 5.95 && t < 6.35 && i === 0) pose.cara = "guino";
        pose.rc = s * 0.06 + 0.02 * Math.sin(t * 40);
      }
      // fuera: Rodrigo sale rodando; Guillermo celebra
      if (fuera) {
        if (i === 1) {
          const d = dF;
          piv = [39, 140];
          x = xr + 260 * d + 90 * d * d; y = PIES - 92 * ESC - 34 * Math.abs(Math.sin(d * 8)) * Math.exp(-d * 1.2);
          giro = 0.1 + 5.5 * d + 2 * d * d;
          pose.cara = "sorpresa"; pose.manoD = [80, 110]; pose.manoI = [0, 110]; pose.brazoIDelante = true; pose.piernaI = [-20, 0.3]; pose.piernaD = [-20, -0.3];
          sy = 0.9;
        } else {
          const k = eBack(tramo(dF, 0.15, 0.45));
          pose.manoD = mezcla([90, 110], [100, 4], k); pose.manoI = mezcla([-12, 110], [-22, 4], k);
          pose.cara = dF < 0.3 ? "sorpresa" : (Math.floor(dF * 2.5) % 2 ? "risa" : "guino");
          pose.puntas = 0.9 * (1 - tramo(dF, 0.6, 1.6));
          pose.piernaI = [0, 0.16]; pose.piernaD = [0, -0.16];
          y = PIES - 26 * Math.abs(Math.sin(Math.max(0, dF - 0.45) * 6)) * tramo(dF, 0.45, 0.6);
          sx = B * (1 + 0.04 * Math.sin(dF * 18) * Math.exp(-dF));
          x = xg;
          giro = 0;
        }
      }
      // la barriga rebota tras el choque
      if (t > T_CHOQUE && !fuera) sx *= 1 + 0.08 * Math.exp(-(t - T_CHOQUE) * 4) * Math.sin((t - T_CHOQUE) * 24);
      const kb = clamp((B - 1) / 0.55, 0, 1.2);
      pose.objD = (g) => { barrigon(g, Rg.caderaI[1] - 22, kb, i === 1); cinturon(g, Rg.caderaI[1] - 6, i ? "#ffd34d" : "#2bff5b", i ? "#9a6d00" : "#0b7a2b"); };
      const m = matAv(x, y, ESC, giro, sx, sy, piv);
      res.push({ pose, m, x });
    }
    return res;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("tira", t > 2.08, () => {
      for (let i = 0; i < 2; i++) { const q = aPant(e[i].m, [100, 40]); this.jarras.push({ x: q[0], y: q[1], vx: (i ? 1 : -1) * azar(260, 340), vy: -620, r: 0, vr: (i ? 1 : -1) * 12 }); }
    });
    for (const j of this.jarras) { j.vy += 1400 * dt; j.x += j.vx * dt; j.y += j.vy * dt; j.r += j.vr * dt; }
    for (const [k, t0] of [["p1", T_PIS1], ["p2", T_PIS2]]) this.una(k, t > t0, () => {
      temblar(18, 0.35);
      for (const x of [e[0].x - 70, e[1].x + 70]) for (let i = 0; i < 14; i++) p.nueva(P.POLVO, x + azar(-20, 20), PIES - 4, azar(-260, 260), azar(-70, -10), azar(0.5, 1), azar(24, 40));
    });
    this.una("sumo", t > T_SUMO, () => temblar(10, 0.25));
    this.una("choque", t > T_CHOQUE, () => {
      temblar(26, 0.5);
      p.nueva(P.DESTELLO, 512, 400, 0, 0, 0.4, 240);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, 512, 400, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
      for (let i = 0; i < 16; i++) p.nueva(P.POLVO, 512 + azar(-100, 100), PIES - 4, azar(-300, 300), azar(-60, -10), azar(0.6, 1), azar(26, 42));
    });
    if (t > T_CHOQUE + 0.3 && t < T_FUERA && Math.random() < 18 * dt) p.nueva(P.POLVO, e[Math.random() < 0.5 ? 0 : 1].x + azar(-70, 70), PIES - 4, azar(-120, 120), azar(-30, -5), azar(0.4, 0.8), azar(18, 30));
    this.una("fuera", t > T_FUERA, () => { temblar(20, 0.4); for (let i = 0; i < 20; i++) p.nueva(P.POLVO, ARO.x + ARO.rx + azar(-20, 20), PIES - 4, azar(0, 400), azar(-80, -10), azar(0.6, 1.1), azar(26, 44)); });
    if (t > T_FUERA && t < T_FUERA + 1.4 && Math.random() < 30 * dt) p.nueva(P.POLVO, e[1].x - 40, PIES - 4, azar(-160, -40), azar(-40, -5), azar(0.5, 0.9), azar(24, 40));
    if (t > T_FUERA + 0.4 && t < 9.6 && Math.random() < 40 * dt) p.nueva(P.PURPURINA, azar(150, 870), azar(-20, 120), azar(-20, 20), azar(30, 90), azar(1, 1.6), azar(7, 12));
    p.actualizar(dt);
  }
  dohyo() {
    if (this.cache.has("d")) return this.cache.get("d");
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    // tarima de tierra
    const gt = g.createLinearGradient(0, 470, 0, H);
    gt.addColorStop(0, "#8a6a44"); gt.addColorStop(1, "#5b4026");
    g.fillStyle = gt; g.beginPath(); g.moveTo(60, 500); g.lineTo(964, 500); g.lineTo(1024 + 40, H); g.lineTo(-40, H); g.closePath(); g.fill();
    g.fillStyle = "#c9a874"; g.beginPath(); g.moveTo(60, 500); g.lineTo(964, 500); g.lineTo(980, 512); g.lineTo(44, 512); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.18)";
    for (let i = 0; i < 220; i++) g.fillRect(40 + ((i * 131) % 940), 512 + ((i * 47) % 88), 3, 2);
    // el círculo de cuerda de paja
    for (const [w, col] of [[11, "#6d5a2c"], [7, "#e9d79a"]]) {
      g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.ellipse(ARO.x, ARO.y, ARO.rx, ARO.ry, 0, 0, 6.283); g.stroke();
    }
    g.strokeStyle = "rgba(110,90,40,.6)"; g.lineWidth = 1.5;
    for (let a = 0; a < 6.283; a += 0.06) { const x = ARO.x + Math.cos(a) * ARO.rx, y = ARO.y + Math.sin(a) * ARO.ry; g.beginPath(); g.moveTo(x - 3, y - 3); g.lineTo(x + 3, y + 3); g.stroke(); }
    // líneas de salida
    g.fillStyle = "rgba(255,255,255,.8)"; g.fillRect(452, 560, 26, 5); g.fillRect(546, 560, 26, 5);
    this.cache.set("d", c);
    return c;
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(640, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 180);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡SUMO!", 320, 178, { tam: 184, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 14, esp: 7, glow: "rgba(255,170,30,.85)", glowTam: 28 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // farolillos y luz
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.38; g.drawImage(BLOB2.oroClaro, 40, 60, 944, 560); g.restore();
    for (let k = 0; k < 6; k++) {
      const x = 110 + k * 160, y = 40 + 18 * Math.sin(k * 1.3), osc = 0.05 * Math.sin(t * 2 + k);
      g.save(); g.translate(x, -10); g.rotate(osc);
      g.strokeStyle = "#333"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, y); g.stroke();
      const gr = g.createRadialGradient(0, y + 24, 4, 0, y + 24, 30);
      gr.addColorStop(0, "#ffe08a"); gr.addColorStop(1, "#d2381c");
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, y + 24, 22, 28, 0, 0, 6.283); g.fill();
      g.fillStyle = "#2a1208"; g.fillRect(-10, y - 6, 20, 6); g.fillRect(-10, y + 50, 20, 5);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB.naranja, -60, y - 36, 120, 120);
      g.restore();
    }
    g.drawImage(this.dohyo(), 0, 0);
    for (const j of this.jarras) { g.save(); g.translate(j.x, j.y); g.rotate(j.r); g.scale(ESC, ESC); dibujarJarra(g, [-17, 0], 0, 0, "asa", t); dibujarJarra(g, [-17, 0], 0, 0, "cuerpo", t); g.restore(); }
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.p.dibujar(g);
    // ¡BOING!
    if (t > T_CHOQUE && t < T_CHOQUE + 0.8) {
      const k = tramo(t, T_CHOQUE, T_CHOQUE + 0.12);
      g.save(); g.translate(512, 240); g.rotate(-0.06); g.scale(eBack(k) * 1.1, eBack(k) * 1.1);
      txt(g, "¡BOING!", 0, 0, { tam: 74, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 10, alfa: 1 - tramo(t, T_CHOQUE + 0.55, T_CHOQUE + 0.8), esp: 3 });
      g.restore();
    }
    // ¡SUMO!: al empezar el combate y en el remate
    const spr = this.titulo();
    const muestra = (t0, t1, x, y, esc) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.15), s = lerp(2.6, 1, eIn(k)) * esc * (1 + 0.03 * Math.sin(d * 8));
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, t1 - 0.25, t1)); g.translate(x, y); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    };
    muestra(T_SUMO, T_CHOQUE + 0.05, 512, 118, 0.8);
    muestra(T_FUERA + 0.3, DUR, 512, 118, 1);
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, DUR - 0.55, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00116", nombre: "Sumo cervecero", crear: () => new SumoCervecero() });
})();
