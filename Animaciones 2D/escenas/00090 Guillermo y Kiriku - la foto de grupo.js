"use strict";
/* 00090 · Guillermo y Kiriku · La foto de grupo
 *
 * Negro → mirador de un parque a la hora dorada: el sol bajando detrás de las colinas, la ciudad al
 * otro lado de la bahía con las primeras ventanas encendidas, nubes rosadas, una barandilla de hierro
 * sobre un murete de piedra, una farola que se acaba de encender, un banco verde y un árbol enorme.
 * En primer plano, a la izquierda, una cámara de fotos sobre su trípode (con flash y una lucecita
 * roja de temporizador; sin números ni letras).
 * Guillermo, detrás de la cámara, mira por el visor, encuadra (la sube y la baja) y le hace señas a
 * Kiriku para que se corra un poco; aprieta el disparador y la lucecita empieza a parpadear (cada vez
 * más rápido). Kiriku se pone en pose (pie adelantado, mano en la cadera, barbilla arriba). Guillermo sale
 * corriendo… se engancha con la pata del trípode, la cámara se queda mirando al suelo y él sale dando
 * traspiés. Vuelve, pasa la pata con muchísimo cuidado, endereza la cámara y le da dos palmaditas;
 * Kiriku, mientras, pone los ojos en blanco y da golpecitos con el pie. Guillermo salta la pata con
 * una zancada exagerada, mira a cámara muy chulo y esprinta; Kiriku, de reojo, adelanta el pie un
 * pelín… y Guillermo tropieza con él.
 * ¡Flash! La imagen se congela y se convierte en la foto impresa (borde blanco, un poco torcida, con
 * su sombra): Kiriku perfecto y Guillermo en horizontal en el aire con cara de susto → negro.
 *
 * La foto es un fotograma de la propia escena (instante T.foto) recortado alrededor de los dos y
 * pintado una sola vez en un lienzo aparte; el fondo de detrás también se prepara una vez.
 * Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash, mezcla } = M2;
  const G = Guillermo, KI = Kiriku;
  const DUR = 12.9;
  const S = 0.27, SUELO_G = 566, SUELO_K = 556;
  const kK = S * KI.K;
  const TAU = Math.PI * 2, TINTA = "#16121c";
  const P = (x, y) => ({ x, y });
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };

  const T = {
    visor: 0.55, ajusta0: 0.95, ajusta1: 1.75,
    agita0: 1.82, agita1: 2.36, pasoK0: 2.08, pasoK1: 2.48, asiente: 2.42,
    boton0: 2.58, clic: 2.84, poseK0: 2.95, poseK1: 3.38,
    yergue0: 2.9, yergue1: 3.08, corre0: 3.1, tropieza: 3.5,
    traspies1: 4.22, alivio: 4.45, giraA0: 4.78, giraA1: 4.98, susto: 5.02,
    vuelve0: 5.2, pata0: 5.42, pata1: 5.74, vuelve1: 5.98,
    giraB0: 6.0, giraB1: 6.2, endereza0: 6.34, endereza1: 6.6, pal1: 6.7, pal2: 6.86,
    listo: 6.96, zancada0: 7.08, chulo: 7.24, zancada1: 7.46, sprint0: 7.46, tropiezo: 8.0,
    foto: 8.32, blanco0: 8.24, blanco1: 8.68, revela0: 8.76, revela1: 9.42, fin0: 11.98,
    rodaK0: 5.12, ojosK: 5.25, golpeteo0: 5.55, golpeteo1: 6.55, recomp0: 6.6, recomp1: 6.9
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const todos = k => D5(k, k, k, k, k);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  // giro aplastado: +1 mira a la derecha, −1 a la izquierda; cada tramo [a, b] da media vuelta
  function giro(t, lista, s0 = 1) {
    let s = s0;
    for (const [a, b, f] of lista) { if (t >= b) s = -s; else if (t > a) return s * Math.cos(Math.PI * (f || suave)(fase(t, a, b))); }
    return s;
  }
  // claves [t, v…] con interpolación suave
  function claves(lista, t) {
    if (t <= lista[0][0]) return lista[0].slice(1);
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) {
      const a = lista[i - 1], b = lista[i], f = b.f || suave, k = f(fase(t, a[0], b[0]));
      return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
    }
    return lista[lista.length - 1].slice(1);
  }
  const K_ = (arr, f) => { arr.f = f; return arr; };

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en la hoja en cada fotograma.
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  const offMano = (Rg, m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * Rg.JK, y: r.y * Rg.JK }, m.ang || 0); };
  const PALMA = { x: 0, y: 1 }, PINZA = { x: 6.2, y: 15.5 }, YEMA = { x: 8.4, y: 18.9 };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) {
        const B = Rg.manoReposo ? Rg.manoReposo(p, lado) : Tr(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
        return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: 0, dedos: todos(0.4), dobla: lado === "cerca" ? -1 : 1 };
      }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else {
        const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(Rg, m, o.ref || PALMA);
        q = { x: h.x - f.x, y: h.y - f.y };
      }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos || todos(0.5), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  const mano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });
  const mezM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerp(a.mu, b.mu, k), ang: lerp(a.ang, b.ang, k), puno: lerp(a.puno, b.puno, k),
    dedos: DD(a.dedos, b.dedos, k), dobla: k < 0.5 ? a.dobla : b.dobla });
  const M = (x, y, mu, dedos, dobla, ang = 0) => ({ x, y, mu, ang, puno: 1, dedos, dobla });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* =====================================================================================
   * EL TRÍPODE Y LA CÁMARA (coordenadas de pantalla; la cámara, en su marco: origen en la rótula)
   * ===================================================================================== */
  const TRI = { cab: P(230, 362), collar: P(230, 420), atras: P(156, 566), delante: P(306, 568), frente: P(240, 584) };
  const CAMP = { boton: P(-27, -66), visor: P(-44, -50), anillo: P(55, -34), dorso: P(-30, -62), asa: P(-36, -24), led: P(40, -54), flash: P(15, -84), lomo: P(2, -74) };
  function estadoTripode(t) {
    let cam = 0, roca = 0;
    const u = t - T.tropieza;
    if (u > 0) {
      roca = 0.05 * Math.exp(-u * 5) * Math.sin(u * 24) * (1 - tramo(t, T.endereza0, T.endereza1));
      const cae = salida(fase(t, T.tropieza + 0.03, T.tropieza + 0.26));
      const v = Math.max(0, u - 0.26);
      cam = 0.44 * cae - 0.07 * Math.exp(-v * 7) * Math.sin(v * 21) * (u > 0.26 ? 1 : 0);
    }
    const k = tramo(t, T.endereza0, T.endereza1);
    const w = Math.max(0, t - T.endereza1);
    cam = lerp(cam, 0, k) + (t > T.endereza1 ? 0.035 * Math.exp(-w * 8) * Math.sin(w * 26) : 0);
    // palmaditas: la cámara cabecea un pelín; al encuadrar, Guillermo la sube y la baja un poco
    cam += 0.012 * (campana(t, T.pal1, T.pal1 + 0.1) + campana(t, T.pal2, T.pal2 + 0.1));
    cam += -0.07 * Math.sin((t - T.ajusta0) * TAU / 0.8) * campana(t, T.ajusta0, T.ajusta1);
    return { cam, roca };
  }
  // el disparador baja al pulsarlo
  const pulsado = t => campana(t, T.clic - 0.08, T.clic + 0.1);
  // punto del marco de la cámara → pantalla
  function camPunto(t, q) {
    const e = estadoTripode(t), r = rota(q, e.cam), c = { x: TRI.cab.x + r.x, y: TRI.cab.y + r.y };
    const o = TRI.atras, d = rota({ x: c.x - o.x, y: c.y - o.y }, e.roca);
    return { x: o.x + d.x, y: o.y + d.y };
  }
  function dibujaTripode(g, t, conCamara = true) {
    const e = estadoTripode(t);
    g.save();
    g.translate(TRI.atras.x, TRI.atras.y); g.rotate(e.roca); g.translate(-TRI.atras.x, -TRI.atras.y);
    g.lineCap = "round"; g.lineJoin = "round";
    const pata = (a, b, w) => {
      g.strokeStyle = TINTA; g.lineWidth = w + 4; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      const gr = g.createLinearGradient(a.x - 6, 0, a.x + 6, 0); gr.addColorStop(0, "#d8dbe2"); gr.addColorStop(0.5, "#9aa0ad"); gr.addColorStop(1, "#5d6270");
      g.strokeStyle = gr; g.lineWidth = w; g.stroke();
      // tramo grueso de arriba y la goma de abajo
      const m = mezcla(a, b, 0.45);
      g.strokeStyle = TINTA; g.lineWidth = w + 7; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(m.x, m.y); g.stroke();
      g.strokeStyle = "#3b3f49"; g.lineWidth = w + 3; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a.x - 2, a.y); g.lineTo(m.x - 2, m.y); g.stroke();
      const q = mezcla(a, b, 0.47);
      g.fillStyle = "#c9a14a"; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(q.x, q.y, 4.5, 3, Math.atan2(b.y - a.y, b.x - a.x), 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#1d1c22"; g.beginPath(); g.ellipse(b.x, b.y - 1, 6, 3.5, 0, 0, TAU); g.fill();
    };
    const col = TRI.collar;
    pata({ x: col.x - 4, y: col.y + 4 }, TRI.atras, 5);
    pata({ x: col.x + 4, y: col.y + 4 }, TRI.delante, 5);
    // columna central y collar
    g.strokeStyle = TINTA; g.lineWidth = 10; g.beginPath(); g.moveTo(col.x, col.y + 26); g.lineTo(TRI.cab.x, TRI.cab.y + 4); g.stroke();
    g.strokeStyle = "#8d93a0"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#2c2f37"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.roundRect(col.x - 13, col.y - 6, 26, 16, 4); g.fill(); g.stroke();
    // manivela de la columna
    g.strokeStyle = TINTA; g.lineWidth = 4; g.beginPath(); g.moveTo(col.x + 12, col.y + 2); g.lineTo(col.x + 26, col.y + 8); g.stroke();
    g.strokeStyle = "#6b707c"; g.lineWidth = 2; g.stroke();
    // pata de delante (la que viene hacia nosotros), encima de todo el trípode
    pata({ x: col.x, y: col.y + 6 }, TRI.frente, 5.5);
    if (conCamara) dibujaCamara(g, t, e);
    g.restore();
  }
  function dibujaCamara(g, t, e) {
    g.save();
    g.translate(TRI.cab.x, TRI.cab.y); g.rotate(e.cam);
    g.lineJoin = "round"; g.lineCap = "round";
    // rótula y zapata
    g.fillStyle = "#2a2d35"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(-20, -16, 40, 10, 3); g.fill(); g.stroke();
    // mango de la rótula (hacia atrás)
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(-8, -4); g.lineTo(-52, 6); g.stroke();
    g.strokeStyle = "#555a66"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#1a1a1f"; g.beginPath(); g.ellipse(-54, 6.5, 6, 4, 0.2, 0, TAU); g.fill();
    // cuerpo
    const cuerpo = () => { g.beginPath(); g.roundRect(-40, -60, 80, 46, 8); };
    cuerpo(); const gc = g.createLinearGradient(0, -60, 0, -14); gc.addColorStop(0, "#3a3c44"); gc.addColorStop(1, "#18191e");
    g.fillStyle = gc; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    // piel rugosa (franja) y asa
    g.fillStyle = "#24252b"; g.fillRect(-38, -46, 76, 22);
    g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 1; for (let i = -36; i < 38; i += 4) { g.beginPath(); g.moveTo(i, -45); g.lineTo(i + 2, -25); g.stroke(); }
    g.fillStyle = "#2b2c33"; g.beginPath(); g.roundRect(-44, -54, 14, 36, 6); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    // joroba del visor
    g.fillStyle = "#30323a"; g.beginPath(); g.moveTo(-18, -60); g.lineTo(-12, -74); g.lineTo(14, -74); g.lineTo(20, -60); g.closePath(); g.fill(); g.lineWidth = 2.5; g.stroke();
    // flash en la zapata
    g.fillStyle = "#26272d"; g.beginPath(); g.roundRect(-6, -78, 14, 6, 2); g.fill(); g.stroke();
    g.fillStyle = "#2f3038"; g.beginPath(); g.roundRect(-14, -98, 34, 22, 4); g.fill(); g.stroke();
    g.fillStyle = "#f2efe6"; g.beginPath(); g.roundRect(15, -96, 5, 18, 2); g.fill(); g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(-10, -95, 22, 3);
    // disparador y rueda
    g.fillStyle = "#8a8f9a"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.roundRect(-33, -66, 12, 6, 2); g.fill(); g.stroke();
    g.fillStyle = "#cc3b33"; g.beginPath(); g.ellipse(-27, -67 + 1.5 * pulsado(t), 4.5, 2.2, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#4a4d57"; g.beginPath(); g.roundRect(22, -66, 12, 6, 2); g.fill(); g.stroke();
    // visor (ocular de goma)
    g.fillStyle = "#121216"; g.beginPath(); g.roundRect(-50, -58, 12, 16, 4); g.fill(); g.stroke();
    // objetivo: barril, anillos y cristal
    g.fillStyle = "#1c1d22"; g.beginPath(); g.roundRect(38, -56, 30, 42, 4); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#2c2e35"; for (const x of [44, 52]) { g.fillRect(x, -55, 4, 40); }
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 1; for (let y = -54; y < -16; y += 3) { g.beginPath(); g.moveTo(44, y); g.lineTo(56, y); g.stroke(); }
    g.fillStyle = "#2a2b31"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.roundRect(66, -60, 10, 50, 3); g.fill(); g.stroke();
    g.fillStyle = "#c9a14a"; g.fillRect(60, -55, 3, 40);
    const cr = g.createLinearGradient(74, -58, 82, -12); cr.addColorStop(0, "#6d8fd4"); cr.addColorStop(0.5, "#2a2f6b"); cr.addColorStop(1, "#7a4fa0");
    g.fillStyle = cr; g.beginPath(); g.ellipse(77, -35, 4, 21, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(78, -44, 1.6, 5, 0, 0, TAU); g.fill();
    // brillo del cuerpo
    g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, -57); g.lineTo(34, -57); g.stroke();
    // lucecita del temporizador
    const led = brilloLed(t);
    g.fillStyle = "#3a0d0d"; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.arc(33, -50, 4, 0, TAU); g.fill(); g.stroke();
    if (led > 0.01) {
      const gl = g.createRadialGradient(33, -50, 1, 33, -50, 16); gl.addColorStop(0, `rgba(255,80,60,${0.9 * led})`); gl.addColorStop(1, "rgba(255,60,40,0)");
      g.fillStyle = gl; g.beginPath(); g.arc(33, -50, 16, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,${Math.round(90 + 120 * led)},${Math.round(80 + 100 * led)},1)`; g.beginPath(); g.arc(33, -50, 3.2, 0, TAU); g.fill();
    }
    g.restore();
  }
  // temporizador: el parpadeo se acelera de 1,6 a 9 destellos por segundo hasta la foto
  function faseLed(t) {
    const d = T.foto - T.clic, tt = Math.min(t, T.foto), u = clamp((tt - T.clic) / d);
    return (tt - T.clic) * 1.6 + (9 - 1.6) * d * u * u * u / 3;
  }
  function brilloLed(t) {
    if (t < T.clic) return 0;
    if (t >= T.foto) return 1;
    const c = 0.5 + 0.5 * Math.cos(TAU * faseLed(t));
    return clamp((c - 0.3) / 0.35);
  }

  /* =====================================================================================
   * KIRIKU (mira a la izquierda, hacia la cámara)
   * ===================================================================================== */
  const XK0 = 690, XK = 732;
  const TOB_K = KI.SUELO - KI.TOBILLO_ALTO;
  const CK = {
    espera: E({ mx: 0.85, my: 0.15, c: 0.18, sd: 4, si: 4, sonr: 0.3, ancho: 0.9 }),
    asiente: E({ mx: 0.85, my: 0.1, c: 0.2, sd: 10, si: 2, sonr: 0.45, ancho: 0.95 }),
    pose: E({ mx: 0.35, my: 0.0, c: 0.4, sd: 14, gd: 0.04, si: 4, sonr: 0.7, ancho: 1.0 }),
    sigue: E({ mx: 0.95, my: 0.35, c: 0.42, sd: 20, gd: 0.08, si: 2, sonr: 0.45, ancho: 0.95 }),
    harto: E({ mx: 0.1, my: -1, c: 0.45, sd: 16, si: 16, sonr: -0.05, ancho: 0.7 }),
    golpea: E({ mx: 0.9, my: 0.45, c: 0.5, sd: -6, gd: -0.12, si: 8, sonr: -0.1, ancho: 0.62 }),
    pillo: E({ mx: 0.95, my: 0.25, c: 0.45, sd: -2, gd: -0.06, si: 16, gi: 0.08, sonr: 0.62, ancho: 0.92 }),
    final: E({ mx: 0.22, my: 0.02, c: 0.38, sd: 12, gd: 0.03, si: 2, sonr: 0.85, ancho: 1.06, abre: 5 })
  };
  const GUION_CK = [
    [T.asiente - 0.1, T.asiente + 0.1, "asiente"], [T.poseK0, T.poseK1, "pose"],
    [T.tropieza + 0.05, T.tropieza + 0.2, "sigue"], [T.traspies1 + 0.2, T.traspies1 + 0.45, "pose"],
    [T.ojosK, T.ojosK + 0.25, "harto"], [T.golpeteo0 - 0.1, T.golpeteo0 + 0.1, "golpea"],
    [T.recomp0, T.recomp1, "pose"], [T.sprint0 + 0.06, T.sprint0 + 0.2, "pillo"], [T.sprint0 + 0.4, T.tropiezo - 0.02, "final"]
  ];
  const PARP_K = [0.62, 1.75, 4.6, 6.7, 7.35];
  const CuK = o => Object.assign({ torso: 0.02, cab: 0.0, pel: 0, cdy: 0 }, o);
  const CUER_K = {
    espera: CuK({}),
    pose: CuK({ torso: -0.07, cab: -0.13, cdy: -3 }),
    sigue: CuK({ torso: -0.05, cab: -0.04 }),
    harto: CuK({ torso: -0.02, cab: -0.2, pel: 6 }),
    golpea: CuK({ torso: 0.02, cab: 0.04, pel: 4 }),
    final: CuK({ torso: -0.08, cab: -0.16, cdy: -4 })
  };
  const GUION_K = [
    [T.poseK0, T.poseK1, "pose"], [T.tropieza + 0.05, T.tropieza + 0.25, "sigue"], [T.traspies1 + 0.2, T.traspies1 + 0.5, "pose"],
    [T.ojosK, T.ojosK + 0.3, "harto"], [T.golpeteo0 - 0.1, T.golpeteo0 + 0.15, "golpea"], [T.recomp0, T.recomp1, "pose"],
    [T.sprint0, T.sprint0 + 0.35, "final"]
  ];
  const CADERA_K = { hoja: { x: 118, y: 640 }, mu: -0.45, dedos: D5(0.2, 0.15, 0.1, 0.1, 0.1), dobla: -1 };
  // pie adelantado (pierna lejana): talón en el suelo y punta arriba
  function pieDelante(ang) {
    const tal = rota(KI.TALON, ang), tal0 = KI.TALON;
    return { tob: P(KI.PELVIS.x + 168 + 40 * pieFuera(tAct), TOB_K - (tal.y - tal0.y)), ang };
  }
  function xK(t) { return lerp(XK0, XK, tramo(t, T.pasoK0, T.pasoK1)); }
  // el pie que «se escapa» un poco hacia delante justo antes de que pase Guillermo (¿sin querer?)
  let tAct = 0;
  const pieFuera = t => tramo(t, T.sprint0 + 0.12, T.sprint0 + 0.32);
  function poseK(t) {
    const b = linea(GUION_K, CUER_K, "espera", t);
    tAct = t;
    const respira = Math.sin(t * 1.8 + 0.5);
    const x = xK(t);
    const p = {
      x, suelo: SUELO_K, s: S, tirasLimpias: true, espejo: true,
      pelvis: P(KI.PELVIS.x, KI.PELVIS.y + b.pel + respira * 1.1), torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // asiente
    p.cabeza.ang += 0.06 * Math.sin((t - T.asiente) * TAU / 0.26) * campana(t, T.asiente, T.asiente + 0.52);
    // suspiro al poner los ojos en blanco
    const sus = campana(t, T.ojosK, T.ojosK + 0.6);
    p.torsoEsc.y += 0.012 * sus; p.pelvis.y += 3 * sus;
    // piernas: el paso al lado y luego la pose (pie lejano adelantado)
    const bas = { tob: P(KI.PELVIS.x - 52, TOB_K), ang: 0 }, basL = { tob: P(KI.PELVIS.x + 58, TOB_K), ang: 0 };
    // el paso: en la hoja, el pie cercano y luego el lejano (Kiriku se corre hacia la derecha de la pantalla = −x en la hoja)
    const dxPaso = (XK - XK0) / kK;
    const kPc = tramo(t, T.pasoK0, T.pasoK0 + 0.22), kPl = tramo(t, T.pasoK0 + 0.16, T.pasoK1);
    // pies quietos en el mundo mientras la pelvis se mueve: compensa
    const despl = (x - XK0) / kK;
    const pc = { tob: P(bas.tob.x + despl - dxPaso * kPc, bas.tob.y - 26 * campana(t, T.pasoK0, T.pasoK0 + 0.22)), ang: 0 };
    const pl = { tob: P(basL.tob.x + despl - dxPaso * kPl, basL.tob.y - 22 * campana(t, T.pasoK0 + 0.16, T.pasoK1)), ang: 0 };
    let angPie = -0.22;
    // golpecitos impacientes con la punta
    const gol = tramo(t, T.golpeteo0, T.golpeteo0 + 0.1) * (1 - tramo(t, T.golpeteo1 - 0.1, T.golpeteo1));
    if (gol > 0) angPie = lerp(angPie, -0.42 + 0.34 * Math.abs(Math.sin((t - T.golpeteo0) * TAU / 0.4)), gol);
    const del = pieDelante(angPie), atras = { tob: P(KI.PELVIS.x - 34, TOB_K), ang: 0.04 };
    const kp = tramo(t, T.poseK0, T.poseK1);
    const arco = 18 * campana(t, T.poseK0, T.poseK1);
    p.piernas.lejos = { tob: P(lerp(pl.tob.x, del.tob.x, kp), lerp(pl.tob.y, del.tob.y, kp) - arco), ang: lerp(0, del.ang, kp) };
    p.piernas.cerca = { tob: P(lerp(pc.tob.x, atras.tob.x, kp), lerp(pc.tob.y, atras.tob.y, kp)), ang: lerp(0, atras.ang, kp) };
    // cara
    p.cara = cara(linea(GUION_CK, CK, "espera", t), parpadeo(t, PARP_K));
    // manos: las dos en los bolsillos y, en la pose, la cercana a la cadera
    const res = resolutor(KI, p, "cerca"), resL = resolutor(KI, p, "lejos");
    const C = pista([[0, 0, { bols: true }], [T.poseK0 + 0.05, T.poseK1, CADERA_K]], t, res);
    const L = pista([[0, 0, { bols: true }]], t, resL);
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    return p;
  }
  // la punta del pie adelantado de Kiriku (pantalla)
  function puntaK(t) {
    const p = poseK(t), q = p.piernas.lejos, o = rota(KI.PUNTA, q.ang);
    return KI.aPantalla(p, P(q.tob.x + o.x, q.tob.y + o.y));
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const XG0 = 116;
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const CG = {
    visor: E({ mx: 0.9, my: 0.6, c: 0.1, sd: 8, gd: -0.04, si: 2, sonr: 0.1, ancho: 0.7 }),
    ajusta: E({ mx: 0.9, my: 0.55, c: 0.2, ci: 0.55, sd: 12, gd: -0.08, si: -8, sonr: 0.0, ancho: 0.5, abre: 2 }),
    senas: E({ mx: 0.95, my: 0.05, sd: 16, si: 6, sonr: 0.3, ancho: 0.85, abre: 8 }),
    vale: E({ mx: 0.9, my: 0.0, c: 0.1, sd: 12, si: 10, sonr: 0.75, ancho: 1.05 }),
    pulsa: E({ mx: 0.9, my: 0.3, sd: 14, si: 14, sonr: 0.85, ancho: 1.1, abre: 6 }),
    corre: E({ mx: 0.95, my: -0.05, sd: 10, gd: -0.12, si: 10, gi: -0.12, sonr: 0.5, ancho: 0.9, abre: 4 }),
    tropieza: E({ mx: 0.6, my: 0.6, iris: 0.72, sd: 26, si: 26, abre: 24, ancho: 0.58, sonr: -0.25 }),
    alivio: E({ mx: 0.1, my: 0, c: 0.75, sd: 10, si: 10, sonr: 0.5, ancho: 0.9, abre: 4 }),
    sonrisa: E({ mx: 0.0, my: 0, c: 0.1, h: 0.4, sd: 14, si: 14, sonr: 0.9, ancho: 1.12 }),
    horror: E({ mx: 0.95, my: 0.35, iris: 0.7, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 16, ancho: 0.95, sonr: -0.55 }),
    cuidado: E({ mx: 0.85, my: 0.9, c: 0.15, sd: 4, gd: -0.12, si: 4, gi: -0.12, ancho: 0.45, sonr: -0.05 }),
    arregla: E({ mx: 0.95, my: 0.25, c: 0.1, sd: 10, gd: -0.08, si: 6, sonr: 0.05, ancho: 0.5, abre: 2 }),
    contento: E({ mx: 0.4, my: 0.0, c: 0.2, h: 0.5, sd: 16, si: 16, sonr: 0.85, ancho: 1.05 }),
    chulo: E({ mx: -0.1, my: 0.0, c: 0.35, sd: 24, gd: 0.12, si: 4, gi: -0.1, sonr: 0.8, ancho: 1.0 }),
    sprint: E({ mx: 0.95, my: -0.1, sd: 6, gd: -0.16, si: 6, gi: -0.16, sonr: 0.6, ancho: 1.0, abre: 6 }),
    vuela: E({ mx: -0.15, my: 0.05, iris: 0.66, sd: 30, si: 30, abre: 34, ancho: 0.62, sonr: -0.3 })
  };
  const GUION_CG = [
    [T.ajusta0, T.ajusta0 + 0.15, "ajusta"], [T.ajusta1, T.ajusta1 + 0.1, "visor"], [T.agita0, T.agita0 + 0.12, "senas"], [T.asiente - 0.08, T.asiente + 0.1, "vale"],
    [T.boton0, T.boton0 + 0.15, "pulsa"], [T.corre0 - 0.05, T.corre0 + 0.1, "corre"], [T.tropieza, T.tropieza + 0.06, "tropieza", salida],
    [T.traspies1 - 0.1, T.alivio, "alivio"], [T.alivio + 0.15, T.alivio + 0.3, "sonrisa"], [T.giraA1 - 0.02, T.susto + 0.06, "horror", salida],
    [T.pata0 - 0.1, T.pata0 + 0.1, "cuidado"], [T.giraB0, T.giraB1, "arregla"], [T.pal1, T.pal1 + 0.1, "contento"],
    [T.zancada0 + 0.04, T.chulo, "chulo"], [T.zancada1 - 0.06, T.sprint0 + 0.1, "sprint"], [T.tropiezo + 0.02, T.tropiezo + 0.12, "vuela", salida]
  ];
  const PARP_G = [1.5, 3.95, 5.7, 6.95];
  const CuG = o => Object.assign({ torso: 0.03, cab: 0.0, pel: 0, cdy: 0 }, o);
  const CUER_G = {
    visor: CuG({ torso: 0.14, cab: 0.16, pel: 12 }),
    senas: CuG({ torso: 0.06, cab: -0.03, pel: 8 }),
    pulsa: CuG({ torso: 0.16, cab: 0.14, pel: 12 }),
    yergue: CuG({ torso: -0.04, cab: -0.06, pel: 4 }),
    anticipa: CuG({ torso: 0.12, cab: -0.04, pel: 46 }),
    corre: CuG({ torso: 0.2, cab: -0.12, pel: 30 }),
    tropieza: CuG({ torso: 0.66, cab: -0.42, pel: 70 }),
    equilibrio: CuG({ torso: -0.05, cab: 0.02, pel: 16 }),
    alivio: CuG({ torso: 0.03, cab: 0.08, pel: 6 }),
    horror: CuG({ torso: -0.1, cab: -0.08, pel: -6 }),
    anda: CuG({ torso: 0.1, cab: 0.04, pel: 18 }),
    cuidado: CuG({ torso: 0.08, cab: 0.26, pel: 14 }),
    arregla: CuG({ torso: 0.18, cab: 0.16, pel: 14 }),
    erguido: CuG({ torso: -0.02, cab: -0.05, pel: 4 }),
    zancada: CuG({ torso: -0.04, cab: -0.08, pel: 10 }),
    sprint: CuG({ torso: 0.3, cab: -0.18, pel: 32 }),
    vuela: CuG({ torso: 0.05, cab: -0.22, pel: 20 })
  };
  const GUION_G = [
    [T.agita0, T.agita0 + 0.15, "senas"], [T.agita1, T.agita1 + 0.15, "visor"], [T.boton0 - 0.08, T.boton0 + 0.1, "pulsa"],
    [T.yergue0, T.yergue1, "yergue"], [T.yergue1, T.corre0 + 0.06, "anticipa"], [T.corre0 + 0.06, T.corre0 + 0.2, "corre"],
    [T.tropieza, T.tropieza + 0.18, "tropieza", salida], [T.tropieza + 0.45, T.traspies1, "equilibrio"], [T.alivio, T.alivio + 0.2, "alivio"],
    [T.giraA1 - 0.04, T.susto + 0.08, "horror", salida], [T.vuelve0, T.vuelve0 + 0.12, "anda"], [T.pata0 - 0.08, T.pata0 + 0.1, "cuidado"],
    [T.pata1, T.pata1 + 0.12, "anda"], [T.giraB0, T.endereza0, "arregla"], [T.pal2 + 0.06, T.listo, "erguido"],
    [T.zancada0, T.zancada0 + 0.14, "zancada"], [T.zancada1 - 0.08, T.sprint0 + 0.08, "sprint"], [T.tropiezo, T.tropiezo + 0.2, "vuela"]
  ];
  const GIROS_G = [[T.giraA0, T.giraA1], [T.giraB0, T.giraB1]];

  /* ---------- pies de Guillermo (en el mundo): [t0, t1, x destino, alto, tipo] ---------- */
  // tipo 0: paso; 1: carrera (talón al culo); 2: zancada exagerada (rodilla arriba); 3: pasito arrastrado
  const PIES = {
    cerca: [
      [T.corre0 + 0.02, T.corre0 + 0.2, 176, 30, 1], [T.corre0 + 0.3, T.tropieza, 296, 34, 1],
      // traspiés: el pie enganchado se queda atrás y luego da pasitos para no caer
      [T.tropieza + 0.06, T.tropieza + 0.2, 330, 18, 3], [T.tropieza + 0.34, T.tropieza + 0.46, 386, 22, 3], [T.tropieza + 0.6, T.tropieza + 0.72, 432, 16, 3],
      // vuelta hacia la cámara (mirando a la izquierda): pasitos, y pasa la pata con cuidado
      [T.vuelve0, T.vuelve0 + 0.14, 410, 16, 0], [T.vuelve0 + 0.24, T.vuelve0 + 0.38, 352, 14, 0],
      [T.pata1 - 0.02, T.pata1 + 0.12, 238, 14, 0], [T.vuelve1 - 0.16, T.vuelve1, 136, 16, 0],
      // la zancada exagerada sobre la pata y el esprint
      [T.zancada0, T.zancada0 + 0.12, 196, 12, 0], [T.chulo + 0.02, T.zancada1, 330, 18, 0],
      [T.sprint0 + 0.08, T.sprint0 + 0.25, 440, 34, 1], [T.sprint0 + 0.38, T.tropiezo, 600, 40, 1]
    ],
    lejos: [
      [T.corre0 + 0.16, T.corre0 + 0.34, 236, 34, 1],
      [T.tropieza - 0.02, T.tropieza + 0.12, 352, 26, 3], [T.tropieza + 0.2, T.tropieza + 0.32, 404, 20, 3], [T.tropieza + 0.48, T.tropieza + 0.6, 450, 14, 3],
      [T.traspies1 + 0.02, T.traspies1 + 0.14, 470, 8, 0],
      [T.vuelve0 + 0.1, T.vuelve0 + 0.24, 384, 16, 0], [T.pata0, T.pata1, 262, 78, 2], [T.vuelve1 - 0.3, T.vuelve1 - 0.12, 176, 16, 0], [T.vuelve1 - 0.02, T.vuelve1 + 0.1, 96, 12, 0],
      [T.zancada0 + 0.06, T.chulo + 0.1, 312, 96, 2],
      [T.zancada1 + 0.02, T.sprint0 + 0.16, 380, 30, 1], [T.sprint0 + 0.22, T.sprint0 + 0.42, 520, 40, 1]
    ]
  };
  const X0_PIES = { cerca: XG0 - 26, lejos: XG0 + 26 };
  function perfilPaso(tipo, u) {
    if (tipo === 1) return u < 0.3 ? lerp(0.38, 1.05, suave(u / 0.3)) : u < 0.75 ? lerp(1.05, 0.15, suave((u - 0.3) / 0.45)) : lerp(0.15, -0.12, suave((u - 0.75) / 0.25));
    if (tipo === 2) return u < 0.5 ? lerp(0, -0.5, suave(u / 0.5)) : lerp(-0.5, 0, suave((u - 0.5) / 0.5));
    if (tipo === 3) return 0.18 * Math.sin(Math.PI * u);
    return 0.28 * Math.sin(Math.PI * u) - 0.05 * Math.sin(TAU * u);
  }
  function pieG(lado, t) {
    let x = X0_PIES[lado], h = 0, a = 0;
    for (const [t0, t1, xd, alto, tipo] of PIES[lado]) {
      if (t < t0) break;
      const u = fase(t, t0, t1);
      if (u < 1) {
        const k = tipo === 1 ? suave(clamp((u - 0.1) / 0.9)) : suave(u);
        const hh = tipo === 1 ? alto * Math.sin(Math.PI * Math.pow(u, 0.72)) : tipo === 2 ? alto * Math.sin(Math.PI * Math.pow(u, 0.85)) : alto * Math.sin(Math.PI * u);
        return { x: lerp(x, xd, k), h: hh, a: perfilPaso(tipo, u) };
      }
      x = xd;
    }
    return { x, h, a };
  }
  // pelvis de Guillermo (x en pantalla)
  const XG_CLAVES = [
    [0, XG0], [T.yergue1, XG0 - 4], K_([T.corre0 + 0.18, 158], entrada), K_([T.tropieza, 266], t => t), K_([T.tropieza + 0.3, 352], t => t), K_([T.traspies1, 442], salida),
    [T.traspies1 + 0.14, 452], [T.vuelve0, 452], K_([T.vuelve0 + 0.36, 380], t => t), [T.pata0, 330], [T.pata1, 268], K_([T.vuelve1, XG0 + 6], suave),
    [T.zancada0, XG0 + 26], K_([T.zancada1, 312], suave), K_([T.sprint0 + 0.2, 392], t => t), K_([T.tropiezo, 584], t => t)
  ];
  function xG(t) { return claves(XG_CLAVES, t)[0]; }
  // el vuelo final: giro del cuerpo entero alrededor de la pelvis
  function vueloG(t) {
    if (t <= T.tropiezo) return null;
    const u = t - T.tropiezo;
    const k = salida(clamp(u / 0.3));
    const phi = 1.42 * k + 0.1 * clamp((u - 0.3) / 0.3);
    // el pie se queda enganchado: el cuerpo pivota hacia delante y se queda «colgado» en horizontal
    // a la altura de las rodillas de Kiriku justo en la foto (las piernas, por fuera de las suyas)
    const x = 584 + 22 * salida(clamp(u / 0.32)) + 70 * Math.max(0, u - 0.32);
    const y = 392 + 40 * salida(clamp(u / 0.3)) + 160 * Math.max(0, u - 0.4) * Math.max(0, u - 0.4) * 4;
    return { phi, x, y };
  }
  function ponGiro(p, phi, dx, dy) { p.o = G.aPantalla(p, p.pelvis); p.gr = { phi, dx, dy }; }
  // pierna en el marco del cuerpo: f = 0 abajo, + hacia delante; k = fracción del largo
  function piernaF(p, lado, f, k, punta) {
    const cad = G.tronco(p)(G.CADERA[lado]), L = G.A.datos.piezas["pierna_" + lado].largo * k;
    return { tob: P(cad.x + Math.sin(f) * L, cad.y + Math.cos(f) * L), ang: -f + punta };
  }
  const aPierna = (p, w, lado) => ({ tob: P(G.aHoja(p, P(w.x, 0)).x, TOB_G - (lado === "lejos" ? 12 : 0) - w.h / S), ang: w.a });

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "visor", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const x = xG(t), f = giro(t, GIROS_G), esp = f < 0;
    // botes del cuerpo al correr
    const corre = (t > T.corre0 && t < T.tropieza) || (t > T.sprint0 && t < T.tropiezo);
    const t0r = t < T.tropieza ? T.corre0 : T.sprint0;
    const bote = corre ? -16 * Math.abs(Math.sin(Math.PI * (t - t0r) / 0.17)) : 0;
    const p = {
      x, suelo: SUELO_G, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      espejo: esp, giroX: Math.max(0.06, Math.abs(f)),
      pelvis: P(G.PELVIS.x, G.PELVIS.y + b.pel + respira * 1.2 + bote / S * 0.3), torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // asiente y temblores
    p.cabeza.ang += 0.07 * Math.sin((t - T.asiente) * TAU / 0.24) * campana(t, T.asiente, T.asiente + 0.48);
    const tamb = tramo(t, T.tropieza, T.tropieza + 0.1) * (1 - tramo(t, T.traspies1 - 0.1, T.traspies1 + 0.2));
    p.torso += 0.12 * Math.sin((t - T.tropieza) * 13) * tamb;
    const eq = campana(t, T.traspies1 - 0.05, T.alivio + 0.1);
    p.torso += 0.05 * Math.sin((t - T.traspies1) * 16) * eq;
    // pies
    const wc = pieG("cerca", t), wl = pieG("lejos", t);
    p.piernas.cerca = aPierna(p, wc, "cerca");
    p.piernas.lejos = aPierna(p, wl, "lejos");
    // vuelo final (marco del cuerpo)
    const v = vueloG(t);
    if (v) {
      const k = tramo(t, T.tropiezo, T.tropiezo + 0.18);
      const pc = piernaF(p, "cerca", -0.55, 0.95, 0.25), pl = piernaF(p, "lejos", 0.35, 0.8, 0.5);
      const mz = (a, bb) => ({ tob: mezcla(a.tob, bb.tob, k), ang: lerp(a.ang, bb.ang, k) });
      p.piernas.cerca = mz(p.piernas.cerca, pc); p.piernas.lejos = mz(p.piernas.lejos, pl);
      const o = G.aPantalla(p, p.pelvis);
      ponGiro(p, v.phi, v.x - o.x, v.y - o.y);
    } else ponGiro(p, 0, 0, 0);
    // cara
    p.cara = cara(linea(GUION_CG, CG, "visor", t), parpadeo(t, PARP_G));
    p.sudor = 0.9 * campana(t, T.susto - 0.05, T.vuelve1) + 0.6 * campana(t, T.tropieza + 0.05, T.alivio);
    // manos
    manosG(p, t);
    return p;
  }

  function manosG(p, t) {
    const Tr = G.tronco(p);
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const cp = q => () => camPunto(t, q);
    // mano lejana: el anillo del objetivo, la cámara, el disparador; luego la arregla y le da palmaditas
    // la mano lejana agarra la cámara por detrás (encuadra subiéndola y bajándola) y pulsa el disparador
    const AGARRA = { scr: cp(P(-34, -50)), ref: PALMA, mu: 2.75, dedos: D5(0.45, 0.4, 0.35, 0.3, 0.3), dobla: -1 };
    const DEDO = { scr: cp(P(-27, -69)), ref: YEMA, mu: 2.6, dedos: D5(0.15, 1, 0.05, 0.05, 0.05), dobla: -1 };
    const DEDO_ALTO = { scr: cp(P(-27, -86)), ref: YEMA, mu: 2.6, dedos: D5(0.15, 1, 0.05, 0.05, 0.05), dobla: -1 };
    const LISTA_L = [
      [0, 0, AGARRA],
      [T.boton0, T.boton0 + 0.14, DEDO_ALTO], [T.boton0 + 0.14, T.clic, DEDO, entrada], [T.clic + 0.02, T.clic + 0.1, DEDO_ALTO, salida]
    ];
    // mano cercana: en el bolsillo; señas delante del pecho («córrete un poco»)
    const SENA = { hoja: { x: 440, y: 372 }, mu: Math.PI - 0.1, dedos: D5(0.8, 1, 1, 1, 1), dobla: -1, ang: 0 };
    const LISTA_C = [
      [0, 0, { bols: true }], [T.agita0, T.agita0 + 0.16, SENA], [T.agita1, T.agita1 + 0.16, { bols: true }]
    ];
    let L = pista(LISTA_L, t, resL), C = pista(LISTA_C, t, res);
    // señas: la mano se agita
    const ag = tramo(t, T.agita0 + 0.1, T.agita0 + 0.16) * (1 - tramo(t, T.agita1 - 0.06, T.agita1));
    if (ag > 0) { const s = Math.sin((t - T.agita0) * TAU / 0.26); C.ang += 0.38 * s * ag; ["indice", "medio", "anular", "menique"].forEach((n, i) => { C.dedos[n] = lerp(C.dedos[n], 0.8 + 0.2 * Math.sin((t - T.agita0) * TAU / 0.26 + i * 0.5), ag); }); }

    // brazos a partir de que se yergue: rutinas por tramos (en la hoja, relativas al tronco)
    const kSuelta = tramo(t, T.yergue0, T.corre0 + 0.05);
    if (kSuelta > 0) {
      const brazos = brazosG(p, t, Tr, res, resL);
      L = mezM(L, brazos.L, kSuelta); C = mezM(C, brazos.C, kSuelta);
    }
    p.manoCerca = mano(C); p.manoLejos = mano(L);
  }
  // carrera: brazos contrarios a las piernas (ph: +1 pierna cercana delante)
  function brazosCarrera(Tr, ph) {
    const lD = Tr(P(470 + 130 * ph, 525 - 95 * ph)), cD = Tr(P(150 - 170 * ph, 525 + 95 * ph));
    return { L: M(lD.x, lD.y, 1.1 + 0.9 * ph, todos(0.2), 1), C: M(cD.x, cD.y, 1.5 - 0.9 * ph, todos(0.2), -1) };
  }
  function brazosG(p, t, Tr, res, resL) {
    let out;
    const fijo = (lx, ly, lmu, cx, cy, cmu, dedos, dl = 1, dc = -1) => { const l = Tr(P(lx, ly)), c = Tr(P(cx, cy)); return { L: M(l.x, l.y, lmu, dedos, dl), C: M(c.x, c.y, cmu, dedos, dc) }; };
    const cp = q => camPunto(t, q);
    const segs = [];
    // 1) carrera hacia la derecha
    const ph1 = Math.sin(Math.PI * (t - T.corre0) / 0.17);
    segs.push([T.yergue0, T.yergue1 + 0.06, fijo(430, 560, 1.6, 160, 560, 1.7, todos(0.3))]);
    segs.push([T.corre0, T.corre0 + 0.08, brazosCarrera(Tr, ph1)]);
    // 2) traspiés: aspas de molino
    {
      const w = (t - T.tropieza) * 15;
      const hl = G.HOMBRO, hc = G.HOMBRO_C, r = 210;
      const l = Tr(P(hl.x + Math.cos(-w) * r, hl.y + Math.sin(-w) * r)), c = Tr(P(hc.x + Math.cos(-w + 2.2) * r, hc.y + Math.sin(-w + 2.2) * r));
      const muL = Math.atan2(hl.y - (hl.y + Math.sin(-w) * r), hl.x - (hl.x + Math.cos(-w) * r)), muC = Math.atan2(hc.y - (hc.y + Math.sin(-w + 2.2) * r), hc.x - (hc.x + Math.cos(-w + 2.2) * r));
      segs.push([T.tropieza, T.tropieza + 0.08, { L: M(l.x, l.y, muL, todos(1), 1), C: M(c.x, c.y, muC, todos(1), -1) }]);
    }
    // 3) equilibrio: brazos en cruz, y alivio
    segs.push([T.traspies1 - 0.12, T.traspies1 + 0.08, fijo(640, 420, Math.PI - 0.1, -170, 420, 0.1, todos(1))]);
    segs.push([T.alivio + 0.05, T.alivio + 0.3, fijo(440, 600, 1.55, 150, 600, 1.65, todos(0.35))]);
    // 4) susto: manos abiertas arriba
    segs.push([T.giraA1 - 0.02, T.susto + 0.08, fijo(560, 260, 2.4, -60, 270, 0.75, todos(1))]);
    // 5) vuelta con pasitos: brazos un poco abiertos; cuidado con la pata: brazos en cruz
    segs.push([T.vuelve0, T.vuelve0 + 0.15, fijo(470, 520, 1.6, 120, 520, 1.6, todos(0.3))]);
    segs.push([T.pata0 - 0.08, T.pata0 + 0.12, fijo(620, 440, Math.PI - 0.2, -150, 440, 0.2, todos(1))]);
    segs.push([T.pata1, T.pata1 + 0.12, fijo(460, 540, 1.6, 140, 540, 1.6, todos(0.3))]);
    // 6) arregla la cámara: la lejana agarra la cámara por detrás y baja la culata (el morro sube); la cercana al bolsillo
    const TOMA_L = resL({ scr: cp(P(-34, -50)), ref: PALMA, mu: 2.75, dedos: D5(0.45, 0.4, 0.35, 0.3, 0.3), dobla: -1 });
    const TOMA_C = res({ bols: true });
    segs.push([T.giraB1 - 0.04, T.endereza0, { L: TOMA_L, C: TOMA_C }]);
    // 7) erguido, contento
    segs.push([T.pal2 + 0.1, T.listo, fijo(440, 600, 1.55, 150, 600, 1.65, todos(0.35))]);
    // 8) zancada: brazos en cruz, la mano lejana se pasea por el pelo… no: brazos de equilibrista
    segs.push([T.zancada0, T.zancada0 + 0.15, fijo(600, 400, Math.PI - 0.25, -120, 410, 0.25, D5(0.7, 1, 1, 1, 1))]);
    // 9) esprint
    const ph2 = Math.sin(Math.PI * (t - T.sprint0) / 0.17);
    segs.push([T.zancada1 - 0.05, T.sprint0 + 0.08, brazosCarrera(Tr, ph2)]);
    // 10) vuelo: brazos por delante (hacia la cabeza en el marco del cuerpo), manos abiertas
    segs.push([T.tropiezo, T.tropiezo + 0.14, fijo(600, 380, Math.PI - 0.05, 540, 450, Math.PI - 0.2, D5(0.9, 1, 1, 1, 1))]);
    out = segs[0][2];
    for (const s of segs) { const [t0, t1, d] = s; if (t <= t0) break; const k = salida(fase(t, t0, t1)); out = { L: mezM(out.L, d.L, k), C: mezM(out.C, d.C, k) }; }
    // palmaditas sobre la cámara
    const pal = campana(t, T.pal1 - 0.05, T.pal1 + 0.08) + campana(t, T.pal2 - 0.05, T.pal2 + 0.08);
    if (t > T.endereza0 && t < T.listo) {
      const kk = tramo(t, T.endereza1, T.endereza1 + 0.06) * (1 - tramo(t, T.pal2 + 0.1, T.listo));
      const arriba = resL({ scr: cp(P(-24, -64 - 22 * pal)), ref: PALMA, mu: 2.6, dedos: D5(0.7, 1, 1, 1, 1), dobla: -1 });
      out.L = mezM(out.L, arriba, kk);
    }
    return out;
  }
  // punto de Guillermo (hoja) → pantalla, con su giro
  function enGiro(p, q) {
    const gr = p.gr, o = p.o; if (!gr) return q;
    const c = Math.cos(gr.phi), s = Math.sin(gr.phi), dx = q.x - o.x, dy = q.y - o.y;
    return { x: o.x + gr.dx + dx * c - dy * s, y: o.y + gr.dy + dx * s + dy * c };
  }
  const pantG = (p, q) => enGiro(p, G.aPantalla(p, q));

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, FOTO = null, DETRAS = null;
  const rnd = i => hash(i * 1.618 + 0.37);
  const HORIZ = 346, MURO_Y = 404, CAMINO_Y = 446;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round"; g.lineCap = "round";
    cielo(g); colinas(g); ciudad(g); agua(g); muro(g); farola(g); banco(g); arbol(g); seto(g); camino(g);
    return c;
  }
  function cielo(g) {
    const gr = g.createLinearGradient(0, -70, 0, HORIZ);
    gr.addColorStop(0, "#5d6bb4"); gr.addColorStop(0.32, "#9a86c6"); gr.addColorStop(0.62, "#f09a88"); gr.addColorStop(0.86, "#ffc48c"); gr.addColorStop(1, "#ffe0a6");
    g.fillStyle = gr; g.fillRect(-60, -70, W + 120, HORIZ + 72);
    // sol bajo y su halo
    const sx = 770, sy = 322;
    const halo = g.createRadialGradient(sx, sy, 20, sx, sy, 420); halo.addColorStop(0, "rgba(255,246,210,0.95)"); halo.addColorStop(0.18, "rgba(255,214,150,0.55)"); halo.addColorStop(1, "rgba(255,190,140,0)");
    g.fillStyle = halo; g.fillRect(sx - 430, sy - 430, 860, 520);
    g.fillStyle = "#fff4d2"; g.beginPath(); g.arc(sx, sy, 40, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,240,0.8)"; g.beginPath(); g.arc(sx, sy, 32, 0, TAU); g.fill();
    // nubes alargadas, iluminadas por debajo
    const nubes = [[140, 78, 230, 12], [330, 46, 180, 9], [560, 108, 260, 11], [880, 60, 210, 10], [700, 196, 300, 8], [60, 210, 200, 7], [960, 230, 160, 6]];
    for (const [x, y, w, h] of nubes) {
      for (let k = 0; k < 4; k++) {
        const xx = x + (rnd(x + k) - 0.5) * w * 0.5, ww = w * (0.45 + 0.4 * rnd(y + k)), hh = h * (0.7 + 0.5 * rnd(x * 2 + k));
        g.fillStyle = "rgba(196,150,196,0.55)"; g.beginPath(); g.ellipse(xx, y - hh * 0.35, ww / 2, hh, 0, 0, TAU); g.fill();
        g.fillStyle = "rgba(255,206,170,0.7)"; g.beginPath(); g.ellipse(xx + 6, y + hh * 0.3, ww / 2 * 0.9, hh * 0.55, 0, 0, TAU); g.fill();
      }
    }
  }
  function colinas(g) {
    const capa = (y0, amp, col, sem) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(-60, HORIZ + 4);
      for (let x = -60; x <= W + 60; x += 20) g.lineTo(x, y0 - amp * (0.5 + 0.5 * Math.sin(x * 0.006 + sem) * Math.sin(x * 0.013 + sem * 2)));
      g.lineTo(W + 60, HORIZ + 4); g.closePath(); g.fill();
    };
    capa(312, 44, "#b58cae", 1.3);
    capa(330, 30, "#93779f", 4.1);
  }
  function ciudad(g) {
    const base = HORIZ;
    let x = -50, i = 0;
    while (x < W + 60) {
      const w = 18 + 30 * rnd(i), h = 16 + 70 * Math.pow(rnd(i + 1), 1.6) * (Math.abs(x - 540) < 260 ? 1.3 : 0.8);
      const col = ["#6f5f96", "#665a8d", "#7a6aa0", "#5f5486"][i % 4];
      g.fillStyle = col; g.fillRect(x, base - h, w, h + 2);
      if (rnd(i + 2) < 0.25 && h > 50) { g.fillRect(x + w / 2 - 1.5, base - h - 14, 3, 14); }
      // ventanas: algunas ya encendidas
      for (let yy = base - h + 5; yy < base - 4; yy += 7) for (let xx = x + 3; xx < x + w - 3; xx += 6) {
        const r = rnd(xx * 3.1 + yy * 1.7);
        if (r < 0.16) { g.fillStyle = "rgba(255,214,130,0.9)"; g.fillRect(xx, yy, 2.5, 3); }
        else if (r < 0.4) { g.fillStyle = "rgba(150,130,190,0.6)"; g.fillRect(xx, yy, 2.5, 3); }
      }
      x += w + 1 + 4 * rnd(i + 3); i += 5;
    }
    // bruma dorada sobre la ciudad
    const bru = g.createLinearGradient(0, base - 90, 0, base); bru.addColorStop(0, "rgba(255,200,160,0)"); bru.addColorStop(1, "rgba(255,200,160,0.45)");
    g.fillStyle = bru; g.fillRect(-60, base - 90, W + 120, 92);
  }
  function agua(g) {
    const gr = g.createLinearGradient(0, HORIZ, 0, MURO_Y); gr.addColorStop(0, "#f2b394"); gr.addColorStop(1, "#a88ab8");
    g.fillStyle = gr; g.fillRect(-60, HORIZ, W + 120, MURO_Y - HORIZ + 4);
    // estela del sol (fija; los destellos se animan aparte)
    for (let i = 0; i < 26; i++) { const y = HORIZ + 3 + i * 2.2, w = 18 + i * 3.2 * (0.6 + 0.6 * rnd(i));
      g.fillStyle = `rgba(255,236,190,${0.55 - i * 0.016})`; g.fillRect(770 - w / 2 + (rnd(i + 7) - 0.5) * 18, y, w, 1.4); }
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const y = HORIZ + 6 + rnd(i) * (MURO_Y - HORIZ - 8), x = rnd(i + 50) * W, w = 10 + 30 * rnd(i + 90); g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke(); }
  }
  function muro(g) {
    // murete de piedra con albardilla y barandilla de hierro encima
    const y0 = MURO_Y - 18, y1 = CAMINO_Y;
    g.fillStyle = "#c9a88a"; g.fillRect(-60, y0, W + 120, y1 - y0);
    g.strokeStyle = "rgba(90,60,50,0.35)"; g.lineWidth = 1.2;
    for (let r = 0; r < 3; r++) { const yy = y0 + 10 + r * ((y1 - y0 - 10) / 3); g.beginPath(); g.moveTo(-60, yy); g.lineTo(W + 60, yy); g.stroke();
      for (let x = -60 + (r % 2) * 26; x < W + 60; x += 52) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x, yy + (y1 - y0 - 10) / 3); g.stroke(); } }
    g.fillStyle = "rgba(255,226,180,0.28)"; g.fillRect(-60, y0 + 10, W + 120, 6);
    g.fillStyle = "#e6cfb0"; g.fillRect(-60, y0, W + 120, 10);
    g.fillStyle = "rgba(80,50,40,0.45)"; g.fillRect(-60, y0 + 10, W + 120, 2);
    // barandilla
    const top = y0 - 50;
    g.strokeStyle = "#3b2e3e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-60, top); g.lineTo(W + 60, top); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(-60, top + 34); g.lineTo(W + 60, top + 34); g.stroke();
    g.lineWidth = 1.6; for (let x = -54; x < W + 60; x += 16) { g.beginPath(); g.moveTo(x, top); g.lineTo(x, y0); g.stroke(); }
    g.fillStyle = "#3b2e3e"; for (let x = -40; x < W + 60; x += 128) { g.fillRect(x - 3.5, top - 6, 7, y0 - top + 6); g.beginPath(); g.arc(x, top - 8, 5, 0, TAU); g.fill(); }
    g.strokeStyle = "rgba(255,210,160,0.45)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-60, top - 1.5); g.lineTo(W + 60, top - 1.5); g.stroke();
  }
  function farola(g) {
    const x = 470, base = CAMINO_Y + 8, top = 148;
    g.fillStyle = "#2f2a33"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x - 13, base); g.lineTo(x - 8, base - 26); g.lineTo(x + 8, base - 26); g.lineTo(x + 13, base); g.closePath(); g.fill(); g.stroke();
    g.fillRect(x - 4, top + 30, 8, base - 26 - top - 30); g.strokeRect(x - 4, top + 30, 8, base - 26 - top - 30);
    g.fillStyle = "rgba(255,220,170,0.35)"; g.fillRect(x - 3, top + 34, 2, base - 70 - top);
    // farol
    const halo = g.createRadialGradient(x, top + 6, 4, x, top + 6, 70); halo.addColorStop(0, "rgba(255,226,150,0.65)"); halo.addColorStop(1, "rgba(255,210,140,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(x, top + 6, 70, 0, TAU); g.fill();
    g.fillStyle = "#2f2a33"; g.beginPath(); g.moveTo(x - 16, top - 10); g.lineTo(x, top - 22); g.lineTo(x + 16, top - 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffe6a6"; g.beginPath(); g.moveTo(x - 12, top - 8); g.lineTo(x + 12, top - 8); g.lineTo(x + 9, top + 22); g.lineTo(x - 9, top + 22); g.closePath(); g.fill();
    g.strokeStyle = "#2f2a33"; g.lineWidth = 2; g.stroke(); g.beginPath(); g.moveTo(x, top - 8); g.lineTo(x, top + 22); g.stroke();
    g.fillStyle = "#2f2a33"; g.fillRect(x - 11, top + 22, 22, 6); g.fillRect(x - 5, top + 28, 10, 4);
  }
  function banco(g) {
    const x0 = 846, x1 = 1004, ys = CAMINO_Y + 6;
    g.strokeStyle = TINTA; g.lineWidth = 1.5;
    // respaldo y asiento de listones verdes
    for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? "#4f7a50" : "#5b8a5b"; g.fillRect(x0, ys - 64 + i * 11, x1 - x0, 8); g.strokeRect(x0, ys - 64 + i * 11, x1 - x0, 8); }
    for (let i = 0; i < 2; i++) { g.fillStyle = i % 2 ? "#4f7a50" : "#5b8a5b"; g.fillRect(x0 - 4, ys - 26 + i * 8, x1 - x0 + 8, 7); g.strokeRect(x0 - 4, ys - 26 + i * 8, x1 - x0 + 8, 7); }
    g.fillStyle = "#2c2a30";
    for (const x of [x0 + 10, x1 - 14]) { g.fillRect(x, ys - 70, 5, 72); g.beginPath(); g.moveTo(x - 4, ys + 2); g.quadraticCurveTo(x + 2, ys - 22, x + 14, ys - 24); g.lineTo(x + 14, ys - 18); g.quadraticCurveTo(x + 6, ys - 14, x + 4, ys + 2); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(255,220,160,0.3)"; g.fillRect(x0, ys - 64, x1 - x0, 2);
  }
  function arbol(g) {
    // tronco a la derecha (se sale del cuadro) y copa que enmarca la esquina de arriba
    const x = 1010;
    g.fillStyle = "#4a3a34"; g.beginPath(); g.moveTo(x - 30, CAMINO_Y + 10); g.quadraticCurveTo(x - 22, 260, x - 12, 120); g.lineTo(x + 40, 120); g.lineTo(x + 60, CAMINO_Y + 10); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,200,140,0.35)"; g.beginPath(); g.moveTo(x - 30, CAMINO_Y + 10); g.quadraticCurveTo(x - 22, 260, x - 12, 120); g.lineTo(x - 4, 120); g.quadraticCurveTo(x - 14, 260, x - 20, CAMINO_Y + 10); g.closePath(); g.fill();
    g.strokeStyle = "#4a3a34"; g.lineWidth = 9; g.beginPath(); g.moveTo(x - 4, 150); g.quadraticCurveTo(x - 60, 100, x - 130, 70); g.stroke();
    const cols = ["#3f5a35", "#4e6c3c", "#5f7d44", "#7f8f4a", "#c9a85a"];
    for (let i = 0; i < 70; i++) {
      const an = rnd(i + 800) * TAU, d = Math.sqrt(rnd(i + 810)), cx = 990, cy = 20, rx = 230, ry = 150;
      const px = cx + Math.cos(an) * d * rx, py = cy + Math.sin(an) * d * ry, r = 22 + 22 * rnd(i + 820);
      if (py > 190) continue;
      const lit = clamp((cx - px) / rx * 0.9 + 0.2);
      g.fillStyle = cols[Math.min(4, Math.floor(rnd(i + 830) * 2 + lit * 3))];
      g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    g.fillStyle = "rgba(255,214,140,0.28)";
    for (let i = 0; i < 16; i++) { const px = 780 + rnd(i + 850) * 120, py = -10 + rnd(i + 860) * 170; g.beginPath(); g.arc(px, py, 8 + 9 * rnd(i + 870), 0, TAU); g.fill(); }
  }
  function seto(g) {
    // seto bajo a la izquierda, detrás del trípode
    for (let i = 0; i < 24; i++) { const x = -50 + i * 16 + 6 * rnd(i), y = MURO_Y + 6 + 8 * rnd(i + 3), r = 20 + 10 * rnd(i + 6);
      g.fillStyle = ["#4c6a3a", "#5a7a42", "#6c8a4a"][i % 3]; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(255,210,140,0.25)"; for (let i = 0; i < 10; i++) { const x = -40 + i * 34, y = MURO_Y - 6 + 6 * rnd(i + 9); g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill(); }
    g.fillStyle = "#3c5530"; g.fillRect(-60, MURO_Y + 18, 400, CAMINO_Y - MURO_Y - 18);
  }
  function camino(g) {
    const gr = g.createLinearGradient(0, CAMINO_Y, 0, H + 70); gr.addColorStop(0, "#d8b98f"); gr.addColorStop(1, "#c9a277");
    g.fillStyle = gr; g.fillRect(-60, CAMINO_Y, W + 120, H + 70 - CAMINO_Y);
    // borde de césped junto al murete
    g.fillStyle = "#86a253"; g.fillRect(-60, CAMINO_Y, W + 120, 8);
    g.fillStyle = "#a9bb62"; for (let x = -60; x < W + 60; x += 5) { const h = 4 + 6 * rnd(x); g.fillRect(x, CAMINO_Y + 2 - h, 2, h + 2); }
    // grava
    for (let i = 0; i < 900; i++) {
      const y = CAMINO_Y + 10 + Math.pow(rnd(i), 1.3) * (H + 60 - CAMINO_Y), x = -60 + rnd(i + 900) * (W + 120), s = 0.6 + (y - CAMINO_Y) / 140;
      g.fillStyle = ["#b8946a", "#e7cfa8", "#a98660", "#d2b48a"][i % 4]; g.globalAlpha = 0.75;
      g.beginPath(); g.ellipse(x, y, 1.4 * s, 0.8 * s, 0, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    // luz rasante del sol (franjas cálidas) y sombra al pie del murete
    g.fillStyle = "rgba(255,220,160,0.16)";
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(560 + i * 70, CAMINO_Y + 8); g.lineTo(600 + i * 70, CAMINO_Y + 8); g.lineTo(380 + i * 190, H + 70); g.lineTo(300 + i * 190, H + 70); g.closePath(); g.fill(); }
    const sb = g.createLinearGradient(0, CAMINO_Y, 0, CAMINO_Y + 24); sb.addColorStop(0, "rgba(80,50,40,0.25)"); sb.addColorStop(1, "rgba(80,50,40,0)");
    g.fillStyle = sb; g.fillRect(-60, CAMINO_Y + 6, W + 120, 24);
  }
  // animación barata: pájaros a lo lejos y destellos en el agua
  function pajaros(g, t) {
    g.save(); g.strokeStyle = "rgba(60,40,70,0.7)"; g.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const per = 16 + 4 * hash(i), ph = ((t + i * 4.3) % per) / per, x = -40 + ph * (W + 80), y = 120 + 50 * hash(i + 3) + 10 * Math.sin(ph * 9 + i);
      const a = 4 + 3 * Math.sin(t * 9 + i * 2), s = 0.8 + 0.5 * hash(i + 5);
      g.beginPath(); g.moveTo(x - 7 * s, y - a * s); g.quadraticCurveTo(x - 3 * s, y - 1, x, y + 1); g.quadraticCurveTo(x + 3 * s, y - 1, x + 7 * s, y - a * s); g.stroke();
    }
    g.restore();
  }
  function destellosAgua(g, t) {
    g.save();
    for (let i = 0; i < 9; i++) {
      const per = 1.3 + hash(i), ph = ((t + i * 0.37) % per) / per, a = Math.sin(Math.PI * ph);
      const x = 700 + 140 * hash(i + 11), y = HORIZ + 6 + 40 * hash(i + 13);
      g.fillStyle = `rgba(255,250,225,${0.75 * a})`; g.fillRect(x - 5 * a, y, 10 * a, 1.6);
    }
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrella(g, x, y, r, a, rot, col = "#fff3a8") {
    if (a < 0.01) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 0; i < 10; i++) { const an = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  function destello4(g, x, y, r, a, rot) {
    if (a < 0.01) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.fillStyle = "#ffffff";
    g.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rr = i % 2 ? r * 0.2 : r; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.restore();
  }
  // golpe en la pata del trípode
  function golpePata(g, t) {
    const k = fase(t, T.tropieza - 0.02, T.tropieza + 0.3); if (k <= 0 || k >= 1) return;
    const c = P(292, 540), a = 1 - k;
    estrella(g, c.x, c.y, 10 + 10 * salida(k), a, k * 2);
    g.save(); g.strokeStyle = `rgba(30,20,30,${0.8 * a})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.45, r0 = 14 + 10 * k, r1 = r0 + 10; g.beginPath(); g.moveTo(c.x + Math.cos(an) * r0, c.y + Math.sin(an) * r0); g.lineTo(c.x + Math.cos(an) * r1, c.y + Math.sin(an) * r1); g.stroke(); }
    g.restore();
  }
  // el trípode tiembla: rayitas a los lados de la cámara
  function tiemblaCamara(g, t) {
    const k = campana(t, T.tropieza + 0.02, T.tropieza + 0.6) + campana(t, T.endereza1, T.endereza1 + 0.35) * 0.7; if (k < 0.02) return;
    const c = camPunto(t, P(0, -40));
    g.save(); g.strokeStyle = `rgba(30,20,30,${0.7 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const x = c.x + s * (62 + i * 9); g.beginPath(); g.moveTo(x, c.y - 10 + i * 4); g.quadraticCurveTo(x + s * 4, c.y, x, c.y + 10 - i * 4); g.stroke(); }
    g.restore();
  }
  // pitidos del temporizador: arquitos junto a la lucecita en cada destello
  function pitidos(g, t) {
    if (t < T.clic || t >= T.foto) return;
    const f = faseLed(t), ph = f - Math.floor(f), a = clamp(1 - ph * 2.2) * 0.8;
    if (a < 0.02) return;
    const c = camPunto(t, P(33, -50)), e = estadoTripode(t);
    g.save(); g.translate(c.x, c.y); g.rotate(e.cam); g.strokeStyle = `rgba(255,90,70,${a})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 2; i++) { const r = 10 + i * 6 + ph * 10; g.beginPath(); g.arc(0, 0, r, -0.7, 0.2); g.stroke(); }
    g.restore();
  }
  // polvo de los pies
  function polvo(g, t, x, y, t0, k = 1) {
    const u = fase(t, t0, t0 + 0.45); if (u <= 0 || u >= 1) return;
    g.save(); g.fillStyle = `rgba(232,212,180,${0.75 * (1 - u) * k})`;
    for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, d = 8 + 22 * salida(u) * (0.6 + 0.4 * hash(i + t0)); g.beginPath(); g.arc(x + s * d - 8, y - 4 - 6 * u * hash(i + 2), (4 + 5 * u) * k, 0, TAU); g.fill(); }
    g.restore();
  }
  // líneas de velocidad (detrás de Guillermo)
  function velocidad(g, t, pG) {
    const k = tramo(t, T.sprint0 + 0.05, T.sprint0 + 0.2) * (1 - tramo(t, T.foto + 0.1, T.foto + 0.3)) + 0.7 * campana(t, T.corre0 + 0.05, T.tropieza + 0.05);
    if (k < 0.02) return;
    const o = pG.o || G.aPantalla(pG, pG.pelvis), dx = pG.gr ? pG.gr.dx : 0, dy = pG.gr ? pG.gr.dy : 0;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const y = o.y + dy - 120 + i * 40 + 6 * Math.sin(t * 9 + i), L = 40 + 30 * hash(i + 3), x0 = o.x + dx - 110 - 30 * hash(i + 7) - ((t * 260 + i * 40) % 30);
      g.lineWidth = 2.5 - 0.2 * i; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 - L, y); g.stroke();
    }
    g.restore();
  }
  // brillo de la sonrisa de Kiriku (¡ting!)
  function tingK(g, t, pK) {
    const a = campana(t, T.foto - 0.18, T.foto + 0.25); if (a < 0.01) return;
    const c = KI.aPantalla(pK, KI.cabeza(pK).a(P(948, 532)));
    destello4(g, c.x, c.y, 10 * a, a, 0.4 + t * 1.5);
  }
  // rayitas de susto alrededor de la cabeza de Guillermo cuando sale volando
  function sustoG(g, t, pG) {
    const k = tramo(t, T.tropiezo + 0.04, T.tropiezo + 0.14) + campana(t, T.susto - 0.04, T.vuelve0 + 0.1);
    if (k < 0.02) return;
    const H = G.cabeza(pG), c = pantG(pG, H.a(P(760, 560))), top = pantG(pG, H.a(P(720, 170)));
    const d = { x: top.x - c.x, y: top.y - c.y }, L = Math.hypot(d.x, d.y) || 1, a0 = Math.atan2(d.y, d.x);
    g.save(); g.strokeStyle = `rgba(30,20,35,${0.85 * clamp(k)})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = -2; i <= 2; i++) {
      const a = a0 + i * 0.42, r0 = L + 6 + 2 * Math.sin(t * 30 + i), r1 = r0 + 12 + 3 * (i % 2 ? 0 : 1);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke();
    }
    g.restore();
  }
  // el flash de la cámara (antes de que todo se ponga blanco)
  function flashCamara(g, t) {
    const a = tramo(t, T.foto - 0.1, T.foto) * (1 - tramo(t, T.foto + 0.06, T.foto + 0.32)); if (a < 0.01) return;
    const c = camPunto(t, P(20, -87));
    g.save();
    const gr = g.createRadialGradient(c.x, c.y, 2, c.x, c.y, 160 * a); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.3, `rgba(240,248,255,${0.6 * a})`); gr.addColorStop(1, "rgba(240,248,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, 160 * a, 0, TAU); g.fill();
    destello4(g, c.x, c.y, 60 * a, a, 0.3);
    g.restore();
  }

  /* =====================================================================================
   * LA ESCENA (sin cámara) · también sirve para sacar la foto
   * ===================================================================================== */
  function dibuja(R, g, p, t) {
    g.save();
    if (p.gr && (Math.abs(p.gr.phi) > 1e-5 || Math.abs(p.gr.dx) > 0.01 || Math.abs(p.gr.dy) > 0.01)) { g.translate(p.o.x + p.gr.dx, p.o.y + p.gr.dy); g.rotate(p.gr.phi); g.translate(-p.o.x, -p.o.y); }
    if (p.giroX !== undefined && p.giroX < 0.999) { g.translate(p.x, 0); g.scale(p.giroX, 1); g.translate(-p.x, 0); }
    R.dibujar(g, p, t);
    g.restore();
  }
  function sombra(g, x, y, rx, k) { g.save(); g.fillStyle = `rgba(90,55,40,${0.28 * k})`; g.beginPath(); g.ellipse(x, y, rx, 7, 0, 0, TAU); g.fill(); g.restore(); }
  // tFx: tiempo de los efectos (el flash sigue aunque la imagen se congele)
  function escena(g, t, foto, tFx = t) {
    const pG = poseG(t), pK = poseK(t);
    g.drawImage(fondo, -60, -70);
    pajaros(g, t); destellosAgua(g, t);
    // sombras
    const og = enGiro(pG, G.aPantalla(pG, pG.pelvis)), alto = clamp((SUELO_G - 160 - og.y) / -100);
    const tumb = pG.gr ? Math.abs(Math.sin(pG.gr.phi)) : 0;
    sombra(g, TRI.collar.x + 10, SUELO_G + 8, 90, 0.9);
    sombra(g, pK.x - 10, SUELO_K + 3, 60, 1);
    sombra(g, og.x - 10 * tumb, SUELO_G + 3, 46 + 70 * tumb, 1 - 0.3 * tumb);
    if (!foto) { dibujaTripode(g, t); pitidos(g, t); tiemblaCamara(g, t); }
    dibuja(KI, g, pK, t);
    tingK(g, t, pK);
    velocidad(g, t, pG);
    dibuja(G, g, pG, t);
    sustoG(g, t, pG);
    if (!foto) golpePata(g, t);
    // polvo de los pasos del esprint y de los traspiés
    for (const [t0, x] of [[T.corre0 + 0.2, 176], [T.tropieza + 0.2, 330], [T.tropieza + 0.46, 386], [T.tropieza + 0.72, 432], [T.sprint0 + 0.25, 440], [T.sprint0 + 0.16, 380], [T.tropiezo, 640]]) polvo(g, t, x, SUELO_G, t0, 0.8);
    if (!foto) flashCamara(g, tFx);
  }

  /* ---------- la foto (recorte alrededor de los dos), el fondo de detrás ---------- */
  const RECORTE = { x: 432, y: 138, w: 524, h: 424 }, SF = 1.6;
  function sacaFoto() {
    const c = document.createElement("canvas"); c.width = Math.round(RECORTE.w * SF); c.height = Math.round(RECORTE.h * SF); const g = c.getContext("2d");
    g.scale(SF, SF); g.translate(-RECORTE.x, -RECORTE.y);
    escena(g, T.foto, true);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // revelado: tono cálido, un poco de contraste y viñeta
    g.globalCompositeOperation = "soft-light"; g.fillStyle = "rgba(255,190,120,0.35)"; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "source-over";
    const v = g.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.35, c.width / 2, c.height / 2, c.width * 0.62);
    v.addColorStop(0, "rgba(40,20,30,0)"); v.addColorStop(1, "rgba(40,20,30,0.38)");
    g.fillStyle = v; g.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function creaDetras() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const a = document.createElement("canvas"); a.width = W; a.height = H; const ga = a.getContext("2d");
    escena(ga, T.foto, false);
    g.filter = "blur(5px)"; g.drawImage(a, 0, 0); g.filter = "none";
    g.fillStyle = "rgba(18,10,26,0.62)"; g.fillRect(0, 0, W, H);
    return c;
  }
  function dibujaFoto(g, t) {
    const k = tramo(t, T.revela0, T.revela1, suave);
    const lento = fase(t, T.revela0, DUR);
    const esc = lerp(0.88, 0.98, salida(k)) + 0.04 * lento;
    const rot = lerp(-0.012, -0.04, salida(k)) - 0.01 * lento;
    const fw = 560, fh = fw * RECORTE.h / RECORTE.w, bL = 18, bT = 18, bB = 62;
    g.save();
    g.drawImage(DETRAS, 0, 0);
    g.translate(W / 2 + 6 * lento, H / 2 - 4 + 4 * lento); g.rotate(rot); g.scale(esc, esc);
    const x0 = -fw / 2 - bL, y0 = -(fh + bT + bB) / 2, w = fw + 2 * bL, h = fh + bT + bB;
    // sombra del papel
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.roundRect(x0 + 8, y0 + 12, w, h, 4); g.fill();
    g.fillStyle = "rgba(0,0,0,0.18)"; g.beginPath(); g.roundRect(x0 + 3, y0 + 5, w + 4, h + 4, 6); g.fill();
    // papel y foto
    g.fillStyle = "#fbf8f1"; g.beginPath(); g.roundRect(x0, y0, w, h, 3); g.fill();
    g.drawImage(FOTO, x0 + bL, y0 + bT, fw, fh);
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 1; g.strokeRect(x0 + bL, y0 + bT, fw, fh);
    // brillo del papel
    const br = g.createLinearGradient(x0, y0, x0 + w, y0 + h); br.addColorStop(0.3, "rgba(255,255,255,0)"); br.addColorStop(0.42, "rgba(255,255,255,0.13)"); br.addColorStop(0.5, "rgba(255,255,255,0)");
    g.fillStyle = br; g.fillRect(x0, y0, w, h);
    g.restore();
  }

  /* ---------- cámara de la escena ---------- */
  function camara(t) {
    let sx = 0, sy = 0;
    for (const [t0, f] of [[T.tropieza, 3], [T.tropiezo, 2.2]]) if (t >= t0) { const e = f * Math.exp(-(t - t0) * 9); sx += e * ruido(t * 40 + t0); sy += e * ruido(t * 40 + t0 + 13) * 0.7; }
    return { k: 1, x: 512 + sx, y: 300 + sy };
  }

  const pose = t => ({ g: poseG(t), k: poseK(t) });
  class GuillermoKirikuFotoGrupo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KI.listo()) return;
      if (!fondo) fondo = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin0, DUR - NEGRO_FINAL - 0.02, suave));
      // ¡flash!: la imagen se congela en T.foto y se funde a blanco; del blanco sale la foto impresa
      const blanco = tramo(t, T.blanco0, T.blanco1, suave) * (1 - tramo(t, T.revela0, T.revela1, suave));
      if (t < T.revela0) {
        const tc = Math.min(t, T.foto), cam = camara(tc);
        g.save();
        g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
        escena(g, tc, false, t);
        g.restore();
      } else {
        if (!FOTO) FOTO = sacaFoto();
        if (!DETRAS) DETRAS = creaDetras();
        dibujaFoto(g, t);
      }
      if (blanco > 0.001) { g.fillStyle = `rgba(255,255,255,${blanco})`; g.fillRect(0, 0, W, H); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00090", nombre: "Guillermo y Kiriku · La foto de grupo", crear: () => new GuillermoKirikuFotoGrupo() });
  window.__A2D_00090 = { pose, poseG, poseK, T, DUR, puntaK, camPunto };
})();
