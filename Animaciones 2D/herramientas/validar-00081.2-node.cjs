const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00081.2 Guillermo y Kiriku - las gafas de sol.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00081_2;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const taps = [[D.T.bote1, true], [D.T.bote2, false]].map(([t, near]) => {
      const hit = D.bote(t, near);
      return dist(hit.palma, hit.puente);
    });
    let worstExtension = -Infinity, handoff = 0;
    for (let i = 0; i <= Math.round(D.DUR * 120); i++) {
      const d = D.diag(i / 120);
      for (const k of Object.keys(d.max)) worstExtension = Math.max(worstExtension, d[k] - d.max[k]);
    }
    for (const t of [D.T.kPone1, D.T.gPone1, D.T.vuela, D.T.atrapa, D.T.gReves1, D.T.gToca, D.T.gLanza, D.T.gNariz]) {
      const before = D.puntos(t - 1e-6), after = D.puntos(t + 1e-6);
      for (const key of ['g','k']) if (before[key] && after[key])
        before[key].forEach(([x,y], i) => {handoff = Math.max(handoff, Math.hypot(x - after[key][i][0], y - after[key][i][1]));});
    }
    if (!Guillermo.listo() || !Kiriku.listo() || Math.max(...taps) > .01 || worstExtension > 0 || handoff > .25)
      throw Error('Error de contacto, continuidad o carga de los avatares');
    return {posesAt120Hz: Math.round(D.DUR * 120) + 1, palmErrorsPx: taps, handoffMaxPx: handoff, extensionOverLimit: worstExtension};
  })()`);
  const hash = canvas => crypto.createHash('sha256').update(canvas.data()).digest('hex');
  const background = C.createCanvas(1024, 600);
  const graphics = background.getContext('2d');
  graphics.fillStyle = '#000';
  graphics.fillRect(0, 0, 1024, 600);
  const black = hash(background), duration = run.e.dur;
  for (let i = 0; i < 8; i++) {
    const t = i / 60;
    assert.equal(hash(run.frame(t)), black);
    assert.equal(hash(run.frame(duration - t)), black);
  }
  const times = [0.21, 0.51, 0.77].map(k => k * duration);
  const snapshots = times.map(t => hash(run.frame(t)));
  assert.equal(new Set([black, ...snapshots]).size, snapshots.length + 1);
  times.forEach((t, i) => assert.equal(hash(run.frame(t)), snapshots[i]));
  for (const fps of [30, 60, 120]) {
    run.e.t = 0;
    for (let i = 0; i <= Math.ceil(duration * fps); i++) run.e.actualizar(1 / fps);
    assert(run.e.terminada);
  }
  console.log(JSON.stringify({scene: "00081.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
