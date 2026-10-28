"use strict";
/*
 * 00019 · BEATBOX
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la luz del bar. Con la mano en la boca hace beatbox: cada PUM suelta una onda gorda naranja y cada TSS
 * una fina azul. Las ondas hacen vibrar las letras de PUM-TSS-PUM-TSS y las jarras de la estantería saltan al ritmo,
 * cada vez más rápido. Coge aire, suelta el PUM más gordo: todo salta, una jarra sale volando de la estantería y la
 * atrapa al vuelo. Brinda, guiña el ojo y se apaga la luz.
 */
(() => {
const X = 300, ESC = 1.5;
const T = 0.56, B0 = 1.25;              // pulso y primer golpe
const GORDO = 7.95, ATRAPA = 8.5, OFF = 9.35;
const TEXTO = "PUM-TSS-PUM-TSS";
const SILABAS = [[0, 3], [3, 7], [7, 11], [11, 15]];
const BALDAS = [268, 404];
const JARRAS = [[606, 0], [688, 0], [770, 0], [852, 0], [622, 1], [704, 1], [786, 1], [868, 1]];
const cache = cacheTexto();
let SPR19 = null;

/** Golpes: [instante, tipo] (0 = PUM, 1 = TSS). */
function golpes() {
  const L = [];
  for (let i = 0; i < 4; i++) L.push([B0 + i * T, i % 2]);                                   // compás 1
  for (let i = 0; i < 8; i++) L.push([B0 + 4 * T + i * T / 2, i % 4 === 0 || i % 4 === 2 ? (i % 4 === 0 ? 0 : 1) : 1]); // compás 2
  for (let i = 0; i < 12; i++) L.push([B0 + 8 * T + i * T / 3, i % 3 === 0 ? 0 : 1]);         // compás 3, a tope
  L.push([GORDO, 2]);
  return L.filter((g) => g[0] < GORDO - 0.25 || g[1] === 2);
}
const GOLPES = golpes();

function pared() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, 0, 0, PIES);
  gr.addColorStop(0, "#1a110b"); gr.addColorStop(1, "#2c1c10");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, PIES + 60);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let x = -40; x < W + 60; x += 64) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x, PIES); g.stroke(); }
  // suelo
  const gs = g.createLinearGradient(0, PIES, 0, H);
  gs.addColorStop(0, "#3a2414"); gs.addColorStop(1, "#140b05");
  g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H);
  g.fillStyle = "rgba(255,200,120,.2)"; g.fillRect(-60, PIES - 4, W + 120, 2);
  // baldas
  for (const y of BALDAS) {
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(560, y + 14, 360, 10);
    const gb = g.createLinearGradient(0, y, 0, y + 14);
    gb.addColorStop(0, "#b98a52"); gb.addColorStop(1, "#5a3a1c");
    g.fillStyle = gb; rectR(g, 556, y, 368, 14, 3); g.fill();
    g.fillStyle = "#2a1a0c";
    for (const x of [590, 890]) { g.beginPath(); g.moveTo(x, y + 14); g.lineTo(x + 8, y + 14); g.lineTo(x + 8, y + 44); g.closePath(); g.fill(); }
  }
  return c;
}
function letras() {
  if (cache.has("letras")) return cache.get("letras");
  const tam = 94, med = lienzoNuevo(1, 1).getContext("2d");
  med.font = `400 ${tam}px ${FC}`;
  const spr = {}, pos = [];
  for (const ch of new Set(TEXTO)) {
    for (const tipo of [0, 1]) {
      const col = ch === "-" ? "#ffffff" : tipo === 0 ? "#ff8a1f" : "#2fe3e8", borde = tipo === 0 ? "#4a1a00" : "#00384a";
      const c = lienzoNuevo(110, 140), g = c.getContext("2d");
      txt(g, ch, 55, 104, { tam, peso: 400, fam: FC, color: "#fffdf5", borde: col, bordeAncho: 14 });
      txt(g, ch, 55, 104, { tam, peso: 400, fam: FC, color: "#fffdf5", borde, bordeAncho: 3 });
      spr[ch + tipo] = c;
    }
  }
  let x = 0;
  for (const ch of TEXTO) { const w = med.measureText(ch).width + 6; pos.push(x + w / 2); x += w; }
  const r = { spr, pos: pos.map((p) => p - x / 2 + W / 2), ancho: x };
  cache.set("letras", r);
  return r;
}
function sprites() { if (!SPR19) SPR19 = { pared: pared() }; return SPR19; }

