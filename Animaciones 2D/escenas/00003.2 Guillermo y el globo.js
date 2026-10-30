"use strict";
/* 00003.2 · Guillermo y el globo
 *
 * Negro → Guillermo, con las manos en los bolsillos, saca un globo rojo desinflado y lo mira →
 * se lo lleva a la boca y lo hincha en cuatro soplidos, cogiendo aire entre medias. En el globo
 * pone «Alcohol Tester» (blanco con sombra negra) y una lectura en g/L que sube con cada
 * soplido y pasa de verde a rojo; el texto crece con el globo y se curva con su forma. La cara
 * se le va poniendo roja del esfuerzo → el globo le explota en la cara → se queda pasmado con
 * trozos de goma pegados y mira a cámara enfadado → negro.
 *
 * El único texto es el impreso en el globo (lo pide el guion). Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 560, CX = 512;
  const DUR = 12.45;
  const T = {
    saca0: 0.75, saca1: 1.5, boca0: 1.75, boca1: 2.15,
    soplos: [[2.2, 2.85], [3.35, 4.1], [4.65, 5.5], [6.1, 7.15]],
    explota: 7.15, mira0: 8.05, puno0: 8.35, fin: 11.4
  };
  const RADIOS = [[6, 30], [29, 53], [51, 80], [78, 124]];       // radio del globo (px) en cada soplido
  const LECTURAS = [[0, 0.4], [0.4, 0.9], [0.9, 1.5], [1.5, 2.5]];  // g/L en cada soplido

  /* ---------- globo: tamaño y lectura ---------- */
  function soplo(t) {          // índice del soplido en curso o el último terminado y su avance
    let i = -1, u = 0;
    for (let k = 0; k < 4; k++) if (t >= T.soplos[k][0]) { i = k; u = fase(t, T.soplos[k][0], T.soplos[k][1]); }
    return { i, u };
  }
  // Avance de un soplido: a empujones (cada empujón infla un poco más)
  const empujones = u => clamp(suave(u) - 0.035 * Math.sin(u * Math.PI * 6) * Math.sin(u * Math.PI));
  function radio(t) {
    const { i, u } = soplo(t);
    if (i < 0) return 6;
    const [r0, r1] = RADIOS[i];
    let r = lerp(r0, r1, empujones(u));
    if (u >= 1 && i < 3) {   // al coger aire pierde un poco
      const sig = T.soplos[i + 1][0], v = fase(t, T.soplos[i][1], sig);
      r = lerp(r1, RADIOS[i + 1][0], suave(v));
    }
    return r;
  }
  function lectura(t) {
    const { i, u } = soplo(t);
    if (i < 0) return 0;
    const [a, b] = LECTURAS[i];
    return lerp(a, b, suave(u));
  }
  function colorLectura(v) {
    const pts = [[0, [46, 204, 64]], [0.9, [255, 212, 0]], [1.6, [255, 128, 0]], [2.2, [255, 32, 32]]];
    let k = 0; while (k < pts.length - 2 && v > pts[k + 1][0]) k++;
    const [a, ca] = pts[k], [b, cb] = pts[k + 1], f = clamp((v - a) / (b - a));
    return `rgb(${ca.map((c, j) => Math.round(lerp(c, cb[j], f))).join(",")})`;
  }
  const soplando = t => { const { i, u } = soplo(t); return i >= 0 && u > 0 && u < 1 ? 1 : 0; };
  // 1 mientras sopla, 0 mientras coge aire (con transiciones suaves)
  function intensidadSoplo(t) {
    let s = 0;
    for (const [a, b] of T.soplos) s = Math.max(s, tramo(t, a - 0.12, a) * (1 - tramo(t, b, b + 0.12)));
    return t < T.explota ? s : 0;
  }

  /* ---------- expresiones ---------- */
  const BASE = { mx: -0.7, my: -0.4, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    inicio: E({}),
    mira: E({ mx: -0.15, my: 0.85, sd: 6, gd: 0.08, si: 6, gi: 0.08, orig: 0, sonr: 0.5, ancho: 0.95 }),
    listo: E({ mx: 0.7, my: 0.1, sd: 8, gd: 0.1, si: 8, gi: 0.1, orig: 0, abre: 8, ancho: 0.45, sonr: 0, dientes: 0 }),
    sopla: E({ mx: 0.7, my: 0.1, c: 0.9, z: 0.55, sd: 12, gd: 0.16, si: 12, gi: 0.16, orig: 0, abre: 7, ancho: 0.42, sonr: 0, dientes: 0, mof: 1 }),
    respira: E({ mx: 0.75, my: 0.15, c: 0.05, sd: 16, gd: 0.2, si: 16, gi: 0.2, orig: 0, abre: 30, ancho: 0.72, sonr: -0.1, lengua: 0.3 }),
    susto: E({ mx: 0, my: 0, iris: 0.16, sd: 26, gd: 0.22, si: 26, gi: 0.22, orig: 0, abre: 40, ancho: 0.62, sonr: -0.2, lengua: 0.4 }),
    enfado: E({ mx: -0.85, my: -0.3, c: 0.3, iris: 0.9, sd: -14, gd: -0.32, si: -14, gi: -0.32, orig: 0, abre: 13, ancho: 1.15, sonr: -0.62, lengua: 0 })
  };
  const GUION_CARA = [[T.saca0 + 0.2, T.saca1, "mira"], [T.boca0, T.boca1, "listo"]];
  T.soplos.forEach(([a, b], k) => {
    GUION_CARA.push([a - 0.05, a + 0.15, "sopla"]);
    if (k < 3) GUION_CARA.push([b - 0.05, b + 0.15, "respira"]);
  });
  GUION_CARA.push([T.explota, T.explota + 0.06, "susto"], [T.mira0, T.mira0 + 0.35, "enfado"]);
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function expresion(t) {
    let e = CARAS.inicio;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const tb of [0.55, 7.75, 7.95, 9.9, 10.9]) { const k = fase(t, tb, tb + 0.14); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * G.JK;
  // centro del puño para que la muñeca quede en un punto (manos dentro del bolsillo)
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLSILLO_L = punoDesde({ x: 372, y: 648 }, 0, -1.75);

  function poseBase(t) {
    const respira = Math.sin(t * 2.2);
    const sop = intensidadSoplo(t);
    const coge = (() => { let c = 0; for (let k = 0; k < 3; k++) c = Math.max(c, campana(t, T.soplos[k][1], T.soplos[k + 1][0])); return c; })();
    const p = {
      x: CX, suelo: SUELO, s: S, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + respira * 1.2 },
      torso: -0.03 * coge + 0.025 * sop, torsoEsc: { x: 1, y: 1 + 0.035 * coge - 0.02 * sop + respira * 0.003 },
      piernas: { cerca: { tob: { x: 188, y: G.SUELO - G.TOBILLO_ALTO }, ang: 0 }, lejos: { tob: { x: 308, y: G.SUELO - G.TOBILLO_ALTO - 12 }, ang: 0 } },
      cabeza: { ang: -0.05 * coge + 0.04 * sop, dx: 0, dy: 0, esc: { x: 1 + 0.02 * sop, y: 1 } }, cara: null
    };
    // esfuerzo: tiembla un poco mientras sopla, más en el último
    const { i: si } = soplo(t);
    const esf = sop * (0.4 + 0.2 * Math.max(0, si));
    p.cabeza.ang += ruido(t * 26) * 0.012 * esf;
    // explosión: cabeza hacia atrás y pasmo
    const ex = t >= T.explota ? Math.exp(-(t - T.explota) * 5) * suave(fase(t, T.explota, T.explota + 0.04)) : 0;
    p.cabeza.ang -= 0.26 * ex; p.torso -= 0.06 * ex; p.cabeza.dy -= 10 * ex;
    // enfado final: tiembla de rabia
    const rabia = tramo(t, T.mira0 + 0.2, T.mira0 + 0.6) * (1 - tramo(t, T.fin, T.fin + 0.5));
    p.cabeza.ang += ruido(t * 34) * 0.012 * rabia; p.pelvis.x += ruido(t * 30 + 4) * 1.5 * rabia;
    // cara
    const e = expresion(t);
    e.c = Math.max(e.c, parpadeos(t));
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, ojos: { d: e.c, i: e.c, feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof * (t < T.explota ? 1 : 0), rubor: 0, bigote: 0 };
    // rojo del esfuerzo: sube con cada soplido; con el enfado, a tope
    let rojo = 0;
    T.soplos.forEach(([a, b], k) => { rojo += [0.18, 0.22, 0.26, 0.34][k] * tramo(t, a, b); });
    rojo -= 0.04 * coge;
    rojo = Math.max(rojo * (1 - 0.5 * tramo(t, T.explota, T.explota + 0.6)), tramo(t, T.mira0 + 0.1, T.mira0 + 0.5));
    p.rojo = clamp(rojo);
    p.cara.rubor = clamp(rojo * 1.1);
    p.sudor = tramo(t, T.soplos[2][0], T.soplos[3][0]) * (1 - tramo(t, T.mira0, T.mira0 + 0.4) * 0.6);
    p.enfado = t > T.mira0 + 0.25 ? clamp(salida(fase(t, T.mira0 + 0.25, T.mira0 + 0.45)) * (1 + 0.2 * Math.sin(fase(t, T.mira0 + 0.25, T.mira0 + 0.7) * Math.PI))) : 0;
    p.pegotes = t >= T.explota ? salida(fase(t, T.explota, T.explota + 0.12)) : 0;

    // ---- manos ----
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const labios = G.boca(p);
    const enBoca = { x: labios.x + 34, y: labios.y + 10 };
    const pinza = { x: labios.x + 52, y: labios.y + 16 };
    const mira = { x: hc.x + 140, y: hc.y + 20 };
    // mano cercana: bolsillo → delante de la cara (mira el globo) → boca → (explota) → baja
    let c = { ...BOLSILLO_C }, cAng = 0, cMu = -1.75, cPuno = 0;
    const k1 = tramo(t, T.saca0, T.saca1, suave5);
    c = mezcla(c, mira, k1); cAng = lerp(0, -0.25, k1); cMu = lerp(-1.75, -3.3, k1); cPuno = clamp(k1 * 4);
    const k2 = tramo(t, T.boca0, T.boca1, suave5);
    const enLaBoca = mezcla(enBoca, pinza, clamp(1 - intensidadSoplo(t) * 1.2) * tramo(t, T.soplos[0][0], T.soplos[0][0] + 0.2));
    c = mezcla(c, enLaBoca, k2); cAng = lerp(cAng, -0.35, k2); cMu = lerp(cMu, -3.6, k2);
    const k3 = tramo(t, T.mira0 - 0.25, T.mira0 + 0.35, suave5);
    const abajo = { x: hc.x + 34, y: hc.y + 252 };
    c = mezcla(c, abajo, k3); cAng = lerp(cAng, 0.3, k3); cMu = lerp(cMu, -1.6, k3);
    if (t >= T.explota) { const sac = Math.exp(-(t - T.explota) * 6) * suave(fase(t, T.explota, T.explota + 0.04)); c.x += 30 * sac; c.y -= 16 * sac; }
    p.manoCerca = { x: c.x, y: c.y, ang: cAng, mu: cMu, dobla: -1, puno: cPuno };
    // mano lejana: en el bolsillo; al final sale y amenaza con el puño
    const k4 = tramo(t, T.puno0, T.puno0 + 0.45, suave5);
    const amenaza = { x: hl.x + 96 + Math.sin(t * 19) * 7 * k4, y: hl.y + 40 + Math.sin(t * 23) * 6 * k4 };
    const l = mezcla(BOLSILLO_L, amenaza, k4);
    p.manoLejos = { x: l.x, y: l.y, ang: lerp(0, -1.2, k4), mu: lerp(-1.75, -1.2, k4), dobla: -1, puno: clamp(k4 * 4) };

    // ---- globo: se dibuja con la mano cercana (entre la cara y el puño) ----
    p.globo = { r: radio(t), lectura: lectura(t), soplo: soplo(t), enBoca: k2 * (1 - k3), sop: intensidadSoplo(t) };
    return p;
  }
  function pose(t) { return poseBase(t); }

  /* ---------- dibujo del globo (en coordenadas de pantalla) ---------- */
  const FUENTE = "'DejaVu Sans', 'Arial Black', Arial, sans-serif";
  function textoEnGlobo(g, txt, cx, cy, R, lat, tam, relleno, alfa, pesado) {
    g.font = `${pesado ? "900" : "bold"} ${tam}px ${FUENTE}`;
    const anchos = [...txt].map(ch => g.measureText(ch).width), total = anchos.reduce((a, b) => a + b, 0);
    const tau = 0.2, cl = Math.cos(lat);
    let s = -total / 2;
    g.textAlign = "center"; g.textBaseline = "middle";
    [...txt].forEach((ch, i) => {
      const w = anchos[i], sc = s + w / 2; s += w;
      const th = sc / (R * cl);
      if (Math.abs(th) > 1.3) return;
      const X = R * cl * Math.sin(th), Y = R * Math.sin(lat), Z = R * cl * Math.cos(th);
      const x = cx + X, y = cy + Y * Math.cos(tau) + Z * Math.sin(tau) - R * Math.sin(tau);
      const pend = Math.atan2(-Math.sin(th) * Math.sin(tau), Math.cos(th));
      g.save(); g.translate(x, y); g.rotate(-pend); g.scale(Math.max(0.15, Math.cos(th)), 1);
      g.globalAlpha = alfa * clamp(Math.cos(th) * 1.6);
      g.lineJoin = "round"; g.lineWidth = Math.max(1, tam * 0.16); g.strokeStyle = "rgba(0,0,0,0.85)";
      g.fillStyle = "#000"; g.fillText(ch, tam * 0.07, tam * 0.08);          // sombra negra
      g.strokeText(ch, 0, 0); g.fillStyle = relleno; g.fillText(ch, 0, 0);
      g.restore();
    });
  }
  function medidor(g, cx, cy, R, lat, v, alfa) {
    const n = 10, llenos = v / 2.5 * n, tau = 0.2, cl = Math.cos(lat), ancho = R * 1.15, alto = R * 0.11;
    for (let i = 0; i < n; i++) {
      const sc = -ancho / 2 + (i + 0.5) * ancho / n, th = sc / (R * cl);
      const X = R * cl * Math.sin(th), Y = R * Math.sin(lat), Z = R * cl * Math.cos(th);
      const x = cx + X, y = cy + Y * Math.cos(tau) + Z * Math.sin(tau) - R * Math.sin(tau);
      const w = ancho / n * 0.78 * Math.cos(th), f = clamp(llenos - i);
      g.save(); g.globalAlpha = alfa;
      g.fillStyle = "rgba(0,0,0,0.75)"; g.fillRect(x - w / 2 + alto * 0.12, y - alto / 2 + alto * 0.14, w, alto);
      g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(x - w / 2, y - alto / 2, w, alto);
      if (f > 0) { const pad = Math.min(1, w * 0.2, alto * 0.2); g.fillStyle = colorLectura(i / n * 2.5 + 0.2); g.fillRect(x - w / 2 + pad, y - alto / 2 + pad, (w - 2 * pad) * f, alto - 2 * pad); }
      g.restore();
    }
  }
  // Boquilla ligada a la pinza: toca el labio al soplar y se aparta al coger aire.
  function geometriaGlobo(t, p = pose(t)) {
    const gl = p.globo, mano = G.aPantalla(p, p.manoCerca);
    const aparece = clamp((t - T.saca0 - 0.12) / 0.25);
    const R = gl.r * (0.4 + 0.6 * aparece), inflado = clamp((gl.r - 8) / 14);
    // eje del globo: colgando (desinflado) → hacia la derecha y un poco arriba (inflado)
    const angColgado = 1.25 + 0.1 * Math.sin(t * 2.4), angInflado = -0.24 - 0.06 * clamp((R - 30) / 90);
    const phi = lerp(angColgado, angInflado, suave(inflado));
    const pinza = G.rotP({ x: -34 * p.s, y: -10 * p.s }, p.manoCerca.ang + 0.35);
    const base = { x: mano.x + pinza.x, y: mano.y + pinza.y };
    const dir = { x: Math.cos(phi), y: Math.sin(phi) };
    // bamboleo tras cada soplido y temblor antes de reventar
    const { i: si, u: su } = gl.soplo;
    let rebote = 0;
    if (si >= 0) { const v = t - T.soplos[si][1]; if (v > 0) rebote = 0.07 * Math.exp(-v * 5) * Math.sin(v * 22); }
    const tiembla = si === 3 ? Math.pow(su, 3) : 0;
    const estira = 1 + rebote + 0.02 * gl.sop * Math.sin(t * 30) + tiembla * 0.03 * Math.sin(t * 61);
    const rx = R * (1 / Math.sqrt(estira)) * (1 + tiembla * 0.02 * ruido(t * 50)), ry = R * 1.12 * estira;
    const cuello = 10 + 8 * inflado;
    const c = { x: base.x + dir.x * (cuello + ry), y: base.y + dir.y * (cuello + ry) };
    return { R, inflado, phi, base, dir, rx, ry, cuello, c };
  }
  function globo(g, t, p) {
    const gl = p.globo; if (!gl || t < T.saca0 + 0.12) return;
    if (t >= T.explota) {           // queda la boquilla rota en la mano
      const suelta = T.mira0 - 0.2, cae = tramo(t, suelta + 0.3, suelta + 0.8);
      const origen = t < suelta ? p : pose(suelta), m = G.aPantalla(origen, origen.manoCerca), u = Math.max(0, t - suelta);
      if (cae < 1) {
        g.save(); g.translate(m.x + 6 + 16 * u, m.y + 4 + 400 * u * u); g.rotate(0.8 + 4 * u); g.globalAlpha = 1 - cae;
        g.fillStyle = "#c81822"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(-3, -4); g.lineTo(4, -5); g.lineTo(9, 2); g.lineTo(5, 7); g.lineTo(0, 4); g.lineTo(-4, 8); g.closePath(); g.fill(); g.stroke();
        g.restore();
      }
      return;
    }
    const { R, inflado, phi, base, dir, rx, ry, cuello, c } = geometriaGlobo(t, p);
    g.save();
    // cuello del globo desde los labios / la mano
    g.lineCap = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 7.5;
    const pc = { x: base.x + dir.x * cuello, y: base.y + dir.y * cuello };
    const ini = base;
    g.beginPath(); g.moveTo(ini.x, ini.y); g.lineTo(pc.x, pc.y); g.stroke();
    g.strokeStyle = "#c51a24"; g.lineWidth = 5; g.stroke();
    // cuerpo: gota de goma
    g.translate(c.x, c.y); g.rotate(phi);
    const N = 44, pts = [];
    for (let k = 0; k < N; k++) {
      const a = k / N * Math.PI * 2, cs = Math.cos(a);
      const pin = 1 - 0.62 * Math.pow(Math.max(0, -cs), 2.6);
      pts.push({ x: ry * cs - 2 * Math.max(0, -cs), y: rx * Math.sin(a) * pin });
    }
    const forma = () => { g.beginPath(); M2.curva(g, pts, true, 0.5); };
    const claro = clamp((R - 40) / 90);           // la goma se aclara al estirarse
    const gr = g.createRadialGradient(-ry * 0.1, -rx * 0.45, R * 0.1, 0, 0, Math.max(rx, ry) * 1.05);
    gr.addColorStop(0, `rgb(255,${Math.round(lerp(110, 150, claro))},${Math.round(lerp(110, 140, claro))})`);
    gr.addColorStop(0.45, `rgb(${Math.round(lerp(226, 240, claro))},${Math.round(lerp(26, 52, claro))},${Math.round(lerp(36, 60, claro))})`);
    gr.addColorStop(1, `rgb(${Math.round(lerp(132, 170, claro))},${Math.round(lerp(10, 20, claro))},18)`);
    forma(); g.fillStyle = gr; g.fill();
    if (inflado < 0.8) {           // arrugas del globo desinflado
      g.save(); forma(); g.clip(); g.strokeStyle = `rgba(90,0,8,${0.8 * (1 - inflado)})`; g.lineWidth = 1.4;
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-ry * 0.6, k * rx * 0.3); g.quadraticCurveTo(0, k * rx * 0.55 + 2, ry * 0.7, k * rx * 0.2); g.stroke(); }
      g.restore();
    }
    // brillo
    g.save(); forma(); g.clip();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(ry * 0.1, -rx * 0.55, ry * 0.32, rx * 0.12, -0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(ry * 0.55, -rx * 0.3, ry * 0.08, rx * 0.05, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
    forma(); g.lineWidth = 2.2; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.restore();
    // texto impreso: crece con el globo y se curva con su forma (siempre derecho, mirando a cámara)
    const alfaT = clamp((R - 15) / 10);
    if (alfaT > 0.01) {
      const tc = { x: c.x + dir.x * ry * 0.05, y: c.y + dir.y * ry * 0.05 }, Rt = Math.min(rx, ry) * 0.98;
      const v = gl.lectura;
      textoEnGlobo(g, "Alcohol Tester", tc.x, tc.y, Rt, -0.34, Rt * 0.215, "#ffffff", alfaT, true);
      const num = v.toFixed(1).replace(".", ",") + " g/L";
      textoEnGlobo(g, num, tc.x, tc.y, Rt, 0.07, Rt * 0.27, colorLectura(v), alfaT, true);
      medidor(g, tc.x, tc.y, Rt, 0.44, v, alfaT);
    }
  }

  /* ---------- explosión ---------- */
  function estallido(g, t) {
    const u = t - T.explota; if (u < 0 || u > 1.6) return;
    // Límite izquierdo del estallido: no depende de un fotograma dibujado antes.
    const geo = geometriaGlobo(T.explota - 1e-7);
    const { c } = geo, R = Math.max(geo.rx, geo.ry);
    // destello en estrella
    const k = fase(u, 0, 0.28);
    if (k < 1) {
      g.save(); g.translate(c.x, c.y); g.rotate(0.3);
      const rr = R * (0.6 + 0.9 * salida(k));
      g.globalAlpha = 1 - k;
      for (const [esc, col] of [[1, "#ffd23a"], [0.66, "#fff7d0"]]) {
        g.fillStyle = col; g.beginPath();
        for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = (i % 2 ? 0.45 : 1) * rr * esc * (0.85 + 0.3 * hash(i + 300)); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        g.closePath(); g.fill();
      }
      g.restore();
      g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 6 * (1 - k) + 1;
      g.beginPath(); g.arc(c.x, c.y, R * (0.8 + 1.6 * salida(k)), 0, Math.PI * 2); g.stroke(); g.restore();
    }
    // trozos de goma
    g.save(); g.lineJoin = "round";
    for (let i = 0; i < 18; i++) {
      const a = hash(i + 320) * Math.PI * 2, v = 280 + hash(i + 321) * 520, dr = Math.exp(-u * 1.6);
      const d = v * (1 - dr) / 1.6;
      const x = c.x + Math.cos(a) * (R * 0.8 + d), y = c.y + Math.sin(a) * (R * 0.8 + d) + 380 * u * u;
      if (y > SUELO + 20) continue;
      const sz = 6 + hash(i + 322) * 10;
      g.save(); g.translate(x, y); g.rotate(a + u * (hash(i + 323) - 0.5) * 16); g.globalAlpha = clamp(1.6 - u);
      g.fillStyle = "#d81f2a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-sz, 0); g.quadraticCurveTo(-sz * 0.2, -sz * 0.8, sz * 0.8, -sz * 0.3); g.lineTo(sz * 0.4, sz * 0.5); g.quadraticCurveTo(-sz * 0.3, sz * 0.2, -sz, 0); g.closePath(); g.fill(); g.stroke();
      g.restore();
    }
    g.restore();
    // humillo
    g.save();
    for (let i = 0; i < 7; i++) {
      const kk = fase(u, 0.05 + i * 0.03, 1.2 + i * 0.05); if (kk <= 0 || kk >= 1) continue;
      g.globalAlpha = 0.45 * (1 - kk); g.fillStyle = "#e9e2da";
      const a = hash(i + 340) * Math.PI * 2;
      g.beginPath(); g.arc(c.x - R * 0.4 + Math.cos(a) * 40 * kk, c.y + Math.sin(a) * 30 * kk - 50 * kk, 12 + 26 * kk, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function vapor(g, t, p) {        // humo de enfado saliendo de la cabeza
    const k = tramo(t, T.mira0 + 0.3, T.mira0 + 0.7) * (1 - tramo(t, T.fin - 0.2, T.fin + 0.4));
    if (k <= 0.01) return;
    const cab = G.aPantalla(p, G.cabeza(p).a({ x: 700, y: 240 }));
    g.save();
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.9 + i / 6) % 1, lado = i % 2 ? 1 : -1;
      const x = cab.x + lado * (40 + 30 * ph) + Math.sin(t * 3 + i) * 6, y = cab.y - 10 - ph * 90;
      g.globalAlpha = k * Math.sin(Math.PI * ph) * 0.85; g.fillStyle = "#f4f1ec"; g.strokeStyle = "rgba(60,60,70,0.6)"; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x, y, 8 + 16 * ph, 0, Math.PI * 2); g.arc(x + 10 + 8 * ph, y + 4, 6 + 10 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ---------- decorado ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 60; const g = c.getContext("2d");
    g.fillStyle = "#0c2529"; g.fillRect(0, 0, c.width, c.height); g.translate(40, 30);
    const pared = g.createLinearGradient(0, 0, 0, 440); pared.addColorStop(0, "#0c2529"); pared.addColorStop(1, "#1d5257");
    g.fillStyle = pared; g.fillRect(-40, -30, W + 80, 470);
    g.strokeStyle = "rgba(255,255,255,0.045)"; g.lineWidth = 1;
    for (let y = 18; y < 440; y += 26) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); const off = (y / 26) % 2 ? 0 : 26;
      for (let x = off - 52; x < W + 40; x += 52) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); } }
    const foco = g.createRadialGradient(CX, 300, 20, CX, 300, 460);
    foco.addColorStop(0, "rgba(140,214,200,0.55)"); foco.addColorStop(0.5, "rgba(80,160,155,0.22)"); foco.addColorStop(1, "rgba(40,110,110,0)");
    g.fillStyle = foco; g.fillRect(-40, -30, W + 80, 470);
    for (const lx of [210, 814]) {
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, -30); g.lineTo(lx, 46); g.stroke();
      const halo = g.createRadialGradient(lx, 66, 4, lx, 66, 150); halo.addColorStop(0, "rgba(255,206,120,0.55)"); halo.addColorStop(1, "rgba(255,190,100,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 66, 150, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#151417"; g.beginPath(); g.moveTo(lx - 34, 72); g.quadraticCurveTo(lx, 30, lx + 34, 72); g.closePath(); g.fill();
      g.fillStyle = "#ffe2a6"; g.beginPath(); g.ellipse(lx, 72, 26, 7, 0, 0, Math.PI * 2); g.fill();
    }
    const mad = g.createLinearGradient(0, 440, 0, SUELO); mad.addColorStop(0, "#4a2b1b"); mad.addColorStop(1, "#2e1a10");
    g.fillStyle = mad; g.fillRect(-40, 440, W + 80, SUELO - 440);
    g.fillStyle = "#7b4a2b"; g.fillRect(-40, 432, W + 80, 12); g.fillStyle = "#9a6038"; g.fillRect(-40, 432, W + 80, 3);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, 444, W + 80, 5);
    g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 2;
    for (let x = -14; x < W + 40; x += 74) { g.beginPath(); g.moveTo(x, 449); g.lineTo(x, SUELO); g.stroke(); }
    const su = g.createLinearGradient(0, SUELO, 0, H); su.addColorStop(0, "#5a3520"); su.addColorStop(1, "#2a160c");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 30 - SUELO);
    g.fillStyle = "rgba(255,210,150,0.18)"; g.fillRect(-40, SUELO, W + 80, 2);
    const v = g.createRadialGradient(CX, 300, 300, CX, 300, 680); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-40, -30, W + 80, H + 60);
    return c;
  }

  /* ---------- cámara ---------- */
  let FOCO_CARA = null;
  function camara(t) {
    if (!FOCO_CARA) { const p = poseBase(10); FOCO_CARA = G.aPantalla(p, G.centroCabeza(p)); }
    const sopla = tramo(t, T.boca0, T.soplos[3][1], suave) * (1 - tramo(t, T.explota + 0.2, T.mira0, suave));
    const cerca = tramo(t, T.mira0 + 0.1, T.fin - 0.4, suave);
    const golpe = t >= T.explota ? Math.exp(-(t - T.explota) * 4) * suave(fase(t, T.explota, T.explota + 0.05)) : 0;
    // Plano amplio durante el inflado: el globo completo y los pies caben juntos.
    const k = 1 + 0.45 * cerca + 0.04 * golpe;
    return { k, x: lerp(lerp(CX, 560, sopla), FOCO_CARA.x, cerca), y: lerp(SUELO - (SUELO - H / 2) / k, FOCO_CARA.y + 20, cerca) };
  }

  function temblor(t) {
    const golpe = t >= T.explota ? 9 * Math.exp(-(t - T.explota) * 5) * tramo(t, T.explota, T.explota + 0.035) : 0;
    const previo = 1.2 * tramo(t, T.soplos[3][0] + 0.6, T.explota) * (1 - tramo(t, T.explota, T.explota + 0.035));
    return golpe + previo;
  }

  class GuillermoGlobo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      const p = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = temblor(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -30);
      g.save(); g.fillStyle = "rgba(0,0,0,0.38)"; g.beginPath(); g.ellipse(CX, SUELO + 1, 120, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // el globo va entre la cara y el puño: se dibuja desde la mano cercana
      const marco = g.getTransform();
      p.manoCerca.objeto = (gg) => { gg.save(); gg.setTransform(marco); globo(gg, t, p); gg.restore(); };
      G.dibujar(g, p, t);
      estallido(g, t);
      vapor(g, t, p);
      g.restore();
      const fl = t >= T.explota ? Math.exp(-(t - T.explota) * 12) * suave(fase(t, T.explota, T.explota + 0.03)) : 0;
      if (fl > 0.01) { g.fillStyle = `rgba(255,248,230,${0.55 * fl})`; g.fillRect(0, 0, W, H); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00003.2", nombre: "Guillermo y el globo", crear: () => new GuillermoGlobo() });
  window.__A2D_00003_2 = { pose, T, DUR, radio, lectura, geometriaGlobo, dibujarGlobo: globo, camara, temblor, colorLectura };
})();
