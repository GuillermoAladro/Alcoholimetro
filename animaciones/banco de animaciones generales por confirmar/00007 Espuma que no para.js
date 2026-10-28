"use strict";
/*
 * 00007 · ESPUMA QUE NO PARA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco. Abre un botellín de un golpe de pulgar y la espuma empieza a salir… y no para: intenta
 * taparlo, lo levanta, pero la montaña de espuma le cubre los pies, la cintura y todo él (¡QUE NO PARA!), hasta que
 * solo asoma una mano con el pulgar arriba. La espuma se deshace en burbujas que suben y aparece él, con un copete
 * de espuma en la cabeza.
 */
(() => {
const X = 512, ESC = 1.55;
const T_ABRE = 1.2, T_CUBRE = 6.4, T_DESHACE = 7.75;

/** Botellín en unidades de avatar: (x, y) = donde lo agarra la mano. */
function botellin(g, x, y, ang, abierto) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(-5, 0, 5, 0);
  gr.addColorStop(0, "#2a1405"); gr.addColorStop(0.35, "#8a4a12"); gr.addColorStop(0.55, "#c0752a"); gr.addColorStop(1, "#2a1405");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-5, 10); g.lineTo(-5, -6); g.quadraticCurveTo(-5, -11, -2, -14); g.lineTo(-2, -22); g.lineTo(2, -22); g.lineTo(2, -14); g.quadraticCurveTo(5, -11, 5, -6); g.lineTo(5, 10); g.quadraticCurveTo(0, 12, -5, 10); g.fill();
  g.fillStyle = "#ffd34d"; g.fillRect(-5, -4, 10, 8);
  g.fillStyle = "#b3001b"; g.fillRect(-5, -1, 10, 2);
  if (!abierto) { g.fillStyle = "#d9dde2"; rectR(g, -2.6, -24, 5.2, 3, 0.8); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-3.4, -3, 1, 12);
  g.restore();
}

