"use strict";
/* 00066 · Guillermo y Deivi · El globo de helio
 *
 * Negro → salón de fiestas: pared verde azulado con lunares, banderines de colores, serpentinas que
 * cuelgan del techo, una mesa con tarta y vasos a la izquierda, regalos apilados a la derecha y, entre
 * los dos, una bombona de helio con un ramo de globos atados a la válvula. Guillermo y Deivi, con las
 * manos en los bolsillos → Deivi mira a Guillermo con picardía, da un paso hacia el ramo, se lleva el
 * globo amarillo a la boca y aspira un poco (el globo se encoge y a él se le hincha el pecho) → «habla»:
 * de su boca salen notitas agudas que suben bailando; Guillermo se parte de risa, señalándole, con la
 * mano en la barriga y lágrimas (Deivi ya ha soltado el globo, que vuelve al ramo) → Guillermo levanta el
 * dedo («¡me toca!»), coge el globo rojo, lo arranca de la válvula, mira a cámara muy chulo con el globo
 * junto a la cara, se lo lleva a la boca y se lo traga entero: el globo se vacía mientras a él se le hinchan
 * los carrillos, el pecho y la barriga hasta quedar redondo → intenta decir algo y le sale un «pip» → se
 * pone de puntillas y despega: suelta el pellejo del globo, que cae revoloteando, y sube despacio,
 * pataleando y braceando, hasta darse con la cabeza en el techo entre los globos que ya estaban allí; se
 * queda flotando, cabeceando contra el techo → Deivi se ríe tapándose la boca, tiene una idea, se pone de
 * puntillas bajo él, le agarra el tobillo de un brinco y tira hacia abajo como de un globo (Guillermo se
 * queda tumbado de lado en el aire); saca del bolsillo una cinta rizada, se la ata al tobillo con un lazo
 * y vuelve a meter esa mano en el bolsillo → suelta el tobillo: Guillermo sube hasta que la cinta se tensa
 * y se queda flotando, meciéndose, atado a la mano de Deivi → Deivi guiña un ojo a cámara; a Guillermo se
 * le escapa otro «pip» → negro.
 *
 * El globo de cada uno se calcula en cada fotograma desde la mano que lo lleva (y la cinta, desde la
 * válvula o desde la mano). El hinchazón es torsoEsc + mofletes + una barriga en `capaTronco`. Mientras
 * Deivi le tiene agarrado, Guillermo se dibuja girado alrededor de su tobillo (como un globo que se
 * inclina hacia la cuerda). Sin textos (las notas son solo dibujos). Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, entrada, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, Dv = Deivi;
  const S = 0.28, SUELO = 565, TECHO = -200;
  const DUR = 14.9;
  const T = {
    dMira: 0.5, dPaso0: 0.75, dPaso1: 1.12, dAlcanza0: 0.82, dAgarra: 1.2, dBoca: 1.52,
    dInhala0: 1.58, dInhala1: 2.12, dSuelta: 2.22, dVuelve0: 2.28, dVuelve1: 2.66, habla0: 2.62, habla1: 3.75,
    gRie0: 2.84, gRie1: 4.2,
    gDedo: 4.2, gPaso0: 4.4, gPaso1: 4.7, gAlcanza0: 4.5, gAgarra: 4.84, gTira: 4.96, gPasa: 5.22, gBoca: 5.72,
    gChulo0: 5.18, gChulo1: 5.6, gInhala0: 5.8, gInhala1: 7.15,
    dOh: 6.4, pip: 7.5, despega: 7.9, suelta: 8.1, cima: 9.4,
    dRie0: 8.45, dRie1: 9.4, dIdea: 9.5, dAnda0: 9.66, dAnda1: 10.2,
    dAlza: 10.15, coge: 10.52, tira0: 10.56, tira1: 11.3,
    bols0: 11.24, bols1: 11.58, ata0: 11.7, lazo: 12.22, suelta2: 12.46, sube1: 13.24,
    guino: 13.5, pip2: 13.76, fin: 14.3
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const DF = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const AGARRA = DF(0.35, 0.4, 0.38, 0.36), PALMA = DF(1, 1, 1, 1), RELAJ = DF(0.6, 0.55, 0.5, 0.45), SENALA = DF(0.2, 1, 0, 0), BOLS = DF(0.4, 0.4, 0.4, 0.4);
  const envolver = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));
  const dentro = (t, a, b, c, d) => tramo(t, a, b) * (1 - tramo(t, c, d));
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const TINTA = "#0b0a0e", CAMISETA_G = "rgb(30,30,36)", PIEL_G = "rgb(254,181,116)";
  let MATRIZ = null;                                   // transformación de la cámara (para dibujar en pantalla desde las manos)
  const enPantalla = (g, f) => { g.save(); g.setTransform(MATRIZ); f(); g.restore(); };

  /* Pistas de una mano: [t0, t1, objetivo, curva]; cada objetivo se resuelve en cada fotograma (sigue a lo que
   * agarra) y se mezcla con suavidad. El giro de la muñeca va por el camino corto. */
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: c.mu + envolver(d.mu - c.mu) * k, puno: lerp(c.puno, d.puno, k), dedos: DD(c.dedos, d.dedos, k) };
    }
    return c;
  }
  // un punto de la mano (unidades de la mano: dedos hacia +y, pulgar hacia +x) en pantalla
  function puntoMano(rig, p, m, lx, ly) {
    const a = m.mu + Math.PI / 2, k = rig.JK * (m.puno ?? 1);
    return rig.aPantalla(p, { x: m.x + k * (lx * Math.cos(a) - ly * Math.sin(a)), y: m.y + k * (lx * Math.sin(a) + ly * Math.cos(a)) });
  }
  const PUNO = [1, 9];                                 // donde queda lo que agarra el puño

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.2,
    dientes: 1, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= fondo: salón de fiestas ================= */
  let fondo = null;
  const FX = -100, FY = TECHO - 50, FW = W + 200, FH = H + 50 - FY;
  const YPARED = 455;                                  // pie de la pared (empieza el suelo)
  const VAL = { x: 515, y: 316 };                      // válvula de la bombona (de aquí salen las cintas del ramo)
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = FW; c.height = FH; const g = c.getContext("2d");
    g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // techo (en perspectiva: se ve un poco por debajo) con moldura
    const tg = g.createLinearGradient(0, FY, 0, TECHO); tg.addColorStop(0, "#d9cdb4"); tg.addColorStop(1, "#efe5cf");
    g.fillStyle = tg; g.fillRect(FX, FY, FW, TECHO - FY + 1);
    // pared
    const pg = g.createLinearGradient(0, TECHO, 0, YPARED); pg.addColorStop(0, "#1d5d68"); pg.addColorStop(0.55, "#23707b"); pg.addColorStop(1, "#1b5862");
    g.fillStyle = pg; g.fillRect(FX, TECHO, FW, YPARED - TECHO);
    // lunares suaves
    for (let fy = 0, y = TECHO + 40; y < YPARED - 70; fy++, y += 46) for (let x = FX + (fy % 2) * 30; x < FX + FW; x += 60) {
      g.fillStyle = "rgba(255,255,255,0.06)"; g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill(); }
    // moldura del techo
    g.fillStyle = "#f6efdf"; g.fillRect(FX, TECHO, FW, 14); g.fillStyle = "#cdbf9f"; g.fillRect(FX, TECHO + 14, FW, 5);
    g.strokeStyle = "#8f7f62"; g.lineWidth = 2; g.beginPath(); g.moveTo(FX, TECHO); g.lineTo(FX + FW, TECHO); g.moveTo(FX, TECHO + 19); g.lineTo(FX + FW, TECHO + 19); g.stroke();
    // zócalo de madera (friso) en la parte baja de la pared
    g.fillStyle = "#16474f"; g.fillRect(FX, YPARED - 92, FW, 92);
    g.fillStyle = "#e9d9b4"; g.fillRect(FX, YPARED - 96, FW, 7);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let x = FX + 20; x < FX + FW; x += 96) { g.strokeRect(x, YPARED - 80, 76, 66); }
    g.fillStyle = "#3a2a1c"; g.fillRect(FX, YPARED - 8, FW, 8);
    // serpentinas del techo (ondas de papel pinocho)
    const SERP = [["#ffd23f", -60, 260, 70], ["#ff5aa5", 200, 470, 58], ["#7be0ff", 700, 980, 66], ["#9cf06a", 900, 1120, 54]];
    for (const [col, x0, x1, comba] of SERP) {
      g.strokeStyle = col; g.lineWidth = 7; g.beginPath();
      for (let i = 0; i <= 50; i++) { const k = i / 50, x = lerp(x0, x1, k), y = TECHO + 18 + comba * 4 * k * (1 - k) + 3 * Math.sin(k * 40);
        i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 1.5; g.stroke();
    }
    // tiras que cuelgan
    for (const [x, col, L] of [[60, "#ffd23f", 120], [310, "#ff5aa5", 90], [760, "#7be0ff", 110], [1010, "#9cf06a", 100]]) {
      g.strokeStyle = col; g.lineWidth = 5; g.beginPath();
      for (let i = 0; i <= 20; i++) { const y = TECHO + 18 + i * L / 20, xx = x + 5 * Math.sin(i * 0.9); i ? g.lineTo(xx, y) : g.moveTo(xx, y); }
      g.stroke();
    }
    // banderines
    const BAND = ["#ff5a5a", "#ffd23f", "#4fb3ff", "#ff8fd0", "#8ee06a", "#ff9a3c"];
    for (const [x0, x1, y0, comba, n] of [[FX + 20, 470, 28, 46, 9], [470, FX + FW - 20, 28, 50, 10]]) {
      const pts = []; for (let i = 0; i <= n; i++) { const k = i / n; pts.push({ x: lerp(x0, x1, k), y: y0 + comba * 4 * k * (1 - k) }); }
      g.strokeStyle = "#f2ead6"; g.lineWidth = 2; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
      for (let i = 0; i < n; i++) { const a = pts[i], b = pts[i + 1], m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        g.fillStyle = BAND[(i + (x0 > 400 ? 3 : 0)) % BAND.length]; g.beginPath(); g.moveTo(lerp(a.x, b.x, 0.12), lerp(a.y, b.y, 0.12));
        g.lineTo(lerp(a.x, b.x, 0.88), lerp(a.y, b.y, 0.88)); g.lineTo(m.x, m.y + 34); g.closePath(); g.fill();
        g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1.5; g.stroke(); }
    }
    // suelo de tarima
    const sg = g.createLinearGradient(0, YPARED, 0, H + 50); sg.addColorStop(0, "#7c4a2a"); sg.addColorStop(1, "#a96a3c");
    g.fillStyle = sg; g.fillRect(FX, YPARED, FW, H + 50 - YPARED);
    const VP = { x: 512, y: -380 };
    const colX = (x, y) => VP.x + (x - VP.x) * (y - VP.y) / (YPARED - VP.y);
    g.strokeStyle = "rgba(40,20,8,0.45)"; g.lineWidth = 1.6;
    for (let x = FX - 400; x < FX + FW + 400; x += 58) { g.beginPath(); g.moveTo(colX(x, YPARED), YPARED); g.lineTo(colX(x, H + 50), H + 50); g.stroke(); }
    for (let r = 0, y = YPARED + 12, d = 14; y < H + 50; r++, y += d, d *= 1.25) {
      for (let x = FX - 400 + (r % 3) * 37; x < FX + FW + 400; x += 116) { const xa = colX(x, y), xb = colX(x, y + d);
        g.beginPath(); g.moveTo(xa, y); g.lineTo(xb, y + d); g.stroke(); }
      g.strokeStyle = "rgba(40,20,8,0.22)"; g.beginPath(); g.moveTo(FX, y); g.lineTo(FX + FW, y); g.stroke(); g.strokeStyle = "rgba(40,20,8,0.45)";
    }
    g.fillStyle = "rgba(255,220,170,0.08)"; g.fillRect(FX, YPARED, FW, 30);
    // mesa con tarta y vasos (izquierda)
    g.save(); g.translate(96, YPARED + 22);
    g.fillStyle = "#5a3a22"; g.fillRect(-84, -6, 10, 96); g.fillRect(74, -6, 10, 96);
    g.fillStyle = "#f4f0ea"; g.beginPath(); g.moveTo(-104, -76); g.lineTo(104, -76); g.lineTo(110, -10); g.quadraticCurveTo(0, 6, -110, -10); g.closePath(); g.fill();
    g.strokeStyle = "#c9c0b2"; g.lineWidth = 2; g.stroke();
    for (let x = -96; x < 100; x += 24) { g.strokeStyle = "rgba(255,90,165,0.55)"; g.beginPath(); g.moveTo(x, -76); g.quadraticCurveTo(x + 12, -64, x + 24, -76); g.stroke(); }
    // tarta
    g.fillStyle = "#ffb6d3"; g.fillRect(-42, -128, 84, 52); g.fillStyle = "#fff4f8"; g.fillRect(-46, -134, 92, 12);
    g.fillStyle = "#ff5aa5"; for (let x = -38; x < 40; x += 13) { g.beginPath(); g.arc(x, -100, 3, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-42, -128, 84, 52);
    for (const [x, col] of [[-22, "#4fb3ff"], [0, "#ffd23f"], [22, "#8ee06a"]]) { g.fillStyle = col; g.fillRect(x - 3, -156, 6, 22);
      g.fillStyle = "#ffcf5a"; g.beginPath(); g.ellipse(x, -162, 4, 7, 0, 0, Math.PI * 2); g.fill(); }
    // vasos
    for (const [x, col] of [[-80, "#4fb3ff"], [-64, "#ff5a5a"], [66, "#ffd23f"], [82, "#8ee06a"]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 7, -102); g.lineTo(x + 7, -102); g.lineTo(x + 5, -78); g.lineTo(x - 5, -78); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke(); g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(x - 4, -100, 2, 18); }
    g.restore();
    // regalos (derecha)
    g.save(); g.translate(930, YPARED + 30);
    for (const [x, y, w, h, col, cin] of [[-60, -64, 70, 64, "#4fb3ff", "#ffd23f"], [12, -50, 56, 50, "#ff5aa5", "#ffffff"], [-34, -112, 52, 48, "#8ee06a", "#ff5a5a"]]) {
      g.fillStyle = col; g.fillRect(x, y, w, h); g.fillStyle = cin; g.fillRect(x + w / 2 - 5, y, 10, h); g.fillRect(x, y + h / 2 - 5, w, 10);
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x, y, w, h);
      g.fillStyle = cin; g.beginPath(); g.ellipse(x + w / 2 - 10, y - 6, 11, 6, -0.4, 0, Math.PI * 2); g.ellipse(x + w / 2 + 10, y - 6, 11, 6, 0.4, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
    // bombona de helio (sin letras) apoyada en la pared
    g.save(); g.translate(VAL.x, 0);
    const bx = g.createLinearGradient(-30, 0, 30, 0); bx.addColorStop(0, "#5f7d96"); bx.addColorStop(0.35, "#a9c3d6"); bx.addColorStop(1, "#4b647a");
    g.fillStyle = bx; g.beginPath(); g.moveTo(-28, 470); g.lineTo(-28, 360); g.quadraticCurveTo(-28, 334, 0, 332); g.quadraticCurveTo(28, 334, 28, 360); g.lineTo(28, 470); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#ff5a5a"; g.fillRect(-28, 392, 56, 12); g.strokeRect(-28, 392, 56, 12);
    g.fillStyle = "#c79a3a"; g.fillRect(-7, 318, 14, 16); g.strokeRect(-7, 318, 14, 16);
    g.fillStyle = "#e8c15a"; g.beginPath(); g.arc(0, 316, 6, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillRect(6, 322, 12, 5); g.strokeRect(6, 322, 12, 5);
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(0, 472, 34, 6, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    return c;
  }

  /* ================= globos ================= */
  // ramo atado a la válvula: centro en reposo, radio, color
  const RAMO = [
    { c: { x: 462, y: 136 }, r: 25, col: "#ff5aa5" }, { c: { x: 512, y: 102 }, r: 27, col: "#4fb3ff" },
    { c: { x: 562, y: 126 }, r: 25, col: "#8ee06a" }, { c: { x: 520, y: 170 }, r: 24, col: "#b07cff" },
    { c: { x: 580, y: 222 }, r: 24, col: "#ffd23f", id: "amarillo" }, { c: { x: 466, y: 204 }, r: 27, col: "#ff4040", id: "rojo" }
  ];
  const AMA = RAMO[4], ROJO = RAMO[5];
  // globos que ya estaban pegados al techo
  const DEL_TECHO = [[150, 24, "#4fb3ff"], [292, 26, "#ffd23f"], [560, 25, "#ff5aa5"], [688, 24, "#8ee06a"], [835, 26, "#ff4040"], [955, 24, "#b07cff"]];
  const ALTO_G = r => r * 1.16;                         // semieje vertical del globo
  // centro de un globo del ramo en reposo (se mece un poco)
  const angRamo = i => -Math.PI / 2 + (RAMO[i].c.x - VAL.x) * 0.004;
  function centroRamo(i, t) { const b = RAMO[i]; return { x: b.c.x + 4 * Math.sin(t * 1.1 + i * 1.7), y: b.c.y + 2.5 * Math.sin(t * 1.6 + i * 2.3) }; }
  const nudoDe = (c, r, ang) => ({ x: c.x - Math.cos(ang) * (ALTO_G(r) + 2), y: c.y - Math.sin(ang) * (ALTO_G(r) + 2) });
  const centroDe = (n, r, ang) => ({ x: n.x + Math.cos(ang) * (ALTO_G(r) + 2), y: n.y + Math.sin(ang) * (ALTO_G(r) + 2) });
  // globo con el nudo en n, apuntando en la dirección ang (−π/2: hacia arriba)
  function dibGlobo(g, n, r, col, ang, arruga = 0) {
    if (r < 0.5) return;
    const c = centroDe(n, r, ang);
    g.save(); g.translate(c.x, c.y); g.rotate(ang + Math.PI / 2); g.lineJoin = "round";
    const rx = r, ry = ALTO_G(r);
    g.beginPath(); g.moveTo(0, ry);
    g.bezierCurveTo(rx * 0.62, ry * 0.92, rx * 1.02, ry * 0.32, rx, -ry * 0.12);
    g.bezierCurveTo(rx * 0.98, -ry * 0.78, rx * 0.5, -ry, 0, -ry);
    g.bezierCurveTo(-rx * 0.5, -ry, -rx * 0.98, -ry * 0.78, -rx, -ry * 0.12);
    g.bezierCurveTo(-rx * 1.02, ry * 0.32, -rx * 0.62, ry * 0.92, 0, ry); g.closePath();
    g.fillStyle = col; g.fill();
    g.save(); g.clip(); g.fillStyle = "rgba(0,0,0,0.16)"; g.beginPath(); g.ellipse(rx * 0.35, ry * 0.3, rx * 0.9, ry * 0.95, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = col; g.beginPath(); g.ellipse(-rx * 0.08, -ry * 0.1, rx * 0.86, ry * 0.88, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(-rx * 0.4, -ry * 0.45, rx * 0.17, ry * 0.26, 0.55, 0, Math.PI * 2); g.fill();
    if (arruga > 0.01) { g.strokeStyle = `rgba(0,0,0,${0.35 * arruga})`; g.lineWidth = 1.2;
      for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * rx * 0.4, ry * 0.6); g.quadraticCurveTo(i * rx * 0.55 + 2, 0, i * rx * 0.3, -ry * 0.6); g.stroke(); } }
    // nudo
    g.fillStyle = col; g.beginPath(); g.moveTo(-3.5, ry + 4.5); g.lineTo(3.5, ry + 4.5); g.lineTo(0, ry - 1); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.restore();
  }
  // pellejo del globo vacío (colgando de n hacia ang)
  function dibPellejo(g, n, col, ang, t) {
    g.save(); g.translate(n.x, n.y); g.rotate(ang + Math.PI / 2); g.lineJoin = "round";
    const w = 1.5 * Math.sin(t * 9);
    g.beginPath(); g.moveTo(-2.5, 1); g.quadraticCurveTo(-8, -6, -6 + w, -14); g.quadraticCurveTo(-3, -20, 1 + w, -19);
    g.quadraticCurveTo(7, -16, 5, -8); g.quadraticCurveTo(4, -2, 2.5, 1); g.closePath();
    g.fillStyle = col; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-3, -6); g.lineTo(1, -13); g.moveTo(2, -4); g.lineTo(3, -11); g.stroke();
    g.fillStyle = col; g.beginPath(); g.moveTo(-3, 4); g.lineTo(3, 4); g.lineTo(0, -1); g.closePath(); g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }

  /* ---------- cintas ---------- */
  function trazoCinta(g, pts, col, ancho = 2) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const f = () => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); };
    f(); g.strokeStyle = "rgba(10,8,14,0.6)"; g.lineWidth = ancho + 1.6; g.stroke();
    f(); g.strokeStyle = col; g.lineWidth = ancho; g.stroke();
    g.restore();
  }
  // cinta entre dos puntos con algo de comba (comba en px hacia abajo) y un rizo suave
  function cintaEntre(a, b, comba, t, fase0 = 0) {
    const pts = [], n = 16, L = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
    for (let i = 0; i <= n; i++) { const k = i / n, w = 1.6 * Math.sin(k * L / 7 + fase0 + t * 2) * Math.sin(Math.PI * k);
      pts.push({ x: lerp(a.x, b.x, k) + nx * w, y: lerp(a.y, b.y, k) + ny * w + comba * 4 * k * (1 - k) }); }
    return pts;
  }
  // cinta rizada que cuelga de un punto (largo en px)
  function cintaCuelga(a, L, t, fase0 = 0, vaiven = 0) {
    const pts = [], n = Math.max(4, Math.round(L / 4));
    for (let i = 0; i <= n; i++) { const s = L * i / n, k = s / Math.max(L, 1);
      pts.push({ x: a.x + 4.5 * Math.sin(s * 0.42 + fase0) * k + vaiven * k * k * 14 + 3 * Math.sin(t * 2.3 + fase0) * k, y: a.y + s * (1 - 0.08 * k) }); }
    return pts;
  }

  /* ================= Guillermo ================= */
  const CG = {
    mira: E({ mx: 0.9, my: 0.1, sonr: 0.3, ancho: 0.95 }),
    pilla: E({ mx: 0.95, my: 0.0, sonr: 0.45, ancho: 0.95, sd: 6, si: 14, gi: 0.1 }),
    risa: E({ mx: 0.9, my: 0.2, c: 0.85, h: 1, sonr: 0.85, abre: 28, ancho: 1.05, sd: 16, si: 16, rub: 0.5 }),
    idea: E({ mx: 0.6, my: -0.3, sonr: 0.6, ancho: 1, abre: 6, sd: 20, si: 20, gd: 0.15, gi: 0.15, iris: 1.1 }),
    alcanza: E({ mx: 0.9, my: -0.35, sonr: 0.5, ancho: 0.9, sd: 12, si: 12 }),
    chulo: E({ mx: 0.02, my: 0.05, sonr: 0.62, ancho: 0.95, sd: 4, si: 18, gi: 0.15, c: 0.18 }),
    sorbe: E({ mx: 0.4, my: -0.1, sonr: 0, ancho: 0.4, abre: 2, sd: 14, si: 14, iris: 0.95 }),
    hinchado: E({ mx: 0.2, my: 0.1, sonr: 0.05, ancho: 0.38, abre: 0, sd: 22, si: 22, iris: 0.8 }),
    pip: E({ mx: 0.05, my: 0.05, sonr: 0, ancho: 0.32, abre: 7, sd: 26, si: 26, iris: 0.72 }),
    susto: E({ mx: 0.1, my: 0.6, sonr: -0.1, ancho: 0.4, abre: 3, sd: 30, si: 30, iris: 0.68 }),
    panico: E({ mx: -0.2, my: 0.7, sonr: -0.2, ancho: 0.42, abre: 2, sd: 28, si: 28, gd: -0.06, gi: -0.06, iris: 0.72 }),
    golpe: E({ mx: 0, my: 0, c: 1, z: 1, sonr: -0.15, ancho: 0.4, abre: 0, sd: 4, si: 4 }),
    abajo: E({ mx: 0.75, my: 0.9, sonr: 0.0, ancho: 0.4, abre: 0, sd: 16, si: 20, iris: 0.85 }),
    alivio: E({ mx: 0.7, my: 0.85, c: 0.3, sonr: 0.3, ancho: 0.45, sd: 8, si: 12 }),
    feliz: E({ mx: 0.05, my: 0.15, c: 0.25, sonr: 0.45, ancho: 0.45, sd: 12, si: 14 }),
    pip2: E({ mx: 0.05, my: 0.1, c: 0.1, sonr: 0.2, ancho: 0.32, abre: 7, sd: 24, si: 24, iris: 0.8 })
  };
  const GUION_CG = [
    [T.dMira + 0.1, T.dMira + 0.3, "mira"], [T.dAgarra, T.dAgarra + 0.2, "pilla"], [T.gRie0 - 0.04, T.gRie0 + 0.1, "risa"],
    [T.gDedo - 0.06, T.gDedo + 0.12, "idea"], [T.gAlcanza0, T.gAlcanza0 + 0.2, "alcanza"], [T.gChulo0, T.gChulo0 + 0.12, "chulo"],
    [T.gBoca - 0.1, T.gBoca + 0.05, "sorbe"], [T.gInhala1 - 0.3, T.gInhala1, "hinchado"], [T.pip - 0.03, T.pip + 0.04, "pip"],
    [T.pip + 0.3, T.pip + 0.4, "hinchado"], [T.despega - 0.05, T.despega + 0.08, "susto"], [T.despega + 0.4, T.despega + 0.6, "panico"],
    [T.cima - 0.02, T.cima + 0.04, "golpe"], [T.cima + 0.3, T.cima + 0.45, "abajo"], [T.coge, T.coge + 0.12, "susto"],
    [T.tira0 + 0.3, T.tira0 + 0.5, "abajo"], [T.lazo - 0.1, T.lazo + 0.2, "alivio"], [T.sube1 - 0.2, T.sube1 + 0.1, "feliz"],
    [T.pip2 - 0.03, T.pip2 + 0.04, "pip2"], [T.pip2 + 0.3, T.pip2 + 0.45, "feliz"]
  ];
  const PARP_G = [0.3, 1.3, 2.25, 4.6, 6.4, 7.12, 8.75, 10.1, 11.5, 12.9, 14.05];

  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0.02 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    mira: CuG({ torso: 0.02, cab: 0.06 }),
    risa: CuG({ torso: 0.16, cab: 0.18, pel: 16 }),
    risaAtras: CuG({ torso: -0.08, cab: -0.2, pel: 4 }),
    idea: CuG({ torso: -0.03, cab: -0.06 }),
    alcanza: CuG({ torso: 0.08, cab: -0.1, dx: 6 }),
    trae: CuG({ torso: 0.02, cab: -0.04 }),
    chulo: CuG({ torso: -0.04, cab: -0.05 }),
    sorbe: CuG({ torso: -0.07, cab: -0.14, pel: -4 }),
    hinchado: CuG({ torso: -0.02, cab: -0.02 })
  };
  const GUION_G = [
    [T.dMira + 0.1, T.dMira + 0.35, "mira"], [T.gRie0, T.gRie0 + 0.2, "risaAtras", salida], [T.gRie0 + 0.35, T.gRie0 + 0.6, "risa"],
    [T.gRie1 - 0.45, T.gRie1 - 0.2, "risaAtras"], [T.gRie1 - 0.1, T.gDedo + 0.15, "idea"], [T.gAlcanza0, T.gAgarra, "alcanza"],
    [T.gTira, T.gTira + 0.3, "trae"], [T.gChulo0, T.gChulo0 + 0.2, "chulo"], [T.gChulo1, T.gInhala0 + 0.3, "sorbe"],
    [T.gInhala1 - 0.2, T.gInhala1 + 0.2, "hinchado"]
  ];
  const XG0 = 345, XG1 = 378;
  const PASOS_G = {
    lejos: [[0, 0, XG0 + 32], [T.gPaso0, T.gPaso0 + 0.18, XG1 + 32]],
    cerca: [[0, 0, XG0 - 30], [T.gPaso0 + 0.13, T.gPaso0 + 0.31, XG1 - 30]]
  };
  function pie(lista, t) {
    let x = lista[0][2], alza = 0, u = 1;
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, x1] = lista[i]; if (t <= t0) break;
      const k = fase(t, t0, t1); if (k < 1) { alza = Math.sin(Math.PI * k); u = k; }
      x = lerp(x, x1, suave(k));
    }
    return { x, alza, u };
  }
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const PIERNA_G = 541;
  // hinchazón de Guillermo (0 → 1) y vuelo
  const inflado = t => tramo(t, T.gInhala0 + 0.08, T.gInhala1 + 0.06, k => k * k * (3 - 2 * k) * 0.85 + 0.15 * k);
  const cuelga = t => tramo(t, T.despega - 0.12, T.despega + 0.45);
  // subida: arranca despacio y llega al techo con algo de velocidad (golpecito)
  const subida = u => u * u * (2 - u);
  function bamboleo(t) {                              // tras darse en el techo: rebota y cabecea contra él
    const dt = t - T.cima; if (dt <= 0) return 0;
    return 18 * Math.exp(-dt * 3.2) * Math.abs(Math.sin(dt * 6.5)) + 7 * (0.5 - 0.5 * Math.cos(dt * 2.6)) * clamp(dt * 1.5);
  }
  const golpe = t => campana(t, T.cima - 0.03, T.cima + 0.26);
  function xG(t) {
    return 28 * suave(fase(t, T.despega + 0.15, T.cima + 0.25)) + 7 * Math.sin((t - T.despega) * 1.2) * tramo(t, T.despega, T.cima);
  }
  const TOPE_G = { x: 700, y: 182 };                   // lo más alto del pelo (retrato)

  // pose local (sin el giro alrededor del tobillo); `altoFijo` sustituye la altura del vuelo
  function poseLocalG(t, altoFijo) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const inf = inflado(t), cu = cuelga(t), go = golpe(t);
    const respira = Math.sin(t * 2.2 + 0.3) * (1 - inf);
    const risa = dentro(t, T.gRie0, T.gRie0 + 0.12, T.gRie1 - 0.25, T.gRie1);
    const sacude = risa * Math.abs(Math.sin((t - T.gRie0) * 9.5));
    const fl = pie(PASOS_G.lejos, t), fc = pie(PASOS_G.cerca, t);
    const X = (fl.x + fc.x) / 2 - 1 + xG(t);
    const alto = altoFijo ?? altoG(t);
    const p = {
      x: X + b.dx, suelo: SUELO - alto, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + 16 * sacude },
      torso: b.torso + 0.03 * sacude, torsoEsc: { x: 1 + 0.42 * inf + 0.05 * go, y: 1 + 0.06 * inf + respira * 0.004 - 0.06 * go },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * sacude, dx: 0, dy: 0, esc: { x: 1 + 0.1 * inf + 0.04 * go, y: 1 + 0.05 * inf - 0.07 * go } },
      tirasLimpias: true
    };
    // vuelo: tambaleo del cuerpo y la cabeza
    const vu = tramo(t, T.despega, T.despega + 0.5);
    p.torso += vu * (0.05 * Math.sin(t * 2.1) + 0.04 * Math.sin(t * 9) * dentro(t, T.despega + 0.2, T.despega + 0.4, T.cima - 0.2, T.cima));
    p.cabeza.ang += vu * (0.06 * Math.sin(t * 1.7 + 1) + 0.12 * tramo(t, T.cima + 0.3, T.cima + 0.6));
    // pies: de pie, de puntillas antes de despegar y colgando en el aire (las piernas se mecen)
    const punt = tramo(t, T.despega - 0.4, T.despega - 0.05) * (1 - cu);
    const Tr = G.tronco(p);
    for (const lado of ["cerca", "lejos"]) {
      const f = lado === "cerca" ? fc : fl;
      const fx = f.x + xG(t);
      const yP = TOB_G - (lado === "lejos" ? 12 : 0) - 26 * f.alza - 34 * punt;
      const pisa = { x: G.PELVIS.x + (fx - p.x) / S, y: yP };
      const cad = Tr(G.CADERA[lado]), sg = lado === "cerca" ? -1 : 1;
      const fijo = lado === "lejos" ? tramo(t, T.coge - 0.08, T.coge + 0.12) : 0;      // la pierna agarrada: estirada y quieta
      const mece = (1 - fijo) * 22 * Math.sin(t * 2.4 + (sg > 0 ? 0 : 1.9)) + 30 * Math.sin(t * 8.5 + sg) * dentro(t, T.despega + 0.25, T.despega + 0.45, T.cima - 0.3, T.cima);
      const aire = { x: cad.x + sg * 10 * (1 - fijo) + mece, y: G.PELVIS.y + 0.94 * PIERNA_G * (1 + 0.04 * Math.sin(t * 3 + sg)) };
      const q = mezcla(pisa, aire, cu);
      p.piernas[lado] = { tob: q, ang: lerp(0.3 * punt, 0.78 + 0.1 * Math.sin(t * 2.4 + sg) * (1 - fijo), cu) };
    }
    p._cad = Tr(G.CADERA.lejos);
    // cara
    const e = linea(GUION_CG, CG, "mira", t);
    // al aspirar: los ojos se abren cada vez más
    const sorbe = dentro(t, T.gInhala0, T.gInhala0 + 0.1, T.gInhala1, T.gInhala1 + 0.1);
    e.iris -= 0.1 * sorbe * fase(t, T.gInhala0, T.gInhala1); e.sd += 8 * sorbe * fase(t, T.gInhala0, T.gInhala1); e.si += 8 * sorbe * fase(t, T.gInhala0, T.gInhala1);
    e.abre += risa * 6 * Math.abs(Math.sin((t - T.gRie0) * 9.5));
    p.cara = cara(e, e.h > 0.5 || e.z > 0.5 ? 0 : parpadeo(t, PARP_G));
    p.cara.mofletes = inf;
    p.cara.rubor = Math.max(e.rub, 0.35 * inf);
    p._inf = inf;
    p.capaTronco = g => panza(g, inf, t);
    p.capaCabeza = g => carrillo(g, inf);
    return p;
  }
  // altura del vuelo (px): calculada para que el pelo roce el techo
  const ALTO = () => cache("alto", () => { const p = poseLocalG(T.cima, 0); return topeG(p) - (TECHO + 21); });
  const topeG = p => G.aPantalla(p, G.cabeza(p).a(TOPE_G)).y;
  function altoG(t) {
    if (t < T.despega) return 0;
    const u = fase(t, T.despega, T.cima);
    return ALTO() * subida(u) + 5 * Math.sin((t - T.despega) * 3.1) * tramo(t, T.despega + 0.3, T.despega + 0.8) * (1 - tramo(t, T.cima - 0.4, T.cima)) - bamboleo(t);
  }

  /* barriga hinchada (capa del tronco, coordenadas de la hoja: luego se estira con torsoEsc) */
  function panza(g, k, t) {
    if (k < 0.02) return;
    const cx = 252 + 22 * k, cy = 500 - 6 * k, rx = 100 + 36 * k, ry = 140 + 52 * k;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.globalAlpha = clamp(k / 0.3);
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = CAMISETA_G; g.fill();
    g.save(); g.clip();
    g.fillStyle = "rgba(0,0,0,0.45)"; g.beginPath(); g.ellipse(cx - rx * 0.75, cy + ry * 0.25, rx * 0.6, ry * 1.1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(120,120,150,0.22)"; g.beginPath(); g.ellipse(cx + rx * 0.3, cy - ry * 0.42, rx * 0.34, ry * 0.2, 0.55, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(200,200,230,0.28)"; g.beginPath(); g.ellipse(cx + rx * 0.42, cy - ry * 0.5, rx * 0.12, ry * 0.07, 0.55, 0, Math.PI * 2); g.fill();
    // tirantez de la tela: arruguitas que salen del ombligo
    g.strokeStyle = "rgba(90,90,110,0.5)"; g.lineWidth = 3;
    for (const a of [-0.5, 0.1, 0.7]) { g.beginPath(); g.moveTo(cx + rx * 0.2 + Math.cos(a) * 18, cy + ry * 0.2 + Math.sin(a) * 18);
      g.lineTo(cx + rx * 0.2 + Math.cos(a) * 60 * k, cy + ry * 0.2 + Math.sin(a) * 60 * k); g.stroke(); }
    g.restore();
    g.globalAlpha = clamp((k - 0.08) / 0.3);
    g.strokeStyle = TINTA; g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, -Math.PI * 0.18, Math.PI * 1.18); g.stroke();
    g.restore();
  }
  /* carrillo cercano hinchado: brillo redondo y pliegue junto a la comisura (retrato) */
  function carrillo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // la mejilla cercana se sale por la mandíbula (de la oreja a la barbilla)
    const A = { x: 600, y: 684 }, B = { x: 768, y: 842 }, b = 30 * k;
    const c1 = { x: 586 - b * 0.9, y: 748 + b * 0.5 }, c2 = { x: 690 - b * 0.5, y: 850 + b * 0.8 };
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, B.x, B.y); g.lineTo(760, 800); g.lineTo(640, 700); g.closePath();
    g.fillStyle = PIEL_G; g.fill();
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, B.x, B.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.globalAlpha = 0.5 * clamp(k); g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, Math.PI * 2); g.fill();
    g.globalAlpha = clamp(k); g.strokeStyle = TINTA; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(744, 694 - 4 * k); g.quadraticCurveTo(756 - 4 * k, 716, 748, 742 + 3 * k); g.stroke();
    g.restore();
  }

  // manos de Guillermo (mu en ángulo de pantalla: hacia el codo)
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const PISTA_GC = [
    [0, 0, { bols: true }],
    [T.gRie0 + 0.05, T.gRie0 + 0.25, { hom: { x: 46, y: 92 }, mu: -2.5, dedos: PALMA }],
    [T.gRie1 - 0.1, T.gRie1 + 0.2, { bols: true }],
    [T.gPasa - 0.28, T.gPasa, { pasa: true, mu: 2.4, dedos: PALMA }],
    [T.gPasa - 0.04, T.gPasa + 0.04, { pasa: true, mu: 2.4, dedos: AGARRA }],
    [T.gChulo1, T.gBoca, { boca: { x: -1, y: 10 }, mu: 2.25, dedos: AGARRA }],
    [T.gInhala1 + 0.04, T.gInhala1 + 0.36, { hom: { x: -62, y: 70 }, mu: -0.85, dedos: AGARRA }],
    [T.despega - 0.04, T.despega + 0.14, { hom: { x: -84, y: 8 }, mu: -0.1, dedos: AGARRA }],
    [T.suelta - 0.05, T.suelta + 0.05, { hom: { x: -86, y: 4 }, mu: -0.05, dedos: PALMA }],
    [T.suelta + 0.1, T.suelta + 0.3, { rema: -1, mu: -0.4, dedos: PALMA }],
    [T.cima, T.cima + 0.35, { hom: { x: -76, y: 54 }, mu: -0.72, dedos: RELAJ }],
    [T.coge, T.coge + 0.2, { hom: { x: -84, y: 18 }, mu: -0.2, dedos: PALMA }],
    [T.tira1, T.tira1 + 0.4, { hom: { x: -74, y: 58 }, mu: -0.75, dedos: RELAJ }]
  ];
  const PISTA_GL = [
    [0, 0, { bols: true }],
    [T.gRie0 + 0.15, T.gRie0 + 0.35, { hom: { x: 98, y: 4 }, mu: Math.PI - 0.05, dedos: SENALA }],
    [T.gRie1 - 0.15, T.gDedo, { hom: { x: 34, y: -50 }, mu: 1.75, dedos: SENALA }],
    [T.gAlcanza0, T.gAgarra - 0.06, { nudoRojo: true, mu: Math.PI - 0.55, dedos: PALMA }],
    [T.gAgarra - 0.06, T.gAgarra + 0.02, { nudoRojo: true, mu: Math.PI - 0.55, dedos: AGARRA }],
    [T.gTira, T.gTira + 0.08, { nudoRojo: true, dx: -10, dy: 4, mu: Math.PI - 0.5, dedos: AGARRA }, salida],
    [T.gTira + 0.1, T.gPasa - 0.05, { boca: { x: 46, y: 44 }, mu: Math.PI - 0.6, dedos: AGARRA }],
    [T.gChulo1, T.gBoca + 0.05, { globo: true, mu: Math.PI + 0.25, dedos: PALMA }],
    [T.gInhala1 - 0.12, T.gInhala1 + 0.3, { hom: { x: 50, y: 80 }, mu: -2.1, dedos: RELAJ }],
    [T.despega - 0.04, T.despega + 0.14, { hom: { x: 84, y: 6 }, mu: Math.PI + 0.1, dedos: PALMA }],
    [T.despega + 0.3, T.despega + 0.5, { rema: 1, mu: Math.PI + 0.4, dedos: PALMA }],
    [T.cima, T.cima + 0.35, { hom: { x: 76, y: 54 }, mu: -2.42, dedos: RELAJ }],
    [T.coge, T.coge + 0.2, { hom: { x: 84, y: 16 }, mu: Math.PI + 0.2, dedos: PALMA }],
    [T.tira1, T.tira1 + 0.4, { hom: { x: 74, y: 58 }, mu: -2.4, dedos: RELAJ }]
  ];

  const ultG = { t: NaN, p: null };
  function poseG(t) { if (ultG.t !== t) { ultG.p = poseG0(t); ultG.t = t; } return ultG.p; }
  function poseG0(t) {
    const p = poseLocalG(t);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO), boca = G.aPantalla(p, G.boca(p));
    const hcP = G.aPantalla(p, hc), hlP = G.aPantalla(p, hl);
    const resuelve = lado => o => {
      if (o.bols) { const q = Tr(BOLS_G[lado]); return { x: q.x, y: q.y, mu: -1.75, puno: 0, dedos: BOLS }; }
      let q;
      if (o.hom) { const h = lado === "l" ? hlP : hcP; q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      else if (o.boca) q = { x: boca.x + o.boca.x, y: boca.y + o.boca.y };
      else if (o.nudoRojo) { const n = nudoRojoRamo(t); q = { x: n.x + (o.dx || 0), y: n.y + (o.dy || 0) + 6 }; }
      else if (o.pasa) q = { x: boca.x + 46, y: boca.y + 44 };
      else if (o.globo) { const gl = globoRojoEnBoca(t, p); q = { x: gl.c.x + gl.r * 0.62 + 6, y: gl.c.y + gl.r * 0.35 }; }
      else if (o.rema) { const h = o.rema < 0 ? hcP : hlP, w = (t - T.despega) * 8.5 + (o.rema < 0 ? 0 : Math.PI);
        q = { x: h.x + o.rema * (74 + 14 * Math.cos(w)), y: h.y + 24 + 18 * Math.sin(w) }; }
      const hq = G.aHoja(p, q);
      return { x: hq.x, y: hq.y, mu: o.mu, puno: 1, dedos: o.dedos };
    };
    const C = pista(PISTA_GC, t, resuelve("c"));
    p.manoCerca = { x: C.x, y: C.y, ang: 0, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p._agarreC = puntoMano(G, p, p.manoCerca, PUNO[0], PUNO[1]);
    p._boca = boca;
    const L = pista(PISTA_GL, t, resuelve("l"));
    // risa: la mano que señala tiembla con las carcajadas
    const ri = dentro(t, T.gRie0 + 0.2, T.gRie0 + 0.35, T.gRie1 - 0.3, T.gRie1 - 0.1);
    L.y += ri * 10 * Math.sin((t - T.gRie0) * 19) / S;
    // «¡me toca!»: el dedo arriba da un golpecito
    L.y -= 12 * campana(t, T.gDedo - 0.1, T.gDedo + 0.12) / S;
    // brazos sueltos en el aire: se mecen como en el agua
    const flota = tramo(t, T.cima + 0.2, T.cima + 0.6);
    p.manoCerca.x += flota * 8 * Math.sin(t * 1.9) / S; p.manoCerca.y += flota * 7 * Math.sin(t * 2.3 + 1) / S;
    L.x += flota * 8 * Math.sin(t * 1.9 + 2) / S; L.y += flota * 7 * Math.sin(t * 2.3 + 3) / S;
    p.manoLejos = { x: L.x, y: L.y, ang: 0, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p._agarreC = puntoMano(G, p, p.manoCerca, PUNO[0], PUNO[1]);
    p._agarreL = puntoMano(G, p, p.manoLejos, PUNO[0], PUNO[1]);
    // el globo rojo en sus manos
    const gl = globoRojo(t, p);
    if (gl.modo === "lejos") p.manoLejos.objeto = (g, tt) => enPantalla(g, () => dibGloboRojo(g, gl, tt));
    else if (gl.modo === "cerca") p.manoCerca.objeto = (g, tt) => enPantalla(g, () => dibGloboRojo(g, gl, tt));
    p._globo = gl;
    return p;
  }
  // tobillo lejano y espinilla (pantalla, marco local de Guillermo)
  const tobilloL = p => G.aPantalla(p, p.piernas.lejos.tob);
  function espinillaL(p) { const a = p.piernas.lejos.tob, c = p._cad, L = Math.hypot(c.x - a.x, c.y - a.y) || 1;
    return G.aPantalla(p, { x: a.x + (c.x - a.x) / L * 70, y: a.y + (c.y - a.y) / L * 70 }); }

  /* ---------- Guillermo agarrado: se dibuja girado alrededor del tobillo ---------- */
  const XD_ATA = 590, P_ATA = { x: XD_ATA - 80, y: 362 }, PSI_ATA = -1.15;
  const LR = 112;                                      // cinta tensa (del lazo a la mano)
  const XD_FIN = 605, H_FIN = { x: XD_FIN - 86, y: 350 };
  // punto de la cinta en la mano de Deivi (lo fija el guion: no depende de su pose)
  function manoCinta(t) { return mezcla(P_ATA, H_FIN, suave(fase(t, T.suelta2, T.suelta2 + 0.7))); }
  function anguloCinta(t) {
    const dt = t - T.suelta2;
    return 0.7 + 0.16 * Math.sin(dt * 2.4) * Math.exp(-dt * 0.9) * tramo(t, T.suelta2, T.suelta2 + 0.4) + 0.05 * Math.sin(t * 1.3);
  }
  function largoCinta(t) { return LR * salida(fase(t, T.suelta2 + 0.02, T.sube1)); }
  // ancla del tobillo (pantalla) e inclinación del cuerpo
  function ancla(t) {
    const A0 = cache("A0", () => tobilloL(poseLocalG(T.coge)));
    if (t < T.tira1) {
      const u = 0.55 * suave(fase(t, T.tira0, T.tira0 + 0.32)) + 0.45 * suave(fase(t, T.tira0 + 0.38, T.tira1));
      const tiron = 6 * campana(t, T.tira0, T.tira0 + 0.2) + 6 * campana(t, T.tira0 + 0.38, T.tira0 + 0.58);
      // tira hacia abajo y hacia fuera (el cuerpo se tumba lejos de Deivi) y luego lo trae delante
      const C = { x: 452, y: 318 }, a = mezcla(mezcla(A0, C, u), mezcla(C, P_ATA, u), u);
      return { a: { x: a.x, y: a.y + tiron }, psi: PSI_ATA * salida(fase(t, T.coge + 0.02, T.tira1 - 0.1)) };
    }
    if (t < T.suelta2) {
      const nudo = dentro(t, T.ata0, T.ata0 + 0.1, T.lazo - 0.05, T.lazo + 0.05);
      return { a: { x: P_ATA.x + 3 * nudo * Math.sin(t * 25), y: P_ATA.y + 2 * nudo * Math.cos(t * 25) }, psi: PSI_ATA - 0.03 * Math.sin(t * 3) * nudo };
    }
    const H = manoCinta(t), th = anguloCinta(t), d = largoCinta(t);
    const dt = t - T.suelta2;
    const psi = lerp(PSI_ATA, -0.1, salida(fase(t, T.suelta2, T.sube1 + 0.2))) + 0.07 * Math.sin(dt * 2.4 + 0.6) * Math.exp(-dt * 0.8) + 0.03 * Math.sin(t * 1.3 + 0.5);
    return { a: { x: H.x - d * Math.sin(th), y: H.y - d * Math.cos(th) }, psi };
  }
  // marco de Guillermo: matriz que lleva su pose local a pantalla
  function marcoG(t, p) {
    if (t < T.coge) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, psi: 0 };
    const Al = tobilloL(p), an = ancla(t), c = Math.cos(an.psi), s = Math.sin(an.psi);
    return { a: c, b: s, c: -s, d: c, e: an.a.x - (c * Al.x - s * Al.y), f: an.a.y - (s * Al.x + c * Al.y), psi: an.psi };
  }
  const aplica = (M, q) => ({ x: M.a * q.x + M.c * q.y + M.e, y: M.b * q.x + M.d * q.y + M.f });

  /* ---------- el globo rojo de Guillermo ---------- */
  const R_ROJO = ROJO.r;
  function nudoRojoRamo(t) { return nudoDe(centroRamo(5, t), R_ROJO, angRamo(5)); }
  // estado del globo rojo: dónde está el nudo, hacia dónde apunta, tamaño y quién lo lleva
  function globoRojo(t, p, soloForma) {
    const o = { modo: "ramo", r: R_ROJO, ang: angRamo(5), n: null, c: null, pellejo: false, cinta: "valvula" };
    if (t < T.gAgarra) { o.n = nudoRojoRamo(t); o.c = centroDe(o.n, o.r, o.ang); return o; }
    o.cinta = t < T.gTira + 0.02 ? "valvula" : "suelta";
    if (t < T.gPasa) {                                 // en la mano lejana
      o.modo = "lejos"; o.n = p._agarreL || nudoRojoRamo(t);
      const tira = campana(t, T.gTira, T.gTira + 0.25);
      o.ang = lerp(angRamo(5) + 0.35 * tira, -1.25, tramo(t, T.gTira + 0.1, T.gPasa)) + 0.18 * Math.sin((t - T.gAgarra) * 6) * Math.exp(-(t - T.gAgarra) * 3);
    } else {                                           // en la mano cercana (en la boca)
      o.modo = "cerca";
      const k = suave(fase(t, T.gPasa - 0.06, T.gPasa + 0.1));
      o.n = p._agarreC ? mezcla(p._agarreL, p._agarreC, k) : p._boca;
      const vaciado = fase(t, T.gInhala0, T.gInhala1);
      o.r = R_ROJO * (1 - Math.pow(vaciado, 1.15)) * (1 + 0.04 * Math.sin(t * 31) * campana(vaciado, 0, 1));
      o.ang = lerp(-1.25, 0.1, suave(fase(t, T.gChulo1, T.gBoca))) - 0.2 * Math.pow(vaciado, 2);
      o.arruga = clamp((vaciado - 0.5) * 2);
      if (o.r < 5) { o.pellejo = true; o.ang = lerp(0, 1.6, suave(fase(t, T.gInhala1, T.gInhala1 + 0.35))); }
      if (t >= T.suelta) o.modo = "suelto";
    }
    o.c = centroDe(o.n, o.r, o.ang);
    return o;
  }
  // el globo en la boca (para que la mano lejana lo apriete): el nudo en la mano cercana
  function globoRojoEnBoca(t, p) {
    const vaciado = fase(t, T.gInhala0, T.gInhala1), r = Math.max(4, R_ROJO * (1 - Math.pow(vaciado, 1.15)));
    const ang = lerp(-1.25, 0.1, suave(fase(t, T.gChulo1, T.gBoca))) - 0.2 * Math.pow(vaciado, 2);
    return { r, c: centroDe(p._agarreC, r, ang) };
  }
  // pellejo cayendo: desde la mano que lo suelta hasta el suelo, revoloteando
  function pellejoCae(t) {
    const P0 = cache("pelCae", () => poseG(T.suelta)._agarreC);
    const u = fase(t, T.suelta, T.suelta + 1.05), yF = SUELO - 3;
    return { n: { x: P0.x - 26 * u + 13 * Math.sin(u * 11), y: lerp(P0.y, yF, Math.pow(u, 1.5)) }, ang: 1.6 + 0.9 * Math.sin(u * 11) * (1 - u) + (u >= 1 ? -1.6 - Math.PI / 2 + 0.5 : 0) * 0, suelo: u >= 1, u };
  }
  function dibGloboRojo(g, gl, t) {
    // cinta del globo: hasta la válvula, o suelta colgando del nudo
    if (gl.cinta === "valvula") trazoCinta(g, cintaEntre(gl.n, VAL, 14, t, 2), "#ffe9a8", 1.6);
    else trazoCinta(g, cintaCuelga({ x: gl.n.x, y: gl.n.y + 2 }, gl.pellejo ? 64 : 70, t, 1.3, 0), "#ffe9a8", 1.6);
    if (gl.pellejo) dibPellejo(g, gl.n, ROJO.col, gl.ang, t);
    else dibGlobo(g, gl.n, gl.r, ROJO.col, gl.ang, gl.arruga || 0);
  }

  /* ================= Deivi ================= */
  const CD = {
    calma: E({ mx: 0.9, my: 0.1, c: 0.1, sonr: 0.25, ancho: 0.9 }),
    picaro: E({ mx: 0.95, my: 0.05, c: 0.25, sonr: 0.55, ancho: 0.95, sd: 4, si: 18, gi: 0.14 }),
    globo: E({ mx: 0.9, my: -0.6, c: 0.05, sonr: 0.4, ancho: 0.9, sd: 10, si: 12 }),
    sorbe: E({ mx: 0.6, my: -0.1, sonr: 0.05, ancho: 0.45, abre: 3, sd: 18, si: 18, iris: 1.05 }),
    habla: E({ mx: 0.95, my: 0.05, c: 0.1, sonr: 0.35, ancho: 0.5, abre: 4, sd: 20, si: 22, gi: 0.08 }),
    orgullo: E({ mx: 0.9, my: 0.1, c: 0.35, sonr: 0.62, ancho: 1, sd: 6, si: 12 }),
    mira: E({ mx: 0.95, my: 0.15, c: 0.1, sonr: 0.35, ancho: 0.9 }),
    oh: E({ mx: 0.95, my: 0.1, sonr: -0.05, ancho: 0.55, abre: 12, sd: 20, si: 20, iris: 0.9 }),
    pasma: E({ mx: 0.85, my: -0.6, sonr: -0.05, ancho: 0.62, abre: 26, sd: 26, si: 26, iris: 0.82 }),
    risa: E({ mx: 0.8, my: -0.4, c: 0.85, h: 1, sonr: 0.8, abre: 14, ancho: 0.9, sd: 14, si: 14, rub: 0.4 }),
    idea: E({ mx: 0.85, my: -0.75, c: 0.15, sonr: 0.55, ancho: 0.95, sd: 6, si: 22, gi: 0.18 }),
    estira: E({ mx: 0.7, my: -0.9, c: 0, sonr: 0.2, abre: 8, ancho: 0.7, sd: 14, si: 14 }),
    tira: E({ mx: 0.8, my: -0.4, c: 0.35, z: 0.2, sonr: 0.3, abre: 6, ancho: 0.85, sd: -4, si: 4 }),
    ata: E({ mx: 0.7, my: 0.5, c: 0.15, sonr: 0.3, abre: 6, ancho: 0.7, lengua: 1, sd: 4, si: 10 }),
    satisfecho: E({ mx: 0.7, my: -0.7, c: 0.2, sonr: 0.55, ancho: 0.95, sd: 8, si: 12 }),
    guino: E({ mx: 0.02, my: 0.05, c: 0.12, wi: 1, sonr: 0.7, ancho: 1, sd: 10, si: 2, gi: -0.12 })
  };
  const GUION_CD = [
    [T.dMira, T.dMira + 0.18, "picaro"], [T.dAlcanza0 - 0.05, T.dAlcanza0 + 0.15, "globo"], [T.dInhala0 - 0.08, T.dInhala0 + 0.08, "sorbe"],
    [T.habla0 - 0.08, T.habla0 + 0.05, "habla"], [T.habla1, T.habla1 + 0.15, "orgullo"], [T.gTira, T.gTira + 0.2, "mira"],
    [T.dOh, T.dOh + 0.15, "oh"], [T.despega - 0.05, T.despega + 0.15, "pasma"], [T.dRie0, T.dRie0 + 0.12, "risa"],
    [T.dIdea - 0.04, T.dIdea + 0.14, "idea"], [T.dAlza, T.dAlza + 0.15, "estira"], [T.coge + 0.05, T.coge + 0.2, "tira"],
    [T.bols0, T.bols0 + 0.2, "ata"], [T.suelta2 + 0.05, T.suelta2 + 0.3, "satisfecho"], [T.guino - 0.05, T.guino + 0.12, "guino"]
  ];
  const PARP_D = [0.25, 1.95, 3.0, 4.4, 5.5, 6.7, 9.9, 11.1, 12.75, 14.2];
  const P0D = { dx: 0, pel: 0, torso: 0.02, cab: 0.04 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    quieto: CuD({}),
    picaro: CuD({ torso: 0.0, cab: 0.08 }),
    alcanza: CuD({ torso: 0.08, cab: -0.16, dx: -4 }),
    sorbe: CuD({ torso: 0.04, cab: 0.16, pel: -2 }),
    habla: CuD({ torso: -0.02, cab: 0.02 }),
    orgullo: CuD({ torso: -0.05, cab: -0.06 }),
    oh: CuD({ torso: -0.06, cab: -0.04, dx: 4 }),
    arriba: CuD({ torso: -0.1, cab: -0.36, dx: 4 }),
    risa: CuD({ torso: 0.14, cab: 0.06, pel: 8 }),
    idea: CuD({ torso: -0.04, cab: -0.3 }),
    estira: CuD({ torso: -0.1, cab: -0.36 }),
    tira: CuD({ torso: 0.16, cab: 0.0, pel: 50 }),
    ata: CuD({ torso: 0.26, cab: 0.22, pel: 80 }),
    sube: CuD({ torso: -0.04, cab: -0.28 }),
    final: CuD({ torso: -0.03, cab: -0.04 })
  };
  const GUION_D = [
    [T.dMira, T.dMira + 0.2, "picaro"], [T.dAlcanza0, T.dAgarra, "alcanza"], [T.dBoca - 0.1, T.dInhala0 + 0.1, "sorbe"],
    [T.habla0, T.habla0 + 0.15, "habla"], [T.habla1, T.habla1 + 0.2, "orgullo"], [T.dOh, T.dOh + 0.2, "oh"],
    [T.despega + 0.1, T.despega + 0.8, "arriba"], [T.dRie0, T.dRie0 + 0.2, "risa"], [T.dRie1 - 0.1, T.dIdea + 0.1, "idea"],
    [T.dAlza - 0.05, T.dAlza + 0.2, "estira"], [T.coge + 0.05, T.tira1, "tira"], [T.tira1 - 0.1, T.ata0, "ata"],
    [T.suelta2, T.suelta2 + 0.6, "sube"], [T.guino - 0.15, T.guino + 0.1, "final"]
  ];
  // pasos de Deivi (pies: lejos = el de la izquierda de la pantalla)
  const PASOS_D = {
    lejos: [[0, 0, 679], [T.dPaso0, T.dPaso0 + 0.2, 614], [T.dVuelve0 + 0.15, T.dVuelve0 + 0.35, 679],
      [T.dAnda0, T.dAnda0 + 0.18, 616], [T.dAnda0 + 0.26, T.dAnda0 + 0.44, 554], [T.tira0 + 0.43, T.tira0 + 0.61, 564],
      [T.suelta2 + 0.26, T.suelta2 + 0.43, 579]],
    cerca: [[0, 0, 727], [T.dPaso0 + 0.17, T.dPaso0 + 0.37, 662], [T.dVuelve0, T.dVuelve0 + 0.18, 727],
      [T.dAnda0 + 0.12, T.dAnda0 + 0.3, 660], [T.dAnda0 + 0.38, T.dAnda0 + 0.56, 602], [T.tira0 + 0.28, T.tira0 + 0.46, 612],
      [T.suelta2 + 0.13, T.suelta2 + 0.3, 627]]
  };
  // mano cercana: el globo amarillo, gestos, la boca al reírse y la cinta del bolsillo
  const PISTA_DC = [
    [0, 0, { bols: true }],
    [T.dAlcanza0, T.dAgarra - 0.05, { nudoAma: true, mu: 0.7, dedos: PALMA }],
    [T.dAgarra - 0.05, T.dAgarra + 0.03, { nudoAma: true, mu: 0.75, dedos: AGARRA }],
    [T.dAgarra + 0.05, T.dBoca, { boca: { x: -14, y: 24 }, mu: 1.25, dedos: AGARRA }],
    [T.dSuelta, T.dSuelta + 0.12, { boca: { x: -22, y: 22 }, mu: 1.15, dedos: PALMA }],
    [T.dSuelta + 0.14, T.habla0 + 0.2, { hom: { x: -58, y: 62 }, mu: 0.25, dedos: PALMA }],
    [T.habla1 - 0.1, T.habla1 + 0.3, { bols: true }],
    [T.dRie0, T.dRie0 + 0.16, { boca: { x: -4, y: 6 }, mu: 1.2, dedos: PALMA }],
    [T.dRie1, T.dRie1 + 0.25, { bols: true }],
    [T.bols0, T.bols1, { hom: { x: -24, y: 92 }, mu: 1.3, dedos: AGARRA }],
    [T.ata0 - 0.12, T.ata0, { tob: true, mu: 0.6, dedos: AGARRA }],
    [T.lazo + 0.08, T.lazo + 0.42, { bols: true }]
  ];
  // mano lejana: el tobillo de Guillermo y luego la cinta
  const PISTA_DL = [
    [0, 0, { bols: true }],
    [T.dAlza, T.coge - 0.04, { espinilla: true, mu: 1.25, dedos: PALMA }],
    [T.coge - 0.04, T.coge + 0.04, { espinilla: true, mu: 1.25, dedos: AGARRA }],
    [T.coge + 0.1, T.tira1, { espinilla: true, mu: -0.7, dedos: AGARRA }],
    [T.lazo - 0.02, T.lazo + 0.14, { cinta: true, mu: -0.75, dedos: AGARRA }]
  ];

  function poseD(t, pG, M) {
    const b = linea(GUION_D, CUER_D, "quieto", t);
    const respira = Math.sin(t * 2.0 + 1.1);
    const fl = pie(PASOS_D.lejos, t), fc = pie(PASOS_D.cerca, t);
    const x = (fl.x + fc.x) / 2 + 2 + b.dx;
    const anda = Math.max(fl.alza, fc.alza);
    const punt = dentro(t, T.dAlza, T.coge - 0.12, T.coge + 0.1, T.coge + 0.35);       // de puntillas
    const sorbe = dentro(t, T.dInhala0, T.dInhala1, T.dSuelta + 0.4, T.habla1);         // pecho con el aire
    const risa = dentro(t, T.dRie0, T.dRie0 + 0.1, T.dRie1 - 0.2, T.dRie1);
    const sacude = risa * Math.abs(Math.sin((t - T.dRie0) * 10));
    const habla = dentro(t, T.habla0, T.habla0 + 0.05, T.habla1 - 0.1, T.habla1);
    const brinco = 20 * campana(t, T.coge - 0.24, T.coge + 0.2);
    const p = {
      x, suelo: SUELO - brinco, s: S, espejo: true,
      pelvis: { x: Dv.PELVIS.x, y: Dv.PELVIS.y + b.pel + respira * 1.1 - 8 * anda - 50 * punt + 12 * sacude },
      torso: b.torso + 0.02 * sacude, torsoEsc: { x: 1 + 0.05 * sorbe, y: 1 + respira * 0.004 + 0.03 * sorbe },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * sacude, dx: 0, dy: 0, esc: { x: 1 + 0.02 * sorbe, y: 1 } }, tirasLimpias: true
    };
    // al hablar con voz de pito: la cabeza da cabezaditas con cada sílaba
    p.cabeza.ang += habla * 0.06 * Math.sin((t - T.habla0) * 2 * Math.PI * 2.6);
    const ty = Dv.SUELO - Dv.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Dv.aHoja(p, { x: fc.x, y: 0 }).x, y: ty - 26 * fc.alza - 46 * punt }, ang: 0.25 * fc.alza + 0.42 * punt };
    p.piernas.lejos = { tob: { x: Dv.aHoja(p, { x: fl.x, y: 0 }).x, y: ty - 8 - 26 * fl.alza - 46 * punt }, ang: 0.25 * fl.alza + 0.42 * punt };
    // cara
    const e = linea(GUION_CD, CD, "calma", t);
    e.abre += habla * 11 * Math.max(0, Math.sin((t - T.habla0) * 2 * Math.PI * 2.6)) + 4 * sacude;
    e.mof = Math.max(e.mof, 0.5 * dentro(t, T.dInhala0, T.dInhala0 + 0.3, T.dInhala1, T.dSuelta));
    p.cara = cara(e, e.h > 0.5 || e.wi > 0.5 ? 0 : parpadeo(t, PARP_D, 0.13));
    p.cara.rubor = e.rub;
    // manos
    const Tr = Dv.tronco(p), hcP = Dv.aPantalla(p, Tr(Dv.HOMBRO_C)), hlP = Dv.aPantalla(p, Tr(Dv.HOMBRO)), boca = Dv.aPantalla(p, Dv.boca(p));
    const ank = pG ? aplica(M, tobilloL(pG)) : null, esp = pG ? aplica(M, espinillaL(pG)) : null;
    const resuelve = lado => o => {
      if (o.bols) { const m = Dv.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, puno: m.puno ?? 0, dedos: BOLS }; }
      let q, mu = o.mu;
      if (o.hom) { const h = lado === "cerca" ? hcP : hlP; q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      else if (o.boca) q = { x: boca.x + o.boca.x, y: boca.y + o.boca.y };
      else if (o.nudoAma) { const n = nudoAmaRamo(t); q = { x: n.x + 4, y: n.y + 6 }; }
      else if (o.tob) { const w = (t - T.ata0) * 2 * Math.PI * 3.2, k = dentro(t, T.ata0, T.ata0 + 0.08, T.lazo - 0.12, T.lazo);
        q = { x: ank.x + 10 + 9 * k * Math.cos(w), y: ank.y + 4 + 7 * k * Math.sin(w) }; }
      else if (o.espinilla) q = { x: esp.x + 4, y: esp.y + 2 };
      else if (o.cinta) { const H = t >= T.suelta2 ? manoCinta(t) : ank; q = { x: H.x + 3, y: H.y + 6 }; }
      const hq = Dv.aHoja(p, q);
      return { x: hq.x, y: hq.y, mu: Math.PI - mu, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_DL, t, resuelve("lejos")), C = pista(PISTA_DC, t, resuelve("cerca"));
    // hablando: la mano abierta acompaña cada sílaba
    C.y -= habla * 10 * Math.abs(Math.sin((t - T.habla0) * Math.PI * 2.6)) / S;
    p.manoCerca = { x: C.x, y: C.y, ang: 0, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: 0, mu: L.mu, dobla: 1, puno: L.puno, dedos: L.dedos };
    p._agarreC = puntoMano(Dv, p, p.manoCerca, PUNO[0], PUNO[1]);
    p._agarreL = puntoMano(Dv, p, p.manoLejos, PUNO[0], PUNO[1]);
    p._boca = boca;
    // el globo amarillo en la mano cercana
    const ga = globoAma(t, p);
    if (ga.modo === "mano") p.manoCerca.objeto = (g, tt) => enPantalla(g, () => dibGloboAma(g, ga, tt));
    p._ama = ga;
    // la cinta del bolsillo: colgando de la mano cercana hasta el lazo
    if (t >= T.bols0 && t < T.lazo) p.manoCerca.objeto = (g, tt) => enPantalla(g, () => cintaMano(g, tt, p, ank));
    if (t >= T.lazo) p.manoLejos.objeto = (g, tt) => enPantalla(g, () => cintaAtada(g, tt, p, ank));
    return p;
  }

  /* ---------- el globo amarillo de Deivi ---------- */
  function nudoAmaRamo(t) { return nudoDe(centroRamo(4, t), AMA.r, angRamo(4)); }
  function globoAma(t, p) {
    const o = { modo: "ramo", r: AMA.r, ang: angRamo(4), n: null };
    if (t < T.dAgarra) { o.n = nudoAmaRamo(t); return o; }
    if (t < T.dSuelta) {
      o.modo = "mano"; o.n = p._agarreC; o.boca = p._boca; o.cuello = dentro(t, T.dBoca - 0.12, T.dBoca + 0.02, T.dSuelta - 0.04, T.dSuelta + 0.02);
      o.ang = lerp(angRamo(4), -Math.PI + 0.55, suave(fase(t, T.dAgarra + 0.05, T.dBoca)));
      o.r = AMA.r * (1 - 0.22 * suave(fase(t, T.dInhala0, T.dInhala1)));
      return o;
    }
    // suelto: vuelve a su sitio en el ramo (la cinta sigue atada a la válvula) y se hincha un pelín al soltarse
    const P0 = cache("amaSuelta", () => { const pd = poseD(T.dSuelta - 1e-4); return { n: pd._agarreC, ang: -Math.PI + 0.55 }; });
    const u = fase(t, T.dSuelta, T.dSuelta + 0.75), k = 1 - Math.exp(-u * 5) * Math.cos(u * 9);
    const fin = nudoAmaRamo(t);
    o.n = { x: lerp(P0.n.x, fin.x, k), y: lerp(P0.n.y, fin.y, k) };
    o.ang = lerp(P0.ang, angRamo(4), clamp(k));
    o.r = AMA.r * (0.78 + 0.22 * suave(fase(t, T.dSuelta, T.dSuelta + 0.4)));
    o.modo = t < T.dVuelve1 ? "delante" : "ramo";
    return o;
  }
  function dibGloboAma(g, o, t) {
    trazoCinta(g, cintaEntre(o.n, VAL, o.modo === "ramo" ? 10 : 22, t, 4), "#fff3c4", 1.6);
    dibGlobo(g, o.n, o.r, AMA.col, o.ang, 0);
    // el cuello del globo, estirado hasta los labios
    if (o.cuello > 0.01) { const b = { x: o.boca.x - 3, y: o.boca.y + 1 }, n = { x: o.n.x, y: o.n.y - 3 };
      const e = { x: lerp(n.x, b.x, o.cuello), y: lerp(n.y, b.y, o.cuello) };
      g.save(); g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 6.4; g.beginPath(); g.moveTo(n.x, n.y); g.lineTo(e.x, e.y); g.stroke();
      g.strokeStyle = AMA.col; g.lineWidth = 3.6; g.stroke(); g.restore(); }
  }

  /* ---------- la cinta rizada (rosa) ---------- */
  const COL_CINTA = "#ff4fa3", LTOT = LR + 34;
  function cintaMano(g, t, pD, ank) {
    const a = pD._agarreC;
    // sale del bolsillo: al principio asoma poco a poco
    const L = 72 * tramo(t, T.bols0, T.bols0 + 0.25);
    if (L > 1) trazoCinta(g, cintaCuelga(a, L, t, 0.4, 0.2 * Math.sin(t * 3)), COL_CINTA, 2.4);
    // vueltas alrededor del tobillo mientras anuda
    const k = fase(t, T.ata0, T.lazo);
    if (k > 0 && ank) vueltas(g, ank, k);
  }
  function vueltas(g, ank, k) {
    g.save(); g.strokeStyle = COL_CINTA; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 2; i++) { const kk = clamp(k * 2 - i); if (kk <= 0) continue;
      g.beginPath(); g.ellipse(ank.x + 1, ank.y - 3 - i * 5, 9, 3.4, -0.2, 0, Math.PI * kk); g.stroke(); }
    g.restore();
  }
  function cintaAtada(g, t, pD, ank) {
    const H = pD._agarreL, d = Math.hypot(H.x - ank.x, H.y - ank.y);
    const comba = Math.max(0, Math.sqrt(Math.max(0, LR * LR - d * d)) * 0.45);
    trazoCinta(g, cintaEntre(ank, H, comba * 0.35, t, 1), COL_CINTA, 2.4);
    const cola = Math.max(20, LTOT - d);
    trazoCinta(g, cintaCuelga({ x: H.x, y: H.y + 2 }, cola * 0.6, t, 2.1, 0.15 * Math.sin(t * 2)), COL_CINTA, 2.4);
  }
  // lazo en el tobillo (encima de Guillermo)
  function lazo(g, ank, t, psi) {
    const k = salida(fase(t, T.lazo - 0.06, T.lazo + 0.16)) * (1 + 0.25 * campana(t, T.lazo + 0.06, T.lazo + 0.3));
    if (k <= 0.01) return;
    g.save(); g.translate(ank.x, ank.y - 4); g.rotate(psi * 0.6); g.scale(k, k);
    g.lineJoin = "round"; g.fillStyle = COL_CINTA; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(0, 0, 10.5, 3.6, 0, 0, Math.PI * 2); g.strokeStyle = COL_CINTA; g.lineWidth = 3; g.stroke();
    g.lineWidth = 1.4; g.strokeStyle = TINTA;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 12, -11, s * 12, -1); g.quadraticCurveTo(s * 9, 4, 0, 0); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(0, 1); g.lineTo(s * 5, 11); g.lineTo(s * 9, 9); g.lineTo(s * 2, 0); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(0, 0, 3.2, 3.2, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }

  /* ================= efectos ================= */
  const COL_NOTA = ["#ffe35a", "#7be0ff", "#ff8fd0", "#9cf06a", "#ffffff"];
  function nota(g, x, y, s, col, rot, doble, alfa) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = alfa; g.lineJoin = "round"; g.lineCap = "round";
    const cabeza = (cx, cy) => { g.beginPath(); g.ellipse(cx, cy, 4.6, 3.4, -0.45, 0, Math.PI * 2); };
    g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    if (!doble) {
      cabeza(0, 0); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(4, -1.5); g.lineTo(4, -16); g.quadraticCurveTo(10, -12, 9, -6); g.stroke();
      g.strokeStyle = col; g.lineWidth = 0.8; g.beginPath(); g.moveTo(4, -2); g.lineTo(4, -15); g.stroke();
    } else {
      cabeza(-5, 2); g.fill(); g.stroke(); cabeza(6, 0); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-1, 0.5); g.lineTo(-1, -14); g.lineTo(10, -16); g.lineTo(10, -1.5); g.stroke();
      g.lineWidth = 3.2; g.beginPath(); g.moveTo(-1, -13); g.lineTo(10, -15); g.stroke();
    }
    g.restore();
  }
  // notitas de la voz de pito: [instante, quién, doble]
  const NOTAS = [];
  for (let i = 0; i < 9; i++) NOTAS.push([T.habla0 + 0.05 + i * (1 / 2.6) * 0.5 + 0.06 * hash(i * 3.3), "d", i % 3 === 1]);
  NOTAS.push([T.pip + 0.02, "g", false], [T.pip2 + 0.02, "g", false]);
  function notas(g, t) {
    NOTAS.forEach(([t0, quien, doble], i) => {
      const u = fase(t, t0, t0 + 1.25); if (u <= 0 || u >= 1) return;
      const P = cache("nota" + i, () => quien === "d" ? poseD(t0, poseG(t0), marcoG(t0, poseG(t0)))._boca : (() => { const pg = poseG(t0); return aplica(marcoG(t0, pg), pg._boca); })());
      const dir = quien === "d" ? -1 : 1;
      const x = P.x + dir * (22 + 44 * salida(clamp(u * 1.8)) + 14 * hash(i) * u) + 8 * Math.sin(u * 9 + i) * u;
      const y = P.y - 12 - 120 * Math.pow(u, 1.3);
      const s = (quien === "g" ? 1.8 : 1.35 + 0.3 * hash(i * 1.7)) * (0.5 + 0.5 * salida(clamp(u * 5)));
      nota(g, x, y, s, COL_NOTA[i % COL_NOTA.length], 0.25 * Math.sin(u * 7 + i), doble, (1 - Math.pow(u, 3)) * clamp(u * 8));
    });
  }
  // rayitas de voz aguda junto a la boca
  function pitido(g, t, P, t0, t1, dir) {
    const k = dentro(t, t0, t0 + 0.05, t1 - 0.1, t1); if (k <= 0.01) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 2; g.globalAlpha = 0.8 * k * (0.5 + 0.5 * Math.sin(t * 40));
    for (let i = -1; i <= 1; i++) { const a = (dir < 0 ? Math.PI : 0) + i * 0.45, r0 = 14, r1 = 22;
      g.beginPath(); g.moveTo(P.x + Math.cos(a) * r0, P.y + Math.sin(a) * r0); g.lineTo(P.x + Math.cos(a) * r1, P.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // lágrimas de risa
  function lagrimas(g, t, pG) {
    const k = dentro(t, T.gRie0 + 0.3, T.gRie0 + 0.45, T.gRie1 - 0.3, T.gRie1 - 0.1); if (k <= 0.01) return;
    const H = G.cabeza(pG);
    for (const [px, py, dir, ph] of [[735, 560, -1, 0], [921, 612, 1, 0.5]]) {
      const P = G.aPantalla(pG, H.a({ x: px, y: py }));
      for (let j = 0; j < 2; j++) {
        const u = ((t - T.gRie0) * 2.2 + ph + j * 0.5) % 1;
        const x = P.x + dir * (4 + 26 * u), y = P.y - 10 * Math.sin(Math.PI * u) * 1.2 + 26 * u * u;
        g.save(); g.globalAlpha = k * (1 - u); g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(x, y, 2.6, 3.6, dir * 0.6, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
      }
    }
  }
  // golpe en el techo: rayitas y los globos de al lado se apartan
  function rayasGolpe(g, t, P) {
    const k = fase(t, T.cima - 0.01, T.cima + 0.35); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 2.6; g.globalAlpha = 1 - k;
    for (let i = 0; i < 5; i++) { const a = Math.PI * (0.15 + 0.175 * i), r0 = 18 + 20 * salida(k), r1 = r0 + 14;
      g.beginPath(); g.moveTo(P.x + Math.cos(a) * r0, P.y + Math.sin(a) * r0 * 0.7); g.lineTo(P.x + Math.cos(a) * r1, P.y + Math.sin(a) * r1 * 0.7); g.stroke(); }
    g.restore();
  }
  function globosTecho(g, t, xCab) {
    DEL_TECHO.forEach(([x, r, col], i) => {
      const d = x - xCab, emp = Math.exp(-Math.abs(d) / 120) * Math.sign(d) * 26;
      const k = tramo(t, T.cima - 0.05, T.cima + 0.25, salida), vuelta = Math.exp(-Math.max(0, t - T.cima) * 0.6);
      const dx = emp * k * vuelta + 6 * Math.sin((t - T.cima) * 7) * Math.exp(-Math.max(0, t - T.cima) * 2) * Math.exp(-Math.abs(d) / 150) * k;
      const c = { x: x + dx + 2 * Math.sin(t * 0.8 + i), y: TECHO + 19 + ALTO_G(r) + 1 };
      const n = nudoDe(c, r, -Math.PI / 2);
      trazoCinta(g, cintaCuelga({ x: n.x, y: n.y + 2 }, 70 + 18 * hash(i * 5.1), t, i, 0.25 * Math.sin(t * 1.1 + i)), "#f6efe0", 1.4);
      dibGlobo(g, n, r, col, -Math.PI / 2 + 0.05 * Math.sin(t + i), 0);
    });
  }
  function ramo(g, t, pD) {
    RAMO.forEach((b, i) => {
      if (b.id === "rojo" && t >= T.gAgarra) return;
      if (b.id === "amarillo" && pD._ama.modo !== "ramo") return;
      const n = b.id === "amarillo" ? pD._ama.n : nudoDe(centroRamo(i, t), b.r, angRamo(i));
      const r = b.id === "amarillo" ? pD._ama.r : b.r, ang = b.id === "amarillo" ? pD._ama.ang : angRamo(i);
      trazoCinta(g, cintaEntre(n, VAL, 10, t, i), "#fff3c4", 1.5);
      dibGlobo(g, n, r, b.col, ang, 0);
    });
  }

  /* ================= escena ================= */
  const pose = t => { const g = poseG(t), M = marcoG(t, g); return { g, d: poseD(t, g, M), M }; };
  const CAM = [[0, 1.0, 512, 300], [0.6, 1.0, 512, 300], [1.15, 1.16, 560, 268], [3.9, 1.16, 560, 268], [4.45, 1.2, 470, 266],
    [5.6, 1.36, 430, 250], [7.45, 1.36, 430, 250], [8.0, 1.12, 460, 226], [9.4, 0.9, 490, 122], [10.4, 0.9, 500, 126],
    [11.35, 1.0, 470, 220], [12.4, 1.04, 470, 236], [13.3, 0.9, 500, 136], [DUR, 0.9, 500, 136]];
  function camara(t) {
    let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, FX + mx, FX + FW - mx), y: clamp(y, FY + my, FY + FH - my) };
  }
  function sombras(g, t, pG, pD) {
    g.save(); g.fillStyle = "rgba(20,8,4,0.35)";
    const alto = clamp(1 - altoG(Math.min(t, T.coge)) / 160) * (t < T.coge ? 1 : 0.4);
    const xs = t < T.coge ? pG.x : pG.x + 30;
    g.beginPath(); g.ellipse(xs + 4, SUELO + 2, 66 * (0.5 + 0.5 * alto), 7 * (0.5 + 0.5 * alto), 0, 0, Math.PI * 2); g.globalAlpha = 0.4 + 0.6 * alto; g.fill();
    g.globalAlpha = 1; g.beginPath(); g.ellipse(pD.x - 4, SUELO + 2, 64, 7, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  class GuillermoDeiviGlobo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Dv.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), M = marcoG(t, pG), pD = poseD(t, pG, M);
      const luz = tramo(t, NEGRO_INICIO, 0.7, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, FX, FY);
      const cab = aplica(M, G.aPantalla(pG, G.cabeza(pG).a(TOPE_G)));
      globosTecho(g, t, cab.x);
      ramo(g, t, pD);
      // el pellejo cae revoloteando y se queda en el suelo
      if (t >= T.suelta) { const pc = pellejoCae(t);
        trazoCinta(g, cintaCuelga({ x: pc.n.x, y: pc.n.y + 2 }, pc.suelo ? 0 : 60, t, 1.3, 0.4 * Math.sin(t * 6)), "#ffe9a8", 1.6);
        if (pc.suelo) dibPellejoSuelo(g, pc.n, t); else dibPellejo(g, pc.n, ROJO.col, pc.ang, t); }
      sombras(g, t, pG, pD);
      g.save(); g.transform(M.a, M.b, M.c, M.d, M.e, M.f);
      G.dibujar(g, pG, t);
      g.restore();
      if (t >= T.lazo - 0.06) lazo(g, aplica(M, tobilloL(pG)), t, M.psi);
      Dv.dibujar(g, pD, t);
      if (pD._ama.modo === "delante") dibGloboAma(g, pD._ama, t);
      notas(g, t);
      pitido(g, t, pD._boca, T.habla0, T.habla1, -1);
      pitido(g, t, aplica(M, pG._boca), T.pip, T.pip + 0.3, 1);
      pitido(g, t, aplica(M, pG._boca), T.pip2, T.pip2 + 0.3, 1);
      lagrimas(g, t, pG);
      rayasGolpe(g, t, cab);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  // pellejo tirado en el suelo, con su cinta
  function dibPellejoSuelo(g, n, t) {
    g.save(); g.translate(n.x, n.y); g.lineJoin = "round";
    g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(-14, -7, -4, -6); g.quadraticCurveTo(4, -9, 10, -3); g.quadraticCurveTo(13, 1, 6, 1); g.closePath();
    g.fillStyle = ROJO.col; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, -3); g.lineTo(2, -5); g.stroke();
    g.restore();
    trazoCinta(g, [{ x: n.x + 10, y: n.y - 1 }, { x: n.x + 22, y: n.y + 1 }, { x: n.x + 30, y: n.y - 2 }, { x: n.x + 40, y: n.y + 1 }, { x: n.x + 52, y: n.y }], "#ffe9a8", 1.6);
  }
  registrar({ id: "00066", nombre: "Guillermo y Deivi · El globo de helio", crear: () => new GuillermoDeiviGlobo() });
  window.__A2D_00066 = { pose, poseG, poseD, marcoG, camara, T, DUR };
})();
