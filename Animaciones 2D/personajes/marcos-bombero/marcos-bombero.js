"use strict";
/* Marcos Bombero · recortable animable hecho con las piezas de su avatar 2D
 * (Avatares 2D/Marcos-Bombero/Marcos-Bombero-2D.png).
 *
 * El cuerpo lo monta personajes/comun/personaje.js (misma API y postura que Guillermo). Aquí van sus
 * datos y su atrezo: la lanza y la manguera, que en el avatar lleva en la mano y se han quitado de la
 * hoja para que cada escena decida si las lleva, las suelta o las usa.
 *
 * Atrezo (todo opcional):
 *   mano.objeto = MarcosBombero.lanza({ chorro })   lanza en la mano (unidades de mano, eje +y = boca).
 *                                                    Apunta con mano.ang (−π/2: hacia delante).
 *   MarcosBombero.puntoLanza(p, mano, "cola"|"boca") → {x, y, ang} en pantalla (ang: hacia donde apunta)
 *   MarcosBombero.manguera(g, puntos, esc)          manguera roja por puntos de pantalla (esc = p.s · K)
 *   MarcosBombero.rollo(g, x, y, esc)               manguera enrollada en el suelo
 *   MarcosBombero.dibLanza(g, x, y, ang, esc)       lanza suelta (en el suelo, volando…)
 *   MarcosBombero.chorro(g, boca, largo, t, esc, fuerza)   chorro de agua desde puntoLanza(…, "boca")
 * Sin manos en la postura, la cercana cuelga relajada junto al muslo y la lejana va al bolsillo.
 */
