const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00045.2 Guillermo y Carla - el retrato.js", "carla");
  const original=await load("escenas/00045 Guillermo y Carla - el retrato.js","carla");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  run.frame(1);
  const checks=run.eval(`(() => {
    const D=__A2D_00045_2,{G,CA,T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const extremo=(r,p,m,cerca)=>{const h=r.tronco(p)(cerca?r.HOMBRO_C:r.HOMBRO),L=cerca?r.BRAZO_C_L:r.BRAZO_L;
      const sj=cerca?r.A.datos.piezas.brazo_cerca.codo:(r===G?L/2:r.A.datos.piezas.brazo.codo),o=G.rotP({x:Math.cos(m.mu)*r.JK*r.MUNECA_R,y:Math.sin(m.mu)*r.JK*r.MUNECA_R},m.ang||0);
      return dist(Recortes.extremo(Recortes.ikContinuo(h,{x:m.x+o.x,y:m.y+o.y},L,sj,42,m.dobla,1.08)),{x:m.x+o.x,y:m.y+o.y});};
    const m={brazos:0,pies:0,pincel:0,mosca:0,lienzo:1,lengua:[],guinos:[]};
    for(let i=0;i<=D.DUR*60;i++){const t=i/60,P=D.pose(t);
      for(const [r,p] of [[G,P.g],[CA,P.c]])for(const cerca of [true,false])m.brazos=Math.max(m.brazos,extremo(r,p,cerca?p.manoCerca:p.manoLejos,cerca)*p.s*(r.K||1));
      for(const [r,p,suelo] of [[G,P.g,D.TAB.top+1],[CA,P.c,D.SUELO]])for(const lado of ["cerca","lejos"]){
        if(r===CA&&((t>=T.atras0&&t<=T.atras1)||(t>=T.vuelve0&&t<=T.vuelve1)))continue;
        const q=p.piernas[lado],y=r.aPantalla(p,{x:q.tob.x,y:q.tob.y+r.TOBILLO_ALTO}).y,target=suelo-(lado==="lejos"?r===G?3.6:1.584:0);
        m.pies=Math.max(m.pies,Math.abs(y-target));}
      m.lienzo=Math.min(m.lienzo,Math.max(.045,Math.abs(D.escLienzo(t))));
    }
    for(const t of [10.5,10.8,11.05]){const p=D.poseC(t),q=D.puntoCorazon(M2.fase(t,T.corazon0,T.corazon1)),objetivo={x:D.LZ.x+q.x,y:D.LZ.y+q.y};
      m.pincel=Math.max(m.pincel,dist(D.puntaPincel(p,p.pincel),objetivo));}
    for(const t of [6.1,6.7,7.3,8.0]){const p=D.poseG(t),H=G.cabeza(p),n=G.aPantalla(p,H.a(D.NARIZ)),f=D.posMosca(t,p);m.mosca=Math.max(m.mosca,dist(n,f));}
    m.lengua=[D.poseC(1.2).cara.boca,D.poseC(3).cara.boca].map(b=>[b.abre,b.lengua]);
    m.guinos=[[D.poseG(T.guinoG+.2).cara.ojos],[D.poseC(T.guino+.19).cara.ojos],[D.poseC(T.guino+.5).cara.ojos]].map(x=>[x[0].d,x[0].i]);
    if(m.brazos>.03)throw Error("Muñecas separadas: "+JSON.stringify(m));
    if(m.pies>.4)throw Error("Apoyos: "+JSON.stringify(m));
    if(m.pincel>.04)throw Error("Pincel fuera del corazón: "+JSON.stringify(m));
    if(m.mosca<4.8||m.mosca>5.5)throw Error("Mosca fuera de la nariz: "+JSON.stringify(m));
    if(m.lienzo<.044)throw Error("Lienzo sin grosor: "+JSON.stringify(m));
    if(m.lengua.some(x=>x[0]<10||x[1]<.5))throw Error("Lengua no visible: "+JSON.stringify(m));
    if(m.guinos[0][0]<.8||m.guinos[0][1]>.5||m.guinos[1][0]>.5||m.guinos[1][1]<.95||m.guinos[2][0]>.6||m.guinos[2][1]>.6)throw Error("Guiños: "+JSON.stringify(m));
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
  const times = [0.21,0.51,0.77].map(k => k * duration);
  const snapshots=times.map(t => hash(run.frame(t)));
  assert.equal(new Set([black, ...snapshots]).size, snapshots.length + 1);
  times.forEach((t, i) => assert.equal(hash(run.frame(t)), snapshots[i]));
  for (const fps of [30, 60, 120]) {
    run.e.t = 0;
    for (let i = 0; i <= Math.ceil(duration * fps); i++) run.e.actualizar(1 / fps);
    assert(run.e.terminada);
  }
  console.log(JSON.stringify({scene: "00045.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
