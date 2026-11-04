const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00030.2 Guillermo y Marcos - la lona de salto.js'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00030_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;D.geo();
 let nonfinite=0,arms=0,catchNear=0,catchFar=0,clothContact=0,ringGrip=0;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),tr=D.tray(t);if(!finite(P)||!finite(tr))nonfinite++;
  for(const [key,A] of [['g',Guillermo],['m',MarcosBombero]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
  if(t>=D.T.coge+.04){const a=D.agarresG(P.g,P.g.giro);catchNear=Math.max(catchNear,dist(a.rodilla,MarcosBombero.aPantalla(P.m,P.m.manoCerca)));catchFar=Math.max(catchFar,dist(a.espalda,MarcosBombero.aPantalla(P.m,P.m.manoLejos)));}
  if(tr.lona){const x=tr.x-D.LONA.cx,rad=Math.abs(x)/(D.LONA.rx-5),q=D.puntoTela(t,rad,x<0?Math.PI:0);clothContact=Math.max(clothContact,Math.abs(tr.y-q.y));}
  if(t<=D.T.mdate+.05){const q=MarcosBombero.aPantalla(P.m,P.m.manoLejos);ringGrip=Math.max(ringGrip,dist(q,{x:D.LONA.cx+D.LONA.rx-3,y:D.LONA.cy+1+.08*Math.max(0,D.estadoLona(t).d)}));}
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(k==='puno'||k==='encima')continue;if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.01)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(const t of [...Object.values(D.T),...Array.from({length:Math.round(D.DUR*100)+1},(_,i)=>i/100)])scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);
 let fabricJump=0;for(const c of D.CONTACTOS)for(const t of [c.t0,c.t0+D.DC])for(const r of [0,.24,.6,1])for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2])fabricJump=Math.max(fabricJump,dist(D.puntoTela(t-1e-7,r,a),D.puntoTela(t+1e-7,r,a)));
 return {nonfinite,arms,catchNear,catchFar,clothContact,ringGrip,fabricJump,jumps,ready:Guillermo.listo()&&MarcosBombero.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas cargados sin errores',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Mano cercana sostiene el muslo durante toda la carga',geometric.catchNear<.1,{maxGapPx:geometric.catchNear});
 check('Mano lejana sostiene la espalda durante toda la carga',geometric.catchFar<.1,{maxGapPx:geometric.catchFar});
 check('La tela sigue el punto de contacto durante los tres rebotes',geometric.clothContact<.01,{maxGapPx:geometric.clothContact});
 check('Mano de Marcos unida al aro mientras lo sujeta',geometric.ringGrip<.01,{maxGapPx:geometric.ringGrip});
 check('Tela continua en los contactos y despegues',geometric.fabricJump<.01,{maxJumpPx:geometric.fabricJump});
 check('Postura continua en transiciones exactas y muestreo regular',!geometric.jumps.length,geometric.jumps);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1,2.2,2.9,3,3.1,3.3,3.8,4.12,4.6913682901282865,4.77,4.841368290128287,5.3,6.630222672128118,6.7,6.780222672128119,8.921873126022653,9,9.071873126022654,10,11,11.574681661974545,11.8,12.5,13.5,14.4];
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
 const report={scene:'00030.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00030.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
