#!/usr/bin/env node
/* node herramientas/validar-00017.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, los dardos, sus contactos, los brazos y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00017.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00017_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante el rebote del dardo, sin recorrer la escena.
  A2D.cuadro(10.3);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00017')&&document.getElementById('escena').value==='00017.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0,lick=0,pickup=0,attached=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),foot0={};
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,dist(e,target)*p.s*(A.K||1));}
    for(const side of ['cerca','lejos']){if(key==='g'&&side==='cerca'&&D.pataCoja(t)>0)continue;const q=p.piernas[side],a=A.rotP(A.TALON,q.ang),heel=A.aPantalla(p,{x:q.tob.x+a.x,y:q.tob.y+a.y}),k=key+side;if(!foot0[k])foot0[k]=heel;else footDrift=Math.max(footDrift,dist(heel,foot0[k]));}}
   if(t>=D.T.lame&&t<=D.T.viento){const p=P.g,o=D.offsetIndice(p.manoLejos);lick=Math.max(lick,dist(G.boca(p),{x:p.manoLejos.x+o.x,y:p.manoLejos.y+o.y})*p.s);}
   for(let j=0;j<3;j++){const t0=D.T.coge[j];if(t>=t0-.06&&t<=t0+.08){const a=D.agarre(L,P.l,P.l.manoCerca),b=D.agarre(L,P.l,P.l.manoLejos),f=D.ABANICO[j];pickup=Math.max(pickup,dist(b,{x:a.x+f.dx,y:a.y+f.dy}));}
    if(t>=D.T.clava[j])attached=Math.max(attached,dist(D.dardoLaura(j,t),D.aDiana(D.BLANCO[j],t)));}
   if(t>=D.T.pelo)attached=Math.max(attached,dist(D.dardoG(t),D.clavoPelo(t)));
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Pies apoyados y talón de los golpecitos sin deslizamiento',footDrift<.001,{maxDriftPx:footDrift});
  check('La punta del índice llega a la boca al humedecerlo',lick<.01,{maxGapPx:lick});
  check('Laura recoge los tres dardos de la otra mano',pickup<.03,{maxGapPx:pickup});
  check('Los dardos clavados siguen a la diana y al pelo',attached<.001,{maxGapPx:attached});
  const eps=1e-6,angle=(a,b)=>Math.abs(Math.atan2(Math.sin(b-a),Math.cos(b-a))),events=[];
  for(let i=0;i<3;i++)for(const t of [D.T.coge[i]-.06,D.T.coge[i]+.08,D.T.sueltaL[i],D.T.clava[i]]){const a=D.dardoLaura(i,t-eps),b=D.dardoLaura(i,t+eps);events.push({actor:'l',i,t,position:dist(a,b),angle:angle(a.a,b.a)});}
  for(const t of [D.T.suelta,D.T.lampara,D.T.pelo]){const a=D.dardoG(t-eps),b=D.dardoG(t+eps);events.push({actor:'g',t,position:dist(a,b),angle:angle(a.a,b.a)});}
  check('Recogidas, sueltas, rebote y clavados continuos',events.every(x=>x.position<.02&&x.angle<.002),events);
  check('Tres aciertos junto al centro de la diana',D.BLANCO.length===3&&D.BLANCO.every(q=>Math.hypot(q.x,q.y)<5));
  check('El rebote coincide con el borde de la lámpara',dist(D.dardoG(D.T.lampara),D.enLampara(D.T.lampara,D.IMPACTO_LAMP))<.001);
  const ac=document.createElement('canvas'),dc=document.createElement('canvas');ac.width=dc.width=1024;ac.height=dc.height=600;const ag=ac.getContext('2d',{willReadFrequently:true}),dg=dc.getContext('2d',{willReadFrequently:true});let collision=0;
  for(let t=D.T.suelta;t<=D.T.pelo;t+=1/120){ag.clearRect(0,0,1024,600);dg.clearRect(0,0,1024,600);L.dibujar(ag,D.poseL(t),t);const d=D.dardoG(t);D.dardo(dg,d.x,d.y,d.a,D.ESC_G,['#fff','#fff']);const a=ag.getImageData(0,0,1024,600).data,b=dg.getImageData(0,0,1024,600).data;for(let j=3;j<a.length;j+=4)if(a[j]>8&&b[j]>8)collision++;}
  check('El dardo completo pasa por encima de Laura sin tocarla',collision===0,{overlappingPixels:collision});
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<D.T.fin;t+=.2){const P=D.pose(t);for(const [key,A] of actors){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);if(cam.tb>.05)mg.translate(M2.ruido(t*45)*cam.tb,M2.ruido(t*45+13)*cam.tb*.7);A.dibujar(mg,P[key],t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>596);check('Siluetas de ambos personajes completas dentro del encuadre',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.camara+.6);check('El gesto final mantiene el pulgar arriba y la risa de Laura',end.g.manoLejos.dedos.pulgar>.95&&end.g.manoLejos.dedos.indice<.1&&end.l.cara.boca.sonrisa>.8);
  A2D.cuadro(10.3);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.56, 1.8, 2.3, 2.71, 2.95, 3.5, 3.82, 4.06, 4.6, 5.5, 6.25, 6.8, 7.25, 7.8, 8.15, 8.8, 9.2, 9.6, 9.7, 9.9, 10.08, 10.3, 10.6, 10.95, 11.4, 12, 12.6, 13.2, 14.4],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00017.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00017.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00017');await page.selectOption('#escena','00017.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7.225)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00017.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00017.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
