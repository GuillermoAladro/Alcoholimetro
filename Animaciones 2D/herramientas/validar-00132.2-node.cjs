const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00132.2 Guillermo y Yorgi - las flexiones.js", "yorgi");
  const original=await load("escenas/00132 Guillermo y Yorgi - las flexiones.js","yorgi");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00132_2;
    const {T,FY}=D,R=Guillermo,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const arriba=[T.r1,T.r2,T.r3].map(([a,b,c])=>[D.asiento(a).y,D.asiento(b).y,D.asiento(c).y]);
    let pie=0,suelo=0,asiento=0,cuello=0,minLibre=1000,alcance=0,antebrazo=0;
    for(let n=0;n<=D.DUR*120;n++){const t=n/120,y=D.poseY(t),g=D.poseG(t);
      for(const [q,xx] of [[y,D.XPY],...(t<T.gSalta?[[g,D.XPG]]:[])])for(const [brazo,prof] of [['cerca',0],['lejos',6]]){
        const p=D.huella(q,brazo);pie=Math.max(pie,Math.abs(p.y-(FY-prof)));if(!prof)pie=Math.max(pie,Math.abs(p.x-xx));}
      const fija=(q,m,h)=>{suelo=Math.max(suelo,Math.abs(D.apoyoMano(q,m).y-(FY-h)));};
      if(t<T.p1[2]||(t>T.p1[4]&&t<T.p2[2])||(t>T.p2[4]&&t<=T.una0)||t>=T.yApoya1+.2){fija(y,y.p.manoCerca,0);fija(y,y.p.manoLejos,6);}
      if(t>=T.una1&&t<=T.yMano1)fija(y,y.p.manoLejos,6);
      if(t<T.gAgacha){fija(g,g.p.manoCerca,0);fija(g,g.p.manoLejos,6);}
      if(t>=T.gCae0&&t<=T.gLevanta1)cuello=Math.max(cuello,Math.hypot(g.p.cabeza.dx,g.p.cabeza.dy)*g.p.s);
      if(t>=T.gAterriza){asiento=Math.max(asiento,d(D.enMundo(g,R.tronco(g.p)(D.APOYO_G)),D.asiento(t)));
        minLibre=Math.min(minLibre,FY-D.huella(g,'cerca').y,FY-D.huella(g,'lejos').y);}
      if(t>=T.gPulgar1){const m=g.p.manoCerca,L=R.BRAZO_C_L,root=R.tronco(g.p)(R.HOMBRO_C),
        w={x:m.x+Math.cos(m.mu)*R.MUNECA_R*R.JK,y:m.y+Math.sin(m.mu)*R.MUNECA_R*R.JK},c=Recortes.ik(root,w,L,R.A.datos.piezas.brazo_cerca.codo,42,m.dobla,1.08),
        p=Recortes.muestras(c,32),a=D.enMundo(g,p[19]),b=D.enMundo(g,p[31]);antebrazo=Math.max(antebrazo,Math.abs(Math.atan2(b.y-a.y,a.x-b.x)*180/Math.PI));}
      alcance=Math.max(alcance,...Object.values(D.diag(t)));
    }
    const palmadas=[T.p1,T.p2].map(v=>{const q=D.poseY(v[3]),a=D.puntoMano(q,q.p.manoCerca,D.CANTO_C),b=D.puntoMano(q,q.p.manoLejos,D.CANTO_L);
      return [d(a,b),d(a,D.palmadaY(q)),FY-D.apoyoMano(q,q.p.manoCerca).y];});
    const frente=D.barbilla(D.poseG(T.gCae1)),guino=D.poseY(T.guino+.12).p.cara.ojos;
    const cambio=[T.gSalta,T.gAterriza].map(t=>{const a=D.poseG(t-1e-7),b=D.poseG(t+1e-7);return Math.max(d(D.barbilla(a),D.barbilla(b)),d(D.huella(a,'cerca'),D.huella(b,'cerca')),d(a.M.W,b.M.W));});
    const cm=document.createElement('canvas');cm.width=cm.height=60;const ctx=cm.getContext('2d');
    const pixels=(q,draw)=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,60,60);ctx.setTransform(4,0,0,4,30-4*q.x,30-4*q.y);draw();
      const v=ctx.getImageData(24,24,12,12).data;let n=0;for(let i=3;i<v.length;i+=4)if(v[i]>95)n++;return n;};
    const prendas=[T.gAterriza,T.r1[1],T.r2[2],T.r3[1]].map(t=>{const y=D.poseY(t),g=D.poseG(t),a=D.asiento(t);
      return [pixels(a,()=>D.dibuja(ctx,y,t,false)),pixels(a,()=>D.dibuja(ctx,g,t,true))];});
    const calzado=[.9,3.98,7.6].map(t=>{const y=D.poseY(t),g=D.poseG(t);return [pixels(D.huella(y,'cerca'),()=>D.dibuja(ctx,y,t,false)),pixels(D.huella(g,'cerca'),()=>D.dibuja(ctx,g,t,false))];});
    const chin=pixels(frente,()=>D.dibuja(ctx,D.poseG(T.gCae1),T.gCae1,false));
    const t=11.15,y=D.poseY(t),cabeza=D.enMundo(y,Yorgi.centroCabeza(y.p)),hombro=D.asiento(t),retrato=[pixels(cabeza,()=>D.cabezaDelante(ctx,y,t)),pixels(hombro,()=>D.cabezaDelante(ctx,y,t))];
    const m={pie,suelo,asiento,cuello,minLibre,alcance,antebrazo,palmadas,arriba,frente,guino,cambio,prendas,calzado,chin,retrato};
    if(Math.max(pie,suelo,asiento,Math.abs(frente.y-FY))>.012||cuello>8||minLibre<5.9||alcance>1.08||antebrazo>1.1||palmadas.some(q=>q[0]>.003||q[1]>.003||q[2]<50)||arriba.some(([a,b,c])=>b-Math.max(a,c)<45)||Math.max(...cambio)>.035||guino.d-guino.i<.65||prendas.some(x=>Math.min(...x)<6)||calzado.some(x=>Math.min(...x)<6)||chin<4||retrato[0]<20||retrato[1]!==0)throw Error(JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00132.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
