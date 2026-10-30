"use strict";
/* Carla · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Carla/Carla-2D.png).
 *
 * Solo datos y dos ganchos propios: los aros (encima de la cabeza) y el collar (encima del torso),
 * que se mecen con la cabeza, el torso y la melena. El dibujo lo hace personajes/comun/personaje.js,
 * con la misma API y la misma postura que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de
 * su retrato (cara); las piezas salen de preparar_piezas.py.
 */
const Carla = (() => {
  const { clamp } = M2;
  const ORO = ["#fff0a8", "#f2c14e", "#c98a1c", "#8a5a10"], TINTA_ORO = "#2a1a06";
  // aros dorados: [x, y del enganche en la oreja, centro del aro respecto al enganche, rx, ry, grosor, fase]
  const AROS = [[666, 516, 3, 24, 15, 25, 9, 0], [945, 606, -8, 20, 18, 20, 8, 1.9]];
  function aros(g, p, t, H) {
    const pel = p.pelo || {}, empuje = (pel.viento || 0) * 0.3 + (pel.inercia || 0) * 0.55;
    for (const [x, y, cx, cy, rx, ry, w, fase] of AROS) {
      // cuelgan: compensan el giro de la cabeza y se mecen un poco
      const th = -H.ang * 0.85 - empuje + 0.05 * Math.sin(t * 2.2 + fase) + 0.02 * Math.sin(t * 4.3 + fase * 2);
      g.save(); g.translate(x, y); g.rotate(th); g.lineJoin = "round";
      const anillo = () => { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.ellipse(cx, cy, rx - w, ry - w, 0, 0, Math.PI * 2, true); };
      const gr = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
      gr.addColorStop(0, ORO[0]); gr.addColorStop(0.35, ORO[1]); gr.addColorStop(0.8, ORO[2]); gr.addColorStop(1, ORO[3]);
      anillo(); g.fillStyle = gr; g.fill("evenodd");
      g.strokeStyle = TINTA_ORO; g.lineWidth = 2.4;
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.ellipse(cx, cy, rx - w, ry - w, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = "rgba(255,255,235,0.9)"; g.lineWidth = 2.2; g.lineCap = "round";
      g.beginPath(); g.ellipse(cx, cy, rx - w * 0.5, ry - w * 0.5, 0, Math.PI * 0.75, Math.PI * 1.15); g.stroke();
      g.fillStyle = ORO[1]; g.strokeStyle = TINTA_ORO; g.lineWidth = 1.8;
      g.beginPath(); g.arc(0, 2, 4.5, 0, Math.PI * 2); g.fill(); g.stroke();
      g.restore();
    }
  }
  // collar: cadena fina de oro con un colgante redondo; cuelga del cuello y el colgante se mece
  // (con la inclinación del torso, la inercia de la melena y un balanceo suave). Coordenadas de la hoja.
  const COLLAR = { a: [176, 252], b: [304, 254], baja: 30, colgante: 5.5 };
  function collar(g, p, t) {
    const pel = p.pelo || {};
    const giro = -(p.torso || 0) * 1.1 - (pel.inercia || 0) * 0.25 + 0.06 * Math.sin(t * 1.9 + 0.7);
    const [ax, ay] = COLLAR.a, [bx, by] = COLLAR.b;
    const mx = (ax + bx) / 2 + Math.sin(giro) * 16, my = Math.max(ay, by) + COLLAR.baja * Math.cos(giro * 0.6);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const cadena = () => { g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + (mx - ax) * 0.35, my + 4, mx, my);
      g.quadraticCurveTo(bx - (bx - mx) * 0.35, my + 4, bx, by); };
    cadena(); g.strokeStyle = "rgba(90,55,10,0.65)"; g.lineWidth = 3.2; g.stroke();
    cadena(); g.strokeStyle = ORO[1]; g.lineWidth = 1.8; g.stroke();
    // colgante: argolla y disco
    const r = COLLAR.colgante, px = mx + Math.sin(giro) * 4, py = my + r + 2.5;
    g.beginPath(); g.moveTo(mx, my); g.lineTo(px, py - r); g.strokeStyle = TINTA_ORO; g.lineWidth = 1.4; g.stroke();
    const gr = g.createRadialGradient(px - r * 0.35, py - r * 0.35, 0.5, px, py, r);
    gr.addColorStop(0, ORO[0]); gr.addColorStop(0.5, ORO[1]); gr.addColorStop(1, ORO[2]);
    g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fillStyle = gr; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA_ORO; g.stroke();
    g.restore();
  }
  return Personaje2D.crear("carla", {
    carpeta: "personajes/carla/",
    escala: 0.88,                          // con el mismo p.s, algo más baja que Guillermo (con tacones)
    pelvis: [246, 668], cuello: [240, 232],
    cadera: { cerca: [178, 668], lejos: [322, 668] },
    bolsillos: { cerca: [142, 575], lejos: [385, 590] },     // muñecas del avatar (manos en los bolsillos)
    cabeza: { esc: 0.75 },                 // retrato → cuerpo (cabezona, como Laura)
    cuello_sombra: [818, 714, 60, 20, 0.3],
    colores: { iris: "#5a2e17", irisLuz: "#a5652f", pupila: "#140c08", blanco: "#f8f4f2", rubor: "#ff7a68", boca: "#5a1a1a" },
    cara: {
      centro: [880, 480],
      ojos: { d: { c: [849, 446], r: 18, rx: 18, ry: 6 }, i: { c: [961, 493], r: 14, rx: 14, ry: 5 } },
      pestanas: 1, junta_ojo: 1,
      boca: { c: [866, 603], labio: [870, 620], ang: 0.29, ancho: 78, tinta: 5,
              labios: { sup: 9, inf: 13, colorSup: "#d8644f", colorInf: "#ee7b66" } },
      mofletes: { a: [1000, 515], b: [912, 645], n: [0.83, 0.56], bulto: 36 },
      rubor: { elipses: [[818, 522, 38, 13, 0.3], [975, 548, 16, 10, 0.3]], rayas: [] },
      sudor: [[740, 420, 0], [1000, 412, 0.37], [800, 330, 0.71]],
      chichon: [918, 352], vena: [905, 350],
    },
    hombros: { radio: [30, 38], desplaza: { cerca: [6, -4], lejos: [-6, 2] }, arco: [0.9, 1.5], tinta: 4 },
    manos: { escala: 0.86 },
    melena: { sigue: 0.45, tiras: [
      { pieza: "melena_atras", raiz: [580, 650], espejo: true, fase: 1.7, esc: 0.98, inclina: 0.35 },
      { pieza: "melena", raiz: [990, 650], fase: 0, inclina: 0.35 } ] },
    encimaCabeza: aros,
    encimaTronco: collar,
  });
})();
