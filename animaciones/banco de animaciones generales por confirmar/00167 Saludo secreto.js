"use strict";
/*
 * 00167 · SALUDO SECRETO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Marcos llegan andando cada uno por un lado y se hacen su saludo secreto, larguísimo: choque de puños
 * que explota, codos, golpe de cadera, doble giro, Guillermo «pesca» a Marcos con una caña invisible… Arriba se van
 * marcando los pasos. Lo rematan saltando a la vez y chocando las manos en el aire, perfectamente sincronizados, con
 * una lluvia de confeti: ¡SALUDO SECRETO!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.55;
const XG0 = 432, XM0 = 592;
const T_LLEGA = 1.3, T_PUNO = 1.85, T_CODO = 2.72, T_CADERA = 3.42, T_GIRO0 = 3.85, T_GIRO1 = 4.6;
const T_LANZA = 5.0, T_PICA = 5.3, T_SUELTA = 6.2, T_SALTO = 6.75, T_CHOCA = 7.02, T_TIT = 7.1, T_APAGA = 9.85, DUR = 10.45;
const PASOS = [["PUÑO", T_PUNO], ["CODO", T_CODO], ["CADERA", T_CADERA], ["GIRO", T_GIRO1], ["PESCA", T_SUELTA], ["¡CHOCA!", T_CHOCA]];
const RG = avatar().rig, RM = avatar("marcos").rig;

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
    return lerp(k[i - 1][1], k[i][1], u);
  }
  return k[k.length - 1][1];
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Matriz de un cuerpo: x, y del pivote, giro, escalas. */
const matCuerpo = (c) => matAv(c.x, c.y, ESC, c.giro || 0, c.sx || 1, c.sy || 1, c.piv || [39, 232]);

function fondoBar() {
  if (CT.has("fondo")) return CT.get("fondo");
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, 0, 0, 470);
  gr.addColorStop(0, "#0d0912"); gr.addColorStop(1, "#2a1832");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, 530);
  // luces desenfocadas del bar
  const r = semilla(17), cols = [BLOB.naranja, BLOB2.oro, BLOB2.cian, BLOB.rojo, BLOB.amarillo];
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = 40 + r() * 330, s = 30 + r() * 70;
    g.globalAlpha = 0.12 + r() * 0.18; g.drawImage(cols[i % cols.length], x - s / 2, y - s / 2, s, s);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  // zócalo y suelo de madera en perspectiva
  g.fillStyle = "#3a2230"; g.fillRect(-60, 455, W + 120, 14);
  const gs = g.createLinearGradient(0, 469, 0, H + 60);
  gs.addColorStop(0, "#3b2414"); gs.addColorStop(1, "#130a05");
  g.fillStyle = gs; g.fillRect(-60, 469, W + 120, H - 409);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(512 + i * 45, 469); g.lineTo(512 + i * 120, H + 60); g.stroke(); }
  for (const y of [492, 522, 562]) { g.fillStyle = "rgba(255,200,140,.05)"; g.fillRect(-60, y, W + 120, 2); }
  CT.set("fondo", c);
  return c;
}
function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(1000, 190), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 150);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff1a8"); gr.addColorStop(1, "#ffb21f");
  txt(g, "¡SALUDO SECRETO!", 506, 150, { tam: 124, peso: 400, fam: FC, color: "#2a1200", esp: 4, max: 930 });
  txt(g, "¡SALUDO SECRETO!", 500, 144, { tam: 124, peso: 400, fam: FC, color: gr, borde: "#2a1200", bordeAncho: 13, esp: 4, glow: "rgba(255,190,40,.85)", glowTam: 26, max: 930 });
  CT.set("tit", c);
  return c;
}

