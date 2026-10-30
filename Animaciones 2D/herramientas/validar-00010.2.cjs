#!/usr/bin/env node
/* node herramientas/validar-00010.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa el baile, los apoyos del moonwalk, el ritmo, las luces y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00010.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00010_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante la transición al giro de manos, sin recorrer la escena.
  A2D.cuadro(9.35);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00010')&&document.getElementById('escena').value==='00010.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  let nonfinite=0,maxArm=0,maxFoot=0,planted=0,maxStepJump=0;
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,p=D.pose(t);if(!finite(p)||!finite(D.bolaPos(t)))nonfinite++;
   for(const side of ['Cerca','Lejos']){const m=p['mano'+side],h=G.tronco(p)(G[side==='Cerca'?'HOMBRO_C':'HOMBRO']),L=G[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};const c=R.ikContinuo(h,target,L,side==='Cerca'?G.A.datos.piezas.brazo_cerca.codo:L*.5,42,m.dobla,1.08),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s);}
   for(const side of ['cerca','lejos']){const f=D.pies(t)[side];if(f.alza<.0001){const q=p.piernas[side],pivot=q.ang>0?G.PUNTA:G.TALON,rot=G.rotP(pivot,q.ang),actual=G.aPantalla(p,{x:q.tob.x+rot.x,y:q.tob.y+rot.y}),expected={x:f.x+pivot.x*p.s,y:D.SUELO+(D.TOB_Y[side]-G.SUELO+pivot.y)*p.s};maxFoot=Math.max(maxFoot,Math.hypot(actual.x-expected.x,actual.y-expected.y));planted++;}}
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Muñecas unidas durante toda la coreografía',maxArm<.1,{maxGapPx:maxArm});
  let minReach=Infinity;for(let t=D.T.cadera0+.2;t<D.T.moon0-.25;t+=1/120){const p=D.pose(t),m=p.manoLejos,h=G.tronco(p)(G.HOMBRO),w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang);minReach=Math.min(minReach,Math.hypot(m.x+w.x-h.x,m.y+w.y-h.y));}
  check('Giro de manos sin plegar la muñeca sobre el hombro',minReach>105,{minWristShoulderDistance:minReach});
  check('Talón y punta conservan su apoyo mientras gira el pie',maxFoot<.01,{samples:planted,maxGapPx:maxFoot});
  const phase=[];for(let k=0;k<8;k++){const t=D.T.moon0+k*D.MW.P,side=k%2===0?'cerca':'lejos',a=D.moonwalk(t+.03)[side],b=D.moonwalk(t+D.MW.P-.03)[side];phase.push({k,side,drift:Math.abs(a.x-b.x)});for(const side of ['cerca','lejos']){const a=D.pose(t-.00001),b=D.pose(t+.00001),qa=G.aPantalla(a,a.piernas[side].tob),qb=G.aPantalla(b,b.piernas[side].tob);maxStepJump=Math.max(maxStepJump,Math.hypot(qa.x-qb.x,qa.y-qb.y));}}
  check('Moonwalk con punta fija y alternancia sin saltos de posición',phase.every(x=>x.drift<.01)&&maxStepJump<.02,{phase,maxBoundaryGapPx:maxStepJump});
  const beats=[];for(let n=1;n<20;n++){const t=D.M0+n*D.BEAT;beats.push({t,peak:D.golpe(t),valley:D.golpe(t+D.BEAT/2)});}check('Pulso visual sincronizado a 120 por minuto',beats.every(x=>Math.abs(x.peak-1)<.00001&&Math.abs(x.valley)<.00001),{periodSeconds:D.BEAT,samples:beats.length});
  const ballEvents=[D.T.baja0,D.T.baja1,D.T.gira,D.T.gira+.9],continuity=ballEvents.map(t=>{const a=D.bolaPos(t-.00001),b=D.bolaPos(t+.00001);return {t,positionGap:Math.hypot(a.x-b.x,a.y-b.y),rotationGap:Math.abs(D.giro(t+.00001)-D.giro(t-.00001))};});
  check('Bola y giro continuos al bajar, asentarse y arrancar',continuity.every(x=>x.positionGap<.02&&x.rotationGap<.001),continuity);
  check('Foco después de bajar la bola y reflejos antes del baile',D.T.baja1<D.T.foco&&D.T.foco<D.T.gira&&D.T.gira<D.M0&&D.focoK(D.T.baja1)===0);
  const p=D.pose(D.T.guino+.15);check('Guiño y sonrisa al finalizar el giro de manos',p.cara.ojos.i>.9&&p.cara.ojos.d<.9&&p.cara.boca.sonrisa>.8);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  const measure=t=>{mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);G.dibujar(mg,D.pose(t),t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return {t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256};};
  for(let t=.8;t<11.51;t+=.12)bounds.push(measure(t));const cut=bounds.filter(b=>b.left<0||b.right>1023||b.top<0||b.bottom>599);check('Coreografía dentro de plano hasta la salida deliberada',!cut.length,{samples:bounds.length,cut});
  const end=measure(D.T.fin);check('Sale por la izquierda antes del apagado final',end.right<0,end);
  A2D.cuadro(9.35);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0,.8,1.3,2,2.12,2.7,3.2,4.2,4.7,5.2,6.2,6.7,7.2,7.7,8.2,8.7,9.2,9.35,9.7,10.2,10.45,10.7,11.2,11.7,12.2,12.7,13.1,13.55],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00010.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00010.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00010');await page.selectOption('#escena','00010.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-6.8)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00010.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00010.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
