const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00119.2 Guillermo y Rodri - el chicle.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00119_2;
    const {T}=D,e=1e-6,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const vuelos=D.vuelosChicle(),boquillas=vuelos.map(v=>dist(D.estadoPaquete(D.poseR(v.sale),v.sale).boca,D.piezaEn(v,v.sale))),separa=dist(vuelos[0].origen,vuelos[1].origen);
    const labios=vuelos.map((v,i)=>{const p=i?D.poseG(v.caza):D.poseR(v.caza),R=i?Guillermo:Rodri,lab=R.aPantalla(p,R.cabeza(p).a(i?D.BOCA_G:D.BOCA_R));return Math.max(dist(v.destino,lab),dist(D.piezaEn(v,v.caza-e),lab));});
    let pies=0,aire=0,mordida=0,grip=0,alc=0;
    for(let i=0;i<=Math.round(D.DUR*120);i++){const t=i/120,{g,r}=D.pose(t),h=Math.max(0,D.despegue(t).sube);
      for(const lado of ['cerca','lejos']){const altura=D.SUELO-D.apoyoPunta(Guillermo,g,lado).y;pies=Math.max(pies,Math.abs(altura-h));aire=Math.max(aire,altura);}
      if(t>=T.pellizca&&t<=T.despega0){const pin=D.puntoPinza(r,r.manoLejos),obj=D.retratoAPant(g,D.CARETA_PUNTA);grip=Math.max(grip,dist(pin,obj));}
      alc=Math.max(alc,...Object.values(D.diag(t)));}
    const a=D.globoGrande(T.pop-e,D.poseG(T.pop-e)),b=D.globoGrande(T.pop+e,D.poseG(T.pop+e)),union=Math.max(dist(a.c,b.c),Math.abs(a.r-b.r),Math.abs(a.wob-b.wob),Math.abs(a.alfa-b.alfa));
    const post=D.globoGrande(T.pop+.17,D.poseG(T.pop+.17)),tiny=D.globitoEn(T.gGlobitoPop,D.poseG(T.gGlobitoPop)),nariz=Math.abs(dist(tiny.c,tiny.n)-tiny.r);
    const radios=[D.radioR(T.rSopla1),D.radioR(T.rSorbe1),D.globoAlEstallar().r,post.r,tiny.r];
    const tiempos=[T.despega1-.035,T.despega1-e,T.despega1+e,T.despega1+.035,T.despega1+.16];
    const areas=tiempos.map(t=>{const r=D.poseR(t),h=D.puntoPinza(r,r.manoLejos),c=document.createElement('canvas');c.width=260;c.height=235;const ctx=c.getContext('2d');ctx.translate(130-h.x,75-h.y);
      if(t<T.despega1+.13)D.solapa(ctx,t,h);D.caretaColgando(ctx,t,h);
      const v=ctx.getImageData(0,0,260,235).data;let n=0;for(let j=0;j<v.length;j+=4)if(v[j+3]>100&&v[j]>v[j+1]+18)n++;return n;});
    const zapatos=[T.gDespega-.04,T.gArriba+.15,T.cae1].map(t=>{const p=D.poseG(t),q=p.piernas.cerca,rig=Guillermo;
      const c=document.createElement('canvas');c.width=1024;c.height=600;const g=c.getContext('2d');
      g.translate(p.x,p.suelo);g.scale(p.s,p.s);g.translate(-rig.PELVIS.x,-rig.SUELO);g.translate(q.tob.x,q.tob.y);g.rotate(q.ang);Recortes.pieza(g,rig.A,'zapato',rig.A.datos.piezas.zapato.pivote);
      const data=g.getImageData(305,475,160,105).data;let ultima=-1;for(let i=3;i<data.length;i+=4)if(data[i]>=128)ultima=Math.floor((i>>2)/160);
      return Math.abs((ultima+475+.5)-(D.SUELO-D.despegue(t).sube));});
    if(Math.max(...boquillas,...labios,pies,grip,union,nariz)>.012||separa<2||alc>1.08||aire<24||radios[0]<40||radios[1]!==0||radios[2]<125||radios[3]!==0||radios[4]!==11||areas.some(n=>n<1000)||zapatos.some(x=>x>2.1)||vuelos.some(v=>D.piezaEn(v,v.sale-e)!==null||D.piezaEn(v,v.caza)!==null))throw Error('Prueba del chicle '+JSON.stringify({boquillas,labios,pies,grip,union,nariz,separa,alc,aire,radios,areas,zapatos}));
    return {peeledMaskPixels:areas,shoeRasterErrors:zapatos,packetSpawnErrorsPx:boquillas,separateSpawnPointsPx:separa,mouthCatchErrorsPx:labios,shoeHeightErrorPx:pies,maxLiftPx:aire,chinPinchErrorPx:grip,largeBubbleBurstJoinPx:union,smallBubbleTouchesNosePx:nariz,radii:radios,maxArmRatio:alc};
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
  console.log(JSON.stringify({scene: "00119.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
