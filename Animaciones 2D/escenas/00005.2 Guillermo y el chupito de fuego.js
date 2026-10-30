"use strict";
/* 00005.2 · Guillermo y el chupito de fuego
 *
 * Negro → en una chupitería de ladrillo, Guillermo está junto a la barra con las manos en los
 * bolsillos y mira de reojo el chupito que tiene al lado → lo coge, saca un mechero del bolsillo,
 * falla la primera chispa y a la segunda prende el chupito: llama azul y naranja → lo levanta y
 * mira a cámara orgulloso → coge aire, hincha los mofletes y sopla para apagarlo… y la llamarada
 * le vuelve a la cara: fogonazo, destello y temblor → se disipa el humo: tiene la cara negra de
 * hollín, los ojos muy blancos, el pelo y las cejas echando humo → parpadea dos veces, tose y le
 * sale un anillo de humo → se encoge de hombros, se bebe el chupito de un trago, «aaah», lo deja
 * en la barra y sonríe a cámara con los dientes blanquísimos y el pulgar arriba → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 550, XG = 395;
  const DUR = 13.45;
  const T = {
    mira0: 0.55, coge0: 1.0, coge: 1.45, alza1: 1.95,
    mechero0: 1.75, mechero1: 2.25, acerca0: 2.25, acerca1: 2.62,
    chispa1: 2.7, chispa2: 3.0, prende: 3.36, retira0: 3.52, guarda0: 3.72, guarda1: 4.2,
    orgullo0: 4.05, orgullo1: 4.5,
    boca0: 5.0, boca1: 5.42, inspira0: 5.3, inspira1: 5.92, sopla0: 5.92, zas: 6.32,
    parpa1: 7.95, parpa2: 8.27, tos1: 8.55, tos2: 8.92, mira1: 9.45, bebe0: 9.95, trago0: 10.22, trago1: 10.58, baja1: 10.88,
    deja0: 10.95, deja: 11.32, pulgar0: 11.3, sonrisa: 11.6, fin: 12.65
  };

  /* ---------- pies (clavados en el suelo) ---------- */
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PIE_X = { cerca: XG - 19, lejos: XG + 18 };

  /* ---------- posturas del cuerpo (se mezclan) ---------- */
  // dx: pelvis (px de pantalla), pel: pelvis arriba/abajo (hoja), manos respecto a su hombro (hoja).
  const P0 = { dx: 0, pel: 0, torso: 0, cab: 0, ins: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, cpu: 0, lx: 0, ly: 300, la: 0, lmu: -1.75, lp: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const SOST = { lx: 130, ly: 120, la: 0, lmu: -3.2, lp: 1 };
  const CUERPOS = {
    bolsillos: C_({}),
    coge: C_({ dx: 6, torso: 0.07, cab: 0.04, lx: 177, ly: 248, la: 0, lmu: -2.36, lp: 1 }),
    sostiene: C_(SOST),
    mechero: C_(Object.assign({}, SOST, { cx: 170, cy: 160, ca: 0.25, cmu: -3.67, cp: 1 })),
    enciende: C_(Object.assign({}, SOST, { lx: 105, ly: 115, lmu: -3.15, torso: 0.03, cab: 0.06, cx: 270, cy: 95, ca: 0.9, cmu: -4.35, cp: 1 })),
    orgullo: C_({ torso: -0.05, cab: -0.05, lx: 182, ly: -42, la: 0, lmu: -4.1, lp: 1 }),
    sopla: C_({ torso: 0.05, cab: 0.05, lx: 185, ly: -40, la: 0, lmu: -4.13, lp: 1 }),
    inspira: C_({ pel: -12, torso: -0.07, cab: -0.1, ins: 1, lx: 185, ly: -40, la: 0, lmu: -4.13, lp: 1 }),
    zas: C_({ dx: -6, pel: 8, torso: -0.13, cab: -0.24, lx: 165, ly: -25, la: -0.15, lmu: -4.1, lp: 1 }),
    pasmo: C_({ dx: -4, pel: 6, torso: -0.07, cab: -0.07, lx: 180, ly: -20, la: -0.05, lmu: -4.05, lp: 1 }),
    tos: C_({ dx: 2, pel: 18, torso: 0.1, cab: 0.16, lx: 175, ly: 10, la: 0, lmu: -3.9, lp: 1 }),
    encoge: C_({ pel: -6, torso: 0, cab: 0.06, lx: 140, ly: 80, la: 0, lmu: -3.47, lp: 1 }),
    bebe: C_({ pel: -4, torso: -0.08, cab: -0.42, lx: 120, ly: -40, la: 0, lmu: -3.8, lp: 1 }),
    tras: C_({ torso: 0.02, cab: 0.02, lx: 140, ly: 90, la: 0, lmu: -3.41, lp: 1 }),
    deja: C_({ dx: 6, torso: 0.07, cab: 0.06, lx: 177, ly: 248, la: 0, lmu: -2.36, lp: 1 }),
    pulgar: C_({ torso: -0.02, cab: -0.02, cx: 230, cy: 40, ca: -0.2, cmu: -3.8, cp: 1, cpu: 1 })
  };
  const GUION_CUERPO = [
    [T.coge0, T.coge, "coge"], [T.coge, T.alza1, "sostiene"], [T.mechero0, T.mechero1, "mechero"], [T.acerca0, T.acerca1, "enciende"],
    [T.guarda0, T.guarda1, "sostiene"], [T.orgullo0, T.orgullo1, "orgullo"], [T.boca0, T.boca1, "sopla"], [T.inspira0, T.inspira1, "inspira"],
    [T.sopla0, T.sopla0 + 0.16, "sopla"], [T.zas, T.zas + 0.07, "zas"], [T.zas + 0.3, T.zas + 0.9, "pasmo"],
    [T.tos1 - 0.04, T.tos1 + 0.07, "tos"], [T.tos1 + 0.12, T.tos1 + 0.3, "pasmo"], [T.tos2 - 0.04, T.tos2 + 0.07, "tos"], [T.tos2 + 0.12, T.tos2 + 0.36, "pasmo"],
    [T.mira1, T.mira1 + 0.4, "encoge"], [T.trago0, T.trago1, "bebe"], [T.trago1 + 0.04, T.baja1, "tras"], [T.deja0, T.deja, "deja"], [T.deja + 0.04, T.deja + 0.5, "pulgar"]
  ];
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function postura(t) {
    let c = CUERPOS.bolsillos;
    for (const [t0, t1, nom] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], (nom === "zas" || nom === "tos" ? salida : suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    inicio: E({}),
    picaro: E({ mx: 0.9, my: 0.55, sd: 12, gd: 0.12, si: 0, gi: -0.02, orig: 0, sonr: 0.45, ancho: 0.9 }),
    coge: E({ mx: 0.85, my: 0.45, sd: 8, gd: 0.08, si: 4, gi: 0.04, orig: 0, sonr: 0.6, ancho: 0.95 }),
    concentra: E({ mx: 0.88, my: 0.35, sd: -5, gd: -0.12, si: -3, gi: -0.08, orig: 0, abre: 9, ancho: 0.62, sonr: 0.15, dientes: 0, lengua: 1 }),
    asombro: E({ mx: 0.85, my: 0.15, iris: 1.12, sd: 22, gd: 0.16, si: 20, gi: 0.15, orig: 0, abre: 30, ancho: 0.8, sonr: 0.45, lengua: 0.2 }),
    orgullo: E({ mx: -0.85, my: -0.25, sd: 18, gd: 0.2, si: -2, gi: -0.06, orig: 0, sonr: 0.9, abre: 12, ancho: 1.05 }),
    inspira: E({ mx: 0.88, my: 0.1, c: 0.32, sd: 16, gd: 0.14, si: 16, gi: 0.14, orig: 0, sonr: -0.05, abre: 0, ancho: 0.55, mof: 1 }),
    sopla: E({ mx: 0.92, my: 0.1, c: 0.15, sd: 6, gd: 0.05, si: 6, gi: 0.05, orig: 0, abre: 18, ancho: 0.4, sonr: -0.15, dientes: 0, mof: 0.55 }),
    zas: E({ mx: 0, my: 0, c: 1, z: 1, sd: -6, gd: -0.1, si: -6, gi: -0.1, orig: 0, abre: 20, ancho: 0.44, sonr: -0.15, dientes: 0 }),
    pasmo: E({ mx: -0.7, my: -0.05, iris: 0.6, sd: 3, gd: 0, si: 3, gi: 0, orig: 0, abre: 21, ancho: 0.46, sonr: -0.15, dientes: 0 }),
    tos: E({ mx: -0.3, my: 0.2, iris: 0.8, c: 0.9, z: 0.8, sd: -8, gd: -0.1, si: -8, gi: -0.1, orig: 0, abre: 34, ancho: 0.85, sonr: -0.25, lengua: 0.6 }),
    encoge: E({ mx: 0.88, my: 0.35, sd: 20, gd: 0.25, si: 6, gi: -0.1, orig: 0, abre: 0, ancho: 0.8, sonr: 0.28 }),
    bebe: E({ mx: 0.5, my: -0.3, c: 1, sd: 12, gd: 0.1, si: 12, gi: 0.1, orig: 0, abre: 14, ancho: 0.62, sonr: 0, dientes: 0 }),
    aah: E({ c: 0.85, h: 1, sd: 16, gd: 0.15, si: 16, gi: 0.15, orig: 0, abre: 30, ancho: 1.05, sonr: 0.75, lengua: 0.3 }),
    sonrisa: E({ mx: -0.85, my: -0.15, sd: 16, gd: 0.18, si: 2, gi: -0.05, orig: 0, abre: 36, ancho: 1.22, sonr: 1, lengua: 0 })
  };
  const GUION_CARA = [
    [T.mira0, T.mira0 + 0.35, "picaro"], [T.coge0, T.coge0 + 0.3, "coge"], [T.acerca0, T.acerca0 + 0.3, "concentra"], [T.prende, T.prende + 0.12, "asombro"],
    [T.orgullo0, T.orgullo0 + 0.35, "orgullo"], [T.inspira0, T.inspira0 + 0.3, "inspira"], [T.sopla0, T.sopla0 + 0.08, "sopla"],
    [T.zas, T.zas + 0.05, "zas"], [T.zas + 0.35, T.zas + 0.5, "pasmo"],
    [T.tos1 - 0.05, T.tos1 + 0.05, "tos"], [T.tos1 + 0.18, T.tos1 + 0.3, "pasmo"], [T.tos2 - 0.05, T.tos2 + 0.05, "tos"], [T.tos2 + 0.1, T.tos2 + 0.22, "pasmo"],
    [T.mira1, T.mira1 + 0.35, "encoge"], [T.bebe0 + 0.05, T.trago0, "bebe"], [T.baja1 - 0.12, T.baja1 + 0.12, "aah"], [T.sonrisa - 0.25, T.sonrisa + 0.08, "sonrisa"]
  ];
  function expresion(t) {
    let e = CARAS.inicio;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const [tb, d] of [[1.25, 0.14], [4.75, 0.14], [T.parpa1, 0.17], [T.parpa2, 0.17], [12.1, 0.15]]) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }

  /* ---------- manos, chupito y mechero ---------- */
  const JKS = G.JK * S;                         // unidades de jarra → px de pantalla
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLSILLO_L = punoDesde({ x: 372, y: 648 }, 0, -1.75);
  const aHoja = (p, q) => ({ x: G.PELVIS.x + (q.x - p.x) / S, y: G.SUELO + (q.y - SUELO) / S });
  const rotP = G.rotP;
  const P = (x, y) => ({ x, y });

  const TOPE = 340;                              // borde de la barra
  const VASO_BARRA = { x: XG + 92, y: TOPE - 16 - 10 * JKS };   // centro del agarre cuando el chupito descansa en la barra
  const BORDE_VASO = P(-13, -36), PUNTA_MECHERO = P(1.5, -40), LLAMA_VASO = P(0, -29);

  // líquido: recorte del interior por la superficie (perpendicular a la gravedad)
  const INT = [P(-11.2, -34), P(11.2, -34), P(8.6, 1), P(-8.6, 1)];
  function recorta(pol, n, c) {
    const out = [], v = q => q.x * n.x + q.y * n.y - c;
    for (let i = 0; i < pol.length; i++) { const a = pol[i], b = pol[(i + 1) % pol.length], va = v(a), vb = v(b);
      if (va >= 0) out.push(a);
      if ((va >= 0) !== (vb >= 0)) { const k = va / (va - vb); out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }); } }
    return out;
  }
  const area = pol => { let s = 0; for (let i = 0; i < pol.length; i++) { const a = pol[i], b = pol[(i + 1) % pol.length]; s += a.x * b.y - b.x * a.y; } return Math.abs(s) / 2; };
  const AREA = area(INT);
  function nivel(n, vol) {
    let lo = Math.min(...INT.map(q => q.x * n.x + q.y * n.y)), hi = Math.max(...INT.map(q => q.x * n.x + q.y * n.y));
    for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (area(recorta(INT, n, m)) > vol * AREA) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function capacidadVaso(ang) {
    const n=rotP({x:0,y:1},-ang),c=Math.max(-11.2*n.x-34*n.y,11.2*n.x-34*n.y);
    return area(recorta(INT,n,c))/AREA;
  }
  const volumenVaso=(vol,ang)=>Math.min(vol,capacidadVaso(ang));
  const TINTA = "#0b0a0e";
  function vaso(g, t, v) {
    g.lineJoin = "round"; g.lineCap = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(-13, -36); g.lineTo(13, -36); g.lineTo(10.4, 7); g.quadraticCurveTo(10.1, 10, 7, 10); g.lineTo(-7, 10); g.quadraticCurveTo(-10.1, 10, -10.4, 7); g.closePath(); };
    cuerpo(); g.fillStyle = "rgba(214,236,255,0.28)"; g.fill();
    if (v.vol > 0.003) {
      const n = rotP({ x: 0, y: 1 }, -v.ang), cl = nivel(n, v.vol), pl = recorta(INT, n, cl);
      if (pl.length > 2) {
        g.beginPath(); M2.poligono(g, pl); g.fillStyle = "#ec8a1c"; g.fill();
        g.save(); g.beginPath(); M2.poligono(g, pl); g.clip();
        const fondo = recorta(INT, n, cl + 13); if (fondo.length > 2) { g.beginPath(); M2.poligono(g, fondo); g.fillStyle = "rgba(170,60,10,0.55)"; g.fill(); }
        const sup = recorta(INT, { x: -n.x, y: -n.y }, -(cl + 2.6)); if (sup.length > 2) { g.beginPath(); M2.poligono(g, sup); g.fillStyle = "#ffc457"; g.fill(); }
        g.restore();
      }
    }
    // fondo grueso del vaso
    g.fillStyle = "rgba(236,248,255,0.6)"; g.beginPath(); g.moveTo(-8.6, 1); g.lineTo(8.6, 1); g.lineTo(10.2, 8); g.quadraticCurveTo(10, 10, 7, 10); g.lineTo(-7, 10); g.quadraticCurveTo(-10, 10, -10.2, 8); g.closePath(); g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "rgba(255,255,255,0.78)"; g.beginPath(); g.moveTo(-10.4, -31); g.lineTo(-7.2, -31); g.lineTo(-6.2, -3); g.lineTo(-8.6, -3); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(6, -30, 2, 24);
    if (v.hollin > 0.01) { g.fillStyle = `rgba(40,34,30,${0.45 * v.hollin})`; g.fillRect(-14, -37, 28, 14); }
    g.restore();
    cuerpo(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(0, -36, 13, 2.4, 0, 0, Math.PI * 2); g.lineWidth = 1.3; g.stroke();
    g.lineWidth = 1.1; g.beginPath(); g.moveTo(-8.4, 1); g.lineTo(8.4, 1); g.stroke();
  }
  // Llama de cómic (base en el origen, apuntando hacia arriba). k: tamaño; inc: desvío de la punta.
  function llama(g, t, k, inc, sem, azul = 1) {
    if (k <= 0.01) return;
    const h = 40 * k, w = 13 * Math.min(1.25, k);
    const fl = ruido(t * 9 + sem) * 0.14 + ruido(t * 19 + sem * 3) * 0.07;
    const tx = inc + fl * 22 * k, ty = -h * (1 + fl * 0.6);
    const forma = (sw, sh, dx) => {
      const px = tx * sh / h + dx, py = ty * sh / h;
      g.beginPath(); g.moveTo(-sw, 0);
      g.bezierCurveTo(-sw * 1.25, -sh * 0.42, px * 0.45 - sw * 0.55, -sh * 0.72, px, py);
      g.bezierCurveTo(px * 0.45 + sw * 0.6, -sh * 0.62, sw * 1.25, -sh * 0.4, sw, 0);
      g.quadraticCurveTo(0, sw * 0.55, -sw, 0); g.closePath();
    };
    g.save(); g.lineJoin = "round";
    // lengüetas laterales que titilan
    for (const [lx, s0] of [[-0.7, 1], [0.75, 2]]) {
      const kk = 0.45 + 0.25 * ruido(t * 13 + sem + s0 * 5);
      g.save(); g.translate(lx * w, -h * 0.1); g.scale(0.4, kk);
      forma(w * 0.8, h * 0.9, inc * 0.4); g.fillStyle = "#ff8a1f"; g.fill(); g.lineWidth = 2.6; g.strokeStyle = "#8a2600"; g.stroke(); g.restore();
    }
    forma(w, h, 0); g.fillStyle = "#ff7a1a"; g.fill(); g.lineWidth = 1.5; g.strokeStyle = "#8a2600"; g.stroke();
    forma(w * 0.7, h * 0.72, inc * 0.1); g.fillStyle = "#ffd03a"; g.fill();
    if (azul > 0.01) { g.globalAlpha = azul; g.fillStyle = "#3d8bff"; g.beginPath(); g.ellipse(0, -h * 0.08, w * 0.72, h * 0.17, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    forma(w * 0.34, h * 0.4, inc * 0.05); g.fillStyle = "#fff6cc"; g.fill();
    g.restore();
  }
  function mechero(g, t, enc, chispa) {
    g.save(); g.lineJoin = "round";
    const cuerpo = () => { g.beginPath(); g.roundRect ? g.roundRect(-6.5, -30, 13, 43, 3) : g.rect(-6.5, -30, 13, 43); };
    cuerpo(); g.fillStyle = "#d8202f"; g.fill();
    g.save(); cuerpo(); g.clip(); g.fillStyle = "#9e1220"; g.fillRect(2.5, -31, 5, 45); g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-4.8, -27, 2.2, 34); g.restore();
    cuerpo(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    // cabeza metálica y ruedecita
    g.fillStyle = "#c9ced6"; g.beginPath(); g.rect(-6.5, -38.5, 13, 8.5); g.fill(); g.stroke();
    g.strokeStyle = "#5a5e66"; g.lineWidth = 0.9; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-4.5 + i * 3, -37.5); g.lineTo(-4.5 + i * 3, -31.5); g.stroke(); }
    g.fillStyle = "#3a3c42"; g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.arc(-3.2, -40.5, 3, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    return { enc, chispa };
  }
  // chispas de la ruedecita (en coordenadas de la mano, rectas en pantalla)
  function chispas(g, t, t0, ang) {
    const k = fase(t, t0, t0 + 0.16); if (k <= 0 || k >= 1) return;
    g.save(); g.translate(-2, -42); g.rotate(-ang); g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (hash(i + t0 * 10) - 0.5) * 2.6, d0 = 3 + 10 * k, d1 = d0 + 4 + 4 * hash(i + 3);
      g.globalAlpha = 1 - k; g.strokeStyle = i % 2 ? "#fff6c0" : "#ffb02e"; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(Math.cos(a) * d0, Math.sin(a) * d0 + 8 * k * k); g.lineTo(Math.cos(a) * d1, Math.sin(a) * d1 + 8 * k * k); g.stroke();
    }
    g.restore();
  }

  // estado del chupito: dónde está, cuánto líquido, cuánta llama
  function chupito(t) {
    const sujeto = t >= T.coge && t < T.deja;
    let vol = 0.8;
    vol *= 1 - suave(fase(t, T.trago0 + 0.06, T.trago1 - 0.04));
    // llama: prende, baila, se tumba al soplar y vuelve hacia la cara
    let fuego = 0, inc = 0;
    if (t >= T.prende) {
      const u = t - T.prende;
      fuego = salida(fase(u, 0, 0.18)) * (1 + 0.35 * Math.exp(-u * 6) * Math.sin(u * 18));
      const sop = tramo(t, T.sopla0, T.sopla0 + 0.2);
      fuego *= 1 - 0.32 * sop + 0.06 * Math.sin(t * 30) * sop;
      inc = 22 * sop + 4 * ruido(t * 20) * sop;
      const vuelve = fase(t, T.zas - 0.13, T.zas - 0.02);
      fuego = lerp(fuego, 1.9, suave(vuelve)); inc = lerp(inc, -62, suave(vuelve));
      fuego *= 1 - tramo(t, T.zas, T.zas + 0.07);
    }
    const hollin = tramo(t, T.zas + 0.08, T.zas + 0.2);
    return { sujeto, vol, fuego, inc, hollin };
  }

  /* ---------- hollín ---------- */
  // Polígono de la piel del retrato (cara, oreja y cuello), sacado del avatar.
  const PIEL = [956,503,938,501,918,520,896,531,895,526,907,504,907,491,894,491,867,505,845,509,873,470,873,457,854,448,853,442,830,439,824,431,801,432,799,438,779,437,729,464,736,428,723,428,679,454,676,477,649,496,635,536,629,543,624,542,619,526,589,500,572,499,556,507,544,522,531,568,530,593,539,614,572,657,572,664,527,801,521,812,492,833,492,853,738,853,738,847,704,811,705,806,741,830,769,840,767,853,801,853,802,845,812,843,822,835,907,719,932,645,954,612,954,594,892,588,891,583,896,578,941,581,947,587,960,586,964,518,957,516];
  const CAB = G.A.datos.piezas.cabeza;
  let CACHE_MUL = null, CACHE_GRIS = null;
  function capaHollin(tonoPiel, tonoPelo) {
    const c = document.createElement("canvas"); c.width = 316; c.height = 340; const k = c.getContext("2d");
    k.scale(c.width / CAB.tam_hoja[0], c.height / CAB.tam_hoja[1]); k.translate(-CAB.origen[0], -CAB.origen[1]);
    if (tonoPelo) { k.fillStyle = tonoPelo; k.fillRect(CAB.origen[0], CAB.origen[1], CAB.tam_hoja[0], CAB.tam_hoja[1]); }
    k.fillStyle = tonoPiel; k.beginPath(); k.moveTo(PIEL[0], PIEL[1]); for (let i = 2; i < PIEL.length; i += 2) k.lineTo(PIEL[i], PIEL[i + 1]); k.closePath(); k.fill();
    k.globalCompositeOperation = "destination-in"; Recortes.pieza(k, G.A, "cabeza");
    return c;
  }
  // Párpados (misma geometría que el montaje) para tiznar también la piel que baja al parpadear.
  const OJOS = {
    d: { arriba: [[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]],
         abajo: [[733, 556], [737, 566], [748, 573], [762, 577], [778, 583], [795, 589], [808, 592]] },
    i: { arriba: [[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]],
         abajo: [[866, 608], [868, 624], [880, 630], [895, 635], [910, 638], [921, 637]] }
  };
  function remuestrea(pts, n) {
    const Q = pts.map(q => ({ x: q[0], y: q[1] })), d = [0];
    for (let i = 1; i < Q.length; i++) d.push(d[i - 1] + Math.hypot(Q[i].x - Q[i - 1].x, Q[i].y - Q[i - 1].y));
    const out = [], L = d[d.length - 1];
    for (let k = 0; k < n; k++) { const s = L * k / (n - 1); let i = 1; while (i < d.length - 1 && d[i] < s) i++;
      const f = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]); out.push({ x: lerp(Q[i - 1].x, Q[i].x, f), y: lerp(Q[i - 1].y, Q[i].y, f) }); }
    return out;
  }
  for (const o of Object.values(OJOS)) { o.U = remuestrea(o.arriba, 14); o.D = remuestrea(o.abajo, 14); }
  function parpadosTizne(g, o, c, h, z) {
    if (c <= 0.002) return;
    const U = o.U, D = o.D, n = U.length, hz = Math.max(h, z);
    const M = U.map((u, i) => { const k = Math.sin(Math.PI * i / (n - 1));
      return mezcla({ x: D[i].x, y: D[i].y + 3 * k }, { x: lerp(u.x, D[i].x, 0.55), y: lerp(u.y, D[i].y, 0.55) - 9 * k * (1 - z) + (i % 2 ? 3 : -3) * k * z }, hz); });
    const Up = U.map((u, i) => mezcla(u, M[i], c)), Dp = D.map((d, i) => mezcla(d, M[i], c * hz));
    g.beginPath(); g.moveTo(U[0].x, U[0].y); for (const q of U) g.lineTo(q.x, q.y); for (let i = n - 1; i >= 0; i--) g.lineTo(Up[i].x, Up[i].y); g.closePath();
    if (c * hz > 0.01) { g.moveTo(D[0].x, D[0].y); for (const q of D) g.lineTo(q.x, q.y); for (let i = n - 1; i >= 0; i--) g.lineTo(Dp[i].x, Dp[i].y); g.closePath(); }
    g.fill(); g.stroke();
  }
  // Boca abierta (misma forma que el montaje): se deja limpia para que se vean los dientes blancos.
  function rutaBoca(g, b) {
    const hw = 44 * (b.ancho ?? 1), s = b.sonrisa ?? 0, o = Math.max(0, b.abre ?? 0);
    const yL = -8 * s, yR = -10 * s, ySup = 12 * s + 2 - o * 0.35, yInf = 12 * s + 2 + o * 1.25;
    g.translate(803, 730); g.rotate(0.26);
    g.moveTo(-hw, yL); g.quadraticCurveTo(0, ySup, hw, yR); g.bezierCurveTo(hw * 0.78, yInf, -hw * 0.78, yInf * 1.04, -hw, yL); g.closePath();
    g.rotate(-0.26); g.translate(-803, -730);
  }
  function hollinCara(g, p, k) {
    if (k <= 0.005) return;
    if (!CACHE_MUL) { CACHE_MUL = capaHollin("#4e4e54", "#b4aca8"); CACHE_GRIS = capaHollin("#808080", null); }
    const f = p.cara, b = f.boca;
    g.save();
    if ((b.abre ?? 0) > 0.3 && (b.orig ?? 0) < 0.5) { g.beginPath(); g.rect(400, 100, 800, 900); rutaBoca(g, b); g.clip("evenodd"); }
    const [ox, oy] = CAB.origen, [tw, th] = CAB.tam_hoja;
    g.globalAlpha = k; g.globalCompositeOperation = "saturation"; g.drawImage(CACHE_GRIS, ox, oy, tw, th);
    g.globalCompositeOperation = "multiply"; g.drawImage(CACHE_MUL, ox, oy, tw, th);
    const fe = f.ojos.feliz || 0, ap = f.ojos.apretado || 0; g.lineWidth = 3;
    for (const [modo, col] of [["saturation", "#808080"], ["multiply", "#4e4e54"]]) {
      g.globalCompositeOperation = modo; g.fillStyle = col; g.strokeStyle = col;
      parpadosTizne(g, OJOS.d, f.ojos.d, fe, ap); parpadosTizne(g, OJOS.i, f.ojos.i, fe, ap);
    }
    g.restore();
  }
  // El cuello (pieza del torso) también se tizna, cada vez menos hacia el cuello de la camiseta.
  const CUELLO = [203,221,192,251,173,264,173,271,206,300,235,314,263,320,277,320,290,316,294,311,295,301,294,295,285,286,287,267,298,263,325,233,330,221];
  const CU_X = 170, CU_Y = 221, CU_W = 164, CU_H = 102;
  let CACHE_CU = null;
  function capaCuello(color) {
    const c = document.createElement("canvas"); c.width = CU_W; c.height = CU_H; const k = c.getContext("2d");
    k.translate(-CU_X, -CU_Y);
    const gr = k.createLinearGradient(0, 255, 0, 322); gr.addColorStop(0, color); gr.addColorStop(1, "rgba(128,128,128,0)");
    k.fillStyle = gr; k.beginPath(); k.moveTo(CUELLO[0], CUELLO[1]); for (let i = 2; i < CUELLO.length; i += 2) k.lineTo(CUELLO[i], CUELLO[i + 1]); k.closePath(); k.fill();
    k.globalCompositeOperation = "destination-in"; Recortes.pieza(k, G.A, "tronco_libre");
    return c;
  }
  function hollinCuello(g, k) {
    if (k <= 0.005) return;
    if (!CACHE_CU) CACHE_CU = [capaCuello("#808080"), capaCuello("#4e4e54")];
    g.save(); g.globalAlpha = k;
    g.globalCompositeOperation = "saturation"; g.drawImage(CACHE_CU[0], CU_X, CU_Y);
    g.globalCompositeOperation = "multiply"; g.drawImage(CACHE_CU[1], CU_X, CU_Y);
    g.restore();
  }

  /* ---------- pose ---------- */
  function poseBase(t) {
    const b = postura(t);
    const respira = Math.sin(t * 2.3);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1 + 0.035 * b.ins, y: 1 + respira * 0.004 + 0.04 * b.ins },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, cara: null,
      hombrosContinuos: true, ikContinuo: true                     // brazos con IK continua: codos limpios aunque se doblen mucho
    };
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: G.PELVIS.x + (PIE_X[lado] - p.x) / S, y: TOB_Y[lado] }, ang: 0 };
    // golpe de la llamarada: la cabeza sale hacia atrás y se aplasta un instante
    const zas = t >= T.zas ? Math.exp(-(t - T.zas) * 7) * suave(fase(t, T.zas, T.zas + 0.04)) : 0;
    p.cabeza.esc = { x: 1 - 0.06 * zas, y: 1 + 0.08 * zas }; p.cabeza.dx = -10 * zas;
    // tembleque de la tos
    for (const tt of [T.tos1, T.tos2]) { const k = campana(t, tt - 0.04, tt + 0.22); p.cabeza.ang += 0.04 * Math.sin((t - tt) * 60) * k; }
    // cara
    const e = expresion(t);
    e.c = Math.max(e.c, parpadeos(t));
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: e.c, i: e.c, feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
    p.rojo = 0.3 * tramo(t, T.inspira0, T.inspira1) * (1 - tramo(t, T.zas, T.zas + 0.1));
    p.cara.rubor = p.rojo;
    const ch = chupito(t);
    p.capaCabeza = (g) => hollinCara(g, p, ch.hollin);
    p.capaTronco = (g) => hollinCuello(g, ch.hollin);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const enBolsC = 1 - clamp(b.cp * 1.5), enBolsL = 1 - clamp(b.lp * 1.5);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(c, BOLSILLO_C, enBolsC * (1 - b.cp)); l = mezcla(l, BOLSILLO_L, enBolsL * (1 - b.lp));
    let la = b.la;
    // coger y dejar el chupito justo en su sitio de la barra
    const barra = aHoja(p, VASO_BARRA);
    const wBarra = tramo(t, T.coge0 + 0.05, T.coge, suave) * (1 - tramo(t, T.coge, T.alza1)) + tramo(t, T.deja0, T.deja, suave) * (1 - tramo(t, T.deja + 0.04, T.deja + 0.5));
    l = mezcla(l, barra, wBarra);
    // beber: el borde del vaso a los labios, inclinándolo
    const wBeber = tramo(t, T.bebe0, T.trago0) * (1 - tramo(t, T.trago1 + 0.04, T.baja1));
    if (wBeber > 0) {
      const angB = -0.35 * tramo(t, T.bebe0, T.trago0) - 1.55 * tramo(t, T.trago0, T.trago1 - 0.08);
      const bo = G.boca(p), r = rotP({ x: BORDE_VASO.x * G.JK, y: BORDE_VASO.y * G.JK }, angB);
      const obj = { x: bo.x - r.x, y: bo.y - r.y };
      l = mezcla(l, obj, wBeber); la = lerp(la, angB, wBeber);
    }
    // golpe de mechero: la mano da un respingo en cada chispa
    for (const tc of [T.chispa1, T.chispa2]) { const k = campana(t, tc - 0.03, tc + 0.1); c.y -= 6 * k; }
    // mechero junto al borde del chupito
    const wMech = tramo(t, T.acerca0, T.acerca1) * (1 - tramo(t, T.retira0, T.guarda0 + 0.1));
    let ca = b.ca;
    if (wMech > 0) {
      const borde = { x: l.x + (BORDE_VASO.x + 5) * G.JK, y: l.y + (BORDE_VASO.y - 5) * G.JK };
      const angM = 0.9, r = rotP({ x: PUNTA_MECHERO.x * G.JK, y: PUNTA_MECHERO.y * G.JK }, angM);
      const acerca = 1 - 0.25 * tramo(t, T.acerca1, T.prende - 0.05) * 0;
      const obj = { x: borde.x - r.x - 10 * acerca, y: borde.y - r.y + 4 };
      c = mezcla(c, obj, wMech); ca = lerp(ca, angM, wMech);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: ca, mu: b.cmu, dobla: -1, puno: b.cp, pulgar: b.cpu };
    p.manoLejos = { x: l.x, y: l.y, ang: la, mu: b.lmu, dobla: -1, puno: b.lp };
    // chupito en la mano lejana (o quieto en la barra, dibujado en el mismo orden)
    const H = G.aPantalla(p, l);
    const off = { x: (VASO_BARRA.x - H.x) / JKS, y: (VASO_BARRA.y - H.y) / JKS };
    p.manoLejos.objeto = (g, tt) => {
      g.save();
      if (!ch.sujeto) { g.rotate(-la); g.translate(off.x, off.y); }
      const angV = ch.sujeto ? la : 0;
      vaso(g, tt, { vol: volumenVaso(ch.vol,angV), ang: angV, hollin: ch.hollin });
      if (ch.fuego > 0.01) {
        const base = { x: LLAMA_VASO.x, y: LLAMA_VASO.y + 2 * (1 - clamp(ch.fuego)) };
        g.save(); g.translate(base.x, base.y); g.rotate(-angV); llama(g, tt, ch.fuego, ch.inc, 3.1, 1); g.restore();
      }
      g.restore();
    };
    // mechero en la mano cercana (sale del bolsillo con la mano)
    const mechOn = t > T.mechero0 - 0.1 && t < T.guarda1;
    if (mechOn) {
      const llamaM = salida(fase(t, T.chispa2 + 0.02, T.chispa2 + 0.12)) * (1 - tramo(t, T.retira0 + 0.08, T.retira0 + 0.2));
      const kM = clamp(b.cp * 1.2);
      p.manoCerca.objeto = (g, tt) => {
        if (kM < 0.02) return;
        g.save(); g.scale(kM, kM);
        mechero(g, tt);
        chispas(g, tt, T.chispa1, ca); chispas(g, tt, T.chispa2, ca);
        if (llamaM > 0.01) { g.save(); g.translate(PUNTA_MECHERO.x, PUNTA_MECHERO.y); g.rotate(-ca); llama(g, tt, 0.42 * llamaM, 0, 7.7, 0.8); g.restore(); }
        g.restore();
      };
    }
    p._ch = ch; p._la = la;
    p.tirasLimpias = true;               // rodillas y codos sin dientes de sierra
    return p;
  }
  const pose = t => poseBase(t);

  /* ---------- efectos en pantalla ---------- */
  const llamaPantalla = p => { const m = p.manoLejos, r = rotP({ x: LLAMA_VASO.x * G.JK, y: (LLAMA_VASO.y - 14) * G.JK }, m.ang); return G.aPantalla(p, { x: m.x + r.x, y: m.y + r.y }); };
  const cabezaPantalla = (p, q) => G.aPantalla(p, G.cabeza(p).a(q));
  function brillo(g, t, p) {
    const ch = p._ch, k = clamp(ch.fuego) * (t < T.zas + 0.1 ? 1 : 0);
    if (k <= 0.01) return;
    const c = llamaPantalla(p), r = 110 + 10 * ruido(t * 12);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(c.x, c.y, 4, c.x, c.y, r); gr.addColorStop(0, `rgba(255,150,60,${0.32 * k})`); gr.addColorStop(1, "rgba(255,120,40,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, r, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function soplido(g, t, p) {
    const k = tramo(t, T.sopla0, T.sopla0 + 0.1) * (1 - tramo(t, T.zas - 0.04, T.zas + 0.02)); if (k <= 0.01) return;
    const b = G.aPantalla(p, G.boca(p)), f = llamaPantalla(p);
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.sopla0) * 2.8 + i / 3) % 1, y0 = (i - 1) * 7;
      const x0 = lerp(b.x + 10, f.x - 6, ph), x1 = lerp(b.x + 10, f.x - 6, Math.min(1, ph + 0.35));
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(x0, b.y - 4 + y0 + 3 * Math.sin(ph * 9)); g.quadraticCurveTo((x0 + x1) / 2, b.y - 8 + y0, x1, b.y - 6 + y0 * 0.6); g.stroke();
    }
    g.restore();
  }
  // nubes de bolitas con contorno (fuego o humo)
  function nube(g, bolas, relleno, luz, borde, lw) {
    g.fillStyle = borde; for (const [x, y, r] of bolas) { g.beginPath(); g.arc(x, y, r + lw, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = relleno; for (const [x, y, r] of bolas) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    if (luz) { g.fillStyle = luz; for (const [x, y, r] of bolas) { g.beginPath(); g.arc(x - r * 0.25, y - r * 0.3, r * 0.55, 0, Math.PI * 2); g.fill(); } }
  }
  function llamarada(g, t, p) {
    if (t < T.zas - 0.03 || t > T.zas + 0.75) return;
    const de = llamaPantalla(pose(T.zas - 0.03)), cab = cabezaPantalla(p, { x: 790, y: 560 });
    const u = fase(t, T.zas - 0.03, T.zas + 0.09), c = mezcla({ x: de.x - 26, y: de.y - 10 }, cab, suave(u));
    const crece = salida(fase(t, T.zas - 0.03, T.zas + 0.12)), R0 = 18 + 92 * crece;
    const apaga = fase(t, T.zas + 0.14, T.zas + 0.5);
    const bolas = (esc, d0) => { const o = []; for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2 + t * 2.5 + hash(i) * 0.6, d = R0 * d0 * (0.55 + 0.45 * hash(i + 7));
      o.push([c.x + Math.cos(a) * d - 14 * crece, c.y + Math.sin(a) * d * 0.85, R0 * esc * (0.42 + 0.2 * hash(i + 3)) * (1 + 0.08 * Math.sin(t * 40 + i))]); } return o; };
    g.save(); g.globalAlpha = 1 - suave(apaga);
    nube(g, bolas(1, 0.55), "#ff6a14", null, "#5a1400", 3);
    nube(g, bolas(0.72, 0.42), "#ffa21f", null, "#ffa21f", 0);
    nube(g, bolas(0.45, 0.3), "#ffe24a", null, "#ffe24a", 0);
    g.fillStyle = "#fff7d6"; g.beginPath(); g.arc(c.x - 10, c.y, R0 * 0.32, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function humareda(g, t, p) {
    const t0 = T.zas + 0.07; if (t < t0 || t > T.zas + 1.6) return;
    const cab = cabezaPantalla(p, { x: 790, y: 520 });
    const sale = 0.55 + 0.45 * salida(fase(t, t0, t0 + 0.2)), va = suave(fase(t, T.zas + 0.62, T.zas + 1.45)), entra = suave(fase(t, t0, t0 + 0.08));
    const bolas = [];
    for (let i = 0; i < 13; i++) {
      const a = i / 13 * Math.PI * 2 + hash(i + 20) * 0.5, d = (30 + 34 * hash(i + 21)) * sale;
      const ex = 1 + 0.9 * va, sube = 60 * va * (0.6 + hash(i + 22));
      const r = (34 + 18 * hash(i + 23)) * sale * (1 + 0.35 * va) + 3 * Math.sin(t * 5 + i);
      bolas.push([cab.x + Math.cos(a) * d * ex, cab.y + Math.sin(a) * d * 0.9 * ex - sube, Math.max(0, r)]);
    }
    g.save(); g.globalAlpha = Math.pow(1 - va, 1.4) * entra;
    nube(g, bolas, "#6d6662", "rgba(160,152,146,0.85)", "#26211f", 3);
    g.restore();
  }
  // humo que sale del pelo, de las cejas y del vaso
  const HEBRAS = [[600, 300, 0.9, 0.0], [700, 228, 1.05, 1.7], [820, 215, 1.15, 3.1], [950, 268, 1, 4.4], [1050, 380, 0.85, 5.6]];
  function hebra(g, t, x, y, L, sem, a) {
    g.save();
    for (let i = 0; i < 5; i++) {
      const ph = (t * 0.6 + i / 5 + sem * 0.137) % 1, r = (4 + 13 * ph) * (0.6 + 0.4 * L);
      const px = x + Math.sin(ph * 4 + sem + t * 0.8) * 8 * ph + 18 * ph, py = y - 6 - 80 * L * ph;
      g.globalAlpha = a * Math.sin(Math.PI * ph) * 0.42;
      g.fillStyle = "#a8a19b"; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function humoPelo(g, t, p) {
    const a = tramo(t, T.zas + 0.5, T.zas + 1.1) * (1 - 0.55 * tramo(t, T.zas + 3, T.fin));
    if (a <= 0.01) return;
    for (const [x, y, L, sem] of HEBRAS) { const q = cabezaPantalla(p, { x, y }); hebra(g, t, q.x, q.y, L, sem, a); }
    // ascuas en las puntas del pelo
    const as = tramo(t, T.zas + 0.3, T.zas + 0.5) * (1 - tramo(t, T.zas + 1.2, T.zas + 2.6));
    if (as > 0.01) {
      g.save(); g.globalCompositeOperation = "lighter";
      [[600, 300], [700, 230], [830, 225], [960, 280], [1050, 400]].forEach(([x, y], i) => {
        const q = cabezaPantalla(p, { x, y }), f = 0.5 + 0.5 * Math.sin(t * 13 + i * 2.3);
        g.globalAlpha = as * f; g.fillStyle = "#ffb03a"; g.beginPath(); g.arc(q.x, q.y, 3.2, 0, Math.PI * 2); g.fill();
        g.globalAlpha = as * f * 0.4; g.beginPath(); g.arc(q.x, q.y, 7, 0, Math.PI * 2); g.fill();
      });
      g.restore();
    }
    // el vaso todavía humea
    const av = tramo(t, T.zas + 0.3, T.zas + 0.7) * (1 - tramo(t, T.tos2, T.mira1 + 0.3));
    if (av > 0.01) { const q = llamaPantalla(p); hebra(g, t, q.x, q.y + 6, 0.6, 9.2, av * 0.8); }
  }
  function tos(g, t, p) {
    // primera tos: bocanada; segunda: anillo de humo que sube
    const k1 = fase(t, T.tos1, T.tos1 + 0.7);
    const b = G.aPantalla(p, G.boca(p));
    if (k1 > 0 && k1 < 1) {
      const c = { x: b.x + 14 + 30 * salida(k1), y: b.y - 6 - 30 * k1 };
      g.save(); g.globalAlpha = 1 - k1;
      const r = 8 + 14 * salida(k1);
      nube(g, [[c.x, c.y, r], [c.x + r * 0.8, c.y - r * 0.3, r * 0.7], [c.x - r * 0.6, c.y - r * 0.5, r * 0.6]], "#857e79", "rgba(180,172,166,0.8)", "#2e2927", 2);
      g.restore();
    }
    const k2 = fase(t, T.tos2 + 0.02, T.tos2 + 1.45);
    if (k2 > 0 && k2 < 1) {
      const o = poseBase(T.tos2 + 0.02), b0 = G.aPantalla(o, G.boca(o));
      const c = { x: b0.x + 18 + 34 * salida(k2) + 6 * Math.sin(k2 * 7), y: b0.y - 4 - 150 * suave(k2) * 0.9 - 20 * k2 };
      const r = 8 + 30 * salida(k2), a = (1 - k2) * (1 - k2) * clamp(k2 * 8);
      g.save(); g.translate(c.x, c.y); g.rotate(0.12 * Math.sin(k2 * 5));
      g.globalAlpha = a; g.lineWidth = 11 * (1 - 0.4 * k2); g.strokeStyle = "#3a3431";
      g.beginPath(); g.ellipse(0, 0, r, r * 0.42, 0, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 7 * (1 - 0.4 * k2); g.strokeStyle = "#b3aca6"; g.stroke();
      g.restore();
    }
  }
  function destelloDientes(g, t, p) {
    const k = campana(t, T.sonrisa + 0.05, T.sonrisa + 0.55); if (k <= 0.01) return;
    const q = cabezaPantalla(p, { x: 838, y: 716 });
    g.save(); g.translate(q.x, q.y); g.rotate(t * 2); g.scale(k, k);
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 2.2 : 10; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
    g.fillStyle = "#ffffff"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#7fd4ff"; g.stroke();
    g.restore();
  }
  function tocBarra(g, t) {
    const k = fase(t, T.deja - 0.02, T.deja + 0.25); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,240,200,${1 - k})`; g.lineWidth = 2.2; g.lineCap = "round";
    const y = TOPE - 7;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const x = VASO_BARRA.x + s * (16 + 8 * k); g.beginPath(); g.moveTo(x, y - 4 - i * 9); g.lineTo(x + s * 9, y - 8 - i * 12); g.stroke(); }
    g.restore();
  }

  /* ---------- decorado: chupitería de ladrillo con barra ---------- */
  let fondo = null;
  function botella(g, x, y, tipo, color, i) {
    g.save(); g.translate(x, y); g.lineJoin = "round";
    const forma = () => {
      g.beginPath();
      if (tipo === 0) { g.moveTo(-9, 0); g.lineTo(-9, -38); g.quadraticCurveTo(-9, -48, -3, -52); g.lineTo(-3, -66); g.lineTo(3, -66); g.lineTo(3, -52); g.quadraticCurveTo(9, -48, 9, -38); g.lineTo(9, 0); }
      else if (tipo === 1) { g.moveTo(-11, 0); g.lineTo(-11, -34); g.lineTo(-5, -40); g.lineTo(-4, -50); g.lineTo(4, -50); g.lineTo(5, -40); g.lineTo(11, -34); g.lineTo(11, 0); }
      else { g.moveTo(-7, 0); g.lineTo(-8, -30); g.quadraticCurveTo(-8, -40, -2.5, -44); g.lineTo(-2.5, -58); g.lineTo(2.5, -58); g.lineTo(2.5, -44); g.quadraticCurveTo(8, -40, 8, -30); g.lineTo(7, 0); }
      g.closePath();
    };
    forma(); g.fillStyle = color; g.fill();
    g.save(); forma(); g.clip();
    g.fillStyle = "rgba(0,0,0,0.28)"; g.fillRect(3, -70, 12, 72);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-6, -36, 2.5, 30);
    g.fillStyle = "rgba(255,244,220,0.85)"; g.fillRect(-8, -26 + (i % 3) * 2, 16, 11);   // etiqueta lisa (sin letras)
    g.fillStyle = "rgba(120,40,20,0.5)"; g.fillRect(-8, -18 + (i % 3) * 2, 16, 2);
    g.restore();
    forma(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = ["#c9ced6", "#b8862a", "#1c1a1e"][i % 3]; g.fillRect(-3.5, tipo === 1 ? -55 : tipo === 0 ? -71 : -63, 7, 6); g.strokeRect(-3.5, tipo === 1 ? -55 : tipo === 0 ? -71 : -63, 7, 6);
    g.restore();
  }
  function taburete(g, x) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.fillStyle = "#1d1a1c";
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 6, 430); g.lineTo(x + s * 26, 536); g.lineTo(x + s * 19, 536); g.lineTo(x + s * 1, 432); g.closePath(); g.fill(); g.stroke(); }
    g.strokeStyle = "#b8862a"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 18, 496); g.lineTo(x + 18, 496); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 3;
    g.fillStyle = "#a31d2b"; g.beginPath(); g.ellipse(x, 422, 34, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#c93a46"; g.beginPath(); g.ellipse(x - 6, 419, 20, 4.5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared de ladrillo
    g.fillStyle = "#2a120d"; g.fillRect(-40, -60, W + 80, 520);
    for (let f = 0, y = -60; y < 440; f++, y += 24) {
      const off = f % 2 ? 0 : 28;
      for (let x = -40 - off; x < W + 40; x += 56) {
        const h = hash(f * 31 + Math.round(x)); const r = 118 + 30 * h, gg = 50 + 16 * h, bb = 36 + 10 * h;
        g.fillStyle = `rgb(${r | 0},${gg | 0},${bb | 0})`; g.fillRect(x + 2, y + 2, 52, 20);
        g.fillStyle = "rgba(255,200,170,0.12)"; g.fillRect(x + 2, y + 2, 52, 3);
      }
    }
    const osc = g.createLinearGradient(0, -60, 0, 440); osc.addColorStop(0, "rgba(14,6,10,0.82)"); osc.addColorStop(0.55, "rgba(30,10,10,0.35)"); osc.addColorStop(1, "rgba(20,6,6,0.55)");
    g.fillStyle = osc; g.fillRect(-40, -60, W + 80, 500);
    // mueble de botellas detrás de la barra
    g.fillStyle = "#24140c"; g.fillRect(470, 40, W - 430, 300); g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(470, 40, W - 430, 300);
    const esp = g.createLinearGradient(0, 60, 0, 320); esp.addColorStop(0, "#1b2b3a"); esp.addColorStop(1, "#3c2a2a");
    g.fillStyle = esp; g.fillRect(486, 56, W - 462, 268);
    const luzB = g.createRadialGradient(760, 190, 20, 760, 190, 330); luzB.addColorStop(0, "rgba(255,190,110,0.42)"); luzB.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = luzB; g.fillRect(486, 56, W - 462, 268);
    const COL = ["#2f7d3a", "#c8741a", "#cfe6ee", "#2a5fae", "#a8202a", "#e0b23a", "#5a2a6e"];
    for (const [ys, n0] of [[160, 0], [262, 5]]) {
      for (let i = 0; i < 10; i++) { const x = 512 + i * 50 + hash(i + n0) * 14; botella(g, x, ys, (i + n0) % 3, COL[(i * 3 + n0) % COL.length], i + n0); }
      g.fillStyle = "#6b3f22"; g.fillRect(486, ys, W - 462, 9); g.fillStyle = "#8f5a32"; g.fillRect(486, ys, W - 462, 3); g.strokeRect(486, ys, W - 462, 9);
    }
    // letrero de neón con una llama (solo dibujo)
    g.save(); g.translate(180, 170); g.lineCap = "round"; g.lineJoin = "round";
    const neon = () => { g.beginPath(); g.moveTo(0, 60); g.bezierCurveTo(-46, 52, -50, 6, -22, -20); g.bezierCurveTo(-18, 0, -8, 4, -4, -6); g.bezierCurveTo(-12, -40, 4, -70, 10, -84);
      g.bezierCurveTo(16, -52, 52, -34, 44, 14); g.bezierCurveTo(40, 46, 22, 60, 0, 60);
      g.moveTo(2, 44); g.bezierCurveTo(-18, 40, -18, 14, -2, 0); g.bezierCurveTo(0, 16, 14, 14, 14, 2); g.bezierCurveTo(26, 18, 22, 42, 2, 44); };
    g.strokeStyle = "#3a1a14"; g.lineWidth = 10; neon(); g.stroke();
    g.shadowColor = "rgba(255,110,60,0.95)"; g.shadowBlur = 26; g.strokeStyle = "#ff6a3d"; g.lineWidth = 6; neon(); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = "#ffd2b4"; g.lineWidth = 2.2; neon(); g.stroke();
    const halo = g.createRadialGradient(0, -10, 10, 0, -10, 170); halo.addColorStop(0, "rgba(255,90,50,0.22)"); halo.addColorStop(1, "rgba(255,90,50,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(0, -10, 170, 0, Math.PI * 2); g.fill();
    g.restore();
    // lámparas colgantes
    for (const lx of [330, 720]) {
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, -60); g.lineTo(lx, 20); g.stroke();
      const halo = g.createRadialGradient(lx, 44, 4, lx, 44, 170); halo.addColorStop(0, "rgba(255,206,120,0.5)"); halo.addColorStop(1, "rgba(255,190,100,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 44, 170, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#b8862a"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(lx - 30, 46); g.quadraticCurveTo(lx, 6, lx + 30, 46); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#ffe8b0"; g.beginPath(); g.ellipse(lx, 46, 22, 6, 0, 0, Math.PI * 2); g.fill();
    }
    // suelo de baldosas blancas y negras en perspectiva
    const Y0 = 436, VX = 512, VY = 150, YB = H + 60;
    g.fillStyle = "#1a1416"; g.fillRect(-40, Y0, W + 80, YB - Y0);
    const filas = [Y0]; let dy = 9; while (filas[filas.length - 1] < YB) { filas.push(filas[filas.length - 1] + dy); dy *= 1.28; }
    const xEn = (xb, y) => VX + (xb - VX) * (y - VY) / (YB - VY);
    for (let r = 0; r < filas.length - 1; r++) for (let k = -14; k < 14; k++) {
      const y0 = filas[r], y1 = filas[r + 1], a = VX + k * 96, b = a + 96;
      g.fillStyle = (r + k) % 2 ? "#ded2bc" : "#2b2426";
      g.beginPath(); g.moveTo(xEn(a, y0), y0); g.lineTo(xEn(b, y0), y0); g.lineTo(xEn(b, y1), y1); g.lineTo(xEn(a, y1), y1); g.closePath(); g.fill();
    }
    const brilloS = g.createLinearGradient(0, Y0, 0, YB); brilloS.addColorStop(0, "rgba(20,8,8,0.75)"); brilloS.addColorStop(0.5, "rgba(30,10,10,0.3)"); brilloS.addColorStop(1, "rgba(10,4,4,0.55)");
    g.fillStyle = brilloS; g.fillRect(-40, Y0, W + 80, YB - Y0);
    g.fillStyle = "#3b2014"; g.fillRect(-40, Y0 - 8, W + 80, 10); g.fillStyle = "rgba(255,200,150,0.15)"; g.fillRect(-40, Y0 - 8, W + 80, 2);
    // taburetes delante de la barra (detrás de Guillermo)
    // barra: lateral, frente de madera con paneles, reposapiés de latón y encimera
    const BX = 440, BF = SUELO - 14;
    g.fillStyle = "#2e170c"; g.beginPath(); g.moveTo(BX - 18, TOPE - 4); g.lineTo(BX, TOPE); g.lineTo(BX, BF); g.lineTo(BX - 18, BF - 8); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    const mad = g.createLinearGradient(0, TOPE, 0, BF); mad.addColorStop(0, "#5c2f18"); mad.addColorStop(1, "#3a1d0f");
    g.fillStyle = mad; g.fillRect(BX, TOPE, W + 40 - BX, BF - TOPE); g.strokeRect(BX, TOPE, W + 60 - BX, BF - TOPE);
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 3;
    for (let x = BX + 22; x < W + 40; x += 120) { g.strokeRect(x, TOPE + 26, 96, BF - TOPE - 70); }
    g.strokeStyle = "rgba(255,190,140,0.12)"; g.lineWidth = 2;
    for (let x = BX + 22; x < W + 40; x += 120) { g.beginPath(); g.moveTo(x + 2, TOPE + 28); g.lineTo(x + 94, TOPE + 28); g.stroke(); }
    g.fillStyle = "#24120a"; g.fillRect(BX, BF - 30, W + 40 - BX, 30);
    g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(BX + 10, BF - 46); g.lineTo(W + 40, BF - 46); g.stroke();
    g.strokeStyle = "#d9a83c"; g.lineWidth = 5; g.stroke(); g.strokeStyle = "#fff0b0"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(BX + 10, BF - 47.5); g.lineTo(W + 40, BF - 47.5); g.stroke();
    for (let x = BX + 40; x < W + 40; x += 160) { g.fillStyle = "#b8862a"; g.fillRect(x - 3, BF - 46, 6, 20); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 3, BF - 46, 6, 20); }
    // encimera
    g.fillStyle = "#8a5530"; g.beginPath(); g.moveTo(BX - 22, TOPE - 16); g.lineTo(W + 40, TOPE - 16); g.lineTo(W + 40, TOPE); g.lineTo(BX - 18, TOPE); g.closePath(); g.fill();
    g.fillStyle = "#a96c3e"; g.fillRect(BX - 20, TOPE - 16, W + 60 - BX, 4);
    g.fillStyle = "#4a2614"; g.fillRect(BX - 18, TOPE, W + 60 - BX, 6);
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(BX - 22, TOPE - 16); g.lineTo(W + 40, TOPE - 16); g.moveTo(BX - 22, TOPE - 16); g.lineTo(BX - 18, TOPE + 6); g.lineTo(W + 40, TOPE + 6); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(BX, TOPE + 6, W + 40 - BX, 7);
    // taburetes
    taburete(g, 690); taburete(g, 905);
    // viñeta
    const v = g.createRadialGradient(470, 300, 280, 470, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = tramo(t, T.acerca0 - 0.4, T.acerca1 + 0.3, suave), b = tramo(t, T.boca0, T.inspira1, suave);
    const c = tramo(t, T.mira1, T.bebe0 + 0.3, suave), d = tramo(t, T.deja0, T.sonrisa + 0.2, suave);
    const k = 1 + 0.09 * a + 0.08 * b - 0.05 * c - 0.06 * d;
    return { k, x: 474 - 18 * a - 14 * b + 12 * c + 12 * d, y: 318 - 4 * a - 6 * b + 5 * c + 5 * d };
  }

  class GuillermoChupito extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      const p = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.zas ? 9 * Math.exp(-(t - T.zas) * 5.5) * suave(fase(t, T.zas, T.zas + 0.04)) : 0)
        + 2.2 * campana(t, T.tos1 - 0.03, T.tos1 + 0.2) + 2.2 * campana(t, T.tos2 - 0.03, T.tos2 + 0.2);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -60);
      g.save(); g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse(p.x + 6, SUELO + 1, 105, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      G.dibujar(g, p, t);
      brillo(g, t, p);
      soplido(g, t, p);
      llamarada(g, t, p);
      humareda(g, t, p);
      humoPelo(g, t, p);
      tos(g, t, p);
      tocBarra(g, t);
      destelloDientes(g, t, p);
      g.restore();
      // destello de la llamarada
      const fl = t >= T.zas - 0.04 ? suave(fase(t, T.zas - 0.04, T.zas + 0.03)) * Math.exp(-Math.max(0, t - T.zas - 0.03) * 9) : 0;
      if (fl > 0.01) { g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(255,214,150,${0.42 * fl})`; g.fillRect(0, 0, W, H); g.restore(); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00005.2", nombre: "Guillermo y el chupito de fuego", crear: () => new GuillermoChupito() });
  window.__A2D_00005_2 = { pose, T, DUR, camara, chupito, capacidadVaso, volumenVaso, VASO_BARRA, BORDE_VASO, JKS, TOPE };
})();
