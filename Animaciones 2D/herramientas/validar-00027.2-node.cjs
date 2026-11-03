const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00027.2 Guillermo y Marcos - el casco.js'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00027_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,gripG=0,gripM=0,propJump=0,floorPenetration=0,flightTop=Infinity;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),c=D.casco(t);if(!finite(P)||!finite(c))nonfinite++;
  for(const [key,A] of [['g',Guillermo],['m',MarcosBombero]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
  if(t>=D.T.atrapa&&t<=D.T.lanza)for(const [side,q]of [['Cerca',{x:-66,y:-62}],['Lejos',{x:70,y:-66}]])gripG=Math.max(gripG,dist(Guillermo.aPantalla(P.g,P.g['mano'+side]),D.enMundo(c,q)));
  if((t>=D.T.coge&&t<=D.T.suelta)||(t>=D.T.agarra&&t<=D.T.dejaCae))gripM=Math.max(gripM,dist(MarcosBombero.aPantalla(P.m,P.m.manoLejos),D.enMundo(c,D.CASCO.agarre)));
  if(t>=D.T.cae)for(const [a,b,e]of [[[-84,-14],[-98,20],[-86,50]],[[-86,50],[-52,60],[-22,40]]])for(let j=0;j<=96;j++){const u=j/96,v=1-u,q={x:a[0]*v*v+2*b[0]*v*u+e[0]*u*u,y:a[1]*v*v+2*b[1]*v*u+e[1]*u*u};floorPenetration=Math.max(floorPenetration,D.enMundo(c,q).y+1.5-D.SUELO);}
  if(t>=D.T.lanza&&t<=D.T.encaja)for(const q of [{x:30,y:-160},{x:-50,y:-135},{x:70,y:-120}])flightTop=Math.min(flightTop,D.enMundo(c,q).y);
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.1)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(let i=0;i<=Math.round(D.DUR*100);i++){const t=i/100;scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);}
 for(const t of [D.T.coge,D.T.suelta,D.T.atrapa,D.T.lanza,D.T.encaja,D.T.tiron,D.T.suelto,D.T.dejaCae,D.T.cae]){
  const a=D.casco(t-1e-7),b=D.casco(t+1e-7);for(const q of [{x:0,y:0},D.CASCO.agarre,{x:93,y:-60}])propJump=Math.max(propJump,dist(D.enMundo(a,q),D.enMundo(b,q)));
 }
 return {timeline:D.guiones.flat().every(([a,b])=>b>a),admiration:D.poseG(3.6).cara.boca.abre,blush:D.poseG(4).rojo,nonfinite,arms,gripG,gripM,propJump,floorPenetration,flightTop,jumps,ready:Guillermo.listo()&&MarcosBombero.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas cargados sin errores',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Dos manos de Guillermo en el casco mientras lo sostiene',geometric.gripG<.1,{maxGapPx:geometric.gripG});
 check('Mano de Marcos en el casco durante ambos agarres',geometric.gripM<.1,{maxGapPx:geometric.gripM});
 check('Casco continuo en entregas, extracción, suelta y caída',geometric.propJump<.1,{maxJumpPx:geometric.propJump});
 check('Casco apoyado sin atravesar el suelo',geometric.floorPenetration<.05,{maxPenetrationPx:geometric.floorPenetration});
 check('Casco dentro de pantalla al lanzárselo a la cabeza',geometric.flightTop>=0,{topMarginPx:geometric.flightTop});
 check('Sin saltos de postura al cambiar de fase',!geometric.jumps.length,geometric.jumps);
 check('Admiración tras atrapar y fin del rubor de esfuerzo',geometric.timeline&&geometric.admiration===30&&geometric.blush===0,{validTimeline:geometric.timeline,mouthOpening:geometric.admiration,effortBlush:geometric.blush});
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.25,2.2,2.85,3.15,4.3,4.64,4.98,5.1,5.35,5.46,5.6,7,7.94,8.88,9.24,9.36,9.62,9.9,10.25,10.38,10.6,11.75,12.5,13.5];
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
 const report={scene:'00027.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00027.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
