"use strict";
/* 00131 · Guillermo y Yorgi · El batido de proteínas
 *
 * Negro → una cocina luminosa por la mañana: pared amarilla mantequilla, una ventana con el sol recién
 * salido (cielo celeste y melocotón, tejados a lo lejos, una maceta de albahaca), rayos de sol en
 * diagonal con motas de polvo, azulejos blancos con flores azul cobalto, encimera de madera de carnicero,
 * muebles verde salvia con tiradores de latón, una balda con tazas, una toalla de gimnasio colgada de un
 * gancho y una pesa rusa en el suelo de tarima clara. En la encimera: una batidora roja (jarra de cristal,
 * base con botones, sin letras), un frutero azul con plátanos, un tarro de avena, un bote de proteína con
 * una mancuerna dibujada y… la tapa de la batidora, olvidada a un lado.
 *
 * Yorgi echa los ingredientes con mucho arte: coge un plátano del frutero, lo pela de un golpe de muñeca
 * y la fruta sale volando en un arco por encima de su cabeza hasta la jarra (dos veces, la segunda más
 * rápida; las pieles, a la encimera) → una cucharada de avena de un toque → un cacillo ENORME de proteína
 * que enseña orgulloso y vuelca: ¡puf!, nube de polvo, Guillermo tose → aprieta el botón: giran las
 * cuchillas y todo da vueltas; Guillermo se acerca a mirar, apoyado en la encimera → ¡sin tapa!: el batido
 * sube por las paredes y sale disparado: una fuente hasta el techo (se estampa y gotea) y un chorro por el
 * pico directo a la cara de Guillermo → Guillermo, quieto, cubierto de batido beige: mucho en el pelo, la
 * cara y los hombros, con chorretones; una gota del techo le cae en la cabeza; abre los ojos (limpios) →
 * Yorgi, tan tranquilo, coge la jarra y se bebe lo que queda de un trago (cabeza atrás, «glu, glu»), se
 * limpia la boca con el dorso de la mano y saca bíceps (destello) → a Guillermo le cuelga una gota de la
 * nariz: la mira, saca la lengua hacia arriba y se la lleva… «mmm»… ¡está buenísimo!: pulgar arriba con
 * el antebrazo en horizontal → los dos miran a cámara (Yorgi vuelve a sacar bíceps y guiña) → negro.
 *
 * Sin textos. El batido sobre Guillermo es una capa aparte (como la harina de 00100 y la espuma de 00120):
 * Guillermo se dibuja en un lienzo, se saca su silueta en beige (mucho en la cabeza y los hombros, poco en
 * las piernas) y se pone encima con «screen», que aclara sin borrar las líneas; los ojos (desde que
 * parpadea) y la boca (desde que saca la lengua) quedan limpios. Encima van los pegotes brillantes, los
 * chorretones, la gota de la nariz y la lengua, en coordenadas del retrato o de la hoja. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, Y = Yorgi;
  const DUR = 14.8;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;

  /* ---------- guion (s) ---------- */
  const T = {
    b1: 0.7, b1Coge: 1.0, b1Sube: 1.26, b1Pela: 1.38, b1Sale: 1.45, b1Cae: 1.92, b1Piel: 1.64, b1PielCae: 2.02,
    b2: 1.8, b2Coge: 2.02, b2Sube: 2.2, b2Pela: 2.27, b2Sale: 2.32, b2Cae: 2.7, b2Piel: 2.5, b2PielCae: 2.86,
    cuchara: 2.75, cucharaCoge: 2.97, avenaMete: 3.17, avenaSaca: 3.32, avenaLanza: 3.55, avenaCae: 3.8,
    protMete: 3.9, protSaca: 4.12, protEcha: 4.48, protCae: 4.62,
    deja: 4.7, dejaFin: 4.96,
    inclina0: 5.0, inclina1: 5.5,
    boton: 5.22, sube0: 5.42, erup: 5.82, techo: 6.0, apaga: 6.34,
    gota1: 6.92, gParpa: 7.5,
    coge: 7.78, bebe0: 7.94, bebe1: 8.36, bebe2: 9.16, posa: 9.54,
    limpia0: 9.74, limpia1: 10.06,
    flexa0: 10.2, chispa: 10.5, flexa1: 11.05,
    nariz: 11.1, lame0: 11.36, lame: 11.6, lame1: 11.88,
    mmm: 11.94, wow: 12.38, pulgar: 12.48,
    camara: 13.06, guino: 13.48,
    fin: 14.15
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const P = (x, y) => ({ x, y });
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABIERTA = D(0.8, 0.85, 0.8, 0.74, 0.68), AGARRA = D(0.2, 0.25, 0.22, 0.22, 0.25);
  const PUNO = D(0.2, 0.06, 0.05, 0.05, 0.06), PULGAR = D(1, 0, 0, 0, 0), INDICE = D(0.15, 1, 0.06, 0.06, 0.06);
  const muelle = (t, t0, f, dec) => t < t0 ? 0 : Math.exp(-(t - t0) * dec) * Math.sin((t - t0) * f);
  // parábola de A a B con altura h (u de 0 a 1)
  const arco = (a, b, u, h) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - h * 4 * u * (1 - u) });
  const rr = (g, x, y, w, h, r) => { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const poli = (g, pts) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); };
  const mezclaC = (a, b, k) => `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  // mirada hacia un punto de pantalla (desde el centro de la cara)
  function miraA(e, rig, p, q, w, cx = 832, cy = 590) {
    if (w <= 0.001 || !q) return;
    const o = rig.aPantalla(p, rig.cabeza(p).a({ x: cx, y: cy }));
    let dx = q.x - o.x, dy = q.y - o.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    if (p.espejo) dx = -dx;
    e.mx = lerp(e.mx, 0.95 * dx, w); e.my = lerp(e.my, 0.95 * dy, w);
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.3, SUELO = 562;
  const XG = 330, XY = 645;                        // pelvis de cada uno (Yorgi mira a la izquierda)
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const TECHO = 44;                                // donde acaba el techo y empieza la pared
  const ENC = 344;                                 // encimera: aquí se apoyan las cosas (borde de delante)
  const BX = 490, BASE_TOP = 312, JUG_Y = 305;     // batidora: centro, techo de la base, fondo de la jarra
  const FRUTERO = { x: 740, y: 344 }, TARRO = { x: 537, y: 342 }, BOTE = { x: 573, y: 344 }, TAPA = { x: 420, y: 341 };
  const BOTON = { x: BX + 12, y: 331 };
  const PIEL1 = { x: 814, y: 341 }, PIEL2 = { x: 850, y: 343 };

  /* =====================================================================================
   * LA JARRA (coordenadas propias: origen en el centro del fondo, arriba = −y)
   * ===================================================================================== */
  const JH = 86;
  const VASO = [P(-21, 0), P(21, 0), P(28, -JH), P(-28, -JH)];
  const INT = [P(-17.5, -4), P(17.5, -4), P(24.5, -JH + 2), P(-24.5, -JH + 2)];
  const AGARRE = P(45, -48);                       // donde la agarra el puño (asa)
  const PICO = P(-33, -JH - 2);                    // pico (por donde sale el chorro y por donde se bebe)
  const area = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return Math.abs(a) / 2; };
  const AREA_INT = area(INT);
  function recorta(pts, n, c) {
    const out = [], d = q => q.x * n.x + q.y * n.y - c;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], da = d(a), db = d(b);
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { const k = da / (da - db); out.push({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), sup: true }); }
    }
    return out;
  }
  function nivel(n, vol) {
    let lo = Infinity, hi = -Infinity;
    for (const q of INT) { const v = q.x * n.x + q.y * n.y; lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const objetivo = vol * AREA_INT;
    for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (area(recorta(INT, n, m)) > objetivo) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const LECHE = [250, 246, 234], BATIDO = [228, 196, 142];

  // lo que hay dentro en cada instante
  const encendida = t => tramo(t, T.boton, T.boton + 0.06) * (1 - tramo(t, T.apaga, T.apaga + 0.1));
  function contenido(t) {
    const b1 = tramo(t, T.b1Cae - 0.02, T.b1Cae + 0.14), b2 = tramo(t, T.b2Cae - 0.02, T.b2Cae + 0.14);
    const av = tramo(t, T.avenaCae - 0.12, T.avenaCae + 0.1), pr = tramo(t, T.protCae - 0.04, T.protCae + 0.12);
    const mezcla = tramo(t, T.boton + 0.04, T.boton + 0.5);
    const sube = tramo(t, T.sube0, T.erup + 0.02, entrada);
    const vacia = tramo(t, T.erup + 0.02, T.apaga + 0.22);
    let vol = 0.42 + 0.07 * b1 + 0.07 * b2 + 0.02 * av + 0.04 * pr;
    vol = lerp(vol, 0.985, sube);
    vol = lerp(vol, 0.36, vacia);
    vol *= 1 - tramo(t, T.bebe1 + 0.05, T.bebe2 - 0.08, x => x);
    const on = encendida(t);
    return { vol, mezcla, on, rem: on * (0.55 + 0.45 * sube), sube, b1: b1 * (1 - mezcla), b2: b2 * (1 - mezcla),
      av: av * (1 - mezcla), pr: pr * (1 - tramo(t, T.boton, T.boton + 0.3)), salpica: Math.max(campana(t, T.b1Cae, T.b1Cae + 0.3), campana(t, T.b2Cae, T.b2Cae + 0.3)) };
  }
  const vibra = t => encendida(t) * 1.2 * Math.sin(t * 97);

  // posición de la jarra: en la base o en la mano de Yorgi (v = { x, y: fondo, ang })
  let JARRA_MANO = null;          // la pone poseY cuando la lleva en la mano (posición del agarre y ángulo)
  const enMano = t => t > T.coge + 0.01 && t < T.posa - 0.01;
  function vasoEnBase(t) { return { x: BX + vibra(t), y: JUG_Y, ang: 0 }; }
  const vasoDesdeAgarre = (q, ang) => { const a = rot(AGARRE, ang); return { x: q.x - a.x, y: q.y - a.y, ang }; };

  function dibVaso(g, t, v) {
    const c = contenido(t);
    g.save(); g.translate(v.x, v.y); g.rotate(v.ang); g.lineJoin = "round"; g.lineCap = "round";
    // asa (plástico negro) por detrás del cristal
    const asa = () => { g.beginPath(); g.moveTo(24, -78); g.quadraticCurveTo(46, -80, 46, -60); g.lineTo(45, -34); g.quadraticCurveTo(44, -20, 22, -20); };
    asa(); g.lineWidth = 11; g.strokeStyle = TINTA; g.stroke();
    asa(); g.lineWidth = 7.5; g.strokeStyle = "#34363e"; g.stroke();
    asa(); g.lineWidth = 1.6; g.strokeStyle = "rgba(150,156,170,0.9)"; g.stroke();
    // cristal (fondo)
    g.beginPath(); poli(g, VASO); g.fillStyle = "rgba(214,238,246,0.45)"; g.fill();
    // dentro: cuchillas y batido
    g.save(); g.beginPath(); poli(g, INT); g.clip();
    const gira = c.on > 0.05;
    if (gira) {
      g.fillStyle = "rgba(170,178,188,0.8)"; g.beginPath(); g.ellipse(0, -8, 15, 3.6, 0, 0, TAU); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -8, 11, 2.4, 0, 0.3 + t * 40 % TAU, 2 + t * 40 % TAU); g.stroke();
    } else {
      g.fillStyle = "#c3c9d0"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, -7); g.lineTo(13 * s, -11); g.lineTo(13 * s, -8.5); g.lineTo(0, -5); g.closePath(); g.fill(); g.stroke(); }
      g.beginPath(); g.moveTo(-1, -8); g.lineTo(-8, -3); g.lineTo(8, -3); g.closePath(); g.fill(); g.stroke();
    }
    g.fillStyle = "#6f747c"; g.beginPath(); g.arc(0, -7, 2.4, 0, TAU); g.fill();
    if (c.vol > 0.004) {
      const col = mezclaC(LECHE, BATIDO, c.mezcla), sombra = mezclaC([206, 200, 190], [196, 158, 104], c.mezcla);
      const derecho = Math.abs(v.ang) < 1e-4;
      let sup = null;                                   // superficie (y en función de x) cuando está derecha
      if (derecho) {
        const c0 = nivel({ x: 0, y: 1 }, c.vol);
        const dip = 16 * c.rem * (1 - 0.6 * c.sube), sube = 10 * c.rem;
        const ola = (x) => c.rem > 0.01 ? 1.6 * c.rem * Math.sin(x * 0.5 + t * 31) : 0.8 * c.salpica * Math.sin(x * 0.6 + t * 26);
        sup = x => c0 - sube + (dip + sube) * (1 - Math.min(1, (x / 25) * (x / 25))) + ola(x);
        g.beginPath(); g.moveTo(-32, 6);
        for (let x = -32; x <= 32; x += 2) g.lineTo(x, sup(x));
        g.lineTo(32, 6); g.closePath();
      } else {
        const n = { x: Math.sin(v.ang), y: Math.cos(v.ang) }, cc = nivel(n, c.vol);
        g.beginPath(); poli(g, recorta(INT, n, cc));
      }
      const gl = g.createLinearGradient(0, -JH, 0, 0); gl.addColorStop(0, col); gl.addColorStop(1, sombra);
      g.globalAlpha = 0.95; g.fillStyle = gl; g.fill(); g.globalAlpha = 1;
      if (derecho) {
        // línea de la superficie
        g.beginPath(); for (let x = -26; x <= 26; x += 2) { const y = sup(x); if (x === -26) g.moveTo(x, y); else g.lineTo(x, y); }
        g.lineWidth = 2.2; g.strokeStyle = "rgba(120,104,84,0.75)"; g.stroke();
        g.save(); g.translate(0, 2.2); g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,0.9)"; g.stroke(); g.restore();
        // remolino
        if (c.rem > 0.02) {
          g.save(); g.globalAlpha = c.rem; g.strokeStyle = "rgba(150,108,58,0.75)"; g.lineWidth = 1.6;
          const ys = sup(0), yb = -8;
          for (let i = 0; i < 5; i++) {
            const u = (i + 0.5) / 5, y = lerp(ys + 4, yb - 4, u), rx = lerp(6, 20, Math.abs(u - 0.15)) * (0.6 + 0.4 * c.rem);
            const a0 = t * 34 + i * 1.7;
            g.beginPath(); g.ellipse(Math.sin(t * 9 + i) * 1.5, y, rx, 3 + 1.5 * u, 0, a0, a0 + 2.4); g.stroke();
          }
          g.fillStyle = "rgba(255,250,236,0.85)";
          for (let i = 0; i < 7; i++) { const a = t * 30 + i * 2.1, y = lerp(sup(0) + 6, -12, hash(i * 3.7)); g.beginPath(); g.arc(Math.cos(a) * 15 * hash(i + 2), y, 1.4 + hash(i) * 1.4, 0, TAU); g.fill(); }
          g.restore();
        }
        // trozos de plátano flotando, avena y el montón de proteína (antes de batir)
        const c0 = sup(0);
        const trozo = (x, y, r, k, a) => { if (k <= 0.02) return; g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k);
          g.fillStyle = "#f6e7a8"; g.strokeStyle = "#a88a3c"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, r, r * 0.62, 0, 0, TAU); g.fill(); g.stroke();
          g.fillStyle = "#b8963c"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(Math.cos(i * 1.6) * r * 0.3, Math.sin(i * 1.6) * r * 0.2, 0.7, 0, TAU); g.fill(); } g.restore(); };
        const flota = i => Math.sin(t * 2.2 + i * 1.3) * 1.2;
        trozo(-11, c0 + 4 + flota(0), 6, c.b1, 0.3); trozo(4, c0 + 5 + flota(1), 5.5, c.b1, -0.4);
        trozo(12, c0 + 3 + flota(2), 6, c.b2, 0.2); trozo(-3, c0 + 7 + flota(3), 5, c.b2, 0.6);
        if (c.av > 0.02) { g.save(); g.globalAlpha = c.av; g.fillStyle = "#cfae74"; g.strokeStyle = "#8a6a3a"; g.lineWidth = 0.8;
          for (let i = 0; i < 11; i++) { const x = -19 + 38 * hash(i * 5.3), y = sup(x) - 0.5 + 1.5 * hash(i); g.beginPath(); g.ellipse(x, y, 2.6, 1.4, hash(i * 2) * 3, 0, TAU); g.fill(); g.stroke(); }
          g.restore(); }
        if (c.pr > 0.02) {
          const h = 15 * c.pr;
          g.beginPath(); g.moveTo(-17, c0 + 2); g.bezierCurveTo(-12, c0 - h * 0.7, -6, c0 - h, 1, c0 - h); g.bezierCurveTo(8, c0 - h, 13, c0 - h * 0.6, 18, c0 + 2); g.closePath();
          g.fillStyle = "#f2e8d3"; g.fill(); g.lineWidth = 1.5; g.strokeStyle = "#a3916e"; g.stroke();
          g.fillStyle = "rgba(170,150,112,0.6)"; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(-10 + 20 * hash(i * 4.1), c0 - h * 0.6 * hash(i * 1.9), 0.8, 0, TAU); g.fill(); }
        }
      }
    }
    g.restore();
    // cristal: contorno, pico, brillos y rayitas de medida
    g.beginPath(); g.moveTo(-28, -JH); g.lineTo(-21, 0); g.lineTo(21, 0); g.lineTo(28, -JH); g.lineTo(-28, -JH);
    g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(-28, -JH); g.quadraticCurveTo(-33, -JH + 1, PICO.x, PICO.y); g.quadraticCurveTo(-30, -JH + 7, -27, -JH + 10);
    g.fillStyle = "rgba(214,238,246,0.7)"; g.fill(); g.lineWidth = 2.4; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 3.2; g.beginPath(); g.moveTo(-17, -10); g.lineTo(-22.5, -72); g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.moveTo(16, -12); g.lineTo(21, -60); g.stroke();
    g.strokeStyle = "rgba(60,90,110,0.55)"; g.lineWidth = 1.3;
    for (let i = 0; i < 5; i++) { const y = -18 - i * 14, xl = lerp(-21, -28, -y / JH) + 3; g.beginPath(); g.moveTo(xl, y); g.lineTo(xl + (i % 2 ? 5 : 8), y); g.stroke(); }
    // aro de abajo (rosca)
    g.beginPath(); rr(g, -23, 0, 46, 7, 2); g.fillStyle = "#3a3c44"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }

  // base de la batidora (pantalla)
  function dibBase(g, t) {
    const x = BX + vibra(t), on = encendida(t);
    const pul = Math.max(campana(t, T.boton - 0.04, T.boton + 0.12), campana(t, T.apaga - 0.04, T.apaga + 0.12));
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(60,30,10,0.18)"; g.beginPath(); g.ellipse(BX, ENC - 1, 36, 4, 0, 0, TAU); g.fill();
    const forma = () => { g.beginPath(); g.moveTo(x - 30, ENC - 2); g.quadraticCurveTo(x - 31, ENC, x - 27, ENC); g.lineTo(x + 27, ENC); g.quadraticCurveTo(x + 31, ENC, x + 30, ENC - 2);
      g.lineTo(x + 25, BASE_TOP + 2); g.quadraticCurveTo(x + 25, BASE_TOP, x + 22, BASE_TOP); g.lineTo(x - 22, BASE_TOP); g.quadraticCurveTo(x - 25, BASE_TOP, x - 25, BASE_TOP + 2); g.closePath(); };
    const gr = g.createLinearGradient(x - 30, 0, x + 30, 0); gr.addColorStop(0, "#f2675a"); gr.addColorStop(0.45, "#d9443b"); gr.addColorStop(1, "#a92e28");
    forma(); g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,220,200,0.5)"; g.beginPath(); g.moveTo(x - 22, BASE_TOP + 9); g.lineTo(x - 26, ENC - 4); g.lineTo(x - 23, ENC - 4); g.lineTo(x - 19, BASE_TOP + 9); g.closePath(); g.fill();
    // banda cromada
    g.beginPath(); rr(g, x - 25, BASE_TOP, 50, 6, 1.5); g.fillStyle = "#d8dee4"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(x - 21, BASE_TOP + 1.5, 30, 1.4);
    // panel con botones (sin letras) y luz de encendido
    g.beginPath(); rr(g, x - 20, BASE_TOP + 12, 40, 18, 5); g.fillStyle = "#b8352e"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "rgba(20,8,6,0.8)"; g.stroke();
    for (const bx of [x - 13, x - 3]) { g.beginPath(); g.arc(bx, BOTON.y, 3.4, 0, TAU); g.fillStyle = "#f6f1e8"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke(); }
    const bxp = x + 12, byp = BOTON.y + 0.8 * pul;
    g.beginPath(); g.arc(bxp, byp, 5.4 - 0.5 * pul, 0, TAU); g.fillStyle = pul > 0.3 ? "#e8962a" : "#ffb43a"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(bxp - 1.6, byp - 1.8, 1.4, 0, TAU); g.fill();
    g.beginPath(); g.arc(x - 18, BASE_TOP + 9, 1.7, 0, TAU); g.fillStyle = on > 0.5 ? "#7cff6a" : "#4a5a48"; g.fill();
    if (on > 0.5) { g.fillStyle = "rgba(140,255,120,0.35)"; g.beginPath(); g.arc(x - 18, BASE_TOP + 9, 4, 0, TAU); g.fill(); }
    // patas
    g.fillStyle = "#2a2a30"; g.fillRect(x - 27, ENC - 1, 8, 2.5); g.fillRect(x + 19, ENC - 1, 8, 2.5);
    // líneas de vibración
    if (on > 0.05) {
      g.strokeStyle = `rgba(60,30,20,${0.55 * on})`; g.lineWidth = 1.6;
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const xx = x + s * (33 + i * 5), ph = Math.sin(t * 40 + i); g.beginPath(); g.moveTo(xx, BASE_TOP + 8 + ph); g.quadraticCurveTo(xx + s * 3, BASE_TOP + 16, xx, BASE_TOP + 24 - ph); g.stroke(); }
    }
    g.restore();
  }

  /* ---------- cacillo de la proteína (origen en la empuñadura; el cuenco hacia +x) ---------- */
  const CACILLO_REPOSO = { x: 563, y: 284, ang: 1.22 };
  const cuencoDe = c => ({ x: c.x + Math.cos(c.ang) * 26, y: c.y + Math.sin(c.ang) * 26 });
  function dibCacillo(g, c) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.save(); g.translate(c.x, c.y); g.rotate(c.ang);
    g.beginPath(); rr(g, -7, -3.2, 26, 6.4, 3); g.fillStyle = "#33b3c6"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.arc(26, 0, 9.5, 0, TAU); g.fillStyle = "#33b3c6"; g.fill(); g.lineWidth = 2.2; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-3, -1.2); g.lineTo(15, -1.2); g.stroke();
    g.restore();
    // boca del cuenco (siempre hacia arriba en pantalla) y lo que lleva
    const q = cuencoDe(c);
    g.beginPath(); g.ellipse(q.x, q.y - 3, 8, 3.2, 0, 0, TAU); g.fillStyle = "#1f7f8e"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "rgba(20,20,24,0.7)"; g.stroke();
    if (c.avena > 0.02) {
      g.fillStyle = "#d8b97e"; g.strokeStyle = "#8a6a3a"; g.lineWidth = 0.9;
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 6 * Math.sqrt(hash(i * 3.3)) * c.avena; g.beginPath(); g.ellipse(q.x + Math.cos(a) * r, q.y - 4 - Math.abs(Math.sin(a)) * 4 * c.avena - 1.5 * hash(i), 2.6, 1.4, a, 0, TAU); g.fill(); g.stroke(); }
    }
    if (c.prote > 0.02) {
      const k = c.prote, w = 17 * k, h = 20 * k, y0 = q.y - 2;
      g.beginPath(); g.moveTo(q.x - w, y0); g.bezierCurveTo(q.x - w * 0.9, y0 - h * 0.8, q.x - w * 0.35, y0 - h, q.x + 1, y0 - h); g.bezierCurveTo(q.x + w * 0.5, y0 - h, q.x + w * 0.9, y0 - h * 0.7, q.x + w, y0);
      g.quadraticCurveTo(q.x, y0 + 5, q.x - w, y0); g.closePath();
      g.fillStyle = "#f0e2c2"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = "#8f7c58"; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(q.x - w * 0.35, y0 - h * 0.7, w * 0.25, h * 0.12, -0.4, 0, TAU); g.fill();
      g.fillStyle = "rgba(160,140,100,0.55)"; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(q.x - w * 0.7 + w * 1.4 * hash(i * 2.9), y0 - h * 0.75 * hash(i * 6.1), 0.9, 0, TAU); g.fill(); }
    }
    g.restore();
  }

  /* ---------- plátanos ---------- */
  // en la mano: origen en el puño, la fruta hacia «arriba» (−y) girada `ang`; pela 0…1, fruta 0…1
  function dibPlatano(g, b) {
    g.save(); g.translate(b.x, b.y); g.rotate(b.ang || 0); g.lineJoin = "round"; g.lineCap = "round";
    const pela = clamp(b.pela || 0), fruta = b.fruta ?? 1;
    // fruta (crema) que asoma
    if (fruta > 0.01 && pela > 0.02) {
      g.beginPath(); g.moveTo(-5, -2); g.bezierCurveTo(-7, -18, -3, -34, 6, -42); g.quadraticCurveTo(10, -43, 9, -39); g.bezierCurveTo(4, -30, 3, -16, 5, -2); g.closePath();
      g.fillStyle = "#f8eec8"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
      g.strokeStyle = "rgba(190,160,90,0.55)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(1, -6); g.bezierCurveTo(-1, -18, 0, -30, 6, -38); g.stroke();
    }
    // cáscara: cerrada (plátano entero) o abierta en tres tiras que cuelgan
    const tira = (a, l, w) => { g.save(); g.translate(0, -4); g.rotate(a); g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 1.1, -l * 0.6, 0, -l); g.quadraticCurveTo(w * 1.1, -l * 0.6, w, 0); g.closePath();
      g.fillStyle = "#f5d23c"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); g.fillStyle = "#6a4a1c"; g.beginPath(); g.arc(0, -l + 2, 1.6, 0, TAU); g.fill(); g.restore(); };
    if (pela < 0.02) {
      g.beginPath(); g.moveTo(-6, -2); g.bezierCurveTo(-9, -18, -4, -36, 7, -44); g.quadraticCurveTo(12, -45, 11, -40); g.bezierCurveTo(5, -31, 4, -16, 6, -2); g.closePath();
      g.fillStyle = "#f5d23c"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
      g.strokeStyle = "rgba(200,140,20,0.7)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(2, -4); g.bezierCurveTo(0, -18, 2, -32, 8, -40); g.stroke();
      g.fillStyle = "#5a3c14"; g.beginPath(); g.arc(10, -42, 2, 0, TAU); g.fill();
    } else {
      const k = salida(pela);
      tira(lerp(-0.15, -2.55, k), 30, 5.5); tira(lerp(0.15, 2.5, k), 30, 5.5); tira(lerp(0.05, 3.0, k), 26, 5);
    }
    g.restore();
  }
  // la fruta pelada volando (sin cáscara)
  function dibFruta(g, x, y, a, k = 1) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.lineJoin = "round";
    g.beginPath(); g.moveTo(-5, 18); g.bezierCurveTo(-7, 2, -3, -14, 6, -22); g.quadraticCurveTo(10, -23, 9, -19); g.bezierCurveTo(4, -10, 3, 4, 5, 18); g.quadraticCurveTo(0, 21, -5, 18); g.closePath();
    g.fillStyle = "#f8eec8"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(190,160,90,0.55)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(1, 14); g.bezierCurveTo(-1, 2, 0, -10, 6, -18); g.stroke();
    g.restore();
  }
  // cáscara suelta (volando o tirada en la encimera)
  function dibPiel(g, x, y, a, tirada) {
    g.save(); g.translate(x, y); g.rotate(a); g.lineJoin = "round";
    const angs = tirada ? [-2.0, 1.9, 2.9] : [-2.4, 2.3, 3.0];
    for (const an of angs) { g.save(); g.rotate(an); g.scale(1, tirada ? 0.45 : 1); g.beginPath(); g.moveTo(-5, 0); g.quadraticCurveTo(-6, -17, 0, -27); g.quadraticCurveTo(6, -17, 5, 0); g.closePath();
      g.fillStyle = "#f5d23c"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); g.restore(); }
    g.fillStyle = "#e8bf2c"; g.beginPath(); g.arc(0, 0, 5, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#5a3c14"; g.beginPath(); g.arc(0, 0, 2, 0, TAU); g.fill();
    g.restore();
  }

  /* ---------- frutero, tarro de avena, bote de proteína, tapa olvidada ---------- */
  function platanosEnFrutero(t) { return 3 - (t >= T.b1Coge ? 1 : 0) - (t >= T.b2Coge ? 1 : 0); }
  function dibFrutero(g, t) {
    const { x, y } = FRUTERO;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(60,30,10,0.16)"; g.beginPath(); g.ellipse(x, y - 1, 36, 4, 0, 0, TAU); g.fill();
    // fruta del fondo
    const fruta = (fx, fy, r, c1, c2) => { g.beginPath(); g.arc(fx, fy, r, 0, TAU); g.fillStyle = c1; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = c2; g.beginPath(); g.arc(fx - r * 0.35, fy - r * 0.35, r * 0.3, 0, TAU); g.fill(); };
    fruta(x - 17, y - 22, 9, "#e2463a", "rgba(255,200,190,0.8)");
    fruta(x + 1, y - 26, 9.5, "#f39a2b", "rgba(255,230,180,0.8)");
    fruta(x + 18, y - 21, 9, "#d63c34", "rgba(255,200,190,0.8)");
    g.strokeStyle = "#5a3c14"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 17, y - 31); g.lineTo(x - 15, y - 35); g.moveTo(x + 18, y - 30); g.lineTo(x + 20, y - 34); g.stroke();
    // plátanos (racimo tumbado); se van quitando
    const n = platanosEnFrutero(t);
    for (let i = 0; i < n; i++) {
      const dy = -i * 4.5;
      g.beginPath(); g.moveTo(x - 30, y - 15 + dy); g.bezierCurveTo(x - 14, y - 6 + dy, x + 12, y - 8 + dy, x + 28, y - 24 + dy); g.lineTo(x + 30, y - 21 + dy);
      g.bezierCurveTo(x + 14, y - 1 + dy, x - 14, y + 1 + dy, x - 31, y - 11 + dy); g.closePath();
      g.fillStyle = i % 2 ? "#f2cb32" : "#f5d23c"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    }
    if (n > 0) { g.fillStyle = "#5a3c14"; g.beginPath(); g.arc(x + 30, y - 23 - (n - 1) * 4.5, 2.2, 0, TAU); g.fill(); }
    // cuenco azul de cerámica con lunares
    g.beginPath(); g.moveTo(x - 33, y - 16); g.quadraticCurveTo(x - 30, y, x - 12, y); g.lineTo(x + 12, y); g.quadraticCurveTo(x + 30, y, x + 33, y - 16); g.closePath();
    g.fillStyle = "#2f62b0"; g.fill(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.85)"; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x - 24 + i * 8, y - 9 + (i % 2) * 3, 1.5, 0, TAU); g.fill(); }
    g.beginPath(); g.ellipse(x, y - 16, 33, 3.5, 0, 0, TAU); g.lineWidth = 2.2; g.stroke();
    g.restore();
  }
  function dibTarro(g, t) {
    const { x, y } = TARRO, top = y - 40, nivelA = top + 12 + 3 * tramo(t, T.avenaMete, T.avenaSaca);
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(60,30,10,0.16)"; g.beginPath(); g.ellipse(x, y - 1, 16, 3, 0, 0, TAU); g.fill();
    g.beginPath(); rr(g, x - 13, top, 26, 40, 5); g.fillStyle = "rgba(214,236,244,0.5)"; g.fill();
    g.save(); g.beginPath(); rr(g, x - 12, top + 1, 24, 38, 4); g.clip();
    g.fillStyle = "#dcc28a"; g.fillRect(x - 14, nivelA, 28, 50);
    g.fillStyle = "#b99560"; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(x - 11 + 22 * hash(i * 1.7), nivelA + 2 + 26 * hash(i * 2.9), 2.2, 1.1, hash(i) * 3, 0, TAU); g.fill(); }
    g.restore();
    g.beginPath(); rr(g, x - 13, top, 26, 40, 5); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(x, top + 1, 12, 2.6, 0, 0, TAU); g.lineWidth = 1.8; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x - 8, top + 7); g.lineTo(x - 8, y - 6); g.stroke();
    // cuerda de esparto en el cuello
    g.strokeStyle = "#a07a42"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - 13, top + 6); g.lineTo(x + 13, top + 6); g.stroke();
    g.restore();
  }
  function dibBote(g, t, cacilloDentro) {
    const { x, y } = BOTE, top = y - 47, rx = 19;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(60,30,10,0.16)"; g.beginPath(); g.ellipse(x, y - 1, 24, 3.5, 0, 0, TAU); g.fill();
    // boca (con el polvo dentro)
    g.beginPath(); g.ellipse(x, top, rx, 5, 0, 0, TAU); g.fillStyle = "#1c1c22"; g.fill();
    g.beginPath(); g.ellipse(x, top + 2.5, rx - 3, 3.2, 0, 0, TAU); g.fillStyle = "#eee3cc"; g.fill();
    if (cacilloDentro) dibCacillo(g, Object.assign({ avena: 0, prote: 0 }, CACILLO_REPOSO));
    // cuerpo
    g.beginPath(); g.moveTo(x - rx, top); g.lineTo(x - rx, y - 3); g.quadraticCurveTo(x - rx, y, x - rx + 4, y); g.lineTo(x + rx - 4, y); g.quadraticCurveTo(x + rx, y, x + rx, y - 3); g.lineTo(x + rx, top);
    g.ellipse(x, top, rx, 5, 0, 0, Math.PI, false); g.closePath();
    const gr = g.createLinearGradient(x - rx, 0, x + rx, 0); gr.addColorStop(0, "#3a3a44"); gr.addColorStop(0.5, "#24242c"); gr.addColorStop(1, "#141418");
    g.fillStyle = gr; g.fill(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    // etiqueta naranja con una mancuerna blanca (sin letras)
    g.save(); g.beginPath(); g.rect(x - rx, top + 12, rx * 2, 24); g.clip();
    g.fillStyle = "#f3a531"; g.fillRect(x - rx, top + 12, rx * 2, 24);
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x - rx + 3, top + 12, 5, 24);
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - rx, top + 12); g.lineTo(x + rx, top + 12); g.moveTo(x - rx, top + 36); g.lineTo(x + rx, top + 36); g.stroke();
    const my = top + 24; g.fillStyle = "#ffffff";
    g.fillRect(x - 7, my - 1.4, 14, 2.8);
    for (const s of [-1, 1]) { g.beginPath(); rr(g, x + s * 7 - (s < 0 ? 4 : 0), my - 6, 4, 12, 1.2); g.fill(); g.beginPath(); rr(g, x + s * 11.5 - (s < 0 ? 2.5 : 0), my - 4, 2.5, 8, 1); g.fill(); }
    // borde de la boca
    g.beginPath(); g.ellipse(x, top, rx, 5, 0, 0, TAU); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - rx + 4, top + 4); g.lineTo(x - rx + 4, top + 10); g.moveTo(x - rx + 4, top + 38); g.lineTo(x - rx + 4, y - 4); g.stroke();
    g.restore();
  }
  function dibTapa(g) {
    const { x, y } = TAPA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(60,30,10,0.16)"; g.beginPath(); g.ellipse(x, y, 30, 4, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(x, y - 4, 27, 6, 0, 0, TAU); g.fillStyle = "#2b2c33"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(x - 27, y - 4); g.lineTo(x - 27, y - 1); g.ellipse(x, y - 1, 27, 6, 0, Math.PI, 0, true); g.lineTo(x + 27, y - 4); g.stroke();
    g.beginPath(); g.ellipse(x, y - 7, 9, 3, 0, 0, TAU); g.fillStyle = "#3e4049"; g.fill(); g.stroke();
    g.strokeStyle = "rgba(160,166,180,0.7)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x - 4, y - 5.5, 17, 3, 0, 3.4, 4.6); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  // pista de objetivos de pantalla {x, y, ang, d, mo, bol, ma (ángulo del codo en la hoja), ka (cuánto manda ma)}
  function pista(lista, t, ctx) {
    let c = Object.assign({ mo: 0, bol: 0, ang: 0, ka: 0, ma: 0 }, evalua(lista[0][2], t, ctx));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t, ctx), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerpAng(c.ang || 0, o.ang ?? (c.ang || 0), k),
        d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? 0, k), bol: lerp(c.bol || 0, o.bol ?? 0, k),
        ma: lerpAng(c.ma || 0, o.ma ?? (c.ma || 0), k), ka: lerp(c.ka || 0, o.ka ?? 0, k) };
    }
    return c;
  }
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + off;
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, -1.75);
  function manoRig(rig, p, m, lado, bolsillo, dobla, objeto) {
    const h = rig.aHoja(p, m), hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const k = clamp(m.bol || 0);
    const mu0 = lerpAng(muHacia(h, hom, (m.mo || 0)), m.ma || 0, clamp(m.ka || 0));
    const x = lerp(h.x, bolsillo.x, k), y = lerp(h.y, bolsillo.y, k);
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CUERPOS_G = {
    inicio: { torso: 0.02, cab: 0.03, px: 0 }, mira: { torso: 0.05, cab: 0.0, px: 3 },
    asombro: { torso: -0.04, cab: -0.07, px: -2 }, tos: { torso: 0.0, cab: 0.1, px: -4 },
    inclina: { torso: 0.3, cab: 0.16, px: 14 }, golpe: { torso: -0.1, cab: -0.16, px: -6 },
    quieto: { torso: -0.03, cab: 0.0, px: -2 }, seco: { torso: 0.0, cab: 0.03, px: 0 },
    nariz: { torso: 0.0, cab: 0.12, px: 0 }, lame: { torso: -0.02, cab: 0.04, px: 0 },
    mmm: { torso: -0.04, cab: -0.1, px: -1 }, wow: { torso: 0.03, cab: -0.03, px: 2 },
    camara: { torso: 0.02, cab: -0.02, px: 0 }
  };
  const GUION_CUERPO_G = [
    [0.4, 0.8, "mira"], [T.protSaca, T.protSaca + 0.3, "asombro"], [T.protCae + 0.05, T.protCae + 0.25, "tos"],
    [T.inclina0, T.inclina1, "inclina"], [T.erup + 0.02, T.erup + 0.16, "golpe", salida], [T.erup + 0.3, T.erup + 0.9, "quieto"],
    [T.gParpa + 0.2, T.gParpa + 0.6, "seco"], [T.nariz - 0.1, T.nariz + 0.2, "nariz"], [T.lame0, T.lame0 + 0.2, "lame"],
    [T.mmm, T.mmm + 0.25, "mmm"], [T.wow, T.wow + 0.2, "wow", salida], [T.camara, T.camara + 0.4, "camara"]
  ];
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.15, sd: 6, si: 8, sonr: 0.35, ancho: 0.95 }),
    asombro: E({ mx: 0.9, my: -0.1, iris: 0.86, sd: 24, gd: 0.05, si: 26, gi: 0.06, abre: 12, ancho: 0.6, sonr: 0.1 }),
    tos: E({ c: 0.85, z: 0.9, sd: -4, si: -4, abre: 10, ancho: 0.7, sonr: -0.35 }),
    curioso: E({ mx: 0.6, my: 0.8, sd: 16, si: 18, abre: 4, ancho: 0.8, sonr: 0.45 }),
    golpe: E({ c: 1, z: 1, sd: 10, si: 10, abre: 0, ancho: 0.7, sonr: -0.35 }),
    cubierto: E({ c: 1, z: 0.12, sd: 4, si: 4, abre: 0, ancho: 0.62, sonr: -0.2 }),
    parpa: E({ mx: 0.9, my: 0.05, iris: 0.84, c: 0.0, sd: 2, si: 2, abre: 0, ancho: 0.55, sonr: -0.15 }),
    seco: E({ mx: 0.92, my: 0.05, iris: 0.86, c: 0.42, sd: -6, gd: -0.04, si: -8, gi: -0.05, abre: 0, ancho: 0.55, sonr: -0.15 }),
    nariz: E({ mx: 0.45, my: 0.95, iris: 0.92, c: 0.12, sd: 12, si: 12, abre: 6, ancho: 0.7, sonr: 0.05 }),
    lame: E({ mx: 0.45, my: 0.95, iris: 0.92, c: 0.1, sd: 16, si: 16, abre: 20, ancho: 0.8, sonr: 0.2 }),
    mmm: E({ c: 1, h: 1, sd: 14, si: 14, abre: 0, ancho: 0.85, sonr: 0.7 }),
    wow: E({ mx: 0.9, my: -0.05, iris: 1.05, c: 0, sd: 26, gd: 0.04, si: 28, gi: 0.05, abre: 16, ancho: 1.05, sonr: 0.95 }),
    feliz: E({ mx: 0.9, my: 0.05, c: 0.25, h: 0.5, sd: 16, si: 16, abre: 10, ancho: 1.05, sonr: 0.95 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.28, h: 0.5, sd: 16, si: 18, abre: 12, ancho: 1.08, sonr: 0.95 })
  };
  const GUION_CARA_G = [
    [T.protSaca, T.protSaca + 0.2, "asombro"], [T.protCae + 0.08, T.protCae + 0.18, "tos"], [T.inclina0 + 0.1, T.inclina0 + 0.35, "curioso"],
    [T.erup + 0.02, T.erup + 0.08, "golpe", salida], [T.erup + 0.5, T.erup + 0.9, "cubierto"],
    [T.gParpa, T.gParpa + 0.12, "parpa"], [T.gParpa + 0.6, T.gParpa + 1.0, "seco"],
    [T.nariz, T.nariz + 0.25, "nariz"], [T.lame0 - 0.05, T.lame0 + 0.1, "lame"], [T.lame1, T.mmm + 0.1, "mmm"],
    [T.wow, T.wow + 0.12, "wow", salida], [T.wow + 0.45, T.wow + 0.8, "feliz"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const GOTA1_LLEGA = () => T.gota1 + GOTERONES[0].cae;

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const p = { x: XG, suelo: SUELO, s: S, tirasLimpias: true, espejo: false, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    p.hombrosContinuos = true; p.hombrosRecortados = true;
    // tose dos veces con la nube de polvo
    p.cabeza.ang += 0.07 * (campana(t, T.protCae + 0.16, T.protCae + 0.3) + campana(t, T.protCae + 0.42, T.protCae + 0.56));
    p.torso += 0.03 * (campana(t, T.protCae + 0.16, T.protCae + 0.3) + campana(t, T.protCae + 0.42, T.protCae + 0.56));
    // le cae la gota del techo en la cabeza
    p.cabeza.ang += 0.05 * muelle(t, GOTA1_LLEGA(), 30, 7);
    // «mmm»: asiente
    p.cabeza.ang += 0.05 * Math.sin((t - T.mmm) * 11) * dentro(t, T.mmm, T.mmm + 0.1, T.wow - 0.15, T.wow);
    p.pelvis = G.aHoja(p, { x: XG + b.px, y: PY_PIE(G) + respira * 0.8 + 3 * tramo(t, T.inclina0, T.inclina1) * (1 - tramo(t, T.erup, T.erup + 0.3)) });
    const TOB = G.SUELO - G.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: G.CADERA.cerca.x - 12, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.CADERA.lejos.x + 18, y: TOB }, ang: 0 };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // sigue con los ojos todo lo que vuela
    miraA(ex, G, p, focoG(t), dentro(t, T.b1 - 0.05, T.b1 + 0.2, T.protSaca - 0.05, T.protSaca + 0.1));
    miraA(ex, G, p, focoY(t), 0.85 * dentro(t, T.gParpa + 0.6, T.gParpa + 1.0, T.nariz - 0.1, T.nariz + 0.1));
    const cerrado = ex.c > 0.8 || ex.z > 0.4;
    p.cara = cara(ex, cerrado ? 0 : parpadeo(t, [0.3, 2.6, 4.4, 8.7, 10.3, 13.35, 14.0]));
    manosG(p, t);
    return p;
  }
  // a dónde mira Guillermo antes del lío
  function focoG(t) {
    const jarra = { x: BX, y: 225 };
    if (t < T.b1Sale) return pistaY.cerca(t);
    if (t < T.b1Cae) return frutaVuela(t, 1) || jarra;
    if (t < T.b2Sale) return lerpQ(jarra, pistaY.cerca(t), tramo(t, T.b1Cae, T.b1Cae + 0.25));
    if (t < T.b2Cae) return frutaVuela(t, 2) || jarra;
    return lerpQ(jarra, cuencoDe(cacillo(t)), tramo(t, T.b2Cae + 0.05, T.cucharaCoge));
  }
  const lerpQ = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
  function focoY(t) { return Y.aPantalla(poseYcache(t), Y.boca(poseYcache(t))); }

  function manosG(p, t) {
    const PL = [
      [0, 0, { x: 395, y: 372, d: RELAJADA, bol: 1 }],
      [T.inclina0, T.inclina0 + 0.38, { x: 433, y: 345, d: ABIERTA, bol: 0, mo: 0.35 }],
      [T.erup + 0.04, T.erup + 0.34, { x: 404, y: 338, d: ABIERTA, bol: 0, mo: 0.55 }, salida],
      [T.bebe1 + 0.15, T.bebe1 + 0.65, { x: 395, y: 372, d: RELAJADA, bol: 1 }],
      [T.pulgar, T.pulgar + 0.34, { x: 421, y: 306, d: PULGAR, bol: 0, ma: Math.PI, ka: 1 }, salida]
    ];
    const l = pista(PL, t);
    // gotea de los dedos mientras está quieto
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, null);
    const PC = [
      [0, 0, { x: 300, y: 372, d: RELAJADA, bol: 1 }],
      [T.erup + 0.04, T.erup + 0.34, { x: 262, y: 368, d: ABIERTA, bol: 0, mo: -0.45 }, salida],
      [T.bebe1 + 0.15, T.bebe1 + 0.65, { x: 300, y: 372, d: RELAJADA, bol: 1 }]
    ];
    const c = pista(PC, t);
    p.manoCerca = manoRig(G, p, c, "cerca", BOLS_GC, -1, null);
  }

  /* =====================================================================================
   * YORGI (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CUERPOS_Y = {
    inicio: { torso: 0.03, cab: 0.0, px: 0 }, atras: { torso: -0.07, cab: 0.08, px: -4 },
    lanza: { torso: 0.06, cab: -0.12, px: 2 }, cuchara: { torso: 0.1, cab: 0.08, px: 6 },
    luce: { torso: -0.02, cab: -0.08, px: 2 }, echa: { torso: 0.17, cab: 0.1, px: 10 },
    boton: { torso: 0.22, cab: 0.12, px: 12 }, mira: { torso: 0.14, cab: 0.1, px: 10 },
    oh: { torso: 0.06, cab: -0.2, px: 6 }, calma: { torso: 0.04, cab: -0.02, px: 2 },
    coge: { torso: 0.14, cab: 0.04, px: 8 }, bebe: { torso: -0.1, cab: -0.36, px: 0 },
    ahh: { torso: -0.03, cab: -0.12, px: 2 }, limpia: { torso: 0.0, cab: 0.0, px: 0 },
    flexa: { torso: -0.04, cab: 0.04, px: 0 }, camara: { torso: 0.0, cab: -0.02, px: 0 }
  };
  const GUION_CUERPO_Y = [
    [T.b1 - 0.05, T.b1Coge, "atras"], [T.b1Sube, T.b1Pela, "lanza"],
    [T.b2, T.b2Coge, "atras"], [T.b2Sube, T.b2Pela, "lanza"], [T.b2Cae, T.b2Cae + 0.1, "inicio"],
    [T.cuchara, T.avenaMete, "cuchara"], [T.protSaca, T.protSaca + 0.25, "luce"], [T.protEcha - 0.3, T.protEcha, "echa"],
    [T.deja, T.dejaFin, "cuchara"], [T.dejaFin, T.boton, "boton"], [T.boton + 0.1, T.boton + 0.4, "mira"],
    [T.erup, T.erup + 0.25, "oh"], [T.apaga - 0.15, T.apaga, "boton"], [T.apaga + 0.1, T.apaga + 0.5, "calma"],
    [T.coge - 0.3, T.coge, "coge"], [T.bebe0, T.bebe1, "bebe"], [T.bebe2, T.posa, "ahh"], [T.limpia0, T.limpia1, "limpia"],
    [T.flexa0, T.flexa0 + 0.3, "flexa"], [T.flexa1, T.flexa1 + 0.4, "inicio"], [T.camara, T.camara + 0.4, "camara"]
  ];
  const CARAS_Y = {
    inicio: E({ mx: 0.9, my: 0.2, sd: 10, si: 10, sonr: 0.75, ancho: 1.0 }),
    atras: E({ mx: -0.85, my: 0.5, sd: 8, si: 8, sonr: 0.7 }),
    lanza: E({ mx: 0.8, my: -0.4, c: 0.2, sd: 18, si: 18, abre: 16, ancho: 1.0, sonr: 0.85 }),
    cuchara: E({ mx: 0.7, my: 0.6, sd: 6, si: 6, sonr: 0.6 }),
    luce: E({ mx: 0.6, my: -0.3, c: 0.15, h: 0.4, sd: 24, gd: 0.05, si: 10, sonr: 0.95, abre: 8 }),
    echa: E({ mx: 0.7, my: 0.5, sd: 14, si: 14, abre: 12, sonr: 0.85 }),
    mira: E({ mx: 0.8, my: 0.5, sd: 12, si: 12, sonr: 0.85, abre: 4 }),
    oh: E({ mx: 0.5, my: -0.85, sd: 18, si: 22, abre: 8, ancho: 0.55, sonr: 0.3 }),
    calma: E({ mx: 0.9, my: 0.05, c: 0.25, sd: 8, si: 8, sonr: 0.55, ancho: 0.9 }),
    bebe: E({ c: 1, sd: 8, si: 8, abre: 10, ancho: 0.7, sonr: 0.2 }),
    ahh: E({ c: 0.9, h: 1, sd: 14, si: 14, abre: 22, ancho: 1.1, sonr: 0.9 }),
    limpia: E({ mx: 0.9, c: 0.3, h: 0.5, sd: 8, si: 8, abre: 0, sonr: 0.8 }),
    flexa: E({ mx: -0.8, my: 0.0, c: 0.35, h: 0.6, sd: 20, gd: 0.05, si: 4, sonr: 0.95, abre: 6 }),
    camara: E({ mx: 0.85, my: 0.05, c: 0.25, h: 0.5, sd: 14, si: 10, sonr: 0.9, abre: 6 })
  };
  const GUION_CARA_Y = [
    [T.b1 - 0.05, T.b1 + 0.2, "atras"], [T.b1Sube, T.b1Pela, "lanza"],
    [T.b2, T.b2 + 0.2, "atras"], [T.b2Sube, T.b2Pela, "lanza"], [T.b2Cae - 0.1, T.b2Cae + 0.1, "inicio"],
    [T.cuchara, T.cuchara + 0.2, "cuchara"], [T.protSaca, T.protSaca + 0.2, "luce"], [T.protEcha - 0.25, T.protEcha, "echa"],
    [T.boton - 0.3, T.boton, "mira"], [T.erup, T.erup + 0.18, "oh"], [T.erup + 0.7, T.erup + 1.0, "calma"],
    [T.bebe0 + 0.2, T.bebe0 + 0.4, "bebe"], [T.bebe2, T.bebe2 + 0.2, "ahh"], [T.limpia0, T.limpia0 + 0.2, "limpia"],
    [T.flexa0, T.flexa0 + 0.25, "flexa"], [T.flexa1, T.flexa1 + 0.3, "inicio"], [T.camara, T.camara + 0.3, "camara"]
  ];

  // dónde va la empuñadura del cacillo / el agarre de la jarra (pistas de la mano lejana de Yorgi)
  const PL_Y = [
    [0, 0, { x: 560, y: 380, d: RELAJADA, bol: 1, ang: CACILLO_REPOSO.ang }],
    [T.cuchara, T.cucharaCoge, { x: CACILLO_REPOSO.x, y: CACILLO_REPOSO.y, d: AGARRA, bol: 0, ang: CACILLO_REPOSO.ang }],
    [T.cucharaCoge + 0.02, T.avenaMete, { x: 549, y: 274, d: AGARRA, ang: 2.0 }],
    [T.avenaMete + 0.03, T.avenaSaca, { x: 556, y: 250, d: AGARRA, ang: 3.4 }],
    [T.avenaSaca, T.avenaLanza - 0.08, { x: 548, y: 228, d: AGARRA, ang: 3.5 }],
    [T.avenaLanza - 0.08, T.avenaLanza + 0.04, { x: 532, y: 220, d: AGARRA, ang: 2.75 }, entrada],
    [T.avenaLanza + 0.08, T.protMete, { x: 567, y: 278, d: AGARRA, ang: 1.6 }],
    [T.protMete + 0.02, T.protSaca, { x: 560, y: 238, d: AGARRA, ang: 3.25 }],
    [T.protSaca + 0.05, T.protEcha - 0.06, { x: 536, y: 202, d: AGARRA, ang: 3.15 }],
    [T.protEcha - 0.06, T.protEcha + 0.08, { x: 528, y: 198, d: AGARRA, ang: 2.0 }, entrada],
    [T.deja, T.dejaFin, { x: CACILLO_REPOSO.x, y: CACILLO_REPOSO.y, d: AGARRA, ang: CACILLO_REPOSO.ang }],
    [T.dejaFin + 0.02, T.boton - 0.1, { x: 519, y: 318, d: INDICE, ang: 0, mo: 0.2 }],
    [T.boton - 0.1, T.boton, { x: 513, y: 323, d: INDICE }, entrada],
    [T.boton + 0.04, T.boton + 0.22, { x: 519, y: 316, d: INDICE }],
    [T.apaga - 0.12, T.apaga, { x: 513, y: 323, d: INDICE }, entrada],
    [T.apaga + 0.06, T.apaga + 0.4, { x: 560, y: 380, d: RELAJADA, bol: 1, mo: 0 }],
    [T.coge - 0.32, T.coge, () => { const v = vasoEnBase(T.coge); const a = { x: v.x + AGARRE.x, y: v.y + AGARRE.y }; return { x: a.x, y: a.y, d: AGARRA, bol: 0, ang: 0 }; }],
    [T.bebe0, T.bebe1, (t, ctx) => Object.assign(agarreBebe(ctx, angBebe(T.bebe1)), { d: AGARRA, ang: angBebe(T.bebe1) })],
    [T.bebe2, T.posa, () => ({ x: BX + AGARRE.x, y: JUG_Y + AGARRE.y, d: AGARRA, ang: 0 })],
    [T.posa + 0.04, T.limpia0, (t, ctx) => { const b = Y.aPantalla(ctx, Y.boca(ctx)); return { x: b.x - 2, y: b.y + 14, d: PUNO, ang: 0, ma: 0.2, ka: 0.8 }; }],
    [T.limpia0, T.limpia1, (t, ctx) => { const b = Y.aPantalla(ctx, Y.boca(ctx)); return { x: b.x - 40, y: b.y + 20, d: PUNO, ang: 0, ma: 0.25, ka: 0.8 }; }],
    [T.limpia1 + 0.05, T.limpia1 + 0.45, { x: 560, y: 380, d: RELAJADA, bol: 1, ka: 0 }]
  ];
  // agarre para beber: el pico en la boca
  const angBebe = t => lerp(1.78, 2.45, tramo(t, T.bebe1, T.bebe2 - 0.1));
  function agarreBebe(p, ang) {
    const b = Y.aPantalla(p, Y.boca(p));
    const d = rot({ x: PICO.x - AGARRE.x, y: PICO.y - AGARRE.y }, ang);
    return { x: b.x - 3 - d.x, y: b.y + 1 - d.y };
  }
  const FLEXA = { x: 742, y: 190, d: PUNO, bol: 0, ma: Math.PI / 2 + 0.25, ka: 1 };
  const PC_Y = [
    [0, 0, { x: 700, y: 380, d: RELAJADA, bol: 1 }],
    [T.b1, T.b1Coge, { x: 746, y: 322, d: AGARRA, bol: 0 }],
    [T.b1Coge + 0.02, T.b1Sube, { x: 738, y: 232, d: AGARRA }],
    [T.b1Sube, T.b1Pela, { x: 744, y: 240, d: AGARRA }],
    [T.b1Pela, T.b1Sale + 0.05, { x: 730, y: 220, d: AGARRA }, salida],
    [T.b1Piel - 0.12, T.b1Piel, { x: 748, y: 232, d: AGARRA }],
    [T.b1Piel, T.b1Piel + 0.12, { x: 772, y: 246, d: ABIERTA }, salida],
    [T.b2, T.b2Coge, { x: 746, y: 322, d: AGARRA }],
    [T.b2Coge + 0.02, T.b2Sube, { x: 738, y: 232, d: AGARRA }],
    [T.b2Sube, T.b2Pela, { x: 744, y: 240, d: AGARRA }],
    [T.b2Pela, T.b2Sale + 0.05, { x: 730, y: 220, d: AGARRA }, salida],
    [T.b2Piel - 0.1, T.b2Piel, { x: 748, y: 232, d: AGARRA }],
    [T.b2Piel, T.b2Piel + 0.12, { x: 774, y: 246, d: ABIERTA }, salida],
    [T.b2Piel + 0.2, T.b2Piel + 0.6, { x: 700, y: 380, d: RELAJADA, bol: 1 }],
    [T.flexa0, T.flexa0 + 0.3, FLEXA, salida],
    [T.flexa1, T.flexa1 + 0.4, { x: 700, y: 380, d: RELAJADA, bol: 1, ka: 0 }],
    [T.camara + 0.25, T.camara + 0.55, FLEXA, salida]
  ];
  const pistaY = { cerca: t => pista(PC_Y, t) };

  // objetos en las manos de Yorgi
  function platanoMano(t) {
    for (const [c0, pel, sale, piel] of [[T.b1Coge, T.b1Pela, T.b1Sale, T.b1Piel + 0.06], [T.b2Coge, T.b2Pela, T.b2Sale, T.b2Piel + 0.06]]) {
      if (t >= c0 && t < piel) {
        const l = pista(PC_Y, t);
        return { x: l.x, y: l.y - 4, ang: lerp(-0.25, 0.15, tramo(t, c0, pel)), pela: tramo(t, pel, pel + 0.08), fruta: t < sale ? 1 : 0 };
      }
    }
    return null;
  }
  // la fruta en el aire (n = 1 o 2)
  const FRUTA_DESTINO = { x: BX - 2, y: JUG_Y - JH + 14 };
  function frutaVuela(t, n) {
    const sale = n === 1 ? T.b1Sale : T.b2Sale, cae = n === 1 ? T.b1Cae : T.b2Cae;
    if (t < sale || t > cae) return null;
    const l = pista(PC_Y, sale), a = { x: l.x + 2, y: l.y - 26 };
    const u = fase(t, sale, cae), q = arco(a, FRUTA_DESTINO, u, n === 1 ? 150 : 142);
    return { x: q.x, y: q.y, a: -0.2 - u * TAU * (n === 1 ? 1.2 : 1.6), u };
  }
  function pielVuela(t, n) {
    const t0 = n === 1 ? T.b1Piel + 0.06 : T.b2Piel + 0.06, t1 = n === 1 ? T.b1PielCae : T.b2PielCae, fin = n === 1 ? PIEL1 : PIEL2;
    if (t < t0) return null;
    if (t >= t1) return { x: fin.x, y: fin.y - 2, a: n === 1 ? 0.2 : -0.3, tirada: true };
    const l = pista(PC_Y, t0), u = fase(t, t0, t1), q = arco({ x: l.x, y: l.y - 4 }, { x: fin.x, y: fin.y - 2 }, u, 40);
    return { x: q.x, y: q.y, a: u * 4.5, tirada: false };
  }
  // el cacillo: en el bote o en la mano
  function cacillo(t) {
    const enM = t > T.cucharaCoge && t < T.dejaFin;
    const c = enM ? (() => { const l = pista(PL_Y, t); return { x: l.x, y: l.y, ang: l.ang }; })() : Object.assign({}, CACILLO_REPOSO);
    c.enMano = enM;
    c.avena = tramo(t, T.avenaMete + 0.02, T.avenaSaca - 0.04) * (1 - tramo(t, T.avenaLanza - 0.04, T.avenaLanza + 0.02));
    c.prote = tramo(t, T.protMete + 0.04, T.protSaca - 0.06) * (1 - tramo(t, T.protEcha - 0.01, T.protEcha + 0.03));
    return c;
  }

  let CACHE_Y = { t: -1, p: null };
  function poseYcache(t) { if (CACHE_Y.t !== t) CACHE_Y = { t, p: poseY(t) }; return CACHE_Y.p; }
  function poseY(t) {
    const b = guion(GUION_CUERPO_Y, CUERPOS_Y, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = { x: XY, suelo: SUELO, s: S, tirasLimpias: true, espejo: true, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // glu, glu: la nuez sube y baja
    const glu = dentro(t, T.bebe1, T.bebe1 + 0.1, T.bebe2 - 0.1, T.bebe2);
    p.cabeza.ang += 0.025 * Math.sin((t - T.bebe1) * 21) * glu;
    // asiente aprobando la fuente
    p.cabeza.ang += 0.05 * Math.sin((t - T.erup - 0.7) * 9) * dentro(t, T.erup + 0.7, T.erup + 0.8, T.erup + 1.2, T.erup + 1.35);
    // flexa: un pequeño bote de orgullo
    p.torso += 0.02 * Math.sin((t - T.flexa0) * 14) * dentro(t, T.flexa0 + 0.3, T.flexa0 + 0.4, T.flexa1 - 0.2, T.flexa1);
    p.pelvis = Y.aHoja(p, { x: XY - b.px, y: PY_PIE(Y) + respira * 0.8 });
    const TOB = Y.SUELO - Y.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Y.CADERA.cerca.x - 6, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: Y.CADERA.lejos.x + 12, y: TOB }, ang: 0 };
    const ex = guion(GUION_CARA_Y, CARAS_Y, "inicio", t);
    // mira a la fruta que vuela (por encima de su cabeza) y a la jarra
    const f = frutaVuela(t, 1) || frutaVuela(t, 2);
    miraA(ex, Y, p, f, f ? 0.9 * campana(f.u, -0.2, 1.1) : 0, 850, 560);
    miraA(ex, Y, p, cuencoDe(cacillo(t)), dentro(t, T.cucharaCoge, T.cucharaCoge + 0.15, T.protSaca, T.protSaca + 0.1), 850, 560);
    miraA(ex, Y, p, { x: 372, y: 196 }, 0.8 * dentro(t, T.apaga + 0.3, T.apaga + 0.6, T.coge - 0.3, T.coge), 850, 560);
    ex.wd += campana(t, T.guino, T.guino + 0.45) * 1.2;
    const cerrado = ex.c > 0.8 || ex.z > 0.4;
    p.cara = cara(ex, cerrado ? 0 : parpadeo(t, [0.5, 2.55, 5.05, 7.2, 9.95, 11.8, 14.0]));
    manosY(p, t);
    return p;
  }
  function manosY(p, t) {
    const l = pista(PL_Y, t, p);
    // la jarra en la mano: durante el trago el pico sigue la boca
    let objL = null;
    if (enMano(t)) {
      let q = { x: l.x, y: l.y }, ang = l.ang;
      if (t > T.bebe1 && t < T.bebe2) { ang = angBebe(t); q = agarreBebe(p, ang); }
      JARRA_MANO = { q, ang };
      objL = g => conCamara(g, () => dibVaso(g, t, vasoDesdeAgarre(q, ang)));
      if (t > T.bebe1 && t < T.bebe2) { l.x = q.x; l.y = q.y; }
    } else JARRA_MANO = null;
    const cc = cacillo(t);
    if (cc.enMano) objL = g => conCamara(g, () => dibCacillo(g, cc));
    p.manoLejos = manoRig(Y, p, l, "lejos", Y.BOLSILLO_L, -1, objL);
    const c = pista(PC_Y, t);
    // bombea el bíceps dos veces
    const bombea = t0 => Math.abs(Math.sin((t - t0) * 9)) * dentro(t, t0, t0 + 0.08, t0 + 0.62, t0 + 0.7);
    c.y += 7 * (bombea(T.flexa0 + 0.32) + bombea(T.camara + 0.6));
    const pm = platanoMano(t);
    p.manoCerca = manoRig(Y, p, c, "cerca", Y.BOLSILLO_C, 1, pm ? g => conCamara(g, () => dibPlatano(g, pm)) : null);
  }

  /* =====================================================================================
   * TRANSFORMACIONES: retrato / hoja → pantalla
   * ===================================================================================== */
  function afin(f) {
    const O = f({ x: 800, y: 600 }), X = f({ x: 900, y: 600 }), Yp = f({ x: 800, y: 700 });
    const a = (X.x - O.x) / 100, b = (X.y - O.y) / 100, c = (Yp.x - O.x) / 100, d = (Yp.y - O.y) / 100;
    return new DOMMatrix([a, b, c, d, O.x - a * 800 - c * 600, O.y - b * 800 - d * 600]);
  }
  const afinRetrato = (rig, p) => afin(q => rig.aPantalla(p, rig.cabeza(p).a(q)));
  const afinHoja = (rig, p) => afin(q => rig.aPantalla(p, rig.tronco(p)(q)));
  function en(g, M, f) { g.save(); g.transform(M.a, M.b, M.c, M.d, M.e, M.f); f(); g.restore(); }

  /* =====================================================================================
   * BATIDO: pegotes líquidos (contorno común, sombra, brillo y motitas de avena)
   * ===================================================================================== */
  // L: [x, y, r] bola  |  [x, y, r, l] chorretón que cuelga (ancho r arriba, estrecho en medio, gota al final)
  // u: cuántas unidades del sistema actual mide un píxel de pantalla (retrato ≈ 5,5; hoja ≈ 3,3; pantalla 1)
  function batido(g, L, u, motas = true) {
    const forma = () => {
      let hay = false; g.beginPath();
      for (const [x, y, r, l] of L) {
        if (!(r > 0.4)) continue; hay = true;
        if (!l) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); continue; }
        const rb = r * 0.74, xb = x + r * 0.12 * Math.sin(l * 0.07 + x * 0.3);
        // mismo sentido de giro que los círculos (si no, donde se solapan queda un agujero)
        g.moveTo(x + r, y); g.quadraticCurveTo(x + r * 0.4, y + l * 0.55, xb + rb, y + l);
        g.arc(xb, y + l, rb, 0, Math.PI, false);
        g.quadraticCurveTo(x - r * 0.4, y + l * 0.55, x - r, y);
        g.arc(x, y, r, Math.PI, TAU, false); g.closePath();
      }
      return hay;
    };
    if (!forma()) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.lineWidth = 2.6 * u; g.strokeStyle = "#76512c"; g.stroke();
    g.fillStyle = "#c08f52"; g.fill();
    g.clip();
    // sombra abajo a la derecha y brillo arriba a la izquierda: la misma forma desplazada (sin líneas por dentro)
    g.save(); g.translate(-0.7 * u, -2.3 * u); forma(); g.fillStyle = "#fbf0d8"; g.fill(); g.clip();
    g.translate(1.6 * u, 3.6 * u); forma(); g.fillStyle = "#e2bf82"; g.fill(); g.restore();
    g.fillStyle = "rgba(255,255,255,0.95)";
    L.forEach(([x, y, r, l], i) => {
      if (!(r > 3.2 * u)) return;
      if (!l && i % 2) return;
      g.beginPath(); if (!l) g.ellipse(x - r * 0.42, y - r * 0.4, Math.min(r * 0.2, 3 * u), Math.min(r * 0.12, 1.8 * u), -0.7, 0, TAU);
      else g.ellipse(x - r * 0.28, y + l * 0.82, 0.9 * u, Math.min(l * 0.12, 3 * u), 0.15, 0, TAU);
      g.fill();
    });
    if (motas) {
      g.fillStyle = "rgba(140,98,50,0.75)";
      L.forEach(([x, y, r, l], i) => { if (r > 3 * u && !l) for (let j = 0; j < 2; j++) { const a = hash(i * 3.1 + j) * TAU, d = r * 0.6 * hash(i * 5.3 + j); g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.1 * u, 0.6 * u, a, 0, TAU); g.fill(); } });
    }
    g.restore();
  }
  const goteo = (x, y, r, l) => l > r * 0.4 ? [[x, y, r, l]] : [];

  /* ---------- capa de batido sobre Guillermo ---------- */
  const OJOS_G = [{ c: { x: 771, y: 563 }, rx: 40, ry: 29 }, { c: { x: 894, y: 617 }, rx: 32, ry: 25 }];
  const BOCA_G = { c: { x: 803, y: 732 }, ang: 0.26, k: 1.5 };
  let CAPA = null, FL = null;
  const lienzoComo = (w, h, o) => { if (!o || o.width !== w || o.height !== h) { o = document.createElement("canvas"); o.width = w; o.height = h; } return o; };
  const RF = 0.5;
  function huecos(f, base, p, ojo, boca) {
    const M = base.multiply(afinRetrato(G, p));
    f.setTransform(M);
    f.beginPath();
    if (ojo > 0.01) for (const o of OJOS_G) { f.moveTo(o.c.x + o.rx * ojo, o.c.y); f.ellipse(o.c.x, o.c.y, o.rx * ojo, o.ry * ojo, 0.2, 0, TAU); }
    if (boca > 0.01) { f.save(); f.translate(BOCA_G.c.x, BOCA_G.c.y); f.rotate(BOCA_G.ang); f.scale(BOCA_G.k, BOCA_G.k); f.moveTo(50 * boca, 4); f.ellipse(0, 4, 50 * boca, 28 * boca, 0, 0, TAU); f.restore(); }
    f.fill();
  }
  const kBatido = t => tramo(t, T.erup + 0.03, T.erup + 0.28);
  function dibujaG(g, t, pG) {
    const k = kBatido(t);
    if (k <= 0.001) { G.dibujar(g, pG, t); return; }
    const c = g.canvas; CAPA = lienzoComo(c.width, c.height, CAPA);
    FL = lienzoComo(Math.ceil(c.width * RF), Math.ceil(c.height * RF), FL);
    const o = CAPA.getContext("2d"), f = FL.getContext("2d"), Mt = g.getTransform();
    const A = Mt.transformPoint(new DOMPoint(XG - 200, 40)), B = Mt.transformPoint(new DOMPoint(XG + 220, 600));
    const x0 = clamp(Math.floor(Math.min(A.x, B.x)), 0, c.width), x1 = clamp(Math.ceil(Math.max(A.x, B.x)), 0, c.width);
    const y0 = clamp(Math.floor(Math.min(A.y, B.y)), 0, c.height), y1 = clamp(Math.ceil(Math.max(A.y, B.y)), 0, c.height);
    if (x1 <= x0 || y1 <= y0) return;
    const w = x1 - x0, h = y1 - y0;
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = "source-over"; o.clearRect(x0, y0, w, h);
    o.setTransform(Mt);
    G.dibujar(o, pG, t);
    // silueta en beige (mucho arriba, poco abajo), a media resolución
    const fx0 = Math.floor(x0 * RF), fy0 = Math.floor(y0 * RF), fw = Math.ceil(w * RF) + 1, fh = Math.ceil(h * RF) + 1;
    f.setTransform(1, 0, 0, 1, 0, 0); f.globalAlpha = 1; f.globalCompositeOperation = "source-over"; f.clearRect(0, 0, FL.width, FL.height);
    f.drawImage(CAPA, fx0 / RF, fy0 / RF, fw / RF, fh / RF, fx0, fy0, fw, fh);
    f.globalCompositeOperation = "source-in";
    const yP = y => Mt.transformPoint(new DOMPoint(0, y)).y * RF;
    const baja = 14 * tramo(t, T.erup + 0.5, T.erup + 6);              // el batido va escurriendo
    const ya = yP(90), yb = yP(560), st = y => clamp((y - 90) / 470);
    const gr = f.createLinearGradient(0, ya, 0, yb);
    for (const [y, a] of [[90, 0.88], [135, 0.72], [175, 0.5], [215 + baja, 0.46], [250 + baja, 0.5], [282 + baja, 0.38], [312 + baja, 0.2], [350 + baja, 0.08], [420, 0.03], [560, 0.015]])
      gr.addColorStop(st(y), `rgba(238,206,150,${a})`);
    f.fillStyle = gr; f.fillRect(fx0, fy0, fw, fh);
    // huecos: ojos (desde que parpadea) y boca (desde que saca la lengua)
    const base = new DOMMatrix().scale(RF, RF).multiply(Mt);
    const ojo = tramo(t, T.gParpa, T.gParpa + 0.12), boca = tramo(t, T.lame0 - 0.08, T.lame0 + 0.1);
    f.globalCompositeOperation = "destination-out";
    if (ojo + boca > 0.01) huecos(f, base, pG, ojo, boca);
    f.setTransform(1, 0, 0, 1, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(CAPA, x0, y0, w, h, x0, y0, w, h);
    g.globalCompositeOperation = "screen"; g.globalAlpha = 0.66 * k;
    g.drawImage(FL, fx0, fy0, fw, fh, fx0 / RF, fy0 / RF, fw / RF, fh / RF);
    g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.22 * k;
    g.drawImage(FL, fx0, fy0, fw, fh, fx0 / RF, fy0 / RF, fw / RF, fh / RF);
    g.restore();
  }
  // pegotes del pelo, cara y hombros (cada uno llega con su salpicón)
  // casco de batido sobre el pelo (bolas grandes que se solapan: masa lisa) y chorretones
  const PELO_G = [[586, 430, 50], [618, 356, 60], [668, 300, 66], [736, 262, 70], [806, 238, 72], [876, 242, 70], [944, 264, 66],
    [1006, 302, 60], [1054, 352, 50], [710, 340, 56], [836, 310, 60], [962, 346, 52], [1072, 410, 36]];
  const GOTEA_PELO_G = [[716, 372, 22, 96], [1040, 372, 20, 74], [604, 452, 22, 120], [846, 386, 18, 78], [976, 398, 18, 138], [660, 400, 16, 66], [1068, 430, 15, 60]];
  // cara: banda en la frente, moflete de cerca, oreja y barbilla (cada una con su chorretón)
  const CARA_G = [
    [[748, 448, 28], [792, 436, 32], [838, 440, 28], [880, 452, 22]],
    [[664, 736, 28], [688, 760, 22]],
    [[590, 606, 26], [600, 640, 18]],
    [[790, 858, 28], [830, 856, 24], [858, 838, 18]]
  ];
  const GOTEA_CARA_G = [[808, 456, 14, 34], [684, 772, 16, 80], [602, 650, 14, 70], [812, 874, 17, 66]];
  const NARIZ_G = { x: 857, y: 668 };
  const UR = 5.5, UH = 3.3;                         // píxel de pantalla en unidades de retrato / de hoja
  const llegaPegote = (t, i) => tramo(t, T.erup + 0.03 + 0.2 * hash(i * 9.7), T.erup + 0.1 + 0.2 * hash(i * 9.7), salida);
  const escurre = (t, d) => salida(clamp((t - T.erup - 0.3) / d));
  function hombrosG(g, t, k) {
    const a = { x: G.HOMBRO_C.x + 22, y: G.HOMBRO_C.y - 40 }, n = { x: G.CUELLO.x, y: G.CUELLO.y + 50 }, b = { x: G.HOMBRO.x - 14, y: G.HOMBRO.y - 40 };
    const m = (p, q, u) => ({ x: lerp(p.x, q.x, u), y: lerp(p.y, q.y, u) - 8 });
    const L = [];
    [[a, 50], [m(a, n, 0.5), 48], [n, 50], [m(n, b, 0.5), 46], [b, 48]].forEach(([q, r], i) => { const kk = k * llegaPegote(t, 40 + i); if (kk > 0.01) L.push([q.x, q.y, r * kk]); });
    const e = escurre(t, 4.5) * k;
    for (const [q, dx, dy, r, l] of [[a, 10, 30, 22, 84], [m(a, n, 0.5), -6, 34, 18, 60], [n, -10, 36, 24, 130], [m(n, b, 0.5), 4, 34, 18, 100], [b, 6, 30, 20, 70]])
      for (const c of goteo(q.x + dx, q.y + dy, r * Math.min(1, k * 1.5), l * e)) L.push(c);
    batido(g, L, UH);
  }
  function batidoEncimaG(g, t, p) {
    const k = kBatido(t);
    if (k <= 0.01) return;
    en(g, afinHoja(G, p), () => hombrosG(g, t, k));
    en(g, afinRetrato(G, p), () => {
      const L = [], e = escurre(t, 3.6) * k, baja = 9 * tramo(t, T.erup + 0.5, T.erup + 5);
      const plof = campana(t, GOTA1_LLEGA(), GOTA1_LLEGA() + 0.3);
      PELO_G.forEach(([x, y, r], i) => { const kk = k * llegaPegote(t, i); if (kk > 0.01) L.push([x, y + baja, r * kk * (1 + 0.1 * plof * (i === 4 || i === 5 ? 1 : 0))]); });
      for (const [x, y, r, l] of GOTEA_PELO_G) for (const c of goteo(x, y + baja, r, l * e)) L.push(c);
      CARA_G.forEach((grupo, j) => { const kk = k * llegaPegote(t, 20 + j); if (kk > 0.01) for (const [x, y, r] of grupo) L.push([x, y + baja * 0.5, r * kk]); });
      for (const [x, y, r, l] of GOTEA_CARA_G) for (const c of goteo(x, y + baja * 0.5, r, l * e)) L.push(c);
      batido(g, L, UR);
      gotaNariz(g, t);
      lenguaG(g, t);
    });
  }
  // la gota que le cuelga de la nariz (crece; se la lleva la lengua)
  function gotaNariz(g, t) {
    const k = tramo(t, T.erup + 0.25, T.erup + 0.6) * (1 - tramo(t, T.lame - 0.02, T.lame + 0.06));
    if (k <= 0.01) return;
    const l = lerp(10, 40, salida(fase(t, T.erup + 0.4, T.erup + 2.4))) + 2 * Math.sin(t * 3.1);
    batido(g, goteo(NARIZ_G.x, NARIZ_G.y + 4, 11 * k, l * k), UR, false);
  }
  // lengua: sale de la boca, se dobla hacia arriba y llega a la punta de la nariz (retrato)
  function lenguaG(g, t) {
    const s = tramo(t, T.lame0 + 0.02, T.lame - 0.03) * (1 - tramo(t, T.lame + 0.12, T.lame1));
    if (s <= 0.01) return;
    const base = { x: 808, y: 748 }, punta = { x: NARIZ_G.x - 2 + 3 * Math.sin(t * 34) * dentro(t, T.lame - 0.05, T.lame, T.lame + 0.08, T.lame + 0.14), y: NARIZ_G.y + 34 };
    const tip = { x: lerp(base.x + 30, punta.x, salida(s)), y: lerp(base.y + 6, punta.y, salida(s)) };
    const ctl = { x: lerp(base.x + 40, 912, s), y: lerp(base.y + 8, 752, s) };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const traza = () => { g.beginPath(); g.moveTo(base.x, base.y); g.quadraticCurveTo(ctl.x, ctl.y, tip.x, tip.y); };
    traza(); g.lineWidth = 40; g.strokeStyle = "#4a1216"; g.stroke();
    traza(); g.lineWidth = 31; g.strokeStyle = "#ee6e7a"; g.stroke();
    g.beginPath(); g.moveTo(lerp(base.x, ctl.x, 0.3), lerp(base.y, ctl.y, 0.3)); g.quadraticCurveTo(ctl.x - 6, ctl.y - 4, lerp(ctl.x, tip.x, 0.75), lerp(ctl.y, tip.y, 0.75));
    g.lineWidth = 4; g.strokeStyle = "rgba(176,44,62,0.85)"; g.stroke();
    g.fillStyle = "rgba(255,214,220,0.9)"; g.beginPath(); g.ellipse(tip.x - 6, tip.y - 2, 6, 3.5, -0.8, 0, TAU); g.fill();
    // se lleva la gota en la punta
    const lleva = dentro(t, T.lame - 0.02, T.lame + 0.04, T.lame + 0.1, T.lame + 0.2);
    if (lleva > 0.01) batido(g, [[tip.x + 4, tip.y - 8, 10 * lleva], [tip.x - 4, tip.y - 6, 7 * lleva]], UR, false);
    g.restore();
  }

  /* =====================================================================================
   * LA FUENTE: columna hasta el techo, chorro por el pico, gotas, mancha del techo y goterones
   * ===================================================================================== */
  const BOCA_JARRA = { x: BX, y: JUG_Y - JH };
  const subeFuente = t => tramo(t, T.erup, T.techo, salida);
  const bajaFuente = t => tramo(t, T.apaga + 0.02, T.apaga + 0.34, entrada);
  function fuente(g, t) {
    const sube = subeFuente(t), baja = bajaFuente(t);
    if (sube <= 0.001 || baja >= 0.999) return;
    const x0 = BX + vibra(t), y0 = BOCA_JARRA.y + 6;
    const yTop = lerp(y0, TECHO + 6, sube), yBot = lerp(y0, yTop, baja);
    const n = 16, izq = [], der = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, y = lerp(yBot, yTop, u);
      const sobre = clamp((y0 - y) / (y0 - TECHO));
      const w = (lerp(23, 12, Math.min(1, sobre * 1.6)) + 12 * Math.max(0, sobre - 0.8) * 5) * (1 - 0.5 * baja) + 3 * Math.sin(y * 0.11 - t * 30);
      const x = x0 + 4 * Math.sin(y * 0.06 + t * 23) * sobre;
      izq.push({ x: x - w, y }); der.push({ x: x + w, y });
    }
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); M2.curva(g, [...izq, ...der.slice().reverse()], true, 0.5);
    g.lineWidth = 3; g.strokeStyle = "#7d5a32"; g.stroke();
    const gr = g.createLinearGradient(x0 - 22, 0, x0 + 22, 0); gr.addColorStop(0, "#f2dcb0"); gr.addColorStop(0.45, "#e6c690"); gr.addColorStop(1, "#c9a46c");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 3;
    g.beginPath(); M2.curva(g, izq.slice(1, -2).map(q => ({ x: q.x + 7, y: q.y })), false, 0.5); g.stroke();
    // cabeza de la columna (antes de llegar al techo) y bultos
    if (sube < 0.98) batido(g, [[x0, yTop + 4, 20], [x0 - 13, yTop + 10, 13], [x0 + 14, yTop + 9, 12]], 1);
    const bultos = [];
    for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, y = lerp(yBot, yTop, u), s = i % 2 ? -1 : 1; bultos.push([x0 + s * (14 + 3 * Math.sin(t * 17 + i)), y + 6 * Math.sin(t * 13 + i * 2), 6 + 3 * hash(i)]); }
    batido(g, bultos, 1);
    g.restore();
  }
  // chorro por el pico, a la cara de Guillermo
  function chorroPico(g, t, pG) {
    const k = dentro(t, T.erup + 0.01, T.erup + 0.06, T.erup + 0.18, T.erup + 0.3);
    if (k <= 0.01) return;
    const a = { x: BX + PICO.x + vibra(t), y: JUG_Y + PICO.y };
    const cara0 = G.aPantalla(pG, G.cabeza(pG).a({ x: 860, y: 640 }));
    const b = { x: lerp(a.x, cara0.x, salida(fase(t, T.erup, T.erup + 0.06))), y: lerp(a.y, cara0.y, salida(fase(t, T.erup, T.erup + 0.06))) };
    const c = { x: (a.x + b.x) / 2 - 2, y: Math.min(a.y, b.y) - 18 };
    g.save(); g.lineCap = "round";
    const traza = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(c.x, c.y, b.x, b.y); };
    traza(); g.lineWidth = 18 * k + 4; g.strokeStyle = "#7d5a32"; g.stroke();
    traza(); g.lineWidth = 18 * k; g.strokeStyle = "#e6c690"; g.stroke();
    traza(); g.lineWidth = 3 * k; g.strokeStyle = "rgba(255,255,255,0.8)"; g.stroke();
    batido(g, [[b.x, b.y, 14 * k], [b.x - 9, b.y + 6, 9 * k], [b.x + 8, b.y - 7, 8 * k]], 1);
    g.restore();
  }
  // gotas que vuelan (las que dan en la pared, la ventana, la encimera o el suelo dejan mancha)
  const GOTAS = [];
  (() => {
    const g0 = (i) => T.erup + 0.02 + 0.42 * hash(i * 4.4);
    const desde = i => ({ x: BX - 14 + 28 * hash(i * 1.9), y: BOCA_JARRA.y - 20 - 120 * hash(i * 2.7) });
    // a Guillermo (se pierden en él)
    [[440, 150], [418, 120], [400, 176], [452, 230], [380, 250], [430, 200], [460, 168], [395, 140], [350, 118], [372, 270]].forEach(([x, y], i) =>
      GOTAS.push({ t0: T.erup + 0.01 + i * 0.022, d: 0.12 + 0.05 * hash(i), a: { x: BX - 20, y: BOCA_JARRA.y - 10 - 30 * hash(i + 3) }, b: { x, y }, h: 12 + 24 * hash(i + 7), r: 4 + 3 * hash(i + 9), mancha: 0 }));
    // a la pared, al cristal de la ventana y a los azulejos (izquierda)
    [[262, 178], [160, 272], [228, 306], [112, 244]].forEach(([x, y], i) =>
      GOTAS.push({ t0: g0(i + 20), d: 0.28 + 0.08 * hash(i + 21), a: desde(i + 20), b: { x, y }, h: 50 + 40 * hash(i + 22), r: 3.6 + 1.6 * hash(i + 23), mancha: 1 }));
    // a la derecha, por detrás de Yorgi (no le da ni una)
    [[738, 116], [792, 202], [866, 296], [918, 252]].forEach(([x, y], i) =>
      GOTAS.push({ t0: g0(i + 40), d: 0.3 + 0.08 * hash(i + 41), a: desde(i + 40), b: { x, y }, h: 70 + 40 * hash(i + 42), r: 3.4 + 1.6 * hash(i + 43), mancha: 1 }));
    // caen sobre la encimera
    [[440, 342], [526, 340], [404, 343], [612, 341], [462, 343], [826, 338]].forEach(([x, y], i) =>
      GOTAS.push({ t0: g0(i + 60), d: 0.4 + 0.1 * hash(i + 61), a: desde(i + 60), b: { x, y }, h: 60 + 60 * hash(i + 62), r: 3.5 + 2 * hash(i + 63), mancha: 2 }));
  })();
  function gotasVuelan(g, t) {
    g.save(); g.lineWidth = 1.4; g.strokeStyle = "#7d5a32";
    for (const q of GOTAS) {
      const u = (t - q.t0) / q.d; if (u < 0 || u > 1) continue;
      const p = arco(q.a, q.b, u, q.h), p2 = arco(q.a, q.b, Math.max(0, u - 0.06), q.h);
      const ang = Math.atan2(p.y - p2.y, p.x - p2.x), st = Math.min(2.2, 1 + Math.hypot(p.x - p2.x, p.y - p2.y) / 12);
      g.save(); g.translate(p.x, p.y); g.rotate(ang); g.beginPath(); g.ellipse(0, 0, q.r * st, q.r, 0, 0, TAU); g.fillStyle = "#e6c690"; g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(q.r * 0.3, -q.r * 0.35, q.r * 0.3, 0, TAU); g.fill(); g.restore();
    }
    g.restore();
  }
  // manchas que quedan (pared, ventana, encimera): un plaf con gotitas alrededor y un chorretón corto
  function manchas(g, t) {
    GOTAS.forEach((q, i) => {
      if (!q.mancha) return;
      const t1 = q.t0 + q.d; if (t < t1) return;
      const k = tramo(t, t1, t1 + 0.08, salida), r = q.r * 1.25;
      if (q.mancha === 1) {
        const L = [[q.b.x, q.b.y, r * k], [q.b.x + r * 0.5, q.b.y - r * 0.3, r * 0.7 * k]];
        for (const c of goteo(q.b.x - r * 0.2, q.b.y + r * 0.2, r * 0.55, (8 + 10 * hash(i)) * salida(clamp((t - t1) / 2.5)))) L.push(c);
        batido(g, L, 1, false);
        g.save(); g.fillStyle = "#e2bf82"; g.strokeStyle = "#76512c"; g.lineWidth = 0.9;
        for (let j = 0; j < 3; j++) { const a = -2.4 + j * 1.5 + hash(i * 3 + j), d = r * (1.5 + 0.4 * hash(i + j * 7)) * k; g.beginPath(); g.arc(q.b.x + Math.cos(a) * d, q.b.y + Math.sin(a) * d, 1.1 + hash(j + i) * 0.8, 0, TAU); g.fill(); g.stroke(); }
        g.restore();
      } else {
        g.save(); g.translate(q.b.x, q.b.y); g.scale(1, 0.42);
        batido(g, [[0, 0, r * 0.95 * k], [-r * 1.1, 1, r * 0.55 * k], [r * 1.05, 0, r * 0.5 * k]], 1, false); g.restore();
      }
    });
  }
  // mancha del techo y goterones que cuelgan y caen
  const GOTERONES = [
    { x: 388, l: 22, r: 6.5, cae: 0.18, t: T.gota1, hasta: 116, sem: 1 },        // a la cabeza de Guillermo
    { x: 468, l: 18, r: 5.5, cae: 0.27, t: T.bebe0 + 0.3, hasta: BASE_TOP, sem: 2 },      // a la base de la batidora
    { x: 430, l: 15, r: 5, cae: 0.31, t: T.limpia0 + 0.04, hasta: ENC - 2, sem: 3 },        // a la encimera
    { x: 520, l: 20, r: 6, cae: 0, t: 99, hasta: 0, sem: 4 },
    { x: 556, l: 12, r: 4.5, cae: 0, t: 99, hasta: 0, sem: 5 },
    { x: 412, l: 10, r: 4, cae: 0, t: 99, hasta: 0, sem: 6 }
  ];
  function techo(g, t) {
    const k = tramo(t, T.techo - 0.03, T.techo + 0.16, salida);
    if (k <= 0.01) return;
    // chorretones que cuelgan (debajo de la mancha)
    const crece = (t0, d) => salida(clamp((t - t0) / d));
    const D = [];
    for (const q of GOTERONES) {
      let l = q.l * crece(T.techo + 0.1, 0.9 + 0.5 * hash(q.sem));
      if (t > q.t) l = q.l * 0.4 * crece(q.t + 0.15, 1.5);
      for (const c of goteo(q.x, TECHO + 2, q.r * k, l)) D.push(c);
    }
    batido(g, D, 1, false);
    // la mancha, aplastada contra el techo
    const L = [];
    for (let i = 0; i < 9; i++) {
      const u = i / 8, x = lerp(382, 596, u), d = Math.abs(x - BX + 6) / 112;
      const r = (21 - 8 * d * d + 5 * hash(i * 3.1)) * clamp(k * 1.8 - d * 0.8);
      if (r > 0.5) L.push([x, TECHO - 8 + 4 * hash(i * 7.3), r]);
    }
    g.save(); g.translate(0, TECHO); g.scale(1, 0.5); g.translate(0, -TECHO); batido(g, L, 1.5, false); g.restore();
    // la gota que cae y su salpicón
    for (const q of GOTERONES) {
      if (!q.cae || t < q.t) continue;
      const v = t - q.t, y0 = TECHO + 4 + q.l + q.r;
      const y = y0 + 0.5 * 2 * (q.hasta - y0) / (q.cae * q.cae) * v * v;
      if (v < q.cae) batido(g, [[q.x, y, q.r * 0.9], [q.x, y - q.r * 0.9, q.r * 0.6]], 1, false);
      else if (v < q.cae + 0.3) {
        const s = fase(v, q.cae, q.cae + 0.3);
        g.save(); g.globalAlpha = 1 - s; g.fillStyle = "#e6c690"; g.strokeStyle = "#7d5a32"; g.lineWidth = 1;
        const gr = q.sem === 1 ? 1.5 : 1;
        for (let i = 0; i < 6; i++) { const a = -Math.PI + (i + 0.5) * Math.PI / 6; g.beginPath(); g.arc(q.x + Math.cos(a) * 18 * gr * s, q.hasta - 2 + Math.sin(a) * 14 * gr * s + 22 * s * s, 2.4 * gr * (1 - s * 0.5), 0, TAU); g.fill(); g.stroke(); }
        g.restore();
      }
    }
  }
  // manchita que deja en la base y en la encimera la gota del techo
  function manchasGotas(g, t) {
    for (const q of GOTERONES.slice(1, 3)) {
      if (t < q.t + q.cae) continue;
      const k = tramo(t, q.t + q.cae, q.t + q.cae + 0.08, salida);
      g.save(); g.translate(q.x, q.hasta); g.scale(1, 0.4); batido(g, [[0, 0, 6 * k], [-6, 1, 3.5 * k], [6, 0, 3 * k]], 1, false); g.restore();
    }
  }

  /* ---------- lo que vuela antes: plátanos, pieles, avena, proteína y la nube de polvo ---------- */
  function vuelos(g, t) {
    for (const n of [1, 2]) {
      const f = frutaVuela(t, n);
      if (f) {
        // entra en la jarra: se esconde por la boca
        g.save(); g.beginPath(); g.rect(0, -400, 2000, BOCA_JARRA.y + 402); g.clip(); dibFruta(g, f.x, f.y, f.a); g.restore();
      }
      const pv = pielVuela(t, n);
      if (pv && !pv.tirada) dibPiel(g, pv.x, pv.y, pv.a, false);
      // salpicón de leche al caer
      const tc = n === 1 ? T.b1Cae : T.b2Cae, s = fase(t, tc - 0.02, tc + 0.3);
      if (s > 0 && s < 1) {
        g.save(); g.fillStyle = "#fbf8ee"; g.strokeStyle = "rgba(90,90,100,0.8)"; g.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) { const a = -Math.PI + (i + 0.5) * Math.PI / 5; g.beginPath(); g.arc(BX + Math.cos(a) * 22 * s, BOCA_JARRA.y - Math.sin(-a) * 24 * s + 40 * s * s, 2.6 * (1 - s * 0.5), 0, TAU); g.fill(); g.stroke(); }
        g.restore();
      }
    }
    // avena: copos en abanico hacia la jarra
    const ta = T.avenaLanza;
    if (t > ta - 0.01 && t < T.avenaCae + 0.1) {
      const l = pista(PL_Y, ta), q0 = cuencoDe({ x: l.x, y: l.y, ang: l.ang });
      g.save(); g.fillStyle = "#d8b97e"; g.strokeStyle = "#7a5a2e"; g.lineWidth = 0.9;
      for (let i = 0; i < 14; i++) {
        const t0 = ta + 0.01 * i, u = (t - t0) / (T.avenaCae - ta - 0.04); if (u < 0 || u > 1) continue;
        const fin = i < 12 ? { x: BX - 16 + 32 * hash(i * 1.3), y: BOCA_JARRA.y + 8 } : { x: 452 + 30 * (i - 12), y: ENC - 3 };
        const fin2 = i < 12 ? fin : fin;
        const p = arco({ x: q0.x, y: q0.y - 4 }, fin2, u, 26 + 12 * hash(i));
        if (i < 12 && p.y > BOCA_JARRA.y + 2 && u > 0.6) continue;
        g.beginPath(); g.ellipse(p.x, p.y, 2.8, 1.5, u * 8 + i, 0, TAU); g.fill(); g.stroke();
      }
      g.restore();
    }
    // la proteína: el montón cae entero en la jarra
    const tp = T.protEcha;
    if (t > tp && t < T.protCae) {
      const l = pista(PL_Y, tp), q0 = cuencoDe({ x: l.x, y: l.y, ang: l.ang }), u = fase(t, tp, T.protCae);
      const p = arco({ x: q0.x, y: q0.y - 8 }, { x: BX, y: BOCA_JARRA.y + 10 }, entrada(u), 8);
      g.save(); g.beginPath(); g.rect(0, -400, 2000, BOCA_JARRA.y + 402); g.clip();
      g.translate(p.x, p.y); g.rotate(-0.4 * u);
      g.beginPath(); g.moveTo(-16, 6); g.bezierCurveTo(-15, -8, -6, -13, 1, -13); g.bezierCurveTo(8, -13, 15, -7, 16, 6); g.quadraticCurveTo(0, 11, -16, 6); g.closePath();
      g.fillStyle = "#f4ead6"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = "#8f7c58"; g.stroke();
      g.restore();
    }
  }
  function nubePolvo(g, t) {
    const v = t - T.protCae; if (v < 0 || v > 1.05) return;
    g.save();
    for (let i = 0; i < 15; i++) {
      const u = clamp(v / (0.6 + 0.4 * hash(i)));
      const a = -Math.PI / 2 + (hash(i * 3.3) - 0.55) * 2.4;
      const d = 60 * salida(u) * (0.45 + 0.65 * hash(i * 1.7));
      const x = BX + Math.cos(a) * d - 14 * u * u, y = BOCA_JARRA.y - 6 + Math.sin(a) * d - 46 * u;
      const r = (9 + 22 * salida(u)) * (0.6 + 0.5 * hash(i * 2.1));
      g.globalAlpha = 0.85 * (1 - u) * Math.min(1, v * 14);
      g.fillStyle = "#f7f0e0"; g.strokeStyle = "rgba(160,140,110,0.45)"; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }

  // cuando el cacillo está dentro del tarro o del bote, el frente de cristal / plástico va por encima
  function frenteEncima(g, t) {
    const enTarro = dentro(t, T.cucharaCoge + 0.05, T.avenaMete - 0.08, T.avenaMete + 0.04, T.avenaSaca - 0.04);
    const enBote = dentro(t, T.avenaLanza + 0.2, T.protMete - 0.06, T.protMete + 0.04, T.protSaca - 0.06);
    if (enTarro > 0.5) { const { x, y } = TARRO; g.save(); g.beginPath(); g.rect(x - 16, y - 37, 32, 40); g.clip(); dibTarro(g, t); g.restore(); }
    if (enBote > 0.5) { const { x, y } = BOTE; g.save(); g.beginPath(); g.rect(x - 22, y - 44, 44, 48); g.clip(); dibBote(g, t, false); g.restore(); }
  }

  /* ---------- glu, glu y destello del bíceps ---------- */
  function glu(g, t, pY) {
    const k = dentro(t, T.bebe1, T.bebe1 + 0.1, T.bebe2 - 0.15, T.bebe2);
    if (k <= 0.01) return;
    // «glu, glu»: rayitas que salen de la nuca a cada trago
    const cu = Y.aPantalla(pY, Y.tronco(pY)(Y.CUELLO));
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.bebe1) * 3.4 + i / 3) % 1;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      const x = cu.x + 36 + 10 * ph, y = cu.y - 4 - 26 * ph, r = 6 + 4 * ph;
      for (const [w, c] of [[5, "rgba(255,255,255,0.9)"], [2.2, TINTA]]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); g.arc(x, y, r, -1.0, 1.0); g.stroke(); g.beginPath(); g.arc(x + 7, y + 2, r * 0.7, -0.9, 0.9); g.stroke(); }
    }
    // burbujas subiendo por la jarra
    if (JARRA_MANO) {
      const v = vasoDesdeAgarre(JARRA_MANO.q, JARRA_MANO.ang);
      g.globalAlpha = k; g.fillStyle = "rgba(255,255,255,0.9)"; g.strokeStyle = "rgba(120,90,50,0.7)"; g.lineWidth = 1;
      for (let i = 0; i < 4; i++) { const ph = ((t - T.bebe1) * 2.6 + i / 4) % 1, qq = rot({ x: -6 + 12 * hash(i), y: -JH + 10 + 50 * ph }, v.ang); g.beginPath(); g.arc(v.x + qq.x, v.y + qq.y, 1.8 + ph * 1.5, 0, TAU); g.fill(); g.stroke(); }
    }
    g.restore();
  }
  function destello(g, t, pY, t0) {
    const k = campana(t, t0, t0 + 0.55);
    if (k <= 0.01) return;
    const h = Y.aPantalla(pY, Y.tronco(pY)(Y.HOMBRO_C)), q = { x: lerp(h.x, FLEXA.x, 0.55) + 16, y: lerp(h.y, FLEXA.y, 0.3) - 6 };
    g.save(); g.translate(q.x, q.y); g.rotate(t * 2); g.scale(k, k);
    g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 3 : 13, a = i * Math.PI / 4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
    g.fillStyle = "#fffbe0"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#e0a020"; g.stroke();
    g.restore();
    g.save(); g.globalAlpha = k * 0.8; g.fillStyle = "#fffbe0";
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.4; g.beginPath(); g.arc(q.x + Math.cos(a) * 20, q.y + Math.sin(a) * 16, 2.2, 0, TAU); g.fill(); }
    // rayitas de fuerza alrededor del bíceps
    g.globalAlpha = k; g.strokeStyle = TINTA; g.lineWidth = 2; g.lineCap = "round";
    const bi = { x: lerp(h.x, FLEXA.x, 0.5) + 6, y: h.y - 2 };
    for (const [a, l] of [[-2.1, 9], [-1.5, 11], [-0.9, 9]]) { const r0 = 22 + 3 * Math.sin(t * 18); g.beginPath(); g.moveTo(bi.x + Math.cos(a) * r0, bi.y + Math.sin(a) * r0); g.lineTo(bi.x + Math.cos(a) * (r0 + l), bi.y + Math.sin(a) * (r0 + l)); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: la cocina por la mañana
   * ===================================================================================== */
  const VENT = { x0: 130, y0: 84, x1: 318, y1: 226 };
  const TOALLA = { x: 88, y: 116 };
  const BALDA = { x0: 692, x1: 884, y: 168 };
  const AZ0 = 236, AZ1 = 332;                     // azulejos
  const MUEBLE0 = 356, ZOCALO = 474, SUELO_PARED = 484;
  let fondo = null, azulejo = null;
  function creaAzulejo() {
    const c = document.createElement("canvas"); c.width = c.height = 24; const g = c.getContext("2d");
    g.fillStyle = "#f7f4ea"; g.fillRect(0, 0, 24, 24);
    g.fillStyle = "#2c5aa8";
    // flor central de cuatro pétalos y cuartos de flor en las esquinas
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.beginPath(); g.ellipse(12 + Math.cos(a) * 4, 12 + Math.sin(a) * 4, 3.6, 1.8, a, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(12, 12, 1.6, 0, TAU); g.fillStyle = "#f2b233"; g.fill();
    g.fillStyle = "#2c5aa8";
    for (const [x, y] of [[0, 0], [24, 0], [0, 24], [24, 24]]) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
    g.fillStyle = "#7fa2d8"; for (const [x, y] of [[12, 1.5], [12, 22.5], [1.5, 12], [22.5, 12]]) { g.beginPath(); g.arc(x, y, 1.3, 0, TAU); g.fill(); }
    g.strokeStyle = "rgba(150,140,120,0.7)"; g.lineWidth = 1; g.strokeRect(0.5, 0.5, 23, 23);
    return c;
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // techo
    g.fillStyle = "#fbf5e8"; g.fillRect(-60, -50, W + 120, TECHO + 50);
    g.fillStyle = "rgba(200,180,140,0.18)"; g.fillRect(-60, TECHO - 16, W + 120, 16);
    // pared amarilla mantequilla
    const gp = g.createLinearGradient(0, TECHO, 0, AZ1); gp.addColorStop(0, "#fbe8b4"); gp.addColorStop(1, "#f5d68e");
    g.fillStyle = gp; g.fillRect(-60, TECHO, W + 120, AZ1 - TECHO);
    for (let i = 0; i < 240; i++) { g.fillStyle = hash(i * 1.3) < 0.5 ? "rgba(200,150,60,0.06)" : "rgba(255,250,230,0.16)"; g.beginPath(); g.arc(-60 + (W + 120) * hash(i * 2.7), TECHO + (AZ0 - TECHO) * hash(i * 3.9), 2 + 6 * hash(i * 5.1), 0, TAU); g.fill(); }
    // moldura del techo
    g.fillStyle = "#fffaf0"; g.fillRect(-60, TECHO - 8, W + 120, 10);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, TECHO + 2); g.lineTo(W + 60, TECHO + 2); g.stroke();
    g.strokeStyle = "rgba(160,130,80,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-60, TECHO - 3); g.lineTo(W + 60, TECHO - 3); g.stroke();
    g.fillStyle = "rgba(170,120,40,0.12)"; g.fillRect(-60, TECHO + 3, W + 120, 6);
    ventana(g);
    toalla(g);
    balda(g);
    // azulejos
    if (!azulejo) azulejo = creaAzulejo();
    g.save(); g.fillStyle = g.createPattern(azulejo, "repeat"); g.translate(-2, AZ0); g.fillRect(-58, 0, W + 120, AZ1 - AZ0); g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, AZ0); g.lineTo(W + 60, AZ0); g.stroke();
    // alféizar de la ventana sobre los azulejos
    g.fillStyle = "#fffaf0"; g.beginPath(); rr(g, VENT.x0 - 12, VENT.y1, VENT.x1 - VENT.x0 + 24, 9, 2); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    maceta(g, 288, VENT.y1);
    // encimera de madera de carnicero
    g.fillStyle = "#d9a466"; g.fillRect(-60, AZ1, W + 120, ENC - AZ1);
    g.fillStyle = "rgba(255,230,190,0.35)"; g.fillRect(-60, AZ1, W + 120, 3);
    g.fillStyle = "#b97c42"; g.fillRect(-60, ENC, W + 120, MUEBLE0 - ENC);
    g.strokeStyle = "rgba(90,50,20,0.45)"; g.lineWidth = 1;
    for (let x = -60; x < W + 60; x += 34) { g.beginPath(); g.moveTo(x + 17 * hash(x), ENC + 1); g.lineTo(x + 17 * hash(x), MUEBLE0 - 1); g.stroke(); }
    for (let i = 0; i < 30; i++) { const x = -60 + (W + 120) * hash(i * 6.1), y = AZ1 + 3 + (ENC - AZ1 - 5) * hash(i * 2.3); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + 30 * hash(i), y); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-60, AZ1); g.lineTo(W + 60, AZ1); g.moveTo(-60, ENC); g.lineTo(W + 60, ENC); g.moveTo(-60, MUEBLE0); g.lineTo(W + 60, MUEBLE0); g.stroke();
    // muebles verde salvia con tiradores de latón
    g.fillStyle = "#a9c497"; g.fillRect(-60, MUEBLE0, W + 120, ZOCALO - MUEBLE0);
    for (let x = -52; x < W + 60; x += 116) {
      g.fillStyle = "#97b585"; g.beginPath(); rr(g, x + 6, MUEBLE0 + 8, 102, 22, 3); g.fill(); g.lineWidth = 1.6; g.strokeStyle = "rgba(40,60,30,0.7)"; g.stroke();
      for (const dx of [6, 58]) { g.fillStyle = "#97b585"; g.beginPath(); rr(g, x + dx, MUEBLE0 + 36, 50, ZOCALO - MUEBLE0 - 44, 3); g.fill(); g.stroke();
        g.fillStyle = "#b8d2a6"; g.fillRect(x + dx + 4, MUEBLE0 + 40, 3, ZOCALO - MUEBLE0 - 52); }
      g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 58 - 2, MUEBLE0 + 34); g.lineTo(x + 58 - 2, ZOCALO - 6); g.stroke();
      const lat = (lx, ly) => { g.beginPath(); g.arc(lx, ly, 3.4, 0, TAU); g.fillStyle = "#d8a93a"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke(); g.fillStyle = "rgba(255,240,190,0.9)"; g.beginPath(); g.arc(lx - 1, ly - 1, 1, 0, TAU); g.fill(); };
      lat(x + 57, MUEBLE0 + 19); lat(x + 47, MUEBLE0 + 52); lat(x + 67, MUEBLE0 + 52);
    }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, ZOCALO); g.lineTo(W + 60, ZOCALO); g.stroke();
    g.fillStyle = "#4e5c44"; g.fillRect(-60, ZOCALO, W + 120, SUELO_PARED - ZOCALO);
    // suelo de tarima clara
    const gs = g.createLinearGradient(0, SUELO_PARED, 0, H + 50); gs.addColorStop(0, "#d6b07a"); gs.addColorStop(1, "#e8c792");
    g.fillStyle = gs; g.fillRect(-60, SUELO_PARED, W + 120, H + 50 - SUELO_PARED);
    let y = SUELO_PARED, hh = 9, fila = 0;
    g.strokeStyle = "rgba(120,80,40,0.45)"; g.lineWidth = 1.3;
    while (y < H + 50) {
      g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke();
      for (let x = -60 + (fila % 3) * 70; x < W + 60; x += 210) { const sx = (x - 512) * (hh / 60); g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * 0.3, y + hh); g.stroke(); }
      y += hh; hh *= 1.22; fila++;
    }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, SUELO_PARED); g.lineTo(W + 60, SUELO_PARED); g.stroke();
    pesa(g, 905, 556);
    return c;
  }
  function ventana(g) {
    const { x0, y0, x1, y1 } = VENT;
    // cielo de mañana
    const gc = g.createLinearGradient(0, y0, 0, y1); gc.addColorStop(0, "#86cdf0"); gc.addColorStop(0.55, "#c8e9f3"); gc.addColorStop(1, "#ffdcaa");
    g.fillStyle = gc; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    // sol recién salido
    const sol = { x: x0 + 52, y: y1 - 44 };
    const hs = g.createRadialGradient(sol.x, sol.y, 6, sol.x, sol.y, 90); hs.addColorStop(0, "rgba(255,248,200,1)"); hs.addColorStop(0.3, "rgba(255,236,160,0.7)"); hs.addColorStop(1, "rgba(255,230,160,0)");
    g.fillStyle = hs; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.beginPath(); g.arc(sol.x, sol.y, 18, 0, TAU); g.fillStyle = "#fff6c4"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#f5c64a"; g.stroke();
    // nubes
    const nubeC = (x, y, s) => { g.fillStyle = "rgba(255,255,255,0.95)"; for (const [dx, dy, r] of [[0, 0, 10], [12, -5, 12], [25, 0, 9], [12, 3, 10]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, TAU); g.fill(); } };
    nubeC(x0 + 110, y0 + 30, 1.0); nubeC(x0 + 30, y0 + 52, 0.7); nubeC(x1 - 34, y0 + 70, 0.6);
    // tejados a lo lejos
    g.fillStyle = "#c3bfd8"; g.beginPath(); g.moveTo(x0, y1);
    for (const [x, y] of [[x0, y1 - 22], [x0 + 18, y1 - 22], [x0 + 26, y1 - 32], [x0 + 46, y1 - 32], [x0 + 46, y1 - 18], [x0 + 70, y1 - 18], [x0 + 70, y1 - 40], [x0 + 80, y1 - 46], [x0 + 92, y1 - 40], [x0 + 92, y1 - 26], [x0 + 120, y1 - 26], [x0 + 120, y1 - 36], [x0 + 150, y1 - 36], [x0 + 150, y1 - 20], [x1, y1 - 20]]) g.lineTo(x, y);
    g.lineTo(x1, y1); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,240,200,0.8)"; for (const [x, y] of [[x0 + 76, y1 - 34], [x0 + 84, y1 - 34], [x0 + 128, y1 - 30], [x0 + 140, y1 - 30]]) g.fillRect(x, y, 4, 5);
    g.restore();
    // marco blanco con cruz
    g.strokeStyle = "#fffaf2"; g.lineWidth = 10; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    g.lineWidth = 7; g.beginPath(); g.moveTo((x0 + x1) / 2, y0); g.lineTo((x0 + x1) / 2, y1); g.moveTo(x0, (y0 + y1) / 2 - 8); g.lineTo(x1, (y0 + y1) / 2 - 8); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 5, y0 - 5, x1 - x0 + 10, y1 - y0 + 10); g.strokeRect(x0 + 5, y0 + 5, x1 - x0 - 10, y1 - y0 - 10);
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 14, y0 + 40); g.lineTo(x0 + 40, y0 + 14); g.moveTo(x0 + 110, y0 + 64); g.lineTo(x0 + 138, y0 + 36); g.stroke();
  }
  function maceta(g, x, y) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#3f8a3a"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.38; g.beginPath(); g.ellipse(x + Math.cos(a) * 14, y - 18 + Math.sin(a) * 12, 7, 4.2, a, 0, TAU); g.fill(); g.stroke(); }
    g.fillStyle = "#5cab4c"; g.beginPath(); g.ellipse(x, y - 30, 6, 4, -1.4, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - 11, y - 14); g.lineTo(x + 11, y - 14); g.lineTo(x + 8, y); g.lineTo(x - 8, y); g.closePath(); g.fillStyle = "#c8673e"; g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#a9512e"; g.fillRect(x - 12, y - 16, 24, 4); g.strokeRect(x - 12, y - 16, 24, 4);
    g.restore();
  }
  function toalla(g) {
    const { x, y } = TOALLA;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // la toalla de gimnasio, doblada sobre un colgador de madera: la hoja de atrás asoma por debajo
    const flecos = (x0, x1, yb) => { g.strokeStyle = "#f4fbfb"; g.lineWidth = 1.3; for (let fx = x0 + 2; fx < x1 - 1; fx += 3.6) { g.beginPath(); g.moveTo(fx, yb); g.lineTo(fx + 0.5, yb + 5); g.stroke(); } };
    g.beginPath(); g.moveTo(x - 16, y + 6); g.lineTo(x - 13, y + 98); g.quadraticCurveTo(x + 4, y + 101, x + 22, y + 97); g.lineTo(x + 20, y + 6); g.closePath();
    g.fillStyle = "#1f8796"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.save(); g.clip(); g.fillStyle = "#f4fbfb"; g.fillRect(x - 20, y + 84, 46, 4); g.restore();
    flecos(x - 13, x + 22, y + 98);
    g.beginPath(); g.moveTo(x - 22, y + 6); g.quadraticCurveTo(x - 1, y - 12, x + 22, y + 5); g.lineTo(x + 19, y + 74); g.quadraticCurveTo(x, y + 79, x - 21, y + 75); g.closePath();
    g.fillStyle = "#2eb0c1"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    g.save(); g.clip();
    g.fillStyle = "#f4fbfb"; g.fillRect(x - 24, y + 58, 48, 5); g.fillRect(x - 24, y + 66, 48, 2.5);
    g.fillStyle = "rgba(10,60,70,0.25)"; g.fillRect(x + 9, y - 10, 14, 90);
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x - 17, y + 2, 4, 70);
    g.strokeStyle = "rgba(10,60,70,0.35)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 4, y + 2); g.quadraticCurveTo(x - 7, y + 40, x - 3, y + 76); g.moveTo(x + 6, y + 4); g.quadraticCurveTo(x + 9, y + 40, x + 6, y + 76); g.stroke();
    g.restore();
    flecos(x - 21, x + 19, y + 75);
    // colgador (pomo de madera) asomando por encima del pliegue
    g.beginPath(); g.ellipse(x, y - 4, 6, 5, 0, Math.PI, 0); g.fillStyle = "#b07a44"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  function balda(g) {
    const { x0, x1, y } = BALDA;
    g.save(); g.lineJoin = "round";
    // escuadras
    for (const x of [x0 + 20, x1 - 20]) { g.beginPath(); g.moveTo(x, y + 8); g.lineTo(x, y + 30); g.lineTo(x - 3, y + 30); g.lineTo(x - 20 * (x < (x0 + x1) / 2 ? -1 : 1) * 0 - 3, y + 8); g.fillStyle = "#3a3a40"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke(); }
    // tazas
    const taza = (x, c) => { g.beginPath(); rr(g, x - 10, y - 20, 20, 20, 3); g.fillStyle = c; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
      g.beginPath(); g.arc(x + 12, y - 11, 5, -1.3, 1.3); g.lineWidth = 3; g.stroke(); g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(x - 7, y - 17, 3, 14); };
    taza(x0 + 26, "#f3a531"); taza(x0 + 56, "#2f62b0"); taza(x0 + 86, "#e3503c");
    // tarro de frutos secos y maceta colgante
    g.beginPath(); rr(g, x0 + 112, y - 30, 22, 30, 4); g.fillStyle = "rgba(214,236,244,0.6)"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#a0683a"; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(x0 + 116 + 14 * hash(i * 2.2), y - 4 - 14 * hash(i * 3.1), 3, 2, hash(i) * 3, 0, TAU); g.fill(); }
    g.fillStyle = "#c9a040"; g.fillRect(x0 + 110, y - 34, 26, 5); g.strokeRect(x0 + 110, y - 34, 26, 5);
    const mx = x0 + 164;
    g.beginPath(); g.moveTo(mx - 12, y - 18); g.lineTo(mx + 12, y - 18); g.lineTo(mx + 9, y); g.lineTo(mx - 9, y); g.closePath(); g.fillStyle = "#f0ece2"; g.fill(); g.stroke();
    g.strokeStyle = "#3f8a3a"; g.lineWidth = 2.2;
    for (const [dx, l] of [[-8, 50], [2, 70], [9, 40]]) { g.beginPath(); g.moveTo(mx + dx, y - 6); g.quadraticCurveTo(mx + dx + 6, y + l * 0.5, mx + dx - 2, y + l); g.stroke(); }
    g.fillStyle = "#5cab4c"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
    for (const [dx, l] of [[-8, 50], [2, 70], [9, 40]]) for (let i = 1; i <= 4; i++) { const u = i / 4; g.beginPath(); g.ellipse(mx + dx + 4 * Math.sin(u * 3), y - 6 + l * u, 4, 2.6, u * 2, 0, TAU); g.fill(); g.stroke(); }
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(mx - 10 + i * 4, y - 22 - 4 * Math.sin(i), 4, 2.4, -0.5 + i * 0.3, 0, TAU); g.fill(); g.stroke(); }
    // tabla
    g.fillStyle = "#c48a50"; g.beginPath(); rr(g, x0, y, x1 - x0, 8, 2); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,230,190,0.4)"; g.fillRect(x0 + 2, y + 1, x1 - x0 - 4, 2);
    g.restore();
  }
  function pesa(g, x, y) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(60,30,10,0.22)"; g.beginPath(); g.ellipse(x, y + 2, 26, 5, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(x - 13, y - 30); g.quadraticCurveTo(x - 15, y - 50, x, y - 50); g.quadraticCurveTo(x + 15, y - 50, x + 13, y - 30); g.lineWidth = 11; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 7; g.strokeStyle = "#2f3138"; g.stroke();
    g.beginPath(); g.arc(x, y - 18, 21, 0, TAU); g.fillStyle = "#2a2c33"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(x - 8, y - 26, 6, 4, -0.6, 0, TAU); g.fill();
    g.fillStyle = "#f3a531"; g.fillRect(x - 9, y - 21, 18, 6);
    g.restore();
  }
  // rayos de sol y motas de polvo (encima del fondo, debajo de los personajes)
  function sol(g, t) {
    g.save(); g.globalCompositeOperation = "lighter";
    const brilla = 0.9 + 0.1 * Math.sin(t * 1.3);
    for (const [ax, bx, a] of [[VENT.x0 + 10, VENT.x0 + 86, 0.1], [VENT.x0 + 100, VENT.x1 - 6, 0.09]]) {
      const dx = 330, dy = 330;
      const gr = g.createLinearGradient(VENT.x0, VENT.y0, VENT.x0 + dx, VENT.y1 + dy);
      gr.addColorStop(0, `rgba(255,236,170,${a * brilla})`); gr.addColorStop(1, "rgba(255,236,170,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(ax, VENT.y0 + 8); g.lineTo(bx, VENT.y0 + 8); g.lineTo(bx + dx, VENT.y1 + dy); g.lineTo(ax + dx, VENT.y1 + dy); g.closePath(); g.fill();
    }
    // mancha de sol en el suelo
    g.fillStyle = `rgba(255,232,170,${0.16 * brilla})`; g.beginPath(); g.moveTo(410, 500); g.lineTo(560, 500); g.lineTo(640, 590); g.lineTo(470, 590); g.closePath(); g.fill();
    g.restore();
    g.save(); g.fillStyle = "#fff8dc";
    for (let i = 0; i < 22; i++) {
      const u = (t * 0.03 * (0.5 + hash(i)) + hash(i * 2.3)) % 1;
      const x = VENT.x0 + 20 + 160 * hash(i * 1.7) + 260 * u, y = VENT.y0 + 40 + 120 * hash(i * 3.1) + 230 * u + 8 * Math.sin(t * 0.8 + i);
      g.globalAlpha = 0.5 * Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(t * 3 + i));
      g.beginPath(); g.arc(x, y, 1 + hash(i * 5) * 1.3, 0, TAU); g.fill();
    }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = { a: { k: 1.12, x: 492, y: 312 }, b: { k: 1.0, x: 512, y: 300 }, c: { k: 1.42, x: 470, y: 290 }, d: { k: 2.2, x: 408, y: 206 } };
  function camara(t) {
    const mz = (p, q, k) => ({ k: lerp(p.k, q.k, k), x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k) });
    let c = PLANOS.a;
    c = mz(c, PLANOS.b, tramo(t, T.erup - 0.74, T.erup - 0.12));
    c = mz(c, PLANOS.a, tramo(t, T.gParpa - 0.2, T.gParpa + 0.7));
    c = mz(c, PLANOS.c, tramo(t, T.flexa0 - 0.11, T.flexa0 + 0.49));
    c = mz(c, PLANOS.d, tramo(t, T.nariz - 0.28, T.nariz + 0.32));
    c = mz(c, PLANOS.a, tramo(t, T.pulgar + 0.42, T.pulgar + 1.1));
    const s = muelle(t, T.erup + 0.02, 42, 6) * 3;
    return { k: c.k, x: c.x + s, y: c.y + s * 0.6 };
  }

  function poses(t) { return { g: poseG(t), y: poseYcache(t) }; }

  class ElBatido extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Y.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pY = poseYcache(t);
      const luz = tramo(t, NEGRO_INICIO, 0.7, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -60, -50);
      sol(g, t);
      manchas(g, t);
      techo(g, t);
      // la encimera
      dibTapa(g);
      dibTarro(g, t);
      const cc = cacillo(t);
      dibBote(g, t, !cc.enMano);
      dibFrutero(g, t);
      for (const n of [1, 2]) { const pv = pielVuela(t, n); if (pv && pv.tirada) dibPiel(g, pv.x, pv.y, pv.a, true); }
      dibBase(g, t);
      if (!enMano(t)) dibVaso(g, t, vasoEnBase(t));
      manchasGotas(g, t);
      // los dos
      Y.dibujar(g, pY, t);
      frenteEncima(g, t);
      dibujaG(g, t, pG);
      batidoEncimaG(g, t, pG);
      glu(g, t, pY);
      destello(g, t, pY, T.chispa);
      destello(g, t, pY, T.camara + 0.6);
      // lo que vuela
      vuelos(g, t);
      nubePolvo(g, t);
      fuente(g, t);
      chorroPico(g, t, pG);
      gotasVuelan(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00131", nombre: "Guillermo y Yorgi · El batido de proteínas", crear: () => new ElBatido() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["y", Y, poseY(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L);
    }
    return out;
  }
  window.__A2D_00131 = { pose: poses, poseG, poseY, T, DUR, diag };
})();
