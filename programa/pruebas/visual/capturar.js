/* node capturar.js salida_prefijo escena:ms [escena:ms…] — captura escenas de la pantalla */
const { chromium } = require("playwright");
(async () => {
  const [, , pref, ...lista] = process.argv;
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const pg = await b.newPage({ viewport: { width: 1024, height: 600 } });
  const errs = [];
  pg.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
  pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await pg.goto("file://" + __dirname + "/escenas.html");
  await pg.waitForFunction(() => window.listo === true, null, { timeout: 30000 });
  await pg.evaluate(() => document.fonts.ready);
  for (const e of lista) {
    const [n, ms] = e.split(":");
    const t = await pg.evaluate(([n, ms]) => window.escena(n, +ms), [n, ms]);
    await pg.screenshot({ path: `${pref}_${n}_${ms}.png` });
    console.log(n, ms, "ms/cuadro", t.toFixed ? t.toFixed(1) : t);
  }
  console.log(errs.join("\n") || "sin errores");
  await b.close();
})();
