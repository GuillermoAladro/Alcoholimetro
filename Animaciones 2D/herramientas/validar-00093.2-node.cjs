const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00093.2 Guillermo y Marta - el libro.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00093_2;
    D.pose(0);
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-7;
    let head=0,departure=0,landing=0,grip=0,reach=-Infinity;
    for(const l of D.CAEN){
      const ini=D.enEstante(l,l.tCae,0),start=D.enVuelo(l,l.tCae,ini),end=D.enVuelo(l,l.tLlega,ini),rest=D.enPila(l,l.tLlega);
      departure=Math.max(departure,dist(start,ini),Math.abs(start.a-ini.a));landing=Math.max(landing,dist(end,rest),Math.abs(end.a-rest.a),Math.abs(end.esc-rest.esc));
      if(l.capon){const q=D.enVuelo(l,l.capon,ini),edge=D.esquinaBaja(l,q),p=D.pose(l.capon).g,c=Guillermo.aPantalla(p,Guillermo.cabeza(p).a(D.CIMA_G));
        head=Math.max(head,dist({x:q.x+edge.x,y:q.y+edge.y},c));}
    }
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const t=i/120,p=D.pose(t).g;
      for(const [side,sg,near] of [['Lejos',1,false],['Cerca',-1,true]]){
        const m=p['mano'+side],w=Guillermo.MUNECA_R*Guillermo.JK,a=(m.mu??-1.75)+(m.ang||0),h=Guillermo.tronco(p)(near?Guillermo.HOMBRO_C:Guillermo.HOMBRO);
        reach=Math.max(reach,p.s*(Math.hypot(m.x+w*Math.cos(a)-h.x,m.y+w*Math.sin(a)-h.y)-(near?Guillermo.BRAZO_C_L:Guillermo.BRAZO_L)*1.08));
        if(t>T.cae+.03&&t<T.suelta){const palm=Guillermo.aPantalla(p,m);
          grip=Math.max(grip,dist({x:palm.x+2*Math.cos(m.mu),y:palm.y+2*Math.sin(m.mu)},D.bordeTomo(p.tomo,sg)));}
      }
    }
    const dtomo=Math.max(...[T.tira0,T.tira1,T.cae,T.suelta].map(t=>dist(D.pose(t-eps).g.tomo,D.pose(t+eps).g.tomo)));
    const ta=T.tejado0+.12,qa=D.tejado(ta-eps,D.pose(ta-eps).g),qb=D.tejado(ta+eps,D.pose(ta+eps).g);
    const cover=Math.abs(qa.ang-qb.ang);
    const foot=t=>{const p=D.pose(t).g;return Guillermo.aPantalla(p,p.piernas.lejos.tob);};
    const footGap=dist(foot(T.agacha0-eps),foot(T.agacha0+eps));
    if(D.CAPON.length!==2||Math.max(head,departure,landing,grip,dtomo,cover,footGap)>.01||reach>0||!Marta.listo()||!Guillermo.listo())throw Error(JSON.stringify({head,departure,landing,grip,dtomo,cover,footGap,reach}));
    return {fallingBooks:D.CAEN.length,headHits:D.CAPON.length,headEdgeGapPx:head,shelfReleaseError:departure,pileArrivalError:landing,gripGapPx:grip,tomeHandoffErrorPx:dtomo,roofAngleJumpRad:cover,crouchingFootGapPx:footGap,maximumWristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00093.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
