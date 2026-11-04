const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00140.2 Guillermo y Yorgi - el selfie del gimnasio.js", "yorgi");
  const original=await load("escenas/00140 Guillermo y Yorgi - el selfie del gimnasio.js","yorgi");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  run.frame(1);
  const checks = run.eval(`(() => {
    const D = __A2D_00140_2;
    const {G,Yo,T}=D,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    D.simulaVuelo();
    const w=(rig,p,q)=>rig.aPantalla(p,q);
    const pie=(rig,p,l)=>{const q=p.piernas[l],a=q.ang;
      const contorno=rig===G?[[-62.03,9],[-47.69,-12.6],[-40.52,-19.8],[-30.96,-24.6],[-23.79,-27],[-9.46,-29.4],[7.27,-29.4],[19.22,-27],[28.77,-24.6],[33.55,-22.2],[138.69,42.6],[145.86,49.8],[153.03,61.8],[155.42,71.4],[155.42,78.6],[148.25,85.8],[141.08,88.2],[131.52,90.6],[119.57,93],[55.06,93],[-42.91,78.6],[-54.86,76.2],[-62.03,73.8]]:[[-59.06,34.45],[-56.69,5.89],[-28.19,-13.15],[-23.44,-15.53],[-16.31,-17.91],[59.69,-25.05],[64.44,-25.05],[145.19,32.07],[147.56,34.45],[157.06,53.49],[157.06,70.15],[154.69,72.53],[149.94,74.91],[142.81,77.29],[130.94,79.67],[114.31,82.05],[66.81,82.05],[-35.31,65.39],[-47.19,63.01],[-54.31,60.63],[-59.06,58.25]];
      return Math.max(...contorno.map(([x,y])=>w(rig,p,{x:q.tob.x,y:q.tob.y+x*Math.sin(a)+y*Math.cos(a)}).y));};
    let suelo=0,patina=0,cadera=0,barriga=0,penetra=0,asentada=0;
    const planta=D.poseG(T.aterriza);
    for(let n=0;n<=D.DUR*120;n++){
      const t=n/120,p=D.poseG(t),y=D.poseY(t);
      for(const l of ["cerca","lejos"]){const lej=l==="lejos"?6:0;
        suelo=Math.max(suelo,Math.abs(pie(Yo,y,l)-(566-lej)));
        if(t>=T.aterriza){suelo=Math.max(suelo,Math.abs(pie(G,p,l)-(572-lej)));
          patina=Math.max(patina,Math.abs(w(G,p,p.piernas[l].tob).x-w(G,planta,planta.piernas[l].tob).x));}}
      if(t>T.caderaG1)cadera=Math.max(cadera,dist(w(G,p,p.manoLejos),w(G,p,G.tronco(p)({x:354,y:667}))));
      if(t>=7.14)barriga=Math.max(barriga,dist(w(Yo,y,y.manoCerca),w(Yo,y,Yo.tronco(y)({x:230,y:582}))));
      if(t>=T.suelta){const e=D.estadoVuelo(t),ay=D.apoyoTela(e).y;penetra=Math.max(penetra,ay-D.SUELO_MANGA);
        if(e.posado)asentada=Math.max(asentada,Math.abs(ay-D.SUELO_MANGA));}
    }
    const pos=D.estadoVuelo(9),impacto=pos.tPos,et=D.estadoVuelo(impacto);
    const fin=D.estadoVuelo(8.8),cercaSuelo=[impacto,et.xImpacto,pos.x,et.posado?1:0,D.apoyoTela(D.estadoVuelo(impacto-.05)).y,D.apoyoTela(et).y];
    const codo=(rig,get,t,l)=>{const p=get(t),c=D.cadena(rig,p,l);return w(rig,p,Recortes.muestras(c,16)[8]);};
    const polos=[[G,D.poseG,3.72,"lejos"],[Yo,D.poseY,6.84,"cerca"]].map(([q,f,t,l])=>dist(codo(q,f,t-.00001,l),codo(q,f,t+.00001,l)));
    const c=D.cadena(G,D.poseG(T.suelta),"cerca"),f=D.marcoManga(D.poseG(T.suelta),c,T.suelta);
    const sale=Math.max(...D.CONTORNO.map(q=>dist(D.mangaAPantalla(D.poseG(T.suelta),f,q),D.telaEn(D.estadoVuelo(T.suelta),q))));
    const pulgar=t=>{const p=D.poseY(t),m=p.manoLejos,de=m.dedos,k=de.pulgar,op=(de.indice+de.medio+de.anular+de.menique)/4;
      const phi=M2.lerp(-1.15,M2.lerp(1.4,.95,op),k),L=M2.lerp(9.5,M2.lerp(15,12.5,op),k);
      const x=8.6+(Math.sin(phi*.85)+Math.sin(phi))*L/2,y=M2.lerp(-5.5,-3,k*(1-op))+(Math.cos(phi*.85)+Math.cos(phi))*L/2;
      const mu=m.mu+Math.PI/2,q={x:x*Math.cos(mu)-y*Math.sin(mu),y:x*Math.sin(mu)+y*Math.cos(mu)};
      return dist(D.puntoMovil(p,q),D.puntoMovil(p,D.BOTON));};
    const pulsa=[pulgar(T.yDispara),pulgar(T.yDispara+.07),pulgar(T.yDispara+.14)];
    const yg=D.poseY(T.foto),gg=D.poseG(T.foto),tela=D.estadoVuelo(T.foto);
    const enFoto=[D.puntoMovil(yg,D.LED),w(Yo,yg,Yo.centroCabeza(yg)),w(G,gg,G.centroCabeza(gg)),tela].map(q=>{
      const r=D.refl(q),b=D.RECORTE;return Math.min(r.x-b.x,b.x+b.w-r.x,r.y-b.y,b.y+b.h-r.y);});
    const bombeos=[T.bombeo1,T.bombeo1+.12,T.bombeo1+.24,T.bombeo2+.12,T.bombeo2+.24].map(t=>D.poseY(t).manoCerca.y);
    const m={suelo,patina,cadera,barriga,penetra,asentada,cercaSuelo,polos,sale,pulsa,enFoto,bombeos,
      salto:pie(G,D.poseG(3.31),"cerca"),apoyos:[D.apoyoPieG("cerca"),D.apoyoPieG("lejos")],giros:(D.estadoVuelo(T.suelta).a-fin.a)/(2*Math.PI),
      orden:[T.yDispara+.07,T.orgullo,T.rasgon,T.suelta,T.foto], flash:D.flash(T.foto),pantalla:D.giraMovil(8.4)};
    const crea=(x,y)=>{const c=document.createElement("canvas");c.width=x;c.height=y;return c.getContext("2d");};
    const punto=(im,x,y)=>{const g=crea(1,1);g.drawImage(im,x,y,1,1,0,0,1,1);return [...g.getImageData(0,0,1,1).data];};
    const tejido=(rig,x,y)=>{const p=rig.A.datos.piezas.tronco_libre;
      return punto(rig.A.imgs[p.img||0],p.marco[0]+Math.floor((x-p.origen[0])*p.marco[2]/p.tam_hoja[0]),p.marco[1]+Math.floor((y-p.origen[1])*p.marco[3]/p.tam_hoja[1]));};
    const foto=D.foto(),pr=crea(90,100),muestras=[];
    pr.translate(50,55);D.dibujoMovil(pr,8.6);
    for(let y=-29;y<-8;y+=3)for(let x=-21;x<-4;x+=2){const v=pr.getImageData(50+x,55+y,1,1).data;muestras.push(v[0]*65536+v[1]*256+v[2]);}
    const z=D.G.A.datos.piezas.brazo_cerca;
    m.raster={manoCadera:tejido(G,354,667),manoBarriga:tejido(Yo,230,582),camiseta:punto(G.A.imgs[1],z.marco[0]+24,z.marco[1]+42),
      palido:punto(D.atlasBrazo(),z.marco[0]+24,z.marco[1]+42),captura:[foto.width,foto.height],tonosPantalla:new Set(muestras).size};
    if (m.suelo>.02 || m.patina>.02 || m.cadera>.02 || m.barriga>.02 || m.salto>480 || m.apoyos[0].y!==572 || m.apoyos[1].y!==566) throw Error("Pies, cadera o palma fuera de su apoyo");
    if (m.polos.some(v=>v>.05) || m.bombeos[1]>m.bombeos[0]-10 || m.bombeos[3]>m.bombeos[2]-10 || m.bombeos[4]<m.bombeos[3]+10) throw Error("Los codos o los dos bombeos pierden continuidad");
    if (m.orden.some((t,i)=>i&&t<=m.orden[i-1]) || m.pulsa[1]>.03 || Math.min(m.pulsa[0],m.pulsa[2])<5 || m.flash!==1 || m.pantalla!==1 || Math.min(...m.enFoto)<10) throw Error("Botón, foto o reflejo fuera de registro");
    if (m.sale>.03 || m.penetra>.02 || m.asentada>.02 || m.giros<1 || m.cercaSuelo[0]<7.4 || m.cercaSuelo[2]<12 || m.cercaSuelo[1]>145 || !m.cercaSuelo[3] || m.cercaSuelo[4]>565 || Math.abs(m.cercaSuelo[5]-576)>.02) throw Error("La tela cambia de forma, flota o atraviesa la esterilla");
    if (m.raster.manoCadera[3]<200 || m.raster.manoBarriga[3]<200 || m.raster.palido[0]-m.raster.camiseta[0]<75 || m.raster.palido[3]<235 || m.raster.tonosPantalla<18 || m.raster.captura[0]<580) throw Error("Faltan el contacto visible, la piel pálida o la foto en pantalla");
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
  console.log(JSON.stringify({scene: "00140.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
