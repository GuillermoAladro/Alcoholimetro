#!/usr/bin/env node
/* node herramientas/validar-00015.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, la tarta, las velas, la nata y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00015.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00015_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
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
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00011')&&document.getElementById('escena').value==='00015.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0,maxPlate=0,maxWipe=0,maxTaste=0,tipDrift=0;const planted={};let toe0=null;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s*(A.K||1));}}
   for(const side of ['cerca','lejos']){const f=D.pieDe(D.PASOS_L[side],t),q=L.aPantalla(P.l,P.l.piernas[side].tob);if(f.lev<1e-6){if(planted[side])footDrift=Math.max(footDrift,dist(q,planted[side]));planted[side]=q;}else delete planted[side];}
   const f=P.g.piernas.cerca,rot=G.rotP(G.PUNTA,f.ang),toe=G.aPantalla(P.g,{x:f.tob.x+rot.x,y:f.tob.y+rot.y});if(!toe0)toe0=toe;else tipDrift=Math.max(tipDrift,dist(toe,toe0));
   if(t<D.T.deja1+.02){const a=L.aPantalla(P.l,P.l.manoCerca),b=L.aPantalla(P.l,P.l.manoLejos),q=D.posTarta(t);maxPlate=Math.max(maxPlate,dist(a,{x:q.x+45,y:q.y+5}),dist(b,{x:q.x+2,y:q.y+11}));}
   const m=P.l.manoLejos,o=D.offsetIndice(m.mu,m.ang),tip=L.aPantalla(P.l,{x:m.x+o.x,y:m.y+o.y});
   if(t>=D.T.toca&&t<=D.T.limpia1){const k=M2.suave(M2.fase(t,D.T.toca,D.T.limpia1)),q={x:M2.lerp(D.MEJILLA[0].x,D.MEJILLA[1].x,k),y:M2.lerp(D.MEJILLA[0].y,D.MEJILLA[1].y,k)},target=G.aPantalla(P.g,G.cabeza(P.g).a(q));maxWipe=Math.max(maxWipe,dist(tip,target));}
   if(t>=D.T.prueba&&t<=D.T.prueba1){const mouth=L.aPantalla(P.l,L.boca(P.l));maxTaste=Math.max(maxTaste,dist(tip,mouth));}
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Laura camina sin deslizamiento de los pies apoyados',footDrift<.001,{maxDriftPx:footDrift});
  check('Guillermo se pone de puntillas sobre un punto de apoyo fijo',tipDrift<.001,{maxDriftPx:tipDrift});
  check('Ambas manos sostienen el plato hasta depositarlo en la mesa',maxPlate<.02&&dist(D.posTarta(D.T.deja1),D.PLATO_MESA)<.001,{maxHandGapPx:maxPlate});
  check('Índice de Laura sigue la mejilla al retirar la nata',maxWipe<.02,{maxGapPx:maxWipe});
  check('Índice con nata alcanza los labios al probarla',maxTaste<1.5,{maxGapPx:maxTaste});
  const hitP=D.pose(D.T.plaf).g,hit=G.aPantalla(hitP,G.cabeza(hitP).a(D.NARIZ)),cake=D.posTarta(D.T.plaf);check('El golpe de la cara coincide con el volumen de la tarta',hit.x>cake.x-D.TAR.r-8&&hit.x<cake.x+D.TAR.r+8&&hit.y>cake.y-D.TAR.h-15&&hit.y<cake.y+6,{nose:hit,cake});
  const candles=[0,1,2,3,4].map(i=>({i,firstOut:D.llamaVela(i,D.T.fin1+.1),firstRelit:D.llamaVela(i,D.T.enciende1+.65),secondOut:D.llamaVela(i,D.T.fin2+.05),secondRelit:D.llamaVela(i,D.T.enciende2+.65),afterImpact:D.llamaVela(i,D.T.plaf+.2)}));
  check('Cinco velas se apagan y reencienden dos veces antes del golpe',candles.every(x=>x.firstOut===0&&x.firstRelit>.9&&x.secondOut===0&&x.secondRelit>.9&&x.afterImpact===0),candles);
  check('La vela de la nariz se apaga y vuelve a encenderse',D.llamaNariz(D.T.nariz+.5)>.9&&D.llamaNariz(D.T.soplaN1+.03)===0&&D.llamaNariz(D.T.enciendeN+.2)>.9);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<D.T.fin;t+=.2){const P=D.pose(t);for(const [key,A] of actors){if(key==='l'&&t<D.T.llega)continue;mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);A.dibujar(mg,P[key],t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>596);check('Siluetas completas dentro del encuadre tras la entrada de Laura',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.rinde+.3);check('Laura cierra un solo ojo en el guiño final',end.l.cara.ojos.i>.9&&end.l.cara.ojos.d<.3);
  A2D.cuadro(9.6);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.5, 2.45, 2.8, 3.08, 3.8, 4.2, 4.6, 5.25, 5.75, 6.4, 7.05, 7.55, 8.2, 8.55, 8.9, 9.1, 9.5, 10.1, 10.45, 10.8, 11.4, 11.6, 11.9, 12.3, 12.6, 13, 13.22, 13.5, 14.2],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00015.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00015.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00011');await page.selectOption('#escena','00015.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7.125)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00015.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00015.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
