"use strict";
/* 00088 · Guillermo y Kiriku · El reloj
 *
 * Negro → vestíbulo de un hotel elegante al anochecer: suelo de mármol pulido con reflejos, pared
 * verde azulado con filete de latón y zócalo de nogal, un gran reloj de pared sin números (solo
 * marcas y agujas), dos apliques, una palmera en su macetero de latón y, al fondo a la derecha, una
 * puerta giratoria de cristal y latón con la calle azul detrás. Guillermo (izquierda) y Kiriku
 * (derecha) esperan con las manos en los bolsillos.
 * Kiriku saca la mano, estira el brazo, da un golpe de muñeca y se mira el reloj de pulsera dorado:
 * ¡ting!, un destello que deslumbra a Guillermo, que se hace visera con la mano → Guillermo, picado,
 * rebusca en el bolsillo y saca un despertador gigante de dos campanas; se lo pone sobre la muñeca
 * como si fuera un reloj de pulsera, lo mira muy chulo y mira a Kiriku (ceja levantada) → le da
 * cuerda a la llave de atrás con los mofletes hinchados… y ¡RIIING!: suena con todas sus fuerzas,
 * el martillo vibra entre las campanas, el reloj tiembla y le sacude el brazo y el pelo → lo bate de
 * una mano a otra, se le escapa, cae al suelo y sigue dando saltitos sonando hacia Kiriku; Guillermo
 * lo persigue agachado, intenta cazarlo dos veces y se le escapa → Kiriku, sin sacar la otra mano
 * del bolsillo, levanta el pie y lo para pisándolo por arriba: último «ding» y silencio → se vuelve a
 * mirar el reloj (otro destello que deslumbra a Guillermo, agachado a sus pies) y los dos miran a
 * cámara → negro.
 *
 * Sin textos ni números. Todo depende del tiempo absoluto. El despertador se dibuja en coordenadas
 * de pantalla: en la mano (como objeto de la mano, debajo de los dedos), en el aire (delante de todo)
 * o en el suelo (detrás de los dos, así el pie de Kiriku queda encima).
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, KI = Kiriku;
  const S = 0.31, SUELO = 548, XG = 340, XK = 724;
  const DUR = 14.6;
  const T = {
    // Kiriku se mira el reloj
    kSale: 0.92, kFrente0: 1.04, kFrente1: 1.36, kFlick0: 1.38, kFlick1: 1.6, kMira0: 1.62, kMira1: 1.98,
    kBrillo: 2.2, kBaja0: 2.98, kBaja1: 3.3, kBols1: 3.6,
    // Guillermo se deslumbra, se pica y saca el despertador
    gVis0: 2.24, gVis1: 2.42, gVisFin: 2.92, gBols1: 3.5,
    gPica: 3.62, gRebusca0: 3.86, gSaca0: 4.12, gSaca1: 4.46, gPone0: 4.5, gPone1: 4.86,
    gChulo: 5.08, kCeja: 5.3,
    gCuerda0: 5.52, gCuerda1: 5.78, gGira: [5.86, 6.12, 6.38, 6.62], gCuerdaFin: 6.86,
    suena: 6.94,
    // malabares
    pop1: 7.16, coge1: 7.48, pop2: 7.6, coge2: 7.9, pop3: 8.02, cae: 8.44,
    // saltitos por el suelo hasta el pie de Kiriku
    salto: 0.3, nSaltos: 6,
    gAgacha0: 8.3, gAgacha1: 8.62, lanzo1: 9.19, lanzo2: 9.79,
    kPie0: 9.5, kPie1: 9.86, pisa: 10.3, ding: 10.34,
    gPasmo: 10.5, kMiraG: 10.62,
    // segunda mirada al reloj
    kSale2: 11.0, kFrente2: 11.12, kFlick2: 11.42, kMira2: 11.64, kMira3: 11.96, kBrillo2: 12.14, kBaja2: 12.64, kBaja3: 12.94,
    gVis2: 12.18, gVis3: 12.36, gVisFin2: 12.72,
    gFinal: 12.96, kFinal: 13.06, kGuino: 13.48,
    fin: 13.96
  };
  T.L0 = T.cae; T.Lfin = T.cae + T.salto * T.nSaltos;     // aterrizajes de los saltitos

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const TINTA = "#141218";
  let MATRIZ = null;
  // vibración suave (suma de senos: continua a 60 fps, sin saltos)
  const vib = (t, a, s = 0) => a * (0.6 * Math.sin(t * 71 + s) + 0.4 * Math.sin(t * 113 + 1.7 + s));

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en la hoja en cada fotograma.
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  const offMano = (m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * G.JK, y: r.y * G.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 }, PALMA = { x: 0, y: 1 }, CENTRO = { x: 0, y: 0 };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) { const m = Rg.manoReposo ? Rg.manoReposo(p, lado) : null;
        const B = m ? m : Tr(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
        const hd = o.hondo || 0;
        return { x: B.x, y: B.y + hd, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) }; }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(m, o.ref || PALMA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  // la mano no puede ir más lejos de lo que da el brazo: si no, se acerca al hombro (mano y brazo nunca se separan)
  function alcanza(Rg, p, m, lado, k = 1.04) {
    const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), L = (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L) * k;
    const o = rota({ x: Math.cos(m.mu) * R_M, y: Math.sin(m.mu) * R_M }, m.ang || 0);
    const dx = m.x + o.x - h.x, dy = m.y + o.y - h.y, d = Math.hypot(dx, dy);
    if (d > L) { const f = L / d; m.x = h.x + dx * f - o.x; m.y = h.y + dy * f - o.y; }
    return m;
  }
  // muñeca (pantalla) y dirección del antebrazo (pantalla, de la muñeca hacia el codo)
  function muneca(Rg, p, m) {
    const o = rota({ x: Math.cos(m.mu) * R_M, y: Math.sin(m.mu) * R_M }, m.ang || 0);
    const w = Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }), c = Rg.aPantalla(p, { x: m.x, y: m.y });
    const a = (m.mu + (m.ang || 0)), dx = Math.cos(a) * (p.espejo ? -1 : 1), dy = Math.sin(a);
    return { w, c, d: { x: dx, y: dy } };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp, extra) {
    return Object.assign({ mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 }, extra || {});
  }

  /* =====================================================================================
   * EL DESPERTADOR · unidades de pantalla (a escala 1), origen en el centro de la esfera.
   * ===================================================================================== */
  const RJ = { R: 22, base: 33, asa: -46, llave: { x: 27, y: 4 } };
  const ROJO = ["#ff5a4a", "#d8261d", "#8e1410"];
  function campanaDib(g, x, y, ang) {
    g.save(); g.translate(x, y); g.rotate(ang);
    // cúpula cromada
    g.beginPath(); g.moveTo(-12, 3); g.bezierCurveTo(-12, -9, -7, -14, 0, -14); g.bezierCurveTo(7, -14, 12, -9, 12, 3); g.closePath();
    const gr = g.createLinearGradient(-12, -14, 12, 3); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.35, "#d9dde4"); gr.addColorStop(0.7, "#8c94a3"); gr.addColorStop(1, "#5b6170");
    g.fillStyle = gr; g.fill(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    // reborde y brillo
    g.beginPath(); g.ellipse(0, 3, 12.5, 2.6, 0, 0, Math.PI * 2); g.fillStyle = "#6c7381"; g.fill(); g.lineWidth = 2; g.stroke();
    g.beginPath(); g.ellipse(-5, -7, 2.2, 4.5, 0.5, 0, Math.PI * 2); g.fillStyle = "rgba(255,255,255,0.85)"; g.fill();
    // botoncito de arriba
    g.beginPath(); g.arc(0, -15, 2.4, 0, Math.PI * 2); g.fillStyle = "#c7ccd5"; g.fill(); g.lineWidth = 1.6; g.stroke();
    g.restore();
  }
  // e: { suena 0..1, llave (ángulo), golpe (martillo 0..1, para el «ding» final), t }
  function dibReloj(g, e) {
    const R = RJ.R, t = e.t;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // patitas
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(s * 11, 16); g.lineTo(s * 17, 28); g.lineWidth = 6.5; g.strokeStyle = TINTA; g.stroke();
      g.lineWidth = 3.2; g.strokeStyle = "#b9bfc9"; g.stroke();
      g.beginPath(); g.arc(s * 17.5, 29.5, 3.6, 0, Math.PI * 2); g.fillStyle = "#c9ced7"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    }
    // llave de cuerda (sale por detrás, a la derecha): la mariposa se aplasta al girar
    const L = RJ.llave, cl = Math.cos(e.llave || 0);
    g.beginPath(); g.moveTo(R - 4, L.y); g.lineTo(L.x + 2, L.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 3; g.strokeStyle = "#b08a3a"; g.stroke();
    g.save(); g.translate(L.x + 4, L.y); g.scale(1, Math.max(0.12, Math.abs(cl)));
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-3, -6, 6, -12, 8, -6); g.bezierCurveTo(9, -2, 4, 0, 0, 0);
    g.moveTo(0, 0); g.bezierCurveTo(-3, 6, 6, 12, 8, 6); g.bezierCurveTo(9, 2, 4, 0, 0, 0);
    g.fillStyle = cl > 0 ? "#e8c35a" : "#b48a2e"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.restore();
    // asa
    g.beginPath(); g.moveTo(-10, -30); g.bezierCurveTo(-12, -44, 12, -44, 10, -30); g.lineWidth = 6.5; g.strokeStyle = TINTA; g.stroke();
    g.lineWidth = 3.2; g.strokeStyle = "#c9ced7"; g.stroke();
    // martillo entre las campanas: al sonar, borroso de lado a lado
    const s = e.suena || 0;
    const martillo = (a, alfa) => {
      g.save(); g.globalAlpha *= alfa; g.translate(0, -19); g.rotate(a);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -15); g.lineWidth = 4.4; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 2; g.strokeStyle = "#9aa1ad"; g.stroke();
      g.beginPath(); g.arc(0, -16, 3.6, 0, Math.PI * 2); g.fillStyle = "#e7e9ee"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
      g.restore();
    };
    campanaDib(g, -15, -25, -0.5);
    campanaDib(g, 15, -25, 0.5);
    if (s > 0.02) { martillo(-0.62 * s, 0.6); martillo(0.62 * s, 0.6);
      g.save(); g.globalAlpha *= 0.5 * s; g.strokeStyle = "#ffffff"; g.lineWidth = 1.4;
      g.beginPath(); g.arc(0, -19, 17, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55); g.stroke(); g.restore(); }
    else martillo(0.62 * (e.golpe || 0), 1);
    // caja roja esmaltada con el bisel cromado
    g.beginPath(); g.arc(0, 0, R + 2.5, 0, Math.PI * 2);
    const gr = g.createRadialGradient(-8, -10, 4, 0, 0, R + 4); gr.addColorStop(0, ROJO[0]); gr.addColorStop(0.6, ROJO[1]); gr.addColorStop(1, ROJO[2]);
    g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.arc(0, 0, R - 2, 0, Math.PI * 2); g.fillStyle = "#d7dbe2"; g.fill(); g.lineWidth = 1.6; g.stroke();
    // esfera crema con marcas (sin números)
    g.beginPath(); g.arc(0, 0, R - 5, 0, Math.PI * 2);
    const ef = g.createRadialGradient(-4, -5, 2, 0, 0, R - 5); ef.addColorStop(0, "#fffaf0"); ef.addColorStop(1, "#ead9b8");
    g.fillStyle = ef; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#6e5a3a"; g.stroke();
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, r0 = i % 3 === 0 ? R - 11 : R - 9, r1 = R - 6.5;
      g.beginPath(); g.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); g.lineTo(Math.sin(a) * r1, -Math.cos(a) * r1);
      g.lineWidth = i % 3 === 0 ? 2.2 : 1.2; g.strokeStyle = "#2b2420"; g.stroke();
    }
    // agujas (las siete y diez) y la de la alarma, roja
    const aguja = (a, l, w, col) => { g.beginPath(); g.moveTo(-Math.sin(a) * 3, Math.cos(a) * 3); g.lineTo(Math.sin(a) * l, -Math.cos(a) * l); g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
    aguja(0.2 * Math.PI * 2 / 1.2 + 0.05, 11, 1.4, "#c8261c");
    aguja(7.17 / 12 * Math.PI * 2, 9, 2.6, "#1d1916");
    aguja(10 / 60 * Math.PI * 2 + (t || 0) * 0.02, 14, 1.8, "#1d1916");
    g.beginPath(); g.arc(0, 0, 2.2, 0, Math.PI * 2); g.fillStyle = "#1d1916"; g.fill();
    // cristal: brillo
    g.save(); g.beginPath(); g.arc(0, 0, R - 5, 0, Math.PI * 2); g.clip();
    g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(-7, -9, 10, 5, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
    g.beginPath(); g.arc(-10, -12, 3, 0, Math.PI * 2); g.fillStyle = "rgba(255,255,255,0.7)"; g.fill();
    g.restore();
  }
  // ondas del timbre: arcos en zigzag a los dos lados de las campanas (coordenadas del reloj)
  function ondas(g, k, t, fuerte = 1) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const u = ((t * 3.4 + i / 3) % 1), r = 30 + u * 34 * fuerte, a = (1 - u) * k;
      if (a < 0.02) continue;
      g.globalAlpha = a; g.strokeStyle = i % 2 ? "#fff3a8" : "#ffffff"; g.lineWidth = 3.2 - u * 1.4;
      g.beginPath();
      const n = 7;
      for (let j = 0; j <= n; j++) {
        const th = -0.8 + 1.0 * j / n, rr = r + (j % 2 ? 4 : -4);
        const x = s * Math.cos(th) * rr, y = -24 + Math.sin(th) * rr;
        if (j === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    g.restore();
  }
  // estrella de cuatro puntas (destellos)
  function estrella4(g, x, y, r, a, rot = 0, col = "#ffffff") {
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = clamp(a); g.translate(x, y); g.rotate(rot); g.fillStyle = col;
    g.beginPath();
    for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * 0.2 : r; g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
    g.closePath(); g.fill(); g.restore();
  }
  function rayitas(g, x, y, k, ang, n = 3, col = "#ffffff", r0 = 14, l = 12) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineCap = "round"; g.lineWidth = 2.6;
    for (let i = 0; i < n; i++) {
      const a = ang + (i - (n - 1) / 2) * 0.42, r = r0 + 4 * (1 - k);
      g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l)); g.stroke();
    }
    g.restore();
  }

  /* ---------- el reloj de pulsera de Kiriku (en la muñeca cercana) ---------- */
  function dibPulsera(g, Mw, brillo) {
    // Mw: { w (muñeca, pantalla), d (hacia el codo) }; la esfera mira hacia arriba
    const a = Math.atan2(Mw.d.y, Mw.d.x), c = { x: Mw.w.x + Mw.d.x * 4.5, y: Mw.w.y + Mw.d.y * 4.5 };
    g.save(); g.translate(c.x, c.y); g.rotate(a); g.lineJoin = "round";
    // correa (cruza el antebrazo)
    g.fillStyle = "#2b1a12"; g.beginPath(); g.roundRect(-3.2, -7.5, 6.4, 15, 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    // caja dorada
    const nor = Math.sign(Math.cos(a)) || 1;          // lado de arriba del antebrazo
    g.translate(0, -6 * nor);
    g.beginPath(); g.ellipse(0, 0, 4.6, 3.6, 0, 0, Math.PI * 2);
    const gr = g.createLinearGradient(-4, -4, 4, 4); gr.addColorStop(0, "#fff2b0"); gr.addColorStop(0.5, "#e2b23e"); gr.addColorStop(1, "#8c6416");
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(0, 0, 3, 2.2, 0, 0, Math.PI * 2); g.fillStyle = "#162238"; g.fill();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(-1, -0.8, 1.2, 0.6, -0.4, 0, Math.PI * 2); g.fill();
    g.restore();
    if (brillo > 0.01) {
      const q = { x: c.x - Math.sin(a) * 6 * (Math.sign(Math.cos(a)) || 1), y: c.y + Math.cos(a) * -6 * (Math.sign(Math.cos(a)) || 1) };
      const gl = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, 34);
      gl.addColorStop(0, `rgba(255,252,220,${0.85 * brillo})`); gl.addColorStop(1, "rgba(255,240,180,0)");
      g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = gl; g.beginPath(); g.arc(q.x, q.y, 34, 0, Math.PI * 2); g.fill(); g.restore();
      estrella4(g, q.x, q.y, 26 * brillo, brillo, 0.1);
      estrella4(g, q.x, q.y, 14 * brillo, brillo, Math.PI / 4 + 0.1, "#fff6c8");
    }
  }
  // rayo de luz del reloj a los ojos de Guillermo
  function rayo(g, de, a, k) {
    if (k <= 0.01) return;
    const dx = a.x - de.x, dy = a.y - de.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(de.x, de.y, a.x, a.y);
    gr.addColorStop(0, `rgba(255,250,210,${0.55 * k})`); gr.addColorStop(1, `rgba(255,246,190,${0.12 * k})`);
    g.fillStyle = gr; g.beginPath();
    g.moveTo(de.x + nx * 2, de.y + ny * 2); g.lineTo(a.x + nx * 22, a.y + ny * 22); g.lineTo(a.x - nx * 22, a.y - ny * 22); g.lineTo(de.x - nx * 2, de.y - ny * 2);
    g.closePath(); g.fill(); g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CG = {
    inicio: E({ mx: 0.85, my: 0.05, sonr: 0.25, ancho: 0.85 }),
    mira: E({ mx: 0.9, my: 0.25, iris: 1.05, sd: 10, si: 8, sonr: 0.2, ancho: 0.8 }),
    deslumbra: E({ mx: 0.9, c: 1, z: 1, sd: -8, si: -8, abre: 8, ancho: 0.62, sonr: -0.3 }),
    pica: E({ mx: 0.9, my: 0.05, sd: -6, gd: -0.16, si: 6, gi: 0.1, sonr: 0.5, ancho: 0.95 }),
    rebusca: E({ mx: 0.4, my: 0.9, sd: 6, si: 10, abre: 3, ancho: 0.6, sonr: 0.1 }),
    presume: E({ mx: 0.5, my: 0.9, c: 0.3, sd: 8, si: 4, sonr: 0.6, ancho: 0.95 }),
    chulo: E({ mx: 0.95, my: 0.05, c: 0.25, sd: 16, si: 4, gi: -0.06, sonr: 0.9, ancho: 1.05 }),
    cuerda: E({ mx: 0.7, my: 0.6, c: 0.55, z: 0.5, sd: -4, si: -4, sonr: -0.15, ancho: 0.7, mof: 0.95 }),
    susto: E({ mx: 0.5, my: 0.3, iris: 0.8, sd: 26, si: 26, abre: 20, ancho: 0.65, sonr: -0.25 }),
    malabar: E({ mx: 0.6, my: -0.5, iris: 0.85, sd: 22, si: 24, abre: 14, ancho: 0.7, sonr: -0.35 }),
    persigue: E({ mx: 0.95, my: 0.65, sd: 14, si: 10, abre: 7, ancho: 0.6, sonr: -0.15 }),
    lanza: E({ mx: 0.95, my: 0.7, z: 0.4, c: 0.3, sd: 6, si: 6, abre: 12, ancho: 0.8, sonr: -0.2 }),
    pasmo: E({ mx: 0.85, my: -0.75, iris: 0.9, sd: 22, si: 24, abre: 6, ancho: 0.45, sonr: -0.1 }),
    final: E({ mx: -0.45, my: -0.1, sd: 12, si: 16, gi: 0.08, sonr: 0.7, ancho: 0.9 })
  };
  const GUION_CG = [
    [1.2, 1.5, "mira"], [T.gVis0 - 0.04, T.gVis0 + 0.04, "deslumbra", salida], [T.gVisFin, T.gVisFin + 0.25, "mira"],
    [T.gPica, T.gPica + 0.18, "pica"], [T.gRebusca0, T.gRebusca0 + 0.15, "rebusca"], [T.gPone1 - 0.15, T.gPone1 + 0.05, "presume"],
    [T.gChulo, T.gChulo + 0.2, "chulo"], [T.gCuerda0 + 0.1, T.gCuerda1, "cuerda"], [T.suena, T.suena + 0.06, "susto", salida],
    [T.pop1 - 0.05, T.pop1 + 0.1, "malabar"], [T.cae, T.cae + 0.15, "persigue"], [T.lanzo1 - 0.1, T.lanzo1, "lanza"],
    [T.lanzo1 + 0.15, T.lanzo1 + 0.3, "persigue"], [T.lanzo2 - 0.1, T.lanzo2, "lanza"], [T.lanzo2 + 0.15, T.lanzo2 + 0.3, "persigue"],
    [T.gPasmo, T.gPasmo + 0.2, "pasmo"], [T.gVis2 - 0.04, T.gVis2 + 0.04, "deslumbra", salida], [T.gVisFin2, T.gVisFin2 + 0.2, "pasmo"],
    [T.gFinal, T.gFinal + 0.3, "final"]
  ];
  const PARP_G = [1.0, 3.45, 5.3, 9.4, 11.3, 13.4];
  const P0G = { pel: 0, torso: 0.02, cab: 0.03, cdy: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    mira: CuG({ torso: 0.0, cab: 0.02 }),
    deslumbra: CuG({ torso: 0.04, cab: 0.2, pel: 4 }),
    pica: CuG({ torso: 0.04, cab: 0.05 }),
    rebusca: CuG({ torso: 0.08, cab: 0.2, pel: 6 }),
    saca: CuG({ torso: -0.03, cab: 0.1, pel: -2 }),
    presume: CuG({ torso: -0.05, cab: 0.16 }),
    chulo: CuG({ torso: -0.07, cab: -0.1, pel: -3 }),
    cuerda: CuG({ torso: 0.05, cab: 0.17, pel: 4 }),
    susto: CuG({ torso: -0.1, cab: -0.16, pel: -26 }),
    malabar: CuG({ torso: 0.02, cab: -0.14, pel: 6 })
  };
  const GUION_G = [
    [1.2, 1.5, "mira"], [T.gVis0 - 0.04, T.gVis0 + 0.06, "deslumbra", salida], [T.gVisFin, T.gVisFin + 0.3, "mira"],
    [T.gPica, T.gPica + 0.2, "pica"], [T.gRebusca0, T.gRebusca0 + 0.2, "rebusca"], [T.gSaca0, T.gSaca1, "saca"],
    [T.gPone0, T.gPone1, "presume"], [T.gChulo, T.gChulo + 0.22, "chulo"], [T.gCuerda0, T.gCuerda1, "cuerda"],
    [T.suena, T.suena + 0.07, "susto", salida], [T.suena + 0.12, T.pop1, "malabar"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  // dónde está el cuerpo (pantalla): quieto; luego persigue el reloj agachado
  const RETRASO = 190;
  function xCuerpoG(t) {
    if (t < T.cae - 0.1) return XG;
    const sigue = relojSuelo(t - 0.12).x - RETRASO;
    const base = lerp(XG, sigue, tramo(t, T.cae - 0.1, T.cae + 0.4));
    const lz = (t0) => 34 * campana(t, t0 - 0.18, t0 + 0.24);
    return base + lz(T.lanzo1) + lz(T.lanzo2);
  }
  // pasos de los pies durante la persecución (pantalla)
  const PASOS_L = [8.5, 8.8, 9.08, 9.38, 9.68, 9.98, 10.24], PASOS_C = [8.62, 8.94, 9.22, 9.52, 9.82, 10.12, 10.4];
  function pie(t, lista, off) {
    let x = XG + off, lev = 0;
    for (const t0 of lista) {
      const t1 = t0 + 0.17;
      if (t <= t0) break;
      const destino = xCuerpoG(t1) + off * 0.85;
      const k = tramo(t, t0, t1);
      x = lerp(x, destino, k); lev = Math.max(lev, 10 * campana(t, t0, t1));
    }
    return { x, lev };
  }
  const agachado = t => tramo(t, T.gAgacha0, T.gAgacha1);
  const ABIERTA = D(1, 1, 1, 1), FLOJA = D(0.35, 0.45, 0.45, 0.45), PUNO = D(0.15, 0.1, 0.1, 0.1), PINZA_G = D5(0.62, 0.55, 0.22, 0.18, 0.16);
  const ARRIBA = D(0.9, 0.95, 0.95, 0.95);
  // codos hacia dentro (el antebrazo del despertador delante del pecho; la visera, sin tapar la cara)
  const DOB = -1, VIS = -1, VX = 970, VY = 575;
  const AG = { pel: 70, torso: 0.78, cab: 0.06 };       // agachado, persiguiendo el despertador
  const KD = -1;                                         // codo de Kiriku al mirarse el reloj
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const ag = agachado(t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const x = xCuerpoG(t);
    const lz = campana(t, T.lanzo1 - 0.16, T.lanzo1 + 0.22) + campana(t, T.lanzo2 - 0.16, T.lanzo2 + 0.22);
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + lerp(b.pel, AG.pel + 20 * lz, ag) + respira * 1.2 * (1 - ag) },
      torso: lerp(b.torso, AG.torso + 0.25 * lz - 0.3 * tramo(t, T.pisa, T.gPasmo + 0.3), ag), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: lerp(b.cab, AG.cab - 0.1 * lz, ag), dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true
    };
    // mira hacia arriba a Kiriku al pararse el reloj
    p.cabeza.ang -= 0.22 * tramo(t, T.gPasmo, T.gPasmo + 0.3) * (1 - tramo(t, T.gFinal, T.gFinal + 0.35));
    // tiembla el pelo con el timbre
    const tiemb = campana(t, T.suena - 0.02, T.cae + 0.1) > 0 ? tramo(t, T.suena, T.suena + 0.05) * (1 - tramo(t, T.cae - 0.2, T.cae + 0.1)) : 0;
    p.cabeza.ang += vib(t, 0.022 * tiemb, 0.4);
    // pies
    const susto = 18 * campana(t, T.suena, T.suena + 0.3);
    let fc, fl;
    if (t < T.cae) { fc = { x: x - 30, lev: susto * 0.8 }; fl = { x: x + 34, lev: susto }; }
    else { fc = pie(t, PASOS_C, -30); fl = pie(t, PASOS_L, 34); }
    const hojaX = wx => G.PELVIS.x + (wx - x) / S;
    p.piernas.cerca = { tob: { x: hojaX(fc.x), y: TOB_G - fc.lev / S }, ang: 0.0 };
    p.piernas.lejos = { tob: { x: hojaX(fl.x), y: TOB_G - fl.lev / S }, ang: 0.0 };
    // cara
    const e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.enfado = 0.8 * campana(t, T.gPica - 0.05, T.gSaca0 + 0.2);
    p.sudor = 0.7 * campana(t, T.suena + 0.2, T.pisa + 0.5) + 0.6 * tramo(t, T.gFinal, T.gFinal + 0.4);
    p.rojo = 0.45 * campana(t, T.gCuerda0, T.suena + 0.05) + 0.35 * tramo(t, T.gFinal, T.gFinal + 0.4);
    // manos
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const W_ = (dx, dy) => () => ({ x: p.x + dx, y: SUELO + dy });          // punto de pantalla relativo a los pies
    const visera = () => G.aPantalla(p, G.cabeza(p).a({ x: VX, y: VY }));
    const PISTA_GC = [
      [0, 0, { bols: true }],
      // rebusca en el bolsillo y saca el despertador
      [T.gRebusca0, T.gSaca0, { bols: true, hondo: 26 }],
      [T.gSaca0, T.gSaca0 + 0.04, { bols: true, hondo: 10, sale: true, dedos: PUNO }],
      [T.gSaca0 + 0.04, T.gSaca1, { scr: W_(-44, -214), ref: CENTRO, mu: 1.9, dedos: PUNO, dobla: -1 }, salida],
      // se lo pone en la muñeca como un reloj de pulsera (antebrazo delante del pecho)
      [T.gPone0, T.gPone1, { scr: W_(16, -250), ref: CENTRO, mu: 3.05, dedos: PUNO, dobla: DOB }],
      [T.gCuerda0, T.gCuerda1, { scr: W_(18, -244), ref: CENTRO, mu: 3.05, dedos: PUNO, dobla: DOB }],
      // malabares
      [T.pop1 + 0.02, T.pop2, { scr: W_(-14, -236), ref: PALMA, mu: 2.9, ang: 0.3, dedos: FLOJA, dobla: -1 }],
      [T.pop2, T.coge2, { scr: W_(-22, -266), ref: PALMA, mu: 2.7, ang: 0.3, dedos: ARRIBA, dobla: -1 }, salida],
      [T.pop3, T.pop3 + 0.22, { scr: W_(30, -268), ref: PALMA, mu: 2.4, dedos: ABIERTA, dobla: 1 }, salida],
      [T.cae, T.gAgacha1, { scr: () => alcance(t, p, -16), ref: PALMA, mu: 2.6, dedos: ABIERTA, dobla: 1 }],
    ];
    const PISTA_GL = [
      [0, 0, { bols: true }],
      // visera contra el destello
      [T.gVis0 - 0.02, T.gVis0, { bols: true, sale: true, dedos: ABIERTA }],
      [T.gVis0, T.gVis1, { scr: visera, ref: PALMA, mu: 1.75, dedos: ABIERTA, dobla: VIS }, salida],
      [T.gVisFin, T.gVisFin + 0.3, { scr: W_(64, -150), ref: PALMA, mu: -1.6, dedos: FLOJA, dobla: VIS }],
      [T.gVisFin + 0.3, T.gVisFin + 0.32, { scr: W_(64, -150), ref: PALMA, mu: -1.6, dedos: FLOJA, dobla: 1 }],
      [T.gVisFin + 0.32, T.gBols1, { bols: true }],
      // pellizca la llave y le da cuerda
      [T.gCuerda0 - 0.1, T.gCuerda0, { bols: true, sale: true, dedos: PINZA_G }],
      [T.gCuerda0, T.gCuerda1, { scr: () => llaveG(t, p), ref: PINZA, mu: 2.1, dedos: PINZA_G, dobla: 1 }, salida],
      [T.suena, T.suena + 0.12, { scr: W_(96, -250), ref: PALMA, mu: 2.2, dedos: ABIERTA, dobla: 1 }, salida],
      [T.suena + 0.12, T.coge1, { scr: W_(104, -238), ref: PALMA, mu: 2.5, ang: -0.2, dedos: ARRIBA, dobla: 1 }],
      [T.pop2 + 0.04, T.pop3, { scr: W_(92, -228), ref: PALMA, mu: 2.4, dedos: ABIERTA, dobla: 1 }],
      [T.pop3, T.pop3 + 0.22, { scr: W_(110, -268), ref: PALMA, mu: 2.4, dedos: ABIERTA, dobla: 1 }, salida],
      [T.cae, T.gAgacha1, { scr: () => alcance(t, p, 8), ref: PALMA, mu: 2.4, dedos: ABIERTA, dobla: 1 }],
      // agachado: visera otra vez
      [T.gVis2 - 0.04, T.gVis3, { scr: visera, ref: PALMA, mu: 1.75, dedos: ABIERTA, dobla: VIS }, salida],
      [T.gVisFin2, T.gVisFin2 + 0.3, { scr: () => alcance(t, p, 8), ref: PALMA, mu: 2.4, dedos: FLOJA, dobla: 1 }]
    ];
    // el timbre sacude los brazos
    const sac = tramo(t, T.suena, T.suena + 0.04) * (1 - tramo(t, T.cae - 0.1, T.cae + 0.1));
    const C = pista(PISTA_GC, t, res);
    C.x += vib(t, 5 * sac, 0.2); C.y += vib(t, 5 * sac, 1.1);
    const cierra = [T.lanzo1, T.lanzo2].reduce((a, tl) => Math.max(a, campana(t, tl - 0.04, tl + 0.26)), 0);
    C.dedos = DD(C.dedos, PUNO, cierra);
    alcanza(G, p, C, "cerca");
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    const L = pista(PISTA_GL, t, resL);
    // cuerda: la muñeca gira a cada vuelta de llave
    let giro = 0; for (const g0 of T.gGira) giro += campana(t, g0 - 0.12, g0 + 0.12);
    L.ang += 0.55 * giro;
    L.x += vib(t, 5 * sac, 2.3); L.y += vib(t, 5 * sac, 3.1);
    L.dedos = DD(L.dedos, PUNO, cierra);
    alcanza(G, p, L, "lejos");
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    return p;
  }
  // a dónde estira las manos al perseguir el reloj (hacia el reloj, hasta donde llega)
  function alcance(t, p, dx) {
    const r = relojSuelo(t), lz = campana(t, T.lanzo1 - 0.18, T.lanzo1 + 0.24) + campana(t, T.lanzo2 - 0.18, T.lanzo2 + 0.24);
    const quieto = { x: Math.min(r.x - 70, p.x + 118) + dx, y: SUELO - 80 };
    return { x: lerp(quieto.x, r.x - 30 + dx, lz), y: lerp(quieto.y, r.y + 2, lz) };
  }
  // la llave del despertador cuando está en la muñeca (pantalla)
  function llaveG(t, p) { const r = relojEnMuneca(t, p); return { x: r.x + RJ.llave.x + 6, y: r.y + RJ.llave.y }; }
  // el despertador sobre la muñeca cercana (como un reloj de pulsera)
  function relojEnMuneca(t, p) {
    const M = muneca(G, p, p.manoCerca);
    return { x: M.w.x + M.d.x * 6, y: M.w.y - 8 - RJ.base, rot: 0.05 * Math.sin(t * 3.1) };
  }

  /* =====================================================================================
   * KIRIKU (derecha, reflejado: mira a la izquierda)
   * ===================================================================================== */
  const CK = {
    inicio: E({ mx: 0.85, my: 0.1, c: 0.28, sd: 4, si: 6, sonr: 0.4, ancho: 0.9 }),
    reloj: E({ mx: 0.55, my: 0.9, c: 0.42, sd: 8, si: 8, sonr: 0.6, ancho: 0.95 }),
    chulo: E({ mx: -0.4, sd: 12, si: 8, gi: -0.05, sonr: 0.88, ancho: 1.02 }),
    mira: E({ mx: 0.9, my: 0.15, c: 0.3, sd: 4, si: 4, sonr: 0.35, ancho: 0.9 }),
    ceja: E({ mx: 0.9, my: 0.25, sd: 24, gd: 0.12, si: -2, gi: -0.08, sonr: 0.1, ancho: 0.62 }),
    tedio: E({ mx: 0.85, my: 0.75, c: 0.5, sd: 4, si: 2, sonr: 0.15, ancho: 0.75 }),
    pisa: E({ mx: 0.7, my: 0.95, c: 0.45, sd: 8, si: 6, sonr: 0.45, ancho: 0.9 }),
    final: E({ mx: -0.4, sd: 12, si: 14, gi: 0.05, sonr: 0.9, ancho: 1.02 })
  };
  const GUION_CK = [
    [T.kFrente0, T.kFrente0 + 0.2, "chulo"], [T.kMira0, T.kMira1, "reloj"], [T.kBaja0, T.kBaja0 + 0.25, "mira"],
    [T.gPone1, T.gPone1 + 0.2, "mira"], [T.kCeja, T.kCeja + 0.2, "ceja"], [T.suena + 0.1, T.suena + 0.3, "mira"],
    [T.cae + 0.1, T.cae + 0.4, "tedio"], [T.kPie1, T.kPie1 + 0.3, "pisa"], [T.kMiraG, T.kMiraG + 0.2, "ceja"],
    [T.kFrente2, T.kFrente2 + 0.2, "chulo"], [T.kMira2, T.kMira3, "reloj"], [T.kBaja2, T.kBaja2 + 0.2, "mira"],
    [T.kFinal, T.kFinal + 0.3, "final"]
  ];
  const PARP_K = [0.5, 3.7, 6.2, 9.0, 10.9, 12.8];
  const P0K = { pel: 0, torso: 0.02, cab: 0.03, cdy: 0 };
  const CuK = o => Object.assign({}, P0K, o);
  const CUER_K = {
    quieto: CuK({}),
    chulo: CuK({ torso: -0.04, cab: -0.08, pel: -2 }),
    reloj: CuK({ torso: 0.02, cab: 0.2, pel: 2 }),
    mira: CuK({ torso: 0.02, cab: 0.05 }),
    ladea: CuK({ torso: 0.03, cab: 0.12 }),
    pisa: CuK({ torso: -0.05, cab: 0.12, pel: -6 }),
    final: CuK({ torso: -0.05, cab: -0.08, pel: -4 })
  };
  const GUION_K = [
    [T.kFrente0, T.kFrente0 + 0.25, "chulo"], [T.kMira0, T.kMira1, "reloj"], [T.kBaja0, T.kBaja1, "mira"],
    [T.kCeja, T.kCeja + 0.25, "ladea"], [T.suena + 0.1, T.suena + 0.35, "mira"], [T.kPie0, T.kPie1, "pisa"],
    [T.kFrente2, T.kFrente2 + 0.25, "chulo"], [T.kMira2, T.kMira3, "reloj"], [T.kBaja2, T.kBaja3, "pisa"],
    [T.kFinal, T.kFinal + 0.3, "final"]
  ];
  const TOB_K = KI.SUELO - KI.TOBILLO_ALTO;
  const SK = S * KI.K;
  const PIE_K = { cerca: KI.PELVIS.x - 30 / SK, lejos: KI.PELVIS.x + 32 / SK };
  const PUNO_K = D(0.2, 0.15, 0.15, 0.15), FLOJA_K = D(0.5, 0.6, 0.6, 0.6);
  function poseK(t) {
    const b = linea(GUION_K, CUER_K, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const p = {
      x: XK, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: KI.PELVIS.x, y: KI.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    p.piernas.cerca = { tob: { x: PIE_K.cerca, y: TOB_K }, ang: 0 };
    p.piernas.lejos = { tob: { x: PIE_K.lejos, y: TOB_K }, ang: 0 };
    // pie lejano: se levanta, espera en el aire y pisa el despertador
    const pieK = pieKiriku(t);
    if (pieK) p.piernas.lejos = pieK;
    const e = linea(GUION_CK, CK, "inicio", t);
    const guino = campana(t, T.kGuino, T.kGuino + 0.42);
    p.cara = cara(e, parpadeo(t, PARP_K));
    p.cara.ojos.i = Math.max(p.cara.ojos.i, guino);
    // manos: la lejana siempre en el bolsillo; la cercana, el reloj
    const res = resolutor(KI, p, "cerca"), resL = resolutor(KI, p, "lejos");
    const W_ = (dx, dy) => () => ({ x: p.x + dx, y: SUELO + dy });
    const LADO = { x: 40, y: 714 };
    const mirarReloj = (t0, tF0, tF1, tM0, tM1, tB0, tB1) => [
      [t0, t0 + 0.12, { bols: true, sale: true, dedos: FLOJA_K }],
      [t0 + 0.12, tF1, { scr: W_(-62, -236), ref: CENTRO, mu: 2.75, dedos: FLOJA_K, dobla: KD }, salida],
      [tM0, tM1, { scr: W_(-34, -270), ref: CENTRO, mu: 3.0, dedos: PUNO_K, dobla: KD }, salida],
      [tB0, tB1, { hoja: LADO, mu: -1.45, dedos: FLOJA_K, dobla: -1 }],
      [tB1, tB1 + 0.3, { bols: true }]
    ];
    const PISTA_KC = [[0, 0, { bols: true }],
      ...mirarReloj(T.kSale, T.kFrente0, T.kFrente1, T.kMira0, T.kMira1, T.kBaja0, T.kBaja1),
      ...mirarReloj(T.kSale2, T.kFrente2, T.kFlick2, T.kMira2, T.kMira3, T.kBaja2, T.kBaja3)];
    const C = pista(PISTA_KC, t, res), L = pista([[0, 0, { bols: true }]], t, resL);
    // golpe de muñeca para que asome el reloj
    for (const [a, z] of [[T.kFlick0, T.kFlick1], [T.kFlick2 - 0.12, T.kFlick2 + 0.1]]) {
      const k = campana(t, a, z); C.ang += 0.5 * Math.sin((t - a) * 40) * k; C.x += 10 * k;
    }
    // gira la muñeca hacia la luz al destellar
    C.ang += 0.12 * campana(t, T.kBrillo - 0.15, T.kBrillo + 0.4) + 0.12 * campana(t, T.kBrillo2 - 0.15, T.kBrillo2 + 0.4);
    alcanza(KI, p, C, "cerca");
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    return p;
  }
  // pie lejano de Kiriku (hoja): sube a esperar el reloj y lo pisa por arriba (la suela sobre el asa)
  const X_PISA = 650;
  function pieKiriku(t) {
    if (t < T.kPie0) return null;
    const sube = tramo(t, T.kPie0, T.kPie1), baja = tramo(t, T.pisa - 0.1, T.pisa, entrada);
    const tope = topeReloj(t);                                // la suela, sobre el asa
    // de la suela (centro, pantalla) al tobillo (hoja)
    const centroSuela = { x: (KI.PUNTA.x + KI.TALON.x) / 2, y: (KI.PUNTA.y + KI.TALON.y) / 2 };
    const ini = { x: XK - 32 - centroSuela.x * SK, y: SUELO - (KI.TOBILLO_ALTO - centroSuela.y) * SK };
    const espera = topeReloj(0) - 34, ySuela = lerp(lerp(ini.y, espera, sube), tope - 0.5, baja);
    const xSuela = lerp(ini.x, X_PISA, sube);
    const ang = -0.05 * sube;
    const o = rota(centroSuela, ang);
    const tobW = { x: xSuela + o.x * SK, y: ySuela - o.y * SK };
    return { tob: { x: KI.PELVIS.x - (tobW.x - XK) / SK, y: KI.SUELO + (tobW.y - SUELO) / SK }, ang };
  }

  // lo más alto del asa del despertador parado en el suelo (pantalla), con el aplastado del pisotón
  const ALTO_ASA = 40.5;
  const pisado = t => tramo(t, T.pisa - 0.02, T.pisa + 0.04);
  const topeReloj = t => SUELO - (RJ.base + ALTO_ASA) * (1 - 0.08 * pisado(t));
  /* =====================================================================================
   * DÓNDE ESTÁ EL DESPERTADOR EN CADA INSTANTE
   * ===================================================================================== */
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  // en la palma (abierta hacia arriba) de una mano de Guillermo
  function enPalma(p, lado) {
    const m = lado === "cerca" ? p.manoCerca : p.manoLejos, c = G.aPantalla(p, { x: m.x, y: m.y });
    return { x: c.x, y: c.y - 8 - RJ.base, rot: 0 };
  }
  // saltitos por el suelo hacia Kiriku
  const X0_SUELO = 520;
  function relojSuelo(t) {
    const n = T.nSaltos, d = (X_PISA - X0_SUELO) / n;
    const u = (t - T.L0) / T.salto;
    if (u <= 0) return { x: X0_SUELO, y: SUELO - RJ.base, rot: 0, sx: 1, sy: 1, h: 0 };
    const i = Math.min(n, Math.floor(u)), f = u - i;
    if (i >= n) return { x: X_PISA, y: SUELO - RJ.base, rot: 0, sx: 1, sy: 1, h: 0 };
    const H = i === n - 1 ? 9 : lerp(26, 18, i / (n - 1));
    const h = 4 * H * f * (1 - f);
    const x = X0_SUELO + d * (i + suave(f));
    const ap = Math.max(0, 1 - f / 0.18) + Math.max(0, (f - 0.86) / 0.14);         // aplastado al tocar el suelo
    return { x, y: SUELO - RJ.base - h, rot: (i % 2 ? 1 : -1) * 0.2 * Math.sin(Math.PI * f), sx: 1 + 0.12 * ap, sy: 1 - 0.12 * ap, h };
  }
  function vuelo(a, b, t0, t1, t, alto, giros = 0.5) {
    const u = clamp((t - t0) / (t1 - t0));
    const y = lerp(a.y, b.y, u) - 4 * alto * u * (1 - u);
    return { x: lerp(a.x, b.x, u), y, rot: Math.sin(u * Math.PI) * giros };
  }
  function reloj(t, pG) {
    const suena = t >= T.suena && t < T.pisa ? tramo(t, T.suena, T.suena + 0.04) : 0;
    const base = { esc: 1, sx: 1, sy: 1, suena, llave: 0, golpe: 0, t };
    if (t < T.gSaca0) return null;
    if (t < T.gPone0) {
      // sale del bolsillo agarrado por la base: crece de golpe (¡pop!)
      const k = tramo(t, T.gSaca0, T.gSaca0 + 0.24, salida), esc = lerp(0.25, 1, k) + 0.12 * campana(t, T.gSaca0 + 0.14, T.gSaca0 + 0.4);
      const c = G.aPantalla(pG, { x: pG.manoCerca.x, y: pG.manoCerca.y });
      return Object.assign(base, { x: c.x, y: c.y - 8 - RJ.base * esc, rot: 0.08 * Math.sin(t * 5), esc, sx: lerp(0.6, 1, k), sy: lerp(1.5, 1, k), capa: "gC" });
    }
    if (t < T.pop1) {
      const r = relojEnMuneca(t, pG);
      // de agarrado por la base a sentado en la muñeca
      if (t < T.gPone1) { const c = G.aPantalla(pG, { x: pG.manoCerca.x, y: pG.manoCerca.y }), k = tramo(t, T.gPone0, T.gPone1);
        r.x = lerp(c.x, r.x, k); r.y = lerp(c.y - 8 - RJ.base, r.y, k); }
      let llave = 0; for (const g0 of T.gGira) llave += Math.PI * tramo(t, g0 - 0.12, g0 + 0.12);
      return Object.assign(base, r, { llave, capa: "gC" });
    }
    const pop1 = cache("pop1", () => relojEnMuneca(T.pop1, poseG(T.pop1)));
    const coge1 = cache("coge1", () => enPalma(poseG(T.coge1), "lejos"));
    if (t < T.coge1) return Object.assign(base, vuelo(pop1, coge1, T.pop1, T.coge1, t, 42, 0.6), { capa: "aire" });
    if (t < T.pop2) return Object.assign(base, enPalma(pG, "lejos"), { capa: "gL" });
    const pop2 = cache("pop2", () => enPalma(poseG(T.pop2), "lejos"));
    const coge2 = cache("coge2", () => enPalma(poseG(T.coge2), "cerca"));
    if (t < T.coge2) return Object.assign(base, vuelo(pop2, coge2, T.pop2, T.coge2, t, 22, -0.7), { capa: "aire" });
    if (t < T.pop3) return Object.assign(base, enPalma(pG, "cerca"), { capa: "gC" });
    const pop3 = cache("pop3", () => enPalma(poseG(T.pop3), "cerca"));
    if (t < T.L0) return Object.assign(base, vuelo(pop3, { x: X0_SUELO, y: SUELO - RJ.base }, T.pop3, T.L0, t, 70, 1.1), { capa: "aire" });
    const s = relojSuelo(t);
    const pis = pisado(t);
    return Object.assign(base, s, { sy: s.sy * (1 - 0.08 * pis), sx: s.sx * (1 + 0.05 * pis),
      golpe: campana(t, T.ding - 0.02, T.ding + 0.16), capa: "suelo" });
  }
  function pintaReloj(g, r) {
    const j = r.suena > 0 ? { x: vib(r.t, 1.4 * r.suena, 0.3), y: vib(r.t, 1.1 * r.suena, 2.2), a: vib(r.t, 0.06 * r.suena, 4.1) } : { x: 0, y: 0, a: 0 };
    g.save(); g.translate(r.x + j.x, r.y + j.y); g.rotate(r.rot + j.a);
    // aplastado desde la base
    g.translate(0, RJ.base); g.scale(r.esc * r.sx, r.esc * r.sy); g.translate(0, -RJ.base);
    dibReloj(g, r);
    ondas(g, r.suena, r.t);
    if (r.suena > 0) {
      // rayitas de vibración a los lados de la caja
      g.save(); g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 2; g.lineCap = "round";
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const yy = -2 + i * 12; g.beginPath(); g.moveTo(s * 29, yy); g.lineTo(s * 35, yy + 3); g.stroke(); }
      g.restore();
    }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null;
  const ZOC = 368;                  // base de la pared
  const PUERTA = { x: 946, y0: 120, y1: ZOC, w: 150 };
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    const pared = gg => {
      // pared verde azulado con rayas finas
      const pa = gg.createLinearGradient(0, -60, 0, ZOC);
      pa.addColorStop(0, "#123236"); pa.addColorStop(0.55, "#1d4a4e"); pa.addColorStop(1, "#173c40");
      gg.fillStyle = pa; gg.fillRect(-40, -60, W + 80, ZOC + 60);
      gg.globalAlpha = 0.12; gg.fillStyle = "#4f8a86";
      for (let x = -40; x < W + 40; x += 22) gg.fillRect(x, -60, 2, ZOC - 170);
      gg.globalAlpha = 1;
      // cornisa y filete de latón
      gg.fillStyle = "#0e2427"; gg.fillRect(-40, -60, W + 80, 34);
      latón(gg, -40, -28, W + 80, 7);
      latón(gg, -40, ZOC - 182, W + 80, 6);
      // zócalo de nogal con cuarterones
      const zo = gg.createLinearGradient(0, ZOC - 176, 0, ZOC);
      zo.addColorStop(0, "#5a3420"); zo.addColorStop(1, "#3c2114");
      gg.fillStyle = zo; gg.fillRect(-40, ZOC - 176, W + 80, 176);
      for (let x = -20; x < W + 40; x += 132) {
        gg.strokeStyle = "rgba(20,8,2,0.55)"; gg.lineWidth = 4; gg.strokeRect(x + 8, ZOC - 158, 112, 138);
        gg.strokeStyle = "rgba(160,104,60,0.35)"; gg.lineWidth = 2; gg.strokeRect(x + 12, ZOC - 154, 104, 130);
      }
      latón(gg, -40, ZOC - 8, W + 80, 8);
    };
    pared(g);
    // apliques con su halo
    for (const x of [262, 762]) aplique(g, x, 112);
    relojPared(g, 0);           // la esfera (las agujas se pintan en cada fotograma)
    puertaFondo(g);
    // suelo de mármol pulido, en perspectiva, con el reflejo de la pared
    marmol(g);
    palmera(g, 74, ZOC + 30);
    // viñeta suave
    const vi = g.createRadialGradient(512, 300, 300, 512, 300, 760); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(10,6,2,0.4)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function latón(g, x, y, w, h) {
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.45, "#d2a23c"); gr.addColorStop(1, "#7a5614");
    g.fillStyle = gr; g.fillRect(x, y, w, h);
  }
  function aplique(g, x, y) {
    const halo = g.createRadialGradient(x, y, 4, x, y, 120); halo.addColorStop(0, "rgba(255,214,140,0.55)"); halo.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(x, y, 120, 0, Math.PI * 2); g.fill();
    latón(g, x - 4, y + 4, 8, 34);
    g.beginPath(); g.moveTo(x - 18, y + 8); g.lineTo(x - 12, y - 18); g.lineTo(x + 12, y - 18); g.lineTo(x + 18, y + 8); g.closePath();
    const pa = g.createLinearGradient(0, y - 18, 0, y + 8); pa.addColorStop(0, "#fff4d6"); pa.addColorStop(1, "#f2c77a");
    g.fillStyle = pa; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#6a4a12"; g.stroke();
  }
  const RELOJ_P = { x: 512, y: 112, r: 64 };
  function relojPared(g) {
    const { x, y, r } = RELOJ_P;
    g.save();
    g.beginPath(); g.arc(x + 4, y + 6, r + 10, 0, Math.PI * 2); g.fillStyle = "rgba(0,0,0,0.3)"; g.fill();
    g.beginPath(); g.arc(x, y, r + 10, 0, Math.PI * 2);
    const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, "#ffefb0"); gr.addColorStop(0.5, "#c9962f"); gr.addColorStop(1, "#6e4c10");
    g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = "#3a2806"; g.stroke();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    const ef = g.createRadialGradient(x - 14, y - 18, 6, x, y, r); ef.addColorStop(0, "#fffbf0"); ef.addColorStop(1, "#e9dcc2");
    g.fillStyle = ef; g.fill(); g.lineWidth = 2; g.strokeStyle = "#7a5a1a"; g.stroke();
    for (let i = 0; i < 60; i++) {
      const a = i * Math.PI / 30, gruesa = i % 5 === 0, r0 = gruesa ? r - 14 : r - 7;
      g.beginPath(); g.moveTo(x + Math.sin(a) * r0, y - Math.cos(a) * r0); g.lineTo(x + Math.sin(a) * (r - 3), y - Math.cos(a) * (r - 3));
      g.lineWidth = gruesa ? 3.6 : 1.2; g.strokeStyle = "#2b2116"; g.stroke();
    }
    g.restore();
  }
  function agujasPared(g, t) {
    const { x, y, r } = RELOJ_P;
    const aguja = (a, l, w, col, cola = 8) => {
      g.beginPath(); g.moveTo(x - Math.sin(a) * cola, y + Math.cos(a) * cola); g.lineTo(x + Math.sin(a) * l, y - Math.cos(a) * l);
      g.lineWidth = w; g.strokeStyle = col; g.stroke();
    };
    g.save(); g.lineCap = "round";
    aguja((7 + 8 / 60) / 12 * Math.PI * 2, r * 0.52, 6, "#1d1712");
    aguja((8 + t / 60) / 60 * Math.PI * 2, r * 0.8, 4, "#1d1712");
    aguja((22 + t) / 60 * Math.PI * 2, r * 0.86, 1.6, "#b8231b", 14);
    g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fillStyle = "#b8231b"; g.fill();
    g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fillStyle = "#1d1712"; g.fill();
    // cristal
    g.globalAlpha = 0.18; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - 22, y - 26, 30, 12, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // puerta giratoria: marco de latón, calle al anochecer detrás; las hojas se pintan en cada fotograma
  function puertaFondo(g) {
    const { x, y0, y1, w } = PUERTA;
    g.save();
    const ca = g.createLinearGradient(0, y0, 0, y1); ca.addColorStop(0, "#1b2c5a"); ca.addColorStop(0.6, "#3a4f86"); ca.addColorStop(1, "#7f6f8e");
    g.fillStyle = ca; g.fillRect(x - w / 2, y0, w, y1 - y0);
    // farolas y luces de la calle
    for (const [lx, ly, r] of [[x - 40, y0 + 120, 26], [x + 44, y0 + 140, 18], [x + 10, y0 + 170, 10]]) {
      const l = g.createRadialGradient(lx, ly, 1, lx, ly, r); l.addColorStop(0, "rgba(255,226,150,0.95)"); l.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = l; g.beginPath(); g.arc(lx, ly, r, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = "#14193a"; g.fillRect(x - w / 2, y1 - 48, w, 48);
    // marco
    latón(g, x - w / 2 - 12, y0 - 14, w + 24, 14);
    latón(g, x - w / 2 - 12, y0 - 14, 12, y1 - y0 + 14);
    latón(g, x + w / 2, y0 - 14, 12, y1 - y0 + 14);
    // cúpula semicircular de cristal encima
    g.beginPath(); g.ellipse(x, y0 - 14, w / 2 + 12, 22, 0, Math.PI, 0); g.fillStyle = "#2a3a66"; g.fill(); g.lineWidth = 5; g.strokeStyle = "#a57a22"; g.stroke();
    g.restore();
  }
  function hojasPuerta(g, t) {
    const { x, y0, y1, w } = PUERTA, th = t * 0.45;
    g.save();
    const hojas = [];
    for (let i = 0; i < 4; i++) { const a = th + i * Math.PI / 2; hojas.push({ s: Math.sin(a), c: Math.cos(a) }); }
    hojas.sort((a, b) => a.c - b.c);
    for (const h of hojas) {
      const xe = x + h.s * (w / 2 - 4);
      g.fillStyle = `rgba(190,220,255,${0.1 + 0.12 * (1 + h.c) / 2})`;
      g.fillRect(Math.min(x, xe), y0 + 4, Math.abs(xe - x), y1 - y0 - 8);
      g.fillStyle = "#c79a36"; g.fillRect(xe - 3, y0 + 2, 6, y1 - y0 - 4);
      g.fillStyle = "rgba(255,240,190,0.5)"; g.fillRect(xe - 1, y0 + 2, 1.5, y1 - y0 - 4);
    }
    latón(g, x - 4, y0, 8, y1 - y0);
    g.restore();
  }
  function palmera(g, x, yb) {
    g.save();
    // hojas en abanico
    const hoja = (a, l, curva) => {
      const bx = x + 4, by = yb - 150;
      const ex = bx + Math.cos(a) * l, ey = by + Math.sin(a) * l + curva;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo((bx + ex) / 2 + Math.cos(a - 1.5) * 18, (by + ey) / 2 - 26, ex, ey);
      g.lineWidth = 3; g.strokeStyle = "#1c4a1e"; g.stroke();
      for (let i = 1; i <= 9; i++) {
        const u = i / 10, px = lerp(bx, ex, u), py = lerp(by, ey, u) - 26 * Math.sin(Math.PI * u) * 0.9;
        const n = a + Math.PI / 2;
        for (const s of [-1, 1]) {
          g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(n) * s * 22 * (1 - u * 0.6) + Math.cos(a) * 8, py + Math.sin(n) * s * 22 * (1 - u * 0.6) + 14);
          g.lineWidth = 5.5 - u * 2.5; g.strokeStyle = i % 2 ? "#2f7a32" : "#27682a"; g.stroke();
        }
      }
    };
    for (const [a, l, cv] of [[-2.6, 120, 40], [-2.0, 130, 10], [-1.45, 110, -10], [-0.9, 130, 10], [-0.35, 120, 44], [-1.75, 90, 0], [-1.15, 95, 0]]) hoja(a, l, cv);
    // tronco
    g.beginPath(); g.moveTo(x - 7, yb - 46); g.quadraticCurveTo(x - 2, yb - 100, x + 3, yb - 152); g.lineTo(x + 11, yb - 152); g.quadraticCurveTo(x + 8, yb - 100, x + 9, yb - 46); g.closePath();
    g.fillStyle = "#6a4a2a"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#2a1a0c"; g.stroke();
    // macetero de latón
    g.beginPath(); g.moveTo(x - 40, yb - 64); g.lineTo(x + 48, yb - 64); g.lineTo(x + 38, yb); g.lineTo(x - 30, yb); g.closePath();
    const gr = g.createLinearGradient(x - 40, 0, x + 48, 0); gr.addColorStop(0, "#7a5614"); gr.addColorStop(0.35, "#fff0b0"); gr.addColorStop(0.6, "#d2a23c"); gr.addColorStop(1, "#6e4c10");
    g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = "#3a2806"; g.stroke();
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x - 38, yb - 54, 84, 4);
    g.restore();
  }
  function marmol(g) {
    // reflejo de la pared en el mármol: la parte de abajo de la pared, volteada y desvanecida
    const fl = document.createElement("canvas"); fl.width = W + 80; fl.height = 240; const f = fl.getContext("2d");
    f.save(); f.translate(0, 240); f.scale(1, -1); f.drawImage(g.canvas, 0, ZOC + 60 - 240, W + 80, 240, 0, 0, W + 80, 240); f.restore();
    f.globalCompositeOperation = "destination-in";
    const dm = f.createLinearGradient(0, 0, 0, 240); dm.addColorStop(0, "rgba(0,0,0,1)"); dm.addColorStop(1, "rgba(0,0,0,0)");
    f.fillStyle = dm; f.fillRect(0, 0, W + 80, 240);
    const fondoM = g.createLinearGradient(0, ZOC, 0, H + 60);
    fondoM.addColorStop(0, "#d9cdb8"); fondoM.addColorStop(0.5, "#cbbda4"); fondoM.addColorStop(1, "#b6a586");
    g.fillStyle = fondoM; g.fillRect(-40, ZOC, W + 80, H + 60 - ZOC);
    // vetas grises suaves
    g.save(); g.beginPath(); g.rect(-40, ZOC, W + 80, H + 60 - ZOC); g.clip();
    for (let i = 0; i < 26; i++) {
      const x0 = hash(i + 3) * (W + 80) - 40, y0 = ZOC + hash(i + 11) * (H + 60 - ZOC);
      g.beginPath(); g.moveTo(x0, y0);
      let x = x0, y = y0;
      for (let k = 0; k < 6; k++) { const nx = x + 30 + hash(i * 7 + k) * 50, ny = y + (hash(i * 13 + k) - 0.5) * 18; g.quadraticCurveTo((x + nx) / 2, y + (hash(i + k * 5) - 0.5) * 14, nx, ny); x = nx; y = ny; }
      g.lineWidth = 0.8 + hash(i * 3) * 1.4; g.strokeStyle = `rgba(110,98,84,${0.18 + hash(i * 5) * 0.2})`; g.stroke();
    }
    // reflejo (más fuerte arriba)
    g.globalAlpha = 0.22; g.drawImage(fl, -40, ZOC);
    g.globalAlpha = 1;
    // juntas de las baldosas en perspectiva
    const fuga = { x: 512, y: ZOC - 520 };
    g.strokeStyle = "rgba(90,78,60,0.35)"; g.lineWidth = 1.4;
    for (let i = -10; i <= 10; i++) { const xb = 512 + i * 150; g.beginPath(); g.moveTo(lerp(fuga.x, xb, (ZOC - fuga.y) / (H + 60 - fuga.y)), ZOC); g.lineTo(xb, H + 60); g.stroke(); }
    for (const yy of [ZOC + 30, ZOC + 72, ZOC + 128, ZOC + 200, ZOC + 290]) { g.beginPath(); g.moveTo(-40, yy); g.lineTo(W + 40, yy); g.stroke(); }
    // brillo de las lámparas en el suelo
    for (const x of [262, 762]) {
      const b = g.createRadialGradient(x, ZOC + 40, 2, x, ZOC + 40, 140); b.addColorStop(0, "rgba(255,226,160,0.35)"); b.addColorStop(1, "rgba(255,226,160,0)");
      g.fillStyle = b; g.beginPath(); g.ellipse(x, ZOC + 40, 140, 40, 0, 0, Math.PI * 2); g.fill();
    }
    // la alfombra de la entrada (granate con ribete dorado), delante de la puerta
    g.beginPath(); g.moveTo(PUERTA.x - 80, ZOC + 8); g.lineTo(PUERTA.x + 80, ZOC + 8); g.lineTo(PUERTA.x + 140, ZOC + 64); g.lineTo(PUERTA.x - 140, ZOC + 64); g.closePath();
    g.fillStyle = "#7a1622"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#d4a440"; g.stroke();
    g.restore();
  }
  // brillo del suelo y reflejo difuso de cada personaje
  function reflejo(g, x, ancho, col) {
    const gr = g.createLinearGradient(0, SUELO, 0, SUELO + 46);
    gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, SUELO + 14, ancho, 30, 0, 0, Math.PI * 2); g.fill();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 512, 300], [1.0, 1.0, 512, 300], [2.0, 1.07, 560, 292], [3.2, 1.07, 548, 292], [4.4, 1.06, 470, 296], [6.8, 1.08, 462, 292],
    [8.1, 1.0, 512, 300], [10.6, 1.0, 520, 300], [11.6, 1.05, 560, 296], [13.2, 1.06, 552, 296], [DUR, 1.07, 552, 296]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  const pose = t => ({ g: poseG(t), k: poseK(t) });
  class GuillermoKirikuReloj extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KI.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pK = poseK(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      agujasPared(g, t);
      hojasPuerta(g, t);
      // reflejos y sombras en el mármol
      reflejo(g, pG.x + 4, 50, "rgba(40,60,110,0.16)");
      reflejo(g, pK.x - 4, 46, "rgba(40,60,110,0.16)");
      g.save(); g.fillStyle = "rgba(40,24,10,0.3)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 3, 58, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pK.x - 4, SUELO + 3, 54, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // el despertador
      const r = reloj(t, pG);
      if (r && r.capa === "suelo") {
        g.save(); g.fillStyle = "rgba(40,24,10,0.28)"; g.beginPath(); g.ellipse(r.x, SUELO + 2, 22 - 0.3 * r.h, 5, 0, 0, Math.PI * 2); g.fill(); g.restore();
        pintaReloj(g, r);
        // golpes contra el suelo
        const u = (t - T.L0) / T.salto, i = Math.round(u);
        if (i >= 0 && i <= T.nSaltos && Math.abs(u - i) < 0.35) {
          const k = 1 - Math.abs(u - i) / 0.35, tl = T.L0 + i * T.salto;
          if (t >= tl) { rayitas(g, r.x - 24, SUELO - 4, k, Math.PI + 0.35, 2, "#ffffff", 4, 9); rayitas(g, r.x + 24, SUELO - 4, k, -0.35, 2, "#ffffff", 4, 9); }
        }
      }
      const enMano = (gg) => { gg.save(); gg.setTransform(MATRIZ); pintaReloj(gg, r); gg.restore(); };
      if (r && r.capa === "gC") pG.manoCerca.objeto = enMano;
      if (r && r.capa === "gL") pG.manoLejos.objeto = enMano;
      // el reloj de pulsera de Kiriku, en su muñeca cercana (encima del antebrazo, debajo de los dedos)
      if (pK.manoCerca.puno > 0.5) {
        const br = Math.max(campana(t, T.kBrillo - 0.06, T.kBrillo + 0.5), campana(t, T.kBrillo2 - 0.06, T.kBrillo2 + 0.5));
        pK.manoCerca.objeto = gg => { gg.save(); gg.setTransform(MATRIZ); dibPulsera(gg, muneca(KI, pK, pK.manoCerca), 0); gg.restore(); };
        pK._brillo = br;
      }
      G.dibujar(g, pG, t);
      KI.dibujar(g, pK, t);
      if (r && r.capa === "aire") pintaReloj(g, r);
      // destellos del reloj de pulsera y el rayo a los ojos de Guillermo
      if (pK._brillo > 0.01) {
        const M = muneca(KI, pK, pK.manoCerca), ojos = G.aPantalla(pG, G.cabeza(pG).a({ x: 860, y: 590 }));
        rayo(g, { x: M.w.x, y: M.w.y - 6 }, ojos, pK._brillo);
        dibPulsera(g, M, pK._brillo);
      }
      // ¡ding! final y rayitas de sorpresa
      if (r && t >= T.ding && t < T.ding + 0.6) {
        const k = 1 - tramo(t, T.ding, T.ding + 0.6, s => s);
        g.save(); g.translate(r.x, r.y); ondas(g, k * 0.9, t, 0.6); g.restore();
      }
      const HGc = G.aPantalla(pG, G.cabeza(pG).a({ x: 760, y: 300 }));
      rayitas(g, HGc.x, HGc.y, campana(t, T.suena, T.suena + 0.4), -1.9, 3);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00088", nombre: "Guillermo y Kiriku · El reloj", crear: () => new GuillermoKirikuReloj() });
  window.__A2D_00088 = { pose, poseG, poseK, T, DUR, reloj, muneca: (t) => { const p = poseK(t); return muneca(KI, p, p.manoCerca); } };
})();
