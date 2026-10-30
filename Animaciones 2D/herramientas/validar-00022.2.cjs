#!/usr/bin/env node
/* node herramientas/validar-00022.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, la escalera, el gato, los agarres y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00022.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00022_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante la llegada del gato a los brazos, sin recorrer la escena.
  A2D.cuadro(10.12);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00022')&&document.getElementById('escena').value==='00022.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=MarcosBombero,actors=[['g',G],['m',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,ladderLength=0,grip=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,dist(e,target)*p.s*(A.K||1));}}
   const ec=D.escaleraPose(t),ex=D.escalera(t);ladderLength=Math.max(ladderLength,Math.abs(dist(ex.pie,ex.cima)-D.ESC_L));
   if(t>=D.T.planta0&&t<D.T.sube0-.15){const k=M2.suave(M2.fase(t,D.T.planta0,D.T.planta1)),u=150*(1-k),v=4*(1-k),q={x:ec.c.x+Math.cos(ec.a)*u-Math.sin(ec.a)*v,y:ec.c.y+Math.sin(ec.a)*u+Math.cos(ec.a)*v};grip=Math.max(grip,dist(L.aPantalla(P.m,P.m.manoLejos),q));}
   if(t>=D.T.coge0){const k=M2.suave(M2.fase(t,D.T.coge0,D.T.coge1)),u=M2.lerp(-50,-85,k),q={x:ec.c.x+Math.cos(ec.a)*u-Math.sin(ec.a)*6,y:ec.c.y+Math.sin(ec.a)*u+Math.cos(ec.a)*6};grip=Math.max(grip,dist(L.aPantalla(P.m,P.m.manoCerca),q));}
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('La escalera conserva su longitud',ladderLength<.001,{maxErrorPx:ladderLength});
  check('Las manos acompañan la escalera al plantarla, recogerla y llevarla',grip<.001,{maxGapPx:grip});
  const eps=1e-7,transitions=[D.T.planta0,D.T.planta1,D.T.coge0,D.T.coge1].map(t=>{const a=D.escalera(t-eps),b=D.escalera(t+eps);return{t,gap:Math.max(dist(a.pie,b.pie),dist(a.cima,b.cima))};});check('Sin saltos en los extremos al cambiar de fase',transitions.every(x=>x.gap<.01),transitions);
  const planted=[8.65,9.2,10.5,11.65].map(t=>{const e=D.escalera(t);return Math.max(dist(e.pie,D.ESC_P.pie),dist(e.cima,D.ESC_P.cima));});check('Escalera inmóvil durante el rescate',planted.every(x=>x<.001),{maxDriftPx:Math.max(...planted)});
  let rung=0;for(const side of ['cerca','lejos'])for(const [start,end,d]of D.SUBE_PIES[side]){const p=D.pose(end).m,f=p.piernas[side],q=L.aPantalla(p,{x:f.tob.x+(L.TALON.x+.55*(L.PUNTA.x-L.TALON.x)),y:f.tob.y+L.PUNTA.y});rung=Math.max(rung,dist(q,D.enEsc(d)));}check('Las suelas alcanzan los peldaños al terminar cada paso',rung<1.5,{maxSoleGapPx:rung});
  const seq=[];for(let t=D.T.trepa0;t<D.T.trepa1;t+=.02)seq.push(D.altManos(t)+.001>=D.altCuerpo(t)&&D.altCuerpo(t)+.001>=D.altPies(t));check('Guillermo trepa alternando manos, cuerpo y pies',seq.every(Boolean));
  const cats=[D.T.gSalta0,D.T.gSalta1,D.T.gBrazos0,D.T.gBrazos1,D.T.gCasco0,D.T.gCasco1].map(t=>{const a=D.estadoGato(t-eps,D.poseM(t-eps)),b=D.estadoGato(t+eps,D.poseM(t+eps));return{t,position:dist(a,b),rotation:Math.abs((a.o.rot||0)-(b.o.rot||0)),direction:Math.abs((a.o.dir||0)-(b.o.dir||0))};});check('Saltos del gato continuos al despegar y aterrizar',cats.every(x=>x.position<.35&&x.rotation<.01&&x.direction<.01),cats);
  let helmet=0;for(let t=D.T.gCasco1;t<D.T.fin;t+=.025){const p=D.poseM(t),cat=D.estadoGato(t,p),q=L.aPantalla(p,L.cabeza(p).a(D.CASCO));helmet=Math.max(helmet,dist(cat,q));}check('El gato sigue el casco al bajar, girar y salir',helmet<.001,{maxGapPx:helmet});
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true});
  function bounds(paint,t,camera){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);if(camera){const c=D.camara(t);mg.translate(512,300);mg.scale(c.k,c.k);mg.translate(-c.x,-c.y);}paint();const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return{t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256};}
  const ladderFloor=bounds(()=>D.dibEscalera(mg,D.escaleraPose(10)),10,false);check('Los tacos de la escalera descansan sobre el suelo',ladderFloor.bottom<=D.SUELO+1&&ladderFloor.bottom>=D.SUELO-2,ladderFloor);
  const ground=[];for(let t=D.T.cae1;t<D.T.fin;t+=.05)ground.push(bounds(()=>G.dibujar(mg,D.poseG(t),t),t,false));check('La caída sentada no atraviesa el suelo',ground.every(x=>x.bottom<=D.SUELO+2),{samples:ground.length,maxBottom:Math.max(...ground.map(x=>x.bottom))});
  const frames=[];for(let t=1.5;t<D.T.fin;t+=.15)frames.push(bounds(()=>G.dibujar(mg,D.poseG(t),t),t,true));for(let t=.8;t<D.T.mSale0+.2;t+=.15)frames.push(bounds(()=>{const p=D.poseM(t),c=D.estadoGato(t,p);D.gato(mg,c.x,c.y,1,c.o,t);},t,true));for(let t=D.T.planta1;t<D.T.coge0;t+=.15)frames.push(bounds(()=>{L.dibujar(mg,D.poseM(t),t);D.dibEscalera(mg,D.escaleraPose(t));},t,true));const cut=frames.filter(b=>b.left<2||b.right>1021||b.top<2||b.bottom>598);check('Rescate y saltos completos dentro del encuadre',!cut.length,{samples:frames.length,cut});
  A2D.cuadro(10.12);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.45, 1.85, 2.3, 2.42, 3, 3.8, 4.6, 5.05, 5.42, 5.6, 5.82, 6.3, 7, 7.6, 8.1, 8.6, 9, 9.5, 9.86, 10.12, 10.5, 10.86, 11.2, 11.42, 11.55, 11.9, 12.14, 12.6, 12.85, 13.08, 13.5, 14.45],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00022.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00022.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00022');await page.selectOption('#escena','00022.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7.25)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00022.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00022.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
