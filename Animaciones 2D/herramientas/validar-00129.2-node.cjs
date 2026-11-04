const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00129.2 Guillermo y Sara - el baile gotico.js", "sara-saez");
  const original=await load("escenas/00129 Guillermo y Sara - el baile gotico.js","sara-saez");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00129_2;
    const {T}=D,G=Guillermo,S=SaraSaez,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const golpe=D.talon(D.pose(T.gTope).g),despues=D.talon(D.pose(T.gTope+.26).g),boq=D.bocaTubo(T.chorro),
      tray={x:D.MAQ.boq.x+30*D.dirTubo.x,y:D.MAQ.boq.y+30*D.dirTubo.y},ini=D.agarre(T.tiron0),fin=D.agarre(T.sSuelta);
    let error=0,estira=0,minAire=100,visible=100,peorPaso=0,invasion=-1e4;
    for(let n=0;n<=D.DUR*180;n++){
      const t=n/180,{s,g}=D.pose(t);
      if(t>=T.sPinza&&t<=T.sSuelta){
        const m=s.manoLejos,sh=S.tronco(s)(S.HOMBRO),w={x:m.x+Math.cos(m.mu)*S.JK*S.MUNECA_R,y:m.y+Math.sin(m.mu)*S.JK*S.MUNECA_R};
        estira=Math.max(estira,d(w,sh)/S.BRAZO_L);error=Math.max(error,d(D.yemaPinza(s,m),D.agarre(t)));visible=Math.min(visible,D.bordeNiebla(t,D.agarre(t).x)-D.agarre(t).y);
      }
      if(t>=6.04&&t<=6.14)minAire=Math.min(minAire,(1250-g.piernas.cerca.tob.y)*g.s,(1238-g.piernas.lejos.tob.y)*g.s);
      if(t>T.gTope+.02)invasion=Math.max(invasion,D.talon(g).x-D.MAQ.x0);
      if(t>=T.tiron0-.05&&t<=T.sSuelta+.2)peorPaso=Math.max(peorPaso,d(D.agarre(t),D.agarre(t-1/180)));
    }
    const tos=[T.tos1,T.tos2].map(t=>d(D.origenTos(t),G.aPantalla(D.pose(t).g,G.boca(D.pose(t).g))));
    const ojo=D.pose(9.02).s.cara.ojos,aletas=[8.55,9.2,9.91,10.26,10.36,10.46].map(t=>{const q=D.tufo(t);return [q.x,D.bordeNiebla(t,q.x)-q.y,D.giroG(t)];});
    const cv=document.createElement("canvas");cv.width=1024;cv.height=600;const ctx=cv.getContext("2d");
    const raster=t=>{ctx.clearRect(0,0,1024,600);D.dibujaG(ctx,t,D.pose(t).g);return ctx.getImageData(0,0,1024,600).data;};
    const pelo=[7.62,8.55,9.2,10.56].map(t=>{
      const pic=raster(t);let opacos=0,piel=0;
      for(let x=470;x<830;x++)for(let y=135;y<Math.min(360,Math.floor(D.bordeNiebla(t,x)-2));y++){
        const j=4*(1024*y+x);if(pic[j+3]<210)continue;opacos++;if(pic[j]>198&&pic[j+1]>118&&pic[j+2]<175&&pic[j]-pic[j+2]>75)piel++;}
      return [opacos,piel];
    });
    const pic=raster(T.gTope);let suela=0;
    for(let y=Math.round(golpe.y)-2;y<=Math.round(golpe.y)+2;y++)for(let x=749;x<753;x++)if(pic[4*(1024*y+x)+3]>110)suela++;
    const m={golpe,retroceso:D.MAQ.x0-despues.x,salto:D.salto(6.09),minAire,tos,boq,error,estira,visible,peorPaso,invasion,levantado:ini.y-fin.y,haciaSara:ini.x-fin.x,ojo,aletas,pelo,suela};
    if(Math.abs(golpe.x-D.MAQ.x0)>.001||m.retroceso<8||pelo[0][0]!==0||pelo.slice(1).some(([p,n])=>p<50||n>p*.05)||suela<2||error>.003||estira>1.06||visible<2||peorPaso>4||Math.max(...tos,d(boq,tray))>.001||D.dirTubo.y>-.5||m.levantado<23||m.haciaSara<12||minAire<7||m.salto<15||invasion>2||ojo.d-ojo.i<.45||aletas[1][0]-aletas[0][0]<70||aletas[2][2]>-.9||aletas[4][1]>aletas[3][1]-12)throw Error(JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00129.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
