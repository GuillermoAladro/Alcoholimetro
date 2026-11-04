const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00122.2 Guillermo y Sara - el concierto.js", "sara-saez");
  const original=await load("escenas/00122 Guillermo y Sara - el concierto.js","sara-saez");
  for(let f=0;f<original.e.dur*12;f++) original.frame(f/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00122_2;
    const {T}=D, d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const marca=(r,p,m,quien,n)=>{const pt=D.puntaDedo(m,n),k=r.JK*(quien==='s'?.86:1);
      return r.aPantalla(p,{x:m.x+pt.x*k,y:m.y+pt.y*k});};
    const encuentro=t=>{const p=D.pose(t);return d(marca(SaraSaez,p.s,p.s.manoCerca,'s','indice'),D.puntaCorazon(t))-
      D.RADIO_DEDO*(p.g.s*Guillermo.JK+p.s.s*SaraSaez.K*SaraSaez.JK*.86);};
    let separados=0,plantado=0,foot=0,reach=0,hip=0,manoCuello=0,wipe=0,cierre=1;
    for(let i=0;i<D.DUR*120;i++){const t=i/120,{g:p,s}=D.pose(t);
      for(const k of ['cerca','lejos']){
        const objetivo=D.pasoG(k,t),tob=Guillermo.aPantalla(p,p.piernas[k].tob), yBase=p.suelo-(Guillermo.TOBILLO_ALTO+(k==='lejos'?12:0))*p.s;
        foot=Math.max(foot,Math.abs(tob.x-objetivo.x),Math.abs(tob.y-yBase+objetivo.h));
        for(const [r,pose] of [[Guillermo,p],[SaraSaez,s]]){const near=k==='cerca',m=near?pose.manoCerca:pose.manoLejos,h=r.tronco(pose)(near?r.HOMBRO_C:r.HOMBRO),l=near?r.BRAZO_C_L:r.BRAZO_L;
          reach=Math.max(reach,d({x:m.x+r.MUNECA_R*r.JK*Math.cos(m.mu),y:m.y+r.MUNECA_R*r.JK*Math.sin(m.mu)},h)/l);}}
      plantado=Math.max(plantado,Math.min(D.pasoG('cerca',t).h,D.pasoG('lejos',t).h));
      if(t>=T.sToca&&t<=T.sSuelta)separados=Math.max(separados,Math.abs(encuentro(t)));
      if(t>=T.gCuello+.18&&t<T.hit){const n=Guillermo.aPantalla(p,Guillermo.tronco(p)(Guillermo.CUELLO));manoCuello=Math.max(manoCuello,d(marca(Guillermo,p,p.manoCerca,'g','indice'),{x:n.x-5,y:n.y+4}));}
      if(t>=T.gFrota0+.26&&t<T.gFrota1){const k=M2.tramo(t,T.gFrota0,T.gFrota0+.28)*(1-M2.tramo(t,T.gFrota1-.12,T.gFrota1)),q=Guillermo.aPantalla(p,Guillermo.cabeza(p).a({x:748+21*k*Math.sin(t*14),y:660+12*k*Math.cos(t*14)}));wipe=Math.max(wipe,d(marca(Guillermo,p,p.manoCerca,'g','indice'),q));}
      if(t>T.sToca&&t<T.sBaja){if(p.manoLejos.dedos.medio>cierre+.0001)throw Error("el dedo vuelve a abrirse");cierre=p.manoLejos.dedos.medio;}}
    const face=D.caraDelGolpe(D.pose(T.hit).g),frac=D.clavesPelo().info.f,hair=d(face,D.puntaMelena(T.hit,frac)),gapBefore=encuentro(T.sToca-.08);
    const dedos=[T.gCuernos1+.08,T.sToca+.12,T.sBaja,T.arriba+.3].map(t=>D.pose(t).g.manoLejos.dedos);
    const amplitudes=[D.cabeceoS(2).ang-D.cabeceoS(2.25).ang,D.cabeceoG(6).ang-D.cabeceoG(6.125).ang],periodos=[Math.abs(D.cabeceoS(2).ang-D.cabeceoS(2.5).ang),Math.abs(D.cabeceoG(6).ang-D.cabeceoG(6.25).ang)];
    const phys={hair,frac,separados,gapBefore,foot,plantado,reach,manoCuello,wipe,dedos,amplitudes,periodos};
    const c=document.createElement('canvas');c.width=1024;c.height=600;const g=c.getContext('2d');
    const alphaAt=(fun,t,p)=>{g.clearRect(0,0,1024,600);fun(t);const data=g.getImageData(Math.round(p.x)-2,Math.round(p.y)-2,5,5).data;let a=0;for(let i=3;i<data.length;i+=4)a+=data[i];return a/(25*255);};
    const strandAt=t=>D.dibMelenaS(g,D.pose(t).s,t),brillo=t=>D.zas(g,t,D.pose(t).g);
    const peloPigmento=[T.hit-.12,T.hit].map(t=>alphaAt(strandAt,t,face));
    const destello=[T.hit-.003,T.hit+.07].map(t=>alphaAt(brillo,t,face));
    const nota=t=>{g.clearRect(0,0,1024,600);D.capaG(g,t,D.pose(t).g);const pix=g.getImageData(710,590,220,160).data;
      let bandas=0;for(let i=0;i<pix.length;i+=4)if(pix[i+3]>65&&pix[i]>150&&pix[i]-pix[i+1]>70)bandas++;return bandas;};
    const marcas=[T.hit-.005,T.hit+.24,13.5].map(nota);
    const antes=Recortes.tira;D.dibujaSara(g,D.pose(T.hit).s,T.hit);if(Recortes.tira!==antes)throw Error("el render afecta a otros avatares");
    if(Math.max(hair,separados,foot,plantado,manoCuello,wipe,...periodos)>.003||reach>1.08||gapBefore<2||amplitudes[0]<.3||amplitudes[1]<.65||dedos[0].medio!==1||dedos[1].medio>=1||dedos[1].medio<=0||dedos[2].medio!==0||!dedos.every(x=>x.indice>.99&&x.menique>.99&&x.anular<.01)||peloPigmento[0]>.05||peloPigmento[1]<.55||destello[0]!==0||destello[1]<.3||marcas[0]!==0||marcas[1]<25||marcas[2]<100)throw Error(JSON.stringify({phys,peloPigmento,destello,marcas}));
    return {phys,visibleHairOnCheek:peloPigmento,impactFlash:destello,redMarks:marcas};
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
  console.log(JSON.stringify({scene: "00122.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
