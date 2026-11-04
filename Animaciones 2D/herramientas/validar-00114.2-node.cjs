const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00114.2 Guillermo y Rodri - la broma del cubo.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00114_2;
    const {T}=D,eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),da=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
    const cortes=[T.coge1,T.eleva1,T.vuelca,T.cae], joins=cortes.map(t=>{const a=D.cuboEstado(t-eps),b=D.cuboEstado(t+eps);return Math.max(dist(a,b),da(a.ang,b.ang),Math.abs(a.sc-b.sc));});
    const states=[T.coge0,T.alza1,T.golpe+.08,T.vuelca+.03,T.cae+.01].map(t=>D.cuboEstado(t).tipo);
    let grip=0,underside=0,seat=0,door=0,knock=0,lift=0,reach=0,water=0,roots=0;
    for(let i=0;i<=Math.round(D.DUR*120);i++){
      const t=i/120,{g}=D.pose(t),c=D.cuboEstado(t);
      reach=Math.max(reach,...Object.values(D.diag(t)));
      if(t>=T.coge1&&t<=T.cambia0)grip=Math.max(grip,dist(D.manoPant(Guillermo,g.p,g.fx,g.p.manoLejos),D.puntoCubo(c,0,D.largoAsa(t))));
      if(t>=T.coge1&&t<=T.pieA0)seat=Math.max(seat,c.y-(D.CHY-D.SEAT-8));
      if(t>=T.cambia1&&t<=T.retira0)underside=Math.max(underside,dist(D.manoPant(Guillermo,g.p,g.fx,g.p.manoLejos),c.fondoW));
      if(c.tipo==='puerta'){const h=D.hoja(t);door=Math.max(door,dist(D.puntoCubo(c,-4,0),{x:h.xF+3,y:h.ftop}));}
      if(t>=T.toque&&t<=T.toque+.06)knock=Math.max(knock,dist(D.puntaIndice(Guillermo,g.p,g.fx,g.p.manoLejos),D.puntoToque(t)));
      if(t>=T.borde0+.2&&t<=T.fin)lift=Math.max(lift,dist(D.puntaIndice(Guillermo,g.p,g.fx,g.p.manoCerca),D.puntoBordeAtras(g.p,g.fx,t)));
    }
    for(const [who,rig,t] of [['g',Guillermo,(T.gira1a+T.gira1b)/2],['g',Guillermo,(T.gira2a+T.gira2b)/2],['g',Guillermo,(T.gira3a+T.gira3b)/2],['r',Rodri,(T.rGira0+T.rGira1)/2]]){
      const l=D.pose(t-eps)[who],r=D.pose(t+eps)[who];roots=Math.max(roots,Math.abs(l.p.x-r.p.x));}
    for(let i=0;i<7;i++){const t0=T.vuelca+.035+i*.017,cb=D.estadoCaida(t0),q=D.aguaVuelco(t0,i),a=D.aguaVuelco(T.cae-eps,i),b=D.aguaVuelco(T.cae+eps,i);
      if(D.aguaVuelco(t0-eps,i)!==null||!q||!a||!b)throw Error('El agua ha perdido el origen');water=Math.max(water,dist(q,D.puntoCubo(cb,D.CU.wT/2-2-i*2.4,-D.CU.H)),dist(a,b));}
    const puddle=D.primerContactoAgua()-T.cae;
    const blank=()=>{const c=document.createElement('canvas');c.width=1024;c.height=600;return c.getContext('2d');};
    const skull=blank(),oR=D.pose(T.gota).r;D.dibPersonaje(skull,Rodri,oR,T.gota,false);
    const hair=D.coronillaRodri(),touch=D.gotaRodri(T.gota),sx=Math.floor(hair.x),sy=Math.floor(hair.y);
    const alpha=(ctx,x,y)=>ctx.getImageData(x,y,1,1).data[3],edge=[alpha(skull,sx,sy-3),alpha(skull,sx,sy),alpha(skull,sx,sy+2)];
    const bucket=blank();bucket.translate(110,155);D.dibCubo(bucket,{vista:.35,agua:.85,asa:.9});
    const sample=bucket.getImageData(67,84,86,11).data;let blue=0;for(let i=0;i<sample.length;i+=4)if(sample[i+2]-sample[i]>45&&sample[i+1]-sample[i]>30&&sample[i+3]>130)blue++;
    const wet=blank(),t0=D.primerContactoAgua();D.charco(wet,t0-.001,D.pose(t0-.001).g);
    const dry=wet.getImageData(500,510,280,85).data.some(v=>v!==0);D.charco(wet,t0+.2,D.pose(t0+.2).g);
    const pooled=alpha(wet,628,562);
    if(dist(hair,touch)>.001||edge[0]>90||edge[2]<125||blue<25||dry||pooled<80)throw Error('Comprobación del agua '+JSON.stringify({hair,touch,edge,blue,dry,pooled}));
    if(states.join(' ' )!=='silla mano puerta cae cabeza'||Math.max(...joins,grip,underside,seat,door,knock,lift,roots,water)>.02||puddle<.2||puddle>.55||reach>1.08)throw Error(JSON.stringify({states,joins,grip,underside,seat,door,knock,lift,roots,water,puddle,reach}));
    return {crownPoint:hair,crownEdgeAlpha:edge,visibleWaterPixels:blue,puddleAlphaAfterContact:pooled,bucketStates:states,ownershipJoinsPx:joins,visibleHandleGripPx:grip,palmUnderBucketPx:underside,bucketBelowChairPx:seat,doorSupportPx:door,fingertipOnDoorPx:knock,fingertipOnRimPx:lift,turnRootJoinsPx:roots,waterSpawnJoinsPx:water,puddleDelaySeconds:puddle,maxWristRatio:reach};
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
  console.log(JSON.stringify({scene: "00114.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
