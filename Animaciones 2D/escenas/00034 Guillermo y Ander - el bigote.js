"use strict";
/* 00034 · Guillermo y Ander · El bigote
 *
 * Negro → bar de madrugada, ya cerrando: sillas patas arriba, reloj de pared en las tres y lámpara
 * colgante sobre una mesa alta. Ander se ha quedado dormido en un taburete, con la cabeza sobre el
 * brazo estirado en la mesa (el otro le cuelga) y una pompa que se hincha y se deshincha con cada
 * ronquido → Guillermo entra de
 * puntillas por la derecha, con gafas de sol de espía y un rotulador negro en alto, aguantándose la
 * risa → se planta junto a la mesa, le quita el capuchón con los dientes y le dibuja a Ander un
 * bigote retorcido, trazo a trazo → a mitad Ander se remueve, se le revienta la pompa y Guillermo se
 * queda congelado con el rotulador en el aire… Ander vuelve a roncar y Guillermo acaba el bigote →
 * se aparta muerto de risa, tapa el rotulador, se lo guarda, se da la vuelta y se sube las gafas
 * de sol muy orgulloso: tiene un monóculo y una ceja única pintados en la cara (Ander se le había
 * adelantado) → Ander abre un ojo, sonríe y le enseña su propio rotulador → Guillermo se acerca al
 * espejo de la pared, se ve y se queda de piedra → mira a Ander, que cierra el ojo y vuelve a
 * «roncar» con la pompa → negro.
 *
 * Sin textos (los ronquidos son pompas, sin letras). Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, AN = Ander;
  const S = 0.30, SUELO = 560, DUR = 14.1;
  const TINTA = "#0b0a0e";
  const T = {
    entra0: 0.5, llega: 3.0,
    tapon0: 3.05, muerde: 3.42, tapon1: 3.62,
    traza0: 3.72, l0: 3.9, l1: 5.05,
    remueve: 5.18, calma: 5.95,
    r0: 6.08, r1: 6.92, punto: 7.0,
    atras0: 7.15, ri0: 7.15, ri1: 7.75,
    tapa0: 7.55, tapa: 7.8, guarda0: 7.85, guarda1: 8.15,
    gira0: 8.22, gira1: 8.52,
    gafas0: 8.6, gafas1: 9.08,
    chulo: 9.1, guino: 9.5,
    ojoA: 9.65, sonrieA: 9.85, rotA0: 9.95, rotA1: 10.75,
    espejo0: 10.45, dobleVista: 10.62, acerca0: 10.72, acerca1: 11.25,
    piedra: 11.38, miraA: 12.0, cierraA: 12.15,
    fin: 13.35
  };

  /* ---------- decorado (px de pantalla) ---------- */
  const XA = 300;                                         // pelvis de Ander (sentado en el taburete)
  const A_TORSO = 0.6, A_CAB = 0.98, A_MANO = { x: 512, y: 322 };   // inclinación, cabeza apoyada y puño sobre la mesa
  const TAB = { x: 300, asiento: 414 };                   // taburete
  const MESA = { x: 452, top: 327, rx: 92, ry: 13 };      // mesa alta redonda
  const ESP = { x: 902, y: 186, rx: 60, ry: 80 };         // espejo ovalado de la pared
  const LAMP = { x: 452, y: 118 };

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
  // curva densa por puntos (Catmull-Rom) con longitud acumulada
  function densa(pts, n = 10) {
    const P = i => pts[Math.max(0, Math.min(pts.length - 1, i))], out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let k = 0; k < n; k++) {
        const u = k / n, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
      }
    }
    out.push({ x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] });
    let L = 0; out[0].s = 0;
    for (let i = 1; i < out.length; i++) { L += Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y); out[i].s = L; }
    out.L = L;
    return out;
  }
  function puntoEn(c, u) {
    const s = clamp(u) * c.L; let i = 1; while (i < c.length - 1 && c[i].s < s) i++;
    const a = c[i - 1], b = c[i], k = (s - a.s) / Math.max(1e-6, b.s - a.s);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
  }
  function trazoHasta(g, c, u) {
    if (u <= 0.001) return;
    const s = clamp(u) * c.L; g.beginPath(); g.moveTo(c[0].x, c[0].y);
    for (let i = 1; i < c.length; i++) { if (c[i].s >= s) { const q = puntoEn(c, u); g.lineTo(q.x, q.y); break; } g.lineTo(c[i].x, c[i].y); }
    g.stroke();
  }

  /* ---------- el bigote de rotulador (retrato de Ander) ---------- */
  const BIG_L = densa([[868, 641], [846, 646], [816, 650], [786, 649], [761, 641], [743, 627], [738, 610], [746, 598], [760, 597], [767, 608], [759, 619]], 10);
  const BIG_R = densa([[868, 641], [893, 641], [920, 640], [944, 634], [961, 622], [967, 606], [961, 596], [950, 599], [953, 611]], 10);
  const avanceL = t => suave(fase(t, T.l0, T.l1)), avanceR = t => suave(fase(t, T.r0, T.r1));
  function bigoteRotulador(g, t) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "rgba(14,12,18,0.96)"; g.lineWidth = 21;
    trazoHasta(g, BIG_L, avanceL(t)); trazoHasta(g, BIG_R, avanceR(t));
    // brillo de tinta fresca
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 4;
    g.save(); g.translate(-3, -5); trazoHasta(g, BIG_L, avanceL(t) * 0.8); trazoHasta(g, BIG_R, avanceR(t) * 0.75); g.restore();
    // el puntito final (lunar) en la mejilla
    const kp = salida(fase(t, T.punto, T.punto + 0.08));
    if (kp > 0) { g.fillStyle = "rgba(14,12,18,0.96)"; g.beginPath(); g.arc(800, 690, 12 * kp, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- pompa de ronquido (retrato de Ander) ---------- */
  const NARIZ = { x: 893, y: 612 };
  // ronquido: ciclos de 2,6 s; la pompa crece al soltar el aire
  function pompa(t) {
    const ciclo = (t2, t0) => { const u = ((t2 - t0) / 2.6) % 1; return u < 0.62 ? suave(u / 0.62) : 1 - suave((u - 0.62) / 0.38) * 0.85; };
    if (t < T.remueve) return { r: lerp(10, 66, ciclo(t, 0.15)), pop: 0 };
    if (t < T.calma + 0.25) return { r: 0, pop: fase(t, T.remueve, T.remueve + 0.22) };
    if (t < T.cierraA) {
      const vuelve = tramo(t, T.calma + 0.25, T.calma + 0.9);
      const abierto = tramo(t, T.ojoA - 0.1, T.ojoA + 0.1);       // con el ojo abierto no ronca
      return { r: lerp(6, lerp(10, 58, ciclo(t, T.calma + 0.25)), vuelve) * (1 - abierto), pop: 0 };
    }
    // ronquido fingido: una pompa enorme
    return { r: lerp(6, 88, salida(fase(t, T.cierraA + 0.05, T.cierraA + 0.85))) + 4 * Math.sin((t - T.cierraA) * 7), pop: 0 };
  }
  function dibPompa(g, t) {
    const b = pompa(t);
    g.save();
    if (b.r > 1) {
      const r = b.r, cx = NARIZ.x + r * 0.72, cy = NARIZ.y + r * 0.42;
      g.fillStyle = "rgba(205,236,255,0.38)"; g.strokeStyle = "rgba(60,110,150,0.85)"; g.lineWidth = 4;
      g.beginPath(); g.ellipse(cx, cy, r, r * 0.92, 0.3, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(cx - r * 0.35, cy - r * 0.38, r * 0.24, r * 0.14, -0.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r * 0.72, 0.6, 1.4); g.stroke();
    }
    if (b.pop > 0 && b.pop < 1) {            // ¡plop!: anillo y gotitas
      const k = b.pop, cx = NARIZ.x + 40, cy = NARIZ.y + 24;
      g.globalAlpha = 1 - k; g.strokeStyle = "rgba(170,215,245,0.95)"; g.lineWidth = 5;
      g.beginPath(); g.arc(cx, cy, 30 + 70 * k, 0, Math.PI * 2); g.stroke();
      g.fillStyle = "rgba(190,228,255,0.95)";
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.3, d = 40 + 90 * salida(k); g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 7 * (1 - k) + 2, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  }

  /* ---------- lo que Ander le pintó a Guillermo: monóculo y ceja única (retrato de Guillermo) ---------- */
  const PZG = G.A.datos.piezas;
  const PV_D = PZG.ceja_derecha.pivote, PV_I = PZG.ceja_izquierda.pivote;
  function enCeja(q, pv, c, sg) {               // punto del retrato pegado a una ceja que sube y gira
    const a = sg * c.giro, dx = q[0] - pv[0], dy = q[1] - pv[1];
    return { x: pv[0] + (c.dx || 0) + dx * Math.cos(a) - dy * Math.sin(a), y: pv[1] - c.sube + dx * Math.sin(a) + dy * Math.cos(a) };
  }
  function marcasGuillermo(g, p) {
    const cd = p.cara.cejas.d, ci = p.cara.cejas.i;
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "rgba(14,12,18,0.95)";
    // ceja única: una banda peluda que une las dos cejas por encima
    const pts = [enCeja([762, 516], PV_D, cd, -1), enCeja([808, 530], PV_D, cd, -1), enCeja([848, 548], PV_D, cd, -1),
      enCeja([886, 566], PV_I, ci, 1), enCeja([925, 576], PV_I, ci, 1), enCeja([958, 584], PV_I, ci, 1)];
    g.lineWidth = 30; g.beginPath(); M2.curva(g, pts, false, 0.5); g.stroke();
    g.lineWidth = 5;
    for (let i = 0; i < 15; i++) {           // pelillos de rotulador
      const u = i / 14, k = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1))), f = u * (pts.length - 1) - k;
      const a = pts[k], b = pts[k + 1], x = lerp(a.x, b.x, f), y = lerp(a.y, b.y, f);
      g.beginPath(); g.moveTo(x - 4, y - 12); g.lineTo(x + 6 + 4 * hash(i), y - 26 - 6 * hash(i + 3)); g.stroke();
    }
    // monóculo alrededor del ojo cercano (queda entero bajo las gafas de sol)
    g.lineWidth = 11; g.beginPath(); g.ellipse(771, 566, 52, 48, -0.15, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.ellipse(771, 566, 40, 36, -0.15, 3.6, 4.6); g.stroke();
    g.restore();
  }
  // gafas de sol de espía: k = 1 puestas, 0 subidas al pelo
  function gafasSol(g, k) {
    const sube = 1 - k;
    g.save();
    g.translate(820, 560); g.rotate(-0.12 * sube); g.translate(-820, -560 - 175 * suave(sube));
    g.lineJoin = "round"; g.lineCap = "round";
    const cerca = () => { g.beginPath(); g.moveTo(684, 498); g.quadraticCurveTo(772, 478, 862, 528); g.lineTo(862, 588); g.quadraticCurveTo(846, 648, 776, 644); g.quadraticCurveTo(696, 636, 686, 582); g.closePath(); };
    const lejos = () => { g.beginPath(); g.moveTo(874, 548); g.quadraticCurveTo(924, 552, 968, 574); g.lineTo(966, 630); g.quadraticCurveTo(954, 672, 914, 670); g.quadraticCurveTo(880, 664, 874, 616); g.closePath(); };
    // patilla hasta la oreja y puente
    g.strokeStyle = TINTA; g.lineWidth = 15; g.beginPath(); g.moveTo(690, 520); g.lineTo(612, 556); g.stroke();
    g.lineWidth = 13; g.beginPath(); g.moveTo(856, 540); g.quadraticCurveTo(868, 532, 880, 552); g.stroke();
    for (const f of [cerca, lejos]) {
      f(); const gr = g.createLinearGradient(700, 480, 860, 660); gr.addColorStop(0, "#2a3346"); gr.addColorStop(0.5, "#0f121a"); gr.addColorStop(1, "#1d2433");
      g.fillStyle = gr; g.fill();
      g.save(); f(); g.clip();
      g.fillStyle = "rgba(255,255,255,0.42)"; g.beginPath(); g.moveTo(700, 600); g.lineTo(780, 470); g.lineTo(812, 470); g.lineTo(732, 610); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(890, 640); g.lineTo(930, 545); g.lineTo(942, 545); g.lineTo(902, 640); g.closePath(); g.fill();
      g.restore();
      f(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke();
    }
    g.restore();
  }
  // capuchón del rotulador entre los dientes
  function capuchonBoca(g) {
    g.save(); g.translate(812, 742); g.rotate(0.22);
    g.fillStyle = "#24242c"; g.strokeStyle = TINTA; g.lineWidth = 5;
    g.beginPath(); g.roundRect ? g.roundRect(-14, -13, 70, 26, 9) : g.rect(-14, -13, 70, 26); g.fill(); g.stroke();
    g.fillStyle = "#9aa0aa"; g.fillRect(10, -19, 30, 7); g.strokeRect(10, -19, 30, 7);
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(0, -8, 48, 4);
    g.restore();
  }

  /* ---------- rotulador en el puño (unidades de mano: eje y a lo largo, punta hacia +y) ---------- */
  const PUNTA_R = 30;           // de centro del puño a la punta (unidades de mano)
  function rotulador(g, tapado, tapon = true) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#1c1c22"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.roundRect ? g.roundRect(-4.6, -24, 9.2, 46, 3) : g.rect(-4.6, -24, 9.2, 46); g.fill(); g.stroke();
    g.fillStyle = "#e8e6e0"; g.fillRect(-4.6, 4, 9.2, 7); g.strokeRect(-4.6, 4, 9.2, 7);
    g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(-2.6, -21, 1.6, 40);
    if (tapado) {
      g.fillStyle = "#2c2c34"; g.beginPath(); g.roundRect ? g.roundRect(-5.4, 16, 10.8, 16, 3) : g.rect(-5.4, 16, 10.8, 16); g.fill(); g.stroke();
    } else {
      g.fillStyle = "#3a3a42"; g.beginPath(); g.moveTo(-3.4, 22); g.lineTo(3.4, 22); g.lineTo(1.6, 28); g.lineTo(-1.6, 28); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#0a0a0c"; g.beginPath(); g.moveTo(-1.6, 28); g.lineTo(1.6, 28); g.lineTo(0, PUNTA_R + 1); g.closePath(); g.fill();
    }
    if (tapon) { g.fillStyle = "#2c2c34"; g.beginPath(); g.roundRect ? g.roundRect(-5.2, -27, 10.4, 7, 2) : g.rect(-5.2, -27, 10.4, 7); g.fill(); g.stroke(); }
    g.restore();
  }

  /* ---------- caras ---------- */
  const BASEC = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASEC, o);
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.1, sonr: 0.7, ancho: 1.0, abre: 8, sd: 8, gd: 0.1, si: 8, gi: 0.1 }),
    risita: E({ mx: -0.85, my: -0.1, sonr: 0.9, ancho: 1.05, abre: 16, sd: 12, gd: 0.15, si: 12, gi: 0.15, h: 0.5, c: 0.3 }),
    mira: E({ mx: 0.9, my: 0.35, sonr: 0.55, ancho: 0.95, abre: 4, sd: 6, gd: 0.08, si: 6, gi: 0.08 }),
    muerde: E({ mx: 0.9, my: 0.2, sonr: 0.2, ancho: 0.6, abre: 0, sd: 4, gd: 0.04, si: 4, gi: 0.04, dientes: 0 }),
    dibuja: E({ mx: 0.95, my: 0.55, sonr: 0.35, ancho: 0.62, abre: 0, sd: -4, gd: -0.08, si: -4, gi: -0.08, dientes: 0 }),
    susto: E({ mx: 0.6, my: 0.5, iris: 1.1, sonr: -0.25, ancho: 0.55, abre: 0, sd: 22, gd: 0.18, si: 22, gi: 0.18, dientes: 0 }),
    carcajada: E({ mx: -0.85, my: -0.2, c: 0.85, h: 1, sonr: 1, ancho: 1.15, abre: 30, sd: 16, gd: 0.18, si: 16, gi: 0.18, lengua: 0.4 }),
    tapa: E({ mx: 0.85, my: 0.3, sonr: 0.45, ancho: 0.62, abre: 0, sd: 6, gd: 0.05, si: 6, gi: 0.05, dientes: 0 }),
    chulo: E({ mx: -0.88, my: -0.2, c: 0.32, sonr: 0.85, ancho: 1.0, abre: 6, sd: 24, gd: 0.25, si: 4, gi: -0.05 }),
    guino: E({ mx: -0.88, my: -0.2, ci: 1, h: 0.8, sonr: 0.95, ancho: 1.05, abre: 10, sd: 22, gd: 0.2, si: 2, gi: -0.05 }),
    espejo: E({ mx: 0.95, my: 0.0, c: 0.15, sonr: 0.5, ancho: 0.95, abre: 4, sd: 10, gd: 0.1, si: 10, gi: 0.1 }),
    duda: E({ mx: 0.95, my: 0.0, iris: 0.95, c: 0.25, sonr: 0.05, ancho: 0.75, abre: 4, sd: 4, gd: -0.05, si: 14, gi: 0.15 }),
    piedra: E({ mx: 0.95, my: 0.0, iris: 0.72, sonr: -0.35, ancho: 0.62, abre: 34, sd: 32, gd: 0.2, si: 32, gi: 0.2, lengua: 0.2 }),
    miraA: E({ mx: -0.95, my: 0.05, iris: 0.78, sonr: -0.4, ancho: 0.7, abre: 10, sd: -6, gd: -0.22, si: -6, gi: -0.22, c: 0.22 })
  };
  const GUION_CARA_G = [
    [0.9, 1.2, "risita"], [1.7, 2.0, "inicio"], [2.25, 2.5, "risita"], [2.75, 3.0, "mira"], [T.tapon0 + 0.1, T.muerde, "muerde"],
    [T.traza0 - 0.05, T.l0, "dibuja"], [T.remueve, T.remueve + 0.08, "susto", salida], [T.calma - 0.05, T.r0, "dibuja"],
    [T.ri0, T.ri0 + 0.15, "carcajada"], [T.tapa0 - 0.05, T.tapa0 + 0.12, "tapa"], [T.guarda1, T.gira1, "risita"],
    [T.gafas0, T.gafas1, "chulo"], [T.guino, T.guino + 0.15, "guino"], [T.guino + 0.55, T.guino + 0.7, "chulo"],
    [T.espejo0, T.espejo0 + 0.12, "espejo"], [T.dobleVista, T.dobleVista + 0.12, "duda"], [T.piedra - 0.07, T.piedra + 0.09, "piedra", salida],
    [T.miraA, T.miraA + 0.45, "miraA"]
  ];
  const PARP_G = [1.3, 2.6, 6.4, 8.9, 10.15];
  const CARAS_A = {
    duerme: E({ mx: 0.2, my: 0.4, c: 1, sonr: -0.08, ancho: 0.85, abre: 7, sd: -4, gd: -0.04, si: -4, gi: -0.04, dientes: 0 }),
    remueve: E({ mx: 0.2, my: 0.4, c: 1, z: 0.6, sonr: -0.3, ancho: 0.7, abre: 3, sd: 10, gd: 0.15, si: -8, gi: -0.15, dientes: 0 }),
    unOjo: E({ mx: 0.95, my: -0.05, ci: 1, cd: 0.15, sonr: 0.12, ancho: 0.85, abre: 4, sd: 14, gd: 0.15, si: -4, gi: -0.05, dientes: 0 }),
    sonrie: E({ mx: 0.95, my: -0.05, ci: 1, cd: 0.1, sonr: 0.95, ancho: 1.1, abre: 12, sd: 18, gd: 0.2, si: -4, gi: -0.05 }),
    finge: E({ mx: 0.2, my: 0.4, c: 1, sonr: 0.25, ancho: 0.9, abre: 5, sd: -2, gd: -0.02, si: -2, gi: -0.02, dientes: 0 })
  };
  const GUION_CARA_A = [
    [T.remueve, T.remueve + 0.12, "remueve", salida], [T.calma - 0.25, T.calma + 0.1, "duerme"],
    [T.ojoA, T.ojoA + 0.18, "unOjo"], [T.sonrieA, T.sonrieA + 0.3, "sonrie"], [T.cierraA, T.cierraA + 0.1, "finge", salida]
  ];
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* ---------- Guillermo: pasos (px de pantalla de cada tobillo) ---------- */
  // Entra de puntillas por la derecha mirando a la izquierda; al acabar retrocede, se da la vuelta y va al espejo.
  const PASOS_G = {
    lejos: [[-10, -9, 1150], [0.55, 0.88, 1062], [1.36, 1.69, 900], [2.17, 2.5, 740], [2.66, 2.98, 628],
            [T.atras0 + 0.42, T.atras0 + 0.72, 680], [T.acerca0, T.acerca0 + 0.26, 778]],
    cerca: [[-10, -9, 1185], [0.96, 1.29, 982], [1.77, 2.1, 820], [2.4, 2.66, 690],
            [T.atras0, T.atras0 + 0.32, 728], [T.acerca0 + 0.24, T.acerca0 + 0.5, 742]]
  };
  const ARCO_G = { lejos: 72, cerca: 72 };
  function pieG(lado, t) {
    const L = PASOS_G[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const sigilo = t < T.llega + 0.1 ? 1 : 0.35;
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alto: ARCO_G[lado] * sigilo * arco, punta: arco };
  }
  // tras la media vuelta las posiciones de los pies se ven reflejadas: el pie «cerca» queda donde estaba el «lejos»
  const X_GIRO = 680;

  /* ---------- Guillermo: posturas (manos respecto a su hombro, hoja) ---------- */
  const P0 = { pel: 0, torso: 0, cab: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const PATITA = { c0: 0.75, c1: 0.85, c2: 0.85, c3: 0.85, c4: 0.8 };           // mano de sigilo: muñeca arriba, dedos colgando
  const CUERPOS_G = {
    sigilo: C_(Object.assign({ pel: 46, torso: 0.2, cab: -0.04, cx: 150, cy: 170, ca: 0, cmu: -1.57, cp: 1, lx: 130, ly: 110, la: Math.PI, lmu: -1.57, lp: 1 }, PATITA)),
    risa: C_(Object.assign({ pel: 52, torso: 0.26, cab: 0.06, cx: 205, cy: 70, ca: 0, cmu: -2.0, cp: 1, lx: 130, ly: 115, la: Math.PI, lmu: -1.57, lp: 1 }, PATITA)),
    planta: C_(Object.assign({ pel: 30, torso: 0.3, cab: 0.02, cx: 120, cy: 200, ca: 0, cmu: -1.57, cp: 1, lx: 140, ly: 110, la: Math.PI, lmu: -1.57, lp: 1 }, PATITA)),
    dibuja: C_(Object.assign({ pel: 34, torso: 0.36, cab: 0.1, cx: 60, cy: 245, ca: 0, cmu: -1.7, cp: 1, lx: 200, ly: 160, la: -0.55, lmu: -1.75, lp: 1 },
      { c0: 0.6, c1: 0.75, c2: 0.75, c3: 0.7, c4: 0.65 })),
    susto: C_(Object.assign({ pel: 26, torso: 0.3, cab: 0.04, cx: 130, cy: 120, ca: 0, cmu: -1.57, cp: 1, lx: 200, ly: 150, la: -0.55, lmu: -1.75, lp: 1 },
      { c0: 1, c1: 1, c2: 1, c3: 1, c4: 1 })),
    carcajada: C_(Object.assign({ pel: 40, torso: 0.12, cab: 0.1, cx: 210, cy: 75, ca: 0, cmu: -2.1, cp: 1, lx: 120, ly: 170, la: -0.4, lmu: -1.75, lp: 1 },
      { c0: 0.9, c1: 1, c2: 1, c3: 1, c4: 1 })),
    guarda: C_({ pel: 10, torso: 0.02, cab: 0, cx: 40, cy: 300, cp: 0, lp: 0 }),
    jarras: C_({ pel: 0, torso: -0.1, cab: -0.12, cx: -20, cy: 250, ca: 0.9, cmu: -0.4, cp: 1, lx: 35, ly: 255, la: -0.9, lmu: -2.7, lp: 1 }),
    espejo: C_({ pel: 6, torso: 0.1, cab: 0.06, cx: -20, cy: 250, ca: 0.9, cmu: -0.4, cp: 1, lx: 35, ly: 255, la: -0.9, lmu: -2.7, lp: 1 }),
    piedra: C_(Object.assign({ pel: -6, torso: -0.05, cab: -0.04, cx: 70, cy: 150, ca: 0, cmu: -1.4, cp: 1, lx: 120, ly: 140, la: 0, lmu: -2.0, lp: 1 },
      { c0: 1, c1: 1, c2: 1, c3: 1, c4: 1, l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 }))
  };
  const GUION_G = [
    [2.75, 3.0, "planta"], [T.traza0 - 0.2, T.l0 - 0.05, "dibuja"], [T.remueve, T.remueve + 0.1, "susto", salida], [T.calma - 0.1, T.r0 - 0.05, "dibuja"],
    [T.ri0, T.ri0 + 0.2, "carcajada"], [T.tapa0 - 0.2, T.tapa0, "dibuja"], [T.tapa - 0.05, T.guarda1, "guarda"],
    [T.gafas1 - 0.05, T.gafas1 + 0.3, "jarras"], [T.acerca0 - 0.1, T.acerca1, "espejo"], [T.piedra - 0.08, T.piedra + 0.1, "piedra", salida]
  ];
  // risitas durante la entrada (encoge los hombros y se tapa la boca)
  const RISAS = [[0.85, 1.65], [2.2, 2.6]];
  const risaK = t => RISAS.reduce((m, [a, b]) => Math.max(m, tramo(t, a, a + 0.15) * (1 - tramo(t, b - 0.15, b))), 0);

  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, 0, -1.75), l: punoDesde({ x: 372, y: 648 }, 0, -1.75) };
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;

  // dónde está la punta del rotulador sobre la cara de Ander (pantalla) y si toca
  function plumaObjetivo(t, pa) {
    const H = AN.cabeza(pa), aP = q => AN.aPantalla(pa, H.a(q));
    const lev = { x: 0, y: -16 };                // levantar el rotulador (pantalla)
    const q0 = BIG_L[0], qL = puntoEn(BIG_L, 1), qR = puntoEn(BIG_R, 1);
    const sobre = (q, k) => { const s = aP(q); return { x: s.x + lev.x * k, y: s.y + lev.y * k }; };
    if (t < T.l0) return sobre(q0, 1 - tramo(t, T.traza0, T.l0));
    if (t < T.l1) return aP(puntoEn(BIG_L, avanceL(t)));
    if (t < T.r0) {
      // levanta, espera (Ander se remueve) y vuelve al centro
      const ida = tramo(t, T.l1, T.l1 + 0.12), vuelta = tramo(t, T.calma, T.r0 - 0.02);
      const a = sobre(qL, ida), b = sobre(q0, 1 - tramo(t, T.r0 - 0.12, T.r0));
      const tiembla = 1.2 * ruido(t * 30) * tramo(t, T.remueve, T.remueve + 0.1) * (1 - tramo(t, T.calma - 0.1, T.calma));
      const q = mezcla(a, b, vuelta); return { x: q.x + tiembla, y: q.y + (1 - vuelta) * -6 * tramo(t, T.remueve, T.remueve + 0.08) };
    }
    if (t < T.r1) return aP(puntoEn(BIG_R, avanceR(t)));
    // el puntito final en la mejilla
    const fin = sobre(qR, tramo(t, T.r1, T.r1 + 0.06)), lunar = aP({ x: 800, y: 690 });
    const k1 = tramo(t, T.r1 + 0.02, T.punto), k2 = tramo(t, T.punto + 0.06, T.atras0 + 0.15);
    const l2 = { x: lunar.x, y: lunar.y - 18 * k2 };
    return mezcla(mezcla(fin, lunar, k1), l2, k2 > 0 ? 1 : 0);
  }

  let cacheG = new Map();
  function poseG(t, pa) {
    const key = Math.round(t * 1e5); if (cacheG.has(key)) return cacheG.get(key);
    if (cacheG.size > 300) cacheG = new Map();
    const b = guion(GUION_G, CUERPOS_G, t, "sigilo"), e = guion(GUION_CARA_G, CARAS_G, t, "inicio");
    const girado = t >= (T.gira0 + T.gira1) / 2;          // a partir de aquí mira a la derecha
    const fl = pieG("lejos", t), fc = pieG("cerca", t);
    // tras el giro, los pies se ven reflejados alrededor de X_GIRO
    const xRef = x => (girado && t < T.acerca0 ? 2 * X_GIRO - x : x);
    const pies = { lejos: { x: xRef(fl.x), alto: fl.alto, punta: fl.punta }, cerca: { x: xRef(fc.x), alto: fc.alto, punta: fc.punta } };
    if (girado && t >= T.acerca0) { pies.lejos.x = pieG("lejos", t).x; pies.cerca.x = pieG("cerca", t).x; }
    const respira = Math.sin(t * 2.4);
    const congela = tramo(t, T.piedra - 0.04, T.piedra + 0.1);
    const bote = Math.max(fl.alto, fc.alto) / 72;
    const x = (pies.lejos.x + pies.cerca.x) / 2 + (girado ? 18 : -18);
    const p = {
      x, suelo: SUELO, s: S, espejo: !girado,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel - 16 * bote + respira * 1.2 * (1 - congela) }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 * (1 - congela) },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_G, t) * (t > T.piedra && t < T.miraA ? 0 : 1)), tirasLimpias: true, ikContinuo: false
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado], hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: TOB_G - f.alto - (lado === "lejos" ? 10 : 0) }, ang: -0.25 * f.punta + (t < T.llega ? 0.12 : 0) };
    }
    // risitas: hombros que se sacuden
    const rk = risaK(t) + tramo(t, T.ri0, T.ri0 + 0.15) * (1 - tramo(t, T.ri1 - 0.1, T.ri1));
    p.torso += 0.035 * Math.sin(t * 34) * rk; p.cabeza.ang += 0.04 * Math.sin(t * 34 + 1) * rk;
    p.pelvis.y -= 6 * Math.abs(Math.sin(t * 34)) * rk;
    // susto: un respingo
    p.pelvis.y -= 22 * campana(t, T.remueve, T.remueve + 0.3);
    p.sudor = tramo(t, T.remueve, T.remueve + 0.15) * (1 - tramo(t, T.calma, T.calma + 0.4)) + tramo(t, T.piedra + 0.1, T.piedra + 0.5);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const bc = Tr(BOLS_G.c), bl = Tr(BOLS_G.l);
    c = mezcla(c, bc, (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, bl, (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    let angL = b.la, muL = b.lmu, angC = b.ca, muC = b.cmu;
    const H = q => G.aHoja(p, q);
    const Cab = G.cabeza(p);
    // risita: la mano cercana tapa la boca
    if (rk > 0.01 && t < T.llega) { const bo = Cab.a({ x: 830, y: 760 }); c = mezcla(c, bo, rk); angC = lerp(angC, -0.3, rk); muC = lerp(muC, -2.6, rk); }
    // morder el capuchón: el capuchón del rotulador va a la boca y luego se aleja
    const boca = G.boca(p);
    const kBoca = tramo(t, T.tapon0, T.muerde) * (1 - tramo(t, T.tapon1, T.traza0)) + tramo(t, T.tapa0 - 0.1, T.tapa0 + 0.08) * (1 - tramo(t, T.tapa + 0.02, T.guarda1 - 0.05));
    if (kBoca > 0) {
      const a = -Math.PI / 2, tira = 26 * tramo(t, T.muerde, T.tapon1) * (t < T.traza0 ? 1 : 0);
      // al morder: la punta del capuchón en los labios; al tapar: la punta del rotulador en el capuchón
      const off = t < T.traza0 ? G.rotP({ x: 0, y: -24 * G.JK }, a) : G.rotP({ x: 0, y: 34 * G.JK }, Math.PI / 2);
      const objetivo = { x: boca.x + 20 - off.x + tira, y: boca.y + 6 - off.y };
      l = mezcla(l, objetivo, suave(kBoca)); angL = lerp(angL, t < T.traza0 ? a : Math.PI / 2, suave(kBoca)); muL = lerp(muL, t < T.traza0 ? 3.1 : 0, suave(kBoca));
    }
    // dibujar: la punta del rotulador va donde toca
    const kDib = tramo(t, T.traza0 - 0.18, T.traza0) * (1 - tramo(t, T.ri0, T.ri0 + 0.2));
    if (kDib > 0) {
      const pt = plumaObjetivo(t, pa), a = -0.6;
      const tip = H(pt), off = G.rotP({ x: 0, y: PUNTA_R * G.JK }, a);
      l = mezcla(l, { x: tip.x - off.x, y: tip.y - off.y }, kDib); angL = lerp(angL, a, kDib); muL = lerp(muL, -1.8, kDib);
    }
    // gafas: la mano lejana sube al puente de las gafas y las empuja hasta el pelo
    const kG = tramo(t, T.gafas0 - 0.2, T.gafas0 + 0.12) * (1 - tramo(t, T.gafas1 - 0.02, T.gafas1 + 0.3));
    if (kG > 0) {
      const sube = 175 * suave(fase(t, T.gafas0 + 0.1, T.gafas1 - 0.04));
      const q = Cab.a({ x: 868, y: 600 - sube });
      l = mezcla(l, { x: q.x + 8, y: q.y + 26 }, kG); angL = lerp(angL, 0, kG); muL = lerp(muL, 1.57, kG);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: angC, mu: muC, dobla: -1, puno: b.cp, dedos: dedosDe(b, "c") };
    const dedosL = kG > 0 ? { pulgar: 0, indice: lerp(b.l1, 1, kG), medio: lerp(b.l2, 0.2, kG), anular: 0, menique: 0 } : dedosDe(b, "l");
    p.manoLejos = { x: l.x, y: l.y, ang: angL, mu: muL, dobla: -1, puno: b.lp, dedos: dedosL };
    // rotulador en la mano lejana (hasta guardarlo)
    if (t < T.guarda1 - 0.05) {
      const tapado = t < T.muerde || t > T.tapa;
      p.manoLejos.objeto = gg => rotulador(gg, tapado, true);
      p.manoLejos.dedos = { pulgar: 0.3, indice: 0.3, medio: 0.3, anular: 0.3, menique: 0.3 };
    }
    // capas de la cara: monóculo y ceja única, capuchón en los dientes, gafas de sol
    const enBoca = t >= T.muerde && t < T.tapa;
    const kGafas = 1 - tramo(t, T.gafas0 + 0.1, T.gafas1 - 0.04);
    p.capaCabeza = gg => { marcasGuillermo(gg, p); if (enBoca) capuchonBoca(gg); gafasSol(gg, kGafas); };
    p.sx = t > T.gira0 && t < T.gira1 ? Math.cos(Math.PI * fase(t, T.gira0, T.gira1)) * (girado ? -1 : 1) : 1;
    cacheG.set(key, p);
    return p;
  }

  /* ---------- Ander: dormido en el taburete ---------- */
  // Sentado, inclinado sobre la mesa: la cabeza apoyada en el brazo lejano, estirado sobre el tablero
  // (con el rotulador en la mano); el brazo cercano cuelga junto al taburete.
  const PEL_A = { x: AN.PELVIS.x, y: AN.PELVIS.y + 118 };
  const PIES_A = { cerca: { x: 36, y: 480 }, lejos: { x: 46, y: 476 } };       // tobillos sobre el aro del taburete (px de pantalla respecto a XA)
  // al abrir el ojo despega la cabeza del brazo (se ve el bigote derecho) y luego la vuelve a apoyar
  const levanta = t => suave(tramo(t, T.ojoA - 0.12, T.sonrieA + 0.1)) * (1 - suave(tramo(t, T.cierraA - 0.1, T.cierraA + 0.3)));
  let cacheA = new Map();
  function poseA(t) {
    const key = Math.round(t * 1e5); if (cacheA.has(key)) return cacheA.get(key);
    if (cacheA.size > 300) cacheA = new Map();
    const e = guion(GUION_CARA_A, CARAS_A, t, "duerme");
    // ronquido: el pecho sube y baja con la pompa
    const pb = pompa(t), resp = (pb.r - 30) / 40;
    const rem = campana(t, T.remueve, T.remueve + 0.7);
    const p = {
      x: XA, suelo: SUELO, s: S,
      pelvis: { x: PEL_A.x, y: PEL_A.y }, torso: A_TORSO + 0.012 * resp + 0.03 * rem, torsoEsc: { x: 1, y: 1 + 0.012 * resp },
      piernas: {}, cabeza: { ang: A_CAB + 0.008 * resp + 0.06 * rem - 0.42 * levanta(t), dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, 0), tirasLimpias: true, ikContinuo: false
    };
    for (const lado of ["cerca", "lejos"]) { const f = PIES_A[lado]; p.piernas[lado] = { tob: AN.aHoja(p, { x: XA + f.x, y: f.y }), ang: 0.12 }; }
    // labios que se relamen al removerse
    p.cara.boca.abre += 6 * Math.max(0, Math.sin((t - T.remueve) * 22)) * rem;
    const Tr = AN.tronco(p), hc = Tr(AN.HOMBRO_C);
    // brazo lejano estirado sobre la mesa (por detrás de la cabeza), con el rotulador en el puño
    let l = AN.aHoja(p, { x: A_MANO.x, y: A_MANO.y });
    let angL = -1.57;
    // al abrir el ojo levanta el puño con el rotulador y lo menea
    const kR = tramo(t, T.rotA0, T.rotA0 + 0.3) * (1 - tramo(t, T.cierraA - 0.05, T.cierraA + 0.2));
    if (kR > 0) { const q = AN.aHoja(p, { x: A_MANO.x + 4, y: A_MANO.y - 16 }); l = mezcla(l, q, kR); angL = -1.57 + kR * (-0.7 + 0.35 * Math.sin((t - T.rotA0) * 9)); }
    p.manoLejos = { x: l.x, y: l.y, ang: angL, mu: -1.57, dobla: 1, puno: 1, detras: true, objeto: gg => rotulador(gg, true, true) };
    // brazo cercano colgando junto al taburete, mano relajada
    const cuelga = AN.aHoja(p, { x: XA - 16 + 2 * Math.sin(t * 1.1), y: 418 });
    p.manoCerca = { x: cuelga.x, y: cuelga.y, ang: 0.12, mu: -1.75, dobla: -1, puno: 1, dedos: { pulgar: 0.55, indice: 0.7, medio: 0.68, anular: 0.62, menique: 0.58 } };
    p.capaCabeza = gg => { bigoteRotulador(gg, t); dibPompa(gg, t); };
    cacheA.set(key, p);
    return p;
  }
  function pose(t) { const a = poseA(t); return { g: poseG(t, a), a }; }

  /* ---------- reflejo en el espejo ---------- */
  function reflejo(g, t, pg) {
    if (pg.espejo || pg.sx !== 1) return;
    const C = G.aPantalla(pg, G.centroCabeza(pg));
    // el reflejo entra por la derecha del óvalo según se acerca y queda centrado cuando se asoma
    const xc = ESP.x - 6 + (802 - C.x) * 1.0, yc = C.y;
    const r = Object.assign({}, pg, { espejo: true });
    r.x = pg.x + (xc - C.x) + (xc - C.x === 0 ? 0 : 0);
    // con espejo el cuerpo se refleja alrededor de x: la cabeza queda a la izquierda de la pelvis
    const Cr = G.aPantalla(r, G.centroCabeza(r));
    r.x += xc - Cr.x; r.suelo = pg.suelo + (yc - Cr.y);
    g.save();
    g.beginPath(); g.ellipse(ESP.x, ESP.y, ESP.rx, ESP.ry, 0, 0, Math.PI * 2); g.clip();
    G.dibujar(g, r, t);
    g.fillStyle = "rgba(150,190,220,0.18)"; g.fillRect(ESP.x - ESP.rx, ESP.y - ESP.ry, ESP.rx * 2, ESP.ry * 2);
    g.restore();
  }
  function cristalEspejo(g) {
    g.save();
    g.beginPath(); g.ellipse(ESP.x, ESP.y, ESP.rx, ESP.ry, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = "rgba(255,255,255,0.22)";
    g.beginPath(); g.moveTo(ESP.x - 40, ESP.y + 70); g.lineTo(ESP.x + 10, ESP.y - 80); g.lineTo(ESP.x + 30, ESP.y - 80); g.lineTo(ESP.x - 20, ESP.y + 70); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.12)";
    g.beginPath(); g.moveTo(ESP.x + 4, ESP.y + 80); g.lineTo(ESP.x + 44, ESP.y - 40); g.lineTo(ESP.x + 52, ESP.y - 40); g.lineTo(ESP.x + 12, ESP.y + 80); g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- efectos ---------- */
  // rayitas de susto alrededor de la cabeza
  function sustoRayas(g, t, pg, t0, t1, n) {
    const k = fase(t, t0, t1); if (k <= 0 || k >= 1) return;
    const c = G.aPantalla(pg, G.centroCabeza(pg));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * Math.min(1, k * 5) * (1 - k)})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.45, r0 = 70 + 10 * k;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * (r0 + 14), c.y + Math.sin(a) * (r0 + 14)); g.stroke(); }
    g.restore();
  }
  // brillo de las gafas al subirlas
  function destello(g, t, t0, q, tam) {
    const k = fase(t, t0, t0 + 0.4); if (k <= 0 || k >= 1) return;
    const s = tam * Math.sin(Math.PI * k);
    g.save(); g.translate(q.x, q.y); g.rotate(k * 1.2); g.fillStyle = "rgba(255,255,255,0.95)";
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? s * 0.22 : s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- decorado: bar cerrando de madrugada ---------- */
  let fondo = null, vineta = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared azul noche con papel de rayas
    const pared = g.createLinearGradient(0, -60, 0, 420); pared.addColorStop(0, "#141c2c"); pared.addColorStop(1, "#22324a");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 480);
    for (let x = -40, i = 0; x < W + 40; x += 30, i++) { g.fillStyle = i % 2 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.05)"; g.fillRect(x, -60, 30, 480); }
    // ventana con la luna
    g.save(); g.translate(560, 40);
    g.fillStyle = "#0a1020"; g.fillRect(0, 0, 150, 120);
    const cielo = g.createLinearGradient(0, 0, 0, 120); cielo.addColorStop(0, "#0d1734"); cielo.addColorStop(1, "#24305a"); g.fillStyle = cielo; g.fillRect(0, 0, 150, 120);
    g.fillStyle = "#f4eecf"; g.beginPath(); g.arc(104, 38, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#24305a"; g.beginPath(); g.arc(113, 33, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.8)"; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(10 + hash(i) * 130, 10 + hash(i + 5) * 100, 1.2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#0e1424"; for (let i = 0; i < 5; i++) { const w = 18 + hash(i + 20) * 14, h = 30 + hash(i + 30) * 40; g.fillRect(i * 32 - 4, 120 - h, w, h); }
    g.strokeStyle = "#3b2a1c"; g.lineWidth = 7; g.strokeRect(0, 0, 150, 120); g.lineWidth = 4; g.beginPath(); g.moveTo(75, 0); g.lineTo(75, 120); g.moveTo(0, 60); g.lineTo(150, 60); g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = TINTA; g.strokeRect(-3.5, -3.5, 157, 127);
    g.restore();
    // reloj de pared: las tres y cinco
    g.save(); g.translate(128, 96);
    g.fillStyle = "#e8dfc8"; g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill(); g.lineWidth = 5; g.strokeStyle = "#5a3a1e"; g.stroke(); g.lineWidth = 2; g.strokeStyle = TINTA; g.beginPath(); g.arc(0, 0, 33, 0, Math.PI * 2); g.stroke();
    g.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.lineWidth = i % 3 ? 1.5 : 3; g.beginPath(); g.moveTo(Math.cos(a) * 23, Math.sin(a) * 23); g.lineTo(Math.cos(a) * 27, Math.sin(a) * 27); g.stroke(); }
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(14, 1); g.stroke();
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-Math.PI / 2 + 0.52) * 22, Math.sin(-Math.PI / 2 + 0.52) * 22); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill();
    g.restore();
    // estantería con botellas (apagada)
    g.fillStyle = "#3a2716"; g.fillRect(20, 196, 180, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(20, 196, 180, 9);
    const COLS = ["#2f5a3a", "#6a2a22", "#a88330", "#33476a", "#5a2a5a", "#7a6a3a"];
    for (let i = 0; i < 7; i++) {
      const x = 34 + i * 24, h = 30 + 12 * hash(i + 3), col = COLS[i % COLS.length];
      g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x - 6, 196); g.lineTo(x - 6, 196 - h * 0.6); g.quadraticCurveTo(x - 6, 196 - h * 0.75, x - 2.5, 196 - h * 0.8); g.lineTo(x - 2.5, 196 - h); g.lineTo(x + 2.5, 196 - h);
      g.lineTo(x + 2.5, 196 - h * 0.8); g.quadraticCurveTo(x + 6, 196 - h * 0.75, x + 6, 196 - h * 0.6); g.lineTo(x + 6, 196); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x - 4.5, 196 - h * 0.55, 1.6, h * 0.45);
    }
    // zócalo de madera
    g.fillStyle = "#2a1c12"; g.fillRect(-40, 400, W + 80, SUELO - 400);
    g.fillStyle = "#3e2a1a"; g.fillRect(-40, 396, W + 80, 8); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-40, 396, W + 80, 8);
    g.strokeStyle = "rgba(0,0,0,0.35)"; for (let x = 0; x < W + 40; x += 96) { g.strokeRect(x + 8, 414, 80, SUELO - 432); }
    // suelo de tablas
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#3a2818"); su.addColorStop(1, "#1a1008");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const y = SUELO + 9 + i * i * 7 + i * 5; g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -60; x < W + 80; x += 90) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x + (x - 512) * 0.3, H + 60); g.stroke(); }
    // mesa del fondo con sillas patas arriba (hora de cerrar)
    g.save(); g.translate(80, SUELO);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.fillStyle = "#4a3020";
    g.fillRect(-55, -150, 150, 10); g.strokeRect(-55, -150, 150, 10);
    g.fillRect(14, -140, 10, 140); g.strokeRect(14, -140, 10, 140); g.fillRect(-14, -6, 66, 6); g.strokeRect(-14, -6, 66, 6);
    for (const [dx, sg] of [[-38, 1], [58, -1]]) {
      g.fillStyle = "#5a3a26"; g.fillRect(dx - 22, -170, 46, 8); g.strokeRect(dx - 22, -170, 46, 8);
      for (const lx of [dx - 18, dx + 16]) { g.beginPath(); g.moveTo(lx, -170); g.lineTo(lx + sg * 4, -262); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3; g.strokeStyle = "#6a4630"; g.stroke(); }
      g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(dx - 16, -222); g.lineTo(dx + 18, -222); g.stroke();
    }
    g.restore();
    // espejo ovalado con marco dorado y un aplique
    g.save(); g.translate(ESP.x, ESP.y);
    g.fillStyle = "#8a6a2a"; g.beginPath(); g.ellipse(0, 0, ESP.rx + 11, ESP.ry + 11, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "#d9b25a"; g.lineWidth = 4; g.beginPath(); g.ellipse(0, 0, ESP.rx + 6, ESP.ry + 6, 0, 0, Math.PI * 2); g.stroke();
    const vid = g.createLinearGradient(-ESP.rx, -ESP.ry, ESP.rx, ESP.ry); vid.addColorStop(0, "#3a4e66"); vid.addColorStop(1, "#1c2838");
    g.fillStyle = vid; g.beginPath(); g.ellipse(0, 0, ESP.rx, ESP.ry, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#d9b25a"; g.beginPath(); g.arc(0, -ESP.ry - 12, 7, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
    g.restore();
    // aplique de pared junto al espejo y su halo
    const ax = ESP.x + 96, ay = 150;
    const halo = g.createRadialGradient(ax, ay, 4, ax, ay, 170); halo.addColorStop(0, "rgba(255,206,130,0.4)"); halo.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = halo; g.fillRect(ax - 170, ay - 170, 340, 340);
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(ax, ay + 26); g.lineTo(ax, ay + 6); g.stroke();
    g.fillStyle = "#c9a14a"; g.beginPath(); g.ellipse(ax, ay + 26, 9, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#ffe3a6"; g.beginPath(); g.moveTo(ax - 14, ay + 8); g.lineTo(ax + 14, ay + 8); g.lineTo(ax + 9, ay - 14); g.lineTo(ax - 9, ay - 14); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
    // cono de luz de la lámpara sobre la mesa
    const cono = g.createLinearGradient(0, LAMP.y, 0, SUELO);
    cono.addColorStop(0, "rgba(255,214,140,0.34)"); cono.addColorStop(1, "rgba(255,200,120,0.06)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(LAMP.x - 30, LAMP.y + 14); g.lineTo(LAMP.x + 30, LAMP.y + 14); g.lineTo(LAMP.x + 175, SUELO); g.lineTo(LAMP.x - 175, SUELO); g.closePath(); g.fill();
    const charco = g.createRadialGradient(LAMP.x, SUELO + 6, 10, LAMP.x, SUELO + 6, 190); charco.addColorStop(0, "rgba(255,206,130,0.35)"); charco.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = charco; g.beginPath(); g.ellipse(LAMP.x, SUELO + 8, 190, 26, 0, 0, Math.PI * 2); g.fill();
    // lámpara colgante
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(LAMP.x, -60); g.lineTo(LAMP.x, LAMP.y - 22); g.stroke();
    g.fillStyle = "#2f5a4a"; g.beginPath(); g.moveTo(LAMP.x - 34, LAMP.y + 12); g.quadraticCurveTo(LAMP.x, LAMP.y - 44, LAMP.x + 34, LAMP.y + 12); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "#fff0c4"; g.beginPath(); g.ellipse(LAMP.x, LAMP.y + 12, 26, 6, 0, 0, Math.PI * 2); g.fill();
    // taburete de Ander
    g.save(); g.translate(TAB.x, 0);
    g.strokeStyle = TINTA; g.lineWidth = 2.5;
    for (const [x0, x1] of [[-30, -40], [30, 40], [-12, -16], [12, 16]]) { g.fillStyle = "#5a3a26"; g.beginPath(); g.moveTo(x0 - 3, TAB.asiento + 6); g.lineTo(x0 + 3, TAB.asiento + 6); g.lineTo(x1 + 3, SUELO); g.lineTo(x1 - 3, SUELO); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = "#c9a14a"; g.fillRect(-37, 503, 74, 5); g.strokeRect(-37, 503, 74, 5);
    g.fillStyle = "#7a2a2a"; g.beginPath(); g.ellipse(0, TAB.asiento, 42, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#5a1a1a"; g.fillRect(-42, TAB.asiento, 84, 8); g.strokeRect(-42, TAB.asiento, 84, 8);
    g.restore();
    // mesa alta
    g.save(); g.translate(MESA.x, 0);
    g.fillStyle = "#1c1c22"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.fillRect(-6, MESA.top, 12, SUELO - MESA.top - 8); g.strokeRect(-6, MESA.top, 12, SUELO - MESA.top - 8);
    g.beginPath(); g.ellipse(0, SUELO - 4, 40, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#5a3820"; g.fillRect(-MESA.rx, MESA.top, MESA.rx * 2, 10); g.strokeRect(-MESA.rx, MESA.top, MESA.rx * 2, 10);
    g.fillStyle = "#7a4e2c"; g.beginPath(); g.ellipse(0, MESA.top, MESA.rx, MESA.ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,226,170,0.25)"; g.beginPath(); g.ellipse(-12, MESA.top - 2, MESA.rx * 0.6, MESA.ry * 0.45, 0, 0, Math.PI * 2); g.fill();
    // una caña vacía en la mesa
    g.translate(56, MESA.top - 2);
    g.fillStyle = "rgba(214,236,255,0.35)"; g.beginPath(); g.moveTo(-9, -34); g.lineTo(9, -34); g.lineTo(7, 0); g.lineTo(-7, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,248,232,0.7)"; g.fillRect(-7, -10, 14, 8);
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
  // zoom máximo 1,25 y centro bajo: los dos cuerpos enteros siempre en cuadro
  const CAM = [[0, 1.0, 512, 300], [2.4, 1.0, 512, 300], [3.5, 1.25, 475, 345], [7.05, 1.25, 475, 345], [7.9, 1.16, 540, 330],
    [8.55, 1.16, 540, 330], [9.1, 1.25, 560, 345], [10.3, 1.25, 560, 345], [11.2, 1.25, 605, 345], [14.1, 1.25, 605, 345]];
  function camara(t) {
    let i = 0; while (i + 1 < CAM.length && t >= CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[Math.min(CAM.length - 1, i + 1)], k = b === a ? 0 : suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }

  class GuillermoAnderBigote extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !AN.listo()) return;
      if (!fondo) { fondo = creaFondo(); vineta = creaVineta(); }
      const { g: pg, a: pa } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -60);
      // espejo: reflejo de Guillermo y brillo del cristal
      reflejo(g, t, pg); cristalEspejo(g);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(XA + 30, SUELO + 2, 80, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pg.x, SUELO + 2, 78 * Math.abs(pg.sx), 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      AN.dibujar(g, pa, t);
      // Guillermo (con la media vuelta de dibujo animado: se estrecha y se da la vuelta)
      g.save();
      if (pg.sx !== 1) { g.translate(pg.x, 0); g.scale(Math.max(0.02, Math.abs(pg.sx)), 1); g.translate(-pg.x, 0); }
      G.dibujar(g, pg, t);
      g.restore();
      // efectos
      sustoRayas(g, t, pg, T.remueve, T.remueve + 0.4, 5);
      sustoRayas(g, t, pg, T.piedra, T.piedra + 0.45, 7);
      if (t > T.gafas0 && t < T.gafas1 + 0.5) destello(g, t, T.gafas1 - 0.1, G.aPantalla(pg, G.cabeza(pg).a({ x: 930, y: 390 })), 16);
      if (t > T.sonrieA && t < T.sonrieA + 0.6) destello(g, t, T.sonrieA + 0.05, AN.aPantalla(pa, AN.cabeza(pa).a({ x: 905, y: 690 })), 12);
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00034", nombre: "Guillermo y Ander · El bigote", crear: () => new GuillermoAnderBigote() });
  window.__A2D_00034 = { pose, T, DUR, poseG, poseA };
})();
