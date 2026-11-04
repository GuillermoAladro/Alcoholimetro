"use strict";
/* 00120.2 · Guillermo y Rodri · El brindis
 *
 * Negro → una cervecería de noche: pared encalada con vigas de madera, dos ventanas en arco con la
 * noche, guirnalda de banderines azules y blancos, un reloj de cuco sin números con su péndulo, dos
 * lámparas de hierro, zócalo de madera, una mesa larga con jarras, un pretzel y una vela, un barril con
 * su grifo y suelo de tablones. Guillermo y Rodri, cada uno con una jarra de cristal enorme llena de
 * cerveza y con su corona de espuma.
 *
 * Se miran, alzan las jarras muy solemnes → cogen carrerilla: bajan la jarra a la cadera, se echan atrás
 * y aprietan los dientes → ¡brindis con todas sus fuerzas! → ¡POF!: las dos jarras revientan en una nube
 * de espuma que los envuelve (vuelan pegotes que se estampan en la pared, la mesa, el reloj y el suelo; el
 * cuco sale del susto) → la nube se va: los dos, quietos, cubiertos de espuma de la cabeza a los hombros
 * (pegotes en el pelo, la barba de Rodri blanca, chorretones por el pecho), con los ojos cerrados → una
 * gota de espuma le cuelga a Guillermo de la nariz y cae → parpadean (los ojos quedan limpios), se miran
 * muy serios… → se les escapa la risa y se parten, soltando espuma a cada sacudida → se relamen el bigote
 * de espuma, primero Guillermo y luego Rodri («mmm») → les queda un culito en las jarras: brindis suave
 * (¡tin!) → miran a cámara y Rodri guiña → negro.
 *
 * Sin textos. La espuma sobre los dos es una capa aparte, como la harina de 00100: los dos se dibujan en
 * un lienzo, se saca su silueta blanca con burbujitas (mucha en la cabeza y los hombros, poca en las
 * piernas) y se pone encima con «screen», que aclara sin borrar las líneas; los ojos (desde el parpadeo)
 * y la boca (desde la risa) quedan limpios. Encima van los pegotes, el bigote de espuma, la lengua, las
 * lágrimas y los chorretones, en coordenadas del retrato o de la hoja de cada uno. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, R = Rodri;
  const DUR = 14.5;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;

  /* ---------- guion (s) ---------- */
  const T = {
    mira: 0.5, alza0: 0.85, alza1: 1.45,
    carga0: 1.62, carga1: 2.28,
    golpe0: 2.42, choca: 2.74,
    nubeFin: 3.95,
    baja0: 3.25, baja1: 3.9,
    gotaNariz: 4.55,
    gParpa: 5.0, rParpa: 5.28,
    seMiran: 5.6,
    gPff: 6.15, rPff: 6.38,
    risa0: 6.6, risa1: 8.6,
    gLame0: 8.95, gLame1: 9.7,
    rLame0: 9.85, rLame1: 10.6,
    alza2: 10.95, tin: 11.68, separa: 11.9,
    camara: 12.15, guino: 12.7,
    fin: 13.7
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
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABIERTA = D(0.75, 0.8, 0.74, 0.68, 0.62), AGARRA = D(0.2, 0.25, 0.22, 0.22, 0.25);
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
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const MESA = { x0: 236, x1: 800, y: 384 };          // mesa larga del fondo (tablero)

  /* =====================================================================================
   * JARRA DE CRISTAL (pantalla; origen donde agarra el puño, en el asa; `lado` hacia dónde va el cuerpo)
   * ===================================================================================== */
  const JX0 = 8, JX1 = 40, JY0 = -26, JY1 = 22;                     // cuerpo de la jarra (lado +1)
  const P = (x, y) => ({ x, y });
  const CUERPO = [P(JX0, JY0), P(JX1, JY0), P(JX1, JY1 - 3), P(JX1 - 3, JY1), P(JX0 + 3, JY1), P(JX0, JY1 - 3)];
  const SEMITRAZO = 0.9, EJE_BRINDIS = 517;
  function bordeJarra(j) {
    const q = rot(P(j.lado * JX1, JY0), j.ang);
    return P(j.x + q.x + j.lado * SEMITRAZO, j.y + q.y);
  }
  function manoToque(lado, ang) {
    return EJE_BRINDIS - bordeJarra({x: 0, y: 0, lado, ang}).x;
  }
  const INT = [P(JX0 + 3, JY0 + 1), P(JX1 - 3, JY0 + 1), P(JX1 - 3, JY1 - 6), P(JX0 + 3, JY1 - 6)];
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
  const asa = g => { g.beginPath(); g.moveTo(JX0, -17); g.bezierCurveTo(-9, -17, -9, 13, JX0, 13); };
  /* j = { x, y, ang, lado, vol (0…1), esp (corona de espuma 0…1), restos (espuma pegada 0…1), t, tiembla } */
  function dibJarra(g, j) {
    g.save(); g.translate(j.x, j.y); g.rotate(j.ang || 0); g.scale(j.lado || 1, 1); g.lineJoin = "round"; g.lineCap = "round";
    const lado = j.lado || 1, inclinacion = (j.ang || 0) + (j.oleaje || 0);
    const n = { x: lado * Math.sin(inclinacion), y: Math.cos(inclinacion) };
    // asa (cristal grueso)
    asa(g); g.lineWidth = 8.5; g.strokeStyle = TINTA; g.stroke();
    asa(g); g.lineWidth = 5.5; g.strokeStyle = "#c8dde2"; g.stroke();
    asa(g); g.lineWidth = 1.6; g.strokeStyle = "rgba(255,255,255,0.85)"; g.stroke();
    // cristal (fondo)
    g.beginPath(); poli(g, CUERPO); g.fillStyle = "rgba(226,240,244,0.5)"; g.fill();
    const vol = j.vol || 0, esp = j.esp || 0;
    if (vol > 0.004 || esp > 0.01) {
      const c = nivel(n, Math.max(vol, 0.004)), he = 9 * esp;
      g.save(); g.beginPath(); poli(g, INT); g.clip();
      // corona de espuma por encima de la cerveza
      if (esp > 0.01) {
        const pe = recorta(INT, n, c - he);
        if (pe.length > 2) { g.beginPath(); poli(g, pe); g.fillStyle = "#fff4dc"; g.fill(); }
      }
      if (vol > 0.004) {
        const pl = recorta(INT, n, c);
        if (pl.length > 2) {
          g.beginPath(); poli(g, pl);
          const gr = g.createLinearGradient(0, JY0, 0, JY1); gr.addColorStop(0, "#f8b62c"); gr.addColorStop(1, "#c36c0a");
          g.fillStyle = gr; g.fill();
          // burbujitas que suben
          g.fillStyle = "rgba(255,238,190,0.7)";
          for (let i = 0; i < 7; i++) {
            const ph = ((j.t || 0) * (0.6 + 0.4 * hash(i + 3)) + hash(i + 1)) % 1;
            const bx = JX0 + 6 + (JX1 - JX0 - 12) * hash(i + 9), by = lerp(JY1 - 8, JY0 + 6, ph);
            if (bx * n.x + by * n.y > c + 2) { g.beginPath(); g.arc(bx, by, 0.8 + 0.6 * hash(i + 5), 0, TAU); g.fill(); }
          }
        }
      }
      g.restore();
    }
    // espuma pegada por dentro (jarra casi vacía): una película blanca arriba y en las paredes
    if ((j.restos || 0) > 0.01) {
      g.save(); g.beginPath(); poli(g, INT); g.clip(); g.fillStyle = `rgba(255,246,228,${0.55 * j.restos})`;
      g.beginPath(); g.moveTo(JX0, JY0); g.lineTo(JX1, JY0); g.lineTo(JX1, JY0 + 14);
      g.quadraticCurveTo(JX1 - 6, JY0 + 7, (JX0 + JX1) / 2 + 2, JY0 + 11); g.quadraticCurveTo(JX0 + 9, JY0 + 15, JX0 + 4, JY0 + 22); g.lineTo(JX0, JY0 + 22); g.closePath(); g.fill();
      g.restore();
    }
    // relieve del cristal: facetas y brillos
    g.save(); g.beginPath(); poli(g, CUERPO); g.clip();
    g.strokeStyle = "rgba(255,255,255,0.32)"; g.lineWidth = 1.1;
    for (const x of [18, 30]) { g.beginPath(); g.moveTo(x, JY0 + 4); g.lineTo(x, JY1 - 7); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(JX0 + 4, JY0 + 5); g.lineTo(JX0 + 4, JY1 - 8); g.stroke();
    g.fillStyle = "rgba(200,225,232,0.55)"; g.fillRect(JX0, JY1 - 6, JX1 - JX0, 6);           // culo grueso
    g.restore();
    g.beginPath(); poli(g, CUERPO); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(JX0, JY1 - 6); g.lineTo(JX1, JY1 - 6); g.lineWidth = 1; g.stroke();
    // espuma que desborda: cúpula de burbujas sobre el borde y chorretones por fuera
    if (esp > 0.5 && vol > 0.7) {
      const k = clamp((esp - 0.5) * 2) * clamp((vol - 0.7) / 0.15);
      const bl = [[JX0 + 3, -1, 5], [JX0 + 10, -4, 6.5], [JX0 + 18, -5.5, 7], [JX0 + 26, -4.5, 6.5], [JX1 - 3, -1.5, 5.5]];
      const camino = () => { g.beginPath(); for (const [x, dy, r] of bl) { g.moveTo(x + r * k, JY0 + dy * k); g.arc(x, JY0 + dy * k, r * k, 0, TAU); } };
      camino(); g.lineWidth = 2.2; g.strokeStyle = "#8a6a44"; g.stroke(); camino(); g.fillStyle = "#fff6e2"; g.fill();
      g.fillStyle = "#ffffff"; for (const [x, dy, r] of bl) { g.beginPath(); g.arc(x - r * 0.3 * k, JY0 + dy * k - r * 0.35 * k, r * 0.28 * k, 0, TAU); g.fill(); }
      // chorretón por el costado
      const l = 9 * k * (0.85 + 0.15 * Math.sin((j.t || 0) * 2.3));
      g.fillStyle = "#fff6e2"; g.strokeStyle = "#8a6a44"; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(JX1 - 2, JY0 - 1); g.quadraticCurveTo(JX1 + 3, JY0 + l * 0.5, JX1 + 1, JY0 + l); g.arc(JX1 - 1, JY0 + l, 2.4, 0, Math.PI); g.lineTo(JX1 - 4, JY0); g.closePath(); g.fill(); g.stroke();
    }
    // espuma por fuera (tras el reventón): un reborde en la boca de la jarra y dos goterones
    if ((j.restos || 0) > 0.01) {
      const k = j.restos, e = clamp(((j.t || 0) - T.choca) / 1.6);
      const L = [[JX0 + 2, JY0 + 1, 3.6 * k], [JX0 + 9, JY0 - 1, 4.4 * k], [JX0 + 18, JY0 - 0.5, 3.6 * k], [JX1 - 6, JY0, 4 * k], [JX1 + 0.5, JY0 + 3, 3.2 * k]];
      for (const c of goteo(JX1 + 0.5, JY0 + 4, 2.4 * k, 15 * k * salida(e), 3)) L.push(c);
      for (const c of goteo(JX0 + 9, JY0 + 1, 2.2 * k, 9 * k * salida(e), 5)) L.push(c);
      nube(g, L, 0.75);
    }
    g.restore();
  }

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  // pista de objetivos de pantalla {x, y, ang, d, mo, bol}
  function pista(lista, t, ctx) {
    let c = Object.assign({ mo: 0, bol: 0, ang: 0 }, evalua(lista[0][2], t, ctx));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t, ctx), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerpAng(c.ang || 0, o.ang ?? (c.ang || 0), k),
        d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol ?? (c.bol || 0), k) };
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
    const mu0 = muHacia(h, hom, (m.mo || 0));
    const x = lerp(h.x, bolsillo.x, k), y = lerp(h.y, bolsillo.y, k);
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }

  /* =====================================================================================
   * LA CERVEZA EN LA JARRA
   * ===================================================================================== */
  const volJ = t => lerp(0.86, 0.13, salida(fase(t, T.choca, T.choca + 0.12)));
  const espJ = t => 1 - fase(t, T.choca, T.choca + 0.06);
  const restosJ = t => tramo(t, T.choca + 0.02, T.choca + 0.14) * (1 - 0.35 * tramo(t, T.choca + 1, T.choca + 6));
  const chapoteo = (t, t0) => t > t0 ? 0.18 * Math.exp(-(t - t0) * 5) * Math.sin((t - t0) * 16) : 0;

  /* =====================================================================================
   * GUIONES DEL CUERPO (los dos casi a la vez; Rodri con un pelín de retraso)
   * ===================================================================================== */
  // risa: sacudida de hombros (0 fuera de la risa)
  const risaK = (t, t0) => dentro(t, t0, t0 + 0.2, T.risa1 - 0.4, T.risa1);
  const sacude = (t, t0) => risaK(t, t0) * Math.sin((t - t0) * 21);
  // el reventón: retroceso
  const retro = t => tramo(t, T.choca, T.choca + 0.08, salida) * (1 - tramo(t, T.choca + 0.2, T.choca + 0.9));

  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.15, c: 0.2, sd: 10, gd: 0.04, si: 12, gi: 0.06, abre: 0, ancho: 0.95, sonr: 0.5 }),
    alza: E({ mx: 0.85, my: -0.35, c: 0.2, h: 0.35, sd: 20, gd: 0.04, si: 22, gi: 0.05, abre: 8, ancho: 1.05, sonr: 0.85 }),
    carga: E({ mx: 0.95, my: 0.05, c: 0.42, sd: -6, gd: -0.14, si: -4, gi: -0.1, abre: 10, ancho: 1.15, sonr: 0.95 }),
    grito: E({ mx: 0.9, my: -0.1, c: 0.55, h: 0.3, sd: 16, gd: 0.05, si: 16, gi: 0.05, abre: 32, ancho: 1.15, sonr: 0.65 }),
    choque: E({ c: 1, z: 1, sd: 8, si: 8, abre: 18, ancho: 1.0, sonr: -0.1 }),
    espuma: E({ c: 1, z: 0.15, sd: 6, si: 6, abre: 0, ancho: 0.75, sonr: -0.18 }),
    parpa: E({ mx: -0.85, my: 0.05, iris: 0.82, c: 0, sd: 22, gd: 0.06, si: 22, gi: 0.06, abre: 0, ancho: 0.6, sonr: -0.08 }),
    mira: E({ mx: 0.92, my: 0.05, iris: 0.86, c: 0.12, sd: 12, si: 12, abre: 0, ancho: 0.62, sonr: -0.02 }),
    pff: E({ mx: 0.9, my: 0.1, c: 0.55, sd: 10, si: 10, abre: 0, ancho: 0.5, sonr: 0.45, mof: 0.7 }),
    risa: E({ mx: 0.7, my: 0.3, c: 1, h: 1, sd: 14, si: 14, abre: 28, ancho: 1.15, sonr: 0.95 }),
    calma: E({ mx: 0.85, my: 0.1, c: 0.55, h: 0.6, sd: 12, si: 12, abre: 6, ancho: 1.0, sonr: 0.8 }),
    lame: E({ mx: 0.4, my: -0.55, c: 0.15, sd: 16, si: 16, abre: 14, ancho: 0.8, sonr: 0.35 }),
    mm: E({ c: 1, h: 0.95, sd: 12, si: 12, abre: 0, ancho: 0.95, sonr: 0.85 }),
    alza2: E({ mx: 0.9, my: -0.05, c: 0.3, h: 0.45, sd: 14, si: 14, abre: 6, ancho: 1.0, sonr: 0.8 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.32, h: 0.4, sd: 14, gd: 0.04, si: 16, gi: 0.06, abre: 8, ancho: 1.08, sonr: 0.95 })
  };
  const CARAS_R = {
    inicio: E({ mx: 0.9, my: 0.15, c: 0.25, sd: 4, si: 4, sonr: 0.5, ancho: 0.95 }),
    alza: E({ mx: 0.85, my: -0.35, c: 0.25, h: 0.4, sd: 10, si: 10, abre: 8, ancho: 1.05, sonr: 0.85 }),
    carga: E({ mx: 0.95, my: 0.05, c: 0.45, sd: 2, gd: -0.06, si: 2, gi: -0.06, abre: 10, ancho: 1.12, sonr: 0.95 }),
    grito: E({ mx: 0.9, my: -0.1, c: 0.55, h: 0.3, sd: 10, si: 10, abre: 30, ancho: 1.12, sonr: 0.65 }),
    choque: E({ c: 1, z: 1, sd: 6, si: 6, abre: 18, ancho: 1.0, sonr: -0.1 }),
    espuma: E({ c: 1, z: 0.15, sd: 4, si: 4, abre: 0, ancho: 0.75, sonr: -0.15 }),
    parpa: E({ mx: -0.85, my: 0.05, iris: 0.82, c: 0, sd: 14, si: 14, abre: 0, ancho: 0.6, sonr: -0.05 }),
    mira: E({ mx: 0.92, my: 0.05, iris: 0.86, c: 0.15, sd: 8, si: 8, abre: 0, ancho: 0.62, sonr: -0.02 }),
    pff: E({ mx: 0.9, my: 0.1, c: 0.6, sd: 6, si: 6, abre: 0, ancho: 0.45, sonr: 0.5 }),
    risa: E({ mx: 0.7, my: 0.3, c: 1, h: 1, sd: 10, si: 10, abre: 26, ancho: 1.12, sonr: 0.95 }),
    calma: E({ mx: 0.85, my: 0.1, c: 0.55, h: 0.6, sd: 8, si: 8, abre: 6, ancho: 1.0, sonr: 0.8 }),
    lame: E({ mx: 0.4, my: -0.55, c: 0.15, sd: 12, si: 12, abre: 16, ancho: 0.8, sonr: 0.35 }),
    mm: E({ c: 1, h: 0.95, sd: 8, si: 8, abre: 0, ancho: 0.95, sonr: 0.85 }),
    alza2: E({ mx: 0.9, my: -0.05, c: 0.3, h: 0.45, sd: 8, si: 8, abre: 6, ancho: 1.0, sonr: 0.8 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.4, h: 0.3, sd: 6, si: 6, abre: 4, ancho: 1.0, sonr: 0.85 })
  };
  // dr: retraso de Rodri en los gestos compartidos
  const guionCara = (dr, lame0, lame1, parpa, pff) => [
    [0.55 + dr, 0.8 + dr, "inicio"], [T.alza0 + dr, T.alza0 + 0.3 + dr, "alza"], [T.carga0 + dr, T.carga0 + 0.25 + dr, "carga"],
    [T.golpe0 - 0.05, T.golpe0 + 0.1, "grito"], [T.choca - 0.02, T.choca + 0.04, "choque", salida], [T.choca + 0.5, T.choca + 0.8, "espuma"],
    [parpa, parpa + 0.12, "parpa"], [T.seMiran + dr, T.seMiran + 0.25 + dr, "mira"], [pff, pff + 0.15, "pff"],
    [T.risa0 + dr * 0.5, T.risa0 + 0.12 + dr * 0.5, "risa"], [T.risa1 - 0.4, T.risa1, "calma"],
    [lame0 - 0.25, lame0, "lame"], [lame1 - 0.05, lame1 + 0.15, "mm"], [lame1 + 0.5, lame1 + 0.8, "calma"],
    [T.alza2, T.alza2 + 0.3, "alza2"], [T.camara + dr, T.camara + 0.3 + dr, "camara"]
  ];
  const GUION_CARA_G = guionCara(0, T.gLame0, T.gLame1, T.gParpa, T.gPff);
  const GUION_CARA_R = guionCara(0.1, T.rLame0, T.rLame1, T.rParpa, T.rPff);
  const CUERPOS = {
    inicio: { torso: 0.03, cab: 0.03 }, alza: { torso: 0.0, cab: -0.12 }, carga: { torso: -0.14, cab: -0.08 },
    golpe: { torso: 0.18, cab: 0.12 }, espuma: { torso: 0.02, cab: 0.02 }, mira: { torso: 0.02, cab: 0.06 },
    risa: { torso: -0.04, cab: -0.22 }, calma: { torso: 0.03, cab: 0.02 }, lame: { torso: 0.0, cab: -0.14 },
    alza2: { torso: 0.05, cab: 0.0 }, camara: { torso: 0.0, cab: -0.04 }
  };
  const guionCuerpo = (dr, lame0, lame1) => [
    [0.5 + dr, 0.85 + dr, "inicio"], [T.alza0 + dr, T.alza1 + dr * 0.5, "alza"], [T.carga0 + dr * 0.5, T.carga1, "carga"],
    [T.golpe0, T.choca, "golpe", entrada], [T.choca + 0.25, T.baja1, "espuma"], [T.seMiran + dr, T.seMiran + 0.3 + dr, "mira"],
    [T.risa0, T.risa0 + 0.3, "risa"], [T.risa1 - 0.5, T.risa1, "calma"], [lame0 - 0.25, lame0, "lame"], [lame1, lame1 + 0.3, "calma"],
    [T.alza2, T.alza2 + 0.4, "alza2"], [T.camara + dr, T.camara + 0.4 + dr, "camara"]
  ];
  const GUION_CUERPO_G = guionCuerpo(0, T.gLame0, T.gLame1), GUION_CUERPO_R = guionCuerpo(0.1, T.rLame0, T.rLame1);

  function cuerpo(rig, X, b, t, dr, espejo, respira) {
    const p = {
      x: X, suelo: SUELO, s: S, tirasLimpias: true, espejo,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // retroceso del reventón y sacudidas de la risa
    const rt = retro(t);
    p.torso -= 0.16 * rt; p.cabeza.ang -= 0.22 * rt;
    p.cabeza.ang += 0.05 * muelle(t, T.choca + 0.1, 20, 4.5);
    const sk = sacude(t, T.risa0 + dr * 0.5);
    p.torso += 0.035 * sk; p.cabeza.ang += 0.05 * Math.sin((t - T.risa0) * 21 + 0.7) * risaK(t, T.risa0 + dr * 0.5);
    // carcajada: echa la cabeza atrás y se dobla hacia delante, a ratos
    const doble = risaK(t, T.risa0 + 0.6 + dr) * Math.max(0, Math.sin((t - T.risa0) * 3.1 + dr * 4));
    p.torso += 0.12 * doble; p.cabeza.ang += 0.1 * doble;
    // pff: se le escapa la risa (respingo de hombros)
    return p;
  }
  function piernas(rig, p, X, t, dr, abre) {
    const respira = Math.sin(t * 2.1 + dr * 3);
    // un saltito al chocar y rodillas que se doblan al cargar
    const carga = dentro(t, T.carga0 + dr * 0.5, T.carga1, T.golpe0 + 0.05, T.choca);
    const bote = campana(t, T.choca, T.choca + 0.35);
    p.pelvis = rig.aHoja(p, { x: X - (p.espejo ? -1 : 1) * 6 * carga + (p.espejo ? -1 : 1) * 4 * tramo(t, T.golpe0, T.choca), y: PY_PIE(rig) + respira * 0.9 + 9 * carga + 5 * bote + 3 * dentro(t, T.risa0, T.risa0 + 0.3, T.risa1 - 0.5, T.risa1) * Math.abs(Math.sin((t - T.risa0) * 3.1)) });
    const TOB = rig.SUELO - rig.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: rig.CADERA.cerca.x - 8 - abre, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: rig.CADERA.lejos.x + 14 + abre, y: TOB }, ang: 0 };
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const BARRIGA_G = { x: 330, y: 505 };
  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const p = cuerpo(G, XG, b, t, 0, false, respira);
    p.hombrosContinuos = true; p.hombrosRecortados = true;
    // asiente mientras se relame (mmm)
    p.cabeza.ang += 0.06 * Math.sin((t - T.gLame1) * 10) * dentro(t, T.gLame1, T.gLame1 + 0.1, T.gLame1 + 0.6, T.gLame1 + 0.8);
    // pff: respingo de hombros
    p.torso += 0.03 * campana(t, T.gPff, T.gPff + 0.25);
    piernas(G, p, XG, t, 0, 4);
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    if (risaK(t, T.risa0) > 0) ex.abre += 8 * Math.abs(Math.sin((t - T.risa0) * 10.5)) * risaK(t, T.risa0);
    ex.wd += 0;
    p.cara = cara(ex, (ex.c > 0.8 || ex.z > 0.4) ? 0 : parpadeo(t, [0.35, 2.05, 5.95, 9.0, 11.25, 12.95]));
    p.rojo = 0.28 * dentro(t, T.carga0, T.carga0 + 0.3, T.golpe0, T.choca) + 0.3 * dentro(t, T.risa0 + 0.3, T.risa0 + 0.7, T.risa1 - 0.4, T.risa1);
    manosG(p, t);
    return p;
  }
  function manosG(p, t) {
    const aP = q => G.aPantalla(p, G.tronco(p)(q));
    // mano lejana (hacia Rodri): la jarra
    const sh = 2.2 * Math.sin((t - T.risa0) * 21) * risaK(t, T.risa0 + 0.1);
    const PL = [
      [0, 0, { x: 452, y: 298, ang: 0, d: AGARRA }],
      [T.alza0, T.alza1, { x: 466, y: 214, ang: -0.08, d: AGARRA }],
      [T.carga0, T.carga1, { x: 440, y: 332, ang: 0.12, d: AGARRA }],
      [T.golpe0, T.choca, { x: manoToque(1, 0.03), y: 236, ang: 0.03, d: AGARRA }, entrada],
      [T.choca, T.choca + 0.12, { x: 456, y: 222, ang: -0.25, d: AGARRA }, salida],
      [T.baja0, T.baja1, { x: 454, y: 300, ang: 0, d: AGARRA }],
      [T.alza2, T.tin - 0.12, { x: 474, y: 252, ang: 0.04, d: AGARRA }],
      [T.tin - 0.12, T.tin, { x: manoToque(1, 0.04), y: 252, ang: 0.04, d: AGARRA }, entrada],
      [T.separa, T.separa + 0.55, { x: 458, y: 286, ang: -0.04, d: AGARRA }]
    ];
    const l = pista(PL, t);
    l.y += sh;
    const jar = { x: l.x, y: l.y, ang: l.ang, oleaje: chapoteo(t, T.tin), lado: 1, vol: volJ(t), esp: espJ(t), restos: restosJ(t), t };
    p.miJarra = jar;
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, g => conCamara(g, () => dibJarra(g, jar)));
    // mano cercana: en el bolsillo; en la risa, a la barriga
    const PC = [
      [0, 0, { x: 380, y: 330, ang: 0, d: RELAJADA, bol: 1 }],
      [T.risa0 + 0.05, T.risa0 + 0.35, () => Object.assign(aP(BARRIGA_G), { ang: 0, d: ABIERTA, bol: 0, mo: 0.5 })],
      [T.risa1 - 0.3, T.risa1 + 0.1, { x: 380, y: 330, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    ];
    let c = pista(PC, t);
    if (t > T.risa0 + 0.35 && t < T.risa1 - 0.3) c = Object.assign({}, c, aP({ x: BARRIGA_G.x, y: BARRIGA_G.y + 10 * Math.sin((t - T.risa0) * 21) }), { bol: 0 });
    p.manoCerca = manoRig(G, p, c, "cerca", BOLS_GC, -1, null);
  }

  /* =====================================================================================
   * RODRI (derecha, mira a la izquierda)
   * ===================================================================================== */
  const BARRIGA_R = { x: 300, y: 505 };
  function poseR(t) {
    const b = guion(GUION_CUERPO_R, CUERPOS, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = cuerpo(R, XR, b, t, 0.1, true, respira);
    p.cabeza.ang += 0.06 * Math.sin((t - T.rLame1) * 10) * dentro(t, T.rLame1, T.rLame1 + 0.1, T.rLame1 + 0.6, T.rLame1 + 0.8);
    p.torso += 0.03 * campana(t, T.rPff, T.rPff + 0.25);
    piernas(R, p, XR, t, 0.1, 0);
    const ex = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    if (risaK(t, T.risa0 + 0.05) > 0) ex.abre += 8 * Math.abs(Math.sin((t - T.risa0) * 10.5 + 0.8)) * risaK(t, T.risa0 + 0.05);
    ex.mof = 0;
    ex.wd += 0.6 * campana(t, T.guino, T.guino + 0.42) * 1.4;
    p.cara = cara(ex, (ex.c > 0.8 || ex.z > 0.4) ? 0 : parpadeo(t, [0.42, 2.0, 6.05, 9.3, 11.35]));
    p.rojo = 0.22 * dentro(t, T.carga0, T.carga0 + 0.3, T.golpe0, T.choca) + 0.25 * dentro(t, T.risa0 + 0.3, T.risa0 + 0.7, T.risa1 - 0.4, T.risa1);
    manosR(p, t);
    return p;
  }
  function manosR(p, t) {
    const aP = q => R.aPantalla(p, R.tronco(p)(q));
    const sh = 2.2 * Math.sin((t - T.risa0) * 21 + 0.9) * risaK(t, T.risa0 + 0.15);
    const PL = [
      [0, 0, { x: 580, y: 298, ang: 0, d: AGARRA }],
      [T.alza0 + 0.1, T.alza1 + 0.05, { x: 568, y: 214, ang: 0.08, d: AGARRA }],
      [T.carga0 + 0.05, T.carga1, { x: 594, y: 332, ang: -0.12, d: AGARRA }],
      [T.golpe0, T.choca, { x: manoToque(-1, -0.03), y: 236, ang: -0.03, d: AGARRA }, entrada],
      [T.choca, T.choca + 0.12, { x: 578, y: 222, ang: 0.25, d: AGARRA }, salida],
      [T.baja0 + 0.08, T.baja1 + 0.08, { x: 580, y: 300, ang: 0, d: AGARRA }],
      [T.alza2 + 0.05, T.tin - 0.12, { x: 560, y: 252, ang: -0.04, d: AGARRA }],
      [T.tin - 0.12, T.tin, { x: manoToque(-1, -0.04), y: 252, ang: -0.04, d: AGARRA }, entrada],
      [T.separa, T.separa + 0.55, { x: 576, y: 286, ang: 0.04, d: AGARRA }]
    ];
    const l = pista(PL, t);
    l.y += sh;
    const jar = { x: l.x, y: l.y, ang: l.ang, oleaje: -chapoteo(t, T.tin), lado: -1, vol: volJ(t), esp: espJ(t), restos: restosJ(t), t };
    p.miJarra = jar;
    p.manoLejos = manoRig(R, p, l, "lejos", R.BOLSILLO_L, -1, g => conCamara(g, () => dibJarra(g, jar)));
    const PC = [
      [0, 0, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1 }],
      [T.risa0 + 0.1, T.risa0 + 0.4, () => Object.assign(aP(BARRIGA_R), { ang: 0, d: ABIERTA, bol: 0, mo: 0.9 })],
      [T.risa1 - 0.25, T.risa1 + 0.15, { x: 600, y: 330, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    ];
    let c = pista(PC, t);
    if (t > T.risa0 + 0.4 && t < T.risa1 - 0.25) c = Object.assign({}, c, aP({ x: BARRIGA_R.x, y: BARRIGA_R.y + 10 * Math.sin((t - T.risa0) * 21 + 0.9) }), { bol: 0 });
    p.manoCerca = manoRig(R, p, c, "cerca", R.BOLSILLO_C, -1, null);
  }

  /* =====================================================================================
   * TRANSFORMACIONES: retrato / hoja → pantalla (matriz afín por tres puntos)
   * ===================================================================================== */
  function afin(f) {
    const O = f({ x: 800, y: 600 }), X = f({ x: 900, y: 600 }), Y = f({ x: 800, y: 700 });
    const a = (X.x - O.x) / 100, b = (X.y - O.y) / 100, c = (Y.x - O.x) / 100, d = (Y.y - O.y) / 100;
    return new DOMMatrix([a, b, c, d, O.x - a * 800 - c * 600, O.y - b * 800 - d * 600]);
  }
  const afinRetrato = (rig, p) => afin(q => rig.aPantalla(p, rig.cabeza(p).a(q)));
  const afinHoja = (rig, p) => afin(q => rig.aPantalla(p, rig.tronco(p)(q)));
  function en(g, M, f) { g.save(); g.transform(M.a, M.b, M.c, M.d, M.e, M.f); f(); g.restore(); }

  /* =====================================================================================
   * ESPUMA SOBRE LOS DOS (capa aparte, como la harina de 00100)
   * ===================================================================================== */
  const BOCA = {
    g: { c: { x: 803, y: 732 }, ang: 0.26, k: 1.5 },
    r: { c: { x: 822, y: 610 }, ang: 0.26, k: 1.8 }
  };
  const OJOS = {
    g: [{ c: { x: 771, y: 563 }, rx: 38, ry: 27 }, { c: { x: 894, y: 617 }, rx: 30, ry: 23 }],
    r: [{ c: { x: 771, y: 446 }, rx: 44, ry: 23 }, { c: { x: 926, y: 487 }, rx: 32, ry: 19 }]
  };
  let CAPA = null, FL = null, BURB = null;
  function creaBurbujas() {
    const c = document.createElement("canvas"); c.width = c.height = 80; const g = c.getContext("2d");
    for (let i = 0; i < 70; i++) {
      const x = 80 * hash(i * 2.1), y = 80 * hash(i * 3.3), r = 0.8 + 2.2 * hash(i * 4.9);
      g.strokeStyle = hash(i * 1.37) < 0.55 ? "rgba(150,128,96,0.55)" : "rgba(255,255,255,0.95)"; g.lineWidth = 0.7;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
    }
    return c;
  }
  const lienzoComo = (w, h, o) => { if (!o || o.width !== w || o.height !== h) { o = document.createElement("canvas"); o.width = w; o.height = h; } return o; };
  const RF = 0.5;
  // huecos limpios en la capa de espuma: ojos (desde el parpadeo) y boca (desde la risa; tras relamerse, el labio)
  function huecos(f, base, rig, p, quien, ojo, boca, labio) {
    const M = base.multiply(afinRetrato(rig, p));
    f.setTransform(M);
    f.beginPath();
    if (ojo > 0.01) for (const o of OJOS[quien]) { f.moveTo(o.c.x + o.rx * ojo, o.c.y); f.ellipse(o.c.x, o.c.y, o.rx * ojo, o.ry * ojo, 0.2, 0, TAU); }
    const B = BOCA[quien];
    if (boca > 0.01) {
      f.save(); f.translate(B.c.x, B.c.y); f.rotate(B.ang); f.scale(B.k, B.k);
      f.moveTo(48 * boca, 4); f.ellipse(0, 4, 48 * boca, 26 * boca, 0, 0, TAU);
      if (labio > 0.01) { f.moveTo(58, -16); f.ellipse(0, -16, 58, 16 * labio, 0, 0, TAU); }
      f.restore();
    }
    f.fill();
  }
  function dibujaPersonajes(g, t, pG, pR, k) {
    if (k <= 0.001) { R.dibujar(g, pR, t); G.dibujar(g, pG, t); return; }
    const c = g.canvas; CAPA = lienzoComo(c.width, c.height, CAPA);
    FL = lienzoComo(Math.ceil(c.width * RF), Math.ceil(c.height * RF), FL);
    const o = CAPA.getContext("2d"), f = FL.getContext("2d"), Mt = g.getTransform();
    const A = Mt.transformPoint(new DOMPoint(XG - 190, 60)), B = Mt.transformPoint(new DOMPoint(XR + 190, 600));
    const x0 = clamp(Math.floor(Math.min(A.x, B.x)), 0, c.width), x1 = clamp(Math.ceil(Math.max(A.x, B.x)), 0, c.width);
    const y0 = clamp(Math.floor(Math.min(A.y, B.y)), 0, c.height), y1 = clamp(Math.ceil(Math.max(A.y, B.y)), 0, c.height);
    if (x1 <= x0 || y1 <= y0) return;
    const w = x1 - x0, h = y1 - y0;
    // 1) los dos, en su capa
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, CAPA.width, CAPA.height);
    o.setTransform(Mt);
    R.dibujar(o, pR, t); G.dibujar(o, pG, t);
    // 2) su silueta, crema y con burbujitas (mucha arriba, poca abajo), a media resolución
    const fx0 = Math.floor(x0 * RF), fy0 = Math.floor(y0 * RF), fw = Math.ceil(w * RF) + 1, fh = Math.ceil(h * RF) + 1;
    f.setTransform(1, 0, 0, 1, 0, 0); f.globalAlpha = 1; f.globalCompositeOperation = "source-over"; f.clearRect(0, 0, FL.width, FL.height);
    f.drawImage(CAPA, fx0 / RF, fy0 / RF, fw / RF, fh / RF, fx0, fy0, fw, fh);
    f.globalCompositeOperation = "source-in";
    const yP = y => Mt.transformPoint(new DOMPoint(0, y)).y * RF;
    const baja = 12 * tramo(t, T.choca + 0.6, T.choca + 6);            // la espuma va escurriendo hacia abajo
    const ya = yP(150), yb = yP(560), st = y => clamp((y - 150) / 410);
    const gr = f.createLinearGradient(0, ya, 0, yb);
    for (const [y, a] of [[150, 0.8], [198, 0.6], [232 + baja, 0.38], [262 + baja, 0.3], [290 + baja, 0.24], [318 + baja, 0.1], [352 + baja, 0.04], [420, 0.02], [560, 0.01]]) gr.addColorStop(st(y), `rgba(255,250,236,${a})`);
    f.fillStyle = gr; f.fillRect(fx0, fy0, fw, fh);
    f.globalCompositeOperation = "source-atop";
    const base = new DOMMatrix().scale(RF, RF).multiply(Mt);
    f.setTransform(1, 0, 0, 1, 0, 0);
    if (!BURB) BURB = creaBurbujas();
    f.globalAlpha = 0.4; f.fillStyle = f.createPattern(BURB, "repeat"); f.fillRect(fx0, fy0, fw, fh);
    // 3) huecos: ojos y boca
    const ojoG = tramo(t, T.gParpa, T.gParpa + 0.12), ojoR = tramo(t, T.rParpa, T.rParpa + 0.12);
    const bocaG = tramo(t, T.gPff - 0.05, T.gPff + 0.2), bocaR = tramo(t, T.rPff - 0.05, T.rPff + 0.2);
    const labG = tramo(t, T.gLame0 + 0.1, T.gLame1 - 0.05), labR = tramo(t, T.rLame0 + 0.1, T.rLame1 - 0.05);
    f.globalAlpha = 1; f.globalCompositeOperation = "destination-out"; f.fillStyle = "#000";
    if (ojoG + bocaG > 0.01) huecos(f, base, G, pG, "g", ojoG, bocaG, labG);
    if (ojoR + bocaR > 0.01) huecos(f, base, R, pR, "r", ojoR, bocaR, labR);
    f.setTransform(1, 0, 0, 1, 0, 0);
    // 4) a la pantalla: los dos y, encima, la espuma en «screen» (aclara sin borrar las líneas)
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(CAPA, x0, y0, w, h, x0, y0, w, h);
    g.globalCompositeOperation = "saturation"; g.globalAlpha = 0.3 * k;
    g.drawImage(FL, fx0, fy0, fw, fh, fx0 / RF, fy0 / RF, fw / RF, fh / RF);
    g.globalCompositeOperation = "screen"; g.globalAlpha = 0.56 * k;
    g.drawImage(FL, fx0, fy0, fw, fh, fx0 / RF, fy0 / RF, fw / RF, fh / RF);
    g.restore();
  }

  /* ---------- espuma con volumen (encima de la capa) ---------- */
  // una sola masa de espuma hecha de bolas: contorno común, sombra abajo y brillos arriba
  function nube(g, L, lw) {
    let hay = false;
    g.beginPath();
    for (const [x, y, r] of L) if (r > 0.4) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); hay = true; }
    if (!hay) return;
    g.save(); g.lineJoin = "round";
    g.lineWidth = lw * 2; g.strokeStyle = "#8a6c4a"; g.stroke();
    g.fillStyle = "#fff2da"; g.fill();
    g.clip();
    g.fillStyle = "rgba(214,188,146,0.6)";
    for (const [x, y, r] of L) if (r > 0.4) { g.beginPath(); g.ellipse(x + r * 0.12, y + r * 0.64, r * 0.92, r * 0.5, 0, 0, TAU); g.fill(); }
    g.fillStyle = "#fffcf3";
    for (const [x, y, r] of L) if (r > 0.4) { g.beginPath(); g.ellipse(x - r * 0.16, y - r * 0.22, r * 0.62, r * 0.48, -0.3, 0, TAU); g.fill(); }
    g.fillStyle = "#ffffff";
    for (const [x, y, r] of L) if (r > 1.5) { g.beginPath(); g.arc(x - r * 0.38, y - r * 0.44, r * 0.15, 0, TAU); g.fill(); }
    g.restore();
  }
  // racimo: unas bolas alrededor de un centro (un pegote)
  function racimo(x, y, r, sem, k = 1, aplana = 1) {
    if (k <= 0.01 || r <= 0.3) return [];
    const L = [[x, y, r * 0.72 * k]], n = 4 + Math.floor(hash(sem) * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + hash(sem + i) * 0.8, d = r * (0.45 + 0.2 * hash(sem + i * 2.3));
      L.push([x + Math.cos(a) * d * k, y + Math.sin(a) * d * aplana * k, r * (0.38 + 0.22 * hash(sem + i * 4.1)) * k]);
    }
    return L;
  }
  // goterón: bolas cada vez más pequeñas hacia abajo y una gota al final
  function goteo(x, y, r, l, sem) {
    const L = []; if (l <= r * 0.3) return L;
    const n = Math.max(2, Math.ceil(l / (r * 0.4)));
    for (let i = 0; i <= n; i++) { const u = i / n; L.push([x + Math.sin(u * 3 + sem) * r * 0.15, y + l * u, r * lerp(1, 0.4, u)]); }
    L.push([x + Math.sin(3 + sem) * r * 0.15, y + l + r * 0.15, r * 0.6]);
    return L;
  }
  const escurre = (t, d) => salida(clamp((t - T.choca - 0.35) / d));

  // pelo: corona de espuma (retrato) y goterones; con la risa se escapan algunos pegotes
  const PELO_G = [[578, 432, 46], [612, 360, 56], [664, 304, 62], [730, 266, 66], [800, 240, 68], [870, 244, 66], [940, 266, 62],
    [1004, 304, 56], [1054, 352, 46], [700, 336, 50], [830, 306, 54], [960, 344, 46]];
  const PELO_R = [[530, 402, 44], [566, 322, 54], [626, 264, 60], [700, 228, 66], [780, 208, 68], [860, 208, 68], [940, 228, 64],
    [1010, 270, 58], [1060, 332, 50], [1080, 404, 40], [740, 282, 50], [900, 272, 52]];
  const GOTEA_PELO = { g: [[716, 362, 22, 74, 2], [1040, 360, 20, 52, 3]], r: [[536, 420, 22, 56, 4], [884, 300, 20, 64, 5]] };
  // cara: barbilla (Guillermo), barba entera (Rodri) y un pegote en el moflete
  const CARA_ESP = {
    g: [[762, 848, 34, 21], [818, 852, 36, 22], [862, 830, 28, 23], [676, 736, 34, 24]],
    r: [[640, 642, 34, 31], [690, 706, 42, 32], [760, 752, 48, 33], [840, 770, 50, 34], [916, 742, 44, 35], [966, 682, 36, 36], [690, 560, 30, 37]]
  };
  const GOTEA_CARA = { g: [[806, 878, 18, 40, 7]], r: [[800, 800, 22, 48, 8]] };
  // los que salen volando con la risa (índices de PELO_*)
  const VUELAN_PELO = [1, 4, 7, 10];
  const asientaPelo = t => 1 - 0.16 * tramo(t, T.choca + 0.5, T.choca + 5);
  const caePelo = (j, dr) => T.risa0 + 0.4 + dr + j * 0.42;
  function quedaPelo(t, i, dr) {
    const j = VUELAN_PELO.indexOf(i);
    return j < 0 || t < caePelo(j, dr) ? 1 : 0;
  }
  const sueltas = new Map();
  function sueltaPelo(quien, j) {
    const clave = quien + j;
    if (sueltas.has(clave)) return sueltas.get(clave);
    const esG = quien === "g", rig = esG ? G : R, tv = caePelo(j, esG ? 0 : 0.1);
    const p = (esG ? poseG : poseR)(tv), cabeza = rig.cabeza(p);
    const proyecta = (x,y) => rig.aPantalla(p, cabeza.a(P(x,y)));
    const i = VUELAN_PELO[j], [x,y,r] = (esG ? PELO_G : PELO_R)[i];
    const sem = i * 7 + (esG ? 0 : 50), k = asientaPelo(tv), baja = 8 * (1 - k) / 0.16;
    const escala = Math.hypot(proyecta(x+1,y).x-proyecta(x,y).x, proyecta(x+1,y).y-proyecta(x,y).y);
    const bolas = racimo(x, y+baja, r*k, sem).map(([cx,cy,radio]) => {
      const q = proyecta(cx,cy); return [q.x,q.y,radio*escala];
    });
    const pie = Math.max(...bolas.map(([cx,cy,radio]) => cy+radio)), plano = SUELO+6;
    const vx = (hash(sem+9)-0.5)*160 + (esG ? -70 : 70), vy = -150-80*hash(sem+7);
    const dur = (-vy + Math.sqrt(vy*vy + 2240*(plano-pie))) / 1120;
    const suelta = {tv, bolas, pie, plano, vx, vy, dur, trazo: 5*escala};
    sueltas.set(clave,suelta); return suelta;
  }
  function bolasVuelo(b,t) {
    const u = Math.min(t-b.tv,b.dur), aplasta = 1 - 0.64*tramo(t,b.tv+b.dur,b.tv+b.dur+0.09);
    const dy = b.vy*u + 560*u*u;
    return b.bolas.map(([x,y,r]) => [x+b.vx*u, b.pie+dy+(y-b.pie)*aplasta, r*aplasta]);
  }
  function voladores(g,t,quien) {
    VUELAN_PELO.forEach((_,j) => {
      if (t < caePelo(j,quien === "g" ? 0 : 0.1)) return;
      const b = sueltaPelo(quien,j);
      nube(g,bolasVuelo(b,t),b.trazo);
    });
  }
  // bigote de espuma en el labio de arriba (retrato); la lengua lo va barriendo
  const BIG = [[-52, -14, 14], [-34, -21, 17], [-13, -24, 18], [8, -24, 18], [28, -22, 17], [46, -17, 15], [58, -10, 11]];
  function bigote(g, t, quien, k, lame0, lame1) {
    const B = BOCA[quien];
    g.save(); g.translate(B.c.x, B.c.y); g.rotate(B.ang); g.scale(B.k, B.k);
    const punta = lenguaX(t, lame0, lame1), hecho = t > lame1;
    const quedan = x => hecho ? 0 : punta == null ? 1 : 1 - clamp((punta - x + 8) / 14);
    const L = BIG.map(([x, y, r]) => [x, y, r * k * quedan(x)]);
    nube(g, L, 3.2);
    g.restore();
  }
  // la lengua barre el labio de izquierda a derecha (x de la punta, en el sistema de la boca)
  function lenguaX(t, a, b) {
    if (t < a || t > b) return null;
    return lerp(-60, 64, suave(clamp(fase(t, a, b) * 1.1)));
  }
  function lengua(g, t, quien, a, b) {
    const sale = dentro(t, a - 0.12, a, b - 0.05, b + 0.1);
    if (sale <= 0.01) return;
    const B = BOCA[quien], x = lenguaX(t, a, b) ?? (t < a ? -60 : 64);
    g.save(); g.translate(B.c.x, B.c.y); g.rotate(B.ang); g.scale(B.k, B.k); g.lineJoin = "round"; g.lineCap = "round";
    // sale de la boca, se dobla hacia arriba y la punta lame el labio de arriba
    const tip = { x: x * sale, y: lerp(4, -21, sale) }, base = { x: x * 0.28 * sale, y: 9 };
    const dx = tip.x - base.x, dy = tip.y - base.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, an = 17, ab = 12;
    const ap = Math.atan2(ny, nx), c = { x: (base.x + tip.x) / 2 + dx * 0.05, y: (base.y + tip.y) / 2 };
    const forma = () => { g.beginPath(); g.moveTo(base.x + nx * ab, base.y + ny * ab);
      g.quadraticCurveTo(c.x + nx * (an + 4), c.y + ny * (an + 4), tip.x + nx * an, tip.y + ny * an);
      g.arc(tip.x, tip.y, an, ap, ap + Math.PI, true);
      g.quadraticCurveTo(c.x - nx * (an + 4), c.y - ny * (an + 4), base.x - nx * ab, base.y - ny * ab);
      g.arc(base.x, base.y, ab, ap + Math.PI, ap, true); g.closePath(); };
    forma(); g.lineWidth = 8; g.strokeStyle = "#4a1216"; g.stroke(); g.fillStyle = "#ee6e7a"; g.fill();
    // surco del centro y brillo de la punta
    g.strokeStyle = "rgba(176,44,62,0.85)"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(base.x, base.y); g.quadraticCurveTo(c.x, c.y, lerp(base.x, tip.x, 0.78), lerp(base.y, tip.y, 0.78)); g.stroke();
    g.fillStyle = "rgba(255,210,216,0.9)"; g.beginPath(); g.ellipse(tip.x - nx * 6 - dx / L * 4, tip.y - ny * 6 - dy / L * 4, 6, 3.6, Math.atan2(dy, dx), 0, TAU); g.fill();
    // un poco de espuma en la punta
    if (punta(t, a, b)) nube(g, [[tip.x + 3, tip.y - 13, 7], [tip.x - 6, tip.y - 15, 5.5]], 2.4);
    g.restore();
  }
  const punta = (t, a, b) => t > a + 0.08 && t < b - 0.05;
  // lágrimas de risa (retrato)
  function lagrimas(g, t, quien, t0) {
    const lr = risaK(t, t0 + 0.3);
    if (lr <= 0.01) return;
    const L = quien === "g" ? [[742, 590, 0, -1], [925, 640, 0.5, 1]] : [[728, 452, 0, -1], [975, 492, 0.45, 1]];
    g.save(); g.globalAlpha = lr; g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 4;
    for (const [x, y, f, dx] of L) {
      const ph = ((t - t0) * 2.2 + f) % 1, xx = x + dx * ph * 60, yy = y - 30 * Math.sin(Math.PI * ph) + ph * 30, s = 12 * (1 - 0.3 * ph);
      g.beginPath(); g.moveTo(xx, yy - s * 1.5); g.quadraticCurveTo(xx + s, yy, xx, yy + s); g.quadraticCurveTo(xx - s, yy, xx, yy - s * 1.5); g.fill(); g.stroke();
    }
    g.restore();
  }
  // la gota de espuma que le cuelga a Guillermo de la nariz (crece, se estira y cae)
  const NARIZ_G = { x: 856, y: 664 };
  let desprendimientoNariz;
  function salidaNariz() {
    if (desprendimientoNariz) return desprendimientoNariz;
    const p = poseG(T.gotaNariz), cabeza = G.cabeza(p), [x,y,r] = goteo(NARIZ_G.x,NARIZ_G.y,19,88,2).at(-1);
    const a = G.aPantalla(p,cabeza.a(P(x,y))), b = G.aPantalla(p,cabeza.a(P(x+r,y)));
    const radio = Math.hypot(a.x-b.x,a.y-b.y), dur = Math.sqrt((SUELO+4-radio-a.y)/620);
    return desprendimientoNariz = {x:a.x,y:a.y,r:radio,dur};
  }
  function estadoNariz(t) {
    const b = salidaNariz(), v = Math.min(Math.max(0,t-T.gotaNariz),b.dur);
    const apl = 1-0.6*tramo(t,T.gotaNariz+b.dur,T.gotaNariz+b.dur+0.08);
    const r = b.r*apl;
    return [b.x, b.y+620*v*v+b.r-r, r];
  }
  function gotaNariz(g,t,pG) {
    const t0 = T.choca+0.9;
    if (t < t0) return;
    const u = fase(t,t0,T.gotaNariz), recoge = 1-tramo(t,T.gotaNariz,T.gotaNariz+0.13);
    if (recoge > 0) {
      const L = goteo(NARIZ_G.x,NARIZ_G.y,(15+4*u)*recoge,(18+70*entrada(u))*recoge,2);
      if (t >= T.gotaNariz) L.pop();
      en(g,afinRetrato(G,pG),() => nube(g,L,3.5*recoge));
    }
    if (t >= T.gotaNariz) nube(g,[estadoNariz(t)],0.65);
  }
  // espuma de los hombros y goterones por el pecho (hoja)
  function hombros(g, t, rig, k, asienta, sem0) {
    const a = { x: rig.HOMBRO_C.x + 16, y: rig.HOMBRO_C.y - 46 }, n = { x: rig.CUELLO.x, y: rig.CUELLO.y + 44 }, b = { x: rig.HOMBRO.x - 10, y: rig.HOMBRO.y - 44 };
    const m = (p, q, u) => ({ x: lerp(p.x, q.x, u), y: lerp(p.y, q.y, u) - 10 });
    const L = [];
    [[a, 52], [m(a, n, 0.5), 44], [n, 48], [m(n, b, 0.5), 42], [b, 50]].forEach(([q, r], i) => { for (const c of racimo(q.x, q.y, r * asienta, sem0 + i * 3, k)) L.push(c); });
    const e = escurre(t, 4.5) * k;
    for (const [q, dx, dy, r, l, s] of [[a, 10, 24, 19, 62, 1], [n, -10, 34, 21, 96, 2], [b, 4, 28, 18, 54, 4]])
      for (const c of goteo(q.x + dx, q.y + dy, r, l * e, s + sem0)) L.push(c);
    nube(g, L, 4);
  }
  // todo lo que va encima de la capa de espuma
  function espumaEncima(g, t, rig, p, quien, k, dr) {
    if (k <= 0.01) return;
    const lame0 = quien === "g" ? T.gLame0 : T.rLame0, lame1 = quien === "g" ? T.gLame1 : T.rLame1;
    const asienta = asientaPelo(t);          // la espuma se va asentando
    const baja = 8 * (1 - asienta) / 0.16;
    en(g, afinHoja(rig, p), () => hombros(g, t, rig, k, asienta, quien === "g" ? 100 : 200));
    en(g, afinRetrato(rig, p), () => {
      const L = [], e = escurre(t, 3.5) * k;
      (quien === "g" ? PELO_G : PELO_R).forEach(([x, y, r], i) => { const q = quedaPelo(t, i, dr); if (q > 0.01) for (const c of racimo(x, y + baja, r * asienta, i * 7 + (quien === "g" ? 0 : 50), k * q)) L.push(c); });
      for (const [x, y, r, l, s] of GOTEA_PELO[quien]) for (const c of goteo(x, y + baja, r, l * e, s)) L.push(c);
      CARA_ESP[quien].forEach(([x, y, r, s]) => { for (const c of racimo(x, y + baja, r * asienta, s, k)) L.push(c); });
      for (const [x, y, r, l, s] of GOTEA_CARA[quien]) for (const c of goteo(x, y + baja, r, l * e, s)) L.push(c);
      nube(g, L, 5);
      bigote(g, t, quien, k, lame0, lame1);
      lengua(g, t, quien, lame0, lame1);
      lagrimas(g, t, quien, T.risa0 + dr);
    });
  }

  /* =====================================================================================
   * DECORADO: la cervecería
   * ===================================================================================== */
  const ZOCALO = 362, SUELO_PARED = 470;
  const LAMPS = [{ x: 286, y: 118 }, { x: 748, y: 118 }];
  const CUCO = { x: 517, y: 104 };
  let fondo = null, M0 = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // pared encalada, cálida por las lámparas
    const gp = g.createLinearGradient(0, -50, 0, ZOCALO); gp.addColorStop(0, "#b39a72"); gp.addColorStop(0.5, "#d5bf96"); gp.addColorStop(1, "#c4a97c");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, ZOCALO + 50);
    for (let i = 0; i < 260; i++) { g.fillStyle = hash(i * 1.3) < 0.5 ? "rgba(120,96,60,0.08)" : "rgba(255,245,220,0.12)"; g.beginPath(); g.arc(-60 + (W + 120) * hash(i * 2.7), -50 + (ZOCALO + 50) * hash(i * 3.9), 2 + 6 * hash(i * 5.1), 0, TAU); g.fill(); }
    for (const l of LAMPS) { const hl = g.createRadialGradient(l.x, l.y + 30, 10, l.x, l.y + 30, 260); hl.addColorStop(0, "rgba(255,214,140,0.35)"); hl.addColorStop(1, "rgba(255,214,140,0)"); g.fillStyle = hl; g.fillRect(l.x - 260, l.y - 230, 520, 520); }
    // vigas y postes
    const madera = (x, y, w, h) => { g.fillStyle = "#4a2c16"; g.fillRect(x, y, w, h); g.fillStyle = "rgba(255,210,160,0.12)"; g.fillRect(x, y, w, 3);
      g.strokeStyle = "rgba(20,10,4,0.35)"; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + 2, y + h * i / 4); g.lineTo(x + w - 2, y + h * i / 4 + (w > h ? 0 : 0)); g.stroke(); }
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x, y, w, h); };
    madera(-60, 6, W + 120, 26);
    for (const x of [26, 236, 776, 976]) madera(x, 32, 22, ZOCALO - 32);
    for (const [x0, x1] of [[48, 120], [236, 164], [776, 848], [998, 926]]) {
      g.save(); g.strokeStyle = TINTA; g.lineWidth = 18; g.beginPath(); g.moveTo(x0 + (x1 > x0 ? 0 : 22), 32); g.lineTo(x1, 104); g.stroke();
      g.strokeStyle = "#4a2c16"; g.lineWidth = 14; g.beginPath(); g.moveTo(x0 + (x1 > x0 ? 0 : 22), 32); g.lineTo(x1, 104); g.stroke(); g.restore();
    }
    ventana(g, 136, 212, false); ventana(g, 887, 212, true);
    // zócalo de madera con cuarterones
    g.fillStyle = "#4a2414"; g.fillRect(-60, ZOCALO, W + 120, SUELO_PARED - ZOCALO);
    g.fillStyle = "#6a3820"; g.fillRect(-60, ZOCALO - 7, W + 120, 11); g.fillStyle = "rgba(255,210,170,0.25)"; g.fillRect(-60, ZOCALO - 7, W + 120, 2);
    for (let x = -40; x < W + 60; x += 92) {
      g.fillStyle = "#3d1d10"; g.fillRect(x + 8, ZOCALO + 16, 76, SUELO_PARED - ZOCALO - 30);
      g.strokeStyle = "rgba(255,200,160,0.14)"; g.lineWidth = 2; g.strokeRect(x + 12, ZOCALO + 20, 68, SUELO_PARED - ZOCALO - 38);
    }
    g.fillStyle = "#1f0d08"; g.fillRect(-60, SUELO_PARED - 10, W + 120, 10);
    // suelo de tablones
    const gs = g.createLinearGradient(0, SUELO_PARED, 0, H + 50); gs.addColorStop(0, "#5a3418"); gs.addColorStop(1, "#8a5630");
    g.fillStyle = gs; g.fillRect(-60, SUELO_PARED, W + 120, H + 50 - SUELO_PARED);
    let y = SUELO_PARED, dy = 9;
    while (y < H + 50) {
      g.fillStyle = "rgba(30,14,4,0.55)"; g.fillRect(-60, y, W + 120, 1.6);
      const off = 160 * hash(y * 0.37);
      for (let x = -60 + off; x < W + 60; x += 260 + 60 * hash(x + y)) { g.fillRect(x, y, 1.6, dy); }
      g.fillStyle = "rgba(255,210,160,0.06)"; g.fillRect(-60, y + 2, W + 120, 2);
      y += dy; dy *= 1.16;
    }
    const rf = g.createRadialGradient(517, 540, 10, 517, 540, 320); rf.addColorStop(0, "rgba(255,200,120,0.22)"); rf.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = rf; g.fillRect(150, SUELO_PARED, 740, 200);
    mesa(g);
    barril(g, 946, SUELO_PARED + 30);
    banco(g);
    // viñeta
    const vg = g.createRadialGradient(517, 300, 270, 517, 300, 770); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = vg; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  function ventana(g, cx, cy, luna) {
    const w = 120, h = 168, x0 = cx - w / 2, y0 = cy - h / 2;
    const arco = () => { g.beginPath(); g.moveTo(x0, y0 + h); g.lineTo(x0, y0 + w / 2); g.arc(cx, y0 + w / 2, w / 2, Math.PI, 0); g.lineTo(x0 + w, y0 + h); g.closePath(); };
    g.save();
    g.fillStyle = "#3a2010"; g.beginPath(); g.moveTo(x0 - 10, y0 + h + 6); g.lineTo(x0 - 10, y0 + w / 2); g.arc(cx, y0 + w / 2, w / 2 + 10, Math.PI, 0); g.lineTo(x0 + w + 10, y0 + h + 6); g.closePath(); g.fill();
    arco(); const gc = g.createLinearGradient(0, y0, 0, y0 + h); gc.addColorStop(0, "#0e1838"); gc.addColorStop(1, "#24356a"); g.fillStyle = gc; g.fill();
    g.save(); arco(); g.clip();
    for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(255,250,220,${0.4 + 0.5 * hash(i + cx)})`; g.beginPath(); g.arc(x0 + w * hash(i * 2.3 + cx), y0 + h * 0.7 * hash(i * 4.1 + cx), 0.8 + 1.1 * hash(i + 3), 0, TAU); g.fill(); }
    if (luna) { g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(cx + 22, y0 + 50, 16, 0, TAU); g.fill(); g.fillStyle = "#14204a"; g.beginPath(); g.arc(cx + 30, y0 + 44, 14, 0, TAU); g.fill(); }
    // tejados y torre del pueblo
    g.fillStyle = "#0a1022"; g.beginPath(); g.moveTo(x0, y0 + h); g.lineTo(x0, y0 + h - 36); g.lineTo(x0 + 24, y0 + h - 52); g.lineTo(x0 + 48, y0 + h - 38); g.lineTo(x0 + 58, y0 + h - 70); g.lineTo(x0 + 66, y0 + h - 40); g.lineTo(x0 + 92, y0 + h - 56); g.lineTo(x0 + w, y0 + h - 34); g.lineTo(x0 + w, y0 + h); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,200,110,0.85)"; for (const [x, yy] of [[18, 26], [40, 22], [80, 30], [100, 24]]) g.fillRect(x0 + x, y0 + h - yy, 4, 5);
    // emplomado en rombos
    g.strokeStyle = "rgba(20,14,10,0.7)"; g.lineWidth = 1.4;
    for (let k = -8; k < 12; k++) { g.beginPath(); g.moveTo(x0 + k * 24, y0); g.lineTo(x0 + k * 24 + h, y0 + h); g.stroke(); g.beginPath(); g.moveTo(x0 + k * 24, y0); g.lineTo(x0 + k * 24 - h, y0 + h); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(x0, y0, w * 0.4, h);
    g.restore();
    arco(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#6a3c1c"; g.fillRect(x0 - 14, y0 + h, w + 28, 12); g.strokeRect(x0 - 14, y0 + h, w + 28, 12);
    g.fillStyle = "rgba(255,220,170,0.25)"; g.fillRect(x0 - 14, y0 + h, w + 28, 3);
    // geranios en el alféizar
    for (const [x, col] of [[cx - 34, "#d8384a"], [cx, "#e8506a"], [cx + 34, "#d8384a"]]) {
      g.fillStyle = "#8a4428"; g.fillRect(x - 10, y0 + h - 16, 20, 16); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(x - 10, y0 + h - 16, 20, 16);
      for (let i = 0; i < 5; i++) { g.fillStyle = i < 2 ? "#3e7a3a" : col; g.beginPath(); g.arc(x - 9 + 18 * hash(x + i), y0 + h - 22 - 10 * hash(x + i * 3), i < 2 ? 6 : 4.5, 0, TAU); g.fill(); }
    }
    g.restore();
  }
  // mesa larga de madera (detrás de los dos), con jarras, un pretzel y una vela
  function mesa(g) {
    const m = MESA;
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(m.x0 + 10, SUELO_PARED + 2, m.x1 - m.x0 - 20, 10);
    // patas en caballete
    for (const x of [m.x0 + 40, m.x1 - 40]) {
      g.fillStyle = "#4a2810"; g.beginPath(); g.moveTo(x - 6, m.y + 20); g.lineTo(x + 6, m.y + 20); g.lineTo(x + 26, SUELO_PARED + 6); g.lineTo(x - 26, SUELO_PARED + 6); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    }
    g.fillStyle = "#5a3214"; g.fillRect(m.x0 + 40, SUELO_PARED - 18, m.x1 - m.x0 - 80, 8); g.strokeRect(m.x0 + 40, SUELO_PARED - 18, m.x1 - m.x0 - 80, 8);
    // tablero
    g.fillStyle = "#a06a38"; g.fillRect(m.x0, m.y - 8, m.x1 - m.x0, 10);
    g.fillStyle = "#7a4a22"; g.fillRect(m.x0, m.y + 2, m.x1 - m.x0, 18);
    g.strokeStyle = "rgba(40,20,6,0.5)"; g.lineWidth = 1; for (let x = m.x0 + 60; x < m.x1; x += 110) { g.beginPath(); g.moveTo(x, m.y - 8); g.lineTo(x, m.y + 2); g.stroke(); }
    g.fillStyle = "rgba(255,225,170,0.3)"; g.fillRect(m.x0, m.y - 8, m.x1 - m.x0, 2);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(m.x0, m.y - 8, m.x1 - m.x0, 28);
    // cosas encima
    jarraFondo(g, 286, m.y - 8, 0.7); jarraFondo(g, 760, m.y - 8, 0.4);
    pretzel(g, 336, m.y - 14);
    // plato con rábanos
    g.fillStyle = "#e8e2d4"; g.beginPath(); g.ellipse(700, m.y - 9, 26, 5, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    for (const x of [688, 700, 712]) { g.fillStyle = "#e85068"; g.beginPath(); g.arc(x, m.y - 14, 5, 0, TAU); g.fill(); g.stroke(); }
    // portavelas (la llama se dibuja aparte)
    g.fillStyle = "#b8893a"; g.fillRect(VELA.x - 9, m.y - 12, 18, 4); g.strokeRect(VELA.x - 9, m.y - 12, 18, 4);
    g.fillStyle = "#f3e7c9"; g.fillRect(VELA.x - 4, m.y - 34, 8, 22); g.strokeRect(VELA.x - 4, m.y - 34, 8, 22);
  }
  const VELA = { x: 620, y: MESA.y - 34 };
  function jarraFondo(g, x, base, vol) {
    g.save(); g.translate(x, base); g.lineJoin = "round";
    const w = 22, h = 32;
    g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2, -h + 7); g.bezierCurveTo(w / 2 + 11, -h + 7, w / 2 + 11, -8, w / 2, -8); g.stroke();
    g.strokeStyle = "#c8dde2"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "rgba(214,234,238,0.45)"; g.fillRect(-w / 2, -h, w, h);
    g.fillStyle = "#e09a22"; g.fillRect(-w / 2 + 2, -h * vol - 4, w - 4, h * vol);
    g.fillStyle = "#fff4dc"; g.fillRect(-w / 2 + 2, -h * vol - 8, w - 4, 4);
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(-w / 2, -h, w, h);
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-w / 2 + 3, -h + 3); g.lineTo(-w / 2 + 3, -5); g.stroke();
    g.restore();
  }
  function pretzel(g, x, y) {
    g.save(); g.translate(x, y); g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(-14, 4); g.bezierCurveTo(-20, -12, -2, -14, 0, -2); g.bezierCurveTo(2, -14, 20, -12, 14, 4); g.bezierCurveTo(8, 12, -8, 12, -14, 4); g.moveTo(-8, 8); g.lineTo(8, -4); g.moveTo(8, 8); g.lineTo(-8, -4); };
    forma(); g.strokeStyle = TINTA; g.lineWidth = 7.5; g.stroke(); forma(); g.strokeStyle = "#9a5a22"; g.lineWidth = 5; g.stroke();
    g.fillStyle = "#fff"; for (let i = 0; i < 7; i++) g.fillRect(-12 + 24 * hash(i + 2), -8 + 14 * hash(i + 5), 1.6, 1.6);
    g.restore();
  }
  function barril(g, x, base) {
    // soporte
    g.fillStyle = "#3a200e"; g.fillRect(x - 56, base - 24, 112, 24); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 56, base - 24, 112, 24);
    // barril tumbado (de frente: tapa redonda)
    const cy = base - 74;
    g.fillStyle = "#7a4a24"; g.beginPath(); g.ellipse(x, cy, 54, 54, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#9a6234"; g.beginPath(); g.ellipse(x, cy, 42, 42, 0, 0, TAU); g.fill(); g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = "rgba(40,20,6,0.45)"; g.lineWidth = 1; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(x + i * 12, cy - Math.sqrt(1764 - i * i * 144)); g.lineTo(x + i * 12, cy + Math.sqrt(1764 - i * i * 144)); g.stroke(); }
    g.strokeStyle = "#2b2622"; g.lineWidth = 6; g.beginPath(); g.ellipse(x, cy, 49, 49, 0, 0, TAU); g.stroke();
    // grifo de latón: brida, caño curvo hacia abajo y palanca inclinada
    g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 2, cy + 6); g.quadraticCurveTo(x + 20, cy + 8, x + 18, cy + 26); g.stroke();
    g.strokeStyle = "#c9973e"; g.lineWidth = 3.4; g.stroke();
    g.fillStyle = "#c9973e"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(x + 18, cy + 27, 4, 2.2, 0, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 4.5; g.beginPath(); g.moveTo(x + 4, cy + 2); g.lineTo(x - 10, cy - 18); g.stroke();
    g.strokeStyle = "#7a4a24"; g.lineWidth = 2.4; g.stroke();
    g.fillStyle = "#3a200e"; g.beginPath(); g.ellipse(x - 11, cy - 20, 4, 5.5, -0.6, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#c9973e"; g.beginPath(); g.arc(x + 3, cy + 4, 7, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,240,200,0.7)"; g.beginPath(); g.arc(x + 1, cy + 2, 2.4, 0, TAU); g.fill();
  }
  function banco(g) {
    const y = SUELO_PARED + 40;
    g.fillStyle = "#6a3c1c"; g.fillRect(-60, y - 30, 210, 12); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-60, y - 30, 210, 12);
    g.fillStyle = "rgba(255,220,170,0.25)"; g.fillRect(-60, y - 30, 210, 3);
    for (const x of [-20, 120]) { g.fillStyle = "#4a2810"; g.fillRect(x, y - 18, 14, 56); g.strokeRect(x, y - 18, 14, 56); }
  }

  /* ---------- lo animado del decorado ---------- */
  // la onda del reventón: cuánto le llega a un punto
  function sacudida(t, x, y, f) {
    const d = Math.hypot(x - 517, y - 232), t0 = T.choca + d / 1400;
    return t > t0 ? (f || 1) * Math.exp(-(t - t0) * 2.6) * Math.sin((t - t0) * 13) : 0;
  }
  function lampara(g, t, l) {
    const a = 0.025 * Math.sin(t * 1.3 + l.x) + 0.16 * sacudida(t, l.x, l.y, 1);
    g.save(); g.translate(l.x, 32); g.rotate(a);
    const L = l.y - 32;
    g.strokeStyle = "#1a120c"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L - 16); g.stroke();
    // corona de hierro con velitas
    g.strokeStyle = "#1a120c"; g.lineWidth = 3.5; g.beginPath(); g.ellipse(0, L, 40, 8, 0, 0, TAU); g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, L - 16); g.lineTo(s * 38, L - 1); g.stroke(); }
    for (const dx of [-30, -10, 10, 30]) {
      const yy = L + (Math.abs(dx) > 20 ? -2 : 6);
      g.fillStyle = "#f3e7c9"; g.fillRect(dx - 3, yy - 14, 6, 14); g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(dx - 3, yy - 14, 6, 14);
      const fl = 1 + 0.15 * Math.sin(t * 13 + dx);
      g.fillStyle = "rgba(255,190,90,0.35)"; g.beginPath(); g.arc(dx, yy - 18, 9 * fl, 0, TAU); g.fill();
      g.fillStyle = "#ffd36a"; g.beginPath(); g.ellipse(dx, yy - 18, 2.6, 5 * fl, 0, 0, TAU); g.fill();
    }
    g.restore();
  }
  // banderines (dos tramos colgando)
  function banderines(g, t) {
    const tramos = [[{ x: -40, y: 40 }, { x: 517, y: 46 }], [{ x: 517, y: 46 }, { x: 1070, y: 40 }]];
    for (const [a, b] of tramos) {
      const n = 14, comba = 46;
      const pto = u => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) + comba * 4 * u * (1 - u) });
      g.strokeStyle = "#2a1a10"; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i <= 24; i++) { const q = pto(i / 24); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); } g.stroke();
      for (let i = 0; i < n; i++) {
        const u0 = (i + 0.15) / n, u1 = (i + 0.85) / n, q0 = pto(u0), q1 = pto(u1), m = { x: (q0.x + q1.x) / 2, y: (q0.y + q1.y) / 2 };
        const fl = 0.08 * Math.sin(t * 2.2 + i * 0.9) + 0.5 * sacudida(t, m.x, m.y, 1);
        const pun = { x: m.x + Math.sin(fl) * 26, y: m.y + Math.cos(fl) * 26 };
        g.fillStyle = (i % 2) ? "#f2efe6" : "#2a5aa8";
        g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y); g.lineTo(pun.x, pun.y); g.closePath(); g.fill(); g.strokeStyle = "rgba(20,14,10,0.7)"; g.lineWidth = 1; g.stroke();
        if (!(i % 2)) { g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.moveTo(lerp(q0.x, pun.x, 0.3), lerp(q0.y, pun.y, 0.3)); g.lineTo(lerp(q1.x, pun.x, 0.3), lerp(q1.y, pun.y, 0.3)); g.lineTo(lerp(m.x, pun.x, 0.65), lerp(m.y, pun.y, 0.65)); g.closePath(); g.fill(); }
      }
    }
  }
  // reloj de cuco (sin números): el péndulo se mueve y el cuco sale del susto
  function cuco(g, t) {
    const c = CUCO;
    g.save(); g.translate(c.x, c.y); g.lineJoin = "round";
    const tb = 0.06 * sacudida(t, c.x, c.y, 1);
    g.rotate(tb);
    // péndulo y piñas
    const a = 0.32 * Math.sin(t * 3.4);
    g.save(); g.translate(0, 26); g.rotate(a); g.strokeStyle = "#b8893a"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 46); g.stroke();
    g.fillStyle = "#c9973e"; g.beginPath(); g.arc(0, 50, 7, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke(); g.restore();
    for (const [dx, l] of [[-12, 58], [12, 50]]) { g.strokeStyle = "#2a1a10"; g.lineWidth = 1; g.beginPath(); g.moveTo(dx, 24); g.lineTo(dx, 24 + l); g.stroke();
      g.fillStyle = "#5a3418"; g.beginPath(); g.ellipse(dx, 30 + l, 4, 8, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.stroke(); }
    // casita
    g.fillStyle = "#6a3c1c"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.rect(-26, -20, 52, 46); g.fill(); g.stroke();
    g.fillStyle = "#3a200e"; g.beginPath(); g.moveTo(-36, -18); g.lineTo(0, -46); g.lineTo(36, -18); g.lineTo(30, -14); g.lineTo(0, -38); g.lineTo(-30, -14); g.closePath(); g.fill(); g.stroke();
    // hojitas talladas
    g.fillStyle = "#4e6a2a"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 22, 22, 9, 4, s * 0.5, 0, TAU); g.fill(); g.stroke(); }
    // esfera sin números: rayitas y agujas
    g.fillStyle = "#f3e2b8"; g.beginPath(); g.arc(0, 6, 13, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(an) * 10, 6 + Math.sin(an) * 10); g.lineTo(Math.cos(an) * 12, 6 + Math.sin(an) * 12); g.stroke(); }
    g.lineWidth = 2; g.beginPath(); g.moveTo(0, 6); g.lineTo(5, 0); g.stroke(); g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 6); g.lineTo(-2, -4); g.stroke();
    // puertecita y cuco
    const sale = dentro(t, T.choca + 0.12, T.choca + 0.25, T.choca + 0.9, T.choca + 1.1);
    g.fillStyle = "#1a0e06"; g.fillRect(-6, -16, 12, 10);
    if (sale > 0.01) {
      g.save(); g.translate(0, -11); g.translate(14 * sale, 0); g.scale(-1, 1);
      g.fillStyle = "#e8c43a"; g.beginPath(); g.ellipse(0, 0, 8, 6, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = "#e86a2a"; g.beginPath(); g.moveTo(-7, -1); g.lineTo(-13, 1 - 2 * Math.abs(Math.sin(t * 18))); g.lineTo(-7, 2); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(-3, -2, 2.6, 0, TAU); g.fill(); g.fillStyle = "#000"; g.beginPath(); g.arc(-3.5, -2, 1.2, 0, TAU); g.fill();
      g.restore();
      // la puerta abierta
      g.fillStyle = "#8a5428"; g.fillRect(6, -16, 3, 10);
    } else { g.fillStyle = "#8a5428"; g.fillRect(-6, -16, 12, 10); g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(-6, -16, 12, 10); }
    g.restore();
  }
  function llamaVela(g, t) {
    const fl = 1 + 0.12 * Math.sin(t * 11) + 0.6 * Math.max(0, sacudida(t, VELA.x, VELA.y, 1));
    const ang = 0.25 * sacudida(t, VELA.x, VELA.y, 1);
    g.save(); g.translate(VELA.x, VELA.y); g.rotate(ang);
    g.fillStyle = "rgba(255,190,90,0.3)"; g.beginPath(); g.arc(0, -8, 12, 0, TAU); g.fill();
    g.fillStyle = "#ffd36a"; g.beginPath(); g.ellipse(0, -8, 3, 7 * fl, 0, 0, TAU); g.fill();
    g.fillStyle = "#fff6d0"; g.beginPath(); g.ellipse(0, -6, 1.4, 3, 0, 0, TAU); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * EL REVENTÓN: nube de espuma, pegotes que vuelan y manchas que se quedan
   * ===================================================================================== */
  const puntoBrindis = (y,ang) => bordeJarra({x:manoToque(1,ang),y,ang,lado:1});
  const C_POF = puntoBrindis(236,0.03), C_TIN = puntoBrindis(252,0.04);
  const CABEZAS = [{ x: 404, y: 206 }, { x: 632, y: 206 }];
  // bolas de la nube (alrededor del choque): crecen del centro hacia fuera y luego se posan sobre los dos
  const NUBE = Array.from({ length: 40 }, (_, i) => {
    const a = hash(i * 4.7 + 1) * TAU, d = Math.sqrt(hash(i * 2.9 + 2));
    const dx = Math.cos(a) * d * 205, dy = Math.sin(a) * d * 82 - 22;
    const cab = CABEZAS[dx < 0 ? 0 : 1];
    return { dx, dy, r: 26 + 30 * hash(i * 1.3), tr: d * 0.07, ord: 0.3 * hash(i * 6.1) + 0.7 * (1 - d), cab, i };
  });
  function nubePof(g, t) {
    const u = t - T.choca; if (u < 0 || u > 1.7) return;
    const L = [];
    for (const b of NUBE) {
      const k = suave(clamp((u - b.tr) / 0.2));
      if (k <= 0.01) continue;
      const ts = T.choca + 0.42 + 0.72 * b.ord, s = suave(fase(t, ts, ts + 0.42));
      if (s >= 0.99) continue;
      let x = C_POF.x + b.dx * k * (1 + 0.08 * u), y = C_POF.y + b.dy * k;
      x = lerp(x, b.cab.x + b.dx * 0.25, 0.35 * s); y = lerp(y, b.cab.y + 30, 0.35 * s) + 20 * s;
      L.push([x, y, b.r * k * (0.45 + 0.55 * k) * (1 + 0.05 * Math.sin(t * 9 + b.i)) * (1 - s)]);
    }
    nube(g, L, 1.5);
  }
  // pegotes que salen volando y se estampan (destino, duración del vuelo, altura del arco, tamaño)
  const VUELAN = [
    { p: { x: 302, y: 172 }, d: 0.32, h: 40, r: 16 }, { p: { x: 738, y: 156 }, d: 0.3, h: 50, r: 17 }, { p: { x: 528, y: 94 }, d: 0.24, h: 20, r: 10 },
    { p: { x: 330, y: 377 }, d: 0.42, h: 90, r: 13 }, { p: { x: 706, y: 381 }, d: 0.44, h: 100, r: 14 }, { p: { x: 160, y: 236 }, d: 0.4, h: 60, r: 12 },
    { p: { x: 884, y: 252 }, d: 0.4, h: 70, r: 12 }, { p: { x: 470, y: 583 }, d: 0.55, h: 120, r: 18 }, { p: { x: 598, y: 588 }, d: 0.58, h: 140, r: 20 },
    { p: { x: 240, y: 566 }, d: 0.62, h: 150, r: 13 }, { p: { x: 820, y: 572 }, d: 0.6, h: 150, r: 14 }, { p: { x: 404, y: 120 }, d: 0.28, h: 40, r: 11 },
    { p: { x: 640, y: 128 }, d: 0.28, h: 40, r: 11 }
  ];
  function vuelan(g, t) {
    const u0 = t - T.choca - 0.05, L = [];
    VUELAN.forEach((v, i) => {
      const u = u0 / v.d; if (u < 0 || u >= 1) return;
      const x = lerp(C_POF.x, v.p.x, u), y = lerp(C_POF.y, v.p.y, u) - v.h * 4 * u * (1 - u);
      for (const c of racimo(x, y, v.r * (1 - 0.25 * u), 90 + i, suave(clamp(u0 / 0.08)))) L.push(c);
    });
    nube(g, L, 1.2);
  }
  // manchas que se quedan (en la pared, la mesa, el reloj y el suelo): se estampan y escurren
  function manchas(g, t) {
    const pared = [];
    VUELAN.forEach((v, i) => {
      const tl = T.choca + 0.05 + v.d, u = t - tl; if (u < 0) return;
      const ap = salida(clamp(u / 0.1)), esc = 1 + 0.3 * Math.exp(-u * 10) * Math.sin(u * 30);
      const r = v.r * lerp(0.75,1.1*esc,ap), sem = 90+i;
      if (v.p.y > SUELO_PARED) {
        g.save(); g.translate(v.p.x, v.p.y); g.scale(lerp(1,1.8,ap),lerp(1,0.45,ap));
        nube(g, racimo(0, 0, r, sem).concat(racimo(r * 1.5, r * 0.6, r * 0.35, sem + 9, ap), racimo(-r * 1.4, -r * 0.3, r * 0.3, sem + 11, ap)), 1.1);
        g.restore();
        return;
      }
      for (const c of racimo(v.p.x, v.p.y, r, sem, 1, lerp(1,0.75,ap))) pared.push(c);
      for (const c of racimo(v.p.x + r * 1.5, v.p.y - r * 0.5, r * 0.28, sem + 9, ap)) pared.push(c);
      for (const c of racimo(v.p.x - r * 1.3, v.p.y + r * 0.2, r * 0.24, sem + 11, ap)) pared.push(c);
      const l = 34 * salida(clamp(u / 4)) * (0.6 + 0.6 * hash(sem));
      for (const c of goteo(v.p.x - r * 0.15, v.p.y + r * 0.35, r * 0.32, l, sem)) pared.push(c);
    });
    nube(g, pared, 1.1);
  }
  // charco de cerveza con espuma a los pies
  const primerDerrame = VUELAN.filter(v => v.p.y > SUELO_PARED).reduce((a,b) => a.d < b.d ? a : b);
  const tocaSuelo = T.choca+0.05+primerDerrame.d;
  function charco(g, t) {
    const k = tramo(t, tocaSuelo, T.choca + 1.4, salida); if (k <= 0.01) return;
    g.save(); g.translate(lerp(primerDerrame.p.x,EJE_BRINDIS,k),lerp(primerDerrame.p.y,SUELO+4,k));
    g.fillStyle = "rgba(214,140,30,0.55)"; g.beginPath(); g.ellipse(0, 0, 110 * k, 9 * k, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(255,240,200,0.6)"; g.lineWidth = 2; g.beginPath(); g.ellipse(-20 * k, -2, 60 * k, 3.5 * k, 0, Math.PI * 1.05, Math.PI * 1.9); g.stroke();
    g.fillStyle = "#fff6e2"; for (let i = 0; i < 9; i++) { const x = (hash(i + 4) - 0.5) * 190 * k; g.beginPath(); g.ellipse(x, (hash(i + 7) - 0.5) * 8 * k, 6 * k, 2.4 * k, 0, 0, TAU); g.fill(); }
    g.restore();
  }
  // gotitas que salen disparadas en el choque
  function gotas(g, t) {
    const u = t - T.choca; if (u < 0 || u > 0.9) return;
    g.save();
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI * (0.05 + 0.9 * hash(i * 3.7)), v = 260 + 260 * hash(i * 1.9);
      const x = C_POF.x + Math.cos(a) * v * u * (hash(i) < 0.5 ? -1 : 1), y = C_POF.y + Math.sin(a) * v * u + 700 * u * u;
      g.globalAlpha = 1 - fase(u, 0.5, 0.9);
      g.fillStyle = hash(i * 2.2) < 0.5 ? "#f8b62c" : "#fff6e2"; g.strokeStyle = "rgba(90,60,20,0.8)"; g.lineWidth = 1;
      g.beginPath(); g.arc(x, y, 2 + 2.5 * hash(i * 5.1), 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }
  // rayitas del golpe
  function rayitas(g, t, x, y, t0, tam) {
    const k = campana(t, t0, t0 + 0.24); if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = "rgba(255,250,215,0.95)"; g.lineWidth = 2.2 * tam; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, r0 = 8 * tam, r1 = (16 + 8 * (1 - k)) * tam; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // el ¡tin! final: estrellita y un brillo
  function tin(g, t) {
    const k = campana(t, T.tin, T.tin + 0.4); if (k <= 0.01) return;
    const {x,y} = C_TIN;
    g.save(); g.globalAlpha = k; g.fillStyle = "#fffbe6"; g.strokeStyle = "rgba(120,96,40,0.8)"; g.lineWidth = 1.2;
    const r = 9 + 5 * k;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.35 : r; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,250,220,0.9)"; g.lineWidth = 1.6; g.lineCap = "round";
    for (const a of [-2.6, -0.5, 0.5, 2.6]) { g.beginPath(); g.moveTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); g.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); g.stroke(); }
    g.restore();
  }
  // nubecillas de espuma que sueltan con cada sacudida de la risa
  function soplos(g, t, rig, p, dr) {
    const rk = risaK(t, T.risa0 + dr); if (rk <= 0.01) return;
    const hom = rig.aPantalla(p, rig.tronco(p)(rig.HOMBRO_C));
    g.save();
    for (let i = 0; i < 6; i++) {
      const ph = ((t - T.risa0) * 1.7 + i / 6) % 1, a = -Math.PI / 2 + (hash(i + dr * 9) - 0.5) * 2.4;
      g.globalAlpha = rk * Math.sin(Math.PI * ph) * 0.8;
      g.fillStyle = "#fff8ea"; g.beginPath(); g.arc(hom.x + Math.cos(a) * (14 + 40 * ph), hom.y + Math.sin(a) * (10 + 30 * ph) - 10, 3 + 4 * ph, 0, TAU); g.fill();
    }
    g.restore();
  }
  // «pff»: se les escapa la risa por la nariz
  function pff(g, t, rig, p, t0, sg) {
    const u = t - t0; if (u < 0 || u > 0.5) return;
    const b = rig.aPantalla(p, rig.boca(p));
    g.save(); g.globalAlpha = 1 - fase(u, 0.2, 0.5);
    g.fillStyle = "#fff8ea"; g.strokeStyle = "rgba(140,112,76,0.7)"; g.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const v = u - i * 0.04; if (v < 0) continue; g.beginPath(); g.arc(b.x + sg * (8 + 70 * v), b.y - 6 - 20 * v + 6 * hash(i), 2 + 3 * v * 4, 0, TAU); g.fill(); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = dentro(t, T.carga0, T.carga1, T.choca + 0.15, T.choca + 1.0);
    const l = dentro(t, T.gLame0 - 0.5, T.gLame0, T.rLame1 + 0.2, T.alza2 + 0.4);
    const f = dentro(t, T.camara - 0.2, T.camara + 0.6, DUR, DUR + 1);
    const k = 1.1 + 0.08 * a + 0.12 * l + 0.03 * f, x = 517, y = Math.max(330 - 6 * a, 577 - 288 / k);
    const s = muelle(t, T.choca + 0.01, 46, 5.5) * 3.2;
    return { k, x: x + s, y: y + s * 0.5 };
  }

  function poses(t) { return { g: poseG(t), r: poseR(t) }; }

  class ElBrindis extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !R.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pR = poseR(t), pG = poseG(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.save(); g.translate(-60, -50); M0 = g.getTransform(); g.drawImage(fondo, 0, 0); g.restore();
      banderines(g, t);
      cuco(g, t);
      for (const l of LAMPS) lampara(g, t, l);
      llamaVela(g, t);
      charco(g, t);
      manchas(g, t);
      // los dos (con su capa de espuma)
      const k = tramo(t, T.choca + 0.2, T.choca + 0.36);
      dibujaPersonajes(g, t, pG, pR, k);
      espumaEncima(g, t, R, pR, "r", k, 0.1);
      espumaEncima(g, t, G, pG, "g", k, 0);
      gotaNariz(g, t, pG);
      voladores(g, t, "g"); voladores(g, t, "r");
      soplos(g, t, G, pG, 0); soplos(g, t, R, pR, 0.1);
      pff(g, t, G, pG, T.gPff, 1); pff(g, t, R, pR, T.rPff, -1);
      // el reventón
      rayitas(g, t, C_POF.x, C_POF.y, T.choca, 1.6);
      gotas(g, t);
      vuelan(g, t);
      nubePof(g, t);
      tin(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
      void M0;
    }
  }

  registrar({ id: "00120.2", nombre: "Guillermo y Rodri · El brindis (revisión 2)", crear: () => new ElBrindis() });
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
  window.__A2D_00120_2 = { pose: poses, poseG, poseR, T, DUR, diag, bordeJarra, CUERPO, SEMITRAZO, C_POF, C_TIN,
    sueltaPelo, bolasVuelo, quedaPelo, VUELAN_PELO, estadoNariz, salidaNariz, OJOS, BOCA, camara, RF,
    mascaraEspuma: () => FL, VUELAN, vuelan, manchas, charco, tocaSuelo };
})();
