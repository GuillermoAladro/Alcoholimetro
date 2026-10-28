"use strict";
/*
 * MODO LEYENDA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco. Se bebe una lata de un trago y la aplasta en el puño (¡CRUNCH!). Se transforma con un grito
 * (¡¡HAAAA!!): aura de ki, pelo dorado en punta, rayos, rocas que flotan y el cartel ¡MODO LEYENDA! Sale disparado
 * hacia arriba dejando una columna de luz.
 */

class EscenaLeyenda extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(1100);
    this.rocas = []; this.rayos = [];
    this.lata = null; this.flash = 0; this.columna = 0;
    this.X = W / 2; this.ESC = 1.6;
  }
  potencia() { return eInOut(tramo(this.t, 4.1, 6.2)); }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1 + 0.008 * Math.sin(t * 3), dx = 0, y = PIES;
    let lataAng = 0, aplast = 0;
    const pot = this.potencia();
    // la lata: al pecho, se abre, a la boca, trago, al pecho, se aplasta y la tira
    const kSube = eInOut(tramo(t, 1.0, 1.35));
    manoD = mezcla(manoD, [60, 118], kSube);
    const kBoca = eInOut(tramo(t, 1.55, 1.85)) * (1 - eInOut(tramo(t, 3.0, 3.3)));
    const kTrago = eInOut(tramo(t, 1.85, 2.85)) * (1 - eInOut(tramo(t, 3.0, 3.3)));
    pose.rc = -0.36 * kTrago + (kTrago > 0.05 && kTrago < 0.95 ? 0.02 * Math.sin(t * 42) : 0);
    lataAng = -0.4 * kBoca - 1.55 * kTrago;
    if (kBoca > 0) {
      const b = boca(pose.rc), tope = rot2([1.5, -13], lataAng);
      manoD = mezcla(manoD, [b[0] - tope[0] + 2, b[1] - tope[1] + 1], kBoca);
    }
    if (t > 2.9 && t < 3.3) pose.cara = "dormido"; // ¡ah!, qué rica
    aplast = eOut(tramo(t, 3.35, 3.58));
    if (t >= 3.35 && t < 3.75) { pose.cara = "guino"; manoD = [60 + 1.5 * Math.sin(t * 60) * (1 - aplast), 118]; }
    // tirar la lata por encima del hombro
    const kTira = tramo(t, 3.72, 3.95);
    if (kTira > 0 && t < 4.2) manoD = mezcla([60, 118], [96, 52], eOut(kTira));
    // carga de poder: puños a los lados, piernas abiertas
    const kCarga = eInOut(tramo(t, 3.95, 4.3));
    if (kCarga > 0) {
      const tiembla = (1 + 3 * pot) * 0.6;
      manoD = mezcla(manoD, [86 + azar(-tiembla, tiembla), 148], kCarga);
      manoI = mezcla(manoI, [-8 + azar(-tiembla, tiembla), 148], kCarga);
      pose.piernaI = [0, 0.07 * kCarga]; pose.piernaD = [0, -0.07 * kCarga];
      sy *= 1 - 0.03 * kCarga;
      dx = azar(-1, 1) * (0.5 + 3.5 * pot) * (t < 7.9 ? 1 : 0);
    }
    if (t >= 4.2 && t < 6.05) { pose.cara = "sorpresa"; pose.rc = 0.03 * Math.sin(t * 50) * pot; }
    else if (t >= 6.05 && t < 7.45) pose.cara = "guino";
    else if (t >= 7.45) pose.cara = "sonrisa";
    // pelo dorado: parpadea y se queda
    let oro = 0;
    if (t > 4.6 && t < 5.35) oro = Math.sin(t * 52) > 0.6 - tramo(t, 4.6, 5.35) * 1.4 ? 1 : 0;
    if (t >= 5.35) oro = 1;
    pose.oro = oro;
    pose.puntas = t >= 5.35 ? eBack(tramo(t, 5.35, 5.6)) : oro * 0.25;
    // agacharse y despegar con el puño arriba
    const kAgacha = eInOut(tramo(t, 7.45, 7.85));
    if (kAgacha > 0 && t < 7.9) { sy *= 1 - 0.13 * kAgacha; sx *= 1 + 0.05 * kAgacha; }
    if (t >= 7.75) manoD = mezcla(manoD, [64, -22], eOut(tramo(t, 7.75, 7.95)));
    if (t >= 7.9) {
      const s = t - 7.9;
      y = PIES - (1300 * s + 3200 * s * s);
      sy *= 1.22; sx *= 0.86;
      manoI = [6, 178];
      pose.piernaI = [0, 0.03]; pose.piernaD = [0, -0.03];
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const lataVis = t < 3.9;
    if (lataVis) pose.objD = (g, m) => dibujarLata(g, m[0], m[1], lataAng, { aplast, abierta: t > 1.42 });
    const m = matAv(this.X + dx, y, ESC, 0, sx, sy);
    return { pose, m, y, pot, lataAng, ESC };
  }
  actualizar(dt) {
    const t = (this.t += dt);
    const e = this.estado(), pot = e.pot, p = this.p;
    const cx = this.X, cy = e.y - 120 * this.ESC;
    // ¡PSSHT! al abrir
    this.una("abre", t > 1.42, () => {
      const q = aPant(e.m, [e.pose.manoD[0], e.pose.manoD[1] - 12]);
      for (let i = 0; i < 16; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-90, 90), azar(-260, -80), azar(0.3, 0.6), azar(3, 7));
    });
    // gotas que se escapan al beber
    if (t > 1.9 && t < 2.85 && Math.random() < 0.35) {
      const q = aPant(e.m, boca(e.pose.rc));
      p.nueva(P.GOTA, q[0] - 6, q[1] + 4, azar(-60, 20), azar(-30, 30), 0.8, azar(2.5, 4));
    }
    this.una("crunch", t > 3.38, () => temblar(9, 0.25));
    // la lata sale volando y rebota en el suelo
    this.una("tira", t > 3.9, () => {
      const q = aPant(e.m, e.pose.manoD);
      this.lata = { x: q[0], y: q[1], vx: 330, vy: -560, r: 0, vr: 14 };
    });
    if (this.lata) {
      const L = this.lata;
      L.vy += 1500 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.r += L.vr * dt;
      if (L.y > PIES - 8) { L.y = PIES - 8; L.vy *= -0.38; L.vx *= 0.7; L.vr *= 0.6; if (Math.abs(L.vy) < 40) L.vy = 0; }
    }
    // carga de poder
    if (pot > 0 && t < 7.9) {
      temblar(1.5 + 9 * pot, 0.12);
      const n = Math.round((80 + 420 * pot) * dt);
      for (let i = 0; i < n; i++) {
        const lado = Math.random() < 0.5 ? -1 : 1, rx = azar(0.6, 1.25) * 62 * this.ESC * lado;
        p.nueva(P.LLAMA, cx + rx, cy + azar(-40, 175), -rx * 0.35, azar(-650, -300), azar(0.25, 0.5), azar(30, 64) * (0.6 + 0.4 * pot), Math.random() < 0.35 ? 1 : 0);
      }
      if (Math.random() < 30 * dt * pot) p.nueva(P.POLVO, cx + azar(-150, 150), PIES - 4, azar(-260, 260), azar(-20, 0), azar(0.6, 1.1), azar(30, 50));
      if (t < 5.6 && this.rocas.length < 14 && Math.random() < 12 * dt) {
        const lado = Math.random() < 0.5 ? -1 : 1;
        this.rocas.push(nuevaRoca(cx + lado * azar(110, 330)));
      }
      if (pot > 0.45 && Math.random() < 9 * dt) this.rayos.push(nuevoRayo(cx, cy, 75, 190));
      if (t > 5.35 && Math.random() < 6 * dt) this.rayos.push(nuevoRayo(cx, cy, 75, 190));
    }
    this.una("dorado", t > 5.35, () => {
      this.flash = 1; temblar(26, 0.7);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(300, 800); p.nueva(P.CHISPA, cx, cy - 90, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(8, 16)); }
    });
    this.una("titulo", t > 6.17, () => temblar(16, 0.35));
    // despegue
    this.una("despega", t > 7.9, () => {
      temblar(30, 0.9); this.columna = 1; this.flash = 0.8;
      for (const r of this.rocas) { r.suelta = true; r.vx = (r.x - cx) * azar(2.5, 5) + azar(-80, 80); r.vy = azar(-750, -350); r.vr *= 6; }
      for (let i = 0; i < 40; i++) p.nueva(P.POLVO, cx + azar(-40, 40), PIES - 6, azar(-700, 700), azar(-120, -10), azar(0.8, 1.4), azar(40, 70));
      if (this.lata) { this.lata.vx += 700; this.lata.vy = -520; this.lata.vr = 25; }
    });
    if (t > 7.9 && t < 8.35) for (let i = 0; i < 10; i++) p.nueva(P.LLAMA, cx + azar(-50, 50), e.y - azar(0, 200), 0, azar(200, 600), azar(0.2, 0.45), azar(40, 80), 1);
    if (t > 8.2 && t < 8.9 && Math.random() < 50 * dt) p.nueva(P.PURPURINA, cx + azar(-260, 260), azar(-20, 200), azar(-20, 20), azar(30, 80), azar(0.8, 1.2), azar(6, 12));
    // rocas
    for (const r of this.rocas) {
      if (!r.suelta) { r.vy = lerp(r.vy, -r.sube * (0.4 + pot), 2 * dt); r.y = Math.max(PIES - 300, r.y + r.vy * dt); r.x += Math.sin(t * 2 + r.fase) * 6 * dt; r.rot += r.vr * dt; }
      else { r.vy += 1500 * dt; r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vr * dt; }
    }
    this.rocas = this.rocas.filter((r) => r.y < H + 60 && r.x > -60 && r.x < W + 60);
    for (const r of this.rayos) r.vida -= dt;
    this.rayos = this.rayos.filter((r) => r.vida > 0);
    this.flash = Math.max(0, this.flash - dt * 2.6);
    this.columna = Math.max(0, this.columna - dt * 0.75);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), pot = e.pot, cx = this.X;
    fondo(g, "#000");
    // foco: se enciende con parpadeo y se apaga al final
    const parpadeo = t < 0.75 ? [0, 1, 0, 0, 1, 0.35, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    const luz = parpadeo * (1 - tramo(t, 8.6, 9.7)) * (1 - 0.6 * pot * (t < 7.9 ? 1 : 0));
    foco(g, cx, cx, PIES, 190, luz);
    // grito detrás de todo
    if (t > 4.3 && t < 5.98) {
      const n = 1 + Math.floor(tramo(t, 4.3, 5.4) * 6);
      const a = Math.min(1, tramo(t, 4.3, 4.5)) * (1 - tramo(t, 5.75, 5.98));
      g.save(); g.translate(W / 2 + azar(-4, 4), 115 + azar(-4, 4)); g.rotate(azar(-0.02, 0.02));
      txt(g, "¡¡HA" + "A".repeat(n) + "!!", 0, 0, { tam: 130, peso: 400, fam: FC, color: "#fff7d6", borde: "#b36b00", bordeAncho: 10, alfa: a, esp: 4, max: 960 });
      g.restore();
    }
    // suelo iluminado por el aura
    if (pot > 0 && t < 8.4) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * pot * (1 - tramo(t, 7.9, 8.4));
      g.drawImage(BLOB2.oro, cx - 260, PIES - 30, 520, 60); g.restore();
    }
    for (const r of this.rocas) dibujarRoca(g, r, pot);
    if (this.lata) { g.save(); g.translate(this.lata.x, this.lata.y); g.scale(1.6, 1.6); dibujarLata(g, 0, 0, this.lata.r, { aplast: 1 }); g.restore(); }
    // columna de luz del despegue
    if (this.columna > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      const c = this.columna, w = 150 * c + 20;
      const gr = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      gr.addColorStop(0, "rgba(255,190,40,0)"); gr.addColorStop(0.5, `rgba(255,248,210,${0.9 * c})`); gr.addColorStop(1, "rgba(255,190,40,0)");
      g.fillStyle = gr; g.fillRect(cx - w / 2, -60, w, PIES + 60);
      g.restore();
    }
    // aura (detrás) + avatar + aura clara (delante)
    const kAura = t < 7.9 ? pot : Math.max(0, 1 - (t - 7.9) * 3);
    const cy = e.y - 118 * this.ESC;
    if (e.y > -500) dibujarAura(g, cx, cy, 70 * this.ESC, 165 * this.ESC * (t > 7.9 ? 1.25 : 1), kAura * (0.85 + 0.15 * Math.sin(t * 31)), t);
    this.p.dibujar(g); // las llamas van detrás del cuerpo
    if (e.y > -500) {
      pintarAvatar(g, e.m, e.pose, t);
      if (kAura > 0) {
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.1 * kAura;
        g.drawImage(BLOB2.oroClaro, cx - 90, cy - 230, 180, 400); g.restore();
      }
    }
    // líneas de velocidad al despegar
    if (t > 7.9 && t < 8.5) {
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,240,200,.55)"; g.lineWidth = 2;
      for (let i = 0; i < 14; i++) { const x = cx + azar(-260, 260), y0 = azar(-50, H); g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + azar(80, 220)); g.stroke(); }
      g.restore();
    }
    dibujarRayos(g, this.rayos);
    // ¡CRUNCH!
    if (t > 3.38 && t < 4.1) {
      const k = tramo(t, 3.38, 3.5), q = aPant(e.m, [60, 100]);
      g.save(); g.translate(q[0] + 150, q[1] - 110); g.rotate(-0.15); g.scale(eBack(k) * 1.05, eBack(k) * 1.05);
      txt(g, "¡CRUNCH!", 0, 0, { tam: 58, peso: 400, fam: FC, color: "#ffffff", borde: "#0a6b2a", bordeAncho: 8, alfa: 1 - tramo(t, 3.85, 4.1), esp: 2 });
      g.restore();
    }
    // ¡MODO LEYENDA!
    if (t > 6.05 && t < 7.7) {
      const k = tramo(t, 6.05, 6.19), s = lerp(3.2, 1, eIn(k)), a = Math.min(1, k * 4) * (1 - tramo(t, 7.35, 7.7));
      g.save(); g.translate(W / 2, 112); g.scale(s, s);
      const gr = g.createLinearGradient(0, -80, 0, 10);
      gr.addColorStop(0, "#fff9c8"); gr.addColorStop(0.55, "#ffcf2e"); gr.addColorStop(1, "#ff8a00");
      txt(g, "¡MODO LEYENDA!", 0, 0, { tam: 104, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 10, alfa: a, esp: 3, glow: "rgba(255,190,40,.8)", glowTam: 24, max: 980 });
      g.restore();
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,250,225,${this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // empieza a oscuras: el foco se enciende con parpadeo
    if (t < 0.75 && parpadeo < 1) { g.fillStyle = `rgba(0,0,0,${0.97 * (1 - parpadeo)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
