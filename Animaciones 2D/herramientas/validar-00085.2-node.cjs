const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00085.2 Guillermo y Kiriku - la cata de vino.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00085_2;
    const { T, RIM } = D;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const spill = D.origenDerrame(), rim = { x: RIM.r, y: RIM.y };
    const initial = dist(D.caminoAnillo(spill.copa, spill.cara, 0), D.enCopa(spill.copa, rim));
    const impact = dist(D.caminoAnillo(spill.copa, spill.cara, T.cara - T.derrame), spill.cara);
    const junction = dist(D.caminoAnillo(spill.copa, spill.cara, D.T_ANILLO - 1e-8), D.caminoAnillo(spill.copa, spill.cara, D.T_ANILLO + 1e-8));
    let sip = 0, release = 0, previous = [1, 1];
    for (let i = 0; i <= Math.round(D.DUR * 120); i++) {
      const t = i / 120, { g, k } = D.pose(t);
      if (t >= T.kSorbo && t <= T.kSorbo1) sip = Math.max(sip, dist(D.enCopa(k.copa, rim), Kiriku.aPantalla(k, Kiriku.boca(k))));
      for (const [j, p] of [g, k].entries()) {
        if (!Number.isFinite(p.copa.vol) || p.copa.vol < 0 || p.copa.vol > previous[j] + 1e-9) throw Error('Volumen en ' + t);
        previous[j] = p.copa.vol;
      }
    }
    D.gotasAnillo.forEach((d, i) => {
      if (!(d.sale >= T.derrame && d.t0 > d.sale)) throw Error('Cronología de la gota ' + i);
      release = Math.max(release, dist(spill.gotas[i], D.enCopa(D.poseG(d.sale).copa, rim)));
    });
    if (!Guillermo.listo() || !Kiriku.listo() || Math.max(initial, impact, junction, sip, release) > .001 || previous[0] !== 0 || previous[1] <= 0) throw Error(JSON.stringify({initial, impact, junction, sip, release, previous}));
    return {posesAt120Hz: Math.round(D.DUR * 120) + 1, spillStartPx: initial, impactPx: impact, trajectoryJoinPx: junction, maximumSipGapPx: sip, dropletOriginsPx: release, distinctDrops: D.gotasAnillo.length, wineAtEnd: previous};
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
  const fresh = await load('escenas/00085.2 Guillermo y Kiriku - la cata de vino.js', 'kiriku');
  const before = hash(fresh.frame(6.15));
  const during = hash(fresh.frame(6.35));
  fresh.frame(11.75);
  assert.equal(hash(fresh.frame(6.15)), before);
  assert.equal(hash(fresh.frame(6.35)), during);
  const times = [0.21, 0.51, 0.77].map(k => k * duration);
  const snapshots = times.map(t => hash(run.frame(t)));
  assert.equal(new Set([black, ...snapshots]).size, snapshots.length + 1);
  times.forEach((t, i) => assert.equal(hash(run.frame(t)), snapshots[i]));
  for (const fps of [30, 60, 120]) {
    run.e.t = 0;
    for (let i = 0; i <= Math.ceil(duration * fps); i++) run.e.actualizar(1 / fps);
    assert(run.e.terminada);
  }
  console.log(JSON.stringify({scene: "00085.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
