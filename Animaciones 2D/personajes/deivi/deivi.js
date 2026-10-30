"use strict";
/* Deivi · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Deivi/Deivi-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara); las piezas salen
 * de preparar_piezas.py. Camiseta lila de manga corta: los hombros son lilas y el brazo es la manga
 * con el brazo de piel; la mano se dibuja aparte al sacarla del bolsillo.
 */
const Deivi = Personaje2D.crear("deivi", {
  carpeta: "personajes/deivi/",
  escala: 1.0,                           // con el mismo p.s, de la talla de Guillermo
  pelvis: [235, 700], cuello: [238, 258],
  cadera: { cerca: [165, 700], lejos: [305, 700] },
  bolsillos: { cerca: [95, 662], lejos: [328, 660] },      // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
  colores: { iris: "#3e2216", irisLuz: "#8a4f30", pupila: "#120a08", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
  cara: {
    centro: [840, 520],
    // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
    ojos: { d: { c: [791, 477], r: 16, rx: 20, ry: 5, arriba: [[760, 462], [775, 457], [790, 455], [805, 455], [820, 456], [835, 460], [845, 465], [852, 472]] },
            i: { c: [936, 511], r: 14, rx: 16, ry: 4, arriba: [[918, 492], [930, 489], [945, 489], [960, 492], [972, 498], [982, 507]] } },
    boca: { c: [850, 632], labio: [852, 644], ang: 0.265, ancho: 118, tinta: 5,
            labios: { sup: 4, inf: 7, colorSup: "#b8693f", colorInf: "#e2905c" } },
    mofletes: { a: [962, 605], b: [905, 712], n: [0.95, 0.3], bulto: 30 },
    rubor: { elipses: [[790, 550, 40, 14, 0.3], [952, 590, 16, 10, 0.4]], rayas: [] },
    sudor: [[705, 470, 0], [958, 585, 0.37], [760, 395, 0.71]],
    chichon: [820, 385], vena: [745, 405],
  },
  hombros: { color: "#b999da", radio: [32, 34], desplaza: { cerca: [4, 20], lejos: [-4, 22] }, arco: [0.95, 1.15], tinta: 5 },
});
