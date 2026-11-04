const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00101.2 Guillermo y Paradigma - el air guitar.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00101_2;
    D.ajusta();const {T}=D,eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);let reach=-Infinity,uniform=0;
    const lamp=t=>D.bordeLampara(D.anguloLampara(t)),strike=dist(D.puntaPalillo(D.pose(T.choque).g,'lejos',T.choque),lamp(T.choque));
    const bonk=D.pose(T.bonk).g,scalp=Guillermo.aPantalla(bonk,Guillermo.cabeza(bonk).a({x:790,y:250})),hit=dist(scalp,lamp(T.bonk));
    const joins=[T.choque,T.bonk].map(t=>dist(lamp(t-eps),lamp(t+eps)));
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){const t=i/120,p=D.pose(t).g;
     for(const [near,name] of [[true,'Cerca'],[false,'Lejos']]){const m=p['mano'+name],h=Guillermo.tronco(p)(near?Guillermo.HOMBRO_C:Guillermo.HOMBRO),r=Guillermo.MUNECA_R*Guillermo.JK;
     reach=Math.max(reach,p.s*(Math.hypot(m.x+r*Math.cos(m.mu)-h.x,m.y+r*Math.sin(m.mu)-h.y)-(near?Guillermo.BRAZO_C_L:Guillermo.BRAZO_L)*1.08));}}
    for(const [t,lado] of D.GOLPES){const p=D.pose(t).g,h=Guillermo.aPantalla(p,lado==='cerca'?p.manoCerca:p.manoLejos);
     uniform=Math.max(uniform,Math.abs(dist(h,D.puntaPalillo(p,lado,t))-D.VARILLA));}
    const a=D.pose(T.asoma0-eps).g,b=D.pose(T.asoma0+eps).g,join=Math.max(Math.abs(a.suelo-b.suelo),Math.abs(a.x-b.x),...['cerca','lejos'].map(k=>dist(Guillermo.aPantalla(a,a.piernas[k].tob),Guillermo.aPantalla(b,b.piernas[k].tob))));
    const ap=D.pose(T.asoma1).g,h1=Guillermo.aPantalla(ap,ap.manoCerca),ap2=D.pose(T.asoma1-.1).g,h2=Guillermo.aPantalla(ap2,ap2.manoLejos);
    const support=Math.max(Math.abs(h1.y-(D.ESC.borde-2)),Math.abs(h2.y-(D.ESC.borde-4)));
    if(Math.max(strike,hit,uniform,...joins,join)>.025||support>3||reach>0)throw Error(JSON.stringify({strike,hit,uniform,joins,join,support,reach}));
    return {lampStickPx:strike,lampScalpPx:hit,pendulumJoinsPx:joins,stickLengthErrorPx:uniform,drumEvents:D.GOLPES.length,slipAndClimbJoinPx:join,stageRimSupportPx:support,wristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00101.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
