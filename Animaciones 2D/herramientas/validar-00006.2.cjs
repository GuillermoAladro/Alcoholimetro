#!/usr/bin/env node
/* node herramientas/validar-00006.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa hipidos, pompas, salto, aterrizaje, encuadre y determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00006.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00006_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante el salto, sin recorrer la escena.
  A2D.cuadro(8.8);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00006')&&document.getElementById('escena').value==='00006.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  let nonfinite=0,maxArm=0,minAir=Infinity,maxTable=0;
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,p=D.pose(t);if(!finite(p)||!finite(D.estadoPinta(t)))nonfinite++;
   for(const side of ['Cerca','Lejos']){const m=p['mano'+side],h=G.tronco(p)(G[side==='Cerca'?'HOMBRO_C':'HOMBRO']),L=G[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};const c=R.ikContinuo(h,target,L,side==='Cerca'?G.A.datos.piezas.brazo_cerca.codo:L*.5,42,m.dobla,1.08),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s);}
   minAir=Math.min(minAir,p.__b.F);const glass=D.estadoPinta(t);maxTable=Math.max(maxTable,glass.y+13*Math.abs(Math.sin(glass.rot))-(D.MESA.y+2));
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Muñecas unidas durante inhalación y saltos',maxArm<.1,{maxGapPx:maxArm});
  check('Pies elevados en el salto y apoyados al aterrizar',minAir>=0&&D.botes(D.T.cima).F>100&&D.botes(D.T.aterriza).F<.001,{minAir,apex:D.botes(D.T.cima),landing:D.botes(D.T.aterriza)});
  check('Salto continuo al despegar, culminar y aterrizar',[D.T.despega,D.T.cima,D.T.caida,D.T.aterriza].every(t=>Math.abs(D.saltoGigante(t-.00001).J-D.saltoGigante(t+.00001).J)<.05));
  check('Vaso salta con el aterrizaje sin atravesar la mesa',maxTable<.001&&D.estadoPinta(D.T.aterriza+.16).dy<-14&&D.estadoPinta(11).dy===0,{maxTable});
  const subframes=[1.6001,1.6004,8.5001,8.5004],mouthErrors=subframes.map(t=>{const q=D.bocaEn(t),m=D.bocaPantalla(D.pose(t));return Math.hypot(q.x-m.x,q.y-m.y);});
  check('Boca exacta sin caché redondeada entre instantes',mouthErrors.every(x=>x<1e-8),mouthErrors);
  check('Cinco hipidos y dos intentos internos en su orden',D.HIPOS.length===5&&D.HIPOS.every((h,i)=>!i||h.t>D.HIPOS[i-1].t)&&D.T.casi1<D.T.casi2&&D.T.casi2<D.T.despega);
  check('Abre un ojo al espiar y recupera el color',D.pose(7.15).cara.ojos.d<D.pose(7.15).cara.ojos.i&&D.pose(10).rojo===0);
  check('Temblor continuo al contacto con el suelo',D.temblor(D.T.aterriza)===0&&D.temblor(D.T.aterriza+.00001)<.001&&D.temblor(D.T.aterriza+.05)>0);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<12.55;t+=.1){const p=D.pose(t),cam=D.camara(t),tb=D.temblor(t);mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(768,556);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);if(tb>.05)mg.translate(M2.ruido(t*45)*tb*.5,M2.ruido(t*45+13)*tb);G.dibujar(mg,p,t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}
  const cut=bounds.filter(b=>b.left<0||b.right>1023||b.top<0||b.bottom>599);check('Avatar completo durante todos los saltos',!cut.length,{samples:bounds.length,cut,minTop:Math.min(...bounds.map(b=>b.top)),maxBottom:Math.max(...bounds.map(b=>b.bottom))});
  A2D.cuadro(8.8);check('Pompa gigante idéntica al buscar directamente',hash()===freshBurst);
  const targets=[0,.8,1.64,2.64,3.1,3.89,5.6,6.5,7.2,7.6,8.2,8.36,8.55,8.8,8.98,9.27,9.36,9.7,10.52,11.29,12.5,13.15],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00006.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00006.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00006');await page.selectOption('#escena','00006.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-6.575)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00006.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00006.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
