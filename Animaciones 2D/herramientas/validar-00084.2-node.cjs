const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00084.2 Guillermo y Kiriku - el jersey.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00084_2;
    const T=D.T, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    let reach=-Infinity;
    for(let i=0;i<=Math.round(D.DUR*120);i++){const r=D.diag(i/120);for(const k of Object.keys(r.max))reach=Math.max(reach,r[k]-r.max[k]);}
    const impact=dist(...D.contactoPalma(T.choca));
    const arrival=Math.abs(D.balanceoJersey(T.cae2)-.9);
    const launch=Math.abs(D.balanceoJersey(T.lanzaK+1e-7)-D.balanceoJersey(T.lanzaK-1e-7));
    if(!Guillermo.listo()||!Kiriku.listo()||impact>.05||reach>0||Math.max(arrival,launch)>.001)throw Error(JSON.stringify({impact,reach,arrival,launch}));
    return {posesAt120Hz:Math.round(D.DUR*120)+1,palmImpactPx:impact,reachOverLimit:reach,arrivalAngleError:arrival,launchAngleStep:launch};
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
  console.log(JSON.stringify({scene: "00084.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
