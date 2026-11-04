const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00126.2 Guillermo y Sara - la cruz del collar.js", "sara-saez");
  const original=await load("escenas/00126 Guillermo y Sara - la cruz del collar.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++)original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00126_2;
    const {T}=D,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),apoyo=t=>{const p=D.poseG(t);return D.ptMano(Guillermo,p,p.manoCerca,D.sueloMano(-1.4));};
    let grip=0,chain=0,seat=0,toque=0,flagPin=0,footAir=0,reach=0,open=0;
    let last=-1;
    for(let i=0;i<=D.DUR*120;i++){const t=i/120,{g,s}=D.pose(t);
      reach=Math.max(reach,...Object.values(D.diag(t)));
      if(t>=T.saca&&t<=T.triunfo+.12){const gf=D.gafasG(t),q=D.apl(gf.A,D.geo(D.NEGRAS,gf.o).agarre);grip=Math.max(grip,d(q,D.ptMano(Guillermo,g,g.manoCerca,D.PINZA)));
        if(t>=T.abre0&&t<=T.abre1){const a=1-gf.o.plegado;if(a<last)throw Error("patilla");last=a;}}
      if(t>=T.coge1&&t<=T.mete1)chain=Math.max(chain,d(D.puntoCruz(t),D.ptMano(SaraSaez,s,s.manoCerca,D.PINZA)));
      if(t>=T.cae1)seat=Math.max(seat,Math.abs(548-D.asientoG(g).y-D.reboteG(t)));
      if(t>=T.cae1+.08&&t<=T.panSaca0)toque=Math.max(toque,Math.abs(apoyo(t).y-548));
      if(t>=T.panSaca1-.04){const q=D.puntosPanuelo(t,g);flagPin=Math.max(flagPin,d(q.P[0],D.esquinaPanuelo(g)));}
      if(t>=T.salta&&t<=T.salta+.5)footAir=Math.max(footAir,Math.min(...Object.values(g.piernas).map(l=>(Guillermo.SUELO-Guillermo.TOBILLO_ALTO-l.tob.y)*g.s)));}
    const eps=1e-7,al=t=>{const g=D.gafasG(t);return ['nc','fc','hn','fin'].map(k=>D.apl(g.A,D.geo(D.NEGRAS,g.o)[k]));},pre=al(T.pone1-eps),post=al(T.pone1+eps),join=Math.max(...pre.map((p,i)=>d(p,post[i])));
    const cameraJoins=[T.g3Toca,D.impacto.cuatro,T.cae1].map(t=>d(D.camara(t-eps),D.camara(t+eps)));
    const hit=T.g4+.45,lens=D.lenteCercana(hit),slip=d(lens,D.ojos(hit));
    const cm=D.caidaGafas(D.impacto.cuatro),end=D.caidaGafas(T.fin),before=D.gafasG(T.saca-eps)===null,apen=D.gafasG(T.saca).sale,am=D.gafasG(T.saca+.1).sale;
    const P=D.puntosPanuelo(T.onda0+.5,D.poseG(T.onda0+.5)).P;let area=0;for(let i=0;i<P.length;i++){const j=(i+1)%P.length;area+=P[i].x*P[j].y-P[i].y*P[j].x;}area=Math.abs(area/2);
    const m={area,grip,chain,seat,toque,flagPin,footAir,reach,join,cameraJoins,slip,cm,end,before,apen,am};
    const cv=document.createElement("canvas");cv.width=160;cv.height=160;const ctx=cv.getContext("2d");
    const center=(q,z)=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,160,160);ctx.setTransform(z,0,0,z,80-z*q.x,80-z*q.y);};
    function collarPixels(t){
      const pos=D.puntoCruz(t),p=D.poseS(t);const crop=base=>{
        center(pos,6);const pose={...p,manoCerca:null,manoLejos:null,capaTronco(g,tt){if(base)Recortes.pieza(g,SaraSaez.A,"tronco_libre");else D.collarMetido(g,tt,p);}};
        SaraSaez.dibujar(ctx,pose,t);return ctx.getImageData(71,73,19,15).data;};
      const a=crop(false),b=crop(true);let count=0;
      for(let i=0;i<a.length;i+=4)if(Math.max(...[0,1,2].map(k=>Math.abs(a[i+k]-b[i+k])))>22)count++;
      return count;
    }
    const visible=collarPixels(2.1),hidden=collarPixels(12.65);
    const lenses=[T.g4+.38,T.g4+.45,T.g4+.55,T.g4+.65].map(t=>{
      const g=D.poseG(t),q=D.lenteCercana(t);center(q,5);Guillermo.dibujar(ctx,g,t);
      const pix=ctx.getImageData(75,75,11,11).data;let n=0;
      for(let i=0;i<pix.length;i+=4)if(pix[i+2]>pix[i]+9&&pix[i+3]>190)n++;
      return {n,center:[...pix.slice(240,244)]};});
    const blue=Math.min(...lenses.map(v=>v.n));
    const t0=T.cae1+.28,br=D.poseG(t0);center(apoyo(t0),4);Guillermo.dibujar(ctx,br,t0);
    const pads=ctx.getImageData(75,71,11,10).data;let hand=0;for(let i=3;i<pads.length;i+=4)if(pads[i]>95)hand++;
    if(visible<35||hidden>8||blue<16||hand<20)throw Error(JSON.stringify({visible,hidden,blue,hand,lenses}));
    if(Math.max(grip,chain,seat,toque,flagPin,join,...cameraJoins)>.005||footAir<23||reach>1.08||slip<10||cm.dy!==0||end.dy<58||!before||apen!==0||am<=0||am>=1||area<1400)throw Error(JSON.stringify(m));
    return {m,visible,hidden,blue,hand,lenses};
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
  console.log(JSON.stringify({scene: "00126.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
