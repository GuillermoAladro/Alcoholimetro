const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00136.2 Guillermo y Yorgi - la carrera.js", "yorgi");
  const original = await load("escenas/00136 Guillermo y Yorgi - la carrera.js", "yorgi");
  for (let n=0; n<original.e.dur*12; n++) original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00136_2;
    const {G,Y,T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),palm=(R,p,m,mark)=>{const v=M2.rot(mark,m.mu+Math.PI/2);return R.aPantalla(p,{x:m.x+v.x*R.JK,y:m.y+v.y*R.JK})};const chin=t=>{const Q=D.poseG(t);return D.aMundo(Q,G.aPantalla(Q.p,G.cabeza(Q.p).a({x:814.5,y:840})))};const lace=t=>{const q=D.lazos(D.poseG(t).p);return dist(q.c,q.l)};let maxCord=0,grip=0,reach=0,libre=999,ritmo=[];for(let i=0;i<14.6*120;i++){const t=i/120,Q=D.poseG(t),p=Q.p,y=D.poseY(t);if(!Q.clip)maxCord=Math.max(maxCord,lace(t));if(t>=5.4&&t<=T.floritura){grip=Math.max(grip,dist(palm(Y,y,y.manoLejos,{x:7.98,y:9.18}),D.barra(t)));const m=y.manoLejos,h=Y.tronco(y)(Y.HOMBRO);reach=Math.max(reach,Math.hypot(m.x+Math.cos(m.mu)*Y.MUNECA_R*Y.JK-h.x,m.y+Math.sin(m.mu)*Y.MUNECA_R*Y.JK-h.y)/Y.BRAZO_L);}
if(t>=T.entra0&&t<T.gira0)libre=Math.min(libre,y.x-p.x);}const su=(t,l)=>{const Q=D.poseG(t),p=Q.p,pi=p.piernas[l],z=D.suela(G,pi.ang);return D.aMundo(Q,G.aPantalla(p,{x:pi.tob.x+z.x,y:pi.tob.y+z.y})).y};for(let i=0;i<10;i++){const t=T.salto0+i*T.per;ritmo.push([su(t+.15,"cerca"),su(t+.30,"cerca"),su(t+.30,"lejos")]);}const h=D.empujonDatos(),Q=D.poseG(h.tHit),risa=D.poseY(11.6),r=D.poseG(13.35),y=D.poseY(13.35),cierre=D.hojaPuerta(D.thPuerta(h.tHit));const m={inicio:lace(.5),tiron:lace(T.tensa),maxCord,grip,reach,libre,ritmo,caida:chin(T.choca),rebote:chin(3.27),levanta:chin(4.1),polvo:D.polvos().find(e=>e[0]===T.choca)[1],impacto:[h.tHit,dist(D.costura(Q),h.punto),Math.abs(cierre.xF-h.punto.x)],boca:dist(Y.aPantalla(risa,Y.boca(risa)),Y.aPantalla(risa,risa.manoCerca)),pulgares:[r.p.manoLejos.dedos,y.manoLejos.dedos],guino:y.cara.ojos,esquina:palm(G,r.p,r.p.manoLejos,{x:20,y:-3}),cam:[D.camX(2),D.camX(9.9)]};
const cn=document.createElement('canvas');cn.width=200;cn.height=560;const ctx=cn.getContext('2d');
function raster(x,y,draw,w=8,h=8){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,200,560);ctx.translate(12-x,12-y);draw();const d=ctx.getImageData(12-w/2,12-h/2,w,h).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>85)n++;return n;}
const qImpact=D.poseG(T.choca),pImpact=m.caida;
m.pix=[raster(pImpact.x,pImpact.y,()=>D.dibujaG(ctx,qImpact,T.choca)),raster(h.punto.x,h.punto.y,()=>D.dibujaG(ctx,Q,h.tHit)),raster(m.esquina.x,m.esquina.y,()=>D.brazoRendija(ctx,r)),raster(r.p.x,r.p.suelo-80,()=>D.brazoRendija(ctx,r))];
const mid=D.poseG((T.gira0+T.gira1)/2);ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,200,560);ctx.translate(100-mid.p.x,0);D.dibujaG(ctx,mid,(T.gira0+T.gira1)/2);
const d=ctx.getImageData(0,0,200,560).data;let lo=200,hi=0;for(let n=3;n<d.length;n+=4)if(d[n]>90){const x=((n-3)/4)%200;lo=Math.min(lo,x);hi=Math.max(hi,x);}m.perfil=hi-lo+1;
if(m.inicio>22||Math.abs(m.tiron-64)>.01||m.maxCord>64.01||m.grip>.05||m.reach>1||m.libre<190)throw Error('Cordón, agarre o carril '+JSON.stringify(m));
    if(m.ritmo.length!==10||m.ritmo.some(([a,b,c])=>a>480||Math.abs(b-556)>.02||Math.abs(c-551)>.02))throw Error('Aterrizajes');
    if(Math.abs(m.caida.y-556)>.1||m.rebote.y>552||m.levanta.y>546||Math.abs(m.polvo-m.caida.x)>.1||m.impacto[1]>.02||m.impacto[2]>.02)throw Error('Contactos físicos '+JSON.stringify(m));
    if(m.pix[0]<4||m.pix[1]<4||m.pix[2]<3||m.pix[3]!==0||m.perfil<35||m.boca>4||m.pulgares.some(e=>e.pulgar<.99||e.indice>.01)||m.guino.d-m.guino.i<.2||m.cam[1]-m.cam[0]<1000)throw Error('Píxeles, perfil, pulgares o gesto '+JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00136.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
