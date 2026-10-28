"use strict";
/*
 * 00204 · LA COMETA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Día de viento en la playa: Guillermo vuela una cometa de colores y Marcos le levanta el pulgar. Llega una ráfaga
 * (¡FIUUU!), la cometa sube disparada y arrastra a Guillermo por la arena… hasta que lo levanta del suelo: ¡QUE SUBE!
 * Marcos corre, salta y lo agarra de los pies… y se van volando los dos colgados de la cometa, cada vez más pequeños,
 * riéndose y saludando, mientras pasa una gaviota que no se lo cree.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.6, ESC = 1.1, XG = 520, XM = 230, HORIZ = 330, ORILLA = 400;
const T_RAFAGA = 2.4, T_TIRA = 2.9, T_DESPEGA = 3.6, T_AGARRA = 4.8, T_VUELAN = 5.4;
const PIV_G = [96, 20], PIV_M = [80, 40], PIE_G = [45, 228];
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(640, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff3d84");
  g.save(); g.translate(320, 105); g.transform(1, 0, -0.12, 1, 0, 0);
  txt(g, "¡QUE SUBE!", 7, 60, { tam: 130, peso: 400, fam: FC, color: "#3a0a2a", esp: 5, max: 600 });
  txt(g, "¡QUE SUBE!", 0, 52, { tam: 130, peso: 400, fam: FC, color: gr, borde: "#3a0a2a", bordeAncho: 11, esp: 5, glow: "rgba(255,90,160,.85)", glowTam: 24, max: 600 });
  g.restore();
  cache.set("t", c);
  return c;
}
function cometa(g, x, y, s, rot, t) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  // cola con lazos (a favor del viento)
  g.strokeStyle = "#333"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 62);
  const pts = [];
  for (let i = 1; i <= 8; i++) { const px = i * 16, py = 62 + i * 10 + Math.sin(t * 9 - i * 0.8) * 9; g.lineTo(px, py); pts.push([px, py]); }
  g.stroke();
  const cols = ["#ff3d84", "#ffd34d", "#2fe3e8", "#2bff5b"];
  pts.forEach((p, i) => { if (i % 2) return; g.fillStyle = cols[(i / 2) % 4]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - 8, p[1] - 7); g.lineTo(p[0] - 8, p[1] + 7); g.closePath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + 8, p[1] - 7); g.lineTo(p[0] + 8, p[1] + 7); g.closePath(); g.fill(); });
  // rombo
  const P = [[0, -62], [44, -6], [0, 62], [-44, -6]], C = [0, -6];
  const caras = ["#e8283a", "#ffd34d", "#2a6aff", "#2bd45b"];
  for (let i = 0; i < 4; i++) { g.fillStyle = caras[i]; g.beginPath(); g.moveTo(C[0], C[1]); g.lineTo(P[i][0], P[i][1]); g.lineTo(P[(i + 1) % 4][0], P[(i + 1) % 4][1]); g.closePath(); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.moveTo(C[0], C[1]); g.lineTo(P[0][0], P[0][1]); g.lineTo(P[3][0], P[3][1]); g.closePath(); g.fill();
  g.strokeStyle = "#5a3a1e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -62); g.lineTo(0, 62); g.moveTo(-44, -6); g.lineTo(44, -6); g.stroke();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.5; g.beginPath(); P.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.stroke();
  g.restore();
}
function carrete(g, m) {
  g.save(); g.translate(m[0], m[1]);
  g.fillStyle = "#8a5a2e"; rectR(g, -12, -4, 24, 8, 3); g.fill();
  g.fillStyle = "#c48a4a"; g.beginPath(); g.ellipse(0, 0, 6, 9, 0, 0, 6.283); g.fill();
  g.fillStyle = "#fffdf5"; g.beginPath(); g.ellipse(0, 0, 3.5, 6, 0, 0, 6.283); g.fill();
  g.restore();
}
function gaviota(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const a = Math.sin(t * 12) * 10;
  g.fillStyle = "#ffffff"; g.strokeStyle = "#5a6070"; g.lineWidth = 2;
  g.beginPath(); g.ellipse(0, 0, 18, 8, 0, 0, 6.283); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-4, -2); g.quadraticCurveTo(-16, -18 - a, -34, -10 - a); g.quadraticCurveTo(-18, -6, -4, 2); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(4, -2); g.quadraticCurveTo(14, -20 - a, 30, -14 - a); g.quadraticCurveTo(16, -6, 4, 2); g.fill(); g.stroke();
  g.fillStyle = "#ffb51f"; g.beginPath(); g.moveTo(-17, -1); g.lineTo(-27, 1); g.lineTo(-17, 3); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(-12, -2, 1.8, 0, 6.283); g.fill();
  g.restore();
}

class Cometa extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.fondoC = null;
    const r = semilla(204);
    this.vientos = [];
    for (let i = 0; i < 14; i++) this.vientos.push({ x: r() * W, y: 40 + r() * 520, l: 60 + r() * 120, v: 0.7 + r() * 0.6 });
  }
  escala(t) { return lerp(ESC, 0.95, eInOut(tramo(t, T_DESPEGA, T_AGARRA))) * lerp(1, 0.42, eInOut(tramo(t, T_VUELAN, 9.6))); }
  /** Punto del carrete (manos de Guillermo) cuando vuela. */
  carreteVuelo(t) {
    const p0 = this.carreteSuelo(T_DESPEGA), p1 = [650, 122];
    if (t < T_AGARRA) { const u = eInOut(tramo(t, T_DESPEGA, T_AGARRA)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - 30 * Math.sin(u * Math.PI)]; }
    const u = eInOut(tramo(t, T_VUELAN, 9.6));
    const d = t - T_AGARRA;
    return [lerp(650, 790, u) + 10 * Math.sin(d * 2), lerp(122, 150, u) + 8 * Math.sin(d * 2.6)];
  }
  xG(t) { return t < T_TIRA ? XG : lerp(XG, 580, eInOut(tramo(t, T_TIRA, T_DESPEGA))); }
  manoCarrete(t) { return mezcla([84, 92], PIV_G, eInOut(tramo(t, T_TIRA, T_DESPEGA))); }
  carreteSuelo(t) { const m = matAv(this.xG(t), PIES, ESC, this.giroSuelo(t)); return aPant(m, this.manoCarrete(t)); }
  giroSuelo(t) { return t < T_TIRA ? 0 : -0.24 * eOut(tramo(t, T_TIRA, T_TIRA + 0.3)) + 0.03 * Math.sin(t * 30); }
  cometaPos(t) {
    let K = [820 + 40 * Math.sin(t * 1.3), 170 + 30 * Math.sin(t * 2.1)];
    const kR = eOut(tramo(t, T_RAFAGA, T_TIRA));
    K = mezcla(K, [880 + 10 * Math.sin(t * 3), 112 + 10 * Math.sin(t * 4)], kR);
    if (t > T_DESPEGA) { const c = this.carreteVuelo(t), s = this.escala(t) / ESC; K = mezcla(K, [c[0] + 250 * s + 15 * Math.sin(t * 3), c[1] - 40 * s - 6 + 8 * Math.sin(t * 4)], eInOut(tramo(t, T_DESPEGA, T_AGARRA))); }
    return K;
  }
  poseG(t) {
    const pose = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let m;
    if (t < T_DESPEGA) {
      // tira del hilo
      const tir = t < T_RAFAGA ? Math.sin(t * 5) * 6 : 0, hc = this.manoCarrete(t);
      pose.manoD = [hc[0], hc[1] + tir]; pose.manoI = [70, 100 + tir];
      pose.cara = t < 1.4 ? "risa" : t < T_RAFAGA ? "guino" : "sorpresa";
      if (t > T_TIRA) { const k = eOut(tramo(t, T_TIRA, T_TIRA + 0.3)); pose.manoI = mezcla([70, 100], [-20, 60 + 30 * Math.sin(t * 14)], k); pose.piernaI = [0, 0.2]; pose.piernaD = [-4, -0.15]; }
      m = matAv(this.xG(t), PIES, ESC, this.giroSuelo(t));
      pose.objD = (g) => carrete(g, [hc[0], hc[1] + tir]);
    } else {
      // colgado del carrete
      const c = this.carreteVuelo(t), s = this.escala(t);
      const sw = 0.12 * Math.sin(t * 2.4) + (t < T_AGARRA ? 0.15 * Math.sin(t * 9) * (1 - tramo(t, T_DESPEGA, T_AGARRA)) : 0);
      pose.manoD = PIV_G; pose.manoI = t < T_VUELAN + 0.6 ? [-20, 60 + 30 * Math.sin(t * 14)] : [-26, 40 + 16 * Math.sin(t * 9)];
      const pat = t < T_AGARRA ? Math.sin(t * 16) : Math.sin(t * 4) * 0.3;
      pose.piernaI = [-8 * Math.max(0, pat), 0.2 * pat]; pose.piernaD = [-8 * Math.max(0, -pat), -0.2 * pat];
      pose.cara = t < T_AGARRA + 0.3 ? "sorpresa" : t < 6.2 ? "sorpresa" : "risa";
      pose.puntas = t < T_VUELAN ? 0.5 : 0.3;
      if (t > 6.2) pose.rc = 0.08 * Math.sin(t * 5);
      m = matAv(c[0], c[1], s, sw, 1, 1, PIV_G);
      pose.objD = (g) => carrete(g, PIV_G);
    }
    return { pose, m };
  }
  poseM(t, eG) {
    const pose = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let m;
    const pies = aPant(eG.m, PIE_G);
    if (t < T_AGARRA) {
      let x = XM, y = PIES;
      pose.manoD = [67, 152]; pose.manoI = [6, 152];
      if (t > 0.9 && t < T_RAFAGA) { pose.cara = "guino"; pose.manoD = [86, 96]; }
      if (t >= T_RAFAGA) { pose.cara = "sorpresa"; pose.rc = -0.1; pose.puntas = 0.5 * Math.sin(tramo(t, T_RAFAGA, 3.4) * Math.PI); }
      if (t > 3.7) {
        // corre debajo de Guillermo y salta
        const objetivo = aPant(this.poseG(T_AGARRA).m, PIE_G), sF = this.escala(T_AGARRA);
        const k = eInOut(tramo(t, 3.7, 4.4));
        x = lerp(XM, objetivo[0] - (PIV_M[0] - 39) * sF, k);
        if (k > 0 && k < 1) { const a = andar(t * 16, 1); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote; }
        const kj = eOut(tramo(t, 4.45, T_AGARRA));
        const sM = lerp(ESC, this.escala(T_AGARRA), tramo(t, 3.7, T_AGARRA));
        const alto = PIES - (232 - PIV_M[1]) * this.escala(T_AGARRA) - objetivo[1];
        y -= alto * kj;
        pose.manoD = mezcla([67, 152], PIV_M, tramo(t, 4.3, 4.6)); pose.manoI = mezcla([6, 152], [-8, 50], tramo(t, 4.3, 4.6));
        pose.cara = t < 4.45 ? "sorpresa" : "guino";
        m = matAv(x, y, sM);
      } else m = matAv(x, y, ESC);
    } else {
      // colgado de los pies de Guillermo
      const s = this.escala(t), sw = 0.16 * Math.sin(t * 2.4 - 0.8);
      pose.manoD = PIV_M; pose.manoI = [-8, 50 + 6 * Math.sin(t * 6)];
      pose.cara = t < 6.0 ? "sorpresa" : "risa";
      const pat = Math.sin(t * 5);
      pose.piernaI = [-6 * Math.max(0, pat), 0.25 * pat]; pose.piernaD = [-6 * Math.max(0, -pat), -0.25 * pat];
      if (t > 6.8 && t < 9.4) { pose.manoI = [-20, 34 + 14 * Math.sin(t * 12)]; pose.cara = "risa"; }
      m = matAv(pies[0], pies[1] + 4 * s, s, sw, 1, 1, PIV_M);
    }
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const fuerte = t > T_RAFAGA ? 2.2 : 1;
    for (const v of this.vientos) { v.x += 420 * v.v * fuerte * dt; if (v.x > W + 200) v.x -= W + 400; }
    if (t > T_RAFAGA && t < 4.6 && Math.random() < 40 * dt) p.nueva(P.POLVO, azar(-40, 600), PIES - azar(0, 30), azar(300, 600), azar(-60, 10), azar(0.5, 1.0), azar(14, 28));
    if (t > T_TIRA && t < T_DESPEGA && Math.random() < 30 * dt) p.nueva(P.POLVO, this.xG(t) - 20, PIES - 4, azar(-200, -60), azar(-120, -30), azar(0.4, 0.8), azar(20, 34));
    this.una("despega", t > T_DESPEGA, () => { temblar(10, 0.25); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, this.xG(t) + azar(-40, 40), PIES - 4, azar(-200, 200), azar(-160, -20), azar(0.6, 1.0), azar(24, 40)); });
    this.una("agarra", t > T_AGARRA, () => { temblar(8, 0.2); const eG = this.poseG(t), q = aPant(eG.m, [39, 232]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 120); });
    this.una("suelta", t > 5.05, () => { for (let i = 0; i < 12; i++) p.nueva(P.POLVO, 590 + azar(-40, 40), PIES - 4, azar(-200, 200), azar(-140, -20), azar(0.6, 1.0), azar(20, 36)); });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, HORIZ);
    gc.addColorStop(0, "#2a8ff0"); gc.addColorStop(1, "#bfefff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, HORIZ + 60);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 690, -110, 260, 260); g.restore();
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(820, 20, 36, 0, 6.283); g.fill();
    const gm = g.createLinearGradient(0, HORIZ, 0, ORILLA);
    gm.addColorStop(0, "#1a7ac8"); gm.addColorStop(1, "#3ac0e0");
    g.fillStyle = gm; g.fillRect(-60, HORIZ, W + 120, ORILLA - HORIZ);
    const ga = g.createLinearGradient(0, ORILLA, 0, H + 60);
    ga.addColorStop(0, "#f6dfa8"); ga.addColorStop(1, "#d8b46a");
    g.fillStyle = ga; g.fillRect(-60, ORILLA, W + 120, H);
    const r = semilla(44);
    g.fillStyle = "rgba(160,120,60,.35)";
    for (let i = 0; i < 80; i++) { g.beginPath(); g.arc(r() * W, ORILLA + 10 + r() * 200, 1 + r() * 2, 0, 6.283); g.fill(); }
    // sombrilla y toalla
    g.save(); g.translate(90, 470);
    g.strokeStyle = "#eee"; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(8, -110); g.stroke();
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#2fe3e8" : "#fffdf5"; g.beginPath(); g.moveTo(8, -118); g.arc(8, -100, 66, Math.PI + (i / 6) * Math.PI, Math.PI + ((i + 1) / 6) * Math.PI); g.closePath(); g.fill(); }
    g.restore();
    g.fillStyle = "#ff3d84"; g.beginPath(); g.moveTo(40, 520); g.lineTo(200, 520); g.lineTo(180, 490); g.lineTo(60, 490); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(70, 500, 110, 5);
    this.fondoC = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(t), eM = this.poseM(t, eG), K = this.cometaPos(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // olas
    g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.moveTo(-60, ORILLA + 6);
    for (let x = -60; x <= W + 60; x += 32) g.lineTo(x, ORILLA + 2 + Math.sin(x * 0.03 + t * 3) * 4);
    g.lineTo(W + 60, ORILLA + 10); g.lineTo(-60, ORILLA + 10); g.closePath(); g.fill();
    // viento
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineCap = "round";
    for (const v of this.vientos) {
      const l = v.l * (t > T_RAFAGA ? 1.8 : 1);
      g.lineWidth = 3; g.beginPath(); g.moveTo(v.x, v.y); g.quadraticCurveTo(v.x + l * 0.5, v.y - 8, v.x + l, v.y + 2 * Math.sin(t * 5 + v.y)); g.stroke();
    }
    // sombras en la arena
    g.fillStyle = "rgba(120,80,30,.3)";
    const altoG = PIES - aPant(eG.m, [39, 232])[1];
    g.beginPath(); g.ellipse(aPant(eG.m, [39, 232])[0], PIES + 4, 54 * Math.max(0.2, 1 - altoG / 500), 9, 0, 0, 6.283); g.fill();
    const pm = aPant(eM.m, [39, 232]);
    g.beginPath(); g.ellipse(pm[0], PIES + 4, 54 * Math.max(0.2, 1 - (PIES - pm[1]) / 500), 9, 0, 0, 6.283); g.fill();
    // gaviota
    if (t > 6.0 && t < 9.4) { const u = tramo(t, 6.0, 9.4); gaviota(g, lerp(-60, 1080, u), 230 + 30 * Math.sin(u * 7), 1.2, t); if (u > 0.5 && u < 0.75) txt(g, "?!", lerp(-60, 1080, u) - 10, 190 + 30 * Math.sin(u * 7), { tam: 38, peso: 400, fam: FC, color: "#fffdf5", borde: "#1a2a4a", bordeAncho: 6 }); }
    // hilo y cometa
    const sc = t > T_DESPEGA ? this.escala(t) / ESC : 1;
    const ini = t < T_DESPEGA ? aPant(eG.m, this.manoCarrete(t)) : aPant(eG.m, PIV_G);
    g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 1.6;
    const tens = t > T_RAFAGA ? 0.15 : 1;
    g.beginPath(); g.moveTo(ini[0], ini[1]); g.quadraticCurveTo((ini[0] + K[0]) / 2, (ini[1] + K[1]) / 2 + 60 * tens * sc, K[0], K[1] + 50 * sc); g.stroke();
    cometa(g, K[0], K[1], 1.1 * sc, -0.3 + 0.12 * Math.sin(t * 2.7), t);
    pintarAvatar(g, eG.m, eG.pose, t);
    pintarAvatar(g, eM.m, eM.pose, t);
    this.p.dibujar(g);
    // textos
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 3, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    grito("¡FIUUUU!", 330, 200, T_RAFAGA, T_RAFAGA + 1.0, 60, "#fffdf5", "#1a3a6a", -0.12);
    grito("¡TE PILLO!", 300, 300, 4.5, 5.4, 44, "#ffd34d", "#4a1a00", 0.06);
    if (t > T_DESPEGA) {
      const d = t - T_DESPEGA, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(270, 116); g.rotate(-0.07); g.scale(s * 0.8, s * 0.8);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const cF = aPant(eG.m, [39, 200]);
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.75, DUR - 0.04)));
    const cc = t < 1 ? [XG, 380] : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00204", nombre: "La cometa", crear: () => new Cometa() });
})();
