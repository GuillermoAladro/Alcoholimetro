"use strict";
/* 00113.2 · Guillermo y Rodri · El concurso de eructos
 *
 * Negro → un bar de noche: a la izquierda la barra con su espejo, las baldas de botellas y un colgador
 * de copas boca abajo sobre la barra; a la derecha, pared azul noche con rayas doradas y zócalo de caoba,
 * un cuadro antiguo de una gaseosa colgado de un clavo y un aplique. En medio, un barril de mesa alta con
 * una cubitera llena de botellines de gaseosa; en el suelo, a la izquierda, una caja de botellas vacías.
 *
 * Brindan con sus gaseosas, se las beben de un trago y plantan los cascos vacíos en el barril → Rodri,
 * con sonrisa de reto, se da dos golpes en el pecho, se hincha y suelta un eructo enorme: ondas que
 * tiemblan, una nubecilla, las copas del colgador tintinean y a él le bailan los carrillos → muy chulo,
 * mira a cámara → Guillermo se palmea la tripa, se concentra… y le sale un «pío»: una ondita y una
 * burbuja que explota. Rodri se parte de risa señalándole → Guillermo se pica (vena) y se lanza a la
 * cubitera: un botellín, otro, otro, de un trago y lanzando los cascos por encima del hombro a la caja;
 * se va hinchando (tripa, carrillos, ojos llorosos, colorado y temblando). Rodri deja de reír → Guillermo
 * aguanta… Rodri se acerca a mirar → ¡EL ERUCTO!: una onda gigante que le echa a Rodri el pelo hacia
 * atrás, sacude la cámara, hace tintinear todo y descuelga el cuadro, que se columpia y cae al suelo con
 * el cristal rajado → silencio: Guillermo se deshincha, en la gloria; Rodri, despeinado y pasmado, mira el
 * cuadro, mira a Guillermo y aplaude despacio; pulgar arriba. Guillermo mira a cámara y guiña → negro.
 *
 * Sin textos. Los botellines se dibujan en pantalla dentro de la mano (debajo de los dedos); la gaseosa es
 * el interior del botellín recortado por una superficie que queda siempre horizontal. El pelo de Rodri al
 * viento usa la propia pieza de su cabeza, como en 00077: se borra el pelo de arriba (fondo cacheado o
 * piel) y se vuelve a pintar en franjas desplazadas hacia atrás. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, R = Rodri;
  const DUR = 14.9;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // brindis: las dos gaseosas
    choca: 0.9, bebe0: 1.12, bebe1: 1.95, deja: 2.3,
    // el eructo de Rodri
    rReta: 2.45, rPecho0: 2.62, rPecho1: 3.08, rInfla: 3.12, rEructo: 3.42, rEructo1: 4.2, rChulo: 4.35, rPresumeCamara: 4.62,
    // el «pío» de Guillermo
    gPrepara: 4.85, gPalmea: 5.0, gConcentra: 5.32, gPio: 5.74, gVerguenza: 6.12,
    rRie0: 6.0, rRie1: 7.65,
    // el atracón: cada botellín (coge, a la boca, de un trago, lo lanza)
    gPica: 6.46, b: [6.75, 7.73, 8.71],
    rPreocupa: 8.3, gAguanta: 9.55, rAcerca: 9.5,
    // ¡el eructo!
    gEructo: 10.05, gEructo1: 10.95, golpe: 10.187,
    cuadroSalta: 10.64, cuadroCae: 11.06,
    gAlivio: 11.0, rMiraCuadro: 11.38, rMiraG: 11.84,
    rAplauso0: 12.05, aplausos: [12.3, 12.6, 12.9], rPulgar: 13.1,
    gCamara: 12.65, gGuino: 13.55, rCamara: 13.48,
    fin: 14.05
  };
  // tiempos de cada botellín del atracón
  const BT = T.b.map(t0 => ({ coge: t0, boca: t0 + 0.2, trago1: t0 + 0.56, lanza: t0 + 0.68, suelta: t0 + 0.74 }));
  const VUELO = 0.62;

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8), ABIERTA = D(1, 1),
    AGARRA = D(0.2, 0.25, 0.22, 0.22, 0.25), PUNO = D(0.1, 0.05, 0.05, 0.05, 0.05),
    SENALA = D(0.15, 1, 0.05, 0.05, 0.05), PULGAR = D(1, 0.04, 0.04, 0.04, 0.04);
  // golpe amortiguado que empieza en t0
  const muelle = (t, t0, f, dec) => t < t0 ? 0 : Math.exp(-(t - t0) * dec) * Math.sin((t - t0) * f);

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

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.3, SUELO = 562;
  const XG = 400, XR = 634;                         // pelvis de cada uno (Rodri mira a la izquierda)
  const BARRIL = { x: 517, y: 344, rx: 58, ry: 11 };
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const CUBO = { x: 492, y: BARRIL.y - 1, w: 40, h: 34 };                     // cubitera (base en el barril)
  const EN_CUBO = [{ x: 481, y: 303, ang: -0.18 }, { x: 494, y: 300, ang: 0.04 }, { x: 506, y: 304, ang: 0.22 }];
  const ESC_B = 1.4;                                                         // tamaño de los botellines
  const VACIO_G = { x: 466, y: BARRIL.y - 3 - 14 * ESC_B }, VACIO_R = { x: 567, y: BARRIL.y - 3 - 14 * ESC_B };
  const CAJA = { x: 236, y: 522, w: 84, h: 40 };                             // caja de cascos en el suelo
  const EN_CAJA = [{ x: 238, y: 520 }, { x: 251, y: 522 }, { x: 263, y: 521 }];

  /* =====================================================================================
   * BOTELLÍN (pantalla; origen donde agarra la mano; cuello hacia −y)
   * ===================================================================================== */
  const P = (x, y) => ({ x, y });
  const CONT_D = [[6.6, 14], [7, 11.5], [7, -3.5], [6.3, -7.5], [3.6, -14], [2.7, -18], [2.7, -28], [3.3, -28.6], [3.3, -31.4], [0, -31.4]];
  const CONT = [...CONT_D.map(([x, y]) => P(x, y)), ...CONT_D.slice(0, -1).reverse().map(([x, y]) => P(-x, y))];
  const INT_D = [[5.6, 12.6], [5.8, -3.4], [5.2, -7.4], [2.6, -13.8], [1.6, -17.8], [1.6, -30.4], [0, -30.4]];
  const INT = [...INT_D.map(([x, y]) => P(x, y)), ...INT_D.slice(0, -1).reverse().map(([x, y]) => P(-x, y))];
  const PUNTA = { x: 0, y: -31.4 * ESC_B };
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
    for (let i = 0; i < 16; i++) { const m = (lo + hi) / 2; if (area(recorta(INT, n, m)) > objetivo) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const poli = (g, pts) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); };
  const LIQ = {
    naranja: ["#e8730f", "#ffa22e", "#ffc77a"], cola: ["#3a1a0c", "#6a3415", "#b8723f"],
    limon: ["#b9c21a", "#e4ea4a", "#f5f7a0"], fresa: ["#c4183a", "#ee4a62", "#ffa0b0"]
  };
  /* b = { x, y, ang, vol (0…1), liq, t, frio (gotitas de frío), chap (chapoteo extra) } */
  function dibBotella(g, b) {
    g.save(); g.translate(b.x, b.y); g.rotate(b.ang || 0); g.scale(b.esc || ESC_B, b.esc || ESC_B); g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); poli(g, CONT); g.fillStyle = "rgba(196,232,214,0.42)"; g.fill();
    const vol = b.vol || 0, col = LIQ[b.liq || "naranja"];
    if (vol > 0.004) {
      const n = rot({ x: 0, y: 1 }, -(b.ang || 0) + (b.chap || 0));
      const cl = nivel(n, vol), pl = recorta(INT, n, cl);
      if (pl.length > 2) {
        g.save(); g.beginPath(); poli(g, pl); g.fillStyle = col[0]; g.fill(); g.clip();
        g.fillStyle = col[1]; g.globalAlpha = 0.85; g.fillRect(-2.5, -32, 3.6, 46);
        // burbujas que suben hacia la superficie
        g.globalAlpha = 0.85; g.fillStyle = col[2];
        for (let i = 0; i < 6; i++) {
          const ph = ((b.t || 0) * (0.9 + 0.5 * hash(i + 3)) + hash(i + 1)) % 1, lado = (hash(i + 9) - 0.5) * 8;
          const q = { x: n.x * (cl + 14 * (1 - ph)) + -n.y * lado, y: n.y * (cl + 14 * (1 - ph)) + n.x * lado };
          g.beginPath(); g.arc(q.x, q.y, 0.7 + 0.6 * hash(i + 5), 0, Math.PI * 2); g.fill();
        }
        g.restore();
        const ss = pl.filter(q => q.sup);
        if (ss.length >= 2) { g.strokeStyle = col[2]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ss[0].x, ss[0].y); g.lineTo(ss[1].x, ss[1].y); g.stroke(); }
      }
    }
    // relieve del cristal, brillos y contorno
    g.save(); g.beginPath(); poli(g, CONT); g.clip();
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-4.4, 10); g.lineTo(-4.6, -4); g.lineTo(-2, -13); g.stroke();
    g.strokeStyle = "rgba(40,80,60,0.35)"; g.lineWidth = 0.9;
    for (const x of [-1.5, 1.8, 4.5]) { g.beginPath(); g.moveTo(x, 9); g.lineTo(x, 1); g.stroke(); }
    if (b.frio) { g.fillStyle = "rgba(255,255,255,0.7)";
      for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(-5 + 10 * hash(i + 21), -4 + 16 * hash(i + 22), 0.7, 1, 0, 0, Math.PI * 2); g.fill(); } }
    g.restore();
    g.beginPath(); poli(g, CONT); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(-3.3, -28.6); g.lineTo(3.3, -28.6); g.lineWidth = 1; g.stroke();
    g.restore();
  }
  const enBotella = (b, q) => { const r = rot(q, b.ang || 0); return { x: b.x + r.x, y: b.y + r.y }; };
  // agarre del botellín con la punta del cuello en un punto (la boca)
  const BRINDIS = { x: 517, y: 191 };
  function posaBrindis(lado) {
    const ang = 0.3 * lado, cuello = rot(P(lado * 3.3 * ESC_B, PUNTA.y), ang);
    return { x: BRINDIS.x - cuello.x, y: BRINDIS.y - cuello.y, ang, d: AGARRA };
  }
  const botellaEn = (pt, ang) => { const r = rot(PUNTA, ang); return { x: pt.x - r.x, y: pt.y - r.y }; };

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  // pista de objetivos de pantalla {x, y, ang, d, mo, bol, ma (mu absoluto de la hoja), ka (su peso)}
  function pista(lista, t, ctx) {
    let c = Object.assign({ mo: 0, bol: 0, ma: 0, ka: 0 }, evalua(lista[0][2], t, ctx));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t, ctx), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerpAng(c.ang || 0, o.ang ?? (c.ang || 0), k),
        d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol || 0, k),
        ma: lerpAng(c.ma || 0, o.ma ?? (c.ma || 0), k), ka: lerp(c.ka || 0, o.ka || 0, k) };
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
    let mu0 = muHacia(h, hom, (m.mo || 0));
    if ((m.ka || 0) > 0.001) mu0 = lerpAng(mu0, m.ma, m.ka);
    const x = lerp(h.x, bolsillo.x, k), y = lerp(h.y, bolsillo.y, k);
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }
  // mano con el antebrazo horizontal hacia delante (pulgar arriba, señalar): se construye desde el codo
  function manoAnte(rig, p, lado, angBrazo, alarga = 1) {
    const PZ = rig.A.datos.piezas, pz = lado === "cerca" ? PZ.brazo_cerca : PZ.brazo;
    const Lt = lado === "cerca" ? rig.BRAZO_C_L : rig.BRAZO_L, Lu = lado === "cerca" ? pz.codo : (rig === G ? Lt * 0.5 : pz.codo);
    const hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const codo = { x: hom.x + Lu * Math.sin(angBrazo), y: hom.y + Lu * Math.cos(angBrazo) };
    const mun = { x: codo.x + (Lt - Lu) * 0.97 * alarga, y: codo.y };
    const h = { x: mun.x + rig.MUNECA_R * rig.JK, y: mun.y };
    return rig.aPantalla(p, h);
  }

  /* =====================================================================================
   * GASEOSA EN LA MANO: volumen y chapoteo
   * ===================================================================================== */
  function volG(t) {           // el primer botellín de Guillermo
    return 0.84 * (1 - tramo(t, T.bebe0 + 0.16, T.bebe1 - 0.05, s => s));
  }
  function volR(t) { return 0.84 * (1 - tramo(t, T.bebe0 + 0.16, T.bebe1 - 0.1, s => s)); }
  const volB = (t, i) => 0.86 * (1 - tramo(t, BT[i].boca + 0.04, BT[i].trago1, s => s));
  function chap(t, t0) { return t > t0 ? 0.16 * Math.exp(-(t - t0) * 6) * Math.sin((t - t0) * 15) : 0; }

  /* =====================================================================================
   * HINCHAZÓN DE GUILLERMO
   * ===================================================================================== */
  function infla(t) {
    let k = 0;
    BT.forEach((b, i) => { k += 0.3 * tramo(t, b.boca + 0.1, b.trago1 + 0.15); });
    k += 0.12 * tramo(t, T.gAguanta - 0.2, T.gAguanta + 0.3);
    k *= 1 - tramo(t, T.gEructo + 0.05, T.gEructo1 - 0.1, salida);
    return clamp(k, 0, 1.05);
  }

  /* =====================================================================================
   * RODRI (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_R = {
    inicio: E({ mx: 0.9, my: 0.15, c: 0.25, sd: 4, si: 4, sonr: 0.5, ancho: 0.95 }),
    brinda: E({ mx: 0.9, my: 0.0, c: 0.35, h: 0.45, sd: 8, si: 8, abre: 8, ancho: 1.05, sonr: 0.8 }),
    traga: E({ c: 1, sd: 6, si: 6, abre: 10, ancho: 0.55, sonr: 0, mof: 0.2 }),
    ahh: E({ mx: 0.6, c: 0.75, h: 0.5, sd: 6, si: 6, abre: 12, ancho: 0.95, sonr: 0.55 }),
    reta: E({ mx: 0.95, my: 0.05, c: 0.38, sd: 2, gd: -0.06, si: 10, gi: 0.05, sonr: 0.75, ancho: 1.05 }),
    infla: E({ mx: 0.4, my: -0.5, iris: 0.92, c: 0.15, sd: 10, si: 10, abre: 0, ancho: 0.6, sonr: 0.15, mof: 0.55 }),
    eructo: E({ c: 1, z: 0.7, sd: 8, si: 8, abre: 34, ancho: 1.12, sonr: 0.05 }),
    chulo: E({ mx: 0.7, my: 0.1, c: 0.55, h: 0.55, sd: 4, si: 4, abre: 0, ancho: 1.0, sonr: 0.9 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.42, h: 0.3, sd: 4, si: 4, abre: 4, ancho: 1.05, sonr: 0.85 }),
    mira: E({ mx: 0.9, my: 0.2, c: 0.25, sd: 6, si: 6, abre: 2, ancho: 0.95, sonr: 0.45 }),
    risa: E({ mx: 0.7, my: 0.3, c: 1, h: 1, sd: 10, si: 10, abre: 24, ancho: 1.1, sonr: 0.95 }),
    preocupa: E({ mx: 0.9, my: 0.05, iris: 0.86, c: 0, sd: 14, gd: 0.15, si: 14, gi: 0.15, abre: 6, ancho: 0.6, sonr: -0.3 }),
    curioso: E({ mx: 0.95, my: 0.1, c: 0.12, sd: 10, si: 12, abre: 3, ancho: 0.7, sonr: 0.05 }),
    soplado: E({ mx: 0.5, c: 1, z: 1, sd: 6, si: 6, abre: 12, ancho: 1.15, sonr: -0.55 }),
    pasmo: E({ mx: 0.9, my: 0.0, iris: 0.72, c: 0, sd: 18, si: 18, abre: 10, ancho: 0.55, sonr: -0.15 }),
    cuadro: E({ mx: -0.95, my: -0.2, iris: 0.8, c: 0, sd: 16, si: 16, abre: 8, ancho: 0.55, sonr: -0.1 }),
    aplaude: E({ mx: 0.9, my: 0.15, c: 0.35, h: 0.35, sd: 8, si: 8, abre: 2, ancho: 0.95, sonr: 0.55 }),
    final: E({ mx: -0.85, my: 0.05, c: 0.4, h: 0.3, sd: 6, si: 6, abre: 4, ancho: 1.0, sonr: 0.8, wd: 0 })
  };
  const GUION_CARA_R = [
    [0.55, 0.85, "brinda"], [T.bebe0, T.bebe0 + 0.12, "traga"], [T.bebe1 - 0.05, T.bebe1 + 0.15, "ahh"], [T.deja + 0.05, T.deja + 0.2, "reta"],
    [T.rInfla - 0.05, T.rInfla + 0.15, "infla"], [T.rEructo - 0.02, T.rEructo + 0.06, "eructo"], [T.rEructo1 - 0.1, T.rEructo1 + 0.15, "chulo"],
    [T.rPresumeCamara, T.rPresumeCamara + 0.2, "camara"], [T.gPrepara + 0.05, T.gPrepara + 0.3, "mira"], [T.rRie0 - 0.04, T.rRie0 + 0.12, "risa"],
    [T.rPreocupa, T.rPreocupa + 0.3, "preocupa"], [T.rAcerca, T.rAcerca + 0.3, "curioso"], [T.golpe, T.golpe + 0.06, "soplado"],
    [T.gEructo1 - 0.1, T.gEructo1 + 0.2, "pasmo"], [T.rMiraCuadro, T.rMiraCuadro + 0.2, "cuadro"], [T.rMiraG, T.rMiraG + 0.2, "pasmo"],
    [T.rAplauso0, T.rAplauso0 + 0.3, "aplaude"], [T.rCamara, T.rCamara + 0.25, "final"]
  ];
  const CUERPOS_R = {
    inicio: { torso: 0.02, cab: 0.02, dx: 0 }, brinda: { torso: 0.08, cab: 0.05, dx: 0 }, traga: { torso: -0.06, cab: -0.26, dx: 0 },
    ahh: { torso: 0.0, cab: -0.05, dx: 0 }, reta: { torso: 0.04, cab: 0.08, dx: 0 }, pecho: { torso: -0.02, cab: -0.02, dx: 0 },
    infla: { torso: -0.1, cab: -0.22, dx: 0 }, eructo: { torso: 0.12, cab: 0.2, dx: 0 }, chulo: { torso: -0.05, cab: -0.14, dx: 0 },
    mira: { torso: 0.02, cab: 0.04, dx: 0 }, risa: { torso: 0.2, cab: 0.18, dx: 0 }, preocupa: { torso: -0.02, cab: 0.0, dx: 4 },
    acerca: { torso: 0.16, cab: 0.18, dx: -8 }, soplado: { torso: -0.1, cab: -0.3, dx: 10 }, pasmo: { torso: -0.03, cab: -0.06, dx: 8 },
    cuadro: { torso: -0.03, cab: -0.22, dx: 8 }, aplaude: { torso: 0.02, cab: 0.04, dx: 6 }
  };
  const GUION_CUERPO_R = [
    [0.5, 0.85, "brinda"], [T.bebe0 - 0.05, T.bebe0 + 0.2, "traga"], [T.bebe1 - 0.05, T.bebe1 + 0.2, "ahh"], [T.deja, T.deja + 0.2, "reta"],
    [T.rPecho0 - 0.05, T.rPecho0 + 0.1, "pecho"], [T.rInfla, T.rEructo - 0.02, "infla"], [T.rEructo - 0.02, T.rEructo + 0.08, "eructo", salida],
    [T.rEructo1 - 0.15, T.rEructo1 + 0.2, "chulo"], [T.gPrepara, T.gPrepara + 0.3, "mira"], [T.rRie0 - 0.04, T.rRie0 + 0.2, "risa"],
    [T.rRie1 - 0.25, T.rRie1, "mira"], [T.rPreocupa, T.rPreocupa + 0.4, "preocupa"], [T.rAcerca, T.rAcerca + 0.45, "acerca"],
    [T.golpe, T.golpe + 0.08, "soplado", salida], [T.gEructo1 - 0.1, T.gEructo1 + 0.4, "pasmo"],
    [T.rMiraCuadro, T.rMiraCuadro + 0.3, "cuadro"], [T.rMiraG, T.rMiraG + 0.3, "pasmo"], [T.rAplauso0, T.rAplauso0 + 0.3, "aplaude"]
  ];
  const CHEST_R = { x: 312, y: 392 }, BARRIGA_R = { x: 300, y: 560 }, APLAUSO_R = { x: 372, y: 430 };

  function poseR(t) {
    const b = guion(GUION_CUERPO_R, CUERPOS_R, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = {
      x: XR, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // se hincha antes del eructo
    const hin = dentro(t, T.rInfla, T.rEructo - 0.04, T.rEructo, T.rEructo + 0.35);
    p.torsoEsc.y += 0.035 * hin; p.torsoEsc.x += 0.05 * hin;
    // el eructo: le tiembla todo
    const er = dentro(t, T.rEructo, T.rEructo + 0.05, T.rEructo1 - 0.2, T.rEructo1);
    p.cabeza.ang += 0.03 * Math.sin(t * 52) * er; p.cabeza.dx += 1.5 * Math.sin(t * 41) * er;
    // la risa: los hombros se sacuden
    const rie = dentro(t, T.rRie0, T.rRie0 + 0.15, T.rRie1 - 0.3, T.rRie1);
    p.torso += 0.035 * Math.sin((t - T.rRie0) * 21) * rie; p.cabeza.ang += 0.04 * Math.sin((t - T.rRie0) * 21 + 0.6) * rie;
    // la onda gigante: le empuja y luego vibra
    p.torso += 0.05 * muelle(t, T.golpe, 26, 5) * -1;
    p.cabeza.ang += 0.07 * muelle(t, T.golpe + 0.03, 24, 4.5) * -1;
    // aplausos lentos: un golpecito de cabeza en cada uno
    for (const a of T.aplausos) p.cabeza.ang += 0.03 * campana(t, a - 0.05, a + 0.18);
    const dx = b.dx + 2 * muelle(t, T.golpe, 20, 6);
    p.pelvis = R.aHoja(p, { x: XR + dx, y: PY_PIE(R) + respira * 0.8 });
    const TOB = R.SUELO - R.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: R.CADERA.cerca.x - 6, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: R.CADERA.lejos.x + 12, y: TOB }, ang: 0 };
    const ex = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    // el eructo le hace vibrar la cara (los carrillos se dibujan en capaCabezaR)
    if (er > 0) { ex.abre += 6 * Math.sin(t * 47) * er; p.cabeza.esc.x = 1 + 0.025 * Math.sin(t * 43) * er; }
    // risa a carcajadas: la boca se abre y se cierra
    if (rie > 0) ex.abre += 8 * Math.abs(Math.sin((t - T.rRie0) * 10.5)) * rie;
    // soplado: la cara tiembla con el viento
    const viento = vientoR(t);
    if (viento.v > 0.01) { ex.abre += 3 * Math.sin(t * 43) * viento.v; p.cabeza.esc.x += 0.015 * Math.sin(t * 39) * viento.v; }
    ex.mof = 0;
    // guiño final
    ex.wd += 0.6 * campana(t, T.rCamara + 0.32, T.rCamara + 0.72) * 1.4;
    p.cara = cara(ex, (ex.c > 0.8 || ex.z > 0.4) ? 0 : parpadeo(t, [0.4, 2.6, 5.2, 7.9, 11.08, 11.26, 12.45]));
    p.rojo = 0.22 * campana(t, T.rInfla, T.rEructo + 0.25) + 0.25 * dentro(t, T.rRie0 + 0.2, T.rRie0 + 0.5, T.rRie1 - 0.4, T.rRie1);
    manosR(p, t);
    p.capaCabeza = (g, tt) => capaCabezaR(g, tt, p);
    return p;
  }

  function manosR(p, t) {
    const boca = R.aPantalla(p, R.boca(p)), Tr = R.tronco(p);
    const aP = q => R.aPantalla(p, Tr(q));
    // mano lejana (la de delante, hacia Guillermo): el botellín; luego señala, aplaude y levanta el pulgar
    const bebe = tt => { const a = lerp(1.8, 2.25, tramo(tt, T.bebe0 + 0.1, T.bebe1 - 0.05)), c = botellaEn(boca, a); return { x: c.x, y: c.y, ang: a, d: AGARRA }; };
    const PL = [
      [0, 0, { x: 572, y: 300, ang: 0.1, d: AGARRA }],
      [0.45, 0.8, { x: 543, y: 238, ang: -0.25, d: AGARRA }],
      [0.8, T.choca, posaBrindis(-1), entrada],
      [T.choca, T.choca + 0.16, { x: 546, y: 240, ang: -0.08, d: AGARRA }],
      [T.bebe0 - 0.05, T.bebe0 + 0.15, bebe],
      [T.bebe1 - 0.02, T.deja - 0.14, { x: VACIO_R.x, y: VACIO_R.y - 16, ang: 0, d: AGARRA }],
      [T.deja - 0.14, T.deja, { x: VACIO_R.x, y: VACIO_R.y, ang: 0, d: AGARRA }, entrada],
      [T.deja + 0.04, T.deja + 0.18, { x: VACIO_R.x + 4, y: VACIO_R.y - 8, ang: 0, d: ABRE }],
      [T.deja + 0.18, T.deja + 0.55, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1 }],
      // se ríe señalándole (brazo estirado)
      [T.rRie0 + 0.06, T.rRie0 + 0.3, () => Object.assign(manoAnte(R, p, "lejos", 1.25), { ang: 0, d: SENALA, bol: 0, ma: Math.PI, ka: 1 })],
      [T.rRie0 + 0.6, T.rRie0 + 0.95, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1, ka: 0 }],
      // el aplauso lento
      [T.rAplauso0, T.rAplauso0 + 0.25, () => Object.assign(aP(aplausoR(t, "lejos")), { ang: 0, d: ABIERTA, bol: 0, mo: -0.3 })],
      // pulgar arriba con el antebrazo horizontal
      [T.rPulgar, T.rPulgar + 0.28, () => Object.assign(manoAnte(R, p, "lejos", 0.78), { ang: 0, d: PULGAR, bol: 0, mo: 0, ma: Math.PI, ka: 1 })]
    ];
    const l = pista(PL, t);
    const rie = dentro(t, T.rRie0 + 0.2, T.rRie0 + 0.3, T.rRie0 + 0.55, T.rRie0 + 0.7);
    if (rie > 0) l.y += 2.5 * Math.sin((t - T.rRie0) * 21) * rie;
    const lleva = t < T.deja + 0.02;
    const bot = { x: l.x, y: l.y, ang: l.ang, vol: volR(t), liq: "cola", t, chap: chap(t, T.choca) + chap(t, T.deja) };
    p.botella = lleva ? bot : null;
    p.manoLejos = manoRig(R, p, l, "lejos", R.BOLSILLO_L, -1, lleva ? (g => conCamara(g, () => dibBotella(g, bot))) : null);

    // mano cercana: golpes en el pecho, la barriga al reír, el aplauso
    const golpe = tt => { const k = Math.max(campana(tt, T.rPecho0 + 0.06, T.rPecho0 + 0.26), campana(tt, T.rPecho0 + 0.3, T.rPecho0 + 0.5));
      const q = aP({ x: CHEST_R.x + 26 - 26 * (1 - k), y: CHEST_R.y }); return { x: q.x, y: q.y, ang: 0, d: PUNO, mo: 0.15 }; };
    const PC = [
      [0, 0, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1 }],
      [T.rPecho0 - 0.18, T.rPecho0 + 0.06, () => Object.assign(golpe(t), { bol: 0 })],
      [T.rPecho1, T.rPecho1 + 0.3, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1 }],
      [T.rRie0 - 0.05, T.rRie0 + 0.25, () => Object.assign(aP(BARRIGA_R), { ang: 0, d: RELAJADA, bol: 0, mo: 0.9 })],
      [T.rRie1 - 0.4, T.rRie1 - 0.05, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1, mo: 0 }],
      [T.rAplauso0, T.rAplauso0 + 0.25, () => Object.assign(aP(aplausoR(t, "cerca")), { ang: 0, d: ABIERTA, bol: 0, mo: 0.2 })],
      [T.rPulgar - 0.05, T.rPulgar + 0.35, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    ];
    let c = pista(PC, t);
    if (t > T.rPecho0 - 0.05 && t < T.rPecho1) c = Object.assign({}, c, golpe(t), { bol: c.bol });
    p.manoCerca = manoRig(R, p, c, "cerca", R.BOLSILLO_C, -1, null);
  }
  // aplauso: las dos manos se separan y se juntan (golpes en T.aplausos)
  function aplausoR(t, lado) {
    let sep = 1;
    for (const a of T.aplausos) sep = Math.min(sep, clamp(Math.abs(t - a) / 0.15));
    sep = 0.15 + 0.85 * suave(sep);
    const dx = (lado === "lejos" ? 1 : -1) * 62 * sep;
    return { x: APLAUSO_R.x + dx, y: APLAUSO_R.y + (lado === "lejos" ? -4 : 4) };
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.2, c: 0.2, sd: 10, gd: 0.04, si: 12, gi: 0.06, abre: 0, ancho: 0.95, sonr: 0.45 }),
    brinda: E({ mx: 0.9, my: 0.0, c: 0.35, h: 0.5, sd: 14, gd: 0.04, si: 14, gi: 0.04, abre: 10, ancho: 1.05, sonr: 0.85 }),
    traga: E({ c: 1, sd: 10, gd: 0.04, si: 10, gi: 0.04, abre: 12, ancho: 0.55, sonr: 0, mof: 0.25 }),
    ahh: E({ mx: 0.6, c: 0.8, h: 0.5, sd: 10, si: 10, abre: 12, ancho: 0.95, sonr: 0.6 }),
    atento: E({ mx: 0.9, my: 0.1, c: 0.15, sd: 14, gd: 0.06, si: 16, gi: 0.08, abre: 2, ancho: 0.85, sonr: 0.2 }),
    soplado: E({ mx: 0.5, c: 1, z: 1, sd: 4, gd: 0.1, si: 4, gi: 0.1, abre: 0, ancho: 0.7, sonr: -0.4 }),
    impres: E({ mx: 0.9, my: 0.05, iris: 0.85, c: 0, sd: 24, gd: 0.12, si: 24, gi: 0.14, abre: 14, ancho: 0.55, sonr: 0.05 }),
    decidido: E({ mx: 0.6, my: 0.4, c: 0.35, sd: -4, gd: -0.12, si: 2, gi: -0.04, abre: 0, ancho: 0.95, sonr: 0.35 }),
    concentra: E({ c: 1, z: 0.7, sd: 6, gd: 0.1, si: 6, gi: 0.1, abre: 0, ancho: 0.45, sonr: -0.2, mof: 0.55 }),
    pio: E({ mx: 0.3, my: -0.3, iris: 0.9, c: 0.15, sd: 20, gd: 0.1, si: 20, gi: 0.1, abre: 5, ancho: 0.32, sonr: 0 }),
    verguenza: E({ mx: -0.85, my: 0.1, c: 0.38, sd: 4, gd: 0.18, si: 4, gi: 0.18, abre: 0, ancho: 0.6, sonr: -0.25 }),
    picado: E({ mx: 0.9, my: 0.1, c: 0.3, sd: -8, gd: -0.18, si: -8, gi: -0.18, abre: 0, ancho: 0.75, sonr: -0.35 }),
    chupa: E({ c: 1, sd: 6, gd: 0.05, si: 6, gi: 0.05, abre: 14, ancho: 0.6, sonr: 0, mof: 0.35 }),
    lleno: E({ mx: 0.5, my: 0.2, iris: 0.74, c: 0, sd: 24, gd: 0.16, si: 24, gi: 0.16, abre: 0, ancho: 0.36, sonr: -0.1, mof: 1 }),
    eructo: E({ c: 1, z: 1, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 44, ancho: 1.25, sonr: -0.15 }),
    alivio: E({ c: 1, h: 0.8, sd: 12, gd: 0.04, si: 12, gi: 0.04, abre: 5, ancho: 0.9, sonr: 0.8 }),
    orgullo: E({ mx: -0.85, my: 0.05, c: 0.35, h: 0.45, sd: 14, gd: 0.05, si: 16, gi: 0.07, abre: 6, ancho: 1.05, sonr: 0.95 })
  };
  const GUION_CARA_G = [
    [0.55, 0.85, "brinda"], [T.bebe0, T.bebe0 + 0.12, "traga"], [T.bebe1 - 0.05, T.bebe1 + 0.15, "ahh"], [T.deja + 0.05, T.deja + 0.25, "atento"],
    [T.rEructo + 0.1, T.rEructo + 0.18, "soplado"], [T.rEructo1 - 0.05, T.rEructo1 + 0.2, "impres"], [T.gPrepara, T.gPrepara + 0.25, "decidido"],
    [T.gConcentra, T.gConcentra + 0.2, "concentra"], [T.gPio - 0.03, T.gPio + 0.05, "pio"], [T.gVerguenza, T.gVerguenza + 0.2, "verguenza"],
    [T.gPica, T.gPica + 0.15, "picado"],
    ...BT.flatMap((b, i) => [[b.boca - 0.08, b.boca + 0.05, "chupa"], [b.lanza - 0.04, b.lanza + 0.1, i < 2 ? "picado" : "lleno"]]),
    [T.gAguanta - 0.1, T.gAguanta + 0.15, "lleno"], [T.gEructo - 0.03, T.gEructo + 0.05, "eructo", salida],
    [T.gAlivio - 0.05, T.gAlivio + 0.3, "alivio"], [T.gCamara, T.gCamara + 0.25, "orgullo"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.03, cab: 0.02 }, brinda: { torso: 0.08, cab: 0.06 }, traga: { torso: -0.1, cab: -0.5 }, ahh: { torso: 0.0, cab: -0.05 },
    atento: { torso: 0.03, cab: 0.05 }, soplado: { torso: -0.1, cab: -0.16 }, decide: { torso: 0.02, cab: 0.0 },
    concentra: { torso: -0.04, cab: 0.1 }, pio: { torso: 0.02, cab: -0.1 }, verguenza: { torso: 0.0, cab: 0.08 },
    picado: { torso: 0.06, cab: 0.06 }, coge: { torso: 0.12, cab: 0.1 }, chupa: { torso: -0.12, cab: -0.56 }, lanza: { torso: -0.06, cab: -0.1 },
    lleno: { torso: -0.04, cab: -0.04 }, eructo: { torso: 0.16, cab: 0.32 }, alivio: { torso: -0.02, cab: -0.1 }, orgullo: { torso: 0.0, cab: -0.04 }
  };
  const GUION_CUERPO_G = [
    [0.5, 0.85, "brinda"], [T.bebe0 - 0.05, T.bebe0 + 0.2, "traga"], [T.bebe1 - 0.05, T.bebe1 + 0.2, "ahh"], [T.deja, T.deja + 0.2, "atento"],
    [T.rEructo + 0.1, T.rEructo + 0.2, "soplado", salida], [T.rEructo1 - 0.1, T.rEructo1 + 0.25, "atento"], [T.gPrepara, T.gPrepara + 0.25, "decide"],
    [T.gConcentra, T.gConcentra + 0.3, "concentra"], [T.gPio - 0.03, T.gPio + 0.06, "pio"], [T.gVerguenza, T.gVerguenza + 0.2, "verguenza"],
    [T.gPica, T.gPica + 0.2, "picado"],
    ...BT.flatMap(b => [[b.coge - 0.08, b.coge + 0.08, "coge"], [b.boca - 0.1, b.boca + 0.06, "chupa"], [b.trago1 - 0.02, b.lanza + 0.04, "lanza", salida]]),
    [T.gAguanta - 0.1, T.gAguanta + 0.2, "lleno"], [T.gEructo - 0.04, T.gEructo + 0.05, "eructo", salida],
    [T.gAlivio, T.gAlivio + 0.35, "alivio"], [T.gCamara, T.gCamara + 0.3, "orgullo"]
  ];
  const BARRIGA_G = { x: 336, y: 560 };

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const inf = infla(t);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1 + 0.2 * inf, y: 1 + 0.04 * inf + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // aguanta: tiembla entero
    const temb = dentro(t, T.gAguanta - 0.3, T.gAguanta + 0.1, T.gEructo - 0.02, T.gEructo);
    p.torso += 0.012 * Math.sin(t * 61) * temb; p.cabeza.ang += 0.02 * Math.sin(t * 53 + 1) * temb; p.cabeza.dx += 1.2 * Math.sin(t * 47) * temb;
    // el eructo de Rodri le despeina un poco
    p.cabeza.ang += -0.05 * muelle(t, T.rEructo + 0.12, 22, 5);
    // su eructo: retroceso de cabeza y tembleque
    const er = dentro(t, T.gEructo, T.gEructo + 0.04, T.gEructo1 - 0.25, T.gEructo1);
    p.cabeza.ang += 0.035 * Math.sin(t * 50) * er; p.cabeza.dx += 2 * Math.sin(t * 43) * er;
    // trago: la garganta sube y baja
    let glu = dentro(t, T.bebe0 + 0.12, T.bebe0 + 0.2, T.bebe1 - 0.12, T.bebe1 - 0.05);
    BT.forEach(bb => { glu = Math.max(glu, dentro(t, bb.boca, bb.boca + 0.06, bb.trago1 - 0.06, bb.trago1)); });
    p.cabeza.dy += 3 * Math.abs(Math.sin(t * Math.PI * 6)) * glu;
    // pío: un saltito
    const pio = campana(t, T.gPio - 0.02, T.gPio + 0.2);
    p.pelvis = G.aHoja(p, { x: XG, y: PY_PIE(G) + respira * 0.9 - 4 * pio + 2 * inf });
    const TOB = G.SUELO - G.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: G.CADERA.cerca.x - 8 - 10 * inf, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.CADERA.lejos.x + 14 + 10 * inf, y: TOB }, ang: 0 };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // se va hinchando: carrillos y ojos saltones
    ex.mof = Math.max(ex.mof, 0.9 * inf);
    if (temb > 0) { ex.mof = lerp(ex.mof, 1 + 0.08 * Math.sin(t * 40), temb); }
    // durante el eructo la boca vibra
    if (er > 0) ex.abre += 5 * Math.sin(t * 45) * er;
    ex.wd += 0.6 * campana(t, T.gGuino, T.gGuino + 0.4) * 1.4;
    p.cara = cara(ex, (ex.c > 0.8 || ex.z > 0.4) ? 0 : parpadeo(t, [0.6, 2.75, 4.7, 6.3, 11.75, 12.4]));
    p.rojo = 0.28 * campana(t, T.gConcentra, T.gPio + 0.15) + 0.3 * campana(t, T.gVerguenza - 0.1, T.gVerguenza + 0.9) + 0.6 * clamp(inf * 1.2) * (1 - tramo(t, T.gEructo, T.gEructo1));
    p.enfado = 0.9 * dentro(t, T.gPica - 0.05, T.gPica + 0.15, BT[1].coge, BT[1].boca);
    p.sudor = 0.7 * dentro(t, T.gAguanta - 0.5, T.gAguanta, T.gEructo, T.gEructo + 0.3);
    p._inf = inf;
    manosG(p, t);
    p.capaTronco = g => panza(g, inf);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p, inf);
    return p;
  }

  function manosG(p, t) {
    const boca = G.aPantalla(p, G.boca(p)), Tr = G.tronco(p), H = G.cabeza(p);
    const aP = q => G.aPantalla(p, Tr(q));
    const bebe = (a0, a1, t0, t1) => tt => { const a = lerp(a0, a1, tramo(tt, t0, t1)), c = botellaEn(boca, a); return { x: c.x, y: c.y, ang: a, d: AGARRA }; };
    // lanza el casco por encima de la cabeza: un golpe de muñeca hacia atrás desde donde acaba el trago
    const tope = botellaEn(boca, -2.3);
    const PL = [
      [0, 0, { x: 450, y: 292, ang: 0, d: AGARRA }],
      [0.45, 0.8, { x: 491, y: 238, ang: 0.25, d: AGARRA }],
      [0.8, T.choca, posaBrindis(1), entrada],
      [T.choca, T.choca + 0.16, { x: 488, y: 240, ang: 0.08, d: AGARRA }],
      [T.bebe0 - 0.05, T.bebe0 + 0.15, bebe(-1.85, -2.4, T.bebe0 + 0.1, T.bebe1 - 0.05)],
      [T.bebe1 - 0.02, T.deja - 0.14, { x: VACIO_G.x, y: VACIO_G.y - 16, ang: 0, d: AGARRA }],
      [T.deja - 0.14, T.deja, { x: VACIO_G.x, y: VACIO_G.y, ang: 0, d: AGARRA }, entrada],
      [T.deja + 0.04, T.deja + 0.18, { x: VACIO_G.x - 4, y: VACIO_G.y - 8, ang: 0, d: ABRE }],
      [T.deja + 0.18, T.deja + 0.55, { x: 420, y: 330, ang: 0, d: RELAJADA, bol: 1 }]
    ];
    BT.forEach((b, i) => {
      const cb = EN_CUBO[i];
      PL.push(
        [b.coge - 0.24, b.coge, { x: cb.x, y: cb.y, ang: cb.ang, d: ABRE, bol: 0 }],
        [b.coge, b.coge + 0.05, { x: cb.x, y: cb.y, ang: cb.ang, d: AGARRA }],
        [b.coge + 0.05, b.boca, bebe(-1.75, -2.3, b.boca, b.trago1)],
        [b.trago1, b.lanza, () => ({ x: tope.x - 8, y: tope.y - 12, ang: -3.3, d: AGARRA }), salida],
        [b.lanza, b.suelta, () => ({ x: tope.x - 18, y: tope.y - 22, ang: -3.6, d: AGARRA }), entrada],
        [b.suelta, b.suelta + 0.11, () => ({ x: tope.x - 24, y: tope.y - 19, ang: -3.72, d: ABRE }), salida]
      );
    });
    PL.push(
      // aguanta: se agarra la tripa
      [BT[2].suelta, BT[2].suelta + 0.32, () => Object.assign(aP({ x: BARRIGA_G.x + 30, y: BARRIGA_G.y - 30 }), { ang: 0, d: ABIERTA, bol: 0, mo: 0.4 })],
      [T.gEructo - 0.05, T.gEructo + 0.12, () => Object.assign(aP({ x: BARRIGA_G.x + 40, y: BARRIGA_G.y + 10 }), { ang: 0, d: ABIERTA, mo: 0.4 })],
      [T.gAlivio + 0.4, T.gAlivio + 0.8, { x: 420, y: 330, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    );
    const l = pista(PL, t);
    p.agarreBotella = { x: l.x, y: l.y, ang: l.ang };
    // ¿qué lleva en la mano?
    let bot = null;
    if (t < T.deja + 0.02) bot = { vol: volG(t), liq: "naranja", chap: chap(t, T.choca) + chap(t, T.deja) };
    BT.forEach((b, i) => { if (t >= b.coge && t < b.suelta) bot = { vol: volB(t, i), liq: LIQ_B[i], chap: chap(t, b.coge), frio: true }; });
    if (bot) Object.assign(bot, { x: l.x, y: l.y, ang: l.ang, t });
    p.botella = bot;
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, bot ? (g => conCamara(g, () => dibBotella(g, bot))) : null);

    // mano cercana: palmea la tripa antes del pío; se la sujeta al aguantar; se la acaricia aliviado
    const palmea = tt => { const k = Math.max(campana(tt, T.gPalmea, T.gPalmea + 0.18), campana(tt, T.gPalmea + 0.22, T.gPalmea + 0.4));
      const q = aP({ x: BARRIGA_G.x + 14 * k, y: BARRIGA_G.y }); return { x: q.x, y: q.y, ang: 0, d: ABIERTA, mo: 0.5 }; };
    const acaricia = tt => { const q = aP({ x: BARRIGA_G.x + 6, y: BARRIGA_G.y - 20 + 26 * Math.sin((tt - T.gAlivio) * 6) }); return { x: q.x, y: q.y, ang: 0, d: ABIERTA, mo: 0.5 }; };
    const PC = [
      [0, 0, { x: 380, y: 330, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gPrepara, T.gPalmea, () => Object.assign(palmea(t), { bol: 0 })],
      [T.gConcentra + 0.1, T.gConcentra + 0.35, { x: 380, y: 330, ang: 0, d: RELAJADA, bol: 1 }],
      [BT[2].suelta - 0.1, BT[2].suelta + 0.25, () => Object.assign(aP({ x: BARRIGA_G.x - 10, y: BARRIGA_G.y + 20 }), { ang: 0, d: ABIERTA, bol: 0, mo: 0.5 })],
      [T.gAlivio, T.gAlivio + 0.2, () => Object.assign(acaricia(t), { bol: 0 })],
      [T.gAlivio + 1.0, T.gAlivio + 1.4, { x: 380, y: 330, ang: 0, d: RELAJADA, bol: 1 }]
    ];
    let c = pista(PC, t);
    if (t > T.gPalmea && t < T.gPalmea + 0.42) c = Object.assign({}, c, palmea(t));
    if (t > T.gAlivio && t < T.gAlivio + 1.0) c = Object.assign({}, c, acaricia(t), { bol: c.bol });
    p.manoCerca = manoRig(G, p, c, "cerca", BOLS_GC, -1, null);
  }
  const LIQ_B = ["naranja", "limon", "fresa"];

  /* ---------- barriga hinchada (capa del tronco, coordenadas de la hoja: luego se estira con torsoEsc) ---------- */
  const CAMISETA_G = "rgb(30,30,36)", PIEL_G = "rgb(254,181,116)";
  function panza(g, k) {
    if (k < 0.02) return;
    const cx = 252 + 22 * k, cy = 500 - 6 * k, rx = 92 + 34 * k, ry = 128 + 46 * k;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.globalAlpha = clamp(k / 0.3);
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = CAMISETA_G; g.fill();
    g.save(); g.clip();
    g.fillStyle = "rgba(0,0,0,0.45)"; g.beginPath(); g.ellipse(cx - rx * 0.75, cy + ry * 0.25, rx * 0.6, ry * 1.1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(120,120,150,0.22)"; g.beginPath(); g.ellipse(cx + rx * 0.3, cy - ry * 0.42, rx * 0.34, ry * 0.2, 0.55, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(200,200,230,0.28)"; g.beginPath(); g.ellipse(cx + rx * 0.42, cy - ry * 0.5, rx * 0.12, ry * 0.07, 0.55, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(90,90,110,0.5)"; g.lineWidth = 3;
    for (const a of [-0.5, 0.1, 0.7]) { g.beginPath(); g.moveTo(cx + rx * 0.2 + Math.cos(a) * 18, cy + ry * 0.2 + Math.sin(a) * 18);
      g.lineTo(cx + rx * 0.2 + Math.cos(a) * 60 * k, cy + ry * 0.2 + Math.sin(a) * 60 * k); g.stroke(); }
    g.restore();
    g.globalAlpha = clamp((k - 0.08) / 0.3);
    g.strokeStyle = TINTA; g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, -Math.PI * 0.18, Math.PI * 1.18); g.stroke();
    g.restore();
  }
  /* ---------- cara de Guillermo (retrato): carrillo cercano hinchado y lagrimones ---------- */
  function capaCabezaG(g, t, p, inf) {
    carrillo(g, Math.max(inf * 0.95, 0.5 * campana(t, T.gConcentra, T.gPio)));
    const lg = clamp((inf - 0.45) / 0.4) * (1 - tramo(t, T.gEructo + 0.2, T.gAlivio + 0.4));
    if (lg > 0.01) {
      g.save(); g.globalAlpha = lg; g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 4;
      for (const [x, y, f] of [[742, 590, 0], [925, 640, 0.5]]) {
        const ph = (t * 1.5 + f) % 1, yy = y + ph * 46, s = 12 * (1 - 0.3 * ph);
        g.beginPath(); g.moveTo(x, yy - s * 1.5); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.5); g.fill(); g.stroke();
      }
      g.restore();
    }
  }
  function carrillo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
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

  /* =====================================================================================
   * PELO DE RODRI AL VIENTO (la pieza de su cabeza, en franjas; como 00077)
   * ===================================================================================== */
  // lo que se mueve: el pelo por encima de la raya `corte`; lo que se destapa dentro del cráneo es piel
  const PELO_R = { yRef: 470, yTop: 168, A: 175,
    corte: [[470, 530], [560, 478], [620, 446], [700, 424], [745, 419], [830, 420], [880, 436], [905, 458], [968, 462], [1000, 456], [1060, 470], [1125, 482]],
    craneo: [[574, 474], [574, 380], [612, 300], [690, 240], [790, 212], [890, 222], [962, 262], [988, 330], [994, 400], [984, 464]],
    // nueva línea del pelo (peinado hacia atrás): por debajo, frente y cejas al aire
    linea: [[566, 486], [600, 436], [640, 386], [700, 342], [780, 322], [870, 322], [940, 336], [990, 360], [1012, 384]] };
  const SC_P = 0.25;
  let M0 = null, fondo = null;
  function prepPelo(Z) {
    const pz = R.A.datos.piezas.cabeza, [ox, oy] = pz.origen, [tw, th] = pz.tam_hoja;
    const w = Math.ceil(tw * SC_P), h = Math.ceil(th * SC_P);
    const lienzo = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
    const pelo = lienzo(), gp = pelo.getContext("2d");
    gp.scale(SC_P, SC_P); gp.translate(-ox, -oy); Recortes.pieza(gp, R.A, "cabeza");
    // se queda solo lo de encima de la raya del corte
    gp.globalCompositeOperation = "destination-in";
    gp.beginPath(); Z.corte.forEach(([x, y], i) => i ? gp.lineTo(x, y) : gp.moveTo(x, y)); gp.lineTo(1125, 100); gp.lineTo(470, 100); gp.closePath();
    gp.fillStyle = "#000"; gp.fill();
    gp.globalCompositeOperation = "source-over";
    // lo que se borra: el pelo un poco ensanchado (que no quede el filo de su contorno)
    const borra = lienzo(), gb = borra.getContext("2d");
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) gb.drawImage(pelo, dx, dy);
    Object.assign(Z, { borra, ox, oy, w, h, pelo, tmp: lienzo(), piel: R.C.piel, colPelo: "rgb(170,110,66)" });
  }
  // viento sobre Rodri: k (cuánto se le ha ido el pelo atrás) y v (fuerza del viento, ondea)
  function vientoR(t) {
    const k = tramo(t, T.golpe, T.golpe + 0.14, salida) * (1 - 0.18 * tramo(t, T.golpe + 0.4, T.golpe + 1.6));
    const v = dentro(t, T.golpe, T.golpe + 0.08, T.golpe + 0.5, T.golpe + 1.3);
    return { k, v };
  }
  function peloAlViento(g, t, Z, k, v) {
    if (!Z.pelo || !fondo || !M0) return;
    const { ox, oy, w, h } = Z;
    // 1) borrar el pelo de arriba: fondo cacheado (o piel, dentro del cráneo) con la forma del pelo
    const o = Z.tmp.getContext("2d");
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, w, h);
    o.drawImage(Z.borra, 0, 0);
    o.globalCompositeOperation = "source-in";
    const Mh = g.getTransform();
    const A = new DOMMatrix().scale(SC_P, SC_P).translate(-ox, -oy).multiply(Mh.inverse()).multiply(M0);
    o.setTransform(A); o.drawImage(fondo, 0, 0);
    o.setTransform(new DOMMatrix().scale(SC_P, SC_P).translate(-ox, -oy));
    o.globalCompositeOperation = "source-atop";
    o.beginPath(); Z.craneo.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); o.lineTo(Z.craneo[Z.craneo.length - 1][0], Z.yRef + 30); o.lineTo(Z.craneo[0][0], Z.yRef + 30); o.closePath();
    const gpi = o.createLinearGradient(0, 330, 0, 430);
    gpi.addColorStop(0, "rgb(244,178,126)"); gpi.addColorStop(0.55, "rgb(236,164,112)"); gpi.addColorStop(1, "rgb(220,144,96)");
    o.fillStyle = gpi; o.fill();
    // el pelo peinado hacia atrás por el viento cubre el cráneo por encima de la nueva línea del pelo
    o.save(); o.beginPath(); Z.craneo.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); o.lineTo(Z.craneo[Z.craneo.length - 1][0], Z.yRef + 30); o.lineTo(Z.craneo[0][0], Z.yRef + 30); o.closePath(); o.clip();
    const lin = Z.linea.map(([x, y]) => [x, y + 12 + (1 - k) * 60]);
    o.beginPath(); lin.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); o.lineTo(1040, 120); o.lineTo(540, 120); o.closePath();
    o.fillStyle = Z.colPelo; o.fill();
    o.restore(); o.save();
    o.beginPath(); o.moveTo(986, 300); o.quadraticCurveTo(1060, 330, 1104, 480); o.lineTo(1000, 470); o.lineTo(990, 400); o.closePath(); o.clip();
    o.fillStyle = Z.colPelo; o.fillRect(960, 280, 160, 220);
    o.strokeStyle = "rgba(90,52,26,0.7)"; o.lineWidth = 6; for (let i = 0; i < 4; i++) { o.beginPath(); o.moveTo(1000 + i * 22, 470); o.quadraticCurveTo(1000 + i * 12, 380, 960, 320); o.stroke(); }
    o.restore(); o.save();
    o.beginPath(); Z.craneo.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); o.lineTo(Z.craneo[Z.craneo.length - 1][0], Z.yRef + 30); o.lineTo(Z.craneo[0][0], Z.yRef + 30); o.closePath(); o.clip();
    o.lineCap = "round"; o.lineWidth = 7;
    for (let i = 0; i < 9; i++) {
      const y = 228 + i * 26 + 4 * Math.sin(t * 9 + i) * v;
      o.strokeStyle = i % 2 ? "rgba(90,52,26,0.75)" : "rgba(214,160,104,0.55)";
      o.beginPath(); o.moveTo(1010, y + 36); o.quadraticCurveTo(820, y - 8, 560, y + 14 + i * 4); o.stroke();
    }
    o.strokeStyle = "rgba(150,80,44,0.45)"; o.lineWidth = 22; o.beginPath(); lin.forEach(([x, y], i) => i ? o.lineTo(x, y + 12) : o.moveTo(x, y + 12)); o.stroke();
    o.strokeStyle = "rgba(60,32,14,0.85)"; o.lineWidth = 4; o.beginPath(); lin.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); o.stroke();
    o.restore();
    o.globalCompositeOperation = "source-over"; o.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(Z.tmp, ox, oy, w / SC_P, h / SC_P);
    // cejas al descubierto (pobladas, castañas), muy levantadas
    g.save(); g.globalAlpha = clamp(k * 2); g.strokeStyle = "#5a321a"; g.lineCap = "round"; g.lineJoin = "round";
    g.lineWidth = 15; g.beginPath(); g.moveTo(732, 404); g.quadraticCurveTo(778, 380, 826, 394); g.stroke();
    g.lineWidth = 12; g.beginPath(); g.moveTo(898, 440); g.quadraticCurveTo(932, 428, 966, 446); g.stroke();
    g.strokeStyle = "rgba(255,210,170,0.35)"; g.lineWidth = 3; g.beginPath(); g.moveTo(752, 392); g.quadraticCurveTo(780, 382, 810, 388); g.stroke();
    g.strokeStyle = "rgba(150,78,40,0.6)"; g.lineWidth = 4.5;
    for (const [y, a] of [[352, 0.9], [368, 1]]) { g.globalAlpha = clamp(k * 2) * a; g.beginPath(); g.moveTo(760, y + 6); g.quadraticCurveTo(840, y - 8, 930, y + 8); g.stroke(); }
    g.restore();
    // 2) el pelo, en franjas desplazadas hacia atrás (−x del retrato), estiradas y ondeando
    // (todo el pelo se va hacia atrás, lo de arriba más; el flequillo se levanta: se aplasta hacia arriba)
    const N = 24, y0 = Z.yTop - 10, y1 = Z.yRef, dh = (y1 - y0) / N, sq = 1 - 0.38 * k;
    for (let j = 0; j < N; j++) {
      const ya = y0 + j * dh, ym = ya + dh / 2;
      const f = Math.pow(clamp((Z.yRef - ym) / (Z.yRef - Z.yTop)), 1.1);
      const ondea = (v * (11 * Math.sin(t * 47 + j * 0.9) + 6 * Math.sin(t * 29 + j * 2.3)) + (1 - v) * k * 2.5 * Math.sin(t * 3.1 + j * 0.7)) * (0.45 + 0.55 * (1 - f));
      const dx = -k * Z.A * (0.32 + 0.68 * f) + ondea, estira = 1 + 0.2 * k * f;
      const sy = (ya - oy) * SC_P, sh = dh * SC_P + 0.6;
      if (sy + sh <= 0 || sy >= h) continue;
      const xFrente = ox + w / SC_P, dw = (w / SC_P) * estira;
      const yd = Z.yTop + (ya - Z.yTop) * sq;
      g.drawImage(Z.pelo, 0, sy, w, sh, xFrente + dx - dw, yd, dw, (dh + 0.6 / SC_P) * sq);
    }
    // mechones sueltos del flequillo, tumbados hacia atrás sobre la frente
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const [x0, y0m, x1, y1m, gr, fa] of [[985, 418, 800, 352, 9, 0], [948, 402, 770, 360, 7, 1.7], [880, 392, 720, 352, 6, 3.1]]) {
      const tb = (v * 9 + 1.5) * Math.sin(t * 33 + fa), al = clamp((k - 0.2) * 3);
      if (al <= 0) continue;
      g.globalAlpha = al;
      const camino = () => { g.beginPath(); g.moveTo(x0, y0m); g.quadraticCurveTo((x0 + x1) / 2, Math.min(y0m, y1m) - 16 + tb, x1, y1m + tb * 0.6); };
      g.strokeStyle = TINTA; g.lineWidth = gr + 4; camino(); g.stroke();
      g.strokeStyle = "#9a6236"; g.lineWidth = gr; camino(); g.stroke();
      g.strokeStyle = "rgba(230,180,120,0.6)"; g.lineWidth = gr * 0.3; camino(); g.stroke();
    }
    g.restore();
    // 3) mechones tiesos que apuntan hacia atrás (se quedan: despeinado)
    g.save(); g.globalAlpha = clamp(k * 1.5); g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 6; i++) {
      const y = 200 + i * 40 + 14 * hash(i + 7), x = 570 - k * 60 + 34 * Math.sin(i * 2.3), L = (50 + 80 * hash(i + 3)) * k;
      const tiembla = (v * 10 + 2) * Math.sin(t * (30 + i * 3) + i);
      g.strokeStyle = TINTA; g.lineWidth = 15; g.beginPath(); g.moveTo(x + 40, y); g.quadraticCurveTo(x - L * 0.4, y - 12 + tiembla * 0.5, x - L, y - 6 + tiembla); g.stroke();
      g.strokeStyle = i % 2 ? "#a66b3c" : "#8a5530"; g.lineWidth = 9; g.beginPath(); g.moveTo(x + 40, y); g.quadraticCurveTo(x - L * 0.4, y - 12 + tiembla * 0.5, x - L, y - 6 + tiembla); g.stroke();
    }
    g.restore();
  }
  // capa de la cara de Rodri: lágrimas de risa y el pelo al viento
  function capaCabezaR(g, t, p) {
    const lr = dentro(t, T.rRie0 + 0.3, T.rRie0 + 0.5, T.rRie1 - 0.4, T.rRie1);
    if (lr > 0.01) {
      g.save(); g.globalAlpha = lr; g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 4;
      for (const [x, y, f, dx] of [[728, 452, 0, -1], [975, 492, 0.45, 1]]) {
        const ph = ((t - T.rRie0) * 2.2 + f) % 1, xx = x + dx * ph * 60, yy = y - 30 * Math.sin(Math.PI * ph) + ph * 30, s = 11 * (1 - 0.3 * ph);
        g.beginPath(); g.moveTo(xx, yy - s * 1.5); g.quadraticCurveTo(xx + s, yy, xx, yy + s); g.quadraticCurveTo(xx - s, yy, xx, yy - s * 1.5); g.fill(); g.stroke();
      }
      g.restore();
    }
    // el eructo: los carrillos vibran (rayitas de temblor a los dos lados de la cara)
    const er = dentro(t, T.rEructo + 0.02, T.rEructo + 0.08, T.rEructo1 - 0.25, T.rEructo1 - 0.05);
    if (er > 0.01) {
      g.save(); g.lineCap = "round";
      for (const [x, y, sg] of [[640, 600, -1], [1010, 590, 1]]) for (let i = 0; i < 2; i++) {
        const tb = 6 * Math.sin(t * 50 + i * 2 + sg), xx = x + sg * (i * 26 + tb);
        for (const [col, w] of [["rgba(20,12,8,0.6)", 15], ["rgba(255,240,220,0.95)", 8]]) {
          g.globalAlpha = er; g.strokeStyle = col; g.lineWidth = w;
          g.beginPath(); g.moveTo(xx, y - 40 + i * 8); g.quadraticCurveTo(xx + sg * 18, y, xx, y + 40 - i * 8); g.stroke();
        }
      }
      g.restore();
    }
    const vt = vientoR(t);
    if (vt.k > 0.002) peloAlViento(g, t, PELO_R, vt.k, vt.v);
    void p;
  }

  /* =====================================================================================
   * DECORADO: el bar de noche
   * ===================================================================================== */
  const ZOCALO = 362, SUELO_PARED = 470, BARRA_Y = 374;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // pared azul noche con rayas doradas finas
    const gp = g.createLinearGradient(0, -50, 0, ZOCALO); gp.addColorStop(0, "#141d33"); gp.addColorStop(1, "#22325a");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, ZOCALO + 50);
    for (let x = -50; x < W + 60; x += 30) { g.fillStyle = "rgba(226,186,98,0.12)"; g.fillRect(x, -50, 2, ZOCALO + 50);
      g.fillStyle = "rgba(226,186,98,0.05)"; g.fillRect(x + 8, -50, 1, ZOCALO + 50); }
    // moldura de cuadros y techo
    g.fillStyle = "#0d1322"; g.fillRect(-60, -50, W + 120, 34);
    g.fillStyle = "#6a4626"; g.fillRect(-60, -16, W + 120, 8); g.fillStyle = "rgba(255,220,160,0.25)"; g.fillRect(-60, -16, W + 120, 2);
    // zócalo de caoba con cuarterones
    g.fillStyle = "#3d1d14"; g.fillRect(-60, ZOCALO, W + 120, SUELO_PARED - ZOCALO);
    g.fillStyle = "#6a3424"; g.fillRect(-60, ZOCALO - 6, W + 120, 10); g.fillStyle = "rgba(255,210,170,0.25)"; g.fillRect(-60, ZOCALO - 6, W + 120, 2);
    for (let x = -40; x < W + 60; x += 104) {
      g.fillStyle = "#331811"; g.fillRect(x + 8, ZOCALO + 16, 86, SUELO_PARED - ZOCALO - 30);
      g.strokeStyle = "rgba(255,200,160,0.13)"; g.lineWidth = 2; g.strokeRect(x + 12, ZOCALO + 20, 78, SUELO_PARED - ZOCALO - 38);
    }
    g.fillStyle = "#1f0d08"; g.fillRect(-60, SUELO_PARED - 10, W + 120, 10);
    // suelo de baldosa de barro, en rombos y en perspectiva
    const gs = g.createLinearGradient(0, SUELO_PARED, 0, H + 50); gs.addColorStop(0, "#5a2a1a"); gs.addColorStop(1, "#8a4429");
    g.fillStyle = gs; g.fillRect(-60, SUELO_PARED, W + 120, H + 50 - SUELO_PARED);
    g.save(); g.beginPath(); g.rect(-60, SUELO_PARED, W + 120, H + 50 - SUELO_PARED); g.clip();
    g.strokeStyle = "rgba(30,10,4,0.5)"; g.lineWidth = 1.6;
    const fy = 380, fx = 517;                              // punto de fuga (sobre el horizonte)
    for (let i = -30; i <= 30; i++) {
      for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(fx + i * 64, SUELO_PARED); g.lineTo(fx + i * 64 + sg * 600, H + 50 + 60); g.stroke(); }
    }
    g.restore();
    const rf = g.createRadialGradient(517, 530, 10, 517, 530, 300); rf.addColorStop(0, "rgba(255,190,110,0.2)"); rf.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = rf; g.fillRect(150, SUELO_PARED, 740, 200);
    barra(g);
    aplique(g, 978, 196);
    planta(g, 990, SUELO_PARED + 34);
    clavo(g);
    lampara(g, 517, 92);
    // viñeta
    const vg = g.createRadialGradient(517, 300, 270, 517, 300, 770); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = vg; g.fillRect(-60, -50, W + 120, H + 100);
    barril(g);
    cubitera(g, false);
    return c;
  }
  // la barra con su espejo y las baldas (izquierda)
  function barra(g) {
    const x0 = -60, x1 = 466;
    // espejo del fondo con su marco
    g.fillStyle = "#2a160d"; g.fillRect(x0, 128, x1 - x0 - 6, ZOCALO - 128);
    const ge = g.createLinearGradient(0, 140, 0, ZOCALO); ge.addColorStop(0, "#2c3a4f"); ge.addColorStop(1, "#1c2433");
    g.fillStyle = ge; g.fillRect(x0 + 10, 140, x1 - x0 - 26, ZOCALO - 150);
    g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 18;
    for (const x of [40, 220, 300]) { g.beginPath(); g.moveTo(x, 140); g.lineTo(x + 90, ZOCALO - 10); g.stroke(); }
    g.strokeStyle = "#b8893a"; g.lineWidth = 3; g.strokeRect(x0 + 10, 140, x1 - x0 - 26, ZOCALO - 150);
    // baldas de cristal con botellas sin etiqueta
    for (const [y, sem] of [[226, 1], [306, 2]]) {
      let x = -40;
      while (x < x1 - 40) {
        const h = 34 + 20 * hash(x * 0.37 + sem), w = 10 + 6 * hash(x * 0.91 + sem), tono = hash(x * 1.7 + sem * 3);
        const col = tono > 0.75 ? "#5a1420" : tono > 0.5 ? "#1f4a2a" : tono > 0.25 ? "#7a4a14" : "#c9d2d8";
        botellaFondo(g, x + w / 2, y, w, h, col, tono);
        x += w + 4 + 6 * hash(x + sem * 9);
      }
      g.fillStyle = "rgba(200,230,240,0.35)"; g.fillRect(x0 + 10, y, x1 - x0 - 26, 4);
      g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x0 + 10, y + 4, x1 - x0 - 26, 6);
    }
    // mostrador: tapa de madera con canto de latón y frente con paneles
    g.fillStyle = "#4a2414"; g.fillRect(x0, BARRA_Y, x1 - x0, SUELO_PARED - BARRA_Y);
    for (let x = x0 + 10; x < x1 - 20; x += 96) {
      g.fillStyle = "#3a1a0e"; g.fillRect(x + 8, BARRA_Y + 22, 78, SUELO_PARED - BARRA_Y - 48);
      g.strokeStyle = "rgba(255,200,150,0.15)"; g.lineWidth = 2; g.strokeRect(x + 12, BARRA_Y + 26, 70, SUELO_PARED - BARRA_Y - 56);
    }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0, BARRA_Y, x1 - x0, SUELO_PARED - BARRA_Y);
    g.fillStyle = "#6a3a1e"; g.fillRect(x0, BARRA_Y - 12, x1 - x0 + 8, 14);
    g.fillStyle = "#c9973e"; g.fillRect(x0, BARRA_Y - 2, x1 - x0 + 8, 4);
    g.fillStyle = "rgba(255,230,180,0.3)"; g.fillRect(x0, BARRA_Y - 12, x1 - x0 + 8, 3);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0, BARRA_Y - 12, x1 - x0 + 8, 14);
    // reposapiés de latón
    g.strokeStyle = "#b8893a"; g.lineWidth = 6; g.beginPath(); g.moveTo(x0, SUELO_PARED - 18); g.lineTo(x1 - 6, SUELO_PARED - 18); g.stroke();
    g.strokeStyle = "rgba(255,240,200,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, SUELO_PARED - 20); g.lineTo(x1 - 6, SUELO_PARED - 20); g.stroke();
    for (let x = 20; x < x1; x += 140) { g.fillStyle = "#8a6526"; g.fillRect(x, SUELO_PARED - 22, 5, 14); }
    // viga de la que cuelga el colgador de copas
    g.fillStyle = "#3a2010"; g.fillRect(x0, 18, x1 - x0 + 20, 16); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0, 18, x1 - x0 + 20, 16);
    for (const x of [134, 404]) { g.strokeStyle = "#8a6526"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 34); g.lineTo(x, COLG.y); g.stroke(); }
    g.fillStyle = "#4a2a14"; g.fillRect(COLG.x0 - 8, COLG.y - 6, COLG.x1 - COLG.x0 + 16, 10);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(COLG.x0 - 8, COLG.y - 6, COLG.x1 - COLG.x0 + 16, 10);
  }
  function botellaFondo(g, x, base, w, h, col, tono) {
    g.save(); g.fillStyle = col; g.strokeStyle = "rgba(0,0,0,0.75)"; g.lineWidth = 1.4;
    const cuello = h * (0.32 + 0.12 * tono);
    g.beginPath(); g.moveTo(x - w / 2, base); g.lineTo(x - w / 2, base - h + cuello + 6); g.quadraticCurveTo(x - w / 2, base - h + cuello, x - w * 0.16, base - h + cuello - 4);
    g.lineTo(x - w * 0.16, base - h); g.lineTo(x + w * 0.16, base - h); g.lineTo(x + w * 0.16, base - h + cuello - 4);
    g.quadraticCurveTo(x + w / 2, base - h + cuello, x + w / 2, base - h + cuello + 6); g.lineTo(x + w / 2, base); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(x - w * 0.32, base - h + cuello + 4, 2, h - cuello - 8);
    g.restore();
  }
  function aplique(g, x, y) {
    const hl = g.createRadialGradient(x, y - 14, 4, x, y - 14, 110); hl.addColorStop(0, "rgba(255,200,120,0.42)"); hl.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = hl; g.beginPath(); g.arc(x, y - 14, 110, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#b8893a"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.rect(x - 4, y - 4, 8, 34); g.fill(); g.stroke();
    g.fillStyle = "#f3e2b8"; g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x + 16, y); g.lineTo(x + 11, y - 26); g.lineTo(x - 11, y - 26); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,240,200,0.6)"; g.fillRect(x - 9, y - 22, 4, 18);
  }
  function planta(g, x, base) {
    g.fillStyle = "#6a3424"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 30, base - 44); g.lineTo(x + 30, base - 44); g.lineTo(x + 24, base); g.lineTo(x - 24, base); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,200,150,0.18)"; g.fillRect(x - 26, base - 40, 5, 34);
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i - 5) * 0.27, L = 110 + 40 * hash(i + 4), cx = x + Math.cos(a) * L * 0.5, cy = base - 44 + Math.sin(a) * L * 0.5;
      g.fillStyle = i % 2 ? "#2f6a3a" : "#3e8a4a";
      g.beginPath(); g.moveTo(x, base - 44); g.quadraticCurveTo(cx + 18 * Math.cos(a + 1.4), cy + 18 * Math.sin(a + 1.4), x + Math.cos(a) * L, base - 44 + Math.sin(a) * L);
      g.quadraticCurveTo(cx - 18 * Math.cos(a + 1.4), cy - 18 * Math.sin(a + 1.4), x, base - 44); g.fill(); g.lineWidth = 1.2; g.stroke();
    }
  }
  function clavo(g) {
    g.fillStyle = "#c9973e"; g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.arc(CUADRO.cx, CUADRO.clavo, 3, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  function lampara(g, x, y) {
    g.strokeStyle = "#0c0806"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -50); g.lineTo(x, y - 14); g.stroke();
    const gc = g.createLinearGradient(0, y, 0, BARRIL.y + 20); gc.addColorStop(0, "rgba(255,214,140,0.2)"); gc.addColorStop(1, "rgba(255,214,140,0.03)");
    g.fillStyle = gc; g.beginPath(); g.moveTo(x - 24, y); g.lineTo(x + 24, y); g.lineTo(x + 160, BARRIL.y + 20); g.lineTo(x - 160, BARRIL.y + 20); g.closePath(); g.fill();
    const gs = g.createLinearGradient(x - 28, 0, x + 28, 0); gs.addColorStop(0, "#7a5520"); gs.addColorStop(0.45, "#e2b860"); gs.addColorStop(1, "#6a4818");
    g.fillStyle = gs; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 6, y - 16); g.lineTo(x + 6, y - 16); g.quadraticCurveTo(x + 28, y - 12, x + 30, y); g.lineTo(x - 30, y); g.quadraticCurveTo(x - 28, y - 12, x - 6, y - 16); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff3cf"; g.beginPath(); g.ellipse(x, y + 1, 20, 3.6, 0, 0, Math.PI * 2); g.fill();
  }
  // barril de mesa alta
  function barril(g) {
    const b = BARRIL, yb = SUELO;
    g.fillStyle = "rgba(0,0,0,0.42)"; g.beginPath(); g.ellipse(b.x + 4, yb + 1, b.rx + 8, 8, 0, 0, Math.PI * 2); g.fill();
    const forma = () => { g.beginPath(); g.moveTo(b.x - b.rx + 6, b.y + 4); g.bezierCurveTo(b.x - b.rx - 12, b.y + 70, b.x - b.rx - 12, yb - 70, b.x - b.rx + 6, yb - 4);
      g.lineTo(b.x + b.rx - 6, yb - 4); g.bezierCurveTo(b.x + b.rx + 12, yb - 70, b.x + b.rx + 12, b.y + 70, b.x + b.rx - 6, b.y + 4); g.closePath(); };
    forma(); const gr = g.createLinearGradient(b.x - b.rx, 0, b.x + b.rx, 0); gr.addColorStop(0, "#4a2a12"); gr.addColorStop(0.35, "#9a6234"); gr.addColorStop(0.6, "#7a4a24"); gr.addColorStop(1, "#3a200e");
    g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    g.strokeStyle = "rgba(30,15,6,0.55)"; g.lineWidth = 1.5;
    for (let i = -5; i <= 5; i++) { const x = b.x + i * b.rx * 0.2; g.beginPath(); g.moveTo(x, b.y); g.quadraticCurveTo(x + i * 2.6, (b.y + yb) / 2, x, yb); g.stroke(); }
    for (const y of [b.y + 26, b.y + 70, yb - 70, yb - 26]) {
      g.fillStyle = "#2b2622"; g.fillRect(b.x - b.rx - 14, y - 5, 2 * b.rx + 28, 10);
      g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(b.x - b.rx - 14, y - 5, 2 * b.rx + 28, 2);
      g.fillStyle = "#6a6058"; for (let x = b.x - b.rx + 6; x < b.x + b.rx; x += 22) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
    forma(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    // tapa
    g.fillStyle = "#8a5428"; g.beginPath(); g.ellipse(b.x, b.y + 3, b.rx + 2, b.ry + 1, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#b07a42"; g.beginPath(); g.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,225,170,0.3)"; g.beginPath(); g.ellipse(b.x - 8, b.y - 2, b.rx * 0.55, b.ry * 0.45, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(60,30,10,0.45)"; g.lineWidth = 1; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(b.x + i * 15, b.y - b.ry * 0.95); g.lineTo(b.x + i * 15, b.y + b.ry * 0.95); g.stroke(); }
  }
  // cubitera: la parte de atrás (fondo) o la de delante (por encima de los botellines)
  function cubitera(g, delante) {
    const c = CUBO, y0 = c.y - c.h, hw0 = c.w / 2, hw1 = c.w / 2 - 4;
    if (!delante) {
      g.fillStyle = "#8a959e"; g.beginPath(); g.ellipse(c.x, y0, hw0, 5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#3a4650"; g.beginPath(); g.ellipse(c.x, y0, hw0 - 2.5, 3.6, 0, 0, Math.PI * 2); g.fill();
      return;
    }
    // hielo asomando
    g.fillStyle = "rgba(225,245,255,0.95)"; g.strokeStyle = "rgba(90,130,160,0.9)"; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const x = c.x - 14 + i * 5.6, y = y0 - 1 + 2 * hash(i + 31); g.save(); g.translate(x, y); g.rotate(hash(i + 32) - 0.5); g.fillRect(-3.4, -3.4, 6.8, 6.8); g.strokeRect(-3.4, -3.4, 6.8, 6.8); g.restore(); }
    const forma = () => { g.beginPath(); g.moveTo(c.x - hw0, y0); g.lineTo(c.x - hw1, c.y - 2); g.quadraticCurveTo(c.x, c.y + 4, c.x + hw1, c.y - 2); g.lineTo(c.x + hw0, y0); g.quadraticCurveTo(c.x, y0 + 5, c.x - hw0, y0); g.closePath(); };
    forma(); const gr = g.createLinearGradient(c.x - hw0, 0, c.x + hw0, 0); gr.addColorStop(0, "#5a6670"); gr.addColorStop(0.35, "#dfe7ec"); gr.addColorStop(0.55, "#9aa6ae"); gr.addColorStop(1, "#4a545c");
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 1; g.beginPath(); g.moveTo(c.x - hw0 + 2, y0 + 6); g.quadraticCurveTo(c.x, y0 + 10, c.x + hw0 - 2, y0 + 6); g.stroke();
    // asas
    for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(c.x + sg * (hw0 + 1), y0 + 9, 3.5, 5, 0, 0, Math.PI * 2); g.lineWidth = 1.8; g.strokeStyle = "#6a747c"; g.stroke(); }
    // gotitas de frío
    g.fillStyle = "rgba(255,255,255,0.75)"; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(c.x - 14 + 28 * hash(i + 41), y0 + 8 + 20 * hash(i + 42), 0.9, 1.4, 0, 0, Math.PI * 2); g.fill(); }
  }
  let cuboDelante = null;
  function sprite(w, h, ox, oy, f) { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.translate(ox, oy); f(g); return c; }

  /* ---------- el cuadro (antiguo anuncio de gaseosa, sin letras): cuelga de un clavo ---------- */
  const CUADRO = { cx: 826, clavo: 92, w: 112, h: 96, cuelga: 26 };   // `cuelga`: del clavo al borde de arriba
  let imgCuadro = null;
  function dibCuadroImg(g) {
    const w = CUADRO.w, h = CUADRO.h;
    g.fillStyle = "#4a2610"; g.fillRect(-w / 2 - 9, -9, w + 18, h + 18);
    g.strokeStyle = "#c9973e"; g.lineWidth = 2.5; g.strokeRect(-w / 2 - 5, -5, w + 10, h + 10);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-w / 2 - 9, -9, w + 18, h + 18); g.strokeRect(-w / 2, 0, w, h);
    g.save(); g.beginPath(); g.rect(-w / 2, 0, w, h); g.clip();
    g.fillStyle = "#f3e2b8"; g.fillRect(-w / 2, 0, w, h);
    // rayos de sol
    g.fillStyle = "#f2b24a"; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(Math.cos(a) * 120, h * 0.5 + Math.sin(a) * 120); g.lineTo(Math.cos(a + 0.18) * 120, h * 0.5 + Math.sin(a + 0.18) * 120); g.closePath(); g.fill(); }
    g.fillStyle = "#e8562f"; g.beginPath(); g.arc(0, h * 0.5, 26, 0, Math.PI * 2); g.fill();
    // el botellín gigante con burbujas
    g.save(); g.translate(0, h * 0.56); g.scale(1.1, 1.1);
    dibBotella(g, { x: 0, y: 0, ang: 0.18, vol: 0.8, liq: "naranja", t: 0.3 });
    g.restore();
    g.strokeStyle = "#8a2a18"; g.lineWidth = 1.6; g.fillStyle = "rgba(255,255,255,0.6)";
    for (const [x, y, r] of [[-30, 30, 5], [-38, 52, 3.5], [30, 22, 4.5], [38, 44, 3], [-22, 14, 2.5], [24, 66, 3]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke(); }
    // marco interior y lámina vieja
    g.fillStyle = "rgba(120,80,30,0.12)"; g.fillRect(-w / 2, 0, w, h);
    g.restore();
    // cristal: un brillo
    g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 4; g.beginPath(); g.moveTo(-w / 2 + 10, h - 8); g.lineTo(-w / 2 + 34, 8); g.stroke();
  }
  // ángulo del cuadro, sujeto al clavo (antes de caerse)
  function anguloCuadro(t) {
    let a = 0.02;
    a += 0.06 * muelle(t, llegada("r",CUADRO.cx,CUADRO.clavo+CUADRO.cuelga), 9, 2.6);
    const g0 = llegada("g",CUADRO.cx,CUADRO.clavo+CUADRO.cuelga);
    if (t > g0) { const v = t-g0; a += -0.5*(1-Math.exp(-v*3))*Math.cos(v*7.5)*Math.exp(-v*0.4) - 0.15*Math.sin(v*7.5); }
    return a;
  }
  // el cuadro: colgado (ángulo), saltando del clavo o caído (apoyado contra la pared)
  const SUELO_CUADRO = SUELO_PARED + 6, ANG_IMPACTO = -0.46;
  function esquinaCuadro(ang) {
    return rot({ x: (Math.sin(ang) < 0 ? -1 : 1) * (CUADRO.w/2 + 10), y: CUADRO.cuelga + CUADRO.h + 10 }, ang);
  }
  function contactoCuadro() {
    const q = esquinaCuadro(ANG_IMPACTO);
    return { x: CUADRO.cx + 34 + q.x, y: SUELO_CUADRO };
  }
  function estadoCuadro(t) {
    const C = CUADRO;
    if (t < T.cuadroSalta) return { x: C.cx, y: C.clavo, ang: anguloCuadro(t), colgado: true, raja: 0 };
    const a0 = anguloCuadro(T.cuadroSalta), impacto = contactoCuadro(), q = esquinaCuadro(ANG_IMPACTO);
    if (t < T.cuadroCae) {
      const u = fase(t, T.cuadroSalta, T.cuadroCae);
      return { x: lerp(C.cx, impacto.x-q.x, u), y: lerp(C.clavo, impacto.y-q.y, u*u),
        ang: lerp(a0, ANG_IMPACTO, u), colgado: false, raja: 0 };
    }
    const v = t - T.cuadroCae, ang = -0.2 + (ANG_IMPACTO + 0.2) * Math.cos(v*12) * Math.exp(-v*6);
    const e = esquinaCuadro(ang), rebote = 7 * Math.abs(Math.sin(v*14)) * Math.exp(-v*7);
    return { x: impacto.x-e.x, y: impacto.y-e.y-rebote, ang, colgado: false, raja: tramo(v,0,0.08) };
  }
  function dibCuadro(g, t) {
    const e = estadoCuadro(t), C = CUADRO;
    g.save();
    if (e.colgado) {
      // cordel del clavo a las dos armellas
      const p1 = rot({ x: -C.w * 0.32, y: C.cuelga }, e.ang), p2 = rot({ x: C.w * 0.32, y: C.cuelga }, e.ang);
      g.strokeStyle = "#2a2018"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(e.x + p1.x, e.y + p1.y); g.lineTo(e.x, e.y); g.lineTo(e.x + p2.x, e.y + p2.y); g.stroke();
    }
    g.translate(e.x, e.y); g.rotate(e.ang); g.translate(0, C.cuelga);
    // sombra en la pared
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-C.w / 2 - 5, 4, C.w + 18, C.h + 16);
    g.drawImage(imgCuadro, -C.w / 2 - 12, -12);
    if (e.raja > 0) {
      g.save(); g.globalAlpha = e.raja; g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(12, 30); g.lineTo(-6, 18); g.lineTo(-30, 26); g.moveTo(12, 30); g.lineTo(34, 8); g.moveTo(12, 30); g.lineTo(20, 62); g.lineTo(6, 86);
      g.moveTo(12, 30); g.lineTo(-14, 54); g.stroke(); g.restore();
    }
    g.restore();
  }

  /* ---------- el colgador de copas (cuelgan boca abajo; tintinean con cada onda) ---------- */
  const COLG = { x0: 120, x1: 420, y: 100 };
  const COPAS = Array.from({ length: 10 }, (_, i) => ({ x: COLG.x0 + 10 + i * 31, f: 15 + 4 * hash(i + 50), ph: hash(i + 51) * 6 }));
  // cuánto le llega cada onda (tiempo de llegada según la distancia)
  const ORIGENES = new Map();
  function origenOnda(quien, t) {
    const clave = quien + t;
    if (!ORIGENES.has(clave)) {
      const esG = quien === "g", r = esG ? G : R, p = esG ? poseG(t) : poseR(t);
      const b = r.aPantalla(p, r.boca(p));
      ORIGENES.set(clave, { x: b.x + (esG ? 6 : -6), y: b.y });
    }
    return ORIGENES.get(clave);
  }
  function llegada(quien, x, y) {
    const esG = quien === "g", t0 = esG ? T.gEructo : T.rEructo, o = origenOnda(quien,t0);
    const d = Math.hypot(x-o.x,(y-o.y)/0.92);
    return t0 + Math.max(0,d-(esG ? 12 : 10)) / (esG ? 1000 : 480);
  }
  function sacudida(t, x, y, fuerte) {
    let s = 0;
    for (const [quien,a] of [["r",0.22],["g",0.42]]) {
      const tau = t - llegada(quien,x,y);
      if (tau > 0) s += a * (fuerte ?? 1) * Math.exp(-tau*2.4) * Math.sin(tau*(17+0.8*Math.sin(x*0.05)));
    }
    return s;
  }
  function dibCopas(g, t) {
    for (const c of COPAS) {
      const a = sacudida(t, c.x, COLG.y, 1) * (0.8 + 0.4 * hash(c.x));
      g.save(); g.translate(c.x, COLG.y + 4); g.rotate(a);
      g.strokeStyle = "rgba(225,240,250,0.85)"; g.lineWidth = 1.3; g.fillStyle = "rgba(210,232,246,0.22)";
      g.beginPath(); g.ellipse(0, 0, 7, 1.8, 0, 0, Math.PI * 2); g.stroke();                       // pie (arriba)
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 10); g.stroke();                                   // tallo
      g.beginPath(); g.moveTo(0, 10); g.quadraticCurveTo(-8, 12, -8, 22); g.lineTo(-7, 26); g.lineTo(7, 26); g.lineTo(8, 22); g.quadraticCurveTo(8, 12, 0, 10); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-5, 16); g.lineTo(-5.5, 23); g.stroke();
      g.restore();
    }
    // chispitas de tintineo
    g.save(); g.strokeStyle = "rgba(255,250,220,0.95)"; g.lineWidth = 1.5; g.lineCap = "round";
    for (let i = 0; i < COPAS.length - 1; i++) {
      const c = COPAS[i], a = sacudida(t, c.x, COLG.y, 1), b = sacudida(t, COPAS[i + 1].x, COLG.y, 1);
      const k = clamp((Math.abs(a - b) - 0.1) * 6); if (k <= 0.02) continue;
      const x = c.x + 15.5, y = COLG.y + 26;
      for (let j = 0; j < 4; j++) { const an = j * Math.PI / 2 + 0.4; g.globalAlpha = k; g.beginPath(); g.moveTo(x + Math.cos(an) * 3, y + Math.sin(an) * 3); g.lineTo(x + Math.cos(an) * 8, y + Math.sin(an) * 8); g.stroke(); }
    }
    g.restore();
  }
  // botellas sobre el mostrador (se tambalean con las ondas)
  const BOT_BARRA = [{ x: 64, h: 52, col: "#1f4a2a" }, { x: 84, h: 44, col: "#7a4a14" }, { x: 160, h: 56, col: "#5a1420" }, { x: 178, h: 40, col: "#c9d2d8" }];
  function dibBotellasBarra(g, t) {
    for (const b of BOT_BARRA) {
      const a = 0.35 * sacudida(t, b.x, BARRA_Y - 30, 1);
      g.save(); g.translate(b.x + (a > 0 ? 6 : -6), BARRA_Y - 12); g.rotate(a); g.translate(-(a > 0 ? 6 : -6), 0);
      botellaFondo(g, 0, 0, 13, b.h, b.col, 0.5);
      g.restore();
    }
  }
  // lo que hay encima del barril: los cascos vacíos y los botellines de la cubitera
  function dibBarril(g, t, pG, pR) {
    const tiembla = q => 0.12 * sacudida(t, q.x, q.y, 1);
    // botellines en la cubitera (los que aún no ha cogido)
    BT.forEach((b, i) => { if (t < b.coge) { const c = EN_CUBO[i]; dibBotella(g, { x: c.x, y: c.y, ang: c.ang + tiembla(c) * (1 - tramo(t,b.coge-0.09,b.coge)), vol: 0.86, liq: LIQ_B[i], t, frio: true }); } });
    g.drawImage(cuboDelante, CUBO.x - 40, CUBO.y - CUBO.h - 14);
    // cascos vacíos
    if (t >= T.deja + 0.02) dibBotella(g, { x: VACIO_G.x, y: VACIO_G.y, ang: tiembla(VACIO_G), vol: 0, liq: "naranja", t });
    if (t >= T.deja + 0.02) dibBotella(g, { x: VACIO_R.x, y: VACIO_R.y, ang: tiembla(VACIO_R) * -1, vol: 0, liq: "cola", t });
    void pG; void pR;
  }
  // la caja de cascos (en el suelo): detrás, cascos dentro y delante
  function dibCaja(g, t, delante) {
    const c = CAJA, x0 = c.x - c.w / 2, y0 = c.y;
    if (!delante) {
      g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse(c.x + 4, c.y + c.h, c.w / 2 + 10, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#5a3418"; g.fillRect(x0 + 6, y0 - 8, c.w - 12, 10);
      // cascos que ya había
      for (const [x, ang] of [[x0 + 14, -0.08], [x0 + 30, 0.05]]) dibBotella(g, { x, y: y0 - 4, ang, vol: 0, liq: "cola", t: 0 });
      // los que van cayendo
      BT.forEach((b, i) => { const casco = cascoSuelto(t, i); if (casco) dibBotella(g, casco); });
      return;
    }
    g.save();
    g.fillStyle = "#8a5428"; g.fillRect(x0, y0, c.w, c.h); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0, y0, c.w, c.h);
    g.fillStyle = "#6a3c1c"; g.fillRect(x0, y0 + 13, c.w, 3); g.fillRect(x0, y0 + 27, c.w, 3);
    g.fillStyle = "rgba(255,220,170,0.25)"; g.fillRect(x0, y0, c.w, 3);
    g.fillStyle = "#3a1e0c"; g.beginPath(); g.ellipse(c.x, y0 + 8, 12, 4, 0, 0, Math.PI * 2); g.fill();     // asidero
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  // ondas del eructo: arcos que tiemblan, en abanico hacia `dir`
  function ondas(g, t, quien, dir, t0, cfg) {
    const u = t - t0; if (u < 0 || u > cfg.dura) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < cfg.n; i++) {
      const v = u - i * cfg.paso; if (v < 0) continue;
      const r = cfg.r0 + cfg.vel * v, al = clamp(v / 0.05) * (1 - clamp((r - cfg.r0) / cfg.alcance));
      if (al <= 0.01) continue;
      const o = origenOnda(quien, t0 + i*cfg.paso), pts = [];
      for (let j = 0; j <= 32; j++) {
        const a = dir - cfg.ab + (2 * cfg.ab) * j / 32, rr = r + cfg.onda * Math.sin(j / 32 * Math.PI * 3 + t * 26 + i * 1.3);
        pts.push({ x: o.x + Math.cos(a) * rr, y: o.y + Math.sin(a) * rr * 0.92 });
      }
      for (const [col, w] of [[`rgba(12,30,20,${0.55 * al})`, cfg.grosor + 3], [`rgba(214,255,190,${0.95 * al})`, cfg.grosor]]) {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
      }
    }
    g.restore();
  }
  // nubecilla del eructo
  function nube(g, t, o, dir, t0, esc, dura) {
    const u = t - t0; if (u < 0 || u > dura) return;
    const k = clamp(u / 0.08) * (1 - fase(u, dura * 0.5, dura));
    g.save();
    for (let i = 0; i < 7; i++) {
      const d = esc * (10 + 26 * salida(clamp(u / (dura * 0.6))) * (0.6 + 0.6 * hash(i + 60))), a = dir + (hash(i + 61) - 0.5) * 1.1;
      const r = esc * (6 + 8 * hash(i + 62)) * (0.6 + 0.6 * clamp(u / 0.3));
      g.fillStyle = `rgba(206,236,186,${0.55 * k})`; g.beginPath(); g.arc(o.x + Math.cos(a) * d, o.y + Math.sin(a) * d - 8 * u * esc, r, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = `rgba(255,255,255,${0.8 * k})`; g.strokeStyle = `rgba(20,60,40,${0.8 * k})`; g.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const ph = (u * 1.4 + hash(i + 70)) % 1, a = dir + (hash(i + 71) - 0.5) * 0.8, d = esc * (14 + 40 * ph);
      g.beginPath(); g.arc(o.x + Math.cos(a) * d, o.y + Math.sin(a) * d - 20 * ph * esc, 2 + 1.5 * hash(i + 72), 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  // el «pío»: una ondita de nada y una burbuja que sube y explota
  function pio(g, t) {
    const u = t - T.gPio; if (u < 0 || u > 0.9) return;
    const b = origenOnda("g", T.gPio);
    const kr = campana(u, 0, 0.32);
    if (kr > 0) { g.save(); g.strokeStyle = `rgba(214,255,190,${kr})`; g.lineWidth = 1.6; g.beginPath(); g.arc(b.x + 4, b.y, 6 + 26 * u, -0.5, 0.5); g.stroke(); g.restore(); }
    const x = b.x + 2 + 18 * u + 3 * Math.sin(u * 14), y = b.y - 2 - 46 * u, r = (4.5 + 2 * u) * tramo(u,0,0.07);
    g.save(); g.lineWidth = 1.3;
    if (u < 0.5) { g.fillStyle = "rgba(225,250,215,0.5)"; g.strokeStyle = "rgba(30,70,40,0.85)"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2); g.fill(); }
    else { const k = fase(u, 0.5, 0.72); g.strokeStyle = `rgba(255,250,220,${1 - k})`; for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3; g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r * (1.6 + k), y + Math.sin(a) * r * (1.6 + k)); g.stroke(); } }
    g.restore();
  }
  // tragos: «glu, glu» en la garganta
  function glu(g, t, pose, rig, punto, t0, t1, sg) {
    const k = dentro(t, t0, t0 + 0.06, t1 - 0.08, t1); if (k <= 0.01) return;
    const cu = rig.aPantalla(pose, rig.cabeza(pose).a(punto));
    g.save(); g.strokeStyle = `rgba(255,236,220,${0.9 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const ph = ((t - t0) * 3 + i / 3) % 1; g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.arc(cu.x - sg * (4 + ph * 6), cu.y + 4 - i * 5, 3.5 + ph * 3, sg > 0 ? Math.PI * 0.6 : -Math.PI * 0.4, sg > 0 ? Math.PI * 1.4 : Math.PI * 0.4); g.stroke(); }
    g.restore();
  }
  // choque de botellines: estrella y rayitas
  function clinc(g, t, x, y, t0, tam = 1) {
    const k = campana(t, t0, t0 + 0.22); if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = "rgba(255,250,215,0.95)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3, r0 = 5 * tam, r1 = (12 + 6 * (1 - k)) * tam; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // golpes en el pecho / en la tripa: rayitas
  function pum(g, t, x, y, t0) {
    const k = campana(t, t0, t0 + 0.16); if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = "rgba(255,240,220,0.95)"; g.lineWidth = 2; g.lineCap = "round";
    for (const a of [-0.6, 0, 0.6]) { g.beginPath(); g.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); g.lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); g.stroke(); }
    g.restore();
  }
  // el casco por los aires, hasta la caja
  function cascoSuelto(t, i) {
    const t0 = BT[i].suelta, fin = t0 + VUELO;
    if (t < t0) return null;
    const q = EN_CAJA[i], angCaja = (i - 1) * 0.09;
    if (t >= fin) {
      const v = t - fin;
      return { x: q.x, y: q.y - 4 * Math.abs(Math.sin(14*v)) * Math.exp(-8*v),
        ang: angCaja + 0.14 * Math.sin(19*v) * Math.exp(-8*v), vol: 0, liq: LIQ_B[i], t };
    }
    const u = (t - t0) / VUELO, d = desdeLanza(i), altura = 162;
    const angFin = angCaja + 2 * Math.PI * (Math.floor((d.ang - angCaja) / (2*Math.PI)) - 1);
    const enlace = u * (1-u) ** 2;
    return { x: lerp(d.x, q.x, u) + (d.vx*VUELO - (q.x-d.x)) * enlace,
      y: lerp(d.y, q.y, u) - 4*altura*u*(1-u) + (d.vy*VUELO - (q.y-d.y-4*altura)) * enlace,
      ang: lerp(d.ang, angFin, u) + (d.va*VUELO - (angFin-d.ang)) * enlace, vol: 0, liq: LIQ_B[i], t };
  }
  function tension(g, t, pG) {
    const k = dentro(t, T.gAguanta - 0.3, T.gAguanta, T.gEructo - 0.05, T.gEructo); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 770, y: 560 }));
    g.save(); g.strokeStyle = `rgba(255,236,220,${0.9 * k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i / 6 * Math.PI * 1.1, r0 = 70 + 3 * Math.sin(t * 40 + i), r1 = r0 + 12;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.9); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.9); g.stroke(); }
    g.restore();
  }
  // rayas de viento tras el eructo gigante (por toda la mitad derecha)
  function rafagas(g, t) {
    const k = dentro(t, T.gEructo + 0.05, T.gEructo + 0.15, T.gEructo1 - 0.3, T.gEructo1); if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(230,255,215,${0.75 * k})`; g.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const ph = ((t - T.gEructo) * 2.2 + hash(i + 80)) % 1, y = 150 + 230 * hash(i + 81), x = lerp(500, 1020, ph), L = 70 + 60 * hash(i + 82);
      g.globalAlpha = k * Math.sin(Math.PI * ph); g.beginPath(); g.moveTo(x - L, y); g.quadraticCurveTo(x - L * 0.5, y - 6 * Math.sin(t * 20 + i), x, y); g.stroke();
    }
    g.restore();
  }
  // polvo y golpe al caer el cuadro
  function golpeCuadro(g, t) {
    const u = t - T.cuadroCae; if (u < 0 || u > 0.6) return;
    const {x,y} = contactoCuadro();
    g.save();
    for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI, d = 56 * salida(fase(u, 0, 0.5)) * (0.6 + 0.6 * hash(i + 90)), r = 6 + 8 * fase(u, 0, 0.5);
      g.fillStyle = `rgba(220,200,180,${0.45 * tramo(u,0,0.035) * (1 - fase(u, 0.2, 0.6))})`; g.beginPath(); g.arc(x + Math.cos(a) * d * 1.4, y + Math.sin(a) * d * 0.3, r, 0, Math.PI * 2); g.fill(); }
    const kr = campana(u, 0, 0.25);
    if (kr > 0) { g.strokeStyle = `rgba(255,245,220,${kr})`; g.lineWidth = 2.2; g.lineCap = "round";
      for (const a of [-2.4, -1.9, -1.2, -0.7]) { g.beginPath(); g.moveTo(x + Math.cos(a) * 44, y - 40 + Math.sin(a) * 30); g.lineTo(x + Math.cos(a) * 62, y - 40 + Math.sin(a) * 44); g.stroke(); } }
    g.restore();
  }
  // suspiro de alivio
  function suspiro(g, t, pG) {
    const u = t - (T.gAlivio + 0.15); if (u < 0 || u > 1.0) return;
    const n = G.aPantalla(pG, G.boca(pG));
    g.save();
    for (let i = 0; i < 3; i++) { const v = u - i * 0.12; if (v < 0) continue; const k = 1 - fase(v, 0.2, 0.85);
      g.fillStyle = `rgba(255,245,235,${0.55 * k})`; g.beginPath(); g.arc(n.x + 8 + v * 44, n.y - 6 - v * 30, 4 + v * 12, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // aplausos: rayitas en cada golpe
  function plas(g, t, pR) {
    for (const a of T.aplausos) {
      const k = campana(t, a, a + 0.2); if (k <= 0.01) continue;
      const a1 = R.aPantalla(pR, pR.manoCerca), a2 = R.aPantalla(pR, pR.manoLejos), q = { x: (a1.x + a2.x) / 2, y: (a1.y + a2.y) / 2 - 4 };
      g.save(); g.globalAlpha = k; g.strokeStyle = "rgba(255,245,220,0.95)"; g.lineWidth = 2; g.lineCap = "round";
      for (const an of [-1.9, -1.4, -0.9]) { g.beginPath(); g.moveTo(q.x + Math.cos(an) * 22, q.y + Math.sin(an) * 22); g.lineTo(q.x + Math.cos(an) * 32, q.y + Math.sin(an) * 32); g.stroke(); }
      g.restore();
    }
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = dentro(t, BT[1].coge, T.gAguanta, T.gEructo - 0.05, T.gEructo + 0.35);
    const c = dentro(t, T.gCamara - 0.3, T.gCamara + 0.6, T.fin + 0.2, DUR);
    let k = 1.1 + 0.12 * a + 0.04 * c, x = 517 - 26 * a - 6 * c, y = 330 - 26 * a - 6 * c;
    const s = muelle(t, T.gEructo + 0.02, 52, 5.5) * 4.5 + muelle(t, T.rEructo + 0.02, 48, 8) * 1.2 + muelle(t, T.cuadroCae, 50, 9) * 1.5;
    return { k, x: x + s, y: y + s * 0.6 };
  }

  function poses(t) { return { g: poseG(t), r: poseR(t) }; }

  class ElEructo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !R.listo()) return;
      if (!fondo) {
        fondo = creaFondo(); prepPelo(PELO_R);
        imgCuadro = sprite(CUADRO.w + 24, CUADRO.h + 24, CUADRO.w / 2 + 12, 12, dibCuadroImg);
        cuboDelante = sprite(80, 60, 40 - CUBO.x, 14 - (CUBO.y - CUBO.h), gg => cubitera(gg, true));
      }
      const pR = poseR(t), pG = poseG(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.save(); g.translate(-60, -50); M0 = g.getTransform(); g.drawImage(fondo, 0, 0); g.restore();
      dibCuadro(g, t);
      dibCopas(g, t);
      dibBotellasBarra(g, t);
      dibCaja(g, t, false);
      dibCaja(g, t, true);
      dibBarril(g, t, pG, pR);
      R.dibujar(g, pR, t);
      G.dibujar(g, pG, t);
      // efectos
      clinc(g, t, BRINDIS.x, BRINDIS.y, T.choca);
      glu(g, t, pG, G, { x: 780, y: 872 }, T.bebe0 + 0.15, T.bebe1 - 0.05, 1);
      glu(g, t, pR, R, { x: 760, y: 790 }, T.bebe0 + 0.15, T.bebe1 - 0.08, 1);
      BT.forEach(b => glu(g, t, pG, G, { x: 780, y: 872 }, b.boca + 0.02, b.trago1, 1));
      clinc(g, t, VACIO_G.x, VACIO_G.y + 18, T.deja, 0.7); clinc(g, t, VACIO_R.x, VACIO_R.y + 18, T.deja, 0.7);
      const pecho = R.aPantalla(pR, R.tronco(pR)(CHEST_R));
      pum(g, t, pecho.x - 6, pecho.y, T.rPecho0 + 0.16); pum(g, t, pecho.x - 6, pecho.y, T.rPecho0 + 0.4);
      const tripa = G.aPantalla(pG, G.tronco(pG)(BARRIGA_G));
      pum(g, t, tripa.x + 8, tripa.y, T.gPalmea + 0.09); pum(g, t, tripa.x + 8, tripa.y, T.gPalmea + 0.31);
      // eructo de Rodri (hacia la izquierda)
      const bR = origenOnda("r", T.rEructo);
      ondas(g, t, "r", Math.PI + 0.12, T.rEructo, { n: 5, paso: 0.1, r0: 10, vel: 480, alcance: 300, ab: 0.78, onda: 2.6, grosor: 4, dura: 1.2 });
      nube(g, t, { x: bR.x - 4, y: bR.y }, Math.PI + 0.15, T.rEructo, 1, 0.9);
      pio(g, t);
      tension(g, t, pG);
      // ¡el eructo de Guillermo! (hacia la derecha)
      const bG = origenOnda("g", T.gEructo);
      ondas(g, t, "g", -0.1, T.gEructo, { n: 7, paso: 0.09, r0: 12, vel: 1000, alcance: 620, ab: 0.82, onda: 5, grosor: 8, dura: 1.3 });
      nube(g, t, { x: bG.x + 6, y: bG.y }, -0.1, T.gEructo, 2.2, 1.2);
      rafagas(g, t);
      golpeCuadro(g, t);
      suspiro(g, t, pG);
      plas(g, t, pR);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  // de dónde sale cada casco (la mano al soltarlo): se calcula una vez
  const LANZA = [];
  function desdeLanza(i) {
    if (!LANZA[i]) {
      const t = BT[i].suelta, dt = 0.0001;
      const a = poseG(t-dt).agarreBotella, b = poseG(t).agarreBotella;
      LANZA[i] = { ...b, vx: (b.x-a.x)/dt, vy: (b.y-a.y)/dt, va: Math.atan2(Math.sin(b.ang-a.ang), Math.cos(b.ang-a.ang))/dt };
    }
    return LANZA[i];
  }

  registrar({ id: "00113.2", nombre: "Guillermo y Rodri · El concurso de eructos", crear: () => new ElEructo() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["r", R, poseR(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L);
    }
    return out;
  }
  window.__A2D_00113_2 = { pose: poses, poseG, poseR, T, DUR, diag, BT, PUNTA, enBotella, desdeLanza, EN_CAJA, EN_CUBO, CAJA, VUELO, estadoCuadro, CUADRO, anguloCuadro, SUELO_PARED, camara, CONT, ESC_B, infla, vientoR, sacudida, volG, volR, volB, AREA_INT, INT, nivel, recorta, area, rot, BRINDIS, cascoSuelto, esquinaCuadro, contactoCuadro, SUELO_CUADRO, origenOnda, llegada, dibCaja };
})();
