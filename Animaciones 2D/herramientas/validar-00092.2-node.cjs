const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00092.2 Guillermo y Marta - la bufanda.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00092_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-6;
    const m=D.pose(T.lanza).m, hand=D.centroMano(Marta,m,m.manoLejos);
    const release=dist(D.puntaVuelo(T.lanza),{x:hand.x+2,y:hand.y+6});
    const shoulder=dist(D.puntaVuelo(T.cae),D.enganche(T.cae,D.pose(T.cae).g));
    const p=D.pose(T.snip1),punto=D.corteFijo(),cabo=D.caboCuello(T.snip1);
    const split=dist(punto,D.torsoAPantalla(p.g,cabo[2]));
    const splitRoot=dist(D.enganche(T.snip1,p.g),D.torsoAPantalla(p.g,cabo[0]));
    const posBlade=D.centroMano(Marta,p.m,p.m.manoLejos),dBlade=dist(punto,posBlade);
    const opening=Math.max(D.aperturaTijeras(T.snip1),D.aperturaTijeras(T.snip2));
    const phase=Math.abs(D.dada(T.cae+eps)-D.dada(T.cae-eps));
    const sag=Math.max(...[T.capullo,T.tiron-.05,T.tiron,T.des1].map(t=>Math.abs(D.comba(t+eps)-D.comba(t-eps))));
    let anchor=0;for(let i=0;i<=120;i++){const t=T.snip1+(D.DUR-T.snip1)*i/120,pg=D.pose(t).g,a=D.caboCuello(t);
      anchor=Math.max(anchor,dist(D.torsoAPantalla(pg,a[0]),D.enganche(t,pg)));
    }
    if(!Guillermo.listo()||!Marta.listo()||Math.max(release,shoulder,split,splitRoot,phase,sag,anchor,opening)>.01||dBlade<12||dBlade>29)throw Error(JSON.stringify({release,shoulder,split,splitRoot,phase,sag,anchor,opening,dBlade}));
    return {releaseGapPx:release,shoulderGapPx:shoulder,splitGapPx:split,neckGapPx:splitRoot,neckTrackingErrorPx:anchor,bladeGripToCutPx:dBlade,openingAtSnipsRad:opening,stripePhaseJumpPx:phase,sagJoinJumpPx:sag};
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
  console.log(JSON.stringify({scene: "00092.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
