"use strict";
/* Ander · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Ander/Ander-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara); las piezas salen
 * de preparar_piezas.py. Sudadera azul: los hombros y las mangas son azules y la mano se dibuja aparte.
 */
const Ander = Personaje2D.crear("ander", {
  carpeta: "personajes/ander/",
  escala: 1.0,                           // con el mismo p.s, de la talla de Guillermo
  pelvis: [262, 690], cuello: [262, 214],
  cadera: { cerca: [195, 690], lejos: [335, 690] },
  bolsillos: { cerca: [152, 624], lejos: [393, 628] },     // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
  colores: { iris: "#56301e", irisLuz: "#8d5439", pupila: "#120c08", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
  cara: {
    centro: [850, 520],
    // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
    ojos: { d: { c: [808, 503], r: 16, rx: 22, ry: 6, arriba: [[756, 476], [770, 475], [785, 476], [800, 478], [815, 481], [830, 485], [843, 490], [857, 498]] },
            i: { c: [950, 563], r: 13, rx: 16, ry: 5, arriba: [[916, 540], [930, 539], [949, 544], [967, 551], [982, 559], [990, 568]] } },
    boca: { c: [845, 668], labio: [850, 678], ang: 0.33, ancho: 108, tinta: 5.5,
            labios: { sup: 6, inf: 9, colorSup: "#c9714f", colorInf: "#ec9a76" } },
    mofletes: { a: [990, 606], b: [958, 704], n: [0.95, 0.3], bulto: 30 },
    rubor: { elipses: [[780, 590, 42, 14, 0.3], [972, 628, 16, 10, 0.3]], rayas: [] },
    sudor: [[690, 520, 0], [1000, 520, 0.37], [760, 410, 0.71]],
    chichon: [855, 372], vena: [775, 392],
  },
  hombros: { color: "#687cac", radio: [44, 46], desplaza: { cerca: [6, 8], lejos: [-6, 8] }, arco: [0.9, 1.3], tinta: 5 },
});
