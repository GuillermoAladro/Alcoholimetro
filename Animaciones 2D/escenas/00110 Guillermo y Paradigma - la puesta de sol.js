"use strict";
/* 00110 · Guillermo y Paradigma · La puesta de sol
 *
 * Negro → una azotea al atardecer: Guillermo y Paradigma, sentados en el pretil con las piernas
 * colgando, se miran de tres cuartos y, entre los dos, el sol enorme y naranja baja despacio sobre la
 * ciudad (nubes encendidas, ventanas que se van encendiendo). Paradigma da un trago a su botellín;
 * Guillermo saca una patata de la bolsa, la lanza al aire y la caza con la boca, orgulloso →
 * Paradigma, con el botellín en la mano, señala el sol muy filosófico y habla despacio; Guillermo le
 * escucha, se acaricia la barbilla y asiente hondo, con los ojos entornados → una paloma entra por la
 * izquierda, cruza por delante del sol, se posa en la cabeza de Guillermo, se da la vuelta y arrulla.
 * Guillermo no se entera → Paradigma la ve, se le hinchan los mofletes y se tapa la boca para no reírse
 * → Guillermo saca otra patata, la admira a contraluz y la lanza… y la paloma estira el cuello y se la
 * roba en el aire. Guillermo cierra la boca sobre nada (¡ñac!) → se mira la mano, mira a un lado y a
 * otro y mira mal a Paradigma, que silba mirando al cielo → la paloma la mastica y le caen las migas en
 * la nariz; Guillermo mira hacia arriba y la paloma se asoma por su frente, boca abajo: se miran. Se la
 * traga y arrulla → Guillermo suspira, se encoge de hombros y Paradigma se ríe → los tres miran el sol,
 * con la cabeza ladeada igual, mientras se hunde detrás de la ciudad → negro.
 *
 * Sin textos (las notas del silbido y el arrullo son dibujos). Todo depende del tiempo absoluto.
 * Los dos personajes, la paloma y lo que llevan en las manos se pintan en una capa aparte: así se les
 * da una sombra de atardecer muy suave (sin teñir la camiseta negra) y un filo de luz del sol en el
 * lado que mira hacia él. Nada lee píxeles.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash, ruido } = M2;
  const G = Guillermo, PA = Paradigma;
  const TAU = Math.PI * 2, TINTA = "#141218";
  const S = 0.355, DUR = 14.7;
  const HIP_Y = 394, MURO = 409;                  // cadera en pantalla y canto del pretil
  const XP = 268, XG = 756;                       // pelvis de Paradigma (mira a la derecha) y de Guillermo (espejo)
  const SOL_X = 512, SOL_R = 44;
  const T = {
    // Paradigma: trago
    pSorbo0: 0.5, pSorbo1: 0.95, pSorboFin: 1.6, pBaja: 2.05,
    // Guillermo: primera patata (bien)
    gBolsa1: 0.85, gSaca1: 1.12, gArma1: 1.3, gSuelta1: 1.56, gBoca1: 2.12, gChulo0: 2.55, gChulo1: 2.95,
    // Paradigma señala; Guillermo escucha
    pApunta0: 2.6, pApunta1: 3.15, pHabla0: 3.15, pHabla1: 5.05, pBaja0: 5.1, pBaja1: 5.6,
    gMiraP: 3.0, gMenton0: 3.3, gMenton1: 5.55, gAsiente: [3.75, 4.4, 5.05],
    // la paloma llega
    pal0: 4.55, palPosa: 5.95, palGira0: 6.32, palGira1: 6.52, palArr0: 6.62, palArr1: 7.0,
    // Paradigma se da cuenta
    pVe: 6.18, pDoble: 6.4, pAguanta: 6.62, pTapa0: 6.72, pTapa1: 7.5, pMira2: 7.55,
    // segunda patata (robada)
    gBolsa2: 7.05, gSaca2: 7.3, gAdmira0: 7.48, gAdmira1: 7.85, gArma2: 7.86, gSuelta2: 8.03, roba: 8.3, gMuerde: 8.5,
    gAbre: 8.85, gMano0: 8.95, gMano1: 9.25, gIzq: 9.35, gDer: 9.58, gMiraP2: 9.82, pSilba0: 9.75, pSilba1: 10.35,
    cruje0: 10.02, cruje1: 10.5, migaNariz: 10.2, gArriba0: 10.38, gArriba1: 10.62,
    palAsoma0: 10.5, palAsoma1: 10.78, palTraga: 11.0, palVuelve: 11.12, palArr2: 11.3,
    gSuspira: 11.3, gEncoge0: 11.38, gEncoge1: 11.9, gCam: 11.5, pRisa0: 11.4, pRisa1: 12.1,
    todos: 12.25, ladeo0: 12.55, ladeo1: 13.3, fin: 13.95
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
  const bump = (t, lista, d) => { let o = 0; for (const tb of lista) o += campana(t, tb, tb + d); return o; };

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
  function resolutor(Rg, p) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) {
        if (Rg === G) { const b = Tr(o.bols === "cerca" ? BOLS_GC : BOLS_GL); return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0, 0, 0, 0), dobla: o.bols === "cerca" ? -1 : 1 }; }
        const r = Rg.manoReposo(p, o.bols); return { x: r.x, y: r.y, mu: r.mu, ang: 0, puno: 0, dedos: D(0, 0, 0, 0), dobla: r.dobla };
      }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.abs) { const f = offMano(m, o.ref || CENTRO); q = { x: o.abs.x - f.x, y: o.abs.y - f.y }; }
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(m, o.ref || CENTRO); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? 1 };
    };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.6, my: 0.1, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * LUZ DEL ATARDECER: el sol baja, el cielo se enciende y luego se apaga
   * ===================================================================================== */
  const solY = t => 150 + 272 * Math.pow(clamp(t / 14.5), 1.3);
  const ocaso = t => clamp(t / 14.2);                 // 0 tarde dorada → 1 anochecer
  const CIELOS = [
    [[0, "#4f63a8"], [0.34, "#c9799a"], [0.62, "#f7a15a"], [0.85, "#ffc871"], [1, "#ffe39a"]],
    [[0, "#3c3a86"], [0.36, "#b05a86"], [0.64, "#f27a48"], [0.86, "#ffad55"], [1, "#ffd27a"]],
    [[0, "#1d1a4a"], [0.38, "#5d2f68"], [0.66, "#bc4a5c"], [0.88, "#f0763e"], [1, "#ffab5a"]]
  ];
  const MX = 110, MY = 70;                            // margen alrededor de la pantalla (cámara)
  let LISTO = false, NUBES = null, CIUDAD = null, VENTANAS = null, PRETIL = null, ESTRELLAS = null;
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const CIELOS_RGB = CIELOS.map(st => st.map(([k, c]) => [k, hexRgb(c)]));
  function cielo(g, oc) {                  // degradado del cielo interpolado (sin lienzos que fundir)
    const kc = oc * 2, i0 = Math.min(1, Math.floor(kc)), f = suave(kc - i0), A = CIELOS_RGB[i0], B = CIELOS_RGB[i0 + 1];
    const gr = g.createLinearGradient(0, -MY, 0, MURO - 30);
    for (let i = 0; i < A.length; i++) { const c = A[i][1].map((v, j) => Math.round(lerp(v, B[i][1][j], f))); gr.addColorStop(A[i][0], `rgb(${c[0]},${c[1]},${c[2]})`); }
    g.fillStyle = gr; g.fillRect(-MX, -MY, W + 2 * MX, MURO + MY + 4);
  }
  // nubes alargadas (cirros) con la tripa encendida: dos tintes (tarde y anochecer) para fundirlos
  const NUBE_DEF = [
    { x: 120, y: 92, w: 300, h: 26, v: 4.0 }, { x: 640, y: 64, w: 360, h: 30, v: 3.0 }, { x: 380, y: 148, w: 240, h: 18, v: 5.0 },
    { x: 860, y: 138, w: 260, h: 22, v: 3.6 }, { x: -40, y: 196, w: 220, h: 16, v: 4.5 }, { x: 700, y: 214, w: 200, h: 14, v: 5.5 }
  ];
  function creaNubes() {
    const tintes = [{ cuerpo: "#f3b98a", luz: "#fff0c4", sombra: "#c98a95" }, { cuerpo: "#7e4a7c", luz: "#ff9a62", sombra: "#4c2f5e" }];
    return NUBE_DEF.map((n, i) => tintes.map(tn => {
      const c = lienzo(n.w + 40, n.h * 3 + 30), g = c.getContext("2d"), cy = n.h * 1.6 + 10;
      const bolas = [];
      for (let k = 0; k < 9; k++) { const u = k / 8; bolas.push({ x: 20 + u * n.w, y: cy - Math.sin(Math.PI * u) * n.h * 0.7 * (0.6 + 0.4 * hash(i * 7 + k)), r: n.h * (0.45 + 0.55 * Math.sin(Math.PI * u)) * (0.7 + 0.5 * hash(i * 13 + k)) }); }
      const forma = (dy, kr) => { g.beginPath(); for (const b of bolas) { g.moveTo(b.x + b.r * kr, b.y + dy); g.ellipse(b.x, b.y + dy, b.r * kr * 1.9, b.r * kr, 0, 0, TAU); } };
      g.fillStyle = tn.sombra; forma(3, 1); g.fill();
      g.fillStyle = tn.cuerpo; forma(0, 0.92); g.fill();
      g.save(); forma(0, 0.92); g.clip(); g.fillStyle = tn.luz; g.globalAlpha = 0.9; forma(n.h * 0.55, 0.85); g.fill(); g.restore();
      return c;
    }));
  }
  // ciudad: dos capas de siluetas (lejos, con bruma; cerca, oscura), más baja en el centro (allí se pone el sol)
  function siluetas(semilla, base, altoMin, altoMax, centroBajo, anchoMin, anchoMax) {
    const edificios = []; let x = -MX;
    let i = 0;
    while (x < W + MX) {
      const w = lerp(anchoMin, anchoMax, hash(semilla + i * 3.1));
      const xc = x + w / 2, dCentro = Math.abs(xc - SOL_X) / 260;
      const bajo = clamp(1 - dCentro) * centroBajo;
      const h = Math.max(10, lerp(altoMin, altoMax, Math.pow(hash(semilla + i * 7.7), 1.4)) - bajo);
      edificios.push({ x, w, h, techo: hash(semilla + i * 5.3) });
      x += w + (hash(semilla + i * 1.9) < 0.25 ? 4 : 0); i++;
    }
    return edificios.map(e => Object.assign(e, { top: base - e.h }));
  }
  const EDIF_LEJOS = siluetas(11, MURO + 2, 40, 120, 70, 26, 60);
  const EDIF_CERCA = siluetas(37, MURO + 2, 28, 150, 110, 34, 80);
  function pintaSilueta(g, edif, col, detalle) {
    g.fillStyle = col;
    for (const e of edif) {
      const x = e.x + MX, y = e.top + MY;
      g.fillRect(x, y, e.w, MURO + MY + 10 - y);
      if (e.techo > 0.7 && e.h > 50) { g.fillRect(x + e.w * 0.3, y - 10, 3, 10); g.fillRect(x + e.w * 0.3 - 6, y - 10, 15, 2); }       // antena
      else if (e.techo > 0.5 && e.h > 60 && detalle) {                                                                              // depósito de agua
        g.fillRect(x + e.w * 0.55, y - 16, 14, 12); g.beginPath(); g.moveTo(x + e.w * 0.55 - 2, y - 16); g.lineTo(x + e.w * 0.55 + 7, y - 24); g.lineTo(x + e.w * 0.55 + 16, y - 16); g.fill();
        g.fillRect(x + e.w * 0.55 + 2, y - 4, 2, 4); g.fillRect(x + e.w * 0.55 + 10, y - 4, 2, 4);
      } else if (e.techo > 0.35) { g.fillRect(x + 3, y - 4, e.w - 6, 4); }
    }
  }
  const SKY_Y0 = 236;                      // la ciudad (lejos y cerca) en un solo lienzo recortado por tinte
  function creaSkyline(tintes) {
    return tintes.map(([cl, cc]) => { const c = lienzo(W + 2 * MX, MURO + 12 - SKY_Y0), g = c.getContext("2d"); g.translate(0, -(SKY_Y0 + MY));
      pintaSilueta(g, EDIF_LEJOS, cl, false); pintaSilueta(g, EDIF_CERCA, cc, true); return c; });
  }
  function creaVentanas() {
    const v = [];
    EDIF_CERCA.forEach((e, i) => {
      const cols = Math.max(1, Math.floor((e.w - 8) / 10)), filas = Math.max(1, Math.floor((e.h - 14) / 13));
      for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
        const s = hash(i * 31 + f * 7 + c * 3);
        if (s < 0.55) continue;
        v.push({ x: e.x + 6 + c * 10, y: e.top + 8 + f * 13, t0: lerp(4.5, 13.2, hash(i * 17 + f * 5 + c)), cal: hash(i + f + c * 9) });
      }
    });
    return v;
  }
  function creaEstrellas() { const e = []; for (let i = 0; i < 26; i++) e.push({ x: hash(i * 3.7) * W, y: 8 + Math.pow(hash(i * 5.1), 1.6) * 150, r: 0.8 + hash(i * 9.3) * 1.2, ph: hash(i) * TAU, t0: 10.8 + hash(i * 2.3) * 2.6 }); return e; }
  // el pretil: albardilla de piedra (cara de arriba con el brillo del sol) y la fachada de ladrillo en sombra
  function creaPretil() {
    const c = lienzo(W + 2 * MX, H + MY + 40 - (MURO - 18) + MY), g = c.getContext("2d");
    const y0 = 0;                       // = MURO - 18 en el mundo
    const ox = MX;
    // albardilla
    g.fillStyle = "#b9907c"; g.fillRect(0, y0, c.width, 22);
    g.fillStyle = "#f6cf9c"; g.fillRect(0, y0, c.width, 5);
    g.fillStyle = "#8d6457"; g.fillRect(0, y0 + 18, c.width, 4);
    for (let x = -ox; x < W + ox; x += 92) { g.fillStyle = "#7d5a50"; g.fillRect(x + ox, y0 + 5, 2, 13); g.fillStyle = "rgba(255,230,190,0.5)"; g.fillRect(x + ox + 2, y0 + 5, 1, 13); }
    // ladrillo
    const yb = y0 + 22;
    g.fillStyle = "#7a4038"; g.fillRect(0, yb, c.width, c.height - yb);
    for (let f = 0, y = yb; y < c.height; f++, y += 14) {
      for (let x = -ox + (f % 2 ? -18 : 0); x < W + ox; x += 40) {
        const s = hash(f * 13.1 + x * 0.37);
        g.fillStyle = s < 0.33 ? "#86483e" : s < 0.66 ? "#743c35" : "#8e5145";
        g.fillRect(x + ox + 1, y + 1, 38, 12);
      }
    }
    g.fillStyle = "rgba(60,30,40,0.25)"; for (let f = 0, y = yb; y < c.height; f++, y += 14) g.fillRect(0, y, c.width, 1);
    // sombra bajo la albardilla y degradado de sombra de la fachada
    const gr = g.createLinearGradient(0, yb, 0, yb + 200);
    gr.addColorStop(0, "rgba(30,12,30,0.55)"); gr.addColorStop(0.15, "rgba(30,12,30,0.28)"); gr.addColorStop(1, "rgba(30,12,30,0.42)");
    g.fillStyle = gr; g.fillRect(0, yb, c.width, c.height - yb);
    // bajante de cobre a la derecha
    g.fillStyle = "#5e4a3a"; g.fillRect(950 + ox, yb, 9, c.height - yb); g.fillStyle = "rgba(255,190,130,0.35)"; g.fillRect(951 + ox, yb, 2, c.height - yb);
    for (const y of [yb + 40, yb + 120]) { g.fillStyle = "#3e3028"; g.fillRect(946 + ox, y, 17, 5); }
    return c;
  }

  /* ---------- el sol, su halo y sus rayos ---------- */
  function sol(g, t) {
    const y = solY(t), oc = ocaso(t);
    // halo grande (encima del cielo, debajo de las nubes)
    const r1 = 270 - 50 * oc;
    const gr = g.createRadialGradient(SOL_X, y, SOL_R * 0.6, SOL_X, y, r1);
    gr.addColorStop(0, `rgba(255,${Math.round(lerp(236, 170, oc))},${Math.round(lerp(160, 110, oc))},${lerp(0.7, 0.55, oc)})`);
    gr.addColorStop(0.35, `rgba(255,${Math.round(lerp(190, 120, oc))},90,${lerp(0.3, 0.25, oc)})`);
    gr.addColorStop(1, "rgba(255,120,80,0)");
    g.fillStyle = gr; g.fillRect(SOL_X - r1, y - r1, 2 * r1, 2 * r1);
    // rayos muy suaves que giran despacio
    g.save(); g.translate(SOL_X, y); g.rotate(t * 0.04);
    g.fillStyle = `rgba(255,236,190,${0.07 * (1 - 0.6 * oc)})`;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + 0.15 * Math.sin(t * 0.3 + i); g.beginPath(); g.moveTo(0, 0);
      g.lineTo(Math.cos(a - 0.05) * 420, Math.sin(a - 0.05) * 420); g.lineTo(Math.cos(a + 0.05) * 420, Math.sin(a + 0.05) * 420); g.closePath(); g.fill(); }
    g.restore();
    // disco: se achata un poco y se enrojece al llegar al horizonte
    const ach = 1 - 0.08 * tramo(y, 300, 400);
    g.save(); g.translate(SOL_X, y); g.scale(1, ach);
    const gd = g.createRadialGradient(-8, -10, 4, 0, 0, SOL_R);
    gd.addColorStop(0, lerp(0, 1, oc) < 0.5 ? "#fffbe6" : "#ffe1b0");
    gd.addColorStop(0.55, oc < 0.5 ? "#ffd56c" : "#ffa553");
    gd.addColorStop(1, oc < 0.6 ? "#ff9d3e" : "#ff6f3a");
    g.fillStyle = gd; g.beginPath(); g.arc(0, 0, SOL_R, 0, TAU); g.fill();
    // color que va cambiando sin saltos (encima del degradado)
    g.globalAlpha = 0.55 * oc; g.fillStyle = "#ff6a3a"; g.beginPath(); g.arc(0, 0, SOL_R, 0, TAU); g.fill();
    g.restore();
  }
  function nubes(g, t) {
    const oc = ocaso(t), k = suave(clamp((oc - 0.15) / 0.75));
    NUBE_DEF.forEach((n, i) => {
      const x = n.x + t * n.v - 20, y = n.y - n.h * 1.6 - 10;
      const [a, b] = NUBES[i];
      if (k < 0.995) { g.globalAlpha = 1 - k; g.drawImage(a, x, y); }
      if (k > 0.005) { g.globalAlpha = k; g.drawImage(b, x, y); }
    });
    g.globalAlpha = 1;
  }
  function pajarosLejos(g, t) {
    if (t > 4.6) return;
    g.save(); g.strokeStyle = "rgba(60,30,60,0.75)"; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const x = -30 + (t - 0.2) * 70 + i * 18, y = 70 + i * 9 + 4 * Math.sin(t * 1.3 + i), a = 3.5 * Math.sin(t * 9 + i * 1.7);
      g.beginPath(); g.moveTo(x - 6, y - a); g.quadraticCurveTo(x - 2, y - 2, x, y); g.quadraticCurveTo(x + 2, y - 2, x + 6, y - a); g.stroke();
    }
    g.restore();
  }
  function ventanas(g, t) {
    for (const v of VENTANAS) {
      const k = tramo(t, v.t0, v.t0 + 0.6); if (k <= 0.01) continue;
      g.fillStyle = v.cal < 0.5 ? `rgba(255,214,130,${0.85 * k})` : `rgba(255,236,190,${0.75 * k})`;
      g.fillRect(v.x, v.y, 5, 7);
    }
  }
  function estrellas(g, t) {
    for (const e of ESTRELLAS) {
      const k = tramo(t, e.t0, e.t0 + 1.2) * (0.7 + 0.3 * Math.sin(t * 3 + e.ph)); if (k <= 0.01) continue;
      g.fillStyle = `rgba(255,246,220,${0.8 * k})`; g.beginPath(); g.arc(e.x, e.y, e.r, 0, TAU); g.fill();
    }
  }

  /* =====================================================================================
   * OBJETOS: bolsa de patatas, patatas, botellines, migas
   * ===================================================================================== */
  function patata(g, x, y, a, k = 1, mordida = 0) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k);
    g.lineJoin = "round";
    const forma = () => { g.beginPath();
      for (let i = 0; i <= 12; i++) { const u = i / 12 * TAU, r = 1 + 0.12 * Math.sin(u * 3 + 1);
        const px = Math.cos(u) * 7.5 * r, py = Math.sin(u) * 5 * r;
        if (mordida > 0 && px > 7.5 - 15 * mordida) { const bx = 7.5 - 15 * mordida; if (i === 0) g.moveTo(bx, py * 0.6); else g.lineTo(bx + 1.5 * Math.sin(py), py * 0.8); continue; }
        if (i) g.lineTo(px, py); else g.moveTo(px, py); }
      g.closePath(); };
    if (mordida >= 0.98) { g.restore(); return; }
    forma(); g.fillStyle = "#f4c752"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "#e3a23a"; g.beginPath(); g.ellipse(2, 3.5, 7, 3, 0, 0, TAU); g.fill();
    g.fillStyle = "#fff0a8"; g.beginPath(); g.ellipse(-2, -2, 3.5, 1.6, -0.3, 0, TAU); g.fill();
    g.fillStyle = "#b8732a"; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-3 + i * 3, 1 - i * 0.8, 0.6, 0, TAU); g.fill(); }
    g.restore();
    forma(); g.lineWidth = 1.3; g.strokeStyle = "#7a4a1a"; g.stroke();
    g.restore();
  }
  // bolsa de patatas (sin letras): papel brillante rojo con un sol amarillo y una patata dibujada
  function bolsa(g, x, y, k, t) {
    // (x, y): esquina de arriba del lado del puño (la derecha en pantalla); la bolsa crece hacia la izquierda
    g.save(); g.translate(x, y); g.scale(k, k); g.lineJoin = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(2, 0); g.lineTo(2, 46); g.quadraticCurveTo(-19, 51, -40, 46); g.lineTo(-41, 0); g.closePath(); };
    cuerpo(); g.fillStyle = "#d9452e"; g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "#b8321f"; g.fillRect(-42, 30, 46, 20);
    g.fillStyle = "#ffd34a"; g.beginPath(); g.arc(-19, 22, 11, 0, TAU); g.fill();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(-19 + Math.cos(a) * 11, 22 + Math.sin(a) * 11); g.lineTo(-19 + Math.cos(a + 0.2) * 15, 22 + Math.sin(a + 0.2) * 15); g.lineTo(-19 + Math.cos(a + 0.4) * 11, 22 + Math.sin(a + 0.4) * 11); g.fill(); }
    g.restore();
    patata(g, -19, 22, -0.3, 0.85);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-36, 6, 3, 34);
    cuerpo(); g.lineWidth = 1.8; g.strokeStyle = "#5a1a12"; g.stroke();
    // boca abierta arrugada con patatas asomando
    g.fillStyle = "#3a1410"; g.beginPath(); g.ellipse(-19, 1, 20, 4.5, 0, 0, TAU); g.fill();
    patata(g, -26, -1, 0.4, 0.75); patata(g, -12, -2, -0.6, 0.7); patata(g, -19, 1, 0.1, 0.65);
    g.strokeStyle = "#5a1a12"; g.lineWidth = 1.6; g.beginPath();
    for (let i = 0; i <= 8; i++) { const xx = -41 + i * 5.4, yy = (i % 2 ? -3 : 0) + 3.5; if (i) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke();
    g.restore();
  }
  // botellín (sin letras): origen en la base, eje hacia -y, 60 de alto
  function botellin(g, verde) {
    g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-6.5, 0); g.lineTo(-6.5, -34); g.quadraticCurveTo(-6.5, -42, -2.6, -46); g.lineTo(-2.6, -58); g.lineTo(2.6, -58); g.lineTo(2.6, -46);
      g.quadraticCurveTo(6.5, -42, 6.5, -34); g.lineTo(6.5, 0); g.closePath(); };
    forma(); g.fillStyle = verde ? "#2f6b3a" : "#6a3818"; g.fill();
    g.save(); forma(); g.clip();
    g.fillStyle = "#f2e6c8"; g.fillRect(-7, -28, 14, 16); g.fillStyle = verde ? "#d14a3a" : "#2f5aa8"; g.fillRect(-7, -23, 14, 4);
    g.fillStyle = "#e9d9b4"; g.fillRect(-3, -54, 6, 4);
    g.fillStyle = "rgba(255,230,190,0.55)"; g.fillRect(-4.5, -40, 2, 38);
    g.restore();
    forma(); g.lineWidth = 1.5; g.strokeStyle = "#20120a"; g.stroke();
    g.fillStyle = "#c0a070"; g.fillRect(-3, -60, 6, 2.5); g.strokeRect(-3, -60, 6, 2.5);
  }

  /* =====================================================================================
   * PARADIGMA (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CP = {
    sol: E({ mx: 0.7, my: 0.0, c: 0.35, sd: 4, si: 6, sonr: 0.45, ancho: 0.9 }),
    sorbo: E({ mx: 0.6, my: -0.2, c: 0.8, sd: 8, si: 8, sonr: 0.1, ancho: 0.55, abre: 3 }),
    ahh: E({ mx: 0.6, my: 0.1, c: 1, h: 1, sd: 10, si: 10, sonr: 0.75, ancho: 0.95 }),
    filosofo: E({ mx: 0.85, my: -0.1, c: 0.3, sd: 6, si: 22, gi: 0.1, sonr: 0.25, ancho: 0.85 }),
    ve: E({ mx: 0.95, my: -0.5, iris: 0.9, sd: 22, si: 26, sonr: 0.05, ancho: 0.75, abre: 5 }),
    aguanta: E({ mx: -0.4, my: -0.55, c: 0.6, z: 0.5, sd: 14, si: 14, sonr: 0.3, ancho: 0.45, mof: 1, rub: 0.6 }),
    mira2: E({ mx: 0.95, my: -0.3, sd: 16, si: 20, sonr: 0.35, ancho: 0.55, mof: 0.55, rub: 0.4 }),
    pasma: E({ mx: 0.95, my: -0.55, iris: 0.85, sd: 26, si: 30, abre: 9, ancho: 0.6, mof: 0.15, rub: 0.3 }),
    silba: E({ mx: 0.2, my: -0.95, c: 0.1, sd: 18, si: 24, sonr: 0.0, ancho: 0.3, abre: 3, mof: 0.45, rub: 0.3 }),
    espia: E({ mx: 0.95, my: -0.45, c: 0.15, sd: 14, si: 22, sonr: 0.2, ancho: 0.4, mof: 0.8, rub: 0.5 }),
    risa: E({ mx: 0.6, my: -0.1, c: 1, h: 1, sd: 16, si: 16, sonr: 1, abre: 24, ancho: 1.05, rub: 0.5 }),
    final: E({ mx: 0.75, my: 0.05, c: 0.42, sd: 8, si: 8, sonr: 0.6, ancho: 0.95 })
  };
  const GUION_CP = [
    [T.pSorbo0, T.pSorbo1, "sorbo"], [T.pSorboFin, T.pSorboFin + 0.25, "ahh"], [T.pBaja, T.pBaja + 0.35, "sol"],
    [T.pApunta0 + 0.2, T.pApunta1, "filosofo"], [T.pBaja1, T.pBaja1 + 0.3, "sol"],
    [T.pVe, T.pVe + 0.12, "ve"], [T.pAguanta, T.pAguanta + 0.15, "aguanta"], [T.pMira2, T.pMira2 + 0.25, "mira2"],
    [T.roba - 0.04, T.roba + 0.1, "pasma"], [T.roba + 0.35, T.roba + 0.55, "aguanta"],
    [T.pSilba0, T.pSilba0 + 0.12, "silba"], [T.pSilba1, T.pSilba1 + 0.2, "espia"],
    [T.pRisa0, T.pRisa0 + 0.12, "risa"], [T.pRisa1, T.pRisa1 + 0.35, "final"]
  ];
  const CUER_P = {
    relax: { torso: 0.05, cab: 0.0 }, sorbo: { torso: 0.0, cab: -0.2 }, apunta: { torso: 0.09, cab: -0.04 },
    ve: { torso: 0.06, cab: 0.04 }, aguanta: { torso: 0.12, cab: 0.1 }, silba: { torso: 0.02, cab: -0.12 },
    risa: { torso: -0.05, cab: -0.14 }, ladeo: { torso: 0.04, cab: 0.22 }
  };
  const GUION_P = [
    [T.pSorbo0, T.pSorbo1, "sorbo"], [T.pSorboFin - 0.05, T.pBaja + 0.2, "relax"], [T.pApunta0, T.pApunta1, "apunta"],
    [T.pBaja0, T.pBaja1, "relax"], [T.pVe, T.pDoble, "ve"], [T.pAguanta, T.pAguanta + 0.2, "aguanta"], [T.pTapa1, T.pTapa1 + 0.3, "ve"],
    [T.pSilba0, T.pSilba0 + 0.15, "silba"], [T.pSilba1, T.pSilba1 + 0.25, "aguanta"], [T.pRisa0, T.pRisa0 + 0.15, "risa"],
    [T.pRisa1, T.pRisa1 + 0.35, "relax"], [T.ladeo0, T.ladeo1, "ladeo"]
  ];
  const PARP_P = [1.9, 4.0, 5.85, 8.95, 12.4, 13.6];
  // la mano del botellín: rasgos en pantalla
  const bocaPa = p => PA.aPantalla(p, PA.boca(p));
  const hombroP = (p, lado) => PA.aPantalla(p, PA.tronco(p)(lado === "cerca" ? PA.HOMBRO_C : PA.HOMBRO));
  // cómo se coge el botellín: ag = punto del botellín bajo el puño (0 base … -58 boca), angulo del eje (base → boca)
  function botellinP(t) {
    const sorbe = dentro(t, T.pSorbo0, T.pSorbo1, T.pSorboFin, T.pBaja);
    const ap = dentro(t, T.pApunta0, T.pApunta1, T.pBaja0, T.pBaja1);
    let ag = lerp(-44, -30, sorbe);
    ag = lerp(ag, -22, ap);
    let ang = -Math.PI / 2;
    ang = lerp(ang, Math.PI - 0.5, sorbe);
    // al señalar, el cuello del botellín apunta al sol (con el índice estirado encima)
    const haciaSol = -0.36 + 0.05 * Math.sin((t - T.pApunta1) * 1.7) * tramo(t, T.pApunta1, T.pApunta1 + 0.3);
    ang = lerp(ang, haciaSol, ap);
    return { ag, ang };
  }
  function poseP(t) {
    const b = linea(GUION_P, CUER_P, "relax", t);
    const respira = Math.sin(t * 1.7 + 0.8);
    const p = { x: XP, suelo: HIP_Y + (PA.SUELO - PA.PELVIS.y) * S * PA.K, s: S, tirasLimpias: true, piernas: {},
      pelvis: { x: PA.PELVIS.x, y: PA.PELVIS.y }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // habla despacio mientras señala: la cabeza acompaña
    const habla = dentro(t, T.pHabla0, T.pHabla0 + 0.2, T.pHabla1 - 0.2, T.pHabla1);
    p.cabeza.ang += 0.04 * Math.sin((t - T.pHabla0) * 3.1) * habla;
    // aguanta la risa: hombros que tiemblan
    const tiembla = dentro(t, T.pAguanta, T.pAguanta + 0.1, T.pTapa1 - 0.1, T.pTapa1 + 0.2) + 0.7 * dentro(t, T.roba + 0.3, T.roba + 0.45, T.pSilba0 - 0.05, T.pSilba0 + 0.05)
      + 0.6 * dentro(t, T.pSilba1, T.pSilba1 + 0.15, T.pRisa0 - 0.05, T.pRisa0);
    p.torso += 0.02 * Math.sin(t * 31) * tiembla; p.cabeza.ang += 0.015 * Math.sin(t * 31 + 1) * tiembla;
    // risa abierta: sacudidas
    const rie = dentro(t, T.pRisa0, T.pRisa0 + 0.1, T.pRisa1 - 0.2, T.pRisa1);
    p.torso -= 0.035 * Math.abs(Math.sin((t - T.pRisa0) * 11)) * rie; p.cabeza.ang -= 0.04 * Math.abs(Math.sin((t - T.pRisa0) * 11 + 0.6)) * rie;
    // piernas colgando del pretil, balanceándose sin prisa
    const quietas = 0.6 * dentro(t, T.pVe, T.pVe + 0.2, T.pRisa1, T.pRisa1 + 0.4);
    for (const [lado, fase0, adelanta] of [["cerca", 0, 0], ["lejos", 1.9, -12]]) {
      const cad = PA.CADERA[lado], L = lado === "cerca" ? 563 : 560, th = L / 2;
      const sw = Math.sin(t * 1.55 + fase0) * (1 - quietas) + 0.3 * Math.sin(t * 7 + fase0) * rie;
      const rod = { x: cad.x + th * 0.985 + adelanta, y: cad.y + 18 };
      const a = 0.14 + 0.2 * sw;
      p.piernas[lado] = { tob: { x: rod.x + Math.sin(a) * th, y: rod.y + Math.cos(a) * th }, ang: 0.32 + 0.28 * sw };
    }
    const e = linea(GUION_CP, CP, "sol", t);
    // habla: la boca se abre y se cierra despacio
    if (habla > 0) { const w = Math.max(0, Math.sin((t - T.pHabla0) * 9.5)) * (0.6 + 0.4 * Math.sin((t - T.pHabla0) * 2.3)); e.abre += 8 * w * habla; e.ancho = lerp(e.ancho, 0.75, habla * w); }
    if (rie > 0) e.abre += 7 * Math.sin((t - T.pRisa0) * 11) * rie;
    p.cara = cara(e, parpadeo(t, PARP_P));
    p.rojo = 0.25 * (dentro(t, T.pAguanta, T.pAguanta + 0.2, T.pTapa1, T.pTapa1 + 0.3) + dentro(t, T.pRisa0, T.pRisa0 + 0.2, T.pRisa1, T.pRisa1 + 0.3));
    manosP(p, t);
    return p;
  }
  function manosP(p, t) {
    const r = resolutor(PA, p);
    const bot = botellinP(t);
    const AGARRA = D(0.25, 0.2, 0.2, 0.2), SENALA = D5(0.3, 1, 0.15, 0.1, 0.1);
    // el puño del botellín: en el muslo, en la boca o señalando el sol
    const muslo = () => { const h = hombroP(p, "lejos"); return { x: h.x + 34, y: h.y + 70 }; };
    const enBoca = () => { const bo = bocaPa(p); const d = { x: Math.cos(bot.ang), y: Math.sin(bot.ang) }; const L = -bot.ag - 58; return { x: bo.x - d.x * (-L) + 2, y: bo.y - d.y * (-L) - 2 }; };
    const apunta = () => { const h = hombroP(p, "lejos"); return { x: h.x + 98, y: h.y - 44 }; };
    const apunta2 = () => { const h = hombroP(p, "lejos"); return { x: h.x + 104, y: h.y - 52 }; };
    const apunta3 = () => { const h = hombroP(p, "lejos"); return { x: h.x + 96, y: h.y - 36 }; };
    const PL = [
      [0, 0, { scr: muslo, mu: 2.05, dedos: AGARRA, dobla: 1 }],
      [T.pSorbo0, T.pSorbo1, { scr: enBoca, mu: 1.75, ang: 0, dedos: AGARRA, dobla: -1 }],
      [T.pSorboFin, T.pBaja, { scr: muslo, mu: 2.05, dedos: AGARRA, dobla: 1 }],
      [T.pApunta0, T.pApunta1, { scr: apunta, mu: 2.75, dedos: SENALA, dobla: 1 }],
      [3.7, 4.4, { scr: apunta2, mu: 2.8, dedos: SENALA, dobla: 1 }],
      [4.4, 5.0, { scr: apunta3, mu: 2.72, dedos: SENALA, dobla: 1 }],
      [T.pBaja0, T.pBaja1, { scr: muslo, mu: 2.05, dedos: AGARRA, dobla: 1 }],
      [T.ladeo0 - 0.3, T.ladeo0 + 0.3, { scr: () => { const m = muslo(); return { x: m.x + 18, y: m.y - 30 }; }, mu: 2.2, dedos: AGARRA, dobla: 1 }]
    ];
    const L = pista(PL, t, r);
    // mano cercana: en el bolsillo; se tapa la boca para no reírse
    const tapa = () => { const bo = bocaPa(p); return { x: bo.x + 2, y: bo.y + 4 }; };
    const PC = [
      [0, 0, { bols: "cerca" }],
      [T.pTapa0, T.pTapa0 + 0.22, { scr: tapa, mu: 1.95, dedos: D(0.8, 1, 1, 1), dobla: -1 }, salida],
      [T.pTapa1, T.pTapa1 + 0.35, { bols: "cerca" }],
      [T.pRisa0 + 0.05, T.pRisa0 + 0.3, { scr: () => { const h = hombroP(p, "cerca"); return { x: h.x + 66, y: h.y + 76 }; }, mu: 2.2, dedos: D(0.6, 0.85, 0.85, 0.85), dobla: -1 }],
      [T.pRisa1, T.pRisa1 + 0.35, { bols: "cerca" }]
    ];
    const C = pista(PC, t, r);
    p.manoLejos = { x: L.x, y: L.y, mu: L.mu, ang: L.ang, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    p.manoCerca = { x: C.x, y: C.y, mu: C.mu, ang: C.ang, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
  }

  /* =====================================================================================
   * GUILLERMO (derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CG = {
    sol: E({ mx: 0.6, my: 0.2, c: 0.35, sd: 4, si: 4, sonr: 0.45, ancho: 0.95 }),
    bolsa: E({ mx: -0.3, my: 0.95, sd: 8, si: 8, sonr: 0.55, ancho: 0.95 }),
    arriba: E({ mx: 0.3, my: -0.95, sd: 16, si: 16, sonr: 0.3, ancho: 0.85, abre: 6 }),
    bocaza: E({ mx: 0.25, my: -0.95, sd: 20, si: 20, abre: 42, ancho: 0.85, sonr: 0.1, lengua: 0.6 }),
    crunch: E({ mx: 0.4, my: 0.1, c: 0.65, h: 0.6, sd: 10, si: 10, sonr: 0.6, ancho: 0.8, mof: 0.45 }),
    chulo: E({ mx: -0.25, my: 0, c: 0.3, sd: 18, gd: 0.1, si: 6, sonr: 0.9, ancho: 1.05 }),
    escucha: E({ mx: 0.95, my: 0.15, sd: 10, si: 12, sonr: 0.35, ancho: 0.85 }),
    sabio: E({ mx: 0.7, my: 0.2, c: 0.55, sd: 2, gd: -0.05, si: 16, gi: 0.08, sonr: -0.05, ancho: 0.55 }),
    paz: E({ mx: 0.6, my: 0.25, c: 0.72, h: 0.45, sd: 6, si: 6, sonr: 0.6, ancho: 0.9 }),
    admira: E({ mx: 0.55, my: -0.2, cd: 0.85, sd: 6, si: 22, gi: 0.1, sonr: 0.55, ancho: 0.9 }),
    confiado: E({ mx: 0.2, my: -0.9, c: 1, sd: 22, si: 22, abre: 44, ancho: 0.9, sonr: 0.3, lengua: 0.5 }),
    nanc: E({ c: 1, z: 0.7, sd: 4, si: 4, sonr: 0.25, ancho: 0.8 }),
    raro: E({ mx: 0.5, my: 0.3, sd: -4, gd: -0.12, si: 18, gi: 0.12, sonr: -0.2, ancho: 0.55 }),
    mano: E({ mx: 0.65, my: 0.75, sd: 12, si: 2, gi: -0.05, sonr: -0.15, ancho: 0.6 }),
    izq: E({ mx: 1, my: 0.1, sd: 12, si: 12, sonr: -0.1, ancho: 0.6 }),
    der: E({ mx: -1, my: 0.1, sd: 12, si: 12, sonr: -0.1, ancho: 0.6 }),
    sospecha: E({ mx: 0.95, my: 0.05, c: 0.45, sd: -6, gd: -0.14, si: 16, gi: 0.1, sonr: -0.15, ancho: 0.55 }),
    nariz: E({ mx: 0.3, my: 0.55, iris: 0.9, sd: 22, si: 22, sonr: -0.1, ancho: 0.5 }),
    arribaP: E({ mx: 0.35, my: -1, iris: 0.85, sd: 26, si: 26, sonr: 0.0, ancho: 0.5, abre: 4 }),
    resigna: E({ mx: -0.25, my: 0.05, c: 0.45, sd: 4, gd: -0.06, si: 14, sonr: 0.3, ancho: 0.85 }),
    final: E({ mx: 0.65, my: 0.2, c: 0.4, sd: 6, si: 6, sonr: 0.6, ancho: 0.95 })
  };
  const GUION_CG = [
    [T.gBolsa1 - 0.1, T.gBolsa1 + 0.1, "bolsa"], [T.gArma1, T.gArma1 + 0.15, "arriba"], [T.gSuelta1 + 0.1, T.gSuelta1 + 0.3, "bocaza"],
    [T.gBoca1, T.gBoca1 + 0.08, "crunch"], [T.gChulo0, T.gChulo0 + 0.2, "chulo"], [T.gMiraP, T.gMiraP + 0.25, "escucha"],
    [T.gMenton0, T.gMenton0 + 0.4, "sabio"], [T.gMenton1, T.gMenton1 + 0.4, "paz"],
    [T.gBolsa2 - 0.1, T.gBolsa2 + 0.1, "bolsa"], [T.gAdmira0, T.gAdmira0 + 0.15, "admira"], [T.gArma2, T.gArma2 + 0.12, "arriba"],
    [T.gSuelta2 + 0.05, T.gSuelta2 + 0.2, "confiado"], [T.gMuerde - 0.05, T.gMuerde + 0.03, "nanc"], [T.gAbre, T.gAbre + 0.12, "raro"],
    [T.gMano0, T.gMano0 + 0.15, "mano"], [T.gIzq - 0.03, T.gIzq + 0.1, "izq"], [T.gDer - 0.03, T.gDer + 0.1, "der"],
    [T.gMiraP2 - 0.05, T.gMiraP2 + 0.15, "sospecha"], [T.migaNariz, T.migaNariz + 0.08, "nariz"], [T.gArriba0, T.gArriba1, "arribaP"],
    [T.gSuspira, T.gSuspira + 0.25, "resigna"], [T.todos, T.todos + 0.45, "final"]
  ];
  const CUER_G = {
    relax: { torso: 0.05, cab: 0.0 }, bolsa: { torso: 0.13, cab: 0.16 }, arriba: { torso: 0.0, cab: -0.14 }, atrapa: { torso: -0.05, cab: -0.3 },
    escucha: { torso: 0.06, cab: 0.04 }, sabio: { torso: 0.08, cab: 0.03 }, admira: { torso: 0.02, cab: -0.06 },
    busca: { torso: 0.07, cab: 0.08 }, arribaP: { torso: 0.0, cab: -0.1 }, ladeo: { torso: 0.05, cab: -0.22 }
  };
  const GUION_G = [
    [T.gBolsa1 - 0.1, T.gBolsa1 + 0.15, "bolsa"], [T.gArma1, T.gArma1 + 0.2, "arriba"], [T.gSuelta1 + 0.1, T.gSuelta1 + 0.35, "atrapa"],
    [T.gBoca1 + 0.05, T.gBoca1 + 0.4, "relax"], [T.gMiraP, T.gMiraP + 0.3, "escucha"], [T.gMenton0, T.gMenton0 + 0.3, "sabio"],
    [T.gMenton1, T.gMenton1 + 0.4, "relax"], [T.gBolsa2 - 0.1, T.gBolsa2 + 0.15, "bolsa"], [T.gAdmira0, T.gAdmira0 + 0.2, "admira"],
    [T.gArma2, T.gArma2 + 0.12, "arriba"], [T.gSuelta2, T.gSuelta2 + 0.25, "atrapa"], [T.gAbre, T.gAbre + 0.2, "relax"],
    [T.gMano0, T.gMano0 + 0.15, "busca"], [T.gIzq, T.gIzq + 0.15, "relax"], [T.migaNariz, T.migaNariz + 0.1, "relax"],
    [T.gArriba0, T.gArriba1, "arribaP"], [T.gSuspira, T.gSuspira + 0.3, "relax"], [T.ladeo0, T.ladeo1, "ladeo"]
  ];
  const PARP_G = [0.6, 2.9, 6.2, 9.2, 10.95, 11.7, 12.9];
  const bocaGs = p => G.aPantalla(p, G.boca(p));
  const coronilla = p => G.aPantalla(p, G.cabeza(p).a({ x: 700, y: 284 }));
  const narizG = p => G.aPantalla(p, G.cabeza(p).a({ x: 850, y: 702 }));
  const hombroG = (p, lado) => G.aPantalla(p, G.tronco(p)(lado === "cerca" ? G.HOMBRO_C : G.HOMBRO));
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "relax", t);
    const respira = Math.sin(t * 2.0);
    const p = { x: XG, suelo: HIP_Y + (G.SUELO - G.PELVIS.y) * S, s: S, espejo: true, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // asiente hondo mientras escucha (cabeceos lentos)
    p.cabeza.ang += 0.13 * bump(t, T.gAsiente, 0.55); p.cabeza.dy += 6 * bump(t, T.gAsiente, 0.55);
    // la paloma aterriza: la cabeza cede un poco
    p.cabeza.dy += 5 * amort(t, T.palPosa, 7, 18); p.cabeza.ang += 0.02 * amort(t, T.palPosa, 7, 18);
    // masticar (primera patata) y el ñac sobre nada
    const mast = dentro(t, T.gBoca1 + 0.03, T.gBoca1 + 0.1, T.gChulo1 - 0.1, T.gChulo1);
    p.cabeza.dy += 2 * Math.sin((t - T.gBoca1) * 13) * mast;
    const nanc = dentro(t, T.gMuerde, T.gMuerde + 0.04, T.gAbre - 0.15, T.gAbre);
    p.cabeza.dy += 1.5 * Math.sin((t - T.gMuerde) * 14) * nanc;
    // mira a un lado y a otro
    p.cabeza.dx += 6 * (tramo(t, T.gIzq, T.gIzq + 0.12) - tramo(t, T.gDer, T.gDer + 0.12)) * (1 - tramo(t, T.gMiraP2, T.gMiraP2 + 0.2));
    // encogerse de hombros
    const enc = campana(t, T.gEncoge0, T.gEncoge1);
    p.torsoEsc.y += 0.03 * enc; p.cabeza.dy -= 4 * enc;
    // suspiro
    const sus = campana(t, T.gSuspira - 0.15, T.gSuspira + 0.45);
    p.torsoEsc.y += 0.02 * sus;
    // piernas colgando
    const quietas = dentro(t, T.migaNariz - 0.1, T.migaNariz + 0.1, T.palVuelve, T.palVuelve + 0.3) + 0.5 * dentro(t, T.gSuelta2, T.gSuelta2 + 0.1, T.gAbre, T.gAbre + 0.2);
    const patalea = campana(t, T.gBoca1, T.gBoca1 + 0.5);
    for (const [lado, fase0, adelanta] of [["cerca", 0.7, 0], ["lejos", 2.6, -10]]) {
      const cad = G.CADERA[lado], th = 541 / 2;
      const sw = Math.sin(t * 1.75 + fase0) * (1 - clamp(quietas)) + 0.6 * Math.sin(t * 15 + fase0) * patalea;
      const rod = { x: cad.x + th * 0.985 + adelanta, y: cad.y + 18 };
      const a = 0.14 + 0.2 * sw;
      p.piernas[lado] = { tob: { x: rod.x + Math.sin(a) * th, y: rod.y + Math.cos(a) * th }, ang: 0.32 + 0.28 * sw };
    }
    const e = linea(GUION_CG, CG, "sol", t);
    // masticar: mofletes y boca
    if (mast > 0) { const w = Math.sin((t - T.gBoca1) * 13); e.abre = Math.max(0, e.abre + 3 * w * mast); e.mof = lerp(e.mof, 0.4 + 0.25 * w, mast); }
    if (nanc > 0) { const w = Math.sin((t - T.gMuerde) * 14); e.abre = Math.max(0, e.abre + 2 * w * nanc); }
    // asiente: los ojos se entornan en cada cabeceo
    e.c = Math.max(e.c, 0.15 * bump(t, T.gAsiente, 0.55));
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.12 * dentro(t, T.gMiraP2 - 0.1, T.gMiraP2 + 0.1, T.migaNariz, T.migaNariz + 0.2);
    manosG(p, t);
    return p;
  }
  // los dos objetivos de la mano de las patatas (marco de la hoja: él mira hacia +x)
  const BOLSA_PUNO = { x: 250, y: 590 };            // puño cercano agarrando la bolsa (hoja)
  function manosG(p, t) {
    const r = resolutor(G, p);
    const AGARRA = D(0.2, 0.15, 0.15, 0.15), PELLIZCO = D5(0.62, 0.58, 0.25, 0.18, 0.15), ABIERTA = D(0.9, 1, 1, 1), MENTON = D5(0.9, 0.55, 0.15, 0.1, 0.1);
    // mano cercana: sujeta la bolsa en el regazo (sube un poco al encogerse de hombros)
    const enc = campana(t, T.gEncoge0, T.gEncoge1);
    const C = r({ abs: { x: BOLSA_PUNO.x + 4 * enc, y: BOLSA_PUNO.y - 10 * enc }, mu: -1.9, dedos: AGARRA, dobla: -1 });
    // mano lejana: patatas, barbilla y mano vacía
    const bolsaBoca = () => { const q = bolsaPunto(p); return { x: q.x - 19, y: q.y + 4 }; };
    const bolsaArriba = () => { const q = bolsaPunto(p); return { x: q.x - 22, y: q.y - 18 }; };
    const reposo = { abs: { x: 425, y: 612 }, mu: -1.3, dedos: D(0.5, 0.55, 0.55, 0.55), dobla: 1 };
    const armaAbajo = { abs: { x: 462, y: 498 }, ref: PINZA, mu: -1.15, dedos: PELLIZCO, dobla: 1 };
    const armaArriba = { abs: { x: 478, y: 452 }, ref: PINZA, mu: -1.45, dedos: PELLIZCO, dobla: 1 };
    const suelta = { abs: { x: 482, y: 440 }, ref: PINZA, mu: -1.55, dedos: D5(0.85, 0.85, 0.6, 0.5, 0.45), dobla: 1 };
    const menton = () => { const bo = bocaGs(p); return { x: bo.x - 2, y: bo.y + 24 }; };
    const admira = { abs: { x: 520, y: 262 }, ref: PINZA, mu: -0.95, dedos: PELLIZCO, dobla: 1 };
    const palma = { abs: { x: 470, y: 440 }, mu: 0.55, dedos: ABIERTA, dobla: 1 };
    const encoge = { abs: { x: 488, y: 470 }, mu: 0.75, dedos: ABIERTA, dobla: 1 };
    const PL = [
      [0, 0, reposo],
      [T.gBolsa1 - 0.12, T.gBolsa1 + 0.1, { scr: bolsaBoca, ref: PINZA, mu: -0.55, dedos: D5(0.7, 0.7, 0.5, 0.4, 0.4), dobla: 1 }],
      [T.gSaca1 - 0.04, T.gSaca1 + 0.14, { scr: bolsaArriba, ref: PINZA, mu: -0.65, dedos: PELLIZCO, dobla: 1 }],
      [T.gArma1 - 0.04, T.gArma1 + 0.12, armaAbajo],
      [T.gSuelta1 - 0.1, T.gSuelta1 - 0.01, armaArriba, salida], [T.gSuelta1, T.gSuelta1 + 0.06, suelta],
      [T.gSuelta1 + 0.25, T.gSuelta1 + 0.6, reposo],
      [T.gMenton0, T.gMenton0 + 0.35, { scr: menton, mu: 1.25, dedos: MENTON, dobla: -1 }],
      [T.gMenton1, T.gMenton1 + 0.4, reposo],
      [T.gBolsa2 - 0.12, T.gBolsa2 + 0.1, { scr: bolsaBoca, ref: PINZA, mu: -0.55, dedos: D5(0.7, 0.7, 0.5, 0.4, 0.4), dobla: 1 }],
      [T.gSaca2 - 0.04, T.gSaca2 + 0.12, { scr: bolsaArriba, ref: PINZA, mu: -0.65, dedos: PELLIZCO, dobla: 1 }],
      [T.gAdmira0 - 0.02, T.gAdmira0 + 0.22, admira],
      [T.gArma2 - 0.06, T.gArma2 + 0.07, armaAbajo],
      [T.gSuelta2 - 0.1, T.gSuelta2 - 0.01, armaArriba, salida], [T.gSuelta2, T.gSuelta2 + 0.06, suelta],
      [T.gSuelta2 + 0.25, T.gSuelta2 + 0.55, reposo],
      [T.gMano0, T.gMano0 + 0.22, palma],
      [T.gMano1 + 0.1, T.gMano1 + 0.4, reposo],
      [T.gEncoge0, T.gEncoge0 + 0.18, encoge, salida],
      [T.gEncoge1 - 0.05, T.gEncoge1 + 0.3, reposo]
    ];
    const L = pista(PL, t, r);
    p.manoCerca = { x: C.x, y: C.y, mu: C.mu, ang: C.ang, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, mu: L.mu, ang: L.ang, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
  }
  // la bolsa cuelga del puño cercano: esquina de arriba (pantalla)
  function bolsaPunto(p) {
    const f = G.aPantalla(p, G.tronco(p)({ x: 0, y: 0 }));   // (no se usa: la bolsa sigue a la mano fija)
    void f;
    const q = G.aPantalla(p, BOLSA_PUNO);
    return { x: q.x + 5, y: q.y - 22 };
  }

  /* =====================================================================================
   * LAS PATATAS: la primera, a la boca; la segunda, al pico de la paloma
   * ===================================================================================== */
  const cacheSuelta = {};
  function sueltaEn(n) {
    if (!cacheSuelta[n]) { const tt = n === 1 ? T.gSuelta1 : T.gSuelta2, p = poseG(tt); cacheSuelta[n] = ptMano(G, p, p.manoLejos, PINZA); }
    return cacheSuelta[n];
  }
  let ALTO2 = null;
  const apice2 = () => { if (!ALTO2) { const c = coronilla(poseG(T.roba)); ALTO2 = { x: c.x - 46, y: c.y - 12 }; } return ALTO2; };
  function patata1(t, pG) {
    if (t < T.gSaca1 || t >= T.gBoca1) return null;
    if (t < T.gSuelta1) { const q = ptMano(G, pG, pG.manoLejos, PINZA); return { x: q.x, y: q.y, a: 0.4, mano: true }; }
    const L = sueltaEn(1), M = bocaGs(poseG(T.gBoca1)), cima = M.y - 118;
    const u = fase(t, T.gSuelta1, T.gBoca1), ua = 0.58;
    const x = lerp(L.x, M.x + 2, u);
    const y = u < ua ? cima + (L.y - cima) * Math.pow(1 - u / ua, 2) : cima + (M.y + 9 - cima) * Math.pow((u - ua) / (1 - ua), 2);
    return { x, y, a: 0.4 + (t - T.gSuelta1) * 9, k: 1 - 0.6 * tramo(t, T.gBoca1 - 0.07, T.gBoca1) };
  }
  function patata2(t, pG, pal) {
    if (t < T.gSaca2 || t >= T.palTraga) return null;
    if (t < T.gSuelta2) { const q = ptMano(G, pG, pG.manoLejos, PINZA); return { x: q.x, y: q.y, a: 0.4, mano: true }; }
    if (t < T.roba) {
      const L = sueltaEn(2), A = apice2(), u = fase(t, T.gSuelta2, T.roba);
      return { x: lerp(L.x, A.x, u), y: A.y + (L.y - A.y) * Math.pow(1 - u, 2), a: 0.4 + (t - T.gSuelta2) * 9 };
    }
    return { pico: true };                       // la lleva la paloma
  }

  /* =====================================================================================
   * LA PALOMA (original: gris azulada, cuello tornasolado, ojo naranja)
   * Dibujo local: mira a +x, origen entre las patas, y hacia arriba negativo.
   * ===================================================================================== */
  const H0 = { x: 13, y: -42 }, N0 = { x: 5, y: -29 }, HOMBRO_PAL = { x: 2, y: -29 };
  const ESC_PAL = 1.25;
  function ala(g, phi, Lw, cw, lejos) {
    g.save(); g.translate(HOMBRO_PAL.x, HOMBRO_PAL.y); g.rotate(phi);
    const forma = () => { g.beginPath(); g.moveTo(0, -3); g.quadraticCurveTo(Lw * 0.45, -cw * 0.75, Lw, -1.5);
      for (let i = 0; i < 4; i++) { const xx = Lw - i * Lw * 0.09; g.lineTo(xx - 2, 2 + i * 1.8); g.lineTo(xx - Lw * 0.06, 0.6 + i * 1.6); }
      g.quadraticCurveTo(Lw * 0.45, cw * 0.65, 0, 4); g.closePath(); };
    forma(); g.fillStyle = lejos ? "#7f889c" : "#a9b2c4"; g.fill();
    g.save(); forma(); g.clip();
    g.fillStyle = lejos ? "#3a3f4c" : "#3c4250";
    g.fillRect(Lw * 0.42, -cw, Lw * 0.07, cw * 2); g.fillRect(Lw * 0.56, -cw, Lw * 0.07, cw * 2);
    g.fillStyle = lejos ? "#5a6172" : "#7e879a"; g.fillRect(Lw * 0.72, -cw, Lw, cw * 2);
    g.restore();
    forma(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  function paloma(g, e) {
    g.save(); g.translate(e.x, e.y); g.rotate(e.ang); g.scale(e.dir * e.esc, e.esc); g.lineJoin = "round"; g.lineCap = "round";
    const alas = e.alas, phiVuelo = -1.95 - (1 - e.aleteo) / 2 * 2.05, phiPleg = -3.52;
    const phi = lerp(phiPleg, phiVuelo, alas), Lw = lerp(34, 44, alas), cw = lerp(11, 15, alas);
    // ala lejana (solo al volar)
    if (alas > 0.05) { g.save(); g.globalAlpha = clamp(alas * 1.5); ala(g, phi - 0.18, Lw * 0.95, cw, true); g.restore(); }
    // patas
    if (e.patas > 0.02) {
      g.save(); g.strokeStyle = "#d9656e"; g.lineWidth = 2.4; g.globalAlpha = clamp(e.patas * 2);
      const del = 1 - e.patas;
      for (const [x0, x1] of [[-2, -2], [4, 5]]) {
        const fx = x1 + 10 * del * 0.6, fy = -10 * del;
        g.beginPath(); g.moveTo(x0, -9); g.lineTo(fx, fy); g.stroke();
        g.lineWidth = 1.8; g.beginPath(); g.moveTo(fx - 2.5, fy + 0.4); g.lineTo(fx + 4, fy + 0.4); g.moveTo(fx, fy); g.lineTo(fx + 3, fy - 1.5); g.stroke(); g.lineWidth = 2.4;
      }
      g.restore();
    }
    // cola en abanico
    const abanico = 0.5 + 0.5 * alas;
    g.beginPath(); g.moveTo(-17, -19); g.lineTo(-41, -24 - 3 * abanico); g.quadraticCurveTo(-44, -18, -40, -12 + 3 * abanico); g.lineTo(-16, -13); g.closePath();
    g.fillStyle = "#7a8396"; g.fill();
    g.save(); g.clip(); g.fillStyle = "#2f343e"; g.fillRect(-46, -30, 8, 24); g.restore();
    g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    // cuerpo (la pechuga se hincha al arrullar)
    const pe = e.pecho || 0;
    const cuerpo = () => { g.beginPath(); g.moveTo(9, -31); g.bezierCurveTo(16 + 4 * pe, -27, 16 + 5 * pe, -14, 8, -9);
      g.bezierCurveTo(1, -5, -10, -7, -17, -13); g.bezierCurveTo(-23, -17, -22, -24, -16, -27); g.bezierCurveTo(-9, -32, 2, -34, 9, -31); g.closePath(); };
    cuerpo(); g.fillStyle = "#98a2b6"; g.fill();
    g.save(); cuerpo(); g.clip(); g.fillStyle = "#b5bdcd"; g.beginPath(); g.ellipse(4, -10, 13, 7, -0.2, 0, TAU); g.fill(); g.restore();
    cuerpo(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    // cuello y cabeza
    const hc = { x: H0.x + (e.cuello ? e.cuello.x : 0), y: H0.y + (e.cuello ? e.cuello.y : 0) };
    const largo = Math.hypot(hc.x - N0.x, hc.y - N0.y), grosor = clamp(13 - (largo - 15) * 0.12, 7, 13);
    const gr = g.createLinearGradient(N0.x, N0.y, hc.x, hc.y); gr.addColorStop(0, "#8a5bb5"); gr.addColorStop(0.5, "#3fa98c"); gr.addColorStop(1, "#7f89a2");
    g.lineWidth = grosor + 3; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(N0.x, N0.y); g.lineTo(hc.x, hc.y); g.stroke();
    g.lineWidth = grosor; g.strokeStyle = gr; g.beginPath(); g.moveTo(N0.x, N0.y); g.lineTo(hc.x, hc.y); g.stroke();
    // trago: un bulto que baja por el cuello
    if ((e.trago ?? -1) >= 0 && e.trago <= 1) { const q = { x: lerp(hc.x, N0.x, e.trago), y: lerp(hc.y, N0.y, e.trago) }; g.fillStyle = "#4fb898"; g.beginPath(); g.arc(q.x + 1.5, q.y, grosor * 0.62, 0, TAU); g.fill(); g.lineWidth = 1.3; g.strokeStyle = TINTA; g.stroke(); }
    // cuerpo de nuevo por delante del arranque del cuello (tapa la junta)
    g.save(); cuerpo(); g.clip(); g.fillStyle = "#98a2b6"; g.beginPath(); g.ellipse(-2, -18, 15, 10, 0, 0, TAU); g.fill(); g.restore();
    // ala cercana
    ala(g, phi, Lw, cw, false);
    // cabeza
    g.save(); g.translate(hc.x, hc.y); g.rotate(e.cab || 0);
    const pico = clamp(e.pico || 0);
    g.fillStyle = "#3d434e"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
    g.save(); g.translate(6, 0.5); g.rotate(-0.18 * pico);
    g.beginPath(); g.moveTo(0, -2.2); g.lineTo(7.5, 0.6); g.lineTo(0, 1); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.save(); g.translate(6, 1.2); g.rotate(0.35 * pico);
    g.beginPath(); g.moveTo(0, -0.3); g.lineTo(6.5, 0.4); g.lineTo(0, 2.2); g.closePath(); g.fill(); g.stroke(); g.restore();
    if (e.patata) patata(g, 13.5 + 2 * pico, 1.4, 0.25, 1.1 / ESC_PAL, e.mordida || 0);
    g.beginPath(); g.arc(0, 0, 7.6, 0, TAU); g.fillStyle = "#8a94aa"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#eef0f2"; g.beginPath(); g.ellipse(6.4, -1.6, 2.4, 1.6, -0.3, 0, TAU); g.fill();
    const ojo = e.ojo ?? 1;
    g.fillStyle = "#f08a2a"; g.beginPath(); g.ellipse(2.2, -2.2, 2.8, 2.8 * Math.max(0.15, ojo), 0, 0, TAU); g.fill();
    if (ojo > 0.25) { g.fillStyle = "#111"; g.beginPath(); g.arc(2.6 + (e.mira || 0) * 0.8, -2.2, 1.45, 0, TAU); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(2.1, -3, 0.55, 0, TAU); g.fill(); }
    else { g.strokeStyle = TINTA; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-0.5, -2.2); g.lineTo(5, -2.2); g.stroke(); }
    g.restore();
    g.restore();
  }
  // estado de la paloma a lo largo de la escena
  const P0 = { x: -60, y: 30 }, P1 = { x: 330, y: -20 }, P2 = { x: 520, y: 330 };
  function palomaEn(t, pG) {
    if (t < T.pal0) return null;
    const crown = coronilla(pG);
    const angCab = -pG.cabeza.ang;                         // Guillermo va en espejo
    if (t < T.palPosa) {
      const u = fase(t, T.pal0, T.palPosa), s = lerp(u, suave(u), 0.5), v = 1 - s;
      const P3 = crown;
      const bz = q => ({ x: v * v * v * P0.x + 3 * v * v * q * P1.x + 3 * v * q * q * P2.x + q * q * q * P3.x, y: v * v * v * P0.y + 3 * v * v * q * P1.y + 3 * v * q * q * P2.y + q * q * q * P3.y });
      const a = bz(s), b2 = bz(Math.min(1, s + 0.01));
      const frena = tramo(t, T.palPosa - 0.33, T.palPosa - 0.03);
      const planea = dentro(t, 4.98, 5.08, 5.3, 5.4);
      const fl = (t - T.pal0) * lerp(8.5, 15, frena);
      let aleteo = lerp(Math.sin(fl), 0.35, planea);
      aleteo = lerp(aleteo, 0.3 + 0.7 * Math.sin(fl), frena);
      const pend = Math.atan2(b2.y - a.y, b2.x - a.x);
      const ang = lerp(clamp(pend, -0.5, 0.5) * 0.6, -0.55, frena) + 0.06 * Math.sin(fl) * (1 - planea);
      return { x: a.x, y: a.y, dir: 1, esc: ESC_PAL, ang, alas: 1, aleteo, patas: tramo(t, T.palPosa - 0.4, T.palPosa - 0.1), cab: lerp(0, 0.4, frena), pecho: 0 };
    }
    // posada en la cabeza: se pliega, se da la vuelta, arrulla, mira la patata, la roba, la masca, se asoma
    const v = t - T.palPosa;
    const bote = 3 * Math.exp(-v * 8) * Math.sin(v * 22);
    const pliega = tramo(t, T.palPosa, T.palPosa + 0.3);
    const giro = fase(t, T.palGira0, T.palGira1), dirE = Math.cos(Math.PI * suave(giro));
    const dir = Math.abs(dirE) < 0.08 ? (dirE < 0 ? -0.08 : 0.08) : dirE;
    const hopGiro = 4 * campana(t, T.palGira0, T.palGira1);
    const e = { x: crown.x, y: crown.y + bote - hopGiro, dir, esc: ESC_PAL, ang: angCab * 0.7 + 0.12 * campana(t, T.palPosa, T.palPosa + 0.25),
      alas: 1 - pliega, aleteo: lerp(-0.4, 0.6, pliega) + 0.6 * Math.sin(v * 22) * (1 - pliega), patas: 1, cab: 0, pecho: 0, cuello: { x: 0, y: 0 } };
    // arrullos: pecho hinchado y cabeceo
    const arr = campana(t, T.palArr0, T.palArr1) + campana(t, T.palArr2, T.palArr2 + 0.35);
    e.pecho = arr; e.cuello.y += 3 * Math.sin((t - T.palArr0) * 18) * arr; e.cuello.x -= 2 * arr;
    // mira de un lado a otro (sin la patata)
    e.cab += 0.25 * Math.sin((t - 7.0) * 2.4) * dentro(t, 7.0, 7.15, 7.4, 7.5);
    // sigue la patata con la mirada: se inclina hacia delante
    const sigue = dentro(t, T.gAdmira0, T.gAdmira0 + 0.2, T.roba - 0.12, T.roba - 0.08);
    e.cuello.x += 5 * sigue; e.cuello.y += 3 * sigue; e.cab += 0.35 * sigue; e.mira = sigue;
    // el robo: estira el cuello hasta el ápice
    const A = apice2();
    const loc = q => { const d = { x: q.x - e.x, y: q.y - e.y }, r2 = rota(d, -e.ang); return { x: r2.x / (dir * e.esc), y: r2.y / e.esc }; };
    const estira = tramo(t, T.roba - 0.1, T.roba, salida) * (1 - tramo(t, T.roba + 0.05, T.roba + 0.3));
    if (estira > 0) { const objetivo = loc(A), tgt = { x: objetivo.x - 13, y: objetivo.y - 1 }; e.cuello.x = lerp(e.cuello.x, tgt.x - H0.x, estira); e.cuello.y = lerp(e.cuello.y, tgt.y - H0.y, estira); e.cab = lerp(e.cab, 0.25, estira); }
    e.pico = campana(t, T.roba - 0.12, T.roba + 0.01) + 0.8 * Math.max(0, Math.sin((t - T.cruje0) * 16)) * dentro(t, T.cruje0, T.cruje0 + 0.05, T.cruje1 - 0.05, T.cruje1);
    e.patata = t >= T.roba && t < T.palTraga;
    e.mordida = 0.75 * tramo(t, T.cruje0, T.cruje1);
    // con la patata en el pico: la cabeza alta, muy digna
    const digna = dentro(t, T.roba + 0.3, T.roba + 0.5, T.cruje0 - 0.1, T.cruje0);
    e.cab -= 0.3 * digna; e.cuello.y -= 2 * digna;
    // se asoma por la frente, boca abajo, para mirarle a los ojos
    const asoma = dentro(t, T.palAsoma0, T.palAsoma1, T.palVuelve, T.palVuelve + 0.3);
    if (asoma > 0) { e.ang += (dir < 0 ? -1 : 1) * 1.2 * asoma; e.cuello.x = lerp(e.cuello.x, 20, asoma); e.cuello.y = lerp(e.cuello.y, 10, asoma); e.cab = lerp(e.cab, 0.75, asoma); e.mira = asoma; }
    e.trago = t >= T.palTraga && t < T.palTraga + 0.35 ? fase(t, T.palTraga, T.palTraga + 0.35) : -1;
    // ladeo final, igual que ellos (sentido de pantalla: horario)
    const lad = tramo(t, T.ladeo0, T.ladeo1);
    e.cab += 0.5 * lad * (dir < 0 ? -1 : 1);
    e.ojo = 1 - parpadeo(t, [7.2, 9.0, 10.85, 12.0, 13.2], 0.12);
    return e;
  }

  /* =====================================================================================
   * EFECTOS: crujido, ñac, migas, notas del silbido, arrullo, risa
   * ===================================================================================== */
  function rayitas(g, x, y, k, ang, n = 3, col = TINTA, L = 12) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = k; g.strokeStyle = col; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * 0.45; g.beginPath(); g.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); g.lineTo(Math.cos(a) * (8 + L), Math.sin(a) * (8 + L)); g.stroke(); }
    g.restore();
  }
  function crujido(g, t, pG) {
    const k = campana(t, T.gBoca1, T.gBoca1 + 0.55); if (k <= 0.01) return;
    const b = bocaGs(pG);
    g.save(); g.fillStyle = "#f4c752"; g.strokeStyle = "#7a4a1a"; g.lineWidth = 0.8;
    for (let i = 0; i < 6; i++) {
      const u = fase(t, T.gBoca1 + i * 0.05, T.gBoca1 + 0.35 + i * 0.05); if (u <= 0 || u >= 1) continue;
      const x = b.x - 6 - 30 * u * (0.5 + hash(i)), y = b.y + 2 - 14 * Math.sin(Math.PI * u) + 30 * u * u;
      g.globalAlpha = 1 - u; g.beginPath(); g.arc(x, y, 1.6 + hash(i * 3), 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
    rayitas(g, b.x - 4, b.y - 2, k, Math.PI + 0.2, 3, TINTA, 9);
  }
  function nanc(g, t, pG) {
    const k = campana(t, T.gMuerde - 0.02, T.gMuerde + 0.3); if (k <= 0.01) return;
    const b = bocaGs(pG);
    rayitas(g, b.x - 6, b.y - 4, k, Math.PI - 0.25, 3, TINTA, 12);
    rayitas(g, b.x + 10, b.y - 10, k * 0.8, -Math.PI / 2 - 0.4, 2, TINTA, 9);
    // chispa de los dientes chocando
    g.save(); g.translate(b.x - 18, b.y - 12); g.globalAlpha = k; g.fillStyle = "#fff6c8"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 3 : 8 * (0.7 + 0.3 * k); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  // migas que caen del pico a la nariz (y se quedan)
  const MIGAS = [0, 1, 2, 3, 4, 5].map(i => ({ t0: T.cruje0 + 0.04 + i * 0.07, dx: (hash(i * 7.3) - 0.5) * 10, queda: i % 2 === 0, r: 1.5 + hash(i * 3.1) * 1.3 }));
  function migas(g, t, pG, pal) {
    if (!pal || t < T.cruje0) return;
    const n = narizG(pG);
    for (const [i, m] of MIGAS.entries()) {
      if (t < m.t0) continue;
      if (!m.desde) m.desde = picoPantalla(palomaEn(m.t0, poseG(m.t0)));
      const desde = m.desde;
      const dur = 0.32, u = fase(t, m.t0, m.t0 + dur);
      let x, y;
      if (u < 1) { x = lerp(desde.x, n.x + m.dx * 0.6, u); y = desde.y + (n.y - 6 - desde.y) * u * u; }
      else if (m.queda) { x = n.x + m.dx * 0.6; y = n.y - 6 + (i % 3) * 1.5; if (t > T.gSuspira) { const w = fase(t, T.gSuspira, T.gSuspira + 0.5); x -= 6 * w; y += 40 * w * w; if (w >= 1) continue; } }
      else { const w = fase(t, m.t0 + dur, m.t0 + dur + 0.35); if (w >= 1) continue; x = n.x + m.dx * 0.6 - 18 * w; y = n.y - 6 - 16 * Math.sin(Math.PI * w) + 50 * w * w; }
      g.fillStyle = "#f4c752"; g.strokeStyle = "#7a4a1a"; g.lineWidth = 0.8; g.beginPath(); g.arc(x, y, m.r, 0, TAU); g.fill(); g.stroke();
    }
  }
  function picoPantalla(e) {
    const hc = { x: H0.x + (e.cuello ? e.cuello.x : 0), y: H0.y + (e.cuello ? e.cuello.y : 0) };
    const tip = rota({ x: 12, y: 1 }, e.cab || 0), q = { x: (hc.x + tip.x) * e.dir * e.esc, y: (hc.y + tip.y) * e.esc };
    const r = rota(q, e.ang); return { x: e.x + r.x, y: e.y + r.y };
  }
  function notaMusical(g, x, y, k, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.globalAlpha = k; g.fillStyle = TINTA; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.ellipse(0, 0, 4.2, 3, -0.4, 0, TAU); g.fill(); g.beginPath(); g.moveTo(3.6, -1); g.lineTo(3.6, -15); g.quadraticCurveTo(8, -12, 9, -8); g.stroke(); g.restore();
  }
  function silbido(g, t, pP) {
    const k = dentro(t, T.pSilba0 + 0.05, T.pSilba0 + 0.15, T.pSilba1 - 0.1, T.pSilba1); if (k <= 0.01) return;
    const b = bocaPa(pP);
    for (let i = 0; i < 3; i++) { const ph = ((t - T.pSilba0) * 1.6 + i / 3) % 1;
      notaMusical(g, b.x + 26 + 26 * ph + 4 * Math.sin(ph * 9 + i), b.y - 16 - 34 * ph, k * Math.sin(Math.PI * ph), 0.2 * Math.sin(ph * 6 + i)); }
  }
  function arrullo(g, t, pal) {
    if (!pal) return;
    const k = campana(t, T.palArr0, T.palArr1 + 0.15) + campana(t, T.palArr2, T.palArr2 + 0.5); if (k <= 0.01) return;
    const q = rota({ x: 14 * pal.dir * pal.esc, y: -30 * pal.esc }, pal.ang);
    g.save(); g.translate(pal.x + q.x, pal.y + q.y); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.lineCap = "round"; g.globalAlpha = clamp(k);
    for (let i = 0; i < 3; i++) { const ph = (t * 2.5 + i / 3) % 1, r = 5 + 12 * ph; g.globalAlpha = clamp(k) * (1 - ph);
      g.beginPath(); g.arc(0, 0, r, pal.dir > 0 ? -0.6 : Math.PI - 0.6, pal.dir > 0 ? 0.6 : Math.PI + 0.6); g.stroke(); }
    g.restore();
  }
  function risaP(g, t, pP) {
    const k = dentro(t, T.pRisa0, T.pRisa0 + 0.1, T.pRisa1 - 0.25, T.pRisa1); if (k <= 0.01) return;
    const c = PA.aPantalla(pP, PA.centroCabeza(pP));
    rayitas(g, c.x - 66, c.y - 28, k, Math.PI + 0.4, 3, TINTA, 11);
    rayitas(g, c.x + 70, c.y - 40, k, -0.5, 3, TINTA, 11);
  }
  function aguantaP(g, t, pP) {          // gotitas de risa contenida
    const k = dentro(t, T.pAguanta + 0.1, T.pAguanta + 0.2, T.pTapa1 - 0.1, T.pTapa1); if (k <= 0.01) return;
    const c = PA.aPantalla(pP, PA.centroCabeza(pP));
    rayitas(g, c.x + 70, c.y - 30, k * (0.6 + 0.4 * Math.sin(t * 20)), -0.4, 2, TINTA, 8);
  }
  function aleteoLineas(g, t, pal) {     // rayitas del aterrizaje
    const k = campana(t, T.palPosa - 0.15, T.palPosa + 0.3); if (k <= 0.01 || !pal) return;
    rayitas(g, pal.x, pal.y - 4, k, Math.PI / 2, 3, "rgba(30,20,40,0.8)", 8);
  }

  /* =====================================================================================
   * CÁMARA
   * ===================================================================================== */
  const PLANOS = [
    [0, 1.0, 512, 300], [7.5, 1.0, 512, 300], [8.25, 1.06, 590, 272], [11.6, 1.06, 590, 272], [12.6, 1.0, 512, 300], [DUR, 1.025, 512, 306]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }

  /* =====================================================================================
   * PINTAR
   * ===================================================================================== */
  let CAPA = null, FILO = null;
  function pose(t) { return { g: poseG(t), p: poseP(t) }; }
  class GuillermoParadigmaPuestaDeSol extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !PA.listo()) return;
      if (!LISTO) { LISTO = true; NUBES = creaNubes(); CIUDAD = creaSkyline([["#d08e94", "#7a4a66"], ["#6a3c66", "#2a1934"]]);
        VENTANAS = creaVentanas(); PRETIL = creaPretil(); ESTRELLAS = creaEstrellas(); CAPA = lienzo(W, H); FILO = lienzo(W, H); }
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), oc = ocaso(t);
      const BASE0 = g.getTransform();
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      const CAMM = g.getTransform();
      // cielo: tres degradados que se funden
      cielo(g, oc);
      estrellas(g, t);
      sol(g, t);
      nubes(g, t);
      pajarosLejos(g, t);
      // ciudad
      const ks = suave(clamp((oc - 0.1) / 0.8));
      if (ks < 0.999) g.drawImage(CIUDAD[0], -MX, SKY_Y0);
      if (ks > 0.001) { g.globalAlpha = ks; g.drawImage(CIUDAD[1], -MX, SKY_Y0); g.globalAlpha = 1; }
      ventanas(g, t);
      // bruma cálida sobre el horizonte
      const yb = MURO - 70, grh = g.createLinearGradient(0, yb, 0, MURO);
      grh.addColorStop(0, "rgba(255,170,110,0)"); grh.addColorStop(1, `rgba(255,${Math.round(lerp(170, 110, oc))},${Math.round(lerp(110, 90, oc))},${lerp(0.35, 0.25, oc)})`);
      g.fillStyle = grh; g.fillRect(-MX, yb, W + 2 * MX, MURO - yb);
      // pretil (con la luz que se va)
      g.drawImage(PRETIL, -MX, MURO - 18);
      g.fillStyle = `rgba(30,12,40,${0.42 * oc})`; g.fillRect(-MX, MURO - 18, W + 2 * MX, H + MY - MURO + 40);
      g.fillStyle = `rgba(255,190,120,${0.25 * (1 - oc)})`; g.fillRect(-MX, MURO - 18, W + 2 * MX, 5);
      // sombras de los dos sobre la albardilla
      g.fillStyle = "rgba(40,20,30,0.3)"; g.beginPath(); g.ellipse(XP + 50, MURO - 6, 95, 6, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(XG - 50, MURO - 6, 95, 6, 0, 0, TAU); g.fill();

      // ---------- capa de los personajes ----------
      const c = CAPA.getContext("2d");
      // caja de los personajes en pantalla (todo lo de la capa cabe en ella): las operaciones de la capa se recortan a ella
      const cx0 = (CAMM.a * 130 + CAMM.e - BASE0.e) / BASE0.a, cy0 = (CAMM.d * 8 + CAMM.f - BASE0.f) / BASE0.d;
      const cx1 = (CAMM.a * 940 + CAMM.e - BASE0.e) / BASE0.a, cy1 = (CAMM.d * 575 + CAMM.f - BASE0.f) / BASE0.d;
      const bx = Math.max(0, Math.floor(cx0)), by = Math.max(0, Math.floor(cy0)), bw = Math.min(W, Math.ceil(cx1)) - bx, bh = Math.min(H, Math.ceil(cy1)) - by;
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "source-over"; c.globalAlpha = 1; c.clearRect(bx, by, bw, bh);
      c.setTransform(CAMM.a / BASE0.a, CAMM.b, CAMM.c, CAMM.d / BASE0.d, (CAMM.e - BASE0.e) / BASE0.a, (CAMM.f - BASE0.f) / BASE0.d);
      const CAMC = c.getTransform();
      const pG = poseG(t), pP = poseP(t);
      // botellín de Guillermo en el pretil, a su espalda
      c.save(); c.translate(XG + 104, MURO - 4); botellin(c, true); c.restore();
      // objetos de las manos (en pantalla, por debajo del puño)
      const enPantalla = fn => gg => { gg.save(); gg.setTransform(CAMC); fn(gg); gg.restore(); };
      const bot = botellinP(t);
      pP.manoLejos.objeto = enPantalla(gg => { const q = ptMano(PA, pP, pP.manoLejos, CENTRO); gg.translate(q.x, q.y); gg.rotate(bot.ang + Math.PI / 2); gg.translate(0, -bot.ag); botellin(gg, false); });
      pG.manoCerca.objeto = enPantalla(gg => { const q = ptMano(G, pG, pG.manoCerca, CENTRO); bolsa(gg, q.x + 5, q.y - 22, 1, t); });
      const pa1 = patata1(t, pG), pa2 = patata2(t, pG);
      if ((pa1 && pa1.mano) || (pa2 && pa2.mano)) {
        const pp = pa1 && pa1.mano ? pa1 : pa2;
        pG.manoLejos.objeto = enPantalla(gg => patata(gg, pp.x, pp.y, pp.a));
      }
      PA.dibujar(c, pP, t);
      G.dibujar(c, pG, t);
      // patatas por el aire
      if (pa1 && !pa1.mano) patata(c, pa1.x, pa1.y, pa1.a, pa1.k);
      if (pa2 && !pa2.mano && !pa2.pico) patata(c, pa2.x, pa2.y, pa2.a);
      const pal = palomaEn(t, pG);
      if (pal) paloma(c, pal);
      migas(c, t, pG, pal);
      // sombra de atardecer muy suave (sin teñir de color la camiseta negra)
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = "source-atop";
      c.fillStyle = `rgba(50,22,48,${lerp(0.04, 0.2, oc)})`; c.fillRect(bx, by, bw, bh);
      c.globalCompositeOperation = "source-over";
      // filo de luz del sol en el lado que mira hacia él
      const fc = FILO.getContext("2d"), sx = CAMC.a * SOL_X + CAMC.e, d = 3;
      const kFilo = lerp(0.5, 0.25, oc) * tramo(solY(t), 450, 380, s => s);
      g.setTransform(BASE0);
      g.drawImage(CAPA, bx, by, bw, bh, bx, by, bw, bh);
      if (kFilo > 0.01) {
        // solo de la cintura para arriba (las piernas cuelgan en la sombra del pretil): la mitad de píxeles
        const fh = Math.max(0, Math.min(bh, Math.ceil((CAMM.d * 340 + CAMM.f - BASE0.f) / BASE0.d) - by));
        fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = "source-over"; fc.clearRect(bx, by, bw, fh);
        fc.drawImage(CAPA, bx, by, bw, fh, bx, by, bw, fh);
        fc.globalCompositeOperation = "source-in"; fc.fillStyle = oc < 0.5 ? "#ffd88a" : "#ffa060"; fc.fillRect(bx, by, bw, fh);
        fc.globalCompositeOperation = "destination-out";
        const sxc = clamp(sx, bx, bx + bw);
        if (sxc > bx) fc.drawImage(CAPA, bx, by, sxc - bx, fh, bx - d, by + d * 0.7, sxc - bx, fh);
        if (sxc < bx + bw) fc.drawImage(CAPA, sxc, by, bx + bw - sxc, fh, sxc + d, by + d * 0.7, bx + bw - sxc, fh);
        fc.globalCompositeOperation = "source-over";
        g.globalAlpha = kFilo; g.drawImage(FILO, bx, by, bw, fh, bx, by, bw, fh); g.globalAlpha = 1;
      }
      g.setTransform(CAMM);
      // efectos (encima, sin filo)
      crujido(g, t, pG);
      nanc(g, t, pG);
      silbido(g, t, pP);
      arrullo(g, t, pal);
      risaP(g, t, pP);
      aguantaP(g, t, pP);
      aleteoLineas(g, t, pal);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00110", nombre: "Guillermo y Paradigma · La puesta de sol", crear: () => new GuillermoParadigmaPuestaDeSol() });
  // diagnóstico: distancia hombro → objetivo de cada mano (respecto a lo que da el brazo)
  function diag(t) {
    const { p: pP, g: pG } = pose(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) return null; const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return +(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y) / ((lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L))).toFixed(2); };
    o.pC = dist(PA, pP, "cerca"); o.pL = dist(PA, pP, "lejos"); o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos");
    return o;
  }
  window.__A2D_00110 = { pose, poseP, poseG, T, DUR, diag, palomaEn };
})();
