const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00113.2 Guillermo y Rodri - el eructo.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00113_2;
    const {T}=D,eps=1e-7, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), da=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
    const mouth=(r,p)=>r.aPantalla(p,r.boca(p)), corner=b=>{const q=D.esquinaCuadro(b.ang);return {x:q.x+b.x,y:q.y+b.y};};
    const tg=D.poseG(T.choca).botella,tr=D.poseR(T.choca).botella,toast=Math.max(dist(D.enBotella(tg,{x:3.3*D.ESC_B,y:D.PUNTA.y}),D.BRINDIS),dist(D.enBotella(tr,{x:-3.3*D.ESC_B,y:D.PUNTA.y}),D.BRINDIS));
    let wrist=0,sip=0,lift=0,launch=0,land=0,velocity=0,crate=Infinity,top=Infinity,ground=0,source=0,volume=0;
    for(let i=0;i<=D.DUR*120;i++){
      const t=i/120,{g,r}=D.pose(t);wrist=Math.max(wrist,...Object.values(D.diag(t)));
      if(t>=T.bebe0+.16&&t<=T.bebe1-.10){sip=Math.max(sip,dist(D.enBotella(g.botella,D.PUNTA),mouth(Guillermo,g)),dist(D.enBotella(r.botella,D.PUNTA),mouth(Rodri,r)));}
      for(const [j,b] of D.BT.entries()){
        if(t>=b.boca+.04&&t<=b.trago1)sip=Math.max(sip,dist(D.enBotella(g.botella,D.PUNTA),mouth(Guillermo,g)));
        const e=D.cascoSuelto(t,j);if(t>=b.coge&&t<b.suelta&&(!g.botella||e))throw Error('Propietario del botellín '+j);
        if(!e)continue;
        for(const pt of D.CONT){const q=D.enBotella(e,{x:pt.x*D.ESC_B,y:pt.y*D.ESC_B});
          if(t>=b.suelta+D.VUELO)crate=Math.min(crate,q.x-D.CAJA.x+D.CAJA.w/2,D.CAJA.x+D.CAJA.w/2-q.x);
          else{const cam=D.camara(t);top=Math.min(top,300+(q.y-cam.y)*cam.k);}
        }
      }
      const f=D.estadoCuadro(t);ground=Math.max(ground,corner(f).y-D.SUELO_CUADRO);
    }
    for(const [i,b] of D.BT.entries()){
      const h=D.poseG(b.coge).botella;lift=Math.max(lift,dist(h,D.EN_CUBO[i]),da(h.ang,D.EN_CUBO[i].ang));
      const p=D.poseG(b.suelta-eps).botella,q=D.cascoSuelto(b.suelta+eps,i),h1=D.cascoSuelto(b.suelta+1e-5,i),d=D.desdeLanza(i);
      launch=Math.max(launch,dist(p,q),da(p.ang,q.ang));velocity=Math.max(velocity,Math.abs((h1.x-d.x)/1e-5-d.vx),Math.abs((h1.y-d.y)/1e-5-d.vy),Math.abs((h1.ang-d.ang)/1e-5-d.va));
      const fin=b.suelta+D.VUELO,lo=D.cascoSuelto(fin-eps,i),hi=D.cascoSuelto(fin+eps,i);land=Math.max(land,dist(lo,hi),da(lo.ang,hi.ang));
    }
    const joins=[T.cuadroSalta,T.cuadroCae].map(t=>{const a=D.estadoCuadro(t-eps),b=D.estadoCuadro(t+eps);return Math.max(dist(a,b),da(a.ang,b.ang));});
    const hit=dist(corner(D.estadoCuadro(T.cuadroCae)),D.contactoCuadro()),settled=dist(corner(D.estadoCuadro(D.DUR)),D.contactoCuadro());
    const face=[D.poseR(4.84).cara.mirada.x,D.poseR(6.4).cara.boca.abre,D.poseR(T.golpe+.10).cara.boca.sonrisa,D.poseR(T.rMiraCuadro+.25).cara.mirada.x];
    const receptor=mouth(Rodri,D.poseR(T.golpe)),arrival=Math.abs(D.llegada('g',receptor.x,receptor.y)-T.golpe);
    for(const [w,rig,t0,n,dt] of [['r',Rodri,T.rEructo,5,.1],['g',Guillermo,T.gEructo,7,.09]]){
      for(let i=0;i<n;i++){const t=t0+i*dt,p=w==='g'?D.poseG(t):D.poseR(t),b=mouth(rig,p);source=Math.max(source,dist(D.origenOnda(w,t),{x:b.x+(w==='g'?6:-6),y:b.y}));}
    }
    for(const a of [-2.4,-1.2,0,.7,2.3])for(const v of [.1,.5,.86]){const n=D.rot({x:0,y:1},-a),h=D.nivel(n,v),shape=D.recorta(D.INT,n,h);volume=Math.max(volume,Math.abs(D.area(shape)/D.AREA_INT-v));const cuts=shape.filter(q=>q.sup).map(q=>D.rot(q,a));if(cuts.length!==2||Math.abs(cuts[0].y-cuts[1].y)>1e-8)throw Error('Superficie de la gaseosa');}
    const canvas=()=>{const c=document.createElement('canvas');c.width=1024;c.height=600;return c.getContext('2d');};
    const stored=canvas(),wood=canvas();D.dibCaja(stored,D.DUR,false);
    let necks=0;for(const b of D.EN_CAJA){const raw=stored.getImageData(Math.round(b.x)-7,Math.round(b.y)-39,15,30).data;let n=0;for(let k=3;k<raw.length;k+=4)if(raw[k]>65)n++;if(n>12)necks++;}
    D.dibCaja(stored,D.DUR,true);D.dibCaja(wood,D.DUR,true);
    const boxA=stored.getImageData(D.CAJA.x-36,D.CAJA.y+4,72,23).data,boxB=wood.getImageData(D.CAJA.x-36,D.CAJA.y+4,72,23).data;
    let frontDiff=0;for(let i=0;i<boxA.length;i++)if(boxB[i]!==boxA[i])frontDiff++;
    if(necks!==3||frontDiff!==0)throw Error('Oclusión de los botellines en la caja '+JSON.stringify({necks,frontDiff}));
    if(Math.max(toast,sip,lift,launch,land,...joins,ground,hit,settled,source)>.02||arrival>.006||velocity>.2||crate<2||top<6||wrist>1.08||volume>.0001||face[0]>=0||face[1]<18||face[2]>-.2||face[3]>=0)throw Error(JSON.stringify({toast,sip,lift,launch,land,joins,ground,hit,settled,source,arrival,velocity,crate,top,wrist,volume,face}));
    return {visibleNecks:necks,crateFrontPixelDifferences:frontDiff,toastContactPx:toast,fiveDrinksLipErrorPx:sip,bucketPickupsPx:lift,launchJoins:launch,launchSpeedError:velocity,crateLandingJoins:land,crateSideMarginPx:crate,flightTopMarginPx:top,pictureJoins:joins,picturePenetrationPx:ground,pictureImpactPx:hit,pictureRestPx:settled,emissionErrorPx:source,arrivalAtRodriSeconds:arrival,rodriActing:face,maxVolumeError:volume,maxWristRatio:wrist};
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
  console.log(JSON.stringify({scene: "00113.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
