const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00128.2 Guillermo y Sara - la pizza picante.js", "sara-saez");
  const original=await load("escenas/00128 Guillermo y Sara - la pizza picante.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++)original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00128_2;
    const {T}=D,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),G=Guillermo,S=SaraSaez;
    let bite=0,milk=0,push=0,grip=0,reach=0;
    const jaws=[[],[],[]], windows=[[T.gMuerde+.16,T.pausa-.1,'g'],[T.sMuerde1+.18,T.sMuerde1+1,'s'],[T.sMuerde2+.17,T.sMuerde2+.8,'s']];
    for(let i=0;i<=D.DUR*120;i++){
      const t=i/120,{g,s}=D.pose(t);
      for(const [a,b,r,p] of [[T.gMuerde,T.gAparta,G,g],[T.sMuerde1,T.sAparta1,S,s],[T.sMuerde2,T.sAparta2,S,s]])if(t>=a&&t<=b)
        bite=Math.max(bite,d(D.puntaP(p.porcion),r.aPantalla(p,r.boca(p))));
      if(t>=T.gCBoca&&t<=T.aplasta1+.04)milk=Math.max(milk,d(D.picoCarton(g.carton),G.aPantalla(g,G.boca(g))));
      if(t>=T.sCToca&&t<=T.sCSuelta)push=Math.max(push,d(D.yemaSara(s,s.manoLejos),D.ladoCarton(D.cartonMesa(t))));
      const b=D.boteT(t);
      if(b.quien!=='mesa'){const r=b.quien==='g'?G:S,p=b.quien==='g'?g:s;grip=Math.max(grip,d(b,r.aPantalla(p,p.manoLejos)));}
      for(const [j,[a,b,who]] of windows.entries())if(t>=a&&t<=b)jaws[j].push((who==='g'?g:s).cara.boca.abre);
      reach=Math.max(reach,...Object.values(D.diag(t)));
    }
    const movement=jaws.map(q=>Math.max(...q)-Math.min(...q));
    const eps=1e-7,l=D.gotaUnica(T.gota1-eps),r=D.gotaUnica(T.gota1+eps),a=D.gotaUnica(T.gotaCae),s0=D.poseG(T.gotaCae).porcion,
      dropJoin=d(l,r)+Math.abs(l.ry-r.ry)+Math.abs(l.rx-r.rx),mark=D.puntoPorcion(s0,D.GOTA_LOC);
    const salsa=D.GOTAS_S.map(gt=>{const t=gt.t+.12;return [D.salsaS(t+eps)-D.salsaS(t-eps),D.salsaS(t+.101)];});
    const after1=D.poseS(T.sAparta1).porcion.com,after2=D.poseS(T.sAparta2).porcion.com,eaten=D.poseG(T.gAparta).porcion.com;
    const nose=D.boquilla(D.boteT(T.gota1)),afterBite=D.perfilBocado(eaten).xc;
    const m={bite,milk,push,grip,reach,movement,dropJoin,landing:d(a,mark),fallDx:Math.abs(nose.x-mark.x),salsa,after1,after2,eaten,afterBite};
    const cv=document.createElement("canvas");cv.width=170;cv.height=170;const ctx=cv.getContext("2d"),
    center=q=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,170,170);ctx.setTransform(5,0,0,5,85-5*q.x,85-5*q.y);};
    const tinta=(s,n)=>{const o={...s,gota:n};center(D.puntoPorcion(o,D.GOTA_LOC));D.porcion(ctx,o,T.gotaCae);
      return ctx.getImageData(65,65,40,40).data;};
    const parche=s=>{const a=tinta(s,1),b=tinta(s,0);let n=0;for(let i=0;i<a.length;i+=4)if(Math.max(...[0,1,2,3].map(k=>Math.abs(a[i+k]-b[i+k])))>12)n++;return n;};
    const spicePixels=[parche(D.poseG(T.gotaCae+.07).porcion),parche(D.poseG(T.gBoca).porcion),parche(D.poseG(T.gAparta+.1).porcion)];
    const spoutPixels=[T.trago0,T.trago0+.29,T.trago1,T.aplasta1].map(t=>{const g=D.poseG(t),o=g.carton;center(G.aPantalla(g,G.boca(g)));D.carton(ctx,o);
      const b=ctx.getImageData(81,81,9,9).data;let n=0;for(let i=3;i<b.length;i+=4)if(b[i]>90)n++;return n;});
    const hops=D.SALTOS.map(t=>{const g=D.poseG(t+.14);return (G.SUELO-G.TOBILLO_ALTO-g.piernas.cerca.tob.y)*g.s;});
    const smoke=D.fuenteHumo(T.humo+.74,3,2),later=D.fuenteHumo(T.humo+.75,3,2);
    if(!smoke||!later||d(smoke.q,later.q)>.001||spicePixels[0]<22||spicePixels[1]<45||spicePixels[2]!==0||Math.min(...spoutPixels)<4||hops.some(v=>Math.abs(v-17)>.01))throw Error(JSON.stringify({spicePixels,spoutPixels,hops,smoke,later}));
    if(Math.max(bite,milk,push,grip,dropJoin,d(a,mark))>.004||reach>1.08||m.fallDx>1.4||Math.min(...movement)<6||afterBite>=D.GOTA_LOC.x-2||salsa.length!==9||salsa.some(([hit,n],i)=>hit<.36||n!==i+1)||Math.abs(after2-.62)>.001)throw Error(JSON.stringify(m));
    return {m,spicePixels,spoutPixels,hops};
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
  console.log(JSON.stringify({scene: "00128.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
