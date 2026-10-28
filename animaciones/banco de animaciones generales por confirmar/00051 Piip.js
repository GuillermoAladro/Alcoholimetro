"use strict";
/*
 * 00051 · PIIP
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un lector de tarjetas en su pie y entra andando. Saca una tarjeta dorada que brilla, la acerca despacio
 * al lector y… ¡PIIIP! (tan fuerte que se le pone el pelo de punta): chispas verdes, la pantalla se pone en verde y se
 * ilumina el neón PAGO ACEPTADO. Lo celebra y señala con una flecha el lector de verdad, arriba a la derecha.
 */
(() => {
const CT = cacheTexto();
/** Tarjeta dorada (unidades de avatar), centrada en (x, y). */
function dibujarTarjeta(g, x, y, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.3, 1.3);
  const w = 25, h = 16;
  const gr = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  gr.addColorStop(0, "#8a5a00"); gr.addColorStop(0.3, "#f3c03a"); gr.addColorStop(0.5, "#fff3b0"); gr.addColorStop(0.7, "#e7a900"); gr.addColorStop(1, "#7a4d00");
  rectR(g, -w / 2, -h / 2, w, h, 2); g.fillStyle = gr; g.fill();
  g.strokeStyle = "#5a3a00"; g.lineWidth = 0.7; g.stroke();
  // chip
  rectR(g, -w / 2 + 3, -2.6, 5, 4, 0.8); g.fillStyle = "#d8cf9a"; g.fill();
  g.strokeStyle = "rgba(90,70,0,.6)"; g.lineWidth = 0.4;
  g.beginPath(); g.moveTo(-w / 2 + 3, -0.6); g.lineTo(-w / 2 + 8, -0.6); g.moveTo(-w / 2 + 5.5, -2.6); g.lineTo(-w / 2 + 5.5, 1.4); g.stroke();
  // estrella y números
  g.fillStyle = "#fffbe0"; estrella(g, w / 2 - 4.5, -h / 2 + 4, 2.4, 1, 0); g.fill();
  g.fillStyle = "rgba(90,58,0,.75)";
  for (let i = 0; i < 4; i++) g.fillRect(-w / 2 + 3 + i * 4.8, 4, 3.6, 1.3);
  // reflejo que pasa
  const rx = ((t * 0.9) % 1.6) * 40 - 25;
  g.save(); rectR(g, -w / 2, -h / 2, w, h, 2); g.clip();
  g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.moveTo(rx, -h); g.lineTo(rx + 4, -h); g.lineTo(rx - 4, h); g.lineTo(rx - 8, h); g.fill();
  g.restore();
  g.restore();
}

/** El cartel de neón PAGO ACEPTADO, pintado una vez (520 × 160; centro en 260, 80). */
function neon() {
  if (CT.has("neon")) return CT.get("neon");
  const c = lienzoNuevo(520, 160), g = c.getContext("2d");
  g.strokeStyle = "rgba(43,255,91,.55)"; g.lineWidth = 3; rectR(g, 25, 26, 470, 108, 24);
  g.shadowColor = "#2bff5b"; g.shadowBlur = 18; g.stroke(); g.shadowBlur = 0;
  txt(g, "PAGO ACEPTADO", 260, 104, { tam: 70, peso: 900, fam: FD, color: "#d8ffe0", glow: "#2bff5b", glowTam: 24, esp: 4, max: 440 });
  CT.set("neon", c);
  return c;
}

class EscenaPiip extends Escena {
  constructor() {
    super(8.9);
    this.p = new Parts(260);
    this.verdes = [];
    this.ESC = 1.55; this.x = -120; this.fase = 0;
    this.L = [632, 318]; // centro del lector
    this.pagado = -1;
  }
  xAndar(t) { return t < 0.35 ? -120 : lerp(-120, 455, eOut(tramo(t, 0.35, 1.75))); }
  luz() { const t = this.t; const on = t < 0.6 ? [0, 1, 0, 0.4, 1, 0.6][Math.min(5, Math.floor(t / 0.1))] : 1; return on * (1 - tramo(t, 7.8, 8.6)); }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], bote = 0, sy = 1;
    if (t < 1.75) { const a = andar(this.fase, 0.9 * (1 - tramo(t, 1.45, 1.75))); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    // saca la tarjeta del bolsillo de atrás y la enseña en alto
    const kBolsillo = eInOut(tramo(t, 1.7, 1.95)) * (1 - eInOut(tramo(t, 2.0, 2.3)));
    manoD = mezcla(manoD, [56, 150], kBolsillo);
    const kAlto = eInOut(tramo(t, 2.0, 2.3)) * (1 - eInOut(tramo(t, 2.85, 3.1)));
    manoD = mezcla(manoD, [96, 34], kAlto);
    if (t > 2.05 && t < 2.95) { pose.cara = "guino"; pose.rc = 0.08; }
    // la acerca despacito al lector
    const D = this.dest();
    const kAcerca = eInOut(tramo(t, 2.85, 3.75));
    if (t >= 2.85) manoD = mezcla(mezcla([96, 34], [84, 110], eInOut(tramo(t, 2.85, 3.2))), D, kAcerca);
    if (t > 3.1 && t < 3.75) { pose.cara = "sonrisa"; pose.rc = -0.05 + 0.08 * kAcerca; }
    // ¡PIIIP! del susto se le pone el pelo de punta
    if (t >= 3.75 && t < 4.3) {
      pose.cara = "sorpresa"; pose.puntas = eBack(tramo(t, 3.75, 3.9)) * (1 - tramo(t, 4.1, 4.3));
      sy = 1 + 0.05 * Math.sin(tramo(t, 3.75, 4.0) * Math.PI);
      manoI = [-6, 128];
    }
    // lo celebra
    if (t >= 4.3 && t < 5.6) {
      pose.cara = "risa";
      const k = eInOut(tramo(t, 4.3, 4.55));
      manoD = mezcla(D, [92, 60], k);
      manoI = mezcla([-6, 128], [-14, 18 + 6 * Math.sin(t * 12)], k);
      bote = -Math.abs(Math.sin((t - 4.3) * 7.5)) * 26 * tramo(t, 4.3, 4.45) * (1 - tramo(t, 5.2, 5.6));
    }
    // señala el lector de verdad (arriba a la derecha)
    if (t >= 5.6) {
      const k = eInOut(tramo(t, 5.6, 5.95));
      manoD = mezcla([92, 60], [118, 20 + 3 * Math.sin(t * 7)], k);
      manoI = mezcla([-14, 24], [9, 160], k);
      pose.cara = t < 6.6 ? "sonrisa" : "guino"; pose.rc = 0.08 * k;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (t > 1.85) pose.objD = (g, m, a) => dibujarTarjeta(g, m[0] + 8, m[1] - 6, -0.25 + (t > 2.85 && t < 4.3 ? 0.25 : 0), t);
    const m = matAv(this.x, PIES + bote, this.ESC, 0, 1, sy);
    return { pose, m };
  }
  /** Punto (unidades de avatar) al que va la mano para que la tarjeta toque el lector. */
  dest() {
    const x = 455, E = this.ESC;
    return [39 + (this.L[0] - 30 - x) / E - 6, 232 - (PIES - this.L[1] - 40) / E + 5];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.x = this.xAndar(t);
    if (t < 1.75) this.fase += dt * 9;
    const e = this.estado();
    if (t > 2.1 && t < 2.9 && Math.random() < 25 * dt) {
      const q = aPant(e.m, [e.pose.manoD[0] + 6, e.pose.manoD[1] - 5]);
      p.nueva(P.PURPURINA, q[0] + azar(-40, 40), q[1] + azar(-40, 30), 0, azar(-30, 30), azar(0.5, 0.9), azar(7, 13));
    }
    this.una("brillo", t > 2.3, () => { const q = aPant(e.m, [e.pose.manoD[0] + 6, e.pose.manoD[1] - 5]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 110); });
    this.una("piip", t > 3.75, () => {
      this.pagado = t; temblar(16, 0.45);
      const c = [this.L[0] - 10, this.L[1] + 40];
      for (let i = 0; i < 70; i++) { const a = azar(0, 6.283), v = azar(150, 650); this.verdes.push({ x: c[0], y: c[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, v: azar(0.4, 1.0), vm: 1, s: azar(10, 22) }); }
      for (const s of this.verdes) s.vm = s.v;
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.35, 260);
    });
    this.una("cartel", t > 4.05, () => temblar(8, 0.25));
    for (const s of this.verdes) { s.v -= dt; s.vy += 900 * dt; s.vx *= 1 - 1.5 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
    this.verdes = this.verdes.filter((s) => s.v > 0);
    p.actualizar(dt);
  }
  dibujarLector(g, a, t) {
    if (a <= 0) return;
    const [cx, cy] = this.L, pag = this.pagado > 0 ? t - this.pagado : -1;
    g.save(); g.globalAlpha = a;
    // halo de luz
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a * (pag > 0 ? 0.55 : 0.28);
    g.drawImage(pag > 0 ? BLOB.verde : BLOB2.cian, cx - 210, cy - 230, 420, 460); g.restore();
    // pie
    const gp = g.createLinearGradient(cx - 10, 0, cx + 10, 0);
    gp.addColorStop(0, "#2a2d33"); gp.addColorStop(0.5, "#6a707b"); gp.addColorStop(1, "#202227");
    g.fillStyle = gp; g.fillRect(cx - 9, cy + 96, 18, PIES - cy - 100);
    g.fillStyle = "#2a2d33"; g.beginPath(); g.ellipse(cx, PIES - 4, 70, 12, 0, 0, 6.283); g.fill();
    g.fillStyle = "#4a4f59"; g.beginPath(); g.ellipse(cx, PIES - 8, 66, 9, 0, 0, 6.283); g.fill();
    // cuerpo
    const gc = g.createLinearGradient(cx - 66, 0, cx + 66, 0);
    gc.addColorStop(0, "#191b20"); gc.addColorStop(0.4, "#353a44"); gc.addColorStop(1, "#121317");
    rectR(g, cx - 66, cy - 108, 132, 212, 22); g.fillStyle = gc; g.fill();
    g.strokeStyle = "#5c6370"; g.lineWidth = 2.5; g.stroke();
    // luces de estado
    for (let i = 0; i < 4; i++) {
      const on = pag > 0.05 + i * 0.07;
      g.fillStyle = on ? "#2bff5b" : "#3c414b";
      g.beginPath(); g.arc(cx - 27 + i * 18, cy - 92, 5, 0, 6.283); g.fill();
      if (on) { g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(BLOB.verde, cx - 27 + i * 18 - 16, cy - 108, 32, 32); g.restore(); }
    }
    // pantalla
    rectR(g, cx - 50, cy - 78, 100, 74, 9);
    g.fillStyle = pag > 0 ? "#2bff5b" : "#0b1726"; g.fill();
    if (pag > 0) {
      const k = eBack(tramo(pag, 0, 0.25));
      g.save(); g.translate(cx, cy - 46); g.scale(k, k);
      g.strokeStyle = "#04140a"; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(-20, 0); g.lineTo(-6, 14); g.lineTo(22, -16); g.stroke();
      g.restore();
      txt(g, "ACEPTADO", cx, cy - 12, { tam: 14, peso: 800, color: "#04140a", esp: 1.5 });
    } else {
      txt(g, "ACERQUE", cx, cy - 46, { tam: 16, peso: 800, color: "#d6fbff", esp: 1 });
      txt(g, "LA TARJETA", cx, cy - 26, { tam: 16, peso: 800, color: "#d6fbff", esp: 1 });
      txt(g, "2,00 €", cx, cy - 9, { tam: 13, peso: 600, color: "#2fe3e8", esp: 1 });
    }
    g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 2; rectR(g, cx - 50, cy - 78, 100, 74, 9); g.stroke();
    // símbolo sin contacto, con ondas que laten
    const sx = cx - 18, sy = cy + 48;
    g.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const lat = pag > 0 ? 1 : 0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 0.9));
      g.strokeStyle = pag > 0 ? `rgba(43,255,91,${lat})` : `rgba(214,251,255,${lat})`; g.lineWidth = 5;
      g.beginPath(); g.arc(sx, sy, 10 + i * 11, -0.75, 0.75); g.stroke();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), a = this.luz(), pag = this.pagado > 0 ? t - this.pagado : -1;
    fondo(g, "#000");
    foco(g, this.L[0] - 60, this.L[0] - 40, PIES, 230, a * 0.8);
    this.dibujarLector(g, a, t);
    // cartel de neón PAGO ACEPTADO
    if (pag > 0.3) {
      const k = pag - 0.3, on = k < 0.35 ? [1, 0.2, 1, 0.4, 1, 1, 0.6][Math.min(6, Math.floor(k / 0.05))] : 1;
      const zumb = Math.sin(t * 41) > 0.985 ? 0.6 : 1;
      g.save(); g.globalAlpha = on * zumb * a;
      g.drawImage(neon(), 640 - 260, 100 - 80);
      g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    // chispas verdes
    if (this.verdes.length) {
      g.save(); g.globalCompositeOperation = "lighter";
      for (const s of this.verdes) { const k = s.v / s.vm, ss = s.s * (0.4 + 0.6 * k); g.globalAlpha = Math.min(1, k * 2) * a; g.drawImage(BLOB.verde, s.x - ss / 2, s.y - ss / 2, ss, ss); }
      g.restore();
    }
    this.p.alfa = a; this.p.dibujar(g);
    // ¡PIIIP!
    if (pag > 0 && pag < 2.2) {
      const k = tramo(pag, 0, 0.14), al = (1 - tramo(pag, 1.85, 2.2)) * a;
      g.save(); g.translate(845 + (pag < 0.5 ? azar(-4, 4) : 0), 345 + (pag < 0.5 ? azar(-4, 4) : 0)); g.rotate(-0.12);
      const s = lerp(2.6, 1, eOut(k)) * (1 + 0.04 * Math.sin(pag * 30) * (1 - tramo(pag, 0, 0.8)));
      g.scale(s, s);
      txt(g, "¡PIIIP!", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#ffffff", borde: "#0a6b2a", bordeAncho: 10, esp: 3, alfa: Math.min(1, k * 4) * al });
      g.restore();
      // ondas de sonido
      for (let i = 0; i < 3; i++) {
        const u = (pag * 1.8 + i / 3) % 1;
        if (pag > 1.4) break;
        g.save(); g.globalAlpha = (1 - u) * 0.8 * a; g.strokeStyle = "#2bff5b"; g.lineWidth = 5;
        g.beginPath(); g.arc(this.L[0] - 10, this.L[1] + 40, 60 + u * 230, -0.6, 0.6); g.stroke(); g.restore();
      }
    }
    // flecha al lector de verdad
    if (t > 5.75) {
      const k = tramo(t, 5.75, 6.05), reb = Math.sin(t * 8) * 9, al = Math.min(1, k * 3) * a;
      g.save(); g.globalAlpha = al; g.translate(948 + reb * 0.7, 72 - reb * 0.7); g.rotate(-Math.PI / 4); g.scale(eBack(k) * 1.5, eBack(k) * 1.5);
      g.shadowColor = "rgba(43,255,91,.9)"; g.shadowBlur = 20;
      g.fillStyle = "#2bff5b"; g.beginPath();
      g.moveTo(38, 0); g.lineTo(6, -28); g.lineTo(6, -11); g.lineTo(-34, -11); g.lineTo(-34, 11); g.lineTo(6, 11); g.lineTo(6, 28); g.closePath(); g.fill();
      g.restore();
      g.save(); g.globalAlpha = al; g.translate(855, 196); g.rotate(-0.05); g.scale(eBack(tramo(t, 5.9, 6.2)), eBack(tramo(t, 5.9, 6.2)));
      txt(g, "¡AHORA TÚ!", 0, 0, { tam: 56, peso: 400, fam: FC, color: "#2bff5b", borde: "#04140a", bordeAncho: 8, esp: 2 });
      g.restore();
    }
    // empieza en negro: el lector se enciende con parpadeo
    if (t < 0.6 && a < 1) { g.fillStyle = `rgba(0,0,0,${1 - a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > 7.8) { g.fillStyle = `rgba(0,0,0,${tramo(t, 7.8, 8.6)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00051", nombre: "Piip", crear: () => new EscenaPiip() });
})();
