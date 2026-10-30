#!/usr/bin/env node
/* Verificación independiente de 00001.2. Requiere Playwright para Node.
 * Uso: node herramientas/validar-00001.2.cjs [ruta-a-chromium]
 * Comprueba fotogramas, geometría, líquido, encuadre, determinismo y controles.
 */
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const ROOT = path.resolve(__dirname, '..');
const URL = pathToFileURL(path.join(ROOT, 'ver.html')).href;

(async () => {
  const options = {args:['--allow-file-access-from-files']};
  if (process.argv[2]) {
    options.executablePath = process.argv[2];
    options.args.push('--no-sandbox', '--no-zygote', '--single-process', '--disable-gpu', '--disable-software-rasterizer');
  }
  const browser = await chromium.launch(options);
  const page = await browser.newPage({viewport:{width:1100,height:760}});
  const errors = [], failures = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('requestfailed', r => failures.push(r.url()));
  await page.goto(URL + '?id=00001.2&pausa');
  await page.waitForFunction(() => window.A2D && A2D.listo());
  const report = await page.evaluate(() => {
    const results = [];
    const check = (name, passed, details) => results.push({name, passed:!!passed, details});
    const D = __A2D_00001_2, G = Guillermo, R = Recortes;
    const canvas = document.getElementById('lienzo'), ctx = canvas.getContext('2d', {willReadFrequently:true});
    const small = document.createElement('canvas'); small.width = 256; small.height = 150;
    const sg = small.getContext('2d', {willReadFrequently:true});
    const dur = A2D.dur(), diff = [], black = [], paint = [];
    let previous = null;
    check('ID solicitado y registro de ambas versiones', document.getElementById('escena').value === '00001.2'
      && BANCO.some(x => x.id === '00001') && BANCO.some(x => x.id === '00001.2'));
    for (let i = 0; i <= Math.round(dur * 60); i++) {
      const t = Math.min(dur, i / 60), start = performance.now(); A2D.cuadro(t); paint.push(performance.now() - start);
      if (t <= .12 || t >= dur - .12) {
        const d = ctx.getImageData(0, 0, 1024, 600).data; let max = 0;
        for (let k = 0; k < d.length; k += 4) max = Math.max(max, d[k], d[k+1], d[k+2]);
        black.push({t,max});
      }
      sg.drawImage(canvas, 0, 0, 256, 150); const d = sg.getImageData(0, 0, 256, 150).data;
      if (previous) { let total = 0; for (let k = 0; k < d.length; k += 4)
        total += Math.abs(d[k]-previous[k]) + Math.abs(d[k+1]-previous[k+1]) + Math.abs(d[k+2]-previous[k+2]);
        diff.push({t,delta:total/(256*150*3)}); }
      previous = d;
    }
    check('Negro absoluto inicial y final', black.every(x => x.max === 0), black);
    const jumps = diff.filter((v,i) => {
      const neighbors = diff.slice(Math.max(0,i-6),i).concat(diff.slice(i+1,i+7)).map(x=>x.delta).sort((a,b)=>a-b);
      const median = neighbors[Math.floor(neighbors.length/2)] || 0;
      return v.delta > median * 4 + 1.5;
    });
    check('Sin cortes bruscos a 60 fps', !jumps.length, jumps);
    function capacity(angle) {
      // Volumen máximo bajo el borde de salida: intersección del recipiente con
      // el semiplano de la gravedad. No utiliza el cálculo de nivel del dibujante.
      const nx = Math.sin(angle), ny = Math.cos(angle), c = 10*nx - 46*ny;
      const source = [[13,-43],[61,-43],[61,31],[13,31]], clipped = [];
      for (let i = 0; i < source.length; i++) {
        const a=source[i], b=source[(i+1)%source.length], va=a[0]*nx+a[1]*ny-c, vb=b[0]*nx+b[1]*ny-c;
        if (va >= 0) clipped.push(a);
        if ((va >= 0) !== (vb >= 0)) { const k=va/(va-vb); clipped.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]); }
      }
      let area=0; for(let i=0;i<clipped.length;i++){const a=clipped[i],b=clipped[(i+1)%clipped.length];area+=a[0]*b[1]-b[0]*a[1];}
      return Math.abs(area)/2/(48*74);
    }
    let maxArm=0,maxLip=0,maxOverflow=0,maxIncrease=0,maxSlide=0,previousVol=.86,nonfinite=0,lipSamples=0;
    const lastFeet = {};
    const finite = x => typeof x === 'number' ? Number.isFinite(x) : x && typeof x === 'object' ? Object.values(x).every(finite) : true;
    for (let i=0;i<=Math.ceil(dur*120);i++) {
      const t=Math.min(dur,i/120),p=D.pose(t),j=p.jarra,jk=j.escala||G.JK;
      if(!finite(p))nonfinite++;
      const h=G.tronco(p)(G.HOMBRO),w=G.rotP({x:Math.cos(j.mu)*13*jk,y:Math.sin(j.mu)*13*jk},j.ang);
      const target={x:j.x+w.x,y:j.y+w.y},pz=G.A.datos.piezas.brazo,L=pz.fin[1]-pz.raiz[1];
      const arm=R.ikContinuo(h,target,L,L*.5,42,p.brazo.dobla,1.06),end=R.extremo(arm);
      maxArm=Math.max(maxArm,Math.hypot(end.x-target.x,end.y-target.y)*p.s);
      if(t>=D.T.bebe0 && t<=D.T.bebe1){const m=G.boca(p),b=G.rotP({x:G.BORDE.x*jk,y:G.BORDE.y*jk},j.ang);
        maxLip=Math.max(maxLip,Math.hypot(j.x+b.x-m.x,j.y+b.y-m.y)*p.s);lipSamples++;}
      maxOverflow=Math.max(maxOverflow,j.vol-capacity(j.ang-j.chapoteo));
      maxIncrease=Math.max(maxIncrease,j.vol-previousVol);previousVol=j.vol;
      for(const side of ['cerca','lejos']){
        const foot=p.piernas[side],world=G.aPantalla(p,foot.tob),last=lastFeet[side];
        if(last && Math.abs(foot.ang)<1e-8 && Math.abs(last.angle)<1e-8 && Math.abs(world.y-last.y)<1e-8)
          maxSlide=Math.max(maxSlide,Math.abs(world.x-last.x));
        lastFeet[side]={x:world.x,y:world.y,angle:foot.ang};
      }
    }
    check('Geometría finita a 120 Hz', nonfinite===0, {samples:Math.ceil(dur*120)+1,nonfinite});
    check('Muñeca unida al brazo', maxArm<.1, {maxGapPx:maxArm,tolerancePx:.1});
    check('Borde en contacto con la boca durante los cuatro tragos', maxLip<.1, {samples:lipSamples,maxGapPx:maxLip,tolerancePx:.1});
    check('Cerveza sin volumen imposible sobre el borde', maxOverflow<1e-6, {maxExcessFraction:maxOverflow});
    check('La jarra se vacía sin rellenarse', maxIncrease<1e-9 && D.volumen(D.T.bebe1)===0, {maxIncrease});
    check('Pies apoyados sin deslizar', maxSlide<.1, {maxSlidePx:maxSlide});
    // Dibujar al personaje en un lienzo más amplio detecta recortes reales del encuadre.
    const mask=document.createElement('canvas');mask.width=1536;mask.height=1112;
    const mg=mask.getContext('2d',{willReadFrequently:true}), bounds=[];
    for(let i=0;i<=78;i++){
      const t=4+i*.1,p=D.pose(t),cam=D.camara(t);mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,1536,1112);
      mg.translate(256+512,256+300);mg.scale(cam.k,cam.k);mg.translate(-cam.x,-cam.y);G.dibujar(mg,p,t);
      const d=mg.getImageData(0,0,1536,1112).data;let x0=1536,x1=0,y0=1112,y1=0;
      for(let y=0;y<1112;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
      bounds.push({t,left:x0-256,right:x1-256,top:y0-256,bottom:y1-256});
    }
    const cut=bounds.filter(b=>b.left<8||b.right>1015||b.top<8||b.bottom>591);
    check('Cabeza, jarra y pies completos durante la acción central', !cut.length, {samples:bounds.length,cut,minTop:Math.min(...bounds.map(x=>x.top)),maxBottom:Math.max(...bounds.map(x=>x.bottom))});
    function hash(){const d=ctx.getImageData(0,0,1024,600).data;let h=2166136261;for(let i=0;i<d.length;i++)h=Math.imul(h^d[i],16777619);return h>>>0;}
    const targets=[0,.5,1.5,4.5,5.5,6.5,7.5,9.5,10.5,12.5,15,15.45];
    const direct=targets.map(t=>{A2D.cuadro(t);return hash();}),fpsChecks=[];
    for(const fps of [30,60,120]){
      const scene=BANCO.find(x=>x.id==='00001.2').crear();let matches=true;
      targets.forEach((t,i)=>{while(scene.t+1/fps<t-1e-9)scene.actualizar(1/fps);scene.actualizar(Math.max(0,t-scene.t));scene.dibujar(ctx);matches=matches&&hash()===direct[i];});
      fpsChecks.push({fps,matches});
    }
    let reverse=true;[...targets.keys()].reverse().forEach(i=>{A2D.cuadro(targets[i]);reverse=reverse&&hash()===direct[i];});
    check('Mismo resultado a 30, 60 y 120 fps y al rebobinar',fpsChecks.every(x=>x.matches)&&reverse,{fpsChecks,reverse});
    check('Atlas cargado sin errores',!R.errores().length,R.errores());
    paint.sort((a,b)=>a-b);
    return {scene:'00001.2',durationSeconds:dur,renderedFrames:diff.length+1,results,paintMs:{median:paint[Math.floor(paint.length*.5)],p95:paint[Math.floor(paint.length*.95)],max:paint.at(-1)},browser:navigator.userAgent};
  });
  const add = (name,passed,details) => report.results.push({name,passed:!!passed,details});
  await page.selectOption('#escena','00001');
  await page.selectOption('#escena','00001.2');
  await page.click('#reinicio');
  await page.locator('#reinicio').press('ArrowRight');
  await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.02'));
  await page.locator('#reinicio').press('ArrowLeft');
  await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('0.00'));
  await page.locator('#barra').fill('500');
  await page.locator('#barra').dispatchEvent('input');
  await page.waitForFunction(()=>document.getElementById('tiempo').textContent.startsWith('7.72'));
  await page.click('#reinicio');
  await page.click('#play');
  await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)>.05);
  await page.click('#play');
  add('Selector, reinicio, avance, retroceso, búsqueda y reproducción',true);
  await page.uncheck('#bucle');
  await page.locator('#barra').fill('1000');await page.locator('#barra').dispatchEvent('input');
  await page.click('#play');
  await page.waitForFunction(()=>parseFloat(document.getElementById('tiempo').textContent)<1);
  add('Reproducción desde el final reinicia la escena',true);
  await page.goto(URL+'?id=00001.2&pausa&kiosco');await page.waitForFunction(()=>A2D.listo());
  add('Modo kiosco oculta los controles',await page.locator('#mandos').evaluate(e=>getComputedStyle(e).display==='none'));
  add('Sin errores JavaScript ni fallos de recursos',!errors.length&&!failures.length,{errors,failures});
  report.passed=report.results.every(x=>x.passed);
  const file=path.join(ROOT,'revision','00001.2-resultados.json');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  await browser.close();if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
