"use strict";
/* 00002 · Guillermo se transforma
 *
 * Negro → Guillermo, con la mano en el bolsillo, se bebe una copa de un trago → le da una
 * sacudida → saca el puño y lo mira → abre las piernas, se agacha, aprieta los puños y la copa
 * vacía se agrieta en su mano: la energía empieza poco a poco (chispas, piedrecitas que suben,
 * el suelo que se raja, destellos dorados en el pelo) → grita y ESTALLA: destello, onda
 * expansiva, la copa revienta, la camiseta se rompe y deja ver un torso muy musculado, pelo
 * rubio en punta y ojos azules, aura dorada con rayos → mira arriba, se agacha y sale volando
 * hacia arriba hasta salir de la escena → negro. Sin títulos ni textos.
 *
 * Todo se calcula a partir del tiempo absoluto (fluido a cualquier fps, sin saltos).
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 560, CX = 512;
  const DUR = 12.45;
  const T = {
    mira0: 0.45, sube0: 1.3, sube1: 1.8, bebe1: 2.7, baja1: 3.2,
    sacude: 3.55, mano0: 3.8, mano1: 4.3, abre0: 4.35, abre1: 4.8,
    carga0: 4.6, grito0: 6.15, estalla: 6.88, calma: 7.7, arriba0: 8.55, agacha0: 9.0, despega: 9.32, fuera: 9.75
  };

  /* ---------- curvas de la transformación ---------- */
  // Energía del aura: chispazo en la sacudida, subida poco a poco durante la carga, estallido.
  function energia(t) {
    let e = 0.18 * campana(t, T.sacude - 0.02, T.sacude + 0.3);
    e += 0.12 * campana(t, T.mano0, T.mano1 + 0.4);
    const c = fase(t, T.carga0, T.estalla);
    e += (0.08 + 0.55 * Math.pow(c, 1.6)) * tramo(t, T.carga0, T.carga0 + 0.4) * (t < T.estalla ? 1 : 0);
    if (t >= T.estalla) e = 1 + 0.55 * Math.exp(-(t - T.estalla) * 4) * suave(fase(t, T.estalla, T.estalla + 0.05)) + 0 * 0;
    if (t >= T.estalla && t < T.estalla + 0.05) e = lerp(0.63, 1.55, suave(fase(t, T.estalla, T.estalla + 0.05)));
    return e;
  }
  // Destellos dorados del pelo cada vez más seguidos antes de estallar.
  const DESTELLOS = [[3.58, 0.08], [4.95, 0.1], [5.45, 0.1], [5.82, 0.09], [6.12, 0.09], [6.36, 0.08], [6.54, 0.07], [6.68, 0.06], [6.79, 0.05]];
  function oro(t) {
    if (t >= T.estalla) return suave(fase(t, T.estalla, T.estalla + 0.06));
    let o = 0;
    for (const [t0, d] of DESTELLOS) o = Math.max(o, campana(t, t0, t0 + d));
    return o;
  }
  const musculo = t => 0.35 * tramo(t, T.carga0, T.estalla) + 0.65 * tramo(t, T.estalla, T.estalla + 0.12);
  const rasgado = t => 0.2 * tramo(t, T.carga0 + 1.0, T.estalla) + 0.8 * salida(fase(t, T.estalla, T.estalla + 0.12));
  const puas = t => t < T.estalla ? 0 : clamp(salida(fase(t, T.estalla, T.estalla + 0.18)) * (1 + 0.12 * Math.sin(fase(t, T.estalla, T.estalla + 0.5) * Math.PI)));
  const grietas = t => tramo(t, T.carga0 + 0.5, T.estalla);

  /* ---------- pies ---------- */
  const PIES = { cerca: { a: 250 - 62, b: 250 - 118 }, lejos: { a: 250 + 58, b: 250 + 116 } };
  const PASO_PIE = { cerca: [T.abre0, T.abre0 + 0.24], lejos: [T.abre0 + 0.16, T.abre0 + 0.42] };
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function pieSuelo(lado, t) {
    const [t0, t1] = PASO_PIE[lado], u = fase(t, t0, t1);
    return { x: lerp(PIES[lado].a, PIES[lado].b, suave5(u)), y: TOB_Y[lado] - 46 * Math.sin(Math.PI * u), ang: -0.18 * Math.sin(Math.PI * u) };
  }

  /* ---------- expresiones (números que se mezclan, como en la 00001) ---------- */
  const BASE = { mx: 0.75, my: 0.6, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    copa: E({}),
    antojo: E({ mx: 0.8, my: 0.55, sd: 8, gd: 0.1, si: 8, gi: 0.1, orig: 0, sonr: 0.55, ancho: 0.95 }),
    bebe: E({ mx: 0.6, my: 0.2, c: 1, sd: 14, gd: 0.18, si: 14, gi: 0.18, orig: 0, abre: 8, ancho: 0.45, sonr: 0, dientes: 0 }),
    aah: E({ mx: 0.6, my: 0.2, c: 1, h: 1, sd: 12, gd: 0.18, si: 12, gi: 0.18, orig: 0, abre: 30, ancho: 1.05, sonr: 0.4, lengua: 1 }),
    sorpresa: E({ mx: -0.15, my: -0.1, iris: 0.55, sd: 24, gd: 0.18, si: 24, gi: 0.18, orig: 0, abre: 20, ancho: 0.6, sonr: -0.25, lengua: 0.6 }),
    mano: E({ mx: -0.55, my: 0.85, iris: 0.8, sd: 2, gd: -0.05, si: 2, gi: -0.05, orig: 0, abre: 0, ancho: 0.8, sonr: -0.1 }),
    aprieta: E({ mx: -0.4, my: 0.4, c: 0.3, iris: 0.8, sd: -9, gd: -0.2, si: -9, gi: -0.2, orig: 0, abre: 11, ancho: 1.15, sonr: -0.55, lengua: 0 }),
    grito: E({ mx: 0, my: -0.5, c: 1, z: 1, sd: -12, gd: -0.22, si: -12, gi: -0.22, orig: 0, abre: 118, ancho: 1.45, sonr: -0.15, lengua: 0.6 }),
    poder: E({ mx: -0.75, my: -0.25, c: 0.12, iris: 0.92, sd: -8, gd: -0.2, si: -8, gi: -0.2, orig: 0, abre: 0, ancho: 0.9, sonr: 0.15 }),
    arriba: E({ mx: 0.35, my: -1, c: 0, sd: -5, gd: -0.15, si: -5, gi: -0.15, orig: 0, abre: 0, ancho: 0.85, sonr: 0.2 }),
    despega: E({ mx: 0.35, my: -1, c: 0.25, sd: -10, gd: -0.22, si: -10, gi: -0.22, orig: 0, abre: 24, ancho: 1.1, sonr: -0.4, lengua: 0 })
  };
  const GUION_CARA = [
    [T.mira0, T.mira0 + 0.35, "antojo"], [T.sube1 - 0.15, T.sube1 + 0.1, "bebe"], [T.bebe1 - 0.02, T.bebe1 + 0.2, "aah"],
    [T.sacude, T.sacude + 0.07, "sorpresa"], [T.mano0 + 0.1, T.mano0 + 0.4, "mano"], [T.carga0, T.carga0 + 0.3, "aprieta"],
    [T.grito0, T.grito0 + 0.35, "grito"], [T.calma - 0.25, T.calma + 0.25, "poder"], [T.arriba0, T.arriba0 + 0.3, "arriba"],
    [T.agacha0 + 0.1, T.despega, "despega"]
  ];
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function expresion(t) {
    let e = CARAS.copa;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  const aCara = e => ({ mirada: { x: e.mx, y: e.my }, iris: e.iris, ojos: { d: e.c, i: e.c, feliz: e.h, apretado: e.z },
    cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
    boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
    mofletes: 0, rubor: 0, bigote: 0 });

  /* ---------- cuerpo: posturas que se mezclan ---------- */
  // Manos respecto a su hombro (hoja): x, y, giro del puño, giro de la muñeca, tamaño del puño.
  const CUERPOS = {
    copa:    { pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 150, ly: 120, la: 0, lmu: -3.57, gro: 1 },
    baja:    { pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 24, ly: 318, la: 0, lmu: -1.75, gro: 1 },
    sacude:  { pel: -6, torso: -0.03, cab: -0.06, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 24, ly: 318, la: 0, lmu: -1.75, gro: 1 },
    mano:    { pel: 0, torso: 0.03, cab: 0.1, cx: 128, cy: 118, ca: -0.5, cmu: -3.3, cp: 1, lx: 24, ly: 318, la: 0, lmu: -1.75, gro: 1.02 },
    carga:   { pel: 74, torso: 0.06, cab: 0.14, cx: 38, cy: 248, ca: 0.3, cmu: -1.6, cp: 1, lx: 52, ly: 236, la: -0.35, lmu: -1.9, gro: 1.05 },
    grito:   { pel: 82, torso: -0.04, cab: -0.26, cx: 30, cy: 252, ca: 0.4, cmu: -1.55, cp: 1, lx: 60, ly: 240, la: -0.45, lmu: -1.95, gro: 1.08 },
    poder:   { pel: 40, torso: 0, cab: 0.02, cx: 36, cy: 250, ca: 0.3, cmu: -1.6, cp: 1, lx: 56, ly: 238, la: -0.4, lmu: -1.9, gro: 1.15 },
    arriba:  { pel: 46, torso: -0.03, cab: -0.16, cx: 36, cy: 250, ca: 0.3, cmu: -1.6, cp: 1, lx: 56, ly: 238, la: -0.4, lmu: -1.9, gro: 1.15 },
    agacha:  { pel: 120, torso: 0.1, cab: -0.1, cx: 20, cy: 238, ca: 0.4, cmu: -1.5, cp: 1, lx: 64, ly: 226, la: -0.5, lmu: -2.0, gro: 1.15 },
    vuela:   { pel: 0, torso: -0.02, cab: -0.12, cx: -4, cy: 292, ca: 0.1, cmu: -1.7, cp: 1, lx: 188, ly: -196, la: -2.25, lmu: -1.75, gro: 1.15 }
  };
  const GUION_CUERPO = [
    [T.bebe1, T.baja1, "baja"], [T.sacude, T.sacude + 0.09, "sacude"], [T.mano0, T.mano1, "mano"], [T.carga0, T.carga0 + 0.7, "carga"],
    [T.grito0, T.grito0 + 0.4, "grito"], [T.calma - 0.3, T.calma + 0.35, "poder"], [T.arriba0, T.arriba0 + 0.35, "arriba"],
    [T.agacha0, T.despega, "agacha"], [T.despega, T.despega + 0.16, "vuela"]
  ];
  function postura(t) {
    let c = CUERPOS.copa;
    for (const [t0, t1, nom] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }

  /* ---------- copa ---------- */
  const VOL0 = 0.72;
  const volumen = t => VOL0 * (1 - suave(fase(t, T.sube1 + 0.05, T.bebe1 - 0.05)));
  const rota = t => t >= T.estalla + 0.01;

  /* ---------- despegue ---------- */
  function subida(t) {                  // cuánto sube la pelvis (hoja) al despegar
    const u = Math.max(0, t - T.despega);
    return 21000 * u * u;
  }

  function poseBase(t) {
    const pc = pieSuelo("cerca", t), pl = pieSuelo("lejos", t);
    const b = postura(t);
    const respira = Math.sin(t * 2.3);
    const tiembla = (energia(t) > 0.05 && t < T.despega ? 1 : 0) * clamp(energia(t));
    const p = {
      x: CX, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x + ruido(t * 31) * 3 * tiembla, y: G.PELVIS.y + b.pel + respira * 1.2 - subida(t) },
      torso: b.torso, torsoEsc: { x: 1 + 0.1 * musculo(t), y: 1 + respira * 0.004 + 0.02 * musculo(t) },
      piernas: { cerca: { tob: { x: pc.x, y: pc.y }, ang: pc.ang }, lejos: { tob: { x: pl.x, y: pl.y }, ang: pl.ang } },
      cabeza: { ang: b.cab + ruido(t * 23 + 5) * 0.03 * tiembla, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: null, oro: oro(t), ojosAzules: oro(t), puas: puas(t), rasgado: rasgado(t), musculo: musculo(t), semillaRoto: 3
    };
    // sacudida: el cuerpo da un respingo
    const sac = campana(t, T.sacude, T.sacude + 0.22);
    p.pelvis.y -= 14 * sac; p.cabeza.dy = -8 * sac;
    // grito: el pecho se infla y la cabeza tiembla
    const gr = tramo(t, T.grito0, T.grito0 + 0.4) * (1 - tramo(t, T.calma - 0.3, T.calma + 0.2));
    p.torsoEsc.y += 0.03 * gr; p.cabeza.ang += ruido(t * 40) * 0.035 * gr;
    // estallido: golpe hacia atrás
    const golpe = t >= T.estalla ? Math.exp(-(t - T.estalla) * 6) * suave(fase(t, T.estalla, T.estalla + 0.05)) : 0;
    p.torso -= 0.08 * golpe; p.cabeza.ang -= 0.12 * golpe;
    // cara
    const e = expresion(t);
    p.cara = aCara(e);
    // manos: cercana (del bolsillo a puño) y lejana (copa → puño)
    const T_ = G.tronco(p), hc = T_(G.HOMBRO_C), hl = T_(G.HOMBRO);
    p.manoCerca = { x: hc.x + b.cx, y: hc.y + b.cy, ang: b.ca, mu: b.cmu, dobla: -1, puno: b.cp, grosor: b.gro };
    // el brazo lejano cambia el codo hacia fuera estando estirado (cuelga la copa vacía)
    const doblaL = t < T.carga0 + 0.1 ? -1 : 1;
    p.manoLejos = { x: hl.x + b.lx, y: hl.y + b.ly, ang: b.la, mu: b.lmu, dobla: doblaL, grosor: b.gro };
    // copa en la mano lejana; al beber, el borde va a los labios
    const vol = volumen(t);
    let angCopa = 0;
    if (t >= T.sube0 && t < T.baja1) {
      const ki = tramo(t, T.sube0, T.sube1, suave5), kb = tramo(t, T.bebe1, T.baja1, suave5);
      const fondo = 0.45 * tramo(t, T.bebe1 - 0.45, T.bebe1 - 0.05);
      const psiB = Math.max(-2.1, G.inclinacionCopa(Math.max(vol, 0.004)) - 0.06 - fondo);
      const psi = lerp(lerp(0, psiB, ki), 0, kb);
      const atras = clamp(-psi / 2, 0, 1);
      p.cabeza.ang += lerp(0, -0.1 - 0.3 * atras, ki * (1 - kb));
      p.torso -= 0.06 * atras * ki * (1 - kb);
      const m = G.boca(p), r = G.rotP({ x: G.COPA_BORDE.x * G.JK, y: G.COPA_BORDE.y * G.JK }, psi);
      const enBoca = { x: m.x - r.x + 3, y: m.y - r.y - 2 };
      const base = { x: hl.x + CUERPOS.copa.lx, y: hl.y + CUERPOS.copa.ly };
      const fin = { x: hl.x + CUERPOS.baja.lx, y: hl.y + CUERPOS.baja.ly };
      const arco = { x: (base.x + enBoca.x) / 2 + 50, y: Math.min(base.y, enBoca.y) - 10 };
      const sube = mezcla(mezcla(base, arco, ki), mezcla(arco, enBoca, ki), ki);
      const pos = kb > 0 ? mezcla(enBoca, fin, kb) : sube;
      p.manoLejos.x = pos.x; p.manoLejos.y = pos.y;
      p.manoLejos.mu = lerp(lerp(CUERPOS.copa.lmu, -4.43, ki), CUERPOS.baja.lmu, kb);
      angCopa = psi;
      p.manoLejos.ang = psi;
    }
    const chap = 0.08 * Math.sin(t * 5.2) * campana(t, T.mira0, T.sube0 + 0.2);
    if (!rota(t)) {
      const gri = grietas(t), tr = tiembla;
      p.manoLejos.objeto = (g, tt) => G.copa(g, { ang: p.manoLejos.ang + (tr > 0.3 ? ruido(tt * 60) * 0.02 : 0), vol, chapoteo: chap, grietas: gri }, tt);
    }
    // despegue: los pies se quedan en el suelo hasta que la pierna se estira; luego cuelgan con la punta abajo
    if (t > T.despega - 0.02) {
      const cad = { cerca: T_(G.CADERA.cerca), lejos: T_(G.CADERA.lejos) };
      for (const lado of ["cerca", "lejos"]) {
        const q = p.piernas[lado], h = cad[lado], L = 541 * 0.985;
        const dx = q.tob.x - h.x, dy = q.tob.y - h.y, d = Math.hypot(dx, dy);
        const colgar = { x: h.x + (lado === "cerca" ? 28 : -22), y: h.y + L };
        if (d > L) {
          const k = suave(fase(d, L, L + 260));
          const estirado = { x: h.x + dx / d * L, y: h.y + dy / d * L };
          q.tob = mezcla(estirado, colgar, k);
          q.ang = lerp(q.ang, 0.85, salida(clamp((d - L) / 120)));
        }
      }
    }
    return p;
  }

  // Inercia de la cabeza
  function pose(t) {
    const p = poseBase(t);
    return p;
  }

  /* ---------- decorado: el mismo bar, con lámparas que se balancean ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.fillStyle = "#0c2529"; g.fillRect(0, 0, c.width, c.height); g.translate(40, 60);
    const pared = g.createLinearGradient(0, 0, 0, 440); pared.addColorStop(0, "#0c2529"); pared.addColorStop(1, "#1d5257");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 500);
    g.strokeStyle = "rgba(255,255,255,0.045)"; g.lineWidth = 1;
    for (let y = 18; y < 440; y += 26) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); const off = (y / 26) % 2 ? 0 : 26;
      for (let x = off - 52; x < W + 40; x += 52) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); } }
    const foco = g.createRadialGradient(CX, 300, 20, CX, 300, 460);
    foco.addColorStop(0, "rgba(140,214,200,0.5)"); foco.addColorStop(0.5, "rgba(80,160,155,0.2)"); foco.addColorStop(1, "rgba(40,110,110,0)");
    g.fillStyle = foco; g.fillRect(-40, -30, W + 80, 470);
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
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function lamparas(g, t, luzOro) {
    // se balancean con el temblor de la carga, el estallido y el despegue
    const empuje = (tt) => 0.05 * tramo(tt, T.carga0, T.estalla) * Math.sin(tt * 7)
      + (tt > T.estalla ? 0.32 * Math.exp(-(tt - T.estalla) * 0.9) * Math.sin((tt - T.estalla) * 4.2) : 0)
      + (tt > T.despega ? 0.22 * Math.exp(-(tt - T.despega) * 1.1) * Math.sin((tt - T.despega) * 4.6 + 1) : 0);
    for (const [lx, fase0] of [[210, 0], [814, 1.3]]) {
      const a = empuje(t + fase0 * 0.02) * (lx < CX ? -1 : 1);
      g.save(); g.translate(lx, -60); g.rotate(a);
      const halo = g.createRadialGradient(0, 126, 4, 0, 126, 150); halo.addColorStop(0, "rgba(255,206,120,0.5)"); halo.addColorStop(1, "rgba(255,190,100,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(0, 126, 150, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 106); g.stroke();
      g.fillStyle = "#151417"; g.beginPath(); g.moveTo(-34, 132); g.quadraticCurveTo(0, 90, 34, 132); g.closePath(); g.fill();
      g.fillStyle = "#ffe2a6"; g.beginPath(); g.ellipse(0, 132, 26, 7, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
  }

  /* ---------- efectos ---------- */
  const centroCuerpo = p => G.aPantalla(p, { x: p.pelvis.x, y: p.pelvis.y - 250 });
  // Aura: llama dorada con forma de gota que sube; varias capas que se suman (brillo).
  function aura(g, t, p, k, delante) {
    if (k <= 0.01) return;
    const c = centroCuerpo(p), vuelo = clamp((t - T.despega) / 0.15);
    const rx = 165 * Math.min(1.2, k), ry = 255 * Math.min(1.2, k) * (1 + 0.6 * vuelo);
    const capas = delante ? [[0.66, "rgba(255,248,190,", 0.16]] : [[1.18, "rgba(255,150,20,", 0.3], [1.0, "rgba(255,205,50,", 0.36], [0.82, "rgba(255,240,150,", 0.34]];
    g.save(); g.globalCompositeOperation = "lighter";
    for (const [esc, col, al] of capas) {
      const N = 64, pts = [];
      for (let i = 0; i < N; i++) {
        const a = i / N * Math.PI * 2, s = Math.sin(a), co = Math.cos(a);
        const arriba = Math.max(0, -s);
        let r = 1 + 0.55 * Math.pow(arriba, 3);
        // lenguas de fuego que suben y parpadean
        r += 0.16 * Math.pow(arriba, 1.5) * Math.max(0, Math.sin(a * 9 + t * 11 + esc * 3)) + 0.06 * ruido(i * 0.9 + t * 9 + esc * 7);
        const x = c.x + co * rx * esc * (1 - 0.35 * arriba * arriba), y = c.y + 30 + s * ry * esc * r * (s < 0 ? 1 : 0.62);
        pts.push({ x, y });
      }
      const gr = g.createRadialGradient(c.x, c.y + 40, 10, c.x, c.y, ry * esc * 1.2);
      gr.addColorStop(0, col + (al * 0.04 * clamp(k)) + ")"); gr.addColorStop(0.55, col + (al * 0.16 * clamp(k)) + ")"); gr.addColorStop(0.82, col + (al * 0.55 * clamp(k)) + ")"); gr.addColorStop(1, col + (al * clamp(k)) + ")");
      g.fillStyle = gr; g.beginPath(); M2.curva(g, pts, true, 0.5); g.fill();
    }
    // vetas de energía que suben
    g.lineCap = "round";
    const n = delante ? 7 : 16;
    for (let i = 0; i < n; i++) {
      const sem = i + (delante ? 50 : 0), vel = 1.1 + hash(sem) * 1.4;
      const ph = (t * vel + hash(sem + 3)) % 1;
      let x = c.x + (hash(sem + 7) - 0.5) * rx * 1.7 * (delante ? 0.8 : 1);
      if (delante && Math.abs(x - c.x) < 80) x = c.x + Math.sign(x - c.x || 1) * (80 + Math.abs(x - c.x) * 0.5);
      const y = c.y + ry * 0.75 - ph * ry * 2.1, len = (40 + hash(sem + 9) * 90) * Math.min(1.3, k);
      g.globalAlpha = Math.sin(Math.PI * ph) * (delante ? 0.35 : 0.6) * clamp(k);
      g.strokeStyle = "#fff4b8"; g.lineWidth = 2 + hash(sem + 2) * 3;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(t * 3 + i) * 4, y - len); g.stroke();
    }
    g.restore();
  }
  function chispas(g, t, p, k) {
    if (k <= 0.03) return;
    const c = centroCuerpo(p);
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 26; i++) {
      const vel = 0.6 + hash(i + 70) * 0.9, ph = (t * vel + hash(i + 71)) % 1;
      const x = c.x + (hash(i + 72) - 0.5) * 360 * Math.min(1.2, k) + Math.sin(t * 4 + i) * 10, y = SUELO - ph * 520;
      g.globalAlpha = Math.sin(Math.PI * ph) * clamp(k * 1.3);
      g.fillStyle = i % 3 ? "#ffe680" : "#ffffff"; g.beginPath(); g.arc(x, y, 1.5 + hash(i + 73) * 2.2, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function rayo(g, x, y, ang, largo, sem) {
    const pts = [[x, y]]; let a = ang, px = x, py = y;
    for (let i = 0; i < 9; i++) { const q = a + (hash(sem + i) - 0.5) * 2.2; px += Math.cos(q) * largo / 9; py += Math.sin(q) * largo / 9; pts.push([px, py]); }
    const traza = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); };
    g.strokeStyle = "rgba(120,220,255,0.45)"; g.lineWidth = 5; traza(); g.stroke();
    g.strokeStyle = "#f6feff"; g.lineWidth = 1.6; traza(); g.stroke();
  }
  function rayos(g, t, p, k) {
    if (k <= 0.05) return;
    const c = centroCuerpo(p), hueco = Math.floor(t / 0.07);
    g.save(); g.globalCompositeOperation = "lighter"; g.lineJoin = "miter"; g.lineCap = "round";
    const n = k > 0.9 ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const sem = hueco * 13 + i * 5;
      if (hash(sem) > 0.25 + 0.6 * clamp(k - 0.4)) continue;
      const a = hash(sem + 1) * Math.PI * 2, rr = 70 + hash(sem + 2) * 120;
      rayo(g, c.x + Math.cos(a) * rr * 0.9, c.y + Math.sin(a) * rr * 1.5, a + Math.PI / 2 * (hash(sem + 3) > 0.5 ? 1 : -1), 50 + hash(sem + 4) * 70, sem);
    }
    g.restore();
  }
  // Piedrecitas que suben del suelo durante la carga y salen despedidas al estallar.
  function piedras(g, t, p) {
    if (t < T.carga0 + 0.3) return;
    g.save();
    for (let i = 0; i < 16; i++) {
      const x0 = CX + (hash(i + 90) - 0.5) * 560, t0 = T.carga0 + 0.3 + hash(i + 91) * 1.6, sz = 3 + hash(i + 92) * 5;
      if (t < t0) continue;
      const u = Math.min(t, T.estalla) - t0;
      let x = x0 + Math.sin(u * 3 + i) * 6, y = SUELO + 2 - (1 - Math.exp(-u * 1.3)) * (60 + hash(i + 93) * 110) - Math.sin(u * 4 + i) * 4;
      let rot = u * (hash(i + 94) - 0.5) * 3, al = 1;
      if (t > T.estalla) {
        const v = t - T.estalla, dir = Math.sign(x - CX) || 1;
        x += dir * (380 + hash(i + 95) * 500) * v; y += (-260 - hash(i + 96) * 220) * v + 600 * v * v; rot += v * 9; al = clamp(1 - v / 1.2);
      }
      if (al <= 0) continue;
      g.globalAlpha = al; g.save(); g.translate(x, y); g.rotate(rot);
      g.fillStyle = "#4b3424"; g.strokeStyle = "#140d08"; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(-sz, -sz * 0.4); g.lineTo(-sz * 0.2, -sz); g.lineTo(sz, -sz * 0.3); g.lineTo(sz * 0.6, sz * 0.8); g.lineTo(-sz * 0.7, sz * 0.7); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#7b5a40"; g.fillRect(-sz * 0.4, -sz * 0.6, sz * 0.5, sz * 0.3);
      g.restore();
    }
    g.restore();
  }
  // Grietas en el suelo (perspectiva: muy aplastadas).
  function grietasSuelo(g, t) {
    const k = 0.45 * tramo(t, T.carga0 + 0.6, T.estalla) + 0.4 * salida(fase(t, T.estalla, T.estalla + 0.15)) + 0.25 * salida(fase(t, T.despega, T.despega + 0.12));
    if (k <= 0.01) return;
    const brillo = clamp(energia(t)) * (t < T.fuera + 0.3 ? 1 : Math.exp(-(t - T.fuera - 0.3) * 2));
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + hash(i + 120) * 0.5, L = (60 + hash(i + 121) * 150) * k;
      const pts = [[CX + Math.cos(a) * 14, SUELO + 6 + Math.sin(a) * 3]]; let r = 14;
      while (r < L) { r += 14 + hash(i * 3 + r) * 12; const j = (hash(i * 7 + r) - 0.5) * 0.28; pts.push([CX + Math.cos(a + j) * r, SUELO + 6 + Math.sin(a + j) * r * 0.2]); }
      const traza = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); };
      if (brillo > 0.05) { g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(255,190,60,${0.35 * brillo})`; g.lineWidth = 4; traza(); g.stroke(); g.globalCompositeOperation = "source-over"; }
      g.strokeStyle = "#120a05"; g.lineWidth = 1.8; traza(); g.stroke();
    }
    g.restore();
  }
  function polvo(g, t, p) {
    const c = clamp(energia(t)) * (t < T.despega ? 1 : 0), est = t > T.estalla ? fase(t, T.estalla, T.estalla + 1.4) : 0;
    const desp = t > T.despega ? fase(t, T.despega, T.despega + 1.6) : 0;
    g.save();
    for (let i = 0; i < 14; i++) {
      const a = hash(i + 140) * Math.PI * 2 + t * (0.8 + hash(i + 141)) * (i % 2 ? 1 : -1);
      let r = 60 + hash(i + 142) * 120, al = 0.18 * c, sz = 18 + hash(i + 143) * 22;
      if (est > 0 && est < 1) { r += 420 * salida(est); al = Math.max(al, 0.32 * (1 - est)); sz *= 1 + est; }
      if (desp > 0 && desp < 1) { r = 40 + 380 * salida(desp) * (0.6 + hash(i + 144) * 0.5); al = 0.35 * (1 - desp); sz = 22 + 40 * desp; }
      if (al <= 0.005) continue;
      g.globalAlpha = al; g.fillStyle = "#c9a27a";
      g.beginPath(); g.ellipse(CX + Math.cos(a) * r, SUELO - 6 + Math.sin(a) * r * 0.12 - sz * 0.3, sz, sz * 0.55, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function onda(g, t) {
    const u = fase(t, T.estalla, T.estalla + 0.7); if (u <= 0 || u >= 1) return;
    g.save(); g.globalCompositeOperation = "lighter";
    g.strokeStyle = `rgba(255,245,200,${0.9 * (1 - u)})`; g.lineWidth = 14 * (1 - u) + 2;
    g.beginPath(); g.ellipse(CX, SUELO, 40 + 620 * salida(u), 10 + 90 * salida(u), 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(CX, 340, 30 + 560 * salida(u), 0, Math.PI * 2); g.lineWidth = 9 * (1 - u) + 1; g.stroke();
    g.restore();
  }
  // Trozos de camiseta que salen volando y luego sube el aire caliente del aura
  function jirones(g, t, p) {
    const u = t - T.estalla; if (u <= 0 || u > 3.2) return;
    const c = G.aPantalla(p, { x: 243, y: 470 }), c0 = { x: CX + (243 - G.PELVIS.x) * S, y: SUELO - (G.SUELO - G.PELVIS.y - CUERPOS.grito.pel + 242) * S };
    g.save(); g.lineJoin = "round";
    for (let i = 0; i < 12; i++) {
      const a = hash(i + 160) * Math.PI * 2, v = 260 + hash(i + 161) * 380, giro = (hash(i + 162) - 0.5) * 14;
      const fr = 1 - Math.exp(-u * 2.2);
      const x = c0.x + Math.cos(a) * v * fr / 2.2 + Math.sin(u * 2 + i) * 18 * u, y = c0.y + Math.sin(a) * v * 0.6 * fr / 2.2 - 70 * u * u * (0.5 + hash(i + 163));
      const sz = 9 + hash(i + 164) * 12, al = clamp(1 - (u - 2) / 1.2);
      g.globalAlpha = al; g.save(); g.translate(x, y); g.rotate(giro * u * 0.4 + a);
      g.fillStyle = "#1f1f25"; g.strokeStyle = "#060608"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(-sz, -sz * 0.3); g.lineTo(-sz * 0.3, -sz * 0.7); g.lineTo(sz * 0.2, -sz * 0.4); g.lineTo(sz, -sz * 0.6);
      g.lineTo(sz * 0.7, sz * 0.3); g.lineTo(0, sz * 0.5); g.lineTo(-sz * 0.6, sz * 0.2); g.closePath(); g.fill(); g.stroke();
      g.restore();
    }
    g.restore();
  }
  // Cristales de la copa al reventar
  function cristales(g, t, mano) {
    const u = t - T.estalla; if (u <= 0 || u > 1.3 || !mano) return;
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI / 2 + (hash(i + 180) - 0.5) * 3.4, v = 180 + hash(i + 181) * 300;
      const x = mano.x + Math.cos(a) * v * u, y = mano.y - 30 + Math.sin(a) * v * u + 700 * u * u, sz = 2.5 + hash(i + 182) * 4;
      if (y > SUELO + 4) continue;
      g.globalAlpha = clamp(1 - u / 1.3); g.save(); g.translate(x, y); g.rotate(u * 12 * (hash(i + 183) - 0.5));
      g.fillStyle = "#dff6ff"; g.beginPath(); g.moveTo(0, -sz); g.lineTo(sz * 0.8, sz * 0.6); g.lineTo(-sz * 0.6, sz * 0.4); g.closePath(); g.fill();
      g.restore();
    }
    g.restore();
  }
  function estela(g, t, p) {
    if (t < T.despega) return;
    const u = t - T.despega, c = centroCuerpo(p), alpha = Math.exp(-Math.max(0, t - T.fuera) * 2.5);
    if (alpha < 0.01) return;
    const pies = G.aPantalla(p, { x: p.pelvis.x, y: p.pelvis.y + 560 });
    const yTop = Math.max(-80, pies.y - 20), w = 70 + 40 * Math.exp(-u * 3);
    if (yTop >= SUELO - 10) return;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, SUELO, 0, yTop); gr.addColorStop(0, "rgba(255,190,40,0)"); gr.addColorStop(0.4, `rgba(255,210,70,${0.3 * alpha})`); gr.addColorStop(1, `rgba(255,245,190,${0.7 * alpha})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(CX - w * 0.35, SUELO); g.lineTo(CX - w / 2, yTop); g.lineTo(CX + w / 2, yTop); g.lineTo(CX + w * 0.35, SUELO); g.closePath(); g.fill();
    // líneas de velocidad
    g.strokeStyle = `rgba(255,255,230,${0.7 * alpha})`; g.lineCap = "round";
    for (let i = 0; i < 10; i++) {
      const x = CX + (hash(i + 200) - 0.5) * 300, y0 = ((hash(i + 201) * 520 + u * 2400) % 520) - 60;
      g.lineWidth = 1.5 + hash(i + 202) * 2; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 60 + hash(i + 203) * 80); g.stroke();
    }
    g.restore();
  }
  function chispazo(g, t, p) {        // respingo: un chispazo eléctrico alrededor
    const k = campana(t, T.sacude, T.sacude + 0.2); if (k <= 0) return;
    const c = G.aPantalla(p, G.centroCabeza(p));
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = k;
    for (const [dx, dy, a] of [[-72, -10, -2.3], [70, -40, -0.7], [-60, 60, 2.6], [64, 52, 0.4]]) rayo(g, c.x + dx, c.y + dy, a, 40, 300 + dx + Math.floor(t / 0.05));
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const acerca = tramo(t, T.carga0, T.estalla, suave) * (1 - tramo(t, T.calma, T.arriba0 + 0.4));
    const golpe = t >= T.estalla ? Math.exp(-(t - T.estalla) * 3.5) * suave(fase(t, T.estalla, T.estalla + 0.06)) : 0;
    const sube = tramo(t, T.agacha0, T.fuera + 0.3);
    return { k: 1 + 0.12 * acerca + 0.07 * golpe, x: CX, y: 300 + 25 * acerca - 30 * sube };
  }
  function temblor(t) {
    const carga = 3.5 * Math.pow(tramo(t, T.carga0, T.estalla), 1.5) * (t < T.estalla ? 1 : 0);
    const est = t >= T.estalla ? 11 * Math.exp(-(t - T.estalla) * 2.6) : 0;
    const rumor = 1.4 * tramo(t, T.estalla, T.estalla + 0.3) * (1 - tramo(t, T.despega + 0.4, T.despega + 1.4));
    const desp = t >= T.despega ? 7 * Math.exp(-(t - T.despega) * 3) : 0;
    return carga + est + rumor + desp;
  }

  class GuillermoSeTransforma extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      const p = pose(t), en = energia(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, 11.45, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), tb = temblor(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 47) * tb, ruido(t * 47 + 19) * tb * 0.7);
      g.drawImage(fondo, -40, -60);
      lamparas(g, t);
      // la sala se oscurece mientras sube la energía y la ilumina el aura
      const sombra = 0.5 * clamp(en) * (t < T.fuera ? 1 : Math.exp(-(t - T.fuera) * 1.4));
      if (sombra > 0.01) { g.fillStyle = `rgba(0,0,0,${sombra})`; g.fillRect(-60, -60, W + 120, H + 120); }
      const c = centroCuerpo(p);
      const brilloSala = clamp(en) * (t < T.fuera ? 1 : Math.exp(-(t - T.fuera) * 1.6));
      if (brilloSala > 0.01) {
        g.save(); g.globalCompositeOperation = "lighter";
        const gr = g.createRadialGradient(c.x, c.y, 20, c.x, c.y, 430); gr.addColorStop(0, `rgba(255,190,60,${0.42 * brilloSala})`); gr.addColorStop(1, "rgba(255,170,40,0)");
        g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120); g.restore();
      }
      grietasSuelo(g, t);
      polvo(g, t, p);
      if (t < T.despega + 0.25) {
        g.save(); g.fillStyle = `rgba(0,0,0,${0.38 * clamp(1 - (t - T.despega) / 0.25)})`; g.beginPath(); g.ellipse(CX, SUELO + 1, 120, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
      estela(g, t, p);
      aura(g, t, p, en, false);
      chispas(g, t, p, en);
      piedras(g, t, p);
      rayos(g, t, p, t > T.grito0 ? en : 0);
      G.dibujar(g, p, t);
      aura(g, t, p, en, true);
      chispazo(g, t, p);
      const mano = p.manoLejos ? G.aPantalla(p, p.manoLejos) : null;
      cristales(g, t, mano && t > T.estalla ? (this._mano || (this._mano = mano)) : null);
      jirones(g, t, p);
      onda(g, t);
      g.restore();
      // destello del estallido
      const fl = t >= T.estalla - 0.07 ? Math.exp(-Math.max(0, t - T.estalla) * 7) * suave(fase(t, T.estalla - 0.07, T.estalla)) : 0;
      if (fl > 0.01) { g.fillStyle = `rgba(255,252,235,${0.92 * fl})`; g.fillRect(0, 0, W, H); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00002", nombre: "Guillermo se transforma", crear: () => new GuillermoSeTransforma() });
  window.__A2D_00002 = { pose, T, DUR, energia };
})();
