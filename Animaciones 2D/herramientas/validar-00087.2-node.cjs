const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00087.2 Guillermo y Kiriku - el baile de salon.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00087_2;
    const { T, suelo } = D, eps = 1e-7;
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const edge = q => q.y + 35.5*Math.abs(Math.sin(q.a)) + 41.5*Math.abs(Math.cos(q.a));
    const lands = T.choque + .04 + .42;
    const join = distance(D.poseCuadro(lands-eps), D.poseCuadro(lands+eps));
    const atRest = Math.abs(edge(D.poseCuadro(lands + .75)) - suelo);
    const cameraJump = distance(D.camara(T.choque - eps), D.camara(T.choque + eps));
    let slip = 0, overlapError = 0, throughFloor = 0, wrist = -Infinity;
    for (let i = 0; i <= Math.round(D.DUR * 120); i++) {
      const t = i / 120, p = D.pose(t), q = D.poseCuadro(t), limits = D.diag(t);
      if (q) throughFloor = Math.max(throughFloor, edge(q) - suelo);
      for (const [k, max] of Object.entries(limits.max)) wrist = Math.max(wrist, limits[k] - max);
      if (t >= T.coge && t <= T.suelta) {
        const a = Guillermo.aPantalla(p.g,p.g.manoLejos), b = Kiriku.aPantalla(p.k,p.k.manoLejos);
        overlapError = Math.max(overlapError, Math.hypot((b.x - a.x) - 11, (a.y - b.y) - 2));
      }
    }
    for (let i = 1; i < D.vueltaPasos.length; i++) {
      const a = D.vueltaPasos[i-1], b = D.vueltaPasos[i], near = a[2] === b[2];
      for (let frame = 0; frame <= 12; frame++) {
        const p = D.pose(a[0] + (b[0] - a[0])*frame / 12).g;
        const m = near ? p.piernas.cerca.tob : p.piernas.lejos.tob;
        slip = Math.max(slip, Math.abs(Guillermo.aPantalla(p,m).x - (near ? a[2] : a[1])));
      }
    }
    if (!Guillermo.listo() || !Kiriku.listo() || D.pose(T.choque).g.x > -140 || Math.max(join, atRest, throughFloor, cameraJump, slip, overlapError) > .01 || wrist > 0) throw Error(JSON.stringify({join, atRest, throughFloor, cameraJump, slip, overlapError, wrist}));
    return {posesAt120Hz: Math.round(D.DUR*120)+1, frameLandingJumpPx:join, frameGroundErrorPx:atRest, frameGroundPenetrationPx:throughFloor, cameraJumpPx:cameraJump, supportingFootSlipPx:slip, heldHandOffsetErrorPx:overlapError, wristReachOverLimit:wrist};
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
  console.log(JSON.stringify({scene: "00087.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
