const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00095.2 Guillermo y Marta - el gato.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00095_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-7;
    if(!(T.hombro<T.aCabeza0&&T.aCabeza1<T.gira0&&T.gira1<T.zarpa1&&T.zarpa2<T.amasa0))throw Error('Orden de las acciones del gato');
    let gap=0,maxPawReach=0,rope=0,arm=-Infinity,join=0;
    for(const t of [T.golpe1,T.golpe2,T.zarpa1,T.zarpa2]){
      const {gato:p,cana:c}=D.pose(t),geo=D.geoGato(p),marco=D.gatoMarco(p),q=marco.suelo({x:p.fnx,y:p.fny});
      const root=marco.cuerpo({x:geo.Sh.x-4,y:8}),goal=t<T.abalanza?c.pluma:D.puntoCuerda(c,.55);
      maxPawReach=Math.max(maxPawReach,dist(root,q));gap=Math.max(gap,dist(q,goal));
    }
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){const {cana:c,g,m}=D.pose(i/120);if(c)rope=Math.max(rope,dist(c.punta,c.pluma)-D.CUERDA);
      for(const [R,p] of [[Guillermo,g],[Marta,m]])for(const [side,near] of [['Cerca',true],['Lejos',false]]){
        const hand=p['mano'+side],h=R.tronco(p)(near?R.HOMBRO_C:R.HOMBRO),r=R.MUNECA_R*R.JK,ang=hand.mu+(hand.ang||0);
        arm=Math.max(arm,p.s*R.K*(Math.hypot(hand.x+r*Math.cos(ang)-h.x,hand.y+r*Math.sin(ang)-h.y)-(near?R.BRAZO_C_L:R.BRAZO_L)*1.08));
      }
    }
    for(const t of [T.saltaG0,T.saltaG1,T.abalanza,T.muslo,T.hombro,T.aCabeza0,T.aCabeza1]){const a=D.pose(t-eps).gato,b=D.pose(t+eps).gato;join=Math.max(join,dist(a,b),Math.abs(a.a-b.a));}
    const before=D.pose(T.toma-eps).cana,after=D.pose(T.toma+eps).cana;
    const transfer=Math.max(dist(before.mango,after.mango),dist(before.punta,after.punta));
    if(!before.deM||after.deM||maxPawReach>2*15.5*.995||Math.max(gap,rope,join,transfer)>.01||arm>0||!Marta.listo()||!Guillermo.listo())throw Error(JSON.stringify({gap,maxPawReach,rope,join,transfer,arm}));
    return {testedSwats:4,maximumRenderedPawGapPx:gap,pawReachRequiredPx:maxPawReach,pawReachAvailablePx:2*15.5*.995,rodHandoffGapPx:transfer,ropeExcessPx:rope,catTransitionError:join,maximumWristExcessPx:arm};
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
  console.log(JSON.stringify({scene: "00095.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
