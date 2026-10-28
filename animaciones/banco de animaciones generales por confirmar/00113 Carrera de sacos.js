"use strict";
/*
 * 00113 · CARRERA DE SACOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo, metidos en sacos de lúpulo, saltan cada uno por su calle hacia la meta: se adelantan por
 * turnos, Rodrigo se tambalea y casi se cae… y llegan a la vez estirando el cuello todo lo que pueden. La cámara de
 * la meta dispara el flash, la imagen se congela y sale la foto de llegada en blanco y negro: ¡FOTO FINISH!
 */
(() => {
const DUR = 10.6, T_YA = 0.75, T_FOTO = 6.0, META = 772;
const CALLE = [{ y: 352, esc: 0.98 }, { y: 592, esc: 1.25 }];
const XG = [[T_YA, 110], [2.4, 320], [3.5, 455], [4.9, 610], [T_FOTO, META]];
const XR = [[T_YA, 110], [2.4, 300], [3.2, 372], [3.9, 400], [4.9, 596], [T_FOTO, META]];
const SALTO = [0.46, 0.41];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || ((v) => v))(u)); }
  return k[k.length - 1][1];
}
/** Saco de lúpulo, en unidades de avatar (`top`: borde de arriba). */
function saco(g, top, t) {
  const bot = 238;
  g.save();
  g.beginPath();
  g.moveTo(-3, top - 2); g.quadraticCurveTo(39, top + 7, 81, top - 2);
  g.lineTo(78, bot - 14); g.quadraticCurveTo(77, bot + 1, 39, bot + 1); g.quadraticCurveTo(1, bot + 1, 0, bot - 14); g.closePath();
  const gr = g.createLinearGradient(-3, 0, 81, 0);
  gr.addColorStop(0, "#6e4d26"); gr.addColorStop(0.35, "#c9a467"); gr.addColorStop(0.6, "#b48d52"); gr.addColorStop(1, "#5e4120");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.strokeStyle = "rgba(70,45,15,.28)"; g.lineWidth = 0.8;
  for (let x = -6; x < 86; x += 3.2) { g.beginPath(); g.moveTo(x, top - 4); g.lineTo(x + 3, bot + 2); g.stroke(); }
  for (let y = top; y < bot; y += 3.2) { g.beginPath(); g.moveTo(-4, y); g.lineTo(84, y + 1.5); g.stroke(); }
  // dobladillo
  g.fillStyle = "rgba(60,38,12,.45)"; g.fillRect(-4, top - 3, 90, 9);
  // lúpulo estampado
  g.translate(39, top + 46);
  g.fillStyle = "#2f7d32";
  g.beginPath(); g.moveTo(0, -20); g.quadraticCurveTo(15, -8, 0, 20); g.quadraticCurveTo(-15, -8, 0, -20); g.fill();
  g.strokeStyle = "#a7e08f"; g.lineWidth = 1.1;
  for (let r = -12; r <= 12; r += 6) { g.beginPath(); g.moveTo(-9 + Math.abs(r) * 0.25, r); g.quadraticCurveTo(0, r + 5, 9 - Math.abs(r) * 0.25, r); g.stroke(); }
  g.fillStyle = "#3f9a3a"; g.beginPath(); g.ellipse(9, -20, 7, 3.2, -0.5, 0, 6.283); g.fill();
  txt(g, "LÚPULO", 0, 33, { tam: 9, peso: 900, fam: FD, color: "#3b2a12", esp: 0.8 });
  g.restore();
  g.restore();
}

