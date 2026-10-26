/*
 * pantalla.js — lo que se ve en la pantalla de 7" (1024 × 600), dibujado en un <canvas>.
 *
 * Recibe "vistas" de la máquina (nucleo/maquina.js) y las anima. En la Pi corre dentro de Chromium en modo
 * kiosco (pi/kiosco/index.html, las vistas llegan por SSE); en la simulación, el mismo archivo pinta la
 * pantalla 3D. No toca hardware ni red.
 *
 * Pensado para durar encendido 24/7 en una Pi 3B+:
 * - Partículas en arrays de tamaño fijo (nada de crear objetos por cuadro: sin basura que recoger).
 * - Caché de imágenes limitada (LRU de 40).
 * - Calidad automática: si un cuadro tarda demasiado, se quitan sombras y se bajan partículas.
 * - Nada se queda quieto en la pantalla de espera (la pantalla puede quedarse marcada, ficha #5, apartado 7):
 *   todo se mueve y el conjunto se desplaza unos píxeles cada pocos minutos.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("./" + n) : raiz.ALC[n]);
  const m = fabrica(dep("textos"));
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).pantalla = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (T) {
  "use strict";

  const W = 1024;
  const H = 600;
  const DISPLAY = '"Big Shoulders Display", "Arial Narrow", "Roboto Condensed", sans-serif';
  const TEXTO = '"Archivo", "Helvetica Neue", Arial, sans-serif';

  const C = {
    fondo1: "#0b0711",
    fondo2: "#1d0f2b",
    tinta: "#fff6ea",
    suave: "#b9a9cc",
    tenue: "#7d6c93",
    ambar: "#ffb02e",
    oro: "#ffd34d",
    magenta: "#ff3d84",
    cian: "#2fe3e8",
    verde: "#41e08a",
    rojo: "#ff5a4f",
    papel: "#f5efe4",
    papelSombra: "#d9cfbf",
  };
  // paleta de partículas (índices)
  const PAL = ["#ffd34d", "#ff3d84", "#2fe3e8", "#41e08a", "#ffffff", "#ffb02e", "#b48cff", "#ff7a3d", "#8fd3ff"];

  // ------------------------------------------------------------------ utilidades de dibujo
  const easeOut = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  const easeInOut = (t) => {
    t = Math.min(1, Math.max(0, t));
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  const easeBack = (t) => {
    t = Math.min(1, Math.max(0, t));
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  /** 12345 → "12.345" (sin depender del idioma del navegador). */
  const miles = (n) => (n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : String(n));
  const lerp = (a, b, t) => a + (b - a) * t;

  function rectR(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /**
   * Texto con ajuste automático al ancho: si no cabe en `max`, baja el tamaño (nunca se sale de la pantalla).
   * o: { tam, peso, familia, color, alin, base, max, sombra, glow, espaciado, alfa }
   */
  function texto(ctx, s, x, y, o) {
    let tam = o.tam || 20;
    const fam = o.familia || TEXTO;
    const peso = o.peso || 400;
    ctx.font = `${peso} ${tam}px ${fam}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = o.espaciado ? o.espaciado + "px" : "0px";
    if (o.max) {
      let w = ctx.measureText(s).width;
      while (w > o.max && tam > 8) {
        tam = Math.floor(tam * Math.max(0.6, o.max / w) * 0.99);
        ctx.font = `${peso} ${tam}px ${fam}`;
        w = ctx.measureText(s).width;
      }
    }
    ctx.textAlign = o.alin || "left";
    ctx.textBaseline = o.base || "alphabetic";
    const a0 = ctx.globalAlpha;
    if (o.alfa != null) ctx.globalAlpha = a0 * o.alfa;
    if (o.glow && o.calidad !== "baja") {
      ctx.shadowColor = o.glow;
      ctx.shadowBlur = o.glowTam || 18;
    }
    if (o.trazo) {
      ctx.lineWidth = o.trazoAncho || 4;
      ctx.strokeStyle = o.trazo;
      ctx.lineJoin = "round";
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = o.color || C.tinta;
    ctx.fillText(s, x, y);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.globalAlpha = a0;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    return tam;
  }

  function medir(ctx, s, tam, peso, fam) {
    ctx.font = `${peso || 400} ${tam}px ${fam || TEXTO}`;
    return ctx.measureText(s).width;
  }

  /** Flecha animada que señala hacia una parte de la máquina (arriba-izquierda, arriba-derecha, arriba…). */
  function flecha(ctx, x, y, dir, t, color, tam = 1) {
    const ang = { "arriba-derecha": -Math.PI / 4, "arriba-izquierda": (-3 * Math.PI) / 4, arriba: -Math.PI / 2, derecha: 0, izquierda: Math.PI, abajo: Math.PI / 2 }[dir] ?? -Math.PI / 2;
    const rebote = Math.sin(t / 180) * 7 * tam;
    ctx.save();
    ctx.translate(x + Math.cos(ang) * rebote, y + Math.sin(ang) * rebote);
    ctx.rotate(ang);
    ctx.scale(tam, tam);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(4, -22);
    ctx.lineTo(4, -9);
    ctx.lineTo(-26, -9);
    ctx.lineTo(-26, 9);
    ctx.lineTo(4, 9);
    ctx.lineTo(4, 22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function anillo(ctx, cx, cy, r, grosor, frac, color, fondo) {
    ctx.lineCap = "round";
    ctx.lineWidth = grosor;
    if (fondo) {
      ctx.strokeStyle = fondo;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (frac > 0) {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(frac, 0, 1));
      ctx.stroke();
    }
  }

  /** Silueta para quien no tiene foto (cámara tapada o foto ya borrada). */
  function silueta(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.fillStyle = color || "#3b2c4d";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    const cx = x + w / 2;
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.4, w * 0.19, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.98, w * 0.36, h * 0.33, 0, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  /** Dibuja una imagen recortada para llenar el rectángulo (como object-fit: cover). */
  function cubrir(ctx, img, x, y, w, h, espejo) {
    const iw = img.naturalWidth || img.videoWidth || img.width;
    const ih = img.naturalHeight || img.videoHeight || img.height;
    if (!iw || !ih) return false;
    const k = Math.max(w / iw, h / ih);
    const sw = w / k;
    const sh = h / k;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2.6; // un poco hacia arriba: las caras suelen estar en el tercio de arriba
    ctx.save();
    if (espejo) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, Math.max(0, sy), sw, sh, 0, 0, w, h);
    } else ctx.drawImage(img, sx, Math.max(0, sy), sw, sh, x, y, w, h);
    ctx.restore();
    return true;
  }

  /** Foto tipo polaroid, girada `rot` radianes, centrada en (cx, cy). */
  function polaroid(ctx, img, cx, cy, w, rot, pie, calidad) {
    const marco = w * 0.06;
    const fotoW = w - marco * 2;
    const h = marco + fotoW + w * 0.24;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    if (calidad !== "baja") {
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 10;
    }
    ctx.fillStyle = C.papel;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "transparent";
    const fx = -w / 2 + marco;
    const fy = -h / 2 + marco;
    if (!(img && cubrir(ctx, img, fx, fy, fotoW, fotoW, false))) silueta(ctx, fx, fy, fotoW, fotoW);
    // brillo suave del papel fotográfico
    const g = ctx.createLinearGradient(fx, fy, fx + fotoW, fy + fotoW);
    g.addColorStop(0, "rgba(255,255,255,0.10)");
    g.addColorStop(0.5, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(fx, fy, fotoW, fotoW);
    if (pie) pie(ctx, -w / 2, fy + fotoW, w, h - marco - fotoW);
    ctx.restore();
    return h;
  }

  /** Globo que se infla al soplar. */
  function globo(ctx, cx, cy, r, color, t, estallar) {
    if (r <= 2) return;
    const bamboleo = Math.sin(t / 260) * 0.05;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(bamboleo);
    // cuerda
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.12);
    for (let i = 1; i <= 8; i++) ctx.lineTo(Math.sin(i * 1.3 + t / 300) * 7, r * 1.12 + i * 16);
    ctx.stroke();
    // cuerpo
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.18, color);
    g.addColorStop(1, "#5a0b2e");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.92, r * 1.06, 0, 0, Math.PI * 2);
    ctx.fill();
    // nudo
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.09, r * 1.03);
    ctx.lineTo(r * 0.09, r * 1.03);
    ctx.lineTo(0, r * 1.13);
    ctx.closePath();
    ctx.fill();
    // reflejo
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.38, -r * 0.45, r * 0.13, r * 0.24, -0.5, 0, Math.PI * 2);
    ctx.fill();
    if (estallar) {
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 1.09, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ partículas (memoria fija)
  class Particulas {
    constructor(max) {
      this.max = max;
      this.n = 0;
      this.x = new Float32Array(max);
      this.y = new Float32Array(max);
      this.vx = new Float32Array(max);
      this.vy = new Float32Array(max);
      this.vida = new Float32Array(max);
      this.vidaMax = new Float32Array(max);
      this.tam = new Float32Array(max);
      this.rot = new Float32Array(max);
      this.vrot = new Float32Array(max);
      this.color = new Uint8Array(max);
      this.tipo = new Uint8Array(max); // 0 chispa · 1 cohete · 2 confeti · 3 burbuja · 4 destello
      this.limite = max; // la calidad automática lo baja
    }
    _nueva() {
      if (this.n >= this.limite) return -1;
      return this.n++;
    }
    chispa(x, y, vx, vy, color, vida, tam, tipo = 0) {
      const i = this._nueva();
      if (i < 0) return;
      this.x[i] = x;
      this.y[i] = y;
      this.vx[i] = vx;
      this.vy[i] = vy;
      this.vida[i] = vida;
      this.vidaMax[i] = vida;
      this.tam[i] = tam;
      this.rot[i] = Math.random() * 6.28;
      this.vrot[i] = (Math.random() - 0.5) * 10;
      this.color[i] = color;
      this.tipo[i] = tipo;
    }
    explosion(x, y, color, n, vel) {
      const c2 = (color + 4) % PAL.length;
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2;
        const v = vel * (0.35 + Math.random() * 0.65);
        this.chispa(x, y, Math.cos(a) * v, Math.sin(a) * v, k % 5 === 0 ? c2 : color, 0.9 + Math.random() * 0.8, 2 + Math.random() * 2.2, 0);
      }
      this.chispa(x, y, 0, 0, 4, 0.25, 60, 4);
    }
    cohete(x, y, objetivoY, color) {
      const vy = -Math.sqrt(2 * 520 * Math.max(40, y - objetivoY));
      this.chispa(x, y, (Math.random() - 0.5) * 60, vy, color, 3, 3, 1);
    }
    confeti(n, x0, x1, y) {
      for (let k = 0; k < n; k++) {
        this.chispa(lerp(x0, x1, Math.random()), y - Math.random() * 80, (Math.random() - 0.5) * 90, 40 + Math.random() * 120, Math.floor(Math.random() * PAL.length), 4 + Math.random() * 2.5, 5 + Math.random() * 5, 2);
      }
    }
    burbujas(n, x0, x1, y) {
      for (let k = 0; k < n; k++) {
        this.chispa(lerp(x0, x1, Math.random()), y + Math.random() * 60, (Math.random() - 0.5) * 20, -40 - Math.random() * 90, 8, 3 + Math.random() * 3, 4 + Math.random() * 10, 3);
      }
    }
    actualizar(dt) {
      let i = 0;
      while (i < this.n) {
        this.vida[i] -= dt;
        if (this.vida[i] <= 0) {
          // al morir un cohete, explota
          if (this.tipo[i] === 1) {
            const x = this.x[i];
            const y = this.y[i];
            const c = this.color[i];
            this._quitar(i);
            this.explosion(x, y, c, 70, 260);
            continue;
          }
          this._quitar(i);
          continue;
        }
        const t = this.tipo[i];
        if (t === 0) {
          this.vy[i] += 140 * dt;
          this.vx[i] *= 1 - 1.6 * dt;
          this.vy[i] *= 1 - 1.6 * dt;
        } else if (t === 1) {
          this.vy[i] += 520 * dt;
          if (this.vy[i] > -30) this.vida[i] = 0.0001; // en lo alto: explota en el siguiente paso
          if (Math.random() < 0.6) this.chispa(this.x[i], this.y[i] + 4, (Math.random() - 0.5) * 30, 40, 5, 0.35, 1.6, 0);
        } else if (t === 2) {
          this.vx[i] += Math.sin(this.vida[i] * 3 + i) * 30 * dt;
          this.vy[i] = Math.min(this.vy[i] + 60 * dt, 160);
          this.rot[i] += this.vrot[i] * dt;
        } else if (t === 3) {
          this.vx[i] += Math.sin(this.vida[i] * 4 + i) * 20 * dt;
        }
        this.x[i] += this.vx[i] * dt;
        this.y[i] += this.vy[i] * dt;
        i++;
      }
    }
    _quitar(i) {
      const u = --this.n;
      if (i === u) return;
      this.x[i] = this.x[u];
      this.y[i] = this.y[u];
      this.vx[i] = this.vx[u];
      this.vy[i] = this.vy[u];
      this.vida[i] = this.vida[u];
      this.vidaMax[i] = this.vidaMax[u];
      this.tam[i] = this.tam[u];
      this.rot[i] = this.rot[u];
      this.vrot[i] = this.vrot[u];
      this.color[i] = this.color[u];
      this.tipo[i] = this.tipo[u];
    }
    dibujar(ctx) {
      if (!this.n) return;
      ctx.save();
      // confeti y burbujas: mezcla normal
      for (let i = 0; i < this.n; i++) {
        const t = this.tipo[i];
        if (t !== 2 && t !== 3) continue;
        const a = Math.min(1, this.vida[i] / 0.8);
        ctx.globalAlpha = a;
        if (t === 2) {
          ctx.save();
          ctx.translate(this.x[i], this.y[i]);
          ctx.rotate(this.rot[i]);
          ctx.scale(1, Math.abs(Math.cos(this.rot[i] * 1.7)) + 0.15);
          ctx.fillStyle = PAL[this.color[i]];
          ctx.fillRect(-this.tam[i] / 2, -this.tam[i] * 0.3, this.tam[i], this.tam[i] * 0.6);
          ctx.restore();
        } else {
          ctx.strokeStyle = "rgba(170,225,255,0.85)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(this.x[i], this.y[i], this.tam[i], 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // chispas, cohetes y destellos: mezcla aditiva (brillan)
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < this.n; i++) {
        const t = this.tipo[i];
        if (t === 2 || t === 3) continue;
        const k = this.vida[i] / this.vidaMax[i];
        ctx.globalAlpha = t === 4 ? k * 0.5 : Math.min(1, k * 1.6) * (0.75 + Math.random() * 0.25);
        ctx.fillStyle = PAL[this.color[i]];
        const r = t === 4 ? this.tam[i] * (1.2 - k) : this.tam[i] * (0.5 + k * 0.6);
        ctx.beginPath();
        ctx.arc(this.x[i], this.y[i], r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    vaciar() {
      this.n = 0;
    }
  }

  // ------------------------------------------------------------------ caché de imágenes
  class Imagenes {
    constructor(max = 40) {
      this.max = max;
      this.mapa = new Map();
    }
    obtener(url) {
      if (!url || typeof Image === "undefined") return null;
      let e = this.mapa.get(url);
      if (e) {
        this.mapa.delete(url);
        this.mapa.set(url, e); // más reciente
        return e.lista ? e.img : null;
      }
      const img = new Image();
      e = { img, lista: false, mala: false };
      img.decoding = "async";
      img.onload = () => (e.lista = true);
      img.onerror = () => (e.mala = true);
      img.src = url;
      this.mapa.set(url, e);
      while (this.mapa.size > this.max) {
        const [k, v] = this.mapa.entries().next().value;
        v.img.onload = v.img.onerror = null;
        v.img.src = "";
        this.mapa.delete(k);
      }
      return null;
    }
  }

  /** Caché pequeña de lienzos ya compuestos (polaroids, miniaturas): dibujar una foto escalada cada cuadro
   *  cuesta mucho en la Pi; copiar un lienzo ya hecho, casi nada. */
  class CacheLienzos {
    constructor(max) {
      this.max = max;
      this.m = new Map();
    }
    obtener(clave, w, h, pintar) {
      let c = this.m.get(clave);
      if (c) {
        this.m.delete(clave);
        this.m.set(clave, c);
        return c;
      }
      if (typeof document === "undefined") return null;
      c = document.createElement("canvas");
      c.width = Math.ceil(w);
      c.height = Math.ceil(h);
      pintar(c.getContext("2d"));
      this.m.set(clave, c);
      while (this.m.size > this.max) {
        const k = this.m.keys().next().value;
        const v = this.m.get(k);
        v.width = v.height = 0; // libera la memoria del lienzo
        this.m.delete(k);
      }
      return c;
    }
  }

  // ------------------------------------------------------------------ la pantalla
  class Pantalla {
    /**
     * @param {HTMLCanvasElement} canvas  de 1024 × 600
     * @param {object} o { fuenteCamara: { lista(), dibujar(ctx,x,y,w,h) }, fps, alCuadro(ms) }
     */
    constructor(canvas, o = {}) {
      this.cv = canvas;
      this.cv.width = W;
      this.cv.height = H;
      this.ctx = canvas.getContext("2d", { alpha: false });
      this.camara = o.fuenteCamara || null;
      this.fpsMax = o.fps || 30;
      this.fpsInicial = this.fpsMax;
      this.alCuadro = o.alCuadro || null;
      this.img = new Imagenes(40);
      this.tarjetas = new CacheLienzos(14);
      this.miniaturas = new CacheLienzos(24);
      this.capasLista = new CacheLienzos(3);
      this.textosCache = new Map(); // textos ya pintados (con su brillo): se copian en vez de volver a pintarse
      this.maxTextos = 48;
      this.p = new Particulas(o.maxParticulas || 900);
      this.vista = null;
      this.anterior = null; // para la transición
      this.tTrans = 0;
      this.t0 = 0; // inicio de la fase (ms, reloj de la pantalla)
      this.tFlash = 0;
      this.calidad = o.calidad || "alta";
      this.calidadAuto = !o.calidad;
      this.medias = [];
      this.ultimo = 0;
      this.raf = null;
      this.vivo = false;
      // pantalla de espera
      this.carrusel = { i: 0, desde: 0 };
      this.frase = { i: 0, desde: 0 };
      // resultado
      this.celebrado = { n: -1, ultimoFuego: 0 };
      // anti-quemado: desplazamiento lento de todo el dibujo
      this.deriva = { x: 0, y: 0 };
      this.bokeh = [];
      for (let i = 0; i < 12; i++) this.bokeh.push({ x: Math.random() * W, y: Math.random() * H, r: 30 + Math.random() * 70, v: 4 + Math.random() * 10, c: i % 3, f: Math.random() * 6 });
      this.cuadros = 0;
      this.recibida = 0;
    }

    ahora() {
      return typeof performance !== "undefined" ? performance.now() : Date.now();
    }

    /** Llega una vista nueva de la máquina. */
    mostrar(v) {
      if (!v || typeof v.fase !== "string") return;
      const ahora = this.ahora();
      const d = v.d || {};
      const prev = this.vista;
      const edad = Number.isFinite(v.edad_ms) ? v.edad_ms : 0;
      if (!prev || prev.fase !== v.fase) {
        this.anterior = prev;
        this.tTrans = ahora;
        this.t0 = ahora - edad - (d.transcurrido_ms || 0);
        if (v.fase === "resultado") this.p.vaciar();
        if (v.fase === "espera") this.carrusel.desde = ahora;
      } else if (d.transcurrido_ms !== (prev.d || {}).transcurrido_ms) {
        this.t0 = ahora - edad - (d.transcurrido_ms || 0);
      }
      if (v.fase === "analizando" && d.flash && !(prev && prev.fase === "analizando" && prev.d && prev.d.flash)) this.tFlash = ahora - edad;
      this.recibida = ahora - edad;
      this.vista = v;
    }

    arrancar() {
      if (this.vivo) return;
      this.vivo = true;
      const bucle = (t) => {
        if (!this.vivo) return;
        this.raf = requestAnimationFrame(bucle);
        if (t - this.ultimo < 1000 / this.fpsMax - 2) return;
        const dt = Math.min(0.1, (t - this.ultimo) / 1000 || 0.016);
        this.ultimo = t;
        this.cuadro(dt);
      };
      this.raf = requestAnimationFrame(bucle);
    }

    parar() {
      this.vivo = false;
      if (this.raf) cancelAnimationFrame(this.raf);
    }

    /** Dibuja un cuadro. Se puede llamar a mano (capturas, pruebas). */
    cuadro(dt = 1 / 30) {
      const t0 = this.ahora();
      const ctx = this.ctx;
      try {
        this._cuadro(ctx, dt);
      } catch (e) {
        // un error de dibujo nunca debe parar la pantalla: se pinta un fondo y se sigue
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = C.fondo1;
        ctx.fillRect(0, 0, W, H);
        if (!this.errorVisto) {
          this.errorVisto = true;
          try {
            console.error("[pantalla]", e);
          } catch (x) {
            /* nada */
          }
        }
      }
      const ms = this.ahora() - t0;
      this._medir(ms);
      this.cuadros++;
      if (this.alCuadro) this.alCuadro(ms);
      return ms;
    }

    _medir(ms) {
      this.medias.push(ms);
      if (this.medias.length < 60) return;
      const media = this.medias.reduce((a, b) => a + b, 0) / this.medias.length;
      this.medias.length = 0;
      this.msMedio = media;
      if (!this.calidadAuto) return;
      // primero se quita calidad; si aún así no llega, se bajan los cuadros por segundo (la Pi va sobrada a 20)
      if (this.calidad === "alta" && media > 22) {
        this.calidad = "baja";
        this.p.limite = 320;
      } else if (this.calidad === "baja" && media > 30 && this.fpsMax > 20) {
        this.fpsMax = 20;
      } else if (this.calidad === "baja" && media < 12 && this.fpsMax < this.fpsInicial) {
        this.fpsMax = this.fpsInicial;
      } else if (this.calidad === "baja" && media < 8) {
        this.calidad = "alta";
        this.p.limite = this.p.max;
      }
    }

    _cuadro(ctx, dt) {
      const ahora = this.ahora();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      const v = this.vista || { fase: "arranque", d: {} };
      if (v.fase === "apagada") {
        // sin alimentación (solo en la simulación): pantalla negra
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        this.p.vaciar();
        return;
      }
      // deriva lenta (±4 px en ~7 min) contra el quemado de la pantalla
      this.deriva.x = Math.sin(ahora / 70000) * 4;
      this.deriva.y = Math.cos(ahora / 90000) * 3;
      this._fondo(ctx, v, ahora, dt);
      ctx.save();
      ctx.translate(this.deriva.x, this.deriva.y);
      const kTrans = clamp((ahora - this.tTrans) / 320, 0, 1);
      if (this.anterior && kTrans < 1) {
        ctx.globalAlpha = 1 - kTrans;
        this._escena(ctx, this.anterior, ahora, true);
        ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = kTrans < 1 && this.anterior ? kTrans : 1;
      this._escena(ctx, v, ahora, false);
      ctx.globalAlpha = 1;
      ctx.restore();
      this.p.actualizar(dt);
      this.p.dibujar(ctx);
      if (v.fase === "analizando" && this.tFlash) {
        const k = (ahora - this.tFlash) / 450;
        if (k >= 0 && k < 1) {
          ctx.fillStyle = `rgba(255,255,255,${(1 - k) * 0.95})`;
          ctx.fillRect(0, 0, W, H);
        }
      }
    }

    _escena(ctx, v, ahora, saliendo) {
      const tf = saliendo ? 99999 : ahora - this.t0;
      switch (v.fase) {
        case "espera":
          return this._espera(ctx, v, ahora, tf);
        case "fuera_servicio":
          return this._fuera(ctx, v, ahora);
        case "pagado":
          return this._pagado(ctx, v, ahora, tf);
        case "preparando":
          return this._preparando(ctx, v, ahora, tf);
        case "sopla":
          return this._sopla(ctx, v, ahora, tf);
        case "soplando":
          return this._soplando(ctx, v, ahora, tf, saliendo);
        case "cortado":
          return this._cortado(ctx, v, ahora, tf);
        case "analizando":
          return this._analizando(ctx, v, ahora, tf);
        case "resultado":
          return this._resultado(ctx, v, ahora, tf, saliendo);
        case "aviso":
          return this._aviso(ctx, v, ahora, tf);
        default:
          return this._arranque(ctx, v, ahora);
      }
    }

    /**
     * Texto con caché. Pintar texto con brillo (sombra difuminada) es de lo más caro para la CPU de la Pi; aquí
     * se pinta una vez en un lienzo aparte y después solo se copia. Para textos que cambian en cada cuadro
     * (contadores), o.vivo = true lo pinta directo.
     */
    _t(ctx, s, x, y, o) {
      if (o.vivo || typeof document === "undefined") return texto(ctx, s, x, y, Object.assign({}, o, { calidad: this.calidad }));
      const clave = [s, o.tam, o.peso, o.familia, o.color, o.glow, o.glowTam, o.trazo, o.trazoAncho, o.espaciado, o.max].join("|");
      let e = this.textosCache.get(clave);
      if (e) {
        this.textosCache.delete(clave);
        this.textosCache.set(clave, e);
      } else {
        if (!this._medidor) this._medidor = document.createElement("canvas").getContext("2d");
        const g0 = this._medidor;
        let tam = o.tam || 20;
        const fam = o.familia || TEXTO;
        const peso = o.peso || 400;
        if ("letterSpacing" in g0) g0.letterSpacing = o.espaciado ? o.espaciado + "px" : "0px";
        g0.font = `${peso} ${tam}px ${fam}`;
        if (o.max) {
          let w = g0.measureText(s).width;
          while (w > o.max && tam > 8) {
            tam = Math.floor(tam * Math.max(0.6, o.max / w) * 0.99);
            g0.font = `${peso} ${tam}px ${fam}`;
            w = g0.measureText(s).width;
          }
        }
        g0.textAlign = "left";
        g0.textBaseline = "alphabetic";
        const m = g0.measureText(s);
        const asc = m.actualBoundingBoxAscent || tam * 0.8;
        const desc = m.actualBoundingBoxDescent || tam * 0.2;
        const izq = Math.max(0, m.actualBoundingBoxLeft || 0);
        const der = Math.max(m.width, m.actualBoundingBoxRight || 0);
        const pad = Math.ceil((o.glow ? (o.glowTam || 18) * 1.6 : 0) + (o.trazo ? o.trazoAncho || 4 : 0) + 3);
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.ceil(izq + der + pad * 2));
        c.height = Math.max(1, Math.ceil(asc + desc + pad * 2));
        texto(c.getContext("2d"), s, pad + izq, pad + asc, Object.assign({}, o, { tam, max: undefined, alin: "left", base: "alphabetic", alfa: null, calidad: "alta" }));
        e = { c, ox: pad + izq, oy: pad + asc, w: m.width, asc, desc, tam };
        this.textosCache.set(clave, e);
        while (this.textosCache.size > this.maxTextos) {
          const k = this.textosCache.keys().next().value;
          const v = this.textosCache.get(k);
          v.c.width = v.c.height = 0;
          this.textosCache.delete(k);
        }
      }
      let dx = x;
      if (o.alin === "center") dx = x - e.w / 2;
      else if (o.alin === "right") dx = x - e.w;
      let dy = y;
      if (o.base === "middle") dy = y + (e.asc - e.desc) / 2;
      const a0 = ctx.globalAlpha;
      if (o.alfa != null) ctx.globalAlpha = a0 * o.alfa;
      ctx.drawImage(e.c, dx - e.ox, dy - e.oy);
      ctx.globalAlpha = a0;
      return e.tam;
    }

    /** Luz desenfocada ya pintada (una por color): copiarla escalada es mucho más barato que un degradado. */
    _spriteBokeh(col) {
      return this._capa("bk" + col, (c) => {
        const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 128);
        g.addColorStop(0, `rgba(${col},1)`);
        g.addColorStop(1, `rgba(${col},0)`);
        c.fillStyle = g;
        c.fillRect(W / 2 - 128, H / 2 - 128, 256, 256);
      });
    }

    /**
     * Polaroid con caché: la tarjeta (foto + pie) se compone una vez y luego solo se copia girada.
     * `clave` debe cambiar si cambia algo de la tarjeta; si la foto aún no ha cargado, no se guarda en caché.
     */
    _polaroid(ctx, clave, img, sinFoto, cx, cy, w, rot, pie) {
      const marco = w * 0.06;
      const fotoW = w - marco * 2;
      const h = marco + fotoW + w * 0.24;
      const lista = sinFoto || !!img; // sin foto, la tarjeta (con silueta) ya se puede guardar
      // la sombra va dentro de la tarjeta guardada: así no se calcula en cada cuadro
      const m = 34;
      const pintar = (c) => {
        c.translate(w / 2 + m, h / 2 + m);
        c.shadowColor = "rgba(0,0,0,0.55)";
        c.shadowBlur = 22;
        c.shadowOffsetY = 10;
        c.fillStyle = C.papel;
        c.fillRect(-w / 2, -h / 2, w, h);
        c.shadowColor = "transparent";
        c.shadowBlur = 0;
        c.shadowOffsetY = 0;
        polaroid(c, img, 0, 0, w, 0, pie, "baja");
      };
      const tarjeta = lista ? this.tarjetas.obtener(clave + "|" + w, w + m * 2, h + m * 2, pintar) : null;
      if (!tarjeta) return polaroid(ctx, img, cx, cy, w, rot, pie, "baja");
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(tarjeta, -w / 2 - m, -h / 2 - m);
      ctx.restore();
      return h;
    }

    /** Miniatura redonda (top 10 de la espera), con caché. */
    _miniatura(ctx, url, x, y, d) {
      const im = this.img.obtener(url);
      const c = im
        ? this.miniaturas.obtener(url + "|" + d, d, d, (g) => {
            g.beginPath();
            g.arc(d / 2, d / 2, d / 2, 0, Math.PI * 2);
            g.clip();
            cubrir(g, im, 0, 0, d, d, false);
          })
        : null;
      if (c) ctx.drawImage(c, x, y);
      else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2);
        ctx.clip();
        silueta(ctx, x, y, d, d, "#4a3a5e");
        ctx.restore();
      }
    }

    // ---------------------------------------------------------------- fondo
    /** Lienzo auxiliar (degradado de fondo y viñeta): se pinta una vez por color y luego solo se copia. */
    _capa(clave, pintar) {
      this._capas = this._capas || new Map();
      let c = this._capas.get(clave);
      if (!c && typeof document !== "undefined") {
        c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        pintar(c.getContext("2d"));
        this._capas.set(clave, c);
      }
      return c || null;
    }

    _fondo(ctx, v, ahora, dt) {
      const tonos = {
        sopla: ["#06141c", "#0b2a35"],
        soplando: ["#06141c", "#0c3140"],
        cortado: ["#1a0710", "#2e0b1d"],
        resultado: ["#120a05", "#2b1708"],
        fuera_servicio: ["#0a0a0c", "#16161c"],
        aviso: ["#140a0e", "#24121a"],
      };
      const [a, b] = tonos[v.fase] || [C.fondo1, C.fondo2];
      // degradado de fondo y viñeta, compuestos una sola vez por color
      const fondo = this._capa("f" + a + b, (c) => {
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, a);
        g.addColorStop(1, b);
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
        const vg = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, "rgba(0,0,0,0.55)");
        c.fillStyle = vg;
        c.fillRect(0, 0, W, H);
      });
      if (fondo) ctx.drawImage(fondo, 0, 0);
      else {
        ctx.fillStyle = a;
        ctx.fillRect(0, 0, W, H);
      }
      // luces desenfocadas de bar que flotan (movimiento continuo); con calidad baja, la mitad
      const cols = v.fase === "sopla" || v.fase === "soplando" ? ["47,227,232", "80,160,255", "47,227,232"] : v.fase === "resultado" ? ["255,211,77", "255,176,46", "255,61,132"] : ["255,176,46", "255,61,132", "180,140,255"];
      const n = this.calidad === "baja" ? 6 : this.bokeh.length;
      const a0 = ctx.globalAlpha;
      for (let i = 0; i < n; i++) {
        const b2 = this.bokeh[i];
        b2.y -= b2.v * dt;
        b2.x += Math.sin(ahora / 4000 + b2.f) * 4 * dt;
        if (b2.y < -b2.r) {
          b2.y = H + b2.r;
          b2.x = Math.random() * W;
        }
        const sp = this._spriteBokeh(cols[b2.c]);
        ctx.globalAlpha = (0.05 + 0.04 * Math.sin(ahora / 1700 + b2.f)) * 1.6;
        if (sp) ctx.drawImage(sp, W / 2 - 128, H / 2 - 128, 256, 256, b2.x - b2.r, b2.y - b2.r, b2.r * 2, b2.r * 2);
      }
      ctx.globalAlpha = a0;
    }

    _chipPrecio(ctx, v, x, y) {
      const s = v.gratis ? "GRATIS · PRUEBAS" : v.precio;
      const w = medir(ctx, s, 26, 900, DISPLAY) + 28;
      rectR(ctx, x - w, y, w, 40, 20);
      ctx.fillStyle = v.gratis ? C.cian : C.ambar;
      ctx.fill();
      this._t(ctx, s, x - w / 2, y + 30, { tam: 26, peso: 900, familia: DISPLAY, color: "#1b0d02", alin: "center" });
      return w;
    }

    _letraPequena(ctx, y, alfa = 1) {
      this._t(ctx, T.LEGAL, W / 2, y, { tam: 12.5, color: C.tenue, alin: "center", max: W - 60, alfa });
    }

    // ---------------------------------------------------------------- escenas
    _arranque(ctx, v, ahora) {
      this._t(ctx, "ALCOHOLÍMETRO", W / 2, H / 2 - 10, { tam: 86, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta, glow: C.magenta, calidad: this.calidad });
      const n = Math.floor(ahora / 300) % 4;
      this._t(ctx, "Arrancando" + ".".repeat(n), W / 2, H / 2 + 46, { tam: 22, color: C.suave, alin: "center" });
    }

    _fuera(ctx, v, ahora) {
      const y = H / 2 + Math.sin(ahora / 5000) * 30;
      this._t(ctx, T.FUERA.titulo, W / 2, y - 10, { tam: 92, peso: 900, familia: DISPLAY, alin: "center", color: C.suave });
      this._t(ctx, T.FUERA.sub, W / 2, y + 44, { tam: 26, peso: 600, alin: "center", color: C.tenue });
      if (v.d && v.d.motivo) this._t(ctx, "(" + v.d.motivo + ")", W / 2, H - 40, { tam: 14, alin: "center", color: "#5b4d6b" });
    }

    _espera(ctx, v, ahora, tf) {
      const top = v.top || [];
      const puedePagar = v.pago && v.pago.estado === "esperando_tarjeta" && !(v.pausa_ms > 0);
      // --- cabecera: llamada a pagar, con flecha hacia el lector
      const pos = (v.posiciones && v.posiciones.lector) || "arriba-derecha";
      if (puedePagar || v.gratis) {
        const pulso = 1 + Math.sin(ahora / 420) * 0.012;
        ctx.save();
        ctx.translate(36, 62);
        ctx.scale(pulso, pulso);
        this._t(ctx, v.gratis ? "MODO PRUEBAS: LA PRUEBA EMPIEZA SOLA" : T.CTA_PAGO.toUpperCase(), 0, 0, { tam: 42, peso: 900, familia: DISPLAY, color: C.tinta, max: 760, glow: "rgba(255,176,46,0.55)", glowTam: 14, calidad: this.calidad });
        ctx.restore();
        const wc = this._chipPrecio(ctx, v, 930, 26);
        if (!v.gratis) flecha(ctx, 975, 48, pos, ahora, C.ambar, 0.9);
        void wc;
      } else {
        const quedan = Math.ceil((v.pausa_ms - (ahora - this.recibida)) / 1000);
        const espera = v.pausa_ms > 0 ? (quedan > 0 ? `PREPARANDO LA MÁQUINA · ${quedan} s` : "UN MOMENTO…") : T.PAGO_NO_DISPONIBLE.toUpperCase();
        this._t(ctx, v.pago && v.pago.estado === "abriendo" ? "UN MOMENTO…" : espera, 36, 62, { tam: 38, peso: 900, familia: DISPLAY, color: C.suave, max: 800 });
        if (v.pago && v.pago.motivo && v.pago.estado === "no_disponible") this._t(ctx, v.pago.motivo, 38, 84, { tam: 14, color: C.tenue, max: 700 });
      }
      if (v.pago && v.pago.estado === "rechazado") {
        rectR(ctx, 36, 76, 420, 34, 8);
        ctx.fillStyle = "rgba(255,90,79,0.18)";
        ctx.fill();
        this._t(ctx, "Pago rechazado: prueba con otra tarjeta o el móvil", 48, 99, { tam: 16, peso: 600, color: C.rojo });
      }

      // --- carrusel del top 10 (izquierda)
      const n = top.length;
      if (!n) {
        this._primero(ctx, ahora);
      } else {
        const paso = 6000;
        if (ahora - this.carrusel.desde > paso) {
          this.carrusel.i = (this.carrusel.i + 1) % n;
          this.carrusel.desde = ahora;
        }
        if (this.carrusel.i >= n) this.carrusel.i = 0;
        const k = (ahora - this.carrusel.desde) / paso;
        const e = top[this.carrusel.i];
        const entra = easeBack(k * 6);
        const sale = k > 0.9 ? easeInOut((k - 0.9) * 10) : 0;
        const cx = lerp(560, 220, entra) - sale * 420;
        const rot = (this.carrusel.i % 2 ? 0.05 : -0.045) + (1 - entra) * 0.25 - sale * 0.3;
        ctx.save();
        ctx.globalAlpha *= 1 - sale;
        const img = this.img.obtener(e.foto);
        // las imágenes del siguiente se piden antes de que hagan falta
        if (n > 1) this.img.obtener(top[(this.carrusel.i + 1) % n].foto);
        this._polaroid(ctx, `top:${e.id}:${e.puesto}:${e.valor}:${e.fecha}:${e.foto ? 1 : 0}`, img, !e.foto, cx, 300, 300, rot, (c, x, y, w, h) => {
          texto(c, "#" + e.puesto, x + 22, y + h * 0.62, { tam: 40, peso: 900, familia: DISPLAY, color: "#2a1a10" });
          texto(c, `${e.valor} ${v.unidad}`, x + w - 22, y + h * 0.62, { tam: 40, peso: 900, familia: DISPLAY, color: e.puesto === 1 ? "#b8121f" : "#2a1a10", alin: "right" });
          texto(c, e.fecha || "", x + w - 22, y + h * 0.9, { tam: 15, color: "#7a6a5a", alin: "right" });
          if (!e.foto) texto(c, "sin foto", x + 22, y + h * 0.9, { tam: 15, color: "#7a6a5a" });
        });
        ctx.restore();
        // medalla brillante del puesto al lado de la foto
        if (e.puesto <= 3 && entra > 0.8 && !sale) {
          const col = [C.oro, "#d8dde6", "#e0a46a"][e.puesto - 1];
          const r = 34 + Math.sin(ahora / 300) * 2;
          ctx.save();
          ctx.translate(cx + 148, 162);
          ctx.rotate(Math.sin(ahora / 900) * 0.15);
          ctx.fillStyle = col;
          ctx.beginPath();
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            const rr = i % 2 ? r * 0.78 : r;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath();
          ctx.fill();
          this._t(ctx, e.puesto + "º", 0, 12, { tam: 34, peso: 900, familia: DISPLAY, color: "#2a1a10", alin: "center" });
          ctx.restore();
        }
      }

      // --- lista del top 10 (derecha): se compone en una capa y solo se rehace al cambiar algo
      const x0 = 600;
      const y0 = 116;
      const listas = top.map((e) => (e.foto ? (this.img.obtener(e.foto) ? 1 : 0) : 2)).join("");
      const actualI = n ? this.carrusel.i : -1;
      const claveLista = top.map((e) => `${e.id}:${e.valor}`).join(",") + `|${listas}|${actualI}|${v.total}|${v.unidad}`;
      const capa = this.capasLista.obtener(claveLista, 400, 400, (g) => this._pintarLista(g, top, actualI, v));
      if (capa) ctx.drawImage(capa, x0 - 5, y0 - 30);
      else this._pintarLista(ctx, top, actualI, v, x0 - 5, y0 - 30);
      // brillo que recorre las barras (lo único que se mueve en la lista)
      if (n) {
        const i = Math.floor(ahora / 500) % 12;
        if (i < n) {
          ctx.save();
          ctx.globalAlpha *= 0.35;
          ctx.fillStyle = C.oro;
          rectR(ctx, x0 + 80, y0 + 8 + i * 36 + 11, 200 * clamp((parseFloat(String(top[i].valor).replace(",", ".")) || 0) / (parseFloat(String(top[0].valor).replace(",", ".")) || 1), 0.03, 1), 10, 5);
          ctx.fill();
          ctx.restore();
        }
      }

      // --- frase que va cambiando y letra pequeña
      const frases = T.frasesEspera({ record: v.record, total: v.total, precio: v.precio });
      if (frases.length) {
        const paso = 4500;
        if (ahora - this.frase.desde > paso) {
          this.frase.i = (this.frase.i + 1) % frases.length;
          this.frase.desde = ahora;
        }
        const k = (ahora - this.frase.desde) / paso;
        const a = Math.min(1, k * 6, (1 - k) * 6);
        this._t(ctx, frases[this.frase.i % frases.length], W / 2, 528 + (1 - easeOut(k * 5)) * 10, { tam: 27, peso: 800, color: C.tinta, alin: "center", alfa: a, max: W - 80 });
      }
      this._t(ctx, T.AVISO_FOTO, W / 2, 562, { tam: 12.5, color: C.suave, alin: "center", max: W - 60 });
      this._letraPequena(ctx, 582);
    }

    /** Lista del top 10 (para la capa de la espera). (ox, oy): esquina de la capa. */
    _pintarLista(g, top, actualI, v, ox = 0, oy = 0) {
      const n = top.length;
      const x0 = ox + 5;
      const y0 = oy + 30;
      texto(g, "TOP 10 · RANKING HISTÓRICO", x0, y0 - 8, { tam: 15, peso: 800, color: C.ambar, espaciado: 1.5 });
      if (v.total) texto(g, `${miles(v.total)} ${v.total === 1 ? "prueba" : "pruebas"}`, x0 + 390, y0 - 8, { tam: 14, color: C.suave, alin: "right" });
      const maxV = n ? parseFloat(String(top[0].valor).replace(",", ".")) || 1 : 1;
      for (let i = 0; i < 10; i++) {
        const e = top[i];
        const y = y0 + 8 + i * 36;
        const actual = i === actualI;
        rectR(g, x0, y, 390, 31, 7);
        g.fillStyle = actual ? "rgba(255,176,46,0.22)" : "rgba(255,255,255,0.045)";
        g.fill();
        if (actual) {
          g.strokeStyle = "rgba(255,176,46,0.8)";
          g.lineWidth = 1.5;
          g.stroke();
        }
        texto(g, String(i + 1), x0 + 22, y + 23, { tam: 22, peso: 900, familia: DISPLAY, color: i < 3 ? [C.oro, "#d8dde6", "#e0a46a"][i] : C.suave, alin: "center" });
        if (!e) {
          texto(g, "— libre —", x0 + 48, y + 21, { tam: 14, color: "#5d4e70" });
          continue;
        }
        this._miniatura(g, e.foto, x0 + 45, y + 3, 26);
        const val = parseFloat(String(e.valor).replace(",", ".")) || 0;
        const anchoBarra = 200 * clamp(val / maxV, 0.03, 1);
        const gb = g.createLinearGradient(x0 + 80, 0, x0 + 80 + anchoBarra, 0);
        gb.addColorStop(0, "rgba(255,61,132,0.9)");
        gb.addColorStop(1, "rgba(255,176,46,0.95)");
        rectR(g, x0 + 80, y + 11, anchoBarra, 10, 5);
        g.fillStyle = gb;
        g.fill();
        texto(g, `${e.valor}`, x0 + 378, y + 23, { tam: 22, peso: 800, familia: DISPLAY, color: C.tinta, alin: "right" });
      }
    }

    _primero(ctx, ahora) {
      const y = 300 + Math.sin(ahora / 900) * 8;
      polaroid(ctx, null, 250, y, 290, -0.04, (c, x, yy, w, h) => {
        texto(c, "¿SERÁS TÚ?", x + w / 2, yy + h * 0.68, { tam: 38, peso: 900, familia: DISPLAY, color: "#2a1a10", alin: "center" });
      }, this.calidad);
      this._t(ctx, "SÉ EL PRIMERO", 250, 112 + Math.sin(ahora / 700) * 4, { tam: 30, peso: 900, familia: DISPLAY, color: C.oro, alin: "center", glow: C.ambar, calidad: this.calidad });
      if (Math.random() < 0.05) this.p.chispa(120 + Math.random() * 260, 180 + Math.random() * 260, 0, -10, 0, 0.6, 2.5, 0);
    }

    _pagado(ctx, v, ahora, tf) {
      const k = easeOut(tf / 700);
      const cx = W / 2;
      const cy = 250;
      ctx.strokeStyle = `rgba(65,224,138,${1 - k})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + k * 260, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = C.verde;
      ctx.beginPath();
      ctx.arc(cx, cy, 78 * easeBack(tf / 450), 0, Math.PI * 2);
      ctx.fill();
      // ✓ dibujado
      const kc = clamp((tf - 250) / 400, 0, 1);
      ctx.strokeStyle = "#08321b";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const p = [
        [cx - 34, cy + 2],
        [cx - 8, cy + 28],
        [cx + 38, cy - 24],
      ];
      ctx.moveTo(p[0][0], p[0][1]);
      if (kc < 0.4) ctx.lineTo(lerp(p[0][0], p[1][0], kc / 0.4), lerp(p[0][1], p[1][1], kc / 0.4));
      else {
        ctx.lineTo(p[1][0], p[1][1]);
        ctx.lineTo(lerp(p[1][0], p[2][0], (kc - 0.4) / 0.6), lerp(p[1][1], p[2][1], (kc - 0.4) / 0.6));
      }
      ctx.stroke();
      const d = v.d || {};
      this._t(ctx, T.PAGADO.titulo, cx, 420, { tam: 64, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta, alfa: clamp(tf / 300, 0, 1) });
      this._t(ctx, d.credito ? T.PAGADO.credito : T.PAGADO.sub, cx, 468, { tam: 26, peso: 600, alin: "center", color: C.suave, alfa: clamp((tf - 200) / 300, 0, 1) });
      if (tf < 60 && !this._chispaPagado) {
        this._chispaPagado = true;
        this.p.explosion(cx, cy, 3, 50, 300);
      }
      if (tf > 1000) this._chispaPagado = false;
    }

    _pasos(ctx, x, y, activo, ahora) {
      const pasos = T.PREPARANDO.pasos;
      for (let i = 0; i < pasos.length; i++) {
        const yy = y + i * 74;
        const on = i === activo;
        const hecho = i < activo;
        rectR(ctx, x, yy, 470, 60, 14);
        ctx.fillStyle = on ? "rgba(255,176,46,0.18)" : "rgba(255,255,255,0.05)";
        ctx.fill();
        if (on) {
          ctx.strokeStyle = C.ambar;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.fillStyle = hecho ? C.verde : on ? C.ambar : "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.arc(x + 34, yy + 30, 17, 0, Math.PI * 2);
        ctx.fill();
        this._t(ctx, hecho ? "✓" : String(i + 1), x + 34, yy + 38, { tam: 22, peso: 900, familia: DISPLAY, color: "#1b0d02", alin: "center" });
        this._t(ctx, pasos[i], x + 64, yy + 38, { tam: 23, peso: on ? 800 : 600, color: on || hecho ? C.tinta : C.suave, max: 390 });
      }
    }

    _preparando(ctx, v, ahora, tf) {
      const d = v.d || {};
      const dur = d.duracion_ms || 10000;
      const frac = clamp(tf / dur, 0, 1);
      this._t(ctx, T.PREPARANDO.titulo, W / 2, 84, { tam: 54, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta });
      const cx = 250;
      const cy = 320;
      anillo(ctx, cx, cy, 120, 18, frac, C.ambar, "rgba(255,255,255,0.08)");
      const seg = Math.max(0, Math.ceil((dur - tf) / 1000));
      this._t(ctx, String(seg), cx, cy + 40, { tam: 120, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta });
      this._t(ctx, "segundos", cx, cy + 74, { tam: 18, color: C.suave, alin: "center" });
      this._pasos(ctx, 470, 190, Math.min(2, Math.floor(frac * 3)), ahora);
      // la boquilla está encima de la pantalla
      const pb = (v.posiciones && v.posiciones.boquilla) || "arriba-izquierda";
      flecha(ctx, pb.includes("izquierda") ? 60 : W - 60, 50, pb, ahora, C.cian, 1);
      this._t(ctx, "boquilla", pb.includes("izquierda") ? 100 : W - 100, 56, { tam: 18, peso: 800, color: C.cian, alin: pb.includes("izquierda") ? "left" : "right" });
      this._t(ctx, T.PREPARANDO.nota + (d.cortes ? ` · intento ${d.cortes + 1}` : ""), W / 2, 540, { tam: 24, peso: 800, color: C.magenta, alin: "center", alfa: 0.75 + 0.25 * Math.sin(ahora / 250) });
      this._letraPequena(ctx, 584);
    }

    _sopla(ctx, v, ahora, tf) {
      const d = v.d || {};
      const pulso = 1 + 0.06 * Math.sin(ahora / 160);
      ctx.save();
      ctx.translate(380, 250);
      ctx.scale(pulso, pulso);
      this._t(ctx, T.SOPLA.titulo, 0, 0, { tam: 190, peso: 900, familia: DISPLAY, alin: "center", base: "middle", color: C.tinta, glow: C.cian, glowTam: 30, calidad: this.calidad });
      ctx.restore();
      this._t(ctx, `${T.SOPLA.sub}, ${d.segundos || 4} segundos`, 380, 382, { tam: 30, peso: 800, alin: "center", color: C.cian });
      globo(ctx, 790, 250, 46 + Math.sin(ahora / 300) * 3, C.magenta, ahora);
      const pb = (v.posiciones && v.posiciones.boquilla) || "arriba-izquierda";
      flecha(ctx, pb.includes("izquierda") ? 70 : W - 70, 60, pb, ahora, C.cian, 1.25);
      // tiempo que el sensor espera el soplido (1 min)
      const lim = d.limite_ms || 60000;
      const quedan = Math.max(0, Math.ceil((lim - tf) / 1000));
      rectR(ctx, 212, 452, 600, 12, 6);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fill();
      rectR(ctx, 212, 452, 600 * clamp(1 - tf / lim, 0, 1), 12, 6);
      ctx.fillStyle = quedan <= 15 ? C.magenta : "rgba(47,227,232,0.7)";
      ctx.fill();
      this._t(ctx, `Tienes ${quedan} s para empezar a soplar` + (d.cortes ? ` · intento ${d.cortes + 1} de ${d.max_cortes}` : ""), W / 2, 500, { tam: 20, color: C.suave, alin: "center" });
      this._letraPequena(ctx, 584);
    }

    _soplando(ctx, v, ahora, tf, saliendo) {
      const d = v.d || {};
      const dur = d.duracion_ms || 4000;
      const frac = clamp(tf / dur, 0, 1);
      const frases = T.SOPLANDO;
      const f = frases[Math.min(frases.length - 1, Math.floor(frac * frases.length))];
      this._t(ctx, f, 330, 150, { tam: 92, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta, glow: C.magenta, calidad: this.calidad });
      const r = 50 + easeOut(frac) * 150;
      globo(ctx, 760, 300 - frac * 30, r, C.magenta, ahora, frac >= 1);
      // barra por segundos
      const segs = Math.round(dur / 1000);
      const x0 = 80;
      const ancho = 500;
      for (let i = 0; i < segs; i++) {
        const w = ancho / segs - 8;
        const x = x0 + i * (ancho / segs);
        const k = clamp(frac * segs - i, 0, 1);
        rectR(ctx, x, 260, w, 70, 12);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fill();
        if (k > 0) {
          rectR(ctx, x, 260, w * k, 70, 12);
          const g = ctx.createLinearGradient(x, 260, x, 330);
          g.addColorStop(0, C.cian);
          g.addColorStop(1, "#1a8fa0");
          ctx.fillStyle = g;
          ctx.fill();
        }
        this._t(ctx, String(i + 1), x + w / 2, 312, { tam: 40, peso: 900, familia: DISPLAY, alin: "center", color: k >= 1 ? "#05262c" : "rgba(255,255,255,0.35)" });
      }
      this._t(ctx, `${Math.round(frac * 100)} %`, 330, 400, { tam: 48, peso: 900, familia: DISPLAY, alin: "center", color: C.cian, vivo: true });
      this._t(ctx, "No pares hasta que se llene", 330, 446, { tam: 22, color: C.suave, alin: "center" });
      if (!saliendo && Math.random() < 0.5) this.p.chispa(760 + (Math.random() - 0.5) * r, 300 + r, (Math.random() - 0.5) * 40, 40 + Math.random() * 60, 2, 0.6, 2, 0);
      this._ultimoGlobo = { r, frac };
      this._letraPequena(ctx, 584);
    }

    _cortado(ctx, v, ahora, tf) {
      const d = v.d || {};
      const espera = d.espera_ms || 13000;
      const k = clamp(tf / 900, 0, 1);
      globo(ctx, 760 + k * 120, 300 - k * 200, 120 * (1 - easeOut(k)), C.magenta, ahora);
      this._t(ctx, T.CORTADO.titulo, 360, 200, { tam: 110, peso: 900, familia: DISPLAY, alin: "center", color: C.magenta, glow: C.magenta, calidad: this.calidad });
      this._t(ctx, `Hay que soplar ${d.segundos || 4} segundos seguidos`, 360, 262, { tam: 30, peso: 800, alin: "center", color: C.tinta });
      const seg = Math.max(0, Math.ceil((espera - tf) / 1000));
      this._t(ctx, `Prepárate: otra vez en ${seg} s`, 360, 330, { tam: 28, peso: 600, alin: "center", color: C.suave });
      if (d.max_cortes) this._t(ctx, `Intento ${d.cortes + 1} de ${d.max_cortes}`, 360, 380, { tam: 22, peso: 600, alin: "center", color: C.tenue });
      this._letraPequena(ctx, 584);
    }

    _analizando(ctx, v, ahora, tf) {
      const d = v.d || {};
      const cuenta = d.cuenta_ms || 5000;
      const x = 152;
      const y = 92;
      const w = 720;
      const h = 405;
      // marco de la "cámara"
      ctx.save();
      rectR(ctx, x - 6, y - 6, w + 12, h + 12, 26);
      ctx.fillStyle = d.flash ? C.papel : "rgba(47,227,232,0.55)";
      ctx.fill();
      rectR(ctx, x, y, w, h, 20);
      ctx.clip();
      ctx.fillStyle = "#05070a";
      ctx.fillRect(x, y, w, h);
      let pintada = false;
      if (d.flash) {
        const img = this.img.obtener(d.foto);
        if (img) pintada = cubrir(ctx, img, x, y, w, h, false);
        if (!pintada) {
          silueta(ctx, x, y, w, h, "#1d1626");
          this._t(ctx, d.tapada ? "Sin foto: cámara tapada" : d.foto ? "" : "Sin foto", x + w / 2, y + h - 30, { tam: 24, peso: 800, alin: "center", color: C.suave });
        }
      } else if (d.camara && this.camara && this.camara.lista()) {
        pintada = this.camara.dibujar(ctx, x, y, w, h);
      }
      if (!d.flash && !pintada) {
        // sin imagen en directo: ondas del análisis
        for (let i = 0; i < 5; i++) {
          const r = ((ahora / 12 + i * 60) % 300) + 10;
          ctx.strokeStyle = `rgba(47,227,232,${0.6 * (1 - r / 310)})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
      if (!d.flash) {
        // cuenta atrás grande
        const quedan = Math.max(0, cuenta - tf);
        const n = Math.ceil(quedan / 1000);
        const k = 1 - (quedan % 1000) / 1000;
        if (n > 0) {
          const esc = 1.25 - easeOut(k) * 0.25;
          ctx.save();
          ctx.translate(x + w / 2, y + h / 2);
          ctx.scale(esc, esc);
          this._t(ctx, String(n), 0, 0, { tam: 230, peso: 900, familia: DISPLAY, alin: "center", base: "middle", color: "rgba(255,255,255,0.92)", trazo: "rgba(0,0,0,0.55)", trazoAncho: 10 });
          ctx.restore();
          anillo(ctx, x + w / 2, y + h / 2, 150, 10, 1 - k, "rgba(255,255,255,0.8)");
        }
        this._t(ctx, T.ANALIZANDO.titulo, W / 2, 62, { tam: 50, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta, glow: C.cian, calidad: this.calidad });
        const pc = (v.posiciones && v.posiciones.camara) || "arriba-izquierda";
        flecha(ctx, pc.includes("izquierda") ? 70 : W - 70, 54, pc, ahora, C.cian, 1);
        this._t(ctx, T.ANALIZANDO.tapa, W / 2, 586, { tam: 16, color: C.suave, alin: "center" });
      } else {
        this._t(ctx, "¡FOTO!", W / 2, 62, { tam: 50, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta });
      }
      // ficha "analizando"
      const puntos = ".".repeat(1 + (Math.floor(ahora / 350) % 3));
      rectR(ctx, W / 2 - 150, 516, 300, 42, 21);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fill();
      ctx.save();
      ctx.translate(W / 2 - 122, 537);
      ctx.rotate(ahora / 160);
      anillo(ctx, 0, 0, 11, 4, 0.7, C.ambar);
      ctx.restore();
      this._t(ctx, "Analizando tu soplido" + puntos, W / 2 + 10, 545, { tam: 20, peso: 600, alin: "center", color: C.tinta });
    }

    _resultado(ctx, v, ahora, tf, saliendo) {
      const d = v.d || {};
      // --- foto (cae desde arriba)
      const kf = easeBack(tf / 700);
      const img = this.img.obtener(d.foto);
      this._polaroid(ctx, `res:${d.id}:${d.foto_estado}`, img, !d.foto, 250, lerp(-260, 296, kf), 330, lerp(-0.4, -0.05, kf), (c, x, y, w, h) => {
        const pie = d.foto_estado === "top" ? "¡Tu foto se queda en el top 10!" : d.foto_estado === "24h" ? "Tu foto se borra en 24 h" : d.foto_estado === "tapada" ? "Sin foto (cámara tapada)" : "Sin foto";
        texto(c, pie, x + w / 2, y + h * 0.6, { tam: 18, peso: 700, color: "#3a2a1a", alin: "center", max: w - 30 });
      });
      // --- valor que sube contando
      const kv = easeOut((tf - 350) / 1500);
      const valorNum = parseFloat(String(d.valor || "0").replace(",", ".")) || 0;
      const dec = String(d.valor || "").includes(",") ? String(d.valor).split(",")[1].length : 0;
      const mostrado = (valorNum * kv).toFixed(dec).replace(".", ",");
      const xr = 735;
      this._t(ctx, "TU RESULTADO", xr, 96, { tam: 20, peso: 800, color: C.ambar, alin: "center", espaciado: 2, alfa: clamp(tf / 300, 0, 1) });
      const tamV = this._t(ctx, mostrado, xr - 30, 238, { tam: 170, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta, glow: "rgba(255,211,77,0.75)", glowTam: 28, max: 400, vivo: kv < 1 });
      this._t(ctx, d.unidad || v.unidad || "", xr - 30 + medir(ctx, mostrado, tamV, 900, DISPLAY) / 2 + 8, 238, { tam: 40, peso: 800, familia: DISPLAY, color: C.oro });
      if (d.saturado) this._t(ctx, "(lo máximo que mide el sensor)", xr, 270, { tam: 15, color: C.suave, alin: "center" });
      // --- titular
      const kt = easeBack((tf - 1800) / 450);
      if (tf > 1800) {
        ctx.save();
        ctx.translate(xr, 318);
        ctx.scale(kt, kt);
        this._t(ctx, d.titular || "", 0, 0, { tam: 46, peso: 900, familia: DISPLAY, alin: "center", color: d.celebracion === "record" || d.celebracion === "top10" ? C.oro : C.tinta, max: 470, glow: d.celebracion === "record" ? C.magenta : null, calidad: this.calidad });
        ctx.restore();
        this._t(ctx, d.frase || "", xr, 352, { tam: 19, peso: 600, alin: "center", color: C.suave, max: 480, alfa: clamp((tf - 2000) / 400, 0, 1) });
      }
      // --- puesto en el ranking
      if (tf > 2500) {
        const a = clamp((tf - 2500) / 400, 0, 1);
        const y = 410;
        const linea = `PUESTO ${d.puesto} DE ${d.total}`;
        this._t(ctx, linea, xr, y, { tam: 40, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta, alfa: a });
        if (d.top_pct != null) {
          const s = `TOP ${d.top_pct} %`;
          const w = medir(ctx, s, 26, 900, DISPLAY) + 30;
          rectR(ctx, xr - w / 2, y + 14, w, 38, 19);
          ctx.globalAlpha = a;
          ctx.fillStyle = d.top_pct <= 10 ? C.magenta : C.ambar;
          ctx.fill();
          ctx.globalAlpha = 1;
          this._t(ctx, s, xr, y + 42, { tam: 26, peso: 900, familia: DISPLAY, alin: "center", color: "#1b0d02", alfa: a });
          // barra del ranking: de más (izquierda) a menos; la marca cae en tu puesto
          const bx = xr - 230;
          const bw = 460;
          const by = y + 72;
          const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
          g.addColorStop(0, C.magenta);
          g.addColorStop(0.5, C.ambar);
          g.addColorStop(1, "#4a3a5e");
          rectR(ctx, bx, by, bw, 10, 5);
          ctx.globalAlpha = a;
          ctx.fillStyle = g;
          ctx.fill();
          const pos = bx + bw * clamp((d.puesto - 1) / Math.max(1, d.total - 1), 0, 1) * easeOut((tf - 2600) / 900);
          ctx.fillStyle = C.tinta;
          ctx.beginPath();
          ctx.moveTo(pos, by - 4);
          ctx.lineTo(pos - 9, by - 18);
          ctx.lineTo(pos + 9, by - 18);
          ctx.closePath();
          ctx.fill();
          this._t(ctx, "más", bx, by + 28, { tam: 13, color: C.suave });
          this._t(ctx, "menos", bx + bw, by + 28, { tam: 13, color: C.suave, alin: "right" });
          ctx.globalAlpha = 1;
        }
      }
      this._t(ctx, "Orientativo · No sirve para saber si puedes conducir · Si bebes, no conduzcas", W / 2, 584, { tam: 14, color: C.suave, alin: "center", max: W - 40 });
      // tiempo que queda en pantalla
      const dur = d.duracion_ms || 20000;
      rectR(ctx, 0, H - 4, W * clamp(1 - tf / dur, 0, 1), 4, 2);
      ctx.fillStyle = "rgba(255,176,46,0.5)";
      ctx.fill();
      if (!saliendo) this._celebrar(v, d, ahora, tf);
    }

    _celebrar(v, d, ahora, tf) {
      const c = d.celebracion;
      const p = this.p;
      if (this.celebrado.n !== v.n && tf > 300) {
        this.celebrado.n = v.n;
        this.celebrado.ultimoFuego = 0;
        if (c === "record" || c === "top10") p.confeti(c === "record" ? 160 : 90, 0, W, -10);
        else if (c === "alto") p.confeti(70, 0, W, -10);
        else if (c === "medio") p.confeti(40, W * 0.45, W, -10);
        else if (c === "cero") p.burbujas(40, 0, W, H);
        else p.explosion(735, 220, 0, 40, 220);
      }
      const cada = c === "record" ? 380 : c === "top10" ? 650 : c === "alto" ? 1300 : 0;
      if (cada && tf > 1200 && tf < 15000 && ahora - this.celebrado.ultimoFuego > cada) {
        this.celebrado.ultimoFuego = ahora;
        p.cohete(80 + Math.random() * (W - 160), H + 10, 60 + Math.random() * 200, Math.floor(Math.random() * PAL.length));
      }
      if (c === "cero" && Math.random() < 0.15) p.burbujas(1, 0, W, H);
      if ((c === "record" || c === "top10") && Math.random() < 0.08) p.confeti(1, 0, W, -10);
    }

    _aviso(ctx, v, ahora, tf) {
      const d = v.d || {};
      const k = easeBack(tf / 450);
      ctx.save();
      ctx.translate(W / 2, H / 2 - 20);
      ctx.scale(k, k);
      rectR(ctx, -380, -170, 760, 330, 28);
      ctx.fillStyle = "rgba(30,16,26,0.92)";
      ctx.fill();
      ctx.strokeStyle = d.tipo === "error" ? C.magenta : C.cian;
      ctx.lineWidth = 3;
      ctx.stroke();
      // icono
      ctx.fillStyle = d.tipo === "error" ? C.magenta : C.cian;
      ctx.beginPath();
      ctx.moveTo(0, -140);
      ctx.lineTo(38, -78);
      ctx.lineTo(-38, -78);
      ctx.closePath();
      ctx.fill();
      this._t(ctx, "!", 0, -86, { tam: 40, peso: 900, familia: DISPLAY, alin: "center", color: "#1b0d02" });
      this._t(ctx, (d.titulo || "").toUpperCase(), 0, -10, { tam: 60, peso: 900, familia: DISPLAY, alin: "center", color: C.tinta, max: 700 });
      this._t(ctx, d.texto || "", 0, 46, { tam: 30, peso: 800, alin: "center", color: C.verde, max: 700 });
      this._t(ctx, d.detalle || "", 0, 96, { tam: 20, alin: "center", color: C.suave, max: 700 });
      ctx.restore();
      const dur = d.duracion_ms || 9000;
      rectR(ctx, 0, H - 4, W * clamp(1 - tf / dur, 0, 1), 4, 2);
      ctx.fillStyle = "rgba(255,61,132,0.6)";
      ctx.fill();
    }
  }

  return { Pantalla, Particulas, W, H, COLORES: C };
});
