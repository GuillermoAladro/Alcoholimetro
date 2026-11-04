"use strict";
/* 00114.2 · Guillermo y Rodri · La broma del cubo
 *
 * Negro → el pasillo de atrás del bar, de noche: pared de yeso con humedades y alicatado verde hasta
 * media altura, una tubería con sus abrazaderas, una bombilla colgando, un cuadro de luces, un
 * extintor, un perchero con un delantal y, en medio, la puerta del almacén entornada hacia el
 * pasillo (dentro, oscuro). A la izquierda, una torre de cajas de botellas; junto a la puerta, un
 * barril; delante de la hoja, una silla de madera con un cubo de agua encima.
 * Guillermo mira la puerta, mira a cámara con cara de pillo y se frota las manos entre risitas →
 * coge el cubo por el asa, se sube a la silla, se lo pasa a la palma y lo deja en equilibrio sobre el
 * canto de la puerta (se bambolea… y se queda) → baja de la silla y se va de puntillas a esconderse
 * detrás de las cajas; asoma la cabeza tapándose la risa → del almacén sale Rodri, silbando, con las
 * manos en los bolsillos; pasa justo por debajo del cubo… y se le ha desatado el cordón: sube el pie
 * al barril para atárselo y, al agacharse, le da a la puerta con el trasero. La puerta cruje, el cubo
 * se tambalea y salpica (una gota le cae a Rodri en la cabeza, que ni se entera); Guillermo se tapa
 * los ojos… el cubo se queda. Rodri se ata el cordón, se va silbando hacia la derecha y se queda allí
 * de espaldas → Guillermo, extrañado, sale de su escondite, va hasta la puerta, mira el cubo con la
 * cabeza echada atrás y le da un toquecito a la puerta con el dedo: cruje, el cubo se tambalea, se
 * vuelca y le cae en la cabeza boca abajo, ¡clonc!: el agua le empapa entero y se le hace un charco a
 * los pies → Rodri se da la vuelta del susto y se parte de risa señalándole → Guillermo levanta el
 * borde del cubo con la mano y asoma un ojo a cámara, chorreando; Rodri guiña un ojo → negro.
 *
 * Sin textos. El cubo, la puerta, la silla, el barril y las cajas son atrezo de la escena. Los dos
 * personajes se dibujan con p.espejo = false y un factor horizontal fx alrededor de su pelvis (−1 mira
 * a la izquierda; |fx| < 1 es media vuelta aplastada). El cubo sobre la cabeza va en p.capaCabeza
 * (coordenadas del retrato) y Guillermo empapado se pinta en un lienzo aparte (se le borran las púas
 * bajo el cubo y se le oscurece la ropa sin tocar el fondo). Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, mezcla, ruido, hash, campana } = M2;
  const G = Guillermo, RO = Rodri;
  const DUR = 14.85, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

  const T = {
    // Guillermo prepara la broma
    mira: 0.45, camara: 0.95, frota0: 1.08, frota1: 1.85,
    acerca0: 1.84, coge0: 2.04, coge1: 2.26, alza1: 2.48,
    pieA0: 2.52, pieA1: 2.75, empuja0: 2.67, empuja1: 2.98, pieB0: 2.85, pieB1: 3.06,
    sube0: 3.1, sube1: 3.3, ayuda0: 3.2, ayuda1: 3.38, cambia0: 3.36, cambia1: 3.5, eleva1: 3.86, sueltaAyuda: 3.66,
    retira0: 3.98, retira1: 4.2, guinoG: 4.06,
    baja0: 4.26, bajaA: 4.42, baja1: 4.6, gira1a: 4.6, gira1b: 4.8,
    punt0: 4.8, punt1: 5.6, gira2a: 5.58, gira2b: 5.8, agacha1: 5.9,
    risita0: 6.0, risita1: 6.75,
    susto: 7.32, tapa0: 7.38, tapa1: 8.0, entre: 7.72, alivio: 8.12,
    sale0: 8.6, sale1: 8.95, rasca0: 8.95, rasca1: 9.25,
    anda0: 9.1, anda1: 10.4, gira3a: 10.4, gira3b: 10.58,
    arriba0: 10.58, arriba1: 10.82, dedo0: 10.84, toque: 10.98, dedo1: 11.12,
    vuelca: 11.3, cae: 11.52,
    borde0: 12.5, borde1: 12.95, parpG: 13.4,
    // Rodri
    silba0: 5.2, rSale0: 5.45, rSale1: 6.55, cordon: 6.62, pie0: 6.85, pie1: 7.12,
    dobla0: 7.12, golpe: 7.3, ata0: 7.38, lazo: 8.05, ata1: 8.2, gota: 7.62, end0: 8.22, end1: 8.55,
    rAnda0: 8.55, rAnda1: 9.8, rGira0: 11.72, rGira1: 11.95, risa0: 12.0, risa1: 13.35, camR: 13.45, guinoR: 13.62,
    fin: 14.0
  };

  /* =====================================================================================
   * UTILIDADES
   * ===================================================================================== */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md ?? ix, anular: an ?? ix, menique: me ?? ix });
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const PUNO = D5(0, 0), PALMA = D5(0.85, 1), AGARRA = D5(0.3, 0.12), FLOJA = D5(0.55, 0.6, 0.55, 0.5, 0.45),
    GARRA = D5(0.45, 0.35, 0.4, 0.4, 0.45), INDICE = D5(0.1, 1, 0, 0, 0), SOSTIENE = D5(0.9, 0.85, 0.85, 0.85, 0.8),
    PINZA = D5(0.55, 0.45, 0.2, 0.1, 0.1);

  const BASE = { mx: 0.85, my: 0, c: 0.15, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.2,
    lengua: 0, esp: 0, mof: 0, rub: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: clamp(e.mx, -1, 1), y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * ESCENARIO
   * ===================================================================================== */
  const FW = 492, FT = 146, XL = 548, XR = 708, WD = XR - XL, H0 = 262;   // pared, puerta (hueco) y horizonte
  const S = y => 0.246 + 0.00036 * (y - 552);                            // escala según la profundidad (y del suelo)
  const SREF = 0.24;                                                     // escala de referencia del cubo
  const CHX = 524, CHY = 550, SEAT = 92;                                 // silla
  const BX = 726, BY = 522, BH = 100;                                    // barril
  const CJ = { x0: 150, x1: 286, y: 592, alto: 68, n: 4 };                // cajas de botellas (primer término)
  const proy = (y, dz) => H0 + (y - H0) * (1 + dz / 330);                // un punto que se acerca dz (px de suelo)

  // hoja de la puerta: bisagra a la izquierda, abierta θ hacia el pasillo
  function thPuerta(t) {
    let th = 1.2;
    const tb = t - T.golpe;
    if (tb > 0) th += 0.07 * Math.exp(-tb * 4) * Math.sin(tb * 15);
    const tq = t - T.toque;
    if (tq > 0) th += 0.15 * salida(fase(t, T.toque, T.toque + 0.22)) + 0.05 * Math.exp(-tq * 3.5) * Math.sin(tq * 13);
    return th;
  }
  function hoja(t) {
    const th = thPuerta(t), dz = WD * Math.sin(th) * 0.14;
    const xF = XL + WD * Math.cos(th);
    return { th, dz, xF, ftop: proy(FT + 5, dz), fbot: proy(FW, dz), htop: FT + 5, hbot: FW };
  }

  /* ---------- el cubo (unidades: px a escala SREF; origen en el centro del fondo; el cuerpo hacia −y) ---------- */
  const CU = { H: 66, wT: 86, wB: 70, aro: 5 };
  const SCP = 1 / (0.6 * SREF);           // unidades del cubo → unidades del retrato de Guillermo
  const CUBO = { gal: "#aeb6bd", galOsc: "#6f7a84", galLuz: "#e8eef2", agua: "#5aa7d8", aguaLuz: "#bfe6ff", interior: "#3b434b" };
  // vista: >0 se ve la boca (desde arriba), <0 se ve el fondo (desde abajo)
  function dibCubo(g, o) {
    const { H, wT, wB, aro } = CU, v = clamp(o.vista ?? 0, -1, 1), eT = 0.2 * v, eB = 0.2 * v;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const lw = o.lw ?? 2.4;
    // asa (detrás del cuerpo si cuelga hacia atrás)
    const asa = (delante) => {
      const a = o.asa ?? 0, rx = wT / 2 + 1, ry = 46;
      const dlt = Math.cos(a) * (v >= 0 ? 1 : -1) >= 0;
      if (dlt !== delante) return;
      g.beginPath();
      for (let k = 0; k <= 24; k++) { const u = Math.PI * k / 24; const x = -Math.cos(u) * rx, y = -H + 4 - Math.sin(u) * ry * Math.cos(a); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.lineWidth = lw + 2.2; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 2; g.strokeStyle = "#c9d0d6"; g.stroke();
      const yc = -H + 4 - ry * Math.cos(a);
      g.fillStyle = "#3b2a1c"; g.beginPath(); g.roundRect(-12, yc - 4, 24, 8, 4); g.fill();      // empuñadura de madera
    };
    asa(false);
    // cuerpo
    const cuerpo = () => { g.beginPath(); g.moveTo(-wB / 2, 0); g.lineTo(-wT / 2, -H); g.lineTo(wT / 2, -H); g.lineTo(wB / 2, 0);
      g.ellipse(0, 0, wB / 2, Math.abs(eB) * wB / 2 + 0.01, 0, 0, Math.PI, false); g.closePath(); };
    cuerpo();
    const gr = g.createLinearGradient(-wT / 2, 0, wT / 2, 0);
    gr.addColorStop(0, CUBO.galOsc); gr.addColorStop(0.28, CUBO.gal); gr.addColorStop(0.45, CUBO.galLuz); gr.addColorStop(0.55, CUBO.galLuz);
    gr.addColorStop(0.72, CUBO.gal); gr.addColorStop(1, CUBO.galOsc);
    g.fillStyle = gr; g.fill();
    // aros repujados
    g.save(); cuerpo(); g.clip();
    for (const f of [0.3, 0.66]) { const y = -H * f, w = lerp(wB, wT, f) / 2;
      g.strokeStyle = "rgba(60,70,80,0.55)"; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, y + 1.5, w, Math.abs(eB) * w + 0.5, 0, 0, Math.PI); g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, y - 1, w, Math.abs(eB) * w + 0.5, 0, 0, Math.PI); g.stroke(); }
    if (o.mojado) { g.fillStyle = "rgba(170,215,245,0.22)"; g.fillRect(-wT, -H, 2 * wT, H); }
    g.restore();
    cuerpo(); g.lineWidth = lw; g.strokeStyle = TINTA; g.stroke();
    // fondo visto desde abajo
    if (v < -0.02) { g.beginPath(); g.ellipse(0, 0, wB / 2, -eB * wB / 2, 0, 0, TAU); g.fillStyle = "#8e979f"; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = TINTA; g.stroke(); }
    // boca y aro de arriba
    const ry = Math.abs(eT) * wT / 2 + 0.01;
    if (v > 0.02) {
      g.beginPath(); g.ellipse(0, -H, wT / 2, ry, 0, 0, TAU); g.fillStyle = CUBO.interior; g.fill();
      const ag = o.agua ?? 0;
      if (ag > 0.02) {
        const ya = -H + ry * (0.08 + 0.79 * (1-ag)), wa = (wT/2-4) * (0.92+0.08*ag), ti = o.inclAgua ?? 0;
        g.save(); g.beginPath(); g.ellipse(0, -H, wT / 2 - 1, ry, 0, 0, TAU); g.clip();
        g.beginPath(); g.ellipse(0, ya, wa, Math.max(0.45, ry * (0.72+0.16*ag)), ti, 0, TAU); g.fillStyle = CUBO.agua; g.fill();
        g.beginPath(); g.ellipse(-wa * 0.3, ya - 1, wa * 0.35, Math.max(0.4, ry * 0.29), ti, 0, TAU); g.fillStyle = CUBO.aguaLuz; g.fill();
        g.restore();
      }
      g.beginPath(); g.ellipse(0, -H, wT / 2, ry, 0, 0, TAU); g.lineWidth = aro; g.strokeStyle = TINTA; g.stroke();
      g.lineWidth = aro - 2.4; g.strokeStyle = "#d6dde2"; g.stroke();
    } else {
      // borde del aro (de lado o desde abajo)
      g.beginPath(); g.moveTo(-wT / 2 - 2, -H); g.ellipse(0, -H, wT / 2 + 2, ry, 0, Math.PI, 0, true);
      g.lineWidth = aro + 2; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = aro - 1.5; g.strokeStyle = "#d6dde2"; g.stroke();
      if (o.tapada) { g.beginPath(); g.moveTo(-wT / 2 - 2, -H); g.lineTo(wT / 2 + 2, -H); g.lineWidth = aro + 2; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = aro - 1.5; g.strokeStyle = "#d6dde2"; g.stroke(); }
    }
    // orejetas del asa
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * (wT / 2 - 3), -H + 7, 4, 5, 0, 0, TAU); g.fillStyle = "#c2c9cf"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke(); }
    asa(true);
    g.restore();
  }

  /* =====================================================================================
   * FONDO (se pinta una vez)
   * ===================================================================================== */
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  let fondo = null, cajas = null;
  const MARG = 40;
  function creaFondo() {
    const c = lienzo(W + 2 * MARG, H + 2 * MARG), g = c.getContext("2d");
    g.translate(MARG, MARG);
    // yeso de arriba
    const gp = g.createLinearGradient(0, -MARG, 0, 330);
    gp.addColorStop(0, "#5b5040"); gp.addColorStop(0.25, "#bfae8a"); gp.addColorStop(1, "#d8c9a4");
    g.fillStyle = gp; g.fillRect(-MARG, -MARG, W + 2 * MARG, 340 + MARG);
    // humedades
    for (let i = 0; i < 9; i++) { const x = hash(i + 1) * W, y = 40 + hash(i + 7) * 230, r = 40 + 70 * hash(i + 3);
      const gr = g.createRadialGradient(x, y, 4, x, y, r); gr.addColorStop(0, "rgba(120,100,70,0.18)"); gr.addColorStop(1, "rgba(120,100,70,0)");
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    // grietas
    g.strokeStyle = "rgba(90,74,52,0.45)"; g.lineWidth = 1.5;
    for (const [x, y] of [[180, 120], [880, 90], [460, 230]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y + 22); g.lineTo(x + 8, y + 40); g.lineTo(x + 20, y + 58); g.stroke(); }
    // alicatado verde hasta media altura
    const YT = 318;
    g.fillStyle = "#6f9a86"; g.fillRect(-MARG, YT, W + 2 * MARG, FW - YT);
    g.strokeStyle = "rgba(30,50,40,0.5)"; g.lineWidth = 2;
    for (let y = YT + 26; y < FW; y += 26) { g.beginPath(); g.moveTo(-MARG, y); g.lineTo(W + MARG, y); g.stroke(); }
    for (let r = 0, y = YT; y < FW; y += 26, r++) for (let x = (r % 2) * 18 - MARG; x < W + MARG; x += 36) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, Math.min(FW, y + 26)); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.12)";
    for (let r = 0, y = YT; y < FW; y += 26, r++) for (let x = (r % 2) * 18 - MARG; x < W + MARG; x += 36) g.fillRect(x + 3, y + 3, 14, 4);
    g.fillStyle = "#2f4a3e"; g.fillRect(-MARG, YT - 10, W + 2 * MARG, 12);       // cenefa
    g.fillStyle = "#86b39e"; g.fillRect(-MARG, YT - 10, W + 2 * MARG, 3);
    // zócalo
    g.fillStyle = "#33281e"; g.fillRect(-MARG, FW - 14, W + 2 * MARG, 14);
    // suelo de baldosas en perspectiva
    const gs = g.createLinearGradient(0, FW, 0, H + MARG);
    gs.addColorStop(0, "#7a4f3a"); gs.addColorStop(1, "#a36a4a");
    g.fillStyle = gs; g.fillRect(-MARG, FW, W + 2 * MARG, H + MARG - FW);
    g.strokeStyle = "rgba(40,22,14,0.45)"; g.lineWidth = 1.6;
    for (let k = 0; k < 9; k++) { const y = FW + 6 + 14 * k + 1.6 * k * k; if (y > H + MARG) break; g.beginPath(); g.moveTo(-MARG, y); g.lineTo(W + MARG, y); g.stroke(); }
    const VX = 600;
    for (let k = -14; k <= 16; k++) { const x0 = VX + k * 52; g.beginPath(); g.moveTo(x0, FW); g.lineTo(VX + (x0 - VX) * 2.3, H + MARG); g.stroke(); }
    // tubería con abrazaderas
    g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = 16; g.beginPath(); g.moveTo(-MARG, 58); g.lineTo(W + MARG, 58); g.stroke();
    g.strokeStyle = "#8d6a4c"; g.lineWidth = 11; g.stroke();
    g.strokeStyle = "rgba(255,220,170,0.45)"; g.lineWidth = 3; g.beginPath(); g.moveTo(-MARG, 55); g.lineTo(W + MARG, 55); g.stroke();
    for (const x of [90, 330, 880]) { g.fillStyle = "#4b3a2a"; g.fillRect(x - 6, 47, 12, 22); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 6, 47, 12, 22); }
    // cuadro de luces (caja gris)
    g.fillStyle = "#9aa1a6"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.roundRect(372, 168, 74, 96, 6); g.fill(); g.stroke();
    g.fillStyle = "#7d858b"; g.beginPath(); g.roundRect(380, 176, 58, 80, 4); g.fill();
    g.fillStyle = "#e8b23a"; g.beginPath(); g.moveTo(409, 196); g.lineTo(400, 216); g.lineTo(410, 216); g.lineTo(404, 236); g.lineTo(420, 210); g.lineTo(410, 210); g.lineTo(416, 196); g.closePath(); g.fill();
    g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 3; g.beginPath(); g.moveTo(409, 168); g.lineTo(409, 66); g.stroke();
    // extintor
    g.save(); g.translate(92, 250);
    g.fillStyle = "#c9302c"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.roundRect(-14, -10, 28, 70, 10); g.fill(); g.stroke();
    g.fillStyle = "#e86a5c"; g.fillRect(-8, -4, 5, 56);
    g.fillStyle = "#2b2b2b"; g.beginPath(); g.roundRect(-7, -22, 14, 14, 3); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(6, -18); g.quadraticCurveTo(26, -14, 22, 20); g.lineWidth = 4; g.strokeStyle = "#2b2b2b"; g.stroke();
    g.fillStyle = "#555"; g.fillRect(-18, -32, 36, 6);
    g.restore();
    // perchero con delantal
    g.fillStyle = "#4b3424"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.roundRect(950, 150, 70, 12, 4); g.fill(); g.stroke();
    for (const x of [966, 1000]) { g.beginPath(); g.arc(x, 166, 5, 0, TAU); g.fillStyle = "#c9a14a"; g.fill(); g.stroke(); }
    g.fillStyle = "#2e5b8a"; g.beginPath(); g.moveTo(992, 166); g.lineTo(1008, 166); g.lineTo(1022, 196); g.lineTo(1018, 300); g.lineTo(980, 300); g.lineTo(976, 196); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#f2e6c8"; g.lineWidth = 2; g.beginPath(); g.moveTo(976, 214); g.quadraticCurveTo(999, 224, 1022, 214); g.stroke();
    // marco de la puerta y el almacén oscuro
    const mol = 16;
    // interior
    const gi = g.createLinearGradient(0, FT, 0, FW);
    gi.addColorStop(0, "#14100d"); gi.addColorStop(0.7, "#231a14"); gi.addColorStop(1, "#2e2219");
    g.fillStyle = gi; g.fillRect(XL, FT, WD, FW - FT);
    // baldas del almacén (siluetas)
    g.save(); g.beginPath(); g.rect(XL, FT, WD, FW - FT); g.clip();
    g.fillStyle = "rgba(90,70,50,0.35)";
    for (const y of [214, 292, 370]) { g.fillRect(XL + 40, y, 140, 6); for (let i = 0; i < 6; i++) { const x = XL + 46 + i * 20 + 6 * hash(i + y); g.fillRect(x, y - 30 - 8 * hash(i * 3 + y), 12, 30 + 8 * hash(i * 3 + y)); } }
    const lz = g.createRadialGradient(XL + 120, FW - 10, 4, XL + 120, FW - 10, 120);
    lz.addColorStop(0, "rgba(255,190,110,0.18)"); lz.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = lz; g.fillRect(XL, FT, WD, FW - FT);
    g.restore();
    // jambas y dintel
    const madera = "#6b4428", maderaLuz = "#8c5c38";
    g.fillStyle = madera; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.rect(XL - mol, FT - mol, WD + 2 * mol, mol); g.fill(); g.stroke();
    g.beginPath(); g.rect(XL - mol, FT, mol, FW - FT); g.fill(); g.stroke();
    g.beginPath(); g.rect(XR, FT, mol, FW - FT); g.fill(); g.stroke();
    g.fillStyle = maderaLuz; g.fillRect(XL - mol + 3, FT - mol + 3, WD + 2 * mol - 6, 3); g.fillRect(XL - mol + 3, FT + 2, 3, FW - FT - 4); g.fillRect(XR + 3, FT + 2, 3, FW - FT - 4);
    // umbral
    g.fillStyle = "#4a3020"; g.fillRect(XL - mol, FW - 2, WD + 2 * mol, 6);
    // lamparita sobre la puerta
    g.fillStyle = "#2b2b2b"; g.fillRect(XL + WD / 2 - 14, FT - mol - 26, 28, 18);
    g.fillStyle = "#9bd7a4"; g.fillRect(XL + WD / 2 - 10, FT - mol - 22, 20, 10);
    return c;
  }
  function creaCajas() {
    const w = CJ.x1 - CJ.x0, h = CJ.alto * CJ.n + 30;
    const c = lienzo(w + 20, h + 10), g = c.getContext("2d");
    g.translate(10, h);
    for (let i = 0; i < CJ.n; i++) {
      const y = -i * CJ.alto, col = ["#b8322a", "#c4402f", "#a92b26", "#bd3a2c"][i % 4];
      g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 3;
      g.beginPath(); g.roundRect(0, y - CJ.alto, w, CJ.alto, 5); g.fill(); g.stroke();
      // asidero y celdillas
      g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.roundRect(w / 2 - 18, y - CJ.alto + 10, 36, 9, 4); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
      for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(k * w / 5, y - CJ.alto + 26); g.lineTo(k * w / 5, y - 6); g.stroke(); }
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(6, y - CJ.alto + 4, w - 12, 3);
    }
    // botellas asomando arriba
    for (let k = 0; k < 3; k++) { const x = 16 + k * 20, y = -CJ.n * CJ.alto;
      g.fillStyle = "#2f6b3a"; g.strokeStyle = TINTA; g.lineWidth = 2;
      g.beginPath(); g.roundRect(x - 6, y - 22, 12, 24, 3); g.fill(); g.stroke();
      g.fillStyle = "#d4b13a"; g.beginPath(); g.ellipse(x, y - 23, 5.5, 2.5, 0, 0, TAU); g.fill(); g.stroke(); }
    return { c, ox: CJ.x0 - 10, oy: CJ.y - h };
  }
  // silla de madera vista de tres cuartos (el respaldo atrás)
  function dibSilla(g, x, y) {
    const k = S(y) / 0.246, sw = 74 * k, sd = 16 * k, sh = SEAT;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    const mad = "#8a5a34", madO = "#5e3b20", madL = "#b07a4a";
    // patas de atrás y respaldo
    g.lineWidth = 7; g.strokeStyle = TINTA;
    for (const dx of [-sw / 2 + 8, sw / 2 - 8]) { g.beginPath(); g.moveTo(x + dx + 6, y - sd - sh + 4); g.lineTo(x + dx + 6, y - sd); g.stroke(); }
    g.lineWidth = 4; g.strokeStyle = madO;
    for (const dx of [-sw / 2 + 8, sw / 2 - 8]) { g.beginPath(); g.moveTo(x + dx + 6, y - sd - sh + 4); g.lineTo(x + dx + 6, y - sd); g.stroke(); }
    // respaldo
    const rb = y - sd - sh - 4;
    g.lineWidth = 7; g.strokeStyle = TINTA;
    for (const dx of [-sw / 2 + 4, sw / 2 - 4]) { g.beginPath(); g.moveTo(x + dx + 6, rb); g.lineTo(x + dx + 8, rb - 78 * k); g.stroke(); }
    g.lineWidth = 4; g.strokeStyle = mad;
    for (const dx of [-sw / 2 + 4, sw / 2 - 4]) { g.beginPath(); g.moveTo(x + dx + 6, rb); g.lineTo(x + dx + 8, rb - 78 * k); g.stroke(); }
    g.fillStyle = mad; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    for (const yy of [rb - 74 * k, rb - 46 * k]) { g.beginPath(); g.roundRect(x - sw / 2 + 4, yy, sw + 4, 12 * k, 3); g.fill(); g.stroke(); }
    // asiento
    g.fillStyle = mad; g.beginPath(); g.moveTo(x - sw / 2, y - sh); g.lineTo(x + sw / 2, y - sh); g.lineTo(x + sw / 2 + 8, y - sh - sd); g.lineTo(x - sw / 2 + 8, y - sh - sd); g.closePath();
    g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = madL; g.fillRect(x - sw / 2 + 6, y - sh - sd + 4, sw - 4, 3);
    g.fillStyle = madO; g.beginPath(); g.roundRect(x - sw / 2, y - sh, sw, 8, 2); g.fill(); g.stroke();
    // patas de delante
    for (const dx of [-sw / 2 + 5, sw / 2 - 5]) { g.lineWidth = 8; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(x + dx, y - sh + 6); g.lineTo(x + dx, y); g.stroke();
      g.lineWidth = 5; g.strokeStyle = mad; g.stroke(); }
    g.lineWidth = 3; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(x - sw / 2 + 5, y - 26); g.lineTo(x + sw / 2 - 5, y - 26); g.stroke();
    g.restore();
  }
  function dibBarril(g) {
    const x = BX, y = BY, rx = 38, ry = 9, h = BH;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA;
    const forma = () => { g.beginPath(); g.moveTo(x - rx, y - h); g.bezierCurveTo(x - rx - 8, y - h * 0.66, x - rx - 8, y - h * 0.33, x - rx, y);
      g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.bezierCurveTo(x + rx + 8, y - h * 0.33, x + rx + 8, y - h * 0.66, x + rx, y - h); g.closePath(); };
    forma(); const gr = g.createLinearGradient(x - rx, 0, x + rx, 0);
    gr.addColorStop(0, "#5a3820"); gr.addColorStop(0.4, "#a46d3e"); gr.addColorStop(1, "#4a2e1a"); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip(); g.strokeStyle = "rgba(40,22,10,0.5)"; g.lineWidth = 2;
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(x + k * 11, y - h); g.quadraticCurveTo(x + k * 13.5, y - h / 2, x + k * 11, y + 8); g.stroke(); }
    for (const f of [0.15, 0.82]) { const yy = y - h * f; g.fillStyle = "#3a3a3e"; g.fillRect(x - rx - 10, yy - 5, 2 * rx + 20, 10); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x - rx - 10, yy - 5, 2 * rx + 20, 2); }
    g.restore();
    forma(); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(x, y - h, rx, ry, 0, 0, TAU); g.fillStyle = "#8a5a32"; g.fill(); g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(x, y - h, rx - 6, ry - 2.5, 0, 0, TAU); g.lineWidth = 1.5; g.strokeStyle = "rgba(40,22,10,0.6)"; g.stroke();
    g.restore();
  }
  // hoja de la puerta (pintada de verde azulado, dos cuarterones y un pomo)
  function dibHoja(g, Hj) {
    const A = P(XL, Hj.htop), B = P(XL, Hj.hbot), C = P(Hj.xF, Hj.fbot), D = P(Hj.xF, Hj.ftop);
    const bil = (u, v) => P(lerp(lerp(A.x, D.x, u), lerp(B.x, C.x, u), v), lerp(lerp(A.y, D.y, u), lerp(B.y, C.y, u), v));
    g.save(); g.lineJoin = "round";
    // canto (grosor) en el lado libre
    const gr = 7;
    g.beginPath(); g.moveTo(D.x, D.y); g.lineTo(D.x + gr, D.y + 1); g.lineTo(C.x + gr, C.y + 1); g.lineTo(C.x, C.y); g.closePath();
    g.fillStyle = "#2e5652"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.lineTo(C.x, C.y); g.lineTo(D.x, D.y); g.closePath();
    const gg = g.createLinearGradient(A.x, 0, D.x, 0); gg.addColorStop(0, "#2f6662"); gg.addColorStop(1, "#4a8c86");
    g.fillStyle = gg; g.fill(); g.lineWidth = 3; g.stroke();
    // cuarterones
    for (const [v0, v1] of [[0.06, 0.44], [0.52, 0.94]]) {
      const q = [bil(0.16, v0), bil(0.84, v0), bil(0.84, v1), bil(0.16, v1)];
      g.beginPath(); q.forEach((z, i) => i ? g.lineTo(z.x, z.y) : g.moveTo(z.x, z.y)); g.closePath();
      g.fillStyle = "rgba(20,50,48,0.35)"; g.fill(); g.lineWidth = 2; g.strokeStyle = "rgba(10,25,24,0.8)"; g.stroke();
      g.beginPath(); g.moveTo(q[0].x + 1, q[0].y + 2); g.lineTo(q[1].x - 1, q[1].y + 2); g.lineWidth = 1.5; g.strokeStyle = "rgba(170,230,220,0.45)"; g.stroke();
    }
    // pomo cerca del canto
    const pm = bil(0.88, 0.5);
    g.beginPath(); g.ellipse(pm.x, pm.y, 4.5, 6, 0, 0, TAU); g.fillStyle = "#d9b24a"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    // bisagras
    for (const v of [0.1, 0.88]) { const b = bil(0.02, v); g.fillStyle = "#3a3a3a"; g.fillRect(b.x - 2, b.y - 8, 6, 16); }
    g.restore();
  }

  /* =====================================================================================
   * PIES Y CUERPOS
   * ===================================================================================== */
  const kRig = (R, p) => p.s * R.K;
  const aHojaF = (R, p, fx, q) => P(R.PELVIS.x + (q.x - p.x) / (kRig(R, p) * (Math.abs(fx)<1e-6 ? (fx<0?-1e-6:1e-6) : fx)), R.SUELO + (q.y - p.suelo) / kRig(R, p));
  const aPantF = (R, p, fx, q) => P(p.x + (q.x - R.PELVIS.x) * kRig(R, p) * fx, p.suelo + (q.y - R.SUELO) * kRig(R, p));
  const pelvisPant = (R, p) => P(p.x, p.suelo + (p.pelvis.y - R.SUELO) * kRig(R, p));
  function poseBase(R, x, suelo) {
    const p = { x, suelo, s: S(suelo), tirasLimpias: true, pelvis: { x: R.PELVIS.x, y: R.PELVIS.y }, torso: 0, torsoEsc: { x: 1, y: 1 },
      piernas: {}, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    if (R === G) { p.hombrosContinuos = true; p.hombrosRecortados = true; }
    return p;
  }
  // pie del mundo {x, y (línea de suelo), h (altura), a (ángulo)} → pierna en la hoja
  function piernaDe(R, p, fx, w, lado) {
    const k = kRig(R, p);
    const enGiro = clamp(1 - (Math.abs(fx) - 0.25) / 0.45);
    const dxM = clamp((w.x - p.x) / (k * (Math.abs(fx) < 0.25 ? (fx < 0 ? -0.25 : 0.25) : fx)), -280, 280);
    const dx = lerp(dxM, lado === "cerca" ? -20 : 60, enGiro);
    const tob0 = R.SUELO - R.TOBILLO_ALTO - (lado === "lejos" ? 10 : 0);
    return { tob: P(R.PELVIS.x + dx, tob0 + (w.y - p.suelo) / k - (w.h || 0) / k), ang: w.a || 0 };
  }
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_MG, m.y - Math.sin(mu) * R_MG);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);
  function bolsillo(R, p, lado) {
    if (R.manoReposo) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: FLOJA, dobla: lado === "cerca" ? -1 : 1 }; }
    const m = R.tronco(p)(lado === "cerca" ? BOLS_GC : BOLS_GL);
    return { x: m.x, y: m.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dedos: FLOJA, dobla: lado === "cerca" ? -1 : 1 };
  }
  // mano en un punto del tronco (hoja, sin inclinar) con mu relativo al tronco
  function manoT(R, p, q, mu, dedos, o = {}) {
    const m = R.tronco(p)(q);
    return { x: m.x, y: m.y, mu: mu + p.torso, ang: 0, puno: o.puno ?? 1, dedos, dobla: o.dobla, detras: o.detras };
  }
  // mano en un punto del mundo (pantalla)
  function manoW(R, p, fx, q, mu, dedos, o = {}) {
    const m = aHojaF(R, p, fx, q);
    return { x: m.x, y: m.y, mu, ang: 0, puno: o.puno ?? 1, dedos, dobla: o.dobla, detras: o.detras };
  }
  const mezMano = (a, b, k) => k <= 0 ? a : k >= 1 ? b : ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: a.mu + difAng(a.mu, b.mu) * k, ang: 0,
    puno: lerp(a.puno, b.puno, k), dedos: mezD(a.dedos, b.dedos, k), dobla: k < 0.5 ? a.dobla : b.dobla, detras: k < 0.5 ? a.detras : b.detras });
  // centro de la mano en pantalla
  const manoPant = (R, p, fx, m) => aPantF(R, p, fx, P(m.x, m.y));

  /* ---------- pasos: plantas [t, x, y, lado, sw, alto] ---------- */
  const ANG_PASO = u => 0.3 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u);
  function pasos(t0, dt, sw, alto, lista) { return lista.map(([x, y, lado], i) => ({ t: t0 + dt * i + sw, x, y, lado, sw, alto })); }
  function pieDe(ini, lista, lado, t, angPaso = ANG_PASO) {
    let prev = ini[lado];
    for (const e of lista) {
      if (e.lado !== lado) continue;
      if (e.t <= t) { prev = e; continue; }
      const s0 = e.t - e.sw;
      if (t >= s0) { const u = (t - s0) / e.sw;
        return { x: lerp(prev.x, e.x, suave(u)), y: lerp(prev.y, e.y, suave(u)), h: lerp(prev.h || 0, e.h || 0, suave(u)) + e.alto * Math.sin(Math.PI * u), a: angPaso(u) + lerp(prev.a || 0, e.a || 0, u) }; }
      break;
    }
    return { x: prev.x, y: prev.y, h: prev.h || 0, a: prev.a || 0 };
  }

  /* =====================================================================================
   * GUILLERMO: pies
   * ===================================================================================== */
  const G0 = 404, GY = 552;
  const SUBE = { lejos: { x: CHX + 10, y: CHY - 7, h: SEAT }, cerca: { x: CHX - 8, y: CHY - 4, h: SEAT } };
  const ESC = 230, EY = 563;                         // escondite (detrás de las cajas)
  const PUERTA_G = 624, PY = 556;                    // donde le cae el cubo
  const PIES_G = (() => {
    const L = [];
    // un paso hacia la silla
    L.push({ t: T.acerca0 + 0.2, sw: 0.2, alto: 16, lado: "lejos", x: 476, y: GY - 3, h: 0 });
    L.push({ t: T.acerca0 + 0.32, sw: 0.2, alto: 14, lado: "cerca", x: 452, y: GY + 3, h: 0 });
    // subir a la silla
    L.push({ t: T.pieA1, sw: T.pieA1 - T.pieA0, alto: 30, lado: "lejos", ...SUBE.lejos });
    L.push({ t: T.pieB1, sw: T.pieB1 - T.pieB0, alto: 26, lado: "cerca", ...SUBE.cerca });
    // bajar
    L.push({ t: T.bajaA, sw: T.bajaA - T.baja0, alto: 10, lado: "cerca", x: 466, y: 556, h: 0 });
    L.push({ t: T.baja1, sw: T.baja1 - T.bajaA + 0.02, alto: 8, lado: "lejos", x: 486, y: 551, h: 0 });
    // de puntillas hacia la izquierda (mira a la izquierda: el pie de delante es el lejano)
    const pt = [[430, 557, "lejos"], [382, 560, "cerca"], [334, 559, "lejos"], [286, 562, "cerca"], [ESC - 14, 562, "lejos"], [ESC + 8, 566, "cerca"]];
    const dt = (T.punt1 - T.punt0) / pt.length;
    pt.forEach(([x, y, lado], i) => L.push({ t: T.punt0 + dt * (i + 1), sw: dt * 0.95, alto: 30, lado, x, y, h: 0, punta: true }));
    // vuelta a la puerta (mira a la derecha)
    const an = [[ESC + 70, 562, "lejos"], [ESC + 140, 561, "cerca"], [ESC + 210, 560, "lejos"], [ESC + 278, 559, "cerca"], [ESC + 344, 558, "lejos"], [PUERTA_G - 6, PY + 2, "cerca"], [PUERTA_G + 12, PY - 3, "lejos"]];
    const da = (T.anda1 - T.anda0) / an.length;
    an.forEach(([x, y, lado], i) => L.push({ t: T.anda0 + da * (i + 1), sw: da * 1.05, alto: 20, lado, x, y, h: 0 }));
    return { ini: { cerca: { x: G0 - 8, y: GY + 3, h: 0 }, lejos: { x: G0 + 16, y: GY - 3, h: 0 } }, lista: L.sort((a, b) => a.t - b.t) };
  })();
  function fxG(t) {
    let fx;
    if (t < T.gira1a) fx = 1;
    else if (t < T.gira1b) fx = Math.cos(Math.PI * suave(fase(t, T.gira1a, T.gira1b)));
    else if (t < T.gira2a) fx = -1;
    else if (t < T.gira2b) fx = -Math.cos(Math.PI * suave(fase(t, T.gira2a, T.gira2b)));
    else if (t < T.gira3a) fx = 1;
    else fx = Math.cos(Math.PI * suave(fase(t, T.gira3a, T.gira3b)));
    return fx;
  }

  /* =====================================================================================
   * RODRI: pies
   * ===================================================================================== */
  const R_IN = P(652, 456), R_OUT = P(674, 530);
  const PIE_BARRIL = { x: BX - 12, y: BY - 4, h: BH - 4 };
  const R_FIN = P(878, 562);
  const PIES_R = (() => {
    const L = [];
    const sale = [[648, 478, "lejos"], [654, 494, "cerca"], [658, 511, "lejos"], [646, 531, "cerca"], [662, 526, "lejos"]];
    const ds = (T.rSale1 - T.rSale0) / sale.length;
    sale.forEach(([x, y, lado], i) => L.push({ t: T.rSale0 + ds * (i + 1), sw: ds * 1.05, alto: 18, lado, x, y, h: 0 }));
    L.push({ t: T.pie1, sw: T.pie1 - T.pie0, alto: 30, lado: "cerca", ...PIE_BARRIL, a: -0.15 });
    L.push({ t: T.end1, sw: T.end1 - T.end0, alto: 12, lado: "cerca", x: 650, y: 532, h: 0 });
    const an = [[700, 536, "lejos"], [748, 542, "cerca"], [794, 548, "lejos"], [828, 553, "cerca"], [862, 558, "lejos"], [R_FIN.x - 8, R_FIN.y + 3, "cerca"], [R_FIN.x + 16, R_FIN.y - 3, "lejos"]];
    const da = (T.rAnda1 - T.rAnda0) / an.length;
    an.forEach(([x, y, lado], i) => L.push({ t: T.rAnda0 + da * (i + 1), sw: da * 1.05, alto: 18, lado, x, y, h: 0 }));
    return { ini: { cerca: { x: R_IN.x - 8, y: R_IN.y + 3, h: 0 }, lejos: { x: R_IN.x + 16, y: R_IN.y - 3, h: 0 } }, lista: L.sort((a, b) => a.t - b.t) };
  })();
  function fxR(t) {
    let fx = 1;
    if (t >= T.rGira0) fx = Math.cos(Math.PI * suave(fase(t, T.rGira0, T.rGira1)));
    return fx;
  }

  /* =====================================================================================
   * CARAS
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: -0.1, c: 0.2, sonr: 0.3 }),
    puerta: E({ mx: 0.9, my: -0.55, c: 0.25, sd: 6, gd: 0.04, si: 10, gi: 0.08, abre: 0, ancho: 0.8, sonr: 0.45 }),
    pillo: E({ mx: -0.85, my: 0, c: 0.5, h: 0.2, sd: -8, gd: -0.2, si: 14, gi: 0.12, abre: 4, ancho: 1.05, sonr: 0.95 }),
    risita: E({ mx: -0.4, my: 0.1, c: 0.85, h: 1, sd: 8, gd: 0.04, si: 8, gi: 0.04, abre: 10, ancho: 1.05, sonr: 0.95, rub: 0.3 }),
    cubo: E({ mx: 0.9, my: 0.45, c: 0.25, abre: 0, ancho: 0.8, sonr: 0.5, lengua: 0 }),
    sube: E({ mx: 0.9, my: 0.2, c: 0.2, abre: 8, ancho: 0.7, sonr: 0.2, lengua: 0.9 }),
    eleva: E({ mx: 0.85, my: -0.55, c: 0.15, sd: 10, gd: 0.06, si: 10, gi: 0.06, abre: 10, ancho: 0.62, sonr: 0, lengua: 1 }),
    quieto: E({ mx: 0.9, my: -0.5, iris: 0.85, c: 0, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 6, ancho: 0.55, sonr: -0.05 }),
    guino: E({ mx: -0.85, my: 0, c: 0.3, wd: 0.7, sd: 10, gd: 0.04, si: 4, abre: 4, ancho: 1.05, sonr: 0.95 }),
    puntillas: E({ mx: 0.9, my: 0.05, c: 0.35, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 0, ancho: 0.7, sonr: 0.55 }),
    acecha: E({ mx: 0.9, my: 0, c: 0.3, h: 0.1, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 0, ancho: 0.8, sonr: 0.7 }),
    tapa: E({ mx: 0.9, my: 0, c: 0.85, h: 0.6, sd: 6, si: 6, abre: 6, ancho: 1, sonr: 0.9, rub: 0.25 }),
    susto: E({ mx: 0.9, my: -0.2, iris: 0.72, c: 0, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 26, ancho: 0.7, sonr: -0.4 }),
    entre: E({ mx: 0.9, my: -0.3, iris: 0.8, c: 0.05, sd: 22, gd: 0.15, si: 22, gi: 0.15, abre: 10, ancho: 0.55, sonr: -0.3 }),
    alivio: E({ mx: 0.9, my: -0.1, c: 0.6, sd: -4, gd: -0.06, si: -4, gi: -0.06, abre: 12, ancho: 0.9, sonr: 0.2, mof: 0.6 }),
    extrana: E({ mx: 0.9, my: -0.15, c: 0.2, sd: 6, gd: -0.12, si: 22, gi: 0.16, abre: 4, ancho: 0.6, sonr: -0.25 }),
    anda: E({ mx: 0.9, my: 0, c: 0.2, sd: 4, gd: -0.08, si: 16, gi: 0.12, abre: 2, ancho: 0.65, sonr: -0.15 }),
    arriba: E({ mx: 0.85, my: -0.85, c: 0.1, sd: 14, gd: 0.06, si: 20, gi: 0.12, abre: 6, ancho: 0.6, sonr: -0.2 }),
    toca: E({ mx: 0.85, my: -0.6, c: 0.15, sd: 10, gd: 0.04, si: 16, gi: 0.1, abre: 2, ancho: 0.55, sonr: 0.1, lengua: 0.8 }),
    panico: E({ mx: 0.85, my: -0.9, iris: 0.7, c: 0, sd: 30, gd: 0.22, si: 30, gi: 0.22, abre: 30, ancho: 0.75, sonr: -0.5 }),
    clonc: E({ mx: 0, my: 0, c: 1, z: 1, abre: 34, ancho: 0.9, sonr: -0.55 }),
    empapado: E({ mx: 0, my: 0, c: 0.9, abre: 6, ancho: 0.7, sonr: -0.35 }),
    asoma: E({ mx: -0.85, my: 0.05, c: 0.45, sd: 0, abre: 0, ancho: 0.7, sonr: -0.3 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.2, "puerta"], [T.camara, T.camara + 0.15, "pillo"], [T.frota0 + 0.1, T.frota0 + 0.25, "risita"],
    [T.coge0, T.coge0 + 0.15, "cubo"], [T.pieA0, T.pieA0 + 0.15, "sube"], [T.sube0 + 0.1, T.sube0 + 0.25, "eleva"],
    [T.eleva1, T.eleva1 + 0.08, "quieto"], [T.guinoG - 0.12, T.guinoG, "guino"], [T.baja0, T.baja0 + 0.12, "puntillas"],
    [T.agacha1, T.agacha1 + 0.15, "acecha"], [T.risita0, T.risita0 + 0.12, "tapa"], [T.risita1, T.risita1 + 0.15, "acecha"],
    [T.susto - 0.02, T.susto + 0.06, "susto"], [T.entre - 0.05, T.entre + 0.1, "entre"], [T.alivio, T.alivio + 0.15, "alivio"],
    [T.sale0 + 0.05, T.sale0 + 0.25, "extrana"], [T.anda0 + 0.2, T.anda0 + 0.4, "anda"], [T.arriba0, T.arriba0 + 0.15, "arriba"],
    [T.dedo0, T.dedo0 + 0.1, "toca"], [T.toque + 0.12, T.toque + 0.22, "arriba"], [T.vuelca - 0.1, T.vuelca + 0.04, "panico"],
    [T.cae, T.cae + 0.05, "clonc"], [T.cae + 0.5, T.cae + 0.8, "empapado"], [T.borde1 - 0.1, T.borde1 + 0.1, "asoma"]
  ];
  const PARP_G = [0.3, 1.0, 2.9, 4.5, 5.75, 6.9, 8.45, 9.6, 10.5, 13.4];

  const CARAS_R = {
    inicio: E({ mx: 0.9, my: 0, c: 0.3, abre: 7, ancho: 0.45, sonr: 0.05 }),
    silba: E({ mx: 0.9, my: 0, c: 0.4, abre: 8, ancho: 0.42, sonr: 0.05 }),
    cordon: E({ mx: 0.9, my: 0.85, c: 0.35, abre: 2, ancho: 0.7, sonr: -0.2 }),
    ata: E({ mx: 0.9, my: 0.9, c: 0.3, abre: 4, ancho: 0.7, sonr: 0.25, lengua: 0.85 }),
    gota: E({ mx: 0.9, my: 0.6, c: 0.75, z: 0.3, abre: 4, ancho: 0.7, sonr: 0 }),
    contento: E({ mx: 0.9, my: 0, c: 0.4, h: 0.2, abre: 8, ancho: 0.42, sonr: 0.15 }),
    susto: E({ mx: -0.6, my: 0, iris: 0.75, c: 0, abre: 20, ancho: 0.7, sonr: -0.3 }),
    mira: E({ mx: 0.9, my: -0.1, iris: 0.85, c: 0, abre: 14, ancho: 0.7, sonr: 0 }),
    risa: E({ mx: 0.7, my: 0.1, c: 0.95, h: 1, abre: 40, ancho: 1.05, sonr: 0.95 }),
    camara: E({ mx: -0.85, my: 0, c: 0.35, abre: 14, ancho: 1.05, sonr: 0.95 }),
    guino: E({ mx: -0.85, my: 0, c: 0.3, wd: 0.7, abre: 10, ancho: 1.05, sonr: 1 })
  };
  const GUION_CARA_R = [
    [T.silba0, T.silba0 + 0.2, "silba"], [T.cordon, T.cordon + 0.15, "cordon"], [T.ata0, T.ata0 + 0.12, "ata"],
    [T.gota, T.gota + 0.06, "gota"], [T.gota + 0.3, T.gota + 0.45, "ata"], [T.end0, T.end0 + 0.2, "contento"],
    [T.cae, T.cae + 0.05, "susto"], [T.rGira1 - 0.05, T.rGira1 + 0.05, "mira"], [T.risa0, T.risa0 + 0.12, "risa"],
    [T.camR, T.camR + 0.12, "camara"], [T.guinoR, T.guinoR + 0.1, "guino"]
  ];
  const PARP_R = [5.9, 6.8, 9.2, 10.4, 11.0, 13.2];

  /* =====================================================================================
   * EL CUBO: dónde está en cada momento
   * ===================================================================================== */
  // sobre la cabeza (coordenadas del retrato de Guillermo): centro del aro, inclinación y alzado del borde
  const CAB = { rc: P(806, 612), beta: 0.27 };
  const HP = CU.H * SCP;
  function cuboEnCabeza(t) {
    // al final Guillermo levanta el borde de atrás: gira alrededor del borde de delante
    const al = 0.24 * suave(fase(t, T.borde0 + 0.2, T.borde1)) + 0.012 * Math.sin(t * 3) * tramo(t, T.borde1, T.borde1 + 0.3);
    const b = CAB.beta, dir = P(Math.cos(b), Math.sin(b)), arriba = P(Math.sin(b), -Math.cos(b));
    const frente = P(CAB.rc.x + dir.x * CU.wT / 2 * SCP, CAB.rc.y + dir.y * CU.wT / 2 * SCP);
    const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a), dx = q.x - frente.x, dy = q.y - frente.y; return P(frente.x + dx * c - dy * s, frente.y + dx * s + dy * c); };
    const bc0 = P(CAB.rc.x + arriba.x * HP, CAB.rc.y + arriba.y * HP);
    return { bc: rot(bc0, al), ang: Math.PI + b + al, alza: al };
  }
  // de retrato a pantalla
  function retratoAPant(R, p, fx, q) { return aPantF(R, p, fx, R.cabeza(p).a(q)); }
  function cuboCabezaPant(o, t) {
    const c = cuboEnCabeza(t), R = G, p = o.p, fx = o.fx;
    const O = retratoAPant(R, p, fx, c.bc);
    const dirL = P(Math.sin(c.ang), -Math.cos(c.ang));        // (0,−1) girado: del fondo hacia el aro
    const Y = retratoAPant(R, p, fx, P(c.bc.x + dirL.x * 100, c.bc.y + dirL.y * 100));
    const d = P(Y.x - O.x, Y.y - O.y), L = Math.hypot(d.x, d.y);
    return { x: O.x, y: O.y, ang: Math.atan2(d.x / L, -d.y / L), sc: L / 100 * SCP };
  }
  // sobre la puerta
  function cuboPuerta(t) {
    const Hj = hoja(t);
    let phi = 0;
    const tb = t - T.golpe;
    if (tb > 0) phi += -0.2 * Math.exp(-tb * 3.2) * Math.sin(tb * 11);
    const tq = t - T.toque;
    if (tq > 0) { const u = fase(t, T.toque, T.vuelca); phi += (0.08 + 0.3 * u * u) * Math.sin(tq * 16) + 0.62 * Math.pow(u, 3); }
    // al dejarlo, un bamboleo pequeño
    const td = t - T.eleva1;
    if (td > 0 && t < T.golpe) phi += -0.07 * Math.exp(-td * 5) * Math.sin(td * 18);
    const ang = -0.05 + phi, sc = S(FW+Hj.dz)/SREF;
    return { x: Hj.xF+3+4*sc*Math.cos(ang), y: Hj.ftop+4*sc*Math.sin(ang), ang, sc, phi };
  }

  /* =====================================================================================
   * POSES
   * ===================================================================================== */
  const MEMO = new Map();
  function pose(who, t) {
    const clave = who + t;
    if (MEMO.has(clave)) return MEMO.get(clave);
    if (MEMO.size > 24) MEMO.clear();
    const v = who === "r" ? poseR(t) : poseG(t, who === "g0"); MEMO.set(clave, v); return v;
  }

  // poses de instantes fijos (la boca al salir cada nota, la cabeza cuando cae la gota): se guardan para siempre
  const FIJA = new Map();
  const poseFija = (who, t) => { const k = who + t; let v = FIJA.get(k); if (!v) { v = pose(who, t); FIJA.set(k, v); } return v; };

  /* ---------- Guillermo ---------- */
  function poseG(t, sinManos) {
    const R = G, fx = fxG(t);
    const fC = pieDe(PIES_G.ini, PIES_G.lista, "cerca", t, angPuntillas), fL = pieDe(PIES_G.ini, PIES_G.lista, "lejos", t, angPuntillas);
    // raíz: entre los pies (en la silla, sobre el asiento)
    let x = (fC.x + fL.x) / 2 + 4 * fx, y = (fC.y + fL.y) / 2;
    const enSilla = dentro(t, T.empuja0, T.empuja1, T.baja0 + 0.05, T.baja1 - 0.05);
    if (t >= T.empuja0 && t < T.baja1) { const k = enSilla; x = lerp(x, CHX + 1, k); y = lerp(y, CHY - 5, k); }
    const p = poseBase(R, x, y);
    const k = kRig(R, p);
    // altura de la pelvis (sobre la silla)
    const alto = SEAT * (t < T.baja0 ? tramo(t, T.empuja0, T.empuja1, suave) : 1 - tramo(t, T.baja0 + 0.04, T.baja1 - 0.02, suave));
    p.pelvis.y -= alto / k;
    for (const lado of ["cerca", "lejos"]) {
      const w = lado === "cerca" ? fC : fL;
      p.piernas[lado] = piernaDe(R, p, fx, { x: w.x, y: w.y, h: w.h, a: w.a }, lado);
    }
    const respira = Math.sin(t * 2.1);
    p.torsoEsc.y = 1 + 0.004 * respira;
    // risitas: hombros que botan
    const ri = dentro(t, T.frota0, T.frota0 + 0.1, T.frota1 - 0.1, T.frota1) + dentro(t, T.risita0, T.risita0 + 0.1, T.risita1 - 0.1, T.risita1);
    p.pelvis.y += 5 * Math.abs(Math.sin(t * 22)) * ri;
    p.cabeza.ang += 0.04 * Math.sin(t * 22) * ri;
    // mira la puerta al principio
    p.cabeza.ang += -0.14 * dentro(t, T.mira, T.mira + 0.2, T.camara, T.camara + 0.15);
    // coge el cubo: se inclina
    const cg = dentro(t, T.coge0, T.coge1, T.coge1 + 0.05, T.alza1);
    p.torso += 0.32 * cg; p.pelvis.y += 30 * cg; p.cabeza.ang += 0.08 * cg;
    // subiendo: se inclina hacia la silla
    const su = dentro(t, T.pieA0, T.pieA0 + 0.15, T.empuja1, T.pieB1);
    p.torso += 0.2 * su; p.pelvis.y += 26 * campana(t, T.pieA1 - 0.12, T.empuja1);
    // arriba: eleva el cubo, la cabeza atrás para mirar el borde de la puerta
    const el = dentro(t, T.sube0 + 0.15, T.cambia1, T.retira1, T.baja0);
    p.cabeza.ang += -0.24 * el; p.torso += -0.06 * el;
    const alcanza = dentro(t,T.cambia0,T.eleva1-0.06,T.retira0,T.retira1);
    p.pelvis.y -= 22 * alcanza; p.torso += 0.11 * alcanza;
    p.torso += 0.03 * Math.sin(t * 9) * dentro(t, T.cambia1, T.cambia1 + 0.05, T.eleva1, T.eleva1 + 0.1);    // equilibrio
    // bajar: un saltito
    p.pelvis.y += 22 * campana(t, T.baja0, T.baja1);
    // de puntillas: encorvado, con rebote
    const pu = dentro(t, T.punt0, T.punt0 + 0.12, T.punt1 - 0.1, T.agacha1);
    p.torso += 0.16 * pu; p.pelvis.y += pu * (18 + 14 * Math.abs(Math.sin((t - T.punt0) * Math.PI / ((T.punt1 - T.punt0) / 6))));
    p.cabeza.ang += 0.06 * pu;
    // agachado detrás de las cajas
    const ag = dentro(t, T.gira2a + 0.05, T.agacha1, T.sale0, T.sale1);
    const sube = dentro(t, T.risita0, T.risita0 + 0.15, T.risita1 - 0.1, T.risita1 + 0.12);
    p.pelvis.y += (215 - 70 * sube) * ag; p.torso += 0.1 * ag;
    p.cabeza.ang += 0.05 * Math.sin(t * 2.6) * ag;
    // susto: se encoge
    const st = dentro(t, T.susto, T.susto + 0.06, T.alivio, T.alivio + 0.2);
    p.pelvis.y += 10 * st;
    p.cabeza.dy += 4 * st;
    // extrañado: ladea la cabeza
    const ex = dentro(t, T.sale1 - 0.1, T.sale1 + 0.1, T.anda0 + 0.4, T.anda0 + 0.7);
    p.cabeza.ang += 0.14 * ex;
    // andando
    const an = dentro(t, T.anda0, T.anda0 + 0.2, T.anda1 - 0.1, T.anda1 + 0.1);
    p.torso += 0.05 * an; p.pelvis.y += an * 10 * Math.abs(Math.sin((t - T.anda0) * Math.PI / ((T.anda1 - T.anda0) / 7)));
    // mira arriba al cubo
    const ar = dentro(t, T.arriba0, T.arriba1, T.cae - 0.02, T.cae);
    p.cabeza.ang += -0.3 * ar; p.torso += -0.07 * ar;
    p.cabeza.ang += 0.05 * campana(t, T.toque - 0.05, T.toque + 0.12);
    // ¡clonc!: se le doblan las rodillas, se encoge
    const tc = t - T.cae;
    if (tc > 0) {
      const golpe = Math.exp(-tc * 6) * (1 - Math.exp(-tc * 60));
      const queda = tramo(tc, 0, 0.09);
      p.pelvis.y += 70 * golpe + 6 * queda;
      p.torso += 0.1 * golpe + 0.04 * queda;
      p.cabeza.ang += 0.14 * golpe - 0.02 * queda;
      p.cabeza.dy += 14 * golpe;
      p.torsoEsc.y -= 0.04 * golpe;
      // al levantar el borde, la cabeza un pelín atrás
      p.cabeza.ang += -0.05 * tramo(t, T.borde0, T.borde1);
    }
    // cara
    const ex0 = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex0, parpadeo(t, PARP_G));
    if (t >= T.cae) { p.capaCabeza = capaCabezaG(t, p); p.capaTronco = capaTroncoG(t); }
    p.rojo = 0.25 * dentro(t, T.cambia1, T.cambia1 + 0.1, T.eleva1, T.eleva1 + 0.15) + 0.2 * ri;
    p.sudor = dentro(t, T.susto, T.susto + 0.1, T.alivio, T.alivio + 0.3) + 0.6 * dentro(t, T.toque + 0.1, T.toque + 0.2, T.cae, T.cae + 0.05);
    if (!sinManos) manosG(R, p, t, fx);
    return { p, fx };
  }
  const angPuntillas = u => 0.3 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u);

  function manosG(R, p, t, fx) {
    const HC = R.HOMBRO_C, HL = R.HOMBRO;
    let c = bolsillo(R, p, "cerca"), l = bolsillo(R, p, "lejos");
    const pon = (w, cc, ll) => { if (w <= 0) return; if (cc) c = mezMano(c, cc, w); if (ll) l = mezMano(l, ll, w); };
    // se frota las manos
    const fr = dentro(t, T.frota0 - 0.08, T.frota0 + 0.12, T.frota1 - 0.1, T.acerca0 + 0.14);
    if (fr > 0) {
      const ph = Math.sin((t - T.frota0) * 26);
      pon(fr, manoT(R, p, P(HC.x + 230 + 8 * ph, 540 - 10 * ph), 2.55, PALMA, { dobla: -1 }),
        manoT(R, p, P(HL.x + 30 - 8 * ph, 548 + 10 * ph), 2.75, PALMA, { dobla: 1 }));
    }
    // el asa del cubo
    const cb = cuboEstado(t);
    const asaP = cb.asaW;                     // dónde está el asa (mundo) mientras lo coge / lo lleva colgando
    const coge = dentro(t, T.coge0 - 0.05, T.coge1 - 0.02, T.cambia0, T.cambia1);
    if (coge > 0) pon(coge, null, manoW(R, p, fx, asaP, -1.75, AGARRA, { dobla: 1 }));
    // equilibrio mientras sube: la mano cercana fuera
    const eq = dentro(t, T.pieA0, T.pieA0 + 0.15, T.sube0, T.ayuda0 + 0.05);
    if (eq > 0) pon(eq, manoT(R, p, P(HC.x - 60, 420 + 20 * Math.sin(t * 7)), -2.4, PALMA, { dobla: -1 }), null);
    // la mano cercana sujeta el cubo por el costado
    const ay = dentro(t, T.ayuda0, T.ayuda1, T.sueltaAyuda, T.sueltaAyuda + 0.18);
    if (ay > 0) pon(ay, orienta(R,p,manoW(R,p,fx,cb.ladoW,0.2,SOSTIENE,{dobla:-1}),true), null);
    // luego, «quieto, quieto»: palma hacia el cubo
    const qu = dentro(t, T.sueltaAyuda + 0.05, T.sueltaAyuda + 0.25, T.retira1, T.baja0 + 0.1);
    if (qu > 0) pon(qu, manoT(R, p, P(HC.x + 210, 380), 2.3, PALMA, { dobla: -1 }), null);
    // la palma lejana bajo el fondo del cubo
    const pa = dentro(t, T.cambia0, T.cambia1, T.retira0, T.retira1);
    if (pa > 0) pon(pa, null, orienta(R,p,manoW(R,p,fx,cb.fondoW,1.95,SOSTIENE,{dobla:1}),false));
    // retira la mano despacio, con la palma abierta
    const rt = dentro(t, T.retira0, T.retira1, T.baja0, T.baja0 + 0.15);
    if (rt > 0) pon(rt, null, manoT(R, p, P(HL.x + 120, 330), 1.9, PALMA, { dobla: 1 }));
    // bajando: brazos abiertos
    const bj = dentro(t, T.baja0, T.baja0 + 0.1, T.baja1, T.punt0 + 0.1);
    if (bj > 0) pon(bj, manoT(R, p, P(HC.x - 80, 470), -2.6, PALMA, { dobla: -1 }), manoT(R, p, P(HL.x + 150, 470), -0.6, PALMA, { dobla: 1 }));
    // de puntillas: manos de gato
    const pt = dentro(t, T.punt0, T.punt0 + 0.12, T.punt1 - 0.05, T.agacha1);
    if (pt > 0) pon(pt, manoT(R, p, P(HC.x + 200, 470), -1.9, GARRA, { dobla: -1 }), manoT(R, p, P(HL.x + 60, 480), -1.7, GARRA, { dobla: 1 }));
    // escondido: manos en el borde de las cajas
    const topeCaja = CJ.y - CJ.alto * CJ.n;
    const es = dentro(t, T.gira2b - 0.05, T.agacha1, T.sale0, T.sale0 + 0.2);
    if (es > 0) pon(es, manoW(R, p, fx, P(p.x + 6 * fx, topeCaja + 4), 2.4, D5(0.3, 0.8, 0.8, 0.8, 0.8), { dobla: -1 }),
      manoW(R, p, fx, P(p.x + 46 * fx, topeCaja + 4), -2.6, D5(0.3, 0.8, 0.8, 0.8, 0.8), { dobla: 1 }));
    // risita: mano cercana tapando la boca
    const bo = dentro(t, T.risita0, T.risita0 + 0.15, T.risita1 - 0.1, T.risita1 + 0.1);
    if (bo > 0) { const b = aPantF(R, p, fx, R.boca(p)); pon(bo, manoW(R, p, fx, P(b.x + 4 * fx, b.y + 6), 1.9, D5(0.6, 1, 1, 1, 1), { dobla: -1 }), null); }
    // se tapa los ojos (y luego mira entre los dedos)
    const ta = dentro(t, T.tapa0, T.tapa0 + 0.1, T.tapa1, T.tapa1 + 0.15);
    if (ta > 0) {
      const H = R.cabeza(p);
      const ojo = aPantF(R, p, fx, H.a(P(800, 585)));
      const baja = 16 * tramo(t, T.entre, T.entre + 0.12);
      pon(ta, manoW(R, p, fx, P(ojo.x - 8 * fx, ojo.y + 2 + baja * 0.4), 1.8, D5(0.4, 1, 1, 1, 1), { dobla: -1 }),
        manoW(R, p, fx, P(ojo.x + 14 * fx, ojo.y + 4 + baja), 2.1, D5(0.4, 1, 1, 1, 1), { dobla: 1 }));
    }
    // se rasca la cabeza
    const ra = dentro(t, T.rasca0, T.rasca0 + 0.1, T.rasca1, T.rasca1 + 0.15);
    if (ra > 0) { const H = R.cabeza(p); const q = aPantF(R, p, fx, H.a(P(575, 520)));
      pon(ra, manoW(R, p, fx, P(q.x + 3 * Math.sin(t * 30), q.y + 4 * Math.sin(t * 30)), 1.75, D5(0.3, 0.6, 0.7, 0.6, 0.5), { dobla: -1 }), null); }
    // andando: brazos sueltos que se balancean
    const an = dentro(t, T.anda0, T.anda0 + 0.2, T.anda1 - 0.1, T.anda1 + 0.15);
    if (an > 0) { const sw = Math.sin((t - T.anda0) * Math.PI / ((T.anda1 - T.anda0) / 7));
      pon(an, manoT(R, p, P(HC.x + 40 - 50 * sw, 640), -1.75, FLOJA, { dobla: -1 }), manoT(R, p, P(HL.x - 20 + 50 * sw, 650), -1.75, FLOJA, { dobla: 1 })); }
    // de pie mirando arriba: manos a los lados
    const lad = dentro(t, T.anda1 - 0.1, T.anda1 + 0.1, T.cae, T.cae + 0.05);
    if (lad > 0) pon(lad, manoT(R, p, P(HC.x + 30, 650), -1.85, FLOJA, { dobla: -1 }), manoT(R, p, P(HL.x - 10, 650), -1.7, FLOJA, { dobla: 1 }));
    // el toquecito a la puerta: índice estirado
    const de = dentro(t, T.dedo0, T.toque, T.toque + 0.06, T.dedo1);
    if (de > 0) pon(de, null, manoIndice(R, p, fx, puntoToque(t), Math.PI-0.3, INDICE, {dobla:1}));
    // ¡clonc!: brazos que saltan y caen
    const tc = t - T.cae;
    if (tc > 0) {
      const sal = Math.exp(-tc * 5) * (1 - Math.exp(-tc * 40));
      pon(1, manoT(R, p, P(HC.x + 40 - 70 * sal, 650 - 160 * sal), -1.8 - 0.6 * sal, mezD(FLOJA, PALMA, sal), { dobla: -1 }),
        manoT(R, p, P(HL.x - 10 + 90 * sal, 650 - 170 * sal), -1.7 + 0.6 * sal, mezD(FLOJA, PALMA, sal), { dobla: 1 }));
      // levanta el borde de atrás del cubo con la mano cercana
      const lv = dentro(t, T.borde0, T.borde0 + 0.2, DUR, DUR + 1);
      if (lv > 0) { const q = puntoBordeAtras(p, fx, t);
        pon(lv, manoIndice(R,p,fx,q,1.45,D5(0.4,0.9,0.9,0.9,0.9),{dobla:-1}), null); }
    }
    p.manoCerca = c; p.manoLejos = l;
  }
  // punto del borde de atrás del aro (pantalla) donde se agarra al final
  function puntoBordeAtras(p, fx, t) {
    const c = cuboEnCabeza(t), a = c.ang;
    // en coordenadas del cubo: el aro está en (±wT/2, −H); atrás es +x local tras girar π
    const loc = P(CU.wT / 2 - 6, -CU.H + 4);
    const q = P(c.bc.x + (loc.x * Math.cos(a) - loc.y * Math.sin(a)) * SCP, c.bc.y + (loc.x * Math.sin(a) + loc.y * Math.cos(a)) * SCP);
    return retratoAPant(G, p, fx, q);
  }
  function puntoToque(t) {
    const h = hoja(t), u = 0.40, v = 0.44;
    return P(lerp(XL,h.xF,u),lerp(lerp(h.htop,h.ftop,u),lerp(h.hbot,h.fbot,u),v));
  }
  // Extremo redondeado del índice en la hoja de la mano que traza Personaje2D.mano.
  function vectorIndice(R, p, mun, dedos) {
    const abiertos = (dedos.indice + dedos.medio + dedos.anular + dedos.menique) / 4;
    const ang = 0.17 * (0.4 + 0.9 * abiertos), largo = lerp(3.2,14.5,dedos.indice ** 0.85)+4.55;
    const x = 6.9 + Math.sin(ang)*largo, y = 4.5 + Math.cos(ang)*largo;
    const a = mun+Math.PI/2;
    return P(R.JK*(x*Math.cos(a)-y*Math.sin(a)),R.JK*(x*Math.sin(a)+y*Math.cos(a)));
  }
  function manoIndice(R,p,fx,q,mu,ded,opts) {
    const m = manoW(R,p,fx,q,mu,ded,opts), d = vectorIndice(R,p,mu,ded);
    m.x -= d.x; m.y -= d.y; return m;
  }
  function puntaIndice(R,p,fx,m) {
    const d = vectorIndice(R,p,m.mu,m.dedos);
    return aPantF(R,p,fx,P(m.x+d.x*m.puno,m.y+d.y*m.puno));
  }
  function orienta(R,p,m,cerca) {
    const h = R.tronco(p)(cerca ? R.HOMBRO_C : R.HOMBRO);
    m.mu = Math.atan2(h.y-m.y,h.x-m.x); return m;
  }

  /* ---------- estado del cubo (mundo) mientras Guillermo lo prepara ---------- */
  // devuelve: tipo, pose del dibujo (x, y, ang, sc), y puntos de agarre (asaW, ladoW, fondoW)
  function cuboEstado(t) {
    const enSilla = { x: CHX - 2, y: CHY - SEAT - 8 };
    const scS = S(CHY) / SREF;
    if (t < T.coge1) {
      const o = { x: enSilla.x, y: enSilla.y, ang: 0, sc: scS };
      return Object.assign(o, puntos(o,t), { tipo: "silla" });
    }
    if(t>=T.vuelca) {
      const cabeza=t>=T.cae;
      const o=cabeza ? cuboCabezaPant(pose("g0",t),t) : estadoCaida(t);
      return Object.assign(o,puntos(o,t),{tipo:cabeza?"cabeza":"cae"});
    }
    if (t >= T.eleva1) {
      const o = cuboPuerta(t);
      return Object.assign(o, puntos(o,t), { tipo: "puerta" });
    }
    // de T.coge1 a T.eleva1: va con Guillermo (pose sin manos para no recursar)
    const og = pose("g0", t), R = G, p = og.p, fx = og.fx;
    const HL = R.HOMBRO;
    // colgando del asa: el asa va a la altura de la cadera y sube con la mano
    const sube = tramo(t, T.coge1, T.alza1);
    const cadera = aPantF(R, p, fx, R.tronco(p)(P(HL.x - 10 + 30 * (1 - sube), 640 - 40 * (1 - sube))));
    const levanta = tramo(t, T.sube0, T.sube1);
    const pecho = aPantF(R, p, fx, R.tronco(p)(P(HL.x + 70, 460)));
    const asaSilla = P(enSilla.x,enSilla.y+largoAsa(T.coge1)*scS);
    const asaInicio = mezcla(asaSilla,P(cadera.x,cadera.y-67),sube);
    const asa = mezcla(asaInicio,pecho,levanta);
    const sc = lerp(scS, S(p.suelo) / SREF, sube);
    const balanceo = 0.12 * Math.sin(t * 6.5) * Math.exp(-Math.max(0, t - T.alza1) * 1.5) * (1 - levanta) * tramo(t, T.coge1, T.alza1);
    const hastaAsa = -largoAsa(t)*sc;
    const colgado = { x: asa.x-Math.sin(balanceo)*hastaAsa, y: asa.y+Math.cos(balanceo)*hastaAsa, ang:balanceo, sc };
    // en la palma: sube hasta el borde de la puerta
    const fin = cuboPuerta(T.eleva1);
    const enPalma0 = { x: pecho.x - 6 * fx, y: pecho.y + 20 * sc, ang: 0.05 * fx, sc };
    const u = fase(t, T.cambia1, T.eleva1), uu = suave(u);
    const enPalma = { x: lerp(enPalma0.x, fin.x, uu), y: lerp(enPalma0.y, fin.y, uu) - 18 * Math.sin(Math.PI * uu), ang: lerp(enPalma0.ang, fin.ang, uu), sc: lerp(sc, fin.sc, uu) };
    const k = tramo(t, T.ayuda0, T.cambia1);
    const o = { x: lerp(colgado.x, enPalma.x, k), y: lerp(colgado.y, enPalma.y, k), ang: lerp(colgado.ang, enPalma.ang, k), sc: lerp(colgado.sc, enPalma.sc, k) };
    return Object.assign(o,puntos(o,t),{tipo:"mano"});
  }
  // puntos de agarre del cubo (en el mundo) a partir de su pose
  function anguloAsa(t) {
    return 0.9 * (1-tramo(t,T.coge0,T.coge1) + tramo(t,T.ayuda0,T.cambia1));
  }
  const largoAsa = t => -CU.H + 4 - 46*Math.cos(anguloAsa(t));
  function puntoCubo(o,x,y) {
    const c = Math.cos(o.ang), s = Math.sin(o.ang);
    return P(o.x+(x*c-y*s)*o.sc,o.y+(x*s+y*c)*o.sc);
  }
  function puntos(o,t) {
    return { asaW:puntoCubo(o,0,largoAsa(t)), ladoW:puntoCubo(o,-CU.wT/2+2,-CU.H*0.45), fondoW:puntoCubo(o,-CU.wB*0.34,2) };
  }

  /* ---------- Rodri ---------- */
  function poseR(t) {
    const R = RO, fx = fxR(t);
    const fC = pieDe(PIES_R.ini, PIES_R.lista, "cerca", t), fL = pieDe(PIES_R.ini, PIES_R.lista, "lejos", t);
    let x = (fC.x + fL.x) / 2 + 4 * fx, y = (fC.y + fL.y) / 2;
    // con el pie en el barril, la raíz se queda donde estaba el pie de apoyo
    const enBarril = dentro(t, T.pie0, T.pie1, T.end0, T.end1);
    if (enBarril > 0) { x = lerp(x, fL.x - 6, enBarril); y = lerp(y, fL.y + 2, enBarril); }
    const p = poseBase(R, x, y);
    const k = kRig(R, p);
    // se inclina hacia el pie (y el trasero va atrás: ¡toc!, la puerta)
    const db = dentro(t, T.dobla0, T.golpe, T.end0, T.end1);
    p.x -= 20 * db;
    p.torso += 0.95 * db; p.pelvis.y += 60 * db; p.cabeza.ang += 0.15 * db;
    p.x -= 6 * campana(t, T.golpe - 0.06, T.golpe + 0.12);
    for (const lado of ["cerca", "lejos"]) {
      const w = lado === "cerca" ? fC : fL;
      p.piernas[lado] = piernaDe(R, p, fx, w, lado);
    }
    const respira = Math.sin(t * 2.3 + 1);
    p.torsoEsc.y = 1 + 0.004 * respira;
    // andando: un botecito
    const an = dentro(t, T.rSale0, T.rSale0 + 0.15, T.rSale1 - 0.1, T.rSale1) + dentro(t, T.rAnda0, T.rAnda0 + 0.15, T.rAnda1 - 0.1, T.rAnda1);
    p.pelvis.y += 9 * Math.abs(Math.sin(t * 8.2)) * an;
    // silbando: cabeceo
    const si = dentro(t, T.silba0, T.silba0 + 0.2, T.cordon - 0.1, T.cordon) + dentro(t, T.end1, T.end1 + 0.2, T.cae, T.cae + 0.05);
    p.cabeza.ang += 0.05 * Math.sin(t * 6) * si;
    // mira el cordón
    const mc = dentro(t, T.cordon, T.cordon + 0.15, T.end0, T.end1);
    p.cabeza.ang += 0.22 * mc;
    // la gota en la cabeza: respingo
    p.cabeza.ang += -0.06 * campana(t, T.gota, T.gota + 0.2); p.cabeza.dy += -4 * campana(t, T.gota, T.gota + 0.2);
    // ¡clonc!: respingo
    const sb = campana(t, T.cae, T.cae + 0.3);
    p.pelvis.y -= 40 * sb;
    // risa: doblado, a sacudidas
    const ri = dentro(t, T.risa0, T.risa0 + 0.2, T.risa1, T.camR + 0.1);
    p.torso += 0.42 * ri + 0.05 * Math.sin(t * 24) * ri; p.pelvis.y += 22 * ri + 6 * Math.abs(Math.sin(t * 24)) * ri;
    p.cabeza.ang += 0.1 * ri + 0.04 * Math.sin(t * 24 + 1) * ri;
    const cam = tramo(t, T.camR, T.camR + 0.2);
    p.cabeza.ang += -0.04 * cam;
    const ex0 = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    p.cara = cara(ex0, parpadeo(t, PARP_R));
    manosR(R, p, t, fx);
    return { p, fx };
  }
  function manosR(R, p, t, fx) {
    const HC = R.HOMBRO_C, HL = R.HOMBRO;
    let c = bolsillo(R, p, "cerca"), l = bolsillo(R, p, "lejos");
    const pon = (w, cc, ll) => { if (w <= 0) return; if (cc) c = mezMano(c, cc, w); if (ll) l = mezMano(l, ll, w); };
    // atándose el cordón: las dos manos en el zapato
    const at = dentro(t, T.dobla0, T.ata0, T.ata1, T.end0 + 0.1);
    if (at > 0) {
      const z = lazoPant(p, fx), ph = Math.sin(t * 17), ph2 = Math.sin(t * 17 + 1.7), k = 1 - 0.8*tramo(t,T.lazo,T.ata1);
      pon(at, orienta(R,p,manoW(R,p,fx,P(z.x-8*fx+4*ph*k,z.y-6-4*ph2*k),2.6,PINZA,{dobla:-1}),true),
        manoW(R, p, fx, P(z.x + 12 * fx - 4 * ph2 * k, z.y - 4 + 4 * ph * k), -2.2, PINZA, { dobla: 1 }));
    }
    // risa: una mano a la barriga y la otra señalando a Guillermo
    const ri = dentro(t, T.risa0, T.risa0 + 0.18, T.camR, T.camR + 0.2);
    if (ri > 0) {
      const sac = Math.sin(t * 24);
      pon(ri, manoT(R, p, P(HC.x + 150, 600 + 8 * sac), 2.9, D5(0.6, 0.85), { dobla: -1 }),
        manoT(R, p, P(HL.x + 250, 420 + 6 * sac), Math.PI, INDICE, { dobla: 1 }));
    }
    // al final, las dos manos en la barriga mientras guiña
    const fin = tramo(t, T.camR, T.camR + 0.2);
    if (fin > 0) pon(fin, manoT(R, p, P(HC.x + 150, 600), 2.9, D5(0.6, 0.85), { dobla: -1 }), manoT(R, p, P(HL.x + 20, 610), 0.2, D5(0.6, 0.85), { dobla: 1 }));
    // respingo: manos fuera un instante
    const sb = campana(t, T.cae, T.cae + 0.35);
    if (sb > 0) pon(sb, manoT(R, p, P(HC.x - 40, 520), -2.4, PALMA, { dobla: -1 }), manoT(R, p, P(HL.x + 90, 520), -0.7, PALMA, { dobla: 1 }));
    p.manoCerca = c; p.manoLejos = l;
  }
  // el cordón del zapato de cerca (pantalla)
  function lazoPant(p, fx) {
    const q = p.piernas.cerca, a = q.ang, d = P(36, -38);
    const h = P(q.tob.x + d.x * Math.cos(a) - d.y * Math.sin(a), q.tob.y + d.x * Math.sin(a) + d.y * Math.cos(a));
    return aPantF(RO, p, fx, h);
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function nota(g, x, y, s, dbl, col, a) {
    g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    const cab = (cx) => { g.beginPath(); g.ellipse(cx, 0, 6, 4.5, -0.4, 0, TAU); g.fill(); g.stroke(); };
    cab(0); g.fillRect(4.5, -20, 2.4, 20); g.strokeRect(4.5, -20, 2.4, 20);
    if (dbl) { cab(16); g.fillRect(20.5, -22, 2.4, 22); g.strokeRect(20.5, -22, 2.4, 22); g.fillRect(4.5, -22, 18.4, 4); g.strokeRect(4.5, -22, 18.4, 4); }
    else { g.beginPath(); g.moveTo(6.9, -20); g.quadraticCurveTo(16, -14, 12, -5); g.quadraticCurveTo(13, -12, 6.9, -13); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }
  // notas del silbido de Rodri (salen de la boca y suben)
  const NOTAS = [];
  for (let k = 0; k < 40; k++) { const t0 = T.silba0 + k * 0.32; if (t0 < T.cordon - 0.1 || (t0 > T.end1 + 0.1 && t0 < T.cae)) NOTAS.push({ t0, h: hash(k + 4), dbl: k % 3 === 1 }); }
  function notas(g, t, oR) {
    const cols = ["#ffe35f", "#8fe0ff", "#ff9ec4"];
    for (const [i, n] of NOTAS.entries()) {
      const age = t - n.t0, vida = 1.7; if (age < 0 || age > vida) continue;
      // posición de la boca en el momento de salir
      const o = poseFija("r", n.t0), b = aPantF(RO, o.p, o.fx, RO.boca(o.p));
      const u = age / vida;
      const x = b.x + o.fx * (14 + 50 * u) + 10 * Math.sin(age * 5 + n.h * 6), y = b.y - 10 - 90 * u;
      let a = Math.sin(Math.PI * Math.min(1, u * 1.15)) * 0.95;
      if (t > T.cae) a *= 1 - fase(t, T.cae, T.cae + 0.2);
      // dentro del almacén las notas salen por el hueco de la puerta
      g.save();
      if (o.p.suelo < FW + 2) { g.beginPath(); g.rect(XL, FT - 60, W, FW - FT + 120); g.clip(); }
      nota(g, x, y, 0.75 + 0.25 * n.h, n.dbl, cols[i % 3], a);
      g.restore();
    }
  }
  function estrellaPuntas(g, x, y, r, n, rot, ri) {
    g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * ri : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, r0 = 46) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    const r = r0 * salida(k);
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, r, 9, 0.3, 0.55); g.fillStyle = "#fff6c8"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  function gota(g, x, y, s, a = 1, ang = 0) {
    if (a <= 0.01 || s <= 0.2) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -s * 1.7); g.quadraticCurveTo(s, 0, 0, s); g.quadraticCurveTo(-s, 0, 0, -s * 1.7);
    g.fillStyle = "#cfe9ff"; g.fill(); g.lineWidth = Math.max(0.8, s * 0.3); g.strokeStyle = "#1d3b52"; g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-s * 0.3, -s * 0.15, s * 0.22, s * 0.35, 0, 0, TAU); g.fill();
    g.restore();
  }
  // crujido: rayitas curvas junto a las bisagras
  function crujido(g, t) {
    let k = 0;
    for (const t0 of [T.golpe, T.toque]) k = Math.max(k, campana(t, t0, t0 + 0.45));
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.lineCap = "round";
    for (const yy of [FT + 40, FW - 60]) for (let i = 0; i < 3; i++) {
      const r = 10 + i * 7 + 4 * Math.sin(t * 30 + i);
      g.beginPath(); g.arc(XL - 18, yy, r, -0.6 + Math.PI, 0.6 + Math.PI); g.stroke();
    }
    g.restore();
  }
  // risitas: arquitos que saltan junto a la boca (sin letras)
  function risitas(g, t, o, k) {
    if (k <= 0.01) return;
    const b = aPantF(G, o.p, o.fx, G.boca(o.p));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 2.2 + i / 3) % 1), x = b.x + o.fx * (22 + 26 * ph), y = b.y - 8 - 40 * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.arc(x, y, 5, 0.2, Math.PI - 0.2); g.stroke(); g.beginPath(); g.arc(x + 10 * o.fx, y - 4, 5, 0.2, Math.PI - 0.2); g.stroke();
    }
    g.restore();
  }

  /* ---------- el agua ---------- */
  // gotas que salen del cubo al tambalearse (mundo)
  function salpicadurasCubo(g, t) {
    for (const [t0, n, dir] of [[T.golpe + 0.08, 4, 1], [T.toque + 0.15, 3, -1], [T.vuelca - 0.1, 4, -1]]) {
      const age = t - t0; if (age < 0 || age > 1.1) continue;
      const c = cuboPuerta(t0), origen = puntoCubo(c, dir*(CU.wT/2-2), -CU.H), ox = origen.x, oy = origen.y;
      for (let i = 0; i < n; i++) {
        const vx = dir * (30 + 50 * hash(i + t0)), vy = -60 - 70 * hash(i * 3 + t0);
        const x = ox + vx * age, y = oy + vy * age + 520 * age * age;
        if (y > FW + 60) continue;
        gota(g, x, y, 3 + 2 * hash(i + 7), 1 - fase(age, 0.8, 1.1), Math.atan2(vy + 1040 * age, vx) + Math.PI / 2);
      }
    }
    // la gota que le cae a Rodri en la cabeza
    const inicio = T.golpe+0.1;
    if (t >= inicio && t < T.gota) {
      const q = gotaRodri(t); gota(g,q.x,q.y,4.5,tramo(t,inicio,inicio+0.025),0);
    }
    const sp = fase(t,T.gota,T.gota+0.3);
    if (sp>0 && sp<1) {
      const cab = coronillaRodri();
      for (let i=0;i<4;i++) { const a=-Math.PI/2+(i-1.5)*0.6; gota(g,cab.x+Math.cos(a)*18*sp,cab.y+Math.sin(a)*14*sp+40*sp*sp,2.2,1-sp,a+Math.PI/2); }
    }
  }
  let puntoPelo = null;
  function coronillaRodri() {
    if (puntoPelo) return puntoPelo;
    const o = poseFija("r",T.gota), ref = q => retratoAPant(RO,o.p,o.fx,q);
    const origen = ref(P(0,0)), x = ref(P(1,0)), y = ref(P(0,1)), px = Math.round(ref(P(800,260)).x);
    const c = lienzo(3,H), g = c.getContext("2d");
    g.setTransform(x.x-origen.x,x.y-origen.y,y.x-origen.x,y.y-origen.y,origen.x-px+1,origen.y);
    Recortes.pieza(g,RO.A,"cabeza");
    const data = g.getImageData(1,0,1,H).data;
    let fila=0; while(fila<H && data[4*fila+3]<125) fila++;
    puntoPelo = fila<H ? P(px+0.5,fila+0.5) : ref(P(800,260));
    return puntoPelo;
  }
  function gotaRodri(t) {
    const t0=T.golpe+0.1, desde=puntoCubo(cuboPuerta(t0),CU.wT/2-2,-CU.H), hasta=coronillaRodri(), u=fase(t,t0,T.gota);
    return P(lerp(desde.x,hasta.x,u),lerp(desde.y,hasta.y,u*u));
  }
  // el chapuzón: corona al caer y cortina de agua por el cuerpo
  function chapuzon(g, t, o) {
    const tc = t - T.cae; if (tc < 0) return;
    const cp = cuboCabezaPant(o, t), golpe = cuboCabezaPant(poseFija("g0",T.cae),T.cae);
    // aro del cubo (pantalla)
    const aro = P(cp.x + Math.sin(cp.ang) * CU.H * cp.sc, cp.y - Math.cos(cp.ang) * CU.H * cp.sc);
    const wAro = CU.wT * cp.sc;
    // corona de gotas que salen disparadas del aro
    if (tc < 0.9) for (let i = 0; i < 16; i++) {
      const lado = i % 2 ? 1 : -1, h = hash(i + 31);
      const vx = lado * (90 + 140 * h), vy = -120 - 140 * hash(i + 5);
      const sale = puntoCubo(golpe,lado*(CU.wT/2-2),-CU.H);
      const x = sale.x + vx*tc, y = sale.y + vy*tc + 700*tc*tc;
      if (y > o.p.suelo + 10) continue;
      gota(g, x, y, 3.5 + 3 * hash(i + 2), 1 - fase(tc, 0.6, 0.9), Math.atan2(vy + 1400 * tc, vx) + Math.PI / 2);
    }
    // chorros de agua que caen por los dos lados del aro hasta el suelo y se adelgazan
    const k = 1 - fase(tc, 0.3, 0.85);
    if (k > 0.01) {
      const fondo = o.p.suelo-2, caida = fase(t,T.cae,primerContactoAgua()) ** 2;
      g.save(); g.lineCap = "round";
      for (const lado of [-1, 1]) {
        const labio = puntoCubo(cp,lado*CU.wT*0.46,-CU.H), x0=labio.x, y0=labio.y, alto=(fondo-y0)*caida, an = (9 + 7 * k) * (1 - 0.4 * fase(tc, 0.1, 0.6));
        const xm = x0 + lado * 16, xf = x0 + lado * (24 + 5 * Math.sin(t * 21 + lado));
        g.globalAlpha = 0.6 * k;
        g.beginPath(); g.moveTo(x0 - lado * an, y0); g.quadraticCurveTo(xm - lado * an * 0.4, y0 + alto * 0.35, xf - lado * 3, y0 + alto);
        g.lineTo(xf + lado * 3, y0 + alto); g.quadraticCurveTo(xm + lado * an * 0.6, y0 + alto * 0.3, x0 + lado * 3, y0);
        g.closePath(); g.fillStyle = "#9fd4f5"; g.fill();
        g.globalAlpha = 0.85 * k; g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x0 - lado * an * 0.4, y0 + 4); g.quadraticCurveTo(xm - lado * 2, y0 + alto * 0.35, xf, y0 + alto * 0.92); g.stroke();
      }
      g.restore();
    }
    // goteo del aro y de las manos
    for (let i = 0; i < 6; i++) {
      const per = 0.55 + 0.25 * hash(i + 2), ph = ((tc + per * hash(i + 11)) % per) / per;
      if (tc < 0.4) continue;
      const x0 = aro.x + (i - 2.5) * wAro * 0.18, y0 = aro.y + 2;
      gota(g, x0, y0 + 110 * ph * ph, 2.5 + 1.2 * hash(i), 1 - fase(ph, 0.7, 1));
    }
  }
  // charco a los pies de Guillermo
  function primerContactoAgua() {
    const o=poseFija("g0",T.cae), cb=cuboCabezaPant(o,T.cae), y=puntoCubo(cb,0,-CU.H).y;
    return T.cae+Math.sqrt(2*(o.p.suelo-2-y)/4900);
  }
  function charco(g, t, o) {
    const t0=primerContactoAgua(), k=tramo(t,t0,t0+0.72,salida); if(k<=0) return;
    const x=PUERTA_G+4, y=PY+6, rx=90*Math.sqrt(k), ry=15*Math.sqrt(k);
    g.save();
    g.beginPath(); for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU, r = 1 + 0.12 * Math.sin(a * 3 + 1) + 0.06 * Math.sin(a * 5); g.lineTo(x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r); }
    g.closePath(); g.fillStyle = "rgba(120,180,215,0.55)"; g.fill(); g.lineWidth = 2; g.strokeStyle = "rgba(40,80,110,0.5)"; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(x - rx * 0.35, y - ry * 0.3, rx * 0.25, ry * 0.2, 0, 0, TAU); g.fill();
    // anillos de las gotas
    for (let i = 0; i < 3; i++) { const ph = ((t * 1.3 + i / 3) % 1); g.globalAlpha = (1 - ph) * k; g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.5;
      g.beginPath(); g.ellipse(x + (i - 1) * rx * 0.4, y + (i % 2) * 3, 4 + 16 * ph, 1.5 + 4 * ph, 0, 0, TAU); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * CAPAS DE GUILLERMO: el cubo en la cabeza, el pelo aplastado y la ropa empapada
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
  const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
  const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
  const CAJA = [[300,40],[1320,40],[1320,700],[300,700]];
  const CASQUETE = CUP.concat(FLEQUILLO).map(([x, y]) => ({ x, y }));
  function borraPuas(g) {
    g.save();
    g.beginPath(); ruta(g, CAJA); M2.curva(g, CASQUETE, true, 0.35); g.clip("evenodd");
    g.beginPath(); ruta(g, CAJA); ruta(g, PIEL_CAB); g.clip("evenodd");
    g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
    g.globalCompositeOperation = "destination-out"; g.fillStyle = "#000"; g.fillRect(300, 40, 1020, 660);
    g.restore();
  }
  const ruta = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  // mechones mojados que asoman por debajo del aro, por detrás
  function mechonesMojados(g, t) {
    const COL = { medio: "#5a2a10", oscuro: "#26120a", tinta: "#160a05" };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const lista = [[[540, 520], [500, 610], 46], [[566, 540], [540, 640], 40], [[600, 556], [592, 650], 34], [[1060, 690], [1100, 740], 30]];
    for (const [[x0, y0], [x1, y1], w] of lista) {
      const sw = 4 * Math.sin(t * 2 + x0);
      g.beginPath(); g.moveTo(x0 - w / 2, y0); g.quadraticCurveTo((x0 + x1) / 2 - w * 0.4, (y0 + y1) / 2, x1 + sw, y1); g.quadraticCurveTo((x0 + x1) / 2 + w * 0.3, (y0 + y1) / 2, x0 + w / 2, y0); g.closePath();
      g.fillStyle = COL.medio; g.fill(); g.lineWidth = 5; g.strokeStyle = COL.tinta; g.stroke();
      g.beginPath(); g.moveTo(x0, y0 + 8); g.quadraticCurveTo((x0 + x1) / 2 - 4, (y0 + y1) / 2, x1 + sw - 4, y1 - 14); g.lineWidth = 5; g.strokeStyle = "rgba(255,230,210,0.55)"; g.stroke();
    }
    g.restore();
  }
  function capaCabezaG(t, p) {
    return (g) => {
      if (t < T.cae) return;
      borraPuas(g);
      mechonesMojados(g, t);
      // regueros de agua por la cara (debajo del aro)
      const k = 1 - 0.5 * fase(t, T.cae + 1.2, T.cae + 2.5);
      g.save(); g.globalAlpha = 0.7 * k; g.strokeStyle = "rgba(225,245,255,0.95)"; g.lineWidth = 7; g.lineCap = "round";
      for (const [x, y, l] of [[700, 640, 120], [860, 690, 90], [960, 700, 70], [620, 600, 160]]) {
        const d = 8 * Math.sin(t * 3 + x);
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + d, y + l * 0.5, x + 4, y + l); g.stroke();
      }
      g.restore();
      for (const [x, y, s] of [[740, 700, 9], [900, 730, 8], [640, 690, 8]]) gota(g, x, y + 6 * Math.sin(t * 3 + x), s, 0.95 * k);
      // el cubo, boca abajo
      const c = cuboEnCabeza(t);
      g.save(); g.translate(c.bc.x, c.bc.y); g.rotate(c.ang); g.scale(-SCP, SCP);
      dibCubo(g, { vista: -0.35, agua: 0, asa: asaMojada(t), lw: 2.4, mojado: true, tapada: true });
      g.restore();
      // goteras del aro
      g.save();
      for (let i = 0; i < 4; i++) {
        const per = 0.6 + 0.3 * hash(i + 3), ph = (((t - T.cae) + per * hash(i + 17)) % per) / per;
        const loc = P(-CU.wT / 2 + 10 + i * (CU.wT - 20) / 3, -CU.H - 3), a = c.ang;
        const q = P(c.bc.x + (loc.x * Math.cos(a) - loc.y * Math.sin(a)) * SCP, c.bc.y + (loc.x * Math.sin(a) + loc.y * Math.cos(a)) * SCP);
        gota(g, q.x, q.y + 160 * ph * ph, 9, (1 - fase(ph, 0.6, 1)) * k);
      }
      g.restore();
    };
  }
  function capaTroncoG(t) {
    return (g) => {
      const m = tramo(t, T.cae + 0.05, T.cae + 0.5); if (m <= 0) return;
      g.save(); g.lineCap = "round"; g.globalAlpha = m;
      g.strokeStyle = "rgba(150,195,230,0.5)"; g.lineWidth = 9;
      for (const [x0, y0, x1, y1] of [[140, 360, 160, 540], [240, 330, 250, 600], [330, 380, 318, 620], [190, 610, 220, 700]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 12, (y0 + y1) / 2, x1, y1); g.stroke(); }
      g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 3.5;
      for (const [x0, y0, x1, y1] of [[148, 380, 162, 480], [246, 350, 252, 480], [326, 420, 318, 540]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      g.restore();
    };
  }
  // lienzo aparte para Guillermo empapado (se le borran las púas y se le oscurece la ropa)
  let CAPA = null;
  // dibuja un personaje en un lienzo aparte (con su fx), le aplica un retoque «source-atop» que solo
  // tiñe sus píxeles y lo compone en la escena (opcionalmente recortado al hueco de la puerta)
  function enCapa(g, R, o, t, recorte, retoque) {
    const c = g.canvas, p = o.p;
    if (!CAPA || CAPA.width !== c.width || CAPA.height !== c.height) CAPA = lienzo(c.width, c.height);
    const oc = CAPA.getContext("2d");
    const pp = pelvisPant(R, p);
    g.save(); g.translate(pp.x, pp.y); g.scale(o.fx, 1); g.translate(-pp.x, -pp.y);
    const Mt = g.getTransform(); g.restore();
    const M = g.getTransform(), alto = 400 * p.s / 0.246;
    const caja = [P(p.x - 170, p.suelo - alto - 60), P(p.x + 170, p.suelo - alto - 60), P(p.x + 170, p.suelo + 30), P(p.x - 170, p.suelo + 30)]
      .map(q => M.transformPoint(new DOMPoint(q.x, q.y)));
    const x0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.x))) - 2), y0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.y))) - 2);
    const x1 = Math.min(c.width, Math.ceil(Math.max(...caja.map(q => q.x))) + 2), y1 = Math.min(c.height, Math.ceil(Math.max(...caja.map(q => q.y))) + 2);
    if (x1 <= x0 || y1 <= y0) return;
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.globalCompositeOperation = "source-over";
    oc.clearRect(x0, y0, x1 - x0, y1 - y0);
    oc.setTransform(Mt);
    R.dibujar(oc, p, t);
    if (retoque) { oc.save(); oc.setTransform(M); oc.globalCompositeOperation = "source-atop"; retoque(oc); oc.restore(); }
    g.save();
    if (recorte) { g.beginPath(); g.rect(XL - 2, FT - 40, WD + 4, FW - FT + 60); g.clip(); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(CAPA, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); g.restore();
  }
  // Guillermo empapado: ropa más oscura y vaqueros calados
  function dibujaEnCapa(g, o, t, tinte) {
    const p = o.p;
    enCapa(g, G, o, t, false, tinte < 0.004 ? null : oc => {
      oc.fillStyle = `rgba(18,52,96,${0.18 * tinte})`; oc.fillRect(p.x - 220, 0, 440, 700);
      const yc = aPantF(G, p, o.fx, G.PELVIS).y - 18;
      const vq = oc.createLinearGradient(0, yc, 0, yc + 40); vq.addColorStop(0, "rgba(10,30,80,0)"); vq.addColorStop(1, `rgba(10,30,80,${0.32 * tinte})`);
      oc.fillStyle = vq; oc.fillRect(p.x - 220, yc, 440, 700 - yc);
    });
  }
  const PERFIL = 0.46;
  let vistaPerfil = null, mezclaPerfil = null;
  function dibPersonaje(g, R, o, t, recorte) {
    const p=o.p, pp=pelvisPant(R,p), pos={x:pp.x,y:pp.y,f:o.fx};
    const w = Math.abs(pos.f);
    g.save();
    if(recorte){g.beginPath();g.rect(XL-2,FT-40,WD+4,FW-FT+60);g.clip();}
    g.translate(pos.x,pos.y);
    if (w >= PERFIL) {
      g.scale(pos.f, 1); g.translate(-pp.x, -pp.y); R.dibujar(g, p, t);
    } else {
      if (!vistaPerfil) {
        vistaPerfil = document.createElement("canvas");
        vistaPerfil.width = W; vistaPerfil.height = H;
        mezclaPerfil = document.createElement("canvas"); mezclaPerfil.width = W; mezclaPerfil.height = H;
      }
      const c = vistaPerfil.getContext("2d");
      c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,W,H); R.dibujar(c, p, t);
      const mezcla = suave((pos.f / 0.21 + 1) / 2);
      const q = mezclaPerfil.getContext("2d");
      q.setTransform(1,0,0,1,0,0); q.clearRect(0,0,W,H);
      q.save(); q.translate(pp.x,pp.y); q.scale(PERFIL,1); q.globalCompositeOperation = "lighter";
      q.globalAlpha = mezcla; q.drawImage(vistaPerfil,-pp.x,-pp.y);
      q.scale(-1,1); q.globalAlpha = 1-mezcla; q.drawImage(vistaPerfil,-pp.x,-pp.y); q.restore();
      // Conserva opacidad en las zonas presentes en una sola orientación.
      const refuerzo = 4 * mezcla * (1-mezcla);
      if (refuerzo > 0.001) {
        q.save(); q.globalAlpha = refuerzo;
        q.drawImage(mezclaPerfil,0,0); q.drawImage(mezclaPerfil,0,0); q.restore();
      }
      g.drawImage(mezclaPerfil,-pp.x,-pp.y);
    }
    g.restore();
  }

  function sombra(g, x, y, a, rx = 50) {
    g.save(); g.fillStyle = `rgba(30,12,6,${a})`; g.beginPath(); g.ellipse(x, y + 2, rx, 8, 0, 0, TAU); g.fill(); g.restore();
  }
  // cordón de Rodri: suelto (dos cabos que se balancean), entre las manos o hecho un lazo
  function cordon(g, t, o) {
    const z = lazoPant(o.p, o.fx), s = o.p.s / 0.24, fx = o.fx;
    const atado = tramo(t, T.lazo, T.lazo + 0.12), atando = dentro(t, T.ata0, T.ata0 + 0.1, T.lazo, T.lazo + 0.1);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const traza = (pts) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y));
      g.lineWidth = 4.2 * s; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 2.2 * s; g.strokeStyle = "#f4f1ea"; g.stroke(); };
    if (atado < 1) {
      g.globalAlpha = 1 - atado;
      const flojo = 1 - atando;
      for (const sg of [-1, 1]) {
        const mano = sg<0 ? o.p.manoCerca : o.p.manoLejos;
        const pinza = puntaIndice(RO,o.p,o.fx,mano);
        const libre = P(z.x+fx*sg*6*s,z.y+15*s), fin = mezcla(libre,pinza,atando);
        const pts = [];
        for(let i=0;i<=6;i++){
          const u=i/6, arco=Math.sin(Math.PI*u);
          pts.push(P(lerp(z.x,fin.x,u)+arco*(2+3*u)*Math.sin(t*8+sg)*flojo*s,
                     lerp(z.y,fin.y,u)+arco*(2+5*flojo)*s));
        }
        traza(pts);
      }
    }
    if (atado > 0) {
      g.globalAlpha = atado;
      for (const sg of [-1, 1]) {
        g.beginPath(); g.ellipse(z.x + sg * 7 * s, z.y - 3 * s, 7 * s, 4 * s, sg * 0.4, 0, TAU); g.lineWidth = 4.2 * s; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 2.2 * s; g.strokeStyle = "#f4f1ea"; g.stroke();
        traza([P(z.x, z.y), P(z.x + sg * 6 * s, z.y + 10 * s)]);
      }
    }
    g.restore();
  }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  class BromaDelCubo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !RO.listo()) return;
      if (!fondo) { fondo = creaFondo(); cajas = creaCajas(); }
      const oG = pose("g", t), oR = pose("r", t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      let tb = 0;
      for (const [t0, a] of [[T.cae, 6]]) if (t >= t0) tb += a * Math.exp(-(t - t0) * 7) * suave(fase(t, t0, t0 + 0.03));
      g.save();
      if (tb > 0.05) g.translate(ruido(t * 40) * tb, ruido(t * 40 + 13) * tb * 0.7);
      g.drawImage(fondo, -MARG, -MARG);
      // bombilla y su luz
      const bx = 300 + 3 * Math.sin(t * 1.3), by = 112;
      g.save(); g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(300, 64); g.lineTo(bx, by - 12); g.stroke();
      const cono = g.createRadialGradient(bx, by, 6, bx, by + 120, 330);
      cono.addColorStop(0, "rgba(255,226,150,0.28)"); cono.addColorStop(1, "rgba(255,226,150,0)");
      g.fillStyle = cono; g.fillRect(bx - 340, by - 40, 680, 560);
      g.fillStyle = "#2b2b2b"; g.fillRect(bx - 5, by - 14, 10, 8);
      g.beginPath(); g.arc(bx, by, 9, 0, TAU); g.fillStyle = "#fff3c4"; g.fill(); g.lineWidth = 2; g.stroke();
      g.restore();

      const Hj = hoja(t);
      const cb = cuboEstado(t);
      // sombras
      sombra(g, CHX + 4, CHY + 2, 0.3, 44);
      sombra(g, BX, BY + 2, 0.3, 44);
      const pG = oG.p, pR = oR.p;
      sombra(g, pG.x, pG.suelo, 0.25, 46);
      if (pR.suelo > FW) sombra(g, pR.x, pR.suelo, 0.25, 46);
      charco(g, t, oG);

      // Rodri dentro del almacén: se ve por el hueco y la hoja le tapa
      const rDentro = pR.suelo < FW + 3;
      if (rDentro && t > T.rSale0 - 0.6) { const os = 0.62 * (1 - fase(pR.suelo, 462, FW + 2));
        enCapa(g, RO, oR, t, true, os < 0.01 ? null : oc => { oc.fillStyle = `rgba(14,9,6,${os})`; oc.fillRect(-MARG, -MARG, W + 2 * MARG, H + 2 * MARG); }); }
      notas(g, t, oR);
      dibHoja(g, Hj);
      crujido(g, t);
      // el cubo siempre va detrás de Guillermo (la puerta está detrás de él) hasta que se cae
      if (cb.tipo === "puerta") dibCuboMundo(g, cb, t);
      // barril, silla y personajes por profundidad
      const zG = pG.suelo + (t > T.empuja0 && t < T.baja1 ? 6 : 0);
      const lista = [];
      lista.push({ z: BY - 2, f: () => dibBarril(g) });
      lista.push({ z: CHY, f: () => { dibSilla(g, CHX, CHY); if (cb.tipo === "silla") dibCuboMundo(g, cb, t); } });
      if (cb.tipo === "mano") lista.push({ z: Math.max(CHY + 0.5, zG - 0.5), f: () => dibCuboMundo(g, cb, t) });
      lista.push({ z: Math.max(CHY + 1, zG), f: () => {
        if (t >= T.cae) dibujaEnCapa(g, oG, t, tramo(t, T.cae + 0.05, T.cae + 0.6));
        else dibPersonaje(g, G, oG, t, false);
      } });
      if (!rDentro) lista.push({ z: pR.suelo, f: () => { dibPersonaje(g, RO, oR, t, false); cordon(g, t, oR); } });
      lista.sort((a, b) => a.z - b.z);
      for (const it of lista) it.f();
      // el cubo cayendo
      if (cb.tipo === "cae") dibCuboCayendo(g,t,cb);
      dibAguaVuelco(g,t);
      salpicadurasCubo(g, t);
      // cajas en primer término (Guillermo se esconde detrás)
      g.drawImage(cajas.c, cajas.ox, cajas.oy);
      risitas(g, t, oG, dentro(t, T.frota0 + 0.1, T.frota0 + 0.2, T.frota1 - 0.1, T.frota1) + dentro(t, T.risita0 + 0.1, T.risita0 + 0.2, T.risita1 - 0.1, T.risita1));
      chapuzon(g, t, oG);
      if (t >= T.cae) { const cp = cuboCabezaPant(oG, t); impacto(g, t, T.cae, cp.x, cp.y + 4, 52); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  function dibCuboMundo(g, cb, t) {
    const vista = clamp((cb.y - CU.H * cb.sc * 0.5 - H0) / 260, -0.35, 0.35);
    const agua = 0.85;
    const asa = anguloAsa(t);
    g.save(); g.translate(cb.x, cb.y); g.rotate(cb.ang); g.scale(cb.sc, cb.sc);
    dibCubo(g, { vista, agua, asa, inclAgua: -cb.ang * 0.8 });
    g.restore();
  }
  function asaMojada(t) {
    const age=Math.max(0,t-T.cae);
    return Math.PI/2+0.85+0.2*Math.sin(age*14)*Math.exp(-age*3);
  }
  function estadoCaida(t) {
    const u=fase(t,T.vuelca,T.cae), a=cuboPuerta(T.vuelca), b=cuboCabezaPant(poseFija("g0",T.cae),T.cae);
    const uu=entrada(u)*0.7+suave(u)*0.3, dAng=(b.ang-a.ang+TAU)%TAU;
    return {x:lerp(a.x,b.x,suave(u))-10*Math.sin(Math.PI*u), y:lerp(a.y,b.y,uu)-26*Math.sin(Math.PI*u),
      ang:a.ang+dAng*suave(u), sc:lerp(a.sc,b.sc,u), asa:lerp(anguloAsa(T.vuelca),asaMojada(T.cae),suave(u))};
  }
  function aguaVuelco(t,i) {
    const t0=T.vuelca+0.035+i*0.017, age=t-t0;
    if (age<0||age>0.58) return null;
    const cb=estadoCaida(t0), labio=puntoCubo(cb,CU.wT/2-2-i*2.4,-CU.H);
    return {x:labio.x+(30+55*hash(i+2))*age,y:labio.y+(-48-24*hash(i+6))*age+690*age*age,
      a:tramo(age,0,0.022)*(1-tramo(age,0.36,0.58)),r:3.5+2*hash(i+3)};
  }
  function dibCuboCayendo(g,t,cb) {
    const u=fase(t,T.vuelca,T.cae);
    g.save(); g.translate(cb.x,cb.y); g.rotate(cb.ang); g.scale(cb.sc,cb.sc);
    dibCubo(g,{vista:-0.35,agua:0.85*(1-tramo(u,0.15,0.86)),asa:cb.asa,mojado:true,tapada:u>0.98}); g.restore();
  }
  function dibAguaVuelco(g,t) {
    if(t<T.vuelca||t>T.cae+0.58)return;
    for(let i=0;i<7;i++){const q=aguaVuelco(t,i);if(q)gota(g,q.x,q.y,q.r,q.a,0);}
  }

  registrar({ id: "00114.2", nombre: "Guillermo y Rodri · La broma del cubo", crear: () => new BromaDelCubo() });
  // diagnóstico: estiramiento de cada brazo (1 = brazo recto) para revisar el alcance
  function diag(t) {
    const out = {};
    for (const [who, R] of [["g", G], ["r", RO]]) {
      const o = pose(who, t), p = o.p, T0 = R.tronco(p);
      for (const [lado, HH, L] of [["cerca", R.HOMBRO_C, R.BRAZO_C_L], ["lejos", R.HOMBRO, R.BRAZO_L]]) {
        const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
        const h = T0(HH), mu = m.mu ?? -1.75, w = P(m.x + Math.cos(mu) * R.MUNECA_R * R.JK, m.y + Math.sin(mu) * R.MUNECA_R * R.JK);
        out[who + "_" + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / L).toFixed(3);
      }
    }
    return out;
  }
  window.__A2D_00114_2 = { pose: t => ({ g: pose("g", t), r: pose("r", t) }), T, DUR, diag, cuboEstado, hoja, CU, CHX, CHY, SEAT, puntos, cuboPuerta, cuboCabezaPant, puntoBordeAtras, retratoAPant, manoPant, aPantF, puntoToque, puntaIndice, lazoPant, cuboEnCabeza, H0, toma: poseFija, anguloAsa, largoAsa, puntoCubo, dibCubo, estadoCaida, asaMojada, aguaVuelco, primerContactoAgua, gotaRodri, coronillaRodri, charco, dibPersonaje };
})();
