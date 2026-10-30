"use strict";
/* 00040 · Guillermo y Ander · La guitarra
 *
 * Negro → café folk de noche: pared verde azulada con zócalo de madera, guirnalda de bombillas, un
 * disco de vinilo colgado, una ventana con la luna y una balda con copas. Ander, sentado en un
 * taburete alto con una guitarra acústica en el muslo, toca tranquilo con los ojos cerrados: de la
 * boca de la guitarra salen notas redondas y suaves. Guillermo, de pie a su lado con las manos en
 * los bolsillos, se balancea encantado → coge aire, se lleva la mano al pecho y se arranca a cantar…
 * fatal: le salen notas puntiagudas y en zigzag. Ander abre un ojo y hace una mueca → las copas de la
 * balda tiemblan y se agrietan una a una, y en la ventana asoma un perro que aúlla → Ander mira a
 * cámara harto y se pone a rasguear más rápido y más fuerte para taparle; Guillermo da un paso,
 * abre los brazos y canta todavía más alto, rojo y con la vena hinchada; el perro se tapa las orejas
 * y se esconde. Las notas de los dos se cruzan en el aire → en pleno rasgueo furioso, ¡tang!, salta
 * la primera cuerda: da un latigazo por encima del clavijero y le pega a Guillermo en la nariz.
 * ¡Boing! → silencio: las notas se deshacen, Guillermo se queda bizco de dolor con la nariz roja y se
 * la frota; la cuerda rota cuelga del clavijero → Ander mira la cuerda, mira a Guillermo, cierra los
 * ojos y toca un último acorde tranquilo (una sola nota redonda que sube) y guiña un ojo a cámara;
 * Guillermo hace pucheros → negro.
 *
 * Sin textos: las notas son símbolos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, AN = Ander;
  const S = 0.30, SUELO = 560, DUR = 13.6;
  const TINTA = "#0b0a0e";
  const T = {
    escucha: 0.35, inspira0: 2.1, inspira1: 2.55, canta0: 2.65,
    unOjo: 3.0, mueca: 3.55, perro0: 4.2, aulla0: 4.6, harto: 4.85,
    decidido: 5.45, rapido0: 5.5, rapido1: 6.2, fuerte0: 5.95, paso0: 5.95,
    furia0: 7.0, furia1: 7.4, grito0: 7.15, orejas: 6.6, escondido: 7.25,
    rompe: 8.42, golpe: 8.58, silencio: 8.75,
    aturdido: 8.95, miraCuerda: 8.8, frota0: 9.7, frota1: 11.25,
    miraG: 9.55, calma: 9.95, acorde: 10.3, nota: 10.38, guino: 11.05,
    puchero: 11.3, fin: 12.65
  };
  const COPAS_T = [3.9, 4.5, 5.2, 7.9];          // cuándo se agrieta cada copa

  /* ---------- decorado (px de pantalla) ---------- */
  const XA = 350, DY_A = 100;                               // pelvis de Ander (sentado) y cuánto baja al sentarse (hoja)
  const XG0 = 700, XG1 = 674;                               // Guillermo: sitio inicial y tras dar el paso
  const TAB = { x: XA - 2, asiento: 407, aro: 499 };        // taburete alto
  const VENT = { x0: 96, y0: 92, x1: 226, y1: 236 };        // ventana (perro)
  const BALDA = { x0: 788, x1: 932, y: 232 };               // balda con copas

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, tabla, t, base) {
    let c = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  function parpadeos(lista, t) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  const dedosDe = (b, ch) => ({ pulgar: b[ch + "0"], indice: b[ch + "1"], medio: b[ch + "2"], anular: b[ch + "3"], menique: b[ch + "4"] });
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };

  /* ---------- intensidades y ritmo ---------- */
  // cuánto canta Guillermo (0–1) y cuánto aprieta Ander (0–1)
  const cantaG = t => t < T.golpe ? 0.5 * tramo(t, T.canta0, T.canta0 + 0.25) + 0.3 * tramo(t, T.fuerte0, T.fuerte0 + 0.35) + 0.2 * tramo(t, T.grito0, T.grito0 + 0.3) : 0;
  const tocaA = t => t < T.rompe ? 0.3 + 0.35 * tramo(t, T.rapido0, T.rapido1) + 0.35 * tramo(t, T.furia0, T.furia1) : 0;
  // rasgueos por segundo de Ander y notas por segundo de Guillermo
  function ritmoA(t) {
    if (t >= T.rompe + 0.12) return 0;
    const r = 1.9 + 2.6 * suave(fase(t, T.rapido0, T.rapido1)) + 3.4 * suave(fase(t, T.furia0, T.furia1));
    return r * (1 - suave(fase(t, T.rompe, T.rompe + 0.12)));
  }
  function ritmoG(t) {
    if (t < T.canta0 + 0.08 || t >= T.rompe) return 0;
    return 3.0 + 2.2 * suave(fase(t, T.fuerte0, T.fuerte0 + 0.35)) + 1.6 * suave(fase(t, T.grito0, T.grito0 + 0.3));
  }
  // fases integradas una vez (el fotograma no depende de los anteriores)
  const DT = 1 / 600, NP = Math.ceil(DUR / DT) + 2;
  const FA = new Float64Array(NP), FG = new Float64Array(NP);
  for (let i = 1; i < NP; i++) {
    const t0 = (i - 1) * DT, t1 = i * DT;
    FA[i] = FA[i - 1] + 0.5 * (ritmoA(t0) + ritmoA(t1)) * DT;
    FG[i] = FG[i - 1] + 0.5 * (ritmoG(t0) + ritmoG(t1)) * DT;
  }
  const interp = (arr, t) => { const u = clamp(t, 0, DUR) / DT, i = Math.min(NP - 2, Math.floor(u)), k = u - i; return lerp(arr[i], arr[i + 1], k); };
  const faseA = t => interp(FA, t), faseG = t => interp(FG, t);
  function nacimientos(arr, tMax) {
    const out = [];
    for (let i = 1; i < NP; i++) {
      const a = arr[i - 1], b = arr[i];
      if (Math.floor(b) > Math.floor(a)) { const n = Math.floor(b), tb = (i - 1 + (n - a) / (b - a)) * DT; if (tb < tMax) out.push({ tb, n }); }
    }
    return out;
  }
  // a ritmo furioso solo sale nota en uno de cada dos rasgueos (si no, se tapan las caras)
  const NOTAS_A = nacimientos(FA, T.rompe).filter(nt => ritmoA(nt.tb) < 5 || nt.n % 2 === 0), NOTAS_G = nacimientos(FG, T.rompe);

  /* ---------- la guitarra (unidades de hoja, origen en la boca, eje x hacia el clavijero) ---------- */
  const GU = { x: 305, y: 590, ang: -0.45, k: 1.45 };      // en la hoja de Ander, sin girar el torso (k: tamaño)
  const PUENTE = -112, CEJUELA = 318;
  const CUERDAS = [0, 1, 2, 3, 4, 5].map(i => ({ yp: -16 + i * 6.4, yc: -9 + i * 3.6, col: i < 3 ? "#e9e2cf" : "#d8b26a", w: 1.6 + i * 0.35 }));
  const anchoCaja = x => {
    const e1 = Math.abs(x + 100) < 75 ? 90 * Math.sqrt(1 - ((x + 100) / 75) ** 2) : 0;
    const e2 = Math.abs(x - 6) < 52 ? 70 * Math.sqrt(1 - ((x - 6) / 52) ** 2) : 0;
    const cin = x > -62 && x < -28 ? 58 : 0;
    return Math.max(e1, e2, cin);
  };
  const CAJA = (() => {
    const arriba = [], abajo = [];
    for (let x = -175; x <= 58; x += 9) { const w = anchoCaja(x); arriba.push({ x, y: -w }); abajo.push({ x, y: w }); }
    return arriba.concat(abajo.reverse());
  })();
  let cacheGuit = null;
  const GK = 0.7, GX0 = -190, GY0 = -100, GW = 600, GH = 200;
  function creaGuitarra() {
    const c = document.createElement("canvas"); c.width = Math.ceil(GW * GK); c.height = Math.ceil(GH * GK);
    const g = c.getContext("2d"); g.scale(GK, GK); g.translate(-GX0, -GY0);
    g.lineJoin = "round"; g.lineCap = "round";
    const caja = () => { g.beginPath(); M2.curva(g, CAJA, true, 0.5); };
    // caja con tapa sombreada (sunburst)
    caja(); const gr = g.createRadialGradient(-55, 0, 10, -55, 0, 175);
    gr.addColorStop(0, "#f6c868"); gr.addColorStop(0.55, "#e09a3a"); gr.addColorStop(0.85, "#a85a1c"); gr.addColorStop(1, "#5c2a0c");
    g.fillStyle = gr; g.fill();
    // filete del borde
    g.save(); caja(); g.clip(); g.lineWidth = 9; g.strokeStyle = "#f3e6c6"; caja(); g.stroke(); g.restore();
    caja(); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke();
    // golpeador de carey
    g.fillStyle = "#4a2414"; g.beginPath(); g.moveTo(-14, 26); g.bezierCurveTo(-30, 60, -70, 66, -78, 44); g.bezierCurveTo(-82, 28, -46, 22, -14, 26); g.closePath(); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = "rgba(0,0,0,0.55)"; g.stroke();
    g.fillStyle = "rgba(255,190,120,0.25)"; g.beginPath(); g.ellipse(-48, 42, 14, 5, 0.3, 0, Math.PI * 2); g.fill();
    // boca con roseta
    g.fillStyle = "#1a0d06"; g.beginPath(); g.arc(0, 0, 27, 0, Math.PI * 2); g.fill();
    g.lineWidth = 4; g.strokeStyle = "#f3e6c6"; g.beginPath(); g.arc(0, 0, 33, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = "#6b3a14"; g.beginPath(); g.arc(0, 0, 38, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.strokeStyle = TINTA; g.beginPath(); g.arc(0, 0, 27, 0, Math.PI * 2); g.stroke();
    // puente
    g.fillStyle = "#3a1c0c"; g.beginPath(); g.roundRect ? g.roundRect(PUENTE - 10, -40, 20, 80, 6) : g.rect(PUENTE - 10, -40, 20, 80); g.fill();
    g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#f3ead2"; g.fillRect(PUENTE + 2, -22, 4, 44);
    for (const q of CUERDAS) { g.fillStyle = "#f3ead2"; g.beginPath(); g.arc(PUENTE - 4, q.yp * 1.15, 2.6, 0, Math.PI * 2); g.fill(); }
    // brillo de la tapa
    g.save(); caja(); g.clip();
    g.fillStyle = "rgba(255,245,210,0.22)"; g.beginPath(); g.ellipse(-90, -48, 60, 18, -0.2, 0, Math.PI * 2); g.fill();
    g.restore();
    // mástil y diapasón
    g.fillStyle = "#8a4a1e"; g.fillRect(52, -15, CEJUELA - 52, 30);
    g.fillStyle = "#2e1a10"; g.fillRect(52, -12.5, CEJUELA - 52, 25);
    g.strokeStyle = "rgba(220,215,200,0.85)"; g.lineWidth = 1.8;
    for (let k = 1; k < 14; k++) { const x = CEJUELA - (CEJUELA - 52) * (1 - Math.pow(0.86, k)) / (1 - Math.pow(0.86, 14)); g.beginPath(); g.moveTo(x, -12.5); g.lineTo(x, 12.5); g.stroke(); }
    g.fillStyle = "#efe6cf";
    for (const k of [3, 5, 7, 9]) { const x0 = CEJUELA - (CEJUELA - 52) * (1 - Math.pow(0.86, k - 1)) / (1 - Math.pow(0.86, 14)), x1 = CEJUELA - (CEJUELA - 52) * (1 - Math.pow(0.86, k)) / (1 - Math.pow(0.86, 14));
      g.beginPath(); g.arc((x0 + x1) / 2, 0, 3.2, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 5; g.strokeStyle = TINTA; g.strokeRect(52, -15, CEJUELA - 52, 30);
    // cejuela y clavijero
    g.fillStyle = "#f3ead2"; g.fillRect(CEJUELA - 4, -14, 7, 28); g.lineWidth = 2; g.strokeRect(CEJUELA - 4, -14, 7, 28);
    const pala = () => { g.beginPath(); g.moveTo(CEJUELA + 3, -14); g.lineTo(CEJUELA + 72, -21); g.quadraticCurveTo(CEJUELA + 80, 0, CEJUELA + 72, 21); g.lineTo(CEJUELA + 3, 14); g.closePath(); };
    pala(); g.fillStyle = "#3a1c0c"; g.fill(); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,220,170,0.2)"; g.fillRect(CEJUELA + 10, -12, 54, 5);
    for (let k = 0; k < 3; k++) for (const sg of [-1, 1]) {
      const x = CEJUELA + 18 + k * 20, y = sg * 22;
      g.fillStyle = "#c9a24a"; g.fillRect(x - 2, sg * 14, 4, sg * 8); g.lineWidth = 1.5; g.strokeRect(x - 2, sg * 14, 4, sg * 8);
      g.fillStyle = "#f3ead2"; g.beginPath(); g.ellipse(x, y + sg * 6, 5.5, 8, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "#f3ead2"; g.beginPath(); g.arc(x, sg * 7, 2.6, 0, Math.PI * 2); g.fill();
    }
    return c;
  }
  // cuerdas vibrando (la primera desaparece al romperse)
  function cuerdas(g, t) {
    const vib = 0.8 + 3.2 * tocaA(t), ph = faseA(t) * Math.PI * 2;
    g.save(); g.lineCap = "round";
    CUERDAS.forEach((q, i) => {
      if (i === 0 && t >= T.rompe) return;
      g.strokeStyle = q.col; g.lineWidth = q.w;
      g.beginPath();
      for (let k = 0; k <= 10; k++) {
        const u = k / 10, x = lerp(PUENTE, CEJUELA, u), y = lerp(q.yp, q.yc, u) + Math.sin(Math.PI * u) * vib * Math.sin(ph * 3 + i * 1.7 + t * 40) * (0.6 + 0.4 * hash(i));
        if (k) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    });
    g.restore();
  }
  function guitarra(g, t) {
    if (!cacheGuit) cacheGuit = creaGuitarra();
    g.save(); g.translate(GU.x, GU.y); g.rotate(GU.ang); g.scale(GU.k, GU.k);
    g.drawImage(cacheGuit, GX0, GY0, GW, GH);
    cuerdas(g, t);
    // chispa donde salta la cuerda (en el puente)
    const kc = fase(t, T.rompe, T.rompe + 0.22);
    if (kc > 0 && kc < 1) {
      g.strokeStyle = `rgba(255,250,210,${1 - kc})`; g.lineWidth = 4; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.4, r0 = 10 + 30 * kc; g.beginPath(); g.moveTo(PUENTE + Math.cos(a) * r0, CUERDAS[0].yp + Math.sin(a) * r0); g.lineTo(PUENTE + Math.cos(a) * (r0 + 16), CUERDAS[0].yp + Math.sin(a) * (r0 + 16)); g.stroke(); }
    }
    g.restore();
  }
  // punto de la guitarra (unidades locales) → hoja de Ander → pantalla
  const enHojaA = (pa, q) => { const r = rot({ x: q.x * GU.k, y: q.y * GU.k }, GU.ang); return AN.tronco(pa)({ x: GU.x + r.x, y: GU.y + r.y }); };
  const guitAPantalla = (pa, q) => AN.aPantalla(pa, enHojaA(pa, q));

  /* ---------- notas ---------- */
  const COL_A = ["#ffd27a", "#9fe3c9", "#ffb3c7", "#bcd2ff"], COL_G = ["#ff3b30", "#b23cff", "#b6ff2e", "#ff8a00"];
  function notaSuave(g, x, y, s, r, col, a, doble) {
    if (a <= 0.01 || s <= 0.01) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(r); g.scale(s, s);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.fillStyle = col;
    const cabeza = (cx, cy) => { g.beginPath(); g.ellipse(cx, cy, 7.5, 5.6, -0.4, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.2; g.stroke(); };
    if (doble) {
      g.lineWidth = 5.6; g.beginPath(); g.moveTo(-1, -2); g.lineTo(-1, -26); g.lineTo(19, -31); g.lineTo(19, -7); g.stroke();
      g.strokeStyle = col; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = TINTA;
      cabeza(-7.5, 0); cabeza(12.5, -5);
    } else {
      g.lineWidth = 5.6; g.beginPath(); g.moveTo(6, -2); g.lineTo(6, -27); g.quadraticCurveTo(10, -18, 16, -14); g.stroke();
      g.strokeStyle = col; g.lineWidth = 2.6; g.stroke(); g.strokeStyle = TINTA;
      cabeza(0, 0);
    }
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(doble ? -10 : -2.5, -2, 2.4, 1.4, -0.4, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function notaPincho(g, x, y, s, r, col, a) {
    if (a <= 0.01 || s <= 0.01) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(r); g.scale(s, s);
    g.lineJoin = "miter"; g.lineCap = "butt"; g.strokeStyle = TINTA; g.fillStyle = col;
    // plica en zigzag
    g.beginPath(); g.moveTo(5, -2); g.lineTo(10, -9); g.lineTo(3, -15); g.lineTo(10, -22); g.lineTo(4, -29);
    g.lineWidth = 5.5; g.stroke(); g.strokeStyle = col; g.lineWidth = 2.4; g.stroke(); g.strokeStyle = TINTA;
    // corchete afilado
    g.beginPath(); g.moveTo(4, -29); g.lineTo(18, -21); g.lineTo(8, -19); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
    // cabeza de estrella con pinchos
    g.beginPath(); for (let i = 0; i < 14; i++) { const a2 = i * Math.PI / 7 + 0.2, rr = i % 2 ? 4 : 10; g.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr * 0.85); } g.closePath();
    g.fill(); g.lineWidth = 2; g.stroke();
    g.restore();
  }
  // origen de cada nota (boca de la guitarra o boca de Guillermo al nacer), calculado una vez
  const origenA = new Map(), origenG = new Map();
  function notasA(g, t) {
    const pop = fase(t, T.rompe, T.rompe + 0.16);
    for (const nt of NOTAS_A) {
      const a = t - nt.tb; if (a < 0) break;
      const fuerte = tocaA(nt.tb), vida = lerp(1.95, 1.7, (fuerte - 0.3) / 0.7);
      if (a > vida || pop >= 1) continue;
      if (!origenA.has(nt.n)) { const ff = (tocaA(nt.tb) - 0.3) / 0.7; origenA.set(nt.n, guitAPantalla(poseA(nt.tb), { x: lerp(-30, 165, ff), y: lerp(-40, -26, ff) })); }
      const o = origenA.get(nt.n), h1 = hash(nt.n * 3.1), h2 = hash(nt.n * 7.7 + 1);
      // tranquilas: suben meciéndose; fuertes: salen hacia Guillermo para taparle
      const ff = (fuerte - 0.3) / 0.7, vx = lerp(-48 + 22 * h1, 130 + 50 * h1, ff), vy = -lerp(100 + 25 * h2, 30 + 40 * h2, ff);
      const x = o.x + vx * a + 11 * Math.sin(a * 2.6 + nt.n), y = o.y + vy * a + 6 * a * a;
      const s = (0.9 + 0.55 * (fuerte - 0.3)) * (0.55 + 0.45 * salida(fase(a, 0, 0.25))) * (1 + 0.6 * pop);
      const al = clamp(a / 0.12) * (1 - fase(a, vida - 0.5, vida)) * (1 - pop);
      notaSuave(g, x, y, s, 0.25 * Math.sin(a * 3 + nt.n), COL_A[nt.n % 4], al, nt.n % 3 === 0);
    }
  }
  function notasG(g, t) {
    const pop = fase(t, T.rompe, T.rompe + 0.16);
    for (const nt of NOTAS_G) {
      const a = t - nt.tb; if (a < 0) break;
      const vida = 1.45; if (a > vida || pop >= 1) continue;
      if (!origenG.has(nt.n)) { const pg = poseG(nt.tb); origenG.set(nt.n, { o: G.aPantalla(pg, G.boca(pg)), k: cantaG(nt.tb) }); }
      const { o, k } = origenG.get(nt.n), h1 = hash(nt.n * 5.3 + 2), h2 = hash(nt.n * 2.9 + 7);
      const vx = -(135 + 45 * h1) * (0.85 + 0.3 * k), vy = -(80 + 40 * h2) * (0.85 + 0.3 * k);
      const tiembla = 3 + 4 * k;
      const x = o.x - 14 + vx * a + tiembla * ruido(t * 23 + nt.n), y = o.y + vy * a + tiembla * ruido(t * 21 + nt.n * 3);
      const s = (0.8 + 0.6 * k) * (0.5 + 0.5 * salida(fase(a, 0, 0.18))) * (1 + 0.6 * pop);
      const al = clamp(a / 0.08) * (1 - fase(a, vida - 0.35, vida)) * (1 - pop);
      notaPincho(g, x, y, s, -0.4 + 0.5 * ruido(t * 9 + nt.n * 2), COL_G[nt.n % 4], al);
    }
  }
  // el último acorde: una sola nota redonda que sube despacio
  function notaFinal(g, t, pa) {
    const a = t - T.nota; if (a < 0 || a > 2.6) return;
    const o = guitAPantalla(pa, { x: 165, y: -60 });
    const x = o.x + 22 * a + 9 * Math.sin(a * 2.2), y = o.y - 52 * a - 8 * a * a;
    const s = 1.7 * salida(fase(a, 0, 0.35)), al = clamp(a / 0.15) * (1 - fase(a, 2.0, 2.6));
    notaSuave(g, x, y, s, 0.18 * Math.sin(a * 2), "#ffe08a", al, false);
    // brillito
    const kb = fase(a, 0.2, 0.7);
    if (kb > 0 && kb < 1) { g.save(); g.globalAlpha = Math.sin(Math.PI * kb) * al; g.fillStyle = "#fffbe8";
      g.translate(x + 22, y - 30); g.rotate(kb * 1.5); g.beginPath();
      for (let i = 0; i < 8; i++) { const r = i % 2 ? 2.5 : 9; g.lineTo(Math.cos(i * Math.PI / 4) * r, Math.sin(i * Math.PI / 4) * r); } g.closePath(); g.fill(); g.restore(); }
  }

  /* ---------- caras ---------- */
  const BASEC = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASEC, o);
  const CARAS_G = {
    escucha: E({ mx: 0.9, my: 0.25, c: 0.78, h: 1, sonr: 0.62, ancho: 0.95, sd: 8, gd: 0.08, si: 8, gi: 0.08 }),
    inspira: E({ mx: 0.6, my: -0.5, c: 0, sonr: 0.1, ancho: 0.55, abre: 14, sd: 22, gd: 0.18, si: 22, gi: 0.18, dientes: 0 }),
    canta: E({ mx: 0.6, my: -0.3, c: 0.92, sonr: 0.12, ancho: 0.95, abre: 46, sd: 24, gd: 0.2, si: 24, gi: 0.2, lengua: 0.35 }),
    fuerte: E({ mx: 0.6, my: -0.2, c: 1, z: 0.45, sonr: 0.0, ancho: 1.12, abre: 60, sd: 28, gd: 0.22, si: 28, gi: 0.22, lengua: 0.45 }),
    grito: E({ mx: 0.6, my: 0, c: 1, z: 0.85, sonr: -0.1, ancho: 1.28, abre: 74, sd: 32, gd: 0.25, si: 32, gi: 0.25, lengua: 0.55 }),
    golpe: E({ mx: 0.4, my: 0.3, c: 1, z: 1, sonr: -0.45, ancho: 0.8, abre: 22, sd: 6, gd: -0.1, si: 6, gi: -0.1, lengua: 0.2 }),
    aturdido: E({ mx: 0.2, my: 0.55, iris: 1.12, c: 0, sonr: -0.35, ancho: 0.5, abre: 16, sd: 26, gd: 0.25, si: 26, gi: 0.25, dientes: 0 }),
    frota: E({ mx: 0.3, my: 0.45, c: 0.55, z: 0.35, sonr: -0.4, ancho: 0.6, abre: 6, sd: 10, gd: 0.1, si: 10, gi: 0.1, dientes: 0 }),
    puchero: E({ mx: -0.85, my: 0.15, c: 0.18, sonr: -0.5, ancho: 0.62, abre: 3, sd: 16, gd: -0.22, si: 16, gi: -0.22, dientes: 0 })
  };
  const GUION_CARA_G = [
    [T.inspira0, T.inspira0 + 0.25, "inspira"], [T.canta0, T.canta0 + 0.12, "canta", salida], [T.fuerte0, T.fuerte0 + 0.3, "fuerte"],
    [T.grito0, T.grito0 + 0.25, "grito"], [T.golpe, T.golpe + 0.05, "golpe", salida], [T.aturdido, T.aturdido + 0.25, "aturdido"],
    [T.frota0, T.frota0 + 0.25, "frota"], [T.puchero, T.puchero + 0.3, "puchero"]
  ];
  const PARP_G = [9.55, 10.9, 12.2];
  const CARAS_A = {
    toca: E({ mx: 0.55, my: 0.5, c: 0.72, h: 1, sonr: 0.55, ancho: 0.95, sd: 4, gd: 0.04, si: 4, gi: 0.04 }),
    unOjo: E({ mx: 0.95, my: -0.05, cd: 0.75, ci: 0.1, h: 0.2, sonr: -0.05, ancho: 0.82, sd: -6, gd: -0.14, si: 10, gi: 0.12 }),
    mueca: E({ mx: 0.95, my: -0.05, cd: 0.9, ci: 0.25, z: 0.7, sonr: -0.4, ancho: 0.78, abre: 4, sd: -8, gd: -0.18, si: 6, gi: 0.08, dientes: 1 }),
    harto: E({ mx: -0.85, my: 0, c: 0.32, sonr: -0.3, ancho: 0.75, sd: -10, gd: -0.2, si: -6, gi: -0.12 }),
    decidido: E({ mx: 0.6, my: 0.45, c: 0.25, sonr: 0.38, ancho: 0.88, sd: -12, gd: -0.25, si: -12, gi: -0.25 }),
    furioso: E({ mx: 0.6, my: 0.45, c: 0.8, z: 0.85, sonr: -0.25, ancho: 1.12, abre: 13, sd: -14, gd: -0.3, si: -14, gi: -0.3, dientes: 1 }),
    sorpresa: E({ mx: 0.9, my: -0.25, c: 0, iris: 1.1, sonr: 0, ancho: 0.6, abre: 18, sd: 24, gd: 0.15, si: 24, gi: 0.15 }),
    cuerda: E({ mx: 0.85, my: 0.35, c: 0, iris: 1.05, sonr: -0.15, ancho: 0.6, abre: 8, sd: 18, gd: 0.12, si: 26, gi: 0.2, dientes: 0 }),
    miraG: E({ mx: 0.95, my: -0.1, c: 0.15, sonr: 0.3, ancho: 0.7, abre: 0, sd: 14, gd: 0.1, si: 4, gi: 0.0 }),
    calma: E({ mx: 0.55, my: 0.5, c: 0.8, h: 1, sonr: 0.5, ancho: 0.95, sd: 6, gd: 0.05, si: 6, gi: 0.05 }),
    guino: E({ mx: -0.85, my: -0.1, cd: 0, ci: 1, h: 0.85, sonr: 0.95, ancho: 1.05, abre: 8, sd: 16, gd: 0.15, si: 2, gi: -0.05 }),
    sonrisa: E({ mx: -0.85, my: -0.1, c: 0.1, sonr: 0.85, ancho: 1.0, abre: 6, sd: 12, gd: 0.1, si: 8, gi: 0.06 })
  };
  const GUION_CARA_A = [
    [T.unOjo, T.unOjo + 0.22, "unOjo"], [T.mueca, T.mueca + 0.2, "mueca"], [T.harto, T.harto + 0.25, "harto"], [T.decidido, T.decidido + 0.25, "decidido"],
    [T.furia0, T.furia0 + 0.25, "furioso"], [T.rompe, T.rompe + 0.06, "sorpresa", salida], [T.miraCuerda, T.miraCuerda + 0.25, "cuerda"],
    [T.miraG, T.miraG + 0.22, "miraG"], [T.calma, T.calma + 0.3, "calma"], [T.guino, T.guino + 0.14, "guino"], [T.guino + 0.75, T.guino + 0.95, "sonrisa"]
  ];
  const PARP_A = [5.25, 9.35, 12.25];
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* ---------- Guillermo: pies (px de pantalla de cada tobillo) ---------- */
  const PASOS_G = {
    lejos: [[-10, -9, XG0 - 34], [T.paso0, T.paso0 + 0.3, XG1 - 46], [T.golpe + 0.08, T.golpe + 0.36, XG1 - 16]],
    cerca: [[-10, -9, XG0 + 30], [T.paso0 + 0.2, T.paso0 + 0.48, XG1 + 26], [T.golpe + 0.2, T.golpe + 0.46, XG1 + 52]]
  };
  function pieG(lado, t) {
    const L = PASOS_G[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alto: 46 * arco, punta: arco };
  }
  /* ---------- Guillermo: posturas (manos respecto a su hombro, hoja; mira a la izquierda con espejo) ---------- */
  const P0 = { pel: 0, torso: 0, cab: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const ABIERTA_C = { c0: 1, c1: 1, c2: 1, c3: 1, c4: 1 }, ABIERTA_L = { l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 };
  const CUERPOS_G = {
    bolsillos: C_({}),
    inspira: C_(Object.assign({ pel: -6, torso: -0.04, cab: -0.1, cx: 128, cy: 92, cmu: -2.7, cp: 1 }, ABIERTA_C)),
    canta: C_(Object.assign({ pel: 6, torso: 0.06, cab: -0.14, cx: 128, cy: 92, cmu: -2.7, cp: 1, lx: 215, ly: -30, lmu: 2.95, lp: 1 }, ABIERTA_C, ABIERTA_L)),
    fuerte: C_(Object.assign({ pel: 26, torso: 0.22, cab: -0.06, cx: -120, cy: -40, cmu: 0.35, cp: 1, lx: 250, ly: -100, lmu: 2.7, lp: 1 }, ABIERTA_C, ABIERTA_L)),
    grito: C_({ pel: 56, torso: 0.4, cab: 0.06, cx: -130, cy: -110, cmu: 0.7, cp: 1, lx: 205, ly: -150, lmu: 2.3, lp: 1 }),
    golpe: C_(Object.assign({ pel: 30, torso: 0.12, cab: -0.3, cx: -40, cy: -150, cmu: 1.4, cp: 1, lx: 140, ly: -170, lmu: 1.9, lp: 1 }, ABIERTA_C, ABIERTA_L)),
    aturdido: C_({ pel: 14, torso: 0.04, cab: 0.04, cx: 30, cy: 262, cmu: -1.6, cp: 1, lx: 20, ly: 250, lmu: -1.75, lp: 1,
      c0: 0.5, c1: 0.55, c2: 0.5, c3: 0.45, c4: 0.4, l0: 0.5, l1: 0.55, l2: 0.5, l3: 0.45, l4: 0.4 }),
    puchero: C_({ pel: 6, torso: 0.02, cab: 0.08 })
  };
  const GUION_G = [
    [T.inspira0, T.inspira1, "inspira"], [T.canta0, T.canta0 + 0.3, "canta"], [T.fuerte0, T.fuerte0 + 0.35, "fuerte"],
    [T.grito0, T.grito0 + 0.3, "grito"], [T.golpe, T.golpe + 0.17, "golpe", salida], [T.aturdido - 0.05, T.aturdido + 0.35, "aturdido"],
    [T.puchero + 0.45, T.puchero + 0.9, "puchero"]
  ];
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, 0, -1.75), l: punoDesde({ x: 372, y: 648 }, 0, -1.75) };
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const NARIZ_G = { x: 912, y: 652 };                     // punta de la nariz (retrato)

  // golpe de la cuerda en la nariz: la cabeza se va atrás y rebota amortiguada
  const rebote = t => t < T.golpe ? 0 : Math.exp(-(t - T.golpe) * 5) * Math.sin((t - T.golpe) * 26);

  let cacheG = new Map();
  function poseG(t) {
    const key = Math.round(t * 1e5); if (cacheG.has(key)) return cacheG.get(key);
    if (cacheG.size > 400) cacheG = new Map();
    const b = guion(GUION_G, CUERPOS_G, t, "bolsillos"), e = guion(GUION_CARA_G, CARAS_G, t, "escucha");
    const fl = pieG("lejos", t), fc = pieG("cerca", t);
    const respira = Math.sin(t * 2.4), k = cantaG(t);
    // balanceo al escuchar y al cantar
    const balanceo = Math.sin(t * 2.2) * (1 - tramo(t, T.fuerte0, T.fuerte0 + 0.3)) * (t < T.golpe ? 1 : 0);
    const x = (fl.x + fc.x) / 2 - 18;
    const p = {
      x, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.4 - 10 * Math.max(fl.alto, fc.alto) / 46 },
      torso: b.torso + 0.035 * balanceo, torsoEsc: { x: 1, y: 1 + respira * 0.005 + 0.035 * campana(t, T.inspira0, T.canta0 + 0.1) },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * Math.sin(t * 2.2 + 0.6) * (t < T.golpe ? 1 : 0.2), dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_G, t)), tirasLimpias: true, ikContinuo: false
    };
    // al cantar fuerte le tiembla todo
    const tiembla = tramo(t, T.fuerte0, T.fuerte0 + 0.3) * (t < T.golpe ? 1 : 0);
    p.torso += 0.012 * ruido(t * 30) * tiembla; p.cabeza.ang += 0.03 * ruido(t * 34 + 3) * tiembla;
    // la cabeza se va atrás con el golpe y rebota
    p.cabeza.ang -= 0.14 * rebote(t); p.cabeza.dx = -10 * rebote(t);
    for (const lado of ["cerca", "lejos"]) {
      const f = lado === "cerca" ? fc : fl, hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: TOB_G - f.alto - (lado === "lejos" ? 10 : 0) }, ang: -0.22 * f.punta };
    }
    // cara roja, sudor y vena al cantar fuerte; la boca vibra
    p.rojo = 0.18 * k + 0.45 * tramo(t, T.grito0, T.grito0 + 0.3) * (t < T.golpe + 0.5 ? 1 : 0) * (1 - tramo(t, T.golpe, T.golpe + 0.6));
    p.cara.rubor = p.rojo;
    p.sudor = tramo(t, T.fuerte0 + 0.2, T.fuerte0 + 0.6) * (1 - tramo(t, T.golpe + 0.4, T.golpe + 1.2)) + 0.6 * tramo(t, T.aturdido, T.aturdido + 0.3) * (1 - tramo(t, 11.6, 12.4));
    p.enfado = tramo(t, T.grito0, T.grito0 + 0.3) * (1 - tramo(t, T.golpe, T.golpe + 0.2));
    if (k > 0) p.cara.boca.abre += 7 * k * Math.sin(t * 31) * Math.sin(t * 7.3);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const bc = Tr(BOLS_G.c), bl = Tr(BOLS_G.l);
    c = mezcla(c, bc, (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, bl, (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    let muL = b.lmu, muC = b.cmu;
    // gestos de cantante: las manos se mueven con la voz
    const gesto = k * (t < T.golpe ? 1 : 0);
    l.x += 14 * Math.sin(t * 4.3) * gesto; l.y += 10 * Math.sin(t * 3.1 + 1) * gesto;
    // se frota la nariz con la mano lejana
    const kf = tramo(t, T.frota0 - 0.15, T.frota0 + 0.2) * (1 - tramo(t, T.frota1, T.frota1 + 0.35));
    let dedosL = dedosDe(b, "l");
    if (kf > 0) {
      const n = G.cabeza(p).a(NARIZ_G), fr = 9 * Math.sin((t - T.frota0) * 15) * tramo(t, T.frota0 + 0.15, T.frota0 + 0.3) * (1 - tramo(t, T.frota1 - 0.3, T.frota1));
      const objetivo = { x: n.x - 6 + fr, y: n.y + 34 };
      l = mezcla(l, objetivo, suave(kf)); muL = lerp(muL, 1.75, suave(kf));
      dedosL = { pulgar: lerp(dedosL.pulgar, 0.6, kf), indice: lerp(dedosL.indice, 0.9, kf), medio: lerp(dedosL.medio, 0.85, kf), anular: lerp(dedosL.anular, 0.7, kf), menique: lerp(dedosL.menique, 0.6, kf) };
    }
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: muC, dobla: -1, puno: b.cp, dedos: dedosDe(b, "c") };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: muL, dobla: -1, puno: b.lp, dedos: dedosL };
    // nariz roja y marca del latigazo
    const kn = t >= T.golpe ? suave(fase(t, T.golpe, T.golpe + 0.12)) * (1 - tramo(t, T.fin - 0.4, T.fin + 0.4)) : 0;
    if (kn > 0) p.capaCabeza = gg => narizRoja(gg, kn, t);
    cacheG.set(key, p);
    return p;
  }
  function narizRoja(g, k, t) {
    const lat = 1 + 0.08 * Math.max(0, Math.sin((t - T.golpe) * 9)) * (1 - tramo(t, T.golpe + 1.5, T.golpe + 3));
    g.save(); g.translate(NARIZ_G.x - 8, NARIZ_G.y + 2); g.scale(lat, lat);
    const gr = g.createRadialGradient(0, 0, 4, 0, 0, 46); gr.addColorStop(0, `rgba(235,30,30,${0.9 * k})`); gr.addColorStop(0.55, `rgba(235,40,40,${0.55 * k})`); gr.addColorStop(1, "rgba(235,40,40,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 46, 38, 0, 0, Math.PI * 2); g.fill();
    // verdugón del latigazo
    g.globalAlpha = k; g.strokeStyle = "#c81e24"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(-30, -16); g.quadraticCurveTo(0, -6, 26, 10); g.stroke();
    g.strokeStyle = "rgba(255,170,160,0.9)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-26, -17); g.quadraticCurveTo(0, -8, 22, 7); g.stroke();
    g.restore();
  }

  /* ---------- Ander: sentado en el taburete con la guitarra ---------- */
  const PEL_A = { x: AN.PELVIS.x, y: AN.PELVIS.y + DY_A };
  const PIES_A = { cerca: { x: 22, y: TAB.aro - 4 }, lejos: { x: 100, y: SUELO - AN.TOBILLO_ALTO * S * AN.K } };
  // posiciones de la mano del mástil (acordes)
  const ACORDES = [[0, 205], [1.6, 188], [3.3, 214], [4.8, 196], [5.9, 222], [6.6, 192], [7.25, 216], [7.75, 186], [8.1, 210]];
  function trasteX(t) {
    let x = ACORDES[0][1];
    for (let i = 1; i < ACORDES.length; i++) { const [t0, xx] = ACORDES[i]; if (t <= t0) break; x = lerp(x, xx, suave(fase(t, t0, t0 + 0.14))); }
    return x;
  }
  let cacheA = new Map();
  function poseA(t) {
    const key = Math.round(t * 1e5); if (cacheA.has(key)) return cacheA.get(key);
    if (cacheA.size > 400) cacheA = new Map();
    const e = guion(GUION_CARA_A, CARAS_A, t, "toca");
    const fA = faseA(t), ta = tocaA(t), resp = Math.sin(t * 2.1);
    const ojosCerrados = e.c > 0.5;
    const p = {
      x: XA, suelo: SUELO, s: S,
      pelvis: { x: PEL_A.x, y: PEL_A.y + resp * 1.2 }, torso: 0.05 + 0.012 * Math.sin(Math.PI * fA), torsoEsc: { x: 1, y: 1 + resp * 0.004 },
      piernas: {}, cabeza: { ang: 0.06 + 0.035 * Math.sin(Math.PI * fA) * (0.6 + ta), dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, ojosCerrados ? 0 : parpadeos(PARP_A, t)), tirasLimpias: true, ikContinuo: false
    };
    // sobresalto al romperse la cuerda
    p.cabeza.ang -= 0.1 * campana(t, T.rompe, T.rompe + 0.35); p.pelvis.y -= 12 * campana(t, T.rompe, T.rompe + 0.3);
    p.sudor = 0.7 * tramo(t, T.furia0 + 0.3, T.furia1 + 0.3) * (1 - tramo(t, T.rompe + 0.3, T.rompe + 1.2));
    for (const lado of ["cerca", "lejos"]) {
      const f = PIES_A[lado];
      // el pie del suelo lleva el ritmo con la punta
      const tap = lado === "lejos" ? 26 * Math.max(0, Math.sin(Math.PI * fA)) * (t < T.rompe ? 1 : 0) * (1 - 0.5 * tramo(t, T.furia0, T.furia1)) : 0;
      p.piernas[lado] = { tob: AN.aHoja(p, { x: XA + f.x, y: f.y }), ang: lado === "lejos" ? -tap * 0.01 : 0.15 };
      if (tap) p.piernas[lado].tob.y -= tap * 0.25;
    }
    p.cara.boca.abre += 4 * Math.max(0, Math.sin(t * 17)) * tramo(t, T.furia0, T.furia1) * (t < T.rompe ? 1 : 0);
    // mano del rasgueo: arriba y abajo sobre las cuerdas, entre la boca y el puente
    const amp = 26 + 8 * ta;
    let sy = amp * Math.sin(Math.PI * 2 * fA) * (1 - suave(fase(t, T.rompe, T.rompe + 0.25)));
    let sx = -52, levanta = suave(fase(t, T.rompe + 0.05, T.rompe + 0.4));      // al romperse, retira la mano
    // último acorde: un rasgueo lento hacia abajo y la mano se queda en el aire con floritura
    const kAc = tramo(t, T.acorde - 0.35, T.acorde - 0.05);
    const baja = salida(fase(t, T.acorde, T.acorde + 0.16)), flor = suave(fase(t, T.acorde + 0.2, T.acorde + 0.6));
    if (t > T.acorde - 0.35) {
      levanta = lerp(levanta, 0, kAc) + flor * 1.25;
      sy = lerp(sy, lerp(-34, 34, baja), kAc);
    }
    const local = { x: sx - 30 * levanta, y: sy - 60 * levanta };
    const T_ = AN.tronco(p), aG = GU.ang + p.torso;
    const hR = enHojaA(p, local);
    const flick = 0.25 * Math.cos(Math.PI * 2 * fA) * (t < T.rompe ? 1 : 0) - 0.5 * flor;
    p.manoCerca = { x: hR.x, y: hR.y, ang: 0, mu: -2.25 + p.torso + flick, dobla: -1, puno: 1,
      dedos: { pulgar: lerp(0.42, 1, flor), indice: lerp(0.45, 1, flor), medio: lerp(0.3, 1, flor), anular: lerp(0.25, 0.95, flor), menique: lerp(0.25, 0.9, flor) },
      objeto: flor < 0.6 ? gg => puA(gg, -2.25 + p.torso + flick, 1 - flor / 0.6) : null };
    // mano del mástil
    const hF = enHojaA(p, { x: trasteX(t), y: -2 });
    const aprieta = 0.08 * Math.sin(Math.PI * 2 * fA * 0.5) * (t < T.rompe ? 1 : 0);
    p.manoLejos = { x: hF.x, y: hF.y, ang: 0, mu: 2.35 + p.torso, dobla: 1, puno: 1,
      dedos: { pulgar: 0.3, indice: 0.5 + aprieta, medio: 0.45 - aprieta, anular: 0.42, menique: 0.38 } };
    p.capaTronco = gg => guitarra(gg, t);
    void T_; void aG;
    cacheA.set(key, p);
    return p;
  }
  // púa entre el pulgar y el índice (unidades de mano; los dedos van en sentido contrario a la muñeca)
  function puA(g, mu, k = 1) {
    const d = { x: Math.cos(mu + Math.PI) * 15, y: Math.sin(mu + Math.PI) * 15 };
    g.save(); g.translate(d.x, d.y); g.rotate(mu + Math.PI / 2); g.scale(k, k);
    g.fillStyle = "#e0402c"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-5, -3); g.quadraticCurveTo(0, -6, 5, -3); g.lineTo(0, 7); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function pose(t) { return { g: poseG(t), a: poseA(t) }; }

  /* ---------- la cuerda rota: latigazo desde el clavijero hasta la nariz ---------- */
  // La cuerda sigue sujeta en la cejuela; el extremo suelto (el del puente) barre por encima del
  // clavijero y llega a la nariz de Guillermo justo en T.golpe; luego cae y cuelga balanceándose.
  let LATIGO = null;
  function preparaLatigo() {
    const pa0 = poseA(T.rompe), P0p = guitAPantalla(pa0, { x: CEJUELA, y: CUERDAS[0].yc }), B0 = guitAPantalla(pa0, { x: PUENTE, y: CUERDAS[0].yp });
    const pg = poseG(T.golpe), N = G.aPantalla(pg, G.cabeza(pg).a(NARIZ_G));
    const paH = poseA(T.golpe), PH = guitAPantalla(paH, { x: CEJUELA, y: CUERDAS[0].yc });
    const th0 = Math.atan2(B0.y - P0p.y, B0.x - P0p.x);
    let th1 = Math.atan2(N.y - PH.y, N.x - PH.x); while (th1 < th0) th1 += Math.PI * 2;
    // estado al despegarse de la nariz (de ahí arranca el péndulo, sin saltos)
    const ts = T.golpe + 0.07, pgS = poseG(ts), PS = guitAPantalla(poseA(ts), { x: CEJUELA, y: CUERDAS[0].yc }), NS = G.aPantalla(pgS, G.cabeza(pgS).a(NARIZ_G));
    let thS = Math.atan2(NS.y - PS.y, NS.x - PS.x); while (thS < th1 - Math.PI) thS += Math.PI * 2; while (thS > th1 + Math.PI) thS -= Math.PI * 2;
    LATIGO = { th0, th1, thS, rS: Math.hypot(NS.x - PS.x, NS.y - PS.y), L: Math.hypot(B0.x - P0p.x, B0.y - P0p.y), rH: Math.hypot(N.x - PH.x, N.y - PH.y) };
  }
  function latigo(g, t, pa, pg) {
    if (t < T.rompe) return;
    if (!LATIGO) preparaLatigo();
    const { th0, th1, thS, rS, L, rH } = LATIGO;
    const P = guitAPantalla(pa, { x: CEJUELA, y: CUERDAS[0].yc });
    let th, r, curva = 0, onda = 0, rizo = 0;
    if (t < T.golpe) {               // barrido acelerado
      const u = entrada(fase(t, T.rompe, T.golpe));
      th = lerp(th0, th1, u); r = lerp(L, rH, salida(fase(t, T.rompe, T.golpe))); curva = -0.9 * Math.sin(Math.PI * u) - 0.25;
    } else {
      const v = t - T.golpe;
      if (v < 0.07) {                 // pegada a la nariz
        const n = G.aPantalla(pg, G.cabeza(pg).a(NARIZ_G));
        th = Math.atan2(n.y - P.y, n.x - P.x); r = Math.hypot(n.x - P.x, n.y - P.y); onda = salida(v / 0.03); curva = -0.25 * (1 - suave(v / 0.07));
        while (th < th1 - Math.PI) th += Math.PI * 2; while (th > th1 + Math.PI) th -= Math.PI * 2;
      } else {                        // cae y cuelga como un péndulo amortiguado
        const w = v - 0.07, abajo = thS + ((Math.PI / 2 - thS) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const amort = Math.exp(-w * 2.2);
        th = abajo - (abajo - thS) * amort * Math.cos(w * 5.5);
        r = lerp(rS, L * 0.42, salida(fase(w, 0, 0.6)));
        onda = Math.exp(-w * 3); rizo = salida(fase(w, 0.2, 1.0));
        // el último acorde la vuelve a mecer
        th += 0.12 * campana(t, T.acorde, T.acorde + 1.2) * Math.sin((t - T.acorde) * 6);
        th += 0.03 * Math.sin(t * 1.7);
      }
    }
    const E = { x: P.x + Math.cos(th) * r, y: P.y + Math.sin(th) * r };
    // control: la cuerda se arquea y se queda atrás del barrido
    const mx = (P.x + E.x) / 2, my = (P.y + E.y) / 2, nx = -(E.y - P.y) / (r || 1), ny = (E.x - P.x) / (r || 1);
    const C = { x: mx + nx * curva * r * 0.45, y: my + ny * curva * r * 0.45 };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const pts = [];
    for (let k = 0; k <= 22; k++) {
      const u = k / 22, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
      let x = a * P.x + b * C.x + c * E.x, y = a * P.y + b * C.y + c * E.y;
      const w = onda * 6 * Math.sin(u * Math.PI * 5 - (t - T.golpe) * 60) * Math.sin(Math.PI * u) + rizo * 5 * u * Math.sin(u * Math.PI * 9);
      x += nx * w; y += ny * w; pts.push({ x, y });
    }
    // rizo de la punta al colgar
    if (rizo > 0.01) {
      const last = pts[pts.length - 1];
      for (let k = 1; k <= 14; k++) { const a = Math.PI / 2 + k / 14 * Math.PI * 2.2 * rizo, rr = 7 * rizo * (1 - k / 18);
        pts.push({ x: last.x + Math.cos(a) * rr - 7 * rizo * 0, y: last.y - rr * 0.2 + Math.sin(a) * rr }); }
    }
    const ruta = () => { g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k].x, pts[k].y); };
    ruta(); g.strokeStyle = "rgba(20,16,12,0.55)"; g.lineWidth = 3.2; g.stroke();
    ruta(); g.strokeStyle = "#f4ecd6"; g.lineWidth = 1.7; g.stroke();
    // estela del latigazo
    if (t < T.golpe + 0.05) {
      const kk = fase(t, T.rompe, T.golpe);
      g.strokeStyle = `rgba(255,255,255,${0.55 * Math.sin(Math.PI * clamp(kk))})`; g.lineWidth = 2.2;
      g.beginPath(); g.arc(P.x, P.y, r * 0.98, th - 0.9 * kk, th - 0.05); g.stroke();
      g.beginPath(); g.arc(P.x, P.y, r * 0.86, th - 0.6 * kk, th - 0.05); g.stroke();
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rr, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rr + i * Math.PI / puntas, q = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.28); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // rayitas del «¡tang!» alrededor del clavijero
  function tang(g, t, P) {
    const k = fase(t, T.rompe, T.rompe + 0.35); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -2.3 + i * 0.45, r0 = 18 + 22 * k; g.beginPath(); g.moveTo(P.x + Math.cos(a) * r0, P.y + Math.sin(a) * r0); g.lineTo(P.x + Math.cos(a) * (r0 + 12), P.y + Math.sin(a) * (r0 + 12)); g.stroke(); }
    g.restore();
  }
  // silencio: un par de gotas de sudor/lágrimas y unas rayitas de dolor sobre Guillermo
  function dolor(g, t, pg) {
    const k = tramo(t, T.golpe + 0.1, T.golpe + 0.3) * (1 - tramo(t, T.frota0 + 0.6, T.frota0 + 1.1)); if (k <= 0.01) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a({ x: 790, y: 330 }));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.42, r0 = 38 + 3 * Math.sin(t * 20 + i);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * (r0 + 12), c.y + Math.sin(a) * (r0 + 12)); g.stroke(); }
    g.restore();
  }

  /* ---------- copas en la balda ---------- */
  const COPAS = [
    { x: 808, tipo: "vino" }, { x: 843, tipo: "vaso" }, { x: 876, tipo: "flauta" }, { x: 908, tipo: "jarra" }];
  function copas(g, t) {
    const vib = 1.8 * cantaG(t) * (t < T.golpe ? 1 : 0);
    COPAS.forEach((c, i) => {
      const dx = vib * ruido(t * 41 + i * 7), dy = -Math.abs(vib * 0.6 * ruido(t * 37 + i * 3));
      g.save(); g.translate(c.x + dx, BALDA.y + dy); g.scale(1.35, 1.35); g.lineJoin = "round"; g.lineCap = "round";
      const vidrio = "rgba(206,236,255,0.38)";
      g.fillStyle = vidrio; g.strokeStyle = TINTA; g.lineWidth = 1.8;
      let cuerpo;
      if (c.tipo === "vino") {
        cuerpo = () => { g.beginPath(); g.moveTo(-10, -40); g.quadraticCurveTo(-11, -22, 0, -19); g.quadraticCurveTo(11, -22, 10, -40); g.closePath(); };
        g.beginPath(); g.moveTo(0, -19); g.lineTo(0, -2); g.stroke(); g.beginPath(); g.ellipse(0, -1.5, 8, 2, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      } else if (c.tipo === "vaso") {
        cuerpo = () => { g.beginPath(); g.moveTo(-9, -30); g.lineTo(9, -30); g.lineTo(7, 0); g.lineTo(-7, 0); g.closePath(); };
      } else if (c.tipo === "flauta") {
        cuerpo = () => { g.beginPath(); g.moveTo(-6, -46); g.quadraticCurveTo(-6.5, -24, 0, -20); g.quadraticCurveTo(6.5, -24, 6, -46); g.closePath(); };
        g.beginPath(); g.moveTo(0, -20); g.lineTo(0, -2); g.stroke(); g.beginPath(); g.ellipse(0, -1.5, 7, 2, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      } else {
        cuerpo = () => { g.beginPath(); g.moveTo(-10, -34); g.lineTo(10, -34); g.lineTo(10, -2); g.quadraticCurveTo(10, 0, 8, 0); g.lineTo(-8, 0); g.quadraticCurveTo(-10, 0, -10, -2); g.closePath(); };
        g.beginPath(); g.moveTo(10, -28); g.quadraticCurveTo(20, -26, 19, -16); g.quadraticCurveTo(18, -8, 10, -8); g.lineWidth = 3.4; g.stroke(); g.lineWidth = 1.8;
      }
      cuerpo(); g.fill(); g.stroke();
      g.save(); cuerpo(); g.clip();
      g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-7, -44, 2.2, 40);
      // grieta
      const kg = fase(t, COPAS_T[i], COPAS_T[i] + 0.12);
      if (kg > 0) {
        g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 1.7;
        let x = (hash(i * 3 + 1) - 0.5) * 4, y = -36 + 4 * hash(i);
        g.beginPath(); g.moveTo(x, y);
        const pasos = Math.ceil(7 * kg);
        for (let k = 0; k < pasos; k++) { x += (hash(i * 13 + k) - 0.5) * 9; y += 4.5; g.lineTo(x, y); if (k === 2) { g.moveTo(x, y); g.lineTo(x + 5, y - 3); g.moveTo(x, y); } }
        g.stroke();
      }
      g.restore();
      g.restore();
      // destello al agrietarse
      const kd = fase(t, COPAS_T[i], COPAS_T[i] + 0.3);
      if (kd > 0 && kd < 1) {
        g.save(); g.globalAlpha = Math.sin(Math.PI * kd); g.fillStyle = "#ffffff"; g.translate(c.x + 6, BALDA.y - 34); g.rotate(kd);
        g.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 2 : 8; g.lineTo(Math.cos(k * Math.PI / 4) * r, Math.sin(k * Math.PI / 4) * r); } g.closePath(); g.fill(); g.restore();
      }
    });
    // la jarra suelta un trozo de cristal que cae
    const kt = fase(t, COPAS_T[3] + 0.05, COPAS_T[3] + 0.75);
    if (kt > 0 && kt < 1) {
      const x = COPAS[3].x + 8 + 30 * kt, y = BALDA.y - 26 + 260 * kt * kt - 40 * kt;
      g.save(); g.translate(x, y); g.rotate(kt * 9); g.fillStyle = "rgba(220,240,255,0.85)"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(-4, -3); g.lineTo(5, -2); g.lineTo(-1, 5); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
  }

  /* ---------- el perro de la ventana ---------- */
  function estadoPerro(t) {
    const sube = tramo(t, T.perro0, T.perro0 + 0.4) * (1 - tramo(t, T.escondido, T.escondido + 0.35));
    const asoma = tramo(t, 9.3, 9.65) * (1 - tramo(t, 10.4, 10.75));
    return {
      sube: Math.max(sube, 0.75 * asoma),
      aulla: tramo(t, T.aulla0, T.aulla0 + 0.25) * (1 - tramo(t, T.orejas, T.orejas + 0.2)),
      orejas: tramo(t, T.orejas, T.orejas + 0.2) * (1 - tramo(t, T.escondido + 0.2, T.escondido + 0.4)),
      ladea: asoma
    };
  }
  function perro(g, t) {
    const e = estadoPerro(t); if (e.sube <= 0.01) return;
    const cx = (VENT.x0 + VENT.x1) / 2 + 4, base = VENT.y1 - 2;
    g.save();
    g.beginPath(); g.rect(VENT.x0 + 6, VENT.y0 + 6, VENT.x1 - VENT.x0 - 12, VENT.y1 - VENT.y0 - 12); g.clip();
    g.translate(cx, base + 100 * (1 - suave(e.sube))); g.scale(1.22, 1.22);
    g.rotate(-0.42 * e.aulla + 0.25 * e.ladea + 0.03 * Math.sin(t * 9) * e.aulla);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 2.2;
    const pelo = "#c98b4e", oscuro = "#7a4a26", claro = "#f4dfc0";
    // cuello y cabeza
    g.fillStyle = pelo; g.beginPath(); g.ellipse(0, -14, 22, 26, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, -46, 24, 22, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // hocico
    g.fillStyle = claro; g.beginPath(); g.ellipse(14, -40, 15, 11, 0.15, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.ellipse(26, -45, 5, 4, 0.2, 0, Math.PI * 2); g.fill();
    // boca: aullido en «o»
    if (e.aulla > 0.05) { const o = 6 * e.aulla * (1 + 0.15 * Math.sin(t * 14)); g.fillStyle = "#5a1414"; g.beginPath(); g.ellipse(18, -32, o * 0.7, o, 0.2, 0, Math.PI * 2); g.fill(); g.stroke(); }
    else { g.beginPath(); g.moveTo(10, -33); g.quadraticCurveTo(16, -30, 22, -34); g.stroke(); }
    // ojo
    const cerrado = e.aulla > 0.5 || e.orejas > 0.5;
    if (cerrado) { g.beginPath(); g.moveTo(-2, -55); g.quadraticCurveTo(4, -51, 10, -55); g.stroke(); }
    else { g.fillStyle = TINTA; g.beginPath(); g.arc(4, -54, 3.4, 0, Math.PI * 2); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(5, -55.5, 1.1, 0, Math.PI * 2); g.fill(); }
    // orejas caídas (o tapadas con las patas)
    g.fillStyle = oscuro;
    const oreja = (x, a) => { g.save(); g.translate(x, -60); g.rotate(a); g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-14, 18, -4, 30); g.quadraticCurveTo(6, 26, 7, 4); g.closePath(); g.fill(); g.stroke(); g.restore(); };
    oreja(-14, 0.35 - 0.3 * e.orejas); oreja(-4, 0.1 - 0.25 * e.orejas);
    if (e.orejas > 0.02) {           // patas sobre las orejas
      g.fillStyle = pelo;
      for (const [x, y] of [[-26, -48], [8, -66]]) { g.save(); g.translate(x, y + 30 * (1 - e.orejas)); g.beginPath(); g.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); }
    }
    g.restore();
    // ondas del aullido (fuera de la ventana)
    if (e.aulla > 0.05) {
      g.save(); g.strokeStyle = `rgba(255,248,220,${0.75 * e.aulla})`; g.lineWidth = 2.5; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const ph = ((t - T.aulla0) * 1.4 + i / 3) % 1, r = 16 + 46 * ph;
        g.globalAlpha = Math.sin(Math.PI * ph); g.beginPath(); g.arc(cx + 30, VENT.y0 + 60 - 20 * ph, r, -1.9, -0.4); g.stroke(); }
      g.restore();
    }
  }
  function marcoVentana(g) {
    const { x0, y0, x1, y1 } = VENT, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    g.save(); g.lineJoin = "round";
    g.strokeStyle = "#5a3a22"; g.lineWidth = 8;
    g.beginPath(); g.moveTo(mx, y0 + 4); g.lineTo(mx, y1 - 4); g.moveTo(x0 + 4, my); g.lineTo(x1 - 4, my); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.lineWidth = 10; g.strokeStyle = "#5a3a22"; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    g.lineWidth = 2.5; g.strokeStyle = TINTA; g.strokeRect(x0 - 5, y0 - 5, x1 - x0 + 10, y1 - y0 + 10); g.strokeRect(x0 + 5, y0 + 5, x1 - x0 - 10, y1 - y0 - 10);
    // alféizar
    g.fillStyle = "#6a4428"; g.fillRect(x0 - 14, y1 + 5, x1 - x0 + 28, 10); g.strokeRect(x0 - 14, y1 + 5, x1 - x0 + 28, 10);
    // brillo del cristal
    g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.moveTo(x0 + 12, y1 - 10); g.lineTo(x0 + 40, y0 + 10); g.lineTo(x0 + 52, y0 + 10); g.lineTo(x0 + 24, y1 - 10); g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- decorado: café folk de noche ---------- */
  let fondo = null, vineta = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared verde azulada con manchas de yeso
    const pared = g.createLinearGradient(0, -60, 0, 410); pared.addColorStop(0, "#123232"); pared.addColorStop(1, "#24595a");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 470);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "0,0,0"},0.035)`; g.beginPath(); g.ellipse(hash(i + 3) * W, hash(i + 9) * 400 - 40, 20 + 40 * hash(i + 5), 12 + 22 * hash(i + 7), hash(i) * 3, 0, Math.PI * 2); g.fill(); }
    // foco cálido sobre Ander
    const foco = g.createRadialGradient(XA + 20, 250, 20, XA + 20, 250, 420);
    foco.addColorStop(0, "rgba(255,206,130,0.42)"); foco.addColorStop(0.5, "rgba(255,180,100,0.14)"); foco.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = foco; g.fillRect(-40, -60, W + 80, 520);
    // ventana de noche (el marco se dibuja encima del perro)
    const { x0, y0, x1, y1 } = VENT;
    const cielo = g.createLinearGradient(0, y0, 0, y1); cielo.addColorStop(0, "#0a1230"); cielo.addColorStop(1, "#283a6e");
    g.fillStyle = cielo; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = "#f6efcc"; g.beginPath(); g.arc(x0 + 38, y0 + 34, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,250,220,0.18)"; g.beginPath(); g.arc(x0 + 38, y0 + 34, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.85)"; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(x0 + 8 + hash(i + 40) * (x1 - x0 - 16), y0 + 8 + hash(i + 50) * 70, 1.1, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#0c1328"; for (let i = 0; i < 5; i++) { const w = 20 + hash(i + 60) * 14, h = 24 + hash(i + 70) * 40; g.fillRect(x0 + i * 28 - 4, y1 - h, w, h); }
    g.fillStyle = "#e9c46a"; for (let i = 0; i < 4; i++) g.fillRect(x0 + 10 + i * 30, y1 - 18 - 10 * hash(i + 80), 4, 5);
    // guirnalda de bombillas
    g.strokeStyle = "#0a0a0c"; g.lineWidth = 2;
    const guir = x => 26 + 30 * Math.sin(Math.PI * ((x + 40) % 360) / 360);
    g.beginPath(); for (let x = -40; x <= W + 40; x += 10) { const y = guir(x); if (x === -40) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    for (let x = -10; x < W + 30; x += 60) {
      const y = guir(x) + 6, col = ["#ffd36b", "#ff8f6b", "#9be7c4", "#ffe8a8"][Math.round(x / 60) & 3];
      const halo = g.createRadialGradient(x, y + 6, 1, x, y + 6, 26); halo.addColorStop(0, "rgba(255,220,150,0.45)"); halo.addColorStop(1, "rgba(255,220,150,0)");
      g.fillStyle = halo; g.fillRect(x - 26, y - 20, 52, 52);
      g.fillStyle = "#2a2a2e"; g.fillRect(x - 2.5, y - 4, 5, 5);
      g.fillStyle = col; g.beginPath(); g.ellipse(x, y + 7, 5, 7, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    }
    // disco de vinilo colgado y un cuadro con una guitarra (sin letras)
    g.save(); g.translate(560, 110);
    g.fillStyle = "#111014"; g.beginPath(); g.arc(0, 0, 34, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 1; for (let r = 14; r < 33; r += 4) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = "#d8403a"; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = "#f2e2c0"; g.beginPath(); g.arc(0, 0, 2.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(-12, -14, 10, 4, -0.7, 0, Math.PI * 2); g.fill();
    g.restore();
    g.save(); g.translate(690, 70);
    g.fillStyle = "#6a4428"; g.fillRect(-4, -4, 78, 98); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.strokeRect(-4, -4, 78, 98);
    g.fillStyle = "#f0d9a8"; g.fillRect(4, 4, 62, 82);
    g.fillStyle = "#c0462e"; g.beginPath(); g.ellipse(35, 62, 16, 14, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(35, 44, 12, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a1c0c"; g.fillRect(32, 12, 6, 30); g.fillRect(29, 8, 12, 8); g.beginPath(); g.arc(35, 52, 4, 0, Math.PI * 2); g.fill();
    g.restore();
    // balda de las copas (las copas se dibujan aparte)
    g.fillStyle = "#6a4428"; g.fillRect(BALDA.x0, BALDA.y, BALDA.x1 - BALDA.x0, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(BALDA.x0, BALDA.y, BALDA.x1 - BALDA.x0, 9);
    for (const x of [BALDA.x0 + 14, BALDA.x1 - 14]) { g.fillStyle = "#4a2e1a"; g.beginPath(); g.moveTo(x - 4, BALDA.y + 9); g.lineTo(x + 4, BALDA.y + 9); g.lineTo(x, BALDA.y + 26); g.closePath(); g.fill(); g.stroke(); }
    // zócalo de madera
    g.fillStyle = "#3a2414"; g.fillRect(-40, 410, W + 80, SUELO - 410);
    g.fillStyle = "#5a3820"; g.fillRect(-40, 404, W + 80, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-40, 404, W + 80, 9);
    g.strokeStyle = "rgba(0,0,0,0.35)"; for (let x = 0; x < W + 40; x += 34) { g.beginPath(); g.moveTo(x, 414); g.lineTo(x, SUELO); g.stroke(); }
    // suelo de tablas
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#6a4024"); su.addColorStop(1, "#2a160a");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const y = SUELO + 10 + i * i * 7 + i * 6; g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -60; x < W + 80; x += 84) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x + (x - 512) * 0.3, H + 60); g.stroke(); }
    // charco de luz del foco en el suelo
    const charco = g.createRadialGradient(XA + 30, SUELO + 8, 10, XA + 30, SUELO + 8, 210); charco.addColorStop(0, "rgba(255,206,130,0.32)"); charco.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = charco; g.beginPath(); g.ellipse(XA + 30, SUELO + 10, 210, 30, 0, 0, Math.PI * 2); g.fill();
    // alfombra bajo el taburete
    g.save(); g.translate(XA + 20, SUELO + 12);
    g.fillStyle = "#8a2c22"; g.beginPath(); g.ellipse(0, 0, 150, 20, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "#e0b45a"; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 128, 15, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#2e5a4a"; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 100, 11, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
    // taburete de Ander
    g.save(); g.translate(TAB.x, 0); g.strokeStyle = TINTA; g.lineWidth = 2.5;
    for (const [x0b, x1b] of [[-30, -42], [30, 42], [-12, -16], [12, 16]]) { g.fillStyle = x0b * x1b > 0 && Math.abs(x0b) < 20 ? "#4a2e1a" : "#6a4428"; g.beginPath(); g.moveTo(x0b - 3, TAB.asiento + 6); g.lineTo(x0b + 3, TAB.asiento + 6); g.lineTo(x1b + 3, SUELO); g.lineTo(x1b - 3, SUELO); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = "#c9a14a"; g.fillRect(-39, TAB.aro + 4, 78, 5); g.strokeRect(-39, TAB.aro + 4, 78, 5);
    g.fillStyle = "#2e5a4a"; g.beginPath(); g.ellipse(0, TAB.asiento, 42, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#1e3e32"; g.fillRect(-42, TAB.asiento, 84, 8); g.strokeRect(-42, TAB.asiento, 84, 8);
    g.restore();
    // cajón con discos en el rincón
    g.save(); g.translate(40, SUELO);
    g.fillStyle = "#8a5a32"; g.fillRect(0, -54, 96, 54); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.strokeRect(0, -54, 96, 54);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.moveTo(0, -27); g.lineTo(96, -27); g.stroke();
    for (let i = 0; i < 7; i++) { g.fillStyle = ["#d8403a", "#2e5a8a", "#e0b45a", "#3a7a5a"][i % 4]; g.fillRect(8 + i * 12, -72 + 4 * hash(i), 10, 20); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(8 + i * 12, -72 + 4 * hash(i), 10, 20); }
    g.restore();
    // planta en el rincón derecho
    g.save(); g.translate(970, SUELO);
    g.fillStyle = "#b5582e"; g.beginPath(); g.moveTo(-22, -40); g.lineTo(22, -40); g.lineTo(16, 0); g.lineTo(-16, 0); g.closePath(); g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; g.fillStyle = i % 2 ? "#3f8a4e" : "#2e6a3c";
      g.save(); g.translate(0, -40); g.rotate(a + Math.PI / 2); g.beginPath(); g.ellipse(0, -40, 9, 38, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.8; g.stroke(); g.restore(); }
    g.restore();
    return c;
  }
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 680); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }

  /* ---------- cámara ---------- */
  const CAM = [[0, 1.06, 505, 322], [5.4, 1.06, 505, 322], [8.3, 1.16, 500, 318], [8.7, 1.16, 500, 318], [9.6, 1.1, 505, 320], [DUR, 1.1, 505, 320]];
  function camara(t) {
    let i = 0; while (i + 1 < CAM.length && t >= CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[Math.min(CAM.length - 1, i + 1)], k = b === a ? 0 : suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }

  class GuillermoAnderGuitarra extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !AN.listo()) return;
      if (!fondo) { fondo = creaFondo(); vineta = creaVineta(); }
      const { g: pg, a: pa } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = t >= T.golpe ? 5 * Math.exp(-(t - T.golpe) * 7) * suave(fase(t, T.golpe, T.golpe + 0.03)) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -60);
      perro(g, t); marcoVentana(g);
      copas(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      g.beginPath(); g.ellipse(XA + 40, SUELO + 2, 92, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pg.x, SUELO + 2, 80, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      AN.dibujar(g, pa, t);
      G.dibujar(g, pg, t);
      // notas, cuerda rota y golpes
      notasA(g, t); notasG(g, t); notaFinal(g, t, pa);
      latigo(g, t, pa, pg);
      if (t >= T.rompe && t < T.rompe + 0.4) tang(g, t, guitAPantalla(pa, { x: CEJUELA + 40, y: 0 }));
      if (t >= T.golpe) impacto(g, t, T.golpe, ...Object.values(G.aPantalla(pg, G.cabeza(pg).a(NARIZ_G))), 22);
      dolor(g, t, pg);
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00040", nombre: "Guillermo y Ander · La guitarra", crear: () => new GuillermoAnderGuitarra() });
  window.__A2D_00040 = { pose, T, DUR, poseG, poseA, guitAPantalla };
})();
