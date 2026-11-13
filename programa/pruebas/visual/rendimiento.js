/* Mide cuánto tarda cada pantalla en dibujarse con la CPU frenada (aproximación a una Pi 3B+). */
const { chromium } = require("playwright");
(async () => {
  const freno = +(process.argv[2] || 6);
  const b = await chromium.launch({ args: ["--disable-gpu"] }); // como en la Pi: lienzo dibujado por la CPU
  const pg = await b.newPage({ viewport: { width: 1024, height: 600 } });
  await pg.goto("file://" + __dirname + "/escenas.html");
  await pg.waitForFunction(() => window.listo === true, null, { timeout: 60000 });
  const cdp = await pg.context().newCDPSession(pg);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: freno });
  const baja = process.argv[3] === "baja";
  if (process.argv[4] === "sin") await pg.evaluate(() => { window.__p.mono = null; }); // sin monigote, para comparar
  if (baja) await pg.evaluate(() => { const p = window.__p; p.calidad = "baja"; p.calidadAuto = false; p.p.limite = 320; }); // BAJA
  for (const [n, ms] of [["espera", 3000], ["preparando", 3000], ["sopla", 2000], ["soplando", 2500], ["analizando", 2000], ["resultado_top", 5000], ["resultado_cero", 4000], ["aviso", 1000]]) {
    const r = await pg.evaluate(([n, ms]) => {
      const p = window.__p; const cal = p.calidad; window.escena(n, ms); p.calidad = cal;
      // 30 cuadros de verdad (tiempo real, no simulado)
      const t = []; for (let i = 0; i < 30; i++) { if (window.avanzar) window.avanzar(33); const t0 = performance.now(); p.cuadro(0.033); p.ctx.getImageData(0, 0, 1, 1); t.push(performance.now() - t0); }
      t.sort((a, b) => a - b); return [t[15], t[27], p.calidad];
    }, [n, ms]);
    console.log(`${n.padEnd(15)} mediana ${r[0].toFixed(1)} ms · p90 ${r[1].toFixed(1)} ms · calidad ${r[2]}`);
  }
  await b.close();
})();
