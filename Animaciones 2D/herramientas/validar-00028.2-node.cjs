const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00028.2 Guillermo y Marcos - vestirse en tres segundos.js'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00028_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 const point=(p,q)=>({x:p.c.x+Math.cos(p.ang)*q.x-Math.sin(p.ang)*q.y,y:p.c.y+Math.sin(p.ang)*q.x+Math.cos(p.ang)*q.y});
 let nonfinite=0,arms=0,grip=0,bootGrip=0,propJump=0,floorPenetration=0,blindEyeMargin=Infinity;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),pant=D.estadoPant(t,P.g),b1=D.estadoBota1(t,P.g),b2=D.estadoBota2(t,P.g);
  if(!finite(P)||!finite(pant)||!finite(b1)||!finite(b2))nonfinite++;
  for(const [key,A] of [['g',Guillermo],['m',MarcosBombero]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
  if(t>=D.T.sujeta&&t<D.T.suelta)for(const [side,sign]of [['Cerca',-1],['Lejos',1]])grip=Math.max(grip,dist(Guillermo.aPantalla(P.g,P.g['mano'+side]),point(pant,{x:sign*pant.ww/2,y:0})));
  if(t>=D.T.botaEn)bootGrip=Math.max(bootGrip,dist(b1,D.botaEnMano(P.g,P.g.manoLejos)));
  if(t>D.T.bonk+1.5)floorPenetration=Math.max(floorPenetration,b2.y+(13+1.1)*1.18-D.SUELO);
  if(t>=D.T.cabeza&&t<=D.T.cae0)for(const q of [{x:771,y:563},{x:894,y:617}]){
    const eye=Guillermo.aPantalla(P.g,Guillermo.cabeza(P.g).a(q)),dx=eye.x-pant.c.x,dy=eye.y-pant.c.y;
    const lx=dx*Math.cos(pant.ang)+dy*Math.sin(pant.ang),ly=-dx*Math.sin(pant.ang)+dy*Math.cos(pant.ang);
    blindEyeMargin=Math.min(blindEyeMargin,pant.ww*.48-Math.abs(lx),ly+3,pant.h*.8-ly);
  }
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.1)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(let i=0;i<=Math.round(D.DUR*100);i++){const t=i/100;scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);}
 for(const t of [D.T.agarra,D.T.agarra+.12,D.T.suelta,D.T.cabeza]){
  const a=D.estadoPant(t-1e-7,D.pose(t-1e-7).g),b=D.estadoPant(t+1e-7,D.pose(t+1e-7).g);
  for(const [x,y]of [[0,0],[-.5,0],[.5,0],[0,.8]])propJump=Math.max(propJump,dist(point(a,{x:x*a.ww,y:y*a.h}),point(b,{x:x*b.ww,y:y*b.h})),Math.abs(a.vuelo-b.vuelo));
 }
 for(const fn of [D.estadoBota1,D.estadoBota2])for(const t of [D.T.bota0+.2,D.T.botaEn,D.T.botaCae,D.T.bonk]){
  const a=fn(t-1e-7,D.pose(t-1e-7).g),b=fn(t+1e-7,D.pose(t+1e-7).g);
  propJump=Math.max(propJump,dist(a,b),50*Math.abs(Math.sin((a.ang-b.ang)/2)));
 }
 return {nonfinite,arms,grip,bootGrip,propJump,floorPenetration,blindEyeMargin,jumps,ready:Guillermo.listo()&&MarcosBombero.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas cargados sin errores',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Agarres en los extremos de la cintura del pantalón',geometric.grip<4.01,{maxGapPx:geometric.grip});
 check('Bota unida a la mano desde que la saca de la percha',geometric.bootGrip<.1,{maxGapPx:geometric.bootGrip});
 check('Pantalón y botas continuos en los cambios de fase',geometric.propJump<.1,{maxJumpPx:geometric.propJump});
 check('Segunda bota apoyada sin atravesar el suelo',geometric.floorPenetration<.05,{maxPenetrationPx:geometric.floorPenetration});
 check('Pantalón cubre ambos ojos durante el tanteo a ciegas',geometric.blindEyeMargin>0,{minCoverageMarginPx:geometric.blindEyeMargin});
 check('Sin saltos de postura al cambiar de fase',!geometric.jumps.length,geometric.jumps);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1,1.55,2.2,2.33,2.62,3.8,4.67,4.75,5.8,6.04,6.2,7.3,7.92,8.12,8.3,8.4,8.8,9.3,9.72,10.05,10.32,11,12.3,13.2,14.2];
 const expected=targets.map(t=>{r.frame(t);return hash()});let reverse=true;
 [...targets.keys()].reverse().forEach(i=>{r.frame(targets[i]);reverse=reverse&&hash()===expected[i]});
 check('Búsqueda directa y rebobinado deterministas',reverse);
 const fpsChecks=[];for(const fps of [30,60,120]){r.e.t=0;let ok=true;targets.forEach((t,i)=>{while(r.e.t+1/fps<t-1e-9)r.e.actualizar(1/fps);r.e.actualizar(Math.max(0,t-r.e.t));r.e.dibujar(r.g);ok=ok&&hash()===expected[i]});fpsChecks.push({fps,ok})}check('Reproducción idéntica a 30, 60 y 120 fps',fpsChecks.every(x=>x.ok),fpsChecks);
 const small=C.createCanvas(128,75),sg=small.getContext('2d'),delta=[],blacks=[];let prev=null;
 for(let i=0;i<=Math.round(r.e.dur*60);i++){
  const t=Math.min(r.e.dur,i/60);r.frame(t);sg.drawImage(r.canvas,0,0,128,75);const d=sg.getImageData(0,0,128,75).data;
  if(prev){let sum=0;for(let k=0;k<d.length;k+=4)sum+=Math.abs(d[k]-prev[k])+Math.abs(d[k+1]-prev[k+1])+Math.abs(d[k+2]-prev[k+2]);delta.push({t,delta:sum/(128*75*3)})}prev=d;
  if(t<=.12||t>=r.e.dur-.12){let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);blacks.push({t,max})}
 }
 const jumps=delta.filter((v,i)=>{const ns=delta.slice(Math.max(0,i-6),i).concat(delta.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5});
 check('Secuencia completa renderizada a 60 fps',true,{frames:delta.length+1});check('Negro inicial y final',blacks.every(x=>x.max===0),blacks);check('Sin cortes visuales aislados',!jumps.length,jumps);
 const report={scene:'00028.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00028.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
