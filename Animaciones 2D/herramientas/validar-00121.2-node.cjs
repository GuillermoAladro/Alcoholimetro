const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00121.2 Guillermo y Sara - el tatuaje.js", "sara-saez");
  const original=await load("escenas/00121 Guillermo y Sara - el tatuaje.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++) original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00121_2;
    const {T}=D,eps=1e-6,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),ang=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
    let inkError=0,skin=0,transport=0,omega=0,headroom=Infinity,reach=0,grab=0,normalStep=1;
    const segment=(q,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,u=Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy)));return dist(q,{x:a.x+dx*u,y:a.y+dy*u});};
    const grabPoint=(rig,p,m)=>{const q=rig.aPantalla(p,m);return D.pinza({x:q.x,y:q.y,mu:Math.atan2(Math.sin(m.mu),Math.cos(m.mu)*(p.espejo?-1:1))});};
    let old=null;for(let i=0;i<=D.DUR*120;i++){
      const t=i/120,pg=D.poseG(t),ps=D.poseS(t),M=D.marco(pg);
      reach=Math.max(reach,...Object.values(D.diag(t)));
      if(t>=T.trazo1&&t<=T.trazo2Fin){const tip=D.extremo(ps.rotu),mark=D.puntaRotu(pg,t);
        transport=Math.max(transport,dist(tip,mark));
        if(t<=T.trazo1Fin||t>=T.trazo2){const k=t<=T.trazo1Fin?1-M2.suave(M2.fase(t,T.trazo1,T.trazo1Fin)):M2.suave(M2.fase(t,T.trazo2,T.trazo2Fin));
          const s=t<=T.trazo1Fin?(1+k)*Math.PI:k*Math.PI,point=M.en(D.curva(s));inkError=Math.max(inkError,dist(tip,point));}}
      if(t>=T.trazo1){const f=M.f;skin=Math.max(skin,dist(M.c,{x:f.a.x+f.u.x*f.L*.56+f.n.x*1.5,y:f.a.y+f.u.y*f.L*.56+f.n.y*1.5}));if(old)normalStep=Math.min(normalStep,old.x*f.n.x+old.y*f.n.y);old=f.n;}
      if(t>=T.bzz&&t<=T.desmayado){const m=ps.maquina,q={x:m.m.x+26*Math.cos(m.a),y:m.m.y+26*Math.sin(m.a)};headroom=Math.min(headroom,segment(q,M.f.a,M.f.b));}
      if(t>=T.tiron1-.05&&t<=T.mangaFin){const f=D.manga(pg,t);grab=Math.max(grab,dist(grabPoint(Guillermo,pg,pg.manoCerca),f.agarre));}}
    const handoffs=[D.tomaRotu,T.sDejadoR].map((t,i)=>{const q=D.poseS(t+(i?-eps:eps)).rotu,ref=D.rotuBandeja();return {body:dist(D.pinza(q.m),D.pinza(ref.m)),tip:dist(D.extremo(q),D.extremo(ref)),angle:ang(q.a,ref.a)};});
    const last=D.poseS(T.sDejada-eps).maquina,tray=D.maquinaBandeja();
    const machineJoin=dist(last.m,tray.m)+ang(last.a,tray.a);
    const release=D.estadoCapuchon(T.pop),touch=D.estadoCapuchon(T.pop+.55),near=D.estadoCapuchon(T.pop+.55-eps);
    const capStart=dist(release,D.extremo(D.poseS(T.pop).rotu,16.5)),capJoin=dist(near,touch),capTwist=ang(near.rot,touch.rot);
    const capFloor=Math.abs(touch.y+4.5*Math.sin(.3)+2.6*Math.cos(.3)+.5-D.CARRO.y);
    const z=(t)=>D.manga(D.poseG(t),t),sleeve=[z(T.tiron1-.05),z(T.tiron1+.08),z(T.tiron2+.08)].map(m=>m.largo);
    const mid=(T.trazo1Fin+T.trazo2)/2,pg=D.poseG(mid),M=D.marco(pg),a=M.en(D.curva(Math.PI)),b=M.en(D.curva(0)),lift=(a.y+b.y)/2-D.extremo(D.poseS(mid).rotu).y;
    const phys={inkError,skin,transport,headroom,reach,grab,normalStep,handoffs,machineJoin,capStart,capJoin,capTwist,capFloor,sleeve,lift};
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=600;const g=canvas.getContext('2d');
    const bytes=(t)=>{g.clearRect(0,0,1024,600);D.corazonDibujado(g,t,D.poseG(t));return g.getImageData(0,0,1024,600).data;};
    const area=(data)=>{let a=0;for(let i=3;i<data.length;i+=4)a+=data[i]/255;return a;};
    const tinta=[T.trazo1-.01,T.trazo1+.24,T.trazo1Fin,T.trazo2+.4,T.trazo2Fin+.01,T.latido+.15,T.latido+.5].map(t=>area(bytes(t)));
    const scene=BANCO.find(s=>s.id==='00121.2').crear();
    const renderSinTangencia=t=>{const pose=D.poseG(t),m=pose.manoLejos,draw=m.objeto;scene.t=t;scene.dibujar(g);
      const antes=g.getImageData(0,0,1024,600).data,M=D.marco(pose),cam=D.camara(t);
      const cx=Math.round(512+(M.c.x-cam.x)*cam.k),cy=Math.round(300+(M.c.y-cam.y)*cam.k);
      m.objeto=null;try{scene.dibujar(g);}finally{m.objeto=draw;}const despues=g.getImageData(0,0,1024,600).data;
      let n=0;for(let y=cy-16;y<=cy+16;y++)for(let x=cx-16;x<=cx+16;x++){const i=(1024*y+x)*4;
        if(Math.max(...[0,1,2].map(k=>Math.abs(antes[i+k]-despues[i+k])))>15)n++;}return n;};
    const visible=renderSinTangencia(13.1);
    if(Math.max(inkError,skin,transport,grab,machineJoin,capStart,capJoin,capTwist,capFloor,...handoffs.flatMap(q=>Object.values(q)))>.002||headroom<19||headroom>25||reach>1.08||normalStep<.98||lift<5.9||sleeve[0]-sleeve[1]<8||sleeve[1]-sleeve[2]<7)throw Error(JSON.stringify(phys));
    if(tinta[0]!==0||tinta[1]<5||tinta[2]<=tinta[1]||tinta[3]<=tinta[2]||tinta[4]<=tinta[3]||tinta[5]<tinta[6]*1.14||visible<12)throw Error(JSON.stringify({tinta,visible}));
    return {phys,inkPixels:tinta,visibleTattooPixels:visible};
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
  console.log(JSON.stringify({scene: "00121.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
