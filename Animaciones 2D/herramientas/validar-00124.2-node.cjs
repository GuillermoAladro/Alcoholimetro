const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00124.2 Guillermo y Sara - la tormenta.js", "sara-saez");
  const original=await load("escenas/00124 Guillermo y Sara - la tormenta.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++)original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00124_2;
    const {T}=D,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-7;
    let latch=0,clothPin=0,shirt=0,back=0,thigh=0,chin=0,doble=0,reach=0;
    const truenos=[T.rayo1,T.rayo2,T.rayo3,T.rayo4].map(t=>Math.max(...Array.from({length:60},(_,i)=>D.destello(t+i/120))));
    for(let i=0;i<D.DUR*120;i++){
      const t=i/120,{s,g}=D.pose(t),hl=SaraSaez.aPantalla(s,s.manoLejos),hc=SaraSaez.aPantalla(s,s.manoCerca);
      if(t>=T.latch1&&t<=T.empuja1)latch=Math.max(latch,d(D.zonaMano(SaraSaez,s,s.manoLejos,D.PINZA),D.pestilloEn(t).toma));
      if(t>=T.coge&&t<=T.tira0+.16)clothPin=Math.max(clothPin,d(D.pinzaManta(g,g.manoLejos),D.manta(t,g).pts[22]));
      if(t>=T.atrapa){shirt=Math.max(shirt,d(D.pinzaManta(g,g.manoCerca),D.camiseta(s)));thigh=Math.max(thigh,d(hc,g.apoyoMuslos));
        if(t<=T.acaricia0||t>=T.acaricia1+.14)back=Math.max(back,d(hl,g.apoyoEspalda));
        if(t>=T.acaricia0+.22&&t<=T.acaricia1-.12){const m=s.manoLejos,dd=m.dedos.indice,dm=m.dedos.medio,aa=.17*(.4+.9*(dd+dm+1.1)/4),l=3.2+(14.5-3.2)*Math.pow(dd,.85);
          const yema={x:6.9+Math.sin(aa)*l,y:4.5+Math.cos(aa)*l},q=D.mundoHojaG(g,Guillermo.cabeza(g).a({x:804+12*Math.sin(t*17),y:847}));chin=Math.max(chin,d(D.zonaMano(SaraSaez,s,m,yema),q));}}
      for(const [r,p] of [[SaraSaez,s],[Guillermo,g]])for(const side of ['cerca','lejos']){const n=side==='cerca',m=n?p.manoCerca:p.manoLejos,h=r.tronco(p)(n?r.HOMBRO_C:r.HOMBRO),sz=r.MUNECA_R*r.JK;reach=Math.max(reach,d(h,{x:m.x+Math.cos(m.mu)*sz,y:m.y+Math.sin(m.mu)*sz})/(n?r.BRAZO_C_L:r.BRAZO_L));}
      for(const [a,b,n] of [[T.corre1,T.esconde,4],[T.corre2,T.llega2,5]])if(t>=a&&t<=b){const z=D.zancadas(t,a,b,0,100,n,0,0,17);doble=Math.max(doble,Math.min(z.wC.h,z.wL.h));}}
    const join=t=>{const L=D.manta(t-eps,D.poseG(t-eps)).pts,R=D.manta(t+eps,D.poseG(t+eps)).pts;return Math.max(...L.map((p,i)=>d(p,R[i])));};
    const joins=[T.coge,T.tira0,T.tira0+.16,T.tapa,T.despega,T.despega+.1,T.despega+.44,T.despega+.92].map(join);
    const hops=D.BRINCOS.map(([a,b])=>{const t=(a+b)/2;return D.manta(a,D.poseG(a)).pts[0].y-D.manta(t,D.poseG(t)).pts[0].y;});
    const pa=D.poseG(T.atrapa-eps),pb=D.poseG(T.atrapa+eps),catchJoin=Math.max(d(pa.marco.W,pb.marco.W),Math.abs(pa.marco.phi-pb.marco.phi));
    const hinges=[T.empuja1,T.empuja1+.12].map((t,i)=>Math.abs(D.angHoja(t-eps,i?-1:1)-D.angHoja(t+eps,i?-1:1)));
    const phys={latch,clothPin,shirt,back,thigh,chin,doble,reach,joins,hops,catchJoin,hinges,truenos};
    const cv=document.createElement("canvas");cv.width=1024;cv.height=600;const g=cv.getContext("2d"),m=D.manta(9.2,D.poseG(9.2));
    const crop=(ox,oy)=>{g.clearRect(0,0,1024,600);D.dibManta(g,9.2,{...m,ojos:0,pts:m.pts.map(q=>({x:q.x+ox,y:q.y+oy}))});
      return g.getImageData(250+ox,70+oy,330,480).data;};
    const F=crop(0,0),Q=crop(17,13);let iguales=0,cantidad=0;
    for(let i=0;i<F.length;i+=4){if(F[i+3]<240)continue;cantidad++;if(Math.max(...[0,1,2].map(k=>Math.abs(F[i+k]-Q[i+k])))<3)iguales++;}
    const colores=[T.atrapa+.24,T.acaricia0+.30,T.gCamara+.4].map(t=>{const p=D.pose(t).s,q=D.camiseta(p);g.clearRect(0,0,1024,600);SaraSaez.dibujar(g,p,t);
      const data=g.getImageData(Math.round(q.x)-2,Math.round(q.y)-2,5,5).data;let tejido=0;
      for(let i=0;i<data.length;i+=4)if(data[i+3]>180&&Math.max(data[i],data[i+1],data[i+2])<120)tejido++;return tejido;});
    if(Math.max(latch,clothPin,shirt,back,thigh,chin,doble,...joins,catchJoin,...hinges)>.015||reach>1.08||hops.some(h=>Math.abs(h-16)>.02)||!(truenos[0]<truenos[1]&&truenos[1]<truenos[2]&&truenos[3]<truenos[0])||cantidad<3000||iguales/cantidad<.98||Math.min(...colores)<7)throw Error(JSON.stringify({phys,cantidad,iguales,colores}));
    return {phys,plaidPixels:cantidad,plaidMovesWithCloth:iguales/cantidad,shirtPixels:colores};
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
  console.log(JSON.stringify({scene: "00124.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
