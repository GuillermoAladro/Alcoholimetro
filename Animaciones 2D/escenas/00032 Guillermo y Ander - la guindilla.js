"use strict";
/* 00032 · Guillermo y Ander · La guindilla
 *
 * Negro → cantina mexicana al atardecer: pared de barro con papel picado, zócalo de azulejo
 * talavera, ristra de guindillas colgada y una mesa alta. Entre Guillermo (izquierda) y Ander
 * (derecha, mirándole) hay un plato con dos guindillas rojas, una jarra de agua y un vaso de leche
 * → Ander levanta una ceja: reto aceptado. Coge su guindilla por el rabito, le da dos mordiscos,
 * mastica tan tranquilo mirando a cámara, traga, tira el rabito al plato y se encoge de hombros →
 * Guillermo, muy chulo, coge la suya, la enseña a cámara con un guiño y se la mete entera en la
 * boca; mastica sobrado con la mano en la cadera… un silencio… → se pone rojo desde el cuello
 * hasta la frente, como el mercurio de un termómetro; se agarra el cuello, suda, le silba vapor
 * por la oreja y le humea el pelo → echa una llamarada por la boca (Ander se echa hacia atrás) →
 * agarra la jarra de agua y se la bebe entera a tragos, con los carrillos hinchados y lagrimones
 * → jadea con la lengua fuera; Ander, sin inmutarse, le desliza el vaso de leche por la mesa →
 * Guillermo se la bebe de un trago: el rojo baja, le queda bigote de leche y suspira una nubecilla
 * de humo → Ander se saca otra guindilla del bolsillo y le da un mordisco crujiente, como quien se
 * come una zanahoria; a Guillermo le tiembla un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Los objetos que pasan de la mesa a la mano se
 * dibujan con la misma función y la misma escala en los dos sitios, así no saltan al cogerlos.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, AN = Ander;
  const S = 0.31, SUELO = 560, XG = 400, XA = 625;
  const JK = G.JK, U = JK * S;                    // unidades de mano → px de pantalla (K = 1 en los dos)
  const DUR = 14.6;
  const T = {
    mira: 0.45, reta: 0.95, chulo0: 1.0,
    aVa: 1.4, aCoge: 1.85, aBoca: 2.3, aMuerde1: 2.45, aMuerde2: 2.85, aTallo0: 3.05, aTallo: 3.35, aTraga: 3.85, aEncoge: 4.05,
    gVa: 4.4, gCoge: 4.8, gMuestra: 4.95, gGuino: 5.15, gBoca0: 5.45, gBoca: 5.62, gMete: 5.82, gMastica: 5.95, gSobrado: 6.4,
    pausa: 6.45, tic: 6.72, rojo0: 6.9, rojo1: 7.9, cuello0: 7.0, cuello1: 8.15, vapor0: 7.55, humo0: 7.8,
    fuego0: 8.25, fuego1: 8.85, jarraVa: 8.88, jarraCoge: 9.22, bebe0: 9.45, bebe1: 10.55, jarraDeja0: 10.62, jarraDeja: 10.88,
    jadea0: 10.9, lecheVa: 10.6, lecheToca: 10.98, lecheEmpuja: 11.16, lecheLlega: 11.48,
    gLecheVa: 11.25, gLecheCoge: 11.55, bebeLeche0: 11.78, bebeLeche1: 12.32, vasoDeja0: 12.4, vasoDeja: 12.62,
    baja0: 11.95, baja1: 12.7, suspiro0: 12.68, aSaca0: 12.55, aSaca: 12.95, aCrunch: 13.25, gPasma: 13.3, ticFin: 13.55,
    fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const P = (x, y) => ({ x, y });
  function recorta(pol, n, c) {
    const out = [], v = q => q.x * n.x + q.y * n.y - c;
    for (let i = 0; i < pol.length; i++) { const a = pol[i], b = pol[(i + 1) % pol.length], va = v(a), vb = v(b);
      if (va >= 0) out.push(a);
      if ((va >= 0) !== (vb >= 0)) { const k = va / (va - vb); out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }); } }
    return out;
  }
  const area = pol => { let s = 0; for (let i = 0; i < pol.length; i++) { const a = pol[i], b = pol[(i + 1) % pol.length]; s += a.x * b.y - b.x * a.y; } return Math.abs(s) / 2; };
  function nivel(INT, AREA, n, vol) {
    let lo = Math.min(...INT.map(q => q.x * n.x + q.y * n.y)), hi = Math.max(...INT.map(q => q.x * n.x + q.y * n.y));
    const obj = clamp(vol) * AREA;
    for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (area(recorta(INT, n, m)) > obj) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  // inclinación (negativa: la boca del recipiente gira hacia la cara) con la que el líquido llega justo al borde B
  function inclinacion(INT, AREA, B, vol) {
    let lo = 0, hi = -2.3;
    for (let i = 0; i < 24; i++) { const a = (lo + hi) / 2, n = rotP({ x: 0, y: 1 }, -a);
      if (area(recorta(INT, n, B.x * n.x + B.y * n.y)) > vol * AREA) lo = a; else hi = a; }
    return (lo + hi) / 2;
  }
  const poligono = M2.poligono;
  const TINTA = "#0b0a0e";

  /* ---------- objetos (en «unidades de mano»; origen donde los agarra la mano) ---------- */
  // Guindilla: origen en el rabito (pinza de los dedos); el cuerpo va hacia +x y se curva un poco.
  // k = lo que queda: 1 entera, 0 solo el cáliz, -1 nada (se la ha metido entera en la boca).
  const CH_L = 36, CH_E = 1.35;                                     // largo y escala de la guindilla
  const chileCentro = u => P(7 + CH_L * u, 7 * u * u);
  const corteX = k => k >= 0 ? 7 + CH_L * k : 7 + 14 * k;            // x hasta donde se ve
  const puntaChile = k => { const x = corteX(k); return P(x * CH_E, (k >= 0 ? 7 * k * k : 0) * CH_E); };
  function guindilla(g, k, t, brillo = 1) {
    if (k <= -0.98) return;
    const xc = corteX(k);
    g.save(); g.scale(CH_E, CH_E); g.lineJoin = "round"; g.lineCap = "round";
    // recorte del mordisco: semiplano x < xc con dos bocados redondos
    g.beginPath(); g.moveTo(-14, -16); g.lineTo(xc + (k < 1 ? 0 : 6), -16);
    if (k < 0.995) { g.lineTo(xc, -3); g.arc(xc + 1.5, 1.5, 3.2, -Math.PI / 2, Math.PI / 2, true); g.lineTo(xc, 6); g.arc(xc + 1.2, 9.5, 2.8, -Math.PI / 2, Math.PI / 2, true); }
    g.lineTo(xc + (k < 1 ? 0 : 6), 24); g.lineTo(-14, 24); g.closePath(); g.clip();
    // cuerpo
    const N = 14, izq = [], der = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, c = chileCentro(u), d = { x: CH_L, y: 14 * u }, l = Math.hypot(d.x, d.y), nx = -d.y / l, ny = d.x / l;
      const w = 4.8 * (1 - Math.pow(u, 1.7)) + 0.5;
      izq.push(P(c.x + nx * w, c.y + ny * w)); der.push(P(c.x - nx * w, c.y - ny * w));
    }
    const cuerpo = () => { g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let i = N; i >= 0; i--) g.lineTo(der[i].x, der[i].y); g.closePath(); };
    cuerpo(); g.fillStyle = "#d4161f"; g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "#8f0b12"; g.beginPath(); for (const q of izq) g.lineTo(q.x, q.y + 0.2); for (let i = N; i >= 0; i--) g.lineTo(lerp(izq[i].x, der[i].x, 0.45), lerp(izq[i].y, der[i].y, 0.45)); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,210,200,0.85)"; g.globalAlpha = brillo;
    g.beginPath(); g.ellipse(17, -1.6, 7, 1.3, 0.18, 0, Math.PI * 2); g.fill();
    g.restore();
    cuerpo(); g.lineWidth = 1.7; g.strokeStyle = TINTA; g.stroke();
    // interior del mordisco (pulpa clara con pepitas)
    if (k < 0.99 && k > 0.02) { const c = chileCentro(k); g.fillStyle = "#ffb08a"; g.beginPath(); g.ellipse(c.x - 0.4, c.y, 1.4, 3.4 * (1 - k * 0.6), 0.15, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff0a0"; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(c.x - 0.6, c.y - 1.5 + i * 1.5, 0.5, 0, Math.PI * 2); g.fill(); } }
    // cáliz y rabito
    g.fillStyle = "#3f9b33"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(9, -5); g.quadraticCurveTo(3, -6, 2.5, 0); g.quadraticCurveTo(3, 6, 9, 5); g.quadraticCurveTo(6.5, 0, 9, -5); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 3.4; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(3, 0); g.quadraticCurveTo(-2, -1, -5, -4); g.stroke();
    g.lineWidth = 1.8; g.strokeStyle = "#5bb84a"; g.stroke();
    g.restore();
  }
  // Jarra de agua de cristal: origen en el asa (a la derecha); el cuerpo va hacia −x y el pico arriba a la izquierda.
  const J_INT = [P(-66, -41), P(-19, -41), P(-18, 34), P(-22, 38), P(-60, 38), P(-65, 31), P(-67, -6)];
  const J_AREA = area(J_INT), J_BORDE = P(-66, -41), J_ABAJO = 43;
  function jarra(g, vol, angMundo, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // asa
    g.beginPath(); g.moveTo(-15, -30); g.bezierCurveTo(10, -38, 10, 30, -15, 24);
    g.lineWidth = 11; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 6.5; g.strokeStyle = "#dceef6"; g.stroke();
    const cuerpo = () => { g.beginPath(); g.moveTo(-74, -50); g.quadraticCurveTo(-68, -46, -66, -45); g.lineTo(-15, -46);
      g.lineTo(-14, 36); g.quadraticCurveTo(-14, 43, -21, 43); g.lineTo(-61, 43); g.quadraticCurveTo(-69, 43, -69, 34);
      g.quadraticCurveTo(-72, -8, -70, -36); g.quadraticCurveTo(-71, -44, -74, -50); g.closePath(); };
    cuerpo(); g.fillStyle = "rgba(205,235,250,0.32)"; g.fill();
    if (vol > 0.004) {
      const n = rotP({ x: 0, y: 1 }, -angMundo), cl = nivel(J_INT, J_AREA, n, vol), pl = recorta(J_INT, n, cl);
      if (pl.length > 2) {
        g.beginPath(); poligono(g, pl); g.fillStyle = "rgba(120,200,240,0.78)"; g.fill();
        g.save(); g.beginPath(); poligono(g, pl); g.clip();
        const fondo = recorta(J_INT, n, cl + 16); if (fondo.length > 2) { g.beginPath(); poligono(g, fondo); g.fillStyle = "rgba(60,150,210,0.45)"; g.fill(); }
        g.fillStyle = "rgba(255,255,255,0.8)";
        for (let i = 0; i < 7; i++) { const ph = (t * (0.5 + hash(i + 31) * 0.5) + hash(i + 37)) % 1; g.beginPath(); g.arc(-60 + hash(i + 33) * 40, 34 - ph * 70, 1 + hash(i + 35), 0, Math.PI * 2); g.fill(); }
        g.restore();
        // superficie
        const cs = pl.filter(q => Math.abs(q.x * n.x + q.y * n.y - cl) < 0.01);
        if (cs.length >= 2) { g.beginPath(); g.moveTo(cs[0].x, cs[0].y); g.lineTo(cs[1].x, cs[1].y); g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,0.9)"; g.stroke(); }
      }
    }
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(-64, -36, 4, 62);
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.4; for (const x of [-52, -40, -28]) { g.beginPath(); g.moveTo(x, -34); g.lineTo(x, 30); g.stroke(); }
    g.restore();
    cuerpo(); g.lineWidth = 2.1; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(-41, -45.5, 26, 2.4, 0, 0, Math.PI * 2); g.lineWidth = 1.3; g.stroke();
    g.restore();
  }
  // Vaso de leche: origen en el centro, donde lo agarra la mano.
  const V_INT = [P(-11, -29), P(11, -29), P(9.6, 24), P(-9.6, 24)];
  const V_AREA = area(V_INT), V_BORDE = P(-11, -29), V_ABAJO = 30;
  function vasoLeche(g, vol, angMundo, t) {
    g.save(); g.lineJoin = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(-13.5, -32); g.lineTo(13.5, -32); g.lineTo(11.5, 30); g.lineTo(-11.5, 30); g.closePath(); };
    cuerpo(); g.fillStyle = "rgba(215,238,250,0.35)"; g.fill();
    if (vol > 0.004) {
      const n = rotP({ x: 0, y: 1 }, -angMundo), cl = nivel(V_INT, V_AREA, n, vol), pl = recorta(V_INT, n, cl);
      if (pl.length > 2) {
        g.beginPath(); poligono(g, pl); g.fillStyle = "#fbfaf4"; g.fill();
        g.save(); g.beginPath(); poligono(g, pl); g.clip(); g.fillStyle = "rgba(200,205,215,0.55)"; g.fillRect(3, -40, 12, 80); g.restore();
      }
    } else { g.save(); cuerpo(); g.clip(); g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-10, -26, 20, 6); g.restore(); }
    g.save(); cuerpo(); g.clip(); g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(-10, -28, 3, 50); g.restore();
    g.fillStyle = "rgba(225,240,250,0.85)"; g.fillRect(-11.5, 25, 23, 5);
    cuerpo(); g.lineWidth = 1.9; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(-11.5, 25); g.lineTo(11.5, 25); g.lineWidth = 1.1; g.stroke();
    g.restore();
  }

  /* ---------- mesa y cosas que hay encima (pantalla) ---------- */
  const TX0 = 425, TX1 = 607, TY = 360;
  const JARRA0 = P(494, TY - J_ABAJO * U);           // asa de la jarra apoyada
  const PLATO = P(545, TY - 1);
  const CH_G0 = P(518, TY - 8), CH_A0 = P(574, TY - 5);
  const TALLO_A = P(556, TY - 5);
  const VASO0 = P(595, TY - V_ABAJO * U), VASO_FIN = P(511, TY - V_ABAJO * U);

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, lengua: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: 0, rubor: 0, bigote: 0 };
  }
  function parpadeo(t, lista) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.1 }),
    plato: E({ mx: 0.7, my: 0.75, orig: 0, sonr: 0.3 }),
    chulo: E({ mx: -0.85, my: -0.2, sd: 14, gd: 0.14, si: -2, gi: -0.05, orig: 0, sonr: 0.55, ancho: 0.95 }),
    mira: E({ mx: 0.85, my: 0.05, sd: 6, gd: 0.05, si: 2, orig: 0, sonr: 0.3 }),
    asombra: E({ mx: 0.85, my: 0, sd: 16, gd: 0.1, si: 14, gi: 0.08, orig: 0, abre: 8, ancho: 0.8, sonr: 0 }),
    coge: E({ mx: 0.6, my: 0.7, sd: 4, orig: 0, sonr: 0.5 }),
    muestra: E({ mx: -0.85, my: -0.3, sd: 16, gd: 0.15, si: 4, orig: 0, sonr: 0.8, ancho: 1.05 }),
    abre: E({ mx: 0.3, my: -0.4, sd: 10, si: 10, orig: 0, abre: 42, ancho: 1.05, sonr: 0.1, lengua: 0.5 }),
    sobrado: E({ mx: 0.85, my: -0.1, c: 0.45, sd: 12, gd: 0.12, si: 10, gi: 0.1, orig: 0, sonr: 0.65, ancho: 0.9 }),
    congela: E({ mx: 0.85, my: -0.05, c: 0.1, sd: 12, gd: 0.12, si: 10, gi: 0.1, orig: 0, sonr: 0.55, ancho: 0.9 }),
    pica: E({ mx: 0, my: 0, iris: 0.55, sd: 26, gd: -0.05, si: 24, gi: -0.05, orig: 0, abre: 5, ancho: 0.75, sonr: -0.55 }),
    fuego: E({ mx: 0.85, my: 0, c: 0.85, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, orig: 0, abre: 72, ancho: 1.3, sonr: -0.1, lengua: 0.4 }),
    jadea: E({ mx: 0.6, my: 0.6, iris: 0.65, sd: 20, gd: -0.1, si: 18, gi: -0.1, orig: 0, abre: 34, ancho: 0.95, sonr: -0.2, lengua: 1 }),
    bebe: E({ mx: 0.85, my: -0.5, c: 0.8, z: 0.7, sd: 10, gd: -0.15, si: 10, gi: -0.15, orig: 0, abre: 12, ancho: 0.62, sonr: -0.2 }),
    jadea2: E({ mx: 0.85, my: 0, iris: 0.7, sd: 18, gd: -0.12, si: 16, gi: -0.12, orig: 0, abre: 36, ancho: 1, sonr: -0.15, lengua: 1 }),
    leche: E({ mx: 0.85, my: -0.4, c: 0.9, h: 0.3, sd: 8, si: 8, orig: 0, abre: 12, ancho: 0.62, sonr: 0 }),
    alivio: E({ mx: 0, my: 0, c: 1, h: 1, sd: 10, gd: 0.1, si: 10, gi: 0.1, orig: 0, abre: 16, ancho: 0.9, sonr: 0.55 }),
    pasma: E({ mx: 0.85, my: 0, iris: 0.8, sd: 18, gd: 0.05, si: 14, orig: 0, abre: 26, ancho: 0.85, sonr: -0.3 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.3, "plato"], [T.chulo0, T.chulo0 + 0.3, "chulo"], [T.aVa, T.aVa + 0.3, "mira"], [T.aTraga - 0.2, T.aTraga + 0.15, "asombra"],
    [T.aEncoge + 0.25, T.aEncoge + 0.5, "mira"], [T.gVa, T.gVa + 0.3, "coge"], [T.gMuestra, T.gMuestra + 0.2, "muestra"],
    [T.gBoca0, T.gBoca0 + 0.12, "abre"], [T.gMete, T.gMete + 0.15, "sobrado"], [T.pausa, T.pausa + 0.2, "congela"],
    [T.rojo0, T.rojo0 + 0.25, "pica"], [T.fuego0 - 0.08, T.fuego0 + 0.05, "fuego"], [T.fuego1, T.fuego1 + 0.15, "jadea"],
    [T.bebe0 - 0.1, T.bebe0 + 0.05, "bebe"], [T.bebe1, T.bebe1 + 0.15, "jadea2"], [T.bebeLeche0 - 0.1, T.bebeLeche0 + 0.05, "leche"],
    [T.bebeLeche1, T.bebeLeche1 + 0.3, "alivio"], [T.gPasma, T.gPasma + 0.15, "pasma"]
  ];
  const CARAS_A = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.3 }),
    plato: E({ mx: 0.6, my: 0.75, c: 0.3 }),
    ceja: E({ mx: 0.85, my: 0, c: 0.25, sd: 0, si: 18, gi: 0.1, orig: 0, sonr: 0.3, ancho: 0.85 }),
    coge: E({ mx: 0.4, my: 0.7, c: 0.3, orig: 0, sonr: 0.15 }),
    come: E({ mx: -0.85, my: -0.1, c: 0.35, orig: 0, abre: 10, ancho: 0.85, sonr: 0.05 }),
    encoge: E({ mx: -0.85, my: -0.1, c: 0.4, sd: 10, si: 10, orig: 0, sonr: 0.1, ancho: 0.9 }),
    mira: E({ mx: 0.85, my: 0.05, c: 0.35, orig: 0, sonr: 0.12 }),
    ceja2: E({ mx: 0.85, my: 0, c: 0.15, si: 16, gi: 0.1, orig: 0, sonr: 0.05 }),
    calor: E({ mx: 0.85, my: 0, c: 0, iris: 0.85, sd: 14, si: 18, gi: 0.05, orig: 0, abre: 6, ancho: 0.7, sonr: 0 }),
    leche: E({ mx: 0.5, my: 0.7, c: 0.3, orig: 0, sonr: 0.1 }),
    camara: E({ mx: -0.85, my: -0.1, c: 0.4, si: 8, orig: 0, sonr: 0.15 }),
    mastica: E({ mx: 0.85, my: 0, c: 0.4, orig: 0, abre: 8, ancho: 0.85, sonr: 0.05 })
  };
  const GUION_CARA_A = [
    [T.mira, T.mira + 0.3, "plato"], [T.reta - 0.05, T.reta + 0.25, "ceja"], [T.aVa, T.aVa + 0.25, "coge"], [T.aBoca - 0.15, T.aBoca + 0.1, "come"],
    [T.aEncoge, T.aEncoge + 0.2, "encoge"], [T.aEncoge + 0.55, T.aEncoge + 0.8, "mira"], [T.rojo0 + 0.2, T.rojo0 + 0.45, "ceja2"],
    [T.fuego0, T.fuego0 + 0.1, "calor"], [T.fuego1 + 0.2, T.fuego1 + 0.5, "mira"], [T.lecheVa, T.lecheVa + 0.25, "leche"],
    [T.lecheLlega, T.lecheLlega + 0.25, "camara"], [T.aSaca0 + 0.1, T.aSaca0 + 0.35, "mira"], [T.aCrunch - 0.1, T.aCrunch + 0.05, "mastica"]
  ];
  // masticar: la boca abre y cierra deprisa
  const mastica = (t, t0, t1, f = 11) => { const k = tramo(t, t0, t0 + 0.12) * (1 - tramo(t, t1 - 0.12, t1)); return k * (0.5 + 0.5 * Math.sin((t - t0) * f)); };

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * JK;
  const desdeMuneca = (w, ang, mu) => { const o = rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: w.x - o.x, y: w.y - o.y }; };
  const CERO = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const dedosTodos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const PINZA = { pulgar: 0.45, indice: 0.5, medio: 0.25, anular: 0.15, menique: 0.15 };
  const AGARRA = dedosTodos(0.35);
  const M = (x, y, mu, ang, puno, dedos, dobla) => ({ x, y, mu, ang, puno, dedos, dobla });
  function mezM(a, b, k) {
    const d = {}; for (const n in a.dedos) d[n] = lerp(a.dedos[n], b.dedos[n], k);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerp(a.mu, b.mu, k), ang: lerp(a.ang, b.ang, k), puno: lerp(a.puno, b.puno, k), dedos: d, dobla: lerp(a.dobla, b.dobla, k) };
  }
  // recorre una lista de [t0, t1, destino] mezclando hacia cada destino (que puede moverse con t)
  function ruta(t, lista, ini) {
    let e = ini;
    for (const [t0, t1, d, f] of lista) { if (t <= t0) break; e = mezM(e, d, (f || suave)(fase(t, t0, t1))); }
    return e;
  }
  // mano que sujeta algo por el punto Q (unidades de mano, girado ang) de modo que Q quede en «obj» (hoja)
  const manoPara = (obj, Q, ang) => { const o = rotP({ x: Q.x * JK, y: Q.y * JK }, ang); return { x: obj.x - o.x, y: obj.y - o.y }; };

  /* ---------- bebida: volumen e inclinación ---------- */
  const volJarra = t => { if (t < T.bebe0) return 0.88; const u = fase(t, T.bebe0, T.bebe1) * 4, i = Math.floor(Math.min(3.999, u)), f = u - i;
    return Math.max(0, 0.88 * (1 - (i + suave(clamp(f / 0.7))) / 4)); };
  const volLeche = t => 0.85 * (1 - suave(fase(t, T.bebeLeche0, T.bebeLeche1)));
  const angJarraBebe = t => inclinacion(J_INT, J_AREA, J_BORDE, Math.max(0.02, volJarra(t)));
  const angVasoBebe = t => inclinacion(V_INT, V_AREA, V_BORDE, Math.max(0.02, volLeche(t)));
  const tragos = t => { if (t < T.bebe0 || t > T.bebe1 + 0.1) return 0; const u = fase(t, T.bebe0, T.bebe1) * 4; return Math.sin(Math.PI * (u % 1)) ** 2; };

  // el vaso de leche: en la mesa, empujado por Ander y deslizándose hasta Guillermo
  function vasoPos(t) {
    if (t < T.lecheToca) return VASO0;
    if (t < T.lecheEmpuja) { const k = suave(fase(t, T.lecheToca + 0.04, T.lecheEmpuja)); return P(lerp(VASO0.x, VASO0.x - 22, k), VASO0.y); }
    const x1 = VASO0.x - 22, d = x1 - VASO_FIN.x, du = T.lecheLlega - T.lecheEmpuja, u = fase(t, T.lecheEmpuja, T.lecheLlega);
    return P(x1 - d * (1 - (1 - u) * (1 - u)), VASO0.y);       // frena hasta pararse justo delante de Guillermo
  }

  /* ---------- Guillermo ---------- */
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const BOLS_G_C = desdeMuneca(P(131, 652), 0, -1.75), BOLS_G_L = desdeMuneca(P(372, 648), 0, -1.75);
  const CG0 = { dx: 0, pel: 0, torso: 0.03, cab: 0, hom: 0 };
  const CG = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    base: CG({}), alcanza: CG({ dx: 8, pel: 14, torso: 0.2, cab: -0.05 }), muestra: CG({ torso: -0.04, cab: -0.07 }),
    mete: CG({ torso: 0.02, cab: -0.1 }), sobrado: CG({ torso: -0.03, cab: -0.08 }), pica: CG({ torso: -0.02, cab: 0.04, hom: 1 }),
    fuego: CG({ dx: 6, pel: 12, torso: 0.13, cab: 0.1, hom: 0.4 }), jarra: CG({ dx: 6, pel: 10, torso: 0.15, cab: -0.02, hom: 0.5 }),
    bebe: CG({ dx: -4, pel: 6, torso: -0.14, cab: -0.32, hom: 0.3 }), jadea: CG({ dx: 4, pel: 16, torso: 0.12, cab: 0.04, hom: 0.2 }),
    coge: CG({ dx: 8, pel: 14, torso: 0.2, cab: 0 }), leche: CG({ dx: -2, pel: 4, torso: -0.1, cab: -0.26 }),
    alivio: CG({ dx: 0, pel: 6, torso: -0.05, cab: -0.06 }), pasma: CG({ dx: -6, pel: 2, torso: -0.08, cab: -0.04, hom: 0.4 })
  };
  const GUION_CUERPO_G = [
    [T.gVa, T.gCoge, "alcanza"], [T.gCoge + 0.05, T.gMuestra + 0.25, "muestra"], [T.gBoca0, T.gBoca, "mete"], [T.gMete + 0.05, T.gMastica + 0.2, "sobrado"],
    [T.rojo0, T.rojo0 + 0.4, "pica"], [T.fuego0 - 0.12, T.fuego0, "fuego"], [T.jarraVa, T.jarraCoge, "jarra"], [T.jarraCoge + 0.05, T.bebe0 + 0.1, "bebe"],
    [T.bebe1, T.jarraDeja, "jadea"], [T.gLecheVa, T.gLecheCoge, "coge"], [T.gLecheCoge + 0.05, T.bebeLeche0 + 0.1, "leche"],
    [T.bebeLeche1, T.bebeLeche1 + 0.4, "alivio"], [T.gPasma, T.gPasma + 0.2, "pasma"]
  ];
  const termometro = t => tramo(t, T.rojo0, T.rojo1, suave) * (1 - tramo(t, T.baja0, T.baja1, suave));

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", t);
    const respira = Math.sin(t * 2.2);
    // temblor de picor y jadeo
    const tiembla = tramo(t, T.rojo0 + 0.3, T.rojo1) * (1 - tramo(t, T.fuego0, T.fuego0 + 0.1)) + 0.6 * tramo(t, T.fuego1, T.jarraVa) * (1 - tramo(t, T.jarraVa, T.jarraCoge));
    const jadeo = tramo(t, T.bebe1, T.bebe1 + 0.15) * (1 - tramo(t, T.gLecheCoge, T.bebeLeche0));
    const sh = ruido(t * 34) * 3 * tiembla;
    const p = {
      x: XG + b.dx + sh * 0.6, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + 6 * Math.abs(Math.sin(t * 11)) * jadeo }, torso: b.torso + 0.012 * ruido(t * 29) * tiembla,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom - 0.015 * Math.abs(Math.sin(t * 11)) * jadeo },
      piernas: {}, cabeza: { ang: b.cab + 0.03 * ruido(t * 31 + 4) * tiembla, dx: 0, dy: -10 * b.hom, esc: { x: 1, y: 1 } }, cara: null
    };
    // tragos: la cabeza sube y baja un poco con cada trago
    p.cabeza.dy += 4 * tragos(t) + 3 * campana(t, T.bebeLeche0, T.bebeLeche0 + 0.25);
    // eructo de humo (suspiro) y respingo al oír el crujido
    p.cabeza.ang += 0.06 * campana(t, T.aCrunch, T.aCrunch + 0.35);
    for (const lado of ["cerca", "lejos"]) {
      const fx = lado === "cerca" ? XG - 19 : XG + 18;
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (fx - p.x) / S, y: TOB_G[lado] }, ang: 0 };
    }
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // masticar sobrado y tragar
    const mas = mastica(t, T.gMete, T.pausa, 12);
    e.abre += 14 * mas; e.ancho -= 0.12 * mas;
    // tic del ojo
    const tic = campana(t, T.tic, T.tic + 0.12) + campana(t, T.tic + 0.2, T.tic + 0.3) + campana(t, T.ticFin, T.ticFin + 0.1) + campana(t, T.ticFin + 0.18, T.ticFin + 0.28);
    e.cd = Math.max(e.cd, 0.7 * tic);
    // guiño al enseñar la guindilla
    e.ci = Math.max(e.ci, campana(t, T.gGuino, T.gGuino + 0.35));
    // jadeo: la boca palpita
    e.abre += 8 * Math.sin(t * 11) * jadeo;
    p.cara = cara(e, parpadeo(t, [1.75, 3.2, 4.25, 6.2, 11.0, 12.95]));
    // estados de la piel (capas propias)
    const kT = termometro(t);
    const est = { term: kT, mof: 0.75 * tramo(t, T.bebe0 - 0.05, T.bebe0 + 0.1) * (1 - tramo(t, T.bebe1 - 0.05, T.bebe1 + 0.1)) * (0.75 + 0.25 * tragos(t)),
      sudor: tramo(t, T.rojo0 + 0.3, T.rojo1) * (1 - tramo(t, T.baja0 + 0.2, T.baja1 + 0.3)),
      lagrimas: tramo(t, T.bebe0 + 0.1, T.bebe0 + 0.4) * (1 - tramo(t, T.lecheLlega, T.bebeLeche0 + 0.2)),
      bigote: tramo(t, T.bebeLeche1 - 0.05, T.bebeLeche1 + 0.15),
      cd: p.cara.ojos.d, ci: p.cara.ojos.i, t };
    p.capaCabeza = (g, tt) => capaCaraG(g, tt, est);
    p.capaTronco = g => capaCuelloG(g, est);
    p.est = est;
    // manos
    const Tr = G.tronco(p), bolsC = Tr(BOLS_G_C), bolsL = Tr(BOLS_G_L);
    const boca = G.cabeza(p).a(P(803, 738));
    const enBolsillo = M(bolsL.x, bolsL.y, -1.75, 0, 0, CERO, -1);
    // guindilla en la mano: lo que queda
    const kCh = t < T.gBoca ? 1 : lerp(1, -1, suave(fase(t, T.gBoca, T.gMete)));
    const angBoca = -2.35;
    const destCh = { x: G.aHoja(p, CH_G0).x, y: G.aHoja(p, CH_G0).y };
    const muestra = P(G.centroCabeza(p).x + 150, G.centroCabeza(p).y + 70);
    const enBoca = manoPara(boca, puntaChile(kCh), angBoca);
    const cadera = Tr(P(380, 640));
    const jarraMesa = G.aHoja(p, JARRA0);
    const aJ = angJarraBebe(t), bocaJ = G.cabeza(p).a(P(790, 738));
    const jarraBoca = manoPara(bocaJ, J_BORDE, aJ);
    const vasoMesa = G.aHoja(p, vasoPos(t));
    const aV = angVasoBebe(t), vasoBoca = manoPara(bocaJ, V_BORDE, aV);
    const L = ruta(t, [
      [T.gVa, T.gCoge, M(destCh.x, destCh.y, -1.4, 0, 1, PINZA, -1)],
      [T.gCoge + 0.04, T.gMuestra + 0.18, M(muestra.x, muestra.y, 3.0, -1.5, 1, PINZA, -1)],
      [T.gBoca0, T.gBoca, M(enBoca.x, enBoca.y, 3.2, angBoca, 1, PINZA, -1)],
      [T.gMete + 0.02, T.gMastica + 0.15, M(cadera.x, cadera.y, -1.1, 0.35, 1, CERO, -1)],
      [T.jarraVa, T.jarraCoge, M(jarraMesa.x, jarraMesa.y, -1.57, 0, 1, AGARRA, -1)],
      [T.jarraCoge + 0.03, T.bebe0, M(jarraBoca.x, jarraBoca.y, 1.2 - aJ, aJ, 1, AGARRA, -1)],
      [T.jarraDeja0, T.jarraDeja, M(jarraMesa.x, jarraMesa.y, -1.57, 0, 1, AGARRA, -1)],
      [T.jarraDeja + 0.05, T.gLecheVa, M(cadera.x + 10, cadera.y - 30, -1.4, 0.2, 1, dedosTodos(0.15), -1)],
      [T.gLecheVa, T.gLecheCoge, M(vasoMesa.x, vasoMesa.y, -1.57, 0, 1, AGARRA, -1)],
      [T.gLecheCoge + 0.03, T.bebeLeche0, M(vasoBoca.x, vasoBoca.y, 1.2 - aV, aV, 1, AGARRA, -1)],
      [T.vasoDeja0, T.vasoDeja, M(vasoMesa.x, vasoMesa.y, -1.57, 0, 1, AGARRA, -1)],
      [T.vasoDeja + 0.05, T.vasoDeja + 0.45, M(cadera.x, cadera.y, -1.1, 0.35, 1, dedosTodos(0.1), -1)]
    ], enBolsillo);
    // mientras bebe, la mano sigue exactamente a la boca (la mezcla de arriba ya ha llegado)
    let Lm = L;
    if (t >= T.bebe0 && t < T.jarraDeja0) Lm = M(jarraBoca.x, jarraBoca.y, 1.2 - aJ, aJ, 1, AGARRA, -1);
    if (t >= T.bebeLeche0 && t < T.vasoDeja0) Lm = M(vasoBoca.x, vasoBoca.y, 1.2 - aV, aV, 1, AGARRA, -1);
    if (t >= T.gBoca && t < T.gMete) Lm = M(enBoca.x, enBoca.y, 3.2, angBoca, 1, PINZA, -1);
    p.manoLejos = { x: Lm.x, y: Lm.y, ang: Lm.ang, mu: Lm.mu, dobla: Lm.dobla, puno: Lm.puno, dedos: Lm.dedos };
    // objeto en la mano lejana
    if (t >= T.gCoge && t < T.gMete) p.manoLejos.objeto = (g, tt) => guindilla(g, kCh, tt);
    else if (t >= T.jarraCoge && t < T.jarraDeja) { const v = volJarra(t), a = Lm.ang; p.manoLejos.objeto = (g, tt) => jarra(g, v, a, tt); }
    else if (t >= T.gLecheCoge && t < T.vasoDeja) { const v = volLeche(t), a = Lm.ang; p.manoLejos.objeto = (g, tt) => vasoLeche(g, v, a, tt); }
    // mano cercana: bolsillo, y se agarra el cuello mientras pica
    const cuello = Tr(P(232, 300));
    const C = ruta(t, [
      [T.cuello0, T.cuello0 + 0.35, M(cuello.x, cuello.y, -2.6, 0.15, 1, { pulgar: 1, indice: 0.95, medio: 0.95, anular: 0.9, menique: 0.85 }, -1)],
      [T.cuello1, T.cuello1 + 0.35, M(bolsC.x, bolsC.y, -1.75, 0, 0, CERO, -1)]
    ], M(bolsC.x, bolsC.y, -1.75, 0, 0, CERO, -1));
    const aprieta = tramo(t, T.cuello0 + 0.3, T.cuello0 + 0.4) * (1 - tramo(t, T.cuello1, T.cuello1 + 0.1));
    p.manoCerca = { x: C.x + 3 * ruido(t * 25) * aprieta, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    return p;
  }

  /* ---------- capas de Guillermo: termómetro rojo, carrillos, lágrimas, sudor y bigote de leche ---------- */
  const PZC = G.A.datos.piezas.cabeza, OJO_D = PZC.ojos.derecho, OJO_I = PZC.ojos.izquierdo;
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const PIEL_CUELLO = [[269,321],[254,318],[252,316],[250,318],[216,304],[212,299],[197,292],[175,270],[178,264],[188,259],[196,251],[196,246],[203,234],[203,229],[209,223],[219,233],[228,237],[243,249],[257,254],[266,266],[283,264],[287,267],[282,286],[291,296],[291,308],[294,310],[281,318],[271,318]];
  const OREJA = P(562, 586), CORONILLA = P(760, 300);
  const ROJO_COL = "#ff2a1a", ROJO_MUL = "rgb(255,128,112)";
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  // nivel del «mercurio»: primero el cuello (hoja) y luego la cara (retrato), de abajo arriba
  const nivelCuello = k => lerp(326, 216, clamp(k / 0.2));
  const nivelCara = k => lerp(866, 412, clamp((k - 0.2) / 0.8));
  function rellenoNivel(g, y, x0, x1, t, amp) {         // zona por debajo de y, con el menisco ondulado
    g.beginPath(); g.moveTo(x0, 2000); g.lineTo(x0, y);
    for (let x = x0; x <= x1; x += 24) g.lineTo(x, y + amp * Math.sin(x * 0.045 + t * 9) + amp * 0.5 * Math.sin(x * 0.11 - t * 13));
    g.lineTo(x1, y); g.lineTo(x1, 2000); g.closePath();
  }
  function tinteRojo(g, a, relleno) {
    g.globalAlpha = a; g.globalCompositeOperation = "multiply"; g.fillStyle = ROJO_MUL; relleno();
    g.globalAlpha = 0.35 * a; g.globalCompositeOperation = "color"; g.fillStyle = ROJO_COL; relleno();
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  }
  const colorPiel = k => `rgb(${[254, 181, 116].map((v, i) => Math.round(lerp(v, [252, 104, 82][i], k))).join(",")})`;
  function carrillos(g, k, rojo) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.globalAlpha = clamp(k / 0.3);
    g.beginPath(); g.moveTo(912, 676); g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792); g.lineTo(840, 760); g.lineTo(890, 690); g.closePath();
    g.fillStyle = colorPiel(rojo); g.fill();
    g.beginPath(); g.moveTo(912, 676); g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke();
    g.globalAlpha = 0.45 * clamp(k); g.fillStyle = "#fff1dc"; g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function lagrimas(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    for (const [x, y, d] of [[748, 590, 0], [915, 640, 0.4]]) {
      const largo = 120 * k;
      g.globalAlpha = 0.85 * clamp(k * 2);
      g.lineWidth = 15; g.strokeStyle = "#1d5f8a"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 8, y + largo * 0.5, x - 4, y + largo); g.stroke();
      g.lineWidth = 10; g.strokeStyle = "#9fdcff"; g.stroke();
      // gotas que caen de la barbilla
      for (let i = 0; i < 2; i++) { const ph = (t * 1.6 + d + i * 0.5) % 1; const yy = y + largo + ph * 70; g.globalAlpha = 0.85 * (1 - ph) * clamp(k * 2);
        g.fillStyle = "#9fdcff"; g.strokeStyle = "#1d5f8a"; g.lineWidth = 3; g.beginPath(); g.ellipse(x - 4, yy, 6, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
    g.restore();
  }
  function sudor(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineWidth = 4; g.strokeStyle = "#1d3b52";
    [[640, 470, 0], [915, 520, 0.37], [700, 430, 0.71], [870, 470, 0.15]].forEach(([x, y, d], i) => {
      const ph = ((t * 0.7 + d) % 1), aparece = clamp(k * 4 - i);
      if (aparece <= 0) return;
      const yy = y + ph * 80, s = 13 * aparece * (1 - 0.3 * ph);
      g.globalAlpha = Math.sin(Math.PI * ph) * aparece;
      g.beginPath(); g.moveTo(x, yy - s * 1.6); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.6);
      g.fillStyle = "#bfe8ff"; g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - s * 0.3, yy - s * 0.1, s * 0.22, s * 0.35, 0, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }
  function bigoteLeche(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.translate(803, 730); g.rotate(0.26);
    const blobs = [[-46, -15, 12], [-29, -20, 14], [-10, -22, 15], [10, -22, 15], [29, -20, 14], [45, -15, 12]];
    const forma = () => { g.beginPath(); for (const [x, y, r] of blobs) { g.moveTo(x + r * k, y); g.arc(x, y, r * k, 0, Math.PI * 2); } };
    forma(); g.lineWidth = 6; g.strokeStyle = "#8d8f99"; g.stroke();
    forma(); g.fillStyle = "#fbfbf6"; g.fill();
    g.fillStyle = "#ffffff"; for (const [x, y, r] of blobs) { g.beginPath(); g.arc(x - r * 0.3 * k, y - r * 0.35 * k, r * 0.28 * k, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function capaCaraG(g, t, e) {
    carrillos(g, e.mof, clamp(e.term));
    if (e.term > 0.004) {
      const y = nivelCara(e.term);
      if (e.term > 0.2) {
        g.save();
        g.beginPath(); camino(g, PIEL_CAB); g.clip();
        rellenoNivel(g, y, 500, 1000, t, 6 * (1 - clamp((e.term - 0.95) / 0.05)) + 1.5); g.clip();
        g.beginPath(); g.rect(380, 100, 900, 900); camino(g, OJO_D); camino(g, OJO_I);
        tinteRojo(g, 1, () => g.fill("evenodd"));
        // brillo del menisco
        if (e.term < 0.985) { rellenoNivel(g, y, 500, 1000, t, 6); g.lineWidth = 5; g.strokeStyle = "rgba(255,225,200,0.6)"; g.stroke(); }
        g.restore();
        // párpados: el tinte entra según lo cerrados que estén
        for (const [ojo, c] of [[OJO_D, e.cd], [OJO_I, e.ci]]) {
          const cc = Math.pow(clamp((c - 0.4) / 0.6), 1.5) * clamp((e.term - 0.35) / 0.4);
          if (cc < 0.004) continue;
          g.save(); g.beginPath(); camino(g, ojo); g.clip(); tinteRojo(g, cc, () => g.fillRect(700, 520, 260, 140)); g.restore();
        }
      }
    }
    lagrimas(g, e.lagrimas, t);
    sudor(g, e.sudor, t);
    bigoteLeche(g, e.bigote, t);
  }
  function capaCuelloG(g, e) {
    if (e.term <= 0.004) return;
    g.save(); g.beginPath(); camino(g, PIEL_CUELLO); g.clip();
    rellenoNivel(g, nivelCuello(e.term), 150, 320, e.t, e.term < 0.2 ? 3 : 0); g.clip();
    tinteRojo(g, 1, () => g.fillRect(150, 200, 170, 140));
    g.restore();
  }

  /* ---------- Ander ---------- */
  const TOB_A = { cerca: AN.SUELO - AN.TOBILLO_ALTO, lejos: AN.SUELO - AN.TOBILLO_ALTO - 10 };
  const CA0 = { pel: 0, torso: 0, cab: 0 };
  const CA = o => Object.assign({}, CA0, o);
  const CUERPOS_A = {
    base: CA({}), alcanza: CA({ pel: 10, torso: 0.13, cab: 0.02 }), come: CA({ pel: 4, torso: 0.02, cab: -0.05 }),
    atras: CA({ pel: -6, torso: -0.22, cab: -0.14 }), leche: CA({ pel: 10, torso: 0.12 }), empuja: CA({ pel: 12, torso: 0.17, cab: 0.03 }),
    saca: CA({ pel: 4, torso: 0.03, cab: -0.03 })
  };
  const GUION_CUERPO_A = [
    [T.aVa, T.aCoge, "alcanza"], [T.aCoge + 0.05, T.aBoca, "come"], [T.aTallo0, T.aTallo, "alcanza"], [T.aTallo + 0.05, T.aTallo + 0.4, "base"],
    [T.fuego0, T.fuego0 + 0.15, "atras"], [T.fuego1 + 0.15, T.fuego1 + 0.6, "base"], [T.lecheVa, T.lecheToca, "leche"], [T.lecheToca, T.lecheEmpuja, "empuja"],
    [T.lecheEmpuja + 0.05, T.lecheEmpuja + 0.5, "base"], [T.aSaca0, T.aSaca, "saca"]
  ];
  function poseA(t) {
    const b = guion(GUION_CUERPO_A, CUERPOS_A, "base", t);
    const respira = Math.sin(t * 1.9 + 1.3);
    const enc = campana(t, T.aEncoge, T.aEncoge + 0.55);
    const p = {
      x: XA, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: AN.PELVIS.x, y: AN.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.03 * enc },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * enc + 0.02 * Math.sin(t * 1.1), dx: 0, dy: -12 * enc, esc: { x: 1, y: 1 } }
    };
    // masticar mueve un poco la cabeza
    const masA = mastica(t, T.aMuerde1, T.aTraga, 10) + mastica(t, T.aCrunch, DUR, 10);
    p.cabeza.dy += 2.5 * masA;
    p.cabeza.dy += 5 * campana(t, T.aTraga, T.aTraga + 0.25);
    for (const lado of ["cerca", "lejos"]) {
      const dx = lado === "cerca" ? -58 : 62;
      p.piernas[lado] = { tob: { x: AN.PELVIS.x + dx, y: TOB_A[lado] }, ang: 0 };
    }
    const e = guion(GUION_CARA_A, CARAS_A, "inicio", t);
    e.abre += 10 * masA; e.ancho -= 0.1 * masA;
    // mordiscos: abre la boca justo antes de cada uno
    for (const tm of [T.aMuerde1, T.aMuerde2, T.aCrunch]) { const k = campana(t, tm - 0.18, tm + 0.05); e.abre += 26 * k; e.orig *= 1 - k; }
    p.cara = cara(e, parpadeo(t, [2.1, 5.0, 7.3, 9.9, 12.2]));
    // manos
    const Tr = AN.tronco(p), bolsL = Tr(AN.BOLSILLO_L), bolsC = Tr(AN.BOLSILLO_C);
    const enBolsillo = M(bolsL.x, bolsL.y, -1.75, 0, 0, CERO, 1);
    const boca = AN.cabeza(p).a(P(847, 676));
    const kCh = t < T.aMuerde1 ? 1 : t < T.aMuerde2 ? lerp(1, 0.55, suave(fase(t, T.aMuerde1 - 0.02, T.aMuerde1 + 0.06))) : lerp(0.55, 0.08, suave(fase(t, T.aMuerde2 - 0.02, T.aMuerde2 + 0.06)));
    const kCh2 = t < T.aCrunch ? 1 : lerp(1, 0.62, suave(fase(t, T.aCrunch - 0.02, T.aCrunch + 0.06)));
    const angBoca = -2.25, DOBLA_A = 1;           // codo abajo al llevarse la guindilla a la boca
    const chileMesa = AN.aHoja(p, CH_A0), talloMesa = AN.aHoja(p, TALLO_A);
    const morder = (k, separa) => { const m = manoPara(boca, puntaChile(k), angBoca); const d = rotP({ x: 1, y: 0 }, angBoca); return P(m.x - d.x * separa, m.y - d.y * separa); };
    // entre mordiscos la guindilla se aparta un poco de la boca
    const aparta = 30 * (campana(t, T.aMuerde1 + 0.05, T.aMuerde2 - 0.04)) + 40 * tramo(t, T.aMuerde2 + 0.05, T.aMuerde2 + 0.2);
    const enBoca = morder(kCh, aparta);
    const encoge = Tr(P(AN.PELVIS.x + 175, AN.PELVIS.y - 150));
    const vaso = AN.aHoja(p, P(vasoPos(Math.min(t, T.lecheEmpuja)).x + 10 * U * 1.5, VASO0.y));
    const finCh = morder(kCh2, 40 * tramo(t, T.aCrunch + 0.05, T.aCrunch + 0.3));
    const L = ruta(t, [
      [T.aVa, T.aCoge, M(chileMesa.x, chileMesa.y, -1.4, 0, 1, PINZA, 1)],
      [T.aCoge + 0.04, T.aBoca, M(enBoca.x, enBoca.y, 3.1, angBoca, 1, PINZA, DOBLA_A)],
      [T.aTallo0, T.aTallo, M(talloMesa.x, talloMesa.y, -1.4, 0, 1, PINZA, 1)],
      [T.aTallo + 0.05, T.aEncoge + 0.15, M(encoge.x, encoge.y, 3.0, -0.25, 1, dedosTodos(1), 1)],
      [T.aEncoge + 0.55, T.aEncoge + 0.9, enBolsillo],
      [T.lecheVa, T.lecheToca, M(vaso.x, vaso.y, -1.6, 0, 1, dedosTodos(0.75), 1)],
      [T.lecheEmpuja + 0.05, T.lecheEmpuja + 0.45, enBolsillo],
      [T.aSaca0, T.aSaca0 + 0.2, M(bolsL.x, bolsL.y, -1.75, 0, 0.6, PINZA, 1)],
      [T.aSaca0 + 0.2, T.aSaca, M(finCh.x, finCh.y, 3.1, angBoca, 1, PINZA, DOBLA_A)]
    ], enBolsillo);
    let Lm = L;
    if (t >= T.aBoca && t < T.aTallo0) Lm = M(enBoca.x, enBoca.y, 3.1, angBoca, 1, PINZA, DOBLA_A);
    if (t >= T.lecheToca && t < T.lecheEmpuja + 0.05) { const v = AN.aHoja(p, P(vasoPos(t).x + 10 * U * 1.5, VASO0.y)); Lm = M(v.x, v.y, -1.6, 0, 1, dedosTodos(0.75), 1); }
    if (t >= T.aSaca) Lm = M(finCh.x, finCh.y, 3.1, angBoca, 1, PINZA, DOBLA_A);
    p.manoLejos = { x: Lm.x, y: Lm.y, ang: Lm.ang, mu: Lm.mu, dobla: Lm.dobla, puno: Lm.puno, dedos: Lm.dedos };
    if (t >= T.aCoge && t < T.aTallo) { const k = kCh; p.manoLejos.objeto = (g, tt) => guindilla(g, k, tt); }
    else if (t >= T.aSaca0 + 0.12) { const k = kCh2, a = clamp((t - T.aSaca0 - 0.12) / 0.15); p.manoLejos.objeto = (g, tt) => { g.save(); g.globalAlpha *= a; guindilla(g, k, tt); g.restore(); }; }
    p.manoCerca = { x: bolsC.x, y: bolsC.y, ang: 0, mu: -1.75, dobla: -1, puno: 0, dedos: CERO };
    return p;
  }

  /* ---------- efectos ---------- */
  function vapor(g, t, pg) {
    const k = tramo(t, T.vapor0, T.vapor0 + 0.2) * (1 - tramo(t, T.bebe1 - 0.3, T.bebe1 + 0.2));
    if (k <= 0.01) return;
    const H = G.cabeza(pg), o = G.aPantalla(pg, H.a(OREJA)), d = rotP({ x: -1, y: -0.35 }, H.ang);
    g.save();
    for (let i = 0; i < 9; i++) {
      const ph = (t * 2.4 + i / 9) % 1, r = 5 + 14 * ph, x = o.x + d.x * (8 + 70 * ph) + 4 * Math.sin(t * 9 + i), y = o.y + d.y * (8 + 70 * ph) - 18 * ph * ph;
      g.globalAlpha = 0.75 * (1 - ph) * k; g.fillStyle = i % 2 ? "#ffffff" : "#e6eef2";
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    // silbido: tres rayitas que vibran junto a la oreja
    g.globalAlpha = k * (0.6 + 0.4 * Math.sin(t * 40)); g.strokeStyle = "#ffffff"; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { const a = Math.atan2(d.y, d.x) + i * 0.5, r0 = 16, r1 = 26 + 3 * Math.sin(t * 30 + i);
      g.beginPath(); g.moveTo(o.x + Math.cos(a) * r0, o.y + Math.sin(a) * r0); g.lineTo(o.x + Math.cos(a) * r1, o.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function humoPelo(g, t, pg) {
    const k = tramo(t, T.humo0, T.humo0 + 0.3) * (1 - tramo(t, T.bebeLeche1, T.bebeLeche1 + 0.5));
    if (k <= 0.01) return;
    const H = G.cabeza(pg), o = G.aPantalla(pg, H.a(CORONILLA));
    g.save();
    for (let i = 0; i < 8; i++) {
      const ph = (t * 0.9 + i / 8) % 1, x = o.x + (i % 3 - 1) * 14 + 10 * Math.sin(t * 2.5 + i * 1.7) * ph, y = o.y - 6 - 70 * ph;
      g.globalAlpha = 0.5 * Math.sin(Math.PI * ph) * k; g.fillStyle = i % 2 ? "#9a9590" : "#c4beb8";
      g.beginPath(); g.arc(x, y, 6 + 13 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function llamarada(g, t, pg) {
    const k = fase(t, T.fuego0, T.fuego1); if (k <= 0 || k >= 1) return;
    const crece = salida(clamp(k / 0.25)) * (1 - entrada(clamp((k - 0.75) / 0.25)));
    const H = G.cabeza(pg), o = G.aPantalla(pg, H.a(P(830, 742))), dir = 0.12 + H.ang * 0.6, largo = 150 * crece;
    g.save(); g.translate(o.x, o.y); g.rotate(dir);
    // halo cálido
    const gr = g.createRadialGradient(largo * 0.5, 0, 5, largo * 0.5, 0, largo * 0.8 + 10);
    gr.addColorStop(0, `rgba(255,200,80,${0.45 * crece})`); gr.addColorStop(1, "rgba(255,120,30,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(largo * 0.5, 0, largo * 0.8 + 10, 0, Math.PI * 2); g.fill();
    const capa = (esc, col, ancho) => {
      g.beginPath(); g.moveTo(0, -5 * esc);
      const n = 9;
      for (let i = 1; i <= n; i++) { const u = i / n, x = largo * esc * u, w = ancho * Math.sin(Math.PI * Math.pow(u, 0.7)) * (1 + 0.25 * ruido(t * 20 + i * 3)); g.lineTo(x, -w); }
      for (let i = n; i >= 1; i--) { const u = i / n, x = largo * esc * u, w = ancho * Math.sin(Math.PI * Math.pow(u, 0.7)) * (1 + 0.25 * ruido(t * 20 + i * 3 + 50)); g.lineTo(x, w); }
      g.lineTo(0, 5 * esc); g.closePath();
    };
    capa(1, "#e8321a", 34 * crece); g.fillStyle = "#e8321a"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#5a0b02"; g.stroke();
    capa(0.82, "#ff8c1a", 22 * crece); g.fillStyle = "#ff8c1a"; g.fill();
    capa(0.6, "#ffe14d", 12 * crece); g.fillStyle = "#ffe14d"; g.fill();
    g.restore();
  }
  function humoBoca(g, t, pg) {
    const tramos = [[T.fuego1 - 0.05, 0.6, 0.5], [T.suspiro0, 0.9, 1]];
    for (const [t0, dur, tam] of tramos) {
      const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) continue;
      const H = G.cabeza(pg), o = G.aPantalla(pg, H.a(P(812, 742)));
      g.save();
      for (let i = 0; i < 5; i++) {
        const u = clamp(k * 1.3 - i * 0.08); if (u <= 0) continue;
        const x = o.x + (24 + 30 * tam) * u + i * 6, y = o.y - (14 + 26 * tam) * u - i * 4, r = (6 + 15 * u) * tam;
        g.globalAlpha = 0.6 * (1 - u); g.fillStyle = i % 2 ? "#d8d4cf" : "#f0ece8";
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }
  }
  function crujido(g, t, pa) {
    const k = fase(t, T.aCrunch - 0.02, T.aCrunch + 0.3); if (k <= 0 || k >= 1) return;
    const o = AN.aPantalla(pa, AN.cabeza(pa).a(P(820, 690)));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.lineCap = "round"; g.globalAlpha = 1 - k;
    for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.95 + i * 0.32, r0 = 22 + 12 * k, r1 = r0 + 12;
      g.beginPath(); g.moveTo(o.x + Math.cos(a) * r0, o.y + Math.sin(a) * r0); g.lineTo(o.x + Math.cos(a) * r1, o.y + Math.sin(a) * r1); g.stroke(); }
    // migas
    g.fillStyle = "#d4161f";
    for (let i = 0; i < 5; i++) { const a = -2.4 + hash(i + 70) * 1.6, d = 10 + 40 * k; g.beginPath(); g.arc(o.x + Math.cos(a) * d, o.y + Math.sin(a) * d + 30 * k * k, 2.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function ticOjo(g, t, pg) {      // rayitas junto al ojo cuando le tiembla
    const k = campana(t, T.tic - 0.02, T.tic + 0.35) + campana(t, T.ticFin - 0.02, T.ticFin + 0.4);
    if (k <= 0.01) return;
    const o = G.aPantalla(pg, G.cabeza(pg).a(P(700, 540)));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2; g.lineCap = "round"; g.globalAlpha = clamp(k);
    for (let i = 0; i < 3; i++) { const a = -2.6 + i * 0.4 + 0.05 * Math.sin(t * 60); g.beginPath(); g.moveTo(o.x + Math.cos(a) * 12, o.y + Math.sin(a) * 12); g.lineTo(o.x + Math.cos(a) * 19, o.y + Math.sin(a) * 19); g.stroke(); }
    g.restore();
  }

  /* ---------- mesa y objetos apoyados ---------- */
  function mesa(g, t) {
    const cx = (TX0 + TX1) / 2;
    g.save(); g.lineJoin = "round";
    // pie de hierro
    g.fillStyle = "#26201e"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.rect(cx - 6, TY + 8, 12, SUELO - TY - 16); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(cx, SUELO - 4, 52, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(cx - 4, TY + 10, 3, SUELO - TY - 22);
    // tablero de madera con canto de azulejo
    g.fillStyle = "#7a4426"; g.beginPath(); g.ellipse(cx, TY, (TX1 - TX0) / 2, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#f3efe4"; g.beginPath(); g.rect(TX0 + 2, TY, TX1 - TX0 - 4, 10); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#2c56a8";
    for (let x = TX0 + 9; x < TX1 - 4; x += 14) { g.beginPath(); g.moveTo(x, TY + 1.5); g.lineTo(x + 4.5, TY + 5); g.lineTo(x, TY + 8.5); g.lineTo(x - 4.5, TY + 5); g.closePath(); g.fill(); }
    g.fillStyle = "#e9a22a"; for (let x = TX0 + 16; x < TX1 - 4; x += 14) { g.beginPath(); g.arc(x, TY + 5, 1.6, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#9a5a33"; g.beginPath(); g.ellipse(cx, TY - 1, (TX1 - TX0) / 2 - 3, 6.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,230,190,0.25)"; g.beginPath(); g.ellipse(cx - 30, TY - 3, 40, 2, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function plato(g) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.fillStyle = "#f7f4ec"; g.beginPath(); g.ellipse(PLATO.x, PLATO.y, 38, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#2c56a8"; g.lineWidth = 1.6; g.beginPath(); g.ellipse(PLATO.x, PLATO.y, 32, 5, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.08)"; g.beginPath(); g.ellipse(PLATO.x, PLATO.y + 1, 22, 3, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function objetoEn(g, q, angPantalla, espejo, dibuja) {
    g.save(); g.translate(q.x, q.y); g.rotate(angPantalla); g.scale(espejo ? -U : U, U); dibuja(); g.restore();
  }
  function cosasMesa(g, t) {
    plato(g);
    // jarra apoyada (antes de cogerla y después de dejarla, vacía)
    if (t < T.jarraCoge) objetoEn(g, JARRA0, 0, false, () => jarra(g, 0.88, 0, t));
    else if (t >= T.jarraDeja) { const bote = campana(t, T.jarraDeja, T.jarraDeja + 0.12) * 3; objetoEn(g, P(JARRA0.x, JARRA0.y - bote), 0, false, () => jarra(g, 0, 0, t)); }
    // guindillas en el plato
    if (t < T.gCoge) objetoEn(g, CH_G0, 0, false, () => guindilla(g, 1, t));
    if (t < T.aCoge) objetoEn(g, CH_A0, 0, true, () => guindilla(g, 1, t));
    if (t >= T.aTallo) objetoEn(g, TALLO_A, 0.25, true, () => guindilla(g, 0.08, t, 0));
    // vaso de leche
    if (t < T.gLecheCoge) objetoEn(g, vasoPos(t), 0, false, () => vasoLeche(g, 0.85, 0, t));
    else if (t >= T.vasoDeja) objetoEn(g, VASO_FIN, 0, false, () => vasoLeche(g, 0, 0, t));
  }

  /* ---------- decorado: cantina al atardecer ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70);
    // pared de barro
    const pared = g.createLinearGradient(0, -70, 0, 440); pared.addColorStop(0, "#9c3f22"); pared.addColorStop(1, "#cf6a3c");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 520);
    for (let i = 0; i < 260; i++) { const x = -60 + hash(i * 3.1) * (W + 120), y = -70 + hash(i * 7.3) * 510, r = 2 + hash(i * 1.7) * 5;
      g.fillStyle = hash(i * 2.9) > 0.5 ? "rgba(255,220,180,0.06)" : "rgba(80,20,5,0.07)"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    // luz cálida de la lámpara sobre la mesa
    const foco = g.createRadialGradient(515, 230, 20, 515, 230, 420); foco.addColorStop(0, "rgba(255,210,140,0.45)"); foco.addColorStop(1, "rgba(255,180,100,0)");
    g.fillStyle = foco; g.fillRect(-60, -70, W + 120, 520);
    // ventana en arco con contraventanas azules y el desierto al atardecer
    const vx = 60, vy = 70, vw = 150, vh = 210;
    g.save(); g.beginPath(); g.moveTo(vx, vy + vh); g.lineTo(vx, vy + 60); g.arc(vx + vw / 2, vy + 60, vw / 2, Math.PI, 0); g.lineTo(vx + vw, vy + vh); g.closePath(); g.clip();
    const cielo = g.createLinearGradient(0, vy, 0, vy + vh); cielo.addColorStop(0, "#3d2a6b"); cielo.addColorStop(0.55, "#ef7a4a"); cielo.addColorStop(1, "#ffcf6b");
    g.fillStyle = cielo; g.fillRect(vx, vy - 20, vw, vh + 20);
    g.fillStyle = "#ffe9a8"; g.beginPath(); g.arc(vx + 95, vy + 165, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6b3326"; g.beginPath(); g.moveTo(vx, vy + 185); g.quadraticCurveTo(vx + 60, vy + 165, vx + vw, vy + 182); g.lineTo(vx + vw, vy + vh); g.lineTo(vx, vy + vh); g.closePath(); g.fill();
    g.fillStyle = "#2f5a2a"; g.strokeStyle = "#173014"; g.lineWidth = 2;   // saguaro
    g.beginPath(); g.roundRect ? g.roundRect(vx + 34, vy + 110, 12, 80, 6) : g.rect(vx + 34, vy + 110, 12, 80); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(vx + 36, vy + 150); g.lineTo(vx + 22, vy + 150); g.lineTo(vx + 22, vy + 128); g.stroke();
    g.beginPath(); g.moveTo(vx + 44, vy + 140); g.lineTo(vx + 58, vy + 140); g.lineTo(vx + 58, vy + 118); g.stroke();
    g.restore();
    g.lineWidth = 9; g.strokeStyle = "#2c6fb0"; g.beginPath(); g.moveTo(vx, vy + vh); g.lineTo(vx, vy + 60); g.arc(vx + vw / 2, vy + 60, vw / 2, Math.PI, 0); g.lineTo(vx + vw, vy + vh); g.closePath(); g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.lineWidth = 5; g.strokeStyle = "#2c6fb0"; g.beginPath(); g.moveTo(vx + vw / 2, vy - 15); g.lineTo(vx + vw / 2, vy + vh); g.moveTo(vx, vy + 110); g.lineTo(vx + vw, vy + 110); g.stroke();
    for (const [x0, sg] of [[vx - 46, 1], [vx + vw + 6, -1]]) {        // contraventanas abiertas
      g.fillStyle = "#2c6fb0"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.rect(x0, vy + 40, 40, vh - 40); g.fill(); g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 2; for (let y = vy + 52; y < vy + vh - 6; y += 12) { g.beginPath(); g.moveTo(x0 + 5, y); g.lineTo(x0 + 35, y); g.stroke(); }
    }
    g.fillStyle = "#e7d2b0"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.rect(vx - 10, vy + vh, vw + 20, 12); g.fill(); g.stroke();
    // ristra de guindillas colgada a la derecha
    for (const [rx, ry0, n] of [[905, 40, 12], [945, 60, 10]]) {
      g.strokeStyle = "#7a5a2a"; g.lineWidth = 3; g.beginPath(); g.moveTo(rx, ry0 - 30); g.lineTo(rx, ry0 + n * 17); g.stroke();
      for (let i = 0; i < n; i++) for (const sg of [-1, 1]) {
        const x = rx + sg * 4, y = ry0 + i * 17 + (sg > 0 ? 8 : 0), a = sg * (0.5 + 0.3 * hash(i * 5 + sg + rx));
        g.save(); g.translate(x, y); g.rotate(Math.PI / 2 - a); g.scale(0.62, 0.62);
        g.fillStyle = hash(i + rx) > 0.3 ? "#b3121b" : "#8f0b12"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.4;
        g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(26, -6, 36, 6); g.quadraticCurveTo(22, 4, 0, 6); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#3f9b33"; g.beginPath(); g.ellipse(0, 0, 4, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
      }
      g.fillStyle = "#d9b25a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath(); g.ellipse(rx, ry0 - 30, 7, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // sombrero colgado de un clavo
    g.save(); g.translate(790, 120); g.rotate(-0.12);
    g.fillStyle = "#e7c26a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.ellipse(0, 18, 70, 18, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-26, 14); g.quadraticCurveTo(-24, -34, 0, -38); g.quadraticCurveTo(24, -34, 26, 14); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#c0392b"; g.lineWidth = 6; g.beginPath(); g.moveTo(-24, 4); g.quadraticCurveTo(0, 10, 24, 4); g.stroke();
    g.strokeStyle = "#2a7a3a"; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 18, 58, 12, 0, 0.2, Math.PI - 0.2); g.stroke();
    g.restore();
    // zócalo de talavera
    const zy = 440;
    g.fillStyle = "#f4efe3"; g.fillRect(-60, zy, W + 120, SUELO - zy);
    for (let x = -60, i = 0; x < W + 60; x += 34, i++) for (let y = zy + 4, j = 0; y < SUELO - 10; y += 34, j++) {
      g.save(); g.translate(x + 17, y + 15);
      g.strokeStyle = "rgba(40,70,140,0.35)"; g.lineWidth = 1; g.strokeRect(-17, -15, 34, 34);
      g.fillStyle = (i + j) % 2 ? "#2c56a8" : "#2f7d6a";
      g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 4 : 10; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
      g.fillStyle = "#e9a22a"; g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill();
      for (const [cx, cy] of [[-17, -15], [17, -15], [-17, 19], [17, 19]]) { g.fillStyle = "#2c56a8"; g.beginPath(); g.arc(cx, cy, 4, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    g.fillStyle = "#7a3a1e"; g.fillRect(-60, zy - 8, W + 120, 10); g.fillStyle = "rgba(255,220,180,0.3)"; g.fillRect(-60, zy - 8, W + 120, 2);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-60, zy + 2, W + 120, 4);
    // suelo de baldosa de barro
    const su = g.createLinearGradient(0, SUELO, 0, H + 70); su.addColorStop(0, "#a8512c"); su.addColorStop(1, "#6e2f17");
    g.fillStyle = su; g.fillRect(-60, SUELO, W + 120, H + 70 - SUELO);
    g.strokeStyle = "rgba(60,20,8,0.45)"; g.lineWidth = 2;
    for (let i = -12; i < 26; i++) { g.beginPath(); g.moveTo(512 + i * 60, SUELO); g.lineTo(512 + i * 95, H + 70); g.stroke(); }
    for (const y of [SUELO + 16, SUELO + 40, SUELO + 72]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    g.fillStyle = "rgba(255,210,150,0.2)"; g.fillRect(-60, SUELO, W + 120, 2);
    // maceta con cactus junto a la ventana
    g.save(); g.translate(230, SUELO);
    g.fillStyle = "#b65a2e"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-26, -46); g.lineTo(26, -46); g.lineTo(20, 0); g.lineTo(-20, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d7783f"; g.fillRect(-28, -54, 56, 10); g.strokeRect(-28, -54, 56, 10);
    g.fillStyle = "#3f8a3a"; for (const [x, y, rx, ry] of [[0, -96, 15, 44], [-24, -84, 10, 22], [22, -90, 10, 26]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.fillStyle = "#ff5f8a"; g.beginPath(); g.arc(0, -140, 6, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    // papel picado: dos guirnaldas de banderitas recortadas
    const colores = ["#ff4f8b", "#ff9d1c", "#2fbf71", "#3aa0ff", "#ffd23a", "#b05cff"];
    for (const [y0, comba, desf] of [[-10, 28, 0], [30, 22, 3]]) {
      g.strokeStyle = "#2a1a10"; g.lineWidth = 1.6; g.beginPath();
      for (let x = -60; x <= W + 60; x += 10) { const yy = y0 + comba * Math.sin(Math.PI * ((x + 60) % 260) / 260); if (x === -60) g.moveTo(x, yy); else g.lineTo(x, yy); } g.stroke();
      for (let x = -40, i = 0; x < W + 40; x += 46, i++) {
        const yy = y0 + comba * Math.sin(Math.PI * ((x + 60) % 260) / 260);
        g.save(); g.translate(x, yy); g.fillStyle = colores[(i + desf) % colores.length]; g.globalAlpha = 0.95;
        g.beginPath(); g.moveTo(-17, 0); g.lineTo(17, 0); g.lineTo(17, 34); for (let k = 0; k < 4; k++) g.lineTo(17 - 8.5 * k - 4.25, 30 + (k % 2) * 4); g.lineTo(-17, 34); g.closePath(); g.fill();
        g.globalAlpha = 1; g.fillStyle = "#b54a26";          // recortes del papel (huecos del color de la pared)
        for (const [hx, hy, hr] of [[0, 12, 4], [-9, 7, 2.2], [9, 7, 2.2], [-8, 22, 2.6], [8, 22, 2.6], [0, 25, 1.8]]) { g.beginPath(); g.moveTo(hx, hy - hr); g.lineTo(hx + hr, hy); g.lineTo(hx, hy + hr); g.lineTo(hx - hr, hy); g.closePath(); g.fill(); }
        g.restore();
      }
    }
    // lámpara colgante sobre la mesa
    g.strokeStyle = "#1a1210"; g.lineWidth = 2; g.beginPath(); g.moveTo(515, -70); g.lineTo(515, 95); g.stroke();
    const halo = g.createRadialGradient(515, 118, 4, 515, 118, 120); halo.addColorStop(0, "rgba(255,226,150,0.55)"); halo.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(515, 118, 120, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c9a25a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(490, 118); g.lineTo(497, 96); g.lineTo(533, 96); g.lineTo(540, 118); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffe7a6"; g.beginPath(); g.ellipse(515, 118, 22, 5, 0, 0, Math.PI * 2); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const acerca = tramo(t, T.rojo0, T.rojo0 + 0.8) * (1 - tramo(t, T.bebe1, T.bebe1 + 0.8));
    return { k: 1 + 0.07 * acerca, x: 512 - 34 * acerca, y: 300 - 18 * acerca };
  }

  function pose(t) { return { g: poseG(t), a: poseA(t) }; }

  class GuillermoAnderGuindilla extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !AN.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pg = poseG(t), pa = poseA(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = 2.5 * campana(t, T.fuego0, T.fuego1) + (t >= T.jarraDeja ? 3 * Math.exp(-(t - T.jarraDeja) * 9) * suave(fase(t, T.jarraDeja, T.jarraDeja + 0.03)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -70);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      g.beginPath(); g.ellipse(pg.x, SUELO + 1, 82, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pa.x, SUELO + 1, 90, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      mesa(g, t);
      cosasMesa(g, t);
      AN.dibujar(g, pa, t);
      G.dibujar(g, pg, t);
      // la mano de Ander empuja el vaso: el vaso se dibuja delante de su mano mientras lo empuja
      llamarada(g, t, pg);
      vapor(g, t, pg);
      humoPelo(g, t, pg);
      humoBoca(g, t, pg);
      crujido(g, t, pa);
      ticOjo(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00032", nombre: "Guillermo y Ander · La guindilla", crear: () => new GuillermoAnderGuindilla() });
  window.__A2D_00032 = { pose, T, DUR };
})();
