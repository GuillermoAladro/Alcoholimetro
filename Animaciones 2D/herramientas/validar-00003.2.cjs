#!/usr/bin/env node
/* node herramientas/validar-00003.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los cuatro soplidos, contactos, lectura, encuadre y determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00003.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00003_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo tras cargar la página: directamente después de explotar,
  // sin haber pintado nunca el globo inflado.
  A2D.cuadro(7.3);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00003')&&document.getElementById('escena').value==='00003.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Único corte permitido: el estallido del globo',jumps.every(x=>x.t>=D.T.explota&&x.t<=D.T.explota+.1),jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  let nonfinite=0,maxArm=0,maxLip=0,maxDecrease=0,lastRead=0,maxSlide=0,feet={},lipSamples=0;
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,p=D.pose(t);if(!finite(p))nonfinite++;
   for(const side of ['Cerca','Lejos']){const m=p['mano'+side],h=G.tronco(p)(G[side==='Cerca'?'HOMBRO_C':'HOMBRO']),L=G[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};const c=R.ikContinuo(h,target,L,side==='Cerca'?G.A.datos.piezas.brazo_cerca.codo:L*.5,42,m.dobla,1.08),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s);}
   if(t<D.T.explota&&D.T.soplos.some(([a,b])=>t>=a&&t<=b)){const geo=D.geometriaGlobo(t,p),m=G.aPantalla(p,G.boca(p));maxLip=Math.max(maxLip,Math.hypot(geo.base.x-m.x,geo.base.y-m.y));lipSamples++;}
   const read=D.lectura(t);maxDecrease=Math.max(maxDecrease,lastRead-read);lastRead=read;
   for(const side of ['cerca','lejos']){const q=G.aPantalla(p,p.piernas[side].tob);if(feet[side])maxSlide=Math.max(maxSlide,Math.hypot(q.x-feet[side].x,q.y-feet[side].y));feet[side]=q;}
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});
  check('Muñecas unidas a ambos brazos',maxArm<.1,{maxGapPx:maxArm});
  check('Boquilla en contacto durante los cuatro soplidos',maxLip<.1,{maxGapPx:maxLip,samples:lipSamples});
  const breath=D.T.soplos.slice(0,3).map(([a,b],i)=>{const t=(b+D.T.soplos[i+1][0])/2,p=D.pose(t),g=D.geometriaGlobo(t,p),m=G.aPantalla(p,G.boca(p));return {t,gapPx:Math.hypot(g.base.x-m.x,g.base.y-m.y),readingChange:D.lectura(D.T.soplos[i+1][0])-D.lectura(b)};});
  check('Se aparta para coger aire sin aumentar la lectura',breath.every(x=>x.gapPx>4&&x.readingChange===0),breath);
  const blows=D.T.soplos.map(([a,b])=>({start:a,end:b,radiusStart:D.radio(a),radiusEnd:D.radio(b),readingStart:D.lectura(a),readingEnd:D.lectura(b)}));
  check('Cuatro inflados con lectura creciente de 0 a 2,5',blows.length===4&&blows.every(x=>x.radiusEnd>x.radiusStart&&x.readingEnd>x.readingStart)&&maxDecrease===0&&D.lectura(D.T.explota)===2.5,{blows,maxDecrease});
  check('Verde al inicio y rojo al final',D.colorLectura(0)==='rgb(46,204,64)'&&D.colorLectura(2.5)==='rgb(255,32,32)',{start:D.colorLectura(0),end:D.colorLectura(2.5)});
  check('Pies apoyados sin deslizar',maxSlide<.1,{maxSlidePx:maxSlide});
  // Se dibujan el avatar y el globo en una superficie mayor para medir el
  // encuadre real, incluyendo la curva de la goma y las piezas transparentes.
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  const times=[];for(let t=.8;t<7.15;t+=.075)times.push(t);times.push(7.149);for(let t=7.3;t<=11.4;t+=.2)times.push(t);
  for(const t of times){const p=D.pose(t),cam=D.camara(t),tb=D.temblor(t);mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256+512,256+300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);if(tb>.05)mg.translate(M2.ruido(t*45)*tb,M2.ruido(t*45+13)*tb*.7);const marco=mg.getTransform();p.manoCerca.objeto=gg=>{gg.save();gg.setTransform(marco);D.dibujarGlobo(gg,t,p);gg.restore();};G.dibujar(mg,p,t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}
  const cut=bounds.filter(b=>b.left<8||b.right>1015||b.top<8||(b.t<8.5&&b.bottom>591));check('Globo completo al inflar y cara completa en el acercamiento final',!cut.length,{samples:bounds.length,cut,minTop:Math.min(...bounds.map(b=>b.top)),maxBottomBeforeCloseup:Math.max(...bounds.filter(b=>b.t<8.5).map(b=>b.bottom))});
  A2D.cuadro(7.3);check('Estallido idéntico sin dibujar antes el globo',hash()===freshBurst);
  const targets=[0,.8,1.5,1.95,2.2,2.85,3.1,4.1,4.4,5.5,5.9,7.14,7.15,7.3,7.8,8.3,9.5,11,12.45],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00003.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00003.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 await page.selectOption('#escena','00003');await page.selectOption('#escena','00003.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('6.22'));
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00003.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 const source=fs.readFileSync(path.join(ROOT,'escenas/00003.2 Guillermo y el globo.js'),'utf8');report.results.push({name:'Unidad g/L en el texto del globo',passed:source.includes('" g/L"')&&!source.includes('g/cl3')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00003.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
