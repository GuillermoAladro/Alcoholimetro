/*
 * monigote.js — el presentador de la máquina: un chico cachas sin camiseta, basado en Guillermo (tupé alto
 * castaño con los lados degradados, cejas gruesas, mirada tranquila, barba de tres días, lunar en la mejilla,
 * cadena de plata y anillo). Saca bíceps, señala el lector, enseña a soplar, se hace un selfie en la cuenta
 * atrás, celebra los récords y se encoge de hombros cuando algo sale mal.
 *
 * Todo se dibuja con el lienzo, sin imágenes:
 * - El torso (con pantalón) y la cabeza (con el pelo) se pintan UNA vez en lienzos aparte y luego solo se
 *   copian: es lo que más trazos tiene y la Pi 3B+ no tiene que repetirlo en cada cuadro.
 * - Brazos (cinemática inversa de dos huesos), manos, ojos, cejas y boca se pintan en vivo: pocos trazos.
 * - No guarda estado entre cuadros: la postura sale del tiempo que se le pasa. Así la pantalla lo puede pintar
 *   en dos escenas a la vez (durante una transición) sin que se pisen.
 *
 * Coordenadas propias: (0, 0) es el centro de la cintura del pantalón; y crece hacia abajo. El dibujo va de
 * y = −790 (punta del tupé) a y = +80 (corte a medio muslo): 870 unidades de alto.
 */
