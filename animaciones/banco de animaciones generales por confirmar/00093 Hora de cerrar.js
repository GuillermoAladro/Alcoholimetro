"use strict";
/*
 * 00093 · HORA DE CERRAR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende el bar (neón y lámparas). Él, dentro, va señalando las lámparas y se apagan una a una (¡CLIC!). Se
 * despide con la mano, salta, agarra la persiana metálica y la baja; por debajo aún asoma su mano diciendo adiós.
 * La persiana cae del todo (¡CLONC!) y queda pintado ¡HASTA MAÑANA!. Se apaga el neón.
 */
(() => {
const X = 512, ESC = 1.5;
const AX0 = 100, AX1 = 924, ATOP = 140;              // hueco del local
const LAMP = [200, 356, 512, 668, 824], LY = 192;    // lámparas (x) y altura de la pantalla de la lámpara
const APAGA = [[4, 1.45], [0, 2.15], [3, 2.85], [1, 3.55]]; // [lámpara, cuándo]
const textos = cacheTexto();

/** Interior del bar: pared, baldas con botellas, taburetes y suelo (se pinta una vez). */
function pintarInterior() {
  const w = AX1 - AX0, h = PIES - ATOP, c = lienzoNuevo(w, h + 30), g = c.getContext("2d");
  const pa = g.createLinearGradient(0, 0, 0, h);
  pa.addColorStop(0, "#3a2416"); pa.addColorStop(1, "#24160d");
  g.fillStyle = pa; g.fillRect(0, 0, w, h + 30);
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2;
  for (let x = 30; x < w; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  const rnd = semilla(5);
  const cols = ["#2e7d32", "#7a3b12", "#b8860b", "#1b5e7a", "#8b1c2c", "#d7d0b8"];
  for (const by of [150, 236]) {
    for (let x = 18; x < w - 18; x += 15 + rnd() * 8) {
      if (Math.abs(x + AX0 - X) < 90) continue;
      const bh = 34 + rnd() * 26, bw = 9 + rnd() * 5, col = cols[(rnd() * cols.length) | 0];
      g.fillStyle = col; rectR(g, x, by - bh, bw, bh, 3); g.fill();
      g.fillRect(x + bw / 2 - 2, by - bh - 12, 4, 14);
      g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x + 2, by - bh + 4, 2, bh - 8);
    }
    const ba = g.createLinearGradient(0, by, 0, by + 10);
    ba.addColorStop(0, "#9c6a3e"); ba.addColorStop(1, "#4a2d18");
    g.fillStyle = ba; g.fillRect(0, by, w, 10);
  }
  // espejo detrás de las botellas (franja clara)
  g.fillStyle = "rgba(255,230,190,.05)"; g.fillRect(0, 60, w, 186);
  // suelo
  const su = g.createLinearGradient(0, h - 60, 0, h);
  su.addColorStop(0, "#2b1a0f"); su.addColorStop(1, "#4a2f1b");
  g.fillStyle = su; g.fillRect(0, h - 50, w, 80);
  // taburetes
  for (const tx of [90, 210, w - 210, w - 90]) {
    g.fillStyle = "#1a110a"; g.fillRect(tx - 3, h - 120, 6, 112);
    g.fillRect(tx - 22, h - 10, 44, 6);
    const as = g.createLinearGradient(0, h - 132, 0, h - 116);
    as.addColorStop(0, "#b3262f"); as.addColorStop(1, "#5c0f15");
    g.fillStyle = as; rectR(g, tx - 26, h - 132, 52, 16, 7); g.fill();
  }
  return c;
}

/** Fachada: pilares de piedra, muro de arriba y cajón de la persiana (se pinta una vez, con el hueco vacío). */
function pintarFachada() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const pi = g.createLinearGradient(0, 0, 0, H);
  pi.addColorStop(0, "#3b3836"); pi.addColorStop(1, "#24211f");
  g.fillStyle = pi; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let y = 26; y < H; y += 42) for (let x = (y / 42) % 2 ? 0 : 50; x < W; x += 100) { g.strokeRect(x, y, 100, 42); }
  g.clearRect(AX0, ATOP, AX1 - AX0, PIES - ATOP);
  // cajón de la persiana
  const ca = g.createLinearGradient(0, ATOP - 28, 0, ATOP);
  ca.addColorStop(0, "#6b717c"); ca.addColorStop(1, "#3a3f47");
  g.fillStyle = ca; g.fillRect(AX0 - 8, ATOP - 28, AX1 - AX0 + 16, 28);
  // guías laterales
  g.fillStyle = "#2c3036"; g.fillRect(AX0 - 8, ATOP, 10, PIES - ATOP); g.fillRect(AX1 - 2, ATOP, 10, PIES - ATOP);
  // acera
  g.fillStyle = "#2a2b30"; g.fillRect(0, PIES, W, H - PIES + 10);
  g.fillStyle = "#3d3f45"; g.fillRect(0, PIES, W, 4);
  return c;
}

