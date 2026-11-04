const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00104.2 Guillermo y Paradigma - el pelo largo.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00104_2;
    const {T}=D, distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const transform=(A,p)=>({x:A.a*p.x+A.c*p.y+A.e,y:A.b*p.x+A.d*p.y+A.f});
    const keyTimes=['lanza','aterriza','despega','llega'], joins={};
    for(const key of keyTimes) {
      const t=T[key], a=D.afPeluca(t-1e-7), b=D.afPeluca(t+1e-7);
      joins[key]=Math.max(...[[0,0],[-280,80],[280,80],[0,820]].map(([x,y])=>distance(transform(a,{x,y}),transform(b,{x,y}))));
    }
    let angle=0, last, maxBackward=0;
    for(let i=0;i<=600;i++) {
      const t=T.despega+(T.llega-T.despega)*i/600, theta=D.descompone(D.afPeluca(t)).th;
      if(i) {const delta=Math.atan2(Math.sin(theta-last),Math.cos(theta-last));angle+=delta;maxBackward=Math.max(maxBackward,delta);}
      last=theta;
    }
    const ends=D.vuelos(), seatAngle=ends.e2.th-ends.s2.th;
    const turns=(angle-Math.atan2(Math.sin(seatAngle),Math.cos(seatAngle)))/(2*Math.PI);
    const margins={vuelo1:Infinity,vuelo2:Infinity};
    for(let i=Math.ceil(T.lanza*120);i<=Math.ceil(T.llega*120);i++) {
      const t=i/120,mode=D.estadoPeluca(t).modo;
      if(!(mode in margins))continue;
      const A=D.afPeluca(t), camera=D.camara(t), spring=D.muelle(t),shape={...spring,viento:D.vientoPeluca(t)};
      const points=D.CASQUETE.map(([x,y])=>({x,y}));
      for(const strand of D.MECHONES) for(const ribbon of D.cintasMechon(strand,shape,D.tau(t))) points.push(...ribbon.izq,...ribbon.der);
      for(const q of points) {const p=transform(A,q),x=512+(p.x-camera.f.x)*camera.k,y=300+(p.y-camera.f.y)*camera.k;
        margins[mode]=Math.min(margins[mode],x,y,1024-x,600-y);}
    }
    let grip=0, reach=-Infinity;
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const t=i/120,{g,p}=D.pose(t);
      if(D.estadoPeluca(t).modo==='mano') {
        const physical=D.aPantallaG(Guillermo,g,g.manoLejos),crown=transform(D.afPelucaMano(t),{x:0,y:-D.AGARRE});
        grip=Math.max(grip,distance(physical,crown));
      }
      for(const [rig,body] of [[Guillermo,g],[Paradigma,p]]) for(const [side,joint,limit] of [['Cerca',rig.HOMBRO_C,rig.BRAZO_C_L],['Lejos',rig.HOMBRO,rig.BRAZO_L]]){
        const m=body['mano'+side],h=rig.tronco(body)(joint),r=rig.MUNECA_R*rig.JK,a=m.mu+(m.ang||0);
        reach=Math.max(reach,(Math.hypot(m.x+r*Math.cos(a)-h.x,m.y+r*Math.sin(a)-h.y)-limit*1.08)*body.s*rig.K);
      }
    }
    const pickup=D.afPelucaMano(T.mete1), box=D.CAJA;
    const strips=D.MECHONES.flatMap(s=>D.cintasMechon(s,{a:0,b:0,abre:0,viento:0},D.tau(T.mete1)));
    const wigInBox=[...D.CASQUETE.map(([x,y])=>({x,y})),...strips.flatMap(q=>[...q.izq,...q.der])];
    let boxMargin=Infinity;
    for(const q of wigInBox){const p=transform(pickup,q);boxMargin=Math.min(boxMargin,p.x-box.x0,box.x1-p.x,p.y-box.y0,box.y1-p.y);}
    const turnJoins=[[Guillermo,'g',T.gira1a,T.gira1b],[Guillermo,'g',T.gira2a,T.gira2b],[Paradigma,'p',T.pGira0,T.pGira1]].map(([rig,who,a,b])=>{
      const at=u=>{const p=D.pose(u)[who];return D.aPantallaG(rig,p,rig.cabeza(p).a({x:820,y:520}));};
      return distance(at((a+b)/2-1e-7),at((a+b)/2+1e-7));
    });
    const t=T.pPulgar1,p=D.pose(t).p,h=D.aPantallaG(Paradigma,p,p.manoCerca),reflection={x:2*D.XM-h.x,y:h.y};
    const mirrorMargin=Math.min(reflection.x-D.PUERTA.x0,D.PUERTA.x1-reflection.x,reflection.y-D.PUERTA.y0,D.PUERTA.y1-reflection.y);
    const step= D.pose(T.pPaso1+0.2).p.x-D.pose(T.pPaso0).p.x;
    const springAtEnd=D.muelle(D.DUR),phaseError=Math.max(Math.abs(springAtEnd.a),Math.abs(springAtEnd.b));
    if (Math.max(...Object.values(joins))>0.01 || Math.max(...turnJoins)>0.2 || boxMargin<3 ||
        Math.abs(turns+1)>0.001 || maxBackward>0.0001 || Math.min(...Object.values(margins))<15 ||
        grip>0.05 || mirrorMargin<20 || Math.abs(step-26)>0.01 || phaseError>0.2 || reach>0) throw Error('Fallo en el vuelo, los apoyos o el reflejo de la peluca');
    return {wigInsideBoxPx:boxMargin,turnJoinsPx:turnJoins,transferJoinsPx:joins,turnsRelativeToHeads:turns,reverseAngleRad:maxBackward,flightMarginsPx:margins,handGripPx:grip,mirrorThumbMarginPx:mirrorMargin,stepTowardMirrorPx:step,settledHairRad:phaseError,wristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00104.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
