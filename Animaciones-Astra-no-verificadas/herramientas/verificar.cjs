/* Render y controles reproducibles sin servicios externos.
 * npm install --no-save @napi-rs/canvas ; node herramientas/verificar.cjs
 * Canvas Skia; no equivale a ensayo en Chromium/Raspberry Pi ni certificación artística.
 */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
let cv;try{cv=require('@napi-rs/canvas')}catch{cv=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas')}
const {createCanvas,Image}=cv,root=path.resolve(__dirname,'..');
for(const f of ['DejaVuSans.ttf','DejaVuSans-Bold.ttf']){const p='/usr/share/fonts/truetype/dejavu/'+f;if(fs.existsSync(p))cv.GlobalFonts.registerFromPath(p,'Arial');}
class LocalImage extends Image{set src(v){super.src=typeof v==='string'&&!v.startsWith('data:')?'data:image/png;base64,'+fs.readFileSync(path.join(root,v)).toString('base64'):v}get src(){return super.src}}
const scope=vm.createContext({console,Image:LocalImage,Math,Promise,document:{createElement:()=>createCanvas(1,1)}});
for(const f of ['motor/avatar-guillermo.js','motor/base.js','banco.js','lista.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),scope,{filename:f});
const files=vm.runInContext('ARCHIVOS_BANCO',scope);
vm.runInContext(`globalThis.qaAvatares=[];const qaAvatarOriginal=Astra.avatar;Astra.avatar=(g,x,y,h,opts={})=>{const b=qaAvatarOriginal(g,x,y,h,opts),a=opts.rotate||0;const pts=[[-b.w/2,-h],[b.w/2,-h],[-b.w/2,0],[b.w/2,0]].map(([u,v])=>[x+u*Math.cos(a)-v*Math.sin(a),y+u*Math.sin(a)+v*Math.cos(a)]);qaAvatares.push({who:b.who,x0:Math.min(...pts.map(p=>p[0])),x1:Math.max(...pts.map(p=>p[0])),y0:Math.min(...pts.map(p=>p[1])),y1:Math.max(...pts.map(p=>p[1]))});return b}`,scope);
for(const f of files){new vm.Script(fs.readFileSync(path.join(root,f),'utf8'),{filename:f}).runInContext(scope);}
const canvas=createCanvas(1024,600),g=canvas.getContext('2d');scope.g=g;
function pixels(){return g.getImageData(0,0,1024,600).data}
function lit(){const d=pixels();let n=0;for(let i=0;i<d.length;i+=4)if(d[i]||d[i+1]||d[i+2])n++;return n}
function hash(){return crypto.createHash('sha256').update(Buffer.from(pixels())).digest('hex')}
(async()=>{
 await vm.runInContext('Astra.load()',scope);
 const rows=[],capture=[0,1.6,3.1,4.7,6.3,8.2];
 const requested=process.argv.slice(2);const ids=vm.runInContext('BANCO.map(a=>a.id)',scope).filter(id=>!requested.length||requested.includes(id));
 for(const id of ids){
  vm.runInContext(`globalThis.e=BANCO.find(a=>a.id==='${id}').crear()`,scope);const dur=vm.runInContext('e.dur',scope);let frames=0,minLit=Infinity,maxMs=0;
  vm.runInContext('e.t=0;e.dibujar(g)',scope);if(lit()!==0)throw Error(id+' empieza con píxeles no negros');
  vm.runInContext('e.t=1/60;e.dibujar(g)',scope);if(lit()!==0)throw Error(id+' primer fotograma no negro');
  let bounds=true;const people=new Set();
  for(let f=0;f<=Math.ceil(dur*30);f++){
   const t=Math.min(dur,f/30);scope.tm=t;const start=performance.now();vm.runInContext('qaAvatares=[];e.t=tm;e.dibujar(g)',scope);maxMs=Math.max(maxMs,performance.now()-start);frames++;
   if(t>.65&&t<dur-.7){const avatars=vm.runInContext('qaAvatares',scope);if(!avatars.some(a=>a.who==='guillermo'))bounds=false;for(const a of avatars){people.add(a.who);if(a.x0<0||a.y0<0||a.x1>1024||a.y1>600)bounds=false;}if(f%15===0)minLit=Math.min(minLit,lit());}
  }
  if(!bounds)throw Error(id+' avatar ausente o fuera de cuadro');if(minLit<1000)throw Error(id+' escena vacía durante la acción');
  vm.runInContext('e.t=e.dur;e.dibujar(g)',scope);if(lit()!==0)throw Error(id+' termina con píxeles no negros');
  vm.runInContext('e.t=4.25;e.dibujar(g)',scope);const h1=hash();vm.runInContext('e.t=7;e.dibujar(g);e.t=4.25;e.dibujar(g)',scope);if(hash()!==h1)throw Error(id+' render no determinista');
  const sheet=createCanvas(1024,1300),sg=sheet.getContext('2d');sg.fillStyle='#0d1117';sg.fillRect(0,0,1024,1300);
  const ts=[...capture,dur-.35,dur];
  for(let i=0;i<ts.length;i++){scope.tm=ts[i];vm.runInContext('e.t=tm;e.dibujar(g)',scope);const x=i%2*512,y=Math.floor(i/2)*325;sg.drawImage(canvas,x,y,512,300);sg.fillStyle='#c5d0d8';sg.font='14px Arial';sg.fillText(`${id} · ${ts[i].toFixed(2)} s`,x+12,y+317);}
  fs.writeFileSync(path.join(root,'revision',id+'.png'),sheet.toBuffer('image/png'));
  rows.push({id,duracion_s:dur,cuadros:frames,negro_inicio:true,negro_fin:true,avatar_en_cuadro:true,avatares_comprobados:[...people],render_determinista:true,error_js:false,pixeles_visibles_min:minLit,render_max_ms:Math.round(maxMs*100)/100,revision_visual:'pendiente'});
  console.log(id,'PASS',frames,'cuadros');
 }
 const oldFile=path.join(root,'revision','resultados.json');const old=fs.existsSync(oldFile)?JSON.parse(fs.readFileSync(oldFile,'utf8')):[];const all=[...old.filter(r=>!rows.some(x=>x.id===r.id)),...rows].sort((a,b)=>a.id.localeCompare(b.id));fs.writeFileSync(oldFile,JSON.stringify(all,null,2)+'\n');
 console.log('TOTAL',rows.length,'escenas comprobadas con Canvas Skia.');
})().catch(e=>{console.error(e);process.exitCode=1});
