const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00090.2 Guillermo y Kiriku - la foto de grupo.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00090_2;
    const {T}=D, distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), dt=1e-7;
    const pose=D.poseG(T.tropiezo), leg=pose.piernas.cerca, off=Guillermo.rotP(Guillermo.PUNTA,leg.ang);
    const toe=D.pantG(pose,{x:leg.tob.x+off.x,y:leg.tob.y+off.y});
    const trip=distance(toe,D.puntaK(T.tropiezo));
    const pivot=t=>{const p=D.poseG(t);return {x:p.o.x+p.gr.dx,y:p.o.y+p.gr.dy};};
    const start=distance(pivot(T.tropiezo-dt),pivot(T.tropiezo+dt));
    let gap=0,reach=-Infinity;
    for(let i=0;i<=Math.round(D.DUR*120);i++){
      const t=i/120,{g,k}=D.pose(t);
      for(const [R,p] of [[Guillermo,g],[Kiriku,k]])for(const [near,side] of [[true,'Cerca'],[false,'Lejos']]){
        const m=p['mano'+side], shoulder=R.tronco(p)(near?R.HOMBRO_C:R.HOMBRO), a=(m.mu??-1.75)+(m.ang||0),r=R.MUNECA_R*R.JK;
        const delta=Math.hypot(m.x+r*Math.cos(a)-shoulder.x,m.y+r*Math.sin(a)-shoulder.y)-(near?R.BRAZO_C_L:R.BRAZO_L)*1.08;
        reach=Math.max(reach,delta*p.s*R.K);
      }
      if(t>=T.clic-.045&&t<=T.clic+.035){
        const m=g.manoLejos, d=D.offMano(Guillermo,m,D.YEMA), q=D.pantG(g,{x:m.x+d.x,y:m.y+d.y});
        gap=Math.max(gap,distance(q,D.camPunto(t,D.bordeDisparador(t))));
      }
    }
    const c=document.createElement('canvas');c.width=1024;c.height=600;
    const ctx=c.getContext('2d'),poses=D.pose(T.foto),crop=D.recorte;
    let margin=Infinity;
    for(const [R,p] of [[Guillermo,poses.g],[Kiriku,poses.k]]){
      ctx.clearRect(0,0,c.width,c.height);
      D.dibuja(R,ctx,p,T.foto);
      const rgba=ctx.getImageData(0,0,c.width,c.height).data;
      let pixels=0;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(rgba[(y*c.width+x)*4+3]>12){
        pixels++;margin=Math.min(margin,x-crop.x,crop.x+crop.w-1-x,y-crop.y,crop.y+crop.h-1-y);
      }
      if(pixels<6000)throw Error('Avatar ausente de la foto');
    }
    if(!Guillermo.listo()||!Kiriku.listo()||Math.max(trip,start,gap)>.01||reach>0||margin<15||Math.abs(poses.g.gr.phi-Math.PI/2)>.2)throw Error(JSON.stringify({trip,start,gap,reach,margin}));
    return {posesAt120Hz:Math.round(D.DUR*120)+1,tripContactPx:trip,bodyTakeoffJumpPx:start,shutterContactPx:gap,maximumWristExcessPx:reach,photoSilhouetteMarginPx:margin};
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
  console.log(JSON.stringify({scene: "00090.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
