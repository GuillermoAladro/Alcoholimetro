const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00134.2 Guillermo y Yorgi - la barbacoa.js", "yorgi");
  const original=await load("escenas/00134 Guillermo y Yorgi - la barbacoa.js","yorgi");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00134_2;
    const G=Guillermo,Y=Yorgi,T=D.T,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const pie=(Q,p,l)=>D.apoyoPie(Q,p,l),mano=(Q,p,m,q=D.PAD)=>D.marcaMano(Q,p,m,q);
    let alcance=0,aros=0,asientos=0,aprieta=0,agarreY=0,serv=0,babero=0,capas=0;
    let separa=1e3,margen=1e3;
    for(let n=0;n<=894;n++){const t=n/60,g=D.poseG(t),y=D.poseY(t);
      alcance=Math.max(alcance,...Object.values(D.diag(t)));
      for(const [Q,p,xc,sg] of [[G,g,D.XG-4,1],[Y,y,D.XY+4,-1]]){
        asientos=Math.max(asientos,Math.abs(D.costura(Q,p).y-D.Y_ASIENTO+4));
        for(const [l,dx,prof] of [['cerca',-10,1],['lejos',24,-1]]){
          const v=Q===Y&&l==='cerca'?Math.max(0,-p.piernas[l].ang)*50:0;
          aros=Math.max(aros,d(pie(Q,p,l),{x:xc+sg*(dx+.35*v),y:D.Y_ARO+prof*7*Math.sqrt(1-(dx/30)**2)-v}));}}
      if(t>T.sale&&t<=T.llega){const a=D.platoPos(t,'g'),b=D.platoPos(t,'y');separa=Math.min(separa,b.x-a.x-31*(a.e+b.e));
        if(a.y>=300)margen=Math.min(margen,a.x-433-11-a.e*31,598-b.x-6-b.e*31);}
      if(t>=T.yCoge&&t<T.a2-.17){const h=y.hamb;
        agarreY=Math.max(agarreY,d(mano(Y,y,y.manoLejos),D.puntoH(h,-17,0)),d(mano(Y,y,y.manoCerca),D.puntoH(h,26.5,-14)));}
      if(t>=T.gAprieta0&&t<=T.gSuelta-.02)aprieta=Math.max(aprieta,d(mano(G,g,g.manoLejos),D.coronaPan(g.hamb)),d(mano(G,g,g.manoCerca),D.puntoH(g.hamb,-6,0)));
      const sv=D.servilletaT(t);
      if(t>=T.yServ&&t<=T.gToma)serv=Math.max(serv,d(mano(Y,y,y.manoLejos,D.PINZA_P),D.esquina(sv,true)));
      if(t>=T.gToma&&t<=T.gPalpa)serv=Math.max(serv,d(mano(G,g,g.manoLejos,D.PINZA_P),D.esquina(sv,false)));
      if(t>=T.gMete)babero=Math.max(babero,d(sv,D.cuelloG(g)));
      if(t>=T.gMiraTapa+.4){const p=D.capaEstado(0,t),r=D.regazo(t);
        capas=Math.max(capas,Math.abs(p.y-r.y+D.rebote(0,t).alto),Math.abs(p.x+3-r.x));}
    }
    const entregas=[T.yServ,T.gToma,T.gMete].map(t=>d(D.servilletaT(t-1e-5),D.servilletaT(t+1e-5)));
    const apoyoDos=D.poseG(T.gToma),ayuda=D.poseY(T.gToma),s=D.servilletaT(T.gToma);
    const esquinas=[d(mano(G,apoyoDos,apoyoDos.manoLejos,D.PINZA_P),D.esquina(s,false)),d(mano(Y,ayuda,ayuda.manoLejos,D.PINZA_P),D.esquina(s,true)),d(D.esquina(s,false),D.esquina(s,true))];
    const caidas=T.caida.map((t,i)=>{const f=D.infoCapa(i),golpe=t+f.tc;
      const a=D.capaEstado(i,golpe-1e-6),b=D.capaEstado(i,golpe+1e-6);
      return [d(a,b),(T.caida[i+1]??T.gDeja0)-golpe,f.q1.y-f.q0.y,D.rebote(i,golpe+.05).alto];});
    const mord=[T.m1,T.m2].map((t,i)=>{const y=D.poseY(t),b=y.hamb,p=i?{x:20,y:-33}:{x:21,y:-54};
      return d(D.puntoH(b,p.x,p.y),D.enBocaY(y,-4,110));});
    const ultimo=T.m3+.19-1e-6,y=D.poseY(ultimo),bandera=d(D.puntoH(y.hamb,-14,-D.altoTorre(0)-24),D.enBocaY(y,-4,0));
    const g=D.poseG(T.gMuerde),nib=d(D.puntoH(g.hamb,D.MUESCA.x,D.MUESCA.y),D.enBocaG(g));
    const placa=t=>{const h=D.poseG(t).hamb;return D.puntoH(h,0,-D.altoTorre(h.sq||0,h.desde||0));};
    const cambioPivote=d(placa(T.gSuelta-1e-5),placa(T.gSuelta+1e-5));
    const lc=document.createElement('canvas');lc.width=240;lc.height=170;const c=lc.getContext('2d');
    const cuenta=()=>{const u=c.getImageData(0,0,lc.width,lc.height).data;let n=0;for(let k=3;k<u.length;k+=4)if(u[k]>96)n++;return n;};
    const limpia=()=>{c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,lc.width,lc.height);};
    const porcion=b=>{limpia();D.hamburguesa(c,{...b,x:110,y:b.piv==='tapa'?50:135,e:1,a:0,wob:0},3);return cuenta();};
    const comida=[T.yAlza,T.b1+.05,T.b2+.05,T.m3+.2].map(t=>porcion(D.poseY(t).hamb));
    const minimo=porcion(D.poseG(T.gMuerde-.001).hamb)-porcion(D.poseG(T.gMuerde+.1).hamb);
    const platos=[T.ding,T.sale,1.53].map(t=>{limpia();c.translate(-402,-190);for(const [quien,h] of [['g',D.poseG(t).hamb],['y',D.poseY(t).hamb]])D.servir(c,t,quien,h);return cuenta();});
    const pixels=(q,fn)=>{limpia();c.setTransform(4,0,0,4,120-4*q.x,85-4*q.y);fn();const u=c.getImageData(116,81,8,8).data;let n=0;for(let i=3;i<u.length;i+=4)if(u[i]>100)n++;return n;};
    const torso=(Q,p,t)=>Q.dibujar(c,{...p,capaTronco:null,manoLejos:{...p.manoLejos,objeto:null},manoCerca:{...p.manoCerca,objeto:null}},t);
    const telas=[8.46,10.42,12.34,13.8].map(t=>{const p=D.poseG(t),q=D.regazo(t),base=D.capaEstado(0,t);return [pixels(q,()=>torso(G,p,t)),pixels({x:base.x,y:base.y-.5},()=>D.capaSuelta(c,0,base,t))];});
    const tintes=D.MANCHAS.map(m=>{const p=D.poseG(T.chorro),a=D.salidaSalsa(p.hamb,m);return pixels(a,()=>D.hamburguesa(c,p.hamb,T.chorro));});
    const m={alcance,aros,asientos,aprieta,agarreY,serv,babero,capas,separa,margen,entregas,esquinas,caidas,mord,bandera,nib,cambioPivote,comida,minimo,platos,telas,tintes};
    if(alcance>1.08||Math.max(aros,asientos,aprieta,agarreY,serv,babero,capas,...entregas,...esquinas.slice(0,2),...mord,nib)>.025||esquinas[2]<15||separa<6||margen<1||caidas.some(([c,s,h,b])=>c>.01||s<.012||h<60||b<1)||bandera>.12||cambioPivote>.05||!(comida[0]>comida[1]+130&&comida[1]>comida[2]+120&&comida[2]>700&&comida[3]===0)||minimo<4||minimo>160||platos[0]!==0||platos[1]!==0||platos[2]<2500||telas.some(a=>Math.min(...a)<4)||Math.min(...tintes)<2)throw Error(JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00134.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
