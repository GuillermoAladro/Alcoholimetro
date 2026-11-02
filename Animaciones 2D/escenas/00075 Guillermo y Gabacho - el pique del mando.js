"use strict";
/* 00075 · Guillermo y Gabacho · El mando
 *
 * Negro → salón de un piso pequeño, de noche: pared verde salvia con zócalo de madera, una lámina con un
 * balón, una balda con una copa, lámpara de pie, mesita con un cuenco de patatas y un sofá de pana mostaza.
 * A la derecha, una tele plana sobre un mueble bajo, vista de tres cuartos: en la pantalla, el partido
 * (césped a franjas y puntitos que corren; ni marcador ni letras). Gabacho (izquierda) y Guillermo
 * (derecha) lo ven sentados; el mando está en el cojín, entre los dos.
 * Los dos miran el mando, se miran… y se lanzan: Gabacho lo pilla primero y Guillermo palmea el cojín
 * vacío → Gabacho se lo pasa a la otra mano y lo sube bien lejos → Guillermo salta al cojín girándose
 * hacia él y Gabacho se levanta también: le sujeta por la frente con el brazo estirado mientras
 * Guillermo da molinetes y brincos sin llegar → Gabacho, chulito, le enseña el mando… y Guillermo lo
 * agarra → tira y afloja (el mando tiembla; caras rojas, dientes apretados, sudor) → el mando se escurre
 * y sale disparado hacia arriba dando vueltas → trastabillan, lo ven, saltan a por él y se dan un cabezazo
 * (¡bonk!, estrellas y chichones) → caen en montón: Guillermo tumbado boca arriba con la cabeza en el
 * brazo del sofá y Gabacho sentado encima; siguen peleando (Gabacho le aparta la cara, Guillermo le agarra
 * la camiseta)… el mando cae en el brazo del sofá, se aprieta un botón y la tele cambia a dibujos animados
 * (una pelota roja que bota entre colinas) → se quedan congelados, miran la pantalla, se sueltan despacio
 * y se quedan embobados, ladeando la cabeza a la vez al ritmo de la pelota → miran a cámara a la vez
 * (guiño y pulgar arriba de Gabacho) y vuelven a la tele → negro.
 *
 * Sin textos. Cada personaje se dibuja con su propia transformación (pivote en la pelvis, giro y espejo
 * aplastado para darse la vuelta); manos y pies se calculan en coordenadas del mundo en cada fotograma
 * y se pasan a la hoja del personaje. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, B = Gabacho, R = Recortes;
  const S = 0.28, DUR = 14.4, TAU = Math.PI * 2, TINTA = "#0b0a0e";
  const SUELO = 560, ASIENTO = 98, COJIN = SUELO - ASIENTO;          // 462: cara de arriba de los cojines
  const SOFA = { x0: 238, x1: 800, br: 62, respaldo: 314, brazo: 388, frente: 494, base: 530, mitad: 519 };
  const SI0 = SOFA.x0 + SOFA.br, SI1 = SOFA.x1 - SOFA.br;            // asiento: 300 … 738
  const SUP = COJIN + 6;                                              // cojín pisado (de pie encima)
  const XB = 395, XG = 645;                                           // pelvis sentados (Gabacho, Guillermo)
  const T = {
    luz: 0.8,
    ojoB: 1.25, ojoG: 1.45, miran: 1.72, cejas: 1.9,
    lanzaB: 2.2, agarra: 2.36, lanzaG: 2.34, palmada: 2.54,
    pasa: 2.62, pasa1: 2.86, arriba: 3.08,
    puno: 2.7, sube: 3.0, gira0: 3.1, gira1: 3.34, depie: 3.44,
    subeB: 3.26, depieB: 3.58, frente: 3.66,
    salto1: 3.84, salto2: 4.22,
    burla: 4.5, pasa2: 4.66, ofrece: 4.74, pilla: 4.98,
    tira0: 5.02, tiraB: 5.3, tiraG: 5.78, tiran: 6.22, suelta: 6.95,
    recupera: 7.22, ven: 7.2, agacha: 7.3, salto: 7.42, choque: 7.66,
    caeG: 8.0, caeB: 8.12, quieto: 8.42,
    pelea: 8.2, mandoCae: 8.44, clic: 8.5, canal: 8.56, dibujos: 8.72,
    congela: 8.6, miranTele: 8.82, sueltan: 9.3, sueltan1: 9.95, absortos: 9.7,
    camara: 12.55, guino: 12.82, vuelven: 13.22, fin: 13.7
  };

  /* ---------- utilidades ---------- */
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const suma = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const Dd = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? m ?? i, menique: me ?? a ?? m ?? i });
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n], b[n], k); return o; };
  const RELAJ = Dd(0.55, 0.6, 0.55, 0.5, 0.45), MUSLO = Dd(0.7, 0.82, 0.8, 0.76, 0.72), ABIERTA = Dd(1, 1), PUNO = Dd(0.2, 0.04),
    AGARRA = Dd(0.5, 0.3, 0.28, 0.27, 0.26), PALMA = Dd(0.85, 0.97, 0.97, 0.95, 0.92), GARRA = Dd(0.55, 0.45, 0.42, 0.4, 0.38),
    TIRA = Dd(0.3, 0.14, 0.13, 0.12, 0.12);

  /* ---------- los dos recortables: marco propio (pivote en la pelvis) ---------- */
  function info(rig) {
    const pz = rig.A.datos.piezas;
    return { rig, PEL: rig.PELVIS, alto: (rig.SUELO - rig.PELVIS.y) * S, tob: rig.TOBILLO_ALTO * S,
      L: { l: rig.BRAZO_L, c: rig.BRAZO_C_L }, sj: { l: pz.brazo.codo || rig.BRAZO_L * 0.5, c: pz.brazo_cerca.codo } };
  }
  const IG = info(G), IB = info(B);
  // hoja → mundo y mundo → hoja con el marco M = { W (pelvis en el mundo), phi, sx }
  const aMundo = (I, M, q) => { const r = rot({ x: (q.x - I.PEL.x) * S * M.sx, y: (q.y - I.PEL.y) * S }, M.phi); return { x: M.W.x + r.x, y: M.W.y + r.y }; };
  const aHoja = (I, M, q) => { const r = rot({ x: q.x - M.W.x, y: q.y - M.W.y }, -M.phi);
    const sx = Math.abs(M.sx) < 0.06 ? (M.sx < 0 ? -0.06 : 0.06) : M.sx; return { x: I.PEL.x + r.x / (S * sx), y: I.PEL.y + r.y / S }; };
  function dibuja(g, I, p, t) {
    const M = p.M;
    g.save(); g.translate(M.W.x, M.W.y); g.rotate(M.phi); g.scale(M.sx, 1); g.translate(0, -(I.PEL.y - I.rig.SUELO) * S);
    I.rig.dibujar(g, p, t); g.restore();
  }
  // puntos útiles del cuerpo en el mundo
  const hombroW = (I, p, lado) => aMundo(I, p.M, I.rig.tronco(p)(lado === "c" ? I.rig.HOMBRO_C : I.rig.HOMBRO));
  const cabezaW = (I, p) => aMundo(I, p.M, I.rig.centroCabeza(p));
  const deCabeza = (I, p, q) => aMundo(I, p.M, I.rig.cabeza(p).a(q));      // punto del retrato → mundo
  // rodilla (mundo) por la misma cuenta que el recortable
  function rodillaW(I, p, lado, d = { x: 0, y: 0 }) {
    const L = I.rig.A.datos.piezas[lado === "cerca" ? "pierna_cerca" : "pierna_lejos"].largo;
    const cad = I.rig.tronco(p)(I.rig.CADERA[lado]), c = R.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), dd = R.dir(c.a1);
    const q = aMundo(I, p.M, { x: cad.x + dd.x * L * 0.5 * c.estira, y: cad.y + dd.y * L * 0.5 * c.estira });
    return { x: q.x + d.x, y: q.y + d.y };
  }

  /* ---------- cuerpos: estados en coordenadas del mundo, mezclados por tramos ---------- */
  // { x, y (pelvis), torso, cab, sx, phi, pc, pl (tobillos en el mundo: x, y, a = giro del zapato en la hoja) }
  const mezPie = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), a: lerp(a.a, b.a, k) });
  const mezCuerpo = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), torso: lerp(a.torso, b.torso, k), cab: lerp(a.cab, b.cab, k),
    sx: lerp(a.sx, b.sx, k), phi: lerp(a.phi, b.phi, k), pc: mezPie(a.pc, b.pc, k), pl: mezPie(a.pl, b.pl, k) });
  function cuerpo(lista, t) {
    let c = lista[0][2](t);
    for (let i = 1; i < lista.length; i++) { const [t0, t1, e, f] = lista[i]; if (t <= t0) break; c = mezCuerpo(c, e(t), (f || suave)(fase(t, t0, t1))); }
    return c;
  }
  // pies relativos a la pelvis (marco del propio estado), en px de pantalla sin girar: [dx, dy, a]
  const piesRel = (c, sx, phi, rc, rl) => {
    const f = d => { const r = rot({ x: d[0] * sx, y: d[1] }, phi); return { x: c.x + r.x, y: c.y + r.y, a: d[2] || 0 }; };
    return { pc: f(rc), pl: f(rl) };
  };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ---------- manos por pistas: [t0, t1, objetivo, curva]; el objetivo (hoja) se resuelve en cada fotograma ---------- */
  function pista(lista, p, t) {
    const res = o => ({ q: o.en(p, t), mx: o.mx ?? 0, puno: o.puno ?? 1, ang: o.ang ?? 0, dobla: o.dobla ?? -1,
      dedos: typeof o.dedos === "function" ? o.dedos(t) : o.dedos });
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, o, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = res(o);
      c = { q: mezcla(c.q, d.q, k), mx: lerp(c.mx, d.mx, k), puno: lerp(c.puno, d.puno, k), ang: lerp(c.ang, d.ang, k),
        dobla: k < 0.5 ? c.dobla : d.dobla, dedos: mezclaD(c.dedos, d.dedos, k) };
    }
    return c;
  }
  // mano final: el antebrazo llega por su lado natural (mu = de la mano hacia el codo) + un giro extra
  function manoDe(I, p, lado, h) {
    const rig = I.rig, T0 = rig.tronco(p), cerca = lado === "c";
    const hom = T0(cerca ? rig.HOMBRO_C : rig.HOMBRO), L = I.L[lado], sj = I.sj[lado];
    const c = R.ik(hom, h.q, L, sj, 42, h.dobla, 1.08), d = R.dir(c.a1);
    const e = { x: hom.x + d.x * sj * c.estira, y: hom.y + d.y * sj * c.estira };
    const mu = Math.atan2(e.y - h.q.y, e.x - h.q.x) + h.mx;
    return { x: h.q.x, y: h.q.y, ang: h.ang, mu, dobla: h.dobla, puno: h.puno, dedos: h.dedos };
  }
  // objetivos de mano: en el mundo, respecto a la pelvis (hoja) o al hombro (mundo)
  const enW = (I, f) => (p, t) => aHoja(I, p.M, typeof f === "function" ? f(p, t) : f);
  const enP = (I, d) => p => ({ x: I.PEL.x + d.x, y: I.PEL.y + d.y });
  const enH = (I, lado, d) => (p, t) => { const h = hombroW(I, p, lado), o = typeof d === "function" ? d(p, t) : d;
    return aHoja(I, p.M, { x: h.x + o.x * p.M.sx, y: h.y + o.y }); };
  const con = (f, extra) => (p, t) => { const a = f(p, t), b = extra(p, t); return { x: a.x + b.x, y: a.y + b.y }; };
  const molinete = (f, r, ph = 0) => (p, t) => ({ x: r * Math.cos(TAU * f * t + ph), y: r * Math.sin(TAU * f * t + ph) });

  /* =====================================================================================
   * EL MANDO: en el cojín, en la mano de Gabacho, en el tira y afloja, volando y en el brazo del sofá
   * ===================================================================================== */
  const MANDO_COJIN = { x: 535, y: COJIN - 5, a: -0.06 };
  const MANDO_BRAZO = { x: 780, y: SOFA.brazo - 7, a: 0.1 };
  function dibMando(g, t, brillo = 0) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // cuerpo
    g.fillStyle = "#2a2b33"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.roundRect(-30, -8.5, 60, 17, 7); g.fill(); g.stroke();
    g.fillStyle = "#3b3d48"; g.beginPath(); g.roundRect(-27, -7, 54, 7, 4); g.fill();
    g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.roundRect(-25, -6.4, 48, 2.4, 1.2); g.fill();
    // emisor (delante) y botón rojo de encendido
    g.fillStyle = "#151519"; g.beginPath(); g.roundRect(26, -5, 4, 10, 2); g.fill();
    g.fillStyle = brillo > 0 ? `rgb(255,${Math.round(90 + 140 * brillo)},${Math.round(80 + 140 * brillo)})` : "#e0453c";
    g.beginPath(); g.arc(19, -1.5, 2.8, 0, TAU); g.fill(); g.lineWidth = 0.8; g.stroke();
    // cruceta
    g.fillStyle = "#8d909e"; g.beginPath(); g.arc(8, 0, 4.6, 0, TAU); g.fill(); g.lineWidth = 0.9; g.stroke();
    g.fillStyle = "#5c5f6c"; g.beginPath(); g.arc(8, 0, 1.8, 0, TAU); g.fill();
    // botoncitos
    g.fillStyle = "#6b6e7a"; for (let i = 0; i < 3; i++) for (let j = -1; j <= 1; j += 2) { g.beginPath(); g.arc(-4 - i * 5, j * 3, 1.4, 0, TAU); g.fill(); }
    // los cuatro de colores
    const COL = ["#e04a3c", "#4fb35a", "#f1c84a", "#3f7fd0"];
    for (let i = 0; i < 4; i++) { g.fillStyle = COL[i]; g.beginPath(); g.roundRect(-25 + i * 0 , -4.5 + i * 2.6 - 0.6, 3.2, 1.8, 0.8); g.fill(); }
    if (brillo > 0.01) { g.globalAlpha = brillo; g.fillStyle = "rgba(255,240,200,0.9)"; g.beginPath(); g.arc(19, -1.5, 6, 0, TAU); g.fill(); }
    g.restore();
  }
  // en la mano (unidades de la mano): eje largo hacia donde apunte `aLoc` (giro en la hoja), agarrado por detrás del centro
  const mandoEnMano = (m, aLoc, desp = 6) => (g, t) => {
    g.save(); g.rotate(aLoc - (m.ang || 0)); const k = 1 / (G.JK * S); g.scale(k, k); g.translate(desp, 1); dibMando(g, t); g.restore();
  };

  /* ---------- tira y afloja: centro del mando en el mundo ---------- */
  const TIRA_X = 498, TIRA_Y = 250, AGARRE = 18;
  function tiraY(t) {
    let x = TIRA_X;
    x -= 26 * campana(t, T.tiraB, T.tiraB + 0.55) * 1.0 + 4 * tramo(t, T.tiraB, T.tiraB + 0.2) * (1 - tramo(t, T.tiraG, T.tiraG + 0.2));
    x += 30 * campana(t, T.tiraG, T.tiraG + 0.55);
    const tiembla = dentro(t, T.tiran, T.tiran + 0.15, T.suelta - 0.02, T.suelta);
    x += tiembla * (3 * Math.sin(t * 157) + 2 * Math.sin(t * 89));
    const y = TIRA_Y + 3 * Math.sin(t * 6.1) + tiembla * 1.5 * Math.sin(t * 131);
    const a = 0.03 * Math.sin(t * 4.3) + tiembla * 0.04 * Math.sin(t * 113);
    return { x, y, a, tiembla };
  }
  // vuelo: sale de las manos, sube dando vueltas y cae en el brazo del sofá
  const APICE = { x: 806, y: -34, t: 7.44 };
  function vuelo(t) {
    const t0 = T.suelta, t1 = T.mandoCae;
    const ini = tiraY(t0);
    if (t < APICE.t) { const k = fase(t, t0, APICE.t), ks = salida(k);
      return { x: lerp(ini.x, APICE.x, k), y: lerp(ini.y, APICE.y, ks), a: TAU * 1.6 * salida(k) }; }
    const k = fase(t, APICE.t, t1), ke = entrada(k) * 0.55 + k * 0.45;
    return { x: lerp(APICE.x, MANDO_BRAZO.x, k), y: lerp(APICE.y, MANDO_BRAZO.y, ke), a: TAU * 1.6 + TAU * 1.5 * k + MANDO_BRAZO.a * k };
  }
  function mando(t) {
    if (t < T.agarra) return { modo: "suelo", x: MANDO_COJIN.x, y: MANDO_COJIN.y, a: MANDO_COJIN.a };
    if (t < T.pilla) return { modo: "mano" };
    if (t < T.suelta) { const s = tiraY(t); return { modo: "tira", x: s.x, y: s.y, a: s.a }; }
    if (t < T.mandoCae) { const v = vuelo(t); return { modo: "vuela", x: v.x, y: v.y, a: v.a }; }
    const v = t - T.mandoCae, bote = 9 * Math.exp(-v * 10) * Math.abs(Math.sin(v * 16));
    return { modo: "brazo", x: MANDO_BRAZO.x, y: MANDO_BRAZO.y - bote, a: MANDO_BRAZO.a + 0.12 * Math.exp(-v * 9) * Math.sin(v * 22) };
  }

  /* =====================================================================================
   * GABACHO (izquierda): sentado → pilla el mando → lo sube → de pie, frente de Guillermo → tira y afloja
   * → trastabilla → salta → cabezazo → cae sentado encima de Guillermo → embobado
   * ===================================================================================== */
  const sentB = (x, torso, cab = 0.02) => t => {
    const c = { x, y: COJIN - 19, torso, cab, sx: 1, phi: 0 };
    return Object.assign(c, { pc: { x: x + 60, y: SUELO - IB.tob, a: 0 }, pl: { x: x + 71, y: SUELO - IB.tob - 3, a: 0 } });
  };
  const dePieB = (x, torso, cab, dc, dl, baja = 0) => t => ({ x, y: SUP - IB.alto + baja, torso, cab, sx: 1, phi: 0,
    pc: { x: x + dc, y: SUP - IB.tob, a: 0 }, pl: { x: x + dl, y: SUP - IB.tob, a: 0 } });
  const B_PILA = { x: 546, y: 398 };
  const CUERPO_B = [
    [0, 0, sentB(XB, -0.05)],
    [T.ojoB, T.ojoB + 0.3, sentB(XB, 0.02, 0.06)],
    [T.lanzaB, T.agarra, sentB(XB + 24, 0.46, -0.06), salida],
    [T.agarra + 0.02, T.pasa + 0.06, sentB(XB, -0.08, -0.04)],
    [T.pasa1, T.arriba + 0.1, sentB(XB - 4, -0.14, -0.08)],
    // se levanta (salto pequeño al cojín)
    [T.subeB, T.subeB + 0.16, t => { const c = sentB(XB, 0.25, 0)(t); c.y += 8; return c; }, suave],
    [T.subeB + 0.16, T.depieB, t => { const c = dePieB(XB + 6, -0.1, -0.05, -28, 30)(t); const k = campana(t, T.subeB + 0.14, T.depieB + 0.05); c.y -= 28 * k; c.pc.y -= 22 * k; c.pl.y -= 26 * k; return c; }],
    // sujetando la frente de Guillermo (se echa un poco atrás, chulo)
    [T.frente - 0.05, T.frente + 0.15, dePieB(XB + 8, -0.06, -0.07, -30, 30)],
    // le enseña el mando
    [T.burla, T.ofrece, dePieB(XB + 10, -0.04, 0.05, -34, 34)],
    // tira y afloja: se echa atrás, pie de delante adelantado
    [T.pilla - 0.04, T.tira0 + 0.12, t => { const s = tiraY(t); return dePieB(s.x - 93, -0.24, -0.1, -40, 38, 10)(t); }],
    [T.tiraB, T.tiraB + 0.3, t => { const s = tiraY(t); return dePieB(s.x - 93, -0.34, -0.14, -40, 38, 14)(t); }],
    [T.tiraG, T.tiraG + 0.25, t => { const s = tiraY(t); return dePieB(s.x - 92, -0.16, -0.02, -40, 38, 8)(t); }],
    [T.tiran, T.tiran + 0.25, t => { const s = tiraY(t); const c = dePieB(s.x - 93, -0.27 + 0.02 * Math.sin(t * 41), -0.1, -40, 38, 12)(t); return c; }],
    // se escurre: cae hacia atrás y recupera el equilibrio
    [T.suelta, T.suelta + 0.18, dePieB(XB - 36, -0.55, -0.25, -60, 4, 16), salida],
    [T.suelta + 0.18, T.recupera, dePieB(XB - 22, -0.12, -0.05, -50, 18, 6)],
    // se agacha y salta a por el mando
    [T.agacha, T.salto, dePieB(XB - 16, 0.18, -0.12, -42, 22, 26)],
    [T.salto, T.choque, t => { const x = XB - 3, y = SUP - IB.alto - 62; const c = { x, y, torso: 0.06, cab: -0.12, sx: 1, phi: 0.3 };
      return Object.assign(c, piesRel(c, 1, 0.3, [-24, 138, 0.5], [26, 130, 0.4])); }, salida],
    // rebota del cabezazo y cae sentado encima de Guillermo
    [T.choque + 0.05, T.choque + 0.17, t => { const x = XB - 20, y = SUP - IB.alto - 66; const c = { x, y, torso: -0.2, cab: -0.25, sx: 1, phi: -0.12 };
      return Object.assign(c, piesRel(c, 1, -0.12, [-10, 150, 0.4], [40, 140, 0.6])); }, salida],
    [T.choque + 0.17, T.caeB, t => { const c = { x: B_PILA.x, y: B_PILA.y, torso: -0.08, cab: 0.04, sx: 1, phi: 0 };
      return Object.assign(c, piesRel(c, 1, 0, [44, 116, 0.55], [56, 112, 0.65])); }, entrada],
    [T.caeB, T.caeB + 0.01, t => { const v = t - T.caeB, b = v > 0 ? 9 * Math.exp(-v * 8) * Math.sin(v * 18) : 0;
      const c = { x: B_PILA.x, y: B_PILA.y + b, torso: -0.06 + 0.02 * Math.sin(t * 2.1), cab: 0.04, sx: 1, phi: 0 };
      const bal = 0.15 * Math.sin(t * 1.7);       // las piernas cuelgan y se balancean un poco
      return Object.assign(c, piesRel(c, 1, 0, [44 + 4 * bal, 116, 0.55 + bal], [56 - 4 * bal, 112, 0.65 - bal])); }]
  ];

  const CARAS_B = {
    tele: E({ mx: 0.9, my: 0.05, c: 0.22, sd: 4, si: 6, sonr: 0.25 }),
    mando: E({ mx: 0.55, my: 1, c: 0.3, sd: 2, si: 10, gi: 0.06, sonr: 0.1 }),
    reto: E({ mx: 0.95, my: 0.1, c: 0.42, sd: -4, gd: -0.14, si: 2, gi: -0.1, sonr: -0.05, ancho: 0.8 }),
    lanza: E({ mx: 0.6, my: 0.8, c: 0.05, iris: 0.85, sd: 10, si: 10, abre: 12, ancho: 0.7, sonr: -0.1 }),
    pillo: E({ mx: 0.95, my: 0.05, c: 0.36, sd: 4, gd: 0.04, si: 22, gi: 0.14, abre: 4, ancho: 1.05, sonr: 0.9 }),
    burla: E({ mx: 0.95, my: 0.1, c: 0.5, h: 0.4, sd: 8, si: 18, gi: 0.1, abre: 24, ancho: 0.9, sonr: 0.5, lengua: 1, dientes: 0 }),
    ofrece: E({ mx: 0.95, my: 0.15, c: 0.3, sd: 10, gd: 0.06, si: 24, gi: 0.14, abre: 6, ancho: 1.05, sonr: 0.85 }),
    susto: E({ mx: 0.9, my: 0.1, iris: 0.6, sd: 26, si: 28, abre: 26, ancho: 0.62, sonr: -0.2 }),
    fuerza: E({ mx: 0.9, my: 0, c: 1, z: 1, sd: 6, gd: -0.12, si: 6, gi: -0.12, abre: 14, ancho: 1.15, sonr: -0.25, rub: 0.4 }),
    arriba: E({ mx: 0.45, my: -1, iris: 0.8, sd: 22, si: 24, abre: 20, ancho: 0.62, sonr: -0.1 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 10, si: 10, abre: 18, ancho: 0.75, sonr: 0.05, lengua: 0.4 }),
    enfado: E({ mx: -0.85, my: 0.6, c: 0.34, sd: -6, gd: -0.16, si: -4, gi: -0.14, abre: 10, ancho: 0.9, sonr: -0.35 }),
    pasmo: E({ mx: 0.95, my: 0.05, iris: 0.7, sd: 22, si: 24, abre: 18, ancho: 0.6, sonr: 0 }),
    embobado: E({ mx: 0.95, my: 0.12, c: 0.4, sd: 8, si: 10, abre: 14, ancho: 0.72, sonr: 0.2 }),
    camara: E({ mx: -0.6, my: 0.05, c: 0.3, sd: 10, gd: 0.04, si: 8, abre: 8, ancho: 0.95, sonr: 0.75 }),
    guino: E({ mx: -0.6, my: 0.05, c: 0.12, wd: 0.88, sd: -2, gd: -0.06, si: 20, gi: 0.12, abre: 8, ancho: 1.05, sonr: 0.95 })
  };
  const GUION_CARA_B = [
    [T.ojoB, T.ojoB + 0.2, "mando"], [T.miran, T.miran + 0.18, "reto"], [T.lanzaB - 0.06, T.lanzaB + 0.06, "lanza"],
    [T.agarra + 0.06, T.agarra + 0.26, "pillo"], [T.frente + 0.1, T.frente + 0.3, "burla"], [T.burla, T.burla + 0.2, "ofrece"],
    [T.pilla, T.pilla + 0.06, "susto"], [T.tira0 + 0.05, T.tira0 + 0.25, "fuerza"], [T.suelta, T.suelta + 0.06, "susto"],
    [T.ven, T.ven + 0.15, "arriba"], [T.choque, T.choque + 0.05, "mareo"], [T.pelea - 0.08, T.pelea + 0.12, "enfado"],
    [T.congela + 0.08, T.miranTele, "pasmo"], [T.absortos - 0.2, T.absortos + 0.4, "embobado"],
    [T.camara, T.camara + 0.18, "camara"], [T.guino, T.guino + 0.1, "guino"], [T.guino + 0.3, T.guino + 0.4, "camara"],
    [T.vuelven, T.vuelven + 0.25, "embobado"]
  ];
  const PARP_B = [0.6, 1.62, 3.0, 4.3, 5.0, 7.08, 9.55, 10.9, 12.2, 13.5];

  /* =====================================================================================
   * GUILLERMO (derecha): sentado → palmada al cojín vacío → salta al cojín y se gira → molinetes →
   * agarra el mando → tira y afloja → trastabilla → salta → cabezazo → cae tumbado → embobado
   * ===================================================================================== */
  const sentG = (x, torso, cab = 0.03) => t => {
    const c = { x, y: COJIN - 19, torso, cab, sx: 1, phi: 0 };
    return Object.assign(c, { pc: { x: x + 62, y: SUELO - IG.tob, a: 0 }, pl: { x: x + 73, y: SUELO - IG.tob - 3, a: 0 } });
  };
  // de pie en el cojín mirando a la izquierda (sx = −1): dc, dl en px del mundo respecto a la pelvis
  const dePieG = (x, torso, cab, dc, dl, baja = 0) => t => ({ x, y: SUP - IG.alto + baja, torso, cab, sx: -1, phi: 0,
    pc: { x: x + dc, y: SUP - IG.tob, a: 0 }, pl: { x: x + dl, y: SUP - IG.tob, a: 0 } });
  const brinco = (t, t0) => campana(t, t0, t0 + 0.34);
  const G_PILA = { x: 535, y: 441, phi: 1.2 };
  const CUERPO_G = [
    [0, 0, sentG(XG, -0.06)],
    [T.ojoG, T.ojoG + 0.3, sentG(XG, 0.0, 0.07)],
    [T.lanzaG, T.palmada, sentG(XG - 16, -0.4, 0.1), salida],
    [T.palmada + 0.04, T.puno, sentG(XG - 14, -0.3, 0.06)],
    // salta al cojín y se da la vuelta (espejo aplastado)
    [T.sube, T.gira0, t => { const c = sentG(XG - 10, 0.3, 0.05)(t); c.y += 6; return c; }],
    [T.gira0, T.depie, t => { const k = fase(t, T.gira0, T.depie), sx = Math.cos(Math.PI * suave(fase(k, 0.28, 0.62)));
      const c = { x: lerp(XG - 10, XG - 46, k), y: lerp(COJIN - 19, SUP - IG.alto, salida(k)) - 46 * Math.sin(Math.PI * k), torso: 0.1, cab: 0.04, sx: Math.abs(sx) < 0.06 ? (sx < 0 ? -0.06 : 0.06) : sx, phi: 0 };
      const pies = piesRel(c, c.sx, 0, [-14, 120, -0.2], [16, 118, -0.2]); return Object.assign(c, pies); }, t => t],
    // aguantado por la frente: inclinado hacia Gabacho, molinetes y brincos
    [T.depie, T.frente, t => { const x = XG - 52; const c = dePieG(x, 0.34, 0.06, 30, -30, 6)(t);
      for (const tb of [T.salto1, T.salto2]) { const k = brinco(t, tb); c.y -= 30 * k; c.pc.y -= 28 * k; c.pl.y -= 22 * k; c.pc.x += 4 * k; }
      return c; }],
    // le suelta la frente: se va hacia delante; le ve el mando y lo agarra
    [T.burla + 0.02, T.ofrece + 0.08, dePieG(XG - 62, 0.06, 0.08, 34, -36, 8)],
    [T.pilla - 0.06, T.tira0 + 0.12, t => { const s = tiraY(t); return dePieG(s.x + 82, -0.22, -0.06, 38, -40, 10)(t); }],
    [T.tiraB, T.tiraB + 0.25, t => { const s = tiraY(t); return dePieG(s.x + 80, -0.08, 0.04, 38, -40, 6)(t); }],
    [T.tiraG, T.tiraG + 0.3, t => { const s = tiraY(t); return dePieG(s.x + 82, -0.34, -0.12, 38, -40, 14)(t); }],
    [T.tiran, T.tiran + 0.25, t => { const s = tiraY(t); return dePieG(s.x + 82, -0.26 + 0.02 * Math.sin(t * 37 + 1), -0.1, 38, -40, 12)(t); }],
    // se escurre: cae hacia atrás (a la derecha) y recupera
    [T.suelta, T.suelta + 0.18, dePieG(XG - 20, -0.55, -0.25, 64, -4, 16), salida],
    [T.suelta + 0.18, T.recupera, dePieG(XG - 34, -0.12, -0.05, 54, -16, 6)],
    [T.agacha, T.salto, dePieG(XG - 40, 0.18, -0.12, 44, -22, 26)],
    [T.salto, T.choque, t => { const x = XG - 13, y = SUP - IG.alto - 60; const c = { x, y, torso: 0.06, cab: -0.12, sx: -1, phi: -0.3 };
      return Object.assign(c, piesRel(c, -1, -0.3, [-24, 138, 0.5], [26, 130, 0.4])); }, salida],
    // rebota y cae de espaldas en el sofá: la cabeza en el brazo de la derecha
    [T.choque + 0.05, T.choque + 0.17, t => { const c = { x: XG + 14, y: SUP - IG.alto - 64, torso: -0.2, cab: -0.25, sx: -1, phi: 0.25 };
      return Object.assign(c, piesRel(c, -1, 0.25, [-6, 148, 0.4], [40, 140, 0.6])); }, salida],
    [T.choque + 0.17, T.caeG, t => pilaG(t), entrada],
    [T.caeG, T.caeG + 0.01, t => pilaG(t)]
  ];
  // tumbado en el sofá: espalda en los cojines, cabeza contra el brazo derecho, piernas hacia la izquierda
  function pilaG(t) {
    const v = t - T.caeG, b = v > 0 ? 8 * Math.exp(-v * 8) * Math.sin(v * 18) : 0;
    const peso = tramo(t, T.caeB - 0.02, T.caeB + 0.08);       // Gabacho le cae encima
    const c = { x: G_PILA.x, y: G_PILA.y + b + 6 * peso * Math.exp(-Math.max(0, t - T.caeB) * 6), torso: 0, cab: -0.05, sx: -1, phi: G_PILA.phi };
    // piernas: rodillas arriba; pataleando durante la pelea, congeladas y luego apoyadas en el cojín
    const pat = dentro(t, T.caeG + 0.05, T.caeG + 0.15, T.congela - 0.04, T.congela), w = t * 15;
    const k1 = Math.max(0, Math.sin(w)), k2 = Math.max(0, Math.sin(w + Math.PI));
    c.pc = { x: 392 + 22 * pat * k1, y: COJIN - 10 - 46 * pat * k1, a: -1.1 - 0.5 * pat * k1 };
    c.pl = { x: 412 + 22 * pat * k2, y: COJIN - 16 - 46 * pat * k2, a: -1.0 - 0.5 * pat * k2 };
    return c;
  }

  const CARAS_G = {
    tele: E({ mx: 0.9, my: 0.05, c: 0.24, sd: 4, si: 4, sonr: 0.2 }),
    mando: E({ mx: -0.6, my: 1, c: 0.32, sd: 4, si: 8, sonr: 0.05 }),
    reto: E({ mx: -0.95, my: 0.1, c: 0.45, sd: -6, gd: -0.14, si: 0, gi: -0.12, sonr: -0.1, ancho: 0.8 }),
    lanza: E({ mx: -0.7, my: 0.8, c: 0.05, iris: 0.85, sd: 12, si: 12, abre: 14, ancho: 0.7, sonr: -0.1 }),
    pasmo: E({ mx: -0.6, my: 0.9, iris: 0.7, sd: 20, si: 22, abre: 16, ancho: 0.6, sonr: -0.2 }),
    rabia: E({ mx: 0.85, my: 0.05, c: 0.3, sd: -8, gd: -0.2, si: -6, gi: -0.18, abre: 12, ancho: 1, sonr: -0.4, rub: 0.3 }),
    lucha: E({ mx: 0.9, my: -0.2, c: 0.7, z: 0.8, sd: -2, gd: -0.16, si: -2, gi: -0.16, abre: 18, ancho: 1.1, sonr: -0.3, rub: 0.5 }),
    ve: E({ mx: 0.9, my: 0.2, iris: 0.75, sd: 22, si: 22, abre: 10, ancho: 0.6, sonr: 0.1 }),
    fuerza: E({ mx: 0.9, my: 0, c: 1, z: 1, sd: 6, gd: -0.12, si: 6, gi: -0.12, abre: 14, ancho: 1.15, sonr: -0.25, rub: 0.5 }),
    susto: E({ mx: 0.9, my: 0.1, iris: 0.6, sd: 26, si: 28, abre: 26, ancho: 0.62, sonr: -0.2 }),
    arriba: E({ mx: 0.45, my: -1, iris: 0.8, sd: 22, si: 24, abre: 20, ancho: 0.62, sonr: -0.1 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 10, si: 10, abre: 18, ancho: 0.75, sonr: 0.05, lengua: 0.4 }),
    enfado: E({ mx: 0.85, my: -0.4, c: 0.34, sd: -6, gd: -0.16, si: -6, gi: -0.16, abre: 12, ancho: 0.9, sonr: -0.4, rub: 0.2 }),
    pasmo2: E({ mx: 0.3, my: -1, iris: 0.7, sd: 22, si: 24, abre: 18, ancho: 0.6, sonr: 0 }),
    embobado: E({ mx: 0.3, my: -1, c: 0.4, sd: 8, si: 10, abre: 14, ancho: 0.72, sonr: 0.2 }),
    camara: E({ mx: -0.7, my: 0.2, c: 0.3, sd: 10, si: 10, abre: 6, ancho: 0.95, sonr: 0.7 }),
    sonrie: E({ mx: -0.7, my: 0.2, c: 0.5, h: 0.6, sd: 12, si: 12, abre: 4, ancho: 1, sonr: 0.9 })
  };
  const GUION_CARA_G = [
    [T.ojoG, T.ojoG + 0.2, "mando"], [T.miran + 0.05, T.miran + 0.22, "reto"], [T.lanzaG - 0.04, T.lanzaG + 0.06, "lanza"],
    [T.palmada, T.palmada + 0.08, "pasmo"], [T.puno - 0.05, T.puno + 0.15, "rabia"], [T.frente - 0.04, T.frente + 0.1, "lucha"],
    [T.ofrece - 0.06, T.ofrece + 0.06, "ve"], [T.tira0, T.tira0 + 0.2, "fuerza"], [T.suelta, T.suelta + 0.06, "susto"],
    [T.ven, T.ven + 0.15, "arriba"], [T.choque, T.choque + 0.05, "mareo"], [T.pelea - 0.05, T.pelea + 0.15, "enfado"],
    [T.congela + 0.08, T.miranTele, "pasmo2"], [T.absortos - 0.2, T.absortos + 0.4, "embobado"],
    [T.camara + 0.05, T.camara + 0.22, "camara"], [T.guino - 0.05, T.guino + 0.15, "sonrie"], [T.vuelven, T.vuelven + 0.25, "embobado"]
  ];
  const PARP_G = [0.9, 1.6, 2.98, 4.6, 5.1, 7.12, 9.4, 11.3, 12.4, 13.6];

  /* ---------- la tele: canal y fase de la pelota de los dibujos ---------- */
  const pelotaDibujos = t => { const v = Math.max(0, t - T.dibujos);
    return { x: Math.sin(v * TAU / 2.6), bote: Math.abs(Math.sin(v * TAU / 1.3)), v }; };
  // ladeo de cabeza al ritmo de la pelota (los dos a la vez)
  const ladeo = t => { const pd = pelotaDibujos(t); return tramo(t, T.absortos - 0.2, T.absortos + 0.6) * (0.13 * pd.x) * (1 - 0.6 * dentro(t, T.camara - 0.05, T.camara + 0.2, T.vuelven, T.vuelven + 0.3)); };

  /* ---------- pose completa de cada uno ---------- */
  function construye(I, c, t) {
    const M = { W: { x: c.x, y: c.y }, phi: c.phi, sx: c.sx };
    const respira = Math.sin(t * 2.2 + (I === IG ? 0 : 1.3));
    const p = { x: 0, suelo: 0, s: S, tirasLimpias: true, M,
      pelvis: { x: I.PEL.x, y: I.PEL.y }, torso: c.torso, torsoEsc: { x: 1, y: 1 + 0.005 * respira },
      cabeza: { ang: c.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, piernas: {} };
    // cabezazo: las dos cabezas se aplastan un instante
    const ap = campana(t, T.choque - 0.03, T.choque + 0.1);
    p.cabeza.esc = { x: 1 - 0.13 * ap, y: 1 + 0.06 * ap };
    for (const [lado, q] of [["cerca", c.pc], ["lejos", c.pl]]) p.piernas[lado] = { tob: aHoja(I, M, q), ang: q.a };
    return p;
  }

  let PB = null, PG = null;                 // poses del fotograma (para tocarse)
  function poseB(t) {
    const c = cuerpo(CUERPO_B, t), p = construye(IB, c, t);
    const e = guion(GUION_CARA_B, CARAS_B, "tele", t);
    // risilla al pillar el mando: cejas arriba y abajo
    const cj = dentro(t, T.agarra + 0.3, T.agarra + 0.36, T.pasa1 + 0.1, T.pasa1 + 0.2);
    e.sd += 12 * cj * Math.max(0, Math.sin((t - T.agarra) * 4 * Math.PI)); e.si += 12 * cj * Math.max(0, Math.sin((t - T.agarra) * 4 * Math.PI));
    p.cara = cara(e, parpadeo(t, PARP_B));
    p.cabeza.ang += ladeo(t) - 0.02 * campana(t, T.agarra + 0.3, T.pasa1 + 0.1) * Math.sin(t * 20);
    const fz = dentro(t, T.tira0, T.tira0 + 0.3, T.suelta - 0.05, T.suelta + 0.05);
    p.rojo = 0.6 * fz; p.sudor = 0.8 * dentro(t, T.tiraB, T.tiraB + 0.3, T.suelta, T.suelta + 0.2);
    p.chichon = tramo(t, T.choque + 0.02, T.choque + 0.25) * 0.55;
    p.enfado = 0.6 * dentro(t, T.pelea, T.pelea + 0.12, T.miranTele, T.miranTele + 0.2);
    return p;
  }
  function poseG(t) {
    const c = cuerpo(CUERPO_G, t), p = construye(IG, c, t);
    const e = guion(GUION_CARA_G, CARAS_G, "tele", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.cabeza.ang += ladeo(t);
    const fz = dentro(t, T.tira0, T.tira0 + 0.3, T.suelta - 0.05, T.suelta + 0.05);
    p.rojo = Math.max(0.6 * fz, 0.35 * dentro(t, T.puno, T.puno + 0.1, T.burla, T.burla + 0.2));
    p.sudor = Math.max(0.8 * dentro(t, T.tiraB, T.tiraB + 0.3, T.suelta, T.suelta + 0.2), 0.6 * dentro(t, T.salto1, T.salto1 + 0.2, T.burla, T.burla + 0.2));
    p.enfado = Math.max(0.7 * dentro(t, T.puno, T.puno + 0.15, T.frente + 0.5, T.burla), 0.6 * dentro(t, T.pelea, T.pelea + 0.12, T.miranTele, T.miranTele + 0.2));
    p.chichon = tramo(t, T.choque + 0.02, T.choque + 0.25) * 0.55;
    return p;
  }

  /* ---------- manos de Gabacho ---------- */
  const frenteG = () => deCabeza(IG, PG, { x: 905, y: 400 });          // frente de Guillermo (retrato → mundo)
  const camisetaB = () => aMundo(IB, PB.M, IB.rig.tronco(PB)({ x: 330, y: 470 }));    // pecho de Gabacho
  const PISTA_BL = [            // mano lejana (delante, hacia la derecha)
    [0, 0, { en: enP(IB, { x: 170, y: -46 }), dedos: MUSLO }],
    [T.lanzaB, T.agarra, { en: enW(IB, { x: MANDO_COJIN.x - 12, y: MANDO_COJIN.y - 6 }), dedos: AGARRA, mx: 0.2 }, salida],
    [T.agarra + 0.03, T.pasa, { en: enH(IB, "l", { x: 30, y: 52 }), dedos: AGARRA, mx: 0.1 }, salida],
    [T.pasa + 0.02, T.pasa1, { en: enH(IB, "l", { x: 46, y: 64 }), dedos: AGARRA, mx: 0.1 }],
    [T.pasa1 + 0.04, T.arriba + 0.12, { en: enP(IB, { x: 170, y: -46 }), dedos: MUSLO }],
    [T.subeB, T.depieB, { en: enH(IB, "l", { x: 40, y: 80 }), dedos: RELAJ }],
    [T.frente - 0.1, T.frente, { en: enW(IB, () => { const f = frenteG(); return { x: f.x - 4, y: f.y - 2 }; }), dedos: PALMA, mx: -0.2 }, salida],
    [T.burla + 0.02, T.pasa2, { en: enH(IB, "l", { x: 40, y: 66 }), dedos: AGARRA, mx: 0.15 }],
    [T.pasa2 + 0.04, T.ofrece + 0.08, { en: enW(IB, (p, t) => { const s = tiraY(T.pilla + 0.02), w = 1 - tramo(t, T.pilla - 0.12, T.pilla);
      return { x: s.x - AGARRE + 6 * w * Math.sin(t * 26), y: s.y + 4 * w * Math.cos(t * 26) }; }), dedos: AGARRA, mx: 0.2 }],
    [T.pilla - 0.04, T.pilla + 0.02, { en: enW(IB, () => { const s = tiraY(T.pilla + 0.02); return { x: s.x - AGARRE, y: s.y }; }), dedos: TIRA, mx: 0.25 }],
    [T.pilla + 0.02, T.pilla + 0.04, { en: enW(IB, (p, t) => { const s = tiraY(t); return { x: s.x - AGARRE, y: s.y }; }), dedos: TIRA, mx: 0.25 }],
    [T.suelta, T.suelta + 0.12, { en: enH(IB, "l", { x: 84, y: -30 }), dedos: ABIERTA }, salida],
    [T.suelta + 0.14, T.recupera, { en: con(enH(IB, "l", { x: 70, y: -10 }), molinete(2.6, 22, 1)), dedos: ABIERTA }],
    [T.agacha, T.salto, { en: enH(IB, "l", { x: -26, y: 84 }), dedos: RELAJ }],
    [T.salto, T.choque, { en: enH(IB, "l", { x: -40, y: 74 }), dedos: ABIERTA, mx: -0.1 }, salida],
    [T.choque + 0.05, T.choque + 0.17, { en: enH(IB, "l", { x: 92, y: 30 }), dedos: ABIERTA }, salida],
    [T.choque + 0.2, T.caeB, { en: enH(IB, "l", { x: 70, y: 50 }), dedos: ABIERTA }],
    // en el montón: le aparta la cara a Guillermo
    [T.pelea - 0.08, T.pelea + 0.14, { en: enW(IB, () => { const f = deCabeza(IG, PG, { x: 860, y: 330 }); return { x: f.x - 6, y: f.y }; }), dedos: PALMA, mx: -0.3 }, salida],
    [T.sueltan + 0.1, T.sueltan1 + 0.2, { en: enP(IB, { x: 172, y: -44 }), dedos: MUSLO }],
    // pulgar arriba a cámara (antebrazo horizontal)
    [T.guino - 0.18, T.guino + 0.05, { en: enH(IB, "l", { x: 82, y: 30 }), dedos: Dd(1, 0.04, 0.03, 0.03, 0.03), mx: 0.15 }],
    [T.vuelven + 0.05, T.vuelven + 0.4, { en: enP(IB, { x: 172, y: -44 }), dedos: MUSLO }]
  ];
  const PISTA_BC = [            // mano cercana (detrás, hacia la izquierda)
    [0, 0, { en: enP(IB, { x: 40, y: -40 }), dedos: MUSLO }],
    [T.pasa, T.pasa1, { en: enH(IB, "l", { x: 40, y: 62 }), dedos: AGARRA, mx: 0.2 }],
    [T.pasa1 + 0.02, T.arriba, { en: enH(IB, "c", { x: -74, y: -66 }), dedos: AGARRA, mx: 0 }, salida],
    // lo menea en lo alto (burla)
    [T.arriba + 0.05, T.arriba + 0.2, { en: con(enH(IB, "c", { x: -74, y: -66 }), (p, t) => ({ x: 6 * Math.sin(t * 9), y: 5 * Math.sin(t * 13) })), dedos: AGARRA }],
    [T.burla, T.pasa2, { en: enH(IB, "l", { x: 30, y: 72 }), dedos: AGARRA, mx: 0.2 }],
    [T.pasa2 + 0.06, T.ofrece + 0.1, { en: enP(IB, { x: 40, y: -40 }), dedos: MUSLO }],
    // tira y afloja: brazo de atrás para equilibrar
    [T.pilla, T.tira0 + 0.2, { en: con(enH(IB, "c", { x: -84, y: 20 }), (p, t) => ({ x: 8 * Math.sin(t * 7), y: 10 * Math.sin(t * 5.3) })), dedos: ABIERTA }],
    [T.suelta, T.suelta + 0.1, { en: con(enH(IB, "c", { x: -60, y: -40 }), molinete(2.8, 30)), dedos: ABIERTA }],
    [T.agacha, T.salto, { en: enH(IB, "c", { x: -50, y: 70 }), dedos: RELAJ }],
    [T.salto, T.choque, { en: enH(IB, "c", { x: -84, y: 10 }), dedos: ABIERTA }, salida],
    [T.choque + 0.1, T.caeB, { en: enH(IB, "c", { x: -80, y: 30 }), dedos: ABIERTA }],
    [T.caeB + 0.05, T.quieto, { en: enP(IB, { x: 60, y: -40 }), dedos: MUSLO }]
  ];
  function manosB(p, t) {
    p.manoLejos = manoDe(IB, p, "l", pista(PISTA_BL, p, t));
    p.manoCerca = manoDe(IB, p, "c", pista(PISTA_BC, p, t));
    // el mando: en la mano lejana (lo pilla), en la cercana (arriba, burla) y otra vez en la lejana (lo enseña)
    if (t >= T.agarra && t < T.pilla) {
      const enCerca = t >= T.pasa1 - 0.06 && t < T.pasa2 + 0.04;
      const m = enCerca ? p.manoCerca : p.manoLejos;
      const k = enCerca ? 0 : tramo(t, T.ofrece - 0.06, T.ofrece + 0.12);
      const aCerca = lerp(lerp(0.15, -0.5, tramo(t, T.pasa1, T.arriba)), 0.15, tramo(t, T.burla, T.pasa2));
      const dCerca = lerp(lerp(8, 4, tramo(t, T.pasa1, T.arriba)), 8, tramo(t, T.burla, T.pasa2));
      m.objeto = mandoEnMano(m, enCerca ? aCerca : lerp(0.15, 0, k), enCerca ? dCerca : lerp(8, AGARRE, k));
      if (enCerca) p.manoCerca.detras = t > T.pasa1 + 0.1 && t < T.burla + 0.12;
    }
  }

  /* ---------- manos de Guillermo ---------- */
  const PISTA_GL = [            // mano lejana (delante: derecha sentado; izquierda de pie)
    [0, 0, { en: enP(IG, { x: 165, y: -55 }), dedos: MUSLO }],
    [T.sube, T.gira0, { en: enH(IG, "l", { x: 40, y: 70 }), dedos: PUNO }],
    // molinetes delante (aguantado por la frente)
    [T.depie - 0.05, T.frente, { en: con(enH(IG, "l", { x: 44, y: 34 }), molinete(3.1, 26)), dedos: PUNO }],
    // le suelta: la mano a por el mando
    [T.burla + 0.04, T.ofrece, { en: enH(IG, "l", { x: 66, y: 40 }), dedos: ABIERTA }],
    [T.ofrece + 0.04, T.pilla, { en: enW(IG, () => { const s = tiraY(T.pilla + 0.02); return { x: s.x + AGARRE, y: s.y }; }), dedos: TIRA, mx: 0.25 }, salida],
    [T.pilla, T.pilla + 0.04, { en: enW(IG, (p, t) => { const s = tiraY(t); return { x: s.x + AGARRE, y: s.y }; }), dedos: TIRA, mx: 0.25 }],
    [T.suelta, T.suelta + 0.12, { en: enH(IG, "l", { x: 84, y: -30 }), dedos: ABIERTA }, salida],
    [T.suelta + 0.14, T.recupera, { en: con(enH(IG, "l", { x: 66, y: -10 }), molinete(2.6, 22, 2)), dedos: ABIERTA }],
    [T.agacha, T.salto, { en: enH(IG, "l", { x: -26, y: 80 }), dedos: RELAJ }],
    [T.salto, T.choque, { en: enH(IG, "l", { x: -40, y: 70 }), dedos: ABIERTA, mx: -0.1 }, salida],
    [T.choque + 0.05, T.choque + 0.17, { en: enH(IG, "l", { x: 84, y: 30 }), dedos: ABIERTA }, salida],
    [T.choque + 0.2, T.caeG, { en: enH(IG, "l", { x: 70, y: 40 }), dedos: ABIERTA }],
    // en el montón: le agarra la camiseta a Gabacho
    [T.pelea - 0.05, T.pelea + 0.15, { en: enW(IG, () => camisetaB()), dedos: GARRA, mx: 0.2 }, salida],
    [T.sueltan, T.sueltan1, { en: enW(IG, (p, t) => ({ x: 648 + 2 * Math.sin(t * 1.9), y: 462 })), dedos: RELAJ, mx: 0 }]
  ];
  const PISTA_GC = [            // mano cercana (detrás)
    [0, 0, { en: enP(IG, { x: 42, y: -42 }), dedos: MUSLO }],
    [T.lanzaG, T.palmada, { en: enW(IG, { x: 548, y: COJIN - 8 }), dedos: PALMA, mx: 0.1, ang: 0 }, salida],
    [T.puno - 0.04, T.puno + 0.08, { en: enW(IG, { x: 550, y: COJIN - 9 }), dedos: PUNO, mx: 0.1 }],
    [T.sube, T.gira0, { en: enH(IG, "c", { x: -30, y: 80 }), dedos: PUNO }],
    [T.depie - 0.05, T.frente, { en: con(enH(IG, "c", { x: -20, y: 10 }), molinete(3.1, 30, Math.PI)), dedos: PUNO }],
    [T.burla + 0.04, T.ofrece, { en: enH(IG, "c", { x: -14, y: 92 }), dedos: RELAJ }],
    [T.pilla, T.tira0 + 0.2, { en: con(enH(IG, "c", { x: -84, y: 20 }), (p, t) => ({ x: 8 * Math.sin(t * 7.4 + 1), y: 10 * Math.sin(t * 5.9) })), dedos: ABIERTA }],
    [T.suelta, T.suelta + 0.1, { en: con(enH(IG, "c", { x: -60, y: -40 }), molinete(2.8, 30, 1)), dedos: ABIERTA }],
    [T.agacha, T.salto, { en: enH(IG, "c", { x: -50, y: 70 }), dedos: RELAJ }],
    [T.salto, T.choque, { en: enH(IG, "c", { x: -84, y: 10 }), dedos: ABIERTA }, salida],
    [T.choque + 0.1, T.caeG, { en: enH(IG, "c", { x: -80, y: 30 }), dedos: ABIERTA }],
    [T.caeG + 0.05, T.quieto, { en: (p, t) => G.tronco(p)({ x: 300, y: 600 }), dedos: RELAJ }]
  ];
  function manosG(p, t) {
    p.manoLejos = manoDe(IG, p, "l", pista(PISTA_GL, p, t));
    p.manoCerca = manoDe(IG, p, "c", pista(PISTA_GC, p, t));
  }

  function pose(t) {
    // Gabacho mira la frente de Guillermo, y Guillermo la camiseta de Gabacho: se calcula primero el que no depende
    const pg = poseG(t), pb = poseB(t);
    PG = pg; PB = pb; manosG(pg, t); manosB(pb, t);
    return { g: pg, b: pb };
  }

  /* =====================================================================================
   * FONDO (una vez): pared, zócalo, lámina, balda con copa, lámpara, mesita, suelo, alfombra, sofá y mueble de la tele
   * ===================================================================================== */
  const MG = 120;                 // margen del fondo (la cámara se abre un poco)
  const MOS = "#d99f34", MOS_OSC = "#a7731d", MOS_LUZ = "#efc35e";
  const TVP = { tl: { x: 868, y: 350 }, tr: { x: 994, y: 336 }, br: { x: 994, y: 466 }, bl: { x: 868, y: 452 } };
  const PANT = { tl: { x: 875, y: 357 }, tr: { x: 987, y: 344 }, br: { x: 987, y: 457 }, bl: { x: 875, y: 444 } };
  let fondo = null;
  function pana(g, x0, y0, x1, y1, paso = 7) {      // rayas de la pana
    g.save(); g.strokeStyle = "rgba(110,70,10,0.22)"; g.lineWidth = 2;
    for (let x = x0 + 3; x < x1; x += paso) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    g.strokeStyle = "rgba(255,230,160,0.14)"; g.lineWidth = 1;
    for (let x = x0 + 6; x < x1; x += paso) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 2 * MG; c.height = H + 2 * MG;
    const g = c.getContext("2d"); g.translate(MG, MG); g.lineJoin = "round"; g.lineCap = "round";
    // pared verde salvia con un estampado suave
    const pa = g.createLinearGradient(0, -MG, 0, 470); pa.addColorStop(0, "#8ea488"); pa.addColorStop(1, "#9db293");
    g.fillStyle = pa; g.fillRect(-MG, -MG, W + 2 * MG, 470 + MG);
    g.fillStyle = "rgba(255,255,240,0.06)";
    for (let y = -MG + 20, f = 0; y < 360; y += 40, f++) for (let x = -MG + (f % 2) * 30; x < W + MG; x += 60) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
    // zócalo de madera con moldura
    g.fillStyle = "#6f8466"; g.fillRect(-MG, 360, W + 2 * MG, 110);
    g.fillStyle = "#e6dcc4"; g.fillRect(-MG, 354, W + 2 * MG, 9); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(-MG, 354, W + 2 * MG, 9);
    g.strokeStyle = "rgba(40,55,35,0.45)"; g.lineWidth = 2;
    for (let x = -MG + 30; x < W + MG; x += 92) { g.strokeRect(x, 378, 72, 78); }
    g.strokeStyle = "rgba(220,235,210,0.18)"; for (let x = -MG + 32; x < W + MG; x += 92) { g.beginPath(); g.moveTo(x, 380); g.lineTo(x + 70, 380); g.stroke(); }
    // lámina enmarcada: un balón sobre el césped (sin letras)
    g.save(); g.translate(318, 120);
    g.fillStyle = "#f2ead6"; g.fillRect(-6, -6, 132, 162); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.strokeRect(-6, -6, 132, 162);
    g.fillStyle = "#3a2a1c"; g.fillRect(-12, -12, 144, 6); g.fillRect(-12, 156, 144, 6); g.fillRect(-12, -12, 6, 174); g.fillRect(126, -12, 6, 174);
    const lc = g.createLinearGradient(0, 0, 0, 150); lc.addColorStop(0, "#f39b6a"); lc.addColorStop(1, "#f6d08a"); g.fillStyle = lc; g.fillRect(4, 4, 112, 142);
    g.fillStyle = "#4e9a54"; g.beginPath(); g.moveTo(4, 110); g.quadraticCurveTo(60, 92, 116, 104); g.lineTo(116, 146); g.lineTo(4, 146); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(20, 140); g.lineTo(60, 112); g.lineTo(104, 138); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(60, 70, 26, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#1b1b22"; g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; const x = 60 + Math.cos(a) * 9, y = 70 + Math.sin(a) * 9; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fill();
    g.lineWidth = 1.4; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; g.beginPath(); g.moveTo(60 + Math.cos(a) * 9, 70 + Math.sin(a) * 9); g.lineTo(60 + Math.cos(a) * 26, 70 + Math.sin(a) * 26); g.stroke(); }
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(26 - i * 6, 52 + i * 12); g.lineTo(8 - i * 2, 56 + i * 12); g.stroke(); }
    g.restore();
    // lámina pequeña: arcos de colores
    g.save(); g.translate(560, 150);
    g.fillStyle = "#3a2a1c"; g.fillRect(-8, -8, 136, 96); g.fillStyle = "#efe6d2"; g.fillRect(-2, -2, 124, 84);
    for (const [r, col] of [[46, "#e2734a"], [34, "#f2b84b"], [22, "#5a8fb8"]]) { g.fillStyle = col; g.beginPath(); g.arc(60, 76, r, Math.PI, 0); g.closePath(); g.fill(); }
    g.fillStyle = "#c94f3a"; g.beginPath(); g.arc(96, 22, 9, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-8, -8, 136, 96);
    g.restore();
    // balda con la copa (encima de la tele)
    g.save();
    g.fillStyle = "#7a5233"; g.fillRect(850, 238, 160, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(850, 238, 160, 9);
    g.fillStyle = "#5e3c22"; g.fillRect(866, 247, 7, 12); g.fillRect(988, 247, 7, 12);
    const oro = g.createLinearGradient(910, 0, 950, 0); oro.addColorStop(0, "#c8902a"); oro.addColorStop(0.45, "#ffe08a"); oro.addColorStop(1, "#b07a1e");
    g.fillStyle = oro; g.beginPath(); g.moveTo(912, 178); g.lineTo(948, 178); g.quadraticCurveTo(948, 208, 934, 212); g.lineTo(934, 222); g.lineTo(942, 230); g.lineTo(918, 230); g.lineTo(926, 222); g.lineTo(926, 212); g.quadraticCurveTo(912, 208, 912, 178); g.closePath(); g.fill(); g.lineWidth = 1.8; g.stroke();
    g.beginPath(); g.arc(912, 192, 8, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.beginPath(); g.arc(948, 192, 8, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
    g.fillStyle = "#3a2a1c"; g.fillRect(914, 230, 32, 8); g.strokeRect(914, 230, 32, 8);
    for (const [x, h, col] of [[970, 34, "#c0453a"], [981, 30, "#3d6fa8"], [992, 36, "#e0b84a"]]) { g.fillStyle = col; g.fillRect(x, 238 - h, 10, h); g.strokeRect(x, 238 - h, 10, h); }
    g.fillStyle = "#c2683d"; g.beginPath(); g.moveTo(866, 238); g.lineTo(886, 238); g.lineTo(889, 222); g.lineTo(863, 222); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4f9a5a"; for (let i = 0; i < 6; i++) { g.save(); g.translate(876, 222); g.rotate((i - 2.5) * 0.45); g.beginPath(); g.ellipse(0, -12, 4, 12, 0, 0, TAU); g.fill(); g.lineWidth = 1.2; g.stroke(); g.restore(); }
    g.restore();
    // suelo de tarima
    g.fillStyle = "#e6dcc4"; g.fillRect(-MG, 462, W + 2 * MG, 12); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-MG, 462); g.lineTo(W + MG, 462); g.stroke();
    const su = g.createLinearGradient(0, 474, 0, H + MG); su.addColorStop(0, "#6a4228"); su.addColorStop(1, "#8c5a36");
    g.fillStyle = su; g.fillRect(-MG, 474, W + 2 * MG, H + MG - 474);
    g.strokeStyle = "rgba(40,20,8,0.35)"; g.lineWidth = 1.5;
    for (let i = -16; i <= 16; i++) { g.beginPath(); g.moveTo(512 + i * 36, 474); g.lineTo(512 + i * 96, H + MG); g.stroke(); }
    for (const y of [494, 522, 560, 610, 670]) { g.beginPath(); g.moveTo(-MG, y); g.lineTo(W + MG, y); g.stroke(); }
    // alfombra de rayas
    const RA = [{ x: 170, y: 520 }, { x: 860, y: 520 }, { x: 980, y: 680 }, { x: 40, y: 680 }];
    const rutaR = k => { const c0 = { x: 512, y: 600 }; g.beginPath(); RA.forEach((q, i) => { const x = lerp(c0.x, q.x, k), y = lerp(c0.y, q.y, k); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.fillStyle = "#2f4466"; rutaR(1); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.save(); rutaR(1); g.clip(); g.fillStyle = "#e9dcc0"; for (let k = 0; k < 9; k++) { const y = 528 + k * 20; g.fillRect(-MG, y, W + 2 * MG, 7); } g.restore();
    g.strokeStyle = "#c9573e"; g.lineWidth = 6; rutaR(0.92); g.stroke();
    // lámpara de pie (izquierda)
    g.save(); g.fillStyle = "#3a2f28"; g.beginPath(); g.ellipse(86, 558, 30, 8, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "#c9a45a"; g.lineWidth = 6; g.beginPath(); g.moveTo(86, 554); g.lineTo(86, 196); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.moveTo(83, 554); g.lineTo(83, 196); g.moveTo(89, 554); g.lineTo(89, 196); g.stroke();
    const pan = g.createLinearGradient(0, 126, 0, 204); pan.addColorStop(0, "#fff2cf"); pan.addColorStop(1, "#ffd99a");
    g.fillStyle = pan; g.beginPath(); g.moveTo(54, 126); g.lineTo(118, 126); g.lineTo(140, 204); g.lineTo(32, 204); g.closePath(); g.fill(); g.lineWidth = 2.4; g.stroke();
    g.strokeStyle = "rgba(160,110,50,0.35)"; g.lineWidth = 1.5; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(54 + k * 10.7, 128); g.lineTo(32 + k * 18, 202); g.stroke(); }
    g.restore();
    // mesita con el cuenco de patatas
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2;
    g.fillStyle = "#5a3a22"; g.fillRect(186, 452, 8, 100); g.strokeRect(186, 452, 8, 100);
    g.beginPath(); g.ellipse(190, 552, 22, 6, 0, 0, TAU); g.fillStyle = "#4a2f1b"; g.fill(); g.stroke();
    g.fillStyle = "#6e4628"; g.fillRect(146, 446, 88, 8); g.strokeRect(146, 446, 88, 8);
    g.beginPath(); g.ellipse(190, 446, 44, 10, 0, 0, TAU); g.fillStyle = "#9c6a3f"; g.fill(); g.stroke();
    g.fillStyle = "#3f7fb8"; g.beginPath(); g.moveTo(166, 432); g.quadraticCurveTo(170, 446, 190, 446); g.quadraticCurveTo(210, 446, 214, 432); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f2c35a"; for (let i = 0; i < 8; i++) { const x = 170 + i * 5.5, y = 431 - 5 * Math.sin(i * 0.4 + 0.3) * (i % 3 === 0 ? 1.4 : 1); g.save(); g.translate(x, y); g.rotate(i * 0.7); g.beginPath(); g.ellipse(0, 0, 6, 3.5, 0, 0, TAU); g.fill(); g.lineWidth = 1; g.stroke(); g.restore(); }
    g.beginPath(); g.ellipse(190, 432, 24, 5, 0, 0, TAU); g.lineWidth = 1.6; g.stroke();
    g.restore();
    // mueble de la tele y la tele (marco; la pantalla se pinta cada fotograma)
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.fillStyle = "#6b4329"; g.fillRect(846, 476, 166, 62); g.strokeRect(846, 476, 166, 62);
    g.fillStyle = "#8a5a36"; g.fillRect(840, 466, 178, 11); g.strokeRect(840, 466, 178, 11);
    g.strokeStyle = "rgba(20,10,4,0.55)"; g.lineWidth = 1.6; g.strokeRect(856, 486, 70, 44); g.strokeRect(932, 486, 70, 44);
    g.fillStyle = "#c9a45a"; g.beginPath(); g.arc(918, 508, 2.6, 0, TAU); g.fill(); g.beginPath(); g.arc(940, 508, 2.6, 0, TAU); g.fill();
    g.fillStyle = "#3a2414"; g.strokeStyle = TINTA; for (const x of [852, 1006]) { g.fillRect(x - 3, 538, 6, 16); g.strokeRect(x - 3, 538, 6, 16); }
    // pie de la tele
    g.fillStyle = "#1c1d22"; g.beginPath(); g.moveTo(920, 458); g.lineTo(944, 456); g.lineTo(948, 466); g.lineTo(914, 466); g.closePath(); g.fill(); g.stroke();
    // canto (lado derecho, visto de tres cuartos) y marco
    g.fillStyle = "#2a2b31"; g.beginPath(); g.moveTo(TVP.tr.x, TVP.tr.y); g.lineTo(TVP.tr.x + 9, TVP.tr.y + 4); g.lineTo(TVP.br.x + 9, TVP.br.y - 4); g.lineTo(TVP.br.x, TVP.br.y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#15161b"; g.beginPath(); g.moveTo(TVP.tl.x, TVP.tl.y); g.lineTo(TVP.tr.x, TVP.tr.y); g.lineTo(TVP.br.x, TVP.br.y); g.lineTo(TVP.bl.x, TVP.bl.y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e04a3c"; g.beginPath(); g.arc(983, 461, 1.6, 0, TAU); g.fill();
    g.restore();
    // planta grande entre el sofá y la tele
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2;
    g.fillStyle = "#d9cdb4"; g.beginPath(); g.moveTo(802, 556); g.lineTo(838, 556); g.lineTo(844, 512); g.lineTo(796, 512); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#3f8a52";
    for (let i = 0; i < 9; i++) { const a = (i - 4) * 0.3; g.save(); g.translate(820, 512); g.rotate(a);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(13, -40, 0, -84 - (i % 3) * 16); g.quadraticCurveTo(-13, -40, 0, 0); g.fill(); g.lineWidth = 1.8; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -72); g.stroke(); g.strokeStyle = TINTA; g.restore(); }
    g.restore();
    // sombra del sofá en el suelo
    g.fillStyle = "rgba(20,8,4,0.28)"; g.beginPath(); g.ellipse(519, 548, 300, 9, 0, 0, TAU); g.fill();
    // sofá: respaldo, cojines del respaldo, brazos y base (los cojines del asiento se pintan cada fotograma)
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.6;
    g.fillStyle = MOS_OSC; g.beginPath(); g.moveTo(SOFA.x0 + 14, 480); g.lineTo(SOFA.x0 + 14, SOFA.respaldo + 24); g.quadraticCurveTo(SOFA.x0 + 14, SOFA.respaldo, SOFA.x0 + 44, SOFA.respaldo);
    g.lineTo(SOFA.x1 - 44, SOFA.respaldo); g.quadraticCurveTo(SOFA.x1 - 14, SOFA.respaldo, SOFA.x1 - 14, SOFA.respaldo + 24); g.lineTo(SOFA.x1 - 14, 480); g.closePath(); g.fill(); g.stroke();
    for (const [x0, x1] of [[SI0 - 6, SOFA.mitad + 2], [SOFA.mitad - 2, SI1 + 6]]) {
      const cj = g.createLinearGradient(0, SOFA.respaldo, 0, 466); cj.addColorStop(0, MOS_LUZ); cj.addColorStop(1, MOS);
      g.fillStyle = cj; g.beginPath(); g.moveTo(x0 + 18, SOFA.respaldo + 14); g.quadraticCurveTo((x0 + x1) / 2, SOFA.respaldo + 4, x1 - 18, SOFA.respaldo + 14); g.quadraticCurveTo(x1, SOFA.respaldo + 16, x1 - 2, SOFA.respaldo + 36);
      g.lineTo(x1 - 4, 466); g.lineTo(x0 + 4, 466); g.lineTo(x0 + 2, SOFA.respaldo + 36); g.quadraticCurveTo(x0, SOFA.respaldo + 16, x0 + 18, SOFA.respaldo + 14); g.closePath(); g.fill();
      g.save(); g.clip(); pana(g, x0, SOFA.respaldo, x1, 470); g.restore(); g.stroke();
      g.strokeStyle = "rgba(110,70,10,0.4)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 30, SOFA.respaldo + 34); g.quadraticCurveTo((x0 + x1) / 2, SOFA.respaldo + 46, x1 - 30, SOFA.respaldo + 34); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 2.6;
    }
    // brazos
    for (const [x0, x1, s] of [[SOFA.x0, SI0 + 2, 1], [SI1 - 2, SOFA.x1, -1]]) {
      const br = g.createLinearGradient(x0, 0, x1, 0); br.addColorStop(0, s > 0 ? MOS_OSC : MOS); br.addColorStop(1, s > 0 ? MOS : MOS_OSC);
      g.fillStyle = br; g.beginPath(); g.moveTo(x0 + 4, SOFA.base); g.lineTo(x0, SOFA.brazo + 18); g.quadraticCurveTo(x0, SOFA.brazo - 6, (x0 + x1) / 2, SOFA.brazo - 8);
      g.quadraticCurveTo(x1, SOFA.brazo - 6, x1, SOFA.brazo + 18); g.lineTo(x1 - 4, SOFA.base); g.closePath(); g.fill();
      g.save(); g.clip(); pana(g, x0, SOFA.brazo - 10, x1, SOFA.base, 6); g.restore(); g.stroke();
      g.fillStyle = MOS_LUZ; g.beginPath(); g.ellipse((x0 + x1) / 2, SOFA.brazo + 12, 27, 15, 0, 0, TAU); g.fill(); g.stroke();
      g.strokeStyle = "rgba(110,70,10,0.5)"; g.lineWidth = 2.2; g.beginPath(); g.ellipse((x0 + x1) / 2, SOFA.brazo + 12, 14, 8, 0, 0, TAU); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 2.6;
    }
    // base bajo los cojines y patas
    g.fillStyle = MOS_OSC; g.beginPath(); g.rect(SI0 - 4, SOFA.frente - 2, SI1 - SI0 + 8, SOFA.base - SOFA.frente + 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.16)"; g.fillRect(SI0 - 2, SOFA.base - 14, SI1 - SI0 + 4, 12);
    g.fillStyle = "#3a2414";
    for (const x of [SOFA.x0 + 16, SI0 + 10, SI1 - 10, SOFA.x1 - 16]) { g.beginPath(); g.moveTo(x - 6, SOFA.base); g.lineTo(x + 6, SOFA.base); g.lineTo(x + 3, 548); g.lineTo(x - 3, 548); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
    return c;
  }

  /* ---------- cojines del asiento (se hunden con lo que tengan encima) ---------- */
  function cojines(g, t, pg, pb) {
    const hund = [];
    const sentB0 = 1 - tramo(t, T.subeB, T.subeB + 0.2), sentG0 = 1 - tramo(t, T.sube, T.gira0 + 0.1);
    if (sentB0 > 0) hund.push([pb.M.W.x - 6, 70, 9 * sentB0]);
    if (sentG0 > 0) hund.push([pg.M.W.x - 6, 70, 9 * sentG0]);
    // pies encima de los cojines
    const deP = (pp, I) => { for (const q of [pp.piernas.cerca, pp.piernas.lejos]) { const w = aMundo(I, pp.M, q.tob), alto = SUP - I.tob - w.y; if (alto < 30 && w.x > SI0 && w.x < SI1) hund.push([w.x + 4, 34, 8 * clamp(1 - alto / 30)]); } };
    if (t > T.subeB + 0.1 && t < T.choque) deP(pb, IB);
    if (t > T.gira0 && t < T.choque) deP(pg, IG);
    // el montón
    const pila = tramo(t, T.caeG - 0.04, T.caeG + 0.06);
    if (pila > 0) { hund.push([470, 150, 10 * pila]); hund.push([B_PILA.x, 70, 7 * tramo(t, T.caeB - 0.03, T.caeB + 0.06)]); }
    const dy = x => { let d = 0; for (const [cx, w, pr] of hund) { const u = (x - cx) / w; if (Math.abs(u) < 1) d += pr * (1 + Math.cos(Math.PI * u)) / 2; } return Math.min(d, 18); };
    for (const [x0, x1] of [[SI0, SOFA.mitad], [SOFA.mitad, SI1]]) {
      g.save(); g.lineJoin = "round";
      const top = []; for (let x = x0 + 4; x <= x1 - 4; x += 8) top.push({ x, y: COJIN - 8 + dy(x) * 0.6 });
      const front = []; for (let x = x0; x <= x1; x += 8) front.push({ x, y: COJIN + 4 + dy(x) });
      g.beginPath(); g.moveTo(x0 + 6, COJIN - 4);
      for (const q of top) g.lineTo(q.x, q.y);
      g.quadraticCurveTo(x1 + 2, COJIN - 4, x1, COJIN + 8); g.lineTo(x1 - 2, SOFA.frente + 2); g.lineTo(x0 + 2, SOFA.frente + 2); g.lineTo(x0, COJIN + 8);
      g.quadraticCurveTo(x0 - 2, COJIN - 4, x0 + 6, COJIN - 4); g.closePath();
      const gr = g.createLinearGradient(0, COJIN - 10, 0, SOFA.frente); gr.addColorStop(0, MOS_LUZ); gr.addColorStop(0.32, MOS); gr.addColorStop(1, MOS_OSC);
      g.fillStyle = gr; g.fill();
      g.save(); g.clip(); pana(g, x0, COJIN - 12, x1, SOFA.frente + 2); g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 2.6; g.stroke();
      g.beginPath(); front.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)));
      g.strokeStyle = "rgba(110,62,8,0.6)"; g.lineWidth = 3; g.stroke();
      g.restore();
    }
  }

  /* ---------- la tele: el partido, la estática y los dibujos ---------- */
  function rutaPantalla(g) { g.beginPath(); g.moveTo(PANT.tl.x, PANT.tl.y); g.lineTo(PANT.tr.x, PANT.tr.y); g.lineTo(PANT.br.x, PANT.br.y); g.lineTo(PANT.bl.x, PANT.bl.y); g.closePath(); }
  function partido(g, t) {
    const x0 = PANT.tl.x, x1 = PANT.tr.x, y0 = 340, y1 = 460, ancho = x1 - x0, desp = (t * 9) % 28;
    g.fillStyle = "#3f9a4c"; g.fillRect(x0, y0, ancho, y1 - y0);
    g.fillStyle = "#4aad57"; for (let x = x0 - 28 + desp; x < x1; x += 28) g.fillRect(x, y0, 14, y1 - y0);
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 1.4;
    const cx = x0 + ancho * 0.62 + 30 * Math.sin(t * 0.21) - desp * 0.3;
    g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx, y1); g.stroke(); g.beginPath(); g.ellipse(cx, 400, 16, 22, 0, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(x0, 365); g.lineTo(x1, 352); g.stroke();
    // jugadores (puntos rojos y azules) y el balón
    const bal = { x: x0 + ancho * (0.5 + 0.3 * Math.sin(t * 0.9)), y: 400 + 22 * Math.sin(t * 1.3 + 1) };
    for (let i = 0; i < 12; i++) {
      const eq = i % 2, h1 = hash(i * 3.7), h2 = hash(i * 5.1);
      const x = lerp(x0 + 8 + h1 * (ancho - 16), bal.x + (h2 - 0.5) * 40, 0.35) + 6 * Math.sin(t * (1.5 + h2) + i);
      const y = lerp(368 + h2 * 80, bal.y, 0.3) + 5 * Math.cos(t * (1.2 + h1) + i * 2);
      g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(x + 1, y + 3, 3, 1.4, 0, 0, TAU); g.fill();
      g.fillStyle = eq ? "#e04a3c" : "#2f5fc0"; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill();
      g.fillStyle = "#f3d2a8"; g.beginPath(); g.arc(x, y - 2.6, 1.3, 0, TAU); g.fill();
    }
    g.fillStyle = "#fff"; g.beginPath(); g.arc(bal.x, bal.y, 1.8, 0, TAU); g.fill();
  }
  function dibujos(g, t) {
    const x0 = PANT.tl.x, x1 = PANT.tr.x, ancho = x1 - x0, pd = pelotaDibujos(t);
    const cie = g.createLinearGradient(0, 340, 0, 460); cie.addColorStop(0, "#5ec8f2"); cie.addColorStop(1, "#bfefff");
    g.fillStyle = cie; g.fillRect(x0, 336, ancho, 126);
    // sol sonriente
    g.save(); g.translate(x0 + 24, 368); g.rotate(pd.v * 0.8);
    g.strokeStyle = "#ffd23a"; g.lineWidth = 2.4; for (let i = 0; i < 10; i++) { g.rotate(TAU / 10); g.beginPath(); g.moveTo(13, 0); g.lineTo(19, 0); g.stroke(); }
    g.restore();
    g.fillStyle = "#ffe14a"; g.beginPath(); g.arc(x0 + 24, 368, 11, 0, TAU); g.fill(); g.strokeStyle = "#e0a020"; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(x0 + 20, 366, 1.3, 0, TAU); g.arc(x0 + 28, 366, 1.3, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.arc(x0 + 24, 369, 4.5, 0.2, Math.PI - 0.2); g.stroke();
    // nube
    g.fillStyle = "#fff"; const nx = x0 + 70 + 10 * Math.sin(pd.v * 0.6);
    for (const [dx, dy, r] of [[0, 0, 8], [9, -3, 9], [18, 0, 7]]) { g.beginPath(); g.arc(nx + dx, 362 + dy, r, 0, TAU); g.fill(); }
    // colinas
    g.fillStyle = "#7fd36a"; g.beginPath(); g.moveTo(x0, 430); g.quadraticCurveTo(x0 + 40, 398, x0 + 80, 430); g.quadraticCurveTo(x0 + 100, 408, x1, 420); g.lineTo(x1, 462); g.lineTo(x0, 462); g.closePath(); g.fill();
    g.fillStyle = "#54b856"; g.beginPath(); g.moveTo(x0, 446); g.quadraticCurveTo(x0 + 60, 424, x1, 442); g.lineTo(x1, 462); g.lineTo(x0, 462); g.closePath(); g.fill();
    // estrella y triángulo de colores
    g.save(); g.translate(x0 + 92, 386); g.rotate(-pd.v * 1.2); g.fillStyle = "#ff7ab8"; g.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.4 : 8, a = -Math.PI / 2 + i * Math.PI / 5; if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r); else g.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); g.fill(); g.restore();
    g.fillStyle = "#9b6ef0"; g.beginPath(); g.moveTo(x0 + 58, 424); g.lineTo(x0 + 66, 410); g.lineTo(x0 + 74, 424); g.closePath(); g.fill();
    // la pelota que bota (con su sombra y aplastada al tocar el suelo)
    const bx = x0 + ancho * (0.5 + 0.34 * pd.x), suelo = 444, alto = 46 * pd.bote, by = suelo - 9 - alto;
    const ap = clamp(1 - pd.bote / 0.12), sxp = 1 + 0.3 * ap, syp = 1 - 0.3 * ap;
    g.fillStyle = "rgba(0,60,0,0.3)"; g.beginPath(); g.ellipse(bx, suelo + 2, 9 * (1 - 0.4 * pd.bote), 2.2, 0, 0, TAU); g.fill();
    g.save(); g.translate(bx, by + 9 * (1 - syp)); g.scale(sxp, syp);
    g.fillStyle = "#ef3b3b"; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill(); g.strokeStyle = "#8a1010"; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-3, -3.5, 3, 2, -0.5, 0, TAU); g.fill();
    g.strokeStyle = "#ffd23a"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 9, -0.9, 0.9); g.stroke();
    g.restore();
  }
  function estatica(g, t) {
    const x0 = PANT.tl.x, ancho = PANT.tr.x - x0, f = Math.floor(t * 60);
    for (let j = 0; j < 30; j++) for (let i = 0; i < 12; i++) { const v = Math.floor(80 + 175 * hash(f * 13.1 + j * 7.3 + i * 1.7)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x0 + i * ancho / 12, 336 + j * 4.2, ancho / 12 + 0.5, 4.3); }
  }
  function pantalla(g, t) {
    g.save(); rutaPantalla(g); g.clip();
    if (t < T.canal) partido(g, t);
    else if (t < T.canal + 0.14) estatica(g, t);
    else dibujos(g, t);
    // destello del cambio de canal y reflejo del cristal
    const fl = campana(t, T.canal + 0.1, T.canal + 0.3);
    if (fl > 0) { g.fillStyle = `rgba(255,255,255,${0.7 * fl})`; g.fillRect(860, 330, 140, 140); }
    g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.moveTo(PANT.tl.x, PANT.tl.y); g.lineTo(PANT.tl.x + 50, PANT.tl.y - 6); g.lineTo(PANT.tl.x + 10, PANT.bl.y); g.lineTo(PANT.tl.x, PANT.bl.y); g.closePath(); g.fill();
    g.restore();
  }
  // color de la luz de la tele (partido verdoso → dibujos cálidos)
  function luzTele(t) {
    const k = tramo(t, T.canal, T.canal + 0.25), pd = pelotaDibujos(t);
    const a = [120, 220, 150], b = [255, 214 + 20 * pd.bote, 150];
    const est = campana(t, T.canal - 0.02, T.canal + 0.2);
    return { col: a.map((v, i) => lerp(v, b[i], k)), b: 0.9 + 0.06 * ruido(t * 3.3) + 0.6 * est + 0.12 * k * pd.bote };
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, n, giro, col) {
    g.save(); g.translate(x, y); g.rotate(giro); g.beginPath();
    for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / n; if (i) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.stroke(); g.restore();
  }
  // estallido del cabezazo
  function bonk(g, t, c) {
    const k = fase(t, T.choque, T.choque + 0.32); if (k <= 0 || k >= 1) return;
    const r = 30 + 46 * salida(k);
    g.save(); g.globalAlpha = 1 - k * k;
    g.beginPath(); for (let i = 0; i < 24; i++) { const rr = i % 2 ? r * 0.5 : r * (0.85 + 0.25 * hash(i)), a = i * Math.PI / 12; if (i) g.lineTo(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr); else g.moveTo(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = "#fff5b0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    estrella(g, c.x, c.y, r * 0.42, 5, k, "#ffd23a");
    g.restore();
  }
  // estrellitas que dan vueltas sobre la cabeza
  function estrellitas(g, t, c, k, ph) {
    if (k < 0.02) return;
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 4; i++) { const a = t * 5.5 + ph + i * TAU / 4; estrella(g, c.x + Math.cos(a) * 46, c.y - 70 + Math.sin(a) * 12, 6.5, 5, a, i % 2 ? "#ffd23a" : "#fff"); }
    g.restore();
  }
  // rayitas de temblor alrededor de un punto
  function tiembla(g, t, c, k) {
    if (k < 0.02) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 2.4; g.globalAlpha = k;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const o = 2 * Math.sin(t * 50 + i + s); g.beginPath(); g.arc(c.x, c.y, 22 + i * 7 + o, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); g.stroke(); }
    g.restore();
  }
  // golpe en el cojín (palmada)
  function palmada(g, t, x, y) {
    const k = fase(t, T.palmada, T.palmada + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 2.6; g.globalAlpha = 1 - k;
    for (let i = 0; i < 6; i++) { const a = -Math.PI + 0.2 + i * (Math.PI - 0.4) / 5, r = 16 + 18 * salida(k);
      g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7); g.lineTo(x + Math.cos(a) * (r + 10), y + Math.sin(a) * (r + 10) * 0.7); g.stroke(); }
    g.fillStyle = "#efe3cc"; for (let i = 0; i < 4; i++) { const h = hash(i + 3); g.beginPath(); g.arc(x - 20 + i * 13, y - 4 - 12 * salida(k) * h, 5 + 5 * k, 0, TAU); g.globalAlpha = 0.45 * (1 - k); g.fill(); }
    g.restore();
  }
  // rayas de velocidad del mando al salir disparado y señal del mando a la tele
  function senal(g, t) {
    const k = fase(t, T.clic, T.clic + 0.4); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = "#fff6c0"; g.lineCap = "round"; g.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) { const kk = clamp(k * 1.6 - i * 0.25); if (kk <= 0 || kk >= 1) continue;
      g.globalAlpha = Math.sin(Math.PI * kk); const r = 14 + 60 * kk; g.beginPath(); g.arc(MANDO_BRAZO.x + 30, MANDO_BRAZO.y - 4, r, -0.55, 0.35); g.stroke(); }
    g.restore();
  }
  function lineasMando(g, t, m) {
    const k = dentro(t, T.suelta, T.suelta + 0.05, T.suelta + 0.3, APICE.t);
    if (k < 0.02) return;
    g.save(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineCap = "round"; g.lineWidth = 2.4; g.globalAlpha = k;
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(m.x + i * 12, m.y + 26); g.lineTo(m.x + i * 12 - 4, m.y + 60 + 10 * Math.abs(i)); g.stroke(); }
    g.restore();
  }
  // notas musicales que salen de la tele (dibujos)
  function notas(g, t) {
    const k = tramo(t, T.dibujos, T.dibujos + 0.3); if (k <= 0) return;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const per = 1.9, v = ((t - T.dibujos) / per + i * 0.25) % 1, x = 900 + 30 * Math.sin(v * 5 + i) + i * 14, y = 330 - v * 90;
      g.globalAlpha = k * Math.sin(Math.PI * v) * 0.9; g.fillStyle = i % 2 ? "#fff6c0" : "#ffd0e8"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
      g.save(); g.translate(x, y); g.rotate(-0.25 + 0.2 * Math.sin(t * 3 + i));
      g.beginPath(); g.ellipse(0, 0, 5, 3.8, -0.4, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(4.4, -1.5); g.lineTo(4.4, -16); g.quadraticCurveTo(10, -12, 11, -6); g.stroke();
      g.restore();
    }
    g.restore();
  }
  // polvo (nubecitas)
  function polvo(g, t, t0, x, y, n, ancho, dur = 0.8) {
    const v = t - t0; if (v < 0 || v > dur) return;
    g.save();
    for (let i = 0; i < n; i++) {
      const h = hash(i * 13.7 + t0), s = (i / (n - 1) - 0.5) * 2, k = v / dur;
      const px = x + s * ancho * (0.4 + 0.8 * salida(k)), py = y - 6 - 22 * salida(k) * (0.5 + h), r = (7 + 9 * h) * (0.6 + 0.8 * salida(k));
      g.globalAlpha = 0.5 * (1 - k); g.fillStyle = "#efe3cc"; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    g.restore();
  }

  /* ---------- luz: noche, lámpara cálida a la izquierda y la tele a la derecha ---------- */
  function luces(g, t) {
    const tv = luzTele(t);
    g.save();
    g.globalCompositeOperation = "multiply";
    const gr = g.createRadialGradient(86, 180, 30, 380, 320, 1050);
    gr.addColorStop(0, "rgb(255,240,214)"); gr.addColorStop(0.4, "rgb(178,170,182)"); gr.addColorStop(1, "rgb(86,90,132)");
    g.fillStyle = gr; g.fillRect(-MG, -MG, W + 2 * MG, H + 2 * MG);
    g.globalCompositeOperation = "lighter";
    const c = tv.col.map(v => Math.round(v));
    const tg = g.createRadialGradient(930, 400, 40, 860, 400, 640);
    tg.addColorStop(0, `rgba(${c},${0.32 * tv.b})`); tg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = tg; g.fillRect(-MG, -MG, W + 2 * MG, H + 2 * MG);
    const la = g.createRadialGradient(86, 170, 10, 86, 170, 240);
    la.addColorStop(0, "rgba(255,200,120,0.34)"); la.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = la; g.fillRect(-MG, -MG, 460, 560);
    g.restore();
  }
  // sobre los personajes, casi neutra: un poco más oscuro lejos de la lámpara y un brillo mínimo de la tele (sin teñir)
  function lucesSuaves(g, t) {
    const tv = luzTele(t);
    g.save();
    g.globalCompositeOperation = "multiply";
    const gr = g.createRadialGradient(86, 180, 30, 420, 320, 1000);
    gr.addColorStop(0, "rgb(255,251,245)"); gr.addColorStop(0.5, "rgb(236,234,236)"); gr.addColorStop(1, "rgb(214,214,220)");
    g.fillStyle = gr; g.fillRect(-MG, -MG, W + 2 * MG, H + 2 * MG);
    g.globalCompositeOperation = "lighter";
    const c = tv.col.map(v => Math.round(lerp(v, 255, 0.7)));
    const tg = g.createRadialGradient(930, 400, 40, 880, 400, 420);
    tg.addColorStop(0, `rgba(${c},${0.07 * tv.b})`); tg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = tg; g.fillRect(-MG, -MG, W + 2 * MG, H + 2 * MG);
    g.restore();
  }

  // cámara: sentados (cerca), de pie (más abierta y alta) y, al final, acercándose al montón y a la tele
  const CAM = { base: { k: 1.1, x: 560, y: 312 }, pie: { k: 1.0, x: 522, y: 282 }, fin: { k: 1.13, x: 602, y: 330 } };
  function camara(t) {
    const pie = dentro(t, T.sube - 0.1, T.depie, T.caeG - 0.1, T.quieto + 0.25);
    const fin = tramo(t, T.miranTele, T.absortos + 0.9);
    const m = (a, b, k) => ({ k: lerp(a.k, b.k, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
    return m(m(CAM.base, CAM.pie, pie), CAM.fin, fin);
  }

  class ElMando extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !B.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pb = P.b;
      const luz = tramo(t, NEGRO_INICIO, T.luz) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -MG, -MG);
      cojines(g, t, pg, pb);
      const m = mando(t);
      // el mando en el cojín o en el tira y afloja (debajo de las manos)
      if (m.modo === "suelo" || m.modo === "tira") { g.save(); g.translate(m.x, m.y); g.rotate(m.a); dibMando(g, t); g.restore(); }
      palmada(g, t, 550, COJIN - 2);
      // luz de la habitación (pared, sofá y atrezo); a los personajes solo les llega una versión suave y neutra
      luces(g, t);
      // orden: sentados, Gabacho delante de Guillermo en la palmada; de pie Gabacho encima (su mano en la frente)
      const gDetras = t < T.lanzaG || t >= T.puno;
      if (gDetras) { dibuja(g, IG, pg, t); dibuja(g, IB, pb, t); }
      else { dibuja(g, IB, pb, t); dibuja(g, IG, pg, t); }
      // el mando volando y en el brazo del sofá
      if (m.modo === "vuela" || m.modo === "brazo") {
        lineasMando(g, t, m);
        g.save(); g.translate(m.x, m.y); g.rotate(m.a); dibMando(g, t, campana(t, T.clic - 0.02, T.clic + 0.2)); g.restore();
      }
      lucesSuaves(g, t);
      senal(g, t);
      if (m.modo === "tira") tiembla(g, t, m, tiraY(t).tiembla);
      polvo(g, t, T.depie - 0.02, pg.M.W.x, SUP, 5, 40, 0.5);
      polvo(g, t, T.depieB - 0.02, pb.M.W.x, SUP, 5, 40, 0.5);
      polvo(g, t, T.caeG, G_PILA.x - 60, COJIN, 7, 120);
      // cabezazo: estallido entre las dos cabezas y estrellitas
      if (t >= T.choque - 0.01 && t < T.choque + 0.4) { const cb = cabezaW(IB, pb), cg = cabezaW(IG, pg); bonk(g, t, { x: (cb.x + cg.x) / 2, y: (cb.y + cg.y) / 2 - 20 }); }
      const est = dentro(t, T.choque + 0.05, T.choque + 0.2, T.quieto, T.quieto + 0.3);
      estrellitas(g, t, cabezaW(IB, pb), est, 0); estrellitas(g, t, cabezaW(IG, pg), est, 1.3);
      pantalla(g, t);
      notas(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00075", nombre: "Guillermo y Gabacho · El mando", crear: () => new ElMando() });
  window.__A2D_00075 = { pose, T, DUR };
})();
