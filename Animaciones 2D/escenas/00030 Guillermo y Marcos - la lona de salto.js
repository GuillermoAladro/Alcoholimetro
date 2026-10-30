"use strict";
/* 00030 · Guillermo y Marcos · La lona de salto
 *
 * Negro → calle soleada delante del bar. Guillermo se asoma a la ventana del primer piso y saluda;
 * abajo, Marcos sujeta una lona de salto redonda montada en su bastidor y le llama con la mano →
 * Guillermo mira abajo, se asusta y niega con la cabeza; Marcos sacude el aro para enseñarle lo
 * blandita que está y le vuelve a llamar → Guillermo se sube al alféizar, se agacha temblando, se
 * tapa la nariz como si se tirara a una piscina y salta → cae en la lona, que se hunde… y lo lanza
 * muchísimo más alto: sale por arriba del plano. Marcos lo sigue con la mirada → vuelve a caer y
 * rebota todavía más alto (esta vez lo disfruta, con los brazos en alto), y otra vez → el tercer bote
 * lo lanza de lado: Marcos suelta la lona, corre a colocarse debajo y lo coge en brazos como a una
 * princesa → Guillermo, en brazos, se pone colorado y Marcos guiña un ojo a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Los botes siguen una parábola de verdad (g = 1500 px/s²)
 * y cada uno sube más; en la lona, una curva de Hermite enlaza la velocidad de llegada con la de salida
 * (la lona se hunde y él se agacha). Al cogerlo, Guillermo se coloca en cada fotograma a partir de la
 * mano cercana de Marcos (bajo sus rodillas) y la mano lejana de Marcos va a su espalda: no resbala.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.18, SUELO = 552, GR = 1500;
  const ALF = 290;                                          // alféizar: donde pisa Guillermo al subirse
  const VEN = { x0: 210, x1: 334, y0: 118, y1: ALF };       // hueco de la ventana
  const XV = 270, XA = 278;                                 // Guillermo en la ventana y en el alféizar
  const HP = (G.SUELO - G.PELVIS.y) * S;                    // pelvis sobre la suela con las piernas rectas
  const SUELO_DENTRO = ALF + HP + 6;                        // suela dentro de la habitación (no se ve)
  const LONA = { cx: 452, cy: 432, rx: 80, ry: 17 };        // aro de la lona (superficie del tejido)
  const DUR = 14.4;

  /* ---------- tiempos ---------- */
  const T = {
    ola0: 0.55, ola1: 1.7, mllama0: 0.8, mllama1: 1.72,
    mira0: 1.78, miedo: 1.92, niega0: 2.02, niega1: 2.62,
    msacude0: 1.98, msacude1: 2.48, mllama2: 2.5, mllama3: 3.05,
    suspira: 2.66, trepa0: 2.78, salto0: 3.0, salto1: 3.3,
    nariz0: 3.45, nariz1: 3.72, prep: 3.92, salta: 4.12
  };
  // salto desde el alféizar hasta el centro de la lona
  const VY0 = -180, XL = LONA.cx;
  const tJ = (-VY0 + Math.sqrt(VY0 * VY0 + 2 * GR * (LONA.cy - ALF))) / GR, VXJ = (XL - XA) / tJ, VIN1 = VY0 + GR * tJ;
  // botes: cada uno más alto; el tercero sale de lado hacia Marcos
  const DC = 0.15, H1 = 600, H2 = 860, H3 = 1120, DX2 = 20;
  const V1 = Math.sqrt(2 * GR * H1), V2 = Math.sqrt(2 * GR * H2), V3 = Math.sqrt(2 * GR * H3);
  T.cae1 = T.salta + tJ; T.sale1 = T.cae1 + DC;
  T.cae2 = T.sale1 + 2 * V1 / GR; T.sale2 = T.cae2 + DC;
  T.cae3 = T.sale2 + 2 * V2 / GR; T.sale3 = T.cae3 + DC;
  const CONTACTOS = [
    { t0: T.cae1, vin: VIN1, vout: V1, x: XL },
    { t0: T.cae2, vin: V1, vout: V2, x: XL + DX2 },
    { t0: T.cae3, vin: V2, vout: V3, x: XL + DX2 }
  ];
  // Marcos
  T.mdate = T.sale3 + 0.04;          // se da cuenta de que el tercer bote va de lado
  T.mpaso0 = T.sale3 + 0.22; T.mpaso1 = T.sale3 + 0.95;
  T.mlisto = T.sale3 + 1.0;
  // T.coge, T.rubor, T.guino y T.fin se fijan cuando se conoce la geometría (preparaGeo)

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const tramoDentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const rotar = (q, c, a) => { const s = Math.sin(a), k = Math.cos(a), x = q.x - c.x, y = q.y - c.y; return { x: c.x + x * k - y * s, y: c.y + x * s + y * k }; };

  /* ---------- caras (los dos usan los mismos campos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, dientes: 1, lengua: 0, esp: 0, mof: 0, cam: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp, mirada) {
    return { mirada: mirada || { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, e.wd, parp), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * TRAYECTORIA DE GUILLERMO
   * Devuelve la suela (x, y) y lo agachado que va (px), o la pelvis en el último bote.
   * ===================================================================================== */
  // Hundimiento en la lona (px, hacia abajo): curva de Hermite con la velocidad de llegada y la de salida.
  const hundido = (c, t) => { const s = fase(t, c.t0, c.t0 + DC); if (s <= 0 || s >= 1) return 0;
    return DC * (c.vin * (s * s * s - 2 * s * s + s) + c.vout * (s * s - s * s * s)); };
  let GEO = null;
  function trayectoria(t) {
    if (t < T.salto0) {                                   // dentro, asomado a la ventana
      const prep = tramo(t, T.trepa0, T.salto0);
      return { modo: "dentro", x: XV + 4 * prep, y: SUELO_DENTRO, ag: 18 * prep };
    }
    if (t < T.salto1) {                                   // sube al alféizar de un saltito
      const u = fase(t, T.salto0, T.salto1);
      const y = SUELO_DENTRO + (ALF - SUELO_DENTRO) * salida(u) - 16 * Math.sin(Math.PI * u);
      return { modo: y < ALF - 4 ? "fuera" : "dentro", x: lerp(XV + 4, XA, suave(u)), y, ag: lerp(18, 31, u) + 6 * Math.sin(Math.PI * u) };
    }
    if (t < T.salta) {                                    // agachado en el alféizar, temblando
      const prep = tramo(t, T.prep, T.salta, entrada);
      const asienta = Math.exp(-(t - T.salto1) * 9) * Math.sin((t - T.salto1) * 18) * 3;
      return { modo: "fuera", x: XA, y: ALF, ag: 31 + 11 * prep + asienta };
    }
    if (t < T.cae1) {                                     // salto hacia la lona
      const tau = t - T.salta;
      return { modo: "fuera", x: XA + VXJ * tau, y: ALF + VY0 * tau + 0.5 * GR * tau * tau, ag: 42 * Math.exp(-tau * 14), aire: 0, tau };
    }
    for (let i = 0; i < 3; i++) {                          // en la lona
      const c = CONTACTOS[i];
      if (t < c.t0 + DC) { const d = hundido(c, t); return { modo: "fuera", x: c.x, y: LONA.cy + 0.55 * d, ag: 0.45 * d, lona: i + 1, d }; }
      if (i < 2) {
        const tSale = c.t0 + DC, V = i === 0 ? V1 : V2, tSig = CONTACTOS[i + 1].t0;
        if (t < tSig) {
          const tau = t - tSale, u = tau / (tSig - tSale);
          return { modo: "fuera", x: lerp(c.x, CONTACTOS[i + 1].x, u), y: LONA.cy - V * tau + 0.5 * GR * tau * tau, ag: 0, aire: i + 1, tau, u };
        }
      }
    }
    // tercer bote: la pelvis vuela de la lona a los brazos de Marcos
    const P0 = { x: CONTACTOS[2].x, y: LONA.cy - HP }, tau = t - T.sale3;
    if (t < GEO.Tc) {
      return { modo: "fuera", pelvis: { x: P0.x + GEO.vx3 * tau, y: P0.y - V3 * tau + 0.5 * GR * tau * tau }, aire: 3, tau, u: tau / (GEO.Tc - T.sale3) };
    }
    return { modo: "brazos" };
  }
  // Lona: hundimiento del centro (px) y dónde
  function estadoLona(t) {
    let d = 0, x = LONA.cx;
    for (let i = 0; i < 3; i++) {
      const c = CONTACTOS[i];
      if (t >= c.t0 && t < c.t0 + DC) { d = 0.55 * hundido(c, t); x = c.x; }
      else if (t >= c.t0 + DC) { const u = t - c.t0 - DC; d += 7 * Math.exp(-u * 7) * Math.sin(u * 38); x = lerp(c.x, LONA.cx, tramo(u, 0, 0.6)); }
    }
    d += 3.2 * Math.sin((t - T.msacude0) * 31) * campana(t, T.msacude0, T.msacude1);       // Marcos sacude el aro
    return { d, x };
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.75, my: 0.45, sd: 8, gd: 0.1, si: 6, gi: 0.08, sonr: 0.75, abre: 8 }),
    saluda: E({ mx: 0.75, my: 0.45, c: 0.15, h: 0.6, sd: 14, gd: 0.12, si: 12, gi: 0.1, sonr: 0.95, abre: 26, ancho: 1.1 }),
    abajo: E({ mx: 0.45, my: 1, sd: 6, gd: 0.04, si: 6, gi: 0.04, sonr: 0.2, abre: 4, ancho: 0.8 }),
    miedo: E({ mx: 0.4, my: 1, iris: 0.62, sd: 28, gd: 0.25, si: 28, gi: 0.25, abre: 26, ancho: 0.6, sonr: -0.55 }),
    niega: E({ mx: 0.6, my: 0.45, c: 0.35, iris: 0.8, sd: 16, gd: 0.25, si: 16, gi: 0.25, abre: 6, ancho: 0.8, sonr: -0.6 }),
    resigna: E({ mx: 0.8, my: 0.35, c: 0.5, sd: -2, gd: -0.06, si: 10, gi: 0.12, sonr: -0.35, ancho: 0.85, abre: 8 }),
    aguanta: E({ mx: 0, my: 0, c: 1, z: 1, sd: 6, gd: 0.1, si: 6, gi: 0.1, abre: 0, ancho: 0.7, sonr: -0.2, mof: 1 }),
    grito: E({ mx: 0.3, my: -0.6, iris: 0.6, sd: 30, gd: 0.25, si: 30, gi: 0.25, abre: 62, ancho: 1.05, sonr: -0.45, lengua: 0.5 }),
    sorpresa: E({ mx: 0.4, my: 0.7, iris: 0.68, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 36, ancho: 0.7, sonr: -0.1 }),
    yupi: E({ mx: 0.5, my: -0.7, c: 0.2, h: 0.8, sd: 20, gd: 0.15, si: 20, gi: 0.15, abre: 46, ancho: 1.2, sonr: 1, lengua: 0.4 }),
    panico: E({ mx: 0.75, my: 0.7, iris: 0.58, sd: 30, gd: 0.25, si: 30, gi: 0.25, abre: 58, ancho: 1, sonr: -0.5, lengua: 0.4 }),
    aprieta: E({ mx: 0, my: 0, c: 1, z: 1, sd: -6, gd: -0.15, si: -6, gi: -0.15, abre: 12, ancho: 1.1, sonr: -0.5 }),
    pasmado: E({ mx: 0.9, my: 0.1, iris: 0.8, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 14, ancho: 0.7, sonr: 0 }),
    enamorado: E({ mx: 0.9, my: -0.05, c: 0.5, h: 1, sd: 18, gd: 0.18, si: 18, gi: 0.18, abre: 0, sonr: 0.8, ancho: 0.8 })
  };
  function guionCaraG() {
    return [
      [T.ola0, T.ola0 + 0.2, "saluda"], [T.ola1 - 0.1, T.ola1 + 0.1, "inicio"], [T.mira0, T.mira0 + 0.14, "abajo"],
      [T.miedo, T.miedo + 0.12, "miedo"], [T.niega0 + 0.05, T.niega0 + 0.2, "niega"], [T.suspira, T.suspira + 0.25, "resigna"],
      [T.nariz0 - 0.05, T.nariz1, "aguanta"],
      [T.cae1 - 0.05, T.cae1 + 0.04, "sorpresa"], [T.sale1, T.sale1 + 0.1, "grito"], [T.cae2 - 0.25, T.cae2, "panico"],
      [T.sale2, T.sale2 + 0.2, "yupi"], [T.cae3 - 0.2, T.cae3, "sorpresa"], [T.sale3 + 0.1, T.sale3 + 0.3, "grito"],
      [GEO.Tc - 1.1, GEO.Tc - 0.85, "panico"], [GEO.Tc - 0.42, GEO.Tc - 0.25, "aprieta"],
      [GEO.Tc + 0.12, GEO.Tc + 0.3, "pasmado"], [T.rubor, T.rubor + 0.35, "enamorado"]
    ];
  }
  let GUION_CARA_G = null;

  // piernas (tobillos en la hoja de Guillermo)
  const TOB = G.SUELO - G.TOBILLO_ALTO;
  const PIES_RECTOS = { cerca: { x: G.PELVIS.x - 34, y: TOB }, lejos: { x: G.PELVIS.x + 34, y: TOB - 8 } };
  // sentado (en brazos): muslo hacia delante y espinilla colgando un poco hacia atrás
  const PIES_SENTADO = { cerca: { x: 172 + 270 - 150, y: 712 + 224 }, lejos: { x: 328 + 262 - 140, y: 712 + 214 } };
  const ESPALDA_G = { x: 132, y: 452 };             // espalda de Guillermo (hoja, en el torso): ahí va la mano lejana de Marcos
  let AGARRE_MUSLO = 0.5;                           // la mano cercana de Marcos, bajo el muslo (0 cadera, 1 rodilla)
  let ROT_BRAZOS = -0.75;                            // giro de todo Guillermo en brazos de Marcos (hacia atrás)
  let TORSO_BRAZOS = -0.3;

  function piesAgachado(t) {         // agachado en el alféizar: pies juntos, rodillas temblando
    const tiem = 4 * ruido(t * 28) * tramo(t, T.salto1, T.salto1 + 0.2);
    return { cerca: { x: G.PELVIS.x - 20 + tiem, y: TOB }, lejos: { x: G.PELVIS.x + 32 - tiem, y: TOB - 6 } };
  }
  // postura de Guillermo para una pelvis dada (en pantalla); devuelve también el giro
  function poseGBase(px, py, pel, torso, cab) {
    return { x: px, suelo: py + HP - pel * S, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + pel }, torso, torsoEsc: { x: 1, y: 1 },
      piernas: { cerca: { tob: { ...PIES_RECTOS.cerca }, ang: 0 }, lejos: { tob: { ...PIES_RECTOS.lejos }, ang: 0 } },
      cabeza: { ang: cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
  }
  const pelvisPantalla = p => G.aPantalla(p, p.pelvis);
  // rodilla cercana (hoja) según la cinemática de la pierna del montaje
  function rodilla(p, lado) {
    const cad = G.tronco(p)(G.CADERA[lado]), L = G.A.datos.piezas["pierna_" + lado].largo;
    const c = Recortes.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03);
    return Recortes.muestras(c, 2)[1];
  }
  // puntos de agarre de Marcos en Guillermo (pantalla, ya girados)
  function agarresG(p, rot) {
    const P = pelvisPantalla(p);
    const kn = rodilla(p, "cerca"), cad = G.tronco(p)(G.CADERA.cerca), mu = { x: lerp(cad.x, kn.x, AGARRE_MUSLO), y: lerp(cad.y, kn.y, AGARRE_MUSLO) };
    const bajo = G.aPantalla(p, { x: mu.x - 10, y: mu.y + 34 });
    const esp = G.aPantalla(p, G.tronco(p)(ESPALDA_G));
    return { rodilla: rotar(bajo, P, rot), espalda: rotar(esp, P, rot), P };
  }
  function poseSentado(px, py) {
    const p = poseGBase(px, py, 0, TORSO_BRAZOS, -0.1);
    p.piernas.cerca = { tob: { ...PIES_SENTADO.cerca }, ang: 0.45 };
    p.piernas.lejos = { tob: { ...PIES_SENTADO.lejos }, ang: 0.4 };
    return p;
  }

  function poseG(t, pM) {
    if (!GEO) preparaGeo();
    const tr = trayectoria(t);
    let p, rot = 0;
    const respira = Math.sin(t * 2.5);
    if (tr.modo === "brazos" || tr.pelvis) {
      // tercer bote y en brazos: la pelvis manda
      const enBrazos = tr.modo === "brazos";
      let P = enBrazos ? null : tr.pelvis;
      const gira = enBrazos ? 1 : suave(fase(t, GEO.Tc - 0.8, GEO.Tc));
      rot = ROT_BRAZOS * gira;
      if (enBrazos) {
        // la rodilla queda justo sobre la mano cercana de Marcos (que se mueve con él)
        const pm = pM || GEO.pM;
        const mano = MB.aPantalla(pm, MB.tronco(pm)(GEO.Hn));
        const off = GEO.offRodilla;
        P = { x: mano.x - off.x, y: mano.y - off.y };
      }
      p = poseGBase(P.x, P.y, 0, lerp(0.04 * Math.sin(t * 6), TORSO_BRAZOS, gira), lerp(-0.05, -0.1, gira));
      const e3 = enBrazos ? 1 : suave(clamp(tr.tau / 0.2));
      // piernas: del bote (rectas, pataleando) a sentado
      const pat = enBrazos ? 0 : (1 - gira);
      for (const lado of ["cerca", "lejos"]) {
        const sg = lado === "cerca" ? 1 : -1, ph = t * 15 + (lado === "cerca" ? 0 : Math.PI);
        const lev = 90 * (0.5 + 0.5 * Math.sin(ph)) * pat * e3;
        const recto = { x: PIES_RECTOS[lado].x + lev * 0.5, y: PIES_RECTOS[lado].y - lev };
        p.piernas[lado].tob = mezcla(recto, PIES_SENTADO[lado], gira);
        p.piernas[lado].ang = lerp((0.25 + 0.15 * sg * Math.sin(ph) * pat) * e3, lado === "cerca" ? 0.45 : 0.4, gira);
      }
      // aplastón al caer en brazos
      if (enBrazos) {
        const u = t - GEO.Tc, ap = Math.exp(-u * 9) * Math.sin(Math.min(1, u / 0.06) * Math.PI / 2);
        p.torsoEsc = { x: 1 + 0.06 * ap, y: 1 - 0.08 * ap + 0.006 * respira };
        p.cabeza.ang += -0.08 * ap + 0.03 * Math.sin((t - GEO.Tc) * 2.2) * tramo(t, GEO.Tc + 0.4, GEO.Tc + 0.9);
      }
    } else {
      // suela en (x, y) y agachado ag (px)
      const pel = tr.ag / S;
      const P = { x: tr.x, y: tr.y - HP + tr.ag };
      let torso = 0, cab = 0;
      if (tr.modo === "dentro" && t < T.salto0) {
        const asomado = 1 - tramo(t, T.trepa0, T.salto0);
        torso = 0.34 * asomado + 0.22 * (1 - asomado) - 0.12 * tramoDentro(t, T.miedo, T.miedo + 0.15, T.suspira, T.trepa0);
        cab = 0.05 - 0.06 * campana(t, T.ola0, T.ola1);
      } else if (t < T.salta) {
        const sube = tramo(t, T.salto0, T.salto1);
        torso = lerp(0.22, 0.18, sube) + 0.12 * tramo(t, T.prep, T.salta); cab = lerp(0.05, -0.04, sube);
      } else if (tr.lona) {
        torso = 0.04 * Math.sin(t * 6) + 0.002 * tr.ag; cab = -0.05 + 0.0015 * tr.ag;
      } else {
        const k0 = tr.aire === 0 ? Math.exp(-tr.tau * 8) : 0;
        torso = lerp(0.04 * Math.sin(t * 6), 0.30, k0); cab = lerp(-0.05, -0.04, k0);
      }
      p = poseGBase(P.x, P.y, pel, torso, cab);
      // piernas
      if (tr.modo === "dentro" || (t >= T.salto0 && t < T.salto1)) {
        const enc = t >= T.salto0 ? campana(t, T.salto0, T.salto1) : 0;      // recoge las piernas en el saltito
        p.piernas.cerca.tob = { x: PIES_RECTOS.cerca.x + 40 * enc, y: TOB - 110 * enc };
        p.piernas.lejos.tob = { x: PIES_RECTOS.lejos.x + 30 * enc, y: TOB - 8 - 100 * enc };
      } else if (t < T.salta) {
        const f = piesAgachado(t); p.piernas.cerca.tob = f.cerca; p.piernas.lejos.tob = f.lejos;
      } else if (tr.lona) {
        // en la lona, piernas rectas (como en el aire)
      } else {
        // en el aire: piernas casi rectas; al bajar pedalea. Envolvente: nada al despegar ni al tocar la lona
        const dur = tr.aire === 0 ? tJ : (tr.aire === 1 ? T.cae2 - T.sale1 : T.cae3 - T.sale2);
        const e = suave(clamp(tr.tau / 0.15)) * suave(clamp((dur - tr.tau) / 0.15));
        const baja = tr.aire ? tramo(tr.u ?? 0, 0.45, 0.65) : 0;
        const desde = tr.aire === 0 ? piesAgachado(T.salta) : null, kd = tr.aire === 0 ? suave(clamp(tr.tau / 0.25)) : 1;
        for (const lado of ["cerca", "lejos"]) {
          const ph = t * 14 + (lado === "cerca" ? 0 : Math.PI), lev = 70 * (0.5 + 0.5 * Math.sin(ph)) * baja * e;
          const b = desde ? mezcla(desde[lado], PIES_RECTOS[lado], kd) : PIES_RECTOS[lado];
          p.piernas[lado].tob = { x: b.x + lev * 0.6, y: b.y - lev };
          p.piernas[lado].ang = (0.22 + 0.2 * Math.sin(ph) * baja) * e;
        }
      }
      // inclinación del cuerpo en el aire
      if (tr.aire !== undefined) {
        const dur = tr.aire === 0 ? tJ : (tr.aire === 1 ? T.cae2 - T.sale1 : T.cae3 - T.sale2);
        const w = suave(clamp(tr.tau / 0.2)) * suave(clamp((dur - tr.tau) / 0.2));
        rot = (0.08 * Math.sin(t * 5.3) * (tr.aire === 0 ? 0.4 : 1) + (tr.aire === 2 ? -0.06 : 0)) * w;
      }
    }
    p.giro = rot;
    // ---------------- brazos ----------------
    const Tr = G.tronco(p);
    let c = Tr({ x: 120, y: 640 }), l = Tr({ x: 400, y: 640 });
    const PU = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
    let cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cdedos = { ...PU }, ldedos = { ...PU };
    const P = (q) => G.aHoja(p, q);
    if (t < T.salto1) {
      // manos en el alféizar
      const alfC = P({ x: XV - 24, y: ALF - 3 }), alfL = P({ x: XV + 34, y: ALF - 3 });
      c = alfC; l = alfL;
      // saluda con la mano lejana
      const ola = tramoDentro(t, T.ola0, T.ola0 + 0.25, T.ola1 - 0.2, T.ola1);
      if (ola > 0) {
        const sube = Tr({ x: 505, y: 205 });
        l = mezcla(l, sube, ola); lmu = lerp(lmu, 1.5, ola); lang = 0.45 * Math.sin((t - T.ola0) * 15) * ola;
        ldedos = { pulgar: ola, indice: ola, medio: ola, anular: ola, menique: ola };
      }
      // en el saltito empuja con las manos en el alféizar (se quedan en el borde)
      if (t >= T.salto0) {
        const u = fase(t, T.salto0, T.salto1);
        c = mezcla(P({ x: XV - 24, y: ALF - 3 }), Tr({ x: 150, y: 600 }), suave(u)); l = mezcla(P({ x: XV + 34, y: ALF - 3 }), Tr({ x: 380, y: 600 }), suave(u));
      }
    } else if (t < T.cae1) {
      // agachado y saltando: se tapa la nariz y levanta el otro brazo
      const base = Tr({ x: 150, y: 600 }), baseL = Tr({ x: 380, y: 600 });
      const nz = tramo(t, T.nariz0, T.nariz1);
      const nariz = G.cabeza(p).a({ x: 862, y: 664 });
      const muN = 2.11, dir = { x: -Math.cos(muN), y: -Math.sin(muN) };
      const cN = { x: nariz.x - 40 * dir.x, y: nariz.y - 40 * dir.y };
      c = mezcla(base, cN, nz); cmu = lerp(-1.75, muN, nz);
      cdedos = { pulgar: 0.7 * nz, indice: 0.75 * nz, medio: 0.15 * nz, anular: 0.1 * nz, menique: 0.1 * nz };
      const arr = tramo(t, T.nariz0 + 0.1, T.nariz1 + 0.15);
      l = mezcla(baseL, Tr({ x: 520, y: 290 }), arr); lmu = lerp(-1.75, 1.2, arr);
      ldedos = { pulgar: arr, indice: arr, medio: arr, anular: arr, menique: arr };
    } else if (tr.lona || (tr.aire !== undefined && tr.aire !== 0)) {
      // en la lona, brazos abajo y abiertos; en el aire, según el bote
      const enLona = tr.lona ? 1 : 0;
      const ab = { c: Tr({ x: 20, y: 600 }), l: Tr({ x: 480, y: 600 }) };
      if (enLona) {
        c = ab.c; l = ab.l;
        if (tr.lona === 1) {                       // al caer del salto suelta la nariz y baja el brazo
          const k = 1 - suave(fase(t, T.cae1, T.cae1 + DC));
          const nariz = G.cabeza(p).a({ x: 862, y: 664 }), muN = 2.11, dir = { x: -Math.cos(muN), y: -Math.sin(muN) };
          c = mezcla(c, { x: nariz.x - 40 * dir.x, y: nariz.y - 40 * dir.y }, k); cmu = lerp(-1.75, muN, k);
          l = mezcla(l, Tr({ x: 520, y: 290 }), k); lmu = lerp(-1.75, 1.2, k);
          cdedos = { pulgar: 0.7 * k, indice: 0.75 * k, medio: 0.15 * k, anular: 0.1 * k, menique: 0.1 * k };
          ldedos = { pulgar: k, indice: k, medio: k, anular: k, menique: k };
        }
      }
      else {
        const a = tr.aire, u = tr.u ?? 0, w = t * (a === 2 ? 7 : 16);
        let cc, ll, abre = 1;
        if (a === 2) {                              // disfruta: brazos en uve
          cc = Tr({ x: -15 + 12 * Math.sin(w), y: 222 + 10 * Math.cos(w) }); ll = Tr({ x: 520 + 12 * Math.sin(w + 1), y: 212 + 10 * Math.cos(w + 1) });
        } else {                                    // aspavientos
          cc = Tr({ x: 10 + 55 * Math.sin(w), y: 260 + 55 * Math.cos(w) }); ll = Tr({ x: 488 + 55 * Math.sin(w + 2.1), y: 250 + 55 * Math.cos(w + 2.1) });
        }
        // al despegar y al aterrizar, de los brazos abajo a los del bote
        const tauIn = tr.tau ?? 0, tauOut = (a === 3 ? GEO.Tc - T.sale3 : (a === 1 ? T.cae2 - T.sale1 : T.cae3 - T.sale2)) - tauIn;
        const k = suave(clamp(tauIn / 0.18)) * (a === 3 ? 1 : suave(clamp(tauOut / 0.15)));
        c = mezcla(ab.c, cc, k); l = mezcla(ab.l, ll, k);
        cmu = lerp(-1.75, 1.3, k); lmu = lerp(-1.75, 1.3, k);
        cdedos = { pulgar: k * abre, indice: k, medio: k, anular: k, menique: k }; ldedos = { ...cdedos };
        if (a === 3) {                              // antes de caer en brazos, las manos al pecho
          const pecho = tramo(t, GEO.Tc - 0.55, GEO.Tc - 0.1);
          c = mezcla(c, Tr({ x: 282, y: 470 }), pecho); l = mezcla(l, Tr({ x: 318, y: 456 }), pecho);
          cmu = lerp(cmu, -2.3, pecho); lmu = lerp(lmu, -2.3, pecho);
          const ce = 1 - pecho; cdedos = { pulgar: ce, indice: ce, medio: ce, anular: ce, menique: ce }; ldedos = { ...cdedos };
        }
      }
    } else if (tr.modo === "brazos") {
      c = Tr({ x: 282, y: 470 }); l = Tr({ x: 318, y: 456 }); cmu = -2.3; lmu = -2.3;
      cdedos = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 }; ldedos = { ...cdedos };
      // se lleva las manos juntas a la barbilla, coqueto
      const coq = tramo(t, T.rubor, T.rubor + 0.4);
      c = mezcla(c, Tr({ x: 296, y: 400 }), coq); l = mezcla(l, Tr({ x: 330, y: 392 }), coq);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: 1 };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: 1 };
    if (cdedos) p.manoCerca.dedos = cdedos;
    if (ldedos) p.manoLejos.dedos = ldedos;
    // ---------------- cabeza y cara ----------------
    p.cabeza.ang += 0.2 * Math.sin((t - T.niega0) * 24) * campana(t, T.niega0, T.niega1);
    p.cabeza.ang += 0.03 * respira * 0.3;
    if (!GUION_CARA_G) GUION_CARA_G = guionCaraG();
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.42, 1.55, 2.95, 9.75, 12.15, 12.95]));
    // colorado: del miedo, de aguantar la respiración y, en brazos, de vergüenza
    const rojoMiedo = 0.35 * tramoDentro(t, T.nariz0, T.nariz1, T.salta + 0.3, T.cae1);
    const rubor = tramo(t, T.rubor, T.rubor + 0.5);
    p.rojo = rojoMiedo + 0.55 * rubor;
    p.cara.rubor = Math.max(rojoMiedo, rubor);
    p.sudor = tramoDentro(t, T.miedo, T.miedo + 0.2, T.trepa0, T.salto0) + 0.8 * tramoDentro(t, T.salto1, T.salto1 + 0.2, T.salta, T.salta + 0.2);
    // temblor en el alféizar
    if (t > T.salto1 && t < T.salta) { const tb = 1.5 * tramo(t, T.salto1, T.salto1 + 0.2) * (1 - tramo(t, T.salta - 0.15, T.salta)); p.pelvis.x += ruido(t * 31) * tb / S * 0.6; p.cabeza.ang += ruido(t * 27 + 4) * 0.02 * tb; }
    return p;
  }

  /* =====================================================================================
   * MARCOS (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_M = {
    inicio: E({ sd: 10, gd: 0.08, si: 10, gi: 0.08, sonr: 0.7, abre: 6, ancho: 0.95 }),
    anima: E({ sd: 16, gd: 0.12, si: 16, gi: 0.12, sonr: 0.9, abre: 20, ancho: 1.05 }),
    insiste: E({ sd: 18, gd: 0.15, si: 6, gi: 0.04, sonr: 0.6, abre: 8, ancho: 0.9 }),
    mira: E({ sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 16, ancho: 0.6, sonr: 0.1 }),
    ceja: E({ mx: -0.85, my: 0, c: 0.32, sd: 0, gd: -0.02, si: 20, gi: 0.15, sonr: 0.3, ancho: 0.85, cam: 1 }),
    alarma: E({ iris: 0.72, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 28, ancho: 0.75, sonr: -0.25 }),
    listo: E({ c: 0.15, sd: -4, gd: -0.1, si: -4, gi: -0.1, sonr: 0.25, ancho: 0.9, abre: 4 }),
    sonrie: E({ c: 0.2, h: 0.5, sd: 12, gd: 0.1, si: 12, gi: 0.1, sonr: 0.9, abre: 8 }),
    guino: E({ mx: -0.85, my: -0.05, wd: 1, h: 1, sd: 4, gd: 0.04, si: 18, gi: 0.14, sonr: 0.95, abre: 10, ancho: 1, cam: 1 })
  };
  function guionCaraM() {
    return [
      [T.mllama0, T.mllama0 + 0.15, "anima"], [T.mllama1, T.mllama1 + 0.15, "inicio"], [T.miedo + 0.08, T.miedo + 0.25, "insiste"],
      [T.mllama2, T.mllama2 + 0.15, "anima"], [T.salta - 0.3, T.salta, "mira"],
      [T.sale1 + 1.0, T.sale1 + 1.15, "ceja"], [T.cae2 - 0.5, T.cae2 - 0.35, "mira"],
      [T.sale2 + 1.0, T.sale2 + 1.15, "ceja"], [T.cae3 - 0.55, T.cae3 - 0.4, "mira"],
      [T.mdate, T.mdate + 0.1, "alarma"], [T.mlisto, T.mlisto + 0.2, "listo"],
      [GEO.Tc + 0.15, GEO.Tc + 0.35, "sonrie"], [T.guino, T.guino + 0.14, "guino"]
    ];
  }
  let GUION_CARA_M = null;
  const PIE_M = { cerca: 0, lejos: 0 };
  function pieM(t, lado) {
    // dos pasos de lado hacia la derecha al soltar la lona
    const pasos = lado === "cerca" ? [[T.mpaso0, T.mpaso0 + 0.32, 0.5], [T.mpaso0 + 0.36, T.mpaso1, 1]] : [[T.mpaso0 + 0.16, T.mpaso0 + 0.5, 0.5], [T.mpaso0 + 0.52, T.mpaso1 + 0.05, 1]];
    let k = 0, alza = 0;
    for (const [a, b, kk] of pasos) { const u = fase(t, a, b); if (u > 0) { k = lerp(k, kk, suave5(u)); alza = Math.max(alza, Math.sin(Math.PI * u) * (u < 1 ? 1 : 0)); } }
    return { k, alza: 26 * alza };
  }
  function poseM(t, pG) {
    if (!GEO) preparaGeo();
    const respira = Math.sin(t * 2.0 + 1);
    const cerca = pieM(t, "cerca"), lejos = pieM(t, "lejos");
    const X = lerp(GEO.XM0, GEO.XM1, (cerca.k + lejos.k) / 2);
    const listo = tramo(t, T.mpaso1 - 0.2, T.mlisto);
    // golpecito en cada bote (le tiembla el aro en la mano) y agachada al coger a Guillermo
    let jolt = 0; for (const c of CONTACTOS) jolt += campana(t, c.t0, c.t0 + 0.3) * 0.6;
    const dipC = t >= GEO.Tc ? 70 * Math.sin(Math.min(1, (t - GEO.Tc) / 0.42) * Math.PI) * Math.exp(-(t - GEO.Tc) * 1.6) : 0;
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + lerp(16, 30, listo) + 10 * jolt + dipC + respira * 1.2 },
      torso: lerp(0.1, 0.06, listo) - 0.05 * dipC / 70, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const TOBM = MB.SUELO - MB.TOBILLO_ALTO;
    for (const [lado, f] of [["cerca", cerca], ["lejos", lejos]]) {
      const x0 = lado === "cerca" ? -125 : 130;
      const fx = lerp(GEO.XM0, GEO.XM1, f.k) + x0 * S * (-1);        // pantalla (en espejo, la cercana a la derecha)
      const hx = MB.aHoja(p, { x: fx, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: TOBM - (lado === "lejos" ? 8 : 0) - f.alza / (S * MB.K) }, ang: -0.15 * Math.sin(Math.PI * clamp(f.alza / 26)) };
    }
    const Tr = MB.tronco(p);
    // ---- cabeza: sigue a Guillermo con la mirada ----
    if (!GUION_CARA_M) GUION_CARA_M = guionCaraM();
    const ex = guion(GUION_CARA_M, CARAS_M, "inicio", t);
    let mir = { x: ex.mx, y: ex.my }, mira = 0;
    if (pG) {
      const ojo = MB.aPantalla(p, MB.centroCabeza(p)), cg = G.aPantalla(pG, G.centroCabeza(pG));
      const P = pelvisPantalla(pG), cgr = rotar(cg, P, pG.giro || 0);
      const dx = cgr.x - ojo.x, dy = cgr.y - ojo.y, d = Math.hypot(dx, dy) || 1;
      const seg = { x: clamp(-dx / d * 1.1, -1, 1), y: clamp(dy / d * 1.3, -1, 1) };
      mir = mezcla(seg, mir, ex.cam);
      mira = clamp(-dy / d) * (1 - ex.cam);
    }
    p.cabeza.ang = -0.28 * mira + 0.02 * Math.sin(t * 1.7) - 0.04 * jolt + 0.05 * dipC / 70;
    p.cara = cara(ex, parpadeo(t, [0.35, 2.2, 3.7, 5.6, 7.4, 8.4, 10.3, 11.4, 12.4]), mir);
    p.cara.ojos.d = Math.max(p.cara.ojos.d, 0.5 * jolt); p.cara.ojos.i = Math.max(p.cara.ojos.i, 0.5 * jolt);
    // ---- mano lejana: en el aro; luego lista para coger ----
    const aro = MB.aHoja(p, { x: LONA.cx + LONA.rx - 3, y: LONA.cy + 1 + estadoLona(t).d * 0.15 + 4 * Math.sin((t - T.msacude0) * 31) * campana(t, T.msacude0, T.msacude1) });
    let l = aro, lmu = -1.95, lang = 0, ldob = 1, lpu = 1, ldedos = null;
    const suelta = tramo(t, T.mdate + 0.05, T.mpaso0 + 0.25);
    const lListo = mezcla(Tr({ x: 590, y: 420 }), Tr(GEO.Hf), tramo(t, GEO.Tc - 0.32, GEO.Tc));
    if (suelta > 0) { l = mezcla(aro, lListo, suave(suelta)); lmu = lerp(lmu, GEO.muF, suelta); }
    // ---- mano cercana: llama, se hace visera, mira el reloj; luego lista para coger ----
    const reposo = MB.manoReposo(p, "cerca");
    let c = { x: reposo.x, y: reposo.y }, cmu = reposo.mu, cang = reposo.ang || 0, cdedos = reposo.dedos ? { ...reposo.dedos } : null;
    const llama = Math.max(tramoDentro(t, T.mllama0 - 0.1, T.mllama0 + 0.12, T.mllama1 - 0.1, T.mllama1 + 0.1), tramoDentro(t, T.mllama2 - 0.1, T.mllama2 + 0.12, T.mllama3 - 0.1, T.mllama3 + 0.1));
    if (llama > 0) {
      const dobla = 0.55 + 0.45 * Math.sin(t * 17);
      c = mezcla(c, Tr({ x: 430, y: 350 }), llama); cmu = lerp(cmu, 2.75, llama); cang = lerp(cang, 0, llama);
      const d = lerp(cdedos ? cdedos.indice : 0.6, dobla, llama);
      cdedos = { pulgar: lerp(0.5, 0.4, llama), indice: d, medio: d, anular: d, menique: d };
    }
    const visera = Math.max(tramoDentro(t, T.sale1 + 0.15, T.sale1 + 0.4, T.sale1 + 0.85, T.sale1 + 1.05), tramoDentro(t, T.sale2 + 0.12, T.sale2 + 0.37, T.sale2 + 0.85, T.sale2 + 1.05));
    if (visera > 0) {
      const v = MB.cabeza(p).a({ x: 800, y: 470 });
      c = mezcla(c, { x: v.x + 62, y: v.y - 22 }, visera); cmu = lerp(cmu, Math.PI, visera); cang = lerp(cang, 0.05, visera);
      cdedos = { pulgar: lerp(cdedos ? cdedos.pulgar : 0.5, 0.9, visera), indice: lerp(cdedos ? cdedos.indice : 0.6, 1, visera), medio: lerp(cdedos ? cdedos.medio : 0.6, 1, visera), anular: lerp(cdedos ? cdedos.anular : 0.5, 1, visera), menique: lerp(cdedos ? cdedos.menique : 0.5, 1, visera) };
    }
    // encoge un hombro y enseña la palma («¿y qué quieres que haga?») mientras Guillermo está arriba
    const encoge = tramoDentro(t, T.sale2 + 1.05, T.sale2 + 1.25, T.sale2 + 1.6, T.sale2 + 1.8);
    if (encoge > 0) {
      c = mezcla(c, Tr({ x: 420, y: 565 }), encoge); cmu = lerp(cmu, 2.9, encoge); cang = lerp(cang, 0, encoge);
      const ab = lerp(cdedos ? cdedos.indice : 0.6, 1, encoge);
      cdedos = { pulgar: lerp(cdedos ? cdedos.pulgar : 0.5, 0.9, encoge), indice: ab, medio: ab, anular: ab, menique: ab };
    }
    // listo para coger: brazos arriba y adelante; al cogerlo bajan a su sitio (bajo el muslo y la espalda)
    const bajaC = tramo(t, GEO.Tc - 0.32, GEO.Tc);
    const cListo = mezcla(Tr({ x: 430, y: 430 }), Tr(GEO.Hn), bajaC);
    const cl = tramo(t, T.mdate + 0.05, T.mpaso1);
    if (cl > 0) {
      c = mezcla(c, cListo, cl); cmu = lerp(cmu, GEO.muN, cl); cang = lerp(cang, 0, cl);
      cdedos = { pulgar: lerp(cdedos ? cdedos.pulgar : 0.5, 0.9, cl), indice: lerp(cdedos ? cdedos.indice : 0.6, 0.95, cl), medio: lerp(cdedos ? cdedos.medio : 0.6, 0.95, cl), anular: lerp(cdedos ? cdedos.anular : 0.5, 0.95, cl), menique: lerp(cdedos ? cdedos.menique : 0.5, 0.9, cl) };
      lpu = 1; ldedos = { pulgar: 0.9 * cl, indice: 0.95 * cl, medio: 0.95 * cl, anular: 0.95 * cl, menique: 0.9 * cl };
    }
    // al cogerlo, la mano lejana va a su espalda y los dedos se cierran un poco
    if (t >= GEO.Tc - 0.12 && pG) {
      const ag = agarresG(pG, pG.giro);
      const w = tramo(t, GEO.Tc - 0.12, GEO.Tc + 0.04);
      l = mezcla(l, MB.aHoja(p, ag.espalda), w);
      const cierra = 0.95 - 0.4 * w;
      cdedos = { pulgar: lerp(0.9, 0.85, w), indice: cierra, medio: cierra, anular: cierra, menique: lerp(0.9, cierra, w) }; ldedos = { ...cdedos };
    }
    // manos «de encima» (las dibuja la escena por delante de Guillermo): el montaje solo dibuja el brazo
    const encima = t >= T.mlisto - 0.3;
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: encima ? 0 : 1 };
    if (cdedos) p.manoCerca.dedos = cdedos;
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: ldob, puno: encima ? 0 : lpu };
    if (ldedos) p.manoLejos.dedos = ldedos;
    p.encima = encima ? { cerca: { ...p.manoCerca, puno: 1 }, lejos: { ...p.manoLejos, puno: 1 } } : null;
    return p;
  }
  // dibuja una mano de Marcos (de su postura) con la misma transformación que el montaje
  const COL_M = () => ({ piel: MB.C.piel, sombra: MB.C.pielSombra, tinta: MB.C.tinta });
  function manoEncima(g, p, m) {
    g.save();
    const k = p.s * MB.K;
    g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-MB.PELVIS.x, -MB.SUELO);
    g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(MB.JK, MB.JK);
    if (m.dedos) Personaje2D.mano(g, m, COL_M()); else Personaje2D.puno(g, m.pulgar, COL_M());
    g.restore();
  }

  /* =====================================================================================
   * GEOMETRÍA (posición de Marcos y del agarre en brazos)
   * ===================================================================================== */
  const invTr = (p, q) => {                       // de la hoja «girada con el torso» a la hoja en reposo
    const x = q.x - p.pelvis.x, y = q.y - p.pelvis.y, c = Math.cos(-p.torso), s = Math.sin(-p.torso);
    return { x: MB.PELVIS.x + (x * c - y * s) / p.torsoEsc.x, y: MB.PELVIS.y + (x * s + y * c) / p.torsoEsc.y };
  };
  let HN = { x: 300, y: 600 };
  function preparaGeo() {
    GEO = { Tc: 99 };
    const alc = (MB.BRAZO_L + MB.MUNECA_R * MB.JK) * S * MB.K;
    // Marcos sujetando el aro: la mano lejana llega al borde derecho con el brazo casi estirado
    const base = x => ({ x, suelo: SUELO, s: S, espejo: true, pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + 16 }, torso: 0.1, torsoEsc: { x: 1, y: 1 },
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } });
    const aro = { x: LONA.cx + LONA.rx - 3, y: LONA.cy + 1 };
    let lo = aro.x, hi = aro.x + 200;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, p = base(m), h = MB.aPantalla(p, MB.tronco(p)(MB.HOMBRO)); if (Math.hypot(h.x - aro.x, h.y - aro.y) < 0.86 * alc) lo = m; else hi = m; }
    GEO.XM0 = (lo + hi) / 2;
    GEO.XM1 = GEO.XM0 + 118;
    // Marcos listo (en su sitio final, sin agacharse): la mano cercana bajo las rodillas de Guillermo
    const pM = base(GEO.XM1); pM.pelvis.y = MB.PELVIS.y + 30; pM.torso = 0.06;
    GEO.Hn = { ...HN };
    GEO.muN = 2.25; GEO.muF = 2.1;
    const mano = MB.aPantalla(pM, MB.tronco(pM)(GEO.Hn));
    // Guillermo sentado con la pelvis en (0, 0): desde ahí, dónde queda su rodilla (girada)
    const p0 = poseSentado(0, 0); p0.giro = ROT_BRAZOS;
    const a0 = agarresG(p0, ROT_BRAZOS);
    GEO.offRodilla = { x: a0.rodilla.x - a0.P.x, y: a0.rodilla.y - a0.P.y };
    const Pc = { x: mano.x - GEO.offRodilla.x, y: mano.y - GEO.offRodilla.y };
    const pc = poseSentado(Pc.x, Pc.y); pc.giro = ROT_BRAZOS;
    const ac = agarresG(pc, ROT_BRAZOS);
    GEO.Hf = invTr(pM, MB.aHoja(pM, ac.espalda));
    GEO.pM = pM; GEO.Pc = Pc;
    // tercer bote: de la lona a los brazos
    const P0 = { x: CONTACTOS[2].x, y: LONA.cy - HP };
    const dy = Pc.y - P0.y;
    const aire3 = (V3 + Math.sqrt(V3 * V3 + 2 * GR * dy)) / GR;
    GEO.Tc = T.sale3 + aire3;
    GEO.vx3 = (Pc.x - P0.x) / aire3;
    T.coge = GEO.Tc; T.rubor = GEO.Tc + 0.75; T.guino = GEO.Tc + 1.3; T.fin = DUR - 0.9;
    // comprobaciones de alcance (para afinar)
    const hn = MB.aPantalla(pM, MB.tronco(pM)(MB.HOMBRO_C)), hf = MB.aPantalla(pM, MB.tronco(pM)(MB.HOMBRO));
    const alcC = (MB.BRAZO_C_L + MB.MUNECA_R * MB.JK) * S * MB.K;
    GEO.chk = { cerca: Math.hypot(mano.x - hn.x, mano.y - hn.y) / alcC, lejos: Math.hypot(ac.espalda.x - hf.x, ac.espalda.y - hf.y) / alc, Pc, aire3, Tc: GEO.Tc, XM0: GEO.XM0 };
  }

  /* =====================================================================================
   * DECORADO: calle soleada con la fachada del bar
   * ===================================================================================== */
  const RES = 1.6;                                  // resolución extra del fondo (la cámara se acerca)
  let fondo = null, ventana = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = Math.round((W + 240) * RES); c.height = Math.round((H + 160) * RES);
    const g = c.getContext("2d"); g.scale(RES, RES); g.translate(120, 80);
    g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    const cielo = g.createLinearGradient(0, -80, 0, 520); cielo.addColorStop(0, "#5fb6ea"); cielo.addColorStop(0.65, "#a9dcf6"); cielo.addColorStop(1, "#f3e6c8");
    g.fillStyle = cielo; g.fillRect(-120, -80, W + 240, 620);
    // nubes
    const nube = (x, y, k) => { g.fillStyle = "rgba(255,255,255,0.92)"; g.beginPath();
      for (const [dx, dy, r] of [[0, 0, 26], [28, -12, 30], [60, -2, 24], [86, 6, 18], [34, 10, 26]]) { g.moveTo(x + dx * k + r * k, y + dy * k); g.arc(x + dx * k, y + dy * k, r * k, 0, Math.PI * 2); }
      g.fill(); g.fillStyle = "rgba(210,228,245,0.6)"; g.beginPath(); g.ellipse(x + 44 * k, y + 22 * k, 52 * k, 8 * k, 0, 0, Math.PI * 2); g.fill(); };
    nube(560, 70, 1.1); nube(820, 40, 0.8); nube(960, 130, 0.9); nube(680, 170, 0.6);
    // edificios al fondo (derecha)
    const colores = ["#f2b8a2", "#a9c8e8", "#f4d58d", "#b9d9b0", "#e8b6d0"];
    for (let i = 0; i < 6; i++) {
      const x = 430 + i * 118, w = 112, top = 190 + hash(i * 3.3) * 90;
      g.fillStyle = colores[i % colores.length]; g.fillRect(x, top, w, 520 - top);
      g.strokeStyle = "rgba(60,40,40,0.35)"; g.lineWidth = 2; g.strokeRect(x, top, w, 520 - top);
      g.fillStyle = "rgba(60,50,70,0.25)"; g.fillRect(x - 3, top - 8, w + 6, 10);
      for (let fy = top + 22; fy < 470; fy += 46) for (let fx = x + 14; fx < x + w - 20; fx += 34) {
        g.fillStyle = "rgba(70,90,120,0.55)"; g.fillRect(fx, fy, 18, 24); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(fx + 2, fy + 2, 5, 20);
      }
    }
    // árbol
    g.fillStyle = "#6b4a2b"; g.fillRect(842, 360, 18, 170); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(842, 360, 18, 170);
    g.fillStyle = "#4f9a3c"; g.beginPath();
    for (const [x, y, r] of [[851, 330, 62], [806, 360, 44], [896, 362, 46], [830, 294, 40], [876, 298, 42]]) { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); }
    g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "#6dbb52"; g.beginPath(); g.arc(832, 304, 22, 0, Math.PI * 2); g.arc(868, 320, 18, 0, Math.PI * 2); g.fill();
    // farola
    g.fillStyle = "#2d3a33"; g.fillRect(968, 300, 9, 252); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(968, 300, 9, 252);
    g.beginPath(); g.moveTo(958, 300); g.lineTo(987, 300); g.lineTo(980, 270); g.lineTo(965, 270); g.closePath(); g.fillStyle = "#f6e6b0"; g.fill(); g.stroke();
    // acera y calzada
    g.fillStyle = "#cfc6b6"; g.fillRect(-120, 520, W + 240, 80);
    g.strokeStyle = "rgba(90,80,70,0.25)"; g.lineWidth = 1.5;
    for (let x = -120; x < W + 140; x += 52) { g.beginPath(); g.moveTo(x, 520); g.lineTo(x - 18, 600); g.stroke(); }
    for (const y of [536, 560]) { g.beginPath(); g.moveTo(-120, y); g.lineTo(W + 120, y); g.stroke(); }
    g.fillStyle = "#9b9488"; g.fillRect(-120, 594, W + 240, 8); g.fillStyle = "#5d5a57"; g.fillRect(-120, 602, W + 240, 80);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-120, 520); g.lineTo(W + 120, 520); g.stroke();
    // ---- fachada del bar ----
    const F0 = -120, F1 = 420;
    const est = g.createLinearGradient(F0, 0, F1, 0); est.addColorStop(0, "#d99a52"); est.addColorStop(1, "#ebb46a");
    g.fillStyle = est; g.fillRect(F0, -80, F1 - F0, 600);
    g.fillStyle = "rgba(150,90,40,0.12)"; for (let i = 0; i < 260; i++) g.fillRect(F0 + hash(i * 1.7) * (F1 - F0), -80 + hash(i * 4.1) * 600, 3, 2);
    // esquina de piedra
    for (let y = -80, i = 0; y < 520; y += 30, i++) { const w = i % 2 ? 22 : 34; g.fillStyle = "#e9d6b4"; g.fillRect(F1 - w, y, w, 28); g.strokeStyle = "rgba(90,70,50,0.6)"; g.lineWidth = 1.5; g.strokeRect(F1 - w, y, w, 28); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(F1, -80); g.lineTo(F1, 520); g.stroke();
    // cornisa arriba e imposta entre plantas
    g.fillStyle = "#c98a46"; g.fillRect(F0, 30, F1 - F0, 14); g.fillStyle = "#f2c98a"; g.fillRect(F0, 30, F1 - F0, 4);
    g.fillStyle = "#c98a46"; g.fillRect(F0, 306, F1 - F0, 12); g.fillStyle = "#f2c98a"; g.fillRect(F0, 306, F1 - F0, 3);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; for (const y of [30, 44, 306, 318]) { g.beginPath(); g.moveTo(F0, y); g.lineTo(F1, y); g.stroke(); }
    // ventanas del segundo piso (cortadas por arriba) y otra del primero a la izquierda
    for (const [x0, y0, x1, y1] of [[210, -80, 334, 18], [20, 118, 150, 290]]) {
      g.fillStyle = "#3d2a22"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle = "#6a8fb0"; g.fillRect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16);
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(x0 + 14, y1 - 12); g.lineTo(x0 + 40, y0 + 12); g.lineTo(x0 + 54, y0 + 12); g.lineTo(x0 + 28, y1 - 12); g.closePath(); g.fill();
      g.strokeStyle = "#3d2a22"; g.lineWidth = 5; g.beginPath(); g.moveTo((x0 + x1) / 2, y0 + 8); g.lineTo((x0 + x1) / 2, y1 - 8); g.stroke();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
      // contraventanas verdes cerradas a medias y repisa
      g.fillStyle = "#3f8a5a"; g.fillRect(x0 - 30, y0, 28, y1 - y0); g.fillRect(x1 + 2, y0, 28, y1 - y0);
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(x0 - 30, y0, 28, y1 - y0); g.strokeRect(x1 + 2, y0, 28, y1 - y0);
      g.strokeStyle = "rgba(0,0,0,0.3)"; for (let y = y0 + 10; y < y1; y += 12) { g.beginPath(); g.moveTo(x0 - 26, y); g.lineTo(x0 - 6, y); g.moveTo(x1 + 6, y); g.lineTo(x1 + 26, y); g.stroke(); }
      if (y1 > 100) { g.fillStyle = "#e9d6b4"; g.fillRect(x0 - 8, y1 - 2, x1 - x0 + 16, 9); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(x0 - 8, y1 - 2, x1 - x0 + 16, 9); }
    }
    // ventana de Guillermo: hueco con la habitación dentro (luz cálida, cortina y lámpara)
    const v = VEN;
    const hab = g.createLinearGradient(0, v.y0, 0, v.y1); hab.addColorStop(0, "#5a3a2a"); hab.addColorStop(1, "#3a241a");
    g.fillStyle = hab; g.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
    const lam = g.createRadialGradient(v.x0 + 30, v.y0 + 40, 4, v.x0 + 30, v.y0 + 40, 110); lam.addColorStop(0, "rgba(255,214,140,0.65)"); lam.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = lam; g.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
    g.fillStyle = "#7a2f3a"; g.beginPath(); g.moveTo(v.x1 - 4, v.y0 + 4); g.quadraticCurveTo(v.x1 - 30, v.y0 + 90, v.x1 - 14, v.y1 - 4); g.lineTo(v.x1 - 4, v.y1 - 4); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#e9d6b4"; g.fillRect(v.x0 - 10, v.y0 - 12, v.x1 - v.x0 + 20, 12);                // dintel
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(v.x0 - 10, v.y0 - 12, v.x1 - v.x0 + 20, 12);
    g.strokeStyle = "#f4efe4"; g.lineWidth = 6; g.strokeRect(v.x0 + 3, v.y0 + 3, v.x1 - v.x0 - 6, v.y1 - v.y0 - 3);   // marco blanco
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
    // ---- planta baja: puerta, letrero colgante y escaparate con toldo ----
    g.fillStyle = "#6b3f22"; g.fillRect(30, 300, 112, 220);
    const pu = g.createLinearGradient(30, 0, 142, 0); pu.addColorStop(0, "#7d4b29"); pu.addColorStop(1, "#5d351c");
    g.fillStyle = pu; g.fillRect(38, 310, 96, 210);
    g.fillStyle = "#f6d993"; g.fillRect(52, 324, 68, 70); g.strokeStyle = "#3a200f"; g.lineWidth = 4; g.strokeRect(52, 324, 68, 70);
    g.beginPath(); g.moveTo(86, 324); g.lineTo(86, 394); g.moveTo(52, 359); g.lineTo(120, 359); g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2; g.strokeRect(52, 410, 68, 90);
    g.fillStyle = "#e3b341"; g.beginPath(); g.arc(124, 440, 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(30, 300, 112, 220);
    // letrero colgante con una jarra dibujada
    g.strokeStyle = "#1c1a1c"; g.lineWidth = 4; g.beginPath(); g.moveTo(-40, 236); g.lineTo(-2, 236); g.moveTo(-34, 236); g.lineTo(-34, 244); g.moveTo(-8, 236); g.lineTo(-8, 244); g.stroke();
    g.fillStyle = "#3b6d4a"; g.fillRect(-52, 244, 62, 46); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(-52, 244, 62, 46);
    g.fillStyle = "#f5aa1d"; g.fillRect(-32, 258, 20, 24); g.fillStyle = "#fff4dc"; g.beginPath(); g.ellipse(-22, 258, 12, 5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(-32, 258, 20, 24); g.beginPath(); g.moveTo(-12, 263); g.quadraticCurveTo(-4, 263, -4, 270); g.quadraticCurveTo(-4, 277, -12, 277); g.stroke();
    // escaparate
    g.fillStyle = "#3a241a"; g.fillRect(170, 352, 168, 150);
    const esc = g.createLinearGradient(0, 360, 0, 494); esc.addColorStop(0, "#f8d79a"); esc.addColorStop(1, "#d99a52");
    g.fillStyle = esc; g.fillRect(178, 360, 152, 134);
    const bot = ["#2f7a3c", "#7a2f3a", "#e3b341", "#d8e8f0", "#3a5f9a", "#b04a20"];
    for (let i = 0; i < 9; i++) { const x = 186 + i * 16, h = 36 + hash(i * 2.2) * 18; g.fillStyle = bot[i % bot.length]; g.fillRect(x, 470 - h, 10, h); g.fillRect(x + 3, 462 - h, 4, 10); }
    g.fillStyle = "#6b3f22"; g.fillRect(178, 470, 152, 6);
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(186, 488); g.lineTo(220, 366); g.lineTo(238, 366); g.lineTo(204, 488); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(170, 352, 168, 150);
    // toldo a rayas sobre el escaparate
    g.save(); g.beginPath(); g.moveTo(160, 330); g.lineTo(348, 330); g.lineTo(356, 352); g.lineTo(152, 352); g.closePath(); g.clip();
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#f7f2e6" : "#c7323b"; g.fillRect(152 + i * 18, 330, 18, 24); }
    g.restore();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(160, 330); g.lineTo(348, 330); g.lineTo(356, 352); g.lineTo(152, 352); g.closePath(); g.stroke();
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#f7f2e6" : "#c7323b"; g.beginPath(); g.arc(161 + i * 17, 352, 8.5, 0, Math.PI); g.fill(); g.lineWidth = 1.5; g.stroke(); }
    // zócalo
    g.fillStyle = "#a76d3a"; g.fillRect(F0, 502, F1 - F0, 18); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(F0, 502, F1 - F0, 18);
    // luz cálida de tarde y viñeta
    const sol = g.createRadialGradient(780, 40, 30, 780, 40, 700); sol.addColorStop(0, "rgba(255,240,200,0.28)"); sol.addColorStop(1, "rgba(255,220,170,0)");
    g.fillStyle = sol; g.fillRect(-120, -80, W + 240, H + 160);
    const vi = g.createRadialGradient(512, 320, 300, 512, 320, 760); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(30,20,10,0.4)");
    g.fillStyle = vi; g.fillRect(-120, -80, W + 240, H + 160);
    return c;
  }
  // alféizar, jardinera y contraventanas de la ventana de Guillermo (por delante de él cuando está dentro)
  const VR = { x: 160, y: 100, w: 230, h: 230 };
  function creaVentana() {
    const c = document.createElement("canvas"); c.width = Math.round(VR.w * RES); c.height = Math.round(VR.h * RES);
    const g = c.getContext("2d"); g.scale(RES, RES); g.translate(-VR.x, -VR.y); g.lineJoin = "round"; g.lineCap = "round";
    const v = VEN;
    // contraventanas abiertas
    for (const [x0, x1] of [[v.x0 - 42, v.x0 - 4], [v.x1 + 4, v.x1 + 42]]) {
      g.fillStyle = "#3f8a5a"; g.fillRect(x0, v.y0, x1 - x0, v.y1 - v.y0);
      g.fillStyle = "#357a4d"; g.fillRect(x0 + 4, v.y0 + 6, x1 - x0 - 8, v.y1 - v.y0 - 12);
      g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2; for (let y = v.y0 + 12; y < v.y1 - 6; y += 11) { g.beginPath(); g.moveTo(x0 + 6, y); g.lineTo(x1 - 6, y); g.stroke(); }
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(x0, v.y0, x1 - x0, v.y1 - v.y0);
      g.fillStyle = "#2b2b2b"; for (const y of [v.y0 + 22, v.y1 - 22]) { g.beginPath(); g.arc(x0 < v.x0 ? x1 - 2 : x0 + 2, y, 3, 0, Math.PI * 2); g.fill(); }
    }
    // alféizar de piedra
    g.fillStyle = "#e9d6b4"; g.fillRect(v.x0 - 14, ALF - 3, v.x1 - v.x0 + 28, 10);
    g.fillStyle = "#cbb38c"; g.fillRect(v.x0 - 14, ALF + 4, v.x1 - v.x0 + 28, 3);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(v.x0 - 14, ALF - 3, v.x1 - v.x0 + 28, 10);
    // jardinera con geranios
    const j0 = v.x0 - 4, j1 = v.x1 + 4, jy = ALF + 7;
    g.fillStyle = "#4a8f3e";
    for (let i = 0; i < 14; i++) { const x = j0 + 6 + i * (j1 - j0 - 12) / 13; g.beginPath(); g.ellipse(x, jy - 1, 8, 5, (i % 3 - 1) * 0.5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#a0522d"; g.fillRect(j0, jy, j1 - j0, 22);
    g.fillStyle = "#8a4423"; g.fillRect(j0, jy + 14, j1 - j0, 8);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(j0, jy, j1 - j0, 22);
    for (let i = 0; i < 7; i++) {
      const x = j0 + 14 + i * (j1 - j0 - 28) / 6, y = jy - 4 - (i % 2) * 4;
      g.fillStyle = "#e0303e"; g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; g.moveTo(x + Math.cos(a) * 4 + 3.4, y + Math.sin(a) * 4); g.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.4, 0, Math.PI * 2); } g.fill();
      g.fillStyle = "#ffd25c"; g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill();
    }
    return c;
  }

  /* ---------- lona de salto ---------- */
  const ARO = "#d8232f", ARO_OSC = "#951520", TELA = "#f4ecd8";
  function lonaAtras(g, t) {
    const { cx, cy, rx, ry } = LONA, L = estadoLona(t), d = L.d, baja = 0.08 * Math.max(0, d);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // patas de atrás
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 7; g.beginPath();
    for (const dx of [-0.62, 0.62]) { g.moveTo(cx + dx * rx, cy - ry * 0.75 + baja); g.lineTo(cx + dx * rx * 1.08, SUELO - 14); } g.stroke();
    g.strokeStyle = "#9aa3ad"; g.lineWidth = 3.5; g.stroke();
    // aro (mitad de atrás)
    g.lineWidth = 11; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.ellipse(cx, cy + baja, rx, ry, 0, Math.PI, Math.PI * 2); g.stroke();
    g.lineWidth = 8; g.strokeStyle = ARO; g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = "#ffe14d"; g.beginPath(); g.ellipse(cx, cy + baja - 1, rx, ry - 1, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    // tela
    const tela = () => { g.beginPath(); g.ellipse(cx, cy + baja, rx - 5, ry - 3, 0, 0, Math.PI * 2); };
    tela(); g.fillStyle = TELA; g.fill();
    g.save(); tela(); g.clip();
    const hx = L.x, hy = cy + baja + Math.max(0, d) * 0.9;
    // aro rojo y centro rojo (se hunden con la tela)
    g.strokeStyle = ARO; g.lineWidth = 6; g.beginPath(); g.ellipse(cx + (hx - cx) * 0.3, cy + baja + Math.max(0, d) * 0.45, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = ARO; g.beginPath(); g.ellipse(hx, hy, rx * 0.24, ry * 0.26, 0, 0, Math.PI * 2); g.fill();
    // sombra del hundimiento
    if (Math.abs(d) > 0.3) {
      const k = clamp(Math.abs(d) / 40), gr = g.createRadialGradient(hx, hy, 2, hx, hy, rx * 0.95);
      gr.addColorStop(0, `rgba(60,30,20,${0.55 * k})`); gr.addColorStop(1, "rgba(60,30,20,0)");
      g.fillStyle = gr; g.fillRect(cx - rx, cy - ry * 2, rx * 2, ry * 5);
      g.strokeStyle = `rgba(80,40,30,${0.4 * k})`; g.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (rx - 6), cy + baja + Math.sin(a) * (ry - 3)); g.lineTo(hx + Math.cos(a) * 6, hy + Math.sin(a) * 2); g.stroke(); }
    }
    g.restore();
    // muelles del borde (mitad de atrás)
    g.strokeStyle = "#3a3f46"; g.lineWidth = 1.6;
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) / 9 * Math.PI; const x0 = cx + Math.cos(a) * rx, y0 = cy + baja + Math.sin(a) * ry, x1 = cx + Math.cos(a) * (rx - 5), y1 = cy + baja + Math.sin(a) * (ry - 3);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.restore();
  }
  function lonaDelante(g, t) {
    const { cx, cy, rx, ry } = LONA, d = estadoLona(t).d, baja = 0.08 * Math.max(0, d);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // faldón: el canto del bastidor por delante
    g.beginPath(); g.ellipse(cx, cy + baja, rx, ry, 0, 0, Math.PI); g.ellipse(cx, cy + baja + 11, rx, ry, 0, Math.PI, 0, true); g.closePath();
    g.fillStyle = ARO_OSC; g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.stroke();
    g.save(); g.beginPath(); g.ellipse(cx, cy + baja, rx, ry, 0, 0, Math.PI); g.ellipse(cx, cy + baja + 11, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.clip();
    g.strokeStyle = "#ffe14d"; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy + baja + 6, rx, ry, 0, 0.1, Math.PI - 0.1); g.stroke(); g.restore();
    // aro (mitad de delante)
    g.lineWidth = 11; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.ellipse(cx, cy + baja, rx, ry, 0, 0, Math.PI); g.stroke();
    g.lineWidth = 8; g.strokeStyle = ARO; g.stroke();
    g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(cx, cy + baja - 2, rx - 1, ry - 1, 0, 0.25, Math.PI - 0.25); g.stroke();
    // patas de delante
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 8; g.beginPath();
    for (const dx of [-0.72, 0.72]) { g.moveTo(cx + dx * rx, cy + ry * 0.7 + baja + 11); g.lineTo(cx + dx * rx * 1.12, SUELO - 2); } g.stroke();
    g.strokeStyle = "#b6bec7"; g.lineWidth = 4.5; g.stroke();
    g.fillStyle = "#2b2b2b"; for (const dx of [-0.72, 0.72]) { g.beginPath(); g.ellipse(cx + dx * rx * 1.12, SUELO - 1, 9, 4, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function sombraEnLona(g, t, tr, pG) {
    if (!tr.aire && tr.aire !== 0) return;
    if (tr.aire === 3 && t > T.sale3 + 0.6) return;
    const P = pelvisPantalla(pG), alto = (LONA.cy - HP) - P.y;
    if (alto < 4) return;
    const k = 1 / (1 + Math.max(0, alto) / 260);
    const x = clamp(P.x, LONA.cx - LONA.rx + 20, LONA.cx + LONA.rx - 20);
    g.save(); g.globalAlpha = 0.3 * k + 0.05; g.fillStyle = "#2a1a10";
    g.beginPath(); g.ellipse(x, LONA.cy + 1, 40 * k + 6, 7 * k + 2, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  function boing(g, t) {
    for (const c of CONTACTOS) {
      const k = fase(t, c.t0 + DC * 0.4, c.t0 + DC + 0.35); if (k <= 0 || k >= 1) continue;
      g.save(); g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round"; g.globalAlpha = Math.sin(Math.PI * k);
      for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) {
        const x = c.x + sg * (LONA.rx * 0.55 + 18 * k + i * 10), y = LONA.cy - 18 - i * 12 - 20 * k;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sg * 8, y - 6, x + sg * 4, y - 14); g.stroke();
      }
      g.restore();
    }
  }
  // rayas de velocidad cuando sale por arriba o entra cayendo
  function rayas(g, t, tr, pG) {
    if (tr.aire === undefined || tr.aire === 0) return;
    const P = pelvisPantalla(pG);
    const vy = tr.aire === 3 ? (-V3 + GR * tr.tau) : (-(tr.aire === 1 ? V1 : V2) + GR * tr.tau);
    const k = clamp((Math.abs(vy) - 700) / 600); if (k <= 0.01) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.globalAlpha = 0.75 * k;
    for (let i = 0; i < 5; i++) {
      const x = P.x - 34 + i * 17, L = 36 + 30 * hash(i + 3), off = vy < 0 ? 70 : -150;
      const y0 = P.y + off + (vy < 0 ? 0 : -L) + 18 * hash(i + 9);
      g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + L); g.stroke();
    }
    g.restore();
  }
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impactoCoge(g, t, x, y) {
    const k = fase(t, GEO.Tc - 0.01, GEO.Tc + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k);
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.3, r0 = 34 + 26 * k, r1 = r0 + 14; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.7); g.stroke(); }
    g.restore();
  }
  function corazones(g, t, pG) {
    const k = tramo(t, T.rubor + 0.1, T.rubor + 0.4); if (k <= 0.01) return;
    const P = pelvisPantalla(pG), c = rotar(G.aPantalla(pG, G.centroCabeza(pG)), P, pG.giro || 0);
    g.save(); g.lineJoin = "round";
    for (let i = 0; i < 4; i++) {
      const ph = ((t - T.rubor) * 0.55 + i * 0.27) % 1, a = Math.sin(Math.PI * ph) * k;
      if (a <= 0.02) continue;
      const x = c.x + 26 + i * 9 + Math.sin(t * 3 + i * 2) * 8, y = c.y - 30 - ph * 70, r = (5 + 2 * hash(i + 3)) * (0.6 + 0.4 * a);
      g.globalAlpha = a; g.fillStyle = i % 2 ? "#ff5a7a" : "#ff8aa5"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5);
      g.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.fill(); g.stroke();
    }
    g.restore();
  }
  function destelloGuino(g, t, pM) {
    const k = fase(t, T.guino + 0.05, T.guino + 0.6); if (k <= 0 || k >= 1) return;
    const c = MB.aPantalla(pM, MB.cabeza(pM).a({ x: 760, y: 470 }));
    g.save(); g.globalAlpha = Math.sin(Math.PI * k); g.fillStyle = "#ffffff"; g.strokeStyle = "#ffe14d"; g.lineWidth = 1.5;
    estrellaPuntas(g, c.x - 8, c.y - 6, 9 * Math.sin(Math.PI * k) + 2, 4, t * 2, 0.25); g.fill(); g.stroke(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const abre = tramo(t, 3.2, 4.15);
    const cierra = tramo(t, GEO.Tc + 0.15, GEO.Tc + 1.0);
    const a = { k: 1.18, x: 430, y: 310 }, b = { k: 1.0, x: 512, y: 300 };
    const c = { k: 1.5, x: GEO.Pc.x + 12, y: 400 };
    const k1 = lerp(a.k, b.k, abre), x1 = lerp(a.x, b.x, abre), y1 = lerp(a.y, b.y, abre);
    return { k: lerp(k1, c.k, cierra), x: lerp(x1, c.x, cierra), y: lerp(y1, c.y, cierra) };
  }

  class GuillermoLona extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!GEO) preparaGeo();
      if (!fondo) { fondo = creaFondo(); ventana = creaVentana(); }
      const pM0 = poseM(t, null);
      const pG = poseG(t, pM0);
      const pM = poseM(t, pG);
      const tr = trayectoria(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      let tb = 0;
      for (const c of CONTACTOS) if (t >= c.t0) tb += 2.2 * Math.exp(-(t - c.t0) * 8) * suave(fase(t, c.t0, c.t0 + 0.05));
      if (t >= GEO.Tc) tb += 3.5 * Math.exp(-(t - GEO.Tc) * 8) * suave(fase(t, GEO.Tc, GEO.Tc + 0.05));
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -120, -80, W + 240, H + 160);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(40,25,10,0.28)";
      g.beginPath(); g.ellipse(LONA.cx, SUELO + 1, LONA.rx + 18, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pM.x - 4, SUELO + 2, 54, 6, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      const dibG = () => {
        const P = pelvisPantalla(pG);
        g.save(); if (pG.giro) { g.translate(P.x, P.y); g.rotate(pG.giro); g.translate(-P.x, -P.y); }
        G.dibujar(g, pG, t); g.restore();
      };
      const dentro = tr.modo === "dentro";
      if (dentro) { g.save(); g.beginPath(); g.rect(VEN.x0 - 200, -400, 600, ALF - 3 + 400); g.clip(); dibG(); g.restore(); }
      g.drawImage(ventana, VR.x, VR.y, VR.w, VR.h);
      lonaAtras(g, t);
      sombraEnLona(g, t, tr, pG);
      const conMarcos = t >= T.sale3;           // en el último bote, Guillermo va por delante de Marcos
      if (!dentro && !conMarcos) dibG();
      lonaDelante(g, t);
      MB.dibujar(g, pM, t);
      if (conMarcos) dibG();
      if (pM.encima) { manoEncima(g, pM, pM.encima.lejos); manoEncima(g, pM, pM.encima.cerca); }
      boing(g, t);
      rayas(g, t, tr, pG);
      if (t >= GEO.Tc - 0.02) { const P = pelvisPantalla(pG); impactoCoge(g, t, P.x, P.y); }
      corazones(g, t, pG);
      destelloGuino(g, t, pM);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00030", nombre: "Guillermo y Marcos · La lona de salto", crear: () => new GuillermoLona() });
  window.__A2D_00030 = {
    pose: t => { if (!GEO) preparaGeo(); const pM0 = poseM(t, null), pG = poseG(t, pM0); return { g: pG, m: poseM(t, pG) }; },
    T, DUR, geo: () => (GEO || preparaGeo(), GEO), prueba: (rot, torso, mus, hx, hy) => { ROT_BRAZOS = rot; TORSO_BRAZOS = torso; AGARRE_MUSLO = mus; HN = { x: hx, y: hy }; GEO = null; preparaGeo(); return GEO.chk; }, tray: t => (GEO || preparaGeo(), trayectoria(t))
  };
})();
