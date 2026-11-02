const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00024.2 Guillermo y Marcos - la manguera loca.js'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00024_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,gripG=0,gripM=0,wheel=0,hose=0,hoseJump=0,jet=0;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
  for(const [key,A] of [['g',Guillermo],['m',MarcosBombero]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
  const L=D.lanzaActual(t,P.g),M=D.puntosManguera(t,P.g,P.m),Gr=D.giroG(P.g),near=P.g.manoCerca;
  if(t>=D.T.toma)gripG=Math.max(gripG,dist(Gr.f(Guillermo.aPantalla(P.g,P.g.manoLejos)),D.puntoLanza(L,15)));
  if(t>=D.T.suelta+.3&&(t<=D.T.yeehaw-.2||t>=D.T.cierra1))gripG=Math.max(gripG,dist(Gr.f(Guillermo.aPantalla(P.g,near)),D.puntoLanza(L,-11)));
  if(t<=D.T.suelta)gripM=Math.max(gripM,dist(MarcosBombero.aPantalla(P.m,P.m.manoLejos),D.puntoLanza(L,-11)));
  if(t>=D.T.valv1&&t<=D.T.encoge-.15){const a=-2.1+D.giroRueda(t),q={x:D.VAL.rueda.x+Math.cos(a)*D.VAL.rueda.r*.85,y:D.VAL.rueda.y+Math.sin(a)*D.VAL.rueda.r*.85};wheel=Math.max(wheel,dist(MarcosBombero.aPantalla(P.m,P.m.manoCerca),q));}
  hose=Math.max(hose,dist(M.detras[0],D.VAL.boca),dist(M.delante.at(-1),D.puntoLanza(L,D.COLA-2)),dist(M.detras.at(-1),M.delante[0]));
  const before=D.pose(t-1e-7),after=D.pose(t+1e-7),H0=D.puntosManguera(t-1e-7,before.g,before.m),H1=D.puntosManguera(t+1e-7,after.g,after.m);
  for(const side of ['detras','delante']){if(H0[side].length!==H1[side].length)hoseJump=Infinity;else for(let j=0;j<H0[side].length;j++)hoseJump=Math.max(hoseJump,dist(H0[side][j],H1[side][j]));}
  jet=Math.max(jet,dist(D.bocaChorro(t,P.g),D.puntoLanza(L,D.BOCA)));

 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(k==='giro')continue;if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.1)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(let i=0;i<=Math.round(D.DUR*100);i++){const t=i/100;scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);}
 return {nonfinite,arms,gripG,gripM,wheel,hose,hoseJump,jet,jumps,ready:Guillermo.listo()&&MarcosBombero.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas cargados sin errores',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Puños de ambos personajes en la lanza durante los agarres',Math.max(geometric.gripG,geometric.gripM)<.1,{guillermoPx:geometric.gripG,marcosPx:geometric.gripM});
 check('Mano de Marcos conectada con la rueda, también durante el salto',geometric.wheel<.1,{maxGapPx:geometric.wheel});
 check('Manguera conectada a válvula y lanza',geometric.hose<.1,{maxGapPx:geometric.hose});
 check('Sin saltos ni cambios de topología en la manguera',geometric.hoseJump<.01,{maxJumpPx:geometric.hoseJump});
 check('El chorro sale de la boca de la lanza',geometric.jet<.1,{maxGapPx:geometric.jet});
 check('Sin saltos de postura al cambiar de fase',!geometric.jumps.length,geometric.jumps);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.6,1.8,2.25,2.35,2.65,3.2,4.4,4.5,4.8,4.98,5.3,6.5,7.5,7.92,8.6,9.5,10.4,10.9,11.8,12.2,12.95,13.9];
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
 const report={scene:'00024.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00024.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
