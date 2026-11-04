const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00096.2 Guillermo y Marta - las palomitas de maiz.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00096_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-7;
    let from=0,into=0,buttons=0,reach=-Infinity;
    for(let i=0;i<=T.come.length;i++){
     const last=i===T.come.length,t0=last?T.mLanza:T.come[i],t1=last?T.atrapa:t0+.22,l=D.poseM(t0).manoM,index=D.PUNADO.length-1-i;
     const o=last?D.enPinza(l,t0):D.enCuenquito(l,index),R=last?Guillermo:Marta,p=last?D.poseG(t1):D.poseM(t1);
     const f=D.vueloGrano(i,t0),q=D.vueloGrano(i,t1);
     from=Math.max(from,dist(o,f));into=Math.max(into,dist(q,R.aPantalla(p,R.boca(p))));
     if(f.v!==D.PUNADO[index][2]||D.vueloGrano(i,t0-eps)||D.vueloGrano(i,t1+eps))throw Error('Origen o variante de la palomita');
    }
    const release=dist(D.sobre(T.lanza),D.centroSobre(D.MANO_SOBRE));
    const landing=dist(D.sobre(T.aterriza-eps),D.sobre(T.aterriza+eps));
    for(const [i,t] of [...T.teclas,T.start].entries()){
     const p=D.poseG(t),m=p.manoLejos,o=D.offsetIndice(Guillermo,m.mu),q=Guillermo.aPantalla(p,{x:m.x+o.x,y:m.y+o.y}),pulso=D.pulsacion(t),num=i<4;
     const tar=num?{x:D.TECLA9.x-1,y:D.TECLA9.y-6+pulso.k9*4.4}:{x:D.BOTON.x,y:D.BOTON.y+pulso.st*.6};
     buttons=Math.max(buttons,dist(q,tar));
     if(D.textoPantalla(t).txt.trim()!==['9','99','9:99','99:99','99:99'][i])throw Error('Pantalla y pulso');
    }
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){const {g,m}=D.pose(i/120);
     for(const [R,p] of [[Guillermo,g],[Marta,m]])for(const [side,near] of [['Cerca',true],['Lejos',false]]){
     const h=R.tronco(p)(near?R.HOMBRO_C:R.HOMBRO),hand=p['mano'+side],ang=hand.mu+(hand.ang||0),r=R.MUNECA_R*R.JK;
     reach=Math.max(reach,p.s*R.K*(Math.hypot(hand.x+r*Math.cos(ang)-h.x,hand.y+r*Math.sin(ang)-h.y)-(near?R.BRAZO_C_L:R.BRAZO_L)*1.08));}}
    const count=[T.coge,...T.come,T.mPinza,T.atrapa].map(D.quedanEnMano);
    if(String(count)!=='5,4,3,2,1,1'||Math.max(from,into,buttons,release,landing)>.01||reach>0||!Marta.listo()||!Guillermo.listo())throw Error(JSON.stringify({count,from,into,buttons,release,landing,reach}));
    return {kernelsHeld:count,numberOfFlights:4,launchGapPx:from,mouthGapPx:into,bagReleasePx:release,bagLandingJoinPx:landing,keyAndStartContactPx:buttons,maximumWristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00096.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
