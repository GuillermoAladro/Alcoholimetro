const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00133.2 Guillermo y Yorgi - el reloj.js", "yorgi");
  const original=await load("escenas/00133 Guillermo y Yorgi - el reloj.js","yorgi");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00133_2;
    const G=Guillermo,Y=Yorgi,T=D.T,F=D.SUELO,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const dedo=(Q,p,m,medio=false)=>D.puntoMano(Q,p,m,D.dedo(m.dedos,medio));
    const reloj=p=>D.esferaDe(D.relojEn(p,p.manoLejos));
    const yReloj=t=>{const p=D.poseY(t),e=reloj(p),f=dedo(Y,p,p.manoCerca);return [dist(f,e),e.y-f.y];};
    const toquesY=[...T.golpes,...T.golpes2].map(yReloj),libres=T.golpes.map(t=>yReloj(t-.08)[1]);
    const toquesG=T.toques.map(t=>{const p=D.poseG(t);return dist(dedo(G,p,p.manoCerca),D.muneca(G,p,p.manoLejos).w);});
    const pA=D.poseY(T.calla),boton=dist(dedo(Y,pA,pA.manoCerca),D.corona(reloj(pA)));
    const antes=D.poseY(T.calla-.11),botonAntes=dist(dedo(Y,antes,antes.manoCerca),D.corona(reloj(antes)));
    const gN=D.poseG(T.pita-.01),yN=D.poseY(T.pita-.01),nar=G.aPantalla(gN,G.cabeza(gN).a({x:857,y:668})),e=reloj(yN);
    const nariz=[dist(nar,e),e.y-nar.y,dist(e,D.ESFERA)];
    let agarre=0,cadera=0,banco=0,apoyo=0,rodillas=0,alcance=0,pat=0,horasalto=0;
    for(let n=0;n<=Math.round(D.DUR*120);n++){const t=n/120,g=D.poseG(t),y=D.poseY(t);
      if(t>=T.agarra&&t<=T.suelta)agarre=Math.max(agarre,dist(D.puntoMano(G,g,g.manoLejos,D.PALMA),D.agarreEn(t)),dist(D.puntoMano(Y,y,y.manoLejos,D.PALMA),D.agarreEn(t)));
      if(t>=T.cae&&t<=T.tira0)cadera=Math.max(cadera,Math.abs(D.costura(G,g,D.ASIENTO_G).y-(F-D.boteG(t))));
      if(t>=T.sienta1&&t<=T.levanta0)banco=Math.max(banco,Math.abs(D.costura(Y,y,D.ASIENTO_Y).y-(D.BANCO.asiento-4)));
      if(t>=T.jadea1&&t<T.yergue0-.05)for(const [lado,m] of [['cerca',g.manoCerca],['lejos',g.manoLejos]]){const r=D.rodilla(G,g,lado);rodillas=Math.max(rodillas,dist(dedo(G,g,m,true),{x:r.x,y:r.y-5}));}
      if(t>=T.palmadas[2]+.3)pat=Math.max(pat,dist(dedo(Y,y,y.manoLejos,true),D.costura(G,g,D.HOMBRO_CAMISA)));
      if(t>=T.frena1&&t<=T.acerca0)apoyo=Math.max(apoyo,Math.abs(D.suela(G,g,'cerca').y-F),Math.abs(D.suela(G,g,'lejos').y-F+5));
      if(t>=T.sienta1&&t<=T.levanta0)apoyo=Math.max(apoyo,Math.abs(D.suela(Y,y,'cerca').y-F),Math.abs(D.suela(Y,y,'lejos').y-F+5));
      horasalto=Math.max(horasalto,D.vueloG(t));
      for(const [Q,p] of [[G,g],[Y,y]])for(const [lado,m] of [['cerca',p.manoCerca],['lejos',p.manoLejos]]){
        const l=(lado==='cerca'?Q.BRAZO_C_L:Q.BRAZO_L)*Q.K*p.s;
        alcance=Math.max(alcance,dist(D.muneca(Q,p,m).w,D.hombro(Q,p,lado))/l);}
    }
    const palmadas=T.palmadas.map(t=>{const medida=z=>{const y=D.poseY(z),g=D.poseG(z);return dist(dedo(Y,y,y.manoLejos,true),D.costura(G,g,D.HOMBRO_CAMISA));};return [medida(t),medida(t-.08)];});
    const luz=[D.minutos(T.tl0),D.minutos(T.tl1),D.solEn(0).y,D.solEn(1).y,D.sombraDe(0).k,D.sombraDe(1).k,D.encendida(T.tl0),D.encendida(T.tl1)];
    const pF=D.poseY(T.guino+.21),gui=pF.cara.ojos.i-pF.cara.ojos.d;
    const lienzo=document.createElement('canvas');lienzo.width=lienzo.height=64;const ctx=lienzo.getContext('2d');
    const pixels=(q,draw)=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,64,64);ctx.setTransform(4,0,0,4,32-4*q.x,32-4*q.y);draw();
      const u=ctx.getImageData(28,28,8,8).data;let opaco=0;for(let i=3;i<u.length;i+=4)if(u[i]>90)opaco++;return opaco;};
    const telas=[[G,D.poseG(T.cae),D.ASIENTO_G],[Y,D.poseY(2.32),D.ASIENTO_Y],[G,D.poseG(13.7),D.HOMBRO_CAMISA]].map(([Q,p,q])=>pixels(D.costura(Q,p,q),()=>Q.dibujar(ctx,p,0)));
    const pulsera=pixels(D.relojEn(yN,yN.manoLejos).correa,()=>Y.dibujar(ctx,yN,T.pita-.01)),corona=pixels(D.corona(reloj(pA)),()=>D.dibReloj(ctx,D.relojEn(pA,pA.manoLejos),{t:T.calla,pita:0}));
    const m={toquesY,libres,toquesG,boton,botonAntes,nariz,agarre,cadera,banco,apoyo,rodillas,alcance,pat,palmadas,luz,horasalto,gui,telas,pulsera,corona};
    if(toquesY.some(([m,h])=>Math.abs(m-4)>.01||Math.abs(h-4)>.01)||Math.min(...libres)<15.95||Math.max(...toquesG,boton,agarre,cadera,banco,apoyo,rodillas,pat)>.04||botonAntes<5||nariz[0]<10||nariz[0]>18||nariz[1]<8||nariz[2]>.05||alcance>1.075||palmadas.some(([c,s])=>c>.25||s<12)||horasalto<61.8||gui<.7||luz[0]>.1||luz[1]<269||luz[1]>271||luz[3]-luz[2]<120||luz[5]<luz[4]*5||luz[6]!==0||luz[7]!==1||Math.min(...telas,pulsera,corona)<5)throw Error(JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00133.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
