"use strict";
/*
 * 00098 · ¡VIERNES!
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un foco ilumina un calendario de taco y a él, que va arrastrando la semana: las hojas de lunes a jueves se arrancan
 * solas cada vez más rápido (dormido, cansado, bostezando…). Sale la hoja del VIERNES, dorada: se queda de piedra y
 * ¡VIERNES!: luces de discoteca, bola de espejos, confeti, y él bailando como un loco. Se apaga todo.
 */
(() => {
const X = 730, ESC = 1.55;
const CX = 340, CY = 334, PW = 250, PH = 262;   // calendario: centro y tamaño de la hoja
const DIAS = [["LUNES", 26], ["MARTES", 27], ["MIÉRCOLES", 28], ["JUEVES", 29], ["VIERNES", 30]];
const ARRANCA = [1.5, 2.2, 2.75, 3.2];          // cuándo sale volando cada hoja
const FIESTA = 3.85;
const textos = cacheTexto();

function hoja(i) {
  const k = "hoja" + i;
  if (textos.has(k)) return textos.get(k);
  const c = lienzoNuevo(PW + 20, PH + 20), g = c.getContext("2d"), vi = i === 4;
  g.translate(10, 10);
  g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 8; g.shadowOffsetY = 3;
  const pa = g.createLinearGradient(0, 0, 0, PH);
  if (vi) { pa.addColorStop(0, "#fff6c2"); pa.addColorStop(1, "#ffcf3a"); } else { pa.addColorStop(0, "#ffffff"); pa.addColorStop(1, "#ece8df"); }
  g.fillStyle = pa; g.fillRect(0, 0, PW, PH);
  g.shadowColor = "transparent";
  g.fillStyle = vi ? "#e3262f" : "#c81e2a"; g.fillRect(0, 0, PW, 44);
  txt(g, "OCTUBRE", PW / 2, 32, { tam: 26, peso: 800, fam: FT, color: "#fff", esp: 6 });
  txt(g, String(DIAS[i][1]), PW / 2, 186, { tam: 150, peso: 900, fam: FD, color: vi ? "#c81e2a" : "#1c1c1f" });
  txt(g, DIAS[i][0], PW / 2, 236, { tam: 40, peso: 900, fam: FD, color: vi ? "#c81e2a" : "#55555c", esp: 4, max: PW - 30 });
  // agujeritos del taco
  g.fillStyle = "rgba(0,0,0,.25)";
  for (let x = 14; x < PW; x += 18) { g.beginPath(); g.arc(x, 50, 2, 0, 6.283); g.fill(); }
  textos.set(k, c);
  return c;
}

class EscenaViernes extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(460);
    this.p.suelo = () => PIES + 6;
    for (let i = 0; i < 5; i++) hoja(i);
    this.grito();
  }
  dia(t) { let d = 0; for (const a of ARRANCA) if (t >= a) d++; return d; }
  luz(t) {
    const on = t < 0.75 ? [0, 1, 0, 0, 1, 0.35, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    return on * (1 - tramo(t, 8.7, 9.4));
  }
  estado() {
    const t = this.t, d = this.dia(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, dx = 0, y = PIES;
    if (t < FIESTA) {
      // la semana pesa
      const caras = ["dormido", "borracho", "borracho", "sonrisa", "sorpresa"];
      pose.cara = caras[d];
      if (d === 0) { pose.rc = -0.18 + 0.03 * Math.sin(t * 2); sy = 0.97; manoD = [72, 162]; manoI = [7, 162]; }
      if (d === 1) { pose.rc = -0.1; sy = 0.975; }
      if (d === 2) { // bostezo
        const k = Math.sin(Math.PI * tramo(t, 2.25, 2.7));
        if (k > 0.2) pose.cara = "sorpresa";
        manoI = mezcla([9, 160], [30, 58], k); pose.brazoIDelante = k > 0.1;
      }
      if (d === 3) pose.rc = -0.12 * eInOut(tramo(t, 2.8, 3.0)); // empieza a mirar el calendario
      if (d === 4) {
        // doble mirada: calendario → cámara → calendario
        pose.rc = t < 3.42 ? -0.2 : t < 3.6 ? 0.05 : -0.15;
        sy = 1 + 0.04 * Math.sin(Math.PI * tramo(t, 3.42, 3.6));
        manoD = mezcla([70, 158], [88, 120], tramo(t, 3.5, 3.7)); manoI = mezcla([9, 160], [-10, 120], tramo(t, 3.5, 3.7));
      }
    } else {
      // ¡a bailar!
      const f = (t - FIESTA) * 2.3 * Math.PI, lado = Math.sin(f) > 0 ? 1 : -1, k = eOut(tramo(t, FIESTA, FIESTA + 0.2));
      const salto = t < FIESTA + 0.45 ? Math.sin(Math.PI * tramo(t, FIESTA, FIESTA + 0.45)) : 0;
      y = PIES - 70 * salto;
      if (t < FIESTA + 0.45) { manoD = mezcla([88, 120], [104, -8], k); manoI = mezcla([-10, 120], [-26, -8], k); pose.cara = "risa"; pose.piernaI = [-12 * salto, 0.1]; pose.piernaD = [-12 * salto, -0.1]; }
      else {
        const b = Math.abs(Math.sin(f));
        sy = 1 - 0.05 * b; dx = 10 * Math.sin(f);
        const arriba = [106, -6], abajo = [80, 150], arribaI = [-28, -6], abajoI = [-2, 150];
        const s = (Math.sin(f) + 1) / 2;
        manoD = mezcla(abajo, arriba, s); manoI = mezcla(arribaI, abajoI, s);
        pose.rc = 0.12 * Math.sin(f);
        pose.cara = Math.floor((t - FIESTA) * 2.3) % 3 === 2 ? "guino" : "risa";
        pose.piernaI = [-8 * Math.max(0, Math.sin(f)), 0.06 * lado]; pose.piernaD = [-8 * Math.max(0, -Math.sin(f)), 0.06 * lado];
      }
      if (t > 8.5) { const kk = eInOut(tramo(t, 8.5, 8.9)); manoD = mezcla(manoD, [104, -8], kk); manoI = mezcla(manoI, [-26, -8], kk); pose.cara = "risa"; }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(X + dx, y, ESC, 0, sx, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    ARRANCA.forEach((a, i) => this.una("arranca" + i, t > a, () => temblar(3 + i, 0.12)));
    this.una("viernes", t > ARRANCA[3], () => { p.nueva(P.DESTELLO, CX, CY, 0, 0, 0.5, 380); for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(150, 380); p.nueva(P.CHISPA, CX, CY, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); } });
    this.una("fiesta", t > FIESTA, () => {
      temblar(28, 0.7);
      p.nueva(P.DESTELLO, W / 2, 110, 0, 0, 0.5, 700);
      for (let i = 0; i < 200; i++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(20, 140), azar(6, 8), azar(8, 15), (Math.random() * 5) | 0);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(250, 700); p.nueva(P.CHISPA, W / 2, 120, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(8, 14)); }
    });
    if (t > FIESTA + 0.4 && t < 8.4 && Math.random() < 30 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 110), 6, azar(8, 14), (Math.random() * 5) | 0);
    p.alfa = 1 - tramo(t, 8.9, 9.4);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(t), d = this.dia(t);
    fondo(g, "#000");
    const kF = tramo(t, FIESTA, FIESTA + 0.15) * (1 - tramo(t, 8.6, 9.3));
    // focos: uno sobre el calendario y otro sobre él
    foco(g, CX, CX, PIES, 200, luz * (1 - 0.4 * kF));
    foco(g, X, X, PIES, 150, luz * (1 - 0.4 * kF));
    // luces de discoteca
    if (kF > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      const cols = ["255,61,132", "47,227,232", "43,255,91", "255,211,77", "160,90,255"];
      for (let i = 0; i < 5; i++) {
        const a = Math.sin(t * (1.3 + i * 0.27) + i * 1.7) * 0.75, x0 = 120 + i * 196, L = 760;
        g.globalAlpha = 0.22 * kF;
        g.fillStyle = `rgb(${cols[i]})`;
        g.beginPath(); g.moveTo(x0, -10); g.lineTo(x0 + Math.sin(a - 0.13) * L, Math.cos(a - 0.13) * L); g.lineTo(x0 + Math.sin(a + 0.13) * L, Math.cos(a + 0.13) * L); g.closePath(); g.fill();
        g.globalAlpha = 0.5 * kF;
        g.drawImage(BLOB.blanco, x0 + Math.sin(a) * 600 - 60, Math.min(PIES - 20, Math.cos(a) * 600) - 20, 120, 40);
      }
      g.restore();
      // bola de espejos
      const by = lerp(-90, 70, eOut(tramo(t, FIESTA, FIESTA + 0.5)));
      g.strokeStyle = "#555"; g.lineWidth = 2; g.beginPath(); g.moveTo(880, -10); g.lineTo(880, by - 44); g.stroke();
      g.save(); g.translate(880, by);
      const bg = g.createRadialGradient(-14, -14, 4, 0, 0, 44);
      bg.addColorStop(0, "#ffffff"); bg.addColorStop(0.5, "#b9c2cc"); bg.addColorStop(1, "#4b525c");
      g.fillStyle = bg; g.beginPath(); g.arc(0, 0, 44, 0, 6.283); g.fill();
      g.save(); g.beginPath(); g.arc(0, 0, 44, 0, 6.283); g.clip();
      g.strokeStyle = "rgba(40,44,52,.55)"; g.lineWidth = 1.2;
      for (let yy = -44; yy < 44; yy += 9) { g.beginPath(); g.moveTo(-44, yy); g.lineTo(44, yy); g.stroke(); }
      const off = (t * 30) % 9;
      for (let xx = -44 - 9 + off; xx < 44; xx += 9) { g.beginPath(); g.moveTo(xx, -44); g.lineTo(xx, 44); g.stroke(); }
      g.restore();
      for (let i = 0; i < 3; i++) brillo(g, Math.cos(t * 3 + i * 2) * 26, Math.sin(t * 2.3 + i * 2) * 26, 14 + 6 * Math.sin(t * 9 + i), 0.9);
      g.restore();
    }
    // calendario: tablero, taco y la hoja que toca
    g.save(); g.translate(CX, CY); g.rotate(kF > 0 ? 0.04 * Math.sin(t * 2.3 * Math.PI) : 0);
    g.strokeStyle = "#8a7a60"; g.lineWidth = 2; g.beginPath(); g.moveTo(-50, -PH / 2 - 22); g.lineTo(0, -PH / 2 - 60); g.lineTo(50, -PH / 2 - 22); g.stroke();
    g.fillStyle = "#c9a227"; g.beginPath(); g.arc(0, -PH / 2 - 60, 5, 0, 6.283); g.fill();
    g.fillStyle = "#3b2a1c"; rectR(g, -PW / 2 - 16, -PH / 2 - 26, PW + 32, PH + 44, 8); g.fill();
    g.fillStyle = "#e9e4d8"; g.fillRect(-PW / 2 + 3, -PH / 2 + 6, PW, PH); // el resto del taco
    const h = hoja(Math.min(4, d));
    if (h) g.drawImage(h, -PW / 2 - 10, -PH / 2 - 10);
    if (d === 4 && t < FIESTA + 1) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * (0.6 + 0.4 * Math.sin(t * 12)); g.drawImage(BLOB2.oro, -PW, -PH, PW * 2, PH * 2); g.restore(); }
    g.fillStyle = "#c81e2a"; g.fillRect(-PW / 2 - 6, -PH / 2 - 18, PW + 12, 20);
    g.fillStyle = "#d9dde2"; for (const rx of [-60, 60]) { g.beginPath(); g.arc(rx, -PH / 2 - 8, 6, 0, 6.283); g.fill(); }
    g.restore();
    // hojas arrancadas volando
    ARRANCA.forEach((a, i) => {
      const s = t - a; if (s < 0 || s > 0.9) return;
      const hh = hoja(i); if (!hh) return;
      g.save(); g.translate(CX - PW / 2 + (-180 * s), CY - PH / 2 + 30 + 260 * s * s - 60 * s); g.rotate(-1.4 * s - 0.2 * Math.sin(s * 12)); g.globalAlpha = 1 - tramo(s, 0.6, 0.9);
      g.drawImage(hh, -10, -10);
      g.restore();
    });
    pintarAvatar(g, e.m, e.pose, t);
    // zetas del lunes
    if (d === 0 && t > 0.6) {
      for (let i = 0; i < 2; i++) {
        const u = ((t - 0.6) / 0.9 + i * 0.5) % 1, q = aPant(e.m, [20, 0]);
        txt(g, "Z", q[0] - 20 * u, q[1] - 90 * u, { tam: 30 + 20 * u, peso: 400, fam: FC, color: "#f1e9ff", borde: "#3d2385", bordeAncho: 5, alfa: Math.min(1, u * 4) * (1 - u) });
      }
    }
    this.p.dibujar(g);
    // ¿¡…!? al ver el viernes
    if (t > 3.4 && t < FIESTA) {
      const q = aPant(e.m, [39, -10]), k = eBack(tramo(t, 3.4, 3.52));
      g.save(); g.translate(q[0] + 40, q[1] - 20); g.scale(k, k);
      txt(g, "!!", 0, 0, { tam: 80, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2200", bordeAncho: 8 });
      g.restore();
    }
    // ¡VIERNES!
    if (t > FIESTA) {
      const sp = this.grito(), k = tramo(t, FIESTA, FIESTA + 0.16), s = lerp(3, 1, eIn(k)) * (1 + 0.05 * Math.abs(Math.sin((t - FIESTA) * 2.3 * Math.PI)));
      const a = Math.min(1, k * 4) * (1 - tramo(t, 8.7, 9.3));
      if (sp && a > 0) { g.save(); g.globalAlpha = a; g.translate(W / 2 - 40, 112); g.rotate(-0.05 + 0.03 * Math.sin(t * 4)); g.scale(s, s); g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore(); }
    }
    // empieza a oscuras (los focos se encienden) y acaba a oscuras
    const osc = Math.max(t < 0.75 ? 0.97 * (1 - luz) : 0, tramo(t, 9.0, 9.55));
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  grito() {
    if (textos.has("grito")) return textos.get("grito");
    const c = sprite3D("¡VIERNES!", 150, { cara: "#ffd34d", lado: "#a35a00", borde: "#2a1400" });
    textos.set("grito", c);
    return c;
  }
}

registrar({ id: "00098", nombre: "¡Viernes!", crear: () => new EscenaViernes() });
})();
