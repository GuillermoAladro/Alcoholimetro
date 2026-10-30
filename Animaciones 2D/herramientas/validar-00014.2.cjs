#!/usr/bin/env node
/* node herramientas/validar-00014.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, los agarres, las pisadas y la rosa y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00014.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00014_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
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
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00011')&&document.getElementById('escena').value==='00014.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0,contacts=0,maxContact=0;const planted={};
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s*(A.K||1));}
    for(const side of ['cerca','lejos']){const plan=key==='g'?D.PASOS_G:D.PASOS_L,dp=D.DIP[key].pies[side],swing=plan[side].some(a=>t>=a[0]&&t<=a[1])||(t>=dp.t0&&t<=dp.t1)||(key==='l'&&side==='lejos'&&[D.T.pisa1,D.T.pisa2].some(tp=>t>=tp+.86&&t<=tp+1.35));const q=A.aPantalla(p,p.piernas[side].tob),k=key+side;if(!swing){if(planted[k])footDrift=Math.max(footDrift,dist(q,planted[k]));planted[k]=q;}else delete planted[k];}}
   const a=G.aPantalla(P.g,P.g.manoLejos),b=L.aPantalla(P.l,P.l.manoLejos);
   if(t<D.T.manda-.15){maxContact=Math.max(maxContact,dist(a,D.deHoja(L,P.l,{x:365,y:510})),dist(b,D.deHoja(G,P.g,{x:352,y:330})));contacts++;}
   if(t>=D.T.manda+.25&&t<=D.T.prepara){const q=D.enMedio(P);maxContact=Math.max(maxContact,dist(a,{x:q.x-4,y:q.y}),dist(b,{x:q.x+5,y:q.y-2}));contacts++;}
   if(t>=D.T.inclina+.2){const H=G.cabeza(P.g);maxContact=Math.max(maxContact,dist(a,G.aPantalla(P.g,H.a({x:720,y:475}))),dist(b,D.deHoja(G,P.g,{x:290,y:640})));contacts++;}
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Pies apoyados sin deslizar durante el baile y la inclinación',footDrift<.001,{maxDriftPx:footDrift});
  check('Contactos de cintura, hombro, manos, espalda y frente siguen a los personajes',maxContact<.001,{samples:contacts,maxGapPx:maxContact});
  const p0=D.pose(D.T.rosa).g,H=G.cabeza(p0),q=G.aPantalla(p0,H.a(D.ROSA_BOCA)),r0=D.rosaEn(D.T.rosa);check('Rosa liberada desde su posición, ángulo y escala exactos',dist(q,r0)<.001&&Math.abs(r0.a-H.ang-D.ROSA_BOCA.a)<.001&&Math.abs(r0.k-H.kx*p0.s*D.ROSA_ESC)<.001);
  const rc=document.createElement('canvas');rc.width=1024;rc.height=650;const rg=rc.getContext('2d',{willReadFrequently:true});let bottom=0,roseFrames=0;
  for(let t=D.T.rosa;t<=dur;t+=.06){const r=D.rosaEn(t);rg.clearRect(0,0,1024,650);D.rosa(rg,r.x,r.y,r.a,r.k,t);const d=rg.getImageData(0,0,1024,650).data;for(let y=0;y<650;y++)for(let x=0;x<1024;x++)if(d[(y*1024+x)*4+3]>8)bottom=Math.max(bottom,y);roseFrames++;}
  check('La silueta completa de la rosa rebota y descansa sobre el suelo',bottom<=D.SUELO+1,{renderedSamples:roseFrames,maxBottom:bottom,floor:D.SUELO});
  const rr=D.rosaEn(D.T.rosa),tc=D.T.rosa+rr.contacto,ra=D.rosaEn(tc-1e-7),rb=D.rosaEn(tc+1e-7);check('La rosa no salta al pasar de caída a rebote',dist(ra,rb)<.001&&Math.abs(ra.a-rb.a)<.001,{gapPx:dist(ra,rb)});
  const stomp=[D.T.pisa1,D.T.pisa2].map(tp=>{const p=D.pose(tp),pa=D.pose(tp+.35),pb=D.pose(tp+.7),baseY=L.aPantalla(p.l,p.l.piernas.lejos.tob).y;return{t:tp,gX:G.aPantalla(p.g,p.g.piernas.lejos.tob).x,lauraStable:Math.abs(L.aPantalla(pa.l,pa.l.piernas.lejos.tob).y-baseY)<.001&&Math.abs(L.aPantalla(pb.l,pb.l.piernas.lejos.tob).y-baseY)<.001};});check('Laura retira el pie después de que Guillermo lo libere',stomp.every(x=>x.lauraStable),stomp);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<D.T.fin;t+=.2){const P=D.pose(t);for(const [key,A] of actors){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);A.dibujar(mg,P[key],t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>596);check('Siluetas completas y pelo dentro del encuadre',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.guino+.5);check('Tango final sostenido y guiño de Laura',end.g.torso<-.9&&end.l.torso>.9&&end.l.cara.ojos.i>.9&&end.l.cara.ojos.d<.3);
  A2D.cuadro(9.6);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.5, 2.5, 3, 3.2, 3.85, 4.75, 5, 5.6, 5.9, 6.25, 6.7, 7, 7.5, 7.8, 8.2, 8.5, 8.8, 9.1, 9.45, 9.7, 10.1, 10.6, 11.55, 12, 13, 14.15],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00014.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00014.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00011');await page.selectOption('#escena','00014.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7.1)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00014.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00014.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
