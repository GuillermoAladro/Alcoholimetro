#!/usr/bin/env node
/* node herramientas/validar-00004.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa moneda, golpes, caída, encuadre y determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00004.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00004_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente después del coscorrón, sin recorrer la escena.
  A2D.cuadro(8.7);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00004')&&document.getElementById('escena').value==='00004.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  let nonfinite=0,maxArm=0,maxBallBottom=0;
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,p=D.pose(t);if(!finite(p)||!finite(D.posSaco(t))||!finite(D.bolaSuelta(t)))nonfinite++;
   for(const side of ['Cerca','Lejos']){const m=p['mano'+side],h=G.tronco(p)(G[side==='Cerca'?'HOMBRO_C':'HOMBRO']),L=G[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};const c=R.ikContinuo(h,target,L,side==='Cerca'?G.A.datos.piezas.brazo_cerca.codo:L*.5,42,m.dobla,1.08),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s);}
   if(t>=D.T.zas)maxBallBottom=Math.max(maxBallBottom,D.bolaSuelta(t).y+27);
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});
  check('Muñecas unidas a ambos brazos',maxArm<.1,{maxGapPx:maxArm});
  const start=D.origenMoneda(),release=D.monedaEstado(D.T.lanza),end=D.monedaEstado(D.T.encaja),M=D.maquina();
  check('Moneda sale de la mano y entra en la ranura',Math.hypot(start.x-release.x,start.y-release.y)<.01&&Math.hypot(end.x-M.P.x-90,end.y-M.P.y-250)<.01,{start,release,end});
  check('Moneda sostenida solo antes de lanzarla',!!D.pose(D.T.lanza-.001).manoLejos.objeto&&!D.pose(D.T.lanza).manoLejos.objeto);
  const atPunch=D.pose(D.T.golpe),hand=atPunch.manoLejos,tip=G.rotP({x:14*G.JK,y:0},hand.ang),knuckle=G.aPantalla(atPunch,{x:hand.x+tip.x,y:hand.y+tip.y}),bag=D.posSaco(D.T.golpe);
  const off=G.rotP({x:knuckle.x-bag.x,y:knuckle.y-bag.y},-bag.b-Math.PI/2),surface=Math.hypot(off.x/(27*.78),off.y/(27*1.08*1.25));
  check('Puño en contacto con el saco al impactar',surface>.75&&surface<1.15,{ellipseRadius:surface,knuckle,bag});
  const beforeHead=D.pose(D.T.zas-.001),hair=G.aPantalla(beforeHead,G.cabeza(beforeHead).a({x:860,y:292})),hit=D.posSaco(D.T.zas),free=D.bolaSuelta(D.T.zas);
  check('Coscorrón alineado con la cabeza',Math.hypot(hair.x-hit.x,hair.y-hit.y-27)<.1,{hair,hit});
  check('Bola liberada desde su posición y orientación exactas',Math.hypot(free.x-hit.x,free.y-hit.y)<.01&&Math.abs(free.rot-hit.b-Math.PI/2)<.01,{hit,free});
  check('Bola rebota y rueda sin atravesar el suelo',maxBallBottom<=560.01,{maxBallBottom});
  const rollA=D.bolaSuelta(11.5),rollB=D.bolaSuelta(12),rotationError=Math.abs((rollB.rot-rollA.rot)-(rollB.x-rollA.x)/27);
  check('Giro de rodadura proporcional al recorrido',rotationError<.001,{rotationError});
  check('999 estable durante la lectura del resultado',[7.85,7.98,8.05,8.19].every(t=>D.lectura(t)===999));
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<12.3;t+=.15){const p=D.pose(t),cam=D.camara(t),tb=D.temblor(t);mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256+512,256+300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);if(tb>.05)mg.translate(M2.ruido(t*45)*tb,M2.ruido(t*45+13)*tb*.7);G.dibujar(mg,p,t);D.dibujarMaquina(mg,t);D.dibujarSaco(mg,t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}
  const cut=bounds.filter(b=>b.left<0||b.right>1023||b.top<0||b.bottom>599);check('Personaje, máquina y saco completos',!cut.length,{samples:bounds.length,cut,minTop:Math.min(...bounds.map(b=>b.top)),maxBottom:Math.max(...bounds.map(b=>b.bottom))});
  const edges=[6.9,7.7,8.18].map(t=>{A2D.cuadro(t);const d=ctx.getImageData(0,0,1024,600).data;return {t,lit:[0,1023,1024*599,1024*600-1].map(i=>d[i*4]+d[i*4+1]+d[i*4+2])};});check('El fondo cubre el encuadre ampliado',edges.every(e=>e.lit.every(x=>x>0)),edges);
  A2D.cuadro(8.7);check('Caída idéntica al buscar directamente',hash()===freshBurst);
  const targets=[0,.8,1.8,2.05,2.25,2.5,3.4,4.3,5.2,6.2,6.38,6.9,7.7,8.18,8.2,8.7,9.65,10.5,11.4,13.25],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00004.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00004.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00004');await page.selectOption('#escena','00004.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-6.625)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00004.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00004.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
