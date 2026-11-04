const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00083.2 Guillermo y Kiriku - el yate.js", "kiriku");
  const checks = run.eval(`(() => {
    const D = __A2D_00083_2;
    const T = D.T, dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const sample = t => { const p=D.pose(t); return D.sombrilla(t,p.g,p.k); };
    const changes=[T.quita,T.toma].map(t=>dist(sample(t-1e-6).base,sample(t+1e-6).base));
    const sipErrors=[(T.k1b+T.k1c)/2,(T.k2b+T.k2c)/2,T.k3b+.05].map(t=>{
      const k=D.pose(t).k, pos=D.vasoEn(k), tip=D.rot(D.PAJITA,-D.angB(t));
      return dist({x:pos.x+tip.x,y:pos.y+tip.y},Kiriku.aPantalla(k,Kiriku.boca(k)));
    });
    const p=D.pose(T.gavPosa).g,gull=D.gaviotaHeroe(T.gavPosa,p);
    const landing=dist(gull,D.aCamara(Guillermo.aPantalla(p,Guillermo.cabeza(p).a(D.PIE_GAV)),T.gavPosa));
    let wristError=0;
    for(let i=0;i<=Math.round(D.DUR*120);i++){
      const P=D.pose(i/120);
      for(const [p,rig] of [[P.g,Guillermo],[P.k,Kiriku]]) for(const near of [true,false]){
        const m=near?p.manoCerca:p.manoLejos,h=rig.tronco(p)(near?rig.HOMBRO_C:rig.HOMBRO);
        const len=near?rig.BRAZO_C_L:rig.BRAZO_L, elbow=near?rig.A.datos.piezas.brazo_cerca.codo:rig===Guillermo?len/2:rig.A.datos.piezas.brazo.codo;
        const angle=m.ang+m.mu,j=rig.MUNECA_R*rig.JK, target={x:m.x+j*Math.cos(angle), y:m.y+j*Math.sin(angle)};
        const curve=Recortes.ikContinuo(h,target,len,elbow,42,m.dobla,1.08);
        wristError=Math.max(wristError,dist(Recortes.extremo(curve),target)*p.s*rig.K);
      }
    }
    if(!Guillermo.listo()||!Kiriku.listo()||wristError>.1||Math.max(...changes)>.2||landing>.1||Math.max(...sipErrors)>2.5) throw Error(JSON.stringify({wristError,changes,landing,sipErrors}));
    return {posesAt120Hz:Math.round(D.DUR*120)+1,wristErrorPx:wristError,umbrellaHandoffsPx:changes,gullLandingPx:landing,strawToLipPx:sipErrors};
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
  console.log(JSON.stringify({scene: "00083.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
