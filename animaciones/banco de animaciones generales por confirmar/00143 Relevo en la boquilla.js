"use strict";
/*
 * 00143 · RELEVO EN LA BOQUILLA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se turnan en la máquina del alcoholímetro: sopla Guillermo mientras Rodrigo espera de brazos cruzados; la
 * pantalla sube hasta su tasa, la cámara hace la foto (flash) y sale su polaroid. Cambian de sitio a toda prisa
 * (¡ZAS!) y sopla Rodrigo. Las dos fotos caen en el ranking, una junto a la otra: ¡LOS DOS AL TOP 10!
 */
(() => {
const ESC = 1.55;
const MX = 512, MW = 236, MTOP = 112;                  // la máquina (centro, ancho y arriba)
const BOQ = [MX - MW / 2, 306];                        // donde sale la boquilla, a la izquierda de la pantalla
const XS = 318, XE = 742;                              // el que sopla y el que espera
const T_SOPLA1 = 0.75, T_FOTO1 = 2.85, T_CAMBIO = 3.35, T_SOPLA2 = 4.15, T_FOTO2 = 6.1, T_RANK = 6.5, T_TIT = 7.75, T_APAGA = 10.3;
const VAL = ["1,21", "1,38"], PUESTO = ["#8", "#7"];
const CT = cacheTexto();

/** Foto de la cámara (como fotoDe) con el avatar que se quiera; se guarda cuando ya han cargado las piezas. */
const FOTOS = new Map();
function foto(quien, cara) {
  const k = quien + cara;
  if (FOTOS.has(k)) return FOTOS.get(k);
  const pre = quien === "rodrigo" ? "rodrigo_" : "";
  if (!listo(pre + "torso") || !listo(pre + "cara_" + cara)) return null;
  const S = 300, c = lienzoNuevo(S, S), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, S);
  gr.addColorStop(0, "#2a1435"); gr.addColorStop(1, "#0f0a14");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  const r = semilla(quien === "rodrigo" ? 91 : 37), cols = ["255,170,60", "255,70,140", "120,190,255", "255,220,120"];
  for (let i = 0; i < 9; i++) {
    const x = r() * S, y = r() * S * 0.7, rr = 20 + r() * 45;
    const rg = g.createRadialGradient(x, y, 0, x, y, rr);
    rg.addColorStop(0, `rgba(${cols[i % 4]},.55)`); rg.addColorStop(1, `rgba(${cols[i % 4]},0)`);
    g.fillStyle = rg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const esc = S / 104;
  g.save(); g.translate(S / 2 - 39 * esc, (quien === "rodrigo" ? 4 : 12) * esc); g.scale(esc, esc);
  g.imageSmoothingQuality = "high";
  dibujarAvatar(g, { quien, cara, rc: 0, piernaI: [0, 0], piernaD: [0, 0] }, 0);
  g.restore();
  const v = g.createRadialGradient(S / 2, S * 0.38, S * 0.15, S / 2, S / 2, S * 0.75);
  v.addColorStop(0, "rgba(255,255,255,.08)"); v.addColorStop(1, "rgba(0,0,0,.45)");
  g.fillStyle = v; g.fillRect(0, 0, S, S);
  FOTOS.set(k, c);
  return c;
}

class Relevo extends Escena {
  constructor() {
    super(10.9);
    this.p = new Parts(380);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, 10.85)); }
  /** x de cada uno: el que sopla a la izquierda, el que espera a la derecha; en el cambio se cruzan. */
  x(t, q) {
    const k = eInOut(tramo(t, T_CAMBIO, T_CAMBIO + 0.55));
    let x = q ? lerp(XE, XS + 3, k) : lerp(XS, XE, k);
    // al ranking: cada uno a un lado
    const kR = eInOut(tramo(t, T_RANK - 0.1, T_RANK + 0.45));
    x = lerp(x, q ? 142 : 882, kR);
    return x;
  }
  /** Cuánto ha soplado cada uno (0–1) y el valor que marca la pantalla. */
  soplido(t) {
    if (t < T_CAMBIO) return { q: 0, k: eInOut(tramo(t, T_SOPLA1 + 0.2, T_FOTO1 - 0.35)) };
    return { q: 1, k: eInOut(tramo(t, T_SOPLA2 + 0.2, T_FOTO2 - 0.35)) };
  }
  sopla(t, q) { return q ? t > T_SOPLA2 && t < T_FOTO2 - 0.25 : t > T_SOPLA1 && t < T_FOTO1 - 0.25; }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const P2 = [G, R];
    let y = [0, 0], sx = [1, 1], giro = [0, 0];
    for (const q of [0, 1]) {
      const A = P2[q], R0 = avatar(q ? "rodrigo" : "").rig;
      let mD = R0.manoD.slice(), mI = R0.manoI.slice();
      const soplando = q === 0 ? t < T_CAMBIO : t > T_CAMBIO + 0.55;
      const t0 = q ? T_SOPLA2 : T_SOPLA1, tf = q ? T_FOTO2 : T_FOTO1;
      if (soplando && t < T_RANK) {
        // sujeta la boquilla (que viene de la máquina, a su derecha)
        const k = eInOut(tramo(t, t0 - 0.35, t0));
        const b = boca(0, A.quien);
        mD = mezcla(mD, [b[0] + 24, b[1] + 8], k);
        A.brazoIDelante = false;
        if (this.sopla(t, q)) { A.cara = "dormido"; sx[q] = 1 + 0.025 * Math.abs(Math.sin(t * 5)); }
        if (t > tf - 0.25 && t < tf + 0.35) A.cara = "sorpresa";
        if (t > tf + 0.35) A.cara = "risa";
      } else if (t < T_RANK) {
        // el que espera: brazos cruzados, pie que golpea; mira impresionado
        mD = [24, 112]; mI = [52, 112]; A.brazoIDelante = true;
        A.piernaD = [-Math.max(0, Math.sin(t * 12)) * 5, 0];
        A.cara = "sonrisa"; A.rc = -0.08;
        const s = this.soplido(t);
        if (s.k > 0.6 && s.k < 1) A.cara = "sorpresa";
        if (t > tf - 0.2 && t < tf + 0.6) { A.cara = "risa"; mD = [96, 36]; mI = [52, 112]; } // ¡bien!
      }
      // el cambio a toda prisa
      if (t > T_CAMBIO && t < T_CAMBIO + 0.6) {
        const k = tramo(t, T_CAMBIO, T_CAMBIO + 0.55);
        y[q] = -Math.abs(Math.sin(k * Math.PI * 3)) * 16;
        giro[q] = (q ? -0.14 : 0.14) * Math.sin(k * Math.PI);
        mD = [84, 120 + 20 * Math.sin(t * 30)]; mI = [-6, 120 - 20 * Math.sin(t * 30)];
        A.cara = "risa";
      }
      // ranking: saltan y señalan su foto
      if (t >= T_RANK) {
        const k = eOut(tramo(t, T_RANK + 0.3, T_RANK + 0.6)), salta = t > T_TIT ? -Math.abs(Math.sin((t - T_TIT) * 8)) * 26 * (1 - tramo(t, 9.6, 9.9)) : 0;
        y[q] = salta;
        // Rodrigo acaba a la izquierda y Guillermo a la derecha: cada uno señala su foto, que está a su lado
        if (q === 1) { mD = mezcla(R0.manoD, [118, 70], k); mI = mezcla(R0.manoI, [-18, 30 + Math.sin(t * 8) * 4], eOut(tramo(t, T_TIT, T_TIT + 0.2))); }
        else { mI = mezcla(R0.manoI, [-42, 70], k); mD = mezcla(R0.manoD, [96, 30 + Math.sin(t * 8) * 4], eOut(tramo(t, T_TIT, T_TIT + 0.2))); A.brazoIDelante = true; }
        A.cara = t > T_TIT ? (q === 0 && t > 9.0 ? "guino" : "risa") : "sorpresa";
        A.rc = (q ? 1 : -1) * 0.1 * k;
      }
      A.manoD = mD; A.manoI = mI;
    }
    return [0, 1].map((q) => ({ pose: P2[q], m: matAv(this.x(t, q), PIES + y[q], ESC, giro[q], sx[q], 1) }));
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // el aire entra por la boquilla
    for (const q of [0, 1]) if (this.sopla(t, q) && Math.random() < 30 * dt) {
      const yb = this.boquilla(t)[1];
      p.nueva(P.VAPOR, BOQ[0] - 40 + azar(-10, 10), yb + azar(-6, 6), azar(80, 180), azar(-10, 10), azar(0.3, 0.5), azar(10, 18));
    }
    for (const [i, tf] of [[0, T_FOTO1], [1, T_FOTO2]]) this.una("foto" + i, t > tf, () => {
      temblar(10, 0.25);
      p.nueva(P.DESTELLO, MX, MTOP + 26, 0, 0, 0.4, 260);
      for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(150, 380); p.nueva(P.CHISPA, MX, MTOP + 26, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    this.una("zas", t > T_CAMBIO + 0.1, () => {
      temblar(8, 0.25);
      for (let k = 0; k < 34; k++) p.nueva(P.POLVO, 530 + azar(-70, 70), azar(250, 560), azar(-160, 160), azar(-80, 40), azar(0.5, 0.9), azar(70, 110));
    });
    this.una("rank", t > T_RANK + 1.05, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 24; k++) { const a = azar(0, 6.283); p.nueva(P.DESTELLO, 512 + Math.cos(a) * 70, 82 + Math.sin(a) * 30, Math.cos(a) * 260, Math.sin(a) * 260, azar(0.3, 0.5), azar(10, 18)); }
    });
    this.una("tit", t > T_TIT, () => {
      temblar(18, 0.45);
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Punta de la boquilla: va a la boca del que sopla (está en un brazo flexible). */
  boquilla(t) {
    const e = this.poses(), s = this.soplido(t), q = t < T_CAMBIO ? 0 : 1;
    const A = e[q], b = aPant(A.m, boca(A.pose.rc || 0, A.pose.quien));
    const k = this.sopla(t, q) || (t > (q ? T_SOPLA2 : T_SOPLA1) - 0.2 && t < (q ? T_FOTO2 : T_FOTO1)) ? 1 : 0;
    void s;
    return k ? [b[0] + 4, b[1]] : [BOQ[0] - 78, BOQ[1] + 6];
  }
  /** Cuerpo de la máquina (estático): sombra, carcasa con el borde verde, cámara, lector, rótulo, ranura. */
  cuerpo(g, x0, x1) {
    g.fillStyle = "rgba(0,0,0,.5)"; g.beginPath(); g.ellipse(MX, PIES, MW * 0.62, 14, 0, 0, 6.283); g.fill();
    const gc = g.createLinearGradient(x0, 0, x1, 0);
    gc.addColorStop(0, "#15171c"); gc.addColorStop(0.5, "#2c3038"); gc.addColorStop(1, "#121418");
    g.fillStyle = gc; rectR(g, x0, MTOP, MW, PIES - MTOP, 22); g.fill();
    g.strokeStyle = "rgba(43,255,91,.75)"; g.lineWidth = 3; rectR(g, x0 + 4, MTOP + 4, MW - 8, PIES - MTOP - 8, 19);
    g.shadowColor = "#2bff5b"; g.shadowBlur = 12; g.stroke(); g.shadowBlur = 0; g.shadowColor = "transparent";
    // cámara (arriba, en el centro) y lector de tarjetas (arriba a la derecha)
    g.fillStyle = "#0a0b0d"; g.beginPath(); g.arc(MX, MTOP + 26, 15, 0, 6.283); g.fill();
    g.strokeStyle = "#5a606a"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#2a4a8a"; g.beginPath(); g.arc(MX, MTOP + 26, 7, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.arc(MX - 3, MTOP + 23, 2.4, 0, 6.283); g.fill();
    g.fillStyle = "#e3262f"; g.beginPath(); g.arc(MX + 24, MTOP + 20, 3, 0, 6.283); g.fill();
    g.fillStyle = "#1c1f24"; rectR(g, x1 - 64, MTOP + 12, 48, 34, 6); g.fill();
    g.strokeStyle = "rgba(255,211,77,.9)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x1 - 46, MTOP + 29, 5 + i * 5, -0.7, 0.7); g.stroke(); }
    g.fillStyle = "#2bff5b"; g.beginPath(); g.arc(x1 - 22, MTOP + 18, 2.4, 0, 6.283); g.fill();
    txt(g, "¿CUÁNTO SOPLAS?", MX, 352, { tam: 24, peso: 900, fam: FD, color: "#d8ffe0", esp: 2, max: MW - 30 });
    g.fillStyle = "#050607"; rectR(g, MX - 70, 392, 140, 12, 5); g.fill();
    g.fillStyle = "#3a3f49"; rectR(g, x0 - 14, BOQ[1] - 16, 22, 32, 6); g.fill();
  }
  maquina(g, t, a) {
    if (a <= 0) return;
    const x0 = MX - MW / 2, x1 = MX + MW / 2, s = this.soplido(t);
    g.save(); g.globalAlpha = a;
    // el cuerpo (con el brillo verde del borde) se pinta una vez y se copia
    const OX = x0 - 40, OY = MTOP - 24;
    if (!CT.has("cuerpo")) {
      const c = lienzoNuevo(MW + 80, PIES - MTOP + 48), cg = c.getContext("2d");
      cg.translate(-OX, -OY); this.cuerpo(cg, x0, x1); CT.set("cuerpo", c);
    }
    g.drawImage(CT.get("cuerpo"), OX, OY);
    // la pantalla
    const px = x0 + 22, py = MTOP + 58, pw = MW - 44, ph = 138;
    g.fillStyle = "#050806"; rectR(g, px - 6, py - 6, pw + 12, ph + 12, 10); g.fill();
    g.fillStyle = "#07120a"; g.fillRect(px, py, pw, ph);
    const quien = s.q, val = parseFloat(VAL[quien].replace(",", ".")), v = val * s.k;
    const tf = quien ? T_FOTO2 : T_FOTO1, t0 = quien ? T_SOPLA2 : T_SOPLA1;
    if (t < t0 + 0.1 || (t > T_CAMBIO && t < T_SOPLA2 + 0.1)) {
      if (Math.sin(t * 9) > -0.3) txt(g, "¡SOPLA!", MX, py + 82, { tam: 44, peso: 900, fam: FD, color: "#2bff5b", esp: 3 });
    } else {
      // barra de soplido y la tasa
      g.fillStyle = "rgba(43,255,91,.18)"; g.fillRect(px + 12, py + 14, pw - 24, 14);
      g.fillStyle = "#2bff5b"; g.fillRect(px + 12, py + 14, (pw - 24) * s.k, 14);
      txt(g, fmt(v), MX, py + 96, { tam: 66, peso: 900, fam: FD, color: "#d8ffe0", esp: 2 });
      txt(g, "g/L", MX, py + 124, { tam: 20, peso: 800, color: "#2bff5b", esp: 3 });
      if (t > tf) txt(g, `TOP 10 ✓ ${PUESTO[quien]}`, MX, py + ph - 2, { tam: 16, peso: 800, color: "#ffd34d", esp: 2, alfa: Math.sin(t * 10) > -0.4 ? 1 : 0.3 });
    }
    g.fillStyle = "rgba(255,255,255,.05)"; g.fillRect(px, py, pw * 0.45, ph);
    g.restore();
  }
  /** La boquilla: tubo blanco con el anillo verde, de la máquina a la boca. */
  dibujarBoquilla(g, t, a) {
    if (a <= 0) return;
    const P0 = [BOQ[0] - 6, BOQ[1]], P1 = this.boquilla(t);
    const L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), ang = Math.atan2(P1[1] - P0[1], P1[0] - P0[0]);
    g.save(); g.globalAlpha = a; g.translate(P0[0], P0[1]); g.rotate(ang);
    const R = 15;
    const gr = g.createLinearGradient(0, -R, 0, R);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.3, "#eef2f5"); gr.addColorStop(0.75, "#bcc6cf"); gr.addColorStop(1, "#7f8a96");
    g.fillStyle = gr; rectR(g, 0, -R, L - 12, 2 * R, 6); g.fill();
    const gv = g.createLinearGradient(0, -R, 0, R);
    gv.addColorStop(0, "#b6ffc8"); gv.addColorStop(0.4, "#2bff5b"); gv.addColorStop(1, "#0b7a2a");
    g.fillStyle = gv; g.fillRect(L * 0.35, -R - 1, 12, 2 * R + 2);
    g.fillStyle = gr; rectR(g, L - 18, -9, 18, 18, 5); g.fill();
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(6, -R + 4, L - 26, 3);
    g.restore();
  }
  /** Polaroid que sale de la ranura de la máquina (antes del ranking). */
  polaroidSale(g, t, a) {
    for (const [q, tf] of [[0, T_FOTO1], [1, T_FOTO2]]) {
      if (t < tf + 0.15 || t > T_RANK + 0.2) continue;
      const k = eOut(tramo(t, tf + 0.15, tf + 0.7)), al = a * (1 - tramo(t, T_RANK - 0.05, T_RANK + 0.2));
      g.save(); g.globalAlpha = al;
      g.beginPath(); g.rect(MX - 80, 398, 160, 200); g.clip();
      polaroid(g, foto(q ? "rodrigo" : "guillermo", "risa"), MX + (q ? 8 : -8), 398 - 60 + 120 * k, 110, q ? 0.04 : -0.04, null);
      g.restore();
    }
  }
  ranking(g, t, a) {
    if (t < T_RANK) return;
    // pegatina TOP 10
    if (t > T_RANK + 0.95) {
      const k = tramo(t, T_RANK + 0.95, T_RANK + 1.1), s = lerp(2.6, 1, eIn(k)), sp = pegatinaTop10();
      g.save(); g.globalAlpha = a * clamp(k * 3, 0, 1); g.translate(512, 78); g.rotate(-0.06 + (1 - k) * 0.4); g.scale(s * 0.85, s * 0.85);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
    }
    // las dos fotos caen una junto a la otra
    for (const [q, x, rot, t0] of [[1, 392, -0.07, T_RANK + 0.45], [0, 632, 0.06, T_RANK + 0.2]]) {
      if (t < t0) continue;
      const d = t - t0, cy = lerp(-200, 310, eOut(tramo(d, 0, 0.7)));
      const giro = rot + 0.3 * Math.sin(d * 5.2) * Math.exp(-d * 2.4);
      g.save(); g.globalAlpha = a;
      polaroid(g, foto(q ? "rodrigo" : "guillermo", "risa"), x, cy, 214, giro, (c, px, py, w, h) => {
        txt(c, PUESTO[q], px + 16, py + h * 0.68, { tam: 30, peso: 900, fam: FD, color: "#241812", alin: "left" });
        txt(c, `${VAL[q]} g/L`, px + w - 14, py + h * 0.68, { tam: 26, peso: 900, fam: FD, color: "#14a83a", alin: "right" });
      });
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    const aM = a * (1 - tramo(t, T_RANK - 0.1, T_RANK + 0.3));
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, PIES, 300, 0.8 * (aM / Math.max(a, 0.001)));
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * aM; g.drawImage(BLOB.verde, 300, 120, 424, 440);
    g.restore();
    // de rango: rayos de luz como en el puesto
    if (t > T_RANK) {
      const l = a * tramo(t, T_RANK, T_RANK + 0.4);
      g.save(); g.globalCompositeOperation = "lighter";
      for (let i = -1; i <= 1; i++) {
        const gr = g.createLinearGradient(0, 0, 0, 470);
        gr.addColorStop(0, `rgba(255,250,220,${0.14 * l})`); gr.addColorStop(1, "rgba(255,250,220,0)");
        g.fillStyle = gr; g.beginPath(); g.moveTo(512 + i * 90 - 40, -10); g.lineTo(512 + i * 90 + 40, -10); g.lineTo(512 + i * 210 + 120, 470); g.lineTo(512 + i * 210 - 120, 470); g.closePath(); g.fill();
      }
      g.restore();
    }
    this.maquina(g, t, aM);
    this.polaroidSale(g, t, aM);
    g.save(); g.globalAlpha = a;
    // el que espera va detrás; el que sopla, delante de la máquina
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.restore();
    this.dibujarBoquilla(g, t, aM);
    this.ranking(g, t, a);
    // flash de la cámara
    for (const tf of [T_FOTO1, T_FOTO2]) {
      const d = t - tf;
      if (d > 0 && d < 0.35) { g.fillStyle = `rgba(255,255,255,${0.75 * (1 - d / 0.35) * a})`; g.fillRect(-60, -60, W + 120, H + 120); }
      if (d > 0 && d < 0.8) {
        const k = eBack(tramo(d, 0, 0.12));
        g.save(); g.translate(MX + 150, MTOP - 20 + 40); g.rotate(0.12); g.scale(k, k);
        txt(g, "¡CLIC!", 0, 0, { tam: 44, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(d, 0.6, 0.8)) });
        g.restore();
      }
    }
    this.p.dibujar(g);
    // FUUUH al soplar
    for (const q of [0, 1]) if (this.sopla(t, q)) {
      const t0 = q ? T_SOPLA2 : T_SOPLA1, k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(208 + Math.sin(t * 30) * 2, 210); g.rotate(-0.1); g.scale(k, k);
      txt(g, "FUUUH…", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#d8ffe0", borde: "#04140a", bordeAncho: 7, esp: 2, alfa: a });
      g.restore();
    }
    // ¡ZAS!
    const dz = t - T_CAMBIO - 0.15;
    if (dz > 0 && dz < 0.6) {
      const k = eBack(tramo(dz, 0, 0.1));
      g.save(); g.translate(530, 220); g.rotate(-0.08); g.scale(k, k);
      txt(g, "¡ZAS!", 0, 0, { tam: 72, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 9, esp: 2, alfa: a * (1 - tramo(dz, 0.45, 0.6)) });
      g.restore();
    }
    // ¡LOS DOS AL TOP 10!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      const gb = g.createLinearGradient(0, 470, 0, 600);
      gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(0.35, "rgba(0,0,0,.75)"); gb.addColorStop(1, "rgba(0,0,0,.88)");
      g.fillStyle = gb; g.fillRect(-60, 462, W + 120, 200);
      g.translate(512, 532); g.rotate(-0.02); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(1000, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 45, 0, 135);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c9ffd6"); gr.addColorStop(1, "#2bff5b");
    txt(g, "¡LOS DOS AL TOP 10!", 500, 128, { tam: 108, peso: 900, fam: FD, color: gr, borde: "#03230c", bordeAncho: 11, esp: 4, glow: "rgba(43,255,91,.8)", glowTam: 24, max: 930 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00143", nombre: "Relevo en la boquilla", crear: () => new Relevo() });
})();
