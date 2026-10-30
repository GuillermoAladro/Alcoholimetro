"use strict";
/* 00004 · Guillermo contra la máquina de puñetazos
 *
 * Negro → al lado de Guillermo hay una máquina de puñetazos apagada. Él, con las manos en los
 * bolsillos, la mira de reojo → lanza una moneda con el pulgar, la máquina se enciende y baja el
 * saco → se cruje el cuello, se pone en guardia, da saltitos, tira dos directos al aire y amaga
 * mirando a cámara → echa el brazo muy atrás y suelta el puñetazo → el marcador se vuelve loco
 * hasta 999, chispas y humo → se acerca a leerlo y el saco, que seguía dando vueltas, le da en
 * toda la cara → se tambalea con estrellitas, cae sentado con los ojos en espiral y un chichón,
 * y levanta el pulgar a cámara → negro.
 *
 * El único texto son los números del marcador de la máquina. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 560, XG = 330;
  const DUR = 13.25;
  const T = {
    mira0: 0.5, moneda0: 1.6, lanza: 2.05, encaja: 2.5, baja0: 2.6, baja1: 3.15,
    cuello0: 3.15, cuello1: 3.7, guardia0: 3.7, directo1: 4.3, directo2: 4.68, amago: 5.05, camara0: 5.15,
    carga0: 5.75, golpe: 6.38, victoria0: 6.55, acerca0: 7.25, acerca1: 7.85, zas: 8.2,
    cae0: 9.2, sienta: 9.62, pulgar0: 10.9, muere: 10.55, fin: 12.35
  };

  /* ---------- pasos (x de pantalla de cada tobillo) ---------- */
  const PASOS = {
    cerca: [[-10, -9, XG - 19], [T.guardia0, T.guardia0 + 0.2, XG - 44], [T.acerca0, T.acerca0 + 0.25, XG + 34],
            [T.zas + 0.25, T.zas + 0.5, XG - 38], [T.zas + 0.68, T.zas + 0.92, XG - 76], [T.cae0, T.sienta, XG + 92]],
    lejos: [[-10, -9, XG + 18], [T.guardia0 + 0.1, T.guardia0 + 0.3, XG + 40], [T.golpe - 0.13, T.golpe - 0.02, XG + 88],
            [T.victoria0 + 0.1, T.victoria0 + 0.35, XG + 52], [T.acerca0 + 0.2, T.acerca0 + 0.48, XG + 112],
            [T.zas + 0.1, T.zas + 0.32, XG + 40], [T.zas + 0.5, T.zas + 0.74, XG - 6], [T.cae0, T.sienta, XG + 146]]
  };
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function pie(lado, t) {
    const L = PASOS[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const desliza = t0 === T.cae0;                    // al caer, los pies resbalan por el suelo
    const arco = desliza ? 0 : Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), y: TOB_Y[lado] - 55 * arco, ang: desliza ? -1.25 * suave(u) : -0.2 * arco };
  }

  /* ---------- posturas del cuerpo (se mezclan) ---------- */
  // dx: pelvis (px de pantalla), pel: pelvis arriba/abajo (hoja), manos respecto a su hombro (hoja).
  const P0 = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 300, la: 0, lmu: -1.75, lp: 0, lpu: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const CUERPOS = {
    bolsillos: C_({}),
    moneda: C_({ lx: 120, ly: 60, la: -0.4, lmu: -3.4, lp: 1 }),
    cuello: C_({ lx: 30, ly: 290, lp: 1, cab: 0 }),
    guardia: C_({ pel: 30, torso: 0.05, cx: 150, cy: -70, ca: -0.25, cmu: -4.5, cp: 1, lx: 66, ly: -96, la: -0.2, lmu: -4.5, lp: 1 }),
    amago: C_({ dx: 8, pel: 30, torso: 0.1, cx: 150, cy: -70, ca: -0.25, cmu: -4.5, cp: 1, lx: 205, ly: -30, la: 0, lmu: -3.3, lp: 1 }),
    carga: C_({ dx: -14, pel: 58, torso: -0.16, cab: 0.05, cx: 140, cy: -60, ca: -0.25, cmu: -4.5, cp: 1, lx: -55, ly: 205, la: 0.6, lmu: -1.5, lp: 1 }),
    golpe: C_({ dx: 46, pel: 48, torso: 0.2, cab: 0.06, cx: 120, cy: -40, ca: -0.25, cmu: -4.5, cp: 1, lx: 270, ly: -6, la: 0, lmu: -3.14, lp: 1 }),
    victoria: C_({ dx: 8, pel: 10, torso: -0.05, cab: -0.08, cx: 60, cy: 230, ca: 0.3, cmu: -1.6, cp: 1, lx: 160, ly: -195, la: -2.2, lmu: -1.75, lp: 1 }),
    lee: C_({ dx: 74, pel: 20, torso: 0.22, cab: 0.06, cx: 40, cy: 255, ca: 0.3, cmu: -1.6, cp: 1, lx: 30, ly: 270, la: 0.2, lmu: -1.75, lp: 1 }),
    zas: C_({ dx: 50, pel: 60, torso: 0.1, cab: 0.18, cx: -30, cy: 120, ca: 1.0, cmu: -1.6, cp: 1, lx: 130, ly: -60, la: -1, lmu: -1.75, lp: 1 }),
    tambalea: C_({ dx: -30, pel: 30, torso: -0.08, cab: -0.2, cx: -20, cy: 230, ca: 0.6, cmu: -1.6, cp: 1, lx: 70, ly: 230, la: -0.5, lmu: -1.75, lp: 1 }),
    sentado: C_({ dx: -10, pel: 556, torso: -0.12, cab: 0.06, cx: -70, cy: 250, ca: 0.4, cmu: -1.6, cp: 1, lx: 60, ly: 250, la: -0.2, lmu: -1.75, lp: 1 }),
    pulgar: C_({ dx: -10, pel: 556, torso: -0.1, cab: 0.04, cx: -70, cy: 250, ca: 0.4, cmu: -1.6, cp: 1, lx: 105, ly: -70, la: 0, lmu: -4.5, lp: 1, lpu: 1 })
  };
  const GUION_CUERPO = [
    [T.moneda0, T.moneda0 + 0.35, "moneda"], [T.lanza + 0.25, T.cuello0 + 0.2, "cuello"], [T.guardia0, T.guardia0 + 0.3, "guardia"],
    [T.amago - 0.05, T.amago + 0.12, "amago"], [T.amago + 0.2, T.amago + 0.45, "guardia"], [T.carga0, T.golpe - 0.1, "carga"],
    [T.golpe - 0.1, T.golpe, "golpe"], [T.victoria0, T.victoria0 + 0.35, "victoria"], [T.acerca0, T.acerca1, "lee"],
    [T.zas, T.zas + 0.1, "zas"], [T.zas + 0.15, T.zas + 0.6, "tambalea"], [T.cae0, T.sienta, "sentado"], [T.pulgar0, T.pulgar0 + 0.35, "pulgar"]
  ];
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function postura(t) {
    let c = CUERPOS.bolsillos;
    for (const [t0, t1, nom] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], (nom === "golpe" ? salida : suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    inicio: E({}),
    chulo: E({ mx: 0.9, my: 0.1, sd: 12, gd: 0.12, si: -2, gi: -0.05, orig: 0, sonr: 0.45, ancho: 0.9 }),
    moneda: E({ mx: 0.8, my: 0.45, sd: 6, gd: 0.08, si: 4, gi: 0.05, orig: 0, sonr: 0.5 }),
    cuello: E({ mx: 0.5, my: 0, c: 0.85, h: 0.6, sd: 6, gd: 0.1, si: 6, gi: 0.1, orig: 0, sonr: 0.7, ancho: 1 }),
    guardia: E({ mx: 0.9, my: 0.05, c: 0.18, sd: -8, gd: -0.2, si: -8, gi: -0.2, orig: 0, sonr: 0.3, ancho: 0.9 }),
    camara: E({ mx: -0.85, my: -0.3, sd: 16, gd: 0.15, si: -3, gi: -0.08, orig: 0, sonr: 0.75, abre: 6, ancho: 1, lengua: 0 }),
    carga: E({ mx: 0.9, my: 0, c: 0.38, iris: 0.85, sd: -13, gd: -0.25, si: -13, gi: -0.25, orig: 0, abre: 12, ancho: 1.15, sonr: -0.62 }),
    golpe: E({ mx: 0.9, my: 0, c: 0.75, z: 0.6, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, abre: 62, ancho: 1.25, sonr: -0.1, lengua: 0.3 }),
    victoria: E({ mx: 0.9, my: -0.4, c: 0.6, h: 1, sd: 18, gd: 0.18, si: 18, gi: 0.18, orig: 0, abre: 32, ancho: 1.15, sonr: 1 }),
    lee: E({ mx: 0.9, my: -0.15, iris: 1.12, sd: 22, gd: 0.15, si: 22, gi: 0.15, orig: 0, abre: 34, ancho: 0.62, sonr: 0.1, lengua: 0.3 }),
    zas: E({ mx: 0, my: 0, c: 1, z: 1, sd: 10, gd: 0.15, si: 10, gi: 0.15, orig: 0, abre: 24, ancho: 0.8, sonr: -0.4, lengua: 0.5 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, orig: 0, abre: 18, ancho: 0.85, sonr: -0.15, lengua: 0.8 }),
    pulgar: E({ mx: 0, my: 0, esp: 1, sd: 10, gd: 0.15, si: 2, gi: 0, orig: 0, abre: 9, ancho: 1.05, sonr: 0.65, lengua: 0.4 })
  };
  const GUION_CARA = [
    [T.mira0, T.mira0 + 0.4, "chulo"], [T.moneda0, T.moneda0 + 0.3, "moneda"], [T.encaja + 0.1, T.encaja + 0.4, "chulo"],
    [T.cuello0, T.cuello0 + 0.15, "cuello"], [T.guardia0, T.guardia0 + 0.25, "guardia"], [T.camara0, T.camara0 + 0.2, "camara"],
    [T.carga0 - 0.1, T.carga0 + 0.15, "carga"], [T.golpe - 0.08, T.golpe, "golpe"], [T.victoria0, T.victoria0 + 0.25, "victoria"],
    [T.acerca0 + 0.1, T.acerca0 + 0.4, "lee"], [T.zas, T.zas + 0.05, "zas"], [T.zas + 0.4, T.zas + 0.8, "mareo"], [T.pulgar0, T.pulgar0 + 0.4, "pulgar"]
  ];
  function expresion(t) {
    let e = CARAS.inicio;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const tb of [1.25, 4.85, 7.75]) { const k = fase(t, tb, tb + 0.14); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }

  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLSILLO_L = punoDesde({ x: 372, y: 648 }, 0, -1.75);
  const aHoja = (p, q) => ({ x: G.PELVIS.x + (q.x - p.x) / S, y: G.SUELO + (q.y - SUELO) / S });

  let MAQ = null;              // geometría de la máquina (se calcula una vez a partir de la postura de leer)

  function poseBase(t, sinMaquina) {
    const b = postura(t);
    const respira = Math.sin(t * 2.3);
    // saltitos de boxeador en guardia
    const salta = tramo(t, T.guardia0 + 0.2, T.guardia0 + 0.4) * (1 - tramo(t, T.carga0 - 0.2, T.carga0));
    const bote = Math.abs(Math.sin((t - T.guardia0) * Math.PI * 3.2)) * salta;
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - 22 * bote },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, cara: null
    };
    for (const lado of ["cerca", "lejos"]) { const f = pie(lado, t); p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y - 70 * bote }, ang: f.ang + 0.25 * bote }; }
    // crujido de cuello: cabeza a un lado y a otro
    p.cabeza.ang += -0.22 * campana(t, T.cuello0 + 0.05, T.cuello0 + 0.3) + 0.22 * campana(t, T.cuello0 + 0.3, T.cuello0 + 0.55);
    // golpe en la cara: cabeza hacia atrás, aplastada
    const zas = t >= T.zas ? Math.exp(-(t - T.zas) * 6) * suave(fase(t, T.zas, T.zas + 0.04)) : 0;
    p.cabeza.esc = { x: 1 + 0.12 * zas, y: 1 - 0.16 * zas }; p.cabeza.dy = 14 * zas;
    // tambaleo y mareo sentado
    const tamb = tramo(t, T.zas + 0.1, T.zas + 0.3) * (1 - tramo(t, T.cae0, T.sienta));
    p.torso += 0.1 * Math.sin((t - T.zas) * 7) * tamb; p.cabeza.ang += 0.12 * Math.sin((t - T.zas) * 6 + 1) * tamb;
    const mareo = tramo(t, T.sienta, T.sienta + 0.3);
    p.torso += 0.05 * Math.sin(t * 2.6) * mareo; p.cabeza.ang += 0.08 * Math.sin(t * 2.6 + 0.8) * mareo;
    // al sentarse, rebote
    p.pelvis.y -= 30 * campana(t, T.sienta, T.sienta + 0.25);
    // cara
    const e = expresion(t);
    e.c = Math.max(e.c, parpadeos(t));
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: e.c, i: e.c, feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: 0, rubor: 0, bigote: 0 };
    p.rojo = 0.35 * tramo(t, T.carga0, T.golpe) * (1 - tramo(t, T.victoria0, T.acerca0)) + 0.25 * tramo(t, T.zas, T.zas + 0.3);
    p.cara.rubor = p.rojo;
    p.chichonEn = { x: 850, y: 268 };
    p.chichon = t > T.zas + 0.25 ? clamp(salida(fase(t, T.zas + 0.25, T.zas + 0.45)) * (1 + 0.15 * Math.sin(fase(t, T.zas + 0.25, T.zas + 0.7) * Math.PI))) : 0;
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const enBolsC = 1 - clamp(b.cp * 1.5), enBolsL = 1 - clamp(b.lp * 1.5);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(c, BOLSILLO_C, enBolsC * (1 - b.cp)); l = mezcla(l, BOLSILLO_L, enBolsL * (1 - b.lp));
    // directos al aire con la mano cercana
    for (const td of [T.directo1, T.directo2]) {
      const k = campana(t, td, td + 0.24), sale = Math.pow(k, 0.6);
      c = mezcla(c, { x: hc.x + 300, y: hc.y - 72 }, sale);
    }
    // el puñetazo va justo al saco
    if (MAQ && !sinMaquina) {
      const objetivo = aHoja(p, { x: MAQ.reposo.x - 34, y: MAQ.reposo.y + 2 });
      const k = salida(fase(t, T.golpe - 0.1, T.golpe)) * (1 - tramo(t, T.victoria0, T.victoria0 + 0.35));
      if (k > 0) l = mezcla(l, objetivo, k);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: b.cmu, dobla: -1, puno: b.cp };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la, mu: b.lmu, dobla: -1, puno: b.lp, pulgar: b.lpu };
    if (t > T.moneda0 && t < T.lanza + 0.04) p.manoLejos.objeto = (g) => { g.fillStyle = "#f7c63a"; g.strokeStyle = "#5a3b00"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(-4, -15, 6, 2.6, -0.3, 0, Math.PI * 2); g.fill(); g.stroke(); };
    return p;
  }
  const pose = t => poseBase(t);

  /* ---------- máquina ---------- */
  const R_SACO = 118, R_BOLA = 27, B0 = 1.95, B_PLEGADO = -0.55 + 2 * Math.PI;  // plegado sobre el techo de la máquina; al encenderse baja por la izquierda
  // El saco da casi dos vueltas y en la segunda baja por la izquierda justo sobre la cabeza de
  // Guillermo, que se ha acercado a leer el marcador: la máquina se coloca para que el punto más a
  // la izquierda del giro quede encima de su coronilla en ese instante.
  const COCO = { x: 860, y: 292 };                   // punto del pelo (retrato) donde recibe el golpe
  function preparaMaquina() {
    const p = poseBase(T.zas - 0.001, true);
    const coco = G.aPantalla(p, G.cabeza(p).a(COCO));
    const P = { x: coco.x + R_SACO, y: coco.y - R_BOLA };
    const fin = -3 * Math.PI;                                           // segunda pasada por la izquierda
    const D = B0 - fin, u = T.zas - T.golpe, w0 = 10.5;
    const a = 2 * (w0 * u - D) / (u * u);
    MAQ = { P, bGolpe: fin, w0, a, coco, reposo: { x: P.x + R_SACO * Math.cos(B0), y: P.y + R_SACO * Math.sin(B0) } };
  }
  function anguloSaco(t) {
    if (t < T.baja0) return B_PLEGADO;
    if (t < T.golpe) {
      const k = fase(t, T.baja0, T.baja1);
      const caida = suave5(Math.min(1, k / 0.6)) + 0.1 * Math.sin(Math.PI * fase(k, 0.6, 1)) * (1 - fase(k, 0.6, 1));
      let b = lerp(B_PLEGADO, B0, caida);
      b += 0.05 * campana(t, T.amago, T.amago + 0.5) * Math.sin((t - T.amago) * 18);       // el amago lo mueve un poco
      b += 0.012 * Math.sin(t * 3.1) * (t > T.baja1 ? 1 : 0);
      return b;
    }
    if (t < T.zas) { const u = t - T.golpe; return B0 - (MAQ.w0 * u - 0.5 * MAQ.a * u * u); }
    // el brazo se parte: el trozo que queda cuelga balanceándose
    const v = t - T.zas, cuelga = Math.PI / 2 - 4 * Math.PI;
    return cuelga + (MAQ.bGolpe - cuelga) * Math.exp(-2.2 * v) * Math.cos(5.5 * v);
  }
  const posSaco = t => { const b = anguloSaco(t); return { x: MAQ.P.x + R_SACO * Math.cos(b), y: MAQ.P.y + R_SACO * Math.sin(b), b }; };
  // Tras el coscorrón la bola sale rebotando: sube un poco, cae, bota en el suelo y rueda.
  function bolaSuelta(t) {
    const z = posSaco(T.zas - 1e-4), v = t - T.zas, g0 = 1500, suelo = SUELO - R_BOLA;
    let x = z.x, y = z.y, vx = -150, vy = -330, tt = v, rot = 0;
    for (let rebote = 0; rebote < 4; rebote++) {
      const disc = vy * vy + 2 * g0 * (suelo - y), tc = (-vy + Math.sqrt(Math.max(0, disc))) / g0;
      if (tt < tc) { x += vx * tt; y += vy * tt + 0.5 * g0 * tt * tt; rot += vx * tt / R_BOLA; return { x, y, rot }; }
      x += vx * tc; rot += vx * tc / R_BOLA; y = suelo; vy = -(vy + g0 * tc) * 0.42; vx *= 0.8; tt -= tc;
    }
    const roda = Math.min(tt, 1.6); x += vx * roda - 0.5 * vx / 1.6 * roda * roda; rot += (vx * roda) / R_BOLA;
    return { x, y: suelo, rot };
  }

  // marcador de 7 segmentos
  const SEG = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
  function digito(g, x, y, w, h, n, color, apagado) {
    const e = w * 0.16, segs = {
      a: [x + e, y, w - 2 * e, e], d: [x + e, y + h - e, w - 2 * e, e], g: [x + e, y + h / 2 - e / 2, w - 2 * e, e],
      f: [x, y + e, e, h / 2 - e], b: [x + w - e, y + e, e, h / 2 - e], e: [x, y + h / 2, e, h / 2 - e], c: [x + w - e, y + h / 2, e, h / 2 - e] };
    for (const k in segs) {
      const on = n !== null && SEG[n].includes(k), [sx, sy, sw, sh] = segs[k];
      g.fillStyle = on ? color : apagado; g.beginPath();
      g.roundRect ? g.roundRect(sx, sy, sw, sh, e * 0.4) : g.rect(sx, sy, sw, sh); g.fill();
    }
  }
  function lectura(t) {
    if (t < T.encaja + 0.1) return null;
    if (t < T.golpe) return 0;
    const u = fase(t, T.golpe, T.golpe + 0.95);
    let v = Math.floor(999 * salida(u));
    if (u < 1) v = Math.min(999, v + Math.floor(hash(Math.floor(t * 40)) * 9));
    return v;
  }
  function maquina(g, t) {
    const { P } = MAQ;
    const encendida = t >= T.encaja + 0.08 && t < T.muere;
    const tiembla = (t >= T.golpe ? Math.exp(-(t - T.golpe) * 3) * 5 : 0) + (t >= T.golpe + 0.95 && t < T.muere ? 1.2 : 0) + (t >= T.muere ? Math.exp(-(t - T.muere) * 4) * 4 : 0);
    g.save(); g.translate(ruido(t * 40) * tiembla, ruido(t * 40 + 9) * tiembla * 0.5);
    const x0 = P.x + 8, x1 = P.x + 172, yT = P.y - 40;
    g.lineJoin = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    // lateral en perspectiva y cuerpo
    g.fillStyle = "#6e0716"; g.beginPath(); g.moveTo(x1, yT); g.lineTo(x1 + 34, yT - 14); g.lineTo(x1 + 34, SUELO - 10); g.lineTo(x1, SUELO); g.closePath(); g.fill(); g.stroke();
    const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#d81b32"); gr.addColorStop(1, "#a50f23");
    g.fillStyle = gr; g.beginPath(); g.rect(x0, yT, x1 - x0, SUELO - yT); g.fill(); g.stroke();
    // remate superior redondeado
    g.fillStyle = "#1b1a20"; g.beginPath(); g.moveTo(x0 - 6, yT + 4); g.quadraticCurveTo((x0 + x1) / 2 + 17, yT - 46, x1 + 40, yT - 10); g.lineTo(x1 + 40, yT + 4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffcc1a"; g.fillRect(x0 + 2, yT + 6, x1 - x0 - 4, 8);
    // pantalla con bombillas en el frontal
    const px = x0 + 16, py = P.y + 4, pw = x1 - x0 - 32, ph = 78;
    g.fillStyle = "#1b1a20"; g.beginPath(); g.roundRect ? g.roundRect(px - 12, py - 12, pw + 24, ph + 24, 10) : g.rect(px - 12, py - 12, pw + 24, ph + 24); g.fill();
    g.lineWidth = 3.5; g.strokeStyle = "#c9ced6"; g.stroke(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    const caja = [px - 12, py - 12, pw + 24, ph + 24], per = 2 * (caja[2] + caja[3]);
    for (let i = 0; i < 16; i++) {
      let d = i / 16 * per, bx, by;
      if (d < caja[2]) { bx = caja[0] + d; by = caja[1]; } else if ((d -= caja[2]) < caja[3]) { bx = caja[0] + caja[2]; by = caja[1] + d; }
      else if ((d -= caja[3]) < caja[2]) { bx = caja[0] + caja[2] - d; by = caja[1] + caja[3]; } else { d -= caja[2]; bx = caja[0]; by = caja[1] + caja[3] - d; }
      let col = "#3a3328";
      if (encendida) {
        if (t < T.golpe) col = ((i + Math.floor(t * 10)) % 3 === 0) ? "#fff2a0" : "#8a7a40";
        else col = ["#ff4d4d", "#ffe24d", "#4dff88", "#4dc3ff"][Math.floor(hash(i + Math.floor(t * 18) * 7) * 4)];
      }
      g.fillStyle = col; g.beginPath(); g.arc(bx, by, 4.5, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#0b0a0e"; g.stroke();
    }
    g.fillStyle = "#08060a"; g.fillRect(px, py, pw, ph); g.lineWidth = 2; g.strokeStyle = "#3a3a44"; g.strokeRect(px, py, pw, ph);
    const v = encendida ? lectura(t) : null;
    const tope = v === 999 && t < T.muere, parpadea = tope && Math.sin(t * 24) < -0.2;
    let txt = v === null ? null : String(v).padStart(3, "0");
    if (encendida && t > T.golpe + 1.6 && hash(Math.floor(t * 9)) < 0.18) txt = String(Math.floor(hash(Math.floor(t * 9) + 3) * 1000)).padStart(3, "0");
    const color = tope ? (Math.floor(t * 6) % 2 ? "#ffe24d" : "#ff3a2a") : "#ff3a2a";
    const dw = (pw - 24) / 3;
    for (let i = 0; i < 3; i++) digito(g, px + 8 + i * (dw + 4), py + 8, dw - 4, ph - 16, txt && !parpadea ? +txt[i] : null, color, encendida ? "#2a0c0c" : "#160808");
    if (encendida && txt && !parpadea) { g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(255,60,40,0.18)"; g.fillRect(px - 6, py - 6, pw + 12, ph + 12); g.restore(); }
    // estrella con puño
    g.save(); g.translate((x0 + x1) / 2, P.y + 168); g.rotate(-0.12); g.lineWidth = 3; g.strokeStyle = "#0b0a0e";
    g.fillStyle = "#ffcc1a"; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 20 : 44; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffb27a"; g.beginPath(); g.roundRect ? g.roundRect(-15, -13, 30, 24, 8) : g.rect(-15, -13, 30, 24); g.fill(); g.stroke();
    g.lineWidth = 1.6; g.beginPath(); for (let i = -1; i <= 1; i++) { g.moveTo(15, i * 6.5); g.lineTo(6, i * 6.5); } g.stroke();
    g.restore();
    // ranura de la moneda, franja y rejilla
    const ranura = { x: (x0 + x1) / 2, y: P.y + 250 };
    g.lineWidth = 3; g.strokeStyle = "#0b0a0e";
    g.fillStyle = "#c9ced6"; g.fillRect(ranura.x - 14, ranura.y - 20, 28, 40); g.strokeRect(ranura.x - 14, ranura.y - 20, 28, 40);
    g.fillStyle = encendida ? (Math.sin(t * 8) > 0 ? "#3bff6a" : "#1db84a") : "#123018"; g.fillRect(ranura.x - 3, ranura.y - 13, 6, 26);
    g.fillStyle = "#ffcc1a"; g.fillRect(x0 + 2, SUELO - 70, x1 - x0 - 4, 9);
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 3;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x0 + 30, SUELO - 110 + i * 10); g.lineTo(x1 - 30, SUELO - 110 + i * 10); g.stroke(); }
    g.fillStyle = "#151318"; g.fillRect(x0 - 4, SUELO - 22, x1 - x0 + 8, 22); g.strokeStyle = "#0b0a0e"; g.strokeRect(x0 - 4, SUELO - 22, x1 - x0 + 8, 22);
    // bisagra del brazo
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(P.x, P.y, 12, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(P.x, P.y, 3.5, 0, Math.PI * 2); g.fill();
    g.restore();
    return { ranura, pantalla: { x: px, y: py, w: pw, h: ph } };
  }
  function saco(g, t) {
    const { P } = MAQ, s = posSaco(t);
    const vel = t >= T.golpe && t < T.zas ? MAQ.w0 - MAQ.a * (t - T.golpe) : 0;
    g.save(); g.lineCap = "round";
    // estela del giro
    if (vel > 3) {
      g.strokeStyle = `rgba(255,255,255,${clamp((vel - 3) / 8) * 0.5})`; g.lineWidth = R_BOLA * 1.6;
      g.beginPath(); g.arc(P.x, P.y, R_SACO, s.b, s.b + Math.min(1.6, vel * 0.09)); g.stroke();
    }
    // brazo cromado (partido por la mitad después del coscorrón)
    const roto = t >= T.zas, largo = roto ? 0.5 : 1;
    const fx = P.x + (s.x - P.x) * largo, fy = P.y + (s.y - P.y) * largo;
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 11; g.beginPath(); g.moveTo(P.x, P.y); g.lineTo(fx, fy); g.stroke();
    g.strokeStyle = "#c9ced6"; g.lineWidth = 6; g.stroke();
    if (roto) { g.fillStyle = "#c9ced6"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.save(); g.translate(fx, fy); g.rotate(s.b);
      g.beginPath(); g.moveTo(-2, -5); g.lineTo(5, -3); g.lineTo(2, 0); g.lineTo(7, 3); g.lineTo(-2, 5); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    // bola de cuero roja (se aplasta al recibir el golpe)
    const choque = Math.exp(-Math.max(0, t - T.golpe) * 14) * (t >= T.golpe ? 1 : 0) + Math.exp(-Math.max(0, t - T.zas) * 14) * (t >= T.zas ? 1 : 0);
    if (roto) { const b = bolaSuelta(t); g.translate(b.x, b.y); g.rotate(b.rot); g.scale(1 + 0.3 * choque, 1 - 0.25 * choque); }
    else { g.translate(s.x, s.y); g.rotate(s.b + Math.PI / 2); g.scale(1 + 0.25 * choque, 1 - 0.2 * choque); }
    const gr = g.createRadialGradient(-8, -10, 3, 0, 0, R_BOLA * 1.1); gr.addColorStop(0, "#ff7b6b"); gr.addColorStop(0.5, "#d8202f"); gr.addColorStop(1, "#7a0812");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, R_BOLA, R_BOLA * 1.08, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 2.6; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.strokeStyle = "rgba(255,230,200,0.7)"; g.lineWidth = 1.4; g.setLineDash([3, 3]);
    g.beginPath(); g.ellipse(0, 0, R_BOLA * 0.55, R_BOLA * 1.0, 0, -1.2, 1.2); g.stroke(); g.setLineDash([]);
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-9, -12, 7, 4, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 12, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 12, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.5; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function moneda(g, t, desde, ranura) {
    const k = fase(t, T.lanza, T.encaja); if (k <= 0 || k >= 1 || !desde) return;
    const x = lerp(desde.x, ranura.x, k), y = lerp(desde.y, ranura.y, k) - 150 * Math.sin(Math.PI * k);
    const w = 7 * Math.abs(Math.cos(t * 26)) + 1.2;
    g.save(); g.fillStyle = "#f7c63a"; g.strokeStyle = "#5a3b00"; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(x, y, w, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#fff3b0"; g.beginPath(); g.ellipse(x - w * 0.3, y - 2, w * 0.3, 2, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function tintineo(g, t, ranura) {
    const k = fase(t, T.encaja, T.encaja + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,250,200,${1 - k})`; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, r0 = 14 + 16 * k; g.beginPath(); g.moveTo(ranura.x + Math.cos(a) * r0, ranura.y + Math.sin(a) * r0); g.lineTo(ranura.x + Math.cos(a) * (r0 + 9), ranura.y + Math.sin(a) * (r0 + 9)); g.stroke(); }
    g.restore();
  }
  function crujidos(g, t, p) {
    const cu = G.aPantalla(p, G.tronco(p)({ x: 250, y: 262 }));
    for (const [t0, lado] of [[T.cuello0 + 0.27, -1], [T.cuello0 + 0.52, 1]]) {
      const k = fase(t, t0, t0 + 0.16); if (k <= 0 || k >= 1) continue;
      g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2.5; g.lineCap = "round";
      for (let i = -1; i <= 1; i++) { const a = (lado < 0 ? Math.PI : 0) + i * 0.45, r0 = 30 + 8 * k; g.beginPath(); g.moveTo(cu.x + Math.cos(a) * r0, cu.y - 10 + Math.sin(a) * r0); g.lineTo(cu.x + Math.cos(a) * (r0 + 10), cu.y - 10 + Math.sin(a) * (r0 + 10)); g.stroke(); }
      g.restore();
    }
  }
  function chispasMaquina(g, t) {
    if (t < T.golpe + 0.95 || t > T.muere + 0.4) return;
    const { P } = MAQ;
    g.save(); g.lineCap = "round";
    for (let r = 0; r < 3; r++) {
      const ciclo = 0.45 + r * 0.17, ph = ((t - T.golpe) / ciclo + r * 0.3) % 1, sem = Math.floor((t - T.golpe) / ciclo + r * 0.3) * 7 + r;
      if (ph > 0.35) continue;
      const ox = P.x + 30 + hash(sem) * 130, oy = P.y + 4 + hash(sem + 1) * 70, k = ph / 0.35;
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (hash(sem + i + 2) - 0.5) * 2.4, d = 14 + 40 * k * (0.5 + hash(sem + i + 9));
        g.strokeStyle = i % 2 ? "#fff6c0" : "#ffb02e"; g.globalAlpha = 1 - k; g.lineWidth = 2;
        g.beginPath(); g.moveTo(ox + Math.cos(a) * d * 0.5, oy + Math.sin(a) * d * 0.5 + 60 * k * k); g.lineTo(ox + Math.cos(a) * d, oy + Math.sin(a) * d + 60 * k * k); g.stroke(); }
    }
    g.restore();
  }
  function humo(g, t) {
    if (t < T.golpe + 1.1) return;
    const { P } = MAQ, fuerza = t < T.muere ? 0.7 : 1.1 * Math.exp(-(t - T.muere) * 0.5);
    g.save();
    for (let i = 0; i < 8; i++) {
      const ph = ((t - T.golpe) * 0.45 + i / 8) % 1;
      const x = P.x + 50 + hash(i + 400) * 90 + Math.sin(t * 1.5 + i) * 10 + ph * 30, y = P.y - 70 - ph * 170;
      g.globalAlpha = Math.sin(Math.PI * ph) * 0.45 * fuerza; g.fillStyle = i % 2 ? "#bdb8b3" : "#8f8a86";
      g.beginPath(); g.arc(x, y, 12 + 26 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function estrellitas(g, t, p) {
    const k = tramo(t, T.zas + 0.15, T.zas + 0.45) * (1 - tramo(t, T.fin - 0.4, T.fin)); if (k <= 0.01) return;
    const c = G.aPantalla(p, G.cabeza(p).a({ x: 790, y: 330 }));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 62, y: c.y - 30 + Math.sin(a) * 16, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) {
      const r = (9 + 3 * q.z) * k;
      estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    }
    g.restore();
  }
  function polvo(g, t) {
    const k = fase(t, T.sienta - 0.05, T.sienta + 0.9); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 8; i++) { const lado = i % 2 ? 1 : -1, d = (30 + 80 * salida(k)) * (0.6 + hash(i + 500) * 0.6);
      g.globalAlpha = 0.4 * (1 - k); g.fillStyle = "#c9a27a";
      g.beginPath(); g.ellipse(XG + 10 + lado * d, SUELO - 8 - 20 * k * hash(i + 501), 14 + 20 * k, 8 + 10 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- decorado ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.fillStyle = "#0c2529"; g.fillRect(0, 0, c.width, c.height); g.translate(40, 60);
    const pared = g.createLinearGradient(0, 0, 0, 440); pared.addColorStop(0, "#0c2529"); pared.addColorStop(1, "#1d5257");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 500);
    g.strokeStyle = "rgba(255,255,255,0.045)"; g.lineWidth = 1;
    for (let y = 18; y < 440; y += 26) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); const off = (y / 26) % 2 ? 0 : 26;
      for (let x = off - 52; x < W + 40; x += 52) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); } }
    const foco = g.createRadialGradient(470, 300, 20, 470, 300, 480);
    foco.addColorStop(0, "rgba(140,214,200,0.5)"); foco.addColorStop(0.5, "rgba(80,160,155,0.2)"); foco.addColorStop(1, "rgba(40,110,110,0)");
    g.fillStyle = foco; g.fillRect(-40, -60, W + 80, 500);
    for (const lx of [190, 840]) {
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, -60); g.lineTo(lx, 46); g.stroke();
      const halo = g.createRadialGradient(lx, 66, 4, lx, 66, 150); halo.addColorStop(0, "rgba(255,206,120,0.55)"); halo.addColorStop(1, "rgba(255,190,100,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 66, 150, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#151417"; g.beginPath(); g.moveTo(lx - 34, 72); g.quadraticCurveTo(lx, 30, lx + 34, 72); g.closePath(); g.fill();
      g.fillStyle = "#ffe2a6"; g.beginPath(); g.ellipse(lx, 72, 26, 7, 0, 0, Math.PI * 2); g.fill();
    }
    const mad = g.createLinearGradient(0, 440, 0, SUELO); mad.addColorStop(0, "#4a2b1b"); mad.addColorStop(1, "#2e1a10");
    g.fillStyle = mad; g.fillRect(-40, 440, W + 80, SUELO - 440);
    g.fillStyle = "#7b4a2b"; g.fillRect(-40, 432, W + 80, 12); g.fillStyle = "#9a6038"; g.fillRect(-40, 432, W + 80, 3);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, 444, W + 80, 5);
    g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 2;
    for (let x = -14; x < W + 40; x += 74) { g.beginPath(); g.moveTo(x, 449); g.lineTo(x, SUELO); g.stroke(); }
    const su = g.createLinearGradient(0, SUELO, 0, H); su.addColorStop(0, "#5a3520"); su.addColorStop(1, "#2a160c");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.fillStyle = "rgba(255,210,150,0.18)"; g.fillRect(-40, SUELO, W + 80, 2);
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 680); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tension = tramo(t, T.carga0, T.golpe, suave) * (1 - tramo(t, T.golpe + 0.3, T.acerca0, suave));
    const golpe = t >= T.golpe ? Math.exp(-(t - T.golpe) * 5) * suave(fase(t, T.golpe, T.golpe + 0.04)) : 0;
    const zas = t >= T.zas ? Math.exp(-(t - T.zas) * 5) * suave(fase(t, T.zas, T.zas + 0.04)) : 0;
    const suelo = tramo(t, T.cae0, T.sienta + 0.6, suave);
    return { k: 1 + 0.08 * tension + 0.05 * golpe + 0.06 * zas + 0.05 * suelo, x: 512 - 20 * tension - 30 * suelo, y: 300 + 10 * tension + 18 * suelo };
  }

  class GuillermoMaquina extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!MAQ) preparaMaquina();
      const p = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.golpe ? 6 * Math.exp(-(t - T.golpe) * 6) : 0) + (t >= T.zas ? 9 * Math.exp(-(t - T.zas) * 6) : 0) + (t >= T.sienta ? 4 * Math.exp(-(t - T.sienta) * 7) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -60);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.38)";
      g.beginPath(); g.ellipse(p.x + 10, SUELO + 1, t > T.cae0 ? 150 : 110, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(MAQ.P.x + 100, SUELO + 2, 120, 10, 0, 0, Math.PI * 2); g.fill(); g.restore();
      const { ranura } = maquina(g, t);
      humo(g, t);
      G.dibujar(g, p, t);
      saco(g, t);
      if (t > T.lanza && t < T.encaja) { const q = pose(T.lanza); moneda(g, t, G.aPantalla(q, q.manoLejos), ranura); }
      tintineo(g, t, ranura);
      crujidos(g, t, p);
      const bola = posSaco(T.golpe);
      impacto(g, t, T.golpe, bola.x - 18, bola.y, 44);
      if (t >= T.zas) impacto(g, t, T.zas, MAQ.coco.x, MAQ.coco.y - 6, 58);
      chispasMaquina(g, t);
      estrellitas(g, t, p);
      polvo(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00004", nombre: "Guillermo contra la máquina", crear: () => new GuillermoMaquina() });
  window.__A2D_00004 = { pose, T, DUR, posSaco: t => (MAQ || preparaMaquina(), posSaco(t)) };
})();
