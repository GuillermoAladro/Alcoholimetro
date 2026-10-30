"use strict";
/* 00001.2 · Guillermo y la jarra — revisión de continuidad
 *
 * Negro → Guillermo Aladro (su avatar 2D, troceado en recortables) entra andando desde la
 * izquierda con una jarra llena, se para en el centro, se la bebe entera en cuatro tragos,
 * suelta un «aaah», eructa, mira a cámara con un brindis y un guiño y sale andando por la
 * derecha → negro. Sin títulos ni textos.
 *
 * Fluidez: todo depende del tiempo absoluto (se puede rebobinar y grabar a cualquier fps).
 * Los pasos se planifican de antemano: cada pie queda clavado al suelo mientras apoya (no
 * patina), la cadera sube y baja con cada zancada, la cabeza tiene inercia calculada con su
 * propia trayectoria y la cerveza mantiene la superficie horizontal y llega justo al borde.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, rebote, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 560, CX = 512, X0 = -175, JARRA_ESC = 2.2;
  const DUR = 15.45;
  const T = {
    entra0: 0.12, para: 3.75, asienta: 4.0,
    mira0: 3.85, sube0: 4.3, sube1: 4.9, bebe0: 4.9, bebe1: 7.5, baja1: 8.0,
    carga0: 8.5, eructo: 8.95, eructo1: 9.6, alivio1: 10.0,
    camara0: 10.05, brinda0: 10.3, brinda1: 10.7, guino0: 10.78, guino1: 11.18,
    vuelve0: 11.3, vuelve1: 11.7, sale0: 11.72
  };

  /* ---------- trayectoria de la pelvis (px de pantalla) ---------- */
  const FRENO = 0.9, ARRANQUE = 0.7;
  const V = (CX - X0) / ((T.para - T.entra0) - FRENO / 2);
  function posX(t) {
    if (t < T.para - FRENO) return X0 + V * (t - T.entra0);
    if (t < T.para) { const u = t - (T.para - FRENO); return X0 + V * (T.para - FRENO - T.entra0) + V * u - V * u * u / (2 * FRENO); }
    if (t < T.sale0) return CX;
    const u = t - T.sale0;
    if (u < ARRANQUE) return CX + V * u * u / (2 * ARRANQUE);
    return CX + V * ARRANQUE / 2 + V * (u - ARRANQUE);
  }
  function velX(t) {
    if (t < T.para - FRENO) return V;
    if (t < T.para) return V * (1 - (t - (T.para - FRENO)) / FRENO);
    if (t < T.sale0) return 0;
    const u = t - T.sale0; return u < ARRANQUE ? V * u / ARRANQUE : V;
  }
  function tiempoEn(x, t0, t1) { let lo = t0, hi = t1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (posX(m) < x) lo = m; else hi = m; } return (lo + hi) / 2; }

  /* ---------- pisadas (x de pantalla de cada tobillo) ---------- */
  const PASO = 320 * S, ADELANTO = 150 * S;
  const LAT = { cerca: -44 * S, lejos: 44 * S };          // cada pie en su carril
  const REPOSO = { cerca: -52 * S, lejos: 50 * S };        // pies parados en el centro
  const pisadas = { cerca: [], lejos: [] };
  (function planifica() {
    pisadas.cerca.push({ t: -10, x: X0 + REPOSO.cerca + 40 * S }); pisadas.lejos.push({ t: -10, x: X0 + REPOSO.lejos - 120 * S });
    let pie = "lejos", linea = X0 + 60 * S;
    for (let k = 0; k < 60; k++) {
      linea += PASO;
      const x = linea + LAT[pie];
      if (x > CX + REPOSO[pie] - PASO * 0.45) break;
      pisadas[pie].push({ t: tiempoEn(linea - ADELANTO, -1, T.para), x });
      pie = pie === "cerca" ? "lejos" : "cerca";
    }
    // dos últimos pasos hasta la posición de reposo
    const ultimo = Math.max(pisadas.cerca.at(-1).t, pisadas.lejos.at(-1).t);
    const otro = pie === "cerca" ? "lejos" : "cerca";
    const t1 = Math.max(ultimo + 0.38, Math.min(T.para - 0.1, tiempoEn(CX + REPOSO[pie] - ADELANTO * 0.6 - LAT[pie], -1, T.para)));
    pisadas[pie].push({ t: t1, x: CX + REPOSO[pie] });
    pisadas[otro].push({ t: Math.max(t1 + 0.32, T.para + 0.06), x: CX + REPOSO[otro] });
    // salida: arranca el pie de atrás
    pie = "cerca"; linea = CX;
    for (let k = 0; k < 40; k++) {
      linea += k === 0 ? PASO * 0.6 : PASO;
      const t = tiempoEn(linea - ADELANTO, T.sale0, T.sale0 + 10);
      pisadas[pie].push({ t: Math.max(t, T.sale0 + 0.16 + k * 0.04), x: linea + LAT[pie] });
      pie = pie === "cerca" ? "lejos" : "cerca";
      if (linea > 1500) break;
    }
  })();
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function pie(lado, t, xPelvis) {
    const L = pisadas[lado];
    let i = 0; while (i + 1 < L.length && L[i + 1].t <= t) i++;
    const ant = L[i], sig = L[i + 1];
    let x, y = 0, ang = 0, arco = 0;
    if (!sig) x = ant.x;
    else {
      const ciclo = sig.t - ant.t, vuelo = clamp(ciclo * 0.4, 0.22, 0.36), despega = sig.t - vuelo;
      if (t < despega) {
        x = ant.x;
        const k1 = fase(t, ant.t, ant.t + 0.12), k2 = fase(t, despega - 0.17, despega);
        ang = -0.26 * (1 - suave(k1)) * (ant.t > 0 ? 1 : 0) + 0.4 * suave(k2);
      } else {
        const u = fase(t, despega, sig.t), e = suave5(u);
        x = lerp(ant.x, sig.x, e);
        arco = Math.sin(Math.PI * u);
        y = -78 * clamp(Math.abs(sig.x - ant.x) / PASO, 0.3, 1.1) * Math.pow(arco, 0.9);
        ang = lerp(0.4, -0.26, suave(u));
      }
    }
    // a hoja, relativo a la pelvis; giro sobre la punta (talón arriba) o sobre el talón (punta arriba)
    let tob = { x: G.PELVIS.x + (x - xPelvis) / S, y: TOB_Y[lado] + y };
    if (ang > 0) { const pv = { x: tob.x + G.PUNTA.x, y: tob.y + G.PUNTA.y }; const r = G.rotP({ x: -G.PUNTA.x, y: -G.PUNTA.y }, ang); tob = { x: pv.x + r.x, y: pv.y + r.y }; }
    else if (ang < 0) { const pv = { x: tob.x + G.TALON.x, y: tob.y + G.TALON.y }; const r = G.rotP({ x: -G.TALON.x, y: -G.TALON.y }, ang); tob = { x: pv.x + r.x, y: pv.y + r.y }; }
    return { tob, ang, arco, xs: x };
  }

  /* ---------- guion de la cara y el cuerpo ---------- */
  const VOL0 = 0.86;
  function volumen(t) {
    if (t < T.bebe0) return VOL0;
    if (t >= T.bebe1) return 0;
    const u = (t - T.bebe0) / (T.bebe1 - T.bebe0) * 4, k = Math.floor(u), f = u - k;
    // El último trago termina al retirar la jarra, sin mantenerla vacía en la boca.
    return VOL0 * (1 - (k + suave5(k === 3 ? f : f / 0.62)) / 4);
  }
  function parpadeo(t) {
    let o = 0;
    for (const tb of [1.5, 3.05, 12.55, 13.7]) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  // Arranque suave con un pequeño rebote al final (sin tirones al empezar ni al acabar).
  const elastico = (k, a = 0.09) => suave5(Math.min(1, k / 0.72)) + a * Math.pow(Math.sin(Math.PI * fase(k, 0.5, 1)), 2);

  /* Expresiones: cada una es un conjunto de números; se pasa de una a otra mezclándolos,
   * así ningún gesto salta de un fotograma al siguiente. */
  const BASE = { mx: 0.85, my: 0.05, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0,
    orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0, bigote: 0 };
  const E = (o) => Object.assign({}, BASE, o);
  const CARAS = {
    anda: E({}),
    antojo: E({ mx: 0.75, my: 0.9, sd: 12, gd: 0.12, si: 12, gi: 0.12, orig: 0, abre: 14, sonr: 0.9, ancho: 1.05 }),
    bebe: E({ mx: 0.6, my: 0.4, c: 1, sd: 16, gd: 0.2, si: 16, gi: 0.2, orig: 0, abre: 9, ancho: 0.45, sonr: 0, dientes: 0 }),
    aah: E({ mx: 0.6, my: 0.4, c: 1, h: 1, sd: 14, gd: 0.2, si: 14, gi: 0.2, orig: 0, abre: 46, ancho: 1.12, sonr: 0.35, lengua: 1, bigote: 1 }),
    aguanta: E({ mx: 0.2, my: -0.4, c: 0, iris: 0.72, sd: 20, gd: 0.15, si: 20, gi: 0.15, orig: 0, abre: 0, ancho: 0.55, sonr: -0.35, mof: 1, bigote: 1 }),
    eructo: E({ mx: 0.2, my: -0.4, c: 1, h: 1, z: 1, sd: -4, gd: -0.12, si: -4, gi: -0.12, orig: 0, abre: 118, ancho: 1.55, sonr: 0.08, lengua: 1 }),
    eructoFin: E({ mx: 0.2, my: -0.4, c: 1, h: 1, z: 1, sd: 4, gd: -0.12, si: 4, gi: -0.12, orig: 0, abre: 55, ancho: 1.2, sonr: 0.08, lengua: 1 }),
    alivio: E({ mx: 0.3, my: 0.3, c: 0.45, sd: 6, gd: 0.1, si: 6, gi: 0.1, orig: 0, abre: 0, sonr: 0.85 }),
    camara: E({ mx: -0.8, my: -0.35, c: 0, sd: 18, gd: 0.18, si: 0, gi: -0.05, orig: 0, abre: 24, sonr: 1, ancho: 1.18 }),
    sale: E({ mx: 0.85, my: 0.05, c: 0, sd: 4, gd: 0.06, si: 4, gi: 0.06, orig: 0, abre: 0, sonr: 0.75, ancho: 0.95 })
  };
  const GUION_CARA = [
    [T.mira0, T.mira0 + 0.3, "antojo"], [T.bebe0 - 0.15, T.bebe0 + 0.1, "bebe"], [T.bebe1 - 0.02, T.bebe1 + 0.2, "aah"],
    [T.carga0, T.carga0 + 0.18, "aguanta"], [T.eructo, T.eructo + 0.06, "eructo"], [T.eructo + 0.06, T.eructo1, "eructoFin"],
    [T.eructo1, T.eructo1 + 0.25, "alivio"], [T.camara0, T.camara0 + 0.25, "camara"], [T.vuelve0, T.vuelve1 + 0.15, "sale"]
  ];
  function mezclaE(a, b, k) { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; }
  function expresion(t) {
    let e = CARAS.anda;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function aCara(e, guino) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: e.c, i: Math.max(e.c, guino), feliz: Math.max(e.h, guino), apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: e.bigote };
  }
  // Jarra respecto al hombro (hoja) y giro de la muñeca alrededor del puño (mu): colgando, sujeta
  // delante, bebiendo y brindando. mu recorre un único tramo continuo (la muñeca pasa por el lado).
  const LLEVA = { x: 18, y: 309, mu: -1.75 }, SUJETA = { x: 178, y: 66, mu: -3.57 }, BRINDA = { x: 76, y: -33, mu: -4.63 };
  const MU_BEBE = -4.43;
  const mz = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerp(a.mu, b.mu, k) });

  function poseBase(t) {
    const x = posX(t), v = velX(t), anda = clamp(v / V);
    const pc = pie("cerca", t, x), pl = pie("lejos", t, x);
    const quieto = tramo(t, T.asienta - 0.15, T.asienta + 0.15) * (1 - tramo(t, T.sale0 - 0.15, T.sale0 + 0.15));
    const respira = Math.sin(t * 2.2) * lerp(0.25, 1, quieto);
    const zanc = Math.max(pc.arco, pl.arco);
    const fasePaso = (x - X0) / PASO * Math.PI;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + 20 * anda - 17 * zanc * anda + respira * 1.5 + 4 * campana(t, T.para - 0.1, T.para + 0.5) },
      torso: 0.045 * anda + 0.012 * Math.sin(fasePaso) * anda, torsoEsc: { x: 1, y: 1 + respira * 0.004 - 0.012 * (1 - zanc) * anda },
      piernas: { cerca: { tob: pc.tob, ang: pc.ang }, lejos: { tob: pl.tob, ang: pl.ang } },
      cabeza: { ang: 0.025 * Math.sin(fasePaso + 0.6) * anda, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      brazo: { dobla: -1 }, ikContinuo: true,
      jarra: { x: 0, y: 0, ang: 0, mu: LLEVA.mu, vol: VOL0, espuma: 1, chapoteo: 0, restos: 0, escala: JARRA_ESC },
      cara: null, xPiesMin: Math.min(pc.xs, pl.xs), xPiesMax: Math.max(pc.xs, pl.xs)
    };
    const fr = campana(t, T.para - 0.5, T.para + 0.5);       // frenada
    p.torso += 0.05 * fr;

    // ---- cara ----
    const e = expresion(t);
    e.c = Math.max(e.c, parpadeo(t));
    const u4 = (t - T.bebe0) / (T.bebe1 - T.bebe0) * 4, kTrago = u4 - Math.floor(u4);
    const trago = t >= T.bebe0 && t < T.bebe1 ? campana(kTrago, 0.05, 0.62) : 0;
    e.bigote *= salida(fase(t, T.bebe1 - 0.02, T.bebe1 + 0.18));
    const sonrCam = tramo(t, T.camara0 + 0.1, T.brinda0 + 0.1);
    e.abre *= t > T.camara0 && t < T.vuelve1 + 0.15 ? sonrCam : 1;
    const guino = campana(t, T.guino0, T.guino1);
    p.cara = aCara(e, clamp(guino * 1.7));
    p.cara.rubor = tramo(t, T.bebe0 + 1.2, T.baja1 + 0.4) * 0.9 * (1 - 0.4 * tramo(t, T.vuelve0, T.sale0 + 1.5));

    // ---- jarra ----
    const H = G.tronco(p)(G.HOMBRO);
    const balanceo = Math.sin(fasePaso) * anda;
    const jAndar = { x: LLEVA.x - 26 * balanceo, y: LLEVA.y - 6 * Math.abs(balanceo), mu: LLEVA.mu };
    let j = jAndar, jAng = 0.05 * balanceo;
    p.jarra.chapoteo = t > T.sale0 ? 0.06 * balanceo : 0.08 * balanceo - 0.25 * fr * Math.sin(fase(t, T.para - 0.5, T.para + 0.5) * Math.PI * 2.2);

    // anticipación: levanta la jarra delante y la mira con ganas
    const mira = tramo(t, T.mira0, T.mira0 + 0.35);
    if (t > T.mira0) {
      p.cabeza.ang += 0.08 * mira * (1 - tramo(t, T.sube1 - 0.2, T.sube1));
      j = mz(j, SUJETA, tramo(t, T.mira0, T.sube0));
      p.jarra.chapoteo += 0.06 * Math.sin(t * 9) * mira * (1 - tramo(t, T.sube0, T.sube1));
    }
    // sube la jarra y bebe
    const vol = volumen(t);
    p.jarra.vol = vol;
    if (t >= T.sube0 && t < T.baja1) {
      const ki = tramo(t, T.sube0, T.sube1, suave5), kb = tramo(t, T.bebe1, T.baja1, suave5);
      // La superficie llega al labio sin conservar líquido por encima del borde.
      const psiBebe = G.inclinacionParaBeber(vol);
      const psi = lerp(lerp(0, psiBebe, ki), 0, kb);
      const atras = clamp(-psi / 2.1, 0, 1);
      p.cabeza.ang += lerp(0, -0.1 - 0.32 * atras, ki * (1 - kb)) + 0.03 * trago;
      p.torso -= 0.07 * atras * ki * (1 - kb);
      p.pelvis.y += 4 * trago;
      jAng = psi;
      const m = G.boca(p), b = G.rotP({ x: G.BORDE.x * JARRA_ESC, y: G.BORDE.y * JARRA_ESC }, psi);
      const enBoca = { x: m.x - b.x - H.x, y: m.y - b.y - H.y, mu: MU_BEBE };
      const arco = { x: (SUJETA.x + enBoca.x) / 2 + 40, y: Math.min(SUJETA.y, enBoca.y) - 20, mu: (SUJETA.mu + MU_BEBE) / 2 };
      const sube = mz(mz(SUJETA, arco, ki), mz(arco, enBoca, ki), ki);
      j = kb > 0 ? mz(enBoca, SUJETA, kb) : sube;
      p.jarra.chapoteo *= 1 - ki;
      p.jarra.espuma = lerp(1, 0.25, tramo(t, T.bebe0, T.bebe1)) * suave(clamp(vol / 0.02));
    }
    p.jarra.restos = tramo(t, T.bebe1 - 0.08, T.bebe1 + 0.12);
    if (t >= T.bebe1) p.cabeza.ang += -0.12 * tramo(t, T.bebe1, T.bebe1 + 0.2) * (1 - tramo(t, T.carga0, T.carga0 + 0.2));
    if (t >= T.baja1) j = SUJETA;

    // carga y eructo (ataque rápido pero suave: ningún salto de un fotograma)
    if (t >= T.carga0) {
      const c = tramo(t, T.carga0, T.eructo);
      const ata = suave(fase(t, T.eructo, T.eructo + 0.06));
      const e2 = fase(t, T.eructo, T.eructo1);
      const golpe = ata * Math.exp(-Math.max(0, t - T.eructo - 0.06) * 5.5);
      const env = ata * (1 - suave(e2));
      const pre = c * (1 - ata);
      p.torsoEsc = { x: p.torsoEsc.x + 0.035 * pre - 0.02 * golpe, y: p.torsoEsc.y + 0.03 * pre - 0.035 * golpe };
      p.pelvis.y -= 6 * pre;
      p.torso += -0.04 * pre + 0.1 * golpe;
      p.cabeza.ang += 0.07 * pre - 0.3 * golpe - 0.05 * env * Math.sin(e2 * 24);
      p.cabeza.esc = { x: 1 + 0.03 * pre - 0.05 * golpe, y: 1 - 0.02 * pre + 0.07 * golpe };
      p.cabeza.dy = -10 * golpe;
      j = { x: SUJETA.x + 8 * golpe, y: SUJETA.y + 10 * golpe, mu: SUJETA.mu };
      jAng = 0.08 * golpe;
    }
    // mira a cámara y brinda
    if (t >= T.camara0) {
      const cam = tramo(t, T.camara0, T.camara0 + 0.3, elastico) * (1 - tramo(t, T.vuelve0, T.vuelve1, suave5));
      p.cabeza.ang += 0.05 * cam;
      const b = tramo(t, T.brinda0, T.brinda1, k => elastico(k, 0.12)) * (1 - tramo(t, T.vuelve0 - 0.05, T.vuelve1));
      const choque = campana(t, T.brinda1, T.brinda1 + 0.2);
      j = mz(SUJETA, { x: BRINDA.x, y: BRINDA.y - 10 * choque, mu: BRINDA.mu }, b);
      jAng = lerp(0, 0.16, b) - 0.12 * choque * b;
      p.torso += -0.025 * b;
    }
    // recoge la jarra y se va
    if (t >= T.vuelve0) j = mz(j, jAndar, tramo(t, T.vuelve0, T.vuelve1 + 0.15));
    if (t > T.sale0) p.cabeza.ang += 0.04 * Math.sin((x - CX) / PASO * Math.PI) * anda;
    const hombroFinal = G.tronco(p)(G.HOMBRO);
    p.jarra.x = hombroFinal.x + j.x; p.jarra.y = hombroFinal.y + j.y; p.jarra.ang = jAng; p.jarra.mu = j.mu;
    return p;
  }

  // Inercia de la cabeza: se queda un poco atrás en los arranques y frenadas y rebota.
  function cabezaPantalla(t) { const p = poseBase(t), c = G.centroCabeza(p); return G.aPantalla(p, c); }
  function pose(t) {
    const p = poseBase(t);
    const d = 1 / 30;
    const a = cabezaPantalla(t), b = cabezaPantalla(t - d), c = cabezaPantalla(t - 2 * d);
    const ax = (a.x - 2 * b.x + c.x) / (d * d), ay = (a.y - 2 * b.y + c.y) / (d * d);
    p.cabeza.ang += clamp(-ax * 0.00004, -0.06, 0.06);
    p.cabeza.dy += clamp(-ay * 0.004, -6, 6);
    // Resolver el contacto después de la inercia, la respiración y el último gesto.
    const contacto = tramo(t, T.sube0, T.sube1, suave5) * (1 - tramo(t, T.bebe1, T.baja1, suave5));
    if (contacto > 0) {
      const m = G.boca(p), b = G.rotP({ x: G.BORDE.x * JARRA_ESC, y: G.BORDE.y * JARRA_ESC }, p.jarra.ang);
      p.jarra.x += (m.x - b.x - p.jarra.x) * contacto;
      p.jarra.y += (m.y - b.y - p.jarra.y) * contacto;
    }
    return p;
  }

  /* ---------- decorado: bar en penumbra ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 60; const g = c.getContext("2d");
    g.fillStyle = "#0c2529"; g.fillRect(0, 0, c.width, c.height); g.translate(40, 30);
    const pared = g.createLinearGradient(0, 0, 0, 440); pared.addColorStop(0, "#0c2529"); pared.addColorStop(1, "#1d5257");
    g.fillStyle = pared; g.fillRect(-40, -30, W + 80, 470);
    // azulejos de metro muy suaves
    g.strokeStyle = "rgba(255,255,255,0.045)"; g.lineWidth = 1;
    for (let y = 18; y < 440; y += 26) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); const off = (y / 26) % 2 ? 0 : 26;
      for (let x = off - 52; x < W + 40; x += 52) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); } }
    // luz cálida detrás del personaje
    const foco = g.createRadialGradient(CX, 300, 20, CX, 300, 460);
    foco.addColorStop(0, "rgba(140,214,200,0.55)"); foco.addColorStop(0.5, "rgba(80,160,155,0.22)"); foco.addColorStop(1, "rgba(40,110,110,0)");
    g.fillStyle = foco; g.fillRect(-40, -30, W + 80, 470);
    // lámparas colgantes
    for (const lx of [210, 814]) {
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, 46); g.stroke();
      const halo = g.createRadialGradient(lx, 66, 4, lx, 66, 150); halo.addColorStop(0, "rgba(255,206,120,0.55)"); halo.addColorStop(1, "rgba(255,190,100,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 66, 150, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#151417"; g.beginPath(); g.moveTo(lx - 34, 72); g.quadraticCurveTo(lx, 30, lx + 34, 72); g.closePath(); g.fill();
      g.fillStyle = "#ffe2a6"; g.beginPath(); g.ellipse(lx, 72, 26, 7, 0, 0, Math.PI * 2); g.fill();
    }
    // zócalo de madera de barra
    const mad = g.createLinearGradient(0, 440, 0, SUELO); mad.addColorStop(0, "#4a2b1b"); mad.addColorStop(1, "#2e1a10");
    g.fillStyle = mad; g.fillRect(-40, 440, W + 80, SUELO - 440);
    g.fillStyle = "#7b4a2b"; g.fillRect(-40, 432, W + 80, 12); g.fillStyle = "#9a6038"; g.fillRect(-40, 432, W + 80, 3);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, 444, W + 80, 5);
    g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 2;
    for (let x = -14; x < W + 40; x += 74) { g.beginPath(); g.moveTo(x, 449); g.lineTo(x, SUELO); g.stroke(); }
    // suelo
    const su = g.createLinearGradient(0, SUELO, 0, H); su.addColorStop(0, "#5a3520"); su.addColorStop(1, "#2a160c");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 30 - SUELO);
    g.fillStyle = "rgba(255,210,150,0.18)"; g.fillRect(-40, SUELO, W + 80, 2);
    const brillo = g.createRadialGradient(CX, SUELO + 10, 10, CX, SUELO + 10, 320); brillo.addColorStop(0, "rgba(160,220,205,0.22)"); brillo.addColorStop(1, "rgba(160,220,205,0)");
    g.save(); g.translate(0, SUELO); g.scale(1, 0.2); g.fillStyle = brillo; g.fillRect(-40, -200, W + 80, 400); g.restore();
    // viñeta
    const v = g.createRadialGradient(CX, 300, 300, CX, 300, 680); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-40, -30, W + 80, H + 60);
    return c;
  }
  function polvo(g, t) {          // motas de luz flotando (bokeh)
    for (let i = 0; i < 9; i++) {
      const x = ((hash(i) * W + t * (6 + hash(i + 3) * 10)) % (W + 80)) - 40, y = 60 + hash(i + 7) * 330 + Math.sin(t * 0.6 + i) * 10;
      const r = 6 + hash(i + 11) * 16;
      g.globalAlpha = 0.05 + 0.06 * hash(i + 5);
      g.fillStyle = i % 3 ? "#bff3e6" : "#ffd79a";
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }
  function sombra(g, p) {
    const x0 = Math.min(p.xPiesMin, p.x - 30) - 26, x1 = Math.max(p.xPiesMax, p.x + 30) + 52;
    g.save(); g.fillStyle = "rgba(0,0,0,0.38)"; g.beginPath(); g.ellipse((x0 + x1) / 2, SUELO + 1, (x1 - x0) / 2, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* ---------- efectos ---------- */
  function bocaPantalla(p) { return G.aPantalla(p, G.boca(p)); }
  function estallido(g, t, p) {   // viñeta de cómic detrás durante el eructo
    const k = fase(t, T.eructo - 0.02, T.eructo + 0.55); if (k <= 0 || k >= 1) return;
    const m = bocaPantalla(p);
    g.save(); g.translate(m.x, m.y); g.rotate(t * 0.4);
    g.globalAlpha = 0.16 * Math.sin(Math.PI * Math.pow(k, 0.6)); g.fillStyle = "#e9fff7";
    const n = 22;
    g.beginPath();
    for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = a0 + Math.PI / n * (0.55 + 0.4 * hash(i)); const r0 = 40 + 40 * k, r1 = 900;
      g.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0); g.lineTo(Math.cos(a0) * r1, Math.sin(a0) * r1); g.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1); g.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0); }
    g.fill(); g.restore();
  }
  function ondas(g, t, p) {
    const e0 = T.eructo; if (t < e0 || t > e0 + 1.1) return;
    const m = bocaPantalla(p);
    g.save(); g.translate(m.x + 6, m.y); g.rotate(-0.15 + p.cabeza.ang * 0.7); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const k = fase(t, e0 + i * 0.09, e0 + i * 0.09 + 0.6); if (k <= 0 || k >= 1) continue;
      const r = 14 + 165 * salida(k);
      g.globalAlpha = (1 - k) * 0.95; g.strokeStyle = "#fff3c8"; g.lineWidth = 9 * (1 - k) + 1.5;
      g.beginPath(); g.arc(-10, 0, r, -0.8, 0.8); g.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const k = fase(t, e0 + 0.02 + i * 0.05, e0 + 0.65 + i * 0.04); if (k <= 0 || k >= 1) continue;
      const dx = 30 + 120 * salida(k) * (0.7 + hash(i) * 0.6), dy = (hash(i + 4) - 0.5) * 60 * salida(k) - 18 * k;
      g.globalAlpha = Math.pow(1 - k, 2) * 0.6; g.fillStyle = "#fbf6e8";
      g.beginPath(); g.arc(dx, dy, 6 + 16 * k, 0, Math.PI * 2); g.arc(dx + 10 + 8 * k, dy - 4, 5 + 12 * k, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    // la espuma del bigote sale disparada
    const b0 = G.aPantalla(p, G.cabeza(p).a({ x: 806, y: 706 }));
    g.save(); g.translate(b0.x, b0.y);
    for (let i = 0; i < 12; i++) {
      const k = fase(t, e0 + hash(i + 21) * 0.08, e0 + 0.95); if (k <= 0 || k >= 1) continue;
      const vx = 170 + hash(i) * 260, vy = -40 - hash(i + 11) * 170, tt = k * 0.95;
      const x = vx * tt + (hash(i + 30) - 0.5) * 14, y = vy * tt + 420 * tt * tt + (hash(i + 31) - 0.5) * 6;
      g.globalAlpha = 1 - suave(fase(k, 0.6, 1));
      g.fillStyle = "#fff4dc"; g.strokeStyle = "#7a5c40"; g.lineWidth = 1.4;
      g.beginPath(); g.arc(x, y, 3 + hash(i + 3) * 3.4, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  function destello(g, t, p) {      // brillo en la sonrisa al mirar a cámara
    const k = fase(t, T.brinda1 - 0.05, T.brinda1 + 0.4); if (k <= 0 || k >= 1) return;
    const m = bocaPantalla(p), r = 12 * Math.sin(Math.PI * k);
    g.save(); g.translate(m.x + 12, m.y - 4); g.rotate(k * 1.2); g.fillStyle = "#ffffff"; g.globalAlpha = 0.95;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
    g.restore();
  }
  function chinchin(g, t, p) {      // destello del vidrio al brindar
    const k = fase(t, T.brinda1, T.brinda1 + 0.35); if (k <= 0 || k >= 1) return;
    const borde = G.rotP({ x: 66 * JARRA_ESC, y: -46 * JARRA_ESC }, p.jarra.ang);
    const j = G.aPantalla(p, { x: p.jarra.x + borde.x, y: p.jarra.y + borde.y });
    g.save(); g.translate(j.x, j.y); g.strokeStyle = "#fffbe8"; g.lineCap = "round"; g.globalAlpha = 1 - k; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45 + 0.4, r0 = 8 + 14 * k, r1 = r0 + 11; g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const acerca = tramo(t, T.mira0 + 0.2, T.bebe1, suave) * (1 - tramo(t, T.vuelve0, T.sale0 + 1.4, suave));
    const golpe = t >= T.eructo ? Math.exp(-(t - T.eructo) * 5) * 0.035 * tramo(t, T.eructo, T.eructo + 0.08) : 0;
    const k = 1 + 0.10 * acerca + golpe;
    // Zoom anclado al suelo: cabeza y zapatillas completas, también en el eructo.
    return { k, x: CX + 18 * acerca, y: SUELO - (SUELO - H / 2) / k };
  }

  class GuillermoJarra extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      const p = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.85, suave) * (1 - tramo(t, 14.55, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const temblor = t >= T.eructo ? Math.exp(-(t - T.eructo) * 6) * tramo(t, T.eructo, T.eructo + 0.06) * (1 - tramo(t, T.eructo + 0.7, T.eructo + 0.9)) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (temblor > 0) g.translate(ruido(t * 45) * 6 * temblor, ruido(t * 45 + 17) * 4 * temblor);
      g.drawImage(fondo, -40, -30);
      polvo(g, t);
      estallido(g, t, p);
      sombra(g, p);
      G.dibujar(g, p, t);
      ondas(g, t, p);
      destello(g, t, p);
      chinchin(g, t, p);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00001.2", nombre: "Guillermo y la jarra · revisada", crear: () => new GuillermoJarra() });
  window.__A2D_00001_2 = { pose, poseBase, T, pisadas, posX, DUR, camara, volumen, JARRA_ESC };
})();