class CarreraSacos extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.cache = cacheTexto();
    this.foto = null; this.flash = 0;
  }
  estado(t) {
    const res = [];
    for (let i = 0; i < 2; i++) {
      const C = CALLE[i], q = i ? "rodrigo" : undefined, R = avatar(q).rig, s = i ? -1 : 1;
      const x = pista(Math.min(t, T_FOTO), i ? XR : XG);
      const pose = { quien: q, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
      const top = R.caderaI[1] - 12;
      pose.manoI = [7, top + 5]; pose.manoD = [71, top + 5];
      let y = C.y, sx = 1, sy = 1, giro = 0;
      if (t < T_YA) { pose.cara = "guino"; pose.rc = s * 0.1 * tramo(t, 0.2, 0.5); }
      else if (t < T_FOTO + 0.01) {
        const f = ((t - T_YA) / SALTO[i] + (i ? 0.35 : 0)) % 1;
        const aire = f < 0.68 ? Math.sin(Math.PI * f / 0.68) : 0;
        y -= aire * 54 * C.esc;
        if (f < 0.68) { sy = 1 + 0.06 * Math.sin(Math.PI * f / 0.68); sx = 1 - 0.03 * aire; pose.cara = "sorpresa"; }
        else { const k = Math.sin(Math.PI * (f - 0.68) / 0.32); sy = 1 - 0.12 * k; sx = 1 + 0.07 * k; pose.cara = "dormido"; }
        pose.manoI = [7, top + 5 - 6 * aire]; pose.manoD = [71, top + 5 - 6 * aire];
        giro = 0.06;
        // se miran de reojo
        if ((i === 0 && t > 2.5 && t < 3.0) || (i === 1 && t > 4.2 && t < 4.7)) { pose.rc = -s * 0.14; pose.cara = "guino"; }
        // Rodrigo se tambalea
        if (i === 1 && t > 3.15 && t < 3.95) { const k = Math.sin(Math.PI * tramo(t, 3.15, 3.95)); giro = 0.06 + 0.3 * Math.sin(t * 16) * k; pose.cara = "sorpresa"; pose.manoD = [96, 90]; pose.manoI = [-18, 90]; }
        // el último esfuerzo: estiran el cuello
        if (t > 5.4) { pose.cara = i ? "sorpresa" : "dormido"; giro = 0.06 + 0.1 * tramo(t, 5.4, 5.8); }
      }
      if (t >= T_FOTO) { pose.cara = i ? "sorpresa" : "dormido"; }
      const k = eOut(tramo(t, 5.4, 5.85));
      const m = matAv(x, y, C.esc, giro, sx, sy);
      pose.objI = (g) => saco(g, top, t);
      res.push({ pose, m, x, cuello: k, corte: R.barbilla + 2, cx: R.cuello[0], aire: y < C.y - 2 });
    }
    return res;
  }
  /** El avatar con el cuello estirado (k 0–1): cuerpo, cuello de piel y la cabeza desplazada. */
  pintar(g, e, t) {
    if (e.cuello < 0.01) { pintarAvatar(g, e.m, e.pose, t); return; }
    const dx = 15 * e.cuello, dy = 26 * e.cuello, Y = e.corte, cx = e.cx, w = 7.5;
    conMat(g, e.m, () => {
      g.imageSmoothingQuality = "high";
      g.save(); g.beginPath(); g.rect(-300, Y, 700, 500); g.clip(); dibujarAvatar(g, e.pose, t); g.restore();
      const gr = g.createLinearGradient(cx - w, 0, cx + w, 0);
      gr.addColorStop(0, "#c98a68"); gr.addColorStop(0.45, "#f2c6a6"); gr.addColorStop(1, "#c4805e");
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(cx - w, Y + 3); g.quadraticCurveTo(cx - w + dx * 0.2, Y - dy * 0.5, cx + dx - w, Y - dy - 4);
      g.lineTo(cx + dx + w, Y - dy - 4); g.quadraticCurveTo(cx + w + dx * 0.6, Y - dy * 0.5, cx + w, Y + 3); g.closePath(); g.fill();
      g.strokeStyle = "rgba(120,60,40,.35)"; g.lineWidth = 0.8;
      for (let k = 1; k < 4; k++) { const u = k / 4; g.beginPath(); g.moveTo(cx - w * 0.6 + dx * u, Y - dy * u); g.lineTo(cx + w * 0.4 + dx * u, Y - dy * u - 1); g.stroke(); }
      g.save(); g.translate(dx, -dy); g.beginPath(); g.rect(-300, -300, 700, Y + 300); g.clip(); dibujarAvatar(g, e.pose, t); g.restore();
    });
  }
  escena(g, t, e) {
    g.drawImage(this.escenario(), 0, 0);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3; g.drawImage(BLOB2.oroClaro, 60, 40, 904, 560); g.restore();
    this.camaraMeta(g, t);
    this.pintar(g, e[0], t);
    this.pintar(g, e[1], t);
  }
  escenario() {
    if (this.cache.has("f")) return this.cache.get("f");
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    // cielo de verbena con banderines
    const gc = g.createLinearGradient(0, 0, 0, 300);
    gc.addColorStop(0, "#0a0c1a"); gc.addColorStop(1, "#2a1a24");
    g.fillStyle = gc; g.fillRect(0, 0, W, 300);
    for (let f = 0; f < 2; f++) {
      g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1.5; g.beginPath();
      const y0 = 26 + f * 52;
      for (let x = 0; x <= W; x += 16) g.lineTo(x, y0 + 26 * Math.sin((x / W) * Math.PI));
      g.stroke();
      for (let x = 20 + f * 30; x < W; x += 60) {
        const y = y0 + 26 * Math.sin((x / W) * Math.PI);
        g.fillStyle = CONFETI[(x / 60 + f) % 5 | 0]; g.globalAlpha = 0.75;
        g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x + 12, y); g.lineTo(x, y + 24); g.closePath(); g.fill(); g.globalAlpha = 1;
      }
    }
    // césped y calles
    const gs = g.createLinearGradient(0, 300, 0, H);
    gs.addColorStop(0, "#21441a"); gs.addColorStop(1, "#0d1f0a");
    g.fillStyle = gs; g.fillRect(0, 300, W, H - 300);
    g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(0, 318, W, 3); g.fillRect(0, 404, W, 4);
    g.fillStyle = "rgba(255,255,255,.08)";
    for (let i = 0; i < 160; i++) g.fillRect((i * 97) % W, 310 + ((i * 53) % 290), 2, 5);
    // salida y meta
    g.fillStyle = "rgba(255,255,255,.7)";
    g.beginPath(); g.moveTo(166, 300); g.lineTo(172, 300); g.lineTo(184, H); g.lineTo(176, H); g.closePath(); g.fill();
    for (let r = 0; r < 12; r++) {
      const y0 = 300 + r * 25, y1 = y0 + 25, k0 = (y0 - 300) / 300, k1 = (y1 - 300) / 300;
      for (let col = 0; col < 2; col++) {
        const w0 = 12 + 14 * k0, w1 = 12 + 14 * k1, x0 = META + 28 + 16 * k0, x1 = META + 28 + 16 * k1;
        g.fillStyle = (r + col) % 2 ? "#111" : "#f4f4f0";
        g.beginPath(); g.moveTo(x0 + col * w0, y0); g.lineTo(x0 + (col + 1) * w0, y0); g.lineTo(x1 + (col + 1) * w1, y1); g.lineTo(x1 + col * w1, y1); g.closePath(); g.fill();
      }
    }
    this.cache.set("f", c);
    return c;
  }
  camaraMeta(g, t) {
    const x = META + 40, y = 120;
    g.fillStyle = "#3a3f46"; g.fillRect(x - 3, y, 6, 318 - y);
    g.fillStyle = "#1b1d21"; rectR(g, x - 26, y - 34, 52, 34, 6); g.fill();
    g.fillStyle = "#3a3f46"; g.beginPath(); g.arc(x - 6, y - 17, 11, 0, 6.283); g.fill();
    g.fillStyle = "#0b0c0e"; g.beginPath(); g.arc(x - 6, y - 17, 7, 0, 6.283); g.fill();
    g.fillStyle = "rgba(160,200,255,.6)"; g.beginPath(); g.arc(x - 8, y - 19, 2.5, 0, 6.283); g.fill();
    g.fillStyle = "#e9edf1"; g.fillRect(x + 8, y - 40, 14, 7);
    const rec = t < T_FOTO && Math.sin(t * 8) > 0;
    g.fillStyle = rec ? "#ff3030" : "#4a1010"; g.beginPath(); g.arc(x + 16, y - 26, 3, 0, 6.283); g.fill();
  }
  hacerFoto(e, t) {
    const S = 0.7, c = lienzoNuevo(W * S, H * S), x = c.getContext("2d");
    x.scale(S, S);
    this.escena(x, t, e);
    x.setTransform(1, 0, 0, 1, 0, 0);
    const b = lienzoNuevo(W * S, H * S), y = b.getContext("2d");
    if ("filter" in y) { y.filter = "grayscale(1) contrast(1.3) brightness(1.4)"; y.drawImage(c, 0, 0); y.filter = "none"; }
    else {
      y.drawImage(c, 0, 0);
      const d = y.getImageData(0, 0, b.width, b.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const v = clamp((0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2] * 1.4 - 128) * 1.3 + 150, 0, 255); p[i] = p[i + 1] = p[i + 2] = v; }
      y.putImageData(d, 0, 0);
    }
    // grano y viñeta
    const r = semilla(113);
    y.fillStyle = "rgba(255,255,255,.07)";
    for (let i = 0; i < 1400; i++) y.fillRect(r() * b.width, r() * b.height, 1.5, 1.5);
    y.fillStyle = "rgba(0,0,0,.08)";
    for (let i = 0; i < 1400; i++) y.fillRect(r() * b.width, r() * b.height, 1.5, 1.5);
    const v = y.createRadialGradient(b.width / 2, b.height / 2, b.height * 0.3, b.width / 2, b.height / 2, b.width * 0.62);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.55)");
    y.fillStyle = v; y.fillRect(0, 0, b.width, b.height);
    // la raya roja de la foto finish
    y.fillStyle = "rgba(255,40,40,.85)"; y.fillRect((META + 44) * S - 1.5, 0, 3, b.height);
    return b;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("ya", t > T_YA, () => temblar(8, 0.2));
    const e = this.estado(Math.min(t, T_FOTO));
    for (let i = 0; i < 2; i++) {
      const aire = e[i].aire;
      if (this["aire" + i] && !aire && t < T_FOTO) { for (let k = 0; k < 5; k++) p.nueva(P.POLVO, e[i].x + azar(-30, 30), CALLE[i].y - 3, azar(-130, 80), azar(-40, -5), azar(0.4, 0.7), azar(16, 28) * CALLE[i].esc); }
      this["aire" + i] = aire;
    }
    this.una("foto", t > T_FOTO, () => { this.flash = 1; temblar(10, 0.2); });
    this.flash = Math.max(0, this.flash - dt * 2.2);
    p.actualizar(dt);
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 135);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡FOTO FINISH!", 500, 130, { tam: 120, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,170,30,.85)", glowTam: 24, max: 960 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t;
    fondo(g, "#000");
    if (t < T_FOTO) {
      const e = this.estado(t);
      this.escena(g, t, e);
      this.p.dibujar(g);
      if (t > T_YA - 0.05 && t < T_YA + 0.7) {
        const k = eBack(tramo(t, T_YA - 0.05, T_YA + 0.1));
        g.save(); g.translate(512, 200); g.scale(k, k); g.rotate(-0.06);
        txt(g, "¡YA!", 0, 0, { tam: 80, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 10, alfa: 1 - tramo(t, T_YA + 0.45, T_YA + 0.7), esp: 3 });
        g.restore();
      }
      if (t > 5.45) { // ¡estira!
        const a = tramo(t, 5.45, 5.6);
        txt(g, "¡¡ESTIRA!!", 512, 120, { tam: 64, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 9, alfa: a, esp: 3 });
      }
    } else {
      if (!this.foto) this.foto = this.hacerFoto(this.estado(T_FOTO), T_FOTO);
      // la foto se separa de la pantalla y se queda enmarcada
      const d = t - T_FOTO, k = eOut(tramo(d, 0.15, 0.75));
      const esc = lerp(1, 0.66, k), rot = lerp(0, -0.035, k), cy = lerp(300, 352, k);
      const zoom = lerp(1, 1.45, eInOut(tramo(d, 0.2, 1.4))) * lerp(1, 1.1, tramo(d, 1.4, 4.4));
      const F = this.foto, sw = F.width / zoom, sh = F.height / zoom;
      const fx = clamp((META + 10) * 0.7 - sw * 0.5, 0, F.width - sw), fy = clamp(212 * 0.7 - sh * 0.5, 0, F.height - sh);
      g.save(); g.translate(512, cy); g.rotate(rot); g.scale(esc, esc);
      if (k > 0) {
        g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 30 * k; g.shadowOffsetY = 10 * k;
        g.fillStyle = "#f4f0e6"; g.fillRect(-W / 2 - 26 * k, -H / 2 - 26 * k, W + 52 * k, H + 52 * k + 40 * k);
        g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
      }
      g.drawImage(F, fx, fy, sw, sh, -W / 2, -H / 2, W, H);
      if (k > 0.5) txt(g, "LLEGADA · " + fmt(T_FOTO) + " s · " + fmt(T_FOTO) + " s", 0, H / 2 + 46, { tam: 30, peso: 800, color: "#3a3a3a", alfa: tramo(k, 0.5, 1), esp: 2 });
      g.restore();
      // título
      const kt = tramo(d, 0.55, 0.71), s = lerp(2.6, 1, eIn(kt)) * (1 + 0.025 * Math.sin(d * 7));
      if (d > 0.55) {
        const spr = this.titulo();
        g.save(); g.globalAlpha = Math.min(1, kt * 3); g.translate(512, 72); g.rotate(-0.03); g.scale(s, s);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,255,${this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, DUR - 0.55, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00113", nombre: "Carrera de sacos", crear: () => new CarreraSacos() });
})();
