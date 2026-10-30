"use strict";
/* Sara Sáez · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Sara-Saez/Sara-Saez-2D.png).
 *
 * Solo datos y un gancho propio: el collar de cordón negro con la cruz (encima del torso), que se
 * mece con el torso y la melena. El dibujo lo hace personajes/comun/personaje.js, con la misma API y
 * la misma postura que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su retrato (cara);
 * las piezas salen de preparar_piezas.py. Top negro de manga larga: los hombros y las mangas son
 * negros y la mano se dibuja aparte al sacarla del bolsillo. Los pendientes de perla y el aro de la
 * nariz van en la cabeza.
 */
const SaraSaez = (() => {
  // collar: cordón fino negro con una cruz; cuelga del cuello y la cruz se mece (con la inclinación del
  // torso, la inercia de la melena y un balanceo suave). Coordenadas de la hoja.
  const COLLAR = { a: [211, 262], b: [278, 264], centro: 256, baja: 50, cruz: [26, 14] };
  function collar(g, p, t) {
    const pel = p.pelo || {};
    const giro = -(p.torso || 0) * 1.1 - (pel.inercia || 0) * 0.25 + 0.06 * Math.sin(t * 1.9 + 0.7);
    const [ax, ay] = COLLAR.a, [bx, by] = COLLAR.b;
    const mx = COLLAR.centro + Math.sin(giro) * 14, my = Math.max(ay, by) + COLLAR.baja * Math.cos(giro * 0.6);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const cordon = () => { g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + (mx - ax) * 0.3, my + 2, mx, my);
      g.quadraticCurveTo(bx - (bx - mx) * 0.3, my + 2, bx, by); };
    cordon(); g.strokeStyle = "#141114"; g.lineWidth = 3.2; g.stroke();
    cordon(); g.strokeStyle = "rgba(150,140,146,0.55)"; g.lineWidth = 0.9; g.stroke();
    // cruz: cuelga de la argolla y gira un poco más que el cordón
    const [L, W] = COLLAR.cruz;
    g.translate(mx, my + 1); g.rotate(giro * 0.8);
    g.beginPath(); g.arc(0, 2, 2.2, 0, Math.PI * 2); g.strokeStyle = "#141114"; g.lineWidth = 1.6; g.stroke();
    const cruz = () => { g.beginPath(); g.rect(-2.6, 4, 5.2, L); g.rect(-W / 2, 4 + L * 0.24, W, 5); };
    cruz(); g.fillStyle = "#2c282b"; g.fill();
    g.fillStyle = "#7a7378"; g.fillRect(-1.4, 5.2, 1.4, L - 2.4); g.fillRect(-W / 2 + 1.2, 4 + L * 0.24 + 1.1, W - 2.4, 1.3);
    g.beginPath(); g.rect(-2.6, 4, 5.2, L); g.strokeStyle = "#0b0a0c"; g.lineWidth = 1.4; g.stroke();
    g.beginPath(); g.rect(-W / 2, 4 + L * 0.24, W, 5); g.stroke();
    g.fillStyle = "#2c282b"; g.fillRect(-1.9, 4 + L * 0.24 + 0.7, 3.8, 3.6);
    g.restore();
  }
  return Personaje2D.crear("sara-saez", {
    carpeta: "personajes/sara-saez/",
    escala: 0.92,                          // con el mismo p.s, algo más baja que Guillermo
    pelvis: [262, 700], cuello: [245, 268],
    cadera: { cerca: [190, 700], lejos: [335, 700] },
    bolsillos: { cerca: [138, 618], lejos: [400, 610] },     // muñecas del avatar (manos en los bolsillos)
    cabeza: { esc: 0.75 },                 // retrato → cuerpo (cabezona, como Laura y Carla)
    cuello_sombra: [795, 612, 50, 16, 0.55],
    colores: { iris: "#6b3a1f", irisLuz: "#b07a45", pupila: "#160c08", blanco: "#f8f4f2", rubor: "#ff7a68", boca: "#5a1a1a" },
    cara: {
      centro: [860, 440],
      ojos: { d: { c: [812, 383], r: 15, rx: 15, ry: 5 }, i: { c: [921, 420], r: 14, rx: 13, ry: 4 } },
      pestanas: 1, junta_ojo: 1,
      boca: { c: [837, 525], labio: [842, 541], ang: 0.236, ancho: 80, tinta: 5,
              labios: { sup: 16, inf: 18, colorSup: "#c8626a", colorInf: "#e0807e" } },
      mofletes: { a: [972, 445], b: [900, 565], n: [0.86, 0.51], bulto: 30 },
      rubor: { elipses: [[788, 440, 36, 12, 0.3], [958, 458, 14, 9, 0.3]], rayas: [] },
      sudor: [[720, 400, 0], [985, 380, 0.37], [830, 270, 0.71]],
      chichon: [870, 205], vena: [945, 300],
    },
    hombros: { color: "#262427", radio: [30, 34], desplaza: { cerca: [6, -2], lejos: [-4, 2] }, arco: [0.9, 1.4], tinta: 4 },
    manos: { escala: 0.86 },
    melena: { sigue: 0.45, tiras: [
      { pieza: "melena_atras", raiz: [565, 615], espejo: true, fase: 1.7, esc: 0.98, inclina: 0.35 },
      { pieza: "melena", raiz: [990, 615], fase: 0, inclina: 0.35 } ] },
    encimaTronco: collar,
  });
})();
