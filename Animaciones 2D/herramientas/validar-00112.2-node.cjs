const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00112.2 Guillermo y Rodri - las carreras de sillas.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00112_2;
    const {T}=D, eps=1e-7,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const points=(R,o)=>{const p=o.p,h=D.pelvisPant(R,p),v=D.proyeccion(R,o),a=o.rot||0,c=Math.cos(a),s=Math.sin(a);return [p.pelvis,p.manoCerca,p.manoLejos,p.piernas.cerca.tob,p.piernas.lejos.tob].map(q=>{const u=R.aPantalla(p,q),dx=(u.x-h.x)*v.f,dy=u.y-h.y;return{x:v.x+c*dx-s*dy,y:v.y+s*dx+c*dy};});};
    const cuts=[T.c0,T.stop,T.salta,T.aterriza,T.suelta2,T.suelo],jumps={};let wrist=0,rim=0,hip=0,freeze=0,grip=0,ring=0,angle=0;
    for(const [who,R,side] of [['g',Guillermo,-1],['r',Rodri,1]]){
      jumps[who]=cuts.map(t=>{const a=points(R,D.pose(t-eps)[who]),b=points(R,D.pose(t+eps)[who]);return Math.max(...a.map((p,i)=>dist(p,b[i])));});
      for(let i=0;i<=Math.round(D.DUR*120);i++){
        const t=i/120,o=D.pose(t)[who],p=o.p,pts=points(R,o);
        for(const [m,h,l] of [[p.manoCerca,R.HOMBRO_C,R.BRAZO_C_L],[p.manoLejos,R.HOMBRO,R.BRAZO_L]]){
          const sh=R.tronco(p)(h);wrist=Math.max(wrist,dist(sh,{x:m.x+Math.cos(m.mu)*R.MUNECA_R*R.JK,y:m.y+Math.sin(m.mu)*R.MUNECA_R*R.JK})/l);
        }
        if(who==='r'&&t>=T.agarra1&&t<T.suelta)grip=Math.max(grip,dist(pts[2],D.bordeTaburete(D.taburete2(t))));
        if(t>T.stop&&t<T.baja){const last=D.pose(T.stop)[who],feet=points(R,last);freeze=Math.max(freeze,dist(pts[3],feet[3]),dist(pts[4],feet[4]));}
        if(o.est==='sentado'){
          const th=D.thTaburete(t),sn=Math.sin(th),cs=Math.cos(th),top=D.FY-D.ASIENTO+3*D.cedeAsiento(t);
          hip=Math.max(hip,Math.abs(pts[0].x-D.CX-side*D.RIDER*cs),Math.abs(pts[0].y+D.ALTURA_CADERA-top-side*D.RIDER*11/46*sn));
          for(const [j,radio,fr] of [[1,42,1],[2,36,-1]]){
            if(j===2&&t>=T.aterriza+.10&&t<=T.giro0+.12)continue;
            const y=top+1+fr*11*Math.sqrt(1-(radio/46)**2)*cs+side*radio*11/46*sn;
            rim=Math.max(rim,dist(pts[j],{x:D.CX+side*radio*cs,y}));
          }
        }
        if(t>=T.aterriza+.05&&t<=T.giro0){ring=Math.max(ring,Math.abs(Math.abs(D.aPantF(R,p,o.fx,p.piernas.cerca.tob).x-D.CX)-D.R_ARO));}
        if(t>=T.frena)angle=Math.max(angle,Math.abs(1-Math.sin(D.PARCHE+D.thTaburete(t))),Math.abs(D.thTaburete(t)-D.thTaburete(T.frena)));
      }
    }
    const derivative=(f,t,sg,h=1e-5)=>sg*(f(t+sg*h)-f(t))/h, b=t=>D.taburete2(t),xz=[q=>b(q).x,q=>b(q).th].map(f=>Math.abs(derivative(f,T.suelta,1)-derivative(f,T.suelta,-1)));
    const spin=Math.abs(D.thTaburete(T.suelta2)-D.thTaburete(T.giro0))/(Math.PI*2),turn=Math.abs(D.thVuelo(T.suelo)-D.thVuelo(T.suelta2))/(Math.PI*2);
    const quarter=T.giro0+(T.suelta2-T.giro0)*((Math.PI/2)/(6*Math.PI))**(1/1.55),profiles=[];
    for(const [who,R] of [['g',Guillermo],['r',Rodri]]){
      const c=document.createElement('canvas');c.width=1024;c.height=600;const g=c.getContext('2d');
      D.dibPersonaje(g,R,D.pose(quarter)[who],quarter);
      const data=g.getImageData(0,0,1024,600).data;let xmin=1024,xmax=-1,count=0;
      for(let y=0;y<600;y++)for(let x=0;x<1024;x++)if(data[4*(1024*y+x)+3]>75){xmin=Math.min(x,xmin);xmax=Math.max(x,xmax);count++;}
      const width=xmax-xmin+1;if(width<24||count<600)throw Error('Personaje perdido durante el giro '+who+' '+JSON.stringify({width,count}));profiles.push({who,width,count});
    }
    if(Math.max(...jumps.g,...jumps.r,grip,freeze,hip,rim,ring,angle,Math.abs(spin-3),Math.abs(turn-1.5))>.02||Math.max(...xz)>.028||wrist>1.08)throw Error(JSON.stringify({jumps,grip,freeze,hip,rim,ring,angle,spin,turn,xz,wrist}));
    return {quarterTurnVisiblePixels:profiles,phaseJoinMaxPx:jumps,handOnTiltedStoolPx:grip,plantedFeetFreezePx:freeze,seatSupportPx:hip,gripOnSeatErrorPx:rim,feetOverRingPx:ring,stoolRevolutions:spin,flightRevolutions:turn,launchSpeedJoins:xz,finalStarError:angle,maxWristRatio:wrist};
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
  console.log(JSON.stringify({scene: "00112.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
