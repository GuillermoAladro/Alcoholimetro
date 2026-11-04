const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00036.2';
  const r = await load('escenas/00036.2 Guillermo y Ander - la maquina del gancho.js', 'ander');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00036_2, T = D.T;
    let wrist = 0, tag = 0, hug = 0;
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
      const toy = D.gigPantalla(t);
      if (toy?.lugar === 'mano') {
        const dy = -(D.R_GIG + 8) * toy.sy;
        const loop = {x:toy.x - Math.sin(toy.rot) * dy, y:toy.y + Math.cos(toy.rot) * dy};
        tag = Math.max(tag, distance(loop, Ander.aPantalla(P.a, P.a.manoLejos)));
      }
      if (toy?.lugar === 'abrazo') hug = Math.max(hug, distance(toy, Guillermo.aPantalla(P.g, Guillermo.tronco(P.g)(D.PECHO_G))));
    }
    const coinStart = distance(D.monedaAnder(T.flick), D.tomoMoneda(T.flick));
    const coinEnd = distance(D.monedaAnder(T.encaja - 1e-7), D.RANURA);
    const joins = [T.atrapa, T.lanza, T.recibe].map(t => distance(D.gigPantalla(t-1e-6),D.gigPantalla(t+1e-6)));
    const kittens = [D.p1,D.p2].map((f,i) => {const t=[T.suelta1,T.escapa2][i];return distance(f(t-1e-6),f(t+1e-6));});
    return {wrist, tag, hug, coinStart, coinEnd, joins:Math.max(...joins), kittens: Math.max(...kittens)};
  })()`);
  for (const [name, key] of [['Unión de las cuatro muñecas', 'wrist'], ['Etiqueta del premio en la mano de Ander', 'tag'], ['Abrazo de Guillermo', 'hug'], ['Salida de la moneda', 'coinStart'], ['Entrada de la moneda en la ranura', 'coinEnd'], ['Continuidad del premio en las tres entregas', 'joins'], ['Suelta del gatito y del pollito', 'kittens']]) {
    check(name, measurements[key] < 0.05, {errorMaxPx: measurements[key]});
  }
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 1.16, 3.95, 6.3, 8.85, 10.05, 10.42, 12.2, 12.66, 13.2, 13.55, 14.88, 15];
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