class EscenaBeatbox extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(320);
    this.ondas = []; this.hechos = 0;
    this.jarras = JARRAS.map(([x, b]) => ({ x, b, y: 0, vy: 0, r: 0, vr: 0, vuela: false }));
    this.temblorL = new Float32Array(TEXTO.length);
    this.atrapada = false; this.respira = 0;
  }
  ultimoGolpe(t) { let u = null; for (const g of GOLPES) if (g[0] <= t) u = g; return u; }
  estado() {
    const t = this.t, u = this.ultimoGolpe(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const golpe = u ? Math.exp(-(t - u[0]) * (u[1] === 0 ? 9 : 14)) * (u[1] === 1 ? 0.4 : 1) : 0;
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, y = PIES;
    // mano a la boca
    const kB = eInOut(tramo(t, 0.55, 0.95)) * (1 - eInOut(tramo(t, ATRAPA - 0.3, ATRAPA - 0.08)));
    const b = boca(0);
    manoD = mezcla(manoD, [b[0] + 1, b[1] + 8], kB);
    // la otra mano marca el ritmo
    if (t > B0 - 0.3 && t < GORDO + 0.2) manoI = [-12 + 4 * golpe, 112 + 16 * golpe];
    // cabeza y cuerpo con cada golpe
    pose.rc = (t > B0 ? 0.06 * Math.sin((t - B0) / T * Math.PI) : 0) - 0.05 * golpe;
    sy = 1 - 0.025 * golpe; y += 4 * golpe;
    pose.cara = t < 0.95 ? "sonrisa" : t < B0 + 8 * T ? "dormido" : t < GORDO - 0.35 ? (Math.floor(t * 6) % 2 ? "dormido" : "guino") : "sorpresa";
    if (t > B0 + 8 * T && t < GORDO - 0.35) pose.rc += 0.12 * Math.sin(t * 17);
    // coge aire
    const kAire = tramo(t, GORDO - 0.35, GORDO) * (1 - tramo(t, GORDO, GORDO + 0.1));
    sx *= 1 + 0.05 * kAire; sy *= 1 + 0.02 * kAire;
    if (t >= GORDO && t < ATRAPA - 0.3) { pose.cara = "sorpresa"; sx *= 1 - 0.03 * Math.exp(-(t - GORDO) * 8); }
    // atrapa la jarra al vuelo y brinda
    if (t >= ATRAPA - 0.3) {
      const kC = eInOut(tramo(t, ATRAPA - 0.3, ATRAPA - 0.05));
      manoD = mezcla(manoD, [112, 112], kC);
      if (t > ATRAPA) manoD = mezcla([112, 112], [92, 36], eBack(tramo(t, ATRAPA + 0.2, ATRAPA + 0.55)));
      manoI = mezcla(manoI, [9, 160], eInOut(tramo(t, ATRAPA - 0.3, ATRAPA)));
      pose.cara = t < ATRAPA + 0.25 ? "sorpresa" : t < ATRAPA + 1.0 ? "risa" : "guino";
      pose.rc = t > ATRAPA + 0.25 ? 0.08 * Math.sin(t * 5) : 0;
      if (this.atrapada) pose.jarra = { inc: 0.1 * Math.sin(t * 4), nivel: 0.95 };
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(X, y, ESC, 0, sx, sy);
    return { pose, m, golpe };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado(), L = letras();
    // nuevos golpes: ondas desde la boca
    while (this.hechos < GOLPES.length && t >= GOLPES[this.hechos][0]) {
      const [t0, tipo] = GOLPES[this.hechos++], q = aPant(e.m, [boca(0)[0] + 16, boca(0)[1] + 4]);
      this.ondas.push({ x: q[0], y: q[1], t0, tipo, r: 0, rAnt: 0 });
      if (tipo === 0) temblar(4, 0.1);
      if (tipo === 2) {
        temblar(24, 0.6);
        for (let i = 0; i < 30; i++) { const a = azar(-1.4, 1.0), v = azar(250, 600); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 13)); }
        this.ondas.push({ x: q[0], y: q[1], t0: t0 + 0.08, tipo: 2, r: 0, rAnt: 0 }, { x: q[0], y: q[1], t0: t0 + 0.16, tipo: 2, r: 0, rAnt: 0 });
      }
    }
    // las ondas avanzan; al pasar, mueven letras y jarras
    for (const o of this.ondas) {
      o.rAnt = o.r; o.r = (t - o.t0) * (o.tipo === 1 ? 820 : 600);
      if (o.r <= 0) continue;
      L.pos.forEach((lx, i) => {
        const d = Math.hypot(lx - o.x, 110 - o.y);
        if (o.rAnt < d && o.r >= d) this.temblorL[i] = Math.max(this.temblorL[i], o.tipo === 2 ? 26 : o.tipo === 0 ? 12 : 6);
      });
      for (const j of this.jarras) {
        if (j.vuela) continue;
        const d = Math.hypot(j.x - o.x, BALDAS[j.b] - 30 - o.y);
        if (o.rAnt < d && o.r >= d) {
          if (o.tipo === 0) { j.vy = Math.min(j.vy, -azar(240, 320) * (t > B0 + 8 * T ? 1.25 : 1)); j.vr = azar(-3, 3); }
          else if (o.tipo === 1) { j.vr += azar(-2.5, 2.5); }
          else if (o.t0 === GORDO) {
            j.vy = -azar(520, 680); j.vr = azar(-6, 6);
            if (j === this.jarras[3]) {
              // esta sale volando hacia su mano
              j.vuela = true;
              const dest = aPant(this.estado().m, [112 + 17, 112 - 4]), x0 = j.x, y0 = BALDAS[j.b] - 27, tf = ATRAPA - t;
              j.fx = x0; j.fy = y0; j.fvx = (dest[0] - x0) / tf; j.fvy = (dest[1] - y0 - 0.5 * 1800 * tf * tf) / tf; j.r = 0; j.vr = 4 * Math.PI / tf;
            }
          }
        }
      }
    }
    this.ondas = this.ondas.filter((o) => o.r < 1300);
    for (let i = 0; i < this.temblorL.length; i++) this.temblorL[i] *= Math.exp(-dt * 7);
    // física de las jarras
    for (const j of this.jarras) {
      if (j.vuela) {
        if (this.atrapada) continue;
        j.fvy += 1800 * dt; j.fx += j.fvx * dt; j.fy += j.fvy * dt; j.r += j.vr * dt;
        continue;
      }
      j.vy += 1800 * dt; j.y += j.vy * dt; j.r += j.vr * dt; j.vr *= Math.exp(-dt * 4); j.r *= Math.exp(-dt * 6);
      if (j.y > 0) { j.y = 0; if (j.vy > 200) { j.vy *= -0.25; this.p.nueva(P.ESPUMA, j.x + azar(-8, 8), BALDAS[j.b] - 54, azar(-60, 60), azar(-120, -40), 0.4, azar(3, 6)); } else j.vy = 0; }
    }
    this.una("atrapa", t >= ATRAPA, () => {
      this.atrapada = true; temblar(8, 0.2);
      const q = aPant(this.estado().m, [112, 100]);
      for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, q[0] + 20, q[1] - 30, azar(-140, 140), azar(-260, -60), azar(0.4, 0.7), azar(4, 8));
    });
    p.alfa = 1 - tramo(t, OFF, OFF + 0.4);
    p.actualizar(dt);
  }
  dibujarJarra(g, x, y, r, t) {
    g.save(); g.translate(x, y); g.rotate(r); g.scale(1.55, 1.55);
    dibujarJarra(g, [-17, 0], 0, 0.92, "asa", t); dibujarJarra(g, [-17, 0], 0, 0.92, "cuerpo", t);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), S = sprites(), L = letras();
    fondo(g, "#000");
    const parp = t < 0.6 ? [0, 0, 1, 0.3, 0, 1, 0.6, 1][Math.min(7, Math.floor(t / 0.075))] : 1;
    const luz = parp * (1 - tramo(t, OFF, OFF + 0.5));
    if (luz <= 0) return;
    g.save(); g.globalAlpha = luz;
    g.drawImage(S.pared, -60, -60);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * luz; g.drawImage(BLOB.naranja, -60, 60, 1140, 620); g.restore();
    // jarras de la estantería
    for (const j of this.jarras) if (!j.vuela) this.dibujarJarra(g, j.x, BALDAS[j.b] - 27 + j.y, j.r, t);
    foco(g, X, X, PIES, 140, 0.6);
    pintarAvatar(g, e.m, e.pose, t);
    const jv = this.jarras[3];
    if (jv.vuela && !this.atrapada) this.dibujarJarra(g, jv.fx, jv.fy, jv.r, t);
    g.restore();
    // ondas de sonido
    g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    for (const o of this.ondas) {
      if (o.r <= 4) continue;
      const a = Math.max(0, 1 - o.r / (o.tipo === 2 ? 1250 : o.tipo === 0 ? 900 : 650)) * luz;
      if (a <= 0) continue;
      const a0 = -1.55, a1 = 1.0;
      if (o.tipo === 1) {
        g.strokeStyle = `rgba(47,227,232,${0.8 * a})`; g.lineWidth = 2;
        for (const dr of [0, -10]) { if (o.r + dr <= 0) continue; g.setLineDash([10, 9]); g.beginPath(); g.arc(o.x, o.y, o.r + dr, a0, a1); g.stroke(); }
        g.setLineDash([]);
      } else {
        const col = o.tipo === 2 ? "255,236,140" : "255,138,31", k = o.tipo === 2 ? 1.6 : 1;
        for (const [dr, lw, al] of [[0, 9 * k, 0.35], [-6, 4 * k, 0.9], [-24, 3 * k, 0.5], [-44, 2 * k, 0.3]]) {
          if (o.r + dr <= 0) continue;
          g.strokeStyle = `rgba(${col},${al * a})`; g.lineWidth = lw;
          g.beginPath(); g.arc(o.x, o.y, o.r + dr, a0, a1); g.stroke();
        }
      }
    }
    g.restore();
    this.p.dibujar(g);
    // PUM-TSS-PUM-TSS: aparece por sílabas y vibra con las ondas
    let tipoChar = 0;
    for (let s = 0; s < SILABAS.length; s++) {
      const tS = B0 + s * T;
      if (t < tS) break;
      const [c0, c1] = SILABAS[s], k = tramo(t, tS, tS + 0.12);
      tipoChar = s % 2;
      for (let i = c0; i < c1; i++) {
        const ch = TEXTO[i], spr = L.spr[ch + tipoChar], A = this.temblorL[i];
        const sc = eBack(k) * (1 + A * 0.012) * 0.9;
        g.save(); g.globalAlpha = luz; g.translate(L.pos[i] + azar(-1, 1) * A * 0.5, 112 + azar(-1, 1) * A * 0.4 - A * 0.9); g.rotate(azar(-1, 1) * A * 0.012); g.scale(sc, sc);
        g.drawImage(spr, -spr.width / 2, -spr.height * 0.62); g.restore();
      }
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00019", nombre: "Beatbox", crear: () => new EscenaBeatbox() });
})();
