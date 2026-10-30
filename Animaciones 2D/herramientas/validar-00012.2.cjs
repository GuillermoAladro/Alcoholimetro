#!/usr/bin/env node
/* node herramientas/validar-00012.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, la boquilla, las monedas, las llaves, los pies y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00012.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00012_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente después del aterrizaje, sin recorrer la escena.
  A2D.cuadro(9.6);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00011')&&document.getElementById('escena').value==='00012.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,maxLip=0,steps=0,footDrift=0;const planted={};
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s*(A.K||1));}
    for(const side of ['cerca','lejos']){const f=D.pie(key,side,t),q=A.aPantalla(p,p.piernas[side].tob),k=key+side;if(f.alto<.00001){if(planted[k]){footDrift=Math.max(footDrift,Math.abs(q.x-planted[k].x));steps++;}planted[k]=q;}else delete planted[k];}}
   const blowing=(t>=D.T.lBoca&&t<=D.T.lDeja0)?'l':(t>=D.T.gSopla0&&t<=D.T.gSopla1)?'g':null;
   if(blowing){const b=D.boquillaEn(t,P),m=D.bocaPantalla(blowing,P[blowing]);maxLip=Math.max(maxLip,Math.hypot(b.x+Math.cos(b.a)*D.BOQ-m.x,b.y+Math.sin(b.a)*D.BOQ-m.y));}
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Pies apoyados sin deslizamiento',footDrift<.001,{samples:steps,maxDriftPx:footDrift});
  check('Boquilla en la boca durante ambos soplidos',maxLip<.01,{maxGapPx:maxLip});
  const handoffs=[D.T.lBoqCoge,D.T.lDeja,D.T.gBoqCoge,D.T.gSuelta,D.T.gVuelve].map(t=>{const a=D.boquillaEn(t-1e-7),b=D.boquillaEn(t+1e-7);return{t,gap:Math.hypot(a.x-b.x,a.y-b.y),angle:Math.abs(a.a-b.a)};});
  check('Una única boquilla sin saltos al cogerla, devolverla y soltarla',handoffs.every(x=>x.gap<.01&&x.angle<.01),handoffs);
  const coins=(()=>{const p=D.pose(D.T.gLanza).g,h=G.aPantalla(p,p.manoLejos),m=D.monedaEn(D.T.gLanza),end=D.monedaEn(D.T.gEncaja-1e-7);return{releaseGap:Math.hypot(m.x-(h.x-3),m.y-(h.y-11)),angle:m.a,width:m.ancho,slotGap:Math.hypot(end.x-D.MQ.ranura.x,end.y-(D.MQ.ranura.y-4)),presentAtRelease:!!m,absentAfter:!D.monedaEn(D.T.gEncaja)};})();
  check('Moneda lanzada desde el punto, giro y tamaño de agarre hasta la ranura',coins.releaseGap<.001&&coins.slotGap<.001&&coins.angle===.2&&coins.width===1&&coins.presentAtRelease&&coins.absentAfter,coins);
  const kh=[-1e-7,1e-7].map(d=>{const t=D.T.lCoge+d,p=D.pose(t);return D.llavesEn(t,p.g,p.l);}),kg=Math.hypot(kh[0].x-kh[1].x,kh[0].y-kh[1].y);
  check('Llaves pasan de Guillermo a Laura sin salto',kg<.001&&Math.abs(kh[0].giro-kh[1].giro)<.001,{gapPx:kg,angleGap:Math.abs(kh[0].giro-kh[1].giro)});
  check('Resultado de Laura cero y verde; sobrecarga posterior de Guillermo',D.valor(D.T.lRes+.1)===0&&D.estado(D.T.lRes+.1)==='bien'&&D.valor(D.T.rebosa+.1)==='888'&&D.estado(D.T.rebosa+.1)==='alarma');
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<D.T.fin;t+=.2){const P=D.pose(t);for(const [key,A] of actors){if(key==='l'&&t>=D.T.lSale0)continue;mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);A.dibujar(mg,P[key],t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>596);check('Siluetas completas con margen para el temblor de cámara, salvo la salida de Laura',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.lGuina+.25);check('Laura guiña un solo ojo y sale con las llaves; Guillermo acaba haciendo pucheros',end.l.cara.ojos.i>.9&&end.l.cara.ojos.d<.3&&D.pose(13.3).l.x<0&&D.pose(13.3).g.cara.boca.sonrisa<-.6);
  A2D.cuadro(9.6);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.45, 1.75, 2.28, 2.72, 3.15, 3.6, 4.1, 4.82, 5.5, 6.4, 6.78, 7.12, 7.36, 7.92, 8.4, 8.88, 9.3, 9.62, 10.4, 10.72, 11.02, 11.28, 11.7, 12.1, 12.7, 13.3, 13.95],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00012.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00012.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00011');await page.selectOption('#escena','00012.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00012.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00012.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
