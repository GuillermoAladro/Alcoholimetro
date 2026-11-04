const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00039.2';
  const r = await load('escenas/00039.2 Guillermo y Ander - el gol.js', 'ander');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00039_2, T = D.T;
    let wrist = 0, agarre = 0;
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
      if (t >= T.junta1 && t <= T.suelta0) {
        const u = D.puntoUnion(P.g,P.a,t);
        const mg = Guillermo.aPantalla(P.g,P.g.manoLejos), ma = Ander.aPantalla(P.a,P.a.manoLejos);
        agarre = Math.max(agarre,distance(mg,{x:u.x-2.5*u.sc,y:u.y+1.5*u.sc}),distance(ma,{x:u.x+2.5*u.sc,y:u.y-1.5*u.sc}));
      }
    }
    D.prepara();
    const espuma = Math.max(distance(D.posVuelo(T.espuma),D.bordeVaso(D.pose(T.espuma).a)),distance(D.posVuelo(T.espumaLlega),D.espumaEnPelo(D.pose(T.espumaLlega).g)));
    const bebe = D.pose(T.sorbo0+0.30).a;
    const sorbo = distance(D.bordeVaso(bebe),Ander.aPantalla(bebe,Ander.boca(bebe)));
    const quieto = [T.congela,T.cae].map(t => {const a=D.corro(t-1e-6), b=D.corro(t+1e-6);return Math.hypot(a.h-b.h,a.dx-b.dx);});
    const tv = D.TV, c=D.camara(T.marcador), izquierda=512+(tv.x-c.x)*c.k, arriba=300+(tv.y-c.y)*c.k;
    return {wrist,agarre,espuma,sorbo,quieto:Math.max(...quieto),score:[T.gol-0.001,T.gol,T.marcador-0.001,T.marcador].map(D.goles).join('')==='0110',
      tele:c.k>2 && izquierda>0 && izquierda+tv.w*c.k<1024 && arriba>0 && arriba+tv.h*c.k<600,
      pausa:D.tauTele(T.pausa)===3.2 && D.tauTele(T.marcador)===3.2};
  })()`);
  for(const [key,label] of [['wrist','Cuatro mangas unidas a las muñecas'],['agarre','Agarre durante todos los saltos en corro'],['espuma','Salida y llegada de la espuma'],['sorbo','Borde de la caña en los labios'],['quieto','Entrada y salida de la suspensión en el aire']]) {
    check(label,measurements[key]<.01,{errorMaxPx:measurements[key]});
  }
  check('El marcador pasa de 0–0 a 1–0 y vuelve a 0–0',measurements.score);
  check('La repetición se detiene en el pase y se ve la tele entera al anular el gol',measurements.tele && measurements.pausa);
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 2.7, 3.87, 3.96, 4.10, 4.42, 4.84, 5.3, 7.25, 8.22, 8.7, 9.25, 11.84, 12.55, 13.88, 14];
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
