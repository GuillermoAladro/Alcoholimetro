"use strict";
/* 00092.2 · Guillermo y Marta · La bufanda
 *
 * Negro → una noche de nieve a la puerta del bar: cielo de hora azul, tejados nevados al fondo, la fachada
 * verde del bar con su ventanal encendido (toldo con nieve y carámbanos, escarcha en las esquinas), la puerta
 * con su corona, una farola con su halo, un banco nevado y huellas en la acera; nieva sin parar.
 * Guillermo tirita con los brazos cruzados (castañetea los dientes y echa vaho); a su lado Marta teje una
 * bufanda de rayas rojas y crema a una velocidad increíble: las agujas son un borrón, las rayas bajan
 * corriendo por la bufanda, los ovillos giran en su cesta y la bufanda se amontona a sus pies. Guillermo
 * alucina → Marta para, guarda las agujas en el bolsillo, levanta la punta de la bufanda y le pregunta
 * con las cejas; Guillermo asiente como loco → Marta se la lanza y la punta le cae sobre el hombro; con el
 * dedo le hace «gira» → Guillermo gira como una peonza, en la gloria, mientras Marta le va dando bufanda:
 * primero el cuello… y luego la boca, la nariz, la frente, el pecho, la tripa, las piernas: un capullo de
 * rayas del que solo asoman los ojos, los pinchos del pelo y las zapatillas → Guillermo parpadea, mira a
 * cámara y se aleja a saltitos, «mmf, mmf», mientras Marta se ríe tapándose la boca sin soltar la punta →
 * Marta coge la punta con las dos manos, se echa atrás y ¡tirón!: Guillermo sale girando como una peonza,
 * la bufanda se desenrolla y vuelve a amontonarse a los pies de Marta, que la recoge mano sobre mano,
 * hasta que solo le queda la vuelta del cuello → mareado (ojos en espiral, estrellitas), Guillermo no se
 * entera de que Marta saca unas tijeritas del bolsillo y ¡zis!, corta la bufanda junto a su cuello →
 * Guillermo se despeja con una bufanda corta y perfecta, hunde la barbilla en ella con los ojos cerrados,
 * calentito y colorado, y mira a cámara; Marta, con las tijeras, le guiña un ojo a la cámara → negro.
 *
 * Las vueltas del capullo están en la hoja del torso de Guillermo (la cabeza va pegada al torso mientras
 * está envuelto) y aparecen o se van de una en una; la bufanda suelta es una tira con sus rayas, que corren
 * hacia donde se mueve la tela. Los giros son aplastados en 2D, nunca una vuelta entera. Sin textos. Todo
 * depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, hash, ruido } = M2;
  const G = Guillermo, M = Marta;
  const S = 0.30, SUELO = 556, DUR = 14.8, TAU = Math.PI * 2;

  const T = {
    entra: 0.8,
    teje0: 0.3, tejeA: 0.95, tejeB: 3.3, teje1: 3.55,
    alucina0: 1.45, alucina1: 2.05, sonrM0: 2.05, sonrM1: 2.75,
    guarda0: 3.55, guarda1: 3.95, alza0: 3.95, alza1: 4.3, asiente0: 4.1, asiente1: 4.55,
    carga0: 4.35, lanza: 4.66, cae: 5.0, mira0: 5.0, dedo0: 5.12, dedo1: 5.45,
    gira0: 5.45, giraA: 5.9, giraB: 7.7, gira1: 8.3,
    env0: 5.5, envCuello: 6.0, env1: 8.1, tapa: 6.02, ojos: 6.45, bolsillos: 6.3,
    capullo: 8.3, mirase: 8.7, camara1: 9.0, risa0: 8.45, risa1: 9.7,
    salto0: 9.1, salto1: 9.45, salto2: 9.8, saltoD: 0.32,
    agarra0: 9.75, agarra1: 10.05, atras: 10.0, tiron: 10.35,
    gira2_0: 10.35, gira2A: 10.48, gira2B: 11.3, gira2_1: 12.0,
    des0: 10.38, des1: 11.75, arrastre1: 11.6,
    mareo0: 12.0, mareo1: 12.85,
    pasoM0: 11.8, pasoM1: 12.15,
    tijera0: 11.95, tijera1: 12.2, corta1: 12.45, snip1: 12.52, snip2: 12.68, suelta: 12.85, baja1: 13.15,
    abraza0: 12.95, abraza1: 13.3, camara2: 13.45, guino: 13.55,
    fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const recorrido = (lista, t) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], suave(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const AGARRA = D(0.3, 0.3, 0.3, 0.3);
  // ángulo de una peonza que arranca, gira constante y frena: da exactamente n vueltas
  function peonza(t, a, b, c, d, n) {
    const I = u => u * u * u - u * u * u * u / 2;
    const tot = 0.5 * (b - a) + (c - b) + 0.5 * (d - c), w = n * TAU / tot;
    let s;
    if (t <= a) s = 0;
    else if (t < b) s = (b - a) * I(fase(t, a, b));
    else if (t < c) s = 0.5 * (b - a) + (t - b);
    else if (t < d) { const u = fase(t, c, d); s = 0.5 * (b - a) + (c - b) + (d - c) * (u - I(u)); }
    else s = tot;
    return { ang: w * s, vel: suave(fase(t, a, b)) * (1 - suave(fase(t, c, d))) };
  }
  const giro1 = t => peonza(t, T.gira0, T.giraA, T.giraB, T.gira1, 6);
  const giro2 = t => peonza(t, T.gira2_0, T.gira2A, T.gira2B, T.gira2_1, 5);

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * G.JK;                       // del centro del puño a la muñeca (hoja)
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { cerca: punoDesde(P(131, 652), -1.75), lejos: punoDesde(P(372, 648), -1.75) };
  function bolsillo(Pj, p, lado) {
    if (Pj === G) { const b = G.tronco(p)(BOLS_G[lado]); return { x: b.x, y: b.y, ang: 0, mu: -1.75, puno: 0, dobla: lado === "cerca" ? -1 : 1, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
    const m = Pj.manoReposo(p, lado); return Object.assign({ dedos: D(0.4, 0.4, 0.4, 0.4) }, m);
  }
  // mano que agarra en `scr` (pantalla); si el brazo no llega, se queda donde llega
  function manoEn(Pj, p, lado, scr, o = {}) {
    const h = Pj.tronco(p)(lado === "cerca" ? Pj.HOMBRO_C : Pj.HOMBRO);
    let q = Pj.aHoja(p, scr);
    const L = (lado === "cerca" ? Pj.BRAZO_C_L : Pj.BRAZO_L) * 1.03;
    const mu = o.mu ?? (Math.atan2(h.y - q.y, h.x - q.x) + (o.dmu || 0));
    let w = { x: q.x + Math.cos(mu) * R_M, y: q.y + Math.sin(mu) * R_M };
    const d = Math.hypot(w.x - h.x, w.y - h.y);
    if (d > L) { const k = L / d; w = { x: h.x + (w.x - h.x) * k, y: h.y + (w.y - h.y) * k }; q = { x: w.x - Math.cos(mu) * R_M, y: w.y - Math.sin(mu) * R_M }; }
    return { x: q.x, y: q.y, ang: 0, mu, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), puno: o.puno ?? 1, dedos: o.dedos || AGARRA };
  }
  function mezclaMano(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    let dm = b.mu - a.mu; while (dm > Math.PI) dm -= TAU; while (dm < -Math.PI) dm += TAU;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: 0, mu: a.mu + dm * k, dobla: k < 0.5 ? a.dobla : b.dobla,
      puno: lerp(a.puno ?? 1, b.puno ?? 1, k), dedos: DD(a.dedos || AGARRA, b.dedos || AGARRA, k) };
  }
  // pista de una mano: [t0, t1, f(p) → mano]
  function pista(lista, t, p) {
    let c = lista[0][2](p);
    for (let i = 1; i < lista.length; i++) { const [t0, t1, f, e] = lista[i]; if (t <= t0) break; c = mezclaMano(c, f(p), (e || suave)(fase(t, t0, t1))); }
    return c;
  }
  const centroMano = (Pj, p, m) => Pj.aPantalla(p, { x: m.x, y: m.y });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * LA BUFANDA
   * ===================================================================================== */
  const B = { rojo: "#c9343e", rojoOsc: "#8f2030", crema: "#f5ead6", cremaOsc: "#d9c7a6", azul: "#2d3f72", tinta: "#2b1318" };
  const RAYA = 22, ANCHO = 30;
  const mod = (a, n) => ((a % n) + n) % n;

  // curva suave (Catmull-Rom) por los puntos de control, remuestreada cada `paso` px de arco
  function curvaRemuestreada(ctrl, paso) {
    const dens = [];
    const n = ctrl.length;
    if (n === 1) return [{ x: ctrl[0].x, y: ctrl[0].y, s: 0 }];
    for (let i = 0; i < n - 1; i++) {
      const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(n - 1, i + 2)];
      const k = 10;
      for (let j = 0; j < k; j++) {
        const u = j / k, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        dens.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
      }
    }
    dens.push({ x: ctrl[n - 1].x, y: ctrl[n - 1].y });
    // longitud acumulada y remuestreo
    const acc = [0];
    for (let i = 1; i < dens.length; i++) acc.push(acc[i - 1] + Math.hypot(dens[i].x - dens[i - 1].x, dens[i].y - dens[i - 1].y));
    const L = acc[acc.length - 1], out = [];
    const nn = Math.max(2, Math.ceil(L / paso) + 1);
    let j = 1;
    for (let i = 0; i < nn; i++) {
      const s = L * i / (nn - 1);
      while (j < acc.length - 1 && acc[j] < s) j++;
      const k = (s - acc[j - 1]) / Math.max(1e-6, acc[j] - acc[j - 1]);
      out.push({ x: lerp(dens[j - 1].x, dens[j].x, k), y: lerp(dens[j - 1].y, dens[j].y, k), s });
    }
    return out;
  }
  // punto (con normal) a la distancia s de arco
  function enArco(pts, s) {
    s = clamp(s, 0, pts[pts.length - 1].s);
    let i = 1; while (i < pts.length - 1 && pts[i].s < s) i++;
    const a = pts[i - 1], b = pts[i], k = (s - a.s) / Math.max(1e-6, b.s - a.s);
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), nx: -dy / l, ny: dx / l, tx: dx / l, ty: dy / l };
  }
  function flecos(g, q, dirx, diry, w, t, sem, e = 1) {
    // borlas en la punta: cordoncitos que cuelgan un poco
    g.save(); g.lineCap = "round";
    const n = 6, ruta = sel => {
      g.beginPath();
      for (let i = 0; i < n; i++) {
        if (!sel(i)) continue;
        const o = (i / (n - 1) - 0.5) * w * 0.86, x0 = q.x + q.nx * o, y0 = q.y + q.ny * o;
        const l = (7 + 2.5 * hash(sem + i)) * e, sw = 1.6 * e * Math.sin(t * 5 + i * 1.7 + sem);
        g.moveTo(x0, y0); g.quadraticCurveTo(x0 + dirx * l * 0.6 + q.nx * sw, y0 + diry * l * 0.6 + q.ny * sw + 1.5 * e, x0 + dirx * l + q.nx * sw * 1.6, y0 + diry * l + 3 * e);
      }
    };
    ruta(() => true); g.lineWidth = 3.6 * e; g.strokeStyle = B.tinta; g.stroke();
    ruta(i => i % 2 === 0); g.lineWidth = 2.2 * e; g.strokeStyle = B.crema; g.stroke();
    ruta(i => i % 2 === 1); g.strokeStyle = B.rojo; g.stroke();
    g.restore();
  }
  /* Tira de bufanda (pantalla) a lo largo de `ctrl`. La tela tiene coordenada f = f0 + dir · s (s: arco desde
   * el primer punto); las rayas están fijas a la tela, así que corren cuando cambia f0.
   * o: { w, desde, hasta, flecosIni, flecosFin, redondo, alfa, t, esc } (esc: para dibujar en la hoja) */
  function tira(g, ctrl, f0, dir, o = {}) {
    const e = o.esc ?? 1, RY = RAYA * e;
    const w = o.w ?? ANCHO, pts0 = curvaRemuestreada(ctrl, 4 * e);
    const Ltot = pts0[pts0.length - 1].s, s0 = clamp(o.desde ?? 0, 0, Ltot), s1 = clamp(o.hasta ?? Ltot, 0, Ltot);
    if (s1 - s0 < 0.6) return null;
    // puntos dentro de la ventana, con normales
    const pts = [];
    const add = s => { const q = enArco(pts0, s); pts.push({ x: q.x, y: q.y, nx: q.nx, ny: q.ny, tx: q.tx, ty: q.ty, s }); };
    add(s0); for (const q of pts0) if (q.s > s0 + 0.5 && q.s < s1 - 0.5) add(q.s); add(s1);
    // normales suavizadas
    for (let i = 1; i < pts.length - 1; i++) { const a = pts[i - 1], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; pts[i].nx = -dy / l; pts[i].ny = dx / l; }
    const hw = w / 2;
    const Lb = pts.map(q => ({ x: q.x + q.nx * hw, y: q.y + q.ny * hw })), Rb = pts.map(q => ({ x: q.x - q.nx * hw, y: q.y - q.ny * hw }));
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    if (o.alfa != null) g.globalAlpha *= o.alfa;
    const forma = () => {
      g.beginPath(); g.moveTo(Lb[0].x, Lb[0].y);
      for (let i = 1; i < Lb.length; i++) g.lineTo(Lb[i].x, Lb[i].y);
      if (o.redondo) { const q = pts[pts.length - 1]; g.arc(q.x, q.y, hw, Math.atan2(q.ny, q.nx), Math.atan2(q.ny, q.nx) + Math.PI, false); }
      for (let i = Rb.length - 1; i >= 0; i--) g.lineTo(Rb[i].x, Rb[i].y);
      if (o.redondo) { const q = pts[0]; g.arc(q.x, q.y, hw, Math.atan2(-q.ny, -q.nx), Math.atan2(-q.ny, -q.nx) + Math.PI, false); }
      g.closePath();
    };
    // tinta por fuera
    forma(); g.fillStyle = B.crema; g.fill();
    g.save(); forma(); g.clip();
    // rayas rojas exactas (cortadas en sus fronteras)
    const fA = f0 + dir * s0, fB = f0 + dir * s1, fmin = Math.min(fA, fB), fmax = Math.max(fA, fB);
    g.beginPath();
    for (let k = Math.floor(fmin / RY) - 1; k * RY <= fmax; k++) {
      if (mod(k, 2) !== 0) continue;
      let sa = (k * RY - f0) / dir, sb = ((k + 1) * RY - f0) / dir; if (sa > sb) [sa, sb] = [sb, sa];
      sa = Math.max(sa, s0); sb = Math.min(sb, s1); if (sb - sa < 0.2) continue;
      const qa = enArco(pts0, sa), qb = enArco(pts0, sb), mid = [];
      for (const q of pts) if (q.s > sa && q.s < sb) mid.push(q);
      const W2 = hw + 3 * e;
      g.moveTo(qa.x + qa.nx * W2, qa.y + qa.ny * W2);
      for (const q of mid) g.lineTo(q.x + q.nx * W2, q.y + q.ny * W2);
      g.lineTo(qb.x + qb.nx * W2, qb.y + qb.ny * W2); g.lineTo(qb.x - qb.nx * W2, qb.y - qb.ny * W2);
      for (let i = mid.length - 1; i >= 0; i--) g.lineTo(mid[i].x - mid[i].nx * W2, mid[i].y - mid[i].ny * W2);
      g.lineTo(qa.x - qa.nx * W2, qa.y - qa.ny * W2); g.closePath();
    }
    g.fillStyle = B.rojo; g.fill();
    // sombra de volumen en un borde
    g.beginPath(); g.moveTo(Rb[0].x, Rb[0].y); for (let i = 1; i < Rb.length; i++) g.lineTo(Rb[i].x, Rb[i].y);
    for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i].x - pts[i].nx * hw * 0.35, pts[i].y - pts[i].ny * hw * 0.35);
    g.closePath(); g.fillStyle = "rgba(60,10,40,0.18)"; g.fill();
    // punto de media: uves en dos columnas, fijas a la tela
    g.beginPath();
    const PV = 7.5 * e, kk0 = Math.ceil(fmin / PV), kk1 = Math.floor(fmax / PV), vv = 2.3 * e;
    for (let kk = kk0; kk <= kk1; kk++) {
      const s = (kk * PV - f0) / dir; if (s < s0 || s > s1) continue;
      const q = enArco(pts0, s), dd = dir * 2.2 * e;
      for (const c of [-0.27, 0.27]) {
        const x = q.x + q.nx * w * c, y = q.y + q.ny * w * c;
        g.moveTo(x + q.nx * vv - q.tx * dd, y + q.ny * vv - q.ty * dd); g.lineTo(x + q.tx * dd * 0.6, y + q.ty * dd * 0.6); g.lineTo(x - q.nx * vv - q.tx * dd, y - q.ny * vv - q.ty * dd);
      }
    }
    g.lineWidth = 1 * e; g.strokeStyle = "rgba(70,20,30,0.32)"; g.stroke();
    g.restore();
    // contorno
    g.lineWidth = 1.9 * e; g.strokeStyle = B.tinta;
    g.beginPath(); g.moveTo(Lb[0].x, Lb[0].y); for (let i = 1; i < Lb.length; i++) g.lineTo(Lb[i].x, Lb[i].y);
    if (o.redondo) { const q = pts[pts.length - 1]; g.arc(q.x, q.y, hw, Math.atan2(q.ny, q.nx), Math.atan2(q.ny, q.nx) + Math.PI, false); }
    else { g.moveTo(Rb[Rb.length - 1].x, Rb[Rb.length - 1].y); }
    for (let i = Rb.length - 1; i >= 0; i--) g.lineTo(Rb[i].x, Rb[i].y);
    if (o.redondo) { const q = pts[0]; g.arc(q.x, q.y, hw, Math.atan2(-q.ny, -q.nx), Math.atan2(-q.ny, -q.nx) + Math.PI, false); }
    g.stroke();
    if (o.cortesIni) { g.beginPath(); g.moveTo(Lb[0].x, Lb[0].y); g.lineTo(Rb[0].x, Rb[0].y); g.stroke(); }
    if (o.cortesFin) { const n = Lb.length - 1; g.beginPath(); g.moveTo(Lb[n].x, Lb[n].y); g.lineTo(Rb[n].x, Rb[n].y); g.stroke(); }
    g.restore();
    const qi = pts[0], qf = pts[pts.length - 1];
    if (o.flecosIni) flecos(g, qi, -qi.tx, -qi.ty, w, o.t || 0, 3, e);
    if (o.flecosFin) flecos(g, qf, qf.tx, qf.ty, w, o.t || 0, 9, e);
    return { ini: qi, fin: qf };
  }

  /* ---------- vueltas del capullo (hoja del torso de Guillermo) ---------- */
  // 0 cuello (bajo la cabeza) · 1 barbilla y boca · 2 nariz · 3 frente · 4…9 pecho → rodillas
  const VUELTAS = [
    { xm: 278, hw: 118, yc: 300, m: -0.04, h: 104, e: 10, f0: 0.3 },
    { xm: 298, hw: 162, yc: 264, m: 0.3, h: 112, e: 9, f0: 1.1 },
    { xm: 296, hw: 152, yc: 185, m: 0.36, h: 106, e: 8, f0: 2.3 },
    { xm: 296, hw: 160, yc: 42, m: 0.36, h: 100, e: 8, f0: 0.7 },
    { xm: 214, hw: 212, yc: 388, m: 0.06, h: 132, e: 11, f0: 1.9 },
    { xm: 216, hw: 210, yc: 496, m: -0.05, h: 132, e: 11, f0: 0.4 },
    { xm: 222, hw: 206, yc: 604, m: 0.05, h: 132, e: 11, f0: 2.8 },
    { xm: 234, hw: 192, yc: 712, m: -0.05, h: 132, e: 10, f0: 1.4 },
    { xm: 246, hw: 162, yc: 820, m: 0.05, h: 132, e: 10, f0: 0.9 },
    { xm: 254, hw: 140, yc: 928, m: -0.04, h: 132, e: 9, f0: 2.0 }
  ];
  const NV = VUELTAS.length;
  const yCentro = (v, x) => { const u = clamp((x - v.xm) / v.hw, -1, 1); return v.yc + v.m * (x - v.xm) + v.e * Math.sqrt(1 - u * u); };
  // extremos (izquierdo y derecho) de una vuelta, en la hoja del torso
  const extremos = v => [P(v.xm - v.hw, yCentro(v, v.xm - v.hw)), P(v.xm + v.hw, yCentro(v, v.xm + v.hw))];
  /* una vuelta de bufanda vista de frente, de x0 a x0 + f·ancho (crece de izquierda a derecha) */
  function vuelta(g, v, f) {
    if (f <= 0.003) return;
    const x0 = v.xm - v.hw, x1 = x0 + 2 * v.hw * clamp(f), h2 = v.h / 2, N = 22;
    const arriba = [], abajo = [];
    for (let i = 0; i <= N; i++) { const x = lerp(x0, x1, i / N), y = yCentro(v, x); arriba.push(P(x, y - h2)); abajo.push(P(x, y + h2)); }
    const capIni = h2 * 0.32, capFin = f > 0.995 ? h2 * 0.32 : h2 * 0.12;
    const forma = () => {
      g.beginPath(); g.moveTo(arriba[0].x, arriba[0].y);
      for (let i = 1; i <= N; i++) g.lineTo(arriba[i].x, arriba[i].y);
      const a = arriba[N], b = abajo[N];
      g.bezierCurveTo(a.x + capFin, a.y + 4, b.x + capFin, b.y - 4, b.x, b.y);
      for (let i = N - 1; i >= 0; i--) g.lineTo(abajo[i].x, abajo[i].y);
      const c = abajo[0], d = arriba[0];
      g.bezierCurveTo(c.x - capIni, c.y - 4, d.x - capIni, d.y + 4, d.x, d.y);
      g.closePath();
    };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    forma(); g.fillStyle = B.crema; g.fill();
    g.save(); forma(); g.clip();
    // rayas: fronteras repartidas sobre el cilindro (se apiñan hacia los lados)
    const dphi = 0.42, ph = mod(v.f0, 2 * dphi), H2 = Math.PI / 2;
    g.beginPath();
    for (let k = Math.floor((-H2 - ph) / dphi) - 1; k <= Math.ceil((H2 - ph) / dphi) + 1; k++) {
      if (mod(k, 2) !== 0) continue;
      const fa = clamp(ph + k * dphi, -H2, H2), fb = clamp(ph + (k + 1) * dphi, -H2, H2);
      if (fb - fa < 1e-3) continue;
      const xa = v.xm + v.hw * Math.sin(fa), xb = v.xm + v.hw * Math.sin(fb);
      if (xb - xa < 0.5) continue;
      g.moveTo(xa, yCentro(v, xa) - h2 - 30); g.lineTo(xb, yCentro(v, xb) - h2 - 30); g.lineTo(xb, yCentro(v, xb) + h2 + 30); g.lineTo(xa, yCentro(v, xa) + h2 + 30); g.closePath();
    }
    g.fillStyle = B.rojo; g.fill();
    // sombra del cilindro: oscuro hacia los lados, y la vuelta de encima le hace sombra arriba
    const gr = g.createLinearGradient(v.xm - v.hw, 0, v.xm + v.hw, 0);
    gr.addColorStop(0, "rgba(40,10,50,0.42)"); gr.addColorStop(0.22, "rgba(40,10,50,0.08)"); gr.addColorStop(0.62, "rgba(255,240,220,0.06)");
    gr.addColorStop(0.86, "rgba(40,10,50,0.14)"); gr.addColorStop(1, "rgba(40,10,50,0.46)");
    g.fillStyle = gr; g.fillRect(v.xm - v.hw - 40, v.yc - 300, 2 * v.hw + 80, 600);
    g.beginPath(); for (let i = 0; i <= N; i++) g.lineTo(abajo[i].x, abajo[i].y - 16); for (let i = N; i >= 0; i--) g.lineTo(abajo[i].x, abajo[i].y + 4); g.closePath();
    g.fillStyle = "rgba(60,10,40,0.2)"; g.fill();
    // punto de media: uves en dos filas, apiñadas hacia los lados
    g.beginPath();
    for (const fila of [-0.24, 0.22]) {
      for (let k = -14; k <= 14; k++) {
        const phi = (k + 0.5 * (fila > 0 ? 1 : 0)) * 0.105 + v.f0 * 0.3; if (Math.abs(phi) > 1.45) continue;
        const x = v.xm + v.hw * Math.sin(phi); if (x > x1 - 6) continue;
        const y = yCentro(v, x) + fila * v.h, sx = 7 * Math.cos(phi);
        g.moveTo(x - sx, y - 5); g.lineTo(x, y + 4); g.lineTo(x + sx, y - 5);
      }
    }
    g.lineWidth = 3; g.strokeStyle = "rgba(70,20,30,0.3)"; g.stroke();
    g.restore();
    forma(); g.lineWidth = 6.5; g.strokeStyle = B.tinta; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * TIEMPOS DE LA BUFANDA
   * ===================================================================================== */
  // tejido: largo tejido (px) y montón a los pies
  const LH = 196, LMAX = LH + 8 * 66, L0 = 34;
  function tejido(t) {
    const k = t < T.tejeA ? 0.03 * tramo(t, T.teje0, T.tejeA, x => x * x) : t < T.tejeB ? lerp(0.03, 0.97, fase(t, T.tejeA, T.tejeB)) : lerp(0.97, 1, salida(fase(t, T.tejeB, T.teje1)));
    return lerp(L0, LMAX, k);
  }
  // velocidad de las agujas (vueltas por segundo) y su fase
  const velAgujas = t => t < T.teje0 || t > T.teje1 + 0.1 ? 0 : 1.6 + 7.6 * tramo(t, T.teje0 + 0.15, T.tejeA + 0.2) * (1 - tramo(t, T.tejeB - 0.1, T.teje1));
  function faseAgujas(t) {   // integral de la velocidad (por tramos lineales)
    let s = 0; const dt = 0.02;
    for (let x = T.teje0; x < Math.min(t, T.teje1 + 0.1); x += dt) s += velAgujas(x + dt / 2) * Math.min(dt, t - x);
    return s * TAU;
  }
  // avance del capullo (0 … 1): cada vuelta es 1/NV
  function avance(t) {
    if (t < T.env0) return 0;
    if (t < T.envCuello) return 0.1 * suave(fase(t, T.env0, T.envCuello));
    if (t < T.des0) return lerp(0.1, 1, 0.82 * fase(t, T.envCuello, T.env1) + 0.18 * suave(fase(t, T.envCuello, T.env1)));
    return lerp(1, 0.1, 0.7 * salida(fase(t, T.des0, T.des1)) + 0.3 * fase(t, T.des0, T.des1));
  }
  const visibleV = (u, k) => clamp(u * NV - k);
  // montón a los pies de Marta (pliegues)
  function monton(t) {
    if (t < T.env0) return clamp((tejido(t) - LH) / 66, 0, 8);
    const u = avance(t);
    if (t < T.des0) return lerp(8, 1.2, (u - 0) / 1);
    return lerp(7.2, 1.2, (u - 0.1) / 0.9);
  }
  // tela que ha pasado hacia Guillermo (para que las rayas corran)
  const TALLO = 62;
  function dada(t) {
    return TALLO * tramo(t, T.cae, T.cae + 0.18) + 880 * avance(t);
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CG = {
    frio: E({ mx: 0.6, my: 0.25, c: 0.25, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 9, ancho: 0.85, sonr: -0.35, rub: 0.55 }),
    alucina: E({ mx: 0.92, my: 0.35, iris: 1.14, sd: 26, gd: 0.1, si: 26, gi: 0.1, abre: 20, ancho: 0.6, sonr: -0.05, rub: 0.5 }),
    espera: E({ mx: 0.92, my: 0.05, iris: 1.22, sd: 20, gd: 0.24, si: 20, gi: 0.24, abre: 4, ancho: 0.7, sonr: 0.3, rub: 0.5 }),
    asiente: E({ mx: 0.92, my: 0.1, c: 0.2, h: 0.4, sd: 16, si: 16, abre: 12, ancho: 1, sonr: 0.9, rub: 0.55 }),
    mira: E({ mx: 0.9, my: 0.75, iris: 1.12, sd: 16, si: 16, abre: 6, ancho: 0.8, sonr: 0.85, rub: 0.55 }),
    gozo: E({ c: 1, h: 1, sd: 12, si: 12, abre: 6, ancho: 1.05, sonr: 1, rub: 0.8 }),
    susto: E({ mx: 0.6, my: 0.25, iris: 0.72, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 0, sonr: 0, rub: 0.4 }),
    alarma: E({ mx: -0.35, my: 0.1, iris: 0.62, sd: 28, si: 28, rub: 0.3 }),
    abajo: E({ mx: 0.35, my: 0.95, iris: 0.82 }),
    camara: E({ mx: -0.88, my: 0, iris: 0.86, c: 0.32 }),
    decide: E({ mx: -0.7, my: 0.15, c: 0.42, z: 0.15 }),
    atras: E({ mx: 0.95, my: -0.05, iris: 0.6, sd: 28, si: 28 }),
    gira: E({ esp: 1, abre: 24, ancho: 0.8, sonr: -0.2 }),
    mareo: E({ mx: 0.3, my: -0.1, esp: 1, c: 0.2, sd: 8, gd: 0.15, si: -4, gi: -0.08, abre: 14, ancho: 0.8, sonr: 0.1, lengua: 0.8 }),
    despierta: E({ mx: 0.45, my: 0.9, c: 0.12, sd: 12, si: 12, abre: 5, ancho: 0.7, sonr: 0.35, rub: 0.45 }),
    calentito: E({ c: 1, h: 1, sd: 14, si: 14, abre: 4, ancho: 1, sonr: 1, rub: 0.9 }),
    final: E({ mx: -0.88, my: 0, c: 0.32, h: 0.6, sd: 14, si: 14, abre: 8, ancho: 1, sonr: 0.95, rub: 0.8 })
  };
  const GUION_CG = [
    [T.alucina0, T.alucina0 + 0.12, "alucina"], [T.alucina1, T.alucina1 + 0.25, "frio"], [T.alza0 + 0.05, T.alza0 + 0.2, "espera"],
    [T.asiente0, T.asiente0 + 0.12, "asiente"], [T.lanza, T.lanza + 0.15, "espera"], [T.mira0, T.mira0 + 0.12, "mira"],
    [T.gira0 + 0.02, T.gira0 + 0.2, "gozo"], [T.tapa, T.tapa + 0.06, "susto"], [T.ojos, T.ojos + 0.1, "alarma"],
    [T.capullo, T.capullo + 0.15, "abajo"], [T.mirase + 0.25, T.mirase + 0.35, "camara"], [T.salto0 - 0.12, T.salto0, "decide"],
    [T.atras, T.atras + 0.08, "atras"], [T.gira2_0 + 0.06, T.gira2_0 + 0.15, "gira"], [T.mareo0, T.mareo0 + 0.2, "mareo"],
    [T.mareo1, T.mareo1 + 0.12, "despierta"], [T.abraza0 + 0.1, T.abraza1, "calentito"], [T.camara2, T.camara2 + 0.18, "final"]
  ];
  const PARP_G = [2.6, 3.7, 4.95, T.capullo + 0.2, T.capullo + 0.5, 9.55, T.mareo1 + 0.02, T.mareo1 + 0.24, 14.3];
  const CU0 = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CU = o => Object.assign({}, CU0, o);
  const CUER_G = {
    frio: CU({ pel: 5, torso: 0.04, cab: 0.07, cdy: 7 }),
    alucina: CU({ pel: 2, torso: 0.0, cab: -0.04, cdy: 2 }),
    espera: CU({ pel: 2, torso: 0.02, cab: -0.06, cdy: 3 }),
    gozo: CU({ pel: 0, torso: -0.03, cab: -0.14, cdy: 0 }),
    capullo: CU({}),
    mareo: CU({ pel: 6, torso: 0, cab: 0.04 }),
    feliz: CU({ pel: 4, torso: 0.04, cab: 0.2, cdy: 14 }),
    final: CU({ pel: 0, torso: 0.0, cab: 0.02 })
  };
  const GUION_CUG = [
    [T.alucina0, T.alucina0 + 0.2, "alucina"], [T.alucina1, T.alucina1 + 0.3, "frio"], [T.alza0, T.alza0 + 0.2, "espera"],
    [T.gira0, T.gira0 + 0.3, "gozo"], [T.tapa - 0.1, T.tapa + 0.02, "capullo"], [T.mareo0, T.mareo0 + 0.2, "mareo"],
    [T.abraza0, T.abraza1, "feliz"], [T.camara2, T.camara2 + 0.3, "final"]
  ];
  const XG = [[0, 380], [T.salto0, 380], [T.salto0 + T.saltoD, 357], [T.salto1, 357], [T.salto1 + T.saltoD, 335], [T.salto2, 335], [T.salto2 + T.saltoD, 314],
    [T.tiron, 314], [T.arrastre1, 446], [DUR, 446]];
  const xG = t => t > T.tiron && t < T.arrastre1 ? lerp(314, 446, 0.8 * salida(fase(t, T.tiron, T.arrastre1)) + 0.2 * suave(fase(t, T.tiron, T.arrastre1))) : recorrido(XG, t);
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const altoSalto = t => { let a = 0; for (const t0 of [T.salto0, T.salto1, T.salto2]) a = Math.max(a, 13 * campana(t, t0 + 0.04, t0 + T.saltoD - 0.02)); return a; };
  const aplasta = t => { let a = 0; for (const t0 of [T.salto0, T.salto1, T.salto2]) { a = Math.max(a, campana(t, t0 - 0.08, t0 + 0.06), campana(t, t0 + T.saltoD - 0.06, t0 + T.saltoD + 0.1) * 0.8); } return a; };
  // bloqueo de la cabeza al torso mientras hay vueltas en la cara
  const pegada = t => t < T.des0 ? tramo(t, T.envCuello - 0.12, T.envCuello) : 1 - tramo(t, T.des1 - 0.2, T.des1 + 0.05);

  function poseG(t) {
    const b = guion(GUION_CUG, CUER_G, "frio", t);
    const x0 = xG(t), respira = Math.sin(t * 2.3);
    const frio = 1 - tramo(t, T.alza0, T.cae);
    const tirita = frio * (1 - campana(t, T.alucina0, T.alucina1) * 0.7);
    const x = x0 + (0.9 * Math.sin(t * 43) + 0.6 * Math.sin(t * 67 + 1)) * tirita;
    const p = { x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 }, torso: b.torso + 0.008 * Math.sin(t * 51) * tirita,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab + 0.012 * Math.sin(t * 39) * tirita, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // asiente con ganas
    p.cabeza.ang += 0.11 * Math.sin((t - T.asiente0) * 19) * campana(t, T.asiente0, T.asiente1);
    p.pelvis.y -= 14 * campana(t, T.asiente0 + 0.1, T.asiente1 - 0.05);
    // piernas: separadas; juntas (de capullo) desde que se le tapan
    const junta = t > T.bolsillos ? 1 - tramo(t, T.des1 - 0.4, T.des1) : tramo(t, T.bolsillos - 0.2, T.bolsillos);
    const sepC = lerp(190, 222, junta), sepL = lerp(330, 290, junta);
    p.piernas.cerca = { tob: P(sepC, TOB_G.cerca), ang: 0 };
    p.piernas.lejos = { tob: P(sepL, TOB_G.lejos), ang: 0 };
    // capullo: se bambolea al parar
    const bam = t > T.gira1 - 0.05 && t < T.salto0 ? Math.exp(-(t - T.gira1) * 3.5) * Math.sin((t - T.gira1) * 11) * tramo(t, T.gira1 - 0.05, T.gira1 + 0.05) : 0;
    p.torso += 0.045 * bam;
    // mareo: el cuerpo da vueltecitas
    const mar = tramo(t, T.mareo0 - 0.05, T.mareo0 + 0.2) * (1 - tramo(t, T.mareo1 - 0.1, T.mareo1 + 0.25));
    p.torso += 0.07 * Math.sin((t - T.mareo0) * 5.6) * mar; p.cabeza.ang += 0.12 * Math.sin((t - T.mareo0) * 5.6 + 0.9) * mar;
    p.pelvis.y += 5 * Math.cos((t - T.mareo0) * 5.6) * mar;
    // se despeja: sacude la cabeza
    p.cabeza.ang += 0.1 * Math.sin((t - T.mareo1) * 30) * campana(t, T.mareo1, T.mareo1 + 0.28);
    // cabeza pegada al torso mientras está envuelto
    const pg = pegada(t);
    if (pg > 0) { p.cabeza.ang = lerp(p.cabeza.ang, p.torso, pg); p.cabeza.dy = lerp(p.cabeza.dy, 0, pg); }
    // giro de peonza
    const g1 = giro1(t), g2 = giro2(t);
    p.giro = t < T.tiron ? g1 : g2;
    p.girando = (t > T.gira0 && t < T.gira1) || (t > T.gira2_0 && t < T.gira2_1);
    p.alto = altoSalto(t); p.aplasta = aplasta(t);
    // cara
    const e = guion(GUION_CG, CG, "frio", t);
    e.abre += (4 + 5 * Math.abs(Math.sin(t * 36))) * frio * (1 - campana(t, T.alucina0, T.alucina1)) * 0.9;   // castañetea
    if (t < T.cae) e.my = lerp(e.my, 0.5, campana(t, T.teje0, T.alucina0) * 0.6);   // mira el punto
    // ojos inquietos dentro del capullo
    if (t > T.ojos + 0.1 && t < T.capullo) { const k = Math.sin(t * 5.3); e.mx = 0.8 * Math.sign(k) * Math.min(1, Math.abs(k) * 3); }
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.0;
    p.sudor = 0.55 * campana(t, T.capullo + 0.4, T.tiron + 0.1);
    manosG(t, p);
    return p;
  }
  // manos de Guillermo: abrazado a sí mismo (frío) → bolsillos → a la bufanda
  function manosG(t, p) {
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bc = bolsillo(G, p, "cerca"), bl = bolsillo(G, p, "lejos");
    const frote = 9 * Math.sin(t * 8.5) * (1 - tramo(t, T.alza0, T.cae));
    const muH = (m, h, d) => Math.atan2(h.y - m.y, h.x - m.x) + d;
    const hugC = () => { const m = Tr(P(296, 452 + frote)); return { x: m.x, y: m.y, ang: 0, mu: muH(m, hc, 0.25), dobla: 1, puno: 1, dedos: D(0.55, 0.75, 0.7, 0.6) }; };
    const hugL = () => { const m = Tr(P(188, 470 - frote)); return { x: m.x, y: m.y, ang: 0, mu: muH(m, hl, -0.2), dobla: -1, puno: 1, dedos: D(0.55, 0.75, 0.7, 0.6) }; };
    const agarraC = () => bc, agarraL = () => bl;
    const kB = tramo(t, T.bolsillos - 0.12, T.bolsillos + 0.2), kA = tramo(t, T.abraza0, T.abraza1);
    p.manoCerca = mezclaMano(mezclaMano(hugC(), bc, kB), agarraC(), kA);
    p.manoLejos = mezclaMano(mezclaMano(hugL(), bl, kB), agarraL(), kA);
  }

  /* =====================================================================================
   * MARTA (a la derecha, mira a la izquierda)
   * ===================================================================================== */
  const CM = {
    teje: E({ mx: 0.55, my: 0.85, c: 0.35, sd: 4, si: 4, sonr: 0.45, ancho: 0.9 }),
    rapida: E({ mx: 0.55, my: 0.9, c: 0.42, sd: -4, gd: -0.08, si: -4, gi: -0.08, sonr: 0.6, abre: 7, ancho: 0.8, lengua: 0.9 }),
    dulce: E({ mx: 0.9, my: 0.15, c: 0.25, h: 0.4, sd: 10, si: 10, sonr: 0.85, ancho: 1, rub: 0.3 }),
    ofrece: E({ mx: 0.9, my: 0, sd: 22, gd: 0.12, si: 22, gi: 0.12, sonr: 0.8, abre: 8, ancho: 0.9 }),
    lanza: E({ mx: 0.85, my: -0.35, c: 0.2, sd: 10, si: 10, sonr: 0.9, abre: 10, ancho: 1 }),
    picara: E({ mx: 0.9, my: 0.1, c: 0.35, sd: 16, gd: 0.1, si: -2, gi: -0.06, sonr: 0.9, ancho: 1 }),
    da: E({ mx: 0.9, my: 0.15, c: 0.25, sd: 8, si: 8, sonr: 0.75, ancho: 0.95 }),
    risa: E({ mx: 0.6, my: 0.2, c: 1, h: 1, sd: 14, si: 14, sonr: 1, abre: 18, ancho: 1.05, rub: 0.5 }),
    malvada: E({ mx: 0.9, my: 0.1, c: 0.4, sd: -6, gd: -0.14, si: 18, gi: 0.12, sonr: 0.95, ancho: 1.05 }),
    tira: E({ mx: 0.7, my: 0.2, c: 0.8, z: 1, sd: -4, si: -4, sonr: 0.7, abre: 16, ancho: 1.1 }),
    recoge: E({ mx: 0.85, my: 0.15, c: 0.3, sd: 10, si: 10, sonr: 0.9, abre: 10, ancho: 1 }),
    corta: E({ mx: 0.85, my: 0.25, c: 0.3, sd: 6, si: 6, sonr: 0.5, abre: 6, ancho: 0.8, lengua: 1 }),
    tachan: E({ mx: -0.6, my: 0, c: 0.25, h: 0.5, sd: 14, si: 14, sonr: 1, abre: 10, ancho: 1 }),
    guino: E({ mx: -0.85, my: -0.05, h: 1, cd: 1, sd: 6, si: 16, gi: 0.12, sonr: 1, abre: 8, ancho: 1.05, rub: 0.3 })
  };
  const GUION_CM = [
    [T.tejeA - 0.1, T.tejeA + 0.1, "rapida"], [T.sonrM0, T.sonrM0 + 0.15, "dulce"], [T.sonrM1, T.sonrM1 + 0.2, "rapida"],
    [T.teje1, T.teje1 + 0.15, "teje"], [T.alza0, T.alza0 + 0.15, "ofrece"], [T.carga0 + 0.1, T.lanza, "lanza"],
    [T.dedo0, T.dedo0 + 0.1, "picara"], [T.gira0 + 0.1, T.gira0 + 0.3, "da"], [T.risa0, T.risa0 + 0.12, "risa"],
    [T.agarra0, T.agarra0 + 0.15, "malvada"], [T.tiron - 0.06, T.tiron + 0.02, "tira"], [T.tiron + 0.4, T.tiron + 0.6, "recoge"],
    [T.tijera1 - 0.1, T.tijera1, "corta"], [T.snip2 + 0.05, T.snip2 + 0.2, "tachan"], [T.guino - 0.06, T.guino + 0.06, "guino"]
  ];
  const PARP_M = [1.3, 3.0, 4.75, 6.6, 7.6, 10.2, 12.0, 14.25];
  const CUER_M = {
    base: CU({ torso: 0.02, cab: 0.03 }),
    teje: CU({ pel: 4, torso: 0.06, cab: 0.16, cdy: 4 }),
    mira: CU({ pel: 2, torso: 0.03, cab: 0.04 }),
    ofrece: CU({ torso: -0.02, cab: -0.06 }),
    carga: CU({ pel: 10, torso: -0.08, cab: -0.02 }),
    lanza: CU({ pel: 0, torso: 0.1, cab: -0.08 }),
    da: CU({ pel: 4, torso: 0.05, cab: 0.06 }),
    risa: CU({ pel: 6, torso: 0.1, cab: 0.1 }),
    carga2: CU({ pel: 16, torso: 0.1, cab: 0.06 }),
    tira: CU({ pel: 22, torso: -0.24, cab: -0.12 }),
    recoge: CU({ pel: 10, torso: -0.08, cab: 0.0 }),
    corta: CU({ pel: 4, torso: 0.08, cab: 0.08 }),
    final: CU({ torso: 0.0, cab: -0.04 })
  };
  const GUION_CUM = [
    [T.teje0 - 0.2, T.teje0, "teje"], [T.sonrM0, T.sonrM0 + 0.2, "mira"], [T.sonrM1, T.sonrM1 + 0.2, "teje"], [T.teje1, T.guarda1, "base"],
    [T.alza0, T.alza1, "ofrece"], [T.carga0, T.lanza - 0.05, "carga"], [T.lanza - 0.05, T.lanza + 0.12, "lanza"], [T.dedo0, T.dedo1, "base"],
    [T.gira0, T.gira0 + 0.3, "da"], [T.risa0, T.risa0 + 0.2, "risa"], [T.risa1 - 0.1, T.agarra1, "carga2"], [T.agarra1 + 0.12, T.tiron + 0.04, "tira", salida],
    [T.tiron + 0.15, T.tiron + 0.5, "recoge"], [T.tijera0, T.corta1, "corta"], [T.snip2 + 0.05, T.baja1, "final"]
  ];
  const XM = [[0, 650], [T.pasoM0, 650], [T.pasoM1, 638], [DUR, 638]];
  const PASOS_M = { lejos: [[-9, -8, 632], [T.pasoM0, T.pasoM0 + 0.2, 619, 10]], cerca: [[-9, -8, 668], [T.pasoM0 + 0.14, T.pasoM1, 656, 9]] };
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 10] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }

  function poseM(t, pg) {
    const b = guion(GUION_CUM, CUER_M, "base", t), x = recorrido(XM, t), respira = Math.sin(t * 2.1 + 0.8);
    const p = { x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: M.PELVIS.x, y: M.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }, pelo: { viento: 0.15 * Math.sin(t * 0.7), inercia: 0 } };
    // risa: se le mueven los hombros
    const ri = campana(t, T.risa0, T.risa1);
    p.pelvis.y += 3 * Math.abs(Math.sin(t * 16)) * ri; p.cabeza.ang += 0.03 * Math.sin(t * 16) * ri;
    // mano sobre mano al recoger: el cuerpo acompaña
    const re = tramo(t, T.tiron + 0.1, T.tiron + 0.3) * (1 - tramo(t, T.des1 - 0.2, T.des1));
    p.torso += 0.04 * Math.sin((t - T.tiron) * 13) * re;
    // al tirar: inercia del pelo
    p.pelo.inercia = -0.8 * campana(t, T.tiron - 0.1, T.tiron + 0.35) + 0.5 * campana(t, T.lanza - 0.05, T.lanza + 0.35);
    const ty = M.SUELO - M.TOBILLO_ALTO;
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_M[lado], t);
      p.piernas[lado] = { tob: P(M.PELVIS.x + (x - f.x) / (S * M.K), (lado === "lejos" ? ty - 10 : ty) - f.alza / (S * M.K)), ang: f.alza > 1 ? -0.14 * Math.sin(Math.PI * f.u) : 0 };
    }
    const e = guion(GUION_CM, CM, "teje", t);
    p.cara = cara(e, parpadeo(t, PARP_M));
    manosM(t, p, pg);
    return p;
  }
  // puntos de agarre de Marta en pantalla (respecto a su x)
  const agujaF = t => { const ph = faseAgujas(t); return { ph, a: Math.sin(ph), b: Math.sin(ph + Math.PI) }; };
  function manosM(t, p, pg) {
    const x = p.x, V = velAgujas(t), am = 4.6 * clamp(V / 6);
    const ag = agujaF(t);
    const tejeL = q => manoEn(M, q, "lejos", P(x - 42, 350 + am * ag.a), { dedos: AGARRA });
    const tejeC = q => manoEn(M, q, "cerca", P(x - 14, 354 + am * ag.b), { dedos: AGARRA });
    const juntaC = q => manoEn(M, q, "cerca", P(x - 30, 352), { dedos: AGARRA });
    const alzaL = q => manoEn(M, q, "lejos", P(x - 64, 316), { dedos: AGARRA });
    const sostenC = q => manoEn(M, q, "cerca", P(x - 10, 366), { dedos: AGARRA });
    const cargaL = q => manoEn(M, q, "lejos", P(x - 26, 374), { dedos: AGARRA });
    const sueltaL = q => manoEn(M, q, "lejos", P(x - 108, 300), { dedos: D(0.9, 1, 1, 1) });
    const dedoL = q => { const a = (t - T.dedo0) * 22; return manoEn(M, q, "lejos", P(x - 84 + 6 * Math.cos(a), 282 + 5 * Math.sin(a)), { dedos: D(0, 1, 0, 0) }); };
    const mano = (t0, sg) => 7 * Math.sin((t - t0) * 13 + sg);
    const daL = q => manoEn(M, q, "lejos", P(x - 44, 344 + mano(T.gira0, 0)), { dedos: AGARRA });
    const daC = q => manoEn(M, q, "cerca", P(x - 14, 352 + mano(T.gira0, Math.PI)), { dedos: AGARRA });
    const bocaL = q => { const b = M.aPantalla(q, M.boca(q)); return manoEn(M, q, "lejos", P(b.x + 4, b.y + 6), { dedos: D(0.7, 1, 1, 1) }); };
    const tiraL = q => manoEn(M, q, "lejos", P(x - 30, 352), { dedos: AGARRA });
    const tiraC = q => manoEn(M, q, "cerca", P(x - 6, 362), { dedos: AGARRA });
    const fase2 = (t - T.tiron) * 12.5;
    const recL = q => manoEn(M, q, "lejos", P(x - 38 + 12 * Math.sin(fase2), 352 + 16 * Math.sin(fase2 + 1.2)), { dedos: AGARRA });
    const recC = q => manoEn(M, q, "cerca", P(x - 12 + 10 * Math.sin(fase2 + Math.PI), 362 + 14 * Math.sin(fase2 + Math.PI + 1.2)), { dedos: AGARRA });
    const holdC = q => manoEn(M, q, "cerca", P(x - 14, 350), { dedos: AGARRA });
    const cortaL = q => { const c = p.corte; return manoEn(M, q, "lejos", P(c.x + 16, c.y + 16), { dedos: AGARRA }); };
    const ensenaL = q => manoEn(M, q, "lejos", P(x - 82, 318 + 4 * Math.sin((t - T.baja1) * 9) * tramo(t, T.guino - 0.2, T.guino)), { dedos: AGARRA });
    const bolL = q => bolsillo(M, q, "lejos"), bolC = q => bolsillo(M, q, "cerca");
    p.manoCerca = pista([
      [0, 0, tejeC], [T.teje1 + 0.02, T.guarda0 + 0.2, juntaC], [T.guarda0 + 0.2, T.guarda1, bolC],
      [T.guarda1 - 0.05, T.alza1, sostenC], [T.gira0 - 0.04, T.gira0 + 0.12, daC], [T.risa0 - 0.05, T.risa0 + 0.15, holdC],
      [T.agarra0, T.agarra1, tiraC], [T.tiron + 0.05, T.tiron + 0.18, recC], [T.des1, T.des1 + 0.2, holdC], [T.suelta, T.suelta + 0.25, bolC]
    ], t, p);
    p.corte = t > T.tijera0 - 0.05 ? (t <= T.snip1 ? corteAhora(t, pg, p) : corteFijo()) : P(530, 276);
    p.manoLejos = pista([
      [0, 0, tejeL], [T.teje1 + 0.02, T.guarda0 + 0.2, juntaC], [T.guarda0 + 0.2, T.alza1, alzaL],
      [T.carga0, T.lanza - 0.03, cargaL], [T.lanza - 0.03, T.lanza + 0.08, sueltaL, salida], [T.dedo0 - 0.06, T.dedo0 + 0.06, dedoL],
      [T.gira0 - 0.04, T.gira0 + 0.12, daL], [T.risa0 - 0.05, T.risa0 + 0.2, bocaL], [T.risa1, T.agarra1, tiraL],
      [T.tiron + 0.05, T.tiron + 0.18, recL], [T.tijera0, T.tijera0 + 0.18, bolL], [T.tijera0 + 0.2, T.corta1, cortaL],
      [T.suelta, T.baja1, ensenaL], [13.75, 14.1, bolL]
    ], t, p);
  }
  // tensión (comba) de la tira entre Marta y Guillermo
  const comba = t => 18 + 16 * tramo(t, T.capullo, T.capullo + 0.18)
    - 28 * tramo(t, T.agarra1, T.tiron) + 12 * tramo(t, T.des1, T.des1 + 0.18);
  const CORTE_D = 44;
  function controlesTira(t, fin, cM, lM) {
    const toma = tramo(t, T.gira0 - 0.04, T.gira0 + 0.12) * (1 - tramo(t, T.risa0 - 0.08, T.risa0 + 0.02))
      + tramo(t, T.risa1, T.agarra1) * (1 - tramo(t, T.tijera0 - 0.1, T.tijera0));
    const a = mezcla(mezcla(fin, cM, 0.8), lM, toma);
    const mid = P(lerp(a.x, fin.x, 0.5), lerp(a.y, fin.y, 0.5) + comba(t));
    return [fin, mid, a, cM];
  }
  function tramoCorte(t, pg, pm) {
    const cM = centroMano(M, pm, pm.manoCerca);
    return curvaRemuestreada(controlesTira(t, enganche(t, pg), cM, cM), 4);
  }
  function corteAhora(t, pg, pm) { return enArco(tramoCorte(t, pg, pm), CORTE_D); }
  let corteGuardado, caboInicial;
  const corteFijo = () => corteGuardado || (corteGuardado = pose(T.snip1).m.corte);
  function caboCuello(t) {
    if (!caboInicial) {
      const { g, m } = pose(T.snip1), curva = tramoCorte(T.snip1, g, m);
      const cos = Math.cos(g.torso), sin = Math.sin(g.torso);
      caboInicial = [0, CORTE_D / 2, CORTE_D].map(s => {
        const q = G.aHoja(g, enArco(curva, s)), dx = q.x - g.pelvis.x, dy = q.y - g.pelvis.y;
        return P(G.PELVIS.x + (dx * cos + dy * sin) / g.torsoEsc.x, G.PELVIS.y + (-dx * sin + dy * cos) / g.torsoEsc.y);
      });
    }
    const [o, , e] = caboInicial, k = t - T.snip1;
    const giro = (Math.PI / 2 + 0.18 - Math.atan2(e.y - o.y, e.x - o.x)) *
      (1 - Math.exp(-k * 4.5) * (Math.cos(k * 9) + 0.5 * Math.sin(k * 9)));
    const cos = Math.cos(giro), sin = Math.sin(giro);
    return caboInicial.map(q => P(o.x + (q.x - o.x) * cos - (q.y - o.y) * sin, o.y + (q.x - o.x) * sin + (q.y - o.y) * cos));
  }
  let lanzamiento;
  function puntaVuelo(t) {
    if (!lanzamiento) {
      const m = pose(T.lanza).m, mano = centroMano(M, m, m.manoLejos);
      const ini = P(mano.x + 2, mano.y + 6), fin = enganche(T.cae, poseG(T.cae));
      lanzamiento = [ini, P((ini.x + fin.x) / 2, Math.min(ini.y, fin.y) - 120), fin];
    }
    const k = fase(t, T.lanza, T.cae), e = salida(k) * 0.4 + k * 0.6, [a, b, c] = lanzamiento;
    return mezcla(mezcla(a, b, e), mezcla(b, c, e), e);
  }
  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null;
  const FX = -60, FY = -50;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100;
    const g = c.getContext("2d"); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // cielo de hora azul
    let gr = g.createLinearGradient(0, -50, 0, 360);
    gr.addColorStop(0, "#111a3c"); gr.addColorStop(0.45, "#263873"); gr.addColorStop(0.8, "#4f5390"); gr.addColorStop(1, "#7a6aa0");
    g.fillStyle = gr; g.fillRect(-60, -50, W + 120, 420);
    // nubes de nieve muy suaves
    g.fillStyle = "rgba(190,200,235,0.08)";
    for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(hash(i) * W, 40 + hash(i + 7) * 120, 140 + 80 * hash(i + 3), 26, 0, 0, TAU); g.fill(); }
    // casas del fondo (fachadas hasta la acera) y tejados con nieve
    g.fillStyle = "#222b52"; g.fillRect(-60, 300, 530, 180);
    g.fillStyle = "rgba(255,206,120,0.8)";
    for (const [x, y] of [[-30, 370], [20, 392], [90, 365], [180, 380], [262, 368], [330, 392], [400, 372], [430, 420], [-10, 430], [120, 425]]) { g.fillRect(x, y, 14, 18); }
    g.fillStyle = "#1a2244"; for (const [x, y] of [[-30, 370], [20, 392], [90, 365], [180, 380], [262, 368], [330, 392], [400, 372], [430, 420], [-10, 430], [120, 425]]) { g.fillRect(x + 6, y, 2, 18); g.fillRect(x, y + 8, 14, 2); }
    g.fillStyle = "#1c2447"; g.fillRect(-60, 446, 530, 30);
    g.fillStyle = "#e9eef8"; g.beginPath(); g.moveTo(-60, 448); for (let x = -60; x < 470; x += 22) g.quadraticCurveTo(x + 11, 440 - 4 * hash(x + 9), x + 22, 448); g.lineTo(470, 452); g.lineTo(-60, 452); g.closePath(); g.fill();
    g.fillStyle = "#28335e";
    g.beginPath(); g.moveTo(-60, 360);
    const tej = [[-60, 300], [30, 300], [30, 270], [110, 240], [190, 270], [190, 290], [250, 290], [250, 255], [300, 230], [360, 255], [360, 300], [420, 300], [420, 280], [470, 280], [470, 360]];
    for (const [x, y] of tej) g.lineTo(x, y); g.closePath(); g.fill();
    g.strokeStyle = "#dfe7f6"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(30, 270); g.lineTo(110, 240); g.lineTo(190, 270); g.moveTo(250, 255); g.lineTo(300, 230); g.lineTo(360, 255); g.moveTo(-60, 300); g.lineTo(30, 300); g.moveTo(420, 280); g.lineTo(470, 280); g.stroke();
    // chimeneas
    for (const [x, y] of [[70, 238], [320, 222]]) { g.fillStyle = "#1f2850"; g.fillRect(x, y, 14, 30); g.fillStyle = "#e6ecf8"; g.fillRect(x - 2, y - 4, 18, 6); }
    // ventanitas encendidas en las casas
    g.fillStyle = "rgba(255,206,120,0.85)";
    for (const [x, y] of [[60, 312], [140, 300], [210, 315], [280, 300], [330, 318], [440, 318], [95, 335]]) g.fillRect(x, y, 10, 13);
    // la acera nevada
    gr = g.createLinearGradient(0, 470, 0, 650);
    gr.addColorStop(0, "#c4cfe6"); gr.addColorStop(0.35, "#dfe6f4"); gr.addColorStop(1, "#f1f5fc");
    g.fillStyle = gr; g.fillRect(-60, 470, W + 120, 190);
    // fachada del bar (verde) de 455 en adelante
    const X0 = 455, YT = 40, YB = 474;
    g.fillStyle = "#24433f"; g.fillRect(X0, YT, W + 60 - X0, YB - YT);
    g.fillStyle = "rgba(0,0,0,0.12)"; for (let x = X0 + 12; x < W + 60; x += 26) g.fillRect(x, YT, 3, YB - YT);   // tablas
    g.fillStyle = "#1a312e"; g.fillRect(X0, YB - 40, W + 60 - X0, 40);   // zócalo
    g.fillStyle = "#e9dfc6"; g.fillRect(X0, YT, W + 60 - X0, 10); g.fillRect(X0 - 6, YT, 12, YB - YT);   // moldura y canto
    g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(X0 - 8, YB - 6, W + 70 - X0, 8);
    // nieve en el borde de la acera junto a la pared
    g.fillStyle = "#eef3fb"; g.beginPath(); g.moveTo(X0 - 10, YB + 4);
    for (let x = X0 - 10; x <= W + 60; x += 20) g.quadraticCurveTo(x + 10, YB - 6 - 4 * hash(x), x + 20, YB + 2);
    g.lineTo(W + 60, YB + 10); g.lineTo(X0 - 10, YB + 10); g.closePath(); g.fill();
    // ventanal encendido
    const vx0 = 470, vx1 = 640, vy0 = 186, vy1 = 404;
    gr = g.createLinearGradient(0, vy0, 0, vy1); gr.addColorStop(0, "#ffd88e"); gr.addColorStop(0.6, "#f7b45a"); gr.addColorStop(1, "#d98638");
    g.fillStyle = "#e9dfc6"; g.fillRect(vx0 - 12, vy0 - 12, vx1 - vx0 + 24, vy1 - vy0 + 26);
    g.fillStyle = gr; g.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
    // dentro: barra, botellas y lámpara en silueta cálida
    g.fillStyle = "rgba(120,54,20,0.55)"; g.fillRect(vx0, 330, vx1 - vx0, 74);
    g.fillStyle = "rgba(140,64,24,0.45)";
    for (let i = 0; i < 9; i++) { const bx = vx0 + 14 + i * 17, bh = 26 + 10 * hash(i + 2); g.fillRect(bx, 300 - bh, 9, bh); g.fillRect(bx + 3, 300 - bh - 9, 3, 10); }
    g.fillRect(vx0, 300, vx1 - vx0, 5);
    g.beginPath(); g.moveTo(555, vy0); g.lineTo(555, 232); g.stroke();
    g.fillStyle = "rgba(255,240,190,0.95)"; g.beginPath(); g.ellipse(555, 240, 22, 9, 0, Math.PI, 0); g.fill();
    // cristales: travesaños
    g.fillStyle = "#e9dfc6"; g.fillRect(552, vy0, 7, vy1 - vy0); g.fillRect(vx0, 292, vx1 - vx0, 7);
    // escarcha en las esquinas
    g.fillStyle = "rgba(255,255,255,0.55)";
    for (const [cx, cy, sx, sy] of [[vx0, vy0, 1, 1], [vx1, vy0, -1, 1], [vx0, vy1, 1, -1], [vx1, vy1, -1, -1], [559, 299, 1, 1], [552, 292, -1, -1]]) {
      g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + sx * 34, cy + sy * 4, cx + sx * 40, cy); g.lineTo(cx, cy); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + sx * 4, cy + sy * 30, cx, cy + sy * 36); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(cx + sx * 9, cy + sy * 9, 12, 12, 0, 0, TAU); g.fill();
    }
    // vaho en el cristal de abajo
    g.fillStyle = "rgba(255,250,235,0.18)"; g.fillRect(vx0, 360, vx1 - vx0, 44);
    // alféizar con nieve
    g.fillStyle = "#cfc4a8"; g.fillRect(vx0 - 18, vy1 + 12, vx1 - vx0 + 36, 10);
    g.fillStyle = "#f4f7fd"; g.beginPath(); g.moveTo(vx0 - 20, vy1 + 13);
    for (let x = vx0 - 20; x < vx1 + 20; x += 24) g.quadraticCurveTo(x + 12, vy1 + 2 - 4 * hash(x + 1), x + 24, vy1 + 13);
    g.closePath(); g.fill();
    // toldo a rayas con nieve y carámbanos
    const ax0 = 452, ax1 = 658, ay0 = 128, ay1 = 166;
    for (let i = 0; i < 9; i++) {
      const x = lerp(ax0, ax1, i / 9), x2 = lerp(ax0, ax1, (i + 1) / 9);
      g.fillStyle = i % 2 ? "#e9dfc6" : "#2f6b54"; g.beginPath(); g.moveTo(x + 6, ay0); g.lineTo(x2 + 6, ay0); g.lineTo(x2, ay1); g.lineTo(x, ay1); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x, ay1); g.quadraticCurveTo((x + x2) / 2, ay1 + 14, x2, ay1); g.closePath(); g.fill();
    }
    g.strokeStyle = "#162825"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(ax0 + 6, ay0); g.lineTo(ax1 + 6, ay0); g.lineTo(ax1, ay1); g.stroke();
    g.fillStyle = "#f6f9ff"; g.beginPath(); g.moveTo(ax0 + 2, ay0 + 2);
    for (let x = ax0 + 2; x < ax1 + 8; x += 26) g.quadraticCurveTo(x + 13, ay0 - 14 - 6 * hash(x), x + 26, ay0 + 2);
    g.closePath(); g.fill();
    g.fillStyle = "rgba(225,240,255,0.9)";
    for (let i = 0; i < 12; i++) { const x = ax0 + 10 + i * 17 + 4 * hash(i), l = 8 + 12 * hash(i + 4); g.beginPath(); g.moveTo(x - 3, ay1 + 8); g.lineTo(x + 3, ay1 + 8); g.lineTo(x, ay1 + 8 + l); g.closePath(); g.fill(); }
    // puerta con corona
    const dx0 = 760, dx1 = 858, dy0 = 214;
    g.fillStyle = "#e9dfc6"; g.fillRect(dx0 - 10, dy0 - 10, dx1 - dx0 + 20, YB - dy0 + 10);
    g.fillStyle = "#5a3220"; g.fillRect(dx0, dy0, dx1 - dx0, YB - dy0);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 3; g.strokeRect(dx0 + 12, dy0 + 120, dx1 - dx0 - 24, 100);
    gr = g.createLinearGradient(0, dy0 + 14, 0, dy0 + 90); gr.addColorStop(0, "#ffd88e"); gr.addColorStop(1, "#e59a48");
    g.fillStyle = gr; g.fillRect(dx0 + 14, dy0 + 14, dx1 - dx0 - 28, 80);
    g.fillStyle = "#e9dfc6"; g.fillRect((dx0 + dx1) / 2 - 2, dy0 + 14, 4, 80);
    g.fillStyle = "#e0b04a"; g.beginPath(); g.arc(dx0 + 14, dy0 + 160, 5, 0, TAU); g.fill();
    // corona de abeto con lazo rojo
    const cx = (dx0 + dx1) / 2, cy = dy0 + 52;
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; g.fillStyle = i % 2 ? "#2f6a3c" : "#23532f"; g.beginPath(); g.ellipse(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24, 10, 7, a, 0, TAU); g.fill(); }
    g.fillStyle = "#d63a3a"; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.3; g.beginPath(); g.arc(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24, 3, 0, TAU); g.fill(); }
    g.fillStyle = "#c62f33"; g.beginPath(); g.moveTo(cx, cy + 22); g.lineTo(cx - 14, cy + 14); g.lineTo(cx - 14, cy + 30); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx, cy + 22); g.lineTo(cx + 14, cy + 14); g.lineTo(cx + 14, cy + 30); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx - 2, cy + 24); g.lineTo(cx - 8, cy + 44); g.lineTo(cx - 3, cy + 42); g.moveTo(cx + 2, cy + 24); g.lineTo(cx + 8, cy + 44); g.lineTo(cx + 3, cy + 42); g.fill();
    // farolillo de pared junto a la puerta
    g.fillStyle = "#1b1b1f"; g.fillRect(728, 214, 6, 18); g.fillRect(720, 226, 22, 6);
    g.fillStyle = "#ffe1a0"; g.fillRect(723, 232, 16, 20); g.fillStyle = "#1b1b1f"; g.fillRect(721, 252, 20, 4);
    // cartel colgante con una jarra (sin letras)
    g.strokeStyle = "#1b1b1f"; g.lineWidth = 4; g.beginPath(); g.moveTo(900, 120); g.lineTo(970, 120); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(912, 120); g.lineTo(912, 140); g.moveTo(958, 120); g.lineTo(958, 140); g.stroke();
    g.fillStyle = "#6b4126"; g.fillRect(898, 140, 74, 52); g.strokeStyle = "#e9dfc6"; g.lineWidth = 3; g.strokeRect(902, 144, 66, 44);
    g.fillStyle = "#f2b33d"; g.fillRect(924, 152, 18, 28); g.fillStyle = "#fff6e2"; g.fillRect(922, 148, 22, 7);
    g.strokeStyle = "#f2b33d"; g.lineWidth = 3; g.beginPath(); g.arc(944, 165, 6, -1.4, 1.4); g.stroke();
    g.fillStyle = "#f6f9ff"; g.fillRect(896, 136, 78, 6);
    // abetito con lucecitas junto a la puerta
    g.fillStyle = "#6b4126"; g.fillRect(906, 440, 26, 30);
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#245a35" : "#1d4b2c"; g.beginPath(); g.moveTo(919, 330 + i * 26); g.lineTo(919 - 26 - i * 6, 380 + i * 22); g.lineTo(919 + 26 + i * 6, 380 + i * 22); g.closePath(); g.fill(); }
    g.fillStyle = "#f4f8ff"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(919 - 8 + i * 3, 356 + i * 26, 14 + i * 3, 3, -0.2, 0, TAU); g.fill(); }
    // farola de la izquierda (el halo se pinta cada fotograma)
    g.fillStyle = "#1c1f2c"; g.fillRect(146, 140, 8, 340); g.fillRect(138, 470, 24, 12); g.fillRect(140, 300, 20, 6);
    g.beginPath(); g.moveTo(132, 108); g.lineTo(168, 108); g.lineTo(162, 140); g.lineTo(138, 140); g.closePath(); g.fill();
    g.fillStyle = "#ffe6aa"; g.beginPath(); g.moveTo(136, 112); g.lineTo(164, 112); g.lineTo(159, 136); g.lineTo(141, 136); g.closePath(); g.fill();
    g.fillStyle = "#1c1f2c"; g.beginPath(); g.moveTo(128, 108); g.lineTo(150, 92); g.lineTo(172, 108); g.closePath(); g.fill();
    g.fillStyle = "#f6f9ff"; g.beginPath(); g.ellipse(150, 94, 18, 6, 0, Math.PI, 0); g.fill();
    // banco nevado
    g.fillStyle = "#3c2a22"; g.fillRect(230, 440, 6, 38); g.fillRect(330, 440, 6, 38); g.fillRect(222, 432, 124, 10); g.fillRect(226, 404, 116, 7); g.fillRect(226, 416, 116, 7);
    g.fillStyle = "#f4f7fd"; g.beginPath(); g.moveTo(220, 433);
    for (let x = 220; x < 348; x += 16) g.quadraticCurveTo(x + 8, 424 - 3 * hash(x), x + 16, 433); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(284, 404, 60, 4, 0, Math.PI, 0); g.fill();
    // luz del ventanal sobre la nieve
    gr = g.createLinearGradient(0, 474, 0, 650); gr.addColorStop(0, "rgba(255,196,110,0.32)"); gr.addColorStop(1, "rgba(255,196,110,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(462, 474); g.lineTo(648, 474); g.lineTo(720, 650); g.lineTo(410, 650); g.closePath(); g.fill();
    // charco de luz de la farola
    gr = g.createRadialGradient(150, 520, 10, 150, 520, 150); gr.addColorStop(0, "rgba(255,214,140,0.30)"); gr.addColorStop(1, "rgba(255,214,140,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(150, 520, 160, 50, 0, 0, TAU); g.fill();
    // huellas en la nieve (de la izquierda hasta Guillermo, y de la puerta hasta Marta)
    g.fillStyle = "rgba(110,130,180,0.22)";
    for (let i = 0; i < 9; i++) { const x = -20 + i * 40, y = 586 - i * 2.6 + (i % 2 ? 6 : -6); g.beginPath(); g.ellipse(x, y, 9, 4, -0.1, 0, TAU); g.fill(); }
    for (let i = 0; i < 6; i++) { const x = 800 - i * 26, y = 492 + i * 9 + (i % 2 ? 5 : -5); g.beginPath(); g.ellipse(x, y, 8, 3.5, 0.3, 0, TAU); g.fill(); }
    // bordillo y brillos de la nieve
    g.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(hash(i + 40) * (W + 100) - 50, 490 + hash(i + 90) * 150, 1 + hash(i + 3) * 1.2, 0, TAU); g.fill(); }
    return c;
  }
  // copos (deterministas): dos capas
  const COPOS = { lejos: [], cerca: [] };
  for (let i = 0; i < 110; i++) COPOS.lejos.push({ x: hash(i * 3.1) * (W + 80) - 40, y: hash(i * 5.7 + 1) * 700, v: 26 + 22 * hash(i + 11), r: 1 + 1.3 * hash(i + 21), a: hash(i + 31) * TAU, f: 0.6 + hash(i + 41) });
  for (let i = 0; i < 26; i++) COPOS.cerca.push({ x: hash(i * 7.3 + 5) * (W + 80) - 40, y: hash(i * 2.9 + 3) * 700, v: 60 + 40 * hash(i + 51), r: 2.4 + 1.8 * hash(i + 61), a: hash(i + 71) * TAU, f: 0.5 + hash(i + 81) });
  function nieve(g, t, capa) {
    const L = COPOS[capa];
    g.save(); g.fillStyle = capa === "cerca" ? "rgba(255,255,255,0.85)" : "rgba(235,242,255,0.75)";
    g.beginPath();
    for (const c of L) {
      const y = ((c.y + c.v * t) % 680) - 40, x = c.x + 14 * Math.sin(t * c.f + c.a) + 8 * t * (capa === "cerca" ? 1.2 : 0.6);
      const xx = ((x + 40) % (W + 80) + (W + 80)) % (W + 80) - 40;
      g.moveTo(xx + c.r, y); g.arc(xx, y, c.r, 0, TAU);
    }
    g.fill(); g.restore();
  }
  function halos(g, t) {
    const k = 0.92 + 0.08 * Math.sin(t * 2.3);
    let gr = g.createRadialGradient(150, 124, 6, 150, 124, 90);
    gr.addColorStop(0, `rgba(255,224,150,${0.55 * k})`); gr.addColorStop(1, "rgba(255,224,150,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(150, 124, 90, 0, TAU); g.fill();
    gr = g.createRadialGradient(731, 242, 4, 731, 242, 48);
    gr.addColorStop(0, "rgba(255,224,150,0.5)"); gr.addColorStop(1, "rgba(255,224,150,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(731, 242, 48, 0, TAU); g.fill();
    // lucecitas del abeto
    const cols = ["#ffd75e", "#ff6a5e", "#8fd3ff", "#ffd75e", "#b6ff8a"];
    for (let i = 0; i < 10; i++) { const x = 919 + (hash(i + 5) - 0.5) * (30 + i * 5), y = 350 + i * 10; const on = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
      g.fillStyle = cols[i % 5]; g.globalAlpha = 0.5 + 0.5 * on; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
  }

  /* =====================================================================================
   * ATREZO
   * ===================================================================================== */
  // cesta de mimbre con dos ovillos (rojo y crema) que giran mientras teje
  function cesta(g, t, x, y) {
    const giro = tejido(t) / 9;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(60,70,110,0.25)"; g.beginPath(); g.ellipse(x, y + 2, 34, 6, 0, 0, TAU); g.fill();
    // ovillos (detrás del borde de la cesta)
    const enc = 1 - 0.28 * clamp((tejido(t) - L0) / (LMAX - L0));
    for (const [ox, col, osc, r0, sg] of [[-11, B.rojo, B.rojoOsc, 13, 1], [10, B.crema, B.cremaOsc, 12, -1]]) {
      const r = r0 * enc, cx = x + ox + 1.2 * Math.sin(t * 40) * clamp(velAgujas(t) / 6), cy = y - 18 - r * 0.4;
      g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = col; g.fill();
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
      g.strokeStyle = osc; g.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) { const a = sg * giro + i * 0.63; g.beginPath(); g.ellipse(cx, cy, r * 1.05, r * 0.35, a, 0, TAU); g.stroke(); }
      g.restore();
      g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.lineWidth = 1.8; g.strokeStyle = B.tinta; g.stroke();
    }
    // cesta
    g.fillStyle = "#b8874e"; g.beginPath(); g.moveTo(x - 30, y - 22); g.lineTo(x + 30, y - 22); g.lineTo(x + 24, y); g.lineTo(x - 24, y); g.closePath(); g.fill();
    g.strokeStyle = "#7d5629"; g.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 29 + i * 1.5, y - 17 + i * 5); g.lineTo(x + 29 - i * 1.5, y - 17 + i * 5); g.stroke(); }
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(x + i * 8.5, y - 22); g.lineTo(x + i * 7, y); g.stroke(); }
    g.fillStyle = "#9c6e3a"; g.beginPath(); g.ellipse(x, y - 22, 31, 4, 0, 0, TAU); g.fill();
    g.strokeStyle = B.tinta; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x - 30, y - 22); g.lineTo(x - 24, y); g.lineTo(x + 24, y); g.lineTo(x + 30, y - 22); g.stroke();
    g.fillStyle = "#f6f9ff"; g.beginPath(); g.ellipse(x - 14, y - 23, 8, 2.4, 0, Math.PI, 0); g.fill();
    g.restore();
    return { rojo: P(x - 11, y - 30), crema: P(x + 10, y - 29) };
  }
  // aguja de punto desde el puño (pantalla): de madera, con punta y bola en el otro extremo
  function aguja(g, c, ang, largo, alfa = 1) {
    const dx = Math.cos(ang), dy = Math.sin(ang), a = P(c.x + dx * 5, c.y + dy * 5), b = P(c.x + dx * largo, c.y + dy * largo);
    g.save(); g.globalAlpha *= alfa; g.lineCap = "round";
    g.strokeStyle = B.tinta; g.lineWidth = 4.4; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    g.strokeStyle = "#e3bd84"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x - dx * 2, b.y - dy * 2); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 0.9; g.beginPath(); g.moveTo(a.x - dy * 0.6, a.y + dx * 0.6); g.lineTo(b.x - dx * 6, b.y - dy * 6); g.stroke();
    // bola del otro lado del puño
    const k = P(c.x - dx * 9, c.y - dy * 9);
    g.fillStyle = "#b8463a"; g.beginPath(); g.arc(k.x, k.y, 3.2, 0, TAU); g.fill(); g.lineWidth = 1.2; g.strokeStyle = B.tinta; g.stroke();
    g.restore();
  }
  // tijeritas (pantalla): c = puño, ang = hacia las puntas, ab = apertura (rad)
  const aperturaTijeras = t => 0.5 * (1 - campana(t, T.snip1 - 0.06, T.snip1 + 0.06)) * (1 - campana(t, T.snip2 - 0.06, T.snip2 + 0.06));
  function tijeras(g, c, ang, ab, esc = 1) {
    g.save(); g.translate(c.x, c.y); g.rotate(ang); g.scale(esc, esc); g.lineJoin = "round"; g.lineCap = "round";
    // anillas rojas (asoman por detrás del puño)
    for (const sg of [-1, 1]) {
      g.save(); g.translate(-2, sg * 4); g.rotate(-sg * ab * 0.5);
      g.beginPath(); g.ellipse(-6, sg * 3, 7, 5, 0, 0, TAU); g.lineWidth = 4.6; g.strokeStyle = B.tinta; g.stroke(); g.lineWidth = 3; g.strokeStyle = "#e0303e"; g.stroke();
      g.restore();
    }
    // hojas de metal
    for (const sg of [-1, 1]) {
      g.save(); g.translate(9, 0); g.rotate(sg * ab / 2);
      g.beginPath(); g.moveTo(-2, 0); g.lineTo(21, sg * -1.6); g.lineTo(23, 0); g.lineTo(-2, sg * 3.6); g.closePath();
      g.fillStyle = "#dfe6ef"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = B.tinta; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 1; g.beginPath(); g.moveTo(2, sg * 0.6); g.lineTo(18, sg * -0.6); g.stroke();
      g.restore();
    }
    g.fillStyle = "#6f7888"; g.beginPath(); g.arc(9, 0, 2, 0, TAU); g.fill();
    g.restore();
  }
  // vaho
  function vaho(g, t, b, lista, dir = 1, esc = 1) {
    for (const t0 of lista) {
      const k = fase(t, t0, t0 + 1.1); if (k <= 0 || k >= 1) continue;
      g.save(); g.globalAlpha = 0.5 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k);
      g.fillStyle = "#ffffff";
      for (let i = 0; i < 4; i++) { const kk = clamp(k * 1.4 - i * 0.12); g.beginPath(); g.arc(b.x + dir * (16 + 30 * kk + i * 6) * esc, b.y - (4 + 18 * kk + i * 2) * esc, (5 + 12 * kk) * esc * (1 - i * 0.15), 0, TAU); g.fill(); }
      g.restore();
    }
  }
  function estrellaPuntas(g, x, y, r, puntas, rot0, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot0 + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function corazon(g, x, y, r, a) {
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(r / 10, r / 10);
    g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-12, -2, -8, -12, 0, -6); g.bezierCurveTo(8, -12, 12, -2, 0, 6); g.closePath();
    g.fillStyle = "#ff5a6e"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = B.tinta; g.stroke(); g.restore();
  }

  /* =====================================================================================
   * POSTURA CONJUNTA Y GEOMETRÍA EN PANTALLA
   * ===================================================================================== */
  // hoja del torso de Guillermo → pantalla (antes del giro y del salto)
  const torsoAPantalla = (p, q) => G.aPantalla(p, G.tronco(p)(q));
  // transformación del giro y del salto (pantalla → pantalla)
  function transG(p) {
    const ax = p.x, gi = p.girando ? Math.cos(p.giro.ang) : 1, sx = Math.abs(gi) < 0.03 ? 0.03 * Math.sign(gi || 1) : gi;
    const ap = p.aplasta, sy = 1 - 0.07 * ap, sxs = 1 + 0.05 * ap;
    return q => ({ x: ax + (q.x - ax) * sx * sxs, y: SUELO + (q.y - SUELO) * sy - p.alto });
  }
  function pose(t) { const pg = poseG(t), pm = poseM(t, pg); return { g: pg, m: pm }; }

  // punto donde la bufanda sale de Guillermo (pantalla, ya girado)
  function enganche(t, pg) {
    const tr = transG(pg);
    const hombro = tr(torsoAPantalla(pg, P(362, 286)));
    if (t < T.env0) return hombro;
    const u = avance(t), kf = u * NV;
    let k = Math.min(NV - 1, Math.floor(kf)), fr = kf - k;
    if (t >= T.des0) { k = Math.min(NV - 1, Math.max(0, Math.ceil(kf) - 1)); fr = kf - k; }
    const borde = kk => { const [a, b] = extremos(VUELTAS[kk]); const A = tr(torsoAPantalla(pg, a)), Bp = tr(torsoAPantalla(pg, b)); return A.x > Bp.x ? A : Bp; };
    let q = borde(k);
    if (t < T.des0 && k < NV - 1) q = mezcla(q, borde(k + 1), tramo(fr, 0.72, 1));
    if (t >= T.des0 && k > 0) q = mezcla(q, borde(k - 1), 1 - tramo(fr, 0, 0.28));
    if (t < T.env0 + 0.12) q = mezcla(hombro, q, tramo(t, T.env0, T.env0 + 0.12));
    return q;
  }

  /* =====================================================================================
   * DIBUJO
   * ===================================================================================== */
  // puños de Marta otra vez, por encima de la bufanda que agarran
  function punosEncima(g, Pj, p, lados) {
    const k = p.s * Pj.K, col = { piel: Pj.C.piel, sombra: Pj.C.pielSombra, tinta: Pj.C.tinta };
    g.save(); g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-Pj.PELVIS.x, -Pj.SUELO);
    for (const lado of lados) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m || (m.puno ?? 1) < 0.5) continue;
      g.save(); g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(Pj.JK, Pj.JK); g.scale(0.88 * m.puno, 0.88 * m.puno);
      if (m.dedos) Personaje2D.mano(g, m, col); else Personaje2D.puno(g, m.pulgar, col);
      g.restore();
    }
    g.restore();
  }

  // capa del torso de Guillermo: punta delantera, vuelta del cuello y el trozo cortado
  function capaTorsoG(g, t, pg) {
    const u = avance(t);
    // la punta que le cayó en el hombro (cuelga por delante)
    if (t >= T.cae) {
      const l = 210 * salida(fase(t, T.cae, T.cae + 0.18));
      const sw = 6 * Math.sin(t * 3.1) + 14 * campana(t, T.cae, T.cae + 0.5) * Math.sin((t - T.cae) * 14);
      tira(g, [P(348, 296), P(364 + sw * 0.4, 380), P(370 + sw, 470), P(372 + sw * 1.2, 520)], 40, 1, { w: 100, esc: 1 / S, hasta: l, flecosFin: l > 180, t });
    }
    // vuelta del cuello (la primera y la que se queda)
    vuelta(g, VUELTAS[0], visibleV(u, 0));
    // trozo cortado: cuelga del lado derecho y se balancea
    if (t >= T.snip1) {
      tira(g, caboCuello(t), (LMAX - dada(T.snip1)) / S, -1, { w: 98, esc: 1 / S, cortesFin: true, t });
    }
  }
  // tras desenrollarle: la parte baja de la bufanda del cuello se repinta por encima de los hombros
  function cuelloEncima(g, t, pg) {
    if (t < T.des1 - 0.05) return;
    g.save();
    g.translate(pg.x, pg.suelo); g.scale(pg.s, pg.s); g.translate(-G.PELVIS.x, -G.SUELO);
    g.translate(pg.pelvis.x, pg.pelvis.y); g.rotate(pg.torso); g.scale(pg.torsoEsc.x, pg.torsoEsc.y); g.translate(-G.PELVIS.x, -G.PELVIS.y);
    g.beginPath(); g.rect(0, 318, 600, 400); g.clip();
    g.globalAlpha *= tramo(t, T.des1 - 0.05, T.des1 + 0.05);
    capaTorsoG(g, t, pg);
    g.restore();
  }
  // vueltas del capullo por encima de Guillermo
  function capullo(g, t, pg) {
    const u = avance(t); if (u <= 0.1) return;
    g.save();
    const k = pg.s;
    g.translate(pg.x, pg.suelo); g.scale(k, k); g.translate(-G.PELVIS.x, -G.SUELO);
    g.translate(pg.pelvis.x, pg.pelvis.y); g.rotate(pg.torso); g.scale(pg.torsoEsc.x, pg.torsoEsc.y); g.translate(-G.PELVIS.x, -G.PELVIS.y);
    for (let i = 1; i < NV; i++) vuelta(g, VUELTAS[i], visibleV(u, i));
    g.restore();
  }
  // líneas de giro alrededor de Guillermo
  function lineasGiro(g, t, pg) {
    if (!pg.girando || pg.giro.vel < 0.05) return;
    const ax = pg.x, k = pg.giro.vel;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.6 * k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const y = lerp(170, SUELO - 40, i / 3), rx = 74 + 10 * i, a0 = (pg.giro.ang * 0.5 + i * 1.3) % TAU;
      g.beginPath(); g.ellipse(ax, y, rx, 12, 0, a0, a0 + 1.6); g.stroke();
    }
    g.restore();
  }

  // cámara: se acerca al capullo cuando para y vuelve antes del tirón
  function camara(t) {
    const z = tramo(t, T.capullo + 0.1, T.camara1 - 0.05) * (1 - tramo(t, T.agarra0 - 0.1, T.tiron - 0.05));
    return { k: 1 + 0.12 * z, x: lerp(W / 2, 470, z), y: lerp(H / 2, 300, z) };
  }
  class Bufanda extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pg = poseG(t), pm = poseM(t, pg);
      const luz = tramo(t, NEGRO_INICIO, T.entra, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, FX, FY);
      halos(g, t);
      nieve(g, t, "lejos");
      // sombras
      g.fillStyle = "rgba(60,70,120,0.22)";
      const sombraG = 60 * (1 - 0.35 * clamp(pg.alto / 13));
      g.beginPath(); g.ellipse(pg.x, SUELO + 3, sombraG, 8, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(pm.x, SUELO + 3, 46, 7, 0, 0, TAU); g.fill();
      const ces = cesta(g, t, pm.x + 74, SUELO + 4);
      // Marta (con las agujas asomando del bolsillo)
      pm.capaTronco = t > T.guarda1 - 0.08 ? (gg => {
        gg.save(); gg.globalAlpha *= tramo(t, T.guarda1 - 0.08, T.guarda1);
        for (const [x0, y0, ang] of [[150, 590, -1.95], [168, 592, -2.05]]) {
          const dx = Math.cos(ang), dy = Math.sin(ang), L = 150;
          gg.strokeStyle = B.tinta; gg.lineWidth = 14; gg.lineCap = "round"; gg.beginPath(); gg.moveTo(x0, y0); gg.lineTo(x0 + dx * L, y0 + dy * L); gg.stroke();
          gg.strokeStyle = "#e3bd84"; gg.lineWidth = 8; gg.stroke();
          gg.fillStyle = "#b8463a"; gg.beginPath(); gg.arc(x0 + dx * L, y0 + dy * L, 11, 0, TAU); gg.fill(); gg.lineWidth = 4; gg.strokeStyle = B.tinta; gg.stroke();
        }
        gg.restore();
      }) : null;
      M.dibujar(g, pm, t);
      // montón y bufanda suelta
      const xP = pm.x - 52, A = monton(t);
      const cima = dibMonton(g, t, xP, A);
      const cM = centroMano(M, pm, pm.manoCerca), lM = centroMano(M, pm, pm.manoLejos);
      dibBufandaSuelta(g, t, pm, pg, cima, cM, lM, ces);
      punosEncima(g, M, pm, ["lejos", "cerca"]);
      propsMarta(g, t, pm, cM, lM);
      // Guillermo (con su giro y sus saltos)
      pg.capaTronco = gg => capaTorsoG(gg, t, pg);
      g.save();
      const tr = transG(pg), o = tr(P(0, 0)), ex = tr(P(1, 0)).x - o.x, ey = tr(P(0, 1)).y - o.y;
      g.transform(ex, 0, 0, ey, o.x, o.y);
      G.dibujar(g, pg, t);
      cuelloEncima(g, t, pg);
      capullo(g, t, pg);
      g.restore();
      efectos(g, t, pg, pm);
      nieve(g, t, "cerca");
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  /* ---------- el montón de pliegues a los pies de Marta ---------- */
  const PLIEGUES = [
    [[-42, -7], [-6, -11], [30, -7]], [[30, -15], [0, -20], [-38, -16]], [[-36, -24], [-2, -29], [28, -25]], [[26, -33], [-2, -38], [-32, -34]],
    [[-28, -42], [0, -47], [22, -43]], [[20, -51], [-1, -55], [-24, -52]], [[-20, -59], [0, -63], [16, -60]], [[14, -67], [0, -71], [-14, -69]]
  ];
  function dibMonton(g, t, x, A) {
    let cima = P(x - 42, SUELO - 7);
    if (A <= 0.02) return cima;
    g.save(); g.fillStyle = "rgba(60,70,120,0.2)"; g.beginPath(); g.ellipse(x - 4, SUELO + 2, 46 * clamp(A / 3 + 0.3), 6, 0, 0, TAU); g.fill(); g.restore();
    for (let j = 0; j < PLIEGUES.length; j++) {
      const f = clamp(A - j); if (f <= 0) break;
      const pts = PLIEGUES[j].map(([dx, dy]) => P(x + dx, SUELO + dy));
      const r = tira(g, pts, j * 41 + 13, 1, { w: 15, hasta: f < 1 ? f * 80 : undefined, redondo: f >= 1, t });
      if (r) cima = P(r.fin.x, r.fin.y);
    }
    return cima;
  }

  /* ---------- la bufanda suelta: colgando de las agujas, en las manos, volando y hacia Guillermo ---------- */
  function dibBufandaSuelta(g, t, pm, pg, cima, cM, lM, ces) {
    const L = tejido(t);
    // hilos de los ovillos a las agujas mientras teje
    const top = P(lerp(lM.x, cM.x, 0.5), Math.min(lM.y, cM.y) - 8);
    if (t < T.teje1 + 0.15) {
      const a = 1 - tramo(t, T.teje1, T.teje1 + 0.15);
      g.save(); g.globalAlpha *= a; g.lineCap = "round";
      for (const [o, col, sh] of [[ces.rojo, B.rojo, 0], [ces.crema, B.crema, 1]]) {
        const w = 2 * Math.sin(t * 30 + sh) * clamp(velAgujas(t) / 6);
        g.beginPath(); g.moveTo(o.x, o.y); g.quadraticCurveTo(lerp(o.x, top.x, 0.5) + 6, Math.max(o.y, top.y) + 16 + w, top.x + 6, top.y + 4);
        g.lineWidth = 3; g.strokeStyle = B.tinta; g.stroke(); g.lineWidth = 1.6; g.strokeStyle = col; g.stroke();
      }
      g.restore();
    }
    if (t < T.lanza) {
      // colgando: de las agujas (o de la mano lejana) hasta el montón
      const k = tramo(t, T.guarda0 - 0.02, T.guarda0 + 0.12);
      const ar = mezcla(P(top.x, top.y + 10), P(lM.x + 2, lM.y + 6), k);
      const vaiven = 3 * Math.sin(t * 2.4) + 1.5 * Math.sin(t * 31) * clamp(velAgujas(t) / 6);
      let ctrl;
      if (t < T.guarda1) ctrl = [ar, P(ar.x - 4 + vaiven, ar.y + 70), P(cima.x + 6 + vaiven * 0.4, cima.y - 60), cima];
      else ctrl = [ar, P(lerp(ar.x, cM.x, 0.5) - 6, Math.max(ar.y, cM.y) + 30), cM, P(cM.x - 6, cM.y + 60), cima];
      tira(g, ctrl, L, -1, { hasta: L, flecosFin: L < LH, flecosIni: t > T.guarda0 + 0.05, t, cortesIni: t <= T.guarda0 + 0.05 });
      return;
    }
    const fin = enganche(t, pg);
    const F = dada(t);
    if (t < T.cae) {
      // vuela: la punta sigue un arco desde la mano hasta el hombro de Guillermo
      const k = fase(t, T.lanza, T.cae), q = puntaVuelo(t);
      const toma = P(lerp(q.x, cM.x, 0.5) - 6, Math.max(q.y, cM.y) + 30);
      const ctrl = controlesTira(t, q, cM, lM);
      ctrl[1] = mezcla(toma, ctrl[1], k);
      ctrl[2] = mezcla(cM, ctrl[2], k);
      ctrl.push(P(cM.x - 6, cM.y + lerp(60, 50, k)), cima);
      tira(g, ctrl, LMAX, -1, { flecosIni: true, t });
      return;
    }
    // de la mano(s) de Marta a Guillermo
    const cortado = t >= T.snip1;
    if (!cortado) {
      const ctrl = controlesTira(t, fin, cM, lM);
      ctrl.push(P(cM.x - 6, cM.y + 50), cima);
      tira(g, ctrl, LMAX - F, -1, { t });
    } else {
      // lado de Marta: el cabo cortado cae desde su mano y luego al montón
      const k = t - T.snip1, c = corteFijo();
      const caida = Math.min(1, k * 2.4), cuelga = P(cM.x - 8 + 10 * Math.sin(k * 7) * Math.exp(-k * 3), cM.y + 70);
      const extremo = mezcla(c, cuelga, salida(caida));
      const suelta = tramo(t, T.suelta, T.suelta + 0.3);
      const ex2 = mezcla(extremo, P(cima.x + 12, cima.y - 4), suelta), mano = mezcla(cM, P(cima.x + 4, cima.y - 30), suelta);
      tira(g, [ex2, P(lerp(ex2.x, mano.x, 0.5) - 6, lerp(ex2.y, mano.y, 0.5) + 10), mano, P(mano.x - 6, lerp(mano.y, cima.y, 0.5)), cima], LMAX - F - CORTE_D, -1, { t, cortesIni: true });
    }
  }
  function propsMarta(g, t, pm, cM, lM) {
    // agujas mientras teje (con borrón cuando va rápido)
    if (t < T.guarda1) {
      const V = velAgujas(t), ag = agujaF(t), borr = clamp((V - 3) / 5);
      const gu = tramo(t, T.guarda0, T.guarda1);
      const angL = -0.75 + 0.32 * ag.a * clamp(V / 6), angC = -2.4 + 0.32 * ag.b * clamp(V / 6);
      if (gu < 0.02) {
        if (borr > 0.01) { for (const d of [-0.5, 0.5]) { aguja(g, lM, angL + 0.32 * d, 46, 0.25 * borr); aguja(g, cM, angC - 0.32 * d, 46, 0.25 * borr); } }
        aguja(g, lM, angL, 46); aguja(g, cM, angC, 46);
        // rayitas de velocidad y pelusilla
        if (borr > 0.05) {
          // arcos de movimiento alrededor de las manos y pelusilla que salta
          g.save(); g.lineCap = "round";
          const c = mezcla(lM, cM, 0.5);
          g.strokeStyle = `rgba(43,19,24,${0.55 * borr})`; g.lineWidth = 1.8;
          for (const [r, a0, d] of [[24, -2.7, 0.9], [30, -1.3, 0.8], [22, 0.5, 0.7], [28, 2.3, 0.6]]) {
            const a = a0 + 0.25 * Math.sin(t * 23 + r); g.beginPath(); g.arc(c.x, c.y - 6, r, a, a + d); g.stroke(); }
          for (let i = 0; i < 5; i++) { const k = (t * 2.2 + i * 0.2) % 1, a = -2.2 + i * 1.1, d = 14 + 26 * k;
            g.fillStyle = i % 2 ? `rgba(201,52,62,${0.8 * borr * (1 - k)})` : `rgba(245,234,214,${0.9 * borr * (1 - k)})`;
            g.beginPath(); g.arc(c.x + Math.cos(a) * d, c.y - 12 + Math.sin(a) * d - 8 * k, 2.2, 0, TAU); g.fill(); }
          g.restore();
        }
      } else {
        // se las pasa a la mano cercana y van al bolsillo
        const al = 1 - tramo(t, T.guarda1 - 0.12, T.guarda1);
        const paso = mezcla(lM, cM, tramo(t, T.guarda0, T.guarda0 + 0.20));
        aguja(g, cM, lerp(angC, -2.0, gu), 46 * (1 - 0.5 * tramo(t, T.guarda1 - 0.2, T.guarda1)), al);
        aguja(g, paso, lerp(angL, -1.85, gu), 46 * (1 - 0.5 * tramo(t, T.guarda1 - 0.2, T.guarda1)), al);
      }
    }
    // tijeras: del bolsillo a cortar y luego enseñarlas
    if (t > T.tijera0 + 0.12 && t < 14.0) {
      const c = pm.corte, ang = Math.atan2(c.y - lM.y, c.x - lM.x);
      let ab = 0.5;
      if (t > T.corta1) ab = aperturaTijeras(t);
      const angF = t > T.suelta ? lerp(ang, -1.9, tramo(t, T.suelta, T.baja1)) : ang;
      const al = tramo(t, T.tijera0 + 0.12, T.tijera0 + 0.2) * (1 - tramo(t, 13.8, 13.95));
      g.save(); g.globalAlpha *= al; tijeras(g, lM, angF, ab, 1); g.restore();
    }
  }

  function efectos(g, t, pg, pm) {
    lineasGiro(g, t, pg);
    const tr = transG(pg);
    // vaho de Guillermo (tiritando) y de Marta
    if (t < 5.5) vaho(g, t, G.aPantalla(pg, G.boca(pg)), [0.9, 2.15, 3.35, 4.45], 1, 1.35);
    if (t < 4) { const b = M.aPantalla(pm, M.boca(pm)); vaho(g, t, P(b.x - 8, b.y), [1.6, 3.0], -1, 0.7); }
    // «mmf» dentro del capullo
    if (t > T.capullo + 0.3 && t < T.tiron) {
      const q = tr(torsoAPantalla(pg, P(330, 230)));
      g.save(); g.strokeStyle = "rgba(40,20,30,0.7)"; g.lineWidth = 2; g.lineCap = "round";
      for (const t0 of [T.salto0, T.salto1, T.salto2]) {
        const k = fase(t, t0 - 0.05, t0 + 0.35); if (k <= 0 || k >= 1) continue;
        g.globalAlpha = Math.sin(Math.PI * k);
        for (let i = 0; i < 2; i++) { const x = q.x + 30 + 10 * k + i * 7, y = q.y - 6 - 16 * k + i * 8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4, y - 4, x + 8, y); g.quadraticCurveTo(x + 12, y + 4, x + 16, y); g.stroke(); }
      }
      g.restore();
    }
    // nieve que salta en los saltitos y al arrastrarle
    const polvos = [[T.salto0 + T.saltoD, 0], [T.salto1 + T.saltoD, 0], [T.salto2 + T.saltoD, 0]];
    for (const [t0] of polvos) {
      const k = fase(t, t0 - 0.02, t0 + 0.4); if (k <= 0 || k >= 1) continue;
      g.save(); g.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`;
      for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI, d = 10 + 28 * salida(k); g.beginPath(); g.arc(pg.x + Math.cos(a) * d * 1.4, SUELO + Math.sin(a) * d * 0.4 - 2, 3 * (1 - k) + 1, 0, TAU); g.fill(); }
      g.restore();
    }
    const arr = campana(t, T.tiron, T.arrastre1 + 0.1);
    if (arr > 0.02) {
      g.save(); g.fillStyle = `rgba(255,255,255,${0.75 * arr})`;
      for (let i = 0; i < 10; i++) { const k = ((t * 3 + i * 0.1) % 1), x = pg.x - 30 - 70 * k + 10 * hash(i), y = SUELO - 4 - 26 * Math.sin(Math.PI * k) * (0.5 + hash(i + 3)); g.beginPath(); g.arc(x, y, 2.5 * (1 - k) + 1, 0, TAU); g.fill(); }
      g.restore();
    }
    // tirón: rayitas en la mano de Marta
    const ti = campana(t, T.tiron - 0.02, T.tiron + 0.25);
    if (ti > 0.02) {
      const c = centroMano(M, pm, pm.manoLejos);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * ti})`; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const a = Math.PI + (i - 1.5) * 0.4; g.beginPath(); g.moveTo(c.x + Math.cos(a) * 18, c.y + Math.sin(a) * 18); g.lineTo(c.x + Math.cos(a) * 30, c.y + Math.sin(a) * 30); g.stroke(); }
      g.restore();
    }
    // estrellitas del mareo
    const ke = tramo(t, T.gira2_1 - 0.2, T.mareo0 + 0.1) * (1 - tramo(t, T.mareo1 - 0.1, T.mareo1 + 0.15));
    if (ke > 0.01) {
      const cab = tr(G.aPantalla(pg, G.cabeza(pg).a(P(780, 300))));
      const pts = [];
      for (let i = 0; i < 5; i++) { const a = t * 4 + i * TAU / 5; pts.push({ a, x: cab.x + Math.cos(a) * 44, y: cab.y + Math.sin(a) * 11, z: Math.sin(a) }); }
      pts.sort((u, v) => u.z - v.z);
      for (const q of pts) { const r = (7 + 2.4 * q.z) * ke; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = B.tinta; g.stroke(); }
    }
    // ¡zis! al cortar
    for (const t0 of [T.snip1, T.snip2]) {
      const k = fase(t, t0, t0 + 0.22); if (k <= 0 || k >= 1) continue; const CORTE = pm.corte;
      g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2.2; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3, r0 = 8 + 10 * k, r1 = r0 + 7; g.beginPath(); g.moveTo(CORTE.x + Math.cos(a) * r0, CORTE.y + Math.sin(a) * r0); g.lineTo(CORTE.x + Math.cos(a) * r1, CORTE.y + Math.sin(a) * r1); g.stroke(); }
      g.restore();
    }
    // destello de bufanda perfecta y corazón de Guillermo
    const kd = campana(t, T.snip2 + 0.05, T.snip2 + 0.6);
    if (kd > 0.01) { const q = tr(torsoAPantalla(pg, P(380, 300))); estrellaPuntas(g, q.x + 8, q.y - 6, 9 * kd, 4, t * 2, 0.3); g.fillStyle = "#fff7c8"; g.fill(); }
    const kc = fase(t, T.abraza1 - 0.1, T.abraza1 + 0.9);
    if (kc > 0 && kc < 1) { const cab = G.aPantalla(pg, G.cabeza(pg).a(P(900, 350))); corazon(g, cab.x + 18 + 6 * Math.sin(t * 5), cab.y - 30 * kc, 9 + 3 * kc, Math.sin(Math.PI * kc)); }
  }

  registrar({ id: "00092.2", nombre: "Guillermo y Marta · La bufanda", crear: () => new Bufanda() });
  window.__A2D_00092_2 = { pose, T, DUR, avance, enganche, centroMano, puntaVuelo, dada, comba, caboCuello, corteFijo, torsoAPantalla, aperturaTijeras, tramoCorte, enArco, CORTE_D };
})();
