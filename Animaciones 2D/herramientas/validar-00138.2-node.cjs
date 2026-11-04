const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00138.2 Guillermo y Yorgi - la mancuerna.js", "yorgi");
  const original=await load("escenas/00138 Guillermo y Yorgi - la mancuerna.js","yorgi");
  for(let i=0;i<original.e.dur*12;i++)original.frame(i/12);
  run.frame(1);
  const checks = run.eval(`(() => {
    const D = __A2D_00138_2;
    const {G,Y,T,P,rot,add}=D, dis=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),punto=(m,x,y)=>add(m.c,rot(P(x*m.jx,y*m.jy),m.a));
const vueltas=T.tiros.map(([a,b])=>[D.mancuerna((a+b)/2).a, D.mancuerna(b-.00001).a,dis(D.mancuerna(b-.00001).c,D.mancuerna(b).c)]);
const palma=(q,l)=>D.enMundo(q,q.p[l]),dedo=(q,l,md=false)=>D.marcaMano(q,q.p[l],D.dedo(q.p[l].dedos,md));
let barra=0,juego=0,apoyo=0,dedoBarra=0,agarra=0,empuja=0,talon=0,talonX=0,boca=0,alcance=0;
for(let n=0;n<=D.DUR*120;n++){const t=n/120,m=D.mancuerna(t),q=D.poseG(t),y=D.poseY(t);
 if(t<T.suelta&&['yC','yL'].includes(m.quien))juego=Math.max(juego,dis(palma(y,m.quien==='yC'?'manoCerca':'manoLejos'),m.c));
 if(t>=T.atrapa&&t<T.vuelca0)barra=Math.max(barra,dis(palma(q,'manoCerca'),punto(m,13,0)),dis(palma(q,'manoLejos'),punto(m,-13,0)));
 if(t>7.35&&t<T.engancha){const ap=D.apoyoPecho(t);apoyo=Math.max(apoyo,dis(punto(m,-D.PLACA,D.MP.ph+1.3),ap.iz),dis(punto(m,D.PLACA,D.MP.ph+1.3),ap.de));}
 if(t>=T.engancha&&t<T.bota0)dedoBarra=Math.max(dedoBarra,dis(dedo(y,'manoLejos'),punto(m,0,D.MP.hr+1)));
 if(t>=T.bota1)agarra=Math.max(agarra,dis(palma(y,'manoLejos'),punto(m,-D.PLACA,0)));
 if(t>=T.empuja0+.10&&t<=T.empuja1)empuja=Math.max(empuja,dis(dedo(q,'manoLejos',true),punto(m,D.PLACA+D.MP.pw+1,6)));
 if(t>=T.alza0&&t<=T.alza1){talon=Math.max(talon,Math.abs(D.sueloZapato(q,'cerca')-D.SUELO));talonX=Math.max(talonX,Math.abs(D.enMundo(q,D.TALON_S).x-D.refG().Hl.x));}
 if(t>=5.96&&t<=6.03)boca=Math.max(boca,dis(palma(y,'manoCerca'),D.enMundo(y,Y.boca(y.p))));
 alcance=Math.max(alcance,...Object.values(D.diag(t)));}
const palmas=T.palmas.map(t=>[dedo(D.poseG(t),'manoCerca',true).y,dedo(D.poseG(t-.10),'manoCerca',true).y]);
const presion=[...T.aprieta.map(([a])=>a+.08),T.ultimo+.08].map(t=>D.mancuerna(t).sqA);
const punch=t=>{const q=D.poseG(t);return D.enMundo(q,G.tronco(q.p)(P(100,704)));};
const tB=T.golpe+.085,mb=D.mancuerna(tB),rebote=D.apoyoPecho(tB).iz.y-punto(mb,-D.PLACA,D.MP.ph+1.3).y;
const m={vueltas,barra,juego,apoyo,dedoBarra,agarra,empuja,talon,talonX,boca,alcance,palmas,presion,rebote,espalda:punch(T.golpe),perfiles:[D.poseG((T.gGira0+T.gGira1)/2).M.sx,D.poseY((T.yGira0+T.yGira1)/2).M.sx],gui:D.poseY(T.ultimo+.12).p.cara.ojos};const cn=document.createElement('canvas');cn.width=150;cn.height=140;const ctx=cn.getContext('2d');
const pixels=(q,draw)=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,150,140);ctx.setTransform(2,0,0,2,60-2*q.x,58-2*q.y);draw();const v=ctx.getImageData(55,53,10,10).data;let n=0;for(let i=3;i<v.length;i+=4)if(v[i]>45)n++;return n;};
const t0=7.5,ap=D.apoyoPecho(t0),qg=D.poseG(t0);m.tela=[ap.iz,ap.de].map(q=>pixels(q,()=>D.vista(ctx,qg,t0)));
const qt=D.poseG(T.brillo+.23);m.biceps=pixels(D.biceps(qt),()=>D.vista(ctx,qt,T.brillo+.23));
const ta=.85,ma=D.mancuerna(ta),gy=D.poseY(ta),gg=D.poseG(ta),ref=q=>pixels(D.proyecta(q),()=>D.reflejos(ctx,ta,gy,gg,ma));
m.espejo=[ref(ma.c),ref(D.enMundo(gy,Y.centroCabeza(gy.p))),ref(D.enMundo(gg,G.centroCabeza(gg.p)))];
function altura(sq){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,150,140);D.pesa(ctx,{c:P(75,67),a:0,jx:1,jy:1,sqA:sq,sqB:0});
 const v=ctx.getImageData(35,10,2,115).data,ys=[];for(let n=3;n<v.length;n+=4)if(v[n]>105)ys.push(Math.floor((n-3)/8));return Math.max(...ys)-Math.min(...ys)+1;}
m.espuma=[altura(0),altura(1)];
if(m.vueltas.some(([h,a,d])=>Math.abs(Math.abs(h)-Math.PI)>.001||Math.abs(Math.abs(a)-2*Math.PI)>.001||d>.02)||m.juego>.5||m.barra>.05||m.agarra>.05)throw Error('Entrega o giros '+JSON.stringify(m));
    if(m.apoyo>.02||m.dedoBarra>.05||m.empuja>.05||m.rebote<6||m.alcance>1.052||m.tela.some(n=>n<4))throw Error('Carga, levantamiento o pecho '+JSON.stringify(m));
    if(m.palmas.some(([a,b])=>Math.abs(a-D.SUELO)>.05||a-b<17)||m.talon>.1||m.talonX>.1||Math.abs(m.espalda.y-D.SUELO)>2.5||m.boca>3||m.perfiles.some(x=>x<.39)||m.presion.some(x=>x<.99)||m.espuma[0]-m.espuma[1]<18||m.biceps<7||m.espejo.some(v=>v<5)||m.gui.d-m.gui.i<.6)throw Error('Goma, giro o contacto '+JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00138.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
