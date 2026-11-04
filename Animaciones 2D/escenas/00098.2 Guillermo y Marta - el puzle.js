"use strict";
/* 00098.2 · Guillermo y Marta · El puzle
 *
 * Negro → el rincón de juegos de casa, al anochecer: pared azul petróleo con papel de rombitos dorados,
 * zócalo crema, una ventana con la hora azul (luna, tejados con ventanas encendidas) entre cortinas de
 * terciopelo mostaza, una estantería con cajas de juegos (sin letras), un reloj sin números, una lámpara
 * de esmalte verde colgando sobre la mesa y una alfombra. En la mesa, sobre un tapete verde, un puzle de
 * 40 piezas casi terminado (una puesta de sol: sol, mar, velero, gaviotas y palmera), la tapa de la caja
 * apoyada detrás con el mismo dibujo y dos tazas. Guillermo, a la izquierda; Marta, a la derecha.
 *
 * Marta coloca dos piezas con calma (¡clic!, chispita) y coge la última. Guillermo, con una pieza en la
 * mano (girada, aunque él no lo sabe), la mira y la remira; la pone en su hueco y no entra: la aprieta con
 * el dedo (lengua fuera), con el puño (rojo, temblando)… carga el puño y ¡PUM! → todo el puzle salta por
 * los aires: las piezas suben girando y dando vueltas (se ve el cartón de detrás), se quedan flotando… y
 * llueven una a una, cada una a su sitio, hasta que el puzle queda montado salvo un hueco: el del sol.
 * Los dos lo miran pasmados. Marta, que no ha soltado su pieza, la pone: ¡clic!, el sol se enciende y un
 * brillo recorre el puzle. Guillermo saca pecho como si hubiera sido cosa suya… nota algo en el bolsillo,
 * saca otra pieza, la mira, mira el puzle completo, mira a cámara y se encoge de hombros con las palmas
 * arriba. Marta levanta una ceja y se ríe tapándose la boca; guiño → negro.
 *
 * Sin textos. Las piezas son de verdad: el dibujo se pinta una vez y se trocea en 40 piezas con sus
 * pestañas (cada una en su lienzo, con su reverso de cartón). El tablero se ve inclinado hacia cámara
 * (plano afín) y las piezas en el aire se enderezan. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, hash, campana, rectanguloRedondeado } = M2;
  const G = Guillermo, M = Marta;
  const DUR = 14.6;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // Marta coloca dos piezas y coge la última
    mA0: 0.72, mA1: 0.98, mA2: 1.06, mA3: 1.45, snapA: 1.62,
    mB0: 1.92, mB1: 2.12, mB2: 2.2, mB3: 2.6, snapB: 2.78,
    mZ0: 3.02, mZ1: 3.26, mZ2: 3.34, mZ3: 3.78,
    // Guillermo y su pieza (girada)
    gOoh: 1.7, gAsiente: 2.92,
    gBaja0: 3.0, gBaja: 3.42,
    gDedo0: 3.66, ap1: 3.94, ap2: 4.16, gPuno0: 4.38, gPuno1: 4.88,
    gCarga0: 4.92, gCarga: 5.24, pum: 5.42,
    mCeja: 3.9, mNo: 4.4, mAlarma: 5.0,
    // vuelo y lluvia
    gArriba: 5.78, mArriba: 5.7, cae0: 6.95, cae1: 8.62,
    // después
    mira: 8.82, gCamara: 9.12, mMiraG: 9.0, mPieza: 9.25,
    mLleva0: 9.52, mLleva: 9.86, snapZ: 10.02, brillo0: 10.06, brillo1: 10.9,
    gAsombro: 10.06, gOrgullo: 10.32, gToca: 10.95, gBusca: 11.12, gSaca: 11.38, gMiraPieza: 11.66, gMiraPuzle: 11.98, gMiraCam: 12.18,
    encoge0: 12.28, encoge: 12.6, mCeja2: 12.22, mRie0: 12.48, mRie1: 13.2, mCamara: 13.3, guino: 13.55,
    fin: 13.95
  };

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
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8), PALMA = D(1, 1),
    PINZA = D(0.5, 0.55, 0.12, 0.1, 0.1), SENALA = D(0.15, 1, 0.06, 0.05, 0.05), PUNO = D(0, 0);
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de mundo; la cámara amplía un poco)
   * ===================================================================================== */
  const S = 0.3, SUELO = 560;
  const XG = 345, XM = 680;                          // pelvis de cada uno (Marta mira a la izquierda)
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;

  /* ---------- el puzle: 8 × 5 piezas de 30 unidades, sobre un plano inclinado hacia cámara ---------- */
  const COLS = 8, FILAS = 5, U = 30, PW = COLS * U, PH = FILAS * U;
  const SX = 0.92, SY = 0.54;                        // unidades → px (el tablero se ve inclinado)
  const PX0 = 512 - PW * SX / 2, PY0 = 330 - PH * SY / 2;
  const aMundo = (u, v) => ({ x: PX0 + u * SX, y: PY0 + v * SY });
  const idx = (c, f) => f * COLS + c;
  const centro = i => aMundo((i % COLS + 0.5) * U, (Math.floor(i / COLS) + 0.5) * U);
  const IA = idx(6, 1), IB = idx(7, 3), IC = idx(1, 2), IZ = idx(5, 2), N = COLS * FILAS;
  const PA = centro(IA), PB = centro(IB), PC = centro(IC), PZ = centro(IZ);
  // montoncito de Marta en el borde de delante de la mesa
  const PILA = { A: { x: 602, y: 389, rot: -0.38 }, B: { x: 620, y: 391, rot: 0.32 }, Z: { x: 586, y: 394, rot: 0.55 } };
  const ROT_C = Math.PI / 2 + 0.06;                  // la pieza de Guillermo va girada un cuarto de vuelta
  const CX = { x: PC.x + 7, y: PC.y - 4.5 }, ROT_CX = ROT_C + 0.1;   // así se queda, montada y torcida sobre el hueco

  // dibujo del puzle (y de la tapa de la caja)
  const R2 = 2, MRG = 8, LADO = (U + 2 * MRG) * R2, MED = LADO / 2;
  const HZ = 88, SOL = { u: 165, v: 84, r: 22 };
  function creaCuadro() {
    const cv = document.createElement("canvas"); cv.width = PW * R2; cv.height = PH * R2;
    const g = cv.getContext("2d"); g.scale(R2, R2); g.lineCap = "round"; g.lineJoin = "round";
    const gc = g.createLinearGradient(0, 0, 0, HZ);
    gc.addColorStop(0, "#35195a"); gc.addColorStop(0.35, "#87306f"); gc.addColorStop(0.72, "#e0614b"); gc.addColorStop(1, "#ffb64a");
    g.fillStyle = gc; g.fillRect(0, 0, PW, HZ + 1);
    // halo y sol
    const gh = g.createRadialGradient(SOL.u, SOL.v, 4, SOL.u, SOL.v, 95);
    gh.addColorStop(0, "rgba(255,236,150,0.75)"); gh.addColorStop(0.35, "rgba(255,190,110,0.28)"); gh.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = gh; g.fillRect(0, 0, PW, HZ);
    // nubes alargadas
    for (const [u, v, w, h, col] of [[40, 26, 46, 3.2, "rgba(255,140,170,0.55)"], [120, 40, 70, 3.6, "rgba(255,170,150,0.6)"], [196, 22, 54, 3, "rgba(200,110,170,0.6)"],
      [70, 52, 40, 2.6, "rgba(255,190,140,0.55)"], [150, 60, 36, 2.2, "rgba(255,210,150,0.6)"], [222, 56, 30, 2.4, "rgba(255,170,130,0.55)"]]) {
      g.fillStyle = col; g.beginPath(); g.ellipse(u, v, w / 2, h, 0, 0, Math.PI * 2); g.fill();
    }
    g.save(); g.beginPath(); g.rect(0, 0, PW, HZ); g.clip();
    g.fillStyle = "#ffdf72"; g.beginPath(); g.arc(SOL.u, SOL.v, SOL.r, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff4bf"; g.beginPath(); g.arc(SOL.u - 3, SOL.v - 4, SOL.r * 0.66, 0, Math.PI * 2); g.fill();
    g.restore();
    // gaviotas
    g.strokeStyle = "#2a1236"; g.lineWidth = 1.3;
    for (const [u, v, s] of [[52, 30, 1], [64, 25, 0.8], [76, 33, 0.9], [118, 18, 0.7]]) {
      g.beginPath(); g.moveTo(u - 4 * s, v - 1.5 * s); g.quadraticCurveTo(u - 2 * s, v - 3 * s, u, v); g.quadraticCurveTo(u + 2 * s, v - 3 * s, u + 4 * s, v - 1.5 * s); g.stroke();
    }
    // mar
    const gm = g.createLinearGradient(0, HZ, 0, PH); gm.addColorStop(0, "#5a3a86"); gm.addColorStop(0.25, "#33307a"); gm.addColorStop(1, "#141443");
    g.fillStyle = gm; g.fillRect(0, HZ, PW, PH - HZ);
    g.fillStyle = "rgba(255,190,120,0.75)"; g.fillRect(0, HZ, PW, 1);
    // estela del sol
    for (let k = 0; k < 10; k++) {
      const y = HZ + 3 + k * 5.8, w = 34 - k * 2.4 + 6 * Math.sin(k * 2.1);
      g.fillStyle = `rgba(255,${200 - k * 8},${110 - k * 4},${0.85 - k * 0.06})`;
      g.beginPath(); g.ellipse(SOL.u + 2 * Math.sin(k * 1.7), y, Math.max(3, w / 2), 1.2, 0, 0, Math.PI * 2); g.fill();
    }
    // olitas
    g.strokeStyle = "rgba(160,150,230,0.35)"; g.lineWidth = 0.9;
    for (let k = 0; k < 16; k++) { const u = hash(k * 3.3) * PW, v = HZ + 8 + hash(k * 5.1) * 55; g.beginPath(); g.moveTo(u - 5, v); g.quadraticCurveTo(u, v - 1.6, u + 5, v); g.stroke(); }
    // velero
    g.fillStyle = "#20142e"; g.beginPath(); g.moveTo(48, HZ - 1); g.lineTo(76, HZ - 1); g.lineTo(71, HZ + 4); g.lineTo(53, HZ + 4); g.closePath(); g.fill();
    g.strokeStyle = "#20142e"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(61, HZ - 1); g.lineTo(61, HZ - 30); g.stroke();
    g.fillStyle = "#ffcf9a"; g.beginPath(); g.moveTo(62.5, HZ - 29); g.quadraticCurveTo(72, HZ - 16, 74, HZ - 4); g.lineTo(62.5, HZ - 4); g.closePath(); g.fill();
    g.fillStyle = "#f29a7a"; g.beginPath(); g.moveTo(59.5, HZ - 26); g.lineTo(59.5, HZ - 4); g.lineTo(50, HZ - 4); g.closePath(); g.fill();
    g.strokeStyle = "rgba(32,20,46,0.7)"; g.lineWidth = 0.8; g.stroke();
    g.fillStyle = "rgba(255,200,140,0.5)"; g.fillRect(52, HZ + 5, 22, 0.8);
    // islote a la izquierda
    g.fillStyle = "#2a1838"; g.beginPath(); g.moveTo(0, HZ + 1); g.quadraticCurveTo(10, HZ - 12, 26, HZ - 4); g.quadraticCurveTo(34, HZ - 1, 40, HZ + 1); g.closePath(); g.fill();
    // palmera a la derecha
    g.strokeStyle = "#1b0f24"; g.lineCap = "round";
    const tronco = [[236, 150], [229, 120], [220, 90], [212, 62], [208, 48]];
    for (let k = 0; k < tronco.length - 1; k++) {
      g.lineWidth = lerp(7, 3.4, k / (tronco.length - 1)); g.beginPath(); g.moveTo(tronco[k][0], tronco[k][1]); g.lineTo(tronco[k + 1][0], tronco[k + 1][1]); g.stroke();
    }
    g.strokeStyle = "rgba(255,170,110,0.35)"; g.lineWidth = 1;
    for (let k = 0; k < 9; k++) { const q = k / 9, x = lerp(235, 209, q), y = lerp(146, 52, q); g.beginPath(); g.moveTo(x - 2.5, y); g.lineTo(x + 2, y - 1); g.stroke(); }
    g.fillStyle = "#1b0f24";
    for (const [a, L, cv2] of [[-2.7, 34, 10], [-2.2, 30, 9], [-1.5, 22, 6], [-0.9, 30, -9], [-0.35, 34, -12], [0.35, 26, -12], [2.75, 24, 8]]) {
      const ex = 208 + Math.cos(a) * L, ey = 48 + Math.sin(a) * L + 6, mx = 208 + Math.cos(a) * L * 0.5, my = 48 + Math.sin(a) * L * 0.5 - cv2 * 0.4;
      const nx = -Math.sin(a), ny = Math.cos(a);
      g.beginPath(); g.moveTo(208, 48); g.quadraticCurveTo(mx + nx * 4, my + ny * 4, ex, ey); g.quadraticCurveTo(mx - nx * 1.5, my - ny * 1.5, 208, 48); g.fill();
    }
    g.beginPath(); g.arc(206, 52, 2.2, 0, Math.PI * 2); g.arc(210.5, 53, 2, 0, Math.PI * 2); g.fill();
    return cv;
  }

  // pestañas: +1 sale, −1 entra (fijas para cada borde)
  const tabH = (c, f) => (hash(c * 7.3 + f * 13.1 + 1.7) > 0.5 ? 1 : -1);   // borde de abajo de (c, f)
  const tabV = (c, f) => (hash(c * 5.7 + f * 11.9 + 3.3) > 0.5 ? 1 : -1);   // borde de la derecha de (c, f)
  const bordes = (c, f) => [f === 0 ? 0 : -tabH(c, f - 1), c === COLS - 1 ? 0 : tabV(c, f), f === FILAS - 1 ? 0 : tabH(c, f), c === 0 ? 0 : -tabV(c - 1, f)];
  function lado(g, P, d, n, s) {
    const L = (a, b) => ({ x: P.x + d.x * a * U + n.x * b * U * s, y: P.y + d.y * a * U + n.y * b * U * s });
    if (s) {
      let q = L(0.37, 0); g.lineTo(q.x, q.y);
      const bz = (a1, b1, a2, b2, a3, b3) => { const c1 = L(a1, b1), c2 = L(a2, b2), e = L(a3, b3); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, e.x, e.y); };
      bz(0.42, 0, 0.44, 0.04, 0.40, 0.10); bz(0.36, 0.18, 0.44, 0.25, 0.50, 0.25);
      bz(0.56, 0.25, 0.64, 0.18, 0.60, 0.10); bz(0.56, 0.04, 0.58, 0, 0.63, 0);
    }
    const e = L(1, 0); g.lineTo(e.x, e.y);
  }
  function rutaPieza(g, c, f, ox, oy) {
    const [st, sr, sb, sl] = bordes(c, f);
    g.beginPath(); g.moveTo(ox, oy);
    lado(g, { x: ox, y: oy }, { x: 1, y: 0 }, { x: 0, y: -1 }, st);
    lado(g, { x: ox + U, y: oy }, { x: 0, y: 1 }, { x: 1, y: 0 }, sr);
    lado(g, { x: ox + U, y: oy + U }, { x: -1, y: 0 }, { x: 0, y: 1 }, sb);
    lado(g, { x: ox, y: oy + U }, { x: 0, y: -1 }, { x: -1, y: 0 }, sl);
    g.closePath();
  }
  let CUADRO = null, SPR = null, SPR_B = null, SPR_X = null;
  function creaPiezas() {
    CUADRO = creaCuadro(); SPR = []; SPR_B = [];
    const una = (c, f, frente) => {
      const cv = document.createElement("canvas"); cv.width = cv.height = LADO; const g = cv.getContext("2d");
      g.scale(R2, R2); g.lineJoin = "round";
      if (!frente) { g.translate(U + 2 * MRG, 0); g.scale(-1, 1); }            // el reverso es la silueta reflejada
      const ruta = (dx = 0, dy = 0) => rutaPieza(g, c, f, MRG + dx, MRG + dy);
      ruta(); g.save(); g.clip();
      if (frente) g.drawImage(CUADRO, MRG - c * U, MRG - f * U, PW, PH);
      else {
        g.fillStyle = "#c9c0ad"; g.fillRect(0, 0, U + 2 * MRG, U + 2 * MRG);
        g.fillStyle = "rgba(120,104,84,0.35)"; for (let k = 0; k < 14; k++) { g.beginPath(); g.arc(MRG + hash(k + c * 9 + f * 31) * U, MRG + hash(k * 2.3 + c + f * 7) * U, 0.6, 0, Math.PI * 2); g.fill(); }
      }
      // relieve: luz arriba a la izquierda, sombra abajo a la derecha
      g.lineWidth = 1.5; g.strokeStyle = "rgba(255,255,255,0.45)"; ruta(0.9, 0.9); g.stroke();
      g.strokeStyle = "rgba(20,8,30,0.35)"; ruta(-0.9, -0.9); g.stroke();
      g.restore();
      ruta(); g.lineWidth = 0.85; g.strokeStyle = frente ? "rgba(26,12,30,0.8)" : "rgba(70,58,44,0.9)"; g.stroke();
      return cv;
    };
    for (let f = 0; f < FILAS; f++) for (let c = 0; c < COLS; c++) { SPR.push(una(c, f, true)); SPR_B.push(una(c, f, false)); }
    SPR_X = SPR[IZ];                               // la pieza que le sobra a Guillermo: ¡otra del sol!
  }
  // pieza: (x, y) centro en el mundo, rot en su plano, fx = cos del volteo (<0 → reverso), a 0 tumbada … 1 de cara
  function dibPieza(g, spr, sprB, x, y, rot, fx, a, k = 1, ky = 1) {
    const s = fx >= 0 ? spr : sprB, f = Math.max(0.05, Math.abs(fx));
    g.save(); g.translate(x, y); g.scale(SX * k, lerp(SY, SX * 0.96, a) * k * ky); g.rotate(rot); g.scale(f / R2, 1 / R2);
    g.drawImage(s, -MED, -MED); g.restore();
  }
  const pieza = (g, i, x, y, rot, fx, a, k, ky) => dibPieza(g, SPR[i], SPR_B[i], x, y, rot, fx, a, k, ky);

  /* ---------- las piezas que se mueven a mano: claves [t, {x, y, rot, a}] ---------- */
  function claves(lista, t) {
    if (t <= lista[0][0]) return Object.assign({}, lista[0][1]);
    for (let i = 1; i < lista.length; i++) {
      const [t1, b, f] = lista[i], [t0, a] = lista[i - 1];
      if (t <= t1) { const k = (f || suave)(fase(t, t0, t1)); return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), rot: lerp(a.rot, b.rot, k), a: lerp(a.a, b.a, k) }; }
    }
    return Object.assign({}, lista[lista.length - 1][1]);
  }
  const K_ = (x, y, rot, a) => ({ x, y, rot, a });
  const CL_A = [[0, K_(PILA.A.x, PILA.A.y, PILA.A.rot, 0)], [T.mA2, K_(PILA.A.x, PILA.A.y, PILA.A.rot, 0)],
    [T.mA2 + 0.2, K_(597, 330, -0.18, 0.6)], [T.mA3, K_(583, 305, -0.02, 0.3)], [T.snapA - 0.05, K_(PA.x, PA.y - 2.5, 0, 0)], [T.snapA, K_(PA.x, PA.y, 0, 0)]];
  const CL_B = [[0, K_(PILA.B.x, PILA.B.y, PILA.B.rot, 0)], [T.mB2, K_(PILA.B.x, PILA.B.y, PILA.B.rot, 0)],
    [T.mB2 + 0.18, K_(613, 334, 0.12, 0.55)], [T.mB3, K_(609.5, 338, 0.02, 0.22)], [T.snapB - 0.05, K_(PB.x, PB.y - 2.5, 0, 0)], [T.snapB, K_(PB.x, PB.y, 0, 0)]];
  const MIRA_Z = K_(586, 282, -0.05, 1), PROTEGE_Z = K_(596, 274, 0.1, 1);
  const CL_Z = [[0, K_(PILA.Z.x, PILA.Z.y, PILA.Z.rot, 0)], [T.mZ2, K_(PILA.Z.x, PILA.Z.y, PILA.Z.rot, 0)],
    [T.mZ2 + 0.22, K_(595, 322, 0.25, 0.65)], [T.mZ3, MIRA_Z, salida], [T.mAlarma, MIRA_Z], [T.mAlarma + 0.2, PROTEGE_Z],
    [T.mPieza, PROTEGE_Z], [T.mPieza + 0.22, K_(586, 284, -0.04, 1)], [T.mLleva0, K_(586, 284, -0.04, 1)],
    [T.mLleva, K_(PZ.x + 2, PZ.y - 13, 0.03, 0.25)], [T.snapZ - 0.05, K_(PZ.x, PZ.y - 2.5, 0, 0)], [T.snapZ, K_(PZ.x, PZ.y, 0, 0)]];
  const MIRA_C = K_(436, 262, ROT_C, 1);
  const CL_C = [[0, MIRA_C], [T.gBaja0, MIRA_C], [T.gBaja0 + 0.22, K_(442, 300, ROT_C, 0.45)], [T.gBaja, K_(CX.x, CX.y, ROT_CX, 0)]];
  function piezaA(t) { return claves(CL_A, t); }
  function piezaB(t) { return claves(CL_B, t); }
  function piezaZ(t) {
    const p = claves(CL_Z, t);
    // la mira dándole vueltecitas
    const mira = dentro(t, T.mZ3 - 0.1, T.mZ3 + 0.1, T.mAlarma - 0.1, T.mAlarma);
    p.rot += 0.13 * Math.sin((t - T.mZ3) * 2.6) * mira;
    const tiembla = dentro(t, T.pum, T.pum + 0.05, T.pum + 0.3, T.pum + 0.5);
    p.y += 1.5 * Math.sin(t * 40) * tiembla;
    return p;
  }
  function piezaC(t) {
    const p = claves(CL_C, t);
    // Guillermo la gira a un lado y a otro, sin acertar nunca
    const mira = dentro(t, 0.4, 0.8, T.gBaja0 - 0.2, T.gBaja0);
    p.rot += 0.24 * Math.sin((t - 0.4) * 2.1) * mira; p.y += 2 * Math.sin((t - 0.4) * 3.4) * mira;
    return p;
  }

  /* ---------- presiones sobre la pieza que no entra ---------- */
  function presion(t) {
    const p1 = campana(t, T.ap1 - 0.08, T.ap1 + 0.12), p2 = 1.2 * campana(t, T.ap2 - 0.08, T.ap2 + 0.14);
    const puno = dentro(t, T.gPuno0, T.gPuno0 + 0.12, T.gPuno1, T.gPuno1 + 0.06) * (0.9 + 0.1 * Math.sin(t * 41));
    return Math.max(p1, p2, puno);
  }
  // rebote de la pieza al soltar cada presión (¡boing!)
  function boing(t) {
    let o = 0;
    for (const t0 of [T.ap1 + 0.12, T.ap2 + 0.14, T.gPuno1 + 0.06, T.gBaja]) { const d = t - t0; if (d > 0 && d < 0.6) o += Math.sin(d * 26) * Math.exp(-d * 8) * (t0 === T.gBaja ? 0.6 : 1); }
    return o;
  }

  function piezaTorcida(t) {
    const pr = presion(t), bo = boing(t), apoya = tramo(t, T.gBaja, T.gBaja + 0.12);
    return { x: CX.x - 3 * pr + 0.6 * Math.sin(t * 47) * pr, y: CX.y + 2 * pr - 1.6 * bo,
      rot: ROT_CX + 0.05 * bo + 0.03 * Math.sin(t * 39) * pr, a: 0.12 * apoya, k: 1 + 0.04 * apoya, ky: 1 - 0.14 * pr + 0.06 * bo };
  }

  /* ---------- el vuelo de las piezas ---------- */
  const ATERRIZA = (() => {
    const lista = [];
    for (let i = 0; i < N; i++) if (i !== IZ) { const c = i % COLS, f = (i / COLS) | 0; lista.push([i, c + f * 0.6 + hash(i * 3.1 + 7) * 1.7]); }
    lista.sort((a, b) => a[1] - b[1]);
    const o = {}; lista.forEach(([i], k) => o[i] = T.cae0 + (T.cae1 - T.cae0) * k / (lista.length - 1));
    return o;
  })();
  const VUELO = (() => {
    const o = [];
    for (let i = 0; i < N; i++) {
      if (i === IZ) { o.push(null); continue; }
      const golpe = piezaTorcida(T.pum), R = i === IC ? golpe : centro(i);
      const h1 = hash(i * 1.37 + 0.5), h2 = hash(i * 2.11 + 1.3), h3 = hash(i * 3.7 + 2.9), h4 = hash(i * 5.3 + 4.1);
      const d = Math.hypot(R.x - golpe.x, (R.y - golpe.y) * 1.8);
      const t0 = T.pum + d / 1500;
      const A = { x: 512 + (R.x - 512) * 0.9 + (h1 - 0.5) * 70, y: 112 + 66 * h2 };
      const ta = 0.5 + 0.14 * h3;
      const tl = ATERRIZA[i], dc = 0.4 + 0.12 * h4;
      const w = (h1 < 0.5 ? -1 : 1) * (1.6 + 4.5 * h3);              // giro en el plano
      const wf = (h2 < 0.5 ? -1 : 1) * (hash(i * 7.7 + 5.5) < 0.55 ? 0.5 + 0.7 * h4 : 2.6 + 3 * h4);   // volteo: unas solo cabecean, otras enseñan el reverso
      o.push({ R, Rf: centro(i), t0, A, ta, tl, dc, tf: tl - dc, w, wf, rot0: i === IC ? R.rot : 0, h1, h2 });
    }
    return o;
  })();
  // reloj del vuelo: al flotar todo va más despacio
  const relojV = (v, t) => { const d = t - v.t0; return d < v.ta ? d : v.ta + 0.45 * (d - v.ta); };
  function enVuelo(v, t) {
    // subida → flota → cae a su sitio
    const posArriba = tt => {
      const d = tt - v.t0;
      if (d < v.ta) { const k = d / v.ta, f = lerp(2 * k - k * k, suave(k), 0.35); return { x: lerp(v.R.x, v.A.x, salida(k) * 0.6 + k * 0.4), y: v.R.y + (v.A.y - v.R.y) * f }; }
      const tau = d - v.ta;
      return { x: v.A.x + 9 * (Math.sin(tau * 2.1 + v.h1 * 6) - Math.sin(v.h1 * 6)), y: v.A.y + 15 * tau * tau / (1 + tau) + 5 * (Math.sin(tau * 1.7 + v.h2 * 5) - Math.sin(v.h2 * 5)) };
    };
    if (t < v.tf) {
      const q = posArriba(t), r = relojV(v, t);
      return { x: q.x, y: q.y, rot: v.rot0 + v.w * r, flip: v.wf * r, a: lerp(v.R.a || 0, 1, tramo(t, v.t0, v.t0 + 0.14)), k: lerp(v.R.k || 1, 1, tramo(t, v.t0, v.t0 + 0.14)), ky: lerp(v.R.ky || 1, 1, tramo(t, v.t0, v.t0 + 0.14)) };
    }
    const F = posArriba(v.tf), r = relojV(v, v.tf);
    const rotF = v.rot0 + v.w * r, flipF = v.wf * r;
    const rotD = Math.round(rotF / (Math.PI * 2)) * Math.PI * 2, flipD = Math.round(flipF / (Math.PI * 2)) * Math.PI * 2;
    const k = clamp((t - v.tf) / v.dc), ks = suave(k);
    return { x: lerp(F.x, v.Rf.x, salida(k)), y: lerp(F.y, v.Rf.y, k * k), rot: lerp(rotF, rotD, ks), flip: lerp(flipF, flipD, ks), a: 1 - tramo(t, v.tl - 0.16, v.tl), k: 1, ky: 1 };
  }

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  function pista(lista, t, ctx) {
    let c = Object.assign({}, evalua(lista[0][2], t, ctx));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t, ctx), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol || 0, k) };
    }
    return c;
  }
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + off;
  function manoRig(rig, p, m, lado, bolsillo, dobla, objeto) {
    const h = rig.aHoja(p, m), hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const k = clamp(m.bol || 0);
    const bs = rig.tronco(p)(bolsillo);
    const mu0 = muHacia(h, hom, (m.mo || 0)), x = lerp(h.x, bs.x, k), y = lerp(h.y, bs.y, k);
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }
  // hombro en el mundo
  const hombroMundo = (rig, p, lado) => rig.aPantalla(p, rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO));
  // centro de la mano para que los dedos cojan lo que está en P (la mano queda entre P y el hombro)
  function hacia(rig, p, P, r, lado = "lejos") {
    const h = hombroMundo(rig, p, lado), dx = h.x - P.x, dy = h.y - P.y, d = Math.hypot(dx, dy) || 1;
    return { x: P.x + dx / d * r, y: P.y + dy / d * r };
  }
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, -1.75);

  /* =====================================================================================
   * MARTA (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_M = {
    inicio: E({ mx: 0.5, my: 0.85, c: 0.35, sd: 6, gd: 0.02, si: 6, gi: 0.02, sonr: 0.45, ancho: 0.85 }),
    coloca: E({ mx: 0.45, my: 0.9, c: 0.45, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.35, ancho: 0.75, abre: 2 }),
    clic: E({ mx: 0.5, my: 0.8, c: 0.55, h: 0.5, sd: 12, gd: 0.04, si: 12, gi: 0.04, sonr: 0.8, ancho: 0.95 }),
    miraG: E({ mx: 0.9, my: 0.35, c: 0.25, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.45 }),
    ceja: E({ mx: 0.85, my: 0.6, c: 0.3, sd: 28, gd: 0.12, si: 2, gi: -0.04, sonr: 0.25, ancho: 0.7 }),
    preocupa: E({ mx: 0.8, my: 0.55, c: 0.15, sd: 22, gd: 0.2, si: 22, gi: 0.2, abre: 4, ancho: 0.6, sonr: -0.1 }),
    alarma: E({ mx: 0.75, my: 0.45, iris: 0.85, c: 0, sd: 28, gd: 0.22, si: 28, gi: 0.22, abre: 16, ancho: 0.6, sonr: -0.15 }),
    sobresalto: E({ mx: 0.7, my: 0.4, iris: 0.8, c: 0, z: 0, sd: 30, gd: 0.24, si: 30, gi: 0.24, abre: 20, ancho: 0.62, sonr: -0.2 }),
    arriba: E({ mx: 0.4, my: -0.85, iris: 0.9, c: 0, sd: 26, gd: 0.16, si: 26, gi: 0.16, abre: 12, ancho: 0.45, sonr: 0.1 }),
    mira: E({ mx: 0.5, my: 0.85, c: 0, sd: 24, gd: 0.14, si: 24, gi: 0.14, abre: 6, ancho: 0.5 }),
    miraG2: E({ mx: 0.9, my: 0.3, c: 0.15, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 4, ancho: 0.55, sonr: 0.2 }),
    sabe: E({ mx: 0.4, my: 0.55, c: 0.45, h: 0.4, sd: 16, gd: 0.06, si: 10, gi: 0.02, sonr: 0.75, ancho: 0.9 }),
    coloca2: E({ mx: 0.45, my: 0.9, c: 0.45, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.55, ancho: 0.8 }),
    feliz: E({ mx: 0.5, my: 0.75, c: 0.75, h: 0.85, sd: 14, gd: 0.06, si: 14, gi: 0.06, sonr: 0.9, ancho: 1.0 }),
    miraG3: E({ mx: 0.9, my: 0.35, c: 0.3, h: 0.2, sd: 12, gd: 0.04, si: 12, gi: 0.04, sonr: 0.6 }),
    ceja2: E({ mx: 0.9, my: 0.4, c: 0.25, sd: 30, gd: 0.14, si: 2, gi: -0.06, sonr: 0.3, ancho: 0.7 }),
    risa: E({ mx: 0.5, my: 0, c: 1, h: 1, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 14, ancho: 0.95, sonr: 0.9 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.35, h: 0.3, sd: 10, gd: 0.04, si: 14, gi: 0.06, sonr: 0.8, ancho: 0.95 })
  };
  const GUION_CARA_M = [
    [T.mA0, T.mA0 + 0.2, "coloca"], [T.snapA - 0.02, T.snapA + 0.1, "clic"], [T.mB0, T.mB0 + 0.2, "coloca"], [T.snapB - 0.02, T.snapB + 0.1, "clic"],
    [T.mZ0, T.mZ0 + 0.2, "coloca"], [T.mZ3 - 0.1, T.mZ3 + 0.15, "miraG"], [T.mCeja, T.mCeja + 0.2, "ceja"], [T.mNo, T.mNo + 0.2, "preocupa"],
    [T.mAlarma, T.mAlarma + 0.12, "alarma"], [T.pum - 0.02, T.pum + 0.05, "sobresalto"], [T.mArriba, T.mArriba + 0.3, "arriba"],
    [T.cae0 + 0.3, T.cae1, "mira"], [T.mMiraG, T.mMiraG + 0.2, "miraG2"], [T.mPieza, T.mPieza + 0.25, "sabe"], [T.mLleva0 + 0.1, T.mLleva0 + 0.3, "coloca2"],
    [T.snapZ, T.snapZ + 0.15, "feliz"], [T.gToca, T.gToca + 0.25, "miraG3"], [T.mCeja2, T.mCeja2 + 0.2, "ceja2"], [T.mRie0, T.mRie0 + 0.15, "risa"],
    [T.mCamara, T.mCamara + 0.25, "camara"]
  ];
  const CUERPOS_M = {
    inicio: { torso: 0.1, cab: 0.16 }, coge: { torso: 0.2, cab: 0.22 }, coloca: { torso: 0.15, cab: 0.24 }, erguida: { torso: 0.04, cab: 0.08 },
    miraG: { torso: 0.04, cab: 0.04 }, alarma: { torso: -0.08, cab: -0.1 }, arriba: { torso: -0.05, cab: -0.24 }, mira: { torso: 0.1, cab: 0.18 },
    sabe: { torso: 0.04, cab: 0.1 }, sigue: { torso: 0.0, cab: 0.0 }, coloca2: { torso: 0.2, cab: 0.2 }, feliz: { torso: 0.02, cab: -0.02 }, risa: { torso: 0.05, cab: -0.06 },
    camara: { torso: 0.0, cab: 0.04 }
  };
  const GUION_CUERPO_M = [
    [T.mA0, T.mA1, "coge"], [T.mA2 + 0.1, T.mA3, "coloca"], [T.snapA + 0.05, T.snapA + 0.3, "erguida"],
    [T.mB0, T.mB1, "coge"], [T.mB2 + 0.1, T.mB3, "coloca"], [T.snapB + 0.05, T.snapB + 0.3, "erguida"],
    [T.mZ0, T.mZ1, "coge"], [T.mZ2 + 0.1, T.mZ3, "miraG"], [T.mAlarma - 0.04, T.mAlarma + 0.18, "alarma"], [T.mArriba, T.mArriba + 0.35, "arriba"],
    [T.cae0 + 0.3, T.cae1 - 0.2, "sigue"], [T.mira - 0.05, T.mira + 0.25, "mira"], [T.mPieza, T.mPieza + 0.3, "sabe"], [T.mLleva0, T.mLleva, "coloca2"], [T.snapZ + 0.08, T.snapZ + 0.4, "feliz"],
    [T.mRie0, T.mRie0 + 0.2, "risa"], [T.mCamara, T.mCamara + 0.3, "camara"]
  ];
  const cuerpoM = t => guion(GUION_CUERPO_M, CUERPOS_M, "inicio", t);

  function poseM(t) {
    const b = cuerpoM(t), b0 = cuerpoM(t - 0.1);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = {
      x: XM, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // «no, no»: niega despacio con la cabeza
    const no = dentro(t, T.mNo, T.mNo + 0.1, T.mAlarma - 0.15, T.mAlarma);
    p.cabeza.ang += 0.045 * Math.sin((t - T.mNo) * 11) * no;
    // risa: hombros que botan
    const rie = dentro(t, T.mRie0, T.mRie0 + 0.1, T.mRie1 - 0.15, T.mRie1);
    p.torsoEsc.y += 0.012 * Math.abs(Math.sin((t - T.mRie0) * 15)) * rie;
    p.cabeza.ang += 0.03 * Math.sin((t - T.mRie0) * 15) * rie;
    p.cabeza.ang += -0.05 * campana(t, T.guino - 0.1, T.guino + 0.5);
    // ¡pum!: respingo
    const brinco = campana(t, T.pum, T.pum + 0.3);
    const vel = (b.torso - b0.torso) * 6 + (b.cab - b0.cab) * 4;
    p.pelo = { viento: 0, inercia: clamp(-vel * 1.2 + 0.9 * b.torso - 0.7 * campana(t, T.pum + 0.04, T.pum + 0.5) + 0.25 * Math.sin((t - T.mRie0) * 15) * rie, -1, 1) };
    p.pelvis = M.aHoja(p, { x: XM, y: PY_PIE(M) + respira * 0.7 - 6 * brinco + 1.5 * Math.abs(Math.sin((t - T.mRie0) * 15)) * rie });
    const TOB = M.SUELO - M.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: M.CADERA.cerca.x - 6, y: TOB - 4 * brinco / (S * M.K) }, ang: 0 };
    p.piernas.lejos = { tob: { x: M.CADERA.lejos.x + 22, y: TOB - 2 * brinco / (S * M.K) }, ang: 0 };
    const ex = guion(GUION_CARA_M, CARAS_M, "inicio", t);
    ex.wd = campana(t, T.guino, T.guino + 0.35);
    // sigue con la mirada a Guillermo cuando carga el puño
    p.cara = cara(ex, parpadeo(t, [0.4, 2.35, 4.7, 7.6, 9.5, 11.6, 13.0]));
    manosM(p, t);
    return p;
  }

  function manosM(p, t) {
    const bolsillo = { x: 640, y: 360, d: RELAJADA, bol: 1 };
    const rr = a => lerp(11, 16, a);
    const lleva = f => () => { const q = f(t); return Object.assign(hacia(M, p, q, rr(q.a)), { d: PINZA }); };
    const sobre = (P, dy) => () => { const h = hacia(M, p, P, 12); return { x: h.x + 2, y: h.y + dy, d: ABRE }; };
    const boca = () => { const b = M.aPantalla(p, M.boca(p)); return { x: b.x + 1, y: b.y + 3, d: ABRE, mo: 0.2 }; };
    const PL = [
      [0, 0, bolsillo],
      [T.mA0, T.mA1, sobre(PILA.A, -12)], [T.mA1, T.mA2, lleva(piezaA)], [T.mA2, T.snapA, lleva(piezaA), s => 1],
      [T.snapA, T.snapA + 0.18, sobre(PA, -12)],
      [T.mB0, T.mB1, sobre(PILA.B, -12)], [T.mB1, T.mB2, lleva(piezaB)], [T.mB2, T.snapB, lleva(piezaB), s => 1],
      [T.snapB, T.snapB + 0.18, sobre(PB, -12)],
      [T.mZ0, T.mZ1, sobre(PILA.Z, -12)], [T.mZ1, T.mZ2, lleva(piezaZ)], [T.mZ2, T.snapZ, lleva(piezaZ), s => 1],
      [T.snapZ, T.snapZ + 0.18, sobre(PZ, -14)],
      [T.snapZ + 0.32, T.snapZ + 0.7, bolsillo],
      [T.mRie0 - 0.06, T.mRie0 + 0.16, boca], [T.mRie0 + 0.16, T.mRie1, boca, s => 1],
      [T.mCamara - 0.05, T.mCamara + 0.35, bolsillo]
    ];
    const l = pista(PL, t);
    let objeto = null;
    const enMano = (ti, tf, f) => t >= ti && t < tf ? f(t) : null;
    const q = enMano(T.mA2, T.snapA, piezaA) || enMano(T.mB2, T.snapB, piezaB) || enMano(T.mZ2, T.snapZ, piezaZ);
    if (q) { const i = t < T.snapA ? IA : t < T.snapB ? IB : IZ; objeto = g => conCamara(g, () => pieza(g, i, q.x, q.y, q.rot, 1, q.a)); }
    p.manoLejos = manoRig(M, p, l, "lejos", M.BOLSILLO_L, -1, objeto);
    p.manoCerca = M.manoReposo(p, "cerca");
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.6, my: 0.35, c: 0.3, sd: 6, gd: -0.04, si: 10, gi: 0.02, sonr: 0.2, ancho: 0.8 }),
    gira: E({ mx: 0.55, my: 0.3, c: 0.25, sd: -2, gd: -0.1, si: 8, gi: 0.04, sonr: 0.05, ancho: 0.7, abre: 2 }),
    ooh: E({ mx: 0.85, my: 0.45, iris: 1.1, c: 0, sd: 24, gd: 0.12, si: 24, gi: 0.12, abre: 14, ancho: 0.45, sonr: 0.1 }),
    asiente: E({ mx: 0.6, my: 0.5, c: 0.3, sd: -4, gd: -0.12, si: 0, gi: -0.06, sonr: 0.55, ancho: 1.0 }),
    concentra: E({ mx: 0.5, my: 0.85, c: 0.35, sd: -6, gd: -0.14, si: -2, gi: -0.1, abre: 6, ancho: 0.7, sonr: 0.1 }),
    aprieta: E({ mx: 0.45, my: 0.9, c: 0.6, z: 0.6, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 8, ancho: 1.0, sonr: -0.3 }),
    furia: E({ mx: 0.45, my: 0.8, c: 0.3, sd: -12, gd: -0.24, si: -12, gi: -0.24, abre: 12, ancho: 1.05, sonr: -0.4 }),
    pum: E({ mx: 0, my: 0, c: 1, z: 1, sd: -8, gd: -0.2, si: -8, gi: -0.2, abre: 22, ancho: 1.0, sonr: -0.2 }),
    arriba: E({ mx: 0.3, my: -0.85, iris: 0.85, c: 0, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 18, ancho: 0.5, sonr: 0 }),
    mira: E({ mx: 0.6, my: 0.85, c: 0, iris: 0.9, sd: 26, gd: 0.16, si: 26, gi: 0.16, abre: 12, ancho: 0.5 }),
    camara: E({ mx: -0.85, my: 0, c: 0.1, sd: 22, gd: 0.14, si: 26, gi: 0.2, abre: 8, ancho: 0.55, sonr: 0 }),
    asombro: E({ mx: 0.85, my: 0.6, c: 0, sd: 24, gd: 0.12, si: 24, gi: 0.12, abre: 12, ancho: 0.5 }),
    orgullo: E({ mx: 0.3, my: -0.2, c: 0.88, h: 0.7, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.9, ancho: 1.05 }),
    nota: E({ mx: 0.35, my: 0.95, c: 0.1, sd: 20, gd: 0.22, si: 6, gi: 0, sonr: 0.05, ancho: 0.7, abre: 4 }),
    pieza: E({ mx: 0.55, my: 0.25, c: 0.1, iris: 1.05, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 6, ancho: 0.6 }),
    puzle: E({ mx: 0.8, my: 0.75, c: 0.15, sd: 20, gd: 0.14, si: 20, gi: 0.14, abre: 6, ancho: 0.6 }),
    encoge: E({ mx: -0.85, my: 0, c: 0.4, sd: 26, gd: 0.22, si: 26, gi: 0.22, abre: 7, ancho: 0.72, sonr: 0.12 })
  };
  const GUION_CARA_G = [
    [0.9, 1.1, "gira"], [T.gOoh - 0.05, T.gOoh + 0.15, "ooh"], [T.gOoh + 0.6, T.gOoh + 0.8, "gira"], [T.snapB, T.snapB + 0.12, "ooh"],
    [T.gAsiente, T.gAsiente + 0.15, "asiente"], [T.gBaja + 0.05, T.gBaja + 0.15, "gira"], [T.gDedo0 - 0.1, T.gDedo0 + 0.05, "concentra"], [T.gPuno0, T.gPuno0 + 0.12, "aprieta"],
    [T.gCarga0, T.gCarga0 + 0.12, "furia"], [T.pum - 0.06, T.pum, "pum"], [T.gArriba, T.gArriba + 0.25, "arriba"],
    [T.cae0 + 0.3, T.cae1, "mira"], [T.gCamara, T.gCamara + 0.15, "camara"], [T.mLleva0 + 0.1, T.mLleva0 + 0.3, "asombro"],
    [T.gOrgullo, T.gOrgullo + 0.2, "orgullo"], [T.gToca, T.gToca + 0.12, "nota"], [T.gMiraPieza, T.gMiraPieza + 0.12, "pieza"],
    [T.gMiraPuzle, T.gMiraPuzle + 0.12, "puzle"], [T.gMiraCam, T.gMiraCam + 0.15, "camara"], [T.encoge0, T.encoge, "encoge"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.05, cab: 0.12 }, ooh: { torso: 0.02, cab: 0.04 }, asiente: { torso: 0.04, cab: 0.1 },
    baja: { torso: 0.12, cab: 0.2 }, aprieta: { torso: 0.17, cab: 0.22 }, carga: { torso: -0.1, cab: -0.04 },
    pum: { torso: 0.22, cab: 0.26 }, arriba: { torso: -0.04, cab: -0.26 }, mira: { torso: 0.08, cab: 0.16 },
    camara: { torso: 0.02, cab: -0.02 }, asombro: { torso: 0.04, cab: 0.1 }, orgullo: { torso: -0.07, cab: -0.14 },
    nota: { torso: 0.06, cab: 0.2 }, pieza: { torso: 0.0, cab: 0.06 }, puzle: { torso: 0.04, cab: 0.12 }, encoge: { torso: -0.02, cab: -0.07 }
  };
  const GUION_CUERPO_G = [
    [T.gOoh - 0.05, T.gOoh + 0.2, "ooh"], [T.gOoh + 0.6, T.gOoh + 0.9, "inicio"], [T.gAsiente, T.gAsiente + 0.2, "asiente"],
    [T.gBaja0, T.gBaja, "baja"], [T.gPuno0, T.gPuno0 + 0.15, "aprieta"], [T.gCarga0, T.gCarga, "carga", salida], [T.gCarga, T.pum, "pum", entrada],
    [T.gArriba - 0.1, T.gArriba + 0.35, "arriba"], [T.cae0 + 0.3, T.cae1 + 0.1, "mira"], [T.gCamara, T.gCamara + 0.2, "camara"],
    [T.mLleva0 + 0.1, T.mLleva0 + 0.35, "asombro"], [T.gOrgullo, T.gOrgullo + 0.3, "orgullo"], [T.gToca, T.gToca + 0.2, "nota"],
    [T.gMiraPieza, T.gMiraPieza + 0.2, "pieza"], [T.gMiraPuzle, T.gMiraPuzle + 0.15, "puzle"], [T.gMiraCam, T.gMiraCam + 0.2, "camara"],
    [T.encoge0, T.encoge, "encoge"]
  ];
  // la lengua asoma por la comisura (coordenadas del retrato de Guillermo)
  function lengua(g, k, b) {
    if (k <= 0.01) return;
    const hw = 44 * (b.ancho ?? 1), s = b.sonrisa ?? 0, ca = Math.cos(0.26), sa = Math.sin(0.26);
    const yR = -10 * s, cx = 803 + hw * ca - yR * sa, cy = 730 + hw * sa + yR * ca;
    g.save(); g.translate(cx - 6, cy + 2); g.rotate(0.95);
    const L = 48 * k;
    g.beginPath(); g.moveTo(-15, -4); g.quadraticCurveTo(-19, L * 0.75, 0, L); g.quadraticCurveTo(19, L * 0.75, 15, -4); g.closePath();
    g.fillStyle = "#e0675c"; g.fill(); g.strokeStyle = "#140c10"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(130,24,30,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, L * 0.6); g.stroke();
    g.restore();
    g.save(); g.translate(803, 730); g.rotate(0.26); g.strokeStyle = "#140c10"; g.lineWidth = 6.5; g.lineCap = "round";
    g.beginPath(); g.moveTo(hw - 26, 12 * s + 2 - 2); g.quadraticCurveTo(hw - 10, 4 * s + 1, hw + 1, yR); g.stroke(); g.restore();
  }
  const lenguaK = t => tramo(t, T.gDedo0 - 0.05, T.gDedo0 + 0.2) * (1 - tramo(t, T.gPuno0 - 0.04, T.gPuno0 + 0.08));

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // asiente
    p.cabeza.ang += 0.07 * Math.sin((t - T.gAsiente) * 14) * campana(t, T.gAsiente, T.gAsiente + 0.45);
    // aprieta con el puño: tiembla
    const tiembla = dentro(t, T.gPuno0, T.gPuno0 + 0.1, T.gPuno1 - 0.05, T.gPuno1 + 0.05) + 0.6 * dentro(t, T.gCarga - 0.08, T.gCarga, T.gCarga + 0.02, T.gCarga + 0.1);
    p.torso += 0.01 * Math.sin(t * 43) * tiembla; p.cabeza.ang += 0.015 * Math.sin(t * 37 + 1) * tiembla;
    // ¡pum!: flexiona las rodillas
    const flexi = dentro(t, T.pum - 0.06, T.pum + 0.02, T.pum + 0.25, T.pum + 0.6);
    // orgullo: saca pecho; encoge los hombros con las palmas arriba (dos botecitos)
    const orgullo = dentro(t, T.gOrgullo, T.gOrgullo + 0.3, T.gToca - 0.05, T.gToca + 0.2);
    const encoge = dentro(t, T.encoge0, T.encoge, DUR, DUR + 1);
    const bote = encoge * 0.5 * (1 - Math.cos(Math.min(1, Math.max(0, (t - T.encoge) / 0.9)) * Math.PI * 4)) * (1 - tramo(t, T.encoge + 0.9, T.encoge + 1.1));
    p.torsoEsc.y += 0.02 * orgullo + 0.022 * encoge + 0.012 * bote;
    p.torsoEsc.x += 0.015 * orgullo;
    p.pelvis = G.aHoja(p, { x: XG + 3 * flexi, y: PY_PIE(G) + respira * 0.9 + 9 * flexi - 2 * orgullo - 2 * bote });
    const TOB = G.SUELO - G.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: G.CADERA.cerca.x - 6, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.CADERA.lejos.x + 16, y: TOB }, ang: 0 };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // va siguiendo la lluvia de piezas con la cabeza
    p.cara = cara(ex, parpadeo(t, [0.55, 2.2, 4.62, 6.6, 8.95, 9.35, 11.0, 13.1]));
    p.rojo = 0.55 * dentro(t, T.gPuno0, T.gPuno0 + 0.2, T.pum, T.pum + 0.3) + 0.2 * dentro(t, T.gOrgullo, T.gOrgullo + 0.2, T.gToca, T.gToca + 0.3);
    p.enfado = dentro(t, T.gPuno0 + 0.2, T.gPuno0 + 0.35, T.pum + 0.05, T.pum + 0.3);
    p.sudor = 0.5 * dentro(t, T.ap2, T.ap2 + 0.2, T.pum, T.pum + 0.2) + 0.45 * dentro(t, T.gMiraCam, T.gMiraCam + 0.2, DUR, DUR + 1);
    const lk = lenguaK(t);
    if (lk > 0.01) p.capaCabeza = g => lengua(g, lk, p.cara.boca);
    manosG(p, t);
    return p;
  }

  // la pieza que le sobra: sale del bolsillo en la mano
  function sobrante(p, t) {
    if (t < T.gSaca) return null;
    const l = G.aPantalla(p, p.manoLejos), h = hombroMundo(G, p, "lejos");
    const dx = l.x - h.x, dy = l.y - h.y, d = Math.hypot(dx, dy) || 1;
    const k = tramo(t, T.encoge0 + 0.05, T.encoge);
    return { x: l.x + lerp(dx / d * 15, 7, k), y: l.y + lerp(dy / d * 15, -8, k),
      rot: lerp(0.15 + 0.1 * Math.sin(t * 2.2), -0.08, k), a: lerp(1, 0.75, k),
      visible: tramo(t, T.gSaca, T.gSaca + 0.21) };
  }
  function offsetIndice(mu) {
    const a = mu + Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);
    return { x: G.JK * (8.4 * c - 18.9 * sn), y: G.JK * (8.4 * sn + 18.9 * c) };
  }
  function dedoSobre(p, punto) {
    const h = G.tronco(p)(G.HOMBRO), q = G.aHoja(p, punto), mu = Math.atan2(h.y - q.y, h.x - q.x);
    const off = offsetIndice(mu), palma = { x: q.x - off.x, y: q.y - off.y };
    const giro = mu - Math.atan2(h.y - palma.y, h.x - palma.x);
    return { ...G.aPantalla(p, palma), mo: Math.atan2(Math.sin(giro), Math.cos(giro)), d: SENALA };
  }
  function manosG(p, t) {
    const pr = presion(t);
    const sostiene = () => { const q = piezaC(t); return Object.assign(hacia(G, p, q, lerp(12.6, 17.6, q.a)), { d: PINZA }); };
    const enC = piezaTorcida(t);
    const sueltaAlto = () => { const h = hacia(G, p, enC, 16); return { x: h.x - 2, y: h.y - 10, d: ABRE }; };
    const dedo = () => dedoSobre(p, { x: enC.x, y: enC.y - 5 * (1 - Math.min(pr, 1)) });
    const puno = () => ({ ...hacia(G, p, enC, 6), d: PUNO, mo: 0 });
    const CARGA = { x: 442, y: 206, d: PUNO };
    const golpe = () => ({ ...hacia(G, p, piezaTorcida(T.pum), 6), d: PUNO, mo: 0 });
    const cadera = { x: 380, y: 360, d: PUNO, mo: 0.3 };
    const toca = () => ({ x: 384 + 1.5 * Math.sin(t * 30), y: 354 + 3 * Math.abs(Math.sin((t - T.gToca) * 22)), d: PALMA, mo: -0.2 });
    const PL = [
      [0, 0, sostiene],
      [0, T.gBaja, sostiene, s => 1],
      [T.gBaja, T.gBaja + 0.1, sueltaAlto],
      [T.gBaja + 0.1, T.gDedo0 - 0.04, { x: 420, y: 292, d: RELAJADA }],
      [T.gDedo0, T.gDedo0 + 0.2, dedo], [T.gDedo0 + 0.2, T.gPuno0 - 0.08, dedo, s => 1],
      [T.gPuno0 - 0.08, T.gPuno0 + 0.06, puno], [T.gPuno0 + 0.06, T.gCarga0, puno, s => 1],
      [T.gCarga0, T.gCarga, CARGA, salida], [T.gCarga, T.pum, golpe, entrada], [T.pum, T.pum + 0.32, golpe, s => 1],
      [T.pum + 0.38, T.pum + 0.8, { x: 414, y: 296, d: RELAJADA }],
      [T.pum + 1.05, T.pum + 1.45, { x: 380, y: 352, d: RELAJADA, bol: 1 }],
      [T.gOrgullo, T.gOrgullo + 0.3, cadera],
      [T.gToca, T.gToca + 0.08, toca], [T.gToca + 0.08, T.gBusca, toca, s => 1],
      [T.gBusca, T.gBusca + 0.16, { x: 382, y: 352, d: RELAJADA, bol: 1 }],
      [T.gSaca, T.gSaca + 0.3, { x: 422, y: 262, d: PINZA, bol: 0 }],
      [T.gMiraPieza + 0.05, T.gMiraPuzle, { x: 424, y: 258, d: PINZA }],
      [T.encoge0, T.encoge, { x: 428, y: 286, d: PALMA, mo: -0.85 }, salida]
    ];
    const l = pista(PL, t);
    // rebusca dentro del bolsillo
    let objeto = null;
    if (t < T.gBaja) { const q = piezaC(t); objeto = g => conCamara(g, () => pieza(g, IC, q.x, q.y, q.rot, 1, q.a)); }
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, objeto);
    if (t > T.gBusca && t < T.gSaca) {
      const busca = campana(t, T.gBusca, T.gSaca);
      p.manoLejos.x += 4 * Math.sin(t * 34) * busca; p.manoLejos.y += 3 * Math.sin(t * 27) * busca;
    }
    const sp = sobrante(p, t);
    p.sobrante = sp;
    if (sp && sp.visible > 0) p.manoLejos.objeto = g => conCamara(g, () => {
      g.globalAlpha *= sp.visible;
      dibPieza(g, SPR_X, SPR_B[IZ], sp.x, sp.y, sp.rot, 1, sp.a, 0.5 + 0.5 * sp.visible);
    });
    // la otra mano, en el bolsillo hasta que se encoge de hombros
    const PC2 = [[0, 0, { x: 300, y: 350, d: RELAJADA, bol: 1 }], [T.encoge0 + 0.04, T.encoge + 0.04, { x: 282, y: 300, d: PALMA, mo: 0.85, bol: 0 }, salida]];
    const l2 = pista(PC2, t);
    p.manoCerca = manoRig(G, p, l2, "cerca", BOLS_GC, -1, null);
  }

  /* =====================================================================================
   * DECORADO: rincón de juegos al anochecer
   * ===================================================================================== */
  const ZOC = 372, PARED_FIN = 470;
  const MESA = { x0: 372, x1: 652, y0: 268, y1: 404, canto: 12 };
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // pared azul petróleo con papel de rombitos
    const gp = g.createLinearGradient(0, -50, 0, ZOC); gp.addColorStop(0, "#244a59"); gp.addColorStop(1, "#3a7086");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, ZOC + 50);
    for (let y = -40, f = 0; y < ZOC; y += 28, f++) for (let x = -60 + (f % 2) * 19; x < W + 60; x += 38) {
      g.fillStyle = "rgba(240,206,140,0.13)"; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 4.5, y); g.lineTo(x, y + 6); g.lineTo(x - 4.5, y); g.closePath(); g.fill();
      g.fillStyle = "rgba(240,206,140,0.08)"; g.beginPath(); g.arc(x + 19, y + 14, 1.4, 0, Math.PI * 2); g.fill();
    }
    // moldura del techo
    g.fillStyle = "#e7dac2"; g.fillRect(-60, -50, W + 120, 34); g.fillStyle = "rgba(20,30,40,0.35)"; g.fillRect(-60, -16, W + 120, 4);
    // zócalo crema con cuarterones
    g.fillStyle = "#e9dcc4"; g.fillRect(-60, ZOC, W + 120, PARED_FIN - ZOC);
    g.strokeStyle = "rgba(140,112,80,0.5)"; g.lineWidth = 1.6;
    for (let x = -40; x < W + 60; x += 92) { g.strokeRect(x, ZOC + 16, 74, PARED_FIN - ZOC - 32); }
    g.fillStyle = "rgba(255,255,255,0.4)"; for (let x = -40; x < W + 60; x += 92) g.fillRect(x + 2, ZOC + 18, 70, 2);
    g.fillStyle = "#8a5a36"; g.fillRect(-60, ZOC - 6, W + 120, 9); g.fillStyle = "rgba(255,220,180,0.5)"; g.fillRect(-60, ZOC - 6, W + 120, 2);
    g.fillStyle = "#6a4128"; g.fillRect(-60, PARED_FIN - 9, W + 120, 9);
    ventana(g);
    estanteria(g);
    reloj(g);
    // suelo de tarima
    const gs = g.createLinearGradient(0, PARED_FIN, 0, H + 50); gs.addColorStop(0, "#6c4630"); gs.addColorStop(1, "#946446");
    g.fillStyle = gs; g.fillRect(-60, PARED_FIN, W + 120, H + 50 - PARED_FIN);
    g.strokeStyle = "rgba(40,20,10,0.4)"; g.lineWidth = 1.3;
    for (let i = -16; i <= 18; i++) { g.beginPath(); g.moveTo(512 + i * 38, PARED_FIN); g.lineTo(512 + i * 96, H + 50); g.stroke(); }
    alfombra(g);
    // sombras de los dos en el suelo
    g.fillStyle = "rgba(20,10,30,0.28)";
    g.beginPath(); g.ellipse(XG + 4, SUELO + 2, 58, 8, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(XM - 2, SUELO + 2, 50, 7, 0, 0, Math.PI * 2); g.fill();
    mesa(g);
    // viñeta cálida
    const vg = g.createRadialGradient(512, 320, 260, 512, 320, 760); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,12,30,0.5)");
    g.fillStyle = vg; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  function ventana(g) {
    const x0 = 118, x1 = 262, y0 = 96, y1 = 312;
    // cielo de la hora azul
    const gc = g.createLinearGradient(0, y0, 0, y1); gc.addColorStop(0, "#111c45"); gc.addColorStop(0.55, "#2c3d7a"); gc.addColorStop(1, "#8c5f8f");
    g.fillStyle = gc; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (let k = 0; k < 14; k++) { const x = x0 + 6 + hash(k * 4.1) * (x1 - x0 - 12), y = y0 + 6 + hash(k * 7.3) * 90; g.beginPath(); g.arc(x, y, 0.6 + hash(k) * 0.9, 0, Math.PI * 2); g.fill(); }
    // luna creciente
    g.fillStyle = "#fff4cf"; g.beginPath(); g.arc(160, 140, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#18245a"; g.beginPath(); g.arc(166, 135, 13, 0, Math.PI * 2); g.fill();
    // tejados con ventanas encendidas
    g.fillStyle = "#1c1d38";
    g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, 250); g.lineTo(140, 236); g.lineTo(162, 250); g.lineTo(162, 228); g.lineTo(196, 214); g.lineTo(226, 228);
    g.lineTo(226, 244); g.lineTo(248, 236); g.lineTo(x1, 246); g.lineTo(x1, y1); g.closePath(); g.fill();
    g.fillStyle = "#ffcf6a";
    for (const [x, y] of [[128, 262], [142, 280], [172, 240], [184, 262], [204, 238], [212, 270], [236, 258], [248, 284], [130, 296]]) g.fillRect(x, y, 5, 6);
    // marco y cruceta
    g.strokeStyle = "#efe6d4"; g.lineWidth = 9; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    g.lineWidth = 5; g.beginPath(); g.moveTo((x0 + x1) / 2, y0); g.lineTo((x0 + x1) / 2, y1); g.moveTo(x0, 200); g.lineTo(x1, 200); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x0 - 4.5, y0 - 4.5, x1 - x0 + 9, y1 - y0 + 9);
    g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.moveTo(x0 + 8, y0 + 4); g.lineTo(x0 + 30, y0 + 4); g.lineTo(x0 + 4, y0 + 60); g.lineTo(x0 + 4, y0 + 16); g.closePath(); g.fill();
    // alféizar
    g.fillStyle = "#e9dcc4"; g.fillRect(x0 - 14, y1 + 4, x1 - x0 + 28, 10); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.strokeRect(x0 - 14, y1 + 4, x1 - x0 + 28, 10);
    // cortinas de terciopelo mostaza
    for (const [cx, sg] of [[106, -1], [274, 1]]) {
      const gr = g.createLinearGradient(cx - 22, 0, cx + 22, 0); gr.addColorStop(0, "#9a6a1c"); gr.addColorStop(0.5, "#d6a23c"); gr.addColorStop(1, "#9a6a1c");
      g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 20, 70); g.lineTo(cx + 20, 70); g.quadraticCurveTo(cx + 8 * sg + 4, 250, cx + 18 + 6 * sg, 466);
      g.lineTo(cx - 18 + 6 * sg, 466); g.quadraticCurveTo(cx - 8 * sg - 4, 250, cx - 20, 70); g.closePath(); g.fill();
      g.strokeStyle = "rgba(90,58,10,0.6)"; g.lineWidth = 1.4;
      for (const d of [-9, 0, 9]) { g.beginPath(); g.moveTo(cx + d, 74); g.quadraticCurveTo(cx + d * 0.6 + 4 * sg, 260, cx + d * 1.1 + 6 * sg, 462); g.stroke(); }
      g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx - 20, 70); g.quadraticCurveTo(cx - 8 * sg - 4, 250, cx - 18 + 6 * sg, 466); g.moveTo(cx + 20, 70); g.quadraticCurveTo(cx + 8 * sg + 4, 250, cx + 18 + 6 * sg, 466); g.stroke();
      // alzapaño
      g.fillStyle = "#7c2f2a"; g.beginPath(); g.ellipse(cx + 2 * sg, 300, 17, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // barra de la cortina
    g.fillStyle = "#b08a4a"; g.fillRect(74, 64, 238, 6); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.strokeRect(74, 64, 238, 6);
    g.beginPath(); g.arc(72, 67, 6, 0, Math.PI * 2); g.arc(314, 67, 6, 0, Math.PI * 2); g.fillStyle = "#c9a35a"; g.fill(); g.stroke();
  }
  function estanteria(g) {
    const x0 = 770, x1 = 944, y0 = 108, y1 = PARED_FIN;
    g.fillStyle = "rgba(10,20,30,0.3)"; g.fillRect(x0 + 6, y0 + 6, x1 - x0, y1 - y0);
    g.fillStyle = "#4b2f1e"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = "#2b1a10"; g.fillRect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16);
    const baldas = [196, 286, 376];
    // cajas de juegos (colores y dibujitos, sin letras)
    const cajas = [
      [y0 + 8, [[16, 60, "#c0392b", "circulo"], [12, 70, "#2e86ab", "dados"], [14, 52, "#e0b43c", "triangulo"], [18, 64, "#5a9e5a", "estrella"]]],
      [196, [[44, 20, "#e2763a", "puzle", true], [44, 18, "#7d4fa6", "puzle", true], [44, 22, "#2f8f83", "circulo", true], [16, 58, "#c94f6d", "rombo"], [14, 66, "#3b5ba5", "dados"]]],
      [286, [[20, 64, "#d9a93f", "estrella"], [16, 56, "#2b7a78", "rombo"], [50, 18, "#b6413c", "dados", true], [50, 20, "#3e6aa8", "triangulo", true]]],
      [376, [[18, 70, "#7a9e3a", "circulo"], [14, 60, "#c0392b", "estrella"], [22, 72, "#5b4ea3", "puzle"], [12, 54, "#e08a3a", "rombo"]]]
    ];
    for (const [yb, lista] of cajas) {
      let x = x0 + 14; const base = yb === y0 + 8 ? baldas[0] : (baldas[baldas.indexOf(yb) + 1] || y1 - 8);
      let pila = base;
      for (const [w, h, col, ico, tumbada] of lista) {
        const ww = tumbada ? h * 2.4 : w, hh = tumbada ? w * 0.42 : h;
        const bx = tumbada ? x0 + 14 : x, by = tumbada ? pila - hh : base - hh;
        if (by < yb + 2) continue;
        g.fillStyle = col; g.fillRect(bx, by, ww, hh); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(bx, by, ww, hh);
        g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(bx + 1, by + 1, tumbada ? ww - 2 : 3, tumbada ? 3 : hh - 2);
        const cx = bx + ww / 2, cy = by + hh / 2; g.fillStyle = "rgba(255,248,230,0.85)"; g.strokeStyle = "rgba(255,248,230,0.85)"; g.lineWidth = 1.2;
        if (ico === "circulo") { g.beginPath(); g.arc(cx, cy, Math.min(ww, hh) * 0.22, 0, Math.PI * 2); g.stroke(); }
        else if (ico === "dados") { for (const [dx, dy] of [[-3, -3], [3, 3], [0, 0]]) { g.beginPath(); g.arc(cx + dx, cy + dy, 1.2, 0, Math.PI * 2); g.fill(); } }
        else if (ico === "triangulo") { const r = Math.min(ww, hh) * 0.25; g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r, cy + r * 0.7); g.lineTo(cx - r, cy + r * 0.7); g.closePath(); g.stroke(); }
        else if (ico === "estrella") estrella(g, cx, cy, Math.min(ww, hh) * 0.28, "rgba(255,248,230,0.85)");
        else if (ico === "rombo") { const r = Math.min(ww, hh) * 0.26; g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r * 0.7, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r * 0.7, cy); g.closePath(); g.stroke(); }
        else if (ico === "puzle") { g.fillStyle = "rgba(255,248,230,0.85)"; const r = Math.min(ww, hh) * 0.2; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); g.beginPath(); g.arc(cx + r, cy, r * 0.45, 0, Math.PI * 2); g.arc(cx, cy - r, r * 0.45, 0, Math.PI * 2); g.fill(); }
        if (tumbada) pila -= hh; else x += ww + 2;
      }
    }
    // macetita y dados encima del mueble
    g.fillStyle = "#b25b3a"; g.beginPath(); g.moveTo(912, y0); g.lineTo(930, y0); g.lineTo(927, y0 - 14); g.lineTo(915, y0 - 14); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#3f8a4a";
    for (const [a, L] of [[-2.4, 18], [-1.9, 22], [-1.4, 20], [-0.9, 16], [-0.5, 12]]) { g.beginPath(); g.ellipse(921 + Math.cos(a) * L * 0.5, y0 - 14 + Math.sin(a) * L * 0.5, L * 0.5, 3.4, a, 0, Math.PI * 2); g.fill(); }
    for (const [dx, col] of [[0, "#f3efe6"], [12, "#d9443a"]]) { g.fillStyle = col; g.fillRect(790 + dx, y0 - 9, 9, 9); g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(790 + dx, y0 - 9, 9, 9);
      g.fillStyle = col === "#f3efe6" ? "#222" : "#fff"; g.beginPath(); g.arc(794.5 + dx, y0 - 4.5, 1, 0, Math.PI * 2); g.fill(); }
    // baldas
    g.fillStyle = "#5e3b25"; for (const y of baldas) { g.fillRect(x0 + 6, y - 2, x1 - x0 - 12, 7); }
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
  }
  function reloj(g) {
    const x = 712, y = 104, r = 22;
    g.fillStyle = "rgba(10,20,30,0.3)"; g.beginPath(); g.arc(x + 3, y + 4, r + 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#b08a4a"; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f6efdf"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.4; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, l = k % 3 ? 3 : 5; g.beginPath(); g.moveTo(x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2)); g.lineTo(x + Math.cos(a) * (r - 2 - l), y + Math.sin(a) * (r - 2 - l)); g.stroke(); }
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(-2.2) * 11, y + Math.sin(-2.2) * 11); g.moveTo(x, y); g.lineTo(x + Math.cos(-0.5) * 16, y + Math.sin(-0.5) * 16); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(x, y, 1.8, 0, Math.PI * 2); g.fill();
  }
  function alfombra(g) {
    const y0 = 490, y1 = 660, xa0 = 250, xa1 = 774, xb0 = 170, xb1 = 854;
    const q = (u, v) => ({ x: lerp(lerp(xa0, xb0, v), lerp(xa1, xb1, v), u), y: lerp(y0, y1, v) });
    const poli = (u0, v0, u1, v1, col) => { const a = q(u0, v0), b = q(u1, v0), c = q(u1, v1), d = q(u0, v1); g.fillStyle = col; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill(); };
    poli(0, 0, 1, 1, "#9e3a33");
    poli(0.04, 0.08, 0.96, 0.92, "#e8d7b5");
    poli(0.06, 0.12, 0.94, 0.88, "#2e3a6a");
    poli(0.12, 0.24, 0.88, 0.76, "#3b4b84");
    // rombos del centro
    for (let k = 0; k < 5; k++) { const u = 0.2 + k * 0.15, a = q(u, 0.32), b = q(u + 0.05, 0.5), c = q(u, 0.68), d = q(u - 0.05, 0.5);
      g.fillStyle = k % 2 ? "#c9813a" : "#e8d7b5"; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill(); }
    // flecos
    g.strokeStyle = "#efe2c4"; g.lineWidth = 1.2;
    for (let u = 0.01; u < 1; u += 0.018) { const a = q(u, 0); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(a.x, a.y - 5); g.stroke(); }
    g.strokeStyle = "rgba(20,10,10,0.5)"; g.lineWidth = 1.2; const a = q(0, 0), b = q(1, 0); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  }
  function mesa(g) {
    const { x0, x1, y0, y1, canto } = MESA;
    // sombra en el suelo
    g.fillStyle = "rgba(15,8,25,0.32)"; g.beginPath(); g.ellipse(512, 540, 165, 13, 0, 0, Math.PI * 2); g.fill();
    // patas (las de atrás, más cortas y oscuras)
    const pata = (x, ya, yb, w, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2, ya); g.lineTo(x + w / 2, ya); g.lineTo(x + w * 0.35, yb); g.lineTo(x - w * 0.35, yb); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke(); };
    pata(408, y1 + canto, 516, 11, "#5b3820"); pata(616, y1 + canto, 516, 11, "#5b3820");
    pata(386, y1 + canto, 546, 13, "#7d4d2b"); pata(638, y1 + canto, 546, 13, "#7d4d2b");
    // travesaño
    g.fillStyle = "#6b4226"; g.fillRect(392, 470, 240, 7); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.strokeRect(392, 470, 240, 7);
    // canto del tablero
    g.fillStyle = "#7b4b29"; g.beginPath(); g.moveTo(x0, y1 - 6); g.lineTo(x0, y1 + canto - 4); g.quadraticCurveTo(x0, y1 + canto, x0 + 6, y1 + canto); g.lineTo(x1 - 6, y1 + canto);
    g.quadraticCurveTo(x1, y1 + canto, x1, y1 + canto - 4); g.lineTo(x1, y1 - 6); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.stroke();
    // tablero
    const ruta = () => { g.beginPath(); g.moveTo(x0 + 10, y0); g.lineTo(x1 - 10, y0); g.quadraticCurveTo(x1, y0, x1, y0 + 6); g.lineTo(x1, y1 - 6); g.quadraticCurveTo(x1, y1, x1 - 10, y1);
      g.lineTo(x0 + 10, y1); g.quadraticCurveTo(x0, y1, x0, y1 - 6); g.lineTo(x0, y0 + 6); g.quadraticCurveTo(x0, y0, x0 + 10, y0); g.closePath(); };
    const gt = g.createLinearGradient(0, y0, 0, y1); gt.addColorStop(0, "#94643a"); gt.addColorStop(1, "#c08850");
    ruta(); g.fillStyle = gt; g.fill();
    g.save(); ruta(); g.clip();
    g.strokeStyle = "rgba(90,50,20,0.25)"; g.lineWidth = 1;
    for (let k = 0; k < 12; k++) { const y = y0 + 8 + k * 10; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + 80, y + 3, x0 + 180, y - 3, x1, y + 1); g.stroke(); }
    g.fillStyle = "rgba(255,230,190,0.25)"; g.fillRect(x0, y1 - 3, x1 - x0, 3);
    g.restore();
    ruta(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.stroke();
    // tapete verde bajo el puzle (en el plano)
    g.save(); g.translate(PX0, PY0); g.scale(SX, SY);
    g.fillStyle = "rgba(30,15,5,0.35)"; g.beginPath(); rectanguloRedondeado(g, -6, -3, PW + 14, PH + 14, 8); g.fill();
    g.fillStyle = "#2e5c46"; g.beginPath(); rectanguloRedondeado(g, -9, -9, PW + 18, PH + 18, 8); g.fill();
    g.strokeStyle = "#4b8566"; g.lineWidth = 2.4; g.beginPath(); rectanguloRedondeado(g, -6, -6, PW + 12, PH + 12, 6); g.stroke();
    g.setLineDash([3, 3]); g.strokeStyle = "rgba(200,230,200,0.35)"; g.lineWidth = 1; g.beginPath(); rectanguloRedondeado(g, -4, -4, PW + 8, PH + 8, 5); g.stroke(); g.setLineDash([]);
    g.fillStyle = "rgba(10,30,20,0.35)"; g.fillRect(0, 0, PW, PH);
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); rectanguloRedondeado(g, -9, -9, PW + 18, PH + 18, 8); g.stroke();
    g.restore();
    // charco de luz de la lámpara sobre la mesa
    g.save(); g.globalCompositeOperation = "lighter";
    const gl = g.createRadialGradient(512, 330, 10, 512, 330, 200); gl.addColorStop(0, "rgba(255,210,140,0.22)"); gl.addColorStop(1, "rgba(255,210,140,0)");
    g.fillStyle = gl; g.beginPath(); g.ellipse(512, 330, 220, 110, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ---------- objetos con movimiento ---------- */
  const LAMP = { x: 512, y0: -60, L: 160 };
  const balanceo = t => 0.005 * Math.sin(t * 1.3) + (t > T.pum ? 0.05 * Math.sin((t - T.pum) * 5.6) * Math.exp(-(t - T.pum) * 0.9) * tramo(t, T.pum, T.pum + 0.1) : 0);
  function lampara(g, t) {
    const a = balanceo(t), L = LAMP.L;
    g.save(); g.translate(LAMP.x, LAMP.y0); g.rotate(a); g.lineJoin = "round";
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L); g.stroke();
    g.fillStyle = "#b08a4a"; g.fillRect(-5, L - 2, 10, 9); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(-5, L - 2, 10, 9);
    // pantalla de esmalte verde
    g.beginPath(); g.moveTo(-9, L + 6); g.lineTo(9, L + 6); g.quadraticCurveTo(30, L + 16, 40, L + 34); g.lineTo(-40, L + 34); g.quadraticCurveTo(-30, L + 16, -9, L + 6); g.closePath();
    const gr = g.createLinearGradient(-40, 0, 40, 0); gr.addColorStop(0, "#1f4d3a"); gr.addColorStop(0.4, "#3f8a68"); gr.addColorStop(1, "#1f4d3a");
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.ellipse(-14, L + 18, 4, 9, 0.6, 0, Math.PI * 2); g.fill();
    // boca de la pantalla y bombilla
    g.fillStyle = "#fff3d2"; g.beginPath(); g.ellipse(0, L + 34, 40, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    const gb = g.createRadialGradient(0, L + 36, 1, 0, L + 36, 26); gb.addColorStop(0, "rgba(255,250,220,1)"); gb.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = gb; g.beginPath(); g.ellipse(0, L + 36, 26, 12, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function conoLuz(g, t) {
    const a = balanceo(t), r = LAMP.L + 36, bx = LAMP.x - Math.sin(a) * r, by = LAMP.y0 + Math.cos(a) * r;
    const dx = Math.sin(-a) * 160;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, by, 0, 400); gr.addColorStop(0, "rgba(255,226,160,0.16)"); gr.addColorStop(1, "rgba(255,226,160,0.0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(bx - 38, by); g.lineTo(bx + 38, by); g.lineTo(512 + dx + 210, 400); g.lineTo(512 + dx - 210, 400); g.closePath(); g.fill();
    g.restore();
  }
  // tapa de la caja apoyada detrás, con el mismo dibujo
  const TAPA = { x: 500, y: 281, w: 86, h: 57 };
  function tapa(g, t) {
    const d = t - T.pum, bam = d > 0 ? 0.07 * Math.sin(d * 13) * Math.exp(-d * 4.5) * tramo(t, T.pum, T.pum + 0.05) : 0;
    const salto = d > 0 ? 4 * campana(t, T.pum + 0.02, T.pum + 0.24) : 0;
    g.save(); g.translate(TAPA.x, TAPA.y - salto); g.rotate(bam);
    const w = TAPA.w, h = TAPA.h;
    g.fillStyle = "rgba(30,15,5,0.3)"; g.beginPath(); g.ellipse(4, 1, w / 2 + 4, 3, 0, 0, Math.PI * 2); g.fill();
    g.transform(1, 0, -0.06, 1, 0, 0);
    g.fillStyle = "#c7b89c"; g.fillRect(w / 2, -h, 5, h);                  // canto de la tapa
    g.fillStyle = "#efe4cf"; g.fillRect(-w / 2, -h, w, h);
    g.drawImage(CUADRO, -w / 2 + 4, -h + 4, w - 8, h - 12);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 0.8; g.strokeRect(-w / 2 + 4, -h + 4, w - 8, h - 12);
    // franja de abajo con piececitas dibujadas
    g.fillStyle = "#d26a43"; g.fillRect(-w / 2, -7, w, 7);
    g.fillStyle = "rgba(255,240,220,0.85)"; for (let k = 0; k < 4; k++) { const x = -w / 2 + 10 + k * 20; g.fillRect(x, -5.5, 4, 4); g.beginPath(); g.arc(x + 4.6, -3.5, 1.2, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(-w / 2, -h, w + 5, h); g.beginPath(); g.moveTo(w / 2, -h); g.lineTo(w / 2, 0); g.stroke();
    g.restore();
  }
  // tazas (una de cada uno) que saltan con el puñetazo
  function taza(g, x, y, col, salto, t, fase0) {
    g.save(); g.translate(x, y - salto); g.lineJoin = "round";
    g.fillStyle = "rgba(30,15,5,0.3)"; g.beginPath(); g.ellipse(1, salto + 0.5, 10, 2.4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 4.2; g.beginPath(); g.ellipse(8.5, -9, 4.5, 5, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.strokeStyle = col; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.moveTo(-8, -17); g.lineTo(8, -17); g.lineTo(7.4, -2); g.quadraticCurveTo(7, 0, 4, 0); g.lineTo(-4, 0); g.quadraticCurveTo(-7, 0, -7.4, -2); g.closePath();
    g.fillStyle = col; g.fill(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(-5.5, -14, 2, 10);
    g.fillStyle = "#4a2a14"; g.beginPath(); g.ellipse(0, -17, 8, 2.2, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // vapor
    g.strokeStyle = "rgba(255,255,255,0.4)"; g.lineWidth = 1.4;
    for (let i = 0; i < 2; i++) { const ph = (t * 0.5 + i / 2 + fase0) % 1, yy = -22 - ph * 22; g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(-3 + i * 5, yy + 6); g.quadraticCurveTo(-6 + i * 5 + 3 * Math.sin(t * 2 + i), yy, -2 + i * 5, yy - 6); g.stroke(); }
    g.globalAlpha = 1;
    g.restore();
  }
  // las piezas de Marta que esperan en el borde de la mesa
  function pila(g, t) {
    if (t < T.mA2) pieza(g, IA, PILA.A.x, PILA.A.y, PILA.A.rot, 1, 0);
    if (t < T.mB2) pieza(g, IB, PILA.B.x, PILA.B.y, PILA.B.rot, 1, 0);
    if (t < T.mZ2) pieza(g, IZ, PILA.Z.x, PILA.Z.y, PILA.Z.rot, 1, 0);
  }

  /* =====================================================================================
   * EL PUZLE (piezas en el tablero) Y LO QUE VUELA
   * ===================================================================================== */
  function enTablero(i, t) {
    if (i === IZ) return t >= T.snapZ;
    if (i === IA && t < T.snapA) return false;
    if (i === IB && t < T.snapB) return false;
    if (i === IC) return t >= ATERRIZA[i];
    if (t < VUELO[i].t0) return true;              // la onda del golpe aún no ha llegado
    return t >= ATERRIZA[i];
  }
  function puzle(g, t) {
    for (let i = 0; i < N; i++) {
      if (!enTablero(i, t)) continue;
      const P = centro(i);
      // clic al encajar (las de Marta) o botecito al aterrizar
      let dy = 0, k = 1;
      if (i === IA) { dy = -1.5 * campana(t, T.snapA, T.snapA + 0.14); k = 1 + 0.05 * campana(t, T.snapA, T.snapA + 0.12); }
      if (i === IB) { dy = -1.5 * campana(t, T.snapB, T.snapB + 0.14); k = 1 + 0.05 * campana(t, T.snapB, T.snapB + 0.12); }
      if (i === IZ) { dy = -1.5 * campana(t, T.snapZ, T.snapZ + 0.14); k = 1 + 0.06 * campana(t, T.snapZ, T.snapZ + 0.14); }
      if (t > T.pum && i !== IZ) { const tl = ATERRIZA[i]; dy = -2.4 * campana(t, tl, tl + 0.13); k = 1 + 0.035 * campana(t, tl, tl + 0.12); }
      pieza(g, i, P.x, P.y + dy, 0, 1, 0, k);
    }
  }
  // la pieza que no entra: encima del hueco, torcida, rebotando
  function piezaQueNoEntra(g, t) {
    if (t < T.gBaja || t >= VUELO[IC].t0) return;
    const q = piezaTorcida(t), { x, y } = q;
    // sombra: está montada encima de las de al lado
    g.fillStyle = "rgba(5,15,10,0.45)"; g.beginPath(); g.ellipse(x + 2, y + 5, 16, 6.5, 0.1, 0, Math.PI * 2); g.fill();
    pieza(g, IC, x, y, q.rot, 1, q.a, q.k, q.ky);
  }
  function piezasEnElAire(g, t) {
    if (t < T.pum) return;
    for (let i = 0; i < N; i++) {
      const v = VUELO[i]; if (!v || t < v.t0 || t >= v.tl) continue;
      const q = enVuelo(v, t);
      pieza(g, i, q.x, q.y, q.rot, Math.cos(q.flip), q.a, q.k, q.ky);
    }
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, col) {
    if (r <= 0.2) return;
    g.save(); g.fillStyle = col; g.beginPath();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 - Math.PI / 2, rr = k % 2 ? r * 0.32 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.restore();
  }
  function chispaClic(g, t, t0, P) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    const r = 6 * Math.sin(Math.PI * k);
    estrella(g, P.x + 10, P.y - 10 - 6 * k, r, "#fffbe6"); estrella(g, P.x - 9, P.y - 6 - 4 * k, r * 0.6, "#ffe9a0");
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; g.lineWidth = 1.4;
    for (const a of [-2.4, -1.57, -0.7]) { g.beginPath(); g.moveTo(P.x + Math.cos(a) * (10 + 6 * k), P.y + Math.sin(a) * (6 + 4 * k)); g.lineTo(P.x + Math.cos(a) * (15 + 8 * k), P.y + Math.sin(a) * (9 + 5 * k)); g.stroke(); }
    g.restore();
  }
  // rayitas de «¡boing!» cuando la pieza rebota
  function rayitasBoing(g, t) {
    if (t < T.gBaja || t > T.pum) return;
    const a = Math.min(1, Math.abs(boing(t)) * 1.6); if (a < 0.08) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * a})`; g.lineWidth = 1.6; g.lineCap = "round";
    for (const [dx, sg] of [[-19, -1], [19, 1]]) { g.beginPath(); g.moveTo(PC.x + dx, PC.y - 8); g.quadraticCurveTo(PC.x + dx + 4 * sg, PC.y - 2, PC.x + dx, PC.y + 4); g.stroke();
      g.beginPath(); g.moveTo(PC.x + dx + 4 * sg, PC.y - 10); g.quadraticCurveTo(PC.x + dx + 9 * sg, PC.y - 2, PC.x + dx + 4 * sg, PC.y + 6); g.stroke(); }
    g.restore();
  }
  // ¡PUM!
  function pum(g, t) {
    const d = t - T.pum; if (d < 0 || d > 0.6) return;
    const P = piezaTorcida(T.pum);
    const k1 = tramo(t, T.pum, T.pum + 0.04), k2 = 1 - tramo(t, T.pum + 0.1, T.pum + 0.26);
    const r = 34 * k1 * k2;
    if (r > 0.5) {
      g.save(); g.fillStyle = "#fff6c8"; g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath();
      for (let k = 0; k < 20; k++) { const a = k * Math.PI / 10 + 0.2, rr = k % 2 ? r * 0.45 : r * (0.8 + 0.2 * hash(k)); g.lineTo(P.x + Math.cos(a) * rr * 1.25, P.y + Math.sin(a) * rr * 0.8); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#ffc94a"; g.beginPath();
      for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, rr = k % 2 ? r * 0.25 : r * 0.55; g.lineTo(P.x + Math.cos(a) * rr * 1.25, P.y + Math.sin(a) * rr * 0.8); }
      g.closePath(); g.fill(); g.restore();
    }
    // polvillo
    const kp = fase(t, T.pum, T.pum + 0.6);
    if (kp > 0 && kp < 1) {
      g.save(); g.fillStyle = `rgba(235,225,205,${0.5 * (1 - kp)})`;
      for (let k = 0; k < 7; k++) { const a = Math.PI + k * Math.PI / 6, rr = 14 + 26 * salida(kp); g.beginPath(); g.arc(P.x + Math.cos(a) * rr * 1.4, P.y + 6 + Math.sin(a) * rr * 0.35, 5 + 6 * kp, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    // rayas de golpe
    const kr = fase(t, T.pum, T.pum + 0.22);
    if (kr > 0 && kr < 1) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - kr)})`; g.lineWidth = 2; g.lineCap = "round";
      for (let k = 0; k < 6; k++) { const a = -Math.PI * (0.15 + k * 0.14), r0 = 26 + 16 * kr, r1 = r0 + 12; g.beginPath(); g.moveTo(P.x + Math.cos(a) * r0 * 1.3, P.y + Math.sin(a) * r0); g.lineTo(P.x + Math.cos(a) * r1 * 1.3, P.y + Math.sin(a) * r1); g.stroke(); }
      g.restore();
    }
  }
  // «clic» al aterrizar cada pieza
  function clics(g, t) {
    if (t < T.cae0 - 0.1 || t > T.cae1 + 0.3) return;
    g.save(); g.lineCap = "round"; g.lineWidth = 1.2;
    for (let i = 0; i < N; i++) {
      if (i === IZ) continue;
      const k = fase(t, ATERRIZA[i], ATERRIZA[i] + 0.2); if (k <= 0 || k >= 1) continue;
      const P = centro(i); g.strokeStyle = `rgba(255,250,225,${0.9 * (1 - k)})`;
      for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(P.x + sg * (9 + 4 * k), P.y - 6 - 3 * k); g.lineTo(P.x + sg * (13 + 6 * k), P.y - 10 - 5 * k); g.stroke(); }
    }
    g.restore();
  }
  // brillo que recorre el puzle terminado y el sol que se enciende
  function brillo(g, t) {
    const k = fase(t, T.brillo0, T.brillo1); if (k <= 0 || k >= 1) return;
    g.save(); g.translate(PX0, PY0); g.scale(SX, SY);
    g.beginPath(); g.rect(0, 0, PW, PH); g.clip();
    g.globalCompositeOperation = "lighter";
    const s = lerp(-80, PW + 80, k), gr = g.createLinearGradient(s - 50, 0, s + 50, 0);
    gr.addColorStop(0, "rgba(255,240,200,0)"); gr.addColorStop(0.5, "rgba(255,240,200,0.42)"); gr.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = gr; g.transform(1, 0, -0.5, 1, 0, 0); g.fillRect(-PW, 0, PW * 3, PH);
    g.restore();
  }
  function solEncendido(g, t) {
    const k = campana(t, T.snapZ, T.snapZ + 1.4); if (k <= 0.01) return;
    const P = aMundo(SOL.u, SOL.v - 4);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(P.x, P.y, 2, P.x, P.y, 46); gr.addColorStop(0, `rgba(255,236,160,${0.55 * k})`); gr.addColorStop(1, "rgba(255,220,140,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(P.x, P.y, 52, 30, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    // chispitas alrededor del puzle
    for (let j = 0; j < 7; j++) {
      const t0 = T.snapZ + 0.05 + j * 0.11, kk = fase(t, t0, t0 + 0.5); if (kk <= 0 || kk >= 1) continue;
      const Q = aMundo(hash(j * 4.7) * PW, hash(j * 9.1 + 2) * PH);
      estrella(g, Q.x, Q.y - 6 - 8 * kk, 6 * Math.sin(Math.PI * kk), j % 2 ? "#ffe9a0" : "#fffbe6");
    }
  }
  // «¡ah!»: se da cuenta de que tiene algo en el bolsillo (rayitas junto a la cabeza)
  function seDaCuenta(g, t, pG) {
    const k = campana(t, T.gToca + 0.02, T.gToca + 0.42); if (k <= 0.02) return;
    const c = G.aPantalla(pG, G.centroCabeza(pG));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (const a of [-2.2, -1.75, -1.3]) { const r0 = 52, r1 = 52 + 10 * k; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // gotas de café que saltan de las tazas
  function salpicaduras(g, t) {
    for (const [x, y, t0, sg] of [[422, 398, T.pum + 0.02, -1], [600, 284, T.pum + 0.06, 1]]) {
      const k = fase(t, t0, t0 + 0.42); if (k <= 0 || k >= 1) continue;
      g.save(); g.fillStyle = "#4a2a14";
      for (let j = 0; j < 3; j++) { const vx = sg * (6 + 7 * j), vy = -46 - 10 * j; const xx = x + vx * k, yy = y - 18 + vy * k + 120 * k * k;
        g.beginPath(); g.ellipse(xx, yy, 1.8, 2.4, 0, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const fuerza = dentro(t, T.gBaja - 0.2, T.gDedo0 + 0.5, T.pum - 0.04, T.pum + 0.5);
    const vuelo = dentro(t, T.pum + 0.15, T.pum + 0.9, T.cae1 - 0.3, T.cae1 + 0.5);
    const final = dentro(t, T.mLleva0 - 0.25, T.mLleva0 + 0.4, T.brillo1 - 0.1, T.brillo1 + 0.4);
    const sobra = dentro(t, T.gSaca - 0.15, T.gSaca + 0.5, DUR, DUR + 1);
    const k = 1.17 + 0.11 * fuerza - 0.05 * vuelo + 0.04 * final + 0.03 * sobra;
    let x = 512 - 32 * fuerza + 28 * final - 22 * sobra, y = 330 + 2 * fuerza - 26 * vuelo;
    const d = t - T.pum;
    if (d > 0 && d < 0.6) { const a = 2.6 * Math.exp(-d * 8) * tramo(t, T.pum, T.pum + 0.03); x += a * Math.sin(d * 70); y += a * Math.cos(d * 55); }
    return { k, x, y };
  }

  function poses(t) { return { g: poseG(t), m: poseM(t) }; }

  class ElPuzle extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!SPR) creaPiezas();
      if (!fondo) fondo = creaFondo();
      const pM = poseM(t), pG = poseG(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -60, -50);
      // detrás del puzle: tapa de la caja y tazas
      tapa(g, t);
      taza(g, 422, 398, "#3f8f8a", 7 * campana(t, T.pum + 0.02, T.pum + 0.3), t, 0);
      taza(g, 600, 284, "#d9a33c", 6 * campana(t, T.pum + 0.06, T.pum + 0.34), t, 0.5);
      salpicaduras(g, t);
      // el puzle y las piezas de Marta
      puzle(g, t);
      pila(g, t);
      piezaQueNoEntra(g, t);
      conoLuz(g, t);
      brillo(g, t);
      // personajes
      M.dibujar(g, pM, t);
      G.dibujar(g, pG, t);
      // encima de todo: lo que vuela y los efectos
      rayitasBoing(g, t);
      chispaClic(g, t, T.snapA, PA); chispaClic(g, t, T.snapB, PB); chispaClic(g, t, T.snapZ, PZ);
      pum(g, t);
      piezasEnElAire(g, t);
      clics(g, t);
      solEncendido(g, t);
      seDaCuenta(g, t, pG);
      lampara(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00098.2", nombre: "Guillermo y Marta · El puzle", crear: () => new ElPuzle() });
  window.__A2D_00098_2 = { pose: poses, poseG, poseM, T, DUR, VUELO, enVuelo, enTablero, centro, piezaTorcida, piezaC, piezaA, piezaB, piezaZ, PILA, IA, IB, IZ, IC, offsetIndice, bordes };
})();
