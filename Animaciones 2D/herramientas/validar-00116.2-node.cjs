const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00116.2 Guillermo y Rodri - la apuesta de la aceituna.js", "rodri");
  const checks = run.eval(`(() => {
    const D = __A2D_00116_2;
    const {T}=D,eps=1e-6,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),delta=(a,b)=>Math.max(dist(a.a,b.a),dist(a.b,b.b)),largo=s=>dist(s.a,s.b);
    const stock=t=>Array.from({length:7},(_,i)=>D.enVaso(i,t)?1:0).reduce((a,b)=>a+b,0);
    const quedan=[stock(T.gCoge-eps),stock(T.gCoge),stock(T.rCoge)];
    const tomas=['g','r'].map(n=>{const t=n==='g'?T.gCoge:T.rCoge,clave=n==='g'?'palilloG':'palilloR';return delta(D.paloVaso(D.ELEGIDO[n],t),D.pose(t)[n][clave]);});
    const soltado=delta(D.pose(T.rTira-eps).r.palilloR,D.estadoPalilloTirado(T.rTira));
    const tela=delta(D.pose(T.gSuelta-eps).g.palilloG,D.estadoClavado(T.gSuelta));
    const rest=D.estadoPalilloTirado(D.DUR),enSuelo=delta(rest,D.estadoPalilloTirado(D.DUR-1));
    let len=0,pen=0,brazo=0,anclaje=0;
    for(let i=0;i<=Math.round(D.DUR*120);i++){const t=i/120;brazo=Math.max(brazo,...Object.values(D.diag(t)));
      if(t>=T.rTira){const s=D.estadoPalilloTirado(t);len=Math.max(len,Math.abs(largo(s)-28));pen=Math.max(pen,s.a.y-D.SUELO_PALO,s.b.y-D.SUELO_PALO);}
      if(t>=T.gSuelta){const s=D.estadoClavado(t);anclaje=Math.max(anclaje,dist(s.b,D.mangaR(t)),Math.abs(largo(s)-28));}}
    const cr=D.primerCruce(),antes=D.cruceEn(cr.t-.001),despues=D.cruceEn(cr.t+.001);
    let aciertos=0,fallo=0;
    for(const gp of D.GOLPES){const a=D.pose(gp.t)[gp.q],b=(gp.q==='g'?a.palilloG:a.palilloR).b;
      if(gp.falla){const o=D.olivaMesa(gp.t);fallo=dist(b,{x:o.x,y:o.y-D.OR-o.h});}
      else aciertos=Math.max(aciertos,dist(b,D.bordeOliva(gp.t,gp.q==='g'?1.32:Math.PI-1.32)));}
    const h0=D.olivaEnMano(T.rCogeO),h1=D.olivaEnMano(T.rLanza),v=D.olivaVuelo(T.rLanza),o=D.olivaMesa(T.rCogeO),b=D.bocaR(T.rTraga);
    const poses=[dist(h0,{x:o.x,y:o.y-D.OR-o.h}),Math.abs(o.rot-h0.rot),dist(h1,v),Math.abs(h1.rot-v.rot),dist(D.olivaVuelo(T.rTraga-eps),b)];
    const hi=D.olivaEnMano(T.rLanza-eps),v1=D.olivaVuelo(T.rLanza+eps),vel=Math.hypot((h1.x-hi.x-v1.x+v.x)/eps,(h1.y-hi.y-v1.y+v.y)/eps);
    const orig=D.mangaR(T.pincha),nose=D.narizG(T.estornudo),plumas=D.PLUMAS;
    let nacen=0,estables=0,estornudo=0,contactoNariz=0;
    for(let i=0;i<plumas.length;i++){const p=plumas[i],n=D.plumaEn(i,T.pincha,orig);nacen=Math.max(nacen,dist(n,orig));
      if(!p.flota){const a=D.plumaEn(i,D.DUR-1,orig),b=D.plumaEn(i,D.DUR,orig);estables=Math.max(estables,dist(a,b),Math.abs(a.a-b.a));}
      else{const a=D.plumaEn(i,T.estornudo-eps,orig),b=D.plumaEn(i,T.estornudo,orig);estornudo=Math.max(estornudo,dist(a,b),Math.abs(a.a-b.a));contactoNariz=Math.max(contactoNariz,dist(b,{x:nose.x+p.nx,y:nose.y+p.ny}));}}
    const tejido=[T.pincha,T.rLevantado,T.sopla+.1].map(t=>{
      const c=document.createElement('canvas');c.width=1024;c.height=600;const g=c.getContext('2d'),p=D.poseR(t),m=D.mangaR(t);
      Rodri.dibujar(g,p,t);const pix=g.getImageData(Math.round(m.x)-4,Math.round(m.y)-4,9,9).data;
      let negro=0;for(let j=0;j<pix.length;j+=4){const col=[pix[j],pix[j+1],pix[j+2]];if(pix[j+3]>115&&Math.max(...col)<158&&Math.max(...col)-Math.min(...col)<55)negro++;}
      return negro;
    });
    if(quedan.join(',')!=='7,6,5'||Math.max(...tomas,soltado,tela,len,anclaje,pen,enSuelo,aciertos,...poses,nacen,estables,estornudo,contactoNariz)>.015||vel>.15||fallo<30||brazo>1.08||antes||!despues||Math.abs(rest.a.y-D.SUELO_PALO)>.01||D.olivaVuelo(T.rTraga)!==null||D.olivaVuelo(T.rLanza-eps)!==null||tejido.some(n=>n<8))throw Error('Aceituna y palillos '+JSON.stringify({quedan,tomas,soltado,tela,len,anclaje,pen,enSuelo,aciertos,poses,nacen,estables,estornudo,contactoNariz,vel,fallo,brazo,antes,despues,tejido}));
    return {sleeveInkPixels:tejido,pickStockJoinsPx:tomas,stockCounts:quedan,thrownStickJoinPx:soltado,embeddedStickJoinPx:tela,stickLengthErrorPx:len,embeddedOffsetPx:anclaje,floorPenetrationPx:pen,restDriftPx:enSuelo,stickImpactTime:T.rTira+D.aterrizaPalillo(),crossTime:cr.t,realDuelHits:8,hitErrorPx:aciertos,missDistancePx:fallo,oliveTransferErrors:poses,releaseVelocityErrorPxPerSec:vel,feathersSpawnErrorPx:nacen,settledFeathersDrift:estables,sneezeJoinError:estornudo,noseContactErrorPx:contactoNariz,maxArmRatio:brazo};
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
  console.log(JSON.stringify({scene: "00116.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
