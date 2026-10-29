/*
 * monigote.js — el presentador de la máquina: el avatar de Guillermo (animaciones/Avatar GuillermoAladro.jpg:
 * camisa negra remangada, pantalón gris), troceado y animado.
 *
 * Los dibujos están en monigote_fotos.js (generado a partir de la ilustración). Aquí solo se montan:
 * - El torso (camisa y pantalón hasta medio muslo) es una sola imagen; el cuello de la camisa va aparte, por
 *   delante del cuello.
 * - Cada brazo es la manga entera (gira rígida en el hombro, como una camisa de verdad) con el antebrazo ya
 *   doblado en el codo (31 dibujos, de 10 en 10 grados); el puño remangado tapa la articulación.
 * - La cara es una imagen por expresión (normal, sonrisa, guiño, esfuerzo, grito, meh, soplo, dormido y un
 *   parpadeo). La mano va pegada a la muñeca (abierta, puño, pulgar arriba o con el móvil).
 * - Si el archivo de dibujos trae "hombros" (piel del hombro deformada, como en la versión de fotos), se usan;
 *   si no, el hombro va con la manga.
 * - No guarda estado entre cuadros: la postura sale del tiempo que se le pasa. Así la pantalla lo puede pintar
 *   en dos escenas a la vez (durante una transición) sin que se pisen.
 *
 * Para la Pi 3B+: cada dibujo se reduce una sola vez al tamaño al que se pinta (caché limitada) y el monigote
 * entero se compone a 15 cuadros por segundo en un lienzo aparte; en los cuadros de en medio solo se copia.
 * Si falta algún dibujo (no cargó, o se ejecuta en Node sin lienzo) simplemente no se pinta: nunca lanza.
 *
 * Coordenadas propias: (0, 0) es el centro de la cintura del pantalón; y crece hacia abajo. El dibujo va de
 * ARRIBA (punta del pelo) a ABAJO (corte del muslo).
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  let F = null;
  try {
    F = enNode ? require("./monigote_fotos") : (raiz.ALC && raiz.ALC.monigote_fotos) || null;
  } catch (e) {
    F = null;
  }
  const m = fabrica(F);
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).monigote = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (F) {
  "use strict";

  const ARRIBA = F ? Math.floor(Math.min(...Object.values(F.cabezas).map((c) => c.y))) : -833;
  const ABAJO = F ? Math.ceil(F.ABAJO) : 124;
  const ALTO = ABAJO - ARRIBA; // de la punta del pelo al corte del muslo
  const PIV = F ? F.pivote : { x: -171.3, y: -405.5 }; // hombro izquierdo de la pantalla (el derecho es su reflejo)
  const CUELLO = F ? F.cuello : { x: -2, y: -510 }; // la cabeza gira alrededor de aquí
  const CODO = (F && F.codo) || { x: -16.5, y: 238.2 }; // codo respecto al hombro, en el dibujo sin girar
  const PASO_HOMBRO = 5;
  // las posturas están escritas para un brazo de 474 unidades (hombro a muñeca); se escalan al brazo del dibujo
  const KB = F && F.L1 && F.L2 ? (F.L1 + F.L2) / 474 : 1;
  const CON_HOMBROS = !!(F && F.hombros && F.hombros.length);

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const suave = (t) => {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  };

  // ------------------------------------------------------------------ posturas
  /*
   * Una postura dice dónde va cada muñeca respecto a su hombro, en coordenadas "hacia fuera" (x > 0 aleja la
   * mano del cuerpo, y > 0 la baja), qué hace la mano y hacia dónde dobla el codo ("fuera": el codo se aleja del
   * cuerpo; "abajo": el codo cae). `d` es el brazo a la derecha de la pantalla, `i` el de la izquierda. Además:
   * cara, inclinación de la cabeza (grados), bote del cuerpo e inclinación del tronco.
   * El brazo mide unas 474 unidades del hombro a la muñeca.
   */
  const brazo = (x, y, mano, flex, codo) => ({ x: x * KB, y: y * KB, mano: mano || "abierta", flex: flex || 0, codo: codo || "fuera" });
  const REPOSO = brazo(34, 462, "abierta", 0, "fuera");
  const CADERA = brazo(22, 330, "abierta", 0, "fuera");

  const POSES = {
    reposo: (t) => ({ d: brazo(34, 462 + Math.sin(t / 1100) * 3), i: brazo(34, 462 + Math.sin(t / 1100 + 1) * 3), cara: "normal", cabeza: Math.sin(t / 2300) * 3 }),
    jarras: (t) => ({ d: CADERA, i: CADERA, cara: "sonrisa", cabeza: -4 + Math.sin(t / 1900) * 2 }),
    biceps: (t) => {
      const a = Math.sin(t / 260) * 6;
      return { d: brazo(150, -205 + a, "puno", 1, "abajo"), i: brazo(150, -205 + a, "puno", 1, "abajo"), cara: "esfuerzo", cabeza: Math.sin(t / 700) * 2 };
    },
    biceps1: (t) => ({ d: brazo(150, -205 + Math.sin(t / 240) * 6, "puno", 1, "abajo"), i: CADERA, cara: "guino", cabeza: 6 }),
    pulgar: (t) => ({ d: brazo(-96, 150 + Math.sin(t / 300) * 5, "pulgar", 0, "abajo"), i: CADERA, cara: "sonrisa", cabeza: 5 }),
    senala_d: (t) => ({ d: brazo(190 + Math.sin(t / 180) * 8, -250 + Math.sin(t / 180) * 8, "abierta", 0, "abajo"), i: CADERA, cara: "sonrisa", cabeza: 8 }),
    senala_i: (t) => ({ i: brazo(190 + Math.sin(t / 180) * 8, -250 + Math.sin(t / 180) * 8, "abierta", 0, "abajo"), d: CADERA, cara: "sonrisa", cabeza: -8 }),
    saluda: (t) => ({ d: brazo(140 + Math.sin(t / 150) * 34, -300, "abierta", 0, "abajo"), i: REPOSO, cara: "sonrisa", cabeza: 6 }),
    encoge: (t) => ({ d: brazo(168, 128, "abierta", 0, "abajo"), i: brazo(168, 128, "abierta", 0, "abajo"), cara: "meh", cabeza: -7 + Math.sin(t / 600) * 2 }),
    celebra: (t) => {
      const b = Math.abs(Math.sin(t / 230));
      return { d: brazo(150, -400 - b * 16, "puno", 1, "fuera"), i: brazo(150, -400 - b * 16, "puno", 1, "fuera"), cara: "grito", cabeza: Math.sin(t / 230) * 4, bote: -b * 22 };
    },
    anima: (t) => {
      const k = (Math.sin(t / 170) + 1) / 2;
      return { d: brazo(70, lerp(-150, -390, k), "puno", 1, "fuera"), i: CADERA, cara: "grito", cabeza: lerp(-3, 4, k), bote: -k * 10 };
    },
    selfie: (t) => ({ i: brazo(70, -150 + Math.sin(t / 900) * 4, "movil", 0, "abajo"), d: CADERA, cara: t % 4000 < 2600 ? "normal" : "guino", cabeza: 7 }),
    sopla: () => ({ d: CADERA, i: CADERA, cara: "soplo", cabeza: 0 }),
    estira: (t) => {
      const k = Math.sin(t / 900);
      return { i: brazo(-30, -440, "abierta", 0, "fuera"), d: CADERA, cara: "normal", cabeza: 6 + k * 3, inclina: 6 + k * 2 };
    },
    duerme: (t) => ({ d: brazo(-60, 330, "abierta", 0, "fuera"), i: brazo(-40, 350, "abierta", 0, "fuera"), cara: "dormido", cabeza: 10 + Math.sin(t / 1600) * 2, bote: Math.sin(t / 1600) * 3 }),
    piensa: (t) => ({ d: brazo(-118, -40, "puno", 0, "abajo"), i: CADERA, cara: "meh", cabeza: -8 + Math.sin(t / 1300) * 2 }),
  };

  /**
   * Una coreografía: [[pose, ms], [pose, ms], …] que se repite. Entre una y otra hay un paso suave de `fundido` ms.
   * Devuelve la postura mezclada para el instante t.
   */
  function secuencia(lista, t, fundido = 380) {
    let total = 0;
    for (const [, ms] of lista) total += ms;
    let r = ((t % total) + total) % total;
    let i = 0;
    while (r >= lista[i][1]) {
      r -= lista[i][1];
      i++;
    }
    const actual = (POSES[lista[i][0]] || POSES.reposo)(t);
    if (r >= fundido || lista.length < 2) return actual;
    const previa = (POSES[lista[(i - 1 + lista.length) % lista.length][0]] || POSES.reposo)(t);
    return mezclar(previa, actual, suave(r / fundido));
  }

  function mezclar(a, b, k) {
    const mb = (x, y) => ({
      x: lerp(x.x, y.x, k),
      y: lerp(x.y, y.y, k),
      flex: lerp(x.flex || 0, y.flex || 0, k),
      mano: k < 0.5 ? x.mano : y.mano,
      codo: k < 0.5 ? x.codo : y.codo,
    });
    return {
      d: mb(a.d || REPOSO, b.d || REPOSO),
      i: mb(a.i || REPOSO, b.i || REPOSO),
      cara: k < 0.5 ? a.cara : b.cara,
      cabeza: lerp(a.cabeza || 0, b.cabeza || 0, k),
      bote: lerp(a.bote || 0, b.bote || 0, k),
      inclina: lerp(a.inclina || 0, b.inclina || 0, k),
    };
  }

  // ------------------------------------------------------------------ cinemática
  const angulo = (x, y) => Math.atan2(y, x);
  const normal = (a) => {
    // a (−90°, 270°]: así el brazo levantado por encima de la cabeza no salta de +180 a −180
    while (a <= -Math.PI / 2) a += 2 * Math.PI;
    while (a > (3 * Math.PI) / 2) a -= 2 * Math.PI;
    return a;
  };
  const MANOS = { abierta: "abierta", palma: "abierta", indice: "abierta", bolsillo: "abierta", puno: "puno", pulgar: "pulgar", movil: "movil" };

  /**
   * Resuelve un brazo con los dibujos que hay: elige el codo doblado cuya muñeca queda a la distancia pedida (por
   * el lado que diga `codo`) y el giro del hombro (de 5 en 5 grados, el mismo que la piel del hombro, para que
   * case sin costura). Todo en el marco del brazo izquierdo de la pantalla.
   */
  function resolver(b) {
    if (!F) return null;
    const tx = -b.x; // en el brazo izquierdo de la pantalla, "hacia fuera" es hacia la izquierda
    const ty = b.y;
    const d = Math.hypot(tx, ty) || 1;
    const aT = angulo(tx, ty);
    let mejor = [null, null]; // [doblado hacia un lado, hacia el otro]
    for (const br of F.brazos) {
      const r = Math.hypot(br.wx, br.wy);
      const err = Math.abs(r - d);
      const k = br.th >= 0 ? 0 : 1;
      if (!mejor[k] || err < mejor[k].err - 1e-6) mejor[k] = { br, err };
    }
    let elegido = null;
    let mejorPunt = Infinity;
    for (const c of mejor) {
      if (!c) continue;
      const phi = normal(aT - angulo(c.br.wx, c.br.wy));
      const cs = Math.cos(phi);
      const sn = Math.sin(phi);
      const ex = CODO.x * cs - CODO.y * sn;
      const ey = CODO.x * sn + CODO.y * cs;
      // preferencia: el codo hacia fuera (x más negativa) o hacia abajo (y mayor); el error de distancia manda
      const pref = b.codo === "abajo" ? -ey : ex;
      const punt = c.err * 4 + pref * 0.15;
      if (punt < mejorPunt) {
        mejorPunt = punt;
        elegido = { br: c.br, phi };
      }
    }
    if (!elegido) return null;
    let hom = null;
    let phi = elegido.phi;
    if (CON_HOMBROS) {
      // el giro del hombro va de 5 en 5 grados, como la piel del hombro, para que casen sin costura
      const pasos = Math.round((elegido.phi * 180) / Math.PI / PASO_HOMBRO);
      const idx = clamp(pasos - F.hombros[0].phi / PASO_HOMBRO, 0, F.hombros.length - 1);
      hom = F.hombros[idx];
      phi = (hom.phi * Math.PI) / 180;
    }
    const br = elegido.br;
    const cs = Math.cos(phi);
    const sn = Math.sin(phi);
    return {
      br,
      hom,
      phi,
      wx: br.wx * cs - br.wy * sn, // muñeca respecto al hombro
      wy: br.wx * sn + br.wy * cs,
      wa: br.wa + phi, // hacia dónde apunta el antebrazo
      mano: MANOS[b.mano] || "abierta",
    };
  }

  // ------------------------------------------------------------------ el monigote
  class Monigote {
    constructor() {
      this.cache = new Map(); // dibujos reducidos a cada tamaño (LRU)
      this.imgs = null;
      this.paso = 66;
      this._cargar(); // empieza a decodificar los dibujos ya (en Node no hace nada)
    }

    /** ¿Están ya cargados los dibujos? (en el navegador se decodifican al primer uso) */
    listo() {
      this._cargar();
      return !!(this.imgs && this.imgs.torso && this.imgs.torso.ok);
    }

    _cargar() {
      if (this.imgs || !F) return;
      this.imgs = {};
      if (typeof Image === "undefined") return;
      const cargar = (clave, d) => {
        const e = { d, img: null, ok: false };
        this.imgs[clave] = e;
        try {
          const im = new Image();
          im.onload = () => {
            e.ok = im.naturalWidth > 0;
          };
          im.onerror = () => {
            e.ok = false;
            e.roto = true;
          };
          im.src = d.src;
          e.img = im;
          if (im.complete && im.naturalWidth > 0) e.ok = true;
        } catch (err) {
          e.roto = true;
        }
      };
      cargar("torso", F.torso);
      for (const n of Object.keys(F.cabezas)) cargar("cab_" + n, F.cabezas[n]);
      for (const b of F.brazos) cargar("br_" + b.th, b);
      for (const h of F.hombros || []) cargar("hom_" + h.phi, h);
      if (F.cuello_camisa) cargar("cuello_camisa", F.cuello_camisa);
      for (const n of Object.keys(F.manos)) cargar("mano_" + n, F.manos[n]);
    }

    _lienzo(w, h) {
      if (typeof document !== "undefined") {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        return c;
      }
      if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
      return null;
    }

    /** El dibujo `clave` reducido a e px por unidad (se hace una vez por tamaño y se guarda). */
    _a(clave, e) {
      const ent = this.imgs && this.imgs[clave];
      if (!ent || !ent.ok) return null;
      const k = clave + "|" + Math.round(e * 1000);
      let s = this.cache.get(k);
      if (s) {
        this.cache.delete(k);
        this.cache.set(k, s);
        return s;
      }
      const d = ent.d;
      const w = Math.max(1, Math.round((d.w * e) / F.MU));
      const h = Math.max(1, Math.round((d.h * e) / F.MU));
      const c = this._lienzo(w, h);
      if (!c) return null;
      try {
        const g = c.getContext("2d");
        g.imageSmoothingEnabled = true;
        if ("imageSmoothingQuality" in g) g.imageSmoothingQuality = "high";
        g.drawImage(ent.img, 0, 0, w, h);
      } catch (err) {
        return null;
      }
      s = { c, x: d.x, y: d.y, w: w / e, h: h / e };
      this.cache.set(k, s);
      while (this.cache.size > 220) {
        const k0 = this.cache.keys().next().value;
        const v = this.cache.get(k0);
        if (v && v.c) v.c.width = 0;
        this.cache.delete(k0);
      }
      return s;
    }

    /**
     * Pinta el monigote con la parte de abajo (corte del muslo) en (x, y) y `alto` px de alto (del pelo al
     * corte). `pose`: nombre de POSES, una postura ya hecha (de secuencia()) o una lista para secuencia().
     * `t`: ms (mueve la animación). `espejo`: mirando al otro lado.
     *
     * Para la Pi: el monigote se anima a 15 cuadros por segundo ("de dos en dos", como los dibujos animados).
     * Cada dibujo se guarda en un lienzo aparte (uno por tamaño) y en los cuadros intermedios solo se copia.
     * Con `o.directo` se pinta siempre de nuevo (capturas, posturas ya mezcladas).
     */
    dibujar(ctx, x, y, alto, pose, t, o = {}) {
      try {
        this._cargar();
        if (!this.listo()) return;
        if (o.directo || (pose && typeof pose === "object" && !Array.isArray(pose))) return this._dibujar(ctx, x, y, alto, pose, t, o);
        const e = alto / ALTO;
        const paso = this.paso || 66; // 15 cuadros por segundo (la pantalla lo baja a 10 con calidad baja)
        const tq = Math.floor(t / paso);
        const clave = (typeof pose === "string" ? pose : JSON.stringify(pose)) + "|" + tq + "|" + (o.espejo ? 1 : 0) + "|" + this._cargadas();
        this.buffers = this.buffers || new Map();
        const kb = Math.round(alto);
        let b = this.buffers.get(kb);
        if (!b) {
          const ox = Math.ceil(780 * e) + 4; // brazos estirados hacia los lados, con la mano
          const oy = Math.ceil((ALTO + 190) * e) + 4; // del corte del muslo hacia arriba, con los puños en alto
          const ab = Math.ceil(70 * e) + 4; // las manos colgando pasan un poco del corte
          // dos lienzos que se turnan: se pinta en el que no está en pantalla (si no, el navegador copiaría el
          // lienzo entero antes de cada cambio, porque la pantalla aún lo está usando)
          const c1 = this._lienzo(ox * 2, oy + ab);
          const c2 = this._lienzo(ox * 2, oy + ab);
          if (!c1 || !c2) return;
          b = { cs: [c1, c2], gs: [c1.getContext("2d"), c2.getContext("2d")], i: 0, c: c1, ox, oy, clave: null };
          this.buffers.set(kb, b);
          while (this.buffers.size > 8) {
            const k = this.buffers.keys().next().value;
            for (const c of this.buffers.get(k).cs) c.width = 0;
            this.buffers.delete(k);
          }
        } else {
          this.buffers.delete(kb);
          this.buffers.set(kb, b);
        }
        if (b.clave !== clave) {
          b.i = 1 - b.i;
          const g = b.gs[b.i];
          b.c = b.cs[b.i];
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.clearRect(0, 0, b.c.width, b.c.height);
          this._dibujar(g, b.ox, b.oy, alto, pose, tq * paso, o);
          b.clave = clave;
        }
        const m = ctx.getTransform ? ctx.getTransform() : null;
        if (m && m.a === 1 && m.d === 1 && m.b === 0 && m.c === 0) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(b.c, Math.round(m.e + x) - b.ox, Math.round(m.f + y) - b.oy);
          ctx.restore();
        } else ctx.drawImage(b.c, Math.round(x) - b.ox, Math.round(y) - b.oy);
      } catch (err) {
        // un fallo pintando el monigote no puede tumbar la pantalla
      }
    }

    /** Cuántos dibujos hay cargados (mientras cargan, el lienzo de los cuadros se rehace). */
    _cargadas() {
      if (this._todos) return "t";
      let n = 0;
      for (const k in this.imgs) if (this.imgs[k].ok) n++;
      if (n === Object.keys(this.imgs).length) this._todos = true;
      return n;
    }

    _blit(ctx, s, x, y) {
      // copia sin girar: en píxeles enteros y sin filtrar si el contexto no está girado (lo más barato)
      const m = ctx.getTransform ? ctx.getTransform() : null;
      if (m && m.b === 0 && m.c === 0 && m.a > 0 && m.d > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(s.c, Math.round(m.e + (s.x + x) * m.a), Math.round(m.f + (s.y + y) * m.d));
        ctx.restore();
      } else ctx.drawImage(s.c, s.x + x, s.y + y, s.w, s.h);
    }

    _dibujar(ctx, x, y, alto, pose, t, o = {}) {
      if (!F || !this.imgs) return;
      const e = alto / ALTO;
      const p = typeof pose === "string" ? (POSES[pose] || POSES.reposo)(t) : Array.isArray(pose) ? secuencia(pose, t) : pose;
      const resp = Math.sin(t / 900) * 2; // respiración: la cabeza sube y baja un poco
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y + (p.bote || 0) * e));
      ctx.scale(o.espejo ? -e : e, e);
      ctx.translate(0, -ABAJO);
      if (p.inclina) ctx.rotate(((o.espejo ? -1 : 1) * p.inclina * Math.PI) / 180);
      const T = this._a("torso", e);
      if (T) this._blit(ctx, T, 0, 0);
      const lista = [
        [1, p.d || REPOSO],
        [-1, p.i || REPOSO],
      ];
      const sol = lista.map(([lado, b]) => [lado, b, resolver(b)]);
      const delante = (b, s) => s && (b.mano === "movil" || b.mano === "pulgar" || (s.wy < -120 * KB && Math.abs(s.wx + PIV.x) < 150 * KB) || b.x < -60 * KB);
      const brazoUno = (lado, s) => {
        if (!s) return;
        ctx.save();
        if (lado > 0) ctx.scale(-1, 1); // el brazo derecho es el reflejo del izquierdo
        // brazo con el codo doblado, girado en el hombro
        const B = this._a("br_" + s.br.th, e);
        if (B) {
          ctx.save();
          ctx.translate(PIV.x, PIV.y);
          ctx.rotate(s.phi);
          ctx.drawImage(B.c, B.x, B.y, B.w, B.h);
          ctx.restore();
        }
        // piel del hombro (ya girada; va en coordenadas del cuerpo), si el dibujo la tiene
        const H = s.hom ? this._a("hom_" + s.hom.phi, e) : null;
        if (H) {
          if (lado > 0) ctx.drawImage(H.c, H.x, H.y, H.w, H.h);
          else this._blit(ctx, H, 0, 0);
        }
        // la mano, en la muñeca y mirando hacia donde apunta el antebrazo
        const M = this._a("mano_" + s.mano, e);
        if (M) {
          ctx.save();
          ctx.translate(PIV.x + s.wx, PIV.y + s.wy);
          ctx.rotate(s.wa - Math.PI / 2);
          ctx.drawImage(M.c, M.x, M.y, M.w, M.h);
          ctx.restore();
        }
        ctx.restore();
      };
      const cabeza = () => {
        let cara = p.cara || "normal";
        // parpadeo de vez en cuando
        if ((cara === "normal" || cara === "sonrisa") && t % 3700 < 130) cara = "parpadeo";
        const C = this._a("cab_" + cara, e) || this._a("cab_normal", e);
        if (!C) return;
        ctx.save();
        ctx.translate(CUELLO.x, CUELLO.y + resp * 0.5);
        ctx.rotate(((p.cabeza || 0) * Math.PI) / 180);
        ctx.translate(-CUELLO.x, -CUELLO.y);
        if (!p.cabeza) this._blit(ctx, C, 0, 0);
        else ctx.drawImage(C.c, C.x, C.y, C.w, C.h);
        ctx.restore();
        // el cuello de la camisa va por delante del cuello
        const Q = this._a("cuello_camisa", e);
        if (Q) this._blit(ctx, Q, 0, 0);
      };
      const atras = sol.filter(([, b, s]) => !delante(b, s));
      const alante = sol.filter(([, b, s]) => delante(b, s));
      for (const [lado, , s] of atras) brazoUno(lado, s);
      cabeza();
      for (const [lado, , s] of alante) brazoUno(lado, s);
      ctx.restore();
    }
  }

  return { Monigote, POSES, secuencia, ALTO, ARRIBA, ABAJO, resolver };
});
