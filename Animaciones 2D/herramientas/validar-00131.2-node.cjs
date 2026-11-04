const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {load, C} = require('./canvas-node.cjs');

(async () => {
  const run = await load("escenas/00131.2 Guillermo y Yorgi - el desayuno de campeones.js", "yorgi");
  const original=await load("escenas/00131 Guillermo y Yorgi - el desayuno de campeones.js","yorgi");
  for(let n=0;n<original.e.dur*12;n++)original.frame(n/12);
  const checks = run.eval(`(() => {
    const D = __A2D_00131_2;
    const {T}=D,G=Guillermo,Y=Yorgi,d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),e=1e-7;
    const vaso=t=>D.poseY(t).vaso||D.vasoEnBase(t), borde=t=>D.puntoVaso(vaso(t),D.PERFIL_BEBE);
    let boca=0,asa=0,area=0,mesa=0,boton=0,alcance=0;
    for(let i=0;i<=D.DUR*120;i++){
      const t=i/120,{g,y}=D.pose(t);
      if(y.vaso)asa=Math.max(asa,d(D.puntoVaso(y.vaso,D.AGARRE),Y.aPantalla(y,y.manoLejos)));
      if(t>=T.bebe1&&t<=T.bebe2){
        boca=Math.max(boca,d(borde(t),Y.aPantalla(y,Y.boca(y))));const a=y.vaso.ang,n={x:Math.sin(a),y:Math.cos(a)},q=D.PERFIL_BEBE;
        area=Math.max(area,Math.abs(D.contenido(t).vol-D.area(D.recorta(D.INT,n,n.x*q.x+n.y*q.y))/D.AREA_INT));
      }
      if(t>=T.inclina0+.38&&t<=T.erup+.04)mesa=Math.max(mesa,d(D.mesaG,D.yema(G,g,g.manoLejos,true)));
      if((t>=T.boton&&t<=T.boton+.04)||(t>=T.apaga&&t<=T.apaga+.06))boton=Math.max(boton,d(D.puntoBoton(t),D.yema(Y,y,y.manoLejos)));
      alcance=Math.max(alcance,...Object.values(D.diag(t)));
    }
    const uniones=[T.coge,T.bebe1,T.bebe2,T.posa].map(t=>{const a=vaso(t-e),b=vaso(t+e);return d(a,b)+Math.abs(a.ang-b.ang);});
    const bananas=[1,2].map(i=>{const c=i===1?T.b1Coge:T.b2Coge,s=i===1?T.b1Sale:T.b2Sale,p=i===1?T.b1PielCae:T.b2PielCae;
      const en=D.platanoMano(c),reposo=D.platanoReposo(i),b=D.platanoMano(s),f=D.frutaVuela(s,i),r=G.rotP({x:0,y:-20},b.ang),a=D.pielVuela(p-e,i),z=D.pielVuela(p+e,i);
      return {coge:d(en,reposo)+Math.abs(en.ang-reposo.ang),sale:d(f,{x:b.x+r.x,y:b.y+r.y})+Math.abs(f.a-b.ang),piel:d(a,z)+Math.abs(Math.atan2(Math.sin(a.a-z.a),Math.cos(a.a-z.a))),cantidad:D.platanosEnFrutero(c)};});
    const copos=Array.from({length:14},(_,i)=>{const t=T.avenaLanza+.01*i,p=D.copo(t,i),q=D.cuencoDe(D.cacillo(t)),fin=D.copo(D.llegadaCopo(i)+.01,i);
      return [d(p,{x:q.x,y:q.y-4}),fin===null?'jarra':fin.suelo?'encimera':'aire'];});
    const gota=D.gotaPelo(),ini=D.centroGoteron(gota,gota.t),fin=D.centroGoteron(gota,gota.t+gota.cae),lengua=D.trazadoLengua(T.lame),regreso=D.trazadoLengua(T.lame1);
    const cv=document.createElement('canvas');cv.width=cv.height=168;const ctx=cv.getContext('2d');
    const limpiar=()=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,168,168);};
    const beige=t=>{const v=vaso(t),p=D.puntoVaso(v,{x:0,y:-42});limpiar();ctx.setTransform(1.7,0,0,1.7,84-1.7*p.x,84-1.7*p.y);
      D.dibVaso(ctx,t,v);const a=ctx.getImageData(0,0,168,168).data;let n=0;for(let j=0;j<a.length;j+=4)if(a[j+3]>100&&a[j]>155&&a[j+1]>120&&a[j+2]<180&&a[j]-a[j+2]>47&&a[j+1]-a[j+2]>15)n++;return n;};
    const liquido=[beige(T.bebe1+.055),beige(T.bebe1+.4),beige(T.bebe2-.04)];
    limpiar();ctx.setTransform(3,0,0,3,84-3*fin.x,84-3*fin.y);D.batidoEncimaG(ctx,gota.t+gota.cae,D.poseG(gota.t+gota.cae));
    const p=ctx.getImageData(80,80,9,9).data;let pelo=0;for(let j=3;j<p.length;j+=4)if(p[j]>150)pelo++;
    const m={boca,asa,area,mesa,boton,alcance,uniones,bananas,copos,gota,ini,fin,pelo,liquido,
      contactoLengua:d(lengua.tip,D.puntaGota(T.lame)),retraida:d(regreso.tip,regreso.base),avenaAntes:D.avenaRecibida(T.avenaCae-.041),avenaDespues:D.avenaRecibida(T.avenaCae+.13)};
    if(Math.max(boca,asa,area,mesa,boton,...uniones,m.contactoLengua,m.retraida)>.006||alcance>1.08||bananas.some((v,i)=>Math.max(v.coge,v.sale,v.piel)>.007||v.cantidad!==2-i)||copos.some(([error,lugar],i)=>error>.002||lugar!==(i<12?'jarra':'encimera'))||pelo<6||Math.abs(fin.y-gota.hasta)>.001||fin.y-ini.y<40||m.avenaAntes!==0||m.avenaDespues!==1||liquido[0]<200||liquido[1]>=liquido[0]||liquido[2]>2||D.kBatido(T.erup+.055)>0)throw Error(JSON.stringify(m));
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
  console.log(JSON.stringify({scene: "00131.2", duration, renderer: 'Canvas 2D / Node-Skia', checks,
    blackSamples: 16, seekSamples: times, playbackRates: [30, 60, 120]}, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;});
