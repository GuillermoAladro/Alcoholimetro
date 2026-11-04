const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00089.2 Guillermo y Kiriku - el descapotable.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00089_2;
    const { T }=D, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const at=(m, x,y)=>({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f});
    const joins=[T.saca0,T.suelta,T.pone1].map(t=>{
      const a=D.poseG(t-1e-8)._casco.A,b=D.poseG(t+1e-8)._casco.A;
      return Math.max(...[[806,262],[520,620],[1080,630]].map(([x,y])=>dist(at(a,x,y),at(b,x,y))));
    });
    let steering=0, wrist=-Infinity, turn=0, lastAngle=null;
    for(let i=0;i<=Math.round(D.DUR*120);i++){
      const t=i/120, p=D.pose(t), k=p.k, h=Kiriku.aPantalla(k,k.manoLejos), d=D.diag(t);
      steering=Math.max(steering,dist(h,D.AGARRE_VOL));
      for(const [key,max] of Object.entries(d.max))wrist=Math.max(wrist,d[key]-max);
      if(t>=T.suelta && t<=T.pone1) {
        const a=p.g._casco.A, angle=Math.atan2(a.b,a.a);
        if(lastAngle!==null)turn+=Math.atan2(Math.sin(angle-lastAngle),Math.cos(angle-lastAngle));
        lastAngle=angle;
      }
    }
    const p0=D.poseG(T.pinza1),p1=D.poseG(T.tira);
    const fromTeeth=dist(D.ptMano(Guillermo,p0,p0.manoLejos,D.PINZA),D.retrato(Guillermo,p0,D.BICHO_DIENTES));
    const release=dist(D.ptMano(Guillermo,p1,p1.manoLejos,D.PINZA),D.bichoLanzado(T.tira));
    const direction=turn/(2*Math.PI);
    if(!Guillermo.listo()||!Kiriku.listo()||Math.max(...joins,steering,fromTeeth,release)>.05||wrist>0||direction>-.8||direction<-1.2)throw Error(JSON.stringify({joins,steering,fromTeeth,release,wrist,direction}));
    return {posesAt120Hz:Math.round(D.DUR*120)+1,helmetJoinsPx:joins,helmetTurns:direction,wristOverLimit:wrist,maximumWheelGripErrorPx:steering,teethToFingertipsPx:fromTeeth,bugReleasePx:release};
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
  console.log(JSON.stringify({scene: "00089.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
