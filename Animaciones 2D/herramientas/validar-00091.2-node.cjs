const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00091.2 Guillermo y Marta - el cafe con arte.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00091_2;
    const {T}=D, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    let samples=0;
    for(const [mano,t0,t1] of [['M',T.mVierte-.04,T.mCorte+.04],['G',T.gVierte,T.gPara+.06]]){
      let prev={cabeza:0,cola:0};
      for(let i=0;i<=200;i++){const t=t0+(t1-t0)*i/200,p=D.limitesChorro(t,mano);
        if(p.cabeza+1e-8<prev.cabeza||p.cola+1e-8<prev.cola||p.cola>p.cabeza||p.cola>0&&p.cabeza<1)throw Error('Extremos del chorro');
        prev=p;samples++;
      }
      if(prev.cola<.999999)throw Error('La última leche no llega a la taza');
    }
    const vuelo=T.plaf-T.derrama, zap=D.puntoZapato(D.poseG(T.plaf));
    const hit=dist(zap,D.gotaEspuma(T.derrama,T.plaf));
    let rim=0,tip=0,jump=0;
    for(let i=0;i<=60;i++){
      const e=T.derrama+(T.endereza-T.derrama)*i/60;
      rim=Math.max(rim,dist(D.gotaEspuma(e,e),D.enTaza(D.tazaEnManoG(e),{x:14.5,y:-20.5})));
      let y=-Infinity;for(let j=0;j<=30;j++){const q=D.gotaEspuma(e,e+vuelo*j/30);if(q.y<y-1e-8)throw Error('Gota ascendente');y=q.y;}
    }
    const floor=Math.abs(D.gotaEspuma(T.endereza,T.endereza+vuelo).y-D.SUELO);
    for(let i=0;i<=200;i++){
      const t=T.ojo1-.035+(T.mRetira-T.ojo1+.035)*i/200,p=D.poseM(t).palillo;
      tip=Math.max(tip,dist({x:p.base.x+D.PAL_L*p.dir.x,y:p.base.y+D.PAL_L*p.dir.y},D.puntaEspuma(t)));
    }
    for(const t of [T.ojo1+.04,T.ojo1+.14,T.ojo2+.04,T.ojo2+.14,T.sonrisa0,T.sonrisa1]){
      jump=Math.max(jump,dist(D.puntaEspuma(t-1e-7),D.puntaEspuma(t+1e-7)));
    }
    if(Math.max(hit,rim,floor,tip,jump)>.01||!Marta.listo()||!Guillermo.listo())throw Error(JSON.stringify({hit,rim,floor,tip,jump}));
    return {samplesMilk:samples,emissionsTested:61,flightSeconds:vuelo,rimGapPx:rim,shoeImpactGapPx:hit,finalFloorErrorPx:floor,stickTipGapPx:tip,stickJoinJumpPx:jump};
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
  console.log(JSON.stringify({scene: "00091.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
