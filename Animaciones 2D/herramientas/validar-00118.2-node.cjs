const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00118.2 Guillermo y Rodri - el columpio.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00118_2;
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),w=(p,q)=>Rodri.aPantalla(p,q);
    const pts=t=>{const u=D.pose(t),p=u.r;return [w(p,p.pelvis),w(p,p.manoCerca),w(p,p.manoLejos),w(p,p.piernas.cerca.tob),w(p,p.piernas.lejos.tob)];};
    const eps=1e-7,iz=pts(T.rLevanta0-eps),de=pts(T.rLevanta0+eps),joins=iz.map((q,i)=>dist(q,de[i]));
    const theta=[T.salto,D.T_ATASCO,T.empuja].map(t=>Math.abs(D.thetaG(t+eps)-D.thetaG(t-eps)));
    let contact=0,root=0,ground=0,grip=0,stock=0,after=0,joints=0,imp=0,standing=0;
    const chainDist=(p,actor,n,ang,L,en,lado,f)=>{const c=D.cadena(n,L,f,ang,lado,en),m=lado==='cerca'?p.manoCerca:p.manoLejos,pt=D.apl(D.marco(n,ang),actor.aPantalla(p,m));const dx=c.abajo.x-c.arriba.x,dy=c.abajo.y-c.arriba.y,u=((pt.x-c.arriba.x)*dx+(pt.y-c.arriba.y)*dy)/(dx*dx+dy*dy);
      return u<0||u>1?1e5:Math.abs(dy*(pt.x-c.arriba.x)-dx*(pt.y-c.arriba.y))/Math.hypot(dx,dy);};
    for(let i=0;i<=Math.round(D.DUR*120);i++){const t=i/120,p=D.pose(t);
      const vals=Object.values(D.diag(t)).filter(x=>x!==null);joints=Math.max(joints,...vals);
      for(const l of ['cerca','lejos'])grip=Math.max(grip,chainDist(p.g,Guillermo,D.PG,p.aG,D.largoG(p.aG),Math.max(0,p.aG-Math.PI),l,-1));
      const hr=['cerca','lejos'].map(l=>{if(p.sentadoR)grip=Math.max(grip,chainDist(p.r,Rodri,D.PR,p.aR,D.L0,0,l,1));return D.SY-D.bordePieR(p.r,l,p.sentadoR?p.aR:0).y;});
      ground=Math.max(ground,-Math.min(...hr));if(t>=T.rLevanta0&&t<=T.rAnda0)standing=Math.max(standing,Math.min(...hr.map(Math.abs)));
      if(t>=T.toca&&t<=D.finContacto){const m=p.r.manoLejos,pt=D.dedosEmpuje(m.mu),y=w(p.r,{x:m.x+pt.x,y:m.y+pt.y}),dest=D.sueloG(p.g,D.marco(D.PG,p.aG));contact=Math.max(contact,dist(y,dest));}
      if(t>=T.suelta&&t<=T.suelta+.1){const m=p.r.manoLejos,pt=D.dedosEmpuje(m.mu),y=w(p.r,{x:m.x+pt.x,y:m.y+pt.y}),dest=D.sueloG(p.g,D.marco(D.PG,p.aG));after=Math.max(after,dist(y,dest));}
    }
    const golpe=Math.abs(D.thetaG(D.T_ARRIBA)-Math.PI),paso=Math.abs(D.thetaG(D.T_ARRIBA2)-Math.PI);
    let juntura=0,longitud=0;for(let i=0;i<=240;i++){const w=(D.TH_JAM-Math.PI)*i/240,th=Math.PI+w;
      for(const l of ['cerca','lejos']){const c=D.cadena(D.PG,D.largoG(th),-1,th,l,w);juntura=Math.max(juntura,dist(c.arriba,D.puntoVuelta(D.PG,l,w)));}
      longitud=Math.max(longitud,Math.abs(D.largoG(th)+D.RB*w-D.L0));}
    const pausa=[-.045,0,.045].map(dt=>Math.abs(D.thetaG(D.T_ARRIBA+dt)-Math.PI));
    const calzado=[D.perfilSuela(Guillermo,'cerca').length,D.perfilSuela(Rodri,'cerca').length];
    if(Math.max(...joins,...theta,ground,standing,grip,contact,golpe,paso,juntura,longitud,...pausa)>.012||joints>1.06||after<70||calzado.some(n=>n<15)||!(T.salto<D.T_ARRIBA&&D.T_ARRIBA<D.T_ABAJO2&&D.T_ABAJO2<D.T_ATASCO&&D.T_ATASCO<T.empuja&&T.empuja<D.T_ARRIBA2))throw Error('Columpio '+JSON.stringify({joins,theta,ground,standing,grip,contact,golpe,paso,juntura,longitud,pausa,joints,after,calzado}));
    return {wrapToChainJoinPx:juntura,wrappedLengthErrorPx:longitud,apexHoldErrorRad:pausa,shoeContourSamples:calzado,standJoinsPx:joins,angleJoinsRad:theta,maxFloorPenetrationPx:ground,plantedFootErrorPx:standing,chainGripErrorPx:grip,pushFingertipSoleErrorPx:contact,handClearAfterReleasePx:after,topCrossingsErrorRad:[golpe,paso],maxArmRatio:joints};
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
  console.log(JSON.stringify({scene: "00118.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
