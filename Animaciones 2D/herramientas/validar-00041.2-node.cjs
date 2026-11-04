const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, ROOT } = require('./canvas-node.cjs');

(async () => {
  const scene = '00041.2';
  const r = await load('escenas/00041.2 Guillermo y Carla - la pasarela.js', 'carla');
  const results = [];
  function check(name, passed, details) { results.push({ name, passed, details }); }
  const measurements = r.eval(`(() => {
    const D = __A2D_00041_2, T = D.T;
    let wrist = 0, contacto=0, suelo=0, anchura=1,penetracion=0;
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    for (let i = 0; i <= Math.round(D.DUR * 120); ++i) {
      const t = i / 120, P = D.pose(t);
      for (const [p, A] of [[P.g, Guillermo], [P.c, Carla]]) {
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
      if(t>=T.giro0 && t<=T.giro1) anchura=Math.min(anchura,D.perfilGiro(P.c).ancho);
      if(t>=T.cae1) {
        const z=D.perfilPie(Guillermo,P.g,P.g.piernas.cerca,D.ZAP);
        const b=D.perfilPie(Carla,P.c,P.c.piernas.lejos,D.BOTA);
        const hueco=D.separacion(z,b);
        suelo=Math.max(suelo,Math.abs(Math.max(...z.map(v=>v.y))-D.SUELO));
        penetracion=Math.max(penetracion,-hueco);
        if(t>=T.para) contacto=Math.max(contacto,Math.abs(hueco));
      }
    }
    const fuentes=D.FLASHES.every(([,x])=>D.PUBLICO.some(([px,tipo])=>px===x && tipo>0));
    const flash=D.FLASHES.at(-1)[0]+0.04;
    const g=D.gotas(), gotas=g.every(v=>Math.abs(v.x-D.CHARCO.x)<=D.CHARCO.rx && v.t>=T.pisa && v.vy<0 && Math.abs(v.vy*v.vida+380*v.vida*v.vida)<1e-7);
    const p=D.pose(T.clic), c=D.camara(T.clic), bota=D.perfilPie(Carla,p.c,p.c.piernas.lejos,D.BOTA);
    const encuadre=[Guillermo.aPantalla(p.g,p.g.piernas.lejos.tob),...bota,Carla.aPantalla(p.c,Carla.centroCabeza(p.c))].every(v=>Math.abs(v.x-c.x)*c.k<490 && Math.abs(v.y-c.y)*c.k<280);
    return {wrist,contacto,suelo,anchura,penetracion,fuentes,flash:Math.abs(flash-T.cae1),gotas,encuadre};
  })()`);
  for(const [key,label] of [['wrist','Las cuatro mangas alcanzan las muñecas'],['contacto','La zapatilla se detiene en el contorno de la bota'],['suelo','La suela se apoya en la pista durante el espagat'],['penetracion','Las dos siluetas de calzado no se atraviesan'],['flash','El flash alcanza su máxima luz al abrirse las piernas']]) check(label,measurements[key]<.01,{errorMax:measurements[key]});
  check('El giro conserva una silueta legible de perfil',measurements.anchura>=.419,{anchoRelativoMin:measurements.anchura});
  check('Todos los flashes parten de espectadores con cámara o móvil',measurements.fuentes);
  check('Las diez gotas salen del charco y vuelven a la pista',measurements.gotas);
  check('La pose y los dos personajes quedan en el encuadre de la foto',measurements.encuadre);
  const hash = t => { r.frame(t); return crypto.createHash('sha256').update(r.canvas.data()).digest('hex'); };
  const times = [0, 0.12, 1.75, 3.3, 3.87, 4.02, 4.17, 4.65, 5.6, 7.32, 8.85, 9.16, 9.32, 10.55, 12.4, 13.88, 14];
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
