const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00029.2 Guillermo y Marcos - la sirena.js'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00029_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,buttonG=0,buttonM=0,plugJump=0;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),plug=D.estadoTapon(t,P.m);if(!finite(P)||!finite(plug))nonfinite++;
  for(const [key,A] of [['g',Guillermo],['m',MarcosBombero]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
  if(t>=D.T.pulsa-.04&&t<=D.T.suelta){const tip=Guillermo.aPantalla(P.g,D.indice(Guillermo,P.g.manoLejos));buttonG=Math.max(buttonG,dist(tip,{x:D.BOTON.x,y:D.BOTON.y+5*M2.campana(t,D.T.pulsa-.06,D.T.suelta)}));}
  if(t>=D.T.mPulsa-.02&&t<=D.T.mVuelve0){const tip=MarcosBombero.aPantalla(P.m,D.indice(MarcosBombero,P.m.manoLejos));buttonM=Math.max(buttonM,dist(tip,{x:D.BOTON.x,y:D.BOTON.y+5*M2.campana(t,D.T.mPulsa-.04,D.T.mPulsa+.2)}));}
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.1)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(let i=0;i<=Math.round(D.DUR*100);i++){const t=i/100;scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);}
 for(const t of [D.T.mTapon1,D.T.mQuita0+.25,D.T.mEncoge2]){const a=D.estadoTapon(t-1e-7,D.pose(t-1e-7).m),b=D.estadoTapon(t+1e-7,D.pose(t+1e-7).m);plugJump=Math.max(plugJump,dist(a,b),Math.abs(a.ang-b.ang));}
 return {nonfinite,arms,buttonG,buttonM,plugJump,jumps,off:D.viento(D.T.apaga+.18),hair:D.peloAtras(D.DUR),rotStopped:Math.abs(D.anguloRot(D.T.apaga+1)-D.anguloRot(D.DUR)),ready:Guillermo.listo()&&MarcosBombero.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas cargados sin errores',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Índice de Guillermo toca el botón durante la pulsación',geometric.buttonG<.1,{maxGapPx:geometric.buttonG});
 check('Índice de Marcos toca el botón para apagar',geometric.buttonM<.1,{maxGapPx:geometric.buttonM});
 check('Tapón continuo mano-oreja-mano y al ofrecerlo',geometric.plugJump<.1,{maxJumpPx:geometric.plugJump});
 check('Sin saltos de postura al cambiar de fase',!geometric.jumps.length,geometric.jumps);
 check('La sirena y los rotativos paran; el pelo conserva el efecto',geometric.off===0&&geometric.hair===1&&geometric.rotStopped===0,{windAfterOff:geometric.off,hairAtEnd:geometric.hair,rotDelta:geometric.rotStopped});
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.5,2.25,2.9,3,3.3,3.48,3.72,4.25,4.38,4.6,5.5,6.15,6.6,7.3,7.32,7.8,9.6,9.7,9.9,10.3,11,11.55,12,13.5];
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
 const report={scene:'00029.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00029.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
