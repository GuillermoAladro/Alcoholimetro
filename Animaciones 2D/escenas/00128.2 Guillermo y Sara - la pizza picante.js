"use strict";
/* 00128.2 · Guillermo y Sara · La salsa picante
 *
 * Negro → una pizzería de porciones, de madrugada: azulejo blanco, un ventanal a la calle de noche,
 * el horno de acero con las puertas encendidas y una pila de cajas, un neón de una porción y otro de
 * una guindilla (sin letras), un reloj sin números que marca las dos y pico. Guillermo y Sara, de pie
 * en una mesita alta con mantel de cuadros, cada uno con su porción en el plato; en medio, un bote de
 * salsa picante (etiqueta con una calavera, sin letras); junto a Sara, un cartón de leche con
 * manchas de vaca.
 *
 * Sara coge el bote, lo pone boca abajo y se pone perdida la porción a sacudidas; Guillermo flipa. Le
 * deja el bote delante, levanta una ceja y le da un mordisco enorme (hilo de queso) sin pestañear.
 * Guillermo, picado, se hace el chulo: coge el bote y, con la lengua fuera y muchísimo cuidado, deja
 * caer UNA gota en su porción (primer plano); mira a cámara orgulloso, muerde y mastica sobrado…
 * para. Se le ponen los ojos como platos, se pone rojo del cuello a la frente, suelta la porción, le
 * sale vapor por la oreja y humo por los pinchos, llora a chorros y echa una llamarada hacia arriba
 * (a Sara solo se le mueve el pelo). Se abanica la boca dando saltitos. Sara deja su porción y, sin
 * mirarle casi, le desliza el cartón de leche por la mesa; vuelve a su porción y le da otro mordisco.
 * Él se lo bebe entero de un trago, cabeza atrás, lo aplasta y lo deja: el rojo baja, suspira, le
 * queda un bigote de leche. Sara le ofrece otra vez el bote; él dice que no con la cabeza y la mano
 * y mira a cámara; ella se encoge de hombros, le echa dos sacudidas más a lo suyo y mira a cámara
 * con media sonrisa → negro.
 *
 * Todo depende de `t` (determinista). Los objetos que van de la mesa a la mano se dibujan con la misma
 * función y en la misma posición en los dos sitios; la mano sigue al objeto mientras lo sujeta.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, Sa = SaraSaez;
  const DUR = 14.6;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };

  /* ---------- guion (s) ---------- */
  const T = {
    // Sara se empapa la porción
    sVa: 0.6, sCoge: 0.98, sAlza: 1.34, sac0: 1.38, sDeja0: 2.7, sDeja: 3.06,
    sReta: 3.06, sPCoge: 3.44, sBoca1: 3.72, sMuerde1: 3.8, sAparta1: 3.92,
    // Guillermo: pasmo, reto y UNA gota
    gMira: 0.9, gPasmo: 1.62, gBotella: 3.02, gChulo: 3.3,
    gBVa: 3.5, gBCoge: 3.84, gAlza: 4.22, gInv0: 4.3, gInv1: 4.86, gota0: 4.86, gota1: 5.26, gotaCae: 5.38, gEnd0: 5.46, gEnd1: 5.72, gDeja: 5.98,
    gOrgullo: 6.02, gPCoge: 6.36, gBoca: 6.62, gMuerde: 6.7, gAparta: 6.8,
    pausa: 7.34, pica: 7.5, suelta: 7.6, sueltaFin: 7.84, rojo0: 7.55, rojo1: 8.3, vapor: 7.86, humo: 7.96, lagr: 8.02,
    atras: 8.26, fuego0: 8.4, fuego1: 9.06, abanica0: 9.1, abanica1: 10.26,
    // Sara le pasa la leche y sigue comiendo
    sPDeja0: 9.0, sPDeja: 9.26, sCToca: 9.55, sCSuelta: 9.9, cartonLlega: 10.25,
    sPCoge2: 10.26, sBoca2: 10.52, sMuerde2: 10.6, sAparta2: 10.7,
    // Guillermo se bebe el cartón de un trago
    gVe: 10.1, gCVa: 10.26, gCCoge: 10.5, gCBoca: 10.74, trago0: 10.76, trago1: 11.46, aplasta0: 11.47, aplasta1: 11.64,
    gCDeja: 11.98, gCSuelta: 12.04, bigote: 11.6, rojoBaja0: 10.9, rojoBaja1: 11.9, alivio: 11.8,
    // final: el bote otra vez
    sPDeja2_0: 11.84, sPDeja2: 12.08, sBCoge2: 12.4, ofrece: 12.74, ofreceFin: 13.08, sInv2: 13.36, sac2: 13.4,
    gVeBote: 12.5, gNo0: 12.56, gNo1: 13.22, gCamara: 13.3, sCamara: 13.46,
    fin: 14.05
  };
  // sacudidas: golpe rápido hacia abajo (a lo largo del bote) y vuelta despacio; la gota sale en el pico
  const SAC1 = { t0: T.sac0, n: 7, per: 0.18 }, SAC2 = { t0: T.sac2, n: 2, per: 0.18 };
  T.sac1 = SAC1.t0 + SAC1.n * SAC1.per;
  const PICO = 0.32;
  function sacudida(t, S) {
    const u = (t - S.t0) / S.per; if (u <= 0 || u >= S.n) return 0;
    const f = u % 1; return f < PICO ? salida(f / PICO) : 1 - suave((f - PICO) / (1 - PICO));
  }
  const picos = S => Array.from({ length: S.n }, (_, i) => S.t0 + (i + PICO) * S.per);

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJA = D(0.6, 0.7, 0.66, 0.62, 0.58), AGARRA = D(0.32, 0.14, 0.12, 0.12, 0.12), PINZA = D(0.4, 0.32, 0.14, 0.12, 0.12),
    PUNO = D(0, 0, 0, 0, 0), ABIERTA = D(0.95, 1, 1, 1, 1), EMPUJA = D(0.85, 0.9, 0.86, 0.82, 0.78), MESA = D(0.55, 0.8, 0.76, 0.72, 0.68),
    ABANICO = D(0.9, 1, 1, 0.98, 0.95);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: clamp(e.mof), rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  // masticar: la boca abre y cierra (0..1) entre t0 y t1
  const mastica = (t, t0, t1, f = 13) => { const k = dentro(t, t0, t0 + 0.1, t1 - 0.12, t1); return k * (0.5 + 0.5 * Math.sin((t - t0) * f - Math.PI / 2)); };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.31, SUELO = 560, XG = 392, XS = 634;
  const MESA_T = { x: 516, y: 338, rx: 98, ry: 21 };            // tablero (mantel)
  const PLATO_G = { x: 470, y: 345 }, PLATO_S = { x: 562, y: 346 };

  /* =====================================================================================
   * PISTAS (pantalla): [t0, t1, objetivo, curva] — objetivo: objeto o función (t) → objeto.
   * Se mezclan los campos numéricos; a, b y mu como ángulos; d (dedos) dedo a dedo.
   * ===================================================================================== */
  const ANG = { a: 1, b: 1, mu: 1 };
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  function mezclaO(x, y, k) {
    const o = Object.assign({}, x);
    for (const n in y) {
      if (x[n] === undefined) { o[n] = y[n]; continue; }
      if (n === "d") o[n] = mezclaD(x[n], y[n], k);
      else if (ANG[n]) o[n] = lerpAng(x[n], y[n], k);
      else if (typeof y[n] === "number") o[n] = lerp(x[n], y[n], k);
      else o[n] = k < 0.5 ? x[n] : y[n];
    }
    return o;
  }
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaO(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: 1, dedos: m.d, dobla, objeto };
  }
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }

  /* =====================================================================================
   * EL BOTE DE SALSA (pantalla): {x, y} = punto de agarre; b = ángulo del eje hacia el tapón;
   * mu = el de la mano que lo sujeta. Eje local: base en x = −6, tapón hasta x = 32.
   * ===================================================================================== */
  const EB = 1.25, BOTE_BASE = 8 * EB, BOTE_PUNTA = 32.2 * EB;
  const enMesaB = (x, yBase, mu) => ({ x, y: yBase - BOTE_BASE, b: -Math.PI / 2, mu });
  const BOTE0 = enMesaB(509, 327, -0.15), BOTE1 = enMesaB(500, 332, -0.1), BOTE2 = enMesaB(513, 336, 2.5);
  const SAC_S = { x: 556, y: 288, b: 1.35, mu: 1.0 };            // boca abajo sobre su porción
  const ALZA_G = { x: 484, y: 292, b: -Math.PI / 2 + 0.08, mu: 2.5 };
  const INV_G = { x: 486, y: 272, b: 1.76, mu: 2.15 };
  const OFRECE_S = { x: 532, y: 266, b: -2.25, mu: 0.4 };
  const VUELVE_S = { x: 557, y: 289, b: 1.35, mu: 1.0 };
  function boteT(t) {
    const sac = sacudida(t, SAC1) + sacudida(t, SAC2);
    const L = [
      [0, 0, BOTE0],
      [T.sCoge, T.sAlza, SAC_S],
      [T.sDeja0, T.sDeja, BOTE1],
      [T.sDeja + 0.1, T.gBVa, { mu: 2.5 }],
      [T.gBCoge, T.gAlza, ALZA_G],
      [T.gInv0, T.gInv1, () => ({...INV_G,x:puntoPorcion(SG0,GOTA_LOC).x-Math.cos(INV_G.b)*BOTE_PUNTA}), x => suave(suave(x))],
      [T.gEnd0, T.gEnd1, ALZA_G],
      [T.gEnd1, T.gDeja, BOTE2],
      [T.gDeja + 0.1, T.sBCoge2 - 0.1, { mu: -0.15 }],
      [T.sBCoge2, T.ofrece, OFRECE_S],
      [T.ofreceFin, T.sInv2, VUELVE_S]
    ];
    const o = pista(L, t);
    // sacudidas a lo largo del eje
    if (sac > 0) { o.x += Math.cos(o.b) * 9 * sac; o.y += Math.sin(o.b) * 9 * sac; o.b += 0.08 * sac; }
    // pulso tembloroso de Guillermo con el bote boca abajo
    const tiem = dentro(t, T.gInv0, T.gInv0 + 0.2, T.gotaCae, T.gotaCae + 0.1);
    if (tiem > 0) { o.x += 0.6 * tiem * Math.sin(t * 41); o.y += 0.4 * tiem * Math.sin(t * 33 + 1); o.b += 0.02 * tiem * Math.sin(t * 29); }
    // Sara lo menea al ofrecerlo
    const men = dentro(t, T.ofrece, T.ofrece + 0.06, T.ofreceFin - 0.05, T.ofreceFin);
    if (men > 0) o.b += 0.2 * men * Math.sin((t - T.ofrece) * 15);
    o.quien = t >= T.sCoge && t < T.sDeja ? "s" : t >= T.gBCoge && t < T.gDeja ? "g" : t >= T.sBCoge2 ? "s" : "mesa";
    return o;
  }
  const boquilla = o => ({ x: o.x + Math.cos(o.b) * BOTE_PUNTA, y: o.y + Math.sin(o.b) * BOTE_PUNTA });

  function bote(g, o) {
    g.save(); g.translate(o.x, o.y); g.rotate(o.b); g.scale(EB, EB); g.lineJoin = "round"; g.lineCap = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(-6, -6.5); g.lineTo(17, -6.5); g.quadraticCurveTo(20.5, -6.5, 21.5, -2.6); g.lineTo(26, -2.6);
      g.lineTo(26, 2.6); g.lineTo(21.5, 2.6); g.quadraticCurveTo(20.5, 6.5, 17, 6.5); g.lineTo(-6, 6.5); g.quadraticCurveTo(-8, 6.5, -8, 4.5);
      g.lineTo(-8, -4.5); g.quadraticCurveTo(-8, -6.5, -6, -6.5); g.closePath(); };
    // vidrio con la salsa (rojo oscuro) y un brillo
    cuerpo(); g.fillStyle = "#8e0f14"; g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "#b8161c"; g.fillRect(-9, -6.5, 36, 5.5);
    g.fillStyle = "rgba(255,210,200,0.6)"; g.fillRect(-5, -4.8, 21, 1.5);
    g.restore();
    // etiqueta crema con una calavera (sin letras)
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "#f2e6c6"; g.fillRect(4, -7, 12, 14);
    g.fillStyle = "#c21a1a"; g.fillRect(4, -7, 1.1, 14); g.fillRect(14.9, -7, 1.1, 14);
    g.restore();
    // calavera: «arriba» = hacia el tapón (+x)
    g.save(); g.translate(10.2, 0);
    g.strokeStyle = "#1c1416"; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(-3.6, -3.8); g.lineTo(3.2, 3.8); g.moveTo(-3.6, 3.8); g.lineTo(3.2, -3.8); g.stroke();
    g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(1.2, 0, 3.1, 0, TAU); g.fill(); g.lineWidth = 0.7; g.stroke();
    g.beginPath(); g.rect(-2.4, -1.7, 2.2, 3.4); g.fill(); g.stroke();
    g.fillStyle = "#1c1416"; g.beginPath(); g.arc(1.1, -1.25, 0.95, 0, TAU); g.arc(1.1, 1.25, 0.95, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-0.2, 0); g.lineTo(-1, -0.45); g.lineTo(-1, 0.45); g.closePath(); g.fill();
    g.lineWidth = 0.45; g.beginPath(); g.moveTo(-2.4, -0.6); g.lineTo(-0.3, -0.6); g.moveTo(-2.4, 0.6); g.lineTo(-0.3, 0.6); g.stroke();
    g.restore();
    cuerpo(); g.lineWidth = 1.3; g.strokeStyle = TINTA; g.stroke();
    // tapón con estrías y boquilla
    g.fillStyle = "#1f1c1e"; g.beginPath(); g.roundRect(25, -3.4, 5.4, 6.8, 1); g.fill(); g.stroke();
    g.strokeStyle = "#57525a"; g.lineWidth = 0.6; for (const x of [26.4, 27.8, 29.2]) { g.beginPath(); g.moveTo(x, -2.8); g.lineTo(x, 2.8); g.stroke(); }
    g.fillStyle = "#2b2729"; g.strokeStyle = TINTA; g.lineWidth = 1; g.beginPath(); g.moveTo(30.4, -1.5); g.lineTo(32.2, -0.8); g.lineTo(32.2, 0.8); g.lineTo(30.4, 1.5); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * EL CARTÓN DE LECHE (pantalla): {x, y} agarre (centro del cuerpo); b = eje hacia el tejado;
   * ap = aplastado (0..1). Cuerpo de x = −12 a 12; tejado hasta 19 y la aleta hasta 21.
   * ===================================================================================== */
  const EC = 1.4, C_AG = 7, CART_MED = (12 - C_AG) * EC;   // se agarra cerca de la base
  const enMesaC = (x, yBase, mu, ap = 0) => ({ x, y: yBase - CART_MED * (1 - 0.15 * ap), b: -Math.PI / 2, mu, ap });
  const CARTON2 = enMesaC(499, 329, -2.6, 1);
  const C_X0 = 535, C_Y0 = 320, C_X1 = 494, C_Y1 = 329;
  function cartonMesa(t) {
    // empujado por Sara (acelera y luego frena hasta pararse delante de Guillermo)
    const u = fase(t, T.sCToca, T.cartonLlega);
    const k = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
    const o = enMesaC(lerp(C_X0, C_X1, k), lerp(C_Y0, C_Y1, k), -2.75);
    // bailoteo al pararse
    const v = t - T.cartonLlega; if (v > 0 && v < 0.5) o.b += 0.08 * Math.exp(-v * 10) * Math.sin(v * 40);
    o.mu = -2.75;
    return o;
  }
  function materialCarton(o,x,y) {
    const ap=o.ap||0, v=rotP(P((x+C_AG)*EC*(1-0.15*ap),y*EC),o.b);
    return P(o.x+v.x,o.y+v.y);
  }
  const picoCarton=o=>materialCarton(o,19,8.5*0.95*(1-0.62*(o.ap||0)));
  const ladoCarton=o=>materialCarton(o,-1,8.5*(1-0.62*(o.ap||0)));
  function cartonT(t, p) {
    if (t<T.gCCoge || !p) return {...cartonMesa(t),quien:"mesa"};
    let o;
    if(t<T.gCBoca)o=mezclaO(cartonMesa(T.gCCoge),bebe(t,p),tramo(t,T.gCCoge,T.gCBoca));
    else if(t<=T.aplasta1+0.04)o=bebe(t,p);
    else {
      const t0=T.aplasta1+0.04;
      // La posición de salida es la del último contacto con los labios.
      const inicio=bebe(t0,poseG(t0));
      o=mezclaO(inicio,CARTON2,tramo(t,t0,T.gCDeja));
    }
    o.quien=t<T.gCDeja?"g":"mesa";
    return o;
  }
  function bebe(t,p) {
    const m=G.aPantalla(p,G.boca(p)),u=fase(t,T.trago0,T.trago1);
    const ap=tramo(t,T.aplasta0,T.aplasta1);
    const o={x:0,y:0,b:lerp(2.45,1.78,suave(u)),mu:lerp(0.95,0.7,u),ap:Math.min(1,ap+0.06*tragoPulso(t)*(1-ap))};
    const punta=picoCarton(o);o.x=m.x-punta.x;o.y=m.y-punta.y;
    return o;
  }
  const tragoPulso = t => { if (t < T.trago0 || t > T.trago1) return 0; const u = fase(t, T.trago0, T.trago1) * 5; return Math.sin(Math.PI * (u % 1)) ** 2; };

  const MANCHAS_VACA = [[-6, -3.6, 3.4, 2.4, 0.4], [4.5, 3, 3.6, 2.6, -0.5], [-1.5, 5.4, 2, 1.4, 0.2], [8.6, -4.8, 2.3, 1.8, 0.8], [-9.5, 4, 1.6, 1.2, 0]];
  function carton(g, o) {
    const ap = o.ap || 0, sx = 1 - 0.15 * ap, sy = 1 - 0.62 * ap;
    g.save(); g.translate(o.x, o.y); g.rotate(o.b); g.scale(EC * sx, EC); g.translate(C_AG, 0); g.lineJoin = "round"; g.lineCap = "round";
    const hw = 8.5 * sy;
    // contorno del cuerpo (con dientes al aplastarlo)
    const lado = (s) => { const pts = []; for (let i = 0; i <= 8; i++) { const x = -12 + 24 * i / 8, z = (i % 2 ? 1 : -1) * 1.8 * ap * (i > 0 && i < 8 ? 1 : 0); pts.push(P(x, s * (hw + z))); } return pts; };
    const arriba = lado(-1), abajo = lado(1);
    const cuerpo = () => { g.beginPath(); g.moveTo(arriba[0].x, arriba[0].y); for (const q of arriba) g.lineTo(q.x, q.y); for (let i = abajo.length - 1; i >= 0; i--) g.lineTo(abajo[i].x, abajo[i].y); g.closePath(); };
    cuerpo(); g.fillStyle = "#f8f7f1"; g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "rgba(170,190,215,0.45)"; g.fillRect(-13, hw * 0.35, 26, hw);
    g.fillStyle = "#1b1a1c";
    for (const [x, y, rx, ry, r] of MANCHAS_VACA) { g.beginPath(); g.ellipse(x, y * sy, rx, ry * Math.max(0.5, sy), r, 0, TAU); g.fill(); }
    g.fillStyle = "#2f74c8"; g.fillRect(-13, -hw - 2, 3.2, 2 * hw + 4);
    // pliegues al aplastarlo
    if (ap > 0.05) { g.strokeStyle = `rgba(90,100,120,${0.7 * ap})`; g.lineWidth = 0.8; for (const x of [-7, -1, 5]) { g.beginPath(); g.moveTo(x, -hw); g.lineTo(x + 3, 0); g.lineTo(x, hw); g.stroke(); } }
    g.restore();
    cuerpo(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke();
    // tejado azul (a dos aguas, visto de frente) con la espita abierta y la aleta
    const tw = hw;
    g.beginPath(); g.moveTo(12, -tw); g.lineTo(18.5 - 2 * ap, -1.2 * sy); g.lineTo(18.5 - 2 * ap, 1.2 * sy); g.lineTo(12, tw); g.closePath();
    g.fillStyle = "#2f74c8"; g.fill(); g.stroke();
    g.fillStyle = "#245fa8"; g.beginPath(); g.moveTo(12, 0); g.lineTo(18.5 - 2 * ap, 1.2 * sy); g.lineTo(12, tw); g.closePath(); g.fill();
    g.fillStyle = "#f8f7f1"; g.beginPath(); g.moveTo(14.2, -2.2 * sy); g.quadraticCurveTo(15.6, -0.6 * sy, 14.9, 0.4 * sy); g.quadraticCurveTo(13.7, 0.2 * sy, 14.2, -2.2 * sy); g.fill();
    g.fillStyle = "#2f74c8"; g.beginPath(); g.rect(18.5 - 2 * ap, -1.4 * sy, 2.4, 2.8 * sy); g.fill(); g.stroke();
    // espita abierta (el pico por el que bebe)
    g.fillStyle = "#e8e6de"; g.beginPath(); g.moveTo(15.5, tw * 0.55); g.lineTo(19, tw * 0.95); g.lineTo(13.5, tw * 1.05); g.closePath(); g.fill(); g.lineWidth = 0.9; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * PORCIONES (pantalla): {x, y} = el centro de la corteza; a = eje hacia la punta; ap = aplastado
   * (tumbada en el plato ~0,42; en la mano 1); com = parte comida desde la punta (0..1).
   * La mano la sujeta por la corteza: centro de la mano = corteza + 10·(cos mu, sin mu).
   * ===================================================================================== */
  const EP = 1.33, PL = 30, PHW = 12, R_PZ = 10;
  const PEPERONI = [[8, -5, 3.3], [16.5, 3.4, 3.1], [23, -1.2, 2.5], [5.5, 5.2, 2.6]];
  // manchas de salsa (local): x, y, r — cada gota de Sara añade una
  const SALSA = [[13, -1.5, 6.2], [7, 4, 5.8], [20, 1.5, 5], [6, -5, 5.6], [16, -5.5, 4.6], [25, -0.5, 3.6], [11, 4.5, 5.4], [5, 0, 5], [9, -2, 4.6]];
  const anchoEn = x => PHW * (1 - x / PL);
  const GOTA_LOC=P(24.8,0);
  function puntoPorcion(s,q) {
    const r=rotP(P(EP*q.x,EP*(s.ap??1)*q.y),s.a);
    return P(s.x+r.x,s.y+r.y);
  }
  function perfilBocado(com) {
    const xc=PL*(1-com), w=Math.max(0.05,anchoEn(xc)), prof=Math.min(5.2,w*0.65);
    return {xc,w,prof,borde:xc-0.35*prof};
  }
  function porcion(g, s, t) {
    const com = s.com || 0, xc = PL * (1 - com);
    g.save(); g.translate(s.x, s.y); g.rotate(s.a); g.scale(EP, EP * s.ap); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(0, -PHW); g.quadraticCurveTo(PL * 0.52, -PHW * 0.52, PL, 0); g.quadraticCurveTo(PL * 0.52, PHW * 0.52, 0, PHW); g.closePath(); };
    // mordiscos: dos bocados redondos
    const {w,prof,borde}=perfilBocado(com);
    const arco=()=>{g.quadraticCurveTo(xc-2*prof,-w*0.5,borde,0);g.quadraticCurveTo(xc-2*prof,w*0.5,xc,w);};
    const bocados=()=>{g.moveTo(xc,-w);arco();};
    if(com>0.001){g.beginPath();g.moveTo(-14,-30);g.lineTo(xc,-30);g.lineTo(xc,-w);arco();
      g.lineTo(xc,30);g.lineTo(-14,30);g.closePath();g.clip();}
    // queso
    forma(); g.fillStyle = "#f6c548"; g.fill();
    g.save(); forma(); g.clip();
    g.fillStyle = "#fbe190"; for (const [x, y, r] of [[11, 1, 3], [19, -2, 2.4], [4, -2, 2.2], [14, 6, 2]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0.4, 0, TAU); g.fill(); }
    g.strokeStyle = "rgba(214,138,40,0.55)"; g.lineWidth = 2.2; forma(); g.stroke();
    for (const [x, y, r] of PEPERONI) {
      g.fillStyle = "#c23a2a"; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      g.fillStyle = "#8a1f17"; g.beginPath(); g.arc(x + r * 0.15, y + r * 0.2, r * 0.8, 0.2, 2.6); g.fill();
      g.fillStyle = "rgba(255,200,170,0.65)"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, TAU); g.fill();
    }
    // salsa picante
    const sal = s.salsa || 0;
    for (let i = 0; i < SALSA.length; i++) {
      const k = clamp(sal - i); if (k <= 0) break;
      const [x, y, r] = SALSA[i], rr = r * salida(k);
      g.fillStyle = "rgba(196,18,10,0.94)"; g.beginPath(); g.ellipse(x, y, rr, rr * 0.82, hash(i) * 3, 0, TAU); g.fill();
      for (let j = 0; j < 3; j++) { const an = hash(i * 3 + j) * TAU, d = rr * (0.9 + 0.3 * hash(i + j * 7)); g.beginPath(); g.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, 1.2 * k, 0, TAU); g.fill(); }
      g.fillStyle = `rgba(255,170,150,${0.7 * k})`; g.beginPath(); g.ellipse(x - rr * 0.3, y - rr * 0.35, rr * 0.3, rr * 0.16, -0.5, 0, TAU); g.fill();
    }
    // la gota de Guillermo (¡una!)
    if (s.gota > 0.001) {
      const k = s.gota; g.fillStyle = "#c4120a"; g.beginPath(); g.ellipse(GOTA_LOC.x, GOTA_LOC.y, 1.9 * k, 1.30 * k, 0, 0, TAU); g.fill();
      g.fillStyle = "rgba(255,190,170,0.85)"; g.beginPath(); g.arc(GOTA_LOC.x-0.4, GOTA_LOC.y-0.3, 0.45 * k, 0, TAU); g.fill();
    }
    // el borde del mordisco (queso de dentro, más claro)
    if (com > 0.001) { g.beginPath(); bocados(); g.lineWidth = 1.6; g.strokeStyle = "#e9a83a"; g.stroke(); }
    g.restore();
    forma(); g.lineWidth = 1.1; g.strokeStyle = "#3a2412"; g.stroke();
    if (com > 0.001) { g.save(); forma(); g.clip(); g.beginPath(); bocados(); g.lineWidth = 1.1; g.strokeStyle = "#3a2412"; g.stroke(); g.restore(); }
    // corteza
    g.fillStyle = "#d89a52"; g.beginPath(); g.roundRect(-4.2, -PHW - 1.2, 6, 2 * PHW + 2.4, 3); g.fill();
    g.fillStyle = "#f0c27e"; g.fillRect(-3.2, -PHW + 1, 1.6, 2 * PHW - 2);
    g.beginPath(); g.roundRect(-4.2, -PHW - 1.2, 6, 2 * PHW + 2.4, 3); g.lineWidth = 1.1; g.strokeStyle = "#3a2412"; g.stroke();
    g.restore();
  }
  // punta (lo que queda) y centro del borde mordido, en pantalla
  const puntaP=s=>puntoPorcion(s,P(perfilBocado(s.com||0).borde,0));
  const manoDePorcion = (s, d) => ({ x: s.x + Math.cos(s.mu) * R_PZ, y: s.y + Math.sin(s.mu) * R_PZ, mu: s.mu, d });

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const R_MG = G.MUNECA_R * G.JK;
  const bolsilloG = (p, x, y) => { const q = G.tronco(p)({ x: x - Math.cos(-1.75) * R_MG, y: y - Math.sin(-1.75) * R_MG }); return { x: q.x, y: q.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dobla: -1 }; };
  const CARAS_G = {
    inicio: E({ mx: 0.65, my: 0.7, c: 0.25, sd: 4, si: 4, sonr: 0.5, ancho: 1.05 }),
    mira: E({ mx: 0.85, my: 0.25, c: 0.1, sd: 8, gd: 0.04, si: 8, gi: 0.04, sonr: 0.25 }),
    pasmo: E({ mx: 0.8, my: 0.45, iris: 0.78, c: 0, sd: 28, gd: 0.15, si: 28, gi: 0.15, abre: 24, ancho: 0.62, sonr: -0.2 }),
    bote: E({ mx: 0.7, my: 0.55, iris: 0.9, c: 0, sd: 18, gd: 0.1, si: 22, gi: 0.12, abre: 6, ancho: 0.75, sonr: -0.1 }),
    chulo: E({ mx: 0.85, my: 0, c: 0.42, sd: 20, gd: 0.12, si: -4, gi: -0.08, abre: 0, ancho: 1.06, sonr: 0.68 }),
    concentra: E({ mx: 0.62, my: 0.85, c: 0.5, z: 0.25, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 7, ancho: 0.72, sonr: 0.05, lengua: 0.95 }),
    orgullo: E({ mx: -0.85, my: 0, c: 0.32, h: 0.35, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 8, ancho: 1.1, sonr: 0.92 }),
    abre: E({ mx: 0.6, my: 0.6, c: 0.15, sd: 12, si: 12, abre: 36, ancho: 1.02, sonr: 0.15 }),
    mastica: E({ mx: -0.85, my: 0, c: 0.4, h: 0.25, sd: 14, gd: 0.12, si: 14, gi: 0.1, abre: 0, ancho: 0.9, sonr: 0.62, mof: 0.2 }),
    congela: E({ mx: -0.85, my: 0, c: 0.15, sd: 12, gd: 0.1, si: 12, gi: 0.08, abre: 0, ancho: 0.9, sonr: 0.52, mof: 0.2 }),
    pica: E({ mx: 0.15, my: 0.1, iris: 0.48, c: 0, sd: 32, gd: -0.05, si: 32, gi: -0.05, abre: 6, ancho: 0.7, sonr: -0.55, mof: 0.3 }),
    arde: E({ mx: 0, my: 0, c: 0.9, z: 1, sd: -8, gd: -0.22, si: -8, gi: -0.22, abre: 20, ancho: 1.12, sonr: -0.45 }),
    fuego: E({ mx: 0.85, my: -0.6, c: 0.9, z: 1, sd: -4, gd: -0.2, si: -4, gi: -0.2, abre: 76, ancho: 1.3, sonr: -0.1, lengua: 0.3 }),
    jadea: E({ mx: 0.6, my: 0.1, iris: 0.6, c: 0.25, z: 0.4, sd: 22, gd: -0.1, si: 20, gi: -0.1, abre: 34, ancho: 0.95, sonr: -0.2, lengua: 1 }),
    ve: E({ mx: 0.65, my: 0.75, iris: 1.15, c: 0, sd: 26, gd: 0.12, si: 26, gi: 0.12, abre: 28, ancho: 0.82, sonr: 0.1, lengua: 0.7 }),
    bebe: E({ mx: 0.85, my: -0.5, c: 0.85, z: 0.6, sd: 10, gd: -0.15, si: 10, gi: -0.15, abre: 12, ancho: 0.62, sonr: -0.2 }),
    alivio: E({ mx: 0, my: 0, c: 1, h: 1, sd: 12, gd: 0.12, si: 12, gi: 0.12, abre: 14, ancho: 0.9, sonr: 0.55 }),
    mira2: E({ mx: 0.85, my: 0.05, c: 0.12, sd: 10, gd: 0.06, si: 10, gi: 0.06, abre: 2, ancho: 0.9, sonr: 0.3 }),
    no: E({ mx: 0.8, my: 0.1, iris: 0.85, c: 0, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 12, ancho: 0.8, sonr: -0.3 }),
    camara: E({ mx: -0.85, my: 0, iris: 0.92, c: 0.08, sd: 20, gd: 0.17, si: 20, gi: 0.17, abre: 4, ancho: 0.95, sonr: 0.3 })
  };
  const GUION_CARA_G = [
    [T.gMira, T.gMira + 0.3, "mira"], [T.gPasmo, T.gPasmo + 0.25, "pasmo"], [T.gBotella, T.gBotella + 0.2, "bote"], [T.gChulo, T.gChulo + 0.22, "chulo"],
    [T.gAlza, T.gInv0 + 0.1, "concentra"], [T.gOrgullo, T.gOrgullo + 0.22, "orgullo"], [T.gPCoge - 0.1, T.gBoca - 0.06, "abre"],
    [T.gMuerde, T.gMuerde + 0.1, "mastica"], [T.pausa, T.pausa + 0.08, "congela"], [T.pica, T.pica + 0.06, "pica", salida],
    [T.rojo0 + 0.35, T.atras, "arde"], [T.atras, T.fuego0, "fuego"], [T.fuego1, T.fuego1 + 0.15, "jadea"], [T.gVe, T.gVe + 0.1, "ve", salida],
    [T.gCCoge, T.trago0, "bebe"], [T.aplasta1, T.alivio, "jadea"], [T.alivio, T.alivio + 0.25, "alivio"], [T.alivio + 0.55, T.alivio + 0.75, "mira2"],
    [T.gVeBote, T.gVeBote + 0.12, "no", salida], [T.gCamara, T.gCamara + 0.25, "camara"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.1, cab: 0.08, dx: 0, dy: 0 }, mira: { torso: 0.05, cab: -0.02, dx: 0, dy: 0 },
    pasmo: { torso: -0.06, cab: -0.08, dx: -3, dy: -4 }, chulo: { torso: -0.07, cab: -0.1, dx: 0, dy: -6 },
    coge: { torso: 0.17, cab: 0.1, dx: 6, dy: 2 }, cuidado: { torso: 0.2, cab: 0.24, dx: 8, dy: 5 },
    orgullo: { torso: -0.04, cab: -0.08, dx: 0, dy: -4 }, come: { torso: 0.13, cab: 0.12, dx: 4, dy: 2 },
    mastica: { torso: 0.0, cab: -0.04, dx: 0, dy: -2 }, pica: { torso: -0.03, cab: 0.0, dx: 0, dy: -7 },
    fuego: { torso: -0.24, cab: -0.52, dx: -8, dy: -10 }, abanica: { torso: 0.05, cab: 0.04, dx: 0, dy: 0 },
    coge2: { torso: 0.16, cab: 0.06, dx: 6, dy: 2 }, bebe: { torso: -0.13, cab: -0.46, dx: -4, dy: -2 },
    alivio: { torso: -0.02, cab: -0.06, dx: 0, dy: 6 }, no: { torso: -0.1, cab: -0.04, dx: -8, dy: -2 }, final: { torso: -0.03, cab: -0.04, dx: -4, dy: 0 }
  };
  const GUION_CUERPO_G = [
    [T.gMira, T.gMira + 0.4, "mira"], [T.gPasmo, T.gPasmo + 0.3, "pasmo", salida], [T.gChulo, T.gChulo + 0.3, "chulo"],
    [T.gBVa, T.gBCoge, "coge"], [T.gAlza - 0.1, T.gInv0 + 0.2, "cuidado"], [T.gEnd1, T.gDeja, "coge"], [T.gOrgullo, T.gOrgullo + 0.3, "orgullo"],
    [T.gPCoge - 0.2, T.gBoca, "come"], [T.gAparta, T.gAparta + 0.3, "mastica"], [T.pica, T.pica + 0.12, "pica", salida],
    [T.atras, T.fuego0, "fuego", salida], [T.fuego1, T.fuego1 + 0.3, "abanica"], [T.gCVa, T.gCCoge, "coge2"], [T.gCCoge + 0.05, T.trago0 + 0.15, "bebe"],
    [T.aplasta1, T.alivio + 0.2, "alivio"], [T.gNo0, T.gNo0 + 0.25, "no", salida], [T.gNo1, T.gNo1 + 0.4, "final"]
  ];
  // saltitos mientras se abanica (pantalla, px hacia arriba)
  const SALTOS = [9.22, 9.56, 9.9];
  function salto(t) { let h = 0; for (const t0 of SALTOS) { const u = fase(t, t0, t0 + 0.28); if (u > 0 && u < 1) h = Math.max(h, 17 * Math.sin(Math.PI * u)); } return h; }
  function aterriza(t) { let k = 0; for (const t0 of SALTOS) k = Math.max(k, campana(t, t0 + 0.24, t0 + 0.4)); k = Math.max(k, campana(t, SALTOS[0] - 0.12, SALTOS[0] + 0.02)); return k; }
  const termometro = t => tramo(t, T.rojo0, T.rojo1, suave) * (1 - tramo(t, T.rojoBaja0, T.rojoBaja1, suave));
  const fuegoK = t => { const k = fase(t, T.fuego0, T.fuego1); if (k <= 0 || k >= 1) return 0; return salida(clamp(k / 0.2)) * (1 - entrada(clamp((k - 0.72) / 0.28))); };

  const cacheG = new Map();
  function poseG(t) {
    const k0 = t;
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 8) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const h = salto(t), at = aterriza(t);
    const tiembla = dentro(t, T.pica, T.pica + 0.1, T.atras, T.atras + 0.05);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx / S + 1.2 * tiembla * Math.sin(t * 47) / S, y: G.PELVIS.y + (b.dy - h + 5 * at) / S + respira * 1.4 },
      torso: b.torso + 0.012 * tiembla * Math.sin(t * 39), torsoEsc: { x: 1, y: 1 + respira * 0.005 - 0.02 * at }, piernas: {},
      cabeza: { ang: b.cab + 0.025 * tiembla * Math.sin(t * 43), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // masticar mueve la cabeza; tragar la sube un poco
    const mas = mastica(t, T.gMuerde + 0.02, T.pausa, 14);
    p.cabeza.dy += 2.2 * mas;
    p.cabeza.dy -= 3 * tragoPulso(t);
    // ¡no, no!: niega con la cabeza
    const no = dentro(t, T.gNo0, T.gNo0 + 0.1, T.gNo1 - 0.15, T.gNo1);
    p.cabeza.ang += 0.07 * no * Math.sin((t - T.gNo0) * 19); p.cabeza.dx += 4 * no * Math.sin((t - T.gNo0) * 19);
    // durante la llamarada la cabeza vibra
    const fk = fuegoK(t); p.cabeza.ang += 0.015 * fk * Math.sin(t * 61);
    // piernas: de pie; despegan con cada saltito
    const tob = G.SUELO - G.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: G.PELVIS.x - 52, y: tob - h / S }, ang: -0.18 * h / 17 };
    p.piernas.lejos = { tob: { x: G.PELVIS.x + 54, y: tob - 12 - h / S }, ang: -0.12 * h / 17 };
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    ex.mof += 0.18 * mas;
    // abre la boca para morder y la cierra de golpe
    ex.abre *= 1-dentro(t,T.gMuerde-0.01,T.gMuerde+0.055,T.gMuerde+0.08,T.gMuerde+0.16);
    ex.abre += 10*mas*tramo(t,T.gMuerde+0.07,T.gMuerde+0.14);
    // jadeo con la lengua fuera
    const jad = dentro(t, T.fuego1, T.fuego1 + 0.1, T.gCCoge, T.gCCoge + 0.1);
    ex.abre += 8 * jad * Math.sin(t * 15);
    // tragos: carrillos
    ex.mof += 0.55 * tragoPulso(t);
    p.cara = cara(ex, parpadeo(t, [0.42, 2.8, 5.62, 12.2, 13.6]));
    // estados de la cara (capas propias)
    const est = { term: termometro(t), sudor: dentro(t, T.pica + 0.1, T.pica + 0.4, T.rojoBaja0 + 0.3, T.rojoBaja1 + 0.2) + 0.5 * dentro(t, T.gNo0, T.gNo0 + 0.2, T.fin, T.fin + 1),
      bigote: tramo(t, T.bigote, T.bigote + 0.12), cd: p.cara.ojos.d, ci: p.cara.ojos.i, t };
    p.est = est;
    p.capaCabeza = (g, tt) => capaCaraG(g, tt, est);
    p.capaTronco = g => capaCuelloG(g, est);
    manosG(p, t);
    return p;
  }

  /* ---------- la porción de Guillermo ---------- */
  const SG0 = { x: 457, y: 346, a: 0, ap: 0.42, mu: -2.4, com: 0 };
  const SG1 = { x: 459, y: 346, a: 0.16, ap: 0.42, mu: -2.4 };
  const SOSTEN_G = { x: 463, y: 292, a: -1.85, ap: 1, mu: 1.29 };
  const A_MUERDE_G = -2.29;
  // la porción con la punta a `hueco` px de la boca (antes del mordisco: com = 0)
  function hastaLabios(rig,p,a,com,hueco) {
    const m=rig.aPantalla(p,rig.boca(p)), L=EP*perfilBocado(com).borde+hueco;
    return {x:m.x-Math.cos(a)*L,y:m.y-Math.sin(a)*L,a,ap:1,mu:a+Math.PI};
  }
  const muerdeG=(p,t,hueco)=>hastaLabios(G,p,A_MUERDE_G,comidoG(t),hueco);
  const comidoG = t => 0.3 * suave(fase(t, T.gMuerde, T.gMuerde + 0.08));
  function porcionGT(t, p) {
    let o;
    if (t < T.suelta) {
      o = pista([
        [0, 0, SG0],
        [T.gPCoge, T.gBoca, () => muerdeG(p,t,9)],
        [T.gBoca, T.gMuerde, () => muerdeG(p,t,0), entrada],
        [T.gAparta, T.gAparta + 0.3, SOSTEN_G]
      ], t);
    } else {
      // la suelta: cae girando al plato y rebota
      const u = fase(t, T.suelta, T.sueltaFin);
      o = { x: lerp(SOSTEN_G.x, SG1.x, u), y: lerp(SOSTEN_G.y, SG1.y, u * u), a: lerpAng(SOSTEN_G.a, SG1.a + TAU, u), ap: lerp(1, SG1.ap, suave(u)), mu: SG1.mu };
      const v = t - T.sueltaFin; if (v > 0 && v < 0.4) { o.y -= 4 * Math.exp(-v * 9) * Math.abs(Math.sin(v * 22)); o.a += 0.06 * Math.exp(-v * 9) * Math.sin(v * 22); }
    }
    o.com = comidoG(t);
    o.gota = t>=T.gotaCae ? 1 : 0;
    o.quien = t >= T.gPCoge && t < T.suelta ? "g" : t >= T.suelta && t < T.sueltaFin ? "aire" : "mesa";
    return o;
  }

  /* ---------- manos de Guillermo ---------- */
  const DOBLA_G = -1;                     // codo abajo
  const REPOSO_G = { x: 454, y: 333, mu: -2.25, d: MESA };
  const PANICO = { x: 458, y: 284, mu: 1.75, d: ABIERTA };
  function abanico(t, p) {
    const m = G.aPantalla(p, G.boca(p)), w = Math.sin((t - T.abanica0) * 19);
    return { x: m.x + 24 + 7 * w, y: m.y + 6, mu: 1.3 + 0.35 * w, d: ABANICO };
  }
  function noNo(t) {
    const w = Math.sin((t - T.gNo0) * 16) * dentro(t, T.gNo0 + 0.1, T.gNo0 + 0.2, T.gNo1 - 0.1, T.gNo1);
    return { x: 471 + 6 * w, y: 252, mu: 1.62 + 0.22 * w, d: ABIERTA };
  }
  function manosG(p, t) {
    const sG = porcionGT(t, p), cG = cartonT(t, p);
    p.porcion = sG; p.carton = cG;
    const deBote = () => { const o = boteT(t); return { x: o.x, y: o.y, mu: o.mu, d: AGARRA }; };
    const dePorcion = () => manoDePorcion(porcionGT(t,p),PINZA);
    const deCarton = () => { const o = cartonT(t, p); return { x: o.x, y: o.y, mu: o.mu, d: t > T.aplasta0 ? mezclaD(AGARRA, PUNO, suave(fase(t, T.aplasta0, T.aplasta1))) : AGARRA }; };
    const PL_ = [
      [0, 0, REPOSO_G],
      [T.gBVa, T.gBCoge, deBote],
      [T.gDeja + 0.02, T.gPCoge, dePorcion],
      [T.suelta, T.suelta + 0.22, PANICO, salida],
      [T.abanica0 - 0.12, T.abanica0 + 0.12, () => abanico(t, p)],
      [T.gCVa, T.gCCoge, deCarton],
      [T.gCSuelta, T.gCSuelta + 0.35, REPOSO_G],
      [T.gNo0, T.gNo0 + 0.22, () => noNo(t)],
      [T.gNo1, T.gNo1 + 0.35, REPOSO_G]
    ];
    const l = pista(PL_, t);
    // la mano abierta tiembla de pánico mientras arde
    const pan = dentro(t, T.suelta + 0.1, T.suelta + 0.25, T.abanica0 - 0.12, T.abanica0);
    if (pan > 0) { l.x += 1.6 * pan * Math.sin(t * 37); l.y += 1.2 * pan * Math.sin(t * 31 + 1); }
    // tamborilea en la mesa al principio
    const tam = dentro(t, 0.3, 0.5, T.gMira, T.gMira + 0.2);
    if (tam > 0) l.d = mezclaD(l.d, D(0.55, 0.62 + 0.25 * Math.max(0, Math.sin(t * 14)), 0.76, 0.72, 0.68), tam);
    let obj = null;
    const b = boteT(t);
    if (b.quien === "g") obj = g => conCamara(g, () => bote(g, b));
    else if (sG.quien === "g") obj = g => conCamara(g, () => porcion(g, sG, t));
    else if (cG.quien === "g") obj = g => conCamara(g, () => carton(g, cG));
    p.manoLejos = manoRig(G, p, l, DOBLA_G, obj);
    // mano cercana: en el bolsillo; sale a aletear mientras le pica
    const bols = bolsilloG(p, 131, 652);
    const ale = dentro(t, T.suelta, T.suelta + 0.25, T.gCVa, T.gCVa + 0.3);
    if (ale > 0.001) {
      const w = Math.sin(t * 17), Tr = G.tronco(p), hC = G.aPantalla(p, Tr(G.HOMBRO_C));
      const sale = { x: hC.x - 12 + 3 * w, y: hC.y + 46 + 4 * w, mu: -0.85 + 0.45 * w };
      const hS = G.aHoja(p, sale);
      const fuera = { x: hS.x, y: hS.y, ang: 0, mu: sale.mu, puno: 1, dedos: ABIERTA, dobla: -1 };
      if (ale >= 0.999) p.manoCerca = fuera;
      else {
        // del bolsillo a la mano abierta (posición en la hoja)
        const k = ale;
        p.manoCerca = { x: lerp(bols.x, fuera.x, k), y: lerp(bols.y, fuera.y, k), ang: 0, mu: lerpAng(bols.mu, fuera.mu, k), puno: k, dedos: ABIERTA, dobla: -1 };
      }
    } else p.manoCerca = bols;
  }

  /* ---------- capas de la cara de Guillermo: termómetro rojo, lágrimas, sudor y bigote de leche ---------- */
  const PZC = G.A.datos.piezas.cabeza, OJO_D = PZC.ojos.derecho, OJO_I = PZC.ojos.izquierdo;
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const PIEL_CUELLO = [[269,321],[254,318],[252,316],[250,318],[216,304],[212,299],[197,292],[175,270],[178,264],[188,259],[196,251],[196,246],[203,234],[203,229],[209,223],[219,233],[228,237],[243,249],[257,254],[266,266],[283,264],[287,267],[282,286],[291,296],[291,308],[294,310],[281,318],[271,318]];
  const OREJA = P(562, 586);
  const ROJO_COL = "#ff2414", ROJO_MUL = "rgb(255,122,104)";
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  // nivel del rojo: primero el cuello (hoja) y luego la cara (retrato), de abajo arriba, con el borde ondulado
  const nivelCuello = k => lerp(326, 216, clamp(k / 0.2));
  const nivelCara = k => lerp(866, 400, clamp((k - 0.2) / 0.8));
  function rellenoNivel(g, y, x0, x1, t, amp) {
    g.beginPath(); g.moveTo(x0, 2000); g.lineTo(x0, y);
    for (let x = x0; x <= x1; x += 24) g.lineTo(x, y + amp * Math.sin(x * 0.045 + t * 9) + amp * 0.5 * Math.sin(x * 0.11 - t * 13));
    g.lineTo(x1, y); g.lineTo(x1, 2000); g.closePath();
  }
  function tinteRojo(g, a, relleno) {
    g.globalAlpha = a; g.globalCompositeOperation = "multiply"; g.fillStyle = ROJO_MUL; relleno();
    g.globalAlpha = 0.35 * a; g.globalCompositeOperation = "color"; g.fillStyle = ROJO_COL; relleno();
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  }
  // lagrimones a chorro: dos surtidores en arco desde los ojos (retrato)
  function lagrimas(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    for (const [x, y, dir, d] of [[738, 570, -1, 0], [930, 626, 1, 0.37]]) {
      const alc = 150 * k;
      // chorro: arco de gotas
      for (let i = 0; i < 9; i++) {
        const ph = (t * 2.6 + i / 9 + d) % 1, u = ph;
        const px = x + dir * alc * u, py = y - 60 * u + 170 * u * u, r = (8 + 4 * Math.sin(i * 1.7)) * (1 - 0.35 * u);
        g.globalAlpha = 0.9 * k * (1 - u * u);
        g.fillStyle = "#a9e1ff"; g.strokeStyle = "#1d5f8a"; g.lineWidth = 3.5;
        g.beginPath(); g.ellipse(px, py, r, r * 1.25, dir * 0.6 * u, 0, TAU); g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(px - r * 0.3, py - r * 0.4, r * 0.28, 0, TAU); g.fill();
      }
      // el «grifo» pegado al ojo
      g.globalAlpha = 0.9 * clamp(k * 2); g.lineWidth = 14; g.strokeStyle = "#1d5f8a";
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dir * 22, y - 12, x + dir * 40, y - 6); g.stroke();
      g.lineWidth = 9; g.strokeStyle = "#a9e1ff"; g.stroke();
    }
    g.restore();
  }
  function sudor(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineWidth = 4; g.strokeStyle = "#1d3b52";
    [[640, 470, 0], [915, 520, 0.37], [700, 430, 0.71], [870, 470, 0.15]].forEach(([x, y, d], i) => {
      const ph = ((t * 0.8 + d) % 1), aparece = clamp(k * 4 - i);
      if (aparece <= 0) return;
      const yy = y + ph * 80, s = 13 * aparece * (1 - 0.3 * ph);
      g.globalAlpha = Math.sin(Math.PI * ph) * aparece;
      g.beginPath(); g.moveTo(x, yy - s * 1.6); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.6);
      g.fillStyle = "#bfe8ff"; g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - s * 0.3, yy - s * 0.1, s * 0.22, s * 0.35, 0, 0, TAU); g.fill();
    });
    g.restore();
  }
  // bigote de leche: blanco, con goterones que cuelgan
  function bigoteLeche(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.translate(803, 724); g.rotate(0.26);
    const blobs = [[-46, -12, 12], [-29, -17, 14], [-10, -19, 15], [10, -19, 15], [29, -17, 14], [45, -12, 12]];
    const forma = () => { g.beginPath(); for (const [x, y, r] of blobs) { g.moveTo(x + r * k, y); g.arc(x, y, r * k, 0, TAU); } };
    forma(); g.lineWidth = 6; g.strokeStyle = "#8d8f99"; g.stroke();
    forma(); g.fillStyle = "#fbfbf6"; g.fill();
    for (const [x, ln] of [[-28, 12], [16, 16], [40, 9]]) {
      const l = ln * k * (0.85 + 0.15 * Math.sin(t * 2.5 + x));
      g.beginPath(); g.ellipse(x, -6 + l * 0.6, 4.6 * k, l * 0.75, 0, 0, TAU); g.fillStyle = "#fbfbf6"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#8d8f99"; g.stroke();
    }
    g.fillStyle = "#ffffff"; for (const [x, y, r] of blobs) { g.beginPath(); g.arc(x - r * 0.3 * k, y - r * 0.35 * k, r * 0.28 * k, 0, TAU); g.fill(); }
    g.restore();
  }
  function capaCaraG(g, t, e) {
    if (e.term > 0.2) {
      const y = nivelCara(e.term);
      g.save();
      g.beginPath(); camino(g, PIEL_CAB); g.clip();
      rellenoNivel(g, y, 500, 1000, t, 6 * (1 - clamp((e.term - 0.95) / 0.05)) + 1.5); g.clip();
      g.beginPath(); g.rect(380, 100, 900, 900); camino(g, OJO_D); camino(g, OJO_I);
      tinteRojo(g, 1, () => g.fill("evenodd"));
      // brillo del borde que sube
      if (e.term < 0.985) { rellenoNivel(g, y, 500, 1000, t, 6); g.lineWidth = 5; g.strokeStyle = "rgba(255,225,200,0.6)"; g.stroke(); }
      g.restore();
      // párpados cerrados: también se tiñen
      for (const [ojo, c] of [[OJO_D, e.cd], [OJO_I, e.ci]]) {
        const cc = Math.pow(clamp((c - 0.4) / 0.6), 1.5) * clamp((e.term - 0.35) / 0.4);
        if (cc < 0.004) continue;
        g.save(); g.beginPath(); camino(g, ojo); g.clip(); tinteRojo(g, cc, () => g.fillRect(700, 520, 260, 140)); g.restore();
      }
    }
    lagrimas(g, lagrimasK(e.t), t);
    sudor(g, e.sudor, t);
    bigoteLeche(g, e.bigote, t);
  }
  const lagrimasK = t => dentro(t, T.lagr, T.lagr + 0.25, T.gCCoge, T.trago0 + 0.1);
  function capaCuelloG(g, e) {
    if (e.term <= 0.004) return;
    g.save(); g.beginPath(); camino(g, PIEL_CUELLO); g.clip();
    rellenoNivel(g, nivelCuello(e.term), 150, 320, e.t, e.term < 0.2 ? 3 : 0); g.clip();
    tinteRojo(g, 1, () => g.fillRect(150, 200, 170, 140));
    g.restore();
  }

  /* =====================================================================================
   * SARA (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_S = {
    seria: E({ mx: 0.6, my: 0.6, c: 0.42, sd: 0, si: 2, gi: 0.02, abre: 0, ancho: 0.82, sonr: 0.05 }),
    sacude: E({ mx: 0.5, my: 0.85, c: 0.48, sd: 0, si: 4, gi: 0.03, abre: 0, ancho: 0.8, sonr: 0.12 }),
    reta: E({ mx: 0.85, my: 0, c: 0.4, sd: 0, gd: 0, si: 18, gi: 0.1, abre: 0, ancho: 0.86, sonr: 0.3 }),
    abre: E({ mx: 0.5, my: 0.55, c: 0.35, sd: 2, si: 4, abre: 30, ancho: 0.95, sonr: 0.05 }),
    mastica: E({ mx: 0.85, my: 0.05, c: 0.46, sd: 0, si: 2, gi: 0.02, abre: 0, ancho: 0.8, sonr: 0.02, dientes: 0, mof: 0.12 }),
    calor: E({ mx: 0.7, my: -0.45, c: 0.46, sd: 0, si: 8, gi: 0.05, abre: 0, ancho: 0.8, sonr: 0.0, dientes: 0 }),
    empuja: E({ mx: 0.6, my: 0.6, c: 0.48, sd: 0, si: 2, abre: 0, ancho: 0.8, sonr: 0.05, dientes: 0 }),
    mira: E({ mx: 0.85, my: 0.05, c: 0.44, sd: 0, si: 6, gi: 0.04, abre: 0, ancho: 0.82, sonr: 0.08, dientes: 0 }),
    ofrece: E({ mx: 0.85, my: 0, c: 0.36, sd: 2, si: 16, gi: 0.09, abre: 0, ancho: 0.88, sonr: 0.38 }),
    encoge: E({ mx: 0.6, my: 0.7, c: 0.5, sd: 0, si: 8, gi: 0.05, abre: 0, ancho: 0.84, sonr: 0.2 }),
    camara: E({ mx: -0.85, my: 0, c: 0.42, sd: 2, gd: 0.02, si: 12, gi: 0.07, abre: 0, ancho: 0.88, sonr: 0.48 })
  };
  const GUION_CARA_S = [
    [T.sVa, T.sVa + 0.3, "sacude"], [T.sReta - 0.05, T.sReta + 0.2, "reta"], [T.sBoca1 - 0.22, T.sBoca1 - 0.04, "abre"], [T.sMuerde1, T.sMuerde1 + 0.08, "mastica", salida],
    [T.fuego0 - 0.1, T.fuego0 + 0.1, "calor"], [T.fuego1, T.fuego1 + 0.2, "mastica"], [T.sPDeja0, T.sPDeja0 + 0.2, "empuja"], [T.sCSuelta + 0.1, T.sCSuelta + 0.3, "mira"],
    [T.sBoca2 - 0.22, T.sBoca2 - 0.04, "abre"], [T.sMuerde2, T.sMuerde2 + 0.08, "mastica", salida], [T.sBCoge2 - 0.2, T.sBCoge2 + 0.1, "mira"],
    [T.ofrece - 0.2, T.ofrece, "ofrece"], [T.ofreceFin, T.ofreceFin + 0.2, "encoge"], [T.sCamara, T.sCamara + 0.25, "camara"]
  ];
  const CUERPOS_S = {
    inicio: { torso: 0.08, cab: 0.05, sx: 0 }, alcanza: { torso: 0.2, cab: 0.1, sx: -6 }, sacude: { torso: 0.12, cab: 0.14, sx: -2 },
    deja: { torso: 0.24, cab: 0.06, sx: -10 }, come: { torso: 0.1, cab: 0.04, sx: -2 }, mastica: { torso: 0.06, cab: 0.0, sx: 0 },
    calor: { torso: 0.0, cab: -0.05, sx: 2 }, empuja: { torso: 0.2, cab: 0.08, sx: -6 }, ofrece: { torso: 0.2, cab: 0.0, sx: -8 },
    encoge: { torso: 0.1, cab: 0.06, sx: -2 }, final: { torso: 0.07, cab: -0.03, sx: 0 }
  };
  const GUION_CUERPO_S = [
    [T.sVa, T.sCoge, "alcanza"], [T.sCoge, T.sAlza, "sacude"], [T.sDeja0, T.sDeja, "deja"], [T.sDeja + 0.05, T.sPCoge, "come"],
    [T.sAparta1, T.sAparta1 + 0.4, "mastica"], [T.fuego0 - 0.05, T.fuego0 + 0.15, "calor"], [T.fuego1, T.fuego1 + 0.3, "mastica"],
    [T.sPDeja0, T.sCToca, "empuja"], [T.sCSuelta, T.sPCoge2, "come"], [T.sAparta2, T.sAparta2 + 0.4, "mastica"],
    [T.sBCoge2 - 0.2, T.ofrece, "ofrece"], [T.ofreceFin, T.sInv2, "encoge"], [T.sCamara, T.sCamara + 0.3, "final"]
  ];
  const cacheS = new Map();
  function poseS(t) {
    const k0 = t;
    if (cacheS.has(k0)) return cacheS.get(k0);
    if (cacheS.size > 8) cacheS.clear();
    const p = poseS0(t); cacheS.set(k0, p); return p;
  }
  function poseS0(t) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t);
    const respira = Math.sin(t * 1.9 + 0.7);
    const K = S * Sa.K;
    const enc = campana(t, T.ofreceFin, T.ofreceFin + 0.5);
    const p = {
      x: XS, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: Sa.PELVIS.x - b.sx / K, y: Sa.PELVIS.y + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.03 * enc }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: -10 * enc, esc: { x: 1, y: 1 } }, pelo: { viento: 0, inercia: 0 }
    };
    // masticar (sin pestañear)
    const mas = mastica(t, T.sMuerde1 + 0.04, T.sPDeja0 + 0.1, 11) + mastica(t, T.sMuerde2 + 0.04, T.sPDeja2_0, 11);
    p.cabeza.dy += 2 * mas;
    // la melena: inercia al moverse y el viento caliente de la llamarada
    const b2 = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t - 0.1);
    const fk = fuegoK(t);
    p.pelo.inercia = clamp((b.torso - b2.torso) * 5 + (b.sx - b2.sx) * 0.04, -0.8, 0.8) + 0.25 * sacudida(t, SAC1) + 0.25 * sacudida(t, SAC2);
    p.pelo.viento = -2.4 * fk * (0.8 + 0.2 * Math.sin(t * 23));
    const tob = Sa.SUELO - Sa.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Sa.PELVIS.x - 48, y: tob }, ang: 0 };
    p.piernas.lejos = { tob: { x: Sa.PELVIS.x + 50, y: tob - 12 }, ang: 0 };
    const ex = guion(GUION_CARA_S, CARAS_S, "seria", t);
    ex.mof+=0.22*mas;
    const cercaBocado=t>T.sPCoge2?T.sMuerde2:T.sMuerde1;
    ex.abre*=1-dentro(t,cercaBocado-0.01,cercaBocado+0.05,cercaBocado+0.08,cercaBocado+0.15);
    ex.abre+=9*mas*tramo(t,cercaBocado+0.07,cercaBocado+0.14);
    // ¡ni un parpadeo mientras él arde! (solo al principio y al final)
    p.cara = cara(ex, parpadeo(t, [0.5, 2.9, 12.28, 13.18], 0.16));
    manosS(p, t);
    return p;
  }

  /* ---------- la porción de Sara ---------- */
  const SS0 = { x: 576, y: 347, a: Math.PI, ap: 0.42, mu: -0.75 };
  const SOSTEN_S = { x: 574, y: 290, a: -1.3, ap: 1, mu: 1.84 };
  const A_MUERDE_S = -0.85;
  const muerdeS=(p,t,hueco)=>hastaLabios(Sa,p,A_MUERDE_S,comidoS(t),hueco);
  const comidoS = t => 0.32 * suave(fase(t, T.sMuerde1, T.sMuerde1 + 0.08)) + 0.3 * suave(fase(t, T.sMuerde2, T.sMuerde2 + 0.08));
  // gotas de salsa que caen sobre la porción de Sara (tiempo de caída) y dónde caen (local)
  const CAE = 0.12;
  const GOTAS_S = [...picos(SAC1).map((tp, i) => ({ t: tp, i, loc: P(SALSA[i][0], SALSA[i][1]) })),
    ...picos(SAC2).map((tp, i) => ({ t: tp, i: 7 + i, loc: P(SALSA[7 + i][0], SALSA[7 + i][1]) }))];
  const salsaS = t => { let n=0; for (const gt of GOTAS_S) { const u=t-gt.t-CAE; if(u>=0)n+=0.38+0.62*tramo(u,0,0.10); } return n; };
  function porcionST(t, p) {
    const o = pista([
      [0, 0, SS0],
      [T.sPCoge, T.sBoca1, () => muerdeS(p,t,9)],
      [T.sBoca1, T.sMuerde1, () => muerdeS(p,t,0), entrada],
      [T.sAparta1, T.sAparta1 + 0.32, SOSTEN_S],
      [T.sPDeja0, T.sPDeja, Object.assign({}, SS0, { mu: -0.75 })],
      [T.sPCoge2, T.sBoca2, () => muerdeS(p,t,9)],
      [T.sBoca2, T.sMuerde2, () => muerdeS(p,t,0), entrada],
      [T.sAparta2, T.sAparta2 + 0.32, SOSTEN_S],
      [T.sPDeja2_0, T.sPDeja2, Object.assign({}, SS0, { mu: -0.75 })]
    ], t);
    // se mece un poco mientras la sujeta
    const sos = dentro(t, T.sAparta1 + 0.3, T.sAparta1 + 0.5, T.sPDeja0, T.sPDeja0 + 0.05) + dentro(t, T.sAparta2 + 0.3, T.sAparta2 + 0.5, T.sPDeja2_0, T.sPDeja2_0 + 0.05);
    if (sos > 0) { o.y += 1.2 * sos * Math.sin(t * 1.9 + 0.7); o.a += 0.03 * sos * Math.sin(t * 1.3); }
    o.com = comidoS(t); o.salsa = salsaS(t);
    o.quien = (t >= T.sPCoge && t < T.sPDeja) || (t >= T.sPCoge2 && t < T.sPDeja2) ? "s" : "mesa";
    return o;
  }

  /* ---------- manos de Sara ---------- */
  const REPOSO_S = { x: 591, y: 334, mu: -0.95, d: MESA };
  const ENCOGE_S = { x: 590, y: 318, mu: 1.2, d: RELAJA };
  function yemaSara(p,m) {
    const d=m.dedos, abre=(d.indice+d.medio+d.anular+d.menique)/4;
    const a=.05*(.4+.9*abre),l=3.2+12.8*Math.pow(d.medio,.85);
    const off=rotP(P(2.3+Math.sin(a)*l,4.5+Math.cos(a)*l),m.mu+Math.PI/2), k=Sa.JK*.86*m.puno;
    return Sa.aPantalla(p,P(m.x+k*off.x,m.y+k*off.y));
  }
  function manosS(p, t) {
    const sS = porcionST(t, p);
    p.porcion = sS;
    const deBote = () => { const o = boteT(t); return { x: o.x, y: o.y, mu: o.mu, d: AGARRA }; };
    const dePorcion = () => manoDePorcion(porcionST(t, p), PINZA);
    const deCarton=()=>{
      const tt=Math.min(t,T.sCSuelta), lado=ladoCarton(cartonMesa(tt));
      const m={x:lado.x,y:lado.y,mu:lerp(1.9,.55,tramo(tt,T.sCToca,T.sCSuelta)),d:EMPUJA};
      const yema=yemaSara(p,manoRig(Sa,p,m,-1,null));m.x+=lado.x-yema.x;m.y+=lado.y-yema.y;return m;
    };
    const PL_ = [
      [0, 0, REPOSO_S],
      [T.sVa, T.sCoge, deBote],
      [T.sDeja + 0.02, T.sPCoge, dePorcion],
      [T.sPDeja + 0.02, T.sCToca, deCarton],
      [T.sCSuelta, T.sPCoge2, dePorcion],
      [T.sPDeja2 + 0.02, T.sBCoge2, deBote]
    ];
    const l = pista(PL_, t);
    let obj = null;
    const b = boteT(t);
    if (b.quien === "s") obj = g => conCamara(g, () => bote(g, b));
    else if (sS.quien === "s") obj = g => conCamara(g, () => porcion(g, sS, t));
    p.manoLejos = manoRig(Sa, p, l, -1, obj);
    p.manoCerca = null;
  }

  /* =====================================================================================
   * MESA Y FONDO
   * ===================================================================================== */
  function plato(g, q) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(60,20,20,0.25)"; g.beginPath(); g.ellipse(q.x + 1, q.y + 3, 31, 8.4, 0, 0, TAU); g.fill();
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(q.x, q.y, 30, 8.4, 0, 0, TAU); g.fill(); g.lineWidth = 1.3; g.strokeStyle = "#5a5450"; g.stroke();
    g.fillStyle = "#e2ddd3"; g.beginPath(); g.ellipse(q.x, q.y + 0.5, 20, 5.2, 0, 0, TAU); g.fill();
    g.restore();
  }
  function sombraObjeto(g, x, y, r) { g.fillStyle = "rgba(60,20,20,0.28)"; g.beginPath(); g.ellipse(x + 1, y + 1, r, r * 0.3, 0, 0, TAU); g.fill(); }
  // tablero con mantel de cuadros rojos (detrás de todo lo de encima)
  let MANTEL = null;
  function creaMantel() {
    const { rx, ry } = MESA_T, cw = rx * 2 + 20, ch = ry * 2 + 46;
    const c = document.createElement("canvas"); c.width = cw; c.height = ch; const g = c.getContext("2d");
    g.translate(cw / 2, ry + 6); g.lineJoin = "round";
    // faldón que cuelga (ondulado)
    const faldon = () => { g.beginPath(); g.moveTo(-rx, 0); g.lineTo(-rx - 2, 22);
      for (let i = 0; i <= 12; i++) { const x = lerp(-rx - 2, rx + 2, i / 12), y = 22 + ry * Math.sqrt(Math.max(0, 1 - (x / (rx + 2)) ** 2)) + 3 * Math.sin(i * 1.9); g.lineTo(x, y); }
      g.lineTo(rx, 0); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI); g.closePath(); };
    const tablero = () => { g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); };
    const cuadros = (escY, oy) => {
      for (let i = -12; i < 12; i++) for (let j = -8; j < 8; j++) {
        if ((i + j) % 2 === 0) continue;
        g.fillStyle = "rgba(196,30,36,0.92)"; g.fillRect(i * 9, oy + j * 9 * escY, 9, 9 * escY);
      }
      for (let i = -12; i < 12; i++) { g.fillStyle = "rgba(196,30,36,0.42)"; g.fillRect(i * 9, -60, 9, 200); }
      for (let j = -8; j < 8; j++) { g.fillStyle = "rgba(196,30,36,0.42)"; g.fillRect(-200, oy + j * 9 * escY, 400, 9 * escY); }
    };
    faldon(); g.fillStyle = "#f3eee4"; g.fill();
    g.save(); faldon(); g.clip(); cuadros(1, 0);
    const gs = g.createLinearGradient(0, 0, 0, ry + 30); gs.addColorStop(0, "rgba(30,10,10,0.1)"); gs.addColorStop(1, "rgba(30,10,10,0.45)"); g.fillStyle = gs; g.fillRect(-rx - 6, 0, 2 * rx + 12, ry + 34);
    g.restore();
    faldon(); g.lineWidth = 1.6; g.strokeStyle = "#3a1c1c"; g.stroke();
    tablero(); g.fillStyle = "#f6f1e8"; g.fill();
    g.save(); tablero(); g.clip(); g.scale(1, 0.32); cuadros(1, 0); g.restore();
    g.save(); tablero(); g.clip();
    const gl = g.createRadialGradient(10, -4, 4, 0, 0, rx); gl.addColorStop(0, "rgba(255,240,210,0.35)"); gl.addColorStop(1, "rgba(60,20,10,0.12)"); g.fillStyle = gl; g.fillRect(-rx, -ry, 2 * rx, 2 * ry);
    g.restore();
    tablero(); g.lineWidth = 1.4; g.strokeStyle = "#3a1c1c"; g.stroke();
    return { c, ox: MESA_T.x - cw / 2, oy: MESA_T.y - ry - 6 };
  }
  function pieMesa(g) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(MESA_T.x, SUELO + 2, 52, 7, 0, 0, TAU); g.fill();
    g.fillStyle = "#1e1c20"; g.beginPath(); g.ellipse(MESA_T.x, SUELO - 2, 34, 6, 0, 0, TAU); g.fill(); g.stroke();
    const gp = g.createLinearGradient(MESA_T.x - 6, 0, MESA_T.x + 6, 0); gp.addColorStop(0, "#1a181c"); gp.addColorStop(0.45, "#55525a"); gp.addColorStop(1, "#151317");
    g.fillStyle = gp; g.fillRect(MESA_T.x - 5, MESA_T.y + 20, 10, SUELO - MESA_T.y - 22); g.strokeRect(MESA_T.x - 5, MESA_T.y + 20, 10, SUELO - MESA_T.y - 22);
    g.restore();
  }

  /* ---------- fondo (una vez): pizzería de porciones de madrugada ---------- */
  let fondo = null, neon = null;
  const PARED = 496;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round"; g.lineCap = "round";
    // pared alta pintada (verde botella) y azulejo blanco
    const AZ0 = 176;
    const gr = g.createLinearGradient(0, -70, 0, AZ0); gr.addColorStop(0, "#14262a"); gr.addColorStop(1, "#1f3a3c");
    g.fillStyle = gr; g.fillRect(-80, -70, W + 160, AZ0 + 70);
    for (let i = 0; i < 260; i++) { const x = -80 + hash(i * 3.1) * (W + 160), y = -70 + hash(i * 7.7) * (AZ0 + 70), r = 6 + 18 * hash(i * 1.3);
      g.fillStyle = `rgba(${hash(i) > 0.5 ? "220,255,240" : "0,0,0"},${0.02 + 0.025 * hash(i * 9.1)})`; g.beginPath(); g.ellipse(x, y, r, r * 0.7, hash(i) * 3, 0, TAU); g.fill(); }
    // azulejo tipo metro
    g.fillStyle = "#e9e3d6"; g.fillRect(-80, AZ0, W + 160, PARED - AZ0);
    const TW = 26, TH = 13;
    for (let r = 0; r * TH < PARED - AZ0; r++) for (let k = -4; k < 48; k++) {
      const x = k * TW + (r % 2 ? TW / 2 : 0) - 80, y = AZ0 + r * TH;
      g.fillStyle = `rgba(255,255,255,${0.25 + 0.2 * hash(r * 50 + k)})`; g.fillRect(x + 2, y + 2, TW - 6, 3);
      g.strokeStyle = "#bdb5a5"; g.lineWidth = 1.2; g.strokeRect(x, y, TW, TH);
    }
    // cenefas de azulejo verde
    for (const y of [AZ0, 300]) { g.fillStyle = "#2a6b5a"; g.fillRect(-80, y, W + 160, 9); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(-80, y + 1, W + 160, 2); g.fillStyle = "#173f35"; g.fillRect(-80, y + 8, W + 160, 1.5); }
    // sombra cálida de abajo
    const gb = g.createLinearGradient(0, 300, 0, PARED); gb.addColorStop(0, "rgba(40,20,10,0)"); gb.addColorStop(1, "rgba(40,20,10,0.35)"); g.fillStyle = gb; g.fillRect(-80, 300, W + 160, PARED - 300);
    // zócalo
    g.fillStyle = "#173f35"; g.fillRect(-80, PARED - 14, W + 160, 14); g.fillStyle = "#2a6b5a"; g.fillRect(-80, PARED - 15, W + 160, 2);
    // suelo de baldosa roja y crema en perspectiva
    const Y0 = PARED, VP = { x: 512, y: -300 };
    const filas = [Y0, 510, 528, 552, 584, 628, 690];
    const xEn = (X, y) => VP.x + (X - VP.x) * (y - VP.y) / (Y0 - VP.y);
    for (let r = 0; r < filas.length - 1; r++) for (let k = -16; k < 16; k++) {
      const X0 = 512 + k * 52, X1 = X0 + 52, ya = filas[r], yb = filas[r + 1];
      g.beginPath(); g.moveTo(xEn(X0, ya), ya); g.lineTo(xEn(X1, ya), ya); g.lineTo(xEn(X1, yb), yb); g.lineTo(xEn(X0, yb), yb); g.closePath();
      g.fillStyle = (r + k) % 2 ? "#a8382c" : "#e3d6bd"; g.fill();
    }
    const gs = g.createLinearGradient(0, Y0, 0, Y0 + 140); gs.addColorStop(0, "rgba(30,10,8,0.55)"); gs.addColorStop(1, "rgba(30,10,8,0.25)"); g.fillStyle = gs; g.fillRect(-80, Y0, W + 160, 200);

    // ventanal a la calle (izquierda)
    const V = { x0: 26, x1: 296, y0: 60, y1: 318 };
    const gc = g.createLinearGradient(0, V.y0, 0, V.y1); gc.addColorStop(0, "#0b1430"); gc.addColorStop(0.7, "#1b2550"); gc.addColorStop(1, "#2b2346");
    g.fillStyle = gc; g.fillRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    g.save(); g.beginPath(); g.rect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0); g.clip();
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,240,${0.4 + 0.5 * hash(i * 4.4)})`; g.beginPath(); g.arc(V.x0 + hash(i * 2.2) * 270, V.y0 + hash(i * 6.1) * 70, 0.8 + hash(i) * 0.8, 0, TAU); g.fill(); }
    // edificios de enfrente con ventanas encendidas
    const ED = [[20, 150, 70], [88, 118, 58], [150, 168, 62], [210, 128, 90]];
    for (const [x, y, w] of ED) {
      g.fillStyle = "#121029"; g.fillRect(V.x0 + x, V.y0 + y - 40, w, 300);
      for (let r = 0; r < 9; r++) for (let k = 0; k < Math.floor(w / 14); k++) {
        if (hash(x * 7 + r * 13 + k * 3) < 0.55) continue;
        g.fillStyle = hash(x + r + k * 9) < 0.5 ? "#ffd27a" : "#ffe9b0"; g.fillRect(V.x0 + x + 4 + k * 14, V.y0 + y - 30 + r * 18, 7, 9);
      }
    }
    // farola con halo y la acera
    g.fillStyle = "#1a1830"; g.fillRect(V.x0, V.y1 - 34, V.x1 - V.x0, 34);
    g.strokeStyle = "#2b2944"; g.lineWidth = 4; g.beginPath(); g.moveTo(V.x0 + 214, V.y1 - 30); g.lineTo(V.x0 + 214, V.y0 + 120); g.quadraticCurveTo(V.x0 + 214, V.y0 + 104, V.x0 + 200, V.y0 + 104); g.stroke();
    const gf = g.createRadialGradient(V.x0 + 198, V.y0 + 110, 2, V.x0 + 198, V.y0 + 110, 60); gf.addColorStop(0, "rgba(255,214,140,0.75)"); gf.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = gf; g.fillRect(V.x0 + 130, V.y0 + 40, 140, 140);
    g.fillStyle = "#ffe6a8"; g.beginPath(); g.ellipse(V.x0 + 198, V.y0 + 110, 8, 4, 0, 0, TAU); g.fill();
    // reflejos en el cristal
    g.fillStyle = "rgba(255,255,255,0.06)";
    for (const x of [40, 150]) { g.beginPath(); g.moveTo(V.x0 + x, V.y0); g.lineTo(V.x0 + x + 40, V.y0); g.lineTo(V.x0 + x - 60, V.y1); g.lineTo(V.x0 + x - 100, V.y1); g.closePath(); g.fill(); }
    g.restore();
    // marco del ventanal (verde oscuro) con un parteluz
    g.strokeStyle = "#173f35"; g.lineWidth = 10; g.strokeRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    g.lineWidth = 7; g.beginPath(); g.moveTo((V.x0 + V.x1) / 2, V.y0); g.lineTo((V.x0 + V.x1) / 2, V.y1); g.stroke();
    g.strokeStyle = "#0c241e"; g.lineWidth = 1.5; g.strokeRect(V.x0 - 5, V.y0 - 5, V.x1 - V.x0 + 10, V.y1 - V.y0 + 10);
    // repisa bajo el ventanal con servilletero y botes de especias (sin etiquetas)
    g.fillStyle = "#5a3a22"; g.fillRect(V.x0 - 10, V.y1 + 4, V.x1 - V.x0 + 20, 8); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(V.x0 - 10, V.y1 + 4, V.x1 - V.x0 + 20, 8);
    // servilletero
    g.fillStyle = "#c9ccd2"; g.beginPath(); g.roundRect(V.x0 + 30, V.y1 - 16, 26, 20, 2); g.fill(); g.stroke();
    g.fillStyle = "#fbfaf6"; g.fillRect(V.x0 + 34, V.y1 - 22, 18, 7); g.strokeRect(V.x0 + 34, V.y1 - 22, 18, 7);
    // especieros: orégano (verde) y guindilla en copos (rojo)
    for (const [x, col] of [[V.x0 + 70, "#5d7a2a"], [V.x0 + 86, "#b83a1c"], [V.x0 + 102, "#e8e2d0"]]) {
      g.fillStyle = "rgba(235,240,245,0.85)"; g.beginPath(); g.roundRect(x, V.y1 - 16, 12, 20, 3); g.fill(); g.stroke();
      g.fillStyle = col; g.fillRect(x + 2, V.y1 - 8, 8, 10);
      g.fillStyle = "#b9bcc4"; g.beginPath(); g.roundRect(x - 1, V.y1 - 20, 14, 6, 2); g.fill(); g.stroke();
    }

    // horno de acero (derecha) sobre patas, con pila de cajas encima
    const HX = 758, HY = 196, HW = 250, HH = 196;
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(HX + 8, HY + 8, HW, HH);
    const gh = g.createLinearGradient(HX, 0, HX + HW, 0); gh.addColorStop(0, "#8d939b"); gh.addColorStop(0.3, "#c9ced4"); gh.addColorStop(0.65, "#9aa0a8"); gh.addColorStop(1, "#6f747c");
    g.fillStyle = gh; g.fillRect(HX, HY, HW, HH); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(HX, HY, HW, HH);
    for (let i = 0; i < 2; i++) {
      const y = HY + 16 + i * 90;
      g.fillStyle = "#5f646c"; g.fillRect(HX + 14, y, HW - 28, 74); g.strokeRect(HX + 14, y, HW - 28, 74);
      // ventanilla encendida
      const gv = g.createLinearGradient(0, y + 14, 0, y + 54); gv.addColorStop(0, "#ffb347"); gv.addColorStop(1, "#d8461c");
      g.fillStyle = gv; g.beginPath(); g.roundRect(HX + 40, y + 14, HW - 80, 38, 4); g.fill(); g.lineWidth = 2; g.stroke();
      g.fillStyle = "rgba(90,30,10,0.55)"; g.beginPath(); g.ellipse(HX + HW / 2, y + 46, 70, 7, 0, 0, TAU); g.fill();
      // asa
      g.fillStyle = "#e8ebef"; g.beginPath(); g.roundRect(HX + 60, y + 58, HW - 120, 6, 3); g.fill(); g.lineWidth = 1.4; g.stroke();
    }
    // patas
    g.fillStyle = "#6f747c"; for (const x of [HX + 14, HX + HW - 24]) { g.fillRect(x, HY + HH, 10, PARED - HY - HH); g.strokeRect(x, HY + HH, 10, PARED - HY - HH); }
    // cajas de pizza (sin letras)
    for (let i = 0; i < 4; i++) {
      const x = HX + 40 + (i % 2) * 6 - i * 2, y = HY - 10 - i * 11;
      g.fillStyle = i % 2 ? "#c99a62" : "#d4a86e"; g.fillRect(x, y, 150, 10); g.strokeStyle = "#5a3e22"; g.lineWidth = 1.4; g.strokeRect(x, y, 150, 10);
      g.strokeStyle = "rgba(90,62,34,0.45)"; g.beginPath(); g.moveTo(x + 4, y + 5); g.lineTo(x + 146, y + 5); g.stroke();
    }
    // palas de pizza colgadas
    for (const [x, rot] of [[724, 0.08], [742, -0.06]]) {
      g.save(); g.translate(x, 70); g.rotate(rot);
      g.fillStyle = "#b58a52"; g.strokeStyle = "#4a3018"; g.lineWidth = 1.5;
      g.fillRect(-2.5, 0, 5, 70); g.strokeRect(-2.5, 0, 5, 70);
      g.beginPath(); g.ellipse(0, 92, 17, 24, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#2b1d10"; g.beginPath(); g.arc(0, -2, 2, 0, TAU); g.fill();
      g.restore();
    }
    // reloj sin números (las dos y diez)
    const RX = 640, RY = 92, RR = 24;
    g.fillStyle = "#1a1416"; g.beginPath(); g.arc(RX, RY, RR + 3, 0, TAU); g.fill();
    g.fillStyle = "#f4efe2"; g.beginPath(); g.arc(RX, RY, RR, 0, TAU); g.fill();
    g.strokeStyle = "#2a2226"; for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.lineWidth = i % 3 ? 1.2 : 2.4; g.beginPath(); g.moveTo(RX + Math.cos(a) * (RR - 3), RY + Math.sin(a) * (RR - 3)); g.lineTo(RX + Math.cos(a) * (RR - (i % 3 ? 6 : 8)), RY + Math.sin(a) * (RR - (i % 3 ? 6 : 8))); g.stroke(); }
    const aH = -Math.PI / 2 + (2 + 10 / 60) * TAU / 12, aM = -Math.PI / 2 + 10 * TAU / 60;
    g.lineWidth = 3; g.beginPath(); g.moveTo(RX, RY); g.lineTo(RX + Math.cos(aH) * 12, RY + Math.sin(aH) * 12); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(RX, RY); g.lineTo(RX + Math.cos(aM) * 18, RY + Math.sin(aM) * 18); g.stroke();
    g.fillStyle = "#c21a1a"; g.beginPath(); g.arc(RX, RY, 2.2, 0, TAU); g.fill();
    return c;
  }
  // neones (sin letras): una porción con peperonis y una guindilla; se pintan una vez con su halo
  function creaNeon() {
    const c = document.createElement("canvas"); c.width = 360; c.height = 200; const g = c.getContext("2d");
    g.translate(180, 100); g.lineJoin = "round"; g.lineCap = "round";
    const porcionN = () => { g.beginPath(); g.moveTo(-90, -46); g.quadraticCurveTo(-56, -62, -20, -46); g.lineTo(-55, 44); g.closePath(); };
    const peps = () => { g.beginPath(); for (const [x, y, r] of [[-62, -30, 6], [-44, -22, 5], [-54, 0, 5.5]]) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); } };
    const guindillaN = () => { g.beginPath(); g.moveTo(26, -30); g.bezierCurveTo(70, -36, 96, -6, 92, 34); g.bezierCurveTo(78, 6, 52, -12, 26, -14); g.closePath(); };
    const rabo = () => { g.beginPath(); g.moveTo(26, -22); g.quadraticCurveTo(14, -24, 10, -38); };
    const capas = (f, col, colIn) => {
      g.filter = "blur(9px)"; f(); g.strokeStyle = col; g.lineWidth = 11; g.stroke();
      g.filter = "blur(3px)"; f(); g.lineWidth = 6; g.stroke();
      g.filter = "none"; f(); g.strokeStyle = colIn; g.lineWidth = 2.6; g.stroke();
    };
    capas(porcionN, "rgba(255,170,60,0.9)", "#fff1c8");
    capas(peps, "rgba(255,70,60,0.9)", "#ffd6cf");
    capas(guindillaN, "rgba(255,40,40,0.9)", "#ffd0cc");
    capas(rabo, "rgba(80,255,120,0.9)", "#d8ffe0");
    return c;
  }
  // lámpara colgante sobre la mesa y su cono de luz
  const LAMP = { x: 560, y: 34 };
  function lampara(g, t) {
    g.save(); g.lineJoin = "round";
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(LAMP.x, -80); g.lineTo(LAMP.x, LAMP.y - 12); g.stroke();
    const gp = g.createLinearGradient(LAMP.x - 22, 0, LAMP.x + 22, 0); gp.addColorStop(0, "#7a1a14"); gp.addColorStop(0.4, "#c8362a"); gp.addColorStop(1, "#5e130e");
    g.fillStyle = gp; g.beginPath(); g.moveTo(LAMP.x - 6, LAMP.y - 13); g.lineTo(LAMP.x + 6, LAMP.y - 13); g.lineTo(LAMP.x + 22, LAMP.y + 4); g.lineTo(LAMP.x - 22, LAMP.y + 4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff4cf"; g.beginPath(); g.ellipse(LAMP.x, LAMP.y + 4, 22, 4, 0, 0, TAU); g.fill(); g.stroke();
    g.restore();
  }
  function conoLuz(g, t) {
    const k = 0.92 + 0.08 * Math.sin(t * 0.8);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, LAMP.y, 0, MESA_T.y + 10);
    gr.addColorStop(0, `rgba(255,226,170,${0.12 * k})`); gr.addColorStop(1, "rgba(255,226,170,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(LAMP.x - 22, LAMP.y + 5); g.lineTo(LAMP.x + 22, LAMP.y + 5); g.lineTo(MESA_T.x + 120, MESA_T.y + 10); g.lineTo(MESA_T.x - 130, MESA_T.y + 10); g.closePath(); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  // gotas de salsa de las sacudidas de Sara (de la boquilla a la porción) y sus salpicaduras
  function gotasSalsa(g, t) {
    for (const gt of GOTAS_S) {
      const u = (t - gt.t) / CAE;
      if (u < -0.3 || u > 2.6) continue;
      const o0 = boteT(gt.t), n = boquilla(o0);
      const q=puntoPorcion(SS0,gt.loc);
      g.save();
      // chorrito en el golpe
      const ch = campana(t, gt.t - 0.03, gt.t + 0.06);
      if (ch > 0.01) {
        const nn = boquilla(boteT(t)), d = P(Math.cos(o0.b), Math.sin(o0.b));
        g.strokeStyle = `rgba(190,18,10,${ch})`; g.lineWidth = 2.4 * ch; g.lineCap = "round";
        g.beginPath(); g.moveTo(nn.x, nn.y); g.lineTo(nn.x + d.x * 9 * ch, nn.y + d.y * 9 * ch + 3 * ch); g.stroke();
      }
      if (u > 0 && u < 1) {
        const x = lerp(n.x, q.x, u), y = lerp(n.y, q.y, u * u), r = 2.3;
        const vy = 2 * u * (q.y - n.y), vx = q.x - n.x, an = Math.atan2(vy, vx);
        g.translate(x, y); g.rotate(an - Math.PI / 2);
        g.fillStyle = "#c4120a"; g.strokeStyle = "#5a0806"; g.lineWidth = 0.7;
        g.beginPath(); g.moveTo(0, -r * 2.2); g.quadraticCurveTo(r, -r * 0.2, 0, r); g.quadraticCurveTo(-r, -r * 0.2, 0, -r * 2.2); g.fill(); g.stroke();
      } else if (u >= 1) {
        // salpicadura: tres gotitas que saltan y caen
        const v = (u - 1) * CAE / 0.18;
        if (v < 1) for (let j = 0; j < 3; j++) {
          const an = -Math.PI / 2 + (j - 1) * 0.9 + (hash(gt.i * 5 + j) - 0.5) * 0.4, d = 7 + 5 * hash(gt.i + j * 3);
          const x = q.x + Math.cos(an) * d * v, y = q.y + Math.sin(an) * d * v + 14 * v * v;
          g.globalAlpha = 1 - v; g.fillStyle = "#c4120a"; g.beginPath(); g.arc(x, y, 1.1, 0, TAU); g.fill();
        }
      }
      g.restore();
    }
  }
  // la gota de Guillermo: crece en la boquilla, tiembla, cae… ¡plip!
  function gotaUnica(t) {
    if(t<T.gota0||t>T.gotaCae)return null;
    const pos=tt=>boquilla(boteT(tt)), est=tt=>1.5+0.12*Math.sin(tt*30);
    if(t<T.gota1){
      const u=fase(t,T.gota0,T.gota1),r=3.4*suave(u),q=pos(t),ry=r*(1+(est(t)-1)*u);
      return {x:q.x,y:q.y+ry,rx:r,ry};
    }
    const q=pos(T.gota1), h=3.4*est(T.gota1), p=puntoPorcion(SG0,GOTA_LOC),u=fase(t,T.gota1,T.gotaCae);
    const rx=lerp(3.4,1.9*EP,suave(u)),ry=lerp(h,1.30*EP*SG0.ap,suave(u));
    return {x:lerp(q.x,p.x,u),y:lerp(q.y+h,p.y,u*u),rx,ry};
  }
  function gotaG(g,t) {
    if(t<T.gota0||t>T.gotaCae+.4)return;
    g.save();
    if(t<T.gotaCae){
      const q=gotaUnica(t);
      if(q&&q.rx>.01){g.translate(q.x,q.y);g.fillStyle="#c4120a";g.beginPath();g.ellipse(0,0,q.rx,q.ry,0,0,TAU);g.fill();
        g.fillStyle="rgba(255,190,170,0.85)";g.beginPath();g.ellipse(-q.rx*.2,-q.ry*.23,q.rx*.23,q.ry*.29,0,0,TAU);g.fill();}
    } else {
      const v=fase(t,T.gotaCae,T.gotaCae+.4),q=puntoPorcion(SG0,GOTA_LOC);
      g.globalAlpha=1-v;g.strokeStyle="#ffe9c0";g.lineWidth=1;g.lineCap="round";g.beginPath();
      g.ellipse(q.x,q.y,3+9*v,(3+9*v)*.35,0,0,TAU);g.stroke();
      for(let i=-1;i<=1;i++){const a=-Math.PI/2+i*.6,r=4+6*v;g.beginPath();g.moveTo(q.x+Math.cos(a)*r,q.y-2+Math.sin(a)*r);g.lineTo(q.x+Math.cos(a)*(r+3),q.y-2+Math.sin(a)*(r+3));g.stroke();}
    }
    g.restore();
  }
  // hilo de queso del primer mordisco de Sara
  function hiloQueso(g, t, pS) {
    const k = fase(t, T.sMuerde1 + 0.06, T.sAparta1 + 0.36); if (k <= 0 || k >= 1) return;
    const s = pS.porcion, a = puntaP(s), b = Sa.aPantalla(pS, Sa.boca(pS));
    const w = 2.2 * (1 - k), cae = 8 * k;
    g.save(); g.lineCap = "round";
    const ruta = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + cae, b.x, b.y); };
    ruta(); g.strokeStyle = "rgba(140,90,20,0.8)"; g.lineWidth = w + 1.2; g.stroke();
    ruta(); g.strokeStyle = "#f8d466"; g.lineWidth = w; g.stroke();
    g.restore();
  }
  // vapor por la oreja (como una tetera) y humo de los pinchos
  const PUNTAS = [[539, 310], [623, 237], [729, 199], [785, 182], [903, 186], [958, 208], [1046, 234], [1119, 291], [1117, 430], [1105, 512]];
  function vapor(g, t, pG) {
    const k = dentro(t, T.vapor, T.vapor + 0.2, T.rojoBaja0, T.rojoBaja1 - 0.3);
    if (k <= 0.01) return;
    const H = G.cabeza(pG), o = G.aPantalla(pG, H.a(OREJA)), d = rotP(P(-1, -0.55), H.ang);
    // pitido: el chorro es más fuerte a golpes
    const pit = 0.75 + 0.25 * Math.sin(t * 9);
    g.save();
    for (let i = 0; i < 10; i++) {
      const ph = (t * 2.6 + i / 10) % 1, r = (3 + 11 * ph) * pit, L = 6 + 64 * ph * pit;
      const x = o.x + d.x * L + 3 * Math.sin(t * 9 + i), y = o.y + d.y * L - 14 * ph * ph;
      g.globalAlpha = 0.8 * (1 - ph) * k; g.fillStyle = i % 2 ? "#ffffff" : "#e3ecf0";
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    g.globalAlpha = k * (0.6 + 0.4 * Math.sin(t * 40)); g.strokeStyle = "#ffffff"; g.lineWidth = 1.8; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { const a = Math.atan2(d.y, d.x) + i * 0.55, r0 = 12, r1 = 20 + 3 * Math.sin(t * 30 + i);
      g.beginPath(); g.moveTo(o.x + Math.cos(a) * r0, o.y + Math.sin(a) * r0); g.lineTo(o.x + Math.cos(a) * r1, o.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function fuenteHumo(t,i,j) {
    const per=1.3, fase0=j/5+hash(i)*.3, n=Math.floor((t-T.humo)/per+fase0), nacimiento=T.humo+(n-fase0)*per;
    if(nacimiento<T.humo||t<nacimiento)return null;
    const p=poseG(nacimiento),q=G.aPantalla(p,G.cabeza(p).a(P(...PUNTAS[i])));
    return {q,ph:(t-nacimiento)/per,nacimiento};
  }
  function humoPinchos(g, t, pG) {
    const k = dentro(t, T.humo, T.humo + 0.3, T.rojoBaja0 + 0.2, T.rojoBaja1 + 0.4);
    if (k <= 0.01) return;
    g.save();
    for (const i of [1, 2, 3, 4, 5, 6, 7]) {
      for (let j = 0; j < 5; j++) {
        const emision=fuenteHumo(t,i,j);if(!emision)continue;
        const {q,ph}=emision;
        const y = q.y - 52 * ph * (0.8 + 0.3 * hash(i * 2.2)), x = q.x + 8 * Math.sin(ph * 5 + i * 1.3 + t * 0.8) * ph + 5 * ph;
        g.globalAlpha = 0.22 * k * Math.sin(Math.PI * ph) * (0.7 + 0.3 * hash(i + j));
        g.fillStyle = j % 2 ? "#a8a2a4" : "#cfcacb";
        g.beginPath(); g.arc(x, y, 3 + 9 * ph, 0, TAU); g.fill();
      }
    }
    g.restore();
  }
  // la llamarada: hacia arriba (el fuego sube), lejos de Sara
  const ruidoF = x => Math.sin(x * 1.7) * 0.6 + Math.sin(x * 3.1 + 1.3) * 0.4;
  function llamarada(g, t, pG) {
    const k = fuegoK(t); if (k <= 0.005) return;
    const H = G.cabeza(pG), o=G.aPantalla(pG,G.boca(pG));
    const d0 = 0.26 + H.ang - 0.5, largo = 160 * k;
    // eje curvo: empieza hacia delante-arriba y se dobla hacia arriba
    const eje = u => { const a = d0 - 0.55 * u; return { a, x: o.x + largo * (Math.cos(d0) * u * 0.7 + Math.cos(d0 - 0.55) * u * 0.3 * u), y: o.y + largo * (Math.sin(d0) * u * 0.7 + Math.sin(d0 - 0.55) * u * 0.3 * u) }; };
    g.save();
    // halo cálido
    const m = eje(0.5), gr = g.createRadialGradient(m.x, m.y, 4, m.x, m.y, largo * 0.75 + 10);
    gr.addColorStop(0, `rgba(255,200,80,${0.42 * k})`); gr.addColorStop(1, "rgba(255,120,30,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(m.x, m.y, largo * 0.75 + 10, 0, TAU); g.fill();
    const capa = (esc, ancho, sem) => {
      const n = 12, izq = [], der = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n * esc, v = Math.min(1, u / esc), e = eje(u), w = ancho * 1.7 * Math.pow(v, 0.8) * Math.pow(1 - v, 0.45) * (1 + 0.28 * ruidoF(t * 22 + i * 3 + sem)) + 1.5;
        const nx = -Math.sin(e.a), ny = Math.cos(e.a);
        izq.push(P(e.x + nx * w, e.y + ny * w)); der.push(P(e.x - nx * w, e.y - ny * w));
      }
      g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let i = n; i >= 0; i--) g.lineTo(der[i].x, der[i].y); g.closePath();
    };
    capa(1, 34 * k, 0); g.fillStyle = "#e8321a"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = "#5a0b02"; g.lineJoin = "round"; g.stroke();
    capa(0.82, 22 * k, 50); g.fillStyle = "#ff8c1a"; g.fill();
    capa(0.58, 12 * k, 90); g.fillStyle = "#ffe14d"; g.fill();
    // chispas que suben
    for (let i = 0; i < 10; i++) {
      const ph = (t * 1.8 + hash(i * 3.3)) % 1, e = eje(Math.min(1, 0.5 + 0.6 * ph));
      g.globalAlpha = k * (1 - ph); g.fillStyle = i % 2 ? "#ffe14d" : "#ff9a2e";
      g.beginPath(); g.arc(e.x + (hash(i) - 0.5) * 30 * ph, e.y - 30 * ph, 1.6, 0, TAU); g.fill();
    }
    g.restore();
  }
  // bocanadas de humo: después de la llamarada y al suspirar
  function humoBoca(g, t, pG) {
    for (const [t0, dur, tam] of [[T.fuego1 - 0.08, 0.7, 0.6], [T.alivio + 0.05, 0.9, 0.8]]) {
      const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) continue;
      g.save();
      for (let i = 0; i < 5; i++) {
        const u = clamp(k * 1.3 - i * 0.08); if (u <= 0) continue;
        const em=poseG(t0+i*.08*dur/1.3),o=G.aPantalla(em,G.boca(em));
        const x=o.x+(20+26*tam+i*3)*u,y=o.y-(12+28*tam+i*2)*u,r=(3+15*u)*tam;
        g.globalAlpha = 0.6 * (1 - u); g.fillStyle = i % 2 ? "#d8d4cf" : "#f0ece8";
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
      g.restore();
    }
  }
  // rayitas de los saltitos y de los tragos
  function rayitas(g, t, pG) {
    g.save(); g.strokeStyle = "rgba(255,248,230,0.85)"; g.lineWidth = 1.6; g.lineCap = "round";
    for (const t0 of SALTOS) {
      const v = fase(t, t0 + 0.28, t0 + 0.54); if (v <= 0 || v >= 1) continue;
      g.globalAlpha = 1 - v;
      for (const [dx, sg] of [[-26, -1], [26, 1]]) { const x = XG + dx + sg * 8 * v; g.beginPath(); g.moveTo(x, SUELO - 3); g.lineTo(x + sg * 8, SUELO - 8 - 3 * v); g.stroke(); }
    }
    // glup: arquitos en el cuello a cada trago
    const tp = tragoPulso(t);
    if (tp > 0.05) {
      const c = G.aPantalla(pG, G.tronco(pG)(P(258, 258)));
      g.globalAlpha = tp; g.lineWidth = 1.3;
      for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(c.x - 6, c.y - 2, 7 + i * 4, Math.PI * 0.75, Math.PI * 1.25); g.stroke(); }
    }
    // ¡crac!: rayitas al aplastar el cartón
    const ka = fase(t, T.aplasta0 + 0.05, T.aplasta1 + 0.15);
    if (ka > 0 && ka < 1) {
      const o0 = cartonT(t, pG), o = P(o0.x + Math.cos(o0.b) * C_AG * EC, o0.y + Math.sin(o0.b) * C_AG * EC);
      g.globalAlpha = Math.sin(Math.PI * ka); g.lineWidth = 1.4;
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3, r0 = 14 + 6 * ka, r1 = r0 + 5; g.beginPath(); g.moveTo(o.x + Math.cos(a) * r0, o.y + Math.sin(a) * r0); g.lineTo(o.x + Math.cos(a) * r1, o.y + Math.sin(a) * r1); g.stroke(); }
    }
    g.restore();
  }
  // resplandor de la llamarada en toda la escena
  function resplandor(g, t, pG) {
    const k = fuegoK(t); if (k <= 0.005) return;
    const o = G.aPantalla(pG, G.boca(pG));
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(o.x + 30, o.y - 60, 10, o.x + 30, o.y - 60, 420);
    gr.addColorStop(0, `rgba(255,150,60,${0.22 * k})`); gr.addColorStop(1, "rgba(255,110,30,0)");
    g.fillStyle = gr; g.fillRect(o.x - 420, o.y - 480, 900, 900);
    g.restore();
  }

  /* ---------- cámara ---------- */
  const CAM = [
    [0, 0, { k: 1.42, x: 512, y: 266 }],
    [0.9, 1.5, { k: 1.8, x: 522, y: 280 }],
    [2.66, 3.2, { k: 1.46, x: 512, y: 262 }],
    [3.95, 4.5, { k: 2.05, x: 478, y: 270 }],
    [4.75, 5.15, { k: 2.75, x: 478, y: 318 }],
    [5.5, 6.1, { k: 1.56, x: 472, y: 252 }],
    [6.95, 7.45, { k: 2.45, x: 432, y: 205 }],
    [8.08, 8.46, { k: 1.25, x: 495, y: 228 }],
    [9.15, 9.7, { k: 1.4, x: 505, y: 268 }],
    [10.4, 10.85, { k: 1.66, x: 468, y: 238 }],
    [12.05, 12.6, { k: 1.46, x: 515, y: 262 }],
    [13.3, 14.4, { k: 1.53, x: 516, y: 258 }]
  ];
  function camara(t) {
    const c = pista(CAM, t);
    // tembleque suave durante la llamarada
    const fk = fuegoK(t); c.x += 2.2 * fk * Math.sin(t * 37); c.y += 1.6 * fk * Math.sin(t * 29 + 1);
    return c;
  }

  function poses(t) { return { g: poseG(t), s: poseS(t) }; }

  class LaSalsaPicante extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Sa.listo()) return;
      if (!fondo) { fondo = creaFondo(); neon = creaNeon(); MANTEL = creaMantel(); }
      const pG = poseG(t), pS = poseS(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      g.save(); g.globalAlpha = 0.86 + 0.1 * Math.sin(t * 1.4) + 0.04 * Math.sin(t * 7.3); g.drawImage(neon, 470 - 180, 128 - 100); g.restore();
      lampara(g, t);
      conoLuz(g, t);
      pieMesa(g);
      g.drawImage(MANTEL.c, MANTEL.ox, MANTEL.oy);
      // lo de encima del mantel, de atrás a delante
      const b = boteT(t), cS = pS.porcion, cG = pG.porcion, ca = pG.carton;
      const items = [
        { y: PLATO_G.y, f: () => { plato(g, PLATO_G); if (cG.quien === "mesa") porcion(g, cG, t); } },
        { y: PLATO_S.y, f: () => { plato(g, PLATO_S); if (cS.quien === "mesa") porcion(g, cS, t); } }
      ];
      if (b.quien === "mesa") items.push({ y: b.y + BOTE_BASE, f: () => { sombraObjeto(g, b.x, b.y + BOTE_BASE, 9); bote(g, b); } });
      if (ca.quien === "mesa") items.push({ y: ca.y + CART_MED, f: () => { sombraObjeto(g, ca.x, ca.y + CART_MED * (1 - 0.15 * (ca.ap || 0)), 12); carton(g, ca); } });
      items.sort((a, c) => a.y - c.y).forEach(it => it.f());
      // personajes
      Sa.dibujar(g, pS, t);
      G.dibujar(g, pG, t);
      if (cG.quien === "aire") porcion(g, cG, t);
      hiloQueso(g, t, pS);
      gotasSalsa(g, t);
      gotaG(g, t);
      humoPinchos(g, t, pG);
      vapor(g, t, pG);
      llamarada(g, t, pG);
      humoBoca(g, t, pG);
      rayitas(g, t, pG);
      resplandor(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00128.2", nombre: "Guillermo y Sara · La salsa picante", crear: () => new LaSalsaPicante() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["s", Sa, poseS(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m || !m.puno) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00128_2 = { puntoPorcion, puntaP,perfilBocado,boquilla,picoCarton,ladoCarton,cartonMesa, yemaSara, gotaUnica,GOTA_LOC,GOTAS_S,salsaS,porcion,carton,fuenteHumo,SALTOS,  pose: poses, poseG, poseS, T, DUR, diag, boteT };
})();
