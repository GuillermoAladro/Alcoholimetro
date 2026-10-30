#!/usr/bin/env node
/* node herramientas/validar-00009.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa pisadas, equilibrio, dedo en el ojo, caída y determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00009.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00009_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante el contacto del dedo con el ojo, sin recorrer la escena.
  A2D.cuadro(9.5);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00009')&&document.getElementById('escena').value==='00009.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  let nonfinite=0,maxArm=0,maxFoot=0,planted=0;
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,p=D.pose(t);if(!finite(p))nonfinite++;
   for(const side of ['Cerca','Lejos']){const m=p['mano'+side],h=G.tronco(p)(G[side==='Cerca'?'HOMBRO_C':'HOMBRO']),L=G[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};const c=R.ikContinuo(h,target,L,side==='Cerca'?G.A.datos.piezas.brazo_cerca.codo:L*.5,42,m.dobla,1.08),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s);}
   if(t>=.8&&t<D.T.pata0)for(const side of ['cerca','lejos']){const f=D.pie(side,t);if(f.arco===0){const q=p.piernas[side],pivot=q.ang>0?G.PUNTA:G.TALON,rot=G.rotP(pivot,q.ang),actual=G.aPantalla(p,{x:q.tob.x+rot.x,y:q.tob.y+rot.y}),expected={x:f.x+pivot.x*p.s,y:D.SUELO+(D.TOB_Y[side]-G.SUELO+pivot.y)*p.s};maxFoot=Math.max(maxFoot,Math.hypot(actual.x-expected.x,actual.y-expected.y));planted++;}}
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Muñecas unidas al equilibrarse y retirar la mano',maxArm<.1,{maxGapPx:maxArm});
  check('Pies de apoyo sin deslizamiento en la llegada y en la línea',maxFoot<.01,{samples:planted,maxGapPx:maxFoot});
  const p=D.pose(D.T.pincha),m=p.manoLejos,tip=G.rotP({x:D.INDICE.x*G.JK,y:D.INDICE.y*G.JK},m.ang),eye=G.cabeza(p).a(D.OJO_I),gap=Math.hypot(m.x+tip.x-eye.x,m.y+tip.y-eye.y)*p.s;
  check('Índice toca el ojo con la inercia de cabeza aplicada',gap<.01,{gapPx:gap});
  const coja=D.pose(D.T.pata1),stand=D.pie('lejos',D.T.pata1);check('Pie elevado y pie de apoyo durante la prueba de equilibrio',coja.piernas.cerca.tob.y<D.TOB_Y.cerca-25&&stand.arco===0);
  const eps=.00001,a=D.desliza(D.T.culo-eps),b=D.desliza(D.T.culo),c=D.desliza(D.T.culo+eps),v0=(b-a)/eps,v1=(c-b)/eps;check('Deslizamiento continuo al caer de culo',Math.abs(v0-v1)<.1,{speedBefore:v0,speedAfter:v1});
  const shoe=document.createElement('canvas');shoe.width=180;shoe.height=180;const sh=shoe.getContext('2d',{willReadFrequently:true}),shoes=[];
  for(let t=13.35;t<=13.85;t+=.02){const z=D.zapatoVuelve(t);sh.setTransform(1,0,0,1,0,0);sh.clearRect(0,0,180,180);sh.translate(90,90);sh.rotate(z.rot);sh.scale(.31,.31);R.pieza(sh,G.A,'zapato',G.A.datos.piezas.zapato.pivote);const d=sh.getImageData(0,0,180,180).data;let bottom=0;for(let y=0;y<180;y++)for(let x=0;x<180;x++)if(d[(y*180+x)*4+3]>8)bottom=Math.max(bottom,y);shoes.push({t,bottom:z.y+bottom-90});}
  check('Zapatilla de regreso sin atravesar el asfalto',shoes.every(x=>x.bottom<=D.SUELO+2),{maxBottom:Math.max(...shoes.map(x=>x.bottom)),floor:D.SUELO});
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=2.35;t<11.86;t+=.12){const p=D.pose(t),cam=D.camara(t),tb=0;mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(768,556);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);if(tb>.05)mg.translate(M2.ruido(t*45)*tb,M2.ruido(t*45+13)*tb*.7);G.dibujar(mg,p,t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}
  const cut=bounds.filter(b=>b.left<0||b.right>1023||b.top<0||b.bottom>599);check('Personaje completo durante las pruebas de equilibrio',!cut.length,{samples:bounds.length,cut,minTop:Math.min(...bounds.map(b=>b.top))});
  A2D.cuadro(9.5);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0,.8,2.35,2.8,3.4,4.15,4.6,5.6,6,7.15,7.55,8,8.6,9,9.5,9.7,10.2,10.8,11.35,11.85,12.06,12.26,12.6,13,13.3,13.6,13.95],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00009.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00009.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00009');await page.selectOption('#escena','00009.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00009.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00009.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
