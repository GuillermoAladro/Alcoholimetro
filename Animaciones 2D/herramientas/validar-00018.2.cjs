#!/usr/bin/env node
/* node herramientas/validar-00018.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, los brazos, las fotografías, el móvil y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00018.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00018_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente directamente en la fotografía final, sin recorrer la escena.
  A2D.cuadro(11.5);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00018')&&document.getElementById('escena').value==='00018.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0,phoneGap=0,ears=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),feet={};
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,dist(e,target)*p.s*(A.K||1));}
    for(const side of ['cerca','lejos']){const q=p.piernas[side],a=A.rotP(A.PUNTA,q.ang),toe=A.aPantalla(p,{x:q.tob.x+a.x,y:q.tob.y+a.y});if(key==='g'){const f=D.pieG(side,t),z=A.rotP(A.PUNTA,f.ang),expected=A.aPantalla(p,{x:A.PELVIS.x+(f.x-p.x)/p.s+z.x,y:f.y+z.y});footDrift=Math.max(footDrift,dist(toe,expected));}else{if(!feet[side])feet[side]=toe;else footDrift=Math.max(footDrift,dist(toe,feet[side]));}}}
   const m=P.l.manoLejos,local={x:D.MOV.x0-2,y:D.MOV.y0+D.MOV.h*.42},o=L.rotP({x:local.x*m.escMovil*L.JK,y:local.y*m.escMovil*L.JK},m.ang),q=L.aPantalla(P.l,{x:m.x+o.x,y:m.y+o.y});phoneGap=Math.max(phoneGap,dist(q,D.puntoMovil(P.l,local)));
   if(t>=D.T.orejas0+.5&&t<=D.T.esconde){const cima=L.aPantalla(P.l,L.cabeza(P.l).a({x:745,y:205})),hand=G.aPantalla(P.g,P.g.manoLejos);ears=Math.max(ears,dist(hand,{x:cima.x-8,y:cima.y-2+2*Math.sin(t*6)}));}
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Punteras fijas al estirarse y pasos sin deslizamiento',footDrift<.001,{maxDriftPx:footDrift});
  check('El destello sigue la posición y escala real del móvil',phoneGap<.001,{maxGapPx:phoneGap});
  check('Las orejas de conejo siguen la cabeza de Laura',ears<.001,{maxGapPx:ears});
  const first=D.pose(D.T.flash1),second=D.pose(D.T.flash2),third=D.pose(D.T.flash3),last=D.pose(D.T.flash4);
  check('La primera foto captura los dos ojos cerrados de Guillermo',first.g.cara.ojos.d>.95&&first.g.cara.ojos.i>.95);
  check('El segundo flash captura el estornudo',second.g.cara.ojos.d>.9&&second.g.cara.ojos.i>.9&&second.g.cara.boca.abre>25);
  check('La tercera foto captura los dos dedos de las orejas',third.g.manoLejos.dedos.indice>.85&&third.g.manoLejos.dedos.medio>.85&&third.g.manoLejos.dedos.anular<.1);
  check('La foto final incluye el guiño y las dos uves',last.g.cara.ojos.d>.95&&last.g.cara.ojos.i<.3&&[last.g,last.l].every(p=>p.manoLejos.dedos.indice===1&&p.manoLejos.dedos.medio===1||p.manoCerca.dedos.indice===1&&p.manoCerca.dedos.medio===1));
  check('Cuatro flashes alcanzan su máximo en los instantes de captura',D.FLASHES.length===4&&D.FLASHES.every(t=>D.flashK(t)===1));
  function canvasHash(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=2166136261;for(const x of d)h=Math.imul(h^x,16777619);return h>>>0;}
  const photos=[0,1,2].map(i=>D.foto(i)),ph=photos.map(canvasHash),fr=canvasHash(D.fotoFinal());
  check('Tres miniaturas distintas y reproducibles',new Set(ph).size===3&&photos.every(c=>c.width===300&&c.height===196));
  const exact=document.createElement('canvas');exact.width=1024;exact.height=600;const eg=exact.getContext('2d');eg.fillStyle='#000';eg.fillRect(0,0,1024,600);eg.save();D.aplicaCamara(eg,D.camara(D.T.flash4));D.escena(eg,D.T.flash4,D.pose(D.T.flash4),true);eg.restore();
  check('La foto final coincide exactamente con la pose del cuarto flash',canvasHash(exact)===fr);
  for(const t of [1,8.1,5.6,12.2])A2D.cuadro(t);check('Las cuatro fotografías permanecen congeladas al buscar y rebobinar',photos.every((c,i)=>canvasHash(D.foto(i))===ph[i])&&canvasHash(D.fotoFinal())===fr);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<=D.T.flash4;t+=.2){const P=D.pose(t);for(const [key,A] of actors){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);A.dibujar(mg,P[key],t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||(b.t<D.T.finalPose-.4&&b.bottom>596));check('Encuadre completo antes del acercamiento y cabezas dentro del retrato final',!cut.length,{samples:bounds.length,cut});
  A2D.cuadro(11.5);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.35, 1.75, 2.1, 2.5, 3.05, 3.3, 3.95, 4.3, 4.8, 5.3, 5.52, 5.6, 5.9, 6.2, 6.55, 7.2, 7.65, 8.1, 8.5, 8.95, 9.3, 9.8, 10.3, 10.85, 11.1, 11.5, 12.2, 13.25],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00018.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00018.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00018');await page.selectOption('#escena','00018.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-6.65)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00018.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00018.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
