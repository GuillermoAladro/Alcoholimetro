const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00103.2 Guillermo y Paradigma - la meditacion.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00103_2;
    const { T } = D;
    const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const fly = t => D.moscaEn(t,D.pose(t).g);
    const epsilon = 1e-7, joins = [T.mosca0,T.esquiva,T.halo].map(t => distance(fly(t-epsilon),fly(t+epsilon)));
    const ring = D.puntoAnillo(D.haloCentro(T.halo),T.halo,Math.PI*1.1);
    const haloContact = distance(fly(T.halo),ring), waveBefore = D.ondaHalo(T.halo-0.02);
    let closest = Infinity, grip = 0, shoeJump = 0, reach = -Infinity;
    const turn = t => Math.cos(Math.PI*D.pose(t).g.cruz.lejos.zr);
    for(let i=0;i<=Math.ceil(D.DUR*120);i++) {
      const t=i/120, {g,p}=D.pose(t);
      if(t>=T.mano0 && t<=T.mano1) {
        for(const finger of [[6.9,14.5,0.17],[2.3,16,0.05],[-2.3,15,-0.07],[-6.7,12,-0.2]]) {
          closest=Math.min(closest,distance(D.yemaManotazo(g,...finger),fly(t)));
        }
      }
      if(t>=T.pie0+0.14 && t<=T.pie1-0.02) grip=Math.max(grip,distance(g.cruz.cerca.a,g.manoCerca)*g.s);
      if(t>T.pie0 && t<T.pie1) shoeJump=Math.max(shoeJump,Math.abs(turn(t)-turn(t-1/120)));
      for(const [actor,body] of [[Guillermo,g],[Paradigma,p]]) {
        for(const [side,joint,limit] of [['Cerca',actor.HOMBRO_C,actor.BRAZO_C_L],['Lejos',actor.HOMBRO,actor.BRAZO_L]]) {
          const m=body['mano'+side], h=actor.tronco(body)(joint),r=actor.MUNECA_R*actor.JK,angle=m.mu+(m.ang||0);
          reach=Math.max(reach,(Math.hypot(m.x+r*Math.cos(angle)-h.x,m.y+r*Math.sin(angle)-h.y)-limit*1.08)*body.s*actor.K);
        }
      }
    }
    const before=D.globoMoco(T.pop-epsilon), after=D.globoMoco(T.pop+epsilon), later=D.globoMoco(T.pop+0.25);
    const bubbleJoin=distance(before.c,after.c), bubbleDrift=distance(after.c,later.c);
    const bambooDrop = Math.min(...D.TOCS.map(t=>D.bocaCana(t).y-D.bocaCana(t-0.2).y));
    const spoutClearance = D.bocaCana(0).y-D.GRIFO.y, exitY=fly(T.saleMosca).y;
    if (Math.max(...joins,haloContact,waveBefore,grip,bubbleJoin,bubbleDrift)>0.02 ||
        closest<12 || closest>23 || shoeJump>0.15 || bambooDrop<35 || spoutClearance<10 || exitY> -30 || reach>0) throw Error('Movimiento discontinuo o contacto incorrecto en La meditación');
    return {flyJoinsPx:joins,haloContactPx:haloContact,waveBeforeImpact:waveBefore,nearestFingerPx:closest,ankleGripPx:grip,largestShoeProjectionStep:shoeJump,bubbleJoinPortraitUnits:bubbleJoin,bubbleDriftPortraitUnits:bubbleDrift,bambooMouthDropPx:bambooDrop,spoutToMouthPx:spoutClearance,flyExitY:exitY,wristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00103.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
