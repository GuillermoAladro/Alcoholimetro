const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00032.2 Guillermo y Ander - la guindilla.js','ander'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00032_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,lip=0,push=0,table=0,follow=0,prevAngle=null,angleStep=0;
 const point=(A,p,m,local)=>{const v=A.rotP({x:local.x*A.JK,y:local.y*A.JK},m.ang);return A.aPantalla(p,{x:m.x+v.x,y:m.y+v.y});};
 const T=D.T;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),glass=D.vasoPos(t);
  if(!finite(P)||!finite(glass))nonfinite++;
  const gm=P.g.manoLejos,am=P.a.manoLejos,angle=gm.ang+gm.mu;
  if(prevAngle!==null&&t>T.jarraCoge&&t<T.jarraDeja){const d=angle-prevAngle;angleStep=Math.max(angleStep,Math.abs(Math.atan2(Math.sin(d),Math.cos(d))));}
  prevAngle=angle;
  if(t>=T.bebe0&&t<=T.jarraDeja0)lip=Math.max(lip,dist(point(Guillermo,P.g,gm,D.J_PICO),Guillermo.aPantalla(P.g,Guillermo.boca(P.g))));
  if(t>=T.bebeLeche0&&t<=T.vasoDeja0)lip=Math.max(lip,dist(point(Guillermo,P.g,gm,D.V_LABIO),Guillermo.aPantalla(P.g,Guillermo.boca(P.g))));
  if(t>=T.lecheToca&&t<=T.lecheEmpuja){const hand=Ander.aPantalla(P.a,am);push=Math.max(push,dist(hand,{x:glass.x+15*Ander.JK*P.a.s,y:glass.y}));}
  if(t>=T.gBoca&&t<=T.gMete){const rem=1-2*M2.tramo(t,T.gBoca,T.gMete),mouth=Guillermo.aPantalla(P.g,Guillermo.cabeza(P.g).a({x:803,y:738}));follow=Math.max(follow,dist(point(Guillermo,P.g,gm,D.puntaChile(rem)),mouth));}
  for(const [key,A] of [['g',Guillermo],['a',Ander]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(k==='puno'||k==='encima')continue;if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.01)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(const t of [...Object.values(D.T),...Array.from({length:Math.round(D.DUR*100)+1},(_,i)=>i/100)])scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);
 const transfers=[[T.gCoge,Guillermo,'g',D.CH_G0,0],[T.aCoge,Ander,'a',D.CH_A0,0],[T.aTallo,Ander,'a',D.TALLO_A,-.25],[T.jarraCoge,Guillermo,'g',D.JARRA0,0],[T.jarraDeja,Guillermo,'g',D.JARRA0,0],[T.gLecheCoge,Guillermo,'g',D.VASO_FIN,0],[T.vasoDeja,Guillermo,'g',D.VASO_FIN,0]];
 let tilt=0;for(const [t,A,key,q,ang] of transfers){const p=D.pose(t)[key],m=p.manoLejos;table=Math.max(table,dist(q,A.aPantalla(p,m)));tilt=Math.max(tilt,Math.abs(ang-m.ang));}
 const eps=1e-5,release=T.lecheEmpuja,before=(D.vasoPos(release).x-D.vasoPos(release-eps).x)/eps,after=(D.vasoPos(release+eps).x-D.vasoPos(release).x)/eps;
 const vols=[D.volJarra(T.bebe0),D.volJarra(T.bebe1),D.volLeche(T.bebeLeche0),D.volLeche(T.bebeLeche1)];
 return {nonfinite,arms,lip,table,tilt,push,follow,angleStep,releaseJump:Math.abs(before-after),vols,jumps,ready:Guillermo.listo()&&Ander.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas de Guillermo y Ander cargados',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Siete cambios de mano y mesa conservan posición y ángulo',geometric.table<.01&&geometric.tilt<.001,{maxGapPx:geometric.table,maxAngleRad:geometric.tilt});
 check('La punta de la guindilla llega a la boca al comerla entera',geometric.follow<.01,{maxGapPx:geometric.follow});
 check('El pico de la jarra y el borde del vaso siguen el labio',geometric.lip<.01,{maxGapPx:geometric.lip});
 check('Ambas bebidas se consumen hasta vaciarse',[.88,0,.85,0].every((x,i)=>Math.abs(x-geometric.vols[i])<.001),geometric.vols);
 check('La mano acompaña al vaso durante el empuje',geometric.push<.01,{maxGapPx:geometric.push});
 check('El vaso conserva su velocidad al soltarse',geometric.releaseJump<.1,{velocityDifference:geometric.releaseJump});
 check('La muñeca gira progresivamente al levantar y bajar la jarra',geometric.angleStep<.6,{maxRadiansPer120HzStep:geometric.angleStep});
 check('Postura continua en transiciones exactas y muestreo regular',!geometric.jumps.length,geometric.jumps);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.85,2.3,2.45,2.85,3.35,4.8,5.72,6.9,7.7,8.55,9.22,9.7,10.4,10.88,11.16,11.48,11.55,11.98,12.62,13.25,13.75,14.6];
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
 const report={scene:'00032.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00032.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
