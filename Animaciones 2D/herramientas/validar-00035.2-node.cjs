const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00035.2';
  const r = await load('escenas/00035.2 Guillermo y Ander - el billar.js', 'ander');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00035_2, T = D.T;
    let wrist = 0, cueLength = 0;
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
      for (const actor of [P.g,P.a]) cueLength = Math.max(cueLength, Math.abs(distance(actor._taco.a,actor._taco.b)-262));
    }
    const contact = Math.max(...[[T.golpeA,'a'],[T.golpeG,'g']].map(([t,key]) =>
      Math.abs(distance(D.pose(t)[key]._taco.b,D.blanca(t))-D.RB)));
    const b = D.blanca(T.choque), y = D.amarilla(T.choque);
    const collision = Math.abs(distance(b,y)-2*D.RB);
    const p = D.pose(T.coco).g;
    const crown = Guillermo.aPantalla(p,Guillermo.cabeza(p).a(D.COCO_RET));
    const impacts = Math.max(distance(D.blanca(T.coco),crown),distance(D.blanca(T.lampara),D.P_LAMP),distance(D.blanca(T.techo),D.P_TECHO));
    const sinks = D.amarilla(T.cae+.15) === null && D.blanca(T.bolsa+.15) === null;
    return {wrist, cueLength, contact, collision, impacts, sinks};
  })()`);
  for (const [name, key] of [['Unión de las cuatro muñecas', 'wrist'], ['Longitud rígida de los dos tacos', 'cueLength'], ['Contacto en el instante de cada tiro', 'contact'], ['Contacto entre blanca y amarilla', 'collision'], ['Choques con lámpara, techo y cabeza', 'impacts']]) {
    check(name, measurements[key] < 0.05, {errorMaxPx: measurements[key]});
  }
  check('Las dos bolas entran en sus troneras', measurements.sinks);
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 3.05, 3.8, 4.2, 8.46, 8.74, 8.98, 9.42, 10.18, 12.38, 14.18, 14.3];
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