class EscenaEspuma extends Escena {
  constructor() {
    super(10.6);
    this.p = new Parts(360);
    this.burbujas = []; this.chapa = null;
  }
  luz() { const t = this.t; return (t < 0.7 ? [0, 1, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.1))] : 1) * (1 - tramo(t, 9.7, 10.45)); }
  /** Altura de la montaña de espuma (px). */
  nivel(t) {
    if (t < 1.55) return 0;
    if (t < 2.6) return 55 * eIn(tramo(t, 1.55, 2.6)) ** 0.7;
    if (t < 4.0) return lerp(55, 190, tramo(t, 2.6, 4.0));
    if (t < 5.3) return lerp(190, 275, tramo(t, 4.0, 5.3));
    if (t < T_CUBRE) return lerp(275, 368, eInOut(tramo(t, 5.3, T_CUBRE)));
    if (t < T_DESHACE) return 368 + 5 * Math.sin(t * 4);
    return lerp(368, 0, eInOut(tramo(t, T_DESHACE, 9.0)));
  }
  bordeY(x, L) {
    const HW = 150 + L * 1.15, u = (x - X) / HW;
    if (Math.abs(u) >= 1) return PIES;
    return PIES - L * Math.pow(1 - u * u, 0.55);
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160];
    const arriba = eInOut(tramo(t, 5.0, 5.6));
    manoD = mezcla(manoD, [62, 112], eInOut(tramo(t, 0.45, 0.9)));
    if (t > 0.6 && t < 1.25) pose.cara = "guino";
    // golpe de pulgar a la chapa
    const kPul = eInOut(tramo(t, 0.85, 1.1)) * (1 - eInOut(tramo(t, 1.2, 1.45)));
    if (kPul > 0) { pose.brazoIDelante = true; manoI = mezcla(manoI, [50, 96], kPul); }
    if (t > T_ABRE && t < 2.0) pose.cara = "risa";
    // lo aparta
    if (t >= 1.9) manoD = mezcla([62, 112], [104, 104], eInOut(tramo(t, 1.9, 2.3)));
    if (t >= 2.0) pose.cara = "sorpresa";
    // intenta taparlo con la otra mano
    const kTapa = eInOut(tramo(t, 3.4, 3.7)) * (1 - eInOut(tramo(t, 4.6, 4.9)));
    if (kTapa > 0) { pose.brazoIDelante = true; manoI = mezcla([9, 160], [86, 80], kTapa); manoD = mezcla(manoD, [96, 110], kTapa); }
    if (t > 3.4 && t < 4.9) pose.rc = -0.1 * kTapa;
    // levanta el botellín por encima de la cabeza
    if (arriba > 0) { manoD = mezcla(manoD, [74, -38], arriba); manoI = mezcla(manoI, [-26, 60], arriba); }
    if (t > 5.0) pose.rc = 0.04 * Math.sin(t * 9);
    // al deshacerse la espuma
    if (t > 8.2) { pose.cara = t < 9.1 ? "risa" : "guino"; manoI = [9, 160]; pose.rc = 0; }
    if (t > 9.15) manoD = mezcla([74, -38], [96, 66], eInOut(tramo(t, 9.15, 9.5)));
    pose.manoD = manoD; pose.manoI = manoI;
    const conBotella = t < 6.85;
    if (conBotella) pose.objD2 = (g, m) => botellin(g, m[0] + 1, m[1] - 4, 0, t > T_ABRE);
    const m = matAv(X, PIES, ESC);
    return { pose, m, conBotella };
  }
  boca(e) { return aPant(e.m, [e.pose.manoD[0] + 1, e.pose.manoD[1] - 4 - 23]); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado(), L = this.nivel(t);
    this.una("chapa", t > T_ABRE, () => {
      const q = this.boca(e);
      this.chapa = { x: q[0], y: q[1], vx: -160, vy: -700, r: 0 };
      temblar(6, 0.15);
      for (let i = 0; i < 20; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-120, 120), azar(-420, -160), azar(0.5, 0.9), azar(4, 9));
    });
    if (this.chapa) { const C = this.chapa; C.vy += 1500 * dt; C.x += C.vx * dt; C.y += C.vy * dt; C.r += 18 * dt; }
    // chorro de espuma
    if (t > T_ABRE && t < 6.85) {
      const q = this.boca(e), tapado = t > 3.6 && t < 4.7;
      const n = Math.round((tapado ? 70 : 45) * dt * (1 + tramo(t, T_ABRE, 3))) + 1;
      for (let i = 0; i < n; i++) {
        if (tapado) { const lado = Math.random() < 0.5 ? -1 : 1; p.nueva(P.ESPUMA, q[0], q[1] + 4, lado * azar(250, 520), azar(-260, 20), azar(0.5, 0.9), azar(5, 11)); }
        else p.nueva(P.ESPUMA, q[0] + azar(-3, 3), q[1], azar(-150, 150), azar(-520, -260), azar(0.6, 1.1), azar(6, 13));
      }
      if (Math.random() < 0.3) temblar(2, 0.1);
    }
    this.una("cubre", t > T_CUBRE, () => temblar(10, 0.3));
    this.una("pulgar", t > 6.9, () => { const q = aPant(e.m, [74, -44]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 90); });
    // se deshace en burbujas que suben
    if (t > T_DESHACE && t < 8.7) {
      const n = Math.round(150 * dt) + 1;
      for (let i = 0; i < n && this.burbujas.length < 260; i++) {
        const x = X + azar(-1, 1) * (150 + L * 1.15), y = azar(this.bordeY(x, L), PIES);
        this.burbujas.push({ x, y, vy: -azar(260, 480), r: azar(6, 18), vida: azar(0.45, 0.85), fase: azar(0, 6) });
      }
    }
    for (const B of this.burbujas) { B.vida -= dt; B.vy -= 160 * dt; B.y += B.vy * dt; B.x += Math.sin(t * 4 + B.fase) * 30 * dt; }
    this.burbujas = this.burbujas.filter((B) => B.vida > 0 && B.y > -40);
    p.actualizar(dt);
  }
  dibujarMontana(g, L, t) {
    if (L < 1) return;
    const HW = 150 + L * 1.15;
    // cuerpo
    const gr = g.createLinearGradient(0, PIES - L, 0, PIES);
    gr.addColorStop(0, "#fffdf6"); gr.addColorStop(0.6, "#f4ead0"); gr.addColorStop(1, "#d8c69c");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(X - HW, PIES + 4);
    for (let x = X - HW; x <= X + HW; x += 12) g.lineTo(x, this.bordeY(x, L) + 6);
    g.lineTo(X + HW, PIES + 4); g.closePath(); g.fill();
    // borde de burbujas
    const r = semilla(3), n = Math.ceil((2 * HW) / 26);
    for (let i = 0; i <= n; i++) {
      const x = X - HW + (i * 2 * HW) / n, y = this.bordeY(x, L), R = (12 + r() * 16) * Math.min(1, L / 60 + 0.3);
      const bb = Math.sin(t * 5 + i * 1.7) * 2;
      g.drawImage(SPR.espuma, x - R, y - R * 0.8 + bb, R * 2, R * 2);
    }
    // burbujas dentro
    for (let i = 0; i < 26; i++) {
      const x = X + (r() * 2 - 1) * HW * 0.85, yb = this.bordeY(x, L), y = lerp(yb + 20, PIES - 6, r());
      if (y < yb + 14) continue;
      const R = 5 + r() * 9;
      g.globalAlpha = 0.7; g.drawImage(SPR.espuma, x - R, y - R + Math.sin(t * 3 + i) * 2, R * 2, R * 2); g.globalAlpha = 1;
    }
  }
  /** Puño con el pulgar arriba (pantalla). */
  dibujarPulgar(g, x, y, t) {
    g.save(); g.translate(x, y); g.rotate(0.08 * Math.sin(t * 6)); g.scale(1.75, 1.75);
    const gr = g.createLinearGradient(-14, 0, 14, 0);
    gr.addColorStop(0, "#c98c68"); gr.addColorStop(0.45, "#efbf9b"); gr.addColorStop(1, "#b97c5c");
    // muñeca (manga)
    g.fillStyle = "#2b2b2c"; rectR(g, -11, 10, 22, 22, 4); g.fill();
    // pulgar
    g.fillStyle = gr; g.strokeStyle = "#8a5a40"; g.lineWidth = 1.2;
    rectR(g, -12, -26, 10, 24, 5); g.fill(); g.stroke();
    // puño
    rectR(g, -14, -8, 28, 22, 7); g.fill(); g.stroke();
    g.strokeStyle = "rgba(120,70,45,.7)";
    for (const yy of [-2, 3, 8]) { g.beginPath(); g.moveTo(2, yy); g.lineTo(13, yy); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-10, -23, 3, 12);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(), L = this.nivel(t);
    fondo(g, "#000");
    foco(g, X, X, PIES, 230, luz);
    pintarAvatar(g, e.m, e.pose, t);
    // copete de espuma en la cabeza (cuando ya se ha deshecho la montaña)
    if (t > 8.6) {
      const a = tramo(t, 8.6, 8.8), q = aPant(e.m, [41, -4]);
      g.save(); g.globalAlpha = a;
      for (const [dx, dy, R] of [[-16, 4, 16], [10, 2, 18], [-2, -12, 20], [20, -4, 12]]) g.drawImage(SPR.espuma, q[0] + dx - R, q[1] + dy - R, R * 2, R * 2);
      g.restore();
    }
    if (this.chapa && this.chapa.y < H + 40) {
      g.save(); g.translate(this.chapa.x, this.chapa.y); g.rotate(this.chapa.r); g.scale(1, Math.abs(Math.cos(this.chapa.r * 0.7)) * 0.8 + 0.2);
      g.fillStyle = "#d9dde2"; g.beginPath(); for (let i = 0; i < 20; i++) { const a = (i / 20) * 6.283, rr = i % 2 ? 8 : 10; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
      g.fillStyle = "#b3001b"; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
      g.restore();
    }
    this.p.dibujar(g);
    this.dibujarMontana(g, L, t);
    // la mano con el pulgar arriba asoma por encima de la espuma
    if (t > 6.85 && t < 9.2) {
      const q = aPant(e.m, e.pose.manoD), k = eBack(tramo(t, 6.85, 7.05));
      g.save(); g.translate(q[0], q[1] + 10); g.scale(k, k); this.dibujarPulgar(g, 0, -8, t); g.restore();
    }
    // burbujas que suben
    for (const B of this.burbujas) {
      g.globalAlpha = Math.min(1, B.vida * 2) * luz;
      g.drawImage(SPR.espuma, B.x - B.r, B.y - B.r, B.r * 2, B.r * 2);
    }
    g.globalAlpha = 1;
    // ¡QUE NO PARA!
    if (t > 2.9 && t < 6.95) {
      const k = tramo(t, 2.9, 3.15), a = 1 - tramo(t, 6.55, 6.95);
      const s = eBack(k) * (1 + 0.03 * Math.sin(t * 7));
      g.save(); g.translate(W / 2, 108); g.rotate(-0.03 + 0.02 * Math.sin(t * 3)); g.scale(s, s);
      txt(g, "¡QUE NO PARA!", 0, 0, { tam: 104, peso: 400, fam: FB, color: "#fffdf4", borde: "#b8892b", bordeAncho: 12, alfa: a, esp: 3, max: 940 });
      g.restore();
    }
    const negro = Math.max(t < 0.7 ? 0.97 * (1 - luz) : 0, tramo(t, 10.0, 10.55));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00007", nombre: "Espuma que no para", crear: () => new EscenaEspuma() });
})();
