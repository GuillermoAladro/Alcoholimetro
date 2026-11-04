const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00034.2';
  const r = await load('escenas/00034.2 Guillermo y Ander - el bigote.js', 'ander');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00034_2, T = D.T;
    let wrist = 0, ink = 0, cap = 0;
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const tip = (p) => {
      const m = p.manoLejos, d = Guillermo.rotP({x: 0, y: 30 * Guillermo.JK}, m.ang);
      return Guillermo.aPantalla(p, {x: m.x + d.x, y: m.y + d.y});
    };
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
      let point;
      if (t >= T.l0 && t <= T.l1) point = D.puntoEn(D.BIG_L, D.avanceL(t));
      if (t >= T.r0 && t <= T.r1) point = D.puntoEn(D.BIG_R, D.avanceR(t));
      if (point) ink = Math.max(ink, distance(tip(P.g), Ander.aPantalla(P.a, Ander.cabeza(P.a).a(point))));
    }
    for (const t of [T.muerde, T.tapa]) {
      const p = D.pose(t).g;
      cap = Math.max(cap, distance(tip(p), Guillermo.aPantalla(p, Guillermo.boca(p))));
    }
    const a = D.pose(T.acerca0 - 0.0001).g, b = D.pose(T.acerca0 + 0.0001).g;
    const foot = Math.max(...['lejos', 'cerca'].map(side => distance(Guillermo.aPantalla(a, a.piernas[side].tob), Guillermo.aPantalla(b, b.piernas[side].tob))));
    return {wrist, ink, cap, foot};
  })()`);
  for (const [name, key] of [['Unión de las cuatro muñecas', 'wrist'], ['Punta del rotulador sobre ambos trazos', 'ink'], ['Capuchón en los labios en ambas entregas', 'cap'], ['Apoyos continuos al caminar hacia el espejo', 'foot']]) {
    check(name, measurements[key] < 0.01, {errorMaxPx: measurements[key]});
  }
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 3.42, 4.55, 5.6, 6.68, 8.37, 9.78, 10.72, 11.65, 13.98, 14.1];
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
