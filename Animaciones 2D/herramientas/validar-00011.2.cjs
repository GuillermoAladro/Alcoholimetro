#!/usr/bin/env node
/* node herramientas/validar-00011.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa el pulso, los contactos con la mesa, la copa, el vuelo, el suelo y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00011.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00011_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
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
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00011')&&document.getElementById('escena').value==='00011.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,maxGrip=0,maxStraw=0,minElbow=Infinity,maxElbow=-Infinity,previousLevel=1,liquid=true;
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,Math.hypot(e.x-target.x,e.y-target.y)*p.s*(A.K||1));}
    if(t>=D.T.agarra&&t<D.DESPEGA){const {target,c}=curva(A,p,key,'Lejos'),w=A.aPantalla(p,target),expected=D.munecaAgarre(D.agarre(t),key==='g'?D.MG:D.ML);maxGrip=Math.max(maxGrip,Math.hypot(w.x-expected.x,w.y-expected.y));const elbow=Math.max(...R.muestras(c,32).map(q=>A.aPantalla(p,q).y));minElbow=Math.min(minElbow,elbow);maxElbow=Math.max(maxElbow,elbow);}}
   if((t>=D.T.sorbe0&&t<=D.T.sorbe1)||(t>=D.T.sorbe2&&t<=D.T.sorbe3)){const p=P.l,m=p.manoCerca,a=L.aPantalla(p,{x:m.x+D.PAJITA.x*L.JK,y:m.y+D.PAJITA.y*L.JK}),b=L.aPantalla(p,L.boca(p));maxStraw=Math.max(maxStraw,Math.hypot(a.x-b.x,a.y-b.y));}
   const level=D.nivelVaso(t);liquid=liquid&&level>=0&&level<=1&&level<=previousLevel+.000001;previousLevel=level;
  }
  check('Geometría finita de ambos personajes a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Muñecas siguen la posición y el giro del agarre compartido',maxGrip<.01,{maxGapPx:maxGrip});
  check('Codos mantienen su apoyo durante el pulso y el golpe',minElbow>D.TY-6&&maxElbow<D.TY,{minCenterlineY:minElbow,maxCenterlineY:maxElbow,tableY:D.TY});
  check('Pajita en contacto con la boca durante ambos sorbos',maxStraw<.01,{maxGapPx:maxStraw});check('Bebida disminuye sin rellenarse ni salir del vaso',liquid,{finalLevel:previousLevel});
  const glass=[D.T.vasoCoge+.001,D.T.vasoDeja-.001,D.T.copa0+.001].map(t=>{const p=D.pose(t).l,c=L.aPantalla(p,p.manoCerca);return{t,gap:Math.hypot(c.x-D.VASO_MESA.x,c.y+D.VASO.abajo*D.ESC_VASO-D.VASO_MESA.y),held:p.vasoEnMano,object:!!p.manoCerca.objeto};});
  check('Copa pasa entre mesa y mano sin salto ni duplicación',glass.every(x=>x.gap<.01&&x.held&&x.object)&&!D.pose(D.T.vasoDeja+.001).l.vasoEnMano,glass);
  const counts=[D.T.tres+.1,D.T.dos+.1,D.T.uno+.1].map(t=>Object.values(D.pose(t).g.manoCerca.dedos).filter(x=>x>.9).length);check('Cuenta atrás visible de tres, dos y un dedo',counts.join(',')==='3,2,1',counts);
  const a=D.pose(D.DESPEGA-1e-7),b=D.pose(D.DESPEGA+1e-7),release=[];
  for(const [key,A] of actors)for(const side of ['Cerca','Lejos']){let p=A.aPantalla(a[key],a[key]['mano'+side]),q=A.aPantalla(b[key],b[key]['mano'+side]);if(key==='g'){p=D.enVuelo(a.g,p);q=D.enVuelo(b.g,q);}release.push({key,side,gap:Math.hypot(p.x-q.x,p.y-q.y)});}
  check('Liberación del agarre sin teletransportar las manos',release.every(x=>x.gap<.2)&&b.g.manoLejos.puno===1&&b.l.manoLejos.puno===1,release);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[],floor=[];
  function measure(A,p,t,camera){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);if(camera){const c=D.camara(t);mg.translate(512,300);mg.scale(c.k,c.k);mg.translate(-c.x,-c.y);const tb=(t>=D.T.zas?7*Math.exp(-(t-D.T.zas)*7)*M2.suave(M2.fase(t,D.T.zas,D.T.zas+.04)):0)+(t>=D.T.aterriza?5*Math.exp(-(t-D.T.aterriza)*8)*M2.suave(M2.fase(t,D.T.aterriza,D.T.aterriza+.04)):0);if(tb>.05)mg.translate(M2.ruido(t*45)*tb,M2.ruido(t*45+13)*tb*.7);}
   if(A===G&&p.vuelo.k>0){const o=G.aPantalla(p,p.pelvis),v=p.vuelo;mg.translate(o.x+v.dx,o.y+v.dy);mg.rotate(v.phi);mg.translate(-o.x,-o.y);}A.dibujar(mg,p,t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return{t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256};}
  for(let t=.8;t<D.T.fin;t+=.15){const P=D.pose(t);bounds.push({...measure(L,P.l,t,true),actor:'Laura'});if(t<D.DESPEGA||t>=D.T.aterriza)bounds.push({...measure(G,P.g,t,true),actor:'Guillermo'});if(t>=D.T.aterriza)floor.push(measure(G,P.g,t,false));}
  const cut=bounds.filter(b=>b.left<0||b.right>1023||b.top<0||b.bottom>599);check('Ambos personajes dentro de plano salvo el vuelo deliberado',!cut.length,{samples:bounds.length,cut});check('Cuerpo y brazos de Guillermo no atraviesan el suelo tras caer',floor.every(x=>x.bottom<=D.SUELO+1),{maxBottom:Math.max(...floor.map(x=>x.bottom)),floor:D.SUELO});
  const end=D.pose(D.T.guino+.2);check('Rendición de Guillermo y guiño real de Laura',end.g.cara.espiral>.9&&end.g.manoLejos.dedos.indice>.9&&end.l.cara.ojos.i>.9&&end.l.cara.ojos.d<.3);
  A2D.cuadro(9.6);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0,.8,1,1.75,2.15,2.35,2.6,2.9,3.2,3.45,3.95,4.25,4.7,5.35,6,7,7.8,8.2,8.26,8.4,8.62,9,9.2,9.3,9.6,10,10.75,11.25,11.8,12.1,13.7],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00011.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00011.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00011');await page.selectOption('#escena','00011.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-6.875)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00011.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00011.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
