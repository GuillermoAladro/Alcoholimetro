const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00106.2 Guillermo y Paradigma - la barbacoa.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00106_2;
    const {T, VD}=D, eps=1e-7;
    const dist=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
    const offset=(p,a,n)=>({x:p.x+n*Math.cos(a),y:p.y+n*Math.sin(a)});
    const hand=(rig,p)=>rig.aPantalla(p,p.manoLejos);
    const turns=D.VUELTAS.map(([start,i])=>{
      const grip=start+VD.llega+VD.agarra, end=grip+VD.sube+VD.baja;
      let contact=0;
      for(let j=0;j<=12;j++){
        const t=grip+(end-grip)*j/12, tool=D.pinzasEn(t), food=D.estadoSal(i,t);
        contact=Math.max(contact,dist(D.puntas(tool.H,tool.a),food));
      }
      return {i,contact,marks:D.estadoSal(i,end+0.05).marcas};
    });
    const visible=(i,t)=>{
      const v=D.VUELOS[i];
      if(t>=v.t0&&t<v.t1)return D.vueloSal(i,t);
      if(t<v.t1||v.fin)return D.estadoSal(i,t);
      const f=D.salchichaP(t,D.poseP(t));
      return {...offset(f.pinza,f.a,D.LS/2-3),a:f.a};
    };
    let joins=0,handJoins=0,reach=-Infinity,overlap=0,gap=0,toolJoin=0;
    for(let i=0;i<D.VUELOS.length;i++)for(const t of [D.VUELOS[i].t0,D.VUELOS[i].t1]){
      const a=visible(i,t-eps),b=visible(i,t+eps);
      for(const n of [-D.LS/2,D.LS/2+0.6*D.RS])joins=Math.max(joins,dist(offset(a,a.a,n),offset(b,b.a,n)));
    }
    for(const t of [T.lanza0,T.caza,T.coge,T.suelta]){
      for(const [r,actor] of [[Guillermo,'g'],[Paradigma,'p']]){
        const a=D.pose(t-eps)[actor],b=D.pose(t+eps)[actor];
        const wrist=p=>{const m=p.manoLejos;return r.aPantalla(p,offset(m,m.mu+(m.ang||0),r.MUNECA_R*r.JK))};
        handJoins=Math.max(handJoins,dist(hand(r,a),hand(r,b)),dist(wrist(a),wrist(b)));
      }
      const a=D.pinzasEn(t-eps),b=D.pinzasEn(t+eps);
      toolJoin=Math.max(toolJoin,dist(a.H,b.H),dist(D.puntas(a.H,a.a),D.puntas(b.H,b.a)));
    }
    for(let j=0;j<18;j++){
      const t=T.coge+(T.suelta-T.coge)*j/18,pz=D.pinzasEn(t),{g,p}=D.pose(t);
      overlap=Math.max(overlap,dist(hand(Guillermo,g),D.mango(pz)),dist(hand(Paradigma,p),D.agarre(pz)));
      gap=dist(hand(Guillermo,g),hand(Paradigma,p));
    }
    const clicks=[T.clac1,T.clac2].map(t=>[D.pinzasEn(t-.07).abre,D.pinzasEn(t).abre]);
    const jets=[T.chorro1,T.chorro2].map((tc,i)=>{
      const t=tc+.11,b=D.boteEn(t),start=D.puntoChorro(t,tc,0),q=D.puntoChorro(t,tc,.00001),end=D.puntoChorro(t,tc,1);
      return {start:dist(start,D.boquilla(b.c,b.b)),angle:Math.abs(Math.atan2(q.y-start.y,q.x-start.x)-b.b),end:dist(end,{x:D.GC.x-18+(i?26:0),y:D.GC.y})};
    });
    const p=D.poseP(T.bocado),f=D.salchichaP(T.bocado,p),bite=dist(offset(f.pinza,f.a,D.LS-3+.6*D.RS),Paradigma.aPantalla(p,Paradigma.boca(p)));
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const {g,p}=D.pose(i/120);
      for(const [r,b] of [[Guillermo,g],[Paradigma,p]])for(const [side,j,l] of [['Cerca',r.HOMBRO_C,r.BRAZO_C_L],['Lejos',r.HOMBRO,r.BRAZO_L]]){
        const m=b['mano'+side],h=r.tronco(b)(j),w=offset(m,m.mu+(m.ang||0),r.MUNECA_R*r.JK);
        reach=Math.max(reach,(dist(w,h)-l*1.08)*b.s*r.K);
      }
    }
    if(new Set(turns.map(v=>v.i)).size!==5||turns.some(v=>v.contact>.02||v.marks<.99)||Math.max(joins,handJoins,toolJoin,overlap,bite)>.04||Math.abs(gap-D.LP*(D.U_MEDIO-D.U_MANGO))>.02||clicks.some(([open,closed])=>open<.9||closed>.1)||jets.some(j=>j.start>.01||j.end>.01||j.angle>.001)||reach>0)throw Error(JSON.stringify({turns,joins,handJoins,toolJoin,overlap,gap,clicks,jets,bite,reach}));
    return {fiveTurns:turns,toolJoinsPx:toolJoin,handAndWristJoinsPx:handJoins,handoffErrorPx:overlap,handoffSpacingPx:gap,clickOpenClosed:clicks,flightJoinsPx:joins,jetErrors:jets,biteErrorPx:bite,wristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00106.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
