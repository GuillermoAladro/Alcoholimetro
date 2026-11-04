const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00125.2 Guillermo y Sara - el pulso de miradas.js", "sara-saez");
  const original=await load("escenas/00125 Guillermo y Sara - el pulso de miradas.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++)original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00125_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    let tableG=0,tableS=0,seatError=0,premature=0,reach=0,twitches=0,prior=0,stepOverlap=0;
    for(let i=0;i<D.DUR*120;i++){
      const t=i/120,{g,s}=D.pose(t),c=D.formaCojin(t),b=D.apoyoPantalon(g);
      if(t>=T.inclinado&&t<=T.rinde)tableG=Math.max(tableG,dist(D.contactoMesa(Guillermo,g,g.manoLejos),D.TOQUE_G));
      if(t<T.risa)tableS=Math.max(tableS,dist(D.contactoMesa(SaraSaez,s,s.manoLejos),D.TOQUE_S));
      if(t<T.plof)premature=Math.max(premature,c.a);
      else seatError=Math.max(seatError,Math.abs(D.alturaCojin(c,b.x)-b.y));
      if(t>=T.sienta&&t<T.plof){const legs=Object.values(g.piernas).map(q=>Guillermo.SUELO-Guillermo.TOBILLO_ALTO-q.tob.y);stepOverlap=Math.max(stepOverlap,Math.min(...legs));}
      reach=Math.max(reach,...Object.values(D.diag(t)));
      if(t>T.tic-.05&&t<T.tic+.35){const x=D.tic(t);if(x>.01&&prior<=.01)twitches++;prior=x;}}
    const claps=T.palmadas.map(t=>{const p=D.poseS(t),a=D.poseS(t-.12);return {contact:dist(D.contactoMesa(SaraSaez,p,p.manoLejos),D.TOQUE_S),
      lift:D.TOQUE_S.y-D.contactoMesa(SaraSaez,a,a.manoLejos).y};});
    const launch=dist(D.gotaPrincipal(T.gota),D.puntoBocaG(D.poseG(T.gota)));
    const catchError=dist(D.gotaPrincipal(T.gotaLlega),D.puntoMejillaS(D.poseS(T.gotaLlega)));
    const eps=1e-7,l=D.gotaPrincipal(T.gotaLlega-eps),r=D.gotaPrincipal(T.gotaLlega+eps),dropJoin=dist(l,r)+Math.abs(l.alpha-r.alpha)+Math.abs(l.r-r.r);
    const spray=Array.from({length:9},(_,n)=>{const t=T.pedo+.04+n*.055;return dist(D.saliva(t,n),D.puntoBocaG(D.poseG(t)));});
    const tears=Array.from({length:12},(_,n)=>{const t=T.risa+.05+n*.17,p=D.poseS(t),eye=n%2?{x:952,y:418}:{x:778,y:370};
      const a=D.lagrima(t,n),b=D.lagrima(t+.1,n),c=D.lagrima(t+.2,n);
      return Math.max(dist(a,SaraSaez.aPantalla(p,SaraSaez.cabeza(p).a(eye))),
        Math.abs(a.x-2*b.x+c.x),Math.abs(a.y-2*b.y+c.y-2.96));});
    const nozzle=Array.from({length:5},(_,i)=>{const t=T.plof+i*.06;return dist(D.aireCojin(t,i),D.formaCojin(t).punta);});
    const initialGap=(()=>{const t=T.plof-.02,b=D.apoyoPantalon(D.poseG(t));return D.alturaCojin(D.formaCojin(t),b.x)-b.y;})();
    const measures={tableG,tableS,seatError,premature,reach,twitches,stepOverlap,claps,launch,catchError,dropJoin,spray,tears,nozzle,initialGap};
    const cv=document.createElement("canvas");cv.width=1024;cv.height=600;const ctx=cv.getContext("2d");
    const ink=(rig,p,t,q)=>{ctx.clearRect(0,0,1024,600);rig.dibujar(ctx,p,t);
      const pix=ctx.getImageData(Math.round(q.x)-2,Math.round(q.y)-4,5,5).data;let n=0;
      for(let j=3;j<pix.length;j+=4)if(pix[j]>100)n++;return n;};
    const fingerInk=[ink(Guillermo,D.poseG(4),4,D.TOQUE_G),...T.palmadas.map(t=>ink(SaraSaez,D.poseS(t),t,D.TOQUE_S))];
    const t=T.plof+.04,p=D.poseG(t),trouserInk=ink(Guillermo,p,t,D.apoyoPantalon(p));
    const wink=D.poseG(T.guino+.16).cara.ojos;
    if(Math.min(...fingerInk,trouserInk)<7||wink.d<.99||wink.i>=.45)throw Error(JSON.stringify({fingerInk,trouserInk,wink}));
    if(Math.max(tableG,tableS,seatError,premature,stepOverlap,launch,catchError,dropJoin,...spray,...tears,...nozzle)>.002||reach>1.08||twitches!==1||initialGap<4||claps.some(q=>q.contact>.01||q.lift<29))throw Error(JSON.stringify(measures));
    return {measures,fingerInk,trouserInk,wink};
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
  console.log(JSON.stringify({scene: "00125.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
