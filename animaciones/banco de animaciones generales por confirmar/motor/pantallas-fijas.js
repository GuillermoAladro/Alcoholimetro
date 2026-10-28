"use strict";
/*
 * Pantallas fijas de Stand By y pantallas provisionales del pago
 *
 * BEBE (abre cada vuelta), TOP 10 en llamas (presenta la cuenta atrás) y Puesto (del 10 al 1: número, foto, tasa).
 * Al final, las pantallas provisionales de Processing, Analyzing y Ranking (hasta que estén descritas).
 */

// ---------------------------------------------------------------------------- BEBE (abre cada vuelta)
class EscenaBebe {
  constructor() { this.t = 0; this.dur = 7.5; this.golpe = -1; }
  static ESQUEMAS = [
    { fondo: "#000000", cara: "#2bff5b", lado: "#0b6e2a", borde: "#000000" },
    { fondo: "#2bff5b", cara: "#000000", lado: "#ffffff", borde: "#000000" },
    { fondo: "#ffffff", cara: "#17c745", lado: "#000000", borde: "#000000" },
    { fondo: "#0b3b1f", cara: "#ffffff", lado: "#2bff5b", borde: "#000000" },
    { fondo: "#000000", cara: "#ffffff", lado: "#2bff5b", borde: "#000000" },
    { fondo: "#ff2e88", cara: "#000000", lado: "#ffffff", borde: "#000000" },
  ];
  static ORDEN = [0, 1, 2, 3, 0, 4, 1, 5, 2, 0, 3, 1, 4, 2, 5, 0];
  static cache = cacheTexto();
  /** Una palabra "BEBE" ya pintada (con relieve y borde) para un esquema de color. */
  static sprite(i) {
    const m = EscenaBebe.cache;
    if (m.has(i)) return m.get(i);
    const e = EscenaBebe.ESQUEMAS[i], tam = 176, prof = 13;
    const med = lienzoNuevo(1, 1).getContext("2d");
    med.font = `900 ${tam}px ${FD}`;
    const mt = med.measureText("BEBE");
    const asc = mt.actualBoundingBoxAscent || tam * 0.72;
    const hueco = 46, pad = 10;
    const c = lienzoNuevo(mt.width + hueco, asc + prof + pad * 2), g = c.getContext("2d");
    g.font = `900 ${tam}px ${FD}`; g.textBaseline = "alphabetic"; g.textAlign = "left";
    const y = pad + asc;
    g.fillStyle = e.lado;
    for (let k = prof; k > 0; k--) g.fillText("BEBE", 4 + k * 0.8, y + k);
    g.lineJoin = "round"; g.lineWidth = 9; g.strokeStyle = e.borde; g.strokeText("BEBE", 4, y);
    g.fillStyle = e.cara; g.fillText("BEBE", 4, y);
    const r = { c, ancho: c.width, alto: c.height };
    m.set(i, r);
    return r;
  }
  actualizar(dt) {
    this.t += dt;
    const b = Math.floor(this.t / (60 / 128));
    if (b !== this.golpe) {
      this.golpe = b;
      if (b % 4 === 0) temblar(7, 0.16);
    }
  }
  dibujar(g) {
    const pulso = 60 / 128;
    const b = Math.max(0, this.golpe), tb = this.t - b * pulso;
    const p = Math.exp(-tb / 0.085); // golpe seco que se apaga enseguida
    const boom = b % 4 === 0;
    const ie = EscenaBebe.ORDEN[b % EscenaBebe.ORDEN.length];
    const e = EscenaBebe.ESQUEMAS[ie];
    fondo(g, e.fondo);
    const sp = EscenaBebe.sprite(ie);
    const escala = 1 + 0.07 * p + (boom ? 0.2 * p : 0);
    const paso = 142;
    for (let r = 0; r < 5; r++) {
      const yc = 18 + r * paso; // la primera y la última fila quedan cortadas
      const crece = (r + b) % 2 === 0;
      const sy = escala * (crece ? 1 + 0.34 * p : 1 - 0.22 * p);
      const sx = escala * (crece ? 1 + 0.12 * p : 1 - 0.08 * p);
      const dir = r % 2 ? 1 : -1;
      const desl = (((this.t * 85 * dir + r * 97) % sp.ancho) + sp.ancho) % sp.ancho;
      g.save();
      g.translate(W / 2, yc); g.scale(sx, sy); g.translate(-W / 2, -yc);
      for (let x = desl - sp.ancho * 2; x < W + sp.ancho; x += sp.ancho) g.drawImage(sp.c, x, yc - sp.alto / 2);
      g.restore();
    }
    // se abre y se cierra con una estrella: empieza y acaba en negro
    const kIn = tramo(this.t, 0.05, 0.6), kOut = tramo(this.t, this.dur - 0.9, this.dur - 0.05);
    const R = kOut > 0 ? 1500 * Math.pow(1 - kOut, 1.7) : 1500 * Math.pow(kIn, 1.7);
    if (R < 1500) {
      const rot = kOut > 0 ? -kOut * 1.3 : kIn * 1.3, cx = W / 2, cy = H / 2;
      g.save();
      g.beginPath(); g.rect(-80, -80, W + 160, H + 160);
      for (let i = 0; i < 10; i++) {
        const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? R * 0.43 : R;
        if (i) g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      g.closePath();
      g.fillStyle = "#000"; g.fill("evenodd");
      if (R > 3) {
        estrella(g, cx, cy, R, R * 0.43, rot);
        g.lineJoin = "round"; g.lineWidth = 7; g.strokeStyle = "#fff"; g.shadowColor = "#2bff5b"; g.shadowBlur = 18; g.stroke();
      }
      g.restore();
    }
  }
  get terminada() { return this.t >= this.dur; }
}

// ---------------------------------------------------------------------------- TOP 10 en llamas (presenta la cuenta atrás)
class EscenaTop10 {
  constructor() {
    this.t = 0; this.dur = 5.4;
    this.p = new Particulas(1100);
    this.impacto = false; this.frenado = false;
    this.cx = -700;
  }
  get terminada() { return this.t >= this.dur; }
  static cache = cacheTexto();
  static sprite() {
    const m = EscenaTop10.cache;
    if (m.has(1)) return m.get(1);
    const tam = 250, pad = 40;
    const med = lienzoNuevo(1, 1).getContext("2d");
    med.font = `900 ${tam}px ${FD}`;
    if ("letterSpacing" in med) med.letterSpacing = "6px";
    const mt = med.measureText("TOP 10");
    const asc = mt.actualBoundingBoxAscent || tam * 0.72;
    const c = lienzoNuevo(mt.width + pad * 2, asc + pad * 2), g = c.getContext("2d");
    g.font = `900 ${tam}px ${FD}`; g.textAlign = "left"; g.textBaseline = "alphabetic";
    if ("letterSpacing" in g) g.letterSpacing = "6px";
    const y = pad + asc;
    const gr = g.createLinearGradient(0, pad, 0, y);
    gr.addColorStop(0, "#fff6a8"); gr.addColorStop(0.45, "#ffb21a"); gr.addColorStop(1, "#ff3d0a");
    g.shadowColor = "rgba(255,120,20,.9)"; g.shadowBlur = 34;
    g.lineJoin = "round"; g.lineWidth = 12; g.strokeStyle = "#5c0f00"; g.strokeText("TOP 10", pad, y);
    g.shadowBlur = 0; g.shadowColor = "transparent";
    g.fillStyle = gr; g.fillText("TOP 10", pad, y);
    // de dónde salen las llamas: el borde de arriba de cada letra
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const emisores = [];
    for (let x = 0; x < c.width; x += 3) {
      let dentro = false;
      for (let yy = 0; yy < c.height; yy++) {
        const a = d[(yy * c.width + x) * 4 + 3];
        if (!dentro && a > 200) { emisores.push([x - c.width / 2, yy - c.height / 2]); dentro = true; }
        else if (dentro && a < 60) dentro = false;
      }
    }
    const r = { c, ancho: c.width, alto: c.height, base: y - c.height / 2, emisores };
    m.set(1, r);
    return r;
  }
  actualizar(dt) {
    const t = (this.t += dt);
    const sp = EscenaTop10.sprite();
    const ENTRA = 0.42, CAE = 3.4, FIN_CAIDA = 4.15;
    this.cx = t < ENTRA ? lerp(-sp.ancho / 2 - 120, W / 2, Math.pow(t / ENTRA, 1.25)) : W / 2;
    if (t >= ENTRA && !this.frenado) { this.frenado = true; temblar(9, 0.25); }
    // llamas
    if (t > 0.12 && t < FIN_CAIDA) {
      const kCae = tramo(t, CAE, FIN_CAIDA);
      const n = Math.round(720 * dt * (1 - kCae * 0.85));
      const moviendo = t < ENTRA;
      for (let i = 0; i < n; i++) {
        const e = sp.emisores[(Math.random() * sp.emisores.length) | 0];
        const y = 300 + e[1] * Math.cos(kCae * Math.PI * 0.5);
        this.p.nueva(this.cx + e[0] + azar(-3, 3), y + azar(2, 10), azar(-20, 20) - (moviendo ? 700 : 0), azar(-190, -90), azar(0.35, 0.75), azar(34, 64), 0);
      }
      if (Math.random() < 0.3) this.p.nueva(this.cx + azar(-sp.ancho / 2, sp.ancho / 2), 300 - sp.alto / 2, azar(-30, 30), azar(-220, -120), azar(0.8, 1.3), azar(5, 9), 5);
    }
    if (t >= FIN_CAIDA && !this.impacto) {
      this.impacto = true;
      temblar(24, 0.75);
      const base = 300 + sp.base;
      for (let i = 0; i < 90; i++) this.p.nueva(W / 2 + azar(-sp.ancho / 2, sp.ancho / 2), base, azar(-260, 260), azar(-520, -120), azar(0.5, 1.1), azar(6, 12), 2);
      for (let i = 0; i < 26; i++) this.p.nueva(W / 2 + azar(-sp.ancho / 2, sp.ancho / 2), base - azar(0, 20), azar(-90, 90), azar(-80, -10), azar(1.2, 2), azar(60, 110), 1);
    }
    this.p.actualizar(dt);
  }
  dibujar(g) {
    fondo(g, "#000");
    const t = this.t, sp = EscenaTop10.sprite();
    const ENTRA = 0.42, CAE = 3.4, FIN_CAIDA = 4.15;
    if (t < FIN_CAIDA) {
      if (t < CAE) {
        let sx = 1, sy = 1, sesgo = 0;
        if (t < ENTRA) { sx = 1.55; sy = 0.82; sesgo = 0.5; }
        else {
          const u = t - ENTRA, amort = Math.exp(-u * 8);
          sesgo = -0.55 * amort * Math.cos(u * 26);
          sx = 1 - 0.22 * amort * Math.cos(u * 26);
          sy = 1 + 0.16 * amort * Math.cos(u * 26);
        }
        // estela de velocidad
        if (t < ENTRA) {
          for (let k = 3; k >= 1; k--) {
            g.save(); g.globalAlpha = 0.16 * (4 - k);
            g.translate(this.cx - k * 70, 300); g.transform(1, 0, sesgo, 1, 0, 0); g.scale(sx * 1.05, sy);
            g.drawImage(sp.c, -sp.ancho / 2, -sp.alto / 2); g.restore();
          }
          g.save(); g.globalAlpha = 0.35; g.strokeStyle = "#ffcf6a"; g.lineWidth = 3;
          for (let i = 0; i < 9; i++) { const y = 300 + (i - 4) * 30; g.beginPath(); g.moveTo(this.cx - sp.ancho * 0.7 - 300 - (i % 3) * 80, y); g.lineTo(this.cx - sp.ancho * 0.6, y); g.stroke(); }
          g.restore();
        }
        g.save();
        g.translate(this.cx, 300 + sp.base); // ancla en la base de las letras
        g.transform(1, 0, sesgo, 1, 0, 0);
        g.scale(sx, sy);
        g.drawImage(sp.c, -sp.ancho / 2, -sp.alto / 2 - sp.base);
        // parpadeo del fuego por encima
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = 0.18 + 0.12 * Math.sin(t * 23) * Math.sin(t * 7);
        g.drawImage(sp.c, -sp.ancho / 2, -sp.alto / 2 - sp.base);
        g.restore();
      } else {
        // cae hacia atrás: giro en 3D alrededor de la base, en franjas con perspectiva
        const k = tramo(t, CAE, FIN_CAIDA), th = k * k * Math.PI / 2, D = 900, ejeY = 300 + sp.base;
        const franjas = 48, hs = sp.alto;
        const altoBase = sp.alto / 2 + sp.base; // de arriba del sprite a la base
        g.save();
        g.globalAlpha = 1 - k * 0.35;
        for (let i = 0; i < franjas; i++) {
          const y0 = (i / franjas) * hs, y1 = ((i + 1) / franjas) * hs;
          const pt = (yy) => {
            const h = altoBase - yy; // altura sobre el eje
            const z = h * Math.sin(th), f = D / (D + z);
            return { y: 300 + (ejeY - h * Math.cos(th) - 300) * f, f };
          };
          const a = pt(y0), b = pt(y1);
          if (Math.abs(b.y - a.y) < 0.3) continue;
          const f = (a.f + b.f) / 2, w = sp.ancho * f;
          g.drawImage(sp.c, 0, y0, sp.ancho, y1 - y0 + 0.5, W / 2 - w / 2, Math.min(a.y, b.y), w, Math.abs(b.y - a.y) + 0.6);
        }
        g.restore();
      }
    }
    this.p.dibujar(g);
  }
}

// ---------------------------------------------------------------------------- PUESTO N (se repite del 10 al 1)
/*
 * El número del puesto entra de golpe (oro, plata, bronce o verde), se va a la esquina y baja del cielo la foto de
 * ese puesto con su tasa en verde; cae la pegatina TOP 10 (tiembla la cámara) y todo se desvanece a negro.
 * Si el puesto está libre (máquina nueva), sale una foto vacía con "¿SERÁS TÚ?".
 */
const COLOR_PUESTO = {
  1: { cara: "#ffd34d", lado: "#8a5a00", borde: "#000", luz: "255,211,77" },
  2: { cara: "#eef2f6", lado: "#6d7680", borde: "#000", luz: "225,235,250" },
  3: { cara: "#f2a96b", lado: "#7a3f12", borde: "#000", luz: "242,169,107" },
  otro: { cara: "#2bff5b", lado: "#0b6e2a", borde: "#000", luz: "43,255,91" },
};
let _fotoVacia = null;
function fotoVacia() {
  if (_fotoVacia) return _fotoVacia;
  const S = 300, c = lienzoNuevo(S, S), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, S);
  gr.addColorStop(0, "#26173a"); gr.addColorStop(1, "#0d0814");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.fillStyle = "rgba(255,255,255,.12)";
  g.beginPath(); g.arc(S / 2, S * 0.4, S * 0.18, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(S / 2, S * 1.02, S * 0.36, S * 0.34, 0, Math.PI, 0); g.fill();
  txt(g, "?", S / 2, S * 0.56, { tam: 170, peso: 900, fam: FD, color: "rgba(255,255,255,.85)" });
  return (_fotoVacia = c);
}
function corona(g, w) {
  const gr = g.createLinearGradient(0, -w * 0.5, 0, 0);
  gr.addColorStop(0, "#fff3a8"); gr.addColorStop(1, "#d99a00");
  g.beginPath();
  g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -w * 0.32); g.lineTo(-w * 0.28, -w * 0.12); g.lineTo(0, -w * 0.5);
  g.lineTo(w * 0.28, -w * 0.12); g.lineTo(w / 2, -w * 0.32); g.lineTo(w / 2, 0); g.closePath();
  g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = "#6e4600"; g.stroke();
  for (const [x, c] of [[-w * 0.3, "#e3262f"], [0, "#2fe3e8"], [w * 0.3, "#2bff5b"]]) { g.fillStyle = c; g.beginPath(); g.arc(x, -w * 0.08, w * 0.05, 0, 6.283); g.fill(); }
}
class EscenaPuesto {
  constructor(n) {
    this.t = 0; this.dur = 7.0;
    this.n = n; this.e = datos.top[n - 1] || null;
    this.col = COLOR_PUESTO[n] || COLOR_PUESTO.otro;
    this.num = sprite3D(String(n), 330, this.col);
    this.golpe = false; this.pegada = false;
    this.p = new Particulas(240);
  }
  get terminada() { return this.t >= this.dur; }
  actualizar(dt) {
    const t = (this.t += dt), tf = t - 1.35;
    if (t > 0.42 && !this.golpe) {
      this.golpe = true; temblar(this.n <= 3 ? 22 : 16, 0.45);
      for (let i = 0; i < 34; i++) { const a = azar(0, 6.283), v = azar(220, 620); this.p.nueva(W / 2 + Math.cos(a) * 90, 300 + Math.sin(a) * 90, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 16), 2); }
      this.p.nueva(W / 2, 300, 0, 0, 0.35, 420, 5);
    }
    if (tf > 1.85 && !this.pegada) {
      this.pegada = true;
      temblar(16, 0.5);
      for (let i = 0; i < 24; i++) {
        const a = azar(0, 6.283);
        this.p.nueva(370 + Math.cos(a) * 60, 112 + Math.sin(a) * 30, Math.cos(a) * azar(150, 380), Math.sin(a) * azar(150, 380), azar(0.3, 0.6), azar(8, 16), 5);
      }
    }
    if (tf > 0 && tf < 1.6 && Math.random() < 0.45) this.p.nueva(W / 2 + azar(-200, 200), azar(0, 420), 0, azar(10, 40), azar(0.4, 0.9), azar(10, 22), 5);
    if (this.n === 1 && tf > 1.9 && tf < 4.2 && Math.random() < 0.6) this.p.nueva(azar(0, W), -10, azar(-20, 20), azar(20, 60), azar(1.5, 2.5), azar(6, 12), 2);
    this.p.actualizar(dt);
  }
  dibujar(g) {
    fondo(g, "#000");
    const t = this.t, tf = t - 1.35, e = this.e, n = this.n;
    // rayos de luz desde arriba mientras baja la foto
    const luz = tramo(tf, -0.2, 0.1) * (1 - tramo(tf, 1.5, 2.4)) * 0.9;
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      for (let i = -1; i <= 1; i++) {
        const gr = g.createLinearGradient(0, 0, 0, 470);
        gr.addColorStop(0, `rgba(255,250,220,${0.16 * luz})`); gr.addColorStop(1, "rgba(255,250,220,0)");
        g.fillStyle = gr;
        g.beginPath(); g.moveTo(W / 2 + i * 90 - 40, -10); g.lineTo(W / 2 + i * 90 + 40, -10);
        g.lineTo(W / 2 + i * 210 + 120, 470); g.lineTo(W / 2 + i * 210 - 120, 470); g.closePath(); g.fill();
      }
      g.restore();
    }
    // la tasa en verde, desde el principio
    const latido = 1 + 0.025 * Math.sin(t * 6);
    g.save(); g.translate(W / 2, 556); g.scale(latido, latido);
    txt(g, e ? `${fmt(e.valor)} ${datos.unidad}` : "¿SERÁS TÚ?", 0, 0, { tam: 104, peso: 900, fam: FD, color: "#2bff5b", glow: "rgba(43,255,91,.75)", glowTam: 26, esp: 2, max: 900, alfa: tramo(t, 0.15, 0.5) });
    g.restore();
    // la foto
    if (tf > -0.05) {
      const cy = lerp(-260, 262, eOut(tramo(tf, 0, 1.55)));
      const giro = -0.04 + 0.32 * Math.sin(Math.max(0, tf) * 5.2) * Math.exp(-Math.max(0, tf) * 2.1);
      const h = polaroid(g, e ? fotoDe(e.cara) : fotoVacia(), W / 2, cy, 300, giro, (c, x, y, w, hh) => {
        txt(c, `#${n}`, x + 22, y + hh * 0.66, { tam: 38, peso: 900, fam: FD, color: "#241812", alin: "left" });
        txt(c, e ? e.fecha : "LIBRE", x + w - 22, y + hh * 0.66, { tam: 20, peso: 600, color: "#7a6a5a", alin: "right" });
      });
      if (n === 1) { g.save(); g.translate(W / 2, cy); g.rotate(giro); g.translate(70, -h / 2 + 8); g.rotate(0.22); corona(g, 110); g.restore(); }
      // la pegatina TOP 10 (cae de golpe en la esquina)
      if (tf > 1.7) {
        const k = tramo(tf, 1.7, 1.85), s = lerp(2.8, 1, eIn(k));
        const sp = pegatinaTop10();
        g.save(); g.globalAlpha = clamp(k * 3, 0, 1);
        g.translate(W / 2 - 140, cy - 160); g.rotate(-0.24 + (1 - k) * 0.5); g.scale(s * 0.82, s * 0.82);
        g.drawImage(sp, -sp.width / 2, -sp.height / 2);
        g.restore();
      }
    }
    // el número: entra de golpe, aguanta y se va a la esquina
    if (t > 0.12) {
      const kE = tramo(t, 0.12, 0.42), kM = eInOut(tramo(t, 1.2, 1.65));
      const s = lerp(lerp(3.4, 1, eIn(kE)), 0.36, kM) * (1 + 0.03 * Math.sin(t * 7) * (1 - kM));
      const x = lerp(W / 2, 112, kM), y = lerp(290, 118, kM);
      if (kM < 1) {
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * kE * (1 - kM);
        g.drawImage(BLOB.blanco, x - 330, y - 260, 660, 520);
        g.restore();
        txt(g, "PUESTO", x, y - 172 * s, { tam: 34, peso: 800, color: `rgb(${this.col.luz})`, esp: 10, alfa: kE * (1 - kM) });
      }
      g.save(); g.globalAlpha = Math.min(1, kE * 3); g.translate(x, y); g.scale(s, s);
      g.drawImage(this.num, -this.num.width / 2, -this.num.height / 2);
      g.restore();
    }
    this.p.dibujar(g);
    // se desvanece a negro
    const kNegro = tramo(tf, 4.6, 5.5);
    if (kNegro > 0) { g.fillStyle = `rgba(0,0,0,${kNegro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

// ---------------------------------------------------------------------------- PROVISIONALES (Processing · Analyzing · Ranking)
function marcaProvisional(g) {
  txt(g, "PROVISIONAL · FALTA TU DESCRIPCIÓN", W - 20, 30, { tam: 15, peso: 800, color: "rgba(255,255,255,.45)", alin: "right", esp: 1.5 });
}
function caraGrande(g, cara, cx, cy, alto, giro = 0) {
  const k = "cara_" + cara;
  if (!listo(k)) return;
  const p = IMG[k], w = (p.w / p.h) * alto;
  g.save(); g.translate(cx, cy); g.rotate(giro);
  g.drawImage(p.im, -w / 2, -alto / 2, w, alto);
  g.restore();
}

class EscenaPagado {
  constructor() { this.t = 0; this.dur = 4.2; this.p = new Particulas(200); this.chispas = false; }
  get terminada() { return this.t >= this.dur; }
  actualizar(dt) {
    this.t += dt;
    if (!this.chispas && this.t > 0.15) {
      this.chispas = true;
      for (let i = 0; i < 70; i++) { const a = azar(0, 6.283), v = azar(120, 420); this.p.nueva(330, 230, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1), azar(6, 12), 2); }
    }
    this.p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t;
    fondo(g, "#04140a");
    const k = eBack(t / 0.45), cx = 330, cy = 230;
    g.strokeStyle = `rgba(43,255,91,${1 - tramo(t, 0, 0.8)})`; g.lineWidth = 8;
    g.beginPath(); g.arc(cx, cy, 80 + eOut(t / 0.8) * 260, 0, 6.283); g.stroke();
    g.fillStyle = "#2bff5b"; g.beginPath(); g.arc(cx, cy, 92 * k, 0, 6.283); g.fill();
    const kc = tramo(t, 0.25, 0.65);
    g.strokeStyle = "#04140a"; g.lineWidth = 17; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(cx - 40, cy + 2);
    if (kc < 0.4) g.lineTo(lerp(cx - 40, cx - 10, kc / 0.4), lerp(cy + 2, cy + 32, kc / 0.4));
    else { g.lineTo(cx - 10, cy + 32); g.lineTo(lerp(cx - 10, cx + 45, (kc - 0.4) / 0.6), lerp(cy + 32, cy - 30, (kc - 0.4) / 0.6)); }
    g.stroke(); g.lineCap = "butt";
    txt(g, "¡PAGO ACEPTADO!", cx, 420, { tam: 78, peso: 900, fam: FD, color: "#fff", alfa: tramo(t, 0.1, 0.4), max: 560 });
    txt(g, "Preparando el sensor…", cx, 470, { tam: 26, peso: 600, color: "#9fe8b2", alfa: tramo(t, 0.4, 0.7) });
    const kb = tramo(t, 0.5, this.dur - 0.2);
    rectR(g, cx - 200, 500, 400, 12, 6); g.fillStyle = "rgba(255,255,255,.12)"; g.fill();
    rectR(g, cx - 200, 500, 400 * kb, 12, 6); g.fillStyle = "#2bff5b"; g.fill();
    caraGrande(g, "risa", 780, 300 - Math.abs(Math.sin(t * 6)) * 26, 300, Math.sin(t * 3) * 0.08);
    this.p.dibujar(g);
    marcaProvisional(g);
  }
}

class EscenaAnaliza {
  constructor() {
    this.t = 0; this.dur = 7.2; this.flash = false;
    // la prueba simulada: la mayoría normales y alguna para el top 10
    const alto = Math.random() < 0.4;
    const valor = Math.round((alto ? azar(1.3, 3.1) : azar(0.15, 1.3)) * 100) / 100;
    const cara = CARAS[(Math.random() * CARAS.length) | 0];
    datos.prueba = { valor, cara };
  }
  get terminada() { return this.t >= this.dur; }
  actualizar(dt) { this.t += dt; if (this.t > 6.0 && !this.flash) { this.flash = true; } }
  dibujar(g) {
    const t = this.t;
    fondo(g, "#03121a");
    if (t < 3.6) {
      const pulso = 1 + 0.06 * Math.sin(t * 9);
      g.save(); g.translate(360, 240); g.scale(pulso, pulso);
      txt(g, "¡SOPLA!", 0, 0, { tam: 200, peso: 900, fam: FD, color: "#fff", base: "middle", glow: "rgba(47,227,232,.8)", glowTam: 30, max: 560 });
      g.restore();
      const k = tramo(t, 0.4, 3.4);
      for (let i = 0; i < 4; i++) {
        const x = 140 + i * 112, kk = clamp(k * 4 - i, 0, 1);
        rectR(g, x, 410, 100, 60, 12); g.fillStyle = "rgba(255,255,255,.1)"; g.fill();
        if (kk > 0) { rectR(g, x, 410, 100 * kk, 60, 12); g.fillStyle = "#2fe3e8"; g.fill(); }
      }
      txt(g, "Sopla 4 segundos sin parar", 360, 520, { tam: 26, peso: 600, color: "#a9dce6" });
      caraGrande(g, "sorpresa", 820, 300, 320, Math.sin(t * 5) * 0.05);
    } else if (t < 6.0) {
      const quedan = 6.0 - t, n = Math.ceil(quedan / 0.8);
      const kk = 1 - ((quedan % 0.8) / 0.8);
      g.save(); g.translate(360, 270); g.scale(1.3 - eOut(kk) * 0.3, 1.3 - eOut(kk) * 0.3);
      txt(g, String(Math.min(3, n)), 0, 0, { tam: 260, peso: 900, fam: FD, color: "#fff", base: "middle" });
      g.restore();
      txt(g, "¡Sonríe, que va foto!", 360, 520, { tam: 32, peso: 800, color: "#fff" });
      caraGrande(g, "guino", 820, 300, 320, Math.sin(t * 4) * 0.06);
    } else {
      const foto = fotoDe(datos.prueba.cara);
      polaroid(g, foto, 330, 285, 320, -0.04, null);
      g.save(); g.translate(780, 280); g.rotate(t * 6);
      g.strokeStyle = "#2fe3e8"; g.lineWidth = 10; g.lineCap = "round";
      g.beginPath(); g.arc(0, 0, 56, 0, 4.5); g.stroke(); g.restore();
      txt(g, "Analizando…", 780, 400, { tam: 40, peso: 800, color: "#fff" });
      const kf = (t - 6.0) / 0.4;
      if (kf < 1) { g.fillStyle = `rgba(255,255,255,${1 - kf})`; g.fillRect(-60, -60, W + 120, H + 120); }
    }
    marcaProvisional(g);
  }
}

class EscenaRanking {
  constructor() {
    this.t = 0; this.dur = 9;
    const pr = datos.prueba || { valor: 1.1, cara: "risa" };
    // puesto: dentro del top 10 se cuenta; fuera, se estima con el total de pruebas
    let puesto = datos.top.filter((e) => e.valor > pr.valor).length + 1;
    const entra = puesto <= 10;
    datos.total += 1;
    if (entra) {
      datos.top.splice(puesto - 1, 0, { valor: pr.valor, cara: pr.cara, fecha: "27/10", nueva: true });
      datos.top.length = 10;
    } else {
      const ult = datos.top[9].valor;
      puesto = 10 + Math.max(1, Math.round(((ult - pr.valor) / ult) * (datos.total - 10)));
    }
    this.pr = pr; this.puesto = puesto; this.entra = entra;
    this.p = new Particulas(240); this.fiesta = false;
  }
  get terminada() { return this.t >= this.dur; }
  actualizar(dt) {
    this.t += dt;
    if (this.entra && !this.fiesta && this.t > 1.9) {
      this.fiesta = true; temblar(10, 0.35);
      for (let i = 0; i < 100; i++) { const a = azar(0, 6.283), v = azar(150, 480); this.p.nueva(590, 230, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.2), azar(6, 12), 2); }
    }
    this.p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, pr = this.pr;
    fondo(g, "#0b0710");
    const kf = eBack(t / 0.7);
    polaroid(g, fotoDe(pr.cara), 200, lerp(-260, 290, kf), 300, lerp(-0.4, -0.05, kf), (c, x, y, w, h) => {
      txt(c, this.entra ? "¡Tu foto entra en el top 10!" : "Tu foto se borra en 24 h", x + w / 2, y + h * 0.62, { tam: 17, peso: 700, color: "#3a2a1a" });
    });
    const kv = eOut(tramo(t, 0.3, 1.8));
    txt(g, "TU RESULTADO", 590, 110, { tam: 20, peso: 800, color: "#9a91a5", esp: 2, alfa: tramo(t, 0, 0.3) });
    txt(g, `${fmt(pr.valor * kv)} ${datos.unidad}`, 575, 230, { tam: 130, peso: 900, fam: FD, color: "#2bff5b", glow: "rgba(43,255,91,.6)", glowTam: 22, max: 400 });
    if (t > 1.9) {
      const k = eBack((t - 1.9) / 0.4);
      g.save(); g.translate(590, 300); g.scale(k, k);
      txt(g, `PUESTO ${this.puesto} DE ${datos.total}`, -15, 0, { tam: 46, peso: 900, fam: FD, color: "#fff", max: 400 });
      g.restore();
      if (this.entra) {
        const sp = pegatinaTop10();
        g.save(); g.translate(590, 372); g.rotate(-0.05); g.scale(0.7 * k, 0.7 * k); g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
      }
    }
    // la lista del top 10
    const x0 = 790, y0 = 92;
    txt(g, "TOP 10", x0, y0 - 14, { tam: 26, peso: 900, fam: FD, color: "#ff3a3a", alin: "left", esp: 2 });
    datos.top.forEach((e, i) => {
      const y = y0 + i * 44, a = tramo(t, 0.8 + i * 0.06, 1.1 + i * 0.06);
      if (a <= 0) return;
      g.globalAlpha = a;
      rectR(g, x0, y, 210, 38, 8);
      g.fillStyle = e.nueva && i === this.puesto - 1 ? "rgba(43,255,91,.25)" : "rgba(255,255,255,.06)"; g.fill();
      txt(g, String(i + 1), x0 + 18, y + 27, { tam: 22, peso: 900, fam: FD, color: i < 3 ? "#ffd34d" : "#9a91a5" });
      const f = fotoDe(e.cara);
      if (f) { g.save(); g.beginPath(); g.arc(x0 + 54, y + 19, 15, 0, 6.283); g.clip(); g.drawImage(f, x0 + 39, y + 4, 30, 30); g.restore(); }
      txt(g, fmt(e.valor), x0 + 196, y + 27, { tam: 22, peso: 800, fam: FD, color: "#fff", alin: "right" });
      g.globalAlpha = 1;
    });
    txt(g, "Orientativo · No sirve para saber si puedes conducir · Si bebes, no conduzcas", W / 2, 584, { tam: 14, peso: 400, color: "#9a91a5" });
    this.p.dibujar(g);
    marcaProvisional(g);
  }
}

/*NUEVAS_ESCENAS*/
