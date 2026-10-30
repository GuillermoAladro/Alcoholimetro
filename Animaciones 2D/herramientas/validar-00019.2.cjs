#!/usr/bin/env node
/* node herramientas/validar-00019.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, los paraguas, sus agarres, el vuelo y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00019.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00019_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante el molinete del paraguas, sin recorrer la escena.
  A2D.cuadro(2.2);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00019')&&document.getElementById('escena').value==='00019.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0,grip=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),feet={};
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,dist(e,target)*p.s*(A.K||1));}
    if(key==='l'||t<=D.T.despega)for(const side of ['cerca','lejos']){const q=p.piernas[side],a=A.rotP(A.PUNTA,q.ang),toe=A.aPantalla(p,{x:q.tob.x+a.x,y:q.tob.y+a.y}),k=key+side;if(!feet[k])feet[k]=toe;else footDrift=Math.max(footDrift,dist(toe,feet[k]));}}
   if(P.g.paraguas.enMano)grip=Math.max(grip,dist(P.g.paraguas.mano,G.aPantalla(P.g,P.g.manoLejos)));
   if(P.l.plegable.visible>0)grip=Math.max(grip,dist(P.l.plegable.mano,L.aPantalla(P.l,P.l.manoCerca)));
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Pies plantados y punteras fijas hasta el despegue',footDrift<.001,{maxDriftPx:footDrift});
  check('Los dos paraguas permanecen en la mano que los sostiene',grip<.001,{maxGapPx:grip});
  const eps=1e-7,transitions=[D.T.suelta,D.T.giro1].map(t=>{const a=D.poseG(t-eps).paraguas,b=D.poseG(t+eps).paraguas;return{t,position:dist(a.mano,b.mano),angle:Math.abs(Math.atan2(Math.sin(a.th-b.th),Math.cos(a.th-b.th)))};});
  check('El molinete enlaza exactamente la suelta y la recogida',transitions.every(x=>x.position<.001&&x.angle<.001),transitions);
  check('El paraguas grande se abre antes de invertirse con la racha',D.aperturaGrande(D.T.abre-.01)===0&&D.aperturaGrande(3.5)===1&&D.aperturaGrande(6)>1.95);
  check('El paraguas plegable se abre al terminar de levantarlo',D.aperturaPeque(D.T.abreL-.01)===0&&D.aperturaPeque(D.T.abreL+.4)===1);
  let sheltered=true;for(let t=3.3;t<4.65;t+=.1){const P=D.pose(t),u=P.g.paraguas,ab=D.abrigo(u.mano,u.th,u.abre,D.GRANDE,1);for(const[key,A]of actors){const head=A.aPantalla(P[key],A.centroCabeza(P[key]));sheltered=sheltered&&D.debajo(ab,head.x,head.y);}}
  const Pg=D.poseG(6),Pl=D.poseL(11),h=L.aPantalla(Pl,L.centroCabeza(Pl));check('Los paraguas abiertos protegen las cabezas y el invertido deja pasar la lluvia',sheltered&&D.debajo(D.abrigo(Pl.plegable.mano,Pl.plegable.th,Pl.plegable.abre,D.PEQUE,1),h.x,h.y)&&D.abrigo(Pg.paraguas.mano,Pg.paraguas.th,Pg.paraguas.abre,D.GRANDE,1)===null);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  function frame(t,paint,key){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);if(cam.sacude>.05)mg.translate(M2.ruido(t*40)*cam.sacude,M2.ruido(t*40+9)*cam.sacude*.6);paint();const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}
  for(let t=.8;t<=D.T.despega;t+=.05)frame(t,()=>{const P=D.pose(t);D.dibujaGuillermo(mg,P.g,t);L.dibujar(mg,P.l,t);},'antes de despegar');
  for(let t=9.15;t<D.T.fin;t+=.15)frame(t,()=>{const p=D.poseL(t);L.dibujar(mg,p,t);if(p.plegable.visible>.01)D.paraguas(mg,p.plegable.mano,p.plegable.th,p.plegable.abre,D.PEQUE,1,t);},'Laura al final');
  for(let t=D.T.luna0+.01;t<D.T.luna1;t+=.05)frame(t,()=>{const p=D.poseG(t),k=M2.fase(t,D.T.luna0,D.T.luna1),x=M2.lerp(D.LUNA.x+110,D.LUNA.x-110,k),y=D.LUNA.y+5+7*Math.sin(k*6.5)-8*k;mg.translate(x,y);mg.scale(.12,.12);mg.translate(-p.paraguas.mano.x,-p.paraguas.mano.y);D.dibujaGuillermo(mg,p,t);},'cruce de la luna');
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>596);check('Molinete, inversión y cruce lunar completos dentro del encuadre',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.guino+.35);check('Laura cierra un solo ojo en el guiño final',end.l.cara.ojos.d>.9&&end.l.cara.ojos.i<.3);
  A2D.cuadro(2.2);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.62, 1.84, 2.1, 2.48, 2.65, 3, 3.55, 4, 4.8, 5.5, 5.8, 6.05, 6.4, 7, 7.5, 8, 8.75, 9.2, 9.4, 9.72, 10.1, 10.5, 11, 11.5, 11.95, 12.3, 12.6, 13.55],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00019.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00019.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00019');await page.selectOption('#escena','00019.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-6.8)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00019.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00019.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
