"use strict";
/*
 * 00114 · CONCURSO DE MUECAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Cara a cara bajo un marcador GUILLERMO / RODRIGO, se turnan para poner caras cada vez más raras (cabeza ladeada,
 * aplastados, estirados, haciendo orejas…) y cada mueca suma puntos. Se aceleran hasta cambiar de cara a toda
 * velocidad, se paran… y Rodrigo saca su cara de borracho definitiva: el marcador revienta a 999, confeti y
 * ¡QUÉ CARETO! Guillermo se parte de risa.
 */
(() => {
const ESC = 2.0, YO = 292, XG = 332, XR = 692, DUR = 10.5, T_GANA = 6.95;
// muecas: cara, giro de cabeza, ancho, alto, pelo de punta, manos
const MUECAS = [
  { cara: "sorpresa", rc: 0.3, sx: 1.12, sy: 0.9, manos: "orejas" },
  { cara: "guino", rc: -0.34, sx: 0.9, sy: 1.1, manos: "barbilla" },
  { cara: "dormido", rc: 0.16, sx: 1, sy: 1.04, puntas: 1, manos: "arriba" },
  { cara: "risa", rc: -0.26, sx: 1.1, sy: 0.92, manos: "mofletes" },
  { cara: "sorpresa", rc: -0.3, sx: 0.88, sy: 1.12, manos: "orejas" },
  { cara: "guino", rc: 0.34, sx: 1.08, sy: 0.93, manos: "mofletes", puntas: 0.6 },
];
// turnos: [tiempo, quién (0 G, 1 R, 2 los dos), mueca, puntos]
const TURNOS = [[1.35, 0, 0, 10], [2.0, 1, 1, 10], [2.6, 0, 2, 20], [3.15, 1, 3, 20], [3.62, 0, 4, 30], [4.05, 1, 5, 30]];
{
  let t = 4.42, k = 0;
  while (t < 6.3) { TURNOS.push([t, k % 2, (k * 5 + 2) % 6, 10 + (k % 3) * 10]); t += Math.max(0.15, 0.3 - k * 0.018); k++; }
}

class ConcursoMuecas extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(380);
    this.cache = cacheTexto();
    this.puntos = [0, 0]; this.mostrado = [0, 0];
    this.pops = []; this.sumas = [];
  }
  /** la última mueca de i antes de t (o null) */
  mueca(i, t) {
    let r = null;
    for (const T of TURNOS) if (T[0] <= t && T[1] === i) r = T;
    return r;
  }
  estado() {
    const t = this.t, res = [];
    const kZ = eInOut(tramo(t, T_GANA, T_GANA + 0.45));
    for (let i = 0; i < 2; i++) {
      const q = i ? "rodrigo" : undefined, s = i ? -1 : 1, dyR = i ? 7 : 0;
      const pose = { quien: q, cara: "sonrisa", rc: s * 0.1 };
      let sx = 1, sy = 1, manos = null, dx = 0;
      const ent = eOut(tramo(t, 0.1, 0.8));
      dx = -s * 260 * (1 - ent);
      if (t > 0.8 && t < 1.3) { pose.cara = "guino"; pose.rc = s * 0.16; }
      const T = t < T_GANA - 0.45 ? this.mueca(i, t) : null;
      if (T) {
        const M = MUECAS[T[2]], d = t - T[0], k = eBack(tramo(d, 0, 0.1));
        const sig = TURNOS.find((x) => x[1] === i && x[0] > T[0]);
        const vuelve = sig || t > 6.3 ? 0 : eInOut(tramo(d, 0.42, 0.6)); // en los turnos lentos vuelve a su cara
        const kk = k * (1 - vuelve);
        pose.cara = vuelve > 0.5 ? "sonrisa" : M.cara;
        pose.rc = lerp(s * 0.1, M.rc, kk) + 0.04 * Math.sin(t * 30) * kk * (d < 0.3 ? 1 : 0);
        sx = lerp(1, M.sx, kk); sy = lerp(1, M.sy, kk);
        pose.puntas = (M.puntas || 0) * kk;
        if (vuelve < 0.5) manos = M.manos;
      } else if (t > 1.3 && t < T_GANA - 0.45) {
        // le toca al otro: mira y se ríe o se asombra
        pose.cara = this.mueca(1 - i, t) ? ((Math.floor(t * 3) + i) % 3 ? "risa" : "sorpresa") : "sonrisa";
        pose.rc = s * 0.12;
      }
      // pausa antes del remate: se quedan quietos mirándose
      if (t >= T_GANA - 0.45 && t < T_GANA) { pose.cara = i ? "guino" : "sorpresa"; pose.rc = s * 0.14; }
      if (t >= T_GANA) {
        const d = t - T_GANA;
        if (i === 1) { // ¡la cara de borracho!
          const k = eBack(tramo(d, 0, 0.12));
          pose.cara = "borracho"; pose.rc = lerp(-0.1, -0.42, k) + 0.05 * Math.sin(d * 9);
          sx = lerp(1, 1.14, k); sy = lerp(1, 0.86, k); pose.puntas = 0.7 * k; manos = "orejas";
        } else {
          pose.cara = d < 0.55 ? "sorpresa" : "risa"; pose.rc = d < 0.55 ? 0.2 : 0.12 + 0.07 * Math.sin(d * 13);
          sy = d > 0.55 ? 1 - 0.035 * Math.abs(Math.sin(d * 13)) : 1;
          if (d > 0.55) manos = "senala";
        }
      }
      // manos
      const reposo = i ? { manoD: [69, 157], manoI: [9, 157] } : { manoD: [70, 158], manoI: [9, 160] };
      let mD = reposo.manoD, mI = reposo.manoI, delante = false;
      const meneo = Math.sin(t * 40) * 2;
      if (manos === "orejas") { mD = [84 + meneo, 34 + dyR]; mI = [-6 - meneo, 34 + dyR]; }
      else if (manos === "barbilla") { mD = i ? [44, 86] : [46, 78]; }
      else if (manos === "arriba") { mD = [94, 6 + meneo]; mI = [-16, 6 - meneo]; }
      else if (manos === "mofletes") { mD = [60, 56 + dyR]; mI = [17, 56 + dyR]; delante = true; }
      else if (manos === "senala") { mD = [124, 92 + meneo]; }
      pose.manoD = mD; pose.manoI = mI; pose.brazoIDelante = delante;
      // zum hacia Rodrigo en el remate
      const z = 1 + 0.22 * kZ, cx = XR, cy = YO;
      const x0 = (i ? XR : XG) + dx, X = cx + (x0 - cx) * z, Y = cy + (YO - cy) * z;
      const m = matAv(X, Y, ESC * z, 0, sx, sy, i ? [38, 47] : [39, 40]);
      res.push({ pose, m });
    }
    return res;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    TURNOS.forEach((T, n) => this.una("m" + n, t >= T[0], () => {
      const e = this.estado(), i = T[1], q = aPant(e[i].m, [39, 40]);
      this.puntos[i] += T[3];
      this.pops.push({ x: q[0], y: q[1], t0: t, i });
      this.sumas.push({ s: "+" + T[3], x: q[0] + (i ? 40 : -40), y: q[1] - 150, t0: t, i });
      if (n < 6) temblar(5, 0.12); else temblar(2.5, 0.08);
      for (let k = 0; k < 6; k++) p.nueva(P.PURPURINA, q[0] + azar(-90, 90), q[1] + azar(-110, 40), azar(-40, 40), azar(-60, 0), azar(0.5, 0.9), azar(8, 13));
    }));
    this.una("gana", t > T_GANA, () => {
      this.puntos[1] = 999;
      temblar(30, 0.7);
      p.nueva(P.DESTELLO, 692, 292, 0, 0, 0.5, 420);
      for (let k = 0; k < 160; k++) p.nueva(P.CONFETI, azar(400, 1000), azar(-60, 40), azar(-200, 200), azar(0, 200), azar(2.5, 3.6), azar(9, 15), k % 5);
      for (let k = 0; k < 40; k++) { const a = azar(0, 6.283), v = azar(250, 700); p.nueva(P.CHISPA, 692, 60, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(8, 14)); }
    });
    // los números del marcador corren hasta los puntos
    for (let i = 0; i < 2; i++) {
      const obj = this.puntos[i];
      if (this.mostrado[i] < obj) this.mostrado[i] = Math.min(obj, this.mostrado[i] + Math.max(60, (obj - this.mostrado[i]) * (i && t > T_GANA ? 4 : 8)) * dt);
    }
    p.actualizar(dt);
  }
  marcador(g, t) {
    const a = tramo(t, 0.4, 0.8);
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    rectR(g, 196, 12, 632, 94, 18); g.fillStyle = "rgba(8,9,12,.92)"; g.fill();
    g.strokeStyle = "#596069"; g.lineWidth = 3; g.stroke();
    const gana = t > T_GANA, parpa = gana && Math.sin(t * 22) > 0;
    for (let i = 0; i < 2; i++) {
      const cx = i ? 666 : 358, col = i ? "#2fe3e8" : "#2bff5b";
      const ult = TURNOS.filter((T) => T[1] === i && T[0] <= t).pop();
      const flash = ult ? 1 - tramo(t, ult[0], ult[0] + 0.25) : 0;
      if (flash > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * flash; g.drawImage(i ? BLOB2.cian : BLOB.verde, cx - 140, 0, 280, 120); g.restore(); }
      txt(g, i ? "RODRIGO" : "GUILLERMO", cx, 42, { tam: 26, peso: 900, fam: FD, color: "#fffdf5", esp: 2 });
      const n = Math.floor(this.mostrado[i]);
      const c = i && gana ? (parpa ? "#ffd34d" : "#ff3d84") : col;
      txt(g, String(n).padStart(3, "0"), cx, 96, { tam: 56, peso: 900, fam: FD, color: c, glow: c, glowTam: 12, esp: 4 });
    }
    txt(g, "VS", 512, 76, { tam: 34, peso: 400, fam: FC, color: "#ffd34d", esp: 2 });
    g.restore();
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(1000, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 150);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡QUÉ CARETO!", 500, 148, { tam: 136, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,170,30,.85)", glowTam: 24, max: 960 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // fondo: rayos de concurso que giran
    g.save(); g.translate(512, 330); g.rotate(t * 0.25);
    for (let k = 0; k < 16; k++) {
      g.fillStyle = k % 2 ? "rgba(255,61,132,.10)" : "rgba(255,211,77,.07)";
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 900, (k / 16) * 6.283, ((k + 1) / 16) * 6.283); g.closePath(); g.fill();
    }
    g.restore();
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; g.drawImage(BLOB2.oroClaro, 60, 60, 904, 600); g.restore();
    // aros de cada mueca
    for (const o of this.pops) {
      const d = t - o.t0; if (d > 0.4) continue;
      const k = d / 0.4;
      g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; g.lineWidth = 6 * (1 - k) + 1;
      g.beginPath(); g.arc(o.x, o.y, 80 + 120 * k, 0, 6.283); g.stroke();
    }
    if (t > T_GANA) {
      const d = t - T_GANA;
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * Math.exp(-d * 1.5) + 0.15; g.drawImage(BLOB2.oro, 692 - 300, 292 - 300, 600, 600); g.restore();
    }
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.p.dibujar(g);
    // +puntos
    for (const o of this.sumas) {
      const d = t - o.t0; if (d > 0.7) continue;
      txt(g, o.s, o.x, o.y - 40 * d, { tam: 40, peso: 400, fam: FC, color: o.i ? "#c8fbff" : "#d9ffe2", borde: "#111", bordeAncho: 6, alfa: 1 - tramo(d, 0.45, 0.7), esp: 1 });
    }
    this.marcador(g, t);
    if (t > T_GANA && t < T_GANA + 0.9) {
      const k = eBack(tramo(t, T_GANA, T_GANA + 0.12));
      g.save(); g.translate(880, 210); g.rotate(0.12); g.scale(k, k);
      txt(g, "¡999!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a1d00", bordeAncho: 9, alfa: 1 - tramo(t, T_GANA + 0.65, T_GANA + 0.9), esp: 3 });
      g.restore();
    }
    // ¡QUÉ CARETO!
    if (t > T_GANA + 0.3) {
      const d = t - T_GANA - 0.3, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 520); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, DUR - 0.55, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00114", nombre: "Concurso de muecas", crear: () => new ConcursoMuecas() });
})();
