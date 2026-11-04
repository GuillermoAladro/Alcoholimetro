const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00037.2';
  const r = await load('escenas/00037.2 Guillermo y Ander - el abrazo de oso.js', 'ander');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00037_2, T = D.T;
    let wrist = 0, handContact = 0, footY = 0;
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
      if (t >= T.alza1 && t <= T.baja0) {
        for (const [side, target, offset] of [['cerca', D.ESPALDA_BAJA, {x:-6,y:10}], ['lejos', D.ESPALDA_ALTA, {x:14,y:0}]]) {
          const globalTarget = D.trG(P.g, Guillermo.tronco(P.g)(target));
          const anchor = Ander.aHoja(P.a, globalTarget), m = P.a.brazosAparte[side];
          handContact = Math.max(handContact, distance(m, {x:anchor.x+offset.x,y:anchor.y+offset.y}) * P.a.s * Ander.K);
        }
        for (const side of ['cerca','lejos']) footY = Math.max(footY,D.trG(P.g,P.g.piernas[side].tob).y);
      }
    }
    const before = D.anchoG(T.pop-0.00001), after = D.anchoG(T.pop+0.00001);
    const thumb = D.pose(11.60);
    const tx = D.trG(thumb.g,thumb.g.manoGrande).x, ax = thumb.a.x;
    return {wrist,handContact,footY,spring:Math.abs(before-after),width:before,thumbClearance:ax-tx};
  })()`);
  check('Extremos de las cuatro mangas', measurements.wrist<.01, {errorPx:measurements.wrist});
  check('Dos puntos de agarre siguen la espalda durante toda la mecida', measurements.handContact<.01, {errorPx:measurements.handContact});
  check('Ambos pies de Guillermo se despegan al alzarlo', measurements.footY<560, {maxY:measurements.footY, suelo:582});
  check('El rebote parte de la anchura comprimida', measurements.spring<.0001 && measurements.width<.7, {salto:measurements.spring, ancho:measurements.width});
  check('El pulgar queda separado del cuerpo de Ander',measurements.thumbClearance>55,{distanciaHorizontalAPelvisPx:measurements.thumbClearance});
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 2.42, 4.36, 4.7, 6.2, 8.05, 9.6, 9.81, 11.6, 12.38, 13.68, 13.8];
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
