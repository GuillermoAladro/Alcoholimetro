const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00042.2 Guillermo y Carla - el ligue.js", "carla");
  const original=await load("escenas/00042 Guillermo y Carla - el ligue.js","carla");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  run.frame(1);
  const checks = run.eval(`(() => {
    const D = __A2D_00042_2;
    const {G,Ca,T,YB}=D,dist=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
    const M=(r,p,m,u)=>D.mul(D.matMano(r,p,m),D.escala(1/u));
    const mg=t=>{const p=D.poseG(t);return D.mul(D.matMano(G,p,p.manoCerca),[(p.anchoFlor||1)/D.UG,0,0,1/D.UG,0,0]);};
    const mc=t=>{const p=D.poseC(t);return D.mul(M(Ca,p,p.manoLejos,D.UC),D.florDeCarla(t));};
    const gotas=[],toma=[],diferencias=[],peina=[];
    let despega=0,superficie=0,derrame=0,nariz=0,agarrado=0,pies=0;
    const puntosSuela=[[-62.03,9],[-47.69,-12.6],[-40.52,-19.8],[-30.96,-24.6],[-23.79,-27],[-9.46,-29.4],[7.27,-29.4],[19.22,-27],[28.77,-24.6],[33.55,-22.2],[138.69,42.6],[145.86,49.8],[153.03,61.8],[155.42,71.4],[155.42,78.6],[148.25,85.8],[141.08,88.2],[131.52,90.6],[119.57,93],[55.06,93],[-42.91,78.6],[-54.86,76.2],[-62.03,73.8]];
    for(let i=0;i<=D.DUR*60;i++) {
      const t=i/60,g=D.poseG(t),c=D.poseC(t);
      for(const [rig,p] of [[G,g],[Ca,c]])for(const l of ["cerca","lejos"]){
        const m=l==="cerca"?p.manoCerca:p.manoLejos,ar=D.brazo(rig,p,l);
        const r=G.rotP({x:rig.JK*rig.MUNECA_R*Math.cos(m.mu),y:rig.JK*rig.MUNECA_R*Math.sin(m.mu)},m.ang);
        despega=Math.max(despega,dist(Recortes.extremo(ar),{x:m.x+r.x,y:m.y+r.y})*p.s*(rig.K||1));
      }
      if(t<D.T_COPA) {
        const a=D.inclinaCopa(t),niv=D.superficie(t,a),lab=D.LABIO_COPA,lim=Math.sin(a)*lab.x+Math.cos(a)*lab.y;
        superficie=Math.max(superficie,Math.abs(D.areaLiquida(a,niv)-D.areaLiquida(0,D.nivelCopa(t))));
        derrame=Math.max(derrame,lim-niv);
        for(const [x,y] of T.sorbos)if(t>=x+.32&&t<=y-.30){
          gotas.push(Math.abs(niv-lim));toma.push(dist(D.aplica(M(Ca,c,c.manoLejos,D.UC),lab),Ca.aPantalla(c,Ca.boca(c))));}
      }
      if(t>=T.huele2 && t<T.guinoC-.45) nariz=Math.max(nariz,dist(D.aplica(mc(t),D.petalos[2]),Ca.aPantalla(c,Ca.cabeza(c).a({x:910,y:552}))));
      if(t>=T.coge)agarrado=Math.max(agarrado,dist(D.aplica(mc(t),D.ASIR),Ca.aPantalla(c,c.manoLejos)));
      for(const l of ["cerca","lejos"]){const pie=D.pieG(l,t),p=g.piernas[l],suela=Math.max(...puntosSuela.map(([x,y])=>G.aPantalla(g,{x:p.tob.x,y:p.tob.y+x*Math.sin(p.ang)+y*Math.cos(p.ang)}).y));
        if(pie.arco===0)pies=Math.max(pies,Math.abs(suela-(l==="cerca"?560:560-12*.31)));}
    }
    const F=D.floreEnMundo(),qPts=[D.ASIR,D.FLOR_CAB,D.petalos[7]],delta=(u,v)=>Math.max(...qPts.map(p=>dist(D.aplica(u,p),D.aplica(v,p))));
    const transfer=[delta(mg(T.suelta-.00001),F),delta(F,mc(T.coge))];
    const sueltaCopa=dist(D.aplica(D.copaEnMundo(),{x:0,y:23.4}),{x:744,y:YB});
    const codo=t=>G.aPantalla(D.poseG(t),Recortes.muestras(D.brazo(G,D.poseG(t),"cerca"),16)[10]).y;
    const golpe=[codo(9.56),codo(T.falla),codo(T.cuelga),D.traqueteo(T.golpe-.001),D.traqueteo(T.golpe+.03)];
    const pua=t=>{const p=D.poseG(t),m=p.manoCerca,v=G.rotP(D.PUA,-2.23),q=G.aPantalla(p,m);return {x:q.x+v.x,y:q.y+v.y};};
    for(let i=0;i<3;i++){let error=0;
      for(const v of [.08,.24,.42,.58]){const t=T.peina0+(i+v)*(T.peina1-T.peina0)/3,p=D.poseG(t),ps=D.pasada(t),q=G.cabeza(p).a(M2.mezcla(D.PEINE_A,D.PEINE_B,ps.u));error=Math.max(error,dist(pua(t),G.aPantalla(p,q)));}
      const limite=T.peina0+(i+.6)*(T.peina1-T.peina0)/3;diferencias.push(dist(pua(limite-.00001),pua(limite+.00001)));
      peina.push(error);}
    const p=D.poseG(13.85),cara=q=>G.aPantalla(p,G.cabeza(p).a(q)),cfinal=D.poseC(14);
    const m={peina,empalmes:diferencias,despega,pies,volumen:superficie,derrame,labio:Math.max(...toma),menisco:Math.max(...gotas),sorbos:T.sorbos.map(([a,b])=>[D.nivelCopa(a),D.nivelCopa(b)]),
      transfer,manoEnTallo:agarrado,apoyoFlor:D.aplica(F,{x:0,y:0}).y+D.apoyoFlor(-Math.PI/2,D.FLOR_PLANA),talloHaciaCarla:D.aplica(F,D.ASIR).x-D.aplica(F,D.FLOR_CAB).x,
      sueltaCopa,nariz,golpe,guino:[cfinal.cara.ojos.d,cfinal.cara.ojos.i],asoma:[cara({x:770,y:562}).y,cara({x:899,y:616}).y,G.aPantalla(p,G.boca(p)).y],dedos:[p.manoCerca,p.manoLejos].map(m=>G.aPantalla(p,m).y+D.puntaCanto(.4,m.mu).y)};
    const gc=document.createElement("canvas");gc.width=1024;gc.height=600;const ctx=gc.getContext("2d");
    D.manosCanto(ctx,p,13.85);
    const cnt=(x,y,w,h)=>{const a=ctx.getImageData(x,y,w,h).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i]>100)n++;return n;};
    const pelo=[];const gm=G.A.datos.piezas.cabeza;for(let i=0;i<=10;i++){
      const q=M2.mezcla(D.PEINE_A,D.PEINE_B,i/10), xx=gm.marco[0]+Math.floor((q.x-gm.origen[0])*gm.marco[2]/gm.tam_hoja[0]),yy=gm.marco[1]+Math.floor((q.y-gm.origen[1])*gm.marco[3]/gm.tam_hoja[1]);
      ctx.clearRect(0,0,1,1);ctx.drawImage(G.A.imgs[gm.img||0],xx,yy,1,1,0,0,1,1);pelo.push([...ctx.getImageData(0,0,1,1).data]);}
    m.raster={pelo,manoCerca:cnt(565,YB,39,5),manoLejos:cnt(636,YB,40,5),debajo:cnt(565,YB+6,112,8)};
    if(m.peina.some(x=>x>.03)||m.empalmes.some(x=>x>.03)||m.despega>.03||m.pies>.03||m.raster.pelo.some(p=>p[3]<220||p[0]<=p[1]||p[1]>120)) throw Error("Pelo, muñecas o suelas fuera de registro");
    if(m.volumen>.01||m.derrame>.001||m.labio>.02||m.menisco>.001||m.sueltaCopa>.01||m.sorbos.some(([a,b])=>b-a!==3)) throw Error("La copa pierde líquido o no llega al labio");
    if(m.transfer.some(x=>x>.03)||m.manoEnTallo>.02||Math.abs(m.apoyoFlor-D.YB)>.02||m.talloHaciaCarla<35||m.nariz>.02) throw Error("Salto, apoyo o contacto incorrecto en la flor");
    if(m.golpe[0]>=m.golpe[1]||m.golpe[1]<D.YB-5||m.golpe[1]>D.YB||m.golpe[2]<=D.YB+8||m.golpe[3]!==0||m.golpe[4]<.5) throw Error("El codo y la reacción de la barra no guardan orden");
    if(m.asoma[1]>=D.YB-3||m.asoma[2]<=D.YB+6||m.guino[0]<.99||m.guino[1]>.5||m.dedos.some(y=>Math.abs(y-D.YB-2.5)>.03)||Math.min(m.raster.manoCerca,m.raster.manoLejos)<8||m.raster.debajo!==0) throw Error("Ojos, guiño o dedos en el borde incorrectos");
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
  console.log(JSON.stringify({scene: "00042.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
