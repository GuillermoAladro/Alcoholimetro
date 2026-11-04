const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00086.2 Guillermo y Kiriku - el peine.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00086_2;
    const { T, G, KI } = D, dt = 1e-8;
    const point = (m, x, y) => ({x: m.a*x + m.c*y + m.e, y: m.b*x + m.d*y + m.f});
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function comb(t, poses) {
      if (t < T.kLanza) return poses.k.peineAF;
      const flight = D.peineVolando(t);
      if (flight) return flight.A;
      if (t < T.gSuelta) return poses.g.peineAF;
      if (t < T.lanza) return poses.g.AClav;
      return D.retAPant(D.afCab(KI, poses.k), D.peineEnK(t));
    }
    let headroom = Infinity, last = null, maxStep = 0;
    for (let i = 0; i <= Math.round(D.DUR * 120); i++) {
      const t = i / 120, poses = D.pose(t), m = comb(t, poses), tip = point(m, 42, 1);
      if (last) maxStep = Math.max(maxStep, dist(tip, last));
      last = tip;
      if (D.peineVolando(t)) {
        const c = D.camara(t);
        for (const x of [-8.5, 43]) for (const y of [-3.5, 7]) {
          const p = point(m, x, y), sx = 512 + (p.x - c.x) * c.k, sy = 300 + (p.y - c.y) * c.k;
          headroom = Math.min(headroom, sx, 1024 - sx, sy, 600 - sy);
        }
      }
    }
    const transitions = [T.kLanza, T.gAtrapa, T.gSuelta, T.lanza, T.cae].map(t => {
      const a = comb(t - dt, D.pose(t - dt)), b = comb(t + dt, D.pose(t + dt));
      return Math.max(...[-8, 42].map(x => dist(point(a,x,4), point(b,x,4))));
    });
    const jar = [T.gAgarra, T.gDeja].map(t => dist(D.pose(t - dt).g.centroBote, D.pose(t + dt).g.centroBote));
    if (!G.listo() || !KI.listo() || !(T.gAlzaPeine < T.gChulo0 && T.gAgarra < T.gAlzaBote && T.gAlzaBote < T.gMoja1) || headroom < 4 || maxStep > 30 || Math.max(...transitions,...jar) > .01) throw Error(JSON.stringify({headroom,maxStep,transitions,jar}));
    return {posesAt120Hz: Math.round(D.DUR*120)+1, minimumFlightMarginPx: headroom, maximumTipStepAt120HzPx: maxStep, handHairFlightJoinsPx: transitions, jarJoinsPx: jar};
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
  console.log(JSON.stringify({scene: "00086.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
