const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00120.2 Guillermo y Rodri - el brindis.js", "rodri");
  const original = await load("escenas/00120 Guillermo y Rodri - el brindis.js", "rodri");
  for (let f=0;f<original.e.dur*12;f++) original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00120_2;
    const {T}=D, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    let gap=Infinity, wrist=0, reach=0, coast=0, hairJoin=0, floorError=0;
    const gapAt=t=>{const g=D.poseG(t).miJarra,r=D.poseR(t).miJarra;
      const x=(j,p)=>j.x+j.lado*p.x*Math.cos(j.ang)-p.y*Math.sin(j.ang);
      return Math.min(...D.CUERPO.map(p=>x(r,p)))-Math.max(...D.CUERPO.map(p=>x(g,p)))-2*D.SEMITRAZO;};
    for(let i=0;i<=D.DUR*120;i++){const t=i/120, poses=D.pose(t);gap=Math.min(gap,gapAt(t));
      for(const [rig,p] of [[Guillermo,poses.g],[Rodri,poses.r]])wrist=Math.max(wrist,dist(rig.aPantalla(p,p.manoLejos),p.miJarra));
      reach=Math.max(reach,...Object.values(D.diag(t)));}
    const toques=[T.choca,T.tin,(T.tin+T.separa)/2,T.separa].map((t,i)=>{const g=D.bordeJarra(D.poseG(t).miJarra),r=D.bordeJarra(D.poseR(t).miJarra);return Math.max(dist(g,r),dist(g,i?D.C_TIN:D.C_POF));});
    for(const quien of ['g','r'])for(let j=0;j<4;j++){const b=D.sueltaPelo(quien,j),L=D.bolasVuelo(b,b.tv);
      hairJoin=Math.max(hairJoin,...L.map((q,i)=>Math.max(...q.map((x,k)=>Math.abs(x-b.bolas[i][k])))));
      if(!D.quedaPelo(b.tv-1e-6,D.VUELAN_PELO[j],quien==='g'?0:.1)||D.quedaPelo(b.tv,D.VUELAN_PELO[j],quien==='g'?0:.1))throw Error('Dos propietarios de un pegote');
      const t=b.tv+.23,a=D.bolasVuelo(b,t)[0],c=D.bolasVuelo(b,t+.1)[0];
      coast=Math.max(coast,Math.abs(c[0]-a[0]-.1*b.vx),Math.abs(c[1]-a[1]-.1*b.vy-560*(.33*.33-.23*.23)));
      for(const delta of [0,.002,.3]){const l=D.bolasVuelo(b,b.tv+b.dur+delta);floorError=Math.max(floorError,Math.abs(Math.max(...l.map(q=>q[1]+q[2]))-b.plano));}}
    const nose=D.salidaNariz(), landed=D.estadoNariz(T.gotaNariz+nose.dur+0.4), noseStart=D.estadoNariz(T.gotaNariz);
    const noseError=Math.max(dist({x:noseStart[0],y:noseStart[1]},nose),Math.abs(landed[1]+landed[2]-566));
    const phys={gap,toques,wrist,reach,coast,hairJoin,floorError,noseError,flight:nose.dur,rest:D.poseG(T.tin).miJarra.vol};
    const img=document.createElement("canvas");img.width=1024;img.height=600;const g=img.getContext("2d");
    const escena=BANCO.find(x=>x.id==="00120.2").crear();
    const puntos=t=>{escena.t=t;escena.dibujar(g);const mask=D.mascaraEspuma().getContext("2d"),cam=D.camara(t);
      const alpha=(rig,p,q)=>{const pos=rig.aPantalla(p,rig.cabeza(p).a(q));
        return mask.getImageData(Math.floor((512+(pos.x-cam.x)*cam.k)*D.RF),Math.floor((300+(pos.y-cam.y)*cam.k)*D.RF),1,1).data[3];};
      return [['g',Guillermo,D.poseG(t)],['r',Rodri,D.poseR(t)]].map(([quien,rig,p])=>
        [...D.OJOS[quien].map(o=>alpha(rig,p,o.c)),alpha(rig,p,D.BOCA[quien].c)]);};
    const antes=puntos(4.8),primero=puntos(5.18),despues=puntos(5.52),risa=puntos(6.82);
    const zona=(fun,t,x,y,r)=>{g.clearRect(0,0,1024,600);fun(g,t);const datos=g.getImageData(x-r,y-r,2*r,2*r).data;
      let s=0;for(let i=3;i<datos.length;i+=4)s+=datos[i]/255;return s;};
    const ambos=(g,t)=>{D.manchas(g,t);D.vuelan(g,t);};
    let mantiene=1;
    for(const v of D.VUELAN){const t=T.choca+.05+v.d;
      const a=zona(ambos,t-.00001,v.p.x,v.p.y,14),b=zona(ambos,t+.00001,v.p.x,v.p.y,14);
      mantiene=Math.min(mantiene,Math.min(a,b)/Math.max(a,b));}
    const seco=zona(D.charco,D.tocaSuelo-.001,470,576,23),mojado=zona(D.charco,D.tocaSuelo+.12,485,574,23);
    if(gap<-.001||Math.max(...toques,wrist,coast,hairJoin,floorError,noseError)>.001||reach>1.08||nose.dur<=.6||Math.abs(phys.rest-.13)>.001)throw Error(JSON.stringify(phys));
    if(antes.some(a=>Math.min(...a)<15)||Math.max(...primero[0].slice(0,2))>10||Math.min(...primero[1].slice(0,2))<15||despues.some(a=>Math.max(a[0],a[1])>10||a[2]<15)||risa.some(a=>a[2]>10)||mantiene<.85||seco!==0||mojado<3)throw Error(JSON.stringify({antes,primero,despues,risa,mantiene,seco,mojado}));
    return {phys,foamBefore:antes,firstBlink:primero,afterBlinks:despues,afterLaughter:risa,impactInkRatio:mantiene,puddleBefore:seco,puddleAfter:mojado};
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
  console.log(JSON.stringify({scene: "00120.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
