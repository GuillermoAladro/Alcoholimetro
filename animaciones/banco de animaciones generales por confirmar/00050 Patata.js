"use strict";
/*
 * 00050 · PATATA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre el obturador de una cámara. Saca el móvil y se hace un selfie: cuenta atrás 3, 2, 1, grita ¡PATATA! y el
 * flash lo ciega (pantalla blanca y estrellitas). El móvil escupe una polaroid que se revela poco a poco: ha salido
 * con los ojos cerrados. Se da una palmada en la frente, levanta el móvil para repetirla y se cierra el obturador.
 */
(() => {
/** Obturador de cámara: negro con un hueco hexagonal de radio r (r = 0, todo negro). */
function obturador(g, cx, cy, r, giro) {
  if (r > 1300) return;
  const v = [];
  for (let i = 0; i < 6; i++) { const a = giro + (i * Math.PI) / 3; v.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  g.save();
  g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
  if (r > 0.5) { g.moveTo(v[0][0], v[0][1]); for (let i = 5; i >= 1; i--) g.lineTo(v[i][0], v[i][1]); g.closePath(); }
  g.fillStyle = "#060607"; g.fill("evenodd");
  if (r > 0.5) {
    // bordes de las láminas
    g.strokeStyle = "rgba(80,82,90,.9)"; g.lineWidth = 2;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = v[i], b = v[(i + 1) % 6], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      g.moveTo(b[0], b[1]); g.lineTo(b[0] + (dx / L) * 1500, b[1] + (dy / L) * 1500);
    }
    g.stroke();
  }
  g.restore();
}

/** Móvil visto por detrás (la pantalla mira a Guillermo). Unidades de avatar; (x, y) = donde lo agarra la mano. */
function dibujarMovil(g, x, y, ang, led) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const w = 19, h = 34, x0 = -w / 2, y0 = -h + 9;
  const gr = g.createLinearGradient(x0, 0, x0 + w, 0);
  gr.addColorStop(0, "#1a1d24"); gr.addColorStop(0.45, "#3a404c"); gr.addColorStop(1, "#111318");
  rectR(g, x0, y0, w, h, 3.6); g.fillStyle = gr; g.fill();
  g.strokeStyle = "#8a93a3"; g.lineWidth = 0.9; g.stroke();
  // módulo de cámaras
  rectR(g, x0 + 2, y0 + 2, 9, 11, 2.4); g.fillStyle = "#23262e"; g.fill();
  g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 0.6; g.stroke();
  for (const [cx, cy] of [[x0 + 4.6, y0 + 4.8], [x0 + 4.6, y0 + 10]]) {
    g.fillStyle = "#06070a"; g.beginPath(); g.arc(cx, cy, 1.9, 0, 6.283); g.fill();
    g.fillStyle = "rgba(120,170,255,.6)"; g.beginPath(); g.arc(cx - 0.5, cy - 0.5, 0.6, 0, 6.283); g.fill();
  }
  // luz del flash
  g.fillStyle = led > 0.5 ? "#fffbe6" : led > 0 ? "#ff4a4a" : "#bfa77a";
  g.beginPath(); g.arc(x0 + 8.6, y0 + 7.4, 1.1, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(x0 + w - 4, y0 + 3, 1.2, h - 6);
  g.restore();
}

class EscenaPatata extends Escena {
  constructor() {
    super(8.8);
    this.p = new Parts(220);
    this.X = 340; this.ESC = 1.55;
    this.foto = null; this.flash = 0;
    const esq = { cara: "#fffdf5", lado: "#7d8590", borde: "#000" };
    this.nums = ["3", "2", "1"].map((s) => sprite3D(s, 250, esq));
    this.FOTO = [742, 292];
  }
  /** Pose de la mano del móvil y de la cara. */
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const SELFIE = [117, 40], PECHO = [74, 126], CADERA = [-5, 142];
    let manoD = [70, 158], manoI = [9, 160], sy = 1, x = this.X;
    // saca el móvil del bolsillo y lo sube para el selfie
    manoD = mezcla(manoD, PECHO, eInOut(tramo(t, 0.55, 0.95)));
    manoD = mezcla(manoD, SELFIE, eInOut(tramo(t, 1.05, 1.45)));
    manoI = mezcla(manoI, CADERA, eInOut(tramo(t, 1.3, 1.6)));
    // posando durante la cuenta atrás
    if (t > 1.3 && t < 3.5) {
      pose.rc = 0.13 * eInOut(tramo(t, 1.3, 1.6)) + 0.015 * Math.sin(t * 7);
      pose.cara = t < 2.15 ? "sonrisa" : t < 2.8 ? "guino" : "risa";
      if (t > 2.8) sy = 1 + 0.015 * Math.sin(t * 30);
    }
    // ¡flash! deslumbrado, con estrellitas
    if (t >= 3.5 && t < 4.6) {
      pose.cara = t < 3.62 ? "dormido" : "borracho";
      pose.rc = 0.09 * Math.sin(t * 6.5);
      manoI = mezcla(CADERA, [9, 160], eInOut(tramo(t, 3.6, 3.9)));
    }
    // baja el móvil y mira la foto que se revela
    if (t >= 4.3) manoD = mezcla(SELFIE, PECHO, eInOut(tramo(t, 4.3, 4.7)));
    if (t >= 4.6 && t < 6.15) { pose.cara = "sonrisa"; pose.rc = 0.15 * eInOut(tramo(t, 4.6, 4.95)); }
    if (t >= 4.6) manoI = [9, 160];
    // ¡ha salido con los ojos cerrados!
    if (t >= 6.15 && t < 6.6) { pose.cara = "sorpresa"; pose.rc = 0.15 + 0.03 * Math.sin(t * 45); x += 2 * Math.sin(t * 50); }
    // palmada en la frente
    if (t >= 6.55 && t < 7.55) {
      const k = eOut(tramo(t, 6.55, 6.72)) * (1 - eInOut(tramo(t, 7.3, 7.55)));
      manoI = mezcla([9, 160], [33, 31], k);
      pose.brazoIDelante = true;
      pose.cara = "dormido"; pose.rc = lerp(0.15, -0.06, k);
      sy = 1 - 0.035 * k;
    }
    // ¡otra! vuelve a levantar el móvil
    if (t >= 7.35) {
      manoD = mezcla(PECHO, SELFIE, eInOut(tramo(t, 7.35, 7.7)));
      pose.cara = t < 7.8 ? "sonrisa" : "risa";
      pose.rc = 0.13 * eInOut(tramo(t, 7.4, 7.7));
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const led = t > 1.5 && t < 3.45 ? ((t - 1.5) % 0.65 < 0.18 ? 0.3 : 0) : t >= 3.45 && t < 3.62 ? 1 : 0;
    const angM = -0.12 + 0.1 * eInOut(tramo(t, 4.3, 4.7)) * (1 - eInOut(tramo(t, 7.35, 7.7)));
    if (t > 0.6) pose.objD = (g, m) => dibujarMovil(g, m[0] + 1, m[1] + 2, angM, led);
    const m = matAv(x, PIES, this.ESC, 0, 1, sy);
    return { pose, m, led };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado(), mov = aPant(e.m, [e.pose.manoD[0] + 1, e.pose.manoD[1] - 12]);
    this.una("flash", t > 3.5, () => {
      this.flash = 1; temblar(10, 0.3);
      for (let i = 0; i < 14; i++) { const a = azar(0, 6.283), v = azar(200, 520); p.nueva(P.CHISPA, mov[0], mov[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(8, 14)); }
    });
    // el móvil escupe la polaroid
    this.una("foto", t > 4.2, () => { this.foto = { x0: mov[0], y0: mov[1], t0: t }; temblar(4, 0.15); });
    this.una("llega", t > 4.75, () => {
      for (let i = 0; i < 10; i++) p.nueva(P.DESTELLO, this.FOTO[0] + azar(-150, 150), this.FOTO[1] + azar(-170, 170), 0, 0, azar(0.25, 0.45), azar(30, 60));
    });
    this.una("pum", t > 6.68, () => temblar(8, 0.2));
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * (this.flash > 0.85 ? 0.9 : 1.9));
    p.actualizar(dt);
  }
  dibujarFoto(g, t) {
    const F = this.foto;
    if (!F) return;
    const u = tramo(t, F.t0, F.t0 + 0.55), k = eOut(u);
    const x = lerp(F.x0, this.FOTO[0], k), y = lerp(F.y0, this.FOTO[1], k) - 120 * Math.sin(Math.PI * u);
    const s = lerp(0.12, 1, k);
    const dt0 = Math.max(0, t - F.t0 - 0.55);
    const rot = u < 1 ? (1 - k) * 6.6 - 0.07 : -0.07 + 0.12 * Math.sin(dt0 * 9) * Math.exp(-dt0 * 4);
    const w = 290 * s;
    const foto = fotoDe("dormido");
    const rev = eInOut(tramo(t, 4.85, 6.15));
    g.save();
    g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 18 * s; g.shadowOffsetY = 8 * s;
    g.fillStyle = "#000"; g.translate(x, y); g.rotate(rot);
    const mm = w * 0.06, fw = w - 2 * mm, h = mm + fw + w * 0.2;
    g.fillRect(-w / 2, -h / 2, w, h);
    g.restore();
    polaroid(g, foto, x, y, w, rot, (c, x0, y0, ww, hh) => {
      txt(c, "¡PATATA!", x0 + ww / 2, y0 + hh * 0.72, { tam: Math.max(4, 36 * s), peso: 400, fam: FB, color: "#1f3f9a", alfa: tramo(t, 5.4, 5.9) });
    });
    // la foto se revela poco a poco
    if (rev < 1) {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.fillStyle = `rgba(38,34,30,${1 - rev})`; g.fillRect(-w / 2 + mm, -h / 2 + mm, fw, fw);
      g.restore();
    }
    // brillo en el cristal
    if (rev > 0.98 && t < 6.6) brillo(g, x + 95, y - 120, 26, 1 - tramo(t, 6.2, 6.6));
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // un poco de luz de estudio
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.16;
    g.drawImage(BLOB.blanco, this.X - 330, PIES - 470, 660, 560); g.restore();
    g.save(); g.globalAlpha = 0.5; g.drawImage(BLOB.humo, this.X - 150, PIES - 22, 300, 40); g.restore();
    // cuenta atrás
    for (let i = 0; i < 3; i++) {
      const t0 = 1.5 + i * 0.65, k = tramo(t, t0, t0 + 0.16), a = Math.min(1, k * 3) * (1 - tramo(t, t0 + 0.5, t0 + 0.64));
      if (a <= 0) continue;
      const s = lerp(1.8, 1, eOut(k)) * (1 + 0.04 * Math.sin(t * 9)), sp = this.nums[i];
      g.save(); g.globalAlpha = a; g.translate(this.FOTO[0], 300); g.scale(s, s);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2);
      g.restore();
      txt(g, "¡FOTO!", this.FOTO[0], 125, { tam: 30, peso: 800, color: "#2bff5b", esp: 6, alfa: a * (i === 0 ? 1 : 0) });
    }
    this.dibujarFoto(g, t);
    pintarAvatar(g, e.m, e.pose, t);
    // estrellitas del deslumbrón
    if (t > 3.6 && t < 4.75) {
      const a = Math.min(1, tramo(t, 3.6, 3.8)) * (1 - tramo(t, 4.5, 4.75)), c = aPant(e.m, [39, 12]);
      for (let i = 0; i < 4; i++) {
        const ang = t * 6 + (i * Math.PI) / 2, x = c[0] + Math.cos(ang) * 62, y = c[1] + Math.sin(ang) * 15;
        g.save(); g.globalAlpha = a; estrella(g, x, y, 13, 5.5, t * 4 + i);
        g.fillStyle = "#ffd34d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#7a4d00"; g.stroke(); g.restore();
      }
    }
    // luz del flash en el móvil
    if (e.led > 0.5 || this.flash > 0.6) {
      const q = aPant(e.m, [e.pose.manoD[0] - 3, e.pose.manoD[1] - 21]);
      g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(BLOB.blanco, q[0] - 90, q[1] - 90, 180, 180); g.restore();
    }
    this.p.dibujar(g);
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,250,${Math.min(1, this.flash * 1.15)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // ¡PATATA!
    if (t > 3.22 && t < 4.75) {
      const k = tramo(t, 3.22, 3.4), a = 1 - tramo(t, 4.45, 4.75);
      const b = aPant(e.m, boca(e.pose.rc));
      const x = lerp(b[0] + 40, 560, eOut(k)), y = lerp(b[1], 130, eOut(k));
      g.save(); g.translate(x + (t < 3.7 ? azar(-3, 3) : 0), y); g.rotate(-0.06); g.scale(lerp(0.2, 1, eBack(k)), lerp(0.2, 1, eBack(k)));
      txt(g, "¡PATATA!", 0, 0, { tam: 128, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 11, esp: 3, alfa: a });
      g.restore();
    }
    // obturador: se abre al empezar y se cierra al final
    const r = t < 2 ? lerp(0, 1350, eIn(tramo(t, 0.08, 0.6))) : lerp(1350, 0, eOut(tramo(t, 7.85, 8.4)));
    obturador(g, this.X + 25, 300, r, t < 2 ? tramo(t, 0.08, 0.6) * 0.9 : 0.9 - tramo(t, 7.85, 8.4) * 0.9);
    if (t > 8.35 && t < 8.6) txt(g, "CLIC", W / 2, 312, { tam: 30, peso: 400, fam: FC, color: "#8a8f99", esp: 4, alfa: 1 - tramo(t, 8.45, 8.6) });
  }
}

registrar({ id: "00050", nombre: "Patata", crear: () => new EscenaPatata() });
})();
