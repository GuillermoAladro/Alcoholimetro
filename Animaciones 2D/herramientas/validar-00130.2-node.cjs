const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00130.2 Guillermo y Sara - el atardecer en la azotea.js", "sara-saez");
  const original=await load("escenas/00130 Guillermo y Sara - el atardecer en la azotea.js","sara-saez");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00130_2;
    const {T}=D,S=SaraSaez,G=Guillermo,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const estado=t=>{const {g,s}=D.pose(t),au=D.auris(t,s,g);return {g,s,au,h:D.geometria(t,s,g,au)};};
    let errorL=0,apoyo=0,alcance=0,mirada=0,codo=0,centro=0;const ultimos={};
    const bL=(inicio,fin,lado,L)=>{const m=D.controlCable(inicio,fin,L,lado);let last=inicio,l=0;
      for(let i=1;i<=64;i++){const u=i/64,v=1-u,p={x:v*v*inicio.x+2*u*v*m.x+u*u*fin.x,y:v*v*inicio.y+2*u*v*m.y+u*u*fin.y};l+=dist(p,last);last=p;}return l;};
    for(let n=0;n<=Math.floor(D.DUR*120);n++){
      const t=n/120,{g,s,au,h}=estado(t);
      for(const [f,k,L] of [[h.finA,-.42,D.L_RAMA],[h.finB,.37,D.L_RAMA],[D.JACK,-.42,D.L_TRONCO]])errorL=Math.max(errorL,Math.abs(bL(au.Y,f,k,L)-L));
      const posA=au.enA==='oreja'?D.orejaSA(s):au.enA==='mano'?D.ptMano(S,s,s.manoCerca,D.PINZA):null;
      const posB=au.enB==='oreja'?D.orejaSD(s):au.enB==='orejaG'?D.orejaG(g):t<T.gCoge?D.ptMano(S,s,s.manoLejos,D.PINZA):D.ptMano(G,g,g.manoCerca,D.PINZA);
      centro=Math.max(centro,posA?dist(au.A,posA):0,dist(au.B,posB));
      for(const [k,R,p] of [['s',S,s],['g',G,g]]) {
        apoyo=Math.max(apoyo,Math.abs(R.aPantalla(p,p.pelvis).y-380));
        if(t>=T.miranE+.18&&t<=T.estrella1+.08){const o=R.aPantalla(p,R.centroCabeza(p)),q=D.puntoEstrella(t),d=dist(q,o);mirada=Math.max(mirada,dist(p.cara.mirada,{x:(q.x-o.x)/d,y:(q.y-o.y)/d}));}
        for(const [b,m,L,sj,base] of [['c',p.manoCerca,R.BRAZO_C_L,R.A.datos.piezas.brazo_cerca.codo,R.HOMBRO_C],['l',p.manoLejos,R.BRAZO_L,R.BRAZO_L/2,R.HOMBRO]]){
          const h=R.tronco(p)(base),v=R.rotP({x:Math.cos(m.mu)*R.MUNECA_R*R.JK,y:Math.sin(m.mu)*R.MUNECA_R*R.JK},m.ang||0),w={x:m.x+v.x,y:m.y+v.y};
          alcance=Math.max(alcance,dist(h,w)/L);const brazo=Recortes.ikContinuo(h,w,L,sj,42,m.dobla,1.08),q=R.aPantalla(p,Recortes.muestras(brazo,32)[16]),key=k+b;
          if(ultimos[key])codo=Math.max(codo,dist(q,ultimos[key]));ultimos[key]=q;
        }
      }
    }
    const pasos=[T.sQuita1,T.sSuelta,T.sCoge,T.sPone,T.sRecoge,T.sPone2,T.sSaca,T.gCoge,T.gPone];
    const enlaces=pasos.map(t=>{const a=estado(t-1e-6),b=estado(t+1e-6);return Math.max(dist(a.au.A,b.au.A),dist(a.au.B,b.au.B),dist(a.au.Y,b.au.Y),dist(a.h.finA,b.h.finA),dist(a.h.finB,b.h.finB));});
    const cv=document.createElement('canvas');cv.width=cv.height=64;const ctx=cv.getContext('2d');
    const muestra=(t,etiqueta)=>{const {s,g,au,h}=estado(t),a=etiqueta==='A',q=a?h.finA:h.finB;
      const pixels=dibuja=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,64,64);ctx.setTransform(4,0,0,4,32-4*q.x,32-4*q.y);dibuja();
        const b=ctx.getImageData(29,29,6,6).data;let n=0;for(let j=3;j<b.length;j+=4)if(b[j]>160)n++;return n;};
      return [pixels(()=>D.auricular(ctx,a?au.A:au.B,a?h.a:h.b,1)),pixels(()=>D.cable(ctx,au.Y,q,D.L_RAMA,a?-.42:.37))];};
    const unionDibujada=[muestra(1.4,'A'),muestra(4.75,'A'),muestra(5.43,'B'),muestra(6.47,'A'),muestra(7.6,'B'),muestra(11.16,'B')];
    const boca=Math.max(...D.NOTAS_G.map(n=>dist(D.origenG(n.t0),D.bocaGs(D.poseG(n.t0)))));
    const suelto=estado(5.3),cuelga=dist(suelto.au.Y,suelto.au.A)-D.VARILLA;
    const recibe=estado(T.gCoge),entrega=dist(D.ptMano(S,recibe.s,recibe.s.manoLejos,D.PINZA),D.ptMano(G,recibe.g,recibe.g.manoCerca,D.PINZA));
    const cambios=[4.55,6.98,11.45].map(t=>{const a=estado(t).au;return [a.enA,a.enB];});
    const fasesOk=JSON.stringify(cambios)===JSON.stringify([['cuelga','orejaG'],['oreja','oreja'],['oreja','orejaG']]);
    const m={errorL,apoyo,alcance,mirada,codo,centro,enlaces,cuelga,boca,entrega,unionDibujada,cambios};
    if(errorL>.11||Math.max(apoyo,mirada,centro,boca,entrega,...enlaces)>.012||alcance>1.075||codo>18||Math.abs(cuelga-D.L_RAMA)>.002||unionDibujada.some(pair=>pair.some(x=>x<5))||!fasesOk)throw Error(JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00130.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
