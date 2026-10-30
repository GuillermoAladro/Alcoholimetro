#!/usr/bin/env node
/* node herramientas/validar-00016.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, los trucos, los pañuelos, la moneda y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00016.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00016_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante la aparición de la paloma, sin recorrer la escena.
  A2D.cuadro(12.5);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00016')&&document.getElementById('escena').value==='00016.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0,tipDrift=0,earG=0,earL=0,scarfGrip=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,dist(e,target)*p.s*(A.K||1));}
    for(const side of ['cerca','lejos']){const f=D.pie((key==='g'?D.PASOS_G:D.PASOS_L)[side],t,key==='g'?D.TOB_G[side]:D.TOB_L-(side==='lejos'?10:0),key==='g'?46:40),q=p.piernas[side],z=A.rotP(A.PUNTA,q.ang),a=A.rotP(A.PUNTA,f.ang),toe=A.aPantalla(p,{x:q.tob.x+z.x,y:q.tob.y+z.y}),expected=A.aPantalla(p,{x:A.aHoja(p,{x:f.x,y:0}).x+a.x,y:f.y+a.y});tipDrift=Math.max(tipDrift,dist(toe,expected));}}
   if(t>=D.T.alcanza1&&t<=D.T.hurga1){const p=P.g,q=Laura.aPantalla(P.l,Laura.cabeza(P.l).a({x:1002,y:548})),h=M2.campana(t,D.T.alcanza1-.05,D.T.hurga1);earG=Math.max(earG,dist(G.aPantalla(p,D.pinzaHoja(p.manoLejos,1)),{x:q.x-4+3*Math.sin(t*30)*h,y:q.y+6}));}
   if(t>=D.T.hurgaL0&&t<=D.T.hurgaL1){const p=P.l,q=G.aPantalla(P.g,G.cabeza(P.g).a({x:985,y:560})),h=M2.campana(t,D.T.hurgaL0-.05,D.T.hurgaL1);earL=Math.max(earL,dist(L.aPantalla(p,D.pinzaHoja(p.manoLejos,D.ESC_MANO_L)),{x:q.x+3*Math.sin(t*30)*h,y:q.y+4}));}
   if(t>=D.T.agarra&&t<=D.T.suelta)scarfGrip=Math.max(scarfGrip,dist(D.puntoMano(t,P.g),G.aPantalla(P.g,D.pinzaHoja(P.g.manoLejos,1))));
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Pasos y puntillas conservan la trayectoria de apoyo de las punteras',tipDrift<.001,{maxDriftPx:tipDrift});
  check('Guillermo llega a la oreja de Laura durante el truco fallido',earG<.02,{maxGapPx:earG});check('Laura llega a la oreja de Guillermo para recuperar la moneda',earL<.02,{maxGapPx:earL});
  check('La ristra permanece en la pinza mientras se tira de ella',scarfGrip<.001,{maxGapPx:scarfGrip});
  const eps=1e-6,release=dist(D.puntoMano(D.T.suelta-eps,D.poseG(D.T.suelta-eps)),D.puntoMano(D.T.suelta+eps,D.poseG(D.T.suelta+eps))),grab=dist(D.puntoMano(D.T.agarra-eps,D.poseG(D.T.agarra-eps)),D.puntoMano(D.T.agarra+eps,D.poseG(D.T.agarra+eps)));
  check('La ristra no salta al cogerla ni al soltarla',release<.01&&grab<.01,{release,grab});
  const table=D.tabla();let monotone=true;for(let i=1;i<table.P.length;i++)if(table.P[i]+.001<table.P[i-1]||table.Q[i]+.001<table.Q[i-1]||table.Q[i]>table.P[i]+.001)monotone=false;
  check('Cinco tirones acumulan pañuelos sin perder longitud',D.TIR.length===5&&monotone&&table.total>300,{total:table.total,monotone});
  const coins=[D.T.flip0,D.T.flip1].map(t=>{const a=D.monedaEn(t-eps),b=D.monedaEn(t+eps);return{t,position:dist(a,b),width:Math.abs(a.rx-b.rx),height:Math.abs(a.ry-b.ry)};});
  check('Moneda continua en posición y tamaño al lanzar y atrapar',coins.every(x=>x.position<.01&&x.width<.01&&x.height<.01),coins);
  const o=D.origenPaloma(),p=D.poseG(D.T.pop),head=G.aPantalla(p,G.cabeza(p).a({x:800,y:300}));check('La paloma nace exactamente del pelo',dist(o,head)<.001);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<D.T.fin;t+=.2){const P=D.pose(t);for(const [key,A] of actors){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);A.dibujar(mg,P[key],t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>596);check('Siluetas de ambos personajes completas dentro del encuadre',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.guinoL+.3);check('Laura cierra un solo ojo en el guiño final',end.l.cara.ojos.d>.9&&end.l.cara.ojos.i<.3);
  A2D.cuadro(12.5);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.95, 2.35, 2.75, 3, 3.4, 3.85, 4.6, 4.95, 5.3, 5.72, 6.3, 7.1, 7.45, 7.62, 8, 8.5, 9, 9.5, 10.08, 10.4, 10.7, 11.2, 11.65, 11.92, 12.2, 12.5, 12.75, 12.95, 13.2, 13.6, 14.55],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00016.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00016.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00016');await page.selectOption('#escena','00016.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7.3)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00016.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00016.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