const MarcosBombero = (() => {
  const { clamp, lerp, hash } = M2;
  const JK = 2.6;
  const TINTA = "#0b0a0e";

  const P = Personaje2D.crear("marcos-bombero", {
    carpeta: "personajes/marcos-bombero/",
    escala: 1.0,                           // con el mismo p.s, de cuello a suela casi como Guillermo; el casco lo hace más alto
    pelvis: [265, 730], cuello: [261, 268],
    cadera: { cerca: [185, 735], lejos: [345, 735] },
    bolsillos: { cerca: [106, 714], lejos: [420, 706] },     // muñecas del avatar
    siempreLibres: true,                   // la mano cercana del avatar agarraba la lanza: siempre brazos sueltos
    reposo: { cerca: { en: [114, 748], mano: { mu: -1.66, ang: 0.08, puno: 1, dobla: -1,
                                               dedos: { pulgar: 0.55, indice: 0.62, medio: 0.58, anular: 0.52, menique: 0.48 } } } },
    cabeza: { esc: 0.68 },                 // retrato → cuerpo (cabezón, como Guillermo; el casco ya abulta)
    colores: { iris: "#3b2a1e", irisLuz: "#8c6a46", pupila: "#120c08", blanco: "#f7f4f2", rubor: "#ff7a6a", boca: "#4f1512" },
    cara: {
      centro: [840, 560],
      ojos: { d: { c: [816, 530], r: 15, rx: 18, ry: 5 }, i: { c: [942, 566], r: 13, rx: 13, ry: 4 } },
      boca: { c: [858, 676], labio: [860, 688], ang: 0.21, ancho: 92, tinta: 5.5,
              labios: { sup: 5, inf: 8, colorSup: "#d98f78", colorInf: "#eba58b" } },
      mofletes: { a: [992, 588], b: [952, 712], n: [0.92, 0.38], bulto: 34 },
      rubor: { elipses: [[790, 612, 40, 14, 0.2], [968, 640, 16, 11, 0.3]], rayas: [] },
      sudor: [[720, 560, 0], [992, 560, 0.37], [760, 470, 0.71]],
      chichon: [792, 462], vena: [770, 470],
    },
    hombros: { color: "#2c2c35", radio: [40, 42], desplaza: { cerca: [6, 10], lejos: [-6, 8] }, arco: [0.9, 1.3], tinta: 5 },
  });

  /* ---------- lanza (boquilla) ---------- */
  // En unidades de mano (1 = 2,6 px de hoja), centrada en el puño; el eje va por +y hasta la boca.
  const COLA = -31, BOCA = 41;
  function dibujaLanza(g) {
    g.save(); g.scale(1.35, 1); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.4;   // más gruesa que larga, como la del avatar
    const tubo = (y0, y1, r0, r1, col) => { g.beginPath(); g.moveTo(-r0, y0); g.lineTo(r0, y0); g.lineTo(r1, y1); g.lineTo(-r1, y1); g.closePath(); g.fillStyle = col; g.fill(); g.stroke(); };
    // asa de pistola hacia delante, cerca de la cola
    g.beginPath(); g.moveTo(5, -26); g.quadraticCurveTo(15, -27, 15, -18); g.lineTo(11, -17); g.quadraticCurveTo(11, -22, 5, -21); g.closePath();
    g.fillStyle = "#1c1b20"; g.fill(); g.stroke();
    tubo(COLA, -20, 7.2, 7.2, "#b9bec6");                    // racor plateado (aquí entra la manguera)
    g.fillStyle = "#e9edf2"; g.fillRect(-5.6, COLA + 2, 2.2, 8);
    tubo(-20, 15, 6.2, 6.6, "#1f1e24");                      // cuerpo negro
    g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 1.2;
    for (let y = -16; y < 14; y += 5) { g.beginPath(); g.moveTo(-5.4, y); g.lineTo(5.4, y + 0.4); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.6;
    tubo(15, 21, 7.4, 7.4, "#c9ced6");                       // anillo plateado
    g.fillStyle = "#f2f4f7"; g.fillRect(-6, 16, 2.4, 4);
    tubo(21, 25, 7.6, 7.6, "#d81f2a");                       // anillo rojo
    tubo(25, BOCA, 7.2, 9.6, "#26252b");                      // boquilla
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(-6, 27); g.lineTo(-3.8, 27); g.lineTo(-5.2, BOCA - 1); g.lineTo(-7.8, BOCA - 1); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(0, BOCA, 9.6, 2.6, 0, 0, Math.PI * 2); g.fillStyle = "#0e0d10"; g.fill(); g.stroke();
    g.restore();
  }
  // objeto para mano.objeto (se dibuja bajo los dedos)
  const lanza = () => (g) => dibujaLanza(g);

  // Punto de la lanza: "cola" (racor de la manguera), "boca" o un número (unidades de mano a lo largo del
  // eje: 0 = el puño, +18 = delante del puño, para poner ahí la otra mano). Devuelve {x, y} de pantalla,
  // `hoja` (coordenadas de hoja, para una mano) y ang (dirección de la boca en pantalla).
  function puntoLanza(p, mano, cual = "boca") {
    const y = cual === "cola" ? COLA : cual === "boca" ? BOCA : +cual, sx = mano.espejo ? -1 : 1;
    const q = P.rotP({ x: 0, y: y * JK }, mano.ang || 0), hoja = { x: mano.x + q.x * sx, y: mano.y + q.y };
    const s = P.aPantalla(p, hoja);
    const d = P.rotP({ x: 0, y: 1 }, mano.ang || 0), dx = d.x * sx * (p.espejo ? -1 : 1);
    return { x: s.x, y: s.y, hoja, ang: Math.atan2(d.y, dx) };
  }

  // lanza suelta en pantalla (esc = p.s · K del que la llevaba, para que mida lo mismo)
  function dibLanza(g, x, y, ang, esc) {
    g.save(); g.translate(x, y); g.rotate(ang - Math.PI / 2); g.scale(esc * JK, esc * JK); dibujaLanza(g); g.restore();
  }

  /* ---------- manguera ---------- */
  // Tubo rojo con contorno de tinta por una curva suave de puntos de pantalla. esc = p.s · K.
  function manguera(g, pts, esc) {
    if (pts.length < 2) return;
    const w = 26 * esc, ti = Math.max(1.6, 5 * esc);
    const camino = () => { g.beginPath(); M2.curva(g, pts, false, 0.5); };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    camino(); g.strokeStyle = TINTA; g.lineWidth = w + 2 * ti; g.stroke();
    camino(); g.strokeStyle = "#b8202c"; g.lineWidth = w; g.stroke();
    g.save(); g.translate(w * 0.18, w * 0.2); camino(); g.strokeStyle = "#8e1520"; g.lineWidth = w * 0.45; g.stroke(); g.restore();
    g.save(); g.translate(-w * 0.2, -w * 0.22); camino(); g.strokeStyle = "rgba(255,170,175,0.75)"; g.lineWidth = w * 0.16; g.stroke(); g.restore();
    g.restore();
  }
  // manguera enrollada en el suelo (dos vueltas, como en el avatar); (x, y) = centro del rollo en el suelo
  function rollo(g, x, y, esc) {
    const rx = 160 * esc, ry = 34 * esc, w = 26 * esc;
    for (const [dx, dy, k] of [[0, -w * 0.9, 0.94], [0, 0, 1]]) {
      const pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * 2 * i / 40; pts.push({ x: x + dx + Math.cos(a) * rx * k, y: y + dy - ry + Math.sin(a) * ry * k }); }
      manguera(g, pts, esc);
    }
  }

  /* ---------- chorro de agua ---------- */
  // Desde la boca de la lanza ({x, y, ang} de puntoLanza), con caída por gravedad. fuerza 0…1 lo abre y lo cierra.
  function chorro(g, boca, largo, t, esc, fuerza = 1) {
    const f = clamp(fuerza); if (f <= 0.01) return;
    const L = largo * f, n = 22, cx = Math.cos(boca.ang), cy = Math.sin(boca.ang), caida = 0.35;
    const eje = k => { const d = L * k; return { x: boca.x + cx * d, y: boca.y + cy * d + caida * d * d / Math.max(1, largo) }; };
    const ancho = k => (10 + 26 * k) * esc * (0.6 + 0.4 * f) * (1 + 0.08 * Math.sin(t * 40 + k * 9));
    const borde = sg => { const out = []; for (let i = 0; i <= n; i++) { const k = i / n, a = eje(k), b = eje(Math.min(1, k + 0.02));
      const nx = -(b.y - a.y), ny = b.x - a.x, l = Math.hypot(nx, ny) || 1; out.push({ x: a.x + nx / l * ancho(k) * sg, y: a.y + ny / l * ancho(k) * sg }); } return out; };
    const izq = borde(1), der = borde(-1).reverse();
    g.save(); g.lineJoin = "round";
    g.beginPath(); M2.poligono(g, izq.concat(der)); g.fillStyle = "rgba(120,200,255,0.85)"; g.fill();
    g.strokeStyle = "rgba(20,70,120,0.9)"; g.lineWidth = Math.max(1.2, 3 * esc); g.stroke();
    g.beginPath(); const nuc = []; for (let i = 0; i <= n; i++) nuc.push(eje(i / n)); M2.curva(g, nuc, false, 0.5);
    g.strokeStyle = "rgba(240,252,255,0.9)"; g.lineWidth = 6 * esc; g.lineCap = "round"; g.stroke();
    // remate redondo y gotas en la punta
    const fin = eje(1), rf = ancho(1) * (1.05 + 0.12 * Math.sin(t * 23));
    g.beginPath(); g.arc(fin.x, fin.y, rf, 0, Math.PI * 2); g.fillStyle = "rgba(150,215,255,0.9)"; g.fill();
    g.strokeStyle = "rgba(20,70,120,0.9)"; g.lineWidth = Math.max(1.2, 3 * esc); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.arc(fin.x - rf * 0.3, fin.y - rf * 0.3, rf * 0.35, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 9; i++) {
      const ph = (t * 2.2 + hash(i + 3)) % 1, a = boca.ang + (hash(i + 7) - 0.5) * 1.1;
      const d = 30 * esc + ph * 140 * esc * f, x = fin.x + Math.cos(a) * d, y = fin.y + Math.sin(a) * d + ph * ph * 90 * esc;
      g.globalAlpha = (1 - ph) * 0.9; g.fillStyle = "#bfe8ff"; g.strokeStyle = "rgba(20,70,120,0.9)"; g.lineWidth = Math.max(1, 2 * esc);
      g.beginPath(); g.arc(x, y, (5 + 4 * hash(i)) * esc, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }

  return Object.assign(P, { lanza, puntoLanza, dibLanza, manguera, rollo, chorro, LANZA: { COLA, BOCA } });
})();