class Saludo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.faseG = 0; this.faseM = 0;
  }
  luz() { return tramo(this.t, 0, 0.4) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** Cuerpos y poses de los dos en el instante t. */
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const cG = { x: XG0, y: PIES }, cM = { x: XM0, y: PIES };
    // ---- llegan andando
    if (t < T_LLEGA) {
      cG.x = lerp(-140, XG0, eOut(tramo(t, 0.1, T_LLEGA)));
      cM.x = lerp(W + 140, XM0, eOut(tramo(t, 0.1, T_LLEGA)));
      for (const [P, c, f, R] of [[G, cG, this.faseG, RG], [M, cM, this.faseM, RM]]) {
        const k = 1 - tramo(t, T_LLEGA - 0.25, T_LLEGA), a = andar(f, k);
        P.piernaI = a.piernaI; P.piernaD = a.piernaD; c.y += a.bote * ESC;
        P.manoD = [R.manoD[0] + 6 * Math.sin(f) * k, R.manoD[1] - 2]; P.manoI = [R.manoI[0] - 6 * Math.sin(f) * k, R.manoI[1] - 2];
      }
    }
    // se miran: ¿listo?
    if (t > T_LLEGA - 0.1 && t < 1.62) {
      G.rc = 0.1 + 0.05 * Math.sin((t - 1.2) * 18); M.rc = -0.1 - 0.05 * Math.sin((t - 1.25) * 18);
      G.cara = "guino"; M.cara = t > 1.38 ? "guino" : "sonrisa";
    }
    const mG0 = matCuerpo(cG), mM0 = matCuerpo(cM);
    // ---- 1 · puños que chocan y explotan
    if (t > 1.55 && t < 2.45) {
      const kAtras = eInOut(tramo(t, 1.55, 1.72)), kGolpe = eIn(tramo(t, 1.72, T_PUNO)), kBum = eOut(tramo(t, 1.98, 2.18)), kVuelve = eInOut(tramo(t, 2.2, 2.42));
      const yC = 392;
      let pg = mezcla(RG.manoD, [60, 120], kAtras), pm = mezcla(RM.manoI, [18, 120], kAtras);
      pg = mezcla(pg, enAv(mG0, [503, yC]), kGolpe); pm = mezcla(pm, enAv(mM0, [521, yC]), kGolpe);
      pg = mezcla(pg, [98, 52], kBum); pm = mezcla(pm, [-24, 56], kBum);
      G.manoD = mezcla(pg, RG.manoD, kVuelve); M.manoI = mezcla(pm, RM.manoI, kVuelve);
      M.brazoIDelante = true;
      if (t > T_PUNO) { G.cara = "risa"; M.cara = "risa"; }
      else { G.cara = "guino"; M.cara = "guino"; }
    }
    // ---- 2 · codos (en jarras, se acercan de lado)
    if (t > 2.38 && t < 3.02) {
      const k = eInOut(tramo(t, 2.38, 2.52)) * (1 - eInOut(tramo(t, 2.86, 3.02)));
      G.manoD = mezcla(G.manoD, [57, 142], k); G.manoI = mezcla(G.manoI, [20, 142], k);
      M.manoD = mezcla(M.manoD, [56, 138], k); M.manoI = mezcla(M.manoI, [17, 136], k); M.brazoIDelante = true;
      const d = 22 * eIn(tramo(t, 2.52, T_CODO)) * (1 - eOut(tramo(t, T_CODO, 2.95)));
      cG.x += d; cM.x -= d;
      G.cara = "guino"; M.cara = "guino"; G.rc = -0.06; M.rc = 0.06;
      if (t > T_CODO && t < 2.95) { G.cara = "sorpresa"; M.cara = "risa"; }
    }
    // ---- 3 · golpe de cadera (se inclinan hacia fuera y las caderas chocan)
    if (t > 3.0 && t < 3.78) {
      const kB = eInOut(tramo(t, 3.0, 3.14)) * (1 - eInOut(tramo(t, 3.62, 3.78)));
      G.manoD = mezcla(G.manoD, [86, 30], kB); G.manoI = mezcla(G.manoI, [-8, 32], kB);
      M.manoD = mezcla(M.manoD, [80, 42], kB); M.manoI = mezcla(M.manoI, [-6, 42], kB); M.brazoIDelante = false;
      const kI = eIn(tramo(t, 3.14, T_CADERA)) * (1 - eOut(tramo(t, T_CADERA + 0.03, 3.72)));
      const yHG = PIES - 86 * ESC, yHM = PIES - 90 * ESC;
      Object.assign(cG, { x: XG0 + 24 * kI, y: yHG, giro: -0.22 * kI, piv: [39, 146] });
      Object.assign(cM, { x: XM0 - 24 * kI, y: yHM, giro: 0.22 * kI, piv: [37, 142] });
      G.piernaI = [0, 0.36 * kI]; G.piernaD = [0, 0.36 * kI]; M.piernaI = [0, -0.36 * kI]; M.piernaD = [0, -0.36 * kI];
      G.cara = t > T_CADERA - 0.05 ? "risa" : "guino"; M.cara = t > T_CADERA - 0.05 ? "risa" : "sonrisa";
    }
    // ---- 4 · doble giro con saltito
    if (t > T_GIRO0 - 0.1 && t < T_GIRO1 + 0.1) {
      const k = tramo(t, T_GIRO0, T_GIRO1), c = Math.cos(eInOut(k) * Math.PI * 4);
      const s = Math.sign(c) * Math.max(0.07, Math.abs(c));
      cG.sx = s; cM.sx = s;
      cG.y = cM.y = PIES - Math.sin(k * Math.PI) * 34;
      const kb = Math.sin(k * Math.PI);
      G.manoD = mezcla(RG.manoD, [52, 112], kb); G.manoI = mezcla(RG.manoI, [28, 114], kb); G.brazoIDelante = true;
      M.manoD = mezcla(RM.manoD, [50, 112], kb); M.manoI = mezcla(RM.manoI, [24, 114], kb); M.brazoIDelante = true;
      G.piernaD = [-10 * kb, 0.1 * kb]; M.piernaI = [-10 * kb, -0.1 * kb];
      G.cara = "risa"; M.cara = "risa";
    }
    // ---- 5 · Guillermo pesca a Marcos con una caña invisible
    let pesca = null;
    if (t > 4.62 && t < 6.5) {
      const kAtras = eInOut(tramo(t, 4.62, 4.92)), kLanza = eOut(tramo(t, 4.92, T_LANZA + 0.1)), kSuelta = eInOut(tramo(t, T_SUELTA, 6.45));
      let pd = mezcla(RG.manoD, [34, 36], kAtras), pi = mezcla(RG.manoI, [22, 42], kAtras);
      pd = mezcla(pd, [96, 104], kLanza); pi = mezcla(pi, [84, 108], kLanza);
      let angCana = lerp(lerp(-1.45, -2.3, kAtras), -0.42, kLanza);
      // recoge: la mano derecha da vueltas al carrete
      const kReel = tramo(t, T_PICA + 0.1, T_SUELTA);
      if (kReel > 0 && kReel < 1) {
        const a = (t - T_PICA) * 16;
        pd = [80 + 9 * Math.cos(a), 116 + 9 * Math.sin(a)]; pi = [88, 100];
        angCana = lerp(-0.42, -1.2, eOut(tramo(kReel, 0, 0.15))) + 0.06 * Math.sin(t * 22);
      }
      G.manoD = mezcla(pd, RG.manoD, kSuelta); G.manoI = mezcla(pi, RG.manoI, kSuelta); G.brazoIDelante = true;
      G.cara = t < T_PICA ? "guino" : "risa"; G.rc = 0.08;
      // Marcos: muerde el anzuelo y le arrastran dando saltitos como un pez
      const kPez = tramo(t, T_PICA, T_SUELTA);
      if (t > T_LANZA - 0.1) M.cara = "sorpresa";
      if (kPez > 0) {
        const f = Math.sin(t * 26) * (1 - kSuelta);
        M.manoD = [70 + 6 * f, 128 + 4 * f]; M.manoI = [2 - 6 * f, 128 - 4 * f]; M.brazoIDelante = true;
        cM.x = lerp(XM0, XM0 - 26, eInOut(kPez));
        cM.y = PIES - Math.abs(Math.sin(t * 13)) * 16 * (1 - kSuelta);
        cM.giro = 0.12 * Math.sin(t * 13) * (1 - kSuelta); cM.piv = [39, 232];
        M.rc = -0.1 * Math.sin(t * 13);
      }
      if (t > T_SUELTA) { cM.x = lerp(XM0 - 26, XM0, eInOut(tramo(t, T_SUELTA, 6.5))); M.cara = "risa"; }
      pesca = { angCana, kLanza, kPez, kSuelta };
    }
    // ---- 6 · final sincronizado: se agachan, saltan, chocan las manos en el aire y aterrizan igual
    if (t > 6.45) {
      const kAg = eInOut(tramo(t, 6.45, T_SALTO)) * (1 - eOut(tramo(t, T_SALTO, T_SALTO + 0.08)));
      const kAire = tramo(t, T_SALTO, 7.3), alto = Math.sin(kAire * Math.PI) * 70;
      const kAt = tramo(t, 7.3, 7.45), aterr = Math.sin(kAt * Math.PI) * 0.07;
      const bote = t > 7.6 && t < T_APAGA ? Math.abs(Math.sin((t - 7.6) * 6)) * 9 : 0;
      for (const c of [cG, cM]) { c.y = PIES - alto - bote; c.sy = 1 - 0.1 * kAg - aterr; }
      const kBr = eOut(tramo(t, T_SALTO, T_CHOCA));
      const mG = matCuerpo(cG), mM = matCuerpo(cM);
      const yC = 300 - alto - bote;
      G.manoD = mezcla([62, 140], enAv(mG, [505, yC]), kBr); G.manoI = mezcla([16, 140], [-22, 30], kBr);
      M.manoI = mezcla([16, 136], enAv(mM, [519, yC]), kBr); M.manoD = mezcla([58, 136], [96, 44], kBr);
      M.brazoIDelante = true;
      G.piernaI = [-8 * kAire * (1 - kAire) * 4, 0]; M.piernaD = [-8 * kAire * (1 - kAire) * 4, 0];
      G.cara = t < T_CHOCA ? "guino" : "risa"; M.cara = t < T_CHOCA ? "guino" : "risa";
      G.rc = t > T_CHOCA ? 0.06 + 0.04 * Math.sin(t * 6) : 0; M.rc = t > T_CHOCA ? -0.06 - 0.04 * Math.sin(t * 6) : 0;
      if (t > 8.9) { G.cara = "guino"; }
    }
    return { G, M, mG: matCuerpo(cG), mM: matCuerpo(cM), pesca };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t < T_LLEGA) { this.faseG += dt * 9.5; this.faseM += dt * 9.5; }
    const chispas = (x, y, n, v) => {
      p.nueva(P.DESTELLO, x, y, 0, 0, 0.3, 120);
      for (let i = 0; i < n; i++) { const a = azar(0, 6.283), s = azar(v * 0.4, v); p.nueva(P.CHISPA, x, y, Math.cos(a) * s, Math.sin(a) * s, azar(0.3, 0.6), azar(6, 11)); }
    };
    this.una("puno", t > T_PUNO, () => { temblar(8, 0.2); chispas(512, 392, 14, 380); });
    this.una("bum", t > 2.0, () => { for (let i = 0; i < 16; i++) { const a = azar(-2.8, -0.3), s = azar(150, 400); p.nueva(P.CHISPA, 512, 380, Math.cos(a) * s, Math.sin(a) * s, azar(0.4, 0.7), azar(6, 10)); } });
    this.una("codo", t > T_CODO, () => { temblar(6, 0.2); chispas(512, 395, 10, 300); });
    this.una("cadera", t > T_CADERA, () => {
      temblar(10, 0.3); chispas(512, 430, 10, 320);
      for (let i = 0; i < 10; i++) p.nueva(P.POLVO, 512 + azar(-60, 60), PIES - 6, azar(-120, 120), azar(-40, -5), azar(0.4, 0.8), azar(30, 50));
    });
    this.una("giro", t > T_GIRO1, () => { for (let i = 0; i < 14; i++) p.nueva(P.POLVO, 512 + azar(-160, 160), PIES - 4, azar(-150, 150), azar(-30, -5), azar(0.4, 0.7), azar(26, 44)); });
    this.una("pica", t > T_PICA, () => { temblar(5, 0.2); });
    this.una("choca", t > T_CHOCA, () => {
      temblar(18, 0.45); chispas(512, 240, 26, 520);
      for (let i = 0; i < 110; i++) p.nueva(P.CONFETI, azar(0, W), azar(-140, -10), azar(-60, 60), azar(0, 160), azar(3, 4.5), azar(9, 15), i % 5);
      for (let i = 0; i < 30; i++) p.nueva(P.CONFETI, 512 + azar(-20, 20), 250, azar(-420, 420), azar(-520, -150), azar(2.6, 3.6), azar(9, 14), i % 5);
    });
    this.una("aterriza", t > 7.32, () => { for (let i = 0; i < 18; i++) p.nueva(P.POLVO, 512 + azar(-200, 200), PIES - 4, azar(-160, 160), azar(-40, -5), azar(0.4, 0.8), azar(30, 50)); });
    p.suelo = () => PIES + 8;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Caña invisible (contorno discontinuo) y el sedal hasta la boca de Marcos. */
  cana(g, e, t) {
    const ps = e.pesca;
    if (!ps || ps.kSuelta >= 1) return;
    const a = 1 - ps.kSuelta;
    const mano = aPant(e.mG, e.G._manoD || RG.manoD), mano2 = aPant(e.mG, e.G._manoI || RG.manoI);
    const base = mezcla(mano, mano2, 0.5), L = 125;
    const punta = [base[0] + Math.cos(ps.angCana) * L, base[1] + Math.sin(ps.angCana) * L];
    g.save(); g.globalAlpha = a;
    g.setLineDash([9, 8]); g.lineCap = "round";
    g.strokeStyle = "rgba(255,253,245,.75)"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(base[0] - Math.cos(ps.angCana) * 20, base[1] - Math.sin(ps.angCana) * 20); g.lineTo(punta[0], punta[1]); g.stroke();
    g.setLineDash([]);
    if (t > T_LANZA - 0.02) {
      const bocaM = aPant(e.mM, boca(e.M.rc, "marcos"));
      const k = eOut(tramo(t, T_LANZA - 0.02, T_PICA));
      const fin = [lerp(punta[0], bocaM[0], k), lerp(punta[1], bocaM[1], k) - Math.sin(k * Math.PI) * 70];
      const tenso = tramo(t, T_PICA, T_PICA + 0.2);
      const ctrl = [(punta[0] + fin[0]) / 2, Math.max(punta[1], fin[1]) + 40 * (1 - tenso)];
      g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(punta[0], punta[1]); g.quadraticCurveTo(ctrl[0], ctrl[1], fin[0], fin[1]); g.stroke();
      // anzuelo
      g.strokeStyle = "#cfd6dc"; g.lineWidth = 2.2;
      g.beginPath(); g.arc(fin[0] + 4, fin[1] + 4, 5, Math.PI * 0.9, Math.PI * 2.2); g.stroke();
    }
    g.restore();
  }
  /** Chapitas de los pasos, arriba: se encienden al hacer cada uno. */
  marcador(g, t, a) {
    const al = a * tramo(t, 1.2, 1.5) * (1 - tramo(t, T_TIT, T_TIT + 0.3));
    if (al <= 0) return;
    const w = 128, gap = 12, x0 = 512 - (PASOS.length * w + (PASOS.length - 1) * gap) / 2;
    g.save(); g.globalAlpha = al;
    PASOS.forEach(([nom, tp], i) => {
      const x = x0 + i * (w + gap), hecho = t > tp, k = tramo(t, tp, tp + 0.15);
      const s = 1 + 0.25 * Math.sin(k * Math.PI);
      g.save(); g.translate(x + w / 2, 40); g.scale(s, s);
      rectR(g, -w / 2, -20, w, 40, 20);
      g.fillStyle = hecho ? "#2bff5b" : "rgba(255,255,255,.08)"; g.fill();
      g.strokeStyle = hecho ? "#b9ffca" : "rgba(255,255,255,.25)"; g.lineWidth = 2; g.stroke();
      txt(g, (hecho ? "✓ " : (i + 1) + " ") + nom, 0, 9, { tam: 22, peso: 900, fam: FD, color: hecho ? "#04210c" : "rgba(255,255,255,.55)", esp: 1, max: w - 16 });
      g.restore();
    });
    g.restore();
  }
  ono(g, s, x, y, t0, dur, tam, color, rot) {
    const d = this.t - t0;
    if (d < 0 || d > dur) return;
    const k = eBack(tramo(d, 0, 0.12));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color, borde: "#1a1a1a", bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
    g.restore();
  }
  dibujar(g) {
    // lo caro (textos con brillo, fondos) se prepara en el primer cuadro, que es negro
    if (!this._pre) { this._pre = true; titulo(); fondoBar(); }
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.drawImage(fondoBar(), -60, -60);
    // foco en el suelo
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
    g.drawImage(BLOB2.oroClaro, 150, 470, 724, 150); g.globalAlpha = 0.22; g.drawImage(BLOB2.oroClaro, 160, 60, 704, 520);
    g.restore();
    // sombras
    g.fillStyle = "rgba(0,0,0,.45)";
    for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 58, 9, 0, 0, 6.283); g.fill(); }
    // líneas de giro
    if (t > T_GIRO0 && t < T_GIRO1) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 3; g.lineCap = "round";
      for (const m of [e.mG, e.mM]) {
        const c = aPant(m, [39, 120]);
        for (let i = 0; i < 3; i++) { const ph = t * 14 + i * 2.1; g.beginPath(); g.ellipse(c[0], c[1] - 80 + i * 70, 78, 16, 0, ph, ph + 1.6); g.stroke(); }
      }
      g.restore();
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    this.cana(g, e, t);
    this.p.dibujar(g);
    this.marcador(g, t, a);
    // onomatopeyas
    this.ono(g, "¡PAM!", 512, 318, T_PUNO, 0.55, 54, "#ffd34d", -0.1);
    this.ono(g, "¡TOC!", 512, 330, T_CODO, 0.5, 50, "#fffdf5", 0.08);
    this.ono(g, "¡BOING!", 512, 505, T_CADERA, 0.5, 56, "#ff3d84", -0.06);
    this.ono(g, "¡FIUUU!", 512, 150, T_GIRO0 + 0.1, 0.75, 56, "#2fe3e8", 0.05);
    this.ono(g, "¡PICA!", 690, 200, T_PICA, 0.85, 58, "#2bff5b", 0.1);
    // ¡SALUDO SECRETO!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 118); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00167", nombre: "Saludo secreto", crear: () => new Saludo() });
})();
