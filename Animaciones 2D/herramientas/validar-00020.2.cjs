#!/usr/bin/env node
/* node herramientas/validar-00020.2.cjs [chromium]; requiere Playwright para Node.
 * Revisa los brazos, las rondas, los bolsillos, la tarjeta y los apoyos y el determinismo.
 */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const options={args:['--allow-file-access-from-files']};if(process.argv[2]){options.executablePath=process.argv[2];options.args.push('--no-sandbox','--no-zygote','--single-process','--disable-gpu','--disable-software-rasterizer');}
 const br=await chromium.launch(options),page=await br.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00020.2&pausa');await page.waitForFunction(()=>A2D.listo());
 const report=await page.evaluate(()=>{
  const D=__A2D_00020_2,G=Guillermo,R=Recortes,results=[],check=(name,passed,details)=>results.push({name,passed:!!passed,details});
  const canvas=document.getElementById('lienzo'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
  // Primer dibujo directamente durante el vuelo de la polilla, sin recorrer la escena.
  A2D.cuadro(10.5);const freshBurst=hash();
  const small=document.createElement('canvas');small.width=256;small.height=150;const sg=small.getContext('2d',{willReadFrequently:true});
  const dur=A2D.dur(),diff=[],black=[],paint=[];let previous=null;
  for(let i=0;i<=Math.round(dur*60);i++){
   const t=Math.min(dur,i/60),start=performance.now();A2D.cuadro(t);paint.push(performance.now()-start);
   if(t<=.12||t>=dur-.12){const d=ctx.getImageData(0,0,1024,600).data;let max=0;for(let k=0;k<d.length;k+=4)max=Math.max(max,d[k],d[k+1],d[k+2]);black.push({t,max});}
   sg.drawImage(canvas,0,0,256,150);const d=sg.getImageData(0,0,256,150).data;if(previous){let s=0;for(let k=0;k<d.length;k+=4)s+=Math.abs(d[k]-previous[k])+Math.abs(d[k+1]-previous[k+1])+Math.abs(d[k+2]-previous[k+2]);diff.push({t,delta:s/(256*150*3)});}previous=d;
  }
  check('Original y revisión registradas',BANCO.some(x=>x.id==='00020')&&document.getElementById('escena').value==='00020.2');
  check('Negro absoluto inicial y final',black.every(x=>x.max===0),black);
  const jumps=diff.filter((v,i)=>{const ns=diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);return v.delta>(ns[Math.floor(ns.length/2)]||0)*4+1.5;});
  check('Sin cortes visuales inesperados',!jumps.length,jumps);
  const finite=x=>typeof x==='number'?Number.isFinite(x):x&&typeof x==='object'?Object.values(x).every(finite):true;
  const L=Laura,actors=[['g',G],['l',L]],curva=(A,p,key,side)=>{const m=p['mano'+side],h=A.tronco(p)(A[side==='Cerca'?'HOMBRO_C':'HOMBRO']),len=A[side==='Cerca'?'BRAZO_C_L':'BRAZO_L'],sj=side==='Cerca'?A.A.datos.piezas.brazo_cerca.codo:key==='g'?len/2:A.A.datos.piezas.brazo.codo,w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang),target={x:m.x+w.x,y:m.y+w.y};return {target,c:R.ikContinuo(h,target,len,sj,42,m.dobla,1.08)};};
  let nonfinite=0,maxArm=0,footDrift=0;const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),feet={};
  for(let i=0;i<=Math.round(dur*120);i++){
   const t=i/120,P=D.pose(t);if(!finite(P))nonfinite++;
   for(const [key,A] of actors){const p=P[key];for(const side of ['Cerca','Lejos']){const {target,c}=curva(A,p,key,side),e=R.extremo(c);maxArm=Math.max(maxArm,dist(e,target)*p.s*(A.K||1));}
    if(t<(key==='g'?D.T.rodillas0:D.T.anda0))for(const side of ['cerca','lejos']){const q=A.aPantalla(p,p.piernas[side].tob),k=key+side;if(!feet[k])feet[k]=q;else footDrift=Math.max(footDrift,dist(q,feet[k]));}}
  }
  check('Geometría finita a 120 Hz',!nonfinite,{samples:Math.round(dur*120)+1,nonfinite});check('Cuatro muñecas unidas durante toda la escena',maxArm<.1,{maxGapPx:maxArm});
  check('Pies inmóviles hasta arrodillarse o empezar a caminar',footDrift<.001,{maxDriftPx:footDrift});
  const rounds=D.RONDAS.map(r=>{const P=D.pose(r.rev+.18);return{g:r.g,l:r.l,correct:['g','l'].every(key=>Object.keys(D.FORMAS[r[key]]).every(k=>Math.abs(P[key].manoLejos.juego.forma[k]-D.FORMAS[r[key]][k])<.001))};});
  check('Tres rondas legibles: tijera/piedra, papel/tijera y piedra/papel',rounds.every(r=>r.correct),rounds);
  check('La tercera ronda acelera sin alterar los tres golpes',D.RONDAS[2].sp<D.RONDAS[0].sp&&D.RONDAS.every(r=>[0,1,2].every(i=>D.bombeo(r.b0+(i+.5)*r.sp,r,1)>.99)));
  const f0=D.pose(D.T.bolsillo0).g.forros,f1=D.pose(D.T.bolsillo1).g.forros;
  check('Los dos forros salen después de meter las manos en los bolsillos',f0.k===0&&f1.k===1&&finite(f1));
  const pp=D.pose(D.T.polilla).g,origin=G.aPantalla(pp,G.tronco(pp)(pp.forros.cerca.punta)),moth=D.polilla(D.T.polilla);
  check('La polilla aparece junto al forro y abandona la escena',dist(origin,moth)<18&&D.polilla(D.T.polillaFin).x<0,{origin,moth});
  const eps=1e-7,corners=v=>[[-15,-9.5],[15,-9.5],[15,9.5],[-15,9.5]].map(([x,y])=>({x:v.x+x*v.sx*Math.cos(v.a)-y*v.sy*Math.sin(v.a),y:v.y+x*v.sx*Math.sin(v.a)+y*v.sy*Math.cos(v.a)})),delta=(a,b)=>Math.max(...corners(a).map((q,i)=>dist(q,corners(b)[i])));
  const release=delta(D.tarjetaSujeta(D.T.lanza-eps),D.vueloTarjeta(D.T.lanza+eps)),landing=delta(D.vueloTarjeta(D.T.cae-eps),{x:D.BANDEJA.x+4,y:D.BANDEJA.y-5,a:-.12,sx:1,sy:.55});
  check('La tarjeta conserva sus cuatro esquinas al soltarla',release<.001,{maxCornerJumpPx:release});
  check('La tarjeta aterriza con la misma posición, orientación y escala',landing<.001,{maxCornerJumpPx:landing});
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;const mg=mask.getContext('2d',{willReadFrequently:true}),bounds=[];
  function bbox(t,A,p,camera){mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);mg.translate(256,256);if(camera){const c=D.camara(t);mg.translate(512,300);mg.scale(c.k,c.k);mg.translate(-c.x,-c.y);}A.dibujar(mg,p,t);const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return{t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256};}
  const ground=[];for(let t=D.T.rodillas0;t<D.T.fin;t+=.08){const P=D.pose(t);ground.push(bbox(t,G,P.g,false));if(t>=D.T.anda0)ground.push(bbox(t,L,P.l,false));}
  check('Rodillas y zapatos respetan el suelo durante la caída y los pasos',ground.every(b=>b.bottom<=D.SUELO+2),{samples:ground.length,worstBottom:Math.max(...ground.map(x=>x.bottom)),floor:D.SUELO});
  for(let t=.8;t<D.T.fin;t+=.15){const P=D.pose(t);for(const[key,A]of actors)bounds.push(bbox(t,A,P[key],true));}
  const cut=bounds.filter(b=>b.left<3||b.right>1020||b.top<3||(D.camara(b.t).k<=1.11&&b.bottom>597));check('Cabezas y manos completas; cuerpos enteros en los planos generales',!cut.length,{samples:bounds.length,cut});
  const pats=[];for(const t of D.PALMADAS){const P=D.pose(t),cor=G.aPantalla(P.g,G.cabeza(P.g).a(D.CORONILLA));mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);G.dibujar(mg,P.g,t);const body=mg.getImageData(0,0,1024,600).data;mg.clearRect(0,0,1536,1112);const m=P.l.manoLejos,q=L.aPantalla(P.l,m);mg.save();mg.translate(q.x,q.y);mg.scale(-P.l.s*L.K,P.l.s*L.K);mg.rotate(m.ang);mg.scale(L.JK,L.JK);m.objeto(mg);mg.restore();const hand=mg.getImageData(0,0,1024,600).data;let pixels=0,minGap=99;const aa=[],bb=[];for(let y=Math.floor(cor.y-25);y<cor.y+25;y++)for(let x=Math.floor(cor.x-30);x<cor.x+30;x++){const k=(y*1024+x)*4+3;if(body[k]>8)aa.push([x,y]);if(hand[k]>8)bb.push([x,y]);if(body[k]>8&&hand[k]>8)pixels++;}for(const a of aa)for(const b of bb)minGap=Math.min(minGap,Math.hypot(a[0]-b[0],a[1]-b[1]));pats.push({t,pixels,minGap});}
  check('Las tres palmaditas alcanzan el pelo',pats.every(x=>x.minGap<=3),pats);
  const end=D.pose(D.T.guino+.2);check('Guiño final con un solo ojo cerrado',end.l.cara.ojos.d>.9&&end.l.cara.ojos.i<.3);
  A2D.cuadro(10.5);check('Trayectorias idénticas al buscar directamente',hash()===freshBurst);
  const targets=[0, 0.05, 0.8, 1.4, 2.1, 2.4, 2.7, 3, 3.28, 3.6, 4.1, 4.9, 5.2, 5.8, 6.1, 6.5, 7, 7.42, 7.92, 8.17, 8.5, 8.9, 9.22, 9.7, 10.12, 10.6, 11.2, 11.72, 11.9, 12.07, 12.5, 12.9, 13.2, 13.7, 14.9],expected=targets.map(t=>{A2D.cuadro(t);return hash();});
  let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===expected[i];});
  const fpsChecks=[];for(const fps of [30,60,120]){const e=BANCO.find(b=>b.id==='00020.2').crear();let matches=true;targets.forEach((t,i)=>{while(e.t+1/fps<t-1e-9)e.actualizar(1/fps);e.actualizar(Math.max(0,t-e.t));e.dibujar(ctx);matches=matches&&hash()===expected[i];});fpsChecks.push({fps,matches});}
  check('Rebobinado y reproducción idénticos a 30/60/120 fps',reverse&&fpsChecks.every(x=>x.matches),{reverse,fpsChecks});
  check('Atlas cargados',!R.errores().length,R.errores());paint.sort((a,b)=>a-b);
  return {scene:'00020.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
 });
 console.log(JSON.stringify({checks:report.results.map(x=>({name:x.name,passed:x.passed,...(!x.passed?{details:x.details}:{})}))}));
 await page.selectOption('#escena','00020');await page.selectOption('#escena','00020.2');await page.click('#reinicio');await page.locator('#reinicio').press('ArrowRight');await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));await page.locator('#reinicio').press('ArrowLeft');await page.locator('#barra').fill('500');await page.locator('#barra').dispatchEvent('input');await page.waitForFunction(()=>Math.abs(parseFloat(document.getElementById('tiempo').textContent)-7.475)<.01);
 await page.click('#reinicio');await page.click('#play');await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);await page.click('#play');report.results.push({name:'Selector, reinicio, avance, retroceso, búsqueda y reproducción',passed:true});
 await page.goto(pathToFileURL(path.join(ROOT,'ver.html')).href+'?id=00020.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());report.results.push({name:'Modo kiosco',passed:await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none')});
 report.results.push({name:'Sin errores JavaScript ni recursos fallidos',passed:!errors.length&&!failures.length,details:{errors,failures}});report.passed=report.results.every(x=>x.passed);
 fs.mkdirSync(path.join(ROOT,'revision'),{recursive:true});fs.writeFileSync(path.join(ROOT,'revision/00020.2-resultados.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await br.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
