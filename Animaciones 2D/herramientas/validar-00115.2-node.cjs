const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00115.2 Guillermo y Rodri - el pino.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00115_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const pts=(n,t)=>{const Q=D.poses(t)[n],p=Q.p,w=v=>D.hojaAMundo(Q.R,p,Q.M,v);return [Q.M.W,D.caraMundo(Q,n),w(p.piernas.cerca.tob),w(p.piernas.lejos.tob),w(p.manoCerca),w(p.manoLejos)];};
    const cambios=['rLun0','rBaja0','rBaja1','rArriba1','g1Lun0','g1Pies','g1Arriba','g2Lun0','gVuelca','gBarra'];
    const saltos=cambios.map(k=>{const a=pts(k[0],T[k]-1e-7),b=pts(k[0],T[k]+1e-7);return Math.max(...a.map((p,i)=>dist(p,b[i])));});
    const yema=(Q,l)=>D.yemaApoyo(Q.R,Q.p,Q.M,l==='cerca'?Q.p.manoCerca:Q.p.manoLejos);
    let apoyo=0, altura=0, una=0, dedos=0, alcance=0;
    for(let i=0;i<=Math.round(D.DUR*120);i++){const t=i/120, Q=D.poses(t);
      if(t>=2&&t<=6.15)apoyo=Math.max(apoyo,Math.abs(yema(Q.r,'lejos').y-D.FL.r));
      if(t>=3.55&&t<=4.05)una=Math.max(una,D.FL.r-yema(Q.r,'cerca').y);
      if(t>=7.3&&t<=8.95){const h=['lejos','cerca'].map(l=>D.FL.g-yema(Q.g,l).y);
        apoyo=Math.max(apoyo,Math.min(...h.map(Math.abs)));
        altura=Math.max(altura,...h.map((v,j)=>Math.abs(v-D.manoPaseo(j?D.G_MANOS.ln:D.G_MANOS.lf,t).h)));}
      alcance=Math.max(alcance,...Object.values(D.diag(t)));}
    const pasos=D.pasosManos();for(const paso of pasos){const q=yema(D.poses(paso.t).g,paso.lado);
      dedos=Math.max(dedos,Math.abs(paso.x-q.x),Math.abs(q.y-D.FL.g));}
    function bordeMano(Q,l){
      const c=document.createElement('canvas');c.width=70;c.height=72;const g=c.getContext('2d'),p=Q.p,m=l==='cerca'?p.manoCerca:p.manoLejos,fl=D.FL[Q.R===Guillermo?'g':'r'];
      const h=D.hojaAMundo(Q.R,p,Q.M,m),ex=D.hojaAMundo(Q.R,p,Q.M,{x:m.x+1,y:m.y}),ey=D.hojaAMundo(Q.R,p,Q.M,{x:m.x,y:m.y+1});
      g.setTransform(ex.x-h.x,ex.y-h.y,ey.x-h.x,ey.y-h.y,35,h.y-fl+54);
      g.rotate(m.ang||0);g.scale(Q.R.JK,Q.R.JK);Personaje2D.mano(g,m,{piel:'#deb897',sombra:'#876957',tinta:'#241a19'});
      const px=g.getImageData(0,0,70,72).data;let y=-1;
      for(let i=3;i<px.length;i+=4)if(px[i]>=100)y=Math.floor((i>>2)/70);
      return y+.5-54;
    }
    const tinta=[[3.82,'r','lejos'],[8.20,'g','cerca'],[8.54,'g','lejos']].map(([t,n,l])=>bordeMano(D.poses(t)[n],l));
    const tk=D.primerToqueCana(),pre=D.zapatoToca(tk-.001),post=D.zapatoToca(tk+.001),estable=D.cerveza(tk-.002);
    let inclina=0,sube=0,tablero=0,superficie=0,muestras=0,anterior=D.LLENO,primerDerrame=null,llegada=null;
    for(let i=0;i<=181;i++){const t=tk+i/360,b=D.cerveza(t);sube=Math.max(sube,b.volumen-anterior);anterior=b.volumen;
      if(b.volumen<D.LLENO-.02&&primerDerrame===null)primerDerrame=t;
      if(llegada===null&&D.tramoChorro(t,.09))llegada=t;
      for(const p of D.VASO)tablero=Math.max(tablero,D.puntoVaso(p,b.a).y-D.CANA.y);
      const nivel=b.liquido.filter(q=>Math.abs(q.x*b.n.x+q.y*b.n.y-b.nivel)<.005);
      if(nivel.length>=2){const yy=nivel.map(q=>D.puntoVaso(q,b.a).y);superficie=Math.max(superficie,Math.max(...yy)-Math.min(...yy));muestras++;}
      inclina=Math.max(inclina,b.a);}
    const reposo=D.cerveza(tk+1), seco=D.tramoChorro(tk+.6,.05)===null;
    if(Math.max(...saltos,apoyo,altura,dedos)>.012||una<130||pasos.length!==10||pasos.some((p,i)=>p.lado!==(i%2?'cerca':'lejos'))||tinta.some(d=>Math.abs(d)>1.6)||alcance>1.052)throw Error('Pino y apoyos '+JSON.stringify({saltos,apoyo,altura,una,dedos,tinta,alcance}));
    if(!(tk>T.gVuelca&&tk<T.gBarra)||pre||!post||estable.a!==0||Math.abs(estable.volumen-D.LLENO)>.01||inclina<1.5||tablero>.01||superficie>.03||muestras<25||sube>.02||reposo.volumen>.01||!seco||llegada-primerDerrame<.08||llegada-primerDerrame>.10)throw Error('Impacto y caña '+JSON.stringify({tk,pre,post,inclina,tablero,superficie,muestras,sube,vol:reposo.volumen,llegada,primerDerrame}));
    return {maxPoseJoinPx:Math.max(...saltos),poseJoinsPx:saltos,handSupportErrorPx:apoyo,swingHeightErrorPx:altura,saluteClearancePx:una,dustContactErrorPx:dedos,stepHands:pasos.map(p=>p.lado),paintedFloorOffsetsPx:tinta,shoeGlassTime:tk,glassOverlapBefore:pre,glassOverlapAfter:post,counterPenetrationPx:tablero,fluidLevelErrorPx:superficie,levelSamples:muestras,maxLiquidRegain:sube,lastVolume:reposo.volumen,streamFlightSeconds:llegada-primerDerrame,maxJointRatio:alcance};
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
  console.log(JSON.stringify({scene: "00115.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
