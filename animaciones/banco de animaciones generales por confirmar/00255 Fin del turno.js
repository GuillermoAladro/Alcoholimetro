"use strict";
/*
 * 00255 · FIN DEL TURNO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Vestuario del parque de bomberos, 21:59:56. Marcos, cansado, espera con la tarjeta encima del reloj de fichar y
 * Guillermo asoma por la izquierda con una caña y un refresco (¿YA?). A las 22:00 suena el reloj (¡RIIING!), Marcos
 * ficha (¡CLAC!): ¡FIN DEL TURNO! Se quita el casco, lo lanza al gancho (¡CLONC!) y se sacude el pelo rizado.
 * Guillermo le lanza el refresco de naranja, brindan caña con refresco (¡CHIN!) y beben. Se apagan los
 * fluorescentes uno a uno.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45;
const XM = 760, XG = 520, XG0 = 70;
const RM = avatar("bombero").rig, RG = avatar().rig;
const RELOJ = { x0: 800, x1: 905, y0: 345, y1: 468 };
const RANURA = [852, 345];
const GANCHO = [958, 214];
const T_TIC = [0.6, 1.2, 1.8], T_RING = 2.4, T_TIT = 2.5;
const T_CASCO = 3.0, T_QUITA = 3.3, T_LANZA = 3.62, T_CLONC = 4.0, T_SACUDE = 4.08, T_SACUDE1 = 4.85;
const T_ANDA = 2.95, T_LLEGA = 4.3, T_TIRA = 5.05, T_COGE = 5.55, T_PSST = 5.95, T_BRIN = 6.2, T_CHIN = 6.5;
const T_BEBE = 7.05, T_AAH = 8.05, T_LUZ = [8.95, 9.3, 9.65], DUR = 10.3;
const AX = { sonrisa: 42.5, borracho: 46, risa: 45, dormido: 43.5, sorpresa: 43.5, guino: 48.5 };

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Casco de Marcos suelto: su centro (punto 44, 18 de la cara) en (cx, cy) del marco actual, girado y escalado. */
function cascoEn(g, cx, cy, rot, esc) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(esc, esc); g.translate(-44, -18);
  cascoBombero(g, 88);
  g.restore();
}
/** Vaso de caña con la mano en el centro (unidades de avatar). */
function cana(g, x, y, ang, nivel, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const vaso = () => { g.beginPath(); g.moveTo(-7.2, -15); g.lineTo(7.2, -15); g.lineTo(5.6, 14); g.quadraticCurveTo(0, 15.5, -5.6, 14); g.closePath(); };
  vaso(); g.fillStyle = "rgba(200,225,255,.18)"; g.fill();
  g.save(); vaso(); g.clip();
  const alto = 25 * clamp(nivel, 0, 1), ys = 14 - alto;
  if (alto > 0.4) {
    const gr = g.createLinearGradient(0, 14, 0, ys);
    gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
    g.fillStyle = gr; g.fillRect(-8, ys, 16, alto + 2);
    g.fillStyle = "rgba(255,245,200,.75)";
    for (let i = 0; i < 4; i++) { const by = 13 - ((t * 20 + i * 6.1) % Math.max(2, alto - 2)); g.beginPath(); g.arc(-3.5 + i * 2.4, by, 0.8, 0, 6.283); g.fill(); }
  }
  g.restore();
  if (nivel > 0.05) {
    const ys2 = 14 - 25 * clamp(nivel, 0, 1);
    g.fillStyle = "#fffaf0";
    g.beginPath(); g.moveTo(-7, ys2 + 2.5);
    for (let i = 0; i <= 3; i++) g.arc(-6 + i * 4, ys2 - 1, 2.6 + (i % 2) * 0.8, Math.PI, 0);
    g.lineTo(7, ys2 + 2.5); g.closePath(); g.fill();
  }
  vaso(); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.3; g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-5, -12, 1.6, 22);
  g.restore();
}
/** Lata de refresco de naranja (naranja y blanca, con una rodaja dibujada y pajita si está abierta). */
function refresco(g, x, y, ang, abierta, esc = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc);
  const w = 13, h = 24;
  if (abierta) {
    g.save(); g.translate(2.6, -h / 2); g.rotate(0.22);
    g.fillStyle = "#ffffff"; g.fillRect(-1.3, -12, 2.6, 13);
    g.fillStyle = "#ff3d84"; for (let i = 0; i < 4; i++) g.fillRect(-1.3, -12 + i * 3.3, 2.6, 1.6);
    g.restore();
  }
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#8a2e00"); gr.addColorStop(0.3, "#ff7a12"); gr.addColorStop(0.52, "#ffc58a"); gr.addColorStop(0.74, "#ff7a12"); gr.addColorStop(1, "#7a2400");
  g.fillStyle = gr; rectR(g, -w / 2, -h / 2, w, h, 2.5); g.fill();
  // ola blanca
  g.fillStyle = "rgba(255,255,255,.95)";
  g.beginPath(); g.moveTo(-w / 2, -1); g.quadraticCurveTo(-2, -5, 1, -1.5); g.quadraticCurveTo(4, 2, w / 2, -2.5); g.lineTo(w / 2, 1.2);
  g.quadraticCurveTo(4, 5.5, 1, 2); g.quadraticCurveTo(-2, -1.5, -w / 2, 2.5); g.closePath(); g.fill();
  // rodaja de naranja
  g.fillStyle = "#ffb000"; g.beginPath(); g.arc(0, 6.5, 3.4, 0, 6.283); g.fill();
  g.strokeStyle = "#fff4c0"; g.lineWidth = 0.6;
  for (let i = 0; i < 6; i++) { const a = i * 1.047; g.beginPath(); g.moveTo(0, 6.5); g.lineTo(Math.cos(a) * 3, 6.5 + Math.sin(a) * 3); g.stroke(); }
  g.beginPath(); g.arc(0, 6.5, 3.4, 0, 6.283); g.stroke();
  g.fillStyle = "#d3d8dd"; rectR(g, -w / 2 + 0.6, -h / 2 - 1.6, w - 1.2, 3.2, 1.4); g.fill();
  g.fillStyle = "#99a2aa"; rectR(g, -w / 2 + 1, h / 2 - 1.4, w - 2, 2.6, 1.2); g.fill();
  g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-w * 0.22, -h / 2 + 2.2, 1.5, h - 4.4);
  g.restore();
}
/** Tarjeta de fichar (unidades de avatar), con su centro en (x, y). */
function tarjeta(g, x, y, ang, visible = 1) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.rect(-5.5, -9, 11, 18 * visible); g.clip();
  g.fillStyle = "#f6efd8"; rectR(g, -5.5, -9, 11, 18, 1.2); g.fill();
  g.fillStyle = "#e3262f"; g.fillRect(-5.5, -9, 11, 3);
  g.fillStyle = "rgba(60,60,80,.5)"; for (let i = 0; i < 4; i++) g.fillRect(-3.5, -3 + i * 3, 7, 0.9);
  g.restore();
}

