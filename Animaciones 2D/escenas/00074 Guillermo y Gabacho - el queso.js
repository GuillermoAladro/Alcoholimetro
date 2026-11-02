"use strict";
/* 00074 · Guillermo y Gabacho · El queso
 *
 * Negro → rincón de una quesería por la tarde: pared encalada con zócalo verde, pizarra con dibujitos
 * (sin letras), un cuadrito con una vaca, lámpara de esmalte, estantería de quesos con embutidos
 * colgados sobre el mostrador y una silla de café de madera curvada a la izquierda.
 * Gabacho sostiene una cajita redonda de madera como quien enseña una joya y mira a cámara muy orgulloso.
 * Levanta la tapa (¡plop!): sale un tufo verde y dos moscas; lanza la tapa hacia atrás sin mirar (cae en
 * el mostrador), se lleva el queso a la nariz, se abanica el olor y aspira con los ojos cerrados, en
 * éxtasis, con la mano en el corazón y corazoncitos → se lo ofrece a Guillermo, que se acerca curioso
 * con las manos en los bolsillos y olfatea… el tufo le entra por la nariz: se queda tieso, el pelo de
 * punta se le marchita y cae lacio, le lloran los ojos, se pone verde y se le hinchan los carrillos
 * (mano a la boca) → retrocede tambaleándose y se desmaya en la silla: despatarrado, cabeza atrás,
 * ojos en espiral y la lengua fuera; una mosca le ronda la cabeza → Gabacho se encoge de hombros
 * («bof»), pasa la caja a la otra mano, pellizca un trocito, se acerca y se lo pasea bajo la nariz →
 * Guillermo se despierta de golpe (el pelo vuelve a ponerse de punta, el color le vuelve), ve el queso,
 * se da la vuelta y sale disparado de cuadro (la silla gira con el rebufo) → Gabacho se encoge de
 * hombros, se come el trocito con deleite, beso de chef y guiño → negro.
 *
 * Sin textos. El pelo mustio se dibuja encima del retrato de Guillermo (capaCabeza): se borran sus
 * púas repintando el fondo y se dibujan púas nuevas que caen hacia el suelo según el giro de la
 * cabeza. El verde es un tinte sobre la piel del retrato. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, entrada, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, B = Gabacho, R = Recortes;
  const S = 0.30, DUR = 14.95, TAU = Math.PI * 2;
  const SUELO = 540;
  const TINTA = "#0b0a0e";
  const T = {
    orgullo: 0.8, agarra: 1.12, pop: 1.5, alza: 1.82,
    tira0: 1.92, suelta: 2.1, aterriza: 2.62,
    sube0: 2.6, sube1: 2.95, abanico0: 2.22, abanico1: 2.62, aspira0: 2.98, aspira1: 3.42, extasis1: 4.2,
    ofrece0: 4.25, ofrece1: 4.85,
    gPaso0: 4.45, gPaso1: 5.0, huele0: 5.12, golpe: 5.72,
    marchita0: 5.82, marchita1: 6.5, boca: 6.1, traga: 6.55,
    retira: 5.98, atras0: 6.62, sienta: 7.68, sentado: 8.02,
    uy: 7.8, bah0: 8.12, bah1: 8.55,
    pasa0: 8.55, pasa1: 8.88, pellizca0: 8.95, pellizca1: 9.22,
    anda0: 9.25, anda1: 10.18, agita0: 10.2, despierta: 10.72, aterrizaG: 11.02,
    gira0: 11.2, gira1: 11.36, corre: 11.5, fuera: 11.84,
    encoge0: 12.05, encoge1: 12.55, come0: 12.62, bocado: 12.9, mastica1: 13.5, guino: 13.68,
    fin: 14.2
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const suma = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const Dd = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? m ?? i, menique: me ?? a ?? m ?? i });
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n], b[n], k); return o; };
  const RELAJ = Dd(0.55, 0.6, 0.55, 0.5, 0.45), ABIERTA = Dd(1, 1), PALMA = Dd(0.8, 0.95, 0.95, 0.92, 0.88), PUNO = Dd(0.2, 0.04),
    SOSTIENE = Dd(0.55, 0.9, 0.86, 0.83, 0.8), AGARRA = Dd(0.5, 0.36, 0.32, 0.3, 0.28), PINZA = Dd(0.8, 0.55, 0.12, 0.1, 0.1),
    PINZA_A = Dd(1, 0.85, 0.2, 0.16, 0.14), LACIA = Dd(0.6, 0.7, 0.66, 0.62, 0.58);
  // pie: lista de pasos [t0, t1, x, alza]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 24] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }

  /* ---------- manos por pistas: [t0, t1, objetivo, curva]; el objetivo se resuelve cada fotograma ---------- */
  const SJ = {
    G: { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo },
    B: { l: B.A.datos.piezas.brazo.codo, c: B.A.datos.piezas.brazo_cerca.codo }
  };
  const MU_BOLS = -1.75;
  function pista(lista, p, t) {
    const res = o => ({ q: o.en(p, t), mx: o.mx ?? 0, puno: o.puno ?? 1, fm: o.bolsillo ? 1 : 0,
      dedos: typeof o.dedos === "function" ? o.dedos(t) : (o.dedos || RELAJ) });
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, o, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)); if (k <= 0) continue;
      const d = res(o);
      c = { q: mezcla(c.q, d.q, k), mx: lerp(c.mx, d.mx, k), puno: lerp(c.puno, d.puno, k), fm: lerp(c.fm, d.fm, k), dedos: mezclaD(c.dedos, d.dedos, k) };
    }
    return c;
  }
  // mano final: el antebrazo llega por su lado natural (mu = de la mano hacia el codo) + un giro extra;
  // fm: cuánto se fuerza el ángulo del bolsillo (para que la muñeca entre en él)
  function manoDe(rig, p, lado, h, dobla) {
    const Tr = rig.tronco(p), cerca = lado === "c";
    const hom = Tr(cerca ? rig.HOMBRO_C : rig.HOMBRO);
    const L = cerca ? rig.BRAZO_C_L : rig.BRAZO_L, sj = SJ[rig === G ? "G" : "B"][lado];
    const c = R.ik(hom, h.q, L, sj, 42, dobla, 1.08), d = R.dir(c.a1);
    const e = { x: hom.x + d.x * sj * c.estira, y: hom.y + d.y * sj * c.estira };
    let mu = Math.atan2(e.y - h.q.y, e.x - h.q.x) + h.mx;
    if (h.fm > 0) mu += difAng(mu, MU_BOLS) * h.fm;
    return { x: h.q.x, y: h.q.y, ang: 0, mu, dobla, puno: h.puno, dedos: h.dedos };
  }
  // punto de la pinza (entre la yema del índice y la del pulgar) respecto al centro de la mano, en unidades de mano
  const PINZA_PT = { x: 12, y: 10.5 };
  const pinzaHoja = (rig, m) => { const q = rot({ x: PINZA_PT.x * rig.JK, y: PINZA_PT.y * rig.JK }, m.mu + Math.PI / 2); return { x: m.x + q.x, y: m.y + q.y }; };
  // centro de la mano para que la pinza caiga en q (pantalla)
  const pinzaEn = (rig, lado, dobla, qf, mx = 0) => (p, t) => {
    const qq = rig.aHoja(p, qf(p, t));
    const m0 = manoDe(rig, p, lado, { q: qq, mx, puno: 1, fm: 0, dedos: PINZA }, dobla);
    const pp = pinzaHoja(rig, m0);
    return { x: qq.x - (pp.x - qq.x), y: qq.y - (pp.y - qq.y) };
  };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * LA CAJA DE QUESO (pantalla, origen en el centro de la base) Y LA TAPA
   * ===================================================================================== */
  const CJ = { r: 24, ry: 7.5, h: 12, tr: 25.5, try: 8, th: 6 };
  const BOX_OFF = { x: -6, y: -6 };          // del centro de la mano que la sostiene a la base de la caja (pantalla)
  const LID_OFF = { x: 0, y: 9 };            // del centro de la mano que agarra la tapa a la base de la tapa
  const MADERA = "#e3c58e", MADERA_OSC = "#b98b4f", MADERA_LUZ = "#f4dfb2";
  function cilindro(g, r, ry, h) {             // costado: de la base (y = 0) a la cara de arriba (y = −h)
    g.beginPath(); g.moveTo(r, 0); g.ellipse(0, 0, r, ry, 0, 0, Math.PI); g.lineTo(-r, -h); g.ellipse(0, -h, r, ry, 0, Math.PI, 0, true); g.closePath();
  }
  function costadoMadera(g, r, ry, h) {
    const gr = g.createLinearGradient(-r, 0, r, 0);
    gr.addColorStop(0, MADERA_OSC); gr.addColorStop(0.35, MADERA); gr.addColorStop(0.6, MADERA_LUZ); gr.addColorStop(1, MADERA_OSC);
    cilindro(g, r, ry, h); g.fillStyle = gr; g.fill();
    g.save(); cilindro(g, r, ry, h); g.clip();
    g.strokeStyle = "rgba(140,95,45,0.45)"; g.lineWidth = 0.8;
    for (let i = 0; i < 7; i++) { const x = -r + 4 + i * (2 * r - 8) / 6; g.beginPath(); g.moveTo(x, -h - ry); g.quadraticCurveTo(x + 3, -h / 2, x - 1, ry); g.stroke(); }
    g.restore();
    cilindro(g, r, ry, h); g.strokeStyle = "#2a1a0c"; g.lineWidth = 1.8; g.stroke();
  }
  // mordida: 0..1 (falta una cuña del queso)
  function dibCaja(g, mordida) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const { r, ry, h } = CJ;
    costadoMadera(g, r, ry, h);
    // borde de arriba (canto de la madera) y el queso dentro, un poco hundido
    g.beginPath(); g.ellipse(0, -h, r, ry, 0, 0, TAU); g.fillStyle = MADERA_OSC; g.fill(); g.strokeStyle = "#2a1a0c"; g.lineWidth = 1.6; g.stroke();
    const qr = r - 2.6, qry = ry - 1.2, qy = -h + 1.2;
    const queso = () => { g.beginPath(); g.ellipse(0, qy, qr, qry, 0, 0, TAU); };
    queso(); g.fillStyle = "#f2e5c2"; g.fill();
    g.save(); queso(); g.clip();
    g.fillStyle = "rgba(214,160,80,0.55)";
    for (const [x, y, a, b] of [[-10, -1, 8, 3], [7, 2, 9, 3], [12, -3, 5, 2], [-3, 3, 6, 2]]) { g.beginPath(); g.ellipse(x, qy + y, a, b, 0.2, 0, TAU); g.fill(); }
    g.fillStyle = "#5e8f84"; for (const [x, y, rr] of [[-14, 0, 2.2], [-6, -3, 1.5], [3, 1, 2.4], [10, -2, 1.6], [16, 2, 1.8], [-1, -1, 1.2], [6, 4, 1.3]]) { g.beginPath(); g.arc(x, qy + y, rr, 0, TAU); g.fill(); }
    g.fillStyle = "#86ad5a"; for (const [x, y, rr] of [[-9, 3, 1.4], [13, 0, 1.2], [-17, -2, 1.1], [1, -4, 1.3]]) { g.beginPath(); g.arc(x, qy + y, rr, 0, TAU); g.fill(); }
    if (mordida > 0.01) {      // cuña que falta: se ve la pasta, cremosa
      const a0 = Math.PI * 0.62, a1 = a0 + 0.95 * mordida;
      g.beginPath(); g.moveTo(-2, qy); g.ellipse(0, qy, qr + 2, qry + 2, 0, a0, a1); g.closePath();
      g.fillStyle = "#f7d97a"; g.fill(); g.strokeStyle = "rgba(160,110,30,0.7)"; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(-8, qy + 2.5, 3.5, 1.2, 0.3, 0, TAU); g.fill();
    }
    g.restore();
    queso(); g.strokeStyle = "rgba(120,90,40,0.7)"; g.lineWidth = 1; g.stroke();
    g.restore();
  }
  // tapa: base en (0, 0); vuelta: −1..1 (1 = cara de arriba a la vista, −1 = boca abajo); tumbada sobre el canto si ≈ 0
  function dibTapa(g, vuelta = 1) {
    g.save(); g.lineJoin = "round";
    const { tr, th } = CJ, vy = Math.max(0.12, Math.abs(vuelta)), ry = CJ.try * vy;
    g.save(); g.scale(1, vy > 0.2 ? 1 : 1); costadoMadera(g, tr, ry, th); g.restore();
    const top = () => { g.beginPath(); g.ellipse(0, -th, tr, ry, 0, 0, TAU); };
    if (vuelta >= 0) {
      top(); g.fillStyle = MADERA_LUZ; g.fill(); g.strokeStyle = "#2a1a0c"; g.lineWidth = 1.6; g.stroke();
      // sello rojo y florecita (sin letras)
      g.save(); g.translate(0, -th); g.scale(1, ry / tr);
      g.strokeStyle = "#c2392b"; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, tr * 0.68, 0, TAU); g.stroke();
      g.lineWidth = 1; g.beginPath(); g.arc(0, 0, tr * 0.56, 0, TAU); g.stroke();
      g.fillStyle = "#c2392b"; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.ellipse(Math.cos(a) * 5.5, Math.sin(a) * 5.5, 4, 2.4, a, 0, TAU); g.fill(); }
      g.fillStyle = "#f2c14e"; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill();
      g.restore();
    } else {
      top(); g.fillStyle = MADERA_OSC; g.fill(); g.strokeStyle = "#2a1a0c"; g.lineWidth = 1.6; g.stroke();
      g.beginPath(); g.ellipse(0, -th, tr - 3, Math.max(0.3, ry - 1), 0, 0, TAU); g.fillStyle = "#c9a26a"; g.fill();
    }
    g.restore();
  }
  // caja cerrada (con la tapa puesta)
  function dibCajaCerrada(g) { dibCaja(g, 0); g.save(); g.translate(0, -CJ.h + 3); dibTapa(g, 1); g.restore(); }
  // trocito de queso (pantalla, centro en la pinza)
  function dibTrocito(g) {
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(-6, 3); g.lineTo(7, 4); g.lineTo(2, -6); g.closePath();
    g.fillStyle = "#f7d97a"; g.fill(); g.strokeStyle = "#5a4010"; g.lineWidth = 1.3; g.stroke();
    g.beginPath(); g.moveTo(-6, 3); g.lineTo(2, -6); g.lineWidth = 2.6; g.strokeStyle = "#efe2bd"; g.stroke(); g.lineWidth = 1; g.strokeStyle = "#5a4010"; g.stroke();
    g.fillStyle = "#5e8f84"; g.beginPath(); g.arc(-2, -1, 1.1, 0, TAU); g.fill();
    g.restore();
  }
  // objetos en la mano de Gabacho: se dibujan en píxeles de pantalla (la mano está en su hoja, reflejada)
  const KB = 1 / (B.JK * S * B.K);
  const enPantallaB = g => g.scale(-KB, KB);
  const objCaja = (est) => g => { g.save(); enPantallaB(g); g.translate(BOX_OFF.x, BOX_OFF.y); dibCaja(g, est.mordida); g.restore(); };
  const objCajaCerrada = () => g => { g.save(); enPantallaB(g); g.translate(BOX_OFF.x, BOX_OFF.y); dibCajaCerrada(g); g.restore(); };
  const objTapa = () => g => { g.save(); enPantallaB(g); g.translate(LID_OFF.x, LID_OFF.y); dibTapa(g, 1); g.restore(); };

  /* =====================================================================================
   * GUILLERMO (mira a la derecha; para huir se da la vuelta con un giro aplastado)
   * ===================================================================================== */
  const NARIZ_G = { x: 862, y: 690 }, NARIZ_B = { x: 845, y: 585 };
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const Y_PIE_G = SUELO - (G.SUELO - G.PELVIS.y) * S;     // pelvis de pie (pantalla)
  const XG0 = 330, XS = 205, YS = 415, XAT = 238;           // de pie, sentado en la silla y donde aterriza
  const PASOS_G = {
    cerca: [[-9, -8, XG0 - 18], [4.72, 4.98, 374, 20], [6.62, 6.9, 320, 16], [7.14, 7.42, 252, 14], [8.04, 8.34, 258, 6]],
    lejos: [[-9, -8, XG0 + 21], [4.47, 4.74, 412, 24], [6.88, 7.16, 340, 18], [7.4, 7.66, 274, 12], [8.06, 8.36, 288, 8]]
  };
  const CARAS_G = {
    mira: E({ mx: 0.9, my: 0.05, c: 0.12, sd: 4, si: 6, sonr: 0.2, ancho: 0.9 }),
    intriga: E({ mx: 0.9, my: 0.12, iris: 0.85, sd: 16, gd: 0.04, si: 24, gi: 0.1, abre: 8, ancho: 0.55, sonr: 0 }),
    esceptico: E({ mx: 0.9, my: 0.05, c: 0.38, sd: -2, gd: -0.12, si: 22, gi: 0.14, abre: 0, ancho: 0.7, sonr: -0.12 }),
    curioso: E({ mx: 0.9, my: 0.35, c: 0.1, sd: 14, gd: 0.04, si: 18, gi: 0.08, abre: 4, ancho: 0.62, sonr: 0.2 }),
    huele: E({ mx: 0.6, my: 0.4, c: 1, h: 0.45, sd: 12, si: 12, abre: 0, ancho: 0.6, sonr: 0.18 }),
    golpe: E({ mx: 0, my: -0.1, iris: 0.42, sd: 36, gd: 0.12, si: 36, gi: 0.12, abre: 30, ancho: 0.55, sonr: -0.45, lengua: 0.1 }),
    asco: E({ mx: 0.3, my: 0.1, c: 0.62, z: 0.6, sd: 6, gd: -0.22, si: 6, gi: -0.22, abre: 0, ancho: 0.55, sonr: -0.55, mof: 1, rub: 0 }),
    traga: E({ mx: 0.2, my: 0.2, c: 0.5, z: 0.3, sd: 10, gd: -0.15, si: 10, gi: -0.15, abre: 10, ancho: 0.62, sonr: -0.4, mof: 0 }),
    mareo: E({ mx: 0, my: 0, c: 0.25, esp: 1, sd: 8, si: 8, abre: 18, ancho: 0.8, sonr: -0.3, lengua: 0.4 }),
    desmayo: E({ mx: 0, my: 0, c: 1, esp: 0, sd: 4, si: 4, abre: 22, ancho: 0.72, sonr: -0.15, lengua: 0 }),
    despierta: E({ mx: 0.85, my: 0, iris: 0.5, sd: 36, gd: 0.15, si: 36, gi: 0.15, abre: 34, ancho: 0.6, sonr: -0.3 }),
    panico: E({ mx: 0.9, my: 0.25, iris: 0.42, sd: 36, gd: 0.14, si: 36, gi: 0.14, abre: 14, ancho: 0.46, sonr: -0.45 }),
    huye: E({ mx: 0.85, my: 0, iris: 0.5, sd: 30, gd: 0.18, si: 30, gi: 0.18, abre: 40, ancho: 0.72, sonr: -0.4, lengua: 0.2 })
  };
  const GUION_CARA_G = [
    [T.pop - 0.02, T.pop + 0.15, "intriga"], [T.aspira0, T.aspira0 + 0.3, "esceptico"], [T.ofrece0 + 0.1, T.ofrece0 + 0.4, "curioso"],
    [T.huele0, T.huele0 + 0.15, "huele"], [T.golpe - 0.03, T.golpe + 0.1, "golpe"], [T.boca - 0.15, T.boca + 0.1, "asco"],
    [T.traga, T.traga + 0.12, "traga"], [T.atras0 + 0.55, T.sienta, "mareo"], [T.sienta + 0.1, T.sentado + 0.1, "desmayo"],
    [T.despierta - 0.01, T.despierta + 0.05, "despierta"], [T.aterrizaG, T.aterrizaG + 0.12, "panico"], [T.gira1, T.corre, "huye"]
  ];
  const PARP_G = [0.5, 2.05, 3.7, 4.35, 11.12];
  const CUERPOS_G = {
    base: { torso: 0, cab: 0, atras: 0 },
    intriga: { torso: -0.05, cab: -0.05, atras: 0 },
    esceptico: { torso: 0.0, cab: 0.1, atras: 0 },
    acerca: { torso: 0.3, cab: 0.1, atras: 0.6 },
    huele: { torso: 0.4, cab: 0.06, atras: 1 },
    golpe: { torso: -0.2, cab: -0.24, atras: 0 },
    asco: { torso: 0.04, cab: 0.14, atras: 0 },
    tambalea: { torso: -0.12, cab: -0.06, atras: 0 },
    sentado: { torso: -0.2, cab: -0.55, atras: 0 },
    salta: { torso: -0.04, cab: -0.1, atras: 0 },
    panico: { torso: -0.14, cab: -0.04, atras: 0 },
    corre: { torso: 0.32, cab: -0.12, atras: 0 }
  };
  const GUION_G = [
    [T.pop, T.pop + 0.15, "intriga", salida], [T.pop + 0.4, T.pop + 0.8, "base"], [T.aspira0 + 0.1, T.aspira0 + 0.5, "esceptico"],
    [T.gPaso0, T.gPaso1, "acerca"], [T.huele0, T.huele0 + 0.2, "huele"], [T.golpe - 0.03, T.golpe + 0.15, "golpe", salida],
    [T.boca - 0.2, T.boca + 0.15, "asco"], [T.atras0, T.atras0 + 0.3, "tambalea"], [T.sienta, T.sentado, "sentado", entrada],
    [T.despierta - 0.02, T.despierta + 0.1, "salta", salida], [T.aterrizaG, T.aterrizaG + 0.12, "panico"], [T.gira1, T.corre, "corre"]
  ];
  // cantidades que mandan sobre el pelo, el color y las lágrimas
  const hojaMustia = t => {      // 0 de punta → 1 lacio; al despertar se dispara hacia arriba (negativo) y vuelve
    if (t < T.despierta) { const k = fase(t, T.marchita0, T.marchita1); return 1 - Math.pow(1 - k, 2.2) + 0.06 * Math.sin(k * Math.PI * 3) * (1 - k); }
    const v = t - T.despierta; return -0.45 * Math.exp(-v * 7) * Math.sin(v * 22 + 0.6) - 0.05 * Math.exp(-v * 4);
  };
  const capaPelo = t => dentro(t, T.marchita0 - 0.04, T.marchita0 + 0.12, T.despierta + 0.42, T.despierta + 0.58);
  const verde = t => dentro(t, T.marchita0 + 0.05, T.marchita1 - 0.05, T.despierta - 0.01, T.despierta + 0.14);
  const lloro = t => dentro(t, T.marchita0 + 0.15, T.marchita0 + 0.45, T.sentado + 0.1, T.sentado + 0.5);

  function poseG(t) {
    const b = guion(GUION_G, CUERPOS_G, "base", t);
    const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
    const respira = Math.sin(t * 2.3);
    const tamb = dentro(t, T.atras0, T.atras0 + 0.15, T.sienta - 0.1, T.sienta + 0.05);
    let xW = (fc.x + fl.x) / 2 + 1.5 - 14 * b.atras + 7 * tamb * Math.sin((t - T.atras0) * 9);
    let yW = Y_PIE_G - 0.22 * Math.max(fc.alza, fl.alza);
    // se sienta (se desploma) en la silla
    const si = fase(t, T.sienta, T.sentado);
    if (si > 0) {
      xW = lerp(xW, XS, suave(si)); yW = lerp(yW, YS, entrada(si));
      const v = t - T.sentado; if (v > 0) yW -= 7 * Math.exp(-v * 9) * Math.abs(Math.sin(v * 16));
    }
    // ¡se despierta! salta del asiento, cae de pie un poco más adelante
    const sube = fase(t, T.despierta, T.despierta + 0.14), cae = fase(t, T.despierta + 0.14, T.aterrizaG);
    if (sube > 0) {
      xW = lerp(XS, XAT, suave(fase(t, T.despierta, T.aterrizaG)));
      yW = cae <= 0 ? lerp(YS, 298, salida(sube)) : lerp(298, Y_PIE_G, entrada(cae));
      const v = t - T.aterrizaG; if (v > 0) yW += 9 * Math.exp(-v * 12) * Math.sin(v * 20);
    }
    const p = { x: xW, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      pelvis: { x: G.PELVIS.x, y: G.SUELO + (yW - SUELO) / S + respira * 2.5 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // olfatea: tres golpecitos de nariz (snif, snif, ¡sniiif!)
    const sn = dentro(t, T.huele0, T.huele0 + 0.08, T.golpe - 0.06, T.golpe);
    p.cabeza.ang += sn * (0.04 * Math.max(0, Math.sin((t - T.huele0) * 21)) * (t < T.huele0 + 0.3 ? 1 : 0)) - 0.05 * sn * tramo(t, T.huele0 + 0.32, T.golpe - 0.05);
    p.torsoEsc.y += 0.035 * sn * tramo(t, T.huele0 + 0.3, T.golpe - 0.05);
    // golpe: tiembla de arriba abajo
    const tiesa = dentro(t, T.golpe, T.golpe + 0.03, T.boca - 0.2, T.boca);
    p.cabeza.ang += 0.025 * tiesa * Math.sin(t * 60); p.torso += 0.012 * tiesa * Math.sin(t * 47);
    // náusea: arcadas
    const arcada = dentro(t, T.boca, T.boca + 0.05, T.traga, T.traga + 0.05);
    p.torso += 0.06 * arcada * Math.max(0, Math.sin((t - T.boca) * 18)); p.torsoEsc.y += 0.02 * arcada * Math.max(0, Math.sin((t - T.boca) * 18));
    // tambaleo
    p.torso += 0.14 * tamb * Math.sin((t - T.atras0) * 7.5) - 0.05 * tamb; p.cabeza.ang += 0.16 * tamb * Math.sin((t - T.atras0) * 7.5 - 1.1);
    // desmayado: respira despacio y la cabeza cuelga y se mece
    const desm = dentro(t, T.sentado, T.sentado + 0.3, T.despierta - 0.02, T.despierta);
    p.torsoEsc.y += 0.012 * desm * Math.sin(t * 2.2); p.cabeza.ang += 0.05 * desm * Math.sin(t * 1.6);
    const caeCab = t >= T.sentado ? 0.1 * Math.exp(-(t - T.sentado) * 6) * Math.sin((t - T.sentado) * 18) : 0;
    p.cabeza.ang -= caeCab;

    // ---- piernas ----
    const pieG = (f, lado) => ({ tob: { x: G.PELVIS.x + (f.x - xW) / S, y: TOB_G - (lado === "lejos" ? 12 : 0) - f.alza / S }, ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 0.5 ? 1 : 0) });
    p.piernas.cerca = pieG(fc, "cerca"); p.piernas.lejos = pieG(fl, "lejos");
    if (t >= T.sentado) {   // desmayado: punteras hacia arriba
      const k = tramo(t, T.sentado, T.sentado + 0.35);
      p.piernas.cerca.ang -= 0.22 * k; p.piernas.lejos.ang -= 0.32 * k;
    }
    if (sube > 0) {          // en el aire: piernas estiradas hacia abajo; aterriza con los pies plantados
      const enAire = cae < 1 ? 1 : 0, kk = salida(sube);
      for (const [lado, dx, xf] of [["cerca", -12, XAT - 18], ["lejos", 22, XAT + 22]]) {
        const colgando = { x: G.PELVIS.x + dx, y: p.pelvis.y + 520 };
        const suelo = { x: G.PELVIS.x + (xf - xW) / S, y: TOB_G - (lado === "lejos" ? 12 : 0) };
        const desde = p.piernas[lado].tob;
        const tob = enAire ? mezcla(desde, colgando, kk) : suelo;
        const fin = cae > 0.6 ? mezcla(tob, suelo, tramo(cae, 0.6, 1)) : tob;
        p.piernas[lado] = { tob: cae > 0 && cae < 1 ? mezcla(colgando, suelo, entrada(cae)) : fin, ang: lerp(-0.4, 0, cae) * (cae < 1 ? 1 : 0) };
      }
    }
    // carrera: ruedas de dibujos animados (marco del cuerpo)
    const rueda = tramo(t, T.gira1 - 0.02, T.gira1 + 0.1);
    if (rueda > 0) {
      for (const [lado, ph] of [["cerca", 0], ["lejos", Math.PI]]) {
        const w = (t - T.gira1) * 46 + ph;
        const corriendo = { x: G.PELVIS.x + 40 + 190 * Math.sin(w), y: p.pelvis.y + 470 - 120 * Math.max(0, Math.cos(w)) };
        p.piernas[lado] = { tob: mezcla(p.piernas[lado].tob, corriendo, rueda), ang: lerp(p.piernas[lado].ang, -0.35 * Math.cos(w), rueda) };
      }
    }

    // ---- giro (aplastado) y huida ----
    const gira = fase(t, T.gira0, T.gira1);
    let sx = Math.cos(Math.PI * suave(gira)); if (Math.abs(sx) < 0.04) sx = sx < 0 ? -0.04 : 0.04;
    const corre = fase(t, T.corre, T.fuera);
    if (corre > 0) p.x -= 820 * Math.pow(corre, 2.1);
    p.M = { o: { x: xW, y: yW }, sx };

    // ---- cara y capa de la cabeza ----
    const e = guion(GUION_CARA_G, CARAS_G, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0;
    const est = { w: hojaMustia(t), wC: capaPelo(t), verde: verde(t), lloro: lloro(t), mof: e.mof,
      sudor: dentro(t, T.golpe + 0.1, T.golpe + 0.3, T.atras0 + 0.4, T.atras0 + 0.7) + 0.8 * dentro(t, T.aterrizaG, T.aterrizaG + 0.1, T.fuera, T.fuera + 0.1),
      lengua: dentro(t, T.sentado - 0.1, T.sentado + 0.2, T.despierta - 0.02, T.despierta + 0.02),
      equis: dentro(t, T.sienta + 0.18, T.sentado + 0.08, T.despierta - 0.02, T.despierta),
      oscila: 0.12 * tamb + 0.25 * (t > T.sentado ? Math.exp(-(t - T.sentado) * 3) : 0) + 0.03 * desm,
      cd: p.cara.ojos.d, ci: p.cara.ojos.i };
    est.abajo = Math.PI / 2 - (p.torso + p.cabeza.ang);
    p.est = est;
    p.capaCabeza = (g, tt) => capaG(g, tt, est);
    p.capaTronco = (g) => cuelloVerde(g, est.verde);
    manosG(p, t);
    return p;
  }

  /* ---------- manos de Guillermo ---------- */
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => { const o = { x: Math.cos(mu) * R_MG, y: Math.sin(mu) * R_MG }; return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, MU_BOLS), BOLS_GL = manoDesde({ x: 372, y: 648 }, MU_BOLS);
  const trG = q => p => G.tronco(p)(q);
  const deHombroG = (lado, d) => p => { const h = G.tronco(p)(lado === "c" ? G.HOMBRO_C : G.HOMBRO); return { x: h.x + d.x, y: h.y + d.y }; };
  const agita = (f, ax, ay, ph = 0) => (p, t) => ({ x: ax * Math.sin(TAU * f * t + ph), y: ay * Math.cos(TAU * f * t * 1.3 + ph) });
  const con = (base, extra) => (p, t) => suma(base(p, t), extra(p, t));
  const bocaG = d => p => { const q = G.boca(p); return { x: q.x + d.x, y: q.y + d.y }; };
  const cuelgaG = (lado, dx) => p => { const h = G.tronco(p)(lado === "c" ? G.HOMBRO_C : G.HOMBRO), L = lado === "c" ? G.BRAZO_C_L : G.BRAZO_L; return { x: h.x + dx, y: h.y + L * 0.93 }; };
  const PISTA_GL = [            // mano lejana (la de delante)
    [0, 0, { en: trG(BOLS_GL), puno: 0, bolsillo: 1 }],
    [T.golpe - 0.02, T.golpe + 0.16, { en: deHombroG("l", { x: 150, y: -170 }), dedos: ABIERTA, mx: 0 }, salida],
    [T.boca, T.boca + 0.22, { en: trG({ x: 320, y: 590 }), dedos: PALMA, mx: -0.3 }],
    [T.atras0 + 0.1, T.atras0 + 0.35, { en: con(deHombroG("l", { x: 170, y: 110 }), agita(2.4, 34, 26)), dedos: RELAJ }],
    [T.sienta - 0.05, T.sentado, { en: cuelgaG("l", 40), dedos: LACIA, mx: 0.2 }],
    [T.despierta - 0.02, T.despierta + 0.1, { en: deHombroG("l", { x: 70, y: -270 }), dedos: ABIERTA }, salida],
    [T.aterrizaG, T.aterrizaG + 0.14, { en: deHombroG("l", { x: 140, y: -150 }), dedos: ABIERTA }],
    [T.gira1, T.corre, { en: con(deHombroG("l", { x: 130, y: 120 }), agita(7.3, 110, 50)), dedos: PUNO }]
  ];
  const PISTA_GC = [            // mano cercana
    [0, 0, { en: trG(BOLS_GC), puno: 0, bolsillo: 1 }],
    [T.golpe - 0.02, T.golpe + 0.16, { en: deHombroG("c", { x: -40, y: -250 }), dedos: ABIERTA }, salida],
    [T.boca - 0.08, T.boca + 0.14, { en: bocaG({ x: 6, y: 24 }), dedos: PALMA, mx: 0.55 }],
    [T.traga + 0.05, T.traga + 0.25, { en: deHombroG("c", { x: 80, y: 190 }), dedos: RELAJ }],
    [T.atras0 + 0.35, T.atras0 + 0.65, { en: con(deHombroG("c", { x: -60, y: 210 }), agita(2.1, 30, 18, 1)), dedos: RELAJ }],
    [T.sienta, T.sentado, { en: cuelgaG("c", -6), dedos: LACIA, mx: -0.2 }],
    [T.despierta - 0.02, T.despierta + 0.1, { en: deHombroG("c", { x: -20, y: -290 }), dedos: ABIERTA }, salida],
    [T.aterrizaG, T.aterrizaG + 0.14, { en: deHombroG("c", { x: 200, y: -160 }), dedos: ABIERTA }],
    [T.gira1, T.corre, { en: con(deHombroG("c", { x: 90, y: 160 }), agita(7.3, -110, -50)), dedos: PUNO }]
  ];
  function manosG(p, t) {
    const L = pista(PISTA_GL, p, t), C = pista(PISTA_GC, p, t);
    p.manoLejos = manoDe(G, p, "l", L, -1);
    p.manoCerca = manoDe(G, p, "c", C, -1);
    // desmayado: las manos se balancean un poco
    const desm = dentro(t, T.sentado, T.sentado + 0.3, T.despierta - 0.02, T.despierta);
    p.manoLejos.x += 6 * desm * Math.sin(t * 1.6); p.manoCerca.x += 5 * desm * Math.sin(t * 1.6 + 0.4);
  }

  /* =====================================================================================
   * GABACHO (mira a la izquierda)
   * ===================================================================================== */
  const XB0 = 700;
  const TOB_B = B.SUELO - B.TOBILLO_ALTO;
  const Y_PIE_B = SUELO - (B.SUELO - B.PELVIS.y) * S;
  const PASOS_B = {
    lejos: [[-9, -8, XB0 - 20], [4.28, 4.52, 602, 24], [9.25, 9.48, 540, 22], [9.66, 9.9, 446, 24], [10.0, 10.18, 362, 14]],
    cerca: [[-9, -8, XB0 + 20], [4.5, 4.76, 642, 22], [9.46, 9.7, 492, 22], [9.86, 10.08, 404, 20], [T.despierta + 0.02, T.despierta + 0.22, 430, 12]]
  };
  const CARAS_B = {
    mira: E({ mx: 0.9, my: 0.05, c: 0.1, sd: 6, si: 6, sonr: 0.45 }),
    orgullo: E({ mx: -0.85, my: 0, c: 0.32, sd: 16, gd: 0.04, si: 16, gi: 0.04, sonr: 0.85, ancho: 1.02 }),
    abre: E({ mx: 0.5, my: 0.7, c: 0.25, sd: 8, si: 14, gi: 0.08, abre: 6, ancho: 0.6, sonr: 0.4 }),
    ahh: E({ mx: 0.5, my: 0.4, c: 1, h: 1, sd: 16, si: 16, abre: 16, ancho: 0.8, sonr: 0.6, rub: 0.4 }),
    aspira: E({ mx: 0.5, my: 0.4, c: 1, h: 0.6, sd: 22, si: 22, abre: 0, ancho: 0.62, sonr: 0.3, rub: 0.5 }),
    extasis: E({ mx: 0.5, my: 0.2, c: 1, h: 1, sd: 18, si: 18, abre: 14, ancho: 1.0, sonr: 0.9, rub: 0.85 }),
    ofrece: E({ mx: 0.9, my: 0.15, c: 0.15, sd: 14, si: 18, gi: 0.08, abre: 6, sonr: 0.8, rub: 0.3 }),
    espera: E({ mx: 0.9, my: 0.1, c: 0.2, sd: 10, si: 12, sonr: 0.65, rub: 0.2 }),
    extranado: E({ mx: 0.9, my: 0, iris: 0.85, sd: 4, gd: -0.12, si: 24, gi: 0.14, abre: 4, ancho: 0.6, sonr: -0.05 }),
    uy: E({ mx: 0.9, my: 0.1, c: 1, z: 1, sd: 10, si: 10, abre: 14, ancho: 0.95, sonr: -0.35 }),
    bah: E({ mx: -0.85, my: 0, c: 0.45, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 0, ancho: 0.75, sonr: -0.45 }),
    mira2: E({ mx: 0.7, my: 0.6, c: 0.2, sd: 8, si: 10, sonr: 0.4 }),
    picaro: E({ mx: 0.9, my: 0.3, c: 0.35, sd: 6, gd: 0.04, si: 20, gi: 0.12, abre: 0, sonr: 0.85 }),
    susto: E({ mx: 0.9, my: -0.1, iris: 0.6, sd: 30, si: 30, abre: 26, ancho: 0.6, sonr: -0.2 }),
    sigue: E({ mx: 0.95, my: 0, iris: 0.8, sd: 20, si: 22, abre: 10, ancho: 0.6, sonr: 0 }),
    encoge: E({ mx: -0.85, my: 0, c: 0.3, sd: 20, gd: 0.1, si: 20, gi: 0.1, abre: 0, ancho: 0.72, sonr: -0.4 }),
    come: E({ mx: 0.3, my: -0.8, c: 0.1, sd: 18, si: 18, abre: 34, ancho: 0.8, sonr: 0.4 }),
    masca: E({ mx: 0.4, my: 0.2, c: 1, h: 1, sd: 16, si: 16, abre: 0, ancho: 0.8, sonr: 0.55, rub: 0.6 }),
    guino: E({ mx: -0.85, my: 0, c: 0.08, wd: 0.92, sd: -2, gd: -0.06, si: 20, gi: 0.12, abre: 8, ancho: 1.05, sonr: 1, rub: 0.3 })
  };
  const GUION_CARA_B = [
    [T.orgullo - 0.15, T.orgullo + 0.12, "orgullo"], [T.agarra - 0.2, T.agarra, "abre"], [T.pop, T.pop + 0.1, "ahh"],
    [T.tira0 + 0.05, T.tira0 + 0.2, "mira"], [T.sube1 - 0.1, T.sube1 + 0.05, "aspira"], [T.aspira1 - 0.05, T.aspira1 + 0.15, "extasis"],
    [T.ofrece0, T.ofrece0 + 0.2, "ofrece"], [T.huele0, T.huele0 + 0.2, "espera"], [T.golpe + 0.15, T.golpe + 0.4, "extranado"],
    [T.uy, T.uy + 0.1, "uy"], [T.bah0, T.bah0 + 0.15, "bah"], [T.pasa0 + 0.05, T.pasa0 + 0.2, "mira2"],
    [T.anda0 + 0.2, T.anda0 + 0.4, "picaro"], [T.despierta, T.despierta + 0.06, "susto"], [T.despierta + 0.5, T.despierta + 0.7, "sigue"],
    [T.encoge0, T.encoge0 + 0.18, "encoge"], [T.come0, T.come0 + 0.15, "come"], [T.bocado + 0.1, T.bocado + 0.2, "masca"],
    [T.guino - 0.1, T.guino + 0.08, "guino"]
  ];
  const PARP_B = [1.0, 4.95, 6.0, 7.2, 9.05, 11.6];
  const CUERPOS_B = {
    base: { torso: 0, cab: 0, pel: 0, px: 0 },
    orgullo: { torso: -0.07, cab: -0.1, pel: 0, px: 0 },
    abre: { torso: 0.06, cab: 0.16, pel: 0, px: 0 },
    tira: { torso: -0.1, cab: -0.06, pel: 0, px: 0 },
    huele: { torso: 0.04, cab: 0.2, pel: 0, px: 0 },
    ofrece: { torso: 0.05, cab: 0.02, pel: 6, px: 4 },
    retira: { torso: -0.04, cab: 0.05, pel: 0, px: 0 },
    uy: { torso: -0.1, cab: -0.1, pel: 0, px: 4 },
    bah: { torso: 0, cab: 0.12, pel: 0, px: 0 },
    mira: { torso: 0.08, cab: 0.18, pel: 0, px: 0 },
    anda: { torso: 0.08, cab: 0.02, pel: 0, px: 0 },
    acerca: { torso: 0.46, cab: -0.26, pel: 40, px: 14 },
    susto: { torso: -0.24, cab: -0.16, pel: -10, px: 20 },
    sigue: { torso: 0.02, cab: 0.04, pel: 0, px: 12 },
    encoge: { torso: -0.04, cab: 0.14, pel: 0, px: 12 },
    come: { torso: -0.1, cab: -0.3, pel: 0, px: 12 },
    guino: { torso: -0.03, cab: -0.06, pel: 0, px: 12 }
  };
  const GUION_B = [
    [T.orgullo - 0.15, T.orgullo + 0.2, "orgullo"], [T.agarra - 0.25, T.agarra, "abre"], [T.tira0 - 0.05, T.suelta, "tira"],
    [T.sube0, T.sube1, "huele"], [T.ofrece0, T.ofrece1, "ofrece"], [T.retira, T.retira + 0.3, "retira"], [T.uy, T.uy + 0.15, "uy"],
    [T.bah0, T.bah0 + 0.25, "bah"], [T.pasa0, T.pasa0 + 0.25, "mira"], [T.anda0, T.anda0 + 0.2, "anda"],
    [T.anda1 - 0.3, T.agita0, "acerca"], [T.despierta, T.despierta + 0.1, "susto", salida], [T.despierta + 0.4, T.despierta + 0.8, "sigue"],
    [T.encoge0, T.encoge0 + 0.25, "encoge"], [T.come0, T.come0 + 0.3, "come"], [T.guino - 0.3, T.guino, "guino"]
  ];
  // caja: ancla (centro de la base, pantalla) a lo largo de la escena
  const trB = q => p => B.tronco(p)(q);
  const enPant = (p, q) => B.aPantalla(p, q);
  const narizB = p => enPant(p, B.cabeza(p).a(NARIZ_B));
  const narizG = pg => G.aPantalla(pg, G.cabeza(pg).a(NARIZ_G));
  const RUTA_CAJA = [
    [0, 0, (p) => enPant(p, B.tronco(p)({ x: 430, y: 530 }))],
    [T.sube0, T.sube1, (p) => { const n = narizB(p); return { x: n.x - 4, y: n.y + 40 }; }],
    [T.extasis1 - 0.05, T.ofrece1, (p, pg) => { const n = narizG(pg); return { x: n.x + 18, y: n.y + 26 }; }],
    [T.retira, T.retira + 0.35, (p) => enPant(p, B.tronco(p)({ x: 430, y: 530 }))],
    [T.pasa0, T.pasa1, (p) => enPant(p, B.tronco(p)({ x: 380, y: 560 }))],
    [T.pasa1 + 0.02, T.pellizca0, (p) => enPant(p, B.tronco(p)({ x: 350, y: 590 }))],
    [T.encoge0, T.encoge1 - 0.1, (p) => enPant(p, B.tronco(p)({ x: 90, y: 560 }))],
    [T.come0 - 0.05, T.come0 + 0.3, (p) => enPant(p, B.tronco(p)({ x: 350, y: 590 }))]
  ];
  function ancla(lista, p, pg, t) {
    let c = lista[0][2](p, pg, t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, f] = lista[i]; if (t <= t0) break;
      const k = suave(fase(t, t0, t1)); if (k <= 0) continue;
      c = mezcla(c, f(p, pg, t), k);
    }
    return c;
  }

  function poseB(t, pg) {
    const b = guion(GUION_B, CUERPOS_B, "base", t);
    const fl = pie(PASOS_B.lejos, t), fc = pie(PASOS_B.cerca, t);
    const respira = Math.sin(t * 2.05 + 0.6);
    const xW = (fl.x + fc.x) / 2 + b.px;
    const yW = Y_PIE_B - 0.22 * Math.max(fl.alza, fc.alza);
    const p = { x: xW, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, piernas: {},
      pelvis: { x: B.PELVIS.x, y: B.SUELO + (yW - SUELO) / S + b.pel + respira * 2.5 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // éxtasis: se mece de lado a lado
    const ex = dentro(t, T.aspira1, T.aspira1 + 0.2, T.extasis1 - 0.1, T.extasis1 + 0.1);
    p.torso += 0.07 * ex * Math.sin((t - T.aspira1) * 5.5); p.cabeza.ang += 0.12 * ex * Math.sin((t - T.aspira1) * 5.5 - 0.7);
    // aspira: el pecho se hincha
    const asp = dentro(t, T.aspira0, T.aspira1, T.aspira1 + 0.1, T.aspira1 + 0.5);
    p.torsoEsc.y += 0.035 * asp; p.cabeza.dy -= 8 * asp;
    // se encoge de hombros (la cabeza se hunde entre los hombros)
    const enc = Math.max(campana(t, T.bah0 + 0.05, T.bah1), campana(t, T.encoge0, T.encoge1 + 0.15));
    p.cabeza.dy += 32 * enc; p.torsoEsc.y += 0.035 * enc;
    // mastica
    const ma = dentro(t, T.bocado, T.bocado + 0.05, T.mastica1 - 0.15, T.mastica1);
    p.cabeza.ang += 0.03 * ma * Math.sin((t - T.bocado) * 14);
    // piernas
    for (const [lado, f] of [["lejos", fl], ["cerca", fc]]) {
      p.piernas[lado] = { tob: { x: B.PELVIS.x - (f.x - xW) / S, y: TOB_B - (lado === "lejos" ? 10 : 0) - f.alza / S }, ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 0.5 ? 1 : 0) };
    }
    const e = guion(GUION_CARA_B, CARAS_B, "mira", t);
    // al aspirar las aletas de la nariz… y al masticar los carrillos
    e.mof = Math.max(e.mof, 0.55 * ma * (0.5 + 0.5 * Math.sin((t - T.bocado) * 14)));
    e.abre += 6 * ma * Math.max(0, Math.sin((t - T.bocado) * 14 + 1.4));
    p.cara = cara(e, parpadeo(t, PARP_B));
    // caja y tapa
    p.caja = ancla(RUTA_CAJA, p, pg, t);
    p.mordida = tramo(t, T.pellizca0 + 0.05, T.pellizca0 + 0.15);
    manosB(p, t, pg);
    return p;
  }

  /* ---------- manos de Gabacho ---------- */
  const deHombroB = (lado, d) => p => { const h = B.tronco(p)(lado === "c" ? B.HOMBRO_C : B.HOMBRO); return { x: h.x + d.x, y: h.y + d.y }; };
  const bajoCaja = p => B.aHoja(p, { x: p.caja.x - BOX_OFF.x, y: p.caja.y - BOX_OFF.y });
  const tapaMano = (sube = 0) => p => B.aHoja(p, { x: p.caja.x - LID_OFF.x, y: p.caja.y - CJ.h + 3 - LID_OFF.y - sube });
  let PG = null;
  const abanico = (p, t) => {        // abanica el olor de la caja hacia la nariz
    const c = { x: p.caja.x, y: p.caja.y - CJ.h }, a = (t - T.abanico0) * TAU * 2.6;
    return B.aHoja(p, { x: c.x + 26 + 10 * Math.cos(a), y: c.y - 22 + 12 * Math.sin(a) });
  };
  const DOBLA_BL = -1, DOBLA_BC = -1;
  const PISTA_BL = [               // mano lejana: sostiene la caja; luego el trocito
    [0, 0, { en: bajoCaja, dedos: SOSTIENE, mx: 0 }],
    [T.pasa1, T.pasa1 + 0.06, { en: bajoCaja, dedos: PINZA_A, mx: 0 }],
    [T.pasa1 + 0.06, T.pellizca0, { en: pinzaEn(B, "l", DOBLA_BL, p => ({ x: p.caja.x - 9, y: p.caja.y - CJ.h - 4 })), dedos: PINZA_A }],
    [T.pellizca0, T.pellizca0 + 0.1, { en: pinzaEn(B, "l", DOBLA_BL, p => ({ x: p.caja.x - 9, y: p.caja.y - CJ.h + 1 })), dedos: PINZA }],
    [T.pellizca0 + 0.14, T.pellizca1, { en: deHombroB("l", { x: 200, y: 40 }), dedos: PINZA }],
    [T.anda1 - 0.25, T.agita0, { en: pinzaEn(B, "l", DOBLA_BL, (p, t) => { const n = narizG(PG); const w = Math.sin((t - T.agita0) * TAU * 3); return { x: n.x + 16 + 12 * w, y: n.y + 10 + 3 * Math.abs(w) }; }), dedos: PINZA }],
    [T.despierta, T.despierta + 0.1, { en: deHombroB("l", { x: 130, y: 60 }), dedos: PINZA }, salida],
    [T.encoge0, T.encoge0 + 0.3, { en: deHombroB("l", { x: 190, y: 140 }), dedos: PINZA }],
    [T.come0, T.bocado, { en: pinzaEn(B, "l", DOBLA_BL, p => { const q = enPant(p, B.boca(p)); return { x: q.x - 14, y: q.y - 20 }; }), dedos: PINZA }],
    [T.bocado, T.bocado + 0.06, { en: pinzaEn(B, "l", DOBLA_BL, p => { const q = enPant(p, B.boca(p)); return { x: q.x - 16, y: q.y - 24 }; }), dedos: PINZA_A }, salida],
    [T.bocado + 0.08, T.bocado + 0.35, { en: deHombroB("l", { x: 120, y: 150 }), dedos: RELAJ }],
    [T.mastica1 - 0.15, T.mastica1 + 0.02, { en: pinzaEn(B, "l", DOBLA_BL, p => { const q = enPant(p, B.boca(p)); return { x: q.x - 4, y: q.y }; }), dedos: PINZA }],
    [T.guino - 0.06, T.guino + 0.12, { en: deHombroB("l", { x: 230, y: -70 }), dedos: ABIERTA }, salida]
  ];
  const PISTA_BC = [               // mano cercana: la tapa, el abanico, el corazón, invita… y luego la caja
    [0, 0, { en: trB(B.BOLSILLO_C), puno: 0, bolsillo: 1 }],
    [T.agarra - 0.3, T.agarra, { en: tapaMano(0), dedos: AGARRA, mx: 0 }],
    [T.pop - 0.05, T.pop + 0.03, { en: tapaMano(14), dedos: AGARRA, mx: 0 }, salida],
    [T.pop + 0.08, T.alza, { en: deHombroB("c", { x: 10, y: 150 }), dedos: AGARRA, mx: 0 }],
    [T.tira0, T.suelta, { en: deHombroB("c", { x: -130, y: 30 }), dedos: AGARRA, mx: 0 }, entrada],
    [T.suelta, T.suelta + 0.12, { en: deHombroB("c", { x: -150, y: -10 }), dedos: ABIERTA, mx: 0 }, salida],
    [T.abanico0 - 0.1, T.abanico0 + 0.15, { en: abanico, dedos: ABIERTA, mx: 0.5 }],
    [T.abanico1, T.abanico1 + 0.32, { en: trB({ x: 300, y: 440 }), dedos: PALMA, mx: 0.2 }],
    [T.ofrece0 + 0.05, T.ofrece0 + 0.3, { en: deHombroB("c", { x: 300, y: 70 }), dedos: ABIERTA, mx: 0.4 }],
    [T.ofrece1, T.ofrece1 + 0.3, { en: trB(B.BOLSILLO_C), puno: 0, bolsillo: 1 }],
    [T.pasa0, T.pasa1, { en: bajoCaja, dedos: SOSTIENE, mx: 0 }]
  ];
  function manosB(p, t, pg) {
    PG = pg;
    const L = pista(PISTA_BL, p, t), C = pista(PISTA_BC, p, t);
    p.manoLejos = manoDe(B, p, "l", L, DOBLA_BL);
    p.manoCerca = manoDe(B, p, "c", C, DOBLA_BC);
    // objetos en las manos
    const enLejos = t < T.pasa1;
    if (t < T.agarra) p.manoLejos.objeto = objCajaCerrada();
    else if (enLejos) p.manoLejos.objeto = objCaja(p);
    else p.manoCerca.objeto = objCaja(p);
    if (t >= T.agarra && t < T.suelta) p.manoCerca.objeto = objTapa();
  }

  function pose(t) {
    const pg = poseG(t), pd = poseB(t, pg);
    return { g: pg, d: pd };
  }
  const cajaArriba = pd => ({ x: pd.caja.x, y: pd.caja.y - CJ.h });

  /* =====================================================================================
   * CAPA DE LA CABEZA DE GUILLERMO: verde, pelo mustio, lágrimas, lengua y sudor (retrato)
   * ===================================================================================== */
  const PZC = G.A.datos.piezas.cabeza, OJO_D = PZC.ojos.derecho, OJO_I = PZC.ojos.izquierdo;
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const PIEL_CUELLO = [[269,321],[254,318],[252,316],[250,318],[216,304],[212,299],[197,292],[175,270],[178,264],[188,259],[196,251],[196,246],[203,234],[203,229],[209,223],[219,233],[228,237],[243,249],[257,254],[266,266],[283,264],[287,267],[282,286],[291,296],[291,308],[294,310],[281,318],[271,318]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const VERDE = "#6fae2e", VERDE_MUL = "rgb(196,228,150)";
  function tinte(g, alfa, color, modo) { g.globalAlpha = alfa; g.globalCompositeOperation = modo; g.fillStyle = color; }
  function enverdece(g, k, relleno) { tinte(g, k, VERDE, "color"); relleno(); tinte(g, k * 0.9, VERDE_MUL, "multiply"); relleno(); }
  function caminoMoflete(g, k) { g.moveTo(912, 676); g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792); g.lineTo(840, 760); g.lineTo(890, 690); g.closePath(); }
  function carrillos(g, k) {          // carrillo cercano hinchado: brillo y pliegue junto a la comisura
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const a = clamp(k);
    g.globalAlpha = 0.5 * a; g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, TAU); g.fill();
    g.globalAlpha = a; g.strokeStyle = TINTA; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(744, 694 - 4 * k); g.quadraticCurveTo(756 - 4 * k, 716, 748, 742 + 3 * k); g.stroke();
    g.restore();
  }
  const ABAJO_D = [[733,556],[737,566],[748,573],[762,577],[778,583],[795,589],[808,592]];
  const ABAJO_I = [[866,608],[868,624],[880,630],[895,635],[910,638],[921,637]];
  function lagrimas(g, t, k) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // ojos encharcados
    for (const L of [ABAJO_D, ABAJO_I]) {
      g.beginPath(); g.moveTo(L[0][0], L[0][1] + 2); for (const [x, y] of L) g.lineTo(x, y + 3);
      g.globalAlpha = 0.8 * k; g.lineWidth = 9; g.strokeStyle = "#8fd2ff"; g.stroke();
      g.globalAlpha = 0.9 * k; g.lineWidth = 2.5; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(L[1][0] + 4, L[1][1] + 1); g.lineTo(L[3][0], L[3][1] + 1); g.stroke();
    }
    // chorritos por las mejillas
    for (const [x0, y0, x1, y1, ph] of [[752, 584, 742, 735, 0], [902, 642, 908, 742, 0.45]]) {
      g.globalAlpha = 0.55 * k; g.lineWidth = 9; g.strokeStyle = "#a6dcff";
      const largo = clamp(k * 1.6);
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 - 6, (y0 + y1) / 2, lerp(x0, x1, largo), lerp(y0, y1, largo)); g.stroke();
      for (let j = 0; j < 2; j++) {
        const u = ((t * 1.5 + ph + j * 0.5) % 1), x = lerp(x0, x1, u), y = lerp(y0, y1, u) + 20 * u * u, r = 8 * (1 - 0.3 * u);
        g.globalAlpha = k * Math.sin(Math.PI * u);
        g.beginPath(); g.moveTo(x, y - r * 1.8); g.quadraticCurveTo(x + r, y, x, y + r); g.quadraticCurveTo(x - r, y, x, y - r * 1.8);
        g.fillStyle = "#bfe8ff"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#1d3b52"; g.stroke();
        g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.15, r * 0.22, r * 0.35, 0, 0, TAU); g.fill();
      }
    }
    g.restore();
  }
  function lengua(g, t, k) {          // lengua fuera, colgando por la comisura
    if (k <= 0.01) return;
    g.save(); g.translate(812, 744); g.rotate(0.26 + 0.08 * Math.sin(t * 1.7)); g.scale(1, k);
    g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-20, -6); g.lineTo(26, -4); g.bezierCurveTo(30, 30, 28, 62, 6, 66); g.bezierCurveTo(-14, 68, -22, 34, -20, -6); g.closePath(); };
    forma(); g.fillStyle = "#ec7883"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "rgba(160,40,60,0.35)"; g.beginPath(); g.ellipse(16, 40, 14, 30, 0, 0, TAU); g.fill(); g.restore();
    forma(); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(140,30,50,0.7)"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(4, 6); g.quadraticCurveTo(6, 30, 4, 50); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-8, 22, 4, 9, 0.2, 0, TAU); g.fill();
    g.restore();
  }
  function equis(g, k) {             // ojos en X (fuera de combate)
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = TINTA; g.globalAlpha = clamp(k * 1.5);
    for (const [x, y, r] of [[771, 566, 24], [894, 618, 19]]) {
      const e = r * (0.6 + 0.4 * k); g.lineWidth = 8;
      g.beginPath(); g.moveTo(x - e, y - e * 0.8); g.lineTo(x + e, y + e * 0.8); g.moveTo(x - e, y + e * 0.8); g.lineTo(x + e, y - e * 0.8); g.stroke();
    }
    g.restore();
  }
  function sudor(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineWidth = 4; g.strokeStyle = "#1d3b52";
    [[640, 470, 0], [915, 520, 0.37], [700, 430, 0.71]].forEach(([x, y, d], i) => {
      const ph = ((t * 0.9 + d) % 1), aparece = clamp(k * 3 - i); if (aparece <= 0) return;
      const yy = y + ph * 70, s = 13 * aparece * (1 - 0.3 * ph);
      g.globalAlpha = Math.sin(Math.PI * ph) * aparece;
      g.beginPath(); g.moveTo(x, yy - s * 1.6); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.6);
      g.fillStyle = "#bfe8ff"; g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - s * 0.3, yy - s * 0.1, s * 0.22, s * 0.35, 0, 0, TAU); g.fill();
    });
    g.restore();
  }

  /* ---------- pelo mustio (retrato) ---------- */
  const PELO = (() => {
    const PIEL = PIEL_CAB;
    const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
    const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
    const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
    const CAJA = [[300,40],[1320,40],[1320,700],[300,700]];
    // púas: raíz, punta (de pie), ancho en la raíz, lado al que caen, largo lacio (×), cuánto se dobla en la raíz
    const PUAS = [
      [[548, 470], [497, 343], 72, -1, 2.0, 0.8], [[572, 400], [528, 312], 80, -1, 1.8, 0.7], [[618, 342], [592, 250], 78, -1, 1.5, 0.55],
      [[664, 308], [640, 222], 78, -1, 1.35, 0.5], [[722, 290], [800, 172], 96, 1, 1.45, 0.5], [[800, 276], [912, 184], 96, 1, 1.4, 0.5],
      [[872, 284], [976, 206], 92, 1, 1.35, 0.5], [[942, 302], [1070, 228], 90, 1, 1.4, 0.55], [[1002, 336], [1122, 290], 84, 1, 1.6, 0.65],
      [[1044, 384], [1128, 404], 74, 1, 1.8, 0.75], [[1062, 440], [1110, 512], 64, 1, 1.9, 0.8], [[1050, 500], [1082, 562], 52, 1, 1.6, 0.8],
      [[1012, 540], [1022, 612], 42, 1, 1.2, 0.8]
    ];
    const COL = { medio: "#8a4219", oscuro: "#3c1e0e", claro: "#c4703a", tinta: "#1e0e08" };
    const cubica = (a, b, c, d, u) => { const v = 1 - u; return { x: v*v*v*a.x + 3*v*v*u*b.x + 3*v*u*u*c.x + u*u*u*d.x, y: v*v*v*a.y + 3*v*v*u*b.y + 3*v*u*u*c.y + u*u*u*d.y }; };
    const dir = a => ({ x: Math.cos(a), y: Math.sin(a) });
    function pua(g, P, w, abajo, t, i, oscila) {
      const [r, tip, ancho, lado, lm, cb] = P;
      const Rq = { x: r[0], y: r[1] }, a0 = Math.atan2(tip[1] - r[1], tip[0] - r[0]), L = Math.hypot(tip[0] - r[0], tip[1] - r[1]);
      const d = difAng(a0, abajo - lado * 0.32);
      const sw = oscila * Math.sin(t * 5.3 + i * 1.7);
      const wa = w < 0 ? w : 1 - Math.pow(1 - Math.min(w, 1), 1.5), wl = clamp(w) * clamp(w);
      const aBase = a0 + d * cb * wa, aMed = a0 + d * lerp(cb, 1, 0.6) * wa + sw * 0.5 * wa, aTip = a0 + d * wa + sw * wa;
      const Lw = L * lerp(1, lm, wl);
      const P1 = { x: Rq.x + dir(aBase).x * Lw * 0.36, y: Rq.y + dir(aBase).y * Lw * 0.36 };
      const P2 = { x: P1.x + dir(aMed).x * Lw * 0.34, y: P1.y + dir(aMed).y * Lw * 0.34 };
      const P3 = { x: P2.x + dir(aTip).x * Lw * 0.36, y: P2.y + dir(aTip).y * Lw * 0.36 };
      const N = 12, izq = [], der = [], cen = [];
      for (let k = 0; k <= N; k++) {
        const u = k / N, q = cubica(Rq, P1, P2, P3, u), q2 = cubica(Rq, P1, P2, P3, Math.min(1, u + 0.02)), q1 = cubica(Rq, P1, P2, P3, Math.max(0, u - 0.02));
        const tx = q2.x - q1.x, ty = q2.y - q1.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        const wv = ancho * 0.5 * Math.pow(1 - u, 0.9) * (1 + 0.15 * Math.sin(u * 3.1)) * lerp(1, 0.78, clamp(w));
        izq.push({ x: q.x + nx * wv, y: q.y + ny * wv }); der.push({ x: q.x - nx * wv, y: q.y - ny * wv }); cen.push({ x: q.x + nx * wv * 0.25, y: q.y + ny * wv * 0.25 });
      }
      const forma = () => { g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath(); };
      forma(); g.fillStyle = COL.medio; g.fill();
      g.save(); forma(); g.clip();
      g.beginPath(); g.moveTo(cen[0].x, cen[0].y); for (const q of cen) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath();
      g.fillStyle = COL.oscuro; g.globalAlpha *= 0.85; g.fill(); g.globalAlpha /= 0.85;
      g.beginPath(); for (let k = 1; k < N * 0.7; k++) { const q = izq[k], c = cen[k]; const m = { x: lerp(q.x, c.x, 0.45), y: lerp(q.y, c.y, 0.45) }; if (k === 1) g.moveTo(m.x, m.y); else g.lineTo(m.x, m.y); }
      g.lineWidth = 9; g.strokeStyle = COL.claro; g.globalAlpha *= 0.8; g.stroke(); g.globalAlpha /= 0.8;
      g.restore();
      g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y);
      g.lineWidth = 5.5; g.lineJoin = "round"; g.strokeStyle = COL.tinta; g.stroke();
    }
    const ruta = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    const casquete = CUP.concat(FLEQUILLO).map(([x, y]) => ({ x, y }));
    function zonaBorrado(g) {
      g.beginPath(); ruta(g, CAJA); M2.curva(g, casquete, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); camino(g, PIEL); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
    }
    function puas(g, w, abajo, t, oscila) {
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); M2.curva(g, CUP.map(([x, y]) => ({ x, y })), false, 0.35);
      g.lineWidth = 16; g.strokeStyle = COL.oscuro; g.stroke(); g.lineWidth = 5; g.strokeStyle = COL.tinta; g.stroke();
      for (const i of [0, 1, 2, 3, 12, 11, 10, 9, 8, 7, 6, 5, 4]) pua(g, PUAS[i], w * (0.85 + 0.3 * hash(i + 3)), abajo, t, i, oscila);
      g.restore();
    }
    return { zonaBorrado, puas };
  })();

  let MATRIZ = null, fondo = null, fondoSilla = null;
  function capaG(g, t, est) {
    carrillos(g, est.mof);
    // verde (piel del retrato, sin los ojos; dentro de los ojos según lo cerrados que estén)
    if (est.verde > 0.004) {
      g.save();
      g.beginPath(); camino(g, PIEL_CAB); if (est.mof > 0.01) caminoMoflete(g, est.mof); g.clip();
      g.beginPath(); g.rect(380, 100, 900, 900); camino(g, OJO_D); camino(g, OJO_I);
      enverdece(g, est.verde, () => g.fill("evenodd"));
      g.restore();
      for (const [ojo, c] of [[OJO_D, est.cd], [OJO_I, est.ci]]) {
        const cc = Math.pow(clamp((c - 0.4) / 0.6), 1.5) * est.verde; if (cc < 0.004) continue;
        g.save(); g.beginPath(); camino(g, ojo); g.clip(); enverdece(g, cc, () => g.fillRect(700, 520, 260, 140)); g.restore();
      }
    }
    // pelo: se borran las púas del retrato repintando el fondo y se dibujan las púas que se marchitan
    if (est.wC > 0.002 && MATRIZ && fondoSilla) {
      g.save(); g.globalAlpha = est.wC;
      g.save(); PELO.zonaBorrado(g); g.setTransform(MATRIZ); g.drawImage(fondoSilla, -60, -60); g.restore();
      PELO.puas(g, est.w, est.abajo, t, est.oscila);
      g.restore();
    }
    lagrimas(g, t, est.lloro);
    equis(g, est.equis);
    lengua(g, t, est.lengua);
    sudor(g, est.sudor, t);
  }
  function cuelloVerde(g, k) {
    if (k < 0.004) return;
    g.save(); g.beginPath(); camino(g, PIEL_CUELLO); g.clip(); enverdece(g, k, () => g.fillRect(160, 210, 150, 120)); g.restore();
  }

  /* =====================================================================================
   * FONDO (una vez): quesería — pared, zócalo, suelo de barro, pizarra, cuadro, lámpara, estantería,
   * embutidos y mostrador. La silla aparte (se mueve al final).
   * ===================================================================================== */
  const MOS = { x0: 838, top: 342, frente: 356, base: 528 };
  const SILLA = { x: 192, suelo: 532 };
  const TAPA_FIN = { x: 892, y: 352 };
  function creaFondo(conSilla) {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 120;
    const g = c.getContext("2d"); g.translate(60, 60);
    g.lineJoin = "round"; g.lineCap = "round";
    // pared encalada
    const pa = g.createLinearGradient(0, -60, 0, 340); pa.addColorStop(0, "#d9c290"); pa.addColorStop(1, "#e6d1a4");
    g.fillStyle = pa; g.fillRect(-60, -60, W + 120, 400);
    g.fillStyle = "rgba(200,170,120,0.12)";
    for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(hash(i + 1) * (W + 100) - 50, hash(i + 50) * 330 - 40, 30 + 40 * hash(i + 9), 14 + 10 * hash(i + 3), hash(i + 7) * 3, 0, TAU); g.fill(); }
    // zócalo de madera verde
    g.fillStyle = "#2f5b45"; g.fillRect(-60, 330, W + 120, 128);
    g.fillStyle = "#244836"; g.fillRect(-60, 326, W + 120, 10);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, 326); g.lineTo(W + 60, 326); g.stroke();
    for (let x = -40; x < W + 40; x += 118) {
      g.fillStyle = "#376a51"; g.fillRect(x, 348, 96, 92);
      g.strokeStyle = "rgba(10,30,20,0.6)"; g.lineWidth = 2; g.strokeRect(x, 348, 96, 92);
      g.strokeStyle = "rgba(160,210,180,0.18)"; g.beginPath(); g.moveTo(x + 3, 437); g.lineTo(x + 3, 351); g.lineTo(x + 93, 351); g.stroke();
    }
    g.fillStyle = "#1f3d2e"; g.fillRect(-60, 450, W + 120, 8);
    // suelo de baldosas de barro (perspectiva)
    const Y0 = 456, VP = { x: 512, y: -260 };
    g.fillStyle = "#b65a33"; g.fillRect(-60, Y0, W + 120, H + 60 - Y0);
    const filas = [Y0, 470, 488, 511, 540, 576, 620, 670];
    const xEn = (X, y) => VP.x + (X - VP.x) * (y - VP.y) / (Y0 - VP.y);
    for (let r = 0; r < filas.length - 1; r++) for (let k = -16; k < 16; k++) {
      const X0 = 512 + k * 64, X1 = X0 + 64, ya = filas[r], yb = filas[r + 1];
      g.beginPath(); g.moveTo(xEn(X0, ya), ya); g.lineTo(xEn(X1, ya), ya); g.lineTo(xEn(X1, yb), yb); g.lineTo(xEn(X0, yb), yb); g.closePath();
      g.fillStyle = (r + k) % 2 ? "#c46b3e" : "#ad5530"; g.fill();
      g.fillStyle = "rgba(255,220,180,0.08)"; g.fill();
    }
    g.strokeStyle = "#7d3a1e"; g.lineWidth = 1.6;
    for (const y of filas) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let k = -16; k <= 16; k++) { const X = 512 + k * 64; g.beginPath(); g.moveTo(xEn(X, Y0), Y0); g.lineTo(xEn(X, H + 60), H + 60); g.stroke(); }
    g.fillStyle = "rgba(60,20,8,0.18)"; g.fillRect(-60, Y0, W + 120, 8);
    // pizarra (izquierda) con dibujitos de tiza, sin letras
    g.save(); g.translate(40, 112);
    g.fillStyle = "#7b4a26"; g.fillRect(-8, -8, 136, 146); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-8, -8, 136, 146);
    g.fillStyle = "#26332d"; g.fillRect(0, 0, 120, 130);
    g.strokeStyle = "rgba(240,240,230,0.85)"; g.lineWidth = 2; g.fillStyle = "rgba(240,240,230,0.85)";
    // cuña de queso con agujeros
    g.beginPath(); g.moveTo(14, 54); g.lineTo(70, 30); g.lineTo(70, 56); g.lineTo(14, 74); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(14, 54); g.lineTo(70, 56); g.stroke();
    for (const [x, y, r] of [[30, 64, 3], [48, 60, 4], [60, 66, 2.5], [56, 46, 3]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); }
    // cabeza de vaca
    g.beginPath(); g.ellipse(94, 40, 16, 18, 0, 0, TAU); g.stroke();
    g.beginPath(); g.ellipse(94, 54, 11, 7, 0, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(80, 28); g.quadraticCurveTo(72, 18, 76, 12); g.moveTo(108, 28); g.quadraticCurveTo(116, 18, 112, 12); g.stroke();
    g.beginPath(); g.arc(88, 38, 2, 0, TAU); g.arc(100, 38, 2, 0, TAU); g.fill();
    // estrellitas y una carita feliz
    for (const [x, y] of [[20, 20], [52, 14], [108, 92]]) { g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU * 2 / 5; g.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); } g.closePath(); g.stroke(); }
    g.beginPath(); g.arc(40, 104, 13, 0, TAU); g.stroke(); g.beginPath(); g.arc(40, 106, 7, 0.2, Math.PI - 0.2); g.stroke();
    g.beginPath(); g.arc(35, 100, 1.6, 0, TAU); g.arc(45, 100, 1.6, 0, TAU); g.fill();
    g.fillStyle = "#d9d2c0"; g.fillRect(84, 126, 20, 4);
    g.restore();
    // cuadrito: vaca en el prado
    g.save(); g.translate(452, 118);
    g.fillStyle = "#b8893e"; g.fillRect(-6, -6, 112, 84); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-6, -6, 112, 84);
    const ci = g.createLinearGradient(0, 0, 0, 72); ci.addColorStop(0, "#8ec9e8"); ci.addColorStop(1, "#d9eef3"); g.fillStyle = ci; g.fillRect(0, 0, 100, 72);
    g.fillStyle = "#7dbb5a"; g.beginPath(); g.moveTo(0, 50); g.quadraticCurveTo(40, 36, 100, 46); g.lineTo(100, 72); g.lineTo(0, 72); g.closePath(); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(50, 52, 18, 9, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.fillRect(36, 58, 3, 8); g.fillRect(44, 59, 3, 7); g.fillRect(56, 59, 3, 7); g.fillRect(63, 58, 3, 8);
    g.beginPath(); g.ellipse(70, 46, 7, 6, 0.3, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#1a1a1a"; g.beginPath(); g.ellipse(46, 50, 5, 4, 0, 0, TAU); g.ellipse(57, 54, 4, 3, 0, 0, TAU); g.fill();
    g.fillStyle = "#f2c94c"; g.beginPath(); g.arc(84, 14, 7, 0, TAU); g.fill();
    g.restore();
    // estantería de quesos (derecha) y embutidos colgados
    g.save();
    g.fillStyle = "#6b4024"; g.fillRect(MOS.x0 - 4, 70, W + 80 - MOS.x0, 264);
    g.fillStyle = "#4d2c17"; g.fillRect(MOS.x0 + 6, 80, W + 60 - MOS.x0, 250);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(MOS.x0 - 4, 70, W + 80 - MOS.x0, 264);
    for (const ys of [150, 230, 310]) {
      g.fillStyle = "#8a5a33"; g.fillRect(MOS.x0 - 4, ys, W + 80 - MOS.x0, 9); g.strokeRect(MOS.x0 - 4, ys, W + 80 - MOS.x0, 9);
      let x = MOS.x0 + 12, i = 0;
      while (x < W + 40) {
        const tipo = (ys / 10 + i) % 4, h = 18 + 10 * hash(ys + i), w = 30 + 16 * hash(ys * 3 + i);
        const col = ["#f2c14e", "#e88a2a", "#f5e7c4", "#d84a3a"][tipo];
        g.fillStyle = col; g.beginPath(); g.roundRect(x, ys - h, w, h, 6); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
        g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(x + 4, ys - h + 3, w - 8, 3);
        if (tipo === 2) { g.strokeStyle = "#5e8f9a"; g.lineWidth = 1.2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 6 + k * 8, ys - h + 6); g.lineTo(x + 10 + k * 8, ys - 4); g.stroke(); } }
        if (tipo === 0) { g.fillStyle = "#d8a232"; for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(x + 9 + k * 12, ys - h / 2, 2.5, 0, TAU); g.fill(); } }
        x += w + 6; i++;
      }
    }
    // barra de los embutidos
    g.strokeStyle = "#3a2414"; g.lineWidth = 5; g.beginPath(); g.moveTo(MOS.x0 + 4, 40); g.lineTo(W + 60, 40); g.stroke();
    for (let i = 0; i < 6; i++) {
      const x = MOS.x0 + 22 + i * 30, L = 56 + 26 * hash(i + 31), w = 9 + 4 * hash(i + 12);
      g.strokeStyle = "#cbb88e"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 50); g.stroke();
      g.fillStyle = i % 2 ? "#7a2f1d" : "#8e3a22"; g.beginPath(); g.roundRect(x - w / 2, 50, w, L, w / 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
      g.fillStyle = "rgba(255,240,220,0.45)"; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x - w / 4 + hash(i * 9 + k) * w / 2, 58 + k * L / 4.5, 1.3, 0, TAU); g.fill(); }
      g.strokeStyle = "rgba(40,10,5,0.5)"; g.lineWidth = 1; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - w / 2 + 1, 50 + k * L / 4); g.lineTo(x + w / 2 - 1, 50 + k * L / 4 + 2); g.stroke(); }
    }
    g.restore();
    // mostrador (derecha)
    g.save();
    g.fillStyle = "#b8773e"; g.beginPath(); g.moveTo(MOS.x0, MOS.top); g.lineTo(W + 60, MOS.top); g.lineTo(W + 60, MOS.frente); g.lineTo(MOS.x0 - 8, MOS.frente); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    const fr = g.createLinearGradient(0, MOS.frente, 0, MOS.base); fr.addColorStop(0, "#8f5a2c"); fr.addColorStop(1, "#6f4220");
    g.fillStyle = fr; g.fillRect(MOS.x0 - 8, MOS.frente, W + 70 - MOS.x0, MOS.base - MOS.frente); g.strokeRect(MOS.x0 - 8, MOS.frente, W + 70 - MOS.x0, MOS.base - MOS.frente);
    for (let x = MOS.x0 + 6; x < W + 40; x += 64) { g.strokeStyle = "rgba(30,15,5,0.6)"; g.lineWidth = 2; g.strokeRect(x, MOS.frente + 16, 50, MOS.base - MOS.frente - 40);
      g.strokeStyle = "rgba(255,200,150,0.18)"; g.beginPath(); g.moveTo(x + 2, MOS.base - 26); g.lineTo(x + 2, MOS.frente + 18); g.lineTo(x + 48, MOS.frente + 18); g.stroke(); }
    g.fillStyle = "#3f2410"; g.fillRect(MOS.x0 - 8, MOS.base - 10, W + 70 - MOS.x0, 10);
    // encima: tabla con una rueda de queso cortada y un cuchillo
    g.fillStyle = "#c99a5e"; g.beginPath(); g.ellipse(980, MOS.top + 4, 52, 9, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "#f2c14e"; g.beginPath(); g.moveTo(940, MOS.top); g.lineTo(940, MOS.top - 24); g.ellipse(980, MOS.top - 24, 40, 8, 0, Math.PI, Math.PI * 1.75); g.lineTo(980, MOS.top - 24); g.lineTo(980, MOS.top); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f7d97a"; g.beginPath(); g.moveTo(980, MOS.top - 24); g.lineTo(1008, MOS.top - 30); g.lineTo(1008, MOS.top - 6); g.lineTo(980, MOS.top); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d8a232"; g.beginPath(); g.arc(992, MOS.top - 14, 2.5, 0, TAU); g.arc(1000, MOS.top - 22, 2, 0, TAU); g.fill();
    g.save(); g.translate(948, MOS.top + 4); g.rotate(-0.12); g.fillStyle = "#d9dde2"; g.beginPath(); g.moveTo(0, 0); g.lineTo(-40, -3); g.quadraticCurveTo(-44, 2, -40, 4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a2a14"; g.fillRect(0, -2.5, 18, 6); g.strokeRect(0, -2.5, 18, 6); g.restore();
    g.restore();
    // lámpara de esmalte colgando
    g.save(); g.strokeStyle = "#222"; g.lineWidth = 2; g.beginPath(); g.moveTo(512, -60); g.lineTo(512, 46); g.stroke();
    g.fillStyle = "#2f6b55"; g.beginPath(); g.moveTo(498, 46); g.lineTo(526, 46); g.lineTo(552, 76); g.lineTo(472, 76); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#fff6d0"; g.beginPath(); g.ellipse(512, 78, 14, 6, 0, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.moveTo(502, 50); g.lineTo(508, 50); g.lineTo(490, 72); g.lineTo(482, 72); g.closePath(); g.fill();
    g.restore();
    if (conSilla) dibSilla(g, 0, 1, 0);
    return c;
  }

  /* ---------- silla de café de madera curvada (vista de tres cuartos, mirando a la derecha) ---------- */
  function dibSilla(g, inclina, gx, salto) {
    const MAD = "#5a2f17", MAD_L = "#8a5230";
    g.save(); g.translate(SILLA.x, SILLA.suelo - salto);
    g.translate(-44, 0); g.rotate(-inclina); g.translate(44, 0);
    g.scale(gx, 1);
    g.lineCap = "round"; g.lineJoin = "round";
    const palo = (pts, w, col) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.lineWidth = w + 3.2; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
    // patas de atrás (la lejana más oscura), aro y patas de delante
    palo([[-22, -106], [-28, -6]], 5, "#4a2612"); palo([[38, -104], [50, -6]], 5, "#4a2612");
    g.beginPath(); g.ellipse(4, -40, 42, 9, 0, 0, TAU); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 4; g.strokeStyle = MAD; g.stroke();
    palo([[-36, -96], [-44, 0]], 6, MAD); palo([[30, -94], [38, 0]], 6, MAD);
    // respaldo: aro alargado, un poco echado hacia atrás
    g.save(); g.translate(-46, -184); g.rotate(-0.14);
    g.beginPath(); g.ellipse(0, 0, 13, 80, 0, 0, TAU); g.lineWidth = 9.5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 6; g.strokeStyle = MAD; g.stroke();
    g.lineWidth = 2; g.strokeStyle = MAD_L; g.beginPath(); g.ellipse(0, 0, 13, 80, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
    g.beginPath(); g.ellipse(2, 8, 6, 52, 0, 0, TAU); g.lineWidth = 6.5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3.5; g.strokeStyle = MAD; g.stroke();
    g.restore();
    palo([[-38, -100], [-48, -114]], 6, MAD); palo([[-24, -108], [-34, -118]], 5, "#4a2612");
    // asiento de rejilla
    const asiento = () => { g.beginPath(); g.ellipse(0, -100, 46, 11, 0, 0, TAU); };
    g.beginPath(); g.moveTo(46, -100); g.ellipse(0, -100, 46, 11, 0, 0, Math.PI); g.lineTo(-46, -94); g.ellipse(0, -94, 46, 11, 0, Math.PI, 0, true); g.closePath();
    g.fillStyle = MAD; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    asiento(); g.fillStyle = "#d8b56f"; g.fill();
    g.save(); asiento(); g.clip(); g.strokeStyle = "rgba(140,100,40,0.55)"; g.lineWidth = 1;
    for (let k = -50; k < 50; k += 6) { g.beginPath(); g.moveTo(k, -114); g.lineTo(k + 14, -86); g.moveTo(k + 14, -114); g.lineTo(k, -86); g.stroke(); }
    g.restore();
    asiento(); g.lineWidth = 3.5; g.strokeStyle = MAD; g.stroke(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  // la silla al final: gira con el rebufo y se balancea
  function silla(t) {
    const v = t - T.corre;
    if (v <= 0) return { inclina: 0, gx: 1, salto: 0 };
    const giro = TAU * 2 * salida(clamp(v / 0.9));
    const inclina = 0.12 * Math.exp(-v * 3) * Math.sin(v * 14) * (v > 0.15 ? 1 : 0) + 0.08 * campana(v, 0, 0.3);
    const salto = 8 * campana(v, 0, 0.22);
    return { inclina, gx: Math.cos(giro) * 0.96 + 0.04 * Math.sign(Math.cos(giro) || 1), salto };
  }

  /* =====================================================================================
   * EFECTOS: tufo verde, moscas, corazones, olfateos, polvo, velocidad
   * ===================================================================================== */
  const PERIODO = 0.085, VIDA = 1.45;
  const emisores = new Map();
  function emisor(i) {
    if (emisores.has(i)) return emisores.get(i);
    const tb = i * PERIODO, P = pose(tb), q = cajaArriba(P.d);
    emisores.set(i, q); return q;
  }
  const hedorK = t => tramo(t, T.pop - 0.04, T.pop + 0.1);
  function lineaTufo(g, x0, y0, L, amp, ph, a, grosor = 1) {
    g.beginPath();
    for (let k = 0; k <= 10; k++) { const u = k / 10, y = y0 - L * u, x = x0 + amp * Math.sin(u * 5.2 + ph); if (k) g.lineTo(x, y); else g.moveTo(x, y); }
    g.globalAlpha = a * 0.55; g.lineWidth = 6 * grosor; g.strokeStyle = "#2f5a17"; g.stroke();
    g.globalAlpha = a; g.lineWidth = 3.2 * grosor; g.strokeStyle = "#9ad04a"; g.stroke();
  }
  function tufo(g, t) {
    const k0 = hedorK(t); if (k0 <= 0) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const n1 = Math.floor(t / PERIODO), n0 = Math.ceil((T.pop - 0.04) / PERIODO);
    for (let i = n1; i >= Math.max(n0, n1 - Math.ceil(VIDA / PERIODO)); i--) {
      const v = t - i * PERIODO; if (v < 0 || v > VIDA) continue;
      const e = emisor(i), h1 = hash(i * 7.31), h2 = hash(i * 3.17 + 5);
      const u = v / VIDA, a = k0 * Math.min(1, v / 0.18) * Math.pow(1 - u, 1.3) * 0.95;
      const x0 = e.x + (h1 - 0.5) * 30 + 10 * Math.sin(v * 2.4 + h2 * 6) * u, y0 = e.y - 4 - v * (30 + 24 * h2);
      lineaTufo(g, x0, y0, 18 + 14 * h2, 4 + 3 * h1, v * 6 + h1 * 6, a, 0.85 + 0.3 * h2);
    }
    // ¡plop!: estallido verde al abrir
    const pv = t - T.pop;
    if (pv > 0 && pv < 0.7) {
      const P = pose(T.pop), c = cajaArriba(P.d), k = pv / 0.7;
      for (let j = 0; j < 7; j++) {
        const a = -Math.PI / 2 + (j - 3) * 0.42, r = 14 + 70 * salida(k);
        g.globalAlpha = 0.5 * (1 - k); g.fillStyle = "#a8d65a";
        g.beginPath(); g.arc(c.x + Math.cos(a) * r * 0.9, c.y - 6 + Math.sin(a) * r * 0.7, 9 + 12 * k, 0, TAU); g.fill();
      }
      g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 3;
      for (let j = 0; j < 6; j++) { const a = -Math.PI / 2 + (j - 2.5) * 0.5, r0 = 18 + 30 * salida(k), r1 = r0 + 12 * (1 - k);
        g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y - 10 + Math.sin(a) * r0 * 0.8); g.lineTo(c.x + Math.cos(a) * r1, c.y - 10 + Math.sin(a) * r1 * 0.8); g.stroke(); }
    }
    g.restore();
  }
  // corriente de tufo que entra por la nariz de Guillermo
  function chorroNariz(g, t, A, Bp, k) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    const dx = Bp.x - A.x, dy = Bp.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    for (let j = 0; j < 3; j++) {
      g.beginPath();
      for (let s = 0; s <= 16; s++) { const u = s / 16, amp = (7 + 3 * j) * Math.sin(Math.PI * u) * (1 - 0.6 * u);
        const o = amp * Math.sin(u * 9 - t * 14 + j * 2.1) + (j - 1) * 6 * (1 - u);
        const x = A.x + dx * u + nx * o, y = A.y + dy * u + ny * o; if (s) g.lineTo(x, y); else g.moveTo(x, y); }
      g.globalAlpha = 0.5 * k; g.lineWidth = 6; g.strokeStyle = "#2f5a17"; g.stroke();
      g.globalAlpha = k; g.lineWidth = 3; g.strokeStyle = "#9ad04a"; g.stroke();
    }
    g.restore();
  }
  // nube verde que envuelve la cabeza tras el golpe
  function nubeCabeza(g, t, c, k) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    for (let j = 0; j < 2; j++) {
      const a0 = t * (2.4 + j) + j * 2, rx = 78 + 14 * j, ry = 26 + 6 * j;
      g.beginPath();
      for (let s = 0; s <= 40; s++) { const a = a0 + s / 40 * TAU * 0.8, w = 1 + 0.12 * Math.sin(a * 5 + t * 8);
        const x = c.x + Math.cos(a) * rx * w, y = c.y - 34 + j * 26 + Math.sin(a) * ry * w; if (s) g.lineTo(x, y); else g.moveTo(x, y); }
      g.globalAlpha = 0.5 * k; g.lineWidth = 6; g.strokeStyle = "#2f5a17"; g.stroke();
      g.globalAlpha = k; g.lineWidth = 3; g.strokeStyle = "#9ad04a"; g.stroke();
    }
    g.restore();
  }
  // olfateo: rayitas que entran en la nariz
  function olfateo(g, t, n, dir, k) {
    if (k <= 0.01) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 2.4;
    for (let j = 0; j < 3; j++) {
      const ph = ((t * 3.2 + j / 3) % 1), d = 34 * (1 - ph) + 8, a = Math.PI / 2 + (j - 1) * 0.5 - dir * 0.6;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(n.x + Math.cos(a) * d, n.y + Math.sin(a) * d); g.lineTo(n.x + Math.cos(a) * (d - 9), n.y + Math.sin(a) * (d - 9)); g.stroke();
    }
    g.restore();
  }
  // mosca: vuelo en lazo con su estela punteada
  function mosca(g, t, c, R0, ph, k) {
    if (k <= 0.01) return;
    const pos = tt => ({ x: c.x + R0 * Math.cos(tt * 6.3 + ph) + 6 * Math.sin(tt * 17 + ph), y: c.y + R0 * 0.45 * Math.sin(tt * 8.1 + ph) + 4 * Math.cos(tt * 13 + ph) });
    g.save(); g.globalAlpha = k;
    g.fillStyle = "rgba(20,20,20,0.5)";
    for (let j = 1; j <= 4; j++) { const q = pos(t - j * 0.035); g.beginPath(); g.arc(q.x, q.y, 1.1, 0, TAU); g.fill(); }
    const q = pos(t), q2 = pos(t + 0.01), a = Math.atan2(q2.y - q.y, q2.x - q.x);
    g.translate(q.x, q.y); g.rotate(a);
    const ala = 0.6 + 0.4 * Math.sin(t * 90 + ph);
    g.fillStyle = "rgba(220,235,255,0.85)"; g.strokeStyle = "rgba(20,20,30,0.7)"; g.lineWidth = 0.8;
    g.beginPath(); g.ellipse(-1, -3.5 * ala, 3.2, 2 * ala, -0.4, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(-1, 3.5 * ala, 3.2, 2 * ala, 0.4, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#1b1b20"; g.beginPath(); g.ellipse(0, 0, 3.6, 2.4, 0, 0, TAU); g.fill();
    g.fillStyle = "#a33"; g.beginPath(); g.arc(3, -1, 1, 0, TAU); g.arc(3, 1, 1, 0, TAU); g.fill();
    g.restore();
  }
  function corazon(g, x, y, s, a) {
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
    g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-12, -2, -6, -12, 0, -5); g.bezierCurveTo(6, -12, 12, -2, 0, 6); g.closePath();
    g.fillStyle = "#e8434f"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6 / s; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-4, -4, 2, 1.3, -0.5, 0, TAU); g.fill();
    g.restore();
  }
  function corazones(g, t, c, t0, t1) {
    for (let j = 0; j < 3; j++) {
      const tb = t0 + j * (t1 - t0) / 3, v = t - tb; if (v < 0 || v > 1.1) continue;
      const u = v / 1.1;
      corazon(g, c.x + (j - 1) * 26 + 8 * Math.sin(v * 5 + j), c.y - 70 - 60 * u, 0.9 + 0.3 * salida(Math.min(1, u * 3)), Math.sin(Math.PI * u));
    }
  }
  function polvo(g, t, t0, x, y, n, ancho, dur = 0.9) {
    const v = t - t0; if (v < 0 || v > dur) return;
    g.save();
    for (let i = 0; i < n; i++) {
      const h = hash(i * 13.7 + t0), s = (i / (n - 1) - 0.5) * 2, k = v / dur;
      const px = x + s * ancho * (0.4 + 0.8 * salida(k)), py = y - 6 - 20 * salida(k) * (0.5 + h), r = (8 + 10 * h) * (0.6 + 0.8 * salida(k));
      g.globalAlpha = 0.5 * (1 - k); g.fillStyle = "#efdcc0"; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    g.restore();
  }
  function velocidad(g, x, y, k) {
    if (k < 0.02) return;
    g.save(); g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const yy = y - 150 + i * 46 + 10 * hash(i + 3), L = 50 + 60 * hash(i + 9);
      g.globalAlpha = k * (0.5 + 0.5 * hash(i + 5)); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 50 + 20 * hash(i), yy); g.lineTo(x + 50 + L, yy); g.stroke(); }
    g.restore();
  }
  // tapa volando hasta el mostrador (sale de la mano en T.suelta)
  let TAPA0 = null;
  function tapaVuelo(t) {
    if (!TAPA0) { const P = pose(T.suelta - 0.001), m = P.d.manoCerca, w = B.aPantalla(P.d, m); TAPA0 = { x: w.x + LID_OFF.x, y: w.y + LID_OFF.y }; }
    const k = fase(t, T.suelta, T.aterriza);
    const x = lerp(TAPA0.x, TAPA_FIN.x, k), y = lerp(TAPA0.y, TAPA_FIN.y, k) - 150 * Math.sin(Math.PI * k);
    const v = t - T.aterriza;
    const bote = v > 0 ? 9 * Math.exp(-v * 9) * Math.abs(Math.sin(v * 15)) : 0;
    const vuelta = v > 0 ? 1 : Math.cos(TAU * 2 * k);
    const inc = v > 0 ? 0.2 * Math.exp(-v * 5) * Math.sin(v * 22) : 0.6 * Math.sin(TAU * k);
    return { x, y: y - bote, vuelta, inc };
  }

  /* ---------- luz y cámara ---------- */
  function luces(g) {
    g.save();
    g.globalCompositeOperation = "lighter";
    const la = g.createRadialGradient(512, 90, 10, 512, 160, 420); la.addColorStop(0, "rgba(255,214,140,0.12)"); la.addColorStop(1, "rgba(255,214,140,0)");
    g.fillStyle = la; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "multiply";
    const v = g.createRadialGradient(512, 300, 330, 512, 300, 720); v.addColorStop(0, "rgb(255,255,255)"); v.addColorStop(1, "rgb(150,130,120)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    g.restore();
  }
  function camara(t) {
    const z1 = dentro(t, T.ofrece0, T.huele0, T.atras0 + 0.2, T.atras0 + 0.9);
    const z2 = tramo(t, T.encoge0 - 0.3, T.come0 + 0.2);
    return { k: 1 + 0.12 * z1 + 0.12 * z2, x: 512 + (455 - 512) * z1 + (430 - 512) * z2, y: 300 - 10 * z1 - 10 * z2 };
  }

  function dibujaG(g, pg, t) {
    const M = pg.M;
    if (Math.abs(M.sx - 1) < 1e-4) { G.dibujar(g, pg, t); return; }
    g.save(); g.translate(pg.x, M.o.y); g.scale(M.sx, 1); g.translate(-pg.x, -M.o.y); G.dibujar(g, pg, t); g.restore();
  }

  class Queso extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !B.listo()) return;
      if (!fondo) { fondo = creaFondo(false); fondoSilla = creaFondo(true); }
      const P = pose(t), pg = P.g, pd = P.d;
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      const sl = silla(t), quieta = sl.inclina === 0 && sl.gx === 1 && sl.salto === 0;
      g.drawImage(quieta ? fondoSilla : fondo, -60, -60);
      if (!quieta) dibSilla(g, sl.inclina, sl.gx, sl.salto);
      // tapa en el mostrador
      if (t >= T.aterriza) { const tp = tapaVuelo(t); g.save(); g.translate(tp.x, tp.y); g.rotate(tp.inc); dibTapa(g, 1); g.restore(); }
      // sombras
      g.save(); g.fillStyle = "rgba(40,15,5,0.28)";
      if (t < T.fuera) { const sx = pg.M.sx < 0 ? pg.x : pg.x; g.beginPath(); g.ellipse(sx + (t > T.sienta && t < T.despierta ? 40 : 4), SUELO + 2, 62, 7, 0, 0, TAU); g.fill(); }
      g.beginPath(); g.ellipse(pd.x - 4, SUELO + 2, 66, 7, 0, 0, TAU); g.fill();
      g.restore();
      // personajes: Guillermo detrás (su capa repinta el fondo), Gabacho delante
      dibujaG(g, pg, t);
      polvo(g, t, T.aterrizaG, XAT, SUELO + 2, 5, 50, 0.6);
      polvo(g, t, T.corre - 0.04, XAT + 10, SUELO + 4, 9, 70, 1.3);
      B.dibujar(g, pd, t);
      // tufo, moscas, chorro, nube
      tufo(g, t);
      const ca = cajaArriba(pd), cabG = G.aPantalla(pg, G.centroCabeza(pg));
      const kMosca = tramo(t, T.pop, T.pop + 0.4);
      const cerca = { x: ca.x, y: ca.y - 26 };
      mosca(g, t, cerca, 26, 0, kMosca);
      // la segunda mosca: con la caja; con Guillermo desmayado le ronda la cabeza; al despertar, huye
      const aG = dentro(t, T.sentado + 0.1, T.sentado + 0.6, T.despierta, T.despierta + 0.01);
      const huye = fase(t, T.despierta, T.despierta + 0.6);
      const c2 = mezcla({ x: ca.x, y: ca.y - 34 }, { x: cabG.x + 10, y: cabG.y - 92 }, aG);
      if (huye > 0) { c2.x += 500 * huye * huye; c2.y -= 300 * huye; }
      mosca(g, t, c2, lerp(32, 46, aG), 2.1, kMosca * (1 - fase(t, T.despierta + 0.4, T.despierta + 0.6)));
      const nG = narizG(pg);
      chorroNariz(g, t, { x: ca.x - 4, y: ca.y - 8 }, { x: nG.x - 2, y: nG.y + 4 }, dentro(t, T.huele0 + 0.02, T.huele0 + 0.15, T.golpe - 0.05, T.golpe + 0.05));
      nubeCabeza(g, t, cabG, dentro(t, T.golpe, T.golpe + 0.12, T.atras0 + 0.2, T.atras0 + 0.7));
      if (t > T.golpe && t < T.golpe + 0.5) {          // ¡zas!: puf verde en la nariz
        const k = (t - T.golpe) / 0.5;
        g.save(); g.globalAlpha = 0.55 * (1 - k) * clamp(k * 6); g.fillStyle = "#a8d65a";
        for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + 0.3; g.beginPath(); g.arc(nG.x + Math.cos(a) * 30 * salida(k), nG.y + Math.sin(a) * 22 * salida(k), 8 + 10 * k, 0, TAU); g.fill(); }
        g.restore();
      }
      // olfateos
      olfateo(g, t, narizB(pd), 1, dentro(t, T.aspira0, T.aspira0 + 0.08, T.aspira1 - 0.1, T.aspira1));
      olfateo(g, t, nG, -1, dentro(t, T.huele0, T.huele0 + 0.08, T.golpe - 0.1, T.golpe));
      // trocito bajo la nariz: hilillos de tufo
      if (t > T.agita0 - 0.1 && t < T.despierta + 0.1) {
        const m = pd.manoLejos, q = B.aPantalla(pd, { x: m.x + rot(PINZA_PT, m.mu + Math.PI / 2).x * B.JK, y: m.y + rot(PINZA_PT, m.mu + Math.PI / 2).y * B.JK });
        chorroNariz(g, t, q, { x: nG.x, y: nG.y + 4 }, 0.8 * dentro(t, T.agita0 - 0.1, T.agita0 + 0.1, T.despierta - 0.05, T.despierta + 0.05));
      }
      // trocito de queso en la pinza; al final cae en la boca
      if (t >= T.pellizca0 + 0.08 && t < T.bocado + 0.12) {
        const pinza = tt => { const P2 = tt === t ? pd : pose(tt).d; return B.aPantalla(P2, pinzaHoja(B, P2.manoLejos)); };
        let q = pinza(Math.min(t, T.bocado));
        if (t > T.bocado) { const bo = enPant(pd, B.boca(pd)), k = (t - T.bocado) / 0.12; q = { x: lerp(q.x, bo.x - 2, k), y: lerp(q.y, bo.y, k * k) }; }
        g.save(); g.translate(q.x, q.y + 3); g.scale(1.25, 1.25); g.rotate(0.3 + (t > T.bocado ? 4 * (t - T.bocado) : 0)); dibTrocito(g); g.restore();
      }
      // corazones (éxtasis y bocado)
      const cabB = B.aPantalla(pd, B.centroCabeza(pd));
      corazones(g, t, cabB, T.aspira1 + 0.05, T.extasis1 - 0.2);
      corazones(g, t, cabB, T.bocado + 0.1, T.mastica1 - 0.1);
      // ¡despierta!: rayitas de susto
      const kd = fase(t, T.despierta, T.despierta + 0.35);
      if (kd > 0 && kd < 1) {
        g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 3.2; g.globalAlpha = clamp(kd / 0.2) * (1 - kd * kd);
        for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.9 / 8 * 1.05, r = 95 + 22 * salida(kd), L = 14 * (1 - 0.4 * kd);
          g.beginPath(); g.moveTo(cabG.x + Math.cos(a) * r, cabG.y + Math.sin(a) * r); g.lineTo(cabG.x + Math.cos(a) * (r + L), cabG.y + Math.sin(a) * (r + L)); g.stroke(); }
        g.restore();
      }
      velocidad(g, pg.x, pg.M.o.y, dentro(t, T.corre, T.corre + 0.06, T.fuera - 0.1, T.fuera + 0.15));
      // tapa volando
      if (t >= T.suelta && t < T.aterriza) { const tp = tapaVuelo(t); g.save(); g.translate(tp.x, tp.y); g.rotate(tp.inc); dibTapa(g, tp.vuelta); g.restore(); }
      g.restore();
      luces(g);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00074", nombre: "Guillermo y Gabacho · El queso", crear: () => new Queso() });
  window.__A2D_00074 = { pose, T, DUR };
})();
