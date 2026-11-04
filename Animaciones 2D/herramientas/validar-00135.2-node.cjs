const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00135.2 Guillermo y Yorgi - el pendiente.js", "yorgi");
  const original=await load("escenas/00135 Guillermo y Yorgi - el pendiente.js","yorgi");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00135_2;
    D.simula();const G=Guillermo,Y=Yorgi,T=D.T,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),sg=p=>p.espejo?-1:1;
    const cerca=(p,t)=>D.orejaA(p,t),pinB=p=>D.ptMano(Y,p,p.manoCerca,D.SEGUNDA);
    const wG=(p,q)=>G.aPantalla(p,G.cabeza(p).a(q));
    const eMini=(p,t)=>{const a=D.giroMini(p,t);return wG(p,{x:D.LOBULO_G.x+(D.ARO_MINI-5)*Math.sin(a),y:D.LOBULO_G.y+(D.ARO_MINI-5)*Math.cos(a)});};
    const planoG=(p,q)=>({x:p.x+(q.x-p.x)*p._sq,y:q.y});
    const trazas=[T.alcC1,T.alcL1].map((t,i)=>{const p=D.poseG(t),q=i?p._pinzaL():p._pinzaC();return dist(q,{x:D.ANILLAS[i],y:D.CY_ANILLA+D.R_AGARRE});});
    const aS=D.poseG(T.fueraA),bS=D.poseG(T.fueraB),aO=D.poseG(T.cuelgaA),bO=D.poseG(T.cuelgaB);
    const entrada=[dist({x:aS._pinzaC().x,y:aS._pinzaC().y-D.R_AGARRE},{x:D.ROD.x0-6,y:D.CY_ANILLA}),dist(D.enManoB(bS,T.fueraB).c,{x:D.ROD.x0-6,y:D.CY_ANILLA}),
      dist(cerca(aO,T.cuelgaA).c,{x:aO._pinzaC().x,y:aO._pinzaC().y-D.R_AGARRE}),dist(D.enManoB(bO,T.cuelgaB).c,D.centroB(bO,T.cuelgaB).c)];
    const f0=D.vueloB(D.T_SUELTA),tem=D.salidaMundo(D.T_SUELTA),pre=D.salidaMundo(D.T_SUELTA-.001),post=D.vueloB(D.T_SUELTA+.001);
    const v0={x:(tem.c.x-pre.c.x)*1000,y:(tem.c.y-pre.c.y)*1000},v1={x:(post.c.x-f0.c.x)*1000,y:(post.c.y-f0.c.y)*1000};
    const yA=D.poseY(D.T_ATRAPA),vuelo=D.vueloB(D.T_ATRAPA-1e-6),captura=D.colgado(yA._pinzaL,D.T_ATRAPA,'B');
    const vueloError=[dist(f0.c,tem.c),Math.abs(f0.sq-tem.sq),Math.abs(f0.rot-tem.a),dist(v0,v1),dist(vuelo.c,captura.c),dist(yA._pinzaL,D.ATRAPA)];
    const yB=D.poseY(T.pasaB),yQ=D.poseY(T.quitaA),gQ=D.poseG(T.quitaA),yP=D.poseY(T.pasa);
    const original=cerca(gQ,T.quitaA),recibe=D.colgado(yQ._pinzaL,T.quitaA,'A');
    const manos=[dist(yB._pinzaL,pinB(yB)),dist(yQ._pinzaL,original.pin),dist(original.c,recibe.c),dist(yP._pinzaL,yP._pinzaC)];
    const vueltas=(D.colgado(pinB(yB),T.pasaB-.06,'B').a-captura.a)/(2*Math.PI);
    const clip=dist(D.miniGeometria(D.poseY(T.clip),T.clip).c,eMini(D.poseG(T.clip),T.clip));
    let maxBrazo=0,minPerfil=1,apoyo=0,pinza=0,dos=999,entre=0;
    for(let n=0;n<=Math.round(D.DUR*120);n++){const t=n/120,g=D.poseG(t),y=D.poseY(t);
      minPerfil=Math.min(minPerfil,g._sq);maxBrazo=Math.max(maxBrazo,...Object.values(D.diag(t)));
      if(t>=T.toca1&&t<=T.toca2)pinza=Math.max(pinza,dist(g._pinzaC(),D.lobuloG(g)));
      if(t>=T.quitaA-.1&&t<=T.quitaA)entre=Math.max(entre,dist(y._pinzaL,cerca(g,t).pin));
      if(t>=T.pasa+.1){const A=D.colgado(y._pinzaC,t,'A'),B=D.colgado(pinB(y),t,'B');dos=Math.min(dos,dist(A.c,B.c));}
      for(const [Q,p] of [[G,g],[Y,y]])for(const l of ['cerca','lejos']){const z=p.piernas[l],q=Q.aPantalla(p,{x:z.tob.x+(Q===G?55.06:66.81),y:z.tob.y+(Q===G?93:82.05)});
        const f=Q===Y?D.pie(t,D.PIES_Y[l]).lev:(l==='lejos'?.3*18*M2.campana(t,T.giro0+.1,T.giro1-.1):0);
        apoyo=Math.max(apoyo,Math.abs(q.y-(D.SUELO-(l==='lejos'?5:0)-f)));}}
    const golpes=D.sim().golpes.map(o=>[o.t,o.q.x,o.q.y]);
    const mira=[T.ve+.22,T.pose+.2].map(t=>{const p=D.poseG(t),h=G.aPantalla(p,G.centroCabeza(p)),ref=D.reflejo(h),o=p.cara.mirada;
      return (o.x*sg(p)*(ref.x-h.x)+o.y*(ref.y-h.y))/(Math.hypot(o.x,o.y)*dist(h,ref));});
    const lc=document.createElement('canvas');lc.width=128;lc.height=128;const c=lc.getContext('2d');
    const px=(q,fn)=>{c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,128,128);c.setTransform(4,0,0,4,64-4*q.x,64-4*q.y);fn();
      const u=c.getImageData(60,60,8,8).data;let n=0;for(let i=3;i<u.length;i+=4)if(u[i]>90)n++;return n;};
    const tk=5.167,p=D.poseG(tk),piel=[D.lobuloG(p),wG(p,D.sim().golpes[0].q)].map(q=>px(q,()=>G.dibujar(c,{...p,capaCabeza:null},tk)));
    const hall=D.colgado(yB._pinzaL,T.pasaB,'B'),madera=px(yB._pinzaL,()=>D.aro(c,hall.c,hall.a,D.RO_S,D.RI_S,hall.sv,1));
    const bolsa=D.poseY(T.bols1),oculto=px(D.miniGeometria(bolsa,T.bols1).c,()=>D.miniEnMano(c,bolsa,T.bols1));
    const z=D.poseY(T.clip-.001),mini=D.miniGeometria(z,T.clip-.001),oro=px({x:mini.c.x,y:mini.c.y+D.ARO_MINI*D.KR-1},()=>D.miniEnMano(c,z,T.clip-.001));
    const m={trazas,entrada,vueloError,manos,vueltas,clip,maxBrazo,minPerfil,apoyo,pinza,dos,entre,golpes,mira,piel,madera,oculto,oro};
    if(Math.max(...trazas,...entrada,...vueloError.slice(0,3),...vueloError.slice(4),...manos,clip,apoyo,entre)>.12||vueloError[3]>1.5||Math.abs(vueltas-2)>.001||maxBrazo>1.08||minPerfil<.38||minPerfil>.40||pinza>.7||dos<3||golpes.length<4||!golpes.some(q=>q[0]>T.giro1&&q[0]<T.quita0)||Math.min(...mira)<.97||Math.min(...piel,madera,oro)<4||oculto!==0)throw Error(JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00135.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
