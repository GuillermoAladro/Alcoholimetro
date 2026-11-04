const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00098.2 Guillermo y Marta - el puzle.js", "marta");
  const checks = run.eval(`(() => {
    const D = __A2D_00098_2;
    const {T,IC,IZ,VUELO:routes}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),count=t=>routes.reduce((n,_,i)=>n+Number(D.enTablero(i,t)),0);
    const landed=routes.filter(Boolean).map(v=>v.tl),snapTimes=[T.snapA,T.snapB,T.cae1,T.snapZ];
    const counts=[0,...snapTimes].map(count),wrong=D.piezaTorcida(T.pum);
    let takeoff=0,landing=0,pressed=0,pickup=0,edgeMismatch=0;
    for(const [i,v] of routes.entries()){
     if(i===IZ){if(v!==null)throw Error('El sol no sale de la mano');continue;}
     const a=D.enVuelo(v,v.t0),b=D.enVuelo(v,v.tl),orig=i===IC?wrong:D.centro(i);
     takeoff=Math.max(takeoff,dist(a,orig),Math.abs(a.a-(orig.a||0)),Math.abs(a.k-(orig.k||1)),Math.abs(a.ky-(orig.ky||1)),Math.abs(a.rot-(orig.rot||0)));
     landing=Math.max(landing,dist(b,D.centro(i)),Math.abs(Math.cos(b.flip)-1),Math.abs(Math.cos(b.rot)-1),Math.abs(b.a),Math.abs(1-b.k));
     if(D.enTablero(i,v.tl-.00001)||!D.enTablero(i,v.tl))throw Error('Aterrizaje duplicado o ausente');
    }
    for(const [k,fn,i,t0,t1] of [['A',D.piezaA,D.IA,T.mA2,T.snapA],['B',D.piezaB,D.IB,T.mB2,T.snapB],['Z',D.piezaZ,D.IZ,T.mZ2,T.snapZ]]){
     const ini=fn(t0),fin=fn(t1);pickup=Math.max(pickup,dist(ini,D.PILA[k]),dist(fin,D.centro(i)),Math.abs(ini.rot-D.PILA[k].rot),Math.abs(fin.rot));
     if(!D.poseM(t0).manoLejos.objeto||D.poseM(t1).manoLejos.objeto)throw Error('Cambio de mano a tablero');
    }
    for(let row=0;row<5;row++)for(let col=0;col<8;col++){const e=D.bordes(col,row);
     if(col<7)edgeMismatch+=Math.abs(e[1]+D.bordes(col+1,row)[3]);
     if(row<4)edgeMismatch+=Math.abs(e[2]+D.bordes(col,row+1)[0]);
    }
    for(const t of [T.ap1+.02,T.ap2+.03]){const p=D.poseG(t),h=p.manoLejos,o=D.offsetIndice(h.mu);
     pressed=Math.max(pressed,dist(Guillermo.aPantalla(p,{x:h.x+o.x,y:h.y+o.y}),D.piezaTorcida(t)));}
    const p=D.poseG(T.pum),cent=Guillermo.aPantalla(p,p.manoLejos),shoulder=Guillermo.aPantalla(p,Guillermo.tronco(p)(Guillermo.HOMBRO)),len=dist(cent,shoulder);
    const knuckle={x:cent.x+6*(cent.x-shoulder.x)/len,y:cent.y+6*(cent.y-shoulder.y)/len}, golpe=dist(knuckle,wrong);
    const spare=[T.gSaca-.0001,T.gSaca,T.gSaca+.08,T.gSaca+.22].map(t=>D.poseG(t).sobrante?.visible??null);
    if(String(counts)!=='36,37,38,39,40'||landed.length!==39||new Set(landed).size!==39||edgeMismatch||Math.max(takeoff,landing,pickup,pressed,golpe)>.01||spare[0]!==null||spare[1]!==0||spare[2]<=0||spare[2]>=1||spare[3]!==1)throw Error(JSON.stringify({counts,takeoff,landing,pickup,pressed,golpe,spare,edgeMismatch}));
    return {piecesOnBoard:counts,uniqueLandings:landed.length,edgeMismatch,releaseError:takeoff,landingError:landing,handCarriedJoins:pickup,fingertipGapPx:pressed,fistGapPx:golpe,spareVisibility:spare};
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
  console.log(JSON.stringify({scene: "00098.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
