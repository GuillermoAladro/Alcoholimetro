"use strict";
/* 00100.2 · Guillermo y Marta · El baile en la cocina
 *
 * Negro → una cocina acogedora de noche: pared verde salvia, azulejo blanco con una cenefa de colores,
 * una encimera de madera a la izquierda con una balda alta (tarros sin etiqueta y un saco de harina),
 * una cocina de esmalte crema con una olla que hierve, una lámpara colgante de cobre, una ventana con la
 * ciudad y la luna, una barra de cacharros colgados (una sartén), un aparador con una radio antigua de la
 * que salen notas, una nevera redonda y un suelo de damero.
 *
 * Marta baila removiendo la olla al compás (cadera, melena), saca la cuchara de palo, da un toque en el
 * borde y canta con ella como micrófono → Guillermo entra deslizándose por el suelo desde la derecha,
 * con los brazos abiertos, y frena con un «¡tachán!» → baile exageradísimo (brazos, la «rueda», pose) →
 * descuelga la sartén y la toca como una guitarra (rasgueos y cabezazos a ritmo); Marta le canta → molino,
 * salto… y sale girando como una peonza por el suelo, pasa por delante de Marta (que se aparta y se da la
 * vuelta) y se estampa de espaldas contra la encimera → la balda tiembla, el saco de harina se tambalea,
 * se vuelca, le cae en la cabeza y ¡PUF!: una nube de harina los envuelve a los dos → cuando se aclara,
 * están blancos de arriba abajo; parpadean (se les quedan los ojos limpios), se miran… y se parten de risa;
 * siguen bailando, soltando harina a cada paso → pose final a cámara y guiño de Marta → negro.
 *
 * Música: 112 pulsaciones por minuto (un tiempo cada 0,536 s desde 0,6 s). Sin textos: solo notas.
 * La harina sobre los dos es una capa aparte (un lienzo con los dos personajes, teñido con
 * «source-atop» y con huecos en los ojos y la boca); nada lee píxeles. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash, mezcla, rectanguloRedondeado } = M2;
  const G = Guillermo, M = Marta;
  const DUR = 15.0, TAU = Math.PI * 2;
  const TINTA = "#0b0a0e";
  const BT = 60 / 112, B0 = 0.6;
  const golpe = n => B0 + n * BT;

  /* ---------- guion (s) ---------- */
  const T = {
    remueve0: golpe(0) - 0.25, remueve1: golpe(4),
    saca0: golpe(4), saca1: golpe(4) + 0.3, toque: golpe(5), micro0: golpe(5) + 0.08, micro1: golpe(5) + 0.42, canta: golpe(6),
    entra0: 3.5, entra1: 4.72, tachan: golpe(8), mOjo: golpe(8) + 0.18, mOjo1: golpe(9) + 0.2,
    baile: [golpe(9), golpe(10), golpe(11)], pose1: golpe(11) + 0.12,
    coge0: golpe(11) + 0.2, coge: golpe(11) + 0.42, guitarra: golpe(12),
    mHacia0: golpe(12) + 0.06, mHacia1: golpe(14) + 0.1,
    molino0: golpe(15) + 0.1, salto: golpe(16), giro0: golpe(16) + 0.08, choque: 10.0,
    mUy: 9.3, mCorre0: 10.22, mCorre1: 10.7,
    saco0: 10.04, miran: 10.74, vuelca: 10.82, cae: 11.0, paf: 11.12,
    aclara0: 11.47, aclara1: 12.22,
    parpadeo: 12.42, seMiran: 12.62, risa0: 12.82, risa1: 13.5,
    pasos: [golpe(24) + 0.06, golpe(25)], pose: 14.26, camara: 14.3, guino: 14.46,
    fin: 14.6
  };

  /* ---------- utilidades ---------- */
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.9, 1, 1, 1, 0.95), PUNO = D(0, 0), AGARRA = D(0.25, 0.3, 0.28, 0.26, 0.24),
    JAZZ = D(1, 1, 1, 1, 1), RASGA = D(0.75, 0.75, 0.7, 0.65, 0.6), CADERA = D(0.2, 0.15, 0.12, 0.12, 0.12);
  const pulso = (t, t0, a = 0.06, d = 0.3) => { if (t < t0) return 0; const u = (t - t0) / d; return u > 1 ? 0 : Math.sin(Math.PI * Math.min(1, u / a * 0.5)) * (1 - u); };
  // golpe de cada tiempo: sube rápido y cae despacio (0..1)
  const acento = (t, desde, hasta) => {
    if (t < desde || t > hasta) return 0;
    const u = (((t - B0) / BT) % 1 + 1) % 1;
    const pico = u < 0.12 ? Math.sin(u / 0.12 * Math.PI / 2) : Math.pow(1 - (u - 0.12) / 0.88, 2);
    return pico * tramo(t, desde, desde + 0.08) * (1 - tramo(t, hasta - 0.08, hasta));
  };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px del mundo)
   * ===================================================================================== */
  const S = 0.3, SUELO = 560;
  const ENC = 352, BASE_MUEBLE = 470;                     // encimeras y zócalo
  const ESQ = 152;                                        // esquina derecha de la encimera de la izquierda
  const BALDA = { x0: -110, x1: 208, y: 100 };            // balda alta (el saco está en la punta)
  const COCINA = { x0: 633, x1: 785 };
  const OLLA = { x: 667, y: ENC, w: 66, h: 40 };          // base en la encimera
  const VENTANA = { x0: 236, x1: 400, y0: 112, y1: 300 };
  const BARRA = { x0: 446, x1: 616, y: 222 };
  const SARTEN_GANCHO = { x: 534, y: BARRA.y + 6 };
  const RADIO = { x: 916, y: ENC };
  const NEVERA = { x0: 1034, x1: 1196, y0: 148 };
  const LAMPARA = { x: 540, y: 46 };
  const PY = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const TOBY = rig => SUELO - rig.TOBILLO_ALTO * S * rig.K;
  const deHoja = (R, p, q) => R.aPantalla(p, R.tronco(p)(q));
  const deRetrato = (R, p, q) => R.aPantalla(p, R.cabeza(p).a(q));
  const deSheet = (R, p, q) => R.aPantalla(p, q);

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_DIB = null;                                  // transformación del personaje que se está dibujando
  function enMundo(g, f) { g.save(); g.setTransform(BASE_DIB); f(); g.restore(); }
  const evalua = (o, c, t) => (typeof o === "function" ? o(c, t) : o);
  // mano: { x, y (hoja), mu, ang, dedos, dobla, puno }
  const mezclaMano = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerpAng(a.ang || 0, b.ang || 0, k), mu: lerpAng(a.mu, b.mu, k),
    dedos: mezclaD(a.dedos, b.dedos, k), dobla: k < 0.5 ? a.dobla : b.dobla, puno: lerp(a.puno ?? 1, b.puno ?? 1, k), objeto: k < 0.5 ? a.objeto : b.objeto });
  function pista(lista, c, t) {
    let m = evalua(lista[0][2], c, t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      m = mezclaMano(m, evalua(obj, c, t), (f || suave)(fase(t, t0, t1)));
    }
    return m;
  }
  // hacia el codo: desde la mano hacia el hombro (con un giro)
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + (off || 0);
  // mano en coordenadas del torso (hoja)
  function enTronco(R, p, q, o, lado) {
    const T = R.tronco(p), h = T(q), hom = T(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO);
    return Object.assign({ ang: 0, puno: 1, dobla: -1, dedos: RELAJADA, mu: muHacia(h, hom, (o && o.mo) || 0) }, o, { x: h.x, y: h.y });
  }
  // mano en coordenadas de la hoja
  function enHojaMano(R, p, h, o, lado) {
    const hom = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO);
    return Object.assign({ ang: 0, puno: 1, dobla: -1, dedos: RELAJADA, mu: muHacia(h, hom, (o && o.mo) || 0) }, o, { x: h.x, y: h.y });
  }
  // mano en el mundo
  function enMundoMano(R, p, w, o, lado) {
    const h = R.aHoja(p, w), hom = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO);
    return Object.assign({ ang: 0, puno: 1, dobla: -1, dedos: RELAJADA, mu: muHacia(h, hom, (o && o.mo) || 0) }, o, { x: h.x, y: h.y });
  }

  /* =====================================================================================
   * OBJETOS: cuchara de palo, sartén, olla, saco
   * ===================================================================================== */
  // cuchara: agarre en (x, y) del mundo, apunta en `a` (del agarre hacia la pala)
  function dibCuchara(g, x, y, a, clipOlla) {
    g.save();
    if (clipOlla) {               // la parte metida en la olla queda detrás de su pared
      g.beginPath(); g.rect(x - 200, y - 200, 400, 400);
      g.moveTo(OLLA.x - OLLA.w / 2 + 2, OLLA.y - OLLA.h + 4); g.ellipse(OLLA.x, OLLA.y - OLLA.h + 4, OLLA.w / 2 - 2, 6, 0, Math.PI, 0, true);
      g.lineTo(OLLA.x + OLLA.w / 2 - 2, OLLA.y + 20); g.lineTo(OLLA.x - OLLA.w / 2 + 2, OLLA.y + 20); g.closePath();
      g.clip("evenodd");
    }
    g.translate(x, y); g.rotate(a); g.lineJoin = "round"; g.lineCap = "round";
    // mango (de -12 a 40) y pala (40..58)
    g.fillStyle = "#d9a865"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-13, -2.2); g.lineTo(40, -1.8); g.lineTo(40, 1.8); g.lineTo(-13, 2.2); g.quadraticCurveTo(-15.5, 0, -13, -2.2); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(50, 0, 10, 6.4, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#b9824a"; g.beginPath(); g.ellipse(51, 0.5, 6.5, 3.6, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(120,70,30,0.45)"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-8, 0.4); g.lineTo(34, 0.3); g.stroke();
    g.restore();
  }
  // sartén: agarre (punta del mango) en (x, y), el mango va hacia `a` hasta el aro; radio del aro r
  const SART = { mango: 50, r: 28 };
  function dibSarten(g, x, y, a, harina) {
    g.save(); g.translate(x, y); g.rotate(a); g.lineJoin = "round"; g.lineCap = "round";
    const L = SART.mango, r = SART.r, cx = L + r - 2;
    // mango: empuñadura de madera y varilla de hierro
    g.fillStyle = "#2a2a2e"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(10, -3); g.lineTo(L + 4, -2.4); g.lineTo(L + 4, 2.4); g.lineTo(10, 3); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#9b5b2e"; g.beginPath(); rectanguloRedondeado(g, -14, -4.6, 26, 9.2, 4.5); g.fill(); g.stroke();
    g.fillStyle = "#f0e2c4"; g.beginPath(); g.arc(-8, 0, 1.9, 0, TAU); g.fill(); g.stroke();
    // aro (de frente: el fondo de hierro con su brillo)
    g.fillStyle = "#1f2024"; g.beginPath(); g.arc(cx, 0, r, 0, TAU); g.fill(); g.lineWidth = 2; g.stroke();
    const gr = g.createRadialGradient(cx - 8, -9, 2, cx, 0, r); gr.addColorStop(0, "#5d6168"); gr.addColorStop(1, "#26272c");
    g.fillStyle = gr; g.beginPath(); g.arc(cx, 0, r - 4.5, 0, TAU); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 1; g.beginPath(); g.arc(cx, 0, r - 4.5, 0, TAU); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2.4; g.beginPath(); g.arc(cx, 0, r - 9, -2.4, -1.5); g.stroke();
    if (harina) { g.fillStyle = `rgba(250,248,240,${0.85 * harina})`; for (let i = 0; i < 7; i++) { const aa = hash(i * 3.3) * TAU, rr = (r - 8) * Math.sqrt(hash(i * 7.1)); g.beginPath(); g.arc(cx + Math.cos(aa) * rr, Math.sin(aa) * rr, 2 + 3 * hash(i), 0, TAU); g.fill(); } }
    g.restore();
  }
  // olla (de esmalte rojo) en la encimera
  function dibOlla(g, t) {
    const { x, y, w, h } = OLLA;
    g.save(); g.lineJoin = "round";
    // asas
    g.fillStyle = "#2b2b30"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    for (const sg of [-1, 1]) { g.beginPath(); rectanguloRedondeado(g, x + sg * (w / 2 + 2) - 5, y - h + 8, 10, 6, 3); g.fill(); g.stroke(); }
    // cuerpo
    const gc = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gc.addColorStop(0, "#a8302a"); gc.addColorStop(0.35, "#e2533f"); gc.addColorStop(1, "#962a24");
    g.fillStyle = gc; g.beginPath(); g.moveTo(x - w / 2, y - h + 4); g.lineTo(x - w / 2 + 2, y - 3); g.quadraticCurveTo(x - w / 2 + 3, y, x - w / 2 + 8, y);
    g.lineTo(x + w / 2 - 8, y); g.quadraticCurveTo(x + w / 2 - 3, y, x + w / 2 - 2, y - 3); g.lineTo(x + w / 2, y - h + 4); g.closePath(); g.fill(); g.lineWidth = 1.8; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.28)"; g.beginPath(); g.ellipse(x - w / 4, y - h / 2, 4, h / 3, 0, 0, TAU); g.fill();
    g.fillStyle = "#f6efe2"; g.beginPath(); g.ellipse(x + 6, y - h / 2 + 3, 9, 6, 0, 0, TAU); g.fill();   // lunar blanco del esmalte
    g.fillStyle = "#e2533f"; g.beginPath(); g.ellipse(x + 6, y - h / 2 + 3, 4, 2.6, 0, 0, TAU); g.fill();
    // boca: borde y el guiso
    g.fillStyle = "#8b2420"; g.beginPath(); g.ellipse(x, y - h + 4, w / 2, 7, 0, 0, TAU); g.fill(); g.lineWidth = 1.8; g.stroke();
    g.fillStyle = "#e09a3a"; g.beginPath(); g.ellipse(x, y - h + 5.5, w / 2 - 4, 4.6, 0, 0, TAU); g.fill();
    const bur = (t * 1.7) % 1;
    g.fillStyle = "rgba(255,230,170,0.85)"; for (let i = 0; i < 3; i++) { const u = (bur + i / 3) % 1, bx = x - 18 + 18 * i + 4 * Math.sin(i * 2 + t); g.beginPath(); g.arc(bx, y - h + 5, 1.2 + 2.2 * Math.sin(Math.PI * u), 0, TAU); g.fill(); }
    g.restore();
  }
  // vapor de la olla: bocanadas suaves que suben y se abren
  function vapor(g, t, dens) {
    if (!BOLA || dens < 0.01) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const u = ((t * 0.38 + i / 7) % 1), x = OLLA.x - 14 + 28 * hash(i * 3.1) + 10 * Math.sin(u * 4 + i) * u, y = OLLA.y - OLLA.h - 4 - 92 * u;
      const r = 7 + 20 * u;
      g.globalAlpha = 0.32 * Math.sin(Math.PI * Math.min(1, u * 1.4)) * (1 - u) * dens;
      g.drawImage(BOLA, x - r, y - r, 2 * r, 2 * r);
    }
    g.restore();
  }

  /* =====================================================================================
   * MARTA (mira siempre a la izquierda: a la olla, a Guillermo y luego corre hacia él)
   * ===================================================================================== */
  const XM0 = 760, XM1 = 600, XM2 = 352;
  const CARAS_M = {
    tararea: E({ mx: 0.8, my: 0.6, c: 0.55, h: 0.6, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.65, ancho: 0.9, rub: 0.2 }),
    cuchara: E({ mx: 0.75, my: -0.1, c: 0.2, sd: 16, gd: 0.05, si: 16, gi: 0.05, sonr: 0.75, ancho: 0.95, rub: 0.2 }),
    canta: E({ mx: 0.5, my: -0.2, c: 1, h: 0.7, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 14, ancho: 0.62, sonr: 0.25, rub: 0.25 }),
    unOjo: E({ mx: 0.95, my: 0.1, c: 0, wd: 1, sd: 22, gd: 0.1, si: 6, gi: 0, abre: 10, ancho: 0.62, sonr: 0.45, rub: 0.25 }),
    risaCanta: E({ mx: 0.6, my: -0.1, c: 1, h: 1, sd: 20, gd: 0.08, si: 20, gi: 0.08, abre: 18, ancho: 0.95, sonr: 0.95, rub: 0.35 }),
    cantaEl: E({ mx: 0.95, my: 0.05, c: 0.15, sd: 24, gd: 0.1, si: 24, gi: 0.1, abre: 15, ancho: 0.7, sonr: 0.55, rub: 0.3 }),
    uy: E({ mx: 0.95, my: 0, iris: 0.8, c: 0, sd: 30, gd: 0.18, si: 30, gi: 0.18, abre: 18, ancho: 0.6, sonr: -0.1 }),
    encoge: E({ mx: 0.9, my: 0.1, c: 1, z: 1, sd: 6, gd: 0.2, si: 6, gi: 0.2, abre: 8, ancho: 0.9, sonr: -0.4 }),
    preocupa: E({ mx: 0.95, my: 0.15, c: 0.05, sd: 26, gd: 0.26, si: 26, gi: 0.26, abre: 8, ancho: 0.6, sonr: -0.2 }),
    arriba: E({ mx: 0.4, my: -0.95, iris: 0.85, c: 0, sd: 28, gd: 0.22, si: 28, gi: 0.22, abre: 6, ancho: 0.55, sonr: -0.2 }),
    aprieta: E({ mx: 0, my: 0, c: 1, z: 1, sd: 4, gd: 0.18, si: 4, gi: 0.18, abre: 0, ancho: 0.7, sonr: -0.3 }),
    pasmada: E({ mx: 0, my: 0, c: 1, sd: 2, gd: 0, si: 2, gi: 0, abre: 0, ancho: 0.65, sonr: -0.05 }),
    mira: E({ mx: 0.95, my: 0, c: 0.05, iris: 1, sd: 6, gd: 0, si: 6, gi: 0, abre: 0, ancho: 0.6, sonr: 0 }),
    risa: E({ mx: 0.5, my: 0, c: 1, h: 1, z: 0.3, sd: 24, gd: 0.1, si: 24, gi: 0.1, abre: 22, ancho: 1.05, sonr: 1, rub: 0.4 }),
    baila: E({ mx: 0.95, my: 0, c: 0.2, h: 0.4, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 8, ancho: 0.95, sonr: 0.95, rub: 0.35 }),
    camara: E({ mx: -0.85, my: 0, c: 0.25, h: 0.35, sd: 16, gd: 0.06, si: 16, gi: 0.06, abre: 4, ancho: 0.95, sonr: 0.9, rub: 0.35 })
  };
  const GUION_CARA_M = [
    [T.saca0 - 0.1, T.saca0 + 0.12, "cuchara"], [T.micro1 - 0.1, T.canta, "canta"], [T.mOjo, T.mOjo + 0.12, "unOjo"],
    [T.mOjo1, T.mOjo1 + 0.2, "risaCanta"], [T.guitarra - 0.3, T.guitarra, "cantaEl"], [T.mUy - 0.04, T.mUy + 0.1, "uy"],
    [T.choque - 0.02, T.choque + 0.06, "encoge"], [T.choque + 0.14, T.choque + 0.26, "preocupa"], [T.miran - 0.05, T.miran + 0.12, "arriba"],
    [T.cae - 0.04, T.cae + 0.06, "aprieta"], [T.paf + 0.1, T.paf + 0.3, "pasmada"], [T.parpadeo + 0.08, T.parpadeo + 0.14, "mira"],
    [T.risa0 - 0.06, T.risa0 + 0.08, "risa"], [T.risa1, T.risa1 + 0.2, "baila"], [T.camara - 0.08, T.camara + 0.14, "camara"]
  ];
  // pasos alternos (mismo criterio que la 00096): x de pantalla de los dos pies
  function pasos(t, t0, t1, x0, x1, n, w, alto, lider, out) {
    if (t <= t0) return out;
    const movs = n + 1, d = (t1 - t0) / movs;
    let pie = lider;
    for (let j = 0; j < movs; j++) {
      const a = t0 + j * d, b = a + d, dest = (j < n ? lerp(x0, x1, (j + 1) / n) : x1) + (pie === "c" ? -w : w);
      if (t >= b) out[pie] = dest;
      else if (t > a) { const k = fase(t, a, b); out[pie] = lerp(out[pie], dest, suave(k)); out["y" + pie] = alto * Math.sin(Math.PI * k); break; }
      pie = pie === "c" ? "l" : "c";
    }
    return out;
  }
  function piesM(t) {
    const w = -18;
    const out = { c: XM0 - w, l: XM0 + w, yc: 0, yl: 0 };
    pasos(t, T.mHacia0, T.mHacia1, XM0, XM1, 2, w, 13, "l", out);
    pasos(t, T.mCorre0, T.mCorre1, XM1, XM2, 3, w, 18, "l", out);
    return out;
  }
  // vaivén de la cadera (un ciclo cada dos tiempos)
  const vaiven = t => Math.sin(Math.PI * (t - B0) / BT);
  const bailaM = t => tramo(t, 0.35, 0.8) * (1 - tramo(t, T.mUy - 0.1, T.mUy + 0.1)) + tramo(t, T.risa1 - 0.3, T.risa1);
  function poseM(t) {
    const ba = bailaM(t), v = vaiven(t), v0 = vaiven(t - 0.08);
    const respira = Math.sin(t * 2.0 + 0.7);
    const ps = piesM(t), ps0 = piesM(t - 0.06);
    let paso = 0; for (const tp of T.pasos) paso += 10 * campana(t, tp - 0.08, tp + BT - 0.1) * (tp === T.pasos[0] ? 1 : -1);
    const x = (ps.c + ps.l) / 2;
    const corre = dentro(t, T.mCorre0 - 0.05, T.mCorre0 + 0.1, T.mCorre1 - 0.1, T.mCorre1 + 0.05);
    const anda = dentro(t, T.mHacia0, T.mHacia0 + 0.1, T.mHacia1 - 0.1, T.mHacia1);
    const p = {
      x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, sx: 1 - 2 * tramo(t, T.salto - 0.58, T.salto - 0.35) + 2 * tramo(t, T.mUy + 0.08, T.mUy + 0.36),
      torso: 0, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // cuerpo
    const remueve = dentro(t, T.remueve0, T.remueve0 + 0.2, T.saca0, T.saca1);
    const canta = dentro(t, T.micro0, T.micro1, T.mUy, T.mUy + 0.15);
    const haciaEl = dentro(t, T.guitarra - 0.3, T.guitarra, T.mUy, T.mUy + 0.15);
    const uy = dentro(t, T.mUy - 0.04, T.mUy + 0.06, T.choque - 0.1, T.choque + 0.05);
    const enc = campana(t, T.choque - 0.04, T.choque + 0.3);
    const arriba = dentro(t, T.miran - 0.05, T.miran + 0.15, T.cae, T.cae + 0.1);
    const encoge = dentro(t, T.cae - 0.05, T.cae + 0.05, T.paf + 0.4, T.paf + 0.8);
    const risa = dentro(t, T.risa0, T.risa0 + 0.08, T.risa1, T.risa1 + 0.2);
    const inclinaEl = dentro(t, T.mCorre1 - 0.05, T.mCorre1 + 0.1, T.miran, T.miran + 0.1);
    p.torso = 0.07 * remueve - 0.05 * canta + 0.06 * haciaEl - 0.12 * uy + 0.08 * enc + 0.14 * corre + 0.12 * inclinaEl + 0.05 * encoge + 0.04 * risa + 0.045 * v * ba;
    p.cabeza.ang = 0.1 * remueve - 0.1 * canta + 0.05 * haciaEl - 0.08 * uy + 0.06 * corre + 0.08 * inclinaEl - 0.2 * arriba - 0.06 * v * ba + 0.05 * encoge;
    // risa: sacudidas
    p.torso += 0.03 * Math.sin((t - T.risa0) * 30) * risa; p.cabeza.ang += 0.04 * Math.sin((t - T.risa0) * 30 + 0.8) * risa;
    // la cadera va de lado a lado; baja un poco en cada tiempo; al correr, rebote
    const ac = acento(t, 0.4, DUR) * ba;
    const bob = Math.max(ps.yc, ps.yl) * 0.25;
    const pelX = x + 6 * v * ba + paso * 0.4 - 8 * corre;
    const pelY = PY(M) + respira * 0.7 + 3 * ac + 5 * encoge + 4 * enc - 4 * uy - bob + 3 * inclinaEl;
    p.pelvis = M.aHoja(p, { x: pelX, y: pelY });
    const TOB = TOBY(M);
    const lc = 10 * campana(t, T.pasos[0] - 0.08, T.pasos[0] + 0.22), ll = 10 * campana(t, T.pasos[1] - 0.08, T.pasos[1] + 0.22);
    p.piernas.cerca = { tob: M.aHoja(p, { x: ps.c + paso, y: TOB - ps.yc - lc }), ang: 0.12 * Math.sin(Math.PI * clamp(ps.yc / 18)) };
    p.piernas.lejos = { tob: M.aHoja(p, { x: ps.l + paso, y: TOB - ps.yl - ll }), ang: 0.12 * Math.sin(Math.PI * clamp(ps.yl / 18)) };
    // pelo: inercia del vaivén, de la carrera y viento de la nube
    const vel = (v - v0) / 0.08 * ba + ((ps.c + ps.l) - (ps0.c + ps0.l)) / 0.12 * 0.01;
    p.pelo = { viento: 0.6 * campana(t, T.paf, T.paf + 0.6), inercia: clamp(-vel * 0.12 + 0.3 * p.torso * 4 + 0.6 * corre, -1, 1) };
    // cara
    const ex = guion(GUION_CARA_M, CARAS_M, "tararea", t);
    if (canta > 0.5 && t < T.mUy) { ex.abre += 3 * Math.sin(t * 17) * (ex.c > 0.5 ? 1 : 0.6); }
    ex.wd = Math.max(ex.wd, campana(t, T.guino, T.guino + 0.45));
    if (risa > 0) ex.abre += 4 * Math.abs(Math.sin((t - T.risa0) * 15)) * risa;
    p.cara = cara(ex, parpadeo(t, [1.9, 6.6, 8.3, 9.8, 12.2, T.parpadeo, 13.9]));
    p.rojo = 0;
    manosM(p, t);
    return p;
  }
  // la cuchara: en la mano lejana (remueve, la saca, toca el borde), por el aire y en la mano cercana (micro)
  const T_LANZA = golpe(5) + 0.1, T_ATRAPA = golpe(5) + 0.4;
  // la mano de la olla se piensa mirando a la derecha y se refleja alrededor de la olla
  const refleja = q => ({ x: 2 * OLLA.x - q.x, y: q.y, a: Math.PI - q.a, olla: q.olla });
  function cucharaLejos(t) {
    const ang = (t - B0) / BT * TAU;
    const rem = { x: OLLA.x - 4 + 7 * Math.cos(ang), y: OLLA.y - OLLA.h - 26 + 2.5 * Math.sin(ang), a: Math.PI / 2 + 0.22 + 0.12 * Math.cos(ang), olla: 1 };
    const sacada = { x: OLLA.x - 8, y: OLLA.y - OLLA.h - 50, a: Math.PI / 2 + 0.45, olla: 0 };
    const tq = campana(t, T.toque - 0.09, T.toque + 0.09);
    const toque = { x: OLLA.x - OLLA.w / 2 + 60 * Math.sin(0.7), y: OLLA.y - OLLA.h + 4 - 60 * Math.cos(0.7) - 9 * (1 - tq), a: Math.PI / 2 + 0.7, olla: 0 };
    const carga = { x: OLLA.x - 22, y: OLLA.y - OLLA.h - 46, a: Math.PI / 2 + 1.1, olla: 0 };
    const lista = [[0, 0, rem], [T.saca0, T.saca1, sacada], [T.saca1 + 0.05, T.toque - 0.1, toque], [T.toque + 0.02, T_LANZA, carga]];
    let c = Object.assign({}, lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, o] = lista[i]; if (t <= t0) break; const k = suave(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), a: lerpAng(c.a, o.a, k), olla: lerp(c.olla, o.olla, k) };
    }
    return refleja(c);
  }
  // agarre del micrófono (mano cercana) delante del pecho, con la pala en la boca
  function micro(p) {
    const bo = M.aPantalla(p, M.boca(p)), fr = p.espejo ? -1 : 1;
    const ag = { x: bo.x - 3 * fr, y: bo.y + 55 }, pala = { x: bo.x + 8 * fr, y: bo.y + 2 };
    return { ag, a: Math.atan2(pala.y - ag.y, pala.x - ag.x) };
  }
  // ángulos de la cuchara en la mano cercana (como en la hoja: 0 = hacia delante, −π/2 = arriba)
  const aHojaMundo = (p, a) => (p.espejo ? Math.PI - a : a);
  let recepcionCuchara = null;
  function manosM(p, t) {
    const ctx = { p };
    // brazo de correr: se balancea a contrapié de los pasos
    const braceo = (lado) => (c, t) => { const u = Math.sin((t - T.mCorre0) / (T.mCorre1 - T.mCorre0) * 4 * Math.PI) * (lado === "lejos" ? 1 : -1);
      return enTronco(M, c.p, { x: (lado === "lejos" ? 370 : 150) + 70 * u, y: 520 - 30 * Math.abs(u) }, { dedos: lado === "lejos" ? PUNO : AGARRA, dobla: -1, mo: 0 }, lado); };
    const lejos = [
      [0, 0, (c, t) => { const q = cucharaLejos(t); return enMundoMano(M, c.p, q, { dedos: AGARRA, dobla: -1, mo: 0.15 }, "lejos"); }],
      // suelta la cuchara y canta con la mano abierta hacia delante
      [T_LANZA, T_LANZA + 0.3, (c, t) => enTronco(M, c.p, { x: 560 + 10 * Math.sin(t * 3), y: 400 + 12 * vaiven(t) }, { dedos: ABRE, dobla: -1, mo: -0.3 }, "lejos")],
      // a Guillermo: palma arriba, hacia él, mientras se acerca
      [T.guitarra - 0.35, T.guitarra, (c, t) => enTronco(M, c.p, { x: 515, y: 380 + 14 * vaiven(t) }, { dedos: ABRE, dobla: -1, mo: -0.35 }, "lejos")],
      // ¡uy!: mano arriba, palma fuera
      [T.mUy - 0.04, T.mUy + 0.12, () => enTronco(M, p, { x: 470, y: 170 }, { dedos: JAZZ, dobla: 1, mo: 0.2 }, "lejos")],
      // ¡pum!: se tapa la boca
      [T.choque - 0.04, T.choque + 0.1, (c) => { const b = M.boca(c.p); return enHojaMano(M, c.p, { x: b.x - 10, y: b.y + 40 }, { dedos: ABRE, dobla: -1, mo: -0.5 }, "lejos"); }],
      [T.mCorre0 - 0.04, T.mCorre0 + 0.06, braceo("lejos")],
      // se inclina hacia él con la mano tendida
      [T.mCorre1 - 0.08, T.mCorre1 + 0.06, () => enTronco(M, p, { x: 470, y: 500 }, { dedos: ABRE, dobla: -1, mo: -0.3 }, "lejos")],
      // se encoge cuando cae el saco
      [T.cae - 0.08, T.cae + 0.04, () => enTronco(M, p, { x: 440, y: 300 }, { dedos: PUNO, dobla: -1 }, "lejos")],
      [T.paf + 0.3, T.paf + 0.6, () => enTronco(M, p, { x: 440, y: 560 }, { dedos: ABRE, dobla: -1, mo: -0.2 }, "lejos")],
      // risa: mano en la tripa
      [T.risa0 - 0.05, T.risa0 + 0.12, () => enTronco(M, p, { x: 360, y: 560 }, { dedos: RELAJADA, dobla: -1 }, "lejos")],
      // baila: mano arriba al compás
      [T.risa1, T.risa1 + 0.2, (c, t) => enTronco(M, c.p, { x: 430 + 16 * vaiven(t), y: 120 - 20 * acento(t, 0, DUR) }, { dedos: JAZZ, dobla: 1, mo: 0.2 }, "lejos")],
      // pose: la mano en la cadera
      [T.pose - 0.1, T.pose + 0.12, () => enTronco(M, p, { x: 330, y: 610 }, { dedos: CADERA, dobla: -1, mo: 0.3 }, "lejos")]
    ];
    const l = pista(lejos, ctx, t);
    const cerca = [
      [0, 0, (c) => Object.assign(M.manoReposo(c.p, "cerca"), { dedos: RELAJADA })],
      [T_LANZA - 0.12, T_ATRAPA - 0.04, (c) => { const m = micro(c.p); return enMundoMano(M, c.p, { x: m.ag.x + 4, y: m.ag.y + 6 }, { dedos: ABRE, dobla: -1, mo: 0.1 }, "cerca"); }],
      [T_ATRAPA - 0.04, T_ATRAPA, (c) => enMundoMano(M, c.p, micro(c.p).ag, { dedos: AGARRA, dobla: -1, mo: 0.1 }, "cerca")],
      [T.mUy - 0.04, T.mUy + 0.12, () => enTronco(M, p, { x: 150, y: 110 }, { dedos: AGARRA, dobla: 1, mo: 0.1 }, "cerca")],
      [T.choque - 0.04, T.choque + 0.12, () => enTronco(M, p, { x: 220, y: 420 }, { dedos: AGARRA, dobla: -1 }, "cerca")],
      [T.mCorre0 - 0.04, T.mCorre0 + 0.06, braceo("cerca")],
      [T.mCorre1 - 0.08, T.mCorre1 + 0.06, () => enTronco(M, p, { x: 230, y: 470 }, { dedos: AGARRA, dobla: -1 }, "cerca")],
      [T.cae - 0.08, T.cae + 0.04, () => enTronco(M, p, { x: 240, y: 330 }, { dedos: AGARRA, dobla: -1 }, "cerca")],
      [T.paf + 0.3, T.paf + 0.6, () => enTronco(M, p, { x: 250, y: 450 }, { dedos: AGARRA, dobla: -1 }, "cerca")],
      [T.risa1, T.risa1 + 0.2, (c) => enMundoMano(M, c.p, micro(c.p).ag, { dedos: AGARRA, dobla: -1, mo: 0.1 }, "cerca")]
    ];
    const n = pista(cerca, ctx, t);
    // la cuchara
    const mh = m => M.aPantalla(p, { x: m.x, y: m.y });
    const aMic = micro(p).a;
    let obj;
    if (t < T_LANZA) {
      const q = cucharaLejos(t), h = mh(l);
      obj = { mano: "lejos", x: h.x, y: h.y, a: q.a, olla: q.olla > 0.5 };
    } else if (t < T_ATRAPA) {
      if (!recepcionCuchara) recepcionCuchara = micro(poseM(T_ATRAPA));
      const u = fase(t, T_LANZA, T_ATRAPA), q0 = cucharaLejos(T_LANZA), h = recepcionCuchara.ag;
      obj = { mano: null, x: lerp(q0.x, h.x, u), y: lerp(q0.y, h.y, u) - 60 * 4 * u * (1 - u), a: lerpAng(q0.a, recepcionCuchara.a, u) + TAU * suave(u), olla: false };
    } else {
      // en la mano cercana: micro, en alto, sujeta…
      const A = [
        [0, 0, aMic],
        [T.mUy - 0.04, T.mUy + 0.12, aHojaMundo(p, -Math.PI / 2 - 0.2)],
        [T.choque - 0.04, T.choque + 0.12, aHojaMundo(p, -1.15)],
        [T.mCorre0 - 0.04, T.mCorre0 + 0.1, aHojaMundo(p, -0.5)],
        [T.mCorre1 - 0.08, T.mCorre1 + 0.06, aHojaMundo(p, -1.15)],
        [T.risa1, T.risa1 + 0.2, aMic]
      ];
      let a = A[0][2]; for (let i = 1; i < A.length; i++) { const [t0, t1, b] = A[i]; if (t <= t0) break; a = lerpAng(a, b, suave(fase(t, t0, t1))); }
      if (t > T.risa1 + 0.2) a = aMic;
      const h = mh(n);
      obj = { mano: "cerca", x: h.x, y: h.y, a, olla: false };
    }
    p.cuchara = obj;
    const dib = g => enMundo(g, () => dibCuchara(g, obj.x, obj.y, obj.a, obj.olla));
    if (obj.mano === "lejos") l.objeto = dib; else if (obj.mano === "cerca") n.objeto = dib;
    p.manoLejos = l; p.manoCerca = n;
  }
  function cucharaAire(g, pM) { if (pM.cuchara && !pM.cuchara.mano) { BASE_DIB = g.getTransform(); dibCuchara(g, pM.cuchara.x, pM.cuchara.y, pM.cuchara.a, false); } }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const XG = 430, XG_FIN = 194;
  const CARAS_G = {
    desliza: E({ mx: 0.95, my: 0, c: 0, iris: 1.05, sd: 26, gd: 0.08, si: 26, gi: 0.08, abre: 14, ancho: 1.05, sonr: 1 }),
    tachan: E({ mx: 0.95, my: 0, c: 0.2, h: 0.4, sd: 26, gd: 0.06, si: 26, gi: 0.06, abre: 20, ancho: 1.1, sonr: 1 }),
    chulo: E({ mx: -0.85, my: 0, c: 0.35, sd: 18, gd: 0.06, si: 14, gi: 0.02, abre: 3, ancho: 1.05, sonr: 0.9 }),
    lengua: E({ mx: 0.9, my: 0.2, c: 0.45, h: 0.5, sd: 14, gd: 0.04, si: 14, gi: 0.04, abre: 9, ancho: 0.85, sonr: 0.7, lengua: 1 }),
    atras: E({ mx: -0.9, my: -0.2, c: 0, sd: 22, gd: 0.06, si: 22, gi: 0.06, abre: 4, ancho: 0.9, sonr: 0.6 }),
    rock: E({ mx: 0.9, my: 0.3, c: 0.7, z: 0.6, sd: -6, gd: -0.12, si: -6, gi: -0.12, abre: 18, ancho: 0.95, sonr: 0.35, lengua: 1 }),
    salto: E({ mx: 0.9, my: -0.4, c: 1, h: 1, sd: 30, gd: 0.1, si: 30, gi: 0.1, abre: 26, ancho: 1.05, sonr: 1 }),
    peonza: E({ mx: 0, my: 0, c: 0, esp: 1, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 14, ancho: 1, sonr: 0.8 }),
    choque: E({ mx: 0, my: 0, c: 1, z: 1, sd: 4, gd: 0.2, si: 4, gi: 0.2, abre: 18, ancho: 0.8, sonr: -0.5 }),
    ay: E({ mx: 0.9, my: 0.1, c: 0.55, sd: 18, gd: 0.22, si: 18, gi: 0.22, abre: 8, ancho: 0.7, sonr: -0.35 }),
    arriba: E({ mx: -0.3, my: -0.95, iris: 0.8, c: 0, sd: 30, gd: 0.22, si: 30, gi: 0.22, abre: 8, ancho: 0.55, sonr: -0.3 }),
    aprieta: E({ mx: 0, my: 0, c: 1, z: 1, sd: 2, gd: 0.18, si: 2, gi: 0.18, abre: 0, ancho: 0.8, sonr: -0.4 }),
    pasmado: E({ mx: 0, my: 0, c: 1, sd: 2, gd: 0, si: 2, gi: 0, abre: 0, ancho: 0.75, sonr: -0.1 }),
    mira: E({ mx: 0.95, my: 0.05, c: 0.05, iris: 1, sd: 4, gd: -0.02, si: 4, gi: -0.02, abre: 0, ancho: 0.7, sonr: -0.05 }),
    risa: E({ mx: 0.5, my: 0, c: 1, h: 1, z: 0.4, sd: 26, gd: 0.1, si: 26, gi: 0.1, abre: 28, ancho: 1.1, sonr: 1, rub: 0.35 }),
    baila: E({ mx: 0.95, my: 0, c: 0.25, h: 0.5, sd: 20, gd: 0.06, si: 20, gi: 0.06, abre: 12, ancho: 1.05, sonr: 1, rub: 0.3 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, h: 0.4, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 10, ancho: 1.05, sonr: 1, rub: 0.3 })
  };
  const GUION_CARA_G = [
    [T.tachan - 0.12, T.tachan, "tachan"], [T.baile[0] + 0.25, T.baile[0] + 0.4, "chulo"], [T.baile[1] - 0.05, T.baile[1] + 0.1, "lengua"],
    [T.pose1 - 0.08, T.pose1 + 0.05, "tachan"], [T.coge0, T.coge0 + 0.12, "atras"], [T.guitarra - 0.12, T.guitarra, "rock"],
    [T.salto - 0.1, T.salto, "salto"], [T.giro0 + 0.1, T.giro0 + 0.25, "peonza"], [T.choque - 0.02, T.choque + 0.05, "choque"], [T.choque + 0.3, T.choque + 0.45, "ay"],
    [T.miran - 0.05, T.miran + 0.12, "arriba"], [T.cae - 0.04, T.cae + 0.06, "aprieta"], [T.paf + 0.1, T.paf + 0.3, "pasmado"],
    [T.parpadeo + 0.08, T.parpadeo + 0.14, "mira"], [T.risa0 - 0.06, T.risa0 + 0.08, "risa"], [T.risa1, T.risa1 + 0.2, "baila"],
    [T.camara - 0.08, T.camara + 0.14, "camara"]
  ];
  // posición de Guillermo (pelvis en el mundo)
  const X_GIRO = 700, CRUCE0 = T.guitarra + 0.35, CRUCE1 = T.salto - 0.09;
  function xG(t) {
    if (t < T.entra1) { const u = fase(t, T.entra0, T.entra1); return lerp(1440, XG, 1 - Math.pow(1 - u, 2.6)); }
    if (t < T.giro0) return lerp(XG, X_GIRO, tramo(t, CRUCE0, CRUCE1));
    if (t < T.choque) { const u = fase(t, T.giro0, T.choque); return lerp(X_GIRO, XG_FIN, Math.pow(u, 1.25)); }
    const r = campana(t, T.choque, T.choque + 0.24);
    return XG_FIN + 7 * r;
  }
  // giro de peonza: dos vueltas aplastadas (acaba otra vez mirando a la derecha, de espaldas a la encimera)
  const giroG = t => 4 * Math.PI * Math.pow(fase(t, T.giro0, T.choque), 0.85);
  const guitarraOn = t => dentro(t, T.coge, T.guitarra, 1e9, 1e9);
  function poseG(t) {
    const gi = giroG(t), girando = t > T.giro0 && t < T.choque;
    const x = xG(t);
    const p = {
      x, suelo: SUELO, s: S, espejo: false, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      sx: girando ? Math.cos(gi) : 1, torso: 0, torsoEsc: { x: 1, y: 1 }, piernas: {},
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const respira = Math.sin(t * 2.3);
    p.torsoEsc.y = 1 + respira * 0.005;
    // momentos
    const desl = dentro(t, T.entra0, T.entra0 + 0.1, T.entra1 - 0.25, T.entra1 + 0.1);
    const tach = dentro(t, T.tachan - 0.12, T.tachan, T.baile[0] - 0.1, T.baile[0]);
    const b1 = dentro(t, T.baile[0] - 0.05, T.baile[0] + 0.05, T.baile[1] - 0.06, T.baile[1]);
    const b2 = dentro(t, T.baile[1] - 0.05, T.baile[1] + 0.05, T.baile[2] - 0.06, T.baile[2]);
    const b3 = dentro(t, T.baile[2] - 0.05, T.baile[2] + 0.05, T.coge0, T.coge0 + 0.15);
    const gui = dentro(t, T.coge, T.guitarra, T.salto - 0.12, T.salto);
    const sal = campana(t, T.salto - 0.12, T.giro0 + 0.12);
    const choq = campana(t, T.choque, T.choque + 0.35);
    const arriba = dentro(t, T.miran - 0.05, T.miran + 0.15, T.cae, T.cae + 0.1);
    const enc = dentro(t, T.cae - 0.05, T.cae + 0.05, T.paf + 0.4, T.paf + 0.8);
    const risa = dentro(t, T.risa0, T.risa0 + 0.08, T.risa1, T.risa1 + 0.2);
    const bailaF = tramo(t, T.risa1 - 0.3, T.risa1);
    const ac = acento(t, T.guitarra - 0.05, T.salto - 0.15);
    p.torso = -0.16 * desl + 0.05 * tach - 0.08 * gui - 0.06 * ac + 0.12 * choq + 0.06 * enc + 0.05 * risa;
    p.cabeza.ang = -0.12 * desl - 0.04 * tach + 0.26 * ac + -0.08 * gui - 0.25 * arriba + 0.06 * enc;
    p.cabeza.esc = { x: 1 + 0.02 * ac, y: 1 - 0.035 * ac };
    // baile 1: hombros (temblor)
    p.torso += 0.05 * Math.sin((t - T.baile[0]) * 34) * b1;
    // baile 2: cadera en círculo
    p.torso += 0.05 * Math.sin((t - T.baile[1]) * 13) * b2;
    // risa: sacudidas
    p.torso += 0.035 * Math.sin((t - T.risa0) * 28) * risa; p.cabeza.ang += 0.05 * Math.sin((t - T.risa0) * 28 + 0.7) * risa;
    // baile final
    const vb = vaiven(t) * bailaF;
    p.torso += 0.04 * vb; p.cabeza.ang -= 0.05 * vb;
    // pelvis
    const dip = 8 * acento(t, T.baile[0] - 0.1, T.coge0) + 7 * ac + 4 * acento(t, T.risa1, DUR) * bailaF;
    let pelX = x + 10 * Math.sin((t - T.baile[1]) * 13) * b2 + 5 * vb;
    let paso = 0; for (const tp of T.pasos) paso += 9 * campana(t, tp - 0.08, tp + BT - 0.1) * (tp === T.pasos[0] ? 1 : -1);
    pelX += 4 * paso / 9;
    let pelY = PY(G) + respira * 0.9 + 10 * desl + dip - 22 * sal + 6 * enc;
    p.pelvis = G.aHoja(p, { x: pelX, y: pelY });
    // piernas
    const TOB = TOBY(G);
    const ancho = 26 + 10 * desl + 8 * gui, xb = x + paso;
    const levC = 10 * campana(t, T.pasos[0] - 0.08, T.pasos[0] + 0.2);
    const levL = 10 * campana(t, T.pasos[1] - 0.08, T.pasos[1] + 0.2);
    const kick = 10 * acento(t, T.baile[0] - 0.1, T.baile[2] + 0.2);
    let c = { x: xb - ancho, y: TOB - levC - 16 * sal }, l = { x: xb + ancho, y: TOB - levL - kick * 0.4 - 16 * sal };
    if (t >= CRUCE0 && t < CRUCE1) {
      const pies = pasos(t, CRUCE0, CRUCE1, XG, X_GIRO, 6, 34, 13, "l", { c: XG - 34, l: XG + 34, yc: 0, yl: 0 });
      c = { x: pies.c - (ancho - 34), y: c.y - pies.yc }; l = { x: pies.l + (ancho - 34), y: l.y - pies.yl };
    }
    const recoge = tramo(t, T.giro0, T.giro0 + 0.12) * (1 - tramo(t, T.choque - 0.10, T.choque));
    const pivote = G.aHoja(p, { x: pelX, y: TOB });
    p.piernas.cerca = { tob: mezcla(G.aHoja(p, c), pivote, recoge), ang: 0 };
    p.piernas.lejos = { tob: mezcla(G.aHoja(p, l), { x: G.PELVIS.x + 50, y: 1030 }, recoge), ang: lerp(-0.15 * sal, 0.5, recoge) };
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "desliza", t);
    if (gui > 0.5 && t < T.salto - 0.1) ex.abre += 6 * ac;
    if (risa > 0) ex.abre += 5 * Math.abs(Math.sin((t - T.risa0) * 14)) * risa;
    p.cara = cara(ex, parpadeo(t, [5.0, 8.4, 11.95, T.parpadeo + 0.02, 13.35]));
    p.rojo = 0.25 * gui + 0.3 * risa;
    p.sudor = 0.4 * gui;
    manosG(p, t);
    return p;
  }
  // la sartén en posición de guitarra (hoja): centro del aro sobre la tripa, mango hacia delante y arriba
  const ARO_G = { x: 300, y: 560 }, MANGO_A = -0.62;
  const RS = SART.r / S, HL = (SART.mango + SART.r - 2) / S;      // en unidades de la hoja
  function guitarraHoja(p) {
    const c = G.tronco(p)(ARO_G), a = MANGO_A + p.torso;
    return { aro: c, agarre: { x: c.x + Math.cos(a) * HL, y: c.y + Math.sin(a) * HL }, a };
  }
  function colgada(t) {
    const a = Math.PI / 2 + 0.03 * Math.sin(t * 1.6);
    return { x: SARTEN_GANCHO.x + 8 * Math.cos(a), y: SARTEN_GANCHO.y + 8 * Math.sin(a), a };
  }
  function manosG(p, t) {
    const ctx = { p };
    // mano lejana: brazos abiertos → tachán → puños → pose → sartén
    const L = [
      [0, 0, c => enTronco(G, c.p, { x: 560, y: 380 }, { dedos: ABRE, dobla: -1, mo: 0.2 }, "lejos")],
      [T.tachan - 0.15, T.tachan, c => enTronco(G, c.p, { x: 600, y: 330 + 8 * Math.sin(t * 30) }, { dedos: JAZZ, dobla: -1, mo: 0.1 }, "lejos")],
      [T.baile[0] - 0.08, T.baile[0], c => { const u = Math.sin((t - T.baile[0]) * TAU / BT * 2); return enTronco(G, c.p, { x: 480, y: 370 - 90 * u }, { dedos: PUNO, dobla: -1 }, "lejos"); }],
      [T.baile[1] - 0.08, T.baile[1], c => { const a = (t - T.baile[1]) * 14; return enTronco(G, c.p, { x: 440 + 42 * Math.cos(a), y: 470 + 34 * Math.sin(a) }, { dedos: PUNO, dobla: -1 }, "lejos"); }],
      [T.baile[2] - 0.06, T.baile[2] + 0.04, c => enTronco(G, c.p, { x: 560, y: 250 }, { dedos: PUNO, dobla: 1 }, "lejos")],
      [T.coge0, T.coge, c => enMundoMano(G, c.p, colgada(t), { dedos: AGARRA, dobla: -1, mo: 0.2 }, "lejos")],
      [T.coge + 0.04, T.guitarra, c => { const q = guitarraHoja(c.p); return Object.assign({ x: q.agarre.x, y: q.agarre.y, ang: 0, puno: 1, dobla: -1, dedos: AGARRA,
        mu: muHacia(q.agarre, G.tronco(c.p)(G.HOMBRO), 0.2) }); }],
      // tras el golpe: la sartén cuelga de la mano, a un lado
      [T.choque + 0.12, T.choque + 0.4, c => enTronco(G, c.p, { x: 470, y: 640 }, { dedos: AGARRA, dobla: -1, mo: 0.1 }, "lejos")],
      // y vuelve a tocarla en el baile final
      [T.risa1 - 0.05, T.risa1 + 0.25, c => { const q = guitarraHoja(c.p); return Object.assign({ x: q.agarre.x, y: q.agarre.y, ang: 0, puno: 1, dobla: -1, dedos: AGARRA,
        mu: muHacia(q.agarre, G.tronco(c.p)(G.HOMBRO), 0.2) }); }]
    ];
    const l = pista(L, ctx, t);
    // la sartén en la mano lejana (desde que la coge)
    if (t >= T.coge) {
      const tieneHarina = tramo(t, T.paf, T.paf + 0.2);
      const k = suave(fase(t, T.coge + 0.04, T.guitarra)) * (1 - dentro(t, T.choque + 0.12, T.choque + 0.4, T.risa1 - 0.05, T.risa1 + 0.25));
      const q = guitarraHoja(p);
      const ag = G.aPantalla(p, l), aro = G.aPantalla(p, q.aro);
      const orig = colgada(t).a, libre = Math.PI / 2 + 0.05 * Math.sin(t * 9);
      const vertical = lerpAng(orig, libre, tramo(t, T.coge, T.coge + 0.18));
      const a = lerpAng(vertical, Math.atan2(aro.y - ag.y, aro.x - ag.x), k);
      p.sarten = { ...ag, a };
      l.objeto = g => enMundo(g, () => dibSarten(g, ag.x, ag.y, a, tieneHarina));
    }
    p.manoLejos = l;
    // mano cercana: atrás → tachán → puños → cadera → coge la sartén → rasguea
    const rasga = (c, t) => {
      const q = guitarraHoja(c.p), a = q.a + Math.PI / 2;
      // rasgueo: sobre el aro, arriba y abajo a cada tiempo
      const u = acento(t, T.guitarra - 0.1, 20), lado = 34 * (u - 0.4);
      return { x: q.aro.x + 10 + Math.cos(a) * lado, y: q.aro.y + Math.sin(a) * lado, ang: 0, puno: 1, dobla: -1, dedos: RASGA,
        mu: muHacia({ x: q.aro.x, y: q.aro.y }, G.tronco(c.p)(G.HOMBRO_C), -0.3) };
    };
    const molinoF = (c, t) => {
      const u = fase(t, T.molino0 + 0.12, T.salto - 0.06), a = -Math.PI * 0.55 + TAU * suave(u);
      const q = guitarraHoja(c.p), ch = G.tronco(c.p)(G.HOMBRO_C);
      const r = 300;
      return { x: ch.x + Math.cos(a) * r * 0.95, y: ch.y + Math.sin(a) * r, ang: 0, puno: 1, dobla: -1, dedos: RASGA, mu: a + Math.PI };
    };
    const C = [
      [0, 0, c => enTronco(G, c.p, { x: -90, y: 380 }, { dedos: ABRE, dobla: -1, mo: -0.2 }, "cerca")],
      [T.tachan - 0.15, T.tachan, c => enTronco(G, c.p, { x: -120, y: 360 + 8 * Math.sin(t * 30 + 1) }, { dedos: JAZZ, dobla: -1, mo: -0.1 }, "cerca")],
      [T.baile[0] - 0.08, T.baile[0], c => { const u = Math.sin((t - T.baile[0]) * TAU / BT * 2 + Math.PI); return enTronco(G, c.p, { x: -40, y: 360 - 80 * u }, { dedos: PUNO, dobla: -1 }, "cerca"); }],
      [T.baile[1] - 0.08, T.baile[1], c => { const a = (t - T.baile[1]) * 14 + Math.PI; return enTronco(G, c.p, { x: 300 + 40 * Math.cos(a), y: 540 + 32 * Math.sin(a) }, { dedos: PUNO, dobla: -1 }, "cerca"); }],
      [T.baile[2] - 0.06, T.baile[2] + 0.04, c => enTronco(G, c.p, { x: 165, y: 620 }, { dedos: CADERA, dobla: -1, mo: -0.3 }, "cerca")],
      [T.coge + 0.1, T.guitarra, rasga],
      [T.molino0, T.molino0 + 0.12, molinoF], [T.salto - 0.06, T.salto + 0.04, rasga],
      // tras el golpe: se frota la nuca; luego mira arriba, se encoge, se ríe y vuelve a rasguear
      [T.choque + 0.12, T.choque + 0.4, (c, t) => { const a = (t - T.choque) * 16; return enTronco(G, c.p, { x: 112 + 10 * Math.cos(a), y: 610 + 12 * Math.sin(a) }, { dedos: ABRE, dobla: -1, mo: 0.4 }, "cerca"); }],
      [T.miran - 0.1, T.miran + 0.1, c => enTronco(G, c.p, { x: 20, y: 420 }, { dedos: RELAJADA, dobla: -1 }, "cerca")],
      [T.cae - 0.08, T.cae + 0.04, c => enTronco(G, c.p, { x: 120, y: 260 }, { dedos: PUNO, dobla: -1 }, "cerca")],
      [T.paf + 0.3, T.paf + 0.6, c => enTronco(G, c.p, { x: 60, y: 500 }, { dedos: ABRE, dobla: -1 }, "cerca")],
      [T.risa0 - 0.05, T.risa0 + 0.12, c => enTronco(G, c.p, { x: 200, y: 560 }, { dedos: RELAJADA, dobla: -1 }, "cerca")],
      [T.risa1 - 0.05, T.risa1 + 0.25, rasga]
    ];
    p.manoCerca = pista(C, ctx, t);
  }

  /* =====================================================================================
   * HARINA: el saco, la nube, el polvo y la capa sobre los dos
   * ===================================================================================== */
  const SACO = { w: 46, h: 58 };
  // estado del saco: en la balda, se tambalea, se vuelca y cae en la cabeza de Guillermo
  function saco(t, pG) {
    const x0 = BALDA.x1 - SACO.w / 2 - 4, y0 = BALDA.y;          // centro de la base
    if (t < T.saco0) return { x: x0, y: y0, a: 0, vivo: 1 };
    const tb = dentro(t, T.saco0, T.saco0 + 0.05, T.vuelca - 0.05, T.vuelca);
    const tamb = 0.12 * Math.sin((t - T.saco0) * 26) * tb * Math.exp(-(t - T.saco0) * 1.5);
    if (t < T.vuelca) return { x: x0, y: y0, a: tamb, vivo: 1 };
    const giro = a => {
      const x = x0 - (BALDA.x1 - 2);
      return { x: BALDA.x1 - 2 + x * Math.cos(a), y: y0 + x * Math.sin(a), a };
    };
    if (t < T.cae) {
      const u = fase(t, T.vuelca, T.cae);
      return { ...giro(1.9 * entrada(u)), vivo: 1, vuelca: u };
    }
    const ini = giro(1.9), origen = bocaSaco(ini), impacto = impactoHarina();
    if (t < T.paf) {
      const u = fase(t, T.cae, T.paf), a = lerp(ini.a, Math.PI, u);
      const boca = { x: lerp(origen.x, impacto.x, u), y: lerp(origen.y, impacto.y, entrada(u)) };
      return { x: boca.x - SACO.h * Math.sin(a), y: boca.y + SACO.h * Math.cos(a), a, vivo: 1 };
    }
    const arruga = tramo(t, T.paf, T.paf + 0.18), h = SACO.h * (1 - 0.45 * arruga);
    const baja = fase(t, T.paf + 0.35, T.paf + 0.9);
    if (!desdeCabeza) desdeCabeza = deRetrato(G, poseG(T.paf + 0.35), { x: 800, y: 260 });
    const q = baja > 0 ? desdeCabeza : deRetrato(G, pG, { x: 800, y: 260 });
    const angSuelo = Math.PI * 1.55, apoyo = Math.max(SACO.w / 2 * Math.abs(Math.sin(angSuelo)), (SACO.w / 2 - 7) * Math.abs(Math.sin(angSuelo)) - h * Math.cos(angSuelo));
    return { x: lerp(q.x, desdeCabeza.x - 46, baja), y: lerp(q.y - h, SUELO - apoyo, entrada(baja)), a: lerp(Math.PI, angSuelo, baja), vivo: 0, vacio: 1, suelo: baja, h };
  }
  function bocaSaco(s) {
    const h = s.h ?? SACO.h;
    return { x: s.x + Math.sin(s.a) * h, y: s.y - Math.cos(s.a) * h };
  }
  let impactoFijo = null, desdeCabeza = null;
  function impactoHarina() {
    if (!impactoFijo) impactoFijo = deRetrato(G, poseG(T.paf), { x: 800, y: 260 });
    return impactoFijo;
  }
  function dibSaco(g, s, t) {
    g.save(); g.translate(s.x, s.y); g.rotate(s.a); g.lineJoin = "round";
    const w = SACO.w, h = s.h ?? SACO.h;
    // papel del saco (la base en y = 0)
    g.fillStyle = "#e9dcc0"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2 + 2, -h + 10); g.lineTo(-w / 2 + 7, -h); g.lineTo(w / 2 - 7, -h); g.lineTo(w / 2 - 2, -h + 10); g.lineTo(w / 2, 0); g.closePath(); g.fill(); g.stroke();
    if (!s.vacio) {
      // doblez de arriba y el dibujo de una espiga
      g.fillStyle = "#d6c49e"; g.fillRect(-w / 2 + 3, -h + 4, w - 6, 8); g.strokeRect(-w / 2 + 3, -h + 4, w - 6, 8);
      g.strokeStyle = "#b8862e"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, -10); g.lineTo(0, -38); g.stroke();
      g.fillStyle = "#d9a53e"; for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(sg * 4.5, -16 - i * 6, 2.4, 4.6, sg * 0.5, 0, TAU); g.fill(); }
      g.fillStyle = "#c0392b"; g.fillRect(-w / 2 + 3, -h + 16, w - 6, 3);
      // polvillo en el borde
      g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(0, -h + 1, w / 2 - 6, 2, 0, 0, TAU); g.fill();
    } else {
      // roto y vacío, arrugado
      g.strokeStyle = "rgba(90,70,40,0.6)"; g.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-w / 2 + 6 + i * 10, -4); g.lineTo(-w / 2 + 10 + i * 9, -h + 6); g.stroke(); }
      g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(0, -h * 0.5, w / 2 - 4, h * 0.3, 0, 0, TAU); g.fill();
    }
    g.restore();
  }
  // chorro de harina que cae del saco al volcarse
  function chorro(g, t, s) {
    const k = dentro(t, T.vuelca + 0.08, T.vuelca + 0.14, T.paf - 0.02, T.paf + 0.04);
    if (k <= 0.01) return;
    const boca = bocaSaco(s);
    g.save(); g.globalAlpha = 0.9 * k;
    const gr = g.createLinearGradient(0, boca.y, 0, boca.y + 140); gr.addColorStop(0, "rgba(255,253,246,0.95)"); gr.addColorStop(1, "rgba(255,253,246,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(boca.x - 8, boca.y); g.quadraticCurveTo(boca.x + 6, boca.y + 70, boca.x + 18, boca.y + 140); g.lineTo(boca.x + 40, boca.y + 140); g.quadraticCurveTo(boca.x + 22, boca.y + 70, boca.x + 10, boca.y); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.9)"; for (let i = 0; i < 14; i++) { const u = ((t * 2.3 + hash(i)) % 1), xx = boca.x + 2 + u * 24 + 6 * Math.sin(i * 4 + t * 8), yy = boca.y + u * 130; g.beginPath(); g.arc(xx, yy, 1.4 + 1.4 * hash(i * 3), 0, TAU); g.fill(); }
    g.restore();
  }
  // bolas de la nube (sprite hecho una vez)
  let BOLA = null;
  function creaBola() {
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const gr = g.createRadialGradient(58, 56, 6, 64, 64, 63); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,254,250,0.95)"); gr.addColorStop(0.78, "rgba(250,247,240,0.55)"); gr.addColorStop(1, "rgba(246,242,234,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(232,226,214,0.16)"; for (let i = 0; i < 14; i++) { const a = hash(i * 3.7) * TAU, r = 34 * Math.sqrt(hash(i * 5.3)); g.beginPath(); g.arc(64 + Math.cos(a) * r, 70 + Math.sin(a) * r, 5 + 7 * hash(i * 2.1), 0, TAU); g.fill(); }
    return c;
  }
  const NUBE = Array.from({ length: 20 }, (_, i) => ({ a: hash(i * 9.1) * TAU, d: 0.12 + 0.88 * Math.sqrt(hash(i * 3.3)), r: 0.5 + 0.5 * hash(i * 7.7), sube: hash(i * 1.9) }));
  const NUBE_C = { x: (XG_FIN + XM2) / 2, y: 318 };                                 // donde acaba la nube (sobre los dos)
  function nube(g, t) {
    if (t < T.paf || t > T.aclara1 + 0.5) return;
    const PAF_C = impactoHarina();
    const u = fase(t, T.paf, T.paf + 0.34), cre = salida(u);
    const dens = tramo(t, T.paf, T.paf + 0.16) * (1 - tramo(t, T.aclara0, T.aclara1 + 0.45, x => Math.pow(x, 0.75)));
    if (dens < 0.005) return;
    const extra = fase(t, T.paf + 0.3, T.aclara1 + 0.5);
    const cx = lerp(PAF_C.x, NUBE_C.x, salida(fase(t, T.paf, T.paf + 0.4))), cy = lerp(PAF_C.y, NUBE_C.y, salida(fase(t, T.paf, T.paf + 0.4)));
    g.save();
    for (const b of NUBE) {
      const R = (52 + 92 * b.r) * (0.3 + 0.7 * cre) * (1 + 0.25 * extra);
      const D = b.d * cre * (1 + 0.2 * extra);
      const x = cx + Math.cos(b.a) * D * 175, y = cy + Math.sin(b.a) * D * 210 + 30 * extra * (0.4 + b.sube);
      g.globalAlpha = clamp(dens * (1 - 0.45 * b.d * extra));
      g.drawImage(BOLA, x - R, y - R, 2 * R, 2 * R);
    }
    g.restore();
  }
  // polvo que baja despacio después de la nube
  const MOTAS = Array.from({ length: 70 }, (_, i) => ({ x: 50 + 420 * hash(i * 2.7), y0: 40 + 260 * hash(i * 5.1), v: 14 + 22 * hash(i * 3.9), r: 0.8 + 1.6 * hash(i * 8.3), f: hash(i * 6.6) * TAU }));
  function motas(g, t) {
    const k = tramo(t, T.paf + 0.3, T.aclara0 + 0.2) * (1 - tramo(t, 13.2, DUR - 0.2) * 0.6);
    if (k < 0.01) return;
    const tt = t - T.paf;
    g.save(); g.fillStyle = "#fffdf6";
    for (const m of MOTAS) {
      const y = m.y0 + m.v * tt * 1.6; if (y > SUELO + 10) continue;
      const x = m.x + 8 * Math.sin(tt * 1.3 + m.f);
      g.globalAlpha = k * (0.55 + 0.45 * Math.sin(tt * 2 + m.f));
      g.beginPath(); g.arc(x, y, m.r, 0, TAU); g.fill();
    }
    g.restore();
  }
  // manchas de harina en el suelo, la encimera y la cocina
  function harinaSuelo(g, t) {
    const k = tramo(t, T.paf + 0.15, T.paf + 0.7);
    if (k < 0.01) return;
    g.save(); g.globalAlpha = 0.92 * k; g.fillStyle = "#fbf8f0";
    const manchas = [[254, 566, 150, 14], [168, 560, 70, 10], [350, 572, 90, 9], [214, 586, 60, 8]];
    for (const [x, y, rx, ry] of manchas) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); }
    g.globalAlpha = 0.8 * k;
    for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(90 + 330 * hash(i * 4.3), 552 + 34 * hash(i * 1.7), 2 + 4 * hash(i * 9.9), 0, TAU); g.fill(); }
    // encimera y cocina
    g.globalAlpha = 0.85 * k;
    for (const [x0, x1] of [[40, ESQ]]) { g.beginPath(); g.moveTo(x0, ENC + 1); for (let x = x0; x <= x1; x += 8) g.lineTo(x, ENC - 2 - 3 * hash(x * 0.37)); g.lineTo(x1, ENC + 1); g.closePath(); g.fill(); }
    g.restore();
  }
  // nubecillas de harina (de los pasos, las sacudidas de la risa y el rasgueo)
  function nubecilla(g, x, y, u, tam) {
    if (u <= 0 || u >= 1) return;
    g.save(); g.globalAlpha = 0.85 * Math.pow(1 - u, 1.4);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.6, d = tam * (0.3 + 0.9 * salida(u)); const R = tam * (0.35 + 0.35 * u) * (0.8 + 0.4 * hash(i + tam));
      g.drawImage(BOLA, x + Math.cos(a) * d - R, y + Math.sin(a) * d * 0.6 - R - 10 * u, 2 * R, 2 * R); }
    g.restore();
  }
  function puffs(g, t, pG, pM) {
    if (t < T.aclara1 - 0.2) return;
    // risa: sacudidas que sueltan harina de los hombros y la cabeza
    for (let i = 0; i < 3; i++) {
      const t0 = T.risa0 + 0.08 + i * 0.22;
      const cg = deRetrato(G, pG, { x: 780, y: 330 }), cm = deRetrato(M, pM, { x: 840, y: 250 });
      nubecilla(g, cg.x + (i - 1) * 12, cg.y, fase(t, t0, t0 + 0.6), 18);
      nubecilla(g, cm.x - (i - 1) * 10, cm.y, fase(t, t0 + 0.1, t0 + 0.7), 15);
    }
    // pasos del baile final: polvo en los pies
    for (const [i, tp] of T.pasos.entries()) {
      const u = fase(t, tp + 0.04, tp + 0.7);
      nubecilla(g, pG.x + (i ? -24 : 24), SUELO - 2, u, 16);
      nubecilla(g, pM.x + (i ? 20 : -20), SUELO - 2, u, 14);
      // rasgueo: la sartén suelta harina
      const ag = G.aPantalla(pG, guitarraHoja(pG).aro);
      nubecilla(g, ag.x, ag.y, fase(t, tp, tp + 0.6), 16);
    }
  }
  // grumos de harina en el pelo (encima de la capa): montoncitos irregulares
  function grumo(g, x, y, r, sem) {
    g.beginPath();
    for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI, rr = r * (0.75 + 0.45 * hash(sem + i * 1.7)); g.lineTo(x + Math.cos(a) * rr * 1.3, y + Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.stroke();
  }
  function grumos(g, t, pG, pM) {
    const k = tramo(t, T.aclara0, T.aclara1);
    if (k < 0.01) return;
    g.save(); g.globalAlpha = 0.95 * k; g.fillStyle = "#fffdf7"; g.strokeStyle = "rgba(160,150,132,0.5)"; g.lineWidth = 0.8;
    const enG = [[690, 270, 7, 1], [752, 240, 9, 2], [812, 226, 10, 3], [872, 248, 8, 4], [930, 290, 6, 5], [845, 668, 3.2, 6]],
      enM = [[760, 222, 8, 7], [830, 196, 10, 8], [905, 212, 8, 9], [960, 262, 6, 10], [862, 512, 2.8, 11]];
    for (const [R, p, L] of [[G, pG, enG], [M, pM, enM]]) for (const [x, y, r, sem] of L) {
      const q = deRetrato(R, p, { x, y }); grumo(g, q.x, q.y + r * 0.4, r, sem * 9.3);
    }
    // montoncitos en los hombros (siguen al torso)
    const enH = [[G, pG, [[G.HOMBRO.x - 10, G.HOMBRO.y - 34, 9, 12], [G.HOMBRO_C.x + 20, G.HOMBRO_C.y - 36, 10, 13], [G.HOMBRO.x - 60, G.HOMBRO.y - 50, 6, 14]]],
      [M, pM, [[M.HOMBRO.x - 14, M.HOMBRO.y - 26, 8, 15], [M.HOMBRO_C.x + 16, M.HOMBRO_C.y - 28, 8, 16]]]];
    for (const [R, p, L] of enH) for (const [x, y, r, sem] of L) {
      const q = deHoja(R, p, { x, y }); grumo(g, q.x, q.y + r * 0.4, r, sem * 9.3);
    }
    g.restore();
  }

  /* ---------- la capa: los dos personajes en un lienzo aparte, enharinados ----------
   * Se dibujan los dos en CAPA; en FL se hace una silueta blanca (con su grano) con la forma de CAPA y se
   * pone encima con «screen»: aclara todo sin borrar las líneas (más harina en la cabeza que en los pies).
   * Los ojos (desde el parpadeo) y la boca (desde la risa) se quedan limpios. */
  let CAPA = null, FL = null, POLVO = null;
  function creaPolvo() {
    const c = document.createElement("canvas"); c.width = c.height = 96; const g = c.getContext("2d");
    for (let i = 0; i < 260; i++) { const v = hash(i * 1.37); g.fillStyle = v < 0.6 ? "rgba(150,140,124,0.55)" : "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(96 * hash(i * 2.1), 96 * hash(i * 3.3), 0.5 + 1.3 * hash(i * 4.9), 0, TAU); g.fill(); }
    return c;
  }
  // huecos limpios: los ojos (desde el parpadeo) y la boca
  function huecos(g, R, p, OJ, hueco, boca) {
    for (const o of OJ) {
      const c = deRetrato(R, p, o.c), ex = deRetrato(R, p, { x: o.c.x + o.rx, y: o.c.y }), ey = deRetrato(R, p, { x: o.c.x, y: o.c.y + o.ry });
      const rx = Math.hypot(ex.x - c.x, ex.y - c.y) * hueco, ry = Math.hypot(ey.x - c.x, ey.y - c.y) * hueco, a = Math.atan2(ex.y - c.y, ex.x - c.x);
      if (rx < 0.5) continue;
      g.moveTo(c.x + Math.cos(a) * rx, c.y + Math.sin(a) * rx); g.ellipse(c.x, c.y, rx, ry, a, 0, TAU);
    }
    if (boca > 0.01) { const b = R.aPantalla(p, R.boca(p)); const r = 4.6 * boca; g.moveTo(b.x + r * 1.6, b.y - 2); g.ellipse(b.x, b.y - 2, r * 1.6, r, 0, 0, TAU); }
  }
  const OJOS_G = [{ c: { x: 771, y: 563 }, rx: 36, ry: 26 }, { c: { x: 894, y: 617 }, rx: 28, ry: 22 }];
  const OJOS_M = [{ c: { x: 789, y: 420 }, rx: 32, ry: 24 }, { c: { x: 907, y: 462 }, rx: 24, ry: 20 }];
  const lienzoComo = (w, h, o) => { if (!o || o.width !== w || o.height !== h) { o = document.createElement("canvas"); o.width = w; o.height = h; } return o; };
  const RF = 0.5;                                        // la silueta de harina va a media resolución
  function dibujaPersonajes(g, t, pG, pM, harina) {
    if (harina <= 0.001) { if (pM) dibuja(M, g, pM, t); if (pG) dibuja(G, g, pG, t); return; }
    const c = g.canvas; CAPA = lienzoComo(c.width, c.height, CAPA);
    FL = lienzoComo(Math.ceil(c.width * RF), Math.ceil(c.height * RF), FL);
    const o = CAPA.getContext("2d"), f = FL.getContext("2d"), Mt = g.getTransform();
    // caja de trabajo (píxeles del lienzo)
    const xs = [pM ? pM.x : 1e4, pG ? pG.x : 1e4], xs2 = [pM ? pM.x : -1e4, pG ? pG.x : -1e4];
    const A = Mt.transformPoint(new DOMPoint(Math.min(...xs) - 170, 40)), B = Mt.transformPoint(new DOMPoint(Math.max(...xs2) + 170, 600));
    const x0 = clamp(Math.floor(Math.min(A.x, B.x)), 0, c.width), x1 = clamp(Math.ceil(Math.max(A.x, B.x)), 0, c.width);
    const y0 = clamp(Math.floor(Math.min(A.y, B.y)), 0, c.height), y1 = clamp(Math.ceil(Math.max(A.y, B.y)), 0, c.height);
    if (x1 <= x0 || y1 <= y0) return;
    const w = x1 - x0, h = y1 - y0;
    // 1) los dos, en su capa
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, CAPA.width, CAPA.height);
    o.setTransform(Mt);
    if (pM) dibuja(M, o, pM, t);
    if (pG) dibuja(G, o, pG, t);
    // 2) su silueta, blanca y con grano (más blanca arriba), a media resolución
    const fx0 = Math.floor(x0 * RF), fy0 = Math.floor(y0 * RF), fw = Math.ceil(w * RF) + 1, fh = Math.ceil(h * RF) + 1;
    f.setTransform(1, 0, 0, 1, 0, 0); f.globalAlpha = 1; f.globalCompositeOperation = "source-over"; f.clearRect(0, 0, FL.width, FL.height);
    f.drawImage(CAPA, fx0 / RF, fy0 / RF, fw / RF, fh / RF, fx0, fy0, fw, fh);
    f.globalCompositeOperation = "source-in";
    // cabeza y hombros muy blancos, pecho y brazos empolvados, vaqueros y zapatillas casi limpios
    const yP = y => Mt.transformPoint(new DOMPoint(0, y)).y * RF;
    const ya = yP(150), yb = yP(560), st = y => clamp((y - 150) / 410);
    const gr = f.createLinearGradient(0, ya, 0, yb);
    for (const [y, a] of [[150, 1], [238, 0.95], [282, 0.72], [330, 0.46], [372, 0.24], [420, 0.12], [520, 0.07], [560, 0.05]]) gr.addColorStop(st(y), `rgba(255,253,247,${a})`);
    f.fillStyle = gr; f.fillRect(fx0, fy0, fw, fh);
    // manchas: algo más de harina en algunos sitios (rodillas, muslos, la tripa)
    f.globalCompositeOperation = "source-atop"; f.setTransform(RF, 0, 0, RF, 0, 0); f.transform(Mt.a, Mt.b, Mt.c, Mt.d, Mt.e, Mt.f);
    for (const [px, sg] of [[pG ? pG.x : null, 1], [pM ? pM.x : null, -1]]) {
      if (px == null) continue;
      for (const [dx, y, rx, ry, a] of [[-10, 352, 22, 12, 0.35], [14, 420, 13, 18, 0.32], [-16, 470, 11, 9, 0.3], [18, 500, 9, 8, 0.25], [-4, 548, 16, 6, 0.3]]) {
        f.globalAlpha = a; f.fillStyle = "#fffdf7"; f.beginPath(); f.ellipse(px + dx * sg, y, rx, ry, 0.3 * sg, 0, TAU); f.fill();
      }
    }
    f.setTransform(1, 0, 0, 1, 0, 0);
    if (!POLVO) POLVO = creaPolvo();
    f.globalAlpha = 0.4; f.fillStyle = f.createPattern(POLVO, "repeat"); f.fillRect(fx0, fy0, fw, fh);
    // ojos (desde el parpadeo) y boca (desde la risa) limpios
    const hueco = tramo(t, T.parpadeo, T.parpadeo + 0.12), boca = tramo(t, T.risa0 - 0.1, T.risa0 + 0.1);
    if (hueco > 0 || boca > 0) {
      f.globalAlpha = 1; f.globalCompositeOperation = "destination-out"; f.setTransform(RF, 0, 0, RF, 0, 0); f.transform(Mt.a, Mt.b, Mt.c, Mt.d, Mt.e, Mt.f);
      f.beginPath(); if (pG) huecos(f, G, pG, OJOS_G, hueco, boca); if (pM) huecos(f, M, pM, OJOS_M, hueco, boca * 0.8); f.fill();
    }
    // 3) a la pantalla: los dos y, encima, la harina en «screen» (aclara sin borrar las líneas)
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(CAPA, x0, y0, w, h, x0, y0, w, h);
    g.globalCompositeOperation = "saturation"; g.globalAlpha = 0.85 * harina;
    g.drawImage(FL, fx0, fy0, fw, fh, fx0 / RF, fy0 / RF, fw / RF, fh / RF);
    g.globalCompositeOperation = "screen"; g.globalAlpha = 0.74 * harina;
    g.drawImage(FL, fx0, fy0, fw, fh, fx0 / RF, fy0 / RF, fw / RF, fh / RF);
    g.restore();
  }
  // dibuja a un personaje con su giro aplastado (sx) alrededor de la pelvis
  function dibuja(R, g, p, t) {
    const sx = p.sx ?? 1;
    if (Math.abs(sx - 1) < 1e-4) { BASE_DIB = g.getTransform(); R.dibujar(g, p, t); return; }
    const cx = R.aPantalla(p, p.pelvis).x;
    g.save(); g.translate(cx, 0); g.scale(Math.abs(sx) < 0.12 ? 0.12 * Math.sign(sx || 1) : sx, 1); g.translate(-cx, 0);
    BASE_DIB = g.getTransform(); R.dibujar(g, p, t); g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  // nota musical (corchea o semicorchea)
  function nota(g, x, y, s, col, tipo, a) {
    g.save(); g.translate(x, y); g.rotate(a || 0); g.scale(s, s); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    if (tipo) {
      g.beginPath(); g.ellipse(-6, 8, 4.6, 3.4, -0.4, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.ellipse(8, 5, 4.6, 3.4, -0.4, 0, TAU); g.fill(); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.moveTo(-2, 7); g.lineTo(-2, -12); g.lineTo(12, -15); g.lineTo(12, 4); g.stroke();
      g.lineWidth = 3.4; g.strokeStyle = col; g.beginPath(); g.moveTo(-2, -10); g.lineTo(12, -13); g.stroke();
    } else {
      g.beginPath(); g.ellipse(0, 8, 5, 3.8, -0.4, 0, TAU); g.fill(); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.moveTo(4.2, 6.5); g.lineTo(4.2, -12); g.quadraticCurveTo(12, -8, 11, 0); g.stroke();
    }
    g.restore();
  }
  const COL_NOTAS = ["#f7c548", "#ef6f6c", "#7fd1b9", "#f4a261", "#b8a3e3"];
  // notas: de la radio, de la boca de Marta y de la sartén
  function notas(g, t, pG, pM) {
    const radio = { x: RADIO.x - 6, y: RADIO.y - 52 };
    for (let n = -2; n < 28; n++) {
      const t0 = golpe(n); const u = fase(t, t0, t0 + 2.4); if (u <= 0 || u >= 1) continue;
      const side = hash(n * 3.1) > 0.5 ? 1 : -1;
      const x = radio.x + 10 + 50 * u * (0.3 + hash(n)) * side + 12 * Math.sin(u * 6 + n), y = radio.y - 10 - 160 * u;
      g.save(); g.globalAlpha = Math.sin(Math.PI * u) * (1 - tramo(t, T.paf - 0.1, T.paf + 0.2) * 0.8 * (1 - tramo(t, T.aclara1, T.aclara1 + 0.5)));
      nota(g, x, y, 0.9 + 0.2 * Math.sin(t * 8 + n), COL_NOTAS[(n + 50) % 5], n % 3 === 0, 0.25 * Math.sin(t * 3 + n) * side); g.restore();
    }
    // Marta canta
    if (pM && t > T.canta - 0.1 && t < T.giro0 + 0.3) {
      const bo = M.aPantalla(pM, M.boca(pM)), fr = pM.espejo ? -1 : 1;
      for (let n = 6; n < 18; n++) {
        const t0 = golpe(n) + 0.25; const u = fase(t, t0, t0 + 1.5); if (u <= 0 || u >= 1 || t0 > T.giro0) continue;
        g.save(); g.globalAlpha = Math.sin(Math.PI * u);
        nota(g, bo.x + fr * (24 + 50 * u), bo.y - 14 - 70 * u + 8 * Math.sin(u * 7), 0.85, COL_NOTAS[(n * 2) % 5], n % 2, 0.2 * Math.sin(u * 5)); g.restore();
      }
    }
    // la sartén: notas y chispitas en cada rasgueo
    if (pG && t > T.guitarra - 0.05 && t < T.salto + 0.4) {
      const aro = G.aPantalla(pG, guitarraHoja(pG).aro);
      for (let n = 12; n <= 16; n++) {
        const t0 = golpe(n); const u = fase(t, t0, t0 + 1.2); if (u <= 0 || u >= 1) continue;
        g.save(); g.globalAlpha = Math.sin(Math.PI * u);
        nota(g, aro.x + 30 + 40 * u, aro.y - 30 - 80 * u, 1, COL_NOTAS[(n * 3) % 5], 1, -0.3);
        // rayitas de rasgueo
        const k = 1 - fase(t, t0, t0 + 0.25);
        if (k > 0) { g.strokeStyle = "#ffd447"; g.lineWidth = 2.4; g.lineCap = "round";
          for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.4, r0 = 34, r1 = 34 + 14 * k; g.beginPath(); g.moveTo(aro.x + Math.cos(a) * r0, aro.y + Math.sin(a) * r0); g.lineTo(aro.x + Math.cos(a) * r1, aro.y + Math.sin(a) * r1); g.stroke(); } }
        g.restore();
      }
    }
  }
  // rayas de velocidad (entrada deslizando y peonza)
  function rayas(g, t, pG) {
    const k = dentro(t, T.entra0, T.entra0 + 0.1, T.entra1 - 0.35, T.entra1 - 0.05);
    if (k > 0.01) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const y = 250 + i * 48 + 6 * Math.sin(i * 3), x = pG.x + 60 + 20 * hash(i), L = 60 + 50 * hash(i * 2); g.beginPath(); g.moveTo(x, y); g.lineTo(x + L * k, y); g.stroke(); }
      // brillo del suelo bajo los pies
      g.strokeStyle = `rgba(255,255,255,${0.5 * k})`; g.lineWidth = 3; g.beginPath(); g.moveTo(pG.x + 30, SUELO + 6); g.lineTo(pG.x + 30 + 160 * k, SUELO + 6); g.stroke();
      g.restore();
    }
    const kg = dentro(t, T.giro0, T.giro0 + 0.1, T.choque - 0.06, T.choque);
    if (kg > 0.01) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * kg})`; g.lineWidth = 2.6; g.lineCap = "round";
      const cx = pG.x, cy = 360;
      for (let i = 0; i < 4; i++) { const a0 = t * 22 + i * TAU / 4; g.beginPath(); g.ellipse(cx, cy + i * 40 - 60, 70, 14, 0, a0, a0 + 1.4); g.stroke(); }
      // estela
      for (let i = 0; i < 4; i++) { const y = 300 + i * 50; g.beginPath(); g.moveTo(cx + 70, y); g.lineTo(cx + 70 + 90 * kg, y); g.stroke(); }
      g.restore();
    }
  }
  // golpe contra la encimera
  function golpeEncimera(g, t) {
    const u = fase(t, T.choque, T.choque + 0.35); if (u <= 0 || u >= 1) return;
    g.save(); g.translate(ESQ + 4, 372); g.globalAlpha = 1 - u;
    g.fillStyle = "#ffe066"; g.strokeStyle = TINTA; g.lineWidth = 2;
    const r = 18 + 26 * salida(u);
    g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * TAU / 16, rr = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, lamparaImg = null;
  const FX = -320, FY = -110, FW = 1640;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = FW; c.height = 820; const g = c.getContext("2d");
    g.translate(-FX, -FY); g.lineJoin = "round";
    // pared
    const gp = g.createLinearGradient(0, -110, 0, 470); gp.addColorStop(0, "#3e5f57"); gp.addColorStop(0.55, "#5a8477"); gp.addColorStop(1, "#507a6e");
    g.fillStyle = gp; g.fillRect(FX, FY, FW, 600);
    // papel pintado: ramitas suaves
    g.strokeStyle = "rgba(220,235,210,0.12)"; g.lineWidth = 1.4;
    for (let y = -80; y < 250; y += 46) for (let x = -160 + ((y / 46) % 2) * 23; x < FX + FW; x += 46) { g.beginPath(); g.moveTo(x, y + 10); g.quadraticCurveTo(x + 4, y, x + 2, y - 10); g.stroke(); g.beginPath(); g.ellipse(x - 3, y - 2, 3, 1.6, -0.6, 0, TAU); g.ellipse(x + 6, y + 2, 3, 1.6, 0.6, 0, TAU); g.stroke(); }
    // moldura del techo
    g.fillStyle = "#e8dcc2"; g.fillRect(FX, -96, FW, 12); g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(FX, -84, FW, 4);
    // azulejo blanco (de la encimera a la balda / cocina / ventana)
    azulejo(g, -330, 248, 214, 352);
    azulejo(g, 620, 248, 1024, 352);
    // balda alta
    g.fillStyle = "#b07a45"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.fillRect(BALDA.x0, BALDA.y, BALDA.x1 - BALDA.x0, 9); g.strokeRect(BALDA.x0, BALDA.y, BALDA.x1 - BALDA.x0, 9);
    for (const x of [-60, 120]) { g.beginPath(); g.moveTo(x, BALDA.y + 9); g.lineTo(x, BALDA.y + 38); g.lineTo(x + 26, BALDA.y + 9); g.closePath(); g.fillStyle = "#8c5c33"; g.fill(); g.stroke(); }
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(BALDA.x0, BALDA.y + 9, BALDA.x1 - BALDA.x0, 5);
    // potos que cuelga de la balda
    potos(g, -20, BALDA.y + 6);
    // encimera izquierda
    mueble(g, -340, ESQ, "#e3b45c");
    // cocina de esmalte
    dibCocina(g);
    // cuadrito sobre la barra de cacharros
    g.save(); g.translate(530, 150); g.rotate(0.03);
    g.fillStyle = "#c58a4f"; g.fillRect(-26, -32, 52, 64); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(-26, -32, 52, 64);
    g.fillStyle = "#f6edd8"; g.fillRect(-20, -26, 40, 52);
    g.fillStyle = "#f2c94c"; for (const [x, y] of [[-6, -6], [7, 2], [-3, 12]]) { g.beginPath(); g.ellipse(x, y, 7, 5, 0.4, 0, TAU); g.fill(); g.stroke(); }
    g.fillStyle = "#6aa84f"; g.beginPath(); g.ellipse(4, -14, 5, 2.4, -0.5, 0, TAU); g.fill(); g.restore();
    // planta alta en el suelo
    plantaSuelo(g, 1010, BASE_MUEBLE + 6);
    // ventana
    dibVentana(g);
    // barra de cacharros (la sartén va aparte)
    g.strokeStyle = "#b9b2a6"; g.lineWidth = 4; g.beginPath(); g.moveTo(BARRA.x0, BARRA.y); g.lineTo(BARRA.x1, BARRA.y); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(BARRA.x0, BARRA.y - 2.4); g.lineTo(BARRA.x1, BARRA.y - 2.4); g.moveTo(BARRA.x0, BARRA.y + 2.4); g.lineTo(BARRA.x1, BARRA.y + 2.4); g.stroke();
    for (const x of [BARRA.x0, BARRA.x1]) { g.fillStyle = "#8f877b"; g.beginPath(); g.arc(x, BARRA.y, 5, 0, TAU); g.fill(); g.stroke(); }
    cucharon(g, 466, BARRA.y + 6); batidor(g, 494, BARRA.y + 6); cazo(g, 584, BARRA.y + 6);
    gancho(g, SARTEN_GANCHO.x, BARRA.y);
    // aparador de la derecha con la radio
    mueble(g, 800, 1000, "#e3b45c");
    pan(g, 848, ENC); radio(g, RADIO.x, RADIO.y); macetita(g, 978, ENC);
    // nevera
    nevera(g);
    // zócalo de la pared
    g.fillStyle = "#3b3330"; g.fillRect(FX, BASE_MUEBLE - 2, FW, 8);
    // suelo de damero
    sueloDamero(g);
    return c;
  }
  function azulejo(g, x0, y0, x1, y1) {
    g.save(); g.fillStyle = "#f1ece1"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.strokeStyle = "rgba(150,140,125,0.45)"; g.lineWidth = 1;
    for (let y = y0 + 14; y < y1; y += 14) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
    for (let x = x0; x < x1; x += 14) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    // cenefa de colores arriba
    for (let x = x0; x < x1; x += 14) { g.fillStyle = (x / 14) % 2 ? "#d9734e" : "#3f7f9c"; g.fillRect(x + 1, y0 + 1, 12, 12); g.fillStyle = "#f1ece1"; g.beginPath(); g.arc(x + 7, y0 + 7, 3, 0, TAU); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    g.restore();
  }
  function mueble(g, x0, x1, col) {
    g.save(); g.lineJoin = "round";
    // cuerpo
    g.fillStyle = col; g.fillRect(x0, ENC + 8, x1 - x0, BASE_MUEBLE - ENC - 8);
    g.strokeStyle = TINTA; g.lineWidth = 1.8; g.strokeRect(x0, ENC + 8, x1 - x0, BASE_MUEBLE - ENC - 8);
    const n = Math.max(1, Math.round((x1 - x0) / 92)), w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * w;
      g.fillStyle = "rgba(255,255,255,0.14)"; g.fillRect(x + 6, ENC + 16, w - 12, 16); g.strokeStyle = "rgba(90,60,20,0.55)"; g.lineWidth = 1.2; g.strokeRect(x + 6, ENC + 16, w - 12, 16);
      g.strokeRect(x + 6, ENC + 38, w - 12, BASE_MUEBLE - ENC - 52);
      g.fillStyle = "#6b4a2a"; g.beginPath(); rectanguloRedondeado(g, x + w / 2 - 8, ENC + 22, 16, 4, 2); g.fill();
      g.beginPath(); g.arc(x + w - 16, ENC + 70, 3, 0, TAU); g.fill();
    }
    g.fillStyle = "#2c2622"; g.fillRect(x0, BASE_MUEBLE - 10, x1 - x0, 10);
    // tablero de madera
    const gt = g.createLinearGradient(0, ENC - 2, 0, ENC + 9); gt.addColorStop(0, "#d19a5e"); gt.addColorStop(1, "#9f6a38");
    g.fillStyle = gt; g.fillRect(x0 - 4, ENC - 2, x1 - x0 + 8, 11); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.strokeRect(x0 - 4, ENC - 2, x1 - x0 + 8, 11);
    g.restore();
  }
  function potos(g, x, y) {
    g.save(); g.strokeStyle = "#3f6b2f"; g.lineWidth = 1.6;
    for (let r = 0; r < 3; r++) {
      const L = 60 + r * 30; g.beginPath(); g.moveTo(x + r * 14, y); g.quadraticCurveTo(x + r * 14 + 16, y + L * 0.5, x + r * 14 + 4, y + L); g.stroke();
      for (let k = 0; k < 5; k++) { const v = k / 5, px = x + r * 14 + 16 * Math.sin(Math.PI * v) * 0.8, py = y + L * v + 6;
        g.fillStyle = k % 2 ? "#5f9a3e" : "#7cb552"; g.beginPath(); g.ellipse(px + 5 * (k % 2 ? 1 : -1), py, 6, 4, k % 2 ? 0.5 : -0.5, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); g.strokeStyle = "#3f6b2f"; g.lineWidth = 1.6; }
    }
    // maceta
    g.fillStyle = "#c66a3d"; g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 12, y - 22); g.lineTo(x + 40, y - 22); g.lineTo(x + 34, y); g.lineTo(x - 6, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6aa84f"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + i * 12, y - 26, 7, 4, -0.4 + i * 0.3, 0, TAU); g.fill(); g.stroke(); }
    g.restore();
  }
  function dibCocina(g) {
    const { x0, x1 } = COCINA, top = ENC, w = x1 - x0;
    g.save(); g.lineJoin = "round";
    // panel trasero con un reloj sin números
    g.fillStyle = "#f3ead6"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); rectanguloRedondeado(g, x0 + 6, top - 56, w - 12, 58, [10, 10, 0, 0]); g.fill(); g.stroke();
    g.fillStyle = "#c8433a"; g.fillRect(x0 + 6, top - 12, w - 12, 6);
    g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(x0 + w / 2, top - 34, 13, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 + w / 2, top - 34); g.lineTo(x0 + w / 2, top - 43); g.moveTo(x0 + w / 2, top - 34); g.lineTo(x0 + w / 2 + 6, top - 31); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.beginPath(); g.moveTo(x0 + w / 2 + Math.cos(a) * 10, top - 34 + Math.sin(a) * 10); g.lineTo(x0 + w / 2 + Math.cos(a) * 12, top - 34 + Math.sin(a) * 12); g.lineWidth = 1; g.stroke(); }
    for (const dx of [22, 42, w - 42, w - 22]) { g.fillStyle = "#e9e3d4"; g.beginPath(); g.arc(x0 + dx, top - 30, 6, 0, TAU); g.fill(); g.lineWidth = 1.3; g.stroke(); g.beginPath(); g.moveTo(x0 + dx, top - 30); g.lineTo(x0 + dx, top - 35); g.stroke(); }
    // cuerpo
    const gc = g.createLinearGradient(x0, 0, x1, 0); gc.addColorStop(0, "#e8dcc2"); gc.addColorStop(0.3, "#f6eedb"); gc.addColorStop(1, "#ddcfb2");
    g.fillStyle = gc; g.beginPath(); rectanguloRedondeado(g, x0, top, w, BASE_MUEBLE - top - 6, [4, 4, 8, 8]); g.fill(); g.lineWidth = 1.8; g.stroke();
    // encimera de la cocina y fuegos
    g.fillStyle = "#2c2a2a"; g.fillRect(x0 + 4, top - 2, w - 8, 7);
    for (const fx of [x0 + 34, x0 + w - 34]) { g.fillStyle = "#555"; g.beginPath(); g.ellipse(fx, top - 1, 20, 3, 0, 0, TAU); g.fill(); }
    // puerta del horno con su ventana
    g.fillStyle = "#c8433a"; g.fillRect(x0 + 8, top + 12, w - 16, 5);
    g.fillStyle = "#e9e0cb"; g.beginPath(); rectanguloRedondeado(g, x0 + 12, top + 24, w - 24, 76, 6); g.fill(); g.stroke();
    g.fillStyle = "#3a3330"; g.beginPath(); rectanguloRedondeado(g, x0 + 26, top + 40, w - 52, 40, 5); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,190,90,0.35)"; g.beginPath(); rectanguloRedondeado(g, x0 + 30, top + 44, w - 60, 32, 4); g.fill();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.moveTo(x0 + 34, top + 46); g.lineTo(x0 + 48, top + 46); g.lineTo(x0 + 38, top + 74); g.lineTo(x0 + 32, top + 74); g.closePath(); g.fill();
    g.strokeStyle = "#a9a39a"; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 + 30, top + 31); g.lineTo(x1 - 30, top + 31); g.stroke();
    // patas
    g.fillStyle = "#2c2622"; g.fillRect(x0 + 6, BASE_MUEBLE - 8, 12, 10); g.fillRect(x1 - 18, BASE_MUEBLE - 8, 12, 10);
    g.restore();
  }
  function plantaSuelo(g, x, y) {
    g.save(); g.lineJoin = "round";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.2, L = 70 + 40 * hash(i * 3.1);
      g.fillStyle = i % 2 ? "#4f8a3c" : "#3c7031"; g.strokeStyle = TINTA; g.lineWidth = 1.3;
      const tx = x + Math.cos(a) * L, ty = y - 30 + Math.sin(a) * L;
      g.beginPath(); g.moveTo(x - 5, y - 30); g.quadraticCurveTo(x + (tx - x) * 0.5 - 8, y - 30 + (ty - y + 30) * 0.5, tx, ty); g.quadraticCurveTo(x + (tx - x) * 0.5 + 8, y - 30 + (ty - y + 30) * 0.5, x + 5, y - 30); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "rgba(220,230,150,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 32); g.quadraticCurveTo(x + (tx - x) * 0.5, y - 30 + (ty - y + 30) * 0.5, tx, ty); g.stroke();
    }
    g.fillStyle = "#c66a3d"; g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 22, y - 34); g.lineTo(x + 22, y - 34); g.lineTo(x + 17, y); g.lineTo(x - 17, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#a9552f"; g.fillRect(x - 23, y - 36, 46, 7); g.strokeRect(x - 23, y - 36, 46, 7);
    g.restore();
  }
  function dibVentana(g) {
    const { x0, x1, y0, y1 } = VENTANA;
    g.save(); g.lineJoin = "round";
    // marco
    g.fillStyle = "#efe4cf"; g.strokeStyle = TINTA; g.lineWidth = 2; g.fillRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20); g.strokeRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20);
    // cielo de noche
    const gc = g.createLinearGradient(0, y0, 0, y1); gc.addColorStop(0, "#152043"); gc.addColorStop(1, "#2f3c6e");
    g.fillStyle = gc; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    g.fillStyle = "#fff8d8"; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.4 + 0.6 * hash(i); g.beginPath(); g.arc(x0 + (x1 - x0) * hash(i * 3.1), y0 + 90 * hash(i * 5.7), 0.8 + hash(i * 2) * 1.2, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    const lu = { x: x1 - 44, y: y0 + 40 };
    const gl = g.createRadialGradient(lu.x, lu.y, 10, lu.x, lu.y, 60); gl.addColorStop(0, "rgba(255,245,200,0.4)"); gl.addColorStop(1, "rgba(255,245,200,0)"); g.fillStyle = gl; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(lu.x, lu.y, 17, 0, TAU); g.fill(); g.fillStyle = "#2a3666"; g.beginPath(); g.arc(lu.x + 8, lu.y - 5, 15, 0, TAU); g.fill();
    // ciudad
    const edif = [[0, 120, 34], [30, 96, 30], [56, 140, 40], [94, 110, 26], [118, 150, 50]];
    for (const [dx, h, w] of edif) {
      g.fillStyle = "#1b2140"; g.fillRect(x0 + dx, y1 - h + 50, w, h);
      g.fillStyle = "#ffd77a"; for (let yy = y1 - h + 58; yy < y1; yy += 12) for (let xx = x0 + dx + 4; xx < x0 + dx + w - 4; xx += 8) if (hash(xx * 1.3 + yy * 0.7) > 0.55) g.fillRect(xx, yy, 4, 5);
    }
    g.restore();
    // cruceta
    g.fillStyle = "#efe4cf"; g.fillRect((x0 + x1) / 2 - 4, y0, 8, y1 - y0); g.fillRect(x0, (y0 + y1) / 2 - 4, x1 - x0, 8);
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect((x0 + x1) / 2 - 4, y0, 8, y1 - y0); g.strokeRect(x0, (y0 + y1) / 2 - 4, x1 - x0, 8);
    // cortinillas de cuadros
    for (const sg of [-1, 1]) {
      const xe = sg < 0 ? x0 - 14 : x1 + 14, xi = sg < 0 ? x0 + 30 : x1 - 30;
      g.fillStyle = "#e7826b"; g.beginPath(); g.moveTo(xe, y0 - 16); g.lineTo(xi, y0 - 16); g.quadraticCurveTo(xi - sg * 10, y0 + 80, xe + sg * 4, y0 + 150); g.lineTo(xe, y0 + 150); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
      g.save(); g.clip(); g.fillStyle = "rgba(255,255,255,0.35)"; for (let yy = y0 - 16; yy < y0 + 160; yy += 10) for (let xx = Math.min(xe, xi) - 10; xx < Math.max(xe, xi) + 10; xx += 10) if (((xx + yy) / 10) % 2 === 0) g.fillRect(xx, yy, 5, 5); g.restore();
    }
    g.fillStyle = "#8c5c33"; g.fillRect(x0 - 24, y0 - 20, x1 - x0 + 48, 6); g.strokeRect(x0 - 24, y0 - 20, x1 - x0 + 48, 6);
    // alféizar con hierbas
    g.fillStyle = "#e8dcc2"; g.fillRect(x0 - 18, y1 + 8, x1 - x0 + 36, 8); g.strokeRect(x0 - 18, y1 + 8, x1 - x0 + 36, 8);
    for (const [px, col] of [[x0 + 18, "#6aa84f"], [x0 + 60, "#7fbf4a"], [x1 - 24, "#5f9a3e"]]) {
      g.fillStyle = col; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(px - 9 + i * 3.6, y1 - 6 - 6 * hash(i + px), 4, 7, (i - 2.5) * 0.25, 0, TAU); g.fill(); g.lineWidth = 1; g.stroke(); }
      g.fillStyle = "#d77a4a"; g.beginPath(); g.moveTo(px - 11, y1 - 4); g.lineTo(px + 11, y1 - 4); g.lineTo(px + 8, y1 + 8); g.lineTo(px - 8, y1 + 8); g.closePath(); g.fill(); g.lineWidth = 1.3; g.stroke();
    }
    g.restore();
  }
  function gancho(g, x, y) { g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 4); g.arc(x - 3, y + 6, 3, 0, Math.PI); g.stroke(); g.restore(); }
  function cazo(g, x, y) {
    gancho(g, x, y - 6);
    g.save(); g.lineJoin = "round"; g.fillStyle = "#c8833c"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); rectanguloRedondeado(g, x - 3, y, 6, 34, 3); g.fill(); g.stroke();
    g.fillStyle = "#d98e46"; g.beginPath(); g.arc(x, y + 52, 20, 0, TAU); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.arc(x - 6, y + 46, 7, 0, TAU); g.fill();
    g.restore();
  }
  function cucharon(g, x, y) {
    gancho(g, x, y - 6);
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.fillStyle = "#c9ccd0";
    g.beginPath(); rectanguloRedondeado(g, x - 2, y, 4, 48, 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x, y + 56, 10, 8, 0, 0, TAU); g.fill(); g.stroke(); g.restore();
  }
  function batidor(g, x, y) {
    gancho(g, x, y - 6);
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.fillStyle = "#3a3a3e";
    g.beginPath(); rectanguloRedondeado(g, x - 2.5, y, 5, 22, 2); g.fill(); g.stroke();
    g.strokeStyle = "#9aa0a6"; g.lineWidth = 1.2; for (const k of [-1, -0.4, 0.4, 1]) { g.beginPath(); g.moveTo(x, y + 22); g.quadraticCurveTo(x + 11 * k, y + 44, x, y + 56); g.stroke(); }
    g.restore();
  }
  function pan(g, x, y) {
    g.save(); g.fillStyle = "#a96f3d"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); rectanguloRedondeado(g, x - 26, y - 6, 52, 7, 2); g.fill(); g.stroke();
    g.fillStyle = "#d8a15c"; g.beginPath(); g.ellipse(x, y - 15, 22, 11, 0, Math.PI, 0); g.lineTo(x + 22, y - 6); g.lineTo(x - 22, y - 6); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#8a5428"; for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(x + dx - 3, y - 22); g.lineTo(x + dx + 3, y - 14); g.stroke(); }
    g.restore();
  }
  function radio(g, x, y) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.fillStyle = "#79c2ad"; g.beginPath(); g.moveTo(x - 44, y); g.lineTo(x - 44, y - 38); g.quadraticCurveTo(x - 44, y - 58, x - 22, y - 58); g.lineTo(x + 22, y - 58); g.quadraticCurveTo(x + 44, y - 58, x + 44, y - 38); g.lineTo(x + 44, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f2e8d2"; g.beginPath(); rectanguloRedondeado(g, x - 36, y - 48, 40, 38, 6); g.fill(); g.stroke();
    g.strokeStyle = "#b8ad94"; g.lineWidth = 1.4; for (let yy = y - 42; yy < y - 12; yy += 5) { g.beginPath(); g.moveTo(x - 32, yy); g.lineTo(x, yy); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.fillStyle = "#3d3a36"; g.beginPath(); rectanguloRedondeado(g, x + 10, y - 48, 26, 14, 3); g.fill(); g.stroke();
    for (const dy of [-22, -10]) { g.fillStyle = "#f2e8d2"; g.beginPath(); g.arc(x + 23, y + dy, 5.5, 0, TAU); g.fill(); g.stroke(); }
    g.fillStyle = "#4b8f7c"; g.fillRect(x - 46, y - 2, 92, 4);
    g.restore();
  }
  function macetita(g, x, y) {
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.3;
    g.fillStyle = "#6aa84f"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(x - 6 + i * 3, y - 24 - 5 * hash(i * 7), 4, 9, (i - 2) * 0.3, 0, TAU); g.fill(); g.stroke(); }
    g.fillStyle = "#f2e8d2"; g.beginPath(); g.moveTo(x - 10, y - 16); g.lineTo(x + 10, y - 16); g.lineTo(x + 8, y); g.lineTo(x - 8, y); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function nevera(g) {
    const { x0, x1, y0 } = NEVERA;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2;
    const gn = g.createLinearGradient(x0, 0, x1, 0); gn.addColorStop(0, "#e9dcc0"); gn.addColorStop(0.35, "#f7efdc"); gn.addColorStop(1, "#d8c9a8");
    g.fillStyle = gn; g.beginPath(); rectanguloRedondeado(g, x0, y0, x1 - x0, BASE_MUEBLE - y0, [34, 34, 8, 8]); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x0 + 4, y0 + 110); g.lineTo(x1 - 4, y0 + 110); g.stroke();
    g.fillStyle = "#b8b2a6"; g.beginPath(); rectanguloRedondeado(g, x0 + 16, y0 + 50, 7, 46, 3); g.fill(); g.stroke(); g.beginPath(); rectanguloRedondeado(g, x0 + 16, y0 + 124, 7, 60, 3); g.fill(); g.stroke();
    // imanes y un dibujo
    g.fillStyle = "#fffaf0"; g.save(); g.translate(x0 + 92, y0 + 160); g.rotate(-0.06); g.fillRect(-22, -26, 44, 52); g.strokeRect(-22, -26, 44, 52);
    g.strokeStyle = "#e4553f"; g.lineWidth = 2; g.beginPath(); g.moveTo(-14, 14); g.lineTo(-4, -8); g.lineTo(4, 6); g.lineTo(14, -12); g.stroke();
    g.fillStyle = "#f7c548"; g.beginPath(); g.arc(10, -16, 5, 0, TAU); g.fill(); g.restore();
    for (const [mx, my, col] of [[x0 + 92, y0 + 132, "#e4553f"], [x0 + 60, y0 + 40, "#3f8fc4"], [x0 + 120, y0 + 70, "#f7c548"]]) { g.fillStyle = col; g.beginPath(); g.arc(mx, my, 6, 0, TAU); g.fill(); g.lineWidth = 1.2; g.stroke(); }
    g.fillStyle = "#2c2622"; g.fillRect(x0 + 10, BASE_MUEBLE - 8, x1 - x0 - 20, 8);
    g.restore();
  }
  function sueloDamero(g) {
    const y0 = BASE_MUEBLE + 6, y1 = 720, xv = 512;
    g.save();
    g.fillStyle = "#efe6d2"; g.fillRect(FX, y0, FW, y1 - y0);
    const filas = [y0]; let h = 13; while (filas[filas.length - 1] < y1) { filas.push(filas[filas.length - 1] + h); h *= 1.28; }
    const ancho = y => 30 + (y - y0) * 0.55;          // ancho de baldosa según la profundidad
    for (let r = 0; r < filas.length - 1; r++) {
      const ya = filas[r], yb = filas[r + 1];
      for (let i = -40; i <= 40; i++) {
        if ((i + r) % 2 === 0) continue;
        const xa0 = xv + i * ancho(ya), xa1 = xv + (i + 1) * ancho(ya), xb0 = xv + i * ancho(yb), xb1 = xv + (i + 1) * ancho(yb);
        if (Math.max(xa1, xb1) < FX - 10 || Math.min(xa0, xb0) > FX + FW + 10) continue;
        g.fillStyle = "#2e3a3b"; g.beginPath(); g.moveTo(xa0, ya); g.lineTo(xa1, ya); g.lineTo(xb1, yb); g.lineTo(xb0, yb); g.closePath(); g.fill();
      }
    }
    // brillo del encerado y sombra junto a la pared
    const gb = g.createLinearGradient(0, y0, 0, y0 + 40); gb.addColorStop(0, "rgba(20,30,30,0.35)"); gb.addColorStop(1, "rgba(20,30,30,0)"); g.fillStyle = gb; g.fillRect(FX, y0, FW, 40);
    g.restore();
  }
  // lámpara colgante y su luz cálida
  function creaLampara() {
    const c = document.createElement("canvas"); c.width = 640; c.height = 720; const g = c.getContext("2d");
    g.translate(320, 160);
    const gl = g.createRadialGradient(0, 40, 10, 0, 300, 360); gl.addColorStop(0, "rgba(255,214,140,0.30)"); gl.addColorStop(1, "rgba(255,214,140,0)");
    g.fillStyle = gl; g.beginPath(); g.moveTo(-26, 30); g.lineTo(26, 30); g.lineTo(300, 560); g.lineTo(-300, 560); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -160); g.lineTo(0, 0); g.stroke();
    const gc = g.createLinearGradient(-30, 0, 30, 0); gc.addColorStop(0, "#9c5a2a"); gc.addColorStop(0.4, "#e0985a"); gc.addColorStop(1, "#8a4e24");
    g.fillStyle = gc; g.beginPath(); g.moveTo(-6, -2); g.lineTo(6, -2); g.quadraticCurveTo(32, 6, 34, 30); g.lineTo(-34, 30); g.quadraticCurveTo(-32, 6, -6, -2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff4cc"; g.beginPath(); g.ellipse(0, 31, 24, 5, 0, 0, TAU); g.fill();
    return c;
  }

  // objetos de la balda (se mueven con el golpe)
  function balda(g, t) {
    const tb = dentro(t, T.choque, T.choque + 0.03, T.choque + 0.5, T.choque + 0.9);
    const sac = 0.06 * Math.sin((t - T.choque) * 30) * tb;
    const tarros = [[-80, 34, 52, "#f2d38c"], [-36, 30, 40, "#e9a25a"], [4, 32, 46, "#d9d1b8"], [44, 26, 34, "#c97b52"], [86, 40, 30, null]];
    g.save(); g.lineJoin = "round";
    for (const [x, w, h, col] of tarros) {
      g.save(); g.translate(x, BALDA.y); g.rotate(sac * (hash(x) - 0.5) * 2);
      if (col) {
        g.fillStyle = "rgba(225,240,240,0.55)"; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); rectanguloRedondeado(g, -w / 2, -h, w, h, 5); g.fill(); g.stroke();
        g.fillStyle = col; g.beginPath(); rectanguloRedondeado(g, -w / 2 + 3, -h * 0.72, w - 6, h * 0.72 - 3, 3); g.fill();
        g.fillStyle = "#b07a45"; g.beginPath(); rectanguloRedondeado(g, -w / 2 - 1, -h - 7, w + 2, 8, 3); g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-w / 2 + 4, -h + 6, 4, h - 14);
      } else {
        // pila de cuencos
        for (let i = 0; i < 3; i++) { g.fillStyle = ["#3f8fc4", "#f7c548", "#e4553f"][i]; g.beginPath(); g.ellipse(0, -6 - i * 8, 18 - i, 6, 0, 0, Math.PI); g.lineTo(-18 + i, -6 - i * 8); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke(); }
      }
      g.restore();
    }
    g.restore();
  }
  // la sartén colgada (hasta que Guillermo la coge)
  function sartenColgada(g, t) {
    if (t >= T.coge) return;
    const q = colgada(t); dibSarten(g, q.x, q.y, q.a, 0);
  }
  // radio: luz del dial
  function radioLuz(g, t) {
    const k = 0.6 + 0.4 * acento(t, 0, DUR);
    g.save(); g.fillStyle = `rgba(255,190,80,${0.75 * k})`; g.beginPath(); rectanguloRedondeado(g, RADIO.x + 12, RADIO.y - 46, 22, 10, 2); g.fill();
    g.strokeStyle = "#e4553f"; g.lineWidth = 1.6; const xi = RADIO.x + 14 + 18 * (0.5 + 0.5 * Math.sin(t * 0.3)); g.beginPath(); g.moveTo(xi, RADIO.y - 46); g.lineTo(xi, RADIO.y - 36); g.stroke();
    g.restore();
  }
  function sombra(g, x, ancho, k = 1) {
    g.save(); g.fillStyle = `rgba(20,20,25,${0.3 * k})`; g.beginPath(); g.ellipse(x, SUELO + 3, ancho, 8, 0, 0, TAU); g.fill(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const P = [
      [0, { x: 650, y: 322, k: 1.2 }],
      [T.entra0 - 0.3, { x: 650, y: 322, k: 1.2 }],
      [T.entra1 + 0.1, { x: 560, y: 306, k: 1.08 }],
      [T.guitarra, { x: 548, y: 306, k: 1.1 }],
      [T.mHacia1, { x: 520, y: 308, k: 1.12 }],
      [T.giro0, { x: 500, y: 308, k: 1.1 }],
      [T.choque + 0.1, { x: 380, y: 304, k: 1.08 }],
      [T.mCorre1, { x: 290, y: 300, k: 1.12 }],
      [T.paf, { x: 270, y: 300, k: 1.14 }],
      [T.aclara1, { x: 266, y: 312, k: 1.16 }],
      [T.risa0 + 0.3, { x: 262, y: 320, k: 1.22 }],
      [DUR, { x: 262, y: 322, k: 1.24 }]
    ];
    let a = P[0][1];
    for (let i = 1; i < P.length; i++) {
      const [t1, b] = P[i], t0 = P[i - 1][0]; if (t <= t0) break;
      const k = suave(fase(t, t0, t1)); a = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), k: lerp(a.k, b.k, k) };
    }
    const c = Object.assign({}, a);
    // sacudidas suaves (choque y nube)
    const s1 = Math.exp(-7 * Math.max(0, t - T.choque)) * tramo(t, T.choque, T.choque + 0.04);
    const s2 = Math.exp(-5 * Math.max(0, t - T.paf)) * tramo(t, T.paf, T.paf + 0.05);
    c.x += 3 * s1 * ruido(t * 24) + 4 * s2 * ruido(t * 20 + 5); c.y += 2.5 * s1 * ruido(t * 21 + 2) + 3 * s2 * ruido(t * 18 + 9);
    return c;
  }

  function poses(t) { return { g: poseG(t), m: poseM(t) }; }

  class BaileCocina extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) { fondo = creaFondo(); lamparaImg = creaLampara(); BOLA = creaBola(); }
      const pM = poseM(t), pG = t > T.entra0 ? poseG(t) : null;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, FX, FY);
      balda(g, t);
      const s = saco(t, pG || pM);
      if (t < T.vuelca) dibSaco(g, s, t);
      dibOlla(g, t);
      vapor(g, t, 1 - 0.7 * tramo(t, T.paf, T.paf + 0.3));
      sartenColgada(g, t);
      radioLuz(g, t);
      harinaSuelo(g, t);
      g.drawImage(lamparaImg, LAMPARA.x - 320, LAMPARA.y - 160);
      // sombras
      sombra(g, pM.x, 40 * Math.max(0.4, Math.abs(pM.sx)));
      if (pG) sombra(g, pG.x, 46 * Math.max(0.4, Math.abs(pG.sx)) * (1 - 0.3 * campana(t, T.salto - 0.12, T.giro0 + 0.12)));
      rayas(g, t, pG || { x: 2000 });
      // los dos (Marta detrás: Guillermo pasa por delante)
      const harina = tramo(t, T.paf + 0.04, T.paf + 0.2);
      dibujaPersonajes(g, t, pG, pM, harina);
      cucharaAire(g, pM);
      if (pG) grumos(g, t, pG, pM);
      // el saco cayendo / en la cabeza / en el suelo
      if (t >= T.vuelca) { chorro(g, t, s); dibSaco(g, s, t); }
      golpeEncimera(g, t);
      notas(g, t, pG, pM);
      if (pG) puffs(g, t, pG, pM);
      nube(g, t);
      motas(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00100.2", nombre: "Guillermo y Marta · El baile en la cocina", crear: () => new BaileCocina() });
  // diagnóstico: distancia hombro → muñeca frente al máximo del brazo
  function diag(t) {
    const pG = poseG(t), pM = poseM(t), o = {};
    const dist = (R, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) return null; const h = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO);
      const mu = m.mu ?? -1.75, w = R.rotP({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      const L = lado === "cerca" ? R.BRAZO_C_L : R.BRAZO_L;
      return +(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y) / L).toFixed(2); };
    o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos"); o.mC = dist(M, pM, "cerca"); o.mL = dist(M, pM, "lejos");
    return o;
  }
  window.__A2D_00100_2 = { pose: poses, poseG, poseM, T, DUR, diag, saco, bocaSaco, impactoHarina, OLLA, colgada, SARTEN_GANCHO, T_LANZA, T_ATRAPA, CRUCE0, CRUCE1, guitarraHoja, SART, camara };
})();
