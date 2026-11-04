const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00038.2';
  const r = await load('escenas/00038.2 Guillermo y Ander - el beer pong.js', 'ander');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00038_2, T = D.T;
    let wrist = 0, catchError = 0, juggle = 0;
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
    }
    D.bolas(T.a1Suelta);
    const geo = D.geo();
    for (const [t,target] of geo.G) {
      catchError = Math.max(catchError, distance(D.bolas(t)[1],target));
    }
    for (const [t,target] of geo.E) catchError=Math.max(catchError,distance(D.bolas(t)[1],target));
    for(let i=0;i<=5;i++){
      const t=T.malab0+i*(T.malab1-T.malab0)/5,p=D.pose(t).a;
      juggle=Math.max(juggle,distance(D.bolas(t)[2],D.bolaEnMano(Ander,p,p.manoLejos)));
    }
    const joins=[T.a2Suelta,T.a2Plop,T.gPesca,T.gSuelta,T.lampara,T.botella,T.cabeza,T.pared,T.boca,T.escupe,T.plopFin];
    const continuity=Math.max(...joins.map(t=>distance(D.bolas(t-1e-6)[1],D.bolas(t+1e-6)[1])));
    const ca=D.camara(8.98),mouth=D.bolas(8.98)[1],cx=512+(mouth.x-ca.x)*ca.k,cy=300+(mouth.y-ca.y)*ca.k;
    return {wrist,catchError,juggle,continuity,framed:cx>50&&cx<974&&cy>40&&cy<560&&ca.k>1.65};
  })()`);
  for (const key of ['wrist','catchError','juggle','continuity']) {
    const names={wrist:'Unión de las muñecas',catchError:'Botes, recepción en la boca y vaso final',juggle:'Seis contactos de los cinco malabares',continuity:'Continuidad entre manos, vasos y vuelo'};
    check(names[key],measurements[key]<.01,{errorMaxPx:measurements[key]});
  }
  check('Bola visible en el encuadre de la boca',measurements.framed);
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 1, 1.85, 2.95, 3.8, 4.3, 6.5, 6.78, 7.12, 7.57, 7.95, 8.67, 9.6, 11.5, 12.25, 14.08, 14.2];
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
