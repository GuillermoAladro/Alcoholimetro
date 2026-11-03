const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00026.2 Guillermo y Marcos - el extintor.js'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00026_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,nozzle=0,hose=0,ring=0,emitter=0,poseJump=0,propJump=0;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),pg=P.g;if(!finite(P))nonfinite++;
  for(const [key,A] of [['g',Guillermo],['m',MarcosBombero]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
  if(t>=D.T.boquilla)nozzle=Math.max(nozzle,dist(Guillermo.aPantalla(pg,pg.manoLejos),pg.boq));
  const q=pg.boq,tail={x:q.x-q.dir.x*9*q.esc-pg.asa.x,y:q.y-q.dir.y*9*q.esc-pg.asa.y};
  hose=Math.max(hose,dist(pg.manguera[0],D.EXT.valvula),dist(pg.manguera.at(-1),tail));
  if(t>=D.T.anilla-.03&&t<=D.T.anilla+.1)ring=Math.max(ring,dist(D.posicionAnilla(t),Guillermo.aPantalla(pg,pg.manoLejos)));
  if(pg.salida)emitter=Math.max(emitter,dist(pg.salida,{x:q.x+q.dir.x*34*q.esc,y:q.y+q.dir.y*34*q.esc}));
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.1)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(let i=0;i<=Math.round(D.DUR*100);i++){const t=i/100;scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);}
 for(const t of [D.T.coge,D.T.anilla,D.T.anilla+.1,D.T.boquilla]){
  const a=D.poseG(t-1e-7),b=D.poseG(t+1e-7);propJump=Math.max(propJump,dist(a.asa,b.asa),dist(a.boq,b.boq),dist(a.boq.dir,b.boq.dir),Math.abs(a.boq.esc-b.boq.esc),dist(D.posicionAnilla(t-1e-7),D.posicionAnilla(t+1e-7)));
  for(let j=0;j<4;j++)propJump=Math.max(propJump,dist(a.manguera[j],b.manguera[j]));
 }
 const grabbed=D.poseG(D.T.coge),pickup=dist(Guillermo.aPantalla(grabbed,grabbed.manoCerca),D.ASA_PARED);
 return {nonfinite,arms,nozzle,hose,ring,emitter,pickup,propJump,jumps,states:{candleBefore:D.viva(D.T.apaga),candleAfter:D.viva(D.T.apaga+.15),powderG:D.yesoG(12),powderM:D.yesoM(12)},ready:Guillermo.listo()&&MarcosBombero.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas cargados sin errores',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Extintor recogido por el asa sin desplazamiento',geometric.pickup<.1,{maxGapPx:geometric.pickup});
 check('Boquilla en el puño después de descolgarla',geometric.nozzle<.1,{maxGapPx:geometric.nozzle});
 check('Manguera conectada a válvula y boquilla',geometric.hose<.1,{maxGapPx:geometric.hose});
 check('Anilla en la mano durante su extracción',geometric.ring<.1,{maxGapPx:geometric.ring});
 check('Polvo emitido desde la boca de la boquilla',geometric.emitter<.1,{maxGapPx:geometric.emitter});
 check('Continuidad del asa, anilla, boquilla y manguera',geometric.propJump<.01,{maxJumpPx:geometric.propJump});
 check('Sin saltos de postura al cambiar de fase',!geometric.jumps.length,geometric.jumps);
 check('Vela apagada y Guillermo limpio al final; Marcos conserva el polvo',geometric.states.candleBefore===1&&geometric.states.candleAfter===0&&geometric.states.powderG===0&&geometric.states.powderM===1,geometric.states);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.35,1.55,2,2.55,2.95,3.12,3.22,3.34,3.55,3.62,4.06,4.4,5.8,6.55,7.3,8.6,9.02,9.55,10.32,10.4,10.6,11.75,12.1,13.2];
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
 const report={scene:'00026.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00026.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
