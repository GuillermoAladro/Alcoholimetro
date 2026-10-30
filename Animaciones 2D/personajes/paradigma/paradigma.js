"use strict";
/* Paradigma · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Paradigma/Paradigma-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara); las piezas salen
 * de preparar_piezas.py. Cazadora negra abierta sobre camiseta blanca: los hombros y las mangas son
 * negros y la mano se dibuja aparte al sacarla del bolsillo.
 */
const Paradigma = Personaje2D.crear("paradigma", {
  carpeta: "personajes/paradigma/",
  escala: 1.0,                           // con el mismo p.s, de la talla de Guillermo
  pelvis: [262, 700], cuello: [262, 236],
  cadera: { cerca: [195, 705], lejos: [335, 705] },
  bolsillos: { cerca: [138, 634], lejos: [384, 632] },     // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
  colores: { iris: "#3e2416", irisLuz: "#7d5034", pupila: "#0e0806", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
  cara: {
    centro: [800, 520],
    // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
    ojos: { d: { c: [781, 492], r: 15, rx: 18, ry: 4, arriba: [[738, 472], [750, 469], [765, 469], [780, 470], [795, 473], [806, 478], [814, 486], [819, 496]] },
            i: { c: [918, 530], r: 12, rx: 12, ry: 3, arriba: [[888, 512], [898, 509], [910, 509], [922, 512], [933, 516], [942, 521], [948, 530]] } },
    boca: { c: [835, 656], labio: [838, 668], ang: 0.22, ancho: 116, tinta: 5,
            labios: { sup: 4, inf: 7, colorSup: "#d07c66", colorInf: "#ec9480" } },
    mofletes: { a: [936, 602], b: [880, 700], n: [0.87, 0.5], bulto: 26 },
    rubor: { elipses: [[745, 560, 40, 14, 0.25], [905, 595, 14, 9, 0.4]], rayas: [] },
    sudor: [[670, 470, 0], [955, 560, 0.37], [760, 360, 0.71]],
    chichon: [800, 330], vena: [890, 385],
  },
  hombros: { color: "#2d2c31", radio: [44, 46], desplaza: { cerca: [6, 6], lejos: [-6, 6] }, arco: [0.9, 1.3], tinta: 5 },
});
