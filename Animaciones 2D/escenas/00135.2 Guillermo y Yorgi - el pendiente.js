"use strict";
/* 00135.2 · Guillermo y Yorgi · Los pendientes
 *
 * Negro → un salón con luz de mañana: pared crema de rayas, una ventana grande con un edificio
 * soleado enfrente (persianas verdes, geranios), una cortinilla de cuadros rojos colgada a media
 * altura de una barra con anillas grandes de madera, un espejo de pie ovalado a la izquierda, una
 * alfombra redonda, una lámpara de pie, una planta y un cuadrito de playa.
 *
 * Yorgi cuenta algo y se ríe: sus aritos pillan la luz (¡ting!). Guillermo se queda embobado, se
 * toca el lóbulo vacío… mira alrededor, ve las anillas de la cortina y tiene una idea: saca dos de
 * la barra (la esquina de la cortina se descuelga), les da la vuelta (¡son enormes!) y se las cuelga
 * de las orejas. Tachán. Presume moviendo la cabeza y el aro, como un péndulo, le da en la mejilla
 * (¡toc!); lo intenta otra vez, ¡toc, toc!; se pica, gira cada vez más rápido y acaba dando vueltas
 * sobre sí mismo: los aros salen volando hacia fuera, uno sale disparado… y Yorgi lo caza al vuelo.
 * Guillermo queda mareado (ojos en espiral) con el otro aro dando bandazos. Yorgi se acerca por
 * detrás, le sujeta el aro, se lo quita con cuidado, saca del bolsillo un aro de clip diminuto y se
 * lo pone (¡tic!). Guillermo se ve en el espejo, se gira de perfil con la barbilla alta y el aro
 * brilla. Mira a cámara orgulloso; Yorgi levanta el pulgar → negro.
 *
 * Todo depende de `t` (determinista). Los aros grandes son péndulos amortiguados de verdad: al
 * cargar la escena se simula (paso fijo de 1/240 s) cada aro colgado del lóbulo a partir del
 * movimiento de la cabeza (aceleración del lóbulo, giro sobre sí mismo → fuerza centrífuga) y del
 * tope de la mejilla; los golpes salen de esa simulación. El aro cercano se dibuja en la capa de la
 * cabeza (coordenadas del retrato, pasa por detrás del lóbulo); el lejano, por detrás de la cabeza.
 * El giro conserva el grosor del perfil y funde ambos sentidos cuando Guillermo pasa de canto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, Yo = Yorgi;
  const DUR = 14.6;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });

  /* ---------- guion (s) ---------- */
  const T = {
    // 1 · los aritos de Yorgi
    yHabla0: 0.2, yHabla1: 0.72, yRie0: 0.6, yRie1: 1.35, brillo: 0.98, brillo2: 1.2,
    ooh: 1.0, toca0: 1.46, toca1: 1.68, toca2: 2.06, toca3: 2.26,
    // 2 · busca y descuelga
    busca0: 2.2, busca1: 2.55, idea: 2.64,
    alcC0: 2.74, alcC1: 3.02, fueraA: 3.24,
    alcL0: 2.98, alcL1: 3.3, fueraB: 3.56,
    gira0A: 3.3, gira1A: 3.62,          // da la vuelta al aro: ¡qué grande!
    // 3 · se los cuelga
    sube0: 3.68, cuelgaA: 4.12, cuelgaB: 4.3, baja: 4.42,
    tachan0: 4.46, tachan1: 4.72,
    // 4 · presume: los golpes
    sac1: 5.05, sac2: 5.92, sac3: 6.36, terco: 6.62,
    // 5 · el giro
    giro0: 7.0, giro1: 8.2,
    mareo0: 8.2, mareo1: 9.3,
    // 6 · Yorgi se los quita y le pone el de clip
    yAnda0: 8.42, yAnda1: 9.22, pasaB: 9.05,
    quita0: 9.26, quitaA: 9.6, pasa: 9.92,
    bols0: 9.98, bols1: 10.22, clip: 10.6, suelta: 10.7,
    yAtras0: 10.86, yAtras1: 11.36,
    // 7 · el espejo
    ve: 10.92, gira0: 11.26, gira1: 11.52, pose: 11.56, tingH: 11.92,
    // 8 · final
    pulgar0: 12.62, pulgar1: 12.92, camara: 12.82, tingFin: 13.26,
    fin: 13.95
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lerpAng = (a, b, k) => a + angDif(a, b) * k;
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const DD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1, 1, 1, 1), HABLA = D(0.85, 0.92, 0.9, 0.86, 0.8), FLOJA = D(0.55, 0.62, 0.56, 0.52, 0.48),
    PINZA_D = D(.46,.25,.22,.18,.16), PUNO = D(0.1, 0.06, 0.06, 0.06, 0.06), BOLS_D = D(0.4, 0.4, 0.4, 0.4, 0.4),
    PULGAR = D(1, 0, 0, 0, 0), FINA = D(0.62, 0.55, 0.4, 0.55, 1);      // meñique estirado, muy fino

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
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  // mirada hacia un punto de pantalla (desde el centro de la cara)
  function miraA(e, Rg, p, q, w, cx, cy) {
    if (w <= 0.001 || !q) return;
    const o = Rg.aPantalla(p, Rg.cabeza(p).a({ x: cx, y: cy }));
    let dx = q.x - o.x, dy = q.y - o.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    if (p.espejo) dx = -dx;
    e.mx = lerp(e.mx, 0.95 * dx, w); e.my = lerp(e.my, 0.95 * dy, w);
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.30, SUELO = 548, PARED = 452;
  const XG0 = 300, XY0 = 610, XY1 = 455, XY2 = 548;
  // barra de la cortinilla: extremo libre a la izquierda (le falta el remate)
  const ROD = { y: 250, x0: 346, x1: 646, r: 4.5 };
  const ANILLAS = [360, 384, 412, 436, 460, 484, 508, 532, 556, 580, 604, 628];
  const SOPORTES = [400, 616];
  const VENT = { x0: 392, x1: 624, y0: 58, y1: 384 };
  // aro de cortina (unidades del retrato; retrato → pantalla = 0,6 × S)
  const KR = 0.6 * S;
  const AR = { Ro: 112, Ri: 84 }, RO_S = AR.Ro * KR, RI_S = AR.Ri * KR;
  const SV_BARRA = 0.2, SV_OREJA = 0.72;
  const CY_ANILLA = ROD.y + RI_S - ROD.r;          // centro de una anilla colgada de la barra
  const R_AGARRE=(RO_S+RI_S)/2;
  const FONDO_ANILLA=CY_ANILLA+RO_S;           // por donde la coge la pinza
  const TOP_CORT = FONDO_ANILLA + 7, CORT_Y1 = 390;
  const ESPEJO = { x: 118, y: 300, rx: 46, ry: 118 };

  /* ---------- puntos de los retratos ---------- */
  const LOBULO_G = P(596, 650), LOBULO_GL = P(928, 646);     // lóbulo de Guillermo: cercano y (escondido) lejano
  const ARO_Y = P(578, 612), ARO_YL = P(969, 714);           // aritos del muñeco de Yorgi
  const PSI_CARA = 0.5;                                      // el aro cercano toca la mejilla
  const ARO_MINI = 18;                                       // aro de clip (radio en el retrato)

  /* =====================================================================================
   * MANOS: pistas [t0, t1, objetivo, curva]; objetivo { bols } | { hoja } | { scr, ref } | { ext }
   * (mu en la hoja: hacia el codo; sin mu, apunta solo al hombro)
   * ===================================================================================== */
  const PINZA=P(7.98,9.18),SEGUNDA=P(-4,7.6),PALMA=P(0,1);
  function puntaPulgar(d){
    const k=d.pulgar,ab=(d.indice+d.medio+d.anular+d.menique)/4,b=lerp(-5.5,-3,k*(1-ab));
    const a=lerp(-1.15,lerp(1.4,.95,ab),k),l=lerp(9.5,lerp(15,12.5,ab),k)/2;
    return P(8.6+l*(Math.sin(a*.85)+Math.sin(a)),b+l*(Math.cos(a*.85)+Math.cos(a)));
  }
  const offMano = (Rg, m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * Rg.JK, y: r.y * Rg.JK }, m.ang || 0); };
  const ptMano = (Rg, p, m, q) => { const o=offMano(Rg,m,q),k=m.puno??1;return Rg.aPantalla(p,P(m.x+o.x*k,m.y+o.y*k)); };
  const R_M = Rg => Rg.MUNECA_R * Rg.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M(G), y: m.y - Math.sin(mu) * R_M(G) });
  const BOLS_G = { cerca: punoDesde({ x: 131, y: 652 }, -1.75), lejos: punoDesde({ x: 372, y: 648 }, -1.75) };
  const DOBLA = { g: { cerca: -1, lejos: -1 }, y: { cerca: -1, lejos: 1 } };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p), dob = DOBLA[Rg === G ? "g" : "y"][lado], hom = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
    return o => {
      if (o.bols) {
        const B = Rg === G ? Tr(BOLS_G[lado]) : Rg.manoReposo(p, lado);
        return { x: B.x, y: B.y + (o.hondo || 0), mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || BOLS_D, dobla: o.dobla ?? dob };
      }
      if (o.ext !== undefined) {
        const L = (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L) * (o.largo || 1);
        const w = { x: hom.x + Math.cos(o.ext) * L, y: hom.y + Math.sin(o.ext) * L };
        return { x: w.x + Math.cos(o.ext) * R_M(Rg), y: w.y + Math.sin(o.ext) * R_M(Rg), mu: o.ext - Math.PI, ang: 0, puno: 1, dedos: o.dedos || FLOJA, dobla: o.dobla ?? dob };
      }
      let q0;
      if (o.hoja) q0 = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr; q0 = Rg.aHoja(p, sc); }
      const mu = o.mu ?? (Math.atan2(hom.y - q0.y, hom.x - q0.x) + (o.muOff || 0));
      const m = { mu, ang: o.ang || 0 };
      let q = q0;
      if (!o.hoja) { const f = offMano(Rg, m, o.ref || PALMA); q = { x: q0.x - f.x, y: q0.y - f.y }; }
      return { x: q.x, y: q.y, mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos || FLOJA, dobla: o.dobla ?? dob };
    };
  }
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerpAng(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  // la mano no puede ir más lejos de lo que da el brazo
  function alcanza(Rg, p, m, lado, k = 1.04) {
    const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), L = (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L) * k;
    const o = rota({ x: Math.cos(m.mu) * R_M(Rg), y: Math.sin(m.mu) * R_M(Rg) }, m.ang || 0);
    const dx = m.x + o.x - h.x, dy = m.y + o.y - h.y, d = Math.hypot(dx, dy);
    if (d > L) { const f = L / d; m.x = h.x + dx * f - o.x; m.y = h.y + dy * f - o.y; }
    return m;
  }
  const manoDe = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });

  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }

  /* =====================================================================================
   * GUILLERMO (izquierda; mira a la derecha, tras el giro a la izquierda y al final otra vez a la derecha)
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  // θ del giro sobre sí mismo: 1,5 vueltas (acaba mirando al espejo) y media vuelta para posar
  const theta = t => 3 * Math.PI * suave5(fase(t, T.giro0, T.giro1)) + Math.PI * suave(fase(t, T.gira0, T.gira1));
  // instante en que el aro lejano sale disparado (θ = 1,8π: va hacia Yorgi)
  const T_SUELTA = (() => { let a = T.giro0, b = T.giro1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (theta(m) < 1.8 * Math.PI) a = m; else b = m; } return (a + b) / 2; })();
  const T_ATRAPA = T_SUELTA + 0.42;
  // sacudidas de cabeza al presumir: [t0, t1, giro, dx (hoja)]
  const SACUDIDAS = [
    [T.sac1, T.sac1 + 0.5, 0.3, 22],
    [T.sac2, T.sac2 + 0.4, 0.34, 26],
    [T.sac3, T.sac3 + 0.34, -0.26, -18]
  ];
  const sacude = (t, t0, t1) => { const u = fase(t, t0, t1); if (u <= 0 || u >= 1) return 0; return u < 0.28 ? salida(u / 0.28) : 1 - suave((u - 0.28) / 0.72); };

  const CUERPOS_G = {
    inicio: { pel: 0, torso: 0.02, cab: 0.03, px: 0 },
    ooh: { pel: -4, torso: 0.08, cab: -0.06, px: 8 },
    toca: { pel: 0, torso: 0.03, cab: 0.08, px: 0 },
    busca: { pel: 0, torso: -0.02, cab: -0.08, px: -2 },
    alcanza: { pel: 6, torso: 0.16, cab: 0.16, px: 10 },
    mira: { pel: 0, torso: 0.05, cab: 0.06, px: 2 },
    sube: { pel: 0, torso: 0.03, cab: -0.02, px: 0 },
    tachan: { pel: -8, torso: -0.07, cab: -0.14, px: -2 },
    presume: { pel: -4, torso: -0.03, cab: -0.08, px: 0 },
    terco: { pel: 4, torso: 0.08, cab: 0.1, px: 4 },
    gira: { pel: -6, torso: -0.04, cab: -0.06, px: 0 },
    mareo: { pel: 10, torso: 0.0, cab: 0.06, px: 0 },
    ofrece: { pel: 0, torso: -0.05, cab: -0.15, px: -4 },
    espejo: { pel: -2, torso: 0.03, cab: -0.02, px: 2 },
    pose: { pel: -8, torso: -0.08, cab: -0.18, px: -4 },
    camara: { pel: -6, torso: -0.05, cab: -0.08, px: -2 }
  };
  const GUION_CUERPO_G = [
    [T.ooh, T.ooh + 0.25, "ooh", salida], [T.toca0 - 0.1, T.toca1, "toca"], [T.busca0, T.busca0 + 0.2, "busca"],
    [T.idea, T.idea + 0.18, "mira"], [T.alcC0, T.alcC1, "alcanza"], [T.sube0, T.sube0 + 0.3, "sube"],
    [T.tachan0, T.tachan1, "tachan", salida], [T.sac1 - 0.2, T.sac1, "presume"], [T.terco, T.terco + 0.25, "terco"],
    [T.giro0 - 0.1, T.giro0 + 0.2, "gira"], [T.mareo0, T.mareo0 + 0.3, "mareo"], [T.mareo1 - 0.2, T.quita0, "ofrece"],
    [T.ve, T.ve + 0.25, "espejo"], [T.gira0, T.pose + 0.15, "pose", salida], [T.camara, T.camara + 0.3, "camara"]
  ];
  const mareo = t => dentro(t, T.mareo0 - 0.05, T.mareo0 + 0.1, T.mareo1 - 0.4, T.mareo1 + 0.1);

  // cuerpo sin manos ni cara (lo que necesita la simulación de los aros)
  function cuerpoG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const th = theta(t), c = Math.cos(th);
    const respira = Math.sin(t * 2.3 + 0.4);
    const mr = mareo(t), u = t - T.mareo0;
    const x = XG0 + 7 * Math.sin(u * 5.2) * mr;
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true, hombrosContinuos: true, hombrosRecortados: true, espejo: c < 0,
      pelvis: { x: G.PELVIS.x + b.px + 10 * Math.sin(u * 5.2 + 0.6) * mr, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso + 0.07 * Math.sin(u * 5.2 + 1.2) * mr, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab + 0.12 * Math.sin(u * 7.1 + 2.0) * mr, dx: 10 * Math.cos(u * 7.1) * mr, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [t0, t1, a, dx] of SACUDIDAS) { const s = sacude(t, t0, t1); p.cabeza.ang += a * s; p.cabeza.dx += dx * s; }
    // terco: un cabeceo rápido antes de girar
    p.cabeza.ang += 0.08 * Math.sin((t - T.terco) * 20) * dentro(t, T.terco, T.terco + 0.05, T.terco + 0.25, T.terco + 0.32);
    // durante el giro el cuerpo se estira un poco y la cabeza se queda atrás
    const gv = campana(t, T.giro0, T.giro1);
    p.pelvis.y -= 10 * gv; p.cabeza.ang -= 0.06 * gv;
    // pies
    const hojaX = d => G.PELVIS.x + d / S;
    p.piernas.cerca = { tob: { x: hojaX(-24 - 4 * mr), y: TOB_G }, ang: 0 };
    p.piernas.lejos = { tob: { x: hojaX(25 + 6 * mr), y: TOB_G }, ang: 0 };
    // el giro: de puntillas (un pie se levanta un poco)
    const pt = campana(t, T.giro0 + 0.1, T.giro1 - 0.1);
    p.piernas.lejos.tob.y -= 18 * pt;
    p.piernas.cerca.tob.y=G.SUELO-93;
    p.piernas.lejos.tob.y=G.SUELO-93-5/S-18*pt;
    return {p,th,sq:Math.sqrt(c*c+.15*Math.sin(th)**2)};
  }

  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.05, sd: 8, si: 10, sonr: 0.45, ancho: 0.95 }),
    ooh: E({ mx: 0.95, my: -0.12, iris: 1.14, sd: 26, gd: 0.06, si: 28, gi: 0.06, abre: 16, ancho: 0.55, sonr: 0.1 }),
    anhelo: E({ mx: 0.9, my: -0.08, iris: 1.12, c: 0.12, sd: 22, gd: 0.16, si: 24, gi: 0.16, abre: 0, ancho: 0.75, sonr: -0.08 }),
    busca: E({ mx: -0.7, my: 0.1, sd: 8, gd: -0.04, si: 12, abre: 0, ancho: 0.82, sonr: 0.05 }),
    idea: E({ mx: 0.85, my: 0.55, iris: 1.08, sd: 28, si: 30, abre: 10, ancho: 1.12, sonr: 1.0 }),
    concentra: E({ mx: 0.75, my: 0.65, c: 0.2, sd: -4, gd: -0.08, si: -2, gi: -0.08, abre: 6, ancho: 0.7, sonr: 0.2, lengua: 0.7 }),
    encanta: E({ mx: 0.6, my: 0.35, iris: 1.12, sd: 24, si: 26, abre: 12, ancho: 1.1, sonr: 0.95 }),
    tachan: E({ mx: -0.7, my: 0.05, c: 0.4, h: 0.3, sd: 14, si: 18, abre: 6, ancho: 1.12, sonr: 0.95 }),
    chulo: E({ mx: 0.85, my: 0.05, c: 0.35, sd: 6, gd: -0.06, si: 14, abre: 0, ancho: 1.05, sonr: 0.8 }),
    au: E({ mx: 0.5, c: 0.3, wd: 0.7, z: 0.6, sd: -6, gd: -0.14, si: 16, gi: 0.1, abre: 10, ancho: 1.1, sonr: -0.45 }),
    terco: E({ mx: 0.9, my: 0.05, c: 0.32, sd: -14, gd: -0.24, si: -12, gi: -0.22, abre: 0, ancho: 0.72, sonr: -0.15, mof: 0.25 }),
    gira: E({ mx: 0.9, c: 0.45, h: 0.3, sd: 16, si: 18, abre: 14, ancho: 1.15, sonr: 1.0 }),
    mareo: E({ mx: 0.1, my: 0.1, c: 0.2, esp: 0.9, sd: 16, gd: 0.18, si: 18, gi: 0.18, abre: 8, ancho: 0.7, sonr: -0.2 }),
    ofrece: E({ mx: -0.85, my: -0.05, c: 0.3, sd: 12, gd: 0.05, si: 14, abre: 0, ancho: 0.9, sonr: 0.35 }),
    quieto: E({ mx: -0.6, c: 0.72, sd: 16, si: 18, abre: 0, ancho: 0.9, sonr: 0.5 }),
    tic: E({ mx: -0.85, iris: 1.08, sd: 24, si: 26, abre: 8, ancho: 0.62, sonr: 0.25 }),
    espejo: E({ mx: 0.9, my: 0.05, iris: 1.1, sd: 24, si: 26, abre: 12, ancho: 0.62, sonr: 0.3 }),
    pose: E({ mx: -0.95, my: 0.05, c: 0.42, sd: 4, gd: -0.08, si: 20, gi: 0.06, abre: 0, ancho: 1.08, sonr: 0.85 }),
    camara: E({ mx: -0.75, my: 0, c: 0.15, h: 0.3, sd: 18, si: 20, abre: 14, ancho: 1.12, sonr: 1.0 })
  };
  const GUION_CARA_G = [
    [T.ooh, T.ooh + 0.12, "ooh", salida], [T.toca0, T.toca0 + 0.25, "anhelo"], [T.busca0, T.busca0 + 0.12, "busca"],
    [T.idea, T.idea + 0.1, "idea", salida], [T.alcC0 + 0.1, T.alcC0 + 0.3, "concentra"], [T.gira0A, T.gira0A + 0.15, "encanta"],
    [T.cuelgaA - 0.1, T.cuelgaA + 0.1, "concentra"], [T.tachan0, T.tachan0 + 0.15, "tachan"], [T.sac1 - 0.2, T.sac1, "chulo"],
    [T.terco, T.terco + 0.12, "terco"], [T.giro0, T.giro0 + 0.2, "gira"], [T.mareo0 - 0.1, T.mareo0 + 0.15, "mareo"],
    [T.mareo1 - 0.25, T.quita0, "ofrece"], [T.quitaA - 0.15, T.quitaA + 0.1, "quieto"], [T.clip - 0.02, T.clip + 0.06, "tic", salida],
    [T.ve, T.ve + 0.2, "espejo"], [T.gira0 + 0.1, T.pose + 0.1, "pose"], [T.camara, T.camara + 0.25, "camara"]
  ];

  const cacheG = new Map();
  function poseG(t) {
    const k0 = t.toFixed(5);
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 12) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  function poseG0(t) {
    const cg = cuerpoG(t), p = cg.p;
    p._sq = cg.sq; p._th = cg.th;
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // busca: mira a un lado, al otro… y a la barra
    const bu = dentro(t, T.busca0, T.busca0 + 0.08, T.idea - 0.05, T.idea);
    ex.mx = lerp(ex.mx, Math.cos((t - T.busca0) * 9) * 0.9, bu); ex.my = lerp(ex.my, -0.2 + 0.2 * Math.sin((t - T.busca0) * 13), bu);
    if(t>=T.ve && t<T.camara+.15){const h=G.aPantalla(p,G.centroCabeza(p)),objetivo=reflejo(h);
      miraA(ex,G,p,objetivo,dentro(t,T.ve,T.ve+.16,T.camara-.06,T.camara+.15),760,560);}
    // ¡toc!: mueca con cada golpe del aro
    const au = golpeG(t);
    if (au > 0) Object.assign(ex, mezclaE(ex, CARAS_G.au, au));
    // presumiendo: mira de reojo a Yorgi
    p.cara = cara(ex, ex.esp > 0.3 ? 0 : parpadeo(t, [0.6, 2.4, 4.9, 6.85, 9.7, 12.3, 13.5]));
    p.rojo = 0;
    p.sudor = 0.5 * dentro(t, T.terco, T.terco + 0.2, T.giro0, T.giro0 + 0.2);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }
  // a cuánto de la mueca está (golpes del aro cercano, de la simulación)
  function golpeG(t) {
    if (!SIM) return 0;
    let o = 0;
    for (const b of SIM.golpes) { const u = t - b.t; if (u >= 0 && u < 0.6) o = Math.max(o,b.k*tramo(u,0,.045) * (1 - tramo(u, 0.2, 0.6))); }
    return clamp(o);
  }

  const lobuloG = p => G.aPantalla(p, G.cabeza(p).a(LOBULO_G));
  const lobuloGL = p => G.aPantalla(p, G.cabeza(p).a(LOBULO_GL));
  function manosG(p, t) {
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const W_ = (dx, dy) => () => ({ x: p.x + dx * (p.espejo ? -1 : 1), y: SUELO + dy });
    // donde se cuelga cada aro: la pinza en la parte de abajo del aro (cercano) o en su lado (lejano)
    const colgarA = () => { const l = lobuloG(p); return P(l.x,l.y+RI_S+R_AGARRE); };
    const colgarB = () => { const l = lobuloGL(p); return P(l.x+SV_OREJA*R_AGARRE,l.y+RI_S); };
    /* ----- mano cercana: el lóbulo, el aro A, tachán, giro, pose ----- */
    const PC = [
      [0, 0, { bols: true }],
      [T.toca0 - 0.14, T.toca0, { bols: true, sale: true, dedos: PINZA_D }],
      [T.toca0, T.toca1, { scr: () => lobuloG(p), ref: PINZA, dedos: PINZA_D, muOff: 0.15 }],
      [T.toca2, T.toca3, { bols: true, sale: true, dedos: FLOJA }],
      [T.toca3, T.toca3 + 0.06, { bols: true }],
      [T.alcC0 - 0.1, T.alcC0, { bols: true, sale: true, dedos: ABIERTA }],
      [T.alcC0, T.alcC1, { scr: P(ANILLAS[0], CY_ANILLA+R_AGARRE), ref: PINZA, dedos: PINZA_D, muOff: 0.1 }],
      [T.alcC1 + 0.02, T.fueraA, { scr: P(ROD.x0-6,CY_ANILLA+R_AGARRE), ref: PINZA, dedos: PINZA_D, muOff: 0.1 }, x => x],
      // le da la vuelta delante del pecho: ¡enorme!
      [T.fueraA, T.gira1A, { scr: W_(20, -262), ref: PINZA, dedos: PINZA_D, muOff: 0.2 }],
      [T.sube0, T.cuelgaA, { scr: colgarA, ref: PINZA, dedos: PINZA_D, muOff: 0.1, dobla: 1 }],
      [T.cuelgaA + 0.02, T.baja, { scr: W_(-64, -236), ref: PALMA, dedos: ABIERTA, muOff: 0.1, dobla: 1 }],
      // tachán: brazos abiertos hacia abajo
      [T.tachan0, T.tachan1, { ext: Math.PI - 0.95, dedos: ABIERTA }, salida],
      [T.sac1 - 0.3, T.sac1 - 0.05, { bols: true, sale: true, dedos: FLOJA }],
      [T.sac1 - 0.05, T.sac1, { bols: true }],
      // el giro: brazos fuera como un patinador
      [T.giro0 - 0.12, T.giro0 + 0.25, { ext: Math.PI - 0.3, dedos: ABIERTA }],
      [T.giro1 - 0.4, T.mareo0 + 0.25, { ext: Math.PI - 1.2, dedos: FLOJA }],
      [T.mareo1 - 0.3, T.mareo1, { bols: true, sale: true, dedos: FLOJA }],
      [T.mareo1, T.mareo1 + 0.05, { bols: true }],
      // pose: puños en las caderas
      [T.gira0 - 0.1, T.gira0 + 0.06, { bols: true, sale: true, dedos: PUNO }],
      [T.gira0 + 0.06, T.pose + 0.12, { hoja: P(138, 650), mu: -2.5, dedos: PUNO }, salida]
    ];
    const C = pista(PC, t, res);
    // juega con el lóbulo
    const jl = dentro(t, T.toca1, T.toca1 + 0.05, T.toca2 - 0.05, T.toca2);
    C.y += .65*Math.sin((t-T.toca1)*26)*jl/S;
    // mareado: los brazos se bambolean
    const mr = mareo(t);
    C.y += 18 * Math.sin((t - T.mareo0) * 6.3) * mr; C.x += 10 * Math.cos((t - T.mareo0) * 5.1) * mr;
    alcanza(G, p, C, "cerca");
    /* ----- mano lejana: el aro B (al lado de la mandíbula) ----- */
    const PL = [
      [0, 0, { bols: true }],
      [T.ooh, T.ooh + 0.2, { bols: true, sale: true, dedos: HABLA }],
      [T.ooh + 0.12, T.ooh + 0.4, { scr: W_(64, -236), ref: PALMA, dedos: HABLA, muOff: 0.35 }, salida],
      [T.toca0, T.toca0 + 0.3, { bols: true, sale: true, dedos: FLOJA }],
      [T.toca0 + 0.3, T.toca0 + 0.34, { bols: true }],
      [T.alcL0 - 0.1, T.alcL0, { bols: true, sale: true, dedos: ABIERTA }],
      [T.alcL0, T.alcL1, { scr: P(ANILLAS[1], CY_ANILLA+R_AGARRE), ref: PINZA, dedos: PINZA_D, dobla: 1 }],
      [T.alcL1 + 0.02, T.fueraB, { scr: P(ROD.x0-6,CY_ANILLA+R_AGARRE), ref: PINZA, dedos: PINZA_D, dobla: 1 }, x => x],
      [T.fueraB + 0.04, T.cuelgaB, { scr: colgarB, ref: PINZA, dedos: PINZA_D, dobla: -1, muOff: -0.15 }],
      [T.cuelgaB + 0.02, T.cuelgaB + 0.16, { scr: () => { const q = colgarB(); return { x: q.x + 16, y: q.y + 14 }; }, ref: PINZA, dedos: ABIERTA, dobla: -1 }],
      [T.tachan0, T.tachan1, { ext: 0.95, dedos: ABIERTA }, salida],
      [T.sac1 - 0.3, T.sac1 - 0.05, { bols: true, sale: true, dedos: FLOJA }],
      [T.sac1 - 0.05, T.sac1, { bols: true }],
      [T.giro0 - 0.12, T.giro0 + 0.25, { ext: 0.3, dedos: ABIERTA }],
      [T.giro1 - 0.4, T.mareo0 + 0.25, { ext: 1.05, dedos: FLOJA }],
      [T.mareo1 - 0.3, T.mareo1, { bols: true, sale: true, dedos: FLOJA }],
      [T.mareo1, T.mareo1 + 0.05, { bols: true }],
      [T.gira0 - 0.1, T.gira0 + 0.06, { bols: true, sale: true, dedos: PUNO }],
      [T.gira0 + 0.06, T.pose + 0.12, { hoja: P(352, 648), mu: -0.75, dedos: PUNO, dobla: 1 }, salida]
    ];
    const L = pista(PL, t, resL);
    L.y -= 16 * Math.sin((t - T.mareo0) * 5.7 + 1) * mr; L.x += 8 * Math.sin((t - T.mareo0) * 4.3) * mr;
    alcanza(G, p, L, "lejos");
    p.manoCerca = manoDe(C); p.manoLejos = manoDe(L);
    // el aro A en la mano (de la barra a la oreja)
    if (t >= T.fueraA && t < T.cuelgaA) {
      const pin = ptMano(G, p, p.manoCerca, PINZA);
      const sv = lerp(SV_BARRA, 0.86, tramo(t, T.gira0A, T.gira1A)) - 0.14 * tramo(t, T.sube0, T.cuelgaA);
      p.manoCerca.objeto=g=>conCamara(g,()=>aro(g,P(pin.x,pin.y-R_AGARRE),0,RO_S,RI_S,sv,1));
    }
    p._pinzaC = () => ptMano(G, p, p.manoCerca, PINZA);
    p._pinzaL = () => ptMano(G, p, p.manoLejos, PINZA);
  }

  /* ---------- la capa de la cabeza de Guillermo (retrato): aro cercano, aro de clip, golpes ---------- */
  function capaCabezaG(g, t, p) {
    const u = 1 / KR;                               // unidades del retrato por px de pantalla
    const lobulo = () => { g.beginPath(); g.rect(-400, -400, 2400, 2400); g.ellipse(LOBULO_G.x - 3, LOBULO_G.y - 9, 15, 13, 0, 0, TAU); };
    if (SIM && t >= T.cuelgaA && t < T.quitaA) {
      const s = estadoSim(SIM.A, t), psi = s.phi + p.cabeza.ang;
      const c = { x: LOBULO_G.x + AR.Ri * Math.sin(psi), y: LOBULO_G.y + AR.Ri * Math.cos(psi) };
      // estela del vaivén
      const v = Math.abs(s.w);
      if (v > 4) {
        g.save(); g.strokeStyle = `rgba(255,255,255,${clamp((v - 4) / 10) * 0.6})`; g.lineWidth = 3 * u; g.lineCap = "round";
        const sg = s.w > 0 ? -1 : 1;
        for (let i = 0; i < 2; i++) { const r = AR.Ri + AR.Ro + (8 + i * 9) * u; g.beginPath(); g.arc(LOBULO_G.x, LOBULO_G.y, r, Math.PI / 2 - psi + sg * 0.06, Math.PI / 2 - psi + sg * (0.06 + 0.25 + 0.04 * v), sg < 0); g.stroke(); }
        g.restore();
      }
      g.save(); lobulo(); g.clip("evenodd");
      aro(g, c, -psi, AR.Ro, AR.Ri, SV_OREJA, u, true);
      g.restore();
    }
    // el aro de clip
    if (t >= T.clip) {
      const psi=giroMini(p,t);
      g.save(); lobulo(); g.clip("evenodd");
      aroMini(g, { x: LOBULO_G.x + (ARO_MINI - 5) * Math.sin(psi), y: LOBULO_G.y + (ARO_MINI - 5) * Math.cos(psi) }, -psi, ARO_MINI, 0.8, u);
      g.restore();
      // ¡ting!
      for (const [t0, gr] of [[T.clip + 0.02, 0.6], [T.tingH, 1], [T.tingFin, 0.9]]) {
        const k = tramo(t, t0 - 0.06, t0 + 0.04) * (1 - tramo(t, t0 + 0.1, t0 + 0.42));
        if (k > 0.01) { const q = { x: LOBULO_G.x - 8 * Math.sin(psi), y: LOBULO_G.y + 2 * ARO_MINI - 8 }; halo(g, q.x, q.y, 48 * gr * k, k * 0.9); estrella4(g, q.x, q.y, 58 * gr * k, k, 0.2 + t * 1.5); estrella4(g, q.x, q.y, 30 * gr * k, k, Math.PI / 4 - t * 1.5, "#fff3b0"); }
      }
    }
    // ¡toc!: golpe del aro en la mejilla
    if (SIM) for (const b of SIM.golpes) {
      const v = t - b.t; if (v < 0 || v > 0.55) continue;
      const k = b.k * tramo(v,0,.04) * (1 - tramo(v, 0.18, 0.55));
      if (k < 0.01) continue;
      const q = b.q;
      // rojez (mancha, no tinte)
      g.save(); const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, 60);
      gr.addColorStop(0, `rgba(235,70,60,${0.45 * k})`); gr.addColorStop(1, "rgba(235,70,60,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, 60, 0, TAU); g.fill(); g.restore();
      estallido(g, q, k, v, u);
    }
    // ojitos brillantes al ver los aros de Yorgi
    const br = dentro(t, T.ooh + 0.05, T.ooh + 0.15, T.toca0 + 0.2, T.toca0 + 0.45);
    if (br > 0.01) for (const q of [P(774, 546), P(888, 580)]) estrella4(g, q.x, q.y, 26 * br, br, 0.3 + t * 2, "#ffffff");
  }

  /* =====================================================================================
   * YORGI (derecha, mira a la izquierda)
   * ===================================================================================== */
  const TOB_Y = Yo.SUELO - Yo.TOBILLO_ALTO;
  const CUERPOS_Y = {
    inicio: { pel: 0, torso: 0.02, cab: 0.02, px: 0 },
    habla: { pel: 0, torso: 0.05, cab: 0.04, px: 2 },
    risa: { pel: -4, torso: -0.07, cab: -0.2, px: -4 },
    mira: { pel: 0, torso: 0.02, cab: 0.05, px: 0 },
    mueca: { pel: 0, torso: -0.05, cab: -0.1, px: -4 },
    atrapa: { pel: 4, torso: 0.06, cab: -0.04, px: 6 },
    anda: { pel: 0, torso: 0.05, cab: 0.04, px: 2 },
    cuida: { pel: 4, torso: 0.07, cab: 0.12, px: 4 },
    orgullo: { pel: -2, torso: -0.02, cab: -0.04, px: 0 }
  };
  const GUION_CUERPO_Y = [
    [T.yHabla0, T.yHabla0 + 0.2, "habla"], [T.yRie0, T.yRie0 + 0.2, "risa", salida], [T.yRie1, T.yRie1 + 0.3, "mira"],
    [T.sac2 + 0.1, T.sac2 + 0.25, "mueca", salida], [T.sac2 + 0.6, T.sac2 + 0.9, "mira"],
    [T_SUELTA - 0.1, T_ATRAPA, "atrapa"], [T.yAnda0, T.yAnda0 + 0.2, "anda"], [T.quita0 - 0.2, T.quita0 + 0.1, "cuida"],
    [T.yAtras0, T.yAtras1, "orgullo"]
  ];
  const CARAS_Y = {
    inicio: E({ mx: 0.9, my: 0.05, sd: 6, si: 6, sonr: 0.5, ancho: 1.0 }),
    habla: E({ mx: 0.9, sd: 14, si: 14, sonr: 0.6, ancho: 1.0 }),
    risa: E({ mx: 0.6, my: -0.2, c: 0.55, h: 0.7, sd: 14, si: 14, abre: 18, ancho: 1.12, sonr: 1.0 }),
    mira: E({ mx: 0.9, my: 0.1, sd: 10, si: 12, sonr: 0.55, ancho: 1.0 }),
    divertido: E({ mx: 0.9, my: 0.05, c: 0.1, sd: 18, gd: 0.04, si: 10, abre: 4, ancho: 1.05, sonr: 0.75 }),
    mueca: E({ mx: 0.9, c: 0.4, wd: 0.4, sd: 18, gd: 0.16, si: 16, gi: 0.16, abre: 6, ancho: 1.15, sonr: -0.3 }),
    atento: E({ mx: 0.85, my: -0.3, iris: 1.05, sd: 18, si: 20, abre: 4, ancho: 0.8, sonr: 0.3 }),
    chulo: E({ mx: 0.9, my: 0.0, c: 0.32, sd: 2, gd: -0.06, si: 14, abre: 0, ancho: 1.05, sonr: 0.85 }),
    cuida: E({ mx: 0.9, my: 0.3, c: 0.25, sd: 10, si: 12, abre: 0, ancho: 0.9, sonr: 0.45 }),
    orgullo: E({ mx: 0.85, my: 0, c: 0.3, h: 0.4, sd: 14, si: 14, abre: 10, ancho: 1.1, sonr: 1.0 }),
    camara: E({ mx: -0.7, my: 0, c: 0.2, h: 0.4, sd: 14, si: 14, abre: 12, ancho: 1.1, sonr: 1.0 })
  };
  const GUION_CARA_Y = [
    [T.yHabla0, T.yHabla0 + 0.15, "habla"], [T.yRie0, T.yRie0 + 0.12, "risa", salida], [T.yRie1, T.yRie1 + 0.25, "mira"],
    [T.tachan0, T.tachan0 + 0.3, "divertido"], [T_SUELTA - 0.05, T_SUELTA + 0.1, "atento"], [T_ATRAPA, T_ATRAPA + 0.12, "chulo"],
    [T.yAnda0 + 0.2, T.yAnda1, "divertido"], [T.quita0 - 0.1, T.quita0 + 0.15, "cuida"], [T.suelta, T.suelta + 0.2, "orgullo"],
    [T.camara - 0.1, T.camara + 0.2, "camara"]
  ];
  const xY = t => lerp(lerp(XY0, XY1, tramo(t, T.yAnda0, T.yAnda1)), XY2, tramo(t, T.yAtras0, T.yAtras1));
  // pasos (pantalla): [t0, t1, x, alto]
  const PIES_Y = {
    lejos: [[0, 0, XY0 - 24, 0], [T.yAnda0, T.yAnda0 + 0.26, 525, 12], [T.yAnda0 + 0.46, T.yAnda0 + 0.72, XY1 - 26, 12],
      [T.yAtras0 + 0.2, T.yAtras0 + 0.46, XY2 - 24, 10]],
    cerca: [[0, 0, XY0 + 24, 0], [T.yAnda0 + 0.22, T.yAnda0 + 0.5, 478, 12], [T.yAnda0 + 0.62, T.yAnda0 + 0.8, XY1 + 22, 6],
      [T.yAtras0, T.yAtras0 + 0.26, XY2 + 24, 10]]
  };
  function pie(t, lista) {
    let x = lista[0][2], lev = 0;
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, x1, alto] = lista[i]; if (t <= t0) break;
      x = lerp(x, x1, tramo(t, t0, t1)); lev = Math.max(lev, alto * campana(t, t0, t1));
    }
    return { x, lev };
  }
  const cacheY = new Map();
  function poseY(t) {
    const k0 = t.toFixed(5);
    if (cacheY.has(k0)) return cacheY.get(k0);
    if (cacheY.size > 12) cacheY.clear();
    const p = poseY0(t); cacheY.set(k0, p); return p;
  }
  function poseY0(t) {
    const b = guion(GUION_CUERPO_Y, CUERPOS_Y, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const x = xY(t);
    const p = { x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true, espejo: true, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      pelvis: { x: Yo.PELVIS.x + b.px, y: Yo.PELVIS.y + b.pel + respira * 0.8 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // habla y se ríe: la cabeza acompaña
    const hb = dentro(t, T.yHabla0, T.yHabla0 + 0.1, T.yHabla1, T.yHabla1 + 0.1);
    p.cabeza.ang += 0.04 * Math.sin(t * 8.3) * hb;
    const ri = dentro(t, T.yRie0, T.yRie0 + 0.1, T.yRie1 - 0.2, T.yRie1);
    p.cabeza.ang += 0.035 * Math.sin((t - T.yRie0) * 19) * ri; p.torso += 0.015 * Math.sin((t - T.yRie0) * 19) * ri;
    // anda: el cuerpo sube y baja
    const fl = pie(t, PIES_Y.lejos), fc = pie(t, PIES_Y.cerca);
    p.pelvis.y -= (fl.lev + fc.lev) * 0.35 / S;
    p.piernas.lejos = { tob: { x: Yo.aHoja(p, { x: fl.x, y: SUELO }).x, y: Yo.SUELO-82.05-(5+fl.lev)/S }, ang: 0 };
    p.piernas.cerca = { tob: { x: Yo.aHoja(p, { x: fc.x, y: SUELO }).x, y: Yo.SUELO-82.05-fc.lev/S }, ang: 0 };
    // el aro atrapado: le da un tironcito a la mano
    const ex = guion(GUION_CARA_Y, CARAS_Y, "inicio", t);
    if (hb > 0) { ex.abre += (5 + 9 * Math.abs(Math.sin(t * 12.5))) * hb; }
    if (ri > 0) { ex.abre += 6 * Math.abs(Math.sin((t - T.yRie0) * 19)) * ri; }
    // mueca con los golpes de Guillermo
    const au = golpeG(t - 0.06);
    if (au > 0) Object.assign(ex, mezclaE(ex, CARAS_Y.mueca, 0.8 * au));
    // sigue con la vista el aro que vuela
    const vu = vueloB(t);
    if (vu) miraA(ex, Yo, p, vu.c, campana(vu.u, -0.3, 1.2), 850, 560);
    p.cara = cara(ex, parpadeo(t, [1.9, 3.9, 5.6, 7.5, 10.3, 12.1, 13.6]));
    manosY(p, t);
    p.capaCabeza = (g, tt) => capaCabezaY(g, tt, p);
    return p;
  }

  const ATRAPA = P(XY0 - 100, 280);
  const PASA = () => P(xY(T.pasa) - 4, 300);
  const cambioB=p=>Yo.aPantalla(p,Yo.tronco(p)(P(260,548)));
  const resta=(a,b)=>P(a.x-b.x,a.y-b.y),suma=(a,b)=>P(a.x+b.x,a.y+b.y);
  const sujecionA=sv=>P(-.5*R_AGARRE*sv,-Math.sqrt(.75)*R_AGARRE);
  function orejaA(p,t){
    const l=lobuloG(p),sg=p.espejo?-1:1,phi=SIM?estadoSim(SIM.A,t).phi:0,a=-sg*phi;
    const c=suma(l,rota(P(0,RI_S),a));
    return {c,a,sv:SV_OREJA,pin:suma(c,rota(sujecionA(SV_OREJA),a))};
  }
  function manosY(p, t) {
    const res = resolutor(Yo, p, "cerca"), resL = resolutor(Yo, p, "lejos");
    const pG = () => poseG(t);
    /* ----- mano lejana (delante, la del reloj): habla, atrapa, quita, aro de clip, pulgar ----- */
    const H = Yo.HOMBRO;
    const PL = [
      [0, 0, { bols: true }],
      [T.yHabla0 - 0.1, T.yHabla0 + 0.05, { bols: true, sale: true, dedos: HABLA }],
      [T.yHabla0 + 0.05, T.yHabla0 + 0.3, { hoja: P(H.x + 128, H.y + 190), dedos: HABLA, mu: -2.2 }],
      [T.yRie0 + 0.1, T.yRie0 + 0.4, { hoja: P(H.x + 70, H.y + 250), dedos: FLOJA, mu: -1.9 }],
      [T.yRie1, T.yRie1 + 0.3, { bols: true, sale: true, dedos: FLOJA }],
      [T.yRie1 + 0.3, T.yRie1 + 0.34, { bols: true }],
      // ¡zas!: lo caza al vuelo
      [T_SUELTA - 0.2, T_SUELTA + 0.02, { bols: true, sale: true, dedos: ABIERTA }],
      [T_SUELTA + 0.02, T_ATRAPA - 0.05, { scr: ATRAPA, ref: PINZA, dedos: ABIERTA, muOff: 0.2 }, salida],
      [T_ATRAPA - 0.05, T_ATRAPA, { scr: ATRAPA, ref: PINZA, dedos: PINZA_D, muOff: 0.2 }],
      [T_ATRAPA, T_ATRAPA + 0.1, { scr: P(ATRAPA.x + 5, ATRAPA.y + 10), ref: PINZA, dedos: PINZA_D, muOff: 0.2 }, salida],
      [T_ATRAPA + 0.2, T.yAnda0 + 0.2, { hoja: P(H.x + 90, H.y + 225), dedos: PINZA_D, mu: -2.0 }],
      [T.yAnda0+.22,T.pasaB,{scr:()=>cambioB(p),ref:PINZA,dedos:PINZA_D}],
      [T.pasaB+.03,T.quita0,{hoja:P(H.x+100,H.y+185),dedos:ABIERTA,mu:-2}],
      [T.quita0,T.quitaA-.11,{scr:()=>orejaA(pG(),t).pin,ref:PINZA,dedos:PINZA_D,muOff:.15,dobla:-1}],
      [T.quitaA+.015,T.quitaA+.18,{scr:()=>suma(orejaA(pG(),T.quitaA).pin,P(12,-6)),ref:PINZA,dedos:PINZA_D,muOff:.15,dobla:-1}],
      [T.quitaA + 0.18, T.pasa, { scr: PASA, ref: PINZA, dedos: PINZA_D, muOff: 0.1, dobla: -1 }],
      // al bolsillo: el aro de clip
      [T.bols0, T.bols1, { bols: true, hondo: 22, dedos: PINZA_D }],
      [T.bols1,T.bols1+.09,{scr:()=>bolsilloMini(p),ref:PINZA,dedos:PINZA_D,mu:-1.75}],
      [T.bols1+.09,T.clip, { scr: () => { const l = lobuloG(pG()); return P(l.x,l.y); }, ref: PINZA, dedos: PINZA_D, muOff: 0.15, dobla: -1 }],
      [T.suelta, T.suelta + 0.22, { scr: () => { const l = lobuloG(pG()); return { x: l.x + 22, y: l.y + 30 }; }, ref: PINZA, dedos: ABIERTA, muOff: 0.1, dobla: -1 }],
      [T.suelta + 0.22, T.yAtras0 + 0.3, { bols: true, sale: true, dedos: FLOJA }],
      [T.yAtras0 + 0.3, T.yAtras0 + 0.34, { bols: true }],
      // pulgar arriba (antebrazo horizontal)
      [T.pulgar0 - 0.1, T.pulgar0, { bols: true, sale: true, dedos: PUNO }],
      [T.pulgar0, T.pulgar1, { hoja: P(H.x + 128, H.y + 158), mu: Math.PI, dedos: PULGAR, dobla: 1 }, salida]
    ];
    const L = pista(PL, t, resL);
    // el pulgar: un toquecito de énfasis
    L.y -= 8 * campana(t, T.pulgar1, T.pulgar1 + 0.22);
    alcanza(Yo, p, L, "lejos");
    /* ----- mano cercana (detrás): recibe los aros y los lleva colgando ----- */
    const HC = Yo.HOMBRO_C;
    const PC = [
      [0, 0, { bols: true }],
      [T.yAnda0+.08,T.yAnda0+.25,{bols:true,sale:true,dedos:ABIERTA}],
      [T.yAnda0+.25,T.pasaB,{scr:()=>cambioB(p),ref:SEGUNDA,dedos:PINZA_D}],
      [T.pasaB+.06,T.quita0,{hoja:P(HC.x+42,HC.y+278),mu:-1.6,dedos:PINZA_D}],
      [T.pasa - 0.2, T.pasa, { scr: () => { return PASA(); }, ref: PINZA, dedos: PINZA_D, muOff: 0.1 }],
      [T.pasa + 0.08, T.pasa + 0.45, { hoja: P(HC.x + 30, HC.y + 300), dedos: PINZA_D, mu: -1.5 }]
    ];
    const C = pista(PC, t, res);
    // los aros se balancean y al final les da vueltas en el dedo
    alcanza(Yo, p, C, "cerca");
    p.manoLejos = manoDe(L); p.manoCerca = manoDe(C);
    // objetos en las manos (encima de la mano, debajo de los dedos)
    const pinL = ptMano(Yo, p, p.manoLejos, PINZA), pinC = ptMano(Yo, p, p.manoCerca, PINZA);
    p._pinzaL = pinL; p._pinzaC = pinC;
    const enL = [], enC = [];
    if(t>=T_ATRAPA)(t<T.pasaB?enL:enC).push("B");
    if(t>=T.quitaA)(t<T.pasa?enL:enC).push("A");
    const mini = t >= T.bols1 && t < T.clip;
    if (enL.length || mini) p.manoLejos.objeto = g => conCamara(g, () => {
      enL.forEach(n => aroColgado(g, pinL, t, n));
      if(mini)miniEnMano(g,p,t);
    });
    if(enC.length)p.manoCerca.objeto=g=>conCamara(g,()=>enC.forEach(n=>aroColgado(g,n==="B"?ptMano(Yo,p,p.manoCerca,SEGUNDA):pinC,t,n)));
  }
  // aro colgado de una pinza (pantalla), continuo de mano en mano: el atrapado al vuelo da dos vueltas
  // al dedo; el otro se va separando un poco; al pasar de mano se balancean y al final Yorgi juega con ellos
  const bolsilloMini=p=>Yo.aPantalla(p,Yo.tronco(p)(P(403,664)));
  function giroMini(p,t){
    const v=Math.max(0,t-T.clip),u=Math.max(0,t-T.gira1);
    return -.8*p.cabeza.ang+.5*Math.exp(-v*4)*Math.sin(v*15)+.4*Math.exp(-u*3.5)*Math.sin(u*13);
  }
  function miniGeometria(p,t){
    const g=poseG(t),sg=g.espejo?-1:1,a=sg*(g.cabeza.ang-giroMini(g,t))*tramo(t,T.clip-.14,T.clip);
    return {c:suma(p._pinzaL,rota(P(0,(ARO_MINI-5)*KR),a)),a};
  }
  function miniEnMano(g,p,t){
    const q=miniGeometria(p,t);g.save();
    if(t<T.bols1+.23){const b=bolsilloMini(p);g.beginPath();g.rect(0,0,W,b.y+1);g.clip();}
    aroMini(g,q.c,q.a,ARO_MINI*KR,.8,1);g.restore();
  }
  function aroColgado(g, pin, t, n) {
    const q=colgado(pin,t,n);aro(g,q.c,q.a,RO_S,RI_S,q.sv,1,true);
  }
  function colgado(pin,t,n){
    let a=0,sv=SV_OREJA,ref=P(0,-RI_S);
    if(n==="B"){
      const k=fase(t,T_ATRAPA,T.pasaB-.06);a=2*TAU*(1-(1-k)**2);
    }else{
      const k=tramo(t,T.quitaA,T.pasa),g=poseG(T.quitaA),ini=orejaA(g,T.quitaA).a;
      a=lerp(ini,-.31,k);sv=lerp(SV_OREJA,.61,k);ref=mezcla(sujecionA(SV_OREJA),P(0,-RI_S),k);
    }
    const v=t-T.pasa;if(v>0)a+=(n==="B"?.22:.17)*Math.exp(-v*3)*Math.sin(v*9);
    a+=TAU*suave(fase(t,T.pose+.1,T.pose+1));
    return {c:resta(pin,rota(ref,a)),a,sv,ref};
  }

  function capaCabezaY(g, t, p) {
    // los aritos de Yorgi pillan la luz (rampas de varios fotogramas)
    for (const [t0, q, gr] of [[T.brillo, ARO_Y, 1.45], [T.brillo2, ARO_YL, 0.9], [T.tingFin + 0.06, ARO_Y, 1.1]]) {
      const k = tramo(t, t0 - 0.1, t0 + 0.03) * (1 - tramo(t, t0 + 0.08, t0 + 0.45));
      if (k < 0.01) continue;
      halo(g, q.x, q.y + 14, 70 * gr * k, k);
      estrella4(g, q.x, q.y + 14, 90 * gr * k, k, 0.25 + t * 1.6);
      estrella4(g, q.x, q.y + 14, 46 * gr * k, k, Math.PI / 4 - t * 1.6, "#fff3b0");
    }
  }

  /* =====================================================================================
   * LOS AROS: simulación de péndulo amortiguado (en el marco del cuerpo, hoja × S, sin espejo)
   * φ: ángulo desde la vertical hacia delante (+x de la hoja); en el retrato ψ = φ + ángulo de la cabeza
   * ===================================================================================== */
  let SIM=null,LANZA=null;
  const DT = 1 / 240, W0 = 8.4, ZETA = 0.085, GRAV = 2250, REB = 0.38;
  function simula() {
    const n = Math.ceil(DUR / DT) + 3;
    const LA = [], LB = [], PX = [], ANG = [], TH = [], SG = [];
    for (let i = 0; i < n; i++) {
      const t = i * DT, cg = cuerpoG(t), p = cg.p, Hc = G.cabeza(p);
      const a = Hc.a(LOBULO_G), b = Hc.a(LOBULO_GL);
      LA.push({ x: (a.x - G.PELVIS.x) * S, y: (a.y - G.SUELO) * S });
      LB.push({ x: (b.x - G.PELVIS.x) * S, y: (b.y - G.SUELO) * S });
      PX.push(p.x); ANG.push(p.cabeza.ang); TH.push(cg.th); SG.push(p.espejo ? -1 : 1);
    }
    const golpes = [];
    function un(L, t0, t1, cerca) {
      const phi = new Float32Array(n), om = new Float32Array(n);
      let f = 0, w = cerca ? -2.2 : 1.8, activo = false, ultimo = -9;
      for (let i = 1; i < n - 1; i++) {
        const t = i * DT;
        if (t < t0 || t > t1) { phi[i] = f; om[i] = 0; continue; }
        if (!activo) { activo = true; f = 0; }
        const d2 = (A, k) => (A[i + 1][k] - 2 * A[i][k] + A[i - 1][k]) / (DT * DT);
        let ax = d2(L, "x") + SG[i] * (PX[i + 1] - 2 * PX[i] + PX[i - 1]) / (DT * DT), ay = d2(L, "y");
        const Om = (TH[i + 1] - TH[i - 1]) / (2 * DT);
        ax -= Om * Om * (L[i].x + RI_S * Math.sin(f));
        ax = clamp(ax, -40000, 40000); ay = clamp(ay, -40000, 40000);
        // Yorgi lo sujeta antes de quitárselo
        const z = ZETA + (cerca ? 1.6 * tramo(t, T.quita0 + 0.12, T.quitaA - 0.08) : 0);
        const acc = -W0 * W0 * (Math.sin(f) * (1 - ay / GRAV) + Math.cos(f) * ax / GRAV) - 2 * z * W0 * w;
        w += acc * DT; f += w * DT;
        if (cerca) {
          // tope: la mejilla
          const lim = PSI_CARA - ANG[i], limV = -(ANG[i + 1] - ANG[i - 1]) / (2 * DT);
          if (f > lim) {
            const rel = w - limV;
            if (rel > 0) { if (rel > 1.6 && t - ultimo > 0.12) { golpes.push({ t, k: clamp(rel / 7, 0.45, 1), rel }); ultimo = t; } w = limV - REB * rel; }
            f = lim;
          }
          if (f < -2.3 - ANG[i]) { f = -2.3 - ANG[i]; w = Math.max(w, 0); }
        } else {
          const lim = -0.75 - ANG[i];
          if (f < lim) { f = lim; if (w < 0) w = -REB * w; }
        }
        phi[i] = f; om[i] = w;
      }
      phi[0] = phi[1]; phi[n - 1] = phi[n - 2]; om[0] = om[1]; om[n - 1] = om[n - 2];
      return { phi, om };
    }
    const A = un(LA, T.cuelgaA, T.quitaA, true), B = un(LB, T.cuelgaB, T_SUELTA, false);
    // punto del golpe en el retrato: el borde del aro que da en la mejilla
    for (const b of golpes) {
      const psi = PSI_CARA, c = { x: LOBULO_G.x + AR.Ri * Math.sin(psi), y: LOBULO_G.y + AR.Ri * Math.cos(psi) };
      const nrm = { x: Math.cos(psi), y: -Math.sin(psi) };
      b.q = { x: c.x + nrm.x * AR.Ro * SV_OREJA * 0.95, y: c.y + nrm.y * AR.Ro * SV_OREJA * 0.95 };
    }
    SIM={A,B,golpes,n};
    const h=.001,ultimo=salidaMundo(T_SUELTA),previo=salidaMundo(T_SUELTA-h),v=P((ultimo.c.x-previo.c.x)/h,(ultimo.c.y-previo.c.y)/h),dt=T_ATRAPA-T_SUELTA;
    ATRAPA.x=ultimo.c.x+v.x*dt;
    LANZA={...ultimo,v,omega:angDif(ultimo.a,previo.a)/h,g:2*(ATRAPA.y+RI_S-ultimo.c.y-v.y*dt)/(dt*dt)};
    cacheG.clear();cacheY.clear();
  }
  function estadoSim(R, t) {
    const x = clamp(t / DT, 0, SIM.n - 1.001), i = Math.floor(x), k = x - i;
    const inicio=R===SIM.A?T.cuelgaA:T.cuelgaB;
    return {phi:lerp(R.phi[i],R.phi[i+1],k)*tramo(t,inicio,inicio+2*DT),w:lerp(R.om[i],R.om[i+1],k)};
  }
  // centro del aro lejano en pantalla (sin el aplastamiento del giro)
  function centroB(pG, t) {
    const s = estadoSim(SIM.B, t), l = lobuloGL(pG), sg = pG.espejo ? -1 : 1;
    return { c: { x: l.x + sg * RI_S * Math.sin(s.phi), y: l.y + RI_S * Math.cos(s.phi) }, a: -sg * s.phi };
  }
  // el aro lejano en vuelo, de la oreja de Guillermo a la mano de Yorgi
  function salidaMundo(t){
    const {p,sq}=cuerpoG(t),b=centroB(p,t);
    return {c:P(p.x+(b.c.x-p.x)*sq,b.c.y),a:b.a,sq};
  }
  function vueloB(t){
    if(!LANZA||t<T_SUELTA||t>=T_ATRAPA)return null;
    const u=fase(t,T_SUELTA,T_ATRAPA),dt=T_ATRAPA-T_SUELTA,v=t-T_SUELTA,L=LANZA;
    const w1=4*TAU/(T.pasaB-.06-T_ATRAPA);
    const rot=L.a*(2*u**3-3*u*u+1)+L.omega*dt*(u**3-2*u*u+u)+TAU*(-2*u**3+3*u*u)+w1*dt*(u**3-u*u);
    return {u,c:P(L.c.x+L.v.x*v,L.c.y+L.v.y*v+.5*L.g*v*v),rot,sv:SV_OREJA-.40*Math.sin(u*TAU)**2,sq:lerp(L.sq,1,suave(u))};
  }
  function aroEnVuelo(g,v,ojal=true){
    g.save();g.translate(v.c.x,v.c.y);g.scale(v.sq,1);aro(g,P(0,0),v.rot,RO_S,RI_S,v.sv,1,ojal);g.restore();
  }

  /* =====================================================================================
   * DIBUJO DE LOS AROS
   * ===================================================================================== */
  // aro de madera: c centro, rot giro (su +y local apunta hacia donde cuelga), sv aplastamiento lateral, u = unidades por px
  function aro(g, c, rot, Ro, Ri, sv, u, ojal = true) {
    sv = Math.max(0.05, sv);
    g.save(); g.translate(c.x, c.y); g.rotate(rot); g.lineJoin = "round"; g.lineCap = "round";
    const anillo = () => { g.beginPath(); g.ellipse(0, 0, Ro * sv, Ro, 0, 0, TAU); g.ellipse(0, 0, Ri * sv, Ri, 0, 0, TAU); };
    anillo();
    const gr = g.createLinearGradient(-Ro * sv, -Ro, Ro * sv, Ro);
    gr.addColorStop(0, "#e9ad6c"); gr.addColorStop(0.45, "#c0803f"); gr.addColorStop(1, "#8a5226");
    g.fillStyle = gr; g.fill("evenodd");
    g.save(); anillo(); g.clip("evenodd");
    // vetas
    g.strokeStyle = "rgba(105,58,22,0.42)"; g.lineWidth = 1.1 * u;
    for (const [k, a0, a1] of [[0.32, 0.4, 2.3], [0.55, 3.0, 5.6], [0.78, 1.2, 3.6]]) { const r = lerp(Ri, Ro, k); g.beginPath(); g.ellipse(0, 0, r * sv, r, 0, a0, a1); g.stroke(); }
    // brillo arriba a la izquierda y sombra abajo
    const rb = lerp(Ri, Ro, 0.6);
    g.strokeStyle = "rgba(255,232,182,0.9)"; g.lineWidth = 2.4 * u; g.beginPath(); g.ellipse(0, 0, rb * sv, rb, 0, 3.55, 4.55); g.stroke();
    g.strokeStyle = "rgba(90,45,15,0.35)"; g.lineWidth = 3 * u; g.beginPath(); g.ellipse(0, 0, lerp(Ri, Ro, 0.75) * sv, lerp(Ri, Ro, 0.75), 0, 0.3, 1.6); g.stroke();
    g.restore();
    // pared de dentro (se ve el grosor abajo, por el agujero)
    g.save(); g.beginPath(); g.ellipse(0, 0, Ri * sv, Ri, 0, 0, TAU); g.clip();
    g.beginPath(); g.rect(-Ro, -Ro, 2 * Ro, 2 * Ro); g.ellipse(0, -(Ro - Ri) * 0.45, Ri * sv, Ri, 0, 0, TAU);
    g.fillStyle = "#6e3c19"; g.fill("evenodd"); g.restore();
    // tinta
    g.strokeStyle = TINTA; g.lineWidth = 2 * u;
    g.beginPath(); g.ellipse(0, 0, Ro * sv, Ro, 0, 0, TAU); g.stroke();
    g.lineWidth = 1.6 * u; g.beginPath(); g.ellipse(0, 0, Ri * sv, Ri, 0, 0, TAU); g.stroke();
    // armellita de latón abajo (donde iba la pinza de la cortina)
    if (ojal) {
      const y0 = Ro + 2.6 * u, r = 2.6 * u;
      g.strokeStyle = TINTA; g.lineWidth = 2.6 * u; g.beginPath(); g.ellipse(0, y0, r * Math.max(sv, 0.35), r, 0, 0, TAU); g.stroke();
      g.strokeStyle = "#d9a93a"; g.lineWidth = 1.3 * u; g.stroke();
    }
    g.restore();
  }
  // aro de clip diminuto (dorado)
  function aroMini(g, c, rot, r, sv, u) {
    g.save(); g.translate(c.x, c.y); g.rotate(rot);
    g.beginPath(); g.ellipse(0, 0, r * sv, r, 0, 0, TAU);
    g.strokeStyle = TINTA; g.lineWidth = 1.7 * u; g.stroke();
    g.strokeStyle = "#f2c443"; g.lineWidth = 0.95 * u; g.stroke();
    g.strokeStyle = "rgba(255,250,215,0.95)"; g.lineWidth = 0.45 * u;
    g.beginPath(); g.ellipse(0, 0, r * sv, r, 0, 3.4, 4.4); g.stroke();
    g.restore();
  }

  /* ---------- destellos y golpes ---------- */
  function estrella4(g, x, y, r, a, rot = 0, col = "#ffffff") {
    if (a <= 0.01 || r <= 0.2) return;
    g.save(); g.globalAlpha = clamp(a); g.translate(x, y); g.rotate(rot); g.fillStyle = col;
    g.beginPath();
    for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * 0.18 : r; g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
    g.closePath(); g.fill(); g.restore();
  }
  function halo(g, x, y, r, a) {
    if (a <= 0.01 || r <= 0.5) return;
    const gl = g.createRadialGradient(x, y, 0, x, y, r);
    gl.addColorStop(0, `rgba(255,252,226,${0.9 * a})`); gl.addColorStop(0.35, `rgba(255,240,170,${0.45 * a})`); gl.addColorStop(1, "rgba(255,236,160,0)");
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = gl; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore();
  }
  // ¡toc! (retrato)
  function estallido(g, q, k, v, u) {
    g.save(); g.translate(q.x, q.y); g.lineJoin = "round";
    const r = (16 + 10 * fase(v, 0, 0.2)) * u * k;
    g.beginPath();
    for (let i = 0; i < 14; i++) { const a = i * TAU / 14 + 0.2, rr = i % 2 ? r * 0.5 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = `rgba(255,248,196,${0.95 * k})`; g.fill();
    g.strokeStyle = `rgba(11,10,14,${0.9 * k})`; g.lineWidth = 1.6 * u; g.stroke();
    g.strokeStyle = `rgba(11,10,14,${k})`; g.lineCap = "round"; g.lineWidth = 2.2 * u;
    for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45, r0 = r + 4 * u + 8 * u * fase(v, 0, 0.3), r1 = r0 + 8 * u * k;
      g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function estrellita(g, x, y, r, a, k, col = "#fff07a") {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.beginPath();
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, an = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 1.1; g.strokeStyle = "#a46c00"; g.stroke(); g.restore();
  }

  /* =====================================================================================
   * ESCENARIO
   * ===================================================================================== */
  const FX = -170, FY = -80, FW = W + 300, FH = H + 170, FS = 1.5;
  let fondo = null, cuadros = null, pliegues = null;
  function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function creaFondo() {
    const c = lienzo(Math.ceil(FW * FS), Math.ceil(FH * FS)), g = c.getContext("2d");
    g.scale(FS, FS); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // pared: crema con rayas suaves
    const gp = g.createLinearGradient(0, FY, 0, PARED);
    gp.addColorStop(0, "#f1d9b2"); gp.addColorStop(1, "#f7e5c6");
    g.fillStyle = gp; g.fillRect(FX, FY, FW, PARED - FY);
    for (let x = FX; x < FX + FW; x += 34) { g.fillStyle = "rgba(226,186,128,0.22)"; g.fillRect(x, FY, 12, PARED - FY); g.fillStyle = "rgba(255,248,232,0.25)"; g.fillRect(x + 14, FY, 3, PARED - FY); }
    // moldura alta
    g.fillStyle = "#e8c995"; g.fillRect(FX, -2, FW, 8); g.fillStyle = "rgba(120,80,40,0.25)"; g.fillRect(FX, 6, FW, 2);
    // luz cálida de la ventana sobre la pared
    const gl = g.createRadialGradient(508, 230, 40, 508, 230, 420);
    gl.addColorStop(0, "rgba(255,236,190,0.55)"); gl.addColorStop(1, "rgba(255,236,190,0)");
    g.fillStyle = gl; g.fillRect(FX, FY, FW, PARED - FY);
    // zócalo
    g.fillStyle = "#fbf3e4"; g.fillRect(FX, PARED - 16, FW, 16);
    g.strokeStyle = "rgba(120,90,60,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(FX, PARED - 16); g.lineTo(FX + FW, PARED - 16); g.stroke();
    // suelo de tablas
    const gs = g.createLinearGradient(0, PARED, 0, FY + FH);
    gs.addColorStop(0, "#b77a45"); gs.addColorStop(1, "#d79b5f");
    g.fillStyle = gs; g.fillRect(FX, PARED, FW, FY + FH - PARED);
    const FUGA = P(508, 120);
    g.strokeStyle = "rgba(95,52,22,0.35)"; g.lineWidth = 1.2;
    for (let i = -16; i <= 16; i++) { const xb = 508 + i * 95; g.beginPath(); g.moveTo(lerp(FUGA.x, xb, (PARED - FUGA.y) / (FY + FH - FUGA.y)), PARED); g.lineTo(xb, FY + FH); g.stroke(); }
    for (let i = 1; i < 9; i++) { const y = PARED + Math.pow(i / 9, 1.6) * (FY + FH - PARED); g.strokeStyle = "rgba(95,52,22,0.18)"; g.beginPath(); g.moveTo(FX, y); g.lineTo(FX + FW, y); g.stroke(); }
    // mancha de sol en el suelo
    g.save(); g.globalCompositeOperation = "lighter";
    const gsol = g.createLinearGradient(420, PARED, 520, 600);
    gsol.addColorStop(0, "rgba(255,214,140,0.28)"); gsol.addColorStop(1, "rgba(255,214,140,0.05)");
    g.fillStyle = gsol; g.beginPath(); g.moveTo(400, PARED + 2); g.lineTo(640, PARED + 2); g.lineTo(700, 640); g.lineTo(330, 640); g.closePath(); g.fill();
    g.restore();
    // alfombra redonda
    g.save(); g.translate(452, 560); g.scale(1, 0.14);
    g.fillStyle = "#b9452f"; g.beginPath(); g.arc(0, 0, 330, 0, TAU); g.fill();
    g.fillStyle = "#e9c486"; g.beginPath(); g.arc(0, 0, 300, 0, TAU); g.fill();
    g.fillStyle = "#c95a3b"; g.beginPath(); g.arc(0, 0, 270, 0, TAU); g.fill();
    g.fillStyle = "#e9c486"; for (let i = 0; i < 28; i++) { const a = i * TAU / 28; g.beginPath(); g.arc(Math.cos(a) * 285, Math.sin(a) * 285, 9, 0, TAU); g.fill(); }
    g.strokeStyle = "#8f2f1e"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 200, 0, TAU); g.stroke();
    g.fillStyle = "#f2d49b"; g.beginPath(); g.arc(0, 0, 90, 0, TAU); g.fill();
    g.restore();
    ventana(g);
    cuadro(g);
    estanteria(g);
    planta(g);
    lampara(g);
    // espejo de pie (marco y patas; el cristal se pinta aparte)
    espejoMarco(g);
    return c;
  }
  function ventana(g) {
    const { x0, x1, y0, y1 } = VENT, m = 12;
    // lo de fuera: cielo y la casa de enfrente al sol
    g.save(); g.beginPath(); g.rect(x0 + m, y0 + m, x1 - x0 - 2 * m, y1 - y0 - 2 * m); g.clip();
    const gc = g.createLinearGradient(0, y0, 0, y1);
    gc.addColorStop(0, "#5fb2ec"); gc.addColorStop(1, "#c9e9fa"); g.fillStyle = gc; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // nubecita
    g.fillStyle = "rgba(255,255,255,0.85)"; for (const [cx, cy, r] of [[440, 92, 14], [458, 86, 18], [478, 93, 13]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
    // fachada
    g.fillStyle = "#e39a62"; g.fillRect(x0, 128, x1 - x0, y1 - 128);
    g.fillStyle = "#f3c38d"; g.fillRect(x0, 120, x1 - x0, 10); g.fillStyle = "rgba(120,60,30,0.3)"; g.fillRect(x0, 130, x1 - x0, 3);
    // sombra diagonal del alero
    g.fillStyle = "rgba(150,70,40,0.22)"; g.beginPath(); g.moveTo(x0, 133); g.lineTo(x1, 133); g.lineTo(x1, 160); g.lineTo(x0, 200); g.closePath(); g.fill();
    for (const wx of [430, 540]) {
      // ventana de enfrente con persianas verdes y balcón con geranios
      g.fillStyle = "#3d2a22"; g.fillRect(wx, 168, 38, 72);
      g.fillStyle = "#2f8a55"; g.fillRect(wx - 16, 166, 15, 76); g.fillRect(wx + 39, 166, 15, 76);
      g.strokeStyle = "rgba(20,60,35,0.6)"; g.lineWidth = 1; for (let y = 170; y < 240; y += 6) { g.beginPath(); g.moveTo(wx - 15, y); g.lineTo(wx - 2, y); g.moveTo(wx + 40, y); g.lineTo(wx + 53, y); g.stroke(); }
      g.fillStyle = "#f6ddb8"; g.fillRect(wx - 20, 240, 78, 5);
      g.strokeStyle = "#2a2226"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(wx - 18, 228); g.lineTo(wx + 56, 228); g.stroke();
      for (let x = wx - 16; x < wx + 56; x += 6) { g.beginPath(); g.moveTo(x, 228); g.lineTo(x, 240); g.stroke(); }
      for (let i = 0; i < 5; i++) { g.fillStyle = "#4c9a3c"; g.beginPath(); g.arc(wx - 10 + i * 15, 224, 6, 0, TAU); g.fill(); g.fillStyle = i % 2 ? "#e8364a" : "#ff5a6a"; g.beginPath(); g.arc(wx - 10 + i * 15 + 2, 220, 3.6, 0, TAU); g.fill(); }
      g.fillStyle = "#b5552e"; g.fillRect(wx - 14, 226, 66, 4);
    }
    g.fillStyle = "#cf8450"; g.fillRect(x0, 300, x1 - x0, y1 - 300);
    // reflejo del cristal
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.moveTo(x0 + 30, y0 + m); g.lineTo(x0 + 70, y0 + m); g.lineTo(x0 + 20, y1); g.lineTo(x0 - 20, y1); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x0 + 140, y0 + m); g.lineTo(x0 + 152, y0 + m); g.lineTo(x0 + 100, y1); g.lineTo(x0 + 88, y1); g.closePath(); g.fill();
    g.restore();
    // marco blanco, parteluz y travesaño
    g.lineWidth = 1.6; g.strokeStyle = "rgba(90,70,50,0.7)";
    g.fillStyle = "#fbf6ee";
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.rect(x0 + m, y0 + m, x1 - x0 - 2 * m, y1 - y0 - 2 * m); g.fill("evenodd"); g.stroke();
    g.beginPath(); g.rect(x0 + m, y0 + m, x1 - x0 - 2 * m, y1 - y0 - 2 * m); g.stroke();
    const xm = (x0 + x1) / 2;
    g.fillRect(xm - 4, y0 + m, 8, y1 - y0 - 2 * m); g.strokeRect(xm - 4, y0 + m, 8, y1 - y0 - 2 * m);
    g.fillRect(x0 + m, 176, x1 - x0 - 2 * m, 7); g.strokeRect(x0 + m, 176, x1 - x0 - 2 * m, 7);
    // alféizar
    g.fillStyle = "#fffaf2"; g.fillRect(x0 - 12, y1 - 2, x1 - x0 + 24, 9); g.strokeRect(x0 - 12, y1 - 2, x1 - x0 + 24, 9);
    g.fillStyle = "rgba(110,80,50,0.25)"; g.fillRect(x0 - 8, y1 + 7, x1 - x0 + 16, 4);
    // el remate que le falta a la barra, olvidado en el alféizar
    g.fillStyle = "#a8682f"; g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.arc(x0 + 2, y1 - 8, 6, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,230,180,0.6)"; g.beginPath(); g.arc(x0, y1 - 10, 2, 0, TAU); g.fill();
    // soportes de la barra
    for (const sx of SOPORTES) {
      g.fillStyle = "#8a5226"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
      g.beginPath(); g.rect(sx - 4, ROD.y - 14, 8, 12); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(sx, ROD.y - 16, 7, 3, 0, 0, TAU); g.fill(); g.stroke();
    }
  }
  function cuadro(g) {
    const x = 706, y = 120, w = 92, h = 70;
    g.fillStyle = "rgba(90,60,30,0.25)"; g.fillRect(x + 4, y + 5, w, h);
    g.fillStyle = "#7a4a26"; g.fillRect(x - 6, y - 6, w + 12, h + 12);
    const gc = g.createLinearGradient(0, y, 0, y + h); gc.addColorStop(0, "#ffd9a0"); gc.addColorStop(0.55, "#ffb27a"); gc.addColorStop(0.56, "#3d8fc4"); gc.addColorStop(1, "#2d6f9e");
    g.fillStyle = gc; g.fillRect(x, y, w, h);
    g.fillStyle = "#ffef9a"; g.beginPath(); g.arc(x + 62, y + 36, 11, Math.PI, TAU); g.fill();
    g.fillStyle = "#f2d39a"; g.beginPath(); g.moveTo(x, y + h); g.quadraticCurveTo(x + 30, y + h - 14, x + 54, y + h); g.fill();
    g.strokeStyle = "#4a2a12"; g.lineWidth = 1.5; g.strokeRect(x - 6, y - 6, w + 12, h + 12); g.strokeRect(x, y, w, h);
  }
  function estanteria(g) {
    // borde de una estantería a la izquierda del todo
    g.fillStyle = "#8a5a33"; g.fillRect(-170, -40, 128, PARED + 40);
    g.fillStyle = "#6e4527"; g.fillRect(-46, -40, 8, PARED + 40);
    const cols = ["#c0392b", "#2e86c1", "#f1c40f", "#27ae60", "#8e44ad", "#e67e22", "#16a085"];
    for (let s = 0; s < 4; s++) {
      const y = 40 + s * 100;
      g.fillStyle = "#5d3a1f"; g.fillRect(-170, y + 70, 128, 8);
      let x = -164;
      for (let i = 0; x < -54; i++) { const w = 9 + 6 * hash(s * 11 + i), h = 44 + 22 * hash(s * 7 + i * 3); g.fillStyle = cols[(s * 3 + i) % cols.length]; g.fillRect(x, y + 70 - h, w, h); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x + 2, y + 74 - h, w - 4, 3); x += w + 1.5; }
    }
  }
  function planta(g) {
    const x = 800, y = SUELO - 46;
    g.fillStyle = "rgba(60,30,10,0.28)"; g.beginPath(); g.ellipse(x, y + 46, 40, 8, 0, 0, TAU); g.fill();
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.33, L = 120 + 40 * hash(i * 5.3), ex = x + Math.cos(a) * L, ey = y - 10 + Math.sin(a) * L;
      g.strokeStyle = "#3f7a2c"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5, y - L * 0.55, ex, ey); g.stroke();
      g.save(); g.translate(ex, ey); g.rotate(a + Math.PI / 2); g.fillStyle = i % 2 ? "#3e8f3a" : "#2f7a31"; g.strokeStyle = "#1d4d1e"; g.lineWidth = 1.4;
      g.beginPath(); g.ellipse(0, 0, 20, 28, 0, 0, TAU); g.fill(); g.stroke();
      g.strokeStyle = "rgba(200,240,190,0.5)"; g.beginPath(); g.moveTo(0, 26); g.lineTo(0, -24); g.stroke();
      for (const s of [-1, 1]) { g.strokeStyle = "rgba(247,229,198,0.9)"; g.lineWidth = 3; g.beginPath(); g.moveTo(s * 20, -4); g.lineTo(s * 9, 0); g.stroke(); }
      g.restore();
    }
    g.fillStyle = "#c86b3c"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x - 34, y - 6); g.lineTo(x + 34, y - 6); g.lineTo(x + 26, y + 46); g.lineTo(x - 26, y + 46); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e08a55"; g.fillRect(x - 37, y - 12, 74, 10); g.strokeRect(x - 37, y - 12, 74, 10);
  }
  function lampara(g) {
    const x = 928;
    g.strokeStyle = "#3a2c22"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 222); g.lineTo(x, SUELO - 8); g.stroke();
    g.fillStyle = "#3a2c22"; g.beginPath(); g.ellipse(x, SUELO - 6, 24, 6, 0, 0, TAU); g.fill();
    const gl = g.createRadialGradient(x, 230, 10, x, 230, 150); gl.addColorStop(0, "rgba(255,226,160,0.4)"); gl.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = gl; g.fillRect(x - 160, 80, 320, 300);
    g.fillStyle = "#f6e3b4"; g.strokeStyle = "#5a4430"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x - 22, 170); g.lineTo(x + 22, 170); g.lineTo(x + 40, 226); g.lineTo(x - 40, 226); g.closePath(); g.fill(); g.stroke();
  }
  function espejoMarco(g) {
    const { x, y, rx, ry } = ESPEJO;
    g.fillStyle = "rgba(60,30,10,0.25)"; g.beginPath(); g.ellipse(x + 10, 516, 76, 9, 0, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6;
    // patas y postes
    for (const s of [-1, 1]) {
      const px = x + s * (rx + 16);
      g.fillStyle = "#7b4a22"; g.beginPath(); g.rect(px - 5, y - 40, 10, 554 - y - 40 + 2); g.fill(); g.stroke();
      g.fillStyle = "#9a5f2c"; g.beginPath(); g.arc(px, y - 44, 7, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(px, 508); g.lineTo(px + s * 26, 516); g.lineTo(px + s * 26, 520); g.lineTo(px - s * 8, 516); g.closePath(); g.fillStyle = "#6a3e1c"; g.fill(); g.stroke();
      g.fillStyle = "#d9a93a"; g.beginPath(); g.arc(px, y, 4.5, 0, TAU); g.fill(); g.stroke();
    }
    g.fillStyle = "#7b4a22"; g.fillRect(x - rx - 16, 470, 2 * rx + 32, 9); g.strokeRect(x - rx - 16, 470, 2 * rx + 32, 9);
    // marco ovalado
    g.beginPath(); g.ellipse(x, y, rx + 10, ry + 10, 0, 0, TAU); g.ellipse(x, y, rx, ry, 0, 0, TAU);
    const gm = g.createLinearGradient(x - rx, y - ry, x + rx, y + ry); gm.addColorStop(0, "#b8743a"); gm.addColorStop(1, "#6e3f1b");
    g.fillStyle = gm; g.fill("evenodd"); g.stroke();
    g.strokeStyle = "rgba(255,220,170,0.5)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx + 6, ry + 6, 0, 3.4, 4.6); g.stroke();
  }
  // cuadros vichy y pliegues de la cortinilla (patrones)
  function patrones(g) {
    const a = lienzo(14, 14), ga = a.getContext("2d");
    ga.fillStyle = "#fff8ef"; ga.fillRect(0, 0, 14, 14);
    ga.fillStyle = "rgba(214,40,48,0.5)"; ga.fillRect(0, 0, 7, 14); ga.fillRect(0, 0, 14, 7);
    cuadros = g.createPattern(a, "repeat");
    const b = lienzo(24, 2), gb = b.getContext("2d"), gr = gb.createLinearGradient(0, 0, 24, 0);
    gr.addColorStop(0, "rgba(90,30,20,0.24)"); gr.addColorStop(0.35, "rgba(255,255,255,0.12)"); gr.addColorStop(0.6, "rgba(255,255,255,0.0)"); gr.addColorStop(1, "rgba(90,30,20,0.24)");
    gb.fillStyle = gr; gb.fillRect(0, 0, 24, 2);
    pliegues = g.createPattern(b, "repeat");
  }

  /* ---------- barra, anillas y cortinilla (dinámicas) ---------- */
  const cae = (t, t0) => { const u = t - t0; return u <= 0 ? 0 : 1 - Math.exp(-u * 5) * Math.cos(u * 12); };
  function barra(g, t, pG) {
    if (!cuadros) patrones(g);
    // posición de las dos anillas que se lleva (siguen a la pinza mientras resbalan por la barra)
    const xA = t < T.alcC1 ? ANILLAS[0] : t < T.fueraA ? Math.min(ANILLAS[0], pG._pinzaC().x) : null;
    const xB = t < T.alcL1 ? ANILLAS[1] : t < T.fueraB ? Math.min(ANILLAS[1], pG._pinzaL().x) : null;
    // cortinilla: el borde de arriba se descuelga donde faltan anillas
    const D1=15*cae(t,T.alcC1+.02),D2=40*cae(t,T.alcL1+.02);
    const topY = x => TOP_CORT + D1 * Math.pow(clamp((ANILLAS[1] - x) / 24), 1.3) + D2 * Math.pow(clamp((ANILLAS[2] - x) / 52), 1.3);
    const xi = ANILLAS[0] + 6 * tramo(t, T.fueraB, T.fueraB + 0.5), xf = ANILLAS[ANILLAS.length - 1];
    const sup = [], inf = [];
    for (let x = xi; x <= xf + 0.1; x += 6) sup.push(P(x, topY(x)));
    for (let x = xf; x >= xi - 0.1; x -= 6) inf.push(P(x + 2 * Math.sin(x * 0.26), CORT_Y1 + 2 * Math.cos(x * 0.31)));
    const forma = () => { g.beginPath(); sup.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); inf.forEach(q => g.lineTo(q.x, q.y)); g.closePath(); };
    g.save();
    forma(); cuadros.setTransform(new DOMMatrix().translate(ANILLAS[0], TOP_CORT)); g.fillStyle = cuadros; g.fill();
    g.save(); forma(); g.clip();
    pliegues.setTransform(new DOMMatrix().translate(ANILLAS[0] - 12, 0)); g.fillStyle = pliegues; g.fillRect(xi - 2, TOP_CORT - 4, xf - xi + 4, CORT_Y1 - TOP_CORT + 60);
    // dobladillo arriba y cenefa roja abajo
    g.strokeStyle = "rgba(160,30,36,0.55)"; g.lineWidth = 4; g.beginPath(); sup.forEach((q, i) => (i ? g.lineTo(q.x, q.y + 3) : g.moveTo(q.x, q.y + 3))); g.stroke();
    g.fillStyle = "#c8323a"; g.fillRect(xi - 4, CORT_Y1 - 7, xf - xi + 8, 12);
    // la esquina caída hace una arruga
    const k = clamp((D1 + D2) / 40);
    if (k > 0.02) { g.strokeStyle = `rgba(90,30,20,${0.35 * k})`; g.lineWidth = 2; g.beginPath(); g.moveTo(ANILLAS[2] - 4, TOP_CORT + 6); g.quadraticCurveTo(ANILLAS[1] + 4, TOP_CORT + 30 * k, xi + 8, CORT_Y1 - 10); g.stroke(); }
    // sol a contraluz
    g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(255,210,150,0.12)"; g.fillRect(xi - 2, TOP_CORT - 4, xf - xi + 4, CORT_Y1 - TOP_CORT + 20);
    g.restore();
    forma(); g.strokeStyle = "rgba(60,20,20,0.75)"; g.lineWidth = 1.3; g.stroke();
    g.restore();
    // pinzas de la cortina en las anillas que quedan
    for (let i = 2; i < ANILLAS.length; i++) { const x = ANILLAS[i]; g.strokeStyle = "#7a6020"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, FONDO_ANILLA + 2); g.lineTo(x, topY(x) + 3); g.stroke(); }
    // las dos que se lleva: la pinza de la cortina se suelta en cuanto la anilla empieza a resbalar
    for (const [x, i, t1] of [[xA, 0, T.alcC1 + 0.02], [xB, 1, T.alcL1 + 0.02]]) if (x !== null && t < t1) { g.strokeStyle = "#7a6020"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ANILLAS[i], FONDO_ANILLA + 2); g.lineTo(ANILLAS[i], topY(ANILLAS[i]) + 3); g.stroke(); }
    // anillas (de canto) y la barra por encima
    const anillas = ANILLAS.slice(2).concat(xA !== null ? [xA] : [], xB !== null ? [xB] : []);
    for (const x of anillas) aro(g, P(x, CY_ANILLA), 0, RO_S, RI_S, SV_BARRA, 1, true);
    const gb = g.createLinearGradient(0, ROD.y - ROD.r, 0, ROD.y + ROD.r);
    gb.addColorStop(0, "#d8995a"); gb.addColorStop(0.5, "#a7652e"); gb.addColorStop(1, "#6a3b17");
    g.fillStyle = gb; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.rect(ROD.x0, ROD.y - ROD.r, ROD.x1 - ROD.x0, 2 * ROD.r); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(ROD.x0, ROD.y, 2.2, ROD.r, 0, 0, TAU); g.fillStyle = "#c58447"; g.fill(); g.stroke();
    // remate de la derecha
    g.fillStyle = "#a8682f"; g.beginPath(); g.arc(ROD.x1 + 6, ROD.y, 7, 0, TAU); g.fill(); g.stroke();
    // la parte de delante de cada anilla pasa por encima de la barra
    for (const x of anillas) { g.fillStyle = "#b8783f"; g.fillRect(x - 1.6, ROD.y - ROD.r - 0.5, 3.2, 2 * ROD.r + 1); g.strokeStyle = TINTA; g.lineWidth = 0.9; g.strokeRect(x - 1.6, ROD.y - ROD.r - 0.5, 3.2, 2 * ROD.r + 1); }
  }

  /* ---------- motas de polvo en la luz ---------- */
  function motas(g, t) {
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 16; i++) {
      const x = 400 + 260 * hash(i * 3.1) + 16 * Math.sin(t * 0.7 + i), y = 110 + 330 * ((hash(i * 7.7) + t * 0.025 * (0.5 + hash(i))) % 1);
      g.fillStyle = `rgba(255,236,190,${0.35 + 0.3 * Math.sin(t * 2 + i * 1.7)})`; g.beginPath(); g.arc(x, y, 1.2 + hash(i * 2.2), 0, TAU); g.fill();
    }
    g.restore();
  }

  /* ---------- los personajes ---------- */
  // Guillermo con el aplastamiento del giro y el aro lejano por detrás
  let perfilA=null,perfilB=null;
  function dibujaG(g,t,pG){
    const c=Math.abs(Math.cos(pG._th));if(c>=.22){vistaG(g,t,pG,1);return;}
    if(!perfilA){perfilA=lienzo(330,940);perfilB=lienzo(330,940);}
    const x=pG.x-82.5,y=88;
    for(const [l,sg] of [[perfilA,1],[perfilB,-1]]){
      const f=l.getContext("2d");f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,l.width,l.height);
      f.setTransform(2,0,0,2,-2*x,-2*y);vistaG(f,t,pG,sg);
    }
    const mezclaVista=.5*(1-suave(c/.22)),f=perfilA.getContext("2d");f.save();f.setTransform(1,0,0,1,0,0);
    f.globalCompositeOperation="destination-out";f.globalAlpha=mezclaVista;f.fillRect(0,0,perfilA.width,perfilA.height);
    f.globalCompositeOperation="lighter";f.drawImage(perfilB,0,0);f.restore();
    g.drawImage(perfilA,x,y,perfilA.width/2,perfilA.height/2);
  }
  function vistaG(g,t,pG,sg){
    g.save();
    g.translate(pG.x,0);g.scale(sg*pG._sq,1);g.translate(-pG.x,0);
    BASE_M = g.getTransform();
    aroLejano(g, t, pG);
    G.dibujar(g, pG, t);
    g.restore();
  }
  function enManoB(p,t){
    const pin=p._pinzaL(),k=tramo(t,T.fueraB,T.cuelgaB-.06),a=lerp(Math.PI/2,0,k),sv=lerp(SV_BARRA,SV_OREJA,k);
    const q=P(sv*R_AGARRE*Math.cos(a),R_AGARRE*Math.sin(a));return {c:P(pin.x-q.x,pin.y-q.y),sv,q};
  }
  function aroLejano(g, t, pG) {
    // en la mano (cogido por el lado, por detrás de la mandíbula) o colgado de la oreja escondida
    if (t >= T.fueraB && t < T.cuelgaB) {
      const b=enManoB(pG,t);aro(g,b.c,0,RO_S,RI_S,b.sv,1,true);
    } else if (SIM && t >= T.cuelgaB && t < T_SUELTA) {
      const b = centroB(pG, t);
      aro(g, b.c, b.a, RO_S, RI_S, SV_OREJA, 1, true);
    }
  }
  // sombras en el suelo
  function sombras(g, pG, pY) {
    g.save(); g.fillStyle = "rgba(70,35,15,0.26)";
    g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 50 * Math.max(0.6, pG._sq), 7, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(pY.x - 2, SUELO + 2, 52, 7, 0, 0, TAU); g.fill();
    g.restore();
  }

  function manoDelante(g,t,p){
    const m=p.manoLejos,k=p.s*Yo.K,col=Yo.C;g.save();g.translate(p.x,p.suelo);g.scale(-k,k);g.translate(-Yo.PELVIS.x,-Yo.SUELO);
    g.translate(m.x,m.y);g.rotate(m.ang||0);g.scale(Yo.JK,Yo.JK);if(m.objeto)m.objeto(g,t);
    if(m.puno>.01){g.scale(m.puno,m.puno);Personaje2D.mano(g,m,{piel:col.piel,sombra:col.pielSombra,tinta:col.tinta});}
    g.restore();
  }
  function personas(g,t,pG,pY){
    BASE_M=g.getTransform();Yo.dibujar(g,pY,t);dibujaG(g,t,pG);
    if(t>=T.quita0-.03&&t<=T.suelta+.18){BASE_M=g.getTransform();manoDelante(g,t,pY);}
  }
  /* ---------- el espejo: el cristal con los reflejos ---------- */
  const reflejo=q=>P(125-.57*(q.x-XG0),478+.57*(q.y-SUELO));
  function cristal(g, t, pG, pY) {
    const { x, y, rx, ry } = ESPEJO;
    g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.clip();
    const foco=reflejo(P(XG0,SUELO));g.save();g.translate(foco.x,foco.y);g.scale(-.57,.57);g.translate(-XG0,-SUELO);
    g.drawImage(fondo,FX,FY,FW,FH);barra(g,t,pG);sombras(g,pG,pY);
    personas(g,t,pG,pY);const vuelo=vueloB(t);if(vuelo)aroEnVuelo(g,vuelo);g.restore();
    // cristal: tinte frío y brillos
    g.fillStyle = "rgba(120,160,190,0.14)"; g.fillRect(x - rx, y - ry, 2 * rx, 2 * ry);
    g.fillStyle = "rgba(255,255,255,0.16)";
    g.beginPath(); g.moveTo(x - rx, y - 40); g.lineTo(x - rx + 40, y - ry); g.lineTo(x - rx + 62, y - ry); g.lineTo(x - rx, y + 6); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x - 10, y + ry); g.lineTo(x + rx, y + 20); g.lineTo(x + rx, y + 34); g.lineTo(x + 6, y + ry); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.stroke();
  }

  /* ---------- efectos en pantalla ---------- */
  function efectos(g, t, pG, pY) {
    // ¡idea!
    const ki = tramo(t, T.idea - 0.04, T.idea + 0.06) * (1 - tramo(t, T.idea + 0.3, T.idea + 0.55));
    if (ki > 0.01) { const h = G.aPantalla(pG, G.cabeza(pG).a(P(800, 180))); halo(g, h.x + 10, h.y - 24, 28 * ki, ki * 0.8); estrellita(g, h.x + 10, h.y - 18 - 6 * ki, 13, 0.2 + t * 2, ki); }
    // el giro: rayas de velocidad y polvillo
    const th = pG._th, gv = clamp((theta(t + 0.01) - theta(t - 0.01)) / 0.02 / 12) * (t > T.giro0 && t < T.giro1 ? 1 : 0);
    if (gv > 0.02) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * gv})`; g.lineCap = "round";
      for (let i = 0; i < 5; i++) {
        const y = SUELO - 70 - i * 70 - 10 * Math.sin(i * 2.1), rx = 70 + 10 * (i % 2), ph = th * 1.0 + i * 1.3;
        g.lineWidth = 3 - i * 0.25; g.beginPath(); g.ellipse(pG.x, y, rx, 12, 0, ph, ph + 1.5 + gv); g.stroke();
      }
      g.restore();
      g.save(); g.fillStyle = `rgba(230,200,160,${0.45 * gv})`;
      for (let i = 0; i < 6; i++) { const a = th * 0.8 + i * 1.05; g.beginPath(); g.arc(pG.x + Math.cos(a) * 44, SUELO + 2 + Math.sin(a) * 6, 6 + 3 * hash(i), 0, TAU); g.fill(); }
      g.restore();
    }
    // mareo: estrellitas dando vueltas sobre la cabeza
    const mr = mareo(t);
    if (mr > 0.01) {
      const h = G.aPantalla(pG, G.cabeza(pG).a(P(760, 240)));
      for (let i = 0; i < 3; i++) { const a = t * 6 + i * TAU / 3; estrellita(g, h.x + Math.cos(a) * 34, h.y - 14 + Math.sin(a) * 9, 7, a, mr * (0.75 + 0.25 * Math.sin(a))); }
    }
    // el aro que vuela (con estela) y el ¡zas! al cazarlo
    const vu = vueloB(t);
    if (vu) {
      for (let i = 3; i >= 1; i--) { const v2 = vueloB(t - i * 0.025); if (!v2) continue; g.save(); g.globalAlpha = 0.18 * (4 - i) / 3; aroEnVuelo(g,v2,false); g.restore(); }
      aroEnVuelo(g,vu);
    }
    const kz = campana(t, T_ATRAPA - 0.02, T_ATRAPA + 0.3);
    if (kz > 0.01) {
      g.save(); g.strokeStyle = `rgba(11,10,14,${0.85 * kz})`; g.lineCap = "round"; g.lineWidth = 2;
      for (let i = 0; i < 4; i++) { const a = -2.4 + i * 0.5, r0 = 24 + 10 * fase(t, T_ATRAPA, T_ATRAPA + 0.3); g.beginPath(); g.moveTo(ATRAPA.x + Math.cos(a) * r0, ATRAPA.y + Math.sin(a) * r0); g.lineTo(ATRAPA.x + Math.cos(a) * (r0 + 9), ATRAPA.y + Math.sin(a) * (r0 + 9)); g.stroke(); }
      g.restore();
    }
    // ¡pulgar!: un brillito en la punta
    const kp = tramo(t, T.pulgar1 - 0.04, T.pulgar1 + 0.06) * (1 - tramo(t, T.pulgar1 + 0.25, T.pulgar1 + 0.6));
    if (kp > 0.01) { const p=pY.manoLejos,q=ptMano(Yo,pY,p,puntaPulgar(p.dedos));estrella4(g,q.x,q.y,12*kp,kp,t*2); }
  }

  /* ---------- cámara ---------- */
  // planos: [t0, t1, zoom, x, y] (transición de t0 a t1 desde el plano anterior)
  const PLANOS = [
    [0, 0, 1.22, 470, 318],
    [0.62, 1.25, 1.42, 470, 278],
    [2.15, 2.8, 1.5, 380, 262],
    [4.2, 4.85, 1.62, 392, 244],
    [6.62, 7.12, 1.2, 420, 300],
    [8.55, 9.2, 1.62, 372, 252],
    [10.8, 11.45, 1.36, 300, 282],
    [12.5, 13.1, 1.2, 405, 302]
  ];
  function camara(t) {
    let k = PLANOS[0][2], x = PLANOS[0][3], y = PLANOS[0][4];
    for (let i = 1; i < PLANOS.length; i++) { const [t0, t1, kk, xx, yy] = PLANOS[i]; if (t <= t0) break; const s = tramo(t, t0, t1); k = lerp(k, kk, s); x = lerp(x, xx, s); y = lerp(y, yy, s); }
    // sacudidas con los golpes
    let dx = 0, dy = 0;
    if (SIM) for (const b of SIM.golpes) { const u = t - b.t; if (u > 0 && u < 0.4) { const e = 1.5 * b.k * Math.exp(-u * 9) * Math.sin(u * 34) * tramo(u, 0, 0.04); dx += e; dy += 0.6 * e; } }
    return { k, x: x + dx, y: y + dy };
  }

  function poses(t) { return { g: poseG(t), y: poseY(t) }; }

  class LosPendientes extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Yo.listo()) return;
      if (!SIM) simula();
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pY = poseY(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, FX, FY, FW, FH);
      motas(g, t);
      // el reflejo solo si el espejo está en pantalla
      if (cam.x - W / 2 / cam.k < ESPEJO.x + ESPEJO.rx) cristal(g, t, pG, pY);
      barra(g, t, pG);
      sombras(g, pG, pY);
      personas(g,t,pG,pY);
      efectos(g, t, pG, pY);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00135.2", nombre: "Guillermo y Yorgi · Los pendientes", crear: () => new LosPendientes() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["y", Yo, poseY(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00135_2 = { pose: poses, poseG, poseY, T, DUR, diag, camara,simula,ptMano,PINZA,PALMA,LOBULO_G,LOBULO_GL,PSI_CARA,SV_OREJA,SV_BARRA,RO_S,RI_S,AR,KR,ARO_MINI,ANILLAS,FONDO_ANILLA,CY_ANILLA,ROD,TOP_CORT,centroB,estadoSim,vueloB,aroColgado,reflejo,ATRAPA,PASA,cuerpoG,lobuloG,lobuloGL,dibujaG,cristal,ESPEJO,SUELO,xY,pie,PIES_Y,theta,aro,aroMini,efectos,capaCabezaG,aroLejano, sim: () => SIM, T_SUELTA, T_ATRAPA,
    aroEnVuelo,salidaMundo,personas,manoDelante,miniGeometria,giroMini,miniEnMano,bolsilloMini,enManoB,orejaA,colgado,cambioB,R_AGARRE,SEGUNDA,puntaPulgar,lobulo: t => lobuloG(poseG(t)), golpes: () => SIM && SIM.golpes.map(b => [+b.t.toFixed(3), +b.rel.toFixed(2)]) };
})();
