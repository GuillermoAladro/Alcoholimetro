/* Prueba del banco con la Pi simulada: arranca, paga, sopla, foto, resultado; corte de luz a mitad; errores de la página. */
const { chromium } = require("playwright");
(async () => {
  const [, , html, salida] = process.argv;
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1400, height: 860 } });
  p.setDefaultTimeout(30000);
  const errs = [];
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text().slice(0, 300)); });
  p.on("pageerror", (e) => errs.push("PAGEERROR " + e.message + " " + (e.stack || "").split("\n").slice(0, 3).join(" | ")));
  await p.goto("file://" + html, { waitUntil: "domcontentloaded" });
  // con el GL por software de las pruebas, la mesa 3D solo se dibuja para las capturas
  await p.evaluate(() => { window.ocultar3D = true; });
  await p.waitForFunction(() => window.simLista === true, null, { timeout: 240000 });
  const fase = () => p.evaluate(() => PI.maquina.vistaActual && PI.maquina.vistaActual.fase);
  const t0 = Date.now();
  const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1) + "s", ...a);
  async function hasta(f, max = 60000) {
    const t = Date.now();
    while (Date.now() - t < max) { if ((await fase()) === f) return; await p.waitForTimeout(150); }
    throw new Error("no llega a " + f + " (está en " + (await fase()) + ")");
  }
  const lienzo = async (n) => {
    const url = await p.evaluate(() => PI.pantalla.cv.toDataURL("image/png"));
    require("fs").writeFileSync(`${salida}_${n}.png`, Buffer.from(url.split(",")[1], "base64"));
  };
  try {
    log("lista; partidas:", await p.evaluate(() => PI.almacen.ranking.total));
    await hasta("espera", 30000);
    await p.waitForTimeout(2500);
    await p.evaluate(() => { window.ocultar3D = false; window.pausar(); window.zona("pantalla"); window.cuadro(); });
    await p.screenshot({ path: `${salida}_mesa_espera.png` });
    await p.evaluate(() => { window.zona(null); window.cuadro(); });
    await p.screenshot({ path: `${salida}_todo.png` });
    await p.evaluate(() => { window.ocultar3D = true; const ESC = window.ESCENA; ESC.renderer.setAnimationLoop(() => window.antesDeRender && window.antesDeRender()); });
    await lienzo("1_espera");
    // pagar
    await p.waitForFunction(() => PI.nube.pidiendoTarjeta(), null, { timeout: 30000 });
    await p.click("#bTarjeta");
    await hasta("pagado", 10000); log("pagado");
    await p.evaluate(() => { document.querySelector("#bRapido").click(); });
    await hasta("preparando", 10000); await p.waitForTimeout(800); await lienzo("2_preparando");
    await hasta("sopla", 30000); log("sopla"); await lienzo("3_sopla");
    // soplar 4,5 s manteniendo el botón
    const bx = await p.$("#bSoplar"); const r = await bx.boundingBox();
    await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down();
    await hasta("soplando", 3000); await p.waitForTimeout(2000); await lienzo("4_soplando");
    await p.waitForTimeout(2600); await p.mouse.up();
    await hasta("analizando", 5000); log("analizando"); await p.waitForTimeout(1500); await lienzo("5_cuenta");
    await hasta("resultado", 15000); log("resultado"); await p.waitForTimeout(3500); await lienzo("6_resultado");
    const v = await p.evaluate(() => PI.maquina.vistaActual.d);
    log("resultado:", v.valor, v.unidad, "puesto", v.puesto, "de", v.total, "top", v.top_pct, v.foto_estado);
    await p.evaluate(() => { window.pausar(); window.zona("pantalla"); window.cuadro(); });
    await p.screenshot({ path: `${salida}_mesa_resultado.png` });
    await p.evaluate(() => { const ESC = window.ESCENA; ESC.renderer.setAnimationLoop(() => window.antesDeRender && window.antesDeRender()); });
    // corte de luz a mitad de la siguiente prueba: la prueba se recupera sin pagar otra vez
    await hasta("espera", 40000);
    await p.waitForFunction(() => PI.nube.pidiendoTarjeta(), null, { timeout: 30000 });
    const tx0 = await p.evaluate(() => PI.nube.transacciones.size);
    await p.click("#bTarjeta");
    await hasta("sopla", 30000); log("segunda prueba en sopla: CORTE DE LUZ");
    await p.evaluate(() => { document.querySelector("#dMas").open = true; });
    await p.click("#bCorte");
    await hasta("pagado", 40000);
    const cred = await p.evaluate(() => PI.maquina.vistaActual.d.credito);
    log("tras el corte: pagado con crédito =", cred);
    await hasta("sopla", 30000);
    await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down(); await p.waitForTimeout(4700); await p.mouse.up();
    await hasta("resultado", 20000);
    const tx1 = await p.evaluate(() => PI.nube.transacciones.size);
    log("cobros nuevos en la segunda prueba:", tx1 - tx0, "(debe ser 1)");
    // tercera: pago lento con PIN (25 s) en el botón de "Más pruebas"
    await hasta("espera", 40000);
    await p.waitForFunction(() => PI.nube.pidiendoTarjeta(), null, { timeout: 30000 });
    await p.click("#bPin");
    await hasta("pagado", 45000); log("pago con PIN: la prueba empieza");
    await p.click("#bGrande"); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${salida}_grande.png` });
  } catch (e) { console.log("FALLO:", e.message); await p.screenshot({ path: `${salida}_fallo.png` }); }
  const regs = await p.evaluate(() => PI.registro.lineas().slice(-30).map((l) => `[${l.nivel}] ${l.origen}: ${l.texto}`).join("\n"));
  console.log(regs);
  console.log(errs.slice(0, 20).join("\n") || "sin errores en la página");
  await b.close();
})();
