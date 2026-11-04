const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00044.2 Guillermo y Carla - la melena.js", "carla");
  const original=await load("escenas/00044 Guillermo y Carla - la melena.js","carla");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  run.frame(1);
  const checks=run.eval(`(() => {
    const D=__A2D_00044_2,{G,CA,T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    D.preparaZas();const z=D.zas(),hit=D.puntoImpacto();
    const m={zas:z,contacto:[D.mechonEn(z-.004,D.poseC(z-.004),hit),D.mechonEn(z+.004,D.poseC(z+.004),hit)],
      vueltas:D.giroG(8)/(2*Math.PI),anchoMin:Infinity,pies:0,vaquero:0,caricia:[],boton:[],viento:[],desprende:0};
    for(let i=0;i<=D.DUR*60;i++){const t=i/60,p=D.poseG(t),c=D.poseC(t);
      m.anchoMin=Math.min(m.anchoMin,.36+.64*Math.abs(Math.cos(p.giro)));
      if(t<2.7||t>4.5)for(const lado of ["cerca","lejos"]){const q=p.piernas[lado],ras=D.SUELO-(lado==="lejos"?3.6:0);
        const y=G.aPantalla(p,{x:q.tob.x,y:q.tob.y+D.soporteSuela(q.ang)}).y;m.pies=Math.max(m.pies,Math.abs(y-ras));}
    }
    const sent=D.poseG(8.2),bajo=G.aPantalla(sent,G.tronco(sent)({x:252.88,y:770.24})).y;m.vaquero=Math.abs(bajo-D.SUELO);
    for(const t of [3.2,7.5]){const c=D.poseC(t),u=M2.suave(M2.fase(t,T.pelo0,T.pelo1)),q=t<6?CA.cabeza(c).a({x:M2.lerp(660,642,u),y:M2.lerp(505,635,u)}):CA.cabeza(c).a({x:666,y:634+4*Math.sin(t*1.6)});
      m.caricia.push(dist(CA.aPantalla(c,c.manoCerca),CA.aPantalla(c,q)));}
    m.boton=[T.clic-.13,T.clic,T.clic+.25].map(t=>dist(D.pulgarMando(t),D.BOTON));
    m.viento=[D.vientoEn(1.9,880),D.vientoEn(1.9,613),D.vientoEn(2.78,613)];
    const pg=D.poseG(T.sopla),H=G.cabeza(pg),libre=D.peloEnVuelo(T.sopla),pegado=D.mechonLabio(T.sopla);
    pegado.forEach(([x,y],i)=>m.desprende=Math.max(m.desprende,dist(G.aPantalla(pg,H.a({x,y})),{x:libre[i][0],y:libre[i][1]})));
    m.guino=[D.poseC(3.35).cara.ojos,D.poseC(T.guinoC+.19).cara.ojos,D.poseC(T.guinoC+.51).cara.ojos].map(o=>[o.d,o.i]);
    if(!(m.zas>T.lat0&&m.zas<T.lat1+.16)||m.contacto[0]||!m.contacto[1])throw Error("Contacto del mechón: "+JSON.stringify(m));
    if(Math.abs(m.vueltas-4)>.001||m.anchoMin<.359)throw Error("Giro de Guillermo: "+JSON.stringify(m));
    if(m.pies>.05||m.vaquero>.15)throw Error("Apoyos en el suelo: "+JSON.stringify(m));
    if(Math.max(...m.caricia)>.03||m.desprende>.03)throw Error("Contactos de pelo: "+JSON.stringify(m));
    if(Math.abs(m.boton[1]-4.65)>.03||m.boton[0]<15||m.boton[2]<15)throw Error("Pulsación del mando: "+JSON.stringify(m));
    if(m.viento[0]<=.2||m.viento[1]!==0||m.viento[2]<.99)throw Error("Propagación del viento: "+JSON.stringify(m));
    if(m.guino[0][0]<.9||m.guino[0][1]<.9||m.guino[1][0]>.5||m.guino[1][1]<.95||m.guino[2][0]>.5||m.guino[2][1]>.5)throw Error("Ojos de Carla: "+JSON.stringify(m));
    return {m};
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
  console.log(JSON.stringify({scene: "00044.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
