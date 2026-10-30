"use strict";
/* Yorgi · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Yorgi/Yorgi-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara); las piezas salen
 * de preparar_piezas.py. Camiseta azul marino de manga corta: los hombros son marino y el brazo es la
 * manga con el brazo de piel (el lejano lleva el reloj); la mano se dibuja aparte al sacarla del bolsillo.
 * Los aros de las orejas van con la cabeza.
 */
const Yorgi = Personaje2D.crear("yorgi", {
  carpeta: "personajes/yorgi/",
  escala: 1.0,                           // con el mismo p.s, de la talla de Guillermo
  pelvis: [262, 705], cuello: [263, 246],
  cadera: { cerca: [185, 708], lejos: [335, 708] },
  bolsillos: { cerca: [152, 672], lejos: [403, 664] },     // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
  colores: { iris: "#402314", irisLuz: "#8a5a36", pupila: "#120a06", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
  cara: {
    centro: [850, 560],
    // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
    ojos: { d: { c: [790, 496], r: 16, rx: 20, ry: 4, arriba: [[745, 479], [755, 477], [770, 476], [785, 477], [802, 480], [820, 483], [835, 487], [845, 494], [850, 501]] },
            i: { c: [944, 551], r: 15, rx: 16, ry: 4, arriba: [[924, 535], [937, 532], [950, 532], [965, 535], [980, 540], [992, 546], [1000, 554], [1002, 562]] } },
    boca: { c: [848, 686], labio: [850, 698], ang: 0.27, ancho: 140, tinta: 5,
            labios: { sup: 4, inf: 7, colorSup: "#cc6351", colorInf: "#f18070" } },
    mofletes: { a: [998, 596], b: [968, 700], n: [0.95, 0.3], bulto: 22 },     // solo el carrillo: debajo empieza la barba
    rubor: { elipses: [[775, 565, 40, 14, 0.25], [985, 600, 14, 10, 0.4]], rayas: [] },
    sudor: [[690, 470, 0], [1010, 560, 0.37], [820, 385, 0.71]],
    chichon: [800, 350], vena: [735, 395],
  },
  hombros: { color: "#2c2d3d", radio: [32, 34], desplaza: { cerca: [4, 20], lejos: [-12, 24] }, arco: [0.95, 1.15], tinta: 5 },
});
