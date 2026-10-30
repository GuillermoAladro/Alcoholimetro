"use strict";
/* Marta · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Marta/Marta-2D.png).
 *
 * Solo datos. El dibujo lo hace personajes/comun/personaje.js, con la misma API y la misma postura
 * que Guillermo. Su avatar mira a la izquierda: preparar_piezas.py refleja la hoja («espejar») y aquí
 * todo son píxeles de la hoja ya reflejada (cuerpo) o de su retrato reflejado (cara), así que mira a la
 * derecha como los demás. Chaqueta de punto gris muy holgada: los hombros son grises y cada brazo es una
 * manga (la mano se dibuja aparte al sacarla del bolsillo). Melena larga castaña: la cabeza trae el pelo
 * hasta los hombros y dos tiras (una por detrás, reflejada) cuelgan y se balancean.
 */
const Marta = Personaje2D.crear("marta", {
  carpeta: "personajes/marta/",
  escala: 0.87,                          // con el mismo p.s, algo más baja que Guillermo
  pelvis: [232, 690], cuello: [209, 232],
  cadera: { cerca: [165, 690], lejos: [300, 690] },
  bolsillos: { cerca: [118, 598], lejos: [330, 604] },     // muñecas del avatar (manos en los bolsillos)
  cabeza: { esc: 0.8 },                 // retrato → cuerpo (cabezona, como Laura y Carla)
  cuello_sombra: [738, 640, 52, 11, 0.51],
  colores: { iris: "#5e3519", irisLuz: "#a86a34", pupila: "#170c07", blanco: "#f8f4f2", rubor: "#ff7a68", boca: "#5a1a1a" },
  cara: {
    centro: [840, 470],
    ojos: { d: { c: [789, 420], r: 17, rx: 18, ry: 6 }, i: { c: [907, 462], r: 14, rx: 12, ry: 5 } },
    pestanas: 1, junta_ojo: 1,
    boca: { c: [824, 561], labio: [820, 578], ang: 0.33, ancho: 96, tinta: 5,
            labios: { sup: 8, inf: 13, colorSup: "#cf7465", colorInf: "#ec9283" } },
    mofletes: { a: [926, 508], b: [868, 630], n: [0.9, 0.43], bulto: 34 },
    rubor: { elipses: [[778, 486, 40, 14, 0.3], [912, 516, 16, 10, 0.4]], rayas: [] },
    sudor: [[715, 400, 0], [945, 445, 0.37], [855, 290, 0.71]],
    chichon: [860, 250], vena: [895, 320],
  },
  // hombros: el torso ya los trae con su punto; el disco es pequeño, sin contorno y queda bajo la manga en reposo
  hombros: { color: "#9d9897", radio: [17, 17], desplaza: { cerca: [4, 16], lejos: [-4, 16] }, arco: [0.95, 1.3], tinta: 0.01 },
  manos: { escala: 0.88 },
  melena: { sigue: 0.45, tiras: [
    { pieza: "melena_atras", raiz: [570, 660], espejo: true, fase: 1.7, esc: 0.98, inclina: 0.35 },
    { pieza: "melena", raiz: [950, 660], fase: 0, inclina: 0.35 } ] },
});
