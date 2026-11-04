// Renderizado Canvas 2D en Node/Skia. Requiere @napi-rs/canvas. No sustituye la prueba del navegador o dispositivo.
const fs=require('fs'),path=require('path'),vm=require('vm');
const C=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas' : '@napi-rs/canvas');
const ROOT=path.resolve(__dirname,'..');
async function load(scene, actor='marcos-bombero'){
 const pending=[];
 class Image extends C.Image {
  set src(v){pending.push(new Promise((resolve,reject)=>{const a=this.onload,b=this.onerror;this.onload=()=>{a?.();resolve()};this.onerror=e=>{b?.(e);reject(e)};super.src=fs.readFileSync(path.join(ROOT,v))}));}
  get src(){return super.src;}
 }
 const context={console,Image,document:{createElement:()=>C.createCanvas(300,150)},performance};context.window=context;
 const ctx=vm.createContext(context);
 const files=['motor/base2d.js','motor/recortes.js','personajes/guillermo-aladro/piezas.js','personajes/guillermo-aladro/guillermo.js','personajes/comun/personaje.js','personajes/'+actor+'/piezas.js','personajes/'+actor+'/'+actor+'.js',scene];
 for(const f of files)vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
 await Promise.all(pending);
 const e=vm.runInContext('BANCO[BANCO.length-1].crear()',ctx),canvas=C.createCanvas(1024,600),g=canvas.getContext('2d');
 return {ctx,e,canvas,g,eval:s=>vm.runInContext(s,ctx),frame(t){e.t=t;e.dibujar(g);return canvas}};
}
module.exports={load,ROOT,C};
