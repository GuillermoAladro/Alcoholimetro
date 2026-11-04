const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00040.2';
  const r = await load('escenas/00040.2 Guillermo y Ander - la guitarra.js', 'ander');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00040_2, T = D.T;
    let wrist = 0, longitud = 0, contacto = 0, ancla = 0, traste = 0, silence = 0;
    const a0=D.pose(T.rompe).a, q=D.CUERDAS[0];
    const puente = D.guitAPantalla(a0,{x:D.PUENTE,y:q.yp});
    const largo = Math.hypot(puente.x-D.guitAPantalla(a0,{x:D.CEJUELA,y:q.yc}).x,puente.y-D.guitAPantalla(a0,{x:D.CEJUELA,y:q.yc}).y);
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    for (let i = 0; i <= Math.round(D.DUR * 120); ++i) {
      const t = i / 120, P = D.pose(t);
      for (const [p, A] of [[P.g, Guillermo], [P.a, Ander]]) {
        for (const near of [true, false]) {
          const m = near ? p.manoCerca : p.manoLejos;
          const shoulder = A.tronco(p)(near ? A.HOMBRO_C : A.HOMBRO);
          const length = near ? A.BRAZO_C_L : A.BRAZO_L;
          const joint = near ? A.A.datos.piezas.brazo_cerca.codo : A === Guillermo ? length / 2 : A.A.datos.piezas.brazo.codo;
          const angle = m.ang + m.mu;
          const target = { x: m.x + Math.cos(angle) * A.MUNECA_R * A.JK, y: m.y + Math.sin(angle) * A.MUNECA_R * A.JK };
          const curve = Recortes.ikContinuo(shoulder, target, length, joint, 42, m.dobla, 1.08);
          wrist = Math.max(wrist, distance(Recortes.extremo(curve), target) * p.s * A.K);
        }
      }
      traste = Math.max(traste,distance(Ander.aPantalla(P.a,P.a.manoLejos),D.guitAPantalla(P.a,{x:D.trasteX(t),y:-2})));
      if (t >= T.rompe) {
        const pts=D.formaCuerda(t,P.a,P.g).pts;
        longitud = Math.max(longitud,Math.abs(pts.slice(1).reduce((sum,p,j)=>sum+distance(pts[j],p),0)-largo));
        ancla = Math.max(ancla,distance(pts[0],D.guitAPantalla(P.a,{x:D.CEJUELA,y:q.yc})));
        if (t >= T.golpe && t <= T.golpe+0.07) contacto=Math.max(contacto,distance(pts.at(-1),Guillermo.aPantalla(P.g,Guillermo.cabeza(P.g).a(D.NARIZ_G))));
      }
      if (t >= T.silencio && t <= T.acorde-0.001) silence=Math.max(silence,D.vibracion(t));
    }
    const pts=t=>{const p=D.pose(t);return D.formaCuerda(t,p.a,p.g).pts;};
    const juntas = [T.golpe,T.golpe+.07].map(t=>distance(pts(t-1e-7).at(-1),pts(t+1e-7).at(-1)));
    const c=D.camara(T.golpe), encuadre=pts(T.golpe).every(p=>Math.abs((p.x-c.x)*c.k)<492 && Math.abs((p.y-c.y)*c.k)<280);
    const perro=D.estadoPerro(T.aulla0+.28).aulla>.9 && D.estadoPerro(T.orejas+.22).orejas>.9 && D.estadoPerro(T.escondido+.4).sube<.01;
    const nota=distance(D.posicionNotaFinal(T.nota),D.bocaInstrumento(D.pose(T.nota).a));
    return {wrist,longitud,contacto,ancla,traste,silence,nota,encuadre,perro,inicio:distance(pts(T.rompe).at(-1),puente),transicion:Math.max(...juntas),acorde:D.vibracion(T.nota)>1 && D.posicionNotaFinal(T.nota+.2).y<D.posicionNotaFinal(T.nota).y};
  })()`);
  for (const [key,label] of [['wrist','Cuatro muñecas unidas'],['longitud','La cuerda conserva su longitud desde la rotura al final'],['contacto','La cuerda alcanza la punta de la nariz y acompaña el primer retroceso'],['ancla','La cuerda sigue sujeta a la cejuela'],['traste','La mano lejana sigue los acordes'],['inicio','El cabo suelto sale del puente'],['transicion','Continuidad al tocar y soltar la nariz'],['nota','La última nota nace en la boca de la guitarra'],['silence','Silencio entre la rotura y el último rasgueo']]) check(label,measurements[key]<.02,{errorMax:measurements[key]});
  check('Golpe completo dentro del plano',measurements.encuadre);
  check('El perro aúlla, se tapa las orejas y se esconde',measurements.perro);
  check('Vibración y nota ascendente en el último acorde',measurements.acorde);
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 2.65, 3.9, 4.62, 6.65, 7.88, 8.42, 8.54, 8.58, 8.65, 8.92, 10.38, 11.1, 12.4, 13.48, 13.6];
  const reference = times.map(hash);
  check('Rebobinado determinista', times.toReversed().every((t,i) => hash(t) === reference[times.length - 1 - i]));
  const black = [0, 0.12, r.e.dur - 0.12, r.e.dur].every(t => {
    const data = r.frame(t).data();
    for (let k=0; k<data.length; k+=4) if (data[k] || data[k+1] || data[k+2] || data[k+3] !== 255) return false;
    return true;
  });
  check('Negro inicial y final', black);
  for (const fps of [30, 60, 120]) {
    r.e.t = 0;
    while (!r.e.terminada) r.e.actualizar(1/fps);
    check('Fin a ' + fps + ' fps', r.e.t === r.e.dur);
  }
  const report = {scene, durationSeconds:r.e.dur, renderer:'Canvas 2D / Node-Skia', results, passed:results.every(x=>x.passed)};
  fs.mkdirSync(path.join(ROOT, 'revision'), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'revision', scene+'-resultados-node.json'), JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  if (!report.passed) process.exitCode=1;
})().catch(error => {console.error(error); process.exitCode=1;});