(function (raiz, fabrica) {
  "use strict";
  const m = fabrica();
  if (typeof module === "object" && module.exports) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).monigote = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const K = {
    piel: "#eab38e",
    pielLuz: "#f7d0ae",
    pielSombra: "#cd8f6d",
    pielHonda: "#b2714f",
    linea: "#3a1f14",
    pelo: "#3a2316",
    peloLuz: "#7a4f31",
    peloOscuro: "#24140c",
    ceja: "#2b170d",
    iris: "#5a3418",
    labio: "#c97c70",
    labioOscuro: "#9a4d45",
    barba: "rgba(64,40,28,0.20)",
    pantalon: "#1b2131",
    pantalonLuz: "#283149",
    cadena: "#e3e7ee",
    cadenaSombra: "#7f8794",
    movil: "#20242c",
    dientes: "#fbf6ee",
    boca: "#5b1f1f",
    lengua: "#d9737a",
  };

  const ALTO = 870; // de la punta del tupé al corte del muslo
  const ARRIBA = -790;
  const ABAJO = 80;
  const HOMBRO = { x: 150, y: -352 }; // articulación del hombro derecho de la figura (el izquierdo es −x)
  const L1_ = 165; // brazo
  const L2 = 150; // antebrazo
  const CUELLO = { x: 0, y: -408 }; // la cabeza gira alrededor de aquí
  const CABEZA = { x: 0, y: -518 }; // centro de la cara

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const suave = (t) => {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  };

  // ------------------------------------------------------------------ posturas
  /*
   * Una postura dice dónde va cada muñeca respecto a su hombro, en coordenadas "hacia fuera" (x > 0 aleja la
   * mano del cuerpo, y > 0 la baja), qué hace la mano, cuánto aprieta el bíceps (0–1) y hacia dónde dobla el
   * codo. `d` es el brazo a la derecha de la pantalla, `i` el de la izquierda. Además: cara, inclinación de la
   * cabeza (grados), hombros levantados, bote del cuerpo e inclinación del tronco.
   */
  // escorzo < 1: el brazo apunta hacia quien mira y se ve más corto (selfie)
  const brazo = (x, y, mano, flex, codo, escorzo) => ({ x, y, mano: mano || "puno", flex: flex || 0, codo: codo || "fuera", escorzo: escorzo || 1 });
  const REPOSO = brazo(28, 300, "puno", 0.1, "fuera");

  const POSES = {
    reposo: (t) => ({ d: brazo(26, 300 + Math.sin(t / 1100) * 4, "puno", 0.1), i: brazo(26, 300 + Math.sin(t / 1100 + 1) * 4, "puno", 0.1), cara: "normal", cabeza: Math.sin(t / 2300) * 3 }),
    jarras: (t) => ({ d: brazo(-28, 272, "puno", 0.3), i: brazo(-28, 272, "puno", 0.3), cara: "sonrisa", cabeza: -4 + Math.sin(t / 1900) * 2 }),
    biceps: (t) => {
      const apriete = 0.75 + 0.25 * Math.sin(t / 260);
      return { d: brazo(62, -205, "puno", apriete), i: brazo(62, -205, "puno", apriete), cara: "esfuerzo", cabeza: Math.sin(t / 700) * 2, hombros: 6 };
    },
    biceps1: (t) => ({ d: brazo(70, -200, "puno", 0.8 + 0.2 * Math.sin(t / 240)), i: brazo(-28, 272, "puno", 0.3), cara: "guino", cabeza: 6 }),
    pulgar: (t) => ({ d: brazo(-138, 52 + Math.sin(t / 300) * 4, "pulgar", 0.5, "abajo"), i: brazo(-28, 272, "puno", 0.3), cara: "sonrisa", cabeza: 5 }),
    senala_d: (t) => ({ d: brazo(196 + Math.sin(t / 180) * 6, -228 + Math.sin(t / 180) * 6, "indice", 0.2), i: brazo(-28, 272, "puno", 0.3), cara: "sonrisa", cabeza: 8 }),
    senala_i: (t) => ({ i: brazo(196 + Math.sin(t / 180) * 6, -228 + Math.sin(t / 180) * 6, "indice", 0.2), d: brazo(-28, 272, "puno", 0.3), cara: "sonrisa", cabeza: -8 }),
    saluda: (t) => ({ d: brazo(92 + Math.sin(t / 150) * 34, -232, "abierta", 0.3), i: REPOSO, cara: "sonrisa", cabeza: 6 }),
    encoge: (t) => ({ d: brazo(118, 96, "palma", 0, "abajo"), i: brazo(118, 96, "palma", 0, "abajo"), cara: "meh", cabeza: -7 + Math.sin(t / 600) * 2, hombros: 22 }),
    celebra: (t) => {
      const b = Math.abs(Math.sin(t / 230));
      return { d: brazo(112, -262 - b * 12, "puno", 0.6), i: brazo(112, -262 - b * 12, "puno", 0.6), cara: "grito", cabeza: Math.sin(t / 230) * 4, bote: -b * 26 };
    },
    anima: (t) => {
      const k = (Math.sin(t / 170) + 1) / 2;
      return { d: brazo(24, lerp(-120, -262, k), "puno", 0.7), i: brazo(-28, 272, "puno", 0.3), cara: "grito", cabeza: lerp(-3, 4, k), bote: -k * 10 };
    },
    selfie: (t) => ({ i: brazo(-52, -112 + Math.sin(t / 900) * 3, "movil", 0.3, "abajo", 0.55), d: brazo(-28, 272, "puno", 0.3), cara: t % 4000 < 2600 ? "normal" : "guino", cabeza: 7 }),
    sopla: (t) => ({ d: brazo(-28, 272, "puno", 0.3), i: brazo(-28, 272, "puno", 0.3), cara: (t % 1600) < 1150 ? "soplo" : "normal", cabeza: 0 }),
    estira: (t) => {
      const k = Math.sin(t / 900);
      return { i: brazo(-118, -300, "abierta", 0.2), d: brazo(-28, 272, "puno", 0.3), cara: "normal", cabeza: 6 + k * 3, inclina: 7 + k * 2 };
    },
    duerme: (t) => ({ d: brazo(-176, 70, "puno", 0.2, "abajo"), i: brazo(-176, 92, "puno", 0.2, "abajo"), cara: "dormido", cabeza: 10 + Math.sin(t / 1600) * 2, bote: Math.sin(t / 1600) * 3 }),
    piensa: (t) => ({ d: brazo(-96, -60, "puno", 0.2, "abajo"), i: brazo(-28, 272, "puno", 0.3), cara: "meh", cabeza: -8 + Math.sin(t / 1300) * 2 }),
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
    const actual = POSES[lista[i][0]](t);
    if (r >= fundido || lista.length < 2) return actual;
    const previa = POSES[lista[(i - 1 + lista.length) % lista.length][0]](t);
    return mezclar(previa, actual, suave(r / fundido));
  }

  function mezclar(a, b, k) {
    const mb = (x, y) => ({
      x: lerp(x.x, y.x, k),
      y: lerp(x.y, y.y, k),
      flex: lerp(x.flex, y.flex, k),
      mano: k < 0.5 ? x.mano : y.mano,
      codo: k < 0.5 ? x.codo : y.codo,
      escorzo: lerp(x.escorzo || 1, y.escorzo || 1, k),
    });
    return {
      d: mb(a.d || REPOSO, b.d || REPOSO),
      i: mb(a.i || REPOSO, b.i || REPOSO),
      cara: k < 0.5 ? a.cara : b.cara,
      cabeza: lerp(a.cabeza || 0, b.cabeza || 0, k),
      hombros: lerp(a.hombros || 0, b.hombros || 0, k),
      bote: lerp(a.bote || 0, b.bote || 0, k),
      inclina: lerp(a.inclina || 0, b.inclina || 0, k),
    };
  }

  /** Codo de un brazo de dos huesos. `fuera`: el codo se aleja del cuerpo; `abajo`: el codo cae. */
  function codo(Sx, Sy, Tx, Ty, lado, preferencia, escorzo) {
    const L1 = L1_ * (escorzo || 1);
    let dx = Tx - Sx;
    let dy = Ty - Sy;
    let d = Math.hypot(dx, dy) || 1;
    const dMax = L1 + L2 - 1;
    const dMin = Math.abs(L1 - L2) + 1;
    if (d > dMax) {
      Tx = Sx + (dx / d) * dMax;
      Ty = Sy + (dy / d) * dMax;
      d = dMax;
    } else if (d < dMin) {
      Tx = Sx + (dx / d) * dMin;
      Ty = Sy + (dy / d) * dMin;
      d = dMin;
    }
    dx = Tx - Sx;
    dy = Ty - Sy;
    const base = Math.atan2(dy, dx);
    const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const e1 = { x: Sx + Math.cos(base + a) * L1, y: Sy + Math.sin(base + a) * L1 };
    const e2 = { x: Sx + Math.cos(base - a) * L1, y: Sy + Math.sin(base - a) * L1 };
    let e;
    if (preferencia === "abajo") e = e1.y > e2.y ? e1 : e2;
    else e = e1.x * lado > e2.x * lado ? e1 : e2;
    return { E: e, W: { x: Tx, y: Ty } };
  }

  // ------------------------------------------------------------------ trazos
  /** Segmento de brazo: de A a B, con anchos wA y wB, y un "bulto" (bíceps) hacia un lado. Deja el camino hecho. */
  function caminoSegmento(g, A, B, wA, wB, bulto, ladoBulto, contra) {
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const l = Math.hypot(dx, dy) || 1;
    const ux = dx / l;
    const uy = dy / l;
    const nx = -uy;
    const ny = ux;
    const p = (t, lado, w) => ({ x: A.x + dx * t + nx * lado * w, y: A.y + dy * t + ny * lado * w });
    const w = (t) => lerp(wA, wB, t) / 2;
    const a1 = p(0, 1, w(0));
    const b1 = p(1, 1, w(1));
    const a2 = p(0, -1, w(0));
    const b2 = p(1, -1, w(1));
    const m1 = p(0.45, 1, w(0.45) + (ladoBulto > 0 ? bulto : contra) * 2);
    const m2 = p(0.45, -1, w(0.45) + (ladoBulto < 0 ? bulto : contra) * 2);
    g.beginPath();
    g.moveTo(a1.x, a1.y);
    g.quadraticCurveTo(m1.x, m1.y, b1.x, b1.y);
    g.arc(B.x, B.y, w(1), Math.atan2(ny, nx), Math.atan2(-ny, -nx), false);
    g.quadraticCurveTo(m2.x, m2.y, a2.x, a2.y);
    g.arc(A.x, A.y, w(0), Math.atan2(-ny, -nx), Math.atan2(ny, nx), false);
    g.closePath();
  }

  function circulo(g, x, y, r) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
  }

  function elipse(g, x, y, rx, ry, rot) {
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
  }

  // ------------------------------------------------------------------ torso (se pinta una vez)
  function caminoTorso(g) {
    // mitad derecha (x > 0) y su espejo
    const d = [
      [0, -424],
      [44, -424],
      [50, -392],
      [96, -384, 146, -378], // trapecio
      [182, -372, 186, -330, 168, -298], // hombro (lo tapa el deltoides)
      [146, -282], // axila
      [160, -246, 156, -190, 130, -126], // dorsal
      [112, -80, 110, -40, 118, 2], // cintura
    ];
    g.beginPath();
    g.moveTo(0, -424);
    const pts = d.slice(1);
    const espejo = (lista) =>
      lista
        .slice()
        .reverse()
        .map((p) => p.map((v, i) => (i % 2 === 0 ? -v : v)));
    // derecha, de arriba abajo
    for (const p of pts) {
      if (p.length === 2) g.lineTo(p[0], p[1]);
      else if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]);
      else g.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
    }
    g.lineTo(118, 8);
    g.lineTo(-118, 8);
    // izquierda, de abajo arriba (los puntos de control se recorren al revés)
    g.lineTo(-118, 2);
    g.bezierCurveTo(-110, -40, -112, -80, -130, -126);
    g.bezierCurveTo(-156, -190, -160, -246, -146, -282);
    g.lineTo(-168, -298);
    g.bezierCurveTo(-186, -330, -182, -372, -146, -378);
    g.quadraticCurveTo(-96, -384, -50, -392);
    g.lineTo(-44, -424);
    g.closePath();
    void espejo;
  }

  function pintarTorso(g) {
    g.lineJoin = "round";
    g.lineCap = "round";
    // --- pantalón (debajo del torso)
    g.beginPath();
    g.moveTo(-124, -6);
    g.lineTo(124, -6);
    g.lineTo(134, ABAJO + 4);
    g.lineTo(-134, ABAJO + 4);
    g.closePath();
    g.fillStyle = K.pantalon;
    g.fill();
    g.lineWidth = 9;
    g.strokeStyle = K.linea;
    g.stroke();
    // pliegues y costura de la entrepierna
    g.strokeStyle = "rgba(0,0,0,0.35)";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, 26);
    g.lineTo(0, ABAJO);
    g.moveTo(-60, 40);
    g.quadraticCurveTo(-40, 58, -48, ABAJO);
    g.moveTo(66, 36);
    g.quadraticCurveTo(48, 56, 54, ABAJO);
    g.stroke();
    // bolsillos (ranura inclinada)
    g.strokeStyle = "rgba(255,255,255,0.10)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(-112, 12);
    g.lineTo(-84, 50);
    g.moveTo(112, 12);
    g.lineTo(84, 50);
    g.stroke();

    // --- torso: contorno grueso y relleno
    caminoTorso(g);
    g.lineWidth = 10;
    g.strokeStyle = K.linea;
    g.stroke();
    g.fillStyle = K.piel;
    g.fill();
    g.save();
    caminoTorso(g);
    g.clip();
    // luz arriba a la izquierda y sombra a la derecha (volumen)
    const gl = g.createLinearGradient(-170, -420, 170, -40);
    gl.addColorStop(0, "rgba(255,236,214,0.55)");
    gl.addColorStop(0.45, "rgba(255,236,214,0)");
    gl.addColorStop(0.75, "rgba(150,80,50,0)");
    gl.addColorStop(1, "rgba(150,80,50,0.35)");
    g.fillStyle = gl;
    g.fillRect(-200, -440, 400, 480);
    // sombra del cuello bajo la barbilla
    g.fillStyle = "rgba(150,80,50,0.45)";
    elipse(g, 0, -412, 50, 20);
    g.fill();

    // --- pectorales
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 6, -368);
      g.bezierCurveTo(s * 60, -382, s * 128, -376, s * 150, -350);
      g.bezierCurveTo(s * 160, -318, s * 140, -282, s * 104, -266);
      g.bezierCurveTo(s * 72, -254, s * 30, -262, s * 6, -272);
      g.closePath();
      g.fillStyle = s < 0 ? "rgba(255,226,198,0.35)" : "rgba(255,226,198,0.12)";
      g.fill();
      // borde inferior en sombra
      g.beginPath();
      g.moveTo(s * 150, -330);
      g.bezierCurveTo(s * 150, -296, s * 132, -276, s * 104, -266);
      g.bezierCurveTo(s * 72, -254, s * 30, -262, s * 6, -272);
      g.strokeStyle = K.pielHonda;
      g.lineWidth = 9;
      g.stroke();
      g.strokeStyle = K.linea;
      g.lineWidth = 3.5;
      g.stroke();
    }
    // esternón
    g.strokeStyle = K.pielSombra;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(0, -368);
    g.lineTo(0, -272);
    g.stroke();
    // clavículas
    g.strokeStyle = "rgba(160,95,65,0.6)";
    g.lineWidth = 4;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 22, -386);
      g.quadraticCurveTo(s * 70, -372, s * 122, -376);
      g.stroke();
    }

    // --- abdominales (3 filas de 2 y la parte baja)
    const filas = [
      [-254, -200],
      [-194, -144],
      [-138, -90],
    ];
    for (const [y0, y1] of filas) {
      for (const s of [-1, 1]) {
        const x0 = s < 0 ? -64 : 8;
        const w = 56;
        const r = 18;
        g.beginPath();
        g.moveTo(x0 + r, y0);
        g.arcTo(x0 + w, y0, x0 + w, y1, r);
        g.arcTo(x0 + w, y1, x0, y1, r);
        g.arcTo(x0, y1, x0, y0, r);
        g.arcTo(x0, y0, x0 + w, y0, r);
        g.closePath();
        g.fillStyle = s < 0 ? "rgba(255,230,205,0.42)" : "rgba(255,230,205,0.18)";
        g.fill();
        g.strokeStyle = K.pielSombra;
        g.lineWidth = 6;
        g.stroke();
      }
    }
    // línea alba y parte baja
    g.strokeStyle = K.pielHonda;
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(0, -262);
    g.lineTo(0, -88);
    g.stroke();
    // ombligo
    g.fillStyle = K.pielHonda;
    elipse(g, 0, -62, 6, 9);
    g.fill();
    // oblicuos y "V" que entra en el pantalón
    g.strokeStyle = K.pielSombra;
    g.lineWidth = 6;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 98, -132);
      g.bezierCurveTo(s * 86, -84, s * 66, -40, s * 40, -6);
      g.stroke();
      // serrato
      g.lineWidth = 4;
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.moveTo(s * (112 - k * 4), -250 + k * 24);
        g.lineTo(s * (128 - k * 2), -238 + k * 24);
        g.stroke();
      }
      g.lineWidth = 6;
    }
    g.restore();

    // --- cadena de plata (eslabones)
    const n = 26;
    for (let k = 0; k <= n; k++) {
      const a = Math.PI * (0.06 + 0.88 * (k / n));
      const x = Math.cos(a) * 54;
      const y = -398 + Math.sin(a) * 60;
      const giro = a + Math.PI / 2;
      g.fillStyle = K.cadenaSombra;
      elipse(g, x + 1, y + 1.5, 5.4, 3.4, giro);
      g.fill();
      g.fillStyle = K.cadena;
      elipse(g, x, y, 5, 3, giro);
      g.fill();
    }

    // --- cinturilla del pantalón y cordón
    g.beginPath();
    g.moveTo(-124, -8);
    g.lineTo(124, -8);
    g.lineTo(125, 16);
    g.lineTo(-125, 16);
    g.closePath();
    g.fillStyle = K.pantalonLuz;
    g.fill();
    g.lineWidth = 6;
    g.strokeStyle = K.linea;
    g.stroke();
    g.strokeStyle = "#e9e4da";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(-6, 6);
    g.quadraticCurveTo(-20, 22, -22, 44);
    g.moveTo(6, 6);
    g.quadraticCurveTo(18, 24, 24, 40);
    g.stroke();
    g.fillStyle = "#e9e4da";
    circulo(g, -22, 46, 4);
    g.fill();
    circulo(g, 24, 42, 4);
    g.fill();
  }

  // ------------------------------------------------------------------ cabeza (se pinta una vez), centrada en (0, 0)
  function caminoCara(g) {
    g.beginPath();
    g.moveTo(-92, -70);
    g.bezierCurveTo(-98, -20, -96, 22, -84, 50);
    g.bezierCurveTo(-70, 78, -40, 96, -12, 100);
    g.quadraticCurveTo(0, 102, 12, 100);
    g.bezierCurveTo(40, 96, 70, 78, 84, 50);
    g.bezierCurveTo(96, 22, 98, -20, 92, -70);
    g.bezierCurveTo(84, -120, -84, -120, -92, -70);
    g.closePath();
  }

  function caminoTupe(g) {
    // tupé con volumen, peinado hacia arriba y un poco a la derecha de la pantalla, con mechones sueltos
    g.beginPath();
    g.moveTo(-95, -50);
    g.bezierCurveTo(-104, -90, -106, -120, -94, -140);
    g.bezierCurveTo(-112, -160, -100, -184, -78, -180); // mechón suelto a la izquierda
    g.bezierCurveTo(-82, -202, -62, -214, -44, -206);
    g.bezierCurveTo(-40, -228, -16, -236, -2, -224);
    g.bezierCurveTo(8, -244, 34, -250, 46, -236); // lo más alto, hacia la derecha
    g.bezierCurveTo(66, -240, 88, -230, 92, -214);
    g.bezierCurveTo(116, -220, 134, -204, 130, -186); // punta que se va a la derecha
    g.bezierCurveTo(128, -170, 116, -160, 108, -154);
    g.bezierCurveTo(120, -132, 114, -106, 104, -92);
    g.bezierCurveTo(102, -78, 100, -64, 96, -50);
    // línea del pelo sobre la frente (despejada: el flequillo sube)
    g.bezierCurveTo(80, -76, 56, -90, 30, -88);
    g.bezierCurveTo(6, -86, -14, -96, -38, -90);
    g.bezierCurveTo(-62, -84, -84, -74, -95, -50);
    g.closePath();
  }

  function pintarCabeza(g) {
    g.lineJoin = "round";
    g.lineCap = "round";
    // orejas
    for (const s of [-1, 1]) {
      elipse(g, s * 96, -8, 20, 31, s * 0.12);
      g.fillStyle = K.piel;
      g.fill();
      g.lineWidth = 7;
      g.strokeStyle = K.linea;
      g.stroke();
      g.strokeStyle = K.pielHonda;
      g.lineWidth = 4;
      g.beginPath();
      g.arc(s * 97, -8, 11, s > 0 ? -1.2 : Math.PI - 0.5, s > 0 ? 0.9 : Math.PI + 1.6);
      g.stroke();
    }
    // cara
    caminoCara(g);
    g.lineWidth = 9;
    g.strokeStyle = K.linea;
    g.stroke();
    g.fillStyle = K.piel;
    g.fill();
    g.save();
    caminoCara(g);
    g.clip();
    // volumen: luz a la izquierda, sombra en el lado derecho y bajo la mandíbula
    const gl = g.createLinearGradient(-100, -40, 110, 60);
    gl.addColorStop(0, "rgba(255,236,214,0.45)");
    gl.addColorStop(0.5, "rgba(255,236,214,0)");
    gl.addColorStop(1, "rgba(150,80,50,0.35)");
    g.fillStyle = gl;
    g.fillRect(-110, -130, 220, 240);
    // pómulos marcados
    g.fillStyle = "rgba(160,90,60,0.18)";
    for (const s of [-1, 1]) {
      elipse(g, s * 74, 30, 18, 40, s * -0.2);
      g.fill();
    }
    // barba de tres días: mandíbula, barbilla y bigote
    g.fillStyle = K.barba;
    g.beginPath();
    g.moveTo(-90, 18);
    g.bezierCurveTo(-82, 60, -50, 98, 0, 104);
    g.bezierCurveTo(50, 98, 82, 60, 90, 18);
    g.bezierCurveTo(70, 66, 40, 70, 0, 66);
    g.bezierCurveTo(-40, 70, -70, 66, -90, 18);
    g.fill();
    g.beginPath();
    g.moveTo(-34, 44);
    g.quadraticCurveTo(0, 30, 34, 44);
    g.quadraticCurveTo(0, 40, -34, 44);
    g.lineWidth = 7;
    g.strokeStyle = "rgba(64,40,28,0.22)";
    g.stroke();
    // puntitos de la barba
    g.fillStyle = "rgba(55,32,22,0.28)";
    let s0 = 7;
    const r = () => ((s0 = (s0 * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 120; k++) {
      const a = Math.PI * (0.08 + 0.84 * r());
      const rr = 60 + r() * 42;
      const x = Math.cos(a) * rr * 0.95;
      const y = 16 + Math.sin(a) * rr * 0.85;
      if (y < 30 && Math.abs(x) < 70) continue;
      g.fillRect(x, y, 2.2, 2.2);
    }
    g.restore();
    // nariz: lado en sombra, punta y aletas
    g.strokeStyle = K.pielHonda;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(10, -26);
    g.bezierCurveTo(14, -4, 18, 14, 16, 26);
    g.stroke();
    g.lineWidth = 4.5;
    g.strokeStyle = K.linea;
    g.beginPath();
    g.moveTo(-15, 26);
    g.quadraticCurveTo(-18, 34, -8, 34);
    g.moveTo(15, 26);
    g.quadraticCurveTo(19, 34, 8, 34);
    g.moveTo(-6, 36);
    g.quadraticCurveTo(0, 39, 6, 36);
    g.stroke();
    g.fillStyle = "rgba(255,240,225,0.6)";
    elipse(g, -3, 20, 6, 5);
    g.fill();
    // lunar en la mejilla
    g.fillStyle = "#4a2a1c";
    circulo(g, -52, 30, 3.6);
    g.fill();

    // pelo: lados cortos (degradado) y tupé
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 93, -78);
      g.quadraticCurveTo(s * 102, -40, s * 96, -22);
      g.lineTo(s * 86, -22);
      g.quadraticCurveTo(s * 88, -50, s * 80, -80);
      g.closePath();
      g.fillStyle = "rgba(58,35,22,0.55)";
      g.fill();
    }
    caminoTupe(g);
    g.lineWidth = 9;
    g.strokeStyle = K.linea;
    g.stroke();
    const gp = g.createLinearGradient(-40, -270, 30, -60);
    gp.addColorStop(0, K.peloLuz);
    gp.addColorStop(0.35, K.pelo);
    gp.addColorStop(1, K.peloOscuro);
    g.fillStyle = gp;
    g.fill();
    // mechones: mechas anchas que suben y se van hacia la derecha (como el peinado de las fotos)
    g.save();
    caminoTupe(g);
    g.clip();
    const mechas = [
      [-92, -60, -92, -160, 22, -0.25],
      [-64, -80, -54, -206, 34, -0.2],
      [-22, -90, 2, -228, 40, -0.15],
      [20, -88, 50, -238, 40, -0.12],
      [58, -82, 96, -214, 34, -0.1],
      [86, -74, 126, -190, 26, -0.05],
    ];
    for (const [x0, y0, x1, y1, w, curva] of mechas) {
      const mx = (x0 + x1) / 2 + (y1 - y0) * curva;
      const my = (y0 + y1) / 2;
      g.beginPath();
      g.moveTo(x0 - w / 2, y0);
      g.quadraticCurveTo(mx - w / 2, my, x1, y1);
      g.quadraticCurveTo(mx + w / 2, my, x0 + w / 2, y0);
      g.closePath();
      const gm = g.createLinearGradient(x0, y0, x1, y1);
      gm.addColorStop(0, "rgba(122,79,49,0)");
      gm.addColorStop(0.55, "rgba(122,79,49,0.55)");
      gm.addColorStop(1, "rgba(160,110,70,0.7)");
      g.fillStyle = gm;
      g.fill();
      g.strokeStyle = "rgba(20,10,5,0.35)";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x0 + w / 2, y0);
      g.quadraticCurveTo(mx + w / 2, my, x1, y1);
      g.stroke();
    }
    // sombra en la raíz (el pelo nace más oscuro sobre la frente)
    const gr = g.createLinearGradient(0, -60, 0, -120);
    gr.addColorStop(0, "rgba(20,10,5,0.55)");
    gr.addColorStop(1, "rgba(20,10,5,0)");
    g.fillStyle = gr;
    g.fillRect(-140, -130, 280, 80);
    g.restore();
    // pelos sueltos por arriba (despeinado)
    g.strokeStyle = K.pelo;
    g.lineWidth = 4;
    for (const [x0, y0, cx, cy, x1, y1] of [
      [-30, -222, -34, -244, -20, -252],
      [30, -240, 40, -262, 58, -262],
      [100, -214, 116, -230, 136, -228],
      [-70, -196, -86, -210, -96, -206],
    ]) {
      g.beginPath();
      g.moveTo(x0, y0);
      g.quadraticCurveTo(cx, cy, x1, y1);
      g.stroke();
    }
  }

  // ------------------------------------------------------------------ cara en vivo (cabeza centrada en 0, 0)
  function pintarCara(g, cara, t) {
    const parpadeo = cara !== "dormido" && t % 4200 < 130;
    const cejas = {
      normal: [0, 0],
      sonrisa: [-3, 0],
      esfuerzo: [6, -0.18],
      guino: [-2, 0.05],
      grito: [-10, 0.12],
      meh: [-12, 0.22],
      soplo: [-6, 0],
      dormido: [2, 0],
      sorpresa: [-16, 0],
    }[cara] || [0, 0];
    // ojos
    for (const s of [-1, 1]) {
      const x = s * 40;
      const y = -12;
      const cerrado = parpadeo || cara === "dormido" || (cara === "guino" && s > 0) || cara === "grito";
      if (cerrado) {
        g.strokeStyle = K.linea;
        g.lineWidth = 6;
        g.beginPath();
        if (cara === "grito") g.arc(x, y + 8, 15, Math.PI * 1.15, Math.PI * 1.85);
        else g.arc(x, y - 8, 17, Math.PI * 0.2, Math.PI * 0.8);
        g.stroke();
        continue;
      }
      const abre = cara === "sorpresa" ? 1.25 : cara === "esfuerzo" ? 0.75 : 1;
      // blanco del ojo (almendra)
      g.beginPath();
      g.moveTo(x - 19, y);
      g.quadraticCurveTo(x, y - 17 * abre, x + 19, y);
      g.quadraticCurveTo(x, y + 12, x - 19, y);
      g.closePath();
      g.fillStyle = "#fbf5ee";
      g.fill();
      g.fillStyle = K.iris;
      elipse(g, x + s * 1, y - 2, 9, 8);
      g.fill();
      g.fillStyle = "#130905";
      circulo(g, x + s * 1, y - 2, 4.5);
      g.fill();
      g.fillStyle = "#ffffff";
      circulo(g, x - 3, y - 5, 2.4);
      g.fill();
      // párpado de arriba un poco caído (la mirada tranquila de las fotos)
      g.fillStyle = K.piel;
      g.beginPath();
      g.moveTo(x - 22, y - 20);
      g.lineTo(x + 22, y - 20);
      g.lineTo(x + 22, y - 6 * abre);
      g.quadraticCurveTo(x, y - 12 * abre, x - 22, y - 6 * abre);
      g.closePath();
      g.fill();
      // línea del párpado
      g.strokeStyle = K.linea;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(x - 21, y + 1);
      g.quadraticCurveTo(x, y - 13 * abre, x + 21, y);
      g.stroke();
      g.lineWidth = 2.5;
      g.strokeStyle = "rgba(58,31,20,0.6)";
      g.beginPath();
      g.moveTo(x - 15, y + 5);
      g.quadraticCurveTo(x, y + 11, x + 15, y + 4);
      g.stroke();
    }
    // cejas gruesas y rectas
    for (const s of [-1, 1]) {
      const dy = cejas[0];
      const giro = cejas[1] * s;
      g.save();
      g.translate(s * 44, -46 + dy);
      g.rotate(giro);
      g.beginPath();
      g.moveTo(-s * 30, 6);
      g.quadraticCurveTo(-s * 6, -8, s * 32, -2);
      g.lineTo(s * 30, 5);
      g.quadraticCurveTo(-s * 6, 2, -s * 28, 16);
      g.closePath();
      g.fillStyle = K.ceja;
      g.fill();
      g.restore();
    }
    // mejillas hinchadas al soplar
    if (cara === "soplo") {
      const k = 0.9 + 0.1 * Math.sin(t / 120);
      for (const s of [-1, 1]) {
        elipse(g, s * 66, 46, 30 * k, 27 * k);
        g.fillStyle = K.piel;
        g.fill();
        g.strokeStyle = K.linea;
        g.lineWidth = 6;
        g.beginPath();
        g.ellipse(s * 66, 46, 30 * k, 27 * k, 0, s > 0 ? -1.2 : Math.PI - 0.9, s > 0 ? 0.9 : Math.PI + 1.2);
        g.stroke();
        g.fillStyle = "rgba(255,120,110,0.28)";
        elipse(g, s * 70, 48, 15, 11);
        g.fill();
      }
    }
    // boca
    const y = 58;
    g.lineJoin = "round";
    g.lineCap = "round";
    if (cara === "grito" || cara === "esfuerzo") {
      const ancho = cara === "grito" ? 34 : 38;
      const alto = cara === "grito" ? 36 : 18;
      g.beginPath();
      g.moveTo(-ancho, y - 6);
      g.quadraticCurveTo(0, y - 12, ancho, y - 6);
      g.quadraticCurveTo(ancho * 0.8, y + alto, 0, y + alto + 2);
      g.quadraticCurveTo(-ancho * 0.8, y + alto, -ancho, y - 6);
      g.closePath();
      g.fillStyle = K.boca;
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = K.dientes;
      g.fillRect(-ancho, y - 14, ancho * 2, cara === "grito" ? 14 : 30);
      if (cara === "esfuerzo") {
        g.strokeStyle = "rgba(120,70,70,0.35)";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(-ancho + 4, y + 3);
        g.lineTo(ancho - 4, y + 3);
        g.stroke();
      } else {
        g.fillStyle = K.lengua;
        elipse(g, 0, y + alto, 20, 12);
        g.fill();
      }
      g.restore();
      g.strokeStyle = K.linea;
      g.lineWidth = 5;
      g.stroke();
    } else if (cara === "soplo" || cara === "sorpresa") {
      g.fillStyle = K.labio;
      elipse(g, 0, y, cara === "soplo" ? 11 : 13, cara === "soplo" ? 10 : 15);
      g.fill();
      g.fillStyle = K.boca;
      elipse(g, 0, y, cara === "soplo" ? 5 : 7, cara === "soplo" ? 4.5 : 9);
      g.fill();
      g.strokeStyle = K.linea;
      g.lineWidth = 4;
      elipse(g, 0, y, cara === "soplo" ? 11 : 13, cara === "soplo" ? 10 : 15);
      g.stroke();
      if (cara === "soplo") {
        // el aire que sale
        g.strokeStyle = "rgba(220,250,255,0.9)";
        g.lineWidth = 5;
        const a0 = g.globalAlpha;
        for (let k = 0; k < 3; k++) {
          const f = (t / 500 + k / 3) % 1;
          g.globalAlpha = a0 * (1 - f);
          g.beginPath();
          g.arc(-30 - f * 90, y - 4 - f * 30, 8 + f * 16, Math.PI * 0.6, Math.PI * 1.4);
          g.stroke();
        }
        g.globalAlpha = a0;
      }
    } else {
      // labios carnosos; la comisura derecha sube un poco (media sonrisa)
      const sube = cara === "sonrisa" || cara === "guino" ? 7 : cara === "meh" ? -3 : 2;
      const ancho = cara === "sonrisa" ? 32 : 28;
      g.beginPath();
      g.moveTo(-ancho, y + (cara === "sonrisa" ? -4 : 0));
      g.bezierCurveTo(-16, y - 12, -8, y - 6, 0, y - 9);
      g.bezierCurveTo(8, y - 6, 16, y - 12, ancho, y - sube);
      g.bezierCurveTo(18, y + 16, -18, y + 18, -ancho, y + (cara === "sonrisa" ? -4 : 0));
      g.closePath();
      g.fillStyle = K.labio;
      g.fill();
      g.fillStyle = "rgba(255,210,200,0.45)";
      elipse(g, 4, y + 7, 12, 4);
      g.fill();
      g.strokeStyle = K.labioOscuro;
      g.lineWidth = 3.5;
      g.beginPath();
      g.moveTo(-ancho + 2, y + (cara === "sonrisa" ? -4 : 0));
      g.quadraticCurveTo(0, y + (cara === "sonrisa" ? 6 : 1), ancho - 2, y - sube);
      g.stroke();
      if (cara === "sonrisa") {
        g.strokeStyle = K.pielHonda;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(-ancho - 4, y - 8, 7, Math.PI * 0.6, Math.PI * 1.1);
        g.arc(ancho + 4, y - 10, 7, -Math.PI * 0.1, Math.PI * 0.4);
        g.stroke();
      }
    }
  }

  // ------------------------------------------------------------------ brazos y manos en vivo
  /*
   * Brazos y manos en dos pasadas: primero el contorno (las mismas formas, engordadas OUT unidades y en color de
   * línea) y después el relleno. Rellenar es mucho más barato que trazar líneas gruesas en la CPU de la Pi.
   */
  const OUT = 8;

  function rr(g, x, y, w, h, r, inf) {
    g.beginPath();
    if (g.roundRect) g.roundRect(x - inf, y - inf, w + inf * 2, h + inf * 2, r + inf);
    else g.rect(x - inf, y - inf, w + inf * 2, h + inf * 2);
  }

  function pintarMano(g, W, ang, tipo, lado, pasada) {
    if (tipo === "bolsillo") return;
    const fill = pasada === "relleno";
    const inf = fill ? 0 : OUT;
    g.fillStyle = fill ? K.piel : K.linea;
    g.save();
    g.translate(W.x, W.y);
    if (tipo === "pulgar") {
      // puño de pie con el pulgar hacia arriba (sin girar con el brazo)
      rr(g, -30, -20, 60, 54, 18, inf);
      g.fill();
      rr(g, -lado * 2 - 11, -66, 22, 56, 11, inf);
      g.fill();
      if (fill) {
        g.strokeStyle = K.pielHonda;
        g.lineWidth = 3;
        g.beginPath();
        for (let k = 0; k < 3; k++) {
          g.moveTo(-26, -4 + k * 13);
          g.lineTo(20, -4 + k * 13);
        }
        g.stroke();
        anillo(g, -10, 9, lado);
      }
    } else if (tipo === "movil") {
      // el móvil, de pie, sujeto por la mano
      elipse(g, 0, -10, 28 + inf, 26 + inf);
      g.fill();
      if (fill) {
        g.fillStyle = "#9aa3b2";
        rr(g, -30, -112, 60, 116, 12, 3);
        g.fill();
        g.fillStyle = K.movil;
        rr(g, -30, -112, 60, 116, 12, 0);
        g.fill();
        g.fillStyle = "#3b414d";
        rr(g, -24, -104, 26, 40, 8, 0);
        g.fill();
        g.fillStyle = "#0d0f13";
        circulo(g, -11, -94, 7);
        g.fill();
        circulo(g, -11, -75, 7);
        g.fill();
        // dedos por delante del móvil
        for (const [x, y] of [
          [18, -58],
          [18, -40],
          [18, -22],
          [-40, -40],
        ]) {
          g.fillStyle = K.linea;
          rr(g, x, y, 22, 15, 7, 2.5);
          g.fill();
          g.fillStyle = K.piel;
          rr(g, x, y, 22, 15, 7, 0);
          g.fill();
        }
        anillo(g, 22, -22, lado);
      }
    } else {
      g.rotate(ang - Math.PI / 2);
      // ahora y crece a lo largo del antebrazo (hacia los dedos)
      if (tipo === "abierta" || tipo === "palma") {
        elipse(g, 0, 30, 27 + inf, 30 + inf);
        g.fill();
        for (const [x, y, a, l] of [
          [-20, 50, -0.35, 30],
          [-7, 58, -0.12, 36],
          [7, 58, 0.08, 36],
          [20, 52, 0.3, 30],
          [lado * 24, 22, lado * -0.9, 32],
        ]) {
          g.save();
          g.translate(x, y);
          g.rotate(a);
          rr(g, -7, 0, 14, l, 7, inf);
          g.fill();
          g.restore();
        }
        if (fill) anillo(g, -7, 66, lado);
      } else {
        // puño (o señalando con el índice)
        rr(g, -29, 4, 58, 58, 20, inf);
        g.fill();
        if (tipo === "indice") {
          rr(g, -lado * 14 - 8, 44, 16, 56, 8, inf);
          g.fill();
        }
        if (fill) {
          g.strokeStyle = K.pielHonda;
          g.lineWidth = 3;
          g.beginPath();
          for (let k = -1; k <= 1; k++) {
            g.moveTo(k * 14, 40);
            g.lineTo(k * 14, 58);
          }
          g.moveTo(-lado * 26, 22);
          g.quadraticCurveTo(0, 30, lado * 10, 22);
          g.stroke();
          anillo(g, lado * -5, 48, lado);
        }
      }
    }
    g.restore();
  }

  function anillo(g, x, y, lado) {
    if (lado > 0) return; // el anillo va en la mano que queda a la izquierda de la pantalla
    g.fillStyle = "#5c6370";
    rr(g, x - 9, y - 4, 18, 8, 3, 1.5);
    g.fill();
    g.fillStyle = "#c9ced8";
    rr(g, x - 9, y - 4, 18, 8, 3, 0);
    g.fill();
  }

  function pintarBrazo(g, S, b, lado, pasada) {
    const T = { x: S.x + lado * b.x, y: S.y + b.y };
    const { E, W } = codo(S.x, S.y, T.x, T.y, lado, b.codo, b.escorzo);
    // hacia qué lado se dobla el codo (ahí abulta el bíceps)
    const u1x = E.x - S.x;
    const u1y = E.y - S.y;
    const u2x = W.x - E.x;
    const u2y = W.y - E.y;
    const cruz = u1x * u2y - u1y * u2x;
    const ladoBulto = cruz >= 0 ? 1 : -1;
    const biceps = 8 + b.flex * 24;
    const angAnte = Math.atan2(u2y, u2x);
    const fill = pasada === "relleno";
    const inf = fill ? 0 : OUT;
    g.fillStyle = fill ? K.piel : K.linea;
    // deltoides, brazo, antebrazo y codo
    circulo(g, S.x + lado * 8, S.y - 4, 54 + inf);
    g.fill();
    caminoSegmento(g, S, E, 96 + inf * 2, 64 + inf * 2, biceps, ladoBulto, 4);
    g.fill();
    caminoSegmento(g, E, W, 68 + inf * 2, 50 + inf * 2, 7, -ladoBulto, 3);
    g.fill();
    circulo(g, E.x, E.y, 33 + inf);
    g.fill();
    if (fill) {
      // sombra de volumen (lado de abajo/derecha): una franja dentro del brazo
      const nx = -(E.y - S.y);
      const ny = E.x - S.x;
      const l = Math.hypot(nx, ny) || 1;
      const sl = nx + ny * 0.6 > 0 ? 1 : -1;
      g.strokeStyle = "rgba(160,90,62,0.42)";
      g.lineWidth = 16;
      g.beginPath();
      g.moveTo(lerp(S.x, E.x, 0.2) + (nx / l) * 30 * sl, lerp(S.y, E.y, 0.2) + (ny / l) * 30 * sl);
      g.lineTo(lerp(S.x, E.x, 0.8) + (nx / l) * 22 * sl, lerp(S.y, E.y, 0.8) + (ny / l) * 22 * sl);
      g.stroke();
      // línea del bíceps (más marcada cuanto más aprieta)
      const mx = lerp(S.x, E.x, 0.5);
      const my = lerp(S.y, E.y, 0.5);
      g.strokeStyle = `rgba(150,82,56,${0.35 + b.flex * 0.4})`;
      g.lineWidth = 5;
      g.beginPath();
      const lb = Math.hypot(E.x - S.x, E.y - S.y) || 1;
      const px = -(E.y - S.y) / lb;
      const py = (E.x - S.x) / lb;
      g.moveTo(lerp(S.x, E.x, 0.18) + px * ladoBulto * 10, lerp(S.y, E.y, 0.18) + py * ladoBulto * 10);
      g.quadraticCurveTo(mx + px * ladoBulto * (biceps * 0.4), my + py * ladoBulto * (biceps * 0.4), lerp(S.x, E.x, 0.85) + px * ladoBulto * 6, lerp(S.y, E.y, 0.85) + py * ladoBulto * 6);
      g.stroke();
      // brillo del deltoides
      g.fillStyle = "rgba(255,236,214,0.35)";
      elipse(g, S.x + lado * 2 - 12, S.y - 24, 22, 14, -0.4);
      g.fill();
    }
    pintarMano(g, W, angAnte, b.mano, lado, pasada);
    return W;
  }

  // ------------------------------------------------------------------ el monigote
  class Monigote {
    constructor() {
      this.cache = new Map();
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

    /** Torso y cabeza pintados a la escala `e` (se guardan las 8 últimas escalas usadas). */
    _sprites(e) {
      const clave = Math.round(e * 1000);
      this.cache = this.cache || new Map();
      let sp = this.cache.get(clave);
      if (sp) {
        this.cache.delete(clave);
        this.cache.set(clave, sp);
        return sp;
      }
      if (this.cache.sinLienzo) return null;
      e = clave / 1000;
      const t = { x0: -200, y0: -440, w: 400, h: ABAJO + 10 + 440 };
      const h = { x0: -140, y0: -290, w: 290, h: 410 };
      const c1 = this._lienzo(Math.ceil(t.w * e), Math.ceil(t.h * e));
      const c2 = this._lienzo(Math.ceil(h.w * e), Math.ceil(h.h * e));
      if (!c1 || !c2) {
        this.cache.sinLienzo = true;
        return null;
      }
      const g1 = c1.getContext("2d");
      g1.scale(e, e);
      g1.translate(-t.x0, -t.y0);
      pintarTorso(g1);
      const g2 = c2.getContext("2d");
      g2.scale(e, e);
      g2.translate(-h.x0, -h.y0);
      pintarCabeza(g2);
      // tamaño de destino en unidades propias para que la copia sea exactamente 1:1
      sp = { torso: { c: c1, x0: t.x0, y0: t.y0, w: c1.width / e, h: c1.height / e }, cabeza: { c: c2, x0: h.x0, y0: h.y0, w: c2.width / e, h: c2.height / e }, e };
      this.cache.set(clave, sp);
      while (this.cache.size > 8) {
        const k = this.cache.keys().next().value;
        const v = this.cache.get(k);
        v.torso.c.width = v.cabeza.c.width = 0;
        this.cache.delete(k);
      }
      return sp;
    }

    /**
     * Pinta el monigote con la parte de abajo (corte del muslo) en (x, y) y `alto` px de alto (del tupé al
     * corte). `pose`: nombre de POSES, una postura ya hecha (de secuencia()) o una lista para secuencia().
     * `t`: ms (mueve la animación). `espejo`: mirando al otro lado (el tupé y el lunar se invierten).
     *
     * Para la Pi: el monigote se anima a 15 cuadros por segundo ("de dos en dos", como los dibujos animados).
     * Cada dibujo se guarda en un lienzo aparte (uno por tamaño) y en los cuadros intermedios solo se copia.
     * Con `o.directo` se pinta siempre de nuevo (capturas, posturas ya mezcladas).
     */
    dibujar(ctx, x, y, alto, pose, t, o = {}) {
      if (o.directo || (pose && typeof pose === "object" && !Array.isArray(pose))) return this._dibujar(ctx, x, y, alto, pose, t, o);
      const e = alto / ALTO;
      const paso = this.paso || 66; // 15 cuadros por segundo (la pantalla lo baja a 10 con calidad baja)
      const tq = Math.floor(t / paso);
      const clave = (typeof pose === "string" ? pose : JSON.stringify(pose)) + "|" + tq + "|" + (o.espejo ? 1 : 0);
      this.buffers = this.buffers || new Map();
      const kb = Math.round(alto);
      let b = this.buffers.get(kb);
      if (!b) {
        const ox = Math.ceil(560 * e) + 4;
        const oy = Math.ceil(920 * e) + 4; // del corte del muslo a la punta del tupé, con bote y brazos en alto
        // dos lienzos que se turnan: se pinta en el que no está en pantalla (si no, el navegador copiaría el
        // lienzo entero antes de cada cambio, porque la pantalla aún lo está usando)
        const c1 = this._lienzo(ox * 2, oy + Math.ceil(100 * e) + 4);
        const c2 = this._lienzo(ox * 2, oy + Math.ceil(100 * e) + 4);
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
    }

    _dibujar(ctx, x, y, alto, pose, t, o = {}) {
      const e = alto / ALTO;
      const sp = this._sprites(e);
      if (!sp) return;
      const p = typeof pose === "string" ? (POSES[pose] || POSES.reposo)(t) : Array.isArray(pose) ? secuencia(pose, t) : pose;
      const resp = Math.sin(t / 900) * 3; // respiración: hombros y cabeza suben y bajan un poco
      ctx.save();
      // posición redondeada al píxel: el torso y la cabeza se copian tal cual, sin filtrar
      ctx.translate(Math.round(x), Math.round(y + (p.bote || 0) * e));
      ctx.scale(o.espejo ? -sp.e : sp.e, sp.e);
      ctx.translate(0, -ABAJO);
      if (p.inclina) ctx.rotate(((o.espejo ? -1 : 1) * p.inclina * Math.PI) / 180);
      const T = sp.torso;
      const m = ctx.getTransform ? ctx.getTransform() : null;
      if (m && m.b === 0 && m.c === 0 && !p.inclina) {
        // sin giro: el torso se copia en píxeles enteros, sin filtrar (lo más barato)
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(T.c, Math.round(m.e + T.x0 * m.a), Math.round(m.f + T.y0 * m.d));
        ctx.restore();
      } else ctx.drawImage(T.c, T.x0, T.y0, T.w, T.h);
      const hom = (p.hombros || 0) + resp;
      const Sd = { x: HOMBRO.x, y: HOMBRO.y - hom };
      const Si = { x: -Sd.x, y: Sd.y };
      // brazos: primero el contorno de los dos, luego el relleno (así no quedan rayas dentro)
      const brazoD = p.d || REPOSO;
      const brazoI = p.i || REPOSO;
      const delante = (b) => b.mano === "movil" || b.mano === "pulgar" || (b.mano === "abierta" && b.y < -150);
      // la cabeza
      const cab = () => {
        ctx.save();
        ctx.translate(CUELLO.x, CUELLO.y - hom * 0.5);
        ctx.rotate(((p.cabeza || 0) * Math.PI) / 180);
        ctx.translate(CABEZA.x - CUELLO.x, CABEZA.y - CUELLO.y);
        const C = sp.cabeza;
        ctx.drawImage(C.c, C.x0, C.y0, C.w, C.h);
        pintarCara(ctx, p.cara || "normal", t);
        ctx.restore();
      };
      const brazos = (lista) => {
        for (const pasada of ["contorno", "relleno"]) for (const [S, b, lado] of lista) pintarBrazo(ctx, S, b, lado, pasada);
        for (const [S, b, lado] of lista)
          if (b.mano === "bolsillo") {
            // la mano dentro del bolsillo: un trozo de pantalón la tapa
            const W = codo(S.x, S.y, S.x + lado * b.x, S.y + b.y, lado, b.codo, b.escorzo).W;
            ctx.fillStyle = K.pantalon;
            ctx.beginPath();
            ctx.moveTo(W.x - 40, W.y + 2);
            ctx.lineTo(W.x + 40, W.y - 6);
            ctx.lineTo(W.x + 46, W.y + 70);
            ctx.lineTo(W.x - 40, W.y + 70);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = K.linea;
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(W.x - 40, W.y + 2);
            ctx.lineTo(W.x + 40, W.y - 6);
            ctx.stroke();
          }
      };
      const lista = [
        [Sd, brazoD, 1],
        [Si, brazoI, -1],
      ];
      const atras = lista.filter(([, b]) => !delante(b));
      const alante = lista.filter(([, b]) => delante(b));
      brazos(atras);
      cab();
      if (alante.length) brazos(alante);
      ctx.restore();
    }
  }

  return { Monigote, POSES, secuencia, ALTO };
});
