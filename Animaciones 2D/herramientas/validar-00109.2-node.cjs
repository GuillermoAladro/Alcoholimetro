const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00109.2 Guillermo y Paradigma - el globo de agua.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00109_2;
    D.ajusta();
    const {T}=D,eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const objeto=(t,grande)=>{const {g,p}=D.pose(t),s=grande?D.globo2(t,g,p):D.globo1(t,g);return s.c||(grande?D.globo2Cubo():D.globo1Cubo());};
    let links=0,wall=0,knot=0,palm=0,crown=0,sip=0,ratio=0,margin=Infinity;
    for(const [big,times] of [[false,[T.saca0,T.pasa0+.04,T.pasa1,T.lanza,T.choca]],[true,[T.coge,T.saca2-.1,T.abraza,T.suelta,T.caza,T.pone0-.3,T.suelta2]]]){
      for(const t of times)links=Math.max(links,dist(objeto(t-eps,big),objeto(t+eps,big)));
    }
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const t=i/120,{g,p}=D.pose(t),a=D.globo1(t,g),b=D.globo2(t,g,p);
      ratio=Math.max(ratio,...Object.values(D.diag(t)));
      if(a.capa==='aplasta')wall=Math.max(wall,Math.abs(a.c.x+1.06*D.R1*(1-.55*a.k)-D.IMPACTO.x));
      if(b.capa==='cuelga'){const l=1.24*D.R2*(1+b.estira)*(1-D.jiggle2(t));
        knot=Math.max(knot,dist({x:b.c.x+l*Math.cos(b.ang),y:b.c.y+l*Math.sin(b.ang)},D.manoPant(Guillermo,g,g.manoLejos).c));}
      if(b.capa==='aire'){const cam=D.camara(t),r=1.24*D.R2*(1+b.estira)+2;
        margin=Math.min(margin,300+(b.c.y-cam.f.y-r)*cam.k);}
      if(b.capa==='palma'){const h=D.manoPant(Paradigma,p,p.manoLejos).c,r=1.06*D.R2*.92*(1-D.jiggle2(t)),ang=D.giroEnPalma(t);
        palm=Math.max(palm,dist({x:b.c.x-r*Math.sin(ang),y:b.c.y+r*Math.cos(ang)},{x:h.x+4*(p.espejo?-1:1)*p.sx,y:h.y}));}
      if(b.capa==='cabeza'){const f=D.formaCabeza(t);crown=Math.max(crown,dist({x:b.c.x,y:b.c.y+1.06*D.R2*f.sy*(1-f.j)},D.coronaG(g)));}
      if(D.sorbo(t)>.99999){const c=D.manoPant(Paradigma,p,p.manoCerca).c;sip=Math.max(sip,dist(D.puntaPajita(c,p),D.aPant(Paradigma,p,Paradigma.boca(p))));}
    }
    const waterStart=dist(D.vueltaAgua(0),D.IMPACTO),waterEnd=dist(D.vueltaAgua(1),D.coronaG(D.poseG(T.moja))),caught=D.poseP(T.caza).cara.ojos;
    const dry=D.poseG(T.moja-eps).moja,wet=D.poseG(T.moja+.2).moja;
const side=86, newLayer=()=>{const c=document.createElement('canvas');c.width=side;c.height=side;return c.getContext('2d');};
    const player=newLayer(),ball=newLayer();let clearance=Infinity,overlap=0;
    for(let fi=0;fi<=18;fi++){
      const t=3.60+fi*.004,{p,g}=D.pose(t),s=D.globo1(t,g),x=Math.floor(s.c.x)-side/2,y=Math.floor(s.c.y)-side/2;
      for(const ctx of [player,ball]){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,side,side);ctx.translate(-x,-y);}
      D.dibuja(Paradigma,player,p,t);D.pintaGlobo1(ball,s,t);
      const a=player.getImageData(0,0,side,side).data,b=ball.getImageData(0,0,side,side).data,edgeA=[],edgeB=[];
      for(let iy=1;iy<side-1;iy++)for(let ix=1;ix<side-1;ix++){
        const j=(iy*side+ix)*4+3,da=a[j]>130,db=b[j]>130;
        if(da&&db)overlap++;
        if(da&&(a[j-4]<130||a[j+4]<130||a[j-side*4]<130||a[j+side*4]<130))edgeA.push([ix,iy]);
        if(db&&(b[j-4]<130||b[j+4]<130||b[j-side*4]<130||b[j+side*4]<130))edgeB.push([ix,iy]);
      }
      for(const [ax,ay] of edgeA)for(const [bx,by] of edgeB)clearance=Math.min(clearance,Math.hypot(ax-bx,ay-by));
    }
    if(overlap||clearance<2||clearance>16)throw Error(JSON.stringify({overlap,clearance}));
    if(Math.max(links,wall,knot,palm,crown,sip,waterStart,waterEnd)>.03||margin<12||ratio>1.08||dry!==0||wet<.99||Math.min(caught.d,caught.i)<.95)throw Error(JSON.stringify({links,wall,knot,palm,crown,sip,waterStart,waterEnd,margin,ratio,dry,wet,caught}));
    return {nearMissRenderedPx:clearance,overlappingPixels:overlap,handoffJoinsPx:links,wallSurfaceErrorPx:wall,knotInHandPx:knot,palmSupportPx:palm,scalpSupportPx:crown,strawToMouthPx:sip,waterStartPx:waterStart,waterEndPx:waterEnd,largeBallTopMarginPx:margin,closedEyesAtCatch:[caught.d,caught.i],wetBefore:dry,wetAfter:wet,maxWristRatio:ratio};
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
  console.log(JSON.stringify({scene: "00109.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
