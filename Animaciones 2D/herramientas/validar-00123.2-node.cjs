const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00123.2 Guillermo y Sara - el maquillaje.js", "sara-saez");
  const original=await load("escenas/00123 Guillermo y Sara - el maquillaje.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++)original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00123_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);let error=[0,0,0,0,0],soporte=[0,0],ancla=0,alcance=0;
    const mundoPie=(r,p,l)=>{const q=r.aPantalla(p,p.piernas[l].tob);return {x:p.x+(q.x-p.x)*(p.sx??1),y:q.y};};
    for(let i=0;i<=D.DUR*120;i++){const t=i/120,p=D.poseS(t),g=D.poseG(t),tip=D.puntaLapiz(p),distinta=[p.manoCerca,p.manoLejos].filter(m=>!!m.objeto).length;
      if(distinta!==1)throw Error("el lápiz tiene más de un propietario");alcance=Math.max(alcance,...Object.values(D.diag(t)));
      for(const [i,r,actor,tabla,h] of [[0,Guillermo,g,D.PIES_G,20],[1,SaraSaez,p,D.PIES_S,12]]){
        const pasos=['cerca','lejos'].map(l=>{const w=D.pieDe(tabla[l],t,h),q=mundoPie(r,actor,l);
          ancla=Math.max(ancla,Math.abs(q.x-w.x),Math.abs(q.y-(actor.suelo-(r.TOBILLO_ALTO+(l==='lejos'?10:0))*actor.s*r.K-w.h)));return w.h;});
        soporte[i]=Math.max(soporte[i],Math.min(...pasos));}
      let objetivo,idx;
      if(t>=T.trazoS0&&t<=T.flick1){idx=0;objetivo=D.puntaRayaS(p,t);}
      if(t>=T.trazoG0&&t<=T.achisFin){idx=1;objetivo=D.puntaRayaG(t);}
      if(t>=T.arr1a&&t<=T.arr1b){idx=2;objetivo=D.cabG(D.puntoPasada(0,t),t);}
      if(t>=T.arr2a&&t<=T.arr2b){idx=3;objetivo=D.cabG(D.puntoPasada(1,t),t);}
      if(t>=T.arr3a&&t<=T.arr3b){idx=4;objetivo=D.cabG(D.puntaDifumina(t),t);}
      if(objetivo)error[idx]=Math.max(error[idx],dist(tip,objetivo));}
    const transfer=D.poseS(T.pasa),a=D.puntosLapiz(transfer,transfer.__l),b=D.puntosLapiz(transfer,transfer.__c);
    const pasa=[dist(a.punta,b.punta),dist(a.cola,b.cola),dist(a.pinza,b.pinza)];
    const antes=D.puntaLapiz(D.poseS(T.pasa-1e-6)),despues=D.puntaLapiz(D.poseS(T.pasa+1e-6));
    const central=(T.sGira0+T.sGira1)/2, z=D.poseS(central),pasoDoble=dist(antes,despues);
    const phys={error,soporte,ancla,alcance,pasa,pasoDoble,turnWidth:z.sx,mix:z.mezclaGiro};
    const canv=document.createElement('canvas');canv.width=1024;canv.height=600;const g=canv.getContext('2d');
    function foto(t,omite){g.clearRect(0,0,1024,600);const actor=omite,normal=actor?.dibujar;
      if(actor)actor.dibujar=()=>{};try{D.reflejos(g,t,D.poseG(t),D.poseS(t));}finally{if(actor)actor.dibujar=normal;}
      return g.getImageData(0,0,1024,600).data;}
    let fuera=0;const reflejados=[];
    for(const t of [1.65,10.85,12.45]){const completa=foto(t,null),lista=[];
      for(const r of [Guillermo,SaraSaez]){const sin=foto(t,r);let cuenta=0;
        for(let y=0;y<600;y++)for(let x=0;x<1024;x++){const i=(y*1024+x)*4;
          if(Math.abs(completa[i]-sin[i])+Math.abs(completa[i+1]-sin[i+1])+Math.abs(completa[i+2]-sin[i+2])<27)continue;
          if(x<29||x>166||y<91||y>353)fuera++;else cuenta++;}lista.push(cuenta);}
      reflejados.push(lista);}
    function manchas(t){g.clearRect(0,0,1024,600);g.save();g.translate(-500,-340);D.pintaPasadas(g,t);g.restore();
      return [[768,566,63,44],[893,617,47,38]].map(([x,y,rx,ry])=>{const datos=g.getImageData(x-500-rx,y-340-ry,rx*2,ry*2).data;
        let n=0;for(let j=3;j<datos.length;j+=4)if(datos[j]>80)n++;return n;});}
    const pigmento=[T.arr1a-.002,T.arr1a+.15,T.arr1b,T.arr2a+.12,T.arr2b].map(manchas);
    if(Math.max(...error,...soporte,ancla,pasa[0],pasa[1],pasoDoble)>.002||Math.abs(pasa[2]-7)>.01||alcance>1.08||z.sx<.4||Math.abs(z.mezclaGiro-.5)>.002||fuera>0||reflejados.some(a=>Math.min(...a)<140)||pigmento[0][0]||pigmento[0][1]||pigmento[1][0]<50||pigmento[1][1]>0||pigmento[2][0]<=pigmento[1][0]||pigmento[3][1]<20||pigmento[4][1]<=pigmento[3][1])throw Error(JSON.stringify({phys,reflejados,fuera,pigmento}));
    return {phys,reflectedAvatarPixels:reflejados,outsideMirror:fuera,eyeStrokePixels:pigmento};
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
  console.log(JSON.stringify({scene: "00123.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
