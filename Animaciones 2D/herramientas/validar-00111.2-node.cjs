const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00111.2 Guillermo y Rodri - el pulso de dedos.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00111_2;
    const {T}=D, eps=1e-7, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    let wrist=0,bow=Infinity,pin=[Infinity,-Infinity],cheat=0,match=0,missing=0,wash=0,blow=0,smoke=0,zoom=0,speed=[Infinity,0];
    const contacts=T.choques.map(t=>{const st=D.estado(t);return Math.abs(dist(st.g.tip,st.r.tip)-D.WP*.86);});
    const flashes=T.choques.map(t=>[D.estado(t-eps).marcas.filter(m=>m.tipo==='choque').length,D.estado(t+.03).marcas.filter(m=>m.tipo==='choque').length]);
    const rp=D.poseR(T.toc),gp=D.poseG(T.toc),face=Guillermo.aPantalla(gp,Guillermo.cabeza(gp).a(D.FRENTE_G)),actual=D.puntaIndice(Rodri,rp,rp.manoLejos),flick=dist(face,actual);
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const t=i/120,e=D.estado(t),{g,r}=D.pose(t),k=D.pesoAgarre(t);
      wrist=Math.max(wrist,...Object.values(D.diag(t)));
      if(t>=T.reverencia&&t<=T.reverenciaFin)bow=Math.min(bow,dist(e.g.tip,e.r.tip)-D.WP*.86);
      if(t>=T.pisa+.05&&t<=T.trampaPisa-.06){const p=D.superficiePulgar(e.g,.92,e.wG),d=D.WP*.86*e.wR/2+(p.x-e.r.tip.x)*p.nx+(p.y-e.r.tip.y)*p.ny;pin=[Math.min(pin[0],d),Math.max(pin[1],d)];}
      if(t>=T.trampaPisa+.025&&t<=T.zoomOut1){const p=D.superficiePulgar(e.r,.58,e.wR);cheat=Math.max(cheat,Math.abs(dist(p,e.contactoTrampa)-1));}
      if(t>=T.zoomOut0&&t<=T.suelta){const q=D.aMundo(e.contactoTrampa);match=Math.max(match,dist(q,D.puntaIndice(Guillermo,g,g.manoLejos)));}
      if(t>=T.clac-.02&&t<=T.suelta+.14){missing=Math.max(missing,Math.abs(1-k-g.manoCerca.puno),Math.abs(1-k-r.manoLejos.puno));}
      if(t>=T.frota+.36&&t<=T.frotaFin){const f=Guillermo.aPantalla(g,Guillermo.cabeza(g).a(D.FRENTE_G));wash=Math.max(wash,dist(f,D.puntaIndice(Guillermo,g,g.manoLejos)));}
      if(t>=T.sopla+.25&&t<=T.soplaFin){const b=D.bocaPant(Rodri,r);blow=Math.max(blow,dist({x:b.x-14,y:b.y+5},D.puntaIndice(Rodri,r,r.manoLejos)));}
      if((t>=T.zoomIn0&&t<=T.zoomIn1)||(t>=T.zoomOut0&&t<=T.zoomOut1)){const a=D.camGeneral(t),b=D.camPrimerPlano(t,a);for(const u of [e.g.tip,e.r.tip]){const q=D.aMundo(u);zoom=Math.max(zoom,dist({x:(q.x-a.x)*a.k,y:(q.y-a.y)*a.k},{x:(u.x-b.fx)*b.k,y:(u.y-b.fy)*b.k}));}}
      if(t>=T.silba&&t<=T.gBizco){const v=120*(D.faseSilbido(t)-D.faseSilbido(t-1/120));speed=[Math.min(speed[0],v),Math.max(speed[1],v)];}
    }
    for(let i=0;i<4;i++){
      const t=T.sopla+.15+i*.105,p=D.poseR(t),tip=D.puntaIndice(Rodri,p,p.manoLejos),q=D.humoEn(t,i),up=D.humoEn(t+.26,i);
      if(!q||!up||up.y>=tip.y||D.humoEn(t-.001,i)!==null)throw Error('trayectoria del humo');
      smoke=Math.max(smoke,dist(q,tip),q.alfa);
    }
    const paper=document.createElement('canvas');paper.width=1024;paper.height=600;
    const ink=paper.getContext('2d'),m=rp.manoLejos,c=Rodri.aPantalla(rp,m),scale=rp.s*Rodri.K*Rodri.JK;
    ink.save();ink.translate(c.x,c.y);ink.scale(-scale,scale);
    Personaje2D.mano(ink,m,{piel:'#edb38a',sombra:'#c87c64',tinta:'#111111'});ink.restore();
    const patch=ink.getImageData(Math.floor(face.x)-2,Math.floor(face.y)-2,5,5).data;
    const pixels=Array.from({length:25},(_,i)=>patch[i*4+3]);const skin=Math.max(...pixels),outside=Math.min(...pixels);
    if(skin<160||outside>75)throw Error('La punta dibujada no coincide con el borde del golpe '+JSON.stringify({skin,outside}));
    if(Math.max(flick,...contacts,cheat,match,missing,blow,smoke,zoom)>.02||bow<12||pin[0]<-.02||pin[1]>2.1||wash>3.01||speed[0]<.899||speed[1]>1.801||wrist>1.08||flashes.some(v=>v[0]!==0||v[1]!==1))throw Error(JSON.stringify({flick,contacts,cheat,match,missing,blow,smoke,zoom,bow,pin,wash,speed,wrist,flashes}));
    return {fingertipEdgeAlpha:[outside,skin],flickToForeheadPx:flick,threeThumbTapsPx:contacts,sparksBeforeAfterTaps:flashes,bowClearance:bow,pinCompression:pin,cheatingFingerContactError:cheat,closeWideFingerErrorPx:match,missingHandWeight:missing,handOnForeheadPx:wash,blowTargetErrorPx:blow,smokeAtFingerPx:smoke,zoomJoinPx:zoom,whistleSpeed:speed,maxWristRatio:wrist};
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
  console.log(JSON.stringify({scene: "00111.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
