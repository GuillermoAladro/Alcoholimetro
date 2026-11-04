const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00094.2 Guillermo y Marta - la pinza del pelo.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00094_2;
    const {T}=D,eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),xy=(a,x=0,y=0)=>({x:a.e+a.a*x+a.c*y,y:a.f+a.b*x+a.d*y});
    function clip(t){
      const {g,m}=D.pose(t);
      if(m.pinzaAF)return {a:m.pinzaAF,o:m.pinzaAbre};
      if(g.pinzaAF)return {a:g.pinzaAF,o:g.pinzaAbre};
      const e=g.est.pinza;if(!e)return null;
      const c=e.en==='pua'?D.pinzaEnPuaRet(g.est):{q:D.PELO.GP,a:-.04};c.a+=e.gira||0;
      return {a:D.pinzaAfinRet(D.afCab(Guillermo,g),c,1),o:e.abre};
    }
    let seam=0,aperture=0,reach=-Infinity;
    for(const t of [T.gCoge,T.gSuelta1,T.gQuita,T.clac]){
      const a=clip(t-eps),b=clip(t+eps);
      for(const [x,y] of [[0,0],[-14,0],[13,4]])seam=Math.max(seam,dist(xy(a.a,x,y),xy(b.a,x,y)));
      aperture=Math.max(aperture,Math.abs(a.o-b.o));
    }
    const release=dist(xy(clip(T.mQuita).a),D.enCab(Marta,D.pose(T.mQuita).m,D.PINZA_M));
    const anchor=t=>{const m=D.pose(t).m;return D.estadoGoma(t,m).c;};
    const tieTip=D.enCab(Marta,D.pose(T.mGoma+.22).m,{x:D.MONO_M.x+4,y:D.MONO_M.y+34});
    const hairTie=dist(anchor(T.mGoma+.22),tieTip);
    let contact=0;
    for(const t of [T.gEngancha,T.gSuelta1,T.gCogePinza,T.gQuita]){
      const p=D.pose(t).g,mano=Guillermo.aPantalla(p,p.manoLejos),clipPoint=D.enCab(Guillermo,p,D.pinzaEnPuaRet(p.est).q);
      contact=Math.max(contact,Math.abs(dist(mano,clipPoint)-12));
    }
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
     const {m,g}=D.pose(i/120);
     for(const [R,p] of [[Marta,m],[Guillermo,g]])for(const [side,near] of [['Cerca',true],['Lejos',false]]){
      const h=R.tronco(p)(near?R.HOMBRO_C:R.HOMBRO),hand=p['mano'+side],a=hand.mu+(hand.ang||0),rad=R.MUNECA_R*R.JK;
      reach=Math.max(reach,p.s*R.K*(Math.hypot(hand.x+rad*Math.cos(a)-h.x,hand.y+rad*Math.sin(a)-h.y)-(near?R.BRAZO_C_L:R.BRAZO_L)*1.08));
     }
    }
    const wristJump=dist(anchor(T.mGoma-eps),anchor(T.mGoma+eps));
    const initialGather=Math.max(...D.pose(T.clac).g.est.puas.map(p=>p.pk));
    if(D.PUA_P!==1||reach>0||Math.max(seam,aperture,release,hairTie,wristJump,contact,initialGather)>.01||!Marta.listo()||!Guillermo.listo())throw Error(JSON.stringify({seam,aperture,release,hairTie,wristJump,contact,initialGather,reach}));
    return {clipTransitions:4,maximumClipJoinPx:seam,jawJoinRad:aperture,firstReleasePx:release,rearSpikeGripErrorPx:contact,hairTieJoinPx:wristJump,hairTieFinalGapPx:hairTie,maximumWristExcessPx:reach,posesAt120Hz:Math.ceil(D.DUR*120)+1};
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
  console.log(JSON.stringify({scene: "00094.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
