#!/usr/bin/env node
/* node herramientas/validar-00021.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, el fuego, la leche, el agua y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00021.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00021_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante el empujón del agua, sin recorrer la escena.
  A2D.cuadro(8.5);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00021')&&document.getElementById('escena').value==='00021.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=MarcosBombero,actors=[['g',G],['m',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0,grip=0,aim=0,angular=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),feet={};
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,dist(e,target)*p.s*(A.K||1));}
    for(const side of ['cerca','lejos']){const q=A.aPantalla(p,p.piernas[side].tob),k=key+side;if(key==='m'){if(!feet[k])feet[k]=q;else footDrift=Math.max(footDrift,dist(q,feet[k]));}else footDrift=Math.max(footDrift,Math.abs(q.x-D.piesG(t)[side].x));}}
   if(t>=D.T.mSube1&&t<=D.T.mSopla0)grip=Math.max(grip,dist(L.aPantalla(P.m,P.m.manoLejos),L.puntoLanza(P.m,P.m.manoCerca,20)));
   if(t>=D.T.abre+.15&&t<=D.T.cierra0){const nozzle=L.puntoLanza(P.m,P.m.manoCerca,'boca'),obj=D.objetivo(t,P.g),a=D.apuntado(nozzle,obj);aim=Math.max(aim,dist({x:nozzle.x+Math.cos(a.ang)*a.L,y:nozzle.y+Math.sin(a.ang)*a.L+.35*a.L},obj));angular=Math.max(angular,Math.abs(Math.atan2(Math.sin(nozzle.ang-a.ang),Math.cos(nozzle.ang-a.ang))));}
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Marcos conserva los apoyos y Guillermo sigue sus pasos y resbalón',footDrift<.001,{maxDriftPx:footDrift});
  check('Ambas manos agarran la misma lanza durante el barrido',grip<.001,{maxGapPx:grip});
  check('El agua sale alineada con la boquilla y alcanza el objetivo',aim<.001&&angular<.0001,{maxTargetErrorPx:aim,maxNozzleErrorRadians:angular});
  const fire=D.PRENDE.map((t,i)=>({i,before:D.llamaChupi(t-.001,i),lit:D.llamaChupi(t+.2,i),off:D.llamaChupi(D.T_APAGA.chupi[i]+.1,i)}));
  check('Los cinco chupitos prenden en orden y se apagan al recibir agua',fire.every(x=>x.before===0&&x.lit>.9&&x.off===0),fire);
  check('Servilleta, sombrilla y charcos se apagan durante el barrido',D.fuegoServ(6)>.9&&D.fuegoSomb(5)>.5&&D.fuegoServ(8.2)===0&&D.fuegoSomb(8.2)===0&&[0,1,2].every(i=>D.fuegoCharco(8.2,i)===0));
  const light=[D.T.l1,D.T.l2].map((t,i)=>{const P=D.pose(t).g,m=G.aPantalla(P,P.manoLejos),tip=D.puntaMechero(m.x,m.y,D.MECH_ANG);return dist(tip,{x:D.X_CHUPI[i]-9,y:D.BASE-22});});
  check('El mechero alcanza el borde de los dos primeros chupitos',light.every(x=>x<.01),{distancesPx:light});
  let lip=0;for(const [a,b]of [[1.15,1.45],[4.85,5.3]])for(let t=a;t<=b;t+=.02){const P=D.pose(t).m,q=L.aPantalla(P,P.manoLejos),mouth=L.aPantalla(P,L.boca(P)),inc=D.incVaso(t);let d=99;for(let k=0;k<360;k++){const th=k*Math.PI/180,x=8*Math.cos(th),y=-34+1.8*Math.sin(th);d=Math.min(d,dist(mouth,{x:q.x-3+x*Math.cos(inc)-y*Math.sin(inc),y:q.y-12+x*Math.sin(inc)+y*Math.cos(inc)}));}lip=Math.max(lip,d);}
  check('El borde del vaso toca la boca durante los dos sorbos',lip<3,{maxRimGapPx:lip});
  const pm=D.pose(D.T.mDeja-1e-7).m,q=L.aPantalla(pm,pm.manoLejos),dock=dist({x:q.x-3,y:q.y-12},{x:D.X_LECHE,y:D.BASE-4});check('Vaso continuo al apoyarlo: misma forma, posición e inclinación',dock<.001&&Math.abs(D.incVaso(D.T.mDeja))<.001,{maxOriginJumpPx:dock});
  let v=1,volume=true;for(let t=0;t<dur;t+=.02){const n=D.volumenLeche(t);if(n>v+1e-8||n<0)volume=false;v=n;}check('La leche disminuye en los sorbos y el vaso termina vacío',volume&&v===0);
  check('El pelo se moja después del impacto y permanece mojado',D.mojado(D.T.moja)===0&&D.mojado(D.T.moja+.3)===1&&D.mojado(D.T.fin)===1);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  for(let t=.8;t<D.T.fin;t+=.15){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);const cam=D.camara(t);mg.translate(512,300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);const P=D.pose(t);G.dibujar(mg,{...P.g,capaCabeza:null},t);L.dibujar(mg,P.m,t);L.rollo(mg,D.XM+112,D.SUELO+4,P.m.s*L.K);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}bounds.push({t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||b.bottom>597);check('Ambos personajes, la boquilla y el rollo de manguera caben completos',!cut.length,{samples:bounds.length,cut});
  const end=D.pose(D.T.mPulgar0+.65);check('Marcos levanta el pulgar con un solo ojo cerrado',end.m.manoLejos.dedos.pulgar>.99&&end.m.manoLejos.dedos.indice<.01&&end.m.cara.ojos.i>.9&&end.m.cara.ojos.d<.3);
  A2D.cuadro(8.5);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.15, 1.4, 1.82, 2.4, 2.92, 3.3, 3.7, 4.3, 4.8, 5.1, 5.6, 5.82, 6.2, 6.6, 6.95, 7.3, 7.7, 8.3, 8.7, 9.2, 9.8, 10.45, 11.2, 11.92, 12.3, 13.1, 14.05],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00021.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00021.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00021');await page.selectOption('#escena','00021.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7.05)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00021.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00021.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
