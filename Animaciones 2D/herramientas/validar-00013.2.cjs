#!/usr/bin/env node
/* node herramientas/validar-00013.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, las pajitas, la guinda, el rabito y los pies y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00013.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00013_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
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
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00011')&&document.getElementById('escena').value==='00013.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,maxLip=0,footDrift=0,previousLevel=1,liquid=true;const planted={};
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s*(A.K||1));}
    for(const side of ['cerca','lejos']){const q=A.aPantalla(p,p.piernas[side].tob),k=key+side;if(planted[k])footDrift=Math.max(footDrift,Math.hypot(q.x-planted[k].x,q.y-planted[k].y));else planted[k]=q;}
    const qq=D.PAJ[key],b=A.aPantalla(p,A.cabeza(p).a(key==='g'?D.BOCA_G:D.BOCA_L)),q=D.puntaPaja(qq,t,b);if(t>=qq.eng[1]&&t<=qq.eng[2])maxLip=Math.max(maxLip,Math.hypot(q.x-b.x,q.y-b.y));}
   const v=D.nivel(t);liquid=liquid&&v>=0&&v<=1&&v<=previousLevel+1e-8;previousLevel=v;
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Cuatro pies permanecen plantados al inclinarse',footDrift<.001,{maxDriftPx:footDrift});
  check('Ambas pajitas mantienen contacto con los labios durante el sorbo',maxLip<.01,{maxGapPx:maxLip});
  check('El cóctel se vacía progresivamente y permanece vacío',liquid&&D.nivel(D.T.vacio)===0,{finalLevel:previousLevel});
  const p0=D.pose(D.T.pinza).l,g0=L.aPantalla(p0,D.pinzaHoja(p0.manoLejos)),pinzaGap=Math.hypot(g0.x-D.RABITO0.x,g0.y-D.RABITO0.y);
  check('La guinda pasa del borde a los dedos sin salto',pinzaGap<.001&&!!p0.manoLejos.objeto&&!D.pose(D.T.pinza-1e-7).l.manoLejos.objeto,{gapPx:pinzaGap});
  const p1=D.pose(D.T.muerde).l,gr=L.aPantalla(p1,D.pinzaHoja(p1.manoLejos)),a=D.balanceo(D.T.muerde),b=L.aPantalla(p1,L.boca(p1)),biteGap=Math.hypot(gr.x+Math.sin(a)*D.RABITO_L-b.x,gr.y+Math.cos(a)*D.RABITO_L-b.y);
  check('La guinda llega a la boca antes de desaparecer',biteGap<3,{gapPx:biteGap});
  const p2=D.pose(D.T.tira).l,release=L.aPantalla(p2,D.pinzaHoja(p2.manoLejos)),r0=D.rabitoEn(D.T.tira),rGap=Math.hypot(r0.x-release.x,r0.y-release.y);
  check('Rabito soltado desde la pinza y con su ángulo exacto',rGap<.001&&Math.abs(r0.ang-D.balanceo(D.T.tira))<.001&&!p2.manoLejos.objeto,{gapPx:rGap});
  let penetration=-Infinity;for(let t=D.T.tira;t<dur;t+=1/120){const r=D.rabitoEn(t);for(let i=0;i<=64;i++){const k=i/64,x=r.x+2*(1-k)*k*5+k*k*Math.sin(r.ang)*D.RABITO_L*.85,y=r.y+2*(1-k)*k*D.RABITO_L*.45+k*k*Math.cos(r.ang)*D.RABITO_L*.85;penetration=Math.max(penetration,y+2.25-D.fondoEn(x));}}
  check('Toda la curva del rabito se apoya dentro del fondo de la copa',penetration<=.05&&D.rabitoEn(12).apoyado,{maxPenetrationPx:penetration});
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<D.T.fin;t+=.2){const P=D.pose(t);for(const [key,A] of actors){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);A.dibujar(mg,P[key],t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,key,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>596);check('Siluetas completas y pelo dentro del encuadre',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.guino+.3);check('Guiño de Laura y puchero final de Guillermo',end.l.cara.ojos.d>.9&&end.l.cara.ojos.i<.3&&end.g.cara.boca.sonrisa<-.6);
  A2D.cuadro(9.6);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.5, 2.25, 2.7, 3.5, 3.95, 4.5, 4.95, 5.2, 5.55, 6.3, 6.9, 7.35, 7.65, 8.3, 8.75, 9.25, 9.8, 10.22, 10.5, 10.95, 11.3, 11.6, 12.05, 13.35],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00013.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00013.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00011');await page.selectOption('#escena','00013.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-6.7)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00013.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00013.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
