"use strict";
/* Kiriku · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Kiriku/Kiriku-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara); las piezas salen
 * de preparar_piezas.py. Polo negro de manga corta con el jersey echado sobre los hombros y las gafas
 * de sol colgadas del cuello (van en el torso): los hombros son negros y cada brazo es la manga más el
 * brazo de piel; la mano se dibuja aparte al sacarla del bolsillo.
 */
const Kiriku = Personaje2D.crear("kiriku", {
  carpeta: "personajes/kiriku/",
  escala: 1.03,                          // con el mismo p.s, de la talla de Guillermo (su retrato mira hacia arriba)
  pelvis: [262, 705], cuello: [262, 240],
  cadera: { cerca: [192, 705], lejos: [335, 705] },
  bolsillos: { cerca: [150, 658], lejos: [393, 660] },     // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.6 },                 // retrato → cuerpo (cabezón, como Guillermo)
  colores: { iris: "#3a2420", irisLuz: "#7a4b36", pupila: "#0e0807", blanco: "#f7f2ee", rubor: "#ff7a6a", boca: "#4f1512" },
  cara: {
    centro: [840, 430],
    // arriba: borde de arriba de la raya gruesa de las pestañas (es de la cabeza): al cerrar, el párpado la tapa
    ojos: { d: { c: [838, 398], r: 14, rx: 14, ry: 3, arriba: [[790, 386], [800, 383], [817, 382], [833, 382], [850, 384], [863, 387], [872, 392], [877, 400], [879, 407]] },
            i: { c: [962, 440], r: 12, rx: 10, ry: 3, arriba: [[939, 422], [945, 421], [953, 422], [962, 424], [970, 427], [977, 432], [982, 437], [985, 443], [986, 450]] } },
    boca: { c: [880, 542], labio: [882, 553], ang: 0.2, ancho: 96, tinta: 5,
            labios: { sup: 4, inf: 6, colorSup: "#d57e6a", colorInf: "#ee907b" } },
    mofletes: { a: [992, 505], b: [942, 640], n: [0.92, 0.38], bulto: 26 },
    rubor: { elipses: [[812, 445, 38, 13, 0.3], [972, 490, 14, 9, 0.4]], rayas: [] },
    sudor: [[735, 390, 0], [978, 505, 0.37], [880, 280, 0.71]],
    chichon: [880, 292], vena: [930, 300],
  },
  hombros: { color: "#24232a", radio: [32, 34], desplaza: { cerca: [4, 18], lejos: [-2, 16] }, arco: [0.95, 1.15], tinta: 5 },
});