class FinDelTurno extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.gotas = [];
    this.fG = 0;
  }
  luz() { return tramo(this.t, 0.02, 0.45); }
  apagado() { let n = 0; for (const x of T_LUZ) if (this.t > x) n++; return n; }

  // ------------------------------------------------------------------ poses
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    // ---- Guillermo: asoma, entra andando
    let xg = XG0, yg = PIES, giroG = 0.17;
    if (t < T_ANDA) {
      G.manoD = [90 + 3 * Math.sin(t * 9), 62 + 4 * Math.sin(t * 9)]; G.cara = "sonrisa"; G.rc = 0.12;
      if (t > 0.9 && t < 1.8) G.cara = "guino";
      if (t > T_RING) { G.cara = "risa"; G.manoD = [92, 46 + 6 * Math.sin(t * 20)]; yg -= Math.abs(Math.sin(t * 14)) * 10; }
    } else {
      const u = tramo(t, T_ANDA, T_LLEGA);
      xg = lerp(XG0, XG, eInOut(u)); giroG = 0.17 * (1 - eOut(tramo(t, T_ANDA, T_ANDA + 0.4)));
      if (u < 1) {
        const a = andar(this.fG, 1 - tramo(t, T_LLEGA - 0.2, T_LLEGA));
        G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote * ESC;
      }
      G.manoD = [78, 112]; G.manoI = [2, 148]; G.cara = "risa"; G.rc = 0.06;
    }
    // ---- Marcos: tarjeta, ficha, casco, sacude el pelo
    const mM = matAv(XM, PIES, ESC);
    const ran = enAv(mM, RANURA);
    const encima = [ran[0], ran[1] - 13], dentro = [ran[0], ran[1] - 4];
    M.manoD = mezcla([67, 152], encima, eInOut(tramo(t, 0.35, 0.9)));
    M.rc = 0.04 * Math.sin(t * 2.2);
    if (t > 0.9) { M.cara = "sonrisa"; M.rc = 0.12; }
    if (t > 0.9 && t < T_RING) M.manoD = [encima[0], encima[1] + 1.5 * Math.sin(t * 16)];
    if (t > 1.6 && t < 2.2) M.cara = "guino";
    if (t > T_RING - 0.12) M.manoD = mezcla(encima, dentro, eIn(tramo(t, T_RING - 0.12, T_RING)));
    if (t > T_RING) { M.cara = "sorpresa"; M.rc = 0.06; }
    if (t > T_RING + 0.25) { M.cara = "risa"; M.rc = -0.05; }
    // se quita el casco: la mano al ala derecha, lo saca de lado y lo lanza al gancho
    this.cascoMano = null;
    if (t > T_CASCO) {
      const ala = [69, 37];
      const k = eInOut(tramo(t, T_CASCO, T_QUITA));
      M.manoD = mezcla(dentro, ala, k); M.cara = "guino"; M.rc = 0;
      if (t > T_QUITA) {
        const kq = eInOut(tramo(t, T_QUITA, T_LANZA - 0.05));
        const kl = eOut(tramo(t, T_LANZA - 0.12, T_LANZA));
        M.manoD = mezcla(mezcla(ala, [96, 64], kq), [104, 36], kl);
        M.casco = false; M.cara = "sonrisa";
        if (t < T_LANZA) {
          const d = [M.manoD[0] - ala[0], M.manoD[1] - ala[1]];
          this.cascoMano = { c: [38 + d[0] + 4 * kq, 17.9 + d[1]], rot: 0.35 * kq };
        }
      }
      if (t > T_LANZA + 0.15) M.manoD = mezcla([104, 36], [67, 152], eInOut(tramo(t, T_LANZA + 0.15, T_LANZA + 0.5)));
    }
    if (t > T_QUITA) M.casco = false;
    // sacude el pelo
    if (t > T_SACUDE && t < T_SACUDE1) {
      const k = Math.sin(tramo(t, T_SACUDE, T_SACUDE1) * Math.PI);
      M.rc = 0.3 * k * Math.sin((t - T_SACUDE) * 30); M.cara = "dormido"; M.puntas = 0;
    } else if (t >= T_SACUDE1 && t < T_TIRA) { M.cara = "risa"; M.rc = -0.08; }
    if (t > T_LLEGA - 0.3 && t < T_TIRA) { G.cara = "risa"; G.rc = 0.1; }
    // Guillermo le lanza el refresco (mano izquierda, por encima de la cabeza)
    this.lataG = t < T_TIRA + 0.18;
    const mG = matAv(xg, yg, ESC, giroG);
    if (t > T_TIRA - 0.3 && t < T_TIRA + 0.6) {
      const kA = eInOut(tramo(t, T_TIRA - 0.3, T_TIRA)), kB = eOut(tramo(t, T_TIRA, T_TIRA + 0.18)), kC = eInOut(tramo(t, T_TIRA + 0.25, T_TIRA + 0.6));
      G.manoI = mezcla(mezcla(mezcla([2, 148], [-14, 150], kA), [12, 20], kB), [9, 160], kC);
      G.cara = "guino"; G.rc = 0.08;
    }
    // Marcos lo coge con la izquierda
    const pCoge = enAv(mM, [658, 300]);
    if (t > T_TIRA) {
      M.brazoIDelante = true;
      const k = eOut(tramo(t, T_TIRA + 0.05, T_COGE - 0.05));
      M.manoI = mezcla([6, 152], pCoge, k);
      M.cara = t < T_COGE ? "sorpresa" : "risa"; M.rc = t < T_COGE ? -0.1 : -0.05;
      if (t > T_COGE) {
        const k2 = eInOut(tramo(t, T_COGE + 0.05, T_PSST - 0.05));
        M.manoI = mezcla(pCoge, [14, 112], k2);
        if (t > T_PSST - 0.1 && t < T_PSST + 0.25) M.cara = "sorpresa";
      }
    }
    this.lataM = t > T_COGE;
    // brindis
    const P = [640, 380];
    if (t > T_BRIN) {
      const k = eInOut(tramo(t, T_BRIN, T_CHIN)) * (1 - eInOut(tramo(t, T_CHIN + 0.25, T_BEBE - 0.05)));
      const ch = Math.max(0, 1 - Math.abs(t - T_CHIN) * 7);
      G.manoD = mezcla([78, 112], enAv(mG, [P[0] - 12 + 4 * ch, P[1] + 8]), k);
      M.manoI = mezcla([14, 112], enAv(mM, [P[0] + 12 - 4 * ch, P[1] + 10]), k);
      G.cara = "risa"; M.cara = "risa"; G.rc = 0.08; M.rc = -0.08;
      this.angG = 0.12 * k; this.angM = -0.12 * k;
    } else { this.angG = 0; this.angM = 0; }
    // beben
    this.nivel = 0.9;
    if (t > T_BEBE - 0.3) {
      const kB = eInOut(tramo(t, T_BEBE - 0.3, T_BEBE)) * (1 - eInOut(tramo(t, T_AAH - 0.2, T_AAH + 0.1)));
      const kT = eInOut(tramo(t, T_BEBE, T_BEBE + 0.3)) * (1 - eInOut(tramo(t, T_AAH - 0.25, T_AAH)));
      G.rc = lerp(0.08, -0.34, kT); M.rc = lerp(-0.08, 0.34, kT);
      const aG = lerp(-0.5, -1.75, kT), aM = lerp(0.5, 1.75, kT);
      this.angG = aG * kB; this.angM = aM * kB;
      const bG = boca(G.rc), tG = rot2([0, -14], this.angG);
      G.manoD = mezcla([78, 112], [bG[0] - tG[0] + 2, bG[1] - tG[1] + 1], kB);
      const bM = boca(M.rc, "bombero"), tM = rot2([-1.5, -13], this.angM);
      M.manoI = mezcla([14, 112], [bM[0] - tM[0] - 2, bM[1] - tM[1] + 1], kB);
      if (kT > 0.3) { G.cara = "dormido"; M.cara = "dormido"; }
      this.nivel = lerp(0.9, 0.35, tramo(t, T_BEBE + 0.2, T_AAH - 0.3));
      if (t > T_AAH) { G.cara = "risa"; M.cara = "risa"; G.rc = 0.1; M.rc = -0.1; }
      if (t > T_AAH + 0.7) { G.cara = "guino"; }
      if (t > T_AAH + 1.1) { M.cara = "guino"; G.cara = "risa"; }
    }
    if (t > T_BRIN) this.nivel = Math.min(this.nivel, 0.9);
    // objetos en las manos
    const tG = this.angG, nv = this.nivel;
    G.objD = (g, m) => cana(g, m[0], m[1] - 1, tG, nv, t);
    if (this.lataG) G.objI = (g, m) => refresco(g, m[0], m[1] - 1, 0, false);
    if (t < T_CASCO + 0.05) M.objD2 = (g, m) => tarjeta(g, m[0] + 1, m[1] - 9, 0);
    if (this.cascoMano) { const c = this.cascoMano; M.objD = (g) => cascoEn(g, c.c[0], c.c[1], c.rot, 0.65); }
    const aM = this.angM;
    if (this.lataM) M.objI = (g, m) => refresco(g, m[0], m[1] - 1, aM, t > T_PSST);
    return { G, M, mG, mM };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > T_ANDA && t < T_LLEGA) this.fG += dt * 9;
    this.una("ring", t > T_RING, () => {
      temblar(9, 0.3);
      for (let i = 0; i < 10; i++) { const a = azar(0, 6.283), v = azar(120, 260); p.nueva(P.CHISPA, RANURA[0], RANURA[1] + 40, Math.cos(a) * v, Math.sin(a) * v - 80, azar(0.3, 0.6), azar(5, 9)); }
    });
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 60; i++) p.nueva(P.CONFETI, azar(140, 880), azar(-40, 20), azar(-60, 60), azar(40, 160), azar(2.2, 3.4), azar(9, 14), i % 5);
    });
    this.una("clonc", t > T_CLONC, () => {
      temblar(6, 0.2);
      for (let i = 0; i < 6; i++) { const a = azar(0, 6.283), v = azar(80, 200); p.nueva(P.CHISPA, GANCHO[0], GANCHO[1] + 8, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.45), azar(4, 7)); }
    });
    // gotas de sudor al sacudir el pelo
    if (t > T_SACUDE && t < T_SACUDE1 && Math.random() < 40 * dt) {
      const e = this.cabezaM || [XM, 300], a = azar(-Math.PI, 0), v = azar(180, 360);
      this.gotas.push({ x: e[0] + Math.cos(a) * 40, y: e[1] - 20 + Math.sin(a) * 30, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, v: azar(0.5, 0.8) });
    }
    this.una("coge", t > T_COGE, () => temblar(4, 0.15));
    this.una("psst", t > T_PSST, () => {
      const e = this.pLataM || [700, 420];
      for (let i = 0; i < 16; i++) p.nueva(P.ESPUMA, e[0] + azar(-4, 4), e[1] - 20, azar(-70, 70), azar(-260, -120), azar(0.4, 0.8), azar(3, 6));
    });
    this.una("chin", t > T_CHIN, () => {
      temblar(12, 0.3);
      p.nueva(P.DESTELLO, 640, 362, 0, 0, 0.35, 200);
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(120, 380); p.nueva(P.ESPUMA, 640, 362, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 0.9), azar(4, 8)); }
      for (let i = 0; i < 12; i++) { const a = azar(0, 6.283), v = azar(150, 320); p.nueva(P.CHISPA, 640, 362, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    T_LUZ.forEach((x, i) => this.una("luz" + i, t > x, () => temblar(2, 0.1)));
    for (const d of this.gotas) { d.v -= dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    p.suelo = () => PIES + 4;
    p.actualizar(dt);
  }

  // ------------------------------------------------------------------ fondo
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // pared
    const gp = g.createLinearGradient(0, -60, 0, 520);
    gp.addColorStop(0, "#1a2029"); gp.addColorStop(0.5, "#2b3542"); gp.addColorStop(1, "#232b36");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 600);
    // techo con viga
    g.fillStyle = "#11151b"; g.fillRect(-60, -60, W + 120, 98);
    g.fillStyle = "#3a434e"; g.fillRect(-60, 36, W + 120, 4);
    // franja roja de la pared
    g.fillStyle = "#9e1b14"; g.fillRect(-60, 128, W + 120, 14);
    g.fillStyle = "#c9d0d6"; g.fillRect(-60, 142, W + 120, 3);
    // taquillas
    for (let i = 0; i < 9; i++) {
      const x = -30 + i * 84, y = 168, w = 80, h = 330;
      const gt = g.createLinearGradient(x, 0, x + w, 0);
      gt.addColorStop(0, "#47586b"); gt.addColorStop(0.5, "#5d7189"); gt.addColorStop(1, "#3c4b5c");
      g.fillStyle = gt; g.fillRect(x, y, w, h);
      g.strokeStyle = "#1e2630"; g.lineWidth = 3; g.strokeRect(x, y, w, h);
      g.fillStyle = "#2a3440";
      for (let k = 0; k < 4; k++) rectR(g, x + 18, y + 22 + k * 9, 44, 4, 2), g.fill();
      g.fillStyle = "#f2f2f2"; rectR(g, x + 28, y + 70, 24, 14, 2); g.fill();
      txt(g, String(11 + i), x + 40, y + 82, { tam: 12, peso: 900, fam: FD, color: "#2a3440" });
      g.fillStyle = "#c9d0d6"; rectR(g, x + 62, y + 150, 6, 30, 3); g.fill();
    }
    // banco de madera
    g.fillStyle = "#2a1a10"; g.fillRect(40, 484, 8, 40); g.fillRect(640, 484, 8, 40);
    const gb = g.createLinearGradient(0, 470, 0, 490);
    gb.addColorStop(0, "#b07a42"); gb.addColorStop(1, "#6a4420");
    g.fillStyle = gb; rectR(g, 10, 470, 670, 18, 4); g.fill();
    // suelo
    const gs = g.createLinearGradient(0, 520, 0, H + 60);
    gs.addColorStop(0, "#4a515a"); gs.addColorStop(1, "#22262b");
    g.fillStyle = gs; g.fillRect(-60, 520, W + 120, H + 60 - 520);
    g.fillStyle = "#f2c21b"; g.fillRect(-60, 528, W + 120, 6);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(-60, 520, W + 120, 4);
    // tablero con ganchos (a la derecha) y casco amarillo colgado
    g.fillStyle = "#6a4a2a"; rectR(g, 820, 180, 180, 20, 3); g.fill();
    for (const x of [GANCHO[0], 850]) { g.fillStyle = "#c9d0d6"; g.beginPath(); g.arc(x, 196, 4, 0, 6.283); g.fill(); g.fillRect(x - 2, 196, 4, 16); }
    g.save(); g.translate(850, 236); g.rotate(-0.06); g.scale(0.62 * ESC, 0.62 * ESC); g.translate(-44, -18); cascoBombero(g, 88, "#f2c21b"); g.restore();
    // reloj de fichar
    const R = RELOJ;
    g.fillStyle = "rgba(0,0,0,.35)"; rectR(g, R.x0 + 6, R.y0 + 8, R.x1 - R.x0, R.y1 - R.y0, 10); g.fill();
    const gr = g.createLinearGradient(R.x0, 0, R.x1, 0);
    gr.addColorStop(0, "#c9bfa8"); gr.addColorStop(0.5, "#efe7d2"); gr.addColorStop(1, "#a89e88");
    g.fillStyle = gr; rectR(g, R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0, 10); g.fill();
    g.strokeStyle = "#5a5040"; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#3a3428"; rectR(g, RANURA[0] - 16, RANURA[1] - 3, 32, 7, 3); g.fill();
    g.fillStyle = "#0a120c"; rectR(g, R.x0 + 8, R.y0 + 18, R.x1 - R.x0 - 16, 36, 5); g.fill();
    txt(g, "FICHAR", (R.x0 + R.x1) / 2, R.y0 + 80, { tam: 20, peso: 900, fam: FD, color: "#9e1b14", esp: 3 });
    g.fillStyle = "#e3262f"; g.beginPath(); g.arc(R.x0 + 26, R.y1 - 22, 8, 0, 6.283); g.fill();
    g.fillStyle = "#2bff5b"; g.beginPath(); g.arc(R.x0 + 50, R.y1 - 22, 8, 0, 6.283); g.fill();
    g.fillStyle = "#5a5040"; rectR(g, R.x0 + 64, R.y1 - 30, 26, 16, 3); g.fill();
    CT.set("fondo", c);
    return c;
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(940, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe08a"); gr.addColorStop(1, "#ff9a1f");
    txt(g, "¡FIN DEL TURNO!", 476, 148, { tam: 128, peso: 900, fam: FD, color: "#2a0a00", esp: 4, max: 880 });
    txt(g, "¡FIN DEL TURNO!", 470, 142, { tam: 128, peso: 900, fam: FD, color: gr, borde: "#2a0a00", bordeAncho: 12, esp: 4, glow: "rgba(255,170,40,.8)", glowTam: 24, max: 880 });
    CT.set("tit", c);
    return c;
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // fluorescentes
    const n = this.apagado();
    for (let i = 0; i < 3; i++) {
      const x = 210 + i * 302, on = i >= n;
      const parp = t > T_LUZ[i] - 0.12 && t < T_LUZ[i] ? (Math.sin(t * 90) > 0 ? 1 : 0) : 1;
      g.fillStyle = "#2a3038"; rectR(g, x - 110, 14, 220, 16, 4); g.fill();
      g.fillStyle = on && parp ? "#f4fbff" : "#5a636c"; rectR(g, x - 100, 18, 200, 8, 4); g.fill();
      if (on && parp) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; g.drawImage(BLOB.blanco, x - 220, -40, 440, 140); g.restore(); }
    }
    // pantalla del reloj
    const R = RELOJ;
    let s = 56; for (const x of T_TIC) if (t > x) s++;
    const hora = t > T_RING ? "22:00:00" : "21:59:" + String(Math.min(59, s)).padStart(2, "0");
    const parpR = t > T_RING && t < T_RING + 0.8 && Math.sin(t * 40) < 0;
    txt(g, hora, (R.x0 + R.x1) / 2, R.y0 + 45, { tam: 24, max: R.x1 - R.x0 - 26, peso: 800, fam: FD, color: parpR ? "#0a120c" : "#2bff5b", glow: "rgba(43,255,91,.8)", glowTam: 8, esp: 1 });
    // tarjeta metida en la ranura
    if (t > T_CASCO + 0.05) {
      g.save(); g.translate(RANURA[0], RANURA[1]); g.scale(ESC, ESC); tarjeta(g, 0, -4, 0, 0.5); g.restore();
    }
    // casco colgado en el gancho (después del lanzamiento)
    if (t > T_LANZA) {
      const u = tramo(t, T_LANZA, T_CLONC);
      let cx, cy, rot;
      if (u < 1) {
        const p0 = this.cascoSuelta || [870, 250];
        cx = lerp(p0[0], GANCHO[0], u); cy = lerp(p0[1], GANCHO[1] + 22, u) - Math.sin(u * Math.PI) * 90; rot = 0.35 + u * 6.283;
      } else {
        const d = t - T_CLONC;
        cx = GANCHO[0]; cy = GANCHO[1] + 22; rot = 0.25 * Math.exp(-d * 2.5) * Math.sin(d * 11);
      }
      cascoEn(g, cx, cy, rot, 0.65 * ESC);
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // puntos que hacen falta para las partículas
    this.cabezaM = aPant(e.mM, [37, 40]);
    if (e.M._manoI) this.pLataM = aPant(e.mM, e.M._manoI);
    if (this.cascoMano) this.cascoSuelta = aPant(e.mM, this.cascoMano.c);
    // lata volando
    if (t > T_TIRA + 0.18 && t < T_COGE) {
      const u = tramo(t, T_TIRA + 0.18, T_COGE);
      const p0 = aPant(e.mG, [12, 20]), p1 = [658, 300];
      const x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u) - Math.sin(u * Math.PI) * 110;
      g.save(); g.translate(x, y); g.scale(ESC, ESC); refresco(g, 0, 0, u * 9, false); g.restore();
    }
    // movimiento del pelo al sacudirlo
    if (t > T_SACUDE && t < T_SACUDE1) {
      const c = this.cabezaM, k = Math.sin(tramo(t, T_SACUDE, T_SACUDE1) * Math.PI);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 4; g.lineCap = "round";
      for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(c[0], c[1] - 10, 70 + i * 16, sd > 0 ? -0.9 : Math.PI - 0.2, sd > 0 ? 0.2 : Math.PI + 0.9); g.stroke(); }
      g.restore();
    }
    // gotas de sudor
    g.fillStyle = "#9fe3ff";
    for (const d of this.gotas) { g.globalAlpha = Math.min(1, d.v * 3); g.beginPath(); g.ellipse(d.x, d.y, 3.2, 5, Math.atan2(d.vy, d.vx) + Math.PI / 2, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    T_TIC.forEach((x, i) => ono(i % 2 ? "TAC" : "TIC", 948, 410 - i * 6, x, 0.45, 30, "#fffdf5", "#1b1b1b", 0.1));
    if (t > 0.95 && t < 1.85) bocadillo(g, 250, 150, "¿YA?", 190, 228, tramo(t, 0.95, 1.1) * (1 - tramo(t, 1.7, 1.85)), 40);
    if (t > 1.55 && t < 2.3) bocadillo(g, 640, 160, "¡CASI!", 735, 250, tramo(t, 1.55, 1.7) * (1 - tramo(t, 2.15, 2.3)), 36);
    ono("¡RIIING!", 880, 300, T_RING, 0.85, 52, "#ffd34d", "#3a2400", -0.12);
    ono("¡CLAC!", 760, 250, T_RING + 0.05, 0.5, 40, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡CLONC!", 940, 300, T_CLONC, 0.55, 40, "#fffdf5", "#1b1b1b", -0.08);
    ono("¡FRU-FRU!", 900, 330, T_SACUDE + 0.05, 0.75, 44, "#2fe3e8", "#06303a", 0.08);
    ono("¡TOMA!", 330, 260, T_TIRA - 0.25, 0.6, 42, "#ffd34d", "#3a2400", -0.08);
    ono("¡PSST!", 640, 478, T_PSST, 0.55, 40, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡AAAH!", 640, 250, T_AAH, 0.9, 54, "#ffd34d", "#3a2400", 0.04);
    if (t > T_CHIN && t < T_CHIN + 0.55) {
      const k = tramo(t, T_CHIN, T_CHIN + 0.12);
      g.save(); g.translate(640, 290); g.rotate(-0.06); g.scale(eBack(k), eBack(k));
      txt(g, "¡CHIN!", 0, 0, { tam: 60, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 9, esp: 3, alfa: 1 - tramo(t, T_CHIN + 0.4, T_CHIN + 0.55) });
      g.restore();
    }
    // ¡FIN DEL TURNO!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6)) * (1 + 0.08 * Math.max(0, 1 - Math.abs(t - T_CHIN) * 5));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(470, 88); g.rotate(-0.04); g.scale(s * 0.86, s * 0.86);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // oscuridad: fundido de entrada, los fluorescentes que se apagan y el final
    const osc = Math.max(1 - a, Math.min(1, n * 0.3 + tramo(t, T_LUZ[2] + 0.1, DUR - 0.05)));
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00255", nombre: "Fin del turno", crear: () => new FinDelTurno() });
})();
