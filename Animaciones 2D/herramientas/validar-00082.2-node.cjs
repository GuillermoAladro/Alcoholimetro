const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00082.2 Guillermo y Kiriku - el selfie de postureo.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00082_2;
    const T = D.T, dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const fly = D.vueloMovil(T.golpe), splash = D.vueloMovil(T.plof), drink = D.movilEnCopa(T.plof);
    const held = D.colgando(D.poseK(T.pesca1), T.pesca1), immersed = D.movilEnCopa(T.pesca1);
    const contactErrors = [dist(D.golpePalo(T.golpe),D.palmaSalto(T.golpe)),dist(fly,D.centroMovilPalo(D.poseK(T.golpe))),dist(splash,drink),dist(held.c,immersed)];
    const angle = (a,b) => Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
    const rotationErrors = [angle(splash.ang,drink.ang),angle(held.ang,immersed.ang)];
    for (let frame = 0; frame <= Math.round(D.DUR*120); frame++) {
      const t = frame/120, pose = D.pose(t);
      if(pose.g.cara.bigote!==0 || !Number.isFinite(pose.g.cara.espiral)) throw Error('Cara no definida a '+t);
    }
    if (!Guillermo.listo() || !Kiriku.listo() || Math.max(...contactErrors, ...rotationErrors)>.01) throw Error('Discontinuidad del móvil');
    return {posesAt120Hz:Math.round(D.DUR*120)+1,contactErrorsPx:contactErrors,rotationErrorsRad:rotationErrors};
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
  console.log(JSON.stringify({scene: "00082.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
