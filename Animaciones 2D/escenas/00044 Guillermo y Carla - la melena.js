"use strict";
/* 00044 · Guillermo y Carla · La melena
 *
 * Parodia de anuncio de champú. Negro → plató pastel con un aro de luz, burbujas de jabón y un
 * ventilador gigante a la derecha. Carla posa en el centro, mirando a cámara; Guillermo, a su
 * espalda, tiene el mando del ventilador → Carla le señala chasqueando los dedos («¡acción!») y él
 * lo enciende: el viento le echa la melena hacia atrás, salen destellos y todo va como a cámara
 * lenta → Carla se pasa la mano por el pelo con los ojos cerrados; Guillermo se guarda el mando, se
 * queda embobado (corazones) y se acerca de puntillas a olerle el pelo, con la nariz en alto →
 * Carla abre los ojos, sonríe a cámara y prepara el gran latigazo: inclina la cabeza hacia delante
 * (la melena se le va por encima) y la echa hacia atrás de golpe → una ola enorme de pelo barre el
 * aire y le da a Guillermo en toda la cara → Guillermo sale girando como una peonza y acaba sentado
 * en el suelo, mareado, con estrellitas y unos pelos pegados en la cara → Carla, sin enterarse,
 * posa con una sonrisa deslumbrante (destello en los dientes) → Guillermo se sopla el pelo del
 * labio, que se va volando con el viento, y mira a cámara resignado; Carla guiña un ojo → negro.
 *
 * Sin textos. La ola de pelo es una capa de la escena con los colores y el trazo de la melena del
 * avatar, enganchada por detrás de la cabeza de Carla. El momento del golpe se calcula a partir de
 * la ola y de la postura de Guillermo (la ola pasa exactamente por su cara). Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, mezcla, ruido, hash } = M2;
  const G = Guillermo, CA = Carla;
  const S = 0.30, SUELO = 548;
  const KC = S * CA.K;
  const DUR = 13.6;
  const T = {
    mira: 0.4, senala0: 0.95, chasca: 1.3, senala1: 1.6, clic: 1.48, ventila: 1.55, viento0: 1.7, viento1: 2.5,
    guarda0: 2.0, guarda1: 2.5, embobado: 2.45, anda0: 2.75, anda1: 4.15, huele0: 4.1, huele1: 5.4,
    anuncio0: 2.35, pelo0: 2.5, pelo1: 3.85, sonrisa: 3.95, ant0: 4.55, ant1: 5.2, lat0: 5.28, lat1: 5.62,
    gira1: 7.2, sienta: 7.45, poseC: 6.25, dientes: 6.75, pose2: 8.2,
    mareo1: 9.0, nota: 9.15, hincha: 9.45, sopla: 9.78, mira2: 10.8, guinoC: 11.55, sonrisaG: 11.9,
    fin: 12.95
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), CADERA = D(0.45, 0.7, 0.7, 0.65, 0.6),
    PELO = D(0.6, 0.85, 0.8, 0.75, 0.7), SENALA = D(0.2, 1, 0, 0, 0), CHASQUIDO = D(0.9, 0.1, 0.85, 0.1, 0.1), APOYO = D(0.9, 1, 1, 1, 0.95);

  /* ---------- caras (mismos campos para los dos) ---------- */
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
   * VIENTO Y VENTILADOR
   * ===================================================================================== */
  const viento = t => tramo(t, T.viento0, T.viento1);
  // ángulo de las aspas: aceleración constante hasta la velocidad máxima y luego velocidad fija
  const W_MAX = 34, ACEL = 1.0;
  function anguloAspas(t) {
    const u = t - T.ventila; if (u <= 0) return 0;
    if (u < ACEL) return 0.5 * (W_MAX / ACEL) * u * u;
    return 0.5 * W_MAX * ACEL + W_MAX * (u - ACEL);
  }
  const velAspas = t => W_MAX * clamp((t - T.ventila) / ACEL);

  /* =====================================================================================
   * CARLA (en el centro, mira a la derecha, hacia el ventilador)
   * ===================================================================================== */
  const XC = 650;
  const TOB_C = CA.SUELO - CA.TOBILLO_ALTO;
  const CARAS_C = {
    inicio: E({ mx: -0.85, my: -0.05, c: 0.3, sd: 8, gd: 0.06, si: 6, gi: 0.04, sonr: 0.55, ancho: 0.9 }),
    accion: E({ mx: -0.85, my: 0, c: 0.15, sd: 14, gd: 0.1, si: 8, gi: 0.04, abre: 12, ancho: 1, sonr: 0.7 }),
    gozo: E({ mx: 0, my: -0.4, c: 0.95, h: 1, sd: 12, gd: 0.08, si: 12, gi: 0.08, abre: 6, ancho: 0.9, sonr: 0.8 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.32, sd: 12, gd: 0.08, si: 4, gi: 0.02, abre: 4, ancho: 1, sonr: 0.85 }),
    prepara: E({ mx: 0.4, my: 0.5, c: 0.9, h: 0.6, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 0, ancho: 0.9, sonr: 0.6 }),
    latigo: E({ mx: 0, my: -0.4, c: 1, h: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 12, ancho: 1, sonr: 0.9 }),
    deslumbra: E({ mx: -0.85, my: -0.1, c: 0.15, sd: 16, gd: 0.1, si: 10, gi: 0.06, abre: 14, ancho: 1.12, sonr: 1 }),
    pose2: E({ mx: -0.85, my: -0.15, c: 0.4, sd: 14, gd: 0.1, si: 4, gi: 0, abre: 6, ancho: 0.95, sonr: 0.85 }),
    guino: E({ mx: -0.85, my: -0.1, c: 0.2, wi: 0.78, sd: 14, gd: 0.1, si: -4, gi: -0.05, abre: 8, ancho: 1.05, sonr: 1 })
  };
  const GUION_CARA_C = [
    [T.senala0 - 0.1, T.senala0 + 0.15, "accion"], [T.pelo0, T.pelo0 + 0.35, "gozo"], [T.sonrisa, T.sonrisa + 0.25, "camara"],
    [T.ant0, T.ant0 + 0.3, "prepara"], [T.lat0 - 0.04, T.lat0 + 0.1, "latigo"], [T.poseC - 0.2, T.poseC + 0.2, "deslumbra"],
    [T.pose2, T.pose2 + 0.4, "pose2"], [T.guinoC, T.guinoC + 0.15, "guino"]
  ];
  // cuerpo: pel (hoja, + abajo), torso (+ hacia delante), cab (+ hacia delante), cad (x de la pelvis en la hoja)
  const CUERPOS_C = {
    inicio: { pel: 6, torso: -0.05, cab: -0.04, cad: -18 },
    accion: { pel: 4, torso: -0.08, cab: -0.08, cad: -10 },
    gozo: { pel: 8, torso: -0.07, cab: -0.16, cad: -24 },
    camara: { pel: 6, torso: -0.05, cab: -0.06, cad: -20 },
    prepara: { pel: 26, torso: 0.2, cab: 0.48, cad: -6 },
    latigo: { pel: 10, torso: -0.13, cab: -0.36, cad: -26 },
    deslumbra: { pel: 6, torso: -0.06, cab: -0.07, cad: -28 },
    pose2: { pel: 10, torso: -0.08, cab: -0.12, cad: -30 }
  };
  const GUION_CUERPO_C = [
    [T.senala0 - 0.05, T.senala0 + 0.25, "accion"], [T.senala1, T.pelo0 + 0.3, "gozo"], [T.sonrisa - 0.05, T.sonrisa + 0.3, "camara"],
    [T.ant0, T.ant1, "prepara"], [T.lat0, T.lat1, "latigo", salida], [T.lat1 + 0.05, T.poseC + 0.25, "deslumbra"],
    [T.pose2, T.pose2 + 0.5, "pose2"]
  ];

  function poseC(t) {
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "inicio", t);
    const respira = Math.sin(t * 2.1 + 1);
    // tras el latigazo la cabeza y el torso rebotan un poco antes de quedarse quietos
    const reb = t > T.lat1 ? Math.exp(-(t - T.lat1) * 5) * Math.sin((t - T.lat1) * 15) : 0;
    const balanceo = 0.02 * Math.sin(t * 1.3) * viento(t);
    const p = {
      x: XC, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: CA.PELVIS.x + b.cad, y: CA.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso + balanceo - 0.04 * reb, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {
        cerca: { tob: { x: CA.PELVIS.x - 64, y: TOB_C }, ang: 0 },
        lejos: { tob: { x: CA.PELVIS.x + 78, y: TOB_C - 6 }, ang: 0 }
      },
      cabeza: { ang: b.cab + 0.6 * balanceo - 0.1 * reb, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // la melena del avatar: el viento del ventilador la echa hacia atrás; en el latigazo, hacia delante
    const v = viento(t);
    const ant = dentro(t, T.ant0, T.ant1, T.lat0, T.lat1);
    p.pelo = { viento: -1.1 * v * (1 - ant) + 0.9 * ant + 0.15 * v * Math.sin(t * 3.1), inercia: -0.6 * Math.max(0, reb) + 0.05 * Math.sin(t * 1.7) };
    const ex = guion(GUION_CARA_C, CARAS_C, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.7, 2.1, 6.0, 7.4, 9.1, 10.4, 12.3]));
    p.cara.rubor = 0.25 * dentro(t, T.pelo0, T.pelo0 + 0.3, T.sonrisa, T.sonrisa + 0.3);
    manosC(p, t);
    return p;
  }
  function manosC(p, t) {
    const Tr = CA.tronco(p);
    // de partida, las dos manos en la cintura
    let c = Tr({ x: 132, y: 585 }), l = Tr({ x: 372, y: 590 }), cmu = -0.5, lmu = -2.6, cd = CADERA, ld = CADERA, cang = 0, lang = 0;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // «¡acción!»: señala hacia atrás a Guillermo y chasquea los dedos
    const senala = dentro(t, T.senala0, T.senala0 + 0.25, T.senala1, T.senala1 + 0.3);
    if (senala > 0) {
      const ch = campana01(t, T.chasca - 0.12, T.chasca + 0.1);
      pone(senala, { q: Tr({ x: -40, y: 300 + 10 * ch }), mu: -0.15, d: mezclaD(SENALA, CHASQUIDO, ch) }, null);
    }
    // anuncio: se pasa la mano por el pelo, despacio, con los ojos cerrados
    const pelo = dentro(t, T.pelo0, T.pelo0 + 0.4, T.pelo1, T.pelo1 + 0.4);
    if (pelo > 0) { const u = fase(t, T.pelo0, T.pelo1);
      pone(pelo, { q: Tr({ x: 96 - 34 * suave(u), y: -10 + 90 * suave(u) + 5 * Math.sin(t * 3) }), mu: 1.2, d: PELO }, null); }
    // tras el latigazo: pose de anuncio, la mano cercana en la nuca, metida en el pelo
    const pose = dentro(t, T.poseC, T.poseC + 0.45, T.fin + 2, T.fin + 3);
    pone(pose, { q: Tr({ x: 70, y: 30 + 6 * Math.sin(t * 1.6) }), mu: 1.2, d: PELO }, null);
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: 1, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: 1, puno: 1, dedos: ld };
  }
  const campana01 = (t, a, b) => { const k = fase(t, a, b); return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k); };

  /* =====================================================================================
   * LA OLA DE PELO: mechones que salen de detrás de la cabeza de Carla
   * ===================================================================================== */
  const RAIZ_PELO = { x: 655, y: 365 };                      // punto del retrato de Carla (detrás de la cabeza)
  const TH_STREAM = Math.PI - 0.42;                           // con el viento: hacia atrás y hacia abajo
  const TH_ARRIBA = 2 * Math.PI - 1.0;                        // recogida: por encima de la cabeza, hacia delante
  const TH_FIN = Math.PI - 0.85;                              // final del latigazo (se pasa un poco)
  const LAG = 0.1;
  // en el latigazo la punta se retrasa más: la ola se curva como un látigo
  const lagPelo = t => LAG + 0.07 * dentro(t, T.lat0 - 0.05, T.lat0 + 0.03, T.lat1, T.lat1 + 0.35);
  function thRaiz(t) {
    const ts = TH_STREAM + 0.06 * Math.sin(t * 1.7);
    if (t < T.ant0) return ts;
    if (t < T.ant1) return lerp(ts, TH_ARRIBA, suave(fase(t, T.ant0, T.ant1)));
    if (t < T.lat0) return TH_ARRIBA + 0.03 * Math.sin((t - T.ant1) * 20) * fase(t, T.ant1, T.lat0);
    if (t < T.lat1) { const u = fase(t, T.lat0, T.lat1); return lerp(TH_ARRIBA, TH_FIN, u * u * (3 - 2 * u)); }
    // se asienta con un rebote amortiguado (velocidad cero al empezar, sin quiebros)
    const tau = t - T.lat1, k = 3.2, w = 7.5, A0 = TH_FIN - TH_STREAM;
    return TH_STREAM + 0.06 * Math.sin(t * 1.7) * (1 - Math.exp(-tau * 3)) + A0 * Math.exp(-k * tau) * (Math.cos(w * tau) + (k / w) * Math.sin(w * tau));
  }
  function largoPelo(t) {
    const v = viento(t), L0 = 40 + 92 * v;
    if (t < T.ant0) return L0;
    if (t < T.lat0) return lerp(L0, 40, suave(fase(t, T.ant0, T.ant0 + 0.45)));
    // en el latigazo la ola crece a medida que baja: corta en vertical (cabe en el plano), larguísima al golpear
    const Lmax = 236, u = fase(t, T.lat0, T.lat1), us = u * u * (3 - 2 * u);
    const crece = Math.pow(Math.min(1, us / 0.7), 0.8);
    const vuelve = tramo(t, T.lat1 + 0.15, T.lat1 + 1.3);
    return lerp(lerp(40, Lmax, crece), 132, vuelve);
  }
  function anchoPelo(t) {
    const v = viento(t), w0 = 26 + 10 * v;
    const ola = dentro(t, T.lat0 - 0.05, T.lat0 + 0.12, T.lat1 + 0.2, T.lat1 + 1.2);
    return lerp(w0, 50, ola);
  }
  // fuerza de las ondas del viento (menos en el latigazo, que manda la inercia)
  const ondas = t => viento(t) * (1 - 0.8 * dentro(t, T.ant0, T.ant0 + 0.2, T.lat1 + 0.3, T.lat1 + 1.0));
  // raíz en pantalla (mundo) a partir de la postura de Carla
  const raiz = pC => CA.aPantalla(pC, CA.cabeza(pC).a(RAIZ_PELO));
  // línea central: N+1 puntos con su ángulo; cada trozo va con retraso (la punta sigue a la raíz)
  const N_PELO = 16;
  function lineaPelo(t, pC, L) {
    const R = raiz(pC), pts = [{ x: R.x, y: R.y, a: thRaiz(t) }];
    L = L ?? largoPelo(t);
    const on = ondas(t), lag = lagPelo(t);
    let x = R.x, y = R.y;
    for (let i = 1; i <= N_PELO; i++) {
      const s = (i - 0.5) / N_PELO;
      const a = thRaiz(t - lag * s) + on * 0.2 * s * Math.sin(7 * s - 6.5 * t) + 0.05 * s * Math.sin(3 * s + t * 2);
      x += Math.cos(a) * L / N_PELO; y += Math.sin(a) * L / N_PELO;
      pts.push({ x, y, a });
    }
    return pts;
  }
  const enLinea = (pts, s) => {
    const u = clamp(s) * N_PELO, i = Math.min(N_PELO - 1, Math.floor(u)), k = u - i, a = pts[i], b = pts[i + 1];
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), a: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  // mechones: desplazamiento lateral, largo relativo, rizo de la punta, tono (0 detrás … 2 delante), fase de la onda
  const MECHONES = [[-1.0, 0.8, 1.0, 0, 0.3], [0.95, 0.86, -1.1, 0, 1.7], [-0.55, 0.97, 1.3, 1, 2.6], [0.55, 0.93, -1.2, 1, 4.1],
    [0.05, 1.04, 0.9, 1, 5.2], [-0.8, 0.9, 1.15, 2, 0.9], [-0.25, 0.99, 1.05, 2, 3.3], [0.3, 0.88, -0.9, 2, 2.0], [0.8, 0.76, -0.8, 2, 5.9]];
  const TONOS = [["#603818", "#8a5428", "#341a0a"], ["#784824", "#a8683a", "#40210e"], ["#8a552b", "#c08048", "#4a2810"]];
  function dibOla(g, t, pC) {
    const L = largoPelo(t); if (L < 62) return;
    const pts = lineaPelo(t, pC, L), W0 = anchoPelo(t);
    const vis = clamp((L - 62) / 16); if (vis <= 0) return;
    g.save(); g.globalAlpha = vis; g.lineJoin = "round"; g.lineCap = "round";
    const M = 20;
    for (const [off, lar, rizo, tono, fa] of MECHONES) {
      const ce = [];
      let curlA = 0;
      for (let i = 0; i <= M; i++) {
        const s = lar * i / M, q = enLinea(pts, s), nx = -Math.sin(q.a), ny = Math.cos(q.a);
        // el haz se abre en abanico hacia las puntas
        const w = W0 * (0.45 + 0.9 * s);
        const ond = (3 + 6 * s) * Math.sin(10 * s - 7 * t + fa);
        ce.push({ x: q.x + nx * (off * w * 0.6 + ond), y: q.y + ny * (off * w * 0.6 + ond), s });
      }
      // la punta se riza: el último trozo gira poco a poco hacia un lado
      for (let i = Math.round(M * 0.68); i <= M; i++) {
        const k = (i - M * 0.68) / (M * 0.32), a = rizo * 1.6 * k * k;
        const p0 = ce[i - 1], q = ce[i], dx = q.x - p0.x, dy = q.y - p0.y;
        curlA = a; const c = Math.cos(curlA), sn = Math.sin(curlA);
        const r = { x: p0.x + dx * c - dy * sn, y: p0.y + dx * sn + dy * c };
        const ddx = r.x - q.x, ddy = r.y - q.y;
        for (let j = i; j <= M; j++) { ce[j].x += ddx; ce[j].y += ddy; }
      }
      const izq = [], der = [];
      for (let i = 0; i <= M; i++) {
        const q = ce[i], b = ce[Math.min(M, i + 1)], a0 = ce[Math.max(0, i - 1)];
        const a = Math.atan2(b.y - a0.y, b.x - a0.x), nx = -Math.sin(a), ny = Math.cos(a);
        const k = i / M, gw = W0 * 0.3 * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, k * 1.5))) * Math.pow(1 - k, 0.75) + 0.5;
        izq.push({ x: q.x + nx * gw, y: q.y + ny * gw }); der.push({ x: q.x - nx * gw, y: q.y - ny * gw });
        q.a = a;
      }
      const contorno = izq.concat(der.slice().reverse());
      const forma = () => { g.beginPath(); M2.curva(g, contorno, true, 0.5); };
      const [base, luz, oscuro] = TONOS[tono];
      forma(); g.fillStyle = base; g.fill();
      g.save(); forma(); g.clip();
      g.strokeStyle = luz; g.lineWidth = Math.max(1.5, W0 * 0.1);
      g.beginPath(); M2.curva(g, ce.slice(2, Math.round(M * 0.8)).map(q => ({ x: q.x - Math.sin(q.a) * W0 * 0.07, y: q.y + Math.cos(q.a) * W0 * 0.07 })), false, 0.5); g.stroke();
      g.strokeStyle = oscuro; g.lineWidth = 1.3;
      g.beginPath(); M2.curva(g, ce.slice(1, M - 2).map(q => ({ x: q.x + Math.sin(q.a) * W0 * 0.09, y: q.y - Math.cos(q.a) * W0 * 0.09 })), false, 0.5); g.stroke();
      g.restore();
      forma(); g.strokeStyle = "#1e1008"; g.lineWidth = 1.9; g.stroke();
    }
    g.restore();
  }
  // brillo de anuncio: destellos que corren por la melena
  function brilloPelo(g, t, pC) {
    const k = viento(t) * (1 - 0.7 * dentro(t, T.ant0, T.ant0 + 0.2, T.lat1, T.lat1 + 0.4)); if (k <= 0.02 || largoPelo(t) < 60) return;
    const pts = lineaPelo(t, pC);
    g.save();
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.45 + i / 4) % 1, q = enLinea(pts, 0.15 + 0.75 * ph), r = 7 * Math.sin(Math.PI * ph) * k;
      if (r < 0.5) continue;
      estrella4(g, q.x - Math.sin(q.a) * 6, q.y + Math.cos(q.a) * 6, r, t * 2 + i);
    }
    g.restore();
  }
  function estrella4(g, x, y, r, rot) {
    g.save(); g.translate(x, y); g.rotate(rot * 0.3);
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath();
    g.fillStyle = "#fffdf0"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "rgba(120,80,40,0.8)"; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (a la espalda de Carla, mira a la derecha)
   * ===================================================================================== */
  const XG0 = 262, X_HUELE = 462, X_SIENTA = 262;
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  const OFF_G = { cerca: -19, lejos: 18 };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  // pasos de puntillas hasta la espalda de Carla
  const PASOS_G = (() => {
    const c = [[-10, -9, XG0 + OFF_G.cerca]], l = [[-10, -9, XG0 + OFF_G.lejos]];
    const n = 4, dt = (T.anda1 - T.anda0) / n;
    for (let i = 0; i < n; i++) {
      const t0 = T.anda0 + i * dt, x = lerp(XG0, X_HUELE, (i + 1) / n);
      if (i % 2 === 0) c.push([t0, t0 + dt * 0.9, x + OFF_G.cerca]); else l.push([t0, t0 + dt * 0.9, x + OFF_G.lejos]);
    }
    return { cerca: c, lejos: l };
  })();
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: 52 * arco, ang: -0.25 * arco, u };
  }

  let ZAS = null;                                             // instante en que la ola le da en la cara (se calcula)
  const zas = () => ZAS ?? 1e9;

  const CARAS_G = {
    inicio: E({ mx: 0.85, my: -0.05, c: 0.25, sd: 4, gd: 0.04, si: 4, gi: 0.04, sonr: 0.3, ancho: 0.9 }),
    atento: E({ mx: 0.9, my: 0, c: 0.05, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 6, ancho: 0.85, sonr: 0.45 }),
    clic: E({ mx: 0.9, my: 0.2, c: 0.3, sd: 10, gd: 0.08, si: 10, gi: 0.08, abre: 0, ancho: 1.05, sonr: 0.75 }),
    embobado: E({ mx: 0.9, my: -0.1, iris: 1.15, c: 0.2, sd: 22, gd: 0.16, si: 22, gi: 0.16, abre: 26, ancho: 0.8, sonr: 0.35, lengua: 0.4 }),
    huele: E({ mx: 0.9, my: -0.4, c: 1, h: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 0, ancho: 0.95, sonr: 0.85 }),
    zas: E({ mx: 0, my: 0, c: 1, z: 1, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 34, ancho: 0.85, sonr: -0.5, lengua: 0.5 }),
    gira: E({ mx: 0, my: 0, iris: 0.8, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 40, ancho: 0.7, sonr: -0.3, lengua: 0.3 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, abre: 18, ancho: 0.85, sonr: -0.1, lengua: 0.8 }),
    nota: E({ mx: 0.3, my: 0.85, c: 0.15, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 0, ancho: 0.9, sonr: -0.2 }),
    hincha: E({ mx: 0.3, my: 0.8, c: 0.45, sd: 10, gd: 0.08, si: 10, gi: 0.08, abre: 0, ancho: 0.45, sonr: -0.1, mof: 1 }),
    sopla: E({ mx: 0.1, my: -0.5, c: 0.2, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 14, ancho: 0.42, sonr: -0.2 }),
    resigna: E({ mx: -0.85, my: 0, c: 0.55, sd: -4, gd: -0.06, si: 6, gi: 0.04, abre: 0, ancho: 0.9, sonr: -0.15 }),
    sonrisa: E({ mx: -0.85, my: -0.05, c: 0.4, h: 0.3, sd: 10, gd: 0.08, si: 10, gi: 0.08, abre: 6, ancho: 1, sonr: 0.6 })
  };
  function guionCaraG() {
    const z = zas();
    return [
      [T.senala0, T.senala0 + 0.2, "atento"], [T.clic - 0.1, T.clic + 0.05, "clic"], [T.embobado, T.embobado + 0.4, "embobado"],
      [T.huele0 - 0.2, T.huele0 + 0.2, "huele"], [z, z + 0.04, "zas"], [z + 0.2, z + 0.4, "gira"], [T.sienta, T.sienta + 0.2, "mareo"],
      [T.nota, T.nota + 0.25, "nota"], [T.hincha, T.hincha + 0.2, "hincha"], [T.sopla - 0.04, T.sopla + 0.04, "sopla"],
      [T.mira2, T.mira2 + 0.3, "resigna"], [T.sonrisaG, T.sonrisaG + 0.35, "sonrisa"]
    ];
  }
  // cuerpo: pel (hoja), torso, cab (+ hacia delante)
  const CUERPOS_G = {
    inicio: { pel: 0, torso: -0.02, cab: 0 },
    atento: { pel: 0, torso: 0.02, cab: 0.04 },
    embobado: { pel: 10, torso: 0.1, cab: 0.06 },
    anda: { pel: 20, torso: 0.16, cab: -0.06 },
    huele: { pel: 26, torso: 0.3, cab: -0.36 },
    zas: { pel: 10, torso: -0.22, cab: -0.42 },
    gira: { pel: 0, torso: 0, cab: -0.05 },
    sentado: { pel: 556, torso: -0.12, cab: 0.06 },
    nota: { pel: 556, torso: -0.1, cab: 0.12 },
    sopla: { pel: 556, torso: -0.14, cab: -0.12 },
    final: { pel: 556, torso: -0.1, cab: 0.02 }
  };
  function guionCuerpoG() {
    const z = zas();
    return [
      [T.senala0, T.senala0 + 0.25, "atento"], [T.embobado, T.embobado + 0.4, "embobado"], [T.anda0 - 0.1, T.anda0 + 0.2, "anda"],
      [T.huele0 - 0.15, T.huele0 + 0.35, "huele"], [z, z + 0.06, "zas", salida], [z + 0.12, z + 0.45, "gira"],
      [T.gira1, T.sienta, "sentado"], [T.nota, T.nota + 0.25, "nota"], [T.hincha, T.sopla, "sopla"], [T.mira2, T.mira2 + 0.4, "final"]
    ];
  }
  // giro de peonza: vueltas acumuladas (rápido al principio, frena al final) y cuántas son
  const VUELTAS = 4;
  function giroG(t) { const z = zas(); if (t <= z + 0.05) return 0; const u = fase(t, z + 0.05, T.gira1 + 0.1); return 2 * Math.PI * VUELTAS * (1 - Math.pow(1 - u, 2.4)); }

  function poseG(t) {
    const z = zas();
    const b = guion(guionCuerpoG(), CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4);
    const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
    let X = (fc.x - OFF_G.cerca + fl.x - OFF_G.lejos) / 2;
    // tras el golpe sale girando hacia atrás (izquierda) hasta donde se sienta
    const huye = t > z ? salida(fase(t, z, T.gira1 + 0.1)) : 0;
    const sienta = tramo(t, T.gira1, T.sienta);
    X = lerp(X, X_SIENTA, huye);
    // husmeo: la cabeza va y viene olfateando
    const husmea = dentro(t, T.huele0, T.huele0 + 0.2, Math.min(z, T.huele1), Math.min(z, T.huele1) + 0.05);
    const snif = Math.max(0, Math.sin((t - T.huele0) * 13)) * husmea;
    const p = {
      x: X, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 * (1 - huye) },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: b.cab - 0.05 * snif, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // pies: de puntillas al andar; girando, juntos bajo él; sentado, hacia delante (resbalan)
    const giraPies = dentro(t, z, z + 0.15, T.gira1, T.sienta);
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_G[ld] - f.alza / S }, ang: f.ang };
      if (giraPies > 0) { const q = p.piernas[ld], jx = G.PELVIS.x + (ld === "cerca" ? -30 : 30);
        q.tob = { x: lerp(q.tob.x, jx, giraPies), y: lerp(q.tob.y, TOB_G[ld], giraPies) }; q.ang = lerp(q.ang, 0, giraPies); }
      // sentado: los pies resbalan hacia delante (como en la 00004)
      if (sienta > 0) { const q = p.piernas[ld], fx = G.PELVIS.x + (ld === "cerca" ? 300 : 470);
        q.tob = { x: lerp(q.tob.x, fx, sienta), y: lerp(q.tob.y, TOB_G[ld], sienta) }; q.ang = lerp(q.ang, -1.25, sienta); }
    }
    // golpe en la cara: la cabeza se va hacia atrás aplastada
    const golpe = t >= z ? Math.exp(-(t - z) * 7) * suave(fase(t, z, z + 0.04)) : 0;
    p.cabeza.esc = { x: 1 - 0.12 * golpe, y: 1 + 0.06 * golpe }; p.cabeza.dx = -16 * golpe;
    // al caer sentado: rebote
    p.pelvis.y -= 26 * campana01(t, T.sienta, T.sienta + 0.25);
    // mareo sentado: se balancea
    const mareo = dentro(t, T.sienta, T.sienta + 0.3, T.mareo1, T.nota + 0.2);
    p.torso += 0.05 * Math.sin(t * 2.6) * mareo; p.cabeza.ang += 0.09 * Math.sin(t * 2.6 + 0.8) * mareo;
    p.giro = giroG(t);
    manosG(p, t, husmea);
    const ex = guion(guionCaraG(), CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.85, 2.2, 3.4, 10.25, 11.5, 12.4]));
    p.cara.rubor = 0.75 * dentro(t, T.embobado + 0.2, T.embobado + 0.6, z, z + 0.05) + 0.3 * dentro(t, T.hincha, T.hincha + 0.15, T.sopla, T.sopla + 0.2);
    p.rojo = 0.3 * dentro(t, T.hincha, T.hincha + 0.2, T.sopla, T.sopla + 0.15);
    p.chichonEn = { x: 850, y: 268 };
    p.capaCabeza = (g) => pelosCara(g, t);
    return p;
  }
  function manosG(p, t, husmea) {
    const Tr = G.tronco(p), z = zas();
    let c = { x: BOLS_C.x, y: BOLS_C.y }, l = { x: BOLS_L.x, y: BOLS_L.y };
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA, lobj = null;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // el mando del ventilador en la mano lejana; lo pulsa y se lo guarda
    const mando = 1 - tramo(t, T.guarda0, T.guarda1);
    if (mando > 0) {
      const pulsa = campana01(t, T.clic - 0.08, T.clic + 0.12);
      pone(mando, null, { q: Tr({ x: 420 + 30 * pulsa, y: 480 - 8 * pulsa }), mu: -1.95, d: D(0.15 + 0.3 * pulsa, 0.35, 0.35, 0.35, 0.35) });
      if (mando > 0.35) lobj = mandoObj(t);
    }
    // embobado: la mano cercana al corazón
    const corazon = dentro(t, T.embobado, T.embobado + 0.3, z, z + 0.04);
    pone(corazon, { q: Tr({ x: 245, y: 420 + 6 * Math.sin(t * 6) }), mu: -2.6, d: D(0.6, 0.95, 0.95, 0.9, 0.85) }, null);
    // olfatea con la nariz en alto y las manos detrás… (aquí: abiertas, embelesado)
    pone(husmea * 0.6, null, { q: Tr({ x: 400, y: 560 }), mu: -2.0, d: D(0.6, 0.8, 0.75, 0.7, 0.65) });
    // ¡zas!: brazos arriba y abiertos, y girando, en cruz
    const brazos = dentro(t, z, z + 0.06, T.gira1 - 0.1, T.sienta);
    if (brazos > 0) { const f = Math.sin((t - z) * 21);
      pone(brazos, { q: Tr({ x: -150, y: 300 + 20 * f }), mu: 0.15, d: ABIERTA }, { q: Tr({ x: 640, y: 300 - 20 * f }), mu: Math.PI - 0.15, d: ABIERTA }); }
    // sentado: manos apoyadas en el suelo a los lados
    const suelo = tramo(t, T.gira1 + 0.05, T.sienta + 0.1);
    pone(suelo, { q: Tr({ x: 70, y: 820 }), mu: -1.2, d: APOYO }, { q: Tr({ x: 420, y: 830 }), mu: -2.0, d: APOYO });
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ld, objeto: lobj };
  }
  // mando a distancia (unidades de jarra, en el puño)
  const mandoObj = t => (g) => {
    g.save(); g.rotate(-0.25);
    g.fillStyle = "#26262e"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
    g.beginPath(); g.roundRect ? g.roundRect(-6, -30, 12, 34, 3) : g.rect(-6, -30, 12, 34); g.fill(); g.stroke();
    const led = campana01(t, T.clic - 0.02, T.clic + 0.25);
    g.fillStyle = led > 0.05 ? "#ff6f6f" : "#b02a2a"; g.beginPath(); g.arc(0, -23, 3.2, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.stroke();
    g.fillStyle = "#6b6b78"; for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(0, -14 + i * 6, 1.6, 0, Math.PI * 2); g.fill(); }
    if (led > 0.05) { g.globalAlpha = led; g.fillStyle = "rgba(255,120,120,0.6)"; g.beginPath(); g.arc(0, -23, 8, 0, Math.PI * 2); g.fill(); }
    g.restore();
  };
  // pelos de Carla pegados en la cara de Guillermo (retrato de Guillermo). El del labio se va al soplar.
  const PELOS_CARA = [
    [[690, 420], [745, 470], [800, 500], [850, 470], [905, 490]],
    [[640, 615], [700, 640], [745, 690], [775, 735]],
  ];
  const PELO_LABIO = [[755, 712], [795, 738], [835, 728], [862, 760], [858, 800]];
  function trazoPelo(g, pts, k) {
    const P = pts.map(([x, y]) => ({ x, y }));
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.globalAlpha = k;
    g.strokeStyle = "#2a1508"; g.lineWidth = 19; g.beginPath(); M2.curva(g, P, false, 0.5); g.stroke();
    g.strokeStyle = "#8a522a"; g.lineWidth = 11; g.beginPath(); M2.curva(g, P, false, 0.5); g.stroke();
    g.strokeStyle = "#c4864a"; g.lineWidth = 3; g.beginPath(); M2.curva(g, P.slice(0, Math.max(2, P.length - 1)), false, 0.5); g.stroke();
    g.restore();
  }
  function pelosCara(g, t) {
    const z = zas(); if (t < z) return;
    const k = salida(fase(t, z, z + 0.06));
    for (const pts of PELOS_CARA) trazoPelo(g, pts, k);
    if (t < T.sopla) {
      // el del labio aletea cuando sopla
      const tiembla = dentro(t, T.hincha, T.hincha + 0.2, T.sopla, T.sopla + 0.01);
      const pts = PELO_LABIO.map(([x, y], i) => [x + 6 * tiembla * Math.sin(t * 40 + i), y - 10 * tiembla * i / 4]);
      trazoPelo(g, pts, k);
    }
  }
  // el pelo del labio, ya suelto: se va volando con el viento (pantalla)
  let PELO_SUELTO = null;
  function pelLabioSuelto(g, t) {
    if (t < T.sopla || t > T.sopla + 1.6) return;
    if (!PELO_SUELTO) { const p = poseG(T.sopla - 1e-3), H = G.cabeza(p);
      PELO_SUELTO = PELO_LABIO.map(([x, y]) => G.aPantalla(p, H.a({ x, y }))); }
    const u = t - T.sopla, k = 1 - tramo(u, 1.1, 1.6);
    const c = PELO_SUELTO.reduce((a, q) => ({ x: a.x + q.x / PELO_SUELTO.length, y: a.y + q.y / PELO_SUELTO.length }), { x: 0, y: 0 });
    const dx = -40 * u - 70 * u * u + 6 * Math.sin(u * 9), dy = -130 * salida(fase(u, 0, 0.6)) + 30 * u * u + 8 * Math.sin(u * 7);
    const a = 1.6 * u + 0.4 * Math.sin(u * 8);
    const pts = PELO_SUELTO.map((q, i) => { const r = G.rotP({ x: q.x - c.x, y: q.y - c.y }, a); return { x: c.x + dx + r.x, y: c.y + dy + r.y + 4 * Math.sin(u * 12 + i) }; });
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.globalAlpha = k;
    g.strokeStyle = "#2a1508"; g.lineWidth = 3; g.beginPath(); M2.curva(g, pts, false, 0.5); g.stroke();
    g.strokeStyle = "#8a522a"; g.lineWidth = 1.7; g.beginPath(); M2.curva(g, pts, false, 0.5); g.stroke();
    g.restore();
  }

  /* ---------- el golpe: cuándo pasa la ola por la cara de Guillermo ---------- */
  const CARA_G = { x: 800, y: 600 };                          // punto de la cara de Guillermo (retrato): mejilla y nariz
  function preparaZas() {
    ZAS = null;
    let mejor = null;
    for (let t = T.lat0; t <= T.lat1 + 0.15; t += 1 / 600) {
      const pC = poseC(t), pG = poseG(t), f = G.aPantalla(pG, G.cabeza(pG).a(CARA_G));
      const pts = lineaPelo(t, pC);
      let d = 1e9;
      for (let i = 2; i <= N_PELO; i++) d = Math.min(d, Math.hypot(pts[i].x - f.x, pts[i].y - f.y));
      // el borde del haz de pelo llega a la cara
      if (d < anchoPelo(t) * 0.7) { mejor = t; break; }
    }
    ZAS = mejor ?? (T.lat0 + 0.2);
  }

  /* =====================================================================================
   * DECORADO: plató de anuncio de champú
   * ===================================================================================== */
  const AN = { x: 640, y: 255, r: 175 };                       // aro de luz detrás de Carla
  const VEN = { x: 905, y: 205, r: 64 };                       // ventilador (cabeza)
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50);
    // fondo pastel de anuncio: menta arriba, rosa abajo
    const gr = g.createLinearGradient(0, -50, 0, 480); gr.addColorStop(0, "#9fdcd6"); gr.addColorStop(0.55, "#d7e6f0"); gr.addColorStop(1, "#f6c3d6");
    g.fillStyle = gr; g.fillRect(-60, -50, W + 120, 540);
    // ondas suaves en el fondo
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 18;
    for (let i = 0; i < 4; i++) { g.beginPath(); for (let x = -60; x <= W + 60; x += 20) { const y = 70 + i * 95 + 18 * Math.sin(x * 0.012 + i * 1.3); if (x === -60) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
    // aro de luz con halo
    const halo = g.createRadialGradient(AN.x, AN.y, AN.r * 0.4, AN.x, AN.y, AN.r * 1.5);
    halo.addColorStop(0, "rgba(255,255,255,0.75)"); halo.addColorStop(0.55, "rgba(255,250,245,0.35)"); halo.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(AN.x, AN.y, AN.r * 1.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.arc(AN.x, AN.y, AN.r + 9, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#fffdf6"; g.lineWidth = 15; g.beginPath(); g.arc(AN.x, AN.y, AN.r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.arc(AN.x, AN.y, AN.r - 9, 0, Math.PI * 2); g.stroke();
    // foco de estudio con difusor a la izquierda (detrás de Guillermo)
    const fx = 70;
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 4; g.beginPath(); g.moveTo(fx, 150); g.lineTo(fx, 470); g.moveTo(fx, 470); g.lineTo(fx - 34, 498); g.moveTo(fx, 470); g.lineTo(fx + 34, 498); g.moveTo(fx, 470); g.lineTo(fx + 4, 502); g.stroke();
    g.save(); g.translate(fx + 8, 120); g.rotate(0.18);
    g.fillStyle = "#24242c"; g.beginPath(); g.moveTo(-58, -64); g.lineTo(58, -64); g.lineTo(40, 64); g.lineTo(-40, 64); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    const df = g.createLinearGradient(0, -56, 0, 56); df.addColorStop(0, "#ffffff"); df.addColorStop(1, "#f0e6ee");
    g.fillStyle = df; g.beginPath(); g.moveTo(-50, -56); g.lineTo(50, -56); g.lineTo(34, 56); g.lineTo(-34, 56); g.closePath(); g.fill();
    g.restore();
    // pedestal con tres botes de champú (sin letras: una gota)
    const px = 165, py = 470;
    g.fillStyle = "#fbf7fb"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.rect(px - 46, py - 120, 92, 120); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(px, py - 120, 46, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(200,170,210,0.45)"; g.fillRect(px + 14, py - 118, 30, 116);
    [["#f49ac1", -26, 62], ["#7fd3c9", 0, 76], ["#c6a5e8", 26, 58]].forEach(([col, dx, h]) => {
      const bx = px + dx, by = py - 122;
      g.fillStyle = col; g.beginPath(); g.moveTo(bx - 11, by); g.lineTo(bx - 11, by - h + 14); g.quadraticCurveTo(bx - 11, by - h, bx - 3, by - h); g.lineTo(bx + 3, by - h);
      g.quadraticCurveTo(bx + 11, by - h, bx + 11, by - h + 14); g.lineTo(bx + 11, by); g.closePath(); g.fill(); g.lineWidth = 2.5; g.stroke();
      g.fillStyle = "#ffffff"; g.fillRect(bx - 5, by - h - 9, 10, 9); g.strokeRect(bx - 5, by - h - 9, 10, 9);
      g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.moveTo(bx, by - h * 0.6); g.quadraticCurveTo(bx + 6, by - h * 0.45, bx, by - h * 0.38); g.quadraticCurveTo(bx - 6, by - h * 0.45, bx, by - h * 0.6); g.fill();
      g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(bx - 8, by - h + 10, 3, h - 16);
    });
    // suelo de plató (ciclorama claro y brillante)
    const su = g.createLinearGradient(0, 470, 0, H + 50); su.addColorStop(0, "#f3e8f2"); su.addColorStop(1, "#d9c5dc");
    g.fillStyle = su; g.fillRect(-60, 470, W + 120, H + 50 - 470);
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(-60, 470, W + 120, 3);
    // reflejo del aro en el suelo
    const rf = g.createRadialGradient(AN.x, SUELO + 8, 10, AN.x, SUELO + 8, 220); rf.addColorStop(0, "rgba(255,255,255,0.7)"); rf.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rf; g.beginPath(); g.ellipse(AN.x, SUELO + 8, 220, 34, 0, 0, Math.PI * 2); g.fill();
    // viñeta suave
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(60,20,60,0.35)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  // ventilador de pie, de cara a Carla (hacia la izquierda)
  function ventilador(g, t) {
    const { x, y, r } = VEN;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    // pie y mástil
    g.fillStyle = "#c9ced6"; g.lineWidth = 3;
    g.beginPath(); g.ellipse(x + 10, SUELO - 4, 52, 11, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#9aa1ab"; g.fillRect(x + 4, y + 40, 12, SUELO - 8 - (y + 40)); g.strokeRect(x + 4, y + 40, 12, SUELO - 8 - (y + 40));
    // motor detrás de la rejilla
    g.fillStyle = "#e4e7ec"; g.beginPath(); g.ellipse(x + 30, y, 30, 36, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#b9bec7"; g.beginPath(); g.ellipse(x + 40, y, 14, 20, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // rejilla (vista de tres cuartos: elipse estrecha)
    const kx = 0.46;
    g.fillStyle = "rgba(220,235,245,0.35)"; g.beginPath(); g.ellipse(x, y, r * kx, r, 0, 0, Math.PI * 2); g.fill();
    // aspas: tres, giran; deprisa se ven como un disco borroso
    const a0 = anguloAspas(t), vel = velAspas(t), borroso = clamp((vel - 10) / 14);
    if (borroso < 0.98) {
      g.save(); g.globalAlpha = 1 - borroso; g.fillStyle = "#5fb7c9"; g.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const a = a0 + i * 2 * Math.PI / 3;
        g.beginPath();
        for (let k = 0; k <= 12; k++) { const th = a - 0.45 + 0.9 * k / 12, rr = r * 0.85; g.lineTo(x + Math.cos(th) * rr * kx, y + Math.sin(th) * rr); }
        g.lineTo(x, y); g.closePath(); g.fill(); g.stroke();
      }
      g.restore();
    }
    if (borroso > 0.02) {
      g.save(); g.globalAlpha = 0.55 * borroso;
      const dg = g.createRadialGradient(x, y, 4, x, y, r * 0.9); dg.addColorStop(0, "rgba(95,183,201,0.9)"); dg.addColorStop(1, "rgba(95,183,201,0.25)");
      g.fillStyle = dg; g.beginPath(); g.ellipse(x, y, r * 0.85 * kx, r * 0.85, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 2;
      for (let i = 0; i < 3; i++) { const th = a0 * 0.05 + i * 2.1; g.beginPath(); g.ellipse(x, y, r * 0.6 * kx, r * 0.6, 0, th, th + 1.2); g.stroke(); }
      g.restore();
    }
    // buje y alambres de la rejilla
    g.fillStyle = "#e4e7ec"; g.beginPath(); g.ellipse(x, y, 8 * kx * 1.4, 11, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(40,40,48,0.75)"; g.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) { const th = i * Math.PI / 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(th) * r * kx, y + Math.sin(th) * r); g.stroke(); }
    for (const rr of [0.4, 0.7]) { g.beginPath(); g.ellipse(x, y, r * rr * kx, r * rr, 0, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, r * kx, r, 0, 0, Math.PI * 2); g.stroke();
    // cintas atadas a la rejilla que ondean con el viento
    const v = viento(t);
    [["#ff7aa8", -0.6], ["#ffd23f", 0.2], ["#7a6cff", 0.85]].forEach(([col, th], i) => {
      const bx = x + Math.cos(th + Math.PI) * r * kx * 0.95, by = y + Math.sin(th) * r * 0.9, L = 18 + 46 * v;
      const pts = [];
      for (let k = 0; k <= 8; k++) { const s = k / 8;
        pts.push({ x: bx - L * s, y: by + (1 - v) * 40 * s * s + 7 * v * s * Math.sin(s * 6 - t * 18 + i * 2) }); }
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 6; g.beginPath(); M2.curva(g, pts, false, 0.5); g.stroke();
      g.strokeStyle = col; g.lineWidth = 3.6; g.beginPath(); M2.curva(g, pts, false, 0.5); g.stroke();
    });
    g.restore();
  }
  // rayas del viento que cruzan hacia la izquierda
  function rayasViento(g, t) {
    const v = viento(t); if (v <= 0.01) return;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 14; i++) {
      const vel = 520 + hash(i + 3) * 260, len = 50 + hash(i + 5) * 70, y0 = 140 + hash(i + 7) * 300;
      const ph = ((t - T.viento0) * vel / 900 + hash(i + 11)) % 1;
      const x = VEN.x - 30 - ph * 900, y = y0 + 6 * Math.sin(ph * 9 + i);
      const a = v * Math.sin(Math.PI * ph) * 0.55;
      if (a < 0.02) continue;
      g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - len * 0.5, y - 5, x - len, y + 2); g.stroke();
    }
    g.restore();
  }
  // burbujas de jabón que flotan (y el viento empuja a la izquierda)
  function burbujas(g, t) {
    g.save();
    for (let i = 0; i < 12; i++) {
      const per = 4.5 + hash(i + 20) * 3, ph = ((t + hash(i + 21) * per) / per) % 1;
      const x0 = 120 + hash(i + 22) * 820, deriva = -260 * viento(t) * ph;
      const x = x0 + deriva + 16 * Math.sin(ph * 6 + i), y = 560 - ph * 520, r = 6 + hash(i + 23) * 10;
      const a = Math.sin(Math.PI * ph) * 0.9; if (a < 0.03) continue;
      g.globalAlpha = a;
      g.fillStyle = "rgba(255,255,255,0.18)"; g.strokeStyle = "rgba(90,120,160,0.7)"; g.lineWidth = 1.4;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.strokeStyle = "rgba(255,170,220,0.6)"; g.beginPath(); g.arc(x, y, r * 0.75, 0.3, 1.5); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.15, -0.6, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 12, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 12, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  // chasquido de dedos: rayitas en la mano cercana de Carla
  function chasquido(g, t, pC) {
    const k = fase(t, T.chasca, T.chasca + 0.25); if (k <= 0 || k >= 1) return;
    const m = CA.aPantalla(pC, pC.manoCerca);
    g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.95 + i * 0.4, r0 = 14 + 14 * k;
      g.beginPath(); g.moveTo(m.x + Math.cos(a) * r0, m.y - 6 + Math.sin(a) * r0); g.lineTo(m.x + Math.cos(a) * (r0 + 9), m.y - 6 + Math.sin(a) * (r0 + 9)); g.stroke(); }
    g.restore();
  }
  // estela del latigazo: arcos blancos que siguen la punta de la ola
  function estelaOla(g, t, pC) {
    const k = dentro(t, T.lat0, T.lat0 + 0.05, T.lat1 - 0.05, T.lat1 + 0.12); if (k <= 0.01) return;
    const R = raiz(pC), L = largoPelo(t);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const rr = L * (0.7 + 0.15 * i), a1 = thRaiz(t - LAG * 0.9), a0 = thRaiz(t - LAG * 0.9 - 0.08 - 0.03 * i);
      g.lineWidth = 4 - i; g.beginPath(); g.arc(R.x, R.y, rr, Math.min(a0, a1), Math.max(a0, a1)); g.stroke();
    }
    g.restore();
  }
  // líneas de giro de peonza alrededor de Guillermo
  function lineasGiro(g, t, pG) {
    const z = zas(); const k = dentro(t, z + 0.05, z + 0.2, T.gira1 - 0.3, T.sienta); if (k <= 0.01) return;
    const x = G.aPantalla(pG, pG.pelvis).x;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const y = SUELO - 70 - i * 95, r = 62 + 8 * i, a0 = t * 16 + i * 1.3;
      g.beginPath(); g.ellipse(x, y, r, 13, 0, a0, a0 + 2.4); g.stroke(); }
    g.restore();
  }
  function corazones(g, t, pG) {
    const env = dentro(t, T.embobado + 0.2, T.embobado + 0.6, Math.min(zas(), T.huele1), Math.min(zas(), T.huele1) + 0.1); if (env <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 820, y: 380 }));
    g.save();
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.embobado) * 0.7 + i / 3) % 1;
      const x = c.x + 16 * Math.sin(t * 3 + i * 2) + 16 * i - 12, y = c.y - 70 * ph;
      g.globalAlpha = env * Math.sin(Math.PI * ph);
      g.save(); g.translate(x, y); g.scale(0.8, 0.8);
      g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, -2, -8, -14, 0, -6); g.bezierCurveTo(8, -14, 14, -2, 0, 8); g.closePath();
      g.fillStyle = i % 2 ? "#ff6f91" : "#ff3d6a"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.restore();
    }
    g.restore();
  }
  // olfateo: tres rayitas que entran por la nariz
  function snif(g, t, pG) {
    const z = zas(); const k = dentro(t, T.huele0 + 0.1, T.huele0 + 0.3, Math.min(z, T.huele1) - 0.1, Math.min(z, T.huele1)); if (k <= 0.01) return;
    const n = G.aPantalla(pG, G.cabeza(pG).a({ x: 870, y: 640 }));
    g.save(); g.strokeStyle = `rgba(120,70,40,${0.7 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const ph = ((t * 2.2 + i / 3) % 1), d = 40 * (1 - ph);
      g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(n.x + d, n.y - 8 + i * 6); g.quadraticCurveTo(n.x + d + 8, n.y - 12 + i * 6, n.x + d + 16, n.y - 8 + i * 6); g.stroke(); }
    g.restore();
  }
  function estrellitas(g, t, pG) {
    const k = dentro(t, T.sienta, T.sienta + 0.3, T.mareo1, T.nota + 0.3); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 790, y: 330 }));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 58, y: c.y - 24 + Math.sin(a) * 14, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (9 + 3 * q.z) * k;
      estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  function polvo(g, t, pG) {
    const k = fase(t, T.sienta - 0.03, T.sienta + 0.8); if (k <= 0 || k >= 1) return;
    const x = G.aPantalla(pG, pG.pelvis).x;
    g.save();
    for (let i = 0; i < 8; i++) { const lado = i % 2 ? 1 : -1, d = (30 + 80 * salida(k)) * (0.6 + hash(i + 500) * 0.6);
      g.globalAlpha = 0.45 * (1 - k); g.fillStyle = "#ffffff";
      g.beginPath(); g.ellipse(x + 20 + lado * d, SUELO - 8 - 20 * k * hash(i + 501), 14 + 18 * k, 8 + 8 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // soplido: nubecilla delante de los labios
  function soplido(g, t, pG) {
    const k = fase(t, T.sopla - 0.02, T.sopla + 0.45); if (k <= 0 || k >= 1) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.globalAlpha = 0.8 * (1 - k); g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(90,110,140,0.7)"; g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const d = 14 + 40 * salida(k) * (0.7 + 0.15 * i), r = 4 + 6 * k + i;
      g.beginPath(); g.arc(b.x + 8 + d * 0.55, b.y - 4 - d * 0.35 - i * 3, r, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  // destello en la sonrisa de Carla
  function destello(g, t, t0, x, y, r) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    const s = Math.sin(Math.PI * k);
    g.save(); estrellaPuntas(g, x, y, r * s, 4, t * 2, 0.22); g.fillStyle = "#fffef4"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = "#b08a3a"; g.stroke();
    g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(x, y, 1, x, y, r * 1.4 * s + 1); gr.addColorStop(0, `rgba(255,250,220,${0.6 * s})`); gr.addColorStop(1, "rgba(255,250,220,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 1.4 * s + 1, 0, Math.PI * 2); g.fill(); g.restore();
  }
  // destellos de anuncio alrededor de Carla
  function brillos(g, t, pC) {
    const k = viento(t); if (k <= 0.02) return;
    const c = CA.aPantalla(pC, CA.cabeza(pC).a({ x: 820, y: 420 }));
    g.save();
    for (let i = 0; i < 6; i++) {
      const per = 1.6 + hash(i + 70) * 1.2, ph = ((t + hash(i + 71) * per) / per) % 1, r = 9 * Math.sin(Math.PI * ph) * k;
      if (r < 0.6) continue;
      const a = hash(i + 72) * Math.PI * 2, d = 70 + hash(i + 73) * 90;
      estrella4(g, c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.9 + 30, r, t + i);
    }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const anuncio = dentro(t, T.anuncio0, T.anuncio0 + 1.2, T.ant0 + 0.3, T.lat1 + 0.2);
    const final = tramo(t, T.sienta, T.sienta + 0.8);
    return { k: 1 + 0.08 * anuncio + 0.03 * final, x: 512 + 90 * anuncio - 20 * final, y: 300 - 18 * anuncio + 8 * final };
  }

  function poses(t) { return { g: poseG(t), c: poseC(t) }; }

  class GuillermoMelena extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !CA.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (ZAS === null) preparaZas();
      const { g: pG, c: pC } = poses(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= ZAS ? 5 * Math.exp(-(t - ZAS) * 7) * suave(fase(t, ZAS, ZAS + 0.04)) : 0)
        + (t >= T.sienta ? 3 * Math.exp(-(t - T.sienta) * 8) * suave(fase(t, T.sienta, T.sienta + 0.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -50);
      burbujas(g, t);
      rayasViento(g, t);
      ventilador(g, t);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(80,40,90,0.22)";
      const xg = G.aPantalla(pG, pG.pelvis).x;
      g.beginPath(); g.ellipse(xg + (t > T.gira1 ? 40 : 0), SUELO + 2, t > T.gira1 ? 120 : 58, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pC.x + 4, SUELO + 2, 56, 7, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      // Guillermo (con el giro de peonza: escala horizontal cos θ alrededor de su pelvis)
      const gx = Math.cos(pG.giro);
      g.save(); g.translate(xg, 0); g.scale(Math.abs(gx) < 0.02 ? 0.02 * Math.sign(gx || 1) : gx, 1); g.translate(-xg, 0);
      G.dibujar(g, pG, t);
      g.restore();
      // la ola de pelo (por detrás de Carla, por delante de Guillermo) y Carla
      dibOla(g, t, pC);
      CA.dibujar(g, pC, t);
      brilloPelo(g, t, pC);
      estelaOla(g, t, pC);
      impacto(g, t, ZAS, G.aPantalla(pG, G.cabeza(pG).a(CARA_G)).x, G.aPantalla(pG, G.cabeza(pG).a(CARA_G)).y, 46);
      chasquido(g, t, pC);
      corazones(g, t, pG);
      snif(g, t, pG);
      lineasGiro(g, t, pG);
      polvo(g, t, pG);
      estrellitas(g, t, pG);
      soplido(g, t, pG);
      pelLabioSuelto(g, t);
      brillos(g, t, pC);
      const bocaC = CA.aPantalla(pC, CA.boca(pC)), ojoC = CA.aPantalla(pC, CA.cabeza(pC).a({ x: 985, y: 468 }));
      destello(g, t, T.dientes, bocaC.x + 6, bocaC.y - 4, 17);
      destello(g, t, T.guinoC + 0.05, ojoC.x + 4, ojoC.y - 4, 14);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00044", nombre: "Guillermo y Carla · La melena", crear: () => new GuillermoMelena() });
  window.__A2D_00044 = { pose: poses, poseG, poseC, T, DUR, zas: () => ZAS, lineaPelo };
})();
