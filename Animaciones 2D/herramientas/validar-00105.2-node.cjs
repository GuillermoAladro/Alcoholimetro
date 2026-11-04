const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00105.2 Guillermo y Paradigma - el vinilo.js", "paradigma");
  const checks = run.eval(`(() => {
    const D = __A2D_00105_2;
    D.ajusta();
    const {T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-7;
    const at=t=>{const {g,p}=D.pose(t);return D.disco(t,p,g);};
    const point=(d,phi)=>{const x=D.R_DISCO*Math.cos(phi),y=D.R_DISCO*d.k*Math.sin(phi);
      return {x:d.c.x+x*Math.cos(d.rot)-y*Math.sin(d.rot),y:d.c.y+x*Math.sin(d.rot)+y*Math.cos(d.rot)};};
    const geometryJoins={};
    for(const key of ['pone0','plato','mano','sale','b1','b2','b3','b4','coge','toma','pone2']) {
      const a=at(T[key]-eps),b=at(T[key]+eps);
      geometryJoins[key]=Math.max(dist(a.c,b.c),...[0,1,2,3].map(i=>dist(point(a,i*Math.PI/2),point(b,i*Math.PI/2))));
    }
    const impacts=D.REB.filter(e=>e.golpe).map(e=>{
      const actual=point(at(e.t),Math.atan2(e.normal.y,e.normal.x));
      return {target:e.blanco,errorPx:dist(actual,e.golpe)};
    });
    const lampJoin=Math.abs(D.angLampara(T.b3+eps)-D.angLampara(T.b3-eps));
    const printJoin=Math.abs(D.angLamina(T.b2+eps)-D.angLamina(T.b2-eps));
    const speakerBefore=D.angAltavoz(T.b4-eps),speakerAfter=D.angAltavoz(T.b4+0.06);
    let flyMargin=Infinity,finger=0,reach=-Infinity;
    for(let i=0;i<=Math.ceil(D.DUR*120);i++) {
      const t=i/120,{g,p}=D.pose(t),disc=D.disco(t,p,g);
      if(disc.capa==='aire') {const cam=D.camara(t);
        for(let j=0;j<40;j++){const q=point(disc,2*Math.PI*j/40),x=512+(q.x-cam.f.x)*cam.k,y=300+(q.y-cam.f.y)*cam.k;
          flyMargin=Math.min(flyMargin,x,y,1024-x,600-y);}
      }
      if(disc.capa==='dedo')finger=Math.max(finger,dist(disc.c,D.dedoParadigma(p)));
      for(const [actor,body] of [[Guillermo,g],[Paradigma,p]]) for(const [side,joint,limit] of [['Cerca',actor.HOMBRO_C,actor.BRAZO_C_L],['Lejos',actor.HOMBRO,actor.BRAZO_L]]) {
        const m=body['mano'+side],h=actor.tronco(body)(joint),r=actor.MUNECA_R*actor.JK,a=m.mu+(m.ang||0);
        reach=Math.max(reach,(Math.hypot(m.x+r*Math.cos(a)-h.x,m.y+r*Math.sin(a)-h.y)-limit*1.08)*body.s*actor.K);
      }
    }
    const g=D.pose((T.cruje0+T.cruje1)/2).g,knuckles=dist(Guillermo.aPantalla(g,g.manoCerca),Guillermo.aPantalla(g,g.manoLejos));
    const atRest=at(T.toma-eps).w,firstLift=D.brazoTocadiscos(T.gira0).alza,secondLift=D.brazoTocadiscos(T.brazo2+0.13).alza;
    const firstDown=D.brazoTocadiscos(T.aguja).alza, secondDown=D.brazoTocadiscos(T.aguja2).alza;
    const notes={cleanBefore:D.NOTAS.filter(n=>!n.rota&&n.t0<T.mano).length,scratch:D.NOTAS.filter(n=>n.rota&&n.t0>=T.rasca0&&n.t0<T.sale).length,cleanAfter:D.NOTAS.filter(n=>!n.rota&&n.t0>=T.musica2).length};
    if (impacts.map(i=>i.target).join('|') !== 'estantería|lámina|lámpara|altavoz' ||
        Math.max(...Object.values(geometryJoins),...impacts.map(i=>i.errorPx),lampJoin,printJoin,finger,atRest,firstDown,secondDown)>0.02 ||
        flyMargin<30 || speakerBefore!==0 || Math.abs(speakerAfter)<0.01 || Math.min(firstLift,secondLift)<0.98 ||
        knuckles>12 || reach>0 || Math.min(...Object.values(notes))<1) throw Error('Secuencia del disco, rebote o contacto incorrecto');
    return {geometryJoinsPx:geometryJoins,impacts,lampJoinRad:lampJoin,printJoinRad:printJoin,speakerBefore,speakerAfter,flightMarginPx:flyMargin,fingerHolePx:finger,spinAtHandoff:atRest,needleLift:[firstLift,secondLift],needleDown:[firstDown,secondDown],knuckleSeparationPx:knuckles,notes,wristExcessPx:reach};
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
  console.log(JSON.stringify({scene: "00105.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
