const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00107.2 Guillermo y Paradigma - el reflejo.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00107_2;
    const {T}=D, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), hand=(r,p,n)=>r.aPantalla(p,p[n]);
    let mirror=0, final=0, palm=0, grip=0, wrist=-Infinity, join=0;
    const soleY={fall:{cerca:0,lejos:0},back:{cerca:0,lejos:0}};
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const t=i/120,{p,g}=D.pose(t);
      if(t<=T.pillo||t>=T.final1){
        const v=Math.max(Math.abs(p.x+g.x-2*D.CX),Math.abs(p.cabeza.ang-g.cabeza.ang),Math.abs(p.torso-g.torso),Math.abs(p.cara.ojos.d-g.cara.ojos.d),Math.abs(p.cara.ojos.i-g.cara.ojos.i),Math.abs(p.cara.cejas.d.sube-g.cara.cejas.d.sube));
        if(t<=T.pillo)mirror=Math.max(mirror,v);else final=Math.max(final,v,g.sudor);
      }
      if(t>=T.palma1&&t<=T.dedos1)palm=Math.max(palm,dist(hand(Paradigma,p,'manoLejos'),{x:D.CX-7.8,y:205}),dist(hand(Guillermo,g,'manoLejos'),{x:D.CX+7.8,y:205}));
      if(t>=T.agarra&&t<=T.apreton1){const h=D.agarre(t);grip=Math.max(grip,dist(hand(Paradigma,p,'manoLejos'),{x:h.x-7,y:h.y+1}),dist(hand(Guillermo,g,'manoLejos'),{x:h.x+7,y:h.y-1}));}
      for(const [r,v] of [[Guillermo,g],[Paradigma,p]])for(const [n,h,l] of [['Cerca',r.HOMBRO_C,r.BRAZO_C_L],['Lejos',r.HOMBRO,r.BRAZO_L]]){
        const m=v['mano'+n],sh=r.tronco(v)(h),rr=r.MUNECA_R*r.JK,w={x:m.x+rr*Math.cos(m.mu),y:m.y+rr*Math.sin(m.mu)};
        wrist=Math.max(wrist,(dist(w,sh)-1.08*l)*v.s*r.K);
      }
      const way=t>=T.saltos1&&t<=T.cruza1?'fall':t>=T.vuelta0&&t<=T.vuelta1?'back':null;
      if(way){const axis=Guillermo.aPantalla(g,g.pelvis).x;
        for(const side of ['cerca','lejos']){const foot=Guillermo.aPantalla(g,g.piernas[side].tob),x=axis+(foot.x-axis)*g.giro;
          if(Math.abs(x-D.CX)<9)soleY[way][side]=Math.max(soleY[way][side],foot.y+Guillermo.TOBILLO_ALTO*g.s);}}
    }
    const events=[3.175,4.025,5.2,6.055,6.755,7.11,7.46,7.805,8,8.16,8.36,8.83,9.4,9.55,9.9,10,10.242,12.225];
    for(const t of events)for(const [r,a] of [[Guillermo,'g'],[Paradigma,'p']])for(const n of ['manoCerca','manoLejos']){
      join=Math.max(join,dist(hand(r,D.pose(t-5e-8)[a],n),hand(r,D.pose(t+5e-8)[a],n)));
    }
    const hops=Array.from({length:3},(_,i)=>D.subeG(T.saltos0+(i+.5)*(T.saltos1-T.saltos0)/3));
    const fallX=D.poseG(T.cruza1).x, wink=D.pose(T.guino0+.1), frameRest=D.giroMarco(T.cruza1),frameHit=D.giroMarco(T.cruza1+.08);
    if(Math.max(mirror,final,palm,grip,join)>.01||wrist>=0||!Object.values(soleY).every(pair=>Object.values(pair).every(y=>y>0&&y<488))||hops.some(y=>Math.abs(y-34)>.01)||fallX>=D.MARCO.BL.x||D.retraso(3)!==0||D.retraso(T.m7)<.2||D.pesoOops(8.05)<.99||frameRest!==0||Math.abs(frameHit)<.01||wink.p.cara.ojos.d<.99||wink.g.cara.ojos.d<.99)throw Error(JSON.stringify({mirror,final,palm,grip,join,wrist,soleY,hops,fallX,frameRest,frameHit}));
    return {earlyMirrorError:mirror,finalMirrorError:final,palmPositionPx:palm,handshakePositionPx:grip,wristExcessPx:wrist,elbowJoinPx:join,lowestSoleYAtFrame:soleY,threeHopHeights:hops,landingX:fallX,openingDelay:D.retraso(3),fastDelay:D.retraso(T.m7),frameBeforeImpact:frameRest,frameAfterImpact:frameHit,wink:[wink.p.cara.ojos.d,wink.g.cara.ojos.d]};
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
  console.log(JSON.stringify({scene: "00107.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
