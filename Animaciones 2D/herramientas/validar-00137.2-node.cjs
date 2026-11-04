const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00137.2 Guillermo y Yorgi - el abrazo de cumpleanos.js", "yorgi");
  const original=await load("escenas/00137 Guillermo y Yorgi - el abrazo de cumpleanos.js","yorgi");
  for(let n=0; n<original.e.dur*12; n++)original.frame(n/12);
  run.frame(4);
  const checks = run.eval(`(() => {
    const D = __A2D_00137_2;
    const {G,Y,T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const indice=(r,p,m)=>D.marcaMano(r,p,m,D.puntaIndice(m.dedos));
const puls=t=>{const p=D.pG(t);return dist(indice(G,p,p.manoLejos),{x:D.INTERR.x,y:D.pulsadorY(t)})};
const toques=T.toques.map((t,i)=>{const p=D.pG(t);return dist(indice(G,p,p.manoLejos),D.TOQ[i]);});
let marco=0,muslo=0,bolsa=0,mejilla=0,pelo=0,alcance=0,aire=0,apoyo=0,vueloY=0;
const suela=(r,p,l)=>{const pi=p.piernas[l];return r.aPantalla(p,{x:pi.tob.x,y:pi.tob.y+D.bajoPie(r,pi.ang)}).y;};
for(let i=0;i<Math.ceil(D.DUR*90);i++){const t=i/90,{g,y}=D.pose(t);
 if(t>T.entra0+.16&&t<T.entra1)marco=Math.max(marco,Math.abs(indice(G,g,g.manoCerca).x-D.PUERTA.x0));
 if(t>T.abraza+.055){muslo=Math.max(muslo,dist(D.marcaMano(Y,y,y.manoCerca,{x:0,y:1}),D.musloG(g)));bolsa=Math.max(bolsa,dist(D.marcaMano(Y,y,y.manoLejos,{x:0,y:1}),D.bolsa(g)));
 mejilla=Math.max(mejilla,dist(D.costado(g),D.mejilla(y)));pelo=Math.max(pelo,dist(indice(G,g,g.manoLejos),D.pelo(y)));
 for(const [r,p,l] of [[Y,y,'Cerca'],[Y,y,'Lejos'],[G,g,'Lejos']]){const m=p['mano'+l],w={x:m.x+Math.cos(m.mu)*r.JK*r.MUNECA_R,y:m.y+Math.sin(m.mu)*r.JK*r.MUNECA_R},h=r.tronco(p)(l==='Cerca'?r.HOMBRO_C:r.HOMBRO);alcance=Math.max(alcance,dist(w,h)/(l==='Cerca'?r.BRAZO_C_L:r.BRAZO_L));}
 aire=Math.max(aire,suela(G,g,'cerca'));if(t>T.iza1)apoyo=Math.max(apoyo,Math.abs(suela(Y,y,'cerca')-D.SUELO));}
 if(t>T.pop0&&t<T.pop1+.22)vueloY=Math.max(vueloY,560-suela(Y,y,'cerca'));}
const caida=D.caidaCuerno(T.cuerno),yy=D.pY(T.cuerno),boquilla=dist(caida,Y.aPantalla(yy,Y.boca(yy))),giro=Math.abs(caida.a-D.angBoca(T.cuerno)),escala=Math.abs(caida.k-yy.s/.285);
const piso=t=>{const c=D.caidaCuerno(t);return c.y+D.papel(c.a,0,0,c.k).bajo;};
const velas=D.apagaVelas().map((t,i)=>{const v=D.VELAS[i],p={x:v.x,y:v.y-v.alto-4};return [t,dist(D.recorrido2(D.CAE_IZQ,t),p),dist(D.recorrido2(D.CAE_IZQ,t-.04),p)];});
D.preparaConfeti();const conf=D.conf();let nace=0,asentado=0;
for(let i=0;i<conf.length;i++){const c=conf[i],y=D.pY(c.t0),p=Y.aPantalla(y,i%2?y.manoLejos:y.manoCerca);nace=Math.max(nace,dist({x:c.x0,y:c.y0},p));if(c.t0+c.tl<14)asentado++;}
const antes=D.pG(T.alza0).x,recoge=D.pG(T.abraza).x,gFinal=D.pG(T.iza1),yFinal=D.pY(T.guino+.21);
const m={marco,toques,puls:[puls(T.click),puls(T.click-.06)],muslo,bolsa,mejilla,pelo,alcance,aire,apoyo,vueloY,boquilla,giro,escala,suelo:[piso(T.cuerno+.45),piso(T.cuerno+.53),piso(14)],velas,nace,asentado,avance:recoge-antes,frente:[D.frente(T.llora+.12),D.frente(T.llora+.31)],guino:yFinal.cara.ojos,soplos:[D.sopla(T.toot1+.17),D.sopla(T.toot2+.16)]};const cn=document.createElement('canvas');cn.width=cn.height=64;const ctx=cn.getContext('2d');
function muestra(q,fn,tipo){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,64,64);ctx.setTransform(2,0,0,2,32-2*q.x,32-2*q.y);fn();const u=ctx.getImageData(27,27,10,10).data;let n=0;
  for(let i=0;i<u.length;i+=4){if(tipo==='llama'?(u[i]>220&&u[i+1]>115&&u[i+1]<254&&u[i+2]<200&&u[i+3]>180):u[i+3]>105)n++;}return n;}
m.tela=[D.musloG(gFinal),D.bolsa(gFinal),D.costado(gFinal)].map(q=>muestra(q,()=>G.dibujar(ctx,gFinal,T.iza1)));
const ys=D.pY(T.iza1);m.cara=muestra(D.mejilla(ys),()=>Y.dibujar(ctx,ys,T.iza1));
m.llamas=D.VELAS.map((v,i)=>{const p={x:v.x,y:v.y-v.alto-7},tv=m.velas[i][0];return [muestra(p,()=>D.llamas(ctx,tv-.04),'llama'),muestra(p,()=>D.llamas(ctx,tv+.07),'llama')];});
if(m.marco>.01||m.toques.some(x=>x>.01)||m.puls[0]>.01||m.puls[1]<5||m.soplos.some(x=>x<.99))throw Error('Marco, pared, interruptor o soplos '+JSON.stringify(m));
    if(m.muslo>.02||m.bolsa>.02||m.mejilla>.02||m.pelo>3.1||m.alcance>1.01||m.aire>493||m.apoyo>.1||m.vueloY<34||m.avance<15||m.cara<5||m.tela.some(n=>n<5))throw Error('Abrazo sin apoyo '+JSON.stringify(m));
    if(m.boquilla>.01||m.giro>.01||m.escala>.01||Math.abs(m.suelo[0]-587)>.05||m.suelo[1]>585||Math.abs(m.suelo[2]-587)>.05||m.nace>8||m.asentado!==90)throw Error('Matasuegras o confeti '+JSON.stringify(m));
    if(m.frente[0]!==0||m.frente[1]!==1||m.velas.some(([t,d,a],i)=>Math.abs(d-2.5)>.01||a<=d||i&&t<=m.velas[i-1][0])||m.llamas.some(([a,b])=>a<5||b>0)||m.guino.i-m.guino.d<.8)throw Error('Mechas o remate '+JSON.stringify(m));
    return {m};
  })()`);
  const hash = canvas => crypto.createHash('sha256').update(canvas.data()).digest('hex');
  const background = C.createCanvas(1024, 600);
  const graphics = background.getContext('2d');
  graphics.fillStyle = '#000';
  graphics.fillRect(0, 0, 1024, 600);
  const black = hash(background), duration = run.e.dur;
  for (let i = 0; i < 8; i++) {
    const t = i / 60;
    assert.equal(hash(run.frame(t)), black);
    assert.equal(hash(run.frame(duration - t)), black);
  }
  const times = [0.21, 0.51, 0.77].map(k => k * duration);
  const snapshots = times.map(t => hash(run.frame(t)));
  assert.equal(new Set([black, ...snapshots]).size, snapshots.length + 1);
  times.forEach((t, i) => assert.equal(hash(run.frame(t)), snapshots[i]));
  for (const fps of [30, 60, 120]) {
    run.e.t = 0;
    for (let i = 0; i <= Math.ceil(duration * fps); i++) run.e.actualizar(1 / fps);
    assert(run.e.terminada);
  }
  console.log(JSON.stringify({scene: "00137.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
