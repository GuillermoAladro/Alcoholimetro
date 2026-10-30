"use strict";
/* Rodri · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Rodri/Rodri-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara); las piezas salen
 * de preparar_piezas.py. Plumífero negro abierto con capucha sobre camiseta negra: los hombros y las
 * mangas son negros y la mano se dibuja aparte al sacarla del bolsillo.
 */
const Rodri = Personaje2D.crear("rodri", {
  carpeta: "personajes/rodri/",
  escala: 1.0,                           // con el mismo p.s, de la talla de Guillermo
  pelvis: [262, 705], cuello: [258, 240],
  cadera: { cerca: [195, 708], lejos: [335, 708] },
  bolsillos: { cerca: [150, 640], lejos: [392, 640] },     // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
  colores: { iris: "#3a1c0e", irisLuz: "#7a4a2a", pupila: "#0e0806", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
  cara: {
    centro: [820, 520],
    // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
    ojos: { d: { c: [771, 443], r: 16, rx: 20, ry: 4, arriba: [[731, 431], [750, 427], [770, 427], [790, 430], [806, 436], [818, 445], [822, 453]] },
            i: { c: [926, 484], r: 13, rx: 13, ry: 3, arriba: [[897, 470], [912, 467], [927, 468], [943, 472], [958, 480], [968, 491]] } },
    boca: { c: [822, 607], labio: [826, 621], ang: 0.26, ancho: 128, tinta: 5,
            labios: { sup: 4, inf: 7, colorSup: "#d98a72", colorInf: "#f0a08a" } },
    mofletes: { a: [958, 580], b: [905, 700], n: [0.9, 0.42], bulto: 26 },
    rubor: { elipses: [[762, 505, 40, 14, 0.25], [946, 545, 14, 9, 0.4]], rayas: [] },
    sudor: [[690, 480, 0], [965, 520, 0.37], [800, 395, 0.71]],
    chichon: [820, 330], vena: [700, 468],
  },
  hombros: { color: "#323139", radio: [42, 44], desplaza: { cerca: [6, 6], lejos: [-6, 6] }, arco: [0.9, 1.3], tinta: 5 },
});
