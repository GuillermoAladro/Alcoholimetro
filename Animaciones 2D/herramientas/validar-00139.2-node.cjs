const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00139.2 Guillermo y Yorgi - la siesta.js", "yorgi");
  const original=await load("escenas/00139 Guillermo y Yorgi - la siesta.js","yorgi");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  run.frame(1);
  const checks = run.eval(`(() => {
    const D = __A2D_00139_2;
    const {G,Yo,T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),pin=p=>D.ptMano(G,p,p.manoCerca,D.PINZA);
const montura=t=>{const p=D.poseG(t),g=D.gafas(t,p);return g.M||D.marcoCuello(p);},puente=t=>D.mundoMarco(montura(t),D.PUENTE),ojo=(t,x,y)=>D.cabW(Yo,D.poseY(t),{x,y});
const marca=t=>{const p=D.poseG(t);return dist(D.ptMano(G,p,p.manoCerca,D.puntaDedo(p.manoCerca.dedos)),D.cabW(G,p,D.FRENTE_G));};
const pata=t=>{const m=D.moscaEn(t);return {x:m.x+(m.vx<0?1.6:-1.6),y:m.y+5.76};};
let nuca=0,asiento=0,suelas=0,mano=0,serv=0,cristal=0,ojos=0;
for(let i=0;i<=D.DUR*90;i++){const t=i/90,p=D.poseG(t),y=D.poseY(t);
 if(t>=T.dormido&&t<T.respingo)nuca=Math.max(nuca,dist(D.cabW(Yo,y,D.NUCA),D.apoyoNuca(y)));
 if(t<T.punio0&&t<T.respingo){asiento=Math.max(asiento,Math.abs(D.trW(G,p,D.ASIENTOS[0]).y-D.asiento(G,p)),Math.abs(D.trW(Yo,y,D.ASIENTOS[1]).y-D.asiento(Yo,y)));suelas=Math.max(suelas,Math.abs(D.suela(G,p,'cerca')-D.SUELO),Math.abs(D.suela(Yo,y,'cerca')-D.SUELO));}
 if(t>=T.cuello1&&t<T.lanza1)mano=Math.max(mano,dist(pin(p),puente(t)));
 if(t>=T.serv1&&t<=T.cara1)serv=Math.max(serv,dist(pin(p),D.servilleta(t,p).Q[0]));
 if(t>T.moscaGafas)cristal=Math.max(cristal,dist(pata(t),D.mundoMarco(montura(t),D.CRISTAL)));
 if(t>T.aterriza){const f=montura(t);ojos=Math.max(ojos,dist(D.mundoMarco(f,{x:-88,y:6}),ojo(t,790,496)),dist(D.mundoMarco(f,{x:74,y:4}),ojo(t,944,551)));}}
const ent=D.poseG(T.serv1),ini=D.trW(G,ent,D.enRegazo(D.REGAZO_Q[0])),esquina=dist(ini,pin(ent)),coge=dist(puente(T.cuello1-.00001),puente(T.cuello1));
const u=.0001,a=puente(T.lanza1-u),b=puente(T.lanza1),c=puente(T.lanza1+u),vel=Math.hypot((a.x+c.x-2*b.x)/u,(a.y+c.y-2*b.y)/u);
const iniV=montura(T.lanza1),finV=montura(T.aterriza-.00001),vueltas=(iniV.a-finV.a)/(2*Math.PI),registro=dist(puente(T.aterriza-.00001),puente(T.aterriza));
const patY=t=>{const y=D.poseY(t);return dist(D.ptMano(Yo,y,y.manoLejos,D.PALMA),D.trW(Yo,y,{x:238,y:598}));};
const nariz=dist(pata(3.11),D.cabW(G,D.poseG(3.11),D.NARIZ_G)),plato=Math.abs(pata(4.13).y-(D.MESA.y-2));
const llegaP=D.llegadaRafaga(D.PLATO),soplo=[D.moscaEn(llegaP-u).posada,D.moscaEn(llegaP+u).posada,dist(D.moscaEn(llegaP-u),D.moscaEn(llegaP+u))];
const llegadaPelo=D.llegadaRafaga(D.cabW(G,D.cuerpoG(T.sopla-.02),{x:760,y:310})),viento=[D.vientoG(llegadaPelo-u).k,D.vientoG(llegadaPelo+.10).k,D.vientoG(T.rafaga1+.24).k];
const gp=D.granPompa(T.junta1),antes=D.granPompa(T.junta1-.05),final=D.granPompa(T.junta1+.19),burbujas=[dist(gp.a,gp.b)-gp.ra-gp.rb,antes.une,dist(antes.a,antes.b)-antes.ra-antes.rb,Math.abs(gp.ra**3+gp.rb**3-final.R**3),final.R,D.granPompa(T.plof+.05).pop];
const desacoplo=D.faseG(T.sinc0)-D.faseY(T.sinc0),unisono=D.faseG(T.sinc1+.1)-D.faseY(T.sinc1+.1);
const m={nuca,asiento,suelas,mano,serv,cristal,ojos,esquina,coge,vel,vueltas,registro,palmadas:[patY(.50),patY(.65),patY(.80)],frente:marca(T.gPum),nariz,plato,soplo,viento,burbujas,desacoplo,unisono};const cn=document.createElement('canvas');cn.width=cn.height=140;const ctx=cn.getContext('2d');
function muestra(q,fn,w=8,zoom=2){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,140,140);ctx.setTransform(zoom,0,0,zoom,70-q.x*zoom,70-q.y*zoom);fn();const v=ctx.getImageData(70-w/2,70-w/2,w,w).data;let n=0;for(let i=3;i<v.length;i+=4)if(v[i]>80)n++;return n;}
const ts=(T.lanza1+T.aterriza)/2,f=D.gafas(ts,D.poseG(ts)),cara=D.gafas(13.65,D.poseG(13.65)),pCara=D.poseY(13.65);
m.pix=[muestra(f.M,()=>D.dibujaGafas(ctx,f),40),muestra(D.mundoMarco(cara.M,D.CRISTAL),()=>D.dibujaGafas(ctx,cara)),muestra(D.cabW(Yo,pCara,D.NUCA),()=>Yo.dibujar(ctx,pCara,13.65)),muestra(D.cabW(G,D.poseG(T.gPum),D.FRENTE_G),()=>G.dibujar(ctx,D.cuerpoG(T.gPum),T.gPum))];
if(m.nuca>.04||m.asiento>.04||m.suelas>.04||m.palmadas[0]>.05||m.palmadas[2]>.05||m.palmadas[1]<9||m.frente>.05||m.nariz>.05||m.plato>.05)throw Error('Lona, patas o manos '+JSON.stringify(m));
    if(m.mano>.05||m.coge>.04||m.vel>2||m.registro>.04||m.vueltas<1.94||m.vueltas>2.06||m.ojos>.6||m.cristal>.04||m.pix.some(x=>x<5)||m.pix[0]<20)throw Error('Montura y cantos '+JSON.stringify(m));
    if(m.esquina>.05||m.serv>.05||m.soplo[0]!==1||m.soplo[1]!==0||m.soplo[2]>.12||m.viento[0]!==0||m.viento[1]<.95||m.viento[2]>=0||Math.abs(m.burbujas[0])>.04||m.burbujas[1]!==0||m.burbujas[2]<10||m.burbujas[3]>.1||m.burbujas[4]<50||m.burbujas[5]<=0||m.desacoplo<.45||m.unisono!==0)throw Error('Servilleta, ráfaga o fusión '+JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00139.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
