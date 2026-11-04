const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00088.2 Guillermo y Kiriku - el reloj caro.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00088_2;
    const {T,RJ} = D;
    const get = t => D.reloj(t,D.poseG(t));
    const joins = [T.gPone0,T.gPone1,T.pop1,T.coge1,T.pop2,T.coge2,T.pop3,T.L0,T.Lfin].map(t => {
      const a=get(t-1e-7),b=get(t+1e-7);
      return Math.max(...['x','y','rot','sx','sy','esc'].map(k=>Math.abs(b[k]-a[k])));
    });
    let contact = 0, earlyPress = 0, stopped = 0;
    for (let i=0;i<=Math.round(D.DUR*120);i++) {
      const t=i/120,p=D.poseK(t),r=get(t);
      if (t<T.pisa) earlyPress=Math.max(earlyPress,D.pisado(t));
      if (t<T.pisa || !r) continue;
      const foot=p.piernas.lejos, c={x:(Kiriku.PUNTA.x+Kiriku.TALON.x)/2,y:(Kiriku.PUNTA.y+Kiriku.TALON.y)/2};
      const off=Kiriku.rotP(c,foot.ang),w=Kiriku.aPantalla(p,{x:foot.tob.x+off.x,y:foot.tob.y+off.y});
      const highest=r.y+RJ.base-(RJ.base+40.5+3.25)*r.sy;
      contact=Math.max(contact,Math.hypot(w.x-r.x,w.y-highest));
      stopped=Math.max(stopped,Math.abs(r.suena),Math.abs(r.y+RJ.base-D.suelo));
    }
    const heights=[];
    for(let i=0;i<T.nSaltos;i++) {
      const t=T.L0+i*T.salto, hit=D.relojSuelo(t+.02), top=D.relojSuelo(t+.58*T.salto), end=D.relojSuelo(t+T.salto);
      if(Math.abs(hit.h)>.001 || !(hit.sy<1) || top.h<8 || Math.abs(end.h)>.001)throw Error('Bote '+i);
      heights.push(+top.h.toFixed(3));
    }
    if(!Guillermo.listo()||!Kiriku.listo()||Math.max(...joins,earlyPress,contact,stopped)>.01)throw Error(JSON.stringify({joins,earlyPress,contact,stopped}));
    return {posesAt120Hz:Math.round(D.DUR*120)+1,maximumPropHandoffDifference:Math.max(...joins),soleToHandlePx:contact,compressionBeforeFoot:earlyPress,residualAlarmOrGroundError:stopped,bounceHeightsPx:heights};
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
  console.log(JSON.stringify({scene: "00088.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
