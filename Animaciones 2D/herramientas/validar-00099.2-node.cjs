const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00099.2 Guillermo y Marta - el muneco de nieve.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00099_2;
    const {T}=D,eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),diff=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
    let touch=0,poseJoin=0,prop=0,angles=0,claps=0,headroom=Infinity;
    const toe=t=>{const p=D.pose(t).g,l=p.piernas.lejos,v=Guillermo.PUNTA;return Guillermo.aPantalla(p,{x:l.tob.x+v.x*Math.cos(l.ang)-v.y*Math.sin(l.ang),y:l.tob.y+v.x*Math.sin(l.ang)+v.y*Math.cos(l.ang)});};
    for(const [t] of D.EMP)for(let i=0;i<=22;i++){
     const tt=t+.12+i*.01,b=D.bolaG(tt),p=toe(tt);
     touch=Math.max(touch,Math.abs(Math.hypot(p.x-b.cx,p.y-b.cy)-b.r));
    }
    const b=D.bolaG(T.patada),p=toe(T.patada);touch=Math.max(touch,Math.abs(Math.hypot(p.x-b.cx,p.y-b.cy)-b.r));
    for(const t of [T.rasca0,...D.EMP.map(p=>p[0]),T.arma0,T.persigue0,T.persigue1,T.congela,T.vuelta3_0,T.traga]){
     const a=D.pose(t-eps).g,b=D.pose(t+eps).g;
     for(const k of ['manoCerca','manoLejos'])poseJoin=Math.max(poseJoin,dist(Guillermo.aPantalla(a,a[k]),Guillermo.aPantalla(b,b[k])));
     for(const k of ['cerca','lejos'])poseJoin=Math.max(poseJoin,dist(Guillermo.aPantalla(a,a.piernas[k].tob),Guillermo.aPantalla(b,b.piernas[k].tob)));
    }
    const obj=[D.objetoG(T.zanLlega,true),D.objetoG(T.gorLlega,false),D.copaMu(T.gorAterriza)];
    const sources=[D.salidas().z,D.salidas().g,D.objetoG(T.achis,false)],periods=[[T.lanzaZ,T.zanLlega],[T.lanzaG,T.gorLlega],[T.achis,T.gorAterriza]];
    for(let i=0;i<3;i++){const [a,b]=periods[i],start=D.objetoEnVuelo(a,i),end=D.objetoEnVuelo(b,i);
     prop=Math.max(prop,dist(start,sources[i]),dist(end,obj[i]));angles=Math.max(angles,diff(end.ang,obj[i].ang??(-.08+D.balanceoMuneco(b))));
     if(D.objetoEnVuelo(a-eps,i)||D.objetoEnVuelo(b+eps,i))throw Error('Vuelo fuera de turno');
     if(i===2)for(let j=0;j<=100;j++){const tt=a+(b-a)*j/100,q=D.objetoEnVuelo(tt,i),cam=D.camara(tt);headroom=Math.min(headroom,300+(q.y-q.l*.88-cam.y)*cam.k);}
    }
    for(const t of [T.gorPon,T.gorQ]){const m=D.pose(t).m,h=Marta.aPantalla(m,m.manoLejos);
     prop=Math.max(prop,dist({x:h.x+2,y:h.y+12},D.copaMu(t)));}
    for(let i=1;i<=2;i++){const m=D.pose(T.aplaude0+i*Math.PI/24).m;
     claps=Math.max(claps,dist(Marta.aPantalla(m,m.manoCerca),Marta.aPantalla(m,m.manoLejos)));}
    const head=dist(D.cabezaSuelta(T.cabPon-eps),D.MU.cab);
    if(Math.max(touch,poseJoin,prop,angles,head,claps)>.025||headroom<4)throw Error(JSON.stringify({touch,poseJoin,prop,angles,head,claps,headroom}));
    return {contacts:'4 empujones y 1 patada',toeGapPx:touch,chaseAndCaptureJoinPx:poseJoin,carrotAndHatTransferPx:prop,landingAngleRad:angles,clapGapPx:claps,snowmanHeadPlacementPx:head,hatHeadroomPx:headroom};
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
  console.log(JSON.stringify({scene: "00099.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
