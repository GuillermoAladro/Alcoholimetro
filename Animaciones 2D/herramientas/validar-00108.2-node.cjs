const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00108.2 Guillermo y Paradigma - la carta.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00108_2;
    const {T}=D, dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), eps=1e-7;
    const amount=D.PILAS_G.reduce((n,p)=>n+p.n*D.VALOR_FICHA[p.c],0),call=D.IGUALA.n*D.VALOR_FICHA[D.IGUALA.c];
    const total=D.PILAS_G.concat(D.CIEGAS,D.IGUALA,D.PILAS_P).reduce((n,p)=>n+p.n,0);
    let countError=0,cardCountError=0,aces=0,fan=0,weak=0,grip=0,tip=0,rake=0,wr=0,land=0;
    const gulp=[];
    for(let i=0;i<=Math.ceil(D.DUR*120);i++){
      const t=i/120,{p,g}=D.pose(t),pot=D.boteEn(t);
      const live=pot.concat(D.PILAS_P).reduce((n,o)=>n+o.n,0)+(D.fichaCabeza(t,g)?1:0);
      countError=Math.max(countError,Math.abs(live-total));
      const howMany=(p.abanico?.length||0)+(t>=T.fanDejado?T.ases.filter(s=>t<s+.15).length:0)+(p.asMano===null?0:1)+T.ases.filter(s=>t>=s+.37).length;
      cardCountError=Math.max(cardCountError,Math.abs(howMany-4));
      if(p.asMano!==null){
        const j=p.asMano,c=D.cartaAs(j,t),r=D.pinza(p.manoLejosQ,11),u=9*c.sx,v=-3*c.sy;
        grip=Math.max(grip,dist(r,{x:c.x+u*Math.cos(c.rot)-v*Math.sin(c.rot),y:c.y+u*Math.sin(c.rot)+v*Math.cos(c.rot)}));
      }
      if(t>T.pArrastra&&t<T.pArrastrado)rake=Math.max(rake,Math.abs(p.manoLejosQ.x-D.xRastrillo(t)));
      if(t>=T.pSorbo+.41&&t<=T.pSorbido-.41){const v=p.vasoMano;gulp.push(dist({x:v.x+13.5*Math.sin(v.ang),y:v.y-13.5*Math.cos(v.ang)},D.bocaPant(Paradigma,p)));}
      wr=Math.max(wr,...Object.values(D.diag(t)));
      if(t>=T.gPum)land=Math.max(land,D.contactoCara(g).y-D.MESA.fy);
    }
    const handoff=D.poseP(T.fanDejado-eps).abanico;
    handoff.forEach((p,k)=>{const z=D.cartaMonton(3-k);fan=Math.max(fan,dist(p,z),Math.abs(p.rot-z.rot),Math.abs(p.sy-.62));});
    for(let i=0;i<4;i++){
      const t=T.ases[i],a=D.cartaAs(i,t+.15),b=D.cartaAs(i,t+.37);
      if(a.tipo!==D.DORSO||b.tipo!==i)throw Error("cara del as");
      aces=Math.max(aces,dist(a,D.cartaMonton(i)),dist(b,D.SLOT_AS[i]));
    }
    for(const [t,after,base] of [[T.gCoge,true,D.CG_MESA],[T.gDejado,false,D.CG_DEJA],[T.gVuelve+.14,true,D.CG_DEJA],[T.gGolpe,false,D.CG_VISTA]]){
      const cards=D.poseG(t+(after?eps:-eps)).cartasMano.cartas;
      cards.forEach((c,i)=>{const a=base[i];weak=Math.max(weak,dist(a,c),Math.abs(c.rot-a.rot),Math.abs(c.sx-1),Math.abs(c.sy-.62));if(t===T.gGolpe&&c.tipo!==a.tipo)throw Error("faltan el dos y el tres");});
    }
    const before=D.boteEn(T.pArrastra-eps),after=D.boteEn(T.pArrastra+eps);const sweepJump=Math.max(...before.map((p,i)=>dist(p,after[i])));
    const last=D.fichaCabeza(T.fichaSalta+eps,D.poseG(T.fichaSalta+eps)),end=T.fichaSalta+.42;
    const a=D.fichaCabeza(end-eps,D.poseG(end-eps)),c=D.fichaCabeza(end+eps,D.poseG(end+eps));
    tip=Math.max(dist(last,D.CAIDAS[0].to),dist(a,c),Math.abs(Math.atan2(Math.sin(a.rot-c.rot),Math.cos(a.rot-c.rot))));
    const impact=D.contactoCara(D.poseG(T.gPum)),ground=Math.abs(impact.y-D.MESA.fy);
    if(countError||cardCountError||amount!==1000||call!==amount||new Set(D.AS).size!==4||Math.max(fan,aces,weak,grip,sweepJump,rake,tip,Math.max(...gulp),ground,land)>.02||wr>1.08||!D.poseP(1).abanico||D.poseP(T.pBrinda+.3).vasoMano.y>=350)throw Error(JSON.stringify({countError,cardCountError,amount,call,fan,aces,weak,grip,sweepJump,rake,tip,gulp:Math.max(...gulp),ground,land,wr}));
    return {cardsInPlay:4,cardCountError,uniqueAceSuits:new Set(D.AS).size,acesJoinPx:aces,gripErrorPx:grip,fanToStackPx:fan,twoAndThreeJoinsPx:weak,tableChips:total,chipCountError:countError,allIn:amount,call,firstSweepJumpPx:sweepJump,rakeToHandPx:rake,chipFlightJoinsPx:tip,sipToLipPx:Math.max(...gulp),impactPoint:impact,faceAtImpactPx:ground,facePenetrationPx:land,maxWristRatio:wr};
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
  console.log(JSON.stringify({scene: "00108.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
