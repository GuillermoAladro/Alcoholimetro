"use strict";
/* 00102 · Guillermo y Paradigma · La moto
 *
 * Negro → la puerta del bar a media tarde: fachada ocre con el sol de lado, el escaparate del bar
 * encendido bajo su toldo de rayas, la puerta verde con su farol, una farola, la acera de losas y, a
 * la izquierda, un seto de boj bien recortado en su jardinera. Paradigma, sentado en una moto clásica
 * (depósito granate, cromados, faro redondo, ruedas de radios; sin marcas), con una mano en el
 * puño del gas y la otra en el bolsillo; Guillermo, de pie detrás, admira la moto →
 * Paradigma saca del bolsillo de dentro de la cazadora unas gafas de sol, las abre de un golpe de
 * muñeca, se las pone, echa la melena hacia atrás con un golpe de cabeza y ¡ting! → acelera en
 * vacío (la moto tiembla, el tubo escupe humo); Guillermo se agacha a mirar el tubo de escape… y el
 * segundo acelerón le da en toda la cara: hollín, tos y humo → Paradigma le indica con la cabeza
 * que suba; Guillermo, tiznado pero encantado, coge carrerilla y se sube de un salto al asiento de
 * atrás → con su peso la moto se encabrita: la rueda de delante sube y se quedan en equilibrio sobre
 * la de atrás, tambaleándose (Guillermo aterrado, agarrado a la cazadora; Paradigma tan tranquilo,
 * hasta mira a cámara) → Paradigma se inclina hacia delante, sin prisa: la rueda de delante cae de
 * golpe (¡pam!, polvo), la moto da un brinco y Guillermo sale catapultado hacia atrás, por el aire,
 * hasta el seto, donde se clava de cabeza: solo le asoman las piernas, pataleando, entre una lluvia
 * de hojas → Paradigma mira hacia atrás bajándose las gafas por la patilla, mira a cámara por encima
 * de ellas con la ceja levantada y se las vuelve a subir (¡ting!) → negro.
 *
 * Sin textos ni marcas. Todo depende del tiempo absoluto. La moto y los dos jinetes son una sola
 * unidad: se dibujan dentro de la transformación de la moto, que gira alrededor del eje de la rueda
 * trasera para el caballito (y de la delantera para el brinco). Guillermo, al salir despedido,
 * conserva esa misma transformación en el instante del lanzamiento y a partir de ahí sigue su propio
 * arco. El fondo, la moto y el seto se dibujan una vez en lienzos aparte. Las gafas de sol se dibujan
 * en unidades del retrato con una afín común (en la mano como objeto, en la cara en capaCabeza).
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, hash, ruido } = M2;
  const G = Guillermo, PA = Paradigma;
  const TAU = Math.PI * 2, TINTA = "#141218";
  const S = 0.3, SY = 548;                                 // escala de los dos y línea del suelo (pantalla)
  const DUR = 14.6;
  const T = {
    // Paradigma: gafas
    bols0: 0.95, bols1: 1.28, saca0: 1.32, saca1: 1.55, abre0: 1.62, abre1: 1.74, alza0: 1.8, pone: 2.2,
    flick0: 2.24, flick1: 2.62, ting: 2.44, vuelve0: 2.5, vuelve1: 2.86,
    // acelerones
    rev1: 3.05, rev2: 3.8, rev3: 4.3,
    // Guillermo curiosea el tubo y se lleva el humo
    agacha0: 3.2, agacha1: 3.6, hollin: 3.86, tos0: 3.95, tos1: 4.7,
    // «sube»
    llama0: 4.55, llama1: 4.95,
    puno0: 4.8, puno1: 5.05,
    corre0: 5.08, corre1: 5.5, salta0: 5.5, salta: 5.62, aterriza: 6.0,
    // caballito
    sube0: 6.04, sube1: 6.9, gMira: 7.55, pMira0: 7.95, pMira1: 8.55,
    inclina0: 8.7, inclina1: 9.05, golpe: 9.42, lanza: 9.5, seto: 10.25,
    // final
    pVuelve0: 10.45, pVuelve1: 10.8, pBaja0: 10.95, pBaja1: 11.35, pCam: 12.2,
    pSube0: 13.05, pSube1: 13.3, tingFin: 13.32,
    fin: 13.85
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
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const amort = (t, t0, f, w) => t < t0 ? 0 : Math.exp(-(t - t0) * f) * Math.sin((t - t0) * w);

  // afines { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  const aplica = (g, A) => g.transform(A.a, A.b, A.c, A.d, A.e, A.f);
  function afCabeza(Rg, p) {
    const H = Rg.cabeza(p), o = Rg.aPantalla(p, H.a({ x: 0, y: 0 })), ex = Rg.aPantalla(p, H.a({ x: 1, y: 0 })), ey = Rg.aPantalla(p, H.a({ x: 0, y: 1 }));
    return AF(ex.x - o.x, ex.y - o.y, ey.x - o.x, ey.y - o.y, o.x, o.y);
  }
  const retrato = (Rg, p, q) => Rg.aPantalla(p, Rg.cabeza(p).a(q));

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en cada fotograma.
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
  const offMano = (m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * G.JK, y: r.y * G.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 }, CENTRO = { x: 0, y: 0 };
  const ptMano = (Rg, p, m, q) => { const o = offMano(m, q); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = rota({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  // objetivo → mano: { hoja } (sigue al torso) · { scr, ref } (pantalla, con el punto ref de la mano) · { bols: "cerca"|"lejos" }
  function resolutor(Rg, p) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) {
        if (Rg === G) { const b = Tr(o.bols === "cerca" ? BOLS_GC : BOLS_GL); return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0, 0, 0, 0), dobla: o.bols === "cerca" ? -1 : 1 }; }
        const r = Rg.manoReposo(p, o.bols); return { x: r.x, y: r.y, mu: r.mu, ang: 0, puno: 0, dedos: D(0, 0, 0, 0), dobla: r.dobla };
      }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(m, o.ref || PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? 1 };
    };
  }
  function alcanza(p, m, hombro, lim) {
    const h = G.tronco(p)(hombro), w = rota({ x: Math.cos(m.mu) * R_M, y: Math.sin(m.mu) * R_M }, m.ang || 0);
    const dx = m.x + w.x - h.x, dy = m.y + w.y - h.y, d = Math.hypot(dx, dy);
    if (d > lim) { const k = lim / d - 1; m.x += dx * k; m.y += dy * k; }
  }
  const manoDe = c => ({ x: c.x, y: c.y, ang: c.ang, mu: c.mu, dobla: c.dobla, puno: c.puno, dedos: c.dedos });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * LA MOTO: geometría (coordenadas de la moto = pantalla con la moto quieta) y su transformación
   * ===================================================================================== */
  const RA = { x: 455, y: 486 }, FA = { x: 785, y: 486 }, RR = 62;         // ejes de las ruedas y radio
  const XP = 610, YP = 368;                                                    // pelvis de Paradigma en el asiento
  const XGM = 468, YGM = 360;                                                  // pelvis de Guillermo en el asiento de atrás
  const PUNO_GAS = { x: 674, y: 322 };                                        // puño del manillar (lejano)
  const ESTRIBO_P = { x: 614, y: 492 }, ESTRIBO_G = { x: 502, y: 480 };
  const ESCAPE = { x: 420, y: 486 }, ASA = { x: 446, y: 352 }, AGARRE_ASA = { x: 451, y: 346 };
  // caballito: ángulo alrededor del eje trasero (negativo = morro arriba)
  function balanceo(t) {
    const k1 = fase(t, T.sube0, T.sube1);
    if (k1 <= 0) return 0;
    // un amago (sube un poco y se para) y luego arriba del todo
    let a = -0.07 * suave(fase(t, T.sube0, T.sube0 + 0.22)) - 0.55 * entrada(fase(t, T.sube0 + 0.3, T.sube1)) * 0.6 - 0.55 * 0.4 * suave(fase(t, T.sube0 + 0.3, T.sube1));
    a = Math.min(a, -0.07 * suave(fase(t, T.sube0, T.sube0 + 0.22)));
    // se pasa un poco y vuelve; luego se tambalea adelante y atrás
    a += -0.07 * amort(t, T.sube1, 3.2, 8.5);
    const tb = Math.max(0, t - T.sube1 - 0.3);
    a += 0.05 * Math.sin(tb * 4.6) * tramo(t, T.sube1 + 0.3, T.sube1 + 0.7) + 0.02 * Math.sin(tb * 9.1 + 1);
    return a;
  }
  function angulo(t) {
    if (t < T.inclina0) return balanceo(t);
    // Paradigma se inclina: el morro baja un poco… y luego cae de golpe
    const a0 = balanceo(Math.min(t, T.inclina1));
    const a1 = lerp(a0, a0 * 0.88, suave(fase(t, T.inclina0, T.inclina1)));
    if (t < T.inclina1) return a1;
    const aI = balanceo(T.inclina1) * 0.88;
    return aI * (1 - entrada(fase(t, T.inclina1, T.golpe)));
  }
  // brinco tras el golpe: la parte de atrás sube (gira sobre el eje delantero)
  const brinco = t => t < T.golpe ? 0 : 0.085 * Math.sin(Math.PI * fase(t, T.golpe, T.golpe + 0.24)) + 0.018 * Math.max(0, Math.sin(Math.PI * fase(t, T.golpe + 0.24, T.golpe + 0.42)));
  const motorEn = t => tramo(t, T.rev1 - 0.05, T.rev1 + 0.05);
  const acelera = t => Math.max(campana(t, T.rev1, T.rev1 + 0.42), campana(t, T.rev2, T.rev2 + 0.5), 0.7 * campana(t, T.rev3, T.rev3 + 0.35));
  function moto(t) {
    const a = angulo(t), b = brinco(t);
    const dx = 24 * salida(fase(t, T.golpe, T.golpe + 0.4));
    let dy = 5 * amort(t, T.aterriza, 8, 30) + 4 * amort(t, T.golpe, 9, 34);
    const vib = motorEn(t) * (0.45 * Math.sin(t * 63) + 0.3 * Math.sin(t * 41 + 1)) * (1 + 1.6 * acelera(t));
    dy += vib;
    return { a, b, dx, dy };
  }
  function matMoto(m) {
    return mul(Tm(m.dx, m.dy), mul(mul(Tm(RA.x, RA.y), mul(Rm(m.a), Tm(-RA.x, -RA.y))), mul(Tm(FA.x, FA.y), mul(Rm(m.b), Tm(-FA.x, -FA.y)))));
  }

  /* ---------- dibujo de la moto (una vez, a doble resolución) ---------- */
  const MX0 = 352, MY0 = 286, MW = 520, MH = 274;
  const COL = { cromo: "#d9dde2", cromoS: "#8e969f", cromoL: "#ffffff", deposito: "#9c1f2a", depositoS: "#5e0f18", depositoL: "#e0596a",
    crema: "#f0e1bf", negro: "#1d1b20", negroL: "#3f3c45", cuero: "#5a3423", cueroS: "#36200f", cueroL: "#8a5a3c", motor: "#b9bec6", motorS: "#6b717a",
    goma: "#1e1d22", gomaL: "#3d3b44" };
  let MOTO = null;
  function trazo(g, w, col) { g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
  function tubo(g, pts, w, col, colL) {
    g.beginPath(); M2.curva(g, pts.map(([x, y]) => ({ x, y })), false, 0.5);
    g.lineCap = "round"; g.lineJoin = "round";
    trazo(g, w + 5, TINTA); trazo(g, w, col);
    if (colL) { g.save(); g.translate(-w * 0.18, -w * 0.22); g.beginPath(); M2.curva(g, pts.map(([x, y]) => ({ x, y })), false, 0.5); trazo(g, w * 0.3, colL); g.restore(); }
  }
  function creaMoto() {
    const c = lienzo(MW * 2, MH * 2), g = c.getContext("2d");
    g.scale(2, 2); g.translate(-MX0, -MY0); g.lineJoin = "round"; g.lineCap = "round";
    // guardabarros trasero (sobre la rueda)
    g.beginPath(); g.arc(RA.x, RA.y, RR + 7, Math.PI * 1.08, Math.PI * 1.62); g.lineWidth = 15; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 10; g.strokeStyle = COL.negroL; g.stroke();
    // basculante y cadena
    tubo(g, [[RA.x, RA.y], [520, 480], [585, 472]], 10, COL.negro, COL.negroL);
    g.beginPath(); g.moveTo(RA.x + 4, RA.y - 14); g.lineTo(585, 462); g.lineTo(588, 478); g.lineTo(RA.x + 6, RA.y + 6); g.closePath();
    g.fillStyle = "#2a2830"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    // amortiguador trasero (muelle cromado)
    g.save(); g.translate(RA.x + 10, RA.y - 10); g.rotate(Math.atan2(392 - (RA.y - 10), 505 - (RA.x + 10)) + Math.PI / 2);
    const LA = Math.hypot(505 - RA.x - 10, 392 - RA.y + 10);
    g.fillStyle = COL.negro; g.fillRect(-5, -LA, 10, LA); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(-5, -LA, 10, LA);
    for (let i = 0; i < 9; i++) { const y = -10 - i * (LA - 22) / 8; g.beginPath(); g.moveTo(-9, y); g.lineTo(9, y - 5); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 2.8; g.strokeStyle = COL.cromo; g.stroke(); }
    g.restore();
    // subchasis
    tubo(g, [[585, 440], [520, 400], [452, 378]], 7, COL.negro);
    // tubo de escape: del cilindro, por debajo, hasta el silenciador (megáfono)
    tubo(g, [[704, 452], [714, 492], [690, 514], [600, 516], [520, 506]], 12, COL.cromo, COL.cromoL);
    g.save(); g.translate(520, 506); g.rotate(Math.atan2(ESCAPE.y - 506, ESCAPE.x - 520));
    const LM = Math.hypot(ESCAPE.x - 520, ESCAPE.y - 506);
    g.beginPath(); g.moveTo(4, -7); g.lineTo(LM, -13); g.quadraticCurveTo(LM + 4, 0, LM, 13); g.lineTo(4, 7); g.closePath();
    const gm = g.createLinearGradient(0, -13, 0, 13); gm.addColorStop(0, "#ffffff"); gm.addColorStop(0.35, COL.cromo); gm.addColorStop(1, COL.cromoS);
    g.fillStyle = gm; g.fill(); g.lineWidth = 3.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(LM, 0, 3.5, 12, 0, 0, TAU); g.fillStyle = "#26232a"; g.fill(); g.lineWidth = 2; g.stroke();
    g.restore();
    // motor: cárter y cilindro con aletas
    g.beginPath(); g.moveTo(598, 470); g.quadraticCurveTo(596, 516, 640, 518); g.lineTo(690, 516); g.quadraticCurveTo(712, 510, 708, 482); g.lineTo(690, 466); g.closePath();
    const gc = g.createLinearGradient(0, 466, 0, 518); gc.addColorStop(0, "#e2e6ea"); gc.addColorStop(1, COL.motorS);
    g.fillStyle = gc; g.fill(); g.lineWidth = 3.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.arc(632, 492, 15, 0, TAU); g.fillStyle = "#cfd4da"; g.fill(); g.lineWidth = 2.5; g.stroke();
    g.beginPath(); g.arc(632, 492, 6, 0, TAU); g.fillStyle = COL.motorS; g.fill(); g.stroke();
    g.save(); g.translate(668, 466); g.rotate(0.22);
    g.fillStyle = "#c3c8cf"; g.beginPath(); g.rect(-26, -58, 52, 58); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    for (let i = 0; i < 7; i++) { const y = -8 - i * 7.6; g.beginPath(); g.moveTo(-32, y); g.lineTo(32, y); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = "#e9ecef"; g.stroke(); }
    g.beginPath(); g.rect(-20, -66, 40, 10); g.fillStyle = COL.motorS; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.restore();
    // carburador y filtro
    g.beginPath(); g.ellipse(618, 448, 12, 9, 0, 0, TAU); g.fillStyle = COL.cromo; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    // chasis: espina bajo el depósito y tubo delantero
    tubo(g, [[712, 372], [660, 404], [590, 418]], 8, COL.negro);
    tubo(g, [[714, 380], [712, 430], [700, 470]], 8, COL.negro);
    // tapa lateral (crema con filete)
    g.beginPath(); g.ellipse(548, 418, 30, 20, -0.12, 0, TAU); g.fillStyle = COL.crema; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(548, 418, 21, 12, -0.12, 0, TAU); g.lineWidth = 2; g.strokeStyle = COL.deposito; g.stroke();
    // asiento corrido (cuero, con colín)
    g.beginPath(); g.moveTo(436, 356); g.quadraticCurveTo(440, 348, 452, 350); g.lineTo(470, 362); g.quadraticCurveTo(540, 366, 612, 368);
    g.quadraticCurveTo(626, 370, 624, 384); g.lineTo(598, 392); g.quadraticCurveTo(520, 394, 452, 388); g.quadraticCurveTo(434, 384, 436, 356); g.closePath();
    const ga = g.createLinearGradient(0, 350, 0, 392); ga.addColorStop(0, COL.cueroL); ga.addColorStop(0.5, COL.cuero); ga.addColorStop(1, COL.cueroS);
    g.fillStyle = ga; g.fill(); g.lineWidth = 3.5; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(20,8,4,0.55)"; g.lineWidth = 1.6;
    for (let x = 480; x < 610; x += 13) { g.beginPath(); g.moveTo(x, 366); g.lineTo(x - 2, 389); g.stroke(); }
    g.setLineDash([3, 3]); g.strokeStyle = "rgba(240,210,170,0.55)"; g.beginPath(); g.moveTo(470, 370); g.quadraticCurveTo(540, 373, 612, 375); g.stroke(); g.setLineDash([]);
    // asa del pasajero (cromo)
    tubo(g, [[ASA.x - 2, 376], [ASA.x - 8, 360], [ASA.x + 4, 350], [ASA.x + 30, 356]], 4.5, COL.cromo);
    // piloto trasero
    g.beginPath(); g.ellipse(437, 368, 4, 8, 0, 0, TAU); g.fillStyle = "#e0352f"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    // depósito granate con franja crema y tapón cromado
    g.beginPath(); g.moveTo(606, 392); g.quadraticCurveTo(606, 360, 640, 352); g.quadraticCurveTo(684, 344, 714, 360);
    g.quadraticCurveTo(724, 368, 718, 384); g.quadraticCurveTo(700, 404, 652, 406); g.quadraticCurveTo(612, 406, 606, 392); g.closePath();
    const gd = g.createLinearGradient(0, 346, 0, 406); gd.addColorStop(0, COL.depositoL); gd.addColorStop(0.35, COL.deposito); gd.addColorStop(1, COL.depositoS);
    g.fillStyle = gd; g.fill(); g.lineWidth = 3.5; g.strokeStyle = TINTA; g.stroke();
    g.save(); g.clip();
    g.beginPath(); g.moveTo(600, 384); g.quadraticCurveTo(660, 372, 722, 362); g.lineTo(722, 372); g.quadraticCurveTo(660, 382, 600, 394); g.closePath();
    g.fillStyle = COL.crema; g.fill(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(660, 357, 30, 4.5, -0.1, 0, TAU); g.fill();
    g.restore();
    g.beginPath(); g.ellipse(690, 350, 8, 3.5, -0.1, 0, TAU); g.fillStyle = COL.cromo; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    // horquilla (dos barras cromadas) y guardabarros delantero
    g.beginPath(); g.arc(FA.x, FA.y, RR + 7, Math.PI * 1.15, Math.PI * 1.72); g.lineWidth = 14; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 9; g.strokeStyle = COL.cromo; g.stroke();
    for (const o of [-5, 6]) tubo(g, [[716 + o, 352], [FA.x + o * 0.4, FA.y]], 7, o < 0 ? COL.cromoS : COL.cromo, o > 0 ? COL.cromoL : null);
    g.beginPath(); g.ellipse(FA.x - 8, FA.y - 26, 7, 16, -0.42, 0, TAU); g.fillStyle = COL.negro; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    // tija y manillar alto hacia atrás (puño de goma)
    tubo(g, [[718, 352], [712, 334], [696, 324], [PUNO_GAS.x + 10, PUNO_GAS.y]], 6, COL.cromo, COL.cromoL);
    g.save(); g.translate(PUNO_GAS.x, PUNO_GAS.y); g.rotate(0.05);
    g.beginPath(); g.rect(-14, -6, 26, 12); g.fillStyle = COL.goma; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.restore();
    // faro redondo
    g.beginPath(); g.ellipse(744, 362, 21, 23, 0, 0, TAU);
    const gf = g.createRadialGradient(738, 354, 2, 744, 362, 23); gf.addColorStop(0, "#ffffff"); gf.addColorStop(0.5, COL.cromo); gf.addColorStop(1, COL.cromoS);
    g.fillStyle = gf; g.fill(); g.lineWidth = 3.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(762, 362, 6, 19, 0, 0, TAU); g.fillStyle = "#fff4cf"; g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(762, 355, 2, 6, 0, 0, TAU); g.fill();
    // estriberas (piloto y pasajero)
    for (const e of [ESTRIBO_P, ESTRIBO_G]) {
      g.beginPath(); g.moveTo(e.x - 18, e.y - 10); g.lineTo(e.x, e.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3; g.strokeStyle = COL.negroL; g.stroke();
      g.beginPath(); g.ellipse(e.x, e.y, 9, 5, 0, 0, TAU); g.fillStyle = COL.goma; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    }
    return c;
  }
  // rueda de radios (en vivo: gira)
  function rueda(g, c, giro, freno) {
    g.save(); g.translate(c.x, c.y);
    g.beginPath(); g.arc(0, 0, RR, 0, TAU); g.fillStyle = COL.goma; g.fill(); g.lineWidth = 3.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.arc(0, 0, RR - 4, Math.PI * 1.1, Math.PI * 1.45); g.lineWidth = 2.5; g.strokeStyle = COL.gomaL; g.stroke();
    g.beginPath(); g.arc(0, 0, RR - 11, 0, TAU); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3.4; g.strokeStyle = COL.cromo; g.stroke();
    g.beginPath(); g.arc(0, 0, RR - 14, 0, TAU); g.fillStyle = "rgba(40,38,46,0.85)"; g.fill();
    g.strokeStyle = "#c9ced5"; g.lineWidth = 1.3;
    for (let i = 0; i < 20; i++) { const a = giro + i * TAU / 20, b = a + (i % 2 ? 0.35 : -0.35);
      g.beginPath(); g.moveTo(Math.cos(b) * 9, Math.sin(b) * 9); g.lineTo(Math.cos(a) * (RR - 13), Math.sin(a) * (RR - 13)); g.stroke(); }
    g.beginPath(); g.arc(0, 0, freno ? 17 : 11, 0, TAU); g.fillStyle = COL.motor; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.arc(0, 0, 5, 0, TAU); g.fillStyle = COL.cromoS; g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-3, -4, 2.5, 1.6, -0.5, 0, TAU); g.fill();
    g.restore();
  }
  const giroDelante = t => { const lev = tramo(t, T.sube0 + 0.2, T.sube1); return 7.5 * Math.max(0, t - T.sube0 - 0.2) * lev + moto(t).dx / RR + (t > T.golpe ? -3 * (1 - Math.exp(-(t - T.golpe) * 3)) : 0); };

  /* =====================================================================================
   * GAFAS DE SOL (unidades del retrato de Paradigma; origen en el centro de los ojos, eje x hacia el
   * ojo lejano). Montura negra de pasta, cristales oscuros.
   * ===================================================================================== */
  const GF = { B: { x: 853, y: 512 }, th: 0.27,
    lc: { x: -78, y: 4, w: 54, h: 34 }, lf: { x: 64, y: 6, w: 34, h: 30 },
    bisagra: { x: -132, y: -16 }, bisagraF: { x: 99, y: -12 }, oreja: { x: -252, y: 36 } };
  function rutaLente(g, L, persp) {
    const { x, y, w, h } = L;
    g.beginPath();
    g.moveTo(x - w, y - h * 0.9); g.lineTo(x + w, y - h);
    g.quadraticCurveTo(x + w * 1.04, y + h * 0.1 * persp, x + w * 0.82, y + h * 0.78);
    g.quadraticCurveTo(x + w * 0.4, y + h * 1.06, x - w * 0.3, y + h * 0.92);
    g.quadraticCurveTo(x - w * 0.95, y + h * 0.72, x - w, y - h * 0.9); g.closePath();
  }
  function lente(g, L, t) {
    rutaLente(g, L, 1);
    const gr = g.createLinearGradient(0, L.y - L.h, 0, L.y + L.h); gr.addColorStop(0, "#3a3f52"); gr.addColorStop(1, "#060609");
    g.fillStyle = gr; g.fill();
    g.save(); g.clip();
    g.fillStyle = "rgba(255,210,150,0.32)"; g.beginPath(); g.ellipse(L.x - L.w * 0.25, L.y - L.h * 0.55, L.w * 0.9, L.h * 0.28, -0.15, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.beginPath(); g.moveTo(L.x + L.w * 0.1, L.y - L.h); g.lineTo(L.x + L.w * 0.32, L.y - L.h); g.lineTo(L.x - L.w * 0.12, L.y + L.h); g.lineTo(L.x - L.w * 0.34, L.y + L.h); g.closePath(); g.fill();
    g.restore();
    rutaLente(g, L, 1); g.lineWidth = 13; g.strokeStyle = TINTA; g.stroke();
    rutaLente(g, L, 1); g.lineWidth = 8; g.strokeStyle = "#232027"; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.38)"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(L.x - L.w * 0.8, L.y - L.h - 2); g.lineTo(L.x + L.w * 0.7, L.y - L.h - 3); g.stroke();
  }
  // abre: 0 plegadas, 1 abiertas · enCara: la patilla lejana se esconde detrás de la cabeza
  function dibGafas(g, abre, enCara, t) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const b = GF.bisagra, bf = GF.bisagraF;
    const patilla = (de, ang, L, alfa) => {
      if (alfa <= 0.01) return;
      const fin = { x: de.x + Math.cos(ang) * L, y: de.y + Math.sin(ang) * L };
      g.save(); g.globalAlpha *= alfa;
      g.beginPath(); g.moveTo(de.x, de.y); g.lineTo(fin.x, fin.y); g.lineWidth = 15; g.strokeStyle = TINTA; g.stroke();
      g.lineWidth = 9; g.strokeStyle = "#232027"; g.stroke();
      g.beginPath(); g.moveTo(de.x + Math.cos(ang) * 6, de.y + Math.sin(ang) * 6 - 2); g.lineTo(de.x + Math.cos(ang) * L * 0.7, de.y + Math.sin(ang) * L * 0.7 - 2);
      g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,0.3)"; g.stroke();
      g.restore();
    };
    const aAbierta = Math.atan2(GF.oreja.y - b.y, GF.oreja.x - b.x), aPlegada = 0.04;
    const ang = lerp(aPlegada, aAbierta, abre), L = Math.hypot(GF.oreja.x - b.x, GF.oreja.y - b.y) * lerp(0.95, 1, abre);
    // patilla lejana (por detrás de los cristales)
    patilla(bf, lerp(Math.PI - 0.02, Math.PI + 0.32, abre), 150, 1 - (enCara ? 1 : 0));
    // patilla cercana: plegada va por detrás; al abrirse pasa por delante
    if (abre < 0.5) patilla(b, ang, L, 1);
    lente(g, GF.lf, t + 0.2);
    lente(g, GF.lc, t);
    // puente
    g.beginPath(); g.moveTo(GF.lc.x + GF.lc.w - 2, GF.lc.y - GF.lc.h * 0.7); g.quadraticCurveTo(-3, -24, GF.lf.x - GF.lf.w + 2, GF.lf.y - GF.lf.h * 0.75);
    g.lineWidth = 14; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 8; g.strokeStyle = "#232027"; g.stroke();
    // remaches
    for (const q of [{ x: GF.lc.x - GF.lc.w + 8, y: GF.lc.y - GF.lc.h * 0.62 }, { x: GF.lf.x + GF.lf.w - 6, y: GF.lf.y - GF.lf.h * 0.66 }]) {
      g.fillStyle = "#c9c4b8"; g.beginPath(); g.arc(q.x, q.y, 3, 0, TAU); g.fill(); }
    if (abre >= 0.5) patilla(b, ang, L, 1);
    g.restore();
  }
  // afín de las gafas en la cara (con un desplazamiento local q: se las baja y se las sube por la nariz)
  const gafasCara = (p, q) => mul(afCabeza(PA, p), mul(mul(Tm(GF.B.x, GF.B.y), Rm(GF.th)), mul(Tm(q.dx || 0, q.dy || 0), Rm(q.rot || 0))));
  // dónde está la bisagra (el agarre) de las gafas puestas
  const agarreCara = (p, q) => apl(gafasCara(p, q), GF.bisagra);
  // bajada por la nariz (final) y de vuelta arriba
  function qGafas(t) {
    const baja = tramo(t, T.pBaja0 + 0.12, T.pBaja1) * (1 - tramo(t, T.pSube0 + 0.04, T.pSube1, salida));
    return { dx: -6 * baja, dy: 54 * baja, rot: 0.06 * baja };
  }

  /* =====================================================================================
   * PARADIGMA (piloto)
   * ===================================================================================== */
  const CP = {
    inicio: E({ mx: 0.7, my: 0.15, c: 0.32, sd: 2, si: 4, sonr: 0.45, ancho: 0.9 }),
    saca: E({ mx: 0.2, my: 0.95, c: 0.45, sd: 0, si: 0, sonr: 0.4, ancho: 0.85 }),
    gafas: E({ mx: 0.5, my: -0.1, c: 0.25, sd: 8, si: 10, sonr: 0.55, ancho: 0.95 }),
    chulo: E({ mx: 0.2, my: 0.0, c: 0.3, sd: 12, gd: 0.08, si: 2, sonr: 0.75, ancho: 1.0 }),
    gas: E({ mx: 0.8, my: 0.1, c: 0.2, sd: 4, si: 6, sonr: 0.6, ancho: 0.95 }),
    llama: E({ mx: -0.9, my: 0.0, c: 0.25, sd: 18, gd: 0.14, si: 14, sonr: 0.65, ancho: 0.95 }),
    calma: E({ mx: 0.85, my: 0.0, c: 0.3, sd: 4, si: 4, sonr: 0.35, ancho: 0.85 }),
    camara: E({ mx: -0.35, my: -0.1, c: 0.25, sd: 10, gd: 0.04, si: 14, sonr: 0.55, ancho: 0.95 }),
    inclina: E({ mx: 0.9, my: 0.3, c: 0.3, sd: 0, si: 2, sonr: 0.3, ancho: 0.85 }),
    atras: E({ mx: -1, my: 0.1, c: 0.05, sd: 20, gd: 0.15, si: 6, gi: -0.04, sonr: 0.1, ancho: 0.75 }),
    sobre: E({ mx: -1, my: -0.3, c: 0.0, iris: 0.95, sd: 30, gd: 0.18, si: 2, gi: -0.06, sonr: 0.05, ancho: 0.7 }),
    miraCam: E({ mx: -0.4, my: -0.35, c: 0.0, iris: 0.95, sd: 30, gd: 0.18, si: 4, gi: -0.05, sonr: 0.2, ancho: 0.78 }),
    final: E({ mx: -0.3, my: -0.1, c: 0.2, sd: 10, si: 12, sonr: 0.8, ancho: 1.0 })
  };
  const GUION_CP = [
    [T.bols0, T.bols0 + 0.2, "saca"], [T.alza0 - 0.1, T.pone - 0.1, "gafas"], [T.flick1 - 0.15, T.flick1 + 0.1, "chulo"],
    [T.rev1 - 0.15, T.rev1, "gas"], [T.llama0, T.llama0 + 0.15, "llama"], [T.llama1, T.llama1 + 0.2, "calma"],
    [T.pMira0, T.pMira0 + 0.2, "camara"], [T.pMira1, T.pMira1 + 0.2, "calma"], [T.inclina0, T.inclina0 + 0.2, "inclina"],
    [T.golpe + 0.2, T.golpe + 0.5, "calma"], [T.pVuelve0, T.pVuelve1, "atras"], [T.pBaja1 - 0.15, T.pBaja1, "sobre"],
    [T.pCam - 0.1, T.pCam + 0.15, "miraCam"], [T.pSube0, T.pSube1, "final"]
  ];
  const PARP_P = [0.6, 2.9, 5.2, 7.2, 9.8, 12.6];
  const P0P = { pel: 0, torso: 0.1, cab: -0.04, cdy: 0 };
  const CuP = o => Object.assign({}, P0P, o);
  const CUER_P = {
    quieto: CuP({}),
    saca: CuP({ torso: 0.12, cab: 0.1 }),
    gafas: CuP({ torso: 0.09, cab: 0.0 }),
    chulo: CuP({ torso: 0.06, cab: -0.08 }),
    gas: CuP({ torso: 0.14, cab: -0.02 }),
    llama: CuP({ torso: 0.04, cab: -0.2 }),
    inclina: CuP({ torso: 0.42, cab: 0.12, pel: -2 }),
    atras: CuP({ torso: 0.02, cab: -0.16 })
  };
  const GUION_P = [
    [T.bols0, T.bols0 + 0.25, "saca"], [T.alza0 - 0.1, T.pone, "gafas"], [T.flick1 - 0.1, T.flick1 + 0.2, "chulo"],
    [T.rev1 - 0.2, T.rev1, "gas"], [T.llama0, T.llama0 + 0.15, "llama"], [T.llama1, T.llama1 + 0.3, "quieto"],
    [T.inclina0, T.inclina1, "inclina"], [T.golpe + 0.15, T.golpe + 0.6, "quieto"], [T.pVuelve0, T.pVuelve1, "atras"]
  ];
  function poseP(t) {
    const b = linea(GUION_P, CUER_P, "quieto", t), m = moto(t);
    const respira = Math.sin(t * 1.8 + 1.1);
    const wh = clamp(-m.a / 0.6);                       // cuánto del caballito compensa con el cuerpo
    const p = {
      x: XP, suelo: SY, s: S, tirasLimpias: true,
      pelvis: { x: PA.PELVIS.x, y: PA.SUELO + (YP - SY) / (S * PA.K) + b.pel + respira * 1.0 },
      torso: b.torso + 0.12 * wh * (1 - tramo(t, T.inclina0, T.inclina1)) + 0.012 * Math.sin(t * 63) * motorEn(t),
      torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.3 * wh, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // golpe de melena al ponerse las gafas
    const fl = fase(t, T.flick0, T.flick1);
    if (fl > 0 && fl < 1) p.cabeza.ang += -0.24 * Math.sin(Math.PI * Math.min(1, fl * 1.6)) * (fl < 0.62 ? 1 : 0) + 0.05 * Math.sin((fl - 0.62) * 22) * Math.exp(-(fl - 0.62) * 8) * (fl >= 0.62 ? 1 : 0);
    // cabeceo al acelerar y al caer de golpe
    p.cabeza.ang += 0.035 * acelera(t) * Math.sin(t * 28);
    p.cabeza.ang += -0.08 * amort(t, T.golpe, 7, 26);
    // piernas: el pie cercano en el suelo con la moto parada; con el caballito, a la estribera
    const enSuelo = { x: 588, y: SY - PA.TOBILLO_ALTO * S };
    const estr = { x: ESTRIBO_P.x - 14, y: ESTRIBO_P.y - 24 };
    const sube = tramo(t, T.sube0 + 0.05, T.sube0 + 0.42);
    const pc = mezcla(enSuelo, estr, sube); pc.y -= 22 * Math.sin(Math.PI * sube);
    p.piernas.cerca = { tob: PA.aHoja(p, pc), ang: lerp(0, -0.25, sube) };
    p.piernas.lejos = { tob: PA.aHoja(p, { x: estr.x + 4, y: estr.y - 2 }), ang: -0.25 };
    // cara
    const e = linea(GUION_CP, CP, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_P));
    // manos
    const res = resolutor(PA, p);
    const AGARRA = D(0.15, 0.12, 0.12, 0.12);
    const giro = -0.32 * acelera(t);
    const PISTA_L = [[0, 0, { scr: PUNO_GAS, ref: CENTRO, mu: -2.25, ang: giro, dedos: AGARRA, dobla: 1 }]];
    const PINZA_G = D5(0.62, 0.58, 0.25, 0.18, 0.15);
    const agarre = () => agarreCara(p, qGafas(t));
    const PISTA_C = [
      [0, 0, { bols: "cerca" }],
      // a la cazadora (bolsillo de dentro) y fuera con las gafas plegadas
      [T.bols0, T.bols1, { hoja: { x: 228, y: 432 }, mu: -1.95, dedos: D(0.3, 0.6, 0.55, 0.5), dobla: -1 }],
      [T.saca0, T.saca1, { hoja: { x: 320, y: 360 }, mu: -2.6, dedos: PINZA_G, dobla: -1 }, salida],
      // golpe de muñeca: se abren
      [T.abre0, T.abre1, { hoja: { x: 346, y: 330 }, mu: -2.8, ang: -0.25, dedos: PINZA_G, dobla: -1 }, salida],
      // a la cara: la bisagra va a su sitio
      [T.alza0, T.alza0 + 0.2, { hoja: { x: -30, y: 215 }, mu: -1.6, dedos: PINZA_G, dobla: -1 }],
      [T.alza0 + 0.2, T.pone, { scr: agarre, mu: -2.15, dedos: PINZA_G, dobla: -1 }],
      [T.vuelve0, T.vuelve1, { bols: "cerca" }],
      // al final: se las baja por la patilla, mira por encima y se las vuelve a subir
      [T.pBaja0 - 0.35, T.pBaja0 - 0.1, { hoja: { x: -30, y: 215 }, mu: -1.6, dedos: D(0.5, 0.6, 0.5, 0.4), dobla: -1 }],
      [T.pBaja0 - 0.1, T.pBaja0 + 0.1, { scr: agarre, mu: -2.15, dedos: PINZA_G, dobla: -1 }],
      [T.pBaja1, T.pBaja1 + 0.01, { scr: agarre, mu: -2.15, dedos: PINZA_G, dobla: -1 }],
      [T.pSube1 + 0.08, T.pSube1 + 0.45, { bols: "cerca" }]
    ];
    const C = pista(PISTA_C, t, res), L = pista(PISTA_L, t, res);
    p.manoCerca = manoDe(C); p.manoLejos = manoDe(L);
    return p;
  }
  // las gafas: dónde están (afín de unidades de gafas a pantalla) y cómo (abiertas, en la cara)
  function estadoGafas(t, p) {
    if (t < T.saca0 + 0.04) return null;
    const enCara = t >= T.pone;
    const abre = tramo(t, T.abre0, T.abre1, salida);
    if (enCara) return { A: gafasCara(p, qGafas(t)), abre: 1, enCara: true };
    // en la mano: la bisagra en la pinza; el giro pasa del de la mano al de la cara al acercarlas
    const m = p.manoCerca, q = ptMano(PA, p, m, PINZA);
    const Acara = gafasCara(p, {}), rCara = Math.atan2(Acara.b, Acara.a), sc = Math.hypot(Acara.a, Acara.b);
    const rMano = m.ang + 0.35 + 0.5 * Math.sin(Math.PI * fase(t, T.abre0, T.abre1));
    const k = suave(fase(t, T.alza0, T.pone));
    const r = lerp(rMano, rCara, k);
    return { A: mul(Tm(q.x, q.y), mul(Rm(r), mul(Sm(sc, sc), Tm(-GF.bisagra.x, -GF.bisagra.y)))), abre, enCara: false };
  }

  /* =====================================================================================
   * GUILLERMO (pasajero… por poco tiempo)
   * ===================================================================================== */
  const XG0 = 330, XG1 = 432;                               // de pie; donde coge impulso
  const CG = {
    admira: E({ mx: 0.9, my: 0.1, sd: 14, gd: 0.08, si: 14, gi: 0.08, sonr: 0.55, abre: 6, ancho: 0.9 }),
    ooh: E({ mx: 0.85, my: -0.05, iris: 1.1, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 20, ancho: 0.55, sonr: 0.1 }),
    sobresalto: E({ mx: 0.7, my: 0.3, iris: 0.8, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 18, ancho: 0.7, sonr: -0.2 }),
    curioso: E({ mx: 0.6, my: 0.9, sd: 10, gd: 0.05, si: 16, gi: 0.1, sonr: 0.4, abre: 4, ancho: 0.8 }),
    humo: E({ mx: 0, my: 0, c: 1, z: 1, sd: -8, gd: -0.2, si: -8, gi: -0.2, abre: 16, ancho: 1.1, sonr: -0.5 }),
    tos: E({ mx: 0.3, my: 0.3, c: 0.8, z: 0.6, sd: 6, gd: 0.1, si: 6, gi: 0.1, abre: 22, ancho: 0.8, sonr: -0.4 }),
    ilusion: E({ mx: 0.85, my: -0.1, iris: 1.12, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 26, ancho: 1.05, sonr: 1 }),
    salta: E({ mx: 0.8, my: 0.2, c: 0.5, h: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 30, ancho: 1.1, sonr: 1 }),
    duda: E({ mx: 0.9, my: -0.6, iris: 0.9, sd: 18, gd: 0.2, si: 18, gi: 0.2, abre: 8, ancho: 0.6, sonr: -0.2 }),
    terror: E({ mx: 0.4, my: 0.85, iris: 0.72, sd: 30, gd: 0.25, si: 30, gi: 0.25, abre: 26, ancho: 0.7, sonr: -0.75 }),
    terrorCam: E({ mx: -0.2, my: 0.1, iris: 0.7, sd: 30, gd: 0.28, si: 30, gi: 0.28, abre: 14, ancho: 0.6, sonr: -0.8 }),
    vuela: E({ mx: 0, my: -0.5, iris: 0.62, sd: 32, gd: 0.25, si: 32, gi: 0.25, abre: 46, ancho: 0.9, sonr: -0.4, lengua: 0.3 })
  };
  const GUION_CG = [
    [0.3, 0.6, "admira"], [T.ting - 0.1, T.ting + 0.05, "ooh"], [T.ting + 0.5, T.ting + 0.7, "admira"],
    [T.rev1, T.rev1 + 0.06, "sobresalto"], [T.agacha0, T.agacha0 + 0.25, "curioso"], [T.hollin - 0.02, T.hollin + 0.04, "humo"],
    [T.tos0 + 0.05, T.tos0 + 0.15, "tos"], [T.llama0 + 0.15, T.llama0 + 0.3, "ilusion"], [T.salta0 - 0.05, T.salta0 + 0.05, "salta"],
    [T.aterriza + 0.05, T.aterriza + 0.2, "duda"], [T.sube0 + 0.35, T.sube0 + 0.5, "terror"], [T.gMira, T.gMira + 0.15, "terrorCam"],
    [T.inclina0 + 0.1, T.inclina0 + 0.25, "terror"], [T.lanza - 0.02, T.lanza + 0.06, "vuela"]
  ];
  const PARP_G = [1.2, 2.75, 4.9, 6.3];
  // hollín en la cara: manchas grises (retrato de Guillermo), sin tapar los ojos
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const OJO_D = G.A.datos.piezas.cabeza.ojos.derecho, OJO_I = G.A.datos.piezas.cabeza.ojos.izquierdo;
  const MANCHAS = [[820, 690, 92, 70, 0.3], [740, 620, 60, 46, -0.4], [905, 640, 46, 52, 0.2], [780, 770, 70, 34, 0.1], [700, 700, 40, 52, 0.5], [870, 560, 50, 30, -0.2]];
  function hollin(g, k) {
    if (k <= 0.003) return;
    g.save(); g.beginPath(); camino(g, PIEL_CAB); g.clip();
    g.beginPath(); g.rect(400, 300, 700, 700); camino(g, OJO_D); camino(g, OJO_I); g.clip("evenodd");
    g.globalCompositeOperation = "multiply";
    for (const [x, y, rx, ry, a] of MANCHAS) {
      const gr = g.createRadialGradient(x, y, 2, x, y, Math.max(rx, ry));
      gr.addColorStop(0, `rgba(70,66,72,${0.85 * k})`); gr.addColorStop(0.6, `rgba(110,104,110,${0.6 * k})`); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    g.restore();
  }
  // tos: la boca suelta bocanadas de humo
  const toses = [T.tos0 + 0.08, T.tos0 + 0.36, T.tos0 + 0.62];
  const tose = t => { let o = 0; for (const tb of toses) o = Math.max(o, campana(t, tb, tb + 0.22)); return o; };

  // pies al andar (pasos [t0, t1, x, alza]) — x en pantalla
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 24] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, M2.suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const PASOS_G = {
    cerca: [[-9, -8, XG0 - 14], [T.corre0, T.corre0 + 0.2, XG0 + 40, 26], [T.corre0 + 0.22, T.corre0 + 0.42, XG1 - 12, 22]],
    lejos: [[-9, -8, XG0 + 18], [T.corre0 + 0.1, T.corre0 + 0.3, XG1 + 22, 30]]
  };
  // posición x de la pelvis de pie
  const xPie = t => lerp(XG0, XG1, suave(fase(t, T.corre0, T.corre1)));

  // la unidad Guillermo: postura local (en el marco de la moto o de su propio vuelo)
  function poseG(t, pP) {
    const respira = Math.sin(t * 2.3 + 0.4);
    const enMoto = t >= T.aterriza;
    const p = { suelo: SY, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    const e = linea(GUION_CG, CG, "admira", t);
    let torso = 0, cab = 0;
    const res = () => resolutor(G, p);
    if (!enMoto) {
      // de pie, se agacha a mirar, tose, corre y salta
      const ag = tramo(t, T.agacha0, T.agacha1) * (1 - tramo(t, T.hollin, T.hollin + 0.18, salida));
      const sobres = campana(t, T.rev1, T.rev1 + 0.3);
      let x = xPie(t), pelY = SY - (G.SUELO - G.PELVIS.y) * S;
      pelY += 5 * ag - 8 * sobres + 1.2 * respira;
      torso = 0.2 * ag - 0.05 * sobres;
      cab = 0.22 * ag;
      x += 10 * ag;
      // el chorro de humo: se echa hacia atrás de golpe
      const golpeH = campana(t, T.hollin, T.hollin + 0.35);
      torso -= 0.22 * golpeH; cab -= 0.25 * golpeH; x -= 14 * golpeH;
      // tos: se dobla a cada golpe de tos
      const ts = tose(t); torso += 0.2 * ts; cab += 0.12 * ts; pelY += 4 * ts;
      // puño en alto de ilusión (rebote)
      pelY -= 10 * campana(t, T.puno0, T.puno1);
      // carrera: inclinado hacia delante; agachado antes del salto; en el aire hacia el asiento
      const corre = campana(t, T.corre0 - 0.05, T.salta0 + 0.1);
      torso += 0.2 * corre; pelY += 6 * Math.abs(Math.sin((t - T.corre0) * Math.PI / 0.21)) * corre;
      const aga = campana(t, T.salta0 - 0.04, T.salta + 0.06);
      pelY += 34 * aga; torso += 0.25 * aga;
      const u = fase(t, T.salta, T.aterriza);
      if (u > 0) {
        const ue = suave(u);
        x = lerp(XG1, XGM, ue); pelY = lerp(SY - (G.SUELO - G.PELVIS.y) * S, YGM, u) - 92 * 4 * u * (1 - u);
        torso = lerp(0.1, -0.05, ue);
      }
      p.x = x; p.pelvis = { x: G.PELVIS.x, y: G.SUELO + (pelY - SY) / S };
      p.torso = torso; p.cabeza.ang = cab + 0.02 * Math.sin(t * 1.7);
      // pies
      const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
      const tobY = SY - G.TOBILLO_ALTO * S;
      p.piernas.cerca = { tob: G.aHoja(p, { x: fc.x - 8 * aga, y: tobY - fc.alza }), ang: -0.25 * Math.sin(Math.PI * fc.u) * (fc.alza > 1 ? 1 : 0) };
      p.piernas.lejos = { tob: G.aHoja(p, { x: fl.x + 8 * aga, y: tobY - fl.alza - 4 }), ang: -0.25 * Math.sin(Math.PI * fl.u) * (fl.alza > 1 ? 1 : 0) };
      if (u > 0) {
        // piernas abiertas en el aire y luego a las estriberas
        const pe = suave(fase(t, T.salta + 0.12, T.aterriza));
        const aire = (dx, dy) => ({ x: x + dx, y: pelY + dy });
        const cA = aire(-20, 150), lA = aire(46, 128);
        const cE = { x: ESTRIBO_G.x - 12, y: ESTRIBO_G.y - 24 }, lE = { x: ESTRIBO_G.x - 6, y: ESTRIBO_G.y - 28 };
        const desde = k => mezcla(p.piernas.cerca.tob, p.piernas.cerca.tob, k);
        p.piernas.cerca = { tob: G.aHoja(p, mezcla(cA, cE, pe)), ang: lerp(-0.4, -0.3, pe) };
        p.piernas.lejos = { tob: G.aHoja(p, mezcla(lA, lE, pe)), ang: lerp(-0.6, -0.3, pe) };
        void desde;
      }
      // cara
      p.cara = cara(e, parpadeo(t, PARP_G));
      p.cara.boca.abre += 18 * tose(t);
      // manos: en los bolsillos; se abanica el humo con la lejana; puño en alto; en el aire, brazos abiertos
      const r = res();
      const PISTA_L = [
        [0, 0, { bols: "lejos" }],
        [T.hollin + 0.05, T.tos0 + 0.12, { hoja: { x: 470, y: 230 }, mu: 2.1, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
        [T.tos1 - 0.1, T.tos1 + 0.1, { bols: "lejos" }],
        [T.puno0 - 0.05, T.puno0 + 0.1, { hoja: { x: 540, y: 300 }, mu: 1.9, dedos: D(0, 0, 0, 0), dobla: 1 }, salida],
        [T.puno1 + 0.02, T.corre0 + 0.15, { hoja: { x: 440, y: 520 }, mu: -1.4, dedos: D(0.2, 0.2, 0.2, 0.2), dobla: 1 }],
        [T.salta0, T.salta + 0.12, { hoja: { x: 560, y: 160 }, mu: -2.6, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
        [T.salta + 0.2, T.aterriza, { scr: () => agarreJinete(pP), ref: CENTRO, mu: -2.4, dedos: D(0.2, 0.2, 0.2, 0.2), dobla: 1 }]
      ];
      const PISTA_C = [
        [0, 0, { bols: "cerca" }],
        [T.corre0 - 0.1, T.corre0 + 0.15, { hoja: { x: 40, y: 560 }, mu: -1.2, dedos: D(0.2, 0.2, 0.2, 0.2), dobla: -1 }],
        [T.salta0, T.salta + 0.12, { hoja: { x: -40, y: 180 }, mu: -0.7, dedos: D(1, 1, 1, 1), dobla: -1 }, salida],
        [T.salta + 0.2, T.aterriza, { scr: AGARRE_ASA, ref: CENTRO, mu: -1.25, dedos: D(0.15, 0.1, 0.1, 0.1), dobla: -1 }]
      ];
      const L = pista(PISTA_L, t, r), C = pista(PISTA_C, t, r);
      // se abanica el humo
      const ab = tramo(t, T.hollin + 0.1, T.tos0 + 0.15) * (1 - tramo(t, T.tos1 - 0.15, T.tos1));
      L.x += 60 * Math.sin(t * 22) * ab; L.ang += 0.3 * Math.sin(t * 22) * ab;
      p.manoLejos = manoDe(L);
      if (t > T.corre0 - 0.12) p.manoCerca = manoDe(C);
      p.hollin = tramo(t, T.hollin, T.hollin + 0.12);
      return p;
    }
    // en la moto: sentado detrás, agarrado; con el caballito se echa hacia atrás aterrado
    const m = moto(t);
    const wh = clamp(-m.a / 0.6);
    const vuelo = fase(t, T.lanza, T.seto);
    p.x = XGM; p.pelvis = { x: G.PELVIS.x, y: G.SUELO + (YGM - SY) / S + respira * 1.0 + 4 * amort(t, T.aterriza, 7, 24) };
    torso = -0.12 + 0.03 * wh + 0.04 * Math.sin(t * 3.1) * wh;
    cab = 0.05 + 0.12 * wh + 0.06 * amort(t, T.aterriza, 6, 20);
    // mira a cámara aterrado; tiembla
    torso += 0.012 * Math.sin(t * 37) * wh;
    p.torso = torso; p.cabeza.ang = cab;
    const pc = { x: ESTRIBO_G.x - 12, y: ESTRIBO_G.y - 24 }, pl = { x: ESTRIBO_G.x - 6, y: ESTRIBO_G.y - 28 };
    p.piernas.cerca = { tob: G.aHoja(p, pc), ang: -0.3 };
    p.piernas.lejos = { tob: G.aHoja(p, pl), ang: -0.3 };
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.9 * tramo(t, T.sube0 + 0.4, T.sube0 + 0.7);
    p.hollin = 1;
    const r = res();
    const L = r({ scr: agarreJinete(pP), ref: CENTRO, mu: -2.4, dedos: D(0.2, 0.2, 0.2, 0.2), dobla: 1 });
    const C = r({ scr: AGARRE_ASA, ref: CENTRO, mu: -1.25, dedos: D(0.15, 0.1, 0.1, 0.1), dobla: -1 });
    L.x += 4 * Math.sin(t * 31) * wh;
    // si Paradigma se aleja más de lo que da el brazo, la mano se suelta un poco (no se despega del brazo)
    alcanza(p, L, G.HOMBRO, G.BRAZO_L * 1.03); alcanza(p, C, G.HOMBRO_C, G.BRAZO_C_L * 1.03);
    p.manoLejos = manoDe(L); p.manoCerca = manoDe(C);
    if (vuelo > 0) {
      // por el aire: brazos y piernas en aspa, pataleando
      const k = tramo(t, T.lanza, T.lanza + 0.15, salida);
      const Tr = G.tronco(p);
      const brazo = (h, dx, dy, w) => { const q = Tr(h); return { x: q.x + dx + 40 * Math.sin(t * 19 + w), y: q.y + dy + 30 * Math.cos(t * 17 + w) }; };
      const bl = brazo(G.HOMBRO, 230, -60, 0), bc = brazo(G.HOMBRO_C, -230, -40, 2);
      p.manoLejos = Object.assign(p.manoLejos, mezcla(p.manoLejos, bl, k), { mu: lerp(p.manoLejos.mu, -2.8, k), puno: 1, dedos: D(1, 1, 1, 1), dobla: 1 });
      p.manoCerca = Object.assign(p.manoCerca, mezcla(p.manoCerca, bc, k), { mu: lerp(p.manoCerca.mu, -0.4, k), puno: 1, dedos: D(1, 1, 1, 1), dobla: -1 });
      const pata = (base, w) => ({ x: base.x + 60 * Math.sin(t * 21 + w), y: base.y - 40 * Math.max(0, Math.cos(t * 21 + w)) });
      const lc = pata({ x: G.PELVIS.x - 120, y: G.PELVIS.y + 470 }, 0), ll = pata({ x: G.PELVIS.x + 170, y: G.PELVIS.y + 450 }, 2.2);
      p.piernas.cerca = { tob: mezcla(p.piernas.cerca.tob, lc, k), ang: lerp(-0.3, 0.2, k) };
      p.piernas.lejos = { tob: mezcla(p.piernas.lejos.tob, ll, k), ang: lerp(-0.3, -0.4, k) };
      p.torso = lerp(p.torso, 0.1, k); p.cabeza.ang = lerp(p.cabeza.ang, 0.2, k);
      p.sudor = 0;
    }
    if (t >= T.seto) {
      // en el seto: solo asoman las piernas, pataleando cada vez menos
      const pat = Math.exp(-(t - T.seto - 0.1) * 0.9) * tramo(t, T.seto, T.seto + 0.1);
      const tw = campana(t, 12.75, 13.05);
      const pierna = (lado, w) => {
        const cad = G.CADERA[lado];
        const kk = Math.max(0, Math.sin(t * 14 + w)) * pat + 0.5 * tw * (lado === "lejos" ? 1 : 0);
        return { tob: { x: cad.x + (lado === "cerca" ? -30 : 40) + 110 * kk, y: cad.y + 500 - 190 * kk }, ang: lerp(0.15, -0.7, kk) };
      };
      p.piernas.cerca = pierna("cerca", 0); p.piernas.lejos = pierna("lejos", 2.4);
    }
    // al llegar al seto, los brazos se meten por delante de la cabeza (dentro del seto)
    const mete = tramo(t, T.seto - 0.32, T.seto - 0.04);
    if (mete > 0) {
      const Tr = G.tronco(p), hl = Tr(G.HOMBRO), hc = Tr(G.HOMBRO_C);
      p.manoLejos = Object.assign(p.manoLejos, mezcla(p.manoLejos, { x: hl.x + 40, y: hl.y - 230 }, mete), { mu: lerp(p.manoLejos.mu, 1.6, mete), dedos: D(0.6, 0.7, 0.7, 0.7) });
      p.manoCerca = Object.assign(p.manoCerca, mezcla(p.manoCerca, { x: hc.x - 30, y: hc.y - 220 }, mete), { mu: lerp(p.manoCerca.mu, 1.5, mete), dedos: D(0.6, 0.7, 0.7, 0.7) });
    }
    return p;
  }
  // dónde se agarra Guillermo: a la espalda de la cazadora de Paradigma (pantalla de la moto)
  const agarreJinete = pP => PA.aPantalla(pP, PA.tronco(pP)({ x: 128, y: 470 }));

  // vuelo de Guillermo: transformación de su marco local (marco de la moto) a la pantalla
  const SETO_IN = { x: 176, y: 404 };
  let MEMO_LANZA = null;
  function marcoG(t) {
    if (t < T.aterriza) return null;                 // de pie: pantalla tal cual
    if (t < T.lanza) return matMoto(moto(t));
    if (!MEMO_LANZA) { const M = matMoto(moto(T.lanza)); MEMO_LANZA = { P0: apl(M, { x: XGM, y: YGM }), phi0: Math.atan2(M.b, M.a) }; }
    const { P0, phi0 } = MEMO_LANZA;
    const u = fase(t, T.lanza, T.seto);
    let P = { x: lerp(P0.x, SETO_IN.x, u), y: lerp(P0.y, SETO_IN.y, u) - 118 * 4 * u * (1 - u) };
    let phi = lerp(phi0, -2.72, suave(Math.min(1, u * 1.15)));
    if (t >= T.seto) {
      // se hunde un poco en el seto y se queda temblando
      const hu = salida(fase(t, T.seto, T.seto + 0.3));
      P = { x: SETO_IN.x - 6 * hu, y: SETO_IN.y + 16 * hu + 3 * amort(t, T.seto, 6, 30) };
      phi = -2.72 + 0.04 * amort(t, T.seto, 4, 18);
    }
    return mul(Tm(P.x, P.y), mul(Rm(phi), Tm(-XGM, -YGM)));
  }

  /* =====================================================================================
   * FONDO Y SETO
   * ===================================================================================== */
  let FONDO = null, SETO = null;
  const SETO_C = { x0: 14, x1: 256, top: 396, macetaY: 486 };
  function creaFondo() {
    const c = lienzo(W + 120, H + 80), g = c.getContext("2d"); g.translate(60, 40);
    g.lineJoin = "round"; g.lineCap = "round";
    // cielo de tarde (una franja arriba)
    const gc = g.createLinearGradient(0, -40, 0, 80); gc.addColorStop(0, "#8fc1e6"); gc.addColorStop(1, "#f6d9ac");
    g.fillStyle = gc; g.fillRect(-60, -40, W + 120, 120);
    g.fillStyle = "rgba(255,255,255,0.75)";
    for (const [x, y, s] of [[160, 20, 1], [700, 8, 1.3], [920, 30, 0.8]]) { g.beginPath(); g.ellipse(x, y, 50 * s, 12 * s, 0, 0, TAU); g.ellipse(x + 30 * s, y - 8 * s, 30 * s, 12 * s, 0, 0, TAU); g.fill(); }
    // fachada ocre
    const gw = g.createLinearGradient(-60, 0, W + 60, 0); gw.addColorStop(0, "#f0bf83"); gw.addColorStop(1, "#d9995e");
    g.fillStyle = gw; g.fillRect(-60, 62, W + 120, 420);
    // cornisa
    g.fillStyle = "#c98a52"; g.fillRect(-60, 56, W + 120, 16); g.fillStyle = "#f6d3a2"; g.fillRect(-60, 56, W + 120, 4);
    g.fillStyle = "rgba(90,40,10,0.25)"; g.fillRect(-60, 72, W + 120, 8);
    // desconchones y textura de enlucido
    for (let i = 0; i < 70; i++) { const x = hash(i * 3.1) * (W + 100) - 50, y = 90 + hash(i * 5.7) * 360, r = 3 + hash(i * 1.3) * 10;
      g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,236,200" : "150,80,30"},${0.08 + hash(i * 2.2) * 0.08})`; g.beginPath(); g.ellipse(x, y, r * 1.8, r, 0, 0, TAU); g.fill(); }
    // ventanas del primer piso con contraventanas
    for (const x of [120, 520, 880]) {
      g.fillStyle = "#3b2a22"; g.fillRect(x - 32, 94, 64, 84);
      g.fillStyle = "#9cc8de"; g.fillRect(x - 26, 100, 52, 72);
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(x - 26, 140); g.lineTo(x - 2, 100); g.lineTo(x + 10, 100); g.lineTo(x - 26, 160); g.fill();
      g.strokeStyle = "#3b2a22"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 100); g.lineTo(x, 172); g.moveTo(x - 26, 136); g.lineTo(x + 26, 136); g.stroke();
      for (const sx of [-1, 1]) { g.fillStyle = "#3f6f57"; g.fillRect(x + sx * 34 - (sx < 0 ? 26 : 0), 92, 26, 88);
        g.strokeStyle = "rgba(20,40,30,0.6)"; g.lineWidth = 1.5; for (let y = 98; y < 178; y += 7) { g.beginPath(); g.moveTo(x + sx * 34 - (sx < 0 ? 24 : -2), y); g.lineTo(x + sx * 34 + (sx < 0 ? -2 : 24), y); g.stroke(); } }
      g.fillStyle = "#c98a52"; g.fillRect(x - 40, 178, 80, 8);
    }
    // escaparate del bar (iluminado por dentro)
    const ex0 = 296, ex1 = 716, ey0 = 222, ey1 = 452;
    g.fillStyle = "#24392f"; g.fillRect(ex0 - 12, ey0 - 12, ex1 - ex0 + 24, ey1 - ey0 + 20);
    const gi = g.createLinearGradient(0, ey0, 0, ey1); gi.addColorStop(0, "#ffcf7a"); gi.addColorStop(0.55, "#d98a3c"); gi.addColorStop(1, "#6a3418");
    g.fillStyle = gi; g.fillRect(ex0, ey0, ex1 - ex0, ey1 - ey0);
    // dentro: lámparas, estantes con botellas y la barra
    for (const lx of [380, 520, 650]) { g.strokeStyle = "rgba(60,30,10,0.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, ey0); g.lineTo(lx, ey0 + 30); g.stroke();
      const gl = g.createRadialGradient(lx, ey0 + 38, 2, lx, ey0 + 38, 60); gl.addColorStop(0, "rgba(255,250,210,0.9)"); gl.addColorStop(1, "rgba(255,220,140,0)");
      g.fillStyle = gl; g.beginPath(); g.arc(lx, ey0 + 38, 60, 0, TAU); g.fill();
      g.fillStyle = "#5a2e14"; g.beginPath(); g.moveTo(lx - 14, ey0 + 40); g.lineTo(lx - 6, ey0 + 28); g.lineTo(lx + 6, ey0 + 28); g.lineTo(lx + 14, ey0 + 40); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(90,45,18,0.75)"; for (const y of [ey0 + 92, ey0 + 136]) g.fillRect(ex0 + 20, y, ex1 - ex0 - 40, 5);
    for (let i = 0; i < 26; i++) { const x = ex0 + 30 + i * 14.5 + hash(i) * 4, y = (i % 2 ? ey0 + 92 : ey0 + 136), h = 22 + hash(i * 3) * 14;
      g.fillStyle = ["rgba(60,90,50,0.8)", "rgba(110,40,30,0.8)", "rgba(150,110,40,0.8)", "rgba(40,50,80,0.75)"][i % 4];
      g.fillRect(x - 3.5, y - h, 7, h); g.fillRect(x - 1.5, y - h - 8, 3, 8); }
    g.fillStyle = "rgba(70,32,12,0.9)"; g.fillRect(ex0, ey1 - 64, ex1 - ex0, 64);
    g.fillStyle = "rgba(255,200,120,0.5)"; g.fillRect(ex0, ey1 - 66, ex1 - ex0, 4);
    // reflejos en el cristal
    g.fillStyle = "rgba(255,255,255,0.18)";
    for (const [a, b] of [[330, 70], [470, 40], [610, 90]]) { g.beginPath(); g.moveTo(a, ey0); g.lineTo(a + b, ey0); g.lineTo(a + b - 110, ey1); g.lineTo(a - 110, ey1); g.closePath(); g.fill(); }
    // parteluces
    g.fillStyle = "#24392f"; for (const x of [436, 576]) g.fillRect(x - 5, ey0, 10, ey1 - ey0);
    g.fillRect(ex0, ey0 + 60, ex1 - ex0, 7);
    // toldo de rayas con festón
    const tx0 = 276, tx1 = 736, ty0 = 186, ty1 = 236;
    g.save(); g.beginPath(); g.moveTo(tx0 + 10, ty0); g.lineTo(tx1 - 10, ty0); g.lineTo(tx1 + 6, ty1); g.lineTo(tx0 - 6, ty1); g.closePath(); g.clip();
    for (let i = 0, x = tx0 - 20; x < tx1 + 20; x += 23, i++) { g.fillStyle = i % 2 ? "#f2e6cb" : "#b23b30"; g.beginPath(); g.moveTo(x, ty0); g.lineTo(x + 23, ty0); g.lineTo(x + 23 + (x - 506) * 0.035, ty1); g.lineTo(x + (x - 506) * 0.035, ty1); g.closePath(); g.fill(); }
    const gt = g.createLinearGradient(0, ty0, 0, ty1); gt.addColorStop(0, "rgba(255,255,255,0.25)"); gt.addColorStop(1, "rgba(60,10,0,0.25)"); g.fillStyle = gt; g.fillRect(tx0 - 20, ty0, tx1 - tx0 + 40, ty1 - ty0);
    g.restore();
    for (let i = 0, x = tx0 - 6; x < tx1 + 6; x += 23, i++) { g.fillStyle = i % 2 ? "#f2e6cb" : "#b23b30"; g.beginPath(); g.moveTo(x, ty1); g.lineTo(x + 23, ty1); g.quadraticCurveTo(x + 11.5, ty1 + 18, x, ty1); g.fill();
      g.strokeStyle = "rgba(60,20,10,0.5)"; g.lineWidth = 1.2; g.stroke(); }
    g.fillStyle = "rgba(80,30,10,0.18)"; g.fillRect(ex0 - 12, ty1 + 2, ex1 - ex0 + 24, 26);
    // puerta verde con cristal y farol
    const px0 = 770, px1 = 880, py0 = 228;
    g.fillStyle = "#c98a52"; g.fillRect(px0 - 12, py0 - 14, px1 - px0 + 24, 470 - py0 + 14);
    g.fillStyle = "#2f5444"; g.fillRect(px0, py0, px1 - px0, 470 - py0);
    g.fillStyle = "#ffcf7a"; g.fillRect(px0 + 14, py0 + 14, px1 - px0 - 28, 92);
    g.strokeStyle = "#2f5444"; g.lineWidth = 5; g.beginPath(); g.moveTo((px0 + px1) / 2, py0 + 14); g.lineTo((px0 + px1) / 2, py0 + 106); g.stroke();
    g.strokeStyle = "rgba(10,30,20,0.6)"; g.lineWidth = 3; g.strokeRect(px0 + 14, py0 + 126, px1 - px0 - 28, 100);
    g.fillStyle = "#e3b54c"; g.beginPath(); g.arc(px1 - 16, py0 + 130, 5, 0, TAU); g.fill();
    g.fillStyle = "#a99a88"; g.fillRect(px0 - 16, 462, px1 - px0 + 32, 12);
    // farol de pared
    const fx = 914, fy = 250;
    const gl2 = g.createRadialGradient(fx, fy + 16, 2, fx, fy + 16, 70); gl2.addColorStop(0, "rgba(255,240,190,0.75)"); gl2.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = gl2; g.beginPath(); g.arc(fx, fy + 16, 70, 0, TAU); g.fill();
    g.strokeStyle = "#20221f"; g.lineWidth = 4; g.beginPath(); g.moveTo(fx - 20, fy - 6); g.lineTo(fx, fy - 6); g.lineTo(fx, fy + 2); g.stroke();
    g.fillStyle = "#20221f"; g.beginPath(); g.moveTo(fx - 12, fy + 2); g.lineTo(fx + 12, fy + 2); g.lineTo(fx + 9, fy + 34); g.lineTo(fx - 9, fy + 34); g.closePath(); g.fill();
    g.fillStyle = "#ffe9a8"; g.fillRect(fx - 7, fy + 7, 14, 23);
    // zócalo
    g.fillStyle = "#b67844"; g.fillRect(-60, 440, W + 120, 34); g.fillStyle = "rgba(255,230,190,0.3)"; g.fillRect(-60, 440, W + 120, 3);
    // acera de losas (con la luz de la tarde)
    const ga = g.createLinearGradient(0, 474, 0, 600); ga.addColorStop(0, "#cbbba3"); ga.addColorStop(1, "#b09f87");
    g.fillStyle = ga; g.fillRect(-60, 474, W + 120, 140);
    g.strokeStyle = "rgba(95,80,60,0.35)"; g.lineWidth = 1.6;
    for (const y of [492, 516, 546]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = -6; i < 20; i++) { const x = i * 78; g.beginPath(); g.moveTo(x + 20, 474); g.lineTo(x - 24, 584); g.stroke(); }
    // bordillo y calzada
    g.fillStyle = "#d8ccb8"; g.fillRect(-60, 580, W + 120, 10); g.fillStyle = "#8d826f"; g.fillRect(-60, 590, W + 120, 4);
    g.fillStyle = "#4e4b48"; g.fillRect(-60, 594, W + 120, 60);
    // luz de tarde: un velo cálido en diagonal desde la izquierda
    const gs = g.createLinearGradient(-60, 0, W + 60, 300); gs.addColorStop(0, "rgba(255,226,170,0.22)"); gs.addColorStop(1, "rgba(120,60,30,0.08)");
    g.fillStyle = gs; g.fillRect(-60, -40, W + 120, H + 80);
    // farola (derecha) con su sombra larga en la acera
    const lx = 968;
    g.fillStyle = "rgba(70,45,25,0.22)"; g.beginPath(); g.moveTo(lx + 2, 560); g.lineTo(lx + 160, 590); g.lineTo(lx + 170, 584); g.lineTo(lx + 10, 556); g.closePath(); g.fill();
    g.fillStyle = "#26302b"; g.fillRect(lx - 5, 120, 10, 440);
    g.fillRect(lx - 14, 520, 28, 40); g.fillRect(lx - 10, 112, 20, 10);
    g.beginPath(); g.moveTo(lx - 22, 112); g.lineTo(lx + 22, 112); g.lineTo(lx + 14, 62); g.lineTo(lx - 14, 62); g.closePath(); g.fill();
    g.fillStyle = "#fff2c2"; g.fillRect(lx - 11, 70, 22, 36);
    g.fillStyle = "#26302b"; g.beginPath(); g.moveTo(lx - 20, 62); g.lineTo(lx, 46); g.lineTo(lx + 20, 62); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(lx - 3, 130, 2.5, 380);
    return c;
  }
  // seto de boj en su jardinera (aparte: tiembla con el golpe)
  function creaSeto() {
    const { x0, x1, top, macetaY } = SETO_C;
    const c = lienzo((x1 - x0 + 60) * 2, (SY - top + 60) * 2), g = c.getContext("2d");
    g.scale(2, 2); g.translate(-x0 + 30, -top + 40); g.lineJoin = "round";
    // la masa del seto: bultos de hojas
    const contorno = [];
    for (let i = 0; i <= 26; i++) { const u = i / 26, x = lerp(x0 - 2, x1 + 2, u); contorno.push({ x, y: top + 6 * Math.sin(u * 23) + 4 * hash(i * 1.7) }); }
    const masa = () => { g.beginPath();
      M2.curva(g, [{ x: x0 - 4, y: top + 30 }, ...contorno, { x: x1 + 4, y: top + 30 }], false, 0.5);
      g.lineTo(x1 - 2, macetaY + 4); g.lineTo(x0 + 2, macetaY + 4); g.closePath(); };
    masa();
    const gh = g.createLinearGradient(0, top, 0, macetaY); gh.addColorStop(0, "#5e9a3b"); gh.addColorStop(1, "#2f5d24");
    g.fillStyle = gh; g.fill();
    // textura de hojitas (dentro del seto)
    g.save(); masa(); g.clip();
    for (let i = 0; i < 520; i++) {
      const x = x0 + hash(i * 2.3) * (x1 - x0), y = top + 8 + hash(i * 4.1) * (macetaY - top - 8), r = 3 + hash(i * 1.9) * 3.5;
      const luz = 1 - (y - top) / (macetaY - top);
      g.fillStyle = hash(i * 7.7) < 0.55 ? `rgba(${Math.round(90 + 60 * luz)},${Math.round(150 + 50 * luz)},${Math.round(60 + 20 * luz)},0.75)` : "rgba(28,60,22,0.55)";
      g.beginPath(); g.ellipse(x, y, r * 1.4, r, hash(i * 3.3) * 3, 0, TAU); g.fill();
    }
    g.restore();
    masa(); g.lineWidth = 3.5; g.strokeStyle = "#1b3014"; g.stroke();
    g.strokeStyle = "rgba(255,250,200,0.35)"; g.lineWidth = 2;
    g.beginPath(); M2.curva(g, contorno.map(q => ({ x: q.x, y: q.y + 4 })), false, 0.5); g.stroke();
    // jardinera de madera (por delante del pie del seto)
    g.fillStyle = "#6e4527"; g.fillRect(x0 + 4, macetaY, x1 - x0 - 8, SY - macetaY);
    for (let x = x0 + 30; x < x1 - 4; x += 26) { g.strokeStyle = "rgba(40,20,8,0.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, macetaY + 4); g.lineTo(x, SY); g.stroke(); }
    g.fillStyle = "rgba(40,20,8,0.35)"; g.fillRect(x0 + 4, SY - 8, x1 - x0 - 8, 8);
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(x0 + 4, macetaY - 4, x1 - x0 - 8, SY - macetaY + 4);
    g.fillStyle = "#8a5a33"; g.fillRect(x0, macetaY - 8, x1 - x0, 10); g.strokeRect(x0, macetaY - 8, x1 - x0, 10);
    g.fillStyle = "rgba(255,220,170,0.35)"; g.fillRect(x0 + 2, macetaY - 7, x1 - x0 - 4, 2.5);
    return c;
  }
  function dibSeto(g, t) {
    const { x0, x1, top } = SETO_C;
    // tiembla con el golpe: se tuerce desde la base
    const sac = 0.035 * amort(t, T.seto, 4.5, 26) + 0.012 * amort(t, T.seto + 0.6, 3, 20) * (t > T.seto + 0.6 ? 1 : 0);
    g.save(); g.translate((x0 + x1) / 2, SY); g.transform(1, 0, sac, 1 - Math.abs(sac) * 0.6, 0, 0); g.translate(-(x0 + x1) / 2, -SY);
    g.drawImage(SETO, x0 - 30, top - 40, x1 - x0 + 60, SY - top + 60);
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS: humo del escape, tos, polvo, hojas, destellos, rayitas
   * ===================================================================================== */
  // bocanadas: [t, tamaño, empuje]
  const BOCANADAS = [[T.rev1 + 0.02, 1, 1], [T.rev1 + 0.16, 0.7, 0.8], [T.rev2 + 0.3, 0.9, 1.2],
    [T.rev3 + 0.02, 0.9, 0.9], [T.sube0 + 0.3, 0.8, 0.8], [T.golpe + 0.02, 1.1, 1.2]];
  function humo(g, t) {
    if (t < T.rev1) return;
    // ralentí: hilillos de humo
    const M = matMoto(moto(t)), boca = apl(M, ESCAPE), dir = { x: M.a * -0.9 + M.c * -0.45, y: M.b * -0.9 + M.d * -0.45 };
    g.save();
    for (let i = 0; i < 6; i++) {
      const per = 1.1, ph = ((t - T.rev1) / per + i / 6) % 1, edad = ph * per;
      const tb = t - edad; if (tb < T.rev1) continue;
      const x = boca.x - 30 * edad - 12 * edad * edad * 20, y = boca.y - 26 * edad - 8 * Math.sin(edad * 6 + i);
      g.globalAlpha = 0.28 * Math.sin(Math.PI * ph) * motorEn(t);
      g.fillStyle = "#b9b4b4"; g.beginPath(); g.arc(x, y, 5 + 16 * ph, 0, TAU); g.fill();
    }
    // bocanadas de los acelerones
    for (const [t0, s, emp] of BOCANADAS) {
      const e = t - t0; if (e < 0 || e > 1.6) continue;
      const k = e / 1.6;
      for (let j = 0; j < 5; j++) {
        const d = (1 - Math.exp(-e * 5)) * 70 * emp * (0.6 + 0.2 * j);
        let x = boca.x + dir.x * d - 20 * e * j, y = boca.y + dir.y * d - 30 * e - 8 * j * e;
        const r = (10 + 26 * Math.sqrt(k) + 5 * j) * s;
        g.globalAlpha = 0.55 * (1 - k) * (1 - 0.12 * j);
        g.fillStyle = j % 2 ? "#a7a2a3" : "#c9c4c3";
        g.beginPath(); g.arc(x + 6 * Math.sin(e * 5 + j), y, r, 0, TAU); g.fill();
      }
    }
    g.restore();
  }
  // el acelerón gordo: una nube negra sale del tubo y envuelve a Guillermo entero
  let NUBE_C = null;
  const LOBULOS = Array.from({ length: 13 }, (_, i) => ({ a: i * 2.4 + 0.3, d: 0.25 + 0.5 * hash(i * 3.7), r: 0.42 + 0.22 * hash(i * 5.3), dv: 0.6 + 0.8 * hash(i * 1.9) }));
  let NUBE_L = null;
  function nubeNegra(g, t) {
    const e = t - T.rev2; if (e < 0 || e > 1.5) return;
    if (!NUBE_C) { const pg = poseG(T.rev2 + 0.08, poseP(T.rev2 + 0.08)), c = G.aPantalla(pg, G.cabeza(pg).a({ x: 760, y: 640 })); NUBE_C = { x: c.x - 4, y: c.y + 28 }; }
    const M = matMoto(moto(T.rev2)), boca = apl(M, ESCAPE);
    const sale = salida(fase(t, T.rev2, T.rev2 + 0.16)), des = fase(t, T.rev2 + 0.42, T.rev2 + 1.5);
    const c = mezcla(boca, NUBE_C, sale), R = lerp(14, 104, sale);
    // la nube entera en un lienzo aparte (lóbulos opacos) y luego con su transparencia: sin costuras
    const TAM = 420;
    if (!NUBE_L) NUBE_L = lienzo(TAM, TAM);
    const o = NUBE_L.getContext("2d");
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, TAM, TAM);
    o.translate(TAM / 2 - c.x, TAM / 2 - c.y);
    for (const capa of [0, 1]) for (const L of LOBULOS) {
      const dd = L.d + des * 0.7 * L.dv, x = c.x + Math.cos(L.a) * R * dd - 20 * des, y = c.y + Math.sin(L.a) * R * dd * 0.85 - 40 * des * L.dv;
      const r = R * L.r * (1 + 0.35 * des);
      if (capa === 0) { o.fillStyle = "#2b282b"; o.beginPath(); o.arc(x, y, r, 0, TAU); o.fill(); }
      else { o.fillStyle = "rgba(120,114,118,0.55)"; o.beginPath(); o.arc(x - r * 0.28, y - r * 0.32, r * 0.5, 0, TAU); o.fill(); }
    }
    g.save();
    g.globalAlpha = (1 - des) * (1 - des * 0.5);
    g.drawImage(NUBE_L, c.x - TAM / 2, c.y - TAM / 2);
    // la estela desde el tubo
    if (sale < 1 || des < 0.3) { g.globalAlpha = 0.6 * (1 - des) * (1 - 0.5 * sale); g.strokeStyle = "#3a363a"; g.lineCap = "round"; g.lineWidth = 20 * (1 - des);
      g.beginPath(); g.moveTo(boca.x, boca.y); g.quadraticCurveTo(lerp(boca.x, c.x, 0.4) + 20, lerp(boca.y, c.y, 0.4) + 30, c.x, c.y); g.stroke(); }
    // motas de hollín
    g.fillStyle = "#1e1b1e";
    for (let i = 0; i < 14; i++) { const a = i * 1.7, v = 60 + 90 * hash(i * 2.2), k = Math.min(1, e * 2);
      g.globalAlpha = (1 - fase(t, T.rev2 + 0.2, T.rev2 + 1.1)) * 0.8; g.beginPath(); g.arc(c.x + Math.cos(a) * (R * 0.6 + v * k), c.y + Math.sin(a) * (R * 0.5 + v * k) + 40 * e * e, 2.5 + 2 * hash(i), 0, TAU); g.fill(); }
    g.restore();
  }
  function tosHumo(g, t, pG) {
    for (const tb of toses) {
      const e = t - tb; if (e < 0 || e > 0.9) continue;
      const b = G.aPantalla(pG, G.boca(pG));
      g.save();
      for (let j = 0; j < 3; j++) {
        g.globalAlpha = 0.45 * (1 - e / 0.9) * (1 - 0.2 * j);
        g.fillStyle = "#8f8a8c"; g.beginPath(); g.arc(b.x + 14 + 40 * e + 9 * j, b.y + 4 - 20 * e - 6 * j, 4 + 14 * e + 3 * j, 0, TAU); g.fill();
      }
      g.restore();
    }
  }
  function polvo(g, t, x, y, t0, s = 1) {
    const e = t - t0; if (e < 0 || e > 1.2) return;
    const k = e / 1.2;
    g.save();
    for (let i = 0; i < 9; i++) {
      const sg = i % 2 ? 1 : -1, d = (20 + 60 * hash(i * 2.1)) * (1 - Math.exp(-e * 5)) * s;
      g.globalAlpha = 0.5 * (1 - k);
      g.fillStyle = "#d8cbb4"; g.beginPath(); g.arc(x + sg * d, y - 6 - 18 * e * hash(i) - 4 * i % 3, (6 + 14 * k) * s * (0.7 + 0.5 * hash(i * 5)), 0, TAU); g.fill();
    }
    g.restore();
  }
  // hojas del seto: salen disparadas y caen meciéndose
  const HOJAS = Array.from({ length: 24 }, (_, i) => ({
    vx: (hash(i * 3.3) - 0.45) * 330, vy: -120 - 260 * hash(i * 5.1), gir: (hash(i * 7.7) - 0.5) * 14, fase: hash(i * 2.9) * TAU,
    yFin: SY - 2 - 22 * hash(i * 1.7), col: hash(i * 9.1) < 0.5 ? "#5a9a38" : "#3f7a2b", s: 0.8 + 0.5 * hash(i * 4.4), t0: T.seto + 0.04 * hash(i * 6.6)
  }));
  function hojas(g, t) {
    if (t < T.seto) return;
    for (const h of HOJAS) {
      const e = t - h.t0; if (e < 0) continue;
      // tiro con rozamiento y luego caída lenta meciéndose
      const vx = h.vx * Math.exp(-e * 2.2), x = SETO_IN.x + 30 + h.vx * (1 - Math.exp(-e * 2.2)) / 2.2 + 18 * Math.sin(e * 3 + h.fase) * Math.min(1, e);
      let y = SETO_C.top + 6 + h.vy * (1 - Math.exp(-e * 2.8)) / 2.8 + 55 * Math.max(0, e - 0.25);
      const quieta = y >= h.yFin; if (quieta) y = h.yFin;
      const a = quieta ? h.fase : h.fase + h.gir * e * 0.3 + 0.6 * Math.sin(e * 3 + h.fase);
      g.save(); g.translate(x, y); g.rotate(a); g.scale(h.s, h.s * (quieta ? 0.45 : 1));
      g.beginPath(); g.moveTo(-7, 0); g.quadraticCurveTo(0, -5, 7, 0); g.quadraticCurveTo(0, 5, -7, 0); g.closePath();
      g.fillStyle = h.col; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#1b3014"; g.stroke();
      g.restore();
      void vx;
    }
  }
  function destello(g, x, y, k, r = 22) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(k * 0.8); g.globalAlpha = Math.min(1, k * 1.4);
    g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(255,240,180,0.9)"; g.lineWidth = 2;
    const rr = r * (0.6 + 0.4 * k);
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = i % 2 ? rr * 0.28 : rr; g.lineTo(Math.cos(a) * l, Math.sin(a) * l); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function rayitas(g, x, y, k, ang, n = 3, col = TINTA, L = 16) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = k; g.strokeStyle = col; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * 0.45; g.beginPath(); g.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); g.lineTo(Math.cos(a) * (10 + L), Math.sin(a) * (10 + L)); g.stroke(); }
    g.restore();
  }
  // temblor del motor: rayitas junto al cilindro
  function vibra(g, t, M) {
    const k = acelera(t) * motorEn(t); if (k <= 0.02) return;
    const c = apl(M, { x: 664, y: 420 });
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.lineCap = "round"; g.globalAlpha = k;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 54 + i * 10 + 3 * Math.sin(t * 40);
      g.beginPath(); g.arc(c.x, c.y, r, s > 0 ? -0.5 : Math.PI - 0.3, s > 0 ? 0.3 : Math.PI + 0.5); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * CÁMARA
   * ===================================================================================== */
  const PLANOS = [
    [0, 1.0, 512, 300], [0.9, 1.0, 512, 300], [1.6, 1.07, 560, 280], [2.9, 1.07, 560, 280], [3.6, 1.0, 512, 300],
    [6.6, 1.0, 512, 300], [7.2, 1.06, 480, 286], [8.6, 1.06, 480, 286], [9.3, 1.0, 512, 300], [11.6, 1.0, 512, 300],
    [12.3, 1.04, 520, 296], [DUR, 1.05, 522, 296]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }
  const temblorCam = t => 6 * Math.exp(-Math.max(0, t - T.golpe) * 7) * (t >= T.golpe ? 1 : 0) + 4 * Math.exp(-Math.max(0, t - T.seto) * 8) * (t >= T.seto ? 1 : 0);

  /* =====================================================================================
   * PINTAR
   * ===================================================================================== */
  function pose(t) { const pP = poseP(t); return { p: pP, g: poseG(t, pP) }; }
  class GuillermoParadigmaMoto extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !PA.listo()) return;
      if (!FONDO) { FONDO = creaFondo(); MOTO = creaMoto(); SETO = creaSeto(); }
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), tb = temblorCam(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(FONDO, -60, -40);
      const m = moto(t), M = matMoto(m);
      const pP = poseP(t), pG = poseG(t, pP);
      // sombra de la moto (en el suelo, sin girar)
      const ft = apl(M, { x: FA.x, y: FA.y + RR }), rt = apl(M, { x: RA.x, y: RA.y + RR });
      g.save(); g.fillStyle = "rgba(60,35,20,0.3)"; g.beginPath();
      g.ellipse((rt.x + Math.min(ft.x, FA.x + m.dx)) / 2 + 18, SY + 3, Math.abs(ft.x - rt.x) / 2 + 70, 9, 0, 0, TAU); g.fill(); g.restore();
      // sombra de Guillermo de pie
      if (t < T.salta + 0.2) { g.save(); g.fillStyle = "rgba(60,35,20,0.25)"; g.beginPath(); g.ellipse(pG.x + 14, SY + 2, 52, 7, 0, 0, TAU); g.fill(); g.restore(); }
      // la moto con los dos encima
      g.save(); aplica(g, M);
      rueda(g, RA, m.dx / RR, false);
      rueda(g, FA, giroDelante(t), true);
      g.drawImage(MOTO, MX0, MY0, MW, MH);
      const gaf = estadoGafas(t, pP);
      if (gaf && !gaf.enCara) pP.manoCerca.objeto = gg => {
        // en la mano: de la afín de pantalla a las unidades de la mano
        const mm = pP.manoCerca, sc = PA.JK * S * PA.K;
        const Mh = mul(Tm(PA.aPantalla(pP, mm).x, PA.aPantalla(pP, mm).y), mul(Rm(mm.ang || 0), Sm(sc, sc)));
        const inv = invierte(Mh), A = mul(inv, gaf.A);
        gg.save(); aplica(gg, A); dibGafas(gg, gaf.abre, false, t); gg.restore();
      };
      if (gaf && gaf.enCara) pP.capaCabeza = gg => {
        const q = qGafas(t);
        gg.save(); gg.translate(GF.B.x, GF.B.y); gg.rotate(GF.th); gg.translate(q.dx, q.dy); gg.rotate(q.rot); dibGafas(gg, 1, true, t); gg.restore();
      };
      PA.dibujar(g, pP, t);
      g.restore();
      // Guillermo: de pie (pantalla), en la moto (marco de la moto) o volando (su marco)
      const MG = marcoG(t);
      pG.capaCabeza = gg => hollin(gg, pG.hollin || 0);
      g.save();
      if (t >= T.seto - 0.1) {
        // dentro del seto: por debajo de su copa solo se ve lo que cae dentro de la jardinera (el seto lo tapa)
        g.beginPath(); g.rect(-100, -100, W + 200, SETO_C.top + 24 + 100); g.rect(SETO_C.x0 + 6, SETO_C.top, SETO_C.x1 - SETO_C.x0 - 12, SY - 8 - SETO_C.top); g.clip();
      }
      if (MG) aplica(g, MG);
      G.dibujar(g, pG, t);
      g.restore();
      // el seto (delante de Guillermo cuando se clava)
      dibSeto(g, t);
      // efectos
      vibra(g, t, M);
      humo(g, t);
      nubeNegra(g, t);
      if (t < T.aterriza) tosHumo(g, t, pG);
      polvo(g, t, apl(M, { x: FA.x, y: FA.y + RR }).x, SY, T.golpe, 1.1);
      polvo(g, t, XG1 + 10, SY, T.salta, 0.6);
      hojas(g, t);
      // ¡ting! en las gafas
      if (gaf) {
        const lc = apl(gaf.A, { x: GF.lc.x + GF.lc.w * 0.5, y: GF.lc.y - GF.lc.h * 0.6 });
        const k1 = campana(t, T.ting, T.ting + 0.35), k2 = campana(t, T.tingFin, T.tingFin + 0.35);
        if (k1 + k2 > 0) { g.save(); aplica(g, M); destello(g, lc.x, lc.y, Math.max(k1, k2), 24); g.restore(); }
      }
      // rayitas: sobresalto, golpe y aterrizaje en el seto
      rayitas(g, SETO_IN.x + 40, SETO_C.top - 10, campana(t, T.seto, T.seto + 0.35), -1.2, 5, TINTA, 22);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  function invierte(A) { const det = A.a * A.d - A.b * A.c; return AF(A.d / det, -A.b / det, -A.c / det, A.a / det, (A.c * A.f - A.d * A.e) / det, (A.b * A.e - A.a * A.f) / det); }
  registrar({ id: "00102", nombre: "Guillermo y Paradigma · La moto", crear: () => new GuillermoParadigmaMoto() });
  // diagnóstico: distancia hombro → objetivo de cada mano (y el máximo que da el brazo)
  function diag(t) {
    const { p: pP, g: pG } = pose(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) return null; const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return Math.round(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y)); };
    o.pC = dist(PA, pP, "cerca"); o.pL = dist(PA, pP, "lejos"); o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos");
    o.max = { pC: Math.round(PA.BRAZO_C_L * 1.08), pL: Math.round(PA.BRAZO_L * 1.08), gC: Math.round(G.BRAZO_C_L * 1.08), gL: Math.round(G.BRAZO_L * 1.08) };
    return o;
  }
  window.__A2D_00102 = { pose, poseP, poseG, T, DUR, diag, moto };
})();
