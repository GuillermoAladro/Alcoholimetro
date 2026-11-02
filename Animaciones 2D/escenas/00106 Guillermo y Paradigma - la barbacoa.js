"use strict";
/* 00106 · Guillermo y Paradigma · La barbacoa
 *
 * Negro → el jardín de atrás en una tarde de verano: el sol bajando tras la valla de madera, árboles,
 * la pared de la casa con su ventana encendida, una guirnalda de bombillas, el césped, unas losas y, en
 * medio, una barbacoa de bola con las brasas encendidas y cinco salchichas en la parrilla; a la
 * izquierda, un carrito de madera con panecillos, kétchup, mostaza y un bote de líquido encendedor →
 * Paradigma, muy tranquilo, da la vuelta a las salchichas con las pinzas, una a una (chisporroteo y
 * marcas de la parrilla), cabeceando con calma; Guillermo huele, se relame y asiente → Guillermo se
 * frota las manos y le pide las pinzas con la mano; Paradigma se encoge de hombros, lanza las pinzas al
 * aire, las caza por la mitad y se las da por el mango → Guillermo hace «clac, clac» y mira a cámara muy
 * chulo; mira las brasas, no le convencen, se le ocurre algo y coge el bote del carrito → Paradigma
 * levanta una ceja y se aparta un paso; Guillermo echa dos chorros de líquido a las brasas… no pasa
 * nada; se asoma a mirar… ¡FUUUM!: una bola de fuego. Las salchichas salen volando dando vueltas →
 * Guillermo se queda congelado: tiznado, sin cejas y con las puntas de los pinchos chamuscadas y
 * echando humo → las salchichas caen otra vez a la parrilla, doraditas y con sus marcas; una cae justo
 * entre los dedos de Paradigma, que la sopla, le da un bocado y asiente («mm») → Guillermo parpadea en su
 * cara negra y mira a cámara; a un pincho le sale una llamita que se apaga con un anillo de humo; él lo
 * mira y vuelve a mirar a cámara; Paradigma levanta la salchicha y guiña un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Las pinzas, el bote y la salchicha de la mano se pintan
 * en coordenadas de pantalla dentro del objeto de la mano (por debajo del puño). Las cejas se borran
 * repintando la pieza de la cabeza recortada a su sitio; las puntas chamuscadas son la propia pieza de la
 * cabeza oscurecida con source-atop en un lienzo aparte (una vez). Nada lee píxeles.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, hash, ruido } = M2;
  const G = Guillermo, PA = Paradigma, RC = Recortes;
  const TAU = Math.PI * 2, TINTA = "#141218";
  const S = 0.3, SY = 548;
  const DUR = 14.6;
  const T = {
    // vueltas de Paradigma
    v1: 0.95, v2: 1.8, v3: 2.65,
    huele0: 1.15, huele1: 1.75, relame: 2.25,
    // Guillermo pide
    frota0: 3.05, frota1: 3.5, pide0: 3.5, pide1: 4.15,
    pMira: 3.2, encoge0: 3.35, encoge1: 3.65,
    saca0: 3.55, lanza0: 3.78, caza: 4.02, ofrece0: 4.0, ofrece1: 4.22, coge: 4.24, suelta: 4.38,
    gPaso0: 3.55, gPaso1: 4.1, pAtras0: 4.45, pAtras1: 4.95,
    clac1: 4.62, clac2: 4.86, chulo0: 5.0, chulo1: 5.4,
    hmm0: 5.45, idea: 5.78, bote0: 5.9, bote1: 6.25, trae1: 6.55,
    ceja: 6.35, pAtras2a: 6.5, pAtras2b: 6.95,
    chorro1: 6.7, chorro2: 6.98, nada: 7.25, asoma0: 7.3, asoma1: 7.62,
    fuum: 7.7,
    // después
    caen0: 8.75, coge2: 9.18, mira2: 9.3, sopla0: 9.55, sopla1: 9.95, bocado: 10.15, mm0: 10.4, mm1: 11.3,
    gParp1: 9.9, gCam: 10.6, gParp2: 11.75, llama: 12.2, gArriba0: 12.3, gArriba1: 12.95, gCam2: 13.1,
    pCam: 12.6, guino: 13.3, alza: 12.75,
    fin: 13.88
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
  const dirA = a => ({ x: Math.cos(a), y: Math.sin(a) });
  const suma = (p, d, k) => ({ x: p.x + d.x * k, y: p.y + d.y * k });

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
      if (o.hoja) q = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(m, o.ref || PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? 1 };
    };
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
   * LA BARBACOA: parrilla, brasas y salchichas (pantalla)
   * ===================================================================================== */
  const GC = { x: 548, y: 368 }, GRX = 84, GRY = 21;                       // parrilla (elipse)
  const BOWL = { rx: 92, ry: 24, fondo: 444 };
  // salchichas: sitio en la parrilla, giro, y a cuál le da la vuelta Paradigma
  const SAL = [
    { x: 512, y: 360, a: 0.1 }, { x: 552, y: 354, a: -0.06 }, { x: 590, y: 361, a: 0.08 },
    { x: 526, y: 378, a: -0.09 }, { x: 570, y: 379, a: 0.05 }
  ];
  const VUELTAS = [[T.v1, 2], [T.v2, 4], [T.v3, 1]];          // [inicio, salchicha]
  const VD = { llega: 0.2, agarra: 0.08, sube: 0.22, baja: 0.14, suelta: 0.06 };     // tiempos de una vuelta
  const vueltaDur = VD.llega + VD.agarra + VD.sube + VD.baja + VD.suelta;
  // vuelos tras la llamarada: [tDespega, tAterriza, alto, vueltas, x/y de llegada]
  const VUELOS = [
    { t0: T.fuum + 0.03, t1: 8.86, h: 210, giro: 3.5, fin: { x: 514, y: 361, a: 0.06 } },
    { t0: T.fuum + 0.05, t1: 8.98, h: 250, giro: -4.5, fin: { x: 553, y: 355, a: -0.04 } },
    { t0: T.fuum + 0.02, t1: T.coge2, h: 230, giro: 4.25, fin: null },          // la que caza Paradigma
    { t0: T.fuum + 0.06, t1: 9.04, h: 190, giro: -3, fin: { x: 528, y: 378, a: -0.07 } },
    { t0: T.fuum + 0.04, t1: 8.92, h: 225, giro: 3, fin: { x: 572, y: 380, a: 0.04 } }
  ];
  const LS = 36, RS = 7;                                                         // salchicha: largo y radio
  // dibuja una salchicha centrada en (0,0) a lo largo de x; cocido 0..1, marcas 0..1, mordida 0..1
  function salchicha(g, coc, marcas, mordida = 0, largo = LS) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const L = largo / 2, r = RS;
    const xm = L - mordida * 12;                                                  // el extremo mordido (derecho)
    const forma = () => {
      g.beginPath(); g.moveTo(-L + r, -r); g.lineTo(xm - r * 0.4, -r);
      if (mordida > 0.01) { g.quadraticCurveTo(xm + 2, -r * 0.6, xm - 3, -r * 0.2); g.quadraticCurveTo(xm + 4, r * 0.25, xm - 1, r * 0.5); g.quadraticCurveTo(xm + 1, r * 0.9, xm - r * 0.4, r); }
      else g.arc(xm - r * 0.4, 0, r, -Math.PI / 2, Math.PI / 2);
      g.lineTo(-L + r, r); g.arc(-L + r, 0, r, Math.PI / 2, Math.PI * 1.5); g.closePath();
    };
    const crudo = [214, 120, 112], hecho = [176, 82, 38], dorado = [205, 122, 52];
    const cc = coc < 0.6 ? crudo.map((v, i) => lerp(v, dorado[i], coc / 0.6)) : dorado.map((v, i) => lerp(v, hecho[i], (coc - 0.6) / 0.4));
    const col = k => `rgb(${cc.map(v => Math.round(v * k)).join(",")})`;
    forma();
    const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, col(1.18)); gr.addColorStop(0.45, col(1)); gr.addColorStop(1, col(0.62));
    g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    if (marcas > 0.01) {
      g.strokeStyle = `rgba(40,16,6,${0.85 * marcas})`; g.lineWidth = 2.6;
      for (const x of [-11, -2, 7]) { if (x > xm - 3) continue; g.beginPath(); g.moveTo(x - 3, -r); g.lineTo(x + 3, r); g.stroke(); }
    }
    g.fillStyle = "rgba(255,240,220,0.45)"; g.beginPath(); g.ellipse(-2, -r * 0.5, L * 0.7, r * 0.22, 0, 0, TAU); g.fill();
    if (mordida > 0.01) { g.fillStyle = "rgba(240,170,140,0.9)"; g.beginPath(); g.ellipse(xm - 1.5, 0, 2.5, r * 0.7, 0, 0, TAU); g.fill(); }
    g.restore();
    forma(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    // los extremos retorcidos
    g.lineWidth = 2; g.beginPath(); g.moveTo(-L - 1, 0); g.lineTo(-L - 4, -1.5); if (mordida < 0.01) { g.moveTo(L + 1, 0); g.lineTo(L + 4, 1.5); } g.stroke();
    g.restore();
  }
  // estado de cada salchicha en la parrilla: dónde está, cocción, marcas, «vuelta» (aplastado al rodar)
  function estadoSal(i, t) {
    const s = SAL[i];
    // en el aire (tras la llamarada) o caída de vuelta
    const v = VUELOS[i];
    if (t >= v.t0 && t < v.t1) return { aire: true };
    if (t >= v.t1) return v.fin ? { x: v.fin.x, y: v.fin.y + 2.5 * amort(t, v.t1, 9, 30), a: v.fin.a, coc: 0.85, marcas: 1, rol: 1 } : null;
    let x = s.x, y = s.y, a = s.a, rol = 1;
    const coc = 0.15 + 0.35 * fase(t, 0, T.fuum);
    let marcas = 0.25;
    for (const [t0, j] of VUELTAS) {
      if (j !== i) continue;
      const ta = t0 + VD.llega + VD.agarra, tb = ta + VD.sube, tc = tb + VD.baja;
      if (t > ta && t < tc) {
        const k = fase(t, ta, tc);
        y -= 18 * Math.sin(Math.PI * k);
        rol = Math.cos(Math.PI * clamp(fase(t, ta + 0.04, tb + 0.06)));          // rueda: 1 → -1
        a += 0.15 * Math.sin(Math.PI * k);
      }
      if (t >= tb) marcas = 1; else if (t > ta) marcas = 0.25;
    }
    return { x, y, a, coc, marcas, rol };
  }
  function dibSal(g, e) {
    g.save(); g.translate(e.x, e.y); g.rotate(e.a);
    g.scale(1, Math.max(0.35, Math.abs(e.rol)));
    salchicha(g, e.coc, e.rol >= 0 ? (e.marcas === 1 && e.rol < 1 ? 1 : e.marcas) : 1);
    g.restore();
  }
  // vuelo de una salchicha: de su sitio a donde cae (o a la mano de Paradigma)
  function vueloSal(i, t, destino) {
    const v = VUELOS[i], s = SAL[i], u = fase(t, v.t0, v.t1);
    const fin = destino || v.fin;
    const x = lerp(s.x, fin.x, u), y = lerp(s.y, fin.y, u) - v.h * 4 * u * (1 - u) * lerp(1, 0.9, u);
    const a = lerp(s.a, fin.a ?? 0, u) + v.giro * TAU * suave(u) * 0.5;
    return { x, y, a, coc: lerp(0.5, 0.85, u), marcas: 1, rol: 1, u };
  }

  /* ---------- la barbacoa de bola (fija, a doble resolución) ---------- */
  const BX0 = 430, BY0 = 300, BW = 250, BH = 254;
  let BARB = null;
  function creaBarbacoa() {
    const c = lienzo(BW * 2, BH * 2), g = c.getContext("2d");
    g.scale(2, 2); g.translate(-BX0, -BY0); g.lineJoin = "round"; g.lineCap = "round";
    const { x, y } = GC, rx = BOWL.rx, ry = BOWL.ry;
    // patas (la de atrás más oscura) con ruedas en las de delante
    const pata = (x0, y0, x1, y1, col) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 5; g.strokeStyle = col; g.stroke(); };
    pata(x, 430, x + 4, SY - 12, "#3b3a40");
    // bandeja de cenizas y travesaños
    g.beginPath(); g.moveTo(x - 62, 486); g.lineTo(x + 66, 486); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3; g.strokeStyle = "#8d929a"; g.stroke();
    g.beginPath(); g.ellipse(x + 2, 482, 46, 9, 0, 0, TAU); g.fillStyle = "#8d929a"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(x + 2, 480, 36, 5, 0, 0, TAU); g.fillStyle = "#b9bec6"; g.fill();
    pata(x - 54, 424, x - 74, SY - 6, "#55545c");
    pata(x + 56, 424, x + 78, SY - 6, "#55545c");
    for (const wx of [x - 76, x + 80]) { g.beginPath(); g.arc(wx, SY - 8, 9, 0, TAU); g.fillStyle = "#24232a"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
      g.beginPath(); g.arc(wx, SY - 8, 3, 0, TAU); g.fillStyle = "#8d929a"; g.fill(); }
    // el cuenco (esmalte negro)
    g.beginPath(); g.moveTo(x - rx, y - 2); g.bezierCurveTo(x - rx, y + 50, x - 54, BOWL.fondo, x, BOWL.fondo); g.bezierCurveTo(x + 54, BOWL.fondo, x + rx, y + 50, x + rx, y - 2); g.closePath();
    const gb = g.createLinearGradient(x - rx, 0, x + rx, 0); gb.addColorStop(0, "#2c2b31"); gb.addColorStop(0.3, "#4a4952"); gb.addColorStop(0.55, "#26252b"); gb.addColorStop(1, "#141318");
    g.fillStyle = gb; g.fill(); g.lineWidth = 4; g.strokeStyle = TINTA; g.stroke();
    // brillo del esmalte
    g.save(); g.clip();
    g.fillStyle = "rgba(255,255,255,0.28)"; g.beginPath(); g.ellipse(x - 44, y + 34, 12, 34, 0.5, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,190,120,0.25)"; g.beginPath(); g.ellipse(x + 50, y + 30, 30, 40, 0, 0, TAU); g.fill();
    g.restore();
    // respiradero y asa lateral
    g.beginPath(); g.ellipse(x + 6, 420, 14, 5, 0, 0, TAU); g.fillStyle = "#9aa0a8"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * (rx - 6), y + 12); g.lineTo(x + s * (rx + 12), y + 14); g.lineTo(x + s * (rx + 12), y + 26); g.lineTo(x + s * (rx - 4), y + 28);
      g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3.5; g.strokeStyle = "#7a4b2a"; g.stroke(); }
    // la tapa, apoyada en el suelo contra la pata de la derecha (cúpula con su asa)
    g.save(); g.translate(x + rx + 22, SY - 30); g.rotate(-0.42);
    g.beginPath(); g.moveTo(-44, 0); g.bezierCurveTo(-44, -40, 44, -40, 44, 0); g.closePath();
    const gt = g.createLinearGradient(-44, 0, 44, 0); gt.addColorStop(0, "#2c2b31"); gt.addColorStop(0.35, "#4a4952"); gt.addColorStop(1, "#141318");
    g.fillStyle = gt; g.fill(); g.lineWidth = 3.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(0, 0, 44, 7, 0, 0, Math.PI); g.fillStyle = "#17161b"; g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.ellipse(-18, -18, 6, 12, -0.7, 0, TAU); g.fill();
    g.beginPath(); g.rect(-12, -36, 24, 7); g.fillStyle = "#7a4b2a"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(14, -16, 7, 3, -0.3, 0, TAU); g.fillStyle = "#9aa0a8"; g.fill(); g.lineWidth = 1.8; g.stroke();
    g.restore();
    // boca del cuenco: interior oscuro (lo de atrás) — las brasas y la parrilla van en vivo
    g.beginPath(); g.ellipse(x, y - 2, rx, ry, 0, 0, TAU); g.fillStyle = "#17161b"; g.fill();
    g.beginPath(); g.ellipse(x, y - 2, rx, ry, 0, Math.PI, TAU); g.lineWidth = 4; g.strokeStyle = TINTA; g.stroke();
    return c;
  }
  // brasas (en vivo: titilan), parrilla y borde de delante
  const BRASAS = Array.from({ length: 44 }, (_, i) => { const a = hash(i * 3.1) * TAU, r = Math.sqrt(hash(i * 5.7)); return { x: GC.x + Math.cos(a) * r * 70, y: GC.y + 4 + Math.sin(a) * r * 14, s: 5 + hash(i * 2.3) * 6, f: hash(i * 7.1) * TAU }; });
  function brasas(g, t, aviva) {
    g.save();
    g.beginPath(); g.ellipse(GC.x, GC.y - 1, GRX + 4, GRY + 1, 0, 0, TAU); g.clip();
    const gl = g.createRadialGradient(GC.x, GC.y + 6, 4, GC.x, GC.y + 6, 86);
    gl.addColorStop(0, `rgba(255,${Math.round(150 + 60 * aviva)},60,${0.75 + 0.2 * aviva})`); gl.addColorStop(1, "rgba(120,30,10,0.2)");
    g.fillStyle = gl; g.fillRect(GC.x - 100, GC.y - 30, 200, 60);
    for (const b of BRASAS) {
      const tit = 0.65 + 0.35 * Math.sin(t * 2.3 + b.f) + 0.25 * aviva;
      g.fillStyle = `rgb(${Math.round(70 + 40 * tit)},${Math.round(30 + 20 * tit)},${Math.round(26)})`;
      g.beginPath(); g.ellipse(b.x, b.y, b.s, b.s * 0.45, 0, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,${Math.round(120 + 100 * tit)},40,${clamp(0.35 + 0.5 * tit)})`;
      g.beginPath(); g.ellipse(b.x - 1, b.y - 1, b.s * 0.55, b.s * 0.22, 0, 0, TAU); g.fill();
    }
    g.restore();
    // parrilla: barras (paralelas al ancho) y aro
    g.save(); g.beginPath(); g.ellipse(GC.x, GC.y, GRX, GRY, 0, 0, TAU); g.clip();
    g.strokeStyle = "rgba(20,18,24,0.95)"; g.lineWidth = 2.6;
    for (let y = GC.y - GRY + 3; y < GC.y + GRY; y += 4.6) { g.beginPath(); g.moveTo(GC.x - GRX, y); g.lineTo(GC.x + GRX, y); g.stroke(); }
    g.strokeStyle = "rgba(190,195,205,0.55)"; g.lineWidth = 1;
    for (let y = GC.y - GRY + 2.2; y < GC.y + GRY; y += 4.6) { g.beginPath(); g.moveTo(GC.x - GRX, y); g.lineTo(GC.x + GRX, y); g.stroke(); }
    g.restore();
    g.beginPath(); g.ellipse(GC.x, GC.y, GRX, GRY, 0, 0, TAU); g.lineWidth = 2.5; g.strokeStyle = "#5c5f66"; g.stroke();
  }
  function bordeDelante(g) {
    g.beginPath(); g.ellipse(GC.x, GC.y - 2, BOWL.rx, BOWL.ry, 0, 0.02, Math.PI - 0.02);
    g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 4.5; g.strokeStyle = "#4a4952"; g.stroke();
    g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(GC.x, GC.y - 3, BOWL.rx - 1, BOWL.ry - 1, 0, 0.6, 1.4); g.stroke();
  }

  /* =====================================================================================
   * LAS PINZAS (pantalla): bisagra H, dirección a, abiertas 0..1. Agarre en el tramo u (0 bisagra, 1 puntas)
   * ===================================================================================== */
  const LP = 82;
  function pinzas(g, H, a, abre) {
    const d = dirA(a), n = { x: -d.y, y: d.x }, sep = 1.4 + 6.5 * clamp(abre);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const sg of [-1, 1]) {
      const tip = { x: H.x + d.x * LP + n.x * sep * sg, y: H.y + d.y * LP + n.y * sep * sg };
      const mid = { x: H.x + d.x * LP * 0.42 + n.x * (1.8 + sep * 0.4) * sg, y: H.y + d.y * LP * 0.42 + n.y * (1.8 + sep * 0.4) * sg };
      const h0 = { x: H.x + n.x * 1.6 * sg, y: H.y + n.y * 1.6 * sg };
      // brazo de acero
      g.beginPath(); g.moveTo(h0.x, h0.y); g.lineTo(mid.x, mid.y); g.lineTo(tip.x, tip.y);
      g.lineWidth = 6.2; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3; g.strokeStyle = sg < 0 ? "#c9ced6" : "#9aa1ab"; g.stroke();
      // mango de goma negra
      g.beginPath(); g.moveTo(h0.x + d.x * 3, h0.y + d.y * 3); g.lineTo(mid.x - d.x * 4, mid.y - d.y * 4);
      g.lineWidth = 7.5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 4.5; g.strokeStyle = "#2a2a30"; g.stroke();
      // pala festoneada de la punta
      g.save(); g.translate(tip.x, tip.y); g.rotate(a);
      g.beginPath(); g.ellipse(-3, 0, 7, 3.6, 0, 0, TAU); g.fillStyle = "#b9bec6"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
      g.restore();
    }
    // anilla de la bisagra
    g.beginPath(); g.arc(H.x - d.x * 4, H.y - d.y * 4, 4.2, 0, TAU); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.arc(H.x - d.x * 4, H.y - d.y * 4, 4.2, 0, TAU); g.lineWidth = 1.2; g.strokeStyle = "#c9ced6"; g.stroke();
    g.restore();
  }
  const puntas = (H, a) => suma(H, dirA(a), LP);

  /* =====================================================================================
   * EL BOTE DE LÍQUIDO ENCENDEDOR (pantalla): centro c, ángulo b (−π/2 = boquilla arriba), apretón 0..1
   * ===================================================================================== */
  function bote(g, c, b, aprieta) {
    g.save(); g.translate(c.x, c.y); g.rotate(b + Math.PI / 2); g.lineJoin = "round"; g.lineCap = "round";
    const w = 8.5 * (1 - 0.18 * aprieta), h = 17;
    g.beginPath(); g.moveTo(-w, -h + 4); g.quadraticCurveTo(-w, -h, -w + 4, -h); g.lineTo(w - 4, -h); g.quadraticCurveTo(w, -h, w, -h + 4);
    g.lineTo(w * (1 + 0.1 * aprieta), h - 3); g.quadraticCurveTo(w, h, w - 3, h); g.lineTo(-w + 3, h); g.quadraticCurveTo(-w, h, -w * (1 + 0.1 * aprieta), h - 3); g.closePath();
    const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, "#6fb4f0"); gr.addColorStop(0.45, "#2f78c9"); gr.addColorStop(1, "#1d4f8f");
    g.fillStyle = gr; g.fill(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    // franja blanca (sin letras) y brillo
    g.fillStyle = "#f3f1ea"; g.fillRect(-w + 1.3, -3, 2 * w - 2.6, 9); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.strokeRect(-w + 1.3, -3, 2 * w - 2.6, 9);
    g.fillStyle = "#e0463a"; g.beginPath(); g.moveTo(-3, 0); g.lineTo(0, -1.5); g.lineTo(3, 0); g.lineTo(2, 4); g.lineTo(-2, 4); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-w + 2.5, -h + 3, 2.2, 10);
    // tapón y boquilla roja
    g.beginPath(); g.rect(-5, -h - 6, 10, 7); g.fillStyle = "#d8352a"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(-2.2, -h - 6); g.lineTo(-1, -h - 17); g.lineTo(1, -h - 17); g.lineTo(2.2, -h - 6); g.closePath(); g.fillStyle = "#d8352a"; g.fill(); g.lineWidth = 2; g.stroke();
    g.restore();
  }
  const boquilla = (c, b) => suma(c, dirA(b), 17 + 17);

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const XG0 = 362, XG1 = 404;
  const BOTE_CARRO = { x: 292, y: 316 };
  const CG = {
    mira: E({ mx: 0.9, my: 0.45, sd: 8, si: 8, sonr: 0.45, ancho: 0.95 }),
    huele: E({ mx: 0.4, my: -0.4, c: 1, sd: 16, gd: 0.05, si: 16, gi: 0.05, sonr: 0.8, ancho: 0.95, rub: 0.3 }),
    relame: E({ mx: 0.9, my: 0.4, sd: 14, si: 14, abre: 12, lengua: 1, sonr: 0.65, ancho: 0.9 }),
    asiente: E({ mx: 0.9, my: 0.35, sd: 12, si: 12, sonr: 0.7, ancho: 1 }),
    ansia: E({ mx: 0.95, my: 0.05, iris: 1.1, sd: 20, gd: 0.1, si: 20, gi: 0.1, sonr: 0.95, abre: 10, ancho: 1.05 }),
    pide: E({ mx: 0.95, my: 0.1, iris: 1.08, sd: 22, gd: 0.18, si: 22, gi: 0.18, sonr: 0.8, abre: 6, ancho: 0.95 }),
    tiene: E({ mx: 0.8, my: 0.55, sd: 18, si: 18, sonr: 1, abre: 14, ancho: 1.05 }),
    chulo: E({ mx: -0.15, my: 0, c: 0.3, sd: 20, gd: 0.12, si: 4, sonr: 0.85, ancho: 1.05 }),
    hmm: E({ mx: 0.9, my: 0.85, c: 0.15, sd: -6, gd: -0.12, si: -6, gi: -0.12, sonr: -0.15, ancho: 0.75 }),
    idea: E({ mx: 0.1, my: -0.65, sd: 26, gd: 0.1, si: 12, sonr: 0.7, ancho: 1.0 }),
    bote: E({ mx: -0.9, my: 0.6, sd: 14, si: 14, sonr: 0.65, ancho: 0.95 }),
    chorro: E({ mx: 0.95, my: 0.8, sd: 12, si: 12, sonr: 0.8, abre: 6, ancho: 1 }),
    nada: E({ mx: 0.9, my: 0.85, sd: 4, gd: -0.05, si: 10, gi: 0.08, sonr: -0.1, ancho: 0.7 }),
    asoma: E({ mx: 0.95, my: 0.95, iris: 0.95, sd: 2, si: 2, sonr: 0.0, abre: 4, ancho: 0.65 }),
    shock: E({ mx: 0.1, my: 0.05, iris: 0.55, sd: 10, si: 10, abre: 20, ancho: 0.5, sonr: -0.3 }),
    helado: E({ mx: 0.6, my: 0.1, iris: 0.6, sd: 8, si: 8, abre: 10, ancho: 0.5, sonr: -0.35 }),
    camara: E({ mx: -0.15, my: 0.05, iris: 0.62, sd: 8, si: 8, abre: 9, ancho: 0.5, sonr: -0.35 }),
    arriba: E({ mx: 0.25, my: -1, iris: 0.6, sd: 10, si: 10, abre: 6, ancho: 0.5, sonr: -0.3 }),
    final: E({ mx: -0.15, my: 0.05, iris: 0.62, c: 0.25, sd: 6, si: 6, abre: 4, ancho: 0.55, sonr: -0.15 })
  };
  const GUION_CG = [
    [0.4, 0.7, "mira"], [T.huele0, T.huele0 + 0.2, "huele"], [T.huele1, T.huele1 + 0.2, "mira"],
    [T.relame - 0.1, T.relame + 0.05, "relame"], [T.relame + 0.4, T.relame + 0.6, "asiente"],
    [T.frota0, T.frota0 + 0.2, "ansia"], [T.pide0, T.pide0 + 0.2, "pide"], [T.coge, T.coge + 0.15, "tiene"],
    [T.chulo0, T.chulo0 + 0.15, "chulo"], [T.hmm0, T.hmm0 + 0.2, "hmm"], [T.idea, T.idea + 0.12, "idea"],
    [T.bote0 - 0.05, T.bote0 + 0.1, "bote"], [T.trae1 - 0.1, T.trae1 + 0.05, "chorro"], [T.nada, T.nada + 0.15, "nada"],
    [T.asoma0, T.asoma0 + 0.2, "asoma"], [T.fuum, T.fuum + 0.06, "shock"], [8.6, 9.2, "helado"],
    [T.gCam, T.gCam + 0.5, "camara"], [T.gArriba0, T.gArriba0 + 0.3, "arriba"], [T.gCam2, T.gCam2 + 0.3, "final"]
  ];
  const PARP_G = [0.9, 2.95, 4.45, 5.6, 8.0];
  // parpadeos lentos con la cara tiznada
  const parpLento = t => Math.max(campana(t, T.gParp1, T.gParp1 + 0.42), campana(t, T.gParp2, T.gParp2 + 0.36));
  const P0G = { x: XG0, pel: 0, torso: 0.02, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    huele: CuG({ torso: -0.04, cab: -0.14 }),
    asiente: CuG({ torso: 0.04, cab: 0.06 }),
    frota: CuG({ torso: 0.05, cab: 0.02 }),
    pide: CuG({ x: XG1, torso: 0.1, cab: 0.04 }),
    tiene: CuG({ x: XG1, torso: 0.06, cab: 0.06 }),
    chulo: CuG({ x: XG1, torso: -0.02, cab: -0.06 }),
    hmm: CuG({ x: XG1, torso: 0.1, cab: 0.16 }),
    bote: CuG({ x: XG1, torso: -0.05, cab: -0.02 }),
    chorro: CuG({ x: XG1, torso: 0.12, cab: 0.1 }),
    asoma: CuG({ x: XG1, torso: 0.34, cab: 0.22, pel: 14 }),
    shock: CuG({ x: XG1 - 4, torso: -0.09, cab: -0.12, pel: -4 }),
    helado: CuG({ x: XG1 - 4, torso: -0.05, cab: -0.05 })
  };
  const GUION_G = [
    [T.huele0, T.huele0 + 0.3, "huele"], [T.huele1, T.huele1 + 0.3, "quieto"], [T.relame + 0.35, T.relame + 0.55, "asiente"],
    [T.frota0 - 0.1, T.frota0 + 0.15, "frota"], [T.gPaso0, T.gPaso1, "pide"], [T.coge, T.coge + 0.2, "tiene"],
    [T.chulo0, T.chulo0 + 0.2, "chulo"], [T.hmm0, T.hmm0 + 0.25, "hmm"], [T.bote0 - 0.1, T.bote0 + 0.2, "bote"],
    [T.bote1, T.trae1, "chorro"], [T.asoma0, T.asoma1, "asoma"], [T.fuum, T.fuum + 0.09, "shock", salida], [T.fuum + 0.4, T.fuum + 1.0, "helado"]
  ];
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 20] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, M2.suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const PASOS_G = {
    cerca: [[-9, -8, XG0 - 14], [T.gPaso0 + 0.22, T.gPaso0 + 0.48, XG1 - 16, 22], [T.fuum, T.fuum + 0.1, XG1 - 22, 6]],
    lejos: [[-9, -8, XG0 + 20], [T.gPaso0, T.gPaso0 + 0.26, XG1 + 20, 22], [T.asoma0, T.asoma0 + 0.25, XG1 + 26, 8]]
  };

  // dónde están las pinzas (bisagra, ángulo, abiertas) y de quién; null si no hay
  // agarre de la mano en el tramo u de las pinzas
  const U_MANGO = 0.12, U_MEDIO = 0.58;
  function sitioVuelta(t) {
    // Paradigma: de reposo a cada salchicha y vuelta
    const reposo = { tip: { x: 612, y: 334 }, a: Math.PI - 0.9, abre: 0.1 };
    let st = reposo;
    for (const [t0, j] of VUELTAS) {
      const s = SAL[j];
      const k1 = fase(t, t0, t0 + VD.llega), ta = t0 + VD.llega + VD.agarra, tb = ta + VD.sube, tc = tb + VD.baja, td = tc + VD.suelta;
      if (t < t0 || t > td + 0.3) continue;
      const e = estadoSal(j, Math.min(Math.max(t, ta), tc));
      const sobre = { tip: { x: s.x + 2, y: s.y - 2 }, a: Math.PI - 0.78, abre: 0.55 };
      if (t <= t0 + VD.llega) st = { tip: mezcla(reposo.tip, sobre.tip, suave(k1)), a: lerp(reposo.a, sobre.a, suave(k1)), abre: lerp(0.1, 0.55, suave(k1)) };
      else if (t <= ta) st = { tip: sobre.tip, a: sobre.a, abre: lerp(0.55, 0.12, suave(fase(t, t0 + VD.llega, ta))) };
      else if (t <= tc) st = { tip: { x: e.x + 2, y: e.y - 2 }, a: sobre.a + 0.12 * Math.sin(Math.PI * fase(t, ta, tc)), abre: 0.12 };
      else if (t <= td) st = { tip: sobre.tip, a: sobre.a, abre: lerp(0.12, 0.5, suave(fase(t, tc, td))) };
      else { const k = suave(fase(t, td, td + 0.3)); st = { tip: mezcla(sobre.tip, reposo.tip, k), a: lerp(sobre.a, reposo.a, k), abre: lerp(0.5, 0.1, k) }; }
    }
    return st;
  }
  // pinzas: { H, a, abre, mano: "P"|"G"|null, u }
  const HANDOFF = { H: { x: 500, y: 300 }, a: -0.06 };
  let MEMO_LANZA = null;
  function pinzasEn(t) {
    if (t < T.saca0) {
      const st = sitioVuelta(t);
      return { H: suma(st.tip, dirA(st.a), -LP), a: st.a, abre: st.abre, mano: "P", u: U_MANGO };
    }
    if (t < T.lanza0) {
      // las saca de la parrilla y las sube
      const st = sitioVuelta(T.saca0), k = suave(fase(t, T.saca0, T.lanza0));
      const a = lerp(st.a, Math.PI + 0.9, k), tip0 = st.tip;
      const H0 = suma(tip0, dirA(st.a), -LP), mano0 = suma(H0, dirA(st.a), LP * U_MANGO);
      const mano1 = { x: 628, y: 278 };
      const mano = mezcla(mano0, mano1, k);
      return { H: suma(mano, dirA(a), -LP * U_MANGO), a, abre: 0.08, mano: "P", u: U_MANGO };
    }
    if (t < T.caza) {
      // lanzadas al aire: media vuelta por encima de la mano y las caza por la mitad
      if (!MEMO_LANZA) { const p = pinzasEn(T.lanza0 - 1e-4); MEMO_LANZA = { c0: suma(p.H, dirA(p.a), LP * 0.5), a0: p.a }; }
      const { c0, a0 } = MEMO_LANZA, u = fase(t, T.lanza0, T.caza);
      const cazaH = { x: 586, y: 292 }, aF = a0 + Math.PI * 0.94;
      const c1 = suma(cazaH, dirA(aF), LP * (0.5 - U_MEDIO));
      const c = { x: lerp(c0.x, c1.x, u), y: lerp(c0.y, c1.y, u) - 46 * 4 * u * (1 - u) };
      const a = lerp(a0, aF, suave(u));
      return { H: suma(c, dirA(a), -LP * 0.5), a, abre: 0.06 + 0.1 * Math.sin(Math.PI * u), mano: null, u: U_MEDIO };
    }
    if (t < T.suelta) {
      // en la mano de Paradigma por la mitad, hacia la de Guillermo (mango por delante)
      const aF = MEMO_LANZA ? MEMO_LANZA.a0 + Math.PI * 0.94 : -0.2;
      const k = suave(fase(t, T.caza, T.ofrece1));
      const cazaH = { x: 586, y: 292 }, a = lerp(aF - TAU * Math.round((aF - HANDOFF.a) / TAU), HANDOFF.a, k);
      const manoP = mezcla(cazaH, suma(HANDOFF.H, dirA(HANDOFF.a), LP * U_MEDIO), k);
      return { H: suma(manoP, dirA(a), -LP * U_MEDIO), a, abre: 0.05, mano: "P", u: U_MEDIO, ambas: t >= T.coge };
    }
    // Guillermo
    let a, abre = 0.08, mano;
    const H0 = HANDOFF.H, mG0 = suma(H0, dirA(HANDOFF.a), LP * U_MANGO);
    const kSobre = suave(fase(t, T.suelta + 0.05, T.clac1 - 0.06));
    const sobre = { mano: { x: 474, y: 318 }, a: 0.62 };
    const alto = { mano: { x: 462, y: 296 }, a: -0.55 };
    mano = mezcla(mG0, sobre.mano, kSobre); a = lerp(HANDOFF.a, sobre.a, kSobre);
    abre += 0.9 * Math.max(campana(t, T.clac1 - 0.07, T.clac1 + 0.07), campana(t, T.clac2 - 0.07, T.clac2 + 0.07));
    // al coger el bote las sube para que no estorben; al asomarse las baja un poco
    const kAlto = suave(fase(t, T.bote0 - 0.15, T.bote0 + 0.15));
    mano = mezcla(mano, alto.mano, kAlto); a = lerp(a, alto.a, kAlto);
    const kAs = suave(fase(t, T.asoma0, T.asoma1));
    mano = { x: mano.x + 10 * kAs, y: mano.y + 6 * kAs }; a = lerp(a, -0.2, kAs);
    // la llamarada: el brazo da un respingo hacia arriba y se queda tieso
    const kF = salida(fase(t, T.fuum, T.fuum + 0.12));
    mano = mezcla(mano, { x: 470, y: 262 }, kF); a = lerp(a, -1.25, kF);
    a += 0.02 * Math.sin(t * 31) * tramo(t, T.fuum, T.fuum + 0.2) * (1 - tramo(t, 9.2, 10));
    return { H: suma(mano, dirA(a), -LP * U_MANGO), a, abre, mano: "G", u: U_MANGO };
  }
  const agarre = pz => suma(pz.H, dirA(pz.a), LP * pz.u);

  // el bote: en el carro, en la mano de Guillermo, apretado
  function boteEn(t) {
    if (t < T.bote0 + 0.22) return { c: BOTE_CARRO, b: -Math.PI / 2, aprieta: 0, mano: false };
    const k = suave(fase(t, T.bote0 + 0.22, T.trae1));
    const sobre = { c: { x: 426, y: 314 }, b: 0.5 };
    let c = mezcla(BOTE_CARRO, sobre.c, k), b = lerp(-Math.PI / 2, sobre.b, k);
    c.y -= 22 * Math.sin(Math.PI * k);
    const ap = Math.max(campana(t, T.chorro1, T.chorro1 + 0.24), campana(t, T.chorro2, T.chorro2 + 0.24));
    b += 0.05 * ap;
    // asomarse: lo baja junto al cuerpo; la llamarada: respingo
    const kAs = suave(fase(t, T.asoma0, T.asoma1));
    c = mezcla(c, { x: 406, y: 330 }, kAs); b = lerp(b, -0.9, kAs);
    const kF = salida(fase(t, T.fuum, T.fuum + 0.12));
    c = mezcla(c, { x: 392, y: 300 }, kF); b = lerp(b, -1.2, kF);
    return { c, b, aprieta: ap, mano: true };
  }

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.3 + 0.4) * (1 - 0.8 * tramo(t, T.fuum, T.fuum + 0.3));
    const p = { suelo: SY, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // asiente con cada vuelta y al relamerse
    let cab = b.cab;
    for (const [t0] of VUELTAS) cab += 0.05 * campana(t, t0 + 0.35, t0 + 0.7);
    cab += 0.06 * campana(t, T.relame + 0.45, T.relame + 0.75);
    // olfateo: tres golpecitos de nariz
    cab += -0.03 * Math.max(0, Math.sin((t - T.huele0) * 22)) * tramo(t, T.huele0 + 0.1, T.huele0 + 0.2) * (1 - tramo(t, T.huele1 - 0.15, T.huele1));
    // temblorcillo congelado
    const tiemb = tramo(t, T.fuum + 0.1, T.fuum + 0.3) * (1 - 0.7 * tramo(t, 9.3, 10.2));
    let x = b.x;
    const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
    x = (fc.x + 14 + fl.x - 20) / 2 + (b.x - (fc.x + 14 + fl.x - 20) / 2) * 0.35;
    let pelY = SY - (G.SUELO - G.PELVIS.y) * S + 1.2 * respira + b.pel * S;
    pelY -= 5 * Math.max(Math.sin(Math.PI * fc.u) * (fc.alza > 1 ? 1 : 0), Math.sin(Math.PI * fl.u) * (fl.alza > 1 ? 1 : 0));
    p.x = x; p.pelvis = { x: G.PELVIS.x, y: G.SUELO + (pelY - SY) / S };
    p.torso = b.torso + 0.008 * Math.sin(t * 43) * tiemb;
    p.cabeza.ang = cab + 0.01 * Math.sin(t * 1.7);
    const tobY = SY - G.TOBILLO_ALTO * S;
    p.piernas.cerca = { tob: G.aHoja(p, { x: fc.x, y: tobY - fc.alza }), ang: -0.22 * Math.sin(Math.PI * fc.u) * (fc.alza > 1 ? 1 : 0) };
    p.piernas.lejos = { tob: G.aHoja(p, { x: fl.x, y: tobY - fl.alza - 3 }), ang: -0.22 * Math.sin(Math.PI * fl.u) * (fl.alza > 1 ? 1 : 0) };
    // cara
    const e = linea(GUION_CG, CG, "mira", t);
    p.cara = cara(e, Math.max(parpadeo(t, PARP_G), parpLento(t)));
    p.chamusca = tramo(t, T.fuum + 0.15, T.fuum + 0.28);
    // manos
    const r = resolutor(G, p);
    const pz = pinzasEn(t), bt = boteEn(t);
    const tieneP = pz.mano === "G" || pz.ambas;
    const AGARRA = D(0.15, 0.12, 0.12, 0.12);
    // lejana: bolsillo → frota → pide (palma) → pinzas
    const PISTA_L = [
      [0, 0, { bols: "lejos" }],
      [T.frota0 - 0.15, T.frota0 + 0.05, { hoja: { x: 300, y: 520 }, mu: -2.2, dedos: D(0.6, 0.85, 0.85, 0.85), dobla: 1 }],
      [T.pide0, T.pide0 + 0.3, { scr: () => ({ x: G.aPantalla(p, G.tronco(p)(G.HOMBRO)).x + 70, y: 316 }), ref: CENTRO, mu: -2.75, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.coge - 0.14, T.coge, { scr: () => agarre(pinzasEn(T.coge)), ref: CENTRO, mu: -2.45, dedos: AGARRA, dobla: 1 }]
    ];
    let L = pista(PISTA_L, t, r);
    // se frota las manos: la lejana va y viene
    const fr = tramo(t, T.frota0, T.frota0 + 0.08) * (1 - tramo(t, T.frota1 - 0.08, T.frota1));
    L.x += 16 * Math.sin((t - T.frota0) * 26) * fr; L.y += 6 * Math.cos((t - T.frota0) * 26) * fr;
    // «dámelas»: los dedos se menean
    const pd = tramo(t, T.pide0 + 0.15, T.pide0 + 0.25) * (1 - tramo(t, T.coge - 0.16, T.coge - 0.06));
    if (pd > 0) { const w = 0.5 + 0.5 * Math.sin((t - T.pide0) * 24); L.dedos = DD(L.dedos, D(1, w, 1 - w * 0.6, w), pd * 0.85); }
    if (tieneP && t >= T.coge) {
      const aT = agarre(pz), mu = -2.5 + 0.35 * clamp((pz.a - 0.6) / -1.8) * 0 + (pz.a < 0 ? 0.55 * clamp(-pz.a / 1.25) : 0);
      const M = r({ scr: aT, ref: CENTRO, mu: mu, ang: 0, dedos: AGARRA, dobla: 1 });
      const k = suave(fase(t, T.coge - 0.04, T.coge + 0.02));
      L = { x: lerp(L.x, M.x, k), y: lerp(L.y, M.y, k), mu: lerp(L.mu, M.mu, k), ang: 0, puno: 1, dedos: DD(L.dedos, AGARRA, k), dobla: 1 };
    }
    // cercana: bolsillo → frota → bolsillo → bote
    const PISTA_C = [
      [0, 0, { bols: "cerca" }],
      [T.frota0 - 0.15, T.frota0 + 0.05, { hoja: { x: 330, y: 540 }, mu: -1.2, dedos: D(0.6, 0.85, 0.85, 0.85), dobla: -1 }],
      [T.frota1, T.frota1 + 0.3, { bols: "cerca" }],
      [T.bote0 - 0.2, T.bote0 + 0.2, { scr: BOTE_CARRO, ref: CENTRO, mu: -0.6, dedos: D(0.6, 0.3, 0.3, 0.3), dobla: -1 }]
    ];
    let C = pista(PISTA_C, t, r);
    C.x -= 14 * Math.sin((t - T.frota0) * 26) * fr; C.y -= 5 * Math.cos((t - T.frota0) * 26) * fr;
    if (bt.mano) {
      const M = r({ scr: bt.c, ref: CENTRO, mu: lerp(-0.6, -1.9, clamp((bt.b + 0.5) / 1)), ang: 0, dedos: D(0.3 + 0.1 * bt.aprieta, 0.15, 0.15, 0.15), dobla: -1 });
      C = { x: M.x, y: M.y, mu: M.mu, ang: 0, puno: 1, dedos: M.dedos, dobla: -1 };
    }
    p.manoLejos = manoDe(L); p.manoCerca = manoDe(C);
    return p;
  }

  /* =====================================================================================
   * PARADIGMA
   * ===================================================================================== */
  const XP0 = 688, XP1 = 652, XP2 = 728, XP3 = 760;
  const CP = {
    parrilla: E({ mx: 0.6, my: 0.9, c: 0.42, sd: 2, si: 4, sonr: 0.4, ancho: 0.9 }),
    miraG: E({ mx: 0.9, my: 0.1, c: 0.3, sd: 6, si: 18, gi: 0.08, sonr: 0.5, ancho: 0.92 }),
    encoge: E({ mx: 0.85, my: 0.0, c: 0.38, sd: 14, si: 14, sonr: 0.65, ancho: 0.95 }),
    pinzas: E({ mx: 0.6, my: -0.5, c: 0.25, sd: 8, si: 10, sonr: 0.55, ancho: 0.95 }),
    tranquilo: E({ mx: 0.9, my: 0.25, c: 0.35, sd: 4, si: 6, sonr: 0.4, ancho: 0.9 }),
    ceja: E({ mx: 0.9, my: 0.3, c: 0.3, sd: 0, gd: -0.05, si: 26, gi: 0.15, sonr: 0.15, ancho: 0.8 }),
    aparta: E({ mx: 0.9, my: 0.0, c: 0.55, sd: 2, si: 16, gi: 0.08, sonr: 0.3, ancho: 0.85 }),
    caza: E({ mx: 0.4, my: -0.4, c: 0.3, sd: 8, si: 10, sonr: 0.5, ancho: 0.9 }),
    salchicha: E({ mx: 0.35, my: 0.2, c: 0.2, sd: 10, si: 12, sonr: 0.45, ancho: 0.9 }),
    sopla: E({ mx: 0.3, my: 0.3, c: 0.5, sd: 6, si: 6, sonr: -0.2, ancho: 0.3, mof: 0.9 }),
    bocado: E({ mx: 0.3, my: 0.25, c: 0.4, sd: 6, si: 8, abre: 22, ancho: 0.75, sonr: 0.1 }),
    mm: E({ mx: 0.4, my: 0.0, c: 1, h: 1, sd: 10, si: 10, sonr: 0.7, ancho: 0.9, mof: 0.35 }),
    miraG2: E({ mx: 0.9, my: 0.2, c: 0.3, sd: 6, si: 14, sonr: 0.55, ancho: 0.95, mof: 0.2 }),
    camara: E({ mx: -0.35, my: -0.05, c: 0.25, sd: 10, si: 12, sonr: 0.65, ancho: 1 }),
    guino: E({ mx: -0.35, my: -0.05, c: 0.25, cd: 1, sd: 4, si: 16, sonr: 0.8, ancho: 1.02 })
  };
  const GUION_CP = [
    [T.pMira, T.pMira + 0.15, "miraG"], [T.encoge0, T.encoge0 + 0.15, "encoge"], [T.lanza0 - 0.1, T.lanza0 + 0.05, "pinzas"],
    [T.ofrece0, T.ofrece0 + 0.15, "miraG"], [T.suelta, T.suelta + 0.3, "tranquilo"], [T.ceja, T.ceja + 0.15, "ceja"],
    [T.pAtras2a + 0.05, T.pAtras2a + 0.25, "aparta"], [8.45, 8.6, "caza"], [T.mira2, T.mira2 + 0.2, "salchicha"],
    [T.sopla0, T.sopla0 + 0.12, "sopla"], [T.sopla1, T.sopla1 + 0.12, "salchicha"], [T.bocado - 0.12, T.bocado, "bocado"],
    [T.bocado + 0.1, T.bocado + 0.2, "salchicha"], [T.mm0, T.mm0 + 0.2, "mm"], [T.mm1, T.mm1 + 0.2, "miraG2"],
    [T.pCam, T.pCam + 0.25, "camara"], [T.guino, T.guino + 0.1, "guino"], [T.guino + 0.45, T.guino + 0.6, "camara"]
  ];
  const PARP_P = [1.6, 4.6, 6.1, 9.0, 11.7];
  const P0P = { x: XP0, pel: 0, torso: 0.12, cab: 0.12 };
  const CuP = o => Object.assign({}, P0P, o);
  const CUER_P = {
    parrilla: CuP({}),
    miraG: CuP({ torso: 0.04, cab: 0.0 }),
    encoge: CuP({ torso: 0.02, cab: -0.04, pel: -8 }),
    lanza: CuP({ torso: 0.0, cab: -0.12 }),
    ofrece: CuP({ x: XP1, torso: 0.1, cab: 0.04 }),
    atras: CuP({ x: XP2, torso: 0.0, cab: 0.0 }),
    aparta: CuP({ x: XP3, torso: -0.06, cab: -0.04 }),
    caza: CuP({ x: XP3, torso: 0.0, cab: -0.08 }),
    come: CuP({ x: XP3, torso: 0.03, cab: 0.05 })
  };
  const GUION_P = [
    [T.pMira, T.pMira + 0.2, "miraG"], [T.encoge0, T.encoge0 + 0.15, "encoge", salida], [T.encoge1 - 0.1, T.encoge1 + 0.1, "miraG"],
    [T.lanza0 - 0.08, T.lanza0 + 0.1, "lanza"], [T.caza, T.ofrece1, "ofrece"], [T.pAtras0, T.pAtras1, "atras"],
    [T.pAtras2a, T.pAtras2b, "aparta"], [8.3, 8.6, "caza"], [T.mira2, T.mira2 + 0.3, "come"]
  ];
  const PASOS_P = {
    cerca: [[-9, -8, XP0 + 16], [T.caza, T.caza + 0.22, XP1 + 16, 18], [T.pAtras0 + 0.2, T.pAtras0 + 0.45, XP2 + 18, 20], [T.pAtras2a + 0.2, T.pAtras2a + 0.42, XP3 + 18, 16]],
    lejos: [[-9, -8, XP0 - 20], [T.ofrece0 + 0.06, T.ofrece0 + 0.26, XP1 - 22, 18], [T.pAtras0, T.pAtras0 + 0.24, XP2 - 20, 20], [T.pAtras2a, T.pAtras2a + 0.22, XP3 - 20, 16]]
  };
  // dónde caza la salchicha y a dónde la sube para morder
  const CAZA_P = { x: 690, y: 286 }, MU_COME = 1.9, DB_COME = -1;
  function poseP(t) {
    const b = linea(GUION_P, CUER_P, "parrilla", t);
    const respira = Math.sin(t * 1.8 + 1.1);
    const p = { suelo: SY, s: S, espejo: true, tirasLimpias: true, piernas: {}, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // cabeceo tranquilo al compás de las vueltas y del «mm»
    let cab = b.cab + 0.03 * Math.sin(t * 3.4) * (1 - tramo(t, T.saca0 - 0.3, T.saca0));
    cab += 0.07 * Math.max(0, Math.sin((t - T.mm0) * 7)) * tramo(t, T.mm0, T.mm0 + 0.1) * (1 - tramo(t, T.mm1 - 0.2, T.mm1));
    cab += 0.03 * Math.sin((t - T.bocado) * 18) * tramo(t, T.bocado + 0.15, T.bocado + 0.25) * (1 - tramo(t, T.mm0, T.mm0 + 0.2));
    const fc = pie(PASOS_P.cerca, t), fl = pie(PASOS_P.lejos, t);
    const xm = (fc.x - 16 + fl.x + 20) / 2;
    const x = xm + (b.x - xm) * 0.35;
    let pelY = SY - (PA.SUELO - PA.PELVIS.y) * S + 1.0 * respira + b.pel * S;
    pelY -= 4 * Math.max(Math.sin(Math.PI * fc.u) * (fc.alza > 1 ? 1 : 0), Math.sin(Math.PI * fl.u) * (fl.alza > 1 ? 1 : 0));
    p.x = x; p.pelvis = { x: PA.PELVIS.x, y: PA.SUELO + (pelY - SY) / S };
    p.torso = b.torso; p.cabeza.ang = cab;
    const tobY = SY - PA.TOBILLO_ALTO * S;
    p.piernas.cerca = { tob: PA.aHoja(p, { x: fc.x, y: tobY - fc.alza }), ang: -0.22 * Math.sin(Math.PI * fc.u) * (fc.alza > 1 ? 1 : 0) };
    p.piernas.lejos = { tob: PA.aHoja(p, { x: fl.x, y: tobY - fl.alza - 3 }), ang: -0.22 * Math.sin(Math.PI * fl.u) * (fl.alza > 1 ? 1 : 0) };
    const e = linea(GUION_CP, CP, "parrilla", t);
    p.cara = cara(e, parpadeo(t, PARP_P));
    // masticar: la boca y el moflete se mueven
    const mast = tramo(t, T.bocado + 0.15, T.bocado + 0.25) * (1 - tramo(t, T.mm1, T.mm1 + 0.3));
    if (mast > 0) { const w = Math.max(0, Math.sin((t - T.bocado) * 15)); p.cara.boca.abre += 5 * w * mast; p.cara.mofletes = Math.max(p.cara.mofletes, (0.35 + 0.25 * w) * mast); }
    // manos
    const r = resolutor(PA, p);
    const pz = pinzasEn(t);
    const AGARRA = D(0.15, 0.12, 0.12, 0.12), PELLIZCO = D5(0.62, 0.58, 0.25, 0.18, 0.15);
    let L;
    if (pz.mano === "P" || (pz.mano === null && t < T.caza)) {
      if (pz.mano === "P") {
        const aT = agarre(pz);
        // el antebrazo sigue a las pinzas (marco de la hoja: él mira a la derecha)
        const aHojaPz = Math.PI - pz.a;
        L = r({ scr: aT, ref: CENTRO, mu: aHojaPz + Math.PI - 0.35, ang: 0, dedos: AGARRA, dobla: 1 });
      } else {
        // en el aire: la mano espera abierta
        const k = fase(t, T.lanza0, T.caza);
        const espera = { x: 600, y: 286 + 10 * Math.sin(Math.PI * k) };
        L = r({ scr: espera, ref: CENTRO, mu: -2.2, ang: 0, dedos: D(0.6, 0.6, 0.6, 0.6), dobla: 1 });
      }
    } else {
      // suelta las pinzas: al bolsillo; luego caza la salchicha, sopla y muerde
      const sal = () => salchichaP(t, p).pinza;
      const PISTA_L = [
        [0, 0, { scr: agarre(pinzasEn(T.suelta - 0.01)), ref: CENTRO, mu: -2.3, dedos: AGARRA, dobla: 1 }],
        [T.suelta, T.suelta + 0.35, { bols: "lejos" }],
        [8.3, 8.62, { scr: CAZA_P, ref: PINZA, mu: MU_COME, dedos: D5(0.75, 0.75, 0.6, 0.5, 0.45), dobla: DB_COME }, salida],
        [8.62, T.coge2 - 0.02, { scr: CAZA_P, ref: PINZA, mu: MU_COME, dedos: D5(0.75, 0.75, 0.6, 0.5, 0.45), dobla: DB_COME }],
        [T.coge2 - 0.02, T.coge2 + 0.06, { scr: CAZA_P, ref: PINZA, mu: MU_COME, dedos: PELLIZCO, dobla: DB_COME }],
        [T.mira2, T.mira2 + 0.3, { scr: () => bocaP(p, 50, 42), ref: PINZA, mu: MU_COME, dedos: PELLIZCO, dobla: DB_COME }],
        [T.sopla0 - 0.1, T.sopla0 + 0.12, { scr: () => bocaP(p, 44, 30), ref: PINZA, mu: MU_COME, dedos: PELLIZCO, dobla: DB_COME }],
        [T.bocado - 0.22, T.bocado - 0.02, { scr: () => bocaP(p, 24, 26), ref: PINZA, mu: MU_COME, dedos: PELLIZCO, dobla: DB_COME }, entrada],
        [T.bocado + 0.08, T.bocado + 0.4, { scr: () => bocaP(p, 48, 46), ref: PINZA, mu: MU_COME, dedos: PELLIZCO, dobla: DB_COME }],
        [T.alza - 0.1, T.alza + 0.3, { scr: () => bocaP(p, 60, -2), ref: PINZA, mu: MU_COME + 0.2, dedos: PELLIZCO, dobla: DB_COME }, salida]
      ];
      L = pista(PISTA_L, t, r);
      void sal;
    }
    if (pz.ambas) {
      // Guillermo ya ha cogido: Paradigma aún sujeta hasta soltar
      L = r({ scr: agarre(pz), ref: CENTRO, mu: -2.3, ang: 0, dedos: AGARRA, dobla: 1 });
    }
    // encogerse de hombros: la cercana sale del bolsillo con la palma arriba
    const PISTA_C = [
      [0, 0, { bols: "cerca" }],
      [T.encoge0 - 0.05, T.encoge0 + 0.15, { hoja: { x: 40, y: 560 }, mu: -1.0, dedos: D(1, 1, 1, 1), dobla: -1 }, salida],
      [T.encoge1, T.encoge1 + 0.3, { bols: "cerca" }]
    ];
    const C = pista(PISTA_C, t, r);
    p.manoLejos = manoDe(L); p.manoCerca = manoDe(C);
    return p;
  }
  const bocaP = (p, dx, dy) => { const b = PA.aPantalla(p, PA.boca(p)); return { x: b.x - dx, y: b.y + dy }; };
  // la salchicha de Paradigma (en la mano, pantalla): pellizcada por un extremo; el otro hacia la boca
  function salchichaP(t, p) {
    const m = p.manoLejos;
    const pinza = ptMano(PA, p, m, PINZA);
    const bc = PA.aPantalla(p, PA.boca(p));
    const a = Math.atan2(bc.y - pinza.y, bc.x - pinza.x);
    let aR = t < T.mira2 ? lerp(-1.2, a, suave(fase(t, T.coge2, T.mira2))) : a;
    aR = lerp(aR, -1.35, tramo(t, T.alza - 0.1, T.alza + 0.3));
    return { pinza, a: aR };
  }

  /* =====================================================================================
   * CHAMUSCADO DE GUILLERMO (retrato): cejas fuera, hollín, puntas negras y humo
   * ===================================================================================== */
  const PZC = G.A.datos.piezas.cabeza, OJO_D = PZC.ojos.derecho, OJO_I = PZC.ojos.izquierdo;
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  // hollín: manchas sueltas gris-negras con grano (frente, mejilla, punta de la nariz, cejas) y dos restregones;
  // la piel se sigue viendo. Se pinta una vez en un lienzo del tamaño de la cabeza.
  const MANCHAS = [   // x, y, rx, ry, giro, opacidad (retrato)
    [790, 515, 60, 26, -0.2, 0.72], [706, 506, 26, 40, 0.3, 0.55], [770, 548, 54, 15, -0.15, 0.5], [906, 594, 30, 13, 0.4, 0.5],
    [700, 672, 50, 36, -0.4, 0.68], [876, 688, 22, 16, 0.4, 0.85], [815, 806, 22, 13, 0.3, 0.45]
  ];
  const RESTREGONES = [[[648, 628], [690, 664], [738, 716]], [[910, 690], [892, 728], [866, 766]], [[742, 478], [800, 494], [858, 512]]];
  let HOLLIN = null;
  function creaHollin() {
    const pz = PZC, c = lienzo(pz.tam_hoja[0], pz.tam_hoja[1]), g = c.getContext("2d");
    g.translate(-pz.origen[0], -pz.origen[1]);
    g.beginPath(); camino(g, PIEL_CAB); g.clip();
    g.beginPath(); g.rect(400, 100, 800, 900); camino(g, OJO_D); camino(g, OJO_I); g.clip("evenodd");
    g.lineCap = "round"; g.lineJoin = "round";
    // restregones (dos pasadas: una ancha y suave, otra estrecha)
    for (const L of RESTREGONES) for (const [w, a] of [[30, 0.16], [15, 0.3]]) {
      g.beginPath(); g.moveTo(L[0][0], L[0][1]); g.quadraticCurveTo(L[1][0], L[1][1], L[2][0], L[2][1]);
      g.lineWidth = w; g.strokeStyle = `rgba(34,33,35,${a})`; g.stroke();
    }
    // manchas de bordes suaves
    for (const [x, y, rx, ry, r, a] of MANCHAS) {
      g.save(); g.translate(x, y); g.rotate(r); g.scale(rx / ry, 1);
      const gm = g.createRadialGradient(0, 0, 0, 0, 0, ry);
      gm.addColorStop(0, `rgba(30,29,31,${a})`); gm.addColorStop(0.55, `rgba(34,33,35,${a * 0.78})`); gm.addColorStop(1, "rgba(34,33,35,0)");
      g.fillStyle = gm; g.beginPath(); g.arc(0, 0, ry, 0, TAU); g.fill();
      g.restore();
    }
    // grano: motas negras y algo de ceniza clara dentro de cada mancha
    let n = 0;
    for (const [x, y, rx, ry, r, a] of MANCHAS) for (let i = 0; i < 26; i++, n++) {
      const ang = hash(n * 2.7) * TAU, d = Math.sqrt(hash(n * 5.3)) * 1.15;
      const q = rota({ x: Math.cos(ang) * rx * d, y: Math.sin(ang) * ry * d }, r);
      const claro = hash(n * 9.1) < 0.22;
      g.fillStyle = claro ? "rgba(178,176,178,0.5)" : `rgba(22,21,23,${(0.3 + 0.35 * hash(n * 3.9)) * Math.min(1, a + 0.2)})`;
      g.beginPath(); g.arc(x + q.x, y + q.y, (claro ? 2.5 : 3) + 3.5 * hash(n * 7.7), 0, TAU); g.fill();
    }
    return c;
  }
  function hollin(g, k) {
    if (k <= 0.003 || !HOLLIN) return;
    g.save(); g.globalAlpha = k; g.drawImage(HOLLIN, PZC.origen[0], PZC.origen[1]); g.restore();
  }
  // cejas: zona donde se repinta la cabeza (sin cejas) — rectángulos de las piezas, ampliados hacia arriba, sin los ojos
  const CEJAS = [[692, 446, 190, 136], [858, 528, 110, 88]];
  function sinCejas(g, k) {
    if (k <= 0.003) return;
    g.save(); g.globalAlpha = k;
    g.beginPath(); for (const [x, y, w, h] of CEJAS) g.rect(x, y, w, h); g.clip();
    g.beginPath(); g.rect(400, 300, 700, 700); camino(g, OJO_D); camino(g, OJO_I); g.clip("evenodd");
    RC.pieza(g, G.A, "cabeza");
    g.restore();
    // restos de ceja: una raya chamuscada y ricitos negros que humean
    g.save(); g.globalAlpha = k; g.lineCap = "round"; g.lineJoin = "round";
    const BR = [[[724, 540], [750, 522], [780, 514], [812, 517], [842, 528]], [[880, 588], [900, 580], [924, 582], [946, 592]]];
    for (const L of BR) {
      g.beginPath(); g.moveTo(L[0][0], L[0][1]); for (const [x, y] of L) g.lineTo(x, y);
      g.lineWidth = 15; g.strokeStyle = "rgba(34,33,35,0.42)"; g.stroke();
      // pelillos rizados (chamuscados)
      for (let i = 0; i < L.length - 1; i++) for (let j = 0; j < 3; j++) {
        const u = (j + 0.5) / 3, x = lerp(L[i][0], L[i + 1][0], u), y = lerp(L[i][1], L[i + 1][1], u) - 3;
        g.beginPath(); g.moveTo(x - 4, y + 3); g.quadraticCurveTo(x - 5, y - 6, x, y - 6); g.quadraticCurveTo(x + 5, y - 6, x + 3, y - 1); g.quadraticCurveTo(x + 1, y + 2, x - 1, y - 2);
        g.lineWidth = 3.4; g.strokeStyle = "#16100e"; g.stroke();
      }
    }
    g.restore();
  }
  // puntas de los pinchos (retrato): las más alejadas del centro de la cara
  const CC = { x: 800, y: 600 };
  const PUNTAS = [[539, 310], [623, 237], [729, 199], [785, 182], [903, 186], [958, 208], [1046, 234], [1119, 291], [1117, 430], [1105, 512]];
  let PUNTAS_NEGRAS = null;
  function creaPuntas() {
    const pz = PZC, c = lienzo(pz.tam_hoja[0], pz.tam_hoja[1]), g = c.getContext("2d");
    g.translate(-pz.origen[0], -pz.origen[1]);
    RC.pieza(g, G.A, "cabeza");
    // chamusca el pelo de fuera (solo donde hay pelo: source-atop), más cuanto más lejos del centro
    g.globalCompositeOperation = "source-atop";
    const gr = g.createRadialGradient(CC.x, CC.y, 286, CC.x, CC.y, 450);
    gr.addColorStop(0, "rgba(34,20,14,0)"); gr.addColorStop(0.3, "rgba(34,20,14,0.55)"); gr.addColorStop(0.6, "rgba(22,14,10,0.9)"); gr.addColorStop(1, "rgba(14,10,8,0.97)");
    g.fillStyle = gr; g.fillRect(CC.x - 460, CC.y - 460, 920, 920);
    // vetas grises de ceniza en las puntas
    g.strokeStyle = "rgba(150,140,136,0.55)"; g.lineWidth = 5; g.lineCap = "round";
    for (const [x, y] of PUNTAS) { const dx = x - CC.x, dy = y - CC.y, L = Math.hypot(dx, dy); g.beginPath(); g.moveTo(x - dx / L * 40, y - dy / L * 40); g.lineTo(x - dx / L * 12, y - dy / L * 12); g.stroke(); }
    // solo se queda el anillo de fuera
    g.globalCompositeOperation = "destination-in";
    const gm = g.createRadialGradient(CC.x, CC.y, 282, CC.x, CC.y, 300);
    gm.addColorStop(0, "rgba(0,0,0,0)"); gm.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = gm; g.fillRect(CC.x - 460, CC.y - 460, 920, 920);
    return c;
  }
  function capaG(g, t, p) {
    const k = p.chamusca || 0;
    if (k <= 0.003) return;
    sinCejas(g, k);
    hollin(g, k);
    if (PUNTAS_NEGRAS) { g.save(); g.globalAlpha = k; g.drawImage(PUNTAS_NEGRAS, PZC.origen[0], PZC.origen[1]); g.restore(); }
  }
  // humo de las puntas (pantalla): hilillos que suben y se mecen; muy espeso justo después y luego fino
  const HUMO_P = [0, 1, 3, 4, 6, 7, 8];
  function humoPelo(g, t, p) {
    const k = p.chamusca || 0; if (k <= 0.01) return;
    const fuerza = 1 + 1.6 * Math.exp(-Math.max(0, t - T.fuum - 0.3) * 1.2);
    g.save();
    for (const i of HUMO_P) {
      const [px, py] = PUNTAS[i], q = G.aPantalla(p, G.cabeza(p).a({ x: px, y: py }));
      for (let j = 0; j < 6; j++) {
        const per = 1.6, ph = ((t - T.fuum) / per + j / 6 + hash(i) * 0.3) % 1;
        if (t - T.fuum < ph * per) continue;
        const y = q.y - 70 * ph * (0.8 + 0.3 * hash(i * 2.2)), x = q.x + 10 * Math.sin(ph * 5 + i * 1.3 + t * 0.8) * ph + 6 * ph;
        g.globalAlpha = 0.34 * k * Math.sin(Math.PI * ph) * Math.min(1.6, fuerza) * (0.7 + 0.3 * hash(i + j));
        g.fillStyle = j % 2 ? "#9a9496" : "#bdb8b9";
        g.beginPath(); g.arc(x, y, (2.5 + 9 * ph) * (0.8 + 0.4 * (fuerza - 1)), 0, TAU); g.fill();
      }
    }
    // brasitas en las puntas: titilan y se van apagando
    for (const [i, f] of [[2, 0], [5, 1.7], [7, 3.1], [8, 4.4]]) {
      const [px, py] = PUNTAS[i], q = G.aPantalla(p, G.cabeza(p).a({ x: px, y: py }));
      const kb = k * (0.35 + 0.65 * Math.exp(-Math.max(0, t - T.fuum - 0.3) * 0.5)) * (0.55 + 0.45 * Math.sin(t * 7 + f));
      g.globalAlpha = clamp(kb);
      const gb = g.createRadialGradient(q.x, q.y, 0.5, q.x, q.y, 6); gb.addColorStop(0, "#fff0a8"); gb.addColorStop(0.4, "#ff8a2a"); gb.addColorStop(1, "rgba(255,80,20,0)");
      g.fillStyle = gb; g.beginPath(); g.arc(q.x, q.y, 6, 0, TAU); g.fill();
    }
    // la llamita final de un pincho: sale, tiembla y se apaga con un anillo de humo
    const ll = campana(t, T.llama, T.llama + 0.62);
    const q = G.aPantalla(p, G.cabeza(p).a({ x: PUNTAS[4][0], y: PUNTAS[4][1] + 6 }));
    if (ll > 0.01) {
      const h = ll * (24 + 3 * Math.sin(t * 40));
      g.globalAlpha = 1;
      g.beginPath(); g.moveTo(q.x - 8 * ll, q.y); g.quadraticCurveTo(q.x - 9 * ll, q.y - h * 0.6, q.x + Math.sin(t * 23) * 3, q.y - h); g.quadraticCurveTo(q.x + 9 * ll, q.y - h * 0.5, q.x + 8 * ll, q.y); g.closePath();
      g.fillStyle = "#ff9a2e"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#a6380d"; g.stroke();
      g.beginPath(); g.ellipse(q.x, q.y - h * 0.3, 3.4 * ll, h * 0.28, 0, 0, TAU); g.fillStyle = "#ffe8a0"; g.fill();
    }
    const an = fase(t, T.llama + 0.62, T.llama + 1.7);
    if (an > 0 && an < 1) {
      g.globalAlpha = 0.6 * (1 - an); g.strokeStyle = "#a8a2a4"; g.lineWidth = 3 + 2 * an;
      g.beginPath(); g.ellipse(q.x + 4 * an, q.y - 8 - 46 * an, 5 + 9 * an, 2 + 3 * an, 0, 0, TAU); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * FONDO: jardín de atrás, tarde de verano
   * ===================================================================================== */
  let FONDO = null;
  const CARRO = { x0: 168, x1: 302, top: 330, balda: 440 };
  function creaFondo() {
    const c = lienzo(W + 120, H + 80), g = c.getContext("2d"); g.translate(60, 40);
    g.lineJoin = "round"; g.lineCap = "round";
    // cielo de atardecer
    const gc = g.createLinearGradient(0, -40, 0, 330); gc.addColorStop(0, "#43629a"); gc.addColorStop(0.45, "#c97f8a"); gc.addColorStop(0.75, "#f1a56e"); gc.addColorStop(1, "#ffd89a");
    g.fillStyle = gc; g.fillRect(-60, -40, W + 120, 380);
    // sol bajo y su halo (detrás de la valla)
    const gs = g.createRadialGradient(812, 286, 10, 812, 286, 240); gs.addColorStop(0, "rgba(255,246,206,0.95)"); gs.addColorStop(0.15, "rgba(255,226,150,0.6)"); gs.addColorStop(1, "rgba(255,190,120,0)");
    g.fillStyle = gs; g.fillRect(560, 40, 520, 300);
    g.fillStyle = "#fff6d4"; g.beginPath(); g.arc(812, 286, 34, 0, TAU); g.fill();
    // nubes rosadas
    g.fillStyle = "rgba(255,214,200,0.7)";
    for (const [x, y, s] of [[300, 70, 1.2], [620, 46, 0.9], [930, 96, 1]]) { g.beginPath(); g.ellipse(x, y, 70 * s, 11 * s, 0, 0, TAU); g.ellipse(x + 40 * s, y - 7 * s, 40 * s, 10 * s, 0, 0, TAU); g.fill(); }
    // árboles detrás de la valla (siluetas en dos tonos)
    for (const [x, y, r, col] of [[90, 230, 90, "#3e5a46"], [260, 250, 70, "#4a6a4e"], [430, 236, 80, "#3e5a46"], [600, 256, 60, "#55734f"], [950, 226, 92, "#3e5a46"], [1060, 250, 70, "#4a6a4e"]]) {
      g.fillStyle = col;
      for (let i = 0; i < 7; i++) { const a = i * 0.9, rr = r * (0.55 + 0.3 * hash(x + i)); g.beginPath(); g.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.35 - 20, rr, 0, TAU); g.fill(); }
      g.fillStyle = "rgba(255,200,140,0.18)"; g.beginPath(); g.arc(x + r * 0.3, y - r * 0.4, r * 0.5, 0, TAU); g.fill();
    }
    // valla de tablas con remate en pico
    const vy0 = 288, vy1 = 476;
    for (let i = 0, x = 120; x < W + 70; x += 34, i++) {
      const top = vy0 + (i % 2 ? 6 : 0);
      const gb = g.createLinearGradient(x, 0, x + 32, 0); gb.addColorStop(0, "#b47a4b"); gb.addColorStop(1, "#97613a");
      g.fillStyle = gb; g.beginPath(); g.moveTo(x, top + 10); g.lineTo(x + 16, top); g.lineTo(x + 32, top + 10); g.lineTo(x + 32, vy1); g.lineTo(x, vy1); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,30,14,0.55)"; g.lineWidth = 2; g.stroke();
      g.strokeStyle = "rgba(80,40,20,0.25)"; g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 7 + k * 9, top + 18); g.lineTo(x + 6 + k * 9, vy1 - 6); g.stroke(); }
      // luz del sol rasante en el canto
      g.fillStyle = "rgba(255,210,140,0.25)"; g.fillRect(x + 1, top + 8, 4, vy1 - top - 8);
    }
    g.fillStyle = "#7d4f2d"; g.fillRect(100, 330, W + 60, 9); g.fillRect(100, 432, W + 60, 9);
    g.fillStyle = "rgba(255,220,160,0.3)"; g.fillRect(100, 330, W + 60, 2.5); g.fillRect(100, 432, W + 60, 2.5);
    // la pared de la casa a la izquierda, con su ventana encendida y un aplique
    g.fillStyle = "#e6c9a1"; g.fillRect(-60, -40, 182, 520);
    g.fillStyle = "rgba(120,70,40,0.18)"; g.fillRect(100, -40, 22, 520);
    for (let y = -30; y < 480; y += 26) { g.strokeStyle = "rgba(150,100,60,0.18)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-60, y); g.lineTo(122, y); g.stroke(); }
    g.fillStyle = "#5a3a26"; g.fillRect(-6, 150, 96, 128);
    const gv = g.createLinearGradient(0, 158, 0, 270); gv.addColorStop(0, "#ffe2a0"); gv.addColorStop(1, "#f0a95e");
    g.fillStyle = gv; g.fillRect(2, 158, 80, 112);
    g.strokeStyle = "#5a3a26"; g.lineWidth = 5; g.beginPath(); g.moveTo(42, 158); g.lineTo(42, 270); g.moveTo(2, 212); g.lineTo(82, 212); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.moveTo(8, 200); g.lineTo(30, 162); g.lineTo(38, 162); g.lineTo(8, 214); g.fill();
    g.fillStyle = "#7d4f2d"; g.fillRect(-12, 276, 108, 10);
    // maceta con geranios bajo la ventana
    g.fillStyle = "#b5532e"; g.fillRect(4, 286, 76, 22); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(4, 286, 76, 22);
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 3 ? "#e8434f" : "#4f8a3e"; g.beginPath(); g.arc(10 + i * 8.5, 282 - (i % 2) * 6, 6, 0, TAU); g.fill(); }
    // césped y losas
    const gh = g.createLinearGradient(0, 470, 0, 600); gh.addColorStop(0, "#7aa64a"); gh.addColorStop(1, "#4f7d32");
    g.fillStyle = gh; g.fillRect(-60, 470, W + 120, 150);
    g.fillStyle = "rgba(40,70,20,0.25)"; g.fillRect(-60, 470, W + 120, 10);
    // losas de piedra bajo la barbacoa
    g.save(); g.beginPath(); g.ellipse(520, 552, 360, 46, 0, 0, TAU); g.clip();
    g.fillStyle = "#cdbfa8"; g.fillRect(140, 500, 760, 110);
    g.strokeStyle = "rgba(110,95,75,0.6)"; g.lineWidth = 2;
    for (let i = -6; i < 12; i++) { g.beginPath(); g.moveTo(180 + i * 70, 506); g.lineTo(160 + i * 76, 600); g.stroke(); }
    for (const y of [526, 556, 586]) { g.beginPath(); g.moveTo(140, y); g.lineTo(900, y); g.stroke(); }
    g.restore();
    g.strokeStyle = "rgba(60,90,30,0.6)"; g.lineWidth = 2; g.beginPath(); g.ellipse(520, 552, 360, 46, 0, 0, TAU); g.stroke();
    // matas de hierba
    for (let i = 0; i < 70; i++) {
      const x = hash(i * 3.3) * (W + 100) - 50, y = 486 + hash(i * 5.1) * 110;
      if (Math.pow((x - 520) / 360, 2) + Math.pow((y - 552) / 46, 2) < 1) continue;
      g.strokeStyle = hash(i) < 0.5 ? "#3f6a28" : "#8fbf56"; g.lineWidth = 2;
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + k * 3, y - 5, x + k * 5, y - 10 - hash(i + k) * 4); g.stroke(); }
    }
    // la guirnalda de bombillas: cable en catenaria (las bombillas brillan en vivo)
    g.strokeStyle = "#2a2228"; g.lineWidth = 2.2;
    g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, q = guirnalda(u); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); } g.stroke();
    // poste de la guirnalda a la derecha
    g.fillStyle = "#4f3a2a"; g.fillRect(1006, 96, 9, 400); g.fillStyle = "rgba(255,210,150,0.3)"; g.fillRect(1006, 96, 2.5, 400);
    // tumbona plegable a la derecha (al fondo)
    g.save(); g.translate(930, 470);
    g.strokeStyle = "#6b4a30"; g.lineWidth = 5; g.beginPath(); g.moveTo(-40, 40); g.lineTo(10, -20); g.moveTo(-10, -20); g.lineTo(40, 40); g.moveTo(-34, 6); g.lineTo(34, 6); g.stroke();
    g.fillStyle = "#3f86b5"; g.beginPath(); g.moveTo(-30, 2); g.lineTo(28, 2); g.lineTo(14, -34); g.lineTo(-12, -40); g.closePath(); g.fill();
    g.fillStyle = "#f3efe4"; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-24 + k * 18, 2); g.lineTo(-16 + k * 18, 2); g.lineTo(-6 + k * 12, -38); g.lineTo(-12 + k * 12, -39); g.closePath(); g.fill(); }
    g.restore();
    // velo cálido de la tarde
    const gw = g.createLinearGradient(-60, 0, W + 60, 200); gw.addColorStop(0, "rgba(255,170,120,0.08)"); gw.addColorStop(1, "rgba(255,220,150,0.16)");
    g.fillStyle = gw; g.fillRect(-60, -40, W + 120, H + 80);
    // el carrito de madera (izquierda)
    const { x0, x1, top, balda } = CARRO;
    const madera = (x, y, w, h) => { const gm = g.createLinearGradient(0, y, 0, y + h); gm.addColorStop(0, "#c48a55"); gm.addColorStop(1, "#8e5a32"); g.fillStyle = gm; g.fillRect(x, y, w, h); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.strokeRect(x, y, w, h); };
    for (const x of [x0 + 6, x1 - 14]) madera(x, top + 8, 8, SY - top - 18);
    madera(x0, top, x1 - x0, 11); madera(x0 + 4, balda, x1 - x0 - 8, 9);
    for (const x of [x0 + 10, x1 - 10]) { g.beginPath(); g.arc(x, SY - 8, 9, 0, TAU); g.fillStyle = "#2a2228"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke(); g.beginPath(); g.arc(x, SY - 8, 3, 0, TAU); g.fillStyle = "#b9bec6"; g.fill(); }
    // en la balda: una cesta con carbón
    g.fillStyle = "#6e4a2a"; g.beginPath(); g.moveTo(x0 + 20, balda); g.lineTo(x0 + 26, balda - 26); g.lineTo(x0 + 74, balda - 26); g.lineTo(x0 + 80, balda); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    for (let i = 0; i < 7; i++) { g.fillStyle = "#2b2a2e"; g.beginPath(); g.arc(x0 + 32 + i * 6.5, balda - 27 - (i % 2) * 3, 5, 0, TAU); g.fill(); }
    // arriba: plato con panecillos, kétchup y mostaza (sin etiquetas)
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(x0 + 30, top - 2, 26, 6, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    for (const dx of [-12, 2, 14]) { g.fillStyle = "#e0a256"; g.beginPath(); g.ellipse(x0 + 30 + dx, top - 9, 10, 6, 0, Math.PI, TAU); g.closePath(); g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "rgba(255,240,200,0.6)"; g.beginPath(); g.ellipse(x0 + 28 + dx, top - 12, 4, 1.6, 0, 0, TAU); g.fill(); }
    const frasco = (x, col, alto) => {
      g.beginPath(); g.moveTo(x - 7, top); g.lineTo(x - 7, top - alto + 8); g.quadraticCurveTo(x - 7, top - alto, x, top - alto); g.quadraticCurveTo(x + 7, top - alto, x + 7, top - alto + 8); g.lineTo(x + 7, top); g.closePath();
      g.fillStyle = col; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(x - 5, top - alto + 8, 2, alto - 12);
      g.beginPath(); g.moveTo(x - 2, top - alto); g.lineTo(x - 1, top - alto - 7); g.lineTo(x + 1, top - alto - 7); g.lineTo(x + 2, top - alto); g.fillStyle = col; g.fill(); g.stroke();
    };
    frasco(x0 + 74, "#d33a2c", 30); frasco(x0 + 94, "#f0c43a", 28);
    return c;
  }
  // guirnalda: de la esquina de la casa al poste (pantalla)
  const guirnalda = u => ({ x: lerp(118, 1010, u), y: lerp(112, 104, u) + 64 * Math.sin(Math.PI * u) + 14 * Math.sin(Math.PI * u * 3) * 0 });
  function bombillas(g, t, flash) {
    g.save();
    for (let i = 1; i < 14; i++) {
      const u = i / 14, q = guirnalda(u), y = q.y + 8;
      const tit = 0.85 + 0.15 * Math.sin(t * 1.3 + i * 1.7);
      const gl = g.createRadialGradient(q.x, y + 4, 1, q.x, y + 4, 24); gl.addColorStop(0, `rgba(255,232,170,${0.55 * tit})`); gl.addColorStop(1, "rgba(255,210,140,0)");
      g.fillStyle = gl; g.beginPath(); g.arc(q.x, y + 4, 24, 0, TAU); g.fill();
      g.strokeStyle = "#2a2228"; g.lineWidth = 2; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x, y - 2); g.stroke();
      g.fillStyle = "#3b3236"; g.fillRect(q.x - 2.5, y - 3, 5, 4);
      g.fillStyle = `rgb(255,${Math.round(226 + 20 * tit)},${Math.round(150 + 40 * tit)})`; g.beginPath(); g.ellipse(q.x, y + 5, 4.2, 6, 0, 0, TAU); g.fill();
      g.lineWidth = 1.3; g.strokeStyle = "rgba(120,80,30,0.8)"; g.stroke();
    }
    g.restore();
    void flash;
  }

  /* =====================================================================================
   * EFECTOS: humo de la parrilla, olor, chisporroteo, chorro, llamarada, humo, rayitas
   * ===================================================================================== */
  function humoParrilla(g, t, fuerza) {
    g.save();
    for (let i = 0; i < 9; i++) {
      const per = 2.6, ph = ((t / per) + i / 9) % 1;
      const x0 = GC.x - 50 + (i * 37) % 100, y = GC.y - 6 - 120 * ph, x = x0 + 14 * Math.sin(ph * 4 + i) + 30 * ph;
      g.globalAlpha = 0.14 * Math.sin(Math.PI * ph) * fuerza;
      g.fillStyle = "#e9e3df"; g.beginPath(); g.arc(x, y, 6 + 16 * ph, 0, TAU); g.fill();
    }
    g.restore();
  }
  // calima sobre las brasas: rayitas ondulantes muy suaves
  function calima(g, t) {
    g.save(); g.strokeStyle = "rgba(255,230,200,0.22)"; g.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const x = GC.x - 45 + i * 30, ph = (t * 0.7 + i * 0.27) % 1;
      g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); for (let k = 0; k <= 10; k++) { const y = GC.y - 14 - k * 5 - ph * 16; const xx = x + 3 * Math.sin(k * 1.1 + t * 5 + i); k ? g.lineTo(xx, y) : g.moveTo(xx, y); } g.stroke();
    }
    g.restore();
  }
  // olor: un hilillo ondulado de la parrilla a la nariz de Guillermo
  function olor(g, t, pG) {
    const k = campana(t, T.huele0 - 0.1, T.huele1 + 0.1); if (k <= 0.01) return;
    const nariz = G.aPantalla(pG, G.cabeza(pG).a({ x: 990, y: 620 }));
    g.save(); g.strokeStyle = "rgba(255,248,236,0.85)"; g.lineCap = "round";
    for (let j = 0; j < 2; j++) {
      g.globalAlpha = 0.75 * k; g.lineWidth = 3 - j;
      g.beginPath();
      for (let i = 0; i <= 20; i++) {
        const u = i / 20, x = lerp(GC.x - 10 + j * 18, nariz.x + 8, u), y = lerp(GC.y - 20, nariz.y, u) - 30 * Math.sin(Math.PI * u) + 7 * Math.sin(u * 12 - t * 7 + j);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    g.restore();
  }
  // chisporroteo al dejar cada salchicha
  function chisporroteo(g, t) {
    const lista = VUELTAS.map(([t0, j]) => [t0 + VD.llega + VD.agarra + VD.sube + VD.baja, SAL[j]])
      .concat(VUELOS.filter(v => v.fin).map(v => [v.t1, v.fin]));
    g.save(); g.lineCap = "round";
    for (const [t0, s] of lista) {
      const e = t - t0; if (e < 0 || e > 0.7) continue;
      const k = e / 0.7;
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.45, d = 8 + 18 * k;
        g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = i % 2 ? "#fff3c8" : "#ffd27a"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(s.x + Math.cos(a) * d, s.y - 4 + Math.sin(a) * d); g.lineTo(s.x + Math.cos(a) * (d + 5), s.y - 4 + Math.sin(a) * (d + 5)); g.stroke();
      }
      g.globalAlpha = 0.35 * (1 - k); g.fillStyle = "#f2ece8";
      g.beginPath(); g.arc(s.x + 4, s.y - 12 - 20 * k, 6 + 10 * k, 0, TAU); g.fill();
    }
    g.restore();
  }
  // «clac» de las pinzas
  function clac(g, t) {
    for (const tc of [T.clac1, T.clac2]) {
      const k = campana(t, tc, tc + 0.22); if (k <= 0.01) continue;
      const pz = pinzasEn(tc), q = puntas(pz.H, pz.a);
      rayitas(g, q.x + 4, q.y - 4, k, -0.6, 3, TINTA, 10);
    }
  }
  // el chorro de líquido: dos chorros en arco hasta las brasas
  function chorro(g, t) {
    for (const tc of [T.chorro1, T.chorro2]) {
      const e = t - tc; if (e < 0 || e > 0.42) continue;
      const bt = boteEn(Math.min(t, tc + 0.12)), n = boquilla(bt.c, bt.b);
      const fin = { x: GC.x - 18 + (tc === T.chorro2 ? 26 : 0), y: GC.y };
      const cab = Math.min(1, e / 0.12), cola = clamp((e - 0.18) / 0.24);
      g.save(); g.lineCap = "round";
      const pt = u => ({ x: lerp(n.x, fin.x, u), y: lerp(n.y, fin.y, u) - 38 * Math.sin(Math.PI * u) * (1 - u * 0.4) });
      g.beginPath(); let prim = true;
      for (let i = 0; i <= 24; i++) { const u = lerp(cola, cab, i / 24), q = pt(u); prim ? g.moveTo(q.x, q.y) : g.lineTo(q.x, q.y); prim = false; }
      g.lineWidth = 4.5; g.strokeStyle = "rgba(40,70,110,0.55)"; g.stroke();
      g.lineWidth = 2.6; g.strokeStyle = "rgba(210,236,255,0.95)"; g.stroke();
      // gotas
      for (let i = 0; i < 4; i++) { const u = lerp(cola, cab, (i + 0.5) / 4), q = pt(u); g.fillStyle = "rgba(220,240,255,0.9)"; g.beginPath(); g.arc(q.x + 3 * Math.sin(i * 3 + e * 20), q.y + 4, 1.6, 0, TAU); g.fill(); }
      g.restore();
    }
  }
  // la llamarada: lóbulos de fuego en un lienzo aparte (sin costuras) y luego humo
  const LOB = Array.from({ length: 20 }, (_, i) => ({ a: -Math.PI / 2 + (hash(i * 3.7) - 0.5) * 2.6, d: 0.2 + 0.7 * hash(i * 5.3), r: 0.35 + 0.3 * hash(i * 1.9), sube: 0.5 + 0.8 * hash(i * 7.3) }));
  let FUEGO_L = null;
  function llamarada(g, t) {
    const e = t - T.fuum; if (e < 0 || e > 2.2) return;
    const crece = suave(clamp(e / 0.24)), apaga = fase(t, T.fuum + 0.35, T.fuum + 1.2), humo = fase(t, T.fuum + 0.5, T.fuum + 2.2);
    const base = { x: GC.x - 8, y: GC.y - 6 };
    const R = 26 + 118 * crece;
    const TAM = 520;
    if (!FUEGO_L) FUEGO_L = lienzo(TAM, TAM);
    const o = FUEGO_L.getContext("2d");
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, TAM, TAM);
    o.translate(TAM / 2 - base.x, TAM * 0.78 - base.y);
    // humo (gris), fuego por fuera (rojo-naranja), por dentro (amarillo) y el corazón (blanco)
    const capas = [["#5d5458", 1.25, 1], ["#e3471f", 1.0, 1 - apaga * 0.8], ["#ff9a2a", 0.78, 1 - apaga], ["#ffe066", 0.55, 1 - apaga * 1.2], ["#fff8dc", 0.3, 1 - apaga * 1.6]];
    for (const [col, esc, alfa] of capas) {
      if (alfa <= 0.01) continue;
      o.globalAlpha = clamp(alfa);
      o.fillStyle = col;
      for (const L of LOB) {
        const sube = (90 * crece + 110 * apaga + 80 * humo) * L.sube;
        const x = base.x + Math.cos(L.a) * R * L.d * 0.9 + 12 * Math.sin(e * 6 + L.a * 3) * crece, y = base.y + Math.sin(L.a) * R * L.d * 0.55 - sube;
        const r = R * L.r * esc * (1 + 0.4 * humo) * (col === "#5d5458" ? 1 : 1 - 0.3 * apaga);
        if (r <= 1) continue;
        o.beginPath(); o.arc(x, y, r, 0, TAU); o.fill();
      }
    }
    g.save();
    g.globalAlpha = (1 - humo) * Math.min(1, e / 0.08 + 0.4);
    g.drawImage(FUEGO_L, base.x - TAM / 2, base.y - TAM * 0.78);
    // chispas que suben
    for (let i = 0; i < 18; i++) {
      const vx = (hash(i * 2.2) - 0.5) * 260, vy = -200 - 220 * hash(i * 4.4), ee = Math.max(0, e - 0.05 * hash(i));
      const x = base.x + vx * ee, y = base.y + vy * ee + 160 * ee * ee;
      g.globalAlpha = clamp(1 - ee / 1.1);
      g.fillStyle = i % 3 ? "#ffcf5a" : "#fff2b0"; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill();
    }
    g.restore();
  }
  // destello cálido de toda la escena
  const fogonazo = t => 0.26 * tramo(t, T.fuum, T.fuum + 0.16) * (1 - tramo(t, T.fuum + 0.18, T.fuum + 0.75));
  function rayitas(g, x, y, k, ang, n = 3, col = TINTA, L = 16) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = k; g.strokeStyle = col; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * 0.45; g.beginPath(); g.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); g.lineTo(Math.cos(a) * (10 + L), Math.sin(a) * (10 + L)); g.stroke(); }
    g.restore();
  }
  // soplido de Paradigma y «mm»
  function soplido(g, t, pP) {
    const k = campana(t, T.sopla0 + 0.05, T.sopla1); if (k <= 0.01) return;
    const b = PA.aPantalla(pP, PA.boca(pP));
    g.save(); g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2.2; g.lineCap = "round"; g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { const ph = ((t - T.sopla0) * 3 + i / 3) % 1;
      g.beginPath(); g.moveTo(b.x - 10 - 26 * ph, b.y + 4 + (i - 1) * 6); g.quadraticCurveTo(b.x - 18 - 26 * ph, b.y + (i - 1) * 6 - 3, b.x - 26 - 26 * ph, b.y + 4 + (i - 1) * 7); g.stroke(); }
    g.restore();
  }
  function notasMm(g, t, pP) {
    const k = campana(t, T.mm0, T.mm1); if (k <= 0.01) return;
    const c = PA.aPantalla(pP, PA.centroCabeza(pP));
    g.save(); g.globalAlpha = Math.min(1, k * 1.5);
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.mm0) * 0.9 + i / 3) % 1, x = c.x + 46 + 10 * Math.sin(ph * 6 + i), y = c.y - 30 - 40 * ph;
      g.globalAlpha = Math.sin(Math.PI * ph) * Math.min(1, k * 1.5);
      g.fillStyle = "#e84a5f"; g.beginPath();
      const s = 5 + 2 * ph; g.moveTo(x, y + s); g.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.6, y - s * 1.4, x, y - s * 0.4); g.bezierCurveTo(x + s * 0.6, y - s * 1.4, x + s * 1.6, y - s * 0.2, x, y + s); g.fill();
      g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * CÁMARA
   * ===================================================================================== */
  const PLANOS = [
    [0, 1.0, 512, 300], [3.0, 1.0, 512, 300], [3.6, 1.04, 540, 296], [5.6, 1.04, 520, 296], [6.4, 1.06, 500, 296],
    [7.6, 1.06, 500, 296], [8.4, 1.0, 512, 300], [10.3, 1.0, 512, 300], [11.2, 1.07, 520, 288], [DUR, 1.09, 512, 286]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }
  const temblorCam = t => 5 * Math.exp(-Math.max(0, t - T.fuum) * 5) * tramo(t, T.fuum, T.fuum + 0.08);

  /* =====================================================================================
   * PINTAR
   * ===================================================================================== */
  function pose(t) { return { g: poseG(t), p: poseP(t) }; }
  class GuillermoParadigmaBarbacoa extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !PA.listo()) return;
      if (!FONDO) { FONDO = creaFondo(); BARB = creaBarbacoa(); PUNTAS_NEGRAS = creaPuntas(); HOLLIN = creaHollin(); }
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), tb = temblorCam(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      const BASEM = g.getTransform();
      g.drawImage(FONDO, -60, -40);
      bombillas(g, t, 0);
      const pG = poseG(t), pP = poseP(t);
      // sombras
      g.save(); g.fillStyle = "rgba(60,40,20,0.28)";
      g.beginPath(); g.ellipse(GC.x + 6, SY + 2, 98, 9, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(pG.x + 4, SY + 2, 50, 7, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(pP.x - 4, SY + 2, 50, 7, 0, 0, TAU); g.fill();
      g.restore();
      // la barbacoa con las brasas, la parrilla y las salchichas
      g.drawImage(BARB, BX0, BY0, BW, BH);
      const aviva = 1.2 * campana(t, T.fuum - 0.05, T.fuum + 1.4) + 0.2 * campana(t, T.chorro1, T.chorro2 + 0.4);
      brasas(g, t, aviva);
      for (let i = 0; i < SAL.length; i++) { const e = estadoSal(i, t); if (e && !e.aire) dibSal(g, e); }
      bordeDelante(g);
      calima(g, t);
      humoParrilla(g, t, 1 - 0.8 * campana(t, T.fuum, T.fuum + 1.5));
      // bote en el carro (si aún está ahí)
      const bt = boteEn(t);
      if (!bt.mano) bote(g, bt.c, bt.b, 0);
      // objetos en las manos (en pantalla, por debajo del puño)
      const pz = pinzasEn(t);
      const enPantalla = f => gg => { gg.save(); gg.setTransform(BASEM); f(gg); gg.restore(); };
      const dibPz = gg => pinzas(gg, pz.H, pz.a, pz.abre);
      if (pz.mano === "P" && !pz.ambas) pP.manoLejos.objeto = enPantalla(dibPz);
      if (pz.mano === "G" || pz.ambas) pG.manoLejos.objeto = enPantalla(dibPz);
      if (bt.mano) pG.manoCerca.objeto = enPantalla(gg => bote(gg, bt.c, bt.b, bt.aprieta));
      const tieneSal = t >= T.coge2;
      if (tieneSal) pP.manoLejos.objeto = enPantalla(gg => {
        const s = salchichaP(t, pP);
        gg.save(); gg.translate(s.pinza.x, s.pinza.y); gg.rotate(s.a); gg.translate(LS / 2 - 3, 0);
        salchicha(gg, 0.85, 1, tramo(t, T.bocado - 0.02, T.bocado + 0.04));
        gg.restore();
      });
      pG.capaCabeza = gg => capaG(gg, t, pG);
      // los dos (Guillermo detrás, Paradigma delante: no se solapan)
      G.dibujar(g, pG, t);
      PA.dibujar(g, pP, t);
      // pinzas por el aire (de nadie)
      if (pz.mano === null) pinzas(g, pz.H, pz.a, pz.abre);
      // efectos
      olor(g, t, pG);
      chisporroteo(g, t);
      clac(g, t);
      chorro(g, t);
      humoPelo(g, t, pG);
      llamarada(g, t);
      // salchichas por el aire
      for (let i = 0; i < SAL.length; i++) {
        const v = VUELOS[i]; if (t < v.t0 || t >= v.t1) continue;
        const dest = v.fin ? null : (() => { const q = ptMano(PA, pP, pP.manoLejos, PINZA); return { x: q.x + 15, y: q.y - 4, a: -1.2 }; })();
        dibSal(g, vueloSal(i, t, dest));
      }
      soplido(g, t, pP);
      notasMm(g, t, pP);
      // rayitas: el susto de la llamarada
      const ks = campana(t, T.fuum + 0.05, T.fuum + 0.5);
      if (ks > 0) { const c = G.aPantalla(pG, G.centroCabeza(pG)); rayitas(g, c.x - 70, c.y - 30, ks, Math.PI + 0.5, 3, TINTA, 18); }
      // fogonazo cálido
      const fz = fogonazo(t);
      if (fz > 0.003) { g.save(); g.globalAlpha = fz; g.fillStyle = "#ffcf8a"; g.fillRect(-100, -100, W + 200, H + 200); g.restore(); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00106", nombre: "Guillermo y Paradigma · La barbacoa", crear: () => new GuillermoParadigmaBarbacoa() });
  // diagnóstico: distancia hombro → objetivo de cada mano (y el máximo que da el brazo)
  function diag(t) {
    const { p: pP, g: pG } = pose(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) return null; const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return +(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y) / ((lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L))).toFixed(2); };
    o.pC = dist(PA, pP, "cerca"); o.pL = dist(PA, pP, "lejos"); o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos");
    return o;
  }
  window.__A2D_00106 = { pose, poseP, poseG, T, DUR, diag, pinzasEn, boteEn };
})();
