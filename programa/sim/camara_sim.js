/*
 * camara_sim.js — Camera Module 3 simulada (solo navegador).
 *
 * Pinta a una "persona" inventada delante de la máquina (cara, pelo, gafas, gorra… al azar), con luz de bar,
 * parpadeo y vaivén; si está soplando, hincha los mofletes. Se puede cambiar por una foto subida por quien
 * prueba la simulación. "Tapar" la cámara da imágenes casi negras, como una mano delante del objetivo.
 *
 * Tiene la misma interfaz que pi/camara.js para la máquina (encender, lista, foto, apagar) y además la de
 * fuente de imagen en directo para la pantalla (dibujar).
 */
(function (raiz, fabrica) {
  "use strict";
  const m = fabrica();
  if (typeof module === "object" && module.exports) module.exports = m;
  else (raiz.ALC_SIM = raiz.ALC_SIM || {}).camara = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PIELES = ["#f6d7c3", "#eac0a2", "#d9a37f", "#c08560", "#9a6343", "#6e4630", "#4a2f22"];
  const PELOS = ["#1d1512", "#3b2618", "#6b4223", "#a8763e", "#d8b56a", "#b9442c", "#8f8f96", "#e9e4dc", "#2b2f6b", "#c43b7a"];
  const ROPA = ["#ff3d84", "#2fe3e8", "#ffb02e", "#3c3d8f", "#1e6b4f", "#e8e2d6", "#262028", "#8a1c2b", "#4a7bd1"];
  const PEINADOS = ["corto", "largo", "rizado", "calvo", "coleta", "mono", "cresta"];

  function aleatorio(semilla) {
    let s = (semilla >>> 0) || 1;
    return () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };
  }
  const elegir = (r, a) => a[Math.floor(r() * a.length) % a.length];

  function nuevaPersona(semilla) {
    const r = aleatorio(semilla || Math.floor(Math.random() * 1e9));
    return {
      piel: elegir(r, PIELES),
      pelo: elegir(r, PELOS),
      peinado: elegir(r, PEINADOS),
      ropa: elegir(r, ROPA),
      ojos: elegir(r, ["#3b2a1d", "#2d5a8a", "#3e6b3a", "#1d1a18", "#6b4a2a"]),
      gafas: r() < 0.3 ? elegir(r, ["redondas", "cuadradas", "sol"]) : null,
      barba: r() < 0.3 ? elegir(r, ["barba", "bigote", "perilla"]) : null,
      gorra: r() < 0.18 ? elegir(r, ROPA) : null,
      pendientes: r() < 0.3,
      cara: 0.92 + r() * 0.16, // ancho relativo
      sonrisa: 0.3 + r() * 0.7,
      fondo: r(),
      cejas: 0.8 + r() * 0.6,
      fase: r() * 10,
    };
  }

  /** Dibuja a la persona en (x, y, w, h). t: ms; soplando: mofletes hinchados. */
  function pintarPersona(ctx, p, x, y, w, h, t, soplando) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    // fondo de bar desenfocado
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, p.fondo < 0.5 ? "#2a1a14" : "#161a2a");
    g.addColorStop(1, p.fondo < 0.5 ? "#120b08" : "#0b0c14");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 9; i++) {
      const bx = x + ((i * 0.137 + p.fondo) % 1) * w;
      const by = y + ((i * 0.31 + p.fondo * 2) % 0.6) * h;
      const br = h * (0.06 + ((i * 7) % 5) * 0.025);
      const gr = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      const col = i % 3 === 0 ? "255,170,70" : i % 3 === 1 ? "255,90,150" : "120,170,255";
      gr.addColorStop(0, `rgba(${col},0.35)`);
      gr.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gr;
      ctx.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    const s = h / 360; // escala
    const vaiven = Math.sin(t / 900 + p.fase) * 6 * s;
    const cx = x + w / 2 + vaiven;
    const cy = y + h * 0.47 + Math.sin(t / 1300 + p.fase) * 3 * s;
    const rx = 62 * s * p.cara;
    const ry = 80 * s;
    // cuerpo
    ctx.fillStyle = p.ropa;
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 1.02, 150 * s, 95 * s, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = shade(p.piel, -0.12);
    ctx.fillRect(cx - 22 * s, cy + ry * 0.7, 44 * s, 50 * s);
    // pelo largo por detrás
    if (p.peinado === "largo" || p.peinado === "rizado") {
      ctx.fillStyle = p.pelo;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20 * s, rx * 1.35, ry * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // orejas
    ctx.fillStyle = shade(p.piel, -0.05);
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.98, cy + 5 * s, 12 * s, 19 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + rx * 0.98, cy + 5 * s, 12 * s, 19 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    if (p.pendientes) {
      ctx.fillStyle = "#ffd34d";
      ctx.beginPath();
      ctx.arc(cx - rx * 0.98, cy + 26 * s, 4 * s, 0, Math.PI * 2);
      ctx.arc(cx + rx * 0.98, cy + 26 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // cara (con luz de un lado)
    const gc = ctx.createRadialGradient(cx - rx * 0.4, cy - ry * 0.35, rx * 0.2, cx, cy, ry * 1.15);
    gc.addColorStop(0, shade(p.piel, 0.1));
    gc.addColorStop(0.7, p.piel);
    gc.addColorStop(1, shade(p.piel, -0.18));
    ctx.fillStyle = gc;
    ctx.beginPath();
    const moflete = soplando ? 1.12 : 1;
    ctx.ellipse(cx, cy, rx * moflete, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    // mofletes
    ctx.fillStyle = soplando ? "rgba(240,90,90,0.35)" : "rgba(235,120,110,0.18)";
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.55, cy + ry * 0.22, rx * (soplando ? 0.36 : 0.24), ry * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + rx * 0.55, cy + ry * 0.22, rx * (soplando ? 0.36 : 0.24), ry * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    // ojos (parpadeo)
    const parpadeo = (t + p.fase * 1000) % 4200 < 140;
    for (const lado of [-1, 1]) {
      const ex = cx + lado * rx * 0.38;
      const ey = cy - ry * 0.08;
      if (parpadeo || soplando) {
        ctx.strokeStyle = "#2a1a14";
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.arc(ex, ey, 10 * s, soplando ? Math.PI * 1.1 : 0.15, soplando ? Math.PI * 1.9 : Math.PI - 0.15);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#fbf8f4";
        ctx.beginPath();
        ctx.ellipse(ex, ey, 13 * s, 8.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.ojos;
        ctx.beginPath();
        ctx.arc(ex + Math.sin(t / 1700) * 2 * s, ey, 6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0b0706";
        ctx.beginPath();
        ctx.arc(ex + Math.sin(t / 1700) * 2 * s, ey, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ex + 2 * s, ey - 2 * s, 1.6 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      // cejas
      ctx.strokeStyle = shade(p.pelo, -0.1);
      ctx.lineWidth = 4 * s * p.cejas;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ex - 13 * s, ey - 17 * s);
      ctx.quadraticCurveTo(ex, ey - (soplando ? 26 : 22) * s, ex + 13 * s, ey - 17 * s);
      ctx.stroke();
    }
    // nariz
    ctx.strokeStyle = shade(p.piel, -0.25);
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 2 * s, cy + 2 * s);
    ctx.quadraticCurveTo(cx - 9 * s, cy + 24 * s, cx + 4 * s, cy + 27 * s);
    ctx.stroke();
    // boca
    const by = cy + ry * 0.48;
    if (soplando) {
      ctx.fillStyle = "#6b1f24";
      ctx.beginPath();
      ctx.ellipse(cx, by, 8 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const sr = p.sonrisa;
      ctx.fillStyle = "#7a2228";
      ctx.beginPath();
      ctx.moveTo(cx - 24 * s, by - 4 * s);
      ctx.quadraticCurveTo(cx, by + (8 + sr * 18) * s, cx + 24 * s, by - 4 * s);
      ctx.quadraticCurveTo(cx, by + 4 * s, cx - 24 * s, by - 4 * s);
      ctx.fill();
      if (sr > 0.6) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(cx - 14 * s, by - 2 * s, 28 * s, 5 * s);
      }
    }
    // barba
    if (p.barba) {
      ctx.fillStyle = shade(p.pelo, 0.05);
      ctx.globalAlpha = 0.9;
      if (p.barba === "barba") {
        ctx.beginPath();
        ctx.ellipse(cx, cy + ry * 0.55, rx * 0.9, ry * 0.5, 0, 0.1, Math.PI - 0.1);
        ctx.fill();
        ctx.fillStyle = soplando ? "#6b1f24" : "#7a2228";
        ctx.beginPath();
        ctx.ellipse(cx, by + 2 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.barba === "bigote") {
        ctx.beginPath();
        ctx.ellipse(cx, by - 9 * s, 26 * s, 7 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(cx, by + 22 * s, 14 * s, 14 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // pelo de arriba
    ctx.fillStyle = p.pelo;
    if (p.peinado !== "calvo") {
      ctx.beginPath();
      if (p.peinado === "cresta") {
        ctx.moveTo(cx - 20 * s, cy - ry * 0.75);
        for (let i = 0; i <= 6; i++) ctx.lineTo(cx - 20 * s + i * 7 * s, cy - ry * (i % 2 ? 1.45 : 1.15));
        ctx.lineTo(cx + 22 * s, cy - ry * 0.75);
      } else {
        ctx.ellipse(cx, cy - ry * 0.45, rx * 1.05, ry * 0.68, 0, Math.PI * 1.02, Math.PI * 1.98);
        ctx.ellipse(cx, cy - ry * 0.55, rx * 1.02, ry * 0.5, 0, Math.PI, 0);
      }
      ctx.fill();
      if (p.peinado === "rizado") {
        for (let i = 0; i < 14; i++) {
          const a = Math.PI + (i / 13) * Math.PI;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * rx * 1.05, cy - ry * 0.4 + Math.sin(a) * ry * 0.75, 16 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (p.peinado === "coleta" || p.peinado === "mono") {
        ctx.beginPath();
        ctx.arc(cx + (p.peinado === "mono" ? 0 : rx * 0.9), cy - ry * (p.peinado === "mono" ? 1.15 : 0.6), 24 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // gorra
    if (p.gorra) {
      ctx.fillStyle = p.gorra;
      ctx.beginPath();
      ctx.ellipse(cx, cy - ry * 0.55, rx * 1.08, ry * 0.55, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = shade(p.gorra, -0.2);
      ctx.beginPath();
      ctx.ellipse(cx + rx * 0.3, cy - ry * 0.55, rx * 1.05, 11 * s, -0.05, 0, Math.PI);
      ctx.fill();
    }
    // gafas
    if (p.gafas) {
      ctx.strokeStyle = "#141014";
      ctx.lineWidth = 4 * s;
      ctx.fillStyle = p.gafas === "sol" ? "rgba(10,10,14,0.85)" : "rgba(200,230,255,0.12)";
      for (const lado of [-1, 1]) {
        const ex = cx + lado * rx * 0.38;
        const ey = cy - ry * 0.08;
        ctx.beginPath();
        if (p.gafas === "redondas") ctx.arc(ex, ey, 18 * s, 0, Math.PI * 2);
        else ctx.rect(ex - 20 * s, ey - 13 * s, 40 * s, 27 * s);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - rx * 0.38 + 18 * s, cy - ry * 0.1);
      ctx.lineTo(cx + rx * 0.38 - 18 * s, cy - ry * 0.1);
      ctx.stroke();
    }
    // luz de flash del bar y viñeta de objetivo
    const v = ctx.createRadialGradient(x + w / 2, y + h / 2, h * 0.3, x + w / 2, y + h / 2, w * 0.7);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = v;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    const f = (c) => Math.round(Math.min(255, Math.max(0, k >= 0 ? c + (255 - c) * k : c * (1 + k))));
    r = f(r);
    g = f(g);
    b = f(b);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  class CamaraSimulada {
    constructor(o = {}) {
      this.ancho = o.ancho || 960;
      this.alto = o.alto || 540;
      this.cv = document.createElement("canvas");
      this.cv.width = this.ancho;
      this.cv.height = this.alto;
      this.ctx = this.cv.getContext("2d");
      this.ruido = this._ruido();
      this.persona = nuevaPersona();
      this.fotoPropia = null;
      this.tapada = false;
      this.soplando = false;
      this.encendida = false;
      this.rota = false;
      this.alEncender = null;
    }

    _ruido() {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d");
      const d = x.createImageData(128, 128);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 16;
      }
      x.putImageData(d, 0, 0);
      return c;
    }

    otraPersona(semilla) {
      this.fotoPropia = null;
      this.persona = nuevaPersona(semilla);
    }

    usarFoto(img) {
      this.fotoPropia = img;
    }

    /** Pinta el cuadro actual en su lienzo interno. */
    _pintar(t) {
      const c = this.ctx;
      const w = this.ancho;
      const h = this.alto;
      if (this.tapada) {
        c.fillStyle = "#050404";
        c.fillRect(0, 0, w, h);
        const g = c.createRadialGradient(w * 0.6, h * 0.7, 10, w * 0.6, h * 0.7, w * 0.5);
        g.addColorStop(0, "rgba(90,40,30,0.35)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      } else if (this.fotoPropia) {
        const iw = this.fotoPropia.naturalWidth || this.fotoPropia.width;
        const ih = this.fotoPropia.naturalHeight || this.fotoPropia.height;
        const k = Math.max(w / iw, h / ih);
        c.drawImage(this.fotoPropia, (w - iw * k) / 2, (h - ih * k) / 2, iw * k, ih * k);
      } else {
        pintarPersona(c, this.persona, 0, 0, w, h, t, this.soplando);
      }
      // grano de sensor (más con poca luz)
      c.save();
      c.globalAlpha = this.tapada ? 0.9 : 0.5;
      c.globalCompositeOperation = "overlay";
      const ox = Math.floor(Math.random() * 128);
      const oy = Math.floor(Math.random() * 128);
      c.translate(-ox, -oy);
      c.fillStyle = c.createPattern(this.ruido, "repeat");
      c.fillRect(0, 0, w + 128, h + 128);
      c.restore();
    }

    // ---- interfaz de la máquina
    async encender() {
      if (this.rota) throw new Error("la cámara no responde (simulado)");
      await new Promise((r) => setTimeout(r, 900)); // rpicam tarda en arrancar
      this.encendida = true;
      if (this.alEncender) this.alEncender(true);
      return true;
    }
    lista() {
      return this.encendida && !this.rota;
    }
    async foto() {
      if (!this.encendida || this.rota) throw new Error("cámara apagada");
      this._pintar(performance.now());
      const blob = await new Promise((ok) => this.cv.toBlob(ok, "image/jpeg", 0.85));
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return { bytes, tapada: this.tapada };
    }
    async apagar() {
      this.encendida = false;
      if (this.alEncender) this.alEncender(false);
    }

    // ---- interfaz de fuente en directo para la pantalla
    dibujar(ctx, x, y, w, h) {
      if (!this.lista()) return false;
      this._pintar(performance.now());
      const k = Math.max(w / this.ancho, h / this.alto);
      const sw = w / k;
      const sh = h / k;
      ctx.drawImage(this.cv, (this.ancho - sw) / 2, (this.alto - sh) / 2, sw, sh, x, y, w, h);
      return true;
    }

    /** Retrato JPEG de una persona inventada (fotos de ejemplo del top 10). */
    async retrato(semilla) {
      const p = nuevaPersona(semilla);
      const c = document.createElement("canvas");
      c.width = 960;
      c.height = 540;
      pintarPersona(c.getContext("2d"), p, 0, 0, 960, 540, semilla * 37, false);
      const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.82));
      return new Uint8Array(await blob.arrayBuffer());
    }
  }

  return { CamaraSimulada, nuevaPersona, pintarPersona };
});
