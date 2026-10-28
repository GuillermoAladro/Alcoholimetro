"use strict";
/*
 * 00006 · HIPO PROPULSADO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco. Se acaba la lata de un trago y le entra hipo: cada ¡HIC! lo levanta un poco más del suelo
 * (y el ¡HIC! es cada vez más grande). Se tapa la boca, pero no sirve: el quinto lo lanza fuera de la pantalla por
 * arriba. Silencio… y cae la lata vacía, que rebota y rueda. Desde arriba, un «hic» pequeñito. Se apaga el foco.
 */
(() => {
const X = 512, ESC = 1.5;
const HICS = [[2.1, 30], [3.05, 72], [3.95, 140], [4.8, 235], [5.65, 0]]; // [instante, altura del salto]
const T_DESPEGA = 5.65, T_LATA = 6.95;

class EscenaHipo extends Escena {
  constructor() {
    super(9.5);
    this.p = new Parts(320);
    this.textos = []; this.lata = null; this.burbujas = [];
  }
  luz() { const t = this.t; return (t < 0.7 ? [0, 1, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.1))] : 1) * (1 - tramo(t, 8.7, 9.4)); }
  /** Altura sobre el suelo (px) y aplastamiento al caer. */
  salto(t) {
    if (t >= T_DESPEGA) { const s = t - T_DESPEGA; return { h: 1400 * s + 3000 * s * s, sy: 1.18 }; }
    for (const [t0, h] of HICS) {
      const d = 0.2 + Math.sqrt(h) * 0.034;
      if (t >= t0 && t < t0 + d) { const u = (t - t0) / d; return { h: h * 4 * u * (1 - u), sy: 1 + 0.08 * Math.sin(u * Math.PI) }; }
      if (t >= t0 + d && t < t0 + d + 0.14) return { h: 0, sy: 1 - 0.1 * Math.sin(((t - t0 - d) / 0.14) * Math.PI) * Math.min(1, h / 100 + 0.4) };
    }
    return { h: 0, sy: 1 };
  }
  numHic(t) { let n = 0; for (const [t0] of HICS) if (t >= t0) n++; return n; }
  estado() {
    const t = this.t, S = this.salto(t), n = this.numHic(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], lataAng = 0;
    // el último trago
    const kSube = eInOut(tramo(t, 0.55, 0.85));
    manoD = mezcla(manoD, [60, 118], kSube);
    const kBoca = eInOut(tramo(t, 0.85, 1.1)) * (1 - eInOut(tramo(t, 1.55, 1.8)));
    const kTrago = eInOut(tramo(t, 1.05, 1.5)) * (1 - eInOut(tramo(t, 1.55, 1.8)));
    pose.rc = -0.34 * kTrago;
    lataAng = -0.4 * kBoca - 1.5 * kTrago;
    if (kBoca > 0) { const b = boca(pose.rc), tope = rot2([1.5, -13], lataAng); manoD = mezcla(manoD, [b[0] - tope[0] + 2, b[1] - tope[1] + 1], kBoca); }
    if (t > 1.45 && t < 2.0) pose.cara = "dormido";
    if (t >= 1.8) manoD = mezcla([60, 118], [72, 150], eInOut(tramo(t, 1.8, 2.05)));
    // hipo
    const enHic = HICS.some(([t0]) => t >= t0 && t < t0 + 0.35);
    if (n >= 1) pose.cara = enHic ? "sorpresa" : n === 1 ? "risa" : n === 2 ? "guino" : "sorpresa";
    if (S.h > 4 || enHic) {
      const k = Math.min(1, S.h / 120);
      pose.piernaI = [-6 * k, 0.12 * k]; pose.piernaD = [-10 * k, -0.15 * k];
      manoD = mezcla(manoD, [96, 120], k); if (n < 3) manoI = mezcla(manoI, [-18, 122], k);
    }
    // se tapa la boca (no sirve de nada)
    const kTapa = eInOut(tramo(t, 4.4, 4.62));
    if (kTapa > 0 && t < T_DESPEGA + 0.05) { pose.brazoIDelante = true; manoI = mezcla([9, 160], [33, 64], kTapa); }
    if (t >= T_DESPEGA) { manoD = [92, 196]; manoI = [-14, 196]; pose.piernaI = [0, 0.03]; pose.piernaD = [0, -0.03]; pose.cara = "sorpresa"; }
    pose.manoD = manoD; pose.manoI = manoI;
    if (t < T_DESPEGA + 0.5) pose.objD = (g, m) => dibujarLata(g, m[0], m[1], lataAng, { abierta: true });
    const m = matAv(X, PIES - S.h, ESC, 0, 1 / Math.sqrt(S.sy), S.sy);
    return { pose, m, S };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    HICS.forEach(([t0, h], i) => this.una("hic" + i, t > t0, () => {
      const q = aPant(e.m, boca(0)), tam = [46, 64, 86, 112, 170][i];
      temblar([4, 7, 11, 16, 32][i], 0.25 + i * 0.08);
      for (let k = 0; k < 3; k++) this.burbujas.push({ x: q[0] + azar(-6, 6), y: q[1], vx: azar(-90, 90), vy: azar(-200, -70), r: azar(4, 8 + i * 2), vida: azar(0.7, 1.4), fase: azar(0, 6) });
      const lado = i % 2 ? -1 : 1;
      if (i < 4) this.textos.push({ t0, x: X + lado * (150 + i * 40), y: q[1] - 40 - i * 10, tam, rot: lado * 0.18 });
      else this.textos.push({ t0, x: W / 2, y: 190, tam, rot: -0.06, grande: true });
      if (h > 0) for (let k = 0; k < 8 + i * 4; k++) p.nueva(P.POLVO, X + azar(-40, 40), PIES - 4, azar(-300, 300), azar(-60, -10), azar(0.5, 0.9), azar(26, 46));
    }));
    // más burbujas mientras sube
    HICS.slice(0, 4).forEach(([t0], i) => {
      if (t > t0 && t < t0 + 0.32 && Math.random() < (12 + i * 8) * dt) {
        const q = aPant(e.m, boca(0));
        this.burbujas.push({ x: q[0] + azar(-6, 6), y: q[1], vx: azar(-110, 110), vy: azar(-160, -40), r: azar(4, 8 + i * 2), vida: azar(0.6, 1.2), fase: azar(0, 6) });
      }
    });
    // aterrizajes
    HICS.slice(0, 4).forEach(([t0, h], i) => this.una("cae" + i, t > t0 + 0.2 + Math.sqrt(h) * 0.034, () => {
      temblar(3 + i * 3, 0.2);
      for (let k = 0; k < 6 + i * 4; k++) p.nueva(P.POLVO, X + azar(-50, 50), PIES - 4, azar(-260, 260), azar(-50, -5), azar(0.4, 0.8), azar(24, 40));
    }));
    // despegue: estela de burbujas
    if (t > T_DESPEGA && t < T_DESPEGA + 0.45) {
      const q = aPant(e.m, [39, 232]);
      for (let k = 0; k < 6; k++) p.nueva(P.ESPUMA, q[0] + azar(-30, 30), q[1] + azar(0, 40), azar(-80, 80), azar(100, 300), azar(0.5, 1), azar(5, 12));
      if (Math.random() < 0.6) p.nueva(P.VAPOR, q[0] + azar(-20, 20), q[1] + 20, azar(-40, 40), azar(80, 160), azar(0.6, 1), azar(40, 70));
    }
    for (const B of this.burbujas) { B.vida -= dt; B.vx *= 1 - 1.5 * dt; B.vy *= 1 - 0.6 * dt; B.x += (B.vx + Math.sin(t * 5 + B.fase) * 25) * dt; B.y += B.vy * dt; }
    this.burbujas = this.burbujas.filter((B) => B.vida > 0);
    // la lata vacía cae desde arriba
    this.una("lata", t > T_LATA, () => { this.lata = { x: X + 46, y: -40, vx: 30, vy: 200, r: 0.4, vr: 6, botes: 0 }; });
    if (this.lata) {
      const L = this.lata;
      L.vy += 1800 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.r += L.vr * dt;
      if (L.y > PIES - 16 && L.vy > 0) {
        L.y = PIES - 16;
        if (L.botes < 3) { temblar(L.botes ? 3 : 8, 0.15); for (let k = 0; k < 6; k++) p.nueva(P.POLVO, L.x, PIES - 4, azar(-120, 120), azar(-40, -5), 0.5, 22); if (!L.botes) this.clonk = t; }
        L.botes++;
        L.vy = L.botes < 3 ? -L.vy * 0.38 : 0; L.vx = L.botes < 3 ? 110 : L.vx; L.vr *= 0.5;
        L.rFin = Math.round((L.r - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2;
      }
      if (L.botes >= 3) { L.vx *= 1 - 2.4 * dt; L.vr = 0; L.r = lerp(L.r, L.rFin + 0.05 * Math.sin(t * 14) * Math.min(1, L.vx / 60), Math.min(1, dt * 12)); }
    }
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    foco(g, X, X, PIES, 210, luz);
    // sombra en el suelo (más pequeña cuanto más alto)
    const hs = e.S.h;
    if (hs < 900) { g.save(); g.globalAlpha = 0.5 * luz * clamp(1 - hs / 500, 0.15, 1); g.fillStyle = "#000"; g.beginPath(); g.ellipse(X, PIES - 2, 70 * clamp(1 - hs / 700, 0.3, 1), 9, 0, 0, 6.283); g.fill(); g.restore(); }
    // líneas de velocidad al despegar
    if (t > T_DESPEGA && t < T_DESPEGA + 0.6) {
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(255,255,255,${0.5 * (1 - tramo(t, T_DESPEGA + 0.2, T_DESPEGA + 0.6))})`; g.lineWidth = 2;
      for (let i = 0; i < 14; i++) { const x = X + azar(-220, 220), y0 = azar(-40, H); g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + azar(80, 200)); g.stroke(); }
      g.restore();
    }
    if (hs < 1600) pintarAvatar(g, e.m, e.pose, t);
    if (this.lata) lataSuelta(g, this.lata.x, this.lata.y, this.lata.r, 2.2);
    this.p.dibujar(g);
    // burbujas del hipo
    g.save(); g.lineWidth = 2;
    for (const B of this.burbujas) {
      g.globalAlpha = Math.min(1, B.vida * 3) * 0.85;
      g.strokeStyle = "#eafcff"; g.beginPath(); g.arc(B.x, B.y, B.r, 0, 6.283); g.stroke();
      g.fillStyle = "rgba(200,240,255,.18)"; g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(B.x - B.r * 0.35, B.y - B.r * 0.35, B.r * 0.22, 0, 6.283); g.fill();
    }
    g.restore();
    // ¡HIC! cada vez más grande
    for (const T of this.textos) {
      const s = t - T.t0, dur = T.grande ? 1.6 : 0.85;
      if (s > dur) continue;
      const k = tramo(s, 0, 0.1), a = 1 - tramo(s, dur - 0.3, dur);
      g.save(); g.translate(T.x, T.y - s * 30); g.rotate(T.rot); g.scale(eBack(k), eBack(k));
      txt(g, "¡HIC!", 0, 0, { tam: T.tam, peso: 400, fam: FC, color: "#f4ffd6", borde: "#2e6b00", bordeAncho: T.tam * 0.09 + 3, alfa: a, esp: 2 });
      g.restore();
    }
    // ¡clonk! y el «hic» lejano
    if (this.clonk && t - this.clonk < 0.6) {
      const s = t - this.clonk, k = tramo(s, 0, 0.08);
      g.save(); g.translate(this.lata.x + 70, PIES - 70); g.rotate(0.12); g.scale(eBack(k), eBack(k));
      txt(g, "¡CLONK!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#d9f2ff", borde: "#1b3f5c", bordeAncho: 6, alfa: 1 - tramo(s, 0.4, 0.6), esp: 1 });
      g.restore();
    }
    if (t > 8.05 && t < 8.9) {
      const k = tramo(t, 8.05, 8.15);
      g.save(); g.translate(X + 40, 38); g.rotate(-0.1); g.scale(eBack(k), eBack(k));
      txt(g, "hic", 0, 0, { tam: 26, peso: 400, fam: FC, color: "#f4ffd6", borde: "#2e6b00", bordeAncho: 4, alfa: 1 - tramo(t, 8.6, 8.9), esp: 1 });
      g.restore();
    }
    const negro = Math.max(t < 0.7 ? 0.97 * (1 - luz) : 0, tramo(t, 9.0, 9.48));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00006", nombre: "Hipo propulsado", crear: () => new EscenaHipo() });
})();
