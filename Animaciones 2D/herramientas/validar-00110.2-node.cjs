const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00110.2 Guillermo y Paradigma - la puesta de sol.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00110_2;
    const {T}=D, eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    let wrist=0,sip=0,point=0,sun=Infinity,perch=0,tilt=0,crumbs=0,join=0,jumpColor=0;
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const t=i/120,{p,g}=D.pose(t),e=D.palomaEn(t,g),bot=D.botellinP(t,p),h=D.ptMano(Paradigma,p,p.manoLejos,D.CENTRO);
      wrist=Math.max(wrist,...Object.values(D.diag(t)));
      if(t>=T.pSorbo1&&t<=T.pSorboFin)sip=Math.max(sip,dist({x:h.x+(60+bot.ag)*Math.cos(bot.ang),y:h.y+(60+bot.ag)*Math.sin(bot.ang)},D.bocaPa(p)));
      if(t>=T.pApunta1&&t<=T.pBaja0)point=Math.max(point,Math.abs((D.SOL_X-h.x)*Math.sin(bot.ang)-(D.solY(t)-h.y)*Math.cos(bot.ang)));
      if(e&&t<T.palPosa)sun=Math.min(sun,dist({x:e.x,y:e.y-25},{x:D.SOL_X,y:D.solY(t)}));
      if(e&&t>=T.palPosa&&(t<T.palGira0||t>T.palGira1))perch=Math.max(perch,dist(e,D.coronilla(g)));
      if(t>=T.ladeo1){const a=e.ang+Math.sign(e.dir)*e.cab;tilt=Math.max(tilt,Math.abs(a-p.cabeza.ang),Math.abs(a+g.cabeza.ang));}
      if(i>0)for(let z=0;z<3;z++){const a=D.colorSol(z,D.ocaso(t)),old=D.colorSol(z,D.ocaso(t-1/120));a.forEach((x,j)=>{jumpColor=Math.max(jumpColor,Math.abs(old[j]-x));});}
    }
    const pigeon=t=>D.palomaEn(t,D.poseG(t)),e=pigeon(T.palPosa-eps),f=pigeon(T.palPosa+eps);
    const landing=Math.max(dist(e,f),Math.abs(e.ang-f.ang),Math.abs(e.cab-f.cab),Math.abs(e.aleteo-f.aleteo));
    for(const [t,fn] of [[T.gSuelta1,D.patata1],[T.gSuelta2,D.patata2]])join=Math.max(join,dist(fn(t-eps,D.poseG(t-eps)),fn(t+eps,D.poseG(t+eps))));
    const caught=D.patata1(T.gBoca1-eps,D.poseG(T.gBoca1-eps)),first=dist(caught,D.bocaGs(D.poseG(T.gBoca1)));
    const stolen=D.patata2(T.roba-eps,D.poseG(T.roba-eps)),after=pigeon(T.roba+eps),second=dist(stolen,D.picoPantalla(after));
    const angle=after.ang+Math.atan2(Math.sin(after.cab+.25),after.dir*Math.cos(after.cab+.25)),chipAngle=Math.abs(Math.atan2(Math.sin(stolen.a-angle),Math.cos(stolen.a-angle)));
    for(const [i,m] of D.MIGAS.entries()){
      const t=m.t0+.32;crumbs=Math.max(crumbs,dist(D.puntoMiga(i,m.t0,D.poseG(m.t0)),D.picoPantalla(pigeon(m.t0))),dist(D.puntoMiga(i,t-eps,D.poseG(t-eps)),D.puntoMiga(i,t+eps,D.poseG(t+eps))));
      if(m.queda)crumbs=Math.max(crumbs,dist(D.puntoMiga(i,T.gSuspira-eps,D.poseG(T.gSuspira-eps)),D.puntoMiga(i,T.gSuspira+eps,D.poseG(T.gSuspira+eps))));
    }
    const render=()=>{const c=document.createElement('canvas');c.width=1024;c.height=600;return c.getContext('2d');};
    const all=render(), ref=render(), tEntry=4.87, bird=pigeon(tEntry);D.nueva().pintar(all,tEntry);D.paloma(ref,bird);
    const ar=all.getImageData(0,0,128,160).data, br=ref.getImageData(0,0,128,160).data;
    let ink=0,matching=0;
    for(let i=0;i<ar.length;i+=4)if(br[i+3]>230&&Math.max(br[i],br[i+1],br[i+2])<90){ink++;if(Math.max(ar[i],ar[i+1],ar[i+2])<112)matching++;}
    if(ink<30||matching/ink<.65)throw Error('Entrada de la paloma '+JSON.stringify({ink,matching}));
    if(Math.max(join,first,second,chipAngle,caught.k,crumbs,sip,point,landing,perch,tilt)>.02||sun>D.SOL_R*.5||jumpColor>1||wrist>1.08||!after.patata||pigeon(T.palTraga+eps).patata)throw Error(JSON.stringify({join,first,second,chipAngle,crumbs,sip,point,landing,perch,tilt,sun,jumpColor,wrist}));
    return {entryInkFraction:matching/ink,entryInkPixels:ink,chipThrowJoinsPx:join,chipToMouthPx:first,chipToBeakPx:second,chipAtBeakRad:chipAngle,crumbJoinsPx:crumbs,bottleToLipPx:sip,bottleToSunLinePx:point,sunPassPx:sun,pigeonLandingJoin:landing,perchErrorPx:perch,finalTiltErrorRad:tilt,maxSunColorChange:jumpColor,maxWristRatio:wrist};
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
  console.log(JSON.stringify({scene: "00110.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
