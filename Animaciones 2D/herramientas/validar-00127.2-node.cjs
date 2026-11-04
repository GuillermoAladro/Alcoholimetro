const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00127.2 Guillermo y Sara - el skate de noche.js", "sara-saez");
  const original=await load("escenas/00127 Guillermo y Sara - el skate de noche.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++)original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00127_2;
    const {T}=D,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),G=Guillermo,S=SaraSaez;
    const toe=(p,l)=>{const m=p.piernas[l],u=S.rotP(S.PUNTA,m.ang);return S.aPantalla(p,{x:m.tob.x+u.x,y:m.tob.y+u.y});};
    const cap=t=>{const p=D.pose(t).g;return [G.aPantalla(p,p.pelvis),...['manoCerca','manoLejos'].map(k=>G.aPantalla(p,p[k])),...Object.values(p.piernas).map(q=>D.suelaDe(G,p,q.tob,q.ang,D.CX_G))];};
    const joins=[T.gAtras0,T.gSalta,T.sale].map(t=>Math.max(...cap(t-1e-7).map((p,i)=>d(p,cap(t+1e-7)[i]))));
    let sole=0,grip=0,kick=0,spark=0,ground=0,shoulder=0,reach=0,minClear=Infinity;
    const pushes=T.emp.map(e=>{let err=0;const anchor={x:D.xB(e+.22*.62)+8,y:D.SUELO_S+3};
      for(let j=0;j<=40;j++){const t=e+(.22+.38*j/40)*.62;err=Math.max(err,d(toe(D.pose(t).s,"cerca"),anchor));}return err;});
    for(let i=0;i<D.DUR*120;i++){const t=i/120,{s,g}=D.pose(t);
      if(t<9.6){const B=D.tablaS(t),floor=Math.max(...[-D.EJE,D.EJE].flatMap(x=>[-16,16].map(z=>D.fondoRueda(B,x,z))));
        ground=Math.max(ground,Math.abs(floor-B.suelo));
        const l=D.lxS(t);if(t<T.sVe+.04||t>T.sVe+.24){const q=s.piernas.lejos;sole=Math.max(sole,d(D.enLija(B,l.l),D.suelaDe(S,s,q.tob,q.ang,D.CX_S)));}
        if(t>=T.frena0+.14&&t<=T.frena1-.05)spark=Math.max(spark,Math.abs(D.chispaFreno(t).y-B.suelo));
        if(t>T.agarra+.04)shoulder=Math.max(shoulder,d(G.aPantalla(g,g.manoLejos),D.hombroSara(t)));}
      if(t>=T.pisa&&t<=T.pisa+.08)kick=Math.max(kick,d(toe(s,'lejos'),D.lugarToque(D.tablaSuelta(t))));
      if(t>=T.coge){const b=D.tablaEnMano(t,s);grip=Math.max(grip,d(D.pinzaS(s),D.agarreTabla(b)));minClear=Math.min(minClear,D.SUELO_V-D.puntoTabla(b,-D.TL/2,D.kick(-D.TL/2),0).y);}
      for(const [r,p] of [[S,s],[G,g]])for(const [side,m] of [['cerca',p.manoCerca],['lejos',p.manoLejos]]){if(!m)continue;const h=r.tronco(p)(side==='cerca'?r.HOMBRO_C:r.HOMBRO),l=r.JK*r.MUNECA_R,y={x:m.x+l*Math.cos(m.mu),y:m.y+l*Math.sin(m.mu)};
        reach=Math.max(reach,d(h,y)/(side==='cerca'?r.BRAZO_C_L:r.BRAZO_L));}}
    const eps=1e-7,V=D.vueltaTabla(),board=t=>t<T.coge?D.tablaSuelta(t):D.tablaEnMano(t,D.pose(t).s);
    const edges=[V.tHit,V.tHit+V.vuelo,T.pisa,T.pisa+.08,T.coge].map(t=>{const a=board(t-eps),b=board(t+eps);return Math.max(Math.abs(a.giro-b.giro),...[-D.TL/2,0,D.TL/2].map(x=>d(D.puntoTabla(a,x,D.kick(x),0),D.puntoTabla(b,x,D.kick(x),0))));});
    const flip=D.tablaVuelve(V.tHit+V.vuelo+.10).f-D.tablaVuelve(V.tHit-.01).f,spin=D.giroVuelta(T.coge+.1)-D.giroVuelta(T.coge);
    let knees=0;for(let i=0;i<=16;i++){
      const t=D.carrera().tFin+.225+.14*i/16,g=D.pose(t).g;
      for(const [l,h] of [['cerca',g.manoCerca],['lejos',g.manoLejos]]){const q=D.dedoMedio(h),k=D.rodilla(G,g,l);knees=Math.max(knees,g.s*Math.hypot(h.x+q.x-k.x,h.y+q.y-k.y));}}
    
    const m={knees,sole,grip,kick,spark,ground,shoulder,reach,minClear,joins,pushes,edges,flip,spin};
    const cv=document.createElement("canvas");cv.width=160;cv.height=160;const ctx=cv.getContext("2d");
    function center(q){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,160,160);ctx.setTransform(3,0,0,3,80-3*q.x,80-3*q.y);}
    function tinta(predicate){const i=ctx.getImageData(74,74,13,13).data;let n=0;for(let j=0;j<i.length;j+=4)if(i[j+3]>85&&predicate(i[j],i[j+1],i[j+2]))n++;return n;}
    const gastado=D.carrera().tFin+.29,pg=D.pose(gastado).g;
    const kneeSamples=['cerca','lejos'].map(l=>{
      const tgt=G.aPantalla(pg,D.rodilla(G,pg,l)), probes=[];
      for(const p of [{...pg,manoCerca:null,manoLejos:null},{...pg,manoCerca:{...pg.manoCerca,puno:0},manoLejos:{...pg.manoLejos,puno:0}}]){
        center(tgt);G.dibujar(ctx,p,gastado);
        probes.push({blue:tinta((r,g,b)=>b>r+8&&b>g-12),rgba:[...ctx.getImageData(80,80,1,1).data]});}
      center(tgt);ctx.save();ctx.translate(pg.x,pg.suelo);ctx.scale(pg.s,pg.s);ctx.translate(-G.PELVIS.x,-G.SUELO);
      const n=l==='cerca'?'pierna_cerca':'pierna_lejos',L=G.A.datos.piezas[n].largo,c=Recortes.ik(G.tronco(pg)(G.CADERA[l]),pg.piernas[l].tob,L,L*.5,80,1,1.03);
      c.cuna=true;c.cunaAjustada=true;Recortes.tira(ctx,G.A,n,c,18);ctx.restore();
      return {joint:tgt,leg:tinta((r,g,b)=>b>r+7&&b>g-12),center:[...ctx.getImageData(80,80,1,1).data],probes};
    });
    const denim=kneeSamples.map(k=>k.leg);
    const t=T.agarra+.27,ps=D.pose(t).s,target=D.hombroSara(t);center(target);S.dibujar(ctx,ps,t);
    const shoulderInk=tinta((r,g,b)=>Math.max(r,g,b)<135);
    const ts=T.coge+.18,sara=D.pose(ts).s,B=D.tablaEnMano(ts,sara);center(D.pinzaS(sara));D.dibTabla(ctx,B);
    const gripInk=tinta(()=>true);
    if(Math.min(...denim)<12||shoulderInk<12||gripInk<12)throw Error(JSON.stringify({denim,kneeSamples,shoulderInk,gripInk}));
    if(Math.max(knees,sole,grip,kick,spark,ground,shoulder,...joins,...pushes,...edges)>.012||reach>1.08||minClear<3||Math.abs(flip-Math.PI)>1e-8||spin>=-.1)throw Error(JSON.stringify(m));
    return {m,denim,kneeSamples,shoulderInk,gripInk};
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
  console.log(JSON.stringify({scene: "00127.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
