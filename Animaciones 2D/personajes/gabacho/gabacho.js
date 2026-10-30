"use strict";
/* Gabacho · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Gabacho/Gabacho-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara); las piezas salen
 * de preparar_piezas.py. Camiseta de fútbol azul marino de manga corta: los hombros son azul marino y
 * cada brazo es la manga (con su puño de rayas) más el brazo de piel; la mano se dibuja aparte al
 * sacarla del bolsillo. Lo estampado en la camiseta es el del avatar, tal cual.
 */
const Gabacho = Personaje2D.crear("gabacho", {
  carpeta: "personajes/gabacho/",
  escala: 1.0,                           // con el mismo p.s, de la talla de Guillermo
  pelvis: [255, 720], cuello: [247, 250],
  cadera: { cerca: [185, 720], lejos: [322, 720] },
  bolsillos: { cerca: [158, 666], lejos: [385, 668] },     // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
  colores: { iris: "#5a3220", irisLuz: "#9a5a35", pupila: "#120a08", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
  cara: {
    centro: [835, 540],
    // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
    ojos: { d: { c: [760, 490], r: 16, rx: 12, ry: 3, arriba: [[730, 482], [740, 477], [755, 475], [770, 475], [785, 476], [800, 481], [810, 488], [816, 497]] },
            i: { c: [900, 529], r: 14, rx: 10, ry: 3, arriba: [[880, 524], [890, 515], [900, 513], [910, 513], [920, 515], [930, 518], [940, 523], [950, 530], [957, 539]] } },
    boca: { c: [818, 624], labio: [820, 636], ang: 0.27, ancho: 140, tinta: 5,
            labios: { sup: 4, inf: 7, colorSup: "#c9774e", colorInf: "#f29a72" } },
    mofletes: { a: [968, 602], b: [905, 730], n: [0.95, 0.3], bulto: 30 },
    rubor: { elipses: [[772, 548, 40, 14, 0.25], [948, 585, 16, 10, 0.4]], rayas: [] },
    sudor: [[712, 478, 0], [958, 590, 0.37], [760, 415, 0.71]],
    chichon: [830, 405], vena: [880, 432],
  },
  hombros: { color: "#1f2d5a", radio: [30, 32], desplaza: { cerca: [4, 20], lejos: [2, 14] }, arco: [0.95, 1.15], tinta: 5 },
});
