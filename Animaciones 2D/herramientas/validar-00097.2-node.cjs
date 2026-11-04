const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00097.2 Guillermo y Marta - el paraguas compartido.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00097_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-7;
    let joins=0,hands=0,grip=0,cheeks=0,splash=0;
    for(const t of [T.llega-.04,T.llega]){
     const a=D.pose(t-eps).g,b=D.pose(t+eps).g;
     for(const k of ["cerca","lejos"]){const x=a.piernas[k],y=b.piernas[k];
       joins=Math.max(joins,dist(Guillermo.aPantalla(a,x.tob),Guillermo.aPantalla(b,y.tob)),Math.abs(x.ang-y.ang));}
     for(const k of ["manoCerca","manoLejos"]) joins=Math.max(joins,dist(Guillermo.aPantalla(a,a[k]),Guillermo.aPantalla(b,b[k])));
    }
    for(let i=0;i<=Math.floor(D.DUR*120);i++){
     const t=i/120,{g,m}=D.pose(t),u=D.paraguas(t,m);
     grip=Math.max(grip,dist(u.base,Marta.aPantalla(m,m.manoCerca)));
     if(t>=T.manos1) hands=Math.max(hands,dist(Guillermo.aPantalla(g,g.manoLejos),Marta.aPantalla(m,m.manoLejos)));
     if(t>=T.mejilla&&t<T.voltea-.04) cheeks=Math.max(cheeks,dist(Guillermo.aPantalla(g,Guillermo.cabeza(g).a(D.MEJ_G)),Marta.aPantalla(m,Marta.cabeza(m).a(D.MEJ_M))));
    }
    for(const [i,{actor,clave,pelo,tiempo}] of D.SALPICADOS.entries()){
     const t=T.cae+tiempo,ini=D.pose(T.cae)[clave],fin=D.pose(t)[clave],a=D.gotaAlta(T.cae,i),b=D.gotaAlta(t,i),pie=actor.aPantalla(ini,ini.piernas.cerca.tob);
     if(D.gotaAlta(T.cae-eps,i)||D.gotaAlta(t+.161,i)||b.y>=a.y-200||D.gotaAlta(t-.022,i).y>=b.y)throw Error('Salpicadura fuera del salto');
     splash=Math.max(splash,dist(a,{x:pie.x,y:ini.suelo}),dist(b,actor.aPantalla(fin,actor.cabeza(fin).a(pelo))));
    }
    const sl=D.viento((T.viento0+T.voltea)/2),right=[0,500].map((o,k)=>Array.from({length:k?90:150},(_,i)=>D.xLluvia(i*7.13+o,540,sl)).filter(x=>x>900&&x<1024).length);
    if(joins>.02||hands>3||grip>.01||cheeks>2||splash>.01||right.some(n=>n<2))throw Error(JSON.stringify({joins,hands,grip,cheeks,splash,right}));
    return {brakeAndWristJoinPx:joins,joinedHandsPx:hands,umbrellaGripPx:grip,cheekGapPx:cheeks,waterReleaseAndHairContactPx:splash,hairImpactTimes:D.SALPICADOS.map(a=>T.cae+a.tiempo),rainInRightEdgeDuringGust:right};
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
  console.log(JSON.stringify({scene: "00097.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
