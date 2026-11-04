const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00033.2 Guillermo y Ander - el duelo de miradas.js','ander'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00033_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,rest=0,nose=0,head=0,blinkA=0;
 const T=D.T;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),fly=D.mosca(t);
  if(!finite(P)||!finite(fly)||!finite(D.camara(t)))nonfinite++;
  for(const [A,p,m,dx,dy,t0,t1] of [[Guillermo,P.g,'manoCerca',-93,-7,T.apoya1,T.golpe-.13],[Guillermo,P.g,'manoLejos',-38,-10,T.apoya1,T.golpe-.13],[Ander,P.a,'manoCerca',94,-7,T.apoyaA1,10.32],[Ander,P.a,'manoLejos',42,-10,T.apoyaA1,10.37]])if(t>=t0&&t<=t1)rest=Math.max(rest,dist(A.aPantalla(p,p[m]),{x:D.TX+dx,y:D.TY+dy}));
  if(t>=T.posa&&t<=T.despega)nose=Math.max(nose,dist(fly,Guillermo.aPantalla(P.g,Guillermo.cabeza(P.g).a(D.NARIZ_G))));
  if(t>=T.posaA&&t<=T.vuela)nose=Math.max(nose,dist(fly,Ander.aPantalla(P.a,Ander.cabeza(P.a).a(D.NARIZ_A))));
  if(t>=T.golpe)head=Math.max(head,dist({x:D.GOLPE_X,y:D.TY-4-.3*D.reboteMesa(t)},Guillermo.aPantalla(P.g,Guillermo.cabeza(P.g).a(D.FRENTE_G))));
  if(t>T.duelo&&t<T.golpe)blinkA=Math.max(blinkA,P.a.cara.ojos.d,P.a.cara.ojos.i);
  for(const [key,A] of [['g',Guillermo],['a',Ander]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(k==='puno'||k==='encima')continue;if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.01)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(const t of [...Object.values(D.T),...Array.from({length:Math.round(D.DUR*100)+1},(_,i)=>i/100)])scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);
 const joins=[T.posa,T.despega,T.posaA,T.vuela],eps=1e-7,flyJump=Math.max(...joins.map(t=>dist(D.mosca(t-eps),D.mosca(t+eps))));
 const eyes=(A,p,q,t)=>{const c=D.camara(t),w=A.aPantalla(p,A.cabeza(p).a(q));return {x:512+c.k*(w.x-c.x),y:300+c.k*(w.y-c.y)};};
 const cg=eyes(Guillermo,D.pose(2.95).g,D.OJOS_G_MEDIO,2.95),ca=eyes(Ander,D.pose(3.8).a,D.OJOS_A_MEDIO,3.8);
 const loser=D.pose(T.parpadea+.075).g.cara.ojos,winner=D.pose((T.parpA0+T.parpA1)/2).a.cara.ojos,wink=D.pose(T.guino+.2).a.cara.ojos;
 return {nonfinite,arms,rest,nose,head,flyJump,blinkA,cg,ca,loser,winner,wink,jumps,ready:Guillermo.listo()&&Ander.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas de Guillermo y Ander cargados',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Cuatro apoyos fijos en el tablero durante el duelo',geometric.rest<.01,{maxGapPx:geometric.rest});
 check('Contacto de la mosca en ambas narices',geometric.nose<.01,{maxGapPx:geometric.nose});
 check('Raccord de aterrizajes y despegues',geometric.flyJump<.01,{maxJumpPx:geometric.flyJump});
 check('La cabeza acompaña al tablero tras el golpe',geometric.head<.01,{maxGapPx:geometric.head});
 check('Ojos encuadrados con aire en la dirección de la mirada',geometric.cg.x>300&&geometric.cg.x<512&&geometric.ca.x>512&&geometric.ca.x<720&&[geometric.cg,geometric.ca].every(p=>p.y>180&&p.y<420),{Guillermo:geometric.cg,Ander:geometric.ca});
 check('Guillermo pierde el duelo y Ander parpadea después',geometric.blinkA<.5&&geometric.loser.d>.95&&geometric.loser.i>.95&&geometric.winner.d>.95&&geometric.winner.i>.95);
 check('Guiño final de un solo ojo',geometric.wink.d>.95&&geometric.wink.i<.1,geometric.wink);
 check('Postura continua en transiciones exactas y muestreo regular',!geometric.jumps.length,geometric.jumps);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.4,2.2,2.95,3.8,4.6,5.25,6.8,7,7.6,8.55,8.63,8.9,9.22,9.8,10.25,10.88,11.2,11.5,11.93,12.8,13.95];
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
 const report={scene:'00033.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00033.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