/** La persiana entera (lamas y el texto pintado), de abajo arriba: el borde inferior es la última fila del lienzo. */
function pintarPersiana() {
  const w = AX1 - AX0, h = PIES - ATOP, c = lienzoNuevo(w, h), g = c.getContext("2d");
  const me = g.createLinearGradient(0, 0, w, 0);
  me.addColorStop(0, "#5d6470"); me.addColorStop(0.5, "#8d95a1"); me.addColorStop(1, "#555c67");
  g.fillStyle = me; g.fillRect(0, 0, w, h);
  for (let y = h - 26; y > -14; y -= 14) {
    g.fillStyle = "rgba(0,0,0,.28)"; g.fillRect(0, y, w, 3);
    g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, y + 3, w, 2);
  }
  // pintada
  g.save(); g.translate(w / 2, h - 205); g.rotate(-0.04);
  txt(g, "¡HASTA MAÑANA!", 0, 0, { tam: 108, peso: 400, fam: FC, color: "#ffd34d", borde: "#2a1600", bordeAncho: 12, esp: 3, max: w - 60 });
  g.restore();
  g.save(); g.translate(w / 2 + 250, h - 130); g.rotate(0.05);
  txt(g, "BUENAS NOCHES", 0, 0, { tam: 30, peso: 400, fam: FC, color: "#fffdf5", borde: "#2a1600", bordeAncho: 6, esp: 2 });
  g.restore();
  // barra de abajo con asas y candado
  const ba = g.createLinearGradient(0, h - 22, 0, h);
  ba.addColorStop(0, "#a6adb8"); ba.addColorStop(1, "#3b4048");
  g.fillStyle = ba; g.fillRect(0, h - 22, w, 22);
  g.fillStyle = "#2a2e35";
  for (const hx of [w * 0.3, w * 0.7]) rectR(g, hx - 26, h - 16, 52, 9, 4), g.fill();
  g.fillStyle = "#c9a227"; rectR(g, w / 2 - 12, h - 24, 24, 20, 4); g.fill();
  g.strokeStyle = "#c9a227"; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h - 24, 8, Math.PI, 0); g.stroke();
  return c;
}

