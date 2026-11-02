"use strict";
/* 00078 · Guillermo y Gabacho · La ola
 *
 * Negro → un bar de fútbol de noche: barra de madera con grifos de cerveza, estantes de botellas
 * con espejo, bufandas a rayas y banderines (sin letras), una diana, lámparas verdes y, colgada
 * arriba a la derecha, una tele que solo enseña el verde del campo con puntitos que corren. Una
 * fila de taburetes altos, casi todos vacíos; en dos de ellos, Guillermo (con su pinta) y Gabacho.
 * Gabacho apura su cerveza y deja el vaso vacío en la barra → empieza él solo una ola: se levanta
 * con los brazos arriba y se sienta; la ola sigue por los taburetes vacíos (rayitas, el asiento se
 * hunde y rebota, como si los levantara un público invisible), da la vuelta… y muere en Guillermo,
 * que está bebiendo sin enterarse (bigote de espuma). Gabacho le mira y le anima con la mano: ¡arriba!
 * Guillermo asiente → 2.ª ola: da la vuelta otra vez, a Guillermo le pilla mirando la tele y se
 * levanta tarde: sus brazos suben justo cuando bajan los de Gabacho y chocan (¡bonk!, estrella) →
 * se sientan sacudiéndose la mano; se miran y cuentan con la cabeza: uno, dos, tres (a cada cabezada
 * aparece un puntito entre los dos) → 3.ª ola juntos: Guillermo se levanta tan deprisa que pega un
 * brinco y la pinta le sale disparada de la mano; sube dando vueltas, soltando una cinta de cerveza,
 * baja boca abajo con la cerveza por delante… y cae en el pelo rizado de Gabacho, que sigue con los
 * brazos arriba y los ojos cerrados: ¡chof!, corona de cerveza. El pelo se lo bebe como una esponja
 * (se oscurece, se aplasta y gotea, con un copete de espuma) y el vaso rebota por encima de su cabeza
 * y aterriza de pie en la barra (¡clinc!) → Gabacho, impasible, se sienta, mira a cámara, se inclina sobre su vaso
 * vacío y se escurre el pelo con las dos manos: un chorro de cerveza llena el vaso y los rizos
 * vuelven a su sitio de golpe (¡boing!) → brinda hacia Guillermo y se lo bebe con los ojos cerrados,
 * en la gloria (bigote de espuma) → Guillermo, verde, saca la lengua y mira a cámara con asco → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. El pelo mojado es el pelo del propio avatar
 * oscurecido (se pinta una vez en un lienzo aparte con «source-atop», sin leer píxeles) y aplastado
 * recortando la coronilla con un trazado; la piel verde de Guillermo, un tinte «multiply» sobre el
 * polígono de su piel (el mismo de las 00021, 00029 y 00048).
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, ruido, hash, campana } = M2;
  const G = Guillermo, B = Gabacho;
  const DUR = 14.25;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // Gabacho apura su cerveza y deja el vaso vacío en la barra
    bBebe: 0.4, bApura: 0.75, bBaja: 1.05, bDeja: 1.22, bDejado: 1.45,
    // 1.ª ola: la empieza Gabacho, da la vuelta por los taburetes vacíos y muere en Guillermo
    o1: 1.95, gSorbo: 2.5, gSorboFin: 3.15,
    bMira: 3.02, bAnima: 3.15, bAnimaFin: 3.85, gMira: 3.12, gAsiente: 3.45, gAsienteFin: 3.95,
    // 2.ª ola: Guillermo llega tarde y chocan
    o2: 4.3, gTurno: 5.3, gSusto: 5.33, o2b: 5.5, bonk: 5.62,
    // se recuperan
    sienta: 5.85, gSacude: 5.9, gSacudeFin: 6.45,
    // se sincronizan contando con la cabeza
    miran: 6.45, n1: 6.78, n2: 7.02, n3: 7.26,
    // 3.ª ola: el brinco y la pinta por los aires
    o3: 7.42, suelta: 7.6, gAterriza: 7.86, chof: 8.5, clinc: 9.5,
    bBaja3: 9.12, bSentado: 9.6, gSienta: 9.25, gSentado: 9.7, bCamara: 9.62,
    // se escurre el pelo en su vaso
    inclina: 9.92, manosPelo: 10.05, e1: 10.42, e2: 10.77, e3: 11.12, chorroFin: 11.3, boing: 11.32,
    // brinda y se lo bebe
    coge: 11.7, brinda: 12.02, bebe: 12.28, bebeFin: 12.78, ahh: 12.85,
    gAsco: 10.45, gCamara: 12.38,
    fin: 13.5
  };
  const TPASO = 0.2;                              // la ola pasa de un taburete al siguiente cada 0,2 s

  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  // subir y bajar en una ola (pico en tp)
  const subeBaja = (t, tp, sube = 0.3, baja = 0.34) => tramo(t, tp - sube, tp - 0.02) * (1 - tramo(t, tp + 0.06, tp + 0.06 + baja));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), MUSLO = D(0.7, 0.82, 0.78, 0.74, 0.7),
    VASO = D(0.35, 0.3, 0.3, 0.3, 0.3), PUNO = D(0, 0, 0, 0, 0), GARRA = D(0.6, 0.5, 0.45, 0.45, 0.45),
    ANIMA = D(0.9, 0.95, 0.95, 0.92, 0.9);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0, big: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: e.big };
  }
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.3, SUELO = 566;
  const XG = 432, XB = 600;                        // pelvis de cada uno, sentados
  const Y_ASIENTO = SUELO - 124, Y_PEL_S = Y_ASIENTO - 11, Y_ARO = SUELO - 46;
  const MOSTRADOR = 372;                           // canto delantero de la barra
  const TAB = [118, 276, XG - 12, XB - 12, 750, 906];   // taburetes (0, 1 vacíos; 2 Guillermo; 3 Gabacho; 4, 5 vacíos)
  // la ola recorre los taburetes en este orden (empieza en Gabacho y da la vuelta)
  const ORDEN = [3, 4, 5, 0, 1, 2];
  const pasoOla = (t0, i) => t0 + ORDEN.indexOf(i) * TPASO;
  const VASO_B = { x: 706, y: MOSTRADOR - 3 };     // vaso de Gabacho en la barra (base)
  const VASO_G2 = { x: 742, y: MOSTRADOR - 3 };    // donde aterriza la pinta de Guillermo
  const TV = { a: { x: 796, y: 72 }, b: { x: 978, y: 90 }, c: { x: 978, y: 184 }, d: { x: 796, y: 176 } };

  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;   // pelvis de pie (pantalla)
  const TOB_ALTO = rig => rig.TOBILLO_ALTO * S * rig.K;

  /* =====================================================================================
   * VASOS (pantalla): pinta de cristal; origen en el centro, eje hacia arriba (−y)
   * ===================================================================================== */
  const VH = 32, VW1 = 10.5, VW0 = 8;              // alto, media anchura arriba y abajo
  const ESC_V = 1;
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const contornoVaso = (g, m = 0) => {
    g.beginPath(); g.moveTo(-VW1 - m, -VH / 2 - m * 0.5); g.lineTo(VW1 + m, -VH / 2 - m * 0.5);
    g.lineTo(VW0 + m, VH / 2 - 3); g.quadraticCurveTo(VW0 + m, VH / 2 + m, VW0 - 3, VH / 2 + m);
    g.lineTo(-VW0 + 3, VH / 2 + m); g.quadraticCurveTo(-VW0 - m, VH / 2 + m, -VW0 - m, VH / 2 - 3); g.closePath();
  };
  // v = { x, y, ang, nivel (0…1 de cerveza), espuma (0…1), anillos (restos de espuma) }
  function dibVaso(g, v) {
    g.save(); g.translate(v.x, v.y); g.rotate(v.ang || 0); g.scale(ESC_V, ESC_V); g.lineJoin = "round"; g.lineCap = "round";
    // cristal (fondo)
    contornoVaso(g); g.fillStyle = "rgba(205,228,240,0.28)"; g.fill();
    // cerveza: la superficie se queda horizontal en el mundo
    const niv = clamp(v.nivel || 0), esp = clamp(v.espuma || 0);
    if (niv > 0.01 || esp > 0.01) {
      g.save(); contornoVaso(g, -1.6); g.clip();
      const yS = VH / 2 - 3 - (VH - 5) * niv;             // altura de la superficie sobre el eje del vaso
      const a = -(v.ang || 0);                           // vuelta al mundo
      g.rotate(a);
      const ys = yS * Math.cos(a);                       // altura de la superficie en ejes del mundo
      if (niv > 0.01) {
        const gr = g.createLinearGradient(0, ys, 0, ys + VH); gr.addColorStop(0, "#f7b52a"); gr.addColorStop(1, "#c8740c");
        g.fillStyle = gr; g.fillRect(-60, ys, 120, 80);
        // burbujitas que suben
        g.fillStyle = "rgba(255,240,200,0.65)";
        for (let i = 0; i < 6; i++) { const ph = (v.t * 0.7 + hash(i * 3.1)) % 1, bx = -8 + 16 * hash(i + 7);
          const by = ys + (1 - ph) * (VH * niv); g.beginPath(); g.arc(bx, by, 0.9 + 0.5 * hash(i), 0, Math.PI * 2); g.fill(); }
      }
      if (esp > 0.01) {
        const he = 7 * esp;
        g.fillStyle = "#fff6e0"; g.fillRect(-60, ys - he, 120, he + 1.2);
        g.fillStyle = "#ffffff";
        for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-14 + i * 5.6, ys - he, 2.6 * esp + 0.4, 0, Math.PI * 2); g.fill(); }
      }
      g.restore();
    }
    // restos de espuma en las paredes (vaso vacío)
    if ((v.anillos || 0) > 0.01) {
      g.save(); contornoVaso(g, -1.6); g.clip(); g.strokeStyle = `rgba(255,248,230,${0.55 * v.anillos})`; g.lineWidth = 1.4;
      for (const y of [-6, 4, 12]) { g.beginPath(); g.moveTo(-12, y); g.quadraticCurveTo(0, y + 2.5, 12, y - 1); g.stroke(); }
      g.restore();
    }
    // brillo y contorno
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-VW1 + 4, -VH / 2 + 5); g.lineTo(-VW0 + 3.5, VH / 2 - 6); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.4)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(VW1 - 4, -VH / 2 + 7); g.lineTo(VW0 - 3.5, VH / 2 - 10); g.stroke();
    contornoVaso(g); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(0, -VH / 2, VW1, 2.6, 0, 0, Math.PI * 2); g.lineWidth = 1.3; g.strokeStyle = "rgba(20,20,30,0.8)"; g.stroke();
    g.fillStyle = "rgba(200,225,240,0.5)"; g.beginPath(); g.ellipse(0, VH / 2 - 1, VW0 - 2, 2, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // borde de la boca del vaso más cercano a quien bebe (en el sistema del vaso)
  const BORDE_V = { x: -VW1 + 1, y: -VH / 2 };
  // centro del vaso para que el borde toque los labios con una inclinación dada
  const vasoEnBoca = (boca, ang) => { const r = rotP(BORDE_V, ang); return { x: boca.x - r.x, y: boca.y - r.y }; };

  /* =====================================================================================
   * POSTURAS
   * ===================================================================================== */
  // mano en pantalla → mano del muñeco (hoja)
  // codo siempre hacia fuera: a la izquierda el brazo cercano y a la derecha el lejano (el cambio de lado
  // se hace con el brazo estirado, por encima o por debajo del hombro, y no se nota)
  function manoRig(rig, p, m, lado, objeto, extra) {
    const h = rig.aHoja(p, m), hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const arriba = h.y < hom.y;
    const dobla = lado === "cerca" ? (arriba ? 1 : -1) : (arriba ? -1 : 1);
    return Object.assign({ x: h.x, y: h.y, ang: 0, mu: m.mu, puno: 1, dedos: m.d, dobla, objeto }, extra || {});
  }
  const enPant = (rig, p, q) => rig.aPantalla(p, rig.tronco(p)(q));
  const bocaPant = (rig, p) => rig.aPantalla(p, rig.boca(p));
  const cabezaPant = (rig, p, q) => rig.aPantalla(p, rig.cabeza(p).a(q));
  // cuerpo base: sentado (sube 0) o de pie (sube 1), con brinco y torso
  function cuerpo(rig, x, e) {
    const pyS = Y_PEL_S, pyP = PY_PIE(rig);
    const px = x + 12 * e.sube + (e.dx || 0), py = lerp(pyS, pyP, e.sube) - (e.salto || 0) + (e.dy || 0);
    const p = { x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: !!e.ikc,
      torso: e.torso || 0, torsoEsc: { x: 1, y: 1 + (e.respira || 0) * 0.004 }, piernas: {},
      cabeza: { ang: e.cab || 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    p.pelvis = rig.aHoja(p, { x: px, y: py });
    // pies: en el aro del taburete (sentado) o en el suelo delante de él (de pie)
    const ta = TOB_ALTO(rig), arco = Math.sin(Math.PI * clamp(e.sube)) * 16;
    // [x sentado (respecto a x), x de pie (respecto a la pelvis de pie)]
    const PIES = rig === G ? { cerca: [18, -16], lejos: [30, 18] } : { cerca: [16, -40], lejos: [32, 34] };
    for (const lado of ["cerca", "lejos"]) {
      const sx = x + PIES[lado][0], sy = Y_ARO - ta - (lado === "lejos" ? 3 : 0);
      const fx = x + 12 + PIES[lado][1], fy = SUELO - ta - (lado === "lejos" ? 2 : 0);
      let qx = lerp(sx, fx, e.sube), qy = lerp(sy, fy, e.sube) - arco - (e.salto || 0) * (e.piesAire ?? 1);
      if (e.pies && e.pies[lado]) { qx += e.pies[lado].dx || 0; qy += e.pies[lado].dy || 0; }
      const tob = rig.aHoja(p, { x: qx, y: qy });
      p.piernas[lado] = { tob, ang: lerp(0.22, 0, e.sube) + (e.puntillas || 0) * 0.35 };
    }
    return p;
  }

  /* ---------- la ola de cada uno: cuánto está de pie y con los brazos arriba ---------- */
  function olaB(t) {
    let s = Math.max(subeBaja(t, T.o1), subeBaja(t, T.o2), subeBaja(t, T.o2b, 0.3, 0.3));
    s = Math.max(s, tramo(t, T.o3 - 0.02, T.o3 + 0.3) * (1 - tramo(t, T.bBaja3, T.bSentado)));
    return s;
  }
  function olaG(t) {
    let s = subeBaja(t, T.bonk + 0.04, 0.28, 0.32);
    s = Math.max(s, tramo(t, T.o3 - 0.02, T.o3 + 0.16, salida) * (1 - tramo(t, T.gSienta, T.gSentado)));
    return s;
  }

  /* =====================================================================================
   * GABACHO (derecha, mira a la derecha, hacia la tele)
   * ===================================================================================== */
  const CARAS_B = {
    tele: E({ mx: 0.75, my: -0.55, c: 0.2, sd: 8, gd: 0.04, si: 8, gi: 0.04, sonr: 0.45 }),
    bebe: E({ mx: 0.4, my: -0.2, c: 0.85, h: 0.3, sd: 12, gd: 0.04, si: 12, gi: 0.04, sonr: 0.3, ancho: 0.7 }),
    ola: E({ mx: 0.6, my: -0.6, c: 0.65, h: 1, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 30, ancho: 1.1, sonr: 0.85 }),
    espera: E({ mx: 0.0, my: -0.15, c: 0.25, sd: 14, gd: 0.08, si: 14, gi: 0.08, sonr: 0.5, ancho: 0.95 }),
    reproche: E({ mx: -0.95, my: 0.15, c: 0.45, sd: -6, gd: -0.14, si: 18, gi: 0.12, sonr: -0.15, ancho: 0.8 }),
    anima: E({ mx: -0.95, my: 0.05, c: 0.15, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 22, ancho: 0.95, sonr: 0.6 }),
    au: E({ mx: -0.8, my: 0.1, c: 1, z: 1, sd: 12, gd: 0.2, si: 12, gi: 0.2, abre: 20, ancho: 0.9, sonr: -0.55 }),
    molesto: E({ mx: -0.95, my: 0.1, c: 0.4, sd: -8, gd: -0.16, si: -8, gi: -0.16, sonr: -0.25, ancho: 0.8 }),
    cuenta: E({ mx: -0.95, my: 0.05, c: 0.2, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.35, ancho: 0.85 }),
    gloria: E({ mx: 0.5, my: -0.5, c: 1, h: 1, sd: 20, gd: 0.06, si: 20, gi: 0.06, abre: 26, ancho: 1.05, sonr: 0.9 }),
    chof: E({ mx: 0, my: 0, c: 1, z: 0.4, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 0, ancho: 0.6, sonr: -0.25 }),
    impasible: E({ mx: -0.85, my: 0.05, c: 0.55, sd: 0, gd: 0, si: 2, gi: 0.02, abre: 0, ancho: 0.7, sonr: 0.0 }),
    escurre: E({ mx: 0.6, my: 0.7, c: 0.5, sd: 6, gd: 0.04, si: 10, gi: 0.06, abre: 0, ancho: 0.62, sonr: 0.2 }),
    brinda: E({ mx: -0.95, my: 0.05, c: 0.35, h: 0.4, sd: 16, gd: 0.06, si: 16, gi: 0.06, abre: 6, ancho: 1, sonr: 0.75 }),
    trago: E({ mx: 0.3, my: -0.3, c: 1, h: 0.5, sd: 14, gd: 0.05, si: 14, gi: 0.05, abre: 0, ancho: 0.62, sonr: 0.3 }),
    ahh: E({ mx: 0, my: 0, c: 1, h: 1, sd: 20, gd: 0.08, si: 20, gi: 0.08, abre: 24, ancho: 1.05, sonr: 0.8, big: 1 }),
    camara: E({ mx: -0.85, my: 0, c: 0.4, h: 0.5, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 4, ancho: 1, sonr: 0.85, big: 1 })
  };
  const GUION_CARA_B = [
    [T.bBebe - 0.05, T.bBebe + 0.15, "bebe"], [T.bBaja, T.bBaja + 0.2, "tele"],
    [T.o1 - 0.25, T.o1 - 0.1, "ola"], [T.o1 + 0.12, T.o1 + 0.4, "espera"], [T.bMira - 0.06, T.bMira + 0.12, "reproche"],
    [T.bAnima, T.bAnima + 0.12, "anima"], [T.bAnimaFin, T.bAnimaFin + 0.25, "tele"],
    [T.o2 - 0.25, T.o2 - 0.1, "ola"], [T.o2 + 0.15, T.o2 + 0.4, "tele"], [T.o2b - 0.28, T.o2b - 0.12, "ola"],
    [T.bonk - 0.02, T.bonk + 0.06, "au"], [T.sienta + 0.25, T.sienta + 0.45, "molesto"],
    [T.miran, T.miran + 0.2, "cuenta"], [T.o3 - 0.05, T.o3 + 0.15, "gloria"],
    [T.chof - 0.02, T.chof + 0.05, "chof"], [T.bCamara, T.bCamara + 0.2, "impasible"],
    [T.inclina, T.inclina + 0.3, "escurre"], [T.boing, T.boing + 0.15, "tele"],
    [T.coge, T.coge + 0.2, "brinda"], [T.bebe - 0.08, T.bebe + 0.08, "trago"],
    [T.ahh + 0.12, T.ahh + 0.32, "ahh"], [13.2, 13.45, "camara"]
  ];

  // Gabacho: pelo mojado (0…1) y aplastado
  const mojado = t => tramo(t, T.chof, T.chof + 0.3) * (1 - tramo(t, T.e1 - 0.05, T.chorroFin, s => s));
  const aplasta = t => tramo(t, T.chof, T.chof + 0.22, salida) * (1 - tramo(t, T.boing - 0.02, T.boing + 0.04));

  function poseB(t) {
    const ola = olaB(t);
    const resp = Math.sin(t * 2.1 + 0.4);
    // cuerpo: se inclina a la tele al animar; al escurrirse, se inclina sobre su vaso
    const incl = dentro(t, T.inclina, T.inclina + 0.35, T.chorroFin + 0.1, T.boing + 0.35);
    const anima = dentro(t, T.bAnima - 0.08, T.bAnima + 0.12, T.bAnimaFin, T.bAnimaFin + 0.2);
    const bebeAl = Math.max(dentro(t, T.bebe - 0.2, T.bebe, T.bebeFin, T.bebeFin + 0.25), dentro(t, T.bBebe - 0.2, T.bBebe, T.bApura, T.bBaja));
    const e = { sube: ola, salto: 6 * Math.max(campana(t, T.o1 - 0.12, T.o1 + 0.12), campana(t, T.o2 - 0.12, T.o2 + 0.12)), respira: resp,
      torso: 0.04 - 0.05 * ola - 0.06 * anima + 0.36 * incl - 0.06 * bebeAl, cab: 0.02 - 0.08 * ola - 0.1 * anima + 0.28 * incl - 0.22 * bebeAl,
      puntillas: 0.5 * ola * (t > T.o3 - 0.1 && t < T.bBaja3 ? 1 : 0.5), ikc: true };
    // cabeceo al contar
    const nod = [T.n1, T.n2, T.n3].reduce((a, tn) => a + campana(t, tn - 0.1, tn + 0.14), 0);
    e.cab += 0.2 * nod; e.torso += 0.03 * nod;
    // ¡bonk!: retrocede
    const golpe = campana(t, T.bonk, T.bonk + 0.3);
    e.torso += 0.06 * golpe; e.cab += 0.1 * golpe;
    const p = cuerpo(B, XB, e);
    // ¡boing! los rizos vuelven a su sitio: la cabeza da un estirón
    const bo = fase(t, T.boing, T.boing + 0.55);
    if (bo > 0 && bo < 1) { const w = Math.sin(bo * Math.PI * 4) * (1 - bo); p.cabeza.esc = { x: 1 - 0.035 * w, y: 1 + 0.06 * w }; }
    const ex = guion(GUION_CARA_B, CARAS_B, "tele", t);
    // cuenta: mira a Guillermo y la boca acompaña cada cabezada
    ex.abre += 8 * nod * tramo(t, T.miran, T.miran + 0.2);
    // ¡ahh! con la boca: vibra
    p.cara = cara(ex, parpadeo(t, [0.3, 2.6, 3.95, 6.1, 7.05, 9.85, 11.5, 13.0]));
    p.mojado = mojado(t); p.aplasta = aplasta(t);
    manosB(p, t, ola);
    p.capaCabeza = (g, tt) => capaCabezaB(g, tt, p);
    return p;
  }

  // brazos de la ola (pantalla, relativos al hombro): reposo → por fuera → arriba
  const bez = (a, c, b, k) => ({ x: (1 - k) * (1 - k) * a.x + 2 * (1 - k) * k * c.x + k * k * b.x, y: (1 - k) * (1 - k) * a.y + 2 * (1 - k) * k * c.y + k * k * b.y });
  function brazoOla(rest, hom, arriba, fuera, k, muR, muA) {
    const a = bez(rest, { x: hom.x + fuera.x, y: hom.y + fuera.y }, { x: hom.x + arriba.x, y: hom.y + arriba.y }, k);
    return { x: a.x, y: a.y, mu: lerp(muR, muA, k) };
  }

  function manosB(p, t, ola) {
    const P = q => enPant(B, p, q);
    const hC = P(B.HOMBRO_C), hL = P(B.HOMBRO), boca = bocaPant(B, p);
    const pel = B.aPantalla(p, p.pelvis);
    // reposo: manos sobre los muslos
    const restC = { x: pel.x + 30, y: pel.y - 6, mu: -1.95, d: MUSLO }, restL = { x: pel.x + 52, y: pel.y - 12, mu: -1.4, d: MUSLO };
    // brazos de la ola (con un pelín de retraso respecto al cuerpo)
    const kb = ola <= 0 ? 0 : clamp(ola * 1.15 - 0.08);
    const k3 = t > T.o3 - 0.1 && t < T.bSentado ? 1 : 0;      // en la 3.ª ola, los brazos más abiertos (las manos no tapan el pelo)
    const arC = { x: lerp(-38, -52, k3), y: lerp(-100, -84, k3) }, arL = { x: lerp(30, 46, k3), y: lerp(-100, -86, k3) };
    let c = brazoOla(restC, hC, arC, { x: -60, y: -20 }, kb, -1.95, 1.75);
    let l = brazoOla(restL, hL, arL, { x: 60, y: -10 }, kb, -1.4, -4.65);
    c.d = mezclaD(MUSLO, ABIERTA, kb); l.d = mezclaD(MUSLO, ABIERTA, kb);
    // agitar las manos arriba (pura alegría)
    const ag = kb * 0.6;
    c.x += 3 * Math.sin(t * 22) * ag; l.x += 3 * Math.sin(t * 22 + 1) * ag;

    // apura la cerveza al principio (mano lejana con el vaso) y lo deja en la barra
    let objL = null;
    if (t < T.bDejado + 0.1) {
      const enB = vasoEnBoca(boca, -1.0);
      const PL = [
        [0, 0, { x: pel.x + 46, y: pel.y - 40, mu: -1.55, d: VASO }],
        [T.bBebe - 0.25, T.bBebe, { x: enB.x, y: enB.y + 4, mu: 1.15, d: VASO }],
        [T.bBebe, T.bApura, (tt) => { const q = vasoEnBoca(bocaPant(B, p), pistaN([[0, 0, -1.0], [T.bBebe, T.bApura, -1.5]], tt)); return { x: q.x, y: q.y, mu: 1.1, d: VASO }; }],
        [T.bBaja - 0.05, T.bDeja, { x: VASO_B.x, y: VASO_B.y - VH / 2, mu: -2.2, d: VASO }],
        [T.bDeja, T.bDejado, restL]
      ];
      const m = pista(PL, t);
      l = m;
      if (t < T.bDeja + 0.02) {
        const ang = pistaN([[0, 0, 0], [T.bBebe - 0.25, T.bBebe, -1.0], [T.bBebe, T.bApura, -1.5], [T.bBaja - 0.05, T.bDeja, 0]], t, true);
        const niv = 0.18 * (1 - tramo(t, T.bBebe, T.bApura));
        objL = { x: m.x, y: m.y, ang, nivel: niv, espuma: 0.3 * (1 - tramo(t, T.bBebe, T.bApura)), anillos: 1, t };
      }
    }
    // ¡arriba! mano cercana: palma hacia arriba, dos impulsos
    const an = dentro(t, T.bAnima - 0.1, T.bAnima + 0.1, T.bAnimaFin - 0.1, T.bAnimaFin + 0.15);
    if (an > 0) {
      const imp = Math.abs(Math.sin((t - T.bAnima) * Math.PI / 0.33));
      const q = { x: hC.x - 36, y: hC.y + 44 - 20 * imp, mu: 0.3, d: ANIMA };
      c = { x: lerp(c.x, q.x, an), y: lerp(c.y, q.y, an), mu: lerp(c.mu, q.mu, an), d: mezclaD(c.d, q.d, an) };
    }
    // ¡bonk!: el antebrazo cercano baja por el punto del choque y rebota
    const bk = campana(t, T.bonk - 0.12, T.bonk + 0.22);
    if (t > T.bonk - 0.14 && t < T.bonk + 0.6) {
      const Q = puntoBonk();
      const kq = tramo(t, T.bonk - 0.14, T.bonk, entrada) * (1 - tramo(t, T.bonk + 0.02, T.bonk + 0.5));
      c = { x: lerp(c.x, Q.x + 10, kq) - 14 * campana(t, T.bonk, T.bonk + 0.3), y: lerp(c.y, Q.y - 6, kq) - 12 * campana(t, T.bonk, T.bonk + 0.3),
        mu: lerp(c.mu, 0.9, kq), d: mezclaD(c.d, D(0.3, 0.2), bk) };
    }
    // después del golpe: sacude la mano cercana un momento
    const sac = dentro(t, T.sienta, T.sienta + 0.1, T.miran - 0.1, T.miran + 0.1);
    if (sac > 0) { c = { x: lerp(c.x, hC.x - 4, sac) + 5 * Math.sin(t * 34) * sac, y: lerp(c.y, hC.y + 46, sac), mu: lerp(c.mu, -1.2, sac), d: mezclaD(c.d, RELAJADA, sac) }; }

    // escurrirse el pelo: las dos manos a los lados de la melena, retorciendo
    const es = dentro(t, T.manosPelo - 0.12, T.manosPelo + 0.22, T.chorroFin, T.boing + 0.15);
    if (es > 0) {
      const H = B.cabeza(p), at = q => B.aPantalla(p, H.a(q));
      const wr = Math.max(campana(t, T.e1 - 0.14, T.e1 + 0.16), campana(t, T.e2 - 0.14, T.e2 + 0.16), campana(t, T.e3 - 0.14, T.e3 + 0.16));
      const qC = at({ x: 590 + 40 * wr, y: 560 }), qL = at({ x: 1062 - 40 * wr, y: 520 });
      const cc = { x: qC.x, y: qC.y, mu: 1.9 - 0.3 * wr, d: mezclaD(GARRA, PUNO, wr) }, ll = { x: qL.x, y: qL.y, mu: 1.2 + 0.3 * wr, d: mezclaD(GARRA, PUNO, wr) };
      c = { x: lerp(c.x, cc.x, es), y: lerp(c.y, cc.y, es), mu: lerp(c.mu, cc.mu, es), d: mezclaD(c.d, cc.d, es) };
      l = { x: lerp(l.x, ll.x, es), y: lerp(l.y, ll.y, es), mu: lerpAng(l.mu, ll.mu, es), d: mezclaD(l.d, ll.d, es) };
    }
    // coge su vaso lleno, brinda y se lo bebe
    if (t > T.coge - 0.3) {
      const enB2 = vasoEnBoca(boca, pistaN([[0, 0, -0.75], [T.bebe, T.bebeFin, -1.45]], t));
      const PL = [
        [0, 0, l],
        [T.coge - 0.3, T.coge, { x: VASO_B.x, y: VASO_B.y - VH / 2, mu: -2.0, d: VASO }],
        [T.coge + 0.02, T.brinda, { x: hL.x + 22, y: hL.y - 30, mu: 1.9, d: VASO }],
        [T.brinda + 0.1, T.bebe, { x: enB2.x, y: enB2.y, mu: 1.15, d: VASO }],
        [T.bebe, T.bebeFin, (tt) => { const q = vasoEnBoca(bocaPant(B, p), pistaN([[0, 0, -0.75], [T.bebe, T.bebeFin, -1.45]], tt)); return { x: q.x, y: q.y, mu: 1.1, d: VASO }; }],
        [T.ahh, T.ahh + 0.35, { x: pel.x + 50, y: pel.y - 44, mu: -1.6, d: VASO }]
      ];
      const m = pista(PL, t);
      l = m;
      if (t >= T.coge - 0.02) {
        const ang = pistaN([[0, 0, 0], [T.coge + 0.02, T.brinda, -0.12], [T.brinda + 0.1, T.bebe, -0.75], [T.bebe, T.bebeFin, -1.45], [T.ahh, T.ahh + 0.35, 0]], t, true);
        const niv = 0.82 * (1 - tramo(t, T.bebe, T.bebeFin, s => s)) + 0.04;
        objL = { x: m.x, y: m.y, ang, nivel: niv, espuma: 1 - 0.7 * tramo(t, T.bebe, T.bebeFin), anillos: 1, t };
      }
    }
    // brindis: golpecito del vaso hacia Guillermo
    p.vasoB = objL;
    p.manoCerca = manoRig(B, p, c, "cerca", null);
    p.manoLejos = manoRig(B, p, l, "lejos", objL ? (g => conCamara(g, () => dibVaso(g, objL))) : null);
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    tele: E({ mx: 0.8, my: -0.5, c: 0.15, sd: 6, gd: 0.03, si: 8, gi: 0.04, sonr: 0.35 }),
    sorbo: E({ mx: 0.6, my: -0.4, c: 0.75, h: 0.3, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.2, ancho: 0.7 }),
    bigote: E({ mx: 0.95, my: 0.05, c: 0.1, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 4, ancho: 0.9, sonr: 0.3, big: 1 }),
    asiente: E({ mx: 0.95, my: 0.05, c: 0.25, h: 0.5, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 10, ancho: 1, sonr: 0.8, big: 0.6 }),
    tele2: E({ mx: 0.8, my: -0.55, c: 0.1, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 6, ancho: 0.85, sonr: 0.5 }),
    susto: E({ mx: 0.95, my: 0.1, iris: 0.85, c: 0, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 18, ancho: 0.7, sonr: -0.1 }),
    au: E({ mx: 0.6, my: 0.1, c: 1, z: 1, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 22, ancho: 0.95, sonr: -0.6 }),
    sopla: E({ mx: 0.6, my: 0.5, c: 0.5, sd: 12, gd: 0.15, si: 12, gi: 0.15, abre: 8, ancho: 0.4, sonr: -0.2, mof: 0.5 }),
    cuenta: E({ mx: 0.95, my: 0.05, c: 0.2, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.45, ancho: 0.9 }),
    brinco: E({ mx: 0.5, my: -0.6, c: 0.4, h: 1, sd: 22, gd: 0.08, si: 22, gi: 0.08, abre: 32, ancho: 1.1, sonr: 0.9 }),
    mano: E({ mx: -0.2, my: -0.7, c: 0, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 10, ancho: 0.6, sonr: -0.05 }),
    sigue: E({ mx: 0.8, my: -0.8, iris: 0.9, c: 0, sd: 26, gd: 0.16, si: 26, gi: 0.16, abre: 16, ancho: 0.6, sonr: -0.15 }),
    horror: E({ mx: 0.95, my: -0.3, iris: 0.8, c: 0, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 30, ancho: 0.6, sonr: -0.4 }),
    culpa: E({ mx: 0.95, my: 0.2, c: 0.35, sd: 18, gd: 0.22, si: 18, gi: 0.22, abre: 0, ancho: 0.75, sonr: -0.3 }),
    asco: E({ mx: 0.95, my: 0.05, c: 0.6, z: 0.7, sd: -4, gd: -0.1, si: 16, gi: 0.12, abre: 10, ancho: 0.8, sonr: -0.6 }),
    puaj: E({ mx: -0.85, my: 0.05, c: 0.5, z: 0.6, sd: 6, gd: 0.04, si: 20, gi: 0.14, abre: 16, ancho: 0.85, sonr: -0.7, lengua: 1 })
  };
  const GUION_CARA_G = [
    [T.gSorbo - 0.1, T.gSorbo + 0.1, "sorbo"], [T.gSorboFin - 0.05, T.gSorboFin + 0.12, "bigote"],
    [T.gAsiente, T.gAsiente + 0.12, "asiente"], [T.gAsienteFin + 0.1, T.gAsienteFin + 0.35, "tele2"],
    [T.gSusto - 0.02, T.gSusto + 0.06, "susto"], [T.bonk - 0.02, T.bonk + 0.05, "au"], [T.gSacude + 0.1, T.gSacude + 0.3, "sopla"],
    [T.miran - 0.05, T.miran + 0.2, "cuenta"], [T.o3 - 0.05, T.o3 + 0.1, "brinco"], [T.gAterriza + 0.05, T.gAterriza + 0.2, "mano"],
    [T.gAterriza + 0.3, T.gAterriza + 0.45, "sigue"], [T.chof - 0.05, T.chof + 0.08, "horror"], [T.gSienta, T.gSienta + 0.3, "culpa"],
    [T.gAsco, T.gAsco + 0.3, "asco"], [T.gCamara - 0.05, T.gCamara + 0.2, "puaj"]
  ];
  const verde = t => tramo(t, T.gAsco + 0.4, T.gCamara + 0.3);

  // la pinta de Guillermo: en la mano hasta que la suelta en el brinco
  function nivelG(t) { return 0.82 - 0.14 * tramo(t, T.gSorbo + 0.15, T.gSorboFin - 0.1); }

  function poseG(t) {
    const ola = olaG(t);
    const resp = Math.sin(t * 2.4);
    const salto = 34 * campana(t, T.o3 + 0.02, T.gAterriza);
    const sorbo = dentro(t, T.gSorbo - 0.25, T.gSorbo + 0.05, T.gSorboFin - 0.1, T.gSorboFin + 0.15);
    const asco = tramo(t, T.gAsco, T.gAsco + 0.3);
    const e = { sube: ola, salto, piesAire: 1, respira: resp, ikc: true,
      torso: 0.05 - 0.05 * ola - 0.05 * sorbo - 0.06 * asco, cab: 0.03 - 0.08 * ola - 0.16 * sorbo - 0.08 * asco,
      puntillas: 0.4 * ola };
    // asiente con ganas; cabezadas al contar
    e.cab += 0.13 * Math.max(0, Math.sin((t - T.gAsiente) * 14)) * dentro(t, T.gAsiente, T.gAsiente + 0.05, T.gAsienteFin - 0.05, T.gAsienteFin);
    const nod = [T.n1, T.n2, T.n3].reduce((a, tn) => a + campana(t, tn - 0.1, tn + 0.14), 0);
    e.cab += 0.2 * nod; e.torso += 0.03 * nod;
    // se da cuenta tarde: respingo
    e.cab -= 0.08 * campana(t, T.gSusto - 0.02, T.gSusto + 0.2);
    const golpe = campana(t, T.bonk, T.bonk + 0.3);
    e.torso -= 0.05 * golpe; e.cab -= 0.08 * golpe;
    // escalofrío de asco
    const esc = dentro(t, T.gCamara, T.gCamara + 0.1, 13.3, 13.6);
    e.torso += 0.015 * Math.sin(t * 38) * esc;
    const p = cuerpo(G, XG, e);
    const ex = guion(GUION_CARA_G, CARAS_G, "tele", t);
    // el bigote de espuma se va (se relame)
    ex.big *= 1 - tramo(t, T.gAsienteFin - 0.1, T.gAsienteFin + 0.25);
    p.cara = cara(ex, parpadeo(t, [0.55, 1.6, 4.1, 4.75, 6.3, 9.0, 11.2, 12.1]));
    p.sudor = 0.7 * dentro(t, T.chof + 0.1, T.chof + 0.3, T.gSentado + 0.2, T.gSentado + 0.6);
    p.verde = verde(t);
    manosG(p, t, ola);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }

  function manosG(p, t, ola) {
    const P = q => enPant(G, p, q);
    const hC = P(G.HOMBRO_C), hL = P(G.HOMBRO), boca = bocaPant(G, p);
    const pel = G.aPantalla(p, p.pelvis);
    // reposo: la pinta en la mano cercana, sobre el muslo; la otra en la rodilla
    const restC = { x: pel.x + 26, y: pel.y - 26, mu: -2.1, d: VASO }, restL = { x: pel.x + 56, y: pel.y - 10, mu: -1.35, d: MUSLO };
    const kb = ola <= 0 ? 0 : clamp(ola * 1.15 - 0.08);
    let c = brazoOla(restC, hC, { x: -36, y: -78 }, { x: -50, y: -10 }, kb, -2.1, 1.75);
    let l = brazoOla(restL, hL, { x: 50, y: -60 }, { x: 56, y: 10 }, kb, -1.35, -3.95);
    c.d = VASO; l.d = mezclaD(MUSLO, ABIERTA, kb);
    // sorbo: la pinta a los labios
    const sorbo = dentro(t, T.gSorbo - 0.25, T.gSorbo + 0.05, T.gSorboFin - 0.1, T.gSorboFin + 0.15);
    let angV = 0;
    if (sorbo > 0) {
      const a = lerp(-0.55, -0.85, tramo(t, T.gSorbo, T.gSorboFin - 0.1));
      const q = vasoEnBoca(boca, a);
      c = { x: lerp(c.x, q.x, sorbo), y: lerp(c.y, q.y, sorbo), mu: lerp(c.mu, 2.6, sorbo), d: VASO };
      angV = a * sorbo;
    }
    // ¡bonk! la mano lejana sube tarde y choca con el antebrazo de Gabacho
    if (t > T.bonk - 0.3 && t < T.bonk + 0.6) {
      const Q = puntoBonk();
      const kq = tramo(t, T.bonk - 0.3, T.bonk, salida) * (1 - tramo(t, T.bonk + 0.02, T.bonk + 0.45));
      l = { x: lerp(l.x, Q.x - 8, kq) - 10 * campana(t, T.bonk, T.bonk + 0.3), y: lerp(l.y, Q.y + 6, kq) + 14 * campana(t, T.bonk, T.bonk + 0.3),
        mu: lerpAng(l.mu, 2.2, kq), d: mezclaD(l.d, D(0.6, 1, 1, 1, 1), kq) };
    }
    // después: sacude la mano lejana y se la sopla
    const sac = dentro(t, T.gSacude, T.gSacude + 0.1, T.gSacudeFin, T.gSacudeFin + 0.15);
    if (sac > 0) { const q = { x: boca.x + 26, y: boca.y + 18, mu: 1.9, d: D(0.5, 0.95, 0.9, 0.85, 0.8) };
      l = { x: lerp(l.x, q.x, sac) + 4 * Math.sin(t * 40) * sac, y: lerp(l.y, q.y, sac) + 3 * Math.sin(t * 31) * sac, mu: lerp(l.mu, q.mu, sac), d: mezclaD(l.d, q.d, sac) }; }
    // 3.ª ola: el latigazo de la mano cercana; suelta la pinta
    const suelta = t >= T.suelta;
    if (t > T.o3 - 0.05 && t < T.gSienta + 0.3) {
      c.d = suelta ? mezclaD(VASO, ABIERTA, tramo(t, T.suelta, T.suelta + 0.08)) : VASO;
      // tras aterrizar, se mira la mano vacía
      const mira = dentro(t, T.gAterriza + 0.02, T.gAterriza + 0.2, T.gAterriza + 0.4, T.gAterriza + 0.6);
      c = { x: lerp(c.x, hC.x + 14, mira), y: lerp(c.y, hC.y - 36, mira), mu: lerp(c.mu, 1.3, mira), d: mezclaD(c.d, ABIERTA, mira) };
      // horror: las manos a la cara
      const hor = dentro(t, T.chof - 0.05, T.chof + 0.15, T.gSienta, T.gSienta + 0.35);
      const cara0 = cabezaPant(G, p, { x: 600, y: 730 }), cara1 = cabezaPant(G, p, { x: 980, y: 700 });
      c = { x: lerp(c.x, cara0.x - 4, hor), y: lerp(c.y, cara0.y, hor), mu: lerp(c.mu, 1.6, hor), d: mezclaD(c.d, ABIERTA, hor) };
      l = { x: lerp(l.x, cara1.x + 6, hor), y: lerp(l.y, cara1.y + 4, hor), mu: lerpAng(l.mu, 2.0, hor), d: mezclaD(l.d, ABIERTA, hor) };
    }
    // ya sentado, sin vaso: manos en los muslos; asco: la mano lejana delante de la boca
    if (t > T.gSienta) {
      const k = tramo(t, T.gSienta + 0.1, T.gSentado + 0.1);
      const rc = { x: pel.x + 30, y: pel.y - 8, mu: -1.95, d: MUSLO };
      c = { x: lerp(c.x, rc.x, k), y: lerp(c.y, rc.y, k), mu: lerp(c.mu, rc.mu, k), d: mezclaD(c.d, rc.d, k) };
      l = { x: lerp(l.x, restL.x, k), y: lerp(l.y, restL.y, k), mu: lerpAng(l.mu, restL.mu, k), d: mezclaD(l.d, restL.d, k) };
      const ar = dentro(t, T.gAsco + 0.1, T.gAsco + 0.35, T.gCamara - 0.05, T.gCamara + 0.2);
      const qa = { x: boca.x + 18, y: boca.y + 22, mu: 1.95, d: D(0.4, 0.85, 0.8, 0.75, 0.7) };
      l = { x: lerp(l.x, qa.x, ar), y: lerp(l.y, qa.y, ar), mu: lerpAng(l.mu, qa.mu, ar), d: mezclaD(l.d, qa.d, ar) };
    }
    // la pinta (hasta que sale volando)
    let obj = null;
    if (!suelta) obj = { x: c.x, y: c.y, ang: angV + 0.12 * Math.sin(t * 9) * campana(t, T.bonk, T.bonk + 0.5), nivel: nivelG(t), espuma: 0.9, anillos: 0.6, t };
    p.vasoG = obj;
    p.manoCerca = manoRig(G, p, c, "cerca", obj ? (g => conCamara(g, () => dibVaso(g, obj))) : null);
    p.manoLejos = manoRig(G, p, l, "lejos", null);
  }

  // punto del choque de manos (pantalla): entre los dos, por encima de los hombros
  let BONK = null;
  function puntoBonk() {
    if (!BONK) BONK = { x: 520, y: 262 };
    return BONK;
  }

  /* =====================================================================================
   * PISTAS DE MANOS
   * ===================================================================================== */
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  const mezclaM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerp(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k) });
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaM(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  function pistaN(lista, t, ang) {
    let v = lista[0][2];
    for (let i = 1; i < lista.length; i++) { const [t0, t1, obj, f] = lista[i]; if (t <= t0) break; const k = (f || suave)(fase(t, t0, t1)); v = ang ? lerpAng(v, obj, k) : lerp(v, obj, k); }
    return v;
  }

  /* =====================================================================================
   * LA PINTA POR LOS AIRES
   * ===================================================================================== */
  const GRAV = 1000;
  let VUELO = null;
  function vuelo() {
    if (VUELO) return VUELO;
    const pg = poseG(T.suelta - 1e-4), R = { x: pg.vasoG.x, y: pg.vasoG.y };
    // cae boca abajo sobre la coronilla de Gabacho
    const pb = poseB(T.chof), C = cabezaPant(B, pb, { x: 800, y: 222 });
    const Tf = T.chof - T.suelta, L = { x: C.x - 2, y: C.y - VH / 2 + 4 };
    const vx = (L.x - R.x) / Tf, vy = (L.y - R.y - 0.5 * GRAV * Tf * Tf) / Tf;
    // rebote: de la coronilla a la barra, de pie
    const Tb = T.clinc - T.chof, F = { x: VASO_G2.x, y: VASO_G2.y - VH / 2 };
    const ux = (F.x - L.x) / Tb, uy = (F.y - L.y - 0.5 * GRAV * Tb * Tb) / Tb;
    VUELO = { R, L, F, Tf, vx, vy, Tb, ux, uy, C };
    return VUELO;
  }
  // estado de la pinta de Guillermo fuera de la mano
  function pintaLibre(t) {
    if (t < T.suelta) return null;
    const V = vuelo();
    if (t < T.chof) {
      const u = t - T.suelta, k = u / V.Tf;
      return { x: V.R.x + V.vx * u, y: V.R.y + V.vy * u + 0.5 * GRAV * u * u, ang: Math.PI * 3 * salida(k) * 0.98 + 0.02 * k, fase: "vuela", k };
    }
    if (t < T.clinc) {
      const u = t - T.chof, k = u / V.Tb;
      return { x: V.L.x + V.ux * u, y: V.L.y + V.uy * u + 0.5 * GRAV * u * u, ang: Math.PI * (1 + 3 * salida(k)), fase: "rebota", k };
    }
    const u = t - T.clinc, w = 0.16 * Math.exp(-u * 6) * Math.sin(u * 30);
    // balanceo sobre el canto de la base
    const piv = { x: V.F.x + (w > 0 ? VW0 : -VW0), y: V.F.y + VH / 2 };
    const c = rotP({ x: V.F.x - piv.x, y: V.F.y - piv.y }, w);
    return { x: piv.x + c.x, y: piv.y + c.y, ang: w, fase: "barra", k: 1 };
  }

  /* =====================================================================================
   * CAPAS DE LA CARA (coordenadas del retrato)
   * ===================================================================================== */
  // Guillermo: piel verde de asco y lengua fuera
  const PIEL = [956,503,938,501,918,520,896,531,895,526,907,504,907,491,894,491,867,505,845,509,873,470,873,457,854,448,853,442,830,439,824,431,801,432,799,438,779,437,729,464,736,428,723,428,679,454,676,477,649,496,635,536,629,543,624,542,619,526,589,500,572,499,556,507,544,522,531,568,530,593,539,614,572,657,572,664,527,801,521,812,492,833,492,853,738,853,738,847,704,811,705,806,741,830,769,840,767,853,801,853,802,845,812,843,822,835,907,719,932,645,954,612,954,594,892,588,891,583,896,578,941,581,947,587,960,586,964,518,957,516];
  function rutaPiel(g) { g.moveTo(PIEL[0], PIEL[1]); for (let i = 2; i < PIEL.length; i += 2) g.lineTo(PIEL[i], PIEL[i + 1]); g.closePath(); }
  const BOCA_G = { x: 803, y: 730 }, BOCA_G_ANG = 0.26;
  function capaCabezaG(g, t, p) {
    const k = p.verde || 0;
    if (k > 0.01) {
      g.save(); g.beginPath(); rutaPiel(g); g.clip(); g.beginPath(); g.rect(560, 400, 460, 470); g.clip();
      g.globalCompositeOperation = "multiply"; g.fillStyle = `rgba(150,215,120,${0.55 * k})`; g.fillRect(480, 400, 560, 470);
      g.restore();
      // lengua fuera (¡puaj!)
      const lg = tramo(t, T.gCamara, T.gCamara + 0.2) * (1 - tramo(t, 13.6, 13.9));
      if (lg > 0.01) {
        g.save(); g.translate(BOCA_G.x + 4, BOCA_G.y + 14); g.rotate(BOCA_G_ANG + 0.08 * Math.sin(t * 9));
        const L = 44 * lg;
        g.beginPath(); g.moveTo(-26, -4); g.bezierCurveTo(-28, L * 0.8, -12, L + 10, 4, L + 8); g.bezierCurveTo(22, L + 6, 30, L * 0.7, 26, -4); g.closePath();
        g.fillStyle = "#e0655c"; g.fill(); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke();
        g.strokeStyle = "rgba(120,30,30,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 6); g.lineTo(2, L * 0.75); g.stroke();
        g.restore();
      }
    }
  }

  // Gabacho: pelo mojado (oscuro, brillante, aplastado), espuma encima y bigote de espuma al final
  // Contorno de la cara (piel y orejas) en el retrato: lo que no es pelo
  const CARA_B = [[586,532],[612,512],[648,500],[690,462],[742,440],[800,426],[858,428],[918,440],[968,460],[1004,492],[1012,560],[998,622],[962,682],[912,732],[832,770],[740,748],[662,708],[624,650],[592,612]];
  // silueta de arriba del pelo (para aplastar la coronilla) y su centro
  const COPA = [[500,500],[512,410],[548,330],[606,268],[690,226],[790,210],[892,220],[972,250],[1036,300],[1082,366],[1104,440]];
  const CEN_PELO = { x: 800, y: 470 };
  let PELO_MOJADO = null;
  function peloMojado() {
    if (PELO_MOJADO) return PELO_MOJADO;
    const pz = B.A.datos.piezas.cabeza, f = 0.5, w = Math.ceil(pz.tam_hoja[0] * f), h = Math.ceil(pz.tam_hoja[1] * f);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const o = c.getContext("2d");
    o.scale(f, f); o.translate(-pz.origen[0], -pz.origen[1]);
    Recortes.pieza(o, B.A, "cabeza");
    // solo el pelo: se oscurece donde hay píxeles y fuera de la cara
    const fueraCara = () => { o.beginPath(); o.rect(0, 0, 2000, 2000); o.moveTo(CARA_B[0][0], CARA_B[0][1]); for (const [x, y] of CARA_B.slice(1)) o.lineTo(x, y); o.closePath(); };
    o.globalCompositeOperation = "source-atop";
    o.save(); fueraCara(); o.clip("evenodd");
    o.fillStyle = "rgba(30,14,6,0.62)"; o.fillRect(0, 0, 2000, 2000);
    // brillos de pelo mojado (rizos lacios y relucientes)
    o.strokeStyle = "rgba(255,226,170,0.55)"; o.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      const x = 540 + hash(i * 3.7) * 540, y = 240 + hash(i * 5.3) * 400, r = 14 + 14 * hash(i + 2);
      o.lineWidth = 4 + 3 * hash(i + 9); o.beginPath(); o.arc(x, y, r, Math.PI * (1.05 + 0.2 * hash(i)), Math.PI * (1.6 + 0.2 * hash(i + 1))); o.stroke();
    }
    o.restore();
    // fuera la cara: el lienzo queda solo con el pelo
    o.globalCompositeOperation = "destination-out";
    o.beginPath(); o.moveTo(CARA_B[0][0], CARA_B[0][1]); for (const [x, y] of CARA_B.slice(1)) o.lineTo(x, y); o.closePath(); o.fill();
    PELO_MOJADO = { c, x: pz.origen[0], y: pz.origen[1], w: pz.tam_hoja[0], h: pz.tam_hoja[1] };
    return PELO_MOJADO;
  }
  // coronilla aplastada: cuánto baja cada punto de la silueta
  const bajaCopa = (x, k) => 64 * k * Math.pow(clamp(Math.sin(Math.PI * (x - 540) / (1080 - 540))), 0.9);
  function copaAplastada(k) {
    const pts = [];
    for (let i = 0; i <= 28; i++) {
      const u = i / 28, x = lerp(520, 1090, u);
      // y de la silueta original por interpolación de COPA (en x)
      let y = COPA[0][1];
      for (let j = 1; j < COPA.length; j++) if (x <= COPA[j][0]) { const a = COPA[j - 1], b = COPA[j]; y = lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); break; }
      const rizo = 7 * Math.sin(u * Math.PI * 9) * k;          // la nueva silueta sigue siendo de rizos
      pts.push({ x, y: y + bajaCopa(x, k) + rizo });
    }
    return pts;
  }
  // zona que se recorta (pantalla) por encima de la coronilla aplastada: de la silueta aplastada hacia arriba
  function recorteCopa(p) {
    const k = p.aplasta; if (k <= 0.01) return null;
    const H = B.cabeza(p), at = q => B.aPantalla(p, H.a(q));
    // de la silueta aplastada hacia arriba, muy por encima del pelo
    return copaAplastada(k).map(at).concat([at({ x: 1090, y: 60 }), at({ x: 520, y: 60 })]);
  }
  function capaCabezaB(g, t, p) {
    const k = p.mojado || 0;
    if (k > 0.01) {
      const PM = peloMojado();
      g.save(); g.globalAlpha = clamp(k);
      g.drawImage(PM.c, PM.x, PM.y, PM.w, PM.h);
      g.restore();
      // nueva silueta de la coronilla aplastada: trazo de tinta con brillo
      const ka = p.aplasta || 0;
      if (ka > 0.02) {
        const pts = copaAplastada(ka);
        g.save(); g.lineJoin = "round"; g.lineCap = "round";
        g.beginPath(); M2.curva(g, pts, false, 0.4); g.lineWidth = 16; g.strokeStyle = "#2a160a"; g.stroke();
        g.lineWidth = 4; g.strokeStyle = "rgba(255,226,170,0.5)"; g.beginPath(); M2.curva(g, pts.map(q => ({ x: q.x, y: q.y + 12 })), false, 0.4); g.stroke();
        g.restore();
      }
    }
    // espuma sobre el pelo: copete que el pelo se va «bebiendo»
    const es = tramo(t, T.chof, T.chof + 0.08) * (1 - tramo(t, T.chof + 0.35, T.chof + 1.6));
    if (es > 0.01) {
      g.save();
      const ka = p.aplasta || 0;
      const yb = 236 + bajaCopa(800, ka);
      const bl = [[700, -6, 46], [760, -30, 54], [830, -34, 58], [900, -18, 48], [960, 4, 38], [640, 12, 34]];
      g.lineWidth = 7; g.strokeStyle = "#8a6a46";
      const cam = () => { g.beginPath(); for (const [x, dy, r] of bl) { const rr = r * es; g.moveTo(x + rr, yb + dy * es); g.arc(x, yb + dy * es, rr, 0, Math.PI * 2); } };
      cam(); g.stroke(); cam(); g.fillStyle = "#fff6e2"; g.fill();
      g.fillStyle = "#ffffff"; for (const [x, dy, r] of bl) { g.beginPath(); g.arc(x - r * 0.3 * es, yb + dy * es - r * 0.35 * es, r * 0.3 * es, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    // bigote de espuma tras el trago
    const big = p.cara.bigote || 0;
    if (big > 0.01) {
      g.save(); g.translate(812, 606); g.rotate(0.27);
      const bl = [[-52, -2, 14], [-32, -8, 17], [-10, -11, 18], [12, -11, 18], [34, -8, 16], [54, -2, 13]];
      const cam = () => { g.beginPath(); for (const [x, y, r] of bl) { g.moveTo(x + r * big, y); g.arc(x, y, r * big, 0, Math.PI * 2); } };
      cam(); g.lineWidth = 6; g.strokeStyle = "#7a5c40"; g.stroke(); cam(); g.fillStyle = "#fff4dc"; g.fill();
      g.fillStyle = "#ffffff"; for (const [x, y, r] of bl) { g.beginPath(); g.arc(x - r * 0.3 * big, y - r * 0.35 * big, r * 0.28 * big, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }

  /* =====================================================================================
   * DECORADO: bar de fútbol de noche
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 120; const g = c.getContext("2d");
    g.translate(80, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared: madera oscura arriba, papel granate con rayas
    const gp = g.createLinearGradient(0, -60, 0, MOSTRADOR); gp.addColorStop(0, "#3a1d1c"); gp.addColorStop(1, "#5c2a24");
    g.fillStyle = gp; g.fillRect(-80, -60, W + 160, MOSTRADOR + 60);
    g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 10; for (let x = -80; x < W + 80; x += 34) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x, MOSTRADOR); g.stroke(); }
    // friso de madera arriba
    g.fillStyle = "#2a160f"; g.fillRect(-80, -60, W + 160, 74); g.fillStyle = "#4a2a1a"; g.fillRect(-80, 10, W + 160, 6);
    // luz cálida de las lámparas en la pared
    for (const [x, y, r, a] of [[150, 80, 260, 0.32], [340, 70, 240, 0.26], [580, 200, 330, 0.18]]) {
      const gl = g.createRadialGradient(x, y, 10, x, y, r); gl.addColorStop(0, `rgba(255,190,110,${a})`); gl.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = gl; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    // resplandor verde de la tele
    const tvc = { x: 887, y: 128 }, gt = g.createRadialGradient(tvc.x, tvc.y, 20, tvc.x, tvc.y, 330);
    gt.addColorStop(0, "rgba(120,230,150,0.32)"); gt.addColorStop(1, "rgba(120,230,150,0)"); g.fillStyle = gt; g.fillRect(tvc.x - 330, tvc.y - 330, 660, 660);
    // estantería con espejo y botellas (detrás de la barra)
    const EX0 = 300, EX1 = 740, EY0 = 128, EY1 = 330;
    g.fillStyle = "#24120c"; g.fillRect(EX0 - 14, EY0 - 14, EX1 - EX0 + 28, EY1 - EY0 + 22);
    const ge = g.createLinearGradient(EX0, EY0, EX1, EY1); ge.addColorStop(0, "#6c5a58"); ge.addColorStop(0.5, "#8b7a72"); ge.addColorStop(1, "#5a4a48");
    g.fillStyle = ge; g.fillRect(EX0, EY0, EX1 - EX0, EY1 - EY0);
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 18; for (const x of [EX0 + 90, EX0 + 250]) { g.beginPath(); g.moveTo(x, EY0); g.lineTo(x - 70, EY1); g.stroke(); }
    const colB = ["#2f6b3a", "#7a2a1e", "#c49a3a", "#3a4f7a", "#5b3a1a", "#e7d9b8", "#1e4a2a", "#8a5a2a"];
    for (const ys of [EY0 + 60, EY0 + 130, EY1 - 4]) {
      // balda con lucecita
      g.fillStyle = "#3a2216"; g.fillRect(EX0 - 6, ys, EX1 - EX0 + 12, 8); g.fillStyle = "rgba(255,200,120,0.5)"; g.fillRect(EX0, ys + 8, EX1 - EX0, 2);
      for (let x = EX0 + 10, i = 0; x < EX1 - 14; i++) {
        const w = 12 + 8 * hash(i + ys), h = 30 + 22 * hash(i * 2.3 + ys), col = colB[Math.floor(hash(i * 1.7 + ys) * colB.length)];
        g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x, ys); g.lineTo(x, ys - h * 0.62); g.quadraticCurveTo(x, ys - h * 0.75, x + w * 0.32, ys - h * 0.8);
        g.lineTo(x + w * 0.32, ys - h); g.lineTo(x + w * 0.68, ys - h); g.lineTo(x + w * 0.68, ys - h * 0.8); g.quadraticCurveTo(x + w, ys - h * 0.75, x + w, ys - h * 0.62); g.lineTo(x + w, ys); g.closePath();
        g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 2, ys - h * 0.58, 2.2, h * 0.45);
        g.fillStyle = hash(i + 3 * ys) > 0.5 ? "#efe3c4" : "#d9b45a"; g.fillRect(x + 1.5, ys - h * 0.42, w - 3, h * 0.2);
        x += w + 4 + 4 * hash(i + 9);
      }
    }
    // diana (sin números)
    const dx = 150, dy = 196;
    g.fillStyle = "#1a120e"; g.beginPath(); g.arc(dx, dy, 56, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 20; i++) { g.fillStyle = i % 2 ? "#e9dcb6" : "#1d1712"; g.beginPath(); g.moveTo(dx, dy); g.arc(dx, dy, 46, i * Math.PI / 10 - Math.PI / 20, (i + 1) * Math.PI / 10 - Math.PI / 20); g.closePath(); g.fill(); }
    for (const [r, w] of [[44, 5], [28, 4]]) for (let i = 0; i < 20; i++) { g.strokeStyle = i % 2 ? "#2d7a3a" : "#b8322a"; g.lineWidth = w; g.beginPath(); g.arc(dx, dy, r, i * Math.PI / 10 - Math.PI / 20, (i + 1) * Math.PI / 10 - Math.PI / 20); g.stroke(); }
    g.fillStyle = "#2d7a3a"; g.beginPath(); g.arc(dx, dy, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = "#b8322a"; g.beginPath(); g.arc(dx, dy, 3.5, 0, Math.PI * 2); g.fill();
    g.lineWidth = 3; g.strokeStyle = TINTA; g.beginPath(); g.arc(dx, dy, 56, 0, Math.PI * 2); g.stroke();
    // dardos clavados
    for (const [a, r] of [[0.6, 18], [2.4, 30], [4.2, 9]]) { const x = dx + Math.cos(a) * r, y = dy + Math.sin(a) * r;
      g.strokeStyle = "#cfcfd6"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y - 6); g.stroke();
      g.fillStyle = "#e0443a"; g.beginPath(); g.moveTo(x - 10, y - 6); g.lineTo(x - 18, y - 13); g.lineTo(x - 16, y - 4); g.closePath(); g.fill(); }
    // bufandas a rayas colgadas (sin letras)
    const bufanda = (x0, y0, x1, y1, c1, c2, fl) => {
      const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
      g.save(); g.translate(x0, y0); g.rotate(a);
      for (let s = 0; s < L; s += 12) { g.fillStyle = (s / 12) % 2 ? c1 : c2; g.fillRect(s, -11, 12.5, 22); }
      g.strokeStyle = TINTA; g.lineWidth = 2.4; g.strokeRect(0, -11, L, 22);
      g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 1; for (let s = 3; s < L; s += 4) { g.beginPath(); g.moveTo(s, -11); g.lineTo(s, 11); g.stroke(); }
      for (const e of [0, L]) for (let i = -9; i <= 9; i += 3) { g.strokeStyle = fl; g.lineWidth = 2; g.beginPath(); g.moveTo(e, i); g.lineTo(e + (e ? 10 : -10), i + 1); g.stroke(); }
      g.restore();
    };
    bufanda(24, 64, 260, 104, "#1f3b8a", "#f2efe6", "#1f3b8a");
    bufanda(560, 98, 752, 66, "#c8322a", "#f6d24a", "#c8322a");
    // banderines (triángulos de colores, sin letras)
    const cuerda = x => 30 + 14 * Math.sin(Math.PI * (x - 260) / 300);
    g.strokeStyle = "#1a120e"; g.lineWidth = 2; g.beginPath(); for (let x = 260; x <= 560; x += 10) { if (x === 260) g.moveTo(x, cuerda(x)); else g.lineTo(x, cuerda(x)); } g.stroke();
    const colP = ["#c8322a", "#f2efe6", "#1f3b8a", "#2d7a3a", "#f6d24a"];
    for (let i = 0, x = 268; x < 552; x += 26, i++) { const y = cuerda(x), y2 = cuerda(x + 18);
      g.fillStyle = colP[i % colP.length]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y2); g.lineTo(x + 9, y + 26); g.closePath(); g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke(); }
    // soporte de la tele
    g.fillStyle = "#2a2a30"; g.fillRect(881, -60, 12, 136); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(881, -60, 12, 136);
    // marco de la tele
    g.fillStyle = "#16161a"; g.beginPath(); g.moveTo(TV.a.x - 8, TV.a.y - 8); g.lineTo(TV.b.x + 8, TV.b.y - 8); g.lineTo(TV.c.x + 8, TV.c.y + 8); g.lineTo(TV.d.x - 8, TV.d.y + 8); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = "#000"; g.stroke();

    /* ---- barra ---- */
    // encimera
    g.fillStyle = "#6b3a1c"; g.fillRect(-80, MOSTRADOR - 12, W + 160, 12);
    g.fillStyle = "#9a5a2c"; g.fillRect(-80, MOSTRADOR - 12, W + 160, 3);
    g.fillStyle = "#3a1d0c"; g.fillRect(-80, MOSTRADOR, W + 160, 8);
    // frente de la barra: paneles
    const gb = g.createLinearGradient(0, MOSTRADOR, 0, SUELO); gb.addColorStop(0, "#4a2512"); gb.addColorStop(1, "#2a140a");
    g.fillStyle = gb; g.fillRect(-80, MOSTRADOR + 8, W + 160, SUELO - MOSTRADOR - 8);
    for (let x = -60; x < W + 80; x += 120) {
      g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 4; g.strokeRect(x + 10, MOSTRADOR + 26, 100, SUELO - MOSTRADOR - 70);
      g.strokeStyle = "rgba(255,190,120,0.12)"; g.lineWidth = 2; g.strokeRect(x + 14, MOSTRADOR + 30, 92, SUELO - MOSTRADOR - 78);
    }
    // barra de latón para los pies
    g.strokeStyle = "#7a5a1a"; g.lineWidth = 9; g.beginPath(); g.moveTo(-80, SUELO - 26); g.lineTo(W + 80, SUELO - 26); g.stroke();
    g.strokeStyle = "#e6c060"; g.lineWidth = 3; g.beginPath(); g.moveTo(-80, SUELO - 28); g.lineTo(W + 80, SUELO - 28); g.stroke();
    for (let x = 40; x < W; x += 200) { g.fillStyle = "#7a5a1a"; g.fillRect(x - 3, SUELO - 26, 6, 26); }
    // grifos de cerveza en la barra
    for (const [x, col] of [[150, "#c8322a"], [182, "#1f3b8a"], [214, "#2d7a3a"]]) {
      g.fillStyle = "#c9ccd4"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
      g.beginPath(); g.rect(x - 4, MOSTRADOR - 64, 8, 52); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x, MOSTRADOR - 60); g.quadraticCurveTo(x + 12, MOSTRADOR - 60, x + 12, MOSTRADOR - 46); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3; g.strokeStyle = "#c9ccd4"; g.stroke();
      g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.8; g.beginPath(); g.roundRect ? g.roundRect(x - 5, MOSTRADOR - 100, 10, 38, 4) : g.rect(x - 5, MOSTRADOR - 100, 10, 38); g.fill(); g.stroke();
    }
    g.fillStyle = "#c9ccd4"; g.strokeStyle = TINTA; g.lineWidth = 1.8; g.beginPath(); g.rect(136, MOSTRADOR - 68, 92, 8); g.fill(); g.stroke();
    // posavasos en la barra
    for (const x of [380, 470, 650]) { g.fillStyle = "#d8c49a"; g.beginPath(); g.ellipse(x, MOSTRADOR - 6, 12, 3, 0, 0, Math.PI * 2); g.fill(); }

    /* ---- suelo ---- */
    const gs = g.createLinearGradient(0, SUELO, 0, H + 60); gs.addColorStop(0, "#3a2416"); gs.addColorStop(1, "#24160c");
    g.fillStyle = gs; g.fillRect(-80, SUELO, W + 160, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let i = -10; i < 30; i++) { const x0 = i * 70; g.beginPath(); g.moveTo(512 + (x0 - 512) * 0.8, SUELO); g.lineTo(512 + (x0 - 512) * 1.4, H + 60); g.stroke(); }
    for (const y of [SUELO + 14, SUELO + 34]) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    // sombra de la barra en el suelo
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(-80, SUELO, W + 160, 6);
    return c;
  }
  // lámparas colgantes (delante de la pared)
  function lamparas(g, t) {
    for (const [x, L] of [[150, 58], [340, 46]]) {
      const bal = 0.01 * Math.sin(t * 1.3 + x);
      g.save(); g.translate(x, -10); g.rotate(bal);
      g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L); g.stroke();
      g.translate(0, L);
      const gl = g.createRadialGradient(0, 18, 4, 0, 40, 120); gl.addColorStop(0, "rgba(255,220,150,0.35)"); gl.addColorStop(1, "rgba(255,220,150,0)");
      g.fillStyle = gl; g.beginPath(); g.moveTo(-26, 14); g.lineTo(26, 14); g.lineTo(90, 160); g.lineTo(-90, 160); g.closePath(); g.fill();
      g.fillStyle = "#1f5a34"; g.strokeStyle = TINTA; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.lineTo(26, 16); g.lineTo(-26, 16); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff2c8"; g.beginPath(); g.ellipse(0, 16, 14, 4, 0, 0, Math.PI); g.fill();
      g.restore();
    }
  }
  // pantalla de la tele: el verde del campo y puntitos que corren
  function tele(g, t) {
    const { a, b, c, d } = TV;
    const P = (u, v) => ({ x: lerp(lerp(a.x, b.x, u), lerp(d.x, c.x, u), v), y: lerp(lerp(a.y, b.y, u), lerp(d.y, c.y, u), v) });
    g.save(); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.clip();
    // franjas de césped
    for (let i = 0; i < 8; i++) { const u0 = i / 8, u1 = (i + 1) / 8, q0 = P(u0, 0), q1 = P(u1, 0), q2 = P(u1, 1), q3 = P(u0, 1);
      g.fillStyle = i % 2 ? "#2f9a44" : "#38aa4e"; g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y); g.lineTo(q2.x, q2.y); g.lineTo(q3.x, q3.y); g.closePath(); g.fill(); }
    // líneas del campo
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.5;
    const m0 = P(0.5, 0.05), m1 = P(0.5, 0.95); g.beginPath(); g.moveTo(m0.x, m0.y); g.lineTo(m1.x, m1.y); g.stroke();
    const cc = P(0.5, 0.5); g.beginPath(); g.ellipse(cc.x, cc.y, 14, 12, 0.1, 0, Math.PI * 2); g.stroke();
    for (const u of [0.04, 0.96]) { const q0 = P(u, 0.3), q1 = P(u + (u < 0.5 ? 0.1 : -0.1), 0.3), q2 = P(u + (u < 0.5 ? 0.1 : -0.1), 0.7), q3 = P(u, 0.7);
      g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y); g.lineTo(q2.x, q2.y); g.lineTo(q3.x, q3.y); g.stroke(); }
    // jugadores (puntitos) y balón
    const bu = 0.5 + 0.32 * ruido(t * 0.45 + 3), bv = 0.5 + 0.3 * ruido(t * 0.6 + 11);
    for (let i = 0; i < 12; i++) {
      const u = clamp(lerp(0.15 + 0.7 * hash(i * 2.1), bu, 0.35) + 0.12 * ruido(t * 0.7 + i * 5.3), 0.05, 0.95);
      const v = clamp(lerp(0.15 + 0.7 * hash(i * 3.7), bv, 0.3) + 0.12 * ruido(t * 0.8 + i * 9.1), 0.08, 0.92);
      const q = P(u, v); g.fillStyle = i < 6 ? "#e33b35" : "#2a4fd0"; g.beginPath(); g.arc(q.x, q.y, 2.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(q.x + 1, q.y + 2.2, 2.4, 0.9, 0, 0, Math.PI * 2); g.fill();
    }
    const qb = P(bu, bv); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(qb.x, qb.y, 1.9, 0, Math.PI * 2); g.fill();
    // brillo y viñeta de la pantalla
    const gr = g.createLinearGradient(a.x, a.y, c.x, c.y); gr.addColorStop(0, "rgba(255,255,255,0.18)"); gr.addColorStop(0.4, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,0.25)");
    g.fillStyle = gr; g.fillRect(a.x - 10, a.y - 10, c.x - a.x + 20, c.y - a.y + 20);
    g.restore();
  }

  /* ---------- taburetes ---------- */
  function taburete(g, x, hunde) {
    const ys = Y_ASIENTO + hunde;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(x + 4, SUELO + 2, 46, 6, 0, 0, Math.PI * 2); g.fill();
    const cromo = "#b9bec8", cromoO = "#6e7480";
    const pata = (x0, x1, w, c) => { g.strokeStyle = TINTA; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, ys + 8); g.lineTo(x1, SUELO - 1); g.stroke(); g.strokeStyle = c; g.lineWidth = w; g.stroke(); };
    pata(x - 14, x - 30, 3.5, cromoO); pata(x + 14, x + 32, 3.5, cromoO);
    // aro para los pies
    g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.ellipse(x + 1, Y_ARO + 3, 34, 6, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = cromo; g.lineWidth = 3.5; g.stroke();
    pata(x - 20, x - 40, 4.5, cromo); pata(x + 20, x + 42, 4.5, cromo);
    // asiento redondo de escay
    g.fillStyle = "#7a1f1c"; g.beginPath(); g.ellipse(x, ys + 6, 38, 8, 0, 0, Math.PI); g.lineTo(x - 38, ys); g.fill();
    g.fillStyle = "#a8302a"; g.beginPath(); g.ellipse(x, ys, 38, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.ellipse(x - 10, ys - 2, 16, 3, -0.05, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, ys, 38, 9, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(x - 38, ys); g.lineTo(x - 38, ys + 6); g.ellipse(x, ys + 6, 38, 8, 0, Math.PI, 0, true); g.lineTo(x + 38, ys); g.stroke();
    g.restore();
  }
  // público invisible: el asiento salta y rebota, rayas de los brazos que suben y polvito al sentarse
  function olaVacia(g, t, x, tp) {
    const k = fase(t, tp - 0.32, tp + 0.5); if (k <= 0 || k >= 1) return;
    const up = subeBaja(t, tp, 0.26, 0.3), vis = Math.sin(Math.PI * k);
    const y0 = Y_ASIENTO - 24, alto = 120 * up;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // estela del cuerpo: dos rayas verticales que crecen
    for (const s of [-1, 1]) {
      g.strokeStyle = `rgba(0,0,0,${0.35 * vis})`; g.lineWidth = 5.5;
      const xx = x + s * 9;
      g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx, y0 - 30 - 0.55 * alto); g.stroke();
      g.strokeStyle = `rgba(255,240,205,${0.85 * vis})`; g.lineWidth = 3; g.stroke();
    }
    // los brazos: arcos que salen hacia fuera y arriba (como una V)
    for (const s of [-1, 1]) {
      const a = { x: x + s * 16, y: y0 - 40 - 0.3 * alto }, c = { x: x + s * 46, y: y0 - 60 - 0.55 * alto }, b = { x: x + s * 34, y: y0 - 70 - alto };
      for (const [col, w] of [[`rgba(0,0,0,${0.35 * vis})`, 6], [`rgba(255,240,205,${0.9 * vis})`, 3.4]]) {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(c.x, c.y, b.x, b.y); g.stroke(); }
      // rayitas de velocidad en la punta
      g.strokeStyle = `rgba(255,240,205,${0.8 * vis * up})`; g.lineWidth = 2;
      for (let i = 0; i < 3; i++) { const yy = b.y + 6 + i * 7; g.beginPath(); g.moveTo(b.x + s * 6, yy); g.lineTo(b.x + s * 16, yy + 2); g.stroke(); }
    }
    // polvito al volver a sentarse
    const pv = fase(t, tp + 0.22, tp + 0.5);
    if (pv > 0 && pv < 1) { g.fillStyle = `rgba(235,215,185,${0.6 * Math.sin(Math.PI * pv)})`;
      for (let i = 0; i < 5; i++) { const ox = (i - 2) * 11 * (1 + pv), r = (4 + 3 * hash(i + x)) * (0.6 + 0.6 * pv); g.beginPath(); g.arc(x + ox, Y_ASIENTO - 6 - 5 * hash(i) - 4 * pv, r, 0, Math.PI * 2); g.fill(); } }
    g.restore();
  }
  // el asiento vacío: salta un poco cuando «se levanta» y se hunde al «sentarse»
  const asientoVacio = (t, tp) => -4 * campana(t, tp - 0.3, tp - 0.08) + 4 * campana(t, tp + 0.2, tp + 0.42);

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  function estrella(g, x, y, r, k, col = "#ffd54a") {
    if (k < 0.12) return;
    g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = Math.min(2.5, 0.3 * r * k) / k;
    g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function bonk(g, t) {
    const k = fase(t, T.bonk - 0.02, T.bonk + 0.45); if (k <= 0 || k >= 1) return;
    const Q = puntoBonk();
    const e = k < 0.25 ? salida(k / 0.25) : 1 - entrada((k - 0.25) / 0.75);
    estrella(g, Q.x, Q.y, 22, e);
    g.save(); g.strokeStyle = `rgba(255,240,180,${e})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3, r0 = 26 + 20 * k, r1 = r0 + 14; g.beginPath(); g.moveTo(Q.x + Math.cos(a) * r0, Q.y + Math.sin(a) * r0); g.lineTo(Q.x + Math.cos(a) * r1, Q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // la cuenta: a cada cabezada aparece un puntito entre los dos (uno, dos, tres) y en el tres se encienden
  function cabezadas(g, t, pG, pB) {
    const vis = dentro(t, T.n1 - 0.05, T.n1 + 0.05, T.o3 + 0.05, T.o3 + 0.25); if (vis <= 0.01) return;
    const a = cabezaPant(G, pG, { x: 1000, y: 560 }), b = cabezaPant(B, pB, { x: 560, y: 520 });
    const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 26 };
    const brilla = campana(t, T.n3 + 0.02, T.o3 + 0.2);
    g.save();
    [T.n1, T.n2, T.n3].forEach((tn, i) => {
      const k = tramo(t, tn - 0.04, tn + 0.08, salida); if (k <= 0.01) return;
      const pop = 1 + 0.5 * campana(t, tn - 0.02, tn + 0.18) + 0.4 * brilla;
      const x = c.x + (i - 1) * 15, r = 4.6 * k * pop;
      g.globalAlpha = vis;
      g.fillStyle = brilla > 0.05 ? "#fff3a0" : "#fff8e8"; g.strokeStyle = TINTA; g.lineWidth = 2;
      g.beginPath(); g.arc(x, c.y, r, 0, Math.PI * 2); g.fill(); g.stroke();
    });
    // rayitas de «¡ya!» en el tres
    if (brilla > 0.01) { g.strokeStyle = `rgba(255,243,160,${brilla * vis})`; g.lineWidth = 2.5; g.lineCap = "round";
      for (let i = 0; i < 7; i++) { const an = -Math.PI * (0.1 + 0.8 * i / 6), r0 = 26 + 8 * brilla; g.beginPath(); g.moveTo(c.x + Math.cos(an) * r0, c.y + Math.sin(an) * r0 * 0.7); g.lineTo(c.x + Math.cos(an) * (r0 + 10), c.y + Math.sin(an) * (r0 + 10) * 0.7); g.stroke(); } }
    g.restore();
  }
  // la pinta que vuela, con su cinta de cerveza
  function pintaVuela(g, t) {
    const v = pintaLibre(t); if (!v) return;
    if (v.fase === "vuela") {
      const V = vuelo();
      // la cerveza va detrás del vaso como una cinta que se estira y gotea
      const atras = [];
      for (let i = 0; i <= 10; i++) {
        const u = Math.max(0, (t - T.suelta) - i * 0.022), q = { x: V.R.x + V.vx * u, y: V.R.y + V.vy * u + 0.5 * GRAV * u * u };
        atras.push(q);
      }
      const ancho = 7 * (1 - 0.4 * v.k);
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      g.strokeStyle = TINTA; g.lineWidth = ancho + 4; g.beginPath(); M2.curva(g, atras, false, 0.4); g.stroke();
      g.strokeStyle = "#f2a51e"; g.lineWidth = ancho; g.stroke();
      g.strokeStyle = "rgba(255,230,150,0.8)"; g.lineWidth = 2; g.stroke();
      // gotas sueltas
      for (let i = 0; i < 9; i++) {
        const u = (t - T.suelta) - (0.05 + 0.09 * i); if (u < 0) continue;
        const sp = { x: (hash(i) - 0.5) * 60, y: (hash(i + 4) - 0.6) * 60 };
        const q = { x: V.R.x + (V.vx + sp.x) * u, y: V.R.y + (V.vy + sp.y) * u + 0.5 * GRAV * u * u + 30 * u * u };
        if (q.y > MOSTRADOR) continue;
        g.fillStyle = "#f2a51e"; g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.ellipse(q.x, q.y, 2.6, 3.4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      }
      g.restore();
      dibVaso(g, { x: v.x, y: v.y, ang: v.ang, nivel: 0.35 * (1 - tramo(v.k, 0, 0.35)), espuma: 0.4 * (1 - tramo(v.k, 0, 0.3)), anillos: 0.8, t });
      // el grueso de la cerveza va pegado a la boca del vaso (sale cuando el vaso se da la vuelta)
      const sale = tramo(v.k, 0.15, 0.55);
      if (sale > 0.01) {
        const M = rotP({ x: 0, y: -VH / 2 - 7 * sale }, v.ang), c = { x: v.x + M.x, y: v.y + M.y };
        const vel = { x: V.vx, y: V.vy + GRAV * (t - T.suelta) }, va = Math.atan2(vel.y, vel.x), sp = Math.hypot(vel.x, vel.y);
        const rx = (8 + 0.006 * sp) * sale, ry = 7.5 * sale;
        g.save(); g.translate(c.x, c.y); g.rotate(va);
        g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = "#f2a51e"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
        g.fillStyle = "#fff4dc"; g.beginPath(); g.ellipse(-rx * 0.35, -ry * 0.3, rx * 0.45, ry * 0.42, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(rx * 0.3, -ry * 0.35, rx * 0.18, ry * 0.15, 0, 0, Math.PI * 2); g.fill();
        g.restore();
      }
      return;
    }
    dibVaso(g, { x: v.x, y: v.y, ang: v.ang, nivel: 0, espuma: 0, anillos: 1, t });
    // ¡clinc!
    const kc = campana(t, T.clinc, T.clinc + 0.3);
    if (kc > 0) {
      g.save(); g.strokeStyle = `rgba(255,250,220,${kc})`; g.lineWidth = 2.5; g.lineCap = "round";
      for (const [a, r] of [[-2.4, 20], [-1.6, 26], [-0.8, 20]]) { const cx = VASO_G2.x, cy = VASO_G2.y - VH; g.beginPath(); g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10)); g.stroke(); }
      g.restore();
    }
  }
  // ¡chof!: corona de cerveza y gotas al caer en el pelo
  function chof(g, t) {
    const k = fase(t, T.chof - 0.01, T.chof + 0.6); if (k <= 0 || k >= 1) return;
    const C = vuelo().C;
    g.save();
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI * (0.05 + 0.9 * hash(i * 1.3)), sp = 140 + 160 * hash(i + 7), u = k * 0.6;
      const x = C.x + Math.cos(a) * sp * u, y = C.y + Math.sin(a) * sp * u + 0.5 * GRAV * u * u;
      const r = (2 + 2.5 * hash(i + 2)) * (1 - k * 0.5);
      g.fillStyle = i % 4 ? "#f2a51e" : "#fff4dc"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(x, y, r, r * 1.25, a, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // corona de cerveza: lenguas que salen de la coronilla con una gota en la punta
    const s = fase(t, T.chof - 0.01, T.chof + 0.3);
    if (s > 0 && s < 1) {
      const e = salida(s), vis = 1 - entrada(s);
      g.lineCap = "round";
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI * (0.08 + 0.84 * i / 8), L = (22 + 12 * hash(i + 3)) * e, b = { x: C.x + Math.cos(a) * L * 1.3, y: C.y + 4 + Math.sin(a) * L };
        g.globalAlpha = vis;
        g.strokeStyle = TINTA; g.lineWidth = 7; g.beginPath(); g.moveTo(C.x + Math.cos(a) * 6, C.y + 4 + Math.sin(a) * 4); g.lineTo(b.x, b.y); g.stroke();
        g.strokeStyle = "#f2a51e"; g.lineWidth = 4.5; g.stroke();
        g.fillStyle = "#f2a51e"; g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.arc(b.x + Math.cos(a) * 3, b.y + Math.sin(a) * 3, 3.4, 0, Math.PI * 2); g.fill(); g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.restore();
  }
  // goteo del pelo mojado (pantalla)
  const PUNTAS_B = [[560, 690], [640, 640], [1050, 620], [1090, 520], [980, 660]];
  // punta del pelo de la que se suelta cada gota, en el instante en que se suelta (se recuerda)
  const GOTAS = new Map();
  function puntaGota(ts, x, y) {
    const clave = ts.toFixed(4) + ":" + x;
    let q = GOTAS.get(clave);
    if (!q) { q = cabezaPant(B, poseB(ts), { x, y: y + 10 }); if (GOTAS.size > 400) GOTAS.clear(); GOTAS.set(clave, q); }
    return q;
  }
  function goteo(g, t) {
    if (t < T.chof + 0.1 || t > T.chorroFin + 0.6) return;
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.1;
    PUNTAS_B.forEach(([x, y], i) => {
      const per = 0.42 + 0.2 * hash(i + 40), f0 = hash(i + 50);
      const n = Math.floor((t - T.chof) / per + f0);
      for (let j = n - 2; j <= n; j++) {
        const ts = T.chof + 0.1 + (j + 1 - f0) * per;
        if (ts > t || ts < T.chof + 0.1 || ts > T.e1) continue;
        const q = puntaGota(ts, x, y);
        const dt = t - ts, yy = q.y + 0.5 * 1400 * dt * dt;
        if (yy > SUELO) continue;
        g.fillStyle = "#f2b13a"; g.beginPath(); g.ellipse(q.x, yy, 1.8, 2.6 + dt * 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    });
    g.restore();
  }
  // chorro al escurrirse el pelo, hasta su vaso
  function chorro(g, t, pB) {
    const k = dentro(t, T.e1 - 0.12, T.e1, T.chorroFin - 0.08, T.chorroFin); if (k <= 0.01) return;
    const wr = Math.max(campana(t, T.e1 - 0.14, T.e1 + 0.2), campana(t, T.e2 - 0.14, T.e2 + 0.2), campana(t, T.e3 - 0.14, T.e3 + 0.2));
    const a = cabezaPant(B, pB, { x: 1040, y: 640 }), b = { x: VASO_B.x, y: VASO_B.y - VH + 6 };
    const w = (2.5 + 4 * wr) * k;
    const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push({ x: lerp(a.x, b.x, u * u) + 2.5 * Math.sin(t * 30 + u * 9) * u, y: lerp(a.y, b.y, u) }); }
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = TINTA; g.lineWidth = w + 3; g.beginPath(); M2.curva(g, pts, false, 0.4); g.stroke();
    g.strokeStyle = "#f2a51e"; g.lineWidth = w; g.stroke();
    g.strokeStyle = "rgba(255,236,170,0.8)"; g.lineWidth = Math.max(1, w * 0.3); g.stroke();
    g.restore();
  }
  // ¡boing!: rizos que vuelven con muelles
  function boing(g, t, pB) {
    const k = fase(t, T.boing, T.boing + 0.5); if (k <= 0 || k >= 1) return;
    const C = cabezaPant(B, pB, CEN_PELO);
    g.save(); g.strokeStyle = `rgba(255,240,200,${1 - k})`; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.1 + 0.8 * i / 6), r0 = 52 + 24 * k;
      g.beginPath();
      for (let j = 0; j <= 20; j++) { const u = j / 20, r = r0 + 18 * u, w = 4 * Math.sin(u * Math.PI * 6);
        const x = C.x + Math.cos(a) * r - Math.sin(a) * w, y = C.y + Math.sin(a) * r + Math.cos(a) * w; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  // el vaso de Gabacho en la barra (antes de cogerlo y mientras se llena)
  function vasoBarra(g, t) {
    if (t < T.bDeja + 0.02 || t > T.coge) return;
    const llen = tramo(t, T.e1 - 0.05, T.chorroFin, s => s);
    const caer = campana(t, T.bDeja, T.bDeja + 0.2);
    dibVaso(g, { x: VASO_B.x, y: VASO_B.y - VH / 2 - 2 * caer, ang: 0, nivel: 0.86 * llen, espuma: llen, anillos: 1, t });
  }
  // brillo del brindis
  function brindis(g, t, pB) {
    const k = campana(t, T.brinda - 0.05, T.brinda + 0.3); if (k <= 0 || !pB.vasoB) return;
    const v = pB.vasoB;
    g.save(); g.strokeStyle = `rgba(255,250,220,${k})`; g.lineWidth = 2.5; g.lineCap = "round";
    for (const a of [-2.6, -2.0, -1.4]) { g.beginPath(); g.moveTo(v.x + Math.cos(a) * 26, v.y - 20 + Math.sin(a) * 26); g.lineTo(v.x + Math.cos(a) * 36, v.y - 20 + Math.sin(a) * 36); g.stroke(); }
    g.restore();
  }
  // ¡ahh!: chispitas de gusto
  function gusto(g, t, pB) {
    const k = dentro(t, T.ahh, T.ahh + 0.15, 13.2, 13.5); if (k <= 0.01) return;
    const c = cabezaPant(B, pB, { x: 1060, y: 380 });
    g.save();
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.2 + i / 3) % 1, x = c.x + 10 + i * 12 + 6 * Math.sin(ph * 6), y = c.y - 30 * ph, r = 8 * k * Math.sin(Math.PI * ph);
      if (r < 0.8) continue;
      // destello de cuatro puntas, claro
      g.beginPath(); for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4, rr = j % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
      g.fillStyle = "#fff6c0"; g.fill(); g.lineWidth = 1; g.strokeStyle = "rgba(90,60,20,0.8)"; g.stroke();
    }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    // plano medio; se abre para seguir la pinta por los aires y luego se acerca al escurrido y al trago
    const abre = tramo(t, T.o3 - 0.25, T.suelta + 0.1) * (1 - tramo(t, T.chof + 0.15, T.bSentado));
    const cerca = tramo(t, T.bSentado - 0.15, T.inclina + 0.4), g = tramo(t, T.gCamara - 0.25, T.gCamara + 0.5);
    const k = lerp(1.15, 1.0, abre) + 0.2 * cerca + 0.03 * g;
    return { k, x: lerp(540, 528, abre) + 28 * cerca - 26 * g, y: lerp(322, 292, abre) + 6 * cerca };
  }

  function poses(t) { return { g: poseG(t), b: poseB(t) }; }

  class LaOla extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !B.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pB = poseB(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -60);
      tele(g, t);
      lamparas(g, t);
      // vasos en la barra (detrás de ellos)
      vasoBarra(g, t);
      const pl = pintaLibre(t); if (pl && pl.fase === "barra") pintaVuela(g, t);
      // taburetes; los vacíos con su público invisible
      for (let i = 0; i < TAB.length; i++) {
        let hunde = 0;
        if (i !== 2 && i !== 3) for (const t0 of [T.o1, T.o2]) hunde += asientoVacio(t, pasoOla(t0, i));
        taburete(g, TAB[i], hunde);
      }
      for (const i of [0, 1, 4, 5]) for (const t0 of [T.o1, T.o2]) olaVacia(g, t, TAB[i], pasoOla(t0, i));
      // personajes (Gabacho delante: su brazo cercano tapa el lejano de Guillermo)
      G.dibujar(g, pG, t);
      const rec = recorteCopa(pB);
      if (rec) { g.save(); g.beginPath(); g.rect(-2000, -2000, 5000, 5000); g.moveTo(rec[0].x, rec[0].y); for (const q of rec.slice(1)) g.lineTo(q.x, q.y); g.closePath(); g.clip("evenodd"); }
      B.dibujar(g, pB, t);
      if (rec) g.restore();
      // efectos
      bonk(g, t);
      cabezadas(g, t, pG, pB);
      if (!pl || pl.fase !== "barra") pintaVuela(g, t);
      chof(g, t);
      goteo(g, t);
      chorro(g, t, pB);
      boing(g, t, pB);
      brindis(g, t, pB);
      gusto(g, t, pB);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00078", nombre: "Guillermo y Gabacho · La ola", crear: () => new LaOla() });
  window.__A2D_00078 = { pose: poses, poseG, poseB, T, DUR };
})();
