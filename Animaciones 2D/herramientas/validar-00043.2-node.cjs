const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00043.2 Guillermo y Carla - el limbo.js", "carla");
  const original=await load("escenas/00043 Guillermo y Carla - el limbo.js","carla");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  run.frame(1);
  const checks = run.eval(`(() => {
    const D = __A2D_00043_2;
    const {G,C,T}=D,dist=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
    const suelaC=[[-41.24,-3.09],[-38.87,-5.47],[-34.11,-10.22],[-29.36,-12.6],[-24.6,-14.98],[-17.47,-17.36],[-10.33,-19.73],[6.31,-22.11],[58.62,-29.24],[61,-29.24],[156.11,37.33],[160.87,42.09],[163.24,44.47],[163.24,53.98],[158.49,56.36],[144.22,61.11],[132.33,63.49],[120.44,65.87],[103.8,68.24],[63.38,68.24],[-5.58,63.49],[-10.33,61.11],[-15.09,56.36],[-41.24,6.42]],suelaG=[[-62.03,9],[-47.69,-12.6],[-40.52,-19.8],[-30.96,-24.6],[-23.79,-27],[-9.46,-29.4],[7.27,-29.4],[19.22,-27],[28.77,-24.6],[33.55,-22.2],[138.69,42.6],[145.86,49.8],[153.03,61.8],[155.42,71.4],[155.42,78.6],[148.25,85.8],[141.08,88.2],[131.52,90.6],[119.57,93],[55.06,93],[-42.91,78.6],[-54.86,76.2],[-62.03,73.8]];
    const pie=(r,p,l,pt)=>{const z=p.piernas[l],v=G.rotP({x:pt[0],y:pt[1]},z.ang),w=r.aPantalla(p,{x:z.tob.x+v.x,y:z.tob.y+v.y});if(r===C) w.x=p.x+(w.x-p.x)*D.anchoGiro(p.giro);return w;};
    const distancia=(q,L)=>(q.y-(D.SUELO-L.alto))*Math.cos(L.ang)-(q.x-L.x)*Math.sin(L.ang);
    const uPalo=(q,L)=>(q.y-(D.SUELO-L.alto))*Math.sin(L.ang)+(q.x-L.x)*Math.cos(L.ang);
    const dedo=(r,p,m,n)=>{const v=D.dedoHoja(r,m.mu,m.dedos,n);return r.aPantalla(p,{x:m.x+v.x*m.puno,y:m.y+v.y*m.puno});};
    const baseEnMuesca=(t,h,l)=>{const P=D.superficiePoste(t,l,h),L=D.liston(t),r=Math.hypot(5*Math.sin(L.ang-P.a),3.4*Math.cos(L.ang-P.a))+.75;return distancia(P,L)-r-D.RADIO;};
    let muescas=0,bota=0,dedoBaja=0,apoyo=0,atraviesa=0,mu=0,cruza=0,libre=Infinity,vara=0,aire=0;
    for(let i=0;i<=D.DUR*120;i++){
      const t=i/120,pg=D.poseG(t),pc=D.poseC(t),L=D.liston(t);
      if(t<T.clac-.08||(t>T.clac+.17&&t<T.suelta))for(const l of [-1,1])muescas=Math.max(muescas,Math.abs(baseEnMuesca(t,t<T.clac?D.ALTO0:D.ALTO1,l)));
      if(t>=T.clac-.08&&t<=T.invita0)dedoBaja=Math.max(dedoBaja,dist(dedo(C,pc,pc.manoLejos,"indice"),D.puntoPalo(L,D.BHW-6,-D.RADIO)));
      if(t>=T.cae0){atraviesa=Math.max(atraviesa,D.espalda(pg).y-D.SUELO);if(t>T.boing+.55)apoyo=Math.max(apoyo,Math.abs(D.espalda(pg).y-D.SUELO));}
      if(t>=T.boing){const sep=distancia(D.vientre(t),L)-D.RADIO;vara=Math.max(vara,-sep);aire=Math.max(aire,sep);}
      if(t>=T.bota)for(const q of suelaC){const v=pie(C,pc,"cerca",q);bota=Math.max(bota,distancia(v,L)+D.RADIO);}
      if(t>T.va0+.36&&t<T.bota){for(const q of suelaC){const v=pie(C,pc,"cerca",q),u=uPalo(v,L);
        if(Math.abs(u)<116){cruza++;libre=Math.min(libre,-D.RADIO-distancia(v,L));}}}
      if(i%4===0)for(const [r,p] of [[G,pg],[C,pc]])for(const lado of ["cerca","lejos"]){
        const ne=lado==="cerca",m=ne?p.manoCerca:p.manoLejos,h=r.tronco(p)(ne?r.HOMBRO_C:r.HOMBRO),L0=ne?r.BRAZO_C_L:r.BRAZO_L;
        const sj=ne?r.A.datos.piezas.brazo_cerca.codo:(r===G?L0/2:r.A.datos.piezas.brazo.codo);
        const obj={x:m.x+r.JK*r.MUNECA_R*Math.cos(m.mu),y:m.y+r.JK*r.MUNECA_R*Math.sin(m.mu)};
        mu=Math.max(mu,dist(Recortes.extremo(Recortes.ikContinuo(h,obj,L0,sj,42,m.dobla,1.08)),obj)*p.s*(r.K||1));}
    }
    const maxBota=t=>{const p=D.poseC(t),L=D.liston(t);return Math.max(...suelaC.map(q=>distancia(pie(C,p,"cerca",q),L)))+D.RADIO;};
    const sep=t=>distancia(D.vientre(t),D.liston(t))-D.RADIO;
    const giro=[T.gira0,(T.gira0+T.gira1)/2,T.gira1].map(t=>D.anchoGiro(D.poseC(t).giro));
    const guinos=[T.guino+.14,T.guino+.65,T.gana+.18].map(t=>{const o=D.poseC(t).cara.ojos;return [o.i,o.d];});
    const tMano=(T.gCruje+T.gChulo+.10)/2,manos=D.poseG(tMano);
    const nudillos=dist(dedo(G,manos,manos.manoCerca,"indice"),dedo(G,manos,manos.manoLejos,"menique"));
    const rie=D.poseC(11.7),pasa=[2.85,3.75,4.8].map(t=>D.poseC(t).torso);
    const m={muescas,dedoBaja,apoyo,atraviesa,vara,aire,mu,bota,contactoBota:[maxBota(T.bota),maxBota(T.bota+.18)],cruza,libre,giro,guinos,nudillos,radio:2*2.65*G.JK*.3,
      boca:dist(C.aPantalla(rie,rie.manoLejos),C.aPantalla(rie,C.boca(rie))),pasa,contactos:[0,.15,.30,.405,.51,.72].map(k=>sep(T.boing+k)),comprime:[D.aplasta(T.bota-.02),D.aplasta(T.bota+.15)],
      entrega:[T.suelta,T.boing].map(t=>{const a=D.liston(t-1e-6),b=D.liston(t+1e-6);return [Math.abs(a.alto-b.alto),Math.abs(a.ang-b.ang),Math.abs(a.x-b.x)];})};
    const can=document.createElement("canvas");can.width=1024;can.height=620;const ctx=can.getContext("2d");
    const npx=(a,w)=>{let n=0;for(let i=0;i<a.length;i+=4)if(w(a,i))n++;return n;};
    const mezcla=(a,i)=>a[i+3]>100;
    const maximo={n:0,t:0};
    for(let t=T.baja1;t<T.sube1;t+=.045){ctx.clearRect(0,0,1024,620);D.dibujaCarla(ctx,D.poseC(t),t);
      const n=npx(ctx.getImageData(423,339,234,11).data,mezcla);if(n>maximo.n){maximo.n=n;maximo.t=t;}}
    ctx.clearRect(0,0,1024,620);const pc=D.poseC(3.5);D.dibujaCarla(ctx,pc,3.5);
    const hx=Math.floor(C.aPantalla(pc,C.centroCabeza(pc)).x)-75;
    const pelo=npx(ctx.getImageData(hx,557,180,3).data,(a,i)=>a[i+3]>25&&a[i]>a[i+1]*1.12);
    const subsuelo=npx(ctx.getImageData(hx,562,180,15).data,mezcla);
    ctx.clearRect(0,0,1024,620);const tg=(T.gira0+T.gira1)/2,pgiro=D.poseC(tg);D.dibujaCarla(ctx,pgiro,tg);
    const perfil=npx(ctx.getImageData(Math.floor(pgiro.x)-68,140,136,148).data,mezcla);
    const bloque=ctx.getImageData(Math.floor(pgiro.x)-68,140,136,410).data;
    const solidos=npx(bloque,(a,i)=>a[i+3]>225),huella=npx(bloque,(a,i)=>a[i+3]>55);
    m.pix={invasion:maximo,pelo,subsuelo,perfil,opacidad:solidos/huella};
    if(m.muescas>.02||m.dedoBaja>.02||m.mu>.03||m.atraviesa>.02||m.apoyo>.02||m.vara>.02) throw Error("Tacos, índice, muñecas o apoyos fuera de registro");
    if(m.aire<14||m.contactos[3]<4||Math.max(...[0,2,4,5].map(i=>Math.abs(m.contactos[i])))>.03||m.entrega.flat().some(v=>v>.03)||m.contactoBota.some(v=>Math.abs(v)>.03)||m.bota>.03||m.libre<-.05||m.cruza<10||m.comprime[0]!==0||m.comprime[1]<.99) throw Error("Caída, rebotes o bota incorrectos");
    if(m.guinos[0][0]<.99||m.guinos[0][1]>.5||m.guinos[2][0]<.99||m.guinos[2][1]>.5||m.giro[1]<.30||m.boca>.02||Math.abs(m.nudillos-m.radio)>.02) throw Error("Guiño, risa, perfil o nudillos incorrectos");
    if(m.pix.invasion.n>4||m.pix.pelo<3||m.pix.subsuelo>0||m.pix.perfil<180||m.pix.opacidad<.84) throw Error("Silueta del limbo: "+JSON.stringify(m.pix));
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
  console.log(JSON.stringify({scene: "00043.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
