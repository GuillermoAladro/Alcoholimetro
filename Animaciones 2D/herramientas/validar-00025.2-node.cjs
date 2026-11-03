const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00025.2 Guillermo y Marcos - las pesas.js'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00025_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,bar=0,belt=0,jacket=0,bottle=0,head=0,weights=0;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
  for(const [key,A] of [['g',Guillermo],['m',MarcosBombero]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
  if(t>=D.T.agacha1&&t<=D.T.suelta)for(const [side,x]of [['Lejos',D.AGARRE_BARRA[0]],['Cerca',D.AGARRE_BARRA[1]]])bar=Math.max(bar,dist(Guillermo.aPantalla(P.g,P.g['mano'+side]),{x,y:D.barraY(x,t)}));
  if(t>=D.T.agarra&&t<=D.T.suelta2){const w=Guillermo.aPantalla(P.g,Guillermo.tronco(P.g)(D.WB));belt=Math.max(belt,dist(MarcosBombero.aPantalla(P.m,P.m.manoLejos),{x:w.x,y:w.y-D.BAJO_PUNO}));}
  if(t>=D.T.agarraM&&t<=D.T.aplasta0){const a=Guillermo.aPantalla(P.g,P.g.manoLejos),b=MarcosBombero.aPantalla(P.m,MarcosBombero.tronco(P.m)(D.DOBLADILLO_M));jacket=Math.max(jacket,dist(a,b));}
  if([[D.T.msorbo0,D.T.msorbo1],[D.T.msorbo2,D.T.msorbo3],[D.T.msorbo4,D.T.msorbo5]].some(([a,b])=>t>=a&&t<=b)){
   const m=P.m.manoCerca,o=MarcosBombero.rotP({x:0,y:-41*MarcosBombero.JK},m.ang);bottle=Math.max(bottle,dist({x:m.x+o.x,y:m.y+o.y},MarcosBombero.boca(P.m))*P.m.s*MarcosBombero.K);
  }
  if(t>=D.T.mmano1){const top=D.cabezaGPantalla(P.g,t);head=Math.max(head,dist(MarcosBombero.aPantalla(P.m,P.m.manoLejos),{x:top.x+4,y:top.y-4}));}
  for(const x of [150,174,196,404,426,450])weights=Math.max(weights,Math.abs(D.barraY(x,t)-404));
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.1)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(let i=0;i<=Math.round(D.DUR*100);i++){const t=i/100;scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);}
 return {nonfinite,arms,bar,belt,jacket,bottle,head,weights,jumps,ready:Guillermo.listo()&&MarcosBombero.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas cargados sin errores',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Puños conectados a la barra durante el esfuerzo',geometric.bar<.1,{maxGapPx:geometric.bar});
 check('Agarre sigue la cinturilla transformada',geometric.belt<.1,{maxGapPx:geometric.belt});
 check('Puño conectado al chaquetón durante el esfuerzo',geometric.jacket<=3.01,{maxGapPx:geometric.jacket,toleranceReason:'Temblor narrativo del tejido: amplitud máxima de 3 px'});
 check('Boquilla en el labio durante los tres sorbos',geometric.bottle<.1,{maxGapPx:geometric.bottle});
 check('Mano acompaña la coronilla al aplastarse',geometric.head<.1,{maxGapPx:geometric.head});
 check('Discos y extremos inmóviles',geometric.weights<.1,{maxShiftPx:geometric.weights});
 check('Sin saltos de postura al cambiar de fase',!geometric.jumps.length,geometric.jumps);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.1,1.72,2.6,3.4,4.1,4.5,5.15,5.3,5.86,6.4,7.4,8.5,9.35,9.86,9.92,10.44,10.87,11.58,12.2,12.92,13.18,13.6,14.7];
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
 const report={scene:'00025.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00025.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
