"use strict";
/* 00049 · Guillermo y Carla · El helado
 *
 * Negro → terraza del paseo marítimo en pleno verano: cielo azul, sol que aprieta, el mar detrás de la
 * barandilla blanca, suelo de baldosas de barro, un quiosco de helados con toldo de rayas rosas y una
 * sombrilla con su mesita. Los dos con su cucurucho. Carla lame su bola de vainilla tan tranquila;
 * Guillermo le presume su torre de tres bolas (pistacho, chocolate y fresa con guinda) con cejas de
 * chulito y se pone a darle lametones cada vez más exagerados con los ojos cerrados → la torre se
 * bambolea y con el tercer lametón la bola de arriba resbala y cae al suelo: ¡plaf! Él, sin enterarse,
 * todavía lame el aire → abre los ojos, mira el cucurucho, mira el suelo, se inclina para verlo… y al
 * inclinarse se le caen también las otras dos bolas, una encima de otra, sobre la plasta → hundido, con
 * el cucurucho vacío y lagrimones → Carla, con pena, mira su helado, sonríe, se lo cambia de mano, se
 * acerca y se lo ofrece → a él se le iluminan los ojos, lo coge (el cucurucho pasa de una mano a otra
 * justo entre las dos), lo abraza feliz y se inclina para darle las gracias… y la bola se le vuelca
 * encima del zapato → Carla se parte de risa señalándole el zapato; Guillermo se endereza, mira a
 * cámara y lame con pena su cucurucho vacío → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Los cucuruchos se dibujan desde mano.objeto (en
 * coordenadas de pantalla) y las manos se calculan a partir de la postura del cucurucho, así que las
 * manos nunca se separan del barquillo; en el traspaso las dos manos agarran el mismo cucurucho. Las
 * bolas que caen siguen parábolas deterministas desde el punto exacto donde se sueltan y las plastas
 * se quedan en el suelo y en el zapato.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, CA = Carla;
  const S = 0.33, SUELO = 556;
  const KC = S * CA.K;                                    // escala en pantalla de la hoja de Carla
  const U = 2.6 * S * 1.45;                               // px de pantalla por unidad del cucurucho (algo más grande que la mano)
  const GRAV = 1500;
  const DUR = 14.4;
  const TINTA = "#0b0a0e";
  const T = {
    lameC: [0.35, 1.55],                                  // Carla lame su helado tan tranquila
    presume0: 0.55, presume1: 1.5,                        // Guillermo presume de torre
    lameG: [1.6, 2.2, 2.8, 3.45],                         // lametones (el cuarto ya es al aire)
    LAME: 0.6,
    abre: 4.08, miraCono: 4.3, inclina0: 4.6, inclina1: 5.0, endereza: 5.95, llora: 6.05,
    penaC: 5.7, dudaC: 6.05, tiernaC: 6.35, cambia0: 6.45, cambia1: 6.75, anda0: 6.7,
    ofrece0: 7.2, ofrece1: 7.75, notaG: 7.45, ilusion: 7.62, coge0: 7.8, coge1: 8.12, suelta: 8.45,
    abraza1: 8.9, gracias: 9.28, reverencia0: 9.38, reverencia1: 9.78,
    horror: 10.18, resopla: 10.2, rie: 10.42, senala0: 10.72, senala1: 11.7, enjuga0: 12.15, enjuga1: 12.85,
    endereza2: 11.15, camara: 11.55, lameT: [12.1, 12.72],
    fin: 13.45
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  function pista(claves, t) {
    if (t <= claves[0][0]) return Object.assign({}, claves[0][1]);
    for (let i = 0; i < claves.length - 1; i++) {
      const [t0, a] = claves[i], [t1, b] = claves[i + 1];
      if (t <= t1) { const k = suave(fase(t, t0, t1)), o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; }
    }
    return Object.assign({}, claves[claves.length - 1][1]);
  }
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), SENALA = D(0.15, 1, 0, 0, 0),
    AGARRA = D(0.4, 0.42, 0.4, 0.38, 0.36), FROTA = D(0.7, 0.85, 0.8, 0.75, 0.7), TAPA = D(0.8, 0.95, 0.95, 0.9, 0.85);
  const rotV = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }; };

  // puntos del tronco dados en px de pantalla desde la pelvis (x positiva = hacia delante de cada uno)
  const enTronco = (P, p, d) => {
    const o = P.aPantalla(p, p.pelvis), a = p.espejo ? -p.torso : p.torso, sg = p.espejo ? -1 : 1;
    const v = rotV({ x: d.x * sg, y: d.y }, a); return { x: o.x + v.x, y: o.y + v.y };
  };
  const hombro = (P, p, lado) => P.aPantalla(p, P.tronco(p)(lado === "cerca" ? P.HOMBRO_C : P.HOMBRO));
  // mano desde pantalla: posición del puño y dirección de la muñeca (ángulo de pantalla)
  function manoP(P, p, q, muS, dobla, dedos, objeto) {
    const h = P.aHoja(p, q);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - muS : muS, dobla, puno: 1, dedos, objeto };
  }
  const haciaHombro = (q, h, sesgo) => Math.atan2(h.y - q.y, h.x - q.x) + sesgo;

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * HELADOS: cucuruchos y bolas (unidades del cucurucho; origen en el centro del borde)
   * ===================================================================================== */
  const SABOR = {
    pistacho: { c: "#b5dc79", s: "#86b24e", l: "#e4f6bf" },
    chocolate: { c: "#8a5232", s: "#5e3420", l: "#c08a64" },
    fresa: { c: "#f490b0", s: "#d4648a", l: "#ffd0e0" },
    vainilla: { c: "#fff3d2", s: "#ead6a6", l: "#ffffff" }
  };
  const R_A = 14, R_B = 15;
  const BOLAS_A = ["pistacho", "chocolate", "fresa"];
  const yBola = (k, R) => -R * 0.62 - k * R * 1.32;          // centro de la bola k sobre el borde
  const AGARRE = { A: 24, Bc: 20, Bl: 34, Bg: 20 };          // distancia del borde al puño (unidades)
  const FIDEOS = [[-7, -8, 0.6, "#ff5c8a"], [3, -11, -0.4, "#4cc3ff"], [9, -4, 1.1, "#ffd23f"], [-2, -2, 0.2, "#7ee081"],
    [-10, -1, -0.9, "#b07cff"], [6, -13, 0.9, "#7ee081"], [-5, -13, -0.2, "#ffd23f"], [11, -9, 0.3, "#ff5c8a"]];

  function cereza(g, x, y, r) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#4a7a2a"; g.lineWidth = r * 0.28; g.beginPath(); g.moveTo(x, y - r * 0.6); g.quadraticCurveTo(x + r * 0.2, y - r * 1.7, x + r * 1.1, y - r * 2.1); g.stroke();
    g.fillStyle = "#d61f2e"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#9c1220"; g.beginPath(); g.arc(x + r * 0.25, y + r * 0.25, r * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#d61f2e"; g.beginPath(); g.arc(x - r * 0.1, y - r * 0.1, r * 0.72, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffd6dc"; g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.38, r * 0.25, r * 0.16, -0.7, 0, Math.PI * 2); g.fill();
    g.lineWidth = r * 0.22; g.strokeStyle = TINTA; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // una bola (centro x,y; radio R) con su faldita ondulada abajo
  function bola(g, x, y, R, sab, rot, op) {
    const s = SABOR[sab];
    g.save(); g.translate(x, y); g.rotate(rot); g.lineJoin = "round";
    const a0 = 0.29, xa = Math.cos(a0) * R, ya = Math.sin(a0) * R;
    const camino = () => {
      g.beginPath(); g.moveTo(xa, ya); g.arc(0, 0, R, a0, Math.PI - a0, true);
      const n = 5; for (let i = 0; i < n; i++) { const x0 = -xa + 2 * xa * i / n, x1 = -xa + 2 * xa * (i + 1) / n; g.quadraticCurveTo((x0 + x1) / 2, R * 0.66, x1, ya); }
      g.closePath();
    };
    camino(); g.fillStyle = s.s; g.fill();
    g.save(); camino(); g.clip();
    g.fillStyle = s.c; g.beginPath(); g.arc(-R * 0.16, -R * 0.14, R * 0.9, 0, Math.PI * 2); g.fill();
    g.fillStyle = s.l; g.beginPath(); g.ellipse(-R * 0.4, -R * 0.45, R * 0.32, R * 0.18, -0.65, 0, Math.PI * 2); g.fill();
    if (op && op.fideos) for (const [fx, fy, fa, fc] of FIDEOS) {
      g.save(); g.translate(fx * R / 16.5, fy * R / 16.5); g.rotate(fa); g.fillStyle = fc; g.beginPath(); g.ellipse(0, 0, 2.6, 1, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.restore();
    camino(); g.lineWidth = 2.3; g.strokeStyle = TINTA; g.stroke();
    if (op && op.cereza) cereza(g, R * 0.08, -R * 1.05, R * 0.3);
    g.restore();
  }
  function barquillo(g) {
    g.lineJoin = "round"; g.lineCap = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(-14, 1); g.lineTo(14, 1); g.lineTo(1.7, 43.4); g.quadraticCurveTo(0, 46.6, -1.7, 43.4); g.closePath(); };
    cuerpo(); g.fillStyle = "#e0a85a"; g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "rgba(150,82,26,0.32)"; g.beginPath(); g.moveTo(5, 0); g.lineTo(18, 0); g.lineTo(1, 47); g.closePath(); g.fill();
    g.strokeStyle = "#b9793a"; g.lineWidth = 1.3; g.beginPath();
    for (let i = -6; i <= 6; i++) { g.moveTo(-18 + i * 7, 0); g.lineTo(-18 + i * 7 + 26, 48); g.moveTo(18 + i * 7, 0); g.lineTo(18 + i * 7 - 26, 48); }
    g.stroke(); g.restore();
    cuerpo(); g.lineWidth = 2.3; g.strokeStyle = TINTA; g.stroke();
    // borde
    g.beginPath(); g.moveTo(-15.5, -3); g.lineTo(15.5, -3); g.quadraticCurveTo(17, 0.5, 15, 4); g.lineTo(-15, 4); g.quadraticCurveTo(-17, 0.5, -15.5, -3); g.closePath();
    g.fillStyle = "#d18e45"; g.fill(); g.lineWidth = 2.1; g.stroke();
    g.strokeStyle = "rgba(255,226,170,0.7)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-12, -1.2); g.lineTo(10, -1.2); g.stroke();
  }
  // cucurucho completo en pantalla: c = {x, y, ang} (centro del borde), bolas = [{x, y, R, sab, rot, op}] en unidades
  function cucurucho(g, c, bolas) {
    g.save(); g.translate(c.x, c.y); g.rotate(c.ang); g.scale(U, U);
    barquillo(g);
    for (const b of bolas) bola(g, b.x, b.y, b.R, b.sab, b.rot, b.op);
    g.restore();
  }
  const enCono = (c, q) => { const v = rotV({ x: q.x * U, y: q.y * U }, c.ang); return { x: c.x + v.x, y: c.y + v.y }; };
  const borde = (centro, k, R, ang) => { const v = rotV({ x: 0, y: yBola(k, R) * U }, ang); return { x: centro.x - v.x, y: centro.y - v.y, ang }; };
  // borde del cucurucho a partir del puño que lo agarra a gy unidades del borde
  const desdeAgarre = (q, a, gy) => ({ x: q.x + Math.sin(a) * gy * U, y: q.y - Math.cos(a) * gy * U, ang: a });

  /* ---------- las bolas que se caen ---------- */
  const ZAPATO = { x: 393, y: 538 };                       // punta del zapato lejano de Guillermo (pantalla)
  const CAIDAS = [
    { id: "fresa", cono: "A", k: 2, lado: 1, t0: 3.16, td: 3.45, tl: 4.02, tx: 453, ty: 575, cereza: true, giro: 2.2 },
    { id: "choco", cono: "A", k: 1, lado: 1, t0: 4.82, td: 5.05, tl: 5.5, tx: 448, ty: 564, giro: 1.8 },
    { id: "pista", cono: "A", k: 0, lado: 1, t0: 5.12, td: 5.35, tl: 5.77, tx: 456, ty: 554, giro: 2.4 },
    { id: "vaini", cono: "B", k: 0, lado: -1, t0: 9.48, td: 9.76, tl: 10.13, tx: ZAPATO.x, ty: ZAPATO.y, cereza: true, fideos: true, zapato: true, giro: -1.6 }
  ];
  const R_DE = c => (c.cono === "A" ? R_A : R_B);
  const SAB_DE = c => (c.cono === "A" ? BOLAS_A[c.k] : "vainilla");
  // desplazamiento de una bola que resbala (unidades, en el marco del cucurucho)
  function resbalon(cd, t) {
    const s = fase(t, cd.t0, cd.td), R = R_DE(cd);
    return { dx: cd.lado * 1.9 * R * s * s * (1.5 - 0.5 * s), dy: 0.9 * R * s * s * s, rot: cd.lado * 1.5 * s * s };
  }
  // bamboleo de la torre (se acumula con los lametones y con el meneo de presumir)
  function bamboleo(t) {
    let w = 0;
    const amp = [0.35, 0.55, 0.85, 0.3];
    T.lameG.forEach((t0, i) => { const e = t - (t0 + 0.45); if (e > 0) w += amp[i] * Math.exp(-e * 3.6) * Math.sin(e * 13); });
    w += 0.45 * dentro(t, T.presume0 + 0.35, T.presume0 + 0.5, T.presume1 - 0.25, T.presume1) * Math.sin((t - T.presume0) * 15);
    const e = t - T.presume1; if (e > 0) w += 0.4 * Math.exp(-e * 3.6) * Math.sin(e * 13);
    return w;
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha; no se mueve de sitio)
   * ===================================================================================== */
  const XG = 340;
  const PIES_G = { cerca: G.PELVIS.x - 70, lejos: G.PELVIS.x + 66 };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const BOCA_G = { x: 806, y: 738 };                     // centro de la boca abierta (retrato)

  const CARAS_G = {
    feliz: E({ mx: 0.85, my: 0.1, c: 0.28, h: 0.6, sd: 6, si: 6, sonr: 0.55, ancho: 0.9 }),
    presume: E({ mx: 0.9, my: -0.05, c: 0.32, sd: 20, gd: 0.1, si: 2, gi: -0.06, abre: 2, ancho: 1.05, sonr: 0.85 }),
    goza: E({ mx: 0.85, c: 0.9, h: 1, sd: 10, gd: 0.04, si: 10, gi: 0.04, abre: 4, ancho: 0.9, sonr: 0.7 }),
    lame: E({ mx: 0.85, c: 0.92, h: 1, sd: 10, gd: 0.04, si: 10, gi: 0.04, abre: 14, ancho: 0.55, sonr: 0.25, dientes: 0 }),
    sorpresa: E({ mx: 0.85, my: 0.2, iris: 0.72, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 12, ancho: 0.55, sonr: -0.2, dientes: 0 }),
    miraCono: E({ mx: 0.35, my: 0.75, iris: 0.8, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 8, ancho: 0.5, sonr: -0.3 }),
    miraSuelo: E({ mx: 0.75, my: 0.95, iris: 0.85, sd: 24, gd: 0.18, si: 24, gi: 0.18, abre: 12, ancho: 0.6, sonr: -0.5 }),
    hundido: E({ mx: 0.35, my: 0.65, c: 0.35, sd: 18, gd: 0.3, si: 18, gi: 0.3, abre: 7, ancho: 0.75, sonr: -0.95, dientes: 0 }),
    ilusion: E({ mx: 0.88, my: 0.05, iris: 1.22, sd: 24, gd: 0.1, si: 24, gi: 0.1, abre: 16, ancho: 1, sonr: 0.95 }),
    abraza: E({ mx: 0.6, my: 0.6, c: 0.9, h: 1, sd: 12, gd: 0.1, si: 12, gi: 0.1, abre: 0, ancho: 1, sonr: 0.95 }),
    gracias: E({ mx: 0.88, my: -0.05, c: 0.6, h: 1, sd: 16, gd: 0.08, si: 16, gi: 0.08, abre: 16, ancho: 1.05, sonr: 1 }),
    horror: E({ mx: 0.45, my: 0.95, iris: 0.6, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 22, ancho: 0.55, sonr: -0.45, dientes: 0 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.45, sd: 3, gd: 0, si: 3, gi: 0, abre: 0, ancho: 0.7, sonr: -0.25 }),
    lameTriste: E({ mx: 0.55, my: 0.4, c: 0.55, sd: 12, gd: 0.25, si: 12, gi: 0.25, abre: 12, ancho: 0.55, sonr: -0.3, dientes: 0 })
  };
  const L0 = T.lameG;
  const GUION_CARA_G = [
    [0.3, 0.6, "feliz"], [T.presume0 + 0.1, T.presume0 + 0.35, "presume"],
    [L0[0] - 0.05, L0[0] + 0.12, "lame"], [L0[0] + 0.46, L0[0] + 0.58, "goza"],
    [L0[1] - 0.02, L0[1] + 0.12, "lame"], [L0[1] + 0.46, L0[1] + 0.58, "goza"],
    [L0[2] - 0.02, L0[2] + 0.12, "lame"], [L0[2] + 0.46, L0[2] + 0.58, "goza"],
    [L0[3] - 0.02, L0[3] + 0.12, "lame"], [L0[3] + 0.46, L0[3] + 0.58, "goza"],
    [T.abre, T.abre + 0.08, "sorpresa"], [T.miraCono, T.miraCono + 0.12, "miraCono"], [T.inclina0, T.inclina0 + 0.2, "miraSuelo"],
    [T.endereza - 0.1, T.endereza + 0.3, "hundido"], [T.ilusion, T.ilusion + 0.15, "ilusion"], [T.coge1 + 0.1, T.abraza1 - 0.2, "abraza"],
    [T.gracias, T.gracias + 0.15, "gracias"], [T.horror, T.horror + 0.08, "horror"], [T.camara, T.camara + 0.3, "camara"],
    [T.lameT[0] - 0.05, T.lameT[0] + 0.15, "lameTriste"]
  ];
  // cuerpo: pel (hoja, + abajo), torso (+ hacia delante), cab
  const CUERPOS_G = {
    base: { pel: 0, torso: 0, cab: 0 },
    presume: { pel: -6, torso: -0.08, cab: -0.12 },
    lame: { pel: 2, torso: 0.03, cab: 0.06 },
    sorpresa: { pel: -4, torso: -0.05, cab: -0.04 },
    miraCono: { pel: 4, torso: 0.02, cab: 0.16 },
    inclina: { pel: 8, torso: 0.22, cab: 0.3 },
    hundido: { pel: 10, torso: 0.07, cab: 0.14 },
    ilusion: { pel: -4, torso: -0.03, cab: -0.04 },
    abraza: { pel: 4, torso: 0.03, cab: 0.12 },
    reverencia: { pel: 8, torso: 0.3, cab: 0.16 },
    zapato: { pel: 8, torso: 0.28, cab: 0.32 },
    recto: { pel: 6, torso: 0.02, cab: 0.02 },
    lameTriste: { pel: 6, torso: 0.05, cab: 0.12 }
  };
  const GUION_CUERPO_G = [
    [T.presume0, T.presume0 + 0.35, "presume"], [T.presume1 - 0.1, L0[0] + 0.1, "lame"], [T.abre, T.abre + 0.12, "sorpresa", salida],
    [T.miraCono, T.miraCono + 0.2, "miraCono"], [T.inclina0, T.inclina1, "inclina"], [T.endereza, T.endereza + 0.45, "hundido"],
    [T.ilusion, T.ilusion + 0.2, "ilusion"], [T.coge1, T.abraza1, "abraza"], [T.reverencia0, T.reverencia1, "reverencia"],
    [T.horror, T.horror + 0.3, "zapato"], [T.endereza2, T.camara, "recto"], [T.lameT[0] - 0.3, T.lameT[0] + 0.1, "lameTriste"]
  ];

  function cuerpoG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", t);
    const respira = Math.sin(t * 2.3);
    // cabeceo con cada lametón y sollozos cuando llora
    let cab = b.cab;
    for (const t0 of T.lameG) cab -= 0.06 * campana(t, t0 + 0.12, t0 + 0.5);
    for (const t0 of T.lameT) cab -= 0.04 * campana(t, t0 + 0.12, t0 + 0.5);
    const solloza = dentro(t, T.llora, T.llora + 0.2, T.notaG, T.notaG + 0.15);
    const hipo = Math.max(0, Math.sin(t * 9)) ** 3 * solloza;
    const congela = dentro(t, T.horror, T.horror + 0.05, T.endereza2, T.endereza2 + 0.2);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 * (1 - congela) - 6 * hipo },
      torso: b.torso + 0.015 * hipo, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: cab + 0.03 * hipo, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const ld of ["cerca", "lejos"]) p.piernas[ld] = { tob: { x: PIES_G[ld], y: TOB_G[ld] }, ang: 0 };
    const ex = guion(GUION_CARA_G, CARAS_G, "feliz", t);
    // cejas de chulito que suben y bajan al presumir; labio que tiembla al llorar
    const ceja = dentro(t, T.presume0 + 0.4, T.presume0 + 0.5, T.presume1 - 0.15, T.presume1);
    ex.sd += 9 * Math.max(0, Math.sin((t - T.presume0) * 16)) * ceja;
    ex.sonr += 0.12 * Math.sin(t * 31) * solloza; ex.abre += 3 * Math.max(0, Math.sin(t * 9)) * solloza;
    p.cara = cara(ex, parpadeo(t, [0.25, 1.35, 5.55, 7.15, 9.05, 11.0, 11.95, 13.3]));
    p.rojo = 0.25 * dentro(t, T.horror + 0.2, T.horror + 0.6, 12.6, 13.4);
    p.sudor = 0.75 * dentro(t, T.horror + 0.15, T.horror + 0.4, T.camara + 0.6, T.camara + 1.2);
    p.lagrimas = dentro(t, T.llora, T.llora + 0.35, T.notaG, T.ilusion + 0.1);
    p.capaCabeza = (g, tt) => lagrimasG(g, p.lagrimas, tt);
    return p;
  }

  /* =====================================================================================
   * CARLA (a la derecha, en espejo: mira a la izquierda, hacia Guillermo)
   * ===================================================================================== */
  const XC0 = 680, XCm = 618, XC1 = 556, XC2 = 622;
  const TOB_C = CA.SUELO - CA.TOBILLO_ALTO;
  const PIES_C = { cerca: 186, lejos: 316 };
  const A0 = T.anda0;
  const PASOS_C = {
    lejos: [[-10, -9, XC0], [A0, A0 + 0.3, XCm], [A0 + 0.5, A0 + 0.8, XC1], [T.suelta + 0.3, T.suelta + 0.6, XC2]],
    cerca: [[-10, -9, XC0], [A0 + 0.2, A0 + 0.5, XCm], [A0 + 0.7, A0 + 1.0, XC1], [T.suelta + 0.12, T.suelta + 0.42, XC2]]
  };
  function pie(lista, t, alto) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alto * Math.sin(Math.PI * u), u };
  }
  const BOCA_C = { x: 868, y: 610 };

  const CARAS_C = {
    feliz: E({ mx: 0.6, my: 0.1, c: 0.25, h: 0.5, sd: 6, si: 6, sonr: 0.6, ancho: 0.85 }),
    lame: E({ mx: 0.7, my: 0.4, c: 0.85, h: 1, sd: 8, si: 8, abre: 10, ancho: 0.55, sonr: 0.3, dientes: 0 }),
    recelo: E({ mx: 0.6, my: -0.85, c: 0.3, sd: 16, gd: -0.04, si: 4, gi: -0.1, abre: 0, ancho: 0.7, sonr: 0.3 }),
    alarma: E({ mx: 0.9, my: 0.1, iris: 0.75, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 8, ancho: 0.55, sonr: -0.2 }),
    jadeo: E({ mx: 0.8, my: 0.9, iris: 0.7, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 18, ancho: 0.5, sonr: -0.3 }),
    pena: E({ mx: 0.85, my: 0.1, c: 0.25, sd: 16, gd: 0.28, si: 16, gi: 0.28, abre: 2, ancho: 0.6, sonr: -0.35 }),
    duda: E({ mx: 0.3, my: 0.75, c: 0.2, sd: 10, gd: 0.1, si: 10, gi: 0.1, abre: 0, ancho: 0.45, sonr: 0 }),
    tierna: E({ mx: 0.85, my: 0.05, c: 0.35, h: 0.8, sd: 10, si: 10, sonr: 0.8, ancho: 0.9 }),
    ofrece: E({ mx: 0.85, my: 0.05, c: 0.3, h: 0.7, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 6, ancho: 0.95, sonr: 0.9 }),
    contenta: E({ mx: 0.85, my: 0.05, c: 0.35, h: 0.9, sd: 12, si: 12, abre: 4, ancho: 0.95, sonr: 0.85 }),
    resopla: E({ mx: 0.75, my: 0.85, c: 0.45, h: 0.6, sd: 20, si: 20, abre: 0, ancho: 0.4, sonr: 0.45, mof: 1 }),
    carcajada: E({ mx: 0.4, my: -0.4, c: 1, h: 1, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 30, ancho: 1.15, sonr: 1, lengua: 0.6 }),
    risa: E({ mx: 0.75, my: 0.85, c: 0.85, h: 1, sd: 18, si: 18, abre: 24, ancho: 1.1, sonr: 1, lengua: 0.4 }),
    risita: E({ mx: 0.85, my: 0.15, c: 0.8, h: 1, sd: 14, si: 14, abre: 10, ancho: 1, sonr: 0.95 })
  };
  const LC = T.lameC;
  const GUION_CARA_C = [
    [LC[0] - 0.05, LC[0] + 0.12, "lame"], [LC[0] + 0.46, LC[0] + 0.6, "feliz"], [0.98, 1.12, "recelo"], [1.4, 1.5, "feliz"],
    [LC[1] - 0.05, LC[1] + 0.12, "lame"], [LC[1] + 0.46, LC[1] + 0.6, "feliz"],
    [3.2, 3.32, "alarma"], [3.97, 4.06, "jadeo"], [T.penaC, T.penaC + 0.25, "pena"], [T.dudaC, T.dudaC + 0.15, "duda"],
    [T.tiernaC, T.tiernaC + 0.2, "tierna"], [T.ofrece0, T.ofrece0 + 0.25, "ofrece"], [T.suelta, T.suelta + 0.3, "contenta"],
    [T.gracias + 0.1, T.gracias + 0.3, "tierna"], [T.resopla, T.resopla + 0.08, "resopla"], [T.rie, T.rie + 0.1, "carcajada", salida],
    [T.senala0, T.senala0 + 0.2, "risa"], [T.senala1 + 0.1, T.senala1 + 0.4, "carcajada"], [T.enjuga0, T.enjuga0 + 0.25, "risita"]
  ];
  const CUERPOS_C = {
    base: { pel: 0, torso: 0.02, cab: 0 },
    lame: { pel: 4, torso: 0.07, cab: 0.12 },
    recelo: { pel: 0, torso: -0.04, cab: -0.1 },
    alarma: { pel: 0, torso: -0.06, cab: -0.04 },
    jadeo: { pel: -4, torso: -0.1, cab: -0.06 },
    pena: { pel: 4, torso: 0.04, cab: 0.14 },
    duda: { pel: 4, torso: 0.05, cab: 0.16 },
    ofrece: { pel: 6, torso: 0.12, cab: 0.1 },
    contenta: { pel: 2, torso: 0.02, cab: 0.06 },
    resopla: { pel: 2, torso: 0.05, cab: 0.06 },
    carcajada: { pel: 2, torso: -0.16, cab: -0.22 },
    risa: { pel: 10, torso: 0.16, cab: 0.1 },
    risita: { pel: 4, torso: 0.04, cab: 0.06 }
  };
  const GUION_CUERPO_C = [
    [LC[0] - 0.05, LC[0] + 0.15, "lame"], [LC[0] + 0.45, LC[0] + 0.6, "base"], [0.98, 1.15, "recelo"], [1.38, 1.5, "base"],
    [LC[1] - 0.05, LC[1] + 0.15, "lame"], [LC[1] + 0.45, LC[1] + 0.6, "base"],
    [3.2, 3.35, "alarma"], [3.97, 4.09, "jadeo", salida], [T.penaC, T.penaC + 0.3, "pena"], [T.dudaC, T.dudaC + 0.2, "duda"],
    [T.tiernaC, T.tiernaC + 0.2, "base"], [T.ofrece0, T.ofrece1, "ofrece"], [T.suelta, T.suelta + 0.4, "contenta"],
    [T.resopla, T.resopla + 0.1, "resopla"], [T.rie, T.rie + 0.14, "carcajada", salida], [T.senala0, T.senala0 + 0.25, "risa"],
    [T.senala1 + 0.1, T.senala1 + 0.4, "carcajada"], [T.enjuga0, T.enjuga0 + 0.3, "risita"]
  ];

  function cuerpoC(t) {
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "base", t);
    const fc = pie(PASOS_C.cerca, t, 22), fl = pie(PASOS_C.lejos, t, 22);
    const X = (fc.x + fl.x) / 2;
    const respira = Math.sin(t * 2.1 + 1);
    const risa = dentro(t, T.rie, T.rie + 0.1, 12.9, 13.3), sacude = Math.abs(Math.sin(t * 19)) * risa;
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: CA.PELVIS.x, y: CA.PELVIS.y + b.pel + respira * 1.2 - 7 * sacude },
      torso: b.torso + 0.03 * Math.sin(t * 19) * risa, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * Math.sin(t * 19 + 1) * risa, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const dxs = f.x - X;
      p.piernas[ld] = { tob: { x: PIES_C[ld] - dxs / KC, y: TOB_C - (ld === "lejos" ? 6 : 0) - f.alza / KC }, ang: -0.18 * Math.sin(Math.PI * f.u) };
    }
    p.pelo = { inercia: 0.06 * Math.sin(t * 1.6) + 0.18 * (fl.u > 0 && fl.u < 1 ? Math.sin(Math.PI * fl.u) : 0) + 0.1 * Math.sin(t * 19) * risa,
      viento: 0.12 + 0.06 * Math.sin(t * 0.9) };
    const ex = guion(GUION_CARA_C, CARAS_C, "feliz", t);
    p.cara = cara(ex, parpadeo(t, [0.95, 2.6, 5.2, 6.9, 8.3, 9.9, 12.0]));
    p.cara.rubor = 0.3 * dentro(t, T.tiernaC, T.tiernaC + 0.3, T.resopla, T.resopla + 0.3) + 0.45 * dentro(t, T.rie, T.rie + 0.3, 13.6, 14);
    p.risaLagrima = dentro(t, T.senala0, T.senala0 + 0.3, T.enjuga0 + 0.3, T.enjuga0 + 0.5);
    p.capaCabeza = (g, tt) => lagrimitasC(g, p.risaLagrima, tt);
    return p;
  }
  // mirada que sigue a un punto de pantalla (Carla en espejo)
  function miraA(P, p, ojo, q, k) {
    if (k <= 0 || !q) return;
    const c = P.aPantalla(p, P.cabeza(p).a(ojo)), sg = p.espejo ? -1 : 1;
    p.cara.mirada.x = lerp(p.cara.mirada.x, clamp(sg * (q.x - c.x) / 80, -1, 1), k);
    p.cara.mirada.y = lerp(p.cara.mirada.y, clamp((q.y - c.y) / 70, -1, 1), k);
  }

  /* =====================================================================================
   * POSTURAS DE LOS CUCURUCHOS (pantalla) y LAMETONES
   * ===================================================================================== */
  const bocaG = p => G.aPantalla(p, G.cabeza(p).a(BOCA_G));
  const bocaC = p => CA.aPantalla(p, CA.cabeza(p).a(BOCA_C));
  // cucurucho A (mano cercana de Guillermo): claves del PUÑO en el marco del tronco (px desde la pelvis) + ángulo de pantalla
  const CLAVES_A = [
    [0, { x: 14, y: -62, a: 0.3 }], [T.presume0, { x: 14, y: -62, a: 0.3 }], [T.presume0 + 0.35, { x: 40, y: -108, a: 0.32 }],
    [T.presume1 - 0.2, { x: 40, y: -108, a: 0.32 }], [T.presume1 + 0.1, { x: 14, y: -64, a: 0.3 }], [3.95, { x: 14, y: -64, a: 0.3 }],
    [T.miraCono + 0.15, { x: 16, y: -72, a: 0.12 }], [T.inclina0, { x: 16, y: -68, a: 0.2 }], [T.inclina1, { x: 18, y: -62, a: 0.9 }],
    [5.45, { x: 18, y: -62, a: 0.95 }], [T.endereza + 0.3, { x: 16, y: -72, a: -0.05 }], [T.notaG, { x: 16, y: -72, a: -0.05 }],
    [T.coge0 + 0.1, { x: -46, y: -28, a: 0.04 }], [11.7, { x: -46, y: -28, a: 0.04 }], [12.0, { x: 20, y: -70, a: -0.2 }],
    [13.3, { x: 20, y: -70, a: -0.2 }], [14.0, { x: 14, y: -60, a: -0.1 }]
  ];
  function conoA(t, pG) {
    const k = pista(CLAVES_A, t), r = enTronco(G, pG, k);
    // meneo al presumir
    const men = dentro(t, T.presume0 + 0.35, T.presume0 + 0.45, T.presume1 - 0.25, T.presume1 - 0.1);
    let c = desdeAgarre(r, k.a + 0.12 * Math.sin((t - T.presume0) * 15) * men, AGARRE.A);
    let lengua = null;
    const boca = bocaG(pG);
    // lametones a la bola de arriba (el último ya es al aire, donde estaba la bola)
    for (const t0 of T.lameG) {
      const w = tramo(t, t0, t0 + 0.16) * (1 - tramo(t, t0 + 0.44, t0 + 0.6));
      if (w <= 0) continue;
      const u = suave(fase(t, t0 + 0.1, t0 + 0.48));
      const ang = 0.3 - 0.05 * u;
      const centro = { x: boca.x + 23 - 3 * u, y: boca.y + 5 + lerp(-3, 8, u) };
      const b = borde(centro, 2, R_A, ang);
      c = { x: lerp(c.x, b.x, w), y: lerp(c.y, b.y, w), ang: lerp(c.ang, ang, w) };
      const ext = tramo(t, t0 + 0.06, t0 + 0.17) * (1 - tramo(t, t0 + 0.42, t0 + 0.55));
      if (ext > 0) lengua = { boca, ext, centro: enCono(c, { x: 0, y: yBola(2, R_A) }), r: R_A * U, a: lerp(Math.PI - 0.8, Math.PI + 0.7, u), ancho: 8.5 };
    }
    // lametones tristes al cucurucho vacío: la lengua entra en el borde
    for (const t0 of T.lameT) {
      const w = tramo(t, t0, t0 + 0.18) * (1 - tramo(t, t0 + 0.42, t0 + 0.6));
      if (w <= 0) continue;
      const u = suave(fase(t, t0 + 0.12, t0 + 0.48));
      const ang = -0.25;
      const b = { x: boca.x + 13, y: boca.y + 12 + 3 * u, ang };
      c = { x: lerp(c.x, b.x, w), y: lerp(c.y, b.y, w), ang: lerp(c.ang, ang, w) };
      const ext = tramo(t, t0 + 0.08, t0 + 0.2) * (1 - tramo(t, t0 + 0.42, t0 + 0.55));
      if (ext > 0) lengua = { boca, ext, punta: enCono(c, { x: lerp(-9, 6, u), y: lerp(-1, 2, u) }), ancho: 8 };
    }
    return { c, lengua };
  }

  // cucurucho B: primero de Carla (mano cercana, luego lejana), luego en el aire del traspaso y luego de Guillermo
  const TRASPASO = { x: 454, y: 268 };                     // puño de Carla (lejano) mientras lo agarran los dos
  const CLAVES_B_C = [                                    // puño cercano de Carla en el marco de su tronco (x positiva = hacia delante)
    [0, { x: 14, y: -58, a: -0.2 }], [T.cambia0, { x: 14, y: -58, a: -0.2 }], [T.cambia1, { x: 20, y: -62, a: -0.05 }],
    [T.ofrece0, { x: 24, y: -66, a: 0 }]
  ];
  const CLAVES_B_G = [                                    // puño lejano de Guillermo en el marco de su tronco
    [T.abraza1, { x: 72, y: -72, a: -0.25 }], [T.reverencia0, { x: 72, y: -72, a: -0.3 }],
    [T.reverencia1, { x: 74, y: -68, a: -1.0 }], [10.1, { x: 74, y: -68, a: -1.05 }], [T.endereza2 + 0.4, { x: 46, y: -32, a: -0.1 }],
    [T.camara + 0.2, { x: 44, y: -34, a: 0 }]
  ];
  function conoB(t, pG, pC) {
    let c;
    const kC = pista(CLAVES_B_C, t), rC = enTronco(CA, pC, kC);
    c = desdeAgarre(rC, kC.a, AGARRE.Bc);
    const wo = tramo(t, T.ofrece0, T.ofrece1);
    const flota = desdeAgarre({ x: TRASPASO.x, y: TRASPASO.y + 2 * Math.sin(t * 5) }, 0.03 * Math.sin(t * 4), AGARRE.Bl);
    if (wo > 0) c = { x: lerp(c.x, flota.x, wo), y: lerp(c.y, flota.y, wo), ang: lerp(c.ang, flota.ang, wo) };
    if (t > T.suelta) {
      const k = pista(CLAVES_B_G, t), r = enTronco(G, pG, k);
      const w = tramo(t, T.suelta, T.abraza1);
      const gb = desdeAgarre(r, k.a, AGARRE.Bg);
      c = { x: lerp(c.x, gb.x, w), y: lerp(c.y, gb.y, w), ang: lerp(c.ang, gb.ang, w) };
    }
    // lametones de Carla a su bola
    let lengua = null;
    const boca = bocaC(pC);
    for (const t0 of T.lameC) {
      const w = tramo(t, t0, t0 + 0.16) * (1 - tramo(t, t0 + 0.44, t0 + 0.6));
      if (w <= 0) continue;
      const u = suave(fase(t, t0 + 0.1, t0 + 0.48));
      const ang = -0.3 + 0.05 * u;
      const centro = { x: boca.x - 21 + 3 * u, y: boca.y + 6 + lerp(-2, 7, u) };
      const b = borde(centro, 0, R_B, ang);
      c = { x: lerp(c.x, b.x, w), y: lerp(c.y, b.y, w), ang: lerp(c.ang, ang, w) };
      const ext = tramo(t, t0 + 0.06, t0 + 0.17) * (1 - tramo(t, t0 + 0.42, t0 + 0.55));
      if (ext > 0) lengua = { boca, ext, centro: enCono(c, { x: 0, y: yBola(0, R_B) }), r: R_B * U, a: lerp(0.8, -0.7, u), ancho: 7.5 };
    }
    return { c, lengua };
  }

  /* ---------- bolas: en el cucurucho, en el aire o aplastadas ---------- */
  const bolasEnCono = (cono, t) => {
    const out = [];
    if (cono === "A") {
      const w = bamboleo(t);
      for (let k = 0; k < 3; k++) {
        const cd = CAIDAS.find(q => q.cono === "A" && q.k === k);
        if (t >= cd.td) continue;
        const rs = resbalon(cd, t);
        out.push({ x: w * k * 2.2 + rs.dx, y: yBola(k, R_A) + rs.dy + Math.abs(w) * k * 0.3, R: R_A, sab: BOLAS_A[k], rot: w * 0.1 * k + rs.rot, op: { cereza: k === 2 } });
      }
    } else {
      const cd = CAIDAS[3];
      if (t < cd.td) { const rs = resbalon(cd, t); out.push({ x: rs.dx, y: yBola(0, R_B) + rs.dy, R: R_B, sab: "vainilla", rot: rs.rot, op: { cereza: true, fideos: true } }); }
    }
    return out;
  };
  // estado de cada bola al soltarse (se calcula una vez: las posturas son funciones puras)
  const SUELTAS = {};
  function suelta(cd) {
    if (SUELTAS[cd.id]) return SUELTAS[cd.id];
    const at = tt => {
      const pG = cuerpoG(tt), pC = cuerpoC(tt);
      const c = cd.cono === "A" ? conoA(tt, pG).c : conoB(tt, pG, pC).c;
      const R = R_DE(cd), rs = resbalon(cd, tt);
      return { p: enCono(c, { x: rs.dx, y: yBola(cd.k, R) + rs.dy }), rot: c.ang + rs.rot };
    };
    const a = at(cd.td), b = at(cd.td - 0.02);
    const Tf = cd.tl - cd.td, Rp = R_DE(cd) * U;
    const cy = cd.ty - 0.62 * Rp;
    const vy = (cy - a.p.y - 0.5 * GRAV * Tf * Tf) / Tf, vx = (cd.tx - a.p.x) / Tf;
    // da vueltas de campana en el sentido en que resbalaba y llega derecha al suelo
    const vuelta = 2 * Math.PI, meta = cd.lado > 0 ? vuelta * Math.ceil(a.rot / vuelta + 0.15) : vuelta * Math.floor(a.rot / vuelta - 0.15);
    SUELTAS[cd.id] = { x0: a.p.x, y0: a.p.y, rot0: a.rot, vx, vy, giro: (meta - a.rot) / Tf, vSlide: { x: (a.p.x - b.p.x) / 0.02, y: (a.p.y - b.p.y) / 0.02 } };
    return SUELTAS[cd.id];
  }
  function enVuelo(cd, t) {
    const s = suelta(cd), tau = t - cd.td;
    return { x: s.x0 + s.vx * tau, y: s.y0 + s.vy * tau + 0.5 * GRAV * tau * tau, rot: s.rot0 + s.giro * tau };
  }

  /* =====================================================================================
   * POSES COMPLETAS (cuerpos + cucuruchos + manos)
   * ===================================================================================== */
  let cacheT = NaN, cacheP = null;
  const CAMBIA_DUENO = T.suelta + 0.3;
  const repintaManoG = t => t > T.coge0 - 0.05 && t < CAMBIA_DUENO;
  // repinta la mano lejana de Guillermo encima del cucurucho (que en el traspaso aún se dibuja con Carla)
  function manoGEncima(g, p) {
    const m = p.manoLejos, q = G.aPantalla(p, m), k = p.s * G.JK;
    g.save(); g.translate(q.x, q.y); g.rotate(m.ang || 0); g.scale(k, k);
    Personaje2D.mano(g, m, { piel: G.C.piel, sombra: G.C.pielSombra, tinta: G.C.tinta });
    g.restore();
  }
  function poses(t) {
    if (t === cacheT) return cacheP;
    const pG = cuerpoG(t), pC = cuerpoC(t);
    const A = conoA(t, pG), B = conoB(t, pG, pC);
    // dueño del dibujo del cucurucho B: Carla mientras lo tiene (la mano de Guillermo se repinta encima), luego Guillermo
    const duenoB = t < CAMBIA_DUENO ? "C" : "G";
    manosG(pG, t, A, B, duenoB);
    manosC(pC, t, B, duenoB);
    // Carla sigue con la mirada la bola que se cae; Guillermo mira la que se le cae en el zapato
    const f0 = CAIDAS[0];
    if (t > f0.t0 && t < f0.tl + 0.1) miraA(CA, pC, { x: 900, y: 470 }, t < f0.td ? enCono(A.c, { x: 0, y: yBola(2, R_A) }) : enVuelo(f0, Math.min(t, f0.tl)), dentro(t, f0.t0 + 0.05, f0.t0 + 0.15, f0.tl, f0.tl + 0.1));
    const f3 = CAIDAS[3];
    if (t > f3.td && t < f3.tl + 0.2) miraA(G, pG, { x: 830, y: 590 }, enVuelo(f3, Math.min(t, f3.tl)), dentro(t, f3.td, f3.td + 0.1, f3.tl, f3.tl + 0.2));
    cacheT = t; cacheP = { g: pG, c: pC, A, B, duenoB };
    return cacheP;
  }

  // manos de Guillermo: la cercana siempre en el cucurucho A; la lejana libre y luego en el B
  function manosG(p, t, A, B, duenoB) {
    const hc = hombro(G, p, "cerca"), hl = hombro(G, p, "lejos");
    const qa = enCono(A.c, { x: 0, y: AGARRE.A });
    p.manoCerca = manoP(G, p, qa, haciaHombro(qa, hc, -0.35), -1, AGARRA, (g, tt) => objetoA(g, tt));
    // mano lejana: colgando relajada → al cucurucho B
    let q = enTronco(G, p, { x: 47, y: -27 }), mu = -1.68, d = RELAJADA;
    const wB = tramo(t, T.coge0, T.coge1);
    if (wB > 0) {
      const qb = enCono(B.c, { x: 0, y: AGARRE.Bg });
      q = mezcla(q, qb, wB); mu = lerp(mu, haciaHombro(qb, hl, -0.45), wB); d = mezclaD(d, AGARRA, tramo(t, T.coge1 - 0.12, T.coge1));
    }
    p.manoLejos = manoP(G, p, q, mu, -1, d, duenoB === "G" ? (g, tt) => objetoB(g, tt) : null);
  }
  // manos de Carla
  function manosC(p, t, B, duenoB) {
    const hc = hombro(CA, p, "cerca"), hl = hombro(CA, p, "lejos");
    // mano cercana: en el cucurucho hasta el cambio de mano, luego cuelga y al reír se agarra la tripa
    let q = enTronco(CA, p, { x: -36, y: -28 }), mu = haciaHombro(q, hc, 0.25), d = RELAJADA;
    const tripa = dentro(t, T.rie, T.rie + 0.25, 12.9, 13.3);
    if (tripa > 0) { const qt = enTronco(CA, p, { x: 4, y: -52 }); q = mezcla(q, qt, tripa); mu = lerp(mu, haciaHombro(qt, hc, 0.5), tripa); d = mezclaD(d, ABIERTA, tripa); }
    const wn = 1 - tramo(t, T.cambia1, T.cambia1 + 0.32);
    if (wn > 0) { const qb = enCono(B.c, { x: 0, y: AGARRE.Bc }); q = mezcla(q, qb, wn); mu = lerp(mu, haciaHombro(qb, hc, 0.4), wn); d = mezclaD(d, AGARRA, wn); }
    p.manoCerca = manoP(CA, p, q, mu, -1, d, null);
    // mano lejana: cuelga → tapa la boca → coge el cucurucho, lo ofrece → señala el zapato → se seca una lágrima
    let l = enTronco(CA, p, { x: 30, y: -28 }), lmu = -Math.PI / 2 + 0.25, ld = RELAJADA;
    const pone = (w, ql, m, dd) => { if (w <= 0) return; l = mezcla(l, ql, w); lmu = lerp(lmu, m, w); ld = mezclaD(ld, dd, w); };
    const boca = bocaC(p);
    pone(dentro(t, 3.97, 4.15, 5.1, 5.45), { x: boca.x - 2, y: boca.y + 3 }, Math.PI / 2 + 0.25, TAPA);
    const wl = tramo(t, T.cambia0, T.cambia0 + 0.26) * (1 - tramo(t, T.suelta, T.suelta + 0.38));
    if (wl > 0) { const qb = enCono(B.c, { x: 0, y: AGARRE.Bl }); pone(wl, qb, haciaHombro(qb, hl, 0.45), AGARRA); }
    const sen = dentro(t, T.senala0, T.senala0 + 0.22, T.senala1, T.senala1 + 0.3);
    pone(sen, enTronco(CA, p, { x: 78, y: -50 + 4 * Math.sin(t * 19) }), -0.95, SENALA);
    const ojo = CA.aPantalla(p, CA.cabeza(p).a({ x: 860, y: 470 }));
    const enj = dentro(t, T.enjuga0, T.enjuga0 + 0.25, T.enjuga1, T.enjuga1 + 0.3);
    pone(enj, { x: ojo.x + 2 + 3 * Math.sin(t * 16) * enj, y: ojo.y + 10 }, Math.PI / 2 + 0.55, FROTA);
    p.manoLejos = manoP(CA, p, l, lmu, 1, ld, duenoB === "C" ? (g, tt) => objetoB(g, tt) : null);
  }

  // los cucuruchos se pintan en pantalla desde mano.objeto (la mano va encima)
  let MATRIZ = null, ACTUAL = null;
  function objetoA(g, t) {
    if (!ACTUAL || !MATRIZ) return;
    g.save(); g.setTransform(MATRIZ); cucurucho(g, ACTUAL.A.c, bolasEnCono("A", t)); g.restore();
  }
  function objetoB(g, t) {
    if (!ACTUAL || !MATRIZ) return;
    g.save(); g.setTransform(MATRIZ); cucurucho(g, ACTUAL.B.c, bolasEnCono("B", t)); g.restore();
  }

  /* =====================================================================================
   * LENGUAS, LÁGRIMAS Y EFECTOS
   * ===================================================================================== */
  function lengua(g, L) {
    if (!L) return;
    const tip0 = L.punta || { x: L.centro.x + Math.cos(L.a) * L.r * 0.88, y: L.centro.y + Math.sin(L.a) * L.r * 0.88 };
    const tip = mezcla(L.boca, tip0, salida(L.ext));
    const dx = tip.x - L.boca.x, dy = tip.y - L.boca.y, len = Math.hypot(dx, dy); if (len < 2) return;
    const w = L.ancho * (0.7 + 0.3 * L.ext);
    g.save(); g.translate(L.boca.x, L.boca.y); g.rotate(Math.atan2(dy, dx)); g.lineJoin = "round"; g.lineCap = "round";
    const fin = Math.max(w * 0.5, len - w * 0.5);
    g.beginPath(); g.moveTo(0, -w * 0.42); g.lineTo(fin, -w * 0.5); g.arc(fin, 0, w * 0.5, -Math.PI / 2, Math.PI / 2); g.lineTo(0, w * 0.42); g.closePath();
    g.fillStyle = "#ec7480"; g.fill();
    g.fillStyle = "#c9505e"; g.beginPath(); g.ellipse(fin * 0.5, w * 0.2, fin * 0.45, w * 0.18, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(w * 0.3, -w * 0.42); g.lineTo(fin, -w * 0.5); g.arc(fin, 0, w * 0.5, -Math.PI / 2, Math.PI / 2); g.lineTo(w * 0.3, w * 0.42);
    g.lineWidth = 1.5; g.strokeStyle = "#4f1512"; g.stroke();
    g.beginPath(); g.moveTo(w * 0.6, 0); g.lineTo(fin - w * 0.4, 0); g.lineWidth = 1; g.strokeStyle = "rgba(110,20,30,0.55)"; g.stroke();
    g.fillStyle = "rgba(255,220,225,0.8)"; g.beginPath(); g.ellipse(fin * 0.62, -w * 0.18, fin * 0.18, w * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // lagrimones de Guillermo (retrato): dos chorros por las mejillas y gotas que caen
  function lagrimasG(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    for (const [x, y, d] of [[752, 590, 0], [912, 640, 0.4]]) {
      const largo = 135 * salida(k);
      g.globalAlpha = 0.9 * clamp(k * 2);
      g.lineWidth = 16; g.strokeStyle = "#1d5f8a"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 10, y + largo * 0.5, x - 5, y + largo); g.stroke();
      g.lineWidth = 10; g.strokeStyle = "#9fdcff"; g.stroke();
      g.lineWidth = 3; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(x - 2, y + 8); g.quadraticCurveTo(x - 10, y + largo * 0.45, x - 7, y + largo * 0.8); g.stroke();
      for (let i = 0; i < 3; i++) {
        const ph = (t * 1.7 + d + i / 3) % 1, yy = y + largo + ph * 90;
        g.globalAlpha = 0.9 * (1 - ph) * clamp(k * 2);
        g.fillStyle = "#9fdcff"; g.strokeStyle = "#1d5f8a"; g.lineWidth = 3; g.beginPath(); g.ellipse(x - 5, yy, 6.5, 8.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
    g.restore();
  }
  // lagrimitas de risa de Carla (retrato)
  function lagrimitasC(g, k, t) {
    if (k <= 0.01) return;
    g.save();
    for (const [x, y, d] of [[826, 468, 0], [986, 508, 0.5]]) {
      const ph = (t * 1.3 + d) % 1, yy = y + ph * 40, s = 9 * clamp(k * 2) * (1 - 0.3 * ph);
      g.globalAlpha = Math.sin(Math.PI * ph) * clamp(k * 2);
      g.beginPath(); g.moveTo(x, yy - s * 1.6); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.6);
      g.fillStyle = "#bfe8ff"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#1d3b52"; g.stroke();
    }
    g.restore();
  }

  /* ---------- bolas cayendo, plastas y salpicaduras ---------- */
  function gotitas(cd, t) {                               // salpicaduras del impacto (vuelan y se quedan pegadas al suelo)
    const out = [], tau = t - cd.tl; if (tau <= 0) return out;
    const s = SABOR[SAB_DE(cd)];
    for (let i = 0; i < 7; i++) {
      const h1 = hash(i * 3.1 + cd.ty), h2 = hash(i * 7.7 + cd.tx);
      const a = -Math.PI / 2 + (h1 - 0.5) * 2.5, v = 110 + 150 * h2;
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v;
      const suelo = (cd.zapato ? SUELO + 4 : 575) + (hash(i + 9.3) - 0.5) * 10;
      const y0 = cd.ty - 4;
      // tiempo hasta tocar el suelo
      const tt = (-vy + Math.sqrt(vy * vy + 2 * GRAV * Math.max(0, suelo - y0))) / GRAV;
      const tc = Math.min(tau, tt);
      out.push({ x: cd.tx + vx * tc, y: y0 + vy * tc + 0.5 * GRAV * tc * tc, pegada: tau >= tt, c: s.c, r: 2.2 + 1.6 * hash(i + 4.4) });
    }
    return out;
  }
  function pintaGotitas(g, t, pegadas) {
    g.save(); g.lineWidth = 1.2; g.strokeStyle = TINTA;
    for (const cd of CAIDAS) for (const q of gotitas(cd, t)) {
      if (q.pegada !== pegadas) continue;
      g.fillStyle = q.c; g.beginPath();
      if (pegadas) g.ellipse(q.x, q.y, q.r * 1.5, q.r * 0.6, 0, 0, Math.PI * 2); else g.arc(q.x, q.y, q.r, 0, Math.PI * 2);
      g.fill(); g.stroke();
    }
    g.restore();
  }
  // bola aplastada: se chafa contra el suelo (o el zapato) y se queda; k = progreso del aplastamiento
  function plasta(g, cd, t) {
    const tau = t - cd.tl; if (tau < 0) return;
    const k = salida(fase(tau, 0, 0.12)), rebota = Math.sin(Math.PI * fase(tau, 0.12, 0.34)) * 0.12;
    const derrite = 0.12 * tramo(tau, 0.3, 2.5);
    const sx = 1 + 0.8 * k + derrite - rebota * 0.5, sy = 1 - 0.58 * k + rebota;
    const v = enVuelo(cd, cd.tl), rot = v.rot * (1 - k);
    const R = R_DE(cd), Rp = R * U, sab = SAB_DE(cd), s = SABOR[sab];
    g.save();
    // salpicadura en estrella y charquito derretido debajo (solo las que caen al suelo)
    if (!cd.zapato) {
      const suelo = cd.ty >= 570, f = suelo ? 1 : 0.7;
      g.fillStyle = s.c; g.strokeStyle = TINTA; g.lineWidth = 1.6; g.globalAlpha = k;
      g.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = (i + 0.5 * hash(i + cd.tx)) / 9 * Math.PI * 2, L = Rp * (1.2 + 0.7 * hash(i * 2.3 + cd.ty)) * f * (0.4 + 0.6 * k);
        const x = cd.tx + Math.cos(a) * L * 1.15, y = cd.ty - 2 + Math.sin(a) * L * 0.3, rr = Rp * (0.17 + 0.1 * hash(i + 7.1));
        g.moveTo(x + rr, y); g.ellipse(x, y, rr, rr * 0.5, 0, 0, Math.PI * 2);
      }
      g.fill(); g.stroke();
      if (suelo) { g.beginPath(); g.ellipse(cd.tx + 2, cd.ty - 1, Rp * (1.3 + derrite * 2), Rp * 0.3, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
      g.globalAlpha = 1;
    }
    g.translate(cd.tx, cd.ty); g.scale(sx, sy); g.scale(U, U);
    bola(g, 0, -0.62 * R, R, sab, rot, { fideos: cd.fideos });
    g.restore();
    // chorretones que caen por el zapato
    if (cd.zapato) {
      g.save(); g.lineCap = "round";
      for (const [dx, ln, d] of [[-13, 6, 0.15], [15, 9, 0.35], [24, 7, 0.6]]) {
        const l = ln * tramo(tau, d, d + 1.4);
        if (l < 0.5) continue;
        const x = cd.tx + dx, y0 = cd.ty - 3 + Math.abs(dx) * 0.12;
        g.beginPath(); g.moveTo(x - 3.2, y0); g.lineTo(x - 2.2, y0 + l); g.arc(x, y0 + l, 2.3, Math.PI, 0, true); g.lineTo(x + 3.2, y0); g.closePath();
        g.fillStyle = s.c; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
      }
      g.restore();
    }
    // la guinda: la de fresa sale rodando; la de vainilla se queda encima de la plasta del zapato
    if (cd.cereza) {
      const top = cd.ty - (1.62 * Rp) * sy;
      if (cd.zapato) cereza(g, cd.tx + 2, top - 3.4 + 2 * rebota, R * 0.3 * U);
      else {
        const u = fase(tau, 0.02, 0.5), x = lerp(cd.tx + 3, 484, u), y = lerp(top - 3, 574, u) - 34 * Math.sin(Math.PI * u) * (1 - u * 0.3);
        cereza(g, x, y, R * 0.3 * U);
      }
    }
  }
  function enElAire(g, t) {
    for (const cd of CAIDAS) {
      if (t < cd.td || t >= cd.tl) continue;
      const v = enVuelo(cd, t), R = R_DE(cd);
      g.save(); g.translate(v.x, v.y); g.scale(U, U); bola(g, 0, 0, R, SAB_DE(cd), v.rot, { cereza: cd.cereza, fideos: cd.fideos }); g.restore();
      // rayitas de caída
      g.save(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2; g.lineCap = "round";
      for (const dx of [-7, 0, 7]) { g.beginPath(); g.moveTo(v.x + dx, v.y - R * U - 6); g.lineTo(v.x + dx * 1.2, v.y - R * U - 18); g.stroke(); }
      g.restore();
    }
  }
  // ¡plaf!: rayas de impacto
  function impacto(g, t) {
    for (const cd of CAIDAS) {
      const k = fase(t, cd.tl, cd.tl + 0.32); if (k <= 0 || k >= 1) continue;
      g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI + 0.25 + i * (Math.PI - 0.5) / 6, r0 = 18 + 22 * salida(k), r1 = r0 + 10;
        g.beginPath(); g.moveTo(cd.tx + Math.cos(a) * r0 * 1.3, cd.ty - 4 + Math.sin(a) * r0); g.lineTo(cd.tx + Math.cos(a) * r1 * 1.3, cd.ty - 4 + Math.sin(a) * r1); g.stroke();
      }
      g.restore();
    }
  }
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function destello(g, t, t0, x, y, r) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    const s = Math.sin(Math.PI * k);
    g.save(); estrellaPuntas(g, x, y, r * s, 4, t * 2, 0.22); g.fillStyle = "#fffbe0"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke(); g.restore();
  }
  function corazon(g, x, y, r) {
    g.beginPath(); g.moveTo(x, y + r * 0.9);
    g.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.45);
    g.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); g.closePath();
  }
  function corazones(g, t, P) {
    for (let i = 0; i < 3; i++) {
      const t0 = T.coge1 + 0.25 + i * 0.22, k = fase(t, t0, t0 + 0.8); if (k <= 0 || k >= 1) continue;
      const c = ACTUAL.B.c, x = c.x - 8 + 18 * (i - 1) + 6 * Math.sin(k * 6 + i), y = c.y - 50 - 45 * k;
      g.save(); g.globalAlpha = Math.sin(Math.PI * k); corazon(g, x, y, 6 + 2 * i % 3); g.fillStyle = "#ff5c7a"; g.fill(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke(); g.restore();
    }
  }
  // rayitas de risa alrededor de la cabeza de Carla
  function risa(g, t, pC) {
    const k = dentro(t, T.rie, T.rie + 0.2, 12.9, 13.3); if (k <= 0) return;
    const c = CA.aPantalla(pC, CA.cabeza(pC).a({ x: 900, y: 420 }));
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 3; g.globalAlpha = k;
    for (let i = 0; i < 3; i++) {
      const a = -0.6 + i * 0.5, ph = (t * 3 + i * 0.33) % 1, r = 58 + 10 * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r - 10); g.lineTo(c.x + Math.cos(a) * (r + 12), c.y + Math.sin(a) * (r + 12) - 10); g.stroke();
      g.beginPath(); g.moveTo(c.x - Math.cos(a) * r, c.y + Math.sin(a) * r - 10); g.lineTo(c.x - Math.cos(a) * (r + 12), c.y + Math.sin(a) * (r + 12) - 10); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null;
  const SOL = { x: 880, y: 74, r: 40 };
  function nube(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    const bolas = [[-46, 6, 20], [-22, -8, 26], [8, -14, 30], [36, -4, 24], [58, 8, 16], [-4, 10, 24], [26, 12, 20]];
    g.beginPath(); for (const [bx, by, r] of bolas) { g.moveTo(bx + r, by); g.arc(bx, by, r, 0, Math.PI * 2); }
    g.lineWidth = 5; g.strokeStyle = "rgba(60,120,170,0.45)"; g.stroke(); g.fillStyle = "#ffffff"; g.fill();
    g.fillStyle = "rgba(170,210,240,0.55)"; g.beginPath(); g.ellipse(6, 18, 58, 8, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    let gr = g.createLinearGradient(0, -50, 0, 305); gr.addColorStop(0, "#3fa9ec"); gr.addColorStop(0.7, "#8fd3f7"); gr.addColorStop(1, "#d6f2ff");
    g.fillStyle = gr; g.fillRect(-60, -50, W + 120, 360);
    // resplandor del sol
    gr = g.createRadialGradient(SOL.x, SOL.y, 10, SOL.x, SOL.y, 230); gr.addColorStop(0, "rgba(255,248,190,0.95)"); gr.addColorStop(0.35, "rgba(255,240,160,0.45)"); gr.addColorStop(1, "rgba(255,240,160,0)");
    g.fillStyle = gr; g.fillRect(SOL.x - 240, SOL.y - 240, 480, 480);
    nube(g, 170, 70, 0.9); nube(g, 520, 46, 0.65); nube(g, 700, 120, 0.5);
    // mar
    gr = g.createLinearGradient(0, 296, 0, 360); gr.addColorStop(0, "#1b7fc4"); gr.addColorStop(1, "#47b4e6");
    g.fillStyle = gr; g.fillRect(-60, 296, W + 120, 70);
    g.fillStyle = "#5f9fc9"; g.beginPath(); g.moveTo(-60, 297); g.quadraticCurveTo(40, 270, 150, 284); g.quadraticCurveTo(220, 276, 290, 297); g.closePath(); g.fill();
    g.strokeStyle = "#156ea8"; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, 296.5); g.lineTo(W + 60, 296.5); g.stroke();
    // velero a lo lejos
    g.save(); g.translate(610, 300); g.fillStyle = "#ffffff"; g.strokeStyle = "#16486e"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -30); g.lineTo(14, -6); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-2, -8); g.lineTo(-2, -24); g.lineTo(-12, -8); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d8483a"; g.beginPath(); g.moveTo(-14, -3); g.lineTo(16, -3); g.lineTo(11, 3); g.lineTo(-10, 3); g.closePath(); g.fill(); g.stroke(); g.restore();
    // suelo de baldosas de barro
    const Y0 = 405;
    gr = g.createLinearGradient(0, Y0, 0, H + 50); gr.addColorStop(0, "#d27a4c"); gr.addColorStop(1, "#e49462");
    g.fillStyle = gr; g.fillRect(-60, Y0, W + 120, H + 50 - Y0);
    g.strokeStyle = "rgba(140,62,30,0.55)"; g.lineWidth = 2;
    let y = Y0, dy = 12; while (y < H + 50) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); y += dy; dy *= 1.28; }
    const VX = 512, VY = 150;
    for (let i = -14; i <= 14; i++) { const xb = VX + i * 95; g.beginPath(); g.moveTo(lerp(VX, xb, (Y0 - VY) / (H + 50 - VY)), Y0); g.lineTo(xb, H + 50); g.stroke(); }
    g.fillStyle = "rgba(255,210,170,0.13)";
    for (let i = 0; i < 26; i++) { const xx = -40 + hash(i) * (W + 80), yy = Y0 + 10 + hash(i + 3) * 190; g.beginPath(); g.ellipse(xx, yy, 28 + hash(i + 6) * 20, 5 + (yy - Y0) * 0.03, 0, 0, Math.PI * 2); g.fill(); }
    // barandilla blanca del paseo
    g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(-60, Y0, W + 120, 8);
    for (let x = -50; x < W + 60; x += 30) {
      g.save(); g.translate(x, 0);
      g.beginPath(); g.moveTo(-6, 352); g.quadraticCurveTo(-11, 366, -5, 376); g.quadraticCurveTo(-9, 388, -6, 398); g.lineTo(6, 398);
      g.quadraticCurveTo(9, 388, 5, 376); g.quadraticCurveTo(11, 366, 6, 352); g.closePath();
      g.fillStyle = "#fbf6ec"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "rgba(170,160,150,0.5)"; g.beginPath(); g.moveTo(2, 354); g.quadraticCurveTo(7, 366, 3, 376); g.quadraticCurveTo(6, 388, 3, 396); g.lineTo(6, 396); g.quadraticCurveTo(9, 388, 5, 376); g.quadraticCurveTo(11, 366, 6, 354); g.closePath(); g.fill();
      g.restore();
    }
    for (const [y0, h] of [[338, 15], [397, 10]]) {
      g.fillStyle = "#fbf6ec"; g.fillRect(-60, y0, W + 120, h); g.lineWidth = 3; g.strokeStyle = TINTA; g.strokeRect(-62, y0, W + 124, h);
      g.fillStyle = "rgba(170,160,150,0.45)"; g.fillRect(-60, y0 + h * 0.6, W + 120, h * 0.4);
    }
    quiosco(g); sombrilla(g); maceta(g, 760, Y0 + 2);
    return c;
  }
  function quiosco(g) {
    g.save();
    // cuerpo
    g.fillStyle = "#fdf3f6"; g.strokeStyle = TINTA; g.lineWidth = 3.5;
    g.beginPath(); g.rect(0, 250, 215, 205); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.rect(0, 250, 215, 205); g.clip();
    for (let x = 0; x < 230; x += 36) { g.fillStyle = "#f7a8c2"; g.fillRect(x, 330, 18, 125); }
    g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(180, 250, 35, 205);
    g.restore();
    g.beginPath(); g.rect(0, 330, 215, 125); g.stroke();
    // mostrador con tarrinas de colores
    g.fillStyle = "#bfe8f4"; g.beginPath(); g.rect(14, 268, 186, 58); g.fill(); g.stroke();
    const tar = ["#f490b0", "#b5dc79", "#8a5232", "#ffe07a", "#fff3d2", "#8fd0ff"];
    tar.forEach((col, i) => {
      const x = 32 + i * 30;
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 12, 314); g.quadraticCurveTo(x - 13, 296, x - 4, 294); g.quadraticCurveTo(x, 286, x + 6, 293); g.quadraticCurveTo(x + 14, 296, x + 12, 314); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
      g.fillStyle = "#d9d9e3"; g.fillRect(x - 13, 312, 26, 10); g.strokeRect(x - 13, 312, 26, 10);
    });
    g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.moveTo(20, 272); g.lineTo(52, 272); g.lineTo(30, 322); g.lineTo(18, 322); g.closePath(); g.fill();
    // toldo de rayas con festón
    g.lineWidth = 3.5;
    for (let i = 0; i < 8; i++) {
      const x0 = -14 + i * 31; g.fillStyle = i % 2 ? "#ffffff" : "#ff6f9d";
      g.beginPath(); g.moveTo(x0 + 8, 206); g.lineTo(x0 + 39, 206); g.lineTo(x0 + 31, 238); g.lineTo(x0, 238); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x0, 238); g.quadraticCurveTo(x0 + 15.5, 258, x0 + 31, 238); g.closePath(); g.fill(); g.stroke();
    }
    g.beginPath(); g.moveTo(-6, 206); g.lineTo(234, 206); g.lineTo(234, 238); g.lineTo(-14, 238); g.closePath(); g.stroke();
    // cucurucho gigante encima (letrero sin letras)
    g.save(); g.translate(108, 112); g.rotate(-0.12); g.scale(2.2, 2.2);
    barquillo(g); bola(g, 0, yBola(0, 15), 15, "fresa", 0, { cereza: true });
    g.restore();
    g.restore();
  }
  function sombrilla(g) {
    g.save(); g.lineWidth = 3.5; g.strokeStyle = TINTA;
    // mesa y silla
    g.fillStyle = "#e8e4dc"; g.fillRect(906, 446, 8, 90); g.strokeRect(906, 446, 8, 90);
    g.beginPath(); g.ellipse(910, 536, 30, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(910, 446, 62, 12, 0, 0, Math.PI * 2); g.fillStyle = "#ffffff"; g.fill(); g.stroke();
    // vaso de granizado
    g.fillStyle = "#ffb347"; g.beginPath(); g.moveTo(888, 404); g.lineTo(904, 404); g.lineTo(901, 440); g.lineTo(891, 440); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#e2453a"; g.lineWidth = 3; g.beginPath(); g.moveTo(898, 404); g.lineTo(906, 388); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 3.5;
    // silla
    g.fillStyle = "#3bb3a6"; g.beginPath(); g.rect(960, 380, 50, 12); g.fill(); g.stroke(); g.beginPath(); g.rect(960, 450, 54, 10); g.fill(); g.stroke();
    for (const x of [964, 1006]) { g.beginPath(); g.moveTo(x, 392); g.lineTo(x, 540); g.stroke(); }
    // palo y lona
    g.fillStyle = "#f2efe8"; g.fillRect(906, 210, 8, 236); g.strokeRect(906, 210, 8, 236);
    for (let i = 0; i < 6; i++) {
      const a0 = Math.PI + i * Math.PI / 6, a1 = a0 + Math.PI / 6;
      g.fillStyle = i % 2 ? "#ffffff" : "#ffcc33";
      g.beginPath(); g.moveTo(910, 186); g.lineTo(910 + Math.cos(a0) * 150, 236 + Math.sin(a0) * 4);
      g.quadraticCurveTo(910 + Math.cos((a0 + a1) / 2) * 150, 252, 910 + Math.cos(a1) * 150, 236 + Math.sin(a1) * 4); g.closePath(); g.fill(); g.stroke();
    }
    g.fillStyle = "#e2453a"; g.beginPath(); g.arc(910, 184, 6, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  function maceta(g, x, y) {
    g.save(); g.lineWidth = 3; g.strokeStyle = TINTA;
    for (const [dx, dy, r] of [[-22, -40, 16], [0, -54, 18], [22, -40, 16], [-10, -28, 14], [12, -28, 14]]) { g.fillStyle = "#3f9b4a"; g.beginPath(); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); g.fill(); g.stroke(); }
    for (const [dx, dy] of [[-18, -48], [6, -62], [20, -36], [-4, -36]]) { g.fillStyle = "#ff4f6d"; g.beginPath(); g.arc(x + dx, y + dy, 6, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke(); }
    g.lineWidth = 3; g.fillStyle = "#c8643a"; g.beginPath(); g.moveTo(x - 26, y - 22); g.lineTo(x + 26, y - 22); g.lineTo(x + 20, y + 18); g.lineTo(x - 20, y + 18); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  // vivos: rayos del sol, brillos del mar, gaviota y calima
  function vivos(g, t) {
    g.save(); g.translate(SOL.x, SOL.y); g.rotate(t * 0.12);
    g.fillStyle = "rgba(255,236,120,0.55)";
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, l = 70 + 10 * Math.sin(t * 3 + i * 1.7); g.beginPath(); g.moveTo(Math.cos(a - 0.09) * 48, Math.sin(a - 0.09) * 48); g.lineTo(Math.cos(a) * l, Math.sin(a) * l); g.lineTo(Math.cos(a + 0.09) * 48, Math.sin(a + 0.09) * 48); g.closePath(); g.fill(); }
    g.restore();
    g.save(); g.fillStyle = "#ffe25a"; g.strokeStyle = "#f2a516"; g.lineWidth = 4; g.beginPath(); g.arc(SOL.x, SOL.y, SOL.r, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#fff3a8"; g.beginPath(); g.arc(SOL.x - 12, SOL.y - 12, 14, 0, Math.PI * 2); g.fill(); g.restore();
    // brillos del mar
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const ph = (t * 0.6 + hash(i)) % 1, x = (hash(i + 2) * (W + 40) + t * 6) % (W + 40) - 20, y = 302 + hash(i + 5) * 32;
      g.globalAlpha = 0.9 * Math.sin(Math.PI * ph); g.beginPath(); g.moveTo(x - 5 - 4 * ph, y); g.lineTo(x + 5 + 4 * ph, y); g.stroke(); }
    g.restore();
    // gaviota planeando
    const u = ((t + 3) / 16) % 1, gx = -40 + u * (W + 80), gy = 150 + 18 * Math.sin(t * 0.8), al = Math.sin(t * 5) * 0.35;
    g.save(); g.translate(gx, gy); g.strokeStyle = "#ffffff"; g.lineWidth = 4.5; g.lineCap = "round"; g.lineJoin = "round";
    const ala = () => { g.beginPath(); g.moveTo(-16, -3 - 6 * al); g.quadraticCurveTo(-8, -10 - 4 * al, 0, 0); g.quadraticCurveTo(8, -10 - 4 * al, 16, -3 - 6 * al); };
    ala(); g.strokeStyle = TINTA; g.lineWidth = 6.5; g.stroke(); ala(); g.strokeStyle = "#ffffff"; g.lineWidth = 3.5; g.stroke();
    g.restore();
    // calima: ondas de calor sobre las baldosas
    g.save(); g.strokeStyle = "rgba(255,240,220,0.22)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.35 + i / 6) % 1, y = 470 - ph * 70, x0 = 60 + i * 160;
      g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); for (let k = 0; k <= 10; k++) { const x = x0 + k * 9, yy = y + 3 * Math.sin(k * 1.3 + t * 5 + i); if (k) g.lineTo(x, yy); else g.moveTo(x, yy); } g.stroke();
    }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const z1 = dentro(t, 3.2, 3.9, 6.1, 6.9), z2 = dentro(t, 9.3, 9.9, 12.0, 12.9);
    return { k: 1 + 0.035 * z1 + 0.04 * z2, x: 500 - 14 * z1 - 30 * z2, y: 304 + 8 * z1 + 10 * z2 };
  }

  class GuillermoHelado extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !CA.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = poses(t), { g: pG, c: pC } = P;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform(); ACTUAL = P;
      g.drawImage(fondo, -60, -50);
      vivos(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(90,30,10,0.32)";
      g.beginPath(); g.ellipse(XG + 4, SUELO + 2, 80, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pC.x, SUELO + 2, 56, 7, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      // plastas del suelo (detrás de los dos) y gotitas pegadas
      pintaGotitas(g, t, true);
      for (const cd of CAIDAS) if (!cd.zapato) plasta(g, cd, t);
      G.dibujar(g, pG, t);
      lengua(g, P.A.lengua);
      plasta(g, CAIDAS[3], t);
      CA.dibujar(g, pC, t);
      if (repintaManoG(t)) manoGEncima(g, pG);
      lengua(g, P.B.lengua);
      enElAire(g, t);
      pintaGotitas(g, t, false);
      impacto(g, t);
      corazones(g, t);
      risa(g, t, pC);
      const ojoG = G.aPantalla(pG, G.cabeza(pG).a({ x: 771, y: 548 }));
      destello(g, t, T.ilusion, ojoG.x + 4, ojoG.y - 6, 13);
      const ojoG2 = G.aPantalla(pG, G.cabeza(pG).a({ x: 894, y: 604 }));
      destello(g, t, T.ilusion + 0.08, ojoG2.x + 3, ojoG2.y - 5, 10);
      g.restore();
      MATRIZ = null;
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  // depuración: alcance de cada brazo (distancia hombro-muñeca / largo del brazo)
  function alcance(t) {
    const P = poses(t), o = {};
    for (const [nom, R, p, lado, L] of [["Gc", G, P.g, "cerca", G.BRAZO_C_L * S], ["Gl", G, P.g, "lejos", G.BRAZO_L * S],
      ["Cc", CA, P.c, "cerca", CA.BRAZO_C_L * KC], ["Cl", CA, P.c, "lejos", CA.BRAZO_L * KC]]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos, q = R.aPantalla(p, m), h = hombro(R, p, lado);
      const mu = p.espejo ? Math.PI - m.mu : m.mu, mw = { x: q.x + Math.cos(mu) * 13 * 2.6 * (p.espejo ? KC : S), y: q.y + Math.sin(mu) * 13 * 2.6 * (p.espejo ? KC : S) };
      o[nom] = +(Math.hypot(mw.x - h.x, mw.y - h.y) / L).toFixed(2);
    }
    return o;
  }
  registrar({ id: "00049", nombre: "Guillermo y Carla · El helado", crear: () => new GuillermoHelado() });
  window.__A2D_00049 = { pose: t => { const P = poses(t); return { g: P.g, c: P.c }; }, T, DUR, conos: t => { const P = poses(t); return { A: P.A.c, B: P.B.c }; }, alcance, suelta, CAIDAS };
})();
