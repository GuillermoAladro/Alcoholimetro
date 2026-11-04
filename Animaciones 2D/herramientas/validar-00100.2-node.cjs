const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00100.2 Guillermo y Marta - el baile en la cocina.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00100_2;
    const {T}=D,eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),arc=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));let limbs=0,pan=0,spoon=0,sack=0,wheel=0,angle=null;
    for(const t of [T.giro0,T.choque,T.risa1,T.coge0,D.CRUCE0,D.CRUCE1]){
     const a=D.poseG(t-eps),b=D.poseG(t+eps);
     for(const k of ["cerca","lejos"])limbs=Math.max(limbs,dist(Guillermo.aPantalla(a,a.piernas[k].tob),Guillermo.aPantalla(b,b.piernas[k].tob)));
     for(const k of ["manoCerca","manoLejos"])limbs=Math.max(limbs,dist(Guillermo.aPantalla(a,a[k]),Guillermo.aPantalla(b,b[k])));
    }
    const hook=D.colgada(T.coge),f=D.poseG(T.coge).sarten;
    pan=Math.max(dist(hook,f),dist(D.SARTEN_GANCHO,{x:hook.x-8*Math.cos(hook.a),y:hook.y-8*Math.sin(hook.a)}),Math.abs(arc(hook.a,f.a)));
    for(let j=0;j<=80;j++){const t=T.molino0+.12+(T.salto-.06-T.molino0-.12)*j/80,p=D.poseG(t),h=Guillermo.tronco(p)(Guillermo.HOMBRO_C),m=p.manoCerca;
     const a=Math.atan2(m.y-h.y,m.x-h.x);if(angle!==null)wheel+=arc(angle,a);angle=a;}
    for(const t of [D.T_LANZA,D.T_ATRAPA]){
     const a=D.poseM(t-eps).cuchara,b=D.poseM(t+eps).cuchara;spoon=Math.max(spoon,dist(a,b),Math.abs(arc(a.a,b.a)));
    }
    const m=D.poseM(T.toque).cuchara,toque=dist({x:m.x+60*Math.cos(m.a),y:m.y+60*Math.sin(m.a)},{x:D.OLLA.x+D.OLLA.w/2,y:D.OLLA.y-D.OLLA.h+4});
    const tiene=t=>D.saco(t,D.poseG(t));
    for(const t of [T.vuelca,T.cae,T.paf,T.paf+.35,T.paf+.9]){
     const a=tiene(t-eps),b=tiene(t+eps);sack=Math.max(sack,dist(a,b),dist(D.bocaSaco(a),D.bocaSaco(b)),Math.abs(arc(a.a,b.a)));
    }
    const hit=dist(D.bocaSaco(tiene(T.paf)),D.impactoHarina()),ground=dist(tiene(T.paf+.91),tiene(D.DUR));
    const inRight=D.poseG(T.entra0).x,edge=D.camara(T.entra0).x+512/D.camara(T.entra0).k,passing=[T.giro0,T.choque].map(t=>D.poseG(t).x-D.poseM(t).x);
    if(Math.max(limbs,pan,spoon,sack,toque,hit,ground)>.025||wheel<6.25||wheel>6.30||inRight<edge||passing[0]<=0||passing[1]>=0)throw Error(JSON.stringify({limbs,pan,spoon,sack,toque,hit,ground,wheel,inRight,edge,passing}));
    return {spinAndStepJoinsPx:limbs,panHookAndGrabPx:pan,armWheelDegrees:wheel*180/Math.PI,spoonGripTransferPx:spoon,spoonRimPx:toque,sackJoinsPx:sack,flourImpactPx:hit,emptySackFloorDriftPx:ground,passingRelativeX:passing};
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
  console.log(JSON.stringify({scene: "00100.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
