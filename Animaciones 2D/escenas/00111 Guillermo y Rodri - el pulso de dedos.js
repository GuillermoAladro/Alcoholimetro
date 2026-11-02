"use strict";
/* 00111 · Guillermo y Rodri · La guerra de pulgares
 *
 * Negro → un rincón del bar de noche: mesita redonda de madera con dos cañas sobre sus posavasos y
 * una vela en un tarro rojo, sillas de café de madera curvada, lámpara de globo colgando. Guillermo a
 * la izquierda y Rodri a la derecha, sentados frente a frente.
 *
 * Rodri le reta levantando el puño y meneando el pulgar; Guillermo entorna los ojos, sonríe, suelta
 * la caña y contesta con el pulgar arriba de la izquierda (antebrazo tumbado sobre la mesa), y vuelve
 * a la caña. Se inclinan y se agarran las manos (¡clac!): Guillermo con la derecha (la cercana, que
 * descansaba en el muslo), Rodri con la derecha (la lejana). Miradas de duelo →
 * la cámara se lanza hacia las manos y entra el PRIMER PLANO (las dos manos enganchadas, grandes,
 * con sus pulgares articulados): el saludo (los pulgares se hacen una reverencia), tres choques de
 * punta (uno, dos, tres)… y ¡a pelear!: vueltas, amagos, esquivas (estiran y se aplastan), gotas de
 * sudor en los nudillos. Guillermo se lanza, falla; Rodri aprovecha y le PISA el pulgar (marcas de
 * presión; el de Guillermo se retuerce debajo). Entonces, por un lado del cuadro, entra a escondidas
 * la otra mano de Guillermo y le pisa a Rodri el pulgar con el índice: trampa. El pulgar de Rodri se
 * queda helado → la cámara se aleja (en el general, la izquierda de Guillermo cruza por delante del
 * pecho hasta el agarre): Rodri mira la mano tramposa, mira a Guillermo… que silba mirando al techo,
 * muy inocente (notitas), y le echa un ojo de reojo. Rodri suelta, se levanta un poco por encima de
 * la mesa, carga el índice en el pulgar delante de la frente de Guillermo (que lo mira de reojo, pillado) y ¡TOC!:
 * golpecito con el dedo en la frente. Guillermo echa la cabeza atrás con las manos al aire, marca roja
 * y estrellitas; Rodri se vuelve a sentar y se sopla el dedo como un pistolero (humito). Guillermo se
 * frota la frente haciendo pucheros, los dos miran a cámara y Rodri guiña un ojo → negro.
 *
 * El primer plano entra y sale con un acercamiento continuo de la cámara y un fundido (sin cortes),
 * y el agarre que se ve en el plano general es el mismo dibujo del primer plano, en pequeño.
 * Sin letras ni números. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, hash, campana } = M2;
  const G = Guillermo, R = Rodri;
  const DUR = 14.5;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // plano general 1: el reto
    rReta: 0.85, rMenea: 1.15, rMeneaFin: 2.05, gMira: 1.05, gEntorna: 1.45, gSonrie: 1.7, gContesta: 1.95, gMeneaFin: 2.5,
    acerca: 2.45, clac: 2.78, duelo: 2.9,
    // acercamiento al primer plano
    zoomIn0: 3.05, zoomIn1: 3.5,
    // primer plano
    reverencia: 3.75, reverenciaFin: 4.35, choques: [4.55, 4.9, 5.25], CHOQ: 0.24,
    pelea: 5.55, gLanza: 6.05, rEsquiva: 6.07, vuelta1: 6.32, rLanza: 6.55, gEsquiva: 6.57, vuelta2: 6.82,
    gLanza2: 6.95, pisa: 7.12, retuerce: 7.25, trampaEntra: 7.7, trampaPisa: 8.08, hielo: 8.12,
    // vuelta al plano general
    zoomOut0: 8.62, zoomOut1: 9.05,
    // plano general 2
    silba: 9.0, rMiraManos: 9.25, rMiraG: 9.95, gOjea: 10.25, gOjeaFin: 10.55,
    suelta: 10.65, carga: 10.85, cargado: 11.25, gBizco: 11.15, toc: 11.48,
    cae: 11.5, caido: 11.95, sopla: 12.05, soplaFin: 12.75, frota: 12.2, frotaFin: 13.4, camara: 13.15, guino: 13.55, fin: 13.95
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const MESA_D = D(0.6, 0.7, 0.66, 0.62, 0.58), PUNO_ARR = D(1, 0, 0, 0, 0), AGARRA = D(0.95, 0.3, 0.25, 0.22, 0.2),
    INDICE = D(0.15, 1, 0, 0, 0), CARGA = D(0.45, 0.05, 0, 0, 0), SUELTA = D(0.4, 1, 0.1, 0.05, 0.05), MUSLO = D(0.7, 0.82, 0.78, 0.74, 0.7),
    ABIERTA = D(1, 1), FROTA = D(0.7, 0.9, 0.9, 0.85, 0.8), SOPLA = D(0.3, 1, 0, 0, 0);

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

  /* =====================================================================================
   * DISPOSICIÓN (px del plano general, antes de la cámara)
   * ===================================================================================== */
  const S = 0.33, SUELO = 574;
  const XG = 362, XR = 664;
  const ASIENTO = 128, Y_ASIENTO = SUELO - ASIENTO, Y_PELVIS = Y_ASIENTO - 20;
  const MESA = { x: 512, y: 372, rx: 118, ry: 25, canto: 11 };
  // el agarre: centro en el plano general y escala del dibujo (unidades del primer plano → px)
  const AG = { x: 490, y: 332 }, SA = 0.2;
  const aMundo = q => ({ x: AG.x + SA * q.x, y: AG.y + SA * q.y });

  /* =====================================================================================
   * LAS MANOS ENGANCHADAS (dibujo propio, unidades del primer plano; centro del agarre en 0,0)
   * Guillermo por la izquierda (antebrazo desnudo), Rodri por la derecha (manga de plumífero).
   * ===================================================================================== */
  const FW = 30;                                              // grosor de los dedos
  const DEDOS_G = [-45, -15, 15, 45].map(y => ({ b: { x: -118, y: y + 2 }, f: { x: 16, y } }));
  const DEDOS_R = [-30, 0, 30, 60].map(y => ({ b: { x: 118, y: y + 2 }, f: { x: -16, y } }));
  const MUN_G = { x: -168, y: 8 }, MUN_R = { x: 172, y: 23 };  // muñecas (donde acaba el antebrazo del muñeco)
  const DIR_G = 2.53, DIR_R = 0.615;                            // hacia el codo (pantalla)
  const BASE_PG = { x: -50, y: -64 }, BASE_PR = { x: 50, y: -49 };
  const L1 = 50, L2 = 45, WP = 36;                              // pulgar: dos falanges

  // cadena de cápsulas: contorno con la raíz abierta (se funde con la mano) y punta redonda
  function contorno(pts, ws) {
    const n = pts.length, izq = [], der = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b.x - a.x, dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const nx = -dy, ny = dx, w = ws[i] / 2;
      izq.push({ x: pts[i].x + nx * w, y: pts[i].y + ny * w }); der.push({ x: pts[i].x - nx * w, y: pts[i].y - ny * w });
    }
    const u = pts[n - 1], v = pts[n - 2], ang = Math.atan2(u.y - v.y, u.x - v.x);
    return { izq, der, punta: u, r: ws[n - 1] / 2, ang };
  }
  function rutaSuave(g, ps, mover) {
    if (mover) g.moveTo(ps[0].x, ps[0].y); else g.lineTo(ps[0].x, ps[0].y);
    for (let i = 1; i < ps.length - 1; i++) { const m = { x: (ps[i].x + ps[i + 1].x) / 2, y: (ps[i].y + ps[i + 1].y) / 2 }; g.quadraticCurveTo(ps[i].x, ps[i].y, m.x, m.y); }
    g.lineTo(ps[ps.length - 1].x, ps[ps.length - 1].y);
  }
  function caminoCapsula(g, c) {
    g.beginPath(); rutaSuave(g, c.izq, true);
    g.arc(c.punta.x, c.punta.y, c.r, c.ang + Math.PI / 2, c.ang - Math.PI / 2, true);
    rutaSuave(g, c.der.slice().reverse(), false);
  }
  // un dedo / pulgar: relleno de piel, sombra del lado de abajo y tinta sin cerrar la raíz
  function capsula(g, pts, ws, col, lw, sombraLado = 1) {
    const c = contorno(pts, ws);
    caminoCapsula(g, c); g.closePath(); g.fillStyle = col.piel; g.fill();
    g.save(); g.clip();
    const sl = sombraLado > 0 ? c.der : c.izq;
    g.strokeStyle = col.sombra; g.lineWidth = Math.min(...ws) * 0.42; g.lineCap = "round"; g.globalAlpha = 0.85;
    g.beginPath(); rutaSuave(g, sl, true); g.stroke();
    g.restore();
    caminoCapsula(g, c); g.lineWidth = lw; g.strokeStyle = col.tinta; g.lineJoin = "round"; g.lineCap = "round"; g.stroke();
    return c;
  }
  // pulgar articulado: IK de dos falanges; lado: −1 Guillermo (articulación hacia fuera, izquierda), +1 Rodri
  function ikPulgar(b, tip, sg) {
    const dx = tip.x - b.x, dy = tip.y - b.y, d0 = Math.hypot(dx, dy) || 1;
    const d = clamp(d0, Math.abs(L1 - L2) + 6, L1 + L2 - 1);
    const a = Math.atan2(dy, dx), cA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), A = Math.acos(cA);
    const j = { x: b.x + Math.cos(a + sg * A) * L1, y: b.y + Math.sin(a + sg * A) * L1 };
    const a2 = Math.atan2(b.y + dy / d0 * d - j.y, b.x + dx / d0 * d - j.x);
    return { b, j, tip: { x: j.x + Math.cos(a2) * L2, y: j.y + Math.sin(a2) * L2 } };
  }
  function pulgar(g, th, col, lw, lado) {
    // raíz: prolonga la primera falange hacia dentro de la mano
    const ux = th.b.x - th.j.x, uy = th.b.y - th.j.y, ul = Math.hypot(ux, uy) || 1;
    const raiz = { x: th.b.x + ux / ul * 26, y: th.b.y + uy / ul * 26 };
    const w = WP * (th.w || 1);
    const c = capsula(g, [raiz, th.b, th.j, th.tip], [w * 1.55, w * 1.12, w * 0.96, w * 0.86], col, lw, lado);
    // pliegue de la articulación (del lado de dentro) y uña (del lado de fuera)
    const a2 = Math.atan2(th.tip.y - th.j.y, th.tip.x - th.j.x), nx = -Math.sin(a2), ny = Math.cos(a2);
    g.save(); g.strokeStyle = col.tinta; g.lineCap = "round"; g.lineWidth = lw * 0.55;
    const pj = { x: th.j.x - nx * lado * w * 0.22, y: th.j.y - ny * lado * w * 0.22 };
    g.beginPath(); g.moveTo(pj.x - Math.cos(a2) * 6, pj.y - Math.sin(a2) * 6); g.quadraticCurveTo(pj.x - nx * lado * 3, pj.y - ny * lado * 3, pj.x + Math.cos(a2) * 6, pj.y + Math.sin(a2) * 6); g.stroke();
    const un = { x: th.tip.x - Math.cos(a2) * w * 0.32 + nx * lado * w * 0.18, y: th.tip.y - Math.sin(a2) * w * 0.32 + ny * lado * w * 0.18 };
    g.translate(un.x, un.y); g.rotate(a2);
    g.beginPath(); g.ellipse(0, 0, w * 0.3, w * 0.2, 0, 0, Math.PI * 2); g.fillStyle = col.una; g.fill(); g.lineWidth = lw * 0.5; g.stroke();
    g.beginPath(); g.ellipse(-w * 0.06, -w * 0.05 * lado, w * 0.12, w * 0.05, 0, 0, Math.PI * 2); g.fillStyle = "rgba(255,255,255,0.7)"; g.fill();
    g.restore();
    return c;
  }
  // dorso de la mano (de la muñeca a los nudillos); sg −1 Guillermo (va a la derecha), +1 Rodri (espejo)
  function dorso(g, sg, dy, col, lw) {
    const X = x => -sg * x, Y = y => y + dy;
    const forma = () => {
      g.beginPath();
      g.moveTo(X(-176), Y(-40)); g.quadraticCurveTo(X(-150), Y(-70), X(-104), Y(-66));
      g.quadraticCurveTo(X(-92), Y(-60), X(-96), Y(-44));
      for (const yy of [-15, 15, 45]) g.quadraticCurveTo(X(-88), Y(yy - 15), X(-96), Y(yy));
      g.quadraticCurveTo(X(-92), Y(66), X(-112), Y(70)); g.quadraticCurveTo(X(-150), Y(76), X(-172), Y(58)); g.closePath();
    };
    forma(); g.fillStyle = col.piel; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = col.sombra; g.globalAlpha = 0.9;
    g.beginPath(); g.ellipse(X(-140), Y(70), 60, 22, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.5; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(X(-138), Y(-40), 26, 9, -sg * 0.2, 0, Math.PI * 2); g.fill();
    g.restore();
    forma(); g.lineWidth = lw; g.strokeStyle = col.tinta; g.lineJoin = "round"; g.stroke();
    // tendones/nudillos
    g.save(); g.strokeStyle = col.tinta; g.globalAlpha = 0.35; g.lineWidth = lw * 0.5; g.lineCap = "round";
    for (const yy of [-36, -8, 22]) { g.beginPath(); g.moveTo(X(-160), Y(yy * 0.7)); g.quadraticCurveTo(X(-130), Y(yy * 0.85), X(-108), Y(yy)); g.stroke(); }
    g.restore();
  }
  // los cuatro dedos doblados de una mano: bandas que van de los nudillos hacia el centro
  function dedos(g, lista, col, lw, apr) {
    lista.forEach((d, i) => {
      const sg = Math.sign(d.f.x - d.b.x), f = { x: d.f.x - sg * apr * 6, y: d.f.y + 9 };
      const m = { x: lerp(d.b.x, f.x, 0.5), y: d.b.y - 5 }, m2 = { x: f.x - sg * 18, y: d.f.y - 3 };
      const c = capsula(g, [d.b, m, m2, f], [FW, FW * 0.99, FW * 0.95, FW * 0.86], col, lw, sg > 0 ? -1 : 1);
      // pliegues de los nudillos del dedo
      g.save(); g.strokeStyle = col.tinta; g.lineWidth = lw * 0.45; g.lineCap = "round"; g.globalAlpha = 0.7;
      for (const k of [0.42, 0.72]) {
        const p = { x: lerp(d.b.x, f.x, k), y: lerp(d.b.y, f.y, k) - 4 * Math.sin(Math.PI * k) };
        g.beginPath(); g.moveTo(p.x - 2, p.y - FW * 0.38); g.quadraticCurveTo(p.x + 3 * Math.sign(f.x - d.b.x), p.y - FW * 0.25, p.x + 1, p.y - FW * 0.12); g.stroke();
      }
      g.restore();
      void c; void i;
    });
  }
  // antebrazo desnudo de Guillermo (solo primer plano)
  function antebrazoG(g, col, lw) {
    const forma = () => { g.beginPath(); g.moveTo(-150, -44); g.quadraticCurveTo(-330, 40, -620, 210); g.lineTo(-620, 460); g.quadraticCurveTo(-360, 300, -150, 66); g.closePath(); };
    forma(); g.fillStyle = col.piel; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = col.sombra; g.globalAlpha = 0.9;
    g.beginPath(); g.moveTo(-150, 30); g.quadraticCurveTo(-360, 250, -620, 400); g.lineTo(-620, 470); g.lineTo(-150, 70); g.closePath(); g.fill();
    g.globalAlpha = 0.35; g.strokeStyle = "#ffffff"; g.lineWidth = 10; g.lineCap = "round";
    g.beginPath(); g.moveTo(-190, -10); g.quadraticCurveTo(-340, 80, -520, 190); g.stroke();
    g.restore();
    g.strokeStyle = col.tinta; g.lineWidth = lw; g.lineJoin = "round";
    g.beginPath(); g.moveTo(-150, -44); g.quadraticCurveTo(-330, 40, -620, 210); g.stroke();
    g.beginPath(); g.moveTo(-150, 66); g.quadraticCurveTo(-360, 300, -620, 460); g.stroke();
  }
  // manga de plumífero negro de Rodri con su puño de canalé (solo primer plano)
  function mangaR(g, lw, t) {
    const forma = () => { g.beginPath(); g.moveTo(178, -40); g.bezierCurveTo(250, -66, 420, 60, 640, 190); g.lineTo(640, 500); g.bezierCurveTo(420, 380, 260, 170, 186, 98); g.closePath(); };
    forma(); g.fillStyle = "#2a2a31"; g.fill();
    g.save(); forma(); g.clip();
    // gajos del plumífero: costuras curvas y brillos
    for (let i = 0; i < 5; i++) {
      const x = 250 + i * 90, y0 = -20 + i * 54;
      g.fillStyle = "rgba(255,255,255,0.09)"; g.beginPath(); g.ellipse(x + 12, y0 + 40, 36, 70, -0.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.65)"; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 40, y0 - 30); g.quadraticCurveTo(x + 20, y0 + 70, x + 70, y0 + 170); g.stroke();
    }
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.moveTo(186, 98); g.bezierCurveTo(260, 170, 420, 380, 640, 500); g.lineTo(640, 330); g.bezierCurveTo(430, 230, 280, 110, 190, 60); g.closePath(); g.fill();
    g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = lw; g.lineJoin = "round"; g.stroke();
    // puño de canalé
    g.save(); g.translate(188, 28); g.rotate(-0.95);
    const ancho = 136, alto = 30;
    g.fillStyle = "#1c1c22"; g.beginPath(); g.roundRect(-ancho / 2, -alto / 2, ancho, alto, 10); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 3;
    for (let x = -ancho / 2 + 8; x < ancho / 2 - 4; x += 9) { g.beginPath(); g.moveTo(x, -alto / 2 + 4); g.lineTo(x, alto / 2 - 4); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = lw; g.beginPath(); g.roundRect(-ancho / 2, -alto / 2, ancho, alto, 10); g.stroke();
    g.restore();
    void t;
  }
  // la otra mano de Guillermo (la tramposa): antebrazo por la izquierda, puño y el índice que apunta abajo
  function geoTramposa(tr) {
    const ind = tr.indice, base = { x: 74, y: -20 }, th = lerp(1.25, 0.78, ind), L = lerp(34, 92, ind);
    return { base, punta: { x: base.x + Math.cos(th) * L, y: base.y + Math.sin(th) * L * (1 - 0.04 * tr.aprieta) } };
  }
  function manoTramposa(g, tr, col, lw) {
    if (!tr || tr.k <= 0) return;
    const { base, punta } = geoTramposa(tr);
    g.save(); g.translate(tr.x, tr.y); g.rotate(tr.ang); g.lineJoin = "round"; g.lineCap = "round";
    // antebrazo desnudo (sale de cuadro por la izquierda)
    const brazo = () => { g.beginPath(); g.moveTo(10, -40); g.quadraticCurveTo(-300, -52, -760, -66); g.lineTo(-760, 64); g.quadraticCurveTo(-300, 54, 10, 44); g.closePath(); };
    brazo(); g.fillStyle = col.piel; g.fill();
    g.save(); brazo(); g.clip(); g.fillStyle = col.sombra; g.beginPath(); g.moveTo(10, 20); g.quadraticCurveTo(-300, 32, -760, 30); g.lineTo(-760, 70); g.lineTo(10, 50); g.closePath(); g.fill();
    g.globalAlpha = 0.35; g.strokeStyle = "#ffffff"; g.lineWidth = 9; g.beginPath(); g.moveTo(-20, -24); g.quadraticCurveTo(-300, -36, -700, -46); g.stroke(); g.restore();
    g.strokeStyle = col.tinta; g.lineWidth = lw; g.beginPath(); g.moveTo(10, -40); g.quadraticCurveTo(-300, -52, -760, -66); g.moveTo(10, 44); g.quadraticCurveTo(-300, 54, -760, 64); g.stroke();
    // puño: dorso redondo con los nudillos delante
    const puno = () => { g.beginPath(); g.moveTo(-8, -46); g.quadraticCurveTo(40, -58, 76, -40); g.quadraticCurveTo(96, -14, 92, 18); g.quadraticCurveTo(86, 50, 54, 54); g.quadraticCurveTo(14, 58, -8, 48); g.closePath(); };
    puno(); g.fillStyle = col.piel; g.fill();
    g.save(); puno(); g.clip(); g.fillStyle = col.sombra; g.beginPath(); g.ellipse(40, 60, 70, 22, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.5; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(26, -34, 24, 8, -0.1, 0, Math.PI * 2); g.fill(); g.restore();
    puno(); g.strokeStyle = col.tinta; g.lineWidth = lw; g.stroke();
    // dedos doblados (corazón, anular y meñique): pliegues en la cara de delante
    g.lineWidth = lw * 0.6;
    for (const yy of [6, 24, 40]) { g.beginPath(); g.moveTo(58, yy - 2); g.quadraticCurveTo(80, yy + 2, 88, yy - 6); g.stroke(); }
    // índice (sale del primer nudillo) con su uña
    const medio = { x: lerp(base.x, punta.x, 0.5), y: lerp(base.y, punta.y, 0.5) };
    capsula(g, [{ x: base.x - 26, y: base.y - 4 }, base, medio, punta], [FW * 1.15, FW, FW * 0.96, FW * 0.88], col, lw, 1);
    const a = Math.atan2(punta.y - base.y, punta.x - base.x);
    g.save(); g.translate(punta.x - Math.cos(a) * 9 + Math.sin(a) * 6, punta.y - Math.sin(a) * 9 - Math.cos(a) * 6); g.rotate(a);
    g.beginPath(); g.ellipse(0, 0, 8, 5.5, 0, 0, Math.PI * 2); g.fillStyle = col.una; g.fill(); g.lineWidth = lw * 0.5; g.strokeStyle = col.tinta; g.stroke(); g.restore();
    // pulgar recogido por encima
    capsula(g, [{ x: 4, y: -30 }, { x: 30, y: -40 }, { x: 58, y: -42 }], [FW * 1.1, FW * 0.95, FW * 0.82], col, lw, -1);
    g.restore();
  }
  // punta del índice tramposo en coordenadas del agarre
  function puntaTramposa(tr) {
    const p = geoTramposa(tr).punta, c = Math.cos(tr.ang), s = Math.sin(tr.ang);
    return { x: tr.x + p.x * c - p.y * s, y: tr.y + p.x * s + p.y * c };
  }

  /* ---------- estado del agarre en el tiempo (unidades del primer plano) ---------- */
  const REPOSO_G = { x: BASE_PG.x - 10, y: BASE_PG.y - 92 }, REPOSO_R = { x: BASE_PR.x + 10, y: BASE_PR.y - 92 };
  const CHOQUE = { x: 0, y: -130 };
  // punto del pulgar de Guillermo donde lo pisa Rodri cuando lo tiene tumbado hacia la derecha
  const PULGAR_G_TUMBADO = { x: BASE_PG.x + 80, y: BASE_PG.y - 34 };
  function estado(t) {
    const out = { marcas: [], silbidos: [], sudorG: 0, sudorR: 0, apriete: 0, tramp: null, wG: 1, wR: 1 };
    let tg = Object.assign({}, REPOSO_G), tr = Object.assign({}, REPOSO_R);
    const tension = 1.2 * Math.sin(t * 13) * dentro(t, T.clac, T.clac + 0.1, T.reverencia, T.reverencia + 0.1);
    tg.x += tension; tr.x -= tension;
    // reverencia: las puntas se inclinan hacia el otro y vuelven
    const rev = campana(t, T.reverencia, T.reverenciaFin);
    tg = { x: tg.x + 52 * rev, y: tg.y + 40 * rev }; tr = { x: tr.x - 52 * rev, y: tr.y + 40 * rev };
    // tres choques de punta en el centro
    T.choques.forEach((tc, i) => {
      const k = campana(t, tc - T.CHOQ / 2, tc + T.CHOQ / 2);
      if (k > 0) { const e = Math.pow(k, 0.7); tg = mezclaP(tg, { x: CHOQUE.x - 15, y: CHOQUE.y + 2 }, e); tr = mezclaP(tr, { x: CHOQUE.x + 15, y: CHOQUE.y - 2 }, e); }
      const km = fase(t, tc - 0.02, tc + 0.3); if (km > 0 && km < 1) out.marcas.push({ x: CHOQUE.x, y: CHOQUE.y - 4, k: km, n: i + 1, tipo: "choque" });
    });
    // pelea: dan vueltas mirándose…
    const vueltas = dentro(t, T.pelea, T.pelea + 0.2, T.gLanza - 0.15, T.gLanza);
    if (vueltas > 0) {
      const w = (t - T.pelea) * 9;
      tg = mezclaP(tg, { x: REPOSO_G.x + 14 + 16 * Math.cos(w), y: REPOSO_G.y + 10 + 12 * Math.sin(w) }, vueltas);
      tr = mezclaP(tr, { x: REPOSO_R.x - 14 - 16 * Math.cos(w + 2.2), y: REPOSO_R.y + 10 + 12 * Math.sin(w + 2.2) }, vueltas);
    }
    // amago de Guillermo: se lanza; Rodri esquiva echándose a la derecha y abajo
    const gl = dentro(t, T.gLanza - 0.12, T.gLanza + 0.05, T.vuelta1 - 0.05, T.vuelta1 + 0.12);
    const anticG = campana(t, T.gLanza - 0.22, T.gLanza - 0.02);
    tg = { x: tg.x - 14 * anticG, y: tg.y + 6 * anticG };
    tg = mezclaP(tg, { x: 34, y: -112 }, gl);
    const re = dentro(t, T.rEsquiva - 0.04, T.rEsquiva + 0.08, T.vuelta1, T.vuelta1 + 0.15);
    tr = mezclaP(tr, { x: BASE_PR.x + 70, y: BASE_PR.y - 44 }, re);
    out.wR = 1 + 0.16 * re; out.wG = 1 - 0.1 * gl;
    // amago de Rodri: se lanza; Guillermo esquiva a la izquierda (gotas de sudor)
    const rl = dentro(t, T.rLanza - 0.12, T.rLanza + 0.05, T.vuelta2 - 0.05, T.vuelta2 + 0.1);
    const anticR = campana(t, T.rLanza - 0.22, T.rLanza - 0.02);
    tr = { x: tr.x + 14 * anticR, y: tr.y + 6 * anticR };
    tr = mezclaP(tr, { x: -30, y: -108 }, rl);
    const ge = dentro(t, T.gEsquiva - 0.04, T.gEsquiva + 0.08, T.vuelta2, T.vuelta2 + 0.12);
    tg = mezclaP(tg, { x: BASE_PG.x - 74, y: BASE_PG.y - 40 }, ge);
    out.wG *= 1 + 0.16 * ge; out.wR *= 1 - 0.1 * rl;
    out.sudorG = tramo(t, T.gEsquiva, T.gEsquiva + 0.3);
    // segundo ataque de Guillermo: se estira hacia Rodri… y Rodri le cae encima
    const gl2 = tramo(t, T.gLanza2, T.pisa - 0.03, salida);
    tg = mezclaP(tg, { x: PULGAR_G_TUMBADO.x + 8, y: PULGAR_G_TUMBADO.y - 12 }, gl2);
    const pis = tramo(t, T.pisa - 0.06, T.pisa + 0.04, entrada);
    tg = mezclaP(tg, PULGAR_G_TUMBADO, pis);
    // ya pisado: el de Guillermo se retuerce debajo
    const ret = dentro(t, T.retuerce, T.retuerce + 0.1, T.trampaPisa, T.trampaPisa + 0.2);
    tg = { x: tg.x + 5 * Math.sin(t * 38) * ret, y: tg.y + 7 * Math.sin(t * 29 + 1) * ret - 4 * ret };
    out.sudorG = Math.max(out.sudorG, ret);
    // dónde pisa Rodri: un poco antes de la punta del de Guillermo (calculado sobre su pulgar)
    const thG = ikPulgar(BASE_PG, tg, -1);
    const sobre = { x: lerp(thG.j.x, thG.tip.x, 0.35), y: lerp(thG.j.y, thG.tip.y, 0.35) - WP * 0.86 };
    const sube = campana(t, T.gLanza2 + 0.02, T.pisa - 0.02);
    const objR = { x: sobre.x + 10 - 6 * sube, y: sobre.y - 34 * sube };
    const kp = tramo(t, T.gLanza2 + 0.02, T.pisa - 0.02, suave);
    tr = mezclaP(tr, objR, kp);
    // aprieta: latidos de presión mientras le tiene pisado (y se queda helado con la trampa)
    const lat = dentro(t, T.pisa, T.pisa + 0.05, T.hielo, T.hielo + 0.02);
    const pulso = Math.max(0, Math.sin((t - T.pisa) * 17)) * lat;
    tr = { x: tr.x, y: tr.y + 3 * pulso };
    out.apriete = pis;
    if (t > T.pisa - 0.02) for (let i = 0; i < 2; i++) { const t0 = T.pisa + i * 0.35; const k = fase(t, t0, t0 + 0.32); if (k > 0 && k < 1) out.marcas.push({ x: sobre.x + 12, y: sobre.y + 6, k, tipo: "presion" }); }
    // la mano tramposa: entra deslizándose desde la izquierda y pisa con el índice
    const ent = tramo(t, T.trampaEntra, T.trampaPisa - 0.08, salida);
    if (ent > 0) {
      const thR0 = ikPulgar(BASE_PR, tr, 1);
      const meta = { x: lerp(thR0.j.x, thR0.tip.x, 0.25), y: lerp(thR0.j.y, thR0.tip.y, 0.25) - WP * 0.42 };
      const presiona = tramo(t, T.trampaPisa - 0.06, T.trampaPisa + 0.02, entrada);
      const tramp = { k: ent, ang: lerp(0.12, 0.16, presiona), indice: lerp(0.15, 1, tramo(t, T.trampaPisa - 0.32, T.trampaPisa - 0.08)), aprieta: presiona, x: 0, y: 0 };
      // coloca la mano para que la punta del índice caiga en la meta (más un poco arriba si aún no pisa)
      const pt = puntaTramposa(Object.assign({}, tramp, { x: 0, y: 0 }));
      const fx = meta.x - pt.x, fy = meta.y - pt.y - 22 * (1 - presiona);
      tramp.x = lerp(-640, fx, ent); tramp.y = lerp(fy - 40, fy, ent);
      out.tramp = tramp;
      // el pulgar de Rodri se aplasta un pelín bajo el dedo y se queda helado
      tr = { x: tr.x, y: tr.y + 4 * presiona };
      out.wR = (out.wR || 1) * (1 + 0.1 * presiona);
      if (presiona > 0) { const k = fase(t, T.trampaPisa, T.trampaPisa + 0.4); if (k > 0 && k < 1) out.marcas.push({ x: meta.x + 4, y: meta.y - 6, k, tipo: "presion" }); }
      out.sudorR = tramo(t, T.hielo + 0.1, T.hielo + 0.4);
      out.hielo = tramo(t, T.hielo, T.hielo + 0.1);
    }
    out.g = ikPulgar(BASE_PG, tg, -1); out.g.w = out.wG;
    out.r = ikPulgar(BASE_PR, tr, 1); out.r.w = out.wR;
    out.lanzaG = Math.max(gl, gl2 * (1 - pis)); out.lanzaR = Math.max(rl, kp * (1 - pis));
    return out;
  }
  const mezclaP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });

  const colG = () => ({ piel: G.C.piel, sombra: G.C.pielSombra, tinta: TINTA, una: "#f6c9b6" });
  const colR = () => ({ piel: R.C.piel, sombra: R.C.pielSombra, tinta: TINTA, una: "#f6c9b6" });
  // el agarre completo (sin antebrazos). lw: grosor de tinta en unidades del primer plano
  function agarre(g, st, lw, conBrazos, t) {
    const cG = colG(), cR = colR();
    if (conBrazos) mangaR(g, lw, t);
    dorso(g, 1, 15, cR, lw);
    dedos(g, DEDOS_R, cR, lw, st.apriete * 0.4);
    if (conBrazos) antebrazoG(g, cG, lw);
    dorso(g, -1, 0, cG, lw);
    dedos(g, DEDOS_G, cG, lw, st.apriete * 0.4);
    // gotas de sudor en los nudillos
    if (st.sudorG > 0.01) gotas(g, -130, -68, st.sudorG, t, 0);
    if (st.sudorR > 0.01) gotas(g, 132, -52, st.sudorR, t, 3);
    // pulgares: el de Rodri encima (le pisa)
    pulgar(g, st.g, cG, lw, -1);
    pulgar(g, st.r, cR, lw, 1);
  }
  function gotas(g, x, y, k, t, sem) {
    for (let i = 0; i < 2; i++) {
      const ph = ((t * 0.9 + hash(i + sem)) % 1), yy = y + 18 * ph + i * 8, xx = x + (i ? 22 : -8);
      g.save(); g.globalAlpha = k * (1 - ph * 0.6); g.translate(xx, yy); g.scale(1, 1);
      g.beginPath(); g.moveTo(0, -11); g.quadraticCurveTo(8, 0, 0, 7); g.quadraticCurveTo(-8, 0, 0, -11); g.fillStyle = "#bfe8ff"; g.fill();
      g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-2, -1, 2, 3, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
  }

  /* ---------- efectos del primer plano ---------- */
  function marcasPrimerPlano(g, st, t) {
    for (const m of st.marcas) {
      const a = Math.sin(Math.PI * m.k);
      g.save(); g.translate(m.x, m.y); g.lineCap = "round";
      if (m.tipo === "choque") {
        // estallido de choque: rayitas y tantos puntitos como golpes llevan
        g.strokeStyle = `rgba(255,236,170,${0.95 * a})`; g.lineWidth = 6;
        for (let i = 0; i < 7; i++) { const an = -Math.PI / 2 + (i - 3) * 0.38, r0 = 26 + 16 * m.k; g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * (r0 + 16), Math.sin(an) * (r0 + 16)); g.stroke(); }
      } else {
        g.strokeStyle = `rgba(255,255,255,${0.9 * a})`; g.lineWidth = 5;
        for (const an of [-2.6, -2.0, -1.2, -0.55]) { const r0 = 20 + 14 * m.k; g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * (r0 + 13), Math.sin(an) * (r0 + 13)); g.stroke(); }
      }
      g.restore();
    }
    // contador de choques (puntitos que se encienden: uno, dos, tres)
    const vis = dentro(t, T.choques[0] - 0.1, T.choques[0], T.pelea + 0.1, T.pelea + 0.35);
    if (vis > 0.01) {
      g.save(); g.globalAlpha = vis;
      for (let i = 0; i < 3; i++) {
        const on = tramo(t, T.choques[i] - 0.02, T.choques[i] + 0.08), x = -36 + i * 36, y = -230;
        g.beginPath(); g.arc(x, y, 9 + 4 * on, 0, Math.PI * 2); g.fillStyle = on > 0.5 ? "#ffd65a" : "rgba(255,255,255,0.25)"; g.fill();
        g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
      }
      g.restore();
    }
    // rayas de velocidad de los ataques
    rayasAtaque(g, st.g, st.lanzaG, -1);
    rayasAtaque(g, st.r, st.lanzaR, 1);
    // hielo: el pulgar de Rodri se queda tieso (rayitas de «¡quieto!»)
    if (st.hielo > 0.01) {
      const p = st.r.j, a = st.hielo * (1 - tramo(t, T.zoomOut0, T.zoomOut0 + 0.2));
      g.save(); g.strokeStyle = `rgba(190,230,255,${0.9 * a})`; g.lineWidth = 5; g.lineCap = "round";
      for (const [dx, dy, an] of [[44, -14, -0.4], [52, 10, 0], [40, 32, 0.4]]) { g.beginPath(); g.moveTo(p.x + dx, p.y + dy); g.lineTo(p.x + dx + Math.cos(an) * 16, p.y + dy + Math.sin(an) * 16); g.stroke(); }
      g.restore();
    }
  }
  function rayasAtaque(g, th, k, lado) {
    if (k <= 0.05 || k >= 0.98) return;
    const a = Math.atan2(th.tip.y - th.j.y, th.tip.x - th.j.x);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * Math.sin(Math.PI * k)})`; g.lineWidth = 4; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      const p = { x: th.tip.x - Math.cos(a) * 30 + Math.sin(a) * i * 12, y: th.tip.y - Math.sin(a) * 30 - Math.cos(a) * i * 12 };
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - Math.cos(a) * 34, p.y - Math.sin(a) * 34); g.stroke();
    }
    g.restore();
    void lado;
  }

  /* ---------- fondo del primer plano (se pinta una vez, desenfocado) ---------- */
  let fondoPP = null;
  function creaFondoPP() {
    const c = document.createElement("canvas"); c.width = 1400; c.height = 900; const g = c.getContext("2d");
    g.translate(700, 450);
    // pared del bar al fondo, cálida y desenfocada
    const gr = g.createLinearGradient(0, -450, 0, 120); gr.addColorStop(0, "#1c120d"); gr.addColorStop(1, "#3a2416");
    g.fillStyle = gr; g.fillRect(-700, -450, 1400, 900);
    g.filter = "blur(10px)";
    // luces de bokeh
    for (let i = 0; i < 26; i++) {
      const x = -680 + hash(i) * 1360, y = -430 + hash(i + 40) * 420, r = 18 + 34 * hash(i + 80);
      const col = ["255,190,110", "255,150,80", "255,220,160", "200,120,70"][i % 4];
      g.fillStyle = `rgba(${col},${0.18 + 0.25 * hash(i + 5)})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    // las cañas, desenfocadas, a los lados de la mesa
    for (const [x, y, s] of [[-470, 10, 1.1], [500, -10, 1.05]]) {
      g.fillStyle = "rgba(230,150,40,0.55)"; g.fillRect(x - 60 * s, y - 200 * s, 120 * s, 210 * s);
      g.fillStyle = "rgba(255,245,225,0.6)"; g.fillRect(x - 64 * s, y - 238 * s, 128 * s, 44 * s);
      g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x - 40 * s, y - 190 * s, 16 * s, 190 * s);
    }
    // la vela en su tarro rojo, al fondo
    g.fillStyle = "rgba(255,200,110,0.5)"; g.beginPath(); g.arc(120, -40, 110, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(190,40,40,0.6)"; g.fillRect(84, -40, 72, 90);
    g.filter = "none";
    // mesa: tablero de madera en perspectiva
    const gm = g.createLinearGradient(0, 60, 0, 450); gm.addColorStop(0, "#6a3d1f"); gm.addColorStop(1, "#3d200e");
    g.fillStyle = gm; g.beginPath(); g.moveTo(-700, 70); g.lineTo(700, 50); g.lineTo(700, 450); g.lineTo(-700, 450); g.closePath(); g.fill();
    g.strokeStyle = "rgba(20,8,2,0.5)"; g.lineWidth = 3;
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(i * 60, 60 - i * 1.2); g.lineTo(i * 190, 450); g.stroke(); }
    g.strokeStyle = "rgba(255,210,160,0.12)"; g.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const x0 = -700 + hash(i + 200) * 1400, y0 = 80 + hash(i + 300) * 360; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 60, y0 + 6, x0 + 140, y0 + 2); g.stroke(); }
    g.fillStyle = "rgba(255,230,180,0.2)"; g.fillRect(-700, 58, 1400, 8);
    // viñeta
    const gv = g.createRadialGradient(0, -20, 220, 0, 0, 820); gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = gv; g.fillRect(-700, -450, 1400, 900);
    return c;
  }

  /* ---------- cámara del primer plano ---------- */
  const PP = { k: 1.3, fx: 0, fy: -42 };
  function camPP(t) {
    // un respiro de cámara: se acerca un poco en la pelea y en el pisotón
    const a = tramo(t, T.pelea, T.pelea + 0.6), b = tramo(t, T.pisa - 0.1, T.pisa + 0.3), c = tramo(t, T.trampaEntra, T.trampaPisa);
    let k = PP.k * (1 + 0.05 * a + 0.05 * b - 0.08 * c), fx = PP.fx - 20 * b - 40 * c, fy = PP.fy + 6 * b - 22 * c;
    // sacudida al pisar
    const u = t - T.pisa; if (u > 0 && u < 0.4) { const s = Math.exp(-u * 10) * Math.sin(u * 60); fy += 3 * s; }
    const u2 = t - T.trampaPisa; if (u2 > 0 && u2 < 0.4) { const s = Math.exp(-u2 * 10) * Math.sin(u2 * 60); fy += 2 * s; }
    return { k, fx, fy };
  }
  function pintaPrimerPlano(g, t, cam) {
    if (!fondoPP) fondoPP = creaFondoPP();
    const st = estado(t);
    // fondo con algo de paralaje (siempre cubre la pantalla)
    const kb = Math.max(1, 0.82 + 0.18 * cam.k / PP.k);
    g.save(); g.translate(W / 2 - cam.fx * 0.25, H / 2 - cam.fy * 0.2); g.scale(kb, kb); g.drawImage(fondoPP, -700, -450); g.restore();
    g.save(); g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.fx, -cam.fy);
    // sombra de las manos en la mesa
    g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(0, 150, 260, 34, 0, 0, Math.PI * 2); g.fill();
    agarre(g, st, 5.5, true, t);
    manoTramposa(g, st.tramp, colG(), 5.5);
    marcasPrimerPlano(g, st, t);
    g.restore();
  }

  /* =====================================================================================
   * PISTAS DE MANOS (plano general): [t0, t1, objetivo] con objetivo {x, y, mu, d} o función (t) → {…}
   * ===================================================================================== */
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  const mezclaM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerpAng(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k), puno: lerp(a.puno ?? 1, b.puno ?? 1, k) });
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaM(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: m.puno ?? 1, dedos: m.d, dobla, objeto };
  }
  // ¿están agarrados? (de ¡clac! hasta que suelta Rodri)
  const agarrados = t => t >= T.clac && t < T.suelta;
  // mano del muñeco que coincide con su muñeca en el dibujo del agarre
  function manoDeMuneca(rig, mun, dir) {
    const w = aMundo(mun), r = rig.MUNECA_R * rig.JK * S * rig.K;
    return { x: w.x - Math.cos(dir) * r, y: w.y - Math.sin(dir) * r, mu: dir };
  }
  const bocaPant = (rig, p) => rig.aPantalla(p, rig.boca(p));

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const PEL_G = G.SUELO + (Y_PELVIS - SUELO) / S - G.PELVIS.y;
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.15, sd: 6, gd: 0.03, si: 8, gi: 0.04, sonr: 0.35 }),
    mira: E({ mx: 0.8, my: -0.1, c: 0.05, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 4, ancho: 0.9, sonr: 0.2 }),
    entorna: E({ mx: 0.85, my: -0.05, c: 0.55, sd: -6, gd: -0.12, si: -2, gi: -0.08, sonr: 0.3, ancho: 0.95 }),
    pique: E({ mx: 0.85, my: -0.05, c: 0.5, sd: -8, gd: -0.14, si: 6, gi: 0.02, abre: 8, ancho: 1.1, sonr: 0.85 }),
    duelo: E({ mx: 0.85, my: 0, c: 0.62, z: 0.2, sd: -10, gd: -0.16, si: -10, gi: -0.16, abre: 10, ancho: 1.0, sonr: 0.4 }),
    silba: E({ mx: -0.35, my: -0.7, c: 0.3, sd: 16, gd: 0.08, si: 16, gi: 0.08, abre: 9, ancho: 0.34, sonr: 0.0, dientes: 0 }),
    ojea: E({ mx: 0.85, my: -0.05, c: 0.25, sd: 10, gd: 0.05, si: 10, gi: 0.05, abre: 9, ancho: 0.34, sonr: 0.0, dientes: 0 }),
    pillado: E({ mx: 0.9, my: -0.45, iris: 0.8, c: 0, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 6, ancho: 0.5, sonr: -0.2 }),
    toc: E({ mx: 0, my: 0, c: 1, z: 0.9, sd: 18, gd: 0.18, si: 18, gi: 0.18, abre: 22, ancho: 0.7, sonr: -0.4 }),
    mareo: E({ mx: 0.2, my: 0, c: 0.15, esp: 1, sd: 10, gd: 0.1, si: 10, gi: 0.1, abre: 12, ancho: 0.7, sonr: -0.2 }),
    puchero: E({ mx: -0.8, my: 0.05, c: 0.35, sd: 22, gd: 0.22, si: 22, gi: 0.22, abre: 0, ancho: 0.6, sonr: -0.55, mof: 0.4 })
  };
  const GUION_CARA_G = [
    [T.gMira - 0.1, T.gMira + 0.15, "mira"], [T.gEntorna, T.gEntorna + 0.2, "entorna"], [T.gSonrie, T.gSonrie + 0.2, "pique"],
    [T.duelo - 0.1, T.duelo + 0.15, "duelo"],
    [T.silba, T.silba + 0.2, "silba"], [T.gOjea, T.gOjea + 0.08, "ojea"], [T.gOjeaFin, T.gOjeaFin + 0.1, "silba"],
    [T.gBizco - 0.05, T.gBizco + 0.1, "pillado"], [T.toc - 0.02, T.toc + 0.04, "toc", salida], [T.caido, T.caido + 0.2, "mareo"],
    [T.frota + 0.3, T.frota + 0.6, "puchero"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.06, cab: 0.04, dx: 0, dy: 0 }, mira: { torso: 0.1, cab: 0.06, dx: 0, dy: 0 },
    contesta: { torso: 0.16, cab: -0.02, dx: 4, dy: 0 }, agarra: { torso: 0.3, cab: 0.04, dx: 14, dy: 0 },
    duelo: { torso: 0.32, cab: 0.08, dx: 16, dy: 0 },
    trampa: { torso: 0.36, cab: 0.06, dx: 20, dy: -2 }, silba: { torso: 0.38, cab: -0.24, dx: 22, dy: -2 },
    ojea: { torso: 0.38, cab: 0.04, dx: 22, dy: -2 }, toc: { torso: 0.12, cab: -0.42, dx: 8, dy: -2 },
    caido: { torso: -0.12, cab: -0.08, dx: -6, dy: 2 }, frota: { torso: 0.04, cab: 0.1, dx: 0, dy: 0 }, camara: { torso: 0.04, cab: -0.04, dx: 0, dy: 0 }
  };
  const GUION_CUERPO_G = [
    [T.gMira - 0.1, T.gMira + 0.3, "mira"], [T.gContesta - 0.15, T.gContesta + 0.2, "contesta"], [T.acerca, T.clac, "agarra"],
    [T.duelo, T.duelo + 0.3, "duelo"],
    // (durante el primer plano se inclina más para poder hacer trampa)
    [T.zoomIn1, T.zoomOut0, "trampa"], [T.silba, T.silba + 0.3, "silba"], [T.gOjea, T.gOjea + 0.12, "ojea"], [T.gOjeaFin, T.gOjeaFin + 0.12, "silba"],
    [T.gBizco - 0.1, T.gBizco + 0.1, "ojea"], [T.toc, T.toc + 0.08, "toc", salida], [T.cae, T.caido, "caido", suave], [T.frota, T.frota + 0.4, "frota"],
    [T.camara, T.camara + 0.3, "camara"]
  ];

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx / S, y: G.PELVIS.y + PEL_G + b.dy / S + respira * 1.3 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // silbando: cabecea al compás
    const sil = dentro(t, T.silba, T.silba + 0.2, T.gBizco - 0.1, T.gBizco);
    p.cabeza.ang += 0.05 * Math.sin((t - T.silba) * 6.5) * sil;
    // el toc: latigazo hacia atrás con rebote
    const u = t - T.toc;
    if (u > 0) { const r = Math.exp(-u * 7) * Math.sin(u * 26); p.cabeza.ang -= 0.1 * r; }
    for (const [lado, dx, dy] of [["cerca", 262, 0], ["lejos", 318, -10]]) {
      let x = G.PELVIS.x + dx, y = TOB_G + dy, ang = 0;
      // al caer hacia atrás se le levantan los pies
      const pie = campana(t, T.toc, T.caido + 0.1);
      if (lado === "lejos") { y -= 30 * pie; ang -= 0.4 * pie; } else { y -= 18 * pie; ang -= 0.25 * pie; }
      p.piernas[lado] = { tob: { x, y }, ang };
    }
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // los labios del silbido tiemblan; mira de reojo
    ex.ancho += 0.04 * Math.sin(t * 22) * sil;
    p.cara = cara(ex, parpadeo(t, [0.6, 2.3, 9.6, 12.6]));
    p.sudor = 0.8 * dentro(t, T.gOjea, T.gOjea + 0.1, T.toc, T.toc + 0.05) + 0.4 * dentro(t, T.duelo, T.duelo + 0.2, T.zoomIn1, T.zoomIn1 + 0.1);
    p.rojo = 0.3 * dentro(t, T.gBizco, T.gBizco + 0.2, T.caido, T.caido + 0.4);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt);
    return p;
  }
  const MUSLO_G = { x: 330, y: 404, mu: -1.95, d: MUSLO };
  function manosG(p, t) {
    // la lejana (la izquierda, junto a la caña) contesta al reto con el pulgar arriba, el antebrazo
    // tumbado sobre la mesa; luego vuelve a la caña… y más tarde hace trampa. La cercana (la derecha)
    // descansa en el muslo y es la que agarra.
    const arriba = { x: 470, y: 344, mu: Math.PI + 0.12, d: D(0.8, 0, 0, 0, 0) };
    const menea = t2 => ({ x: arriba.x, y: arriba.y + 2 * Math.sin(t2 * 20), mu: arriba.mu + 0.05 * Math.sin(t2 * 20), d: D(0.72 + 0.16 * Math.abs(Math.sin((t2 - T.gContesta) * 11)), 0, 0, 0, 0) });
    const enAgarre = Object.assign(manoDeMuneca(G, MUN_G, DIR_G), { d: AGARRA, puno: 0 });
    const preAgarre = Object.assign(manoDeMuneca(G, MUN_G, DIR_G), { d: AGARRA, puno: 1 });
    preAgarre.x -= 12; preAgarre.y -= 4;
    const tieso = Object.assign({}, enAgarre, { d: D(0.2, 0.35, 0.35, 0.32, 0.3), puno: 1 });
    const PC = [
      [0, 0, MUSLO_G],
      [T.acerca, T.clac - 0.02, preAgarre],
      [T.clac - 0.02, T.clac, enAgarre, entrada],
      // suelta Rodri: la mano se queda medio abierta, y sale volando con el toc
      [T.suelta, T.suelta + 0.06, tieso],
      [T.toc, T.toc + 0.18, { x: 410, y: 270, mu: 2.2, d: ABIERTA }, salida],
      [T.caido - 0.1, T.caido + 0.2, MUSLO_G]
    ];
    let c = pista(PC, t);
    if (t >= T.clac && t < T.suelta) c = Object.assign({}, enAgarre);
    p.manoCerca = manoRig(G, p, c, -1, null);
    const mesa = { x: 444, y: 362, mu: 2.75, d: MESA_D };
    // la tramposa: va a pisarle el pulgar a Rodri (durante el primer plano) y se queda ahí silbando
    const pisar = t2 => { const st = estado(Math.min(t2, T.zoomOut0)); if (!st.tramp) return mesa; const pt = aMundo(puntaTramposa(st.tramp)); return dedoEn(G, pt, 2.75); };
    const PL = [
      [0, 0, mesa],
      [T.gContesta - 0.3, T.gContesta, arriba],
      [T.gContesta, T.gContesta + 0.05, menea],
      [T.acerca, T.acerca + 0.3, mesa],
      [T.zoomIn1, T.zoomOut0, pisar],
      [T.suelta + 0.05, T.suelta + 0.35, { x: 446, y: 352, mu: 2.75, d: MESA_D }],
      [T.toc, T.toc + 0.18, { x: 462, y: 262, mu: 2.4, d: ABIERTA }, salida],
      [T.caido - 0.1, T.caido + 0.15, { x: 440, y: 340, mu: 2.4, d: ABIERTA }],
      // se frota la frente con esa mano
      [T.frota, T.frota + 0.35, t2 => frenteG(p, t2)],
      [T.frotaFin, T.frotaFin + 0.35, mesa]
    ];
    const l = pista(PL, t);
    // de la trampa al toc, codo hacia dentro: el antebrazo cruza por delante del pecho (como en el primer plano)
    const cruzado = t >= T.zoomIn1 && t < T.caido - 0.1;
    p.manoLejos = manoRig(G, p, l, cruzado ? 1 : -1, null);
  }
  // Guillermo con los brazos hacia delante: el relleno de camiseta que une cada brazo con su hombro
  // (hombrosContinuos) asoma por fuera de la silueta del torso. Se recorta lo que sobresale por detrás
  // de la espalda (brazo cercano: del agarre hasta que vuelve al muslo; el recorte entra y sale
  // deslizándose para que no salte) y, mientras el brazo lejano cruza el pecho, lo que sobresale por
  // delante del pecho a la altura del hombro lejano, salvo los antebrazos y las manos.
  const ESPALDA = [[128, 292], [124, 360], [122, 428]];
  const PECHO = [[350, 336], [346, 360], [343, 410], [412, 410], [412, 336]];
  function dibujaG(g, p, t) {
    const kE = Math.min(tramo(t, T.acerca, T.clac), 1 - tramo(t, T.caido - 0.1, T.caido + 0.2));
    const kP = t >= T.zoomIn1 && t < T.caido - 0.1;
    if (kE <= 0.001 && !kP) { G.dibujar(g, p, t); return; }
    const Tr = G.tronco(p), deTronco = ([x, y]) => G.aPantalla(p, Tr({ x, y })), deHoja = ([x, y]) => G.aPantalla(p, { x, y });
    const area = q => { let a = 0; for (let i = 0; i < q.length; i++) { const u = q[i], v = q[(i + 1) % q.length]; a += u.x * v.y - v.x * u.y; } return a; };
    // polígono con el sentido de giro pedido (recorte "nonzero": +1 se ve, −1 resta)
    const poli = (q, signo) => { if (Math.sign(area(q)) !== signo) q = q.slice().reverse(); g.moveTo(q[0].x, q[0].y); for (let i = 1; i < q.length; i++) g.lineTo(q[i].x, q[i].y); g.closePath(); };
    // franja (en la hoja) de a a b con medio ancho w, alargada w por cada punta
    const franja = (a, b, w) => {
      const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, c = (b.x - a.x) / L, s = (b.y - a.y) / L, nx = -s * w, ny = c * w;
      const ax = a.x - c * w, ay = a.y - s * w, bx = b.x + c * w, by = b.y + s * w;
      return [[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]].map(deHoja);
    };
    const muneca = m => ({ x: m.x + Math.cos(m.mu) * G.MUNECA_R * G.JK, y: m.y + Math.sin(m.mu) * G.MUNECA_R * G.JK });
    const haciaCodo = (m, d) => ({ x: m.x + Math.cos(m.mu) * d, y: m.y + Math.sin(m.mu) * d });
    g.save(); g.beginPath();
    poli([{ x: -5000, y: -5000 }, { x: 5000, y: -5000 }, { x: 5000, y: 5000 }, { x: -5000, y: 5000 }], 1);
    if (kE > 0.001) { const dx = -(1 - kE) * 110; poli([...ESPALDA.map(([x, y]) => [x + dx, y]), [-300, 428], [-300, 292]].map(deTronco), -1); }
    if (kP) {
      poli(PECHO.map(deTronco), -1);
      // antebrazo y mano cercanos (la mano solo cuando se ve)
      const mC = p.manoCerca, wC = muneca(mC);
      poli(franja(haciaCodo(mC, G.MUNECA_R * G.JK + 20), haciaCodo(mC, 150), 20), 1);
      if ((mC.puno ?? 1) > 0.01) poli(franja(haciaCodo(mC, -40), wC, 30), 1);
      // antebrazo lejano (codo de verdad, con la misma IK que el muñeco) y su mano
      const mL = p.manoLejos, wL = muneca(mL), hL = Tr(G.HOMBRO);
      const c = Recortes.ik(hL, wL, G.BRAZO_L, G.BRAZO_L * 0.5, 42, mL.dobla ?? -1, 1.08);
      const codo = { x: hL.x + Math.cos(c.a1) * c.sj * c.estira, y: hL.y + Math.sin(c.a1) * c.sj * c.estira };
      poli(franja(codo, wL, 22), 1);
      poli(franja(haciaCodo(mL, -55), wL, 32), 1);
    }
    g.clip("nonzero"); G.dibujar(g, p, t); g.restore();
  }
  // mano con el índice estirado cuya punta cae en `pt` (pantalla); mu = hacia el codo
  function dedoEn(rig, pt, mu) {
    const largo = 19 * rig.JK * S * rig.K;      // de centro de la mano a la punta del índice
    return { x: pt.x + Math.cos(mu) * largo, y: pt.y + Math.sin(mu) * largo, mu, d: INDICE };
  }
  // mano en la frente (se la frota)
  const FRENTE_G = { x: 742, y: 468 };
  function frenteG(p, t) {
    const H = G.cabeza(p), f = G.aPantalla(p, H.a(FRENTE_G));
    const fr = Math.sin((t - T.frota) * 14) * 3 * dentro(t, T.frota + 0.3, T.frota + 0.4, T.frotaFin - 0.1, T.frotaFin);
    return { x: f.x + 12 + fr, y: f.y + 8, mu: 2.0, d: FROTA };
  }

  /* ---------- capa de la cara de Guillermo: marca roja del toc ---------- */
  function capaCabezaG(g, t) {
    const k = tramo(t, T.toc, T.toc + 0.06);
    if (k <= 0.001) return;
    const late = 1 + 0.08 * Math.sin((t - T.toc) * 9) * Math.exp(-(t - T.toc) * 0.8);
    g.save(); g.translate(FRENTE_G.x, FRENTE_G.y); g.scale(k * late, k * late);
    g.fillStyle = "rgba(230,40,40,0.55)"; g.beginPath(); g.ellipse(0, 0, 34, 26, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,90,90,0.6)"; g.beginPath(); g.ellipse(-4, -3, 18, 13, -0.2, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * RODRI (derecha, mira a la izquierda)
   * ===================================================================================== */
  const PEL_R = R.SUELO + (Y_PELVIS - SUELO) / (S * R.K) - R.PELVIS.y;
  const TOB_R = R.SUELO - R.TOBILLO_ALTO;
  const CARAS_R = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.1, sonr: 0.45 }),
    reta: E({ mx: 0.85, my: -0.05, c: 0.4, h: 0.3, abre: 6, ancho: 1.05, sonr: 0.85 }),
    duelo: E({ mx: 0.85, my: 0, c: 0.6, z: 0.15, abre: 8, ancho: 1.0, sonr: 0.45 }),
    pasmado: E({ mx: 0.6, my: 0.65, iris: 0.8, c: 0, abre: 12, ancho: 0.6, sonr: -0.1 }),
    seco: E({ mx: 0.85, my: -0.1, c: 0.55, abre: 0, ancho: 0.8, sonr: -0.15 }),
    carga: E({ mx: 0.85, my: -0.1, c: 0.45, abre: 4, ancho: 1.0, sonr: 0.55 }),
    sopla: E({ mx: 0.4, my: -0.2, c: 0.6, h: 0.4, abre: 6, ancho: 0.32, sonr: 0.1, dientes: 0 }),
    risa: E({ mx: 0.85, my: 0, c: 0.7, h: 0.8, abre: 16, ancho: 1.1, sonr: 0.95 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, h: 0.3, abre: 6, ancho: 1.05, sonr: 0.85 })
  };
  const GUION_CARA_R = [
    [T.rReta - 0.1, T.rReta + 0.15, "reta"], [T.duelo - 0.1, T.duelo + 0.15, "duelo"],
    [T.zoomOut0, T.zoomOut0 + 0.1, "pasmado"], [T.rMiraG, T.rMiraG + 0.35, "seco"], [T.carga, T.carga + 0.2, "carga"],
    [T.toc + 0.05, T.toc + 0.2, "risa"], [T.sopla, T.sopla + 0.15, "sopla"], [T.soplaFin, T.soplaFin + 0.15, "risa"], [T.camara + 0.1, T.camara + 0.35, "camara"]
  ];
  const CUERPOS_R = {
    inicio: { torso: 0.06, cab: 0.04, dx: 0, dy: 0 }, reta: { torso: 0.14, cab: -0.06, dx: 0, dy: 0 },
    agarra: { torso: 0.2, cab: 0.04, dx: -4, dy: 0 }, duelo: { torso: 0.24, cab: 0.08, dx: -6, dy: 0 },
    pasmado: { torso: 0.22, cab: 0.2, dx: -6, dy: 0 }, seco: { torso: 0.2, cab: 0.04, dx: -6, dy: 0 },
    carga: { torso: 0.24, cab: 0.06, dx: -36, dy: -58 }, toc: { torso: 0.28, cab: 0.02, dx: -38, dy: -58 },
    sopla: { torso: 0.06, cab: -0.12, dx: 0, dy: 0 }, camara: { torso: 0.04, cab: -0.04, dx: 0, dy: 0 }
  };
  const GUION_CUERPO_R = [
    [T.rReta - 0.1, T.rReta + 0.25, "reta"], [T.acerca, T.clac, "agarra"], [T.duelo, T.duelo + 0.3, "duelo"],
    [T.zoomOut0, T.rMiraManos + 0.25, "pasmado"], [T.rMiraG, T.rMiraG + 0.35, "seco"], [T.carga, T.cargado, "carga"],
    [T.toc - 0.06, T.toc + 0.02, "toc", entrada], [T.sopla - 0.2, T.sopla + 0.2, "sopla"], [T.camara, T.camara + 0.3, "camara"]
  ];
  function poseR(t) {
    const b = guion(GUION_CUERPO_R, CUERPOS_R, "inicio", t);
    const respira = Math.sin(t * 2.1 + 0.7);
    const p = {
      x: XR, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: R.PELVIS.x - b.dx / S, y: R.PELVIS.y + PEL_R + b.dy / S + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // la risa le sacude los hombros
    const ri = dentro(t, T.toc + 0.05, T.toc + 0.2, T.sopla - 0.1, T.sopla) + dentro(t, T.soplaFin, T.soplaFin + 0.1, T.camara, T.camara + 0.2);
    p.torso += 0.03 * Math.sin(t * 24) * ri; p.cabeza.ang += 0.04 * Math.sin(t * 24 + 1) * ri;
    for (const [lado, dx, dy] of [["cerca", 258, 0], ["lejos", 312, -10]]) p.piernas[lado] = { tob: { x: R.PELVIS.x + dx, y: TOB_R + dy }, ang: 0 };
    const ex = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.6, 4.0, 9.65, 10.4, 12.9]) + 0.0);
    // guiño final
    const gu = campana(t, T.guino, T.guino + 0.35);
    p.cara.ojos.d = clamp(p.cara.ojos.d + gu); p.cara.boca.sonrisa = Math.max(p.cara.boca.sonrisa, 0.6 * gu + p.cara.boca.sonrisa * (1 - gu));
    p.sudor = 0.0;
    manosR(p, t);
    return p;
  }
  function manosR(p, t) {
    const mesa = { x: 590, y: 364, mu: 0.45, d: MESA_D };
    const arriba = { x: 534, y: 344, mu: 0, d: PUNO_ARR };
    const menea = t2 => ({ x: arriba.x, y: arriba.y + 2.5 * Math.sin(t2 * 18), mu: 0.06 * Math.sin(t2 * 18), d: D(0.82 + 0.18 * Math.abs(Math.sin((t2 - T.rMenea) * 11)), 0, 0, 0, 0) });
    const enAgarre = Object.assign(manoDeMuneca(R, MUN_R, DIR_R), { d: AGARRA, puno: 0 });
    const preAgarre = Object.assign(manoDeMuneca(R, MUN_R, DIR_R), { d: AGARRA, puno: 1 });
    preAgarre.x += 12; preAgarre.y -= 4;
    const cargada = t2 => { const pg = poseGBase(Math.min(t2, T.toc - 0.02)), f = G.aPantalla(pg, G.cabeza(pg).a(FRENTE_G)); return { x: f.x + 30, y: f.y - 2, mu: 0.25, d: CARGA }; };
    const toc = t2 => { const pg = poseGBase(Math.min(t2, T.toc - 0.02)), f = G.aPantalla(pg, G.cabeza(pg).a(FRENTE_G)); return { x: f.x + 24, y: f.y + 2, mu: 0.2, d: SUELTA }; };
    // soplarse el dedo: el índice delante de la boca
    const sopla = t2 => { const b = bocaPant(R, p); return { x: b.x - 16, y: b.y + 30, mu: 1.75, d: SOPLA }; };
    const PL = [
      [0, 0, mesa],
      [T.rReta - 0.25, T.rReta, arriba],
      [T.rReta, T.rReta + 0.05, menea],
      [T.acerca, T.clac - 0.02, preAgarre],
      [T.clac - 0.02, T.clac, enAgarre, entrada],
      // suelta (de golpe) y carga el dedo delante de la frente de Guillermo
      [T.suelta, T.suelta + 0.14, { x: 548, y: 286, mu: 0.45, d: CARGA }, salida],
      [T.carga, T.cargado, cargada],
      [T.toc - 0.04, T.toc, toc, entrada],
      [T.toc + 0.12, T.sopla - 0.05, { x: 560, y: 286, mu: 1.2, d: SOPLA }],
      [T.sopla - 0.05, T.sopla + 0.25, sopla],
      [T.soplaFin, T.soplaFin + 0.35, mesa]
    ];
    let l = pista(PL, t);
    if (t >= T.clac && t < T.suelta) l = Object.assign({}, enAgarre);
    // el dibujo del agarre en el plano general va en el «objeto» de esta mano (en pantalla, bajo los brazos de Guillermo)
    const obj = agarrados(t) ? (g => conCamara(g, () => agarreMini(g, t))) : null;
    p.manoLejos = manoRig(R, p, l, 1, obj);
    p.manoCerca = R.manoReposo(p, "cerca");
  }
  // postura de Guillermo sin manos (para apuntar a su frente sin recursión)
  function poseGBase(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t), respira = Math.sin(t * 2.4);
    const p = { x: XG, suelo: SUELO, s: S, pelvis: { x: G.PELVIS.x + b.dx / S, y: G.PELVIS.y + PEL_G + b.dy / S + respira * 1.3 }, torso: b.torso,
      torsoEsc: { x: 1, y: 1 + respira * 0.005 }, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    const sil = dentro(t, T.silba, T.silba + 0.2, T.gBizco - 0.1, T.gBizco);
    p.cabeza.ang += 0.05 * Math.sin((t - T.silba) * 6.5) * sil;
    const u = t - T.toc; if (u > 0) { const r = Math.exp(-u * 7) * Math.sin(u * 26); p.cabeza.ang -= 0.1 * r; }
    return p;
  }

  /* ---------- el agarre en pequeño (plano general) ---------- */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  function agarreMini(g, t) {
    const st = estado(Math.min(t, T.zoomOut1));
    // tensión: tiembla un poco mientras se miran
    const tiembla = dentro(t, T.duelo, T.duelo + 0.1, T.zoomIn0, T.zoomIn0 + 0.1);
    g.save(); g.translate(AG.x + 0.6 * Math.sin(t * 40) * tiembla, AG.y); g.scale(SA, SA);
    agarre(g, st, 9, false, t);
    g.restore();
  }

  /* =====================================================================================
   * ATREZO DEL PLANO GENERAL
   * ===================================================================================== */
  // caña con espuma sobre su posavasos
  function cana(g, x, y, t, i) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#e9dcc0"; g.beginPath(); g.ellipse(x, y + 1, 15, 4, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#b5402e"; g.beginPath(); g.ellipse(x, y + 0.5, 11, 2.6, 0, 0, Math.PI * 2); g.fill();
    const h = 36, wb = 8, wt = 11;
    const forma = () => { g.beginPath(); g.moveTo(x - wt, y - h); g.lineTo(x - wb, y - 1); g.quadraticCurveTo(x, y + 2, x + wb, y - 1); g.lineTo(x + wt, y - h); g.closePath(); };
    forma(); g.fillStyle = "#e09a2a"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "#f2b445"; g.fillRect(x - wt, y - h, wt * 0.9, h);
    for (let k = 0; k < 4; k++) { const ph = ((t * 0.5 + hash(k + i * 7)) % 1), by = y - 4 - ph * (h - 12); g.fillStyle = "rgba(255,240,200,0.7)"; g.beginPath(); g.arc(x - 4 + 8 * hash(k + i), by, 1, 0, Math.PI * 2); g.fill(); }
    g.restore();
    // espuma
    g.fillStyle = "#fff8ec"; g.beginPath(); g.ellipse(x, y - h, wt + 1, 4, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x - 5, y - h - 3, 4.5, 0, Math.PI * 2); g.arc(x + 3, y - h - 4, 5, 0, Math.PI * 2); g.arc(x + 9, y - h - 1, 3.5, 0, Math.PI * 2); g.fill();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - wt + 3, y - h + 6); g.lineTo(x - wb + 2.5, y - 6); g.stroke();
    g.restore();
  }
  // vela en un tarro rojo (con su llama)
  function vela(g, x, y, t) {
    g.save();
    const fl = 1 + 0.12 * Math.sin(t * 13) + 0.06 * Math.sin(t * 29);
    const gh = g.createRadialGradient(x, y - 18, 2, x, y - 18, 70 * fl); gh.addColorStop(0, "rgba(255,200,110,0.35)"); gh.addColorStop(1, "rgba(255,200,110,0)");
    g.fillStyle = gh; g.fillRect(x - 80, y - 100, 160, 160);
    g.fillStyle = "rgba(150,26,30,0.9)"; g.beginPath(); g.moveTo(x - 9, y - 18); g.lineTo(x - 8, y); g.lineTo(x + 8, y); g.lineTo(x + 9, y - 18); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,170,120,0.55)"; g.fillRect(x - 6, y - 15, 3, 13);
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#fff1c0"; g.beginPath(); g.moveTo(x, y - 30 * fl); g.quadraticCurveTo(x + 4, y - 22, x, y - 18); g.quadraticCurveTo(x - 4, y - 22, x, y - 30 * fl); g.fill();
    g.restore();
  }
  // silla de café de madera curvada; dir = hacia dónde mira quien se sienta
  function silla(g, x, dir) {
    const ys = Y_ASIENTO, atras = x - dir * 40, delante = x + dir * 40;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(10,6,4,0.35)"; g.beginPath(); g.ellipse(x, SUELO + 2, 54, 6, 0, 0, Math.PI * 2); g.fill();
    const mad = "#5a3018", madO = "#331a0c";
    const palo = (pts, w, c) => { g.strokeStyle = TINTA; g.lineWidth = w + 3; g.beginPath(); M2.curva(g, pts, false, 0.5); g.stroke(); g.strokeStyle = c; g.lineWidth = w; g.stroke(); };
    palo([{ x: atras + dir * 8, y: ys + 6 }, { x: atras + dir * 4, y: SUELO - 30 }, { x: atras - dir * 4, y: SUELO - 2 }], 4.5, madO);
    palo([{ x: delante - dir * 8, y: ys + 6 }, { x: delante - dir * 4, y: SUELO - 30 }, { x: delante + dir * 2, y: SUELO - 2 }], 4.5, madO);
    // aro bajo
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.ellipse(x, ys + 72, 36, 6, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = mad; g.lineWidth = 3; g.stroke();
    palo([{ x: atras, y: ys + 6 }, { x: atras - dir * 3, y: SUELO - 40 }, { x: atras - dir * 8, y: SUELO - 2 }], 5.5, mad);
    palo([{ x: delante, y: ys + 6 }, { x: delante + dir * 3, y: SUELO - 40 }, { x: delante + dir * 8, y: SUELO - 2 }], 5.5, mad);
    // respaldo curvado (un aro de madera doblada)
    const top = ys - 104;
    palo([{ x: atras + dir * 4, y: ys + 2 }, { x: atras - dir * 6, y: ys - 50 }, { x: atras - dir * 2, y: top + 10 }, { x: atras + dir * 16, y: top }, { x: atras + dir * 26, y: top + 18 }, { x: atras + dir * 20, y: ys - 40 }, { x: atras + dir * 14, y: ys + 2 }], 5.5, mad);
    palo([{ x: atras + dir * 4, y: top + 34 }, { x: atras + dir * 14, y: top + 40 }, { x: atras + dir * 22, y: top + 36 }], 3.5, mad);
    // asiento de rejilla
    g.fillStyle = "#c79a5a"; g.beginPath(); g.ellipse(x, ys + 3, 46, 8, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(90,50,20,0.5)"; g.lineWidth = 1; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(x + i * 10 - 4, ys - 3); g.lineTo(x + i * 10 + 4, ys + 9); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(x, ys + 3, 46, 8, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = mad; g.beginPath(); g.ellipse(x, ys + 9, 46, 4, 0, 0, Math.PI); g.fill(); g.stroke();
    g.restore();
  }
  // mesa redonda de madera: tablero (antes de los personajes)…
  function mesaAtras(g) {
    const { x, y, rx, ry } = MESA;
    g.save(); g.lineJoin = "round";
    const gt = g.createLinearGradient(0, y - ry, 0, y + ry); gt.addColorStop(0, "#7a4624"); gt.addColorStop(1, "#5a3017");
    g.fillStyle = gt; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
    g.strokeStyle = "rgba(40,16,4,0.35)"; g.lineWidth = 1.2;
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(x - rx, y + i * 4 + 2 * Math.sin(i)); g.bezierCurveTo(x - 40, y + i * 4 - 3, x + 40, y + i * 4 + 3, x + rx, y + i * 4); g.stroke(); }
    g.strokeStyle = "rgba(255,220,170,0.18)"; g.lineWidth = 3; g.beginPath(); g.ellipse(x - 10, y - 4, rx - 24, ry - 10, 0, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // …y el canto de delante y el pie (encima de las piernas)
  function mesaDelante(g) {
    const { x, y, rx, ry, canto } = MESA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x, SUELO + 2, 70, 7, 0, 0, Math.PI * 2); g.fill();
    // pie de hierro fundido
    g.fillStyle = "#1d1a1c"; g.beginPath(); g.moveTo(x - 7, y + ry); g.lineTo(x - 9, SUELO - 20); g.lineTo(x + 9, SUELO - 20); g.lineTo(x + 7, y + ry); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "#29252a"; g.beginPath(); g.moveTo(x - 62, SUELO - 2); g.quadraticCurveTo(x - 20, SUELO - 22, x, SUELO - 24); g.quadraticCurveTo(x + 20, SUELO - 22, x + 62, SUELO - 2); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.15)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 3, y + ry + 8); g.lineTo(x - 4, SUELO - 26); g.stroke();
    // canto del tablero
    g.beginPath(); g.ellipse(x, y + canto, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.closePath();
    g.fillStyle = "#3f200d"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(255,200,150,0.22)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y + 3, rx - 3, ry - 1, 0, 0.2, Math.PI - 0.2); g.stroke();
    g.restore();
  }
  // lámpara de globo colgando, con su halo
  function lampara(g, t) {
    const a = 0.006 * Math.sin(t * 0.8);
    g.save(); g.translate(512, -80); g.rotate(a); g.translate(-512, 80);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(512, -80); g.lineTo(512, 88); g.stroke();
    g.fillStyle = "#b08a3a"; g.fillRect(505, 84, 14, 10); g.strokeRect(505, 84, 14, 10);
    const gh = g.createRadialGradient(512, 118, 10, 512, 118, 120); gh.addColorStop(0, "rgba(255,225,160,0.4)"); gh.addColorStop(1, "rgba(255,225,160,0)");
    g.fillStyle = gh; g.fillRect(380, 0, 264, 250);
    g.fillStyle = "#fff0c6"; g.beginPath(); g.arc(512, 118, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(503, 108, 8, 6, -0.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(120,90,40,0.7)"; g.lineWidth = 1.5; g.beginPath(); g.arc(512, 118, 26, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  /* ---------- fondo del plano general (se pinta una vez) ---------- */
  const PARED = 470;
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round";
    // pared de arriba: papel ocre con rombos finos
    g.fillStyle = "#7a4a26"; g.fillRect(-80, -70, W + 160, 300);
    g.strokeStyle = "rgba(255,210,150,0.1)"; g.lineWidth = 1.5;
    for (let x = -80; x < W + 80; x += 34) { g.beginPath(); g.moveTo(x, -70); g.lineTo(x + 140, 230); g.moveTo(x + 140, -70); g.lineTo(x, 230); g.stroke(); }
    // zócalo de azulejo verde oscuro
    g.fillStyle = "#1f3a32"; g.fillRect(-80, 230, W + 160, PARED - 230);
    for (let y = 236; y < PARED; y += 22) for (let x = -80 + ((y / 22) % 2) * 20; x < W + 80; x += 40) {
      g.fillStyle = `rgba(${60 + 20 * hash(x * 0.1 + y)},${110 + 20 * hash(y + x)},${92},0.55)`; g.fillRect(x + 1, y + 1, 38, 20);
      g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x + 3, y + 3, 14, 3);
    }
    g.fillStyle = "#2a1408"; g.fillRect(-80, 222, W + 160, 12); g.fillStyle = "rgba(255,200,150,0.18)"; g.fillRect(-80, 222, W + 160, 2);
    // espejo grande con marco dorado (refleja luces del bar, desenfocadas)
    g.save(); g.translate(390, 30);
    g.fillStyle = "#8a6526"; g.beginPath(); g.roundRect(-10, -10, 264, 172, 12); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#c69a42"; g.beginPath(); g.roundRect(-4, -4, 252, 160, 9); g.fill();
    const ge = g.createLinearGradient(0, 0, 244, 152); ge.addColorStop(0, "#3a3d3a"); ge.addColorStop(1, "#22231f");
    g.fillStyle = ge; g.fillRect(4, 4, 236, 144);
    g.save(); g.beginPath(); g.rect(4, 4, 236, 144); g.clip(); g.filter = "blur(4px)";
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,${180 + 50 * hash(i)},${110 + 40 * hash(i + 2)},0.4)`; g.beginPath(); g.arc(14 + hash(i + 5) * 220, 14 + hash(i + 9) * 124, 6 + 10 * hash(i + 3), 0, Math.PI * 2); g.fill(); }
    g.filter = "none";
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 8; g.beginPath(); g.moveTo(30, 150); g.lineTo(120, 0); g.moveTo(70, 150); g.lineTo(160, 0); g.stroke();
    g.restore();
    g.restore();
    // baldas con botellas (sin etiquetas) a la izquierda y a la derecha
    const balda = (x0, y0, n, sem) => {
      g.fillStyle = "#3a1d0c"; g.fillRect(x0 - 6, y0, n * 26 + 12, 7); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x0 - 6, y0, n * 26 + 12, 7);
      for (let i = 0; i < n; i++) {
        const x = x0 + i * 26 + 6, h = 44 + 18 * hash(i + sem), col = ["#2f6b3a", "#6a2a1e", "#c48a2c", "#3b4f7a", "#d7cbb0"][Math.floor(hash(i + sem * 3) * 5)];
        g.fillStyle = col; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 - h * 0.6); g.quadraticCurveTo(x + 2, y0 - h * 0.75, x + 6, y0 - h * 0.78); g.lineTo(x + 6, y0 - h); g.lineTo(x + 12, y0 - h); g.lineTo(x + 12, y0 - h * 0.78); g.quadraticCurveTo(x + 16, y0 - h * 0.75, x + 18, y0 - h * 0.6); g.lineTo(x + 18, y0); g.closePath(); g.fill();
        g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
        g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 2.5, y0 - h * 0.55, 2.5, h * 0.45);
      }
    };
    balda(60, 120, 6, 1); balda(70, 200, 5, 7); balda(760, 120, 6, 13); balda(770, 200, 5, 19);
    // apliques con halo
    const halo = (x, y, r, a) => { const gh = g.createRadialGradient(x, y, 4, x, y, r); gh.addColorStop(0, `rgba(255,205,130,${a})`); gh.addColorStop(1, "rgba(255,205,130,0)"); g.fillStyle = gh; g.fillRect(x - r, y - r, r * 2, r * 2); };
    halo(290, 60, 130, 0.3); halo(730, 60, 130, 0.3);
    for (const x of [290, 730]) { g.fillStyle = "#a07a34"; g.fillRect(x - 5, 60, 10, 20); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x - 5, 60, 10, 20); g.fillStyle = "#f6dca2"; g.beginPath(); g.moveTo(x - 15, 60); g.lineTo(x + 15, 60); g.lineTo(x + 10, 38); g.lineTo(x - 10, 38); g.closePath(); g.fill(); g.stroke(); }
    // suelo de baldosa hidráulica
    const gs = g.createLinearGradient(0, PARED, 0, H + 70); gs.addColorStop(0, "#5b3a26"); gs.addColorStop(1, "#3c2416");
    g.fillStyle = gs; g.fillRect(-80, PARED, W + 160, H + 70 - PARED);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.5;
    for (let y = PARED + 12, i = 0; y < H + 70; y += 16 + i * 3, i++) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    for (let x = -80; x < W + 80; x += 48) { g.beginPath(); g.moveTo(x, PARED); g.lineTo(512 + (x - 512) * 1.6, H + 70); g.stroke(); }
    // viñeta
    const gv = g.createRadialGradient(512, 320, 160, 512, 330, 700); gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = gv; g.fillRect(-80, -70, W + 160, H + 140);
    return c;
  }

  /* =====================================================================================
   * EFECTOS DEL PLANO GENERAL
   * ===================================================================================== */
  function clacMarca(g, t) {
    const k = fase(t, T.clac, T.clac + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,240,200,${0.95 * Math.sin(Math.PI * k)})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.5, r0 = 26 + 8 * k; g.beginPath(); g.moveTo(AG.x + Math.cos(a) * r0, AG.y - 6 + Math.sin(a) * r0); g.lineTo(AG.x + Math.cos(a) * (r0 + 7), AG.y - 6 + Math.sin(a) * (r0 + 7)); g.stroke(); }
    g.restore();
  }
  // chispas de duelo entre las miradas
  function chispasDuelo(g, t, pG, pR) {
    const k = dentro(t, T.duelo + 0.05, T.duelo + 0.2, T.zoomIn0, T.zoomIn0 + 0.15); if (k <= 0.01) return;
    const a = G.aPantalla(pG, G.cabeza(pG).a({ x: 860, y: 560 })), b = R.aPantalla(pR, R.cabeza(pR).a({ x: 860, y: 470 }));
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    g.save(); g.strokeStyle = `rgba(255,230,120,${0.9 * k})`; g.lineWidth = 2.2; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 2; i++) {
      const off = (i - 0.5) * 10 + 3 * Math.sin(t * 30 + i);
      g.beginPath(); g.moveTo(a.x + 22, a.y + off);
      for (let s = 1; s <= 6; s++) { const x = lerp(a.x + 22, b.x - 22, s / 6), y = lerp(a.y, b.y, s / 6) + off + (s % 2 ? -6 : 6) * (0.8 + 0.4 * Math.sin(t * 40 + s)); g.lineTo(x, y); }
      g.stroke();
    }
    g.fillStyle = `rgba(255,250,210,${k})`; g.beginPath(); g.arc(m.x, m.y + 3 * Math.sin(t * 25), 3, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // notitas del silbido (redondas, que suben haciendo eses)
  function notas(g, t, pG) {
    const k = dentro(t, T.silba + 0.1, T.silba + 0.3, T.gBizco - 0.05, T.gBizco + 0.05); if (k <= 0.01) return;
    const b = bocaPant(G, pG);
    const rapido = 1 + tramo(t, T.gOjeaFin, T.gOjeaFin + 0.1);
    for (let i = 0; i < 6; i++) {
      const ph = ((t - T.silba) * 0.9 * rapido + i / 6) % 1; if (t - T.silba < i / 6 / 0.9) continue;
      const x = b.x + 14 + 34 * ph + 6 * Math.sin(ph * 9 + i), y = b.y - 10 - 86 * ph;
      g.save(); g.globalAlpha = k * Math.sin(Math.PI * Math.min(1, ph * 1.4)); g.translate(x, y); g.rotate(-0.2 + 0.25 * Math.sin(ph * 6 + i));
      g.fillStyle = ["#fff2b0", "#ffd0e0", "#c8f0ff"][i % 3]; g.strokeStyle = TINTA; g.lineWidth = 1.3;
      g.beginPath(); g.ellipse(0, 0, 4.2, 3.2, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(3.6, -1); g.lineTo(3.6, -13); g.quadraticCurveTo(7, -10, 9, -12); g.stroke();
      g.restore();
    }
  }
  // el toc: arco de movimiento del dedo, estallido en la frente y estrellitas dando vueltas
  function tocEfectos(g, t, pG) {
    const H = G.cabeza(pG), f = G.aPantalla(pG, H.a(FRENTE_G));
    const k = fase(t, T.toc, T.toc + 0.32);
    if (k > 0 && k < 1) {
      g.save(); g.translate(f.x, f.y); g.lineCap = "round";
      g.fillStyle = `rgba(255,250,215,${0.95 * (1 - k)})`; g.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 + 6 * k : 16 + 14 * k, a = i * Math.PI / 5 + 0.2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.closePath(); g.fill(); g.strokeStyle = `rgba(20,16,20,${0.8 * (1 - k)})`; g.lineWidth = 1.6; g.stroke();
      g.restore();
    }
    // estrellitas alrededor de la cabeza
    const ke = dentro(t, T.toc + 0.1, T.toc + 0.3, T.frota + 0.5, T.frota + 0.9);
    if (ke > 0.01) {
      const c = G.aPantalla(pG, H.a({ x: 760, y: 360 }));
      for (let i = 0; i < 4; i++) {
        const a = (t - T.toc) * 5 + i * Math.PI / 2, x = c.x + Math.cos(a) * 46, y = c.y + Math.sin(a) * 12;
        g.save(); g.globalAlpha = ke; g.translate(x, y); g.rotate(a * 0.5); g.fillStyle = "#ffe25a"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
        g.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 2.6 : 6.5, b = j * Math.PI / 5; g.lineTo(Math.cos(b) * r, Math.sin(b) * r); } g.closePath(); g.fill(); g.stroke();
        g.restore();
      }
    }
  }
  // rayas del dedo al soltarse
  function rayasToc(g, t, pR) {
    const k = fase(t, T.toc - 0.04, T.toc + 0.12); if (k <= 0 || k >= 1) return;
    const m = R.aPantalla(pR, pR.manoLejos);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * Math.sin(Math.PI * k)})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(m.x - 4, m.y - 2, 14 + i * 5, Math.PI * 0.75, Math.PI * 1.15); g.stroke(); }
    g.restore();
  }
  // humito del dedo (como un pistolero)
  function humito(g, t, pR) {
    const k = dentro(t, T.sopla + 0.15, T.sopla + 0.3, T.soplaFin - 0.1, T.soplaFin + 0.2); if (k <= 0.01) return;
    const m = R.aPantalla(pR, pR.manoLejos), punta = { x: m.x + Math.cos(Math.PI - 0.9 + Math.PI) * 0 - 9, y: m.y - 14 };
    for (let i = 0; i < 4; i++) {
      const ph = ((t * 0.8 + i / 4) % 1);
      g.save(); g.globalAlpha = k * 0.55 * (1 - ph); g.fillStyle = "#e8e4e0";
      g.beginPath(); g.arc(punta.x + 5 * Math.sin(ph * 8 + i), punta.y - 22 * ph, 2.5 + 4 * ph, 0, Math.PI * 2); g.fill();
      g.restore();
    }
  }

  /* ---------- cámaras y transiciones ---------- */
  const WIDE = { k: 1.2, x: 506, y: 340 };
  // a esta escala y centro del plano general el agarre se ve igual que en el primer plano (al entrar y al salir)
  const objetivo = t => { const c = camPP(t); return { k: c.k / SA, x: AG.x + SA * c.fx, y: AG.y + SA * c.fy }; };
  function camGeneral(t) {
    let k = WIDE.k, x = WIDE.x, y = WIDE.y;
    // se acerca un pelín en el duelo y en el toc
    const a = tramo(t, T.duelo, T.zoomIn0) * (1 - tramo(t, T.zoomOut1, T.zoomOut1 + 0.9));
    k *= 1 + 0.06 * a; x += -10 * a;
    const b = tramo(t, T.carga - 0.3, T.toc) * (1 - tramo(t, T.camara - 0.4, T.camara + 0.3));
    k *= 1 + 0.04 * b; x += -8 * b;
    // acercamiento al primer plano y vuelta
    const u1 = fase(t, T.zoomIn0, T.zoomIn1), u2 = fase(t, T.zoomOut0, T.zoomOut1);
    const z = t < T.zoomOut0 ? suave(u1) : 1 - suave(u2);
    if (z > 0) {
      const o = objetivo(t < T.zoomOut0 ? T.zoomIn1 : T.zoomOut0), k0 = k;
      k = k0 * Math.pow(o.k / k0, z);
      x = lerp(x, o.x, suave(Math.min(1, z * 1.4))); y = lerp(y, o.y, suave(Math.min(1, z * 1.4)));
    }
    // sacudida del toc
    const u = t - T.toc; if (u > 0 && u < 0.45) { const s = Math.exp(-u * 9) * Math.sin(u * 55); y += 1.8 * s; x += 1.2 * s; }
    return { k, x, y, z };
  }
  // opacidad del primer plano
  function alfaPP(t) {
    if (t < T.zoomOut0) return tramo(t, lerp(T.zoomIn0, T.zoomIn1, 0.45), lerp(T.zoomIn0, T.zoomIn1, 0.85));
    return 1 - tramo(t, lerp(T.zoomOut0, T.zoomOut1, 0.15), lerp(T.zoomOut0, T.zoomOut1, 0.55));
  }
  function camPrimerPlano(t, cg) {
    // en las transiciones, el primer plano copia la escala del plano general (el agarre encaja)
    if (t > T.zoomIn1 && t < T.zoomOut0) return camPP(t);
    return { k: cg.k * SA, fx: (cg.x - AG.x) / SA, fy: (cg.y - AG.y) / SA };
  }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  let lienzoPP = null;
  class LaGuerra extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !R.listo()) return;
      if (!fondo) fondo = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const a = alfaPP(t), cg = camGeneral(t);
      if (a < 0.999) this.general(g, t, cg);
      if (a > 0.001) {
        const cp = camPrimerPlano(t, cg);
        if (a >= 0.999) pintaPrimerPlano(g, t, cp);
        else {
          if (!lienzoPP) { lienzoPP = document.createElement("canvas"); lienzoPP.width = W; lienzoPP.height = H; }
          const l = lienzoPP.getContext("2d"); l.setTransform(1, 0, 0, 1, 0, 0); l.clearRect(0, 0, W, H);
          pintaPrimerPlano(l, t, cp);
          g.save(); g.globalAlpha = a; g.drawImage(lienzoPP, 0, 0); g.restore();
        }
      }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
    general(g, t, cam) {
      const pG = poseG(t), pR = poseR(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      lampara(g, t);
      silla(g, XG - 8, 1); silla(g, XR + 8, -1);
      mesaAtras(g);
      vela(g, 520, 364, t);
      cana(g, 452, 382, t, 0); cana(g, 576, 380, t, 1);
      // mientras Rodri le da el toc, su brazo va por encima de la cabeza de Guillermo
      if (t >= T.suelta && t < T.sopla) { dibujaG(g, pG, t); R.dibujar(g, pR, t); }
      else { R.dibujar(g, pR, t); dibujaG(g, pG, t); }
      mesaDelante(g);
      clacMarca(g, t);
      chispasDuelo(g, t, pG, pR);
      notas(g, t, pG);
      rayasToc(g, t, pR);
      tocEfectos(g, t, pG);
      humito(g, t, pR);
      g.restore();
    }
  }

  registrar({ id: "00111", nombre: "Guillermo y Rodri · La guerra de pulgares", crear: () => new LaGuerra() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["r", R, poseR(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00111 = { pose: t => ({ g: poseG(t), r: poseR(t) }), poseG, poseR, T, DUR, diag, estado };
})();
