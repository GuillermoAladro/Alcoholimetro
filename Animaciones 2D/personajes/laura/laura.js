"use strict";
/* Laura · recortable animable hecho con las piezas de su avatar 2D (Avatares 2D/Laura/Laura-2D.png).
 *
 * Solo datos y los aros (gancho propio). El dibujo lo hace personajes/comun/personaje.js, con la
 * misma API y la misma postura que Guillermo. Coordenadas: píxeles de su hoja (cuerpo) o de su
 * retrato (cara); las piezas salen de preparar_piezas.py.
 */
const Laura = (() => {
  const { clamp } = M2;
  // aros dorados: [x, y del enganche en la oreja, centro del aro respecto al enganche, rx, ry, grosor, fase]
  const AROS = [[645, 537, -4, 36, 22, 34, 8, 0], [919, 604, 6, 26, 21, 27, 7, 1.9]];
  function aros(g, p, t, H) {
    const pel = p.pelo || {}, empuje = (pel.viento || 0) * 0.3 + (pel.inercia || 0) * 0.55;
    for (const [x, y, cx, cy, rx, ry, w, fase] of AROS) {
      // cuelgan: compensan el giro de la cabeza y se mecen un poco
      const th = -H.ang * 0.85 - empuje + 0.045 * Math.sin(t * 2.3 + fase) + 0.02 * Math.sin(t * 4.1 + fase * 2);
      g.save(); g.translate(x, y); g.rotate(th); g.lineJoin = "round";
      const anillo = () => { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.ellipse(cx, cy, rx - w, ry - w, 0, 0, Math.PI * 2, true); };
      const gr = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
      gr.addColorStop(0, "#fff0a8"); gr.addColorStop(0.35, "#f2c14e"); gr.addColorStop(0.8, "#c98a1c"); gr.addColorStop(1, "#8a5a10");
      anillo(); g.fillStyle = gr; g.fill("evenodd");
      g.strokeStyle = "#2a1a06"; g.lineWidth = 2.4;
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.ellipse(cx, cy, rx - w, ry - w, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = "rgba(255,255,235,0.9)"; g.lineWidth = 2.2; g.lineCap = "round";
      g.beginPath(); g.ellipse(cx, cy, rx - w * 0.5, ry - w * 0.5, 0, Math.PI * 0.75, Math.PI * 1.15); g.stroke();
      g.fillStyle = "#f2c14e"; g.strokeStyle = "#2a1a06"; g.lineWidth = 1.8;
      g.beginPath(); g.arc(0, 2, 5, 0, Math.PI * 2); g.fill(); g.stroke();
      g.restore();
    }
  }
  return Personaje2D.crear("laura", {
    carpeta: "personajes/laura/",
    escala: 0.88,                          // con el mismo p.s mide ≈ 93 % de Guillermo
    pelvis: [258, 660], cuello: [264, 229],
    cadera: { cerca: [185, 660], lejos: [330, 660] },
    bolsillos: { cerca: [140, 566], lejos: [388, 556] },     // muñecas del avatar (manos en los bolsillos)
    cabeza: { esc: 0.75 },                 // retrato → cuerpo (cabezona, como Guillermo)
    cuello_sombra: [806, 728, 62, 22, 0.25],
    colores: { iris: "#332d24", irisLuz: "#6e6249", pupila: "#141210", blanco: "#f6f3f2", rubor: "#ff7a70", boca: "#5a1a1a" },
    cara: {
      centro: [830, 470],
      ojos: { d: { c: [812, 466], r: 17, rx: 20, ry: 7 }, i: { c: [926, 505], r: 13.5, rx: 15, ry: 6 } },
      pestanas: 1, junta_ojo: 1,
      boca: { c: [835, 611], labio: [840, 626], ang: 0.29, ancho: 92, tinta: 5.5,
              labios: { sup: 10, inf: 15, colorSup: "#b65a4a", colorInf: "#d97b66" } },
      mofletes: { a: [968, 528], b: [904, 654], n: [0.85, 0.53], bulto: 38 },
      rubor: { elipses: [[805, 534, 40, 14, 0.25], [956, 562, 18, 11, 0.3]], rayas: [] },
      sudor: [[700, 420, 0], [985, 430, 0.37], [770, 350, 0.71]],
      chichon: [840, 330], vena: [760, 382],
    },
    hombros: { radio: [26, 28], desplaza: { cerca: [4, 8], lejos: [-4, 8] }, arco: [0.88, 1.22], tinta: 4 },
    manos: { escala: 0.88 },
    melena: { sigue: 0.45, tiras: [
      { pieza: "melena_atras", raiz: [604, 660], espejo: true, fase: 1.7, esc: 0.96, inclina: 0.35 },
      { pieza: "melena", raiz: [968, 660], fase: 0, inclina: 0.35 } ] },
    encimaCabeza: aros,
  });
})();
