"use strict";
/* 00130 · Guillermo y Sara · La azotea
 *
 * Negro → de noche, en el pretil de una azotea, con la ciudad encendida, un puente lejano lleno de
 * luces, estrellas y la luna. Sara y Guillermo, sentados con las piernas colgando y mirando a la
 * ciudad, comparten unos auriculares de cable: el móvil, tumbado en el pretil entre los dos, y el
 * cable en Y que sube a la oreja de cada uno. Los dos cabecean al ritmo con los ojos cerrados →
 * Guillermo toma aire y se arranca a cantar a pleno pulmón (ojos cerrados, bocaza, notas con pinchos,
 * desafinadas) → Sara abre un ojo, aprieta los dos con el agudo, y se quita su auricular, que queda
 * colgando y balanceándose. Él ni se entera → Sara mira la oreja de Guillermo, levanta una ceja, se
 * inclina y, con dos dedos, le quita su auricular y se lo pone en su otra oreja; luego recoge el que
 * colgaba y se lo vuelve a poner: los dos para ella. Cabecea feliz con los ojos cerrados → Guillermo,
 * sin música, sigue cantando solo, con silencios en los que se queda colgado con la boca abierta; la
 * última nota le sale rota y se cae → abre los ojos, se toca la oreja vacía, mira a Sara con los dos
 * auriculares… y se pone como un tomate → ella abre los ojos, sonríe, se saca uno y se lo ofrece; él lo
 * coge y se lo pone → cabecean juntos al mismo ritmo → cruza una estrella fugaz; la miran, y miran a
 * cámara → negro.
 *
 * Sin textos (las notas son dibujos). Todo depende del tiempo absoluto. Los dos personajes, el móvil,
 * el cable y los auriculares se pintan en una capa aparte: así se les da la luz fría de la noche (sin
 * teñir de color la ropa negra), un filo de luna por el lado de la luna y el reflejo del móvil en las
 * piernas. El fondo (cielo, luna, ciudad, puente y pretil) se pinta una sola vez. Nada lee píxeles.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, SA = SaraSaez;
  const TAU = Math.PI * 2, TINTA = "#141218";
  const S = 0.35, DUR = 14.8;
  const HIP_Y = 380, MURO = 395;                  // cadera en pantalla y canto del pretil
  const XS = 318, XG = 520;                       // pelvis de Sara y de Guillermo (los dos miran a la derecha)
  const BEAT = 0.6, BEAT0 = 0.3;                  // la canción: 100 pulsos por minuto
  const T = {
    // escuchan los dos; Guillermo se arranca
    gInspira: 2.0, canta0: 2.45,
    // Sara: un ojo, el agudo, se quita el suyo
    sOjo: 2.85, sMueca0: 3.25, sMueca1: 3.5, sQuita0: 3.6, sQuita1: 3.95, sSuelta: 4.22,
    // le quita el suyo a Guillermo y se lo pone; recoge el que colgaba
    sIdea: 4.4, sAlarga0: 4.8, sCoge: 5.3, sTira: 5.52, sPone: 5.95, sRecoge0: 6.05, sRecoge: 6.45, sSube: 6.62, sPone2: 6.95,
    sGoza: 7.05,
    // Guillermo, solo: silencio, nota rota, se da cuenta
    gHueco0: 7.35, gHueco1: 7.9, gRota: 8.02, gAbre: 8.62, gToca0: 8.82, gToca1: 9.05, gToca2: 9.42,
    gMira: 9.48, gRubor: 9.78,
    // se lo devuelve
    sAbre: 9.98, sDa0: 10.2, sSaca: 10.45, sOfrece: 10.82, gCoge0: 10.55, gCoge: 10.98, gPone: 11.38,
    juntos: 11.5,
    // estrella fugaz y final
    estrella0: 12.15, estrella1: 13.0, miranE: 12.28, camara: 13.3, fin: 14.25
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
  const dentro = (t, a, b, c, d) => tramo(t, a, b) * (1 - tramo(t, c, d));
  // golpe del ritmo: 1 en cada pulso, 0 entre medias (sin esquinas)
  const golpe = (t, ret = 0) => Math.pow(0.5 + 0.5 * Math.cos(TAU * (t - BEAT0 - ret) / BEAT), 3);

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
  // la mano de Sara se dibuja al 0,86: los puntos de la mano (la pinza) también
  const escMano = Rg => (Rg === SA ? 0.86 : 1);
  const offMano = (Rg, m, q) => { const e = escMano(Rg), r = rota({ x: q.x * e, y: q.y * e }, m.mu + Math.PI / 2); return rota({ x: r.x * Rg.JK, y: r.y * Rg.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 }, YEMA = { x: 2.5, y: 19 }, CENTRO = { x: 0, y: 0 };
  const ptMano = (Rg, p, m, q) => { const o = offMano(Rg, m, q); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = rota({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  function resolutor(Rg, p) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) {
        if (Rg === G) { const b = Tr(o.bols === "cerca" ? BOLS_GC : BOLS_GL); return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0, 0, 0, 0), dobla: o.bols === "cerca" ? -1 : 1 }; }
        const r = Rg.manoReposo(p, o.bols); return { x: r.x, y: r.y, mu: r.mu, ang: 0, puno: 0, dedos: D(0, 0, 0, 0), dobla: r.dobla };
      }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.abs) { const f = offMano(Rg, m, o.ref || CENTRO); q = { x: o.abs.x - f.x, y: o.abs.y - f.y }; }
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(Rg, m, o.ref || CENTRO); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? 1 };
    };
  }
  const comoMano = c => ({ x: c.x, y: c.y, mu: c.mu, ang: c.ang, dobla: c.dobla, puno: c.puno, dedos: c.dedos });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.6, my: 0.1, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * EL FONDO: cielo de noche, luna, ciudad, río con el puente y el pretil (se pinta una vez)
   * ===================================================================================== */
  const MX = 70, MY = 50;                       // margen alrededor de la pantalla (cámara)
  const LUNA = { x: 852, y: 104, r: 37 };
  const HORIZ = MURO - 18;                      // canto de arriba del pretil
  const RIO_Y = 338, PUENTE = { x0: 560, x1: W + MX, y: 336, t1: 690, t2: 930, alto: 262 };
  let LISTO = false, FONDO = null, BRILLO = null, CAPA = null, FILO = null;
  const ESTRELLAS = []; for (let i = 0; i < 26; i++) ESTRELLAS.push({ x: hash(i * 3.7 + 1) * W, y: 8 + Math.pow(hash(i * 5.1 + 2), 1.5) * 200, r: 0.9 + hash(i * 9.3) * 1.1, ph: hash(i) * TAU, w: 1.5 + 2.5 * hash(i * 1.3) });
  function edificios(semilla, x0, x1, alMin, alMax, anMin, anMax, techo) {
    const L = []; let x = x0, i = 0;
    while (x < x1) {
      const w = lerp(anMin, anMax, hash(semilla + i * 3.1)), xc = x + w / 2;
      let top = HORIZ - lerp(alMin, alMax, Math.pow(hash(semilla + i * 7.7), 1.3));
      if (techo) top = Math.max(top, techo(xc));
      L.push({ x, w, top, d: hash(semilla + i * 5.3), i }); x += w + (hash(semilla + i * 1.9) < 0.3 ? 5 : 0); i++;
    }
    return L;
  }
  // detrás de las cabezas los edificios son bajos (que se lean las siluetas contra el cielo)
  const techoCerca = xc => (xc > 215 && xc < 650 ? 214 + 30 * Math.sin(xc * 0.05) : -999);
  const LEJOS = edificios(5, -MX, W + MX, 25, 95, 22, 54, null);
  const CERCA = edificios(41, -MX, 585, 60, 230, 40, 86, techoCerca);
  const ANTENAS = [];                          // luces rojas que parpadean
  const VENTANAS_VIVAS = [];                   // ventanas que se encienden y se apagan
  function creaFondo() {
    const c = lienzo(W + 2 * MX, H + 2 * MY), g = c.getContext("2d");
    g.translate(MX, MY);
    // cielo
    const gr = g.createLinearGradient(0, -MY, 0, HORIZ);
    gr.addColorStop(0, "#050820"); gr.addColorStop(0.42, "#111745"); gr.addColorStop(0.75, "#2a2460"); gr.addColorStop(0.92, "#4a2f6e"); gr.addColorStop(1, "#6d3c74");
    g.fillStyle = gr; g.fillRect(-MX, -MY, W + 2 * MX, HORIZ + MY + 2);
    // estrellas fijas (las que titilan van aparte)
    for (let i = 0; i < 110; i++) {
      const x = hash(i * 7.31 + 3) * (W + 2 * MX) - MX, y = -MY + Math.pow(hash(i * 2.17 + 9), 1.7) * 290, r = 0.5 + 0.8 * hash(i * 4.4);
      if (Math.hypot(x - LUNA.x, y - LUNA.y) < LUNA.r + 30) continue;
      g.fillStyle = `rgba(230,236,255,${0.35 + 0.5 * hash(i * 6.6)})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    // halo de la luna y nubes finas iluminadas
    const hl = g.createRadialGradient(LUNA.x, LUNA.y, LUNA.r * 0.8, LUNA.x, LUNA.y, 190);
    hl.addColorStop(0, "rgba(220,226,255,0.32)"); hl.addColorStop(0.4, "rgba(170,180,240,0.1)"); hl.addColorStop(1, "rgba(140,150,230,0)");
    g.fillStyle = hl; g.fillRect(LUNA.x - 190, LUNA.y - 190, 380, 380);
    for (const [nx, ny, nw, nh, a] of [[690, 150, 230, 9, 0.22], [880, 176, 260, 11, 0.18], [120, 90, 260, 8, 0.12], [430, 60, 180, 6, 0.1]]) {
      g.save(); g.translate(nx, ny); g.fillStyle = `rgba(150,150,215,${a})`;
      for (let k = 0; k < 7; k++) { const u = k / 6; g.beginPath(); g.ellipse((u - 0.5) * nw, -Math.sin(Math.PI * u) * nh * 0.6, nw * 0.22, nh * (0.5 + 0.5 * Math.sin(Math.PI * u)), 0, 0, TAU); g.fill(); }
      g.fillStyle = `rgba(230,225,255,${a * 0.7})`; g.fillRect(-nw * 0.4, -nh * 0.9, nw * 0.8, 1.2);
      g.restore();
    }
    // la luna: disco, mares y cráteres
    g.save(); g.translate(LUNA.x, LUNA.y);
    const ld = g.createRadialGradient(-10, -12, 4, 0, 0, LUNA.r);
    ld.addColorStop(0, "#fffdf0"); ld.addColorStop(0.7, "#f1ead2"); ld.addColorStop(1, "#d9cfb2");
    g.fillStyle = ld; g.beginPath(); g.arc(0, 0, LUNA.r, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, LUNA.r, 0, TAU); g.clip();
    g.fillStyle = "rgba(170,160,140,0.35)";
    for (const [x, y, rx, ry] of [[-12, -8, 13, 9], [8, 10, 11, 8], [14, -14, 7, 6], [-4, 18, 6, 4]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.3, 0, TAU); g.fill(); }
    for (const [x, y, r] of [[-20, 12, 3.2], [20, 4, 2.4], [2, -22, 2.8], [-6, 2, 1.8]]) {
      g.fillStyle = "rgba(150,140,120,0.45)"; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      g.fillStyle = "rgba(255,255,245,0.5)"; g.beginPath(); g.arc(x - 0.8, y - 0.8, r * 0.55, 0, TAU); g.fill();
    }
    g.fillStyle = "rgba(120,110,140,0.18)"; g.beginPath(); g.arc(9, 7, LUNA.r, 0, TAU); g.arc(0, 0, LUNA.r, 0, TAU, true); g.fill();
    g.restore(); g.restore();
    // resplandor de la ciudad en el horizonte
    const gc = g.createLinearGradient(0, HORIZ - 150, 0, HORIZ);
    gc.addColorStop(0, "rgba(255,120,170,0)"); gc.addColorStop(1, "rgba(255,130,150,0.22)");
    g.fillStyle = gc; g.fillRect(-MX, HORIZ - 150, W + 2 * MX, 150);
    // ciudad lejana (bruma violeta y ventanitas)
    for (const e of LEJOS) {
      g.fillStyle = "#33295e"; g.fillRect(e.x, e.top, e.w, HORIZ - e.top + 2);
      if (e.d > 0.75) { g.fillRect(e.x + e.w * 0.45, e.top - 12, 2, 12); }
      for (let y = e.top + 5; y < RIO_Y - 3; y += 7) for (let x = e.x + 3; x < e.x + e.w - 3; x += 6) {
        const s = hash(e.i * 13 + x * 0.7 + y * 1.3); if (s < 0.72) continue;
        g.fillStyle = s > 0.93 ? "rgba(190,230,255,0.55)" : "rgba(255,212,140,0.6)"; g.fillRect(x, y, 2, 2.5);
      }
    }
    // el río (bajo el puente) con los reflejos
    const gw = g.createLinearGradient(0, RIO_Y, 0, HORIZ);
    gw.addColorStop(0, "#1b1a46"); gw.addColorStop(1, "#0f1032");
    g.fillStyle = gw; g.fillRect(PUENTE.x0 - 30, RIO_Y, W + MX - PUENTE.x0 + 30, HORIZ - RIO_Y + 2);
    for (let i = 0; i < 60; i++) {
      const x = PUENTE.x0 + hash(i * 3.3) * (W + MX - PUENTE.x0), y = RIO_Y + 4 + hash(i * 7.1) * (HORIZ - RIO_Y - 6), w = 3 + 9 * hash(i * 1.7);
      g.fillStyle = hash(i * 2.9) > 0.5 ? "rgba(255,210,140,0.35)" : "rgba(200,220,255,0.25)"; g.fillRect(x, y, w, 1.2);
    }
    // el puente colgante: pilas, tablero, cable con bombillas y tirantes
    const P = PUENTE, catY = x => {                               // cable principal (catenaria aproximada)
      if (x < P.t1) { const u = (x - P.x0) / (P.t1 - P.x0); return lerp(P.y - 14, P.alto + 4, u * u); }
      if (x < P.t2) { const u = (x - P.t1) / (P.t2 - P.t1); return P.alto + 4 + 4 * u * (1 - u) * (P.y - 18 - P.alto - 4); }
      const u = (x - P.t2) / (P.x1 + 200 - P.t2); return lerp(P.alto + 4, P.y - 14, Math.sqrt(u));
    };
    g.strokeStyle = "rgba(160,170,220,0.35)"; g.lineWidth = 0.8;
    for (let x = P.x0 + 6; x < P.x1; x += 9) { g.beginPath(); g.moveTo(x, catY(x)); g.lineTo(x, P.y); g.stroke(); }
    g.strokeStyle = "#5a5f96"; g.lineWidth = 2;
    g.beginPath(); for (let x = P.x0; x <= P.x1; x += 4) { if (x === P.x0) g.moveTo(x, catY(x)); else g.lineTo(x, catY(x)); } g.stroke();
    for (const tx of [P.t1, P.t2]) {
      g.fillStyle = "#24224f"; g.fillRect(tx - 6, P.alto, 12, HORIZ - P.alto);
      g.fillStyle = "#3a3a75"; g.fillRect(tx - 6, P.alto, 3, HORIZ - P.alto); g.fillRect(tx - 8, P.alto + 20, 16, 4); g.fillRect(tx - 8, P.y - 22, 16, 4);
      ANTENAS.push({ x: tx, y: P.alto - 3, ph: tx * 0.01 });
    }
    g.fillStyle = "#1c1b44"; g.fillRect(P.x0, P.y, P.x1 - P.x0, 7);
    g.fillStyle = "#3d3f80"; g.fillRect(P.x0, P.y, P.x1 - P.x0, 1.5);
    for (let x = P.x0 + 8; x < P.x1; x += 16) {
      g.fillStyle = "rgba(255,205,120,0.9)"; g.beginPath(); g.arc(x, P.y - 3, 1.4, 0, TAU); g.fill();
      g.fillStyle = "rgba(255,190,110,0.18)"; g.fillRect(x - 1, P.y + 8, 2, 14 + 18 * hash(x));
    }
    for (let x = P.x0 + 12; x < P.x1; x += 21) { g.fillStyle = "rgba(240,244,255,0.95)"; g.beginPath(); g.arc(x, catY(x), 1.5, 0, TAU); g.fill(); }
    // ciudad cerca: bloques oscuros con ventanas, depósitos de agua y antenas
    for (const e of CERCA) {
      g.fillStyle = e.d > 0.5 ? "#201b45" : "#1a1640"; g.fillRect(e.x, e.top, e.w, HORIZ - e.top + 2);
      g.fillStyle = "rgba(120,110,200,0.22)"; g.fillRect(e.x + e.w - 3, e.top, 3, HORIZ - e.top);   // canto con luz de luna
      if (e.d > 0.78 && e.top < 200) { g.fillStyle = "#1a1640"; g.fillRect(e.x + e.w * 0.4, e.top - 30, 3, 30); g.fillRect(e.x + e.w * 0.4 - 8, e.top - 22, 19, 2); ANTENAS.push({ x: e.x + e.w * 0.4 + 1.5, y: e.top - 31, ph: e.d * 9 }); }
      else if (e.d > 0.55 && e.w > 50) {
        const tx = e.x + e.w * 0.3; g.fillStyle = "#1a1640";
        g.fillRect(tx, e.top - 18, 22, 14); g.beginPath(); g.moveTo(tx - 2, e.top - 18); g.lineTo(tx + 11, e.top - 27); g.lineTo(tx + 24, e.top - 18); g.fill();
        g.fillRect(tx + 3, e.top - 4, 2, 4); g.fillRect(tx + 17, e.top - 4, 2, 4);
      }
      for (let f = 0, y = e.top + 9; y < HORIZ - 6; f++, y += 13) for (let k = 0, x = e.x + 6; x < e.x + e.w - 9; k++, x += 11) {
        const s = hash(e.i * 31 + f * 7 + k * 3 + 0.5);
        if (s < 0.6) { if (s < 0.03 && VENTANAS_VIVAS.length < 7) VENTANAS_VIVAS.push({ x, y, ph: s * 400 }); continue; }
        g.fillStyle = s > 0.92 ? "rgba(185,225,255,0.7)" : s > 0.88 ? "rgba(255,120,190,0.6)" : "rgba(255,206,120,0.72)";
        g.fillRect(x, y, 6, 8);
        g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x, y + 5, 6, 3);
      }
    }
    // el pretil: albardilla de hormigón con el brillo de la luna y fachada en sombra
    const yb = HORIZ + 22;
    g.fillStyle = "#59617f"; g.fillRect(-MX, HORIZ, W + 2 * MX, 22);
    g.fillStyle = "#a9b4d8"; g.fillRect(-MX, HORIZ, W + 2 * MX, 3);
    g.fillStyle = "#7d87ab"; g.fillRect(-MX, HORIZ + 3, W + 2 * MX, 3);
    g.fillStyle = "#3a4060"; g.fillRect(-MX, HORIZ + 18, W + 2 * MX, 4);
    for (let x = -MX + 40; x < W + MX; x += 118) { g.fillStyle = "#3d4463"; g.fillRect(x, HORIZ + 4, 2, 14); g.fillStyle = "rgba(200,210,255,0.35)"; g.fillRect(x + 2, HORIZ + 4, 1, 14); }
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(30,34,60,${0.25 + 0.3 * hash(i)})`; g.fillRect(-MX + hash(i * 3.3) * (W + 2 * MX), HORIZ + 6 + hash(i * 5.5) * 11, 1.5, 1.5); }
    g.fillStyle = "#2b3150"; g.fillRect(-MX, yb, W + 2 * MX, H + MY - yb);
    for (let y = yb + 40; y < H + MY; y += 58) { g.fillStyle = "#232843"; g.fillRect(-MX, y, W + 2 * MX, 2); }
    for (let x = -MX + 80; x < W + MX; x += 170) { g.fillStyle = "#232843"; g.fillRect(x, yb, 2, H + MY - yb); }
    const gs = g.createLinearGradient(0, yb, 0, yb + 160);
    gs.addColorStop(0, "rgba(8,8,24,0.6)"); gs.addColorStop(0.2, "rgba(8,8,24,0.25)"); gs.addColorStop(1, "rgba(8,8,24,0.5)");
    g.fillStyle = gs; g.fillRect(-MX, yb, W + 2 * MX, H + MY - yb);
    // el cable de las bombillas
    g.strokeStyle = "#141626"; g.lineWidth = 1.4; g.beginPath();
    for (let x = -MX; x <= W + MX; x += 3) { const y = guirnaldaY(x); if (x === -MX) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    return c;
  }
  // la guirnalda de bombillas a lo largo de la fachada (cuelga en arcos entre ganchos)
  const GANCHO = 132, GUIR_Y = HORIZ + 30;
  function guirnaldaY(x) { const u = ((x + MX) % GANCHO) / GANCHO; return GUIR_Y + 15 * Math.sin(Math.PI * u); }
  const BOMBILLAS = []; for (let x = -MX + 14; x < W + MX; x += 33) BOMBILLAS.push({ x, y: guirnaldaY(x) + 4, c: Math.floor(hash(x * 0.37) * 3), ph: hash(x) * TAU });
  function creaBrillo() {                 // un resplandor redondo que se reutiliza (bombillas, móvil)
    const c = lienzo(64, 64), g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,0.9)"); r.addColorStop(0.25, "rgba(255,255,255,0.35)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c;
  }
  const COL_BOMB = ["#ffd27a", "#ffb08a", "#fff0b8"];
  function bombillas(g, t) {
    for (const b of BOMBILLAS) {
      const k = 0.75 + 0.25 * Math.sin(t * 1.3 + b.ph);
      g.globalAlpha = 0.5 * k; g.drawImage(BRILLO, b.x - 13, b.y - 11, 26, 26);
      g.globalAlpha = 1; g.fillStyle = COL_BOMB[b.c]; g.beginPath(); g.ellipse(b.x, b.y + 2, 2.6, 3.4, 0, 0, TAU); g.fill();
      g.fillStyle = "#141626"; g.fillRect(b.x - 1.6, b.y - 3, 3.2, 2.4);
    }
    g.globalAlpha = 1;
  }
  // lo que se mueve en el fondo: estrellas que titilan, luces rojas, coches en el puente, un avión
  function vidaFondo(g, t) {
    for (const e of ESTRELLAS) {
      const k = 0.55 + 0.45 * Math.sin(t * e.w + e.ph);
      g.fillStyle = `rgba(240,244,255,${0.85 * k})`; g.beginPath(); g.arc(e.x, e.y, e.r * (0.8 + 0.3 * k), 0, TAU); g.fill();
      if (e.r > 1.6) { g.fillStyle = `rgba(240,244,255,${0.35 * k})`; g.fillRect(e.x - 4 * k, e.y - 0.4, 8 * k, 0.8); g.fillRect(e.x - 0.4, e.y - 4 * k, 0.8, 8 * k); }
    }
    for (const a of ANTENAS) {
      const k = Math.pow(0.5 + 0.5 * Math.sin(t * 2.6 + a.ph), 4);
      g.globalAlpha = 0.6 * k; g.drawImage(BRILLO, a.x - 8, a.y - 8, 16, 16); g.globalAlpha = 1;
      g.fillStyle = `rgba(255,60,60,${0.35 + 0.65 * k})`; g.beginPath(); g.arc(a.x, a.y, 1.8, 0, TAU); g.fill();
    }
    for (const v of VENTANAS_VIVAS) {
      const k = Math.pow(0.5 + 0.5 * Math.sin(t * 0.55 + v.ph), 2);
      if (k < 0.03) continue;
      g.fillStyle = `rgba(255,214,140,${0.85 * k})`; g.fillRect(v.x, v.y, 6, 8);
    }
    // coches cruzando el puente (faros blancos hacia la derecha, pilotos rojos hacia la izquierda)
    for (let i = 0; i < 4; i++) {
      const dir = i % 2 ? -1 : 1, v = 38 + 9 * i, L = PUENTE.x1 - PUENTE.x0 + 60;
      const x = dir > 0 ? PUENTE.x0 - 30 + ((t * v + i * 170) % L) : PUENTE.x1 + 30 - ((t * v + i * 130) % L);
      g.fillStyle = dir > 0 ? "rgba(255,250,225,0.95)" : "rgba(255,70,60,0.9)";
      g.fillRect(x, PUENTE.y - 1 + (dir > 0 ? 1 : 0), 2.4, 1.6); g.fillRect(x + 4 * dir, PUENTE.y - 1 + (dir > 0 ? 1 : 0), 2.4, 1.6);
    }
    // un avión muy alto, despacio, con su luz que parpadea
    const ax = -40 + t * 26, ay = 52 - t * 1.6;
    g.fillStyle = "rgba(220,230,255,0.7)"; g.beginPath(); g.arc(ax, ay, 1.1, 0, TAU); g.fill();
    const ka = Math.pow(Math.max(0, Math.sin(t * 5.2)), 12);
    if (ka > 0.02) { g.globalAlpha = ka; g.drawImage(BRILLO, ax - 7, ay - 7, 14, 14); g.globalAlpha = 1; g.fillStyle = `rgba(255,90,90,${ka})`; g.beginPath(); g.arc(ax + 3, ay, 1.4, 0, TAU); g.fill(); }
    // reflejo de la luna en el río: rayitas que tiemblan
    for (let i = 0; i < 9; i++) {
      const y = RIO_Y + 6 + i * 4.2, w = 16 - i * 0.9 + 5 * Math.sin(t * 2.2 + i * 1.7);
      g.fillStyle = `rgba(235,236,255,${0.42 - i * 0.03})`; g.fillRect(LUNA.x - w / 2 + 3 * Math.sin(t * 1.4 + i), y, w, 1.4);
    }
  }
  // estrella fugaz (entra y sale con rampa; deja un destello al apagarse)
  const EF0 = { x: 430, y: 26 }, EF1 = { x: 940, y: 196 };
  function estrellaFugaz(g, t) {
    const u = fase(t, T.estrella0, T.estrella1); if (u <= 0 || t > T.estrella1 + 0.45) return;
    const v = lerp(u, suave(u), 0.55), x = lerp(EF0.x, EF1.x, v), y = lerp(EF0.y, EF1.y, v);
    const luz = Math.sin(Math.PI * Math.min(1, u)) * (u < 1 ? 1 : 0);
    if (u < 1) {
      const d = { x: EF1.x - EF0.x, y: EF1.y - EF0.y }, n = Math.hypot(d.x, d.y), cola = 150 * Math.sin(Math.PI * Math.min(1, u * 1.15));
      const bx = x - d.x / n * cola, by = y - d.y / n * cola;
      const gr = g.createLinearGradient(bx, by, x, y); gr.addColorStop(0, "rgba(200,220,255,0)"); gr.addColorStop(0.7, `rgba(220,235,255,${0.45 * luz})`); gr.addColorStop(1, `rgba(255,255,255,${0.95 * luz})`);
      g.strokeStyle = gr; g.lineCap = "round"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(bx, by); g.lineTo(x, y); g.stroke();
      g.globalAlpha = luz; g.drawImage(BRILLO, x - 11, y - 11, 22, 22); g.globalAlpha = 1;
      g.fillStyle = `rgba(255,255,255,${luz})`; g.beginPath(); g.arc(x, y, 2.1, 0, TAU); g.fill();
    }
    const kd = campana(t, T.estrella1 - 0.12, T.estrella1 + 0.4);
    if (kd > 0.01) {
      g.save(); g.translate(EF1.x - 26, EF1.y - 7); g.rotate(t * 0.8); g.fillStyle = `rgba(255,255,255,${0.8 * kd})`;
      g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 1.5 : 8 * kd; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.restore();
    }
  }

  /* =====================================================================================
   * EL MÓVIL, EL CABLE EN Y Y LOS AURICULARES
   * ===================================================================================== */
  const MOVIL = { x: XS + 113, y: MURO - 2 };      // tumbado en el canto del pretil, entre los dos
  const JACK = { x: MOVIL.x - 19, y: MOVIL.y - 1 };
  function movil(g, t) {
    g.save(); g.translate(MOVIL.x, MOVIL.y);
    // brillo de la pantalla en el pretil
    g.globalAlpha = 0.45 + 0.1 * golpe(t); g.drawImage(BRILLO, -34, -22, 68, 40); g.globalAlpha = 1;
    // la caja (vista casi de canto) y la pantalla
    g.fillStyle = "#121219"; g.beginPath(); g.moveTo(-19, -1); g.lineTo(17, -4); g.lineTo(20, 1); g.lineTo(-16, 4); g.closePath(); g.fill();
    g.fillStyle = "#9fe3ff"; g.beginPath(); g.moveTo(-15, -1.2); g.lineTo(14, -3.6); g.lineTo(16.5, -0.6); g.lineTo(-12.5, 1.8); g.closePath(); g.fill();
    // ecualizador en la pantalla (barritas al ritmo)
    g.fillStyle = "rgba(40,90,170,0.8)";
    for (let i = 0; i < 6; i++) { const h = 0.6 + 1.6 * Math.abs(Math.sin(t * 7.3 + i * 1.9)) * (0.6 + 0.4 * golpe(t)); g.fillRect(-9 + i * 3.6, -0.9 - i * 0.33 - h * 0.5, 1.6, h); }
    g.strokeStyle = "#08080c"; g.lineWidth = 1; g.beginPath(); g.moveTo(-19, -1); g.lineTo(17, -4); g.lineTo(20, 1); g.lineTo(-16, 4); g.closePath(); g.stroke();
    // la clavija
    g.fillStyle = "#e9edf3"; g.fillRect(-23, -2.6, 5, 2.6); g.fillStyle = "#7d8396"; g.fillRect(-19, -2.4, 1.2, 2.2);
    g.restore();
  }
  // las orejas (puntos del retrato de cada uno): Sara, la que se ve y la de delante (asoma junto a la
  // mandíbula, con la perla); Guillermo, la que se ve (mira hacia Sara)
  const OREJA_SA = { x: 652, y: 418 }, OREJA_SD = { x: 944, y: 486 }, OREJA_G = { x: 591, y: 596 };
  const orejaSA = p => SA.aPantalla(p, SA.cabeza(p).a(OREJA_SA));
  const orejaSD = p => SA.aPantalla(p, SA.cabeza(p).a(OREJA_SD));
  const orejaG = p => G.aPantalla(p, G.cabeza(p).a(OREJA_G));
  const bocaGs = p => G.aPantalla(p, G.boca(p));
  const hombroS = (p, lado) => SA.aPantalla(p, SA.tronco(p)(lado === "cerca" ? SA.HOMBRO_C : SA.HOMBRO));
  const hombroG = (p, lado) => G.aPantalla(p, G.tronco(p)(lado === "cerca" ? G.HOMBRO_C : G.HOMBRO));
  // el cable: la Y cuelga entre los auriculares sujetos y tira un poco hacia el móvil
  const CAIDA = 66, L_RAMA = 128, L_CUELGA = 46;
  function divisor(EA, wA, EB) {
    const w = wA + 1, m = { x: (EA.x * wA + EB.x) / w, y: (Math.max(EA.y, EB.y) * wA + EB.y) / w + CAIDA };
    const k = 0.06 + 0.18 * wA;
    return { x: lerp(m.x, JACK.x, k), y: lerp(m.y, JACK.y, k) };
  }
  const pesoA = t => 1 - tramo(t, T.sSuelta, T.sSuelta + 0.4) + tramo(t, T.sRecoge, T.sRecoge + 0.4);
  // estado de los dos auriculares: A (el de Sara) y B (el de Guillermo)
  let SUELTA = null;
  function aurisSinColgar(t, pS, pG) {
    const pinS = lado => ptMano(SA, pS, lado === "cerca" ? pS.manoCerca : pS.manoLejos, PINZA);
    let A, B, enA, enB;
    if (t < T.sQuita1) { A = orejaSA(pS); enA = "oreja"; }
    else if (t < T.sSuelta) { A = pinS("cerca"); enA = "mano"; }
    else if (t < T.sRecoge) { A = null; enA = "cuelga"; }
    else if (t < T.sPone2) { A = pinS("cerca"); enA = "mano"; }
    else { A = orejaSA(pS); enA = "oreja"; }
    if (t < T.sCoge) { B = orejaG(pG); enB = "orejaG"; }
    else if (t < T.sPone) { B = pinS("lejos"); enB = "mano"; }
    else if (t < T.sSaca) { B = orejaSD(pS); enB = "oreja"; }
    else if (t < T.gCoge) { B = pinS("lejos"); enB = "mano"; }
    else if (t < T.gPone) { B = ptMano(G, pG, pG.manoCerca, PINZA); enB = "mano"; }
    else { B = orejaG(pG); enB = "orejaG"; }
    return { A, B, enA, enB };
  }
  function soltadoA() {                    // dónde estaba el auricular de Sara al soltarlo (y la Y entonces)
    if (!SUELTA) { const P = pose(T.sSuelta), A = ptMano(SA, P.s, P.s.manoCerca, PINZA); SUELTA = { A, Y: divisor(A, 1, orejaG(P.g)) }; }
    return SUELTA;
  }
  function colgando(t, Y) {
    const r = soltadoA(), tau = t - T.sSuelta, d0 = { x: r.A.x - r.Y.x, y: r.A.y - r.Y.y };
    const th0 = Math.atan2(d0.x, d0.y), l0 = Math.hypot(d0.x, d0.y);
    const th = th0 * Math.exp(-2.4 * tau) * Math.cos(5.6 * tau) + 0.3 * amort(t, T.sCoge + 0.04, 2.6, 6.2) - 0.18 * amort(t, T.sPone - 0.05, 2.6, 6.2);
    const l = lerp(l0, L_CUELGA, salida(clamp(tau / 0.32)));
    return { x: Y.x + Math.sin(th) * l, y: Y.y + Math.cos(th) * l };
  }
  function auris(t, pS, pG) {
    const a = aurisSinColgar(t, pS, pG), wA = pesoA(t);
    const anclaA = a.A || soltadoA().A;
    const Y = divisor(t < T.sRecoge && t >= T.sSuelta ? soltadoA().A : anclaA, wA, a.B);
    if (!a.A) a.A = colgando(t, Y);
    return Object.assign(a, { Y, wA });
  }
  function auricular(g, E, Y, angCab, k) {
    // la varilla apunta hacia el cable; si está en la oreja, se tumba con la cabeza
    let ang = Math.atan2(-(Y.x - E.x), Y.y - E.y);
    if (angCab !== null) ang = lerp(angCab + 0.25, ang, 0.35);
    g.save(); g.translate(E.x, E.y); g.rotate(ang); g.scale(k, k); g.lineCap = "round";
    g.strokeStyle = "#15161f"; g.lineWidth = 5.4; g.beginPath(); g.moveTo(0, 1); g.lineTo(0, 9.5); g.stroke();
    g.strokeStyle = "#eef1f6"; g.lineWidth = 3.3; g.stroke();
    g.beginPath(); g.arc(0, 0, 4.6, 0, TAU); g.fillStyle = "#f6f8fc"; g.fill(); g.lineWidth = 1.3; g.strokeStyle = "#15161f"; g.stroke();
    g.fillStyle = "#97a0b4"; g.beginPath(); g.arc(-1.1, 0.9, 1.9, 0, TAU); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(1.5, -1.6, 1.15, 0, TAU); g.fill();
    g.restore();
    const f = rota({ x: 0, y: 10 * k }, ang); return { x: E.x + f.x, y: E.y + f.y };
  }
  function cable(g, P0, P1, comba) {
    const m = { x: (P0.x + P1.x) / 2, y: (P0.y + P1.y) / 2 + comba };
    g.beginPath(); g.moveTo(P0.x, P0.y); g.quadraticCurveTo(m.x, m.y, P1.x, P1.y);
    g.strokeStyle = "rgba(14,14,24,0.9)"; g.lineWidth = 3.2; g.stroke();
    g.strokeStyle = "#eef1f7"; g.lineWidth = 1.6; g.stroke();
  }
  const comba = (P0, P1, L) => 3 + Math.max(0, L - Math.hypot(P1.x - P0.x, P1.y - P0.y)) * 0.45;
  function cables(g, t, pS, pG, au) {
    const { A, B, Y } = au;
    const angS = SA.cabeza(pS).ang, angG = G.cabeza(pG).ang;
    const kA = au.enA === "oreja" ? angS : null, kB = au.enB === "oreja" ? angS : au.enB === "orejaG" ? angG : null;
    // el cable que va al móvil (por debajo de los auriculares)
    cable(g, Y, JACK, 22 + 6 * Math.sin(t * 1.1));
    const fA = rota({ x: 0, y: 10 }, Math.atan2(-(Y.x - A.x), Y.y - A.y)), fB = rota({ x: 0, y: 10 }, Math.atan2(-(Y.x - B.x), Y.y - B.y));
    const finA = { x: A.x + fA.x, y: A.y + fA.y }, finB = { x: B.x + fB.x, y: B.y + fB.y };
    cable(g, Y, finA, au.enA === "cuelga" ? 1.5 + 16 * (1 - tramo(t, T.sSuelta + 0.08, T.sSuelta + 0.5)) : comba(Y, finA, L_RAMA));
    cable(g, Y, finB, comba(Y, finB, L_RAMA));
    // el divisor de la Y
    const ang = Math.atan2(JACK.y - Y.y, JACK.x - Y.x) - Math.PI / 2;
    g.save(); g.translate(Y.x, Y.y); g.rotate(ang); g.fillStyle = "#eef1f7"; g.strokeStyle = "#15161f"; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(-2.6, -3); g.lineTo(2.6, -3); g.lineTo(2.2, 5); g.lineTo(-2.2, 5); g.closePath(); g.fill(); g.stroke(); g.restore();
    auricular(g, A, Y, kA, 1);
    auricular(g, B, Y, kB, 1);
  }

  /* =====================================================================================
   * SARA (izquierda, mira a la derecha, igual que él)
   * ===================================================================================== */
  const CS = {
    escucha: E({ mx: 0.6, my: 0.1, c: 1, h: 0.45, sd: 6, si: 6, sonr: 0.32, ancho: 0.85 }),
    ojo: E({ mx: 1, my: 0.05, cd: 1, ci: 0.1, sd: 0, si: 18, gi: 0.12, sonr: 0.0, ancho: 0.7 }),
    mueca: E({ c: 1, z: 0.85, sd: -6, gd: -0.1, si: -6, gi: -0.1, sonr: -0.35, ancho: 0.62, abre: 2 }),
    quita: E({ mx: 1, my: 0.0, c: 0.35, sd: 2, si: 10, sonr: -0.12, ancho: 0.6 }),
    idea: E({ mx: 1, my: -0.3, c: 0.25, sd: 0, si: 26, gi: 0.14, sonr: 0.55, ancho: 0.72 }),
    cuidado: E({ mx: 1, my: -0.35, c: 0.1, sd: 12, si: 16, sonr: 0.2, ancho: 0.5, abre: 3, lengua: 0.45 }),
    pone: E({ mx: 0.6, my: 0.2, c: 0.5, sd: 8, si: 10, sonr: 0.5, ancho: 0.75 }),
    recoge: E({ mx: 0.4, my: 0.95, c: 0.15, sd: 4, si: 4, sonr: 0.35, ancho: 0.7 }),
    goza: E({ c: 1, h: 1, sd: 8, si: 8, sonr: 0.78, ancho: 0.95 }),
    abre: E({ mx: 1, my: -0.05, sd: 10, si: 12, sonr: 0.5, ancho: 0.8 }),
    tierna: E({ mx: 1, my: 0.02, c: 0.3, h: 0.5, sd: 8, si: 8, sonr: 0.85, ancho: 0.9, rub: 0.25 }),
    juntos: E({ c: 1, h: 0.9, sd: 6, si: 6, sonr: 0.72, ancho: 0.9 }),
    estrella: E({ mx: 0.75, my: -1, iris: 0.95, sd: 18, si: 22, sonr: 0.3, ancho: 0.62, abre: 7 }),
    final: E({ mx: -0.1, my: 0.12, c: 0.12, sd: 6, si: 8, sonr: 0.72, ancho: 0.9 })
  };
  const GUION_CS = [
    [T.sOjo, T.sOjo + 0.15, "ojo"], [T.sMueca0, T.sMueca0 + 0.1, "mueca", salida], [T.sMueca1, T.sMueca1 + 0.2, "quita"],
    [T.sIdea, T.sIdea + 0.2, "idea"], [T.sAlarga0 + 0.15, T.sAlarga0 + 0.4, "cuidado"], [T.sPone - 0.25, T.sPone, "pone"],
    [T.sRecoge0, T.sRecoge0 + 0.2, "recoge"], [T.sSube, T.sSube + 0.25, "pone"], [T.sGoza, T.sGoza + 0.3, "goza"],
    [T.sAbre, T.sAbre + 0.15, "abre"], [T.sAbre + 0.3, T.sAbre + 0.55, "tierna"], [T.juntos, T.juntos + 0.3, "juntos"],
    [T.miranE, T.miranE + 0.2, "estrella"], [T.camara, T.camara + 0.35, "final"]
  ];
  const CUER_S = {
    relax: { torso: 0.03, cab: 0.04, px: 0 }, mueca: { torso: -0.04, cab: -0.08, px: 0 }, quita: { torso: 0.0, cab: 0.08, px: 0 },
    idea: { torso: 0.06, cab: 0.0, px: 0 }, alarga: { torso: 0.3, cab: -0.14, px: 14 }, pone: { torso: 0.07, cab: 0.06, px: 4 },
    recoge: { torso: 0.16, cab: 0.2, px: 0 }, goza: { torso: 0.04, cab: 0.05, px: 0 }, da: { torso: 0.16, cab: -0.02, px: 6 },
    juntos: { torso: 0.06, cab: 0.06, px: 4 }, arriba: { torso: -0.04, cab: -0.2, px: 4 }, final: { torso: 0.03, cab: 0.0, px: 4 }
  };
  const GUION_S = [
    [T.sMueca0, T.sMueca0 + 0.12, "mueca", salida], [T.sMueca1, T.sQuita0 + 0.15, "quita"], [T.sSuelta + 0.05, T.sIdea + 0.2, "idea"],
    [T.sAlarga0, T.sCoge, "alarga"], [T.sTira + 0.05, T.sPone, "pone"], [T.sRecoge0, T.sRecoge, "recoge"], [T.sSube, T.sPone2, "pone"],
    [T.sGoza - 0.05, T.sGoza + 0.3, "goza"], [T.sDa0, T.sSaca, "pone"], [T.sSaca, T.sOfrece, "da"], [T.gCoge + 0.05, T.juntos, "juntos"],
    [T.miranE, T.miranE + 0.35, "arriba"], [T.camara, T.camara + 0.4, "final"]
  ];
  const PARP_S = [1.6, 4.62, 8.4, 10.7, 12.9, 13.9];
  // cuándo cabecea Sara (tiene música en alguna oreja y no está ocupada)
  const cabeceaS = t => dentro(t, 0.2, 0.6, T.sMueca0 - 0.1, T.sMueca0) * 1 + dentro(t, T.sPone2 - 0.1, T.sGoza + 0.2, T.sAbre - 0.1, T.sAbre + 0.15)
    + 0.8 * dentro(t, T.gPone, T.juntos, T.miranE - 0.1, T.miranE + 0.1);
  function poseS(t) {
    const b = linea(GUION_S, CUER_S, "relax", t);
    const respira = Math.sin(t * 1.6 + 0.4), cab = cabeceaS(t), go = golpe(t, 0.04);
    const p = { x: XS + b.px, suelo: HIP_Y + (SA.SUELO - SA.PELVIS.y) * S * SA.K, s: S, tirasLimpias: true, piernas: {},
      pelvis: { x: SA.PELVIS.x, y: SA.PELVIS.y }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // cabeceo al ritmo (barbilla abajo en cada golpe) y un pelín de hombros
    p.cabeza.ang += 0.075 * go * cab; p.cabeza.dy += 3 * go * cab; p.torso += 0.012 * go * cab;
    // el agudo: un respingo
    p.cabeza.dx -= 3 * campana(t, T.sMueca0 - 0.02, T.sMueca1 + 0.1);
    p.pelo = { viento: 0.12 + 0.08 * Math.sin(t * 0.7), inercia: -0.6 * go * cab + 0.4 * amort(t, T.sMueca0, 5, 14) };
    // piernas colgando del pretil, sin prisa (al ritmo cuando cabecea)
    for (const [lado, fase0, adelanta] of [["cerca", 0, 0], ["lejos", 1.9, -10]]) {
      const cad = SA.CADERA[lado], L = lado === "cerca" ? 565 : 551, th = L / 2;
      const sw = 0.8 * Math.sin(t * 1.5 + fase0) * (1 - 0.6 * cab) + 0.6 * cab * (golpe(t, lado === "cerca" ? 0 : BEAT / 2) - 0.4);
      const rod = { x: cad.x + th * 0.985 + adelanta, y: cad.y + 18 };
      const a = 0.12 + 0.18 * sw;
      p.piernas[lado] = { tob: { x: rod.x + Math.sin(a) * th, y: rod.y + Math.cos(a) * th }, ang: 0.3 + 0.24 * sw };
    }
    const e = linea(GUION_CS, CS, "escucha", t);
    e.sonr += 0.08 * go * cab;
    p.cara = cara(e, parpadeo(t, PARP_S));
    p.rojo = 0;
    return p;
  }
  const PELLIZCO_S = D5(0.62, 0.58, 0.22, 0.18, 0.16), SUELTA_D = D5(0.85, 0.85, 0.5, 0.4, 0.35), OFRECE_D = D5(0.6, 0.6, 0.4, 0.35, 0.3);
  // la mano de delante en su oreja de delante: el antebrazo sube desde abajo a la derecha (fuera de la cara)
  const MU_SD = 1.05, DOB_SD = -1;
  function manosS(p, t, pG, au) {
    const r = resolutor(SA, p);
    // cerca (la que se ve): se quita el auricular, lo suelta, recoge el que cuelga y se lo vuelve a poner
    const sacaA = () => { const o = orejaSA(p); return { x: o.x - 4, y: o.y + 58 }; };
    const cuelga = () => au.colgado(t);
    const subeA = () => { const o = orejaSA(p); return { x: o.x + 8, y: o.y + 52 }; };
    const PC = [
      [0, 0, { bols: "cerca" }],
      [T.sQuita0, T.sQuita1, { scr: () => orejaSA(p), ref: PINZA, mu: 1.95, dedos: PELLIZCO_S, dobla: -1 }],
      [T.sQuita1 + 0.02, T.sSuelta, { scr: sacaA, ref: PINZA, mu: 1.85, dedos: PELLIZCO_S, dobla: -1 }],
      [T.sSuelta, T.sSuelta + 0.08, { scr: sacaA, ref: PINZA, mu: 1.85, dedos: SUELTA_D, dobla: -1 }],
      [T.sSuelta + 0.12, T.sSuelta + 0.5, { bols: "cerca" }],
      [T.sRecoge0, T.sRecoge, { scr: cuelga, ref: PINZA, mu: -2.35, dedos: PELLIZCO_S, dobla: 1 }],
      [T.sRecoge + 0.02, T.sSube, { scr: subeA, ref: PINZA, mu: 1.9, dedos: PELLIZCO_S, dobla: -1 }],
      [T.sSube + 0.01, T.sPone2, { scr: () => orejaSA(p), ref: PINZA, mu: 1.95, dedos: PELLIZCO_S, dobla: -1 }],
      [T.sPone2 + 0.08, T.sPone2 + 0.5, { bols: "cerca" }]
    ];
    // lejos (la de delante): le quita el auricular a Guillermo, se lo pone, y luego se lo devuelve
    const tira = () => { const o = orejaG(pG); return { x: o.x - 16, y: o.y + 8 }; };
    const ofrece = () => { const h = hombroS(p, "lejos"); return { x: h.x + 38 + 2 * Math.sin(t * 3), y: h.y + 50 }; };
    const PL = [
      [0, 0, { bols: "lejos" }],
      [T.sAlarga0, T.sCoge, { scr: () => orejaG(pG), ref: PINZA, mu: 2.35, dedos: PELLIZCO_S, dobla: 1 }],
      [T.sCoge + 0.02, T.sTira, { scr: tira, ref: PINZA, mu: 2.4, dedos: PELLIZCO_S, dobla: 1 }],
      [T.sTira + 0.02, T.sPone, { scr: () => orejaSD(p), ref: PINZA, mu: MU_SD, dedos: PELLIZCO_S, dobla: DOB_SD }],
      [T.sPone + 0.06, T.sPone + 0.45, { bols: "lejos" }],
      [T.sDa0, T.sSaca, { scr: () => orejaSD(p), ref: PINZA, mu: MU_SD, dedos: PELLIZCO_S, dobla: DOB_SD }],
      [T.sSaca + 0.02, T.sOfrece, { scr: ofrece, ref: PINZA, mu: 2.75, dedos: PELLIZCO_S, dobla: 1 }],
      [T.gCoge, T.gCoge + 0.06, { scr: ofrece, ref: PINZA, mu: 2.75, dedos: OFRECE_D, dobla: 1 }],
      [T.gCoge + 0.1, T.gCoge + 0.5, { bols: "lejos" }]
    ];
    p.manoCerca = comoMano(pista(PC, t, r));
    p.manoLejos = comoMano(pista(PL, t, r));
  }

  /* =====================================================================================
   * GUILLERMO (derecha, mira a la derecha: la oreja que se ve da a Sara)
   * ===================================================================================== */
  const CG = {
    escucha: E({ mx: 0.6, my: 0.1, c: 1, h: 0.5, sd: 6, si: 6, sonr: 0.45, ancho: 0.9 }),
    inspira: E({ c: 1, sd: 22, si: 22, abre: 9, ancho: 0.42, sonr: 0.0, mof: 0.45 }),
    canta: E({ c: 1, sd: 28, si: 28, gd: -0.05, gi: -0.05, abre: 36, ancho: 1.0, sonr: 0.25, lengua: 0.35 }),
    hueco: E({ c: 1, sd: 20, si: 20, abre: 15, ancho: 0.72, sonr: 0.12 }),
    rota: E({ c: 1, z: 0.45, sd: 32, si: 32, abre: 28, ancho: 0.58, sonr: -0.3 }),
    abre: E({ mx: 0.45, my: 0.0, iris: 0.95, sd: 14, si: 10, sonr: 0.0, ancho: 0.55, abre: 6 }),
    toca: E({ mx: -0.6, my: -0.2, sd: 16, gd: 0.1, si: 4, sonr: -0.15, ancho: 0.5, abre: 4 }),
    mira: E({ mx: -1, my: 0.05, iris: 0.85, sd: 24, si: 24, sonr: -0.1, ancho: 0.5, abre: 8 }),
    rubor: E({ mx: -0.85, my: 0.35, c: 0.35, sd: 10, gd: -0.08, si: 12, gi: 0.08, sonr: 0.35, ancho: 0.55, mof: 0.4, rub: 1 }),
    recibe: E({ mx: -1, my: 0.1, c: 0.15, sd: 12, si: 12, sonr: 0.7, ancho: 0.95, rub: 0.7 }),
    juntos: E({ c: 1, h: 0.9, sd: 8, si: 8, sonr: 0.8, ancho: 1.0, rub: 0.4 }),
    estrella: E({ mx: 0.6, my: -1, iris: 0.95, sd: 24, si: 24, abre: 14, ancho: 0.6, sonr: 0.2, rub: 0.2 }),
    final: E({ mx: -0.15, my: 0.12, sd: 8, si: 8, sonr: 0.85, ancho: 1.0, rub: 0.25 })
  };
  const GUION_CG = [
    [T.gInspira, T.gInspira + 0.25, "inspira"], [T.canta0, T.canta0 + 0.1, "canta", salida], [T.gHueco0, T.gHueco0 + 0.15, "hueco"],
    [T.gHueco1, T.gHueco1 + 0.08, "canta"], [T.gRota, T.gRota + 0.1, "rota"], [T.gRota + 0.3, T.gAbre - 0.05, "hueco"],
    [T.gAbre, T.gAbre + 0.12, "abre"], [T.gToca0, T.gToca0 + 0.2, "toca"], [T.gMira, T.gMira + 0.12, "mira"], [T.gRubor, T.gRubor + 0.35, "rubor"],
    [T.sOfrece - 0.1, T.sOfrece + 0.15, "recibe"], [T.juntos, T.juntos + 0.3, "juntos"], [T.miranE + 0.05, T.miranE + 0.25, "estrella"],
    [T.camara + 0.05, T.camara + 0.4, "final"]
  ];
  const CUER_G = {
    relax: { torso: 0.02, cab: 0.04 }, inspira: { torso: -0.07, cab: -0.12 }, canta: { torso: -0.06, cab: -0.16 }, hueco: { torso: -0.02, cab: -0.06 },
    abre: { torso: 0.0, cab: 0.0 }, oreja: { torso: -0.05, cab: -0.04 }, mira: { torso: -0.09, cab: -0.1 }, rubor: { torso: 0.03, cab: 0.12 },
    recibe: { torso: -0.07, cab: -0.04 }, juntos: { torso: 0.0, cab: 0.04 }, arriba: { torso: -0.03, cab: -0.22 }, final: { torso: 0.02, cab: 0.0 }
  };
  const GUION_G = [
    [T.gInspira, T.canta0, "inspira"], [T.canta0, T.canta0 + 0.2, "canta", salida], [T.gHueco0, T.gHueco0 + 0.2, "hueco"], [T.gHueco1, T.gHueco1 + 0.1, "canta"],
    [T.gRota + 0.2, T.gAbre, "hueco"], [T.gAbre, T.gAbre + 0.2, "abre"], [T.gToca0, T.gToca1, "oreja"], [T.gMira, T.gMira + 0.15, "mira"],
    [T.gRubor, T.gRubor + 0.35, "rubor"], [T.sOfrece - 0.15, T.gCoge, "recibe"], [T.gPone, T.juntos + 0.2, "juntos"],
    [T.miranE, T.miranE + 0.35, "arriba"], [T.camara, T.camara + 0.4, "final"]
  ];
  const PARP_G = [0.95, 9.3, 10.5, 12.0, 13.75];
  const cantaK = t => dentro(t, T.canta0, T.canta0 + 0.1, T.gHueco0 - 0.05, T.gHueco0 + 0.08) + dentro(t, T.gHueco1, T.gHueco1 + 0.06, T.gRota + 0.25, T.gRota + 0.4);
  const cabeceaG = t => dentro(t, 0.2, 0.6, T.gInspira - 0.1, T.gInspira + 0.1) + 0.8 * dentro(t, T.gPone - 0.1, T.juntos, T.miranE - 0.1, T.miranE + 0.1);
  // el balanceo al cantar: se calma mientras Sara le quita el auricular (que no se mueva la oreja)
  const balanceo = t => cantaK(t) * (1 - 0.65 * dentro(t, T.sAlarga0, T.sAlarga0 + 0.3, T.sTira, T.sTira + 0.3));
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "relax", t);
    const respira = Math.sin(t * 2.0), go = golpe(t), cab = cabeceaG(t), ca = cantaK(t), bal = balanceo(t);
    const p = { x: XG, suelo: HIP_Y + (G.SUELO - G.PELVIS.y) * S, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    p.cabeza.ang += 0.08 * go * cab; p.cabeza.dy += 3 * go * cab;
    // toma aire: el pecho se hincha
    const ins = campana(t, T.gInspira - 0.05, T.canta0 + 0.15);
    p.torsoEsc.y += 0.04 * ins; p.torsoEsc.x += 0.02 * ins;
    // canta: se balancea despacio y la cabeza vibra en las notas largas
    const fb = (t - T.canta0) * TAU / 2.4;
    p.torso += 0.05 * Math.sin(fb) * bal; p.cabeza.ang -= 0.07 * Math.sin(fb + 0.6) * bal;
    p.cabeza.ang += 0.012 * Math.sin(t * 34) * ca * campana(((t - T.canta0) / 1.2) % 1, 0.3, 0.9);
    // el silencio: se queda colgado; la nota rota: un tirón
    p.cabeza.ang -= 0.04 * amort(t, T.gRota, 5, 16);
    // se da cuenta: un respingo; ruborizado se encoge un poco
    p.cabeza.dy -= 4 * amort(t, T.gAbre, 6, 14);
    const enc = dentro(t, T.gRubor, T.gRubor + 0.3, T.sOfrece - 0.2, T.sOfrece);
    p.torsoEsc.y -= 0.02 * enc; p.cabeza.dy += 4 * enc;
    // piernas colgando (pataleo al ritmo cuando canta)
    for (const [lado, fase0, adelanta] of [["cerca", 0.7, 0], ["lejos", 2.6, -10]]) {
      const cad = G.CADERA[lado], th = 541 / 2;
      const sw = Math.sin(t * 1.75 + fase0) * (1 - 0.7 * ca) + 1.1 * ca * (golpe(t, lado === "cerca" ? 0 : BEAT / 2) - 0.4) * (1 - dentro(t, T.gHueco0, T.gHueco0 + 0.2, T.gHueco1 - 0.1, T.gHueco1))
        + 0.5 * cab * (golpe(t, BEAT / 2) - 0.4);
      const rod = { x: cad.x + th * 0.985 + adelanta, y: cad.y + 18 };
      const a = 0.14 + 0.2 * sw;
      p.piernas[lado] = { tob: { x: rod.x + Math.sin(a) * th, y: rod.y + Math.cos(a) * th }, ang: 0.32 + 0.28 * sw };
    }
    const e = linea(GUION_CG, CG, "escucha", t);
    // canta por sílabas: la boca se abre y se cierra (y tararea mientras escucha)
    if (ca > 0) { const s = Math.sin((t - T.canta0) * TAU / 0.6); e.abre += 10 * s * ca; e.ancho = lerp(e.ancho, 0.82 + 0.18 * s, ca * 0.6); }
    const tara = dentro(t, 0.4, 0.8, T.gInspira - 0.2, T.gInspira);
    if (tara > 0) { e.abre += 4 * Math.max(0, Math.sin(t * TAU / 0.3)) * tara; }
    e.sonr += 0.08 * go * cab;
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.32 * dentro(t, T.gRubor, T.gRubor + 0.35, T.juntos, T.juntos + 0.8);
    return p;
  }
  const PUNO_G = D(0.2, 0.12, 0.12, 0.12), ABIERTA_G = D(0.95, 1, 1, 1), TOCA_G = D5(0.35, 1, 0.3, 0.22, 0.2), PELLIZCO_G = D5(0.62, 0.58, 0.25, 0.18, 0.15);
  function manosG(p, t, pS) {
    const r = resolutor(G, p);
    // lejos: el micrófono imaginario, luego el brazo abierto (las notas largas), quieto en el silencio
    const PD = -1;                       // codo hacia abajo: el antebrazo sube vertical bajo el puño
    const reposo = { abs: { x: 425, y: 612 }, mu: -1.3, dedos: D(0.5, 0.55, 0.55, 0.55), dobla: PD };
    // puño apretado delante del pecho, al ritmo (lo siente)
    const puno = () => { const h = hombroG(p, "lejos"); return { x: h.x + 40, y: h.y - 26 - 6 * golpe(t, 0.05) }; };
    const abierto = k => () => { const h = hombroG(p, "lejos"); return { x: h.x + 92 + 4 * Math.sin(t * 30) * k, y: h.y - 50 + 3 * Math.sin(t * 27) * k }; };
    const PL = [
      [0, 0, reposo],
      [T.canta0 - 0.1, T.canta0 + 0.25, { scr: puno, mu: 1.62, dedos: PUNO_G, dobla: PD }],
      [5.05, 5.4, { scr: abierto(0), mu: 2.85, dedos: ABIERTA_G, dobla: PD }, salida],
      [5.45, 5.6, { scr: abierto(1), mu: 2.85, dedos: ABIERTA_G, dobla: PD }],
      [T.gHueco0, T.gHueco0 + 0.25, { scr: abierto(0), mu: 2.75, dedos: D(0.7, 0.75, 0.7, 0.65), dobla: PD }],
      [T.gHueco1, T.gHueco1 + 0.12, { scr: abierto(1), mu: 2.9, dedos: ABIERTA_G, dobla: PD }, salida],
      [T.gRota, T.gRota + 0.12, { scr: puno, mu: 1.62, dedos: PUNO_G, dobla: PD }],
      [T.gAbre + 0.05, T.gAbre + 0.45, reposo]
    ];
    // cerca: se toca la oreja vacía, se rasca la nuca de vergüenza; coge el auricular de la mano de Sara y se lo pone
    const DG = 1, MG = 1.85, DG2 = 1, MG2 = -0.35;      // codo hacia fuera (hacia Sara): el antebrazo no le cruza la cara
    const buscaOreja = () => { const o = orejaG(p), k = Math.sin((t - T.gToca1) * 15); return { x: o.x - 2 + 4 * k, y: o.y + 3 + 3 * Math.cos((t - T.gToca1) * 12) }; };
    const bajaOreja = () => { const o = orejaG(p); return { x: o.x - 4, y: o.y + 16 }; };
    const nuca = () => { const q = G.aPantalla(p, G.cabeza(p).a({ x: 560, y: 470 })), k = Math.sin((t - T.gRubor) * 17); return { x: q.x + 3 * k, y: q.y + 5 * Math.abs(k) }; };
    const PC = [
      [0, 0, { bols: "cerca" }],
      [T.gToca0, T.gToca1, { scr: () => orejaG(p), ref: YEMA, mu: MG, dedos: TOCA_G, dobla: DG }],
      [T.gToca1, T.gToca1 + 0.05, { scr: buscaOreja, ref: YEMA, mu: MG, dedos: TOCA_G, dobla: DG }],
      [T.gToca2, T.gMira + 0.2, { scr: bajaOreja, ref: YEMA, mu: MG, dedos: D5(0.5, 0.7, 0.45, 0.4, 0.4), dobla: DG }],
      [T.gRubor - 0.05, T.gRubor + 0.25, { scr: nuca, ref: YEMA, mu: MG + 0.1, dedos: D(0.5, 0.55, 0.5, 0.45), dobla: DG }],
      [T.gCoge0, T.gCoge, { scr: () => ptMano(SA, pS, pS.manoLejos, PINZA), ref: PINZA, mu: MG2, dedos: PELLIZCO_G, dobla: DG2 }],
      [T.gCoge + 0.02, T.gPone, { scr: () => orejaG(p), ref: PINZA, mu: MG, dedos: PELLIZCO_G, dobla: DG }],
      [T.gPone + 0.08, T.gPone + 0.55, { bols: "cerca" }]
    ];
    p.manoLejos = comoMano(pista(PL, t, r));
    p.manoCerca = comoMano(pista(PC, t, r));
  }

  // las dos poses juntas (las manos de cada uno dependen del otro y del cable)
  function pose(t) {
    const g = poseG(t), s = poseS(t);
    // dónde cuelga el auricular de Sara (mientras lo recoge, el otro ya está en su oreja de delante)
    const au = { colgado: tt => { tt = Math.min(tt, T.sRecoge); return colgando(tt, divisor(soltadoA().A, pesoA(tt), orejaSD(s))); } };
    manosS(s, t, g, au);
    manosG(g, t, s);
    return { g, s };
  }

  /* =====================================================================================
   * NOTAS: redondas (la música de los auriculares) y con pinchos (Guillermo cantando)
   * ===================================================================================== */
  function notaRedonda(g, x, y, k, gir, col, alfa) {
    g.save(); g.translate(x, y); g.rotate(gir); g.scale(k, k); g.globalAlpha = alfa; g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, TAU); g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6); };
    g.strokeStyle = TINTA; g.lineWidth = 6; forma(); g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, TAU); g.fill();
    g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-11, 7, 3.2, 2, -0.4, 0, TAU); g.fill();
    g.restore();
  }
  function notaPincho(g, x, y, k, gir, col, t, i, alfa) {
    g.save(); g.translate(x, y); g.rotate(gir); g.scale(k, k); g.globalAlpha = alfa; g.lineJoin = "miter"; g.lineCap = "butt";
    const cab = () => { g.beginPath();
      for (let n = 0; n < 14; n++) { const a = n / 14 * TAU, r = (n % 2 ? 6 : 13) + 1.5 * Math.sin(t * 30 + n + i);
        const px = -8 + Math.cos(a) * r * 1.15, py = 10 + Math.sin(a) * r; n ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };
    const palo = () => { g.beginPath(); g.moveTo(2, 4); g.lineTo(-2, -5); g.lineTo(5, -12); g.lineTo(-1, -19); g.lineTo(4, -27); g.lineTo(17, -16); g.lineTo(10, -12); g.lineTo(19, -3); };
    g.strokeStyle = TINTA; g.lineWidth = 7.5; palo(); g.stroke(); cab(); g.lineWidth = 4.5; g.stroke();
    g.fillStyle = col; cab(); g.fill();
    g.strokeStyle = col; g.lineWidth = 3.8; palo(); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(-8, 10, 2.2, 0, TAU); g.fill();
    g.restore();
  }
  const COL_MUS = ["#a8e6ff", "#ffb3d9", "#c9b5ff", "#b8ffd9"], COL_G = ["#c8f03c", "#ffd13b", "#ff8a3c"];
  // notitas de la música: una por pulso desde cada auricular que suena en una oreja (más pequeñas si cuelga)
  const FUENTES = ["SA", "SD", "G", "C"];
  const sonando = (f, t) => f === "SA" ? (t < T.sQuita0 + 0.1 || t > T.sPone2) : f === "SD" ? (t > T.sPone && t < T.sDa0 + 0.1) :
    f === "G" ? (t < T.sCoge - 0.05 || t > T.gPone) : (t > T.sSuelta + 0.2 && t < T.sRecoge0 + 0.1);
  const NOTAS_M = (() => { const L = []; let i = 0;
    for (let tb = BEAT0 + 0.5; tb < T.fin - 0.4; tb += BEAT) for (const f of FUENTES) { if (!sonando(f, tb)) continue;
      if (f === "C" && Math.round((tb - BEAT0) / BEAT) % 2) continue;
      L.push({ t0: tb + 0.06 * hash(i * 1.7), vida: f === "C" ? 0.8 : 1.25, f, i: i++ }); }
    return L; })();
  const ORIG = new Map();
  function origenM(n) {
    if (!ORIG.has(n)) { const P = pose(n.t0), au = auris(n.t0, P.s, P.g);
      const q = n.f === "SA" ? orejaSA(P.s) : n.f === "SD" ? orejaSD(P.s) : n.f === "G" ? orejaG(P.g) : au.A;
      ORIG.set(n, { x: q.x, y: q.y }); }
    return ORIG.get(n);
  }
  function notasMusica(g, t) {
    for (const n of NOTAS_M) {
      const u = (t - n.t0) / n.vida; if (u <= 0 || u >= 1) continue;
      const o = origenM(n), lado = n.f === "SD" ? 1 : -1, ph = 6.3 * hash(n.i * 0.77);
      const x = o.x + lado * (18 + 34 * u) + 6 * Math.sin(u * 6 + ph), y = o.y - 10 - 52 * u - 10 * u * u;
      const k = (n.f === "C" ? 0.32 : 0.5) * salida(clamp(u / 0.2)), al = (1 - tramo(u, 0.6, 1)) * (n.f === "C" ? 0.75 : 0.95);
      notaRedonda(g, x, y, k, 0.25 * Math.sin(u * 4 + ph), COL_MUS[n.i % 4], al);
    }
  }
  // Guillermo: una nota con pinchos por sílaba; la última se rompe y se cae
  const NOTAS_G = (() => { const L = []; let i = 0;
    for (let t0 = T.canta0 + 0.08; t0 < T.gHueco0 - 0.1; t0 += 0.3 + 0.1 * hash(i * 3.3)) L.push({ t0, vida: 1.05, i: i++ });
    for (let t0 = T.gHueco1 + 0.02; t0 < T.gRota - 0.08; t0 += 0.3) L.push({ t0, vida: 0.9, i: i++ });
    return L; })();
  const ORIG_G = new Map();
  const origenG = t => { if (!ORIG_G.has(t)) { const b = bocaGs(poseG(t)); ORIG_G.set(t, { x: b.x + 40, y: b.y - 4 }); } return ORIG_G.get(t); };
  function notasCanto(g, t) {
    for (const n of NOTAS_G) {
      const u = (t - n.t0) / n.vida; if (u <= 0 || u >= 1) continue;
      const o = origenG(n.t0), ang = -0.2 - 0.7 * hash(n.i * 3.1), d = 175 * salida(u);
      const x = o.x + Math.cos(ang) * d + 5 * Math.sin(t * 50 + n.i), y = o.y + Math.sin(ang) * d + 4 * Math.cos(t * 47 + n.i);
      notaPincho(g, x, y, 0.95 * salida(clamp(u / 0.15)), 0.4 * Math.sin(t * 13 + n.i) + 0.25, COL_G[n.i % 3], t, n.i, 1 - tramo(u, 0.65, 1));
    }
    // la nota rota: sale floja, se tuerce, se parte y se cae
    const u = fase(t, T.gRota, T.gRota + 1.1);
    if (u > 0 && u < 1) {
      const o = origenG(T.gRota), sube = salida(clamp(u / 0.3)), cae = clamp((u - 0.3) / 0.7);
      const x = o.x + 34 * sube + 14 * cae, y = o.y - 34 * sube + 150 * cae * cae;
      const gir = 0.25 + 1.6 * suave(clamp((u - 0.22) / 0.4)) + 0.6 * cae;
      notaPincho(g, x, y, 0.85 * salida(clamp(u / 0.12)), gir, "#b8c25a", t * 0.25, 99, 1 - tramo(u, 0.75, 1));
      // la grieta
      if (u > 0.25) { g.save(); g.translate(x, y); g.rotate(gir); g.globalAlpha = 1 - tramo(u, 0.75, 1); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.lineJoin = "miter";
        g.beginPath(); g.moveTo(-14, -2); g.lineTo(-7, 4); g.lineTo(-11, 9); g.lineTo(-3, 15); g.lineTo(-6, 21); g.stroke(); g.restore(); }
    }
  }
  // rayitas de sorpresa y el sudor de la vergüenza
  function rayitas(g, x, y, k, ang, n = 3, L = 12) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = k; g.strokeStyle = TINTA; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * 0.45; g.beginPath(); g.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); g.lineTo(Math.cos(a) * (8 + L), Math.sin(a) * (8 + L)); g.stroke(); }
    g.restore();
  }
  function efectos(g, t, pS, pG) {
    const cG = G.aPantalla(pG, G.centroCabeza(pG)), cS = SA.aPantalla(pS, SA.centroCabeza(pS));
    // el agudo le perfora el oído a Sara
    rayitas(g, cS.x - 58, cS.y - 34, campana(t, T.sMueca0 - 0.02, T.sMueca1 + 0.15), Math.PI + 0.5, 3, 10);
    // Guillermo se da cuenta
    rayitas(g, cG.x + 16, cG.y - 80, campana(t, T.gAbre - 0.02, T.gAbre + 0.4), -Math.PI / 2 - 0.2, 3, 12);
    rayitas(g, cG.x - 58, cG.y - 46, campana(t, T.gMira, T.gMira + 0.45), Math.PI + 0.55, 3, 12);
    // la vergüenza: una gota de sudor que resbala
    const kg = dentro(t, T.gRubor + 0.1, T.gRubor + 0.3, T.sOfrece, T.sOfrece + 0.3);
    if (kg > 0.01) {
      const u = ((t - T.gRubor) * 0.9) % 1, x = cG.x + 50, y = cG.y - 58 + 26 * u;
      g.save(); g.globalAlpha = kg * Math.sin(Math.PI * u); g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y - 9); g.quadraticCurveTo(x + 6, y, x, y + 6); g.quadraticCurveTo(x - 6, y, x, y - 9); g.fill(); g.stroke(); g.restore();
    }
  }

  /* =====================================================================================
   * CÁMARA
   * ===================================================================================== */
  const PLANOS = [
    [0, 1.0, 512, 300], [2.2, 1.0, 512, 300], [4.5, 1.12, 440, 272], [10.2, 1.12, 440, 272], [11.9, 1.04, 470, 286], [DUR, 1.06, 470, 290]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }

  /* =====================================================================================
   * PINTAR
   * ===================================================================================== */
  class GuillermoSaraAzotea extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !SA.listo()) return;
      if (!LISTO) { LISTO = true; FONDO = creaFondo(); BRILLO = creaBrillo(); CAPA = lienzo(W, H); FILO = lienzo(W, H); }
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const BASE0 = g.getTransform();
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      const CAMM = g.getTransform();
      g.drawImage(FONDO, -MX, -MY);
      vidaFondo(g, t);
      estrellaFugaz(g, t);
      bombillas(g, t);
      // sombras de los dos en la albardilla
      g.fillStyle = "rgba(10,12,30,0.35)"; g.beginPath(); g.ellipse(XS + 40, MURO - 7, 90, 5, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(XG + 40, MURO - 7, 95, 5, 0, 0, TAU); g.fill();

      // ---------- capa de los personajes, el móvil y el cable ----------
      const c = CAPA.getContext("2d");
      const cx0 = (CAMM.a * 180 + CAMM.e - BASE0.e) / BASE0.a, cy0 = (CAMM.d * 40 + CAMM.f - BASE0.f) / BASE0.d;
      const cx1 = (CAMM.a * 720 + CAMM.e - BASE0.e) / BASE0.a, cy1 = (CAMM.d * 545 + CAMM.f - BASE0.f) / BASE0.d;
      const bx = Math.max(0, Math.floor(cx0)), by = Math.max(0, Math.floor(cy0)), bw = Math.min(W, Math.ceil(cx1)) - bx, bh = Math.min(H, Math.ceil(cy1)) - by;
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "source-over"; c.globalAlpha = 1; c.clearRect(bx, by, bw, bh);
      c.setTransform(CAMM.a / BASE0.a, CAMM.b, CAMM.c, CAMM.d / BASE0.d, (CAMM.e - BASE0.e) / BASE0.a, (CAMM.f - BASE0.f) / BASE0.d);
      const CAMC = c.getTransform();
      const P = pose(t), pS = P.s, pG = P.g, au = auris(t, pS, pG);
      G.dibujar(c, pG, t);
      SA.dibujar(c, pS, t);
      movil(c, t);
      cables(c, t, pS, pG, au);
      // luz de noche: un velo frío (sin teñir la ropa negra) y el brillo del móvil en las piernas
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = "source-atop";
      c.fillStyle = "rgba(24,32,86,0.2)"; c.fillRect(bx, by, bw, bh);
      c.setTransform(CAMC);
      const mg = c.createRadialGradient(MOVIL.x, MOVIL.y, 4, MOVIL.x, MOVIL.y, 95);
      mg.addColorStop(0, `rgba(150,220,255,${0.3 + 0.06 * golpe(t)})`); mg.addColorStop(1, "rgba(150,220,255,0)");
      c.fillStyle = mg; c.fillRect(MOVIL.x - 95, MOVIL.y - 95, 190, 190);
      c.globalCompositeOperation = "source-over";
      // filo de luna: por el lado de la luna (arriba a la derecha), de la cintura para arriba
      g.setTransform(BASE0);
      g.drawImage(CAPA, bx, by, bw, bh, bx, by, bw, bh);
      const fc = FILO.getContext("2d"), d = 2.6;
      const fh = Math.max(0, Math.min(bh, Math.ceil((CAMM.d * (HIP_Y + 4) + CAMM.f - BASE0.f) / BASE0.d) - by));
      if (fh > 0) {
        fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = "source-over"; fc.clearRect(bx, by, bw, fh);
        fc.drawImage(CAPA, bx, by, bw, fh, bx, by, bw, fh);
        fc.globalCompositeOperation = "source-in"; fc.fillStyle = "#c9dcff"; fc.fillRect(bx, by, bw, fh);
        fc.globalCompositeOperation = "destination-out"; fc.drawImage(CAPA, bx, by, bw, fh, bx - d, by + d * 0.8, bw, fh);
        fc.globalCompositeOperation = "source-over";
        g.globalAlpha = 0.42; g.drawImage(FILO, bx, by, bw, fh, bx, by, bw, fh); g.globalAlpha = 1;
      }
      g.setTransform(CAMM);
      // notas y efectos (encima, sin velo)
      notasMusica(g, t);
      notasCanto(g, t);
      efectos(g, t, pS, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00130", nombre: "Guillermo y Sara · La azotea", crear: () => new GuillermoSaraAzotea() });
  // diagnóstico: distancia hombro → muñeca de cada mano (respecto a lo que da el brazo; el IK estira hasta 1,08)
  function diag(t) {
    const { s: pS, g: pG } = pose(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) return null; const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return +(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y) / ((lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L))).toFixed(2); };
    o.sC = dist(SA, pS, "cerca"); o.sL = dist(SA, pS, "lejos"); o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos");
    return o;
  }
  window.__A2D_00130 = { pose, poseS, poseG, auris, T, DUR, diag };
})();