class EscenaCerrar extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(260);
    this.interior = pintarInterior();
    this.fachada = pintarFachada();
  }
  lampOn(i, t) {
    if (t < 0.85) return [0, 0, 1, 0, 1, 1, 1, 1, 1][Math.min(8, Math.floor(t / 0.1))] * (i === 2 || t > 0.5 ? 1 : 0);
    const a = APAGA.find((q) => q[0] === i);
    if (a) { const d = t - a[1]; if (d > 0) return d < 0.12 ? (d < 0.05 ? 0 : 0.6) : 0; }
    return 1;
  }
  neon(t) {
    if (t < 0.35) return 0;
    if (t < 0.7) return [1, 0.2, 1, 0.5][Math.min(3, Math.floor((t - 0.35) / 0.09))];
    if (t > 8.4) return t < 8.75 ? [0.3, 1, 0.15, 0.7][Math.min(3, Math.floor((t - 8.4) / 0.09))] : 0;
    return Math.sin(t * 31) > 0.97 ? 0.6 : 1;
  }
  borde(t) {
    // borde inferior de la persiana (y en pantalla)
    if (t < 5.5) return ATOP;
    if (t < 6.0) return lerp(ATOP, 212, eIn(tramo(t, 5.5, 6.0)));
    if (t < 6.55) return lerp(212, 404, eInOut(tramo(t, 6.0, 6.55)));
    if (t < 7.45) return 404;
    return lerp(404, PIES, eIn(tramo(t, 7.45, 7.62)));
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], y = PIES, sy = 1;
    // señala las lámparas
    for (const [i, ta] of APAGA) {
      const k = eOut(tramo(t, ta - 0.32, ta - 0.06)) * (1 - eInOut(tramo(t, ta + 0.18, ta + 0.42)));
      if (k <= 0) continue;
      const derecha = LAMP[i] > X;
      const S = derecha ? [557, 356] : [467, 356];
      let dx = LAMP[i] - S[0], dy = LY - S[1]; const L = Math.hypot(dx, dy); dx /= L; dy /= L;
      const H = derecha ? [69 + dx * 74, 86 + dy * 74] : [9 + dx * 74, 86 + dy * 74];
      if (derecha) manoD = mezcla(manoD, H, k); else manoI = mezcla(manoI, H, k);
      pose.rc = (derecha ? 0.08 : -0.08) * k;
      if (t > ta) pose.cara = "guino";
    }
    // se despide
    if (t > 3.95 && t < 5.15) {
      const k = eBack(tramo(t, 3.95, 4.2)) * (1 - eInOut(tramo(t, 4.95, 5.15)));
      manoD = mezcla([70, 158], [88 + 10 * Math.sin((t - 3.95) * 14), 22], k);
      pose.cara = "risa";
    }
    // salta, agarra la persiana y la baja
    if (t >= 5.15) {
      pose.cara = "sorpresa";
      const kAg = eInOut(tramo(t, 5.15, 5.3));
      const kSal = Math.sin(Math.PI * tramo(t, 5.3, 6.0));
      const borde = this.borde(t);
      if (t < 5.5) {
        y = PIES - 70 * Math.sin(Math.PI * 0.5 * tramo(t, 5.3, 5.5)) * (t > 5.3 ? 1 : 0);
        sy = t < 5.3 ? 1 - 0.08 * kAg : 1.04;
        manoD = mezcla([70, 158], [66, -20], kAg); manoI = mezcla([9, 160], [12, -20], kAg);
      } else {
        y = t < 6.0 ? PIES - 70 * kSal : PIES;
        const yHand = 232 - (y - (borde + 8)) / ESC;
        manoD = [66, yHand]; manoI = [12, yHand];
        if (t > 6.0) sy = 1 - 0.06 * Math.sin(Math.PI * tramo(t, 6.0, 6.3));
      }
      pose.piernaI = [y < PIES - 2 ? -12 : 0, 0.08]; pose.piernaD = [y < PIES - 2 ? -12 : 0, -0.08];
      // la mano que dice adiós por debajo
      if (t > 6.6 && t < 7.45) {
        const k = eInOut(tramo(t, 6.6, 6.8)) * (1 - eInOut(tramo(t, 7.25, 7.42)));
        manoD = mezcla(manoD, [106 + 4 * Math.sin((t - 6.6) * 15), 136 + 9 * Math.sin((t - 6.6) * 15 + 1)], k);
        pose.cara = "risa";
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(X, y, ESC, 0, 1, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const [i, ta] of APAGA) this.una("clic" + i, t > ta, () => { temblar(3, 0.12); p.nueva(P.DESTELLO, LAMP[i], LY + 6, 0, 0, 0.25, 50); });
    this.una("agarra", t > 5.5, () => temblar(6, 0.2));
    this.una("clonc", t > 7.62, () => {
      temblar(24, 0.6);
      for (let i = 0; i < 40; i++) p.nueva(P.POLVO, azar(AX0, AX1), PIES - azar(0, 10), azar(-300, 300), azar(-90, -10), azar(0.6, 1.2), azar(26, 50));
      for (let i = 0; i < 20; i++) { const a = azar(-Math.PI, 0), v = azar(150, 420); p.nueva(P.CHISPA, azar(AX0 + 40, AX1 - 40), PIES - 4, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11)); }
    });
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), borde = this.borde(t), neon = this.neon(t);
    fondo(g, "#000");
    // dentro del bar
    g.save(); g.beginPath(); g.rect(AX0, ATOP, AX1 - AX0, PIES - ATOP); g.clip();
    g.drawImage(this.interior, AX0, ATOP);
    let n = 0; for (let i = 0; i < 5; i++) n += this.lampOn(i, t);
    if (borde < PIES - 1) pintarAvatar(g, e.m, e.pose, t);
    const oscI = 0.85 * (1 - n / 5);
    if (oscI > 0.01) {
      const hueco = this.lampOn(2, t);
      const gr = g.createRadialGradient(X, 420, 40, X, 420, 300);
      gr.addColorStop(0, `rgba(0,0,0,${oscI * (1 - 0.75 * hueco)})`); gr.addColorStop(1, `rgba(0,0,0,${oscI})`);
      g.fillStyle = gr; g.fillRect(AX0, ATOP, AX1 - AX0, PIES - ATOP);
    }
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const a = this.lampOn(i, t); if (a <= 0) continue;
      const lx = LAMP[i];
      g.globalAlpha = a * 0.9;
      g.fillStyle = "rgba(255,210,140,.13)";
      g.beginPath(); g.moveTo(lx - 22, LY + 4); g.lineTo(lx + 22, LY + 4); g.lineTo(lx + 120, PIES); g.lineTo(lx - 120, PIES); g.closePath(); g.fill();
      g.drawImage(BLOB.amarillo, lx - 50, LY - 16, 100, 50);
      g.globalAlpha = a * 0.35; g.drawImage(BLOB.naranja, lx - 110, PIES - 26, 220, 44);
    }
    g.restore();
    // lámparas
    for (let i = 0; i < 5; i++) {
      const lx = LAMP[i], a = this.lampOn(i, t);
      g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, ATOP); g.lineTo(lx, LY - 16); g.stroke();
      g.fillStyle = a > 0.5 ? "#c78a2c" : "#4a3418";
      g.beginPath(); g.moveTo(lx - 8, LY - 18); g.lineTo(lx + 8, LY - 18); g.lineTo(lx + 24, LY); g.lineTo(lx - 24, LY); g.closePath(); g.fill();
      g.fillStyle = a > 0.5 ? "#fff3cf" : "#2b2620"; g.beginPath(); g.ellipse(lx, LY, 20, 4, 0, 0, 6.283); g.fill();
    }
    g.restore();
    // la persiana
    if (borde > ATOP + 1) {
      if (!textos.has(2)) textos.set(2, pintarPersiana());
      const per = textos.get(2), vis = borde - ATOP, ph = per.height;
      g.drawImage(per, 0, ph - vis, AX1 - AX0, vis, AX0, ATOP, AX1 - AX0, vis);
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(AX0, borde, AX1 - AX0, 5);
    }
    // fachada y luz del neón sobre ella
    g.drawImage(this.fachada, 0, 0);
    if (neon > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28 * neon;
      g.drawImage(BLOB.blanco, X - 420, -60, 840, 300); g.restore();
      const c = this.cartel();
      if (c) { g.save(); g.globalAlpha = neon; g.drawImage(c, X - c.width / 2, 58 - c.height / 2); g.restore(); }
    } else {
      g.fillStyle = "rgba(90,40,60,.5)"; g.font = `900 64px ${FD}`; g.textAlign = "center"; g.fillText("BAR", X, 82);
    }
    this.p.dibujar(g);
    // ¡CLIC!
    for (const [i, ta] of APAGA) {
      const d = t - ta; if (d < 0 || d > 0.6) continue;
      g.save(); g.translate(LAMP[i] + (LAMP[i] > X ? -10 : 10), LY - 34); g.rotate(LAMP[i] > X ? 0.12 : -0.12); g.scale(eBack(tramo(d, 0, 0.12)), eBack(tramo(d, 0, 0.12)));
      txt(g, "¡CLIC!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a2200", bordeAncho: 7, alfa: 1 - tramo(d, 0.4, 0.6), esp: 2 });
      g.restore();
    }
    // ¡CLONC!
    if (t > 7.62 && t < 8.6) {
      const k = tramo(t, 7.62, 7.75);
      g.save(); g.translate(225, 520); g.rotate(-0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡CLONC!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#fffdf5", borde: "#1c1c1c", bordeAncho: 9, alfa: 1 - tramo(t, 8.3, 8.6), esp: 2 });
      g.restore();
    }
    // negro al empezar (se enciende el bar) y al acabar (se apaga el neón)
    const osc = Math.max(1 - tramo(t, 0, 0.35), t > 8.4 ? 0.75 * (1 - neon) : 0, tramo(t, 8.9, 9.5));
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  cartel() {
    if (textos.has(1)) return textos.get(1);
    const c = lienzoNuevo(300, 120), g = c.getContext("2d");
    g.strokeStyle = "rgba(255,80,160,.6)"; g.lineWidth = 3; rectR(g, 30, 14, 240, 92, 18);
    g.shadowColor = "#ff3d84"; g.shadowBlur = 16; g.stroke();
    txt(g, "BAR", 150, 88, { tam: 72, peso: 900, fam: FD, color: "#ffd0e6", glow: "#ff3d84", glowTam: 20, esp: 12 });
    textos.set(1, c);
    return c;
  }
}

registrar({ id: "00093", nombre: "Hora de cerrar", crear: () => new EscenaCerrar() });
})();
