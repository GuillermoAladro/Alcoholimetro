"use strict";
/* 00133.2 · Guillermo y Yorgi · Llegas tarde
 *
 * Negro → a la puerta de un bar de esquina, a mediodía: fachada de azulejo verde y estuco crema,
 * cristalera con toldo de rayas, puerta de madera con montante de cristal, un banco de parque, una
 * farola de forja y la acera de baldosas; a la izquierda, la calle con los tejados lejanos y mucho
 * cielo. Yorgi espera solo: se da toquecitos en el reloj con el índice, mira calle abajo y resopla,
 * dando golpecitos con el pie.
 * El tiempo vuela: el sol cruza el cielo y baja hacia los tejados, las nubes pasan a toda prisa, las
 * sombras giran alrededor de los pies y se alargan, la luz se vuelve de media tarde y la farola se
 * enciende. Mientras, Yorgi cambia de postura a cámara rápida: se sienta en el banco aburrido, mira
 * el reloj, se levanta y hace sentadillas, se pone en jarras… y vuelve a mirar el reloj.
 * Guillermo llega corriendo (su sombra larga le precede), frena derrapando y se dobla jadeando con
 * las manos en las rodillas, sudando → se yergue tan ancho y se da toquecitos en la muñeca («¡llego a
 * la hora!»)… pero en su muñeca no hay reloj → Yorgi le acerca su reloj; Guillermo se inclina a
 * mirarlo de muy cerca, casi con la nariz encima → ¡pi-pi-pi!: suena la alarma (ondas en zigzag, el
 * reloj vibra); Guillermo da un respingo, salta y cae sentado de culo (polvareda) → Yorgi la apaga y
 * se parte de risa sujetándose la barriga → da un paso, le tiende la mano y le levanta de un tirón;
 * Guillermo, aún resoplando, recibe unas palmadas amistosas en el hombro (la mano de Yorgi se queda
 * ahí, de colegas) → los dos miran a cámara (pulgar arriba de Guillermo, guiño de Yorgi) → negro.
 * (Las palmadas van al hombro y no a la espalda: de perfil y mirándose, el brazo de Yorgi no llega a
 * la espalda de Guillermo sin pasar por encima de su cabeza.)
 *
 * Sin textos ni números. Todo depende del tiempo absoluto. El cielo, el sol, las nubes, las sombras y
 * la luz se calculan cada fotograma a partir de una única curva suave (`lapso`), así el paso del tiempo
 * no da saltos; el decorado va cacheado en dos luces (mediodía y tarde) que se funden.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, Y = Yorgi, R = Recortes;
  const S = 0.30, SUELO = 552, DUR = 14.4, TAU = Math.PI * 2;
  const XG0 = 392, XY0 = 660, XY1 = 578;          // pelvis: Guillermo (mira a la derecha) y Yorgi (reflejado)
  const T = {
    // Yorgi espera (mediodía)
    golpes: [0.6, 0.78, 0.96], miraCalle0: 1.06, suspiro0: 1.3, suspiro1: 1.58,
    // el tiempo vuela
    tl0: 1.6, tl1: 4.72,
    sienta0: 1.66, sienta1: 1.9, consulta0: 2.18, consulta1: 2.46, levanta0: 2.6, levanta1: 2.8,
    sentadillas: [2.86, 3.1, 3.34], jarras0: 3.6, jarras1: 3.8, farola0: 4.2, farola1: 4.62,
    reloj2: 4.66, reloj2b: 4.88, golpes2: [4.98, 5.14, 6.18, 6.34],
    // llega Guillermo
    corre0: 4.5, frena1: 5.78,
    jadea0: 5.84, jadea1: 6.06, yergue0: 6.84, yergue1: 7.06,
    senala0: 7.08, senala1: 7.3, toques: [7.42, 7.58], miraMuneca: 7.7, sinReloj: 7.9,
    // el reloj de Yorgi
    ensena0: 8.0, ensena1: 8.3, acerca0: 8.36, acerca1: 8.8, pegado: 9.1,
    pita: 9.16, salta0: 9.18, cumbre: 9.38, cae: 9.62, calla0: 9.86, calla: 10.02,
    risa0: 9.5, risa1: 10.98,
    // ayuda
    paso0: 10.98, paso1: 11.3, agarra: 11.36, tira0: 11.44, tira1: 11.94, suelta: 12.0,
    dobla0: 12.0, dobla1: 12.22, palmadas: [12.38, 12.62, 12.86], endereza0: 13.0, endereza1: 13.26,
    guino: 13.6,
    fin: 13.96
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const TINTA = "#141218";
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const recorrido = (lista, t, f = suave) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], f(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  // vibración suave (suma de senos: continua a 60 fps)
  const vib = (t, a, s = 0) => a * (0.6 * Math.sin(t * 71 + s) + 0.4 * Math.sin(t * 113 + 1.7 + s));
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mezclaColor = (a, b, k) => { const x = hexRgb(a), y = hexRgb(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(",")})`; };
  let MATRIZ = null;

  /* ---------- el paso del tiempo: 0 = mediodía, 1 = media tarde ---------- */
  const lapso = t => suave(fase(t, T.tl0, T.tl1));
  const solEn = u => { const a = lerp(1.38, 2.74, u); return { x: 560 + 480 * Math.cos(a), y: 352 - 330 * Math.sin(a) }; };
  // sombra en el suelo: dirección (ángulo desde «hacia la cámara») y largo por unidad de altura
  const sombraDe = u => ({ phi: lerp(0.16, 1.12, u), k: 0.1 + 0.82 * Math.pow(u, 1.6), a: lerp(0.3, 0.27, u) });

  /* =====================================================================================
   * MANOS (objetivo en pantalla → mano en la hoja; el codo lo pone el IK)
   * ===================================================================================== */
  const CODO = new Map([[G, { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo }],
                        [Y, { l: (Y.A.datos.piezas.brazo || {}).codo ?? Y.BRAZO_L * 0.5, c: (Y.A.datos.piezas.brazo_cerca || {}).codo ?? Y.BRAZO_C_L * 0.5 }]]);
  const AGARRA = D(0.3, 0.3, 0.3, 0.3), PUNO = D(0.12, 0.08, 0.08, 0.08), ABIERTA = D(1, 1, 1, 1), RELAJ = D(0.5, 0.55, 0.5, 0.45);
  const INDICE = D5(0.15, 1, 0.06, 0.05, 0.05), PULGAR = D(1, 0.05, 0.05, 0.05), PALMADA = D(0.85, 0.95, 0.95, 0.92), BOTON = D5(0.2, 1, 0.1, 0.08, 0.08);
  const hombro = (Pj, p, lado) => Pj.aPantalla(p, Pj.tronco(p)(lado === "cerca" ? Pj.HOMBRO_C : Pj.HOMBRO));
  function manoEn(Pj, p, lado, scr, o = {}) {
    const cerca = lado === "cerca", Tr = Pj.tronco(p), h = Tr(cerca ? Pj.HOMBRO_C : Pj.HOMBRO);
    const L = cerca ? Pj.BRAZO_C_L : Pj.BRAZO_L, sj = CODO.get(Pj)[cerca ? "c" : "l"];
    const dobla = o.dobla ?? (cerca ? -1 : 1);
    let q = Pj.aHoja(p, scr);
    const d = Math.hypot(q.x - h.x, q.y - h.y), Lmax = L * 1.04;
    if (d > Lmax) q = { x: h.x + (q.x - h.x) * Lmax / d, y: h.y + (q.y - h.y) * Lmax / d };
    const c = R.ik(h, q, L, sj, 42, dobla, 1.08), dir = R.dir(c.a1);
    const e = { x: h.x + dir.x * sj * c.estira, y: h.y + dir.y * sj * c.estira };
    const mu = Math.atan2(e.y - q.y, e.x - q.x) + (o.dmu || 0);
    return { x: q.x, y: q.y, ang: 0, mu, dobla, puno: o.puno ?? 1, dedos: o.dedos || AGARRA };
  }
  function mezclaMano(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: 0, mu: a.mu + difAng(a.mu, b.mu) * k, dobla: k < 0.5 ? a.dobla : b.dobla,
      puno: lerp(a.puno ?? 1, b.puno ?? 1, k), dedos: DD(a.dedos || AGARRA, b.dedos || AGARRA, k) };
  }
  // pista de una mano: [t0, t1, f(p) → mano, curva]
  function pista(lista, t, p) {
    let base=lista.length-1;
    while(base>0 && t<lista[base][1])base--;
    let c=lista[base][2](p);
    for (let i=base+1;i<lista.length;i++){const [t0,t1,f,e]=lista[i];if(t<=t0)break;c=mezclaMano(c,f(p),(e||suave)(fase(t,t0,t1)));}
    return c;
  }
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { cerca: punoDesde(P(131, 652), -1.75), lejos: punoDesde(P(372, 648), -1.75) };
  function bolsillo(Pj, p, lado) {
    if (Pj === G) { const b = G.tronco(p)(BOLS_G[lado]); return { x: b.x, y: b.y, ang: 0, mu: -1.75, puno: 0, dobla: lado === "cerca" ? -1 : 1, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
    const m = Pj.manoReposo(p, lado); return Object.assign({ dedos: D(0.4, 0.4, 0.4, 0.4) }, m, { puno: 0 });
  }
  // muñeca (pantalla) y dirección del antebrazo (pantalla, de la muñeca hacia el codo)
  function muneca(Pj, p, m) {
    const o = rota({ x: Math.cos(m.mu) * R_M, y: Math.sin(m.mu) * R_M }, m.ang || 0);
    const w = Pj.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }), c = Pj.aPantalla(p, { x: m.x, y: m.y });
    const a = m.mu + (m.ang || 0);
    return { w, c, d: { x: Math.cos(a) * (p.espejo ? -1 : 1), y: Math.sin(a) } };
  }
  // La correa impresa en el atlas de Yorgi ocupa las filas 635–653 del brazo lejano.
  function relojEn(p,m){
    const M=muneca(Y,p,m),pieza=Y.A.datos.piezas.brazo,raiz=Y.tronco(p)(Y.HOMBRO);
    const c=R.ikContinuo(raiz,Y.aHoja(p,M.w),Y.BRAZO_L,pieza.codo,42,m.dobla??1,1.08);
    c.caminoCorto=true;
    const n=c.muestras||32,pts=R.muestras(c,n),u=(644-pieza.raiz[1])/c.L*n,i=Math.floor(u);
    const a=Y.aPantalla(p,pts[i]),b=Y.aPantalla(p,pts[i+1]),l=Math.hypot(b.x-a.x,b.y-a.y);
    return {w:M.w,correa:P(lerp(a.x,b.x,u-i),lerp(a.y,b.y,u-i)),d:P((a.x-b.x)/l,(a.y-b.y)/l)};
  }
  function esferaDe(M) {
    return {x:M.correa.x+M.d.y*2.2,y:M.correa.y-M.d.x*2.2,a:Math.atan2(M.d.y,M.d.x)};
  }
  // Coordenadas de contacto en la mano articulada y en las piezas del avatar.
  function puntoMano(Q,p,m,q) {
    const v=rota(q,m.mu+Math.PI/2), k=Q.JK*(m.puno??1);
    return Q.aPantalla(p,P(m.x+k*v.x,m.y+k*v.y));
  }
  function dedo(d,medio=false) {
    const ab=(d.indice+d.medio+d.anular+d.menique)/4, a=(medio?.05:.17)*(.4+.9*ab);
    const l=3.2+((medio?16:14.5)-3.2)*Math.pow(medio?d.medio:d.indice,.85);
    return P((medio?2.3:6.9)+Math.sin(a)*l,4.5+Math.cos(a)*l);
  }
  function porMarca(Q,p,lado,destino,o,marca,mu) {
    const m=manoEn(Q,p,lado,destino,o);
    if(mu!==undefined)m.mu=mu;
    const d=Q.aHoja(p,destino), q=Q.aHoja(p,puntoMano(Q,p,m,marca));
    m.x+=d.x-q.x; m.y+=d.y-q.y;
    return m;
  }
  const corona=e=>P(e.x+Math.cos(e.a)*9.6,e.y+Math.sin(e.a)*9.6);
  const minutos=t=>270*lapso(t)+t/60;
  const ASIENTO_G=P(253,766), ASIENTO_Y=P(262,736), HOMBRO_CAMISA=P(346,325);
  const costura=(Q,p,q)=>Q.aPantalla(p,Q.tronco(p)(q));
  function apoyarCadera(Q,p,q,y,k){
    p.pelvis.y+=(y-costura(Q,p,q).y)*k/(p.s*Q.K);
  }
  const suelas=[
    [[-62.03,73.8],[-42.91,78.6],[55.06,93],[119.57,93],[131.52,90.6],[141.08,88.2],[148.25,85.8],[155.42,78.6]],
    [[-59.06,58.25],[-47.19,63.01],[-35.31,65.39],[66.81,82.05],[114.31,82.05],[130.94,79.67],[142.81,77.29],[149.94,74.91],[154.69,72.53],[157.06,70.15]]
  ];
  function suela(Q,p,lado){
    const z=p.piernas[lado];
    return suelas[Q===G?0:1].map(([x,y])=>{const v=rota(P(x,y),z.ang);return Q.aPantalla(p,P(z.tob.x+v.x,z.tob.y+v.y));}).reduce((a,b)=>a.y>b.y?a:b);
  }
  function planta(Q,p,lado,y){
    p.piernas[lado].tob.y+=(y-suela(Q,p,lado).y)/(p.s*Q.K);
  }
  function rodilla(Q,p,lado) {
    const raiz=Q.tronco(p)(Q.CADERA[lado]), l=Q.A.datos.piezas["pierna_"+lado].largo;
    const c=R.ik(raiz,p.piernas[lado].tob,l,l/2,80,1,1.03);
    return Q.aPantalla(p,R.muestras(c,32)[16]);
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  // cuerpo: pelvis (hoja), torso, cabeza y pies (desplazamientos en la hoja respecto a su sitio)
  const B0 = { pel: 0, px: 0, torso: 0.02, cab: 0.03, pcx: 0, pcy: 0, pca: 0, plx: 0, ply: 0, pla: 0 };
  const B = o => Object.assign({}, B0, o);
  const PIE = { cerca: -30, lejos: 33 };                    // pies respecto a la pelvis (pantalla, hacia delante +)

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CG = {
    corre: E({ mx: 0.92, my: -0.05, c: 0.35, z: 0.5, sd: 8, gd: 0.15, si: 8, gi: 0.15, abre: 12, ancho: 0.8, sonr: -0.3 }),
    frena: E({ mx: 0.9, my: 0.1, iris: 0.9, sd: 18, si: 18, abre: 14, ancho: 0.75, sonr: -0.2 }),
    jadea: E({ mx: 0.7, my: -0.2, c: 0.5, z: 0.3, sd: 4, si: 4, abre: 15, ancho: 0.85, sonr: -0.15, lengua: 0.55 }),
    ancho: E({ mx: 0.9, my: 0.05, c: 0.1, sd: 12, si: 14, abre: 2, ancho: 0.95, sonr: 0.65 }),
    senala: E({ mx: 0.92, my: 0.0, c: 0.2, sd: 18, gd: 0.1, si: 10, sonr: 0.8, ancho: 1.0 }),
    muneca: E({ mx: 0.45, my: 0.9, sd: 6, si: 6, abre: 2, ancho: 0.6, sonr: 0.2 }),
    sinReloj: E({ mx: 0.5, my: 0.85, iris: 0.82, sd: 24, si: 24, abre: 9, ancho: 0.55, sonr: -0.25 }),
    curioso: E({ mx: 0.95, my: 0.2, iris: 1.1, sd: 16, si: 14, abre: 3, ancho: 0.6, sonr: 0.05 }),
    pegado: E({ mx: 0.98, my: 0.25, iris: 1.2, c: 0.32, sd: -2, si: 10, gi: 0.08, abre: 2, ancho: 0.5, sonr: 0 }),
    susto: E({ mx: 0.6, my: -0.2, iris: 0.72, sd: 30, si: 30, abre: 22, ancho: 0.7, sonr: -0.3 }),
    golpe: E({ c: 1, z: 1, sd: -6, si: -6, abre: 10, ancho: 0.7, sonr: -0.4 }),
    aturdido: E({ mx: 0.8, my: -0.55, c: 0.25, sd: 14, si: 6, gi: -0.1, abre: 6, ancho: 0.6, sonr: -0.2 }),
    morros: E({ mx: 0.9, my: -0.55, c: 0.2, sd: -6, gd: -0.12, si: 4, gi: 0.1, abre: 0, ancho: 0.55, sonr: -0.35, mof: 0.4 }),
    agarra: E({ mx: 0.9, my: -0.6, sd: 12, si: 12, sonr: 0.35 }),
    tirado: E({ mx: 0.9, my: -0.2, sd: 22, si: 22, abre: 10, ancho: 0.8, sonr: 0.2 }),
    doblado: E({ mx: 0.6, my: 0.5, c: 0.45, sd: 6, si: 6, abre: 10, ancho: 0.8, sonr: 0.3 }),
    risita: E({ mx: 0.85, my: 0.1, c: 0.55, h: 0.8, sd: 14, si: 14, abre: 7, ancho: 0.95, sonr: 0.85, rub: 0.35 }),
    final: E({ mx: -0.45, my: -0.05, sd: 12, si: 16, gi: 0.06, sonr: 0.85, ancho: 1.0, rub: 0.2 })
  };
  const GUION_CG = [
    [T.frena1 - 0.25, T.frena1 - 0.1, "frena"], [T.jadea0, T.jadea1, "jadea"], [T.yergue0, T.yergue1, "ancho"],
    [T.senala1, T.senala1 + 0.15, "senala"], [T.miraMuneca, T.miraMuneca + 0.15, "muneca"], [T.sinReloj, T.sinReloj + 0.1, "sinReloj", salida],
    [T.ensena0 + 0.1, T.ensena1, "curioso"], [T.acerca1, T.pegado, "pegado"], [T.pita, T.pita + 0.05, "susto", salida],
    [T.cae - 0.02, T.cae + 0.03, "golpe"], [T.cae + 0.14, T.cae + 0.35, "aturdido"], [10.25, 10.5, "morros"],
    [T.paso1 - 0.15, T.agarra, "agarra"], [T.tira0, T.tira0 + 0.12, "tirado"], [T.dobla0, T.dobla1, "doblado"],
    [T.palmadas[0], T.palmadas[0] + 0.12, "risita"], [T.endereza0 + 0.05, T.endereza1 + 0.1, "final"]
  ];
  const PARP_G = [6.5, 8.05, 10.7, 12.1, 13.5];
  const CUER_G = {
    corre: B({ pel: 24, torso: 0.3, cab: 0.02 }),
    frena: B({ pel: 46, torso: -0.14, cab: -0.06, pcx: 70, plx: 56, pca: -0.25, pla: -0.2 }),
    jadea: B({ pel: 270, px: -120, torso: 1.12, cab: -.58 }),
    pie: B({}),
    senala: B({ torso: 0.03, cab: 0.04 }),
    muneca: B({ torso: 0.06, cab: 0.22, pel: 4 }),
    curioso: B({ torso: 0.14, cab: 0.06, pel: 6 }),
    pegado: B({ torso: 0.34, cab: 0.12, pel: 18 }),
    salto: B({ pel: -6, torso: -0.2, cab: -0.22, pcx: 40, pcy: -70, pca: -0.3, plx: -10, ply: -46, pla: -0.2 }),
    sentado: B({ pel: 480, torso: -0.14, cab: 0.04, pcx: 330, pca: -0.25, plx: 300, ply: -6, pla: -0.2 }),
    alcanza: B({ pel: 470, torso: 0.06, cab: -0.12, pcx: 320, pca: -0.25, plx: 290, ply: -6, pla: -0.2 }),
    levanta: B({ pel: 200, torso: 0.34, cab: -0.06, pcx: 120, plx: 110 }),
    tirado: B({ pel: 10, torso: 0.1, cab: -0.04 }),
    risita: B({ pel: 4, torso: 0.07, cab: -0.02 }),
    final: B({ torso: -0.04, cab: -0.07, pel: -3 })
  };
  const GUION_G = [
    [T.frena1 - 0.3, T.frena1, "frena"], [T.jadea0, T.jadea1, "jadea", salida], [T.yergue0, T.yergue1, "pie"],
    [T.senala0, T.senala1, "senala"], [T.miraMuneca, T.miraMuneca + 0.15, "muneca"],
    [T.ensena0 + 0.1, T.acerca0, "curioso"], [T.acerca0, T.pegado, "pegado"],
    [T.salta0, T.cumbre, "salto", salida], [T.cumbre + 0.02, T.cae, "sentado", entrada],
    [T.paso1 - 0.2, T.agarra, "alcanza"], [T.tira0, T.tira0 + 0.26, "levanta"], [T.tira0 + 0.26, T.tira1, "tirado", salida],
    [T.dobla0, T.dobla1, "risita"], [T.endereza0, T.endereza1, "final"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;

  // ---- la carrera ----
  const X_INI = -330, PER = 0.32, U_FRENA = 0.8;
  function xCorre(t) {
    const u = fase(t, T.corre0, T.frena1), k = 1 / (U_FRENA + (1 - U_FRENA) / 2);
    const f = u < U_FRENA ? k * u : k * (U_FRENA + (u - U_FRENA) - (u - U_FRENA) * (u - U_FRENA) / (2 * (1 - U_FRENA)));
    return lerp(X_INI, XG0, f);
  }
  const T_FRENA = lerp(T.corre0, T.frena1, U_FRENA);
  const APOYOS_G = (() => {
    const L = { cerca: [[T.corre0 - 1, X_INI + PIE.cerca, 0.0]], lejos: [[T.corre0 - 1, X_INI + PIE.lejos, 0.0]] };
    let lado = "lejos";
    for (let k = 0; ; k++) {
      const tc = T.corre0 + 0.05 + k * PER / 2;
      if (tc > T_FRENA - 0.02) break;
      L[lado].push([tc, xCorre(tc) + 22, 0.08]);
      lado = lado === "cerca" ? "lejos" : "cerca";
    }
    // frena: los dos pies plantados (el de delante patina hasta su sitio)
    L[lado].push([T.frena1 - 0.12, XG0 + PIE[lado], 0]);
    const otro = lado === "cerca" ? "lejos" : "cerca";
    L[otro].push([T.frena1 - 0.02, XG0 + PIE[otro], 0]);
    return L;
  })();
  // apoyos: [[t, x, dur]]: el pie está quieto en x desde t hasta t + dur y luego vuela al siguiente
  function pieDe(apoyos, t, alto) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf, dur] = apoyos[i];
    if (i === apoyos.length - 1 || t <= tf + dur) return { x: xf, h: 0, a: i > 0 && dur > 0 ? lerp(-0.12, 0.3, clamp((t - tf) / dur)) : 0 };
    const [tn, xn] = apoyos[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const x = lerp(xf, xn, suave(clamp((u - 0.05) / 0.95)));
    const h = alto * Math.sin(Math.PI * Math.pow(u, 0.72));
    const a = u < 0.3 ? lerp(0.3, 0.9, suave(u / 0.3)) : u < 0.75 ? lerp(0.9, 0.1, suave((u - 0.3) / 0.45)) : lerp(0.1, -0.12, suave((u - 0.75) / 0.25));
    return { x, h, a };
  }
  const corriendo = t => t < T.frena1 - 0.1;
  // x de la pelvis de Guillermo
  const XG_LISTA = [[T.frena1, XG0], [T.acerca0, XG0], [T.pegado, XG0 + 65], [T.salta0, XG0 + 65], [T.cae, XG0 - 6],
    [T.tira0, XG0 - 6], [T.tira1, XG0 + 30], [DUR, XG0 + 30]];
  const xG = t => t < T.frena1 ? xCorre(t) : recorrido(XG_LISTA, t);
  const PASO_G = { lejos: [[T.acerca0 + 0.08, XG0 + PIE.lejos], [T.acerca0 + 0.34, XG0 + 65 + PIE.lejos]],
    cerca: [[T.acerca0 + 0.3, XG0 + PIE.cerca], [T.acerca0 + 0.58, XG0 + 65 + PIE.cerca]] };
  // salto del susto: altura del suelo
  const vueloG = t => t < T.salta0 || t > T.cae ? 0 : t < T.cumbre ? 62 * salida(fase(t, T.salta0, T.cumbre)) : 62 * (1 - entrada(fase(t, T.cumbre, T.cae)));
  // bote al caer de culo
  const boteG = t => { if (t < T.cae) return 0; const u = t - T.cae; return 13 * Math.abs(Math.sin(u * 16)) * Math.exp(-u * 9); };

  function poseG(t) {
    const b = guion(GUION_G, CUER_G, "corre", t);
    const x = xG(t), corre = corriendo(t);
    const respira = Math.sin(t * 2.1 + 0.4);
    // jadeo: el cuerpo sube y baja deprisa
    const jad = dentro(t, T.jadea0, T.jadea1, T.yergue0 - 0.1, T.yergue0 + 0.1) + 0.3 * dentro(t, T.dobla0, T.dobla1, T.palmadas[0], T.palmadas[0] + 0.2);
    // cada palmada le hunde un poco el hombro
    const pal = T.palmadas.reduce((a, t0) => Math.max(a, campana(t, t0 - 0.02, t0 + 0.14)), 0);
    const ph = (t - T.corre0 - 0.05) / (PER / 2);
    const bote = corre ? 9 * Math.abs(Math.sin(Math.PI * ph)) * tramo(t, T.corre0, T.corre0 + 0.1) * (1 - tramo(t, T_FRENA - 0.05, T_FRENA + 0.1)) : 0;
    const p = { x, suelo: SUELO - vueloG(t) - boteG(t), s: S, tirasLimpias: true, ikContinuo: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.px, y: G.PELVIS.y + b.pel + respira * 1.2 - bote / S + 10 * Math.sin(t * 15) * jad + 14 * pal },
      torso: b.torso + 0.03 * Math.sin(t * 15 + 0.6) * jad + 0.035 * pal, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.012 * Math.sin(t * 15) * jad },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    apoyarCadera(G,p,ASIENTO_G,SUELO-boteG(t),dentro(t,T.cumbre+.02,T.cae,T.tira0,T.tira0+.26));
    // el susto le sacude la cabeza
    p.cabeza.ang += vib(t, 0.02 * campana(t, T.pita, T.cumbre + 0.1), 0.4);
    // pies (pantalla) → hoja
    let wC, wL;
    if (t < T.frena1) { wC = pieDe(APOYOS_G.cerca, t, 42); wL = pieDe(APOYOS_G.lejos, t, 42); }
    else if (t < T.salta0) {
      // al acercarse al reloj arrastra los pies, primero el de delante
      wL = { x: recorrido(PASO_G.lejos, t), h: 9 * campana(t, PASO_G.lejos[0][0], PASO_G.lejos[1][0]), a: 0 };
      wC = { x: recorrido(PASO_G.cerca, t), h: 7 * campana(t, PASO_G.cerca[0][0], PASO_G.cerca[1][0]), a: 0 };
    } else { wC = { x: x + PIE.cerca, h: 0, a: 0 }; wL = { x: x + PIE.lejos, h: 0, a: 0 }; }
    const hojaX = wx => G.PELVIS.x + (wx - x) / S;
    p.piernas.cerca = { tob: { x: hojaX(wC.x) + b.pcx, y: TOB_G - wC.h / S + b.pcy }, ang: wC.a + b.pca };
    p.piernas.lejos = { tob: { x: hojaX(wL.x) + b.plx, y: TOB_G - 10 - wL.h / S + b.ply }, ang: wL.a + b.pla };
    planta(G,p,"cerca",p.suelo-wC.h+Math.min(0,b.pcy)*S);
    planta(G,p,"lejos",p.suelo-5-wL.h+Math.min(0,b.ply)*S);
    // cara
    const e = guion(GUION_CG, CG, "corre", t);
    if (corre) e.abre += 6 * Math.abs(Math.sin(t * 13));
    e.abre += 5 * Math.sin(t * 15) * jad;
    const cerrado = e.c > 0.8 || e.z > 0.6;
    p.cara = cara(e, cerrado ? 0 : parpadeo(t, PARP_G));
    p.sudor = 0.9 * dentro(t, T.corre0 + 0.4, T.frena1, T.yergue1, T.yergue1 + 0.5) + 0.8 * campana(t, T.pita, T.cae + 0.6) + 0.5 * dentro(t, T.tira1, T.dobla1, T.endereza0, T.endereza1);
    p.rojo = 0.45 * dentro(t, T.corre0 + 0.4, T.frena1, T.yergue0, T.yergue1 + 0.3) + 0.5 * dentro(t, T.sinReloj, T.sinReloj + 0.15, T.ensena0 + 0.1, T.ensena1)
      + 0.3 * dentro(t, T.cae + 0.5, 10.6, T.tira0, T.tira1);
    manosG(t, p);
    return p;
  }
  function manosG(t, p) {
    const Tr = G.tronco(p);
    const bc = q => bolsillo(G, q, "cerca"), bl = q => bolsillo(G, q, "lejos");
    // carrera: bracea con los puños (contrario a las piernas)
    const fase0 = (t - T.corre0 - 0.05) / PER * TAU;
    const bracea = lado => q => {
      const h = hombro(G, q, lado), sw = Math.sin(fase0 + (lado === "cerca" ? 0 : Math.PI));
      return manoEn(G, q, lado, P(h.x + 10 + 46 * sw, h.y + 50 - 24 * sw), { dedos: PUNO, dobla: lado === "cerca" ? -1 : 1 });
    };
    // frenazo: brazos adelante para no caerse
    const equilibrio = lado => q => { const h = hombro(G, q, lado); return manoEn(G, q, lado, P(h.x + (lado === "cerca" ? 54 : 70), h.y + 14), { dedos: ABIERTA, dobla: lado === "cerca" ? -1 : 1 }); };
    // manos en las rodillas
    const rodillaM = lado => q => {const r=rodilla(G,q,lado),d=D(.6,.85,.85,.8);
      return porMarca(G,q,lado,P(r.x,r.y-5),{dedos:d,dobla:lado==="cerca"?-1:1},dedo(d,true),-1.75);};
    // «¡llego a la hora!»: antebrazo lejano delante de la barriga y toquecitos con el índice cercano
    const relojB = q => manoEn(G, q, "lejos", G.aPantalla(q, Tr(P(330, 575))), { dedos: PUNO, dobla: 1 });
    const munecaG = () => { const m = relojB(p); return muneca(G, p, m); };
    const toque = q => {
      const M = munecaG(), tq = T.toques.reduce((a, t0) => Math.max(a, campana(t, t0 - 0.08, t0 + 0.08)), 0);
      return porMarca(G,q,"cerca",P(M.w.x,M.w.y-12*(1-tq)),{dedos:INDICE,dobla:-1},dedo(INDICE),-1.95);
    };
    const huh = q => { const h = hombro(G, q, "cerca"); return manoEn(G, q, "cerca", P(h.x + 40, h.y + 62), { dedos: D(0.9, 1, 1, 1), dobla: -1 }); };
    // el respingo: manos arriba (hacia delante, sin tapar la cara)
    const arriba = lado => q => { const h = hombro(G, q, lado); return lado === "cerca" ? manoEn(G, q, lado, P(h.x + 58, h.y + 22), { dedos: ABIERTA, dobla: -1 })
      : manoEn(G, q, lado, P(h.x + 76, h.y - 40), { dedos: ABIERTA, dobla: 1 }); };
    // sentado: la cercana cuelga al lado de la cadera, la lejana en la rodilla
    const lado_ = q => { const h = hombro(G, q, "cerca"); return manoEn(G, q, "cerca", P(h.x + 26, h.y + 84), { dedos: RELAJ, dobla: -1 }); };
    const rodillaL = q => { const r = rodilla(G, q, "lejos"); return manoEn(G, q, "lejos", P(r.x - 4, r.y - 10), { dedos: D(0.6, 0.85, 0.85, 0.8), dobla: 1 }); };
    // se agarra a la mano de Yorgi
    const agarre = q => porMarca(G,q,"lejos",agarreEn(t),{dedos:AGARRA,dobla:1},PALMA,2.85);
    const pulgar = q => { const h = hombro(G, q, "cerca"); return manoEn(G, q, "cerca", P(h.x + 64, h.y + 34), { dedos: PULGAR, dobla: -1 }); };
    p.manoCerca = pista([
      [0, 0, bracea("cerca")], [T.frena1 - 0.3, T.frena1 - 0.05, equilibrio("cerca"), salida], [T.jadea0, T.jadea1, rodillaM("cerca")],
      [T.yergue0-.05, T.yergue1-.075, bc], [T.senala0, T.senala1, toque], [T.sinReloj - 0.02, T.sinReloj + 0.16, huh, salida], [T.acerca0, T.acerca0 + 0.3, bc],
      [T.salta0, T.cumbre - 0.05, arriba("cerca"), salida], [T.cumbre + 0.05, T.cae + 0.04, lado_],
      [T.tira0 + 0.1, T.tira1, bc], [T.endereza0, T.endereza1 + 0.05, pulgar]
    ], t, p);
    p.manoLejos = pista([
      [0, 0, bracea("lejos")], [T.frena1 - 0.3, T.frena1 - 0.05, equilibrio("lejos"), salida], [T.jadea0, T.jadea1, rodillaM("lejos")],
      [T.yergue0-.05, T.yergue1-.075, bl], [T.senala0, T.senala1, relojB], [T.acerca0, T.acerca0 + 0.3, bl],
      [T.salta0, T.cumbre - 0.05, arriba("lejos"), salida], [T.cumbre + 0.05, T.cae + 0.04, rodillaL],
      [T.paso1 - 0.2, T.agarra, agarre], [T.suelta, T.dobla1, bl]
    ], t, p);
  }

  /* =====================================================================================
   * YORGI (derecha, reflejado: mira a la izquierda)
   * ===================================================================================== */
  const CY = {
    reloj: E({ mx: 0.5, my: 0.85, c: 0.35, sd: -4, gd: -0.1, si: -4, gi: -0.1, sonr: -0.15, ancho: 0.8 }),
    calle: E({ mx: 0.96, my: 0.0, c: 0.2, sd: 4, si: 4, sonr: -0.1, ancho: 0.75 }),
    suspiro: E({ mx: 0.6, my: -0.35, c: 0.55, sd: 10, gd: 0.15, si: 10, gi: 0.15, abre: 5, ancho: 0.5, sonr: -0.2, mof: 0.55 }),
    aburrido: E({ mx: 0.75, my: 0.35, c: 0.62, sd: 2, si: 2, sonr: -0.25, ancho: 0.7 }),
    esfuerzo: E({ mx: 0.9, my: 0, c: 0.25, z: 0.3, sd: 6, si: 6, abre: 3, ancho: 0.9, sonr: 0.3, mof: 0.25 }),
    impaciente: E({ mx: 0.96, my: 0, c: 0.3, sd: -8, gd: -0.18, si: -8, gi: -0.18, sonr: -0.3, ancho: 0.7 }),
    ceja: E({ mx: 0.92, my: 0.15, c: 0.42, sd: 20, gd: 0.1, si: -6, gi: -0.1, sonr: -0.05, ancho: 0.7 }),
    ensena: E({ mx: 0.92, my: 0.12, c: 0.3, sd: 14, si: 8, sonr: 0.5, ancho: 0.9 }),
    sorpresa: E({ mx: 0.75, my: 0.25, sd: 22, si: 22, abre: 10, ancho: 0.7, sonr: 0.1 }),
    risa: E({ mx: 0.6, my: -0.3, c: 1, h: 1, sd: 16, si: 16, abre: 20, ancho: 1.05, sonr: 1, rub: 0.35 }),
    ayuda: E({ mx: 0.9, my: 0.55, c: 0.25, h: 0.4, sd: 12, si: 12, abre: 4, ancho: 0.95, sonr: 0.8 }),
    tira: E({ mx: 0.9, my: 0.35, c: 0.2, z: 0.3, sd: 4, si: 4, abre: 3, ancho: 0.9, sonr: 0.6, mof: 0.3 }),
    palmada: E({ mx: 0.85, my: 0.45, c: 0.5, h: 0.7, sd: 12, si: 12, abre: 8, ancho: 1.0, sonr: 0.9 }),
    final: E({ mx: -0.45, my: 0, c: 0.25, sd: 12, si: 14, sonr: 0.9, ancho: 1.0 })
  };
  const GUION_CY = [
    [T.miraCalle0, T.miraCalle0 + 0.15, "calle"], [T.suspiro0, T.suspiro0 + 0.12, "suspiro"], [T.suspiro1 - 0.05, T.suspiro1 + 0.1, "calle"],
    [T.sienta1 - 0.1, T.sienta1 + 0.05, "aburrido"], [T.consulta0, T.consulta0 + 0.08, "reloj"], [T.consulta1, T.consulta1 + 0.08, "aburrido"],
    [T.levanta1, T.levanta1 + 0.08, "esfuerzo"], [T.jarras0, T.jarras1, "impaciente"], [T.reloj2, T.reloj2b, "reloj"],
    [5.3, 5.45, "ceja"], [T.golpes2[2] - 0.1, T.golpes2[2], "reloj"], [6.5, 6.6, "ceja"],
    [T.ensena0, T.ensena1, "ensena"], [T.pita, T.pita + 0.06, "sorpresa", salida], [T.risa0, T.risa0 + 0.12, "risa"],
    [T.paso0 + 0.05, T.paso1, "ayuda"], [T.tira0, T.tira0 + 0.12, "tira"], [T.suelta, T.suelta + 0.15, "palmada"],
    [T.endereza0 + 0.1, T.endereza1 + 0.15, "final"]
  ];
  const PARP_Y = [0.4, 2.0, 3.0, 4.0, 5.9, 7.2, 8.6, 11.2, 12.2, 13.3];
  const CUER_Y = {
    reloj: B({ torso: 0.04, cab: 0.16 }),
    calle: B({ torso: 0.0, cab: -0.02 }),
    suspiro: B({ torso: -0.03, cab: -0.1, pel: 8 }),
    sentado: B({ pel: 280, torso: -0.06, cab: 0.08, pcx: 270, plx: 230 }),
    sentadoReloj: B({ pel: 284, torso: 0.1, cab: 0.2, pcx: 270, plx: 230 }),
    sentadilla: B({ pel: 200, torso: 0.4, cab: -0.24, pcx: -10, plx: 10 }),
    pie: B({}),
    jarras: B({ torso: -0.04, cab: -0.04, pel: -2 }),
    ceja: B({ torso: 0.0, cab: 0.04 }),
    ensena: B({ torso: 0.06, cab: 0.04 }),
    sorpresa: B({ torso: -0.08, cab: -0.1, pel: -6 }),
    risaAtras: B({ torso: -0.12, cab: -0.22, pel: 4 }),
    risaDoblado: B({ torso: 0.24, cab: 0.12, pel: 34 }),
    ayuda: B({ torso: 0.36, cab: 0.18, pel: 64 }),
    tira: B({ torso: -0.08, cab: 0.04, pel: 40 }),
    palmada: B({ torso: 0.06, cab: 0.1, pel: 8 }),
    final: B({ torso: -0.04, cab: -0.06, pel: -3 })
  };
  const GUION_Y = [
    [T.miraCalle0, T.miraCalle0 + 0.2, "calle"], [T.suspiro0, T.suspiro0 + 0.14, "suspiro"], [T.suspiro0 + 0.16, T.suspiro1, "calle"],
    [T.sienta0, T.sienta1, "sentado"], [T.consulta0, T.consulta0 + 0.1, "sentadoReloj"], [T.consulta1, T.consulta1 + 0.1, "sentado"],
    [T.levanta0, T.levanta1, "pie"],
    ...T.sentadillas.flatMap(s0 => [[s0, s0 + 0.1, "sentadilla"], [s0 + 0.12, s0 + 0.22, "pie"]]),
    [T.jarras0, T.jarras1, "jarras"], [T.reloj2, T.reloj2b, "reloj"], [5.3, 5.5, "ceja"],
    [T.ensena0, T.ensena1, "ensena"], [T.pita, T.pita + 0.08, "sorpresa", salida], [T.risa0, T.risa0 + 0.2, "risaAtras"],
    [10.18, 10.42, "risaDoblado"], [10.7, T.paso0, "pie"], [T.paso0, T.paso1, "ayuda"], [T.tira0, T.tira0 + 0.22, "tira"],
    [T.tira1, T.suelta + 0.1, "pie"], [T.suelta, T.dobla1 + 0.1, "palmada"], [T.endereza0, T.endereza1, "final"]
  ];
  const TOB_Y = Y.SUELO - Y.TOBILLO_ALTO;
  const XY_LISTA = [[T.paso0, XY0], [T.paso1, XY1], [DUR, XY1]];
  const xY = t => recorrido(XY_LISTA, t);
  // el paso adelante: primero el pie de delante (lejano), luego el de atrás
  const PIE_Y = {
    lejos: [[T.paso0, XY0 - PIE.lejos], [T.paso0 + 0.2, XY1 - PIE.lejos]],
    cerca: [[T.paso0 + 0.12, XY0 - PIE.cerca], [T.paso1, XY1 - PIE.cerca]]
  };
  const alzaPie = (lista, t) => 12 * campana(t, lista[0][0], lista[1][0]);
  // golpecitos con la punta del pie (impaciencia)
  const tapPie = t => { const k = dentro(t, 0.3, 0.45, T.suspiro1 - 0.1, T.suspiro1) + dentro(t, T.jarras1, T.jarras1 + 0.1, T.reloj2b, T.reloj2b + 0.1)
    + dentro(t, 5.4, 5.5, 6.0, 6.1); return k * (0.5 - 0.5 * Math.cos(t * TAU * 3.4)); };

  function poseY(t) {
    const b = guion(GUION_Y, CUER_Y, "reloj", t);
    const x = xY(t), respira = Math.sin(t * 1.9 + 1.4);
    // risa: los hombros botan
    const ri = dentro(t, T.risa0 + 0.05, T.risa0 + 0.2, 10.75, T.paso0 + 0.1) + 0.45 * dentro(t, T.palmadas[0] - 0.1, T.palmadas[0], T.endereza0, T.endereza1);
    const p = { x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: Y.PELVIS.x + b.px, y: Y.PELVIS.y + b.pel + respira * 1.1 + 9 * Math.abs(Math.sin(t * 15)) * ri },
      torso: b.torso + 0.03 * Math.sin(t * 15) * ri, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * Math.sin(t * 15 + 0.8) * ri, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // el suspiro: los hombros suben y caen
    p.pelvis.y -= 10 * campana(t, T.suspiro0 - 0.05, T.suspiro0 + 0.25);
    apoyarCadera(Y,p,ASIENTO_Y,BANCO.asiento-4,dentro(t,T.sienta0,T.sienta1,T.levanta0,T.levanta1));
    // pies (pantalla) → hoja (en la hoja, delante es +x)
    const hojaX = wx => Y.PELVIS.x - (wx - x) / S;
    const fL = recorrido(PIE_Y.lejos, t), fC = recorrido(PIE_Y.cerca, t);
    const tap = tapPie(t);
    p.piernas.cerca = { tob: { x: hojaX(fC) + b.pcx, y: TOB_Y - 6 - alzaPie(PIE_Y.cerca, t) / S + b.pcy }, ang: b.pca };
    p.piernas.lejos = { tob: { x: hojaX(fL) + b.plx, y: TOB_Y - alzaPie(PIE_Y.lejos, t) / S - 14 * tap + b.ply }, ang: b.pla - 0.3 * tap };
    planta(Y,p,"cerca",SUELO-alzaPie(PIE_Y.cerca,t));
    planta(Y,p,"lejos",SUELO-5-alzaPie(PIE_Y.lejos,t)-6*tap);
    // cara
    const e = guion(GUION_CY, CY, "reloj", t);
    if (ri > 0) e.abre += 6 * Math.abs(Math.sin(t * 15)) * ri;
    const guino = campana(t, T.guino, T.guino + 0.42);
    const cerrado = e.c > 0.8;
    p.cara = cara(e, cerrado ? 0 : parpadeo(t, PARP_Y));
    p.cara.ojos.i = Math.max(p.cara.ojos.i, guino);
    p.rojo = 0.3 * dentro(t, T.risa0, T.risa0 + 0.3, 10.8, T.paso0 + 0.2);
    p.sudor = 0.4 * campana(t, T.sentadillas[0], T.jarras1 + 0.3);
    manosY(t, p);
    return p;
  }
  // dónde enseña el reloj (la esfera, pantalla): a la altura de la nariz de Guillermo
  const ESFERA = { x: 535, y: 233 };
  // el punto donde se agarran (pantalla): baja hasta Guillermo y sube con el tirón
  const AGARRE0 = { x: 461, y: SUELO - 174 }, AGARRE1 = { x: 489, y: SUELO - 245 };
  const PALMA=P(0,7);
  const agarreEn = t => { const k = salida(fase(t, T.tira0, T.tira1)); return { x: lerp(AGARRE0.x, AGARRE1.x, k), y: lerp(AGARRE0.y, AGARRE1.y, k) - 10 * campana(t, T.tira0, T.tira0 + 0.3) }; };
  function manosY(t, p) {
    const Tr = Y.tronco(p);
    const bc = q => bolsillo(Y, q, "cerca"), bl = q => bolsillo(Y, q, "lejos");
    // mirar el reloj: antebrazo lejano delante de la barriga; toquecitos con el índice cercano
    const relojB = q => manoEn(Y, q, "lejos", Y.aPantalla(q, Tr(P(318, 568))), { dedos: D(0.3, 0.35, 0.35, 0.35), dobla: 1 });
    const golpesT = [...T.golpes, ...T.golpes2];
    const toque = q => {
      const M = relojEn(q,relojB(q)), E_ = esferaDe(M), tq = golpesT.reduce((a, t0) => Math.max(a, campana(t, t0 - 0.08, t0 + 0.08)), 0);
      return porMarca(Y,q,"cerca",P(E_.x,E_.y-4-12*(1-tq)),{dedos:INDICE,dobla:-1},dedo(INDICE),-1.95);
    };
    // sentado: manos en los muslos
    const muslo = lado => q => { const r = rodilla(Y, q, lado), c = Y.aPantalla(q, Tr(Y.CADERA[lado])); return manoEn(Y, q, lado, P(lerp(c.x, r.x, 0.6), lerp(c.y, r.y, 0.6) - 16), { dedos: D(0.6, 0.85, 0.85, 0.8), dobla: lado === "cerca" ? -1 : 1 }); };
    // sentadillas: brazos al frente
    const frente = lado => q => { const h = hombro(Y, q, lado); return manoEn(Y, q, lado, P(h.x - (lado === "cerca" ? 92 : 96), h.y + 6), { dedos: PUNO, dobla: lado === "cerca" ? -1 : 1 }); };
    // en jarras
    const jarra = lado => q => manoEn(Y, q, lado, Y.aPantalla(q, Tr(lado === "cerca" ? P(160, 640) : P(388, 628))), { dedos: D(0.5, 0.75, 0.75, 0.7), dobla: lado === "cerca" ? -1 : 1 });
    // enseña el reloj: brazo lejano estirado hacia la cara de Guillermo
    const ensena = q => {
      const m=manoEn(Y,q,"lejos",P(ESFERA.x-16,ESFERA.y+5),{dedos:D(.3,.4,.4,.4),dobla:1});
      const a=Y.aHoja(q,ESFERA);
      for(let i=0;i<5;i++){const b=Y.aHoja(q,esferaDe(relojEn(q,m)));m.x+=a.x-b.x;m.y+=a.y-b.y;}
      return m;
    };
    // apaga la alarma con el índice
    const apaga = q => {
      const c=corona(esferaDe(relojEn(q,q.manoLejos))),k=tramo(t,T.calla0,T.calla);
      return porMarca(Y,q,"cerca",P(c.x,c.y-12*(1-k)),{dedos:BOTON,dobla:-1},dedo(BOTON),-1.95);
    };
    // se sujeta la barriga de la risa
    const barriga = lado => q => manoEn(Y, q, lado, Y.aPantalla(q, Tr(lado === "cerca" ? P(250, 600) : P(372, 600))), { dedos: D(0.6, 0.9, 0.9, 0.85), dobla: lado === "cerca" ? -1 : 1 });
    // ayuda: la mano lejana abajo, a la de Guillermo; la cercana en la rodilla
    const agarre = q => porMarca(Y,q,"lejos",agarreEn(t),{dedos:DD(ABIERTA,AGARRA,tramo(t,T.agarra-.09,T.agarra)),dobla:1},PALMA,-2.75);
    const rodillaC = q => { const r = rodilla(Y, q, "cerca"); return manoEn(Y, q, "cerca", P(r.x + 4, r.y - 12), { dedos: D(0.6, 0.85, 0.85, 0.8), dobla: -1 }); };
    // palmadas en el hombro de Guillermo (y luego la mano se queda ahí, de colegas)
    const hombroG = () => { const pG = poseGcache(t); return costura(G,pG,HOMBRO_CAMISA); };
    const palmada = q => {
      const h=hombroG(),sube=T.palmadas.reduce((a,t0)=>Math.max(a,campana(t,t0-.16,t0)),0);
      return porMarca(Y,q,"lejos",P(h.x+3*sube,h.y-18*sube),{dedos:PALMADA,dobla:1},dedo(PALMADA,true),-2.68);
    };
    const apoyada = q => { const d=D(.7,.85,.85,.8);return porMarca(Y,q,"lejos",hombroG(),{dedos:d,dobla:1},dedo(d,true),-2.68); };
    p.manoLejos = pista([
      [0, 0, relojB], [T.suspiro0 + 0.1, T.suspiro1, bl], [T.sienta0, T.sienta1, muslo("lejos")], [T.consulta0, T.consulta0 + 0.12, relojB],
      [T.consulta1, T.consulta1 + 0.12, muslo("lejos")], [T.levanta0, T.levanta1, bl], [T.sentadillas[0] - 0.06, T.sentadillas[0] + 0.08, frente("lejos")],
      [T.sentadillas[2] + 0.18, T.jarras1, jarra("lejos")], [T.reloj2, T.reloj2b, relojB], [T.ensena0, T.ensena1, ensena],
      [T.calla0 - 0.08, T.calla0 + 0.08, relojB], [T.calla + 0.08, T.calla + 0.25, barriga("lejos")],
      [T.paso0, T.agarra, agarre], [T.suelta, T.dobla1 + 0.12, palmada], [T.palmadas[2] + 0.1, T.palmadas[2] + 0.3, apoyada]
    ], t, p);
    p.manoCerca = pista([
      [0, 0, toque], [T.suspiro0 + 0.1, T.suspiro1, bc], [T.sienta0, T.sienta1, muslo("cerca")], [T.levanta0, T.levanta1, bc],
      [T.sentadillas[0] - 0.06, T.sentadillas[0] + 0.08, frente("cerca")], [T.sentadillas[2] + 0.18, T.jarras1, jarra("cerca")],
      [T.reloj2, T.reloj2b + 0.04, toque], [T.ensena0, T.ensena1, jarra("cerca")], [T.calla0 - 0.06, T.calla0 + 0.06, apaga],
      [T.calla + 0.05, T.calla + 0.22, barriga("cerca")], [T.paso0, T.paso1, rodillaC], [T.tira0, T.tira0 + 0.2, bc],
      [T.endereza0, T.endereza1, jarra("cerca")]
    ], t, p);
    // la mano que enseña el reloj tiembla al sonar la alarma
    const sac = dentro(t, T.pita, T.pita + 0.04, T.calla0 - 0.1, T.calla0);
    p.manoLejos.x += vib(t, 6 * sac, 0.3); p.manoLejos.y += vib(t, 5 * sac, 2.1);
  }
  let CACHE_G = { t: -1, p: null };
  function poseGcache(t) { if (CACHE_G.t !== t) CACHE_G = { t, p: poseG(t) }; return CACHE_G.p; }

  /* =====================================================================================
   * EL RELOJ DE YORGI (en la muñeca lejana), dibujado en pantalla encima del antebrazo
   * ===================================================================================== */
  function dibReloj(g, M, e) {
    const c = esferaDe(M), a = c.a, r = 6.4;
    // La vibración ya está en la mano y se transmite por igual a correa, caja y corona.
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // correa: banda que abraza el antebrazo
    g.save(); g.translate(M.correa.x, M.correa.y); g.rotate(a);
    g.fillStyle = "#222838"; g.beginPath(); g.roundRect(-3.6, -8.2, 7.2, 16.4, 2.4); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.restore();
    g.translate(c.x, c.y);
    // brillo de la alarma (rojo suave que late)
    if (e.pita > 0.01) {
      const k = e.pita * (0.55 + 0.45 * Math.sin(e.t * 26));
      const gl = g.createRadialGradient(0, 0, 2, 0, 0, 22); gl.addColorStop(0, `rgba(255,90,70,${0.5 * k})`); gl.addColorStop(1, "rgba(255,90,70,0)");
      g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.fill();
    }
    // caja de acero con su bisel
    g.beginPath(); g.arc(0, 0, r + 1.8, 0, TAU);
    const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#c3c9d3"); gr.addColorStop(1, "#6d7482");
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    // botoncito (lo que pulsa para apagarla)
    g.save(); g.rotate(a + Math.PI / 2); g.fillStyle = "#c3c9d3"; g.fillRect(-1.2, -r - 4, 2.4, 2.6); g.restore();
    // esfera azul marino (sin números: solo marcas)
    g.beginPath(); g.arc(0, 0, r, 0, TAU);
    const pit = e.pita * (0.5 + 0.5 * Math.sin(e.t * 26));
    g.fillStyle = mezclaColor("#16243f", "#a3271c", pit); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 0.9;
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6, r0 = i % 3 ? r - 1.8 : r - 2.8; g.beginPath(); g.moveTo(Math.sin(an) * r0, -Math.cos(an) * r0); g.lineTo(Math.sin(an) * (r - 0.8), -Math.cos(an) * (r - 0.8)); g.stroke(); }
    // agujas: corren a toda prisa mientras el tiempo vuela
    const transcurrido=minutos(e.t), min=transcurrido*TAU/60, hora=min/12;
    const aguja = (an, l, w, col) => { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(an) * l, -Math.cos(an) * l); g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
    aguja(hora, r * 0.5, 1.4, "#ffffff"); aguja(min, r * 0.78, 1.0, "#ffffff"); aguja(transcurrido * 60 * TAU, r * 0.82, 0.6, "#ff5a3c");
    g.beginPath(); g.arc(0, 0, 0.9, 0, TAU); g.fillStyle = "#ffffff"; g.fill();
    // cristal
    g.fillStyle = "rgba(255,255,255,0.4)"; g.beginPath(); g.ellipse(-2, -2.6, 3, 1.4, -0.6, 0, TAU); g.fill();
    g.restore();
  }
  // ondas de la alarma: arcos en zigzag a los dos lados de la esfera
  function ondas(g, c, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const u = ((t * 3.6 + i / 3) % 1), r = 12 + u * 30, a = (1 - u) * k * Math.min(1, u * 6);
      if (a < 0.02) continue;
      g.globalAlpha = a; g.strokeStyle = i % 2 ? "#fff3a8" : "#ffffff"; g.lineWidth = 2.6 - u * 1.2;
      g.beginPath();
      const n = 6;
      for (let j = 0; j <= n; j++) {
        const th = -0.65 + 1.3 * j / n, rr = r + (j % 2 ? 2.8 : -2.8);
        const x = c.x + s * Math.cos(th) * rr, y = c.y + Math.sin(th) * rr - 2;
        if (j === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    g.restore();
  }
  function rayitas(g, x, y, k, ang, n = 3, col = "#ffffff", r0 = 14, l = 12, w = 2.6) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineCap = "round"; g.lineWidth = w;
    for (let i = 0; i < n; i++) {
      const a = ang + (i - (n - 1) / 2) * 0.42, r = r0 + 4 * (1 - k);
      g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l)); g.stroke();
    }
    g.restore();
  }
  // polvareda al caer de culo
  function polvo(g, x, y, t) {
    const k = fase(t, T.cae, T.cae + 0.75);
    if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const s = i < 3 ? -1 : 1, j = i % 3, u = salida(k);
      const px = x + s * (16 + u * (36 + j * 22)), py = y - 4 - u * (8 + j * 7) - 6 * hash(i + 3);
      const r = 7 + u * (10 + 4 * j);
      g.globalAlpha = 0.5 * Math.sin(Math.PI * k) * (1 - 0.15 * j);
      g.fillStyle = "#d9cdb6"; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: fachada del bar (mediodía y tarde), atrezo, cielo, sol, nubes y sombras
   * ===================================================================================== */
  const ZOC = 418;                                   // pie de la fachada (empieza la acera)
  const BAR = { x0: 470, techo: 120 };
  const VENT = { x0: 494, x1: 774, y0: 226, y1: 372 };
  const PUERTA = { x0: 870, x1: 972, y0: 206 };
  const BANCO = { x0: 584, x1: 790, asiento: SUELO - 92, respaldo: SUELO - 168, suelo: SUELO - 6 };
  const FAROLA = { x: 822, base: SUELO - 4, farol: 104 };
  const ATREZO = { x: 556, y: 48, w: 300, h: 510 };
  let capas = null;
  function crea() {
    const fondo = lienzo(W + 80, H + 120), g = fondo.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    tejados(g); acera(g); fachada(g);
    // el banco y la farola, en un lienzo recortado (menos píxeles que mover en cada fotograma)
    const atrezo = lienzo(ATREZO.w, ATREZO.h), a = atrezo.getContext("2d");
    a.translate(-ATREZO.x, -ATREZO.y); a.lineJoin = "round"; a.lineCap = "round";
    banco(a); farola(a);
    // nubes: tres formas, blancas y de tarde
    const nubes = [[150, 46], [120, 36], [190, 52]].map(([w, h], i) => ({ blanca: nube(w, h, i, "#ffffff", "#dfe9f3"), tarde: nube(w, h, i, "#ffe2c4", "#f2a98a") }));
    return { fondo, fondoT: tarde(fondo), atrezo, atrezoT: tarde(atrezo), nubes };
  }
  // la misma capa con luz de media tarde (más cálida y algo más oscura, con el oro del sol por la izquierda)
  function tarde(src) {
    const c = lienzo(src.width, src.height), g = c.getContext("2d");
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "multiply"; g.fillStyle = "#efbf98"; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "screen";
    const o = g.createLinearGradient(0, 0, c.width, 0); o.addColorStop(0, "rgba(255,170,90,0.32)"); o.addColorStop(0.55, "rgba(255,150,80,0.08)"); o.addColorStop(1, "rgba(255,150,80,0)");
    g.fillStyle = o; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "destination-in"; g.drawImage(src, 0, 0);
    return c;
  }
  function nube(w, h, i, col, sombra) {
    const c = lienzo(w + 20, h + 20), g = c.getContext("2d");
    g.translate(10, 10);
    const bolas = [];
    for (let k = 0; k < 6; k++) { const u = k / 5; bolas.push([w * (0.12 + 0.76 * u), h * (0.62 - 0.32 * Math.sin(Math.PI * u) - 0.1 * hash(i * 9 + k)), h * (0.28 + 0.22 * Math.sin(Math.PI * u))]); }
    g.fillStyle = sombra; g.beginPath(); for (const [x, y, r] of bolas) { g.moveTo(x + r, y + 3); g.arc(x, y + 3, r, 0, TAU); } g.rect(w * 0.1, h * 0.55, w * 0.8, h * 0.4); g.fill();
    g.fillStyle = col; g.beginPath(); for (const [x, y, r] of bolas) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); } g.rect(w * 0.1, h * 0.5, w * 0.8, h * 0.36); g.fill();
    return c;
  }
  // la calle al fondo: tejados lejanos (sin cielo: el cielo va en cada fotograma)
  function tejados(g) {
    const edif = [[-40, 300, 70, "#9fb0c4"], [30, 268, 92, "#b2bfd0"], [122, 316, 60, "#a6b5c8"], [182, 282, 104, "#bcc6d4"], [286, 326, 70, "#a9b7c9"], [356, 296, 120, "#b6c1d1"]];
    for (const [x, y, w, col] of edif) {
      g.fillStyle = col; g.fillRect(x, y, w, ZOC - y);
      // tejadillo y chimenea
      g.fillStyle = "#8d6d63"; g.beginPath(); g.moveTo(x - 4, y + 2); g.lineTo(x + w / 2, y - 16); g.lineTo(x + w + 4, y + 2); g.closePath(); g.fill();
      g.fillStyle = "#7d6a64"; g.fillRect(x + w * 0.7, y - 22, 9, 16);
      // ventanitas
      g.fillStyle = "rgba(70,86,110,0.55)";
      for (let yy = y + 16; yy < ZOC - 30; yy += 30) for (let xx = x + 10; xx < x + w - 14; xx += 22) g.fillRect(xx, yy, 10, 16);
    }
    // bruma de distancia
    const br = g.createLinearGradient(0, 250, 0, ZOC); br.addColorStop(0, "rgba(220,232,244,0.0)"); br.addColorStop(1, "rgba(220,232,244,0.45)");
    g.fillStyle = br; g.fillRect(-40, 250, BAR.x0 + 40, ZOC - 250);
    // árbol de la acera de enfrente
    g.fillStyle = "#6b5a4a"; g.fillRect(96, 330, 8, 88);
    g.fillStyle = "#7f9f6a"; for (const [x, y, r] of [[100, 318, 30], [80, 334, 22], [122, 334, 24], [100, 300, 22]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  }
  function acera(g) {
    const ac = g.createLinearGradient(0, ZOC, 0, H + 60);
    ac.addColorStop(0, "#c6bba6"); ac.addColorStop(0.6, "#d2c7b1"); ac.addColorStop(1, "#c0b49c");
    g.fillStyle = ac; g.fillRect(-40, ZOC, W + 80, H + 60 - ZOC);
    // baldosas en perspectiva (con su florecita grabada)
    g.save(); g.beginPath(); g.rect(-40, ZOC, W + 80, 640 - ZOC); g.clip();
    const fuga = { x: 512, y: ZOC - 420 }, filas = [ZOC, ZOC + 24, ZOC + 54, ZOC + 92, ZOC + 140, ZOC + 200, ZOC + 272];
    g.strokeStyle = "rgba(110,96,76,0.35)"; g.lineWidth = 1.3;
    const xEn = (xb, y) => lerp(fuga.x, xb, (y - fuga.y) / (640 - fuga.y));
    for (let i = -14; i <= 14; i++) { const xb = 512 + i * 92; g.beginPath(); g.moveTo(xEn(xb, ZOC), ZOC); g.lineTo(xb, 640); g.stroke(); }
    for (const y of filas) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    g.fillStyle = "rgba(120,104,84,0.16)";
    for (let f = 0; f < filas.length - 1; f++) {
      const y = (filas[f] + filas[f + 1]) / 2, sy = (filas[f + 1] - filas[f]) / 92;
      for (let i = -14; i <= 13; i++) {
        const x = (xEn(512 + i * 92, y) + xEn(512 + (i + 1) * 92, y)) / 2;
        for (let p = 0; p < 4; p++) { const a = p * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.ellipse(x + Math.cos(a) * 11 * sy * 1.6, y + Math.sin(a) * 11 * sy, 6 * sy * 1.6, 4 * sy, a, 0, TAU); g.fill(); }
      }
    }
    g.restore();
    // bordillo y calzada
    g.fillStyle = "#e6dfd0"; g.fillRect(-40, 640, W + 80, 9);
    g.fillStyle = "#8e877a"; g.fillRect(-40, 649, W + 80, 4);
    g.fillStyle = "#4b4a52"; g.fillRect(-40, 653, W + 80, H + 60 - 653);
    // junta pared-acera: sombra suave al pie de la fachada
    const so = g.createLinearGradient(0, ZOC, 0, ZOC + 22); so.addColorStop(0, "rgba(60,44,30,0.3)"); so.addColorStop(1, "rgba(60,44,30,0)");
    g.fillStyle = so; g.fillRect(BAR.x0, ZOC, W + 40 - BAR.x0, 22);
  }
  function fachada(g) {
    const x0 = BAR.x0, x1 = W + 40, top = BAR.techo, mid = 300;
    // canto del edificio (esquina) y estuco crema
    const es = g.createLinearGradient(0, top, 0, mid); es.addColorStop(0, "#efe2c2"); es.addColorStop(1, "#e4d3ad");
    g.fillStyle = es; g.fillRect(x0, top, x1 - x0, mid - top);
    g.fillStyle = "#d3bf96"; g.fillRect(x0, top, 10, ZOC - top);
    // cornisa con dentículos
    g.fillStyle = "#cdb88c"; g.fillRect(x0 - 8, top - 18, x1 - x0 + 16, 18);
    g.fillStyle = "#b9a276"; g.fillRect(x0 - 8, top - 2, x1 - x0 + 16, 4);
    g.fillStyle = "#e9dab8"; for (let x = x0; x < x1; x += 16) g.fillRect(x, top - 14, 8, 8);
    g.strokeStyle = "rgba(90,70,40,0.5)"; g.lineWidth = 2; g.strokeRect(x0 - 8, top - 18, x1 - x0 + 16, 18);
    // azulejo verde (zócalo alto) con dibujo de rombos
    g.fillStyle = "#2f7d68"; g.fillRect(x0, mid, x1 - x0, ZOC - mid);
    g.save(); g.beginPath(); g.rect(x0, mid, x1 - x0, ZOC - mid); g.clip();
    for (let y = mid; y < ZOC; y += 20) for (let x = x0; x < x1; x += 20) {
      g.fillStyle = (x / 20 + y / 20) % 2 ? "#36907a" : "#2a7360"; g.fillRect(x + 1, y + 1, 18, 18);
      g.fillStyle = "rgba(240,236,214,0.55)"; g.beginPath(); g.moveTo(x + 10, y + 4); g.lineTo(x + 16, y + 10); g.lineTo(x + 10, y + 16); g.lineTo(x + 4, y + 10); g.closePath(); g.fill();
    }
    g.restore();
    g.fillStyle = "#e9dcbc"; g.fillRect(x0, mid - 6, x1 - x0, 8);
    g.strokeStyle = "rgba(60,44,20,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, mid - 6); g.lineTo(x1, mid - 6); g.moveTo(x0, mid + 2); g.lineTo(x1, mid + 2); g.stroke();
    cristalera(g); puerta(g); toldo(g); letrero(g);
    // maceta junto a la puerta
    const mx = PUERTA.x1 + 34;
    g.fillStyle = "#b5532e"; g.beginPath(); g.moveTo(mx - 20, ZOC - 40); g.lineTo(mx + 20, ZOC - 40); g.lineTo(mx + 15, ZOC); g.lineTo(mx - 15, ZOC); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#4f8a3e"; for (const [dx, dy, r] of [[0, -58, 18], [-14, -48, 14], [14, -48, 14], [0, -76, 12]]) { g.beginPath(); g.arc(mx + dx, ZOC + dy, r, 0, TAU); g.fill(); }
  }
  function cristalera(g) {
    const { x0, x1, y0, y1 } = VENT;
    // interior cálido: barra, estantes con botellas y lámparas colgantes
    const fo = g.createLinearGradient(0, y0, 0, y1); fo.addColorStop(0, "#5a3520"); fo.addColorStop(0.5, "#8a5426"); fo.addColorStop(1, "#5d3a22");
    g.fillStyle = fo; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (const ly of [y0 + 52, y0 + 92]) {
      g.fillStyle = "#3d2414"; g.fillRect(x0, ly, x1 - x0, 5);
      for (let x = x0 + 8; x < x1 - 8; x += 13) {
        const h = 16 + 10 * hash(x + ly), col = ["#2f6b3a", "#7a2a1e", "#c99a3a", "#3b4f7a"][Math.floor(hash(x * 3 + ly) * 4)];
        g.fillStyle = col; g.fillRect(x, ly - h, 7, h); g.fillRect(x + 2, ly - h - 6, 3, 6);
        g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 1, ly - h + 2, 1.5, h - 4);
      }
    }
    g.fillStyle = "#4a2a16"; g.fillRect(x0, y1 - 30, x1 - x0, 30);
    g.fillStyle = "#6e4426"; g.fillRect(x0, y1 - 34, x1 - x0, 6);
    for (const lx of [x0 + 70, x0 + 180]) {
      g.strokeStyle = "#2b1a10"; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, y0); g.lineTo(lx, y0 + 26); g.stroke();
      const l = g.createRadialGradient(lx, y0 + 32, 2, lx, y0 + 32, 46); l.addColorStop(0, "rgba(255,226,150,0.9)"); l.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = l; g.beginPath(); g.arc(lx, y0 + 32, 46, 0, TAU); g.fill();
      g.fillStyle = "#e0a948"; g.beginPath(); g.moveTo(lx - 12, y0 + 34); g.lineTo(lx - 6, y0 + 24); g.lineTo(lx + 6, y0 + 24); g.lineTo(lx + 12, y0 + 34); g.closePath(); g.fill();
    }
    // reflejos del cristal
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    g.fillStyle = "rgba(220,236,255,0.18)";
    for (const [a, w] of [[x0 + 20, 40], [x0 + 140, 18], [x0 + 210, 46]]) { g.beginPath(); g.moveTo(a, y1); g.lineTo(a + w, y1); g.lineTo(a + w + 90, y0); g.lineTo(a + 90, y0); g.closePath(); g.fill(); }
    g.restore();
    // carpintería verde oscura con parteluces
    g.strokeStyle = "#1f4d40"; g.lineWidth = 8; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    g.lineWidth = 5; g.beginPath(); for (const x of [x0 + (x1 - x0) / 3, x0 + 2 * (x1 - x0) / 3]) { g.moveTo(x, y0); g.lineTo(x, y1); } g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8);
    // alféizar
    g.fillStyle = "#e9dcbc"; g.fillRect(x0 - 10, y1 + 2, x1 - x0 + 20, 8); g.strokeRect(x0 - 10, y1 + 2, x1 - x0 + 20, 8);
  }
  function puerta(g) {
    const { x0, x1, y0 } = PUERTA, w = x1 - x0, cx = (x0 + x1) / 2;
    // marco y montante semicircular de cristal
    g.fillStyle = "#3a2516"; g.beginPath(); g.moveTo(x0 - 10, ZOC); g.lineTo(x0 - 10, y0); g.arc(cx, y0, w / 2 + 10, Math.PI, 0); g.lineTo(x1 + 10, ZOC); g.closePath(); g.fill();
    const mo = g.createLinearGradient(0, y0 - w / 2, 0, y0); mo.addColorStop(0, "#ffd88a"); mo.addColorStop(1, "#d99a45");
    g.fillStyle = mo; g.beginPath(); g.arc(cx, y0, w / 2, Math.PI, 0); g.closePath(); g.fill();
    g.strokeStyle = "#3a2516"; g.lineWidth = 3; g.beginPath();
    for (let i = 1; i < 5; i++) { const a = Math.PI + i * Math.PI / 5; g.moveTo(cx, y0); g.lineTo(cx + Math.cos(a) * w / 2, y0 + Math.sin(a) * w / 2); } g.stroke();
    // dos hojas de madera con cuarterones
    const ma = g.createLinearGradient(x0, 0, x1, 0); ma.addColorStop(0, "#7a4a28"); ma.addColorStop(0.5, "#94603a"); ma.addColorStop(1, "#6f4222");
    g.fillStyle = ma; g.fillRect(x0, y0, w, ZOC - y0);
    g.strokeStyle = "rgba(40,20,8,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx, ZOC); g.stroke();
    g.lineWidth = 2.5;
    for (const xx of [x0 + 8, cx + 6]) for (const [yy, hh] of [[y0 + 12, 80], [y0 + 104, 92]]) g.strokeRect(xx, yy, w / 2 - 14, hh);
    g.fillStyle = "#e5c25a"; for (const xx of [cx - 8, cx + 8]) { g.beginPath(); g.arc(xx, y0 + 108, 3.5, 0, TAU); g.fill(); }
    // escalón
    g.fillStyle = "#b7aa92"; g.fillRect(x0 - 16, ZOC - 4, w + 32, 10);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 16, ZOC - 4, w + 32, 10);
  }
  function toldo(g) {
    const { x0, x1 } = VENT, y = VENT.y0 - 30;
    // rayas rojas y crema con el faldón ondulado
    const n = 14, w = (x1 - x0 + 40) / n;
    for (let i = 0; i < n; i++) {
      const a = x0 - 20 + i * w;
      g.fillStyle = i % 2 ? "#f3ead6" : "#c63a2f";
      g.beginPath(); g.moveTo(a + 6, y - 16); g.lineTo(a + w + 6, y - 16); g.lineTo(a + w, y + 24); g.lineTo(a, y + 24); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(a, y + 24); g.lineTo(a + w, y + 24); g.quadraticCurveTo(a + w / 2, y + 40, a, y + 24); g.fill();
    }
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0 - 14, y - 16); g.lineTo(x1 + 26, y - 16); g.lineTo(x1 + 20, y + 24); g.lineTo(x0 - 20, y + 24); g.closePath(); g.stroke();
    // sombra del toldo en la fachada
    g.fillStyle = "rgba(60,30,20,0.18)"; g.fillRect(x0 - 10, y + 30, x1 - x0 + 20, 16);
  }
  // letrero colgante con una jarra de cerveza (sin letras)
  function letrero(g) {
    const bx = BAR.x0 + 4, by = 166;
    g.strokeStyle = "#2b2420"; g.lineWidth = 5; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - 86, by); g.stroke();
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(bx, by + 18); g.quadraticCurveTo(bx - 30, by + 2, bx - 62, by); g.stroke();
    const cx = bx - 50, cy = by + 44;
    g.lineWidth = 2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 20, by); g.lineTo(cx + s * 20, cy - 26); g.stroke(); }
    g.beginPath(); g.arc(cx, cy, 30, 0, TAU); g.fillStyle = "#1f4d40"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#d8b35a"; g.stroke();
    // la jarra
    g.fillStyle = "#f2b33a"; g.fillRect(cx - 11, cy - 10, 18, 24);
    g.fillStyle = "#fff8e6"; g.beginPath(); g.arc(cx - 6, cy - 11, 6, 0, TAU); g.arc(cx + 3, cy - 12, 6, 0, TAU); g.fill();
    g.strokeStyle = "#fff8e6"; g.lineWidth = 3; g.beginPath(); g.arc(cx + 9, cy + 2, 6, -Math.PI / 2, Math.PI / 2); g.stroke();
  }
  function banco(g) {
    const { x0, x1, asiento, respaldo, suelo } = BANCO;
    const pata = (x) => {
      // pata de forja con voluta
      g.strokeStyle = "#232428"; g.lineWidth = 7;
      g.beginPath(); g.moveTo(x, suelo); g.quadraticCurveTo(x + 4, asiento + 30, x - 4, asiento + 4); g.stroke();
      g.beginPath(); g.moveTo(x, asiento + 4); g.quadraticCurveTo(x + 8, asiento - 30, x + 2, respaldo + 6); g.stroke();
      g.lineWidth = 4; g.beginPath(); g.arc(x + 12, asiento + 28, 9, -0.5, 3.6); g.stroke();
      g.fillStyle = "#232428"; g.fillRect(x - 9, suelo - 4, 20, 6);
    };
    // respaldo: tres listones
    for (let i = 0; i < 3; i++) {
      const y = respaldo + i * 20;
      g.fillStyle = i % 2 ? "#a86a3c" : "#b8784a"; g.fillRect(x0 - 8, y, x1 - x0 + 16, 14);
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 8, y, x1 - x0 + 16, 14);
      g.fillStyle = "rgba(255,230,200,0.3)"; g.fillRect(x0 - 6, y + 2, x1 - x0 + 12, 2);
    }
    // asiento visto un poco desde arriba
    for (let i = 0; i < 3; i++) {
      const y = asiento - 18 + i * 8;
      g.fillStyle = i % 2 ? "#9c6136" : "#b8784a"; g.fillRect(x0 - 12 + i * 2, y, x1 - x0 + 24 - i * 4, 7);
      g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(x0 - 12 + i * 2, y, x1 - x0 + 24 - i * 4, 7);
    }
    g.fillStyle = "#8a532c"; g.fillRect(x0 - 8, asiento + 6, x1 - x0 + 16, 8); g.strokeRect(x0 - 8, asiento + 6, x1 - x0 + 16, 8);
    pata(x0 + 14); pata(x1 - 22);
  }
  function farola(g) {
    const { x, base, farol } = FAROLA;
    g.fillStyle = "#1f2226";
    // basa, fuste estriado y capitel
    g.beginPath(); g.moveTo(x - 16, base); g.lineTo(x + 16, base); g.lineTo(x + 10, base - 30); g.lineTo(x + 6, base - 46); g.lineTo(x - 6, base - 46); g.lineTo(x - 10, base - 30); g.closePath(); g.fill();
    g.fillRect(x - 5, farol + 40, 10, base - 46 - farol - 40);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x - 2, farol + 44, 2, base - 96 - farol);
    g.fillStyle = "#1f2226"; g.beginPath(); g.moveTo(x - 12, farol + 40); g.lineTo(x + 12, farol + 40); g.lineTo(x + 7, farol + 30); g.lineTo(x - 7, farol + 30); g.closePath(); g.fill();
    // farol de cristal (se enciende en cada fotograma)
    g.fillStyle = "#cfd8de"; g.beginPath(); g.moveTo(x - 14, farol - 18); g.lineTo(x + 14, farol - 18); g.lineTo(x + 9, farol + 26); g.lineTo(x - 9, farol + 26); g.closePath(); g.fill();
    g.strokeStyle = "#1f2226"; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.moveTo(x, farol - 18); g.lineTo(x, farol + 26); g.stroke();
    g.fillStyle = "#1f2226"; g.beginPath(); g.moveTo(x - 20, farol - 18); g.lineTo(x + 20, farol - 18); g.lineTo(x, farol - 36); g.closePath(); g.fill();
    g.beginPath(); g.arc(x, farol - 40, 4, 0, TAU); g.fill();
  }
  // cielo, sol y nubes (cada fotograma)
  function cielo(g, t) {
    const u = lapso(t);
    const ci = g.createLinearGradient(0, -60, 0, ZOC);
    ci.addColorStop(0, mezclaColor("#3f97e0", "#4a5b98", u)); ci.addColorStop(0.55, mezclaColor("#8cc6ee", "#e7a173", u)); ci.addColorStop(1, mezclaColor("#d8eef9", "#ffd08a", u));
    g.fillStyle = ci; g.fillRect(-40, -60, W + 80, ZOC + 60);
    const s = solEn(u), rr = lerp(24, 32, u);
    const gl = g.createRadialGradient(s.x, s.y, rr * 0.6, s.x, s.y, lerp(130, 200, u));
    gl.addColorStop(0, mezclaColor("#fff8d6", "#ffc886", u).replace("rgb", "rgba").replace(")", ",0.78)")); gl.addColorStop(1, "rgba(255,230,170,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(s.x, s.y, lerp(130, 200, u), 0, TAU); g.fill();
    g.fillStyle = mezclaColor("#fffbe2", "#ffb04a", u); g.beginPath(); g.arc(s.x, s.y, rr, 0, TAU); g.fill();
    // nubes: despacio antes y después; a toda prisa mientras el tiempo vuela
    const NUB = [[-60, 70, 0], [330, 30, 1], [690, 86, 2], [1000, 50, 0]];
    for (let i = 0; i < NUB.length; i++) {
      const [x0, y, f] = NUB[i], n = capas.nubes[f], span = W + 520;
      let x = x0 + 9 * t + 1350 * u; x = ((x + 260) % span + span) % span - 260;
      g.drawImage(n.blanca, x, y);
      if (u > 0.01) { g.globalAlpha = u; g.drawImage(n.tarde, x, y); g.globalAlpha = 1; }
    }
  }
  // sombras en la acera: se proyectan en el suelo (escorzo) y giran/alargan con el sol
  const ESCORZO = 0.3;
  function enSuelo(g, x, y, sm, f) { g.save(); g.translate(x, y); g.scale(1, ESCORZO); g.rotate(Math.PI / 2 - sm.phi); f(); g.restore(); }
  function sombraPersona(g, x, alto, sm, ancho = 1) {
    const k = sm.k * alto / 400;
    g.moveTo(0, -24 * ancho); g.lineTo(220 * k, -30 * ancho); g.lineTo(220 * k, 30 * ancho); g.lineTo(0, 24 * ancho); g.closePath();
    g.moveTo(330 * k + 110 * k + 2, 0); g.ellipse(330 * k, 0, 110 * k + 2, 70 * ancho, 0, 0, TAU);
  }
  function sombras(g, t, pG, pY, verG) {
    const sm = sombraDe(lapso(t));
    g.save(); g.fillStyle = `rgba(52,34,58,${sm.a})`;
    // farola
    enSuelo(g, FAROLA.x, FAROLA.base, sm, () => {
      g.beginPath(); g.moveTo(0, -14); g.lineTo((FAROLA.base - FAROLA.farol) * sm.k, -5); g.lineTo((FAROLA.base - FAROLA.farol) * sm.k, 5); g.lineTo(0, 14); g.closePath();
      g.ellipse((FAROLA.base - FAROLA.farol) * sm.k, 0, 20 * sm.k + 8, 16, 0, 0, TAU); g.fill();
    });
    // banco: asiento y respaldo desplazados según la altura
    enSuelo(g, (BANCO.x0 + BANCO.x1) / 2, BANCO.suelo, sm, () => {
      const L = (BANCO.x1 - BANCO.x0) / 2 + 10, hA = (BANCO.suelo - BANCO.asiento) * sm.k, hR = (BANCO.suelo - BANCO.respaldo) * sm.k;
      // el banco corre a lo largo de x de pantalla: en el suelo, sus extremos son (±L, 0) antes de girar
      const ex = Math.cos(Math.PI / 2 - sm.phi), ey = -Math.sin(Math.PI / 2 - sm.phi);   // eje x de pantalla en el marco girado
      const P_ = (s, h) => ({ x: ex * s * L + h, y: ey * s * L });
      g.beginPath();
      const a = P_(-1, hA - 14), b = P_(1, hA - 14), c = P_(1, hA + 14), d = P_(-1, hA + 14);
      g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath();
      const e = P_(-1, hA + 10), f = P_(1, hA + 10), h2 = P_(1, hR), i2 = P_(-1, hR);
      g.moveTo(e.x, e.y); g.lineTo(f.x, f.y); g.lineTo(h2.x, h2.y); g.lineTo(i2.x, i2.y); g.closePath();
      for (const s of [-0.86, 0.82]) { const p0 = P_(s, 0), p1 = P_(s, hA); g.moveTo(p0.x - 3, p0.y); g.lineTo(p1.x - 3, p1.y); g.lineTo(p1.x + 3, p1.y); g.lineTo(p0.x + 3, p0.y); g.closePath(); }
      g.fill();
    });
    // los dos
    if (verG) {
      const sentado = clamp((pG.pelvis.y - G.PELVIS.y) / 480);
      // su sombra larga llega antes que él (aparece suave cuando arranca a correr, aún fuera de cuadro)
      g.globalAlpha = tramo(t, T.corre0 - 0.2, T.corre0 + 0.15);
      enSuelo(g, pG.x + 4, SUELO, sm, () => { g.beginPath(); sombraPersona(g, 0, 380 * (1 - 0.5 * sentado), sm, 1); g.fill(); });
      g.globalAlpha = 1;
    }
    const sentY = clamp((pY.pelvis.y - Y.PELVIS.y) / 280);
    enSuelo(g, pY.x, SUELO, sm, () => { g.beginPath(); sombraPersona(g, 0, 392 * (1 - 0.35 * sentY), sm, 1.05); g.fill(); });
    g.restore();
  }
  // la farola se enciende (y el bar brilla más al caer la tarde)
  const encendida = t => tramo(t, T.farola0, T.farola1) * (1 - 0.25 * campana(t, T.farola0 + 0.05, T.farola0 + 0.2));
  function luces(g, t, fase_) {
    const k = encendida(t), u = lapso(t);
    if (fase_ === "suelo") {
      if (k > 0.01) {
        g.save(); g.globalCompositeOperation = "lighter";
        const pz = g.createRadialGradient(FAROLA.x, SUELO + 6, 4, FAROLA.x, SUELO + 6, 150);
        pz.addColorStop(0, `rgba(255,190,110,${0.28 * k})`); pz.addColorStop(1, "rgba(255,190,110,0)");
        g.fillStyle = pz; g.beginPath(); g.ellipse(FAROLA.x, SUELO + 6, 150, 44, 0, 0, TAU); g.fill(); g.restore();
      }
      if (u > 0.01) {
        g.save(); g.globalCompositeOperation = "lighter";
        const v = g.createLinearGradient(0, VENT.y0, 0, VENT.y1); v.addColorStop(0, `rgba(255,170,80,${0.16 * u})`); v.addColorStop(1, `rgba(255,140,60,${0.08 * u})`);
        g.fillStyle = v; g.fillRect(VENT.x0, VENT.y0, VENT.x1 - VENT.x0, VENT.y1 - VENT.y0); g.restore();
      }
      return;
    }
    if (k > 0.01) {
      const { x, farol } = FAROLA;
      g.save();
      g.fillStyle = `rgba(255,228,150,${0.95 * k})`; g.beginPath(); g.moveTo(x - 12, farol - 15); g.lineTo(x + 12, farol - 15); g.lineTo(x + 8, farol + 23); g.lineTo(x - 8, farol + 23); g.closePath(); g.fill();
      g.globalCompositeOperation = "lighter";
      const h = g.createRadialGradient(x, farol + 4, 4, x, farol + 4, 90); h.addColorStop(0, `rgba(255,214,130,${0.55 * k})`); h.addColorStop(1, "rgba(255,200,110,0)");
      g.fillStyle = h; g.beginPath(); g.arc(x, farol + 4, 90, 0, TAU); g.fill();
      g.restore();
    }
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 512, 300], [1.4, 1.0, 512, 300], [4.6, 1.0, 512, 300], [5.8, 1.05, 530, 306], [7.6, 1.1, 540, 304],
    [8.3, 1.12, 540, 300], [9.0, 1.42, 536, 262], [9.16, 1.42, 536, 262], [9.6, 1.06, 520, 304], [10.9, 1.06, 512, 304],
    [12.0, 1.1, 520, 300], [13.2, 1.08, 516, 298], [DUR, 1.09, 516, 298]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  const pose = t => ({ g: poseG(t), y: poseY(t) });
  class GuillermoYorgiReloj extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Y.listo()) return;
      if (!capas) capas = crea();
      const pY = poseY(t), pG = poseGcache(t), u = lapso(t);
      const verG = pG.x > -260;
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      cielo(g, t);
      g.drawImage(capas.fondo, -40, -60);
      if (u > 0.002) { g.globalAlpha = u; g.drawImage(capas.fondoT, -40, -60); g.globalAlpha = 1; }
      luces(g, t, "suelo");
      sombras(g, t, pG, pY, t >= T.corre0 - .2);
      g.drawImage(capas.atrezo, ATREZO.x, ATREZO.y);
      if (u > 0.002) { g.globalAlpha = u; g.drawImage(capas.atrezoT, ATREZO.x, ATREZO.y); g.globalAlpha = 1; }
      luces(g, t, "farol");
      // el reloj de Yorgi, encima del antebrazo lejano (debajo de los dedos)
      const pita = dentro(t, T.pita, T.pita + 0.03, T.calla - 0.03, T.calla);
      pY.manoLejos.objeto = gg => { gg.save(); gg.setTransform(MATRIZ); dibReloj(gg, relojEn(pY,pY.manoLejos), { t, pita }); gg.restore(); };
      if (verG) G.dibujar(g, pG, t);
      Y.dibujar(g, pY, t);
      // la alarma
      const E_ = esferaDe(relojEn(pY,pY.manoLejos));
      ondas(g, E_, pita, t);
      rayitas(g, E_.x, E_.y, 0.8 * pita * (0.5 + 0.5 * Math.sin(t * 40)), -Math.PI / 2, 3, "#ffffff", 9, 6, 1.6);
      if (verG) {
        // respingo y polvareda
        const HG = G.aPantalla(pG, G.cabeza(pG).a({ x: 760, y: 300 }));
        rayitas(g, HG.x, HG.y, campana(t, T.pita, T.pita + 0.42), -1.9, 3);
        if(t>=T.cae && t<T.cae+.75){const impacto=costura(G,poseGcache(T.cae),ASIENTO_G);polvo(g,impacto.x,impacto.y,t);}
      }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00133.2", nombre: "Guillermo y Yorgi · Llegas tarde", crear: () => new GuillermoYorgiReloj() });
  window.__A2D_00133_2 = { pose,poseG,poseY,T,DUR,lapso,camara,hombro,muneca,esferaDe,relojEn,rodilla,agarreEn,manoEn,ESFERA,SUELO,BANCO,AGARRE0,AGARRE1,corona,minutos,ASIENTO_G,ASIENTO_Y,HOMBRO_CAMISA,costura,suela,dedo,puntoMano,PALMA,dibReloj,boteG,tapPie,encendida,solEn,sombraDe,vueloG };
})();
