"use strict";
/* Dari · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Dari/Dari-2D.png).
 *
 * Solo datos y un gancho propio: las gafas. La montura se borra del retrato (preparar_piezas.py) y
 * se vuelve a dibujar aquí encima de los ojos, con la misma geometría, para que párpados, iris y cejas
 * se muevan por debajo. Las escenas pueden moverlas con `p.gafas = { dx, dy, ang, fuera }` (en píxeles
 * del retrato; `fuera` de 0 a 1 las desvanece, p. ej. si se le caen). El dibujo del cuerpo lo hace
 * personajes/comun/personaje.js, con la misma API y la misma postura que Guillermo. Parka beis: los
 * hombros y las mangas son beis y la mano se dibuja aparte.
 */
const Dari = (() => {
  const { clamp } = M2;
  // líneas centrales de la montura (retrato); las mismas que borra preparar_piezas.py (GAFAS)
  const GAFAS = {
    aro_d: [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569],
            [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]],
    aro_i: [[905, 522], [949, 537], [993, 551], [1006, 557], [1003, 580], [999, 608], [986, 621], [949, 624],
            [917, 615], [907, 604], [904, 570]],
    puente: [[858, 509], [884, 513], [905, 522]],
    varilla_d: [[729, 474], [700, 475], [668, 477], [642, 479]],
    varilla_i: [[1006, 557], [1026, 563], [1040, 567]],
    ancho: 9,
  };
  const CENTRO = [884, 540];                 // giro de las gafas (entre los dos cristales)
  const PASTA = "#6b4231", PASTA_LUZ = "#a8704f", TINTA = "#170e0a";
  const ruta = (g, pts, cerrada) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (cerrada) g.closePath(); };
  function gafas(g, p, t) {
    const o = p.gafas || {}, vis = 1 - clamp(o.fuera || 0);
    if (vis <= 0.002) return;
    g.save(); g.globalAlpha *= vis; g.lineJoin = "round"; g.lineCap = "round";
    g.translate(CENTRO[0] + (o.dx || 0), CENTRO[1] + (o.dy || 0)); g.rotate(o.ang || 0); g.translate(-CENTRO[0], -CENTRO[1]);
    const W = GAFAS.ancho;
    // cristales: un velo muy suave y dos brillos en diagonal
    for (const aro of [GAFAS.aro_d, GAFAS.aro_i]) {
      g.save(); ruta(g, aro, true); g.fillStyle = "rgba(214,232,255,0.13)"; g.fill(); g.clip();
      const xs = aro.map(q => q[0]), ys = aro.map(q => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), x1 = Math.max(...xs), y1 = Math.max(...ys);
      g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 7;
      g.beginPath(); g.moveTo(x0 + (x1 - x0) * 0.14, y1); g.lineTo(x0 + (x1 - x0) * 0.4, y0); g.stroke();
      g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + (x1 - x0) * 0.3, y1); g.lineTo(x0 + (x1 - x0) * 0.56, y0); g.stroke();
      g.restore();
    }
    // montura: tinta por fuera, pasta de carey y una veta de luz
    const piezas = [[GAFAS.varilla_d, false], [GAFAS.varilla_i, false], [GAFAS.puente, false], [GAFAS.aro_d, true], [GAFAS.aro_i, true]];
    g.strokeStyle = TINTA; g.lineWidth = W + 4.5; for (const [q, c] of piezas) { ruta(g, q, c); g.stroke(); }
    g.strokeStyle = PASTA; g.lineWidth = W; for (const [q, c] of piezas) { ruta(g, q, c); g.stroke(); }
    g.strokeStyle = PASTA_LUZ; g.lineWidth = 2.2; g.globalAlpha *= 0.85;
    for (const [q] of piezas) { g.save(); g.translate(-1.2, -1.8); ruta(g, q, false); g.stroke(); g.restore(); }
    // bisagras
    g.fillStyle = "#cfc6bd"; g.globalAlpha = vis;
    for (const [x, y] of [[716, 474], [1016, 560]]) { g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  return Personaje2D.crear("dari", {
    carpeta: "personajes/dari/",
    escala: 1.0,                           // con el mismo p.s, de la talla de Guillermo
    pelvis: [265, 700], cuello: [262, 210],
    cadera: { cerca: [195, 700], lejos: [335, 700] },
    bolsillos: { cerca: [150, 626], lejos: [393, 628] },     // muñecas del avatar (manos en los bolsillos)
    cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
    colores: { iris: "#4a2a1a", irisLuz: "#8a5a3c", pupila: "#120c08", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
    cara: {
      centro: [830, 520],
      // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
      ojos: { d: { c: [795, 519], r: 16, rx: 20, ry: 5, arriba: [[748, 505], [760, 501], [775, 499], [790, 499], [805, 500], [818, 503], [830, 507], [838, 514]] },
              i: { c: [935, 565], r: 14, rx: 16, ry: 4, arriba: [[903, 547], [915, 543], [930, 545], [945, 550], [958, 557], [968, 566]] } },
      boca: { c: [830, 682], labio: [832, 694], ang: 0.27, ancho: 128, tinta: 5,
              labios: { sup: 6, inf: 9, colorSup: "#b8605a", colorInf: "#e2786c" } },
      mofletes: { a: [975, 600], b: [948, 700], n: [0.95, 0.3], bulto: 30 },
      rubor: { elipses: [[760, 600, 40, 14, 0.3], [952, 640, 16, 10, 0.3]], rayas: [] },
      sudor: [[690, 480, 0], [1000, 470, 0.37], [750, 420, 0.71]],
      chichon: [830, 330], vena: [760, 440],
    },
    hombros: { color: "#d2b082", radio: [40, 42], desplaza: { cerca: [16, 12], lejos: [-14, 10] }, arco: [0.9, 1.3], tinta: 5 },
    encimaCabeza: gafas,
  });
})();
