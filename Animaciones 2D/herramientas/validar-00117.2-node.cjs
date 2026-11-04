const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00117.2 Guillermo y Rodri - el muro de latas.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00117_2;
    const {T}=D,e=1e-6,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),joint=(a,b)=>Math.max(dist(a,b),Math.abs(a.giro-b.giro)),pr=t=>D.estadoPeluche(t,D.poseG(t));
    const stock=[D.bolasEnCesta(T.gCoge1-e).length,D.bolasEnCesta(T.gCoge1).length,D.bolasEnCesta(T.gCoge2).length];
    const grab=[T.gCoge1,T.gCoge2].map((t,i)=>joint({...D.EN_CESTA[i],giro:.6},D.poseG(t).pelotaL));
    const hand=[T.gPasa1,T.gPasa2].map(t=>joint(D.poseG(t-e).pelotaL,D.poseG(t).pelotaC));
    const release=[[T.rSuelta,D.poseR,D.pelotaRodri,'pelotaR'],[T.gSuelta,D.poseG,D.pelotaG1,'pelotaC'],[T.gSuelta2,D.poseG,D.pelotaG2,'pelotaC']].map(([t,p,f,k])=>joint(p(t-e)[k],f(t)));
    const cuts=[[T.impacto,D.pelotaRodri],[T.lona,D.pelotaG1],[T.frente,D.pelotaG1],[T.frente+.42,D.pelotaG1],[T.golpePeluche,D.pelotaG2],[T.golpePeluche+.62,D.pelotaG2]];
    const joins=cuts.map(([t,f])=>joint(f(t-e),f(t+e)));
    const pelJoins=[T.golpePeluche,T.vuelca,T.aterriza].map(t=>{const a=pr(t-e),b=pr(t+e); return Math.max(dist(a,b),...['sx','sy','ang'].map(k=>Math.abs(a[k]-b[k])));});
    let ancla=0,alcance=0,latas=0;
    for(let i=0;i<=D.DUR*120;i++){const t=i/120,p=D.poseG(t);alcance=Math.max(alcance,...Object.values(D.diag(t)));
      if(t>=T.aterriza)ancla=Math.max(ancla,dist(pr(t),D.anclaCabeza(p)));}
    for(const [i,c]of D.PIR1.entries()){const q=D.lataEn(c,D.VUELO1[i],T.impacto);latas=Math.max(latas,dist(q,c));}
    const caidas=D.PIR1.filter((c,i)=>D.lataEn(c,D.VUELO1[i],T.impacto+1.25).y>D.MOST.y+60).length;
    const gapT=Math.abs(dist(D.BLANCO_R,D.pelotaRodri(T.impacto))-D.RADIO_TINTA);
    const gapF=Math.abs(dist(D.salidas().marca,D.pelotaG1(T.frente))-D.RADIO_TINTA);
    const gapPel=D.PEL_BASE.y-(89+1.3)*D.PEL_ESC-(D.pelotaG2(T.golpePeluche).y+D.RADIO_TINTA);
    const fit=D.asientoPelo(), toma=D.arcoRasante(), c=document.createElement('canvas');c.width=27;c.height=310;
    const g=c.getContext('2d'), bola=D.pelotaRodri(toma.t), ras=D.cortePelo(toma.t,bola.x,g)-bola.y;
    let despeje=Infinity;for(let i=0;i<170;i++){const t=T.rSuelta+(T.impacto-T.rSuelta)*(i+.5)/170,q=D.pelotaRodri(t);if(q.x>410&&q.x<635)despeje=Math.min(despeje,D.cortePelo(t,q.x,g)-q.y);}
    const img=document.createElement('canvas');img.width=160;img.height=145;const gp=img.getContext('2d');D.dibPeluche(gp,80,125,0,1,1);
    const col=gp.getImageData(80,0,1,145).data;let y=0;while(y<145&&col[4*y+3]<128)y++;
    const pelPixelError=Math.abs((y+.5)-(125-(89+1.3)*D.PEL_ESC));
    if(stock.join(',')!=='3,2,1'||Math.max(...grab,...hand,...release,...joins,...pelJoins,ancla,latas,gapT,gapF,Math.abs(gapPel))>.018||!Number.isFinite(despeje)||Math.abs(ras-7)>.05||despeje<4.5||despeje>9||toma.h<=0||fit.columnas<30||fit.apoyadas<4||pelPixelError>1.6||alcance>1.08||caidas!==10||D.PIR2.length!==6)throw Error('Caseta '+JSON.stringify({stock,grab,hand,release,joins,pelJoins,ancla,latas,gapT,gapF,gapPel,ras,despeje,toma,fit,pelPixelError,alcance,caidas}));
    return {basketCounts:stock,basketJoinPx:grab,handTransfersPx:hand,releaseJoinsPx:release,flightPositionSpinJoins:joins,plushPositionScaleJoins:pelJoins,plushAnchorPx:ancla,plushHairContactColumns:fit.apoyadas,hairProfileColumns:fit.columnas,firstArcClearancePx:ras,minHairClearancePx:despeje,plushCrownPixelError:pelPixelError,canContactErrorPx:gapT,foreheadMarkContactErrorPx:gapF,prizeBallContactErrorPx:gapPel,fallenCans:caidas,untouchedCans:D.PIR2.length,maxArmRatio:alcance};
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
  console.log(JSON.stringify({scene: "00117.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
