const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00102.2 Guillermo y Paradigma - la moto.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00102_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-7,ident={a:1,b:0,c:0,d:1,e:0,f:0};
const anchors=t=>{const {g}=D.pose(t),m=D.marcoG(t)||ident,world=q=>D.apl(m,Guillermo.aPantalla(g,q));
  return [g.pelvis,g.manoCerca,g.manoLejos,g.piernas.cerca.tob,g.piernas.lejos.tob,Guillermo.cabeza(g).a({x:800,y:500})].map(world);};
const joins = {};
for(const key of ['salta','aterriza','sube0','lanza','seto']) {
  const t=T[key],before=anchors(t-eps),after=anchors(t+eps);
  joins[key]=Math.max(...before.map((q,i)=>dist(q,after[i])));
}
let contact=0,penetration=0,jacket=0,rail=0,gas=0,reach=-Infinity,rise=0,rebound=0;
for(let i=0;i<=Math.ceil(D.DUR*120);i++){
  const t=i/120,{p,g}=D.pose(t),m=D.moto(t),rear=D.centroRueda(m,D.RA),front=D.centroRueda(m,D.FA);
  contact=Math.max(contact,Math.abs(Math.max(rear.y,front.y)+D.RR-D.SY));
  penetration=Math.max(penetration,rear.y+D.RR-D.SY,front.y+D.RR-D.SY);
  rise=Math.max(rise,D.SY-front.y-D.RR);rebound=Math.max(rebound,D.SY-rear.y-D.RR);
  gas=Math.max(gas,dist(Paradigma.aPantalla(p,p.manoLejos),D.PUNO_GAS));
  if(t>=T.aterriza&&t<=T.lanza){jacket=Math.max(jacket,dist(Guillermo.aPantalla(g,g.manoLejos),D.agarreJinete(p)));rail=Math.max(rail,dist(Guillermo.aPantalla(g,g.manoCerca),D.AGARRE_ASA));}
  for(const [actor,body] of [[Guillermo,g],[Paradigma,p]])for(const [side,joint,limit] of [['Cerca',actor.HOMBRO_C,actor.BRAZO_C_L],['Lejos',actor.HOMBRO,actor.BRAZO_L]]){
    const hand=body['mano'+side];if(!hand)continue;
    const h=actor.tronco(body)(joint),r=actor.MUNECA_R*actor.JK,angle=hand.mu+(hand.ang||0);
    const extension=Math.hypot(hand.x+r*Math.cos(angle)-h.x,hand.y+r*Math.sin(angle)-h.y);
    reach=Math.max(reach,(extension-limit*1.08)*body.s*(actor.K||1));
  }
}
const glasses=t=>{const p=D.poseP(t),a=D.estadoGafas(t,p).A;return [D.GF.bisagra,D.GF.lc,D.GF.ll].filter(Boolean).map(q=>D.apl(a,q));};
const before=glasses(T.pone-eps),after=glasses(T.pone+eps),glassesJoin=Math.max(...before.map((q,i)=>dist(q,after[i])));
if (Math.max(...Object.values(joins), contact, penetration, jacket, rail, gas, glassesJoin) > 0.02 || rise < 160 || rebound < 15 || reach > 0) throw Error("Fallo en el apoyo, el salto o los agarres de la moto");
    return {poseJoinsPx:joins,roadContactPx:contact,tyrePenetrationPx:penetration,frontRisePx:rise,rearReboundPx:rebound,jacketGripPx:jacket,railGripPx:rail,throttleGripPx:gas,glassesJoinPx:glassesJoin,wristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00102.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
