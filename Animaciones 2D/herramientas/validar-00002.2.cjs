#!/usr/bin/env node
/* Revisión reproducible: node herramientas/validar-00002.2.cjs [chromium].
 * Requiere Playwright para Node. Comprueba contactos, alcance, líquido,
 * encuadre, fotogramas, búsqueda directa y reproducción a varios fps.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00002.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00002_2,G=Guillermo,R=Recortes,results=[];
  const check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00002')&&document.getElementById('escena').value==='00002.2');
  check('Negro absoluto en los extremos',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes inesperados a 60 fps',jumps.every(x=>Math.abs(x.t-D.T.estalla)<.2),jumps);
  // Capacidad física independiente: intersección del cuenco con el semiplano
  // bajo el borde de salida; no utiliza el cálculo del nivel del dibujante.
  const poly=[],f0=Math.asin(-19/25);for(let i=0;i<=22;i++){const a=f0+(Math.PI-2*f0)*i/22;poly.push([25*Math.cos(a),-50+25*Math.sin(a)]);}
  const area=ps=>Math.abs(ps.reduce((s,a,i)=>{const b=ps[(i+1)%ps.length];return s+a[0]*b[1]-b[0]*a[1];},0))/2;
  function capacity(angle){const nx=Math.sin(angle),ny=Math.cos(angle),b=poly.at(-1),cut=b[0]*nx+b[1]*ny,out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],va=a[0]*nx+a[1]*ny-cut,vb=b[0]*nx+b[1]*ny-cut;if(va>=0)out.push(a);if((va>=0)!==(vb>=0)){const k=va/(va-vb);out.push([a[0]+k*(b[0]-a[0]),a[1]+k*(b[1]-a[1])]);}}return area(out)/area(poly);}
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  let nonfinite=0,maxArm=0,maxLip=0,maxOverflow=0,maxIncrease=0,lastVol=D.volumen(0),maxSlide=0,footAtRest={};
  function arm(p,side){const m=p['mano'+side],h=G.tronco(p)(G[side==='Cerca'?'HOMBRO_C':'HOMBRO']),L=G[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'];const w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang);const target={x:m.x+w.x,y:m.y+w.y};const c=R.ikContinuo(h,target,L,side==='Cerca'?G.A.datos.piezas.brazo_cerca.codo:L*.5,42,m.dobla,1.08);return {c,target};}
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,p=D.pose(t);if(!finite(p))nonfinite++;
   for(const side of ['Cerca','Lejos']){const {c,target}=arm(p,side),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s);}
   if(t>=D.T.sube1&&t<=D.T.bebe1){const m=G.boca(p),h=p.manoLejos,b=G.rotP({x:G.COPA_BORDE.x*D.COPA_ESC,y:G.COPA_BORDE.y*D.COPA_ESC},h.ang);maxLip=Math.max(maxLip,Math.hypot(h.x+b.x-m.x,h.y+b.y-m.y)*p.s);}
   const v=D.volumen(t);maxIncrease=Math.max(maxIncrease,v-lastVol);lastVol=v;
   const chap=.08*Math.sin(t*5.2)*M2.campana(t,D.T.mira0,D.T.sube0+.2);maxOverflow=Math.max(maxOverflow,v-capacity(p.manoLejos.ang-chap));
   if(t>=D.T.abre1&&t<D.T.despega-.02){for(const side of ['cerca','lejos']){const q=G.aPantalla(p,p.piernas[side].tob);if(footAtRest[side])maxSlide=Math.max(maxSlide,Math.hypot(q.x-footAtRest[side].x,q.y-footAtRest[side].y));footAtRest[side]=q;}}
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});
  check('Ambas muñecas unidas al brazo',maxArm<.1,{maxGapPx:maxArm});
  check('Copa en los labios durante el trago',maxLip<.1,{maxGapPx:maxLip});
  check('Líquido dentro de la capacidad del recipiente',maxOverflow<1e-6,{maxExcessFraction:maxOverflow});
  check('Copa vacía antes de la transformación, sin rellenarse',maxIncrease<1e-9&&D.volumen(D.T.bebe1)===0,{maxIncrease});
  check('Pies apoyados durante la carga',maxSlide<.1,{maxSlidePx:maxSlide});
  const a=R.muestras(arm(D.pose(D.T.carga0+.1-1e-6),'Lejos').c,32),b=R.muestras(arm(D.pose(D.T.carga0+.1+1e-6),'Lejos').c,32);const elbowJump=Math.max(...a.map((q,i)=>Math.hypot(q.x-b[i].x,q.y-b[i].y)))*.31;
  check('Cambio de codo sin salto',elbowJump<.1,{maxCurveGapPx:elbowJump});
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let i=0;i<=86;i++){const t=.7+i*.1,p=D.pose(t),cam=D.camara(t),tb=D.temblor(t);mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256+512,256+300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);if(tb>.05)mg.translate(M2.ruido(t*47)*tb,M2.ruido(t*47+19)*tb*.7);G.dibujar(mg,p,t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}
  const cut=bounds.filter(b=>b.left<8||b.right>1015||b.top<8||b.bottom>591);check('Avatar completo hasta el despegue',!cut.length,{samples:bounds.length,cut,minTop:Math.min(...bounds.map(b=>b.top)),maxBottom:Math.max(...bounds.map(b=>b.bottom))});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  const targets=[0,.5,1.8,2.4,2.9,4.7,6.88,6.93,7.2,7.8,8.1,9.32,9.6,10.4,12.45],expected=targets.map(t=>{const e=BANCO.find(b=>b.id==='00002.2').crear();e.t=t;e.dibujar(ctx);return hash();});
  let direct=true,reverse=true;targets.forEach((t,i)=>{A2D.cuadro(t);direct=direct&&hash()===expected[i];});[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00002.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Mismo resultado al buscar, rebobinar y reproducir a 30/60/120 fps',direct&&reverse&&fpsChecks.every(x=>x.matches),{direct,reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00002.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 await page.selectOption('#escena','00002');await page.selectOption('#escena','00002.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('6.22'));
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00002.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00002.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
