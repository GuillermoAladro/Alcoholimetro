/* Monta pruebas/visual/escenas.html: la pantalla con vistas de ejemplo, para capturas con Playwright. */
"use strict";
const fs = require("fs");
const path = require("path");
const R = path.join(__dirname, "..", "..");
const lee = (p) => fs.readFileSync(path.join(R, p), "utf8");
const b64 = (p) => fs.readFileSync(path.join(R, p)).toString("base64");
const fuentes = [
  ["Big Shoulders Display", 700, "pi/fuentes/big-shoulders-display-latin-700-normal.woff2"],
  ["Big Shoulders Display", 800, "pi/fuentes/big-shoulders-display-latin-800-normal.woff2"],
  ["Big Shoulders Display", 900, "pi/fuentes/big-shoulders-display-latin-900-normal.woff2"],
  ["Archivo", 400, "pi/fuentes/archivo-latin-400-normal.woff2"],
  ["Archivo", 600, "pi/fuentes/archivo-latin-600-normal.woff2"],
  ["Archivo", 800, "pi/fuentes/archivo-latin-800-normal.woff2"],
];
const css = fuentes.map(([f, w, p]) => `@font-face{font-family:"${f}";font-weight:${w};src:url(data:font/woff2;base64,${b64(p)}) format("woff2")}`).join("\n");
const js = ["nucleo/util.js", "nucleo/textos.js", "nucleo/pantalla.js", "sim/camara_sim.js"].map((f) => `<script>/* ${f} */\n${lee(f)}\n</script>`).join("\n");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}
html,body{margin:0;background:#000}canvas{display:block}</style></head><body>
<canvas id="cv" width="1024" height="600"></canvas>
${js}
<script>${lee("pruebas/visual/escenas.js")}</script></body></html>`;
fs.writeFileSync(path.join(__dirname, "escenas.html"), html);
console.log("escenas.html", Math.round(html.length / 1024), "KB");
