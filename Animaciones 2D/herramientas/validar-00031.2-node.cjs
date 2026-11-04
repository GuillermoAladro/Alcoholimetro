const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,ROOT,C}=require('./canvas-node.cjs');
(async()=>{
 const r=await load('escenas/00031.2 Guillermo y Ander - el futbolin.js','ander'),results=[];
 const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
 const geometric=r.eval(`(()=>{
 const D=__A2D_00031_2,R=Recortes,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
 let nonfinite=0,arms=0,grips=0,trap=0,score=0,sip=0,clearance=1e9;
 for(let i=0;i<=Math.round(D.DUR*120);i++){
  const t=i/120,P=D.pose(t),ball=D.bola(t),sh=D.temblor(t);
  if(!finite(P)||!finite(ball))nonfinite++;
  const counting=D.CUENTA.some(([c0,c1])=>t>c0-.27 && t<c1+.45);
  const contacts=[[1,Guillermo,P.g,'manoCerca',t<=D.T.limpia0||t>=D.T.limpia1+.15],[3,Guillermo,P.g,'manoLejos',true],[2,Ander,P.a,'manoLejos',!counting]];
  for(const [bar,actor,p,hand,held] of contacts)if(held)grips=Math.max(grips,dist(actor.aPantalla(p,p[hand]),D.centroMango(bar,sh,t)));
  for(const [a,b] of [[D.T.atrapa1,D.T.chuta1],[D.T.atrapa2,D.T.chuta2]])if(t>=a&&t<b)trap=Math.max(trap,dist(D.P3(ball.u,ball.v),D.P3(.5+D.deslizaBarra(2,t),.345)));
  for(let j=0;j<4;j++){
   const p=D.bolitaPos(1,D.bolitaAnder(j,t),sh),q=D.bolitaPos(1,D.bolitaAnder(j+1,t),sh);clearance=Math.min(clearance,dist(p,q)-p.r-q.r);
   if(j>=3||t<D.CUENTA[j][0]||t>D.CUENTA[j][1])continue;
   const m=P.a.manoLejos,tip=D.puntaIndice(m.mu,m.ang,1),finger=Ander.aPantalla(P.a,{x:m.x+tip.x,y:m.y+tip.y});
   score=Math.max(score,dist(finger,{x:p.x+1.5,y:p.y-.9*p.r}));
  }
  const m=P.a.manoCerca;
  if(Math.abs(m.ang+.55)<1e-8){const rim=Ander.rotP({x:D.VASO.ancho*Ander.JK,y:D.VASO.arriba*Ander.JK},m.ang);sip=Math.max(sip,dist({x:m.x+rim.x,y:m.y+rim.y},Ander.boca(P.a))*P.a.s);}
  for(const [key,A] of [['g',Guillermo],['a',Ander]])for(const side of ['Cerca','Lejos']){
   const p=P[key],m=p['mano'+side],near=side==='Cerca',h=A.tronco(p)(near?A.HOMBRO_C:A.HOMBRO),len=near?A.BRAZO_C_L:A.BRAZO_L,sj=near?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};
   const curve=R.ikContinuo(h,target,len,sj,42,m.dobla,1.08);arms=Math.max(arms,dist(R.extremo(curve),target)*p.s*(A.K||1));
  }
 }
 const jumps=[];function scan(a,b,p,t){for(const k in a){if(k==='puno'||k==='encima')continue;if(typeof a[k]==='number'&&typeof b[k]==='number'){const d=Math.abs(a[k]-b[k]);if(d>.01)jumps.push({t,path:p+'.'+k,d});}else if(a[k]&&b[k]&&typeof a[k]==='object')scan(a[k],b[k],p+'.'+k,t)}}
 for(const t of [...Object.values(D.T),...Array.from({length:Math.round(D.DUR*100)+1},(_,i)=>i/100)])scan(D.pose(t-1e-7),D.pose(t+1e-7),'pose',t);
 const eps=1e-7,t0=D.T.lanza,t1=D.T.plof,c=D.bola(t0-eps),p=D.P3(c.u,c.v,c.h),sh=D.temblor(t0-eps),a=D.bola(t0),z=D.bola(t1-eps),jar=D.bolaEnJarra(t1),js=D.temblor(t1);
 const launch=dist(a,{x:p.x+sh.x,y:p.y+sh.y-.6*4.6*D.kv(c.v)}),land=dist(z,{x:D.PINTA.x+jar.x+js.x,y:D.PINTA.y+jar.y+js.y});
 const tm=(t0+t1)/2,top=D.bola(tm),cam=D.camara(tm),bottom=300+(top.y+top.r-cam.y)*cam.k;
 return {nonfinite,arms,grips,trap,score,sip,clearance,launch,land,bottom,jumps,ready:Guillermo.listo()&&Ander.listo(),errors:R.errores(),samples:Math.round(D.DUR*120)+1};})()`);
 check('Atlas de Guillermo y Ander cargados',geometric.ready&&!geometric.errors.length,geometric.errors);
 check('Geometría finita a 120 Hz',!geometric.nonfinite,{samples:geometric.samples});
 check('Cuatro muñecas conectadas',geometric.arms<.1,{maxGapPx:geometric.arms});
 check('Tres puños dentro de sus mangos mientras los sujetan',geometric.grips<2.3,{maxDistancePx:geometric.grips});
 check('Dos controles de pelota bajo el muñeco azul',geometric.trap<.01,{maxGapPx:geometric.trap});
 check('Índice en cada bolita durante los tres desplazamientos',geometric.score<.01,{maxGapPx:geometric.score});
 check('Bolitas distinguibles en perspectiva',geometric.clearance>0,{minClearancePx:geometric.clearance});
 check('El borde del vaso alcanza la boca durante los sorbos',geometric.sip<.01,{maxGapPx:geometric.sip});
 check('Continuidad del balón al despegar y caer en la jarra',geometric.launch<.01&&geometric.land<.01,{launchGapPx:geometric.launch,landingGapPx:geometric.land});
 check('El balón sale por completo del encuadre',geometric.bottom<0,{bottomAtApexPx:geometric.bottom});
 check('Postura continua en transiciones exactas y muestreo regular',!geometric.jumps.length,geometric.jumps);
 const hash=()=>crypto.createHash('sha256').update(r.canvas.data()).digest('hex');
 const targets=[0,.12,.8,1.15,2.98,3.34,3.5,4.1,5.55,6.42,6.7,6.86,7.38,8.9,9,9.17,9.5,9.86,10,10.16,11.19,11.8,12.5,13.5];
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
 const report={scene:'00031.2',renderer:'Node/Skia @napi-rs/canvas',durationSeconds:r.e.dur,results,passed:results.every(x=>x.passed),limitations:['No se han probado los controles HTML en un navegador ni la Raspberry Pi física.']};
 fs.writeFileSync(path.join(ROOT,'revision/00031.2-resultados-node.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
